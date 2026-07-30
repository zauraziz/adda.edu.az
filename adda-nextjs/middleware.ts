import { NextRequest, NextResponse } from 'next/server';
import { LEGACY_REDIRECTS } from '@/lib/legacy-redirects';

const LOCALES = ['az', 'ru', 'en'];
const DEFAULT = 'az';

// Köhnə saytın URL naxışı: /az/news/1981 və ya (dilsiz) /news/1981
const LEGACY = new RegExp(
  '^(?:/(' + LOCALES.join('|') + '))?/(content|news|announce|faculty|photogallery)/(\\d+)/?$',
);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── 1) Köhnə URL-lər ──────────────────────────────────────────────────
  //
  // `adda.edu.az/az/news/1981` kimi ünvanlar Google indeksindədir və xarici
  // saytlardan link alır. Yönləndirmə olmasa hamısı 404 verər.
  //
  // 301 (permanent) İŞLƏNİR: axtarış sistemi köhnə URL-i yeni ilə əvəz etsin.
  // 307/308 metodu qoruyur, amma bu marşrutlar yalnız GET-dir.
  const legacy = LEGACY.exec(pathname);
  if (legacy) {
    const [, loc, section, id] = legacy;
    const locale = loc && LOCALES.includes(loc) ? loc : DEFAULT;
    // Foto qalereya artıq ayrıca səhifə deyil — xəbərin özünə aparılır.
    const key = (section === 'photogallery' ? 'news' : section) + '/' + id;
    const target = LEGACY_REDIRECTS[key];
    if (target) {
      const url = req.nextUrl.clone();
      url.pathname = '/' + locale + '/' + target;
      url.search = '';
      return NextResponse.redirect(url, 301);
    }
    // Xəritədə yoxdursa aşağı düşür — dil məntiqi və ya 404.
  }

  // ── 2) Dil prefiksi ───────────────────────────────────────────────────
  const hasLocale = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/${DEFAULT}${pathname === '/' ? '' : pathname}`;
  // 308 (permanent): dilsiz ünvan həmişə eyni yerə gedir, müvəqqəti deyil.
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
