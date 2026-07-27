// Boş sənədlərin təmizlənməsi — DRY-RUN standartdır.
//
// TƏHLÜKƏSİZLİK PRİNSİPİ: yalnız MƏNBƏDƏ `isEmpty` işarəli qeydlər silinir.
// Strapi-dən "gövdəsi qısa görünən" hər şeyi silmirik — məsələn yeni il
// təbriki elanının gövdəsi qısadır, amma şəkli var və qanuni məzmundur.
// `isEmpty` = gövdə yoxdur VƏ şəkil yoxdur VƏ sənəd yoxdur.
//
// Hədəf `data/import-state.json`-dakı `documentId` ilə dəqiq tapılır —
// başlıq və ya slug üzrə axtarış YOXDUR, yəni səhv qeyd silinə bilməz.
//
//   node cleanup.mjs             # yalnız gösterir
//   node cleanup.mjs --confirm   # həqiqətən silir
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { dataPath } from './lib/paths.mjs';
import { loadState, saveState, targetLabel } from './lib/state.mjs';
import { STRAPI_URL, api, assertToken, ping } from './lib/strapi.mjs';
import { PLURAL, targetTypeFor } from './mapping.mjs';

const confirm = process.argv.includes('--confirm');
const SECTIONS = ['content', 'faculty', 'announce', 'news'];

assertToken();

const records = [];
for (const section of SECTIONS) {
  const f = join(dataPath('extracted'), `${section}.json`);
  if (existsSync(f)) for (const r of JSON.parse(readFileSync(f, 'utf8'))) records.push(r);
}
if (!records.length) {
  console.error('data/extracted/ bosdur. Evvelce: node extract.mjs');
  process.exit(1);
}
if (!records.some((r) => Object.prototype.hasOwnProperty.call(r, 'isEmpty'))) {
  console.error('\n  XETA: data/extracted/ kohnelmisdir (`isEmpty` sahesi yoxdur).');
  console.error('  Hell:  node extract.mjs\n');
  process.exit(1);
}

const state = loadState();

// Sənəd səviyyəsində: bütün dilləri boşdursa sənəd tamamilə boşdur.
const byDoc = new Map();
for (const r of records) {
  const key = `${r.section}/${r.legacyId}`;
  if (!byDoc.has(key)) byDoc.set(key, []);
  byDoc.get(key).push(r);
}

const targets = [];
for (const [key, list] of byDoc) {
  if (!list.every((r) => r.isEmpty)) continue;
  const documentId = state[key];
  if (!documentId) continue; // idxal olunmayıb
  const [section, id] = key.split('/');
  const type = targetTypeFor(section, Number(id));
  targets.push({ key, documentId, type, title: list[0].title, legacyUrl: list[0].legacyUrl });
}

// ── TİP UYĞUNSUZLUĞU ─────────────────────────────────────────────────────
//
// `mapping.mjs` idxaldan SONRA dəyişibsə (məs. content/28 page -> department),
// sənəd köhnə tipdə qalır və `import.mjs` onu yeniləyə bilmir: PUT gözlənilən
// endpoint-ə gedir, orada isə həmin documentId yoxdur (404).
//
// Yalnız `content/*` yoxlanılır — news/announce/faculty tipləri sabitdir və
// dəyişə bilməz. ~56 sorğu, lokalda ani.
async function findMismatched() {
  const out = [];
  for (const [key, documentId] of Object.entries(state)) {
    if (!key.startsWith('content/')) continue;
    const want = targetTypeFor('content', Number(key.split('/')[1]));
    const res = await api('GET', `/api/${PLURAL[want]}/${documentId}?status=published`);
    if (res.status !== 404) continue;
    let foundIn = null;
    for (const t of ['page', 'department', 'program', 'faculty']) {
      if (t === want) continue;
      const probe = await api('GET', `/api/${PLURAL[t]}/${documentId}?status=published`);
      if (probe.ok) {
        foundIn = t;
        break;
      }
    }
    out.push({ key, documentId, want, foundIn });
  }
  return out;
}

const isProd = !/localhost|127\.0\.0\.1/.test(STRAPI_URL);
console.log('\n' + '='.repeat(66));
console.log(`  HEDEF: ${STRAPI_URL}${isProd ? '   <<< PROD! >>>' : '   (lokal)'}`);
console.log(`  Silinecek: ${targets.length} sened`);
console.log(`  Rejim: ${confirm ? 'SILME' : 'DRY-RUN (hec ne silinmir)'}`);
console.log('='.repeat(66) + '\n');

await ping();

const mismatched = await findMismatched();
if (mismatched.length) {
  console.log('=== SEHV TIPDE OLAN SENEDLER ===');
  console.log('sened          | olmali          | hazirda');
  console.log('---------------+-----------------+----------------');
  for (const m of mismatched) {
    console.log(m.key.padEnd(14) + ' | ' + m.want.padEnd(15) + ' | ' + (m.foundIn || '(tapilmadi)'));
  }
  console.log('\n  Bunlar da silinir — `node import.mjs` onlari DOGRU tipde yeniden yaradacaq.\n');
  for (const m of mismatched) {
    if (!m.foundIn) continue;
    targets.push({ key: m.key, documentId: m.documentId, type: m.foundIn, title: '(sehv tip -> ' + m.want + ')', legacyUrl: '' });
  }
} else {
  console.log('  Tip uygunsuzlugu yoxdur.\n');
}

if (!targets.length) {
  console.log('  Silinecek sened yoxdur.\n');
  process.exit(0);
}

console.log('tip          | documentId       | basliq');
console.log('-------------+------------------+-----------------------------------');
for (const t of targets) {
  console.log(t.type.padEnd(12) + ' | ' + t.documentId.slice(0, 16).padEnd(16) + ' | ' + t.title.slice(0, 42));
  console.log('             | ' + ' '.repeat(16) + ' | ' + t.legacyUrl);
}

if (!confirm) {
  console.log('\n  Hemin senedleri brauzerde ac ve yoxla. Silmek ucun:');
  console.log('    node cleanup.mjs --confirm\n');
  process.exit(0);
}

if (isProd) {
  console.log('\n  PROD hedefinde silme — evvelce lokalda sina.\n');
  process.exit(1);
}

let deleted = 0;
let failed = 0;
for (const t of targets) {
  const res = await api('DELETE', `/api/${PLURAL[t.type]}/${t.documentId}`);
  if (res.ok || res.status === 404) {
    deleted++;
    delete state[t.key];
  } else {
    failed++;
    console.log(`  XETA ${t.key}: ${res.data?.error?.message || res.status}`);
  }
}

saveState(state);
console.log(`\n  silindi: ${deleted} | xeta: ${failed}`);
console.log('  data/import-state.json yenilendi.\n');
console.log('  Novbeti: node import.mjs   (silinen sehv-tipliler dogru tipde yaranir)');
console.log('  Sonra:   node verify.mjs\n');
