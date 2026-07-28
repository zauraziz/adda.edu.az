// MƏRHƏLƏ 8 — media bağlanması.
//
// Yüklənmiş fayllar sənədlərə bağlanır:
//   article      -> cover (əsas şəkil) + gallery (gövdə şəkilləri) + body URL-ləri
//   announcement -> cover + attachments (PDF/doc) + body URL-ləri
//   page/faculty/program/department -> yalnız body URL-ləri (media sahəsi yoxdur)
//
// NİYƏ VACİB: hazırda gövdədəki şəkillər `adda.edu.az`-dan HOTLINK olunur.
// Köhnə sayt sönərsə demo-da bütün şəkillər itər. Bu mərhələdən sonra
// hər şey Cloudinary-dədir və köhnə saytdan asılılıq qalmır.
//
// İDEMPOTENT: hər sənəd üçün nəticə hesablanır və yalnız DƏYİŞİKLİK varsa
// `PUT` göndərilir. Təkrar işə salış boş keçir.
//
//   node media-link.mjs --dry-run
//   node media-link.mjs --section=news --limit=5
//   node media-link.mjs --force        # PROD üçün məcburi
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { dataPath } from './lib/paths.mjs';
import { loadLinked, loadMediaMap, loadState, saveLinked } from './lib/state.mjs';
import { STRAPI_URL, api, assertToken, ping } from './lib/strapi.mjs';
import { FIELDS, PLURAL, targetTypeFor } from './mapping.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v === undefined ? true : v];
  })
);

const dryRun = Boolean(args['dry-run']);
const limit = args.limit ? parseInt(args.limit, 10) : 0;
const onlySections = args.section ? String(args.section).split(',') : null;
const SECTIONS = ['content', 'faculty', 'announce', 'news'];

// Hansı tiplərdə media sahəsi var (sxemdən yoxlanılıb).
const MEDIA_FIELDS = {
  article: { cover: 'cover', many: 'gallery' },
  announcement: { cover: 'cover', many: 'attachments' },
};

assertToken();
const map = loadMediaMap();
const state = loadState();
// `--relink` ilə tamamlanma qeydi nəzərə alınmır (məcburi yenidən bağlama).
const linked = args.relink ? {} : loadLinked();

if (!Object.keys(map).length) {
  console.error('\n  XETA: media xeritesi bosdur. Evvelce: node media-upload.mjs\n');
  process.exit(1);
}

const records = [];
for (const section of SECTIONS) {
  if (onlySections && !onlySections.includes(section)) continue;
  const f = join(dataPath('extracted'), `${section}.json`);
  if (existsSync(f)) for (const r of JSON.parse(readFileSync(f, 'utf8'))) records.push(r);
}
const active = records.filter((r) => !r.isEmpty);

const isProd = !/localhost|127\.0\.0\.1/.test(STRAPI_URL);
console.log('\n' + '='.repeat(66));
console.log(`  HEDEF : ${STRAPI_URL}${isProd ? '   <<< PROD! >>>' : '   (lokal)'}`);
console.log(`  Xerite: ${Object.keys(map).length} media`);
console.log(`  Qeyd  : ${active.length}`);
console.log(`  Rejim : ${dryRun ? 'DRY-RUN' : 'YAZMA'}${limit ? ` (--limit=${limit})` : ''}`);
console.log(`  Artiq baglanib: ${Object.keys(linked).length}`);
console.log('='.repeat(66) + '\n');

if (isProd && !dryRun && !args.force) {
  console.error('  PROD hedefine yazmaq ucun --force lazimdir.\n');
  process.exit(1);
}
if (!dryRun) await ping();

/** Gövdədəki köhnə URL-ləri Cloudinary URL-lərinə çevir. */
function rewriteBody(body) {
  if (!body) return { body, replaced: 0 };
  let out = body;
  let replaced = 0;
  for (const [oldUrl, file] of Object.entries(map)) {
    if (!file.url || !out.includes(oldUrl)) continue;
    out = out.split(oldUrl).join(file.url);
    replaced++;
  }
  return { body: out, replaced };
}

