/**
 * F5.51 — köhnə saytdan (adda.edu.az) faylın media kitabxanasına köçürülməsi:
 * sertifikatların şəkilləri, xəbərlərin qapaq/qalereya şəkilləri, elanların PDF-ləri.
 *
 *   - Ünvan: `LEGACY_SITE_URL` (defolt https://adda.edu.az) + köhnə yol
 *     («/uploads/news/…»). Lokal sınaqda saxta server göstərilir.
 *   - Eyni yol İKİNCİ DƏFƏ endirilmir: store `adda-admin` → `legacyFiles:v1`
 *     { yol: fayl id }. Yarımçıq qalan idxal növbəti başlanğıcda davam edəndə
 *     media kitabxanasında təkrar yaranmır.
 *   - Yalnız şəkil (JPEG/PNG/WebP) və PDF — faylın ilk baytları yoxlanır
 *     (səhv səhifə HTML kimi qayıdanda fayl yaradılmır), ölçü ≤ 20 MB.
 *     F5.53: `{ documents: true }` ilə həm də PPTX (ZIP) və CorelDRAW (CDR:
 *     RIFF və ya ZIP) — korporativ üslubun rəsmi faylları; uzantı köhnə yoldandır.
 *   - Köhnə serverin TLS zənciri natamamdırsa (Node brauzer kimi aralıq
 *     sertifikatı özü tapmır) ictimai şəkil/PDF http ilə bir dəfə də istənir.
 *   - Şəbəkə xətası (DNS, bağlantı, vaxt aşımı) `LegacyUnreachable` atır —
 *     çağıran idxalı dayandırıb növbəti başlanğıca saxlayır; 404 isə yalnız
 *     həmin faylı atlayır.
 */
import { unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Core } from '@strapi/strapi';

const STORE_KEY = 'legacyFiles:v1';
const MAX_BYTES = 20 * 1024 * 1024;
const TIMEOUT_MS = 60_000;
const UA = 'Mozilla/5.0 (compatible; ADDA-site-migration/1.0; +https://demo.adda.edu.az)';
const TLS_CODE = /CERT|SIGNATURE|SELF_SIGNED|ISSUER/;

export class LegacyUnreachable extends Error {}

export interface LegacyFile {
  id: number;
  url: string;
}

export function legacyBase(): string {
  return (process.env.LEGACY_SITE_URL || 'https://adda.edu.az').trim().replace(/\/+$/, '');
}

/** «/uploads/dok.sual (1).pdf» → «/uploads/dok.sual%20%281%29.pdf» (mötərizə də — Markdown keçidində təhlükəsiz). */
export function legacyUrl(path: string): string {
  return legacyBase() + path.split('/').map((s) => encodeURIComponent(s).replace(/\(/g, '%28').replace(/\)/g, '%29')).join('/');
}

function sniff(buf: Buffer): { mime: string; ext: string } | null {
  if (buf.length < 8) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { mime: 'image/jpeg', ext: 'jpg' };
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { mime: 'image/png', ext: 'png' };
  if (buf.subarray(0, 4).toString('latin1') === 'RIFF' && buf.subarray(8, 12).toString('latin1') === 'WEBP') return { mime: 'image/webp', ext: 'webp' };
  if (buf.subarray(0, 5).toString('latin1') === '%PDF-') return { mime: 'application/pdf', ext: 'pdf' };
  return null;
}

const DOC_MIME: Record<string, string> = {
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  cdr: 'application/x-cdr',
};

/** F5.53 — sənəd faylları: ZIP (PPTX, yeni CDR) və ya RIFF «CDR» (köhnə CorelDRAW). */
function sniffDocument(buf: Buffer, path: string): { mime: string; ext: string } | null {
  const ext = (path.split('.').pop() || '').toLowerCase();
  if (!DOC_MIME[ext] || buf.length < 12) return null;
  const zip = buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04;
  const riffCdr = buf.subarray(0, 4).toString('latin1') === 'RIFF' && buf.subarray(8, 11).toString('latin1').toUpperCase() === 'CDR';
  if (zip || (ext === 'cdr' && riffCdr)) return { mime: DOC_MIME[ext], ext };
  return null;
}

