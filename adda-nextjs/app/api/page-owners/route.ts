/**
 * F5.39 — GET /api/page-owners — səhifə açarı → məsul redaktor (ad, vəzifə,
 * profil). Strapi-nin ictimai /api/adda-owners/public cavabının keşli
 * ötürücüsü: brauzer Strapi ünvanını bilmir, Vercel CDN 1 saat saxlayır
 * (F5.56, Neon kvotası; əvvəl 5 dəqiqə — hər səhifənin altbilgisi Strapi-ni
 * oyadırdı). Təyinat dəyişəndə Strapi sayta xəbər verir (STRAPI_TAG).
 * E-poçt Strapi tərəfdə qaytarılmır.
 */
import { NextResponse } from 'next/server';
import { RETRY_TTL, STRAPI_TAG, STRAPI_URL } from '@/lib/strapi';

export const revalidate = 3600;

async function load(ttl: number): Promise<{ owners?: Record<string, unknown> }> {
  const res = await fetch(`${STRAPI_URL}/api/adda-owners/public`, { next: { revalidate: ttl, tags: [STRAPI_TAG] } });
  if (!res.ok) throw new Error(String(res.status));
  return (await res.json()) as { owners?: Record<string, unknown> };
}

export async function GET() {
  try {
    const data = await load(3600).catch(() => load(RETRY_TTL)); // xətada keş 60 s (lib/strapi.ts RETRY_TTL)
    return NextResponse.json(
      { owners: data.owners ?? {} },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
    );
  } catch {
    return NextResponse.json({ owners: {} }, { headers: { 'Cache-Control': 'public, s-maxage=60' } });
  }
}
