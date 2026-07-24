// MƏRHƏLƏ 1 — xam HTML yığımı.
//
// MEMARLIQ QƏRARI: crawl və parse AYRIDIR. Bu mərhələ heç nə çıxarmır,
// yalnız xam HTML-i diskə yazır. Səbəb: selektorları tənzimləmək üçün
// ADDA-nın serverinə TƏKRAR getmək lazım gəlməsin. Bir dəfə yığ, dəfələrlə parse et.
//
// İstifadə:
//   node crawl.mjs                                 # hamısı, hər üç dil
//   node crawl.mjs --section=news --from=1900 --to=1984
//   node crawl.mjs --section=content --locales=az
//   node crawl.mjs --min-bytes=8000                # az kiçikdirsə ru/en atlanır
//   node crawl.mjs --dry-run                       # yalnız planı göstər
//
// Bərpa olunandır: təkrar işlədəndə artıq alınmışları atlayır.
import { writeFileSync } from 'node:fs';
import { BASE, LOCALES, SECTIONS } from './config.mjs';
import { get } from './lib/http.mjs';
import { flush, key, load, record } from './lib/manifest.mjs';
import { rawPath } from './lib/paths.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v === undefined ? true : v];
  })
);

const sections = args.section ? String(args.section).split(',') : Object.keys(SECTIONS);
const locales = args.locales ? String(args.locales).split(',') : LOCALES;
const minBytes = args['min-bytes'] ? parseInt(args['min-bytes'], 10) : 0;
const dryRun = Boolean(args['dry-run']);

const manifest = load();
let planned = 0;
for (const name of sections) {
  const s = SECTIONS[name];
  if (!s) {
    console.error(`Bilinmeyen bolme: ${name}`);
    process.exit(1);
  }
  const from = args.from ? parseInt(args.from, 10) : s.from;
  const to = args.to ? parseInt(args.to, 10) : s.to;
  planned += (to - from + 1) * locales.length;
}

console.log(`Bolmeler : ${sections.join(', ')}`);
console.log(`Diller   : ${locales.join(', ')}`);
console.log(`Maks sorgu: ~${planned} (artiq alinanlar atlanir)`);
if (minBytes) console.log(`az < ${minBytes} bayt olanda ru/en atlanir`);
console.log(`Tex. vaxt : ~${Math.ceil((planned * 0.4) / 60)} deqiqe\n`);

if (dryRun) {
  console.log('--dry-run: hec bir sorgu gonderilmedi.');
  process.exit(0);
}

let fetched = 0;
let skipped = 0;
let missed = 0;

for (const name of sections) {
  const section = SECTIONS[name];
  const from = args.from ? parseInt(args.from, 10) : section.from;
  const to = args.to ? parseInt(args.to, 10) : section.to;

  for (let id = from; id <= to; id++) {
    let azBytes = null;

    for (const locale of locales) {
      if (manifest[key(name, id, locale)]) {
        skipped++;
        continue;
      }
      // az kiçik çıxıbsa bu ID boşdur — qalan dilləri yükləməyə dəyməz.
      if (minBytes && locale !== 'az' && azBytes !== null && azBytes < minBytes) {
        record(manifest, name, id, locale, { status: -1, bytes: 0, note: 'az-bos' });
        skipped++;
        continue;
      }

      const url = BASE + section.path(locale, id);
      const res = await get(url);
      if (locale === 'az') azBytes = res.bytes;

      if (res.status === 200 && res.bytes > 0) {
        writeFileSync(rawPath(name, id, locale), res.body, 'utf8');
        fetched++;
      } else {
        missed++;
      }
      record(manifest, name, id, locale, { status: res.status, bytes: res.bytes, error: res.error || undefined });

      if ((fetched + missed) % 50 === 0) {
        process.stdout.write(`\r  ${name}: id ${id} | alinan ${fetched} | bos ${missed} | atlanan ${skipped}   `);
      }
    }
  }
  flush(manifest);
  console.log(`\n  ${name} bitdi.`);
}

flush(manifest);
console.log(`\nCrawl bitdi. Alinan ${fetched} | bos ${missed} | atlanan ${skipped}`);
console.log('Novbeti: npm install && node inventory.mjs\n');
