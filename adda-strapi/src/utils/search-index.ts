/**
 * F5.58 — sayt axtarışı: bütün məzmun, yaddaşda indeks.
 *
 * ƏVVƏL (K25): hər sorğu 7 növü bazada `$containsi` ilə axtarırdı və sorğu TAM
 * sətir kimi götürülürdü — «Sambur Həmdulla oğlu» yalnız eyni yazılışla və
 * sözlərin həmin sırası ilə tapılırdı, «e/ə», «u/ü» fərqi nəticəni sıfırlayırdı.
 * Əməkdaş, sənəd, auditoriya, sabiq rektor, qəhrəman, tarix və sertifikat heç
 * axtarılmırdı (Zaur müəllim, 26.10.2026: sabiq rektor «Sambur Həmdullaoğlu»
 * tapılmırdı).
 *
 * İNDİ:
 *   • Dil üzrə YADDAŞDA indeks: ilk sorğuda qurulur, məzmun dəyişəndə (Document
 *     Service middleware → `markSearchDirty`) növbəti sorğuda yenidən — köhnə
 *     indeks qurulma bitənə qədər cavab verir. Hər sorğu bazaya getmir: Neon
 *     sorğu üçün oyanmır (F5.56).
 *   • Mətn bükülür: kiçik hərf («İ/I» düzgün), ə→e, ı→i, ö→o, ü→u, ş→s, ç→c,
 *     ğ→g, ё→е, latın diakritikləri; hərf və rəqəmdən başqası boşluq. Bükmə
 *     simvol-simvol, uzunluq SAXLANIR — tapılan yerin parçası orijinaldan kəsilir.
 *   • Sorğu sözlərə bölünür; HƏR söz sənədin hər hansı sahəsində söz başlanğıcı
 *     kimi olmalıdır (sıra fərq etmir, şəkilçi: «akademiya» → «Akademiyasının»).
 *     «Həmdullaoğlu» → «Həmdulla» (bitişik «oğlu/qızı» ayrılır), tək «oğlu»,
 *     «qızı», «və» məcburi deyil. Başlıqda (ad, soyad) 5+ hərfli sözdə bir hərf
 *     səhvinə dözülür («Hamdulla» → «Həmdulla»).
 *   • Sıra: başlıqda tam söz > başlıqda başlanğıc > səhvə dözümlü başlıq > mətn;
 *     başlıqda bütöv ifadə; növ (əməkdaş, bölmə, səhifə önə); xəbərdə yenilik.
 *   • ru/en-də nəticə azdırsa az məzmunu da göstərilir (`lang: 'az'`).
 *
 * Növlər: xəbər, elan, tədbir, səhifə (köçmüş səhifələr xaric), ixtisas, bölmə
 * və fakültə, əməkdaş, sənəd (əsasnamə, qayda…), auditoriya, sabiq rektor,
 * qəhrəman, tarix (mərhələ), sertifikat. Hər nəticədə `url` — saytda yol (dilsiz,
 * «/emekdas/…») və ya faylın tam ünvanı.
 *
 * Standalone kompilyasiya olunur — `@strapi/strapi` tipləri yalnız `type` importu.
 */
import type { Core } from '@strapi/strapi';
import { MOVED_PAGE_SLUGS } from './moved-pages';
import { envUrl } from './env-url';

type Row = Record<string, unknown>;
export type Locale = 'az' | 'ru' | 'en';
export const LOCALES: Locale[] = ['az', 'ru', 'en'];

const TAG = '[axtaris] F5.58';
const BODY_CAP = 30_000;
const MIN_GAP_MS = 10_000;

// ── Bükmə (uzunluq saxlanır) ─────────────────────────────────────────────────

const FOLD: Record<string, string> = { ə: 'e', ı: 'i', ö: 'o', ü: 'u', ş: 's', ç: 'c', ğ: 'g', ё: 'е' };
const WORD = /[\p{L}\p{N}]/u;
const CHAR_CACHE = new Map<string, string>();

