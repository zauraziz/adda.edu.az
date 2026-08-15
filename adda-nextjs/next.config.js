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
    return Object.entries(DEPT_UNIT_MAP).map(([from, to]) => ({
      source: '/:locale(az|ru|en)/struktur/' + from,
      destination: '/:locale/struktur/' + to,
      permanent: true,
    }));
  },
};

module.exports = nextConfig;