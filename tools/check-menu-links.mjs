// tools/check-menu-links.mjs — menyu keçidlərinin auditi.
//
// NİYƏ LAZIMDIR: `menu` single type-də ~200 keçid var, admin paneldən əl ilə
// yazılıb. Bir Next.js marşrutu silinsə/adı dəyişsə, ya da Strapi-dəki bir
// slug dəyişsə, menyu keçidi SƏSSİZCƏ qırılır — tsc bunu tutmur, çünki href
// sadəcə string-dir (bax: tools/check-audiences.mjs, eyni problem).
//
// BU SKRİPT HEÇ NƏYƏ TOXUNMUR — yalnız oxuyur və raport verir.
//
//   node tools/check-menu-links.mjs
//
// Marşrut siyahısı `adda-nextjs/app/[locale]/**/page.tsx`-dən QURULUR,
// əl ilə yazılmır — səhifə əlavə/silinəndə bu fayl dəyişməli deyil.
//
// Dörd kateqoriya:
//   OK          — Next.js marşrutu var (statik, ya da `/hazirlanir/...`
//                 arxasında dayanan «hazır deyil» sponge-route)
//   DINAMIK     — [slug]/[tip] marşrutudur, slug/tip mənbədə TAPILIB
//   PLASEHOLDER — url boşdur və ya '#'
//   QIRIQ       — marşrut tapılmadı, YA DA dinamik seqmentin dəyəri
//                 mənbədə yoxdur (404 verəcək)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.dirname(HERE);
const NEXT = path.join(REPO, 'adda-nextjs');

const BASE =
  process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || 'https://adda-edu-az.onrender.com';
const LOCALES = ['az', 'ru', 'en'];

const read = (p) => fs.readFileSync(p, 'utf8');

// ── Azərbaycan diakritik bükməsi — etiket müqayisəsi üçün (CLAUDE.md tələsi). ──
const azLower = (s) => String(s ?? '').replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
const FOLD_MAP = { ə: 'e', ş: 's', ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ü: 'u' };
const fold = (s) => azLower(s).replace(/[əşçğıöü]/g, (c) => FOLD_MAP[c] ?? c);

// ────────────────────────────────────────────────────────────────────────
// 1. Next.js marşrut cədvəli — fayl sistemindən.
// ────────────────────────────────────────────────────────────────────────
const LOCALE_DIR = path.join(NEXT, 'app', '[locale]');

function walkPages(dir, segs = []) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith('_') || ent.name.startsWith('.')) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...walkPages(full, [...segs, ent.name]));
    } else if (ent.name === 'page.tsx' || ent.name === 'page.ts') {
      out.push(segs);
    }
  }
  return out;
}

const ROUTES = walkPages(LOCALE_DIR).map((segs) => ({
  display: '/' + segs.join('/'),
  parts: segs.map((s) => {
    const m = /^\[(\.\.\.)?(.+)\]$/.exec(s);
    return m ? { dynamic: true, name: m[2] } : { dynamic: false, raw: s };
  }),
}));

/** URL yolunu marşrut cədvəlinə uyğunlaşdırır. Uyğun gəlməsə `null`. */
function matchRoute(urlPath) {
  const segs = urlPath.split('/').filter(Boolean);
  for (const r of ROUTES) {
    if (r.parts.length !== segs.length) continue;
    let ok = true;
    const dyn = {};
    for (let i = 0; i < segs.length; i++) {
      const p = r.parts[i];
      if (p.dynamic) dyn[p.name] = decodeURIComponent(segs[i]);
      else if (p.raw !== segs[i]) { ok = false; break; }
    }
    if (ok) return { route: r, dyn, isDynamic: r.parts.some((p) => p.dynamic) };
  }
  return null;
}

// ────────────────────────────────────────────────────────────────────────
// 2. Statik mənbələr — Strapi-də DEYİL, repo-dadır.
// ────────────────────────────────────────────────────────────────────────

/** check-audiences.mjs-dəki texnika: TS massivini mətndən çıxarıb eval edir. */
function extractArrayLiteral(src, constName) {
  const at = src.indexOf('export const ' + constName);
  if (at === -1) return [];
  let body = src.slice(src.indexOf('=', at) + 1);
  body = body.slice(0, body.lastIndexOf(']') + 1);
  try {
    return eval('(' + body + ')');
  } catch {
    return [];
  }
}

