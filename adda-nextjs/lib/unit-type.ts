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
