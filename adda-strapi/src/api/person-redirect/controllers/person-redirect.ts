/**
 * F5.58 — GET /api/person-redirects → { data: { köhnə: yeni } } (store
 * `adda-admin` → `personRedirects`, bax src/utils/person-merge.ts).
 */
import type { Core } from '@strapi/strapi';
import { REDIRECTS_KEY } from '../../../utils/person-merge';

interface Ctx {
  body: unknown;
  set(field: string, value: string): void;
}

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async list(ctx: Ctx) {
    const v = await strapi.store({ type: 'plugin', name: 'adda-admin' }).get({ key: REDIRECTS_KEY });
    ctx.set('Cache-Control', 'public, max-age=300');
    ctx.body = { data: v && typeof v === 'object' ? v : {} };
  },
});
