/**
 * F5.56 — GET /api/reactions?type=article&slug=… — reaksiya sayğaclarının keşli
 * ötürücüsü (Neon kvotası). Əvvəl hər xəbər, elan, tədbir açılışında brauzer
 * birbaşa Strapi-yə gedirdi: hər ziyarət Render-i və Neon-u oyadırdı. İndi cavab
 * Next keşində 1 gün (məzmun dərc olunanda təzələnir, `STRAPI_TAG`), Vercel
 * CDN-də 1 saat saxlanılır. Ziyarətçinin öz reaksiyası brauzerində qeyd olunur
 * (ReactionBar) və sayğacda dərhal görünür. Reaksiya vermək (POST) əvvəlki kimi
 * birbaşa Strapi-yə.
 *
 * Cavab: `{ sessions: { anchor: [sessionId…], ship, compass, wave } }` —
 * əvvəlki ictimai Strapi cavabındakı eyni məlumat (sessiya kodları anonimdir).
 */
import { NextResponse, type NextRequest } from 'next/server';
import { CACHE_DAY, STRAPI_TAG, STRAPI_URL } from '@/lib/strapi';

export const runtime = 'nodejs';

const TYPES = ['article', 'announcement', 'event', 'milestone'];
const EMOJIS = ['anchor', 'ship', 'compass', 'wave'];
/** Strapi-dəki qayda ilə eyni (api/reaction/content-types/reaction/lifecycles.ts). */
const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,198}[a-z0-9])?$/;

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type') || '';
  const slug = (req.nextUrl.searchParams.get('slug') || '').trim().toLowerCase();
  if (!TYPES.includes(type) || !SLUG_RE.test(slug)) {
    return NextResponse.json({ sessions: null }, { status: 400 });
  }
  const url = new URL('/api/reactions', STRAPI_URL);
  url.searchParams.set('filters[targetType][$eq]', type);
  url.searchParams.set('filters[targetSlug][$eq]', slug);
  url.searchParams.set('fields[0]', 'emoji');
  url.searchParams.set('fields[1]', 'sessionId');
  url.searchParams.set('pagination[pageSize]', '200');
  try {
    const res = await fetch(url.toString(), { next: { revalidate: CACHE_DAY, tags: [STRAPI_TAG] } });
    if (!res.ok) throw new Error(String(res.status));
    const json = (await res.json()) as { data?: { emoji?: string; sessionId?: string }[] };
    const sessions: Record<string, string[]> = Object.fromEntries(EMOJIS.map((e) => [e, [] as string[]]));
    for (const it of json.data ?? []) {
      if (it.emoji && EMOJIS.includes(it.emoji)) sessions[it.emoji].push(String(it.sessionId ?? ''));
    }
    return NextResponse.json(
      { sessions },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
    );
  } catch {
    return NextResponse.json({ sessions: null }, { headers: { 'Cache-Control': 'public, s-maxage=60' } });
  }
}
