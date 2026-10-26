/**
 * F5.58 — əməkdaş qeydləri: təkrarlar, oxunmaz ünvanlar, yeni təkrarın qarşısı.
 *
 * Zaur müəllim, 26.10.2026: «eyni ad iki dəfə sistemdə əks olunur» — admində
 * «Süleymanov Əsədullah Mahmud oğlu» iki qeyd (inzibati + akademik). Prod-da 22
 * ad 49 qeyddə idi: kafedra və laboratoriya siyahıları admində doldurulanda
 * mövcud əməkdaş YENİ qeyd kimi yaradılıb (bölmə səhifəsində iki dəfə görünür,
 * «Dosent» iki-üç dəfə yazılır). Ünvanları da Strapi-nin öz slugify-ı ilə
 * yaranıb — «ə» atılır, «ü» → «ue»: «m-mm-dov-nadir-s-rif-oglu», «person-2».
 *
 * 1. Birləşdirmə (`personMerge:v1`, BİR DƏFƏ): ad açarı (kiçik hərf, ə→e …,
 *    boşluqlar, bitişik «oğlu/qızı») eyni olan qeydlər bir qeyddə birləşir.
 *    Əsas qeyd: dərc olunmuş > sahibi profilini yeniləyib > bölmə rəhbəri >
 *    e-poçt > foto > vəzifə sayı > bölmə > oxunan ünvan > köhnə. Digərlərinin
 *    vəzifəsi «Vəzifələr»-ə əlavə olunur (eyni vəzifə təkrarlanmır: «Tədris
 *    müəssisəsində böyük laborant» = «Böyük laborant»; bölməsiz vəzifə eyni
 *    vəzifə bölmə ilə varsa düşür; həmin bölmədə vəzifəsi artıq varsa əlavə
 *    olunmur), boş sahələr (bölmə, e-poçt → əlavə e-poçt, foto, tərcümeyi-hal,
 *    dərəcə…) doldurulur, auditoriya/bölmə/xəbər əlaqələri əsas qeydə keçir,
 *    təkrar qeyd SİLİNİR (məlumatı store `personMerge:backup`-da qalır), köhnə
 *    ünvan → yeni (store `personRedirects`, sayt 301 edir). Əsas qeydin
 *    dərc olunmamış redaktəsi varsa qrupa toxunulmur (logda).
 * 2. Ünvanlar (`personSlugs:v1`, BİR DƏFƏ): «person-N» və Strapi-nin oxunmaz
 *    ünvanı → addan Azərbaycan hərfləri ilə («memmedov-nadir-serif-oglu»);
 *    adın artıq boşluqları təmizlənir. Birbaşa bazada, hər sətir öz `updatedAt`-ı
 *    ilə (redaktə tarixi dəyişmir); məsul redaktor açarı, `personSlug` (profil
 *    tarixçəsi, şəxsi məlumat) yeni ünvana.
 * 3. Qoruyucu (register, `registerPersonGuard`): admində/API-də mövcud adla yeni
 *    əməkdaş yaratmaq və ya surətini çıxarmaq, adı başqasınınkına dəyişmək
 *    rədd edilir — əlavə vəzifə mövcud qeydə yazılır; boş, «person-N» və oxunmaz
 *    ünvan addan düzəlir. Miqrasiya və seed-lər (sorğu konteksti yoxdur) toxunulmur.
 * 4. Admində ünvan yaradılması (bootstrap, `patchUidTransliteration`): hər tipin
 *    «Ünvan» düyməsi Azərbaycan hərflərini latına çevirib slugify edir.
 */
import type { Core } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { moveOwner } from './dedupe';
import { markSearchDirty } from './search-index';
import { requestSiteRevalidate } from './site-revalidate';

type Row = Record<string, unknown>;

const PERSON = 'api::person.person';
const TAG = '[heyet] F5.58';
const STORE = { type: 'plugin', name: 'adda-admin' } as const;
const MERGE_MARKER = 'personMerge:v1';
const SLUG_MARKER = 'personSlugs:v1';
const BACKUP_KEY = 'personMerge:backup';
export const REDIRECTS_KEY = 'personRedirects';

