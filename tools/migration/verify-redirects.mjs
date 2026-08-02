// K26-14 — yönləndirmə xəritəsinin PROD-a qarşı yoxlanması.
//
// NİYƏ AYRICA ALƏT: `gen-redirects.mjs` xəritəni LOKAL çıxarış datasına görə
// qurur. Amma yönləndirmənin hədəfi Strapi-də HƏQİQƏTƏN varmı — bunu yalnız
// prod API-si deyə bilər.
//
// RİSK: hədəf yoxdursa nəticə 301 → 404 zənciri olur. Bu, birbaşa 404-dən
// PİSDİR — Google zənciri izləyir, tarama büdcəsi yanır, köhnə URL indeksdə
// "sınıq" kimi qalır. Ona görə DEPLOY-DAN ƏVVƏL işlədilməlidir.
//
// İSTİFADƏ:
//   node verify-redirects.mjs              # xeriteni prod ile tutusdur
//   node verify-redirects.mjs --live       # elave: 20 tesadufi URL-i real cek
//   node verify-redirects.mjs --site https://demo.adda.edu.az

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './lib/paths.mjs';
import { STRAPI_URL } from './lib/strapi.mjs';

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const argOf = (f, d) => {
  const i = args.indexOf(f);
  return i >= 0 && args[i + 1] ? args[i + 1] : d;
};
const SITE = argOf('--site', 'https://demo.adda.edu.az').replace(/\/+$/, '');

// Yönləndirmə hədəfindəki seqment -> Strapi kolleksiyası.
const SEGMENT_TO_PLURAL = {
  xeberler: 'articles',
  elanlar: 'announcements',
  sehife: 'pages',
  fakulteler: 'faculties',
  ixtisaslar: 'programs',
  struktur: 'departments',
};

// ── Xəritəni oxu ──────────────────────────────────────────────────────────
const mapFile = join(ROOT, '..', '..', 'adda-nextjs', 'lib', 'legacy-redirects.ts');
if (!existsSync(mapFile)) {
  console.error(`\n  XETA: ${mapFile} tapilmadi.\n  Once: node gen-redirects.mjs\n`);
  process.exit(1);
}
const ts = readFileSync(mapFile, 'utf8');
const map = {};
for (const m of ts.matchAll(/^\s*'([^']+)': '([^']+)',$/gm)) map[m[1]] = m[2];

const total = Object.keys(map).length;
if (!total) {
  console.error('\n  XETA: xerite BOSDUR. Once: node gen-redirects.mjs\n');
  process.exit(1);
}

console.log(`\n  Xerite : ${total} yazi`);
console.log(`  Strapi : ${STRAPI_URL}`);
console.log(`  Sayt   : ${SITE}\n`);

// ── Prod-dakı slug-ları yığ ───────────────────────────────────────────────
// Sənəd-sənəd yoxlamaq 1209 sorğu deməkdir. Əvəzinə hər kolleksiyanın bütün
// slug-larını səhifələyib yığırıq — ~15 sorğu.
async function allSlugs(plural) {
  const out = new Set();
  let page = 1;
  for (;;) {
    const url =
      `${STRAPI_URL}/api/${plural}?locale=az&fields[0]=slug` +
      `&pagination[page]=${page}&pagination[pageSize]=100`;
    let res;
    try {
      res = await fetch(url);
    } catch (err) {
      return { error: `${plural}: ${err.message}` };
    }
    if (!res.ok) return { error: `${plural}: HTTP ${res.status}` };
    const json = await res.json();
    for (const d of json.data ?? []) if (d.slug) out.add(d.slug);
    const pg = json.meta?.pagination;
    if (!pg || page >= pg.pageCount) break;
    page++;
  }
  return { slugs: out };
}

const needed = new Set(Object.values(map).map((v) => v.split('/')[0]));
const live = new Map();
const apiErrors = [];

