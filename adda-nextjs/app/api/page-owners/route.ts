/**
 * F5.39 — GET /api/page-owners — səhifə açarı → məsul redaktor (ad, vəzifə,
 * profil). Strapi-nin ictimai /api/adda-owners/public cavabının keşli
 * ötürücüsü: brauzer Strapi ünvanını bilmir, Vercel CDN 1 saat saxlayır
 * (F5.56, Neon kvotası; əvvəl 5 dəqiqə — hər səhifənin altbilgisi Strapi-ni
 * oyadırdı). Təyinat dəyişəndə Strapi sayta xəbər verir (STRAPI_TAG).
 * E-poçt Strapi tərəfdə qaytarılmır.
 */
import { NextResponse } from 'next/server';
import { STRAPI_TAG, STRAPI_URL } from '@/lib/strapi';

export const revalidate = 3600;

export async function GET() {
  try {
    const res = await fetch(`${STRAPI_URL}/api/adda-owners/public`, { next: { revalidate: 3600, tags: [STRAPI_TAG] } });
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as { owners?: Record<string, unknown> };
    return NextResponse.json(
      { owners: data.owners ?? {} },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
    );
  } catch {
    return NextResponse.json({ owners: {} }, { headers: { 'Cache-Control': 'public, s-maxage=60' } });
  }
}
