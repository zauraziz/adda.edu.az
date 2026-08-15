// tools/check-content-gaps.mjs — F4.1 məzmun doluluq lövhəsi.
//
// NİYƏ LAZIMDIR: `check:units` ümumi rəqəm verir (head 23/28, about 0/28),
// amma bu, iş siyahısı deyil. Bölmə səhifəsi (`/struktur/[slug]`) 5 BLOKDAN
// qurulur, hər blok bir neçə sahədən İSTƏNİLƏN BİRİ ilə açılır (OR məntiqi).
// Ona görə "12 sahədən 3-ü doludur" statistikası aldadıcıdır — ziyarətçi
// sahə saymır, blok görür. Bu alət hər bölmə üçün NEÇƏ BLOK render olunduğunu
// ölçür və HANSI TƏK SAHƏNİN doldurulması ən ucuz yolla bloku açacağını göstərir.
//
// BU SKRİPT HEÇ NƏYƏ TOXUNMUR — yalnız oxuyur və raport verir.
//
//   node tools/check-content-gaps.mjs
//
// Blok şərtləri `app/[locale]/struktur/[slug]/page.tsx` sətir 239-247-dən
// GƏLİR (kopyalanmayıb, oxunaqlı təkrar yazılıb — mənbə dəyişsə bura da
// yenilənməlidir):
//
//   blok1  mission || about || əsasnamə sənədi (documents, category=esasname)
//   blok2  head || heyət (person.unit ∪ roles[].unitName) || receptionHours
//   blok3  functions || services || onlineServices
//   blok4  building || floor || room || phoneExt || email || links
//   blok5  hesabat sənədi || xəbər || elan || alt bölmə

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.dirname(HERE);

const BASE =
  process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || 'https://adda-edu-az.onrender.com';
const PAGE = 100; // config/api.ts maxLimit = 100, daha boyuk deyer SESSIZCE kesilir

const azSort = (a, b) => String(a ?? '').localeCompare(String(b ?? ''), 'az');
const has = (v) => v !== null && v !== undefined && String(v).trim() !== '';

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

const adminUrl = (uid, documentId, withLocale) =>
  BASE + '/admin/content-manager/collection-types/' + uid + '/' + documentId +
  (withLocale ? '?plugins[i18n][locale]=az' : '');

// ────────────────────────────────────────────────────────────────────────
console.log('Strapi : ' + BASE);
await wake();

const units = await all('/units', {
  locale: 'az',
  'fields[0]': 'name',
  'fields[1]': 'slug',
  'fields[2]': 'mission',
  'fields[3]': 'about',
  'fields[4]': 'receptionHours',
  'fields[5]': 'functions',
  'fields[6]': 'services',
  'fields[7]': 'building',
  'fields[8]': 'floor',
  'fields[9]': 'room',
  'fields[10]': 'phoneExt',
  'fields[11]': 'email',
  'populate[onlineServices]': true,
  'populate[links]': true,
  'populate[head][fields][0]': 'name',
  'populate[head][fields][1]': 'slug',
  'populate[children][fields][0]': 'slug',
  'populate[children][fields][1]': 'name',
  sort: 'slug:asc',
});

const documents = await all('/documents', {
  'fields[0]': 'title',
  'fields[1]': 'category',
  'populate[units][fields][0]': 'slug',
});

const people = await all('/people', {
  'fields[0]': 'name',
  'fields[1]': 'slug',
  'fields[2]': 'phone',
  'fields[3]': 'office',
  'fields[4]': 'academicTitle',
  'populate[photo][fields][0]': 'url',
  'populate[unit][fields][0]': 'slug',
  'populate[unit][fields][1]': 'name',
  'populate[roles]': true,
});

const articles = await all('/articles', {
  locale: 'az',
  'fields[0]': 'title',
  'populate[unit][fields][0]': 'slug',
  'populate[tags][fields][0]': 'slug',
});

const announcements = await all('/announcements', {
  locale: 'az',
  'fields[0]': 'title',
  'populate[unit][fields][0]': 'slug',
  'populate[tags][fields][0]': 'slug',
});

console.log(
  'bölmə: ' + units.length + '  ·  sənəd: ' + documents.length + '  ·  şəxs: ' + people.length +
  '  ·  xəbər: ' + articles.length + '  ·  elan: ' + announcements.length,
);
console.log('-'.repeat(72));

