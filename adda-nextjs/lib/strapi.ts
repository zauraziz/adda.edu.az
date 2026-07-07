// ADDA CMS (Strapi 5) — məlumat çəkmə qatı.
// Server komponentlərində istifadə üçün (CORS yoxdur, sürətli, ISR keşi ilə).

const STRAPI_URL = process.env.STRAPI_URL ?? 'http://localhost:1337';

export type Locale = 'az' | 'ru' | 'en';

export interface StrapiMedia {
  url: string;
  alternativeText: string | null;
  width: number | null;
  height: number | null;
}

export interface Article {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  category: 'xeber' | 'elan' | 'tedbir' | 'elm';
  newsDate: string | null;
  cover: StrapiMedia | null;
  publishedAt: string;
  locale: Locale;
}

export interface Program {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  faculty: string | null;
  description: string | null;
  degree: 'bachelor' | 'master' | 'phd';
  durationYears: number | null;
  locale: Locale;
}

export interface PageDoc {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  body: string | null;
  seoDescription: string | null;
  locale: Locale;
}

interface StrapiList<T> {
  data: T[];
  meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } };
}

type QueryValue = string | number | boolean | undefined;

async function strapiFetch<T>(
  path: string,
  query: Record<string, QueryValue> = {},
  revalidate = 60,
): Promise<T> {
  const url = new URL(`/api${path}`, STRAPI_URL);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  const res = await fetch(url.toString(), { next: { revalidate } });
  if (!res.ok) {
    throw new Error(`Strapi ${res.status} ${res.statusText} — ${path}`);
  }
  return res.json() as Promise<T>;
}

/** Nisbi media yolunu (/uploads/...) mütləq URL-ə çevirir. */
export function mediaUrl(media: StrapiMedia | null | undefined): string | null {
  if (!media?.url) return null;
  return media.url.startsWith('http') ? media.url : `${STRAPI_URL}${media.url}`;
}

/** Son xəbərlər (örtük şəkli ilə). */
export async function getArticles(locale: Locale = 'az', limit = 6): Promise<Article[]> {
  const json = await strapiFetch<StrapiList<Article>>('/articles', {
    locale,
    sort: 'newsDate:desc',
    'pagination[pageSize]': limit,
    populate: 'cover',
  });
  return json.data ?? [];
}

/** Slug ilə bir xəbər. */
export async function getArticleBySlug(slug: string, locale: Locale = 'az'): Promise<Article | null> {
  const json = await strapiFetch<StrapiList<Article>>('/articles', {
    locale,
    'filters[slug][$eq]': slug,
    populate: 'cover',
    'pagination[pageSize]': 1,
  });
  return json.data?.[0] ?? null;
}

/** Bütün ixtisaslar. */
export async function getPrograms(locale: Locale = 'az'): Promise<Program[]> {
  const json = await strapiFetch<StrapiList<Program>>('/programs', {
    locale,
    sort: 'title:asc',
    'pagination[pageSize]': 100,
  });
  return json.data ?? [];
}

/** Ana səhifə xəbər kartı üçün sadələşdirilmiş forma (şəkil URL-i mütləqləşdirilmiş). */
export interface NewsItem {
  title: string;
  category: Article['category'];
  date: string | null;
  image: string | null;
  slug: string;
}

/** Ana səhifə üçün son xəbərlər — server tərəfdə mütləq şəkil URL-i ilə. */
export async function getHomeNews(locale: Locale = 'az', limit = 4): Promise<NewsItem[]> {
  const articles = await getArticles(locale, limit);
  return articles.map((a) => ({
    title: a.title,
    category: a.category,
    date: a.newsDate ?? a.publishedAt,
    image: mediaUrl(a.cover),
    slug: a.slug,
  }));
}

/** Slug ilə səhifə. */
export async function getPageBySlug(slug: string, locale: Locale = 'az'): Promise<PageDoc | null> {
  const json = await strapiFetch<StrapiList<PageDoc>>('/pages', {
    locale,
    'filters[slug][$eq]': slug,
    'pagination[pageSize]': 1,
  });
  return json.data?.[0] ?? null;
}

export { STRAPI_URL };
