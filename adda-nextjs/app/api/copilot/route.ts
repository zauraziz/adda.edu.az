import { NextRequest } from 'next/server';
import { STRAPI_URL } from '@/lib/strapi';

/**
 * F2.7-6 — co-pilot proxy-si (SSE).
 *
 * ┌─ NİYƏ TOKEN AXINI YOX, MƏRHƏLƏ AXINI ───────────────────────────────┐
 * │ F2.7-4-də cavab KODDA yoxlanılır: sitatsız cavab ATILIR. Tokenləri  │
 * │ gəldikcə göstərsək, yoxlamadan keçməyən mətni əvvəlcə göstərib      │
 * │ sonra geri götürməli olardıq — bu, təminatı mənasız edir.           │
 * │                                                                     │
 * │ Bunun əvəzinə HƏQİQİ mərhələ axını var: retrieval generasiyadan     │
 * │ ~1 saniyə əvvəl bitir, ona görə MƏNBƏ KARTLARI dərhal göndərilir,   │
 * │ cavab isə yoxlanandan sonra. İstifadəçi gözləmir, təminat qalır.    │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * TƏHLÜKƏSİZLİK: Strapi-dəki `/api/rag-search` və `/api/rag/answer` İCTİMAİ
 * AÇILMIR. Bu marşrut server tərəfdə `ADMIN_IMPORT_SECRET` ilə imzalanmış
 * sorğu göndərir — yəni endpointlər internetdən bağlı qalır, yeganə giriş
 * nöqtəsi buradır və burada rate-limit var.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LOCALES = ['az', 'ru', 'en'];

/**
 * Sadə IP həddi.
 *
 * DÜRÜST MƏHDUDİYYƏT: yaddaşdadır, yəni instans yenidən başlayanda sıfırlanır
 * və çoxsaylı instansda paylaşılmır. Əsas müdafiə Strapi tərəfdəki
 * `rate-limit.ts`-dir; bu, ucuz birinci süzgəcdir.
 */
const HITS = new Map<string, number[]>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_WINDOW = 12;

function tooMany(ip: string): boolean {
  const now = Date.now();
  const list = (HITS.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  HITS.set(ip, list);
  if (HITS.size > 5000) HITS.clear();
  return list.length > MAX_PER_WINDOW;
}

interface Source {
  n?: number;
  title?: string;
  url?: string;
  kind?: string;
}
interface Entity {
  kind?: string;
  title?: string;
  url?: string;
  surface?: string;
}
interface AnswerBody {
  ok?: boolean;
  answered?: boolean;
  reason?: string;
  answer?: string;
  sources?: Source[];
  entities?: Entity[];
  error?: string;
  retryAfterMs?: number;
}
interface SearchBody {
  hits?: Array<{ source?: string; title?: string; url?: string; snippet?: string }>;
  answerable?: boolean;
}

export async function POST(req: NextRequest) {
  let payload: { q?: unknown; locale?: unknown } = {};
  try {
    payload = (await req.json()) as typeof payload;
  } catch {
    payload = {};
  }
  const q = String(payload.q ?? '').trim().slice(0, 300);
  const localeRaw = String(payload.locale ?? 'az');
  const locale = LOCALES.includes(localeRaw) ? localeRaw : 'az';

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  const secret = (process.env.ADMIN_IMPORT_SECRET || '').trim();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (secret) headers['x-adda-admin-secret'] = secret;

  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown): void => {
        controller.enqueue(enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        if (q.length < 3) {
          send('error', { code: 'query_too_short' });
          return;
        }
        if (tooMany(ip)) {
          send('error', { code: 'rate_limited' });
          return;
        }

        /* ── 1) Mənbələr ── */
        send('stage', { step: 'searching' });
        try {
          const r = await fetch(
            `${STRAPI_URL}/api/rag-search?q=${encodeURIComponent(q)}&locale=${locale}&limit=6`,
            { headers, cache: 'no-store' },
          );
          if (r.ok) {
            const d = (await r.json()) as SearchBody;
            send('sources', {
              hits: (d.hits || []).slice(0, 6).map((h) => ({
                kind: h.source,
                title: h.title,
                url: h.url,
                snippet: (h.snippet || '').slice(0, 160),
              })),
              answerable: d.answerable !== false,
            });
          }
        } catch {
          // Mənbə mərhələsi yalnız görüntü üçündür — sınsa cavab yenə gəlir.
        }

        /* ── 2) Cavab ── */
        send('stage', { step: 'generating' });
        const r2 = await fetch(`${STRAPI_URL}/api/rag/answer`, {
          method: 'POST',
          headers,
          cache: 'no-store',
          body: JSON.stringify({ q, locale }),
        });
        const d2 = (await r2.json()) as AnswerBody;

        if (!r2.ok) {
          send('error', {
            code: r2.status === 429 ? 'rate_limited' : d2.error || 'upstream_failed',
            retryAfterMs: d2.retryAfterMs ?? null,
          });
          return;
        }

        send('answer', {
          answered: d2.answered === true,
          reason: d2.reason || null,
          answer: d2.answer || '',
          sources: d2.sources || [],
          entities: d2.entities || [],
        });
      } catch (err) {
        console.error('[copilot] ' + String((err as Error).message).slice(0, 200));
        send('error', { code: 'unreachable' });
      } finally {
        send('done', {});
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-store, no-transform',
      Connection: 'keep-alive',
      // Vercel/nginx buferləməsi axını öldürür — mərhələlər birdən gələrdi.
      'X-Accel-Buffering': 'no',
    },
  });
}
