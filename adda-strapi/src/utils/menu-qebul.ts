/**
 * F5.44 — «Qəbul» menyusunun yeni quruluşu (1-ci mərhələ).
 *
 * Təklif: layihə sənədi claude/qebul-menyusu-optimallasdirma.md. Menyu
 * təşkilati bölgü ilə deyil, abituriyentin yolu ilə qurulur: pilləni seçir →
 * ixtisası seçir (keçid balı, yer sayı, haqq) → əcnəbilər üçün ayrıca qrup →
 * tanışlıq və əlaqə. 16 keçid (9-u boş, 2-si praktik boş) → 12 keçid, hamısı
 * işləyən səhifəyə; başlıq abituriyent bələdçisinə aparır.
 *
 * NECƏ İŞLƏYİR:
 *   - BİR DƏFƏ (store `adda-admin` → `qebulMenu:v1`), bootstrap-da, portu
 *     bloklamadan. F5.43-ün keçid düzəlişindən (`dedupe:v1`) SONRA zəncirdə
 *     işləyir: ikisi də menyu komponentlərinə yazır, eyni anda işləsələr
 *     sonuncu yazan o birinin dəyişikliyini geri qaytarardı.
 *   - YALNIZ «Qəbul» hələ köhnə quruluşdadırsa (OLD_GROUPS). Admin onu əl ilə
 *     dəyişibsə toxunulmur: logda xəbərdarlıq qalır, marker yazılmır.
 *   - Footer-in «Qəbul» sütunu da — yalnız köhnə 4 keçiddirsə.
 *   - Digər kateqoriya və sütunlar komponent id-ləri ilə olduğu kimi geri yazılır.
 *   - 2-ci və 3-cü mərhələnin səhifələri menyuya salınmır (boş keçid olmasın),
 *     «Məsul redaktorlar»-da «Menyuda yoxdur» kimi gözləyir: baş admin redaktor
 *     təyin edir, redaktor «Məzmun əlavə et» ilə səhifəni yaradır.
 *
 * F5.45 — v2 (`qebulMenu:v2`, aşağıda): keçidlər sağ panelli qəbul
 * səhifələrinə (src/utils/qebul-pages.ts) aparır; «Tanışlıq və əlaqə» —
 * «Açıq qapı günləri» və «Onlayn müraciət». v1 F5.44-də prod-da işləyib —
 * v2 onun quruluşunu (və ya hələ köhnəsini) tanıyıb dəyişir.
 *
 * Eyni quruluş (v2): seed (src/index.ts → MENU «Qəbul», footer «Qəbul»),
 * Next.js lib/menu-fallback.ts. Etiketlərin ru/en tərcüməsi: lib/i18n.ts → MENU_T.
 */
import type { Core } from '@strapi/strapi';

type Row = Record<string, unknown>;

const MARKER = 'qebulMenu:v1';
const CATEGORY = 'Qəbul';
const OWNER_UID = 'api::page-owner.page-owner';

/** Prod və seed-dəki köhnə quruluş — yalnız bu halda yenilənir. */
const OLD_GROUPS = ['Akademik səviyyələr üzrə qəbul', 'Əlavə təhsil', 'Əcnəbi tələbə qəbulu', 'Faydalı məlumatlar və keçidlər'];
const OLD_FOOTER = ['Bakalavr qəbulu', 'Magistratura qəbulu', 'Onlayn müraciət', 'Qəbul şərtləri'];

export interface MenuLinkSeed {
  label: string;
  url: string;
}
export interface MenuGroupSeed {
  title: string;
  links: MenuLinkSeed[];
}

/** Başlıq və mega menyunun «Ətraflı» düyməsi — abituriyent bələdçisi (əvvəl «#»). */
export const QEBUL_CATEGORY_URL = '/bunlar-ucun/abituriyentler';

/** Kataloq keçidləri (`?tab=`, `?dil=`) Next.js ProgramDirectoryIsland-da oxunur (F5.40). */
export const QEBUL_MENU_V1: MenuGroupSeed[] = [
  {
    title: 'Pillələr üzrə qəbul',
    links: [
      { label: 'Subbakalavr (kollec)', url: '/ixtisaslar?tab=subbakalavr' },
      { label: 'Bakalavriat', url: '/sehife/bakalavriat' },
      { label: 'Magistratura', url: '/sehife/magistratura' },
      { label: 'Doktorantura', url: '/sehife/doktorantura' },
      { label: 'Təkrar ali təhsil', url: '/ixtisaslar?tab=tekrar_ali' },
    ],
  },
  {
    title: 'İxtisas seçimi',
    links: [
      { label: 'Keçid balları, yer sayı və haqq', url: '/ixtisaslar' },
      { label: 'Məzunların işlə təminatı', url: '/sehife/mezunlarin-isle-teminati' },
      { label: 'Yataqxana', url: '/sehife/yataqxana' },
    ],
  },
  {
    title: 'Əcnəbi vətəndaşlar',
    links: [
      { label: 'Qəbul qaydaları və təhsil haqqı', url: '/sehife/ecnebi-telebelerin-qebulu-qaydalari' },
      { label: 'İngilis dilində tədris', url: '/ixtisaslar?dil=en' },
    ],
  },
  {
    title: 'Tanışlıq və əlaqə',
    links: [
      { label: 'Valideynlər', url: '/bunlar-ucun/valideynler' },
      { label: 'Əlaqə', url: '/elaqe' },
    ],
  },
];

