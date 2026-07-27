// Boş sənədlərin təmizlənməsi — DRY-RUN standartdır.
//
// TƏHLÜKƏSİZLİK PRİNSİPİ: yalnız MƏNBƏDƏ `isEmpty` işarəli qeydlər silinir.
// Strapi-dən "gövdəsi qısa görünən" hər şeyi silmirik — məsələn yeni il
// təbriki elanının gövdəsi qısadır, amma şəkli var və qanuni məzmundur.
// `isEmpty` = gövdə yoxdur VƏ şəkil yoxdur VƏ sənəd yoxdur.
//
// Hədəf `data/import-state.json`-dakı `documentId` ilə dəqiq tapılır —
// başlıq və ya slug üzrə axtarış YOXDUR, yəni səhv qeyd silinə bilməz.
//
//   node cleanup.mjs             # yalnız gösterir
//   node cleanup.mjs --confirm   # həqiqətən silir
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { dataPath } from './lib/paths.mjs';
import { loadState, saveState, targetLabel } from './lib/state.mjs';
import { STRAPI_URL, api, assertToken, ping } from './lib/strapi.mjs';
import { FIELDS, PLURAL, targetTypeFor } from './mapping.mjs';

const confirm = process.argv.includes('--confirm');
const deleteAutoSlug = process.argv.includes('--delete-autoslug');
const SECTIONS = ['content', 'faculty', 'announce', 'news'];

assertToken();

const records = [];
for (const section of SECTIONS) {
  const f = join(dataPath('extracted'), `${section}.json`);
  if (existsSync(f)) for (const r of JSON.parse(readFileSync(f, 'utf8'))) records.push(r);
}
if (!records.length) {
  console.error('data/extracted/ bosdur. Evvelce: node extract.mjs');
  process.exit(1);
}
if (!records.some((r) => Object.prototype.hasOwnProperty.call(r, 'isEmpty'))) {
  console.error('\n  XETA: data/extracted/ kohnelmisdir (`isEmpty` sahesi yoxdur).');
  console.error('  Hell:  node extract.mjs\n');
  process.exit(1);
}

const state = loadState();

// Sənəd səviyyəsində: bütün dilləri boşdursa sənəd tamamilə boşdur.
const byDoc = new Map();
for (const r of records) {
  const key = `${r.section}/${r.legacyId}`;
  if (!byDoc.has(key)) byDoc.set(key, []);
  byDoc.get(key).push(r);
}

// DİL SƏVİYYƏSİNDƏ TƏMİZLƏMƏ.
//
// Sənədin bəzi dilləri boş, bəziləri dolu ola bilər — məsələn `faculty/1`
// az-da doludur, ru-da boşdur. Bütöv sənədi silsək az versiyası da gedərdi.
// Ona görə iki rejim:
//   allEmpty  -> DELETE /api/{tip}/{documentId}            (bütöv sənəd)
//   partial   -> DELETE /api/{tip}/{documentId}?locale=ru  (yalnız o dil)
//
// Strapi 5-də `?locale=` ilə DELETE yalnız həmin dilin versiyasını silir.
// Nəticəni `node verify.mjs` təsdiqləyir — say pariteti dəqiq oturmalıdır.
/**
 * Sənədi slug ilə tap — vəziyyət faylında qeyd yoxdursa.
 *
 * NİYƏ LAZIMDIR: `state` yalnız bu maşında işlədilmiş idxalları bilir. Qeyd
 * silinibsə, əl ilə redaktə olunubsa və ya başqa maşından idxal edilibsə,
 * `state[key]` boş qalır və köhnə versiya belə qeydləri SƏSSİZCƏ atlayırdı —
 * nəticədə `verify.mjs`-də izahsız uyğunsuzluq görünürdü.
 * Slug deterministikdir, ona görə etibarlı ehtiyat yoldur.
 */
