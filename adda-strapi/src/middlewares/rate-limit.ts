/**
 * F2.6e — Yaddaşdaxili sürüşən-pəncərə (sliding window) rate-limit.
 *
 * NİYƏ STRAPI-DƏ, NEXT-DƏ YOX: Vercel serverless funksiyaları paylaşılan yaddaşa
 * malik deyil — orada sayğac etibarsızdır. Render-də Strapi tək instansdır,
 * ona görə sadə `Map` düzgün işləyir. Çox-instanslı quruluşa keçəndə bunu
 * Redis-ə köçürmək lazımdır (aşağıdakı STORE interfeysi elə buna görə ayrıdır).
 *
 * REAL İSTİFADƏÇİ IP-si: RSVP/düzəliş sorğuları Next.js route handler-dən keçir,
 * yəni Strapi-yə Vercel-in IP-si görünür. Əgər hamı eyni səbətə düşsə, bir
 * istifadəçi bütün saytı bloklayar. Ona görə Next həqiqi IP-ni
 * `x-adda-client-ip` ilə ötürür və `x-adda-proxy-secret` ilə özünü təsdiqləyir.
 * Sirr uyğun gəlmirsə başlıq NƏZƏRƏ ALINMIR (spoofing bağlıdır).
 *
 * PII: IP heç vaxt xam saxlanmır — yalnız duzlanmış SHA-256 açarı, yalnız
 * yaddaşda, yalnız pəncərə müddətincə.
 *
 * Standalone kompilyasiya olunur — @strapi/strapi tipləri import EDİLMİR.
 */
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

interface Ctx {
  method: string;
  path: string;
  headers: Record<string, string | string[] | undefined>;
  request: { body?: unknown; ip?: string };
  body: unknown;
  status: number;
  set(field: string, value: string): void;
}
interface StrapiLike {
  log: { info(m: string): void; warn(m: string): void; error(m: string): void };
}

/* ── Konfiqurasiya ────────────────────────────────────────────────────── */
function intEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const MIN = 60_000;
const SALT = process.env.RATE_LIMIT_SALT || randomBytes(16).toString('hex');

interface Rule {
  method: string;
  path: string;
  /** IP başına: [limit, pəncərə(ms)] */
  ip: [number, number];
  /** Body-dəki e-poçt başına (yalnız magic-link sorğusu üçün) */
  email?: [number, number];
  /** Bütün instans üzrə tavan — SMTP kvotasını qoruyur */
  global?: [number, number];
}

const RULES: Rule[] = [
  {
    method: 'POST',
    path: '/api/identity/request',
    ip: [intEnv('RL_IDENTITY_REQ_IP', 3), 15 * MIN],
    email: [intEnv('RL_IDENTITY_REQ_EMAIL', 3), 60 * MIN],
    global: [intEnv('RL_IDENTITY_REQ_GLOBAL', 100), 60 * MIN],
  },
  { method: 'POST', path: '/api/identity/verify', ip: [intEnv('RL_IDENTITY_VERIFY_IP', 12), 15 * MIN] },
  { method: 'POST', path: '/api/identity/session', ip: [intEnv('RL_IDENTITY_SESSION_IP', 240), 15 * MIN] },
  { method: 'POST', path: '/api/identity/logout', ip: [intEnv('RL_IDENTITY_LOGOUT_IP', 30), 15 * MIN] },
  { method: 'POST', path: '/api/identity/submit/rsvp', ip: [intEnv('RL_SUBMIT_RSVP_IP', 10), 60 * MIN] },
  { method: 'POST', path: '/api/identity/submit/correction', ip: [intEnv('RL_SUBMIT_CORRECTION_IP', 10), 60 * MIN] },
  { method: 'POST', path: '/api/reactions', ip: [intEnv('RL_REACTIONS_IP', 30), 5 * MIN] },
  { method: 'POST', path: '/api/rsvps', ip: [intEnv('RL_RSVPS_IP', 10), 60 * MIN] },
  { method: 'POST', path: '/api/corrections', ip: [intEnv('RL_CORRECTIONS_IP', 10), 60 * MIN] },
];

/* ── Sayğac anbarı (tək instans — Redis-ə köçürmək asandır) ───────────── */
const STORE = new Map<string, number[]>();
let lastSweep = Date.now();

