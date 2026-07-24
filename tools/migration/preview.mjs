// Çıxarılmış qeydə göz gəzdirmək — Markdown-un doğruluğunu əl ilə yoxlamaq üçün.
// İdxaldan (K3) ƏVVƏL bir neçə nümunəyə baxmaq məcburidir.
//
//   node preview.mjs news az        # ən yeni qeyd
//   node preview.mjs news az 1984
//   node preview.mjs announce az 519
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { dataPath } from './lib/paths.mjs';

const [section = 'news', locale = 'az', idArg] = process.argv.slice(2);
const file = join(dataPath('extracted'), `${section}.json`);
if (!existsSync(file)) {
  console.error(`${file} yoxdur. Evvelce: node extract.mjs`);
  process.exit(1);
}

const rows = JSON.parse(readFileSync(file, 'utf8')).filter((r) => r.locale === locale);
if (!rows.length) {
  console.error(`${section}/${locale} ucun qeyd yoxdur.`);
  process.exit(1);
}

const rec = idArg
  ? rows.find((r) => r.legacyId === Number(idArg))
  : rows.sort((a, b) => b.legacyId - a.legacyId)[0];

if (!rec) {
  console.error(`${section}/${idArg} tapilmadi.`);
  process.exit(1);
}

console.log('\n' + '='.repeat(72));
console.log(`  ${rec.section}/${rec.legacyId}.${rec.locale}`);
console.log('='.repeat(72));
console.log(`  basliq   : ${rec.title}`);
console.log(`  slug     : ${rec.slug}`);
console.log(`  tarix    : ${rec.publishedAt || '(yoxdur)'}`);
console.log(`  baxis    : ${rec.views ?? '(yoxdur)'}`);
console.log(`  esas sekil: ${rec.heroImage || '(yoxdur)'}`);
console.log(`  qalereya : ${rec.gallery || '(yoxdur)'}`);
console.log(`  sekil    : ${rec.images.length} | sened: ${rec.documents.length}`);
console.log(`  kohne URL: ${rec.legacyUrl}`);
if (rec.warnings.length) console.log(`  XEBARDARLIQ: ${rec.warnings.join(', ')}`);
console.log('\n--- MARKDOWN ---\n');
console.log(rec.bodyMarkdown);
console.log('\n' + '-'.repeat(72));
console.log(`  ${rec.bodyMarkdown.length} simvol`);
if (rec.images.length) {
  console.log('\n  SEKILLER:');
  for (const i of rec.images.slice(0, 6)) console.log('    ' + i);
}
if (rec.documents.length) {
  console.log('\n  SENEDLER:');
  for (const d of rec.documents.slice(0, 6)) console.log('    ' + d);
}
console.log('');