function foldChar(c: string): string {
  const hit = CHAR_CACHE.get(c);
  if (hit !== undefined) return hit;
  let l: string;
  if (c === 'İ' || c === 'I') l = 'i';
  else {
    l = c.toLowerCase();
    if (l.length !== 1) l = c;
  }
  if (FOLD[l]) l = FOLD[l];
  else {
    const code = l.charCodeAt(0);
    // Latın diakritikləri (é → e); kiril və başqaları olduğu kimi.
    if (code >= 0xc0 && code < 0x250) {
      const d = l.normalize('NFKD')[0];
      if (d && /[a-z]/.test(d)) l = d;
    }
  }
  const out = WORD.test(l) ? l : ' ';
  CHAR_CACHE.set(c, out);
  return out;
}

/** Kiçik hərf + diakritik bükmə; hərf/rəqəm olmayan → boşluq. Uzunluq EYNİDİR. */
export function foldSame(s: string): string {
  const parts: string[] = [];
  for (let i = 0; i < s.length; i++) parts.push(foldChar(s[i]));
  return parts.join('');
}

/** Markdown/HTML-dən oxunan mətn. */
export function cleanText(raw: unknown): string {
  if (typeof raw !== 'string' || !raw) return '';
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^[ \t]*[-*+>]\s+/gm, '')
    .replace(/^[ \t]*#{1,6}\s+/gm, '')
    .replace(/^\s*\|?[-:| ]{3,}\|?\s*$/gm, ' ')
    .replace(/[*_`|]/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Sorğu ────────────────────────────────────────────────────────────────────

const STOP = new Set(['oglu', 'qizi', 've', 'ile', 'the', 'and', 'of', 'in', 'for', 'и', 'в', 'на', 'по', 'для', 'с']);
const GLUED = /^(.{3,}?)(oglu|qizi)$/;

/** Sorğunun sözləri (bükülmüş). «Həmdullaoğlu» → «hemdulla». */
export function queryTokens(q: string): string[] {
  const out: string[] = [];
  for (let t of foldSame(String(q ?? '')).split(' ')) {
    if (!t) continue;
    const m = t.length >= 7 ? GLUED.exec(t) : null;
    if (m) t = m[1];
    if (t.length < 2) continue;
    if (!out.includes(t)) out.push(t);
  }
  const strong = out.filter((t) => !STOP.has(t));
  return (strong.length ? strong : out).slice(0, 8);
}

// ── İndeks qeydi ─────────────────────────────────────────────────────────────

export interface Entry {
  /** Növ (nəticədə `contentType`). */
  t: string;
  id: string;
  slug: string;
  /** Saytda yol (dilsiz) və ya faylın tam ünvanı. */
  url: string;
  title: string;
  /** Mətndə uyğunluq yoxdursa göstərilən qısa izah. */
  sub: string;
  cat: string;
  date: number;
  boost: number;
  /** ' ' + bükülmüş başlıq (+ alternativ adlar) + ' '. */
  tf: string;
  words: string[];
  /** Orijinal mətn (parça üçün) və onun bükülmüşü (' ' + … + ' '). */
  body: string;
  bf: string;
}

export interface EntryInput {
  t: string;
  id: string;
  slug?: string;
  url: string;
  title: string;
  /** Uyğunlaşma üçün əlavə adlar (məs. əməkdaşın «Soyad Ad Ata» yazılışı). */
  alt?: string[];
  sub?: string;
  body?: string;
  cat?: string;
  date?: unknown;
  boost?: number;
}

const time = (v: unknown): number => {
  const t = typeof v === 'string' || typeof v === 'number' ? Date.parse(String(v)) : NaN;
  return Number.isFinite(t) ? t : 0;
};

export function makeEntry(i: EntryInput): Entry | null {
  const title = cleanText(i.title);
  if (!title || !i.url) return null;
  const titleAll = [title, ...(i.alt ?? []).map(cleanText).filter(Boolean)].join(' · ');
  const tf = ' ' + foldSame(titleAll) + ' ';
  let body = cleanText(i.body ?? '');
  if (body.length > BODY_CAP) body = body.slice(0, BODY_CAP);
  return {
    t: i.t,
    id: i.id,
    slug: i.slug ?? '',
    url: i.url,
    title,
    sub: cleanText(i.sub ?? ''),
    cat: i.cat ?? '',
    date: time(i.date),
    boost: i.boost ?? 0,
    tf,
    words: tf.split(' ').filter((w) => w.length >= 3),
    body,
    bf: ' ' + foldSame(body) + ' ',
  };
}

// ── Axtarış ──────────────────────────────────────────────────────────────────

/** Levenshtein, `max`-dan böyükdürsə max+1 (erkən dayanma). */
export function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      cur.push(v);
      if (v < best) best = v;
    }
    if (best > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

/** Başlıq sözlərindən biri sorğu sözünə (onun uzunluğunda başlanğıcı) bir hərf yaxındırmı? */
function fuzzyTitle(e: Entry, tk: string): boolean {
  if (tk.length < 5) return false;
  const max = tk.length >= 9 ? 2 : 1;
  for (const w of e.words) {
    if (w.length < tk.length - max) continue;
    const head = w.slice(0, tk.length);
    if (editDistance(head, tk, max) <= max) return true;
  }
  return false;
}

export interface Hit {
  documentId: string;
  title: string;
  slug: string;
  url: string;
  excerpt: string;
  contentType: string;
  category: string;
  lang?: Locale;
  score: number;
}

const RECENT_TYPES = new Set(['article', 'announcement', 'event']);

function excerptOf(e: Entry, tokens: string[], titleOnly: boolean): string {
  // Bütün sözlər başlıqdadırsa (ad, səhifə adı) qısa izah daha faydalıdır: vəzifə, illər…
  if (titleOnly && e.sub) return e.sub.length > 180 ? e.sub.slice(0, 177).trimEnd() + '…' : e.sub;
  let at = -1;
  // Ən uzun (ən xüsusi) sözün mətndəki ilk yeri.
  for (const tk of [...tokens].sort((a, b) => b.length - a.length)) {
    const i = e.bf.indexOf(' ' + tk);
    if (i >= 0) {
      at = i; // bf-də ' ' + söz: söz orijinalda i mövqeyindən başlayır (önündəki boşluq +1 sürüşməni bərabərləşdirir)
      break;
    }
  }
  if (at < 0) {
    const s = e.sub || e.body;
    return s.length > 180 ? s.slice(0, 177).trimEnd() + '…' : s;
  }
  const from = Math.max(0, at - 60);
  let start = from;
  if (from > 0) {
    const sp = e.body.indexOf(' ', from);
    if (sp >= 0 && sp < at) start = sp + 1;
  }
  const part = e.body.slice(start, start + 170).trim();
  return (start > 0 ? '…' : '') + part + (start + 170 < e.body.length ? '…' : '');
}

/** Bütün sözlər uyğun gələn qeydlər, bal ilə. */
export function searchEntries(entries: Entry[], tokens: string[], query: string, now = Date.now()): Hit[] {
  if (!tokens.length) return [];
  const phrase = ' ' + tokens.join(' ');
  const whole = foldSame(String(query ?? '')).replace(/\s+/g, ' ').trim();
  const out: Hit[] = [];
  for (const e of entries) {
    let s = 0;
    let ok = true;
    let inTitle = 0;
    for (const tk of tokens) {
      const pre = ' ' + tk;
      if (e.tf.includes(pre + ' ')) {
        s += 120;
        inTitle++;
      } else if (e.tf.includes(pre)) {
        s += 80;
        inTitle++;
      } else if (e.bf.includes(pre)) s += e.bf.indexOf(pre) < 400 ? 22 : 15;
      else if (fuzzyTitle(e, tk)) {
        s += 40;
        inTitle++;
      } else {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    const titleF = e.tf.trim();
    if (whole && titleF === whole) s += 300;
    else if (tokens.length > 1 && e.tf.includes(phrase)) s += 150;
    s += e.boost;
    if (e.title.length < 80) s += 10;
    if (RECENT_TYPES.has(e.t) && e.date) {
      const years = (now - e.date) / (365 * 86_400_000);
      s += Math.max(0, 30 - years * 10);
    }
    out.push({
      documentId: e.id,
      title: e.title,
      slug: e.slug,
      url: e.url,
      excerpt: excerptOf(e, tokens, inTitle === tokens.length),
      contentType: e.t,
      category: e.cat,
      score: s,
    });
  }
  out.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, 'az'));
  return out;
}

// ── Mənbələr ─────────────────────────────────────────────────────────────────

interface DocService {
  findMany(args: Row): Promise<Row[]>;
  findFirst?(args: Row): Promise<Row | null>;
}
const docs = (strapi: Core.Strapi, uid: string): DocService => strapi.documents(uid as never) as unknown as DocService;
const str = (v: unknown): string => (typeof v === 'string' ? v : v == null ? '' : String(v));
const join = (...parts: unknown[]): string => parts.map(str).filter((s) => s.trim()).join('\n');
const pick = (locale: Locale, az: unknown, ru: unknown, en: unknown): string =>
  (locale === 'ru' ? str(ru) : locale === 'en' ? str(en) : '') || str(az);

export function absUrl(u: string): string {
  if (!u || !u.startsWith('/')) return u;
  return envUrl('ADMIN_PUBLIC_URL', 'https://adda-edu-az.onrender.com') + u;
}

/** Sertifikatın lövbəri — adda-nextjs lib/cert.ts `certAnchor` ilə EYNİ. */
export function certAnchor(s: string): string {
  const low = s.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
  let out = '';
  for (const ch of low) out += FOLD[ch] ?? ch;
  out = out.normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
  return out.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60).replace(/-+$/g, '') || 'sertifikat';
}

async function all(strapi: Core.Strapi, uid: string, args: Row, cap = 6000): Promise<Row[]> {
  const out: Row[] = [];
  for (let start = 0; start < cap; start += 500) {
    const rows = await docs(strapi, uid).findMany({ ...args, start, limit: 500 });
    out.push(...rows);
    if (rows.length < 500) break;
  }
  return out;
}

const faqText = (faq: unknown): string =>
  (Array.isArray(faq) ? (faq as Row[]) : []).map((f) => join(f.question, f.answer)).join('\n');

type Loader = (strapi: Core.Strapi, locale: Locale) => Promise<EntryInput[]>;

export const SEARCH_SOURCES: { uid: string; name: string; load: Loader }[] = [
  {
    uid: 'api::article.article',
    name: 'xəbər',
    load: async (s, locale) =>
      (await all(s, 'api::article.article', { locale, status: 'published', fields: ['title', 'slug', 'excerpt', 'tldr', 'body', 'category', 'newsDate', 'publishedAt'] })).map((r) => ({
        t: 'article',
        id: str(r.documentId),
        slug: str(r.slug),
        url: r.slug ? `/xeberler/${str(r.slug)}` : '',
        title: str(r.title),
        sub: str(r.excerpt) || str(r.tldr),
        body: join(r.excerpt, r.tldr, r.body),
        cat: str(r.category),
        date: r.newsDate || r.publishedAt,
      })),
  },
  {
    uid: 'api::announcement.announcement',
    name: 'elan',
    load: async (s, locale) =>
      (await all(s, 'api::announcement.announcement', { locale, status: 'published', fields: ['title', 'slug', 'excerpt', 'body', 'importance', 'publishAt', 'publishedAt'] })).map((r) => ({
        t: 'announcement',
        id: str(r.documentId),
        slug: str(r.slug),
        url: r.slug ? `/elanlar/${str(r.slug)}` : '',
        title: str(r.title),
        sub: str(r.excerpt),
        body: join(r.excerpt, r.body),
        cat: str(r.importance),
        date: r.publishAt || r.publishedAt,
      })),
  },
  {
    uid: 'api::event.event',
    name: 'tədbir',
    load: async (s, locale) =>
      (await all(s, 'api::event.event', { locale, status: 'published', fields: ['title', 'slug', 'excerpt', 'body', 'format', 'startAt', 'venueBuilding', 'venueRoom', 'publishedAt'] })).map((r) => ({
        t: 'event',
        id: str(r.documentId),
        slug: str(r.slug),
        url: r.slug ? `/tedbirler/${str(r.slug)}` : '',
        title: str(r.title),
        sub: str(r.excerpt),
        body: join(r.excerpt, r.body, r.venueBuilding, r.venueRoom),
        cat: str(r.format),
        date: r.startAt || r.publishedAt,
        boost: 10,
      })),
  },
  {
    uid: 'api::page.page',
    name: 'səhifə',
    load: async (s, locale) =>
      (
        await all(s, 'api::page.page', {
          locale,
          status: 'published',
          // F5.43 — bölməyə köçmüş səhifələr nəticədə çıxmır (ünvanları /struktur-a yönlənir).
          filters: { slug: { $notIn: MOVED_PAGE_SLUGS } },
          fields: ['title', 'slug', 'lead', 'body', 'seoDescription', 'contact', 'stepsTitle'],
          populate: { faq: true, steps: true, facts: true },
        })
      ).map((r) => ({
        t: 'page',
        id: str(r.documentId),
        slug: str(r.slug),
        url: r.slug ? `/sehife/${str(r.slug)}` : '',
        title: str(r.title),
        sub: str(r.lead) || str(r.seoDescription),
        body: join(
          r.lead,
          r.body,
          ...(Array.isArray(r.steps) ? (r.steps as Row[]).map((x) => join(x.title, x.body, x.who)) : []),
          ...(Array.isArray(r.facts) ? (r.facts as Row[]).map((x) => join(x.label, x.value)) : []),
          faqText(r.faq),
          r.contact,
        ),
        boost: 30,
      })),
  },
  {
    uid: 'api::program.program',
    name: 'ixtisas',
    load: async (s, locale) =>
      (
        await all(s, 'api::program.program', {
          locale,
          status: 'published',
          fields: ['title', 'slug', 'tagline', 'description', 'overview', 'code', 'degree', 'careerPaths'],
          populate: { courses: { fields: ['name', 'code'] }, faq: true },
        })
      ).map((r) => ({
        t: 'program',
        id: str(r.documentId),
        slug: str(r.slug),
        url: r.slug ? `/ixtisaslar/${str(r.slug)}` : '',
        title: str(r.title),
        alt: [str(r.code)],
        sub: str(r.tagline),
        body: join(
          r.tagline,
          r.description,
          r.overview,
          r.careerPaths,
          (Array.isArray(r.courses) ? (r.courses as Row[]) : []).map((c) => str(c.name)).join(', '),
          faqText(r.faq),
        ),
        cat: str(r.degree),
        boost: 30,
      })),
  },
  {
    uid: 'api::unit.unit',
    name: 'bölmə',
    load: async (s, locale) =>
      (
        await all(s, 'api::unit.unit', {
          locale,
          status: 'published',
          fields: ['name', 'slug', 'about', 'mission', 'functions', 'services', 'receptionHours', 'building', 'room'],
          populate: { faq: true },
        })
      ).map((r) => ({
        // F5.41 — fakültənin səhifəsi struktur bölmədir; nəticədə «Fakültə» yazılır.
        t: str(r.slug).endsWith('-fakultesi') ? 'faculty' : 'unit',
        id: str(r.documentId),
        slug: str(r.slug),
        url: r.slug ? `/struktur/${str(r.slug)}` : '',
        title: str(r.name),
        sub: str(r.mission),
        body: join(r.mission, r.about, r.functions, r.services, faqText(r.faq)),
        boost: 40,
      })),
  },
  {
    uid: 'api::person.person',
    name: 'əməkdaş',
    load: async (s, locale) =>
      (
        await all(s, 'api::person.person', {
          status: 'published',
          fields: ['name', 'displayName', 'slug', 'position', 'positionRu', 'positionEn', 'academicTitle', 'academicTitleRu', 'academicTitleEn', 'email', 'bio', 'bioRu', 'bioEn'],
          populate: { roles: true, unit: { fields: ['name'] }, researchAreas: true },
        })
      ).map((r) => {
        const roles = Array.isArray(r.roles) ? (r.roles as Row[]) : [];
        const unit = (r.unit as Row | null)?.name;
        const own = pick(locale, r.position, r.positionRu, r.positionEn);
        const posts = roles.length
          ? roles.map((x) => [str(x.position), str(x.unitName)].filter(Boolean).join(', '))
          : [[own, str(unit)].filter(Boolean).join(', ')];
        const uniq = [...new Set(posts.filter(Boolean))];
        return {
          t: 'person',
          id: str(r.documentId),
          slug: str(r.slug),
          url: r.slug ? `/emekdas/${str(r.slug)}` : '',
          title: str(r.displayName) || str(r.name),
          alt: [str(r.name), str(r.displayName)],
          sub: uniq.join(' · '),
          body: join(
            uniq.join('\n'),
            own,
            unit,
            pick(locale, r.academicTitle, r.academicTitleRu, r.academicTitleEn),
            r.email,
            (Array.isArray(r.researchAreas) ? (r.researchAreas as Row[]) : []).map((x) => str(x.label)).join(', '),
            pick(locale, r.bio, r.bioRu, r.bioEn),
          ),
          boost: 40,
        };
      }),
  },
  {
    uid: 'api::document.document',
    name: 'sənəd',
    load: async (s, locale) =>
      (
        await all(s, 'api::document.document', {
          status: 'published',
          fields: ['title', 'titleRu', 'titleEn', 'description', 'descriptionRu', 'descriptionEn', 'category', 'url', 'year'],
          populate: { file: { fields: ['url'] } },
        })
      ).map((r) => {
        const own = str(r.url).trim();
        const file = absUrl(str((r.file as Row | null)?.url));
        return {
          t: 'document',
          id: str(r.documentId),
          url: own.startsWith('/') || own.startsWith('http') ? own : file,
          title: pick(locale, r.title, r.titleRu, r.titleEn),
          alt: [str(r.title), str(r.titleRu), str(r.titleEn)],
          sub: pick(locale, r.description, r.descriptionRu, r.descriptionEn),
          body: join(r.description, r.descriptionRu, r.descriptionEn),
          cat: str(r.category),
          boost: 20,
        };
      }),
  },
  {
    uid: 'api::facility.facility',
    name: 'auditoriya',
    load: async (s, locale) =>
      (
        await all(s, 'api::facility.facility', {
          locale,
          status: 'published',
          fields: ['name', 'slug', 'roomNumber', 'description', 'facilityType', 'software', 'relatedProgram'],
        })
      ).map((r) => ({
        t: 'facility',
        id: str(r.documentId),
        slug: str(r.slug),
        // lib/strapi.ts facilityKey: slug yoxdursa documentId.
        url: `/auditoriyalar/${str(r.slug) || str(r.documentId)}`,
        title: str(r.name),
        alt: [str(r.roomNumber)],
        sub: str(r.description),
        body: join(r.description, r.software, r.relatedProgram, r.roomNumber),
        cat: str(r.facilityType),
        boost: 15,
      })),
  },
  {
    uid: 'api::rector.rector',
    name: 'sabiq rektor',
    load: async (s, locale) =>
      (await all(s, 'api::rector.rector', { locale, fields: ['name', 'slug', 'termFrom', 'termTo', 'degree', 'summary', 'bio'] })).map((r) => {
        const term = [r.termFrom, r.termTo].filter((x) => x != null && x !== '').map(str).join('–');
        return {
          t: 'rector',
          id: str(r.documentId),
          slug: str(r.slug),
          url: r.slug ? `/sabiq-rektorlar/${str(r.slug)}` : '',
          title: str(r.name),
          sub: [term, str(r.degree)].filter(Boolean).join(' · ') || str(r.summary),
          body: join(r.summary, r.degree, r.bio),
          boost: 30,
        };
      }),
  },
  {
    uid: 'api::hero.hero',
    name: 'qəhrəman',
    load: async (s, locale) =>
      (
        await all(s, 'api::hero.hero', {
          locale,
          status: 'published',
          fields: ['name', 'slug', 'birthPlace', 'addaProgram', 'studyYears', 'martyrdomPlace', 'biography'],
          populate: { honors: true },
        })
      ).map((r) => ({
        t: 'hero',
        id: str(r.documentId),
        slug: str(r.slug),
        url: r.slug ? `/qehremanlarimiz/${str(r.slug)}` : '',
        title: str(r.name),
        sub: [str(r.addaProgram), str(r.studyYears)].filter(Boolean).join(', '),
        body: join(
          r.addaProgram,
          r.birthPlace,
          r.martyrdomPlace,
          (Array.isArray(r.honors) ? (r.honors as Row[]) : []).map((x) => str(x.label)).join(', '),
          r.biography,
        ),
        boost: 25,
      })),
  },
  {
    uid: 'api::milestone.milestone',
    name: 'tarix',
    load: async (s, locale) =>
      (await all(s, 'api::milestone.milestone', { locale, fields: ['year', 'title', 'description'] })).map((r) => ({
        t: 'milestone',
        id: str(r.documentId),
        url: r.year != null ? `/tarix#il-${str(r.year)}` : '/tarix',
        title: [str(r.year), str(r.title)].filter(Boolean).join(': '),
        sub: str(r.description),
        body: str(r.description),
        boost: 5,
      })),
  },
  {
    uid: 'api::cert-block.cert-block',
    name: 'sertifikat',
    load: async (s, locale) => {
      const svc = docs(s, 'api::cert-block.cert-block');
      const row = svc.findFirst ? await svc.findFirst({ populate: { items: true } }) : (await svc.findMany({ populate: { items: true }, limit: 1 }))[0];
      const items = Array.isArray(row?.items) ? (row?.items as Row[]) : [];
      return items
        .filter((it) => it.hidden !== true)
        .map((it, i) => ({
          t: 'cert',
          id: `${str(row?.documentId)}-${i}`,
          url: `/sertifikatlar#${certAnchor(str(it.short) || str(it.title))}`,
          title: pick(locale, it.title, it.titleRu, it.titleEn),
          alt: [str(it.short), pick(locale, it.short, it.shortRu, it.shortEn)],
          sub: pick(locale, it.short, it.shortRu, it.shortEn),
          boost: 15,
        }));
    },
  },
];

