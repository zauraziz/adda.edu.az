/**
 * F5.53 — struktur bölmələrinin sırası (Zaurun qaydası):
 *
 *   1. Bütün saytda «Gəmi sürücülüyü fakültəsi» «Gəmi mexanikası və
 *      elektromexanikası fakültəsi»-ndən ƏVVƏL (naviqasiya, sonra mexaniklər).
 *   2. Rektora BİRBAŞA tabe olanlar: əvvəl tədris prorektoru, sonra elmi işlər və
 *      beynəlxalq əlaqələr üzrə prorektor, sonra mərkəzlər və şöbələr, sonra
 *      digərləri (kollec, elmi katib, müşavir, köməkçi, referent, hüquq
 *      məsləhətçisi). Prorektorların tabeliyindəkilər yerində qalır; yalnız
 *      tədris prorektorunun altında fakültələr başa keçir (1-ci qayda).
 *
 * Sayt bölmələri `sortOrder` (artan), sonra ad ilə düzür (getUnits,
 * getFacultyUnits, bölmə səhifəsinin alt bölmələri) — ona görə qayda
 * `sortOrder`-a yazılır: qardaşlar 10, 20, 30… Sahə dil üzrə EYNİDİR
 * (localized: false) — bütün dil və qaralama/dərc sətirlərinə birbaşa yazılır.
 *
 * BİR DƏFƏ (store `adda-admin` → `structOrder:v1`). Sonra sıra admində
 * «Sıra» sahəsi ilə dəyişir. Yerli Strapi-də rektor və ya fakültələr yoxdursa
 * həmin hissə ötürülür.
 */
import type { Core } from '@strapi/strapi';

type Row = Record<string, unknown>;

const UID = 'api::unit.unit';
const MARKER = 'structOrder:v1';

export const NAV_FACULTY = 'gemi-suruculuyu-fakultesi';
export const MECH_FACULTY = 'gemi-mexanikasi-ve-elektromexanikasi-fakultesi';
export const RECTOR = 'rektor';
/** Rektorun altında birinci gələn prorektorlar — bu sıra ilə. */
export const PROREKTOR_ORDER = [
  'tedrisin-teskili-ve-idareedilmesi-uzre-prorektorluq',
  'elmi-isler-ve-beynelxalq-elaqeler-uzre-prorektorluq',
];

export interface UnitLite {
  documentId?: string;
  slug: string;
  name: string;
  sortOrder: number | null;
  parent: string | null;
}

const byCurrent = (a: UnitLite, b: UnitLite) =>
  (a.sortOrder ?? 100) - (b.sortOrder ?? 100) || a.name.localeCompare(b.name, 'az');

/** Rektorun birbaşa tabeliyindəkilərin qrupu: 0 prorektor, 1 mərkəz, 2 şöbə, 3 digər. */
export function rectorGroup(u: UnitLite): number {
  const n = u.name.toLocaleLowerCase('az');
  if (u.slug.endsWith('-prorektorluq') || /prorektor/.test(n)) return 0;
  if (/mərkəzi?$/.test(n)) return 1;
  if (/şöbəsi$/.test(n)) return 2;
  return 3;
}

/**
 * Yeni `sortOrder`-lar (yalnız dəyişənlər): slug → dəyər. Saf funksiya —
 * scratchpad testi bunu prod ağacı ilə yoxlayır.
 */
