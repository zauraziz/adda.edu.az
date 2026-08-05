/**
 * F2.7-1 — RAG parça anbarı.
 *
 * NİYƏ STRAPI CONTENT TYPE DEYİL:
 *   1. ~5000 parça admin panelində ayrıca kolleksiya kimi görünərdi — istifadəyə
 *      yararsız zibil.
 *   2. `schema.json`-da `vector` tipi YOXDUR. pgvector sütunu yalnız xam DDL
 *      ilə yaradıla bilər.
 *   3. draft/publish və i18n maşınları burada mənasızdır, amma hər yazıda
 *      lifecycle işə düşərdi.
 * Ona görə: `strapi.db.connection` (knex) üzərində öz cədvəlimiz.
 *
 * İKİ REJİM — `$containsi`-nin engine-agnostik olması prinsipi saxlanılır:
 *   • `pgvector` — Neon Postgres, `vector(N)` sütunu + HNSW indeksi
 *   • `json`     — SQLite (lokal dev) VƏ pgvector qurula bilməyən Postgres;
 *                  vektor JSON kimi saxlanılır, oxşarlıq yaddaşda hesablanır
 *
 * DEQRADASİYA SƏSSİZ DEYİL: rejim `status` cavabında görünür. Meilisearch
 * dərsi — opsional alt sistem BOOT-u sındırmamalıdır, amma vəziyyəti də
 * gizlətməməlidir.
 *
 * Standalone kompilyasiya olunur — @strapi/strapi tipləri import EDİLMİR.
 */

export type StoreMode = 'pgvector' | 'json';

export interface KnexLike {
  raw(sql: string, bindings?: readonly unknown[]): Promise<unknown>;
  client?: { config?: { client?: string } };
}

export interface StrapiDbLike {
  db: { connection: KnexLike };
  log: { info(m: string): void; warn(m: string): void; error(m: string): void };
}

export const TABLE = 'rag_chunks';
export const META_TABLE = 'rag_meta';

export interface StoreInfo {
  mode: StoreMode;
  client: string;
  dims: number;
  model: string;
  ready: boolean;
  /** Cədvəldəki ölçü env-dəki ölçüdən fərqlidirsə doludur. */
  mismatch?: string;
}

/** knex `raw()` cavabı: Postgres `{rows}`, SQLite düz massiv. */
function rowsOf(res: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(res)) return res as Array<Record<string, unknown>>;
  if (res && typeof res === 'object') {
    const r = (res as { rows?: unknown }).rows;
    if (Array.isArray(r)) return r as Array<Record<string, unknown>>;
  }
  return [];
}

function clientOf(db: KnexLike): string {
  const c = db.client && db.client.config && db.client.config.client;
  return String(c || 'sqlite');
}

export function isPostgres(db: KnexLike): boolean {
  return /^(pg|postgres)/i.test(clientOf(db));
}

let cached: StoreInfo | null = null;

/** Test/yenidənqurma üçün — `purge --hard`-dan sonra çağırılır. */
export function resetCache(): void {
  cached = null;
}

/**
 * Cədvəli və indeksləri qur. İDEMPOTENT — hər çağırışda təhlükəsizdir.
 * HEÇ VAXT throw etmir: RAG opsionaldır, Strapi boot-u sındırmamalıdır.
 */
