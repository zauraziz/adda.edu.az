/**
 * F5.47 — «Elm və innovasiya» menyusunun yeni quruluşu (v1).
 *
 * Təhlil: layihə sənədi claude/elm-menyusu-optimallasdirma.md. HSE.ru «Наука»
 * nümunəsi ilə menyu tədqiqatçının suallarına görə qurulur: harada və nə
 * tədqiq olunur → nəticə harada dərc olunur → gənc alimin yolu → konfrans və
 * maliyyə. 5 qrup / 19 keçid (11-i «hazırlanır», ikisi eyni jurnala, biri
 * «Akademiya»dakı «Rəqəmlər və faktlar»-ın təkrarı) → 4 qrup / 10 keçid,
 * hamısı işləyən səhifəyə. Başlıq «#» idi → bölmənin ana səhifəsi.
 *
 * NECƏ İŞLƏYİR (F5.46 menu-tehsil.ts v3 qaydası):
 *   - BİR DƏFƏ (store `adda-admin` → `elmMenu:v1`), bootstrap-da, portu
 *     bloklamadan, menyuya yazan digər miqrasiyalardan SONRA.
 *   - YALNIZ «Elm və innovasiya» hələ köhnə (seed/prod) quruluşdadırsa — admin
 *     dəyişibsə toxunulmur: logda xəbərdarlıq, marker yazılmır.
 *   - Digər kateqoriyalar komponent id-ləri ilə olduğu kimi geri yazılır.
 *   - Məzmunu hələ olmayan 4 mövzu (dissertasiya şuraları, mükafatlar,
 *     konvensiyalar fondu, Tədris-Metodiki Şura) menyuya salınmır, amma
 *     «Məsul redaktorlar»-da «Menyuda yoxdur» kimi gözləyir.
 *
 * Eyni quruluş: seed (src/index.ts → MENU), Next.js lib/menu-fallback.ts.
 * Etiketlərin ru/en tərcüməsi: lib/i18n.ts → MENU_T.
 */
import type { Core } from '@strapi/strapi';
import type { MenuGroupSeed } from './menu-tehsil';

type Row = Record<string, unknown>;

const MARKER = 'elmMenu:v1';
const CATEGORY = 'Elm və innovasiya';
const OWNER_UID = 'api::page-owner.page-owner';

/** Başlıq və mega menyunun «Ətraflı» düyməsi — bölmənin ana səhifəsi. */
export const ELM_CATEGORY_URL = '/sehife/elmi-tedqiqat-fealiyyeti';

/** F5.46-ya qədərki quruluş (seed və prod eyni) — yalnız bu halda yenilənir. */
export const ELM_MENU_OLD: MenuGroupSeed[] = [
  {
    title: 'Elmi idarəetmə və strategiya',
    links: [
      { label: 'Elmi siyasət', url: '/hazirlanir/elmi-siyaset' },
      { label: 'Tədris-Metodiki Şura', url: '/hazirlanir/tedris-metodiki-sura' },
      { label: 'Rəqəmlər və faktlar', url: '/sehife/reqemler-ve-faktlar' },
    ],
  },
  {
    title: 'Elmi-tədqiqat mərkəzləri və laboratoriyalar',
    links: [
      { label: 'Tədqiqat mərkəzləri və laboratoriyalar', url: '/sehife/elmi-tedqiqat-laboratoriyalari' },
      { label: 'Elmi-tədqiqat qrupu', url: '/sehife/elmi-tedqiqat-qrupu' },
    ],
  },
  {
    title: 'Elmi nəşrlər və kitabxana',
    links: [
      { label: 'ADDA-nın Elmi Jurnalı', url: '/sehife/elmi-jurnal' },
      { label: 'Əməkdaşların nəşrləri', url: '/hazirlanir/emekdaslarin-nesrleri' },
      { label: 'E-Kitabxana', url: '/sehife/elektron-kitabxana' },
      { label: 'Konvensiyalar və normativ sənədlər fondu', url: '/hazirlanir/konvensiyalar-ve-normativ-senedler-fondu' },
      { label: 'Tərəfdaş kitabxanalar və elmi bazalar', url: '/hazirlanir/terefdas-kitabxanalar-ve-elmi-bazalar' },
      { label: 'Elmi jurnalımız onlayn versiyada', url: '/sehife/elmi-jurnalimiz-onlayn-versiyada' },
    ],
  },
  {
    title: 'Doktorantura və elmi kadrların hazırlığı',
    links: [
      { label: 'Doktorantura', url: '/sehife/doktorantura' },
      { label: 'Dissertasiya şuraları', url: '/hazirlanir/dissertasiya-suralari' },
      { label: 'Gənc alimlərin platforması', url: '/sehife/genc-alimler-surasi' },
    ],
  },
  {
    title: 'Qrantlar, müsabiqələr və tədbirlər',
    links: [
      { label: 'Qrantlar', url: '/hazirlanir/qrantlar' },
      { label: 'Mükafatlar', url: '/hazirlanir/mukafatlar' },
      { label: 'Elmi tədbirlər təqvimi', url: '/hazirlanir/elmi-tedbirler-teqvimi' },
      { label: 'Beynəlxalq Dənizçilik Konfransları', url: '/hazirlanir/beynelxalq-denizcilik-konfranslari' },
      { label: 'Sahəvi seminarlar və təlimlər', url: '/hazirlanir/sahevi-seminarlar-ve-telimler' },
    ],
  },
];

