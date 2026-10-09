/**
 * F5.40 — «Təhsil» menyusunun yeni quruluşu.
 *
 * Təklif: layihə sənədi claude/tehsil-menyusu-optimallasdirma.md (1-ci və
 * 2-ci mərhələ). Menyu təşkilati quruluşa görə yox, istifadəçinin işinə görə
 * qurulur: proqramlar → dəniz praktikası → əlavə təhsil → struktur və
 * keyfiyyət. 24 keçid (8-i boş) → 17 keçid (hamısı işləyən səhifəyə).
 *
 * NECƏ İŞLƏYİR:
 *   - BİR DƏFƏ (store `adda-admin` → `tehsilMenu:v2`), bootstrap-da, portu
 *     bloklamadan.
 *   - YALNIZ «Təhsil» hələ köhnə quruluşdadırsa (OLD_GROUP_VARIANTS). Admin onu əl ilə
 *     dəyişibsə toxunulmur: logda xəbərdarlıq qalır, marker yazılmır.
 *   - Digər kateqoriyalar komponent id-ləri ilə olduğu kimi geri yazılır.
 *   - 3-cü mərhələnin 4 səhifəsi menyuya salınmır (boş keçid olmasın), amma
 *     «Məsul redaktorlar» siyahısına («Menyuda yoxdur») düşür: baş admin
 *     redaktor təyin edir, redaktor «Məzmun əlavə et» ilə səhifəni yaradır.
 *
 * Eyni quruluş: seed (src/index.ts → MENU «Təhsil»), Next.js
 * lib/menu-fallback.ts. Etiketlərin ru/en tərcüməsi: lib/i18n.ts → MENU_T.
 */
import type { Core } from '@strapi/strapi';

type Row = Record<string, unknown>;

const MARKER = 'tehsilMenu:v2';
const CATEGORY = 'Təhsil';
const OWNER_UID = 'api::page-owner.page-owner';

/**
 * F5.39-a qədərki quruluş — yalnız bu halda yenilənir. İkinci qrup seed-də
 * «Proqramların kataloqu», prod-da admindən «İxtisaslar» adlanır — hər ikisi.
 */
const OLD_GROUP_VARIANTS = [
  ['Rəqəmsal Akademiya', 'İxtisaslar', 'Təhsil standartları', 'Təhsilin keyfiyyətinin qiymətləndirilməsi', 'Fakültələr', 'Kafedralar'],
  ['Rəqəmsal Akademiya', 'Proqramların kataloqu', 'Təhsil standartları', 'Təhsilin keyfiyyətinin qiymətləndirilməsi', 'Fakültələr', 'Kafedralar'],
];

export interface MenuGroupSeed {
  title: string;
  links: { label: string; url: string }[];
}

/** «Təhsil» başlığının özü — HSE-dəki kimi proqram kataloquna aparır. */
export const TEHSIL_CATEGORY_URL = '/ixtisaslar';

/** Kataloq keçidləri (`?tab=`, `?dil=`) Next.js ProgramDirectoryIsland-da oxunur. */
export const TEHSIL_MENU_V2: MenuGroupSeed[] = [
  {
    title: 'Təhsil proqramları',
    links: [
      { label: 'Bütün ixtisaslar', url: '/ixtisaslar' },
      { label: 'Subbakalavr (kollec)', url: '/ixtisaslar?tab=subbakalavr' },
      { label: 'Bakalavriat', url: '/sehife/bakalavriat' },
      { label: 'Magistratura', url: '/sehife/magistratura' },
      { label: 'Doktorantura', url: '/sehife/doktorantura' },
      { label: 'Qiyabi və təkrar ali təhsil', url: '/ixtisaslar?tab=tekrar_ali' },
      { label: 'İngilis dilində tədris', url: '/ixtisaslar?dil=en' },
    ],
  },
  {
    title: 'Dəniz praktikası',
    links: [
      { label: 'Tədris gəmisi', url: '/sehife/tedris-gemisi' },
      { label: 'Laboratoriya və trenajorlar', url: '/auditoriyalar' },
      { label: 'Təcrübə (praktika)', url: '/sehife/tecrube-haqqinda' },
    ],
  },
  {
    title: 'Əlavə təhsil',
    links: [
      { label: 'STCW kursları', url: '/struktur/telim-tedris-merkezi' },
      { label: 'İxtisasartırma və xaricdə təhsil', url: '/sehife/xaricde-tehsil-ve-ixtisasartirma' },
    ],
  },
  {
    title: 'Struktur və keyfiyyət',
    links: [
      { label: 'Fakültələr', url: '/fakulteler' },
      { label: 'Kafedralar', url: '/kafedralar' },
      { label: 'Tədris ofisi', url: '/struktur/tedris-proseslerinin-teskili-sobesi' },
      { label: 'E-Kitabxana', url: '/sehife/elektron-kitabxana' },
      { label: 'Keyfiyyət və nəticələr', url: '/sehife/keyfiyyetin-monitorinqi' },
    ],
  },
];

