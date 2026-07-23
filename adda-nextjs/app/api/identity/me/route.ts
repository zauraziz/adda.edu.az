/**
 * F2.6e-2 — GET /api/identity/me
 * Island-lar bunu çağırır. Yalnız e-poçt və ad qaytarılır — sessiya tokeni yox.
 *
 * Səhifələr ISR ilə statik render olunur, ona görə kimlik SERVER-də oxuna bilməz
 * (dinamik render-ə məcbur edərdi). Hidrasiyadan sonra client fetch düzgün yoldur.
 */
import { NextRequest, NextResponse } from 'next/server';
import { IDENTITY_COOKIE, unpackSession } from '@/lib/identity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = unpackSession(req.cookies.get(IDENTITY_COOKIE)?.value);
  const res = session
    ? NextResponse.json({ ok: true, email: session.e, name: session.n })
    : NextResponse.json({ ok: false });
  res.headers.set('Cache-Control', 'no-store, private');
  return res;
}
