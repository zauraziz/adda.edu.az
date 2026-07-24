// MƏRHƏLƏ 5 — idxalın doğrulanması.
//
// NİYƏ AYRICA SKRIPT: importer öz sayğaclarını çap edir, amma onlar yalnız
// HTTP cavablarını əks etdirir. "200 OK" almaq ≠ Strapi-də düzgün qeyd olmaq.
// Xüsusən `PUT /api/x/{documentId}?locale=ru` həqiqətən LOKALIZASIYA yaradır,
// yoxsa ayrıca sənəd — bunu yalnız Strapi-dən geri oxumaqla bilmək olar.
//
// Şəbəkə: Strapi (yazmır, yalnız oxuyur).
//
//   node verify.mjs
//   node verify.mjs --section=news
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { dataPath } from './lib/paths.mjs';
import { STRAPI_URL, api, assertToken, ping } from './lib/strapi.mjs';
import { FIELDS, PLURAL, targetTypeFor } from './mapping.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v === undefined ? true : v];
  })
);

const LOCALES = ['az', 'ru', 'en'];
const SECTIONS = ['content', 'faculty', 'announce', 'news'];
const onlySections = args.section ? String(args.section).split(',') : null;

assertToken();
console.log(`\n  Hedef: ${STRAPI_URL}\n`);
await ping();

// ── Mənbə tərəf ──────────────────────────────────────────────────────────
const records = [];
for (const section of SECTIONS) {
  if (onlySections && !onlySections.includes(section)) continue;
  const f = join(dataPath('extracted'), `${section}.json`);
  if (existsSync(f)) for (const r of JSON.parse(readFileSync(f, 'utf8'))) records.push(r);
}
if (!records.length) {
  console.error('data/extracted/ bosdur.');
  process.exit(1);
}

const stateFile = dataPath('import-state.json');
const state = existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, 'utf8')) : {};

// Gözlənilən: tip -> dil -> say
const expected = {};
const activeRecords = records.filter((r) => !r.isEmpty);
for (const r of activeRecords) {
  const t = targetTypeFor(r.section, r.legacyId);
  ((expected[t] ||= {})[r.locale] ||= 0);
  expected[t][r.locale]++;
}

// ── 1. Say pariteti ──────────────────────────────────────────────────────
console.log('=== 1. SAY PARITETI ===');
console.log('tip          | dil |  gozlenilen | Strapi-de | ferq');
console.log('-------------+-----+-------------+-----------+------');
let mismatch = 0;
const actual = {};
for (const [type, byLocale] of Object.entries(expected)) {
  for (const locale of LOCALES) {
    const want = byLocale[locale] || 0;
    const res = await api('GET', `/api/${PLURAL[type]}?locale=${locale}&pagination[pageSize]=1&status=published`);
    const got = res.data?.meta?.pagination?.total ?? -1;
    ((actual[type] ||= {})[locale] = got);
    if (!want && !got) continue;
    const diff = got - want;
    if (diff !== 0) mismatch++;
    console.log(
      type.padEnd(12) + ' | ' + locale.padEnd(3) + ' | ' + String(want).padStart(11) + ' | ' +
      String(got).padStart(9) + ' | ' + (diff === 0 ? '  ok' : (diff > 0 ? '+' : '') + diff)
    );
  }
}
console.log(mismatch ? `\n  ${mismatch} uygunsuzluq var.` : '\n  Tam uygunluq.');

// ── 2. Lokalizasiya bütövlüyü — ƏN KRİTİK YOXLAMA ────────────────────────
//
// Eyni documentId altında ru/en oturmalıdır. Ayrı documentId çıxarsa,
// Strapi-də bir sənədin üç dili yox, üç ayrı sənəd yaranıb deməkdir.
console.log('\n=== 2. LOKALIZASIYA BUTOVLUYU ===');
const multi = {};
for (const r of activeRecords) {
  const k = `${r.section}/${r.legacyId}`;
  (multi[k] ||= new Set()).add(r.locale);
}
const samples = Object.entries(multi).filter(([, s]) => s.size > 1).slice(0, 8);

