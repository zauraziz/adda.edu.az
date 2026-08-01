// K26-11 — heyət profillərini doldurmaq üçün CSV şablonu.
//
// PROBLEM: ştat cədvəli yalnız ad, vəzifə və bölmə verir. Profil səhifəsindəki
// telefon, otaq, elmi dərəcə, ORCID, tədqiqat sahələri və s. HEÇ BİR mənbədə
// yoxdur — onları insan doldurmalıdır.
//
// Strapi admin panelində 162 profili əl ilə açmaq çox uzundur. Bu skript
// mövcud məlumatı ÖNCƏDƏN DOLDURULMUŞ CSV çıxarır: Excel-də açıb boş sütunları
// tamamlamaq, sonra `staff-import.mjs --profiles` ilə geri yükləmək olar.
//
// UTF-8 BOM YAZILIR: Excel BOM olmadan CSV-ni Windows-1252 sayır və
// `ə ö ü ğ ş ç İ` hərfləri korlanır. Bu, faylı bir dəfə açıb saxladıqda
// bütün adları xarab edən sakit səhvdir.
//
// İSTİFADƏ: node staff-template.mjs [cixis.csv]

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DATA, dataPath } from './lib/paths.mjs';

const OUT = process.argv[2] || join(DATA, 'staff-profiles.csv');

const COLUMNS = [
  // Açar — DƏYİŞDİRMƏYİN, idxal bununla uyğunlaşdırır.
  'slug',
  // Məlumat üçün, dəyişdirilmir.
  'name',
  'position',
  'unit',
  // Doldurulacaq sütunlar.
  'email',
  'phone',
  'building',
  'office',
  'academicTitle',
  'academicDegree', // elmler_doktoru | felsefe_doktoru | yoxdur
  'languages', // az;tr;en;ru;diger  (nöqtəli vergüllə)
  'researchAreas', // etiketlər, nöqtəli vergüllə
  'spin',
  'orcid',
  'researcherId',
  'scopusAuthorId',
  'googleScholar',
];

const READONLY = new Set(['slug', 'name', 'position', 'unit']);

/** RFC 4180: dırnaq, vergül, yeni sətir olan xanalar dırnağa alınır. */
function cell(v) {
  const s = v === null || v === undefined ? '' : String(v);
  return /["',;\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const path = dataPath('staff.json');
if (!existsSync(path)) {
  console.error(`\n  XETA: ${path} tapilmadi.`);
  console.error('  Once: node staff-parse.mjs data\\stat.txt --write\n');
  process.exit(1);
}

const { staff } = JSON.parse(readFileSync(path, 'utf8'));

const lines = [COLUMNS.join(',')];
for (const p of staff) {
  const row = COLUMNS.map((c) => {
    if (c === 'slug') return p.slug;
    if (c === 'name') return p.name;
    if (c === 'position') return p.roles?.[0]?.position ?? p.position ?? '';
    if (c === 'unit') return p.roles?.[0]?.unitName ?? p.unit ?? '';
    return '';
  });
  lines.push(row.map(cell).join(','));
}

writeFileSync(OUT, `\uFEFF${lines.join('\r\n')}\r\n`, 'utf8');

console.log(`\n  Yazildi: ${OUT}`);
console.log(`  Setir  : ${staff.length}`);
console.log(`  Sutun  : ${COLUMNS.length} (${READONLY.size} melumat ucun, ${COLUMNS.length - READONLY.size} doldurulacaq)\n`);
console.log('  QEYD: `slug` sutunu ACARDIR -- deyisdirilmemelidir.');
console.log('  languages ve researchAreas noqteli vergulle ayrilir: az;en;ru');
console.log('  academicDegree yalniz: elmler_doktoru | felsefe_doktoru | yoxdur\n');
console.log('  Doldurduqdan sonra: node staff-import.mjs --profiles ' + OUT + '\n');
