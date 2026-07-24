// MƏRHƏLƏ 1 — xam HTML yığımı.
//
// MEMARLIQ QƏRARI: crawl və parse AYRIDIR. Bu mərhələ heç nə çıxarmır,
// yalnız xam HTML-i diskə yazır. Səbəb: selektorları tənzimləmək üçün
// ADDA-nın serverinə TƏKRAR getmək lazım gəlməsin. Bir dəfə yığ, dəfələrlə parse et.
//
// AZ-ƏVVƏL MƏNTİQİ: hər ID üçün əvvəlcə yalnız `az` yüklənir və təsnif olunur.
// Boş çıxarsa ru/en heç yüklənmir — boş ID 3 yerinə 1 sorğuya başa gəlir.
// Zond göstərdi ki, aralıqların böyük hissəsi boşdur (news 1..1091 tamamilə),
// ona görə bu, ~35% qənaətdir.
//
// İstifadə:
//   node crawl.mjs                                 # hamısı
//   node crawl.mjs --section=news --from=1900 --to=1984
//   node crawl.mjs --section=content
//   node crawl.mjs --locales=az                    # yalnız az
//   node crawl.mjs --dry-run                       # yalnız planı göstər
//   node crawl.mjs --force                         # manifesti nəzərə alma
//
// Bərpa olunandır: təkrar işlədəndə artıq alınmışları atlayır.
import { writeFileSync } from 'node:fs';
import { BASE, LOCALES, SECTIONS } from './config.mjs';
import { get } from './lib/http.mjs';
import { MANIFEST_VERSION, flush, key, load, record } from './lib/manifest.mjs';
import { rawPath } from './lib/paths.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v === undefined ? true : v];
  })
);

const sections = args.section ? String(args.section).split(',') : Object.keys(SECTIONS);
const locales = args.locales ? String(args.locales).split(',') : LOCALES;
const dryRun = Boolean(args['dry-run']);
const force = Boolean(args.force);

for (const name of sections) {
  if (!SECTIONS[name]) {
    console.error(`Bilinmeyen bolme: ${name}. Movcud: ${Object.keys(SECTIONS).join(', ')}`);
    process.exit(1);
  }
}

const manifest = force ? { __version: MANIFEST_VERSION } : load();
const hasAz = locales.includes('az');
const others = locales.filter((l) => l !== 'az');

let probes = 0;
for (const name of sections) {
  const s = SECTIONS[name];
  const from = args.from ? parseInt(args.from, 10) : s.from;
  const to = args.to ? parseInt(args.to, 10) : s.to;
  probes += to - from + 1;
}

console.log(`Bolmeler  : ${sections.join(', ')}`);
console.log(`Diller    : ${locales.join(', ')}`);
console.log(`az zondu  : ${probes} sorgu`);
console.log(`+ tapilan her ID ucun ${others.length} elave sorgu`);
console.log(`Tex. vaxt : ${Math.ceil((probes * 0.4) / 60)}-${Math.ceil((probes * 0.4 * 2.2) / 60)} deqiqe\n`);

if (dryRun) {
  console.log('--dry-run: hec bir sorgu gonderilmedi.');
  process.exit(0);
}

const totals = { hit: 0, notfound: 0, empty: 0, error: 0, skipped: 0, extra: 0 };

/** 200 + kifayət qədər böyük = real səhifə. Qalanı boşdur. */
function classify(res, minBytes) {
  if (res.status === 0) return 'error';
  if (res.status !== 200) return 'notfound';
  if (minBytes && res.bytes < minBytes) return 'empty';
  return 'hit';
}

for (const name of sections) {
  const section = SECTIONS[name];
  const from = args.from ? parseInt(args.from, 10) : section.from;
  const to = args.to ? parseInt(args.to, 10) : section.to;
  const stats = { hit: 0, notfound: 0, empty: 0, error: 0 };

  console.log(`--- ${name} (${section.label}) ${from}..${to} ---`);

  for (let id = from; id <= to; id++) {
    let exists = false;

    if (hasAz) {
      const prev = manifest[key(name, id, 'az')];
      if (prev && !force) {
        exists = prev.kind === 'hit';
        totals.skipped++;
      } else {
        const res = await get(BASE + section.path('az', id));
        const kind = classify(res, section.minBytes);
        stats[kind]++;
        totals[kind]++;
        exists = kind === 'hit';
        if (exists) writeFileSync(rawPath(name, id, 'az'), res.body, 'utf8');
        record(manifest, name, id, 'az', { kind, status: res.status, bytes: res.bytes, error: res.error || undefined });
      }
    } else {
      exists = true; // az istənilməyibsə digər dilləri şərtsiz yoxla
    }

    if (exists) {
      for (const locale of others) {
        if (manifest[key(name, id, locale)] && !force) {
          totals.skipped++;
          continue;
        }
        const res = await get(BASE + section.path(locale, id));
        const kind = classify(res, section.minBytes);
        if (kind === 'hit') {
          writeFileSync(rawPath(name, id, locale), res.body, 'utf8');
          totals.extra++;
        }
        record(manifest, name, id, locale, { kind, status: res.status, bytes: res.bytes, error: res.error || undefined });
      }
    }

    // Windows konsolunda `\r` bezen yenilenmir — her 200 ID-de tam setir yazilir
    // ki, irelileyis gozle gorunsun (skript "dayanib" kimi qebul olunmasin).
    if (id % 200 === 0) {
      console.log(`  id ${id}/${to} | tapilan ${stats.hit} | 404 ${stats.notfound} | bos ${stats.empty} | xeta ${stats.error}`);
    } else if (id % 25 === 0) {
      process.stdout.write(
        `\r  id ${id}/${to} | tapilan ${stats.hit} | 404 ${stats.notfound} | bos ${stats.empty} | xeta ${stats.error}   `
      );
    }
  }

  flush(manifest);
  console.log(`\r  bitdi: tapilan ${stats.hit} | 404 ${stats.notfound} | bos ${stats.empty} | xeta ${stats.error}          `);
}

flush(manifest);
console.log(`\n=== CRAWL BITDI ===`);
console.log(`  az tapilan : ${totals.hit}`);
console.log(`  ru/en elave: ${totals.extra}`);
console.log(`  404        : ${totals.notfound}`);
console.log(`  bos sablon : ${totals.empty}`);
console.log(`  xeta       : ${totals.error}`);
console.log(`  atlanan    : ${totals.skipped} (manifestden)`);
if (totals.error) {
  console.log('\n  DIQQET: xetali ID-ler var. Eyni emri tekrar isletsen yalniz onlar yeniden');
  console.log('          cehd olunacaq (ugurlular manifestde qeydlidir).');
}
console.log('\nNovbeti: npm install && node inventory.mjs\n');
