// İdxal vəziyyəti — HƏDƏF ÜZRƏ AYRI.
//
// PROBLEM: `data/import-state.json` `bolme/id -> documentId` saxlayır, amma
// documentId BAZAYA XASDIR. Lokal SQLite-a idxaldan sonra eyni fayl ilə prod-a
// getsək, importer sənədlərin artıq mövcud olduğunu düşünüb prod-a `PUT`
// göndərir — həmin ID-lər orada yoxdur, hamısı 404 verir və idxal "uğursuz"
// görünür, halbuki səbəb sadəcə səhv vəziyyət faylıdır.
//
// HƏLL: fayl adı hədəf host-dan törəyir:
//   http://localhost:1337          -> import-state.localhost-1337.json
//   https://adda-edu-az.onrender.com -> import-state.adda-edu-az-onrender-com.json
//
// Köhnə tək-fayl formatı avtomatik köçürülür (yalnız lokal hədəf üçün —
// o fayl lokala qarşı yaradılmışdı).
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dataPath } from './paths.mjs';
import { STRAPI_URL } from './strapi.mjs';

function hostKey(url) {
  try {
    return new URL(url).host.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  } catch {
    return 'unknown';
  }
}

export function isLocalTarget(url = STRAPI_URL) {
  return /localhost|127\.0\.0\.1/.test(url);
}

let announced = false;

export function stateFile() {
  const path = dataPath('import-state.' + hostKey(STRAPI_URL) + '.json');
  const legacy = dataPath('import-state.json');

  // Köhnə formatdan birdəfəlik köçürmə. Yalnız lokal hədəf üçün.
  if (!existsSync(path) && existsSync(legacy) && isLocalTarget()) {
    renameSync(legacy, path);
    if (!announced) {
      console.log('  [state] kohne import-state.json -> ' + path.split(/[\\/]/).pop());
      announced = true;
    }
  }
  return path;
}

export function loadState() {
  const path = stateFile();
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    console.warn('  [state] oxuna bilmedi, sifirdan baslanir');
    return {};
  }
}

export function saveState(state) {
  writeFileSync(stateFile(), JSON.stringify(state, null, 1), 'utf8');
}

/**
 * Media xəritəsi də HƏDƏF ÜZRƏ ayrıdır.
 * Cloudinary URL-i hər iki instansda eyni ola bilər, amma Strapi fayl `id`-si
 * instansa xasdır — `cover` məhz id ilə bağlanır.
 */
export function mediaMapFile() {
  return dataPath('media-map.' + hostKey(STRAPI_URL) + '.json');
}

export function loadMediaMap() {
  const path = mediaMapFile();
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    console.warn('  [media] xerite oxuna bilmedi, sifirdan baslanir');
    return {};
  }
}

export function saveMediaMap(map) {
  writeFileSync(mediaMapFile(), JSON.stringify(map, null, 1), 'utf8');
}

/**
 * Media bağlanmasının tamamlanma qeydi — hədəf üzrə.
 * Olmasa, hər təkrar run 1206 sənədə yenidən `PUT` göndərərdi (Render pulsuz
 * tarifdə saatlarla). Mənbə faylı dəyişmədiyi üçün nəticə eyni olur, yəni
 * təkrarın faydası yoxdur.
 */
export function linkedFile() {
  return dataPath('media-linked.' + hostKey(STRAPI_URL) + '.json');
}

export function loadLinked() {
  const path = linkedFile();
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return {};
  }
}

export function saveLinked(done) {
  writeFileSync(linkedFile(), JSON.stringify(done, null, 1), 'utf8');
}

/** Hədəfin adı — hesabatlarda göstərmək üçün. */
export function targetLabel() {
  return hostKey(STRAPI_URL);
}
