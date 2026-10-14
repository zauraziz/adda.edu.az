// F5.51 — köhnə saytın 15.07–14.10.2026 xəbər və elanları → Strapi seed məzmunu.
//
// Mənbə: data/f551-oldsite.json — brauzerdən (14.10.2026) extract.mjs-in eyni
// qaydası ilə: başlıq + tarix `span.news-title`, mətn `span.news-text`
// (paylaşım/qalereya bloku çıxarılıb) → Markdown, qalereya `photogallery/{id}`.
// Mətnlər köçürmədən sonra sha256 ilə brauzerdəki nüsxə ilə tutuşdurulub.
//
// Çıxış: adda-strapi/src/utils/news-import-content.ts (AVTOMATİK — əl ilə yazma).
//   node f551-news.mjs
//
// Redaktə (aşağıda EDITS — hər əvəzləmə mətndə OLMALIDIR, yoxsa skript dayanır):
//   - aşkar hərf səhvləri: kiril «профессор», «Mekanika», «qısamüddətlı», «Ümumimilli»;
//   - pozuq qalın yazı (****, **H****örmətli), emoji (⚠️), «:» qarşısında boşluq;
//   - BÖYÜK HƏRFLİ başlıqlar adi yazılışa, «Elan» başlığı mətnin öz başlığına;
//   - PDF keçidləri {{file:N}} — seed faylı media kitabxanasına yükləyib ünvanını qoyur.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, dataPath } from './lib/paths.mjs';
import { slugify } from './lib/slug.mjs';

const OUT = join(ROOT, '..', '..', 'adda-strapi', 'src', 'utils', 'news-import-content.ts');
const SITE = 'https://adda.edu.az';

const TITLE = {
  'announce/520': 'Fəlsəfə doktoru proqramı üzrə «Fəlsəfə» fənnindən qəbul imtahanı verəcək iddiaçıların nəzərinə!',
  'announce/522': 'Azərbaycan Dövlət Dəniz Akademiyasına (ADDA) qəbul olan abituriyentlərin nəzərinə',
  'announce/523': 'Fəlsəfə doktoru proqramı üzrə ixtisas fənnindən qəbul imtahanı verəcək iddiaçıların nəzərinə!',
};

// Əvvəlki illərin eyni başlıqlı elanları prod-da var (…-2022 … …-2025) —
// miqrasiyanın qaydası ilə il əlavə olunur.
const SLUG_SUFFIX = { 'announce/520': '-2026', 'announce/523': '-2026' };

/** Elanların PDF-ləri: köhnə yol, media kitabxanasında ad, saytda görünən ad. */
const FILES = {
  'announce/520': [
    { path: '/uploads/dok.sual (1).pdf', name: 'felsefe-imtahan-suallari-2026', label: 'Fəlsəfə: imtahan sualları' },
    { path: '/uploads/proq_az_bol.pdf', name: 'felsefe-doktorantura-proqrami-2026', label: 'Fəlsəfə: doktorantura proqramı' },
  ],
  'announce/523': [
    { path: '/uploads/3319_01.pdf', name: '3319-01-imtahan-suallari-2026', label: '3319.01 «Gəmiçilik texnikası»: imtahan sualları' },
    { path: '/uploads/3319_01_GEA.pdf', name: '3319-01-gea-imtahan-suallari-2026', label: '3319.01 «Gəmiçilik texnikası» (GEA): imtahan sualları' },
    { path: '/uploads/3319_02.pdf', name: '3319-02-imtahan-suallari-2026', label: '3319.02 «Gəmiçilik və su nəqliyyatının istismarı»: imtahan sualları' },
    { path: '/uploads/3319_03.pdf', name: '3319-03-imtahan-suallari-2026', label: '3319.03 «Gəmiqayırma və gəmi təmiri texnologiyası»: imtahan sualları' },
  ],
};

