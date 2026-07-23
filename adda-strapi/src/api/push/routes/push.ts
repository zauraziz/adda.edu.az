/**
 * F2.6e-3 — Push marşrutları.
 *
 * `createCoreRouter` QƏSDƏN işlədilmir: `push-subscription` və `push-broadcast`
 * üçün CRUD endpoint-i YOXDUR. Endpoint URL-ləri psevdo-identifikatordur —
 * HTTP üzərindən heç vaxt oxunmamalıdır (sxemdə də `private: true`).
 */
export default {
  routes: [
    {
      method: 'GET',
      path: '/push/public-key',
      handler: 'push.publicKey',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'POST',
      path: '/push/subscribe',
      handler: 'push.subscribe',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'POST',
      path: '/push/unsubscribe',
      handler: 'push.unsubscribe',
      config: { auth: false, policies: [], middlewares: [] },
    },
  ],
};