async function resolveBySlug(type, slug, locale) {
  if (!slug) return null;
  const res = await api(
    'GET',
    `/api/${PLURAL[type]}?locale=${locale}&filters[slug][$eq]=${encodeURIComponent(slug)}` +
      '&pagination[pageSize]=1&status=published&fields[0]=slug'
  );
  const row = res.data?.data?.[0];
  return row?.documentId || null;
}

/**
 * MİQRASİYADAN ƏVVƏLKİ ƏL İLƏ YARADILMIŞ QEYDLƏR.
 *
 * Strapi slug sahəsini `targetField: title`-dan avtomatik doldurur və nəticə
 * tip adının özü olur: `article`, `article-1`, `announcement-2`...
 * Bizim importer slug-ı HƏMİŞƏ açıq göndərir (başlıqdan törəyən), ona görə
 * belə slug idxaldan gələ BİLMƏZ — demək, admin-də əl ilə yaradılıb.
 *
 * Prod-da bunlar idxal olunanı təkrarlayır (məs. `article-2` = "26 İyun –
 * Silahlı Qüvvələr Günü" = news/1979) və ana səhifədə eyni xəbər iki dəfə çıxır.
 *
 * Silmək OPT-IN-dir (`--delete-autoslug`): bəziləri qanuni ola bilər.
 */
async function findAutoSlug() {
  const out = [];
  const types = ['page', 'department', 'program', 'faculty', 'announcement', 'article'];
  for (const type of types) {
    const f = FIELDS[type];
    const re = new RegExp('^' + type + '(-\\d+)?$');
    for (const locale of ['az', 'ru', 'en']) {
      for (let page = 1; page <= 30; page++) {
        const res = await api(
          'GET',
          `/api/${PLURAL[type]}?locale=${locale}&status=published&pagination[page]=${page}` +
            `&pagination[pageSize]=100&fields[0]=slug&fields[1]=${f.title}&fields[2]=createdAt`
        );
        for (const row of res.data?.data || []) {
          if (!re.test(row.slug || '')) continue;
          out.push({
            type,
            locale,
            documentId: row.documentId,
            slug: row.slug,
            title: String(row[f.title] || ''),
            createdAt: String(row.createdAt || '').slice(0, 10),
          });
        }
        const pg = res.data?.meta?.pagination;
        if (!pg || page >= pg.pageCount) break;
      }
    }
  }
  return out;
}

// Slug axtarışı Strapi tələb edir — əlaqəni ƏVVƏLCƏ yoxla ki, server sönülü
// olanda hər qeyd "tapılmadı" kimi görünməsin.
await ping();

const targets = [];
const localeTargets = [];
const unresolved = [];

for (const [key, list] of byDoc) {
  const empties = list.filter((r) => r.isEmpty);
  if (!empties.length) continue;
  const [section, id] = key.split('/');
  const type = targetTypeFor(section, Number(id));

  let documentId = state[key];
  let via = 'state';
  if (!documentId) {
    // Ehtiyat: slug ilə tap. Boş qeydin öz dilində axtarırıq.
    documentId = await resolveBySlug(type, empties[0].slug, empties[0].locale);
    via = 'slug';
  }
  if (!documentId) {
    unresolved.push({ key, type, title: list[0].title, locales: empties.map((r) => r.locale).join(',') });
    continue;
  }

  if (empties.length === list.length) {
    targets.push({
      key,
      documentId,
      type,
      via,
      locales: list.map((r) => r.locale),
      title: list[0].title,
      legacyUrl: list[0].legacyUrl,
    });
  } else {
    for (const r of empties) {
      localeTargets.push({
        key,
        documentId,
        type,
        via,
        locale: r.locale,
        title: r.title,
        legacyUrl: r.legacyUrl,
        keeps: list.filter((x) => !x.isEmpty).map((x) => x.locale).sort().join(','),
      });
    }
  }
}

