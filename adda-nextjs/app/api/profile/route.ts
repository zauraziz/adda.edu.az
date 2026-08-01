/**
 * K26-12 — POST /api/profile  və  POST /api/profile/update
 *
 * Sessiya httpOnly cookie-dədir, brauzer JS-i onu görmür — ona görə yazı
 * mütləq serverdən keçir. Ada birbaşa Strapi-yə müraciət ETMİR.
 *
 * Hansı profilin açılacağını MÜŞTƏRİ SEÇMİR: Strapi tərəfdə sessiya e-poçtu
 * `person.email`/`altEmail` ilə tutuşdurulur. Burada slug ötürülmür.
 */
import { NextRequest, NextResponse } from 'next/server';
import { IDENTITY_COOKIE, cookieOptions, sameOrigin, strapiPost, unpackSession } from '@/lib/identity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function proxy(req: NextRequest, path: string, body: Record<string, unknown>) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ ok: false, error: 'bad_origin' }, { status: 403 });
  }
  const session = unpackSession(req.cookies.get(IDENTITY_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ ok: false, error: 'identity_required' }, { status: 401 });
  }

  const r = await strapiPost(path, body, { req, session: session.s });

  if (r.status === 401) {
    const res = NextResponse.json({ ok: false, error: 'identity_required' }, { status: 401 });
    res.cookies.set(IDENTITY_COOKIE, '', cookieOptions(0));
    return res;
  }
  if (r.status === 403) {
    return NextResponse.json({ ok: false, error: 'not_staff' }, { status: 403 });
  }
  if (r.status === 429) {
    const retryAfter = typeof r.data.retryAfter === 'number' ? r.data.retryAfter : 3600;
    return NextResponse.json({ ok: false, error: 'rate_limited', retryAfter }, { status: 429 });
  }
  if (!r.ok) {
    const error = typeof r.data.error === 'string' ? r.data.error : 'write_failed';
    return NextResponse.json({ ok: false, error }, { status: r.status === 400 ? 400 : 502 });
  }
  return NextResponse.json(r.data, { status: 200 });
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }
  // Tək endpoint, iki əməliyyat: `action` sahəsi ilə ayrılır.
  const update = body.action === 'update';
  const payload = update && body.data && typeof body.data === 'object'
    ? (body.data as Record<string, unknown>)
    : {};
  return proxy(req, update ? '/api/identity/profile/update' : '/api/identity/profile', payload);
}
