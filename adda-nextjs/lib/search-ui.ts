import type { Locale } from './i18n';

// Axtarış modalının mətnləri. Server (SiteHeaderStack → placeholder) və
// client island (HeaderIsland → nəticələr) eyni mənbədən oxuyur ki,
// ru/en-də placeholder "az flash"-ı olmasın.
export type SearchUi = {
  ph: string;
  types: Record<string, string>;
  empty: string;
  loading: string;
  error: string;
  /** F5.58 — modalın altında tam nəticələr səhifəsinə keçid («Bütün nəticələr (N)»). */
  all: string;
  /** ru/en-də az dilində olan nəticənin nişanı. */
  azOnly: string;
};

/**
 * K20 — nəticə tipindən marşruta.
 *
 * Əvvəl nəticələr `href="#"` idi, yəni axtarış tapsa da heç yerə aparmırdı.
 * Marşrutlar `middleware.ts`-dəki yönləndirmə hədəfləri ilə eyni olmalıdır.
 */
export const SEARCH_ROUTES: Record<string, string> = {
  article: 'xeberler',
  announcement: 'elanlar',
  event: 'tedbirler',
  page: 'sehife',
  department: 'struktur',
  // F5.43 — kafedra, şöbə, mərkəz (struktur bölmə); köhnə `department` arxivdir.
  unit: 'struktur',
  program: 'ixtisaslar',
  // F5.41 — fakültənin səhifəsi struktur bölmədir (slug eyni); Strapi
  // site-search «faculty» nəticəsini də bölmələrdən verir.
  faculty: 'struktur',
  // F5.58 — bütün məzmun: əməkdaş, auditoriya, sabiq rektor, qəhrəman.
  person: 'emekdas',
  facility: 'auditoriyalar',
  rector: 'sabiq-rektorlar',
  hero: 'qehremanlarimiz',
};

export function searchHref(locale: string, contentType: string | undefined, slug: string | undefined): string | null {
  const route = SEARCH_ROUTES[contentType || ''];
  if (!route || !slug) return null;
  return '/' + locale + '/' + route + '/' + slug;
}

/** F5.58 — Strapi site-search nəticəsi. */
export interface SearchHit {
  documentId?: string;
  title?: string;
  slug?: string;
  /** Saytda yol (dilsiz, «/emekdas/…») və ya faylın tam ünvanı. */
  url?: string;
  excerpt?: string;
  contentType?: string;
  category?: string;
  /** ru/en-də nəticə azdırsa əlavə olunan az məzmunu. */
  lang?: string;
}

/** Nəticənin ünvanı: `url` (dil prefiksi ilə) və ya köhnə növ + slug qaydası. */
export function hitHref(locale: string, h: SearchHit): { href: string; external: boolean } | null {
  const lang = h.lang || locale;
  const url = (h.url || '').trim();
  if (/^https?:\/\//i.test(url)) return { href: url, external: true };
  if (url.startsWith('/')) return { href: '/' + lang + url, external: false };
  const href = searchHref(lang, h.contentType, h.slug);
  return href ? { href, external: false } : null;
}

/** Tam nəticələr səhifəsi. */
export const searchPageHref = (locale: string, q: string, type?: string): string =>
  `/${locale}/axtaris?q=${encodeURIComponent(q)}${type ? `&tip=${encodeURIComponent(type)}` : ''}`;

export const SEARCH_UI: Record<Locale, SearchUi> = {
  az: {
    ph: 'Ad, səhifə, sənəd, xəbər axtar...',
    types: {
      article: 'Xəbər',
      announcement: 'Elan',
      event: 'Tədbir',
      program: 'İxtisas',
      page: 'Səhifə',
      department: 'Struktur',
      unit: 'Struktur',
      faculty: 'Fakültə',
      person: 'Əməkdaş',
      document: 'Sənəd',
      facility: 'Auditoriya',
      rector: 'Sabiq rektor',
      hero: 'Qəhrəman',
      milestone: 'Tarix',
      cert: 'Sertifikat',
    },
    empty: 'Nəticə tapılmadı',
    loading: 'Axtarılır…',
    error: 'Xəta baş verdi',
    all: 'Bütün nəticələr',
    azOnly: 'az',
  },
  ru: {
    ph: 'Поиск: сотрудник, страница, документ, новость...',
    types: {
      article: 'Новость',
      announcement: 'Объявление',
      event: 'Мероприятие',
      program: 'Специальность',
      page: 'Страница',
      department: 'Структура',
      unit: 'Структура',
      faculty: 'Факультет',
      person: 'Сотрудник',
      document: 'Документ',
      facility: 'Аудитория',
      rector: 'Бывший ректор',
      hero: 'Герой',
      milestone: 'История',
      cert: 'Сертификат',
    },
    empty: 'Ничего не найдено',
    loading: 'Идёт поиск…',
    error: 'Произошла ошибка',
    all: 'Все результаты',
    azOnly: 'az',
  },
  en: {
    ph: 'Search people, pages, documents, news...',
    types: {
      article: 'News',
      announcement: 'Announcement',
      event: 'Event',
      program: 'Programme',
      page: 'Page',
      department: 'Structure',
      unit: 'Structure',
      faculty: 'Faculty',
      person: 'Staff',
      document: 'Document',
      facility: 'Facility',
      rector: 'Former rector',
      hero: 'Hero',
      milestone: 'History',
      cert: 'Certificate',
    },
    empty: 'No results found',
    loading: 'Searching…',
    error: 'Something went wrong',
    all: 'All results',
    azOnly: 'az',
  },
};