/**
 * F5.46 — v3. Bakalavriat, Magistratura, Doktorantura kataloqun pillə tabına
 * aparır (F5.45-dən `/sehife/bakalavriat` və s. QƏBUL səhifəsidir — «Qəbul»
 * menyusundadır). «Struktur və keyfiyyət» → «Tədris prosesi və keyfiyyət»;
 * Fakültələr və Kafedralar təşkilati quruluşdur (HSE-də də «О Вышке»-dədir) —
 * «Akademiya → Rəhbərlik və idarəetmə»-yə, «Təşkilati struktur»-dan sonra.
 */
export const TEHSIL_MENU_V3: MenuGroupSeed[] = [
  {
    title: 'Təhsil proqramları',
    links: [
      { label: 'Bütün ixtisaslar', url: '/ixtisaslar' },
      { label: 'Subbakalavr (kollec)', url: '/ixtisaslar?tab=subbakalavr' },
      { label: 'Bakalavriat', url: '/ixtisaslar?tab=bakalavr' },
      { label: 'Magistratura', url: '/ixtisaslar?tab=magistr' },
      { label: 'Doktorantura', url: '/ixtisaslar?tab=doktorantura' },
      { label: 'Qiyabi və təkrar ali təhsil', url: '/ixtisaslar?tab=tekrar_ali' },
      { label: 'İngilis dilində tədris', url: '/ixtisaslar?dil=en' },
    ],
  },
  {
    title: 'Dəniz praktikası',
    links: [
      { label: 'Təcrübə (praktika)', url: '/sehife/tecrube-haqqinda' },
      { label: 'Tədris gəmisi', url: '/sehife/tedris-gemisi' },
      { label: 'Laboratoriya və trenajorlar', url: '/auditoriyalar' },
    ],
  },
  {
    title: 'Əlavə təhsil',
    links: [
      { label: 'STCW kursları', url: '/struktur/telim-tedris-merkezi' },
      { label: 'İxtisasartırma və xaricdə təhsil', url: '/sehife/xaricde-tehsil-ve-ixtisasartirma' },
    ],
  },
  {
    title: 'Tədris prosesi və keyfiyyət',
    links: [
      { label: 'Tədris ofisi', url: '/struktur/tedris-proseslerinin-teskili-sobesi' },
      { label: 'E-Kitabxana', url: '/sehife/elektron-kitabxana' },
      { label: 'Keyfiyyət və nəticələr', url: '/sehife/keyfiyyetin-monitorinqi' },
    ],
  },
];

/** Footer-in «Təhsil» sütunu: köhnə (seed/prod) və v3. */
export const TEHSIL_FOOTER_OLD: { label: string; url: string }[] = [
  { label: 'Bakalavriat', url: '/sehife/bakalavriat' },
  { label: 'Magistratura', url: '/sehife/magistratura' },
  { label: 'Qiyabi təhsil', url: '/hazirlanir/qiyabi-tehsil' },
  { label: 'İxtisaslar', url: '/ixtisaslar' },
  { label: 'E-Akademiya', url: '#' },
];
export const TEHSIL_FOOTER_V3: { label: string; url: string }[] = [
  { label: 'İxtisaslar', url: '/ixtisaslar' },
  { label: 'Bakalavriat', url: '/ixtisaslar?tab=bakalavr' },
  { label: 'Magistratura', url: '/ixtisaslar?tab=magistr' },
  { label: 'Qiyabi və təkrar ali təhsil', url: '/ixtisaslar?tab=tekrar_ali' },
  { label: 'Təcrübə (praktika)', url: '/sehife/tecrube-haqqinda' },
];

