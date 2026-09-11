// F3.26: department -> unit birləşməsi. tools/migration/data/redirects.json
// (LEGACY_REDIRECTS, middleware.ts) yalnız köhnə saytın /content/N kimi ƏDƏDİ
// marşrutları üçündür - bura uyğun gəlmir, çünki hər iki tərəf slug-dır və
// hədəf hazırkı `/struktur/[slug]` marşrutunun özüdür. Ona görə burda,
// next.config redirects()-də saxlanılır (bax: CLAUDE.md, ABOUT_MIGRATE
// DEPT_UNIT_MAP src/index.ts-də - iki xəritə sinxron saxlanmalıdır).
const DEPT_UNIT_MAP = {
  'azerbaycan-denizcilik-kolleci': 'azerbaycan-denizcilik-kolleci-phs',
  'telim-tedris-merkezi-ttm': 'telim-tedris-merkezi',
  'muhasibat-ucotu-ve-hesabat-sobesi': 'muhasibat-ucotu-ve-hesabati-sobesi',
  'personalin-idare-edilmesi-emek-haqqi-sobesi-ve-karguzarliq-sobesi':
    'personalin-idareedilmesi-emek-haqqi-ve-karguzarliq-sobesi',
  irm: 'informasiya-resurs-merkezi',
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'adda.edu.az' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  async redirects() {
    return [
      ...Object.entries(DEPT_UNIT_MAP).map(([from, to]) => ({
        source: '/:locale(az|ru|en)/struktur/' + from,
        destination: '/:locale/struktur/' + to,
        permanent: true,
      })),
      // F5.21d: /sehife/qehremanlarimiz -> /qehremanlarimiz (öz marşrutuna
      // köçdü). Köhnə `sehife` qeydi Strapi-də SİLİNMİR (arxiv), sadəcə
      // ona istinad edən keçid qalmır — köhnə URL bookmark/xarici linki
      // qırılmasın deyə 301 saxlanılır. DEPT_UNIT_MAP-dən fərqli olaraq
      // mənbə/hədəf eyni prefiks altında deyil, ona görə ayrıca yazılıb.
      {
        source: '/:locale(az|ru|en)/sehife/qehremanlarimiz',
        destination: '/:locale/qehremanlarimiz',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;