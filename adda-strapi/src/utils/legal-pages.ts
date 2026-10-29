/**
 * F5.53 — footer-in hüquqi səhifələri (məzmun: legal-pages-content.ts).
 *
 *   applyLegalPagesV1 — BİR DƏFƏ (`legalPages:v1`): «Məxfilik siyasəti» və
 *     «İstifadə şərtləri» (az/en/ru, layout=akademiya). Qayda F5.48-dəki kimi
 *     (section-pages.ts): yoxdursa yaradılır, redaktor 12.10.2026-dan sonra
 *     dəyişibsə toxunulmur.
 *   startCorpPageF553 — ARXA PLANDA (`corpPage:v1`): köhnə saytdan gələn
 *     «Korporativ üslub» səhifəsi yeni quruluşda (loqotip, təqdimat şablonu,
 *     rənglər və şriftlər bloku — dataBlock=korporativ). Fayllar:
 *       1. köhnə səhifədə artıq media kitabxanasında olanlar (önizləmə şəkilləri,
 *          PPTX) yenidən endirilmir;
 *       2. qalanları (PNG, PDF, CDR) köhnə saytdan media kitabxanasına (F5.51
 *          legacy-files.ts, PPTX/CDR `documents` ilə);
 *       3. köhnə sayt əlçatmazdırsa növbəti başlanğıcda yenidən (`corpPage:tries`,
 *          3 dəfə), sonra keçid köhnə sayta (və ya köhnə səhifədəki fayla) qalır.
 */
import type { Core } from '@strapi/strapi';
import { applySectionPages } from './section-pages';
import { CORP_FILES, CORP_PAGE_TEMPLATE, CORP_SLUG, LEGAL_PAGES, type CorpFile } from './legal-pages-content';
import type { PageLocaleSeed, QebulPageSeed } from './qebul-pages-content';
import { importLegacyFile, legacyBase, legacyUrl, LegacyUnreachable } from './legacy-files';
import { envUrl } from './env-url';

type Row = Record<string, unknown>;

const CORP_MARKER = 'corpPage:v1';
const TRIES_KEY = 'corpPage:tries';
const MAX_TRIES = 3;

export async function applyLegalPagesV1(strapi: Core.Strapi): Promise<void> {
  await applySectionPages(strapi, {
    marker: 'legalPages:v1',
    tag: '[legal] F5.53',
    layout: 'akademiya',
    backupPrefix: 'legalPages',
    pages: LEGAL_PAGES,
    dropIfUnassigned: [],
    source: 'src/utils/legal-pages-content.ts',
  });
}

/** Mətndəki fayl keçidi tam ünvan olmalıdır (lokal provayderdə «/uploads/…»). */
function absUrl(u: string): string {
  if (!u.startsWith('/')) return u;
  return envUrl('ADMIN_PUBLIC_URL', 'https://adda-edu-az.onrender.com') + u;
}

/** Köhnə səhifənin mətnindəki fayllar: «img:N» (N-ci şəkil) və keçid mətni → ünvan. */
export function legacyAssets(body: string): Map<string, string> {
  const out = new Map<string, string>();
  let n = 0;
  for (const m of body.matchAll(/(!?)\[([^\]]*)\]\(([^)\s]+)\)/g)) {
    if (m[1] === '!') out.set(`img:${++n}`, m[3]);
    else if (m[2].trim() && !out.has(m[2].trim())) out.set(m[2].trim(), m[3]);
  }
  return out;
}

function fill(loc: PageLocaleSeed, urls: Record<string, string>): PageLocaleSeed {
  return { ...loc, body: loc.body.replace(/\{\{(\w+)\}\}/g, (all, k: string) => urls[k] ?? all) };
}

export function withCorpFiles(seed: QebulPageSeed, urls: Record<string, string>): QebulPageSeed {
  return {
    ...seed,
    az: fill(seed.az, urls),
    en: seed.en ? fill(seed.en, urls) : undefined,
    ru: seed.ru ? fill(seed.ru, urls) : undefined,
  };
}

