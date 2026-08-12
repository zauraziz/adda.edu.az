// tools/plan-unit-heads.mjs — bolme rehberlerini TEKLIF edir (yazmir).
//
// F3.1 gosterdi ki:
//   - 28/28 bolmede head bosdur
//   - roles[].unitName-de 22 nefer «» dirnaqlarina gore itir
//   - 66 neferde person.unit relasiyasi var (etibarli menbe)
//
// Bu skript UC sey edir:
//   1. unitName-leri normalizasiya edib (dirnaq/boyuk-kicik herf) yeniden uygunlasdirir
//   2. her bolmedeki adamlarin VEZIFELERINE baxib rehber TEKLIF edir
//   3. seed-e yapisdirmaq ucun hazir cedvel cixarir
//
// HEC NE YAZMIR. Cixisi nezerden kecirin, sonra F3.3 seed-i ile tetbiq olunur.
//
//   node tools/plan-unit-heads.mjs

const BASE =
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  'https://adda-edu-az.onrender.com';

const LOCALE = process.env.CHECK_LOCALE || 'az';
const PAGE = 100; // maxLimit = 100

// --- Azerbaycan dili ucun kicik herf -------------------------------------
// toLowerCase() tek basina I-ni 'i'-ye cevirir (dogrusu 'ı'), İ-ni ise
// 'i̇' (iki kod noqtesi) edir. Ona gore evvelce elle evez edilir.
const azLower = (s) =>
  String(s ?? '').replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();

/** Ad muqayisesi ucun: dirnaqlar atilir, bosluqlar yigilir. */
const normName = (s) =>
  azLower(s)
    .replace(/[«»""''"']/g, '')
    .replace(/\s+/g, ' ')
    .trim();

async function api(path, params) {
  const url = new URL('/api' + path, BASE);
  url.searchParams.set('locale', LOCALE);
  for (const [k, v] of Object.entries(params || {})) url.searchParams.set(k, String(v));
  for (let a = 1; a <= 3; a++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(70000) });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.json();
    } catch (e) {
      if (a === 3) throw new Error(url.pathname + ': ' + e.message);
      await new Promise((s) => setTimeout(s, 5000));
    }
  }
}

async function all(path, params) {
  const out = [];
  for (let page = 1; page <= 20; page++) {
    const j = await api(path, { ...params, 'pagination[page]': page, 'pagination[pageSize]': PAGE });
    out.push(...(j?.data ?? []));
    if (page >= (j?.meta?.pagination?.pageCount ?? 1)) break;
  }
  return out;
}

// --- vezife nimuneleri ----------------------------------------------------
// SIRA VACIBDIR. «Prorektor» icinde «rektor», «Dekan muavini» icinde «dekan»
// var - ilk uygunlasan qazanir, ona gore en xususi nimune yuxarida durur.
// rank: kicik reqem = daha guclu namized.
const HEAD_PATTERNS = [
  { rank: 1, re: /^prorektor|prorektor$/, label: 'prorektor' },
  { rank: 1, re: /^rektorun müşaviri|^müşavir/, label: 'musavir' },
  { rank: 1, re: /^rektorun köməkçisi|^köməkçi/, label: 'komekci' },
  { rank: 1, re: /^elmi katib/, label: 'elmi katib' },
  { rank: 1, re: /^referent/, label: 'referent' },
  { rank: 1, re: /^rektor$|^rektor\s|^i\.?\s?e\.? rektor|rektor əvəzi/, label: 'rektor' },
  { rank: 2, re: /^dekan$|^dekan\s(?!müavini)/, label: 'dekan' },
  { rank: 2, re: /kafedra müdiri|^müdir$|^müdir\s(?!müavini)/, label: 'mudir' },
  { rank: 2, re: /şöbə müdiri|şöbə rəisi|^rəis$|^rəis\s(?!müavini)/, label: 'sobe rehberi' },
  { rank: 2, re: /^direktor$|^direktor\s(?!müavini)/, label: 'direktor' },
  { rank: 2, re: /mərkəz(in|inin)? müdiri/, label: 'merkez mudiri' },
  { rank: 3, re: /^baş mühasib/, label: 'bas muhasib' },
  { rank: 3, re: /^hüquq məsləhətçisi/, label: 'huquq meslehetcisi' },
  // Ehtiyat: yuxaridaki xususi nimuneler tutmasa da «...müdiri» / «...rəisi»
  // ile biten her vezife rehberdir. «müavin» artiq NOT_HEAD-de kesilir.
  { rank: 4, re: /müdiri?$/, label: 'mudir (umumi)' },
  { rank: 4, re: /rəisi?$/, label: 'reis (umumi)' },
];

// Bunlar rehber DEYIL - namizedlikden cixarilir.
const NOT_HEAD = /müavin/;

function classify(position) {
  const p = azLower(position);
  if (!p) return null;
  if (NOT_HEAD.test(p)) return null;
  for (const h of HEAD_PATTERNS) if (h.re.test(p)) return h;
  return null;
}

const line = (n = 66) => console.log('-'.repeat(n));

console.log('Strapi : ' + BASE + '   dil: ' + LOCALE);
line();

const units = await all('/units', {
  'populate[parent][fields][0]': 'slug',
  'fields[0]': 'name',
  'fields[1]': 'slug',
  'fields[2]': 'sortOrder',
  sort: 'sortOrder:asc',
});

const people = await all('/people', {
  'populate[unit][fields][0]': 'slug',
  'populate[roles]': true,
  'fields[0]': 'name',
  'fields[1]': 'displayName',
  'fields[2]': 'slug',
  'fields[3]': 'position',
  'fields[4]': 'staffType',
  sort: 'name:asc',
});