/** [axtarılan, yeni] — `all: true` olanda bütün tapıntılar. */
const EDITS = {
  'news/1985': [
    ['Riyaziyyat və Mekanika İnstitutunun', 'Riyaziyyat və Mexanika İnstitutunun'],
    ['qısamüddətlı', 'qısamüddətli'],
  ],
  'news/1986': [
    ['[https://www.youtube.com/watch?v=OOw6doVwa\\_o](https://www.youtube.com/watch?v=OOw6doVwa_o)', '[Videoreportaj (YouTube)](https://www.youtube.com/watch?v=OOw6doVwa_o)'],
  ],
  'news/1987': [['профессор-müəllim', 'professor-müəllim']],
  'announce/520': [
    ['**FƏLSƏFƏ DOKTORU PROQRAMI ÜZRƏ «FƏLSƏFƏ» FƏNNİNDƏN QƏBUL İMTAHANI VERƏCƏK İDDİAÇILARIN NƏZƏRİNƏ!**\n\n', ''],
    ['**Yüklə** : [Fəlsəfə\\_suallar\\_az](https://adda.edu.az/uploads/dok.sual%20(1).pdf)', '**Yüklə:** [Fəlsəfə: imtahan sualları (PDF)]({{file:0}})'],
    ['**Yüklə** : [Fəlsəfə\\_doktorantura\\_proqram](https://adda.edu.az/uploads/proq_az_bol.pdf)', '**Yüklə:** [Fəlsəfə: doktorantura proqramı (PDF)]({{file:1}})'],
  ],
  'announce/521': [
    ['15-16 oktyabr 2026-cı il tarixlərində', '15–16 oktyabr 2026-cı il tarixlərində'],
    ['**Keçirilmə tarixi:**15-16 oktyabr', '**Keçirilmə tarixi:** 15–16 oktyabr'],
    ['**Sənəd qəbulu üçün son tarix :**', '**Sənəd qəbulu üçün son tarix:**'],
    ['**İştirak formatı :**', '**İştirak formatı:**'],
  ],
  'announce/522': [
    ['****', '**', { all: true }],
    ['⚠️ **DİQQƏT!**', '**Diqqət!**'],
    ['**mygov ID**(vahid', '**mygov ID** (vahid'],
    ['1. **Elektron qeydiyyat**', '### 1. Elektron qeydiyyat'],
    ['2. **Sənədlərin təqdim edilməsi**', '### 2. Sənədlərin təqdim edilməsi'],
    ['3. **Subbakalavrlar üçün əlavə sənədlər**', '### 3. Subbakalavrlar üçün əlavə sənədlər'],
    [
      '\\- Diplom və diploma əlavənin əsli və surəti;\n\n\\- İş yerindən arayış;\n\n\\- Dənizçinin tibbi kitabçasının surəti;\n\n\\- Hərbi biletin surəti;',
      '- Diplom və diploma əlavəsinin əsli və surəti;\n- İş yerindən arayış;\n- Dənizçinin tibbi kitabçasının surəti;\n- Hərbi biletin surəti.',
    ],
  ],
  'announce/523': [
    ['**İXTİSAS FƏNLƏRİ ÜZRƏ İMTAHAN QRAFİKİ VƏ PROQRAMLAR**', '### İxtisas fənləri üzrə imtahan qrafiki və proqramlar'],
    ['**1. İxtisas: 3319.01 – “Gəmiçilik texnikası”**', '#### 1. İxtisas: 3319.01 – “Gəmiçilik texnikası”'],
    ['**2. İxtisas: 3319.02 – “Gəmiçilik və su nəqliyyatının istismarı”**', '#### 2. İxtisas: 3319.02 – “Gəmiçilik və su nəqliyyatının istismarı”'],
    ['**3. İxtisas: 3319.03 – “Gəmiqayırma və gəmi təmiri texnologiyası”**', '#### 3. İxtisas: 3319.03 – “Gəmiqayırma və gəmi təmiri texnologiyası”'],
    [
      'yüklə: [3319\\_01.pdf](https://adda.edu.az/uploads/3319_01.pdf) , [3319\\_01\\_GEA.pdf](https://adda.edu.az/uploads/3319_01_GEA.pdf)',
      '[3319_01.pdf]({{file:0}}), [3319_01_GEA.pdf]({{file:1}})',
    ],
    ['yüklə: [3319\\_02.pdf](https://adda.edu.az/uploads/3319_02.pdf)', '[3319_02.pdf]({{file:2}})'],
    ['yüklə: [3319\\_03.pdf](https://adda.edu.az/uploads/3319_03.pdf)', '[3319_03.pdf]({{file:3}})'],
  ],
  'announce/524': [
    ['**H****örmətli tələbələr!**', '**Hörmətli tələbələr!**'],
    ['Ümumimilli liderimizin', 'Ümummilli liderimizin'],
  ],
};

