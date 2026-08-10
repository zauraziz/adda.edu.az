// ADDA CMS (Strapi 5) — məlumat çəkmə qatı.
// Server komponentlərində istifadə üçün (CORS yoxdur, sürətli, ISR keşi ilə).

// Default: PUBLIC Strapi (demo/prod) — Vercel-de HEC BIR env deyiseni teleb olunmur.
// Lokal Strapi-ye qosulmaq ucun .env.local yarat:
//   NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
// DIQQET: yalniz NEXT_PUBLIC_* brauzere inline olunur — client island-lar
// (RSVP / Reaksiya / Duzelis) sadece bunu oxuya bilir.
export const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || process.env.STRAPI_URL || 'https://adda-edu-az.onrender.com';

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
    // K17: `gallery` DE populate olunmalidir — Strapi populate olunmayan media
    // sahesini QAYTARMIR, ona gore qalereya sekilleri sessizce itirdi.
    'populate[cover]': true,
    'populate[gallery]': true,
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

/** ── K18: statik məzmun tipləri ──
 * Miqrasiyadan 53 sənəd gəldi (36 səhifə, 11 şöbə, 4 proqram, 2 fakültə),
 * amma saytda onlara marşrut yox idi — yəni əlçatmaz qalırdılar.
 * Dördü də eyni formadadır: başlıq + Markdown gövdə.
 */
export interface Department {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  about: string | null;
  locale: Locale;
}

export interface FacultyDoc {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  about: string | null;
  locale: Locale;
}

/** Statik məzmun sənədinin ümumi forması (marşrutlar bunu işlədir). */
export interface ContentDoc {
  title: string;
  slug: string;
  body: string | null;
}

async function oneBySlug<T>(
  path: string,
  slug: string,
  locale: Locale,
  extra: Record<string, QueryValue> = {},
): Promise<T | null> {
  const json = await strapiFetch<StrapiList<T>>(path, {
    locale,
    'filters[slug][$eq]': slug,
    'pagination[pageSize]': 1,
    ...extra,
  });
  return json.data?.[0] ?? null;
}

/**
 * Bütün səhifələri yığır.
 *
 * `config/api.ts`-də `maxLimit: 100`-dür. `pagination[pageSize]` daha böyük
 * verilsə Strapi onu SƏSSİZCƏ 100-ə kəsir — xəta vermir. Ona görə 163 nəfərdən
 * yalnız 100-ü qayıdırdı və `name:asc` sırasında `Ə` ilə başlayan soyadlar
 * kəsilən hissəyə düşürdü (əksər kollasiyalarda `Ə` `Z`-dən sonra gəlir).
 *
 * Həll server konfiqurasiyasını genişləndirmək DEYİL — bu, ictimai API-nin
 * səthini artırardı. Səhifələmə isə `maxLimit` nə olursa-olsun işləyir.
 *
 * `id:asc` sıralanır: səhifələr arasında sabitlik üçün açar UNİKAL olmalıdır.
 * Ad üzrə sıralasaq, eyni adlı iki qeyd səhifə sərhədində təkrarlana və ya
 * itə bilərdi. Görünüş sırası onsuz da UI-da yenidən qurulur.
 */
async function fetchAllPages<T>(
  path: string,
  query: Record<string, string | number | boolean>,
  hardCap = 3000,
): Promise<T[]> {
  const out: T[] = [];
  for (let page = 1; page <= 60; page++) {
    const json = await strapiFetch<StrapiList<T>>(path, {
      ...query,
      sort: 'id:asc',
      'pagination[page]': page,
      'pagination[pageSize]': 100,
    });
    const rows = json.data ?? [];
    out.push(...rows);
    const pc = json.meta?.pagination?.pageCount;
    if (!rows.length || !pc || page >= pc || out.length >= hardCap) break;
  }
  return out;
}

