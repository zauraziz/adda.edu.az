/**
 * F5.53 — Akademiyanın ümumi əlaqə nömrəsi (Zaur müəllim, 15.10.2026):
 * (012) 493 36 44. Saytda telefonun TƏK mənbəyi — footer, üst zolaq, /elaqe,
 * bölmə və əməkdaş səhifələri buradan götürür.
 *
 *   az: «(012) 493 36 44»; en/ru: «+994 12 493 36 44» (xarici oxucu üçün).
 *   Qısa (daxili) nömrə — yalnız 2–5 rəqəm, məs. «3239»: əvvəlinə ümumi nömrə
 *   yazılır: «(012) 493 36 44, daxili 3239»; zəng keçidi
 *   `tel:+994124933644,3239` (vergül — pauza, telefon daxili nömrəni özü yığır).
 *   Ümumi nömrə daxili nömrə ilə BİRLİKDƏ yazılıbsa (admində köhnə yazılış:
 *   «(+99412) 493-36-44 (3078)», «(012) 493-36-44 (daxili: 103)») — eyni format;
 *   başqa tam nömrə (məs. mobil) olduğu kimi qalır.
 *
 * Strapi-də eyni nömrə: src/utils/phone-fix.ts (`ACADEMY_PHONE_*`).
 */
import type { Locale } from './i18n';

export const ACADEMY_TEL = '+994124933644';
const LOCAL = '(012) 493 36 44';
const INTL = '+994 12 493 36 44';
const EXT_WORD: Record<Locale, string> = { az: 'daxili', en: 'ext.', ru: 'доб.' };

export interface PhoneView {
  text: string;
  href: string;
}

/** Ümumi nömrə dilin formatında. */
export function academyPhone(locale: Locale): PhoneView {
  return { text: locale === 'az' ? LOCAL : INTL, href: `tel:${ACADEMY_TEL}` };
}

/** Yalnız daxili nömrədirmi (2–5 rəqəm, «+» və şəhər kodu yoxdur)? */
export function isExtension(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  return !raw.includes('+') && digits.length >= 2 && digits.length <= 5;
}

const MAIN_DIGITS = '4933644';
const MAIN_CODES = ['', '12', '012', '99412', '0099412'];

/**
 * Ümumi nömrə + daxili nömrə(lər): «(+99412) 493-36-44 (3078)» → ['3078'],
 * «4933644 (113/ 125)» → ['113', '125'], nömrənin özü → []. Ümumi nömrə
 * deyilsə və ya sonrakı rəqəmlər daxili nömrəyə oxşamırsa (ikinci tam nömrə) → null.
 */
export function academyExtensions(raw: string): string[] | null {
  const groups = raw.match(/\d+/g) ?? [];
  let acc = '';
  for (let k = 0; k < groups.length; k++) {
    acc += groups[k];
    if (acc.length > MAIN_DIGITS.length + 7) return null;
    if (acc.endsWith(MAIN_DIGITS) && MAIN_CODES.includes(acc.slice(0, -MAIN_DIGITS.length))) {
      const rest = groups.slice(k + 1);
      return rest.length <= 3 && rest.every((g) => g.length >= 2 && g.length <= 5) ? rest : null;
    }
  }
  return null;
}

/**
 * Telefon sətri: daxili nömrəyə ümumi nömrə əlavə olunur, ümumi nömrə dilin
 * formatına gətirilir, başqa tam nömrə olduğu kimi qalır. Boş dəyər → null.
 */
export function phoneView(raw: string | null | undefined, locale: Locale): PhoneView | null {
  const v = (raw ?? '').trim();
  if (!v) return null;
  const exts = isExtension(v) ? [v.replace(/\D/g, '')] : academyExtensions(v);
  if (exts) {
    const main = academyPhone(locale);
    if (!exts.length) return main;
    return { text: `${main.text}, ${EXT_WORD[locale]} ${exts.join(', ')}`, href: `tel:${ACADEMY_TEL},${exts[0]}` };
  }
  const digits = v.replace(/[^\d+]/g, '');
  return { text: v, href: `tel:${digits}` };
}

/** Bölmənin telefonu: daxili nömrə varsa ümumi + daxili, yoxdursa ümumi nömrə. */
export function unitPhone(ext: string | null | undefined, locale: Locale): PhoneView {
  return phoneView(ext, locale) ?? academyPhone(locale);
}