const str = (v: unknown): string => (typeof v === 'string' ? v : v == null ? '' : String(v));
const time = (v: unknown): number => {
  const t = Date.parse(str(v));
  return Number.isFinite(t) ? t : 0;
};

// ── Saf köməkçilər (sınaq üçün ixrac) ────────────────────────────────────────

const FOLD: Record<string, string> = { ə: 'e', ı: 'i', ö: 'o', ü: 'u', ş: 's', ç: 'c', ğ: 'g' };

export function azFold(s: string): string {
  const low = str(s).replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
  let out = '';
  for (const ch of low) out += FOLD[ch] ?? ch;
  return out.normalize('NFKD').replace(/[̀-ͯ]/g, '');
}

/** Ad açarı: «Süleymanov  Əsədullah Mahmudoğlu » → «suleymanov esedullah mahmud oglu». */
export function nameKey(name: string): string {
  return azFold(name)
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/([a-z]{2,})(oglu|qizi)(?![a-z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Addan ünvan, Azərbaycan hərfləri ilə: «Məmmədov Nadir» → «memmedov-nadir». */
export function azSlug(s: string): string {
  return azFold(s)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
    .replace(/-+$/g, '');
}

/**
 * Strapi admininin (`@sindresorhus/slugify` 1.x) addan verdiyi ünvan: «ə» ayırıcı
 * olur, «ü/ö» → «ue/oe»: «Məmmədov Nadir Şərif oğlu» → «m-mm-dov-nadir-s-rif-oglu».
 */
export function cmSlug(name: string): string {
  const s = str(name)
    .replace(/[Əə]/g, '-')
    .replace(/Ü/g, 'Ue')
    .replace(/ü/g, 'ue')
    .replace(/Ö/g, 'Oe')
    .replace(/ö/g, 'oe')
    .replace(/[Şş]/g, 's')
    .replace(/[Çç]/g, 'c')
    .replace(/[Ğğ]/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'I');
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const esc = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const withSuffix = (slug: string, base: string): boolean => slug === base || new RegExp(`^${esc(base)}-\\d+$`).test(slug);

/**
 * Düzəldilməli ünvan: «person», «person-N» və ya Strapi admininin oxunmaz ünvanı
 * (önündə siyahı nömrəsi də ola bilər: «9-abdullayev-…»). Əl ilə qoyulmuş başqa
 * ünvana toxunulmur.
 */
export function isBrokenSlug(slug: string, name: string): boolean {
  const s = str(slug).trim();
  if (/^person(-\d+)?$/.test(s)) return Boolean(azSlug(name));
  const az = azSlug(name);
  if (!az || withSuffix(s, az)) return false;
  const cm = cmSlug(name);
  if (!cm || cm === az) return false;
  return withSuffix(s.replace(/^\d+-/, ''), cm);
}

/** Vəzifə açarı: «Tədris müəssisəsində böyük laborant» = «Böyük laborant». */
export function positionKey(pos: string): string {
  return azFold(pos)
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/^tedris muessi\w*\s+/, '')
    .replace(/\s+/g, ' ');
}

export interface Role {
  staffType: string;
  position: string;
  unitName: string | null;
  sortOrder?: number;
}

const roleKey = (r: Role): string => positionKey(r.position);
const unitKey = (u: string | null | undefined): string => (u ? nameKey(u) : '');

/** Əsas qeydin vəzifələrinə təkrarlarınkını əlavə et (bax faylın başı, 1). */
export function mergeRoles(base: Role[], candidates: Role[], notes: string[] = [], who = ''): Role[] {
  const norm = (r: Role): Role => ({
    staffType: r.staffType || 'diger',
    position: str(r.position).trim(),
    unitName: str(r.unitName).trim() || null,
  });
  const list = base.map(norm).filter((r) => r.position);
  for (const c of candidates.map(norm)) {
    if (!c.position) continue;
    const k = roleKey(c);
    const u = unitKey(c.unitName);
    if (list.some((r) => roleKey(r) === k && (unitKey(r.unitName) === u || !u))) continue;
    const bare = list.find((r) => roleKey(r) === k && !r.unitName);
    if (bare && u) {
      bare.unitName = c.unitName;
      continue;
    }
    if (u && list.some((r) => unitKey(r.unitName) === u)) {
      notes.push(`${who}: «${c.position}» (${c.unitName}) — bu bölmədə vəzifəsi var, əlavə olunmadı`);
      continue;
    }
    list.push(c);
  }
  // Bölməsiz təkrar: eyni vəzifə bölmə ilə də yazılıbsa.
  const out = list.filter((r) => r.unitName || !list.some((o) => o !== r && o.unitName && roleKey(o) === roleKey(r)));
  // Ziddiyyət: eyni növdə bölməsiz bir vəzifə, bölmə ilə başqası (məs. «Baş müəllim» ↔
  // «Dosent, Tətbiqi mexanika kafedrası») — hər ikisi qalır, admində yoxlanılmalıdır.
  for (const r of out) {
    if (r.unitName) continue;
    const o = out.find((x) => x.unitName && x.staffType === r.staffType && roleKey(x) !== roleKey(r));
    if (o && candidates.length) notes.push(`${who}: «${r.position}» (bölməsiz) və «${o.position}» (${o.unitName}) — hansı doğrudur, admində yoxlayın`);
  }
  return out;
}

export interface PersonDoc {
  documentId: string;
  firstId: number;
  name: string;
  slug: string;
  published: boolean;
  pending: boolean;
  data: Row;
  roles: Role[];
  unitDocId: string | null;
  unitName: string | null;
  headOf: number;
  photoId: number | null;
}

/** Əsas qeydin seçilməsi (böyük bal qazanır, bərabərlikdə köhnə qeyd). */
export function personScore(p: PersonDoc): number {
  let s = 0;
  if (p.published) s += 1000;
  if (p.data.profileUpdatedAt) s += 500;
  if (p.headOf) s += 200;
  if (str(p.data.email).trim()) s += 100;
  if (p.photoId) s += 50;
  s += Math.min(p.roles.length, 5) * 10;
  if (p.unitDocId) s += 5;
  if (!isBrokenSlug(p.slug, p.name)) s += 3;
  return s;
}

export function orderGroup(group: PersonDoc[]): PersonDoc[] {
  return [...group].sort((a, b) => personScore(b) - personScore(a) || a.firstId - b.firstId);
}

/** Yönləndirmələrə əlavə: köhnə → yeni, zəncir (a→b, b→c) birbaşa a→c olur. */
export function addRedirect(map: Record<string, string>, from: string, to: string): Record<string, string> {
  if (!from || !to || from === to) return map;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(map)) {
    if (k === to) continue; // yeni ünvan yenidən istifadə olunur
    out[k] = v === from ? to : v;
  }
  out[from] = to;
  return out;
}

// ── Baza ─────────────────────────────────────────────────────────────────────

interface Docs {
  findMany(a: Row): Promise<Row[]>;
  findOne(a: Row): Promise<Row | null>;
  update(a: Row): Promise<Row | null>;
  publish(a: Row): Promise<unknown>;
  delete(a: Row): Promise<unknown>;
}
interface Q {
  findMany(a?: Row): Promise<Row[]>;
  updateMany(a: Row): Promise<unknown>;
}
const docs = (strapi: Core.Strapi, uid: string): Docs => strapi.documents(uid as never) as unknown as Docs;
const query = (strapi: Core.Strapi, uid: string): Q => strapi.db.query(uid as never) as unknown as Q;
const store = (strapi: Core.Strapi) => strapi.store(STORE);

async function getRedirects(strapi: Core.Strapi): Promise<Record<string, string>> {
  const v = await store(strapi).get({ key: REDIRECTS_KEY });
  return v && typeof v === 'object' ? (v as Record<string, string>) : {};
}

const SCALARS = [
  'displayName', 'position', 'positionRu', 'positionEn', 'academicTitle', 'academicTitleRu', 'academicTitleEn',
  'bio', 'bioRu', 'bioEn', 'phone', 'office', 'building', 'teaching', 'responsibilities', 'other',
];
const LISTS = ['languages', 'researchAreas', 'publications', 'experience', 'education'];

function stripIds(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(stripIds);
  if (v && typeof v === 'object') {
    const o: Row = {};
    for (const [k, x] of Object.entries(v as Row)) if (k !== 'id' && k !== '__component') o[k] = stripIds(x);
    return o;
  }
  return v;
}

const empty = (v: unknown): boolean =>
  v == null || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && !v.length);

async function loadPersons(strapi: Core.Strapi): Promise<PersonDoc[]> {
  const d = docs(strapi, PERSON);
  const populate = {
    roles: true,
    unit: { fields: ['name'] },
    headOf: { fields: ['documentId'] },
    photo: { fields: ['id'] },
    languages: true,
    scholar: true,
    researchAreas: true,
    publications: true,
    experience: true,
    education: true,
  };
  const drafts: Row[] = [];
  for (let start = 0; start < 5000; start += 200) {
    const rows = await d.findMany({ status: 'draft', populate, start, limit: 200 });
    drafts.push(...rows);
    if (rows.length < 200) break;
  }
  const pubRows = await query(strapi, PERSON).findMany({
    where: { publishedAt: { $notNull: true } },
    select: ['id', 'documentId', 'updatedAt'],
  });
  const pubBy = new Map(pubRows.map((r) => [str(r.documentId), r]));
  return drafts.map((r) => {
    const pub = pubBy.get(str(r.documentId));
    const unit = r.unit as Row | null;
    return {
      documentId: str(r.documentId),
      firstId: Math.min(Number(r.id) || 0, Number(pub?.id) || Number.MAX_SAFE_INTEGER),
      name: str(r.name),
      slug: str(r.slug),
      published: Boolean(pub),
      pending: Boolean(pub) && time(r.updatedAt) > time(pub?.updatedAt) + 1000,
      data: r,
      roles: (Array.isArray(r.roles) ? (r.roles as Row[]) : []).map((x) => ({
        staffType: str(x.staffType),
        position: str(x.position),
        unitName: str(x.unitName) || null,
      })),
      unitDocId: unit ? str(unit.documentId) || null : null,
      unitName: unit ? str(unit.name) || null : null,
      headOf: Array.isArray(r.headOf) ? (r.headOf as Row[]).length : 0,
      photoId: (r.photo as Row | null)?.id != null ? Number((r.photo as Row).id) : null,
    };
  });
}

/** Əməkdaşa işarə edən əlaqələr (əks tərəfi olmayanlar). */
const REFS: { uid: string; attr: string; dp: boolean; i18n: boolean }[] = [
  { uid: 'api::facility.facility', attr: 'responsiblePerson', dp: true, i18n: true },
  { uid: 'api::unit.unit', attr: 'head', dp: true, i18n: true },
  { uid: 'api::event.event', attr: 'person', dp: true, i18n: true },
  { uid: 'api::article.article', attr: 'person', dp: true, i18n: true },
  { uid: 'api::announcement.announcement', attr: 'person', dp: true, i18n: true },
  { uid: 'api::department.department', attr: 'head', dp: true, i18n: true },
  { uid: 'api::faculty.faculty', attr: 'dean', dp: true, i18n: true },
  { uid: 'api::appeal.appeal', attr: 'assignedTo', dp: false, i18n: false },
  { uid: 'api::person.profile-revision', attr: 'person', dp: false, i18n: false },
  { uid: 'api::person.staff-private', attr: 'person', dp: false, i18n: false },
];

/** Təkrar qeydə olan əlaqələri əsas qeydə keçir. Qaytarır: keçən sayı. */
async function repoint(strapi: Core.Strapi, from: string, to: string, notes: string[], who: string): Promise<number> {
  let moved = 0;
  for (const ref of REFS) {
    if (!strapi.contentTypes[ref.uid as keyof typeof strapi.contentTypes]) continue;
    const d = docs(strapi, ref.uid);
    const filters = { [ref.attr]: { documentId: from } };
    const seen = new Map<string, { documentId: string; locale?: string }>();
    try {
      for (const status of ref.dp ? ['draft', 'published'] : [undefined]) {
        const rows = await d.findMany({
          filters,
          ...(status ? { status } : {}),
          ...(ref.i18n ? { locale: '*' } : {}),
          fields: ['documentId', ...(ref.i18n ? ['locale'] : [])],
          limit: 500,
        });
        for (const r of rows) {
          const key = `${str(r.documentId)}|${str(r.locale)}`;
          if (!seen.has(key)) seen.set(key, { documentId: str(r.documentId), ...(ref.i18n ? { locale: str(r.locale) } : {}) });
        }
      }
      for (const t of seen.values()) {
        if (ref.uid === 'api::person.staff-private') {
          const own = await d.findMany({ filters: { person: { documentId: to } }, fields: ['documentId'], limit: 1 });
          if (own.length) {
            notes.push(`${who}: şəxsi məlumat (staff-private) əsas qeyddə də var — təkrarınkı qaldı`);
            continue;
          }
        }
        if (!ref.dp) {
          await d.update({ ...t, data: { [ref.attr]: to } });
          moved++;
          continue;
        }
        const draft = await d.findOne({ ...t, status: 'draft' });
        const pub = await d.findOne({ ...t, status: 'published' });
        const pending = Boolean(pub && draft && time(draft.updatedAt) > time(pub.updatedAt) + 1000);
        await d.update({ ...t, data: { [ref.attr]: to } });
        if (pub && !pending) await d.publish(t);
        if (pending) notes.push(`${who}: ${ref.uid.split('.').pop()} ${t.documentId} (${t.locale ?? ''}) — qaralamada dəyişdi, dərc olunmamış redaktə var`);
        moved++;
      }
    } catch (e) {
      notes.push(`${who}: ${ref.uid} əlaqəsi keçmədi — ${(e as Error).message}`);
    }
  }
  return moved;
}

async function slugTaken(strapi: Core.Strapi): Promise<Map<string, string>> {
  const rows = await query(strapi, PERSON).findMany({ select: ['documentId', 'slug'] });
  return new Map(rows.map((r) => [str(r.slug), str(r.documentId)]));
}

function uniqueFrom(base: string, taken: Map<string, string>, self?: string | null): string {
  const free = (s: string) => !taken.has(s) || taken.get(s) === self;
  if (free(base)) return base;
  for (let i = 1; i < 1000; i++) if (free(`${base}-${i}`)) return `${base}-${i}`;
  return `${base}-${Date.now()}`;
}

/** Ünvan dəyişəndə: məsul redaktor açarı, profil tarixçəsi, şəxsi məlumat. */
async function followSlug(strapi: Core.Strapi, from: string, to: string): Promise<void> {
  if (!from || !to || from === to) return;
  try {
    await moveOwner(strapi, `person:${from}`, `person:${to}`, `/emekdas/${to}`);
  } catch {
    /* təyinat yoxdursa */
  }
  for (const uid of ['api::person.profile-revision', 'api::person.staff-private']) {
    if (!strapi.contentTypes[uid as keyof typeof strapi.contentTypes]) continue;
    await query(strapi, uid).updateMany({ where: { personSlug: from }, data: { personSlug: to } });
  }
}

// ── 1. Birləşdirmə ───────────────────────────────────────────────────────────

export async function applyPersonMergeV1(strapi: Core.Strapi): Promise<number> {
  const st = store(strapi);
  if ((await st.get({ key: MERGE_MARKER })) === true) return 0;
  const persons = await loadPersons(strapi);
  const groups = new Map<string, PersonDoc[]>();
  for (const p of persons) {
    const k = nameKey(p.name);
    if (!k || k.split(' ').length < 2) continue;
    const g = groups.get(k);
    if (g) g.push(p);
    else groups.set(k, [p]);
  }
  const notes: string[] = [];
  let redirects = await getRedirects(strapi);
  const backup = ((await st.get({ key: BACKUP_KEY })) as Row[] | null) ?? [];
  const d = docs(strapi, PERSON);
  let merged = 0;
  let removed = 0;
  let relations = 0;
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const [canon, ...dups] = orderGroup(group);
    const who = canon.name.trim();
    if (canon.published && canon.pending) {
      notes.push(`${who}: əsas qeydin dərc olunmamış redaktəsi var — birləşdirilmədi (admində dərc edin, sonra marker personMerge:v1 silinərsə yenidən)`);
      continue;
    }
    try {
      const patch: Row = {};
      const base = canon.roles.length
        ? canon.roles
        : str(canon.data.position).trim()
          ? [{ staffType: str(canon.data.staffType), position: str(canon.data.position), unitName: canon.unitName }]
          : [];
      const cands: Role[] = [];
      for (const x of dups) {
        cands.push(...x.roles);
        if (str(x.data.position).trim()) cands.push({ staffType: str(x.data.staffType), position: str(x.data.position), unitName: x.unitName });
      }
      const roles = mergeRoles(base, cands, notes, who);
      const before = JSON.stringify(canon.roles.map((r) => [r.staffType, r.position.trim(), r.unitName ?? null]));
      const after = JSON.stringify(roles.map((r) => [r.staffType, r.position, r.unitName]));
      if (before !== after) patch.roles = roles.map((r, i) => ({ ...r, sortOrder: i }));
      if (!canon.unitDocId) {
        const withUnit = dups.find((x) => x.unitDocId);
        if (withUnit) patch.unit = withUnit.unitDocId;
      }
      // E-poçt: boşdursa təkrarınkı, fərqlidirsə əlavə e-poçt.
      const mails = new Set<string>([str(canon.data.email).trim().toLowerCase(), str(canon.data.altEmail).trim().toLowerCase()].filter(Boolean));
      for (const x of dups) {
        for (const m of [str(x.data.email).trim(), str(x.data.altEmail).trim()]) {
          if (!m || mails.has(m.toLowerCase())) continue;
          if (empty(canon.data.email) && !patch.email) patch.email = m;
          else if (empty(canon.data.altEmail) && !patch.altEmail) patch.altEmail = m;
          else continue;
          mails.add(m.toLowerCase());
        }
      }
      for (const f of SCALARS) {
        if (!empty(canon.data[f])) continue;
        const src = dups.find((x) => !empty(x.data[f]));
        if (src) patch[f] = src.data[f];
      }
      const deg = str(canon.data.academicDegree);
      if (!deg || deg === 'yoxdur') {
        const src = dups.find((x) => str(x.data.academicDegree) && str(x.data.academicDegree) !== 'yoxdur');
        if (src) patch.academicDegree = src.data.academicDegree;
      }
      if (!canon.photoId) {
        const src = dups.find((x) => x.photoId);
        if (src) patch.photo = src.photoId;
      }
      for (const f of LISTS) {
        if (!empty(canon.data[f])) continue;
        const src = dups.find((x) => !empty(x.data[f]));
        if (src) patch[f] = stripIds(src.data[f]);
      }
      if (!canon.data.scholar) {
        const src = dups.find((x) => x.data.scholar);
        if (src) patch.scholar = stripIds(src.data.scholar);
      }
      if (Object.keys(patch).length) {
        await d.update({ documentId: canon.documentId, data: patch });
        if (canon.published) await d.publish({ documentId: canon.documentId });
      }
      for (const x of dups) {
        relations += await repoint(strapi, x.documentId, canon.documentId, notes, who);
        backup.push({
          at: new Date().toISOString(),
          mergedInto: canon.documentId,
          canonSlug: canon.slug,
          documentId: x.documentId,
          published: x.published,
          data: stripIds({ ...x.data, unit: x.unitName, headOf: undefined }),
        });
        redirects = addRedirect(redirects, x.slug, canon.slug);
        await d.delete({ documentId: x.documentId });
        await followSlug(strapi, x.slug, canon.slug);
        removed++;
      }
      merged++;
    } catch (e) {
      notes.push(`${who}: XƏTA — ${(e as Error).message}`);
    }
  }
  await st.set({ key: BACKUP_KEY, value: backup });
  await st.set({ key: REDIRECTS_KEY, value: redirects });
  await st.set({ key: MERGE_MARKER, value: true });
  strapi.log.info(`${TAG}: təkrar əməkdaşlar — ${merged} ad birləşdi, ${removed} təkrar qeyd silindi (ehtiyat: ${BACKUP_KEY}), ${relations} əlaqə keçdi.`);
  for (const n of notes) strapi.log.warn(`${TAG}: ${n}`);
  return removed;
}

