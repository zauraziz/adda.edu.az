// tools/check-unit-data.mjs — struktur bolmesi ve rehberlik sehifesi ucun
// MELUMAT HAZIRLIGI yoxlayicisi.
//
// NIYE LAZIMDIR: /struktur/[slug] ve /rehberlik sehifelerini qurmaq asandir,
// lakin onlar BOS gorunecek eger:
//   - unit.head teyin olunmayibsa (rehberlik sehifesi bos qalir)
//   - person.photo/email/position bos-dursa (kartlar yarimciq)
//   - heyet baglantisi qirixdirsa (bolmede "0 nefer" yazir)
//
// Hazirda heyet iki mexanizmle baglanir:
//   A) person.unit  -> relasiya (etibarli)
//   B) roles[].unitName -> SETIR uygunlugu (bir herf ferqi = sessiz sifir)
// Skript hansinin ise yaradigini ve neqeder ferq oldugunu gosterir.
//
//   node tools/check-unit-data.mjs
//
// Kritik problem tapilsa exit 1.

const BASE =
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  'https://adda-edu-az.onrender.com';

const LOCALE = process.env.CHECK_LOCALE || 'az';
const PAGE = 100; // config/api.ts maxLimit = 100, daha boyuk deyer SESSIZCE kesilir

let coldStartWarned = false;

async function api(path, params) {
  const url = new URL('/api' + path, BASE);
  url.searchParams.set('locale', LOCALE);
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

/** Butun sehifeleri yigir. maxLimit=100 oldugu ucun pagination MECBURIDIR. */
async function all(path, params) {
  const out = [];
  for (let page = 1; page <= 20; page++) {
    const j = await api(path, { ...params, 'pagination[page]': page, 'pagination[pageSize]': PAGE });
    const rows = j?.data ?? [];
    out.push(...rows);
    const total = j?.meta?.pagination?.pageCount ?? 1;
    if (page >= total) break;
  }
  return out;
}

const has = (v) => v !== null && v !== undefined && String(v).trim() !== '';
const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0) + '%';
const line = (n = 62) => console.log('-'.repeat(n));

console.log('Strapi : ' + BASE);
console.log('Dil    : ' + LOCALE);

/** Render pulsuz planda servis yatir. Ilk sorgu onu oyadir, cavab 2-3 deqiqe
 *  cekе biler. Sorgulara baslamazdan evvel /_health-i doyecleyirik. */
async function wake() {
  const deadline = Date.now() + 5 * 60 * 1000;
  let announced = false;
  while (Date.now() < deadline) {
    try {
      const r = await fetch(new URL('/_health', BASE), { signal: AbortSignal.timeout(30000) });
      if (r.ok || r.status === 204) {
        if (announced) console.log('  servis oyandi.\n');
        return true;
      }
    } catch {
      /* hele yatir */
    }
    if (!announced) {
      console.log('  Render soyuq start - servis oyanir, 5 deqiqeye qeder gozleyirem...');
      announced = true;
    }
    process.stdout.write('.');
    await new Promise((s) => setTimeout(s, 10000));
  }
  console.log('\n  XEBERDARLIQ: /_health cavab vermedi, yene de cehd edirem.\n');
  return false;
}

await wake();

line();

// ---------------------------------------------------------------- 1. bolmeler
const units = await all('/units', {
  'populate[head][fields][0]': 'name',
  'populate[head][fields][1]': 'slug',
  'populate[head][fields][2]': 'position',
  'populate[parent][fields][0]': 'slug',
  'fields[0]': 'name',
  'fields[1]': 'slug',
  'fields[2]': 'about',
  'fields[3]': 'sortOrder',
  sort: 'sortOrder:asc',
});

const withHead = units.filter((u) => u.head);
const withAbout = units.filter((u) => has(u.about));

console.log('1. STRUKTUR BOLMELERI');
console.log('   cemi bolme        : ' + units.length);
console.log('   head teyin olunub : ' + withHead.length + '  (' + pct(withHead.length, units.length) + ')');
console.log('   about doludur     : ' + withAbout.length + '  (' + pct(withAbout.length, units.length) + ')');

const noHead = units.filter((u) => !u.head);
if (noHead.length) {
  console.log('   head YOXDUR (' + noHead.length + '):');
  for (const u of noHead) console.log('     - ' + u.name);
}
line();

// ---------------------------------------------------------------- 2. rehberler
console.log('2. REHBERLER - kart sahelerinin doluluğu');
const headSlugs = [...new Set(withHead.map((u) => u.head.slug).filter(Boolean))];
const heads = [];
for (const slug of headSlugs) {
  const j = await api('/people', {
    'filters[slug][$eq]': slug,
    'populate[photo][fields][0]': 'url',
    'fields[0]': 'name',
    'fields[1]': 'displayName',
    'fields[2]': 'position',
    'fields[3]': 'email',
    'fields[4]': 'phone',
    'fields[5]': 'office',
    'fields[6]': 'building',
    'fields[7]': 'academicTitle',
    'fields[8]': 'academicDegree',
    'pagination[pageSize]': 1,
  });
  const p = j?.data?.[0];
  if (p) heads.push(p);
  else console.log('   ! head tapilmadi: ' + slug + '  (relasiya var, person yoxdur)');
}

