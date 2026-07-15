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

export const SEARCH_UI: Record<Locale, SearchUi> = {
  az: {
    ph: 'Xəbər, ixtisas, səhifə axtar...',
    types: { article: 'Xəbər', program: 'İxtisas', page: 'Səhifə' },
    empty: 'Nəticə tapılmadı',
    loading: 'Axtarılır…',
    error: 'Xəta baş verdi',
  },
  ru: {
    ph: 'Поиск: новости, специальности, страницы...',
    types: { article: 'Новость', program: 'Специальность', page: 'Страница' },
    empty: 'Ничего не найдено',
    loading: 'Идёт поиск…',
    error: 'Произошла ошибка',
  },
  en: {
    ph: 'Search news, programmes, pages...',
    types: { article: 'News', program: 'Programme', page: 'Page' },
    empty: 'No results found',
    loading: 'Searching…',
    error: 'Something went wrong',
  },
};
