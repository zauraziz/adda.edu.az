// tools/check-unit-heads.mjs — F5.22 bölmə → rəhbər → e-poçt siyahısı.
//
// NİYƏ LAZIMDIR: rəhbərlərin e-poçtları ayrı-ayrı admin səhifələrində yaşayır.
// Kimə məktub yazmaq lazımdırsa, siyahını əl ilə yığmaq əvəzinə bir əmrlə
// CSV alınır (Excel-ə birbaşa yapışdırıla bilir).
//
// BU SKRİPT HEÇ NƏYƏ TOXUNMUR — yalnız oxuyur, konsola və
// `tools/unit-heads.csv` faylına yazır.
//
//   node tools/check-unit-heads.mjs
//
// SORĞU `adda-nextjs/lib/strapi.ts` → `getLeadership()` ilə EYNİDİR (yeni
// sorğu forması uydurulmayıb). Funksiyanın ÖZÜ import edilə BİLMİR: o,
// TypeScript-dədir, bu skript isə `node`-un birbaşa işlətdiyi `.mjs`-dir
// (bütün `tools/check-*.mjs` skriptləri elə buna görə `api`/`all`/`wake`
// köməkçilərini təkrarlayır — bax check-content-gaps.mjs, check-unit-data.mjs).
// `KAFEDRA_FACULTY`-dəki eyni qayda: mənbə dəyişsə, BURA da yenilənməlidir.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'unit-heads.csv');

const BASE =
  process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || 'https://adda-edu-az.onrender.com';
const LOCALE = process.env.CHECK_LOCALE || 'az';
const PAGE = 100; // config/api.ts maxLimit = 100, daha boyuk deyer SESSIZCE kesilir

let coldStartWarned = false;
async function api(pathname, params) {
  const url = new URL('/api' + pathname, BASE);
  for (const [k, v] of Object.entries(params || {})) url.searchParams.set(k, String(v));
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(70000) });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.json();
    } catch (e) {
      if (attempt === 5) throw new Error(url.pathname + ': ' + e.message);
      if (!coldStartWarned) {
        console.log('  (yenidən cəhd edirəm...)');
        coldStartWarned = true;
      }
      await new Promise((s) => setTimeout(s, 8000));
    }
  }
}

/** maxLimit=100 - sehifeleme MECBURIDIR. */
async function all(pathname, params) {
  const out = [];
  for (let page = 1; page <= 30; page++) {
    const j = await api(pathname, { ...params, 'pagination[page]': page, 'pagination[pageSize]': PAGE });
    const rows = j?.data ?? [];
    out.push(...rows);
    const pc = j?.meta?.pagination?.pageCount ?? 1;
    if (!rows.length || page >= pc) break;
  }
  return out;
}

/** Render pulsuz planda servis yatir. Ilk sorgu onu oyadir. */
async function wake() {
  const deadline = Date.now() + 5 * 60 * 1000;
  let announced = false;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(new URL('/_health', BASE), { signal: AbortSignal.timeout(30000) });
      if (r.ok || r.status === 204) {
        if (announced) console.log('  servis oyandi.\n');
        return;
      }
    } catch {
      /* hele yatir */
    }
    if (!announced) {
      console.log('  Render soyuq start - gozleyirem (5 deqiqeye qeder)...');
      announced = true;
    }
    process.stdout.write('.');
    await new Promise((s) => setTimeout(s, 10000));
  }
  console.log('\n  XEBERDARLIQ: /_health cavab vermedi, yene de cehd edirem.\n');
}

/**
 * CSV xanası. Vergül/dırnaq/sətir sonu olan dəyər DIRNAQA alınmalıdır —
 * bölmə adlarında vergül var («Tədris, metodika və ...» kimi), sadəcə
 * `join(',')` faylı səssizcə sütun-sürüşmüş edərdi.
 */
function csv(v) {
  const s = String(v ?? '');
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

// ────────────────────────────────────────────────────────────────────────
console.log('Strapi : ' + BASE);
console.log('Dil    : ' + LOCALE);
await wake();

// getLeadership() ilə EYNİ sorğu (bax fayl başlığı).
const units = await all('/units', {
  locale: LOCALE,
  'sort[0]': 'sortOrder:asc',
  'sort[1]': 'name:asc',
  'fields[0]': 'name',
  'fields[1]': 'slug',
  'fields[2]': 'sortOrder',
  'populate[parent][fields][0]': 'slug',
  'populate[head][fields][0]': 'name',
  'populate[head][fields][1]': 'displayName',
  'populate[head][fields][2]': 'slug',
  'populate[head][fields][3]': 'position',
  'populate[head][fields][4]': 'academicDegree',
  'populate[head][fields][5]': 'academicTitle',
  'populate[head][fields][6]': 'email',
  'populate[head][fields][7]': 'phone',
  'populate[head][fields][8]': 'office',
  'populate[head][populate][photo][fields][0]': 'url',
});

const HEADER = ['bolme_slug', 'bolme_adi', 'rehber_adi', 'rehber_epoctu'];

// Ad göstərilməsi `/rehberlik` səhifəsi ilə EYNİ: `displayName` («Ad Ata
// Soyad») varsa o, yoxsa `name` («Soyad Ad Ata»).
const rows = units.map((u) => [
  u.slug,
  u.name,
  u.head ? (u.head.displayName?.trim() || u.head.name?.trim() || '') : '',
  u.head?.email ?? '',
]);

const lines = [HEADER, ...rows].map((r) => r.map(csv).join(','));

console.log('');
for (const l of lines) console.log(l);

// BOM: Excel BOM-suz UTF-8 faylı sistem kod səhifəsi kimi oxuyur və
// «Ə/ş/ğ» hərfləri korlanır. Tapşırıq Excel-ə kopyalanmağı tələb edir.
fs.writeFileSync(OUT, '﻿' + lines.join('\r\n') + '\r\n', 'utf8');

const withHead = rows.filter((r) => r[2]).length;
const withEmail = rows.filter((r) => r[3]).length;

console.log('');
console.log('-'.repeat(62));
console.log('bölmə: ' + rows.length + '  ·  rəhbəri var: ' + withHead + '  ·  e-poçtu var: ' + withEmail);
console.log('fayl : ' + OUT);
console.log('');
console.log('Bu skript HEÇ NƏYƏ TOXUNMADI — yalnız oxudu.');
