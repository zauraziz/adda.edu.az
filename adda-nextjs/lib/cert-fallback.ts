/**
 * F5.51 — Akademiyanın sertifikatları: «3. Sayt — Sertifikatlar»-ın EHTİYATI.
 *
 * Strapi-dəki defoltların (adda-strapi/src/utils/cert-block.ts → DEFAULT_CERTS)
 * EYNİ surəti, şəkilsiz: Strapi əlçatmaz olanda və ya tip hələ deploy
 * olunmayanda sayt bu siyahını göstərir (skan yerində ikon). Birini
 * dəyişəndə o birini də dəyiş (ardıcıllıq yoxlaması: same51).
 */
import type { L3 } from './home-fallback';

export interface CertSeed {
  title: L3;
  /** «Qurum: sənəd» — footer-də «: »-dən sonrası ikinci sətirdə. */
  short: L3;
  footer: boolean;
}

export const CERT_FALLBACK: CertSeed[] = [
  {
    title: {
      az: 'Azərbaycan Dövlət Dəniz Akademiyasının tanınması haqqında Azərbaycan Respublikasının Dövlət Dəniz Administrasiyasının şəhadətnaməsi',
      en: 'Certificate of the State Maritime Administration of the Republic of Azerbaijan on the recognition of the Azerbaijan State Marine Academy',
      ru: 'Свидетельство Государственной морской администрации Азербайджанской Республики о признании Азербайджанской государственной морской академии',
    },
    short: {
      az: 'Dövlət Dəniz Administrasiyası: tanınma şəhadətnaməsi',
      en: 'State Maritime Administration: certificate of recognition',
      ru: 'Государственная морская администрация: свидетельство о признании',
    },
    footer: true,
  },
  {
    title: {
      az: 'Azərbaycan Respublikası Təhsil Nazirliyinin akkreditasiya sertifikatı',
      en: 'Accreditation certificate of the Ministry of Education of the Republic of Azerbaijan',
      ru: 'Сертификат об аккредитации Министерства образования Азербайджанской Республики',
    },
    short: {
      az: 'Təhsil Nazirliyi: akkreditasiya sertifikatı',
      en: 'Ministry of Education: accreditation certificate',
      ru: 'Министерство образования: сертификат об аккредитации',
    },
    // F5.58 — admində footer-dən çıxarılıb (16.10.2026): ehtiyat da 3 sənəd göstərsin.
    footer: false,
  },
  {
    title: {
      az: 'Beynəlxalq Dəniz Universitetləri Assosiasiyasına üzvlük sertifikatı',
      en: 'Certificate of membership of the International Association of Maritime Universities (IAMU)',
      ru: 'Сертификат о членстве в Международной ассоциации морских университетов (IAMU)',
    },
    short: {
      az: 'IAMU: üzvlük sertifikatı',
      en: 'IAMU: certificate of membership',
      ru: 'IAMU: сертификат о членстве',
    },
    footer: true,
  },
  {
    title: {
      az: 'ISO 9001:2015 sertifikatı (ingilis dilində)',
      en: 'ISO 9001:2015 certificate (English)',
      ru: 'Сертификат ISO 9001:2015 (на английском языке)',
    },
    short: {
      az: 'ISO 9001:2015: sertifikat (ingiliscə)',
      en: 'ISO 9001:2015: certificate (English)',
      ru: 'ISO 9001:2015: сертификат (на английском)',
    },
    footer: false,
  },
  {
    title: {
      az: 'ISO 9001:2015 sertifikatı',
      en: 'ISO 9001:2015 certificate',
      ru: 'Сертификат ISO 9001:2015',
    },
    short: {
      az: 'ISO 9001:2015: keyfiyyət idarəetmə sistemi',
      en: 'ISO 9001:2015: quality management system',
      ru: 'ISO 9001:2015: система менеджмента качества',
    },
    footer: true,
  },
  {
    title: {
      az: 'Keyfiyyət sahəsində siyasət',
      en: 'Quality policy',
      ru: 'Политика в области качества',
    },
    short: {
      az: 'Keyfiyyət sahəsində siyasət',
      en: 'Quality policy',
      ru: 'Политика в области качества',
    },
    footer: false,
  },
];
