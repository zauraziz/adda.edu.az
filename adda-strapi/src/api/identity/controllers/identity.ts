import { writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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
  requestMagic(i: { email: string; locale?: unknown; name?: unknown; redirect?: unknown }): Promise<'sent' | 'unconfigured' | 'failed'>;
  sendMagicMail(email: string, locale: string, link: string): Promise<'sent' | 'unconfigured' | 'failed'>;
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
  documents(uid: string): {
    create(args: Row): Promise<Row>;
    update(args: Row): Promise<Row>;
    findMany(args: Row): Promise<Row[]>;
  };
  plugin(name: string): { service(name: string): { upload(args: Row): Promise<Row | Row[]> } };
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
const CORRECTION_TARGETS = ['article', 'announcement', 'event', 'milestone', 'person', 'page', 'general'];
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

const DEGREES = ['elmler_doktoru', 'felsefe_doktoru', 'yoxdur'];
const LANGS = ['az', 'tr', 'en', 'ru', 'diger'];

/**
 * Profil redaktəsinə icazə verilən e-poçt domenləri.
 *
 * İKİ QAT MÜDAFİƏ: domen yoxlaması + qeyddə saxlanılan e-poçtla üst-üstə
 * düşmə. Tək başına e-poçt uyğunluğu da kifayət edərdi, amma bu qat
 * `person.email`-ə səhvən şəxsi ünvan yazılsa belə redaktəni bağlayır.
 */
function allowedDomains(): string[] {
  const raw = process.env.PROFILE_EMAIL_DOMAINS || 'adda.edu.az';
  return raw.split(',').map((d) => d.trim().toLowerCase()).filter(Boolean);
}

/** Yalnız http(s) — `javascript:` sxemi bloklanır. */
function safeUrl(raw: unknown): string {
  const v = typeof raw === 'string' ? raw.trim().slice(0, 500) : '';
  if (!v) return '';
  return /^https?:\/\/[^\s]+$/i.test(v) ? v : '';
}

/**
 * Sessiya e-poçtuna görə `person` tap.
 *
 * `email` VƏ `altEmail` (ASCO ünvanı) yoxlanılır — heyətin bir hissəsi
 * gündəlik olaraq ASCO ünvanından istifadə edir.
 *
 * DƏQİQ BİR NƏTİCƏ TƏLƏB OLUNUR: iki qeyd eyni e-poçtla qayıdarsa `null`
 * qaytarılır. Belə halda "birincini götür" demək yanlış adamın profilini
 * yazmaq riskidir.
 */
async function findOwnPerson(strapi: StrapiLike, rawEmail: string): Promise<Row | null> {
  const email = String(rawEmail || '').trim().toLowerCase();
  if (!email) return null;

  const domain = email.split('@')[1] || '';
  if (allowedDomains().indexOf(domain) === -1) return null;

  const rows = await strapi.documents('api::person.person').findMany({
    locale: 'az',
    filters: { $or: [{ email: { $eqi: email } }, { altEmail: { $eqi: email } }] },
    // Audit izi üçün KÖHNƏ dəyərlər lazımdır — yazmadan əvvəl oxunmalıdır.
    fields: [
      'documentId', 'slug', 'name', 'displayName', 'email', 'altEmail',
      'position', 'phone', 'office', 'building', 'academicTitle', 'academicDegree',
      'bio', 'teaching', 'responsibilities', 'other', 'profileUpdatedAt',
    ],
    populate: ['languages', 'researchAreas', 'publications', 'experience', 'education', 'scholar'],
    limit: 2,
  });

  if (!Array.isArray(rows) || rows.length !== 1) return null;
  return rows[0];
}

/** Redaktora qaytarılan forma — məxfi sahə buraxılmır. */
function publicShape(p: Row): Row {
  return {
    slug: p.slug,
    name: p.name,
    displayName: p.displayName,
    email: p.email,
    position: p.position,
    phone: p.phone ?? '',
    office: p.office ?? '',
    building: p.building ?? '',
    academicTitle: p.academicTitle ?? '',
    academicDegree: p.academicDegree ?? '',
    bio: p.bio ?? '',
    teaching: p.teaching ?? '',
    responsibilities: p.responsibilities ?? '',
    other: p.other ?? '',
    languages: p.languages ?? [],
    researchAreas: p.researchAreas ?? [],
    publications: p.publications ?? [],
    experience: p.experience ?? [],
    education: p.education ?? [],
    scholar: p.scholar ?? null,
    profileUpdatedAt: p.profileUpdatedAt ?? null,
  };
}

/**
 * Sabit vaxtlı sətir müqayisəsi.
 *
 * Adi `===` uyğunsuzluğu ilk fərqli baytda dayandırır; hücumçu cavab vaxtına
 * baxaraq sirri simvol-simvol tapa bilər. Uzunluqlar fərqlidirsə də tam
 * dövr işlədilir.
 */
function timingSafeEqualStr(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

/**
 * Şəkil formatı — MAGIC BAYTLARDAN oxunur, `Content-Type` başlığından YOX.
 *
 * Başlıq müştəri tərəfindən yazılır və istənilən dəyər ola bilər. `.php`
 * faylını `image/jpeg` kimi göndərmək bir sətirlik işdir. Faylın ilk baytları
 * isə saxtalaşdırılsa fayl artıq işləməz — ona görə yeganə etibarlı yoxlama
 * budur.
 *
 * SVG QƏSDƏN YOXDUR: SVG icra oluna bilən `<script>` saxlaya bilər və eyni
 * mənbədən verildiyi üçün XSS-ə çevrilir.
 */
function sniffImage(buf: Buffer): { mime: string; ext: string } | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { mime: 'image/jpeg', ext: 'jpg' };
  }
  if (
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) {
    return { mime: 'image/png', ext: 'png' };
  }
  if (
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return { mime: 'image/webp', ext: 'webp' };
  }
  return null;
}

