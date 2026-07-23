/**
 * F2.6e — Kimlik (parolsuz magic-link) xidməti.
 *
 * TƏHLÜKƏSİZLİK QAYDALARI (dəyişdirmə):
 *  - Token bazada YALNIZ SHA-256 hash kimi saxlanılır. Plaintext heç vaxt yazılmır,
 *    heç vaxt loglanmır (SMTP qurulmayan dev rejimi istisna).
 *  - Magic token: qısa ömürlü (default 15 dəq) + TƏK İSTİFADƏLİK.
 *  - Sessiya tokeni: default 30 gün, geri çağırıla bilən (revokedAt).
 *  - Cavablar istifadəçi sayımına (enumeration) imkan vermir: `request` həmişə ok qaytarır.
 *
 * Standalone kompilyasiya olunur — @strapi/strapi tipləri import EDİLMİR.
 */
import { createHash, randomBytes } from 'node:crypto';

/* ── Strapi-nin yalnız istifadə etdiyimiz hissəsi (inline tip) ────────── */
type Row = Record<string, unknown>;
interface Query {
  findOne(args: Row): Promise<Row | null>;
  findMany(args: Row): Promise<Row[]>;
  create(args: Row): Promise<Row>;
  update(args: Row): Promise<Row>;
  delete(args: Row): Promise<unknown>;
  deleteMany(args: Row): Promise<unknown>;
}
export interface StrapiLike {
  db: { query(uid: string): Query };
  log: { info(m: string): void; warn(m: string): void; error(m: string): void };
  plugin(name: string): {
    service(name: string): { send(opts: Row): Promise<unknown> };
  };
}

const IDENTITY_UID = 'api::identity.identity';
const TOKEN_UID = 'api::identity.identity-token';

/* ── Konfiqurasiya ────────────────────────────────────────────────────── */
function intEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const MAGIC_TTL_MIN = intEnv('IDENTITY_MAGIC_TTL_MIN', 15);
const SESSION_TTL_DAYS = intEnv('IDENTITY_SESSION_TTL_DAYS', 30);
const SITE_URL = (process.env.SITE_URL || 'https://demo.adda.edu.az').replace(/\/+$/, '');

/* ── Kriptoqrafiya ────────────────────────────────────────────────────── */
function b64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
/** 256-bit təsadüfi token (URL-təhlükəsiz). */
export function newToken(): string {
  return b64url(randomBytes(32));
}
/** Bazada saxlanılan yeganə forma. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

/* ── Yardımçılar ──────────────────────────────────────────────────────── */
export function normalizeEmail(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const e = raw.trim().toLowerCase();
  if (e.length > 254) return '';
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) ? e : '';
}

/** Loglarda PII minimizasiyası: zaur@adda.edu.az -> z***@adda.edu.az */
export function redact(email: string): string {
  const at = email.indexOf('@');
  if (at < 1) return '***';
  return email.slice(0, 1) + '***' + email.slice(at);
}

export function safeLocale(raw: unknown): string {
  return raw === 'ru' || raw === 'en' ? raw : 'az';
}

/** Yalnız daxili, nisbi yol qəbul olunur — açıq yönləndirmə (open redirect) müdafiəsi. */
export function safeRedirect(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  if (!raw.startsWith('/') || raw.startsWith('//')) return '';
  if (raw.length > 300) return '';
  return /^[A-Za-z0-9/_\-.?=&%]+$/.test(raw) ? raw : '';
}

/** Nəzarət simvollarını təmizlə + uzunluğu kəs (injection / log-forging müdafiəsi). */
export function clean(raw: unknown, max: number): string {
  if (typeof raw !== 'string') return '';
  let s = '';
  for (const ch of raw) {
    const c = ch.codePointAt(0) as number;
    if (c === 9 || c === 10) { s += ch; continue; }
    if (c < 32 || (c >= 127 && c <= 159)) continue;
    s += ch;
  }
  return s.trim().slice(0, max);
}

