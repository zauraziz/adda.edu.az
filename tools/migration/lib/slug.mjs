// Slug generasiyası — Azərbaycan və rus əlifbaları üçün.
//
// DİQQƏT: Azərbaycan dilində iki fərqli "i" var:
//   I (nöqtəsiz böyük) -> ı -> i
//   İ (nöqtəli böyük)  -> i -> i
// Standart `toLowerCase()` bunları səhv çevirir (I -> i, halbuki Azərbaycanda
// I-nın kiçiyi ı-dır). Ona görə əvvəlcə HƏRF-HƏRF xəritələyirik, sonra
// kiçildirik — əks sıra `İstanbul` kimi sözləri korlayır.

const MAP = {
  // Azərbaycan
  ə: 'e', Ə: 'e',
  ı: 'i', I: 'i',
  İ: 'i',
  ö: 'o', Ö: 'o',
  ü: 'u', Ü: 'u',
  ç: 'c', Ç: 'c',
  ş: 's', Ş: 's',
  ğ: 'g', Ğ: 'g',
  // Türk/digər
  â: 'a', î: 'i', û: 'u',
  // Rus
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh',
  щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

// Böyük kiril hərfləri də eyni qarşılıqları alsın.
for (const [k, v] of Object.entries(MAP)) {
  const upper = k.toUpperCase();
  if (upper !== k && MAP[upper] === undefined) MAP[upper] = v;
}

export function transliterate(input) {
  let out = '';
  for (const ch of String(input || '')) out += MAP[ch] !== undefined ? MAP[ch] : ch;
  return out;
}

/** Boş nəticə üçün `fallback` qaytarılır (məs. legacy ID ilə). */
export function slugify(input, fallback = '') {
  const s = transliterate(input)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // qalan diakritiklər
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '');
  return s || fallback;
}

/**
 * Təkrarsız slug. `seen` Set-i çağıran tərəfdə saxlanılır.
 * Toqquşma olanda `-2`, `-3` ... əlavə olunur.
 */
export function uniqueSlug(base, seen) {
  let slug = base;
  let n = 2;
  while (seen.has(slug)) slug = `${base}-${n++}`;
  seen.add(slug);
  return slug;
}
