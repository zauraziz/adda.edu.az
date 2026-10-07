/**
 * F5.39 — Məsul redaktorlar: saytın hər səhifəsinin məzmununa bir admin.
 *
 * NƏ EDİR:
 *   - Baş admin menyudakı HƏR səhifəyə (~90 «hazırlanır» daxil) bir admin
 *     istifadəçisini məsul təyin edir: admin «Məsul redaktorlar» səhifəsi və
 *     ya həmin qeydin redaktə səhifəsindəki yan panel.
 *   - Redaktor YALNIZ özünə təyin olunmuş səhifələri dəyişə bilir: «Məsul
 *     redaktor» rolu `api::adda-page-owner` şərti ilə qurulur (bax
 *     ownerCondition). Oxumaq hamısını olar (əlaqə seçicilər üçün lazımdır).
 *   - Təyin olunanda redaktora məktub gedir; hər bazar ertəsi 09:00 (Bakı)
 *     məzmun gözləyən səhifələrin siyahısı göndərilir. Hər ikisində
 *     «Saytda bax» və «Məzmun əlavə et» keçidləri var.
 *   - «Məzmun əlavə et» hazırlanır səhifəsi üçün eyni slug-lı QARALAMA
 *     səhifə yaradır və onu admində açır. Dərc olunanda /hazirlanir/<slug>
 *     avtomatik /sehife/<slug>-ə yönəlir (Next.js tərəfi).
 *   - Saytda səhifənin altında «məsul: Ad Soyad, vəzifə» göstərilir
 *     (ictimai /api/adda-owners/public — e-poçt QAYTARILMIR).
 *
 * AÇAR (key): səhifə ünvanından hesablanır, Next.js-də EYNİ funksiya var
 * (adda-nextjs/lib/page-owner-key.ts). /sehife/x və /hazirlanir/x eyni
 * səhifədir → `page:x`; /struktur/x → `unit:x`; siyahı səhifələri və
 * digərləri → `path:/xeberler`.
 */
import type { Core } from '@strapi/strapi';
import { deliver } from '../api/identity/services/identity';

type Row = Record<string, unknown>;

const OWNER_UID = 'api::page-owner.page-owner';
export const EDITOR_ROLE_CODE = 'adda-mesul-redaktor';
export const OWNER_CONDITION = 'api::adda-page-owner';

const SITE_URL = (process.env.SITE_URL || 'https://demo.adda.edu.az').trim().replace(/\/+$/, '');
const ADMIN_URL = (process.env.ADMIN_PUBLIC_URL || 'https://adda-edu-az.onrender.com').trim().replace(/\/+$/, '') + '/admin';

// ── Açar ─────────────────────────────────────────────────────────────────────

/**
 * Qeyd səhifələri: ünvan → növ (slug ilə tapılır).
 * F5.41: /fakulteler/x → /struktur/x-ə 301 yönlənir (fakültənin yeganə səhifəsi
 * bölmədir, slug eynidir) — ona görə açar da unit:x-dir.
 */
const DETAIL: [RegExp, Kind][] = [
  [/^\/(?:sehife|hazirlanir)\/([^/]+)$/, 'page'],
  [/^\/struktur\/([^/]+)$/, 'unit'],
  [/^\/ixtisaslar\/([^/]+)$/, 'program'],
  [/^\/fakulteler\/([^/]+)$/, 'unit'],
  [/^\/emekdas\/([^/]+)$/, 'person'],
  [/^\/auditoriyalar\/([^/]+)$/, 'facility'],
  [/^\/qehremanlarimiz\/([^/]+)$/, 'hero'],
  [/^\/sabiq-rektorlar\/([^/]+)$/, 'rector'],
];

type Kind = 'page' | 'unit' | 'program' | 'person' | 'facility' | 'hero' | 'rector';

const KIND_UID: Record<Kind, string> = {
  page: 'api::page.page',
  unit: 'api::unit.unit',
  program: 'api::program.program',
  person: 'api::person.person',
  facility: 'api::facility.facility',
  hero: 'api::hero.hero',
  rector: 'api::rector.rector',
};
const UID_KIND: Record<string, Kind> = Object.fromEntries(Object.entries(KIND_UID).map(([k, v]) => [v, k as Kind]));

/** Siyahı səhifələri: bölmənin məsulu həmin tipin BÜTÜN qeydlərini redaktə edir. */
const SECTIONS: [RegExp, string][] = [
  [/^\/xeberler$/, 'api::article.article'],
  [/^\/elanlar$/, 'api::announcement.announcement'],
  [/^\/tedbirler$/, 'api::event.event'],
  [/^\/heyet(?:\/[^/]+)?$/, 'api::person.person'],
  [/^\/rehberlik$/, 'api::person.person'],
  [/^\/tarix$/, 'api::milestone.milestone'],
  [/^\/sabiq-rektorlar$/, 'api::rector.rector'],
  [/^\/qehremanlarimiz$/, 'api::hero.hero'],
  [/^\/auditoriyalar$/, 'api::facility.facility'],
  [/^\/ixtisaslar$/, 'api::program.program'],
  // F5.41: /fakulteler siyahısı bölmələrdən qurulur, amma BURADA YOXDUR —
  // bütün bölmələrə icazə vermək olmaz; fakültə bölməsinin məsulu qeydin
  // öz yan panelindən (unit:<slug>) təyin olunur.
  [/^\/(?:struktur|kafedralar)$/, 'api::unit.unit'],
];

