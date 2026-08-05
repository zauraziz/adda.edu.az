/**
 * F2.7-2 — Vektor qolu + RRF birləşdirmə.
 *
 * İKİ REJİM (anbarla eyni — bax `store.ts`):
 *   • pgvector — `ORDER BY embedding <=> ?::vector`, HNSW indeksi işə düşür
 *   • json     — parçalar yaddaşa yüklənir, kosinus əl ilə hesablanır
 *
 * JSON rejimi bahalı görünür, amma deyil: ~5000 parça × 768 ölçü ≈ 15 MB və
 * skalyar hasil 4M əməliyyatdır — millisaniyənin altı. Bahalı olan JSON.parse
 * ilə hər sorğuda təkrar yükləmədir, ona görə keş var.
 *
 * SORĞU VEKTORU KEŞLƏNİR: eyni sual eyni vektoru verir. Keş olmasa hər
 * təkrar sorğu provaydere pullu gediş deməkdir. Keş yaddaşdadır — Render-də
 * Strapi tək instansdır (eyni əsaslandırma `rate-limit.ts`-dədir).
 *
 * Standalone kompilyasiya olunur — @strapi/strapi tipləri import EDİLMİR.
 */
import { embedConfig, embedTexts } from './embed';
import { TABLE, type StoreInfo, type StrapiDbLike } from './store';

export interface VectorHit {
  source: string;
  docId: string;
  locale: string;
  slug: string;
  title: string;
  url: string;
  chunkIx: number;
  text: string;
  /** 0..1, böyük = yaxın. */
  similarity: number;
}

function rowsOf(res: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(res)) return res as Array<Record<string, unknown>>;
  if (res && typeof res === 'object') {
    const r = (res as { rows?: unknown }).rows;
    if (Array.isArray(r)) return r as Array<Record<string, unknown>>;
  }
  return [];
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : v == null ? '' : String(v);
}

/* ── Sorğu vektoru keşi ───────────────────────────────────────────────── */

const QCACHE = new Map<string, number[]>();
const QCACHE_MAX = 500;

export function queryCacheSize(): number {
  return QCACHE.size;
}

/**
 * Sorğunu embed et. `taskType` = RETRIEVAL_QUERY — bu ASİMMETRİKDİR və
 * sənəd tərəfi ilə eyni OLMAMALIDIR (bax `embed.ts`-dəki 1-ci tələ).
 */
export async function embedQuery(q: string): Promise<{ vector: number[] | null; cached: boolean; error?: string }> {
  const cfg = embedConfig();
  const key = cfg.model + '|' + cfg.dims + '|' + q;
  const hit = QCACHE.get(key);
  if (hit) {
    // LRU: təkrar istifadə olunanı sona at.
    QCACHE.delete(key);
    QCACHE.set(key, hit);
    return { vector: hit, cached: true };
  }
  const res = await embedTexts([q], 'query');
  if (!res.ok || !res.vectors.length) return { vector: null, cached: false, error: res.error };
  if (QCACHE.size >= QCACHE_MAX) {
    const oldest = QCACHE.keys().next().value;
    if (oldest !== undefined) QCACHE.delete(oldest);
  }
  QCACHE.set(key, res.vectors[0]);
  return { vector: res.vectors[0], cached: false };
}

/* ── JSON rejimi üçün yaddaş keşi ─────────────────────────────────────── */

interface CachedRow {
  source: string;
  docId: string;
  locale: string;
  slug: string;
  title: string;
  url: string;
  chunkIx: number;
  text: string;
  vec: Float32Array;
}

let jsonCache: { key: string; rows: CachedRow[] } | null = null;

export function resetVectorCache(): void {
  jsonCache = null;
  QCACHE.clear();
}

/** Keş açarı — sətir sayı + ən son `updated_at`. İndekslənmə olsa dəyişir. */
async function cacheKey(strapi: StrapiDbLike, locale: string): Promise<string> {
  const rows = rowsOf(
    await strapi.db.connection.raw(
      `SELECT COUNT(*) AS n, MAX(updated_at) AS t FROM ${TABLE} WHERE locale = ?`,
      [locale],
    ),
  );
  const r = rows[0] || {};
  return locale + '|' + String(r.n ?? 0) + '|' + String(r.t ?? '');
}