const FIELDS = ['photo', 'position', 'email', 'phone', 'office', 'academicTitle'];
const fill = Object.fromEntries(FIELDS.map((f) => [f, 0]));
for (const p of heads) {
  for (const f of FIELDS) {
    const v = f === 'photo' ? p.photo?.url : p[f];
    if (has(v)) fill[f]++;
  }
}
console.log('   rehber sayi: ' + heads.length);
for (const f of FIELDS) {
  const flag = (f === 'photo' || f === 'position') && fill[f] < heads.length ? '  <-- kart yarimciq' : '';
  console.log('     ' + f.padEnd(14) + fill[f] + '/' + heads.length + '  ' + pct(fill[f], heads.length) + flag);
}
line();

// ---------------------------------------------------------------- 3. heyet
console.log('3. HEYET BAGLANTISI');
const people = await all('/people', {
  'populate[unit][fields][0]': 'name',
  'populate[unit][fields][1]': 'slug',
  'populate[roles]': true,
  'fields[0]': 'name',
  'fields[1]': 'slug',
  'fields[2]': 'position',
  sort: 'name:asc',
});

const byRelation = people.filter((p) => p.unit);
const byRoleName = people.filter((p) => (p.roles ?? []).some((r) => has(r.unitName)));

console.log('   cemi person            : ' + people.length);
console.log('   person.unit relasiyasi : ' + byRelation.length + '  (' + pct(byRelation.length, people.length) + ')');
console.log('   roles[].unitName dolu  : ' + byRoleName.length + '  (' + pct(byRoleName.length, people.length) + ')');

// SETIR uygunlugu: unitName-ler real bolme adlarina dusurmu?
const unitNames = new Set(units.map((u) => u.name));
const orphan = new Map();
for (const p of people) {
  for (const r of p.roles ?? []) {
    if (!has(r.unitName)) continue;
    if (!unitNames.has(r.unitName)) orphan.set(r.unitName, (orphan.get(r.unitName) ?? 0) + 1);
  }
}
if (orphan.size) {
  console.log('   ! unitName HECH BIR bolmeye uygun gelmir (' + orphan.size + ' ferqli deyer):');
  for (const [n, c] of [...orphan].sort((a, b) => b[1] - a[1]).slice(0, 25)) {
    console.log('       ' + String(c).padStart(3) + ' nefer  «' + n + '»');
  }
  if (orphan.size > 25) console.log('       ... ve daha ' + (orphan.size - 25));
} else {
  console.log('   unitName deyerleri tam uygun gelir.');
}
line();

// ---------------------------------------------------------------- 4. bolme uzre
console.log('4. HER BOLMEDE NECE NEFER  (relasiya | unitName)');
let emptyUnits = 0;
for (const u of units) {
  const a = people.filter((p) => p.unit?.slug === u.slug).length;
  const b = people.filter((p) => (p.roles ?? []).some((r) => r.unitName === u.name)).length;
  if (!a && !b) emptyUnits++;
  const mark = !a && !b ? '   <-- bos' : a !== b ? '   <-- ferqli' : '';
  console.log('   ' + String(a).padStart(3) + ' | ' + String(b).padStart(3) + '  ' + u.name + mark);
}
line();

// ---------------------------------------------------------------- verdikt
const problems = [];
if (noHead.length) problems.push(noHead.length + ' bolmede head yoxdur - rehberlik sehifesi natamam olacaq');
if (heads.length && fill.photo < heads.length) problems.push(heads.length - fill.photo + ' rehberde foto yoxdur');
if (heads.length && fill.email < heads.length) problems.push(heads.length - fill.email + ' rehberde e-poct yoxdur');
if (byRelation.length === 0) problems.push('person.unit relasiyasi HEC KIMDE dolu deyil - heyet siyahisi yalniz setir uygunlugu ile isleyir');
if (orphan.size) problems.push(orphan.size + ' unitName deyeri hec bir bolmeye dusmur');
if (emptyUnits) problems.push(emptyUnits + ' bolmede hec bir heyet gorunmur');

console.log('XULASE');
if (!problems.length) {
  console.log('  melumat tamdir - sehifeleri qurmaq olar.');
  process.exit(0);
}
for (const p of problems) console.log('  * ' + p);
console.log('');
console.log('  Bunlar KOD sehvi deyil - MEZMUN bosluqudur. Sehife qurulmadan');
console.log('  evvel doldurulmalidir, eks halda bos bloklar gorunecek.');
process.exit(1);
