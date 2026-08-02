// MƏRHƏLƏ 10 — köhnə URL yönləndirmə xəritəsi.
//
// `data/redirects.json` → `adda-nextjs/lib/legacy-redirects.ts`
//
// NİYƏ KOD, JSON YOX: middleware Edge runtime-da işləyir və fayl sistemini
// oxuya bilmir. Xəritə bundle-a daxil olmalıdır.
//
// SIXILMA: `redirects.json`-da 1316 sətir var (438 sənəd × 3 dil), amma
// K2 qərarına görə ru/en **eyni slug-ı paylaşır** — dil dəyişəndə URL sabit
// qalsın deyə. Ona görə xəritə dilsiz saxlanılır:
//
//   "news/1981" -> "xeberler/azerbaycan-dovlet-deniz..."
//
// Dil prefiksini middleware özü qoyur. 1316 → ~440 yazı.
//
//   node gen-redirects.mjs
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { dataPath, ROOT } from './lib/paths.mjs';
import { targetTypeFor } from './mapping.mjs';

/**
 * Hədəf tipi -> Next.js marşrut seqmenti.
 *
 * DİQQƏT: `redirects.json`-dakı `to` sahəsinə GÜVƏNMİRİK. O fayl bütün
 * `content/*`-ı `/sehife/`-yə yönləndirir, halbuki `mapping.mjs` 12 sənədi
 * `department`-ə (`/struktur/`), 4-ünü `program`-a (`/ixtisaslar/`) göndərir.
 * Nəticədə 16 yönləndirmə 404-ə düşürdü. Ona görə seqment BURADA, tip
 * xəritəsindən hesablanır.
 */
const SEGMENT = {
  article: 'xeberler',
  announcement: 'elanlar',
  page: 'sehife',
  faculty: 'fakulteler',
  program: 'ixtisaslar',
  department: 'struktur',
};

const OUT = join(ROOT, '..', '..', 'adda-nextjs', 'lib', 'legacy-redirects.ts');

const src = dataPath('redirects.json');
if (!existsSync(src)) {
  console.error('data/redirects.json yoxdur. Evvelce: node extract.mjs');
  process.exit(1);
}

const rows = JSON.parse(readFileSync(src, 'utf8'));
const LOCALE_RE = /^\/(az|ru|en)\/([a-z]+)\/(\d+)$/;

/**
 * İDXAL OLUNMAYAN SƏNƏDLƏR XƏRİTƏYƏ DÜŞMÜR.
 *
 * `isEmpty` sənədlər Strapi-yə yazılmır. Onlara yönləndirmə qoysaq nəticə
 * 301 → 404 zənciri olar — bu, birbaşa 404-dən DAHA PİSDİR: Google zənciri
 * izləyir, tarama büdcəsi yanır və köhnə URL indeksdə "sınıq" kimi qalır.
 * Birbaşa 404 isə təmiz siqnaldır.
 */
/**
 * (bölmə, legacyId) -> sənəd. HƏQİQƏT MƏNBƏYİ BUDUR.
 *
 * Həm slug, həm tip buradan gəlir — ikisi eyni yerdən gəlsin deyə.
 * `redirects.json`-dan yalnız HANSI köhnə URL-lərin mövcud olduğunu götürürük.
 */
const docs = new Map();
for (const f of ['content', 'faculty', 'news', 'announce']) {
  const fp = dataPath(`extracted/${f}.json`);
  if (!existsSync(fp)) {
    console.error(`\n  XETA: data/extracted/${f}.json yoxdur. Evvelce: node extract.mjs\n`);
    process.exit(1);
  }
  for (const r of JSON.parse(readFileSync(fp, 'utf8'))) {
    if (!r.slug) continue;
    const k = `${r.section}/${r.legacyId}`;
    if (!docs.has(k)) docs.set(k, { slug: r.slug, locales: new Map() });
    const d = docs.get(k);
    d.locales.set(r.locale, !r.isEmpty);
    // az başlığı üstündür — slug dillərdə eynidir (K2), amma ehtiyat üçün.
    if (r.locale === 'az') d.slug = r.slug;
  }
}

