/**
 * F2.6e — Kimlik nəzarətçisi (controller).
 *
 * Bütün marşrutlar `auth: false`-dur, ona görə HƏR sahə burada yenidən yoxlanılır.
 * Sessiya tokeni `x-adda-identity` başlığı ilə gəlir — Next.js route handler onu
 * httpOnly cookie-dən çıxarıb ötürür, brauzer JS-i heç vaxt görmür.
 *
 * PII: `email` və `submitterEmail` MÜŞTƏRİDƏN QƏBUL EDİLMİR — yalnız təsdiqlənmiş
 * kimlikdən götürülür. Bu həm spoofing, həm də sahə-injection-u bağlayır.
 *
 * Standalone kompilyasiya olunur — @strapi/strapi tipləri import EDİLMİR.
 */

type Row = Record<string, unknown>;

interface Identity { id: number; email: string; name: string; }

interface IdentityService {
  requestMagic(i: { email: string; locale?: unknown; name?: unknown; redirect?: unknown }): Promise<void>;
  verifyMagic(t: unknown): Promise<{ ok: false } | { ok: true; email: string; name: string; session: string; expiresAt: string }>;
  resolveSession(t: unknown): Promise<Identity | null>;
  revokeSession(t: unknown): Promise<void>;
  touch(id: number): Promise<void>;
  normalizeEmail(v: unknown): string;
  safeLocale(v: unknown): string;
  clean(v: unknown, max: number): string;
}

interface StrapiLike {
  service(uid: string): IdentityService;
  documents(uid: string): { create(args: Row): Promise<Row> };
  log: { info(m: string): void; warn(m: string): void; error(m: string): void };
}

interface Ctx {
  request: { body?: unknown };
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
  status: number;
}

const SERVICE_UID = 'api::identity.identity';

const RSVP_STATUS = ['going', 'maybe', 'declined'];
const CORRECTION_TARGETS = ['article', 'announcement', 'event', 'milestone', 'page', 'general'];
const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,198}[a-z0-9])?$/;

function bodyOf(ctx: Ctx): Row {
  const raw = ctx.request.body;
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw as Row;
  return {};
}

function headerOf(ctx: Ctx, name: string): string {
  const v = ctx.headers[name];
  if (typeof v === 'string') return v;
  if (Array.isArray(v) && v.length) return v[0];
  return '';
}

