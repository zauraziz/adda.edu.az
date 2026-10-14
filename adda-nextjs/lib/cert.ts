// F5.51 — sertifikatların görünüş modeli: admin («3. Sayt — Sertifikatlar») + ehtiyat.
//
//   - Strapi əlçatmazdırsa və ya tip hələ deploy olunmayıbsa (raw = null) siyahı
//     lib/cert-fallback.ts-dəndir (skansız — yerində ikon).
//   - Mətn: aktiv dilin variantı (titleEn/titleRu), boşdursa az əsası.
//   - Qısa ad «Qurum: sənəd» — footer-də «: »-dən sonrası ikinci sətirdə.
//   - Lövbər (səhifədə #…) az qısa adından: menyudakı «Keyfiyyət siyasəti»
//     «/sertifikatlar#keyfiyyet-sahesinde-siyaset»-ə aparır.
//   - Cloudinary skanları ölçüyə görə kiçildilir (lib/home.ts → cld).
import type { Locale } from './i18n';
import { CERT_FALLBACK } from './cert-fallback';
import { cld } from './home';
import { searchFold } from './search-fold';
import { mediaUrl, type CertItemRaw } from './strapi';

export interface CertView {
  anchor: string;
  title: string;
  /** Qısa adın «: »-dən əvvəlki hissəsi (qurum). */
  org: string;
  /** «: »-dən sonrakı hissə (sənəd), yoxdursa boş. */
  doc: string;
  /** Footer üçün kiçik önizləmə. */
  thumb: string | null;
  /** Səhifədəki kart. */
  preview: string | null;
  /** Böyüdülmüş görünüş. */
  large: string | null;
  /** «Faylı aç»: yüklənən fayl (PDF), yoxdursa orijinal skan. */
  open: string | null;
  isPdf: boolean;
  footer: boolean;
}

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

function pick(row: CertItemRaw, base: 'title' | 'short', locale: Locale): string {
  const own = locale === 'en' ? str(row[`${base}En`]) : locale === 'ru' ? str(row[`${base}Ru`]) : '';
  return own || str(row[base]);
}

/** «Keyfiyyət sahəsində siyasət» → «keyfiyyet-sahesinde-siyaset». */
export function certAnchor(s: string): string {
  return (
    searchFold(s)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60)
      .replace(/-+$/g, '') || 'sertifikat'
  );
}

function split(short: string): [string, string] {
  const i = short.indexOf(': ');
  return i > 0 ? [short.slice(0, i).trim(), short.slice(i + 2).trim()] : [short.trim(), ''];
}

export function certView(raw: CertItemRaw[] | null, locale: Locale): CertView[] {
  const seen = new Set<string>();
  const anchorOf = (azText: string): string => {
    const base = certAnchor(azText);
    let a = base;
    for (let n = 2; seen.has(a); n++) a = `${base}-${n}`;
    seen.add(a);
    return a;
  };

  if (!raw) {
    return CERT_FALLBACK.map((c) => {
      const [org, doc] = split(c.short[locale] || c.short.az);
      return {
        anchor: anchorOf(c.short.az),
        title: c.title[locale] || c.title.az,
        org,
        doc,
        thumb: null,
        preview: null,
        large: null,
        open: null,
        isPdf: false,
        footer: c.footer,
      };
    });
  }

  return raw
    .filter((r) => r && !r.hidden && str(r.title))
    .map((r) => {
      const title = pick(r, 'title', locale);
      const short = pick(r, 'short', locale) || title;
      const [org, doc] = split(short);
      const img = mediaUrl(r.image);
      const file = mediaUrl(r.file);
      return {
        anchor: anchorOf(str(r.short) || str(r.title)),
        title,
        org,
        doc,
        thumb: img ? cld(img, 200) : null,
        preview: img ? cld(img, 760) : null,
        large: img ? cld(img, 1600) : null,
        open: file || img || null,
        isPdf: Boolean(file && (r.file?.mime === 'application/pdf' || /\.pdf(?:$|\?)/i.test(file))),
        footer: r.footer !== false,
      };
    });
}
