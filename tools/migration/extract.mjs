// MƏRHƏLƏ 3 — ekstraksiya və transformasiya. ŞƏBƏKƏYƏ ÇIXMIR.
//
// data/raw/**.html  ->  data/extracted/{bolme}.json + redirects.json + media.json
//
// Selektorlar K1f/K1g diaqnostikası ilə ÖLÇÜLÜB, təxmin deyil:
//
//   <div class="center static-inside">          <- sarmalayıcı
//     <div class="page-title-line"> ... </div>  <- ZİBİL (bölmə adı, sayğac, A-/A+)
//     <div class="news-image"><img ...></div>   <- əsas şəkil
//     <span class="news-title">BAŞLIQ<br>2026.07.15 14:53</span>
//     <span class="news-text"> ... </span>      <- GÖVDƏ
//     <div class="share-social"> ... </div>     <- ZİBİL
//   </div>
//
// ƏN VACİB TAPINTI: başlıq və tarix EYNİ elementdədir, `<br>` ilə ayrılıb.
// Tarix başqa heç yerdə yoxdur — səhifədəki `availableDates` massivi arxiv
// təqvimidir və bütün səhifələrdə eynidir.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { load as loadHtml } from 'cheerio';
import TurndownService from 'turndown';
import { BASE, SECTIONS } from './config.mjs';
import { RAW, dataPath } from './lib/paths.mjs';
import { slugify, uniqueSlug } from './lib/slug.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v === undefined ? true : v];
  })
);

// Bölmə üzrə çıxarış qaydaları.
const RULES = {
  news: { title: 'span.news-title', dated: true, body: 'span.news-text', hero: 'div.news-image img', route: 'xeberler' },
  announce: { title: 'span.news-title', dated: true, body: 'span.news-text', hero: 'div.news-image img', route: 'elanlar' },
  content: { title: 'span.page-title', dated: false, body: 'div.page-full-text', route: 'sehife' },
  faculty: { title: 'span.page-title', dated: false, body: 'div.page-full-text', route: 'fakulteler' },
};

// Gövdənin İÇİNƏ düşən şablon elementləri.
// DİQQƏT: `div.page-title-line` BURAYA SALINMAMALIDIR — `content`/`faculty`
// bölmələrində başlıq (`span.page-title`) məhz onun içindədir. Qlobal silsək
// başlıq itir və ehtiyat mənbəyə (kəsilmiş <title>) düşür.
const BODY_NOISE = 'div.share-social, div.page-options, div.news_gallery, script, style, noscript';

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
});
// Boş <a> və şəbəkə ikonları Markdown-a düşməsin.
turndown.addRule('dropEmptyAnchors', {
  filter: (node) => node.nodeName === 'A' && !node.textContent.trim() && !node.querySelector('img'),
  replacement: () => '',
});

const abs = (u) => {
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  return BASE + (u.startsWith('/') ? u : '/' + u);
};

