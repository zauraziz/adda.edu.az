// F5.46 — markdown HTML-indəki keçidlər: saytdaxili «/…» ünvanına dil
// prefiksi, xarici keçid yeni vərəqdə. SectionPage (səhifə) və bölmə
// səhifəsi (struktur/[slug]) eyni qaydanı işlədir — redaktor mətnində
// «/sehife/x» yazır, ru/en səhifəsində keçid /ru/sehife/x olur.
import type { Locale } from './i18n';

export const isExternalHref = (u: string) => /^(https?:)?\/\//i.test(u) || /^mailto:|^tel:/i.test(u);

/** Saytdaxili «/…» ünvanına dil prefiksi; xarici, «#» və artıq prefiksli olduğu kimi. */
export function localHref(url: string, locale: Locale): string {
  const u = url.trim();
  if (!u || u.startsWith('#') || isExternalHref(u)) return u;
  if (!u.startsWith('/')) return u;
  if (/^\/(az|ru|en)(\/|$|[?#])/.test(u)) return u;
  return `/${locale}${u === '/' ? '' : u}`;
}

/** `marked` HTML-indəki <a href> keçidləri (bax localHref). */
export function localizeLinks(html: string, locale: Locale): string {
  return html.replace(/<a href="([^"]+)"/g, (_m, href: string) => {
    const h = localHref(href, locale);
    return isExternalHref(h) && !/^mailto:|^tel:/i.test(h) ? `<a href="${h}" target="_blank" rel="noopener noreferrer"` : `<a href="${h}"`;
  });
}
