/**
 * F5.45 — «Qəbul» menyusunun səhifələri sağ panelli şablonda (layout=qebul).
 *
 * Məzmun: src/utils/qebul-pages-content.ts. Bu modul BİR DƏFƏ
 * (store `adda-admin` → `qebulPages:v1`), bootstrap-da, portu bloklamadan:
 *
 *   1. Səhifələr: yoxdursa yaradılır; varsa və 9 oktyabr 2026-dan sonra
 *      redaktə olunmayıbsa yenidən qurulur (köhnə başlıq/mətn store-da
 *      `qebulPages:backup:<slug>:<locale>` açarı ilə saxlanılır), sonra dərc
 *      olunur. Redaktor sonradan dəyişibsə həmin dil TOXUNULMUR — logda
 *      xəbərdarlıq. ru/en yalnız əcnəbilər üçün iki səhifədə yazılır; digər
 *      səhifələrin köhnə ru/en mətni qalır (şablon dil üzrə eynidir).
 *   2. Təkrar ali təhsilin illik haqqı kataloqda 2026/2027 elanına uyğun
 *      (3800 AZN/il) — YALNIZ köhnə dəyər (2500 / 2700) qalıbsa.
 *   3. F5.44-ün «Məsul redaktorlar»-da yaratdığı, indi səhifələrin içində
 *      olan mövzular (tibbi müayinə, qəbul təqvimi, qeydiyyat, suallar, haqq,
 *      viza) — redaktor təyin olunmayıbsa sətir silinir (təkrar səhifə
 *      yaranmasın).
 *   4. Admin formasında yeni sahələrin yeri (yalnız Strapi defoltudursa).
 */
import type { Core } from '@strapi/strapi';
import { QEBUL_PAGES, type PageLocaleSeed, type QebulPageSeed } from './qebul-pages-content';

type Row = Record<string, unknown>;

const MARKER = 'qebulPages:v1';
const LAYOUT_MARKER = 'pageLayout:v1';
const PAGE_UID = 'api::page.page';
const PROGRAM_UID = 'api::program.program';
const OWNER_UID = 'api::page-owner.page-owner';

/** Bu tarixdən sonra redaktə olunan dilə toxunulmur (məzmun bu günə qədər yoxlanılıb). */
const REVIEWED_UNTIL = Date.parse('2026-10-09T23:59:59Z');

const TEKRAR_FEE = '3800 AZN/il';
const TEKRAR_OLD_FEES = ['2500', '2500 AZN/il', '2700', '2700 AZN/il'];

/** F5.44 gözləyən səhifələri — mövzu indi pillə səhifələrinin içindədir. */
const COVERED_PENDING = [
  'page:tibbi-muayine',
  'page:qebul-teqvimi',
  'page:qeydiyyat-xidmeti',
  'page:qebul-suallari',
  'page:tehsil-haqqi-ve-guzestler',
  'page:viza-ve-miqrasiya-desteyi',
];

interface Docs {
  findFirst: (a: Row) => Promise<Row | null>;
  findOne: (a: Row) => Promise<Row | null>;
  findMany: (a: Row) => Promise<Row[]>;
  create: (a: Row) => Promise<Row>;
  update: (a: Row) => Promise<Row>;
  publish: (a: Row) => Promise<unknown>;
}

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const time = (v: unknown): number => (typeof v === 'string' || v instanceof Date ? new Date(v as string).getTime() : 0);

