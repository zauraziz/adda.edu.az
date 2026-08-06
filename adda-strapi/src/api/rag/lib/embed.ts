/**
 * F2.7-1 — Embedding adapteri.
 *
 * PROVAYDER-AGNOSTİKDİR, nodemailer nümunəsindəki kimi: provayderi env
 * dəyişəni ilə əvəzləmək olar, KOD DƏYİŞMİR. Gemini-nin sınaq şərtləri və ya
 * qiyməti dəyişsə, `EMBEDDERS` cədvəlinə bir funksiya əlavə etmək kifayətdir.
 *
 * ┌─ ÜÇ TƏLƏ (hər üçü SƏSSİZ pozulma verir) ────────────────────────────┐
 * │ 1. `taskType` ASİMMETRİKDİR. Sənəd `RETRIEVAL_DOCUMENT`, sorğu isə  │
 * │    `RETRIEVAL_QUERY` ilə embed olunmalıdır. Eyni mətn iki taskType  │
 * │    ilə FƏRQLİ vektor verir — qarışdırılsa axtarış işləyir, sadəcə   │
 * │    pis işləyir. Xəta çıxmır, ona görə aylarla gizli qala bilər.     │
 * │ 2. KƏSİLMİŞ ÖLÇÜ NORMALLAŞDIRILMIR. `gemini-embedding-001` tam      │
 * │    3072 ölçüdə öncədən normallaşdırılmış vektor qaytarır, amma      │
 * │    `outputDimensionality` ilə kəsiləndə (768/1536) bu pozulur.      │
 * │    Kosinus oxşarlığı üçün ƏLLƏ L2 normallaşdırma məcburidir.        │
 * │ 3. Node `fetch`-in DEFAULT TIMEOUT-u YOXDUR. Provayder asılsa       │
 * │    indeksləmə əbədi gözləyir. (Eyni tələ nodemailer-də tapılmışdı.) │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Standalone kompilyasiya olunur — @strapi/strapi tipləri import EDİLMİR.
 */

export type EmbedKind = 'document' | 'query';

export interface EmbedConfig {
  provider: string;
  model: string;
  dims: number;
  batch: number;
  timeoutMs: number;
  hasKey: boolean;
  /** Dəqiqədə maksimum MƏTN ELEMENTİ. 0 = tənzimləmə yoxdur. */
  rpm: number;
  retries: number;
  /**
   * Bir HTTP sorğusu daxilində tənzimləyicinin gözləyə biləcəyi maksimum vaxt.
   *
   * 20 s seçilib: CLI timeout-u 180 s, Render-in öz həddi daha aşağıdır.
   * Bundan artıq gözləmək lazım gələrsə iş yarımçıq qaytarılır və çağıran
   * tərəf eyni kursordan davam edir.
   */
  maxWaitMs: number;
}

export interface EmbedCallResult {
  vectors: number[][];
  error?: string;
  /** 429 — kvota. Çağıran tərəf bunu ADİ XƏTADAN AYIRMALIDIR. */
  rateLimited?: boolean;
  /** Provayderin tövsiyə etdiyi gözləmə. */
  retryAfterMs?: number;
}

export interface EmbedOutcome {
  ok: boolean;
  vectors: number[][];
  error?: string;
  /** HTTP sorğu sayı. QEYD: kvota bunu yox, ELEMENT sayını sayır. */
  calls: number;
  /** Embed olunmuş element sayı — kvota büdcəsi budur. */
  items: number;
  rateLimited?: boolean;
  retryAfterMs?: number;
  /** Tənzimləyicidə gözlənilən ümumi vaxt. */
  pacedMs?: number;
  /**
   * true = vaxt büdcəsi bitdi, `vectors` girişin YALNIZ BİR HİSSƏSİDİR.
   * Çağıran tərəf embed olunanı saxlayıb eyni yerdən davam etməlidir.
   */
  partial?: boolean;
}

const DEFAULT_MODEL = 'gemini-embedding-001';
/**
 * 768 seçilib: tam 3072-yə qarşı keyfiyyət itkisi praktiki olaraq sıfırdır,
 * saxlama isə dörddə birdir. pgvector HNSW indeksi də kiçik ölçüdə xeyli
 * sürətli qurulur.
 *
 * DİQQƏT: ölçü DDL-də sabitlənir (`vector(768)`). Sonradan dəyişdirmək
 * cədvəli yenidən qurmağı tələb edir — `rag-index.mjs --purge-hard`.
 */