const clean = (s) => (s || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();

/** `2026.07.15 14:53` -> ISO. Azərbaycan UTC+4. */
function parseDate(raw) {
  const m = clean(raw).match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (!m) return null;
  const [, y, mo, d, h = '00', mi = '00'] = m;
  const pad = (v) => String(v).padStart(2, '0');
  return `${y}-${pad(mo)}-${pad(d)}T${pad(h)}:${pad(mi)}:00+04:00`;
}

function extractOne(section, id, locale, html) {
  const rule = RULES[section];
  // Tək parse — 1373 fayl üçün hər qeydə 3 dəfə parse etmək israfdır.
  const $ = loadHtml(html);
  $('script, style, noscript').remove();

  const warnings = [];

  // ── Başlıq + tarix ────────────────────────────────────────────────────
  let title = '';
  let publishedAt = null;

  const titleNode = $(rule.title).first();
  if (titleNode.length) {
    if (rule.dated) {
      // BAŞLIQ<br>TARİX — `<br>`-dan bölürük.
      const parts = (titleNode.html() || '').split(/<br\s*\/?>/i);
      title = clean(loadHtml(`<x>${parts[0] || ''}</x>`).text());
      if (parts[1]) publishedAt = parseDate(loadHtml(`<x>${parts[1]}</x>`).text());
    } else {
      // `- BAŞLIQ -` formasındadır.
      title = clean(titleNode.text()).replace(/^[-–—\s]+|[-–—\s]+$/g, '');
    }
  }
  if (!title) {
    // Ehtiyat: <title> teqi, akademiya suffiksi kəsilmiş.
    title = clean($('title').first().text()).replace(
      /[-–—]\s*(Azərbaycan Dövlət Dəniz Akademiyası|.*Marine Academy|.*[Мм]орская академия)\s*$/i,
      ''
    ).trim();
    warnings.push('basliq ehtiyat menbeden');
  }
  if (rule.dated && !publishedAt) warnings.push('tarix tapilmadi');

  // ── Gövdə ─────────────────────────────────────────────────────────────
  const bodyNode = $(rule.body).first();
  let bodyMarkdown = '';
  const images = [];
  const documents = [];

  if (bodyNode.length) {
    bodyNode.find(BODY_NOISE).remove();
    bodyNode.find('img[src]').each((_, el) => {
      const src = abs($(el).attr('src'));
      $(el).attr('src', src);
      if (src.includes('/uploads/')) images.push(src);
    });
    bodyNode.find('a[href]').each((_, el) => {
      const href = abs($(el).attr('href'));
      $(el).attr('href', href);
      if (/\.(pdf|docx?|xlsx?|pptx?)(\?|$)/i.test(href)) documents.push(href);
    });
    bodyMarkdown = turndown
      .turndown(bodyNode.html() || '')
      .replace(/\u00a0/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  } else {
    warnings.push('govde selektoru tapilmadi');
  }
  if (bodyMarkdown.length < 40) warnings.push('govde bos ve ya cox qisa');

  // ── Əlavələr ──────────────────────────────────────────────────────────
  const heroRaw = rule.hero ? $(rule.hero).first().attr('src') : '';
  const hero = heroRaw && heroRaw.includes('/uploads/') ? abs(heroRaw) : '';
  if (hero) images.unshift(hero);

  const galleryHref = $('a.more_photo').first().attr('href');
  const views = parseInt(clean($('span.hit').first().text()), 10);

  return {
    legacyId: id,
    section,
    locale,
    legacyUrl: `${BASE}/${locale}/${section}/${id}`,
    title,
    publishedAt,
    heroImage: hero || null,
    gallery: galleryHref ? abs(galleryHref) : null,
    views: Number.isFinite(views) ? views : null,
    bodyMarkdown,
    images: [...new Set(images)],
    documents: [...new Set(documents)],
    warnings,
  };
}

// ── Oxu ───────────────────────────────────────────────────────────────────
const wanted = args.section ? String(args.section).split(',') : Object.keys(SECTIONS);
const all = [];

for (const section of wanted) {
  if (!RULES[section]) {
    console.error(`Bilinmeyen bolme: ${section}`);
    process.exit(1);
  }
  const dir = join(RAW, section);
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir)) {
    const m = file.match(/^(\d+)\.([a-z]{2})\.html$/);
    if (!m) continue;
    try {
      all.push(extractOne(section, Number(m[1]), m[2], readFileSync(join(dir, file), 'utf8')));
    } catch (err) {
      console.warn(`  xeta ${section}/${file}: ${err.message}`);
    }
  }
}

if (!all.length) {
  console.error('data/raw/ bosdur. Evvelce: node crawl.mjs');
  process.exit(1);
}

