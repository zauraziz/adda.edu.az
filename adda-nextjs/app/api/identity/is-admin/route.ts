/**
 * F4.9b — GET /api/identity/is-admin
 * Sessiya e-poçtunu SERVER-ONLY `ADMIN_EMAILS`-la tutuşdurur (azLower ilə,
 * bax lib/identity.ts). Səhifələr `revalidate=300` ilə statik qalır — kimlik
 * yoxlaması burada, klient adasından çağırılır (bax _components/AdminGate.tsx),
 * serverdə cookie oxumaq bütün ziyarətçilər üçün keşi öldürərdi.
 */
import { NextRequest, NextResponse } from 'next/server';
import { IDENTITY_COOKIE, isAdminEmail, unpackSession } from '@/lib/identity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = unpackSession(req.cookies.get(IDENTITY_COOKIE)?.value);
  const res = NextResponse.json({ isAdmin: isAdminEmail(session?.e) });
  res.headers.set('Cache-Control', 'no-store, private');
  return res;
}
