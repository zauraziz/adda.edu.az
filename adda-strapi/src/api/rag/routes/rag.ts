/**
 * F2.7-1 — RAG marşrutları.
 *
 * DİQQƏT: `createCoreRouter` QƏSDƏN işlədilmir və `rag_chunks` Strapi content
 * type DEYİL — ona görə heç bir CRUD endpoint-i yaranmır. Parçalar HTTP
 * üzərindən oxunmur.
 *
 * F2.7-2 ilə `/rag-search` əlavə olundu. O, `auth: false`-dur, amma defolt
 * BAĞLIDIR: `RAG_SEARCH_PUBLIC=true` olmayana qədər yalnız admin sirri ilə
 * cavab verir (bax nəzarətçidəki `search`). Cavab generasiyası F2.7-4-dədir.
 *
 * `auth: false` = users-permissions yoxlaması keçilir; icazə nəzarətçidə
 * `ADMIN_IMPORT_SECRET` ilə verilir (identity/admin naxışı ilə eyni).
 */
export default {
  routes: [
    {
      method: 'POST',
      path: '/rag/admin/status',
      handler: 'rag.status',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'POST',
      path: '/rag/admin/index',
      handler: 'rag.index',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'POST',
      path: '/rag/admin/purge',
      handler: 'rag.purgeIndex',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'POST',
      path: '/rag/admin/audit',
      handler: 'rag.audit',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      // GET — `site-search` ilə eyni forma: keşlənə bilir, yazma yoxdur.
      method: 'GET',
      path: '/rag-search',
      handler: 'rag.search',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      // POST — sual uzun ola bilər və keşlənməsi arzuolunmazdır.
      method: 'POST',
      path: '/rag/answer',
      handler: 'rag.answer',
      config: { auth: false, policies: [], middlewares: [] },
    },
  ],
};
