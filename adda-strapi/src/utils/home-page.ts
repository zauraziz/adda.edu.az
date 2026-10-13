/**
 * F5.50 — ana səhifə admində: tək tip `api::home-page.home-page`
 * («3. Sayt — Ana səhifə»). Dilsizdir (org-block kimi): hər mətn sahəsinin
 * az əsası + En/Ru variantı; boş variantda sayt az mətni göstərir.
 *
 *   heroSlides  — hero slaydları (şəkil, üst yazı, başlıq «*vurğu*», mətn, düymə);
 *   facts       — «Niyə məhz ADDA» sübut kartları (rəqəm, vahid, başlıq, cümlə, mənbə səhifəsi);
 *   campusCards — «Kampus həyatı» blokunun 3 foto kartı;
 *   quote*      — video blokunun sitatı;
 *   videos      — video slayder (YouTube ünvanı və ya ID), videoChannel — kanal keçidi.
 *
 * applyHomePageV1: BİR DƏFƏ (store `adda-admin` → `homePage:v1`), qeyd boşdursa
 * home-page-content.ts-dəki defoltları yazır. Şəkillər media kitabxanasında
 * URL ilə axtarılır (prod-da xəbər arxivinin faylları var) — tapılan bağlanır,
 * tapılmayan boş qalır və Next.js eyni URL-i ehtiyatdan götürür. Admin artıq
 * nəsə yazıbsa toxunulmur.
 *
 * placeHomeFields: BİR DƏFƏ (`homeLayout:v1`) komponent formalarını az/en/ru
 * üçlüyü bir sətirdə olacaq şəkildə düzür və bağlı sətrin adını başlıq edir.
 * Admin düzümü dəyişibsə (sahə sırası defolt deyil) toxunulmur.
 */
import type { Core } from '@strapi/strapi';
import {
  HOME_CAMPUS,
  HOME_FACTS,
  HOME_QUOTE,
  HOME_SLIDES,
  HOME_VIDEO_CHANNEL,
  HOME_VIDEOS,
  type L3,
} from './home-page-content';

type Row = Record<string, unknown>;
type Cell = { name: string; size: number };
type Conf = { settings: Row; metadatas: Row; layouts: { edit: Cell[][] } & Row };

const UID = 'api::home-page.home-page';
const MARKER = 'homePage:v1';
const LAYOUT_MARKER = 'homeLayout:v1';
const LISTS = ['heroSlides', 'facts', 'campusCards', 'videos'] as const;
const TEXTS = ['quote', 'quoteAttr', 'videoChannel'] as const;

interface SingleDocs {
  findFirst: (a?: Row) => Promise<Row | null>;
  create: (a: Row) => Promise<Row>;
  update: (a: Row) => Promise<Row>;
}

/** `name`, `nameEn`, `nameRu` sahələri. */
function l3(name: string, v: L3): Row {
  return { [name]: v.az, [name + 'En']: v.en, [name + 'Ru']: v.ru };
}

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
    videos: HOME_VIDEOS.map((v) => ({ youtube: 'https://www.youtube.com/watch?v=' + v.youtube, ...l3('title', v.title), hidden: false })),
    videoChannel: HOME_VIDEO_CHANNEL,
  };

  if (cur?.documentId) await docs.update({ documentId: cur.documentId, data });
  else await docs.create({ data });

  await store.set({ key: MARKER, value: true });
  strapi.log.info(
    `[home] F5.50: «3. Sayt — Ana səhifə» yazıldı: ${heroSlides.length} slayd, ${HOME_FACTS.length} fakt, ` +
      `${campusCards.length} kampus kartı, ${HOME_VIDEOS.length} video; arxiv şəkli bağlandı: ${linked}/${wanted}` +
      (linked < wanted ? ' (tapılmayanları sayt ehtiyatdan göstərir — admində yükləyə bilərsiniz).' : '.'),
  );
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
  'home.video': {
    main: 'title',
    edit: [[{ name: 'youtube', size: 8 }, { name: 'hidden', size: 4 }], tri('title')],
  },
};

export async function placeHomeFields(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: LAYOUT_MARKER })) === true) return;
  const comps = strapi.plugin('content-manager').service('components') as unknown as {
    findComponent: (uid: string) => { uid: string } | null | undefined;
    findConfiguration: (c: { uid: string }) => Promise<Conf>;
    updateConfiguration: (c: { uid: string }, conf: Conf) => Promise<unknown>;
  };
  const done: string[] = [];
  for (const [uid, want] of Object.entries(COMP_LAYOUTS)) {
    const c = comps.findComponent(uid);
    if (!c) continue;
    const conf = await comps.findConfiguration(c);
    const have = (conf.layouts?.edit ?? []).flat().map((x) => x.name);
    const need = want.edit.flat().map((x) => x.name);
    // Yalnız eyni sahə dəsti (yeni komponent) — admin sahə əlavə edib/silibsə toxunulmur.
    if (have.length !== need.length || need.some((n) => !have.includes(n))) continue;
    conf.layouts.edit = want.edit;
    // Bağlı sətrin adı: Strapi defoltu ilk mətn sahəsidir (kicker, value, chip, youtube) — başlıq daha aydındır.
    const attrs = (strapi.components as unknown as Record<string, { attributes?: Record<string, { type?: string }> }>)[uid]?.attributes ?? {};
    const firstText = Object.keys(attrs).find((k) => attrs[k]?.type === 'string');
    const main = conf.settings?.mainField;
    if (!main || main === 'id' || main === firstText) conf.settings = { ...conf.settings, mainField: want.main };
    await comps.updateConfiguration(c, { settings: conf.settings, metadatas: conf.metadatas, layouts: conf.layouts });
    done.push(uid);
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
    // Sitat sahələri də az/en/ru üçlüyü ilə (yalnız defolt sahə dəsti olanda).
    const want: Cell[][] = [
      [{ name: 'heroSlides', size: 12 }],
      [{ name: 'facts', size: 12 }],
      [{ name: 'campusCards', size: 12 }],
      tri('quote'),
      tri('quoteAttr'),
      [{ name: 'videos', size: 12 }],
      [{ name: 'videoChannel', size: 8 }],
    ];
    const have = (conf.layouts?.edit ?? []).flat().map((x) => x.name);
    const need = want.flat().map((x) => x.name);
    if (have.length === need.length && need.every((n) => have.includes(n))) {
      conf.layouts.edit = want;
      changed = true;
    }
    if (changed) {
      await cts.updateConfiguration(ct, { settings: conf.settings, metadatas: conf.metadatas, layouts: conf.layouts });
      done.push(UID);
    }
  }
  await store.set({ key: LAYOUT_MARKER, value: true });
  strapi.log.info(`[home] F5.50: «Ana səhifə» komponent formaları düzüldü: ${done.length ? done.join(', ') : 'toxunulmadı'}.`);
}
