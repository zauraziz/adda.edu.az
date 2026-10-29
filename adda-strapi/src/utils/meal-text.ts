/**
 * F5.60 — «gündə iki dəfə yemək» və «pulsuz yemək» ifadələri saytdan çıxır (Zaur müəllim,
 * 29.10.2026). Məzmun və səbəb: meal-text-content.ts.
 *
 * applyMealTextV1 — BİR DƏFƏ (`mealText:v1`), birbaşa bazada (poliklinika-fix.ts qaydası):
 *   - səhifələr: başlıq, giriş, mətn, SEO, əlaqə, addım başlığı və komponentlər (suallar,
 *     addımlar, faktlar) — hər dil, qaralama VƏ dərc olunmuş sətir;
 *   - «Təqaüd və sosial dəstək»in «Yemək — Gündə 2 dəfə» faktı silinir (az, ru, en);
 *   - xəbər və elanlar: başlıq, qısa mətn, xülasə, mətn.
 * Yalnız dəqiq mətnlər əvəz olunur, redaktə tarixi saxlanılır (`updateMany` + köhnə
 * `updatedAt`). Qalıq (MEAL_RE) logda — admində əl ilə. Bazaya birbaşa yazıldığı üçün
 * sonda sayt yenilənir və axtarış indeksi köhnəlir.
 */
import type { Core } from '@strapi/strapi';
import { MEAL_RE, NEWS_PAIRS, PAGE_FACT_DROP, PAGE_PAIRS, type TextPair } from './meal-text-content';
import { markSearchDirty } from './search-index';
import { requestSiteRevalidate } from './site-revalidate';

type Row = Record<string, unknown>;
interface Q {
  findMany: (a: Row) => Promise<Row[]>;
  updateMany: (a: Row) => Promise<unknown>;
  update: (a: Row) => Promise<unknown>;
  delete: (a: Row) => Promise<unknown>;
}

export const MEAL_MARKER = 'mealText:v1';
const TAG = '[yemek] F5.60';
const q = (strapi: Core.Strapi, uid: string): Q => strapi.db.query(uid as never) as unknown as Q;

/** Saf funksiya, idempotent: bütün dəqiq cütlər əvəz olunur. */
export function fixMealText(text: string, pairs: TextPair[]): string {
  if (!text) return text;
  let out = text;
  for (const p of pairs) if (out.includes(p.find)) out = out.split(p.find).join(p.replace);
  return out;
}

export const hasMeal = (t: string): boolean => MEAL_RE.test(t);

const isDropFact = (f: Row): boolean =>
  PAGE_FACT_DROP.some((d) => String(f.label ?? '').trim() === d.label && String(f.value ?? '').trim() === d.value);

interface TableJob {
  uid: string;
  top: string[];
  comps: Record<string, { uid: string; keys: string[] }>;
  pairs: TextPair[];
  /** Silinən faktlar (yalnız səhifə). */
  dropFacts?: boolean;
}

interface Counts {
  rows: number;
  facts: number;
  touched: Set<string>;
  left: Set<string>;
}

