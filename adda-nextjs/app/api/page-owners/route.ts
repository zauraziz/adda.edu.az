/**
 * F5.39 — GET /api/page-owners — səhifə açarı → məsul redaktor (ad, vəzifə,
 * profil). Strapi-nin ictimai /api/adda-owners/public cavabının keşli
 * ötürücüsü: brauzer Strapi ünvanını bilmir, Vercel CDN 5 dəqiqə saxlayır.
 * E-poçt Strapi tərəfdə qaytarılmır.
 */
import { NextResponse } from 'next/server';
import { STRAPI_URL } from '@/lib/strapi';

export const revalidate = 300;

export async function GET() {
  try {
    const res = await fetch(`${STRAPI_URL}/api/adda-owners/public`, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as { owners?: Record<string, unknown> };
    return NextResponse.json(
      { owners: data.owners ?? {} },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } },
    );
  } catch {
    return NextResponse.json({ owners: {} }, { headers: { 'Cache-Control': 'public, s-maxage=60' } });
  }
}
