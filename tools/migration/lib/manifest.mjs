// Bərpa oluna bilən yoxlama nöqtəsi (checkpoint).
//
// NİYƏ VACİB: tam crawl ~6000 sorğudur, saatlarla çəkir. Yarıda kəsilsə
// yenidən başlamaq qəbuledilməzdir — həm vaxt, həm də ADDA serverinə yük.
// Manifest hansı (bölmə, id, dil) üçlüyünün artıq alındığını saxlayır.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { FLUSH_EVERY } from '../config.mjs';
import { dataPath } from './paths.mjs';

const FILE = () => dataPath('manifest.json');

export function load() {
  const path = FILE();
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    console.warn('[manifest] oxuna bilmedi, sifirdan baslanir');
    return {};
  }
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