if (unresolved.length) {
  console.log(`=== TAPILMADI (${unresolved.length}) — ne state-de, ne slug ile ===`);
  console.log('Bunlar yeqin ki Strapi-de umumiyyetle yoxdur, yeni artiq temizdir.');
  for (const u of unresolved.slice(0, 10)) {
    console.log(`  ${u.key}.${u.locales}  ${u.type}  "${u.title.slice(0, 40)}"`);
  }
  if (unresolved.length > 10) console.log(`  ... ve ${unresolved.length - 10} daha`);
  console.log('');
}

// ── TİP UYĞUNSUZLUĞU ─────────────────────────────────────────────────────
//
// `mapping.mjs` idxaldan SONRA dəyişibsə (məs. content/28 page -> department),
// sənəd köhnə tipdə qalır və `import.mjs` onu yeniləyə bilmir: PUT gözlənilən
// endpoint-ə gedir, orada isə həmin documentId yoxdur (404).
//
// Yalnız `content/*` yoxlanılır — news/announce/faculty tipləri sabitdir və
// dəyişə bilməz. ~56 sorğu, lokalda ani.
async function findMismatched() {
  const out = [];
  for (const [key, documentId] of Object.entries(state)) {
    if (!key.startsWith('content/')) continue;
    const want = targetTypeFor('content', Number(key.split('/')[1]));

    // Sənədin HƏQİQƏTƏN malik olduğu dillərlə yoxlanılır.
    //
    // ⚠️ NİYƏ `?locale=` MƏCBURİDİR: bu layihədə Strapi-nin i18n standart dili
    // `en`-dir (`config/plugins.ts`-də i18n konfiqurasiyası yoxdur, yəni Strapi
    // öz standartını işlədir). Sorğu `locale` olmadan getsə, Strapi `en`
    // versiyasını axtarır və `en` tərcüməsi olmayan HƏR sənəd 404 qaytarır —
    // nəticədə 22 sağlam sənəd saxta "səhv tip" kimi görünürdü və yeganə
    // real uyğunsuzluq (content/28) onların arasında itirdi.
    const locales = (byDoc.get(key) || []).map((r) => r.locale);
    const probes = locales.length ? locales : ['az'];

    let exists = false;
    for (const loc of probes) {
      const res = await api('GET', `/api/${PLURAL[want]}/${documentId}?locale=${loc}&status=published`);
      if (res.status !== 404) {
        exists = true;
        break;
      }
    }
    if (exists) continue;

    let foundIn = null;
    for (const t of ['page', 'department', 'program', 'faculty']) {
      if (t === want) continue;
      for (const loc of probes) {
        const probe = await api('GET', `/api/${PLURAL[t]}/${documentId}?locale=${loc}&status=published`);
        if (probe.ok) {
          foundIn = t;
          break;
        }
      }
      if (foundIn) break;
    }
    out.push({ key, documentId, want, foundIn });
  }
  return out;
}

const isProd = !/localhost|127\.0\.0\.1/.test(STRAPI_URL);
console.log('\n' + '='.repeat(66));
console.log(`  HEDEF: ${STRAPI_URL}${isProd ? '   <<< PROD! >>>' : '   (lokal)'}`);
console.log(`  Rejim: ${confirm ? 'SILME' : 'DRY-RUN (hec ne silinmir)'}`);
console.log('='.repeat(66) + '\n');

// Artıq silinmiş dil versiyalarını siyahıdan çıxar — əks halda hər təkrar
// işə salışda eyni qeydlər yenidən görünür və hesabat yanıldıcı olur.
if (localeTargets.length) {
  const alive = [];
  for (const t of localeTargets) {
    const res = await api('GET', `/api/${PLURAL[t.type]}/${t.documentId}?locale=${t.locale}&status=published`);
    if (res.status !== 404) alive.push(t);
  }
  const gone = localeTargets.length - alive.length;
  localeTargets.length = 0;
  localeTargets.push(...alive);
  if (gone) console.log(`  ${gone} dil versiyasi artiq silinib — atlanir.\n`);
}

