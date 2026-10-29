/**
 * F5.60 — Azərbaycan Dənizçilik Kolleci (Zaur müəllim, 29.10.2026: kollecin göndərdiyi 12 fayl —
 * «kolleclə bağlı məlumatları yenilə və çatışmayan səhifələri formalaşdır»). Məzmun:
 * kollec-content.ts, kollec-nizamname-content.ts. Hər addım öz markeri ilə BİR DƏFƏ, xətası
 * digərlərini dayandırmır:
 *
 *   1. `kollecPages:v1` — 4 yeni səhifə (layout=kollec, section-pages.ts qaydası): tarix, təhsil
 *      və ixtisaslar (canlı cədvəl — subbakalavr), istehsalat təcrübəsi, Nizamnamə (PDF-dən
 *      köçürülmüş mətn, yan keçiddə rəsmi PDF).
 *   2. `kollecAdmission:v1` — /sehife/subbakalavr: «Sayta düzəliş» faylının mətni (giriş,
 *      trayektoriya addımları, «Kollec kimlər üçündür», «Kollecdən sonra»), 2026/2027 qəbulunun
 *      ən yüksək və minimal balları, əlaqədə kollecin ünvanı; yan keçidlər.
 *   3. `kollecUnit:v1` — bölmə: «Haqqında»-dakı ünvansız şəkil yazısı silinir, şəklə alt mətn,
 *      «2016-cı ildə yaradılıb» → «1930-cu ildə yaradılıb»; boşdursa «Faydalı linklər», rəhbər və
 *      əlaqə sahələri (ru/en-də telefon, e-poçt, ünvan boş idi).
 *   4. `kollecPrograms:v1` — 4 ixtisas: 120 AKTS və konvensiyalar (boşdursa), qəbul balı 683 → 68,3
 *      (subbakalavr — 300 ballıq), səhv cavablı sual.
 *   5. `kollecDocs:v1` — Nizamnamə və 4 təhsil proqramı: kateqoriya «diger» → «normativ», il,
 *      təsvir, səhifə, proqramların adı və bölməyə bağlanması (boşdursa).
 *   6. `kollecStaff:v1` — ştat cədvəli: 9 mövcud qeydin tam adı, vəzifənin rəsmi adı (yalnız
 *      admin yazılışı gözləniləndirsə), əlavə vəzifə və fənlər; 13 yeni əməkdaş (müəllimlər,
 *      mütəxəssis, operatorlar). Maaşlar və xidmət heyəti saytda yoxdur.
 *   7. `kollecMenu:v1` — üst menyunun «Kollec» bölməsi (yalnız F3 yer tutanları qalıbsa):
 *      «Kollec haqqında», «Təhsil», «Qəbul» qrupları.
 *
 * Birbaşa bazaya yazılan mətnlərdə redaktə tarixi saxlanılır (`updateMany` + köhnə `updatedAt`).
 * Document Service ilə yazılanda dərc olunmuş qeyd yenidən dərc olunur; dərc olunmamış redaktə
 * varsa yalnız qaralama yazılır (logda).
 */
import type { Core } from '@strapi/strapi';
import { applySectionPages } from './section-pages';
import { absUrl, hasPendingDraft, unitTargets, type Docs } from './esasnameler';
import { applyTextFix } from './qaydalar';
import { azSlug, nameKey } from './person-merge';
import { displayNameOf, nameCompletes } from './staff-profiles';
import { normalizeScore } from './admission-scores';
import { markSearchDirty } from './search-index';
import { requestSiteRevalidate } from './site-revalidate';
import type { LinkSeed, QebulPageSeed } from './qebul-pages-content';
import {
  ADMISSION_FIXES,
  ADMISSION_SIDE_LINKS,
  ADMISSION_SLUG,
  CHARTER_DOC_TITLE,
  CHARTER_PDF_TOKEN,
  KOLLEC_DOCS,
  KOLLEC_EMAIL,
  KOLLEC_LAYOUT,
  KOLLEC_MENU,
  KOLLEC_NOT_IN_STAFF,
  KOLLEC_PAGES,
  KOLLEC_PHONES,
  KOLLEC_STAFF,
  KOLLEC_UNIT_NAME,
  KOLLEC_UNIT_SLUG,
  KOLLEC_MENU_URL,
  MENU_CATEGORY,
  MENU_DROP_OWNERS,
  MENU_OLD_URLS,
  PROGRAM_CONVENTIONS,
  PROGRAM_CREDITS,
  PROGRAM_FAQ_FIX,
  PROGRAM_SLUG,
  ADMISSION_STEP_FIXES,
  SUBBACHELOR_SCORE_MAX,
  UNIT_BUILDING,
  UNIT_ESTABLISHED,
  UNIT_HEAD_SLUG,
  UNIT_IMAGE_ALT,
  UNIT_LINKS,
  type KollecStaffSeed,
  type StaffType,
} from './kollec-content';

