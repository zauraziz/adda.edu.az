/**
 * F5.43 — saytda eyni məlumatın iki yerdə olması (təkrarlar).
 *
 * Prod-da tapılanlar (8 oktyabr 2026) və burada BİR DƏFƏ (store `adda-admin` →
 * `dedupe:v1`) görülən iş:
 *   1. Səhifə ↔ struktur bölmə (src/utils/moved-pages.ts): rektor və Elmi Şura
 *      həm /sehife/x, həm /struktur/x idi; elmi katib, rektorun köməkçisi və iki
 *      prorektor üçün köhnə saytın ru/en tərcümeyi-halı səhifələri dərcdə
 *      qalmışdı (az versiyaları çoxdan çıxarılıb, ikisi KÖHNƏ prorektora aiddir).
 *        - copy: true olanların mətni bölmənin BOŞ «Haqqında»-sına köçür
 *          (dil üzrə; bölmədə mətn varsa toxunulmur): daxili keçidlər yeni
 *          ünvana, olmayan səhifəyə keçid sətri atılır, başlıqlar bir pillə
 *          aşağı (bölmə səhifəsində blok başlığı artıq h2-dir);
 *        - səhifələr dərcdən çıxarılır (qaralama qalır — silinmir);
 *        - «Məsul redaktor»: page:<səhifə> → unit:<bölmə>.
 *   2. Menyu və digər keçid komponentləri (nav.*): köçmüş səhifəyə gedən
 *      keçidlər birbaşa yeni ünvana (yönləndirmə zənciri olmasın), həmçinin
 *      F5.21d/F5.30a-dan qalan /sehife/elaqe və /sehife/qehremanlarimiz.
 *   3. Xəbər təkrarları: redaktor 7 iyulda 3 xəbəri əl ilə yaradıb («article»,
 *      «article-1», «article-3» — başlıqsız yaranmış slug), 27 iyulda köhnə
 *      saytdan eyniləri idxal olunub. Ümumi slug-lı nüsxə dərcdən çıxarılır —
 *      YALNIZ eyni dildə eyni başlıqlı, mətni ≥90% eyni dərc olunmuş əkizi
 *      varsa. Köhnə saytın ünvanları idxal olunmuş nüsxəyə yönlənir.
 *   4. Köhnə «Kafedra» (department) bölməsi — admində «(arxiv)» qeydi (7
 *      oktyabrda redaktor kafedra mətnini səhvən ora yazıb; sayt onu artıq
 *      göstərmir — bax struktur səhifəsi və axtarış).
 */
import type { Core } from '@strapi/strapi';
import { PAGE_UNIT_MOVES, movedPageTarget } from './moved-pages';

type Row = Record<string, unknown>;

const MARKER = 'dedupe:v1';
const PAGE_UID = 'api::page.page';
const UNIT_UID = 'api::unit.unit';
const OWNER_UID = 'api::page-owner.page-owner';
const DEPARTMENT_UID = 'api::department.department';
const LOCALES = ['az', 'ru', 'en'] as const;
/** Menyu və keçid komponentləri — hamısında `url` sahəsi var. */
const NAV_COMPONENTS = ['nav.link', 'nav.quicklink', 'nav.portalcard', 'nav.category'];
/** Başlıqsız yaradılanda Strapi-nin verdiyi slug: «article», «article-3». */
const GENERIC_SLUG: Record<string, RegExp> = {
  'api::article.article': /^article(?:-\d+)?$/,
  'api::announcement.announcement': /^announcement(?:-\d+)?$/,
  'api::event.event': /^event(?:-\d+)?$/,
};

/** cm-az.ts v1 qaydası — admin öz mətnini yazmayıbsa əvəzlənir. */
const OLD_DEPARTMENT_HINT = 'Köhnə «Kafedra» bölməsi. Yeni kafedra məlumatı «Struktur bölmə»-yə yazılır.';
export const DEPARTMENT_ARCHIVE_NOTE =
  'ARXİV: bu qeyd saytda göstərilmir və axtarışda çıxmır. Kafedra, şöbə və mərkəzin səhifəsi — ' +
  '«2. Akademiya — Struktur bölmə» (ünvan /struktur/<slug>). Yeni mətni orada yazın.';

const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const blank = (v: unknown): boolean => !str(v).trim();

type Q = {
  findMany: (a?: Row) => Promise<Row[]>;
  findOne: (a: Row) => Promise<Row | null>;
  update: (a: Row) => Promise<Row>;
  delete: (a: Row) => Promise<Row>;
};
const q = (strapi: Core.Strapi, uid: string): Q => strapi.db.query(uid as never) as unknown as Q;

type Docs = { unpublish: (a: Row) => Promise<unknown> };
const docs = (strapi: Core.Strapi, uid: string): Docs => strapi.documents(uid as never) as unknown as Docs;

// ── 1. Səhifə → bölmə ────────────────────────────────────────────────────────

