/**
 * F5.43 — auditoriya və laboratoriyaların ünvanı (slug).
 *
 * PROBLEM (prod, 8 oktyabr 2026): /auditoriyalar 38 dərc olunmuş obyektdən
 * yalnız 6-nı göstərirdi. 32-nin DƏRC OLUNMUŞ versiyasında slug boş idi:
 * F5.34 seed-i qaralamaları slugsız yaratdı və onlar dərc olundu, F5.35e seed-i
 * slug-ı sonradan YALNIZ qaralamaya yazdı (publish çağırılmadı). Kataloq
 * slugsız obyekti atırdı — keçid qurula bilmir. Bundan başqa:
 *   - FACILITY_SEED bayrağı Render-də qalıb: redaktorun adını dəyişdiyi
 *     obyekt hər deploy-da «<slug>-2» qaralaması kimi YENİDƏN yaranırdı;
 *   - admində ad yazılmadan yaradılan obyektin slug-ı «facility» olurdu
 *     (Strapi uid generatoru boş addan model adını götürür).
 *
 * HƏLL:
 *   - registerFacilitySlugFill (register): yazılanda slug boşdursa və ya
 *     «facility(-N)»-dirsə otaq + addan yaranır (Azərbaycan hərfləri düzgün).
 *   - applyFacilitySlugsV1 — BİR DƏFƏ (store `adda-admin` → `facilitySlugs:v1`):
 *       1. seed-in «<slug>-N» təkrar qaralamaları SİLİNİR — yalnız hamısı
 *          doğrudursa: heç vaxt dərc olunmayıb, admində heç kim yaratmayıb və
 *          dəyişməyib (createdBy/updatedBy boş, yaradılandan sonra yazılmayıb),
 *          eyni bölmə + otaqda slug-ı «<slug>» olan DƏRC OLUNMUŞ obyekt var;
 *       2. «facility(-N)» slug-ları → otaq + ad (qaralama və dərc);
 *       3. boş slug → qaralamanın slug-ı (dərc olunmuş versiyaya), o da
 *          yoxdursa otaq + addan.
 *   - seed (src/index.ts, FACILITY_SEED): yalnız BOŞ bazada, bir dəfə.
 */
import type { Core } from '@strapi/strapi';

type Row = Record<string, unknown>;

const UID = 'api::facility.facility';
const MARKER = 'facilitySlugs:v1';
/** Strapi uid generatorunun boş addan verdiyi slug. */
const GENERIC = /^facility(?:-\d+)?$/;

const AZ_FOLD: Record<string, string> = { ə: 'e', ı: 'i', ö: 'o', ü: 'u', ş: 's', ç: 'c', ğ: 'g' };

/** Azərbaycan hərfləri ilə slug hissəsi: «Gəmi körpüsü» → «gemi-korpusu». */
export const slugPart = (v: string): string =>
  v
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLowerCase()
    .replace(/[əıöüşçğ]/g, (c) => AZ_FOLD[c] ?? c)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Otaq nömrəsi varsa «<otaq>-<addan-slug>» (məs. «312-radar-simulyatoru»), yoxdursa yalnız addan. */
export const facilitySlug = (room: string | null | undefined, name: string | null | undefined): string => {
  const r = room ? slugPart(room) : '';
  const n = name ? slugPart(name) : '';
  return (r && n ? r + '-' + n : r || n) || 'obyekt';
};

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const badSlug = (v: unknown): boolean => !str(v) || GENERIC.test(str(v));

type Q = {
  findMany: (a?: Row) => Promise<Row[]>;
  findOne: (a: Row) => Promise<Row | null>;
  update: (a: Row) => Promise<Row>;
};
const q = (strapi: Core.Strapi): Q => strapi.db.query(UID as never) as unknown as Q;

/** Dildə başqa obyektlərin tutduğu slug-lar (eyni obyektin qaralama/dərc cütü sayılmır). */
async function takenSlugs(strapi: Core.Strapi, locale: string, exceptDocumentId?: string): Promise<Set<string>> {
  const rows = await q(strapi).findMany({ where: { locale }, select: ['slug', 'documentId'] });
  return new Set(rows.filter((r) => r.documentId !== exceptDocumentId && str(r.slug)).map((r) => str(r.slug)));
}

function uniqueIn(base: string, taken: Set<string>): string {
  let cand = base;
  for (let i = 2; taken.has(cand); i++) cand = `${base}-${i}`;
  taken.add(cand);
  return cand;
}

/** Yazılanda boş və ya «facility» slug-ı otaq + addan doldur (admin, API, seed). */
export function registerFacilitySlugFill(strapi: Core.Strapi): void {
  (strapi.documents as unknown as { use: (m: unknown) => void }).use(
    async (context: Row, next: () => Promise<unknown>) => {
      const action = context.action as string;
      if (context.uid !== UID || (action !== 'create' && action !== 'update')) return next();
      const params = (context.params as Row) || {};
      const data = params.data as Row | undefined;
      if (!data || typeof data !== 'object') return next();
      // Qismən yeniləmədə slug göndərilmirsə ona toxunulmur.
      if (action === 'update' && !Object.prototype.hasOwnProperty.call(data, 'slug')) return next();
      if (!badSlug(data.slug)) return next();
      const documentId = typeof params.documentId === 'string' ? params.documentId : undefined;
      const locale = str(params.locale) || 'az';
      let name = data.name as string | null | undefined;
      let room = data.roomNumber as string | null | undefined;
      if (action === 'update' && documentId && (name === undefined || room === undefined)) {
        const cur = await q(strapi).findOne({ where: { documentId, locale }, select: ['name', 'roomNumber'] });
        if (name === undefined) name = (cur?.name as string | null) ?? null;
        if (room === undefined) room = (cur?.roomNumber as string | null) ?? null;
      }
      if (!str(name) && !str(room)) return next(); // ad yoxdur — Strapi-nin öz qaydası işləsin
      data.slug = uniqueIn(facilitySlug(room, name), await takenSlugs(strapi, locale, documentId));
      strapi.log.info(`[auditoriya] slug avtomatik yarandı: ${String(data.slug)}`);
      return next();
    },
  );
}

