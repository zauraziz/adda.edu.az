import { NextRequest, NextResponse } from 'next/server';
import { LEGACY_REDIRECTS } from '@/lib/legacy-redirects';

const LOCALES = ['az', 'ru', 'en'];
const DEFAULT = 'az';

// Köhnə saytın URL naxışı: /az/news/1981 və ya (dilsiz) /news/1981.
// `config.mjs`-dəki zonda görə köhnə sayt TƏMİZ URL işlədir — `.php` və ya
// sorğu parametri formaları yoxdur, ona görə bu naxış tam əhatə edir.
//
// `i` bayrağı: xarici saytlardan gələn linklərdə `/AZ/News/123` kimi hallar
// olur. Bölmə və dil aşağıda kiçildilir.
const LEGACY = new RegExp(
  '^(?:/(' + LOCALES.join('|') + '))?/(content|news|announce|faculty|photogallery)/(\\d+)/?$',
  'i',
);

/**
 * `photogallery` YÖNLƏNDİRİLMİR.
 *
 * Bu bölmə heç vaxt zondlanmayıb (`config.mjs`-dəki SECTIONS-da yoxdur), ona
 * görə `photogallery/123` ilə `news/123` eyni sənəd olub-olmadığı BİLİNMİR.
 * Təxmin tutmasa istifadəçi TAMAM BAŞQA xəbərə düşər — bu, 404-dən pisdir.
 *
 * Yoxlamaq üçün köhnə saytda müqayisə et:
 *   https://adda.edu.az/az/photogallery/1984
 *   https://adda.edu.az/az/news/1984
 * Eyni məzmundursa bunu `true` et — başqa dəyişiklik lazım deyil.
 */
const PHOTOGALLERY_MATCHES_NEWS = false;

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
    const [, rawLoc, rawSection, id] = legacy;
    const loc = rawLoc ? rawLoc.toLowerCase() : '';
    const section = rawSection.toLowerCase();
    const locale = loc && LOCALES.includes(loc) ? loc : DEFAULT;

    const key =
      section === 'photogallery'
        ? PHOTOGALLERY_MATCHES_NEWS
          ? 'news/' + id
          : ''
        : section + '/' + id;

    const target = key ? LEGACY_REDIRECTS[key] : undefined;
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
