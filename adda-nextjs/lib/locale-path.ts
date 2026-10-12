// F5.49 — dil dəyişəndə EYNİ səhifənin digər dildəki ünvanı (əvvəl dil
// düyməsi həmişə ana səhifəyə aparırdı). Xəbər, elan və tədbirin tərcüməsi
// adətən olmur (detal səhifəsi az-a qayıtmır) — onlarda siyahıya aparır.
// Klient komponentlərində (LangMenu, MobileNav) usePathname() ilə işlənir.
import { LOCALES, type Locale } from './i18n';

/** Tərcüməsi olmaya bilən detal səhifələri: /<dil>/<bölmə>/<slug> → /<dil>/<bölmə>. */
const DETAIL_SECTIONS = new Set(['xeberler', 'elanlar', 'tedbirler']);

export function switchLocalePath(pathname: string | null | undefined, target: Locale): string {
  const parts = (pathname ?? '').split('/').filter(Boolean);
  if (!parts.length || !(LOCALES as string[]).includes(parts[0])) return `/${target}`;
  const rest = parts.slice(1);
  if (rest.length >= 2 && DETAIL_SECTIONS.has(rest[0])) return `/${target}/${rest[0]}`;
  return '/' + [target, ...rest].join('/');
}