/* ── E-poçt mətnləri (az / ru / en) ───────────────────────────────────── */
interface Mail { subject: string; intro: string; cta: string; note: string; ignore: string; }
const MAIL: Record<string, Mail> = {
  az: {
    subject: 'ADDA — giriş linkiniz',
    intro: 'Salam! ADDA saytında kimliyinizi təsdiqləmək üçün aşağıdakı düyməni klikləyin.',
    cta: 'Kimliyi təsdiqlə',
    note: 'Bu link ' + MAGIC_TTL_MIN + ' dəqiqə etibarlıdır və yalnız bir dəfə işləyir.',
    ignore: 'Bu sorğunu siz göndərməmisinizsə, məktubu nəzərə almayın — heç bir dəyişiklik olmayacaq.',
  },
  ru: {
    subject: 'ADDA — ваша ссылка для входа',
    intro: 'Здравствуйте! Нажмите кнопку ниже, чтобы подтвердить свою личность на сайте ADDA.',
    cta: 'Подтвердить личность',
    note: 'Ссылка действительна ' + MAGIC_TTL_MIN + ' минут и срабатывает только один раз.',
    ignore: 'Если вы не запрашивали это письмо, просто проигнорируйте его — ничего не изменится.',
  },
  en: {
    subject: 'ADDA — your sign-in link',
    intro: 'Hello! Click the button below to verify your identity on the ADDA website.',
    cta: 'Verify identity',
    note: 'This link is valid for ' + MAGIC_TTL_MIN + ' minutes and works only once.',
    ignore: 'If you did not request this, simply ignore this email — nothing will change.',
  },
};

function renderHtml(m: Mail, link: string): string {
  return [
    '<div style="margin:0;padding:32px 16px;background:#F0F8FF;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">',
    '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;margin:0 auto;background:#FFFFFF;border-radius:14px;overflow:hidden;border:1px solid #E5E7EB;">',
    '<tr><td style="background:#0B3D5C;padding:22px 28px;">',
    '<span style="color:#C9A961;font-size:13px;letter-spacing:.14em;text-transform:uppercase;">ADDA</span>',
    '<div style="color:#FFFFFF;font-size:18px;font-weight:700;margin-top:4px;">Azərbaycan Dövlət Dəniz Akademiyası</div>',
    '</td></tr>',
    '<tr><td style="padding:28px;">',
    '<p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.65;">' + m.intro + '</p>',
    '<p style="margin:0 0 24px;">',
    '<a href="' + link + '" style="display:inline-block;background:#0B3D5C;color:#FFFFFF;text-decoration:none;font-weight:600;font-size:15px;padding:13px 26px;border-radius:9px;">' + m.cta + '</a>',
    '</p>',
    '<p style="margin:0 0 8px;color:#6B7280;font-size:13px;line-height:1.6;">' + m.note + '</p>',
    '<p style="margin:0;color:#6B7280;font-size:13px;line-height:1.6;">' + m.ignore + '</p>',
    '</td></tr>',
    '<tr><td style="background:#F9FAFB;padding:16px 28px;border-top:1px solid #E5E7EB;">',
    '<p style="margin:0;color:#6B7280;font-size:12px;word-break:break-all;">' + link + '</p>',
    '</td></tr>',
    '</table></div>',
  ].join('');
}

