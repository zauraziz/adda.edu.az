/**
 * F5.56 — Neon kvotası (Zaur müəllim, 18.10.2026: Render logunda «Your account or
 * project has exceeded the quota»). Sayt (Next, Vercel) Strapi-ni dəqiqədə bir
 * yeniləyirdi: hər ziyarət Render-i və Neon-u oyadırdı, Neon-un pulsuz kompüt
 * saatları bitdi. İndi sayt Strapi cavablarını 1 gün saxlayır (adda-nextjs
 * lib/strapi.ts `STRAPI_TAG`), məzmun dəyişəndə isə BU modul sayta xəbər verir:
 * POST <SITE_URL>/api/revalidate, başlıq `x-revalidate-secret`.
 *
 *  • Document Service middleware (register): saytda görünən növlər. Dərc olunan
 *    növdə yalnız publish / unpublish / delete (qaralamanı yadda saxlamaq saytı
 *    dəyişmir), qalanlarında create / update / delete.
 *  • Media kitabxanası: fayl dəyişəndə və silinəndə (bootstrap, db lifecycles).
 *  • Məsul redaktor təyin olunanda (page-owners.ts).
 *  • Yeni deploy (`RENDER_GIT_COMMIT` dəyişib): bootstrap zəncirinin sonunda bir
 *    dəfə — birbaşa bazaya yazan bir dəfəlik düzəlişlər də sayta çıxsın.
 *  • Ardıcıl dəyişikliklər birləşir: sonuncudan 8 s sonra, ən gec 60 s.
 *
 * Sirr: `REVALIDATE_SECRET` (yoxdursa `ADMIN_IMPORT_SECRET`), Render və Vercel-də
 * EYNİ dəyər. Yoxdursa heç nə göndərilmir və açılışda logda xəbərdarlıq — sayt
 * dəyişikliyi onda 1 günə qədər gecikmə ilə göstərir. Yalnız Render-də işləyir
 * (env `RENDER`) və ya `REVALIDATE_URL` verilibsə (lokal sınaq; vergüllə bir neçə).
 * Sayt yeniləməsi heç vaxt yazmanı sındırmır və gözlətmir.
 *
 * F5.60: SITE_URL və REVALIDATE_URL təmizlənir (env-url.ts). Render-də SITE_URL
 * markdown keçidi kimi yazılmışdı — sorğu «Failed to parse URL» ilə düşür, sayt
 * dərcdən sonra yenilənmirdi. Yanlış yazılış açılışda logda xəbərdarlıqdır.
 */
import type { Core } from '@strapi/strapi';
import { cleanUrl, envUrl, envUrlIssue, isHttpUrl } from './env-url';

type Row = Record<string, unknown>;

const TAG = '[revalidate] F5.56';
const DEBOUNCE_MS = 8_000;
const MAX_WAIT_MS = 60_000;
const TIMEOUT_MS = 15_000;
const COMMIT_KEY = 'siteRevalidate:commit';

/** Saytda görünən məzmun (müraciət, düzəliş, reaksiya, RSVP, kimlik, push YOX). */
export const SITE_TYPES = new Set<string>([
  'api::announcement.announcement',
  'api::article.article',
  'api::cert-block.cert-block',
  'api::department.department',
  'api::document.document',
  'api::event.event',
  'api::facility.facility',
  'api::faculty.faculty',
  'api::hero.hero',
  'api::home-page.home-page',
  'api::menu.menu',
  'api::milestone.milestone',
  'api::org-block.org-block',
  'api::page.page',
  'api::page-owner.page-owner',
  'api::person.person',
  'api::program.program',
  'api::rector.rector',
  'api::social-block.social-block',
  'api::social-post.social-post',
  'api::tag.tag',
  'api::unit.unit',
]);
const LIVE = new Set(['create', 'update', 'delete', 'clone']);
const LIVE_DP = new Set(['publish', 'unpublish', 'delete']);

const secret = (): string => (process.env.REVALIDATE_SECRET || process.env.ADMIN_IMPORT_SECRET || '').trim();

function targets(): string[] {
  // F5.60 — ünvan təmizlənir (env-url.ts): Render-də SITE_URL markdown keçidi idi.
  const own = (process.env.REVALIDATE_URL || '')
    .split(',')
    .map((s) => cleanUrl(s))
    .filter((s) => isHttpUrl(s));
  if (own.length) return own;
  if (!process.env.RENDER) return [];
  const site = envUrl('SITE_URL', 'https://demo.adda.edu.az');
  return [`${site}/api/revalidate`];
}

/** Bu yazı saytda görünən məzmunu dəyişirmi? (Saf funksiya — sınaq üçün ixrac.) */
export function affectsSite(uid: string, action: string, draftAndPublish: boolean, status?: unknown): boolean {
  if (!SITE_TYPES.has(uid)) return false;
  if (!draftAndPublish) return LIVE.has(action);
  if (LIVE_DP.has(action)) return true;
  return (action === 'create' || action === 'update') && status === 'published';
}