interface Resolved {
  urls: Record<string, string>;
  imported: string[];
  reused: string[];
  legacy: string[];
  misses: string[];
}

async function resolveFiles(strapi: Core.Strapi, oldBody: string, offline: boolean): Promise<Resolved> {
  const assets = legacyAssets(oldBody);
  const base = legacyBase();
  const out: Resolved = { urls: {}, imported: [], reused: [], legacy: [], misses: [] };
  const existing = (label?: string) => {
    const u = label ? assets.get(label) : undefined;
    // Köhnə sayta aparan keçid «media kitabxanasında» sayılmır.
    return u && !u.startsWith(base) && !u.includes('adda.edu.az/uploads') ? u : null;
  };
  for (const f of CORP_FILES as CorpFile[]) {
    const reuse = existing(f.reuse);
    if (reuse) {
      out.urls[f.key] = reuse;
      out.reused.push(f.key);
      continue;
    }
    if (!offline) {
      try {
        const file = await importLegacyFile(strapi, f.path, f.name, f.alt, { documents: f.document });
        out.urls[f.key] = absUrl(file.url);
        out.imported.push(f.key);
        continue;
      } catch (e) {
        if (e instanceof LegacyUnreachable) throw e;
        out.misses.push(`${f.path} (${(e as Error).message})`);
      }
    }
    const fb = existing(f.fallback);
    out.urls[f.key] = fb ?? legacyUrl(f.path);
    (fb ? out.reused : out.legacy).push(f.key);
  }
  return out;
}

async function runCorp(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  const tries = Number((await store.get({ key: TRIES_KEY })) ?? 0);
  const offline = tries >= MAX_TRIES;
  const docs = strapi.documents('api::page.page' as never) as unknown as { findFirst: (a: Row) => Promise<Row | null> };
  const az = await docs.findFirst({ locale: 'az', status: 'draft', filters: { slug: { $eq: CORP_SLUG } }, fields: ['body', 'lead'] });

  let files: Resolved;
  try {
    files = await resolveFiles(strapi, typeof az?.body === 'string' ? az.body : '', offline);
  } catch (e) {
    if (!(e instanceof LegacyUnreachable)) throw e;
    await store.set({ key: TRIES_KEY, value: tries + 1 });
    strapi.log.warn(
      `[korporativ] F5.53: köhnə sayt əlçatmazdır (${tries + 1}/${MAX_TRIES}): ${e.message} — növbəti başlanğıcda yenidən` +
        (tries + 1 >= MAX_TRIES ? ' (sonra keçidlər köhnə sayta qalacaq).' : '.'),
    );
    return;
  }

  await applySectionPages(strapi, {
    marker: CORP_MARKER,
    tag: '[korporativ] F5.53',
    layout: 'akademiya',
    backupPrefix: 'corpPage',
    pages: [withCorpFiles(CORP_PAGE_TEMPLATE, files.urls)],
    dropIfUnassigned: [],
    source: 'src/utils/legal-pages-content.ts',
  });
  strapi.log.info(
    `[korporativ] F5.53: fayllar — köhnə saytdan yükləndi: ${files.imported.join(', ') || 'yox'}; ` +
      `media kitabxanasında vardı: ${files.reused.join(', ') || 'yox'}` +
      (files.legacy.length ? `; köhnə sayta keçid (admində yükləyin): ${files.legacy.join(', ')}` : '') +
      '.',
  );
  if (files.misses.length) strapi.log.warn(`[korporativ] F5.53: alınmayan fayllar: ${files.misses.join('; ')}`);
}

/** Bootstrap-dan çağırılır; iş 12 saniyə sonra arxa planda (port bloklanmır). */
export async function startCorpPageF553(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: CORP_MARKER })) === true) return;
  strapi.log.info('[korporativ] F5.53: «Korporativ üslub» səhifəsi və rəsmi fayllar ARXA PLANDA — port bloklanmır.');
  setTimeout(() => {
    void runCorp(strapi).catch((e: Error) => strapi.log.error('[korporativ] F5.53: ' + e.message));
  }, 12000);
}
