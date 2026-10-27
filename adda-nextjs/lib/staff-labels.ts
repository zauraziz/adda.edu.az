// F5.59 — əməkdaş profilinin sabit etiketləri: əməkdaş səhifəsi, /heyet kataloqu, «Profilim».
// Əvvəl hər faylda ayrıca idi və «elmler_namizedi» heç birində yox idi (kataloq filtrində
// xam «elmler_namizedi» görünürdü, profildə dərəcə yazılmırdı).
//
// Strapi enum-ları ilə EYNİ: person.academicDegree, staff.language.lang
// (adda-strapi/src/api/identity/controllers/identity.ts → DEGREES, LANGS da).
// Etiketlər az-dır, `tr()` ilə göstərilir (lib/i18n.ts).

export const DEGREE_VALUES = ['elmler_doktoru', 'felsefe_doktoru', 'elmler_namizedi', 'yoxdur'] as const;

export const DEGREE_LABEL: Record<string, string> = {
  elmler_doktoru: 'Elmlər doktoru',
  felsefe_doktoru: 'Fəlsəfə doktoru',
  elmler_namizedi: 'Elmlər namizədi',
  yoxdur: 'Yoxdur',
};

export const LANG_VALUES = ['az', 'tr', 'en', 'ru', 'de', 'fr', 'diger'] as const;
export type StaffLang = (typeof LANG_VALUES)[number];

/** «Azərbaycan dili», «Rus dili» — tək «Azərbaycan» ölkə adı kimi də tərcümə oluna bilərdi. */
export const LANG_LABEL: Record<string, string> = {
  az: 'Azərbaycan dili',
  tr: 'Türk dili',
  en: 'İngilis dili',
  ru: 'Rus dili',
  de: 'Alman dili',
  fr: 'Fransız dili',
  diger: 'Digər',
};
