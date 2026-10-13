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
  // F5.50: «Akademik tərəfdaşlar» səhifəsindəki universitetlərin şəhərləri (11 ölkə).
  { az: 'Bakı', lat: 40.4093, lng: 49.8671, size: 0.09, home: true },
  { az: 'İstanbul', lat: 41.0082, lng: 28.9784, size: 0.05 },
  { az: 'Kiyev', lat: 50.4501, lng: 30.5234, size: 0.045 },
  { az: 'Odessa', lat: 46.4825, lng: 30.7233, size: 0.04 },
  { az: 'Nikolayev', lat: 46.975, lng: 31.9946, size: 0.035 },
  { az: 'Aktau', lat: 43.6532, lng: 51.1975, size: 0.045 },
  { az: 'Batumi', lat: 41.6168, lng: 41.6367, size: 0.045 },
  { az: 'Riqa', lat: 56.9496, lng: 24.1052, size: 0.04 },
  { az: 'Liyepaya', lat: 56.5047, lng: 21.0108, size: 0.035 },
  { az: 'Tallin', lat: 59.437, lng: 24.7536, size: 0.04 },
  { az: 'Klaypeda', lat: 55.7033, lng: 21.1443, size: 0.035 },
  { az: 'Şetsin', lat: 53.4285, lng: 14.5528, size: 0.04 },
  { az: 'Varna', lat: 43.2141, lng: 27.9147, size: 0.04 },
  { az: 'Podqoritsa', lat: 42.4304, lng: 19.2594, size: 0.035 },
  { az: 'Sankt-Peterburq', lat: 59.9311, lng: 30.3609, size: 0.045 },
  { az: 'Həştərxan', lat: 46.3497, lng: 48.0408, size: 0.04 },
  { az: 'Novorossiysk', lat: 44.7239, lng: 37.7708, size: 0.035 },
  { az: 'Vladivostok', lat: 43.1155, lng: 131.8855, size: 0.04 },
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
