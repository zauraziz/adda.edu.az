/**
 * F5.54 — Nizamnamə və «Əsasnamələr» (media kitabxanası, ADDA-ƏS-001…021) üzrə
 * BİR DƏFƏLİK miqrasiyalar. Məzmun: nizamname-content.ts, esasname-content.ts.
 *
 *   1. Sənədlər (`esasnameDocs:v1`): hər əsasnamə üçün «1. Məzmun — Sənəd»
 *      (kateqoriya «esasname») — yoxdursa yaradılır və dərc olunur; varsa yalnız
 *      boş «Səhifə» (url) doldurulur və «diger» → «esasname». Fayl media
 *      kitabxanasında adındakı koddan tapılır («ADDA-ES_009…»), tapılmasa həmin
 *      əsasnamə ötürülür (logda). «Elmi Şuranın əsasnaməsi» adlı sənədə ADDA-ƏS-004
 *      (Tədris-metodiki Şura) faylı bağlanmışdı — ad və səhifə düzəlir, Elmi Şura
 *      bölməsindən ayrılır. Adında «Əsasnamə» olan digər «diger» sənədlər də «esasname».
 *   2. Nizamnamə (`nizamname:v1`): admində yaradılan səhifənin ünvanı
 *      /sehife/nizamname olur (köhnəsi 301, next.config.js). Mətn hələ PDF-dən
 *      köçürülmüş haldadırsa (CHARTER_RAW_MARK) yeni quruluşda yazılır və dərc
 *      olunur; redaktor dəyişibsə YALNIZ ünvan dəyişir (bütün sətirlərdə, dərc
 *      vəziyyəti və mətn toxunulmur). Köhnə dəyərlər store-da `nizamname:backup`.
 *   3. Səhifələr (`esasnamePages:v1`, section-pages.ts qaydası): reyestr
 *      (dataBlock=esasnameler) və 7 yeni səhifə; fayl keçidləri `{{ES:n}}`.
 *   4. Bölmələr (`esasnameUnits:v1`): İRM, mühasibatlıq, personal, mətbəə — yalnız
 *      BOŞ «Missiya», «Fəaliyyət sahəsi», «Xidmətlər» (az) və əlavə bloku yoxdursa
 *      «Quruluş və idarəetmə». Qaralamada dərc olunmamış redaktə varsa yalnız
 *      qaralama yazılır (dərc etmək redaktordadır).
 *   5. Yan keçidlər (`esasnameLinks:v1`): təcrübə, yataqxana, doktorantura,
 *      keyfiyyət, tələbə həyatı səhifələrinə — keçid artıq yoxdursa, mətnə toxunmadan.
 *   6. Menyu (`esasnameMenu:v1`): «Nizamnamə və təsis sənədləri», «Struktur
 *      bölmələrin əsasnamələri», «Himayəçilər Şurası», «Məzunlar assosiasiyası»
 *      hələ «hazırlanır»/«#»-dirsə → yeni səhifələr; «Tədris prosesi və keyfiyyət»
 *      qrupuna yekun attestasiya və TMŞ, «Keyfiyyət və hesabatlılıq»-a KİS (yoxdursa).
 */
import type { Core } from '@strapi/strapi';
import { applySectionPages } from './section-pages';
import { moveOwner } from './dedupe';
import type { LinkSeed, QebulPageSeed } from './qebul-pages-content';
import { CHARTER_OLD_SLUG, CHARTER_PAGE, CHARTER_RAW_MARK, CHARTER_SLUG } from './nizamname-content';
import {
  ESASNAME_PAGES,
  PAGE_LINKS,
  REGULATIONS,
  STRUCTURE_TITLE,
  UNIT_FILLS,
  regCode,
  type RegulationSeed,
} from './esasname-content';

type Row = Record<string, unknown>;

const PAGE_UID = 'api::page.page';
const UNIT_UID = 'api::unit.unit';
const DOC_UID = 'api::document.document';
const TAG = '[esasname] F5.54';

