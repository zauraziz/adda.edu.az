/**
 * F5.61 — sənəd paketinin indekslənməsi: parçala → dəyişməyəni (hash) atla → embed →
 * yaz → qısalan sənədin quyruğunu sil. Admin endpoint-i (`/api/rag/admin/index`, CLI)
 * və avtomatik indeks (`auto-index.ts`) EYNİ kodu işlədir — əvvəl bu məntiq yalnız
 * nəzarətçidə idi.
 *
 * Standalone kompilyasiya olunur — @strapi/strapi tipləri import EDİLMİR.
 */
import { buildChunks, type BuildOptions, type ChunkRecord, type SourceDef } from './chunk';
import { embedTexts } from './embed';
import { hashesFor, trimChunks, upsertChunks, type StoredChunk, type StoreInfo, type StrapiDbLike } from './store';

export interface BatchStats {
  docs: number;
  chunks: number;
  embedded: number;
  skipped: number;
  trimmed: number;
  calls: number;
  items: number;
  flagged: number;
  scrubbed: number;
}

export interface BatchResult {
  ok: boolean;
  /** Vaxt büdcəsi bitdi — eyni paket yenidən (hash qalanı tamamlayır). */
  partial: boolean;
  stats: BatchStats;
  /** `dryRun`: embed olunacaq parça sayı. */
  wouldEmbed?: number;
  error?: string;
  errorCode?: 'embed_rate_limited' | 'embed_failed' | 'store_failed';
  rateLimited?: boolean;
  retryAfterMs?: number;
  /** Gündəlik kvota bitib (embed.ts). */
  daily?: boolean;
}

export interface BatchOptions {
  force?: boolean;
  dryRun?: boolean;
  guard: BuildOptions;
  /** Mənbə + dil üçün əvvəlcədən oxunmuş hash-lar (`hashesForSource`); yoxdursa sənəd başına sorğu. */
  known?: Map<string, Map<number, string>>;
  /** Tənzimləyicinin gözləmə həddi — arxa planda HTTP sorğusu yoxdur, uzun ola bilər. */
  maxWaitMs?: number;
}

function boolEnv(name: string, dflt: boolean): boolean {
  const v = (process.env[name] || '').trim().toLowerCase();
  if (!v) return dflt;
  return v !== 'false' && v !== '0' && v !== 'no';
}

/** F2.7-3 guardrail konfiqurasiyası (env) — hamısı defolt AÇIQDIR. Nəzarətçi və avtomatik indeks eyni. */
export function guardOptionsFromEnv(): BuildOptions {
  return {
    contacts: boolEnv('RAG_SCRUB_CONTACTS', true),
    identifiers: boolEnv('RAG_SCRUB_IDENTIFIERS', true),
    injection: boolEnv('RAG_GUARD_INJECTION', true),
  };
}

export function emptyStats(): BatchStats {
  return { docs: 0, chunks: 0, embedded: 0, skipped: 0, trimmed: 0, calls: 0, items: 0, flagged: 0, scrubbed: 0 };
}

/** `into`-da əlavə sayğaclar ola bilər (avtomatik indeksin `pruned`) — yalnız `from`-un açarları. */
export function addStats(into: BatchStats, from: BatchStats): void {
  for (const k of Object.keys(from) as Array<keyof BatchStats>) into[k] = (into[k] || 0) + (from[k] || 0);
}

export async function indexBatch(
  strapi: StrapiDbLike,
  info: StoreInfo,
  src: SourceDef,
  entries: Array<Record<string, unknown>>,
  locale: string,
  opts: BatchOptions,
): Promise<BatchResult> {
  const stats = emptyStats();
  stats.docs = entries.length;
  const pending: ChunkRecord[] = [];
  const perDoc: Array<{ docId: string; count: number }> = [];

  for (const entry of entries) {
    const chunks = buildChunks(src, entry, locale, opts.guard);
    if (!chunks.length) continue;
    stats.chunks += chunks.length;
    perDoc.push({ docId: chunks[0].docId, count: chunks.length });

    const known = opts.force
      ? new Map<number, string>()
      : opts.known
        ? opts.known.get(chunks[0].docId) ?? new Map<number, string>()
        : await hashesFor(strapi, src.key, chunks[0].docId, locale);
    if (chunks[0].removed.length) stats.scrubbed++;
    for (const c of chunks) {
      if (c.signals.length) stats.flagged++;
      if (known.get(c.chunkIx) === c.hash) stats.skipped++;
      else pending.push(c);
    }
  }

  if (opts.dryRun) return { ok: true, partial: false, stats, wouldEmbed: pending.length };

  let partial = false;
  if (pending.length) {
    const res = await embedTexts(
      pending.map((c) => c.embedText),
      'document',
      opts.maxWaitMs !== undefined ? { maxWaitMs: opts.maxWaitMs } : {},
    );
    stats.calls = res.calls;
    stats.items = res.items;
    if (!res.ok) {
      // KVOTA XƏTASI KEÇİCİDİR — çağıran tərəf gözləyib EYNİ yerdən davam edir.
      return {
        ok: false,
        partial: false,
        stats,
        error: res.error,
        errorCode: res.rateLimited ? 'embed_rate_limited' : 'embed_failed',
        rateLimited: res.rateLimited,
        retryAfterMs: res.retryAfterMs,
        daily: res.daily,
      };
    }
    // Yarımçıq nəticə: yalnız embed olunmuş parçalar saxlanılır, qalanı növbəti dəfə.
    const n = res.vectors.length;
    const rows: StoredChunk[] = pending.slice(0, n).map((c, i) => ({
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
    partial = res.partial === true && n < pending.length;
    try {
      stats.embedded = await upsertChunks(strapi, info, rows);
    } catch (err) {
      return { ok: false, partial, stats, error: String((err as Error).message).slice(0, 300), errorCode: 'store_failed' };
    }
  }

  // Sənəd qısalıbsa köhnə quyruq parçaları silinməlidir. YARIMÇIQ gedişdə EDİLMİR:
  // hələ embed olunmamış parçalar «artıq» sayılıb silinərdi.
  if (!partial) {
    for (const d of perDoc) stats.trimmed += await trimChunks(strapi, src.key, d.docId, locale, d.count);
  }
  return { ok: true, partial, stats };
}