const DEFAULT_DIMS = 768;

function intEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function embedConfig(): EmbedConfig {
  const provider = (process.env.RAG_EMBED_PROVIDER || 'gemini').trim().toLowerCase();
  return {
    provider,
    model: (process.env.RAG_EMBED_MODEL || DEFAULT_MODEL).trim(),
    dims: intEnv('RAG_EMBED_DIMS', DEFAULT_DIMS),
    // `batchEmbedContents` bir sorğuda 100 elementə qədər qəbul edir.
    // 50 seçilib: 429 halında itirilən iş yarıya enir.
    batch: Math.min(100, intEnv('RAG_EMBED_BATCH', 50)),
    timeoutMs: intEnv('RAG_EMBED_TIMEOUT_MS', 60_000),
    hasKey: Boolean((process.env.GEMINI_API_KEY || '').trim()),
    // 90 — pulsuz tarifin 100/dəq həddinin altında qalmaq üçün. Ödənişli
    // tarifdə yüksəldilə bilər; 0 tənzimləməni söndürür.
    rpm: intEnv('RAG_EMBED_RPM', 90),
    retries: Math.min(10, intEnv('RAG_EMBED_RETRIES', 6)),
    maxWaitMs: intEnv('RAG_EMBED_MAX_WAIT_MS', 20_000),
  };
}

/* ── Sürət tənzimləyicisi ─────────────────────────────────────────────────
 * KVOTA HTTP SORĞUSUNU YOX, MƏTN ELEMENTİNİ SAYIR.
 *
 * Metrik adı bunu birbaşa deyir: `embed_content_free_tier_requests`. Praktik
 * sübut: batch=50 ilə 681 parça cəmi ~14 HTTP sorğusudur, lakin 1000-lik
 * gündəlik hədd doldu. Deməli `batchEmbedContents`-i böyütmək kvotaya
 * QƏNAƏT ETMİR — yalnız şəbəkə gedişlərini azaldır.
 *
 * Ona görə tənzimləmə element sayına görə aparılır: son 60 saniyədə
 * göndərilmiş elementlərin sürüşən pəncərəsi saxlanılır və hədd dolanda
 * gözlənilir. Render-də Strapi tək instansdır, modul səviyyəsində sayğac
 * kifayətdir (eyni əsaslandırma `rate-limit.ts`-dədir).
 * ─────────────────────────────────────────────────────────────────────── */

const ITEM_LOG: number[] = [];

/**
 * Tənzimləyici nə qədər gözlədəcək — GÖZLƏMƏDƏN ƏVVƏL bilmək üçün.
 *
 * NİYƏ LAZIMDIR: `pace()` sorğu emalçısının İÇİNDƏ yatır. Böyük paketdə bu
 * dəqiqələrlə ola bilər və HTTP bağlantısı qırılır (`HTTP 0`). Buna görə
 * gözləmə büdcədən artıqdırsa iş YARIMÇIQ qaytarılır — sındırmaq yox.
 */
function projectedWait(count: number, rpm: number): number {
  if (rpm <= 0 || count <= 0) return 0;
  const now = Date.now();
  const live = ITEM_LOG.filter((t) => now - t <= 60_000);
  if (live.length + count <= rpm) return 0;
  const need = live.length + count - rpm;
  const idx = Math.min(Math.max(0, need - 1), live.length - 1);
  if (idx < 0) return 0;
  return Math.max(0, 60_000 - (now - live[idx]) + 100);
}

/** Göndərməzdən əvvəl yer aç. Gözlənilən millisaniyəni qaytarır. */
async function pace(count: number, rpm: number): Promise<number> {
  if (rpm <= 0 || count <= 0) return 0;
  let waited = 0;
  for (let guard = 0; guard < 240; guard++) {
    const now = Date.now();
    while (ITEM_LOG.length && now - ITEM_LOG[0] > 60_000) ITEM_LOG.shift();
    if (ITEM_LOG.length + count <= rpm) break;
    // Paket özü hədddən böyükdürsə gözləmək kömək etmir — pəncərə boşalan
    // kimi buraxılır (çağıran tərəf `batch`-i `rpm`-ə görə kiçildir).
    if (count >= rpm && ITEM_LOG.length === 0) break;
    const need = ITEM_LOG.length + count - rpm;
    const idx = Math.min(Math.max(0, need - 1), ITEM_LOG.length - 1);
    const wait = Math.min(61_000, Math.max(300, 60_000 - (now - ITEM_LOG[idx]) + 100));
    await sleep(wait);
    waited += wait;
  }
  const t = Date.now();
  for (let i = 0; i < count; i++) ITEM_LOG.push(t);
  return waited;
}

