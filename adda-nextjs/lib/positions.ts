// F5.58 — vəzifələr: dərəcə (sıra), təkrarsız siyahı, elmi adın təkrarı.
//
// Zaur müəllim, 26.10.2026: əməkdaş səhifəsində «Dosent» üç dəfə yazılırdı
// («Dosent — Tətbiqi mexanika kafedrası», bölməsiz «Dosent», elmi ad «Dosent»),
// bölmənin yan panelində heyət ada görə düzülürdü — dekan müavini mütəxəssisdən
// aşağıda idi. Strapi-də eyni məntiq: adda-strapi/src/utils/person-merge.ts
// (`positionKey`).
import { searchFold } from './search-fold';
import type { StaffRole } from './strapi';

/** Vəzifə açarı: «Tədris müəssisəsində böyük laborant» = «Böyük laborant». */
export function positionKey(pos: string | null | undefined): string {
  return searchFold(String(pos ?? ''))
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/^tedris muessi\S*\s+/, '')
    .replace(/\s+/g, ' ');
}

/**
 * Vəzifə dərəcəsi (kiçik = yuxarı). SIRALI, lövbərli naxışlar — sadə sətir axtarışı
 * DEYİL: «Rektor» ⊂ «Prorektor», «Müəllim» ⊂ «Baş müəllim», «dekan» ⊂ «dekan müavini»
 * (müavin HƏMİŞƏ əvvəl yoxlanılır). İlk uyğunluq qazanır.
 */
const RANKS: [RegExp, number][] = [
  [/muavin/, 6],
  [/^rektor(?![a-z])/, 0],
  [/birinci prorektor/, 1],
  [/prorektor|uzre pr\.?$/, 2],
  [/elmi katib|elmi suranin katibi/, 3],
  [/^dekan(?![a-z])|direktor/, 4],
  [/kafedra(?:nin)? mudiri|sobe(?:nin)? mudiri|sobe reisi|merkezin (?:mudiri|rehberi)|bolme mudiri|^mudir$|^reis$|bas muhasib/, 5],
  [/sektor mudiri|yataqxana mudiri|rektorun (?:komekcisi|musaviri)|bas hekim/, 7],
  [/professor/, 10],
  [/dosent/, 11],
  [/bas muellim/, 12],
  [/muellim/, 13],
  [/assistent/, 14],
  [/bas mutexessis|bas meslehetci|boyuk mutexessis/, 20],
  [/aparici mutexessis|meslehetci/, 21],
  [/mutexessis/, 22],
  [/tyutor|metodist|koordinator/, 23],
  [/referent|inspektor|katib|operator|karguzar|arxivari|kitabxanaci/, 24],
  [/laboratoriya mudiri/, 30],
  [/boyuk laborant/, 31],
  [/laborant/, 32],
  [/tedris ustasi|usta|texnik|mexanik|elektrik/, 33],
];
/** Siyahıda olmayan vəzifə inzibati heyətdən sonra, texniki heyətdən əvvəl. */
const OTHER = 26;

export function positionRank(pos: string | null | undefined): number {
  const v = positionKey(pos);
  if (!v) return 99;
  for (const [re, rank] of RANKS) if (re.test(v)) return rank;
  return OTHER;
}

/** Rəhbər vəzifə (rektor … müavin, sektor müdiri) — əməkdaş səhifəsində əvvələ. */
export const isLeadRank = (rank: number): boolean => rank <= 7;

export interface RoleView {
  position: string;
  unitName: string | null;
  staffType?: string;
  rank: number;
}

/**
 * Göstəriləcək vəzifələr: eyni vəzifə bir dəfə (bölməsiz yazılış bölməli ilə
 * birləşir), rəhbər vəzifələr əvvələ, qalanı admindəki sırası ilə. `roles` boşdursa
 * əsas vəzifə (`position` + bölmə).
 */
export function viewRoles(
  roles: StaffRole[] | null | undefined,
  fallback?: { position?: string | null; unitName?: string | null; staffType?: string | null },
): RoleView[] {
  let list = (roles ?? [])
    .filter((r) => r && String(r.position ?? '').trim())
    .map((r) => ({ position: r.position.trim(), unitName: (r.unitName ?? '').trim() || null, staffType: r.staffType as string | undefined }));
  if (!list.length && fallback?.position?.trim()) {
    list = [{ position: fallback.position.trim(), unitName: fallback.unitName?.trim() || null, staffType: fallback.staffType ?? undefined }];
  }
  const out: (RoleView & { key: string; u: string; i: number })[] = [];
  list.forEach((r, i) => {
    const key = positionKey(r.position);
    const u = r.unitName ? searchFold(r.unitName) : '';
    const same = out.find((o) => o.key === key && (o.u === u || !u || !o.u));
    if (same) {
      if (!same.u && u) {
        same.unitName = r.unitName;
        same.u = u;
      }
      return;
    }
    out.push({ ...r, key, u, i, rank: positionRank(r.position) });
  });
  return out
    .sort((a, b) => (isLeadRank(a.rank) ? a.rank : 100) - (isLeadRank(b.rank) ? b.rank : 100) || a.i - b.i)
    .map(({ position, unitName, staffType, rank }) => ({ position, unitName, staffType, rank }));
}

/** Elmi ad vəzifələrdən birinin eynisidirsə («Dosent» — «Dosent») ikinci dəfə yazılmır. */
export function titleRepeats(title: string | null | undefined, roles: RoleView[]): boolean {
  const k = positionKey(title);
  return Boolean(k) && roles.some((r) => positionKey(r.position) === k);
}

/** Bölmədəki vəzifəsi: həmin bölmənin vəzifə sətri, yoxdursa əsas vəzifə. */
export function postInUnit(
  p: { roles?: StaffRole[] | null; position?: string | null },
  unitName: string,
): string {
  const u = searchFold(unitName);
  const own = (p.roles ?? []).filter((r) => r.unitName && searchFold(r.unitName) === u);
  if (own.length) return own.sort((a, b) => positionRank(a.position) - positionRank(b.position))[0].position;
  return p.position || (p.roles ?? [])[0]?.position || '';
}