export const SEARCH_UIDS = new Set(SEARCH_SOURCES.map((s) => s.uid));
/** Dili olan növlər — ru/en-də az ehtiyatı yalnız bunlar üçün. */
export const LOCALIZED_TYPES = new Set(['article', 'announcement', 'event', 'page', 'program', 'unit', 'faculty', 'facility', 'rector', 'hero', 'milestone']);

export async function buildIndex(strapi: Core.Strapi, locale: Locale): Promise<Entry[]> {
  const t0 = Date.now();
  const out: Entry[] = [];
  const counts: string[] = [];
  for (const src of SEARCH_SOURCES) {
    try {
      const rows = await src.load(strapi, locale);
      let n = 0;
      for (const r of rows) {
        const e = makeEntry(r);
        if (e) {
          out.push(e);
          n++;
        }
      }
      counts.push(`${src.name} ${n}`);
    } catch (err) {
      // Bir növün sxemi dəyişibsə qalanları sınmasın.
      strapi.log.warn(`${TAG}: ${src.uid} atlandı — ${(err as Error).message}`);
    }
  }
  strapi.log.info(`${TAG}: indeks (${locale}) ${out.length} qeyd, ${Math.round((Date.now() - t0) / 100) / 10} s — ${counts.join(', ')}.`);
  return out;
}

