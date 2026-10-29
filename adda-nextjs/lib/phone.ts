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
 *   F5.59: başqa şəhər/mobil nömrəsi «(012) 371-03-24» də eyni qayda ilə — az
 *   «(012) 371 03 24», en/ru «+994 12 371 03 24», keçid `tel:+994123710324`;
 *   F5.60: ölkə kodu ilə yazılış «(+994 12) 371-95-84» də; bir sahədə vergüllə bir neçə
 *   tam nömrə — hər biri ayrıca keçid (`phoneViews`: kollecin iki nömrəsi);
 *   qalan yazılışlar olduğu kimi qalır.
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
/** «(012) 371-03-24», «(050) 123 45 67» — şəhər kodu mötərizədə, 7 rəqəm. */
const LOCAL_FULL = /^\(0(\d{2})\)\s*(\d{3})[\s-]?(\d{2})[\s-]?(\d{2})$/;
/** F5.60 — «(+994 12) 371-95-84», «+994 50 123 45 67», «(99412) 3719584» — ölkə kodu ilə. */
const INTL_FULL = /^\(?(?:\+|00)?994\)?[\s-]*\(?(\d{2})\)?[\s-]*(\d{3})[\s-]?(\d{2})[\s-]?(\d{2})$/;

/** Tam nömrə (ümumi nömrədən başqa): şəhər/operator kodu və 7 rəqəm üç qrupda. */
function fullNumber(v: string): [string, string, string, string] | null {
  const m = LOCAL_FULL.exec(v) ?? INTL_FULL.exec(v);
  return m ? [m[1], m[2], m[3], m[4]] : null;
}
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
  const m = fullNumber(v);
  if (m) {
    const [code, a, b, c] = m;
    return { text: locale === 'az' ? `(0${code}) ${a} ${b} ${c}` : `+994 ${code} ${a} ${b} ${c}`, href: `tel:+994${code}${a}${b}${c}` };
  }
  // Tanınmayan yazılış olduğu kimi; keçid birinci nömrəyə (ayırıcıdan sonrakı rəqəmlər qoşulmur).
  const digits = v.split(/[,;/]/)[0].replace(/[^\d+]/g, '');
  return { text: v, href: `tel:${digits}` };
}

/**
 * F5.60 — sahədə vergül və ya nöqtəli vergüllə bir neçə TAM nömrə: hər biri öz formatında və
 * öz keçidi ilə. Sətir bütövlükdə tanınırsa (ümumi + daxili nömrə, tək nömrə) və ya
 * hissələrdən biri tam nömrə deyilsə — bir nömrə (phoneView). Boş dəyər → [].
 */
export function phoneViews(raw: string | null | undefined, locale: Locale): PhoneView[] {
  const v = (raw ?? '').trim();
  const one = phoneView(v, locale);
  if (!one) return [];
  if (isExtension(v) || academyExtensions(v) || fullNumber(v)) return [one];
  const parts = v.split(/\s*[,;]\s*/).filter(Boolean);
  const whole = (p: string): boolean => Boolean(fullNumber(p)) || academyExtensions(p)?.length === 0;
  if (parts.length > 1 && parts.every(whole)) {
    return parts.map((p) => phoneView(p, locale)).filter((x): x is PhoneView => x !== null);
  }
  return [one];
}

/** Bölmənin telefonu: daxili nömrə varsa ümumi + daxili, tam nömrə(lər) öz formatında, boşdursa ümumi nömrə. */
export function unitPhones(ext: string | null | undefined, locale: Locale): PhoneView[] {
  const list = phoneViews(ext, locale);
  return list.length ? list : [academyPhone(locale)];
}
