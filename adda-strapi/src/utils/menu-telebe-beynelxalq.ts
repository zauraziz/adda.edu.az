/**
 * F5.48 — «Tələbə həyatı» və «Beynəlxalq əlaqələr» menyularının yeni quruluşu (v1).
 *
 * Təhlil: layihə sənədi claude/telebe-ve-beynelxalq-menyulari.md. HSE.ru
 * nümunəsi ilə menyu istifadəçinin sualına görə qurulur:
 *   - Tələbə həyatı: «harada yaşayacam, nə qədər pul alacam» → «hansı
 *     təşkilata qoşulum» → «idman, mədəniyyət, tədbirlər». 4 qrup / 15 keçid
 *     (9-u «hazırlanır», başlıq «#») → 3 qrup / 9 keçid, hamısı işləyən
 *     səhifəyə; başlıq → /sehife/telebe-heyati (yeni giriş səhifəsi).
 *   - Beynəlxalq əlaqələr: auditoriyaya görə — tərəfdaşlıq; mobillik və ikili
 *     diplom; əcnəbi tələbələr. 5 qrup / 14 keçid (10-u «hazırlanır», biri
 *     «Elm»dəki konfransların, biri «Qəbul»dakı məzunlar səhifəsinin təkrarı,
 *     biri şöbənin köhnə səhifəsi) → 3 qrup / 9 keçid; başlıq →
 *     /sehife/beynelxalq-emekdasliq.
 *
 * NECƏ İŞLƏYİR (F5.47 menu-elm.ts qaydası):
 *   - BİR DƏFƏ (store `adda-admin` → `telebeMenu:v1`, `beynelxalqMenu:v1`),
 *     bootstrap-da, portu bloklamadan, menyuya yazan digər miqrasiyalardan SONRA.
 *   - YALNIZ kateqoriya hələ köhnə (seed/prod) quruluşdadırsa — admin
 *     dəyişibsə toxunulmur: logda xəbərdarlıq, marker yazılmır.
 *   - Digər kateqoriyalar və footer sütunları komponent id-ləri ilə geri yazılır.
 *   - Footer «Universitet» → «Tələbə həyatı» keçidi yalnız hələ
 *     /hazirlanir/telebe-heyati-dirsə yeni səhifəyə çevrilir.
 *   - Məzmunu olmayan mövzular (psixoloji dəstək, tibb xidməti) menyuya
 *     salınmır, «Məsul redaktorlar»-da «Menyuda yoxdur» kimi gözləyir.
 *
 * Eyni quruluş: seed (src/index.ts → MENU), Next.js lib/menu-fallback.ts.
 * Etiketlərin ru/en tərcüməsi: lib/i18n.ts → MENU_T.
 */
import type { Core } from '@strapi/strapi';
import type { MenuGroupSeed } from './menu-tehsil';

type Row = Record<string, unknown>;

const OWNER_UID = 'api::page-owner.page-owner';
const FOOTER_COLUMN = 'Universitet';

// ── Tələbə həyatı ────────────────────────────────────────────────────────────
const TELEBE_MARKER = 'telebeMenu:v1';
const TELEBE_CATEGORY = 'Tələbə həyatı';
/** Başlıq və mega menyunun «Ətraflı» düyməsi — bölmənin ana səhifəsi. */
export const TELEBE_CATEGORY_URL = '/sehife/telebe-heyati';

