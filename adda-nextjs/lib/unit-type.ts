// F5.11 — `struktur/[slug]/page.tsx`-dən çıxarılıb, `kafedralar/page.tsx` da
// eyni suffiks siyahısından istifadə edir (F4.7a-dakı tip-adı törətməsi
// TƏKRARLANMASIN deyə).
//
// CLAUDE.md-dəki `azLower` MƏCBURİdir — sadə `toLowerCase()` 'I'/'İ'
// hərflərini səhv çevirir.
const azLower = (s: string) => s.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();

export const UNIT_TYPE_SUFFIXES: { suffix: string; nom: string; gen: string }[] = [
  { suffix: 'mərkəzi', nom: 'Mərkəz', gen: 'Mərkəzin' },
  { suffix: 'kafedrası', nom: 'Kafedra', gen: 'Kafedranın' },
  { suffix: 'şöbəsi', nom: 'Şöbə', gen: 'Şöbənin' },
  { suffix: 'fakültəsi', nom: 'Fakültə', gen: 'Fakültənin' },
  { suffix: 'şurası', nom: 'Şura', gen: 'Şuranın' },
  { suffix: 'kolleci', nom: 'Kollec', gen: 'Kollecin' },
];

/** Bölmə adının sonluğundan tip törədir (Mərkəz/Mərkəzin, Kafedra/Kafedranın
 * və s.). Uyğunluq yoxdursa (məs. "Elmi Şura" — "şurası" YOX, çılpaq "Şura")
 * `null` qaytarır. */
export function unitType(name: string): { nom: string; gen: string } | null {
  const lower = azLower(name);
  return UNIT_TYPE_SUFFIXES.find((t) => lower.endsWith(t.suffix)) ?? null;
}

/**
 * F5.42 — tip slug-dan (ru/en adında «kafedrası» sonluğu yoxdur, slug isə
 * bütün dillərdə eynidir — K2). Səhifənin yuxarı sətri və fakültə/kafedra
 * ayrımı üçün; «… haqqında» kimi başlıqlar az adından (`unitType`) qalır.
 */
const SLUG_TYPE: [string, string][] = [
  ['merkezi', 'mərkəzi'],
  ['kafedrasi', 'kafedrası'],
  ['sobesi', 'şöbəsi'],
  ['fakultesi', 'fakültəsi'],
  ['surasi', 'şurası'],
  ['kolleci', 'kolleci'],
];
export function unitTypeBySlug(slug: string): { nom: string; gen: string } | null {
  for (const [part, suffix] of SLUG_TYPE) {
    if (new RegExp(`(^|-)${part}($|-)`).test(slug)) return UNIT_TYPE_SUFFIXES.find((t) => t.suffix === suffix) ?? null;
  }
  return null;
}