const map = new Map();
const conflicts = [];
const dropped = [];

for (const r of rows) {
  const m = LOCALE_RE.exec(r.from);
  if (!m) continue;
  const [, , section, id] = m;
  const key = `${section}/${id}`;

  const doc = docs.get(key);
  if (!doc) {
    dropped.push({ key, target: r.to, why: 'cixarisda yoxdur' });
    continue;
  }

  // XƏRİTƏ DİLSİZDİR, middleware mənbə dilini saxlayır. Deməli `az` versiyası
  // yoxdursa `/az/content/22` -> `/az/sehife/...` = 301 -> 404. Ona görə
  // yalnız az-da CANLI olan sənədlər xəritəyə düşür.
  if (!doc.locales.get('az')) {
    const only = [...doc.locales.entries()].filter(([, live]) => live).map(([l]) => l);
    dropped.push({ key, target: r.to, why: only.length ? `az yoxdur (yalniz ${only.join(',')})` : 'butun diller isEmpty' });
    continue;
  }

  const type = targetTypeFor(section, Number(id));
  const seg = SEGMENT[type];
  if (!seg) {
    dropped.push({ key, target: r.to, why: `taninmayan tip: ${type}` });
    continue;
  }
  const target = `${seg}/${doc.slug}`;

  const prev = map.get(key);
  if (prev && prev !== target) {
    // ru/en fərqli slug alıbsa sıxılma etibarsızdır — bilməliyik.
    conflicts.push({ key, a: prev, b: target });
    continue;
  }
  map.set(key, target);
}

if (conflicts.length) {
  console.error(`\n  XETA: ${conflicts.length} sened dil uzre FERQLI slug alib.`);
  console.error('  Dilsiz sixilma etibarsizdir — xerite yaradilmadi.\n');
  for (const c of conflicts.slice(0, 6)) console.error(`    ${c.key}: ${c.a}  vs  ${c.b}`);
  process.exit(1);
}

const entries = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));

const body = `// AVTOMATİK YARADILIB — ƏL İLƏ DƏYİŞDİRMƏ.
// Mənbə: tools/migration/data/redirects.json
// Yeniləmək: cd tools/migration && node gen-redirects.mjs
//
// Köhnə saytın URL-ləri (${rows.length} sətir, ${entries.length} sənəd) Google
// indeksindədir. Yönləndirmə olmasa hamısı 404 verər.
//
// Açar dilsizdir: ru/en eyni slug-ı paylaşır (K2 qərarı), ona görə dil
// prefiksini \`middleware.ts\` özü qoyur.
export const LEGACY_REDIRECTS: Record<string, string> = {
${entries.map(([k, v]) => `  '${k}': '${v}',`).join('\n')}
};

/** Köhnə saytın bölmə adları — middleware naxışı bunlarla məhdudlaşır. */
export const LEGACY_SECTIONS = ['content', 'news', 'announce', 'faculty', 'photogallery'] as const;
`;

writeFileSync(OUT, body, 'utf8');

const bySection = {};
for (const k of map.keys()) {
  const s = k.split('/')[0];
  bySection[s] = (bySection[s] || 0) + 1;
}

if (dropped.length) {
  console.log(`\n  ATLANDI (hedef idxal olunmayib): ${dropped.length}`);
  for (const d of dropped.slice(0, 10)) console.log(`    ${d.key} -> ${d.target}  [${d.why}]`);
  if (dropped.length > 10) console.log(`    ... +${dropped.length - 10}`);
}

console.log(`\n  Menbe    : ${rows.length} setir (dil uzre)`);
console.log(`  Xerite   : ${entries.length} sened (dilsiz)`);
console.log(`  Olcu     : ${(Buffer.byteLength(body, 'utf8') / 1024).toFixed(1)} KB`);
console.log('\n  bolme uzre:');
for (const [s, n] of Object.entries(bySection).sort((a, b) => b[1] - a[1])) {
  console.log(`    ${s.padEnd(12)} ${n}`);
}
console.log(`\n  Yazildi: adda-nextjs/lib/legacy-redirects.ts\n`);
