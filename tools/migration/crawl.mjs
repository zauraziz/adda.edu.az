// MƏRHƏLƏ 1 — xam HTML yığımı.
//
// MEMARLIQ QƏRARI: crawl və parse AYRIDIR. Bu mərhələ heç nə çıxarmır,
// yalnız xam HTML-i diskə yazır. Səbəb: selektorları tənzimləmək üçün
// ADDA-nın serverinə TƏKRAR getmək lazım gəlməsin. Bir dəfə yığ, dəfələrlə parse et.
//
// DİLLƏR MÜSTƏQİL SKAN OLUNUR — bu, ölçülmüş qərardır, optimallaşdırma deyil.
//
// K1a-da "az-əvvəl" gating var idi: az boş çıxsa ru/en yüklənmirdi (~35% qənaət).
// K1d diaqnostikası bunu TƏHLÜKƏLİ göstərdi:
//   /ru/news/1336 -> 200 "ASCO организовало морской тур..."
//   /en/news/1452 -> 200 "Wishing you all the happiness..."
//   /az/news/1984 -> 200, lakin /ru/ və /en/ -> 404
// Yəni köhnə CMS-də vahid ID ardıcıllığı var, hər yazının dil sahələri ayrıdır
// və tərcümələr QİSMƏNDİR. az-da olmayıb ru/en-də olan yazı mümkündür —
// gating belə yazıları səssizcə itirərdi.
//
// `--gate` ilə köhnə davranışı qaytarmaq olar, amma `news` üçün İŞLƏTMƏ.
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
const gate = Boolean(args.gate); // köhnə az-əvvəl davranışı (təhlükəli — yuxarıya bax)

for (const name of sections) {
  if (!SECTIONS[name]) {
    console.error(`Bilinmeyen bolme: ${name}. Movcud: ${Object.keys(SECTIONS).join(', ')}`);
    process.exit(1);
  }
}

const manifest = force ? { __version: MANIFEST_VERSION } : load();
const hasAz = locales.includes('az');
const others = locales.filter((l) => l !== 'az');

let ids = 0;
for (const name of sections) {
  const s = SECTIONS[name];
  const from = args.from ? parseInt(args.from, 10) : s.from;
  const to = args.to ? parseInt(args.to, 10) : s.to;
  ids += to - from + 1;
}
const requests = gate ? ids : ids * locales.length;

console.log(`Bolmeler  : ${sections.join(', ')}`);
console.log(`Diller    : ${locales.join(', ')}  ${gate ? '(GATE: az bos olanda digerleri atlanir)' : '(musteqil skan)'}`);
console.log(`ID sayi   : ${ids}`);
console.log(`Sorgu     : ~${requests}${gate ? ' + tapilanlar ucun elave' : ''}`);
console.log(`Tex. vaxt : ~${Math.ceil((requests * 0.4) / 60)} deqiqe`);
if (gate) console.log('DIQQET: --gate `news` ucun TEHLUKELIDIR — ru/en-de olub az-da olmayan yazilar itir.');
console.log('');

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

  /** Bir (bölmə, id, dil) üçlüyünü al və qeyd et. Nəticə: tapıldımı. */
  async function fetchOne(id, locale) {
    const prev = manifest[key(name, id, locale)];
    if (prev && !force) {
      totals.skipped++;
      return prev.kind === 'hit';
    }
    const res = await get(BASE + section.path(locale, id));
    const kind = classify(res, section.minBytes);
    stats[kind]++;
    totals[kind]++;
    if (kind === 'hit') writeFileSync(rawPath(name, id, locale), res.body, 'utf8');
    record(manifest, name, id, locale, { kind, status: res.status, bytes: res.bytes, error: res.error || undefined });
    return kind === 'hit';
  }

  for (let id = from; id <= to; id++) {
    if (gate && hasAz) {
      // Köhnə davranış: az boş olanda digər dillər atlanır.
      if (await fetchOne(id, 'az')) {
        for (const locale of others) await fetchOne(id, locale);
      }
    } else {
      for (const locale of locales) await fetchOne(id, locale);
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
console.log(`  tapilan    : ${totals.hit}`);
console.log(`  404        : ${totals.notfound}`);
console.log(`  bos sablon : ${totals.empty}`);
console.log(`  xeta       : ${totals.error}`);
console.log(`  atlanan    : ${totals.skipped} (manifestden)`);
if (totals.error) {
  console.log('\n  DIQQET: xetali ID-ler var. Eyni emri tekrar isletsen yalniz onlar yeniden');
  console.log('          cehd olunacaq (ugurlular manifestde qeydlidir).');
}
console.log('\nNovbeti: npm install && node inventory.mjs\n');
