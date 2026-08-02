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

// ── --contacts: e-poçt və doğum tarixi ────────────────────────────────────
// E-poçt `person`-a yazılır (public — iş ünvanıdır).
// Doğum tarixi AYRI content type-a yazılır: `person` public API-də oxunur,
// ona görə orada saxlansaydı 157 nəfərin doğum tarixi
// `GET /api/people` ilə hər kəsə açıq olardı.
if (args.contacts) {
  const cp = dataPath('staff-contacts.json');
  if (!existsSync(cp)) {
    console.error('\n  XETA: data/staff-contacts.json tapilmadi.');
    console.error('  Once: node staff-contacts.mjs <HeyetAdGunu.csv> --write\n');
    process.exit(1);
  }
  const { contacts } = JSON.parse(readFileSync(cp, 'utf8'));
  let mail = 0;
  let born = 0;
  let skip = 0;
  const errs = [];

  for (const c of contacts) {
    const documentId = state[`person:${c.slug}`] || (await findBySlug('people', c.slug));
    if (!documentId) { skip++; continue; }

    if (c.email || c.altEmail) {
      const data = {};
      if (c.email) data.email = c.email;
      if (c.altEmail) data.altEmail = c.altEmail;
      const res = await api('PUT', `/api/people/${documentId}?locale=${LOCALE}`, { data });
      if (res.ok) mail++;
      else errs.push(`people/${c.slug} HTTP ${res.status}`);
    }

  }

  // ── Doğum tarixləri: ayrıca admin endpointi ─────────────────────────────
  // `staff-private` REST-ə açılmayıb (public API-də oxunmasın deyə), ona görə
  // adi CRUD ilə yazmaq mümkün deyil. `POST /api/identity/admin/staff-private`
  // YALNIZ YAZAN endpointdir və `ADMIN_IMPORT_SECRET` ilə qorunur.
  const withDates = contacts.filter((c) => c.birthDate);
  if (withDates.length) {
    const secret = process.env.ADMIN_IMPORT_SECRET || '';
    if (secret.length < 16) {
      errs.push('ADMIN_IMPORT_SECRET teyin edilmeyib (min 16 simvol) -- dogum tarixleri atlandi');
    } else {
      const CHUNK = 100;
      for (let i = 0; i < withDates.length; i += CHUNK) {
        const items = withDates
          .slice(i, i + CHUNK)
          .map((c) => ({ personSlug: c.slug, birthDate: c.birthDate }));
        const res = await api('POST', '/api/identity/admin/staff-private', { items }, {
          headers: { 'x-adda-admin-secret': secret },
        });
        if (res.ok) {
          born += (res.data?.created ?? 0) + (res.data?.updated ?? 0);
          if (res.data?.skipped) errs.push(`admin/staff-private: ${res.data.skipped} qeyd atlandi`);
        } else if (res.status === 503) {
          errs.push('admin/staff-private baglidir -- Render-de ADMIN_IMPORT_SECRET teyin et');
          break;
        } else {
          errs.push(`admin/staff-private HTTP ${res.status}`);
        }
      }
    }
  }

  saveState(state);
  console.log(`\n  e-poct yazildi   : ${mail}`);
  console.log(`  dogum tarixi     : ${born}`);
  console.log(`  atlandi (tapilmadi): ${skip}`);
  if (errs.length) {
    console.log('\n  XETALAR:');
    for (const e of errs.slice(0, 15)) console.log(`    ${e}`);
    if (errs.length > 15) console.log(`    ... +${errs.length - 15}`);
  }
  console.log('');
  process.exit(errs.length ? 1 : 0);
}