const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

/**
 * Dəyişikliyin izi.
 *
 * NİYƏ `previous` SAXLANILIR, `next` YOX: yeni dəyər onsuz da `person`-dadır.
 * Köhnəni saxlamaqla geri qaytarmaq mümkün olur — audit izinin əsas faydası
 * "kim nə etdi" deyil, "necə geri qaytarım"dır.
 */
/**
 * Müqayisə üçün normallaşdırma.
 *
 * `null`, `undefined` və `''` istifadəçi üçün eyni şeydir — boş sahə. Onları
 * fərqli saysaq, boş sahəni boş qoyub saxlamaq "dəyişiklik" kimi yazılardı.
 * Komponent massivlərində Strapi `id` sahəsi əlavə edir; müqayisədən çıxarılır.
 */
function normalizeForDiff(v: unknown): unknown {
  if (v === null || v === undefined || v === '') return null;
  if (Array.isArray(v)) return v.map((x) => normalizeForDiff(x));
  if (typeof v === 'object') {
    const out: Row = {};
    for (const [k, val] of Object.entries(v as Row)) {
      if (k === 'id' || k === '__component') continue;
      out[k] = normalizeForDiff(val);
    }
    return out;
  }
  return v;
}

async function recordRevision(
  strapi: StrapiLike,
  person: Row,
  actorEmail: string,
  changed: string[],
  previous: Row,
  ip: string,
) {
  try {
    await strapi.documents('api::person.profile-revision').create({
      data: {
        personSlug: String(person.slug ?? ''),
        actorEmail,
        changedFields: changed.join(','),
        previous,
        clientIp: ip.slice(0, 64),
        person: String(person.documentId),
      },
    });
  } catch (err) {
    // Audit yazılmasa da profil yenilənməsi DAYANMAMALIDIR — istifadəçi üçün
    // əsas əməliyyat odur. Sadəcə jurnala düşür.
    strapi.log.error('[identity] audit yazila bilmedi: ' + (err as Error).message);
  }
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
    let mail: 'sent' | 'unconfigured' | 'failed' = 'failed';
    try {
      mail = await svc.requestMagic({ email, locale: body.locale, name: body.name, redirect: body.redirect });
    } catch (err) {
      strapi.log.error('[identity] request xetasi: ' + (err as Error).message);
      mail = 'failed';
    }

    // ENUMERATION MÜDAFİƏSİ QORUNUR, NASAZLIQ İSƏ GİZLƏDİLMİR.
    //
    // İki fərqli sual var və onları qarışdırmaq olmaz:
    //   1. "Bu e-poçt qeydiyyatdadırmı?" -> cavab HƏMİŞƏ eyni olmalıdır,
    //      əks halda hücumçu ünvan siyahısı yığa bilər.
    //   2. "Poçt xidməti işləyirmi?" -> bu, istifadəçiyə aid DEYİL və heç nə
    //      sızdırmır. Gizlətmək isə zərərlidir: istifadəçi "Link göndərildi"
    //      görüb gözləyir, halbuki heç nə göndərilməyib.
    //
    // Əvvəl hər iki hal `ok: true` verirdi. İndi yalnız birincisi.
    if (mail === 'unconfigured') {
      ctx.status = 503;
      ctx.body = { ok: false, error: 'mail_unconfigured' };
      return;
    }
    if (mail === 'failed') {
      ctx.status = 503;
      ctx.body = { ok: false, error: 'mail_failed' };
      return;
    }
    ctx.body = { ok: true };
  },

  /**
   * POST /api/identity/admin/mail-test — SMTP diaqnostikası.
   *
   * Magic-link axını uğursuz olanda səbəbi tapmaq üçün. Real xəta mətnini
   * qaytarır ki, Render loglarını qazmaq lazım gəlməsin.
   *
   * `ADMIN_IMPORT_SECRET` ilə qorunur. Sirr təyin edilməyibsə endpoint
   * TAMAMİLƏ bağlıdır — boş sirr "hamıya açıq" demək olardı.
   */
  async adminMailTest(ctx: Ctx) {
    const expected = process.env.ADMIN_IMPORT_SECRET || '';
    if (!expected || expected.length < 16) {
      ctx.status = 503;
      ctx.body = { ok: false, error: 'admin_import_disabled' };
      return;
    }
    if (!timingSafeEqualStr(headerOf(ctx, 'x-adda-admin-secret'), expected)) {
      strapi.log.warn('[identity] admin/mail-test: sehv sirr');
      ctx.status = 403;
      ctx.body = { ok: false, error: 'forbidden' };
      return;
    }

    const cfg = {
      SMTP_HOST: Boolean(process.env.SMTP_HOST),
      SMTP_PORT: process.env.SMTP_PORT || '587 (default)',
      SMTP_SECURE: process.env.SMTP_SECURE || 'false (default)',
      SMTP_USER: Boolean(process.env.SMTP_USER),
      SMTP_PASS: Boolean(process.env.SMTP_PASS),
      SMTP_FROM: process.env.SMTP_FROM || 'ADDA <no-reply@adda.edu.az> (default)',
      SITE_URL: process.env.SITE_URL || 'https://demo.adda.edu.az (default)',
    };

    if (!cfg.SMTP_HOST) {
      ctx.status = 503;
      ctx.body = { ok: false, error: 'mail_unconfigured', config: cfg };
      return;
    }

    const svc = strapi.service(SERVICE_UID);
    const to = svc.normalizeEmail(bodyOf(ctx).to);
    if (!to) {
      // Yalnız konfiqurasiyanı göstər — göndərmə istənilmədi.
      ctx.body = { ok: true, sent: false, config: cfg };
      return;
    }

    try {
      await strapi.plugin('email').service('email').send({
        to,
        subject: 'ADDA — SMTP yoxlamasi',
        text: 'Bu, SMTP konfiqurasiyasinin yoxlanmasi ucun gonderilmis test mesajidir.',
      });
      strapi.log.info('[identity] mail-test ugurlu');
      ctx.body = { ok: true, sent: true, config: cfg };
    } catch (err) {
      const message = (err as Error).message;
      strapi.log.error('[identity] mail-test ugursuz: ' + message);
      ctx.status = 502;
      // XƏTA MƏTNİ AÇIQ QAYTARILIR: bu endpoint onsuz da sirrlə qorunur və
      // "connection refused" ilə "auth failed" arasındakı fərq düzəlişin
      // yeganə açarıdır.
      ctx.body = { ok: false, error: 'mail_failed', message, config: cfg };
    }
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

  /**
   * POST /api/identity/profile — öz profilini oxu.
   *
   * TƏHLÜKƏSİZLİK MODELİ: hansı `person` qeydinin açılacağını MÜŞTƏRİ SEÇMİR.
   * Sessiyadan gələn təsdiqlənmiş e-poçt `person.email` və ya `person.altEmail`
   * ilə tutuşdurulur. Slug qəbul edilmir — əks halda istənilən təsdiqlənmiş
   * istifadəçi başqasının profilini yaza bilərdi.
   */
  async myProfile(ctx: Ctx) {
    const svc = strapi.service(SERVICE_UID);
    const identity = await svc.resolveSession(headerOf(ctx, 'x-adda-identity'));
    if (!identity) {
      ctx.status = 401;
      ctx.body = { ok: false, error: 'identity_required' };
      return;
    }

    const person = await findOwnPerson(strapi, identity.email);
    if (!person) {
      ctx.status = 403;
      ctx.body = { ok: false, error: 'not_staff' };
      return;
    }

    ctx.body = { ok: true, person: publicShape(person) };
  },

  /** POST /api/identity/profile/update — yalnız öz profilini yenilə. */
  async updateProfile(ctx: Ctx) {
    const svc = strapi.service(SERVICE_UID);
    const identity = await svc.resolveSession(headerOf(ctx, 'x-adda-identity'));
    if (!identity) {
      ctx.status = 401;
      ctx.body = { ok: false, error: 'identity_required' };
      return;
    }

    const person = await findOwnPerson(strapi, identity.email);
    if (!person) {
      ctx.status = 403;
      ctx.body = { ok: false, error: 'not_staff' };
      return;
    }

    const body = bodyOf(ctx);
    const data: Row = {};

    // AĞ SİYAHI. `name`, `slug`, `email`, `staffType`, `roles`, `unit` QƏSDƏN
    // YOXDUR — onlar ştat cədvəlindən gəlir və işçi tərəfindən dəyişdirilə
    // bilməz. Qara siyahı işlətsək, sxemə yeni sahə əlavə edildikdə həmin sahə
    // səssizcə yazıla bilən olardı.
    for (const f of ['phone', 'office', 'building', 'academicTitle']) {
      if (f in body) data[f] = svc.clean(body[f], 200);
    }
    for (const f of ['bio', 'teaching', 'responsibilities', 'other']) {
      if (f in body) data[f] = svc.clean(body[f], 20000);
    }
    if ('academicDegree' in body) {
      const v = String(body.academicDegree ?? '');
      data.academicDegree = DEGREES.indexOf(v) !== -1 ? v : null;
    }
    if (Array.isArray(body.researchAreas)) {
      data.researchAreas = body.researchAreas
        .slice(0, 20)
        .map((t: unknown) => ({ label: svc.clean((t as Row)?.label ?? t, 120) }))
        .filter((t: { label: string }) => t.label);
    }
    if (Array.isArray(body.languages)) {
      data.languages = body.languages
        .slice(0, 10)
        .map((l: unknown) => ({
          lang: LANGS.indexOf(String((l as Row)?.lang ?? '')) !== -1 ? String((l as Row).lang) : 'diger',
          level: svc.clean((l as Row)?.level, 60),
        }));
    }
    if (Array.isArray(body.publications)) {
      data.publications = body.publications.slice(0, 200).map((p: unknown) => {
        const r = (p ?? {}) as Row;
        return {
          title: svc.clean(r.title, 400),
          year: intIn(r.year, 1900, 2100, 0) || null,
          source: svc.clean(r.source, 300),
          url: safeUrl(r.url),
        };
      }).filter((p: { title: string }) => p.title);
    }
    for (const f of ['experience', 'education'] as const) {
      if (!Array.isArray(body[f])) continue;
      data[f] = (body[f] as unknown[]).slice(0, 60).map((e) => {
        const r = (e ?? {}) as Row;
        return f === 'experience'
          ? {
              period: svc.clean(r.period, 60),
              organization: svc.clean(r.organization, 300),
              position: svc.clean(r.position, 200),
              sortYear: intIn(r.sortYear, 1900, 2100, 0) || null,
            }
          : {
              period: svc.clean(r.period, 60),
              institution: svc.clean(r.institution, 300),
              qualification: svc.clean(r.qualification, 200),
              sortYear: intIn(r.sortYear, 1900, 2100, 0) || null,
            };
      }).filter((e: Row) => e.period && (e.organization || e.institution));
    }
    if (body.scholar && typeof body.scholar === 'object') {
      const s = body.scholar as Row;
      data.scholar = {
        spin: svc.clean(s.spin, 40),
        orcid: svc.clean(s.orcid, 40),
        researcherId: svc.clean(s.researcherId, 40),
        scopusAuthorId: svc.clean(s.scopusAuthorId, 40),
        googleScholar: svc.clean(s.googleScholar, 300),
      };
    }

    if (!Object.keys(data).length) {
      ctx.status = 400;
      ctx.body = { ok: false, error: 'nothing_to_update' };
      return;
    }

    // HƏQİQƏTƏN dəyişən sahələr. Redaktor bütün formanı göndərir, ona görə
    // müqayisə etmədən "hamısı dəyişdi" yazsaq audit izi mənasız olardı.
    const changed: string[] = [];
    const previous: Row = {};
    for (const [k, v] of Object.entries(data)) {
      const before = person[k] ?? null;
      const same = JSON.stringify(normalizeForDiff(before)) === JSON.stringify(normalizeForDiff(v));
      if (same) continue;
      changed.push(k);
      previous[k] = before;
    }

    if (!changed.length) {
      // Dəyişiklik yoxdursa yazma. Boş revizyonlar tarixçəni doldurur və
      // `profileUpdatedAt` damğasını yalançı şəkildə təzələyir.
      ctx.body = { ok: true, changed: 0 };
      return;
    }

    data.profileUpdatedAt = new Date().toISOString();

    try {
      await strapi.documents('api::person.person').update({
        documentId: String(person.documentId),
        locale: 'az',
        data,
      });
    } catch (err) {
      strapi.log.error('[identity] profil yazila bilmedi: ' + (err as Error).message);
      ctx.status = 500;
      ctx.body = { ok: false, error: 'write_failed' };
      return;
    }

    await recordRevision(strapi, person, identity.email, changed, previous, headerOf(ctx, 'x-adda-client-ip'));
    strapi.log.info(`[identity] profil yenilendi: ${String(person.slug)} (${changed.join(',')})`);
    void svc.touch(identity.id);
    ctx.body = { ok: true };
  },

/**
   * POST /api/identity/profile/photo — öz şəklini yüklə.
   *
   * Fayl base64 kimi JSON gövdəsində gəlir. Multipart əvəzinə bu seçildi:
   * Next.js route handler-i faylı onsuz da yaddaşa oxuyur (validasiya üçün
   * magic baytlar lazımdır), ona görə yenidən multipart qurmaq əlavə addımdır.
   * 4 MB limit base64-də ~5.5 MB gövdə deməkdir — qəbul ediləndir.
   */
  async uploadPhoto(ctx: Ctx) {
    const svc = strapi.service(SERVICE_UID);
    const identity = await svc.resolveSession(headerOf(ctx, 'x-adda-identity'));
    if (!identity) {
      ctx.status = 401;
      ctx.body = { ok: false, error: 'identity_required' };
      return;
    }

    const person = await findOwnPerson(strapi, identity.email);
    if (!person) {
      ctx.status = 403;
      ctx.body = { ok: false, error: 'not_staff' };
      return;
    }

    const body = bodyOf(ctx);

    // Şəkli silmək də bu endpointdən keçir — ayrıca marşrut açmağa dəyməz.
    if (body.remove === true) {
      try {
        await strapi.documents('api::person.person').update({
          documentId: String(person.documentId),
          locale: 'az',
          data: { photo: null, profileUpdatedAt: new Date().toISOString() },
        });
      } catch (err) {
        strapi.log.error('[identity] foto silinmedi: ' + (err as Error).message);
        ctx.status = 500;
        ctx.body = { ok: false, error: 'write_failed' };
        return;
      }
      await recordRevision(strapi, person, identity.email, ['photo'], { photo: 'silindi' }, headerOf(ctx, 'x-adda-client-ip'));
      ctx.body = { ok: true, url: null };
      return;
    }

    const b64 = typeof body.data === 'string' ? body.data.replace(/^data:[^;]+;base64,/, '') : '';
    if (!b64) {
      ctx.status = 400;
      ctx.body = { ok: false, error: 'no_file' };
      return;
    }

    let buf: Buffer;
    try {
      buf = Buffer.from(b64, 'base64');
    } catch {
      ctx.status = 400;
      ctx.body = { ok: false, error: 'bad_encoding' };
      return;
    }
    if (!buf.length || buf.length > MAX_PHOTO_BYTES) {
      ctx.status = 400;
      ctx.body = { ok: false, error: 'too_large' };
      return;
    }

    const kind = sniffImage(buf);
    if (!kind) {
      ctx.status = 400;
      ctx.body = { ok: false, error: 'bad_type' };
      return;
    }

    // Ad İSTİFADƏÇİDƏN GƏLMİR: slug + vaxt damğası. Yüklənən fayl adı yol
    // keçidi (`../`) və ya icra olunan uzantı daşıya bilər.
    const name = `${String(person.slug)}-${Date.now()}.${kind.ext}`;
    const tmp = join(tmpdir(), name);

    let uploaded: Row | null = null;
    try {
      writeFileSync(tmp, buf);
      const res = await strapi.plugin('upload').service('upload').upload({
        data: { refId: person.documentId, ref: 'api::person.person', field: 'photo' },
        files: { filepath: tmp, originalFileName: name, mimetype: kind.mime, size: buf.length },
      });
      uploaded = Array.isArray(res) ? res[0] : res;
    } catch (err) {
      strapi.log.error('[identity] foto yuklenmedi: ' + (err as Error).message);
      ctx.status = 502;
      ctx.body = { ok: false, error: 'upload_failed' };
      return;
    } finally {
      try { unlinkSync(tmp); } catch { /* temizlik -- xetasi emeliyyati dayandirmir */ }
    }

    try {
      await strapi.documents('api::person.person').update({
        documentId: String(person.documentId),
        locale: 'az',
        data: { photo: uploaded?.id, profileUpdatedAt: new Date().toISOString() },
      });
    } catch (err) {
      strapi.log.error('[identity] foto baglanmadi: ' + (err as Error).message);
      ctx.status = 500;
      ctx.body = { ok: false, error: 'write_failed' };
      return;
    }

    await recordRevision(strapi, person, identity.email, ['photo'], { photo: 'evezlendi' }, headerOf(ctx, 'x-adda-client-ip'));
    strapi.log.info('[identity] foto yenilendi: ' + String(person.slug));
    void svc.touch(identity.id);
    ctx.body = { ok: true, url: uploaded?.url ?? null };
  },

  /**
   * POST /api/identity/admin/staff-private — doğum tarixlərinin toplu yazılması.
   *
   * NİYƏ AYRICA ENDPOINT: `staff-private` content type-ının REST marşrutu
   * QƏSDƏN yoxdur — orada doğum tarixi saxlanılır və `person` kimi ictimai
   * oxunmamalıdır. Amma 156 tarixi Strapi admin panelində əl ilə yazmaq
   * real deyil. Bu endpoint həmin boşluğu bağlayır.
   *
   * YALNIZ YAZI. Oxu əməliyyatı YOXDUR — endpoint kompromis olunsa belə,
   * mövcud tarixləri geri oxumaq mümkün deyil.
   *
   * `ADMIN_IMPORT_SECRET` təyin edilməyibsə endpoint TAMAMİLƏ bağlıdır.
   * Boş sirr "hamıya açıq" demək olardı — ona görə açıq şəkildə 503 verilir.
   */
  async adminStaffPrivate(ctx: Ctx) {
    const expected = process.env.ADMIN_IMPORT_SECRET || '';
    if (!expected || expected.length < 16) {
      ctx.status = 503;
      ctx.body = { ok: false, error: 'admin_import_disabled' };
      return;
    }
    if (!timingSafeEqualStr(headerOf(ctx, 'x-adda-admin-secret'), expected)) {
      strapi.log.warn('[identity] admin/staff-private: sehv sirr');
      ctx.status = 403;
      ctx.body = { ok: false, error: 'forbidden' };
      return;
    }

    const body = bodyOf(ctx);
    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length || items.length > 500) {
      ctx.status = 400;
      ctx.body = { ok: false, error: 'bad_items' };
      return;
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const raw of items) {
      const it = (raw ?? {}) as Row;
      const slug = String(it.personSlug ?? '').toLowerCase();
      const birthDate = String(it.birthDate ?? '');
      if (!SLUG_RE.test(slug) || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
        skipped++;
        continue;
      }

      try {
        const person = await strapi.documents('api::person.person').findMany({
          locale: 'az',
          filters: { slug: { $eq: slug } },
          fields: ['documentId'],
          limit: 1,
        });
        const personId = Array.isArray(person) && person[0] ? String(person[0].documentId) : null;
        if (!personId) { skipped++; continue; }

        const existing = await strapi.documents('api::person.staff-private').findMany({
          filters: { personSlug: { $eq: slug } },
          fields: ['documentId'],
          limit: 1,
        });

        if (Array.isArray(existing) && existing[0]) {
          await strapi.documents('api::person.staff-private').update({
            documentId: String(existing[0].documentId),
            data: { birthDate, person: personId },
          });
          updated++;
        } else {
          await strapi.documents('api::person.staff-private').create({
            data: { personSlug: slug, birthDate, person: personId },
          });
          created++;
        }
      } catch (err) {
        strapi.log.error('[identity] staff-private yazila bilmedi: ' + (err as Error).message);
        skipped++;
      }
    }

    strapi.log.info(`[identity] staff-private: ${created} yeni, ${updated} yenilendi, ${skipped} atlandi`);
    ctx.body = { ok: true, created, updated, skipped };
  },
});
