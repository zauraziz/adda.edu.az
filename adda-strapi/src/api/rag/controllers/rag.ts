/**
 * F2.7-1 — RAG indeksləmə nəzarətçisi (YALNIZ admin).
 *
 * NİYƏ KURSORLU PAKETLƏR, TƏK ÇAĞIRIŞ DEYİL: 1206 sənədi bir HTTP sorğusunda
 * emal etmək Render-də timeout verir və yarıda qırılsa hansı sənədə qədər
 * getdiyi bilinmir. CLI kursoru sürür (`rag-index.mjs`), hər çağırış qısa
 * qalır, kəsilsə eyni kursordan davam edir.
 *
 * NİYƏ EMBEDDING SERVER TƏRƏFDƏ: F2.7-4-də sorğu vektoru da lazım olacaq,
 * yəni açar onsuz da Render-də olmalıdır. CLI-də embed etsək açar iki yerdə
 * yaşayardı.
 *
 * TƏHLÜKƏSİZLİK: `ADMIN_IMPORT_SECRET` + `x-adda-admin-secret` başlığı.
 * Sirr təyin edilməyibsə endpoint TAMAMİLƏ bağlıdır — boş sirr "hamıya açıq"
 * demək olardı. (Eyni naxış: `identity.adminStaffPrivate`.)
 *
 * Standalone kompilyasiya olunur — @strapi/strapi tipləri import EDİLMİR.
 */
import { createHash } from 'node:crypto';
import { SOURCES, sourceByKey, buildChunks, type ChunkRecord } from '../lib/chunk';
import { embedConfig, embedReadiness, embedTexts } from '../lib/embed';
import {
  ensureSchema,
  counts,
  hashesFor,
  trimChunks,
  upsertChunks,
  purge,
  dropAll,
  resetCache,
  type StoredChunk,
  type StoreInfo,
  type StrapiDbLike,
} from '../lib/store';

type Row = Record<string, unknown>;

interface DocService {
  findMany(args: Row): Promise<Row[]>;
  count?(args: Row): Promise<number>;
}
interface StrapiLike extends StrapiDbLike {
  documents(uid: string): DocService;
}
interface Ctx {
  request: { body?: unknown };
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
  status: number;
}

const LOCALES = ['az', 'ru', 'en'];
/**
 * Bir çağırışda emal olunan sənəd sayı.
 *
 * 25 seçilib: 25 sənəd ≈ 60-90 parça ≈ 2 embedding sorğusu. Render-in
 * pulsuz instansı üçün 30 saniyəlik büdcəyə rahat sığır.
 *
 * QEYD: `config/api.ts`-dəki `maxLimit: 100` yalnız REST sorğu parametrlərinə
 * aiddir; `documents().findMany({limit})` daxili çağırışdır və ona tabe deyil.
 * Bununla belə hədd burada da qoyulur — səbəb sürət deyil, yaddaşdır.
 */
const DOC_BATCH = 25;
const MAX_BATCH = 50;

/* ── Sirr yoxlaması ───────────────────────────────────────────────────── */

function cleanSecret(v: unknown): string {
  return String(v ?? '').trim();
}

