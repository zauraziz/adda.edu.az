/**
 * F5.46 — «Təhsil» menyusunun səhifələri sağ panelli şablonda (layout=tehsil)
 * və iki bölmənin (Təlim-Tədris Mərkəzi, Tədris ofisi) yenilənmiş mətni.
 *
 * Məzmun: src/utils/tehsil-pages-content.ts (səhifələr) və
 * src/utils/tehsil-units-content.ts (bölmələr). BİR DƏFƏ
 * (store `adda-admin` → `tehsilPages:v1`), bootstrap-da, portu bloklamadan.
 * Qayda F5.45-dəki kimidir (qebul-pages.ts):
 *
 *   1. Səhifələr: yoxdursa yaradılır; varsa və 9 oktyabr 2026-dan sonra
 *      redaktə olunmayıbsa yenidən qurulur (köhnə başlıq/mətn store-da
 *      `tehsilPages:backup:<slug>:<locale>`), sonra dərc olunur. Redaktor
 *      sonradan dəyişibsə həmin dil TOXUNULMUR — logda xəbərdarlıq.
 *   2. Bölmələr (yalnız az): eyni tarix qaydası; köhnə sahələr store-da
 *      `tehsilPages:backup:unit:<slug>:az`. Keçidlər, suallar, bina yalnız
 *      BOŞDURSA yazılır; blok başlığı yalnız həmin blokun ayarı yoxdursa.
 *   3. F5.40-ın «Məsul redaktorlar»-dakı «STCW standartları» gözləyən sətri —
 *      mövzu «Təcrübə (praktika)» və TTM səhifəsindədir; redaktor təyin
 *      olunmayıbsa silinir.
 */
import type { Core } from '@strapi/strapi';
import type { PageLocaleSeed } from './qebul-pages-content';
import { TEHSIL_PAGES, type TehsilPageSeed } from './tehsil-pages-content';
import { TEHSIL_UNITS, type UnitSeed } from './tehsil-units-content';

type Row = Record<string, unknown>;

const MARKER = 'tehsilPages:v1';
const PAGE_UID = 'api::page.page';
const UNIT_UID = 'api::unit.unit';
const OWNER_UID = 'api::page-owner.page-owner';
const LAYOUT = 'tehsil';

/** Bu tarixdən sonra redaktə olunan dilə toxunulmur (məzmun bu günə qədər yoxlanılıb). */
const REVIEWED_UNTIL = Date.parse('2026-10-09T23:59:59Z');

/** F5.40 gözləyən sətri — mövzu indi «Təcrübə (praktika)» və TTM səhifəsindədir. */
const COVERED_PENDING = ['page:stcw-standartlari'];

interface Docs {
  findFirst: (a: Row) => Promise<Row | null>;
  findOne: (a: Row) => Promise<Row | null>;
  create: (a: Row) => Promise<Row>;
  update: (a: Row) => Promise<Row>;
  publish: (a: Row) => Promise<unknown>;
}

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const time = (v: unknown): number => (typeof v === 'string' || v instanceof Date ? new Date(v as string).getTime() : 0);
const list = (v: unknown): Row[] => (Array.isArray(v) ? (v as Row[]) : []);

function localeData(seed: TehsilPageSeed, loc: PageLocaleSeed): Row {
  return {
    title: loc.title,
    slug: seed.slug,
    lead: loc.lead,
    body: loc.body,
    seoDescription: loc.seoDescription.slice(0, 180),
    stepsTitle: loc.stepsTitle ?? null,
    facts: (loc.facts ?? []).map((f) => ({ label: f.label, value: f.value, icon: f.icon ?? 'diger' })),
    steps: (loc.steps ?? []).map((s) => ({
      track: s.track ?? null,
      title: s.title,
      period: s.period ?? null,
      who: s.who ?? null,
      body: s.body ?? null,
      linkLabel: s.linkLabel ?? null,
      linkUrl: s.linkUrl ?? null,
    })),
    faq: (loc.faq ?? []).map((q) => ({ question: q.question, answer: q.answer })),
    sideLinks: (loc.sideLinks ?? []).map((l) => ({ label: l.label, url: l.url })),
    contact: loc.contact ?? null,
  };
}