// ── 2. Ünvanlar ──────────────────────────────────────────────────────────────

export async function applyPersonSlugsV1(strapi: Core.Strapi): Promise<number> {
  const st = store(strapi);
  if ((await st.get({ key: SLUG_MARKER })) === true) return 0;
  const rows = await query(strapi, PERSON).findMany({ select: ['id', 'documentId', 'name', 'slug', 'updatedAt', 'publishedAt'] });
  const byDoc = new Map<string, Row[]>();
  for (const r of rows) {
    const k = str(r.documentId);
    const g = byDoc.get(k);
    if (g) g.push(r);
    else byDoc.set(k, [r]);
  }
  const taken = new Map(rows.map((r) => [str(r.slug), str(r.documentId)]));
  let redirects = await getRedirects(strapi);
  const notes: string[] = [];
  let slugs = 0;
  let names = 0;
  for (const [documentId, group] of byDoc) {
    const draft = group.find((r) => r.publishedAt == null) ?? group[0];
    const name = str(draft.name);
    const cleanName = name.replace(/\s+/g, ' ').trim();
    const slug = str(draft.slug);
    if (group.some((r) => str(r.slug) !== slug)) {
      notes.push(`${cleanName}: qaralama və dərc olunmuş ünvan fərqlidir — toxunulmadı`);
      continue;
    }
    const fix = isBrokenSlug(slug, cleanName);
    const next = fix ? uniqueFrom(azSlug(cleanName), taken, documentId) : slug;
    const nameFix = group.some((r) => str(r.name) !== str(r.name).replace(/\s+/g, ' ').trim());
    if (next === slug && !nameFix) continue;
    for (const r of group) {
      const data: Row = { updatedAt: r.updatedAt };
      if (next !== slug) data.slug = next;
      const rn = str(r.name);
      const rc = rn.replace(/\s+/g, ' ').trim();
      if (rc !== rn) data.name = rc;
      await query(strapi, PERSON).updateMany({ where: { id: r.id }, data });
    }
    if (nameFix) names++;
    if (next !== slug) {
      taken.delete(slug);
      taken.set(next, documentId);
      redirects = addRedirect(redirects, slug, next);
      await followSlug(strapi, slug, next);
      slugs++;
    }
  }
  await st.set({ key: REDIRECTS_KEY, value: redirects });
  await st.set({ key: SLUG_MARKER, value: true });
  strapi.log.info(`${TAG}: ünvanlar — ${slugs} əməkdaşın ünvanı Azərbaycan hərfləri ilə yazıldı (köhnəsi yönləndirilir), ${names} adın boşluqları təmizləndi.`);
  for (const n of notes) strapi.log.warn(`${TAG}: ${n}`);
  return slugs + names;
}

