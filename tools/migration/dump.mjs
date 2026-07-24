// XAM MARKUP DÖKÜMÜ — başlıq, tarix və şəkil strukturunu son dəfə dəqiqləşdir.
//
// `structure.mjs` gövdəni tapdı (news -> span.news-text, content -> div.page-full-text),
// amma TARİX tapılmadı: xəbər səhifəsindəki yeganə tarixlər arxiv təqviminin
// `availableDates` massividir və o, bütün səhifələrdə eynidir.
//
// İki ehtimal qalır:
//   a) tarix detal səhifəsində ümumiyyətlə yoxdur (yalnız siyahı səhifəsindədir)
//   b) tarix tanımadığımız formatdadır — məs. "15 İyul 2026"
//
// Bu skript məzmun bölgəsinin XAM HTML-ini çap edir ki, təxmin lazım gəlməsin.
// Şəbəkəyə ÇIXMIR.
//
// İstifadə:
//   node dump.mjs news az            # ən yeni nümunə
//   node dump.mjs news az 1984
//   node dump.mjs content az 71 6000 # daha uzun kəsik
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { load as loadHtml } from 'cheerio';
import { RAW } from './lib/paths.mjs';

const [sectionArg, localeArg, idArg, limitArg] = process.argv.slice(2);
const section = sectionArg || 'news';
const locale = localeArg || 'az';
const LIMIT = Math.max(1000, parseInt(limitArg || '4500', 10));

// Sarmalayıcı hər iki bölmədə eynidir; gövdə fərqlidir.
const WRAPPER = 'div.center.static-inside, div.wrapper';

const dir = join(RAW, section);
if (!existsSync(dir)) {
  console.error(`data/raw/${section}/ yoxdur.`);
  process.exit(1);
}

let file;
if (idArg) {
  file = `${idArg}.${locale}.html`;
} else {
  const cands = readdirSync(dir)
    .filter((f) => f.endsWith(`.${locale}.html`))
    .sort((a, b) => Number(b.split('.')[0]) - Number(a.split('.')[0]));
  file = cands[0];
}
if (!file || !existsSync(join(dir, file))) {
  console.error(`${section}/${file} tapilmadi.`);
  process.exit(1);
}

const html = readFileSync(join(dir, file), 'utf8');
const $ = loadHtml(html);
$('script, style, noscript').remove();

console.log(`\n=== ${section}/${file} ===\n`);

const region = $(WRAPPER).first();
if (!region.length) {
  console.error(`Sarmalayici tapilmadi: ${WRAPPER}`);
  process.exit(1);
}

// ── 1. Xam markup ────────────────────────────────────────────────────────
const raw = (region.html() || '')
  .replace(/\n\s*\n/g, '\n')
  .replace(/^\s+/gm, (m) => m.replace(/\t/g, '  ').slice(0, 8));
console.log('--- XAM HTML (sarmalayici icinde) ---');
console.log(raw.slice(0, LIMIT));
if (raw.length > LIMIT) console.log(`\n... [${raw.length - LIMIT} simvol daha kesildi]`);

// ── 2. Element-element mətn ──────────────────────────────────────────────
console.log('\n--- ELEMENTLER (sarmalayici icinde, oz metni ile) ---');
console.log('selektor                            | metn');
console.log('------------------------------------+---------------------------------');
region.find('*').each((_, el) => {
  const node = $(el);
  // Yalnız öz mətn düyünləri — uşaqlarınkı sayılmır.
  const own = node
    .contents()
    .filter((__, c) => c.type === 'text')
    .text()
    .replace(/\s+/g, ' ')
    .trim();
  if (!own) return;
  const tag = el.tagName || el.name || '?';
  const id = node.attr('id');
  const cls = (node.attr('class') || '').trim().split(/\s+/).filter(Boolean);
  const sel = tag + (id ? '#' + id : '') + (cls.length ? '.' + cls.join('.') : '');
  console.log(sel.slice(0, 35).padEnd(35) + ' | ' + own.slice(0, 62));
});

// ── 3. Şəkillər ──────────────────────────────────────────────────────────
console.log('\n--- SEKILLER (sarmalayici icinde) ---');
const imgs = region.find('img[src]').map((_, el) => $(el).attr('src')).get();
if (imgs.length) imgs.slice(0, 12).forEach((s) => console.log('  ' + s));
else console.log('  (yoxdur)');
if (imgs.length > 12) console.log(`  ... ve ${imgs.length - 12} daha`);

// ── 4. Tarix ehtimalları — Azərbaycan/rus/ingilis ay adları da daxil ─────
console.log('\n--- TARIX AXTARISI (ay adlari ile) ---');
const MONTHS =
  'Yanvar|Fevral|Mart|Aprel|May|İyun|İyul|Avqust|Sentyabr|Oktyabr|Noyabr|Dekabr|' +
  'января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря|' +
  'January|February|March|April|May|June|July|August|September|October|November|December';
// DİQQƏT: cheerio-nun `.text()` metodu elementlər arasına AYIRICI QOYMUR.
// "...yubileyi15 İyul 2026Yubiley..." kimi yapışıq mətn alınır və `\b` sərhədi
// işləmir. Ona görə teqləri boşluğa çeviririk. K2-də gövdə çıxarışı da bunu
// nəzərə almalıdır.
const text = (region.html() || '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const found = [
  ...text.matchAll(new RegExp(`\\b\\d{1,2}\\s+(?:${MONTHS})\\s+\\d{4}\\b`, 'gi')),
  ...text.matchAll(/\b\d{1,2}[.\-/]\d{1,2}[.\-/]\d{4}\b/g),
  ...text.matchAll(/\b\d{4}[.\-/]\d{1,2}[.\-/]\d{1,2}\b/g),
];
if (found.length) {
  for (const m of found.slice(0, 8)) {
    const at = m.index || 0;
    console.log(`  ${m[0].padEnd(20)} ... "${text.slice(Math.max(0, at - 40), at + m[0].length + 20)}"`);
  }
} else {
  console.log('  SARMALAYICIDA TARIX YOXDUR -> siyahi sehifesinden goturulmelidir.');
}

// ── 5. Arxiv təqvimi — tarix mənbəyi ola bilər ───────────────────────────
const dates = html.match(/availableDates\s*=\s*\[([^\]]*)\]/);
if (dates) {
  const list = dates[1].match(/\d{4}-\d{2}-\d{2}/g) || [];
  const sorted = [...new Set(list)].sort();
  console.log(`\n--- ARXIV TEQVIMI (availableDates) ---`);
  console.log(`  ${sorted.length} unikal tarix | ${sorted[0]} .. ${sorted[sorted.length - 1]}`);
  console.log('  Bu massiv HER sehifede eynidir -> xeberin oz tarixi DEYIL.');
  console.log('  Lakin arxiv siyahisi ucun URL sablonu varsa, tarix->ID xeritesi ondan cixarila biler.');
}

// ── 6. Arxiv/siyahı linkləri ─────────────────────────────────────────────
console.log('\n--- ARXIV / SIYAHI LINKLERI ---');
const links = [...new Set($('a[href]').map((_, el) => $(el).attr('href')).get())]
  .filter((h) => h && /arxiv|archive|arch|news\/?(\?|$)|list|date/i.test(h));
if (links.length) links.slice(0, 12).forEach((h) => console.log('  ' + h));
else console.log('  (tapilmadi)');

console.log('\nBu ciximi mene gonder -> K2 son formasini alacaq.\n');