/** Bir tipin bütün slug-ları — `generateStaticParams` üçün. */
async function allSlugs(path: string, locale: Locale): Promise<string[]> {
  try {
    const rows = await fetchAllPages<{ slug: string }>(path, { locale, 'fields[0]': 'slug' });
    return rows.map((r) => r.slug).filter(Boolean);
  } catch {
    return [];
  }
}

/** Slug ilə səhifə. */
export async function getPageBySlug(slug: string, locale: Locale = 'az'): Promise<PageDoc | null> {
  return oneBySlug<PageDoc>('/pages', slug, locale);
}
export const getDepartmentBySlug = (slug: string, locale: Locale = 'az') =>
  oneBySlug<Department>('/departments', slug, locale);
export const getProgramBySlug = (slug: string, locale: Locale = 'az') =>
  oneBySlug<Program>('/programs', slug, locale);
export const getFacultyBySlug = (slug: string, locale: Locale = 'az') =>
  oneBySlug<FacultyDoc>('/faculties', slug, locale);

export const getPageSlugs = (locale: Locale = 'az') => allSlugs('/pages', locale);
export const getDepartmentSlugs = (locale: Locale = 'az') => allSlugs('/departments', locale);
export const getProgramSlugs = (locale: Locale = 'az') => allSlugs('/programs', locale);
export const getFacultySlugs = (locale: Locale = 'az') => allSlugs('/faculties', locale);


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

/** ── F2.5b: səhifələnmiş lent ──
 * `getFeed` yalnız `data`-nı qaytarır və `meta.pagination`-ı atır. Siyahı
 * səhifələri üçün ümumi say lazımdır (840 xəbər / 346 elan), ona görə ayrıca
 * variant. Xəta olsa boş nəticə — səhifə sınmasın.
 */
export interface FeedPage<T> {
  items: T[];
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export async function getFeedPage<T>(
  contentType: FeedContentType,
  locale: Locale,
  params: FeedParams = {},
  defaultSort = 'publishedAt:desc',
): Promise<FeedPage<T>> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = params.limit ?? 12;
  try {
    const json = await strapiFetch<StrapiList<T>>(
      '/' + contentType,
      { locale, ...buildFeedQuery({ ...params, page, limit: pageSize }, defaultSort) },
      params.revalidate ?? 60,
    );
    const p = json.meta?.pagination;
    return {
      items: json.data ?? [],
      page: p?.page ?? page,
      pageSize: p?.pageSize ?? pageSize,
      pageCount: p?.pageCount ?? 1,
      total: p?.total ?? (json.data?.length ?? 0),
    };
  } catch (err) {
    console.error('[feed] ' + contentType + ' sehife ' + page + ' cekilmedi: ' + (err as Error).message);
    return { items: [], page, pageSize, pageCount: 0, total: 0 };
  }
}

/** Səhifələnmiş akademiya lentləri (siyahı səhifələri üçün). */
export const getAcademyArticlesPage = (locale: Locale = 'az', page = 1, pageSize = 12) =>
  getFeedPage<Article>('articles', locale, { visibility: 'academy', page, limit: pageSize }, 'newsDate:desc');
export const getAcademyAnnouncementsPage = (locale: Locale = 'az', page = 1, pageSize = 12) =>
  getFeedPage<Announcement>('announcements', locale, { visibility: 'academy', page, limit: pageSize }, 'publishAt:desc');

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


/** ── Sabiq rektorlar (K27b) ── */
export interface Rector {
  documentId?: string;
  slug: string;
  name: string;
  termFrom: number;
  /** Hazırda vəzifədə olan üçün boş qala bilər. */
  termTo: number | null;
  degree: string | null;
  summary: string | null;
  /** Markdown — abzaslar boş sətirlə ayrılır. */
  bio: string | null;
  died: string | null;
  photo?: StrapiMedia | null;
  sortOrder: number;
  locale: Locale;
}