function apply(key, body) {
  let out = body;
  for (const [from, to, opt] of EDITS[key] ?? []) {
    if (!out.includes(from)) throw new Error(`${key}: redaktə tapılmadı: ${from.slice(0, 60)}`);
    out = opt?.all ? out.split(from).join(to) : out.replace(from, to);
  }
  if (/adda\.edu\.az\/uploads/.test(out)) throw new Error(`${key}: mətndə köhnə saytın fayl keçidi qalıb`);
  if (/\p{Extended_Pictographic}/u.test(out)) throw new Error(`${key}: emoji qalıb`);
  if (/\*{4}/.test(out)) throw new Error(`${key}: pozuq qalın yazı qalıb`);
  return out;
}

const rel = (u) => (u.startsWith(SITE) ? u.slice(SITE.length) : u);
const src = JSON.parse(readFileSync(dataPath('f551-oldsite.json'), 'utf8'));
const news = [];
const ann = [];
for (const it of src.items) {
  const title = TITLE[it.key] ?? it.title;
  const slug = slugify(title) + (SLUG_SUFFIX[it.key] ?? '');
  const body = apply(it.key, it.body);
  if (it.key.startsWith('news/')) {
    news.push({ legacy: it.key, slug, title, date: it.date, hero: rel(it.hero), gallery: it.gallery.map(rel), body });
  } else {
    const files = FILES[it.key] ?? [];
    for (let i = 0; i < files.length; i++) {
      if (!body.includes(`{{file:${i}}}`)) throw new Error(`${it.key}: {{file:${i}}} mətndə yoxdur`);
    }
    ann.push({ legacy: it.key, slug, title, date: it.date, files, body });
  }
}

const J = (v) => JSON.stringify(v, null, 2);
const ts = `/**
 * F5.51 — köhnə saytın (adda.edu.az) 15.07–14.10.2026 xəbər və elanları.
 * AVTOMATİK YARADILIB — ƏL İLƏ DƏYİŞDİRMƏ: tools/migration/f551-news.mjs
 * (mənbə tools/migration/data/f551-oldsite.json, redaktələr orada sadalanıb).
 *
 * Seed: src/utils/news-import.ts (\`newsImport:v1\`). Şəkil və PDF yolları köhnə
 * saytdakı yoldur — seed endirib media kitabxanasına yükləyir; mətndəki
 * {{file:N}} yüklənən PDF-in ünvanı ilə əvəz olunur. Köhnə URL-lər
 * (news/1985 …) adda-nextjs/lib/legacy-redirects.ts-dədir (gen-redirects.mjs → IMPORTED).
 */

export interface ImportArticle {
  legacy: string;
  slug: string;
  title: string;
  /** Köhnə saytdakı dərc vaxtı (Bakı). */
  date: string;
  hero: string;
  gallery: string[];
  body: string;
}

export interface ImportFile {
  path: string;
  /** Media kitabxanasında fayl adı (uzantısız). */
  name: string;
  /** Saytda «Sənədlər» siyahısında görünən ad. */
  label: string;
}

export interface ImportAnnouncement {
  legacy: string;
  slug: string;
  title: string;
  date: string;
  files: ImportFile[];
  body: string;
}

export const IMPORT_ARTICLES: ImportArticle[] = ${J(news)};

export const IMPORT_ANNOUNCEMENTS: ImportAnnouncement[] = ${J(ann)};
`;
writeFileSync(OUT, ts, 'utf8');
console.log(`  Yazildi: adda-strapi/src/utils/news-import-content.ts — ${news.length} xeber, ${ann.length} elan`);
for (const x of [...news, ...ann]) console.log(`    ${x.legacy.padEnd(13)} ${x.slug}`);
