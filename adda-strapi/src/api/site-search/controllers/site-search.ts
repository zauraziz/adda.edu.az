/**
 * F2/K25 — sayt axtarışı BAZA ÜZƏRİNDƏN.
 *
 * NİYƏ MEILISEARCH-DƏN İMTİNA: pulsuz sınaq müddəti bitdi, instans söndü və
 * bütün axtarış sıradan çıxdı. Pulsuz, davamlı alternativ seçərkən ən güclü
 * arqument budur — məzmun ONSUZ DA Neon Postgres-dədir. Ayrıca indeks
 * olmayanda:
 *   - sinxronizasiya yoxdur (indeks sürüşməsi mümkün deyil)
 *   - "yenidən indeksləmə" addımı yoxdur
 *   - sınaq müddəti bitə biləcək əlavə xidmət yoxdur
 *
 * ƏVƏZİNDƏ İTİRİLƏN: yazı səhvinə dözüm (typo tolerance). Azərbaycan dili
 * üçün bu, gözlənildiyindən az itkidir — şəkilçilər sonda olduğu üçün
 * alt-sətir axtarışı işləyir: "akademiya" sorğusu "Akademiyasının" tapır.
 *
 * ENGINE ASILILIĞI YOXDUR: `$containsi` Strapi səviyyəsindədir, yəni lokal
 * SQLite və prod Postgres-də eyni davranır. Xam SQL yazılmır.
 *
 * Standalone kompilyasiya olunur — @strapi/strapi tipləri import EDİLMİR.
 */

type Row = Record<string, unknown>;

interface DocService {
  findMany(args: Row): Promise<Row[]>;
}
interface StrapiLike {
  documents(uid: string): DocService;
  log: { warn(m: string): void; error(m: string): void };
}
interface Ctx {
  query: Record<string, string | string[] | undefined>;
  body: unknown;
  status: number;
  set(field: string, value: string): void;
}

/** Axtarılan tiplər və onların sahə adları. */
const SOURCES: Array<{
  uid: string;
  contentType: string;
  title: string;
  body: string;
  excerpt?: string;
  category?: string;
}> = [
  { uid: 'api::article.article', contentType: 'article', title: 'title', body: 'body', excerpt: 'excerpt', category: 'category' },
  { uid: 'api::announcement.announcement', contentType: 'announcement', title: 'title', body: 'body', excerpt: 'excerpt', category: 'importance' },
  { uid: 'api::event.event', contentType: 'event', title: 'title', body: 'body', excerpt: 'excerpt', category: 'format' },
  { uid: 'api::page.page', contentType: 'page', title: 'title', body: 'body', excerpt: 'seoDescription' },
  { uid: 'api::department.department', contentType: 'department', title: 'name', body: 'about' },
  { uid: 'api::program.program', contentType: 'program', title: 'title', body: 'description', category: 'degree' },
  { uid: 'api::faculty.faculty', contentType: 'faculty', title: 'name', body: 'about' },
];

const LOCALES = ['az', 'ru', 'en'];
const PER_TYPE = 20;

