/**
 * F5.31d/F5.37 — POST /api/submit/appeal
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
 *
 * F5.37 — FAYL ƏLAVƏSİ:
 *   - Vercel funksiyasına gələn sorğu bədəni 4.5 MB ilə məhduddur (aşanda
 *     funksiya İŞƏ DÜŞMÜR, Vercel özü 413 FUNCTION_PAYLOAD_TOO_LARGE
 *     qaytarır). F5.32e faylı base64 JSON-da göndərirdi (×1.37 şişmə) —
 *     ~3.2 MB-dan böyük fayl 413 alırdı. İndi klient multipart/form-data
 *     göndərir (şişmə yoxdur), limit 4 MB-dır (üstəgəl mətn sahələri —
 *     4.5 MB-a sığır).
 *   - F5.32e-də bu route `attachment`-i Strapi-yə ÖTÜRMÜRDÜ — payload-da
 *     yox idi, ona görə heç bir əlavə Strapi-yə çatmırdı. Düzəldildi:
 *     fayl burada base64-ə çevrilib Strapi-nin gözlədiyi formatda gedir
 *     (Strapi controller-i dəyişmir: sniffFile + ölçü + upload orada).
 *   - Köhnə JSON formatı da qəbul olunur (deploy zamanı açıq qalmış
 *     səhifələr üçün), ölçü yoxlaması eynidir.
 */
import { NextRequest, NextResponse } from 'next/server';
import { sameOrigin, strapiPost } from '@/lib/identity';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// F5.37 — əlavə artıq həqiqətən yüklənir (Strapi → Cloudinary); Render-in
// oyanması ilə birlikdə defolt müddət çatmaya bilər. 60 san — bütün
// planlarda icazəli dəyər.
export const maxDuration = 60;

/** AppealIsland.tsx-dəki MAX_ATTACHMENT_BYTES ilə EYNİ dəyər. */
const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024;

function str(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ ok: false, error: 'bad_origin' }, { status: 403 });
  }

  // F5.37 — multipart (yeni klient) və ya JSON (köhnə klient).
  let body: Record<string, unknown> = {};
  let file: File | null = null;
  try {
    const ctype = req.headers.get('content-type') || '';
    if (ctype.startsWith('multipart/form-data')) {
      const fd = await req.formData();
      for (const [key, value] of fd.entries()) {
        if (typeof value === 'string') body[key] = value;
        else if (key === 'attachment' && value.size > 0) file = value;
      }
    } else {
      body = (await req.json()) as Record<string, unknown>;
    }
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  // Honeypot: real istifadəçiyə görünməyən sahə. Botlar adətən hər sahəni
  // doldurur — burada dəyər varsa sükutla YOX, AÇIQ rədd edilir (tapşırıq:
  // "doldurulubsa rədd").
  if (str(body.website, 200)) {
    return NextResponse.json({ ok: false, error: 'rejected' }, { status: 400 });
  }

  const payload: Record<string, unknown> = {
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

  // F5.37 — əlavə: ölçü BURADA da yoxlanılır (klient yoxlaması yalnız UX-dir).
  // Tip yoxlaması (ilk baytlar) Strapi-dədir — bura yalnız ötürür.
  if (file) {
    if (file.size > MAX_ATTACHMENT_BYTES) {
      return NextResponse.json({ ok: false, error: 'attachment_too_large' }, { status: 400 });
    }
    payload.attachment = Buffer.from(await file.arrayBuffer()).toString('base64');
  } else if (typeof body.attachment === 'string' && body.attachment) {
    const b64 = body.attachment.replace(/^data:[^;]+;base64,/, '');
    if (Math.floor((b64.length * 3) / 4) > MAX_ATTACHMENT_BYTES) {
      return NextResponse.json({ ok: false, error: 'attachment_too_large' }, { status: 400 });
    }
    payload.attachment = b64;
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
