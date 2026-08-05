/**
 * F2.7-2 — Leksik qol (hibrid axtarışın yarısı).
 *
 * NİYƏ VEKTOR TƏK BAŞINA KİFAYƏT DEYİL: çoxdilli embedding modelləri
 * Azərbaycan dilində az-resurslu rejimdə işləyir. Xüsusi adlar, abbreviaturalar
 * və rəqəmlər (`ASCO`, `AZCON`, `2024/2025`, `İxtisas 6231`) vektor fəzasında
 * pis ayrılır — leksik qol məhz orada dayaq olur. Əksinə, «gəmi mühəndisliyi
 * hansı fakültədədir» kimi parafraz sorğularda leksik qol boş qayıdır.
 * İkisi RRF ilə birləşdirilir.
 *
 * NİYƏ `site-search`-dən AYRI: o, sənəd səviyyəsində işləyir və `person`-u
 * ÜMUMİYYƏTLƏ axtarmır (K25-dən qalan boşluq). Burada mənbə siyahısı
 * `chunk.ts`-dəki `SOURCES` ilə EYNİDİR — indekslə axtarışın uyğunsuzlaşması
 * mümkün olmasın deyə tək həqiqət mənbəyi saxlanılır.
 *
 * `$containsi` Strapi səviyyəsindədir → lokal SQLite və prod Postgres-də eyni
 * davranır. Xam SQL yazılmır.
 *
 * Standalone kompilyasiya olunur — @strapi/strapi tipləri import EDİLMİR.
 */
import { SOURCES, toPlain, type SourceDef } from './chunk';

type Row = Record<string, unknown>;

interface DocService {
  findMany(args: Row): Promise<Row[]>;
}
export interface StrapiDocsLike {
  documents(uid: string): DocService;
  log: { warn(m: string): void };
}

export interface LexicalHit {
  source: string;
  docId: string;
  locale: string;
  slug: string;
  title: string;
  url: string;
  snippet: string;
  score: number;
}

/**
 * `metaOnly` mənbələrdə gövdə yoxdur — orada axtarılacaq sahələr fərqlidir.
 *
 * `person` üçün `name` DƏ axtarılır: ştatdakı yazılış "Soyad Ad Ata"-dır,
 * `displayName` isə "Ad Ata Soyad". İstifadəçi hər iki sıra ilə yaza bilər.
 */
const FIELD_OVERRIDE: Record<string, string[]> = {
  person: ['displayName', 'name', 'position', 'academicTitle'],
};

function searchFields(src: SourceDef): string[] {
  const over = FIELD_OVERRIDE[src.key];
  if (over) return over;
  const f = [src.title];
  if (src.body) f.push(src.body);
  if (src.excerpt) f.push(src.excerpt);
  return f;
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : v == null ? '' : String(v);
}

/** Uyğun gələn hissənin ətrafından parça çıxar. */
function snippetAround(text: string, needle: string, max = 200): string {
  if (!text) return '';
  const at = text.toLowerCase().indexOf(needle.toLowerCase());
  if (at < 0) return text.length > max ? text.slice(0, max - 1).trimEnd() + '…' : text;
  const from = Math.max(0, at - 70);
  const part = text.slice(from, from + max);
  return (from > 0 ? '…' : '') + part.trim() + (from + max < text.length ? '…' : '');
}

/**
 * Bal sxemi — `site-search`-dəki ilə eynidir ki, iki axtarış səthi
 * istifadəçiyə ziddiyyətli sıralama göstərməsin.
 *   başlıq tam uyğun          1000
 *   başlıq sorğu ilə başlayır  700
 *   başlıqda var               500
 *   xülasədə var               200
 *   gövdədə var                100
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
    const years = (Date.now() - ts) / (365 * 86_400_000);
    s += Math.max(0, 30 - years * 10);
  }
  return s;
}

export interface LexicalOptions {
  locale: string;
  /** Hər tipdən götürüləcək maksimum sənəd. */
  perType?: number;
  /** Boşdursa hamısı. */
  sources?: string[];
}

export async function lexicalSearch(
  strapi: StrapiDocsLike,
  q: string,
  opts: LexicalOptions,
): Promise<LexicalHit[]> {
  const locale = opts.locale;
  const perType = Math.min(50, Math.max(1, opts.perType || 20));
  const wanted = opts.sources && opts.sources.length ? new Set(opts.sources) : null;
  const list = SOURCES.filter((s) => !wanted || wanted.has(s.key));

  // Tiplər PARALEL sorğulanır — 8 ardıcıl gediş-gəliş 8 dəfə yavaş olardı.
  const perSource = await Promise.all(
    list.map(async (src) => {
      const fields = searchFields(src);
      const or: Row[] = fields.map((f) => ({ [f]: { $containsi: q } }));
      // `documentId`/`slug`/`publishedAt` sıralama və link üçün lazımdır.
      const select = Array.from(new Set(['documentId', 'slug', 'publishedAt', ...src.fields, ...fields]));
      try {
        const rows = await strapi.documents(src.uid).findMany({
          locale,
          status: 'published',
          filters: { $or: or },
          limit: perType,
          fields: select,
        } as Row);
        return { src, rows };
      } catch (err) {
        // Bir tipin sxemi dəyişibsə qalanları sınmasın.
        strapi.log.warn('[rag/lexical] ' + src.uid + ' atlandi: ' + String((err as Error).message).slice(0, 160));
        return { src, rows: [] as Row[] };
      }
    }),
  );

  const hits: LexicalHit[] = [];
  for (const { src, rows } of perSource) {
    for (const r of rows) {
      const docId = str(r.documentId);
      const slug = str(r.slug);
      if (!docId || !slug) continue;
      const title = str(r[src.title]) || str(r.name) || slug;
      const bodyText = src.body ? toPlain(r[src.body]) : '';
      const excerptRaw = src.excerpt ? str(r[src.excerpt]) : '';
      // `metaOnly` mənbədə gövdə yoxdur — parça əvəzinə vəzifə göstərilir.
      const base = bodyText || [str(r.position), str(r.academicTitle)].filter(Boolean).join(' · ');
      hits.push({
        source: src.key,
        docId,
        locale,
        slug,
        title,
        url: '/' + locale + src.route + slug,
        snippet: excerptRaw.trim() || snippetAround(base, q),
        score: score(q, title, excerptRaw, bodyText, r.publishedAt),
      });
    }
  }

  hits.sort((a, b) => b.score - a.score);
  return hits;
}
