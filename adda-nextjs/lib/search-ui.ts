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
  program: 'ixtisaslar',
  faculty: 'fakulteler',
};

export function searchHref(locale: string, contentType: string | undefined, slug: string | undefined): string | null {
  const route = SEARCH_ROUTES[contentType || ''];
  if (!route || !slug) return null;
  return '/' + locale + '/' + route + '/' + slug;
}

export const SEARCH_UI: Record<Locale, SearchUi> = {
  az: {
    ph: 'Xəbər, ixtisas, səhifə axtar...',
    types: {
      article: 'Xəbər',
      announcement: 'Elan',
      event: 'Tədbir',
      program: 'İxtisas',
      page: 'Səhifə',
      department: 'Struktur',
      faculty: 'Fakültə',
    },
    empty: 'Nəticə tapılmadı',
    loading: 'Axtarılır…',
    error: 'Xəta baş verdi',
  },
  ru: {
    ph: 'Поиск: новости, специальности, страницы...',
    types: {
      article: 'Новость',
      announcement: 'Объявление',
      event: 'Мероприятие',
      program: 'Специальность',
      page: 'Страница',
      department: 'Структура',
      faculty: 'Факультет',
    },
    empty: 'Ничего не найдено',
    loading: 'Идёт поиск…',
    error: 'Произошла ошибка',
  },
  en: {
    ph: 'Search news, programmes, pages...',
    types: {
      article: 'News',
      announcement: 'Announcement',
      event: 'Event',
      program: 'Programme',
      page: 'Page',
      department: 'Structure',
      faculty: 'Faculty',
    },
    empty: 'No results found',
    loading: 'Searching…',
    error: 'Something went wrong',
  },
};