// Əl ilə yaradılmış (avtomatik sluglı) qeydlər — sənəd üzrə qruplanır.
const autoSlug = await findAutoSlug();
const autoDocs = new Map();
for (const a of autoSlug) {
  if (!autoDocs.has(a.documentId)) autoDocs.set(a.documentId, { ...a, locales: [] });
  autoDocs.get(a.documentId).locales.push(a.locale);
}

if (autoDocs.size) {
  console.log(`=== EL ILE YARADILMIS QEYDLER (${autoDocs.size} sened) ===`);
  console.log('Miqrasiyadan EVVEL admin-de yaradilib — idxal olunani tekrarlaya biler.');
  console.log('tip          | slug             | diller   | tarix      | basliq');
  console.log('-------------+------------------+----------+------------+-------------------');
  for (const d of autoDocs.values()) {
    console.log(
      d.type.padEnd(12) + ' | ' + d.slug.padEnd(16) + ' | ' +
      d.locales.sort().join(',').padEnd(8) + ' | ' + d.createdAt.padEnd(10) + ' | ' + d.title.slice(0, 40)
    );
  }
  console.log(
    deleteAutoSlug
      ? '\n  --delete-autoslug verilib: bunlar SILINECEK.\n'
      : '\n  Silmek ucun: node cleanup.mjs --confirm --delete-autoslug\n'
  );

  if (deleteAutoSlug) {
    for (const d of autoDocs.values()) {
      targets.push({
        key: 'auto/' + d.type + '/' + d.slug,
        documentId: d.documentId,
        type: d.type,
        via: 'autoslug',
        locales: d.locales,
        title: d.title || '(el ile yaradilmis)',
        legacyUrl: '',
      });
    }
  }
}

const mismatched = await findMismatched();
if (mismatched.length) {
  console.log('=== SEHV TIPDE OLAN SENEDLER ===');
  console.log('sened          | olmali          | hazirda');
  console.log('---------------+-----------------+----------------');
  for (const m of mismatched) {
    console.log(m.key.padEnd(14) + ' | ' + m.want.padEnd(15) + ' | ' + (m.foundIn || '(tapilmadi)'));
  }
  const removable = mismatched.filter((m) => m.foundIn).length;
  console.log('\n  ' + removable + '/' + mismatched.length + ' silinir — sonra `node import.mjs` onlari DOGRU tipde yeniden yaradacaq.');
  if (removable < mismatched.length) {
    console.log('  `(tapilmadi)` olanlara toxunulmur — Strapi-de umumiyyetle yoxdurlar.');
  }
  console.log('');
  for (const m of mismatched) {
    if (!m.foundIn) continue;
    targets.push({
      key: m.key,
      documentId: m.documentId,
      type: m.foundIn,
      via: 'tip',
      locales: (byDoc.get(m.key) || []).map((r) => r.locale),
      title: '(sehv tip -> ' + m.want + ')',
      legacyUrl: '',
    });
  }
} else {
  console.log('  Tip uygunsuzlugu yoxdur.\n');
}

// Sayğac BURADA çap olunur — bütün hədəflər (boş sənədlər + əl ilə yaradılmış
// + səhv tipli) toplandıqdan sonra. Əvvəl başlıqda idi və yalnız birinci
// qrupu sayırdı, ona görə hesabat özü-özü ilə ziddiyyət təşkil edirdi.
console.log(`  CEMI SILINECEK: ${targets.length} butov sened + ${localeTargets.length} dil versiyasi\n`);

if (!targets.length && !localeTargets.length) {
  console.log('  Silinecek sened yoxdur.\n');
  process.exit(0);
}

if (targets.length) {
  console.log('=== BUTOV SENED (butun dilleri bos) ===');
  console.log('tip          | documentId       | tapildi | basliq');
  console.log('-------------+------------------+---------+--------------------------');
  for (const t of targets) {
    console.log(t.type.padEnd(12) + ' | ' + t.documentId.slice(0, 16).padEnd(16) + ' | ' + t.via.padEnd(7) + ' | ' + t.title.slice(0, 34));
    console.log('             | ' + ' '.repeat(16) + ' | ' + t.legacyUrl);
  }
  console.log('');
}

