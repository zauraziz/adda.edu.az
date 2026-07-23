/**
 * F2.6e-3 — Web Push (VAPID) xidməti.
 *
 * PRİNSİPLƏR:
 *  - Abunəlik anonimdir. Kimlik təsdiqlənibsə əlaqələndirilir (F2.7 vahid
 *    bildiriş mərkəzi üçün), amma tələb olunmur.
 *  - `endpoint` uzun URL-dir → unikallıq üçün `endpointHash` (SHA-256) işlənir.
 *    Text sütununa unique index bəzi bazalarda problemlidir.
 *  - Yayım İDEMPOTENTDİR: `push-broadcast.dedupeKey` unikaldır. Təkrar publish
 *    təkrar bildiriş göndərmir.
 *  - 404/410 → abunəlik ölüdür, dərhal silinir (brauzer onu ləğv edib).
 *  - Render pulsuz tarifdə tək instansdır: göndəriş partiyalarla (batch) və
 *    məhdud paralelliklə gedir ki, sorğu bloklanmasın.
 *
 * Standalone kompilyasiya olunur — @strapi/strapi tipləri import EDİLMİR.
 */
import { createHash } from 'node:crypto';

/* ── web-push (tipləri qurulmayıb — minimal inline interfeys) ─────────── */
interface PushSubscriptionShape {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}
interface WebPushError {
  statusCode?: number;
  message?: string;
}
interface WebPushLike {
  setVapidDetails(subject: string, publicKey: string, privateKey: string): void;
  sendNotification(sub: PushSubscriptionShape, payload: string, options?: Record<string, unknown>): Promise<unknown>;
}
/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const webpush: WebPushLike = require('web-push');

/* ── Strapi (inline tip) ──────────────────────────────────────────────── */
type Row = Record<string, unknown>;
interface Query {
  findOne(args: Row): Promise<Row | null>;
  findMany(args: Row): Promise<Row[]>;
  create(args: Row): Promise<Row>;
  update(args: Row): Promise<Row>;
  delete(args: Row): Promise<unknown>;
  deleteMany(args: Row): Promise<unknown>;
  count(args: Row): Promise<number>;
}
interface DocService {
  findOne(args: Row): Promise<Row | null>;
}
export interface StrapiLike {
  db: { query(uid: string): Query };
  documents(uid: string): DocService;
  log: { info(m: string): void; warn(m: string): void; error(m: string): void };
}

const SUB_UID = 'api::push.push-subscription';
const LOG_UID = 'api::push.push-broadcast';

const LOCALES = ['az', 'ru', 'en'];
const BATCH_SIZE = 20;
const TTL_SECONDS = 86_400;

/** uid → (mövzu, marşrut seqmenti) */
const BROADCAST_MAP: Record<string, { topic: string; route: string }> = {
  'api::article.article': { topic: 'news', route: 'xeberler' },
  'api::announcement.announcement': { topic: 'announcements', route: 'elanlar' },
  'api::event.event': { topic: 'events', route: 'tedbirler' },
};

export const TOPICS = ['news', 'announcements', 'events'];

export function hashEndpoint(endpoint: string): string {
  return createHash('sha256').update(endpoint, 'utf8').digest('hex');
}

export function safeLocale(raw: unknown): string {
  return LOCALES.indexOf(String(raw)) !== -1 ? String(raw) : 'az';
}

export function safeTopics(raw: unknown): string[] {
  if (!Array.isArray(raw)) return TOPICS.slice();
  const out = raw.filter((t) => typeof t === 'string' && TOPICS.indexOf(t) !== -1) as string[];
  return out.length ? Array.from(new Set(out)) : TOPICS.slice();
}

function clean(raw: unknown, max: number): string {
  if (typeof raw !== 'string') return '';
  let out = '';
  for (const ch of raw) {
    const c = ch.codePointAt(0) as number;
    if (c < 32 || (c >= 127 && c <= 159)) continue;
    out += ch;
  }
  return out.trim().slice(0, max);
}

export function vapidReady(): boolean {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

let vapidSet = false;
function ensureVapid(): boolean {
  if (!vapidReady()) return false;
  if (!vapidSet) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:info@adda.edu.az',
      process.env.VAPID_PUBLIC_KEY as string,
      process.env.VAPID_PRIVATE_KEY as string
    );
    vapidSet = true;
  }
  return true;
}

interface Payload {
  title: string;
  body: string;
  url: string;
  tag: string;
}

