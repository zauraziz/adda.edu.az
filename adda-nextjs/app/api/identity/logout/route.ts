/**
 * F2.6e-2 — POST /api/identity/logout
 * Sessiyanı HƏM Strapi-də geri çağırır (revokedAt), HƏM DƏ cookie-ni silir.
 * Yalnız cookie silinsəydi token hələ etibarlı qalardı.
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
  if (session) {
    await strapiPost('/api/identity/logout', {}, { req, session: session.s });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(IDENTITY_COOKIE, '', cookieOptions(0));
  return res;
}