/** Zəncir: birləşdirmə → ünvanlar; hər biri ayrıca, biri xəta versə digəri işləyir. */
export async function applyPersonF558(strapi: Core.Strapi): Promise<void> {
  let changed = 0;
  for (const [name, step] of [
    ['birləşdirmə', applyPersonMergeV1],
    ['ünvanlar', applyPersonSlugsV1],
  ] as const) {
    try {
      changed += await step(strapi);
    } catch (e) {
      strapi.log.error(`${TAG} ${name}: ${(e as Error).message}`);
    }
  }
  if (changed) {
    markSearchDirty();
    requestSiteRevalidate(strapi, 'heyet');
  }
}

// ── 3. Qoruyucu ──────────────────────────────────────────────────────────────

async function nameClash(strapi: Core.Strapi, key: string, self: string | null): Promise<Row | null> {
  const rows = await query(strapi, PERSON).findMany({ select: ['documentId', 'name', 'slug'] });
  return rows.find((r) => str(r.documentId) !== self && nameKey(str(r.name)) === key) ?? null;
}

/** register(): admində və ictimai API-də təkrar əməkdaşın və oxunmaz ünvanın qarşısı. */
export function registerPersonGuard(strapi: Core.Strapi): void {
  (strapi.documents as unknown as { use: (m: unknown) => void }).use(async (context: Row, next: () => Promise<unknown>) => {
    const action = str(context.action);
    if (context.uid !== PERSON || !['create', 'update', 'clone'].includes(action)) return next();
    const rc = (strapi as unknown as { requestContext?: { get?: () => { request?: { path?: string } } | undefined } }).requestContext;
    const path = str(rc?.get?.()?.request?.path);
    if (!path.startsWith('/content-manager/') && !path.startsWith('/api/')) return next();

    const params = (context.params ?? {}) as Row;
    const data = (params.data ?? {}) as Row;
    const self = action === 'create' ? null : str(params.documentId) || null;
    const old = self ? await docs(strapi, PERSON).findOne({ documentId: self, fields: ['name', 'slug'] }) : null;
    const name = str(data.name) || (action === 'clone' ? str(old?.name) : '');
    let renamed: { from: string; to: string } | null = null;
    if (name.trim()) {
      const key = nameKey(name);
      const changedName = action !== 'update' || nameKey(str(old?.name)) !== key;
      if (changedName && key.split(' ').length >= 2) {
        const clash = await nameClash(strapi, key, action === 'clone' ? null : self);
        if (clash) {
          throw new errors.ValidationError(
            `«${name.trim()}» adlı əməkdaş artıq var (/emekdas/${str(clash.slug)}). Təkrar qeyd yaradılmadı: ` +
              'əlavə vəzifəni həmin qeydin «Vəzifələr» siyahısına yazın.',
          );
        }
      }
      if (action === 'create' || (action === 'update' && 'slug' in data)) {
        const slug = str(data.slug).trim();
        if ((action === 'create' && !slug) || (slug && isBrokenSlug(slug, name))) {
          const fixed = uniqueFrom(azSlug(name), await slugTaken(strapi), self);
          if (fixed && fixed !== slug) {
            data.slug = fixed;
            params.data = data;
            const prev = str(old?.slug);
            if (prev && prev !== fixed) renamed = { from: prev, to: fixed };
          }
        }
      }
    }
    const result = await next();
    if (renamed) {
      try {
        await store(strapi).set({ key: REDIRECTS_KEY, value: addRedirect(await getRedirects(strapi), renamed.from, renamed.to) });
        await followSlug(strapi, renamed.from, renamed.to);
      } catch {
        /* yönləndirmə yazılmasa da qeyd saxlanılıb */
      }
    }
    return result;
  });
}

