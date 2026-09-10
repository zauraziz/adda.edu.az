// tools/check-program-gaps.mjs — F5.20f proqram doluluq lövhəsi.
//
// NİYƏ LAZIMDIR: check-content-gaps.mjs (F4.1) struktur bölmələri üçün eyni
// işi görür — bu, onun "görünən blok" fəlsəfəsinin proqram (`/ixtisaslar`)
// tərəfidir: xam sahə sayı yox, SƏHİFƏDƏ FAKTİKİ GÖRÜNƏN NƏ VAR onu ölçürük.
// `admissionScores`/`courses` üçün "dolu/boş" kifayət deyil — neçə IL/FƏNN
// dolu olduğu göstərilir (siyahı görünüşü F5.20d-dən sonra elə budur).
// `unit`/`faculty` TƏK sütun kimi sayılır (OR məntiqi, check-content-gaps.mjs-dəki
// "alts" ilə EYNİ) — proqram detal səhifəsində fakültə YA birbaşa `faculty`
// əlaqəsindən, YA DA `unit` → KAFEDRA_FACULTY ehtiyat zənciri ilə göstərilir.
//
// BU SKRİPT HEÇ NƏYƏ TOXUNMUR — yalnız oxuyur və raport verir.
//
//   node tools/check-program-gaps.mjs

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

const adminUrl = (uid, documentId) =>
  BASE + '/admin/content-manager/collection-types/' + uid + '/' + documentId + '?plugins[i18n][locale]=az';

// ────────────────────────────────────────────────────────────────────────
console.log('Strapi : ' + BASE);
await wake();

const programs = await all('/programs', {
  locale: 'az',
  'fields[0]': 'title',
  'fields[1]': 'slug',
  'fields[2]': 'code',
  'fields[3]': 'degree',
  'fields[4]': 'studyForm',
  'fields[5]': 'tuitionFee',
  'fields[6]': 'overview',
  'fields[7]': 'competencies',
  'fields[8]': 'careerPaths',
  'fields[9]': 'conventions',
  'fields[10]': 'practiceNote',
  'fields[11]': 'outcomes',
  'populate[languages]': true,
  'populate[admissionScores]': true,
  'populate[courses][fields][0]': 'code',
  'populate[faculty][fields][0]': 'slug',
  'populate[unit][fields][0]': 'slug',
  sort: 'slug:asc',
});

console.log('proqram: ' + programs.length);
console.log('-'.repeat(72));

// ────────────────────────────────────────────────────────────────────────
// Sütun tərifi — page.tsx (siyahı) + [slug]/page.tsx (detal) ilə EYNİ
// "görünür/görünmür" qaydası: boş sahə heç vaxt render olunmur.
// ────────────────────────────────────────────────────────────────────────
const COLUMNS = [
  { key: 'code', label: 'code', check: (p) => has(p.code) },
  { key: 'degree', label: 'degree', check: (p) => has(p.degree) },
  { key: 'studyForm', label: 'studyForm', check: (p) => has(p.studyForm) },
  { key: 'languages', label: 'languages', check: (p) => (p.languages ?? []).length > 0 },
  { key: 'tuitionFee', label: 'tuitionFee', check: (p) => has(p.tuitionFee) },
  {
    key: 'admissionScores',
    label: 'admissionScores',
    check: (p) => (p.admissionScores ?? []).length > 0,
    detail: (p) => {
      const n = (p.admissionScores ?? []).filter((s) => s.minScorePaid != null || s.minScoreFree != null).length;
      return n + ' il';
    },
  },
  { key: 'overview', label: 'overview', check: (p) => has(p.overview) },
  { key: 'competencies', label: 'competencies', check: (p) => has(p.competencies) },
  { key: 'careerPaths', label: 'careerPaths', check: (p) => has(p.careerPaths) },
  { key: 'conventions', label: 'conventions', check: (p) => has(p.conventions) },
  { key: 'practiceNote', label: 'practiceNote', check: (p) => has(p.practiceNote) },
  { key: 'outcomes', label: 'outcomes', check: (p) => has(p.outcomes) },
  {
    key: 'courses',
    label: 'courses',
    check: (p) => (p.courses ?? []).length > 0,
    detail: (p) => (p.courses ?? []).length + ' fənn',
  },
  {
    // F5.20f — TƏK sütun, OR məntiqi (bax fayl başlığı) — check-content-gaps.mjs
    // "alts" ilə EYNİ fəlsəfə: proqram detal səhifəsində fakültə YA `faculty`
    // əlaqəsindən, YA DA `unit`-dən (KAFEDRA_FACULTY ehtiyat zənciri) gəlir.
    key: 'unitFaculty',
    label: 'unit/faculty',
    check: (p) => Boolean(p.faculty?.slug || p.unit?.slug),
  },
];

