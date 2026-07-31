// K26 — menyu label-lərini idxal olunmuş sənədlərə bağlayan UYĞUNLAŞDIRMA ALƏTİ.
//
// NƏ EDİR: `adda-strapi/src/index.ts`-dəki SEED menyusundan 180 label-i çıxarır,
// `data/extracted/*.json`-dakı sənəd başlıqları ilə müqayisə edir və namizəd
// cədvəli çap edir.
//
// NƏ ETMİR: HEÇ NƏ YAZMIR. Nə SEED-i, nə Strapi-ni. Yalnız hesabat + JSON namizəd
// faylı. Yazma K26-nın 2-ci addımıdır və yalnız təsdiqdən sonra olur.
//
// İSTİFADƏ:
//   node menu-map.mjs                 # tam cədvəl
//   node menu-map.mjs --review        # yalnız əl ilə baxış tələb edənlər
//   node menu-map.mjs --none          # yalnız uyğunluq tapılmayanlar
//   node menu-map.mjs --json          # data/menu-candidates.json yaz
//   node menu-map.mjs --top 5         # hər label üçün N namizəd göstər

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, DATA, dataPath } from './lib/paths.mjs';
import { transliterate } from './lib/slug.mjs';
import { PLURAL, targetTypeFor } from './mapping.mjs';

// ── Marşrut seqmentləri (adda-nextjs/app/[locale]/*) ───────────────────────
const SEGMENT = {
  article: 'xeberler',
  announcement: 'elanlar',
  page: 'sehife',
  faculty: 'fakulteler',
  program: 'ixtisaslar',
  department: 'struktur',
};

// Sənəd deyil, mövcud statik marşrutdur. Uyğunlaşdırmadan ƏVVƏL yoxlanır.
// NİYƏ: "Xəbərlər" label-i 808 xəbər başlığından birinə fuzzy uyğun gələ bilər —
// halbuki cavab siyahı səhifəsidir.
const STATIC_ROUTES = {
  xeberler: '/{locale}/xeberler',
  elanlar: '/{locale}/elanlar',
  tedbirler: '/{locale}/tedbirler',
  fakulteler: '/{locale}/fakulteler',
  ixtisaslar: '/{locale}/ixtisaslar',
  struktur: '/{locale}/struktur',
  'teskilati struktur': '/{locale}/struktur',
  tarix: '/{locale}/tarix',
  'akademiyanin tarixi': '/{locale}/tarix',
};

const ARGS = process.argv.slice(2);
const has = (f) => ARGS.includes(f);
const TOP = (() => {
  const i = ARGS.indexOf('--top');
  return i >= 0 ? Math.max(1, parseInt(ARGS[i + 1], 10) || 3) : 3;
})();

// Hədlər — dəyişdirsən hesabat yenidən qurulmalıdır.
const T_AUTO = 0.90; // bundan yuxarı: kəsin sayılır
const T_REVIEW = 0.52; // bundan yuxarı: namizəd var, insan baxsın

// ── Normallaşdırma ────────────────────────────────────────────────────────
// DİQQƏT: transliterate() HƏRF-HƏRF xəritələyir, ondan sonra toLowerCase().
// Əks sıra Azərbaycan `I`/`İ` fərqini korlayır (bax lib/slug.mjs).
function norm(s) {
  return transliterate(String(s || ''))
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04ff]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

const STOP = new Set(['ve', 'ile', 'uzre', 'ucun', 'the', 'of', 'and', 'i', 'v', 'na']);
const tokens = (n) => n.split(' ').filter((t) => t && !STOP.has(t));

function dice(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  if (!A.size || !B.size) return 0;
  let hit = 0;
  for (const t of A) if (B.has(t)) hit++;
  return (2 * hit) / (A.size + B.size);
}

function trigrams(s) {
  const p = `  ${s} `;
  const out = new Set();
  for (let i = 0; i < p.length - 2; i++) out.add(p.slice(i, i + 3));
  return out;
}

function trigramSim(a, b) {
  const A = trigrams(a);
  const B = trigrams(b);
  if (!A.size || !B.size) return 0;
  let hit = 0;
  for (const t of A) if (B.has(t)) hit++;
  return (2 * hit) / (A.size + B.size);
}

function score(labelNorm, titleNorm) {
  if (!labelNorm || !titleNorm) return 0;
  if (labelNorm === titleNorm) return 1;

  const blend = 0.62 * dice(tokens(labelNorm), tokens(titleNorm)) + 0.38 * trigramSim(labelNorm, titleNorm);

  // Saxlanma siqnalı — AMMA tək qısa söz üçün deyil.
  // NİYƏ: "rektor" ⊂ "sabiq rektorlarimiz" saxlanmadır, uyğunluq DEYİL.
  // İlk versiya bunu 0.89 verib KESIN saydı — hədləri yox, düsturu düzəltmək lazımdır.
  let contain = 0;
  if (titleNorm.includes(labelNorm) || labelNorm.includes(titleNorm)) {
    const shortLen = Math.min(labelNorm.length, titleNorm.length);
    const ratio = shortLen / Math.max(labelNorm.length, titleNorm.length);
    const shortStr = labelNorm.length <= titleNorm.length ? labelNorm : titleNorm;
    const strong = tokens(shortStr).length >= 2 || shortLen >= 10;
    contain = strong ? 0.58 + 0.42 * ratio : 0.35 + 0.3 * ratio;
  }

  return Math.max(blend, contain);
}

