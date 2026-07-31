// K26 — struktur bölmələri (`unit`) və heyət (`person`) üçün idxal.
//
// MƏNBƏ:
//   data/extracted/units.json  — 2025 təşkilati struktur (repoda)
//   data/staff.json            — ştatdan yığılmış heyət (repoda YOX,
//                                staff-parse.mjs --write ilə yaradılır)
//
// İDEMPOTENT: hədəf üzrə ayrı state faylı saxlanılır (bax lib/state.mjs).
// İkinci run yeni heç nə yaratmır, yalnız dəyişəni yeniləyir.
//
// İSTİFADƏ:
//   node staff-import.mjs --plan       # nə olacağını göstər, yazma
//   node staff-import.mjs --dry-run    # eyni, amma API-yə də toxunma
//   node staff-import.mjs              # idxal et

import { existsSync, readFileSync } from 'node:fs';
import { dataPath } from './lib/paths.mjs';
import { loadState, saveState, stateFile, targetLabel } from './lib/state.mjs';
import { STRAPI_URL, api, assertToken, ping } from './lib/strapi.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [m[1], m[2] ?? true] : [a, true];
  }),
);
const planOnly = Boolean(args.plan);
const dryRun = Boolean(args['dry-run']);
const LOCALE = 'az';

// state açarları: `unit:<slug>` və `person:<slug>` -> documentId
const state = loadState();

function readJson(path, hint) {
  if (!existsSync(path)) {
    console.error(`\n  XETA: ${path} tapilmadi.\n  ${hint}\n`);
    process.exit(1);
  }
  return JSON.parse(readFileSync(path, 'utf8'));
}

const units = readJson(dataPath('extracted/units.json'), 'Repodan gelmelidir — git pull et.');
const staffFile = readJson(
  dataPath('staff.json'),
  'Once: node staff-parse.mjs <stat.txt yolu> --write',
);
const staff = staffFile.staff || [];
const vacancies = staffFile.vacancies || [];

console.log(`\n  hedef : ${STRAPI_URL}`);
console.log(`  state : ${stateFile().split(/[\\/]/).pop()}  (${targetLabel()})`);
console.log(`  data  : ${units.length} bolme, ${staff.length} sexs, ${vacancies.length} vakansiya\n`);

if (planOnly || dryRun) {
  const newUnits = units.filter((u) => !state[`unit:${u.slug}`]).length;
  const newPeople = staff.filter((p) => !state[`person:${p.slug}`]).length;
  console.log(`  PLAN: ${newUnits} yeni bolme, ${units.length - newUnits} movcud`);
  console.log(`  PLAN: ${newPeople} yeni sexs, ${staff.length - newPeople} movcud`);
  console.log(`  PLAN: cox vezifeli ${staff.filter((p) => p.roles.length > 1).length}\n`);
  if (planOnly) process.exit(0);
}

assertToken();
await ping();

// ── --verify: prod-da HƏQİQƏTƏN nə görünür ────────────────────────────────
// Yazmadan əvvəl/sonra vəziyyəti oxuyur. `published` sayı 0-dırsa, qeydlər
// draft qalıb və saytda görünməyəcək.
if (args.verify) {
  for (const plural of ['units', 'people']) {
    const out = {};
    for (const status of ['published', 'draft']) {
      const res = await api('GET', `/api/${plural}?locale=${LOCALE}&status=${status}&pagination[pageSize]=1`);
      out[status] = res.ok && res.data?.meta?.pagination ? res.data.meta.pagination.total : `XETA ${res.status}`;
    }
    console.log(`  ${plural.padEnd(8)} published: ${String(out.published).padStart(4)}   draft: ${out.draft}`);
  }
  // Slug təkrarı = əvvəlki run duplikat yaradıb.
  for (const plural of ['units', 'people']) {
    const res = await api('GET', `/api/${plural}?locale=${LOCALE}&status=draft&fields[0]=slug&pagination[pageSize]=500`);
    const list = res.ok && Array.isArray(res.data?.data) ? res.data.data : [];
    const seen = new Map();
    for (const d of list) seen.set(d.slug, (seen.get(d.slug) || 0) + 1);
    const dup = [...seen].filter(([, n]) => n > 1);
    console.log(`  ${plural.padEnd(8)} slug dublikati: ${dup.length}${dup.length ? '  <-- TEMIZLIK LAZIMDIR' : ''}`);
    for (const [slug, n] of dup.slice(0, 10)) console.log(`      ${slug} x${n}`);
  }
  console.log('');
  process.exit(0);
}

const stats = { unitCreated: 0, unitUpdated: 0, personCreated: 0, personUpdated: 0, failed: 0 };
const failures = [];

/**
 * Mövcud sənədi slug ilə tap — state faylı boş olsa da işləsin.
 *
 * HƏM published, HƏM draft yoxlanılır. NİYƏ: `draftAndPublish` açıqdır və
 * REST default olaraq YALNIZ published qaytarır. Yalnız published-a baxsaydıq,
 * əvvəlki run-un draft kimi yaratdığı qeydləri "tapılmadı" sayıb TƏKRAR
 * yaradardıq — nəticədə hər slug üçün iki sənəd.
 */
