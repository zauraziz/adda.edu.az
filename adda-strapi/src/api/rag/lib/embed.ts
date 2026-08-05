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
}

export interface EmbedOutcome {
  ok: boolean;
  vectors: number[][];
  error?: string;
  /** Sorğu sayı — kvota izləmək üçün. */
  calls: number;
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
  };
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
  error?: { message?: string; status?: string };
}

async function geminiBatch(
  texts: string[],
  kind: EmbedKind,
  cfg: EmbedConfig,
): Promise<{ vectors: number[][]; error?: string }> {
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

  // 429 / 5xx üçün eksponensial gözləmə. Pulsuz deyil, ödənişli tarifdir,
  // amma RPM həddi ödənişlidə də var.
  let lastError = '';
  for (let attempt = 1; attempt <= 4; attempt++) {
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
        if ((res.status === 429 || res.status >= 500) && attempt < 4) {
          await sleep(1000 * attempt * attempt);
          continue;
        }
        return { vectors: [], error: lastError };
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
      if (attempt < 4) await sleep(1000 * attempt * attempt);
    } finally {
      clearTimeout(timer);
    }
  }
  return { vectors: [], error: lastError };
}

type Embedder = (texts: string[], kind: EmbedKind, cfg: EmbedConfig) => Promise<{ vectors: number[][]; error?: string }>;

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
  if (notReady) return { ok: false, vectors: [], error: notReady, calls: 0 };
  if (!texts.length) return { ok: true, vectors: [], calls: 0 };

  const fn = EMBEDDERS[cfg.provider];
  const out: number[][] = [];
  let calls = 0;
  for (let i = 0; i < texts.length; i += cfg.batch) {
    const slice = texts.slice(i, i + cfg.batch);
    const res = await fn(slice, kind, cfg);
    calls++;
    if (res.error) return { ok: false, vectors: [], error: res.error, calls };
    out.push(...res.vectors);
  }
  return { ok: true, vectors: out, calls };
}
