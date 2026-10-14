/**
 * F5.50 — ana səhifə admində: tək tip `api::home-page.home-page`
 * («3. Sayt — Ana səhifə»). Dilsizdir (org-block kimi): hər mətn sahəsinin
 * az əsası + En/Ru variantı; boş variantda sayt az mətni göstərir.
 *
 *   heroSlides  — hero slaydları (şəkil, üst yazı, başlıq «*vurğu*», mətn, düymə);
 *   facts       — «Niyə məhz ADDA» sübut kartları (rəqəm, vahid, başlıq, cümlə, mənbə səhifəsi);
 *   campusCards — «Kampus həyatı» blokunun 3 foto kartı;
 *   quote*      — sitat bloku (F5.51: əvvəlki dizayn qaytarıldı, video slayder
 *                 silindi): mətn, müəllif, fon şəkli (`quoteImage`), video
 *                 (`quoteVideo` — YouTube, və ya `quoteVideoFile` — yüklənmiş mp4),
 *                 düymənin mətni (`quoteCta`).
 *
 * applyHomePageV1: BİR DƏFƏ (store `adda-admin` → `homePage:v1`), qeyd boşdursa
 * home-page-content.ts-dəki defoltları yazır. Şəkillər media kitabxanasında
 * URL ilə axtarılır (prod-da xəbər arxivinin faylları var) — tapılan bağlanır,
 * tapılmayan boş qalır və Next.js eyni URL-i ehtiyatdan götürür. Admin artıq
 * nəsə yazıbsa toxunulmur.
 *
 * applyHomeQuoteV1 (F5.51): BİR DƏFƏ (`homeQuote:v1`) — video və fayl boşdursa
 * Akademiyanın rəsmi filmini, düymənin mətni boşdursa «ADDA-nı yaşa» yazır.
 *
 * placeHomeFields: komponent formaları (`homeLayout:v1`) və tipin forması
 * (`homeLayout:v2`, F5.51 sahələri) az/en/ru üçlüyü bir sətirdə olacaq şəkildə;
 * bağlı sətrin adı başlıqdır. Admin sahə dəstini dəyişibsə toxunulmur.
 */
import type { Core } from '@strapi/strapi';
import {
  HOME_CAMPUS,
  HOME_FACTS,
  HOME_QUOTE,
  HOME_QUOTE_CTA,
  HOME_QUOTE_VIDEO,
  HOME_SLIDES,
  type L3,
} from './home-page-content';

type Row = Record<string, unknown>;
type Cell = { name: string; size: number };
type Conf = { settings: Row; metadatas: Row; layouts: { edit: Cell[][] } & Row };

const UID = 'api::home-page.home-page';
const MARKER = 'homePage:v1';
const QUOTE_MARKER = 'homeQuote:v1';
const LAYOUT_MARKER = 'homeLayout:v1';
const LAYOUT_MARKER_V2 = 'homeLayout:v2';
const LISTS = ['heroSlides', 'facts', 'campusCards'] as const;
const TEXTS = ['quote', 'quoteAttr', 'quoteVideo'] as const;

interface SingleDocs {
  findFirst: (a?: Row) => Promise<Row | null>;
  create: (a: Row) => Promise<Row>;
  update: (a: Row) => Promise<Row>;
}

/** `name`, `nameEn`, `nameRu` sahələri. */
function l3(name: string, v: L3): Row {
  return { [name]: v.az, [name + 'En']: v.en, [name + 'Ru']: v.ru };
}

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