async function fixTable(strapi: Core.Strapi, job: TableJob, c: Counts): Promise<void> {
  const repo = q(strapi, job.uid);
  for (let offset = 0; ; offset += 50) {
    const rows = await repo.findMany({
      select: ['id', 'slug', 'locale', 'updatedAt', ...job.top],
      populate: Object.fromEntries(Object.keys(job.comps).map((k) => [k, true])),
      orderBy: { id: 'asc' },
      limit: 50,
      offset,
    });
    if (!rows.length) break;
    for (const r of rows) {
      const key = `${String(r.slug)} (${String(r.locale ?? 'az')})`;
      let changed = false;
      const data: Row = {};
      for (const f of job.top) {
        const v = typeof r[f] === 'string' ? (r[f] as string) : '';
        const nv = fixMealText(v, job.pairs);
        if (nv !== v) data[f] = nv;
        if (hasMeal(nv)) c.left.add(key);
      }
      if (Object.keys(data).length) {
        await repo.updateMany({ where: { id: r.id }, data: { ...data, updatedAt: r.updatedAt } });
        changed = true;
      }
      for (const [field, comp] of Object.entries(job.comps)) {
        const items = Array.isArray(r[field]) ? (r[field] as Row[]) : [];
        const dropping = job.dropFacts && field === 'facts' ? items.filter(isDropFact) : [];
        for (const it of items) {
          if (dropping.includes(it)) continue;
          const d: Row = {};
          for (const k of comp.keys) {
            const v = typeof it[k] === 'string' ? (it[k] as string) : '';
            const nv = fixMealText(v, job.pairs);
            if (nv !== v) d[k] = nv;
            if (hasMeal(nv)) c.left.add(key);
          }
          if (Object.keys(d).length && it.id !== undefined) {
            await q(strapi, comp.uid).updateMany({ where: { id: it.id }, data: d });
            changed = true;
          }
        }
        if (dropping.length) {
          // Strapi-nin öz qaydası (document-service/components.js): qalan komponentlər
          // `__pivot` ilə yenidən bağlanır, silinən komponentin sətri silinir.
          const keep = items
            .filter((it) => !dropping.includes(it))
            .map((it) => ({ id: it.id, __pivot: { field, component_type: comp.uid } }));
          await repo.update({ where: { id: r.id }, data: { [field]: keep } });
          for (const it of dropping) await q(strapi, comp.uid).delete({ where: { id: it.id } });
          // db.query().update() redaktə tarixini indiki vaxta qoyur — köhnəsi qaytarılır.
          await repo.updateMany({ where: { id: r.id }, data: { updatedAt: r.updatedAt } });
          c.facts += dropping.length;
          changed = true;
        }
      }
      if (changed) {
        c.rows++;
        c.touched.add(key);
      }
    }
  }
}

const PAGE_JOB: TableJob = {
  uid: 'api::page.page',
  top: ['title', 'lead', 'body', 'seoDescription', 'stepsTitle', 'contact'],
  comps: {
    faq: { uid: 'unit.faq', keys: ['question', 'answer'] },
    steps: { uid: 'page.step', keys: ['title', 'period', 'who', 'body', 'linkLabel'] },
    facts: { uid: 'page.fact', keys: ['label', 'value'] },
  },
  pairs: PAGE_PAIRS,
  dropFacts: true,
};
const NEWS_JOBS: TableJob[] = [
  { uid: 'api::article.article', top: ['title', 'excerpt', 'tldr', 'body'], comps: {}, pairs: NEWS_PAIRS },
  { uid: 'api::announcement.announcement', top: ['title', 'excerpt', 'body'], comps: {}, pairs: NEWS_PAIRS },
];

export async function applyMealTextV1(strapi: Core.Strapi): Promise<number> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: MEAL_MARKER })) === true) return 0;
  const pages: Counts = { rows: 0, facts: 0, touched: new Set(), left: new Set() };
  const news: Counts = { rows: 0, facts: 0, touched: new Set(), left: new Set() };
  await fixTable(strapi, PAGE_JOB, pages);
  for (const job of NEWS_JOBS) await fixTable(strapi, job, news);
  await store.set({ key: MEAL_MARKER, value: true });

  const list = (s: Set<string>) => [...s].slice(0, 40).join(', ') + (s.size > 40 ? ' …' : '');
  strapi.log.info(
    `${TAG}: «gündə iki dəfə yemək», «pulsuz yemək» — səhifə sətri ${pages.rows} (silinən fakt ${pages.facts}), ` +
      `xəbər/elan sətri ${news.rows}` +
      (pages.touched.size ? `; səhifələr: ${list(pages.touched)}` : '') +
      (news.touched.size ? `; xəbər/elan: ${list(news.touched)}` : '') +
      '.',
  );
  const left = new Set([...pages.left, ...news.left]);
  if (left.size) strapi.log.warn(`${TAG}: hələ yemək ifadəsi qalır — admində əl ilə düzəldin: ${list(left)}.`);
  const total = pages.rows + news.rows;
  if (total) {
    markSearchDirty();
    requestSiteRevalidate(strapi, 'yemek');
  }
  return total;
}
