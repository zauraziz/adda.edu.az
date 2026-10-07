/**
 * F5.41 — fakültənin YEGANƏ səhifəsi /struktur/<slug>-dir (2. Akademiya —
 * Struktur bölmə, `unit`).
 *
 * Əvvəl eyni fakültənin iki səhifəsi var idi: /fakulteler/<slug> («2. Akademiya
 * — Fakültə» qeydindən) və /struktur/<slug> (bölmədən). Slug-lar qəsdən eynidir
 * (F5.6). Detal səhifəsi Next.js-dən silindi, köhnə ünvan 301 ilə
 * /struktur/<slug>-a gedir; /fakulteler siyahısı qalır, amma bölmələrdən
 * qurulur (kafedralar səhifəsinin nümunəsi).
 *
 * BİR DƏFƏ (store `adda-admin` → `facultyUnits:v1`), bootstrap-da, portu
 * bloklamadan:
 *   1. Fakültənin «Haqqında» mətni eyni slug/dildəki bölməyə köçürülür —
 *      YALNIZ bölmədə (qaralama da daxil) boşdursa. Redaktorun yazdığına
 *      toxunulmur. Köhnə saytdan gələn tör-töküntü təmizlənir: təkrar başlıq,
 *      dekan bloku (bölmə səhifəsində «Rəhbər» kartı var), sınıq Cloudflare
 *      e-poçtu, kod blokuna çevrilən girintilər.
 *   2. «Məsul redaktor» təyinatları: faculty:<slug> → unit:<slug>.
 *   3. Kopilot indeksi: fakültə parçalarının ünvanı /fakulteler/ → /struktur/.
 *   4. Admin: fakültə qeydinin «Adı» sahəsinin altında arxiv qeydi.
 *
 * «2. Akademiya — Fakültə» SİLİNMİR: proqram/xəbər/heyət əlaqələri ona
 * bağlıdır, kopilot hələ onun mətnini oxuyur, redaktor oradan mətn köçürə
 * bilsin. Admin menyusunda «(arxiv)» adlanır (schema.json).
 */
import type { Core } from '@strapi/strapi';

type Row = Record<string, unknown>;

const MARKER = 'facultyUnits:v1';
const FACULTY_UID = 'api::faculty.faculty';
const UNIT_UID = 'api::unit.unit';
const OWNER_UID = 'api::page-owner.page-owner';
const RAG_TABLE = 'rag_chunks';

/** cm-az.ts-in əvvəlki qaydası — admin öz mətnini yazmayıbsa əvəzlənir. */
const OLD_NAME_HINT = 'Rəsmi ad: «Gəmi mexanikası fakültəsi».';
export const FACULTY_ARCHIVE_NOTE =
  'ARXİV: bu qeyd saytda göstərilmir. Fakültənin səhifəsi — «2. Akademiya — Struktur bölmə» ' +
  '(eyni ad, ünvan /struktur/<slug>). Mətni orada yazın.';

const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const blank = (v: unknown): boolean => !str(v).trim();
const letters = (s: string): string => s.replace(/[^\p{L}]/gu, '');

/** Dekan bloku (foto, ad, dərəcə, telefon, e-poçt) — köhnə saytda mətnin sonunda. */
const DEAN_RE = /^[ \t]*\**[ \t]*(?:Fakültənin dekanı|Dean of the faculty|Декан факультета)/im;
/** Dekanın portreti — blokdan dərhal əvvəl, bəzən «**…**» içində. */
const IMAGE_AT_END_RE = /\**!\[[^\]]*\]\([^)]*\)\**$/;

/** Başlıq sətri təkrarı: «**“GƏMİ …” FAKÜLTƏSİ**» və ya fakültənin adı. */
function isTitleLine(line: string, name: string): boolean {
  const t = line.trim();
  const l = letters(t);
  if (!l) return false;
  if (name && l.toLocaleLowerCase('az') === letters(name).toLocaleLowerCase('az')) return true;
  return /^\*\*.+\*\*$/.test(t) && l.length >= 6 && l === l.toLocaleUpperCase('az');
}

