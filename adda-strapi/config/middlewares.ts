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
          // F5.38 — admin «Bildirişlər»: müraciətə əlavə olunan PDF admin daxilində
          // (iframe) göstərilir. Olmasa CSP `default-src 'self'`-ə düşür və bloklayır.
          'frame-src': ["'self'", 'res.cloudinary.com'],
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
      // F5.32e — appeal.attachment (max 10 MB) JSON gövdəsində base64 kimi
      // gəlir (identity.ts uploadPhoto-dakı EYNİ üsul — magic-bayt
      // yoxlaması üçün fayl onsuz da yaddaşa oxunmalıdır, multipart əlavə
      // addım olardı). Base64 xam ölçünün ~1.37 qatıdır — 10 MB fayl
      // ~13.7 MB JSON gövdəsi deməkdir, ona görə 10mb-dan 16mb-a qaldırılıb.
      jsonLimit: '16mb',
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
