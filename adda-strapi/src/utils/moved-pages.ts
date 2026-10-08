/**
 * F5.43 — öz yerinə köçmüş «Səhifə» qeydləri (təkrarların siyahısı).
 *
 * Eyni məlumat iki ünvanda idi: «1. Məzmun — Səhifə» (/sehife/<slug>) və
 * «2. Akademiya — Struktur bölmə» (/struktur/<slug>). Kanonik ünvan bölmədir:
 * /sehife/<page> → /struktur/<unit> 301 (Next.js next.config.js), səhifə dərcdən
 * çıxarılır (qaralama qalır), menyu keçidləri birbaşa bölməyə (src/utils/dedupe.ts).
 *
 *   copy: true  — səhifənin mətni bölmənin boş «Haqqında»-sına köçürülür
 *                 (rektor vakansiyası, Elmi Şuranın tərkibi);
 *   copy: false — səhifə köhnə saytın şəxsi tərcümeyi-halıdır (az versiyası
 *                 artıq dərcdən çıxarılıb, ru/en qalmışdı, bəziləri köhnə
 *                 prorektora aiddir) — mətn köçürülmür, şəxsin profili
 *                 /emekdas/<slug>-dədir.
 *
 * SİNXRON: adda-nextjs/next.config.js (PAGE_UNIT_MAP), tools/migration/
 * gen-redirects.mjs (MOVED). Bu fayl @strapi tiplərini import ETMİR — sayt
 * axtarışı (standalone) da oxuyur.
 */
export const PAGE_UNIT_MOVES: ReadonlyArray<{ page: string; unit: string; copy: boolean }> = [
  { page: 'rektor', unit: 'rektor', copy: true },
  { page: 'elmi-sura', unit: 'elmi-sura', copy: true },
  { page: 'elmi-katib', unit: 'elmi-katib', copy: false },
  { page: 'rektor-komekcisi', unit: 'rektorun-komekcisi', copy: false },
  {
    page: 'tedrisin-teskili-ve-idareedilmesi-uzre-prorektor',
    unit: 'tedrisin-teskili-ve-idareedilmesi-uzre-prorektorluq',
    copy: false,
  },
  {
    page: 'elmi-isler-ve-beynelxalq-elaqeler-uzre-prorektor',
    unit: 'elmi-isler-ve-beynelxalq-elaqeler-uzre-prorektorluq',
    copy: false,
  },
];

/**
 * Öz marşrutuna əvvəl köçmüş səhifələr (F5.21d, F5.30a). Səhifə qeydi arxiv
 * kimi dərcdə qalır, 301 artıq var — burada yalnız menyu keçidləri üçün.
 */
export const PAGE_ROUTE_MOVES: Readonly<Record<string, string>> = {
  elaqe: '/elaqe',
  qehremanlarimiz: '/qehremanlarimiz',
};

/** Axtarışda göstərilməyən səhifələr (köçmüş, ünvanı yönlənir). */
export const MOVED_PAGE_SLUGS: string[] = PAGE_UNIT_MOVES.map((m) => m.page);

/** /sehife/<slug> köçübsə yeni ünvan (dilsiz), yoxsa null. */
export function movedPageTarget(slug: string): string | null {
  const m = PAGE_UNIT_MOVES.find((x) => x.page === slug);
  if (m) return `/struktur/${m.unit}`;
  return PAGE_ROUTE_MOVES[slug] ?? null;
}