if (!samples.length) {
  console.log('  Cox dilli sened yoxdur — yoxlama atlandi.');
} else {
  console.log('sened          | documentId       | tapilan diller');
  console.log('---------------+------------------+----------------');
  let broken = 0;
  for (const [key, set] of samples) {
    const documentId = state[key];
    if (!documentId) {
      console.log(key.padEnd(14) + ' | (state-de yoxdur)');
      broken++;
      continue;
    }
    const [section, id] = key.split('/');
    const type = targetTypeFor(section, Number(id));
    const found = [];
    for (const locale of [...set]) {
      const res = await api('GET', `/api/${PLURAL[type]}/${documentId}?locale=${locale}&status=published`);
      if (res.ok && res.data?.data) found.push(locale);
    }
    const okAll = found.length === set.size;
    if (!okAll) broken++;
    console.log(
      key.padEnd(14) + ' | ' + documentId.slice(0, 16).padEnd(16) + ' | ' +
      found.sort().join(',').padEnd(10) + (okAll ? ' ok' : `  GOZLENILEN: ${[...set].sort().join(',')}`)
    );
  }
  console.log(
    broken
      ? `\n  ${broken}/${samples.length} numunede problem — lokalizasiya AYRI sened kimi yaranib.`
      : '\n  Butun numunelerde ru/en eyni documentId altindadir. i18n dogru islenib.'
  );
}

// ── 3. Boş gövdələr ──────────────────────────────────────────────────────
console.log('\n=== 3. BOS GOVDELER ===');
const shouldBeEmpty = records.filter((r) => r.isEmpty).length;
let emptyFound = 0;
const emptySamples = [];
for (const type of Object.keys(expected)) {
  const f = FIELDS[type];
  const res = await api('GET', `/api/${PLURAL[type]}?locale=az&pagination[pageSize]=100&status=published&fields[0]=${f.title}&fields[1]=slug&fields[2]=${f.body}`);
  for (const row of res.data?.data || []) {
    const body = row[f.body];
    if (!body || String(body).trim().length < 40) {
      emptyFound++;
      if (emptySamples.length < 6) emptySamples.push(`${type}/${row.slug}: "${String(row[f.title] || '').slice(0, 38)}"`);
    }
  }
}
console.log(`  mənbədə isEmpty isareli : ${shouldBeEmpty}`);
console.log(`  Strapi-de bos govde     : ${emptyFound} (ilk 100 qeyd uzre, her tip)`);
for (const s of emptySamples) console.log('    ' + s);
if (emptyFound) {
  console.log('  -> Bunlar admin-de silinmeli, ya da mezmunla doldurulmalidir.');
}

// ── 4. Slug sağlamlığı ───────────────────────────────────────────────────
console.log('\n=== 4. SLUG SAGLAMLIGI ===');
let autoSlugs = 0;
const autoSamples = [];
for (const type of Object.keys(expected)) {
  const res = await api('GET', `/api/${PLURAL[type]}?locale=az&pagination[pageSize]=100&status=published&fields[0]=slug`);
  for (const row of res.data?.data || []) {
    // Strapi avtomatik slug-lari tip adindan yaradir: `article`, `article-1`...
    if (new RegExp(`^${type}(-\\d+)?$`).test(row.slug || '')) {
      autoSlugs++;
      if (autoSamples.length < 6) autoSamples.push(`${type}: ${row.slug}`);
    }
  }
}
console.log(`  avtomatik slug (`+'`article-1`'+` kimi): ${autoSlugs}`);
for (const s of autoSamples) console.log('    ' + s);
if (autoSlugs) console.log('  -> Bunlar idxaldan EVVEL el ile elave olunmus qeydlerdir.');
else console.log('  -> Avtomatik slug yoxdur.');

// ── 5. Draft qalan qeydlər ───────────────────────────────────────────────
console.log('\n=== 5. DRAFT / DERC OLUNMUS ===');
for (const type of Object.keys(expected)) {
  const pub = await api('GET', `/api/${PLURAL[type]}?locale=az&pagination[pageSize]=1&status=published`);
  const dr = await api('GET', `/api/${PLURAL[type]}?locale=az&pagination[pageSize]=1&status=draft`);
  const p = pub.data?.meta?.pagination?.total ?? -1;
  const d = dr.data?.meta?.pagination?.total ?? -1;
  console.log(`  ${type.padEnd(12)} derc olunmus ${String(p).padStart(5)} | draft ${String(d).padStart(5)}`);
}
console.log('  -> Draft qeydler public API-de GORUNMUR. Cox olsa `publishedAt` islememis demekdir.');

console.log('\nBu hesabati mene gonder.\n');