// ── Keş ──────────────────────────────────────────────────────────────────────

let version = 1;
const built = new Map<Locale, { v: number; at: number; entries: Entry[] }>();
const building = new Map<Locale, Promise<Entry[]>>();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Məzmun dəyişdi: indeks növbəti sorğuda yenidən qurulur. */
export function markSearchDirty(): void {
  version++;
}

/**
 * Dilin indeksi. Köhnəlibsə yenisi arxa planda qurulur, o vaxta qədər köhnəsi
 * cavab verir (bir sorğu gecikmə); ardıcıl yenidənqurmalar arasında ən azı
 * MIN_GAP_MS — kütləvi redaktədə baza dalbadal oxunmasın.
 */
export async function indexFor(strapi: Core.Strapi, locale: Locale): Promise<Entry[]> {
  const cur = built.get(locale);
  if (cur && cur.v === version) return cur.entries;
  let p = building.get(locale);
  if (!p) {
    const v = version;
    const wait = cur ? Math.max(0, MIN_GAP_MS - (Date.now() - cur.at)) : 0;
    p = sleep(wait)
      .then(() => buildIndex(strapi, locale))
      .then((entries) => {
        built.set(locale, { v, at: Date.now(), entries });
        return entries;
      })
      .finally(() => building.delete(locale));
    building.set(locale, p);
  }
  if (cur) {
    p.catch(() => undefined);
    return cur.entries;
  }
  return p;
}