/**
 * v1. «Elmi-tədqiqat qrupu» səhifəsi şöbənin köhnə adı idi (F5.47 dedupe:v2 —
 * /struktur-a 301); «Elmi jurnalımız onlayn versiyada» jurnal səhifəsinin
 * içindədir; «Rəqəmlər və faktlar» «Akademiya»da qalır; «Əməkdaşların
 * nəşrləri» → Elm Portalı (CRIS); «Tərəfdaş kitabxanalar» → kitabxana
 * səhifəsi; konfrans, təqvim və seminarlar → «Elmi konfranslar».
 */
export const ELM_MENU_V1: MenuGroupSeed[] = [
  {
    title: 'Tədqiqat',
    links: [
      { label: 'Ümumi baxış', url: ELM_CATEGORY_URL },
      { label: 'Elmi-tədqiqat laboratoriyaları', url: '/sehife/elmi-tedqiqat-laboratoriyalari' },
      { label: 'Elmi-tədqiqat şöbəsi', url: '/struktur/elmi-tedqiqat-ve-beynelxalq-elaqeler-sobesi' },
    ],
  },
  {
    title: 'Nəşrlər və resurslar',
    links: [
      { label: '«Elmi Əsərlər» jurnalı', url: '/sehife/elmi-jurnal' },
      { label: 'Elm Portalı (CRIS)', url: 'https://cris.adda.edu.az' },
      { label: 'Kitabxana və elektron resurslar', url: '/sehife/elektron-kitabxana' },
    ],
  },
  {
    title: 'Doktorantura və gənc alimlər',
    links: [
      { label: 'Doktorantura', url: '/sehife/doktorantura' },
      { label: 'Gənc alimlər və tədqiqatçılar', url: '/sehife/genc-alimler-surasi' },
    ],
  },
  {
    title: 'Konfranslar və qrantlar',
    links: [
      { label: 'Elmi konfranslar', url: '/sehife/elmi-konfranslar' },
      { label: 'Qrantlar və müsabiqələr', url: '/sehife/qrantlar' },
    ],
  },
];

/** Məzmunu yazılanda menyuya (əl ilə və ya yeni miqrasiya ilə) əlavə olunacaq mövzular. */
export const ELM_PENDING_PAGES = [
  { slug: 'dissertasiya-suralari', label: 'Dissertasiya şuraları' },
  { slug: 'mukafatlar', label: 'Elmi mükafatlar' },
  { slug: 'konvensiyalar-ve-normativ-senedler-fondu', label: 'Konvensiyalar və normativ sənədlər fondu' },
  { slug: 'tedris-metodiki-sura', label: 'Tədris-Metodiki Şura' },
];

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