/** F5.47-yə qədərki quruluş (seed və prod eyni) — yalnız bu halda yenilənir. */
export const TELEBE_MENU_OLD: MenuGroupSeed[] = [
  {
    title: 'Tələbə təşkilatları',
    links: [
      { label: 'Tələbə Gənclər Təşkilatı (TGK)', url: '/sehife/telebe-gencler-teskilati' },
      { label: 'Tələbə Həmkarlar İttifaqı (THİK)', url: '/sehife/telebe-hemkarlar-ittifaqi-komitesi' },
      { label: 'Tələbə Elmi Cəmiyyəti (TEC)', url: '/sehife/telebe-elmi-cemiyyeti' },
      { label: 'Könüllülük hərəkatı', url: '/hazirlanir/konulluluk-herekati' },
    ],
  },
  {
    title: 'Yaşayış və rifah',
    links: [
      { label: 'Tələbə yataqxanası', url: '/sehife/yataqxana' },
      { label: 'Onlayn müraciət və yerləşdirmə', url: '/hazirlanir/onlayn-muraciet-ve-yerlesdirme' },
      { label: 'Sosial təminat və maddi yardım', url: '/sehife/sosial-teminat-ve-maddi-yardim' },
      { label: 'Təqaüd proqramları', url: '/hazirlanir/teqaud-proqramlari' },
      { label: 'Psixoloji dəstək xidməti', url: '/hazirlanir/psixoloji-destek-xidmeti' },
      { label: 'Tibb xidməti', url: '/hazirlanir/tibb-xidmeti' },
    ],
  },
  {
    title: 'Yaradıcılıq, idman və asudə vaxt',
    links: [
      { label: 'İdman klubları', url: '/sehife/idman' },
      { label: 'Mədəniyyət və yaradıcılıq dərnəkləri', url: '/hazirlanir/medeniyyet-ve-yaradiciliq-dernekleri' },
      { label: 'İntellektual oyun klubları', url: '/hazirlanir/intellektual-oyun-klublari' },
    ],
  },
  {
    title: 'Media və kommunikasiya',
    links: [
      { label: 'Sosial media elçiləri', url: '/hazirlanir/sosial-media-elcileri' },
      { label: 'Tədbirlər təqvimi', url: '/hazirlanir/tedbirler-teqvimi' },
    ],
  },
];

/**
 * v1. «Könüllülük» və maarifləndirmə → giriş səhifəsi; onlayn yerləşdirmə →
 * «Yataqxana»; təqaüd proqramları → «Təqaüd və sosial dəstək»; intellektual
 * oyunlar → «Mədəniyyət və yaradıcılıq»; tədbirlər təqvimi → /tedbirler
 * (canlı təqvim). «Sosial media elçiləri» haqqında məlumat yoxdur.
 */
export const TELEBE_MENU_V1: MenuGroupSeed[] = [
  {
    title: 'Tələbə üçün',
    links: [
      { label: 'Ümumi baxış', url: TELEBE_CATEGORY_URL },
      { label: 'Yataqxana', url: '/sehife/yataqxana' },
      { label: 'Təqaüd və sosial dəstək', url: '/sehife/sosial-teminat-ve-maddi-yardim' },
    ],
  },
  {
    title: 'Tələbə təşkilatları',
    links: [
      { label: 'Tələbə Gənclər Təşkilatı', url: '/sehife/telebe-gencler-teskilati' },
      { label: 'Tələbə Həmkarlar İttifaqı Komitəsi', url: '/sehife/telebe-hemkarlar-ittifaqi-komitesi' },
      { label: 'Tələbə Elmi Cəmiyyəti', url: '/sehife/telebe-elmi-cemiyyeti' },
    ],
  },
  {
    title: 'İdman, mədəniyyət və tədbirlər',
    links: [
      { label: 'İdman', url: '/sehife/idman' },
      { label: 'Mədəniyyət və yaradıcılıq', url: '/sehife/medeniyyet-ve-yaradiciliq-dernekleri' },
      { label: 'Tədbirlər təqvimi', url: '/tedbirler' },
    ],
  },
];

/** Məzmunu yazılanda menyuya (əl ilə və ya yeni miqrasiya ilə) əlavə olunacaq mövzular. */
export const TELEBE_PENDING_PAGES = [
  { slug: 'psixoloji-destek-xidmeti', label: 'Psixoloji dəstək xidməti' },
  { slug: 'tibb-xidmeti', label: 'Tibb xidməti' },
];

/** Footer «Universitet» → «Tələbə həyatı»: köhnə ünvan → yeni. */
const TELEBE_FOOTER_OLD_URL = '/hazirlanir/telebe-heyati';