/* ── Xidmət ───────────────────────────────────────────────────────────── */
export default ({ strapi }: { strapi: StrapiLike }) => ({
  normalizeEmail,
  safeLocale,
  safeRedirect,
  clean,

  /**
   * Magic-link sorğusu. Enumeration-a qarşı HƏMİŞƏ uğur qaytarır —
   * çağıran tərəf e-poçtun mövcudluğunu ayırd edə bilməməlidir.
   */
  async requestMagic(input: { email: string; locale?: unknown; name?: unknown; redirect?: unknown }): Promise<void> {
    const email = input.email;
    const locale = safeLocale(input.locale);
    const displayName = clean(input.name, 120);
    const redirect = safeRedirect(input.redirect);

    const identities = strapi.db.query(IDENTITY_UID);
    let identity = (await identities.findOne({ where: { email } })) as Row | null;
    if (!identity) {
      identity = await identities.create({ data: { email, displayName: displayName || null, locale } });
    } else if (identity.blocked === true) {
      strapi.log.warn('[identity] bloklanmis kimlik sorgusu: ' + redact(email));
      return;
    } else if (displayName && !identity.displayName) {
      await identities.update({ where: { id: identity.id as number }, data: { displayName } });
    }

    const token = newToken();
    const expiresAt = new Date(Date.now() + MAGIC_TTL_MIN * 60_000);
    await strapi.db.query(TOKEN_UID).create({
      data: {
        tokenHash: hashToken(token),
        purpose: 'magic',
        email,
        locale,
        expiresAt,
        identity: identity.id as number,
      },
    });

    const q = redirect ? '&r=' + encodeURIComponent(redirect) : '';
    const link = SITE_URL + '/' + locale + '/kimlik/tesdiq?t=' + encodeURIComponent(token) + q;
    await this.sendMagicMail(email, locale, link);
    void this.prune();
  },

  async sendMagicMail(email: string, locale: string, link: string): Promise<void> {
    const m = MAIL[locale] || MAIL.az;
    if (!process.env.SMTP_HOST) {
      // Dev rejimi: SMTP qurulmayıb. Link YALNIZ burada loglanır ki, lokal test mümkün olsun.
      strapi.log.warn('[identity] SMTP_HOST yoxdur — magic link loglanir (DEV): ' + link);
      return;
    }
    try {
      await strapi.plugin('email').service('email').send({
        to: email,
        subject: m.subject,
        text: m.intro + '\n\n' + link + '\n\n' + m.note + '\n' + m.ignore,
        html: renderHtml(m, link),
      });
      strapi.log.info('[identity] magic link gonderildi: ' + redact(email));
    } catch (err) {
      strapi.log.error('[identity] email gonderilmedi: ' + (err as Error).message);
    }
  },

  /**
   * Magic tokeni istifadə et → sessiya tokeni qaytar.
   * Tək istifadəlik: usedAt qoyulur, təkrar cəhd rədd olunur.
   */
  async verifyMagic(rawToken: unknown): Promise<{ ok: false } | { ok: true; email: string; name: string; session: string; expiresAt: string }> {
    if (typeof rawToken !== 'string' || rawToken.length < 20 || rawToken.length > 200) return { ok: false };
    const tokens = strapi.db.query(TOKEN_UID);
    const row = (await tokens.findOne({
      where: { tokenHash: hashToken(rawToken), purpose: 'magic' },
      populate: { identity: true },
    })) as Row | null;

    if (!row) return { ok: false };
    if (row.usedAt || row.revokedAt) return { ok: false };
    if (new Date(row.expiresAt as string).getTime() < Date.now()) return { ok: false };

    const identity = row.identity as Row | null;
    if (!identity || identity.blocked === true) return { ok: false };

    await tokens.update({ where: { id: row.id as number }, data: { usedAt: new Date() } });

    const now = new Date();
    await strapi.db.query(IDENTITY_UID).update({
      where: { id: identity.id as number },
      data: { verifiedAt: identity.verifiedAt || now, lastSeenAt: now },
    });

    const session = newToken();
    const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86_400_000);
    await tokens.create({
      data: {
        tokenHash: hashToken(session),
        purpose: 'session',
        email: identity.email as string,
        locale: (row.locale as string) || 'az',
        expiresAt,
        identity: identity.id as number,
      },
    });

    return {
      ok: true,
      email: identity.email as string,
      name: (identity.displayName as string) || '',
      session,
      expiresAt: expiresAt.toISOString(),
    };
  },

  /** Sessiya tokenini kimliyə çevirir. Etibarsızdırsa null. */
  async resolveSession(rawToken: unknown): Promise<{ id: number; email: string; name: string } | null> {
    if (typeof rawToken !== 'string' || rawToken.length < 20 || rawToken.length > 200) return null;
    const row = (await strapi.db.query(TOKEN_UID).findOne({
      where: { tokenHash: hashToken(rawToken), purpose: 'session' },
      populate: { identity: true },
    })) as Row | null;
    if (!row || row.revokedAt) return null;
    if (new Date(row.expiresAt as string).getTime() < Date.now()) return null;
    const identity = row.identity as Row | null;
    if (!identity || identity.blocked === true) return null;
    return {
      id: identity.id as number,
      email: identity.email as string,
      name: (identity.displayName as string) || '',
    };
  },

  async revokeSession(rawToken: unknown): Promise<void> {
    if (typeof rawToken !== 'string' || rawToken.length < 20 || rawToken.length > 200) return;
    const tokens = strapi.db.query(TOKEN_UID);
    const row = (await tokens.findOne({ where: { tokenHash: hashToken(rawToken), purpose: 'session' } })) as Row | null;
    if (row && !row.revokedAt) {
      await tokens.update({ where: { id: row.id as number }, data: { revokedAt: new Date() } });
    }
  },

  async touch(identityId: number): Promise<void> {
    try {
      await strapi.db.query(IDENTITY_UID).update({ where: { id: identityId }, data: { lastSeenAt: new Date() } });
    } catch {
      /* kritik deyil */
    }
  },

  /** Vaxtı keçmiş / istifadə olunmuş tokenləri təmizlə (token expiry gigiyenası). */
  async prune(): Promise<number> {
    try {
      const cutoff = new Date(Date.now() - 86_400_000);
      const stale = (await strapi.db.query(TOKEN_UID).findMany({
        where: { expiresAt: { $lt: cutoff } },
        select: ['id'],
        limit: 500,
      })) as Row[];
      if (!stale.length) return 0;
      await strapi.db.query(TOKEN_UID).deleteMany({ where: { id: { $in: stale.map((r) => r.id as number) } } });
      return stale.length;
    } catch (err) {
      strapi.log.error('[identity] prune xetasi: ' + (err as Error).message);
      return 0;
    }
  },
});
