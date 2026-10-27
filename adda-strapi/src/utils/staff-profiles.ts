/**
 * F5.59 — 10 əməkdaşın profili (Zaur müəllim, 27.10.2026: «bu məlumatı aidiyyəti
 * əməkdaşların səhifələrinə əlavə et»): prorektor, iki dekan, yeddi kafedra müdiri.
 * Məzmun: staff-profiles-content.ts. BİR DƏFƏ (`staffProfiles:v1`), YALNIZ BOŞ sahələrə.
 *
 * - Uyğunlaşdırma: ad açarı (`nameKey`: kiçik hərf, ə→e …) eyni → həmin qeyd; yoxdursa
 *   saytdakı adın bütün sözləri tam adda varsa (≥ 2 söz, tək qeyd) → ad tamamlanır
 *   («İradə Süleymanova» → «Süleymanova İradə Əli qızı», görünən ad «İradə Əli qızı
 *   Süleymanova»); yoxdursa e-poçtun «@»-dan əvvəlki hissəsi (ad dəyişmir).
 * - Tərcümeyi-hal: «Texnika üzrə fəlsəfə doktoru (2017), dosent (2022).» + «Elmi və peşə
 *   fəaliyyəti», «Mükafatlar». Saytdakı elmi dərəcə və ya ad göndərilənlə ziddirsə
 *   (Alıyeva: saytda elmlər doktoru, professor) cümlə yazılmır, sahələrə toxunulmur — logda.
 * - Təhsil, iş təcrübəsi, dil bilikləri — siyahı boşdursa.
 * - E-poçt boşdursa; başqa ünvan varsa — «Əlavə e-poçt» boşdursa ora. Telefon, elmi
 *   dərəcə («yoxdur» da boş sayılır), elmi ad — boşdursa.
 * - Vəzifənin ştat cədvəlindən qalmış qısaltması (`POSITION_FIXES`) — bölmənin rəsmi adı.
 * - Doğum tarixi saytda GÖRÜNMÜR: «5. Sistem — Heyət — məxfi» (staff-private). Qeyd
 *   yoxdursa yaradılır, tarix boşdursa yazılır, fərqlidirsə toxunulmur (logda, tarixsiz).
 * - Dərc olunmamış redaktəsi olan qeyddə yalnız qaralama yazılır (logda).
 *
 * Xəta olan qeyd varsa marker yazılmır — növbəti başlanğıcda yenidən (yalnız boşları
 * doldurduğu üçün təkrar zərərsizdir).
 */
import type { Core } from '@strapi/strapi';
import { nameKey } from './person-merge';
import { markSearchDirty } from './search-index';
import { requestSiteRevalidate } from './site-revalidate';
import { STAFF_PROFILES } from './staff-profiles-content';

type Row = Record<string, unknown>;

export type StaffLang = 'az' | 'tr' | 'en' | 'ru' | 'de' | 'fr' | 'diger';

export interface StaffProfileSeed {
  fullName: string;
  position?: string;
  department?: string;
  degree?: string;
  degreeYear?: number;
  title?: string;
  titleYear?: number;
  education: { period: string; institution: string; qualification?: string; sortYear?: number }[];
  career: { period: string; organization: string; position: string; sortYear?: number }[];
  highlights: string[];
  awards: string[];
  languages: { lang: StaffLang; level?: string }[];
  email?: string;
  phone?: string;
  birthDate?: string;
}

const PERSON = 'api::person.person';
const PRIVATE = 'api::person.staff-private';
const TAG = '[heyet] F5.59';
const STORE = { type: 'plugin', name: 'adda-admin' } as const;
export const STAFF_PROFILES_MARKER = 'staffProfiles:v1';

/**
 * Ştat cədvəlindən qalmış qısaltma → bölmənin rəsmi adı (prod: bölmə «Tədrisin təşkili və
 * idarəedilməsi üzrə prorektor», rəhbəri İradə Süleymanova). Yalnız dəqiq bərabər mətn.
 */
