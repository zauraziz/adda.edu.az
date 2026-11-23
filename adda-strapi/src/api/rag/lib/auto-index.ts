/**
 * F5.61 — RAG indeksi özü yenilənir (əvvəl yalnız CLI ilə: tools/migration/rag-index.mjs;
 * prod indeksi köhnə idi — arxiv kafedra/fakültə mətni, yeni səhifə və bölmələr yox).
 *
 *   1. TAM KEÇİD — açılışda ARXA PLANDA (90 s sonra, port bloklanmır) və yalnız lazım
 *      olanda: yeni deploy (`RENDER_GIT_COMMIT` ≠ `ragIndex:state.commit`) və ya əvvəlki
 *      keçid yarımçıq qalıb. Bütün mənbələr × dillər; dəyişməyən parça (hash) embed
 *      OLUNMUR; dərcdə olmayan sənədin və artıq mənbə olmayan növün (arxiv department,
 *      faculty) parçaları silinir. Mövqe hər paketdən sonra yadda (`adda-admin` →
 *      `ragIndex:state`) — kəsilsə eyni yerdən davam edir.
 *   2. SƏNƏD — Document Service middleware (register): mənbə növündə dərc, dərcdən
 *      çıxarma, silmə, dərc statusu ilə yaratma/yeniləmə → 30 s sonra (birləşdirilir, ən
 *      gec 2 dəq) həmin sənəd bütün dillərdə: dərcdədirsə indekslənir, deyilsə silinir.
 *   3. KVOTA — dəqiqəlik 429 embed.ts-də gözlənilir; gündəlik hədd → keçid dayanır və BİR
 *      dəfə kvota yenilənəndən sonra (08:10 UTC) davam edir; digər uzun hədd → provayderin
 *      dediyi vaxtdan sonra (30 dəq – 12 saat). Pulsuz tarifdə sualların embedding-i də eyni
 *      kvotadan yeyir — tam keçid gündə ən çox `RAG_AUTO_INDEX_DAILY_ITEMS` (900) element embed
 *      edir. Dövri iş DEYİL (Neon kvotası, F5.56): keçid bitəndə heç nə planlanmır; davam
 *      sayı 24-dən çox olmur (sonra növbəti deploy-da).
 *
 * Söndürmək: `RAG_AUTO_INDEX=false`. Embedding provayderi hazır deyilsə (açar yoxdur)
 * heç nə etmir. Lokal sınaq: `RAG_EMBED_PROVIDER=mock`, `RAG_AUTO_INDEX_DELAY_MS`.
 *
 * Standalone kompilyasiya olunur — @strapi/strapi tipləri import EDİLMİR.
 */
import { SOURCES, type SourceDef } from './chunk';
import { embedConfig, embedReadiness } from './embed';
import { addStats, emptyStats, guardOptionsFromEnv, indexBatch, type BatchStats } from './indexer';
import {
  deleteDoc,
  ensureSchema,
  hashesFor,
  hashesForSource,
  pruneDocs,
  purgeOtherSources,
  type StoreInfo,
  type StrapiDbLike,
} from './store';

type Row = Record<string, unknown>;

interface DocService {
  findMany(args: Row): Promise<Row[]>;
  findOne(args: Row): Promise<Row | null>;
}
interface PluginStore {
  get(a: { key: string }): Promise<unknown>;
  set(a: { key: string; value: unknown }): Promise<unknown>;
}
export interface StrapiAutoLike extends StrapiDbLike {
  documents: ((uid: string) => DocService) & { use?: (m: unknown) => void };
  store(a: { type: string; name: string }): PluginStore;
}

const LOCALES = ['az', 'ru', 'en'];
const STATE_KEY = 'ragIndex:state';
const PAGE = 25;
const MAX_RUNS = 24;
const MIN_DELAY = 30 * 60_000;
const MAX_DELAY = 12 * 3600_000;
const QUEUE_DEBOUNCE = 30_000;
const QUEUE_MAX_WAIT = 120_000;
/** Arxa planda tənzimləyici gözləyə bilər — HTTP sorğusu yoxdur. */
const BG_MAX_WAIT = 10 * 60_000;

