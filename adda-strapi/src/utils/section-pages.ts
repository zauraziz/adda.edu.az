/**
 * F5.48 — sağ panelli şablonun səhifələrini BİR DƏFƏ yazan ümumi köməkçi və
 * «Tələbə həyatı» (layout=telebe), «Beynəlxalq əlaqələr» (layout=beynelxalq)
 * səhifələri.
 *
 * Məzmun: src/utils/telebe-pages-content.ts, beynelxalq-pages-content.ts.
 * Qayda F5.45–F5.47-dəki kimidir (qebul-pages.ts, tehsil-pages.ts, elm-pages.ts):
 *
 *   1. Səhifə yoxdursa yaradılır (giriş səhifəsi, mədəniyyət, mübadilə, ikili
 *      diplom); varsa və 12 oktyabr 2026-dan sonra redaktə olunmayıbsa yenidən
 *      qurulur (köhnə başlıq/mətn store-da `<prefix>:backup:<slug>:<locale>`),
 *      sonra dərc olunur. Redaktor sonradan dəyişibsə həmin dil TOXUNULMUR —
 *      logda xəbərdarlıq. ru/en mövcud sənədin yeni dili kimi `update` ilə.
 *   2. Köhnə menyunun yer tutan mövzuları yeni səhifələrin içindədir (bax
 *      DROP_IF_UNASSIGNED): «Məsul redaktorlar»-da redaktor təyin olunmayıbsa
 *      sətir silinir, təyin olunubsa qalır («Menyuda yoxdur»).
 *   3. «Erasmus+ və Mevlana» yer tutanının təyinatı yeni «Mübadilə və Erasmus+»
 *      səhifəsinə keçir (Mevlana proqramında iştirak təsdiqlənməyib).
 *
 * BİR DƏFƏ (store `adda-admin` → `telebePages:v1`, `beynelxalqPages:v1`),
 * bootstrap-da, portu bloklamadan — menyulardan SONRA, təkrarlardan
 * (`dedupe:v3`) ƏVVƏL.
 */
import type { Core } from '@strapi/strapi';
import type { PageLocaleSeed, QebulPageSeed } from './qebul-pages-content';
import { TELEBE_PAGES } from './telebe-pages-content';
import { BEYNELXALQ_PAGES } from './beynelxalq-pages-content';
import { moveOwner } from './dedupe';

type Row = Record<string, unknown>;

const PAGE_UID = 'api::page.page';
const OWNER_UID = 'api::page-owner.page-owner';

/** Bu tarixdən sonra redaktə olunan dilə toxunulmur (məzmun bu günə qədər yoxlanılıb). */
const REVIEWED_UNTIL = Date.parse('2026-10-12T23:59:59Z');