const stats = { updated: 0, unchanged: 0, failed: 0, covers: 0, attachments: 0, rewrites: 0, missing: 0 };
const failures = [];

let work = active;
if (limit) work = work.slice(0, limit);

let done = 0;
let alreadyDone = 0;
for (const rec of work) {
  const linkKey = `${rec.section}/${rec.legacyId}.${rec.locale}`;
  if (linked[linkKey]) {
    alreadyDone++;
    continue;
  }
  const type = targetTypeFor(rec.section, rec.legacyId);
  const documentId = state[`${rec.section}/${rec.legacyId}`];
  if (!documentId) {
    stats.missing++;
    continue;
  }

  const data = {};

  // 1) Gövdə URL-ləri
  const { body, replaced } = rewriteBody(rec.bodyMarkdown);
  if (replaced) {
    data[FIELDS[type].body] = body;
    stats.rewrites += replaced;
  }

  // 2) Media sahələri (yalnız article / announcement)
  const mf = MEDIA_FIELDS[type];
  if (mf) {
    const hero = rec.heroImage && map[rec.heroImage] ? map[rec.heroImage].id : null;
    if (hero) {
      data[mf.cover] = hero;
      stats.covers++;
    }
    // Çoxluq sahəsi: məqalədə qalereya (şəkillər), elanda əlavələr (sənədlər).
    const pool = type === 'announcement' ? rec.documents : rec.images;
    const ids = (pool || [])
      .filter((u) => map[u] && map[u].id !== hero)
      .map((u) => map[u].id);
    if (ids.length) {
      data[mf.many] = [...new Set(ids)];
      stats.attachments += ids.length;
    }
  }

  if (!Object.keys(data).length) {
    stats.unchanged++;
    linked[linkKey] = true; // media yoxdur — bir daha baxmağa dəyməz
    continue;
  }

  if (dryRun) {
    console.log(
      `  [dry] ${type.padEnd(12)} ${rec.section}/${rec.legacyId}.${rec.locale}  ` +
        Object.keys(data).join(', ')
    );
    stats.updated++;
  } else {
    const res = await api('PUT', `/api/${PLURAL[type]}/${documentId}?locale=${rec.locale}`, { data });
    if (res.ok) {
      stats.updated++;
      linked[linkKey] = true;
      if (stats.updated % 25 === 0) saveLinked(linked);
    } else {
      stats.failed++;
      failures.push({
        key: `${rec.section}/${rec.legacyId}.${rec.locale}`,
        error: res.data?.error?.message || `HTTP ${res.status}`,
      });
      if (failures.length <= 5) console.log(`  XETA ${failures[failures.length - 1].key}: ${failures[failures.length - 1].error}`);
    }
  }

  if (++done % 50 === 0) {
    console.log(`  ${done}/${work.length} | yenilenen ${stats.updated} | xeta ${stats.failed}`);
  }
}

if (!dryRun) saveLinked(linked);

console.log('\n=== MEDIA BAGLANMASI BITDI ===');
if (alreadyDone) console.log(`  artiq baglanmis : ${alreadyDone} (atlandi)`);
console.log(`  yenilenen sened : ${stats.updated}`);
console.log(`  deyisiklik yox  : ${stats.unchanged}`);
console.log(`  cover baglandi  : ${stats.covers}`);
console.log(`  qalereya/elave  : ${stats.attachments}`);
console.log(`  govde URL evezi : ${stats.rewrites}`);
console.log(`  XETA            : ${stats.failed}`);
if (stats.missing) {
  console.log(`  veziyyetde yox  : ${stats.missing}  (idxal olunmayib ve ya silinib)`);
}

if (failures.length) {
  const byErr = {};
  for (const f of failures) byErr[f.error.slice(0, 70)] = (byErr[f.error.slice(0, 70)] || 0) + 1;
  console.log('\nXETALAR:');
  for (const [k, n] of Object.entries(byErr).sort((a, b) => b[1] - a[1]).slice(0, 6)) {
    console.log(`  ${String(n).padStart(4)}  ${k}`);
  }
}

console.log('\nYoxla: demo-da xeber kartlarinda sekil gorunmelidir.\n');