// ── Beynəlxalq əlaqələr ──────────────────────────────────────────────────────
const BEYNELXALQ_MARKER = 'beynelxalqMenu:v1';
const BEYNELXALQ_CATEGORY = 'Beynəlxalq əlaqələr';
export const BEYNELXALQ_CATEGORY_URL = '/sehife/beynelxalq-emekdasliq';

export const BEYNELXALQ_MENU_OLD: MenuGroupSeed[] = [
  {
    title: 'Akademik tərəfdaşlıq və ikili diplom',
    links: [
      { label: 'İkili diplom layihələri', url: '/hazirlanir/ikili-diplom-layiheleri' },
      { label: 'Akademik tərəfdaşlar', url: '/sehife/akademik-terefdaslar' },
      { label: 'Beynəlxalq əlaqələr qrupu', url: '/sehife/beynelxalq-elaqeler-qrupu' },
    ],
  },
  {
    title: 'Mobillik proqramları',
    links: [
      { label: 'Erasmus+ və Mevlana', url: '/hazirlanir/erasmus-ve-mevlana' },
      { label: 'Müəllim mübadiləsi', url: '/hazirlanir/muellim-mubadilesi' },
      { label: 'Yay məktəbləri', url: '/hazirlanir/yay-mektebleri' },
    ],
  },
  {
    title: 'Beynəlxalq assosiasiyalar və təşkilatlar',
    links: [
      { label: 'IAMU', url: '/hazirlanir/iamu' },
      { label: 'IMO', url: '/hazirlanir/imo' },
      { label: 'BSAMI', url: '/hazirlanir/bsami' },
      { label: 'Digər təşkilatlar', url: '/hazirlanir/diger-teskilatlar' },
    ],
  },
  {
    title: 'Xarici gəmiçilik şirkətləri',
    links: [
      { label: 'Kadet proqramları', url: '/hazirlanir/kadet-proqramlari' },
      { label: 'Məzunların işlə təminatı', url: '/sehife/mezunlarin-isle-teminati' },
    ],
  },
  {
    title: 'Beynəlxalq elmi araşdırmalar',
    links: [
      { label: 'Birgə elmi konfranslar', url: '/sehife/elmi-konfranslar' },
      { label: 'Qrant layihələri', url: '/hazirlanir/qrant-layiheleri' },
    ],
  },
];

/**
 * v1. Üzvlüklər (IAMU, IMO və b.) → ana səhifə; müəllim mübadiləsi, yay
 * məktəbləri, kadet təcrübəsi → «Mübadilə və Erasmus+»; qrant layihələri →
 * «Qrantlar və müsabiqələr» (Elm); «Beynəlxalq əlaqələr qrupu» → şöbənin bölmə
 * səhifəsi (dedupe:v3); konfranslar «Elm»də, məzunlar «Qəbul»da qalır.
 */
export const BEYNELXALQ_MENU_V1: MenuGroupSeed[] = [
  {
    title: 'Əməkdaşlıq',
    links: [
      { label: 'Ümumi baxış', url: BEYNELXALQ_CATEGORY_URL },
      { label: 'Akademik tərəfdaşlar', url: '/sehife/akademik-terefdaslar' },
      { label: 'Beynəlxalq əlaqələr şöbəsi', url: '/struktur/elmi-tedqiqat-ve-beynelxalq-elaqeler-sobesi' },
    ],
  },
  {
    title: 'Mobillik və ikili diplom',
    links: [
      { label: 'Mübadilə və Erasmus+', url: '/sehife/mobillik-ve-mubadile' },
      { label: 'İkili diplom proqramları', url: '/sehife/ikili-diplom-layiheleri' },
      { label: 'İxtisasartırma və xaricdə təhsil', url: '/sehife/xaricde-tehsil-ve-ixtisasartirma' },
    ],
  },
  {
    title: 'Əcnəbi tələbələr',
    links: [
      { label: 'Qəbul qaydaları və təhsil haqqı', url: '/sehife/ecnebi-telebelerin-qebulu-qaydalari' },
      { label: 'Əcnəbi tələbələr üçün bələdçi', url: '/sehife/ecnebi-telebelerin-tehsili' },
      { label: 'İngilis dilində tədris', url: '/sehife/ingilis-dilinde-tedris' },
    ],
  },
];

