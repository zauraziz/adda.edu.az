import { tr, type Locale } from './i18n';

export type IntlCity = {
  /** Aktiv dilə çevrilmiş ad — qlobus tooltip-ində göstərilir. */
  name: string;
  lat: number;
  lng: number;
  size: number;
  home?: boolean;
};

// Koordinatlar/ölçülər dildən asılı deyil. Adlar tr() ilə çevrilir:
// əvvəl HomeClient-dəki CITIES massivi xam azərbaycanca idi və tooltip
// /ru, /en-də də azərbaycanca göstərirdi. Tərcümələr T-dədir (ix-cities
// sətrindən çıxarılıb — yeni tərcümə uydurulmayıb).
const BASE: { az: string; lat: number; lng: number; size: number; home?: boolean }[] = [
  { az: 'Bakı', lat: 40.4093, lng: 49.8671, size: 0.09, home: true },
  { az: 'İstanbul', lat: 41.0082, lng: 28.9784, size: 0.045 },
  { az: 'Varna', lat: 43.2141, lng: 27.9147, size: 0.04 },
  { az: 'Gdynia', lat: 54.5189, lng: 18.5305, size: 0.04 },
  { az: 'Rotterdam', lat: 51.9244, lng: 4.4777, size: 0.045 },
  { az: 'Sautgempton', lat: 50.9097, lng: -1.4044, size: 0.04 },
  { az: 'Tokio', lat: 35.6762, lng: 139.6503, size: 0.05 },
  { az: 'Şanxay', lat: 31.2304, lng: 121.4737, size: 0.045 },
  { az: 'İsgəndəriyyə', lat: 31.2001, lng: 29.9187, size: 0.04 },
  { az: 'Konstansa', lat: 44.1598, lng: 28.6348, size: 0.04 },
];

export function intlCities(locale: Locale): IntlCity[] {
  return BASE.map((c) => ({
    name: tr(c.az, locale),
    lat: c.lat,
    lng: c.lng,
    size: c.size,
    ...(c.home ? { home: true } : {}),
  }));
}
