// K26-11 — heyət kataloqunun server hissəsi.
//
// İŞ BÖLGÜSÜ: bütün tərcümə və filtr seçimlərinin hazırlanması BURADA olur,
// adaya yalnız hazır sətirlər gedir. Səbəb: i18n lüğəti 55 kB-dır və client
// bundle-a düşməməlidir.

import { getStaffDirectory, mediaUrl, type PersonFull, type StaffType } from '@/lib/strapi';
import { tr, type Locale } from '@/lib/i18n';
import StaffDirectoryIsland, {
  type DirectoryPerson,
  type FilterOption,
} from './StaffDirectoryIsland';

/**
 * Azərbaycan əlifbası. Latın A–Z DEYİL: Ç, Ə, Ğ, İ, Ö, Ş, Ü ayrı hərflərdir
 * və `Ə` ilə başlayan soyadlar `E`-nin altında gizlənməməlidir.
 */
const ALPHABET = [
  'A', 'B', 'C', 'Ç', 'D', 'E', 'Ə', 'F', 'G', 'Ğ', 'H', 'X', 'I', 'İ', 'J',
  'K', 'Q', 'L', 'M', 'N', 'O', 'Ö', 'P', 'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'Y', 'Z',
];

const DEGREE_LABEL: Record<string, string> = {
  elmler_doktoru: 'Elmlər doktoru',
  felsefe_doktoru: 'Fəlsəfə doktoru',
  yoxdur: 'Yoxdur',
};

const LANG_LABEL: Record<string, string> = {
  az: 'Azərbaycan',
  tr: 'Türk',
  en: 'İngilis',
  ru: 'Rus',
  diger: 'Digər',
};

/**
 * Vəzifə dərəcəsi.
 *
 * Siyahı əvvəl Strapi-dən `name:asc` ilə gəlirdi — `name` isə ştatdakı
 * "Soyad Ad Ata" formasıdır, yəni sıralama SOYAD üzrə idi və vəzifəni
 * nəzərə almırdı. Kataloqda professorla müəllimin qarışıq durması
 * oxunuşu çətinləşdirir.
 *
 * İndi: əvvəlcə vəzifə dərəcəsi, sonra göstərilən ad (əlifba, `az`).
 *
 * SIRALI NAXIŞLAR, sadə sətir axtarışı DEYİL. Sətir axtarışı iki tələ
 * yaradırdı: `Rektor` ⊂ `Prorektor` (prorektor rektor səviyyəsinə qalxırdı)
 * və `Müəllim` ⊂ `Baş müəllim`. Lövbərli və sıralı naxışlar bunu həll edir —
 * siyahı yuxarıdan aşağı yoxlanılır, ilk uyğunluq qazanır. Ştatdakı
 * qısaldılmış yazılışlar (`…üzrə pr.`) da nəzərə alınıb.
 */
const RANK_PATTERNS: [RegExp, number][] = [
  [/^rektor$/i, 0],
  [/prorektor|üzrə\s*pr\.?$/i, 1],
  [/elmi katib/i, 2],
  [/kafedra müdiri/i, 3],
  [/dekan müavini/i, 5],
  [/^dekan$/i, 4],
  [/müdir müavini/i, 7],
  [/şöbə müdiri|^müdir$/i, 6],
  [/professor/i, 10],
  [/dosent/i, 11],
  [/baş müəllim/i, 12],
  [/müəllim/i, 13],
];

/** Siyahıda olmayan vəzifə ortada qalır — sona atılıb gözdən itmir. */
function rankOf(position: string): number {
  const v = String(position || '').trim();
  for (const [re, rank] of RANK_PATTERNS) if (re.test(v)) return rank;
  return 50;
}

/**
 * Əlifba indeksi üçün ilk hərf.
 *
 * `displayName` ("Ad Ata Soyad") üzərində işləyir, `name` ("Soyad Ad Ata")
 * üzərində YOX. Əks halda indeks ADA görə deyil, SOYADA görə filtrə çevrilirdi
 * — istifadəçi "Eldar" axtarıb "Q" hərfinin altında tapmalı olurdu.
 */
function firstLetter(name: string): string {
  const ch = (name.trim()[0] ?? '').toUpperCase();
  return ALPHABET.includes(ch) ? ch : '#';
}