/** «Akademiya» menyusunda Fakültələr və Kafedralar: bu qrupda, «Təşkilati struktur»-dan sonra. */
export const AKADEMIYA_CATEGORY = 'Akademiya';
export const AKADEMIYA_STRUCTURE_GROUP = 'Rəhbərlik və idarəetmə';
export const AKADEMIYA_STRUCTURE_LINKS: { label: string; url: string }[] = [
  { label: 'Fakültələr', url: '/fakulteler' },
  { label: 'Kafedralar', url: '/kafedralar' },
];

/** 3-cü mərhələ: məzmun yazılandan sonra «Tədris prosesi» qrupu ilə menyuya. */
export const TEHSIL_PENDING_PAGES = [
  { slug: 'akademik-teqvim', label: 'Akademik təqvim' },
  { slug: 'qiymetlendirme-ve-imtahan-qaydalari', label: 'Qiymətləndirmə və imtahan qaydaları' },
  { slug: 'kocurme-ve-berpa', label: 'Köçürmə, bərpa və akademik məzuniyyət' },
  { slug: 'stcw-standartlari', label: 'STCW standartları və dənizçi sertifikatları' },
];

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const sameList = (a: string[], b: string[]): boolean => a.length === b.length && a.every((x, i) => x === b[i]);

/** Mövcud komponenti id ilə geri yaz (yalnız məlum sahələr: nav.category/group/link). */
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

/** 3-cü mərhələnin səhifələri «Məsul redaktorlar»-da görünsün (təyinatsız sətir). */
async function ensurePendingPages(strapi: Core.Strapi): Promise<number> {
  const repo = strapi.db.query(OWNER_UID as never) as unknown as {
    findOne: (a: Row) => Promise<Row | null>;
    create: (a: Row) => Promise<Row>;
  };
  let added = 0;
  for (const p of TEHSIL_PENDING_PAGES) {
    const key = `page:${p.slug}`;
    if (await repo.findOne({ where: { key } })) continue;
    await repo.create({ data: { key, path: `/sehife/${p.slug}`, label: p.label, editorId: null } });
    added++;
  }
  return added;
}

