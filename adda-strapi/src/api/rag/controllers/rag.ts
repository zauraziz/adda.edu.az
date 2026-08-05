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
import { embedConfig, embedReadiness, embedTexts, pacerLoad } from '../lib/embed';
import { lexicalSearch, type LexicalHit } from '../lib/lexical';
import { embedQuery, vectorSearch, rrfFuse, resetVectorCache, type VectorHit } from '../lib/retrieve';
import {
  ensureSchema,
  counts,
  flaggedChunks,
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
  query: Record<string, string | string[] | undefined>;
  body: unknown;
  status: number;
  set(field: string, value: string): void;
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

function boolEnv(name: string, dflt: boolean): boolean {
  const v = (process.env[name] || '').trim().toLowerCase();
  if (!v) return dflt;
  return v !== 'false' && v !== '0' && v !== 'no';
}

/** F2.7-3 guardrail konfiqurasiyası — hamısı defolt AÇIQDIR. */
function guardOptions(): { contacts: boolean; identifiers: boolean; injection: boolean } {
  return {
    contacts: boolEnv('RAG_SCRUB_CONTACTS', true),
    identifiers: boolEnv('RAG_SCRUB_IDENTIFIERS', true),
    injection: boolEnv('RAG_GUARD_INJECTION', true),
  };
}

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
        // Kvota ELEMENT sayır, HTTP sorğusu yox — `rpm` element/dəqiqədir.
        rpm: cfg.rpm,
        retries: cfg.retries,
        pacerLoad: pacerLoad(),
      },
      guard: {
        ...guardOptions(),
        dropFlagged: boolEnv('RAG_DROP_FLAGGED', true),
      },
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
    const gopts = guardOptions();

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

    const stats = { docs: entries.length, chunks: 0, embedded: 0, skipped: 0, trimmed: 0, calls: 0, items: 0, flagged: 0, scrubbed: 0 };
    const pending: ChunkRecord[] = [];
    const perDoc: Array<{ docId: string; count: number }> = [];

    for (const entry of entries) {
      const chunks = buildChunks(src, entry, locale, gopts);
      if (!chunks.length) continue;
      stats.chunks += chunks.length;
      perDoc.push({ docId: chunks[0].docId, count: chunks.length });

      const known = force ? new Map<number, string>() : await hashesFor(strapi, src.key, chunks[0].docId, locale);
      if (chunks[0].removed.length) stats.scrubbed++;
      for (const c of chunks) {
        if (c.signals.length) stats.flagged++;
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
      stats.items = res.items;
      if (!res.ok) {
        // KVOTA XƏTASI KEÇİCİDİR — sənəd/sxem xətası ilə eyni sinifdə deyil.
        // 429 qaytarılır ki, CLI gözləyib EYNİ KURSORDAN davam etsin; 502-də
        // isə o, mənbəni tərk edirdi (`article/az` 75-də dayanmışdı).
        ctx.status = res.rateLimited ? 429 : 502;
        ctx.body = {
          ok: false,
          error: res.rateLimited ? 'embed_rate_limited' : 'embed_failed',
          detail: res.error,
          retryAfterMs: res.retryAfterMs || null,
          cursor,
          source: src.key,
          locale,
        };
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
        signals: c.signals,
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
      resetVectorCache();
      ctx.body = { ok: true, purged: { source: source || '*', locale: locale || '*' }, indexed: await counts(strapi) };
    } catch (err) {
      ctx.status = 500;
      ctx.body = { ok: false, error: 'purge_failed', detail: String((err as Error).message).slice(0, 300) };
    }
  },

  /**
   * POST /api/rag/admin/audit — işarələnmiş parçaların siyahısı.
   *
   * Guardrail-in NƏ TUTDUĞUNU görmədən ona güvənmək olmaz. Yalançı müsbətlər
   * (məsələn sitat gətirən xəbər) burada görünməli və naxışlar ona görə
   * dəqiqləşdirilməlidir. Düzəlişdən əvvəl diaqnostika prinsipi.
   */
  async audit(ctx: Ctx) {
    if (!authorize(strapi, ctx)) return;
    const body = bodyOf(ctx);
    const cfg = embedConfig();
    await ensureSchema(strapi, cfg.dims, cfg.model);
    const rows = await flaggedChunks(strapi, intOf(body.limit, 100));
    const bySignal: Record<string, number> = {};
    for (const r of rows) {
      for (const sig of r.signals.split(',')) {
        if (sig) bySignal[sig] = (bySignal[sig] || 0) + 1;
      }
    }
    ctx.body = {
      ok: true,
      guard: { ...guardOptions(), dropFlagged: boolEnv('RAG_DROP_FLAGGED', true) },
      total: rows.length,
      bySignal,
      chunks: rows,
    };
  },

  /**
   * GET /api/rag-search?q=…&locale=az&limit=8[&sources=article,page][&debug=1]
   *
   * HİBRİD axtarış: leksik + vektor, RRF ilə birləşdirilir. YALNIZ MƏNBƏ
   * qaytarır — cavab generasiyası YOXDUR (o, F2.7-4-dür). Bu endpoint tək
   * başına yoxlanıla bilir: retrieval pisdirsə heç bir prompt onu düzəltməz,
   * ona görə əvvəlcə bu qat oturmalıdır.
   *
   * İCTİMAİLİK QAPISI: defolt BAĞLIDIR. Hər sorğu provaydere pullu gediş
   * deməkdir, guardrails isə F2.7-3-dədir — açıq qoymaq büdcəni yandırmaq
   * üçün dəvətdir. `RAG_SEARCH_PUBLIC=true` ilə açılır; admin sirri isə
   * həmişə işləyir.
   */
  async search(ctx: Ctx) {
    const isPublic = (process.env.RAG_SEARCH_PUBLIC || '').toLowerCase() === 'true';
    if (!isPublic) {
      const expected = cleanSecret(process.env.ADMIN_IMPORT_SECRET);
      const got = cleanSecret(headerOf(ctx, 'x-adda-admin-secret'));
      if (!expected || expected.length < 16 || !timingSafeEqualStr(got, expected)) {
        ctx.status = 403;
        ctx.body = { ok: false, error: 'rag_search_disabled', detail: 'RAG_SEARCH_PUBLIC=true deyil' };
        return;
      }
    }

    const started = Date.now();
    const rawQ = ctx.query.q;
    const q = (typeof rawQ === 'string' ? rawQ : '').trim().slice(0, 200);
    const locale = LOCALES.indexOf(String(ctx.query.locale)) !== -1 ? String(ctx.query.locale) : 'az';
    const limit = Math.min(20, Math.max(1, intOf(ctx.query.limit, 8)));
    const debug = String(ctx.query.debug || '') === '1';
    const sources = String(ctx.query.sources || '')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && sourceByKey(s));

    ctx.set('Cache-Control', 'public, max-age=30');

    if (q.length < 2) {
      ctx.body = { ok: true, query: q, locale, hits: [], arms: [], notes: ['sorgu cox qisadir'] };
      return;
    }

    const cfg = embedConfig();
    const info = await ensureSchema(strapi, cfg.dims, cfg.model);
    const notes: string[] = [];
    const arms: string[] = [];

    /* ── Leksik qol ── */
    let lex: LexicalHit[] = [];
    try {
      lex = await lexicalSearch(strapi, q, { locale, perType: 20, sources });
      arms.push('lexical');
    } catch (err) {
      notes.push('leksik qol sindi: ' + String((err as Error).message).slice(0, 160));
    }

    /* ── Vektor qolu ── */
    // Deqradasiya SƏSSİZ DEYİL: səbəb `notes`-da qayıdır. Vektor qolu
    // düşəndə nəticələr hələ də gəlir, sadəcə parafraz sorğular zəifləyir.
    let vec: VectorHit[] = [];
    let cachedQuery = false;
    if (!info.ready) {
      notes.push('anbar hazir deyil: ' + (info.mismatch || 'bilinmir'));
    } else {
      const blocker = embedReadiness(cfg);
      if (blocker) {
        notes.push('vektor qolu sondurulub: ' + blocker);
      } else {
        const qv = await embedQuery(q);
        if (!qv.vector) {
          notes.push('sorgu embed olunmadi: ' + (qv.error || 'bilinmir'));
        } else {
          cachedQuery = qv.cached;
          try {
            vec = await vectorSearch(strapi, info, qv.vector, {
              locale,
              limit: 60,
              sources,
              dropFlagged: boolEnv('RAG_DROP_FLAGGED', true),
            });
            arms.push('vector');
          } catch (err) {
            notes.push('vektor axtarisi sindi: ' + String((err as Error).message).slice(0, 160));
          }
        }
      }
    }

    /* ── Sənəd səviyyəsinə yığ ── */
    // Parça sıralaması sənəd sıralamasına çevrilir: sənədin İLK görünüşü
    // onun rütbəsidir (ən yaxın parçası). Qalan parçalar sübut kimi saxlanılır
    // — F2.7-4-də sitat mətni məhz oradan gələcək.
    interface Doc {
      source: string;
      docId: string;
      title: string;
      url: string;
      slug: string;
      snippet: string;
      evidence: Array<{ chunkIx: number; text: string; similarity: number }>;
      lexRank?: number;
      vecRank?: number;
    }
    const docs = new Map<string, Doc>();
    const keyOf = (s: string, d: string): string => s + ':' + d;

    const lexKeys: string[] = [];
    for (const h of lex) {
      const k = keyOf(h.source, h.docId);
      if (!docs.has(k)) {
        docs.set(k, {
          source: h.source, docId: h.docId, title: h.title, url: h.url,
          slug: h.slug, snippet: h.snippet, evidence: [],
        });
        lexKeys.push(k);
        docs.get(k)!.lexRank = lexKeys.length;
      }
    }

    const vecKeys: string[] = [];
    for (const h of vec) {
      const k = keyOf(h.source, h.docId);
      let d = docs.get(k);
      if (!d) {
        d = {
          source: h.source, docId: h.docId, title: h.title, url: h.url,
          slug: h.slug, snippet: '', evidence: [],
        };
        docs.set(k, d);
      }
      if (vecKeys.indexOf(k) === -1) {
        vecKeys.push(k);
        d.vecRank = vecKeys.length;
      }
      if (d.evidence.length < 3) {
        d.evidence.push({ chunkIx: h.chunkIx, text: h.text, similarity: Math.round(h.similarity * 1000) / 1000 });
      }
      if (!d.snippet) d.snippet = h.text.slice(0, 200);
    }

    const wLex = Number(process.env.RAG_W_LEXICAL || '1') || 1;
    const wVec = Number(process.env.RAG_W_VECTOR || '1') || 1;
    const fused = rrfFuse([
      { keys: lexKeys, weight: wLex },
      { keys: vecKeys, weight: wVec },
    ]);

    const ranked = Array.from(fused.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([k, rrf]) => {
        const d = docs.get(k)!;
        return {
          source: d.source,
          documentId: d.docId,
          title: d.title,
          url: d.url,
          slug: d.slug,
          snippet: d.snippet,
          evidence: d.evidence,
          ...(debug
            ? { scores: { lexicalRank: d.lexRank ?? null, vectorRank: d.vecRank ?? null, rrf: Math.round(rrf * 1e6) / 1e6 } }
            : {}),
        };
      });

    ctx.body = {
      ok: true,
      query: q,
      locale,
      arms,
      mode: info.mode,
      cachedQuery,
      tookMs: Date.now() - started,
      total: fused.size,
      hits: ranked,
      notes,
      ...(debug
        ? {
            counts: { lexical: lexKeys.length, vector: vecKeys.length, chunks: vec.length },
            // Kəsimi kalibrləmək üçün: real oxşarlıq aralığı burada görünür.
            similarity: vec.length
              ? { top: vec[0].similarity, bottom: vec[vec.length - 1].similarity }
              : null,
          }
        : {}),
    };
  },
});