function sweep(now: number): void {
  if (now - lastSweep < 5 * MIN) return;
  lastSweep = now;
  const horizon = now - 60 * MIN;
  for (const [key, hits] of STORE) {
    const live = hits.filter((t) => t > horizon);
    if (live.length) STORE.set(key, live);
    else STORE.delete(key);
  }
}

/** true = limit aşıldı. Sayğac yalnız icazə veriləndə artır. */
function hit(key: string, limit: number, windowMs: number, now: number): boolean {
  const hits = (STORE.get(key) || []).filter((t) => t > now - windowMs);
  if (hits.length >= limit) {
    STORE.set(key, hits);
    return true;
  }
  hits.push(now);
  STORE.set(key, hits);
  return false;
}

function retryAfter(key: string, windowMs: number, now: number): number {
  const hits = STORE.get(key) || [];
  if (!hits.length) return Math.ceil(windowMs / 1000);
  return Math.max(1, Math.ceil((hits[0] + windowMs - now) / 1000));
}

/* ── Yardımçılar ──────────────────────────────────────────────────────── */
function digest(kind: string, value: string): string {
  return kind + ':' + createHash('sha256').update(SALT + '|' + value).digest('hex').slice(0, 24);
}

function header(ctx: Ctx, name: string): string {
  const v = ctx.headers[name];
  if (typeof v === 'string') return v;
  if (Array.isArray(v) && v.length) return v[0];
  return '';
}

/** Sabit-vaxtlı müqayisə — sirrin uzunluğu sızmasın. */
function secretMatches(given: string): boolean {
  const expected = process.env.INTERNAL_PROXY_SECRET || '';
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Həqiqi müştəri IP-si.
 * 1) Etibarlı daxili proxy (Next) sirri ilə ötürübsə — ondan.
 * 2) Əks halda X-Forwarded-For-un SON qeydi (bilavasitə proxy əlavə edir;
 *    ilk qeyd müştəri tərəfindən saxtalaşdırıla bilər).
 */
function clientIp(ctx: Ctx): string {
  if (secretMatches(header(ctx, 'x-adda-proxy-secret'))) {
    const forwarded = header(ctx, 'x-adda-client-ip').trim();
    if (forwarded) return forwarded.slice(0, 64);
  }
  const xff = header(ctx, 'x-forwarded-for');
  if (xff) {
    const parts = xff.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1].slice(0, 64);
  }
  return (ctx.request.ip || 'unknown').slice(0, 64);
}

function emailFromBody(ctx: Ctx): string {
  const raw = ctx.request.body;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return '';
  const e = (raw as Record<string, unknown>).email;
  return typeof e === 'string' ? e.trim().toLowerCase().slice(0, 254) : '';
}

/* ── Middleware ───────────────────────────────────────────────────────── */
export default (_config: unknown, { strapi }: { strapi: StrapiLike }) => {
  return async (ctx: Ctx, next: () => Promise<unknown>) => {
    if (process.env.RATE_LIMIT_DISABLED === 'true') return next();

    const method = (ctx.method || '').toUpperCase();
    const rule = RULES.find((r) => r.method === method && ctx.path === r.path);
    if (!rule) return next();

    const now = Date.now();
    sweep(now);

    const buckets: Array<{ key: string; limit: number; window: number; label: string }> = [];
    buckets.push({ key: digest('ip|' + rule.path, clientIp(ctx)), limit: rule.ip[0], window: rule.ip[1], label: 'ip' });

    if (rule.email) {
      const email = emailFromBody(ctx);
      if (email) {
        buckets.push({ key: digest('em|' + rule.path, email), limit: rule.email[0], window: rule.email[1], label: 'email' });
      }
    }
    if (rule.global) {
      buckets.push({ key: 'gl|' + rule.path, limit: rule.global[0], window: rule.global[1], label: 'global' });
    }

    for (const b of buckets) {
      if (hit(b.key, b.limit, b.window, now)) {
        const wait = retryAfter(b.key, b.window, now);
        strapi.log.warn('[rate-limit] ' + rule.path + ' bloklandi (' + b.label + '), retry ' + wait + 's');
        ctx.status = 429;
        ctx.set('Retry-After', String(wait));
        ctx.body = { ok: false, error: 'rate_limited', retryAfter: wait };
        return undefined;
      }
    }

    return next();
  };
};
