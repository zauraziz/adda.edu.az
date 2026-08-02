/**
 * K26-15 — POST /api/profile/photo
 *
 * Sessiya httpOnly cookie-dədir, brauzer JS-i onu görmür — yükləmə serverdən
 * keçir. Ada birbaşa Strapi-yə müraciət etmir.
 *
 * BURADA DA VALİDASİYA VAR, Strapi-də də. Təkrar qəsdəndir: burada tutulan
 * səhv Cloudinary-yə heç vaxt çatmır (pul və gecikmə), Strapi-dəki yoxlama isə
 * bu qatı keçən istənilən sorğu üçün son sərhəddir.
 */
import { NextRequest, NextResponse } from 'next/server';
import { IDENTITY_COOKIE, cookieOptions, sameOrigin, strapiPost, unpackSession } from '@/lib/identity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 4 * 1024 * 1024;

/** Magic baytlar — `Content-Type` başlığı müştəridən gəlir və saxtalaşdırıla bilər. */
function sniff(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) return 'image/png';
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    return 'image/webp';
  }
  return null;
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ ok: false, error: 'bad_origin' }, { status: 403 });
  }
  const session = unpackSession(req.cookies.get(IDENTITY_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ ok: false, error: 'identity_required' }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_body' }, { status: 400 });
  }

  const remove = body.remove === true;
  let payload: Record<string, unknown> = { remove: true };

  if (!remove) {
    const raw = typeof body.data === 'string' ? body.data.replace(/^data:[^;]+;base64,/, '') : '';
    if (!raw) {
      return NextResponse.json({ ok: false, error: 'no_file' }, { status: 400 });
    }
    let buf: Buffer;
    try {
      buf = Buffer.from(raw, 'base64');
    } catch {
      return NextResponse.json({ ok: false, error: 'bad_encoding' }, { status: 400 });
    }
    if (!buf.length || buf.length > MAX_BYTES) {
      return NextResponse.json({ ok: false, error: 'too_large' }, { status: 400 });
    }
    if (!sniff(buf)) {
      return NextResponse.json({ ok: false, error: 'bad_type' }, { status: 400 });
    }
    payload = { data: raw };
  }

  const r = await strapiPost('/api/identity/profile/photo', payload, { req, session: session.s });

  if (r.status === 401) {
    const res = NextResponse.json({ ok: false, error: 'identity_required' }, { status: 401 });
    res.cookies.set(IDENTITY_COOKIE, '', cookieOptions(0));
    return res;
  }
  if (r.status === 403) {
    return NextResponse.json({ ok: false, error: 'not_staff' }, { status: 403 });
  }
  if (r.status === 429) {
    const retryAfter = typeof r.data.retryAfter === 'number' ? r.data.retryAfter : 3600;
    return NextResponse.json({ ok: false, error: 'rate_limited', retryAfter }, { status: 429 });
  }
  if (!r.ok) {
    const error = typeof r.data.error === 'string' ? r.data.error : 'upload_failed';
    return NextResponse.json({ ok: false, error }, { status: r.status === 400 ? 400 : 502 });
  }
  return NextResponse.json(r.data, { status: 200 });
}
