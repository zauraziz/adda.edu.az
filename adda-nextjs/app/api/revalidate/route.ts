/**
 * F5.56 — POST /api/revalidate: Strapi məzmun dəyişəndə çağırır
 * (adda-strapi/src/utils/site-revalidate.ts). Bütün Strapi keşi (`STRAPI_TAG`)
 * və səhifələr təzələnir; növbəti ziyarət yeni məzmunu göstərir. Səhifələr
 * özləri Strapi-ni gündə bir dəfə yeniləyir (Neon kvotası), dəyişiklik isə bu
 * çağırışla dərhal çıxır.
 *
 * Sirr: başlıq `x-revalidate-secret` = env `REVALIDATE_SECRET` (yoxdursa
 * `ADMIN_IMPORT_SECRET`). Render (Strapi) və Vercel-də EYNİ dəyər olmalıdır.
 * Sirr yoxdursa 503, səhvdirsə 401 — Strapi logunda görünür.
 */
import { timingSafeEqual } from 'node:crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import { STRAPI_TAG } from '@/lib/strapi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

function expectedSecret(): string {
  return (process.env.REVALIDATE_SECRET || process.env.ADMIN_IMPORT_SECRET || '').trim();
}

function matches(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  const expected = expectedSecret();
  if (!expected) {
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503, headers: NO_STORE });
  }
  const given = (req.headers.get('x-revalidate-secret') || '').trim();
  if (!given || !matches(given, expected)) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 401, headers: NO_STORE });
  }
  revalidateTag(STRAPI_TAG);
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