// ── --verify: prod-da HƏQİQƏTƏN nə görünür ────────────────────────────────
// Yazmadan əvvəl/sonra vəziyyəti oxuyur. `published` sayı 0-dırsa, qeydlər
// draft qalıb və saytda görünməyəcək.
// ── --stale: kohnelmis profiller ──────────────────────────────────────────
// Ozunexidmet yalniz yarim helldir: adami geri qaytaran mexanizm olmasa
// melumat yene kohnelir. Bu hesabat kimin xatirladilmasi lazim oldugunu verir.
// `--months N` ile hedd deyisir (default 12).
if (args.stale) {
  const months = Number(args.months) > 0 ? Number(args.months) : 12;
  const cutoff = Date.now() - months * 30.4 * 24 * 3600 * 1000;

  const rows = [];
  let page = 1;
  for (;;) {
    const res = await api(
      'GET',
      `/api/people?locale=${LOCALE}&status=draft&pagination[page]=${page}&pagination[pageSize]=100` +
        '&fields[0]=slug&fields[1]=name&fields[2]=displayName&fields[3]=email&fields[4]=profileUpdatedAt',
    );
    if (!res.ok) {
      console.error(`\n  XETA: /api/people HTTP ${res.status}\n`);
      process.exit(1);
    }
    for (const d of res.data?.data ?? []) rows.push(d);
    const pg = res.data?.meta?.pagination;
    if (!pg || page >= pg.pageCount) break;
    page++;
  }

  const never = rows.filter((r) => !r.profileUpdatedAt);
  const old = rows
    .filter((r) => r.profileUpdatedAt && new Date(r.profileUpdatedAt).getTime() < cutoff)
    .sort((a, b) => new Date(a.profileUpdatedAt) - new Date(b.profileUpdatedAt));
  const fresh = rows.length - never.length - old.length;

  console.log(`\n=== PROFIL AKTUALLIGI (hedd: ${months} ay) ===`);
  console.log(`  cemi      : ${rows.length}`);
  console.log(`  teze      : ${fresh}`);
  console.log(`  kohnelmis : ${old.length}`);
  console.log(`  hec vaxt  : ${never.length}`);

  if (old.length) {
    console.log(`\n  KOHNELMIS (${old.length}):`);
    for (const r of old) {
      console.log(`    ${String(r.profileUpdatedAt).slice(0, 10)}  ${(r.email || '-').padEnd(34)} ${r.displayName || r.name}`);
    }
  }
  if (never.length) {
    console.log(`\n  HEC VAXT YENILENMEYIB (${never.length}):`);
    for (const r of never.slice(0, 40)) console.log(`    ${(r.email || '-').padEnd(34)} ${r.displayName || r.name}`);
    if (never.length > 40) console.log(`    ... +${never.length - 40}`);
  }

  // Xatirlatma kampaniyasi ucun hazir siyahi (bend 17).
  const targets = [...never, ...old].filter((r) => r.email).map((r) => r.email);
  if (targets.length) {
    console.log(`\n  XATIRLATMA UCUN E-POCT (${targets.length}):`);
    console.log('  ' + targets.join('; '));
  }
  console.log('');
  process.exit(0);
}

// ── --orphans / --delete-orphan ───────────────────────────────────────────
// Strapi-də olub mənbədə olmayan `person` qeydləri. Adətən admin panelində
// əl ilə yaradılmış sınaq qeydləridir (uid sahəsi default `person` qalır).
//
// SİLMƏDƏN ƏVVƏL ƏLAQƏLƏR YOXLANILIR: qeydə bağlı məqalə/elan/tədbir varsa
// silmək həmin əlaqələri qırar. O halda skript İMTİNA edir — əvvəlcə əlaqələr
// düzgün qeydə keçirilməlidir.
if (args.orphans || args['delete-orphan']) {
  const expected = new Set(staff.map((p) => p.slug));
  const found = [];
  let page = 1;
  for (;;) {
    const res = await api(
      'GET',
      `/api/people?locale=${LOCALE}&status=draft&fields[0]=slug&fields[1]=name` +
        `&populate[articles][count]=true&populate[announcements][count]=true&populate[events][count]=true` +
        `&pagination[page]=${page}&pagination[pageSize]=100`,
    );
    const list = res.ok && Array.isArray(res.data?.data) ? res.data.data : [];
    for (const d of list) if (!expected.has(d.slug)) found.push(d);
    const pg = res.data?.meta?.pagination;
    if (!pg || page >= pg.pageCount) break;
    page++;
  }

  const countOf = (v) => (v && typeof v === 'object' && 'count' in v ? v.count : Array.isArray(v) ? v.length : 0);

  if (!args['delete-orphan']) {
    console.log(`  menbede olmayan person qeydi: ${found.length}\n`);
    for (const d of found) {
      const rel = countOf(d.articles) + countOf(d.announcements) + countOf(d.events);
      console.log(`    slug: ${d.slug}`);
      console.log(`    ad  : ${d.name}`);
      console.log(`    bagli qeyd: ${rel}${rel ? '  <-- silmek elaqeleri qirar' : '  (silmek tehlukesizdir)'}`);
      console.log(`    silmek ucun: node staff-import.mjs --delete-orphan=${d.slug}\n`);
    }
    process.exit(0);
  }

  const target = String(args['delete-orphan']);
  const hit = found.find((d) => d.slug === target);
  if (!hit) {
    console.error(`  XETA: "${target}" menbede olmayan qeydler arasinda tapilmadi.`);
    console.error('  Menbede MOVCUD olan qeyd silinmir -- bu qesden belededir.\n');
    process.exit(1);
  }
  const rel = countOf(hit.articles) + countOf(hit.announcements) + countOf(hit.events);
  if (rel > 0) {
    console.error(`  IMTINA: "${target}" qeydine ${rel} sened baglidir.`);
    console.error('  Once hemin elaqeleri dogru qeyde kecir, sonra sil.\n');
    process.exit(1);
  }
  // DIQQET: `?locale=` VACIBDIR. Locale-siz DELETE ingilis versiyasi olmayan
  // sened ucun 404 verir (Strapi default locale `en`).
  const del = await api('DELETE', `/api/people/${hit.documentId}?locale=${LOCALE}`);
  console.log(del.ok ? `  Silindi: ${target} (${hit.name})\n` : `  XETA: HTTP ${del.status}\n`);
  process.exit(del.ok ? 0 : 1);
}