/** Footer-in «Qəbul» sütunu: «Onlayn müraciət» (#) və «Qəbul şərtləri» (hazırlanır) əvəzinə. */
export const QEBUL_FOOTER_V1: MenuLinkSeed[] = [
  { label: 'Bakalavr qəbulu', url: '/sehife/bakalavriat' },
  { label: 'Magistratura qəbulu', url: '/sehife/magistratura' },
  { label: 'Keçid balları, yer sayı və haqq', url: '/ixtisaslar' },
  { label: 'Əcnəbi vətəndaşlar', url: '/sehife/ecnebi-telebelerin-qebulu-qaydalari' },
];

/**
 * 2-ci və 3-cü mərhələ: məzmun yazılıb dərc olunandan sonra menyuya. Mövcud
 * «hazırlanır» ünvanları saxlanılır ki, köhnə təyinatlar itməsin.
 */
export const QEBUL_PENDING_PAGES: { slug: string; label: string }[] = [
  { slug: 'tibbi-muayine', label: 'Tibbi müayinə' },
  { slug: 'tekrar-ali-tehsil', label: 'Təkrar ali təhsil' },
  { slug: 'qebul-teqvimi', label: 'Qəbul təqvimi' },
  { slug: 'qeydiyyat-xidmeti', label: 'Qəbul olunanlar üçün: qeydiyyat və sənədlər' },
  { slug: 'qebul-suallari', label: 'Qəbul: suallar və cavablar' },
  { slug: 'tehsil-haqqi-ve-guzestler', label: 'Təhsil haqqı və güzəştlər' },
  { slug: 'viza-ve-miqrasiya-desteyi', label: 'Viza və miqrasiya dəstəyi' },
  { slug: 'aciq-qapi-gunleri', label: 'Açıq qapı günləri' },
  { slug: 'subbakalavr', label: 'Kollecə qəbul (subbakalavr)' },
];

/** F5.45 — v2: hər keçid öz qəbul səhifəsinə (sağ panelli şablon). */
export const QEBUL_MENU_V2: MenuGroupSeed[] = [
  {
    title: 'Pillələr üzrə qəbul',
    links: [
      { label: 'Subbakalavr (kollec)', url: '/sehife/subbakalavr' },
      { label: 'Bakalavriat', url: '/sehife/bakalavriat' },
      { label: 'Magistratura', url: '/sehife/magistratura' },
      { label: 'Doktorantura', url: '/sehife/doktorantura' },
      { label: 'Təkrar ali təhsil', url: '/sehife/tekrar-ali-tehsil' },
    ],
  },
  {
    title: 'İxtisas seçimi',
    links: [
      { label: 'Keçid balları, yer sayı və təhsil haqqı', url: '/sehife/kecid-ballari' },
      { label: 'Məzunların işlə təminatı', url: '/sehife/mezunlarin-isle-teminati' },
      { label: 'Yataqxana', url: '/sehife/yataqxana' },
    ],
  },
  {
    title: 'Əcnəbi vətəndaşlar',
    links: [
      { label: 'Qəbul qaydaları və təhsil haqqı', url: '/sehife/ecnebi-telebelerin-qebulu-qaydalari' },
      { label: 'İngilis dilində tədris', url: '/sehife/ingilis-dilinde-tedris' },
    ],
  },
  {
    title: 'Tanışlıq və əlaqə',
    links: [
      { label: 'Açıq qapı günləri', url: '/sehife/aciq-qapi-gunleri' },
      { label: 'Onlayn müraciət', url: '/sehife/onlayn-muraciet' },
    ],
  },
];

export const QEBUL_FOOTER_V2: MenuLinkSeed[] = [
  { label: 'Bakalavr qəbulu', url: '/sehife/bakalavriat' },
  { label: 'Magistratura qəbulu', url: '/sehife/magistratura' },
  { label: 'Keçid balları, yer sayı və təhsil haqqı', url: '/sehife/kecid-ballari' },
  { label: 'Onlayn müraciət', url: '/sehife/onlayn-muraciet' },
];

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const sameList = (a: string[], b: string[]): boolean => a.length === b.length && a.every((x, i) => x === b[i]);

