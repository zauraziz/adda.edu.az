// ADDA CMS (Strapi 5) — məlumat çəkmə qatı.
// Server komponentlərində istifadə üçün (CORS yoxdur, sürətli, ISR keşi ilə).

export const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || process.env.STRAPI_URL || 'http://localhost:1337';

export type Locale = 'az' | 'ru' | 'en';

export interface StrapiMedia {
  url: string;
  alternativeText: string | null;
  width: number | null;
  height: number | null;
}

/** ── F2.4: Görünürlük & əlaqə referansları ── */
export type Visibility = 'academy' | 'faculty' | 'person';
export type HomeStatus = 'none' | 'pending' | 'approved';

/** Populate olunmuş relation-ların yüngül forması (yalnız name+slug seçilir). */
export interface TagRef { id: number; documentId: string; name: string; slug: string; }
export interface FacultyRef { id: number; documentId: string; name: string; slug: string; }
export interface PersonRef { id: number; documentId: string; name: string; slug: string; }

export interface Article {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  tldr: string | null;
  body: string | null;
  category: 'xeber' | 'elan' | 'tedbir' | 'elm';
  newsDate: string | null;
  readingMinutes: number | null;
  cover: StrapiMedia | null;
  visibility: Visibility;
  showOnHome: boolean;
  homeStatus: HomeStatus;
  // Relation/media — yalnız populate olunduqda mövcuddur:
  gallery?: StrapiMedia[];
  faculty?: FacultyRef | null;
  person?: PersonRef | null;
  tags?: TagRef[];
  publishedAt: string;
  locale: Locale;
}

