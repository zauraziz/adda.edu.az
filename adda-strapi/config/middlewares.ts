import type { Core } from '@strapi/strapi';

const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'res.cloudinary.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', 'res.cloudinary.com'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: [
        'https://demo.adda.edu.az',
        'https://adda.edu.az',
        'http://localhost:3000',
        'http://localhost:1337',
      ],
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  // F2.6e — sürət limiti. `strapi::body`-dən SONRA olmalıdır: magic-link sorğusunda
  // e-poçt başına sayğac üçün parse olunmuş body lazımdır.
  'global::rate-limit',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