/** Menyu keçidini normallaşdır: dil prefiksi, sorğu, son «/» atılır. Xarici → null. */
export function normalizePath(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  let p = raw.trim();
  if (!p || p === '#' || p.startsWith('#')) return null;
  if (/^[a-z][a-z0-9+.-]*:/i.test(p)) return null; // https:, mailto:, tel:
  if (!p.startsWith('/')) return null;
  p = p.split('#')[0].split('?')[0];
  try {
    p = decodeURI(p);
  } catch {
    /* olduğu kimi */
  }
  p = p.replace(/\/{2,}/g, '/');
  if (p.length > 1) p = p.replace(/\/+$/, '');
  p = p.replace(/^\/(az|ru|en)(?=\/|$)/, '') || '/';
  return p.slice(0, 280);
}

export function ownerKey(rawPath: unknown): string | null {
  const p = normalizePath(rawPath);
  if (!p) return null;
  for (const [re, kind] of DETAIL) {
    const m = p.match(re);
    if (m) return `${kind}:${m[1].toLowerCase()}`;
  }
  return `path:${p}`;
}

function sectionUid(key: string): string | null {
  if (!key.startsWith('path:')) return null;
  const p = key.slice(5);
  for (const [re, uid] of SECTIONS) if (re.test(p)) return uid;
  return null;
}

function keyKind(key: string): { kind: Kind; slug: string } | null {
  const i = key.indexOf(':');
  const kind = key.slice(0, i) as Kind;
  if (!(kind in KIND_UID)) return null;
  return { kind, slug: key.slice(i + 1) };
}

// ── Menyu ────────────────────────────────────────────────────────────────────

export interface MenuPage {
  key: string;
  path: string;
  label: string;
  trail: string[];
}

const MENU_POPULATE = {
  esasMenyu: { populate: { groups: { populate: { links: true } } } },
  ustMenyu: { populate: { groups: { populate: { links: true } } } },
  eAkademiya: { populate: { cards: true } },
  istifadeciQruplari: true,
  suretliKecidler: true,
  footerMenyusu: { populate: { links: true } },
};

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

export async function loadMenuPages(strapi: Core.Strapi): Promise<MenuPage[]> {
  const docs = strapi.documents('api::menu.menu' as never) as unknown as { findFirst: (a: Row) => Promise<Row | null> };
  const menu = (await docs.findFirst({ locale: 'az', status: 'published', populate: MENU_POPULATE })) ?? {};
  const out: MenuPage[] = [];
  const seen = new Set<string>();
  const add = (url: unknown, label: unknown, trail: string[]) => {
    const path = normalizePath(url);
    const key = path ? ownerKey(path) : null;
    if (!path || !key || seen.has(key)) return;
    seen.add(key);
    out.push({ key, path, label: str(label) || path, trail: trail.filter(Boolean) });
  };
  const cats = (v: unknown, section: string) => {
    for (const cat of (Array.isArray(v) ? v : []) as Row[]) {
      const cl = str(cat.label);
      for (const g of (Array.isArray(cat.groups) ? cat.groups : []) as Row[]) {
        for (const l of (Array.isArray(g.links) ? g.links : []) as Row[]) add(l.url, l.label, [section === 'Əsas menyu' ? '' : section, cl, str(g.title)]);
      }
      // Başlığın öz keçidi qruplardan SONRA: eyni səhifə qrupda daha dəqiq adla
      // varsa o qalır (F5.40: «Təhsil» → /ixtisaslar = «Bütün ixtisaslar»).
      add(cat.url, cl, [section]);
    }
  };
  cats(menu.esasMenyu, 'Əsas menyu');
  cats(menu.ustMenyu, 'Üst menyu');
  for (const l of (Array.isArray(menu.istifadeciQruplari) ? menu.istifadeciQruplari : []) as Row[]) add(l.url, l.label, ['Bunlar üçün']);
  for (const l of (Array.isArray(menu.suretliKecidler) ? menu.suretliKecidler : []) as Row[]) add(l.url, l.label, ['Sürətli keçidlər']);
  const portal = (menu.eAkademiya ?? {}) as Row;
  for (const c of (Array.isArray(portal.cards) ? portal.cards : []) as Row[]) add(c.url, c.label, ['E-Akademiya']);
  for (const col of (Array.isArray(menu.footerMenyusu) ? menu.footerMenyusu : []) as Row[]) {
    for (const l of (Array.isArray(col.links) ? col.links : []) as Row[]) add(l.url, l.label, ['Footer', str(col.title)]);
  }
  return out;
}

// ── Məzmun vəziyyəti ─────────────────────────────────────────────────────────

/**
 * ready   — dərc olunub, əsas mətni var
 * empty   — dərc olunub, amma əsas mətni boşdur
 * draft   — yalnız qaralama var (dərc olunmayıb)
 * missing — qeyd yoxdur (hazırlanır səhifəsi və ya sınıq keçid)
 * section — siyahı səhifəsi (xəbərlər və s.), məzmunu qeydlərdən gəlir
 * static  — kodla qurulan səhifə, admindən redaktə olunmur
 */
export type PageStatus = 'ready' | 'empty' | 'draft' | 'missing' | 'section' | 'static';
export const NEEDS_CONTENT: PageStatus[] = ['missing', 'empty', 'draft'];

/** Hər növün «məzmun var» sayılması üçün baxılan sahələr (biri dolu olmalıdır). */
const CONTENT_FIELDS: Record<Kind, string[]> = {
  page: ['body'],
  unit: ['about', 'functions', 'services'],
  program: ['overview', 'description'],
  person: ['bio'],
  facility: ['description'],
  hero: ['biography'],
  rector: ['bio', 'summary'],
};
/** Qeydin adı hansı sahədədir. */
const TITLE_FIELD: Record<Kind, string> = {
  page: 'title', unit: 'name', program: 'title', person: 'name', facility: 'name', hero: 'name', rector: 'name',
};
const LOCALIZED: Record<Kind, boolean> = {
  page: true, unit: true, program: true, person: false, facility: false, hero: false, rector: true,
};

export interface RecordInfo {
  status: PageStatus;
  documentId?: string;
  title?: string;
}

