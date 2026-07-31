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

const stats = { unitCreated: 0, unitUpdated: 0, personCreated: 0, personUpdated: 0, failed: 0 };
const failures = [];

/** Mövcud sənədi slug ilə tap — state faylı boş olsa da işləsin. */
async function findBySlug(plural, slug) {
  const res = await api(
    'GET',
    `/api/${plural}?locale=${LOCALE}&filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[pageSize]=1`,
  );
  const hit = res.ok && res.data && Array.isArray(res.data.data) ? res.data.data[0] : null;
  return hit ? hit.documentId : null;
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
