// Yol köməkçiləri. Bütün nəticələr tools/migration/data/ altındadır və
// .gitignore ilə repo-dan kənarda saxlanılır (yüzlərlə MB xam HTML).
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));

export const ROOT = join(here, '..');
export const DATA = join(ROOT, 'data');
export const RAW = join(DATA, 'raw');

export function ensure(dir) {
  mkdirSync(dir, { recursive: true });
  return dir;
}

/** data/raw/news/1984.az.html */
export function rawPath(section, id, locale) {
  return join(ensure(join(RAW, section)), `${id}.${locale}.html`);
}

export function dataPath(name) {
  return join(ensure(DATA), name);
}