/** Son 60 saniyədə göndərilmiş element sayı — diaqnostika üçün. */
export function pacerLoad(): number {
  const now = Date.now();
  while (ITEM_LOG.length && now - ITEM_LOG[0] > 60_000) ITEM_LOG.shift();
  return ITEM_LOG.length;
}

/**
 * Google-un dediyi gözləmə müddətini oxu.
 *
 * KÖHNƏ DAVRANIŞ SƏHV İDİ: sabit `1000 * attempt²` ilə 4 cəhddə cəmi ~14 s
 * gözlənilirdi, Google isə «retry in 43s» deyirdi — yəni imtina qaçılmaz idi.
 * İndi provayderin öz rəqəmi işlədilir.
 */
function retryAfterMs(json: GeminiResponse, raw: string): number {
  const details = (json.error && json.error.details) || [];
  for (const d of details) {
    const rd = d && typeof d.retryDelay === 'string' ? d.retryDelay : '';
    const m = rd.match(/^([0-9.]+)s$/);
    if (m) return Math.ceil(parseFloat(m[1]) * 1000);
  }
  // Ehtiyat: mesaj mətnindəki «Please retry in 6.47s».
  const m2 = raw.match(/retry in ([0-9.]+)s/i);
  if (m2) return Math.ceil(parseFloat(m2[1]) * 1000);
  return 0;
}

