// F5.45 — qəbul səhifələrinin canlı cədvəlləri: ixtisas kataloqundan
// (program) sətirlər və yan panelin xülasəsi. Məlumat Strapi-də DƏYİŞMİR,
// yalnız göstəriş. Kataloq (`/ixtisaslar`) və ixtisas səhifəsi ilə EYNİ
// mənbədir — ixtisas yenilənəndə qəbul səhifələri də yenilənir.
import type { Program, ProgramAdmissionScore, ProgramCatalogTab, PageDataBlock } from './strapi';

export const LEVEL_TABS: ProgramCatalogTab[] = ['subbakalavr', 'bakalavr', 'magistr', 'tekrar_ali', 'doktorantura'];

/** Pillənin adı (az; `tr()` ilə tərcümə olunur). */
export const LEVEL_LABEL: Record<ProgramCatalogTab, string> = {
  subbakalavr: 'Subbakalavr (kollec)',
  bakalavr: 'Bakalavriat',
  magistr: 'Magistratura',
  tekrar_ali: 'Təkrar ali təhsil',
  doktorantura: 'Doktorantura',
};

/** Pillə səhifəsinin bloku → kataloq tabı. */
export const BLOCK_TAB: Partial<Record<PageDataBlock, ProgramCatalogTab>> = {
  subbakalavr: 'subbakalavr',
  bakalavr: 'bakalavr',
  magistr: 'magistr',
  doktorantura: 'doktorantura',
  tekrar_ali: 'tekrar_ali',
};

export interface SeatPart {
  /** az etiket (`tr()`): «əyani», «qiyabi», «ödənişsiz», «ödənişli» və ya dil kodu. */
  label: string;
  value: number;
}

export interface AdmissionRow {
  documentId: string;
  slug: string;
  title: string;
  code: string | null;
  tab: ProgramCatalogTab | null;
  /** «AZ», «RU», «EN». */
  langs: string[];
  durationYears: number | null;
  seatsYear: number | null;
  seatsTotal: number | null;
  seatParts: SeatPart[];
  stateFunded: number | null;
  paid: number | null;
  enSeats: number | null;
  fee: string | null;
  /** Ən son ilin keçid balı. */
  latest: ProgramAdmissionScore | null;
  /** Bütün illər, yeni → köhnə. */
  scores: ProgramAdmissionScore[];
}

const pos = (n: number | null | undefined): number | null => (typeof n === 'number' && n > 0 ? n : null);

function seatParts(p: Program): SeatPart[] {
  const s = p.admissionSeats;
  if (!s) return [];
  if (s.stateFunded != null || s.paid != null) {
    return [
      { label: 'ödənişsiz', value: s.stateFunded ?? 0 },
      { label: 'ödənişli', value: s.paid ?? 0 },
    ].filter((x) => x.value > 0);
  }
  const ru = pos(s.ruFullTime);
  const en = pos(s.enFullTime);
  const multi = Boolean(ru || en);
  const out: SeatPart[] = [];
  const az = pos(s.azFullTime);
  const azq = pos(s.azPartTime);
  if (az) out.push({ label: multi ? 'AZ əyani' : 'əyani', value: az });
  if (azq) out.push({ label: multi ? 'AZ qiyabi' : 'qiyabi', value: azq });
  if (ru) out.push({ label: 'RU', value: ru });
  if (en) out.push({ label: 'EN', value: en });
  // Yalnız bir hissə varsa bölgü məna vermir (cəmin özüdür).
  return out.length > 1 ? out : [];
}

export function toRow(p: Program, overlay?: Program | null): AdmissionRow {
  const scores = [...(p.admissionScores ?? [])]
    .filter((s) => s && typeof s.year === 'number' && (s.minScoreFree != null || s.minScorePaid != null))
    .sort((a, b) => b.year - a.year);
  const s = p.admissionSeats;
  return {
    documentId: p.documentId,
    slug: overlay?.slug || p.slug,
    title: overlay?.title || p.title,
    code: p.code,
    tab: p.catalogTab,
    langs: [...new Set((p.languages ?? []).map((l) => (l?.code ?? '').toUpperCase()).filter(Boolean))],
    durationYears: p.durationYears,
    seatsYear: s?.year ?? null,
    seatsTotal: s?.total ?? null,
    seatParts: seatParts(p),
    stateFunded: s?.stateFunded ?? null,
    paid: s?.paid ?? null,
    enSeats: pos(s?.enFullTime),
    fee: p.tuitionFee,
    latest: scores[0] ?? null,
    scores,
  };
}

