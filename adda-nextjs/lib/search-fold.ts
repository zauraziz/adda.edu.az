// F5.49 — axtarış üçün mətn bükməsi: kiçik hərf (Azərbaycan İ/I düzgün),
// diakritik bükmə (ə→e, ş→s …), rus hərfləri olduğu kimi. Server (data-q) və
// klient (FaqSearch) EYNİ funksiyanı işlədir. i18n lüğətini import ETMİR —
// klient paketinə düşür.
const FOLD: Record<string, string> = { ə: 'e', ı: 'i', ö: 'o', ü: 'u', ş: 's', ç: 'c', ğ: 'g', ё: 'е' };

export function searchFold(s: string): string {
  const low = s.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
  let out = '';
  for (const ch of low) out += FOLD[ch] ?? ch;
  return out.normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
}