function intIn(raw: unknown, min: number, max: number, fallback: number): number {
  const n = typeof raw === 'number' ? raw : parseInt(String(raw ?? ''), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

export default ({ strapi }: { strapi: StrapiLike }) => ({
  /** POST /api/identity/request — magic-link göndər. */
  async request(ctx: Ctx) {
    const svc = strapi.service(SERVICE_UID);
    const body = bodyOf(ctx);
    const email = svc.normalizeEmail(body.email);
    if (!email) {
      ctx.status = 400;
      ctx.body = { ok: false, error: 'invalid_email' };
      return;
    }
    try {
      await svc.requestMagic({ email, locale: body.locale, name: body.name, redirect: body.redirect });
    } catch (err) {
      strapi.log.error('[identity] request xetasi: ' + (err as Error).message);
    }
    // Enumeration müdafiəsi: nəticədən asılı olmayaraq eyni cavab.
    ctx.body = { ok: true };
  },

  /** POST /api/identity/verify — magic tokeni sessiyaya çevir. */
  async verify(ctx: Ctx) {
    const svc = strapi.service(SERVICE_UID);
    const result = await svc.verifyMagic(bodyOf(ctx).token);
    if (!result.ok) {
      ctx.status = 400;
      ctx.body = { ok: false, error: 'invalid_or_expired' };
      return;
    }
    ctx.body = result;
  },

  /** POST /api/identity/session — cari sessiyanı oxu (Next `/api/identity/me` üçün). */
  async session(ctx: Ctx) {
    const svc = strapi.service(SERVICE_UID);
    const identity = await svc.resolveSession(headerOf(ctx, 'x-adda-identity'));
    if (!identity) {
      ctx.status = 401;
      ctx.body = { ok: false, error: 'no_session' };
      return;
    }
    ctx.body = { ok: true, email: identity.email, name: identity.name };
  },

  /** POST /api/identity/logout — sessiyanı geri çağır. */
  async logout(ctx: Ctx) {
    await strapi.service(SERVICE_UID).revokeSession(headerOf(ctx, 'x-adda-identity'));
    ctx.body = { ok: true };
  },

  /** POST /api/identity/submit/rsvp — yalnız təsdiqlənmiş kimlik. */
  async submitRsvp(ctx: Ctx) {
    const svc = strapi.service(SERVICE_UID);
    const identity = await svc.resolveSession(headerOf(ctx, 'x-adda-identity'));
    if (!identity) {
      ctx.status = 401;
      ctx.body = { ok: false, error: 'identity_required' };
      return;
    }

    const body = bodyOf(ctx);
    const eventSlug = svc.clean(body.eventSlug, 200).toLowerCase();
    if (!SLUG_RE.test(eventSlug)) {
      ctx.status = 400;
      ctx.body = { ok: false, error: 'invalid_slug' };
      return;
    }
    const status = RSVP_STATUS.indexOf(String(body.status)) !== -1 ? String(body.status) : 'going';

    try {
      await strapi.documents('api::rsvp.rsvp').create({
        data: {
          eventSlug,
          eventTitle: svc.clean(body.eventTitle, 300),
          // Ad və e-poçt YALNIZ kimlikdən — müştəri dəyəri nəzərə alınmır.
          name: identity.name || identity.email.split('@')[0],
          email: identity.email,
          status,
          guests: intIn(body.guests, 0, 10, 0),
          note: svc.clean(body.note, 1000),
          verified: true,
          identity: identity.id,
        },
      });
    } catch (err) {
      strapi.log.error('[identity] rsvp yazila bilmedi: ' + (err as Error).message);
      ctx.status = 500;
      ctx.body = { ok: false, error: 'write_failed' };
      return;
    }

    void svc.touch(identity.id);
    ctx.body = { ok: true };
  },

  /** POST /api/identity/submit/correction — yalnız təsdiqlənmiş kimlik. */
  async submitCorrection(ctx: Ctx) {
    const svc = strapi.service(SERVICE_UID);
    const identity = await svc.resolveSession(headerOf(ctx, 'x-adda-identity'));
    if (!identity) {
      ctx.status = 401;
      ctx.body = { ok: false, error: 'identity_required' };
      return;
    }

    const body = bodyOf(ctx);
    const targetType = CORRECTION_TARGETS.indexOf(String(body.targetType)) !== -1 ? String(body.targetType) : 'general';
    const suggestedValue = svc.clean(body.suggestedValue, 5000);
    if (!suggestedValue) {
      ctx.status = 400;
      ctx.body = { ok: false, error: 'empty_suggestion' };
      return;
    }
    const targetSlug = svc.clean(body.targetSlug, 200).toLowerCase();
    if (targetSlug && !SLUG_RE.test(targetSlug)) {
      ctx.status = 400;
      ctx.body = { ok: false, error: 'invalid_slug' };
      return;
    }

    try {
      await strapi.documents('api::correction.correction').create({
        data: {
          targetType,
          targetSlug,
          fieldPath: svc.clean(body.fieldPath, 200),
          currentValue: svc.clean(body.currentValue, 5000),
          suggestedValue,
          reason: svc.clean(body.reason, 1000),
          submitterName: identity.name || identity.email.split('@')[0],
          submitterEmail: identity.email,
          // status lifecycle-də məcburi "pending" olur — burada göndərilmir.
          verified: true,
          identity: identity.id,
        },
      });
    } catch (err) {
      strapi.log.error('[identity] duzelis yazila bilmedi: ' + (err as Error).message);
      ctx.status = 500;
      ctx.body = { ok: false, error: 'write_failed' };
      return;
    }

    void svc.touch(identity.id);
    ctx.body = { ok: true };
  },
});
