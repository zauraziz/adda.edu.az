/**
 * F2.6e-2 — POST /api/submit/correction
 * Kimlik-qapılı düzəliş təklifi. `submitterName` / `submitterEmail`
 * QƏSDƏN ötürülmür — Strapi onları təsdiqlənmiş kimlikdən doldurur.
 * `status` da göndərilmir: lifecycle onu məcburi "pending" edir.
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

  const str = (v: unknown, max: number): string => (typeof v === 'string' ? v.slice(0, max) : '');
  const payload = {
    targetType: str(body.targetType, 40),
    targetSlug: str(body.targetSlug, 200),
    fieldPath: str(body.fieldPath, 200),
    currentValue: str(body.currentValue, 5000),
    suggestedValue: str(body.suggestedValue, 5000),
    reason: str(body.reason, 1000),
  };

  if (!payload.suggestedValue.trim()) {
    return NextResponse.json({ ok: false, error: 'empty_suggestion' }, { status: 400 });
  }

  const r = await strapiPost('/api/identity/submit/correction', payload, { req, session: session.s });

  if (r.status === 401) {
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