let timer: ReturnType<typeof setTimeout> | null = null;
let firstAt = 0;
const reasons = new Set<string>();

const short = (uid: string): string => uid.replace(/^api::[^.]+\./, '').replace(/^plugin::/, '');

async function post(strapi: Core.Strapi, url: string, key: string, why: string): Promise<void> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-revalidate-secret': key },
      body: JSON.stringify({ reason: why }),
      signal: ac.signal,
    });
    if (res.ok) {
      strapi.log.info(`${TAG}: sayt yeniləndi (${why}).`);
      return;
    }
    const hint =
      res.status === 401
        ? ' — sirr Vercel-dəki ilə eyni deyil'
        : res.status === 503
          ? ' — Vercel-də REVALIDATE_SECRET yoxdur'
          : res.status === 404
            ? ' — saytda /api/revalidate yoxdur (Vercel deploy olunubmu?)'
            : '';
    strapi.log.warn(`${TAG}: ${url} → ${res.status}${hint}. Dəyişiklik saytda 1 günə qədər gecikə bilər.`);
  } catch (e) {
    strapi.log.warn(`${TAG}: ${url} əlçatmazdır (${(e as Error).message}).`);
  } finally {
    clearTimeout(t);
  }
}

async function flush(strapi: Core.Strapi): Promise<void> {
  timer = null;
  firstAt = 0;
  const why = [...reasons].join(', ');
  reasons.clear();
  const key = secret();
  if (!key) return;
  for (const url of targets()) await post(strapi, url, key, why);
}

/** Saytın keşini təzələməyi növbəyə qoy; ardıcıl çağırışlar bir sorğuda birləşir. */
export function requestSiteRevalidate(strapi: Core.Strapi, reason: string): void {
  if (!secret() || !targets().length) return;
  reasons.add(reason);
  const now = Date.now();
  if (!firstAt) firstAt = now;
  if (timer) clearTimeout(timer);
  const wait = Math.max(0, Math.min(DEBOUNCE_MS, firstAt + MAX_WAIT_MS - now));
  timer = setTimeout(() => void flush(strapi).catch(() => undefined), wait);
  (timer as { unref?: () => void }).unref?.();
}

/** register(): Document Service yazılarını izlə. */
export function registerSiteRevalidate(strapi: Core.Strapi): void {
  (strapi.documents as unknown as { use: (m: unknown) => void }).use(
    async (context: Row, next: () => Promise<unknown>) => {
      const result = await next();
      try {
        const uid = String(context.uid ?? '');
        const ct = strapi.contentTypes[uid as keyof typeof strapi.contentTypes] as unknown as
          | { options?: { draftAndPublish?: boolean } }
          | undefined;
        const params = (context.params ?? {}) as Row;
        if (affectsSite(uid, String(context.action ?? ''), Boolean(ct?.options?.draftAndPublish), params.status)) {
          requestSiteRevalidate(strapi, short(uid));
        }
      } catch {
        /* sayt yeniləməsi yazmanı sındırmır */
      }
      return result;
    },
  );
}

/** bootstrap() əvvəli: media dəyişikliyi + vəziyyət logu. */
export function startSiteRevalidate(strapi: Core.Strapi): void {
  const urls = targets();
  if (!urls.length) return;
  const issue = envUrlIssue('SITE_URL');
  if (issue) strapi.log.warn(`${TAG}: ${issue}. Render → Environment → SITE_URL-ə yalnız ünvanı yazın (markdown və dırnaq olmadan).`);
  if (!secret()) {
    strapi.log.warn(
      `${TAG}: REVALIDATE_SECRET yoxdur — admində dərc olunan dəyişiklik saytda 1 günə qədər gecikmə ilə görünür. ` +
        'Render-də və Vercel-də eyni REVALIDATE_SECRET qoyun.',
    );
    return;
  }
  const media = () => requestSiteRevalidate(strapi, 'media');
  strapi.db.lifecycles.subscribe({
    models: ['plugin::upload.file'],
    afterUpdate: media,
    afterDelete: media,
    afterDeleteMany: media,
  } as never);
  strapi.log.info(`${TAG}: dərc olunanda sayt yenilənir → ${urls.join(', ')}.`);
}

/** Bootstrap zəncirinin sonu: yeni deploy-da (commit dəyişib) sayt bir dəfə yenilənir. */
export async function revalidateAfterDeploy(strapi: Core.Strapi): Promise<void> {
  const commit = (process.env.RENDER_GIT_COMMIT || '').trim();
  if (!commit || !secret() || !targets().length) return;
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: COMMIT_KEY })) === commit) return;
  await store.set({ key: COMMIT_KEY, value: commit });
  requestSiteRevalidate(strapi, `deploy ${commit.slice(0, 7)}`);
}
