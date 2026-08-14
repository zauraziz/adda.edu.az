// tools/check-locale-coverage.mjs — HANSI tipde HANSI dilde nece qeyd var?
//
// NIYE INDI: `person` (ve `document`) tipini lokallasdirmadan cixarmaq
// isteyirik. Strapi-nin oz miqrasiyasi (@strapi/core/dist/migrations/i18n.js)
// bunu edir:
//
//     deleteMany({ where: { locale: { $ne: defaultLocale } } })
//
// Defolt dil `az`-dir, ona gore `ru`/`en` setirleri SILINIR. Eger hansisa
// tipde real ru/en mezmunu varsa, o mezmun geri qaytarilmaz sekilde itir.
//
// Bu skript miqrasiyadan EVVEL hansi tipin ne itireceyini gosterir.
// HEC NE YAZMIR.
//
//   node tools/check-locale-coverage.mjs

const BASE =
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  'https://adda-edu-az.onrender.com';

const LOCALES = ['az', 'ru', 'en'];

// Lokallasdirilmis kolleksiya tipleri (src/api/*/content-types/*/schema.json).
// Sira: evvelce miqrasiya nezerde tutulanlar.
const TYPES = [
  ['people', 'Heyet'],
  ['documents', 'Senedler'],
  ['units', 'Struktur bolmeler'],
  ['articles', 'Xeberler'],
  ['announcements', 'Elanlar'],
  ['events', 'Tedbirler'],
  ['pages', 'Sehifeler'],
  ['programs', 'Proqramlar'],
  ['faculties', 'Fakulteler'],
  ['departments', 'Kafedralar (kohne)'],
  ['milestones', 'Merheleler'],
  ['rectors', 'Sabiq rektorlar'],
  ['tags', 'Etiketler'],
];

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
 * Bir tipin bir dildeki qeyd sayi.
 * `pageSize=1` + `meta.pagination.total` — butun qeydleri cekmeye ehtiyac yoxdur.
 */
async function count(endpoint, locale) {
  const url = new URL('/api/' + endpoint, BASE);
  url.searchParams.set('locale', locale);
  url.searchParams.set('pagination[pageSize]', '1');
  url.searchParams.set('pagination[withCount]', 'true');
  for (let a = 1; a <= 4; a++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(60000) });
      if (r.status === 404) return null; // tip public deyil
      if (!r.ok) return `HTTP ${r.status}`;
      const j = await r.json();
      return j?.meta?.pagination?.total ?? 0;
    } catch (e) {
      if (a === 4) return 'XETA';
      await new Promise((s) => setTimeout(s, 6000));
    }
  }
  return 'XETA';
}

console.log('Strapi : ' + BASE);
console.log('');
await wake();

console.log('QEYD SAYI — dil uzre');
console.log('-'.repeat(66));
console.log('  ' + 'tip'.padEnd(22) + LOCALES.map((l) => l.padStart(8)).join('') + '   risk');
console.log('-'.repeat(66));

const atRisk = [];
for (const [ep, label] of TYPES) {
  const nums = [];
  for (const loc of LOCALES) nums.push(await count(ep, loc));
  if (nums[0] === null) continue; // public deyil, atla

  const ru = typeof nums[1] === 'number' ? nums[1] : 0;
  const en = typeof nums[2] === 'number' ? nums[2] : 0;
  const lose = ru + en;
  if (lose > 0) atRisk.push([label, lose]);

  console.log(
    '  ' +
      (label + ' (' + ep + ')').padEnd(22).slice(0, 22) +
      nums.map((n) => String(n ?? '-').padStart(8)).join('') +
      (lose > 0 ? '   ' + lose + ' setir silinerdi' : '   temiz'),
  );
}
console.log('-'.repeat(66));

console.log('');
console.log('OXUNUS');
console.log('  Defolt dil `az`-dir. Bir tipde i18n SONDURULENDE hemin tipin');
console.log('  `ru` ve `en` setirleri BAZADAN SILINIR.');
console.log('');
if (!atRisk.length) {
  console.log('  Hec bir tipde ru/en qeydi yoxdur - sondurmek zerersizdir.');
} else {
  console.log('  Asagidaki tiplerde ru/en mezmunu VAR:');
  for (const [label, n] of atRisk) console.log('    * ' + label + ' — ' + n + ' setir');
  console.log('');
  console.log('  Bunlarin HEC BIRINDE i18n sondurulmemelidir, yoxsa hemin');
  console.log('  mezmun geri qaytarilmaz sekilde itir.');
}
console.log('');
console.log('  Bu skript HEC NE YAZMADI.');
