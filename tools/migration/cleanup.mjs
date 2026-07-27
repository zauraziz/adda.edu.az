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
import { PLURAL, targetTypeFor } from './mapping.mjs';

const confirm = process.argv.includes('--confirm');
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
    targets.push({ key, documentId, type, via, title: list[0].title, legacyUrl: list[0].legacyUrl });
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
console.log(`  Silinecek: ${targets.length} butov sened + ${localeTargets.length} dil versiyasi`);
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
    targets.push({ key: m.key, documentId: m.documentId, type: m.foundIn, title: '(sehv tip -> ' + m.want + ')', legacyUrl: '' });
  }
} else {
  console.log('  Tip uygunsuzlugu yoxdur.\n');
}

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

// 1) Bütöv sənədlər
for (const t of targets) {
  const res = await api('DELETE', `/api/${PLURAL[t.type]}/${t.documentId}`);
  if (res.ok || res.status === 404) {
    deleted++;
    delete state[t.key];
  } else {
    failed++;
    console.log(`  XETA ${t.key}: ${res.data?.error?.message || res.status}`);
  }
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
console.log(`\n  butov sened silindi: ${deleted} | dil versiyasi silindi: ${localeDeleted} | xeta: ${failed}`);
console.log('  veziyyet fayli yenilendi.\n');
console.log('  Novbeti: node import.mjs   (silinen sehv-tipliler dogru tipde yaranir)');
console.log('  Sonra:   node verify.mjs\n');
