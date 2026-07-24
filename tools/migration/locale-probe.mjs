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
//   node locale-probe.mjs                   # diskdəki hər bölmədən bir nümunə
//   node locale-probe.mjs news 1984         # konkret səhifə
//   node locale-probe.mjs --live news 1984  # tapılan namizədləri HTTP ilə sına
//   node locale-probe.mjs --home            # hər dilin ana səhifəsindən ID-ləri çıxar
//   node locale-probe.mjs --home --live     # + həmin linkləri həqiqətən sına
//   node locale-probe.mjs --scan en news    # bir dildə ID fəzasını nümunələ
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { BASE, SECTIONS } from './config.mjs';
import { get } from './lib/http.mjs';
import { RAW } from './lib/paths.mjs';

const argv = process.argv.slice(2);
const live = argv.includes('--live');
const homeMode = argv.includes('--home');
const scanMode = argv.includes('--scan');
const rest = argv.filter((a) => !a.startsWith('--'));

const LOCALES = ['az', 'ru', 'en'];
const LINK_RE = /\/(az|ru|en)\/(content|news|announce|faculty)\/(\d+)/g;

/**
 * --home: hər dilin ana səhifəsini yükləyib oradakı bölmə/ID linklərini çıxarır.
 *
 * NİYƏ HƏLLEDİCİ: `/ru/news/1984` 404 verir, amma bu, ru xəbərlərin YOX olduğunu
 * sübut etmir — köhnə CMS-lərdə hər dil ayrı yazıdır və öz ID-si olur.
 * Ana səhifə öz dilindəki həqiqi ID-lərə link verir, yəni cavab oradadır.
 */
async function scanHome() {
  const summary = {};
  for (const locale of LOCALES) {
    const res = await get(`${BASE}/${locale}/`);
    const found = {};
    for (const m of res.body.matchAll(LINK_RE)) {
      if (m[1] !== locale) continue; // basqa dile aid linkleri sayma
      (found[m[2]] ||= new Set()).add(Number(m[3]));
    }
    summary[locale] = { status: res.status, bytes: res.bytes, found };
  }

  console.log('\n=== ANA SEHIFE LINKLERI ===');
  console.log('dil | bolme    | say | en kicik ID | en boyuk ID | numuneler');
  console.log('----+----------+-----+-------------+-------------+-------------------');
  for (const locale of LOCALES) {
    const s = summary[locale];
    const sections = Object.keys(s.found);
    if (!sections.length) {
      console.log(`${locale.padEnd(3)} | (bolme/ID linki tapilmadi, status ${s.status}, ${s.bytes} b)`);
      continue;
    }
    for (const sec of sections) {
      const ids = [...s.found[sec]].sort((a, b) => a - b);
      console.log(
        locale.padEnd(3) + ' | ' + sec.padEnd(8) + ' | ' + String(ids.length).padStart(3) + ' | ' +
        String(ids[0]).padStart(11) + ' | ' + String(ids[ids.length - 1]).padStart(11) + ' | ' +
        ids.slice(-4).join(', ')
      );
    }
  }

  // --live: ana səhifənin ÖZ linklərini sına.
  //
  // NİYƏ: ru ana səhifəsi /ru/news/1984-ə link verir, amma həmin URL 404 verir.
  // Deməli linklərin bir hissəsi mexaniki generasiya olunur (mövcudluq
  // yoxlanmadan), bir hissəsi isə realdır. Yalnız HTTP cavabı ayırd edə bilər.
  if (live) {
    console.log('\n=== ANA SEHIFE LINKLERININ SINAGI ===');
    for (const locale of LOCALES) {
      const news = summary[locale].found.news ? [...summary[locale].found.news].sort((a, b) => a - b) : [];
      if (!news.length) {
        console.log(`\n  ${locale}: xeber linki yoxdur`);
        continue;
      }
      console.log(`\n  --- ${locale}/news (${news.length} link) ---`);
      let ok = 0;
      for (const id of news) {
        const res = await get(`${BASE}/${locale}/news/${id}`);
        const t = res.body.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        const title = (t ? t[1] : res.error || '').replace(/\s+/g, ' ').trim().slice(0, 44);
        if (res.status === 200) ok++;
        console.log(`    ${String(id).padStart(5)} | ${String(res.status).padStart(3)} | ${String(res.bytes).padStart(6)} b | ${title}`);
      }
      console.log(`    -> ${ok}/${news.length} isleyir`);
    }
  }

  const azNews = summary.az.found.news ? [...summary.az.found.news] : [];
  const ruNews = summary.ru.found.news ? [...summary.ru.found.news] : [];
  const enNews = summary.en.found.news ? [...summary.en.found.news] : [];
  console.log('\n  OXUNUS:');
  if (!ruNews.length && !enNews.length) {
    console.log('  -> ru/en ana sehifesinde XEBER LINKI YOXDUR = xeberler yalniz az-dir.');
  } else {
    const overlap = ruNews.filter((id) => azNews.includes(id)).length;
    console.log(`  -> ru/en xeberler MOVCUDDUR. az ile ustuste dusen ID: ${overlap}/${ruNews.length}`);
    console.log(overlap ? '     Eyni ID sistemi ola biler.' : '     AYRI ID sistemi — uygunlasdirma tarix/mezmun uzre lazimdir.');
  }
}

/** --scan <locale> <section>: bir dildə ID fəzasını bərabər nümunələ. */
async function scanLocale(locale, sectionName) {
  const section = SECTIONS[sectionName];
  if (!section) {
    console.error(`Bilinmeyen bolme: ${sectionName}`);
    process.exit(1);
  }
  console.log(`\n=== ${locale}/${sectionName} — ${section.from}..${section.to} ===`);
  console.log('   id | status |   bayt | basliq');
  console.log('------+--------+--------+--------------------------------------');
  const n = 15;
  const step = (section.to - section.from) / (n - 1);
  let hits = 0;
  for (let i = 0; i < n; i++) {
    const id = Math.round(section.from + i * step);
    const res = await get(BASE + section.path(locale, id));
    const t = res.body.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = (t ? t[1] : res.error || '').replace(/\s+/g, ' ').trim().slice(0, 38);
    if (res.status === 200) hits++;
    console.log(
      String(id).padStart(5) + ' | ' + String(res.status).padStart(6) + ' | ' + String(res.bytes).padStart(6) + ' | ' + title
    );
  }
  console.log(`\n  200 cavab: ${hits}/${n}`);
}

if (homeMode) {
  await scanHome();
  console.log('\nBu ciximi mene gonder.\n');
  process.exit(0);
}
if (scanMode) {
  const [locale, sectionName] = rest;
  if (!locale || !sectionName) {
    console.error('Istifade: node locale-probe.mjs --scan <dil> <bolme>');
    process.exit(1);
  }
  await scanLocale(locale, sectionName);
  console.log('\nBu ciximi mene gonder.\n');
  process.exit(0);
}

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
