// F5.49 — saytın mütləq ünvanı: sosial paylaşım keçidləri və Open Graph.
// Vercel-də NEXT_PUBLIC_SITE_URL verilə bilər (domen dəyişəndə); defolt —
// hazırkı canlı ünvan. Klientdə paylaşım komponenti window.location.origin-i
// üstün tutur (preview domenində də düzgün keçid).
import type { Metadata } from 'next';
import type { Locale } from './i18n';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://demo.adda.edu.az').replace(/\/+$/, '');

export const absUrl = (path: string): string => (/^https?:\/\//i.test(path) ? path : `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`);

const OG_LOCALE: Record<Locale, string> = { az: 'az_AZ', en: 'en_US', ru: 'ru_RU' };

/** Xəbər, elan, tədbir: paylaşılanda Facebook/Telegram/WhatsApp önizləməsi. */
export function shareMetadata(o: {
  title: string;
  description?: string | null;
  path: string;
  image?: string | null;
  locale: Locale;
  published?: string | null;
}): Metadata {
  const image = o.image ? absUrl(o.image) : absUrl('/home/emblem.webp');
  const description = o.description?.trim() || undefined;
  return {
    title: o.title,
    description,
    alternates: { canonical: absUrl(o.path) },
    openGraph: {
      type: 'article',
      siteName: 'ADDA',
      locale: OG_LOCALE[o.locale],
      title: o.title,
      description,
      url: absUrl(o.path),
      images: [{ url: image }],
      ...(o.published ? { publishedTime: o.published } : {}),
    },
    twitter: { card: o.image ? 'summary_large_image' : 'summary', title: o.title, description, images: [image] },
  };
}