/** Mövcud kateqoriyanı id ilə geri yaz (nav.category/group/link). */
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

/** Mövcud footer sütununu id ilə geri yaz (nav.footercol/link). */
function keepFooterCol(c: Row): Row {
  return {
    id: c.id,
    title: c.title,
    links: ((c.links as Row[]) ?? []).map((l) => ({ id: l.id, label: l.label, url: l.url })),
  };
}

/** Gözləyən səhifələr «Məsul redaktorlar»-da görünsün (təyinatsız sətir; mövcudun redaktoru qalır). */
async function ensurePendingPages(strapi: Core.Strapi): Promise<{ added: number; relabelled: number }> {
  const repo = strapi.db.query(OWNER_UID as never) as unknown as {
    findOne: (a: Row) => Promise<Row | null>;
    create: (a: Row) => Promise<Row>;
    update: (a: Row) => Promise<Row>;
  };
  let added = 0;
  let relabelled = 0;
  for (const p of QEBUL_PENDING_PAGES) {
    const key = `page:${p.slug}`;
    const row = await repo.findOne({ where: { key } });
    if (!row) {
      await repo.create({ data: { key, path: `/sehife/${p.slug}`, label: p.label, editorId: null } });
      added++;
    } else if (str(row.label) !== p.label) {
      // Köhnə menyu adı («Qeydiyyat xidməti») səhifənin yeni məqsədini göstərmir.
      await repo.update({ where: { id: row.id }, data: { label: p.label } });
      relabelled++;
    }
  }
  return { added, relabelled };
}

export async function applyQebulMenuV1(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: MARKER })) === true) return;

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
    strapi.log.warn('[menu] F5.44: menyu tapılmadı — «Qəbul» yenilənmədi.');
    return;
  }
  const cats = ((menu.esasMenyu as Row[]) ?? []).slice();
  const idx = cats.findIndex((c) => str(c.label) === CATEGORY);
  if (idx < 0) {
    strapi.log.warn('[menu] F5.44: «Qəbul» kateqoriyası yoxdur — toxunulmadı.');
    return;
  }
  const titles = ((cats[idx].groups as Row[]) ?? []).map((g) => str(g.title));

  if (sameList(titles, QEBUL_MENU_V1.map((g) => g.title))) {
    const pending = await ensurePendingPages(strapi);
    await store.set({ key: MARKER, value: true });
    strapi.log.info(`[menu] F5.44: «Qəbul» artıq yeni quruluşdadır; gözləyən səhifə: ${pending.added} əlavə, ${pending.relabelled} ad.`);
    return;
  }
  if (!sameList(titles, OLD_GROUPS)) {
    strapi.log.warn(
      `[menu] F5.44: «Qəbul» gözlənilən köhnə quruluşda deyil (${titles.join(' | ')}) — toxunulmadı. ` +
        'Yeni quruluşu admin paneldən əl ilə qurun (Məzmun → 3. Sayt — Menyu).',
    );
    return;
  }

  const oldLinks = ((cats[idx].groups as Row[]) ?? []).reduce((n, g) => n + ((g.links as Row[]) ?? []).length, 0);
  const nextCats = cats.map((c, i) =>
    i === idx
      ? {
          id: c.id,
          label: c.label,
          order: c.order,
          url: QEBUL_CATEGORY_URL,
          groups: QEBUL_MENU_V1.map((g) => ({ title: g.title, links: g.links.map((l) => ({ label: l.label, url: l.url })) })),
        }
      : keepCategory(c),
  );

  // Footer: yalnız «Qəbul» sütunu hələ köhnə 4 keçiddirsə.
  const cols = ((menu.footerMenyusu as Row[]) ?? []).slice();
  const fIdx = cols.findIndex((c) => str(c.title) === CATEGORY);
  const fLabels = fIdx >= 0 ? ((cols[fIdx].links as Row[]) ?? []).map((l) => str(l.label)) : [];
  const footerOld = fIdx >= 0 && sameList(fLabels, OLD_FOOTER);
  const data: Row = { esasMenyu: nextCats };
  if (footerOld) {
    data.footerMenyusu = cols.map((c, i) =>
      i === fIdx ? { id: c.id, title: c.title, links: QEBUL_FOOTER_V1.map((l) => ({ label: l.label, url: l.url })) } : keepFooterCol(c),
    );
  }

  await docs.update({ documentId: menu.documentId, data });
  const pending = await ensurePendingPages(strapi);
  await store.set({ key: MARKER, value: true });
  const newLinks = QEBUL_MENU_V1.reduce((n, g) => n + g.links.length, 0);
  strapi.log.info(
    `[menu] F5.44: «Qəbul» yeniləndi: ${titles.length} qrup / ${oldLinks} keçid → ${QEBUL_MENU_V1.length} qrup / ${newLinks} keçid; ` +
      `footer «Qəbul»: ${footerOld ? 'yeniləndi' : fIdx >= 0 ? 'əl ilə dəyişilib — toxunulmadı' : 'yoxdur'}; ` +
      `gözləyən səhifə «Məsul redaktorlar»-da: ${pending.added} əlavə, ${pending.relabelled} ad yeniləndi.`,
  );
}

