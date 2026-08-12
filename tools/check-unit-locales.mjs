// tools/check-unit-locales.mjs — bolmelerin ru/en versiyasi VARMI?
//
// NIYE: F3.4 seed-i 24/24 `az` yazdi, amma HER bolmede ru ve en ucun
//   «Document with id "...", locale "ru" not found»
// verdi. Iki ehtimal var:
//   A) bolmelerin ru/en qeydi UMUMIYYETLE yoxdur -> /ru/struktur ve
//      /en/struktur boLmeleri sinixdir (head-den qat-qat ciddi problem)
//   B) qeyd var, sehv olan yalniz update/publish cagrisidir
//
// Bu skript ferqi qeti sekilde ayirir. HEC NE YAZMIR.
//
//   node tools/check-unit-locales.mjs

const BASE =
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  'https://adda-edu-az.onrender.com';

const PAGE = 100; // maxLimit

async function api(path, params) {
  const url = new URL('/api' + path, BASE);
  for (const [k, v] of Object.entries(params || {})) url.searchParams.set(k, String(v));
  for (let a = 1; a <= 5; a++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(70000) });
      if (!r.ok) return { __http: r.status };
      return await r.json();
    } catch (e) {
      if (a === 5) return { __err: e.message };
      await new Promise((s) => setTimeout(s, 8000));
    }
  }
}

async function all(path, params) {
  const out = [];
  for (let page = 1; page <= 20; page++) {
    const j = await api(path, { ...params, 'pagination[page]': page, 'pagination[pageSize]': PAGE });
    if (j.__http || j.__err) return { error: j.__http ? 'HTTP ' + j.__http : j.__err };
    out.push(...(j?.data ?? []));
    if (page >= (j?.meta?.pagination?.pageCount ?? 1)) break;
  }
  return { rows: out };
}

const line = (n = 62) => console.log('-'.repeat(n));
console.log('Strapi : ' + BASE);

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

// --- 1. dil-dil say -------------------------------------------------------
console.log('1. HER DILDE NECE BOLME VAR');
const counts = {};
for (const loc of ['az', 'ru', 'en']) {
  const r = await all('/units', { locale: loc, 'fields[0]': 'slug', 'fields[1]': 'name' });
  if (r.error) {
    console.log('   ' + loc + ' : XETA - ' + r.error);
    counts[loc] = null;
    continue;
  }
  counts[loc] = r.rows;
  console.log('   ' + loc + ' : ' + r.rows.length + ' bolme');
}
line();

// --- 2. hansi bolmede hansi dil var ---------------------------------------
console.log('2. LOCALIZATIONS - her sened hansi dilleri saxlayir');
const withLoc = await all('/units', {
  locale: 'az',
  'fields[0]': 'slug',
  'populate[localizations][fields][0]': 'locale',
  sort: 'sortOrder:asc',
});

if (withLoc.error) {
  console.log('   XETA: ' + withLoc.error);
} else {
  let full = 0;
  const partial = [];
  for (const u of withLoc.rows) {
    const locs = ['az', ...((u.localizations ?? []).map((l) => l.locale))];
    const uniq = [...new Set(locs)].sort();
    if (uniq.length === 3) full++;
    else partial.push(u.slug + '  ->  ' + uniq.join(', '));
  }
  console.log('   3 dilin hamisi olan : ' + full + ' / ' + withLoc.rows.length);
  if (partial.length) {
    console.log('   NATAMAM (' + partial.length + '):');
    for (const p of partial.slice(0, 30)) console.log('     ' + p);
    if (partial.length > 30) console.log('     ... ve daha ' + (partial.length - 30));
  }
}
line();

// --- 3. head ru/en-de gorunurmu -------------------------------------------
console.log('3. head - dil uzre');
for (const loc of ['az', 'ru', 'en']) {
  const r = await all('/units', {
    locale: loc,
    'fields[0]': 'slug',
    'populate[head][fields][0]': 'slug',
  });
  if (r.error) { console.log('   ' + loc + ' : XETA - ' + r.error); continue; }
  const n = r.rows.filter((u) => u.head).length;
  console.log('   ' + loc + ' : ' + n + ' / ' + r.rows.length + ' bolmede head var');
}
line();

// --- 4. muqayise ucun: heyet da eyni veziyyetdedirmi? ---------------------
console.log('4. MUQAYISE - person tipi');
for (const loc of ['az', 'ru', 'en']) {
  const r = await all('/people', { locale: loc, 'fields[0]': 'slug' });
  console.log('   ' + loc + ' : ' + (r.error ? 'XETA - ' + r.error : r.rows.length + ' sexs'));
}
line();

console.log('OXUNUS');
if (counts.ru !== null && counts.az !== null) {
  if ((counts.ru?.length ?? 0) === 0) {
    console.log('  * Bolmelerin ru versiyasi YOXDUR.');
    console.log('    /ru/struktur ve /ru/struktur/<slug> hazirda BOSDUR.');
    console.log('    Bu head probleminden daha ciddidir - evvelce bu duzelmelidir.');
  } else if ((counts.ru?.length ?? 0) < (counts.az?.length ?? 0)) {
    console.log('  * ru natamamdir: ' + counts.ru.length + ' / ' + counts.az.length);
  } else {
    console.log('  * ru qeydleri var - problem update/publish cagrisindadir, melumatda deyil.');
  }
}
console.log('');
console.log('  Bu skript HEC NE YAZMADI.');
