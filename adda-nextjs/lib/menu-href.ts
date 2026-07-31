// K26 — menyu URL-lərinə dil prefiksi.
//
// NİYƏ LAZIMDIR: `menu` single type Strapi-də YALNIZ `az` lokalında saxlanılır;
// label-lər render vaxtı `tr(label, locale)` ilə tərcümə olunur. URL də eyni
// yolu getməlidir, əks halda rus istifadəçi `/az/sehife/rektor` linkini görər.
//
// Ona görə SEED-də URL-lər DİL PREFİKSİZ saxlanılır (`/sehife/rektor`) və
// prefiks burada, render vaxtı əlavə olunur.
//
// TOXUNULMAYAN HALLAR:
//   '#'            — açılan menyunun valideyni və ya URL-i hələ məlum olmayan
//                    xarici e-xidmət. Prefiks əlavə etmək onu sındırardı.
//   http(s)://…    — xarici sayt
//   mailto: / tel: — protokol keçidləri
//   /az|/ru|/en …  — artıq prefikslidir (ikiqat prefiksin qarşısını alır)

import type { Locale } from './i18n';

const ABSOLUTE = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
const ALREADY_PREFIXED = /^\/(?:az|ru|en)(?:\/|$)/;

export function menuHref(url: string | null | undefined, locale: Locale): string {
  const u = (url ?? '').trim();
  if (!u || u === '#') return '#';
  if (ABSOLUTE.test(u)) return u;
  if (!u.startsWith('/')) return u;
  if (ALREADY_PREFIXED.test(u)) return u;
  return `/${locale}${u}`;
}

/** `/hazirlanir/...` — hələ məzmunu olmayan menyu bəndi. */
export function isPlaceholderHref(url: string | null | undefined): boolean {
  return (url ?? '').startsWith('/hazirlanir/');
}