interface Pair {
  documentId: string;
  locale: string;
  draft?: Row;
  pub?: Row;
}

const unitDoc = (r: Row | undefined): string => str(((r?.unit as Row | null) ?? null)?.documentId);
const userId = (v: unknown): unknown => (v && typeof v === 'object' ? (v as Row).id ?? null : v ?? null);

/** 1. Seed-in təkrar qaralamaları (bax yuxarı: bütün şərtlər). Qaytarır: silinənlər. */
async function removeSeedDuplicates(strapi: Core.Strapi, pairs: Pair[]): Promise<string[]> {
  const published = new Set(pairs.filter((p) => p.pub).map((p) => p.documentId));
  const removed: string[] = [];
  for (const p of pairs) {
    const d = p.draft;
    if (!d || published.has(p.documentId)) continue;
    if (userId(d.createdBy) != null || userId(d.updatedBy) != null) continue;
    const created = Date.parse(String(d.createdAt));
    const updated = Date.parse(String(d.updatedAt));
    if (!Number.isFinite(created) || !Number.isFinite(updated) || Math.abs(updated - created) > 60_000) continue;
    const m = /^(.+)-(\d+)$/.exec(str(d.slug));
    if (!m) continue;
    const base = m[1];
    const original = pairs.find(
      (o) =>
        o.documentId !== p.documentId &&
        o.locale === p.locale &&
        o.pub &&
        (str(o.draft?.slug) === base || str(o.pub.slug) === base) &&
        str((o.draft ?? o.pub).roomNumber) === str(d.roomNumber) &&
        unitDoc(o.draft ?? o.pub) === unitDoc(d),
    );
    if (!original) continue;
    await strapi.documents(UID as never).delete({ documentId: p.documentId, locale: p.locale } as never);
    removed.push(`${str(d.slug)} (${str(d.roomNumber) || '—'})`);
  }
  return removed;
}

/**
 * 2–3. «facility» slug-ları və boş slug-lar. YALNIZ pis slug-lı sətir dəyişir —
 * redaktorun qaralamada dəyişdiyi (hələ dərc etmədiyi) yaxşı slug-a toxunulmur.
 * Qaytarır: «köhnə → yeni» siyahısı.
 */
async function fixSlugs(strapi: Core.Strapi, pairs: Pair[]): Promise<string[]> {
  const changed: string[] = [];
  for (const p of pairs) {
    const rows = [p.draft, p.pub].filter((r): r is Row => Boolean(r));
    const bad = rows.filter((r) => badSlug(r.slug));
    if (!bad.length) continue;
    const src = (p.draft ?? p.pub) as Row;
    const good = rows.map((r) => str(r.slug)).find((s) => !badSlug(s)) ?? '';
    const taken = await takenSlugs(strapi, p.locale, p.documentId);
    const target = good && !taken.has(good) ? good : uniqueIn(facilitySlug(str(src.roomNumber), str(src.name)), taken);
    for (const r of bad) {
      await q(strapi).update({ where: { id: r.id }, data: { slug: target } });
      changed.push(`${str(r.slug) || '(boş)'} → ${target}${r.publishedAt ? ' (dərc)' : ' (qaralama)'}`);
    }
  }
  return changed;
}

async function loadPairs(strapi: Core.Strapi): Promise<Pair[]> {
  const rows = await q(strapi).findMany({
    select: ['id', 'documentId', 'locale', 'slug', 'name', 'roomNumber', 'publishedAt', 'createdAt', 'updatedAt'],
    populate: { unit: { select: ['documentId'] }, createdBy: { select: ['id'] }, updatedBy: { select: ['id'] } },
  });
  const map = new Map<string, Pair>();
  for (const r of rows) {
    const key = `${str(r.documentId)}|${str(r.locale)}`;
    const p = map.get(key) ?? { documentId: str(r.documentId), locale: str(r.locale) };
    if (r.publishedAt) p.pub = r;
    else p.draft = r;
    map.set(key, p);
  }
  return [...map.values()];
}

export async function applyFacilitySlugsV1(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: MARKER })) === true) return;

  const removed = await removeSeedDuplicates(strapi, await loadPairs(strapi));
  const changed = await fixSlugs(strapi, await loadPairs(strapi));
  await store.set({ key: MARKER, value: true });
  strapi.log.info(
    `[auditoriya] F5.43: ünvanlar düzəldi: ${changed.length} sətir${changed.length ? ' (' + changed.join('; ') + ')' : ''}; ` +
      `seed təkrarı silindi: ${removed.length}${removed.length ? ' (' + removed.join('; ') + ')' : ''}.`,
  );
}