// ── SEED çıxarışı ─────────────────────────────────────────────────────────
// index.ts-i icra etmirik (Strapi importları var) — obyekt literalını mötərizə
// balansı ilə kəsib təcrid olunmuş şəkildə qiymətləndiririk.
function readSeed() {
  const p = join(ROOT, '..', '..', 'adda-strapi', 'src', 'index.ts');
  const src = readFileSync(p, 'utf8');
  const anchor = src.indexOf('const SEED = {');
  if (anchor < 0) throw new Error(`SEED tapilmadi: ${p}`);
  const start = src.indexOf('{', anchor);
  let depth = 0;
  let end = -1;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  if (end < 0) throw new Error('SEED baglanmadi');
  // eslint-disable-next-line no-new-func
  return { seed: new Function(`return ${src.slice(start, end)}`)(), path: p };
}

// Menyu ağacını düz siyahıya çevirir; hər label üçün oxunaqlı yol saxlayır.
// `hasChildren`: qrupları/kartları olan kateqoriya — bu, açılan menyunun
// valideynidir, `#` onun üçün SƏHV DEYİL (klik dropdown açır).
function flatten(seed) {
  const out = [];
  const walk = (node, trail) => {
    if (Array.isArray(node)) return node.forEach((n) => walk(n, trail));
    if (!node || typeof node !== 'object') return;
    const name = node.label || node.title;
    const next = name ? [...trail, name] : trail;
    if (typeof node.label === 'string' && 'url' in node) {
      const kids = (Array.isArray(node.groups) ? node.groups.length : 0) + (Array.isArray(node.cards) ? node.cards.length : 0);
      out.push({ root: trail[0], path: next.join(' > '), label: node.label, url: node.url, hasChildren: kids > 0 });
    }
    for (const [k, v] of Object.entries(node)) {
      if (k === 'label' || k === 'url' || k === 'title') continue;
      walk(v, next);
    }
  };
  for (const [root, val] of Object.entries(seed)) walk(val, [root]);
  return out;
}

// Sənəd deyil, xarici sistem/e-xidmət. Uyğunlaşdırma cəhdi mənasızdır —
// URL-i Zaur verməlidir (ADDA Lider, LMS, e-kitabxana provayderi və s.).
const EXTERNAL = new Set(
  [
    'Tələbə kabineti', 'Müəllim kabineti', 'Elektron jurnal', 'Dərs cədvəli',
    'E-Kitabxana', 'Sertifikatlar', 'E-Akademiya', 'Onlayn müraciət',
  ].map((s) => norm(s)),
);

// ── Sənəd hovuzu ──────────────────────────────────────────────────────────
// A hovuzu: struktur sənədləri (content + faculty) — menyu bunlara baxır.
// B hovuzu: xəbər/elan — yalnız A boş qalanda, ZƏİF nişanı ilə.
function loadPool() {
  const A = [];
  const B = [];
  for (const file of ['content', 'faculty', 'news', 'announce']) {
    let rows;
    try {
      rows = JSON.parse(readFileSync(dataPath(`extracted/${file}.json`), 'utf8'));
    } catch {
      console.error(`XETA: data/extracted/${file}.json oxunmadi. Once: node extract.mjs`);
      process.exit(1);
    }
    for (const r of rows) {
      if (r.isEmpty) continue;
      if (!r.slug || !r.title) continue;
      const type = targetTypeFor(r.section, r.legacyId);
      const rec = {
        legacyId: r.legacyId,
        section: r.section,
        locale: r.locale,
        title: r.title,
        slug: r.slug,
        type,
        plural: PLURAL[type],
        titleNorm: norm(r.title),
        url: `/{locale}/${SEGMENT[type]}/${r.slug}`,
      };
      (file === 'content' || file === 'faculty' ? A : B).push(rec);
    }
  }
  return { A, B };
}

// Eyni slug az/ru/en-də təkrarlanır (K2 qərarı: slug dillərdə eynidir).
// Namizəd siyahısında bir dəfə görünsün, amma hansı dillərdə var — bilinsin.
function dedupe(pool) {
  const by = new Map();
  for (const r of pool) {
    const key = `${r.type}:${r.slug}`;
    if (!by.has(key)) by.set(key, { ...r, locales: new Set([r.locale]) });
    else {
      const e = by.get(key);
      e.locales.add(r.locale);
      // az başlığı üstündür — menyu azərbaycancadır.
      if (r.locale === 'az' && e.locale !== 'az') {
        e.title = r.title;
        e.titleNorm = r.titleNorm;
        e.locale = 'az';
      }
    }
  }
  return [...by.values()].map((r) => ({ ...r, locales: [...r.locales].sort() }));
}

