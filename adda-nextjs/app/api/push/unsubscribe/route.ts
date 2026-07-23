/**
 * F2.6e-3 — POST /api/push/unsubscribe
 * Endpoint-i serverdən silir. Brauzerdə `subscription.unsubscribe()` ayrıca
 * çağırılır — yalnız biri edilsə iki tərəf uyğunsuz qalar.
 */
import { NextRequest, NextResponse } from 'next/server';
import { sameOrigin, strapiPost } from '@/lib/identity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

  const endpoint = typeof body.endpoint === 'string' ? body.endpoint : '';
  if (!endpoint) {
    return NextResponse.json({ ok: false, error: 'invalid_subscription' }, { status: 400 });
  }

  await strapiPost('/api/push/unsubscribe', { endpoint }, { req });
  return NextResponse.json({ ok: true });
}
