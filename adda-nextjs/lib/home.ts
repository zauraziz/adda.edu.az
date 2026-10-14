// F5.50 — ana səhifənin görünüş modeli: admin («3. Sayt — Ana səhifə») + ehtiyat.
//
// Qaydalar:
//   - Strapi əlçatmazdırsa (raw = null) hər şey lib/home-fallback.ts-dən gəlir.
//   - Mətn: aktiv dilin variantı (titleEn/titleRu), boşdursa az əsası, o da
//     boşdursa ehtiyat. Başlıqda «*söz*» → <em>söz</em> (qalan HTML qaçırılır).
//   - Şəkil: admində yüklənən → yoxdursa eyni sıradakı arxiv şəkli (lokal
//     bazada media yoxdur, prod-da seed faylı bağlayır).
//   - Siyahı boşdursa ehtiyat; elementlər VAR, amma hamısı gizlədilibsə —
//     slaydlar istisna olmaqla (hero boş qala bilməz) heç nə göstərilmir.
//   - Cloudinary şəkilləri ölçüyə görə kiçildilir (c_limit, q_auto, f_auto).
//   - Sitat bloku (F5.51): video — yüklənmiş fayl, yoxdursa YouTube; admində
//     ikisi də boşdursa düymə yoxdur. Strapi hələ köhnə sxemdədirsə (sahə
//     cavabda yoxdur) və ya əlçatmazdırsa — defolt video.
import type { Locale } from './i18n';
import { menuHref } from './menu-href';
import { mediaUrl, type HomePageRaw, type StrapiMedia } from './strapi';
import {
  HOME_CAMPUS,
  HOME_FACTS,
  HOME_QUOTE,
  HOME_QUOTE_BG,
  HOME_QUOTE_CTA,
  HOME_QUOTE_VIDEO,
  HOME_SLIDES,
  type L3,
} from './home-fallback';

export type HeroSlide = {
  img: string;
  kicker: string;
  /** HTML: qaçırılmış mətn + <em>. */
  title: string;
  lead: string;
  cta: string;
  href: string;
};
export type FactCard = { value: string; unit: string; title: string; desc: string; href: string };
export type CampusPhoto = { img: string; chip: string; title: string; note: string; href: string };
/** Sitat blokunun videosu: YouTube (kliklə, youtube-nocookie) və ya yüklənmiş fayl. `href` — JS-siz keçid. */
export type QuoteVideo =
  | { kind: 'youtube'; id: string; href: string }
  | { kind: 'file'; src: string; mime: string; href: string };
export interface QuoteView {
  text: string;
  attr: string;
  /** Fon şəkli (admin → yoxdursa əvvəlki dizaynın fotosu). */
  bg: string;
  cta: string;
  video: QuoteVideo | null;
}
export interface HomeView {
  slides: HeroSlide[];
  facts: FactCard[];
  campus: CampusPhoto[];
  quote: QuoteView;
}

type Row = Record<string, unknown>;

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/** Aktiv dilin variantı → az əsası. */
function pick(row: object | null | undefined, base: string, locale: Locale): string {
  const r = (row ?? {}) as Row;
  const own = locale === 'en' ? str(r[base + 'En']) : locale === 'ru' ? str(r[base + 'Ru']) : '';
  return own || str(r[base]);
}
const l3 = (v: L3, locale: Locale): string => v[locale] || v.az;

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
/** «Dənizçilik təhsili *1881-ci ildən*» → qaçırılmış HTML + <em>. */
export function emHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ESC[c]).replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

/** Cloudinary: ölçü + avtomatik keyfiyyət/format. Başqa host və artıq çevrilmiş ünvan toxunulmur. */
export function cld(url: string, width: number): string {
  const m = url.match(/^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/);
  if (!m) return url;
  const first = m[2].split('/')[0];
  if (!/^v\d+$/.test(first) && m[2].includes('/')) return url; // artıq transformasiya var
  return `${m[1]}c_limit,w_${width},q_auto,f_auto/${m[2]}`;
}

const img = (media: StrapiMedia | null | undefined, fallback: string, width: number): string =>
  cld(mediaUrl(media) || fallback, width);