/** L2 normallaşdırma — bax yuxarıdakı 2-ci tələ. */
function normalize(v: number[]): number[] {
  let sum = 0;
  for (const x of v) sum += x * x;
  const n = Math.sqrt(sum);
  if (!Number.isFinite(n) || n === 0) return v;
  return v.map((x) => x / n);
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

interface GeminiEmbedding {
  values?: number[];
}
interface GeminiResponse {
  embeddings?: GeminiEmbedding[];
  error?: { message?: string; status?: string; details?: Array<{ retryDelay?: string }> };
}

async function geminiBatch(
  texts: string[],
  kind: EmbedKind,
  cfg: EmbedConfig,
): Promise<EmbedCallResult> {
  const key = (process.env.GEMINI_API_KEY || '').trim();
  const url =
    'https://generativelanguage.googleapis.com/v1beta/models/' +
    encodeURIComponent(cfg.model) +
    ':batchEmbedContents';

  const taskType = kind === 'query' ? 'RETRIEVAL_QUERY' : 'RETRIEVAL_DOCUMENT';
  const body = {
    requests: texts.map((text) => ({
      model: 'models/' + cfg.model,
      content: { parts: [{ text }] },
      taskType,
      outputDimensionality: cfg.dims,
    })),
  };

  let lastError = '';
  let lastRetryMs = 0;
  const maxAttempt = cfg.retries;
  for (let attempt = 1; attempt <= maxAttempt; attempt++) {
    // Göndərməzdən ƏVVƏL yer aç — 429-u yeyib sonra gözləmək əvəzinə.
    await pace(texts.length, cfg.rpm);
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), cfg.timeoutMs);
    try {
      const res = await fetch(url, {
        method: 'POST',
        signal: ac.signal,
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      let json: GeminiResponse = {};
      try {
        json = JSON.parse(text) as GeminiResponse;
      } catch {
        json = {};
      }

      if (!res.ok) {
        lastError = 'HTTP ' + res.status + ': ' + ((json.error && json.error.message) || text.slice(0, 200));
        const advised = retryAfterMs(json, text);
        if (res.status === 429) lastRetryMs = advised || 30_000;
        if ((res.status === 429 || res.status >= 500) && attempt < maxAttempt) {
          // Provayderin dediyi qədər + kiçik ehtiyat; yoxdursa eksponensial.
          await sleep(advised ? advised + 500 : 1000 * attempt * attempt);
          continue;
        }
        return {
          vectors: [],
          error: lastError,
          rateLimited: res.status === 429,
          retryAfterMs: lastRetryMs || undefined,
        };
      }

      const raw = json.embeddings || [];
      if (raw.length !== texts.length) {
        return {
          vectors: [],
          error: `provayder ${raw.length} vektor qaytardi, ${texts.length} gozlenilirdi`,
        };
      }
      const vectors: number[][] = [];
      for (const e of raw) {
        const v = e && Array.isArray(e.values) ? e.values : null;
        if (!v || v.length !== cfg.dims) {
          return {
            vectors: [],
            error: `olcu uygunsuzlugu: ${v ? v.length : 'null'} != ${cfg.dims}`,
          };
        }
        vectors.push(normalize(v));
      }
      return { vectors };
    } catch (err) {
      const e = err as Error;
      lastError = e && e.name === 'AbortError' ? `timeout (${cfg.timeoutMs} ms)` : String((e && e.message) || err);
      if (attempt < maxAttempt) await sleep(1000 * attempt * attempt);
    } finally {
      clearTimeout(timer);
    }
  }
  return { vectors: [], error: lastError, rateLimited: lastRetryMs > 0, retryAfterMs: lastRetryMs || undefined };
}

type Embedder = (texts: string[], kind: EmbedKind, cfg: EmbedConfig) => Promise<EmbedCallResult>;

const EMBEDDERS: Record<string, Embedder> = {
  gemini: geminiBatch,
};

/** Provayderin niyə hazır olmadığını izah edir — boş `{}` cavabı qalmasın. */
export function embedReadiness(cfg: EmbedConfig): string | null {
  if (!EMBEDDERS[cfg.provider]) {
    return `RAG_EMBED_PROVIDER='${cfg.provider}' taninmir (movcud: ${Object.keys(EMBEDDERS).join(', ')})`;
  }
  if (cfg.provider === 'gemini' && !cfg.hasKey) return 'GEMINI_API_KEY teyin edilmeyib';
  if (cfg.dims < 64 || cfg.dims > 3072) return `RAG_EMBED_DIMS=${cfg.dims} agilli hedd xaricindedir (64..3072)`;
  return null;
}

export async function embedTexts(texts: string[], kind: EmbedKind): Promise<EmbedOutcome> {
  const cfg = embedConfig();
  const notReady = embedReadiness(cfg);
  if (notReady) return { ok: false, vectors: [], error: notReady, calls: 0, items: 0 };
  if (!texts.length) return { ok: true, vectors: [], calls: 0, items: 0 };

  const fn = EMBEDDERS[cfg.provider];
  // Paket tənzimləyici pəncərəsindən böyük olmamalıdır — yoxsa heç vaxt
  // yer açıla bilməz.
  const batch = cfg.rpm > 0 ? Math.min(cfg.batch, cfg.rpm) : cfg.batch;
  const out: number[][] = [];
  let calls = 0;
  const t0 = Date.now();
  for (let i = 0; i < texts.length; i += batch) {
    const slice = texts.slice(i, i + batch);

    // VAXT BÜDCƏSİ. Gözləmə həddi aşırsa sorğu emalçısı dəqiqələrlə yatardı
    // və bağlantı qırılardı — məhz bu `HTTP 0` verirdi. Ən azı bir paket
    // emal olunubsa yarımçıq qayıdırıq; heç nə emal olunmayıbsa dayanmaq
    // mənasızdır (irəliləyiş sıfır olar), ona görə ilk paket həmişə gedir.
    if (i > 0 && projectedWait(slice.length, cfg.rpm) + (Date.now() - t0) > cfg.maxWaitMs) {
      return { ok: true, vectors: out, calls, items: out.length, pacedMs: Date.now() - t0, partial: true };
    }

    const res = await fn(slice, kind, cfg);
    calls++;
    if (res.error) {
      return {
        ok: false, vectors: [], error: res.error, calls, items: i,
        rateLimited: res.rateLimited, retryAfterMs: res.retryAfterMs,
      };
    }
    out.push(...res.vectors);
  }
  return { ok: true, vectors: out, calls, items: texts.length, pacedMs: Date.now() - t0 };
}
