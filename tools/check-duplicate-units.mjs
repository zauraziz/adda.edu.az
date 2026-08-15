// tools/check-duplicate-units.mjs — `department` / `unit` tekrarlarinin auditi.
//
// NIYE LAZIMDIR: F3.17-F3.23-de struktur sehifesi `unit` uzerine qurulub, amma
// kohne `department` tipi (11/3/10, ru/en menzunu var) hele bazada qalir.
// Bezi kafedralar/fakulteler HEM department, HEM unit kimi movcuddur - eyni
// bolmenin iki qeydi. F3.23 slug-i EYNI olanlari kocurub (ABOUT_MIGRATE), amma
// slug ferqli oldugu ucun avtomatik tutusmayan cutler qala biler.
//
// BU SKRIPT HEC NEYE TOXUNMUR - yalniz oxuyur ve raport verir.
//
//   node tools/check-duplicate-units.mjs
//
// Her department ucun uc kateqoriyadan biri:
//   DEQIQ  - slug eyni (F3.23 artiq kocurub, about mueyyen olunmali idi)
//   YAXIN  - normallasdirdikde uygun gelir (esas tapinti - eldeen kocurulmeyib)
//   TEK    - uygun unit yoxdur (department teklikde qalir)

const BASE =
  process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || 'https://adda-edu-az.onrender.com';

const PAGE = 100; // config/api.ts maxLimit = 100, daha boyuk deyer SESSIZCE kesilir

