/**
 * F5.55 — ASCO-nun «Dənizçilər poliklinikası» 2021-ci ildə ləğv edilib (Zaur müəllim,
 * 18.10.2026). Saytda xüsusi tibbi müayinə bu poliklinikada göstərilirdi (F5.45
 * bakalavriat, F5.49 FAQ və «ASCO və Akademiya»). Müayinənin yeni yeri mənbədə yoxdur —
 * mətn «yeri və vaxtı Akademiyanın elanında bildirilir» olur, poliklinikanın ünvanı
 * çıxır, ASCO cədvəlindən «Tibbi müayinə» sətri silinir (artıq ASCO ilə bağlı deyil).
 *
 * applyPoliklinikaFixV1 — BİR DƏFƏ (`poliklinika:v1`): bütün səhifələrin və bölmələrin
 * (hər dil, qaralama VƏ dərc olunmuş sətir ayrıca) mətn sahələri və komponentləri
 * birbaşa bazada; yalnız seed-in yazdığı dəqiq cümlələr əvəz olunur (redaktor
 * dəyişibsə toxunulmur). Redaktə tarixi saxlanır (phone-fix.ts kimi). Əvəz olunmadan
 * qalan «Dənizçilər poliklinikası» logda — admində əl ilə düzəldilir.
 */
import type { Core } from '@strapi/strapi';

type Row = Record<string, unknown>;
interface Q {
  findMany: (a: Row) => Promise<Row[]>;
  updateMany: (a: Row) => Promise<unknown>;
}

