/**
 * F5.49 — GIZ EasTnT istinadları SƏHİFƏLƏRDƏN çıxarılır, xəbərlər qalır.
 *
 * Məzmun faylları (elm-, tehsil-, beynelxalq-pages-content.ts) artıq GIZ-siz
 * yazılıb; bu miqrasiya prod-da əvvəlki miqrasiyaların yazdığı mətni eyni
 * qaydada düzəldir. Düzəliş siyahısı: src/utils/giz-clean-data.ts (köhnə və
 * yeni məzmunun fərqi — avtomatik).
 *
 * NECƏ İŞLƏYİR (BİR DƏFƏ, store `adda-admin` → `gizClean:v1`):
 *   - mətn sahəsi (məs. seoDescription) yalnız köhnə dəyərə BƏRABƏRDİRSƏ yenilənir;
 *   - «Mətn»-də yalnız həmin sətir silinir və ya dəyişir (sətir tapılmırsa —
 *     redaktor dəyişib — toxunulmur, logda xəbərdarlıq);
 *   - fakt, addım, sual: yalnız mətni köhnə dəyərə bərabər olan sahə;
 *   - qaralamada dərc olunmamış dəyişiklik yoxdursa düzəliş dərc olunur;
 *     varsa yalnız qaralama düzəlir (dərc etmək redaktordadır) — logda yazılır;
 *   - köhnə dəyərlər store-da `gizClean:backup:<slug>:<locale>`;
 *   - sonda bütün səhifələrdə «GIZ»/«EasTnT» qalıbsa siyahısı loga yazılır.
 */
import type { Core } from '@strapi/strapi';
import { GIZ_FIXES, type GizFix } from './giz-clean-data';

type Row = Record<string, unknown>;

const PAGE_UID = 'api::page.page';
const MARKER = 'gizClean:v1';
const POPULATE = ['facts', 'steps', 'faq', 'sideLinks'];
const COMP_KEYS: Record<string, string[]> = {
  facts: ['label', 'value', 'icon'],
  steps: ['track', 'title', 'period', 'who', 'body', 'linkLabel', 'linkUrl'],
  faq: ['question', 'answer'],
  sideLinks: ['label', 'url'],
};
const TEXT_FIELDS = ['title', 'lead', 'body', 'seoDescription', 'stepsTitle', 'contact'];

interface Docs {
  findFirst: (a: Row) => Promise<Row | null>;
  findMany: (a: Row) => Promise<Row[]>;
  update: (a: Row) => Promise<Row>;
  publish: (a: Row) => Promise<unknown>;
}

const str = (v: unknown): string => (typeof v === 'string' ? v : '');

/** Komponent massivini id-siz, yalnız məlum sahələrlə (Document Service-ə yazmaq üçün). */
function plainComp(component: string, items: unknown): Row[] {
  const keys = COMP_KEYS[component] ?? [];
  return (Array.isArray(items) ? (items as Row[]) : []).map((it) => {
    const o: Row = {};
    for (const k of keys) o[k] = it[k] ?? null;
    return o;
  });
}

/** Qaralama ilə dərc olunmuş versiya eynidirmi (dərc olunmamış redaktə yoxdur)? */
function sameContent(a: Row, b: Row): boolean {
  for (const f of TEXT_FIELDS) if (str(a[f]) !== str(b[f])) return false;
  for (const c of Object.keys(COMP_KEYS)) {
    if (JSON.stringify(plainComp(c, a[c])) !== JSON.stringify(plainComp(c, b[c]))) return false;
  }
  return true;
}

interface Applied {
  data: Row;
  changed: number;
  misses: string[];
}

function applyFix(doc: Row, fix: GizFix): Applied {
  const data: Row = {};
  const misses: string[] = [];
  let changed = 0;

  for (const t of fix.text) {
    if (str(doc[t.field]) === t.from) {
      data[t.field] = t.to;
      changed++;
    } else if (str(doc[t.field]) !== t.to) {
      misses.push(t.field);
    }
  }

  if (fix.body.length) {
    const lines = str(doc.body).split('\n');
    let touched = false;
    for (const l of fix.body) {
      const idx = lines.indexOf(l.from);
      if (idx === -1) {
        const done = l.to === null ? true : lines.includes(l.to);
        if (!done) misses.push('body');
        continue;
      }
      if (l.to === null) lines.splice(idx, 1);
      else lines[idx] = l.to;
      touched = true;
      changed++;
    }
    if (touched) data.body = lines.join('\n');
  }

  const byComp = new Map<string, Row[]>();
  for (const c of fix.comp) {
    const items = byComp.get(c.component) ?? plainComp(c.component, doc[c.component]);
    byComp.set(c.component, items);
    const hit = items.find((it) => str(it[c.key]) === c.from);
    if (hit) {
      hit[c.key] = c.to;
      changed++;
    } else if (!items.some((it) => str(it[c.key]) === c.to)) {
      misses.push(`${c.component}.${c.key}`);
    }
  }
  for (const [c, items] of byComp) data[c] = items;

  return { data, changed, misses };
}