type Row = Record<string, unknown>;
interface Q {
  findMany: (a: Row) => Promise<Row[]>;
  findOne: (a: Row) => Promise<Row | null>;
  updateMany: (a: Row) => Promise<{ count: number }>;
  delete: (a: Row) => Promise<unknown>;
}

const TAG = '[kollec] F5.60';
const PAGE_UID = 'api::page.page';
const UNIT_UID = 'api::unit.unit';
const PROGRAM_UID = 'api::program.program';
const DOC_UID = 'api::document.document';
const PERSON_UID = 'api::person.person';
const OWNER_UID = 'api::page-owner.page-owner';

export const KOLLEC_MARKERS = {
  pages: 'kollecPages:v1',
  admission: 'kollecAdmission:v1',
  unit: 'kollecUnit:v1',
  programs: 'kollecPrograms:v1',
  docs: 'kollecDocs:v1',
  staff: 'kollecStaff:v1',
  menu: 'kollecMenu:v1',
} as const;

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : v == null ? '' : String(v).trim());
const list = (v: unknown): Row[] => (Array.isArray(v) ? (v as Row[]) : []);
const docs = (strapi: Core.Strapi, uid: string) => strapi.documents(uid as never) as unknown as Docs;
const q = (strapi: Core.Strapi, uid: string) => strapi.db.query(uid as never) as unknown as Q;
const store = (strapi: Core.Strapi) => strapi.store({ type: 'plugin', name: 'adda-admin' });
const done = async (strapi: Core.Strapi, key: string) => (await store(strapi).get({ key })) === true;
const mark = (strapi: Core.Strapi, key: string) => store(strapi).set({ key, value: true });

/** Dəyişiklik oldu: sonda sayt yenilənir və axtarış indeksi köhnəlir. */
let touched = 0;

// ── 1. Səhifələr ─────────────────────────────────────────────────────────────
/** Nizamnamənin rəsmi PDF-i — admində yüklənmiş sənədin faylı. */
async function charterPdf(strapi: Core.Strapi): Promise<string | null> {
  const rows = await docs(strapi, DOC_UID).findMany({
    status: 'draft',
    filters: { title: { $eq: CHARTER_DOC_TITLE } },
    populate: { file: { fields: ['url'] } },
    limit: 5,
  });
  for (const r of rows) {
    const url = str((r.file as Row | null)?.url);
    if (url) return absUrl(url);
  }
  return null;
}

export function withCharterPdf(pages: QebulPageSeed[], pdf: string | null): QebulPageSeed[] {
  return pages.map((pg) => {
    const side = pg.az.sideLinks ?? [];
    if (!side.some((l) => l.url === CHARTER_PDF_TOKEN)) return pg;
    const sideLinks: LinkSeed[] = [];
    for (const l of side) {
      if (l.url !== CHARTER_PDF_TOKEN) sideLinks.push(l);
      else if (pdf) sideLinks.push({ label: l.label, url: pdf });
    }
    return { ...pg, az: { ...pg.az, sideLinks } };
  });
}

async function applyPagesV1(strapi: Core.Strapi): Promise<void> {
  if (await done(strapi, KOLLEC_MARKERS.pages)) return;
  const pdf = await charterPdf(strapi);
  if (!pdf) strapi.log.warn(`${TAG}: «${CHARTER_DOC_TITLE}» sənədinin faylı tapılmadı — Nizamnamə səhifəsində PDF keçidi yoxdur.`);
  await applySectionPages(strapi, {
    marker: KOLLEC_MARKERS.pages,
    tag: TAG,
    layout: KOLLEC_LAYOUT,
    backupPrefix: 'kollecPages',
    pages: withCharterPdf(KOLLEC_PAGES, pdf),
    dropIfUnassigned: [],
    source: 'src/utils/kollec-content.ts',
  });
  touched++;
}

