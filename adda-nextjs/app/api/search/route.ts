import { NextRequest, NextResponse } from 'next/server';
import { STRAPI_URL } from '@/lib/strapi';

/**
 * K25 — axtarış proxy-si. ARTIQ MEILISEARCH DEYİL.
 *
 * Meilisearch-in pulsuz sınaq müddəti bitdi və instans söndü — bütün axtarış
 * sıradan çıxdı. Yeni mənbə: Strapi-nin `/api/site-search` endpoint-i, o da
 * birbaşa Neon Postgres-i sorğulayır.
 *
 * NİYƏ BU SEÇİLDİ: məzmun onsuz da bazadadır. Ayrıca indeks olmayanda
 * sinxronizasiya, yenidən indeksləmə və sönə biləcək xidmət də yoxdur —
 * bu dövrdə vaxtımızı yeyən problem sinfinin hamısı aradan qalxır.
 *
 * Cavab forması DƏYİŞMİR (`{hits: [...]}`) — frontend toxunulmur.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LOCALES = ['az', 'ru', 'en'];

interface Hit {
  documentId?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  contentType?: string;
  category?: string;
}

/** `?debug=1` — səbəbi göstərir. Səssiz `{hits: []}` bir daha təkrarlanmasın. */
async function diagnose(q: string, locale: string) {
  const out: Record<string, unknown> = { strapiUrl: STRAPI_URL, query: q, locale };
  const url = `${STRAPI_URL}/api/site-search?q=${encodeURIComponent(q)}&locale=${locale}&limit=5`;
  out.probeUrl = url;
  try {
    const r = await fetch(url, { cache: 'no-store' });
    out.status = r.status;
    const text = await r.text();
    if (r.ok) {
      const d = JSON.parse(text) as { hits?: Hit[]; total?: number };
      out.hits = d.hits?.length ?? 0;
      out.total = d.total ?? null;
      out.sample = (d.hits ?? []).slice(0, 3).map((h) => `${h.contentType}: ${h.title}`);
      out.verdict = (d.total ?? 0) > 0 ? 'Isleyir.' : 'Endpoint isleyir, amma bu sorgu ucun netice yoxdur.';
    } else {
      out.body = text.slice(0, 300);
      out.verdict =
        r.status === 404
          ? '/api/site-search tapilmadi — Strapi deploy olunubmu? (K25 Render-de yenidenqurma teleb edir)'
          : r.status === 403
            ? 'Endpoint baglidir (403).'
            : `Strapi ${r.status} qaytardi.`;
    }
  } catch (e) {
    out.error = String((e as Error).message).slice(0, 200);
    out.verdict = 'Strapi elcatmazdir. Render yatmis ola biler — 50 saniye gozleyib tekrar yoxla.';
  }
  return out;
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') || '').trim();
  const localeRaw = req.nextUrl.searchParams.get('locale') || 'az';
  const locale = LOCALES.includes(localeRaw) ? localeRaw : 'az';

  if (req.nextUrl.searchParams.get('debug') === '1') {
    const res = NextResponse.json(await diagnose(q || 'adda', locale));
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }

  if (!q) return NextResponse.json({ hits: [] });

  try {
    const r = await fetch(
      `${STRAPI_URL}/api/site-search?q=${encodeURIComponent(q)}&locale=${locale}&limit=8`,
      { next: { revalidate: 30 } },
    );
    if (!r.ok) {
      // Səssiz sınma OLMASIN: səbəb heç olmasa server logunda qalsın.
      console.error('[search] Strapi ' + r.status + ': ' + (await r.text()).slice(0, 200));
      return NextResponse.json({ hits: [] });
    }
    const data = (await r.json()) as { hits?: Hit[] };
    return NextResponse.json({ hits: data.hits || [] });
  } catch (err) {
    console.error('[search] elcatmaz: ' + (err as Error).message);
    return NextResponse.json({ hits: [] });
  }
}