let coldStartWarned = false;
async function api(pathname, params) {
  const url = new URL('/api' + pathname, BASE);
  for (const [k, v] of Object.entries(params || {})) url.searchParams.set(k, String(v));
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(70000) });
      if (r.status === 404) return null;
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
  for (let page = 1; page <= 20; page++) {
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

const has = (v) => v !== null && v !== undefined && String(v).trim() !== '';

// ── Azerbaycan diakritik bukmesi (CLAUDE.md telesi) ────────────────────────
const azLower = (s) => String(s ?? '').replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
const FOLD_MAP = { ə: 'e', ş: 's', ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ü: 'u' };
const fold = (s) => azLower(s).replace(/[əşçğıöü]/g, (c) => FOLD_MAP[c] ?? c);

// ── Slug normallasdirmasi: bukme + defis/bosluq + tanis qisaltma quyruqlari ──
const ABBREV_TAILS = ['phs', 'ttm']; // legacy slug quyruqlari (bax: legacy-redirects.ts)
function normalizeSlug(slug) {
  let s = fold(String(slug ?? ''))
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  for (const tail of ABBREV_TAILS) {
    const re = new RegExp('(?:^|-)' + tail + '$');
    if (re.test(s)) s = s.replace(re, '');
  }
  return s;
}

// ── Metnden regex ile teqribi elaqe melumati cixarma (yalniz oxuma, teqribi) ─
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const PHONE_RE = /(?:\+?994[\s\-]?)?\(?0\d{2}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}/;
const ADDRESS_RE = /[uü]nvan\s*[:\-–]?\s*([^\n\r.]{5,100})/iu;
const NAME_RE =
  /(?:[Dd]irektoru?|[Mm]üdiri?)\s*[:\-–]?\s*((?:[A-ZÇƏĞİÖŞÜ][\p{L}.]+\s*){2,4})/u;

function extractContact(text) {
  const t = String(text ?? '');
  const email = t.match(EMAIL_RE)?.[0] ?? null;
  const phone = t.match(PHONE_RE)?.[0] ?? null;
  const address = t.match(ADDRESS_RE)?.[1]?.trim() ?? null;
  const name = t.match(NAME_RE)?.[1]?.trim() ?? null;
  return { name, phone, email, address };
}

// ── Menyudan struktur keçidlerini cixar (F3.24-den sadelesdirilmis texnika) ──
async function getStrukturMenuSlugs(locale) {
  const j = await api('/menu', {
    locale,
    'populate[esasMenyu][populate][groups][populate][links]': true,
    'populate[ustMenyu][populate][groups][populate][links]': true,
  });
  const menu = j?.data;
  const urls = [];
  const collect = (l) => {
    if (typeof l?.url === 'string') urls.push(l.url);
  };
  for (const key of ['esasMenyu', 'ustMenyu']) {
    for (const cat of menu?.[key] ?? []) {
      collect(cat);
      for (const g of cat.groups ?? []) for (const l of g.links ?? []) collect(l);
    }
  }
  const slugs = new Set();
  for (const u of urls) {
    const m = /^\/(?:az\/)?struktur\/([^/?#]+)/.exec(u);
    if (m) slugs.add(decodeURIComponent(m[1]));
  }
  return slugs;
}

// ────────────────────────────────────────────────────────────────────────
console.log('Strapi : ' + BASE);
await wake();

const departments = await all('/departments', {
  locale: 'az',
  'fields[0]': 'name',
  'fields[1]': 'slug',
  'fields[2]': 'about',
  sort: 'slug:asc',
});
const units = await all('/units', {
  locale: 'az',
  'fields[0]': 'name',
  'fields[1]': 'slug',
  'fields[2]': 'about',
  sort: 'slug:asc',
});
const strukturMenuSlugs = await getStrukturMenuSlugs('az');

console.log('department (az) : ' + departments.length);
console.log('unit (az)       : ' + units.length);
console.log('menyu /struktur/* keçid sayı (az) : ' + strukturMenuSlugs.size);
console.log('-'.repeat(72));

const unitBySlug = new Map(units.map((u) => [u.slug, u]));
const unitByNorm = new Map();
for (const u of units) {
  const n = normalizeSlug(u.slug);
  if (!unitByNorm.has(n)) unitByNorm.set(n, []);
  unitByNorm.get(n).push(u);
}

const results = { DEQIQ: [], YAXIN: [], TEK: [] };

for (const d of departments) {
  const exact = unitBySlug.get(d.slug);
  let match = null;
  let cat;
  if (exact) {
    cat = 'DEQIQ';
    match = exact;
  } else {
    const norm = normalizeSlug(d.slug);
    const candidates = unitByNorm.get(norm) ?? [];
    if (candidates.length) {
      cat = 'YAXIN';
      match = candidates[0];
    } else {
      cat = 'TEK';
    }
  }

  const contact = extractContact(d.about);
  const row = { department: d, match, contact };
  results[cat].push(row);

  console.log('');
  console.log(cat + '  ' + d.slug + (match ? '  ->  ' + match.slug : '  (uygun unit yoxdur)'));
  console.log('  ad (department)     : ' + d.name);
  if (match) console.log('  ad (unit)           : ' + match.name);
  console.log('  about (department)  : ' + (d.about ? d.about.length + ' simvol' : 'boş'));
  if (match) console.log('  unit.about doludur  : ' + (has(match.about) ? 'bəli' : 'xeyr'));
  console.log(
    '  mətndə tapılan      : direktor/müdir=' +
      (contact.name ?? '-') +
      '  tel=' +
      (contact.phone ?? '-') +
      '  e-poçt=' +
      (contact.email ?? '-') +
      '  ünvan=' +
      (contact.address ?? '-'),
  );
  const deptLink = strukturMenuSlugs.has(d.slug);
  const showUnitLink = match && match.slug !== d.slug;
  const unitLink = showUnitLink ? strukturMenuSlugs.has(match.slug) : false;
  console.log(
    '  menyu keçidi        : /struktur/' + d.slug + '=' + (deptLink ? 'VAR' : 'yox') +
      (showUnitLink ? '  /struktur/' + match.slug + '=' + (unitLink ? 'VAR' : 'yox') : ''),
  );
}

console.log('');
console.log('='.repeat(72));
console.log('XÜLASƏ');
console.log('='.repeat(72));
console.log('DEQIQ (slug eyni)            : ' + results.DEQIQ.length);
console.log('YAXIN (normallaşdırdıqda)    : ' + results.YAXIN.length + '  <-- əsas tapıntı');
console.log('TEK (uyğun unit yoxdur)      : ' + results.TEK.length);
console.log('');
console.log('Bu skript HEÇ NƏYƏ TOXUNMADI - yalnız oxudu.');
