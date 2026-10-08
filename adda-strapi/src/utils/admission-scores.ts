/**
 * F5.42 — qəbul balı: vergüllü onluq (227,6) rəqəmi 2276 etməsin.
 *
 * SƏBƏB: admin interfeysi `en` dil rejimindədir (F5.39), rəqəm sahəsində
 * vergül MİNLİK ayırıcısı sayılır: «227,6» → 2276, «471,5» → 4715 (F5.20a).
 * Redaktor üçün təbii yazı vergüllüdür — qayda yazmaq kifayət etmədi.
 *
 * QAYDA: DİM qəbul balı 700-dən çox ola bilməz. 700-dən böyük dəyər vergüllü
 * onluqdur → 10-a bölünür, ta ki 700-ə düşənə qədər («227,65» → 22765 →
 * 227.65). 700 və aşağı dəyərə toxunulmur.
 *
 *   - registerScoreNormalizer — register()-də: proqram yazılanda (yaradılma və
 *     redaktə, admin və API) dəyər BAZAYA DÜŞMƏZDƏN ƏVVƏL düzəlir.
 *   - applyAdmissionScoresV1 — BİR DƏFƏ (store `adda-admin` → `admissionScores:v1`):
 *     bazada artıq korlanmış dəyərlər (hər dil, qaralama və dərc) + Zaur
 *     müəllimin verdiyi dəqiq dəyərlər (onluğu itmiş 227 → 227,6; 346 → 346,3)
 *     + admin sahə qaydası «vergül də olar».
 */
import type { Core } from '@strapi/strapi';

type Row = Record<string, unknown>;

const MARKER = 'admissionScores:v1';
const PROGRAM_UID = 'api::program.program';
const SCORE_UID = 'program.admission-score';
export const SCORE_MAX = 700;
const FIELDS = ['minScorePaid', 'minScoreFree'] as const;

/**
 * Onluq hissəsi itmiş dəyərlər — Zaur müəllimin düzəlişi (F5.42 tapşırığı:
 * «227,6 - 2022; 329 - 2023; 346,3 - 2024»). Yalnız dəyər hələ köhnə
 * (tam və ya vergüllü-korlanmış) formadadırsa yazılır.
 */
const KNOWN_FIXES: { slug: string; year: number; field: (typeof FIELDS)[number]; from: number[]; to: number }[] = [
  { slug: 'deniz-naviqasiyasi-muhendisliyi', year: 2022, field: 'minScorePaid', from: [227, 2276], to: 227.6 },
  { slug: 'deniz-naviqasiyasi-muhendisliyi', year: 2024, field: 'minScorePaid', from: [346, 3463], to: 346.3 },
];

/** 700-dən böyük dəyəri vergüllü onluq kimi oxu. Rəqəm deyilsə olduğu kimi qaytarır. */
export function normalizeScore(v: unknown): unknown {
  if (v === null || v === undefined || v === '') return v;
  let n = typeof v === 'number' ? v : Number(String(v).trim().replace(',', '.'));
  if (!Number.isFinite(n)) return v;
  if (n <= SCORE_MAX) return typeof v === 'number' ? v : n; // «227,6» mətni (API) → 227.6
  while (n > SCORE_MAX) n /= 10;
  return Math.round(n * 100) / 100; // decimal(10,2)
}

/** Proqram yazılanda `admissionScores` dəyərlərini düzəlt (yerində). */
export function registerScoreNormalizer(strapi: Core.Strapi): void {
  (strapi.documents as unknown as { use: (m: unknown) => void }).use(
    async (context: Row, next: () => Promise<unknown>) => {
      const action = context.action as string;
      if (context.uid === PROGRAM_UID && (action === 'create' || action === 'update')) {
        const data = ((context.params as Row) || {}).data as Row | undefined;
        const scores = data && Array.isArray(data.admissionScores) ? (data.admissionScores as Row[]) : null;
        for (const s of scores ?? []) {
          if (!s || typeof s !== 'object') continue;
          for (const f of FIELDS) {
            const fixed = normalizeScore(s[f]);
            if (fixed !== s[f]) {
              strapi.log.info(`[qebul-bali] ${String(s[f])} -> ${String(fixed)} (${String(s.year ?? '')}, vergüllü onluq)`);
              s[f] = fixed;
            }
          }
        }
      }
      return next();
    },
  );
}