function headerOf(ctx: Ctx, name: string): string {
  const v = ctx.headers[name];
  return Array.isArray(v) ? v[0] || '' : v || '';
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

function fingerprint(s: string): string {
  return createHash('sha256').update(s, 'utf8').digest('hex').slice(0, 8);
}

/** true = icazə verildi. Əks halda `ctx` artıq doldurulub. */
function authorize(strapi: StrapiLike, ctx: Ctx): boolean {
  const expected = cleanSecret(process.env.ADMIN_IMPORT_SECRET);
  if (!expected || expected.length < 16) {
    ctx.status = 503;
    ctx.body = { ok: false, error: 'admin_import_disabled' };
    return false;
  }
  const got = cleanSecret(headerOf(ctx, 'x-adda-admin-secret'));
  if (!timingSafeEqualStr(got, expected)) {
    strapi.log.warn(
      `[rag] admin: sehv sirr | gozlenilen ${fingerprint(expected)} (${expected.length}) | gelen ${fingerprint(got)} (${got.length})`,
    );
    ctx.status = 403;
    ctx.body = { ok: false, error: 'forbidden', sentFingerprint: fingerprint(got), sentLength: got.length };
    return false;
  }
  return true;
}

function bodyOf(ctx: Ctx): Row {
  const b = ctx.request.body;
  return b && typeof b === 'object' ? (b as Row) : {};
}

function intOf(v: unknown, fallback: number): number {
  const n = typeof v === 'number' ? v : parseInt(String(v ?? ''), 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

/* ── Nəzarətçi ────────────────────────────────────────────────────────── */

export default ({ strapi }: { strapi: StrapiLike }) => ({
  /**
   * POST /api/rag/admin/status — diaqnostika.
   *
   * Heç nə yazmır. Rejim (pgvector/json), provayder hazırlığı, indeks
   * əhatəsi. Düzəlişdən ƏVVƏL vəziyyəti göstərmək prinsipi.
   */
  async status(ctx: Ctx) {
    if (!authorize(strapi, ctx)) return;

    const cfg = embedConfig();
    const info = await ensureSchema(strapi, cfg.dims, cfg.model);

    // Mənbələrdəki sənəd sayı — əhatəni hesablamaq üçün.
    const totals: Array<{ source: string; locale: string; docs: number }> = [];
    for (const src of SOURCES) {
      for (const locale of LOCALES) {
        let n = 0;
        try {
          const svc = strapi.documents(src.uid);
          if (typeof svc.count === 'function') {
            n = await svc.count({ locale, status: 'published' });
          } else {
            n = (await svc.findMany({ locale, status: 'published', fields: ['documentId'], limit: 1000 })).length;
          }
        } catch (err) {
          strapi.log.warn(`[rag] ${src.uid}/${locale} sayilmadi: ${String((err as Error).message).slice(0, 120)}`);
        }
        if (n > 0) totals.push({ source: src.key, locale, docs: n });
      }
    }

    ctx.body = {
      ok: true,
      store: {
        mode: info.mode,
        client: info.client,
        dims: info.dims,
        model: info.model,
        ready: info.ready,
        mismatch: info.mismatch || null,
      },
      embed: {
        provider: cfg.provider,
        model: cfg.model,
        dims: cfg.dims,
        batch: cfg.batch,
        hasKey: cfg.hasKey,
        blocker: embedReadiness(cfg),
      },
      scrubContacts: (process.env.RAG_SCRUB_CONTACTS || 'true').toLowerCase() !== 'false',
      sources: SOURCES.map((s) => ({ key: s.key, uid: s.uid, metaOnly: Boolean(s.metaOnly), route: s.route })),
      totals,
      indexed: await counts(strapi),
    };
  },

  /**
   * POST /api/rag/admin/index
   * body: { source, locale, cursor?, limit?, dryRun?, force? }
   *
   * Bir (source, locale) cütü üzrə bir paket emal edir və növbəti kursoru
   * qaytarır. `done: true` olanda CLI növbəti cütə keçir.
   */
  async index(ctx: Ctx) {
    if (!authorize(strapi, ctx)) return;
    const body = bodyOf(ctx);

    const src = sourceByKey(String(body.source ?? ''));
    if (!src) {
      ctx.status = 400;
      ctx.body = { ok: false, error: 'unknown_source', known: SOURCES.map((s) => s.key) };
      return;
    }
    const locale = LOCALES.indexOf(String(body.locale ?? '')) !== -1 ? String(body.locale) : 'az';
    const cursor = intOf(body.cursor, 0);
    const limit = Math.min(MAX_BATCH, Math.max(1, intOf(body.limit, DOC_BATCH)));
    const dryRun = body.dryRun === true;
    const force = body.force === true;
    const scrub = (process.env.RAG_SCRUB_CONTACTS || 'true').toLowerCase() !== 'false';

    const cfg = embedConfig();
    const info: StoreInfo = await ensureSchema(strapi, cfg.dims, cfg.model);
    if (!info.ready) {
      ctx.status = 409;
      ctx.body = { ok: false, error: 'store_not_ready', detail: info.mismatch || 'cedvel qurulmadi' };
      return;
    }
    // `dryRun` embedding-siz işləyir: açar olmadan da parçalanmanı yoxlamaq olur.
    const blocker = embedReadiness(cfg);
    if (!dryRun && blocker) {
      ctx.status = 503;
      ctx.body = { ok: false, error: 'embedder_not_ready', detail: blocker };
      return;
    }

    let entries: Row[] = [];
    try {
      entries = await strapi.documents(src.uid).findMany({
        locale,
        status: 'published',
        sort: 'id:asc',
        start: cursor,
        limit,
        fields: src.fields,
        ...(src.populate ? { populate: src.populate } : {}),
      } as Row);
    } catch (err) {
      ctx.status = 500;
      ctx.body = { ok: false, error: 'fetch_failed', detail: String((err as Error).message).slice(0, 300) };
      return;
    }

    const stats = { docs: entries.length, chunks: 0, embedded: 0, skipped: 0, trimmed: 0, calls: 0 };
    const pending: ChunkRecord[] = [];
    const perDoc: Array<{ docId: string; count: number }> = [];

    for (const entry of entries) {
      const chunks = buildChunks(src, entry, locale, scrub);
      if (!chunks.length) continue;
      stats.chunks += chunks.length;
      perDoc.push({ docId: chunks[0].docId, count: chunks.length });

      const known = force ? new Map<number, string>() : await hashesFor(strapi, src.key, chunks[0].docId, locale);
      for (const c of chunks) {
        if (known.get(c.chunkIx) === c.hash) stats.skipped++;
        else pending.push(c);
      }
    }

    if (dryRun) {
      ctx.body = {
        ok: true,
        dryRun: true,
        source: src.key,
        locale,
        cursor,
        next: entries.length < limit ? null : cursor + limit,
        done: entries.length < limit,
        wouldEmbed: pending.length,
        stats,
      };
      return;
    }

    if (pending.length) {
      const res = await embedTexts(pending.map((c) => c.embedText), 'document');
      stats.calls = res.calls;
      if (!res.ok) {
        ctx.status = 502;
        ctx.body = { ok: false, error: 'embed_failed', detail: res.error, cursor, source: src.key, locale };
        return;
      }
      const rows: StoredChunk[] = pending.map((c, i) => ({
        source: c.source,
        docId: c.docId,
        locale: c.locale,
        slug: c.slug,
        title: c.title,
        url: c.url,
        chunkIx: c.chunkIx,
        text: c.text,
        hash: c.hash,
        vector: res.vectors[i],
      }));
      try {
        stats.embedded = await upsertChunks(strapi, info, rows);
      } catch (err) {
        ctx.status = 500;
        ctx.body = { ok: false, error: 'store_failed', detail: String((err as Error).message).slice(0, 300) };
        return;
      }
    }

    // Sənəd qısalıbsa köhnə quyruq parçaları silinməlidir.
    for (const d of perDoc) {
      stats.trimmed += await trimChunks(strapi, src.key, d.docId, locale, d.count);
    }

    const done = entries.length < limit;
    ctx.body = {
      ok: true,
      source: src.key,
      locale,
      cursor,
      next: done ? null : cursor + limit,
      done,
      stats,
    };
  },

  /**
   * POST /api/rag/admin/purge
   * body: { source?, locale?, hard? }
   *
   * `hard: true` cədvəli tamamilə atır — ölçü/model dəyişəndə yeganə yol.
   */
  async purgeIndex(ctx: Ctx) {
    if (!authorize(strapi, ctx)) return;
    const body = bodyOf(ctx);

    if (body.hard === true) {
      try {
        await dropAll(strapi);
        ctx.body = { ok: true, dropped: true };
      } catch (err) {
        ctx.status = 500;
        ctx.body = { ok: false, error: 'drop_failed', detail: String((err as Error).message).slice(0, 300) };
      }
      return;
    }

    const cfg = embedConfig();
    await ensureSchema(strapi, cfg.dims, cfg.model);
    const source = body.source ? String(body.source) : undefined;
    const locale = body.locale ? String(body.locale) : undefined;
    if (source && !sourceByKey(source)) {
      ctx.status = 400;
      ctx.body = { ok: false, error: 'unknown_source', known: SOURCES.map((s) => s.key) };
      return;
    }
    try {
      await purge(strapi, { source, locale });
      resetCache();
      ctx.body = { ok: true, purged: { source: source || '*', locale: locale || '*' }, indexed: await counts(strapi) };
    } catch (err) {
      ctx.status = 500;
      ctx.body = { ok: false, error: 'purge_failed', detail: String((err as Error).message).slice(0, 300) };
    }
  },
});