const filled = (v: unknown): boolean => (typeof v === 'string' ? v.trim().length > 0 : v != null);

export async function recordInfo(strapi: Core.Strapi, keys: string[]): Promise<Map<string, RecordInfo>> {
  const out = new Map<string, RecordInfo>();
  const byKind = new Map<Kind, string[]>();
  for (const key of keys) {
    const kk = keyKind(key);
    if (kk) {
      byKind.set(kk.kind, [...(byKind.get(kk.kind) ?? []), kk.slug]);
      continue;
    }
    out.set(key, { status: sectionUid(key) ? 'section' : 'static' });
  }
  for (const [kind, slugs] of byKind) {
    const docs = strapi.documents(KIND_UID[kind] as never) as unknown as { findMany: (a: Row) => Promise<Row[]> };
    const titleField = TITLE_FIELD[kind];
    const fields = ['slug', titleField, ...CONTENT_FIELDS[kind]];
    const pub = new Map<string, Row>();
    const drf = new Map<string, Row>();
    for (let i = 0; i < slugs.length; i += 100) {
      const chunk = slugs.slice(i, i + 100);
      const base: Row = { filters: { slug: { $in: chunk } }, fields, limit: 100 };
      if (LOCALIZED[kind]) base.locale = 'az';
      for (const r of await docs.findMany({ ...base, status: 'published' })) pub.set(String(r.slug), r);
      for (const r of await docs.findMany({ ...base, status: 'draft' })) drf.set(String(r.slug), r);
    }
    for (const slug of slugs) {
      const key = `${kind}:${slug}`;
      const p = pub.get(slug);
      const d = drf.get(slug);
      const documentId = String((p ?? d)?.documentId ?? '') || undefined;
      const title = str((p ?? d)?.[titleField]) || undefined;
      if (p) out.set(key, { status: CONTENT_FIELDS[kind].some((f) => filled(p[f])) ? 'ready' : 'empty', documentId, title });
      else if (d) out.set(key, { status: 'draft', documentId, title });
      else out.set(key, { status: 'missing' });
    }
  }
  return out;
}

// ── Təyinatlar və admin istifadəçiləri ───────────────────────────────────────

export interface Assignment {
  id: number;
  key: string;
  path: string;
  label: string | null;
  editorId: number | null;
  assignedById: number | null;
  assignedAt: string | null;
  notifiedAt: string | null;
}

interface AdminUser {
  id: number;
  firstname: string | null;
  lastname: string | null;
  email: string;
  isActive: boolean;
  blocked: boolean;
  roles: { id: number; name: string; code: string }[];
}

const q = (strapi: Core.Strapi, uid: string) => strapi.db.query(uid as never) as unknown as {
  findMany: (a?: Row) => Promise<Row[]>;
  findOne: (a: Row) => Promise<Row | null>;
  create: (a: Row) => Promise<Row>;
  update: (a: Row) => Promise<Row>;
  delete: (a: Row) => Promise<Row>;
};

export async function allAssignments(strapi: Core.Strapi): Promise<Assignment[]> {
  return (await q(strapi, OWNER_UID).findMany({ orderBy: { key: 'asc' } })) as unknown as Assignment[];
}

export async function adminUsers(strapi: Core.Strapi): Promise<AdminUser[]> {
  const rows = await q(strapi, 'admin::user').findMany({
    select: ['id', 'firstname', 'lastname', 'email', 'isActive', 'blocked'],
    populate: { roles: { select: ['id', 'name', 'code'] } },
    orderBy: { firstname: 'asc' },
  });
  return rows as unknown as AdminUser[];
}

const fullName = (u: Pick<AdminUser, 'firstname' | 'lastname' | 'email'>): string =>
  [u.firstname, u.lastname].filter((x) => x && String(x).trim()).join(' ').trim() || u.email;

/** Admin e-poçtu ilə heyət qeydi (ad, vəzifə, profil). */
async function personsByEmail(strapi: Core.Strapi, emails: string[]): Promise<Map<string, Row>> {
  const out = new Map<string, Row>();
  const list = [...new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean))];
  if (!list.length) return out;
  const docs = strapi.documents('api::person.person' as never) as unknown as { findMany: (a: Row) => Promise<Row[]> };
  for (let i = 0; i < list.length; i += 40) {
    const chunk = list.slice(i, i + 40);
    const rows = await docs.findMany({
      status: 'published',
      filters: { $or: chunk.flatMap((e) => [{ email: { $eqi: e } }, { altEmail: { $eqi: e } }]) },
      fields: ['name', 'displayName', 'slug', 'position', 'positionRu', 'positionEn', 'email', 'altEmail'],
      limit: 200,
    });
    for (const r of rows) {
      for (const e of [str(r.email).toLowerCase(), str(r.altEmail).toLowerCase()]) if (e && !out.has(e)) out.set(e, r);
    }
  }
  return out;
}

// ── Keş ──────────────────────────────────────────────────────────────────────

const ownedCache = new Map<number, { at: number; keys: string[] }>();
let publicCache: { at: number; data: Row } | null = null;
const OWNED_TTL = 15_000;
const PUBLIC_TTL = 60_000;

function invalidate(): void {
  ownedCache.clear();
  publicCache = null;
}

async function ownedKeys(strapi: Core.Strapi, userId: number): Promise<string[]> {
  const hit = ownedCache.get(userId);
  if (hit && Date.now() - hit.at < OWNED_TTL) return hit.keys;
  const rows = await q(strapi, OWNER_UID).findMany({ where: { editorId: userId }, select: ['key'] });
  const keys = rows.map((r) => String(r.key));
  ownedCache.set(userId, { at: Date.now(), keys });
  return keys;
}

// ── İcazə şərti (RBAC) ───────────────────────────────────────────────────────

