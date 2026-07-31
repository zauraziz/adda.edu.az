// K26 — TƏSDİQLƏNMİŞ qərarları SEED menyusuna tətbiq edən generator.
//
// Qərarlar (Zaur, 31.07.2026):
//   1. KESIN (19) + real BAXIS (8) + STATIK (7)  -> tətbiq olunur
//   2. ZƏİF BAXIS (18, xəbər/elan hovuzu)        -> RƏDD, /hazirlanir-a gedir
//   3. YOX (105)                                 -> /hazirlanir/{slug}
//   4. Yetim sənədlər (38)                       -> menyuya əlavə olunur
//
// URL KONVENSİYASI — DİL PREFİKSİ YOXDUR.
// NİYƏ: menyu Strapi-də yalnız `az` lokalında saxlanılır, label-lər isə render
// vaxtı `tr()` ilə tərcümə olunur. Deməli URL də render vaxtı prefikslənməlidir
// (`menuHref(url, locale)`), yoxsa rus istifadəçi `/az/...` linkini görər.
// Bu, keçid sənədindəki "menyu 3 dildə ayrıca lokalizasiya tələb edir"
// fərziyyəsini əvəz edir — həmin fərziyyə label-lərin necə işlədiyini nəzərə almırdı.
//
// İSTİFADƏ: node menu-plan.mjs [--write]
//   --write olmadan yalnız hesabat verir.

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, DATA } from './lib/paths.mjs';
import { slugify } from './lib/slug.mjs';

const SEED_FILE = join(ROOT, '..', '..', 'adda-strapi', 'src', 'index.ts');
const WRITE = process.argv.includes('--write');

// ── 1. Alqoritmin tapdığı uyğunluqlar ─────────────────────────────────────
// menu-map.mjs --json çıxışından götürülür. Yalnız KESIN/BAXIS(güclü)/STATIK.
const cands = JSON.parse(readFileSync(join(DATA, 'menu-candidates.json'), 'utf8'));
const AUTO = new Map();
for (const r of cands.results) {
  if (r.status === 'STATIK') AUTO.set(r.path, r.proposed.replace('/{locale}', ''));
  else if ((r.status === 'KESIN' || r.status === 'BAXIS') && !r.weak && r.proposed) {
    AUTO.set(r.path, r.proposed.replace('/{locale}', ''));
  }
}

// ── 2. ƏL İLƏ SEMANTİK CÜTLƏR ─────────────────────────────────────────────
// Alqoritm sətir oxşarlığına baxır; bunlar məna uyğunluğudur, ona görə əl işidir.
// Sol tərəf menyu label-idir, sağ tərəf arxivdəki sənəd.
const MANUAL = {
  'Akademiya haqqında': '/sehife/adda-dunen-ve-bugun',
  'ADDA Qəhrəmanları': '/sehife/qehremanlarimiz',
  'Tədqiqat mərkəzləri və laboratoriyalar': '/sehife/elmi-tedqiqat-laboratoriyalari',
  'Gənc alimlərin platforması': '/sehife/genc-alimler-surasi',
  'Tələbə yataqxanası': '/sehife/yataqxana',
  'Kollec': '/struktur/azerbaycan-denizcilik-kolleci',
  'Beynəlxalq tələbələr': '/sehife/ecnebi-telebelerin-tehsili',
  'Haqqımızda': '/sehife/adda-dunen-ve-bugun',
  'Bakalavr qəbulu': '/sehife/bakalavriat',
  'Elm və innovasiya': '/sehife/elmi-tedqiqat-fealiyyeti',
  'Dayanıqlı inkişaf': '/sehife/iqlim-ile-elaqeli-korporativ-idareetme',
  'Normativ-hüquqi sənədlər': '/sehife/h-x-esedovun-azerbaycan-dovlet-deniz-akademiyasinin-rektoru-teyin-edilmesi-haqqi',
  'Təcrübə proqramları': '/sehife/tecrube-haqqinda',
  // E-Kitabxana XARİCİ sayılmışdı, amma arxivdə real səhifə var.
  'E-Kitabxana': '/sehife/elektron-kitabxana',
};

