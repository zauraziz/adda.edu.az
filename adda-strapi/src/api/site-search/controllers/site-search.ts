/**
 * F2/K25 — sayt axtarışı (Meilisearch əvəzinə); F5.58 — bütün məzmun, yaddaşda
 * indeks, sözlərə bölünmüş və diakritiksiz uyğunlaşma (bax src/utils/search-index.ts).
 *
 * GET /api/site-search?q=&locale=az|ru|en&limit=1..50&type=person,page
 * Cavab: { hits: [{documentId, title, slug, url, excerpt, contentType, category, lang?}],
 *          total, counts: {növ: say}, query, locale }
 * `url` — saytda yol (dilsiz, «/emekdas/…») və ya faylın tam ünvanı; `lang: 'az'`
 * — ru/en-də nəticə az olduğu üçün əlavə olunmuş az məzmunu.
 *
 * Standalone kompilyasiya olunur — @strapi/strapi tipləri yalnız type importu.
 */
import type { Core } from '@strapi/strapi';
import { LOCALES, siteSearch, type Locale } from '../../../utils/search-index';

interface Ctx {
  query: Record<string, string | string[] | undefined>;
  body: unknown;
  status: number;
  set(field: string, value: string): void;
}

const one = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] ?? '' : v ?? '');

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async search(ctx: Ctx) {
    const q = one(ctx.query.q).trim().slice(0, 120);
    const raw = one(ctx.query.locale);
    const locale: Locale = (LOCALES as string[]).includes(raw) ? (raw as Locale) : 'az';
    const limit = Math.min(50, Math.max(1, parseInt(one(ctx.query.limit) || '8', 10) || 8));
    const types = one(ctx.query.type)
      .split(',')
      .map((s) => s.trim())
      .filter((s) => /^[a-z-]{2,20}$/.test(s));

    ctx.set('Cache-Control', 'public, max-age=30');
    try {
      ctx.body = await siteSearch(strapi, q, locale, limit, types);
    } catch (err) {
      strapi.log.error('[axtaris] F5.58: ' + (err as Error).message);
      ctx.status = 500;
      ctx.body = { hits: [], total: 0, counts: {}, query: q, locale, error: 'search failed' };
    }
  },
});