const WRITES = new Set(['create', 'update', 'delete', 'publish', 'unpublish', 'discardDraft', 'clone']);

/** register(): axtarılan növlərdə yazı → indeks köhnəlir. */
export function registerSearchIndex(strapi: Core.Strapi): void {
  (strapi.documents as unknown as { use: (m: unknown) => void }).use(async (context: Row, next: () => Promise<unknown>) => {
    const result = await next();
    if (SEARCH_UIDS.has(String(context.uid ?? '')) && WRITES.has(String(context.action ?? ''))) markSearchDirty();
    return result;
  });
}

// ── Sorğu (controller) ───────────────────────────────────────────────────────

export interface SearchResult {
  hits: Omit<Hit, 'score'>[];
  total: number;
  counts: Record<string, number>;
  query: string;
  locale: Locale;
}

export async function siteSearch(
  strapi: Core.Strapi,
  q: string,
  locale: Locale,
  limit: number,
  types: string[] = [],
): Promise<SearchResult> {
  const tokens = queryTokens(q);
  if (q.trim().length < 2 || !tokens.length) return { hits: [], total: 0, counts: {}, query: q, locale };
  let res = searchEntries(await indexFor(strapi, locale), tokens, q);
  if (locale !== 'az' && res.length < Math.max(limit, 8)) {
    const seen = new Set(res.map((h) => `${h.contentType}:${h.documentId}`));
    const extra = searchEntries(await indexFor(strapi, 'az'), tokens, q)
      .filter((h) => LOCALIZED_TYPES.has(h.contentType) && !seen.has(`${h.contentType}:${h.documentId}`))
      .map((h) => ({ ...h, lang: 'az' as Locale, score: h.score - 50 }));
    res = res.concat(extra);
  }
  const counts: Record<string, number> = {};
  for (const h of res) counts[h.contentType] = (counts[h.contentType] ?? 0) + 1;
  const want = types.length ? res.filter((h) => types.includes(h.contentType)) : res;
  return {
    hits: want.slice(0, limit).map(({ score: _score, ...rest }) => rest),
    total: want.length,
    counts,
    query: q,
    locale,
  };
}
