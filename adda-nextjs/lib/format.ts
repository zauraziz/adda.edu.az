// Paylaşılan formatlaşdırma köməkçiləri — xəbər / elan / tədbir səhifələri üçün.
// (Əvvəl hər səhifədə təkrarlanırdı; F2.5b-də bir yerə çıxarıldı.)
import type { Locale } from '@/lib/i18n';

export const MONTHS: Record<Locale, string[]> = {
  az: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'],
  ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

/** ISO tarixi dilə uyğun "05 İyun 2026" formatına çevirir. */
export function fmtDate(iso: string | null | undefined, locale: Locale): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return String(d.getUTCDate()).padStart(2, '0') + ' ' + MONTHS[locale][d.getUTCMonth()] + ' ' + d.getUTCFullYear();
}

/** ISO tarixi "05 İyun 2026, 14:00" formatına (vaxtla) çevirir. */
export function fmtDateTime(iso: string | null | undefined, locale: Locale): string {
  const base = fmtDate(iso, locale);
  if (!base || !iso) return base;
  const d = new Date(iso);
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return base + ', ' + hh + ':' + mm;
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
