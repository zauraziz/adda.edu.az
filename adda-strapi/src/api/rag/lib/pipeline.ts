/**
 * F2.7-4 — Ümumi retrieval boru xətti.
 *
 * NİYƏ AYRI FAYL: `/api/rag-search` və `/api/rag/answer` EYNİ nəticələr
 * üzərində işləməlidir. Məntiq iki nəzarətçi metodunda təkrarlansaydı,
 * ilk düzəlişdə ayrılardılar və «axtarışda görünür, cavabda görünmür»
 * tipli, izlənməsi çətin fərq yaranardı.
 *
 * Standalone kompilyasiya olunur — @strapi/strapi tipləri import EDİLMİR.
 */
import { sourceByKey } from './chunk';
import { embedConfig, embedReadiness } from './embed';
import { lexicalSearch, type LexicalHit, type StrapiDocsLike } from './lexical';
import {
  embedQuery,
  vectorSearch,
  rrfFuse,
  similarityStats,
  lastCandidates,
  type SimStats,
  type VectorHit,
} from './retrieve';
import { ensureSchema, type StoreMode, type StrapiDbLike } from './store';

export type StrapiRagLike = StrapiDbLike & StrapiDocsLike;

export interface Evidence {
  chunkIx: number;
  text: string;
  similarity: number;
}

export interface RetrievedDoc {
  source: string;
  docId: string;
  title: string;
  url: string;
  slug: string;
  snippet: string;
  evidence: Evidence[];
  lexRank?: number;
  vecRank?: number;
  rrf: number;
}

export interface RetrieveResult {
  hits: RetrievedDoc[];
  arms: string[];
  notes: string[];
  mode: StoreMode;
  cachedQuery: boolean;
  /** Əsaslandırılmış cavab üçün kifayət qədər mənbə varmı. */
  answerable: boolean;
  sim: SimStats | null;
  counts: { lexical: number; vector: number; chunks: number; candidates: number };
  total: number;
}

export interface RetrieveOptions {
  locale: string;
  limit: number;
  sources?: string[];
  dropFlagged?: boolean;
}

function boolEnv(name: string, dflt: boolean): boolean {
  const v = (process.env[name] || '').trim().toLowerCase();
  if (!v) return dflt;
  return v !== 'false' && v !== '0' && v !== 'no';
}

export function normalizeSources(raw: unknown): string[] {
  return String(raw || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s && sourceByKey(s));
}

export async function retrieve(
  strapi: StrapiRagLike,
  q: string,
  opts: RetrieveOptions,
): Promise<RetrieveResult> {
  const { locale, sources } = opts;
  const limit = Math.min(20, Math.max(1, opts.limit));
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
  // Deqradasiya SƏSSİZ DEYİL: səbəb `notes`-da qayıdır.
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
            dropFlagged: opts.dropFlagged !== undefined ? opts.dropFlagged : boolEnv('RAG_DROP_FLAGGED', true),
          });
          arms.push('vector');
        } catch (err) {
          notes.push('vektor axtarisi sindi: ' + String((err as Error).message).slice(0, 160));
        }
      }
    }
  }

  /* ── Sənəd səviyyəsinə yığ ── */
  // Parça sıralaması sənəd sıralamasına çevrilir: sənədin İLK görünüşü onun
  // rütbəsidir. Qalan parçalar SÜBUT kimi saxlanılır — cavab generasiyasında
  // sitat mətni məhz oradan gəlir.
  const docs = new Map<string, RetrievedDoc>();
  const keyOf = (s: string, d: string): string => s + ':' + d;

  const lexKeys: string[] = [];
  for (const h of lex) {
    const k = keyOf(h.source, h.docId);
    if (!docs.has(k)) {
      docs.set(k, {
        source: h.source, docId: h.docId, title: h.title, url: h.url,
        slug: h.slug, snippet: h.snippet, evidence: [], rrf: 0,
      });
      lexKeys.push(k);
      const d = docs.get(k);
      if (d) d.lexRank = lexKeys.length;
    }
  }

  const vecKeys: string[] = [];
  for (const h of vec) {
    const k = keyOf(h.source, h.docId);
    let d = docs.get(k);
    if (!d) {
      d = {
        source: h.source, docId: h.docId, title: h.title, url: h.url,
        slug: h.slug, snippet: '', evidence: [], rrf: 0,
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

  const hits: RetrievedDoc[] = Array.from(fused.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([k, rrf]) => {
      const d = docs.get(k) as RetrievedDoc;
      d.rrf = Math.round(rrf * 1e6) / 1e6;
      return d;
    });

  // Statistika KƏSİMDƏN ƏVVƏLKİ namizədlər üzərindədir — küy səviyyəsini
  // məhz onlar müəyyən edir.
  const raw = lastCandidates();
  const sim = similarityStats(raw);
  const zGate = Number(process.env.RAG_SIM_Z || '0');
  const answerable =
    lexKeys.length > 0 ||
    (vec.length > 0 && (zGate <= 0 || (sim ? sim.gapZ >= zGate : false)));

  return {
    hits,
    arms,
    notes,
    mode: info.mode,
    cachedQuery,
    answerable,
    sim,
    counts: { lexical: lexKeys.length, vector: vecKeys.length, chunks: vec.length, candidates: raw.length },
    total: fused.size,
  };
}