export const POSITION_FIXES: Record<string, string> = {
  'Tədrisin təşkili və idarəed.üzrə pr.': 'Tədrisin təşkili və idarəedilməsi üzrə prorektor',
};

const str = (v: unknown): string => (typeof v === 'string' ? v : v == null ? '' : String(v));
const empty = (v: unknown): boolean =>
  v == null || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && !v.length);
const time = (v: unknown): number => {
  const t = Date.parse(str(v));
  return Number.isFinite(t) ? t : 0;
};

// ── Saf köməkçilər (sınaq üçün ixrac) ────────────────────────────────────────

export type DegreeValue = 'elmler_doktoru' | 'felsefe_doktoru' | 'elmler_namizedi';

/** Elmi dərəcənin mətni → sahənin dəyəri. «Fəlsəfə elmləri namizədi» — namizəd. */
export function degreeEnum(text: string): DegreeValue | null {
  const k = ` ${nameKey(text)} `;
  if (k.includes(' namizedi ')) return 'elmler_namizedi';
  if (k.includes(' felsefe doktoru ')) return 'felsefe_doktoru';
  if (k.includes(' elmleri doktoru ') || k.includes(' elmler doktoru ')) return 'elmler_doktoru';
  return null;
}

const words = (s: string): string[] => nameKey(s).split(' ').filter(Boolean);

/** Saytdakı adın (≥ 2 söz) bütün sözləri tam adda var və tam ad daha uzundur. */
export function nameCompletes(siteName: string, fullName: string): boolean {
  const a = words(siteName);
  const b = words(fullName);
  return a.length >= 2 && a.length < b.length && a.every((x) => b.includes(x));
}

/** «Süleymanova İradə Əli qızı» → «İradə Əli qızı Süleymanova» (saytın görünən adı: Ad Ata Soyad). */
export function displayNameOf(fullName: string): string {
  const w = fullName.replace(/\s+/g, ' ').trim().split(' ');
  return w.length < 2 ? w.join(' ') : [...w.slice(1), w[0]].join(' ');
}

const emailLocal = (e: string): string => str(e).trim().toLowerCase().split('@')[0] ?? '';

/** Azərbaycan dilində ilk hərf: «Dosent» → «dosent», «İ» → «i», «I» → «ı». */
function lowerFirst(s: string): string {
  const c = s.charAt(0);
  const low = c === 'İ' ? 'i' : c === 'I' ? 'ı' : c.toLowerCase();
  return low + s.slice(1);
}
function upperFirst(s: string): string {
  const c = s.charAt(0);
  const up = c === 'i' ? 'İ' : c === 'ı' ? 'I' : c.toUpperCase();
  return up + s.slice(1);
}

export interface PersonLite {
  documentId: string;
  name: string;
  email?: string;
  altEmail?: string;
}

export type SeedMatch<T> = { person: T; how: 'ad' | 'tamamlanir' | 'e-poct' } | { error: string };

export function matchSeed<T extends PersonLite>(seed: StaffProfileSeed, persons: T[]): SeedMatch<T> {
  const key = nameKey(seed.fullName);
  const exact = persons.filter((p) => nameKey(p.name) === key);
  if (exact.length === 1) return { person: exact[0], how: 'ad' };
  if (exact.length > 1) return { error: `eyni adla ${exact.length} qeyd var` };
  const part = persons.filter((p) => nameCompletes(p.name, seed.fullName));
  if (part.length === 1) return { person: part[0], how: 'tamamlanir' };
  if (part.length > 1) return { error: `adın bir hissəsi ${part.length} qeyddə var` };
  const local = emailLocal(seed.email ?? '');
  if (local) {
    const byMail = persons.filter((p) => [p.email, p.altEmail].some((m) => m && emailLocal(m) === local));
    if (byMail.length === 1) return { person: byMail[0], how: 'e-poct' };
  }
  return { error: 'saytda tapılmadı' };
}

