// F5.61 — köhnə saytın 15.10–23.11.2026 xəbərləri → Strapi seed məzmunu.
//
// Mənbə: data/f561-oldsite.json — brauzerdən (23.11.2026), extract.mjs-in qaydası ilə:
// başlıq + tarix `span.news-title`, mətn `span.news-text` (paylaşım/qalereya bloku
// çıxarılıb) — XAM HTML; Markdown-a burada çevrilir (lib/legacy-html.mjs). Başlıq, mətn,
// qapaq və qalereya köçürmədən sonra sha256 ilə brauzerdəki nüsxə ilə tutuşdurulub.
// Şəkillər köhnə saytda artıq https://adda-media.pages.dev/uploads/… ünvanındadır (tam
// ünvan saxlanılır — legacy-files.ts tam ünvanı olduğu kimi endirir). Qalereyadakı şablon
// şəkli «poster ADDA.jpg» (xəbərin şəkli deyil) atılır.
//
// Elan: köhnə saytda yeni elan yoxdur (son announce/524, F5.51-də köçürülüb); announce/199
// (2017) köhnə saytda da boşdur — köçürülmür. ru/en səhifələri boşdur.
//
// Çıxış: adda-strapi/src/utils/news-import-f561-content.ts (AVTOMATİK — əl ilə yazma).
//   node f561-news.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, dataPath } from './lib/paths.mjs';
import { slugify } from './lib/slug.mjs';
import { htmlToMarkdown, parseLegacyDate } from './lib/legacy-html.mjs';

const OUT = join(ROOT, '..', '..', 'adda-strapi', 'src', 'utils', 'news-import-f561-content.ts');
const MEDIA = /^https:\/\/(adda-media\.pages\.dev|adda\.edu\.az)\/uploads\//;
const TEMPLATE_IMAGE = /\/uploads\/poster(%20| )ADDA\.jpg$/i;

/** [axtarılan, yeni] — aşkar yazı səhvləri; hər əvəzləmə mətndə OLMALIDIR, yoxsa skript dayanır. */
const EDITS = {
  'news/1996': [['““Qurban Abasov” gəmisində', '“«Qurban Abasov» gəmisində']],
  'news/1999': [
    ['mövzsunda', 'mövzusunda'],
    ['fakultəsinin', 'fakültəsinin'],
  ],
};

function apply(key, body) {
  let out = body;
  for (const [from, to] of EDITS[key] ?? []) {
    if (!out.includes(from)) throw new Error(`${key}: redaktə tapılmadı: ${from.slice(0, 60)}`);
    out = out.replace(from, to);
  }
  if (/adda\.edu\.az\/uploads|pages\.dev\/uploads/.test(out)) throw new Error(`${key}: mətndə köhnə saytın fayl keçidi qalıb`);
  if (/\p{Extended_Pictographic}/u.test(out)) throw new Error(`${key}: emoji qalıb`);
  if (/\*{4}/.test(out)) throw new Error(`${key}: pozuq qalın yazı qalıb`);
  if (/^ {4}/m.test(out)) throw new Error(`${key}: 4 boşluqla başlayan sətir (Markdown kod bloku)`);
  if (out.length < 200) throw new Error(`${key}: mətn çox qısadır`);
  return out;
}

function media(key, list) {
  const out = list.filter((u) => u && !TEMPLATE_IMAGE.test(u));
  for (const u of out) if (!MEDIA.test(u)) throw new Error(`${key}: gözlənilməyən şəkil ünvanı ${u}`);
  return [...new Set(out)];
}

const src = JSON.parse(readFileSync(dataPath('f561-oldsite.json'), 'utf8'));
const news = [];
const slugs = new Set();
for (const it of src.items) {
  if (!it.key.startsWith('news/')) throw new Error(`${it.key}: yalnız xəbər gözlənilir`);
  const date = parseLegacyDate(it.dateRaw);
  if (!date) throw new Error(`${it.key}: tarix oxunmadı (${it.dateRaw})`);
  const slug = slugify(it.title);
  if (slugs.has(slug)) throw new Error(`${it.key}: təkrar slug ${slug}`);
  slugs.add(slug);
  const [hero = ''] = media(it.key, [it.hero]);
  news.push({
    legacy: it.key,
    slug,
    title: it.title,
    date,
    hero,
    gallery: media(it.key, it.gallery).filter((u) => u !== hero),
    body: apply(it.key, htmlToMarkdown(it.body)),
  });
}
news.sort((a, b) => a.date.localeCompare(b.date));

const ts = `/**
 * F5.61 — köhnə saytın (adda.edu.az) 15.10–23.11.2026 xəbərləri (news/1991–2004).
 * AVTOMATİK YARADILIB — ƏL İLƏ DƏYİŞDİRMƏ: tools/migration/f561-news.mjs
 * (mənbə tools/migration/data/f561-oldsite.json, redaktələr orada sadalanıb).
 *
 * Seed: src/utils/news-import.ts (\`newsImport:v2\`). Şəkillər köhnə saytın media
 * ünvanındadır (tam ünvan) — seed endirib media kitabxanasına yükləyir. Köhnə URL-lər
 * adda-nextjs/lib/legacy-redirects.ts-dədir (gen-redirects.mjs → IMPORTED).
 */
import type { ImportArticle } from './news-import-content';

export const IMPORT_ARTICLES_F561: ImportArticle[] = ${JSON.stringify(news, null, 2)};
`;
writeFileSync(OUT, ts, 'utf8');
const photos = news.reduce((n, a) => n + (a.hero ? 1 : 0) + a.gallery.length, 0);
console.log(`  Yazildi: adda-strapi/src/utils/news-import-f561-content.ts — ${news.length} xeber, ${photos} sekil`);
for (const x of news) console.log(`    ${x.legacy.padEnd(10)} ${x.date.slice(0, 10)} ${(x.hero ? 1 : 0) + x.gallery.length}`.padEnd(32) + ` ${x.slug}`);
console.log('\nIMPORTED (gen-redirects.mjs):');
for (const x of news) console.log(`  '${x.legacy}': 'xeberler/${x.slug}',`);
