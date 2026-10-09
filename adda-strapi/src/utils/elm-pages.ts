/**
 * F5.47 — «Elm və innovasiya» səhifələri sağ panelli şablonda (layout=elm).
 *
 * Məzmun: src/utils/elm-pages-content.ts. BİR DƏFƏ (store `adda-admin` →
 * `elmPages:v1`), bootstrap-da, portu bloklamadan — «Elm» menyusundan
 * (`elmMenu:v1`) SONRA, təkrarlardan (`dedupe:v2`) ƏVVƏL.
 * Qayda F5.45/F5.46-dakı kimidir (tehsil-pages.ts):
 *
 *   1. Səhifələr: yoxdursa yaradılır (qrantlar); varsa və 9 oktyabr 2026-dan
 *      sonra redaktə olunmayıbsa yenidən qurulur (köhnə başlıq/mətn store-da
 *      `elmPages:backup:<slug>:<locale>`), sonra dərc olunur. Redaktor sonradan
 *      dəyişibsə həmin dil TOXUNULMUR — logda xəbərdarlıq.
 *   2. Köhnə menyunun yer tutan mövzuları yeni səhifələrin içindədir (elmi
 *      siyasət → ana səhifə; əməkdaşların nəşrləri → Elm Portalı; tərəfdaş
 *      kitabxanalar → kitabxana; tədbirlər təqvimi, dənizçilik konfransları,
 *      seminarlar → «Elmi konfranslar»): «Məsul redaktorlar»-da redaktor təyin
 *      olunmayıbsa sətir silinir, təyin olunubsa qalır («Menyuda yoxdur»).
 */
import type { Core } from '@strapi/strapi';
import type { PageLocaleSeed } from './qebul-pages-content';
import { ELM_PAGES, type ElmPageSeed } from './elm-pages-content';

type Row = Record<string, unknown>;

const MARKER = 'elmPages:v1';
const PAGE_UID = 'api::page.page';
const OWNER_UID = 'api::page-owner.page-owner';
const LAYOUT = 'elm';

/** Bu tarixdən sonra redaktə olunan dilə toxunulmur (məzmun bu günə qədər yoxlanılıb). */
const REVIEWED_UNTIL = Date.parse('2026-10-09T23:59:59Z');

/** Köhnə menyunun «hazırlanır» mövzuları — yeni səhifələrin içindədir. */
const COVERED_PENDING = [
  'page:elmi-siyaset',
  'page:emekdaslarin-nesrleri',
  'page:terefdas-kitabxanalar-ve-elmi-bazalar',
  'page:elmi-tedbirler-teqvimi',
  'page:beynelxalq-denizcilik-konfranslari',
  'page:sahevi-seminarlar-ve-telimler',
];

interface Docs {
  findFirst: (a: Row) => Promise<Row | null>;
  findOne: (a: Row) => Promise<Row | null>;
  create: (a: Row) => Promise<Row>;
  update: (a: Row) => Promise<Row>;
  publish: (a: Row) => Promise<unknown>;
}

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const time = (v: unknown): number => (typeof v === 'string' || v instanceof Date ? new Date(v as string).getTime() : 0);

function localeData(seed: ElmPageSeed, loc: PageLocaleSeed): Row {
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

  for (const seed of ELM_PAGES) {
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
      await backup(strapi, `elmPages:backup:${seed.slug}:az`, {
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
        await backup(strapi, `elmPages:backup:${seed.slug}:${lang}`, {
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

/** Köhnə menyunun yer tutan mövzuları: redaktor təyin olunmayıbsa «Məsul redaktorlar» sətri silinir. */
async function dropCoveredPending(strapi: Core.Strapi): Promise<{ dropped: number; kept: string[] }> {
  const q = strapi.db.query(OWNER_UID as never) as unknown as {
    findMany: (a: Row) => Promise<Row[]>;
    delete: (a: Row) => Promise<unknown>;
  };
  const rows = await q.findMany({ where: { key: { $in: COVERED_PENDING } } });
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

export async function applyElmPagesV1(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: MARKER })) === true) return;

  const pages = await writePages(strapi);
  const pending = await dropCoveredPending(strapi).catch((e: Error) => {
    strapi.log.warn('[elm] F5.47: gözləyən sətirlər silinmədi: ' + e.message);
    return { dropped: 0, kept: [] as string[] };
  });

  await store.set({ key: MARKER, value: true });
  strapi.log.info(
    `[elm] F5.47: səhifələr — yaradıldı ${pages.created.length}, yenidən quruldu ${pages.rebuilt.length}, toxunulmadı ${pages.skipped.length}; ` +
      `«Məsul redaktorlar»-dan çıxan gözləyən sətir: ${pending.dropped}` +
      (pending.kept.length ? ` (redaktoru olduğu üçün qalan: ${pending.kept.join(', ')})` : '') +
      '.',
  );
  if (pages.skipped.length) {
    strapi.log.warn('[elm] F5.47: toxunulmadı — ' + pages.skipped.join('; ') + '. Yeni mətn src/utils/elm-pages-content.ts-dədir.');
  }
}