// ── 2. Kollecə qəbul (/sehife/subbakalavr) ───────────────────────────────────
async function applyAdmissionV1(strapi: Core.Strapi): Promise<void> {
  if (await done(strapi, KOLLEC_MARKERS.admission)) return;
  const repo = q(strapi, PAGE_UID);
  const rows = await repo.findMany({
    where: { slug: ADMISSION_SLUG, locale: 'az' },
    select: ['id', 'documentId', 'lead', 'body', 'contact', 'updatedAt', 'publishedAt'],
    populate: { steps: true },
  });
  if (!rows.length) {
    strapi.log.warn(`${TAG}: /sehife/${ADMISSION_SLUG} yoxdur — qəbul mətni yazılmadı.`);
    await mark(strapi, KOLLEC_MARKERS.admission);
    return;
  }
  const applied = new Set<string>();
  const missed = new Set<string>();
  for (const r of rows) {
    const data: Row = {};
    for (const f of ADMISSION_FIXES) {
      const cur = typeof (data[f.field] ?? r[f.field]) === 'string' ? String(data[f.field] ?? r[f.field]) : '';
      const label = `${f.field}: «${f.find.replace(/\s+/g, ' ').trim().slice(0, 40)}…»`;
      const next = applyTextFix(cur, f.find, f.replace, f.doneIf ?? f.replace);
      if (next !== null) {
        data[f.field] = next;
        applied.add(label);
      } else if (!cur.includes(f.doneIf ?? f.replace)) missed.add(label);
    }
    if (Object.keys(data).length) await repo.updateMany({ where: { id: r.id }, data: { ...data, updatedAt: r.updatedAt } });
    // Eyni başlıqlı addım bir neçə yolda ola bilər (9 və 11 illik baza): düzəliş başlığın hər
    // addımına yoxlanılır, heç birində tətbiq olunmayıbsa — logda.
    for (const fix of ADMISSION_STEP_FIXES) {
      let ok = false;
      for (const s of list(r.steps).filter((x) => str(x.title) === fix.title)) {
        const body = typeof s.body === 'string' ? s.body : '';
        const next = applyTextFix(body, fix.find, fix.replace, fix.replace);
        if (next !== null) {
          await q(strapi, 'page.step').updateMany({ where: { id: s.id }, data: { body: next } });
          applied.add(`addım «${fix.title}»`);
          ok = true;
        } else if (body.includes(fix.replace)) ok = true;
      }
      if (!ok) missed.add(`addım «${fix.title}»`);
    }
  }

  // Yan keçidlər: kollecin bölməsi və «Təhsil və ixtisaslar» (keçid yoxdursa).
  const d = docs(strapi, PAGE_UID);
  const az = await d.findFirst({ locale: 'az', status: 'draft', filters: { slug: { $eq: ADMISSION_SLUG } }, populate: { sideLinks: true } });
  let links = 'yox';
  if (az) {
    const cur = list(az.sideLinks);
    const fresh = ADMISSION_SIDE_LINKS.filter((l) => !cur.some((c) => str(c.url) === l.url));
    if (fresh.length) {
      const documentId = str(az.documentId);
      const { published, pending } = await hasPendingDraft(d, documentId, az, 'az');
      await d.update({
        documentId,
        locale: 'az',
        data: { sideLinks: [...cur.map((l) => ({ id: l.id, label: l.label, url: l.url })), ...fresh.map((l) => ({ label: l.label, url: l.url }))] },
      });
      if (published && !pending) await d.publish({ documentId, locale: 'az' });
      links = `+${fresh.length}${published && pending ? ' (qaralama — dərc redaktorda)' : ''}`;
    }
  }
  await mark(strapi, KOLLEC_MARKERS.admission);
  if (applied.size || links !== 'yox') touched++;
  strapi.log.info(`${TAG}: /sehife/${ADMISSION_SLUG} — düzəliş: ${[...applied].join('; ') || 'yox'}; yan keçidlər: ${links}.`);
  if (missed.size) {
    strapi.log.warn(`${TAG}: /sehife/${ADMISSION_SLUG} — mətn admində dəyişib, tətbiq olunmadı (əl ilə): ${[...missed].join('; ')}. Mətn: src/utils/kollec-content.ts.`);
  }
}

// ── 3. Bölmə ─────────────────────────────────────────────────────────────────
/**
 * «Haqqında»: ünvansız şəkil yazısı («![ad]», ardınca «(» yoxdur) silinir — sətir boş qalırsa
 * sətir də (abzas sərhədi saxlanır: «![](url)![ad]» + boş sətir + mətn → «![](url)» + boş sətir +
 * mətn); alt mətni boş şəklə ad yazılır. Saf funksiya.
 */