/** Tərcümeyi-hal (markdown): dərəcə və ad cümləsi, fəaliyyət və mükafatlar. */
export function buildBio(seed: StaffProfileSeed, withDegree: boolean): string {
  const parts: string[] = [];
  if (withDegree) {
    const bits: string[] = [];
    if (seed.degree) bits.push(seed.degreeYear ? `${seed.degree} (${seed.degreeYear})` : seed.degree);
    if (seed.title) {
      const t = lowerFirst(seed.title);
      bits.push(seed.titleYear ? `${t} (${seed.titleYear})` : t);
    }
    if (bits.length) parts.push(upperFirst(bits.join(', ')) + '.');
  }
  if (seed.highlights.length) parts.push('### Elmi və peşə fəaliyyəti', seed.highlights.map((h) => `- ${h}`).join('\n'));
  if (seed.awards.length) parts.push('### Mükafatlar', seed.awards.map((a) => `- ${a}`).join('\n'));
  return parts.join('\n\n');
}

// ── Baza ─────────────────────────────────────────────────────────────────────

type Docs = {
  findMany: (p: Row) => Promise<Row[]>;
  create: (p: Row) => Promise<Row>;
  update: (p: Row) => Promise<Row>;
  publish: (p: Row) => Promise<unknown>;
};
type Q = { findMany: (p: Row) => Promise<Row[]> };
const docs = (strapi: Core.Strapi, uid: string): Docs => strapi.documents(uid as never) as unknown as Docs;
const query = (strapi: Core.Strapi, uid: string): Q => strapi.db.query(uid as never) as unknown as Q;

interface PersonRec extends PersonLite {
  slug: string;
  published: boolean;
  pending: boolean;
  data: Row;
}

async function loadPersons(strapi: Core.Strapi): Promise<PersonRec[]> {
  const d = docs(strapi, PERSON);
  const drafts: Row[] = [];
  for (let start = 0; start < 5000; start += 200) {
    const rows = await d.findMany({
      status: 'draft',
      populate: { roles: true, languages: true, education: true, experience: true },
      start,
      limit: 200,
    });
    drafts.push(...rows);
    if (rows.length < 200) break;
  }
  const pubRows = await query(strapi, PERSON).findMany({
    where: { publishedAt: { $notNull: true } },
    select: ['documentId', 'updatedAt'],
  });
  const pubBy = new Map(pubRows.map((r) => [str(r.documentId), r]));
  return drafts.map((r) => {
    const pub = pubBy.get(str(r.documentId));
    return {
      documentId: str(r.documentId),
      name: str(r.name),
      email: str(r.email),
      altEmail: str(r.altEmail),
      slug: str(r.slug),
      published: Boolean(pub),
      pending: Boolean(pub) && time(r.updatedAt) > time(pub?.updatedAt) + 1000,
      data: r,
    };
  });
}

type PrivateResult = 'yeni' | 'yazildi' | 'eyni' | 'ferqli' | null;

/** Doğum tarixi şəxsi qeydə (saytda görünmür); mövcud tarixin üstündən yazılmır. */
async function savePrivate(strapi: Core.Strapi, person: PersonRec, birthDate: string): Promise<PrivateResult> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || !strapi.contentTypes[PRIVATE as keyof typeof strapi.contentTypes]) return null;
  const d = docs(strapi, PRIVATE);
  const rows = await d.findMany({
    filters: { $or: [{ person: { documentId: person.documentId } }, { personSlug: person.slug }] },
    fields: ['personSlug', 'birthDate'],
    populate: { person: { fields: ['documentId'] } },
    limit: 5,
  });
  if (!rows.length) {
    await d.create({ data: { personSlug: person.slug, birthDate, person: person.documentId } });
    return 'yeni';
  }
  const own = rows.find((r) => str((r.person as Row | null)?.documentId) === person.documentId) ?? rows[0];
  const cur = str(own.birthDate).slice(0, 10);
  const patch: Row = {};
  if (!own.person) patch.person = person.documentId;
  if (!cur) patch.birthDate = birthDate;
  if (Object.keys(patch).length) await d.update({ documentId: str(own.documentId), data: patch });
  if (!cur) return 'yazildi';
  return cur === birthDate ? 'eyni' : 'ferqli';
}

