// MƏRHƏLƏ 4 — Strapi-yə idxal.
//
// TƏHLÜKƏSİZLİK: standart hədəf LOKAL Strapi-dir. Prod-a yazmaq üçün .env-də
// STRAPI_URL dəyişdirilməlidir və skript başlıqda hədəfi böyük hərflərlə yazır.
//
// İDEMPOTENT: `data/import-state.json` faylı `bolme/id` -> `documentId`
// uyğunluğunu saxlayır. Təkrar işlədəndə yeni yazı yaratmır, mövcudu yeniləyir.
// Beləliklə yarıda kəsilən idxal təhlükəsiz davam etdirilir.
//
// DİL: `az` əvvəl yaradılır (documentId alınır), ru/en həmin documentId-yə
// lokalizasiya kimi əlavə olunur. Bu, F2.3 relSync middleware-inin gözlədiyi
// mənbə-dil qaydasıdır.
//
// İstifadə:
//   node import.mjs --plan                    # heç nə yazmır, xəritəni göstərir
//   node import.mjs --section=news --limit=5 --dry-run
//   node import.mjs --section=news --limit=5  # kiçik sınaq
//   node import.mjs                           # hamısı
//   node import.mjs --include-empty           # isEmpty qeydləri də gətir
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { dataPath } from './lib/paths.mjs';
import { STRAPI_URL, api, assertToken, ping } from './lib/strapi.mjs';
import { FIELDS, PERSON_PAGES, PLURAL, targetTypeFor } from './mapping.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v === undefined ? true : v];
  })
);

const planOnly = Boolean(args.plan);
const dryRun = Boolean(args['dry-run']);
const includeEmpty = Boolean(args['include-empty']);
const limit = args.limit ? parseInt(args.limit, 10) : 0;
const onlySections = args.section ? String(args.section).split(',') : null;

const SECTIONS = ['content', 'faculty', 'announce', 'news'];
const STATE_FILE = () => dataPath('import-state.json');

function loadState() {
  const f = STATE_FILE();
  if (!existsSync(f)) return {};
  try {
    return JSON.parse(readFileSync(f, 'utf8'));
  } catch {
    return {};
  }
}
const state = loadState();
let pending = 0;
function saveState(force = false) {
  if (!force && ++pending < 20) return;
  writeFileSync(STATE_FILE(), JSON.stringify(state, null, 1), 'utf8');
  pending = 0;
}

// ── Qeydləri oxu ─────────────────────────────────────────────────────────
const records = [];
for (const section of SECTIONS) {
  if (onlySections && !onlySections.includes(section)) continue;
  const f = join(dataPath('extracted'), `${section}.json`);
  if (!existsSync(f)) continue;
  for (const r of JSON.parse(readFileSync(f, 'utf8'))) records.push(r);
}
if (!records.length) {
  console.error('data/extracted/ bosdur. Evvelce: node extract.mjs');
  process.exit(1);
}

// Sənəd üzrə qrupla: az əvvəl, sonra ru/en.
const order = { az: 0, ru: 1, en: 2 };
const docs = new Map();
for (const r of records) {
  if (r.isEmpty && !includeEmpty) continue;
  const key = `${r.section}/${r.legacyId}`;
  if (!docs.has(key)) docs.set(key, []);
  docs.get(key).push(r);
}
for (const list of docs.values()) list.sort((a, b) => order[a.locale] - order[b.locale]);

let docList = [...docs.entries()];
if (limit) docList = docList.slice(0, limit);

// ── --plan: yalnız xəritəni göstər ───────────────────────────────────────
if (planOnly) {
  const byType = {};
  for (const [key, list] of docs) {
    const r = list[0];
    const t = targetTypeFor(r.section, r.legacyId);
    (byType[t] ||= []).push({ key, title: r.title, locales: list.map((x) => x.locale).join(',') });
  }
  console.log('\n=== IDXAL PLANI ===\n');
  console.log('tip          | sened | numuneler');
  console.log('-------------+-------+------------------------------------------');
  for (const [t, list] of Object.entries(byType).sort((a, b) => b[1].length - a[1].length)) {
    console.log(t.padEnd(12) + ' | ' + String(list.length).padStart(5) + ' | ' + list.slice(0, 2).map((x) => x.title.slice(0, 30)).join(' / '));
  }
  const content = [...docs.entries()].filter(([k]) => k.startsWith('content/'));
  console.log(`\n=== content/* teyinatlari (${content.length}) ===`);
  console.log('  id | tip         | diller | basliq');
  console.log('-----+-------------+--------+---------------------------------');
  for (const [key, list] of content.sort((a, b) => Number(a[0].split('/')[1]) - Number(b[0].split('/')[1]))) {
    const id = Number(key.split('/')[1]);
    const t = targetTypeFor('content', id);
    const mark = PERSON_PAGES.includes(id) ? ' *' : '';
    console.log(
      String(id).padStart(4) + ' | ' + (t + mark).padEnd(11) + ' | ' +
      list.map((x) => x.locale).join(',').padEnd(6) + ' | ' + list[0].title.slice(0, 40)
    );
  }
  console.log('\n  * = sexs profili; `page` kimi gelir, `person` qeydleri K4-de qurulur.');
  console.log('  Sehv teyinat varsa tools/migration/mapping.mjs faylini duzelt.\n');
  process.exit(0);
}

