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
  requestMagic(i: { email: string; locale?: unknown; name?: unknown; redirect?: unknown }): Promise<void>;
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
    fields: ['documentId', 'slug', 'name', 'displayName', 'email', 'altEmail'],
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
  };
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
    try {
      await svc.requestMagic({ email, locale: body.locale, name: body.name, redirect: body.redirect });
    } catch (err) {
      strapi.log.error('[identity] request xetasi: ' + (err as Error).message);
    }
    // Enumeration müdafiəsi: nəticədən asılı olmayaraq eyni cavab.
    ctx.body = { ok: true };
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

    strapi.log.info('[identity] profil yenilendi: ' + String(person.slug));
    void svc.touch(identity.id);
    ctx.body = { ok: true };
  },
});