/** Köhnə fakültə mətnini bölmə səhifəsi üçün təmizlə. */
export function cleanFacultyAbout(raw: string, name = ''): string {
  let s = str(raw).replace(/\r\n?/g, '\n');
  const dean = s.search(DEAN_RE);
  // Yalnız sondakı qısa əlaqə bloku kəsilir — ortadakı mətnə toxunulmur.
  if (dean >= 0 && s.length - dean < 600) {
    s = s.slice(0, dean).replace(/\s+$/, '').replace(IMAGE_AT_END_RE, '');
  }
  // 4+ boşluqla başlayan sətir Markdown-da kod blokudur («**BAKALAVRİAT:**»).
  const lines = s
    .split('\n')
    .map((l) => l.replace(/^[ \t]+|[ \t]+$/g, ''))
    .filter((l) => !l.includes('cdn-cgi/l/email-protection'));
  const first = lines.findIndex((l) => l !== '');
  if (first >= 0 && isTitleLine(lines[first], name)) lines.splice(first, 1);
  return lines
    .join('\n')
    .replace(/\*{4}/g, '') // «**MAGISTRATURA****:**»
    // Boşluqlu ünvan Markdown-da şəkil/keçid sayılmır (köhnə sayt: «/uploads/1 a …/x.jpg»).
    .replace(/(!?\[[^\]]*\]\()([^)"']*)\)/g, (_m, pre: string, url: string) => `${pre}${url.trim().replace(/ /g, '%20')})`)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

type Q = {
  findMany: (a?: Row) => Promise<Row[]>;
  findOne: (a: Row) => Promise<Row | null>;
  update: (a: Row) => Promise<Row>;
  delete: (a: Row) => Promise<Row>;
};
const q = (strapi: Core.Strapi, uid: string): Q => strapi.db.query(uid as never) as unknown as Q;

/** 1. Fakültə mətni → boş bölmə. Qaytarır: «slug (dil)» siyahısı. */
async function copyAbout(strapi: Core.Strapi): Promise<string[]> {
  const rows = await q(strapi, FACULTY_UID).findMany({ select: ['slug', 'locale', 'name', 'about', 'publishedAt'] });
  // slug + dil → mənbə; dərc olunmuş versiya qaralamadan üstündür.
  const src = new Map<string, Row>();
  for (const r of rows) {
    if (blank(r.about) || blank(r.slug) || blank(r.locale)) continue;
    const k = `${str(r.slug)}|${str(r.locale)}`;
    if (r.publishedAt || !src.has(k)) src.set(k, r);
  }
  const done: string[] = [];
  for (const [k, r] of src) {
    const [slug, locale] = k.split('|');
    const units = await q(strapi, UNIT_UID).findMany({ where: { slug, locale }, select: ['id', 'name', 'about'] });
    // Bölmə yoxdursa və ya hər hansı versiyada mətn varsa — toxunulmur.
    if (!units.length || units.some((u) => !blank(u.about))) continue;
    const text = cleanFacultyAbout(str(r.about), str(units[0].name) || str(r.name));
    if (!text) continue;
    for (const u of units) await q(strapi, UNIT_UID).update({ where: { id: u.id }, data: { about: text } });
    done.push(`${slug} (${locale})`);
  }
  return done;
}

/** 2. faculty:<slug> → unit:<slug>. Bölmənin öz təyinatı varsa o qalır. */
async function moveOwners(strapi: Core.Strapi): Promise<number> {
  const repo = q(strapi, OWNER_UID);
  const rows = await repo.findMany({ where: { key: { $startsWith: 'faculty:' } } });
  let moved = 0;
  for (const r of rows) {
    const slug = str(r.key).slice('faculty:'.length);
    const key = `unit:${slug}`;
    const target = await repo.findOne({ where: { key } });
    if (!target) {
      await repo.update({ where: { id: r.id }, data: { key, path: `/struktur/${slug}` } });
      moved++;
      continue;
    }
    if (target.editorId == null && r.editorId != null) {
      await repo.update({
        where: { id: target.id },
        data: { editorId: r.editorId, assignedById: r.assignedById ?? null, assignedAt: r.assignedAt ?? null, notifiedAt: r.notifiedAt ?? null },
      });
      moved++;
    }
    await repo.delete({ where: { id: r.id } });
  }
  return moved;
}

/** 3. Kopilotun mənbə keçidləri (cədvəl yoxdursa — kopilot qurulmayıb). */
async function fixRagUrls(strapi: Core.Strapi): Promise<number> {
  const knex = strapi.db.connection;
  if (!(await knex.schema.hasTable(RAG_TABLE))) return 0;
  const n = await knex(RAG_TABLE)
    .where('source', 'faculty')
    .andWhere('url', 'like', '%/fakulteler/%')
    .update({ url: knex.raw('replace(url, ?, ?)', ['/fakulteler/', '/struktur/']) });
  return Number(n) || 0;
}

/** 4. Admin redaktə formasında «Adı» sahəsinin altında arxiv qeydi. */
async function markArchive(strapi: Core.Strapi): Promise<boolean> {
  type Conf = { settings: Row; metadatas: Record<string, { edit?: Row }>; layouts: Row };
  const cts = strapi.plugin('content-manager').service('content-types') as unknown as {
    findContentType: (uid: string) => { uid: string } | null;
    findConfiguration: (ct: { uid: string }) => Promise<Conf>;
    updateConfiguration: (ct: { uid: string }, conf: Conf) => Promise<unknown>;
  };
  const ct = cts.findContentType(FACULTY_UID);
  if (!ct) return false;
  const conf = await cts.findConfiguration(ct);
  const edit = conf.metadatas?.name?.edit;
  if (!edit) return false;
  const old = str(edit.description);
  if (old && old !== OLD_NAME_HINT && !old.startsWith('ARXİV')) return false; // admin öz qeydini yazıb
  edit.description = FACULTY_ARCHIVE_NOTE;
  await cts.updateConfiguration(ct, { settings: conf.settings, metadatas: conf.metadatas, layouts: conf.layouts });
  return true;
}

export async function applyFacultyUnitsV1(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: MARKER })) === true) return;

  const copied = await copyAbout(strapi);
  const owners = await moveOwners(strapi);
  const rag = await fixRagUrls(strapi).catch((e: Error) => {
    strapi.log.warn('[faculty] F5.41: kopilot keçidləri yenilənmədi: ' + e.message);
    return 0;
  });
  const marked = await markArchive(strapi).catch((e: Error) => {
    strapi.log.warn('[faculty] F5.41: arxiv qeydi yazılmadı: ' + e.message);
    return false;
  });
  await store.set({ key: MARKER, value: true });
  strapi.log.info(
    `[faculty] F5.41: fakültə səhifəsi → /struktur. «Haqqında» köçürüldü: ${copied.length ? copied.join(', ') : 'yoxdur (bölmələr doludur)'}; ` +
      `məsul redaktor: ${owners}; kopilot keçidi: ${rag}; arxiv qeydi: ${marked ? 'bəli' : 'xeyr'}.`,
  );
}
