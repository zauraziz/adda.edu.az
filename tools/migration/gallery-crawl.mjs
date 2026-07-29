// MƏRHƏLƏ 9 — foto qalereyaları.
//
// TAPINTI: xəbərin gövdəsində (`span.news-text`) demək olar ki şəkil yoxdur —
// yalnız mətn. Tək şəkil `div.news-image`-dəki əsas şəkildir və o, `cover`-ə gedir.
// Həqiqi qalereya AYRICA səhifədədir:
//
//   <div class="news_gallery">
//     <a href="/az/photogallery/1984" class="more_photo">Foto</a>
//   </div>
//
// `extract.mjs` bu URL-i `gallery` sahəsində saxlayır, amma səhifələrin özü
// crawl olunmamışdı. Bu skript onları gətirir.
//
// ⚠️ ƏVVƏLCƏ `--probe` İŞLƏT. Qalereya səhifəsinin markup-unu bilmirik;
// zond bir səhifəni açıb neçə şəkil tapıldığını göstərir. K1-in dərsi:
// təxmin etmə, ölç.
//
//   node gallery-crawl.mjs --probe          # 1 sehife, markup hesabati
//   node gallery-crawl.mjs --limit=10       # kicik sinaq
//   node gallery-crawl.mjs                  # hamisi
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { load as loadHtml } from 'cheerio';
import { BASE } from './config.mjs';
import { get } from './lib/http.mjs';
import { dataPath } from './lib/paths.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v === undefined ? true : v];
  })
);

const probe = Boolean(args.probe);
const limit = args.limit ? parseInt(args.limit, 10) : 0;
const SECTIONS = ['content', 'faculty', 'announce', 'news'];
const OUT = () => dataPath('galleries.json');

// Şablon qrafikası `/template/` altındadır; məzmun şəkilləri `/uploads/`.
const abs = (u) => (/^https?:\/\//i.test(u) ? u : BASE + (u.startsWith('/') ? u : '/' + u));

const records = [];
for (const section of SECTIONS) {
  const f = join(dataPath('extracted'), `${section}.json`);
  if (existsSync(f)) for (const r of JSON.parse(readFileSync(f, 'utf8'))) records.push(r);
}
if (!records.length) {
  console.error('data/extracted/ bosdur. Evvelce: node extract.mjs');
  process.exit(1);
}

// Sənəd üzrə bir qalereya URL-i (az üstünlüklü — mənbə dildir).
const order = { az: 0, ru: 1, en: 2 };
const byDoc = new Map();
for (const r of [...records].sort((a, b) => order[a.locale] - order[b.locale])) {
  if (!r.gallery || r.isEmpty) continue;
  const key = `${r.section}/${r.legacyId}`;
  if (!byDoc.has(key)) byDoc.set(key, r.gallery);
}

const existing = existsSync(OUT()) ? JSON.parse(readFileSync(OUT(), 'utf8')) : {};
const pending = [...byDoc.entries()].filter(([key]) => !existing[key]);

console.log('\n' + '='.repeat(66));
console.log(`  Qalereya linki olan sened : ${byDoc.size}`);
console.log(`  Artiq crawl olunub        : ${byDoc.size - pending.length}`);
console.log(`  Qalir                     : ${pending.length}`);
console.log(`  Tex. vaxt                 : ~${Math.ceil((pending.length * 0.4) / 60)} deqiqe`);
console.log('='.repeat(66) + '\n');

if (!pending.length) {
  console.log('  Hamisi crawl olunub.\n');
  process.exit(0);
}

/** Səhifədən məzmun şəkillərini çıxar. */
function extractImages(html) {
  const $ = loadHtml(html);
  $('script, style, noscript, header, footer, nav, .menu, .menu-center').remove();
  return [
    ...new Set(
      $('img[src]')
        .map((_, el) => $(el).attr('src'))
        .get()
        .filter((s) => s && s.includes('/uploads/'))
        .map(abs)
    ),
  ];
}

// ── Zond ─────────────────────────────────────────────────────────────────
if (probe) {
  const [key, url] = pending[0];
  console.log(`Zond: ${key}\n  ${url}\n`);
  const res = await get(url);
  console.log(`  status ${res.status} | ${res.bytes} bayt`);
  if (res.status !== 200) {
    console.log('\n  Sehife acilmadi. Qalereya URL sablonu deyisib ola biler.\n');
    process.exit(1);
  }
  const imgs = extractImages(res.body);
  console.log(`  /uploads/ sekilleri: ${imgs.length}\n`);
  for (const i of imgs.slice(0, 12)) console.log('    ' + i);
  if (imgs.length > 12) console.log(`    ... ve ${imgs.length - 12} daha`);

  // Konteyner namizədləri — markup-u anlamaq üçün
  const $ = loadHtml(res.body);
  console.log('\n  Sekilleri saxlayan elementler:');
  const seen = new Set();
  $('img[src*="/uploads/"]').each((_, el) => {
    const p = $(el).parent();
    const tag = (p.get(0).tagName || '?') + (p.attr('id') ? '#' + p.attr('id') : '') +
      (p.attr('class') ? '.' + p.attr('class').trim().split(/\s+/).join('.') : '');
    if (seen.has(tag)) return;
    seen.add(tag);
    console.log('    ' + tag);
  });

  console.log('\n  Netice qenaetbexsdirse: node gallery-crawl.mjs\n');
  process.exit(0);
}

// ── Crawl ────────────────────────────────────────────────────────────────
const work = limit ? pending.slice(0, limit) : pending;
const stats = { ok: 0, empty: 0, failed: 0, images: 0 };
let done = 0;

for (const [key, url] of work) {
  const res = await get(url);
  if (res.status !== 200) {
    stats.failed++;
  } else {
    const imgs = extractImages(res.body);
    existing[key] = imgs;
    stats.images += imgs.length;
    if (imgs.length) stats.ok++;
    else stats.empty++;
  }
  if (++done % 25 === 0) {
    writeFileSync(OUT(), JSON.stringify(existing, null, 1), 'utf8');
    console.log(`  ${done}/${work.length} | sekilli ${stats.ok} | bos ${stats.empty} | xeta ${stats.failed} | cemi sekil ${stats.images}`);
  }
}

writeFileSync(OUT(), JSON.stringify(existing, null, 1), 'utf8');

const allImages = new Set();
for (const list of Object.values(existing)) for (const u of list) allImages.add(u);

console.log('\n=== QALEREYA CRAWL BITDI ===');
console.log(`  sekilli sened : ${stats.ok}`);
console.log(`  bos qalereya  : ${stats.empty}`);
console.log(`  xeta          : ${stats.failed}`);
console.log(`  yeni sekil    : ${stats.images}`);
console.log(`  xeritede cemi : ${Object.keys(existing).length} sened | ${allImages.size} unikal sekil`);
console.log('\nNovbeti:');
console.log('  node media-upload.mjs --force     # yeni sekilleri Cloudinary-ye');
console.log('  node media-link.mjs --force --relink\n');