type Q = {
  findMany: (a?: Row) => Promise<Row[]>;
  update: (a: Row) => Promise<Row>;
};
const q = (strapi: Core.Strapi, uid: string): Q => strapi.db.query(uid as never) as unknown as Q;

/** Bazadakı korlanmış dəyərlər (bütün proqramlar, dillər, versiyalar). */
async function fixStored(strapi: Core.Strapi): Promise<number> {
  const rows = await q(strapi, SCORE_UID).findMany({ select: ['id', ...FIELDS] });
  let n = 0;
  for (const r of rows) {
    const data: Row = {};
    for (const f of FIELDS) {
      const fixed = normalizeScore(r[f]);
      if (fixed !== r[f]) data[f] = fixed;
    }
    if (!Object.keys(data).length) continue;
    await q(strapi, SCORE_UID).update({ where: { id: r.id }, data });
    n++;
  }
  return n;
}

/** Onluğu itmiş dəyərlər — yalnız dəyər hələ gözlənilən köhnə formadadırsa. */
async function applyKnownFixes(strapi: Core.Strapi): Promise<number> {
  let n = 0;
  for (const slug of [...new Set(KNOWN_FIXES.map((k) => k.slug))]) {
    const programs = await q(strapi, PROGRAM_UID).findMany({ where: { slug }, populate: { admissionScores: true } });
    for (const p of programs) {
      for (const s of (p.admissionScores as Row[]) ?? []) {
        for (const k of KNOWN_FIXES) {
          if (k.slug !== slug || Number(s.year) !== k.year) continue;
          const cur = Number(s[k.field]);
          if (!k.from.includes(cur)) continue;
          await q(strapi, SCORE_UID).update({ where: { id: s.id }, data: { [k.field]: k.to } });
          n++;
        }
      }
    }
  }
  return n;
}

/** Admin sahə qaydası: vergül də olar (köhnə «NÖQTƏ ilə» qaydası idisə). */
async function updateHints(strapi: Core.Strapi): Promise<boolean> {
  type Conf = { settings: Row; metadatas: Record<string, { edit?: Row }>; layouts: Row };
  const comps = strapi.plugin('content-manager').service('components') as unknown as {
    findComponent: (uid: string) => { uid: string } | null | undefined;
    findConfiguration: (c: { uid: string }) => Promise<Conf>;
    updateConfiguration: (c: { uid: string }, conf: Conf) => Promise<unknown>;
  };
  const c = comps.findComponent(SCORE_UID);
  if (!c) return false;
  const conf = await comps.findConfiguration(c);
  let touched = false;
  for (const f of FIELDS) {
    const edit = conf.metadatas?.[f]?.edit;
    if (!edit) continue;
    const old = typeof edit.description === 'string' ? edit.description : '';
    if (old && !old.startsWith('Onluq bal NÖQTƏ ilə')) continue; // admin öz qaydasını yazıb
    edit.description = SCORE_HINT;
    touched = true;
  }
  if (touched) await comps.updateConfiguration(c, { settings: conf.settings, metadatas: conf.metadatas, layouts: conf.layouts });
  return touched;
}

export const SCORE_HINT = 'Onluq bal vergül və ya nöqtə ilə: 227,6 və ya 227.6 — hər ikisi düzgün saxlanır (700-dən çox ola bilməz).';

export async function applyAdmissionScoresV1(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: MARKER })) === true) return;
  const fixed = await fixStored(strapi);
  const known = await applyKnownFixes(strapi);
  const hints = await updateHints(strapi).catch((e: Error) => {
    strapi.log.warn('[qebul-bali] F5.42: admin qaydası yenilənmədi: ' + e.message);
    return false;
  });
  await store.set({ key: MARKER, value: true });
  strapi.log.info(
    `[qebul-bali] F5.42: vergüllü onluq düzəldildi: ${fixed} sətir; dəqiq dəyər (227,6 / 346,3): ${known}; admin qaydası: ${hints ? 'yeniləndi' : 'toxunulmadı'}.`,
  );
}
