// tools/rectors/sync.mjs — CANLI Strapi -> adda-nextjs/lib/rectors-fallback.ts
//
// NIYE LAZIMDIR: sehifenin esas menbeyi Strapi-dir, lakin Render pulsuz
// tarifde yuxuya gedir. Soyuq startda sehife bos qalmasin deye ehtiyat
// suret saxlanilir. Admin paneldə yeni rektor elave olunanda bu suret
// KOHNELIR - hemin rektor Strapi yatanda sehifeden yox olur.
//
// Bu skript suretin yenilenmesini bir emre cevirir. Asililiq yoxdur.
//
//   node tools/rectors/sync.mjs
//   node tools/rectors/sync.mjs --url=http://localhost:1337
//
// Ne vaxt islet: Strapi-de rektor elave/redakte edenden SONRA, push-dan EVVEL.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const DEST = path.join(REPO, 'adda-nextjs', 'lib', 'rectors-fallback.ts');

const LOCALES = ['az', 'ru', 'en'];
const arg = process.argv.find((a) => a.startsWith('--url='));
const BASE = (arg ? arg.slice(6) : process.env.STRAPI_URL || 'https://adda-edu-az.onrender.com').replace(/\/$/, '');

const q = (locale) =>
  `${BASE}/api/rectors?locale=${locale}` +
  '&sort[0]=termFrom:asc&sort[1]=sortOrder:asc' +
  '&pagination[pageSize]=100&populate[photo]=true';

/** TS tek-dirnaqli sabit. */
const lit = (v) =>
  v === null || v === undefined
    ? 'null'
    : "'" + String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '') + "'";

async function pull(locale) {
  const res = await fetch(q(locale));
  if (!res.ok) throw new Error(`${locale}: Strapi ${res.status} ${res.statusText}`);
  const json = await res.json();
  const rows = json.data ?? [];
  if (!rows.length) throw new Error(`${locale}: bos cavab - fallback silinmesin deye dayandirildi`);
  return rows;
}

const data = {};
for (const l of LOCALES) {
  data[l] = await pull(l);
  console.log(`  ${l}: ${data[l].length} qeyd`);
}

// Butun diller eyni slug destini vermelidir - bir dil unudulubsa derhal gorunsun.
const key = (rows) => rows.map((r) => r.slug).sort().join(',');
const ref = key(data.az);
for (const l of LOCALES) {
  if (key(data[l]) !== ref) {
    throw new Error(`slug desti uygun deyil: az=[${ref}] ${l}=[${key(data[l])}] — ` +
      `hemin dilde tercume yaradilmayib, sync dayandirildi`);
  }
}

const out = [];
out.push('// AVTOMATIK GENERASIYA — ƏL İLƏ REDAKTƏ ETMƏ.');
out.push('//');
out.push('// Mənbə: canlı Strapi (`api::rector.rector`).');
out.push('// Yeniləmək: `node tools/rectors/sync.mjs`');
out.push('//');
out.push('// Bu, yalnız EHTİYAT surətidir. Render pulsuz tarifdə yuxuya gedir;');
out.push('// soyuq startda səhifə boş qalmasın deyə saxlanılır. Səhifə normal');
out.push('// halda birbaşa Strapi-dən oxuyur.');
out.push("import type { Rector } from './strapi';");
out.push("import type { Locale } from './i18n';");
out.push('');
out.push('export const RECTORS_FALLBACK: Record<Locale, Rector[]> = {');
for (const l of LOCALES) {
  out.push(`  ${l}: [`);
  for (const r of data[l]) {
    out.push('    {');
    out.push(`      slug: ${lit(r.slug)},`);
    out.push(`      name: ${lit(r.name)},`);
    out.push(`      termFrom: ${r.termFrom},`);
    out.push(`      termTo: ${r.termTo ?? 'null'},`);
    out.push(`      degree: ${lit(r.degree)},`);
    out.push(`      summary: ${lit(r.summary)},`);
    out.push(`      bio: ${lit(r.bio)},`);
    out.push(`      died: ${lit(r.died)},`);
    out.push(`      sortOrder: ${r.sortOrder ?? 0},`);
    out.push(`      locale: '${l}',`);
    out.push('    },');
  }
  out.push('  ],');
}
out.push('};');
out.push('');

fs.writeFileSync(DEST, out.join('\n'), 'utf8');
console.log(`\nyazildi: ${DEST}`);
console.log(`rektor sayi: ${data.az.length} (her dilde)`);