interface Result {
  created: string[];
  rebuilt: string[];
  skipped: string[];
}

async function backup(strapi: Core.Strapi, key: string, value: Row): Promise<void> {
  await strapi.store({ type: 'plugin', name: 'adda-admin' }).set({ key, value });
}

async function writePages(strapi: Core.Strapi): Promise<Result> {
  const docs = strapi.documents(PAGE_UID as never) as unknown as Docs;
  const out: Result = { created: [], rebuilt: [], skipped: [] };

  for (const seed of TEHSIL_PAGES) {
    const shared = { layout: LAYOUT, dataBlock: seed.dataBlock };
    let documentId = '';
    const az = (await docs.findFirst({ locale: 'az', status: 'draft', filters: { slug: { $eq: seed.slug } } })) as Row | null;

    if (!az) {
      const doc = await docs.create({ locale: 'az', data: { ...localeData(seed, seed.az), ...shared } });
      documentId = str(doc.documentId);
      await docs.publish({ documentId, locale: 'az' });
      out.created.push(`${seed.slug} (az)`);
    } else {
      documentId = str(az.documentId);
      const touched = time(az.updatedAt) > REVIEWED_UNTIL;
      if (touched || str(az.lead)) {
        out.skipped.push(`${seed.slug} (az: ${touched ? 'redaktor dəyişib' : 'artıq yeni şablonda'})`);
        continue; // az toxunulmursa digər dillər də — şablon dil üzrə eynidir
      }
      await backup(strapi, `tehsilPages:backup:${seed.slug}:az`, {
        title: az.title ?? null,
        body: az.body ?? null,
        seoDescription: az.seoDescription ?? null,
        layout: az.layout ?? null,
        updatedAt: az.updatedAt ?? null,
      });
      await docs.update({ documentId, locale: 'az', data: { ...localeData(seed, seed.az), ...shared } });
      await docs.publish({ documentId, locale: 'az' });
      out.rebuilt.push(`${seed.slug} (az)`);
    }

    for (const lang of ['en', 'ru'] as const) {
      const loc = seed[lang];
      if (!loc) continue;
      const existing = (await docs.findOne({ documentId, locale: lang, status: 'draft' })) as Row | null;
      if (existing) {
        if (time(existing.updatedAt) > REVIEWED_UNTIL || str(existing.lead)) {
          out.skipped.push(`${seed.slug} (${lang}: redaktor dəyişib)`);
          continue;
        }
        await backup(strapi, `tehsilPages:backup:${seed.slug}:${lang}`, {
          title: existing.title ?? null,
          body: existing.body ?? null,
          seoDescription: existing.seoDescription ?? null,
          updatedAt: existing.updatedAt ?? null,
        });
      }
      // Strapi 5: mövcud sənədin yeni dili də `update` ilə yaranır.
      await docs.update({ documentId, locale: lang, data: localeData(seed, loc) });
      await docs.publish({ documentId, locale: lang });
      (existing ? out.rebuilt : out.created).push(`${seed.slug} (${lang})`);
    }
  }
  return out;
}

/** Bölmə (az): mətn sahələri yenilənir; keçid, sual, bina yalnız boşdursa; blok başlığı yalnız ayarsız bloka. */
function unitData(seed: UnitSeed, cur: Row): Row {
  const data: Row = { mission: seed.mission, about: seed.about };
  if (seed.functions) data.functions = seed.functions;
  if (seed.services) data.services = seed.services;
  if (seed.results) data.results = seed.results;
  if (seed.building && !str(cur.building)) data.building = seed.building;
  if (seed.links?.length && !list(cur.links).length) data.links = seed.links.map((l) => ({ label: l.label, url: l.url }));
  if (seed.onlineServices?.length && !list(cur.onlineServices).length) {
    data.onlineServices = seed.onlineServices.map((l) => ({ label: l.label, url: l.url }));
  }
  if (seed.faq?.length && !list(cur.faq).length) data.faq = seed.faq.map((q) => ({ question: q.question, answer: q.answer }));
  if (seed.blockTitles?.length) {
    const existing = list(cur.blockSettings);
    const taken = new Set(existing.map((b) => str(b.block)));
    const add = seed.blockTitles.filter((b) => !taken.has(b.block));
    if (add.length) {
      data.blockSettings = [
        ...existing.map((b) => ({ id: b.id, block: b.block, title: b.title ?? null, hidden: b.hidden ?? false })),
        ...add.map((b) => ({ block: b.block, title: b.title, hidden: false })),
      ];
    }
  }
  return data;
}