export interface Docs {
  findFirst: (a: Row) => Promise<Row | null>;
  findOne: (a: Row) => Promise<Row | null>;
  findMany: (a: Row) => Promise<Row[]>;
  create: (a: Row) => Promise<Row>;
  update: (a: Row) => Promise<Row>;
  publish: (a: Row) => Promise<unknown>;
}
interface Q {
  findMany: (a: Row) => Promise<Row[]>;
  updateMany: (a: Row) => Promise<{ count: number }>;
}

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const list = (v: unknown): Row[] => (Array.isArray(v) ? (v as Row[]) : []);
const time = (v: unknown): number => (typeof v === 'string' || v instanceof Date ? new Date(v as string).getTime() : 0);
const docs = (strapi: Core.Strapi, uid: string) => strapi.documents(uid as never) as unknown as Docs;
const store = (strapi: Core.Strapi) => strapi.store({ type: 'plugin', name: 'adda-admin' });
/** Azərbaycanca kiçik hərf (İ/I). */
const azLower = (s: string) => s.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();

/** Lokal provayderdə fayl ünvanı nisbidir («/uploads/…») — mətndə tam ünvan lazımdır. */
export function absUrl(u: string): string {
  if (!u.startsWith('/')) return u;
  return (process.env.ADMIN_PUBLIC_URL || 'https://adda-edu-az.onrender.com').trim().replace(/\/+$/, '') + u;
}

// ── Media: əsasnamə faylları ─────────────────────────────────────────────────
export interface MediaFile {
  id: number;
  name: string;
  url: string;
}

/** Kod → fayllar (ən yenisi əvvəl). Ad: «+ADDA-ES_009_-_24_…», «ADDA-ES_004_-_24_…». */
export function codeOf(name: string): number | null {
  const m = /ADDA[-_ ]?(?:ES|ƏS)[-_ ]?0*(\d{1,3})(?!\d)/i.exec(name);
  return m ? Number(m[1]) : null;
}

async function regulationFiles(strapi: Core.Strapi): Promise<Map<number, MediaFile[]>> {
  const rows = await (strapi.db.query('plugin::upload.file' as never) as unknown as Q).findMany({
    where: { name: { $containsi: 'ADDA' } },
    select: ['id', 'name', 'url', 'ext', 'createdAt'],
    orderBy: { createdAt: 'desc' },
  });
  const out = new Map<number, MediaFile[]>();
  for (const r of rows) {
    const name = str(r.name);
    const code = codeOf(name);
    if (!code || !/\.(pdf|docx?)$/i.test(str(r.ext) || name)) continue;
    const arr = out.get(code) ?? [];
    arr.push({ id: Number(r.id), name, url: absUrl(str(r.url)) });
    out.set(code, arr);
  }
  return out;
}

/** `{{ES:n}}` → faylın ünvanı; tapılmasa keçid atılır. */
function resolveLinks(links: LinkSeed[] | undefined, files: Map<number, MediaFile[]>): LinkSeed[] {
  const out: LinkSeed[] = [];
  for (const l of links ?? []) {
    const m = /^\{\{ES:(\d+)\}\}$/.exec(l.url);
    if (!m) {
      out.push(l);
      continue;
    }
    const f = files.get(Number(m[1]))?.[0];
    if (f) out.push({ label: l.label, url: f.url });
  }
  return out;
}

function withFiles(seed: QebulPageSeed, files: Map<number, MediaFile[]>): QebulPageSeed {
  return { ...seed, az: { ...seed.az, sideLinks: resolveLinks(seed.az.sideLinks, files) } };
}

/** Qaralamada dərc olunmamış redaktə varmı (CM-in «Dəyişdirilib» qaydası: qaralama daha yenidir)? */
export async function hasPendingDraft(d: Docs, documentId: string, draft: Row, locale?: string): Promise<{ published: boolean; pending: boolean }> {
  const pub = await d.findOne({ documentId, ...(locale ? { locale } : {}), status: 'published' });
  if (!pub) return { published: false, pending: false };
  return { published: true, pending: time(draft.updatedAt) > time(pub.updatedAt) + 1000 };
}

// ── 1. Sənədlər ──────────────────────────────────────────────────────────────
const DOCS_MARKER = 'esasnameDocs:v1';

