// K26 — ştat cədvəli + 2025 təşkilati struktur -> `unit` + `person` datası.
//
// İKİ MƏNBƏ, İKİ FƏRQLİ ŞEY:
//   ADDA_struktur2025.pdf — RƏSMİ təşkilati struktur (kim kimə tabedir).
//                           Skan olduğu üçün ağac aşağıda ƏL İLƏ köçürülüb.
//   ştat.txt              — ştat cədvəli (kim hansı vəzifədədir).
//
// Bu ikisi tam üst-üstə DÜŞMÜR. Fərqlər hesabatda "UYGUNSUZLUQ" başlığı
// altında verilir — həll edilmir, çünki hansının doğru olduğunu yalnız
// akademiya bilir. Səssizcə birini seçmək səhv məlumat yaradardı.
//
// İSTİFADƏ: node staff-parse.mjs <stat.txt yolu> [--write]

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DATA, ensure } from './lib/paths.mjs';
import { slugify } from './lib/slug.mjs';

const SRC = process.argv[2];
const WRITE = process.argv.includes('--write');
if (!SRC) {
  console.error('Istifade: node staff-parse.mjs <stat.txt yolu> [--write]');
  process.exit(1);
}

// ── 2025 təşkilati struktur (PDF-dən köçürülüb) ───────────────────────────
// `parent: null` = Rektora birbaşa tabedir. Elmi şura məsləhət orqanıdır,
// icra zəncirində deyil — ona görə ayrıca `advisory` işarəsi var.
const ORG = [
  { name: 'Elmi şura', parent: null, kind: 'advisory' },
  { name: 'Rəhbərlik', parent: null, kind: 'leadership' },
  { name: 'Elmi işlər və beynəlxalq əlaqələr üzrə prorektorluq', parent: null, kind: 'prorektor' },
  { name: 'Tədrisin təşkili və idarəedilməsi üzrə prorektorluq', parent: null, kind: 'prorektor' },

  { name: 'Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsi', parent: 'Elmi işlər və beynəlxalq əlaqələr üzrə prorektorluq', kind: 'sobe' },
  { name: 'İnformasiya resurs mərkəzi', parent: 'Elmi işlər və beynəlxalq əlaqələr üzrə prorektorluq', kind: 'merkez' },
  { name: 'Mətbəə', parent: 'Elmi işlər və beynəlxalq əlaqələr üzrə prorektorluq', kind: 'xidmet' },

  { name: 'Tədris proseslərinin təşkili şöbəsi', parent: 'Tədrisin təşkili və idarəedilməsi üzrə prorektorluq', kind: 'sobe' },
  { name: 'Təsərrüfat işləri şöbəsi', parent: 'Tədrisin təşkili və idarəedilməsi üzrə prorektorluq', kind: 'sobe' },
  { name: 'Gəmi sürücülüyü fakültəsi', parent: 'Tədrisin təşkili və idarəedilməsi üzrə prorektorluq', kind: 'fakulte' },
  { name: 'Gəmi mexanikası və elektromexanikası fakültəsi', parent: 'Tədrisin təşkili və idarəedilməsi üzrə prorektorluq', kind: 'fakulte' },

  { name: 'Dəniz naviqasiyası kafedrası', parent: 'Gəmi sürücülüyü fakültəsi', kind: 'kafedra' },
  { name: 'Gəmiqayırma və gəmi təmiri kafedrası', parent: 'Gəmi sürücülüyü fakültəsi', kind: 'kafedra' },
  { name: 'İngilis dili kafedrası', parent: 'Gəmi sürücülüyü fakültəsi', kind: 'kafedra' },
  { name: 'Humanitar fənlər kafedrası', parent: 'Gəmi sürücülüyü fakültəsi', kind: 'kafedra' },
  { name: 'Tətbiqi mexanika kafedrası', parent: 'Gəmi mexanikası və elektromexanikası fakültəsi', kind: 'kafedra' },
  { name: 'Gəmi energetik qurğuları kafedrası', parent: 'Gəmi mexanikası və elektromexanikası fakültəsi', kind: 'kafedra' },
  { name: 'Gəmi elektroavtomatikası kafedrası', parent: 'Gəmi mexanikası və elektromexanikası fakültəsi', kind: 'kafedra' },

  { name: 'Personalın idarəedilməsi, əmək haqqı və kargüzarlıq şöbəsi', parent: null, kind: 'sobe' },
  { name: 'Mühasibat uçotu və hesabatı şöbəsi', parent: null, kind: 'sobe' },
  { name: 'Təlim Tədris Mərkəzi', parent: null, kind: 'merkez' },
  // 2025 sxemində YOXDUR, ştatda 2 işçi ilə VAR. Zaur: sxem köhnədir, əlavə et.
  // TABELİYİ NAMƏLUMDUR: nə sxemdə, nə ştatda göstərilib. Rektora birbaşa
  // bağladım — ehtimal etmək yerinə bilmədiyimi açıq saxlayıram; dəqiqləşəndə
  // `parent` dəyişdirilməlidir.
  { name: 'Təhsil innovasiyaları və rəqəmsal həllər mərkəzi', parent: null, kind: 'merkez' },
  { name: 'Azərbaycan Dənizçilik Kolleci PHŞ', parent: null, kind: 'tabeli_qurum' },
];