// ── 3. YETİM SƏNƏDLƏRİN MENYUYA YERLƏŞDİRİLMƏSİ ───────────────────────────
// Format: 'kök > kateqoriya > qrup': [ {label, url}, ... ]
// Qrup mövcud deyilsə yaradılır (yeni qrup sonuna əlavə olunur).
const ADD = {
  'esasMenyu > Akademiya > Rəhbərlik və idarəetmə': [
    { label: 'Ümumi işlər üzrə prorektor', url: '/sehife/umumi-isler-uzre-prorektor' },
    { label: 'Rektor köməkçisi', url: '/sehife/rektor-komekcisi' },
    { label: 'Elmi katib', url: '/sehife/elmi-katib' },
  ],
  // YENİ QRUP: 8 şöbə `/struktur` siyahısından əlçatandır, amma menyudan görünmür.
  'esasMenyu > Akademiya > Şöbələr və xidmətlər': [
    { label: 'Tədris proseslərinin təşkili şöbəsi', url: '/struktur/tedris-proseslerinin-teskili-sobesi' },
    { label: 'Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsi', url: '/struktur/elmi-tedqiqat-ve-beynelxalq-elaqeler-sobesi' },
    { label: 'Mühasibat uçotu və hesabat şöbəsi', url: '/struktur/muhasibat-ucotu-ve-hesabat-sobesi' },
    { label: 'Personalın idarə edilməsi şöbəsi', url: '/struktur/personalin-idare-edilmesi-emek-haqqi-sobesi-ve-karguzarliq-sobesi' },
    { label: 'Təsərrüfat işləri şöbəsi', url: '/struktur/teserrufat-isleri-sobesi' },
    { label: 'Hüquq məsləhətçisi', url: '/struktur/huquq-meslehetcisi' },
    { label: 'İnformasiya Resurs Mərkəzi', url: '/struktur/informasiya-resurs-merkezi' },
    { label: 'Mətbəə', url: '/struktur/metbee' },
  ],
  'esasMenyu > Akademiya > Təminat': [
    { label: 'Muzey', url: '/sehife/muzey' },
  ],
  'esasMenyu > Akademiya > Kommunikasiya': [
    { label: 'Korporativ üslub', url: '/sehife/korporativ-uslub' },
  ],
  // YENİ QRUP: 2 fakültə menyuda heç yerdə yox idi.
  'esasMenyu > Təhsil > Fakültələr': [
    { label: 'Gəmi sürücülüyü fakültəsi', url: '/fakulteler/gemi-suruculuyu-fakultesi' },
    { label: 'Gəmi mexanikası və elektromexanikası fakültəsi', url: '/fakulteler/gemi-mexanikasi-ve-elektromexanikasi-fakultesi' },
  ],
  // 4 ixtisas yalnız footer-dəki `/ixtisaslar` siyahısından əlçatan idi.
  'esasMenyu > Təhsil > Proqramların kataloqu': [
    { label: 'Dəniz naviqasiyası mühəndisliyi', url: '/ixtisaslar/deniz-naviqasiyasi-muhendisliyi' },
    { label: 'Gəmi energetik qurğularının istismarı mühəndisliyi', url: '/ixtisaslar/gemi-energetik-qurgularinin-istismari-muhendisliyi' },
    { label: 'Gəmiqayırma və gəmi təmiri mühəndisliyi', url: '/ixtisaslar/gemiqayirma-ve-gemi-temiri-muhendisliyi' },
    { label: 'Elektrik və elektronika mühəndisliyi', url: '/ixtisaslar/elektrik-ve-elektronika-muhendisliyi-su-neqliyyati-uzre' },
  ],
  'esasMenyu > Elm və innovasiya > Elmi-tədqiqat mərkəzləri və laboratoriyalar': [
    { label: 'Elmi-tədqiqat qrupu', url: '/sehife/elmi-tedqiqat-qrupu' },
  ],
  'esasMenyu > Elm və innovasiya > Elmi nəşrlər və kitabxana': [
    { label: 'Elmi jurnalımız onlayn versiyada', url: '/sehife/elmi-jurnalimiz-onlayn-versiyada' },
  ],
  'esasMenyu > Beynəlxalq əlaqələr > Akademik tərəfdaşlıq və ikili diplom': [
    { label: 'Beynəlxalq əlaqələr qrupu', url: '/sehife/beynelxalq-elaqeler-qrupu' },
  ],
  'esasMenyu > Qəbul > Faydalı məlumatlar və keçidlər': [
    { label: 'Faydalı linklər', url: '/sehife/faydali-linkler' },
  ],
};

// BAĞLANMAYAN YETİMLƏR — səbəbi ilə. Bunlar menyuya QOŞULMUR.
const SKIPPED = [
  ['/struktur/irm', 'content/2 ilə eyni qurum (İRM dublikatı) — cleanup lazımdır'],
  ['/struktur/mezhdunarodnyi-obrazovatelnyi-tsentr', 'yalnız ru — az menyuda rus mətni göstərərdi'],
  ['/sehife/tedrisin-teskili-ve-idareedilmesi-uzre-prorektor', 'az versiyası isEmpty (content/22), yalnız en dolu'],
  ['/sehife/elmi-isler-ve-beynelxalq-elaqeler-uzre-prorektor', 'az versiyası isEmpty (content/25), yalnız en dolu'],
  ['/sehife/heyder-eliyevin-anadan-olmasinin-100-illiyine-hesr-olunmus-v-avrasiya-konfransi', 'birdəfəlik tədbir səhifəsi — menyu yeri deyil'],
];