// ── 4. Admində ünvan yaradılması ─────────────────────────────────────────────

const TRANSLIT: Record<string, string> = { Ə: 'E', ə: 'e', Ü: 'U', ü: 'u', Ö: 'O', ö: 'o', Ğ: 'G', ğ: 'g', Ş: 'S', ş: 's', Ç: 'C', ç: 'c', I: 'I', ı: 'i', İ: 'I' };
export const azLatin = (s: string): string => str(s).replace(/[ƏəÜüÖöĞğŞşÇçıİ]/g, (c) => TRANSLIT[c] ?? c);

/** bootstrap(): Content Manager-in «Ünvan» generatoru Azərbaycan hərflərini latına çevirsin. */
export function patchUidTransliteration(strapi: Core.Strapi): void {
  try {
    const svc = strapi.plugin('content-manager').service('uid') as unknown as {
      generateUIDField?: (a: Row) => Promise<string>;
      __addaAz?: boolean;
    };
    if (!svc?.generateUIDField || svc.__addaAz) return;
    const orig = svc.generateUIDField.bind(svc);
    svc.generateUIDField = async (args: Row) => {
      const ct = strapi.contentTypes[str(args.contentTypeUID) as keyof typeof strapi.contentTypes] as unknown as
        | { attributes?: Record<string, { targetField?: string }> }
        | undefined;
      const target = ct?.attributes?.[str(args.field)]?.targetField;
      const data = (args.data ?? {}) as Row;
      if (target && typeof data[target] === 'string') return orig({ ...args, data: { ...data, [target]: azLatin(data[target] as string) } });
      return orig(args);
    };
    svc.__addaAz = true;
  } catch (e) {
    strapi.log.warn(`${TAG}: ünvan generatoru dəyişdirilmədi — ${(e as Error).message}`);
  }
}