export default ({ strapi }: { strapi: StrapiLike }) => ({
  hashEndpoint,
  safeLocale,
  safeTopics,
  vapidReady,

  publicKey(): string {
    return process.env.VAPID_PUBLIC_KEY || '';
  },

  /** Abunəliyi yarat və ya yenilə (endpointHash üzrə upsert). */
  async subscribe(input: {
    endpoint: string;
    p256dh: string;
    auth: string;
    locale?: unknown;
    topics?: unknown;
    identityId?: number | null;
  }): Promise<void> {
    const endpointHash = hashEndpoint(input.endpoint);
    const data: Row = {
      endpoint: input.endpoint,
      endpointHash,
      p256dh: input.p256dh,
      auth: input.auth,
      locale: safeLocale(input.locale),
      topics: safeTopics(input.topics),
      failCount: 0,
      lastSeenAt: new Date(),
    };
    if (input.identityId) data.identity = input.identityId;

    const q = strapi.db.query(SUB_UID);
    const existing = (await q.findOne({ where: { endpointHash }, select: ['id'] })) as Row | null;
    if (existing) await q.update({ where: { id: existing.id as number }, data });
    else await q.create({ data });
  },

  async unsubscribe(endpoint: string): Promise<void> {
    await strapi.db.query(SUB_UID).deleteMany({ where: { endpointHash: hashEndpoint(endpoint) } });
  },

  /** Sənədin hər lokal üçün bildiriş yükünü qur. */
  async buildPayloads(uid: string, documentId: string): Promise<Record<string, Payload>> {
    const map = BROADCAST_MAP[uid];
    const out: Record<string, Payload> = {};
    if (!map) return out;

    for (const locale of LOCALES) {
      let doc: Row | null = null;
      try {
        doc = await strapi.documents(uid).findOne({ documentId, locale, status: 'published' } as Row);
      } catch {
        doc = null;
      }
      if (!doc) continue;
      const title = clean(doc.title, 120);
      const slug = clean(doc.slug, 200);
      if (!title || !slug) continue;
      out[locale] = {
        title,
        body: clean(doc.excerpt, 160),
        url: '/' + locale + '/' + map.route + '/' + slug,
        tag: map.topic + '-' + slug,
      };
    }
    return out;
  },

  /**
   * Yayım. Fire-and-forget çağırılır — heç vaxt throw etmir.
   * Dedupe: `push-broadcast` unikal açarı ilə (baza səviyyəsində).
   */
  async broadcast(uid: string, documentId: string): Promise<void> {
    const map = BROADCAST_MAP[uid];
    if (!map || !documentId) return;
    if (!ensureVapid()) {
      strapi.log.warn('[push] VAPID acarlari yoxdur — yayim otuldu.');
      return;
    }

    const dedupeKey = uid + '|' + documentId;
    const logQ = strapi.db.query(LOG_UID);
    let logRow: Row;
    try {
      // Unikal indeks yarisi (race) uduzsa create atir — demeli artiq gonderilib.
      logRow = await logQ.create({ data: { dedupeKey, targetUid: uid, docId: documentId } });
    } catch {
      return;
    }

    try {
      const payloads = await this.buildPayloads(uid, documentId);
      const fallback = payloads.az || payloads.ru || payloads.en;
      if (!fallback) {
        strapi.log.warn('[push] yuk qurulmadi: ' + dedupeKey);
        return;
      }

      const subs = (await strapi.db.query(SUB_UID).findMany({
        select: ['id', 'endpoint', 'p256dh', 'auth', 'locale', 'topics'],
        limit: 10_000,
      })) as Row[];

      const dead: number[] = [];
      let sent = 0;
      let failed = 0;

      for (let i = 0; i < subs.length; i += BATCH_SIZE) {
        const batch = subs.slice(i, i + BATCH_SIZE);
        const results = await Promise.allSettled(
          batch.map((s) => {
            const topics = safeTopics(s.topics);
            if (topics.indexOf(map.topic) === -1) return Promise.resolve('skip');
            const payload = payloads[safeLocale(s.locale)] || fallback;
            return webpush.sendNotification(
              {
                endpoint: s.endpoint as string,
                keys: { p256dh: s.p256dh as string, auth: s.auth as string },
              },
              JSON.stringify(payload),
              { TTL: TTL_SECONDS }
            );
          })
        );
        results.forEach((r, k) => {
          if (r.status === 'fulfilled') {
            if (r.value !== 'skip') sent++;
            return;
          }
          const code = (r.reason as WebPushError)?.statusCode;
          if (code === 404 || code === 410) dead.push(batch[k].id as number);
          else failed++;
        });
      }

      if (dead.length) {
        await strapi.db.query(SUB_UID).deleteMany({ where: { id: { $in: dead } } });
      }

      await logQ.update({
        where: { id: logRow.id as number },
        data: {
          slug: fallback.url.split('/').pop() || '',
          title: fallback.title,
          sentCount: sent,
          failedCount: failed,
          prunedCount: dead.length,
          sentAt: new Date(),
        },
      });
      strapi.log.info(
        '[push] ' + dedupeKey + ' -> gonderildi: ' + sent + ', ugursuz: ' + failed + ', olu silindi: ' + dead.length
      );
    } catch (err) {
      strapi.log.error('[push] yayim xetasi: ' + (err as Error).message);
    }
  },
});