interface State {
  commit: string;
  done: boolean;
  /** PLAN-da mövqe (mənbə × dil) və həmin cütdə kursor. */
  pos: number;
  cursor: number;
  runs: number;
  /** Kvota günü (08:10 UTC-dən başlayır) və həmin gün tam keçiddə embed olunan element sayı. */
  quotaDay?: string;
  quotaItems?: number;
  startedAt?: string;
  finishedAt?: string;
  note?: string;
  totals?: BatchStats & { pruned: number; removedSources: number };
}

const PLAN: Array<{ src: SourceDef; locale: string }> = SOURCES.flatMap((src) => LOCALES.map((locale) => ({ src, locale })));

let running = false;
let timer: ReturnType<typeof setTimeout> | null = null;
const queue = new Map<string, { src: SourceDef; docId: string }>();
let qTimer: ReturnType<typeof setTimeout> | null = null;
let qFirst = 0;
let qRetries = 0;

/**
 * Tam keçidin gündəlik həddi (element). Pulsuz Gemini tarifində embedding günə ~1000-dir və
 * SUALLARIN embedding-i də ondan yeyir: indeks hamısını yesə kopilot gün sonuna qədər yalnız
 * leksik qolla qalır. Defolt 900; ödənişli tarifdə `RAG_AUTO_INDEX_DAILY_ITEMS=0` (həddsiz).
 */
function dailyCap(): number {
  const raw = (process.env.RAG_AUTO_INDEX_DAILY_ITEMS || '').trim();
  const n = raw === '' ? 900 : parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Gemini kvotası gecə yarısı (Sakit okean vaxtı) yenilənir — gün 08:10 UTC-də başlayır. */
export function quotaDay(now = Date.now()): string {
  return new Date(now - (8 * 60 + 10) * 60_000).toISOString().slice(0, 10);
}

function boolEnv(name: string, dflt: boolean): boolean {
  const v = (process.env[name] || '').trim().toLowerCase();
  if (!v) return dflt;
  return v !== 'false' && v !== '0' && v !== 'no';
}

function enabled(): boolean {
  return boolEnv('RAG_AUTO_INDEX', true) && !embedReadiness(embedConfig());
}

function commitNow(): string {
  return (process.env.RENDER_GIT_COMMIT || '').trim() || 'local';
}

const storeOf = (strapi: StrapiAutoLike): PluginStore => strapi.store({ type: 'plugin', name: 'adda-admin' });

async function loadState(strapi: StrapiAutoLike): Promise<State | null> {
  const v = await storeOf(strapi).get({ key: STATE_KEY });
  return v && typeof v === 'object' ? (v as State) : null;
}

async function saveState(strapi: StrapiAutoLike, st: State): Promise<void> {
  await storeOf(strapi).set({ key: STATE_KEY, value: st });
}

/**
 * Gözləmə: gündəlik kvota → növbəti yenilənmədən sonra (Gemini gecə yarısı, Sakit okean vaxtı —
 * 08:10 UTC qış və yay vaxtında da sonradır); qalan hallar → provayderin dediyi (30 dəq – 12 saat).
 */
export function retryDelay(out: { daily?: boolean; retryAfterMs?: number }, now = Date.now()): number {
  if (out.daily) {
    const d = new Date(now);
    let next = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 8, 10);
    if (next - now < 5 * 60_000) next += 24 * 3600_000;
    return next - now;
  }
  return Math.min(MAX_DELAY, Math.max(MIN_DELAY, out.retryAfterMs || 3600_000));
}

function unref(t: ReturnType<typeof setTimeout>): void {
  (t as { unref?: () => void }).unref?.();
}

function schedule(strapi: StrapiAutoLike, ms: number, why: string): void {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    void fullPass(strapi, why).catch((e: Error) => strapi.log.error('[rag/auto] ' + e.message));
  }, ms);
  unref(timer);
}