const stripRole = (r: Row, i: number): Row => ({
  staffType: str(r.staffType),
  position: str(r.position),
  unitName: str(r.unitName) || null,
  sortOrder: typeof r.sortOrder === 'number' ? r.sortOrder : i,
});

// ── Miqrasiya ────────────────────────────────────────────────────────────────

export async function applyStaffProfilesV1(strapi: Core.Strapi, seeds: StaffProfileSeed[] = STAFF_PROFILES): Promise<number> {
  const st = strapi.store(STORE);
  if ((await st.get({ key: STAFF_PROFILES_MARKER })) === true) return 0;
  const persons = await loadPersons(strapi);
  const d = docs(strapi, PERSON);
  const notes: string[] = [];
  const count = { changed: 0, bio: 0, edu: 0, exp: 0, lang: 0, mail: 0, phone: 0, rank: 0, name: 0, post: 0 };
  const priv = { yeni: 0, yazildi: 0, eyni: 0, ferqli: 0 };
  let failed = 0;

  for (const seed of seeds) {
    const who = seed.fullName;
    const m = matchSeed(seed, persons);
    if ('error' in m) {
      notes.push(`${who}: ${m.error} — yazılmadı`);
      continue;
    }
    const p = m.person;
    const cur = p.data;
    try {
      const patch: Row = {};

      // Ad: saytda qısadırsa (ata adı yoxdur) tam ad; görünən ad da (Ad Ata Soyad).
      if (m.how === 'tamamlanir') {
        const full = seed.fullName.replace(/\s+/g, ' ').trim();
        patch.name = full;
        const dn = str(cur.displayName).trim();
        if (!dn || nameCompletes(dn, full)) patch.displayName = displayNameOf(full);
        count.name++;
      } else if (m.how === 'e-poct') {
        notes.push(`${who}: adla yox, e-poçtla tapıldı (saytda «${p.name}») — ad dəyişmədi`);
      }

      // Vəzifənin qısaltması → rəsmi ad (vəzifə sahəsi və «Vəzifələr»).
      const pos = str(cur.position).trim();
      if (POSITION_FIXES[pos]) patch.position = POSITION_FIXES[pos];
      const roles = Array.isArray(cur.roles) ? (cur.roles as Row[]) : [];
      if (roles.some((r) => POSITION_FIXES[str(r.position).trim()])) {
        patch.roles = roles.map((r, i) => {
          const x = stripRole(r, i);
          const fix = POSITION_FIXES[str(x.position).trim()];
          return fix ? { ...x, position: fix } : x;
        });
      }
      if (patch.position || patch.roles) count.post++;

      // E-poçt: boşdursa; fərqli ünvan varsa «Əlavə e-poçt».
      const mail = str(seed.email).trim();
      if (mail) {
        const e1 = str(cur.email).trim();
        const e2 = str(cur.altEmail).trim();
        if (![e1, e2].some((x) => x && x.toLowerCase() === mail.toLowerCase())) {
          if (!e1) patch.email = mail;
          else if (!e2) patch.altEmail = mail;
          else notes.push(`${who}: e-poçt ${mail} yazılmadı — qeyddə başqa iki ünvan var`);
          if (patch.email || patch.altEmail) count.mail++;
        }
      }

      if (seed.phone && empty(cur.phone)) {
        patch.phone = seed.phone;
        count.phone++;
      }

      // Elmi dərəcə və ad: boşdursa yazılır; ziddirsə saytdakı qalır, cümlə yazılmır.
      let rankOk = true;
      const seedDeg = seed.degree ? degreeEnum(seed.degree) : null;
      const siteDeg = str(cur.academicDegree);
      if (seedDeg) {
        if (!siteDeg || siteDeg === 'yoxdur') patch.academicDegree = seedDeg;
        else if (siteDeg !== seedDeg) rankOk = false;
      }
      const siteTitle = str(cur.academicTitle).trim();
      if (seed.title) {
        if (!siteTitle) patch.academicTitle = seed.title;
        else if (nameKey(siteTitle) !== nameKey(seed.title)) rankOk = false;
      }
      if (!rankOk) {
        delete patch.academicDegree;
        delete patch.academicTitle;
        notes.push(
          `${who}: saytda «${siteDeg || '-'}», «${siteTitle || '-'}»; göndərilən «${seed.degree ?? '-'}», «${seed.title ?? '-'}» — ` +
            'saytdakı saxlanıldı, tərcümeyi-hala dərəcə cümləsi yazılmadı (admində yoxlayın)',
        );
      }
      if (patch.academicDegree || patch.academicTitle) count.rank++;

      const bio = buildBio(seed, rankOk);
      if (bio) {
        if (empty(cur.bio)) {
          patch.bio = bio;
          count.bio++;
        } else notes.push(`${who}: tərcümeyi-hal artıq var — toxunulmadı`);
      }

      const lists: [string, unknown[], keyof typeof count][] = [
        ['education', seed.education, 'edu'],
        ['experience', seed.career, 'exp'],
        ['languages', seed.languages, 'lang'],
      ];
      for (const [field, list, c] of lists) {
        if (!list.length) continue;
        if (empty(cur[field])) {
          patch[field] = list.map((x) => ({ ...(x as Row) }));
          count[c]++;
        } else notes.push(`${who}: «${field}» artıq doludur — toxunulmadı`);
      }

      if (Object.keys(patch).length) {
        await d.update({ documentId: p.documentId, data: patch });
        if (p.published && !p.pending) await d.publish({ documentId: p.documentId });
        if (p.pending) notes.push(`${who}: dərc olunmamış redaktə var — yalnız qaralamaya yazıldı (admində dərc edin)`);
        count.changed++;
      }

      if (seed.birthDate) {
        const r = await savePrivate(strapi, p, seed.birthDate);
        if (r) priv[r]++;
        if (r === 'ferqli') notes.push(`${who}: şəxsi qeyddə doğum tarixi fərqlidir — toxunulmadı (admində yoxlayın)`);
      }
    } catch (e) {
      failed++;
      notes.push(`${who}: XƏTA — ${(e as Error).message}`);
    }
  }

  if (!failed) await st.set({ key: STAFF_PROFILES_MARKER, value: true });
  strapi.log.info(
    `${TAG}: əməkdaş profilləri — ${count.changed}/${seeds.length} qeyd yeniləndi (tərcümeyi-hal ${count.bio}, təhsil ${count.edu}, ` +
      `iş təcrübəsi ${count.exp}, dillər ${count.lang}, e-poçt ${count.mail}, telefon ${count.phone}, dərəcə/ad ${count.rank}, ` +
      `ad ${count.name}, vəzifə ${count.post}); şəxsi qeyd (doğum tarixi): ${priv.yeni} yeni, ${priv.yazildi} yazıldı, ` +
      `${priv.eyni} eyni, ${priv.ferqli} fərqli.` +
      (failed ? ` ${failed} xəta — marker yazılmadı, növbəti başlanğıcda yenidən.` : ''),
  );
  for (const n of notes) strapi.log.warn(`${TAG}: ${n}`);
  if (count.changed) {
    markSearchDirty();
    requestSiteRevalidate(strapi, 'heyet');
  }
  return count.changed;
}
