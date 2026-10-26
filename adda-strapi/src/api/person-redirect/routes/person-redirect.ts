/**
 * F5.58 — əməkdaşın köhnə ünvanı → yeni (təkrar qeyd birləşəndə, oxunmaz ünvan
 * düzələndə). Sayt (/emekdas/[slug]) qeyd tapılmayanda buradan baxıb 301 edir.
 * `auth: false` — yalnız oxu, ünvanlar onsuz da açıqdır.
 */
export default {
  routes: [
    {
      method: 'GET',
      path: '/person-redirects',
      handler: 'person-redirect.list',
      config: { auth: false, policies: [], middlewares: [] },
    },
  ],
};