async function storeInfo(strapi: StrapiAutoLike): Promise<StoreInfo | null> {
  const cfg = embedConfig();
  const info = await ensureSchema(strapi, cfg.dims, cfg.model);
  if (!info.ready) {
    strapi.log.warn('[rag/auto] anbar hazır deyil: ' + (info.mismatch || 'cədvəl qurulmadı'));
    return null;
  }
  return info;
}

/** Tam keçid (və ya yarımçıqdan davam). */
async function fullPass(strapi: StrapiAutoLike, why: string): Promise<void> {
  if (running || !enabled()) return;
  running = true;
  try {
    const info = await storeInfo(strapi);
    if (!info) return;
    const commit = commitNow();
    let st = await loadState(strapi);
    if (!st || st.commit !== commit) {
      // Kvota sayğacı deploy-dan asılı deyil — eyni gün ikinci deploy həddi yenidən açmasın.
      st = { commit, done: false, pos: 0, cursor: 0, runs: 0, quotaDay: st?.quotaDay, quotaItems: st?.quotaItems };
    }
    if (st.done) return;
    if (st.runs >= MAX_RUNS) {
      strapi.log.warn(`[rag/auto] ${MAX_RUNS} cəhddən sonra indeks hələ yarımçıqdır — növbəti deploy-da davam edəcək.`);
      return;
    }
    st.runs++;
    st.startedAt = st.startedAt || new Date().toISOString();
    st.totals = st.totals || { ...emptyStats(), pruned: 0, removedSources: 0 };
    strapi.log.info(`[rag/auto] indeks keçidi başlayır (${why}; ${st.pos}/${PLAN.length}, kursor ${st.cursor}).`);

    // Artıq mənbə olmayan növlər (arxiv department, faculty) — bir sorğu.
    const removed = await purgeOtherSources(strapi, SOURCES.map((s) => s.key));
    st.totals.removedSources += removed;
    if (removed) strapi.log.info(`[rag/auto] köhnə mənbələrin parçaları silindi: ${removed}.`);

    const guard = guardOptionsFromEnv();
    for (; st.pos < PLAN.length; st.pos++, st.cursor = 0) {
      const { src, locale } = PLAN[st.pos];
      const fromStart = st.cursor === 0;
      let known = await hashesForSource(strapi, src.key, locale);
      const seen = new Set<string>();
      const pair = emptyStats();
      for (;;) {
        const cap = dailyCap();
        if (cap) {
          const day = quotaDay();
          if (st.quotaDay !== day) {
            st.quotaDay = day;
            st.quotaItems = 0;
          }
          if ((st.quotaItems || 0) >= cap) {
            addStats(st.totals, pair);
            st.note = `gündəlik hədd: ${cap} element`;
            await saveState(strapi, st);
            const wait = retryDelay({ daily: true });
            strapi.log.info(
              `[rag/auto] bu gün ${st.quotaItems} element embed olundu (hədd ${cap}, RAG_AUTO_INDEX_DAILY_ITEMS) — ` +
                `suallar üçün kvota saxlanılır, qalanı ${Math.round(wait / 60_000)} dəq sonra (${src.key}/${locale}, kursor ${st.cursor}).`,
            );
            schedule(strapi, wait, 'gündəlik hədddən sonra');
            return;
          }
        }
        const entries = await strapi.documents(src.uid).findMany({
          locale,
          status: 'published',
          sort: 'id:asc',
          start: st.cursor,
          limit: PAGE,
          fields: src.fields,
          ...(src.populate ? { populate: src.populate } : {}),
        });
        for (const e of entries) if (e.documentId) seen.add(String(e.documentId));
        const out = await indexBatch(strapi, info, src, entries, locale, { guard, known, maxWaitMs: BG_MAX_WAIT });
        addStats(pair, out.stats);
        st.quotaItems = (st.quotaItems || 0) + out.stats.items;
        if (!out.ok) {
          addStats(st.totals, pair);
          st.note = `${src.key}/${locale}: ${out.error || out.errorCode || 'xəta'}`;
          await saveState(strapi, st);
          const wait = retryDelay(out);
          strapi.log.warn(
            `[rag/auto] ${out.daily ? 'gündəlik embedding kvotası doldu' : out.rateLimited ? 'embedding kvotası doldu' : 'xəta'} (${src.key}/${locale}, kursor ${st.cursor}): ` +
              `${String(out.error || '').slice(0, 160)} — ${Math.round(wait / 60_000)} dəq sonra davam.`,
          );
          schedule(strapi, wait, 'kvotadan sonra');
          return;
        }
        if (out.partial) {
          // Eyni paket yenidən: yazılanların hash-ı təzələnir ki, təkrar embed olunmasın.
          known = await hashesForSource(strapi, src.key, locale);
          continue;
        }
        st.cursor += entries.length;
        await saveState(strapi, st);
        if (entries.length < PAGE) break;
      }
      // Dərcdə olmayan sənədlər — yalnız cüt əvvəldən sona bu keçiddə gəzilibsə.
      let pruned = 0;
      if (fromStart) pruned = await pruneDocs(strapi, src.key, locale, seen);
      addStats(st.totals, pair);
      st.totals.pruned += pruned;
      if (pair.docs || pruned) {
        strapi.log.info(
          `[rag/auto] ${src.key}/${locale}: sənəd ${pair.docs}, parça ${pair.chunks}, yeni ${pair.embedded}, ` +
            `dəyişməyib ${pair.skipped}, silinən ${pair.trimmed + pruned}.`,
        );
      }
    }
    st.done = true;
    st.note = undefined;
    st.finishedAt = new Date().toISOString();
    await saveState(strapi, st);
    const t = st.totals;
    strapi.log.info(
      `[rag/auto] indeks hazırdır: sənəd ${t.docs}, parça ${t.chunks}, yeni embed ${t.embedded}, dəyişməyib ${t.skipped}, ` +
        `silinən ${t.trimmed + t.pruned + t.removedSources} (cəhd ${st.runs}).`,
    );
  } finally {
    running = false;
    if (queue.size) scheduleQueue(strapi, 5_000);
  }
}