export async function applyTehsilMenuV2(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: MARKER })) === true) return;

  const docs = strapi.documents('api::menu.menu' as never) as unknown as {
    findFirst: (a: Row) => Promise<Row | null>;
    update: (a: Row) => Promise<Row>;
  };
  const menu = await docs.findFirst({ populate: { esasMenyu: { populate: { groups: { populate: { links: true } } } } } });
  if (!menu) {
    strapi.log.warn('[menu] F5.40: menyu tapılmadı — «Təhsil» yenilənmədi.');
    return;
  }
  const cats = ((menu.esasMenyu as Row[]) ?? []).slice();
  const idx = cats.findIndex((c) => str(c.label) === CATEGORY);
  if (idx < 0) {
    strapi.log.warn('[menu] F5.40: «Təhsil» kateqoriyası yoxdur — toxunulmadı.');
    return;
  }
  const titles = ((cats[idx].groups as Row[]) ?? []).map((g) => str(g.title));

  // F5.46: v3 quruluşu ilə yaradılan (seed) bazada da «artıq yenidir».
  if (sameList(titles, TEHSIL_MENU_V2.map((g) => g.title)) || sameList(titles, TEHSIL_MENU_V3.map((g) => g.title))) {
    const added = await ensurePendingPages(strapi);
    await store.set({ key: MARKER, value: true });
    strapi.log.info(`[menu] F5.40: «Təhsil» artıq yeni quruluşdadır${added ? `; ${added} gözləyən səhifə əlavə olundu` : ''}.`);
    return;
  }
  if (!OLD_GROUP_VARIANTS.some((v) => sameList(titles, v))) {
    strapi.log.warn(
      `[menu] F5.40: «Təhsil» gözlənilən köhnə quruluşda deyil (${titles.join(' | ')}) — toxunulmadı. ` +
        'Yeni quruluşu admin paneldən əl ilə qurun (Məzmun → 3. Sayt — Menyu).',
    );
    return;
  }

  const oldLinks = ((cats[idx].groups as Row[]) ?? []).reduce((n, g) => n + ((g.links as Row[]) ?? []).length, 0);
  const next = cats.map((c, i) =>
    i === idx
      ? {
          id: c.id,
          label: c.label,
          order: c.order,
          // Başlıq və mega menyunun «Ətraflı» düyməsi kataloqa aparır (əvvəl «#»).
          url: TEHSIL_CATEGORY_URL,
          groups: TEHSIL_MENU_V2.map((g) => ({ title: g.title, links: g.links.map((l) => ({ label: l.label, url: l.url })) })),
        }
      : keepCategory(c),
  );
  await docs.update({ documentId: menu.documentId, data: { esasMenyu: next } });
  const added = await ensurePendingPages(strapi);
  await store.set({ key: MARKER, value: true });
  const newLinks = TEHSIL_MENU_V2.reduce((n, g) => n + g.links.length, 0);
  strapi.log.info(
    `[menu] F5.40: «Təhsil» yeniləndi: ${titles.length} qrup / ${oldLinks} keçid → ` +
      `${TEHSIL_MENU_V2.length} qrup / ${newLinks} keçid; ${added} gözləyən səhifə «Məsul redaktorlar»-a əlavə olundu.`,
  );
}

// ── F5.46: v3 ────────────────────────────────────────────────────────────────
const MARKER_V3 = 'tehsilMenu:v3';

function groupSig(groups: Row[] | MenuGroupSeed[]): string {
  return JSON.stringify(
    (groups as Row[]).map((g) => [str(g.title), ((g.links as Row[]) ?? []).map((l) => [str(l.label), str(l.url)])]),
  );
}
function linkSig(links: Row[] | { label: string; url: string }[]): string {
  return JSON.stringify((links as Row[]).map((l) => [str(l.label), str(l.url)]));
}
function keepFooterCol(c: Row): Row {
  return { id: c.id, title: c.title, links: ((c.links as Row[]) ?? []).map((l) => ({ id: l.id, label: l.label, url: l.url })) };
}

/**
 * BİR DƏFƏ (`tehsilMenu:v3`), yalnız «Təhsil» F5.40 (v2) quruluşundadırsa —
 * admin dəyişibsə toxunulmur, logda xəbərdarlıq (marker yazılmır). Akademiya
 * və footer ayrıca yoxlanılır: qrup/sütun gözlənilən kimidirsə yazılır.
 * Menyuya yazan digər miqrasiyalardan (F5.40, F5.43, F5.44, F5.45) SONRA.
 */
