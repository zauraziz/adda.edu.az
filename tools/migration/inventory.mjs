// MƏRHƏLƏ 2 — inventar. Şəbəkəyə ÇIXMIR, yalnız data/raw/ oxuyur.
//
// NİYƏ SELEKTOR "SKORLAMASI": köhnə saytın DOM-u bizə məlum deyil, ona görə
// gövdə selektoru TƏXMİN EDİLMİR. Bu skript namizəd selektorların hər birini
// bütün səhifələrə tətbiq edir və hansının nə qədər mətn tutduğunu ölçür.
// Qalibi hesabat göstərir — sonra K2 həmin selektoru işlədir.
//
// İstifadə:
//   npm install
//   node inventory.mjs
//   node inventory.mjs --section=news
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { load as loadHtml } from 'cheerio';
import { BASE, SECTIONS } from './config.mjs';
import { RAW, dataPath } from './lib/paths.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v === undefined ? true : v];
  })
);

// Gövdə üçün namizədlər. Səhv olmaları normaldır — məqsəd ölçməkdir.
const CANDIDATES = [
  '.content', '#content', '.news-detail', '.news_detail', '.detail',
  '.text', '.inner-content', '.page-content', '.entry', 'article', 'main',
  '.container .row', '#main', '.middle', '.left-content',
];

// Sayt şablonu: naviqasiya/altlıq hər səhifədə təkrarlanır və ölçünü şişirdir.
const CHROME = 'script, style, nav, header, footer, .menu, .nav, .navbar, .sidebar, .footer, .header';

/** Nisbi URL-i mutleqe cevir — media yuklemesi ucun lazimdir. */
const abs = (u) => (u.startsWith('http') ? u : BASE + (u.startsWith('/') ? u : '/' + u));

const csv = (v) => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};

const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

function parseFile(section, id, locale, html) {
  const $ = loadHtml(html);

  const rawTitle = clean($('title').first().text());
  // Müşahidə olunan şablon: "SƏHİFƏ ADI-Azərbaycan Dövlət Dəniz Akademiyası"
  const title = rawTitle.replace(/[-–—]\s*(Azərbaycan Dövlət Dəniz Akademiyası|.*Marine Academy|.*Морская академия)\s*$/i, '').trim();

  const text = clean($.root().clone().find(CHROME).remove().end().text());

  const images = [...new Set(
    $('img[src]').map((_, el) => $(el).attr('src')).get().filter((s) => s && s.includes('/uploads/')).map(abs)
  )];

  const files = [...new Set(
    $('a[href]').map((_, el) => $(el).attr('href')).get()
      .filter((s) => s && /\.(pdf|docx?|xlsx?|pptx?)(\?|$)/i.test(s)).map(abs)
  )];

  const dateMatch = html.match(/\b(20\d{2})[.\-/](\d{2})[.\-/](\d{2})\b/);
  const date = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : '';

  const selectors = {};
  for (const sel of CANDIDATES) {
    const node = $(sel).first();
    if (!node.length) continue;
    selectors[sel] = clean(node.clone().find(CHROME).remove().end().text()).length;
  }

  return {
    section, id, locale, title,
    metaTitle: rawTitle,
    date,
    bytes: Buffer.byteLength(html, 'utf8'),
    textLen: text.length,
    images: images.length,
    imageUrls: images,
    files: files.length,
    fileUrls: files,
    selectors,
  };
}

const wanted = args.section ? String(args.section).split(',') : Object.keys(SECTIONS);
const records = [];

for (const section of wanted) {
  const dir = join(RAW, section);
  if (!existsSync(dir)) {
    console.warn(`  atlandi (data yoxdur): ${section}`);
    continue;
  }
  for (const file of readdirSync(dir)) {
    const m = file.match(/^(\d+)\.([a-z]{2})\.html$/);
    if (!m) continue;
    try {
      records.push(parseFile(section, Number(m[1]), m[2], readFileSync(join(dir, file), 'utf8')));
    } catch (err) {
      console.warn(`  parse xetasi ${section}/${file}: ${err.message}`);
    }
  }
}

if (!records.length) {
  console.error('data/raw/ bosdur. Evvelce: node crawl.mjs');
  process.exit(1);
}

// ── Hesabat ──────────────────────────────────────────────────────────────
console.log(`\nInventar: ${records.length} sened parse olundu\n`);