export function fixUnitAbout(about: string, alt: string): string {
  if (!about) return about;
  const dangling = /!\[[^\]\n]*\](?![([])/g;
  const lines: string[] = [];
  for (const line of about.split('\n')) {
    const fixed = line.replace(dangling, '');
    if (fixed === line) lines.push(line);
    else if (fixed.trim()) lines.push(fixed.replace(/[ \t]+(\r?)$/, '$1'));
  }
  return lines.join('\n').replace(/!\[\]\((https?:[^)\s]+)\)/g, `![${alt}]($1)`);
}

async function applyUnitV1(strapi: Core.Strapi): Promise<void> {
  if (await done(strapi, KOLLEC_MARKERS.unit)) return;
  const repo = q(strapi, UNIT_UID);
  const all = await repo.findMany({
    where: { slug: KOLLEC_UNIT_SLUG },
    select: ['id', 'documentId', 'locale', 'about', 'establishedNote', 'phoneExt', 'building', 'email', 'updatedAt'],
  });
  const rows = all.filter((r) => str(r.locale) === 'az');
  if (!rows.length) {
    strapi.log.warn(`${TAG}: bölmə «${KOLLEC_UNIT_SLUG}» yoxdur.`);
    await mark(strapi, KOLLEC_MARKERS.unit);
    return;
  }
  const notes: string[] = [];
  let text = 0;
  const contact = new Set<string>();
  const azPhone = rows.map((r) => str(r.phoneExt)).find(Boolean) || KOLLEC_PHONES;
  const azEmail = rows.map((r) => str(r.email)).find(Boolean) || KOLLEC_EMAIL;
  for (const r of all) {
    const loc = str(r.locale) || 'az';
    const data: Row = {};
    if (loc === 'az') {
      const about = typeof r.about === 'string' ? r.about : '';
      const fixed = fixUnitAbout(about, UNIT_IMAGE_ALT);
      if (fixed !== about) data.about = fixed;
      if (str(r.establishedNote) === UNIT_ESTABLISHED.from) data.establishedNote = UNIT_ESTABLISHED.to;
      if (Object.keys(data).length) text++;
    }
    // Əlaqə — yalnız boş sahə (kollec-content.ts → UNIT_BUILDING).
    const fill: Row = {};
    if (!str(r.phoneExt)) fill.phoneExt = azPhone;
    if (!str(r.email)) fill.email = azEmail;
    if (!str(r.building) && UNIT_BUILDING[loc]) fill.building = UNIT_BUILDING[loc];
    if (Object.keys(fill).length) contact.add(loc);
    Object.assign(data, fill);
    if (Object.keys(data).length) await repo.updateMany({ where: { id: r.id }, data: { ...data, updatedAt: r.updatedAt } });
  }
  if (text) notes.push(`«Haqqında»/«Yaradılıb»: ${text} sətir`);
  if (contact.size) notes.push(`əlaqə (telefon, e-poçt, ünvan — boş sahələr): ${[...contact].join(', ')}`);

  // Faydalı linklər və rəhbər — Document Service (komponent, əlaqə), yalnız boşdursa.
  const d = docs(strapi, UNIT_UID);
  const documentId = str(rows[0].documentId);
  const az = await d.findOne({ documentId, locale: 'az', status: 'draft', populate: { links: true, head: { fields: ['documentId'] } } });
  if (az) {
    const data: Row = {};
    if (!list(az.links).length) data.links = UNIT_LINKS.map((l) => ({ label: l.label, url: l.url }));
    if (!az.head) {
      const head = await q(strapi, PERSON_UID).findOne({ where: { slug: UNIT_HEAD_SLUG }, select: ['documentId'] });
      if (head) data.head = str(head.documentId);
      else notes.push(`rəhbər «${UNIT_HEAD_SLUG}» tapılmadı`);
    }
    if (Object.keys(data).length) {
      // Dərc vəziyyəti YAZMADAN ƏVVƏL: `head` relSync ilə ru/en qaralamasına da yazılır (src/index.ts →
      // REL_SYNC) və sonra qaralama həmişə «daha yeni» görünərdi.
      const states: { loc: string; published: boolean; pending: boolean }[] = [];
      for (const loc of ['az', 'ru', 'en']) {
        const row = loc === 'az' ? az : await d.findOne({ documentId, locale: loc, status: 'draft' });
        if (row) states.push({ loc, ...(await hasPendingDraft(d, documentId, row, loc)) });
      }
      await d.update({ documentId, locale: 'az', data });
      for (const st of states) {
        if (st.published && !st.pending) await d.publish({ documentId, locale: st.loc });
        else if (st.pending) notes.push(`${st.loc}: dərc olunmamış redaktə var — yalnız qaralama`);
      }
      notes.push([data.links ? `faydalı linklər +${UNIT_LINKS.length}` : '', data.head ? `rəhbər — ${UNIT_HEAD_SLUG}` : ''].filter(Boolean).join(', '));
    }
  }
  await mark(strapi, KOLLEC_MARKERS.unit);
  if (notes.length) touched++;
  strapi.log.info(`${TAG}: bölmə — ${notes.filter(Boolean).join('; ') || 'dəyişiklik yoxdur'}.`);
}

