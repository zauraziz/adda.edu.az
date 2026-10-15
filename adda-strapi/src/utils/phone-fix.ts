/**
 * F5.53 — Akademiyanın ümumi əlaqə nömrəsi (Zaur müəllim, 15.10.2026):
 * (012) 493 36 44. Saytda (Next.js) mənbə: adda-nextjs/lib/phone.ts — EYNİ format.
 *
 *   az: «(012) 493 36 44»; en/ru: «+994 12 493 36 44».
 *   Daxili nömrə: az «(012) 493 36 44, daxili 3078», en «…, ext. 3078», ru «…, доб. 3078».
 *
 * Səhifə mətnlərində əvvəlki miqrasiyaların yazdığı nömrələr (F5.45–F5.49):
 *   - «+994 12 404 33 40» — SƏHV nömrə idi (Akademiyanın deyil) → ümumi nömrə;
 *   - «(+99412) 493-36-44 (3078)» («Daxili telefon:» etiketi ilə) → «Telefon: … daxili 3078»;
 *   - az mətnində «+994 12 493 36 44» → «(012) 493 36 44».
 *
 * applyPhoneFixV1 — BİR DƏFƏ (store `adda-admin` → `phoneFix:v1`): bütün səhifələrin
 * (hər dil, qaralama VƏ dərc olunmuş sətir ayrıca) mətn sahələri və komponentləri
 * (suallar, addımlar, faktlar, yan keçidlər) birbaşa bazada düzəlir. Dərc
 * vəziyyəti dəyişmir: qaralamadakı dərc olunmamış redaktə dərc olunmur, dərc
 * olunmuş versiyada da nömrə düzəlir. Seed faylları artıq yeni formatdadır —
 * köhnə seed-ə fixPhones tətbiq olunanda yenisi alınır (scratchpad same53).
 *
 * Redaktə tarixi (`updatedAt`) SAXLANIR: bu, redaktor dəyişikliyi deyil. Strapi-nin
 * `update()`-i onu hər dəfə indiki vaxta qoyur (@strapi/database timestamps
 * abunəçisi) — onda section-pages.ts sonrakı miqrasiyalarda səhifəni «redaktor
 * dəyişib» sayıb atlayardı (F5.53-ün özündə də: hüquqi və korporativ səhifələr
 * telefon düzəlişindən SONRA işləyir), admində də «Dəyişdirilib» görünə bilərdi.
 * Ona görə `updateMany` (obyekt datada vaxt qoyulmur) + köhnə `updatedAt`.
 */
import type { Core } from '@strapi/strapi';

type Row = Record<string, unknown>;

export const ACADEMY_PHONE_AZ = '(012) 493 36 44';
export const ACADEMY_PHONE_INTL = '+994 12 493 36 44';
export const ACADEMY_TEL = '+994124933644';

const MARKER = 'phoneFix:v1';
const PAGE_UID = 'api::page.page';
const TOP = ['title', 'lead', 'body', 'seoDescription', 'stepsTitle', 'contact'];
const COMPS: Record<string, { uid: string; keys: string[] }> = {
  faq: { uid: 'unit.faq', keys: ['question', 'answer'] },
  steps: { uid: 'page.step', keys: ['title', 'period', 'who', 'body', 'linkLabel', 'linkUrl'] },
  facts: { uid: 'page.fact', keys: ['label', 'value'] },
  sideLinks: { uid: 'nav.link', keys: ['label', 'url'] },
};

type Loc = 'az' | 'en' | 'ru';
const loc = (l: unknown): Loc => (l === 'en' || l === 'ru' ? l : 'az');
const MAIN: Record<Loc, string> = { az: ACADEMY_PHONE_AZ, en: ACADEMY_PHONE_INTL, ru: ACADEMY_PHONE_INTL };
const EXT: Record<Loc, string> = { az: 'daxili', en: 'ext.', ru: 'доб.' };

/** Daxili nömrə ilə tam yazılış dilin formatında. */
export function phoneWithExt(ext: string, locale: string): string {
  const l = loc(locale);
  return `${MAIN[l]}, ${EXT[l]} ${ext}`;
}

