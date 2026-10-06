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

  if (sameList(titles, TEHSIL_MENU_V2.map((g) => g.title))) {
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