// ── 4. SEED oxunur ────────────────────────────────────────────────────────
const src = readFileSync(SEED_FILE, 'utf8');
const anchor = src.indexOf('const SEED = {');
if (anchor < 0) throw new Error('SEED tapilmadi');
const start = src.indexOf('{', anchor);
let depth = 0;
let end = -1;
for (let i = start; i < src.length; i++) {
  if (src[i] === '{') depth++;
  else if (src[i] === '}') {
    depth--;
    if (depth === 0) { end = i + 1; break; }
  }
}
// eslint-disable-next-line no-new-func
const seed = new Function(`return ${src.slice(start, end)}`)();

// ── 5. Tətbiq ─────────────────────────────────────────────────────────────
const stat = { auto: 0, manual: 0, hazirlanir: 0, acilan: 0, xarici: 0, added: 0 };
const placeholders = new Map(); // slug -> label

// Xarici e-xidmətlər: URL hələ məlum deyil, `#` qalır (hazirlanir SƏHVDİR —
// bunlar məzmun səhifəsi deyil, başqa sistemə keçiddir).
const EXTERNAL = new Set([
  'Tələbə kabineti', 'Müəllim kabineti', 'Elektron jurnal', 'Dərs cədvəli',
  'Sertifikatlar', 'E-Akademiya', 'Onlayn müraciət', 'LMS Portalı',
]);

function resolve(path, label, hasChildren) {
  if (hasChildren) { stat.acilan++; return '#'; }
  if (MANUAL[label]) { stat.manual++; return MANUAL[label]; }
  if (AUTO.has(path)) { stat.auto++; return AUTO.get(path); }
  if (EXTERNAL.has(label)) { stat.xarici++; return '#'; }
  const slug = slugify(label);
  placeholders.set(slug, label);
  stat.hazirlanir++;
  return `/hazirlanir/${slug}`;
}

function walk(node, trail) {
  if (Array.isArray(node)) { node.forEach((n) => walk(n, trail)); return; }
  if (!node || typeof node !== 'object') return;
  const name = node.label || node.title;
  const next = name ? [...trail, name] : trail;
  if (typeof node.label === 'string' && 'url' in node) {
    const kids = (Array.isArray(node.groups) ? node.groups.length : 0) + (Array.isArray(node.cards) ? node.cards.length : 0);
    node.url = resolve(next.join(' > '), node.label, kids > 0);
  }
  for (const [k, v] of Object.entries(node)) {
    if (k === 'label' || k === 'url' || k === 'title') continue;
    walk(v, next);
  }
}
for (const [root, val] of Object.entries(seed)) walk(val, [root]);

// Yetim sənədləri əlavə et
for (const [path, links] of Object.entries(ADD)) {
  const [root, catLabel, groupTitle] = path.split(' > ');
  const cat = (seed[root] || []).find((c) => c.label === catLabel);
  if (!cat) { console.error(`XETA: kateqoriya tapilmadi -> ${path}`); process.exit(1); }
  cat.groups = cat.groups || [];
  let group = cat.groups.find((g) => g.title === groupTitle);
  if (!group) { group = { title: groupTitle, links: [] }; cat.groups.push(group); }
  for (const l of links) {
    if (group.links.some((x) => x.url === l.url)) continue;
    group.links.push(l);
    stat.added++;
  }
}

// ── 6. Hesabat ────────────────────────────────────────────────────────────
console.log('\n=== K26 MENYU PLANI ===');
console.log(`  alqoritm uygunlugu : ${stat.auto}`);
console.log(`  el ile semantik    : ${stat.manual}`);
console.log(`  /hazirlanir        : ${stat.hazirlanir}  (${placeholders.size} unikal sehife)`);
console.log(`  acilan valideyn #  : ${stat.acilan}`);
console.log(`  xarici e-xidmet #  : ${stat.xarici}  <-- URL Zaurdan gozlenilir`);
console.log(`  yetim -> menyuya   : ${stat.added}`);
console.log(`\n  BAGLANMAYAN YETIMLER (${SKIPPED.length}):`);
for (const [u, why] of SKIPPED) console.log(`    ${u}\n      -> ${why}`);

if (WRITE) {
  const literal = JSON.stringify(seed, null, 2)
    .split('\n')
    .map((l, i) => (i === 0 ? l : `  ${l}`))
    .join('\n');
  writeFileSync(join(DATA, 'menu-seed.new.txt'), `${literal}\n`, 'utf8');
  writeFileSync(
    join(DATA, 'menu-placeholders.json'),
    `${JSON.stringify(Object.fromEntries([...placeholders].sort()), null, 2)}\n`,
    'utf8',
  );
  console.log(`\nYazildi: data/menu-seed.new.txt (${literal.length} bayt)`);
  console.log(`Yazildi: data/menu-placeholders.json (${placeholders.size} slug)`);
} else {
  console.log('\n(--write verilmeyib, fayl yazilmadi)');
}