if (localeTargets.length) {
  console.log('=== YALNIZ DIL VERSIYASI (sened qalir) ===');
  console.log('tip          |dil| qalan   | basliq');
  console.log('-------------+---+---------+-----------------------------------');
  for (const t of localeTargets) {
    console.log(
      t.type.padEnd(12) + ' |' + t.locale.padEnd(3) + '| ' + t.keeps.padEnd(7) + ' | ' + t.title.slice(0, 40)
    );
  }
  console.log('');
}

if (!confirm) {
  console.log('\n  Hemin senedleri brauzerde ac ve yoxla. Silmek ucun:');
  console.log('    node cleanup.mjs --confirm\n');
  process.exit(0);
}

if (isProd) {
  console.log('\n  PROD hedefinde silme — evvelce lokalda sina.\n');
  process.exit(1);
}

let deleted = 0;
let failed = 0;

// 1) Bütöv sənədlər — HƏR DİL AYRICA.
//
// ⚠️ `DELETE /api/{tip}/{documentId}` (locale-siz) İŞLƏMİR: Strapi standart
// dili `en`-dir və həmin versiya yoxdursa 404 qaytarır. Köhnə versiya 404-ü
// "artıq silinib" sayıb uğur kimi hesablayırdı — nəticədə sənəd bazada qalır,
// amma vəziyyət faylından çıxarılırdı. Səssiz uğursuzluq.
//
// Ona görə: sənədin hər dili `?locale=` ilə silinir, sonra HƏQİQƏTƏN yox
// olduğu YOXLANILIR. State yalnız təsdiqdən sonra yenilənir.
let alreadyGone = 0;
for (const t of targets) {
  const locales = t.locales && t.locales.length ? t.locales : ['az', 'ru', 'en'];
  let hardFail = null;
  let removedAny = false;

  for (const loc of locales) {
    const res = await api('DELETE', `/api/${PLURAL[t.type]}/${t.documentId}?locale=${loc}`);
    if (res.ok) removedAny = true;
    else if (res.status !== 404) hardFail = res.data?.error?.message || ('HTTP ' + res.status);
  }

  if (hardFail) {
    failed++;
    console.log(`  XETA ${t.key}: ${hardFail}`);
    continue;
  }

  // Təsdiq: hər dildə yoxa çıxıbmı?
  let stillThere = false;
  for (const loc of locales) {
    const check = await api('GET', `/api/${PLURAL[t.type]}/${t.documentId}?locale=${loc}&status=published`);
    if (check.status !== 404) {
      stillThere = true;
      break;
    }
  }

  if (stillThere) {
    failed++;
    console.log(`  XETA ${t.key}: silinmedi, hele Strapi-dedir (documentId ${t.documentId})`);
    continue;
  }

  if (removedAny) deleted++;
  else alreadyGone++;
  delete state[t.key];
}

// 2) Yalnız dil versiyaları — sənəd və state TOXUNULMUR.
let localeDeleted = 0;
for (const t of localeTargets) {
  const res = await api('DELETE', `/api/${PLURAL[t.type]}/${t.documentId}?locale=${t.locale}`);
  if (res.ok || res.status === 404) {
    localeDeleted++;
  } else {
    failed++;
    console.log(`  XETA ${t.key}.${t.locale}: ${res.data?.error?.message || res.status}`);
  }
}

saveState(state);
console.log(`\n  butov sened silindi: ${deleted} | artiq yox idi: ${alreadyGone} | dil versiyasi silindi: ${localeDeleted} | xeta: ${failed}`);
console.log('  veziyyet fayli yenilendi.\n');
console.log('  Novbeti: node import.mjs   (silinen sehv-tipliler dogru tipde yaranir)');
console.log('  Sonra:   node verify.mjs\n');
