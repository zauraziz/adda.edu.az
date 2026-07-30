import type { Core } from '@strapi/strapi';

// Meilisearch "adda" indeksi üçün ortaq parametrlər
const SEARCH_SETTINGS = {
  // K20: `body` ELAVE OLUNDU.
  //
  // Miqrasiya olunan 1206 senedde `excerpt` BOSDUR — kohne saytda bele bir
  // sahe yox idi. Yalniz basliq axtarilanda "Elmi Sura iclasi" tapilir, amma
  // metndeki hec ne tapilmir. Govde indeksleneende axtaris real islemeye baslayir.
  //
  // `body` `displayedAttributes`-de YOXDUR — indekslenir, amma cavabda
  // qaytarilmir (yuzlerle KB olardi). Meilisearch-de bu iki siyahi musteqildir.
  searchableAttributes: ['title', 'excerpt', 'body'],
  filterableAttributes: ['locale', 'contentType', 'category'],
  displayedAttributes: ['id', 'documentId', 'title', 'slug', 'excerpt', 'category', 'contentType', 'locale'],
  rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
};

/**
 * Markdown govdesini axtaris ucun hazirla.
 * - isare-simvollar temizlenir ki, `##` ve `**` uygunlugu korlamasin
 * - 6000 simvola kesilir: uzun senedler indeksi sisirir, ilk hisse kifayetdir
 */