/** Mətndəki nömrələri dilin formatına gətirir (saf funksiya, idempotent). */
export function fixPhones(text: string, locale: string): string {
  if (!text) return text;
  const l = loc(locale);
  const main = MAIN[l];
  const old = String.raw`\(\+99412\)\s?493-36-44\s?\((\d{2,5})\)`;
  let t = text;
  // 1. Səhv nömrə (və zəng keçidi).
  t = t.replace(/\+994[\s-]?12[\s-]?404[\s-]?33[\s-]?40/g, main);
  t = t.replace(/tel:\+?994124043340/g, `tel:${ACADEMY_TEL}`);
  // 2. «Daxili telefon: (+99412) 493-36-44 (3078)» — etiket «Telefon» olur, daxili nömrə sonda.
  t = t.replace(new RegExp(String.raw`\*\*Daxili telefon:\*\* ` + old, 'g'), (_, e: string) => `**Telefon:** ${phoneWithExt(e, 'az')}`);
  t = t.replace(new RegExp(String.raw`\*\*Internal phone:\*\* ` + old, 'g'), (_, e: string) => `**Phone:** ${phoneWithExt(e, 'en')}`);
  t = t.replace(new RegExp(String.raw`\*\*Внутренний телефон:\*\* ` + old, 'g'), (_, e: string) => `**Телефон:** ${phoneWithExt(e, 'ru')}`);
  t = t.replace(new RegExp(String.raw`daxili telefon ` + old, 'g'), (_, e: string) => `telefon ${phoneWithExt(e, 'az')}`);
  t = t.replace(new RegExp(String.raw`internal phone ` + old, 'g'), (_, e: string) => `phone ${phoneWithExt(e, 'en')}`);
  t = t.replace(new RegExp(String.raw`внутренний телефон ` + old, 'g'), (_, e: string) => `телефон ${phoneWithExt(e, 'ru')}`);
  t = t.replace(new RegExp(old, 'g'), (_, e: string) => phoneWithExt(e, l));
  // 3. az mətnində beynəlxalq yazılış → yerli («(…)» içindədirsə vergüllə, ikiqat mötərizə olmasın).
  if (l === 'az') {
    t = t.replace(/ \(\+994 12 493 36 44\)/g, `, ${ACADEMY_PHONE_AZ}`);
    t = t.replace(/\+994 12 493 36 44/g, ACADEMY_PHONE_AZ);
  }
  return t;
}

interface Q {
  findMany: (a: Row) => Promise<Row[]>;
  updateMany: (a: Row) => Promise<unknown>;
}

export async function applyPhoneFixV1(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: MARKER })) === true) return;

  const pages = strapi.db.query(PAGE_UID as never) as unknown as Q;
  const comp = (uid: string) => strapi.db.query(uid as never) as unknown as Q;
  const touched = new Set<string>();
  let rowsChanged = 0;
  let compChanged = 0;

  for (let offset = 0; ; offset += 50) {
    // Bütün sətirlər: hər dil, qaralama və dərc olunmuş versiya ayrıca.
    const rows = await pages.findMany({
      select: ['id', 'slug', 'locale', 'publishedAt', 'updatedAt', ...TOP],
      populate: Object.fromEntries(Object.keys(COMPS).map((k) => [k, true])),
      orderBy: { id: 'asc' },
      limit: 50,
      offset,
    });
    if (!rows.length) break;
    for (const r of rows) {
      const l = String(r.locale ?? 'az');
      const data: Row = {};
      for (const f of TOP) {
        const v = typeof r[f] === 'string' ? (r[f] as string) : '';
        const nv = fixPhones(v, l);
        if (nv !== v) data[f] = nv;
      }
      if (Object.keys(data).length) {
        await pages.updateMany({ where: { id: r.id }, data: { ...data, updatedAt: r.updatedAt } });
        rowsChanged++;
        touched.add(`${String(r.slug)} (${l})`);
      }
      for (const [field, c] of Object.entries(COMPS)) {
        const items = Array.isArray(r[field]) ? (r[field] as Row[]) : [];
        for (const it of items) {
          const d: Row = {};
          for (const k of c.keys) {
            const v = typeof it[k] === 'string' ? (it[k] as string) : '';
            const nv = fixPhones(v, l);
            if (nv !== v) d[k] = nv;
          }
          if (Object.keys(d).length && it.id !== undefined) {
            await comp(c.uid).updateMany({ where: { id: it.id }, data: d });
            compChanged++;
            touched.add(`${String(r.slug)} (${l})`);
          }
        }
      }
    }
  }

  await store.set({ key: MARKER, value: true });
  strapi.log.info(
    `[telefon] F5.53: səhifələrdə nömrə (012) 493 36 44 formatına gətirildi — sətir: ${rowsChanged}, komponent: ${compChanged}` +
      (touched.size ? ` (${[...touched].slice(0, 30).join(', ')}${touched.size > 30 ? ' …' : ''})` : '') +
      '.',
  );
}
