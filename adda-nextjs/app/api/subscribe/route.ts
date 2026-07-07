import { NextResponse } from 'next/server';

// Abunə endpoint-i (Mərhələ 0 körpüsü):
// e-poçtu server tərəfdə yoxlayır və qəbul edir.
// TODO (Mərhələ 2): Neon Postgres / Strapi-yə yazılacaq.
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: unknown };
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    if (!ok) {
      return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 });
    }
    console.log('[subscribe]', email);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }
}