function best(labelNorm, pool, n) {
  return pool
    .map((r) => ({ ...r, score: score(labelNorm, r.titleNorm) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

// ── İcra ──────────────────────────────────────────────────────────────────
const { seed, path: seedPath } = readSeed();
const items = flatten(seed);
const raw = loadPool();
const poolA = dedupe(raw.A);
const poolB = dedupe(raw.B);

const results = items.map((it) => {
  const n = norm(it.label);
  const staticHit = STATIC_ROUTES[n];
  if (staticHit) {
    return { ...it, status: 'STATIK', proposed: staticHit, candidates: [], norm: n };
  }
  if (EXTERNAL.has(n)) {
    return { ...it, status: 'XARICI', proposed: null, candidates: [], norm: n };
  }
  if (it.hasChildren) {
    return { ...it, status: 'ACILAN', proposed: '#', candidates: [], norm: n };
  }
  let cands = best(n, poolA, TOP);
  let weak = false;
  if (!cands.length || cands[0].score < T_REVIEW) {
    const b = best(n, poolB, TOP);
    if (b.length && b[0].score > (cands[0]?.score ?? 0)) {
      cands = b;
      weak = true;
    }
  }
  const top = cands[0];
  const s = top?.score ?? 0;
  // ZƏİF hovuz (xəbər/elan) heç vaxt KESIN olmur: menyunun arxiv xəbərinə
  // bağlanması məzmun qərarıdır, sətir oxşarlığı qərarı deyil.
  const status = s >= T_AUTO && !weak ? 'KESIN' : s >= T_REVIEW ? 'BAXIS' : 'YOX';
  return {
    ...it,
    norm: n,
    status,
    weak,
    proposed: status === 'YOX' ? null : top.url,
    candidates: cands.map((c) => ({
      title: c.title,
      slug: c.slug,
      type: c.type,
      legacyId: c.legacyId,
      locales: c.locales,
      url: c.url,
      score: +c.score.toFixed(3),
    })),
  };
});

// ── Hesabat ───────────────────────────────────────────────────────────────
const tally = results.reduce((a, r) => ((a[r.status] = (a[r.status] || 0) + 1), a), {});
const pad = (s, n) => (String(s).length > n ? `${String(s).slice(0, n - 1)}~` : String(s).padEnd(n));

console.log(`\nSEED: ${seedPath}`);
console.log(`Menyu label: ${results.length}   Namized hovuzu: A=${poolA.length} struktur, B=${poolB.length} xeber/elan`);
console.log(`Hedler: KESIN >= ${T_AUTO} | BAXIS >= ${T_REVIEW}`);
const order = ['KESIN', 'BAXIS', 'STATIK', 'ACILAN', 'XARICI', 'YOX'];
console.log(`Netice: ${order.map((k) => `${k} ${tally[k] || 0}`).join(' | ')}\n`);

let show = results;
if (has('--review')) show = results.filter((r) => r.status === 'BAXIS');
if (has('--none')) show = results.filter((r) => r.status === 'YOX');
if (has('--auto')) show = results.filter((r) => r.status === 'KESIN');

let group = null;
for (const r of show) {
  if (r.root !== group) {
    group = r.root;
    console.log(`\n=== ${group} ===`);
  }
  const flag = r.weak ? ' [ZEIF: xeber/elan hovuzu]' : '';
  console.log(`${pad(r.status, 7)} ${pad(r.label, 42)} ${r.proposed || '-'}${flag}`);
  if (r.status !== 'STATIK' && r.candidates.length) {
    for (const c of r.candidates) {
      const mark = c.url === r.proposed ? '*' : ' ';
      console.log(`      ${mark} ${c.score.toFixed(3)}  ${pad(c.type, 12)} ${pad(c.title, 52)} ${c.locales.join('/')}`);
    }
  }
}

// ── Yetim sənədlər ────────────────────────────────────────────────────────
// K26-nın ikinci yarısı: menyu 180 label istəyir, arxivdə isə 56 struktur
// sənədi var. Əks sual da vacibdir — HANSI sənəd heç bir label tərəfindən
// çağırılmır? O sənədlər saytda mövcuddur, amma naviqasiyadan görünməz qalır.
const claimed = new Set(results.filter((r) => r.proposed).map((r) => r.proposed));
const orphans = poolA.filter((r) => !claimed.has(r.url));
if (has('--orphans') || !has('--review')) {
  console.log(`\n\n=== YETIM SENEDLER (menyuda istinadi yoxdur): ${orphans.length} / ${poolA.length} ===`);
  for (const o of orphans) {
    console.log(`  ${pad(o.type, 12)} ${pad(o.title, 56)} ${pad(o.locales.join('/'), 9)} ${o.url}`);
  }
}

if (has('--json')) {
  const out = join(DATA, 'menu-candidates.json');
  writeFileSync(out, `${JSON.stringify({ generatedAt: new Date().toISOString(), thresholds: { T_AUTO, T_REVIEW }, results }, null, 2)}\n`, 'utf8');
  console.log(`\nYazildi: ${out}`);
}

console.log('\nQEYD: bu alet HEC NE yazmir. Tesdiqden sonra SEED-e insert ayrica addimdir.\n');