function normalized(v: number[]): Float32Array {
  let s = 0;
  for (const x of v) s += x * x;
  const n = Math.sqrt(s);
  const out = new Float32Array(v.length);
  if (!Number.isFinite(n) || n === 0) {
    for (let i = 0; i < v.length; i++) out[i] = v[i];
    return out;
  }
  for (let i = 0; i < v.length; i++) out[i] = v[i] / n;
  return out;
}

async function loadJsonRows(strapi: StrapiDbLike, locale: string): Promise<CachedRow[]> {
  const key = await cacheKey(strapi, locale);
  if (jsonCache && jsonCache.key === key) return jsonCache.rows;

  const raw = rowsOf(
    await strapi.db.connection.raw(
      `SELECT source, doc_id, locale, slug, title, url, chunk_ix, text, embedding_json
       FROM ${TABLE} WHERE locale = ? AND embedding_json IS NOT NULL`,
      [locale],
    ),
  );
  const rows: CachedRow[] = [];
  for (const r of raw) {
    let vec: number[];
    try {
      vec = JSON.parse(String(r.embedding_json)) as number[];
    } catch {
      continue;
    }
    if (!Array.isArray(vec) || !vec.length) continue;
    rows.push({
      source: str(r.source),
      docId: str(r.doc_id),
      locale: str(r.locale),
      slug: str(r.slug),
      title: str(r.title),
      url: str(r.url),
      chunkIx: Number(r.chunk_ix) || 0,
      text: str(r.text),
      vec: normalized(vec),
    });
  }
  jsonCache = { key, rows };
  return rows;
}

/* ── Vektor axtarışı ──────────────────────────────────────────────────── */

export interface VectorOptions {
  locale: string;
  limit: number;
  sources?: string[];
}

/**
 * Oxşarlıq kəsimi — ƏLAQƏSİZ PARÇALARI ATIR.
 *
 * NİYƏ VACİB: vektor axtarışı HƏMİŞƏ `limit` qədər nəticə qaytarır, sorğu ilə
 * heç bir əlaqəsi olmasa belə — sadəcə "ən az uzaq" olanları. F2.7-4-də bu
 * parçalar birbaşa prompta düşəcək və modelə əlaqəsiz kontekst vermək
 * hallüsinasiyanın birbaşa səbəbidir.
 *
 * NİYƏ MÜTLƏQ HƏDD DEFOLTDA SÖNÜLÜDÜR: kosinus dəyərlərinin paylanması
 * modeldən və dildən asılıdır — Gemini embedding-ləri sıfır ətrafında
 * mərkəzlənmir, ona görə "0.5-dən aşağı = əlaqəsiz" kimi sehrli rəqəm
 * uydurmaq yanlışdır. Əvəzinə NİSBİ kəsim işlədilir: ən yaxşı nəticədən
 * `RAG_SIM_DROP` qədər geri qalan atılır. Zaur real rəqəmləri `?debug=1`-də
 * görəndən sonra `RAG_SIM_FLOOR` ilə mütləq həddi də qoya bilər.
 */
function cutoff(hits: VectorHit[]): VectorHit[] {
  if (!hits.length) return hits;
  const drop = Number(process.env.RAG_SIM_DROP || '0.15');
  const floor = Number(process.env.RAG_SIM_FLOOR || '0');
  const top = hits[0].similarity;
  const min = Math.max(
    Number.isFinite(floor) ? floor : 0,
    Number.isFinite(drop) && drop > 0 ? top - drop : -Infinity,
  );
  return hits.filter((h) => h.similarity >= min);
}