/**
 * «Məsul olduğu səhifələr» şərti. Strapi hər admin sorğusunda istifadəçinin
 * icazələrini qurur və şərtli icazə üçün bu funksiyanı çağırır
 * (arqument: istifadəçi + `permission`). Nəticə:
 *   true  — bölmənin (siyahı səhifəsinin) məsuludur: tipin bütün qeydləri;
 *   {slug: {$in: [...]}} — yalnız məsul olduğu qeydlər;
 *   false — heç biri.
 */
async function ownerCondition(strapi: Core.Strapi, arg: { id?: number; permission?: { subject?: string } }): Promise<boolean | Row> {
  const uid = arg?.permission?.subject;
  const userId = typeof arg?.id === 'number' ? arg.id : Number(arg?.id);
  if (!uid || !Number.isFinite(userId)) return false;
  const keys = await ownedKeys(strapi, userId);
  if (keys.some((k) => sectionUid(k) === uid)) return true;
  const kind = UID_KIND[uid];
  if (!kind) return false;
  const slugs = keys.filter((k) => k.startsWith(kind + ':')).map((k) => k.slice(kind.length + 1));
  return slugs.length ? { slug: { $in: slugs } } : false;
}

/** bootstrap()-da çağırılmalıdır (Strapi başqa vaxt şərt qeydiyyatına icazə vermir). */
export async function registerOwnerCondition(strapi: Core.Strapi): Promise<void> {
  const svc = strapi.service('admin::permission') as unknown as {
    conditionProvider: { register: (c: Row) => Promise<unknown>; has?: (id: string) => boolean };
  };
  await svc.conditionProvider.register({
    displayName: 'Məsul olduğu səhifələr (ADDA)',
    name: 'adda-page-owner',
    category: 'ADDA',
    handler: (arg: { id?: number; permission?: { subject?: string } }) => ownerCondition(strapi, arg),
  });
}

/** Redaktorun dəyişə biləcəyi tiplər (şərtlə). */
const EDITABLE = [
  'api::page.page', 'api::unit.unit', 'api::program.program', 'api::person.person',
  'api::facility.facility', 'api::hero.hero', 'api::rector.rector',
  'api::article.article', 'api::announcement.announcement', 'api::event.event', 'api::milestone.milestone',
];
/** Yeni qeyd yaratmaq/silmək — yalnız siyahı bölmələrində (səhifələr menyuya bağlıdır). */
const LISTS = [
  'api::article.article', 'api::announcement.announcement', 'api::event.event', 'api::milestone.milestone',
  'api::rector.rector', 'api::hero.hero', 'api::facility.facility', 'api::person.person',
];
/** Yalnız oxu (əlaqə seçiciləri üçün) — şərtsiz. */
const READ_ONLY = ['api::tag.tag', 'api::document.document'];

/**
 * «Məsul redaktor» rolu — BİR DƏFƏ yaradılır (core store `editorRole:v1`).
 * Sonra baş admin rolu Ayarlar → Rollar-da dəyişə bilər, üstündən yazılmır.
 */
export async function ensureEditorRole(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: 'editorRole:v1' })) === true) return;
  const roleSvc = strapi.service('admin::role') as unknown as {
    findOne: (w: Row) => Promise<Row | null>;
    create: (a: Row) => Promise<Row>;
    assignPermissions: (id: unknown, p: Row[]) => Promise<unknown>;
  };
  if (!(await roleSvc.findOne({ code: EDITOR_ROLE_CODE }))) {
    const { actionProvider } = strapi.service('admin::permission') as unknown as { actionProvider: { values: () => Row[] } };
    const ctActions = actionProvider.values().filter((a) => a.section === 'contentTypes');
    const ctSvc = strapi.service('admin::content-type') as unknown as {
      getPermissionsWithNestedFields: (actions: Row[], o: Row) => { action: string; subject: string; properties: Row }[];
    };
    const base = ctSvc.getPermissionsWithNestedFields(ctActions, { restrictedSubjects: ['plugin::users-permissions.user'] });
    const localeCodes = ((await (strapi.plugin('i18n').service('locales') as unknown as { find: () => Promise<Row[]> }).find()) ?? [])
      .map((l) => String(l.code));
    const i18nTypes = strapi.plugin('i18n').service('content-types') as unknown as { isLocalizedContentType: (m: unknown) => boolean };
    const act = (a: string) => a.replace('plugin::content-manager.explorer.', '');
    const perms: Row[] = [];
    for (const p of base) {
      const a = act(p.action);
      const editable = EDITABLE.includes(p.subject);
      let conditions: string[] | null = null;
      if (a === 'read' && (editable || READ_ONLY.includes(p.subject))) conditions = [];
      else if ((a === 'update' || a === 'publish') && editable) conditions = [OWNER_CONDITION];
      else if ((a === 'create' || a === 'delete') && LISTS.includes(p.subject)) conditions = [OWNER_CONDITION];
      if (!conditions) continue;
      const properties: Row = { ...p.properties };
      if (i18nTypes.isLocalizedContentType(strapi.contentTypes[p.subject as keyof typeof strapi.contentTypes])) properties.locales = localeCodes;
      perms.push({ action: p.action, subject: p.subject, properties, conditions });
    }
    for (const action of ['plugin::upload.read', 'plugin::upload.assets.create', 'plugin::upload.assets.update', 'plugin::upload.assets.download', 'plugin::upload.assets.copy-link']) {
      perms.push({ action, subject: null, properties: {}, conditions: [] });
    }
    const role = await roleSvc.create({
      name: 'Məsul redaktor',
      code: EDITOR_ROLE_CODE,
      description: 'Yalnız özünə təyin olunmuş səhifələrin məzmununu dəyişir (F5.39). Təyinat: «Məsul redaktorlar» səhifəsi.',
    });
    await roleSvc.assignPermissions(role.id, perms);
    strapi.log.info(`[adda-owners] «Məsul redaktor» rolu yaradıldı (${perms.length} icazə).`);
  }
  await store.set({ key: 'editorRole:v1', value: true });
}