// Ştatdakı qısaldılmış adları rəsmi struktur adlarına bağlayır.
// NİYƏ lazımdır: ştat "Müh. uçotu və hesab. şöb." yazır, struktur isə
// "Mühasibat uçotu və hesabatı şöbəsi" — sətir müqayisəsi bunları tutmaz.
const UNIT_ALIAS_RAW = {
  'Rəhbərlik': 'Rəhbərlik',
  'Tədris proses. təşkili şöbəsi': 'Tədris proseslərinin təşkili şöbəsi',
  'Müh. uçotu və hesab. şöb.': 'Mühasibat uçotu və hesabatı şöbəsi',
  'PİEƏHK şöbəsi': 'Personalın idarəedilməsi, əmək haqqı və kargüzarlıq şöbəsi',
  'Elmi tədq. və bey. əl. şöb.': 'Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsi',
  'Təhs.innov.və rəq.həl mərkəz': 'Təhsil innovasiyaları və rəqəmsal həllər mərkəzi',
  'İnformasiya resurs mərkəzi': 'İnformasiya resurs mərkəzi',
  'Təsərrüfat işləri şöbəsi': 'Təsərrüfat işləri şöbəsi',
  'Mətbəə': 'Mətbəə',
  'Gəmi mex. və elekt.fak.': 'Gəmi mexanikası və elektromexanikası fakültəsi',
  'Gəmi sürücülüyü fakültəsi': 'Gəmi sürücülüyü fakültəsi',
  'Tətbiqi mexanika kafedrası': 'Tətbiqi mexanika kafedrası',
  'İngilis dili kafedrası': 'İngilis dili kafedrası',
  'GEQ kafedrası': 'Gəmi energetik qurğuları kafedrası',
  'GEA kafedrası': 'Gəmi elektroavtomatikası kafedrası',
  'Dəniz naviqasiyası kaf.': 'Dəniz naviqasiyası kafedrası',
  'GQ və GT kafedrası': 'Gəmiqayırma və gəmi təmiri kafedrası',
  'Humanitar fənlər kafedrası': 'Humanitar fənlər kafedrası',
  'Professor-müəllim heyyəti': null, // bölmə deyil, kateqoriyadır
  'Tədris köməkçi-heyət': null,
};