/* ── Sənəd səviyyəsində (dərc, silmə) ───────────────────────────────── */

function scheduleQueue(strapi: StrapiAutoLike, ms?: number): void {
  const now = Date.now();
  if (!qFirst) qFirst = now;
  const wait = ms ?? Math.max(0, Math.min(QUEUE_DEBOUNCE, qFirst + QUEUE_MAX_WAIT - now));
  if (qTimer) clearTimeout(qTimer);
  qTimer = setTimeout(() => {
    qTimer = null;
    void flushQueue(strapi).catch((e: Error) => strapi.log.error('[rag/auto] sənəd: ' + e.message));
  }, wait);
  unref(qTimer);
}

async function flushQueue(strapi: StrapiAutoLike): Promise<void> {
  qFirst = 0;
  if (!enabled()) {
    queue.clear();
    return;
  }
  if (!queue.size) return;
  if (running) return; // tam keçid bitəndə özü çağırır
  const info = await storeInfo(strapi);
  if (!info) return;
  const items = [...queue.values()];
  queue.clear();
  const guard = guardOptionsFromEnv();
  const total = emptyStats();
  let removed = 0;
  for (let i = 0; i < items.length; i++) {
    const { src, docId } = items[i];
    for (const locale of LOCALES) {
      let entry: Row | null = null;
      try {
        entry = await strapi.documents(src.uid).findOne({
          documentId: docId,
          locale,
          status: 'published',
          fields: src.fields,
          ...(src.populate ? { populate: src.populate } : {}),
        });
      } catch {
        entry = null;
      }
      if (!entry) {
        removed += await deleteDoc(strapi, src.key, docId, locale);
        continue;
      }
      const known = new Map([[docId, await hashesFor(strapi, src.key, docId, locale)]]);
      const out = await indexBatch(strapi, info, src, [entry], locale, { guard, known, maxWaitMs: BG_MAX_WAIT });
      addStats(total, out.stats);
      if (!out.ok) {
        // Qalanı növbəyə qaytarılır; kvota bitibsə sonra (ən çox 5 dəfə).
        for (const it of items.slice(i)) queue.set(`${it.src.key}|${it.docId}`, it);
        if (++qRetries <= 5) {
          const wait = retryDelay(out);
          strapi.log.warn(`[rag/auto] sənəd indeksi dayandı (${String(out.error || '').slice(0, 120)}) — ${Math.round(wait / 60_000)} dəq sonra.`);
          scheduleQueue(strapi, wait);
        } else {
          strapi.log.warn('[rag/auto] sənəd indeksi 5 dəfə alınmadı — növbəti deploy-un tam keçidinə qalır.');
          queue.clear();
          qRetries = 0;
        }
        return;
      }
    }
  }
  qRetries = 0;
  strapi.log.info(
    `[rag/auto] sənəd yeniləndi: ${items.length} (${[...new Set(items.map((x) => x.src.key))].join(', ')}), ` +
      `yeni parça ${total.embedded}, silinən ${total.trimmed + removed}.`,
  );
}

