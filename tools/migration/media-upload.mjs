// MƏRHƏLƏ 7 — media köçürməsi.
//
// adda.edu.az/uploads/**  →  yüklə  →  Strapi `/api/upload`  →  Cloudinary
//
// NİYƏ STRAPI ÜZƏRİNDƏN, birbaşa Cloudinary-yə yox: `cover` sahəsi Strapi fayl
// `id`-si ilə bağlanır. Birbaşa Cloudinary-yə yükləsək Strapi-də media qeydi
// olmaz və heç nəyə bağlaya bilmərik.
//
// İDEMPOTENT: `data/media-map.<host>.json` köhnə URL → { id, url } saxlayır.
// Təkrar işə salanda artıq yüklənənlər atlanır, yəni kəsilsə davam etdirilir.
//
// NƏZAKƏT: yükləmə `lib/http.mjs`-in boğma mexanizmindən keçir — bu, ADDA-nın
// canlı prod serveridir.
//
//   node media-upload.mjs --dry-run     # yalnız plan
//   node media-upload.mjs --limit=20    # kiçik sınaq
//   node media-upload.mjs               # hamısı
//   node media-upload.mjs --force       # PROD hədəfi üçün məcburi
import { existsSync, readFileSync } from 'node:fs';
import { basename, extname } from 'node:path';
import { getBuffer } from './lib/http.mjs';
import { dataPath } from './lib/paths.mjs';
import { loadMediaMap, mediaMapFile, saveMediaMap } from './lib/state.mjs';
import { STRAPI_URL, assertToken, ping } from './lib/strapi.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v === undefined ? true : v];
  })
);

const dryRun = Boolean(args['dry-run']);
const limit = args.limit ? parseInt(args.limit, 10) : 0;

const MIME = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

/** Cloudinary üçün təhlükəsiz fayl adı. */
function safeName(url) {
  let name = basename(new URL(url).pathname) || 'file';
  name = decodeURIComponent(name).replace(/[^\w.\-]+/g, '-').replace(/-+/g, '-');
  if (name.length > 100) {
    const ext = extname(name);
    name = name.slice(0, 100 - ext.length) + ext;
  }
  return name;
}

const listFile = dataPath('media.json');
if (!existsSync(listFile)) {
  console.error('data/media.json yoxdur. Evvelce: node extract.mjs');
  process.exit(1);
}
let urls = JSON.parse(readFileSync(listFile, 'utf8'));
urls = [...new Set(urls.filter((u) => typeof u === 'string' && u.startsWith('http')))];

assertToken();
const map = loadMediaMap();
const pending = urls.filter((u) => !map[u]);
const isProd = !/localhost|127\.0\.0\.1/.test(STRAPI_URL);

console.log('\n' + '='.repeat(66));
console.log(`  HEDEF   : ${STRAPI_URL}${isProd ? '   <<< PROD! >>>' : '   (lokal)'}`);
console.log(`  Xerite  : ${mediaMapFile().split(/[\\/]/).pop()}`);
console.log(`  Media   : ${urls.length} unikal | artiq yuklenib ${urls.length - pending.length} | qalir ${pending.length}`);
console.log(`  Rejim   : ${dryRun ? 'DRY-RUN' : 'YUKLEME'}${limit ? ` (--limit=${limit})` : ''}`);
console.log(`  Tex.vaxt: ~${Math.ceil((Math.min(pending.length, limit || pending.length) * 1.6) / 60)} deqiqe`);
console.log('='.repeat(66) + '\n');

if (isProd && !dryRun && !args.force) {
  console.error('  PROD hedefine yuklemek ucun --force lazimdir.\n');
  process.exit(1);
}
if (!pending.length) {
  console.log('  Butun media artiq yuklenib.\n');
  process.exit(0);
}
if (dryRun) {
  for (const u of pending.slice(0, 15)) console.log('  [dry] ' + safeName(u) + '  <- ' + u);
  if (pending.length > 15) console.log(`  ... ve ${pending.length - 15} daha`);
  console.log('');
  process.exit(0);
}
await ping();

/**
 * Strapi-yə multipart yükləmə.
 * `api()` köməkçisi işlədilmir — o, `Content-Type: application/json` qoyur;
 * multipart-da isə boundary-ni `fetch` özü təyin etməlidir.
 */
async function uploadToStrapi(buffer, name, contentType) {
  const form = new FormData();
  form.append('files', new Blob([buffer], { type: contentType }), name);
  try {
    const res = await fetch(STRAPI_URL + '/api/upload', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + (process.env.STRAPI_TOKEN || '') },
      body: form,
    });
    const text = await res.text();
    if (!res.ok) return { ok: false, error: `HTTP ${res.status} ${text.slice(0, 160)}` };
    const json = JSON.parse(text);
    const file = Array.isArray(json) ? json[0] : json;
    if (!file || !file.id) return { ok: false, error: 'cavabda fayl id yoxdur' };
    return { ok: true, id: file.id, url: file.url, size: file.size };
  } catch (err) {
    return { ok: false, error: String((err && err.message) || err) };
  }
}

const work = limit ? pending.slice(0, limit) : pending;
const stats = { uploaded: 0, downloadFailed: 0, uploadFailed: 0, bytes: 0 };
const failures = [];
let done = 0;

for (const url of work) {
  const name = safeName(url);
  const ext = extname(name).toLowerCase();
  const dl = await getBuffer(url);

  if (!dl.buffer) {
    stats.downloadFailed++;
    failures.push({ url, stage: 'yukleme', error: dl.error || `HTTP ${dl.status}` });
  } else {
    const type = MIME[ext] || dl.contentType.split(';')[0] || 'application/octet-stream';
    const up = await uploadToStrapi(dl.buffer, name, type);
    if (up.ok) {
      map[url] = { id: up.id, url: up.url, name, size: up.size ?? dl.buffer.length };
      stats.uploaded++;
      stats.bytes += dl.buffer.length;
      if (stats.uploaded % 20 === 0) saveMediaMap(map);
    } else {
      stats.uploadFailed++;
      failures.push({ url, stage: 'gonderme', error: up.error });
    }
  }

  if (++done % 25 === 0) {
    const mb = (stats.bytes / 1048576).toFixed(1);
    console.log(`  ${done}/${work.length} | yuklenen ${stats.uploaded} (${mb} MB) | xeta ${stats.downloadFailed + stats.uploadFailed}`);
  }
}

saveMediaMap(map);

console.log('\n=== MEDIA KOCURMESI BITDI ===');
console.log(`  yuklenen      : ${stats.uploaded} (${(stats.bytes / 1048576).toFixed(1)} MB)`);
console.log(`  yukleme xetasi: ${stats.downloadFailed}  (adda.edu.az-dan alinmadi)`);
console.log(`  gonderme xetasi: ${stats.uploadFailed}  (Strapi/Cloudinary qebul etmedi)`);
console.log(`  xeritede cemi : ${Object.keys(map).length}/${urls.length}`);

if (failures.length) {
  const byErr = {};
  for (const f of failures) byErr[f.stage + ': ' + f.error.slice(0, 60)] = (byErr[f.stage + ': ' + f.error.slice(0, 60)] || 0) + 1;
  console.log('\nXETALAR:');
  for (const [k, n] of Object.entries(byErr).sort((a, b) => b[1] - a[1]).slice(0, 8)) {
    console.log(`  ${String(n).padStart(4)}  ${k}`);
  }
  console.log('\n  Eyni emri tekrar islet — ugurlular xeritededir, yalniz xetalilar cehd olunacaq.');
}

console.log('\nNovbeti: node media-link.mjs\n');