async function findBySlug(plural, slug) {
  for (const status of ['published', 'draft']) {
    const res = await api(
      'GET',
      `/api/${plural}?locale=${LOCALE}&status=${status}` +
        `&filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=2`,
    );
    const list = res.ok && res.data && Array.isArray(res.data.data) ? res.data.data : [];
    // Sanity: filtr işləməsə Strapi bütün kolleksiyanı qaytarar və biz
    // TAMAM BAŞQA sənədin üstünə yazarıq. Slug-ı geri yoxlayırıq.
    const hit = list.find((d) => d.slug === slug);
    if (hit) return hit.documentId;
  }
  return null;
}

async function upsert(plural, key, slug, data) {
  let documentId = state[key] || (await findBySlug(plural, slug));
  if (dryRun) return { documentId: documentId || 'DRY', created: !documentId };

  if (documentId) {
    const res = await api('PUT', `/api/${plural}/${documentId}?locale=${LOCALE}`, { data });
    if (!res.ok) {
      // Sənəd silinibsə state köhnəlmiş olur — bir dəfə yenidən yaratmağa çalış.
      if (res.status === 404) {
        documentId = null;
      } else {
        failures.push(`${plural}/${slug} PUT HTTP ${res.status}`);
        stats.failed++;
        return null;
      }
    } else {
      state[key] = documentId;
      return { documentId, created: false };
    }
  }

  const res = await api('POST', `/api/${plural}?locale=${LOCALE}`, { data });
  if (!res.ok || !res.data || !res.data.data) {
    failures.push(`${plural}/${slug} POST HTTP ${res.status}`);
    stats.failed++;
    return null;
  }
  state[key] = res.data.data.documentId;
  return { documentId: res.data.data.documentId, created: true };
}

// ── 1-ci keçid: bölmələr valideynsiz yaradılır ────────────────────────────
// NİYƏ İKİ KEÇİD: valideyn əlaqəsi üçün valideynin documentId-si lazımdır,
// o isə yalnız yaradıldıqdan sonra mövcuddur. Bir keçiddə etsək, ağacın
// aşağı hissəsi hələ mövcud olmayan valideynə istinad edərdi.
const unitIds = new Map();
for (const u of units) {
  const vac = vacancies
    .filter((v) => (v.unit === u.name) || (u.name === 'Rəhbərlik' && v.unit === 'Rəhbərlik'))
    .map((v) => ({ position: v.position }));

  const r = await upsert('units', `unit:${u.slug}`, u.slug, {
    name: u.name,
    slug: u.slug,
    // draftAndPublish aciqdir: publishedAt verilmese qeyd DRAFT qalir ve
    // public API-de gorunmur. Eyni tela import.mjs-de de var idi.
    publishedAt: new Date().toISOString(),
    ...(vac.length ? { vacancies: vac } : {}),
  });
  if (!r) continue;
  unitIds.set(u.name, r.documentId);
  if (r.created) stats.unitCreated++;
  else stats.unitUpdated++;
}
saveState(state);

// ── 2-ci keçid: valideyn əlaqələri ────────────────────────────────────────
for (const u of units) {
  if (!u.parentSlug) continue;
  const parent = units.find((x) => x.slug === u.parentSlug);
  const childId = unitIds.get(u.name);
  const parentId = parent ? unitIds.get(parent.name) : null;
  if (!childId || !parentId || dryRun) continue;
  const res = await api('PUT', `/api/units/${childId}?locale=${LOCALE}`, {
    data: { parent: parentId },
  });
  if (!res.ok) failures.push(`units/${u.slug} parent HTTP ${res.status}`);
}

// ── 3-cü keçid: heyət ─────────────────────────────────────────────────────
for (const p of staff) {
  const unitId = unitIds.get(p.unit) || null;
  const r = await upsert('people', `person:${p.slug}`, p.slug, {
    name: p.name,
    slug: p.slug,
    publishedAt: new Date().toISOString(),
    staffType: p.staffType,
    position: p.position,
    roles: p.roles.map((x) => ({
      staffType: x.staffType,
      position: x.position,
      unitName: x.unitName,
      sortOrder: x.sortOrder,
    })),
    ...(unitId ? { unit: unitId } : {}),
  });
  if (!r) continue;
  if (r.created) stats.personCreated++;
  else stats.personUpdated++;
  // Aralıq yazma: 162 qeydin ortasında Render qopsa, artıq yaradılanların
  // documentId-si itməsin — əks halda növbəti run onları TƏKRAR yaradır.
  if ((stats.personCreated + stats.personUpdated) % 20 === 0) saveState(state);
}
saveState(state);

console.log('\n=== NETICE ===');
console.log(`  bolme  : ${stats.unitCreated} yaradildi, ${stats.unitUpdated} yenilendi`);
console.log(`  sexs   : ${stats.personCreated} yaradildi, ${stats.personUpdated} yenilendi`);
console.log(`  ugursuz: ${stats.failed}`);
if (failures.length) {
  console.log('\n  XETALAR:');
  for (const f of failures.slice(0, 20)) console.log(`    ${f}`);
  if (failures.length > 20) console.log(`    ... +${failures.length - 20}`);
}
console.log(`\n  state yazildi: ${stateFile().split(/[\\/]/).pop()}\n`);
process.exit(stats.failed ? 1 : 0);