export async function applyTehsilMenuV3(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: MARKER_V3 })) === true) return;

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
    strapi.log.warn('[menu] F5.46: menyu tapılmadı — «Təhsil» v3 yazılmadı.');
    return;
  }
  const cats = ((menu.esasMenyu as Row[]) ?? []).slice();
  const idx = cats.findIndex((c) => str(c.label) === CATEGORY);
  if (idx < 0) {
    strapi.log.warn('[menu] F5.46: «Təhsil» kateqoriyası yoxdur — toxunulmadı.');
    return;
  }
  const groups = (cats[idx].groups as Row[]) ?? [];
  const isV3 = groupSig(groups) === groupSig(TEHSIL_MENU_V3);
  const isV2 = groupSig(groups) === groupSig(TEHSIL_MENU_V2);
  if (!isV3 && !isV2) {
    strapi.log.warn(
      `[menu] F5.46: «Təhsil» F5.40 quruluşunda deyil (${groups.map((g) => str(g.title)).join(' | ')}) — toxunulmadı. ` +
        'Admin paneldən əl ilə yeniləyin (Məzmun → 3. Sayt — Menyu): Bakalavriat → /ixtisaslar?tab=bakalavr, Magistratura → ?tab=magistr, ' +
        'Doktorantura → ?tab=doktorantura; «Tədris prosesi və keyfiyyət»; Fakültələr və Kafedralar → Akademiya.',
    );
    return;
  }

  // Akademiya → «Rəhbərlik və idarəetmə»: Fakültələr, Kafedralar.
  const aIdx = cats.findIndex((c) => str(c.label) === AKADEMIYA_CATEGORY);
  let akNote = 'kateqoriya yoxdur';
  let akNext: Row | null = null;
  if (aIdx >= 0) {
    const kept = keepCategory(cats[aIdx]);
    const aGroups = kept.groups as Row[];
    const gIdx = aGroups.findIndex((g) => str(g.title) === AKADEMIYA_STRUCTURE_GROUP);
    const urls = new Set(aGroups.flatMap((g) => ((g.links as Row[]) ?? []).map((l) => str(l.url))));
    const missing = AKADEMIYA_STRUCTURE_LINKS.filter((l) => !urls.has(l.url));
    if (gIdx < 0) {
      akNote = `«${AKADEMIYA_STRUCTURE_GROUP}» qrupu yoxdur — Fakültələr və Kafedralar əl ilə əlavə edilməlidir`;
    } else if (!missing.length) {
      akNote = 'Fakültələr və Kafedralar artıq var';
    } else {
      const links = (aGroups[gIdx].links as Row[]).slice();
      const at = links.findIndex((l) => str(l.url) === '/struktur');
      links.splice(at >= 0 ? at + 1 : links.length, 0, ...missing.map((l) => ({ label: l.label, url: l.url })));
      aGroups[gIdx] = { ...aGroups[gIdx], links };
      akNext = kept;
      akNote = `əlavə olundu: ${missing.map((l) => l.label).join(', ')}`;
    }
  }

  // Footer «Təhsil».
  const cols = ((menu.footerMenyusu as Row[]) ?? []).slice();
  const fIdx = cols.findIndex((c) => str(c.title) === CATEGORY);
  const fSig = fIdx >= 0 ? linkSig((cols[fIdx].links as Row[]) ?? []) : '';
  const footerV3 = fSig === linkSig(TEHSIL_FOOTER_V3);
  const footerOld = fIdx >= 0 && fSig === linkSig(TEHSIL_FOOTER_OLD);

  const data: Row = {};
  if (!isV3 || akNext) {
    data.esasMenyu = cats.map((c, i) => {
      if (i === idx && !isV3) {
        return {
          id: c.id,
          label: c.label,
          order: c.order,
          url: TEHSIL_CATEGORY_URL,
          groups: TEHSIL_MENU_V3.map((g) => ({ title: g.title, links: g.links.map((l) => ({ label: l.label, url: l.url })) })),
        };
      }
      if (i === aIdx && akNext) return akNext;
      return keepCategory(c);
    });
  }
  if (footerOld) {
    data.footerMenyusu = cols.map((c, i) =>
      i === fIdx ? { id: c.id, title: c.title, links: TEHSIL_FOOTER_V3.map((l) => ({ label: l.label, url: l.url })) } : keepFooterCol(c),
    );
  }
  if (Object.keys(data).length) await docs.update({ documentId: menu.documentId, data });
  await store.set({ key: MARKER_V3, value: true });
  strapi.log.info(
    `[menu] F5.46: «Təhsil» v3: ${isV3 ? 'artıq yenidir' : 'yeniləndi — Bakalavriat, Magistratura, Doktorantura kataloqa; «Tədris prosesi və keyfiyyət»'}; ` +
      `Akademiya: ${akNote}; footer «Təhsil»: ${footerV3 ? 'artıq yenidir' : footerOld ? 'yeniləndi' : fIdx >= 0 ? 'əl ilə dəyişilib — toxunulmadı' : 'yoxdur'}.`,
  );
}
