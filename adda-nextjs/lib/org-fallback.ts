// F5.49 — «Rəsmi qurumlar»: Strapi əlçatmaz olanda (və ya tip hələ deploy
// olunmayanda) footer və rəsmi zolaq bu siyahını göstərir. EYNİ siyahı:
// adda-strapi/src/utils/org-block.ts (DEFAULT_ORGS) — admində ilk dəfə yazılan.
import type { OrgItem } from './strapi';
import type { Locale } from './i18n';

export const FALLBACK_ORGS: OrgItem[] = [
  {
    name: 'Rəqəmsal İnkişaf və Nəqliyyat Nazirliyi',
    nameEn: 'Ministry of Digital Development and Transport',
    nameRu: 'Министерство цифрового развития и транспорта',
    short: 'RİNN',
    url: 'https://mincom.gov.az',
    logo: null,
    parent: false,
    hidden: false,
  },
  {
    name: 'Elm və Təhsil Nazirliyi',
    nameEn: 'Ministry of Science and Education',
    nameRu: 'Министерство науки и образования',
    short: 'ETN',
    url: 'https://edu.gov.az',
    logo: null,
    parent: false,
    hidden: false,
  },
  {
    name: 'Dövlət Dəniz və Liman Agentliyi',
    nameEn: 'State Maritime and Port Agency',
    nameRu: 'Государственное агентство моря и портов',
    short: 'DDLA',
    url: 'https://ddla.gov.az',
    logo: null,
    parent: false,
    hidden: false,
  },
  {
    name: 'Nəqliyyat və Kommunikasiya Holdinqi',
    nameEn: 'Transport and Communications Holding',
    nameRu: 'Транспортно-коммуникационный холдинг',
    short: 'AZCON',
    url: 'https://azcon.gov.az',
    logo: null,
    parent: false,
    hidden: false,
  },
  {
    name: 'Azərbaycan Xəzər Dəniz Gəmiçiliyi QSC',
    nameEn: 'Azerbaijan Caspian Shipping Company CJSC',
    nameRu: 'ЗАО «Азербайджанское Каспийское морское пароходство»',
    short: 'ASCO',
    url: 'https://asco.az',
    logo: null,
    parent: true,
    hidden: false,
  },
];

/** Qurumun adı səhifənin dilində; tərcümə boşdursa az. */
export function orgName(o: OrgItem, locale: Locale): string {
  const t = locale === 'en' ? o.nameEn : locale === 'ru' ? o.nameRu : null;
  return (t ?? '').trim() || o.name;
}

/** Görünən qurumlar (gizlədilməyən, adı və saytı olan) — admin sırası ilə. */
export function visibleOrgs(items: OrgItem[] | null): OrgItem[] {
  return (items ?? FALLBACK_ORGS).filter((o) => !o.hidden && o.name?.trim() && o.url?.trim());
}

/** Rəsmi zolaqda göstərilən «tabe olduğu qurum» (birincisi). */
export function parentOrg(items: OrgItem[] | null): OrgItem | null {
  return visibleOrgs(items).find((o) => o.parent) ?? null;
}

/** Azərbaycan dilində yiyəlik hal şəkilçisi (abreviatura üçün): ASCO → ASCO-nun, DDLA → DDLA-nın, ETN → ETN-in. */
function azGenitive(word: string): string {
  const low = word.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
  const vowels = 'aıoueəiöü';
  const last = low.slice(-1);
  const lastVowel = [...low].reverse().find((ch) => vowels.includes(ch)) ?? 'e';
  const suffix = 'aı'.includes(lastVowel) ? 'ın' : 'ou'.includes(lastVowel) ? 'un' : 'öü'.includes(lastVowel) ? 'ün' : 'in';
  return `${word}-${vowels.includes(last) ? 'n' : ''}${suffix}`;
}

/** Rəsmi zolaqdakı yazı: «ASCO-nun tabeliyində» / «Under ASCO» / «В ведении ASCO». */
export function parentLabel(o: OrgItem, locale: Locale): string {
  const short = (o.short ?? '').trim() || orgName(o, locale);
  if (locale === 'en') return `Under ${short}`;
  if (locale === 'ru') return `В ведении ${short}`;
  return `${azGenitive(short)} tabeliyində`;
}

/** ASCO-nun öz səhifəsi saytdadır (F5.49); digər qurum üçün — onun saytı. */
export function parentHref(o: OrgItem, locale: Locale): { href: string; external: boolean } {
  return (o.short ?? '').trim().toUpperCase() === 'ASCO'
    ? { href: `/${locale}/sehife/asco-ve-akademiya`, external: false }
    : { href: o.url, external: true };
}