// ── Məktublar ────────────────────────────────────────────────────────────────

const STATUS_TEXT: Record<PageStatus, string> = {
  ready: 'Məzmun var',
  empty: 'Mətn boşdur',
  draft: 'Qaralama — dərc olunmayıb',
  missing: 'Səhifə hələ yaradılmayıb',
  section: 'Siyahı bölməsi',
  static: 'Sabit səhifə',
};

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const publicUrl = (path: string): string => `${SITE_URL}/az${path === '/' ? '' : path}`;
const openUrl = (key: string): string => `${ADMIN_URL}/mesul-redaktorlar/ac?key=${encodeURIComponent(key)}`;
const MY_PAGES_URL = `${ADMIN_URL}/mesul-redaktorlar`;

interface MailPage {
  key: string;
  path: string;
  label: string;
  status: PageStatus;
}

function button(href: string, text: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="display:inline-table;margin:4px 8px 4px 0"><tr><td style="background:#0B3D5C;border-radius:6px"><a href="${esc(href)}" style="display:inline-block;padding:9px 16px;color:#ffffff;text-decoration:none;font:600 14px Arial,sans-serif">${esc(text)}</a></td></tr></table>`;
}

function pageBlock(pg: MailPage): { html: string; text: string } {
  const action = pg.status === 'missing' ? 'Məzmun əlavə et' : 'Admində aç';
  const canOpen = pg.status !== 'static';
  return {
    html:
      `<div style="border:1px solid #e3e8ee;border-radius:8px;padding:14px 16px;margin:0 0 12px">` +
      `<div style="font:600 16px Arial,sans-serif;color:#0B3D5C">${esc(pg.label)}</div>` +
      `<div style="font:13px Arial,sans-serif;color:#5b6b7b;margin:2px 0 10px">${esc(pg.path)} · ${esc(STATUS_TEXT[pg.status])}</div>` +
      (canOpen ? button(openUrl(pg.key), action) : '') +
      `<a href="${esc(publicUrl(pg.path))}" style="font:14px Arial,sans-serif;color:#0B3D5C">Saytda bax</a>` +
      `</div>`,
    text: `- ${pg.label} (${pg.path}) — ${STATUS_TEXT[pg.status]}\n  Saytda: ${publicUrl(pg.path)}${canOpen ? `\n  ${action}: ${openUrl(pg.key)}` : ''}`,
  };
}

function wrap(title: string, intro: string, body: string): string {
  return (
    `<!doctype html><html lang="az"><body style="margin:0;background:#f4f6f8">` +
    `<div style="max-width:600px;margin:0 auto;padding:24px 16px">` +
    `<div style="background:#0B3D5C;color:#fff;padding:16px 20px;border-radius:8px 8px 0 0;font:700 18px Georgia,serif">ADDA saytı — məsul redaktor</div>` +
    `<div style="background:#fff;padding:20px;border-radius:0 0 8px 8px;border-top:3px solid #C9A961">` +
    `<h1 style="font:700 19px Georgia,serif;color:#0B3D5C;margin:0 0 10px">${esc(title)}</h1>` +
    `<p style="font:15px/1.55 Arial,sans-serif;color:#1d2733;margin:0 0 16px">${intro}</p>` +
    body +
    `<p style="font:13px/1.5 Arial,sans-serif;color:#5b6b7b;margin:18px 0 0">Bütün səhifələriniz: <a href="${esc(MY_PAGES_URL)}" style="color:#0B3D5C">${esc(MY_PAGES_URL)}</a><br>` +
    `Admin panelə korporativ e-poçtunuz və parolunuzla daxil olun.</p>` +
    `</div></div></body></html>`
  );
}

async function sendAssignmentMail(strapi: Core.Strapi, editor: AdminUser, pg: MailPage): Promise<void> {
  const name = editor.firstname?.trim() || fullName(editor);
  const block = pageBlock(pg);
  const intro = `Hörmətli ${esc(name)}, baş admin sizi saytın aşağıdakı səhifəsinin məzmununa <b>məsul redaktor</b> təyin etdi. Səhifənin məzmununu siz əlavə edir və yeniləyirsiniz; adınız səhifənin altında göstərilir.`;
  const r = await deliver({
    to: editor.email,
    subject: `ADDA saytı: «${pg.label}» səhifəsinə məsul təyin edildiniz`,
    html: wrap('Yeni səhifə təyin olundu', intro, block.html),
    text: `Hörmətli ${name},\n\nBaş admin sizi saytın «${pg.label}» səhifəsinin məzmununa məsul redaktor təyin etdi.\n\n${block.text}\n\nBütün səhifələriniz: ${MY_PAGES_URL}\n`,
  });
  strapi.log.info(`[adda-owners] təyinat məktubu (${r.status}/${r.via}): ${pg.key} → istifadəçi #${editor.id}`);
}

/** Bir redaktora məzmun gözləyən səhifələrinin siyahısı. Göndərilən səhifə sayını qaytarır. */
async function sendDigestTo(strapi: Core.Strapi, editor: AdminUser, pages: MailPage[]): Promise<number> {
  const todo = pages.filter((p) => NEEDS_CONTENT.includes(p.status));
  if (!todo.length) return 0;
  const name = editor.firstname?.trim() || fullName(editor);
  const blocks = todo.map(pageBlock);
  const r = await deliver({
    to: editor.email,
    subject: `ADDA saytı: məzmun gözləyən ${todo.length} səhifəniz var`,
    html: wrap(
      `Məzmun gözləyən səhifələr: ${todo.length}`,
      `Hörmətli ${esc(name)}, məsul olduğunuz aşağıdakı səhifələrdə məzmun hələ yoxdur və ya dərc olunmayıb.`,
      blocks.map((b) => b.html).join(''),
    ),
    text: `Hörmətli ${name},\n\nMəsul olduğunuz bu səhifələr məzmun gözləyir:\n\n${blocks.map((b) => b.text).join('\n\n')}\n\nBütün səhifələriniz: ${MY_PAGES_URL}\n`,
  });
  strapi.log.info(`[adda-owners] xatırlatma (${r.status}/${r.via}): istifadəçi #${editor.id}, ${todo.length} səhifə`);
  return r.status === 'sent' || r.status === 'unconfigured' ? todo.length : 0;
}

