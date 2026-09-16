/**
 * F5.31d — POST /api/submit/appeal
 *
 * Kimlik TƏLƏB ETMİR — saytın İLK açıq (kimliksiz) yaz formudur
 * (correction/rsvp kimlik-qapılıdır, bax /api/submit/correction və
 * /api/submit/rsvp). Ona görə əlavə müdafiə qatı:
 *   - sameOrigin (identity.ts-dəki EYNİ köməkçi)
 *   - honeypot: `website` sahəsi doludursa REDD (AppealIsland.tsx-də
 *     ekrandan kənara çıxarılıb, real istifadəçi doldurmur)
 *   - mətn uzunluğu limiti (aşağıda `str()`, Strapi lifecycle-dəki EYNİ
 *     ədədlər — bura ADDA-nın Strapi çağırışını israf etməmək üçündür,
 *     əsl sərhəd hər halda serverdə lifecycle-dədir)
 *   - sürət limiti: `global::rate-limit` middleware-i (Strapi tərəfdə,
 *     `POST /api/appeals` üçün saatda 5, bax rate-limit.ts) — bura
 *     YALNIZ 429 cavabını şərh edir, öz sayğacını SAXLAMIR (Vercel
 *     funksiyaları paylaşılan yaddaşa malik deyil, bax rate-limit.ts).
 *
 * CAPTCHA ƏLAVƏ OLUNMAYIB (tapşırıqda qəsdən) — əvvəlcə honeypot+limit sınanır.
 */
import { NextRequest, NextResponse } from 'next/server';
import { sameOrigin, strapiPost } from '@/lib/identity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function str(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

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

  // Honeypot: real istifadəçiyə görünməyən sahə. Botlar adətən hər sahəni
  // doldurur — burada dəyər varsa sükutla YOX, AÇIQ rədd edilir (tapşırıq:
  // "doldurulubsa rədd").
  if (str(body.website, 200)) {
    return NextResponse.json({ ok: false, error: 'rejected' }, { status: 400 });
  }

  const payload = {
    appealType: str(body.appealType, 20),
    firstName: str(body.firstName, 100),
    lastName: str(body.lastName, 100),
    patronymic: str(body.patronymic, 100),
    email: str(body.email, 254),
    phone: str(body.phone, 40),
    address: str(body.address, 300),
    subject: str(body.subject, 300),
    message: str(body.message, 5000),
    ...(str(body.targetUnit, 40) ? { targetUnit: str(body.targetUnit, 40) } : {}),
  };

  if (!payload.firstName || !payload.lastName || !payload.patronymic || !payload.email || !payload.phone || !payload.subject || !payload.message) {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 });
  }

  const r = await strapiPost('/api/appeals', { data: payload }, { req });

  if (r.status === 429) {
    const retryAfter = typeof r.data.retryAfter === 'number' ? r.data.retryAfter : 3600;
    return NextResponse.json({ ok: false, error: 'rate_limited', retryAfter }, { status: 429 });
  }
  if (!r.ok) {
    const error = typeof r.data.error === 'string' ? r.data.error : 'write_failed';
    return NextResponse.json({ ok: false, error }, { status: r.status === 400 ? 400 : 502 });
  }

  const trackingCode = typeof r.data.trackingCode === 'string' ? r.data.trackingCode : '';
  return NextResponse.json({ ok: true, trackingCode });
}