interface Docs {
  findFirst: (a: Row) => Promise<Row | null>;
  findOne: (a: Row) => Promise<Row | null>;
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

export interface SectionPagesJob {
  /** store `adda-admin` markeri. */
  marker: string;
  /** Log prefiksi, məs. «[telebe] F5.48». */
  tag: string;
  /** page.layout (dil üzrə eyni). */
  layout: string;
  /** Ehtiyat açarının prefiksi: `<prefix>:backup:<slug>:<locale>`. */
  backupPrefix: string;
  pages: QebulPageSeed[];
  /** Redaktoru yoxdursa silinən «Məsul redaktorlar» sətirləri (page:<slug>). */
  dropIfUnassigned: string[];
  /** Təyinatın köçürülməsi: köhnə açar → yeni səhifə. */
  ownerMoves?: { from: string; slug: string; label: string }[];
  /** Məzmun faylının yolu — xəbərdarlıq mətnində. */
  source: string;
}

interface Result {
  created: string[];
  rebuilt: string[];
  skipped: string[];
}

async function writePages(strapi: Core.Strapi, job: SectionPagesJob): Promise<Result> {
  const docs = strapi.documents(PAGE_UID as never) as unknown as Docs;
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  const backup = (key: string, value: Row) => store.set({ key, value });
  const out: Result = { created: [], rebuilt: [], skipped: [] };

  for (const seed of job.pages) {
    const shared = { layout: job.layout, dataBlock: seed.dataBlock };
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
      await backup(`${job.backupPrefix}:backup:${seed.slug}:az`, {
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
        await backup(`${job.backupPrefix}:backup:${seed.slug}:${lang}`, {
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

/** Yer tutan mövzular: redaktor təyin olunmayıbsa «Məsul redaktorlar» sətri silinir. */
async function dropUnassigned(strapi: Core.Strapi, keys: string[]): Promise<{ dropped: number; kept: string[] }> {
  if (!keys.length) return { dropped: 0, kept: [] };
  const q = strapi.db.query(OWNER_UID as never) as unknown as {
    findMany: (a: Row) => Promise<Row[]>;
    delete: (a: Row) => Promise<unknown>;
  };
  const rows = await q.findMany({ where: { key: { $in: keys } } });
  let dropped = 0;
  const kept: string[] = [];
  for (const r of rows) {
    if (r.editorId !== null && r.editorId !== undefined && r.editorId !== '') {
      kept.push(str(r.key));
      continue;
    }
    await q.delete({ where: { id: r.id } });
    dropped++;
  }
  return { dropped, kept };
}

export async function applySectionPages(strapi: Core.Strapi, job: SectionPagesJob): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: job.marker })) === true) return;

  const pages = await writePages(strapi, job);
  let moved = 0;
  for (const m of job.ownerMoves ?? []) {
    if (await moveOwner(strapi, m.from, `page:${m.slug}`, `/sehife/${m.slug}`, m.label).catch(() => false)) moved++;
  }
  const pending = await dropUnassigned(strapi, job.dropIfUnassigned).catch((e: Error) => {
    strapi.log.warn(`${job.tag}: gözləyən sətirlər silinmədi: ${e.message}`);
    return { dropped: 0, kept: [] as string[] };
  });

  await store.set({ key: job.marker, value: true });
  strapi.log.info(
    `${job.tag}: səhifələr — yaradıldı ${pages.created.length}, yenidən quruldu ${pages.rebuilt.length}, toxunulmadı ${pages.skipped.length}; ` +
      `«Məsul redaktorlar»-dan çıxan gözləyən sətir: ${pending.dropped}` +
      (pending.kept.length ? ` (redaktoru olduğu üçün qalan: ${pending.kept.join(', ')})` : '') +
      (job.ownerMoves?.length ? `; köçən təyinat: ${moved}` : '') +
      '.',
  );
  if (pages.skipped.length) {
    strapi.log.warn(`${job.tag}: toxunulmadı — ${pages.skipped.join('; ')}. Yeni mətn ${job.source}-dədir.`);
  }
}

// ── F5.48: Tələbə həyatı ─────────────────────────────────────────────────────
/** Köhnə menyunun yer tutanları — mövzu yeni səhifələrin içindədir (və ya məlumat yoxdur). */
const TELEBE_DROP = [
  'page:konulluluk-herekati', // → giriş səhifəsi, «Könüllülük və maarifləndirmə»
  'page:onlayn-muraciet-ve-yerlesdirme', // → «Yataqxana» (ərizə sənəd təqdimi zamanı)
  'page:teqaud-proqramlari', // → «Təqaüd və sosial dəstək»
  'page:intellektual-oyun-klublari', // → «Mədəniyyət və yaradıcılıq»
  'page:tedbirler-teqvimi', // → /tedbirler
  'page:sosial-media-elcileri', // proqram haqqında məlumat yoxdur
];

export async function applyTelebePagesV1(strapi: Core.Strapi): Promise<void> {
  await applySectionPages(strapi, {
    marker: 'telebePages:v1',
    tag: '[telebe] F5.48',
    layout: 'telebe',
    backupPrefix: 'telebePages',
    pages: TELEBE_PAGES,
    dropIfUnassigned: TELEBE_DROP,
    source: 'src/utils/telebe-pages-content.ts',
  });
}

// ── F5.48: Beynəlxalq əlaqələr ───────────────────────────────────────────────
const BEYNELXALQ_DROP = [
  'page:muellim-mubadilesi', // → «Mübadilə və Erasmus+»
  'page:yay-mektebleri', // → «Mübadilə və Erasmus+»
  'page:kadet-proqramlari', // → «Mübadilə və Erasmus+», xaricdə dəniz təcrübəsi
  'page:iamu', // → ana səhifə, «Üzvlüklər»
  'page:imo', // → ana səhifə, «Beynəlxalq tanınma»
  'page:bsami', // üzvlük təsdiqlənməyib
  'page:diger-teskilatlar', // → ana səhifə, «Üzvlüklər»
  'page:qrant-layiheleri', // → «Qrantlar və müsabiqələr» (Elm)
];

export async function applyBeynelxalqPagesV1(strapi: Core.Strapi): Promise<void> {
  await applySectionPages(strapi, {
    marker: 'beynelxalqPages:v1',
    tag: '[beynelxalq] F5.48',
    layout: 'beynelxalq',
    backupPrefix: 'beynelxalqPages',
    pages: BEYNELXALQ_PAGES,
    dropIfUnassigned: BEYNELXALQ_DROP,
    ownerMoves: [{ from: 'page:erasmus-ve-mevlana', slug: 'mobillik-ve-mubadile', label: 'Mübadilə və Erasmus+' }],
    source: 'src/utils/beynelxalq-pages-content.ts',
  });
}