/**
 * Bütün rektorlar, XRONOLOJİ sıra ilə (`termFrom`).
 *
 * Detal səhifəsi də bu siyahını çəkir (tək qeyd yox): əvvəlki/sonrakı keçidi
 * üçün qonşular onsuz da lazımdır, dörd qeyd üçün ikinci sorğu mənasızdır.
 *
 * `sortOrder` ƏSAS açar DEYİL: Strapi-də yeni qeydin defolt dəyəri 0-dır və
 * belə qeyd siyahının başına düşürdü. Xronologiya məlumatın öz xassəsidir,
 * `sortOrder` yalnız eyni ildə başlayan qeydlər üçün əl ilə düzəlişdir.
 *
 * Xəta halında boş massiv qaytarır — çağıran tərəf `RECTORS_FALLBACK`-a keçir.
 */
export async function getRectors(locale: Locale = 'az'): Promise<Rector[]> {
  try {
    const json = await strapiFetch<StrapiList<Rector>>('/rectors', {
      locale,
      'sort[0]': 'termFrom:asc',
      'sort[1]': 'sortOrder:asc',
      'pagination[pageSize]': 100,
      'populate[photo]': true,
    });
    return json.data ?? [];
  } catch (err) {
    console.error('[rectors] cekilmedi: ' + (err as Error).message);
    return [];
  }
}

/** ── Sosial bölmə (K31) ── */
export interface SocialBlock {
  eyebrow: string | null;
  /** `<em>` icazəlidir — başlığın vurğulu hissəsi. */
  title: string | null;
  lead: string | null;
  /** `<em>` və `<br>` icazəlidir. */
  ctaText: string | null;
  ctaTag: string | null;
  /** Sətir-sətir və ya vergüllə ayrılmış heşteqlər. */
  hashtags: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
  facebookUrl: string | null;
  linkedinUrl: string | null;
}

export type SocialNetwork = 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'linkedin';

export interface SocialPost {
  documentId?: string;
  network: SocialNetwork;
  handle: string;
  url: string;
  image?: StrapiMedia | null;
  /** Altyazı üç dildə — tip LOKALLAŞDIRILMIR (səbəb `getSocialPosts`-da). */
  caption: string | null;
  captionRu: string | null;
  captionEn: string | null;
  hashtag: string | null;
  video: boolean;
  duration: string | null;
  likes: number | null;
  comments: number | null;
  views: number | null;
  shares: number | null;
  sortOrder: number;
}

export async function getSocialBlock(locale: Locale = 'az'): Promise<SocialBlock | null> {
  try {
    const json = await strapiFetch<{ data: SocialBlock | null }>('/social-block', { locale });
    return json.data ?? null;
  } catch (err) {
    console.error('[social-block] cekilmedi: ' + (err as Error).message);
    return null;
  }
}

/**
 * Karusel kartları.
 *
 * `locale` SORĞUYA VERİLMİR və content-type lokallaşdırılmır.
 * K31-də lokallaşdırılmışdı və nəticə belə oldu: Strapi admin panelində
 * defolt dil `en`-dir, redaktor kartı orada yaradırdı, `?locale=az` isə
 * SIFIR qeyd qaytarırdı — kartlar bazada var idi, amma azərbaycanca ana
 * səhifədə heç vaxt görünmürdü. Kartın 90%-i onsuz da dilsizdir (şəbəkə,
 * hesab, link, şəkil, rəqəmlər); yalnız altyazı dəyişir, o da üç ayrıca
 * sahədədir. Bir kart = bir qeyd.
 *
 * SIRA: `sortOrder` artan, sonra ən yenisi əvvəldə. Sxemdə defolt dəyər
 * 100-dür — yəni yeni paylaşım heç nəyi qabaqlamır, sadəcə tarixə görə
 * yuxarı düşür. Bir kartı önə sancmaq üçün redaktor daha KİÇİK rəqəm yazır.
 */
