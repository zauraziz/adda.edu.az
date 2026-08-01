// K26-12 — HeyetAdGunu.csv -> əlaqə məlumatları.
//
// MƏNBƏ SÜTUNLARI: Title, StrukturBolme, Vezife, AddaEmail, AscoEmail, DogumTarixi
//
// TARİX FORMATI: `AA-GG-İİ` (ay-gün-il), məs. `04-29-83` = 29 aprel 1983.
// Bunu təxmin etmədim — bütün 182 dəyər yoxlanıldı: 1-ci hissə heç vaxt 12-ni
// keçmir, 2-ci hissə 31-ə çatır. Yəni 1-ci = ay, 2-ci = gün.
//
// İKİRƏQƏMLİ İL: `71` -> 1971, `04` -> 2004. Kəsim 30-dur (bugünkü işçi
// heyəti üçün 2030-cu ildə doğulmuş adam ola bilməz).
//
// DOĞUM TARİXİ AÇIQ DEYİL: `person` public API-də oxunur, ona görə tarix
// AYRI content type-a (`staff-private`) yazılır — onun REST marşrutu yoxdur.
// Bax: K26-12 skriptindəki izah.
//
// İSTİFADƏ: node staff-contacts.mjs <HeyetAdGunu.csv> [--write]

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dataPath } from './lib/paths.mjs';

const SRC = process.argv[2];
const WRITE = process.argv.includes('--write');
if (!SRC) {
  console.error('Istifade: node staff-contacts.mjs <HeyetAdGunu.csv> [--write]');
  process.exit(1);
}
if (!existsSync(SRC)) {
  console.error(`XETA: ${SRC} tapilmadi.`);
  process.exit(1);
}

/** RFC 4180 sətir parseri — dırnaq içindəki vergülü qorumaq üçün. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; } else quoted = false;
      } else cur += ch;
      continue;
    }
    if (ch === '"') { quoted = true; continue; }
    if (ch === ',') { row.push(cur); cur = ''; continue; }
    if (ch === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; continue; }
    if (ch === '\r') continue;
    cur += ch;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
const lower = (s) => norm(s).toLowerCase();

/** oğlu/qızı şəkilçisiz variant — ştatla CSV arasında cins uyğunsuzluğu var. */
const stripPatronymSuffix = (s) => lower(s).replace(/\s+(oğlu|qızı)$/, '');