// ── 4. İxtisaslar ────────────────────────────────────────────────────────────
async function applyProgramsV1(strapi: Core.Strapi): Promise<void> {
  if (await done(strapi, KOLLEC_MARKERS.programs)) return;
  const repo = q(strapi, PROGRAM_UID);
  const slugs = Object.values(PROGRAM_SLUG) as string[];
  const azRows = await repo.findMany({ where: { slug: { $in: slugs }, locale: 'az' }, select: ['documentId', 'slug'] });
  const slugByDoc = new Map(azRows.map((r) => [str(r.documentId), str(r.slug)]));
  const counts = { credits: 0, conventions: 0, scores: 0, faq: 0 };
  if (slugByDoc.size) {
    const rows = await repo.findMany({
      where: { documentId: { $in: [...slugByDoc.keys()] } },
      select: ['id', 'documentId', 'locale', 'degree', 'totalCredits', 'conventions', 'updatedAt'],
      populate: { admissionScores: true, faq: true },
    });
    for (const r of rows) {
      const slug = slugByDoc.get(str(r.documentId)) ?? '';
      const data: Row = {};
      if (r.totalCredits === null || r.totalCredits === undefined) {
        data.totalCredits = PROGRAM_CREDITS;
        counts.credits++;
      }
      if (str(r.locale) === 'az' && !str(r.conventions) && PROGRAM_CONVENTIONS[slug]) {
        data.conventions = PROGRAM_CONVENTIONS[slug];
        counts.conventions++;
      }
      if (Object.keys(data).length) await repo.updateMany({ where: { id: r.id }, data: { ...data, updatedAt: r.updatedAt } });
      if (str(r.degree) === 'subbachelor') {
        for (const s of list(r.admissionScores)) {
          const d: Row = {};
          for (const f of ['minScorePaid', 'minScoreFree']) {
            const fixed = normalizeScore(s[f], SUBBACHELOR_SCORE_MAX);
            if (fixed !== s[f] && typeof fixed === 'number' && Number(s[f]) !== fixed) d[f] = fixed;
          }
          if (Object.keys(d).length) {
            await q(strapi, 'program.admission-score').updateMany({ where: { id: s.id }, data: d });
            counts.scores++;
          }
        }
      }
      for (const it of list(r.faq)) {
        if (str(it.question) === PROGRAM_FAQ_FIX.question && str(it.answer) === PROGRAM_FAQ_FIX.from) {
          await q(strapi, 'unit.faq').updateMany({ where: { id: it.id }, data: { answer: PROGRAM_FAQ_FIX.to } });
          counts.faq++;
        }
      }
    }
  }
  await mark(strapi, KOLLEC_MARKERS.programs);
  if (counts.credits + counts.conventions + counts.scores + counts.faq) touched++;
  strapi.log.info(
    `${TAG}: ixtisaslar (${slugByDoc.size}/${slugs.length}) — AKTS ${counts.credits}, konvensiyalar ${counts.conventions}, ` +
      `qəbul balı (300 ballıq) ${counts.scores}, sual cavabı ${counts.faq} sətir.`,
  );
}