export async function ensureSchema(strapi: StrapiDbLike, dims: number, model: string): Promise<StoreInfo> {
  if (cached) return cached;
  const db = strapi.db.connection;
  const client = clientOf(db);
  const pg = isPostgres(db);

  let mode: StoreMode = 'json';
  if (pg) {
    try {
      await db.raw('CREATE EXTENSION IF NOT EXISTS vector');
      mode = 'pgvector';
    } catch (err) {
      // Neon-da adətən işləyir; icazə yoxdursa JSON rejimi ilə davam edirik.
      strapi.log.warn(
        '[rag] pgvector qurulmadi, JSON rejimine kecilir: ' + String((err as Error).message).slice(0, 200),
      );
    }
  }

  try {
    if (pg) {
      const vecCol = mode === 'pgvector' ? `embedding vector(${dims})` : 'embedding_json text';
      await db.raw(`
        CREATE TABLE IF NOT EXISTS ${TABLE} (
          id bigserial PRIMARY KEY,
          source text NOT NULL,
          doc_id text NOT NULL,
          locale text NOT NULL,
          slug text,
          title text,
          url text,
          chunk_ix integer NOT NULL,
          text text NOT NULL,
          hash text NOT NULL,
          model text,
          dims integer,
          ${vecCol},
          updated_at text,
          CONSTRAINT ${TABLE}_uniq UNIQUE (source, doc_id, locale, chunk_ix)
        )
      `);
      await db.raw(`CREATE TABLE IF NOT EXISTS ${META_TABLE} (key text PRIMARY KEY, value text)`);
      await db.raw(`CREATE INDEX IF NOT EXISTS ${TABLE}_src_loc ON ${TABLE} (source, locale)`);
      await db.raw(`CREATE INDEX IF NOT EXISTS ${TABLE}_doc ON ${TABLE} (source, doc_id, locale)`);
      if (mode === 'pgvector') {
        // HNSW: boş cədvəldə qurulması ucuzdur, sonra qursaq
        // `maintenance_work_mem` Neon-un kiçik compute-unda darlıq yaradır.
        await db.raw(
          `CREATE INDEX IF NOT EXISTS ${TABLE}_vec ON ${TABLE} USING hnsw (embedding vector_cosine_ops)`,
        );
      }
    } else {
      await db.raw(`
        CREATE TABLE IF NOT EXISTS ${TABLE} (
          id integer PRIMARY KEY AUTOINCREMENT,
          source text NOT NULL,
          doc_id text NOT NULL,
          locale text NOT NULL,
          slug text,
          title text,
          url text,
          chunk_ix integer NOT NULL,
          text text NOT NULL,
          hash text NOT NULL,
          model text,
          dims integer,
          embedding_json text,
          updated_at text,
          UNIQUE (source, doc_id, locale, chunk_ix)
        )
      `);
      await db.raw(`CREATE TABLE IF NOT EXISTS ${META_TABLE} (key text PRIMARY KEY, value text)`);
      await db.raw(`CREATE INDEX IF NOT EXISTS ${TABLE}_src_loc ON ${TABLE} (source, locale)`);
      await db.raw(`CREATE INDEX IF NOT EXISTS ${TABLE}_doc ON ${TABLE} (source, doc_id, locale)`);
    }
  } catch (err) {
    strapi.log.error('[rag] cedvel qurulmadi: ' + String((err as Error).message).slice(0, 300));
    cached = { mode, client, dims, model, ready: false, mismatch: String((err as Error).message).slice(0, 200) };
    return cached;
  }

  // F2.7-3: inyeksiya siqnalları sütunu. Mövcud sətirlərdə NULL qalır —
  // «təmiz» sayılır, çünki onlar köhnə qaydalarla indekslənib. Yenidən
  // indeksləmə hash dəyişdiyi üçün AVTOMATİK baş verir, `--force` lazım deyil.
  await ensureColumn(strapi, 'signals', 'text');

  // ── Ölçü/model uyğunluğu ───────────────────────────────────────────────
  // `vector(768)` DDL-də sabitdir. Env-də ölçü dəyişilsə köhnə vektorlar
  // yeni sorğularla MÜQAYİSƏ OLUNA BİLMƏZ — nəticə mənasız olardı, xəta isə
  // çıxmazdı. Ona görə uyğunsuzluq açıq bildirilir və indeksləmə dayanır.
  let mismatch: string | undefined;
  try {
    const prev = await readMeta(strapi);
    if (prev.dims && prev.dims !== dims) {
      mismatch = `cedvel ${prev.dims} olcu ile qurulub, RAG_EMBED_DIMS=${dims}. --purge-hard lazimdir.`;
    } else if (prev.model && prev.model !== model) {
      mismatch = `indeks '${prev.model}' modeli ile qurulub, indi '${model}'. --purge-hard lazimdir.`;
    } else if (!prev.dims) {
      await writeMeta(strapi, { dims: String(dims), model, mode });
    }
  } catch (err) {
    strapi.log.warn('[rag] meta oxunmadi: ' + String((err as Error).message).slice(0, 200));
  }

  cached = { mode, client, dims, model, ready: !mismatch, mismatch };
  return cached;
}

/**
 * Sütunu əlavə et — İDEMPOTENT.
 *
 * NİYƏ ALTER, YENİDƏN QURMA DEYİL: prodda artıq indekslənmiş parçalar var
 * (681 və artmaqda). Cədvəli atmaq onların hamısını yenidən embed etmək
 * demək olardı — pulsuz tarifdə günlərlə kvota.
 *
 * Postgres `ADD COLUMN IF NOT EXISTS` dəstəkləyir; SQLite yox, ona görə
 * xəta udulur. Hər iki halda ikinci çağırış zərərsizdir.
 */