/** /sehife/x keçidini yeni ünvana çevir; olmayan səhifəyə keçid sətrini at; başlıqlar bir pillə aşağı. */
export function adaptPageBody(raw: string, livePages: Set<string>): string {
  const kept = str(raw)
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .filter((line) => {
      const m = /^\s*[-*+]\s.*\]\(\/sehife\/([^)#?\s]+)[^)]*\)/.exec(line);
      return !m || livePages.has(m[1]) || movedPageTarget(m[1]) !== null;
    });
  return kept
    .join('\n')
    .replace(/\]\(\/sehife\/([^)#?\s]+)([^)]*)\)/g, (all, slug: string, rest: string) => {
      const target = movedPageTarget(slug);
      return target ? `](${target}${rest})` : all;
    })
    .replace(/^(\s*(?:>\s*)*)(#{1,5})(?=\s)/gm, (_m, pre: string, hashes: string) => `${pre}#${hashes}`)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Dərc olunmuş (hər hansı dildə) və köçməmiş səhifələrin slug-ları. */
async function livePageSlugs(strapi: Core.Strapi): Promise<Set<string>> {
  const rows = await q(strapi, PAGE_UID).findMany({ where: { publishedAt: { $notNull: true } }, select: ['slug'] });
  return new Set(rows.map((r) => str(r.slug)).filter((s) => s && movedPageTarget(s) === null));
}

/** copy: true — səhifə mətni bölmənin boş «Haqqında»-sına. Qaytarır: «bölmə (dil)». */
async function copyBodies(strapi: Core.Strapi): Promise<string[]> {
  const live = await livePageSlugs(strapi);
  const done: string[] = [];
  for (const m of PAGE_UNIT_MOVES.filter((x) => x.copy)) {
    for (const locale of LOCALES) {
      const page = await q(strapi, PAGE_UID).findOne({
        where: { slug: m.page, locale, publishedAt: { $notNull: true } },
        select: ['body'],
      });
      if (!page || blank(page.body)) continue;
      const units = await q(strapi, UNIT_UID).findMany({ where: { slug: m.unit, locale }, select: ['id', 'about'] });
      // Bölmə yoxdursa və ya hər hansı versiyada mətn varsa — redaktorun yazdığına toxunulmur.
      if (!units.length || units.some((u) => !blank(u.about))) continue;
      const text = adaptPageBody(str(page.body), live);
      if (!text) continue;
      for (const u of units) await q(strapi, UNIT_UID).update({ where: { id: u.id }, data: { about: text } });
      done.push(`${m.unit} (${locale})`);
    }
  }
  return done;
}

/** Köçmüş səhifələr dərcdən çıxır (bütün dillər). Qaytarır: «səhifə (dil)». */
async function unpublishMoved(strapi: Core.Strapi): Promise<string[]> {
  const done: string[] = [];
  for (const m of PAGE_UNIT_MOVES) {
    const rows = await q(strapi, PAGE_UID).findMany({
      where: { slug: m.page, publishedAt: { $notNull: true } },
      select: ['documentId', 'locale'],
    });
    for (const r of rows) {
      await docs(strapi, PAGE_UID).unpublish({ documentId: r.documentId, locale: r.locale });
      done.push(`${m.page} (${str(r.locale)})`);
    }
  }
  return done;
}

/** page:<səhifə> → unit:<bölmə>. Bölmənin öz təyinatı varsa o qalır. */
async function moveOwners(strapi: Core.Strapi): Promise<number> {
  const repo = q(strapi, OWNER_UID);
  let moved = 0;
  for (const m of PAGE_UNIT_MOVES) {
    const from = await repo.findOne({ where: { key: `page:${m.page}` } });
    if (!from) continue;
    const key = `unit:${m.unit}`;
    const target = await repo.findOne({ where: { key } });
    if (!target) {
      await repo.update({ where: { id: from.id }, data: { key, path: `/struktur/${m.unit}` } });
      moved++;
      continue;
    }
    if (target.editorId == null && from.editorId != null) {
      await repo.update({
        where: { id: target.id },
        data: {
          editorId: from.editorId,
          assignedById: from.assignedById ?? null,
          assignedAt: from.assignedAt ?? null,
          notifiedAt: from.notifiedAt ?? null,
        },
      });
      moved++;
    }
    await repo.delete({ where: { id: from.id } });
  }
  return moved;
}

// ── 2. Keçidlər ──────────────────────────────────────────────────────────────

/** «/sehife/rektor», «/az/sehife/rektor#x» → yeni ünvan (prefiks və # saxlanılır); dəyişmirsə null. */
export function rewriteUrl(url: string): string | null {
  const m = /^(\/(?:az|ru|en))?\/sehife\/([^/?#\s]+)\/?([?#].*)?$/.exec(url.trim());
  if (!m) return null;
  const target = movedPageTarget(m[2]);
  return target ? `${m[1] ?? ''}${target}${m[3] ?? ''}` : null;
}

async function rewriteLinks(strapi: Core.Strapi): Promise<string[]> {
  const done: string[] = [];
  for (const uid of NAV_COMPONENTS) {
    if (!strapi.components[uid as keyof typeof strapi.components]) continue;
    const rows = await q(strapi, uid).findMany({ where: { url: { $contains: '/sehife/' } }, select: ['id', 'url'] });
    for (const r of rows) {
      const next = rewriteUrl(str(r.url));
      if (!next) continue;
      await q(strapi, uid).update({ where: { id: r.id }, data: { url: next } });
      done.push(`${str(r.url)} → ${next}`);
    }
  }
  return done;
}

// ── 3. Xəbər təkrarları ──────────────────────────────────────────────────────

const norm = (s: unknown): string =>
  str(s)
    .toLocaleLowerCase('az')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

function shingles(s: unknown): Set<string> {
  const w = norm(s).split(' ').filter(Boolean);
  const out = new Set<string>();
  for (let i = 0; i + 5 <= w.length; i++) out.add(w.slice(i, i + 5).join(' '));
  return out;
}

/** Kiçik çoxluğun neçə faizi böyükdə var (0..1). */
export function overlap(a: unknown, b: unknown): number {
  const x = shingles(a);
  const y = shingles(b);
  if (!x.size || !y.size) return norm(a) === norm(b) && norm(a) ? 1 : 0;
  const [small, big] = x.size <= y.size ? [x, y] : [y, x];
  let n = 0;
  for (const s of small) if (big.has(s)) n++;
  return n / small.size;
}

async function unpublishNewsTwins(strapi: Core.Strapi): Promise<string[]> {
  const done: string[] = [];
  for (const [uid, generic] of Object.entries(GENERIC_SLUG)) {
    if (!strapi.contentTypes[uid as keyof typeof strapi.contentTypes]) continue;
    const pub = await q(strapi, uid).findMany({
      where: { publishedAt: { $notNull: true } },
      select: ['documentId', 'locale', 'slug', 'title', 'body'],
    });
    for (const g of pub.filter((r) => generic.test(str(r.slug)))) {
      const twin = pub.find(
        (o) =>
          o.documentId !== g.documentId &&
          o.locale === g.locale &&
          !generic.test(str(o.slug)) &&
          norm(o.title) === norm(g.title) &&
          overlap(o.body, g.body) >= 0.9,
      );
      if (!twin) continue;
      await docs(strapi, uid).unpublish({ documentId: g.documentId, locale: g.locale });
      done.push(`${str(g.slug)} = ${str(twin.slug)} (${str(g.locale)})`);
    }
  }
  return done;
}

// ── 4. Köhnə «Kafedra» — admin qeydi ─────────────────────────────────────────

async function markDepartmentArchive(strapi: Core.Strapi): Promise<boolean> {
  type Conf = { settings: Row; metadatas: Record<string, { edit?: Row }>; layouts: Row };
  const cts = strapi.plugin('content-manager').service('content-types') as unknown as {
    findContentType: (uid: string) => { uid: string } | null;
    findConfiguration: (ct: { uid: string }) => Promise<Conf>;
    updateConfiguration: (ct: { uid: string }, conf: Conf) => Promise<unknown>;
  };
  const ct = cts.findContentType(DEPARTMENT_UID);
  if (!ct) return false;
  const conf = await cts.findConfiguration(ct);
  const edit = conf.metadatas?.name?.edit;
  if (!edit) return false;
  const old = str(edit.description);
  if (old && old !== OLD_DEPARTMENT_HINT && !old.startsWith('ARXİV')) return false; // admin öz qeydini yazıb
  edit.description = DEPARTMENT_ARCHIVE_NOTE;
  await cts.updateConfiguration(ct, { settings: conf.settings, metadatas: conf.metadatas, layouts: conf.layouts });
  return true;
}

export async function applyDedupeV1(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: MARKER })) === true) return;

  const copied = await copyBodies(strapi);
  const unpublished = await unpublishMoved(strapi);
  const owners = await moveOwners(strapi);
  const links = await rewriteLinks(strapi);
  const news = await unpublishNewsTwins(strapi);
  const archive = await markDepartmentArchive(strapi).catch((e: Error) => {
    strapi.log.warn('[tekrar] F5.43: kafedra arxiv qeydi yazılmadı: ' + e.message);
    return false;
  });
  await store.set({ key: MARKER, value: true });
  const list = (a: string[]): string => (a.length ? `${a.length} (${a.join('; ')})` : '0');
  strapi.log.info(
    `[tekrar] F5.43: səhifə → bölmə mətni: ${list(copied)}; dərcdən çıxan səhifə: ${list(unpublished)}; ` +
      `məsul redaktor: ${owners}; keçid: ${list(links)}; təkrar xəbər dərcdən çıxdı: ${list(news)}; ` +
      `kafedra arxiv qeydi: ${archive ? 'bəli' : 'xeyr'}.`,
  );
}