// ── 5. Sənədlər ──────────────────────────────────────────────────────────────
async function applyDocsV1(strapi: Core.Strapi): Promise<void> {
  if (await done(strapi, KOLLEC_MARKERS.docs)) return;
  const d = docs(strapi, DOC_UID);
  const units = await unitTargets(strapi, [KOLLEC_UNIT_SLUG]);
  const out: string[] = [];
  const missing: string[] = [];
  for (const fx of KOLLEC_DOCS) {
    const rows = await d.findMany({
      status: 'draft',
      filters: { title: { $in: [fx.title, ...(fx.newTitle ? [fx.newTitle] : [])] } },
      populate: { units: { fields: ['slug'] } },
      limit: 5,
    });
    if (!rows.length) {
      missing.push(fx.title);
      continue;
    }
    for (const r of rows) {
      const data: Row = {};
      if (fx.newTitle && str(r.title) === fx.title) data.title = fx.newTitle;
      if (!str(r.category) || str(r.category) === 'diger') data.category = fx.category;
      if (r.year === null || r.year === undefined) data.year = fx.year;
      if (!str(r.description)) data.description = fx.description;
      if (fx.url && !str(r.url)) data.url = fx.url;
      if (fx.linkUnit && !list(r.units).some((u) => str(u.slug) === KOLLEC_UNIT_SLUG) && units.length) data.units = { connect: units };
      if (!Object.keys(data).length) continue;
      const documentId = str(r.documentId);
      const { published, pending } = await hasPendingDraft(d, documentId, r);
      await d.update({ documentId, data });
      if (published && !pending) await d.publish({ documentId });
      out.push(`«${str(data.title) || str(r.title)}»${published && pending ? ' (qaralama — dərc redaktorda)' : ''}`);
    }
  }
  await mark(strapi, KOLLEC_MARKERS.docs);
  if (out.length) touched++;
  strapi.log.info(`${TAG}: sənədlər — yeniləndi ${out.length}: ${out.join(', ') || 'yox'}${missing.length ? `; tapılmadı: ${missing.join(', ')}` : ''}.`);
}

// ── 6. Əməkdaşlar ────────────────────────────────────────────────────────────
interface RoleRow {
  staffType: string;
  position: string;
  unitName: string | null;
  sortOrder: number;
}
const roleOf = (r: Row, i: number): RoleRow => ({
  staffType: str(r.staffType) || 'diger',
  position: str(r.position),
  unitName: str(r.unitName) || null,
  sortOrder: typeof r.sortOrder === 'number' ? r.sortOrder : i,
});
const posKey = (s: string) => nameKey(s);

/** Vəzifələr: əsas + əlavə (bu bölmə üçün). Saf funksiya — sınaq üçün ixrac. */
export function planRoles(cur: Row[], seed: KollecStaffSeed, position: string, staffType: string): RoleRow[] | null {
  if (!seed.extra?.length) {
    // Yalnız mövcud rolun yazılışı (positionFrom) düzəlir.
    if (!cur.length) return null;
    let changed = false;
    const next = cur.map((r, i) => {
      const x = roleOf(r, i);
      if ((seed.positionFrom ?? []).includes(x.position) && x.position !== position) {
        changed = true;
        return { ...x, position };
      }
      return x;
    });
    return changed ? next : null;
  }
  const wanted: RoleRow[] = [
    { staffType, position, unitName: KOLLEC_UNIT_NAME, sortOrder: 0 },
    ...seed.extra.map((e, i) => ({ staffType: e.staffType, position: e.position, unitName: KOLLEC_UNIT_NAME, sortOrder: i + 1 })),
  ];
  const own = new Set([position, ...(seed.positionFrom ?? [])].map(posKey));
  const rest = cur.map(roleOf).filter((x) => !own.has(posKey(x.position)) && !wanted.some((w) => posKey(w.position) === posKey(x.position)));
  const next = [...wanted, ...rest.map((x, i) => ({ ...x, sortOrder: wanted.length + i }))];
  const same =
    next.length === cur.length &&
    next.every((x, i) => {
      const c = roleOf(cur[i], i);
      return c.position === x.position && c.staffType === x.staffType && c.unitName === x.unitName;
    });
  return same ? null : next;
}

const teachingMd = (items: string[]): string => items.map((t) => `- ${t}`).join('\n');

function uniqueSlug(base: string, taken: Set<string>): string {
  let s = base || 'emekdas';
  for (let n = 2; taken.has(s); n++) s = `${base}-${n}`;
  taken.add(s);
  return s;
}