for (const seg of needed) {
  const plural = SEGMENT_TO_PLURAL[seg];
  if (!plural) { apiErrors.push(`"${seg}" seqmenti taninmir`); continue; }
  const r = await allSlugs(plural);
  if (r.error) { apiErrors.push(r.error); continue; }
  live.set(seg, r.slugs);
  console.log(`  ${seg.padEnd(12)} ${String(r.slugs.size).padStart(5)} slug`);
}

if (apiErrors.length) {
  console.log('\n  API XETALARI:');
  for (const e of apiErrors) console.log(`    ${e}`);
  console.log('\n  403 = hemin kolleksiya ucun public "find" icazesi verilmeyib');
  console.log('        (Strapi admin -> Settings -> Roles -> Public).');
}

// ── Tutuşdur ──────────────────────────────────────────────────────────────
const missing = [];
const unchecked = [];
for (const [key, target] of Object.entries(map)) {
  const [seg, slug] = [target.split('/')[0], target.split('/').slice(1).join('/')];
  const set = live.get(seg);
  if (!set) { unchecked.push([key, target]); continue; }
  if (!set.has(slug)) missing.push([key, target]);
}

const checked = total - unchecked.length;
console.log(`\n=== NETICE ===`);
console.log(`  yoxlanildi : ${checked} / ${total}`);
console.log(`  hedef VAR  : ${checked - missing.length}`);
console.log(`  hedef YOX  : ${missing.length}${missing.length ? '  <-- 301 -> 404 zenciri' : ''}`);
if (unchecked.length) console.log(`  yoxlanmadi : ${unchecked.length} (API xetasi)`);

if (missing.length) {
  console.log('\n  ITKIN HEDEFLER (ilk 25):');
  for (const [k, t] of missing.slice(0, 25)) console.log(`    /az/${k}  ->  /az/${t}`);
  if (missing.length > 25) console.log(`    ... +${missing.length - 25}`);
  console.log('\n  SEBEB: kontent idxali prod-a qarsi islememis ola biler.');
  console.log('  Yoxla : node import.mjs --plan');
}

// ── Canlı yoxlama ─────────────────────────────────────────────────────────
// Xəritə düzgün olsa da middleware səhv qura bilər. 20 təsadüfi URL-i real
// çəkirik: 301 gəlirmi, Location düzgündürmü, hədəf 200 verirmi.
if (has('--live')) {
  const keys = Object.keys(map);
  const sample = [];
  for (let i = 0; i < 20 && keys.length; i++) {
    sample.push(keys[Math.floor(Math.random() * keys.length)]);
  }
  console.log(`\n=== CANLI YOXLAMA (${sample.length} URL) ===`);
  let good = 0;
  for (const key of sample) {
    const from = `${SITE}/az/${key}`;
    try {
      const r1 = await fetch(from, { redirect: 'manual' });
      const loc = r1.headers.get('location') || '';
      const want = `/az/${map[key]}`;
      const okRedirect = r1.status === 301 && loc.includes(want);
      let finalStatus = '—';
      if (okRedirect) {
        const r2 = await fetch(new URL(loc, SITE).href, { redirect: 'follow' });
        finalStatus = r2.status;
      }
      const pass = okRedirect && finalStatus === 200;
      if (pass) good++;
      console.log(
        `  ${pass ? 'OK ' : 'XETA'}  /az/${key.padEnd(16)} ${r1.status} -> ${finalStatus}` +
          (pass ? '' : `   gozlenilen: ${want}, geldi: ${loc || 'yonlendirme yoxdur'}`),
      );
    } catch (err) {
      console.log(`  XETA  /az/${key}  ${err.message}`);
    }
  }
  console.log(`\n  ugurlu: ${good} / ${sample.length}`);
}

console.log('');
const bad = missing.length || apiErrors.length;
if (bad) {
  console.log('  DEPLOY ETME: itkin hedef ve ya API xetasi var.\n');
}
process.exit(bad ? 1 : 0);