export async function applyGizClean(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: MARKER })) === true) return;

  const docs = strapi.documents(PAGE_UID as never) as unknown as Docs;
  const fixedPublished: string[] = [];
  const draftOnly: string[] = [];
  const manual: string[] = [];
  let absent = 0;

  for (const fix of GIZ_FIXES) {
    const label = `${fix.slug} (${fix.locale})`;
    const draft = await docs.findFirst({
      locale: fix.locale,
      status: 'draft',
      filters: { slug: { $eq: fix.slug } },
      populate: POPULATE,
    });
    if (!draft) {
      absent++;
      continue;
    }
    const published = await docs.findFirst({
      locale: fix.locale,
      status: 'published',
      filters: { slug: { $eq: fix.slug } },
      populate: POPULATE,
    });
    const { data, changed, misses } = applyFix(draft, fix);
    if (misses.length) manual.push(`${label}: ${[...new Set(misses)].join(', ')}`);
    if (!changed) continue;

    const pending = published ? !sameContent(draft, published) : false;
    await store.set({
      key: `gizClean:backup:${fix.slug}:${fix.locale}`,
      value: Object.fromEntries(Object.keys(data).map((k) => [k, draft[k] ?? null])),
    });
    const documentId = str(draft.documentId);
    await docs.update({ documentId, locale: fix.locale, data });
    if (published && !pending) {
      await docs.publish({ documentId, locale: fix.locale });
      fixedPublished.push(label);
    } else {
      draftOnly.push(label);
    }
  }

  // Qalıq: düzəliş siyahısında olmayan səhifələr (köhnə və ya redaktorun yazdığı).
  const left: string[] = [];
  for (const locale of ['az', 'en', 'ru']) {
    for (const status of ['draft', 'published'] as const) {
      const rows = await docs.findMany({
        locale,
        status,
        fields: ['slug', 'body', 'lead', 'seoDescription'],
        populate: ['faq', 'steps', 'facts'],
        filters: {
          $or: [
            { body: { $containsi: 'EasTnT' } },
            { body: { $contains: 'GIZ' } },
            { lead: { $contains: 'GIZ' } },
            { seoDescription: { $contains: 'GIZ' } },
          ],
        },
        limit: 100,
      });
      for (const r of rows) {
        const key = `${str(r.slug)} (${locale}${status === 'published' ? '' : ', qaralama'})`;
        // «gizli» kimi sözlər $contains ilə tutulmasın: yalnız tam söz «GIZ».
        const text = [r.body, r.lead, r.seoDescription].map(str).join('\n');
        if (/(^|[^\p{L}])GIZ([^\p{L}]|$)|EasTnT/u.test(text) && !left.includes(key)) left.push(key);
      }
    }
  }

  await store.set({ key: MARKER, value: true });
  strapi.log.info(
    `[giz] F5.49: GIZ EasTnT səhifələrdən çıxarıldı — dərc olunub: ${fixedPublished.length}` +
      (draftOnly.length ? `, yalnız qaralamada: ${draftOnly.length} (${draftOnly.join(', ')})` : '') +
      (absent ? `; səhifəsi olmayan dil: ${absent}` : '') +
      '. Xəbərlərə toxunulmayıb.',
  );
  if (manual.length) {
    strapi.log.warn(`[giz] F5.49: redaktor dəyişdiyi üçün tapılmayan hissə (əl ilə yoxlayın): ${manual.join('; ')}.`);
  }
  if (left.length) {
    strapi.log.warn(`[giz] F5.49: səhifələrdə hələ «GIZ» var (əl ilə yoxlayın): ${left.join(', ')}.`);
  }
}