const bySlug = new Map(units.map((u) => [u.slug, u]));
const normIndex = new Map(units.map((u) => [normName(u.name), u.slug]));

// --- 1. normalizasiya ne qazandirir? -------------------------------------
console.log('1. unitName NORMALIZASIYASI');
let gainedLinks = 0;
const stillOrphan = new Map();
for (const p of people) {
  for (const r of p.roles ?? []) {
    const raw = (r.unitName ?? '').trim();
    if (!raw) continue;
    const exact = units.some((u) => u.name === raw);
    if (exact) continue;
    if (normIndex.has(normName(raw))) gainedLinks++;
    else stillOrphan.set(raw, (stillOrphan.get(raw) ?? 0) + 1);
  }
}
console.log('   normalizasiya ile xilas olan baglanti : ' + gainedLinks);
if (stillOrphan.size) {
  console.log('   hele de uygun gelmeyen (' + stillOrphan.size + '):');
  for (const [n, c] of [...stillOrphan].sort((a, b) => b[1] - a[1]))
    console.log('     ' + String(c).padStart(3) + ' nefer  «' + n + '»');
} else {
  console.log('   uygunsuz deyer qalmadi.');
}
line();

// --- 2. bolme uzre adamlar + rehber teklifi ------------------------------
/** Bir sexsin verilen bolmedeki vezifesi. roles[] ustundur, yoxsa position. */
function positionIn(p, unit) {
  const r = (p.roles ?? []).find(
    (x) => x.unitName && normName(x.unitName) === normName(unit.name),
  );
  return (r?.position || p.position || '').trim();
}

function membersOf(unit) {
  const out = new Map();
  for (const p of people) {
    const byRel = p.unit?.slug === unit.slug;
    const byName = (p.roles ?? []).some(
      (r) => r.unitName && normName(r.unitName) === normName(unit.name),
    );
    if (byRel || byName) out.set(p.slug, p);
  }
  return [...out.values()];
}

console.log('2. BOLME UZRE HEYET VE REHBER TEKLIFI');
const proposal = [];
const noCandidate = [];
const conflicts = [];

for (const u of units) {
  const mem = membersOf(u);
  const scored = mem
    .map((p) => ({ p, pos: positionIn(p, u), hit: classify(positionIn(p, u)) }))
    .filter((x) => x.hit)
    .sort((a, b) => a.hit.rank - b.hit.rank);

  console.log('');
  console.log('   ' + u.name + '   [' + u.slug + ']  — ' + mem.length + ' nefer');

  if (!mem.length) {
    console.log('     (bos)');
    noCandidate.push(u);
    continue;
  }

  for (const p of mem) {
    const pos = positionIn(p, u);
    const hit = classify(pos);
    const mark = hit ? '  <== ' + hit.label : '';
    console.log('     - ' + (p.displayName || p.name) + '  |  ' + (pos || '(vezife yoxdur)') + mark);
  }

  if (!scored.length) {
    console.log('     ! rehber namizedi tapilmadi');
    noCandidate.push(u);
    continue;
  }

  const best = scored[0];
  const tied = scored.filter((s) => s.hit.rank === best.hit.rank);
  if (tied.length > 1) {
    console.log('     ! ' + tied.length + ' beraber namized - ELLE secilmelidir');
    conflicts.push({ unit: u, tied });
  }
  proposal.push({ unitSlug: u.slug, unitName: u.name, personSlug: best.p.slug, personName: best.p.displayName || best.p.name, position: best.pos });
}
line();

// --- 3. «Rəhbərlik» qrupu -------------------------------------------------
console.log('3. «Rəhbərlik» unitName-i olanlar (hec bir bolmeye dusmur)');
const rehberlik = people.filter((p) =>
  (p.roles ?? []).some((r) => normName(r.unitName) === 'rəhbərlik'),
);
if (!rehberlik.length) console.log('   yoxdur');
for (const p of rehberlik) {
  const r = (p.roles ?? []).find((x) => normName(x.unitName) === 'rəhbərlik');
  console.log(
    '   - ' + (p.displayName || p.name).padEnd(34) + ' | ' + (r?.position || p.position || '?') + '   [' + p.slug + ']',
  );
}
console.log('   ^ bunlar Rektor / prorektor / musavir / komekci / elmi katib / referent');
console.log('     bolmelerine ELLE baglanmalidir.');
line();

// --- 4. yapisdirmaga hazir cedvel ----------------------------------------
console.log('4. SEED UCUN CEDVEL  (nezerden kecirin, duzelis edin)');
console.log('');
console.log('const UNIT_HEADS: Record<string, string> = {');
for (const p of proposal.sort((a, b) => a.unitSlug.localeCompare(b.unitSlug))) {
  console.log(
    "  '" + p.unitSlug + "': '" + p.personSlug + "',".padEnd(2) +
    '  // ' + p.personName + ' — ' + p.position,
  );
}
console.log('};');
line();

// --- 5. xulase ------------------------------------------------------------
const noUnit = people.filter((p) => !p.unit);
const byType = new Map();
for (const p of noUnit) byType.set(p.staffType || '?', (byType.get(p.staffType || '?') ?? 0) + 1);

console.log('XULASE');
console.log('  teklif olunan rehber      : ' + proposal.length + ' / ' + units.length);
console.log('  namized tapilmayan bolme  : ' + noCandidate.length);
console.log('  beraber namized (ELLE)    : ' + conflicts.length);
console.log('  normalizasiya qazanci     : ' + gainedLinks + ' baglanti');
console.log('  person.unit hele bos      : ' + noUnit.length + ' / ' + people.length);
for (const [t, c] of [...byType].sort((a, b) => b[1] - a[1]))
  console.log('      ' + String(c).padStart(3) + '  ' + t);
console.log('');
console.log('  Bu skript HEC NE YAZMADI.');