const bySection = {};
for (const r of records) {
  const b = (bySection[r.section] ||= { total: 0, locales: {}, ids: new Set(), images: 0, files: 0, dates: [] });
  b.total++;
  b.locales[r.locale] = (b.locales[r.locale] || 0) + 1;
  b.ids.add(r.id);
  b.images += r.images;
  b.files += r.files;
  if (r.date) b.dates.push(r.date);
}

console.log('bolme     | sened |  az /  ru /  en | sekil | fayl | tarix araligi');
console.log('----------+-------+-----------------+-------+------+--------------------');
for (const [name, b] of Object.entries(bySection)) {
  b.dates.sort();
  const range = b.dates.length ? `${b.dates[0]} .. ${b.dates[b.dates.length - 1]}` : '-';
  console.log(
    name.padEnd(9) + ' | ' + String(b.ids.size).padStart(5) + ' | ' +
    String(b.locales.az || 0).padStart(3) + ' / ' + String(b.locales.ru || 0).padStart(3) + ' / ' + String(b.locales.en || 0).padStart(3) +
    ' | ' + String(b.images).padStart(5) + ' | ' + String(b.files).padStart(4) + ' | ' + range
  );
}

// Dil örtüyündəki boşluqlar — hansı ID hansı dildə yoxdur
const gaps = {};
for (const r of records) (gaps[`${r.section}/${r.id}`] ||= new Set()).add(r.locale);
const partial = Object.entries(gaps).filter(([, s]) => s.size < 3);
console.log(`\nTam olmayan dil ortuyu: ${partial.length} sened (3 dilden azi)`);
for (const [k, s] of partial.slice(0, 8)) console.log(`  ${k}: yalniz ${[...s].join(',')}`);
if (partial.length > 8) console.log(`  ... ve ${partial.length - 8} daha`);

// Selektor skorlaması — K2 üçün əsas nəticə
console.log('\n=== SELEKTOR SKORLARI (govde ucun namizedler) ===');
console.log('selektor              | tapildi | median metn | tam metnin %-i');
console.log('----------------------+---------+-------------+----------------');
const median = (a) => (a.length ? [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)] : 0);
const fullMedian = median(records.map((r) => r.textLen));
const scored = CANDIDATES.map((sel) => {
  const lens = records.filter((r) => r.selectors[sel] !== undefined).map((r) => r.selectors[sel]);
  return { sel, hits: lens.length, med: median(lens) };
}).filter((s) => s.hits).sort((a, b) => b.med - a.med);

for (const s of scored) {
  const pct = fullMedian ? Math.round((s.med / fullMedian) * 100) : 0;
  console.log(
    s.sel.padEnd(21) + ' | ' + String(s.hits).padStart(7) + ' | ' + String(s.med).padStart(11) + ' | ' + String(pct).padStart(13) + '%'
  );
}
console.log(`\n  (butun sehifenin median metni: ${fullMedian} simvol)`);
console.log('  -> Govde namizedi: "tapildi" sayi yuksek VE metn payi 100%-den asagi olan.');
console.log('     100%-e cox yaxin olanlar butun sehifeni tutur (yeni sarmalayicidir).');

// ── Çıxış faylları ───────────────────────────────────────────────────────
writeFileSync(dataPath('inventory.json'), JSON.stringify(records, null, 1), 'utf8');

const head = ['section', 'id', 'locale', 'title', 'date', 'bytes', 'textLen', 'images', 'files'];
const rows = [head.join(',')];
for (const r of records) rows.push(head.map((h) => csv(r[h])).join(','));
writeFileSync(dataPath('inventory.csv'), '\uFEFF' + rows.join('\r\n'), 'utf8');

// Media manifesti — Cloudinary köçürməsinin həcmini ölçmək üçün
const media = [...new Set(records.flatMap((r) => [...r.imageUrls, ...r.fileUrls]))];
writeFileSync(dataPath('media.txt'), media.join('\n'), 'utf8');

console.log(`\nYazildi:`);
console.log(`  data/inventory.json  (${records.length} qeyd)`);
console.log(`  data/inventory.csv   (Excel ucun, BOM-lu)`);
console.log(`  data/media.txt       (${media.length} unikal media URL)`);
console.log('\nBu hesabati Claude-a gonder -> K2 (ekstraksiya) hazirlanir.\n');