/** Markdown işarələrini təmizlə — xülasə istifadəçiyə görünür. */
function clean(raw: unknown): string {
  if (typeof raw !== 'string' || !raw) return '';
  return raw
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^[ \t]*[-*+>]\s+/gm, '')
    .replace(/^[ \t]*#{1,6}\s+/gm, '')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Uyğun gələn hissənin ətrafından parça çıxar. */
function snippet(text: string, needle: string, max = 160): string {
  if (!text) return '';
  const at = text.toLowerCase().indexOf(needle.toLowerCase());
  if (at < 0) return text.length > max ? text.slice(0, max - 1).trimEnd() + '…' : text;
  const from = Math.max(0, at - 60);
  const part = text.slice(from, from + max);
  return (from > 0 ? '…' : '') + part.trim() + (from + max < text.length ? '…' : '');
}

/**
 * Sıralama balı — Meilisearch-in relevantlıq sıralamasını əvəz edir.
 *   başlıq tam uyğun        1000
 *   başlıq sorğu ilə başlayır 700
 *   başlıqda var             500
 *   xülasədə var             200
 *   gövdədə var              100
 * Üstünə: qısa başlıq (daha dəqiq uyğunluq) və yeni məzmun bir az irəli.
 */
function score(q: string, title: string, excerpt: string, body: string, publishedAt: unknown): number {
  const t = title.toLowerCase();
  const n = q.toLowerCase();
  let s = 0;
  if (t === n) s = 1000;
  else if (t.startsWith(n)) s = 700;
  else if (t.includes(n)) s = 500;
  else if (excerpt.toLowerCase().includes(n)) s = 200;
  else if (body.toLowerCase().includes(n)) s = 100;

  if (title.length && title.length < 80) s += 20;

  const ts = typeof publishedAt === 'string' ? Date.parse(publishedAt) : NaN;
  if (Number.isFinite(ts)) {
    // Son 3 ilin məzmunu 0..30 arası əlavə bal alır.
    const years = (Date.now() - ts) / (365 * 86_400_000);
    s += Math.max(0, 30 - years * 10);
  }
  return s;
}

export default ({ strapi }: { strapi: StrapiLike }) => ({
  async search(ctx: Ctx) {
    const raw = ctx.query.q;
    const q = (typeof raw === 'string' ? raw : '').trim().slice(0, 120);
    const locale = LOCALES.indexOf(String(ctx.query.locale)) !== -1 ? String(ctx.query.locale) : 'az';
    const limit = Math.min(20, Math.max(1, parseInt(String(ctx.query.limit ?? '8'), 10) || 8));

    ctx.set('Cache-Control', 'public, max-age=30');

    // 2 simvoldan qısa sorğu praktiki olaraq bütün bazanı qaytarardı.
    if (q.length < 2) {
      ctx.body = { hits: [], total: 0, query: q, locale };
      return;
    }

    // Tiplər PARALEL sorğulanır — 7 ardıcıl gediş-gəliş 7 dəfə yavaş olardı.
    const perType = await Promise.all(
      SOURCES.map(async (src) => {
        const or: Row[] = [{ [src.title]: { $containsi: q } }, { [src.body]: { $containsi: q } }];
        if (src.excerpt) or.push({ [src.excerpt]: { $containsi: q } });
        try {
          const rows = await strapi.documents(src.uid).findMany({
            locale,
            status: 'published',
            filters: { $or: or },
            limit: PER_TYPE,
            fields: [
              'documentId',
              'slug',
              src.title,
              src.body,
              ...(src.excerpt ? [src.excerpt] : []),
              ...(src.category ? [src.category] : []),
              'publishedAt',
            ],
          } as Row);
          return { src, rows };
        } catch (err) {
          // Bir tipin sxemi dəyişibsə qalan altısı sınmasın.
          strapi.log.warn('[search] ' + src.uid + ' atlandi: ' + (err as Error).message);
          return { src, rows: [] as Row[] };
        }
      })
    );

    const hits: Array<Row & { _score: number }> = [];
    for (const { src, rows } of perType) {
      for (const r of rows) {
        const title = String(r[src.title] ?? '');
        const bodyText = clean(r[src.body]);
        const excerptRaw = src.excerpt ? String(r[src.excerpt] ?? '') : '';
        const excerpt = excerptRaw.trim() || snippet(bodyText, q);
        hits.push({
          documentId: r.documentId,
          title,
          slug: r.slug,
          excerpt: excerpt.length > 180 ? excerpt.slice(0, 177).trimEnd() + '…' : excerpt,
          contentType: src.contentType,
          category: src.category ? String(r[src.category] ?? '') : '',
          _score: score(q, title, excerptRaw, bodyText, r.publishedAt),
        });
      }
    }

    hits.sort((a, b) => b._score - a._score);

    ctx.body = {
      hits: hits.slice(0, limit).map(({ _score, ...rest }) => rest),
      total: hits.length,
      query: q,
      locale,
    };
  },
});