const MARKER = 'poliklinika:v1';
const TAG = '[poliklinika] F5.55';
export const POLI_RE = /Dənizçilər poliklinika|Seafarers[’'] Polyclinic|оликлиник[аеиу] моряков/i;
/** Yeni mətnin özündəki qəsdən qeyd («2021-ci ildə ləğv edilib») — qalıq sayılmır. */
const DONE_RE = /«Dənizçilər poliklinikası» 2021-ci ildə ləğv edilib|Seafarers’ Polyclinic was closed in 2021|«Поликлиника моряков» ASCO ликвидирована в 2021/g;
const stillHas = (t: string): boolean => POLI_RE.test(t.replace(DONE_RE, ''));

const AZ_NOTE = 'yeri və vaxtı Akademiyanın elanında bildirilir';
const EN_NOTE = 'the place and time are given in the Academy’s announcement';
const RU_NOTE = 'место и время указываются в объявлении Академии';

/** [köhnə, yeni] — seed-in yazdığı dəqiq mətnlər (F5.45, F5.49). */
const PAIRS: [string, string][] = [
  // az
  [
    'təsdiqlədikdən sonra ASCO-nun «Dənizçilər poliklinikası»nda xüsusi tibbi müayinədən keçir.',
    `təsdiqlədikdən sonra xüsusi tibbi müayinədən keçir; ${AZ_NOTE}.`,
  ],
  [
    'Dənizçi ixtisaslarına qəbul olanlar ASCO-nun «Dənizçilər poliklinikası»nda xüsusi tibbi müayinədən keçir.',
    `Dənizçi ixtisaslarına qəbul olanlar xüsusi tibbi müayinədən keçir; ${AZ_NOTE}.`,
  ],
  [
    'Dənizçi ixtisaslarına qəbul olanlar ASCO-nun «Dənizçilər poliklinikası» MMC-də xüsusi tibbi müayinədən keçir. Tarix və sənəd siyahısı hər il Akademiyanın elanında verilir.',
    'Dənizçi ixtisaslarına qəbul olanlar xüsusi tibbi müayinədən keçir. Yeri, tarixi və sənəd siyahısı hər il Akademiyanın elanında verilir. ASCO-nun «Dənizçilər poliklinikası» 2021-ci ildə ləğv edilib.',
  ],
  [
    'ASCO-nun «Dənizçilər poliklinikası»nda müayinədən keçməlidir. Tarix Akademiyanın elanında bildirilir.',
    'xüsusi tibbi müayinədən keçməlidir. Yeri və tarixi Akademiyanın elanında bildirilir.',
  ],
  [
    'elektron ərizəni təsdiqlədikdən sonra «Azərbaycan Xəzər Dəniz Gəmiçiliyi» QSC-nin «Dənizçilər poliklinikası» MMC-də xüsusi tibbi müayinədən keçməlidir.',
    'elektron ərizəni təsdiqlədikdən sonra xüsusi tibbi müayinədən keçməlidir.',
  ],
  [
    'Poliklinikanın ünvanı: Bakı, K. Kazımov küçəsi 120A (Mərkəzi Gömrük Hospitalının yanı). Müayinənin tarixi və dəqiq sənəd siyahısı hər il Akademiyanın elanında verilir.',
    'Müayinənin yeri, tarixi və dəqiq sənəd siyahısı hər il Akademiyanın elanında verilir.',
  ],
  // en
  [
    'at ASCO’s Seafarers’ Polyclinic after confirming their online application.',
    `after confirming their online application; ${EN_NOTE}.`,
  ],
  [
    'Applicants to seafaring programmes take a special medical examination at ASCO’s Seafarers’ Polyclinic.',
    `Applicants to seafaring programmes take a special medical examination; ${EN_NOTE}.`,
  ],
  [
    'Applicants to seafaring programmes are examined at ASCO’s Seafarers’ Polyclinic. Dates and the list of documents are published every year in the Academy’s announcement.',
    'Applicants to seafaring programmes take a special medical examination. The place, dates and list of documents are published every year in the Academy’s announcement. ASCO’s Seafarers’ Polyclinic was closed in 2021.',
  ],
  // ru
  [
    'электронного заявления проходят специальный медосмотр в «Поликлинике моряков» ASCO.',
    `электронного заявления проходят специальный медосмотр; ${RU_NOTE}.`,
  ],
  [
    'Поступающие на морские специальности проходят специальный медосмотр в «Поликлинике моряков» ASCO.',
    `Поступающие на морские специальности проходят специальный медосмотр; ${RU_NOTE}.`,
  ],
  [
    'Поступающие на морские специальности проходят его в ООО «Поликлиника моряков» ASCO. Сроки и перечень документов ежегодно публикуются в объявлении Академии.',
    'Поступающие на морские специальности проходят специальный медосмотр. Место, сроки и перечень документов ежегодно публикуются в объявлении Академии. «Поликлиника моряков» ASCO ликвидирована в 2021 году.',
  ],
];

/** «ASCO və Akademiya» cədvəlinin «Tibbi müayinə» sətri (az/en/ru) — silinir. */
const TABLE_ROWS = [
  /^\| Tibbi müayinə \| dənizçi ixtisaslarına qəbul olanlar ASCO-nun «Dənizçilər poliklinikası»nda \|[^\n]*\|[ \t]*(?:\n|$)/m,
  /^\| Medical examination \| applicants to seafaring programmes are examined at ASCO’s Seafarers’ Polyclinic \|[^\n]*\|[ \t]*(?:\n|$)/m,
  /^\| Медосмотр \| поступающие на морские специальности проходят его в «Поликлинике моряков» ASCO \|[^\n]*\|[ \t]*(?:\n|$)/m,
];

/** Saf funksiya, idempotent. Addımın «Kim» sahəsi tam «Dənizçilər poliklinikası»-dırsa → «Tibbi komissiya». */
export function fixPoliklinika(text: string): string {
  if (!text || !/oliklini|olyclinic|оликлиник/i.test(text)) return text;
  if (text.trim() === 'Dənizçilər poliklinikası') return 'Tibbi komissiya';
  let out = text;
  for (const [a, b] of PAIRS) out = out.split(a).join(b);
  for (const re of TABLE_ROWS) out = out.replace(re, '');
  return out;
}

const PAGE_TOP = ['title', 'lead', 'body', 'seoDescription', 'stepsTitle', 'contact'];
const PAGE_COMPS: Record<string, { uid: string; keys: string[] }> = {
  faq: { uid: 'unit.faq', keys: ['question', 'answer'] },
  steps: { uid: 'page.step', keys: ['title', 'period', 'who', 'body', 'linkLabel'] },
  facts: { uid: 'page.fact', keys: ['label', 'value'] },
};
const UNIT_TOP = ['about', 'mission', 'functions', 'services', 'results', 'strategy', 'receptionHours'];
const UNIT_COMPS: Record<string, { uid: string; keys: string[] }> = {
  faq: { uid: 'unit.faq', keys: ['question', 'answer'] },
};

async function fixTable(
  strapi: Core.Strapi,
  uid: string,
  top: string[],
  comps: Record<string, { uid: string; keys: string[] }>,
  touched: Set<string>,
  left: Set<string>,
): Promise<number> {
  const repo = strapi.db.query(uid as never) as unknown as Q;
  let n = 0;
  for (let offset = 0; ; offset += 50) {
    const rows = await repo.findMany({
      select: ['id', 'slug', 'locale', 'updatedAt', ...top],
      populate: Object.fromEntries(Object.keys(comps).map((k) => [k, true])),
      orderBy: { id: 'asc' },
      limit: 50,
      offset,
    });
    if (!rows.length) break;
    for (const r of rows) {
      const key = `${String(r.slug)} (${String(r.locale ?? 'az')})`;
      const data: Row = {};
      for (const f of top) {
        const v = typeof r[f] === 'string' ? (r[f] as string) : '';
        const nv = fixPoliklinika(v);
        if (nv !== v) data[f] = nv;
        if (stillHas(nv)) left.add(key);
      }
      if (Object.keys(data).length) {
        await repo.updateMany({ where: { id: r.id }, data: { ...data, updatedAt: r.updatedAt } });
        n++;
        touched.add(key);
      }
      for (const [field, c] of Object.entries(comps)) {
        for (const it of Array.isArray(r[field]) ? (r[field] as Row[]) : []) {
          const d: Row = {};
          for (const k of c.keys) {
            const v = typeof it[k] === 'string' ? (it[k] as string) : '';
            const nv = fixPoliklinika(v);
            if (nv !== v) d[k] = nv;
            if (stillHas(nv)) left.add(key);
          }
          if (Object.keys(d).length && it.id !== undefined) {
            await (strapi.db.query(c.uid as never) as unknown as Q).updateMany({ where: { id: it.id }, data: d });
            n++;
            touched.add(key);
          }
        }
      }
    }
  }
  return n;
}

export async function applyPoliklinikaFixV1(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: MARKER })) === true) return;
  const touched = new Set<string>();
  const left = new Set<string>();
  const pages = await fixTable(strapi, 'api::page.page', PAGE_TOP, PAGE_COMPS, touched, left);
  const units = await fixTable(strapi, 'api::unit.unit', UNIT_TOP, UNIT_COMPS, touched, left);
  await store.set({ key: MARKER, value: true });
  const list = (s: Set<string>) => [...s].slice(0, 30).join(', ') + (s.size > 30 ? ' …' : '');
  strapi.log.info(
    `${TAG}: «Dənizçilər poliklinikası» (2021-də ləğv edilib) — yeniləndi: səhifə ${pages}, bölmə ${units}` +
      (touched.size ? ` (${list(touched)})` : '') +
      '.',
  );
  if (left.size) strapi.log.warn(`${TAG}: hələ «poliklinika» qalır — admində əl ilə düzəldin: ${list(left)}.`);
}
