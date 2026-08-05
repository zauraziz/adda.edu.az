/**
 * F2.7-1 — RAG marşrutları.
 *
 * DİQQƏT: `createCoreRouter` QƏSDƏN işlədilmir və `rag_chunks` Strapi content
 * type DEYİL — ona görə heç bir CRUD endpoint-i yaranmır. Parçalar HTTP
 * üzərindən oxunmur.
 *
 * BU FAZADA İCTİMAİ ENDPOINT YOXDUR. Axtarış F2.7-2-də (`/api/rag-search`),
 * cavab generasiyası F2.7-4-də gəlir. Burada yalnız indeksləmə var.
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
  ],
};