async function ensureColumn(strapi: StrapiDbLike, col: string, ddl: string): Promise<void> {
  const db = strapi.db.connection;
  try {
    if (isPostgres(db)) {
      await db.raw(`ALTER TABLE ${TABLE} ADD COLUMN IF NOT EXISTS ${col} ${ddl}`);
    } else {
      await db.raw(`ALTER TABLE ${TABLE} ADD COLUMN ${col} ${ddl}`);
    }
  } catch (err) {
    // SQLite: "duplicate column name" — normaldır.
    const m = String((err as Error).message || '');
    if (!/duplicate column|already exists/i.test(m)) {
      strapi.log.warn(`[rag] ${col} sutunu elave olunmadi: ` + m.slice(0, 160));
    }
  }
}

async function readMeta(strapi: StrapiDbLike): Promise<{ dims?: number; model?: string; mode?: string }> {
  const rows = rowsOf(await strapi.db.connection.raw(`SELECT key, value FROM ${META_TABLE}`));
  const out: Record<string, string> = {};
  for (const r of rows) out[String(r.key)] = String(r.value ?? '');
  return {
    dims: out.dims ? parseInt(out.dims, 10) : undefined,
    model: out.model || undefined,
    mode: out.mode || undefined,
  };
}

async function writeMeta(strapi: StrapiDbLike, kv: Record<string, string>): Promise<void> {
  const db = strapi.db.connection;
  for (const [k, v] of Object.entries(kv)) {
    await db.raw(
      `INSERT INTO ${META_TABLE} (key, value) VALUES (?, ?)
       ON CONFLICT (key) DO UPDATE SET value = excluded.value`,
      [k, v],
    );
  }
}

/* ── Yazma ────────────────────────────────────────────────────────────── */

export interface StoredChunk {
  source: string;
  docId: string;
  locale: string;
  slug: string;
  title: string;
  url: string;
  chunkIx: number;
  text: string;
  hash: string;
  vector: number[];
  /** Aşkarlanan inyeksiya siqnalları (F2.7-3). Boş = təmiz. */
  signals?: string[];
}

/** Postgres `vector` literal formatı: `[0.1,0.2,...]` */
function vecLiteral(v: number[]): string {
  return '[' + v.join(',') + ']';
}

export async function upsertChunks(
  strapi: StrapiDbLike,
  info: StoreInfo,
  rows: StoredChunk[],
): Promise<number> {
  if (!rows.length) return 0;
  const db = strapi.db.connection;
  const now = new Date().toISOString();
  let n = 0;

  for (const r of rows) {
    const sig = r.signals && r.signals.length ? r.signals.join(',') : '';
    const common = [r.source, r.docId, r.locale, r.slug, r.title, r.url, r.chunkIx, r.text, r.hash, info.model, info.dims];
    if (info.mode === 'pgvector') {
      await db.raw(
        `INSERT INTO ${TABLE}
           (source, doc_id, locale, slug, title, url, chunk_ix, text, hash, model, dims, embedding, signals, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?::vector,?,?)
         ON CONFLICT (source, doc_id, locale, chunk_ix) DO UPDATE SET
           slug = excluded.slug, title = excluded.title, url = excluded.url,
           text = excluded.text, hash = excluded.hash, model = excluded.model,
           dims = excluded.dims, embedding = excluded.embedding,
           signals = excluded.signals, updated_at = excluded.updated_at`,
        [...common, vecLiteral(r.vector), sig, now],
      );
    } else {
      await db.raw(
        `INSERT INTO ${TABLE}
           (source, doc_id, locale, slug, title, url, chunk_ix, text, hash, model, dims, embedding_json, signals, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
         ON CONFLICT (source, doc_id, locale, chunk_ix) DO UPDATE SET
           slug = excluded.slug, title = excluded.title, url = excluded.url,
           text = excluded.text, hash = excluded.hash, model = excluded.model,
           dims = excluded.dims, embedding_json = excluded.embedding_json,
           signals = excluded.signals, updated_at = excluded.updated_at`,
        [...common, JSON.stringify(r.vector), sig, now],
      );
    }
    n++;
  }
  return n;
}