async function applyStaffV1(strapi: Core.Strapi, seeds: KollecStaffSeed[] = KOLLEC_STAFF): Promise<number> {
  if (await done(strapi, KOLLEC_MARKERS.staff)) return 0;
  const d = docs(strapi, PERSON_UID);
  const all: Row[] = [];
  for (let start = 0; start < 5000; start += 200) {
    const rows = await d.findMany({ status: 'draft', populate: { roles: true, unit: { fields: ['documentId', 'slug'] } }, start, limit: 200 });
    all.push(...rows);
    if (rows.length < 200) break;
  }
  const bySlug = new Map(all.map((p) => [str(p.slug), p]));
  const taken = new Set(all.map((p) => str(p.slug)));
  const unit = await q(strapi, UNIT_UID).findOne({ where: { slug: KOLLEC_UNIT_SLUG, locale: 'az' }, select: ['documentId'] });
  const unitId = unit ? str(unit.documentId) : '';
  const notes: string[] = [];
  const count = { updated: 0, created: 0, name: 0, post: 0 };
  let failed = 0;

  for (const seed of seeds) {
    const who = seed.fullName;
    try {
      const cur = seed.slug ? bySlug.get(seed.slug) : all.find((p) => nameKey(str(p.name)) === nameKey(who));
      if (!cur && seed.slug) {
        notes.push(`${who}: «${seed.slug}» saytda yoxdur — yazılmadı`);
        continue;
      }
      if (!cur) {
        // Yeni əməkdaş.
        if (!unitId) throw new Error('kollec bölməsi tapılmadı');
        const data: Row = {
          name: who,
          displayName: displayNameOf(who),
          slug: uniqueSlug(azSlug(who), taken),
          position: seed.position,
          staffType: seed.staffType,
          unit: unitId,
        };
        if (seed.teaching?.length) data.teaching = teachingMd(seed.teaching);
        if (seed.extra?.length) data.roles = planRoles([], seed, seed.position, seed.staffType) ?? [];
        const doc = await d.create({ data });
        await d.publish({ documentId: str(doc.documentId) });
        count.created++;
        continue;
      }

      const documentId = str(cur.documentId);
      const patch: Row = {};
      // Ad: ştatdakı tam ad (ünvan dəyişmir). Saytda fərqli yazılıbsa (keepName) — logda.
      const name = str(cur.name);
      if (seed.keepName) {
        if (nameKey(name) !== nameKey(who)) notes.push(`${who}: saytda «${name}» — ad dəyişmədi (soyadın yazılışını admində yoxlayın)`);
      } else if (name !== who) {
        patch.name = who;
        const dn = str(cur.displayName);
        if (!dn || nameCompletes(dn, who) || nameKey(dn) === nameKey(name)) patch.displayName = displayNameOf(who);
        count.name++;
      }
      // Vəzifə: yalnız admin yazılışı gözlənilən kimidirsə.
      const pos = str(cur.position);
      let position = pos;
      if (pos !== seed.position) {
        if ((seed.positionFrom ?? []).includes(pos) || !pos) {
          patch.position = seed.position;
          position = seed.position;
          count.post++;
        } else notes.push(`${who}: saytda vəzifə «${pos}», ştatda «${seed.position}» — toxunulmadı`);
      }
      if (!str(cur.staffType)) patch.staffType = seed.staffType;
      const roles = planRoles(list(cur.roles), seed, position, str(cur.staffType) || seed.staffType);
      if (roles) patch.roles = roles;
      if (seed.teaching?.length && !str(cur.teaching)) patch.teaching = teachingMd(seed.teaching);
      if (!cur.unit && unitId) patch.unit = unitId;
      if (!Object.keys(patch).length) continue;
      const { published, pending } = await hasPendingDraft(d, documentId, cur);
      await d.update({ documentId, data: patch });
      if (published && !pending) await d.publish({ documentId });
      if (pending) notes.push(`${who}: dərc olunmamış redaktə var — yalnız qaralamaya yazıldı`);
      count.updated++;
    } catch (e) {
      failed++;
      notes.push(`${who}: XƏTA — ${(e as Error).message}`);
    }
  }
  for (const slug of KOLLEC_NOT_IN_STAFF) {
    const p = bySlug.get(slug);
    if (p) notes.push(`${str(p.name)} (${str(p.position)}): ştat cədvəlində yoxdur — toxunulmadı, admində yoxlayın`);
  }
  if (!failed) await mark(strapi, KOLLEC_MARKERS.staff);
  if (count.updated + count.created) touched++;
  strapi.log.info(
    `${TAG}: əməkdaşlar — yeniləndi ${count.updated} (ad ${count.name}, vəzifə ${count.post}), yeni ${count.created}` +
      (failed ? `; ${failed} xəta — marker yazılmadı, növbəti başlanğıcda yenidən` : '') +
      '.',
  );
  for (const n of notes) strapi.log.warn(`${TAG}: ${n}`);
  return count.updated + count.created;
}

// ── 7. Üst menyu ─────────────────────────────────────────────────────────────
const keepLink = (l: Row): Row => ({ id: l.id, label: l.label, url: l.url });