/**
 * Bölmənin MÖVCUD dil sətirləri (qaralama) — sənəd admin kimi hər dilin sətrinə
 * bağlanır; olmayan dilə bağlamaq Document Service-də xətadır.
 */
export async function unitTargets(strapi: Core.Strapi, slugs: string[]): Promise<{ documentId: string; locale: string }[]> {
  if (!slugs.length) return [];
  const rows = await (strapi.db.query(UNIT_UID as never) as unknown as Q).findMany({
    where: { slug: { $in: slugs }, publishedAt: null },
    select: ['documentId', 'locale'],
  });
  const seen = new Set<string>();
  const out: { documentId: string; locale: string }[] = [];
  for (const r of rows) {
    const documentId = str(r.documentId);
    const locale = str(r.locale);
    if (!documentId || !locale || seen.has(`${documentId}|${locale}`)) continue;
    seen.add(`${documentId}|${locale}`);
    out.push({ documentId, locale });
  }
  return out;
}

export async function applyRegulationDocsV1(strapi: Core.Strapi, files: Map<number, MediaFile[]>): Promise<void> {
  const st = store(strapi);
  if ((await st.get({ key: DOCS_MARKER })) === true) return;
  const d = docs(strapi, DOC_UID);
  const all = await d.findMany({
    status: 'draft',
    populate: { file: { fields: ['id', 'name'] }, units: { fields: ['slug'] } },
    limit: 1000,
  });
  const created: string[] = [];
  const patched: string[] = [];
  const missing: string[] = [];

  const save = async (doc: Row, data: Row, label: string) => {
    const documentId = str(doc.documentId);
    const { published, pending } = await hasPendingDraft(d, documentId, doc);
    await d.update({ documentId, data });
    if (published && !pending) await d.publish({ documentId });
    patched.push(label + (published && pending ? ' (qaralama — dərc redaktorda)' : ''));
  };

  const seen = new Set<string>();
  for (const r of REGULATIONS as RegulationSeed[]) {
    const code = regCode(r.code);
    const codeFiles = files.get(r.code) ?? [];
    const ids = new Set(codeFiles.map((f) => f.id));
    const mine = all.filter((x) => {
      const fid = Number((x.file as Row | null)?.id ?? 0);
      return ids.has(fid) || str(x.title).includes(code);
    });
    if (!mine.length) {
      if (!codeFiles.length) {
        missing.push(code);
        continue;
      }
      const units = await unitTargets(strapi, r.units ?? []);
      const doc = await d.create({
        data: {
          title: `${r.title} (${code})`,
          category: 'esasname',
          file: codeFiles[0].id,
          url: r.url ?? null,
          ...(units.length ? { units: { connect: units } } : {}),
        },
      });
      await d.publish({ documentId: str(doc.documentId) });
      created.push(code);
      continue;
    }
    for (const x of mine) {
      seen.add(str(x.documentId));
      const data: Row = {};
      // ADDA-ƏS-004 «Elmi Şuranın əsasnaməsi» adı ilə Elmi Şuraya bağlanmışdı.
      if (r.code === 4 && azLower(str(x.title)).startsWith('elmi şuranın əsasnaməsi')) {
        data.title = `${r.title} (${code})`;
        data.units = { set: [] };
      }
      if (str(x.category) !== 'esasname') data.category = 'esasname';
      if (!str(x.url) && r.url) data.url = r.url;
      if (Object.keys(data).length) await save(x, data, code);
    }
  }

  // Kodsuz, amma adında «Əsasnamə» olan «digər» sənədlər (məs. bölmənin öz əsasnaməsi).
  for (const x of all) {
    if (seen.has(str(x.documentId)) || str(x.category) !== 'diger') continue;
    if (!azLower(str(x.title)).includes('əsasnamə')) continue;
    await save(x, { category: 'esasname' }, `«${str(x.title)}»`);
  }

  await st.set({ key: DOCS_MARKER, value: true });
  strapi.log.info(
    `${TAG}: əsasnamə sənədləri — yaradıldı: ${created.join(', ') || 'yox'}; yeniləndi: ${patched.join(', ') || 'yox'}` +
      (missing.length ? `; media kitabxanasında faylı tapılmadı: ${missing.join(', ')}` : '') +
      '.',
  );
}

