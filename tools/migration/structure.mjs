// STRUKTUR KƏŞFİ — gövdə selektorunu və tarix yerini TAP.
//
// NİYƏ NAMİZƏD SİYAHISI İŞLƏMƏDİ: `inventory.mjs`-in 14 namizədindən yalnız
// `article` uyğun gəldi (1 səhifə, 4 simvol). Köhnə CMS tanış adlandırma
// işlətmir. Deməli təxmin etmək olmaz — kəşf etmək lazımdır.
//
// ÜSUL — differensial analiz: eyni bölmənin iki səhifəsini müqayisə edirik.
// Naviqasiya, altlıq, yan panel HƏR səhifədə eynidir (SABIT).
// Xəbərin mətni yalnız öz səhifəsindədir (UNIKAL).
// Ən böyük UNIKAL element = gövdə.
//
// Şəbəkəyə ÇIXMIR — yalnız data/raw/ oxuyur.
//
// İstifadə:
//   node structure.mjs                  # avtomatik nümunə seçir
//   node structure.mjs news az
//   node structure.mjs content ru 20    # top 20 element
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { load as loadHtml } from 'cheerio';
import { RAW } from './lib/paths.mjs';

const [sectionArg, localeArg, topArg] = process.argv.slice(2);
const section = sectionArg || 'news';
const locale = localeArg || 'az';
const TOP = Math.max(5, parseInt(topArg || '22', 10));

const dir = join(RAW, section);
if (!existsSync(dir)) {
  console.error(`data/raw/${section}/ yoxdur. Evvelce crawl et.`);
  process.exit(1);
}

const files = readdirSync(dir)
  .filter((f) => f.endsWith(`.${locale}.html`))
  .sort((a, b) => Number(b.split('.')[0]) - Number(a.split('.')[0]));

if (files.length < 2) {
  console.error(`${section}/${locale} ucun en azi 2 numune lazimdir (tapilan: ${files.length}).`);
  process.exit(1);
}

// Ən yeni üç nümunə: biri təhlil üçün, ikisi müqayisə bazası.
const [target, ...rest] = files.slice(0, 3);
const html = readFileSync(join(dir, target), 'utf8');
const peers = rest.map((f) => readFileSync(join(dir, f), 'utf8'));

const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
const peerTexts = peers.map((h) => clean(loadHtml(h).root().text()));

console.log(`\n=== ${section}/${target} ===`);
console.log(`Muqayise bazasi: ${rest.join(', ')}\n`);

const $ = loadHtml(html);
$('script, style').remove();

/** Elementin oxunaqlı seçici təsviri: div#main.content */
function describe(el) {
  const node = $(el);
  const tag = el.tagName || el.name || '?';
  const id = node.attr('id');
  const cls = (node.attr('class') || '').trim().split(/\s+/).filter(Boolean);
  return tag + (id ? '#' + id : '') + (cls.length ? '.' + cls.join('.') : '');
}

/**
 * Mətnin nə qədəri yalnız bu səhifəyə aiddir (0..1).
 *
 * Sabit ölçülü pəncərələrlə (shingle) ölçülür, cümlə bölgüsü ilə YOX:
 * naviqasiya mətnində nöqtə olmur, ona görə cümlə bölgüsü bütün nav-ı bir
 * parça sayıb sarmalayıcılara saxta 97% verirdi. Pəncərə üsulu durğu
 * işarəsindən asılı deyil.
 */
const WINDOW = 50;
function uniqueness(text) {
  if (!text || text.length < WINDOW + 10) return 0;
  const step = Math.max(8, Math.floor(text.length / 60));
  let total = 0;
  let uniq = 0;
  for (let i = 0; i + WINDOW <= text.length; i += step) {
    const w = text.slice(i, i + WINDOW);
    total++;
    if (peerTexts.every((t) => !t.includes(w))) uniq++;
  }
  return total ? uniq / total : 0;
}

const rows = [];
$('*').each((_, el) => {
  const text = clean($(el).text());
  if (text.length < 120) return;
  rows.push({ sel: describe(el), len: text.length, uniq: uniqueness(text), sample: text.slice(0, 52) });
});

// Ən kiçik-amma-unikal elementi tapmaq üçün əvvəlcə unikallığa, sonra ölçüyə görə.
rows.sort((a, b) => b.uniq * b.len - a.uniq * a.len);

console.log('selektor                                  |  metn | unikal | numune');
console.log('------------------------------------------+-------+--------+---------------------------');
for (const r of rows.slice(0, TOP)) {
  console.log(
    r.sel.slice(0, 41).padEnd(41) + ' | ' + String(r.len).padStart(5) + ' | ' +
    String(Math.round(r.uniq * 100)).padStart(5) + '% | ' + r.sample
  );
}

console.log('\n  OXUNUS: unikal% yuksek + metn olcusu ag-basli olan = GOVDE.');
console.log('  unikal% ~0 olanlar sablondur (nav/footer). Cox boyuk + orta unikal = sarmalayici.');

// ── Tarix yerləri ────────────────────────────────────────────────────────
//
// inventar `announce` ucun butun 346 senede eyni tarix verdi (2016-09-09),
// yeni xam HTML-de ilk rast gelen tarix senedin oz tarixi DEYIL.
console.log('\n=== TARIX NAMIZEDLERI (xam HTML-de) ===');
const seen = new Set();
let shown = 0;
for (const m of html.matchAll(/\b(20\d{2})[.\-/](\d{1,2})[.\-/](\d{1,2})\b|\b(\d{1,2})[.\-/](\d{1,2})[.\-/](20\d{2})\b/g)) {
  const at = m.index || 0;
  const ctx = clean(html.slice(Math.max(0, at - 70), at + m[0].length + 30)).replace(/<[^>]*>/g, ' ');
  const k = m[0] + '|' + ctx.slice(0, 30);
  if (seen.has(k)) continue;
  seen.add(k);
  console.log(`  ${m[0].padEnd(12)} ... ${ctx.slice(-72)}`);
  if (++shown >= 10) break;
}
if (!shown) console.log('  (tarix tapilmadi)');

console.log('\nBu ciximi mene gonder -> K2 govde ve tarix cixarisini ona gore quracaq.\n');
