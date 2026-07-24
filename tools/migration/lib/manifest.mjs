// Bərpa oluna bilən yoxlama nöqtəsi (checkpoint).
//
// NİYƏ VACİB: tam crawl ~6000 sorğudur, saatlarla çəkir. Yarıda kəsilsə
// yenidən başlamaq qəbuledilməzdir — həm vaxt, həm də ADDA serverinə yük.
// Manifest hansı (bölmə, id, dil) üçlüyünün artıq alındığını saxlayır.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { FLUSH_EVERY } from '../config.mjs';
import { dataPath } from './paths.mjs';

const FILE = () => dataPath('manifest.json');

// Manifest formatı K1a-da dəyişdi (`kind` sahəsi əlavə olundu). K1-in köhnə
// manifesti ilə davam etmək səssiz korrupsiyaya gətirib çıxarır: köhnə qeydlərdə
// `kind` yoxdur, ona görə real səhifələr "tapılmadı" sayılıb ru/en yüklənməz.
export const MANIFEST_VERSION = 2;

export function load() {
  const path = FILE();
  if (!existsSync(path)) return { __version: MANIFEST_VERSION };
  let data;
  try {
    data = JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    console.warn('[manifest] oxuna bilmedi, sifirdan baslanir');
    return { __version: MANIFEST_VERSION };
  }
  if (data.__version !== MANIFEST_VERSION) {
    console.error('\n  XETA: data/ qovlugu KOHNE formatdadir (K1-den qalib).');
    console.error('  Kohne run bos sablonlari da diske yazmisdi, hemin fayllar zibildir.');
    console.error('\n  Hell (Windows):   rmdir /s /q data');
    console.error('       (PowerShell):  Remove-Item -Recurse -Force data');
    console.error('\n  Sonra crawl-i yeniden basla.\n');
    process.exit(1);
  }
  return data;
}

export function key(section, id, locale) {
  return `${section}/${id}/${locale}`;
}

let pending = 0;

export function record(manifest, section, id, locale, entry) {
  manifest[key(section, id, locale)] = entry;
  if (++pending >= FLUSH_EVERY) flush(manifest);
}

export function flush(manifest) {
  writeFileSync(FILE(), JSON.stringify(manifest, null, 1), 'utf8');
  pending = 0;
}