export interface Program {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  faculty?: FacultyRef | null; // F2.2: string -> relation (populate ilə gəlir)
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
    'populate[faculty][fields][0]': 'name',
    'populate[faculty][fields][1]': 'slug',
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


/** ── F2.4: Elan (announcement) tipi ── */
export interface Announcement {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  cover: StrapiMedia | null;
  importance: 'normal' | 'vacib' | 'kritik';
  publishAt: string | null;
  expiresAt: string | null;
  deadlineAt: string | null;
  requiresAck: boolean;
  visibility: Visibility;
  showOnHome: boolean;
  homeStatus: HomeStatus;
  attachments?: StrapiMedia[];
  faculty?: FacultyRef | null;
  person?: PersonRef | null;
  tags?: TagRef[];
  publishedAt: string;
  locale: Locale;
}

/** ── F2.4: Tədbir (event) tipi ── */
export interface EventSpeaker {
  name: string;
  role: string | null;
  org: string | null;
  photo: StrapiMedia | null;
}

export interface EventItem {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  cover: StrapiMedia | null;
  format: 'fiziki' | 'onlayn' | 'hibrid';
  startAt: string | null;
  endAt: string | null;
  venueBuilding: string | null;
  venueRoom: string | null;
  onlineUrl: string | null;
  platform: string | null;
  capacity: number | null;
  visibility: Visibility;
  showOnHome: boolean;
  homeStatus: HomeStatus;
  speakers?: EventSpeaker[];
  faculty?: FacultyRef | null;
  person?: PersonRef | null;
  tags?: TagRef[];
  publishedAt: string;
  locale: Locale;
}

/** ── F2.4: Görünürlük lenti (academy / faculty / person iyerarxiyası) ──
 *
 * Model: `visibility` content-in AUDİTORİYA əhatəsidir —
 *   academy → bütün akademiya (qlobal lent, ana səhifə)
 *   faculty → yalnız həmin fakultə səhifəsi
 *   person  → yalnız həmin şəxs səhifəsi
 *
 * Primitivlər sadədir (bir scope = bir sorğu); səhifə (F2.5) lazım olduqda
 * kompozisiya edir (məs. fakultə səhifəsi academy + faculty lentini ayrı çağırır).
 *
 * QEYD (F2.3): relation-lar lokala-scoped-dur. ru lentində `faculty.slug` filtri
 * yalnız faculty-nin ru versiyası mövcud olduqda nəticə verir — F2.3 sinxronu
 * bunu təmin edir (target hər lokalda olduqda relation aynalanır).
 */
export type FeedContentType = 'articles' | 'announcements' | 'events';

export interface FeedParams {
  visibility?: Visibility;
  facultySlug?: string;
  personSlug?: string;
  upcoming?: boolean; // yalnız events: startAt >= indi
  limit?: number;
  page?: number;
  sort?: string;
  revalidate?: number;
}

function buildFeedQuery(p: FeedParams, defaultSort: string): Record<string, QueryValue> {
  const q: Record<string, QueryValue> = {
    'pagination[pageSize]': p.limit ?? 12,
    'pagination[page]': p.page ?? 1,
    sort: p.sort ?? defaultSort,
    'populate[cover]': true,
    'populate[faculty][fields][0]': 'name',
    'populate[faculty][fields][1]': 'slug',
    'populate[person][fields][0]': 'name',
    'populate[person][fields][1]': 'slug',
    'populate[tags][fields][0]': 'name',
    'populate[tags][fields][1]': 'slug',
  };
  if (p.visibility) q['filters[visibility][$eq]'] = p.visibility;
  if (p.facultySlug) q['filters[faculty][slug][$eq]'] = p.facultySlug;
  if (p.personSlug) q['filters[person][slug][$eq]'] = p.personSlug;
  if (p.upcoming) q['filters[startAt][$gte]'] = new Date().toISOString();
  return q;
}

/** Ümumi lent çəkici — content type + scope. Xəta olsa boş massiv (ana səhifə sınmasın). */
export async function getFeed<T>(
  contentType: FeedContentType,
  locale: Locale,
  params: FeedParams = {},
  defaultSort = 'publishedAt:desc',
): Promise<T[]> {
  try {
    const json = await strapiFetch<StrapiList<T>>(
      '/' + contentType,
      { locale, ...buildFeedQuery(params, defaultSort) },
      params.revalidate ?? 60,
    );
    return json.data ?? [];
  } catch (err) {
    console.error('[feed] ' + contentType + ' (' + locale + ') cekilmedi: ' + (err as Error).message);
    return [];
  }
}

/* Xəbər (article) lentləri */
export const getAcademyArticles = (locale: Locale = 'az', limit?: number) =>
  getFeed<Article>('articles', locale, { visibility: 'academy', limit }, 'newsDate:desc');
export const getFacultyArticles = (facultySlug: string, locale: Locale = 'az', limit?: number) =>
  getFeed<Article>('articles', locale, { visibility: 'faculty', facultySlug, limit }, 'newsDate:desc');
export const getPersonArticles = (personSlug: string, locale: Locale = 'az', limit?: number) =>
  getFeed<Article>('articles', locale, { visibility: 'person', personSlug, limit }, 'newsDate:desc');

/* Elan (announcement) lentləri */
export const getAcademyAnnouncements = (locale: Locale = 'az', limit?: number) =>
  getFeed<Announcement>('announcements', locale, { visibility: 'academy', limit }, 'publishAt:desc');
export const getFacultyAnnouncements = (facultySlug: string, locale: Locale = 'az', limit?: number) =>
  getFeed<Announcement>('announcements', locale, { visibility: 'faculty', facultySlug, limit }, 'publishAt:desc');
export const getPersonAnnouncements = (personSlug: string, locale: Locale = 'az', limit?: number) =>
  getFeed<Announcement>('announcements', locale, { visibility: 'person', personSlug, limit }, 'publishAt:desc');

/* Tədbir (event) lentləri */
export const getAcademyEvents = (locale: Locale = 'az', limit?: number) =>
  getFeed<EventItem>('events', locale, { visibility: 'academy', limit }, 'startAt:asc');
export const getFacultyEvents = (facultySlug: string, locale: Locale = 'az', limit?: number) =>
  getFeed<EventItem>('events', locale, { visibility: 'faculty', facultySlug, limit }, 'startAt:asc');
export const getUpcomingEvents = (locale: Locale = 'az', limit?: number) =>
  getFeed<EventItem>('events', locale, { visibility: 'academy', upcoming: true, limit }, 'startAt:asc');

/** ── F2.4: Ana səhifə üçün seçilmiş (curated) xəbərlər ──
 * showOnHome=true VƏ homeStatus=approved. Boşdursa ən son academy xəbərlərinə
 * geri düşür ki, ana səhifə heç vaxt boş qalmasın.
 */
export async function getCuratedHomeArticles(locale: Locale = 'az', limit = 4): Promise<Article[]> {
  try {
    const json = await strapiFetch<StrapiList<Article>>('/articles', {
      locale,
      'filters[showOnHome][$eq]': true,
      'filters[homeStatus][$eq]': 'approved',
      sort: 'newsDate:desc',
      'pagination[pageSize]': limit,
      'populate[cover]': true,
    });
    const curated = json.data ?? [];
    if (curated.length) return curated;
  } catch (err) {
    console.error('[home] curated cekilmedi: ' + (err as Error).message);
  }
  return getAcademyArticles(locale, limit);
}


/** ── F2.5: Slug ilə tək element (detal səhifələri üçün) ──
 * Ümumi getBySlug + content-type variantları. Xəta olsa null. Detal üçün
 * relation-lar da populate olunur (faculty/person/tags), siyahıdan daha zəngin.
 */
export async function getBySlug<T>(
  contentType: FeedContentType,
  slug: string,
  locale: Locale = 'az',
  extraPopulate: Record<string, QueryValue> = {},
): Promise<T | null> {
  const query: Record<string, QueryValue> = {
    locale,
    'filters[slug][$eq]': slug,
    'pagination[pageSize]': 1,
    'populate[cover]': true,
    'populate[faculty][fields][0]': 'name',
    'populate[faculty][fields][1]': 'slug',
    'populate[person][fields][0]': 'name',
    'populate[person][fields][1]': 'slug',
    'populate[tags][fields][0]': 'name',
    'populate[tags][fields][1]': 'slug',
    ...extraPopulate,
  };
  try {
    const json = await strapiFetch<StrapiList<T>>('/' + contentType, query, 60);
    return json.data?.[0] ?? null;
  } catch (err) {
    console.error('[detail] ' + contentType + '/' + slug + ' cekilmedi: ' + (err as Error).message);
    return null;
  }
}

export const getAnnouncementBySlug = (slug: string, locale: Locale = 'az') =>
  getBySlug<Announcement>('announcements', slug, locale, { 'populate[attachments]': true });
export const getEventBySlug = (slug: string, locale: Locale = 'az') =>
  getBySlug<EventItem>('events', slug, locale, { 'populate[speakers][populate][photo]': true });


/** ── F2.5d: Mərhələ (milestone) — 144 illik Nautical marşrut ── */
export interface Milestone {
  id: number;
  documentId: string;
  year: number;
  title: string;
  description: string | null;
  era: 'temel' | 'inkisaf' | 'muasir';
  sortOrder: number;
  image?: StrapiMedia | null;
  locale: Locale;
}

export async function getMilestones(locale: Locale = 'az'): Promise<Milestone[]> {
  try {
    const json = await strapiFetch<StrapiList<Milestone>>('/milestones', {
      locale,
      sort: 'year:asc',
      'pagination[pageSize]': 100,
      'populate[image]': true,
    });
    return json.data ?? [];
  } catch (err) {
    console.error('[milestones] cekilmedi: ' + (err as Error).message);
    return [];
  }
}


/** ── Menyu (Strapi single-type "Menyu") ── */
export interface MenuLink { label: string; url: string; }
export interface MenuGroup { title: string; links: MenuLink[]; }
export interface MenuCategory { label: string; order: number; url: string; groups: MenuGroup[]; }
export interface MenuQuick { label: string; url: string; icon: string; }
export interface MenuPortalCard { label: string; description: string; url: string; icon: string; }
export interface MenuPortal { title: string; subtitle: string; cards: MenuPortalCard[]; }
export interface MenuFooterCol { title: string; links: MenuLink[]; }
export interface SiteMenu {
  esasMenyu: MenuCategory[];
  ustMenyu: MenuCategory[];
  eAkademiya: MenuPortal | null;
  istifadeciQruplari: MenuLink[];
  suretliKecidler: MenuQuick[];
  footerMenyusu: MenuFooterCol[];
}

/** Bütün saytın menyusunu CMS-dən çəkir (dərin populate ilə). */
export async function getMenu(locale: Locale = 'az'): Promise<SiteMenu | null> {
  try {
    const json = await strapiFetch<{ data: Partial<SiteMenu> | null }>('/menu', {
      locale,
      'populate[esasMenyu][populate][groups][populate][links]': true,
      'populate[ustMenyu][populate][groups][populate][links]': true,
      'populate[eAkademiya][populate][cards]': true,
      'populate[istifadeciQruplari]': true,
      'populate[suretliKecidler]': true,
      'populate[footerMenyusu][populate][links]': true,
    });
    const d = json.data;
    if (!d) return null;
    return {
      esasMenyu: (d.esasMenyu ?? []) as MenuCategory[],
      ustMenyu: (d.ustMenyu ?? []) as MenuCategory[],
      eAkademiya: (d.eAkademiya ?? null) as MenuPortal | null,
      istifadeciQruplari: (d.istifadeciQruplari ?? []) as MenuLink[],
      suretliKecidler: (d.suretliKecidler ?? []) as MenuQuick[],
      footerMenyusu: (d.footerMenyusu ?? []) as MenuFooterCol[],
    };
  } catch (err) {
    console.error('[menu] Strapi menyu cekilmedi:', (err as Error).message);
    return null;
  }
}

export { STRAPI_URL };