// Ştatda bölmə adları bəzən dırnaq içindədir (`"GEQ" kafedrası`), bəzən yox
// (`GEA kafedrası`), bəzən ikiqat boşluqla. Bunlar EYNİ bölmədir.
// TƏLƏ: Python `csv` dırnağı sitat işarəsi sayıb udur, tab-la bölən parser isə
// saxlayır — iki alət eyni fayla iki fərqli cavab verir. Ona görə burada
// AÇIQ normallaşdırma var, gizli davranışa güvənmirik.
function normUnit(s) {
  return String(s || '').replace(/["\u201C\u201D]/g, '').replace(/\s+/g, ' ').trim();
}

// staffType — `person` sxemindəki enum ilə eyni olmalıdır.
const UNIT_ALIAS = Object.fromEntries(
  Object.entries(UNIT_ALIAS_RAW).map(([k, v]) => [normUnit(k), v]),
);

function classify(unitRaw, position) {
  const u = normUnit(unitRaw);
  if (u === 'Rəhbərlik') return 'rehberlik';
  if (u === 'Professor-müəllim heyyəti') return 'akademik';
  if (u === 'Tədris köməkçi-heyət') return 'telimci_texniki';
  if (/kafedra|kaf\./i.test(u) || /Kafedra müdiri/i.test(position)) return 'akademik';
  return 'inzibati';
}

// ── Parse ─────────────────────────────────────────────────────────────────
const raw = readFileSync(SRC, 'utf8').replace(/\r\n/g, '\n');
const lines = raw.split('\n');

const people = [];
const unitsSeen = new Map(); // ştatdakı xam ad -> say
const vacancies = [];
const blanks = [];
let currentHeading = null;

for (const line of lines) {
  const col = line.split('\t');
  if (col.length < 5) continue;
  const ss = (col[0] || '').trim();
  const unitRaw = (col[2] || '').trim();
  const position = (col[3] || '').trim();
  const name = (col[4] || '').trim();

  // Başlıq sətri: s/s boşdur, bölmə adı var.
  if (!ss && unitRaw) { currentHeading = unitRaw; continue; }
  if (!/^\d+$/.test(ss)) continue;

  // Nömrəsi olan, amma tamamilə boş sətirlər — ştatda "ayrılmış, doldurulmamış"
  // mövqelərdir. Vakansiya ilə eyni deyil: vəzifə adı da yoxdur.
  if (!unitRaw && !position && !name) { blanks.push(ss); continue; }

  unitsSeen.set(unitRaw, (unitsSeen.get(unitRaw) || 0) + 1);

  if (!name) vacancies.push({ ss, unit: unitRaw, position });

  people.push({
    ss: Number(ss),
    unitRaw,
    unit: normUnit(unitRaw) in UNIT_ALIAS ? UNIT_ALIAS[normUnit(unitRaw)] : normUnit(unitRaw),
    heading: currentHeading,
    position,
    name,
    staffType: classify(unitRaw, position),
    slug: name ? slugify(name) : null,
  });
}

// ── Şəxsləri birləşdir: 1 insan = 1 qeyd, N vəzifə ────────────────────────
// 22 nəfər ştatda iki sətirdədir (məs. dekan + professor). Ayrı-ayrı qeyd
// yaratsaq slug toqquşur; birini atsaq həmin adam siyahıların birindən düşür.
// Ona görə `roles` massivi — `person.roles` komponenti ilə birebir uyğundur.
const RANK = { rehberlik: 0, inzibati: 1, akademik: 2, telimci_texniki: 3, diger: 4 };

const merged = new Map();
for (const p of people) {
  if (!p.name) continue;
  if (!merged.has(p.slug)) {
    merged.set(p.slug, { name: p.name, slug: p.slug, roles: [] });
  }
  const rec = merged.get(p.slug);
  // Eyni ad fərqli yazılışla gələ bilər — ən uzun variantı saxla (tam ata adı).
  if (p.name.length > rec.name.length) rec.name = p.name;
  rec.roles.push({ staffType: p.staffType, position: p.position, unitName: p.unit, sortOrder: p.ss });
}
for (const rec of merged.values()) {
  rec.roles.sort((a, b) => (RANK[a.staffType] - RANK[b.staffType]) || (a.sortOrder - b.sortOrder));
  // Əsas tip = ən yüksək rütbəli rol. `staffType` sahəsi geriyə uyğunluq üçün qalır.
  rec.staffType = rec.roles[0].staffType;
  rec.position = rec.roles[0].position;
  rec.unit = rec.roles[0].unitName;
}
const staff = [...merged.values()].sort((a, b) => a.roles[0].sortOrder - b.roles[0].sortOrder);

// Slug toqquşması: fərqli adamlar eyni slug alsa məlumat itər.
const slugOwners = new Map();
for (const p of people) {
  if (!p.slug) continue;
  if (!slugOwners.has(p.slug)) slugOwners.set(p.slug, new Set());
  slugOwners.get(p.slug).add(p.name);
}
const collisions = [...slugOwners.entries()].filter(([, names]) => names.size > 1);

// ── Uyğunsuzluqlar ────────────────────────────────────────────────────────
const orgNames = new Set(ORG.map((u) => u.name));
const statUnits = new Set([...unitsSeen.keys()].map((u) => (normUnit(u) in UNIT_ALIAS ? UNIT_ALIAS[normUnit(u)] : normUnit(u))).filter(Boolean));

const onlyInStat = [...statUnits].filter((u) => !orgNames.has(u));
const onlyInOrg = [...orgNames].filter(
  (u) => !statUnits.has(u) && !['Elmi şura', 'Elmi işlər və beynəlxalq əlaqələr üzrə prorektorluq', 'Tədrisin təşkili və idarəedilməsi üzrə prorektorluq'].includes(u),
);

// Eyni adam birdən çox sətirdə (məs. kafedra müdiri + professor).
const byName = new Map();
for (const p of people) {
  if (!p.name) continue;
  if (!byName.has(p.name)) byName.set(p.name, []);
  byName.get(p.name).push(p);
}
const duplicates = [...byName.entries()].filter(([, v]) => v.length > 1);

// ── Hesabat ───────────────────────────────────────────────────────────────
const byType = people.reduce((a, p) => ((a[p.staffType] = (a[p.staffType] || 0) + 1), a), {});
console.log('\n=== STAT PARSE ===');
console.log(`  setir       : ${people.length}`);
console.log(`  unikal ad   : ${byName.size}`);
console.log(`  vakansiya   : ${vacancies.length}  (vezife var, ad yoxdur)`);
console.log(`  bos sira no : ${blanks.length}  (${blanks.join(', ')})`);
console.log('\n  staffType bolgusu (menyu bendlerine uygun):');
console.log(`    akademik         -> Professor-muellim heyeti : ${byType.akademik || 0}`);
console.log(`    telimci_texniki  -> Telimci-texniki heyet    : ${byType.telimci_texniki || 0}`);
console.log(`    inzibati         -> Inzibati heyet           : ${byType.inzibati || 0}`);
console.log(`    rehberlik        -> Inzibati heyet (ust)     : ${byType.rehberlik || 0}`);

console.log(`\n  birlesdirilmis sexs : ${staff.length}  (${people.filter((p) => p.name).length} setirden)`);
console.log(`  cox vezifeli sexs   : ${staff.filter((s) => s.roles.length > 1).length}`);
console.log(`  slug toqqusmasi     : ${collisions.length}${collisions.length ? '  <-- DIQQET' : ''}`);
for (const [slug, names] of collisions) console.log(`    ${slug}: ${[...names].join(' | ')}`);

console.log(`\n=== UYGUNSUZLUQ: statda VAR, 2025 strukturunda YOX (${onlyInStat.length}) ===`);
for (const u of onlyInStat) console.log(`  ${u}  (${[...unitsSeen].filter(([k]) => (normUnit(k) in UNIT_ALIAS ? UNIT_ALIAS[normUnit(k)] : normUnit(k)) === u).reduce((n, [, c]) => n + c, 0)} isci)`);
console.log(`\n=== UYGUNSUZLUQ: 2025 strukturunda VAR, statda YOX (${onlyInOrg.length}) ===`);
for (const u of onlyInOrg) console.log(`  ${u}`);

console.log(`\n=== VAKANSIYALAR (${vacancies.length}) ===`);
for (const v of vacancies) console.log(`  #${v.ss}  ${v.unit} — ${v.position}`);

console.log(`\n=== EYNI SEXS BIRDEN COX SETIRDE (${duplicates.length}) ===`);
for (const [n, v] of duplicates.slice(0, 12)) {
  console.log(`  ${n}`);
  for (const p of v) console.log(`      #${p.ss} ${p.unitRaw} — ${p.position} [${p.staffType}]`);
}
if (duplicates.length > 12) console.log(`  ... +${duplicates.length - 12}`);

if (WRITE) {
  ensure(join(DATA, 'extracted'));
  const units = ORG.map((u, i) => ({
    name: u.name,
    slug: slugify(u.name),
    parentSlug: u.parent ? slugify(u.parent) : null,
    kind: u.kind,
    sortOrder: (i + 1) * 10,
  }));
  writeFileSync(join(DATA, 'extracted', 'units.json'), `${JSON.stringify(units, null, 2)}\n`, 'utf8');
  // DİQQƏT: staff.json `data/` KÖKÜNƏ yazılır, `data/extracted/`-ə YOX.
  // .gitignore `data/*`-ı bağlayır, `data/extracted/`-i isə açır — yəni buraya
  // yazmaq faylın repoya DÜŞMƏMƏSİ deməkdir. 162 işçinin adı-soyadı git
  // tarixçəsinə birdəfəlik həkk olunmasın; ştat.txt-dən hər an yenidən yığılır.
  writeFileSync(
    join(DATA, 'staff.json'),
    `${JSON.stringify({ staff, vacancies, generatedAt: new Date().toISOString() }, null, 2)}\n`,
    'utf8',
  );
  console.log(`\nYazildi: data/extracted/units.json  (${units.length})`);
  console.log(`Yazildi: data/staff.json  (${staff.length} sexs, ${vacancies.length} vakansiya)  [repoya DUSMUR]`);
} else {
  console.log('\n(--write verilmeyib, fayl yazilmadi)');
}