/** az proqramları (tam siyahı) + cari dildə başlıq/slug (documentId üzrə). */
export function buildRows(azPrograms: Program[], localePrograms: Program[] = []): AdmissionRow[] {
  const byDoc = new Map(localePrograms.map((p) => [p.documentId, p]));
  return azPrograms.map((p) => toRow(p, byDoc.get(p.documentId)));
}

export function rowsForTab(rows: AdmissionRow[], tab: ProgramCatalogTab): AdmissionRow[] {
  return rows
    .filter((r) => r.tab === tab)
    .sort((a, b) => (b.seatsTotal ?? -1) - (a.seatsTotal ?? -1) || a.title.localeCompare(b.title, 'az'));
}

/** İngilis dilində tədris: dili EN olan və ya ingilisdilli yeri olan ixtisaslar. */
export function englishRows(rows: AdmissionRow[]): AdmissionRow[] {
  return rows
    .filter((r) => r.langs.includes('EN') || (r.enSeats ?? 0) > 0)
    .sort((a, b) => LEVEL_TABS.indexOf(a.tab ?? 'bakalavr') - LEVEL_TABS.indexOf(b.tab ?? 'bakalavr') || a.title.localeCompare(b.title, 'az'));
}

/** Haqqın rəqəmi («2700 AZN/il» → 2700); rəqəm yoxdursa null. */
export function feeNumber(fee: string | null): number | null {
  const m = (fee ?? '').match(/\d[\d\s]*(?:[.,]\d+)?/);
  if (!m) return null;
  const n = Number(m[0].replace(/\s+/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

export interface AdmissionStats {
  programs: number;
  seatsYear: number | null;
  seats: number | null;
  stateFunded: number | null;
  paid: number | null;
  feeMin: number | null;
  feeMax: number | null;
  scoreYear: number | null;
  scoreMin: number | null;
  scoreMax: number | null;
}

export function stats(rows: AdmissionRow[]): AdmissionStats {
  const seatRows = rows.filter((r) => r.seatsTotal != null);
  const sum = (xs: (number | null)[]) => (xs.some((x) => x != null) ? xs.reduce<number>((a, x) => a + (x ?? 0), 0) : null);
  const fees = rows.map((r) => feeNumber(r.fee)).filter((x): x is number => x != null);
  const scoreYear = rows.reduce<number | null>((m, r) => (r.latest && (m == null || r.latest.year > m) ? r.latest.year : m), null);
  const latestScores = rows
    .filter((r) => r.latest && r.latest.year === scoreYear)
    .flatMap((r) => [r.latest!.minScoreFree, r.latest!.minScorePaid])
    .filter((x): x is number => typeof x === 'number');
  return {
    programs: rows.length,
    seatsYear: seatRows.reduce<number | null>((m, r) => (r.seatsYear != null && (m == null || r.seatsYear > m) ? r.seatsYear : m), null),
    seats: sum(seatRows.map((r) => r.seatsTotal)),
    stateFunded: sum(rows.map((r) => r.stateFunded)),
    paid: sum(rows.map((r) => r.paid)),
    feeMin: fees.length ? Math.min(...fees) : null,
    feeMax: fees.length ? Math.max(...fees) : null,
    scoreYear,
    scoreMin: latestScores.length ? Math.min(...latestScores) : null,
    scoreMax: latestScores.length ? Math.max(...latestScores) : null,
  };
}

/** Bal tarixçəsi cədvəli üçün illər (yeni → köhnə, ən çox `max`). */
export function scoreYears(rows: AdmissionRow[], max = 5): number[] {
  const ys = new Set<number>();
  for (const r of rows) for (const s of r.scores) ys.add(s.year);
  return [...ys].sort((a, b) => b - a).slice(0, max);
}