/** Gözləyən mövzular «Məsul redaktorlar»-da görünsün (təyinatsız sətir). */
async function ensurePendingPages(strapi: Core.Strapi): Promise<number> {
  const repo = strapi.db.query(OWNER_UID as never) as unknown as {
    findOne: (a: Row) => Promise<Row | null>;
    create: (a: Row) => Promise<Row>;
  };
  let added = 0;
  for (const p of ELM_PENDING_PAGES) {
    const key = `page:${p.slug}`;
    if (await repo.findOne({ where: { key } })) continue;
    await repo.create({ data: { key, path: `/sehife/${p.slug}`, label: p.label, editorId: null } });
    added++;
  }
  return added;
}

export async function applyElmMenuV1(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: MARKER })) === true) return;

  const docs = strapi.documents('api::menu.menu' as never) as unknown as {
    findFirst: (a: Row) => Promise<Row | null>;
    update: (a: Row) => Promise<Row>;
  };
  const menu = await docs.findFirst({ populate: { esasMenyu: { populate: { groups: { populate: { links: true } } } } } });
  if (!menu) {
    strapi.log.warn('[menu] F5.47: menyu tapılmadı — «Elm və innovasiya» yenilənmədi.');
    return;
  }
  const cats = ((menu.esasMenyu as Row[]) ?? []).slice();
  const idx = cats.findIndex((c) => str(c.label) === CATEGORY);
  if (idx < 0) {
    strapi.log.warn('[menu] F5.47: «Elm və innovasiya» kateqoriyası yoxdur — toxunulmadı.');
    return;
  }
  const groups = (cats[idx].groups as Row[]) ?? [];
  const sig = groupSig(groups);

  if (sig === groupSig(ELM_MENU_V1)) {
    // Yeni bazada seed artıq v1 quruluşundadır.
    const added = await ensurePendingPages(strapi);
    await store.set({ key: MARKER, value: true });
    strapi.log.info(`[menu] F5.47: «Elm və innovasiya» artıq yeni quruluşdadır${added ? `; ${added} gözləyən mövzu əlavə olundu` : ''}.`);
    return;
  }
  if (sig !== groupSig(ELM_MENU_OLD)) {
    strapi.log.warn(
      `[menu] F5.47: «Elm və innovasiya» gözlənilən köhnə quruluşda deyil (${groups.map((g) => str(g.title)).join(' | ')}) — toxunulmadı. ` +
        'Admin paneldən əl ilə yeniləyin (Məzmun → 3. Sayt — Menyu): 4 qrup — Tədqiqat; Nəşrlər və resurslar; Doktorantura və gənc alimlər; ' +
        'Konfranslar və qrantlar (bax src/utils/menu-elm.ts ELM_MENU_V1).',
    );
    return;
  }

  const next = cats.map((c, i) =>
    i === idx
      ? {
          id: c.id,
          label: c.label,
          order: c.order,
          url: ELM_CATEGORY_URL,
          groups: ELM_MENU_V1.map((g) => ({ title: g.title, links: g.links.map((l) => ({ label: l.label, url: l.url })) })),
        }
      : keepCategory(c),
  );
  await docs.update({ documentId: menu.documentId, data: { esasMenyu: next } });
  const added = await ensurePendingPages(strapi);
  await store.set({ key: MARKER, value: true });
  const oldLinks = ELM_MENU_OLD.reduce((n, g) => n + g.links.length, 0);
  const newLinks = ELM_MENU_V1.reduce((n, g) => n + g.links.length, 0);
  strapi.log.info(
    `[menu] F5.47: «Elm və innovasiya» yeniləndi: ${ELM_MENU_OLD.length} qrup / ${oldLinks} keçid → ${ELM_MENU_V1.length} qrup / ${newLinks} keçid; ` +
      `başlıq → ${ELM_CATEGORY_URL}; ${added} gözləyən mövzu «Məsul redaktorlar»-a əlavə olundu.`,
  );
}