// ── Hədəf yoxlaması ──────────────────────────────────────────────────────
assertToken();
const isProd = !/localhost|127\.0\.0\.1/.test(STRAPI_URL);
console.log('\n' + '='.repeat(66));
console.log(`  HEDEF: ${STRAPI_URL}${isProd ? '   <<< PROD! >>>' : '   (lokal)'}`);
console.log(`  Sened: ${docList.length}${limit ? ` (--limit=${limit})` : ''}`);
console.log(`  Rejim: ${dryRun ? 'DRY-RUN (hec ne yazilmir)' : 'YAZMA'}`);
console.log('='.repeat(66) + '\n');

if (isProd && !dryRun && !args.force) {
  console.error('  PROD hedefine yazmaq ucun --force lazimdir. Evvelce lokalda sina.\n');
  process.exit(1);
}
if (!dryRun) await ping();

// ── Payload qurucusu ─────────────────────────────────────────────────────
function buildPayload(type, rec) {
  const f = FIELDS[type];
  const data = {
    [f.title]: rec.title.slice(0, 255),
    slug: rec.slug,
    [f.body]: rec.bodyMarkdown || '',
    // draftAndPublish acqdir: publishedAt verilmese qeyd DRAFT qalir ve
    // public API-de gorunmur. Kohne saytda hamisi derc olunmusdu.
    publishedAt: rec.publishedAt || new Date().toISOString(),
  };
  if (type === 'article') {
    data.category = 'xeber';
    data.visibility = 'academy';
    data.showOnHome = false;
    data.homeStatus = 'none';
    if (rec.publishedAt) data.newsDate = rec.publishedAt.slice(0, 10);
  }
  if (type === 'announcement') {
    data.visibility = 'academy';
    data.importance = 'normal';
    data.showOnHome = false;
    data.homeStatus = 'none';
    if (rec.publishedAt) data.publishAt = rec.publishedAt;
  }
  if (type === 'program') data.degree = 'bachelor';
  return data;
}

// ── İdxal ────────────────────────────────────────────────────────────────
const stats = { created: 0, updated: 0, localized: 0, skipped: 0, failed: 0 };
const failures = [];

for (const [key, list] of docList) {
  const base = list[0];
  const type = targetTypeFor(base.section, base.legacyId);
  const plural = PLURAL[type];
  let documentId = state[key] || null;

  for (const rec of list) {
    const payload = buildPayload(type, rec);

    if (dryRun) {
      console.log(`  [dry] ${type.padEnd(12)} ${key}.${rec.locale}  "${rec.title.slice(0, 40)}"`);
      stats.skipped++;
      continue;
    }

    let res;
    if (!documentId) {
      res = await api('POST', `/api/${plural}?locale=${rec.locale}`, { data: payload });
      if (res.ok && res.data?.data?.documentId) {
        documentId = res.data.data.documentId;
        state[key] = documentId;
        stats.created++;
      }
    } else {
      // Mövcud sənəd: bu dil üçün yarat/yenilə.
      res = await api('PUT', `/api/${plural}/${documentId}?locale=${rec.locale}`, { data: payload });
      if (res.ok) (rec.locale === 'az' ? stats.updated++ : stats.localized++);
    }

    if (!res.ok) {
      stats.failed++;
      const msg = res.data?.error?.message || res.error || `HTTP ${res.status}`;
      failures.push({ key: `${key}.${rec.locale}`, type, msg });
      if (failures.length <= 5) console.log(`  XETA ${key}.${rec.locale}: ${msg}`);
    }
    saveState();
  }

  const done = stats.created + stats.updated;
  if (done % 25 === 0 && done) {
    console.log(`  ${done}/${docList.length} | yaradilan ${stats.created} | lokalizasiya ${stats.localized} | xeta ${stats.failed}`);
  }
}

saveState(true);

console.log('\n=== IDXAL BITDI ===');
console.log(`  yaradilan     : ${stats.created}`);
console.log(`  yenilenen     : ${stats.updated}`);
console.log(`  lokalizasiya  : ${stats.localized}`);
console.log(`  atlanan       : ${stats.skipped}`);
console.log(`  XETA          : ${stats.failed}`);

if (failures.length) {
  const byMsg = {};
  for (const f of failures) byMsg[f.msg] = (byMsg[f.msg] || 0) + 1;
  console.log('\nXETALAR (novune gore):');
  for (const [msg, n] of Object.entries(byMsg).sort((a, b) => b[1] - a[1]).slice(0, 8)) {
    console.log(`  ${String(n).padStart(4)}  ${msg.slice(0, 70)}`);
  }
  console.log('\n  Eyni emri tekrar islet — ugurlular state-de qeydlidir, yalniz xetalilar cehd olunacaq.');
}

if (!dryRun) console.log(`\n  Vəziyyət: data/import-state.json (${Object.keys(state).length} sened)\n`);