function parseDate(raw) {
  const v = norm(raw);
  const m = v.match(/^(\d{2})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const month = Number(m[1]);
  const day = Number(m[2]);
  const yy = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const year = yy > 30 ? 1900 + yy : 2000 + yy;
  const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  // Ay uzunluğu yoxlaması — `02-30` kimi dəyər səssizcə sürüşməsin.
  const d = new Date(`${iso}T00:00:00Z`);
  if (d.getUTCMonth() + 1 !== month || d.getUTCDate() !== day) return null;
  return iso;
}

function cleanEmail(raw) {
  const v = norm(raw).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? v : null;
}

// ── Oxu ───────────────────────────────────────────────────────────────────
const text = readFileSync(SRC, 'utf8').replace(/^\uFEFF/, '');
const rows = parseCsv(text);
const header = rows.shift().map(norm);
const col = Object.fromEntries(header.map((h, i) => [h, i]));
for (const need of ['Title', 'AddaEmail', 'AscoEmail', 'DogumTarixi']) {
  if (!(need in col)) {
    console.error(`XETA: "${need}" sutunu tapilmadi. Basliq: ${header.join(', ')}`);
    process.exit(1);
  }
}

const records = rows
  .filter((r) => norm(r[col.Title]))
  .map((r) => ({
    name: norm(r[col.Title]),
    email: cleanEmail(r[col.AddaEmail]),
    altEmail: cleanEmail(r[col.AscoEmail]),
    birthDate: parseDate(r[col.DogumTarixi]),
    rawDate: norm(r[col.DogumTarixi]),
  }));

// ── Ştatla uyğunlaşdırma ──────────────────────────────────────────────────
const staffPath = dataPath('staff.json');
if (!existsSync(staffPath)) {
  console.error('\n  XETA: data/staff.json tapilmadi.');
  console.error('  Once: node staff-parse.mjs data\\stat.txt --write\n');
  process.exit(1);
}
const { staff } = JSON.parse(readFileSync(staffPath, 'utf8'));

const exact = new Map(staff.map((p) => [lower(p.name), p]));
const loose = new Map();
for (const p of staff) {
  const k = stripPatronymSuffix(p.name);
  if (!loose.has(k)) loose.set(k, []);
  loose.get(k).push(p);
}

const matched = [];
const suffixMismatch = [];
const unmatched = [];
const badDates = [];

for (const rec of records) {
  if (rec.rawDate && !rec.birthDate) badDates.push(rec);

  let person = exact.get(lower(rec.name));
  if (!person) {
    const cands = loose.get(stripPatronymSuffix(rec.name)) || [];
    if (cands.length === 1) {
      person = cands[0];
      suffixMismatch.push({ csv: rec.name, stat: person.name });
    }
  }
  if (!person) { unmatched.push(rec); continue; }

  matched.push({
    slug: person.slug,
    name: person.name,
    email: rec.email,
    altEmail: rec.altEmail,
    birthDate: rec.birthDate,
  });
}

// CSV-də bir adam BİR NEÇƏ DƏFƏ ola bilər — çox vəzifəli işçilər hər vəzifə
// üçün ayrı sətirdədir (dekan + professor). Bu, təkrarlanan e-poçt DEYİL;
// slug üzrə birləşdiririk. Ziddiyyət varsa (eyni slug, fərqli e-poçt) qeyd olunur.
const bySlug = new Map();
const conflicts = [];
for (const m of matched) {
  const prev = bySlug.get(m.slug);
  if (!prev) { bySlug.set(m.slug, { ...m }); continue; }
  for (const f of ['email', 'altEmail', 'birthDate']) {
    if (!m[f]) continue;
    if (!prev[f]) { prev[f] = m[f]; continue; }
    if (prev[f] !== m[f]) conflicts.push({ slug: m.slug, field: f, a: prev[f], b: m[f] });
  }
}
const contacts = [...bySlug.values()];

// Eyni e-poçt FƏRQLİ adamlara düşərsə profil girişi yanlış adamı açar —
// bu, təhlükəsizlik məsələsidir, ona görə ayrıca yoxlanılır.
const byEmail = new Map();
for (const m of contacts) {
  if (!m.email) continue;
  if (!byEmail.has(m.email)) byEmail.set(m.email, new Set());
  byEmail.get(m.email).add(m.slug);
}
const dupEmails = [...byEmail].filter(([, v]) => v.size > 1).map(([e, v]) => [e, [...v]]);

const csvNames = new Set(records.map((r) => lower(r.name)));
const csvLoose = new Set(records.map((r) => stripPatronymSuffix(r.name)));
const noContact = staff.filter(
  (p) => !csvNames.has(lower(p.name)) && !csvLoose.has(stripPatronymSuffix(p.name)),
);

// ── Hesabat ───────────────────────────────────────────────────────────────
console.log('\n=== ELAQE MELUMATLARI ===');
console.log(`  CSV setri        : ${records.length}`);
console.log(`  uygunlasdirildi  : ${matched.length} setir -> ${contacts.length} sexs`);
console.log(`    e-poct         : ${contacts.filter((m) => m.email).length}`);
console.log(`    asco e-poct    : ${contacts.filter((m) => m.altEmail).length}`);
console.log(`    dogum tarixi   : ${contacts.filter((m) => m.birthDate).length}`);

if (conflicts.length) {
  console.log(`\n=== EYNI SEXS, ZIDD DEYER (${conflicts.length}) ===`);
  for (const c of conflicts) console.log(`  ${c.slug}.${c.field}: "${c.a}" vs "${c.b}"`);
}

if (suffixMismatch.length) {
  console.log(`\n=== oglu/qizi UYGUNSUZLUGU (${suffixMismatch.length}) -- BIRI SEHVDIR ===`);
  for (const s of suffixMismatch) console.log(`  CSV: ${s.csv}\n  stat: ${s.stat}\n`);
}
if (dupEmails.length) {
  console.log(`\n=== EYNI E-POCT, FERQLI SEXS (${dupEmails.length}) -- PROFIL GIRISI UCUN TEHLUKELI ===`);
  for (const [e, slugs] of dupEmails) console.log(`  ${e}: ${slugs.join(', ')}`);
}
if (badDates.length) {
  console.log(`\n=== OXUNMAYAN TARIX (${badDates.length}) ===`);
  for (const b of badDates) console.log(`  ${b.name}: "${b.rawDate}"`);
}
if (unmatched.length) {
  console.log(`\n=== CSV-de VAR, statda YOX (${unmatched.length}) ===`);
  for (const u of unmatched) console.log(`  ${u.name}  ${u.email || ''}`);
}
if (noContact.length) {
  console.log(`\n=== statda VAR, CSV-de YOX (${noContact.length}) -- elaqe melumati olmayacaq ===`);
  for (const p of noContact) console.log(`  ${p.name}`);
}

if (WRITE) {
  const out = dataPath('staff-contacts.json');
  writeFileSync(out, `${JSON.stringify({ contacts, generatedAt: new Date().toISOString() }, null, 2)}\n`, 'utf8');
  console.log(`\nYazildi: data/staff-contacts.json (${contacts.length})  [repoya DUSMUR]\n`);
} else {
  console.log('\n(--write verilmeyib, fayl yazilmadi)\n');
}
