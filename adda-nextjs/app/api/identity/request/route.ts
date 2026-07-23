/**
 * F2.6e-2 — POST /api/identity/request
 * Magic-link sorğusunu Strapi-yə ötürür. Həqiqi müştəri IP-si etibarlı-proxy
 * başlığı ilə göndərilir ki, Strapi-nin rate-limit-i bütün istifadəçiləri
 * eyni səbətə yığmasın.
 *
 * Enumeration müdafiəsi: e-poçtun bazada olub-olmamasından asılı olmayaraq
 * eyni cavab qaytarılır.
 */
import { NextRequest, NextResponse } from 'next/server';
import { identityConfigured, sameOrigin, strapiPost } from '@/lib/identity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LOCALES = ['az', 'ru', 'en'];

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ ok: false, error: 'bad_origin' }, { status: 403 });
  }
  if (!identityConfigured()) {
    return NextResponse.json({ ok: false, error: 'identity_unconfigured' }, { status: 503 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 });
  }
  const locale = typeof body.locale === 'string' && LOCALES.indexOf(body.locale) !== -1 ? body.locale : 'az';
  const name = typeof body.name === 'string' ? body.name.slice(0, 120) : '';
  const redirect = typeof body.redirect === 'string' && body.redirect.startsWith('/') && !body.redirect.startsWith('//')
    ? body.redirect.slice(0, 300)
    : '';

  const r = await strapiPost('/api/identity/request', { email, locale, name, redirect }, { req });

  if (r.status === 429) {
    const retryAfter = typeof r.data.retryAfter === 'number' ? r.data.retryAfter : 900;
    return NextResponse.json({ ok: false, error: 'rate_limited', retryAfter }, { status: 429 });
  }
  if (r.status === 502) {
    return NextResponse.json({ ok: false, error: 'upstream_unreachable' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
