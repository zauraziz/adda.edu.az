/**
 * F5.61 — «Qəhrəmanlarımız»: şəhidlər və qazilər ayrıca (Zaur müəllim, 23.11.2026:
 * «şəhidlər yuxarıda olsun yarımbaşlıqla, qazilər isə ondan sonra»).
 *
 *   - Sxem: `hero.category` — `sehid` | `qazi`, dilsiz, məcburi (defoltu yoxdur: yeni
 *     qeydi yazan özü seçir — qazini səhvən şəhidlər arasına salmaq olmaz). Saytda əvvəl
 *     «Şəhidlərimiz» (qərənfillə), sonra «Qazilərimiz».
 *   - `heroCategory:v1` — BİR DƏFƏ, yalnız kateqoriyası BOŞ sənədlər: şəhid olduğu tarix
 *     və ya yer (hər hansı dildə) doludursa `sehid`, deyilsə `qazi`. Prod (23.11.2026):
 *     F5.21c-nin 5 şəhidi; admində 09.10.2026-da əlavə olunan 10 qazi (2-si qaralama) —
 *     onların şəhidlik sahələri boşdur, tərcümeyi-halı yaralanma və döyüş yoludur.
 *     Hər dil, qaralama və dərc sətri birbaşa bazada; `updatedAt` saxlanılır (admində
 *     «Dəyişdirilib» görünməsin, F5.53 qaydası).
 *   - `heroLayout:v1` — admin formasında «Kateqoriya» addan dərhal sonra (Strapi yeni
 *     sahəni formanın SONUNA qoyur). Admin düzümü əl ilə dəyişibsə toxunulmur.
 */
import type { Core } from '@strapi/strapi';
import { markSearchDirty } from './search-index';
import { requestSiteRevalidate } from './site-revalidate';

type Row = Record<string, unknown>;
type Cell = { name: string; size: number };
type Conf = { settings: Row; metadatas: Row; layouts: { edit: Cell[][] } & Row };
export type HeroCategory = 'sehid' | 'qazi';

const UID = 'api::hero.hero';
const MARKER = 'heroCategory:v1';
const LAYOUT_MARKER = 'heroLayout:v1';

interface Repo {
  findMany: (a: Row) => Promise<Row[]>;
  updateMany: (a: Row) => Promise<unknown>;
}

const filled = (v: unknown): boolean => (typeof v === 'string' ? v.trim() !== '' : v !== null && v !== undefined);
const isCategory = (v: unknown): v is HeroCategory => v === 'sehid' || v === 'qazi';

/** Saf funksiya (sınaq üçün): sənədin bütün sətirlərinə görə — şəhidlik sahəsi varsa şəhid. */
export function heroCategoryOf(rows: Row[]): HeroCategory {
  return rows.some((r) => filled(r.martyrdomDate) || filled(r.martyrdomPlace)) ? 'sehid' : 'qazi';
}

function nameOf(rows: Row[]): string {
  const az = rows.find((r) => r.locale === 'az' && r.publishedAt) ?? rows.find((r) => r.locale === 'az') ?? rows[0];
  return String(az?.name ?? '').trim();
}

async function applyCategories(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: MARKER })) === true) return;

  const repo = strapi.db.query(UID as never) as unknown as Repo;
  const rows: Row[] = [];
  for (let offset = 0; ; offset += 100) {
    const page = await repo.findMany({
      select: ['id', 'documentId', 'locale', 'name', 'category', 'martyrdomDate', 'martyrdomPlace', 'publishedAt', 'updatedAt'],
      orderBy: { id: 'asc' },
      limit: 100,
      offset,
    });
    rows.push(...page);
    if (page.length < 100) break;
  }
  const byDoc = new Map<string, Row[]>();
  for (const r of rows) {
    const k = String(r.documentId ?? '');
    if (!k) continue;
    byDoc.set(k, [...(byDoc.get(k) ?? []), r]);
  }

  const names: Record<HeroCategory, string[]> = { sehid: [], qazi: [] };
  let written = 0;
  for (const list of byDoc.values()) {
    // Admin artıq seçibsə (hər hansı sətirdə) o qalır — üstündən yazılmır.
    const set = list.map((r) => r.category).find(isCategory);
    const cat = set ?? heroCategoryOf(list);
    for (const r of list) {
      if (isCategory(r.category)) continue;
      await repo.updateMany({ where: { id: r.id }, data: { category: cat, updatedAt: r.updatedAt } });
      written++;
    }
    names[cat].push(nameOf(list) + (list.some((r) => r.publishedAt) ? '' : ' (qaralama)'));
  }

  await store.set({ key: MARKER, value: true });
  strapi.log.info(
    `[qehreman] F5.61: kateqoriya — şəhid ${names.sehid.length}, qazi ${names.qazi.length} (${names.qazi.join(', ') || 'yoxdur'}); yazılan sətir: ${written}.`,
  );
  if (written) {
    markSearchDirty();
    requestSiteRevalidate(strapi, 'qehremanlar');
  }
}

async function placeCategoryField(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: LAYOUT_MARKER })) === true) return;

  const cts = strapi.plugin('content-manager').service('content-types') as unknown as {
    findContentType: (uid: string) => { uid: string } | null;
    findConfiguration: (ct: { uid: string }) => Promise<Conf>;
    updateConfiguration: (ct: { uid: string }, conf: Conf) => Promise<unknown>;
  };
  const ct = cts.findContentType(UID);
  if (!ct) return;
  const conf = await cts.findConfiguration(ct);
  const edit = conf.layouts?.edit ?? [];
  const flat = edit.flat().map((c) => c.name);
  const nameRow = edit.findIndex((r) => r.some((c) => c.name === 'name'));
  // Yalnız Strapi defoltu: sahə formanın sonundadır.
  if (nameRow < 0 || flat[flat.length - 1] !== 'category') {
    await store.set({ key: LAYOUT_MARKER, value: true });
    strapi.log.info('[qehreman] F5.61: admin düzümü toxunulmadı («Kateqoriya» artıq yerində və ya əl ilə dəyişilib).');
    return;
  }
  const rest = edit.map((r) => r.filter((c) => c.name !== 'category')).filter((r) => r.length);
  const at = rest.findIndex((r) => r.some((c) => c.name === 'name'));
  rest.splice(at + 1, 0, [{ name: 'category', size: 6 }]);
  conf.layouts.edit = rest;
  await cts.updateConfiguration(ct, { settings: conf.settings, metadatas: conf.metadatas, layouts: conf.layouts });
  await store.set({ key: LAYOUT_MARKER, value: true });
  strapi.log.info('[qehreman] F5.61: «Kateqoriya» admin formasında addan sonra.');
}

/** Bootstrap zəncirindən; addımlar ayrı-ayrı — biri xəta versə digəri işləyir. */
export async function applyHeroF561(strapi: Core.Strapi): Promise<void> {
  try {
    await applyCategories(strapi);
  } catch (e) {
    strapi.log.error('[qehreman] F5.61 kateqoriya: ' + (e as Error).message);
  }
  try {
    await placeCategoryField(strapi);
  } catch (e) {
    strapi.log.error('[qehreman] F5.61 forma: ' + (e as Error).message);
  }
}