function searchBody(raw: unknown): string {
  if (typeof raw !== 'string' || !raw) return '';
  return raw
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')          // sekiller
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')        // linkler -> metn
    .replace(/^[ \t]*[-*+>]\s+/gm, '')                // siyahi/sitat isareleri
    .replace(/^[ \t]*#{1,6}\s+/gm, '')                // basliqlar
    .replace(/[*_`]/g, '')                            // vurgu isareleri
    // DIQQET: defis (`-`) SILINMIR. `[#*_\`>|-]` sinfi "ADDA-da"-ni
    // "ADDA da" edirdi, excerpt ise istifadeciye GORUNUR.
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 6000);
}

/** Excerpt bosdursa govdeden qisa parca cixar (netice siyahisinda gorunur). */
function autoExcerpt(excerpt: unknown, body: unknown): string {
  if (typeof excerpt === 'string' && excerpt.trim()) return excerpt.trim();
  const t = searchBody(body);
  if (!t) return '';
  return t.length > 180 ? t.slice(0, 177).trimEnd() + '…' : t;
}

const allowedMediaTypes = [
  'image/*',
  'video/*',
  'audio/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.*',
  'text/plain',
  'text/csv',
];

const deniedExecutableTypes = [
  'application/vnd.microsoft.portable-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-dosexec',
  'application/x-sh',
  'text/x-shellscript',
  'application/x-mach-binary',
];

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => (({
  'users-permissions': {
    config: {
      jwtManagement: 'refresh',
      sessions: {
        httpOnly: true,
      },
    },
  },
  // --- F2.6e email (nodemailer) ---
  // Provayder-agnostikdir: SMTP env-ləri dəyişməklə Brevo / Gmail / ADDA-nın öz
  // poçt serveri arasında KOD DƏYİŞMƏDƏN keçid etmək olar.
  // SMTP_HOST təyin olunmayıbsa magic-link göndərilmir — link loga yazılır (dev rejimi).
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', ''),
        port: env.int('SMTP_PORT', 587),
        secure: env.bool('SMTP_SECURE', false),
        auth: {
          user: env('SMTP_USER', ''),
          pass: env('SMTP_PASS', ''),
        },
      },
      settings: {
        defaultFrom: env('SMTP_FROM', 'ADDA <no-reply@adda.edu.az>'),
        defaultReplyTo: env('SMTP_REPLY_TO', env('SMTP_FROM', 'no-reply@adda.edu.az')),
      },
    },
  },
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
      security: {
        allowedTypes: allowedMediaTypes,
        deniedTypes: deniedExecutableTypes,
      },
    },
  },
  meilisearch: {
    config: {
      host: env('MEILISEARCH_HOST', ''),
      apiKey: env('MEILISEARCH_ADMIN_KEY', ''),
      article: {
        indexName: 'adda',
        entriesQuery: { locale: '*', status: 'published' },
        settings: SEARCH_SETTINGS,
        transformEntry({ entry }: { entry: Record<string, any> }) {
          return {
            id: entry.id,
            documentId: entry.documentId,
            title: entry.title,
            slug: entry.slug,
            excerpt: autoExcerpt(entry.excerpt, entry.body),
            body: searchBody(entry.body),
            category: entry.category || '',
            contentType: 'article',
            locale: entry.locale,
          };
        },
      },
      program: {
        indexName: 'adda',
        entriesQuery: { locale: '*', status: 'published' },
        settings: SEARCH_SETTINGS,
        transformEntry({ entry }: { entry: Record<string, any> }) {
          return {
            id: entry.id,
            documentId: entry.documentId,
            title: entry.title,
            slug: entry.slug,
            excerpt: autoExcerpt(entry.description, entry.description),
            body: searchBody(entry.description),
            category: entry.degree || '',
            contentType: 'program',
            locale: entry.locale,
          };
        },
      },
      page: {
        indexName: 'adda',
        entriesQuery: { locale: '*', status: 'published' },
        settings: SEARCH_SETTINGS,
        transformEntry({ entry }: { entry: Record<string, any> }) {
          return {
            id: entry.id,
            documentId: entry.documentId,
            title: entry.title,
            slug: entry.slug,
            excerpt: autoExcerpt(entry.seoDescription, entry.body),
            body: searchBody(entry.body),
            category: '',
            contentType: 'page',
            locale: entry.locale,
          };
        },
      },
      // ── K20: catismayan tipler ──
      // Evvel yalniz article/program/page indekslenirdi. 345 elan, 11 sobe,
      // 2 fakulte ve butun tedbirler axtarisda UMUMIYYETLE gorunmurdu.
      announcement: {
        indexName: 'adda',
        entriesQuery: { locale: '*', status: 'published' },
        settings: SEARCH_SETTINGS,
        transformEntry({ entry }: { entry: Record<string, any> }) {
          return {
            id: entry.id,
            documentId: entry.documentId,
            title: entry.title,
            slug: entry.slug,
            excerpt: autoExcerpt(entry.excerpt, entry.body),
            body: searchBody(entry.body),
            category: entry.importance || '',
            contentType: 'announcement',
            locale: entry.locale,
          };
        },
      },
      event: {
        indexName: 'adda',
        entriesQuery: { locale: '*', status: 'published' },
        settings: SEARCH_SETTINGS,
        transformEntry({ entry }: { entry: Record<string, any> }) {
          return {
            id: entry.id,
            documentId: entry.documentId,
            title: entry.title,
            slug: entry.slug,
            excerpt: autoExcerpt(entry.excerpt, entry.body),
            body: searchBody(entry.body),
            category: entry.format || '',
            contentType: 'event',
            locale: entry.locale,
          };
        },
      },
      department: {
        indexName: 'adda',
        entriesQuery: { locale: '*', status: 'published' },
        settings: SEARCH_SETTINGS,
        transformEntry({ entry }: { entry: Record<string, any> }) {
          return {
            id: entry.id,
            documentId: entry.documentId,
            title: entry.name,
            slug: entry.slug,
            excerpt: autoExcerpt('', entry.about),
            body: searchBody(entry.about),
            category: '',
            contentType: 'department',
            locale: entry.locale,
          };
        },
      },
      faculty: {
        indexName: 'adda',
        entriesQuery: { locale: '*', status: 'published' },
        settings: SEARCH_SETTINGS,
        transformEntry({ entry }: { entry: Record<string, any> }) {
          return {
            id: entry.id,
            documentId: entry.documentId,
            title: entry.name,
            slug: entry.slug,
            excerpt: autoExcerpt('', entry.about),
            body: searchBody(entry.about),
            category: '',
            contentType: 'faculty',
            locale: entry.locale,
          };
        },
      },
    },
  },
}) as Core.Config.Plugin);

export default config;