/** YouTube ünvanı və ya ID → 11 simvollu ID (tanınmasa boş). */
export function youtubeId(v: string): string {
  const s = v.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
  return m ? m[1] : '';
}

function slidesFrom(raw: HomePageRaw | null, locale: Locale): HeroSlide[] {
  const fb = (): HeroSlide[] =>
    HOME_SLIDES.map((s) => ({
      img: cld(s.image, 1920),
      kicker: l3(s.kicker, locale),
      title: emHtml(l3(s.title, locale)),
      lead: l3(s.lead, locale),
      cta: l3(s.cta, locale),
      href: menuHref(s.url, locale),
    }));
  const rows = (raw?.heroSlides ?? []).filter((s) => s && !s.hidden && pick(s, 'title', locale));
  if (!rows.length) return fb();
  return rows.map((s, i) => {
    const url = str(s.ctaUrl);
    const cta = pick(s, 'ctaLabel', locale);
    return {
      img: img(s.image, HOME_SLIDES[i % HOME_SLIDES.length].image, 1920),
      kicker: pick(s, 'kicker', locale),
      title: emHtml(pick(s, 'title', locale)),
      lead: pick(s, 'lead', locale),
      cta: url ? cta : '',
      href: url ? menuHref(url, locale) : '',
    };
  });
}

function factsFrom(raw: HomePageRaw | null, locale: Locale): FactCard[] {
  const list = raw?.facts ?? [];
  if (!list.length) {
    return HOME_FACTS.map((f) => ({
      value: f.value,
      unit: l3(f.unit, locale),
      title: l3(f.title, locale),
      desc: l3(f.desc, locale),
      href: menuHref(f.url, locale),
    }));
  }
  return list
    .filter((f) => f && !f.hidden && str(f.value) && pick(f, 'title', locale))
    .map((f) => ({
      value: str(f.value),
      unit: pick(f, 'unit', locale),
      title: pick(f, 'title', locale),
      desc: pick(f, 'desc', locale),
      href: str(f.url) ? menuHref(str(f.url), locale) : '',
    }));
}

function campusFrom(raw: HomePageRaw | null, locale: Locale): CampusPhoto[] {
  const rows = (raw?.campusCards ?? []).slice(0, HOME_CAMPUS.length);
  return HOME_CAMPUS.map((fb, i) => {
    const r = rows[i];
    const url = str(r?.url) || fb.url;
    return {
      img: img(r?.image, fb.image, i === 0 ? 1400 : 900),
      chip: pick(r, 'chip', locale) || l3(fb.chip, locale),
      title: pick(r, 'title', locale) || l3(fb.title, locale),
      note: pick(r, 'note', locale) || l3(fb.note, locale),
      href: menuHref(url, locale),
    };
  });
}

function quoteFrom(raw: HomePageRaw | null, locale: Locale): QuoteView {
  let video: QuoteVideo | null = null;
  const file = mediaUrl(raw?.quoteVideoFile);
  if (file) {
    video = { kind: 'file', src: file, mime: str(raw?.quoteVideoFile?.mime) || 'video/mp4', href: file };
  } else {
    // Sahə cavabda yoxdursa (Strapi köhnə sxemdə / əlçatmaz) — defolt; boşdursa — video yoxdur.
    const yt = raw && 'quoteVideo' in raw ? str(raw.quoteVideo) : HOME_QUOTE_VIDEO;
    const id = youtubeId(yt);
    if (id) video = { kind: 'youtube', id, href: `https://www.youtube.com/watch?v=${id}` };
  }
  return {
    text: pick(raw, 'quote', locale) || l3(HOME_QUOTE.text, locale),
    attr: pick(raw, 'quoteAttr', locale) || l3(HOME_QUOTE.attr, locale),
    bg: img(raw?.quoteImage, HOME_QUOTE_BG, 2000),
    cta: pick(raw, 'quoteCta', locale) || l3(HOME_QUOTE_CTA, locale),
    video,
  };
}

export function homeView(raw: HomePageRaw | null, locale: Locale): HomeView {
  return {
    slides: slidesFrom(raw, locale),
    facts: factsFrom(raw, locale),
    campus: campusFrom(raw, locale),
    quote: quoteFrom(raw, locale),
  };
}