if (args.verify || args.audit) {
  // DİQQƏT — Strapi 5-də `draft` sayı SƏNƏD SAYIDIR, dərc olunmamışların sayı
  // deyil: dərc olunmuş sənədin də draft versiyası qalır. Ona görə mənalı
  // yoxlama `published === draft`-dir. `published < draft` olsa, fərq qədər
  // sənəd dərc olunmayıb.
  const totals = {};
  for (const plural of ['units', 'people']) {
    const out = {};
    for (const status of ['published', 'draft']) {
      const res = await api('GET', `/api/${plural}?locale=${LOCALE}&status=${status}&pagination[pageSize]=1`);
      out[status] = res.ok && res.data?.meta?.pagination ? res.data.meta.pagination.total : -1;
    }
    totals[plural] = out;
    const gap = out.draft - out.published;
    console.log(
      `  ${plural.padEnd(8)} sened: ${String(out.draft).padStart(4)}   derc olunmus: ${String(out.published).padStart(4)}` +
        (gap > 0 ? `   <-- ${gap} DERC OLUNMAYIB` : '   OK'),
    );
  }

  // Strapi-dəki slug-ları mənbə fayllarla tutuşdur.
  const expected = { units: new Set(units.map((u) => u.slug)), people: new Set(staff.map((p) => p.slug)) };
  for (const plural of ['units', 'people']) {
    const seen = new Map();
    let page = 1;
    for (;;) {
      const res = await api(
        'GET',
        `/api/${plural}?locale=${LOCALE}&status=draft&fields[0]=slug&fields[1]=name` +
          `&pagination[page]=${page}&pagination[pageSize]=100`,
      );
      const list = res.ok && Array.isArray(res.data?.data) ? res.data.data : [];
      for (const d of list) seen.set(d.slug, { name: d.name, n: (seen.get(d.slug)?.n || 0) + 1 });
      const pg = res.data?.meta?.pagination;
      if (!pg || page >= pg.pageCount) break;
      page++;
    }
    const dup = [...seen].filter(([, v]) => v.n > 1);
    const extra = [...seen.keys()].filter((sl) => !expected[plural].has(sl));
    const missing = [...expected[plural]].filter((sl) => !seen.has(sl));

    console.log(`\n  ${plural}: Strapi ${seen.size} | menbe ${expected[plural].size}`);
    console.log(`    dublikat slug : ${dup.length}${dup.length ? '  <-- TEMIZLIK LAZIMDIR' : ''}`);
    for (const [sl, v] of dup.slice(0, 10)) console.log(`      ${sl} x${v.n}`);
    console.log(`    Strapi-de VAR, menbede YOX : ${extra.length}`);
    for (const sl of extra.slice(0, 20)) console.log(`      ${sl}  (${seen.get(sl).name})`);
    console.log(`    menbede VAR, Strapi-de YOX : ${missing.length}`);
    for (const sl of missing.slice(0, 20)) console.log(`      ${sl}`);
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
    // "Ad Ata Soyad" -- elifba indeksi buna gore isleyir.
    displayName: p.displayName || p.name,
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