/** Bütün (və ya bir) redaktora xatırlatma. */
export async function sendDigests(strapi: Core.Strapi, onlyEditorId?: number): Promise<{ editors: number; pages: number }> {
  const [assignments, users] = await Promise.all([allAssignments(strapi), adminUsers(strapi)]);
  const active = assignments.filter((a) => a.editorId != null && (onlyEditorId === undefined || a.editorId === onlyEditorId));
  const info = await recordInfo(strapi, active.map((a) => a.key));
  const userById = new Map(users.map((u) => [u.id, u]));
  const byEditor = new Map<number, MailPage[]>();
  for (const a of active) {
    const s = info.get(a.key)?.status ?? 'static';
    byEditor.set(a.editorId as number, [...(byEditor.get(a.editorId as number) ?? []), { key: a.key, path: a.path, label: a.label || a.path, status: s }]);
  }
  let editors = 0;
  let pages = 0;
  for (const [editorId, list] of byEditor) {
    const u = userById.get(editorId);
    if (!u || !u.isActive || u.blocked || !u.email) continue;
    const n = await sendDigestTo(strapi, u, list);
    if (n) {
      editors++;
      pages += n;
      const now = new Date().toISOString();
      for (const a of active.filter((x) => x.editorId === editorId)) await q(strapi, OWNER_UID).update({ where: { id: a.id }, data: { notifiedAt: now } });
    }
  }
  return { editors, pages };
}

/** Həftəlik xatırlatma: bazar ertəsi 09:00 (Bakı). Eyni həftədə ikinci dəfə göndərmir. */
export function scheduleWeeklyDigest(strapi: Core.Strapi): void {
  const cron = (strapi as unknown as { cron: { add: (t: Row) => unknown } }).cron;
  cron.add({
    addaOwnerDigest: {
      options: { rule: '0 9 * * 1', tz: 'Asia/Baku' },
      task: async () => {
        const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
        const d = new Date();
        const week = `${d.getUTCFullYear()}-${Math.floor((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - Date.UTC(d.getUTCFullYear(), 0, 1)) / 604800000)}`;
        if ((await store.get({ key: 'ownerDigest:week' })) === week) return;
        await store.set({ key: 'ownerDigest:week', value: week });
        const r = await sendDigests(strapi);
        strapi.log.info(`[adda-owners] həftəlik xatırlatma: ${r.editors} redaktor, ${r.pages} səhifə.`);
      },
    },
  });
}

// ── API ──────────────────────────────────────────────────────────────────────

interface Ctx {
  query: Record<string, unknown>;
  request: { body?: unknown };
  state: { user?: { id?: number; roles?: { code?: string }[] } };
  body: unknown;
  status: number;
  set?: (k: string, v: string) => void;
}

const bodyOf = (ctx: Ctx): Row => {
  const b = ctx.request.body;
  return b && typeof b === 'object' && !Array.isArray(b) ? (b as Row) : {};
};
const fail = (ctx: Ctx, status: number, error: string) => {
  ctx.status = status;
  ctx.body = { ok: false, error };
};
const isSuper = (strapi: Core.Strapi, user: Ctx['state']['user']): boolean => {
  try {
    return (strapi.service('admin::role') as unknown as { hasSuperAdminRole: (u: unknown) => boolean }).hasSuperAdminRole(user);
  } catch {
    return Boolean(user?.roles?.some((r) => r.code === 'strapi-super-admin'));
  }
};

/**
 * Bu istifadəçi qeydi dəyişə bilərmi? Content Manager-in öz yoxlaması ilə
 * (rolların hamısı + şərtlər: məsul redaktor, «yaradan» və s.). Admin
 * interfeysi şərtli icazədə sahələri açıq göstərir, server isə yadda
 * saxlamağı rədd edir — yan panel bunu əvvəlcədən deyir.
 */
async function canUpdateRecord(strapi: Core.Strapi, ctx: Ctx, uid: string, documentId: string, localized: boolean): Promise<boolean> {
  const userAbility = (ctx.state as { userAbility?: unknown }).userAbility;
  if (!userAbility) return false;
  try {
    const cm = strapi.plugin('content-manager');
    const pc = (cm.service('permission-checker') as unknown as {
      create: (a: Row) => {
        cannot: { update: (e?: unknown) => boolean };
        can: { update: (e?: unknown) => boolean };
        sanitizedQuery: { update: (q: Row) => Promise<Row> };
      };
    }).create({ userAbility, model: uid });
    if (pc.cannot.update()) return false;
    const permissionQuery = await pc.sanitizedQuery.update({});
    const builder = cm.service('populate-builder') as unknown as (m: string) => { populateFromQuery: (q: Row) => { build: () => Promise<unknown> } };
    const populate = await builder(uid).populateFromQuery(permissionQuery).build();
    const docs = strapi.documents(uid as never) as unknown as { findOne: (x: Row) => Promise<Row | null> };
    const entity = await docs.findOne({ documentId, ...(localized ? { locale: 'az' } : {}), populate });
    return Boolean(entity && pc.can.update(entity));
  } catch (e) {
    strapi.log.warn('[adda-owners] icazə yoxlaması: ' + (e as Error).message);
    return false;
  }
}

