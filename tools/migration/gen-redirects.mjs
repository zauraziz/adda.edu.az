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

const OUT = join(ROOT, '..', '..', 'adda-nextjs', 'lib', 'legacy-redirects.ts');

const src = dataPath('redirects.json');
if (!existsSync(src)) {
  console.error('data/redirects.json yoxdur. Evvelce: node extract.mjs');
  process.exit(1);
}

const rows = JSON.parse(readFileSync(src, 'utf8'));
const LOCALE_RE = /^\/(az|ru|en)\/([a-z]+)\/(\d+)$/;

const map = new Map();
const conflicts = [];

for (const r of rows) {
  const m = LOCALE_RE.exec(r.from);
  if (!m) continue;
  const [, , section, id] = m;
  const key = `${section}/${id}`;
  // Hədəfdən dil prefiksini at: /az/xeberler/slug -> xeberler/slug
  const target = r.to.replace(/^\/(az|ru|en)\//, '');

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

console.log(`\n  Menbe    : ${rows.length} setir (dil uzre)`);
console.log(`  Xerite   : ${entries.length} sened (dilsiz)`);
console.log(`  Olcu     : ${(Buffer.byteLength(body, 'utf8') / 1024).toFixed(1)} KB`);
console.log('\n  bolme uzre:');
for (const [s, n] of Object.entries(bySection).sort((a, b) => b[1] - a[1])) {
  console.log(`    ${s.padEnd(12)} ${n}`);
}
console.log(`\n  Yazildi: adda-nextjs/lib/legacy-redirects.ts\n`);
