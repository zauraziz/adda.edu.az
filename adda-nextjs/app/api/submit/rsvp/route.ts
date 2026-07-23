/**
 * F2.6e-2 — POST /api/submit/rsvp
 * Kimlik-qapılı RSVP. Island artıq birbaşa Strapi-yə POST ETMİR: sessiya
 * httpOnly cookie-dədir, ona görə yazı mütləq serverdən keçməlidir.
 *
 * Ad və e-poçt QƏSDƏN ötürülmür — Strapi onları təsdiqlənmiş kimlikdən götürür.
 */
import { NextRequest, NextResponse } from 'next/server';
import { IDENTITY_COOKIE, cookieOptions, sameOrigin, strapiPost, unpackSession } from '@/lib/identity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ ok: false, error: 'bad_origin' }, { status: 403 });
  }

  const session = unpackSession(req.cookies.get(IDENTITY_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ ok: false, error: 'identity_required' }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  const payload = {
    eventSlug: typeof body.eventSlug === 'string' ? body.eventSlug : '',
    eventTitle: typeof body.eventTitle === 'string' ? body.eventTitle : '',
    status: typeof body.status === 'string' ? body.status : 'going',
    guests: typeof body.guests === 'number' ? body.guests : 0,
    note: typeof body.note === 'string' ? body.note : '',
  };

  const r = await strapiPost('/api/identity/submit/rsvp', payload, { req, session: session.s });

  if (r.status === 401) {
    // Sessiya Strapi tərəfdə geri çağırılıb / vaxtı keçib — köhnə cookie-ni sil.
    const res = NextResponse.json({ ok: false, error: 'identity_required' }, { status: 401 });
    res.cookies.set(IDENTITY_COOKIE, '', cookieOptions(0));
    return res;
  }
  if (r.status === 429) {
    const retryAfter = typeof r.data.retryAfter === 'number' ? r.data.retryAfter : 3600;
    return NextResponse.json({ ok: false, error: 'rate_limited', retryAfter }, { status: 429 });
  }
  if (!r.ok) {
    const error = typeof r.data.error === 'string' ? r.data.error : 'write_failed';
    return NextResponse.json({ ok: false, error }, { status: r.status === 400 ? 400 : 502 });
  }

  return NextResponse.json({ ok: true });
}
