/**
 * F2/K25 — sayt axtarışı (Meilisearch əvəzinə).
 *
 * `auth: false` — public oxu. Yazma əməliyyatı yoxdur, ona görə hücum səthi
 * minimaldır; sürət limiti `global::rate-limit` middleware-indədir.
 */
export default {
  routes: [
    {
      method: 'GET',
      path: '/site-search',
      handler: 'site-search.search',
      config: { auth: false, policies: [], middlewares: [] },
    },
  ],
};