export async function applyHomePageV1(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: MARKER })) === true) return;

  const docs = strapi.documents(UID as never) as unknown as SingleDocs;
  const cur = await docs.findFirst({ populate: [...LISTS] });
  const filled =
    LISTS.some((k) => Array.isArray(cur?.[k]) && (cur?.[k] as unknown[]).length) ||
    TEXTS.some((k) => typeof cur?.[k] === 'string' && (cur?.[k] as string).trim());
  if (filled) {
    await store.set({ key: MARKER, value: true });
    strapi.log.info('[home] F5.50: «Ana səhifə» artıq doludur — toxunulmadı.');
    return;
  }

  const files = strapi.db.query('plugin::upload.file');
  let linked = 0;
  let wanted = 0;
  const image = async (url: string): Promise<number | null> => {
    wanted++;
    const f = (await files.findOne({ where: { url }, select: ['id'] })) as { id?: number } | null;
    if (f?.id) linked++;
    return f?.id ?? null;
  };

  const heroSlides: Row[] = [];
  for (const s of HOME_SLIDES) {
    heroSlides.push({
      image: await image(s.image),
      ...l3('kicker', s.kicker),
      ...l3('title', s.title),
      ...l3('lead', s.lead),
      ...l3('ctaLabel', s.cta),
      ctaUrl: s.url,
      hidden: false,
    });
  }
  const campusCards: Row[] = [];
  for (const c of HOME_CAMPUS) {
    campusCards.push({ image: await image(c.image), ...l3('chip', c.chip), ...l3('title', c.title), ...l3('note', c.note), url: c.url });
  }
  const data: Row = {
    heroSlides,
    facts: HOME_FACTS.map((f) => ({
      value: f.value,
      ...l3('unit', f.unit),
      ...l3('title', f.title),
      ...l3('desc', f.desc),
      url: f.url,
      hidden: false,
    })),
    campusCards,
    ...l3('quote', HOME_QUOTE.text),
    ...l3('quoteAttr', HOME_QUOTE.attr),
    quoteVideo: HOME_QUOTE_VIDEO,
    ...l3('quoteCta', HOME_QUOTE_CTA),
  };

  if (cur?.documentId) await docs.update({ documentId: cur.documentId, data });
  else await docs.create({ data });

  await store.set({ key: MARKER, value: true });
  strapi.log.info(
    `[home] F5.50: «3. Sayt — Ana səhifə» yazıldı: ${heroSlides.length} slayd, ${HOME_FACTS.length} fakt, ` +
      `${campusCards.length} kampus kartı, sitat + video; arxiv şəkli bağlandı: ${linked}/${wanted}` +
      (linked < wanted ? ' (tapılmayanları sayt ehtiyatdan göstərir — admində yükləyə bilərsiniz).' : '.'),
  );
}

/** F5.51 — F5.50-də yazılmış qeyddə video slayder idi; sitat blokunun videosu və düyməsi boşdursa defolt. */
export async function applyHomeQuoteV1(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: QUOTE_MARKER })) === true) return;
  const docs = strapi.documents(UID as never) as unknown as SingleDocs;
  const cur = await docs.findFirst({ populate: ['quoteVideoFile'] });
  if (!cur?.documentId) {
    // Qeyd yoxdursa applyHomePageV1 onsuz da defoltla yaradır.
    await store.set({ key: QUOTE_MARKER, value: true });
    return;
  }
  const data: Row = {};
  const notes: string[] = [];
  if (!str(cur.quoteVideo) && !cur.quoteVideoFile) {
    data.quoteVideo = HOME_QUOTE_VIDEO;
    notes.push('video: Akademiyanın filmi');
  }
  if (!str(cur.quoteCta) && !str(cur.quoteCtaEn) && !str(cur.quoteCtaRu)) {
    Object.assign(data, l3('quoteCta', HOME_QUOTE_CTA));
    notes.push('düymə: «ADDA-nı yaşa»');
  }
  if (Object.keys(data).length) await docs.update({ documentId: cur.documentId, data });
  await store.set({ key: QUOTE_MARKER, value: true });
  strapi.log.info(`[home] F5.51: sitat bloku — ${notes.length ? notes.join(', ') : 'admində artıq doludur, toxunulmadı'}.`);
}

// ── Admin formasının düzümü ─────────────────────────────────────────────────
const tri = (name: string): Cell[] => [
  { name, size: 4 },
  { name: name + 'En', size: 4 },
  { name: name + 'Ru', size: 4 },
];

const COMP_LAYOUTS: Record<string, { main: string; edit: Cell[][] }> = {
  'home.slide': {
    main: 'title',
    edit: [[{ name: 'image', size: 6 }, { name: 'hidden', size: 4 }], tri('kicker'), tri('title'), tri('lead'), tri('ctaLabel'), [{ name: 'ctaUrl', size: 8 }]],
  },
  'home.fact': {
    main: 'title',
    edit: [[{ name: 'value', size: 4 }, { name: 'url', size: 6 }], tri('unit'), tri('title'), tri('desc'), [{ name: 'hidden', size: 4 }]],
  },
  'home.photo': {
    main: 'title',
    edit: [[{ name: 'image', size: 6 }, { name: 'url', size: 6 }], tri('chip'), tri('title'), tri('note')],
  },
};