// ── 2. Nizamnamə ─────────────────────────────────────────────────────────────
const CHARTER_MARKER = 'nizamname:v1';

function pageData(seed: QebulPageSeed): Row {
  const loc = seed.az;
  return {
    title: loc.title,
    slug: seed.slug,
    layout: seed.layout ?? 'akademiya',
    dataBlock: seed.dataBlock,
    lead: loc.lead,
    body: loc.body,
    seoDescription: loc.seoDescription.slice(0, 180),
    stepsTitle: null,
    facts: (loc.facts ?? []).map((f) => ({ label: f.label, value: f.value, icon: f.icon ?? 'diger' })),
    steps: [],
    faq: (loc.faq ?? []).map((q) => ({ question: q.question, answer: q.answer })),
    sideLinks: (loc.sideLinks ?? []).map((l) => ({ label: l.label, url: l.url })),
    contact: loc.contact ?? null,
  };
}

/** Keçid komponentlərində köhnə ünvan → /sehife/nizamname (dil prefiksi və #… saxlanılır). */
async function rewriteCharterLinks(strapi: Core.Strapi): Promise<number> {
  let n = 0;
  for (const uid of ['nav.link', 'nav.quicklink', 'nav.portalcard', 'nav.category']) {
    if (!strapi.components[uid as keyof typeof strapi.components]) continue;
    const repo = strapi.db.query(uid as never) as unknown as Q & { update: (a: Row) => Promise<unknown> };
    const rows = await repo.findMany({ where: { url: { $contains: CHARTER_OLD_SLUG } }, select: ['id', 'url'] });
    for (const r of rows) {
      const next = str(r.url).replace(`/sehife/${CHARTER_OLD_SLUG}`, `/sehife/${CHARTER_SLUG}`);
      if (next === str(r.url)) continue;
      await repo.update({ where: { id: r.id }, data: { url: next } });
      n++;
    }
  }
  return n;
}

export async function applyCharterV1(strapi: Core.Strapi): Promise<void> {
  const st = store(strapi);
  if ((await st.get({ key: CHARTER_MARKER })) === true) return;
  const d = docs(strapi, PAGE_UID);
  const find = (slug: string) => d.findFirst({ locale: 'az', status: 'draft', filters: { slug: { $eq: slug } } });
  const [target, old] = await Promise.all([find(CHARTER_SLUG), find(CHARTER_OLD_SLUG)]);
  let note: string;
  let conflict = false;

  if (!old) {
    if (target) note = 'artıq /sehife/nizamname-dədir';
    else {
      const doc = await d.create({ locale: 'az', data: pageData(CHARTER_PAGE) });
      await d.publish({ documentId: str(doc.documentId), locale: 'az' });
      note = 'səhifə yox idi — yaradıldı';
    }
  } else if (target) {
    conflict = true;
    note = '/sehife/nizamname başqa səhifədir — köhnə səhifəyə toxunulmadı (admində birini silin)';
    strapi.log.warn(`${TAG}: nizamnamə: ${note}.`);
  } else {
    const documentId = str(old.documentId);
    await st.set({
      key: 'nizamname:backup',
      value: { slug: old.slug ?? null, title: old.title ?? null, lead: old.lead ?? null, body: old.body ?? null, layout: old.layout ?? null, updatedAt: old.updatedAt ?? null },
    });
    const raw = str(old.body).includes(CHARTER_RAW_MARK) && (!str(old.layout) || str(old.layout) === 'standart');
    if (raw) {
      await d.update({ documentId, locale: 'az', data: pageData(CHARTER_PAGE) });
      await d.publish({ documentId, locale: 'az' });
      note = 'yeni quruluşda yazıldı və dərc olundu, ünvan /sehife/nizamname';
    } else {
      // Redaktor dəyişib: yalnız ünvan — bütün sətirlərdə (qaralama/dərc), mətn və vəziyyət eyni.
      const res = await (strapi.db.query(PAGE_UID as never) as unknown as Q).updateMany({
        where: { documentId },
        data: { slug: CHARTER_SLUG },
      });
      note = `mətn redaktə olunub — toxunulmadı, yalnız ünvan dəyişdi (sətir: ${res.count})`;
    }
  }
  const links = conflict ? 0 : await rewriteCharterLinks(strapi);
  // Məsul redaktor: köhnə ünvanın və menyudakı «hazırlanır» keçidinin açarı → page:nizamname.
  const move = (from: string) =>
    moveOwner(strapi, from, `page:${CHARTER_SLUG}`, `/sehife/${CHARTER_SLUG}`, CHARTER_PAGE.az.title).catch(() => false);
  const a = await move(`page:${CHARTER_OLD_SLUG}`);
  const b = await move('page:nizamname-ve-tesis-senedleri');
  const owners = a || b;
  await st.set({ key: CHARTER_MARKER, value: true });
  strapi.log.info(`${TAG}: nizamnamə — ${note}${links ? `; keçid: ${links}` : ''}${owners ? '; məsul redaktor köçdü' : ''}.`);
}