// ── Slug: `az` mənbədir, ru/en eyni slug-ı paylaşır ───────────────────────
//
// Səbəb: dil dəyişdiricisi eyni sənədin digər dilinə keçəndə URL sabit qalsın.
// az yoxdursa (2 sənəd), slug öz dilindən yaranır.
const seen = new Set();
const slugByDoc = new Map();
const order = { az: 0, ru: 1, en: 2 };
all.sort((a, b) => (order[a.locale] - order[b.locale]) || a.legacyId - b.legacyId);

for (const r of all) {
  const docKey = `${r.section}/${r.legacyId}`;
  if (slugByDoc.has(docKey)) {
    r.slug = slugByDoc.get(docKey);
    continue;
  }
  r.slug = uniqueSlug(slugify(r.title, `${r.section}-${r.legacyId}`), seen);
  slugByDoc.set(docKey, r.slug);
}

// ── Nəticələr ─────────────────────────────────────────────────────────────
const outDir = dataPath('extracted');
mkdirSync(outDir, { recursive: true });

const bySection = {};
for (const r of all) (bySection[r.section] ||= []).push(r);
for (const [section, rows] of Object.entries(bySection)) {
  writeFileSync(join(outDir, `${section}.json`), JSON.stringify(rows, null, 1), 'utf8');
}

// Yönləndirmə xəritəsi — SEO üçün kritik. Köhnə URL-lər indeksdədir.
const redirects = all.map((r) => ({
  from: `/${r.locale}/${r.section}/${r.legacyId}`,
  to: `/${r.locale}/${RULES[r.section].route}/${r.slug}`,
}));
writeFileSync(dataPath('redirects.json'), JSON.stringify(redirects, null, 1), 'utf8');

const media = [...new Set(all.flatMap((r) => [...r.images, ...r.documents]))];
writeFileSync(dataPath('media.json'), JSON.stringify(media, null, 1), 'utf8');

// ── Hesabat ───────────────────────────────────────────────────────────────
console.log(`\nEkstraksiya: ${all.length} qeyd\n`);
console.log('bolme     | qeyd | tarixli | sekilli | senedli | xebardarliq');
console.log('----------+------+---------+---------+---------+------------');
for (const [section, rows] of Object.entries(bySection)) {
  console.log(
    section.padEnd(9) + ' | ' + String(rows.length).padStart(4) + ' | ' +
    String(rows.filter((r) => r.publishedAt).length).padStart(7) + ' | ' +
    String(rows.filter((r) => r.images.length).length).padStart(7) + ' | ' +
    String(rows.filter((r) => r.documents.length).length).padStart(7) + ' | ' +
    String(rows.filter((r) => r.warnings.length).length).padStart(11)
  );
}

const counts = {};
for (const r of all) for (const w of r.warnings) counts[w] = (counts[w] || 0) + 1;
if (Object.keys(counts).length) {
  console.log('\nXEBARDARLIQLAR:');
  for (const [w, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(5)}  ${w}`);
    for (const r of all.filter((x) => x.warnings.includes(w)).slice(0, 3)) {
      console.log(`         ${r.section}/${r.legacyId}.${r.locale}  "${r.title.slice(0, 44)}"`);
    }
  }
}

const dates = all.filter((r) => r.publishedAt).map((r) => r.publishedAt).sort();
if (dates.length) console.log(`\nTarix araligi: ${dates[0].slice(0, 10)} .. ${dates[dates.length - 1].slice(0, 10)}`);

const dupes = all.length - new Set(all.map((r) => `${r.slug}|${r.locale}`)).size;
console.log(`Slug toqqusmasi (hell olundu): ${dupes}`);

console.log(`\nYazildi:`);
console.log(`  data/extracted/*.json  (${Object.keys(bySection).length} bolme)`);
console.log(`  data/redirects.json    (${redirects.length} yonlendirme)`);
console.log(`  data/media.json        (${media.length} unikal fayl)`);
console.log('\nNumune yoxlamasi ucun: node preview.mjs news az\n');