/** Tipin forması (F5.51): sitat bloku öz sahələri ilə bir yerdə. */
const CT_LAYOUT: Cell[][] = [
  [{ name: 'heroSlides', size: 12 }],
  [{ name: 'facts', size: 12 }],
  [{ name: 'campusCards', size: 12 }],
  tri('quote'),
  tri('quoteAttr'),
  [{ name: 'quoteImage', size: 6 }, { name: 'quoteVideoFile', size: 6 }],
  [{ name: 'quoteVideo', size: 8 }],
  tri('quoteCta'),
];

export async function placeHomeFields(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  const v1 = (await store.get({ key: LAYOUT_MARKER })) === true;
  const v2 = (await store.get({ key: LAYOUT_MARKER_V2 })) === true;
  if (v1 && v2) return;
  const done: string[] = [];

  if (!v1) {
    const comps = strapi.plugin('content-manager').service('components') as unknown as {
      findComponent: (uid: string) => { uid: string } | null | undefined;
      findConfiguration: (c: { uid: string }) => Promise<Conf>;
      updateConfiguration: (c: { uid: string }, conf: Conf) => Promise<unknown>;
    };
    for (const [uid, want] of Object.entries(COMP_LAYOUTS)) {
      const c = comps.findComponent(uid);
      if (!c) continue;
      const conf = await comps.findConfiguration(c);
      const have = (conf.layouts?.edit ?? []).flat().map((x) => x.name);
      const need = want.edit.flat().map((x) => x.name);
      // Yalnız eyni sahə dəsti (yeni komponent) — admin sahə əlavə edib/silibsə toxunulmur.
      if (have.length !== need.length || need.some((n) => !have.includes(n))) continue;
      conf.layouts.edit = want.edit;
      // Bağlı sətrin adı: Strapi defoltu ilk mətn sahəsidir (kicker, value, chip) — başlıq daha aydındır.
      const attrs = (strapi.components as unknown as Record<string, { attributes?: Record<string, { type?: string }> }>)[uid]?.attributes ?? {};
      const firstText = Object.keys(attrs).find((k) => attrs[k]?.type === 'string');
      const main = conf.settings?.mainField;
      if (!main || main === 'id' || main === firstText) conf.settings = { ...conf.settings, mainField: want.main };
      await comps.updateConfiguration(c, { settings: conf.settings, metadatas: conf.metadatas, layouts: conf.layouts });
      done.push(uid);
    }
  }

  // Formanın başlığı: Strapi defoltu ilk mətn sahəsidir (sitatın müəllifi) — «id»
  // olanda tək tipin adı («3. Sayt — Ana səhifə») göstərilir.
  const cts = strapi.plugin('content-manager').service('content-types') as unknown as {
    findContentType: (uid: string) => { uid: string } | null;
    findConfiguration: (ct: { uid: string }) => Promise<Conf>;
    updateConfiguration: (ct: { uid: string }, conf: Conf) => Promise<unknown>;
  };
  const ct = cts.findContentType(UID);
  if (ct) {
    const conf = await cts.findConfiguration(ct);
    let changed = false;
    const main = conf.settings?.mainField;
    if (!main || main === 'quoteAttr') {
      conf.settings = { ...conf.settings, mainField: 'id' };
      changed = true;
    }
    // Yalnız defolt sahə dəsti olanda (admin sahə əlavə edib/silməyibsə).
    const have = (conf.layouts?.edit ?? []).flat().map((x) => x.name);
    const need = CT_LAYOUT.flat().map((x) => x.name);
    if (have.length === need.length && need.every((n) => have.includes(n))) {
      conf.layouts.edit = CT_LAYOUT;
      changed = true;
    }
    if (changed) {
      await cts.updateConfiguration(ct, { settings: conf.settings, metadatas: conf.metadatas, layouts: conf.layouts });
      done.push(UID);
    }
  }
  if (!v1) await store.set({ key: LAYOUT_MARKER, value: true });
  await store.set({ key: LAYOUT_MARKER_V2, value: true });
  strapi.log.info(`[home] F5.50/F5.51: «Ana səhifə» formaları düzüldü: ${done.length ? done.join(', ') : 'toxunulmadı'}.`);
}