// ── Ümumi köməkçilər ─────────────────────────────────────────────────────────
const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

function groupSig(groups: Row[] | MenuGroupSeed[]): string {
  return JSON.stringify(
    (groups as Row[]).map((g) => [str(g.title), ((g.links as Row[]) ?? []).map((l) => [str(l.label), str(l.url)])]),
  );
}

/** Mövcud komponenti id ilə geri yaz (nav.category/group/link). */
function keepCategory(c: Row): Row {
  return {
    id: c.id,
    label: c.label,
    order: c.order,
    url: c.url,
    groups: ((c.groups as Row[]) ?? []).map((g) => ({
      id: g.id,
      title: g.title,
      links: ((g.links as Row[]) ?? []).map((l) => ({ id: l.id, label: l.label, url: l.url })),
    })),
  };
}
function keepFooterCol(c: Row): Row {
  return { id: c.id, title: c.title, links: ((c.links as Row[]) ?? []).map((l) => ({ id: l.id, label: l.label, url: l.url })) };
}

/** Gözləyən mövzular «Məsul redaktorlar»-da görünsün (təyinatsız sətir). */
async function ensurePendingPages(strapi: Core.Strapi, pages: { slug: string; label: string }[]): Promise<number> {
  const repo = strapi.db.query(OWNER_UID as never) as unknown as {
    findOne: (a: Row) => Promise<Row | null>;
    create: (a: Row) => Promise<Row>;
  };
  let added = 0;
  for (const p of pages) {
    const key = `page:${p.slug}`;
    if (await repo.findOne({ where: { key } })) continue;
    await repo.create({ data: { key, path: `/sehife/${p.slug}`, label: p.label, editorId: null } });
    added++;
  }
  return added;
}

interface CategoryJob {
  marker: string;
  tag: string;
  category: string;
  url: string;
  oldGroups: MenuGroupSeed[];
  v1Groups: MenuGroupSeed[];
  pending: { slug: string; label: string }[];
  /** Footer «Universitet» sütununda dəyişən keçid (köhnə ünvan → yeni). */
  footer?: { label: string; from: string; to: string };
  hint: string;
}

