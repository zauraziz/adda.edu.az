/**
 * F2.6e-3 — Push nəzarətçisi.
 *
 * Marşrutlar `auth: false`-dur → hər sahə burada yenidən yoxlanılır.
 * Abunəlik kimlik TƏLƏB ETMİR (bildirişlər anonim ola bilər), amma
 * `x-adda-identity` başlığı gəlibsə abunəlik həmin kimliyə bağlanır —
 * F2.7 vahid bildiriş mərkəzi bunu istifadə edəcək.
 *
 * Standalone kompilyasiya olunur — @strapi/strapi tipləri import EDİLMİR.
 */

interface Identity { id: number; email: string; name: string; }

interface IdentityService {
  resolveSession(t: unknown): Promise<Identity | null>;
}
interface PushService {
  publicKey(): string;
  vapidReady(): boolean;
  subscribe(i: {
    endpoint: string;
    p256dh: string;
    auth: string;
    locale?: unknown;
    topics?: unknown;
    identityId?: number | null;
  }): Promise<void>;
  unsubscribe(endpoint: string): Promise<void>;
}
interface StrapiLike {
  service(uid: string): unknown;
  log: { info(m: string): void; warn(m: string): void; error(m: string): void };
}
interface Ctx {
  request: { body?: unknown };
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
  status: number;
}

const KEY_RE = /^[A-Za-z0-9_-]{16,255}$/;

function bodyOf(ctx: Ctx): Record<string, unknown> {
  const raw = ctx.request.body;
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw as Record<string, unknown>;
  return {};
}

function headerOf(ctx: Ctx, name: string): string {
  const v = ctx.headers[name];
  if (typeof v === 'string') return v;
  if (Array.isArray(v) && v.length) return v[0];
  return '';
}

/** Push servisi endpoint-i yalnız https ola bilər və məhdud uzunluqdadır. */
function validEndpoint(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const e = raw.trim();
  if (e.length < 20 || e.length > 1000) return '';
  if (!e.startsWith('https://')) return '';
  try {
    const u = new URL(e);
    return u.protocol === 'https:' ? e : '';
  } catch {
    return '';
  }
}

export default ({ strapi }: { strapi: StrapiLike }) => ({
  /** GET /api/push/public-key — VAPID açarı tək mənbədən (Vercel-də dublikat env lazım deyil). */
  async publicKey(ctx: Ctx) {
    const push = strapi.service('api::push.push') as PushService;
    if (!push.vapidReady()) {
      ctx.status = 503;
      ctx.body = { ok: false, error: 'push_unconfigured' };
      return;
    }
    ctx.body = { ok: true, key: push.publicKey() };
  },

  /** POST /api/push/subscribe */
  async subscribe(ctx: Ctx) {
    const push = strapi.service('api::push.push') as PushService;
    if (!push.vapidReady()) {
      ctx.status = 503;
      ctx.body = { ok: false, error: 'push_unconfigured' };
      return;
    }

    const body = bodyOf(ctx);
    const endpoint = validEndpoint(body.endpoint);
    const keys = (body.keys && typeof body.keys === 'object' ? body.keys : {}) as Record<string, unknown>;
    const p256dh = typeof keys.p256dh === 'string' ? keys.p256dh.trim() : '';
    const auth = typeof keys.auth === 'string' ? keys.auth.trim() : '';

    if (!endpoint || !KEY_RE.test(p256dh) || !KEY_RE.test(auth)) {
      ctx.status = 400;
      ctx.body = { ok: false, error: 'invalid_subscription' };
      return;
    }

    let identityId: number | null = null;
    const sessionToken = headerOf(ctx, 'x-adda-identity');
    if (sessionToken) {
      const identity = await (strapi.service('api::identity.identity') as IdentityService).resolveSession(sessionToken);
      if (identity) identityId = identity.id;
    }

    try {
      await push.subscribe({ endpoint, p256dh, auth, locale: body.locale, topics: body.topics, identityId });
    } catch (err) {
      strapi.log.error('[push] abunelik yazila bilmedi: ' + (err as Error).message);
      ctx.status = 500;
      ctx.body = { ok: false, error: 'write_failed' };
      return;
    }

    ctx.body = { ok: true };
  },

  /** POST /api/push/unsubscribe */
  async unsubscribe(ctx: Ctx) {
    const endpoint = validEndpoint(bodyOf(ctx).endpoint);
    if (!endpoint) {
      ctx.status = 400;
      ctx.body = { ok: false, error: 'invalid_subscription' };
      return;
    }
    try {
      await (strapi.service('api::push.push') as PushService).unsubscribe(endpoint);
    } catch (err) {
      strapi.log.error('[push] abunelik silinmedi: ' + (err as Error).message);
    }
    ctx.body = { ok: true };
  },
});