function localeData(seed: QebulPageSeed, loc: PageLocaleSeed): Row {
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

interface PageResult {
  created: string[];
  rebuilt: string[];
  skipped: string[];
}

async function writePages(strapi: Core.Strapi): Promise<PageResult> {
  const docs = strapi.documents(PAGE_UID as never) as unknown as Docs;
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  const out: PageResult = { created: [], rebuilt: [], skipped: [] };

  for (const seed of QEBUL_PAGES) {
    const shared = { layout: 'qebul', dataBlock: seed.dataBlock };
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
      await store.set({
        key: `qebulPages:backup:${seed.slug}:az`,
        value: { title: az.title ?? null, body: az.body ?? null, seoDescription: az.seoDescription ?? null, updatedAt: az.updatedAt ?? null },
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
        await store.set({
          key: `qebulPages:backup:${seed.slug}:${lang}`,
          value: { title: existing.title ?? null, body: existing.body ?? null, seoDescription: existing.seoDescription ?? null, updatedAt: existing.updatedAt ?? null },
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

/** Təkrar ali təhsil: 2026/2027 elanı — illik 3800 AZN. Qaralama və dərc sətri birlikdə (başqa sahəyə toxunmur). */
async function fixTekrarFee(strapi: Core.Strapi): Promise<number> {
  const q = strapi.db.query(PROGRAM_UID as never) as unknown as {
    findMany: (a: Row) => Promise<Row[]>;
    updateMany: (a: Row) => Promise<{ count: number }>;
  };
  const rows = await q.findMany({ where: { catalogTab: 'tekrar_ali' }, select: ['id', 'tuitionFee'] });
  const ids = rows.filter((r) => TEKRAR_OLD_FEES.includes(str(r.tuitionFee))).map((r) => r.id);
  if (!ids.length) return 0;
  const res = await q.updateMany({ where: { id: { $in: ids } }, data: { tuitionFee: TEKRAR_FEE } });
  return res?.count ?? ids.length;
}

/** F5.44 gözləyən sətirləri: mövzu səhifələrin içindədir; redaktor təyin olunmayıbsa silinir. */
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

export async function applyQebulPagesV1(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: MARKER })) === true) return;

  const pages = await writePages(strapi);
  const fee = await fixTekrarFee(strapi).catch((e: Error) => {
    strapi.log.warn('[qebul] F5.45: təkrar ali təhsil haqqı yazılmadı: ' + e.message);
    return 0;
  });
  const dropped = await dropCoveredPending(strapi).catch((e: Error) => {
    strapi.log.warn('[qebul] F5.45: gözləyən sətirlər silinmədi: ' + e.message);
    return 0;
  });

  await store.set({ key: MARKER, value: true });
  strapi.log.info(
    `[qebul] F5.45: səhifələr — yaradıldı ${pages.created.length}, yenidən quruldu ${pages.rebuilt.length}, toxunulmadı ${pages.skipped.length}; ` +
      `təkrar ali təhsil haqqı: ${fee} sətir → ${TEKRAR_FEE}; «Məsul redaktorlar»-dan çıxan gözləyən sətir: ${dropped}.`,
  );
  if (pages.skipped.length) {
    strapi.log.warn('[qebul] F5.45: toxunulmadı — ' + pages.skipped.join('; ') + '. Yeni mətn src/utils/qebul-pages-content.ts-dədir.');
  }
}

// ── Admin forması: yeni sahələrin yeri ───────────────────────────────────────
type Cell = { name: string; size: number };
type Conf = { settings: Row; metadatas: Row; layouts: { edit: Cell[][] } & Row };

const TOP_FIELDS = ['layout', 'dataBlock', 'lead'];
const AFTER_BODY = ['stepsTitle', 'steps', 'facts', 'faq', 'sideLinks', 'contact'];

/**
 * Strapi yeni sahəni formanın SONUNA qoyur: «Şablon», «Avtomatik blok» və
 * «Qısa giriş» başlıqdan sonra, struktur blokları mətndən sonra olsun.
 * Admin düzümü əl ilə dəyişibsə (sahələr sonda deyil) toxunulmur.
 */
export async function placePageFields(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: LAYOUT_MARKER })) === true) return;
  const cts = strapi.plugin('content-manager').service('content-types') as unknown as {
    findContentType: (uid: string) => { uid: string } | null;
    findConfiguration: (ct: { uid: string }) => Promise<Conf>;
    updateConfiguration: (ct: { uid: string }, conf: Conf) => Promise<unknown>;
  };
  const ct = cts.findContentType(PAGE_UID);
  if (!ct) return;
  const conf = await cts.findConfiguration(ct);
  const edit = conf.layouts?.edit ?? [];
  const names = edit.flat().map((c) => c.name);
  const added = [...TOP_FIELDS, ...AFTER_BODY];
  let where = 'toxunulmadı';
  if (added.every((f) => names.includes(f))) {
    const tail = names.slice(-added.length).sort().join();
    if (tail === [...added].sort().join()) {
      const rest = edit.map((r) => r.filter((c) => !added.includes(c.name))).filter((r) => r.length);
      const slugRow = rest.findIndex((r) => r.some((c) => c.name === 'slug' || c.name === 'title'));
      const top: Cell[][] = [
        [{ name: 'layout', size: 6 }, { name: 'dataBlock', size: 6 }],
        [{ name: 'lead', size: 12 }],
      ];
      rest.splice(slugRow + 1, 0, ...top);
      const bodyRow = rest.findIndex((r) => r.some((c) => c.name === 'body'));
      rest.splice(bodyRow + 1, 0, ...AFTER_BODY.map((name) => [{ name, size: 12 }]));
      conf.layouts.edit = rest;
      await cts.updateConfiguration(ct, { settings: conf.settings, metadatas: conf.metadatas, layouts: conf.layouts });
      where = 'başlıqdan və mətndən sonra';
    }
  }
  await store.set({ key: LAYOUT_MARKER, value: true });
  strapi.log.info(`[qebul] F5.45: «Səhifə» formasında yeni sahələr: ${where}.`);
}