export interface LegacyOptions {
  /** PPTX və CDR də qəbul olunsun (korporativ üslub). */
  documents?: boolean;
}

async function get(url: string): Promise<Response> {
  return fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(TIMEOUT_MS) });
}

/** Faylı endirir. Şəbəkə xətası → LegacyUnreachable; HTTP/format xətası → Error. */
export async function downloadLegacy(path: string, opts: LegacyOptions = {}): Promise<{ buf: Buffer; mime: string; ext: string }> {
  const url = legacyUrl(path);
  let res: Response;
  try {
    res = await get(url);
  } catch (e) {
    const cause = (e as { cause?: { code?: string; message?: string } }).cause;
    const code = String(cause?.code ?? '');
    if (url.startsWith('https://') && TLS_CODE.test(code)) {
      try {
        res = await get('http://' + url.slice('https://'.length));
      } catch (e2) {
        throw new LegacyUnreachable(`${url}: ${code} (http də alınmadı: ${(e2 as Error).message})`);
      }
    } else {
      throw new LegacyUnreachable(`${url}: ${code || cause?.message || (e as Error).message}`);
    }
  }
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  const declared = Number(res.headers.get('content-length') || 0);
  if (declared > MAX_BYTES) throw new Error(`${url}: ${(declared / 1048576).toFixed(1)} MB — çox böyükdür`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > MAX_BYTES) throw new Error(`${url}: çox böyükdür`);
  const kind = sniff(buf) ?? (opts.documents ? sniffDocument(buf, path) : null);
  if (!kind) throw new Error(`${url}: ${opts.documents ? 'şəkil, PDF, PPTX və ya CDR' : 'şəkil və ya PDF'} deyil`);
  return { buf, ...kind };
}

/**
 * Köhnə saytdakı faylı media kitabxanasına yükləyir (artıq yüklənibsə mövcudunu
 * qaytarır). `name` — uzantısız fayl adı (məs. «xeber-1985-qapaq»), `alt` —
 * şəklin alternativ mətni.
 */
export async function importLegacyFile(
  strapi: Core.Strapi,
  path: string,
  name: string,
  alt: string,
  opts: LegacyOptions = {},
): Promise<LegacyFile> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  const files = strapi.db.query('plugin::upload.file');
  const map = ((await store.get({ key: STORE_KEY })) as Record<string, number> | null) ?? {};
  const known = map[path];
  if (known) {
    const f = (await files.findOne({ where: { id: known }, select: ['id', 'url'] })) as { id?: number; url?: string } | null;
    if (f?.id && f.url) return { id: f.id, url: f.url };
  }

  const { buf, mime, ext } = await downloadLegacy(path, opts);
  const filename = `${name}.${ext}`;
  const tmp = join(tmpdir(), `adda-legacy-${Date.now()}-${filename}`);
  writeFileSync(tmp, buf);
  try {
    // `refId`/`ref`/`field` VERİLMİR — əlaqəni qeyd yazılanda Document Service qurur
    // (bax identity.ts). Sahə adı `originalFilename`-dir (kiçik `n`).
    const res = await strapi.plugin('upload').service('upload').upload({
      data: { fileInfo: { name: filename, alternativeText: alt.slice(0, 250), caption: '' } },
      files: { filepath: tmp, originalFilename: filename, mimetype: mime, size: buf.length },
    });
    const file = (Array.isArray(res) ? res[0] : res) as { id: number; url: string };
    const next = ((await store.get({ key: STORE_KEY })) as Record<string, number> | null) ?? {};
    next[path] = file.id;
    await store.set({ key: STORE_KEY, value: next });
    return { id: file.id, url: file.url };
  } finally {
    try {
      unlinkSync(tmp);
    } catch {
      /* təmizlik — xətası əməliyyatı dayandırmır */
    }
  }
}