// ────────────────────────────────────────────────────────────────────────
// Qruplaşdırma — səhifənin özündəki hər sorğunu təkrarlamaq yerinə (28 × 4
// sorğu) hamısını BİR DƏFƏ çəkib yaddaşda qruplaşdırırıq.
// ────────────────────────────────────────────────────────────────────────
const unitSlugs = new Set(units.map((u) => u.slug));

const docsByUnit = new Map(); // slug -> document[]
for (const d of documents) {
  for (const u of d.units ?? []) {
    if (!docsByUnit.has(u.slug)) docsByUnit.set(u.slug, []);
    docsByUnit.get(u.slug).push(d);
  }
}

// F3.22-dəki HİBRİD qayda: person.unit (relasiya) ∪ roles[].unitName (sətir).
const unitByName = new Map(units.map((u) => [u.name, u]));
const staffByUnit = new Map(); // slug -> person[]
for (const p of people) {
  const slugsMatched = new Set();
  if (p.unit?.slug) slugsMatched.add(p.unit.slug);
  for (const r of p.roles ?? []) {
    if (!r.unitName) continue;
    const u = unitByName.get(r.unitName);
    if (u) slugsMatched.add(u.slug);
  }
  for (const slug of slugsMatched) {
    if (!staffByUnit.has(slug)) staffByUnit.set(slug, []);
    staffByUnit.get(slug).push(p);
  }
}

// Xəbər/elan HİBRİD qaydası: `unit` əlaqəsi VƏ YA bölmə slug-ına bərabər tag.
function bumpHybrid(map, item) {
  const slugs = new Set();
  if (item.unit?.slug) slugs.add(item.unit.slug);
  for (const t of item.tags ?? []) if (unitSlugs.has(t.slug)) slugs.add(t.slug);
  for (const s of slugs) map.set(s, (map.get(s) ?? 0) + 1);
}
const articleCountByUnit = new Map();
for (const a of articles) bumpHybrid(articleCountByUnit, a);
const announcementCountByUnit = new Map();
for (const a of announcements) bumpHybrid(announcementCountByUnit, a);

// ────────────────────────────────────────────────────────────────────────
// Blok hesablaması — page.tsx sətir 239-247 ilə EYNİ məntiq.
// Hər blok üçün "alts" = OR-un TƏRƏFLƏRİ: HƏR HANSI biri doğru olsa blok
// açılır. `field: true` = sadə mətn/say sahəsi (admin paneldə birbaşa yazılır,
// heç bir əlaqə/yükləmə lazım deyil) — SÜRƏTLİ QAZANC bunlardan qurulur.
// ────────────────────────────────────────────────────────────────────────
const rows = units.map((u) => {
  const docs = docsByUnit.get(u.slug) ?? [];
  const esasname = docs.filter((d) => d.category === 'esasname');
  const hesabat = docs.filter((d) => d.category === 'hesabat');
  const staff = staffByUnit.get(u.slug) ?? [];
  const articleCount = articleCountByUnit.get(u.slug) ?? 0;
  const announcementCount = announcementCountByUnit.get(u.slug) ?? 0;
  const subunits = u.children ?? [];
  const onlineServices = u.onlineServices ?? [];
  const links = u.links ?? [];

  const blocks = [
    {
      n: 1,
      alts: [
        { name: 'mission', ok: has(u.mission), field: true },
        { name: 'about', ok: has(u.about), field: true },
        { name: 'əsasnamə sənədi (documents)', ok: esasname.length > 0, field: false },
      ],
    },
    {
      n: 2,
      alts: [
        { name: 'head (rəhbər təyinatı)', ok: Boolean(u.head), field: false },
        { name: 'heyət (person.unit/roles)', ok: staff.length > 0, field: false },
        { name: 'receptionHours', ok: has(u.receptionHours), field: true },
      ],
    },
    {
      n: 3,
      alts: [
        { name: 'functions', ok: has(u.functions), field: true },
        { name: 'services', ok: has(u.services), field: true },
        { name: 'onlineServices', ok: onlineServices.length > 0, field: false },
      ],
    },
    {
      n: 4,
      alts: [
        { name: 'building', ok: has(u.building), field: true },
        { name: 'floor', ok: has(u.floor), field: true },
        { name: 'room', ok: has(u.room), field: true },
        { name: 'phoneExt', ok: has(u.phoneExt), field: true },
        { name: 'email', ok: has(u.email), field: true },
        { name: 'links', ok: links.length > 0, field: false },
      ],
    },
    {
      n: 5,
      alts: [
        { name: 'hesabat sənədi (documents)', ok: hesabat.length > 0, field: false },
        { name: 'xəbər (article)', ok: articleCount > 0, field: false },
        { name: 'elan (announcement)', ok: announcementCount > 0, field: false },
        { name: 'alt bölmə (children)', ok: subunits.length > 0, field: false },
      ],
    },
  ].map((b) => ({ ...b, has: b.alts.some((a) => a.ok) }));

  const openCount = blocks.filter((b) => b.has).length;
  return { unit: u, blocks, openCount, staff, esasname, hesabat };
});

