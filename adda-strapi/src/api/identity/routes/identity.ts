/**
 * F2.6e — Kimlik marşrutları.
 *
 * DİQQƏT: `createCoreRouter` QƏSDƏN işlədilmir. `identity` və `identity-token`
 * üçün heç bir CRUD endpoint-i yoxdur — kimliklər və token hash-ları HTTP üzərindən
 * oxunmur. Admin content-manager-dən baxmaq mümkündür, bu kifayətdir.
 *
 * `auth: false` = users-permissions yoxlaması keçilir; icazə məntiqi
 * nəzarətçidə sessiya tokeni ilə həyata keçirilir.
 */
export default {
  routes: [
    {
      method: 'POST',
      path: '/identity/request',
      handler: 'identity.request',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'POST',
      path: '/identity/verify',
      handler: 'identity.verify',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'POST',
      path: '/identity/session',
      handler: 'identity.session',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'POST',
      path: '/identity/logout',
      handler: 'identity.logout',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'POST',
      path: '/identity/submit/rsvp',
      handler: 'identity.submitRsvp',
      config: { auth: false, policies: [], middlewares: [] },
    },
    {
      method: 'POST',
      path: '/identity/submit/correction',
      handler: 'identity.submitCorrection',
      config: { auth: false, policies: [], middlewares: [] },
    },
  ],
};