const AUDIENCES = extractArrayLiteral(read(path.join(NEXT, 'lib', 'audiences.ts')), 'AUDIENCES');
const BUNLAR_UCUN_SLUGS = new Set(AUDIENCES.map((a) => a.slug));

const heyetSrc = read(path.join(NEXT, 'app', '[locale]', 'heyet', '[tip]', 'page.tsx'));
const HEYET_TIP_SLUGS = new Set([...heyetSrc.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]));

// F3.27: `menu` i18n-dən çıxdı — ru/en etiketləri artıq `tr()` (T + MENU_T,
// lib/i18n.ts) vasitəsilə tərcümə olunur. `T`/`MENU_T` `export` DEYİL, ona
// görə `extractArrayLiteral`-ın `export const` axtarışı işləməz — mötərizə
// dərinliyi ilə balanslaşdırılmış oxuma lazımdır (massiv `];`-ə qədər fayl
// davam edir, `lastIndexOf(']')` texnikası bura yaramır).
function extractBalancedArray(src, marker) {
  const at = src.indexOf(marker);
  if (at === -1) return [];
  // `indexOf('[', at)` özü yox — marker `const T: Array<[string, string,
  // string]> = [...]` şəklindədir, tip annotasiyasındaki `[` əvvəl gəlir.
  // Massivin özü `=` işarəsindən SONRA başlayır.
  const eq = src.indexOf('=', at);
  const start = src.indexOf('[', eq);
  if (start === -1) return [];
  let depth = 0;
  let i = start;
  for (; i < src.length; i++) {
    const c = src[i];
    if (c === "'" || c === '"' || c === '`') {
      const quote = c;
      i++;
      while (i < src.length && src[i] !== quote) {
        if (src[i] === '\\') i++;
        i++;
      }
      continue;
    }
    if (c === '[') depth++;
    else if (c === ']') {
      depth--;
      if (depth === 0) { i++; break; }
    }
  }
  try {
    return eval('(' + src.slice(start, i) + ')');
  } catch {
    return [];
  }
}

const i18nSrc = read(path.join(NEXT, 'lib', 'i18n.ts'));
const T_ENTRIES = extractBalancedArray(i18nSrc, 'const T:');
const MENU_T_ENTRIES = extractBalancedArray(i18nSrc, 'const MENU_T:');
// tr() T + MENU_T-ni birləşdirib az-exact-match axtarır (bax: lib/i18n.ts TR_MAP) —
// eyni əhatəni yoxlamaq üçün ikisi birləşdirilir, YALNIZ MENU_T deyil.
const TRANSLATED_AZ = new Set([...T_ENTRIES, ...MENU_T_ENTRIES].map((row) => row[0]));

// ────────────────────────────────────────────────────────────────────────
// 3. Strapi — content type üzrə slug siyahıları (lazım olanda, keşlənir).
// ────────────────────────────────────────────────────────────────────────

/** Prefiks -> hansı Strapi content type(lər)i bu slug-ı təsdiqləyə bilər. */
const PREFIX_TYPES = {
  struktur: ['units', 'departments'],
  emekdas: ['people'],
  xeberler: ['articles'],
  elanlar: ['announcements'],
  tedbirler: ['events'],
  sehife: ['pages'],
  ixtisaslar: ['programs'],
  fakulteler: ['faculties'],
  'sabiq-rektorlar': ['rectors'],
};
const TYPE_INFO = {
  units: { endpoint: '/units', localized: true, nameField: 'name' },
  departments: { endpoint: '/departments', localized: true, nameField: 'name' },
  people: { endpoint: '/people', localized: false, nameField: 'name' },
  articles: { endpoint: '/articles', localized: true, nameField: 'title' },
  announcements: { endpoint: '/announcements', localized: true, nameField: 'title' },
  events: { endpoint: '/events', localized: true, nameField: 'title' },
  pages: { endpoint: '/pages', localized: true, nameField: 'title' },
  programs: { endpoint: '/programs', localized: true, nameField: 'title' },
  faculties: { endpoint: '/faculties', localized: true, nameField: 'name' },
  rectors: { endpoint: '/rectors', localized: true, nameField: 'name' },
};
// TƏKLİF indeksi bu tiplərdən qurulur — xəbər/elan/tədbir/şəxs YOXDUR:
// menyu bəndi struktur səhifəsinə işarə edir, min-bir xəbərə yox.
const SUGGEST_TYPES = ['units', 'departments', 'faculties', 'programs', 'rectors', 'pages'];

