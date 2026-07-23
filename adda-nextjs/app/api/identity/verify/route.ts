/**
 * F2.6e-2 — POST /api/identity/verify
 * Magic tokeni Strapi-də istifadə edir və nəticəni httpOnly imzalanmış
 * cookie-yə yazır. Strapi sessiya tokeni brauzer JS-inə qaytarılmır.
 *
 * NİYƏ POST, GET YOX: korporativ poçt skanerləri (məs. Microsoft SafeLinks)
 * hər linki avtomatik GET edir. Tək istifadəlik token belə yanır və istifadəçi
 * girişdən məhrum qalır. POST skanerlər tərəfindən icra olunmur.
 */
import { NextRequest, NextResponse } from 'next/server';
import { IDENTITY_COOKIE, cookieOptions, identityConfigured, packSession, sameOrigin, strapiPost } from '@/lib/identity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ ok: false, error: 'bad_origin' }, { status: 403 });
  }
  if (!identityConfigured()) {
    return NextResponse.json({ ok: false, error: 'identity_unconfigured' }, { status: 503 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  const token = typeof body.token === 'string' ? body.token : '';
  if (!token || token.length < 20 || token.length > 200) {
    return NextResponse.json({ ok: false, error: 'invalid_or_expired' }, { status: 400 });
  }

  const r = await strapiPost('/api/identity/verify', { token }, { req });

  if (r.status === 429) {
    const retryAfter = typeof r.data.retryAfter === 'number' ? r.data.retryAfter : 900;
    return NextResponse.json({ ok: false, error: 'rate_limited', retryAfter }, { status: 429 });
  }
  if (!r.ok || r.data.ok !== true) {
    return NextResponse.json({ ok: false, error: 'invalid_or_expired' }, { status: 400 });
  }

  const session = typeof r.data.session === 'string' ? r.data.session : '';
  const email = typeof r.data.email === 'string' ? r.data.email : '';
  const name = typeof r.data.name === 'string' ? r.data.name : '';
  const expiresAt = typeof r.data.expiresAt === 'string' ? Date.parse(r.data.expiresAt) : NaN;
  if (!session || !email || !Number.isFinite(expiresAt)) {
    return NextResponse.json({ ok: false, error: 'invalid_or_expired' }, { status: 400 });
  }

  const maxAge = Math.max(60, Math.floor((expiresAt - Date.now()) / 1000));
  const res = NextResponse.json({ ok: true, email, name });
  res.cookies.set(IDENTITY_COOKIE, packSession({ s: session, e: email, n: name, x: expiresAt }), cookieOptions(maxAge));
  return res;
}