// ── 3. Səhifələr ─────────────────────────────────────────────────────────────
export async function applyEsasnamePagesV1(strapi: Core.Strapi, files: Map<number, MediaFile[]>): Promise<void> {
  await applySectionPages(strapi, {
    marker: 'esasnamePages:v1',
    tag: TAG,
    layout: 'akademiya',
    backupPrefix: 'esasnamePages',
    pages: ESASNAME_PAGES.map((p) => withFiles(p, files)),
    dropIfUnassigned: [],
    source: 'src/utils/esasname-content.ts',
  });
}

// ── 4. Bölmələr ──────────────────────────────────────────────────────────────
const UNITS_MARKER = 'esasnameUnits:v1';

export async function applyEsasnameUnitsV1(strapi: Core.Strapi): Promise<void> {
  const st = store(strapi);
  if ((await st.get({ key: UNITS_MARKER })) === true) return;
  const d = docs(strapi, UNIT_UID);
  const done: string[] = [];
  const skipped: string[] = [];
  for (const u of UNIT_FILLS) {
    const az = await d.findFirst({ locale: 'az', status: 'draft', filters: { slug: { $eq: u.slug } }, populate: { extraBlocks: true } });
    if (!az) {
      skipped.push(`${u.slug} (bölmə yoxdur)`);
      continue;
    }
    const data: Row = {};
    const filled: string[] = [];
    if (!str(az.mission)) (data.mission = u.mission), filled.push('missiya');
    if (!str(az.functions)) (data.functions = u.functions), filled.push('fəaliyyət');
    if (u.services && !str(az.services)) (data.services = u.services), filled.push('xidmətlər');
    if (!list(az.extraBlocks).length) {
      data.extraBlocks = [{ title: STRUCTURE_TITLE, body: u.structure, after: 'fealiyyet_sahesi' }];
      filled.push('quruluş');
    }
    if (!filled.length) {
      skipped.push(`${u.slug} (sahələr doludur)`);
      continue;
    }
    const documentId = str(az.documentId);
    const { published, pending } = await hasPendingDraft(d, documentId, az, 'az');
    await d.update({ documentId, locale: 'az', data });
    if (published && !pending) await d.publish({ documentId, locale: 'az' });
    done.push(`${u.slug}: ${filled.join(', ')}${published && pending ? ' (qaralama — dərc redaktorda)' : ''}`);
  }
  await st.set({ key: UNITS_MARKER, value: true });
  strapi.log.info(`${TAG}: bölmələr — ${done.join('; ') || 'yazılmadı'}${skipped.length ? `; toxunulmadı: ${skipped.join(', ')}` : ''}.`);
}

// ── 5. Mövcud səhifələrin yan keçidləri ──────────────────────────────────────
const LINKS_MARKER = 'esasnameLinks:v1';

