/**
 * F2.6e-3 — POST /api/push/subscribe
 * Abunəlik kimlik TƏLƏB ETMİR. Kimlik cookie-si varsa sessiya tokeni ötürülür
 * ki, Strapi abunəliyi həmin kimliyə bağlasın (F2.7 bildiriş mərkəzi üçün).
 */
import { NextRequest, NextResponse } from 'next/server';
import { IDENTITY_COOKIE, sameOrigin, strapiPost, unpackSession } from '@/lib/identity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LOCALES = ['az', 'ru', 'en'];
const TOPICS = ['news', 'announcements', 'events'];

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ ok: false, error: 'bad_origin' }, { status: 403 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  const keys = (body.keys && typeof body.keys === 'object' ? body.keys : {}) as Record<string, unknown>;
  const payload = {
    endpoint: typeof body.endpoint === 'string' ? body.endpoint : '',
    keys: {
      p256dh: typeof keys.p256dh === 'string' ? keys.p256dh : '',
      auth: typeof keys.auth === 'string' ? keys.auth : '',
    },
    locale: typeof body.locale === 'string' && LOCALES.indexOf(body.locale) !== -1 ? body.locale : 'az',
    topics: Array.isArray(body.topics)
      ? body.topics.filter((t): t is string => typeof t === 'string' && TOPICS.indexOf(t) !== -1)
      : TOPICS,
  };

  const session = unpackSession(req.cookies.get(IDENTITY_COOKIE)?.value);
  const r = await strapiPost('/api/push/subscribe', payload, { req, session: session?.s });

  if (r.status === 429) {
    const retryAfter = typeof r.data.retryAfter === 'number' ? r.data.retryAfter : 3600;
    return NextResponse.json({ ok: false, error: 'rate_limited', retryAfter }, { status: 429 });
  }
  if (!r.ok) {
    const error = typeof r.data.error === 'string' ? r.data.error : 'write_failed';
    return NextResponse.json({ ok: false, error }, { status: r.status === 503 ? 503 : 502 });
  }

  return NextResponse.json({ ok: true });
}
