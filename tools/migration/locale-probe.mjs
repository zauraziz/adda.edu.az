// DİAQNOSTİKA — həqiqi ru/en URL şablonunu TAP.
//
// PROBLEM: `/az/news/1984` işləyir, `/ru/news/1984` və `/en/news/1984` işləmir —
// halbuki `/ru/content/1` işləyir. Deməli ya xəbərlərin URL şablonu fərqlidir,
// ya da xəbərlərin tərcüməsi yoxdur.
//
// HƏLL: təxmin etmirik. Saytın ÖZ dil-dəyişdiricisinin `href`-i həqiqi alternativ
// URL-dir. Onu artıq yığılmış az HTML-indən oxuyuruq — ŞƏBƏKƏYƏ ÇIXMADAN.
//
// İstifadə:
//   node locale-probe.mjs                 # diskdəki hər bölmədən bir nümunə
//   node locale-probe.mjs news 1984       # konkret səhifə
//   node locale-probe.mjs --live news 1984  # tapılan namizədləri HTTP ilə sına
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { BASE, SECTIONS } from './config.mjs';
import { get } from './lib/http.mjs';
import { RAW } from './lib/paths.mjs';

const argv = process.argv.slice(2);
const live = argv.includes('--live');
const rest = argv.filter((a) => !a.startsWith('--'));

/** Diskdə mövcud olan bir nümunə seç. */
function pickSample(section) {
  const dir = join(RAW, section);
  if (!existsSync(dir)) return null;
  const az = readdirSync(dir).filter((f) => f.endsWith('.az.html'));
  if (!az.length) return null;
  const ids = az.map((f) => Number(f.split('.')[0])).sort((a, b) => b - a);
  return ids[0];
}

function analyse(section, id) {
  const file = join(RAW, section, `${id}.az.html`);
  if (!existsSync(file)) {
    console.log(`  ${section}/${id}.az.html diskde yoxdur — atlanir`);
    return [];
  }
  const html = readFileSync(file, 'utf8');

  console.log(`\n=== ${section}/${id} ===`);

  const htmlLang = html.match(/<html[^>]*\blang=["']([^"']+)["']/i);
  console.log(`  <html lang> : ${htmlLang ? htmlLang[1] : '(yoxdur)'}`);

  // 1) rel=alternate hreflang — ən etibarlı mənbə
  const alternates = [...html.matchAll(/<link[^>]*hreflang=["']([^"']+)["'][^>]*href=["']([^"']+)["']/gi)];
  if (alternates.length) {
    console.log('  rel=alternate:');
    for (const m of alternates) console.log(`    ${m[1].padEnd(6)} -> ${m[2]}`);
  } else {
    console.log('  rel=alternate: (yoxdur)');
  }

  // 2) Dil-dəyişdirici linkləri
  const hrefs = [...html.matchAll(/<a[^>]*href=["']([^"']+)["']/gi)].map((m) => m[1]);
  const candidates = [...new Set(
    hrefs.filter((h) => /(^|[/?&])(ru|en)([/?&=]|$)|lang=(ru|en)|[/_-](ru|en)\.|\/(ru|en)\//i.test(h))
  )];

  // Cari ID-yə aid olanları önə çək — dil dəyişdiricisi budur.
  const forThisPage = candidates.filter((h) => h.includes(String(id)));
  const generic = candidates.filter((h) => !h.includes(String(id)));

  console.log(`  Bu ID-ye aid ru/en linkleri (${forThisPage.length}):`);
  for (const h of forThisPage.slice(0, 10)) console.log(`    ${h}`);
  if (!forThisPage.length) {
    console.log('    YOXDUR -> bu sehifenin tercumesi olmaya biler.');
    console.log(`  Umumi ru/en linkleri (ilk 6 / ${generic.length}):`);
    for (const h of generic.slice(0, 6)) console.log(`    ${h}`);
  }

  return forThisPage;
}

const sections = rest.length ? [rest[0]] : Object.keys(SECTIONS);
const found = [];

for (const section of sections) {
  if (!SECTIONS[section]) {
    console.error(`Bilinmeyen bolme: ${section}`);
    process.exit(1);
  }
  const id = rest.length > 1 ? Number(rest[1]) : pickSample(section);
  if (!id) {
    console.log(`\n=== ${section} ===\n  data/raw/${section}/ bosdur — evvelce crawl et.`);
    continue;
  }
  for (const href of analyse(section, id)) found.push({ section, id, href });
}

if (live && found.length) {
  console.log('\n=== CANLI SINAQ ===');
  for (const { section, id, href } of found.slice(0, 8)) {
    const url = href.startsWith('http') ? href : BASE + (href.startsWith('/') ? href : '/' + href);
    const res = await get(url);
    const t = res.body.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = (t ? t[1] : res.error || '').replace(/\s+/g, ' ').trim().slice(0, 46);
    console.log(`  ${String(res.status).padStart(3)} | ${String(res.bytes).padStart(6)} b | ${title}`);
    console.log(`        ${url}`);
  }
} else if (live) {
  console.log('\n--live: sinanacaq namized tapilmadi.');
}

console.log('\nBu ciximi mene gonder -> ru/en strategiyasi ona gore qurulacaq.\n');