let coldStartWarned = false;
async function api(pathname, params) {
  const url = new URL('/api' + pathname, BASE);
  for (const [k, v] of Object.entries(params || {})) url.searchParams.set(k, String(v));
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(70000) });
      // 404 KEÇİCİ XƏTA DEYİL — single type-da bu lokalın sətri yoxdur
      // demekdir (məs. `menu` yalnız `az`-da doludur). Yenidən cəhd faydasızdır.
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

/** maxLimit=100 — səhifələmə məcburidir. */
async function fetchAllRows(endpoint, params) {
  const out = [];
  for (let page = 1; page <= 60; page++) {
    const j = await api(endpoint, { ...params, 'pagination[page]': page, 'pagination[pageSize]': 100 });
    const rows = j?.data ?? [];
    out.push(...rows);
    const pc = j?.meta?.pagination?.pageCount ?? 1;
    if (!rows.length || page >= pc) break;
  }
  return out;
}

const slugCache = new Map(); // key: `${type}:${locale}` -> [{slug,label}]
async function getRows(type, locale) {
  const info = TYPE_INFO[type];
  const key = type + ':' + (info.localized ? locale : '-');
  if (slugCache.has(key)) return slugCache.get(key);
  const params = { 'fields[0]': 'slug', 'fields[1]': info.nameField };
  if (info.localized) params.locale = locale;
  const rows = await fetchAllRows(info.endpoint, params);
  const out = rows.map((r) => ({ slug: r.slug, label: r[info.nameField] ?? r.slug }));
  slugCache.set(key, out);
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

async function getMenuRaw(locale) {
  const j = await api('/menu', {
    locale,
    'populate[esasMenyu][populate][groups][populate][links]': true,
    'populate[ustMenyu][populate][groups][populate][links]': true,
    'populate[eAkademiya][populate][cards]': true,
    'populate[istifadeciQruplari]': true,
    'populate[suretliKecidler]': true,
    'populate[footerMenyusu][populate][links]': true,
  });
  return j?.data ?? null;
}

// ────────────────────────────────────────────────────────────────────────
// 4. Menyudan keçid siyahısını çıxar: {trail, label, url}
// ────────────────────────────────────────────────────────────────────────
function extractLinks(menu) {
  const links = [];
  const push = (trail, label, url) => {
    if (typeof url === 'string') links.push({ trail, label: label ?? '', url });
  };

  for (const [sectionKey, sectionLabel] of [
    ['esasMenyu', 'Əsas menyu'],
    ['ustMenyu', 'Üst menyu'],
  ]) {
    for (const cat of menu?.[sectionKey] ?? []) {
      push([sectionLabel], cat.label, cat.url);
      for (const g of cat.groups ?? []) {
        for (const l of g.links ?? []) push([sectionLabel, cat.label, g.title].filter(Boolean), l.label, l.url);
      }
    }
  }

  if (menu?.eAkademiya) {
    for (const c of menu.eAkademiya.cards ?? []) push(['E-Akademiya', menu.eAkademiya.title].filter(Boolean), c.label, c.url);
  }
  for (const l of menu?.istifadeciQruplari ?? []) push(['İstifadəçi qrupları'], l.label, l.url);
  for (const q of menu?.suretliKecidler ?? []) push(['Sürətli keçidlər'], q.label, q.url);
  for (const col of menu?.footerMenyusu ?? []) {
    for (const l of col.links ?? []) push(['Footer', col.title].filter(Boolean), l.label, l.url);
  }

  return links;
}

// ────────────────────────────────────────────────────────────────────────
// 5. Təsnifat.
// ────────────────────────────────────────────────────────────────────────
const ABSOLUTE = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
const PREFIXED = /^\/(?:az|ru|en)(?:\/|$)/;

async function classify(url, locale) {
  const raw = (url ?? '').trim();
  if (!raw || raw === '#') return { cat: 'PLASEHOLDER' };
  if (ABSOLUTE.test(raw)) return { cat: 'OK', note: 'xarici' };
  if (!raw.startsWith('/')) return { cat: 'QIRIQ', note: 'yol / ilə başlamır' };

  const clean = (PREFIXED.test(raw) ? raw.replace(PREFIXED, '/') : raw).split(/[?#]/)[0];
  const match = matchRoute(clean === '' ? '/' : clean);
  if (!match) return { cat: 'QIRIQ', note: 'marşrut yoxdur' };

  if (!match.isDynamic) {
    // `/hazirlanir/...` statik seqmentdir, amma bura düşməz (o, `[slug]` altındadır).
    return { cat: 'OK' };
  }

  const prefix = clean.split('/').filter(Boolean)[0];
  if (prefix === 'hazirlanir') return { cat: 'OK', note: '/hazirlanir (hələ məzmunsuz)' };
  if (prefix === 'bunlar-ucun') {
    const slug = match.dyn.slug;
    return BUNLAR_UCUN_SLUGS.has(slug)
      ? { cat: 'DINAMIK', ok: true }
      : { cat: 'QIRIQ', note: '«' + slug + '» audiences.ts-də yoxdur' };
  }
  if (prefix === 'heyet') {
    const tip = match.dyn.tip;
    return HEYET_TIP_SLUGS.has(tip)
      ? { cat: 'DINAMIK', ok: true }
      : { cat: 'QIRIQ', note: '«' + tip + '» heyet/[tip] TABS-da yoxdur' };
  }

  const types = PREFIX_TYPES[prefix];
  if (!types) return { cat: 'QIRIQ', note: 'naməlum dinamik marşrut: ' + prefix };

  const slug = match.dyn.slug;
  for (const t of types) {
    const rows = await getRows(t, locale);
    if (rows.some((r) => r.slug === slug)) return { cat: 'DINAMIK', ok: true, foundIn: t };
  }
  return { cat: 'QIRIQ', note: '«' + slug + '» ' + types.join('/') + '-də (' + locale + ') tapılmadı' };
}

// ────────────────────────────────────────────────────────────────────────
// 6. PLASEHOLDER təklifi — etiketə görə mövcud marşrut/slug.
// ────────────────────────────────────────────────────────────────────────
const STATIC_LABELS = [
  ['Struktur', '/struktur'],
  ['Rəhbərlik', '/rehberlik'],
  ['Tarix', '/tarix'],
  ['Xəbərlər', '/xeberler'],
  ['Elanlar', '/elanlar'],
  ['Tədbirlər', '/tedbirler'],
  ['İxtisaslar', '/ixtisaslar'],
  ['Fakültələr', '/fakulteler'],
  ['Sabiq rektorlarımız', '/sabiq-rektorlar'],
  ['Heyət', '/heyet'],
  ['Profil', '/profil'],
  ['Profilim', '/profil'],
  ['AI köməkçi', '/kopilot'],
];

async function buildSuggestIndex(locale) {
  const exact = new Map(); // foldedLabel -> url
  const add = (label, url) => {
    const k = fold(label);
    if (k && !exact.has(k)) exact.set(k, url);
  };
  for (const [label, url] of STATIC_LABELS) add(label, url);
  for (const t of SUGGEST_TYPES) {
    const prefix = Object.entries(PREFIX_TYPES).find(([, types]) => types.includes(t))?.[0];
    if (!prefix) continue;
    for (const row of await getRows(t, locale)) add(row.label, '/' + prefix + '/' + row.slug);
  }
  return exact;
}

function suggest(label, index) {
  const k = fold(label);
  return k ? index.get(k) ?? null : null;
}

// ────────────────────────────────────────────────────────────────────────
// 7. İcra.
// ────────────────────────────────────────────────────────────────────────
console.log('Strapi     : ' + BASE);
console.log('Marşrutlar : ' + ROUTES.length + ' (app/[locale]/**/page.tsx)');
console.log('«Bunlar üçün» slug: ' + BUNLAR_UCUN_SLUGS.size + '  ·  heyet/[tip] slug: ' + HEYET_TIP_SLUGS.size);
console.log('tr() lüğəti: T ' + T_ENTRIES.length + ' + MENU_T ' + MENU_T_ENTRIES.length + ' giriş (' + TRANSLATED_AZ.size + ' unikal az mətn)');
await wake();

let grandTotal = 0;
const grandPlaceholders = [];
const grandBroken = [];
const grandUntranslated = [];

for (const locale of LOCALES) {
  console.log('\n' + '='.repeat(70));
  console.log('LOKAL: ' + locale);
  console.log('='.repeat(70));

  const menu = await getMenuRaw(locale);
  const links = extractLinks(menu);
  console.log('keçid sayı: ' + links.length);

  if (!links.length) {
    console.log('  (bu dildə menyu boşdur — Strapi-də ru/en sətri yoxdur)');
    continue;
  }

  const counts = { OK: 0, DINAMIK: 0, PLASEHOLDER: 0, QIRIQ: 0 };
  const okKinds = { real: 0, xarici: 0, hazirlanir: 0 };
  const placeholders = [];
  const broken = [];

  for (const l of links) {
    const r = await classify(l.url, locale);
    counts[r.cat]++;
    if (r.cat === 'OK') {
      if (r.note === 'xarici') okKinds.xarici++;
      else if (r.note?.startsWith('/hazirlanir')) okKinds.hazirlanir++;
      else okKinds.real++;
    }
    if (r.cat === 'PLASEHOLDER') placeholders.push(l);
    if (r.cat === 'QIRIQ') broken.push({ ...l, note: r.note });
  }

  grandTotal += links.length;

  console.log('');
  console.log('  OK          : ' + counts.OK + '  (həqiqi: ' + okKinds.real + ', /hazirlanir: ' + okKinds.hazirlanir + ', xarici: ' + okKinds.xarici + ')');
  console.log('  DINAMIK     : ' + counts.DINAMIK + '  (slug/tip mənbədə tapıldı)');
  console.log('  PLASEHOLDER : ' + counts.PLASEHOLDER + '  (\'#\' və ya boş)');
  console.log('  QIRIQ       : ' + counts.QIRIQ + '  (marşrut/slug yoxdur)');

  if (placeholders.length) {
    console.log('\n  PLASEHOLDER siyahısı + təklif:');
    const suggestIndex = await buildSuggestIndex(locale);
    for (const l of placeholders) {
      const s = suggest(l.label, suggestIndex);
      const where = l.trail.join(' / ');
      console.log(
        '    ' + where + '  ->  «' + l.label + '»' + (s ? '    TƏKLİF: ' + s : ''),
      );
      grandPlaceholders.push({ locale, where, label: l.label, suggestion: s });
    }
  }

  if (broken.length) {
    console.log('\n  QIRIQ siyahısı:');
    for (const l of broken) {
      const where = l.trail.join(' / ');
      console.log('    ' + where + '  ->  «' + l.label + '»  (' + l.url + ')  — ' + l.note);
      grandBroken.push({ locale, where, label: l.label, url: l.url, note: l.note });
    }
  }

  // F3.27: ru/en indi eyni `az` mənbədən qidalanır (menu i18n-dən çıxdı) —
  // `tr()` tapmadığı etiket üçün SƏSSİZCƏ az mətni qaytarır (səhifə sınmır,
  // amma qarışıq dil görünür). Bura düşməz — yalnız RAPORT edir.
  if (locale !== 'az') {
    const seen = new Set();
    const untranslated = [];
    for (const l of links) {
      const label = (l.label ?? '').trim();
      if (!label || seen.has(label)) continue;
      seen.add(label);
      if (!TRANSLATED_AZ.has(label)) untranslated.push(label);
    }
    if (untranslated.length) {
      console.log('\n  tr()-də TƏRCÜMƏSİ YOXDUR (' + untranslated.length + ' unikal etiket — az mətni görünəcək):');
      for (const lbl of untranslated) console.log('    «' + lbl + '»');
    } else {
      console.log('\n  tr() əhatəsi tam — bütün etiketlər T/MENU_T-də var.');
    }
    grandUntranslated.push(...untranslated.map((label) => ({ locale, label })));
  }
}

console.log('\n' + '='.repeat(70));
console.log('XÜLASƏ');
console.log('='.repeat(70));
console.log('cəmi yoxlanan keçid   : ' + grandTotal);
console.log('PLASEHOLDER (3 dil)   : ' + grandPlaceholders.length);
console.log('QIRIQ (3 dil)         : ' + grandBroken.length);
console.log('TƏRCÜMƏSİ YOX (ru+en) : ' + grandUntranslated.length + ' (unikal etiket × dil)');
console.log('');
console.log('Bu skript HEÇ NƏYƏ TOXUNMADI — yalnız oxudu.');

if (grandBroken.length) process.exit(1);