async function writeUnits(strapi: Core.Strapi): Promise<Result> {
  const docs = strapi.documents(UNIT_UID as never) as unknown as Docs;
  const out: Result = { created: [], rebuilt: [], skipped: [] };
  for (const seed of TEHSIL_UNITS) {
    const az = (await docs.findFirst({
      locale: 'az',
      status: 'draft',
      filters: { slug: { $eq: seed.slug } },
      populate: { blockSettings: true, links: true, onlineServices: true, faq: true },
    })) as Row | null;
    if (!az) {
      out.skipped.push(`${seed.slug} (bölmə yoxdur)`);
      continue;
    }
    if (time(az.updatedAt) > REVIEWED_UNTIL) {
      out.skipped.push(`${seed.slug} (redaktor dəyişib)`);
      continue;
    }
    if (str(az.mission) === seed.mission) {
      out.skipped.push(`${seed.slug} (artıq yenidir)`);
      continue;
    }
    const documentId = str(az.documentId);
    await backup(strapi, `tehsilPages:backup:unit:${seed.slug}:az`, {
      mission: az.mission ?? null,
      about: az.about ?? null,
      functions: az.functions ?? null,
      services: az.services ?? null,
      results: az.results ?? null,
      updatedAt: az.updatedAt ?? null,
    });
    await docs.update({ documentId, locale: 'az', data: unitData(seed, az) });
    await docs.publish({ documentId, locale: 'az' });
    out.rebuilt.push(seed.slug);
  }
  return out;
}

/** F5.40 gözləyən sətri: mövzu səhifələrin içindədir; redaktor təyin olunmayıbsa silinir. */
async function dropCoveredPending(strapi: Core.Strapi): Promise<number> {
  const q = strapi.db.query(OWNER_UID as never) as unknown as {
    findMany: (a: Row) => Promise<Row[]>;
    delete: (a: Row) => Promise<unknown>;
  };
  const rows = await q.findMany({ where: { key: { $in: COVERED_PENDING } } });
  let n = 0;
  for (const r of rows) {
    if (r.editorId !== null && r.editorId !== undefined && r.editorId !== '') continue;
    await q.delete({ where: { id: r.id } });
    n++;
  }
  return n;
}

export async function applyTehsilPagesV1(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: MARKER })) === true) return;

  const pages = await writePages(strapi);
  const units = await writeUnits(strapi).catch((e: Error) => {
    strapi.log.warn('[tehsil] F5.46: bölmələr yazılmadı: ' + e.message);
    return { created: [], rebuilt: [], skipped: [] } as Result;
  });
  const dropped = await dropCoveredPending(strapi).catch((e: Error) => {
    strapi.log.warn('[tehsil] F5.46: gözləyən sətir silinmədi: ' + e.message);
    return 0;
  });

  await store.set({ key: MARKER, value: true });
  strapi.log.info(
    `[tehsil] F5.46: səhifələr — yaradıldı ${pages.created.length}, yenidən quruldu ${pages.rebuilt.length}, toxunulmadı ${pages.skipped.length}; ` +
      `bölmələr — yeniləndi ${units.rebuilt.length}, toxunulmadı ${units.skipped.length}; «Məsul redaktorlar»-dan çıxan gözləyən sətir: ${dropped}.`,
  );
  const skipped = [...pages.skipped, ...units.skipped];
  if (skipped.length) {
    strapi.log.warn(
      '[tehsil] F5.46: toxunulmadı — ' + skipped.join('; ') + '. Yeni mətn src/utils/tehsil-pages-content.ts və tehsil-units-content.ts-dədir.',
    );
  }
}