/** Saf funksiya (sınaq üçün): «Kollec» bölməsinin yeni vəziyyəti. */
export function planKollecMenu(menu: Row): { data: Row | null; note: string } {
  const ust = list(menu.ustMenyu);
  const idx = ust.findIndex((c) => str(c.label) === MENU_CATEGORY);
  if (idx < 0) return { data: null, note: 'üst menyuda «Kollec» yoxdur — toxunulmadı' };
  const links = list(ust[idx].groups).flatMap((g) => list(g.links));
  if (!links.every((l) => MENU_OLD_URLS.includes(str(l.url)))) {
    return { data: null, note: '«Kollec» admində dəyişib — toxunulmadı (yeni keçidlər: src/utils/kollec-content.ts → KOLLEC_MENU)' };
  }
  const data: Row = {
    ustMenyu: ust.map((c, i) =>
      i !== idx
        ? { id: c.id, label: c.label, order: c.order, url: c.url, groups: list(c.groups).map((g) => ({ id: g.id, title: g.title, links: list(g.links).map(keepLink) })) }
        : {
            id: c.id,
            label: c.label,
            order: c.order,
            // Başlığın özü yer tutandırsa («#») — kollecin bölmə səhifəsi.
            url: !str(c.url) || str(c.url) === '#' ? KOLLEC_MENU_URL : c.url,
            groups: KOLLEC_MENU.map((g) => ({ title: g.title, links: g.links.map((l) => ({ label: l.label, url: l.url })) })),
          },
    ),
  };
  return { data, note: `«Kollec»: ${links.length} yer tutan keçid → ${KOLLEC_MENU.length} qrup, ${KOLLEC_MENU.reduce((n, g) => n + g.links.length, 0)} keçid` };
}

async function applyMenuV1(strapi: Core.Strapi): Promise<void> {
  if (await done(strapi, KOLLEC_MARKERS.menu)) return;
  const d = strapi.documents('api::menu.menu' as never) as unknown as {
    findFirst: (a: Row) => Promise<Row | null>;
    update: (a: Row) => Promise<Row>;
  };
  const menu = await d.findFirst({
    populate: {
      esasMenyu: { populate: { groups: { populate: { links: true } } } },
      ustMenyu: { populate: { groups: { populate: { links: true } } } },
    },
  });
  if (!menu) {
    strapi.log.warn(`${TAG}: menyu tapılmadı.`);
    return;
  }
  const { data, note } = planKollecMenu(menu);
  if (data) await d.update({ documentId: menu.documentId, data });
  let dropped = 0;
  if (data) {
    const owners = q(strapi, OWNER_UID);
    for (const r of await owners.findMany({ where: { key: { $in: MENU_DROP_OWNERS } } })) {
      if (r.editorId !== null && r.editorId !== undefined && r.editorId !== '') continue;
      await owners.delete({ where: { id: r.id } });
      dropped++;
    }
  }
  await mark(strapi, KOLLEC_MARKERS.menu);
  if (data) touched++;
  strapi.log.info(`${TAG}: menyu — ${note}${dropped ? `; «Məsul redaktorlar»-dan çıxan yer tutan: ${dropped}` : ''}.`);
}

// ── Zəncir ───────────────────────────────────────────────────────────────────
export async function applyKollecF560(strapi: Core.Strapi): Promise<void> {
  touched = 0;
  const run = async (name: string, fn: () => Promise<unknown>): Promise<void> => {
    try {
      await fn();
    } catch (e) {
      strapi.log.error(`${TAG}: ${name}: ${(e as Error).message}`);
    }
  };
  await run('səhifələr', () => applyPagesV1(strapi));
  await run('qəbul səhifəsi', () => applyAdmissionV1(strapi));
  await run('bölmə', () => applyUnitV1(strapi));
  await run('ixtisaslar', () => applyProgramsV1(strapi));
  await run('sənədlər', () => applyDocsV1(strapi));
  await run('əməkdaşlar', () => applyStaffV1(strapi));
  await run('menyu', () => applyMenuV1(strapi));
  // Birbaşa bazaya yazılan mətnlər Document Service-dən keçmir — sayta ayrıca xəbər.
  if (touched) {
    markSearchDirty();
    requestSiteRevalidate(strapi, 'kollec');
  }
}

/** Sınaq üçün: ayrı-ayrı addımlar. */
export const __kollec = { applyPagesV1, applyAdmissionV1, applyUnitV1, applyProgramsV1, applyDocsV1, applyStaffV1, applyMenuV1 };
export type { StaffType };