function options(values: (string | null | undefined)[], locale: Locale): FilterOption[] {
  const seen = new Set<string>();
  for (const v of values) if (v) seen.add(v);
  return [...seen]
    .map((v) => ({ value: v, label: tr(v, locale) }))
    .sort((a, b) => a.label.localeCompare(b.label, 'az'));
}

export default async function StaffDirectory({
  locale,
  types,
  basePath,
}: {
  locale: Locale;
  /** Verilməsə bütün heyət göstərilir. */
  types?: StaffType[];
  basePath: string;
}) {
  const all = await getStaffDirectory(locale).catch(() => [] as PersonFull[]);

  const filtered = types
    ? all.filter((p) => (p.roles ?? []).some((r) => types.includes(r.staffType)))
    : all;

  // Vəzifə dərəcəsi, sonra ad. `localeCompare(..., 'az')` Azərbaycan
  // əlifbasını nəzərə alır: `Ç`, `Ə`, `Ğ`, `İ`, `Ö`, `Ş`, `Ü` düzgün yerə düşür.
  const ordered = [...filtered].sort((a, b) => {
    const rank = (x: PersonFull) => {
      const own = (x.roles ?? []).filter((r) => !types || types.includes(r.staffType));
      return own.length ? Math.min(...own.map((r) => rankOf(r.position))) : 99;
    };
    const ra = rank(a);
    const rb = rank(b);
    if (ra !== rb) return ra - rb;
    return (a.displayName || a.name).localeCompare(b.displayName || b.name, 'az');
  });

  const people: DirectoryPerson[] = ordered.map((p) => {
    const roles = p.roles ?? [];
    // Bu görünüşə aid rol — yoxdursa birinci rol.
    const primary = (types ? roles.find((r) => types.includes(r.staffType)) : roles[0]) ?? roles[0];
    const shown = p.displayName || p.name;
    return {
      slug: p.slug,
      name: shown,
      letter: firstLetter(shown),
      position: tr(primary?.position ?? p.position ?? '', locale),
      unit: primary?.unitName ? tr(primary.unitName, locale) : p.unit ? tr(p.unit.name, locale) : null,
      building: p.building ? tr(p.building, locale) : null,
      degree: p.academicDegree ? tr(DEGREE_LABEL[p.academicDegree] ?? p.academicDegree, locale) : null,
      academicTitle: p.academicTitle ? tr(p.academicTitle, locale) : null,
      photo: mediaUrl(p.photo),
      email: p.email ?? null,
      phone: p.phone ?? null,
      tags: (p.researchAreas ?? []).map((t) => tr(t.label, locale)),
      langs: (p.languages ?? []).map((l) => l.lang),
      types: roles.map((r) => r.staffType),
    };
  });

  const labels: Record<string, string> = {
    searchPlaceholder: tr('Ad, vəzifə və ya bölmə üzrə axtarın', locale),
    areaPlaceholder: tr('Tədqiqat sahəsi üzrə axtarın', locale),
    alphabet: tr('Əlifba üzrə', locale),
    all: tr('Hamısı', locale),
    found: tr('Tapıldı', locale),
    reset: tr('Filtrləri sıfırla', locale),
    noResults: tr('Axtarışa uyğun nəticə tapılmadı. Filtrləri dəyişin.', locale),
    building: tr('Tədris binası', locale),
    unit: tr('Struktur bölmə', locale),
    degree: tr('Elmi dərəcə', locale),
    position: tr('Vəzifə', locale),
    lang: tr('Dil', locale),
  };

  const langValues = [...new Set(people.flatMap((p) => p.langs))];

  return (
    <StaffDirectoryIsland
      people={people}
      alphabet={ALPHABET}
      filters={{
        building: options(people.map((p) => p.building), locale),
        unit: options(people.map((p) => p.unit), locale),
        degree: options(people.map((p) => p.degree), locale),
        position: options(people.map((p) => p.position), locale),
        lang: langValues
          .map((v) => ({ value: v, label: tr(LANG_LABEL[v] ?? v, locale) }))
          .sort((a, b) => a.label.localeCompare(b.label, 'az')),
      }}
      labels={labels}
      basePath={basePath}
    />
  );
}
