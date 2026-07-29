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
  // F2/K16 — yükləmə həddi.
  //
  // Media köçürməsində 5 fayl `413 PayloadTooLarge` verdi: Strapi-nin standart
  // `formLimit`-i (~56 MB deyil, koa-body-nin daha aşağı standartı) böyük
  // skan/PDF sənədləri üçün kifayət etmir. ADDA arxivində 200 elan sənədi var
  // və bəziləri onlarla MB-dır.
  {
    name: 'strapi::body',
    config: {
      formLimit: '100mb',   // multipart (fayl yükləmə)
      jsonLimit: '10mb',
      textLimit: '10mb',
      formidable: { maxFileSize: 100 * 1024 * 1024 },
    },
  },
  // F2.6e — sürət limiti. `strapi::body`-dən SONRA olmalıdır: magic-link sorğusunda
  // e-poçt başına sayğac üçün parse olunmuş body lazımdır.
  'global::rate-limit',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