rows.sort((a, b) => a.openCount - b.openCount || azSort(a.unit.name, b.unit.name));

// ────────────────────────────────────────────────────────────────────────
// 6) Başlıqda tək ədəd.
// ────────────────────────────────────────────────────────────────────────
const totalOpen = rows.reduce((s, r) => s + r.openCount, 0);
const totalPossible = units.length * 5;
const pct = totalPossible ? Math.round((totalOpen / totalPossible) * 100) : 0;

console.log('');
console.log('='.repeat(72));
console.log('ÜMUMİ DOLULUQ: ' + pct + '%   (' + totalOpen + ' / ' + totalPossible + ' blok render olunur)');
console.log('='.repeat(72));

// ────────────────────────────────────────────────────────────────────────
// 1) Bölmə cədvəli.
// ────────────────────────────────────────────────────────────────────────
console.log('\n1. BÖLMƏ CƏDVƏLİ (az render olunandan çoxa doğru)\n');
for (const r of rows) {
  const bar = r.blocks.map((b) => (b.has ? '▓' : '░')).join('');
  console.log('  ' + bar + '  ' + r.openCount + '/5   ' + r.unit.name + '  (' + r.unit.slug + ')');
  const missing = r.blocks.filter((b) => !b.has);
  for (const b of missing) {
    const altNames = b.alts.map((a) => a.name).join(' və ya ');
    console.log('      blok' + b.n + ' bağlıdır — açacaq: ' + altNames);
  }
  console.log('      admin: ' + adminUrl('api::unit.unit', r.unit.documentId, true));
  console.log('');
}

// ────────────────────────────────────────────────────────────────────────
// 2) SÜRƏTLİ QAZANC — bir sadə sahə ilə blok açılan hallar.
// ────────────────────────────────────────────────────────────────────────
console.log('='.repeat(72));
console.log('2. SÜRƏTLİ QAZANC — bir sahə doldur, blok açılsın');
console.log('   (minimum iş, maksimum görünən nəticə — ƏN YÜKSƏK PRİORİTET)');
console.log('='.repeat(72));
const quickWins = [];
for (const r of rows) {
  for (const b of r.blocks) {
    if (b.has) continue;
    const fieldAlts = b.alts.filter((a) => a.field && !a.ok);
    if (fieldAlts.length) quickWins.push({ unit: r.unit, block: b.n, fields: fieldAlts.map((a) => a.name) });
  }
}
if (!quickWins.length) {
  console.log('\n  Yoxdur — qalan bütün bağlı bloklar sadə sahədən daha çox iş tələb edir.');
} else {
  for (const q of quickWins) {
    console.log(
      '  blok' + q.block + '  ' + q.unit.name + '  (' + q.unit.slug + ')  ->  doldur: ' + q.fields.join(' / '),
    );
  }
  console.log('\n  cəmi: ' + quickWins.length + ' tək-sahə fürsəti.');
}

// ────────────────────────────────────────────────────────────────────────
// 3) Əsasnamə boşluğu.
// ────────────────────────────────────────────────────────────────────────
console.log('\n' + '='.repeat(72));
console.log('3. ƏSASNAMƏ BOŞLUĞU');
console.log('='.repeat(72));
console.log(
  '  CLAUDE.md «Əsasnamələr» cədvəlinə görə 17 bölmə əsasnamə tələb edir: 8 tək\n' +
  '  bölmə (unit tipi) + 7 kafedra (department tipi) + 2 fakültə (faculty tipi).\n' +
  '  (013 və 020-nin "Personal" sətirləri EYNİ bölməyə düşür — 011+012+013/020+\n' +
  '  015+016+018+020-təsərrüfat+021 = 8 unikal, cəmi 8+7+2=17.)',
);
console.log('');
console.log('  document.units əlaqəsi YALNIZ `api::unit.unit`-i hədəfləyir (schema.json');
console.log('  yoxlanıldı) — `department` (kafedra) və `faculty` (fakültə) tiplərində');
console.log('  sənəd bağlamaq üçün HEÇ BİR sahə YOXDUR. Kafedra/fakültə əsasnamələri');
console.log('  hazırkı sxemlə əlaqələndirilə BİLMƏZ — bu, F4.1-in tapdığı sxem boşluğudur.');

