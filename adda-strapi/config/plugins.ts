import type { Core } from '@strapi/strapi';

// Meilisearch "adda" indeksi üçün ortaq parametrlər
const SEARCH_SETTINGS = {
  searchableAttributes: ['title', 'excerpt'],
  filterableAttributes: ['locale', 'contentType', 'category'],
  displayedAttributes: ['id', 'documentId', 'title', 'slug', 'excerpt', 'category', 'contentType', 'locale'],
  rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
};

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
            excerpt: entry.excerpt || '',
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
            excerpt: entry.description || '',
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
            excerpt: entry.seoDescription || '',
            category: '',
            contentType: 'page',
            locale: entry.locale,
          };
        },
      },
    },
  },
}) as Core.Config.Plugin);

export default config;