export async function getSocialPosts(limit = 12): Promise<SocialPost[]> {
  try {
    const json = await strapiFetch<StrapiList<SocialPost>>('/social-posts', {
      'sort[0]': 'sortOrder:asc',
      'sort[1]': 'createdAt:desc',
      'pagination[pageSize]': limit,
      'populate[image]': true,
    });
    return json.data ?? [];
  } catch (err) {
    console.error('[social-posts] cekilmedi: ' + (err as Error).message);
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

// ── K26: struktur bölmələri və heyət ──────────────────────────────────────

export type StaffType = 'akademik' | 'telimci_texniki' | 'inzibati' | 'rehberlik' | 'diger';

/** Bir şəxsin bir vəzifəsi. Bir adamın birdən çox vəzifəsi ola bilər. */
export interface StaffRole {
  staffType: StaffType;
  position: string;
  unitName: string | null;
  sortOrder: number | null;
}

export interface Person {
  id: number;
  documentId: string;
  name: string;
  /** "Ad Ata adı Soyad" — göstərmək üçün. `name` ştatdakı "Soyad Ad Ata"dır. */
  displayName: string | null;
  slug: string;
  staffType: StaffType;
  position: string | null;
  roles: StaffRole[];
  locale: Locale;
}

export interface OrgUnit {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  about: string | null;
  vacancies: { position: string }[] | null;
  parent: { slug: string; name: string } | null;
  locale: Locale;
}

/**
 * Bütün struktur bölmələri (valideyn əlaqəsi ilə).
 *
 * Ağac BURADA qurulmur — səhifə qurur. Səbəb: Strapi iç-içə populate-i
 * dərinlik üzrə məhdudlaşdırır, 4 səviyyəli ağacı bir sorğu ilə tam gətirmək
 * mümkün deyil. Düz siyahı + valideyn slug-ı həmişə işləyir.
 */
export async function getUnits(locale: Locale = 'az'): Promise<OrgUnit[]> {
  return fetchAllPages<OrgUnit>('/units', {
    locale,
    'populate[vacancies]': true,
    'populate[parent][fields][0]': 'slug',
    'populate[parent][fields][1]': 'name',
  });
}

/**
 * Bütün heyət (vəzifələri ilə).
 *
 * `roles` komponenti POPULATE OLUNMALIDIR — Strapi populate edilməyən
 * komponenti ümumiyyətlə qaytarmır, sahə sadəcə cavabda olmur. Populate
 * yazmasaq siyahılar səssizcə boş çıxar.
 */
export async function getStaff(locale: Locale = 'az'): Promise<Person[]> {
  return fetchAllPages<Person>('/people', { locale, 'populate[roles]': true });
}

/** Bütün fakültələr. */
export async function getFaculties(locale: Locale = 'az'): Promise<FacultyDoc[]> {
  const json = await strapiFetch<StrapiList<FacultyDoc>>('/faculties', {
    locale,
    sort: 'name:asc',
    'pagination[pageSize]': 100,
  });
  return json.data ?? [];
}
// K26-11 — heyət kataloqu üçün genişləndirilmiş tiplər və sorğular.

export interface StaffLanguage {
  lang: 'az' | 'tr' | 'en' | 'ru' | 'diger';
  level: string | null;
}
export interface StaffScholar {
  spin: string | null;
  orcid: string | null;
  researcherId: string | null;
  scopusAuthorId: string | null;
  googleScholar: string | null;
}
export interface StaffTag {
  label: string;
}
export interface StaffPublication {
  title: string;
  year: number | null;
  source: string | null;
  url: string | null;
}
export interface StaffExperience {
  period: string;
  organization: string;
  position: string | null;
  sortYear: number | null;
}
export interface StaffEducation {
  period: string;
  institution: string;
  qualification: string | null;
  sortYear: number | null;
}

export type AcademicDegree = 'elmler_doktoru' | 'felsefe_doktoru' | 'yoxdur';

/** Tam profil — yalnız fərdi səhifədə işlədilir. */
export interface PersonFull extends Person {
  academicTitle: string | null;
  academicDegree: AcademicDegree | null;
  phone: string | null;
  altEmail: string | null;
  /** Əməkdaşın öz redaktəsinin vaxtı. Admin dəyişikliyi bunu təzələmir. */
  profileUpdatedAt: string | null;
  office: string | null;
  building: string | null;
  bio: string | null;
  photo: StrapiMedia | null;
  email: string | null;
  languages: StaffLanguage[] | null;
  scholar: StaffScholar | null;
  researchAreas: StaffTag[] | null;
  teaching: string | null;
  publications: StaffPublication[] | null;
  experience: StaffExperience[] | null;
  education: StaffEducation[] | null;
  responsibilities: string | null;
  other: string | null;
  unit: { name: string; slug: string } | null;
  faculty: FacultyRef | null;
}

/**
 * Kataloq üçün heyət — kart üçün lazım olan sahələr.
 *
 * `populate` SİYAHISI TAM OLMALIDIR: Strapi populate edilməyən komponenti və
 * media sahəsini ümumiyyətlə qaytarmır — sahə cavabda görünmür, xəta da
 * vermir. Bir ad unudulsa həmin filtr səssizcə boş qalır.
 */
export async function getStaffDirectory(locale: Locale = 'az'): Promise<PersonFull[]> {
  return fetchAllPages<PersonFull>('/people', {
    locale,
    'populate[roles]': true,
    'populate[photo]': true,
    'populate[researchAreas]': true,
    'populate[languages]': true,
    'populate[unit][fields][0]': 'name',
    'populate[unit][fields][1]': 'slug',
    'populate[faculty][fields][0]': 'name',
    'populate[faculty][fields][1]': 'slug',
  });
}

/** Bir əməkdaşın tam profili. */
export async function getPersonBySlug(slug: string, locale: Locale = 'az'): Promise<PersonFull | null> {
  const json = await strapiFetch<StrapiList<PersonFull>>('/people', {
    locale,
    'filters[slug][$eq]': slug,
    'pagination[pageSize]': 1,
    'populate[roles]': true,
    'populate[photo]': true,
    'populate[languages]': true,
    'populate[scholar]': true,
    'populate[researchAreas]': true,
    'populate[publications]': true,
    'populate[experience]': true,
    'populate[education]': true,
    'populate[unit][fields][0]': 'name',
    'populate[unit][fields][1]': 'slug',
    'populate[faculty][fields][0]': 'name',
    'populate[faculty][fields][1]': 'slug',
  });
  return json.data?.[0] ?? null;
}

/** Statik generasiya üçün bütün slug-lar. */
export const getPersonSlugs = (locale: Locale = 'az') => allSlugs('/people', locale);

/**
 * Bir struktur bölməsi — valideyn, alt bölmələr və heyəti ilə.
 *
 * `unit` (2025 təşkilati sxemi) və `department` (köhnə saytdan miqrasiya)
 * EYNİ ŞEYİ modelləşdirir, amma cəmi 5 slug-da üst-üstə düşür. `unit`-də
 * iyerarxiya və heyət var, `department`-də isə mətn məzmunu. Ona görə
 * `/struktur/[slug]` HƏR İKİSİNƏ baxır və tapdığını birləşdirir.
 */
export async function getUnitBySlug(slug: string, locale: Locale = 'az'): Promise<OrgUnit | null> {
  const json = await strapiFetch<StrapiList<OrgUnit>>('/units', {
    locale,
    'filters[slug][$eq]': slug,
    'pagination[pageSize]': 1,
    'populate[vacancies]': true,
    'populate[parent][fields][0]': 'slug',
    'populate[parent][fields][1]': 'name',
  });
  return json.data?.[0] ?? null;
}

export const getUnitSlugs = (locale: Locale = 'az') => allSlugs('/units', locale);