export async function applyEsasnameLinksV1(strapi: Core.Strapi, files: Map<number, MediaFile[]>): Promise<void> {
  const st = store(strapi);
  if ((await st.get({ key: LINKS_MARKER })) === true) return;
  const d = docs(strapi, PAGE_UID);
  const done: string[] = [];
  const skipped: string[] = [];
  for (const p of PAGE_LINKS) {
    const [link] = resolveLinks([p.link], files);
    if (!link) {
      skipped.push(`${p.slug} (fayl yoxdur)`);
      continue;
    }
    const az = await d.findFirst({ locale: 'az', status: 'draft', filters: { slug: { $eq: p.slug } }, populate: { sideLinks: true } });
    if (!az) {
      skipped.push(`${p.slug} (səhifə yoxdur)`);
      continue;
    }
    const cur = list(az.sideLinks);
    if (cur.some((l) => str(l.url) === link.url || str(l.label) === link.label)) {
      skipped.push(`${p.slug} (keçid var)`);
      continue;
    }
    const documentId = str(az.documentId);
    const { published, pending } = await hasPendingDraft(d, documentId, az, 'az');
    await d.update({
      documentId,
      locale: 'az',
      data: { sideLinks: [...cur.map((l) => ({ id: l.id, label: l.label, url: l.url })), { label: link.label, url: link.url }] },
    });
    if (published && !pending) await d.publish({ documentId, locale: 'az' });
    done.push(p.slug + (published && pending ? ' (qaralama)' : ''));
  }
  await st.set({ key: LINKS_MARKER, value: true });
  strapi.log.info(`${TAG}: yan keçidlər — ${done.join(', ') || 'yox'}${skipped.length ? `; ötürüldü: ${skipped.join(', ')}` : ''}.`);
}

// ── 6. Menyu ─────────────────────────────────────────────────────────────────
const MENU_MARKER = 'esasnameMenu:v1';
const PLACEHOLDER = (slug: string) => [`/hazirlanir/${slug}`, '#', ''];

/** Yer tutan keçid → yeni səhifə (label dəqiq uyğun gəlməli, ünvan hələ yer tutan olmalı). */
export const MENU_RULES: { label: string; old: string[]; to: string }[] = [
  // Prod-da admin bu keçidi köhnə ünvana bağlamışdı (/sehife/az-rbaycan-…-nizamnam-si).
  {
    label: 'Nizamnamə və təsis sənədləri',
    old: [...PLACEHOLDER('nizamname-ve-tesis-senedleri'), `/sehife/${CHARTER_OLD_SLUG}`, `/az/sehife/${CHARTER_OLD_SLUG}`],
    to: `/sehife/${CHARTER_SLUG}`,
  },
  { label: 'Struktur bölmələrin əsasnamələri', old: PLACEHOLDER('struktur-bolmelerin-esasnameleri'), to: '/sehife/struktur-bolmelerin-esasnameleri' },
  { label: 'Himayəçilər Şurası', old: PLACEHOLDER('himayeciler-surasi'), to: '/sehife/himayeciler-surasi' },
  { label: 'Məzunlar assosiasiyası', old: PLACEHOLDER('mezunlar-assosiasiyasi'), to: '/sehife/mezunlar-assosiasiyasi' },
];
/** Qrupa əlavə olunan keçidlər (ünvan artıq varsa toxunulmur); `after` — həmin etiketdən sonra. */
export const MENU_ADD: { category: string; group: string; after?: string; links: { label: string; url: string }[] }[] = [
  {
    category: 'Təhsil',
    group: 'Tədris prosesi və keyfiyyət',
    links: [
      { label: 'Yekun dövlət attestasiyası', url: '/sehife/yekun-dovlet-attestasiyasi' },
      { label: 'Tədris-metodiki Şura', url: '/sehife/tedris-metodiki-sura' },
    ],
  },
  {
    category: 'Akademiya',
    group: 'Keyfiyyət və hesabatlılıq',
    after: 'Akkreditasiya və sertifikatlar',
    links: [{ label: 'Keyfiyyəti idarəetmə sistemi', url: '/sehife/keyfiyyet-idareetme-sistemi' }],
  },
];

const keepLink = (l: Row): Row => ({ id: l.id, label: l.label, url: l.url });

