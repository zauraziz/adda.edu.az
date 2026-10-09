// Paylaşılan formatlaşdırma köməkçiləri — xəbər / elan / tədbir səhifələri üçün.
// (Əvvəl hər səhifədə təkrarlanırdı; F2.5b-də bir yerə çıxarıldı.)
import type { Locale } from '@/lib/i18n';

export const MONTHS: Record<Locale, string[]> = {
  az: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'],
  ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

/**
 * F5.45 — Bakı vaxtı (UTC+4; 2016-dan yay vaxtı yoxdur). Strapi tarixi UTC
 * saxlayır, redaktor isə admində Bakı vaxtı ilə yazır: saat 10:00-da olan
 * «Açıq qapı günü» saytda 06:00 görünürdü, gecə 00:00–04:00 arası tarix
 * isə bir gün əvvələ düşürdü. Sabit sürüşmə — server saat qurşağından asılı deyil.
 */
const BAKU_OFFSET_MS = 4 * 60 * 60 * 1000;
function bakuTime(iso: string): Date | null {
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? null : new Date(t + BAKU_OFFSET_MS);
}

/** ISO tarixi dilə uyğun "05 İyun 2026" formatına çevirir (Bakı vaxtı). */
export function fmtDate(iso: string | null | undefined, locale: Locale): string {
  if (!iso) return '';
  const d = bakuTime(iso);
  if (!d) return '';
  return String(d.getUTCDate()).padStart(2, '0') + ' ' + MONTHS[locale][d.getUTCMonth()] + ' ' + d.getUTCFullYear();
}

/** ISO tarixi "05 İyun 2026, 14:00" formatına (vaxtla, Bakı vaxtı) çevirir. */
export function fmtDateTime(iso: string | null | undefined, locale: Locale): string {
  const base = fmtDate(iso, locale);
  if (!base || !iso) return base;
  const d = bakuTime(iso);
  if (!d) return base;
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return base + ', ' + hh + ':' + mm;
}

/**
 * F5.45 — təhsil haqqı: kataloqda sərbəst mətndir («2700» və «2700 AZN/il»).
 * Yalnız rəqəm (+ AZN/manat, + «/il») olanda vahid yazılış: «2700 AZN/il»
 * (ru «AZN/год», en «AZN/year»); başqa mətn olduğu kimi qalır.
 */
export function fmtFee(raw: string | null | undefined, locale: Locale): string {
  const s = (raw ?? '').trim();
  if (!s) return '';
  const m = s.match(/^(\d[\d\s]*(?:[.,]\d+)?)\s*(?:AZN|manat)?\s*(?:\/\s*il)?$/i);
  if (!m) return s;
  const per = locale === 'ru' ? 'AZN/год' : locale === 'en' ? 'AZN/year' : 'AZN/il';
  return m[1].replace(/\s+/g, ' ').trim() + ' ' + per;
}

/**
 * Sosial göstəricilər üçün yığcam say: 842 · 1,2K · 23K · 1,4M.
 *
 * `Intl.NumberFormat(..., {notation:'compact'})` İŞLƏDİLMİR: Azərbaycan
 * dilində "1,2 min" verir, dizayn isə "1,2K" gözləyir və üç dildə eyni
 * qısaltma lazımdır. Onluq ayırıcı yenə də dilə uyğun gəlir.
 */
export function fmtCount(n: number | null | undefined, locale: Locale): string | null {
  if (n === null || n === undefined || !Number.isFinite(n)) return null;
  if (n < 1000) return n.toLocaleString(locale);
  const unit = n >= 1_000_000 ? 1_000_000 : 1_000;
  const v = n / unit;
  const rounded = v >= 10 ? Math.round(v) : Math.round(v * 10) / 10;
  return rounded.toLocaleString(locale, { maximumFractionDigits: 1 }) + (unit === 1_000_000 ? 'M' : 'K');
}

/**
 * F5.42 — qəbul balı: «227,6» (az/ru vergül, en nöqtə), tam bal onluqsuz
 * («329»). Əvvəl qrafik xam rəqəm yazırdı, kataloq və ixtisas səhifəsi isə
 * hərəsi öz `formatScore`-u ilə — indi hamısı bu funksiyadır.
 */
export function fmtScore(n: number | null | undefined, locale: Locale): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '';
  const s = String(Math.round(n * 100) / 100);
  return locale === 'en' ? s : s.replace('.', ',');
}

/** Article/announcement kateqoriya etiketləri (chip). */
export const CAT_LABELS: Record<Locale, Record<string, string>> = {
  az: { xeber: 'Xəbər', elan: 'Elan', tedbir: 'Tədbir', elm: 'Elm' },
  ru: { xeber: 'Новость', elan: 'Объявление', tedbir: 'Событие', elm: 'Наука' },
  en: { xeber: 'News', elan: 'Announcement', tedbir: 'Event', elm: 'Science' },
};

/** Elan əhəmiyyət etiketləri (importance: normal/vacib/kritik). */
export const IMPORTANCE_LABELS: Record<Locale, Record<string, string>> = {
  az: { normal: 'Normal', vacib: 'Vacib', kritik: 'Kritik' },
  ru: { normal: 'Обычное', vacib: 'Важное', kritik: 'Критическое' },
  en: { normal: 'Normal', vacib: 'Important', kritik: 'Critical' },
};

/** Tədbir format etiketləri (format: fiziki/onlayn/hibrid). */
export const EVENT_FORMAT_LABELS: Record<Locale, Record<string, string>> = {
  az: { fiziki: 'Fiziki', onlayn: 'Onlayn', hibrid: 'Hibrid' },
  ru: { fiziki: 'Очно', onlayn: 'Онлайн', hibrid: 'Гибрид' },
  en: { fiziki: 'In-person', onlayn: 'Online', hibrid: 'Hybrid' },
};