// ── F5.45 — v2 ───────────────────────────────────────────────────────────────
const MARKER_V2 = 'qebulMenu:v2';

/** Qrupların tam imzası: başlıq + keçidlərin adı və ünvanı. */
function groupSig(groups: Row[] | MenuGroupSeed[]): string {
  return JSON.stringify(
    (groups as Row[]).map((g) => [str(g.title), ((g.links as Row[]) ?? []).map((l) => [str(l.label), str(l.url)])]),
  );
}
function linkSig(links: Row[] | MenuLinkSeed[]): string {
  return JSON.stringify((links as Row[]).map((l) => [str(l.label), str(l.url)]));
}

export async function applyQebulMenuV2(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: MARKER_V2 })) === true) return;

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
    strapi.log.warn('[menu] F5.45: menyu tapılmadı — «Qəbul» v2 yazılmadı.');
    return;
  }
  const cats = ((menu.esasMenyu as Row[]) ?? []).slice();
  const idx = cats.findIndex((c) => str(c.label) === CATEGORY);
  if (idx < 0) {
    strapi.log.warn('[menu] F5.45: «Qəbul» kateqoriyası yoxdur — toxunulmadı.');
    return;
  }
  const groups = (cats[idx].groups as Row[]) ?? [];
  const sig = groupSig(groups);
  const titles = groups.map((g) => str(g.title));
  const isV2 = sig === groupSig(QEBUL_MENU_V2);
  const isV1 = sig === groupSig(QEBUL_MENU_V1);
  const isOld = sameList(titles, OLD_GROUPS);

  const cols = ((menu.footerMenyusu as Row[]) ?? []).slice();
  const fIdx = cols.findIndex((c) => str(c.title) === CATEGORY);
  const fSig = fIdx >= 0 ? linkSig((cols[fIdx].links as Row[]) ?? []) : '';
  const fLabels = fIdx >= 0 ? ((cols[fIdx].links as Row[]) ?? []).map((l) => str(l.label)) : [];
  const footerV2 = fSig === linkSig(QEBUL_FOOTER_V2);
  const footerKnown = fIdx >= 0 && !footerV2 && (fSig === linkSig(QEBUL_FOOTER_V1) || sameList(fLabels, OLD_FOOTER));

  if (!isV2 && !isV1 && !isOld) {
    strapi.log.warn(
      `[menu] F5.45: «Qəbul» nə F5.44 quruluşunda, nə köhnə quruluşdadır (${titles.join(' | ')}) — toxunulmadı. ` +
        'Keçidləri admin paneldən əl ilə yeniləyin (Məzmun → 3. Sayt — Menyu): /sehife/subbakalavr, /sehife/kecid-ballari, /sehife/aciq-qapi-gunleri, /sehife/onlayn-muraciet və s.',
    );
    return;
  }

  const data: Row = {};
  if (!isV2) {
    data.esasMenyu = cats.map((c, i) =>
      i === idx
        ? {
            id: c.id,
            label: c.label,
            order: c.order,
            url: QEBUL_CATEGORY_URL,
            groups: QEBUL_MENU_V2.map((g) => ({ title: g.title, links: g.links.map((l) => ({ label: l.label, url: l.url })) })),
          }
        : keepCategory(c),
    );
  }
  if (footerKnown) {
    data.footerMenyusu = cols.map((c, i) =>
      i === fIdx ? { id: c.id, title: c.title, links: QEBUL_FOOTER_V2.map((l) => ({ label: l.label, url: l.url })) } : keepFooterCol(c),
    );
  }
  if (Object.keys(data).length) await docs.update({ documentId: menu.documentId, data });
  await store.set({ key: MARKER_V2, value: true });
  strapi.log.info(
    `[menu] F5.45: «Qəbul» v2: ${isV2 ? 'artıq yenidir' : `yeniləndi (${isV1 ? 'F5.44 quruluşundan' : 'köhnə quruluşdan'}) — 4 qrup / 12 keçid, hamısı qəbul səhifələrinə`}; ` +
      `footer «Qəbul»: ${footerV2 ? 'artıq yenidir' : footerKnown ? 'yeniləndi' : fIdx >= 0 ? 'əl ilə dəyişilib — toxunulmadı' : 'yoxdur'}.`,
  );
}