const SOURCE_BY_UID = new Map(SOURCES.map((s) => [s.uid, s]));
const LIVE = new Set(['publish', 'unpublish', 'delete']);

/**
 * register(): mənbə növündə saytda görünən dəyişiklik → sənəd növbəyə. Middleware heç
 * vaxt xəta atmır və yazını gecikdirmir (iş 30 s sonra, arxa planda).
 */
export function registerRagIncremental(strapi: StrapiAutoLike): void {
  const use = strapi.documents.use;
  if (typeof use !== 'function') return;
  use.call(strapi.documents, async (context: Row, next: () => Promise<unknown>) => {
    const result = (await next()) as Row | null;
    try {
      const src = SOURCE_BY_UID.get(String(context.uid ?? ''));
      if (!src || !enabled()) return result;
      const action = String(context.action ?? '');
      const params = (context.params ?? {}) as Row;
      const live = LIVE.has(action) || ((action === 'create' || action === 'update') && params.status === 'published');
      if (!live) return result;
      const docId = String(params.documentId ?? (result && result.documentId) ?? '');
      if (!docId) return result;
      queue.set(`${src.key}|${docId}`, { src, docId });
      scheduleQueue(strapi);
    } catch {
      /* indeks növbəsi yazını sındırmamalıdır */
    }
    return result;
  });
}

/** Bootstrap zəncirindən: lazım olanda tam keçidi 90 s sonra arxa planda başladır. */
export async function startRagAutoIndex(strapi: StrapiAutoLike): Promise<void> {
  if (!boolEnv('RAG_AUTO_INDEX', true)) {
    strapi.log.info('[rag/auto] söndürülüb (RAG_AUTO_INDEX=false).');
    return;
  }
  const blocker = embedReadiness(embedConfig());
  if (blocker) {
    strapi.log.info('[rag/auto] embedding hazır deyil — avtomatik indeks işləmir: ' + blocker);
    return;
  }
  const st = await loadState(strapi);
  if (st && st.commit === commitNow() && (st.done || st.runs >= MAX_RUNS)) return;
  const delay = Math.max(1_000, Number(process.env.RAG_AUTO_INDEX_DELAY_MS || 90_000) || 90_000);
  strapi.log.info(`[rag/auto] indeks keçidi ${Math.round(delay / 1000)} s sonra ARXA PLANDA başlayacaq — port bloklanmır.`);
  schedule(strapi, delay, st && st.commit === commitNow() ? 'yarımçıqdan davam' : 'yeni deploy');
}

/** Diaqnostika (`/api/rag/admin/status`). */
export async function autoIndexState(strapi: StrapiAutoLike): Promise<Row> {
  let state: State | null = null;
  try {
    state = await loadState(strapi);
  } catch {
    state = null;
  }
  return {
    enabled: enabled(),
    running,
    scheduled: Boolean(timer),
    queued: queue.size,
    commit: commitNow(),
    state,
  };
}