export async function applyEsasnameMenuV1(strapi: Core.Strapi): Promise<void> {
  const st = store(strapi);
  if ((await st.get({ key: MENU_MARKER })) === true) return;
  const d = strapi.documents('api::menu.menu' as never) as unknown as { findFirst: (a: Row) => Promise<Row | null>; update: (a: Row) => Promise<Row> };
  const menu = await d.findFirst({
    populate: {
      esasMenyu: { populate: { groups: { populate: { links: true } } } },
      ustMenyu: { populate: { groups: { populate: { links: true } } } },
      footerMenyusu: { populate: { links: true } },
    },
  });
  if (!menu) {
    strapi.log.warn(`${TAG}: menyu tapılmadı — keçidlər yenilənmədi.`);
    return;
  }
  const notes: string[] = [];
  const data: Row = {};
  let changed = false;

  const rewrite = (l: Row): Row => {
    const label = str(l.label);
    const url = str(l.url);
    const rule = MENU_RULES.find((r) => r.label === label);
    if (!rule || url === rule.to) return keepLink(l);
    if (!rule.old.includes(url)) {
      notes.push(`«${label}»: admin ünvanı dəyişib (${url}) — toxunulmadı`);
      return keepLink(l);
    }
    changed = true;
    notes.push(`«${label}» → ${rule.to}`);
    return { ...keepLink(l), url: rule.to };
  };

  const cats = (key: 'esasMenyu' | 'ustMenyu') =>
    list(menu[key]).map((c) => ({
      id: c.id,
      label: c.label,
      order: c.order,
      url: c.url,
      groups: list(c.groups).map((g) => {
        let links = list(g.links).map(rewrite);
        const add = key === 'esasMenyu' ? MENU_ADD.find((a) => a.category === str(c.label) && a.group === str(g.title)) : undefined;
        if (add) {
          const fresh = add.links.filter((n) => !links.some((l) => str(l.url) === n.url));
          if (fresh.length) {
            const at = add.after ? links.findIndex((l) => str(l.label) === add.after) : -1;
            links = at >= 0 ? [...links.slice(0, at + 1), ...fresh, ...links.slice(at + 1)] : [...links, ...fresh];
            changed = true;
            notes.push(`«${str(g.title)}» + ${fresh.map((n) => `«${n.label}»`).join(', ')}`);
          }
        }
        return { id: g.id, title: g.title, links };
      }),
    }));
  data.esasMenyu = cats('esasMenyu');
  data.ustMenyu = cats('ustMenyu');
  data.footerMenyusu = list(menu.footerMenyusu).map((c) => ({ id: c.id, title: c.title, links: list(c.links).map(rewrite) }));
  if (changed) await d.update({ documentId: menu.documentId, data });

  // Məsul redaktor qeydində ünvan: açar eynidir (page:<slug>), yalnız /hazirlanir/… → /sehife/….
  const owners = strapi.db.query('api::page-owner.page-owner' as never) as unknown as Q;
  let paths = 0;
  for (const r of MENU_RULES) {
    const slug = r.to.replace(/^\/sehife\//, '');
    const res = await owners
      .updateMany({ where: { key: `page:${slug}`, path: { $in: r.old.filter(Boolean) } }, data: { path: r.to } })
      .catch(() => ({ count: 0 }));
    paths += res.count;
  }
  await st.set({ key: MENU_MARKER, value: true });
  strapi.log.info(
    `${TAG}: menyu — ${notes.length ? notes.join('; ') : 'yer tutan keçid tapılmadı — toxunulmadı'}` +
      (paths ? `; məsul redaktor qeydlərində ünvan: ${paths}` : '') +
      '.',
  );
}

// ── Zəncir ───────────────────────────────────────────────────────────────────
export async function applyEsasnamelerF554(strapi: Core.Strapi): Promise<void> {
  const files = await regulationFiles(strapi);
  const run = async (name: string, fn: () => Promise<void>) => {
    try {
      await fn();
    } catch (e) {
      strapi.log.error(`${TAG}: ${name}: ${(e as Error).message}`);
    }
  };
  await run('sənədlər', () => applyRegulationDocsV1(strapi, files));
  await run('nizamnamə', () => applyCharterV1(strapi));
  await run('səhifələr', () => applyEsasnamePagesV1(strapi, files));
  await run('bölmələr', () => applyEsasnameUnitsV1(strapi));
  await run('yan keçidlər', () => applyEsasnameLinksV1(strapi, files));
  await run('menyu', () => applyEsasnameMenuV1(strapi));
}