const ESASNAME_UNIT_TARGETS = [
  { doc: '011', slug: 'elmi-tedqiqat-ve-beynelxalq-elaqeler-sobesi' },
  { doc: '012', slug: 'informasiya-resurs-merkezi' },
  { doc: '013/020', slug: 'personalin-idareedilmesi-emek-haqqi-ve-karguzarliq-sobesi' },
  { doc: '015', slug: 'muhasibat-ucotu-ve-hesabati-sobesi' },
  { doc: '016', slug: 'telim-tedris-merkezi' },
  { doc: '018', slug: 'metbee' },
  { doc: '020', slug: 'teserrufat-isleri-sobesi' },
  { doc: '021', slug: 'tedris-proseslerinin-teskili-sobesi' },
];
console.log('\n  8 unit-tipli hədəf (sənəd № → slug):');
let unitTargetsFound = 0;
for (const t of ESASNAME_UNIT_TARGETS) {
  const u = units.find((x) => x.slug === t.slug);
  if (!u) {
    console.log('    ' + t.doc.padEnd(8) + t.slug + '  <-- TAPILMADI (slug dəyişibmi?)');
    continue;
  }
  const doc = docsByUnit.get(u.slug) ?? [];
  const ok = doc.some((d) => d.category === 'esasname');
  if (ok) unitTargetsFound++;
  console.log('    ' + t.doc.padEnd(8) + u.name + '  ' + (ok ? 'VAR' : 'YOXDUR'));
}
console.log('\n  nəticə: ' + unitTargetsFound + '/8 unit-tipli bölmədə əsasnamə var.');
console.log('  bütün sistemdə cəmi ' + documents.filter((d) => d.category === 'esasname').length + ' sənəd category=esasname.');

// ────────────────────────────────────────────────────────────────────────
// 4) Rəhbər kartları.
// ────────────────────────────────────────────────────────────────────────
console.log('\n' + '='.repeat(72));
console.log('4. RƏHBƏR KARTLARI (head təyin olunmuş şəxslər)');
console.log('='.repeat(72));

const headSlugs = [...new Set(units.filter((u) => u.head).map((u) => u.head.slug))];
const headsBySlug = new Map(people.filter((p) => headSlugs.includes(p.slug)).map((p) => [p.slug, p]));

const FIELDS = ['photo', 'phone', 'office', 'academicTitle'];
const fill = Object.fromEntries(FIELDS.map((f) => [f, 0]));
const headRows = [];
for (const slug of headSlugs) {
  const p = headsBySlug.get(slug);
  if (!p) {
    headRows.push({ missing: true, slug });
    continue;
  }
  const flags = {};
  for (const f of FIELDS) {
    const v = f === 'photo' ? p.photo?.url : p[f];
    flags[f] = has(v);
    if (flags[f]) fill[f]++;
  }
  headRows.push({ person: p, flags });
}
headRows.sort((a, b) => azSort(a.person?.name ?? a.slug, b.person?.name ?? b.slug));

console.log('  rəhbər sayı: ' + headSlugs.length);
for (const f of FIELDS) console.log('    ' + f.padEnd(14) + fill[f] + '/' + headSlugs.length);
console.log('');
for (const r of headRows) {
  if (r.missing) {
    console.log('  ! head relasiyası var, person tapılmadı: ' + r.slug);
    continue;
  }
  const mark = (ok) => (ok ? '✓' : '·');
  console.log(
    '  ' + FIELDS.map((f) => mark(r.flags[f])).join(' ') + '   ' + r.person.name,
  );
  console.log('      admin: ' + adminUrl('api::person.person', r.person.documentId, false));
}

// ────────────────────────────────────────────────────────────────────────
console.log('\n' + '='.repeat(72));
console.log('QEYD: rəhbərsiz 5 bölmə (Rektor — vakant, Elmi Şura, Elmi işlər üzrə');
console.log('prorektor, Təlim Tədris Mərkəzi, Dənizçilik Kolleci) sahə boşluğu DEYİL —');
console.log('kadr məsələsidir, bu lövhədə "blok2 bağlıdır" kimi görünsə də ayrıca izah');
console.log('tələb edir.');
console.log('');
console.log('Bu skript HEÇ NƏYƏ TOXUNMADI — yalnız oxudu.');