/** Sənədin mövcud parçalarının hash-ları — dəyişməyəni yenidən embed etməmək üçün. */
export async function hashesFor(
  strapi: StrapiDbLike,
  source: string,
  docId: string,
  locale: string,
): Promise<Map<number, string>> {
  const rows = rowsOf(
    await strapi.db.connection.raw(
      `SELECT chunk_ix, hash FROM ${TABLE} WHERE source = ? AND doc_id = ? AND locale = ?`,
      [source, docId, locale],
    ),
  );
  const m = new Map<number, string>();
  for (const r of rows) m.set(Number(r.chunk_ix), String(r.hash ?? ''));
  return m;
}

/** Sənəd qısalıbsa artıq parçaları sil (yoxsa köhnə mətn indeksdə qalar). */
export async function trimChunks(
  strapi: StrapiDbLike,
  source: string,
  docId: string,
  locale: string,
  keepCount: number,
): Promise<number> {
  const res = await strapi.db.connection.raw(
    `DELETE FROM ${TABLE} WHERE source = ? AND doc_id = ? AND locale = ? AND chunk_ix >= ?`,
    [source, docId, locale, keepCount],
  );
  const r = res as { rowCount?: number } | undefined;
  return r && typeof r.rowCount === 'number' ? r.rowCount : 0;
}

export async function purge(
  strapi: StrapiDbLike,
  filter: { source?: string; locale?: string },
): Promise<void> {
  const where: string[] = [];
  const args: unknown[] = [];
  if (filter.source) {
    where.push('source = ?');
    args.push(filter.source);
  }
  if (filter.locale) {
    where.push('locale = ?');
    args.push(filter.locale);
  }
  const sql = `DELETE FROM ${TABLE}` + (where.length ? ' WHERE ' + where.join(' AND ') : '');
  await strapi.db.connection.raw(sql, args);
}

/** Ölçü/model dəyişəndə yeganə yol: cədvəli tamamilə at. */
export async function dropAll(strapi: StrapiDbLike): Promise<void> {
  await strapi.db.connection.raw(`DROP TABLE IF EXISTS ${TABLE}`);
  await strapi.db.connection.raw(`DROP TABLE IF EXISTS ${META_TABLE}`);
  resetCache();
}

/* ── Oxuma / statistika ───────────────────────────────────────────────── */

export interface CountRow {
  source: string;
  locale: string;
  chunks: number;
  docs: number;
  flagged: number;
}

export interface FlaggedRow {
  source: string;
  docId: string;
  locale: string;
  title: string;
  url: string;
  chunkIx: number;
  signals: string;
  text: string;
}

/** İşarələnmiş parçalar — Zaurun nəzərdən keçirməsi üçün (F2.7-3 audit). */
export async function flaggedChunks(strapi: StrapiDbLike, limit = 100): Promise<FlaggedRow[]> {
  const rows = rowsOf(
    await strapi.db.connection.raw(
      `SELECT source, doc_id, locale, title, url, chunk_ix, signals, text
       FROM ${TABLE}
       WHERE signals IS NOT NULL AND signals <> ''
       ORDER BY source, doc_id, chunk_ix
       LIMIT ?`,
      [Math.min(500, Math.max(1, limit))],
    ),
  );
  return rows.map((r) => ({
    source: String(r.source),
    docId: String(r.doc_id),
    locale: String(r.locale),
    title: String(r.title ?? ''),
    url: String(r.url ?? ''),
    chunkIx: Number(r.chunk_ix) || 0,
    signals: String(r.signals ?? ''),
    text: String(r.text ?? '').slice(0, 400),
  }));
}

export async function counts(strapi: StrapiDbLike): Promise<CountRow[]> {
  const rows = rowsOf(
    await strapi.db.connection.raw(
      `SELECT source, locale, COUNT(*) AS chunks, COUNT(DISTINCT doc_id) AS docs,
              SUM(CASE WHEN signals IS NOT NULL AND signals <> '' THEN 1 ELSE 0 END) AS flagged
       FROM ${TABLE} GROUP BY source, locale ORDER BY source, locale`,
    ),
  );
  return rows.map((r) => ({
    source: String(r.source),
    locale: String(r.locale),
    chunks: Number(r.chunks) || 0,
    docs: Number(r.docs) || 0,
    flagged: Number(r.flagged) || 0,
  }));
}