export function planStructureOrder(units: UnitLite[]): { changes: Map<string, number>; notes: string[] } {
  const changes = new Map<string, number>();
  const notes: string[] = [];
  const kids = (parent: string) => units.filter((u) => u.parent === parent).sort(byCurrent);
  const assign = (ordered: UnitLite[], label: string) => {
    let changed = 0;
    ordered.forEach((u, i) => {
      const v = (i + 1) * 10;
      if (u.sortOrder !== v) {
        changes.set(u.slug, v);
        changed++;
      }
    });
    notes.push(`${label}: ${ordered.map((u) => u.name).join(' → ')}${changed ? '' : ' (dəyişməyib)'}`);
  };

  // 1. Rektorun birbaşa tabeliyindəkilər.
  const rector = kids(RECTOR);
  if (rector.length) {
    const rank = (u: UnitLite) => {
      const i = PROREKTOR_ORDER.indexOf(u.slug);
      return i === -1 ? PROREKTOR_ORDER.length : i;
    };
    const ordered = [...rector].sort(
      (a, b) => rectorGroup(a) - rectorGroup(b) || (rectorGroup(a) === 0 ? rank(a) - rank(b) : 0) || byCurrent(a, b),
    );
    assign(ordered, 'Rektor');
  } else {
    notes.push('Rektor: tabeliyində bölmə tapılmadı — ötürüldü');
  }

  // 2. Fakültələr: hansı valideynin altındadırsa, orada naviqasiya birinci.
  const nav = units.find((u) => u.slug === NAV_FACULTY);
  const mech = units.find((u) => u.slug === MECH_FACULTY);
  if (nav && mech) {
    if (nav.parent && nav.parent === mech.parent) {
      const siblings = kids(nav.parent);
      const rest = siblings.filter((u) => u.slug !== NAV_FACULTY && u.slug !== MECH_FACULTY);
      const parentName = units.find((u) => u.slug === nav.parent)?.name ?? nav.parent;
      assign([nav, mech, ...rest], parentName);
    } else if ((nav.sortOrder ?? 100) >= (mech.sortOrder ?? 100)) {
      // Fərqli valideyn (və ya kök): yalnız ikisinin öz sırası.
      changes.set(NAV_FACULTY, Math.min(nav.sortOrder ?? 100, mech.sortOrder ?? 100));
      changes.set(MECH_FACULTY, Math.min(nav.sortOrder ?? 100, mech.sortOrder ?? 100) + 10);
      notes.push('Fakültələr (fərqli valideyn): Gəmi sürücülüyü → Gəmi mexanikası');
    } else {
      notes.push('Fakültələr: artıq Gəmi sürücülüyü birincidir');
    }
  } else {
    notes.push('Fakültələr: tapılmadı — ötürüldü');
  }
  return { changes, notes };
}

export async function applyStructureOrderV1(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: MARKER })) === true) return;

  const q = strapi.db.query(UID as never) as unknown as {
    findMany: (a: Row) => Promise<Row[]>;
    updateMany: (a: Row) => Promise<{ count: number }>;
  };
  // Qaralama sətirləri (hər sənədin az dilində biri) — ağac onlardan qurulur.
  const rows = await q.findMany({
    where: { locale: 'az', publishedAt: null },
    select: ['documentId', 'slug', 'name', 'sortOrder'],
    populate: { parent: { select: ['slug'] } },
  });
  const units: UnitLite[] = rows.map((r) => ({
    documentId: String(r.documentId ?? ''),
    slug: String(r.slug ?? ''),
    name: String(r.name ?? ''),
    sortOrder: typeof r.sortOrder === 'number' ? r.sortOrder : null,
    parent: r.parent && typeof r.parent === 'object' ? String((r.parent as Row).slug ?? '') || null : null,
  }));

  const { changes, notes } = planStructureOrder(units.filter((u) => u.slug));
  let written = 0;
  for (const [slug, sortOrder] of changes) {
    // documentId üzrə — bütün dillər və qaralama/dərc sətirləri (sahə dil üzrə eynidir).
    const documentId = units.find((u) => u.slug === slug)?.documentId;
    if (!documentId) continue;
    const res = await q.updateMany({ where: { documentId }, data: { sortOrder } });
    written += res?.count ?? 0;
  }
  await store.set({ key: MARKER, value: true });
  strapi.log.info(`[struktur] F5.53: bölmələrin sırası — ${notes.join('; ')}. Yazılan sətir: ${written}.`);
}
