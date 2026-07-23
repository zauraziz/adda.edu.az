/**
 * F2.6e-2 — Kimlik köməkçiləri (YALNIZ SERVER).
 *
 * DİQQƏT: Bu modulu client island-dan İMPORT ETMƏ — `node:crypto` işlədir və
 * `IDENTITY_SECRET` sirrini oxuyur. Yalnız `app/api/**` route handler-lərində.
 *
 * MEMARLIQ:
 *  Strapi sessiya tokeni brauzer JS-inə HEÇ VAXT düşmür. O, HMAC ilə imzalanmış
 *  httpOnly cookie-nin içindədir; island-lar yalnız `/api/identity/me` vasitəsilə
 *  e-poçt/ad görür. XSS baş versə belə token oğurlana bilmir.
 *
 *  Cookie formatı: base64url(JSON) + "." + HMAC-SHA256(base64url)
 *  İmza yoxlaması sabit-vaxtlıdır (timingSafeEqual).
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import { STRAPI_URL } from '@/lib/strapi';

export const IDENTITY_COOKIE = 'adda_id';

export interface IdentitySession {
  /** Strapi sessiya tokeni (opaque) */
  s: string;
  /** e-poçt */
  e: string;
  /** görünən ad */
  n: string;
  /** bitmə vaxtı — ms epoch */
  x: number;
}

function secret(): string {
  return process.env.IDENTITY_SECRET || '';
}

export function identityConfigured(): boolean {
  return secret().length >= 16;
}

function b64url(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function unb64url(input: string): string {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4));
  return Buffer.from(input.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64').toString('utf8');
}

function mac(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('hex');
}

/** Sessiyanı imzalanmış cookie dəyərinə çevir. */
export function packSession(value: IdentitySession): string {
  const payload = b64url(JSON.stringify(value));
  return payload + '.' + mac(payload);
}

/** Cookie dəyərini yoxla və aç. Saxta imza / vaxtı keçmiş → null. */
export function unpackSession(raw: string | undefined): IdentitySession | null {
  if (!raw || !identityConfigured()) return null;
  const dot = raw.lastIndexOf('.');
  if (dot < 1) return null;
  const payload = raw.slice(0, dot);
  const given = raw.slice(dot + 1);
  const expected = mac(payload);
  if (given.length !== expected.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(given), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  try {
    const v = JSON.parse(unb64url(payload)) as Partial<IdentitySession>;
    if (typeof v.s !== 'string' || typeof v.e !== 'string' || typeof v.x !== 'number') return null;
    if (v.x < Date.now()) return null;
    return { s: v.s, e: v.e, n: typeof v.n === 'string' ? v.n : '', x: v.x };
  } catch {
    return null;
  }
}

export interface CookieOptions {
  httpOnly: true;
  secure: boolean;
  sameSite: 'lax';
  path: '/';
  maxAge: number;
}

export function cookieOptions(maxAgeSeconds: number): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds,
  };
}

/**
 * CSRF müdafiəsi (SameSite=Lax-a əlavə qat).
 * Origin varsa host-a uyğun olmalıdır. Brauzer POST-larında Origin həmişə gəlir.
 */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  const host = req.headers.get('host');
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/**
 * Həqiqi müştəri IP-si. Strapi-nin rate-limit-i buna güvənir, çünki Vercel
 * funksiyalarından gələn sorğularda Strapi yalnız Vercel-in IP-sini görür.
 */
export function clientIp(req: Request): string {
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim().slice(0, 64);
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0].trim();
    if (first) return first.slice(0, 64);
  }
  return 'unknown';
}

export interface StrapiResult {
  status: number;
  ok: boolean;
  data: Record<string, unknown>;
}

/** Strapi-yə etibarlı-proxy başlıqları ilə POST. */
export async function strapiPost(
  path: string,
  body: Record<string, unknown>,
  opts: { req: Request; session?: string }
): Promise<StrapiResult> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-adda-client-ip': clientIp(opts.req),
  };
  const proxySecret = process.env.INTERNAL_PROXY_SECRET;
  if (proxySecret) headers['x-adda-proxy-secret'] = proxySecret;
  if (opts.session) headers['x-adda-identity'] = opts.session;

  try {
    const res = await fetch(STRAPI_URL + path, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    let data: Record<string, unknown> = {};
    try {
      data = (await res.json()) as Record<string, unknown>;
    } catch {
      data = {};
    }
    return { status: res.status, ok: res.ok, data };
  } catch {
    return { status: 502, ok: false, data: { error: 'upstream_unreachable' } };
  }
}