const rows = programs.map((p) => {
  const cells = COLUMNS.map((c) => ({ key: c.key, label: c.label, ok: c.check(p), detail: c.detail?.(p) ?? null }));
  const filled = cells.filter((c) => c.ok).length;
  return { program: p, cells, filled, missing: cells.filter((c) => !c.ok) };
});

rows.sort((a, b) => a.filled - b.filled || azSort(a.program.title, b.program.title));

// ────────────────────────────────────────────────────────────────────────
const totalFilled = rows.reduce((s, r) => s + r.filled, 0);
const totalPossible = rows.length * COLUMNS.length;
const pct = totalPossible ? Math.round((totalFilled / totalPossible) * 100) : 0;

console.log('');
console.log('='.repeat(72));
console.log('ÜMUMİ DOLULUQ: ' + pct + '%   (' + totalFilled + ' / ' + totalPossible + ' xana dolu, ' + COLUMNS.length + ' sütun × ' + rows.length + ' proqram)');
console.log('='.repeat(72));

// ────────────────────────────────────────────────────────────────────────
// 1) Proqram cədvəli (az doludan çoxa doğru).
// ────────────────────────────────────────────────────────────────────────
console.log('\n1. PROQRAM CƏDVƏLİ (az dolu olandan çoxa doğru)\n');
for (const r of rows) {
  const bar = r.cells.map((c) => (c.ok ? '▓' : '░')).join('');
  console.log(
    '  ' + bar + '  ' + r.filled + '/' + COLUMNS.length + '   ' + r.program.title + '  (' + r.program.slug + ')',
  );
  if (r.missing.length) {
    console.log('      boş: ' + r.missing.map((c) => c.label).join(', '));
  }
  const filledDetails = r.cells.filter((c) => c.ok && c.detail);
  if (filledDetails.length) {
    console.log('      ' + filledDetails.map((c) => c.label + '=' + c.detail).join('  ·  '));
  }
  console.log('      admin: ' + adminUrl('api::program.program', r.program.documentId));
  console.log('');
}

// ────────────────────────────────────────────────────────────────────────
// 2) SÜRƏTLİ QAZANC — bir sahə ilə tam (14/14) olan proqramlar.
// ────────────────────────────────────────────────────────────────────────
console.log('='.repeat(72));
console.log('2. SÜRƏTLİ QAZANC — bir sahə doldur, proqram TAM olsun');
console.log('   (' + (COLUMNS.length - 1) + '/' + COLUMNS.length + ' dolu, YALNIZ 1 boşluq qalıb)');
console.log('='.repeat(72));
const quickWins = rows.filter((r) => r.missing.length === 1);
if (!quickWins.length) {
  console.log('\n  Yoxdur — heç bir proqram tək-sahə məsafəsində deyil.');
} else {
  for (const r of quickWins) {
    console.log('  ' + r.program.title + '  (' + r.program.slug + ')  ->  doldur: ' + r.missing[0].label);
  }
  console.log('\n  cəmi: ' + quickWins.length + ' tək-sahə fürsəti.');
}

// ────────────────────────────────────────────────────────────────────────
// 3) Sütun üzrə doluluq.
// ────────────────────────────────────────────────────────────────────────
console.log('\n' + '='.repeat(72));
console.log('3. SÜTUN ÜZRƏ DOLULUQ');
console.log('='.repeat(72));
for (const c of COLUMNS) {
  const filled = rows.filter((r) => r.cells.find((x) => x.key === c.key).ok).length;
  console.log('  ' + c.label.padEnd(16) + filled + '/' + rows.length);
}

console.log('\nBu skript HEÇ NƏYƏ TOXUNMADI — yalnız oxudu.');