export async function vectorSearch(
  strapi: StrapiDbLike,
  info: StoreInfo,
  query: number[],
  opts: VectorOptions,
): Promise<VectorHit[]> {
  const limit = Math.min(200, Math.max(1, opts.limit));
  const wanted = opts.sources && opts.sources.length ? opts.sources : null;

  if (info.mode === 'pgvector') {
    const args: unknown[] = [];
    const lit = '[' + query.join(',') + ']';
    let where = 'locale = ?';
    args.push(opts.locale);
    if (wanted) {
      where += ' AND source IN (' + wanted.map(() => '?').join(',') + ')';
      args.push(...wanted);
    }
    // `<=>` kosinus MƏSAFƏSİDİR (0 = eyni). ORDER BY ifadəsi SELECT-dəki ilə
    // eyni olmalıdır ki, planlaşdırıcı HNSW indeksini işlətsin.
    //
    // QEYD: `WHERE locale = ?` süzgəci ilə HNSW "filtered search" edir və
    // nəzəri olaraq az nəticə qaytara bilər. ~5000 sətirdə bu problem deyil;
    // indeks böyüyəndə `ivfflat`/partial index-ə baxmaq lazım gələcək.
    const sql = `
      SELECT source, doc_id, locale, slug, title, url, chunk_ix, text,
             (embedding <=> ?::vector) AS distance
      FROM ${TABLE}
      WHERE ${where}
      ORDER BY embedding <=> ?::vector
      LIMIT ?`;
    const rows = rowsOf(await strapi.db.connection.raw(sql, [lit, ...args, lit, limit]));
    return cutoff(rows.map((r) => ({
      source: str(r.source),
      docId: str(r.doc_id),
      locale: str(r.locale),
      slug: str(r.slug),
      title: str(r.title),
      url: str(r.url),
      chunkIx: Number(r.chunk_ix) || 0,
      text: str(r.text),
      similarity: 1 - (Number(r.distance) || 0),
    })));
  }

  // ── JSON rejimi ──
  const rows = await loadJsonRows(strapi, opts.locale);
  const q = normalized(query);
  const scored: Array<{ row: CachedRow; sim: number }> = [];
  for (const row of rows) {
    if (wanted && wanted.indexOf(row.source) === -1) continue;
    if (row.vec.length !== q.length) continue;
    // Hər iki vektor normallaşdırılıb → kosinus = skalyar hasil.
    let dot = 0;
    for (let i = 0; i < q.length; i++) dot += q[i] * row.vec[i];
    scored.push({ row, sim: dot });
  }
  scored.sort((a, b) => b.sim - a.sim);
  return cutoff(scored.slice(0, limit).map(({ row, sim }) => ({
    source: row.source,
    docId: row.docId,
    locale: row.locale,
    slug: row.slug,
    title: row.title,
    url: row.url,
    chunkIx: row.chunkIx,
    text: row.text,
    similarity: sim,
  })));
}

/* ── RRF ──────────────────────────────────────────────────────────────── */

/**
 * Reciprocal Rank Fusion: `bal = Σ wᵢ / (k + rankᵢ)`.
 *
 * NİYƏ BAL NORMALLAŞDIRMASI DEYİL: leksik bal 0..1030 aralığındadır, kosinus
 * oxşarlığı isə -1..1. Onları eyni şkalaya gətirmək üçün seçiləcək hər hansı
 * çevirmə özbaşınadır və məlumat paylanması dəyişəndə sürüşür. RRF yalnız
 * SIRAYA baxır — miqyasdan asılı deyil və məhz belə hallar üçün yaradılıb.
 *
 * `k = 60` — orijinal məqalədəki dəyər; kiçik k ilk yerləri kəskin üstün
 * tutur, böyük k siyahıları bərabərləşdirir.
 */
export const RRF_K = 60;

export function rrfFuse(
  lists: Array<{ keys: string[]; weight: number }>,
  k: number = RRF_K,
): Map<string, number> {
  const out = new Map<string, number>();
  for (const { keys, weight } of lists) {
    for (let i = 0; i < keys.length; i++) {
      const add = weight / (k + i + 1);
      out.set(keys[i], (out.get(keys[i]) || 0) + add);
    }
  }
  return out;
}
