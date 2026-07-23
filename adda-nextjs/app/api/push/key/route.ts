/**
 * F2.6e-3 — GET /api/push/key
 * VAPID açıq açarını Strapi-dən ötürür. QƏSDƏN `NEXT_PUBLIC_*` env işlədilmir:
 * açar tək mənbədə (Render) qalır, rotasiya Vercel-də rebuild tələb etmir.
 */
import { NextResponse } from 'next/server';
import { STRAPI_URL } from '@/lib/strapi';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch(STRAPI_URL + '/api/push/public-key', { cache: 'no-store' });
    const data = (await res.json()) as { ok?: boolean; key?: string };
    if (!res.ok || !data.ok || !data.key) {
      return NextResponse.json({ ok: false, error: 'push_unconfigured' }, { status: 503 });
    }
    const out = NextResponse.json({ ok: true, key: data.key });
    out.headers.set('Cache-Control', 'public, max-age=300');
    return out;
  } catch {
    return NextResponse.json({ ok: false, error: 'upstream_unreachable' }, { status: 502 });
  }
}