async function applyCategoryV1(strapi: Core.Strapi, job: CategoryJob): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: job.marker })) === true) return;

  const docs = strapi.documents('api::menu.menu' as never) as unknown as {
    findFirst: (a: Row) => Promise<Row | null>;
    update: (a: Row) => Promise<Row>;
  };
  const menu = await docs.findFirst({
    populate: {
      esasMenyu: { populate: { groups: { populate: { links: true } } } },
      footerMenyusu: { populate: { links: true } },
    },
  });
  if (!menu) {
    strapi.log.warn(`${job.tag}: menyu tapılmadı — «${job.category}» yenilənmədi.`);
    return;
  }
  const cats = ((menu.esasMenyu as Row[]) ?? []).slice();
  const idx = cats.findIndex((c) => str(c.label) === job.category);
  if (idx < 0) {
    strapi.log.warn(`${job.tag}: «${job.category}» kateqoriyası yoxdur — toxunulmadı.`);
    return;
  }
  const groups = (cats[idx].groups as Row[]) ?? [];
  const sig = groupSig(groups);
  const isV1 = sig === groupSig(job.v1Groups);
  if (!isV1 && sig !== groupSig(job.oldGroups)) {
    strapi.log.warn(
      `${job.tag}: «${job.category}» gözlənilən köhnə quruluşda deyil (${groups.map((g) => str(g.title)).join(' | ')}) — toxunulmadı. ` +
        `Admin paneldən əl ilə yeniləyin (Məzmun → 3. Sayt — Menyu): ${job.hint}`,
    );
    return;
  }

  // Footer: yalnız keçid hələ köhnə ünvandadırsa.
  const cols = ((menu.footerMenyusu as Row[]) ?? []).slice();
  let footerNote = 'dəyişmir';
  let footerNext: Row[] | null = null;
  if (job.footer) {
    const f = job.footer;
    const cIdx = cols.findIndex((c) => str(c.title) === FOOTER_COLUMN);
    const links = cIdx >= 0 ? ((cols[cIdx].links as Row[]) ?? []) : [];
    const lIdx = links.findIndex((l) => str(l.label) === f.label && str(l.url) === f.from);
    if (lIdx >= 0) {
      footerNext = cols.map((c, i) =>
        i === cIdx
          ? { id: c.id, title: c.title, links: links.map((l, j) => ({ id: l.id, label: l.label, url: j === lIdx ? f.to : l.url })) }
          : keepFooterCol(c),
      );
      footerNote = `«${f.label}» → ${f.to}`;
    } else {
      footerNote = links.some((l) => str(l.label) === f.label && str(l.url) === f.to)
        ? 'artıq yenidir'
        : 'keçid əl ilə dəyişilib və ya yoxdur — toxunulmadı';
    }
  }

  const data: Row = {};
  if (!isV1) {
    data.esasMenyu = cats.map((c, i) =>
      i === idx
        ? {
            id: c.id,
            label: c.label,
            order: c.order,
            url: job.url,
            groups: job.v1Groups.map((g) => ({ title: g.title, links: g.links.map((l) => ({ label: l.label, url: l.url })) })),
          }
        : keepCategory(c),
    );
  }
  if (footerNext) data.footerMenyusu = footerNext;
  if (Object.keys(data).length) await docs.update({ documentId: menu.documentId, data });
  const added = await ensurePendingPages(strapi, job.pending);
  await store.set({ key: job.marker, value: true });

  const oldLinks = job.oldGroups.reduce((n, g) => n + g.links.length, 0);
  const newLinks = job.v1Groups.reduce((n, g) => n + g.links.length, 0);
  strapi.log.info(
    `${job.tag}: «${job.category}» ` +
      (isV1
        ? 'artıq yeni quruluşdadır'
        : `yeniləndi: ${job.oldGroups.length} qrup / ${oldLinks} keçid → ${job.v1Groups.length} qrup / ${newLinks} keçid; başlıq → ${job.url}`) +
      (job.footer ? `; footer: ${footerNote}` : '') +
      (added ? `; ${added} gözləyən mövzu «Məsul redaktorlar»-a əlavə olundu` : '') +
      '.',
  );
}

/** BİR DƏFƏ (`telebeMenu:v1`): «Tələbə həyatı» 3 qrup / 9 keçid, footer keçidi. */
export async function applyTelebeMenuV1(strapi: Core.Strapi): Promise<void> {
  await applyCategoryV1(strapi, {
    marker: TELEBE_MARKER,
    tag: '[menu] F5.48',
    category: TELEBE_CATEGORY,
    url: TELEBE_CATEGORY_URL,
    oldGroups: TELEBE_MENU_OLD,
    v1Groups: TELEBE_MENU_V1,
    pending: TELEBE_PENDING_PAGES,
    footer: { label: TELEBE_CATEGORY, from: TELEBE_FOOTER_OLD_URL, to: TELEBE_CATEGORY_URL },
    hint: '3 qrup — Tələbə üçün; Tələbə təşkilatları; İdman, mədəniyyət və tədbirlər (bax src/utils/menu-telebe-beynelxalq.ts TELEBE_MENU_V1).',
  });
}

/** BİR DƏFƏ (`beynelxalqMenu:v1`): «Beynəlxalq əlaqələr» 3 qrup / 9 keçid. */
export async function applyBeynelxalqMenuV1(strapi: Core.Strapi): Promise<void> {
  await applyCategoryV1(strapi, {
    marker: BEYNELXALQ_MARKER,
    tag: '[menu] F5.48',
    category: BEYNELXALQ_CATEGORY,
    url: BEYNELXALQ_CATEGORY_URL,
    oldGroups: BEYNELXALQ_MENU_OLD,
    v1Groups: BEYNELXALQ_MENU_V1,
    pending: [],
    hint: '3 qrup — Əməkdaşlıq; Mobillik və ikili diplom; Əcnəbi tələbələr (bax src/utils/menu-telebe-beynelxalq.ts BEYNELXALQ_MENU_V1).',
  });
}