/** Admin redaktə səhifəsi (react-router yolu) — qeyd növünə görə. */
function editTarget(key: string, info: RecordInfo | undefined): Row | null {
  const kk = keyKind(key);
  if (kk && info?.documentId) {
    return { uid: KIND_UID[kk.kind], documentId: info.documentId, locale: LOCALIZED[kk.kind] ? 'az' : null };
  }
  const sec = sectionUid(key);
  if (sec) return { uid: sec, list: true };
  return null;
}

export function registerPageOwners(strapi: Core.Strapi): void {
  // GET /pages — baş admin: bütün menyu səhifələri; redaktor: yalnız özününkülər.
  const pages = async (ctx: Ctx) => {
    const user = ctx.state.user;
    const sup = isSuper(strapi, user);
    const [menu, assignments, users] = await Promise.all([loadMenuPages(strapi), allAssignments(strapi), sup ? adminUsers(strapi) : Promise.resolve([] as AdminUser[])]);
    const byKey = new Map(assignments.map((a) => [a.key, a]));
    // Menyuda olmayan, amma təyin olunmuş səhifələr də görünsün (məs. menyudan çıxarılıb).
    const list: MenuPage[] = [...menu];
    for (const a of assignments) if (!menu.some((m) => m.key === a.key)) list.push({ key: a.key, path: a.path, label: a.label || a.path, trail: ['Menyuda yoxdur'] });
    const mine = sup ? list : list.filter((p) => byKey.get(p.key)?.editorId === user?.id);
    const info = await recordInfo(strapi, mine.map((p) => p.key));
    const userById = new Map(users.map((u) => [u.id, u]));
    let ownerNames = userById;
    if (!sup) {
      const self = (await adminUsers(strapi)).filter((u) => u.id === user?.id);
      ownerNames = new Map(self.map((u) => [u.id, u]));
    }
    ctx.body = {
      ok: true,
      isSuperAdmin: sup,
      pages: mine.map((p) => {
        const a = byKey.get(p.key);
        const i = info.get(p.key);
        const owner = a?.editorId != null ? ownerNames.get(a.editorId) : undefined;
        return {
          ...p,
          status: i?.status ?? 'static',
          title: i?.title ?? null,
          editTarget: editTarget(p.key, i),
          editorId: a?.editorId ?? null,
          editorName: owner ? fullName(owner) : a?.editorId != null ? `#${a.editorId}` : null,
          assignedAt: a?.assignedAt ?? null,
          notifiedAt: a?.notifiedAt ?? null,
        };
      }),
      editors: sup
        ? users
            .filter((u) => u.isActive && !u.blocked)
            .map((u) => ({ id: u.id, name: fullName(u), email: u.email, roles: u.roles.map((r) => r.name), isEditor: u.roles.some((r) => r.code === EDITOR_ROLE_CODE) }))
        : [],
    };
  };

  // PUT /assign {path, label, editorId|null} — yalnız baş admin.
  const assign = async (ctx: Ctx) => {
    const user = ctx.state.user;
    if (!isSuper(strapi, user)) return fail(ctx, 403, 'super_admin_only');
    const b = bodyOf(ctx);
    const path = normalizePath(b.path);
    const key = path ? ownerKey(path) : null;
    if (!path || !key) return fail(ctx, 400, 'bad_path');
    const label = str(b.label).slice(0, 200) || path;
    const editorId = b.editorId === null || b.editorId === '' || b.editorId === undefined ? null : Number(b.editorId);
    let editor: AdminUser | undefined;
    if (editorId !== null) {
      if (!Number.isInteger(editorId)) return fail(ctx, 400, 'bad_editor');
      editor = (await adminUsers(strapi)).find((u) => u.id === editorId);
      if (!editor || !editor.isActive || editor.blocked) return fail(ctx, 400, 'editor_inactive');
    }
    const repo = q(strapi, OWNER_UID);
    const existing = await repo.findOne({ where: { key } });
    const changed = (existing?.editorId ?? null) !== editorId;
    const data: Row = { key, path, label, editorId, ...(changed ? { assignedById: user?.id ?? null, assignedAt: new Date().toISOString(), notifiedAt: null } : {}) };
    const row = existing ? await repo.update({ where: { id: existing.id }, data }) : await repo.create({ data });
    invalidate();
    strapi.log.info(`[adda-owners] ${key}: məsul ${existing?.editorId ?? '—'} → ${editorId ?? '—'} (admin #${user?.id})`);
    if (changed && editor) {
      const info = await recordInfo(strapi, [key]);
      void sendAssignmentMail(strapi, editor, { key, path, label, status: info.get(key)?.status ?? 'static' })
        .then(() => q(strapi, OWNER_UID).update({ where: { id: row.id }, data: { notifiedAt: new Date().toISOString() } }))
        .catch((e: Error) => strapi.log.error('[adda-owners] məktub: ' + e.message));
    }
    ctx.body = { ok: true, key, editorId, changed };
  };

  // POST /notify {editorId?} — yalnız baş admin: xatırlatmanı indi göndər.
  const notify = async (ctx: Ctx) => {
    if (!isSuper(strapi, ctx.state.user)) return fail(ctx, 403, 'super_admin_only');
    const b = bodyOf(ctx);
    const only = b.editorId === undefined || b.editorId === null ? undefined : Number(b.editorId);
    const r = await sendDigests(strapi, Number.isInteger(only) ? only : undefined);
    ctx.body = { ok: true, ...r };
  };

  // POST /open {key} — redaktə səhifəsini aç; hazırlanır səhifəsi üçün qaralama yarat.
  const open = async (ctx: Ctx) => {
    const user = ctx.state.user;
    const key = str(bodyOf(ctx).key);
    if (!key) return fail(ctx, 400, 'bad_key');
    const sup = isSuper(strapi, user);
    const a = await q(strapi, OWNER_UID).findOne({ where: { key } });
    if (!sup && (!a || a.editorId !== user?.id)) return fail(ctx, 403, 'not_owner');
    let info = (await recordInfo(strapi, [key])).get(key);
    const kk = keyKind(key);
    if (kk && kk.kind === 'page' && info?.status === 'missing') {
      const label = str(a?.label) || kk.slug;
      const docs = strapi.documents('api::page.page' as never) as unknown as { create: (x: Row) => Promise<Row> };
      const created = await docs.create({ locale: 'az', data: { title: label, slug: kk.slug } });
      strapi.log.info(`[adda-owners] qaralama səhifə yaradıldı: ${kk.slug} (admin #${user?.id})`);
      info = { status: 'draft', documentId: String(created.documentId), title: label };
    }
    const target = editTarget(key, info);
    if (!target) return fail(ctx, 404, kk ? 'record_missing' : 'not_editable');
    ctx.body = { ok: true, ...target };
  };

  // GET /for-record?uid=&documentId= — yan panel: bu qeydin açarları və məsulu.
  const forRecord = async (ctx: Ctx) => {
    const uid = str(ctx.query.uid);
    const documentId = str(ctx.query.documentId);
    const kind = UID_KIND[uid];
    if (!kind || !documentId) return fail(ctx, 400, 'bad_record');
    const docs = strapi.documents(uid as never) as unknown as { findOne: (x: Row) => Promise<Row | null> };
    const rec = await docs.findOne({ documentId, ...(LOCALIZED[kind] ? { locale: 'az' } : {}), fields: ['slug'] });
    const slug = str(rec?.slug);
    if (!slug) return (ctx.body = { ok: true, key: null });
    const key = `${kind}:${slug.toLowerCase()}`;
    const a = await q(strapi, OWNER_UID).findOne({ where: { key } });
    const sup = isSuper(strapi, ctx.state.user);
    const users = await adminUsers(strapi);
    const owner = a?.editorId != null ? users.find((u) => u.id === a.editorId) : undefined;
    const defaultPath = kind === 'page' ? `/sehife/${slug}` : kind === 'unit' ? `/struktur/${slug}` : kind === 'program' ? `/ixtisaslar/${slug}` : kind === 'person' ? `/emekdas/${slug}` : kind === 'facility' ? `/auditoriyalar/${slug}` : kind === 'hero' ? `/qehremanlarimiz/${slug}` : `/sabiq-rektorlar/${slug}`;
    ctx.body = {
      ok: true,
      key,
      path: str(a?.path) || defaultPath,
      label: str(a?.label) || null,
      editorId: a?.editorId ?? null,
      editorName: owner ? fullName(owner) : null,
      isSuperAdmin: sup,
      canEdit: sup || (await canUpdateRecord(strapi, ctx, uid, documentId, LOCALIZED[kind])),
      editors: sup ? users.filter((u) => u.isActive && !u.blocked).map((u) => ({ id: u.id, name: fullName(u), email: u.email, isEditor: u.roles.some((r) => r.code === EDITOR_ROLE_CODE) })) : [],
    };
  };

  const auth = { policies: ['admin::isAuthenticatedAdmin'] };
  strapi.server.routes({
    type: 'admin',
    prefix: '/adda-owners',
    routes: [
      { method: 'GET', path: '/pages', handler: pages, config: auth },
      { method: 'PUT', path: '/assign', handler: assign, config: auth },
      { method: 'POST', path: '/notify', handler: notify, config: auth },
      { method: 'POST', path: '/open', handler: open, config: auth },
      { method: 'GET', path: '/for-record', handler: forRecord, config: auth },
    ],
  } as unknown as Parameters<typeof strapi.server.routes>[0]);

  // İctimai: açar → {ad, vəzifə, profil}. E-poçt QAYTARILMIR.
  const publicMap = async (ctx: Ctx) => {
    if (!publicCache || Date.now() - publicCache.at > PUBLIC_TTL) {
      const [assignments, users] = await Promise.all([allAssignments(strapi), adminUsers(strapi)]);
      const userById = new Map(users.map((u) => [u.id, u]));
      const live = assignments.filter((a) => {
        const u = a.editorId != null ? userById.get(a.editorId) : undefined;
        return u && u.isActive && !u.blocked;
      });
      const persons = await personsByEmail(strapi, live.map((a) => userById.get(a.editorId as number)?.email ?? ''));
      const owners: Row = {};
      for (const a of live) {
        const u = userById.get(a.editorId as number) as AdminUser;
        const p = persons.get(u.email.trim().toLowerCase());
        // «Ad Soyad»: heyət qeydinin «Görünən ad»-ı, yoxdursa admin istifadəçinin
        // adı və soyadı (heyət adı «Soyad Ad Ata adı» formasındadır — sonuncu ehtiyat).
        const adminName = fullName({ firstname: u.firstname, lastname: u.lastname, email: '' });
        owners[a.key] = {
          name: (p ? str(p.displayName) : '') || adminName || (p ? str(p.name) : '') || 'ADDA',
          position: p ? str(p.position) || null : null,
          positionRu: p ? str(p.positionRu) || null : null,
          positionEn: p ? str(p.positionEn) || null : null,
          personSlug: p ? str(p.slug) || null : null,
        };
      }
      publicCache = { at: Date.now(), data: { ok: true, owners } };
    }
    ctx.set?.('Cache-Control', 'public, max-age=60');
    ctx.body = publicCache.data;
  };
  strapi.server.routes({
    type: 'content-api',
    prefix: '/adda-owners',
    routes: [{ method: 'GET', path: '/public', handler: publicMap, config: { auth: false } }],
  } as unknown as Parameters<typeof strapi.server.routes>[0]);
}
