// F5.1b — minimal, ASILILIQSIZ (dependency-free) .xlsx (OOXML) oxuyucu.
//
// SƏBƏB: mənbə fayl .xlsb (BIFF12 ikili format) idi, Node-da oxunmur.
// `soffice` bu mühitdə YOXDUR, amma Excel var idi — COM avtomatlaşdırması
// ilə BİR DƏFƏLİK `.xlsx`-ə çevrilib repoya qoyulub (bax
// tools/migration/data/TP_6006006_DN_2026.xlsx,
// tools/migration/.gitignore-də açıq istisna). Bu modul həmin `.xlsx`-i
// (əslində sadə ZIP + XML) oxuyur — YENİ npm asılılığı ƏLAVƏ EDİLMƏYİB,
// yalnız Node-un daxili `zlib`/`fs` işlədilir.
//
// ƏHATƏ QƏSDƏN DAR: tam OOXML spesifikasiyası YOX, yalnız bu seed üçün
// lazım olan hissə — bir vərəqin hüceyrə dəyərlərini (mətn/rəqəm, paylaşılan
// sətir cədvəli həll olunmuş) `"B37"` kimi hüceyrə istinadına görə oxumaq.
// Düsturlar, format, stil — YOXDUR.
import { readFileSync } from 'fs';
import { inflateRawSync } from 'zlib';

const SIG_EOCD = Buffer.from([0x50, 0x4b, 0x05, 0x06]);
const SIG_CD = Buffer.from([0x50, 0x4b, 0x01, 0x02]);

interface ZipEntry {
  compressionMethod: number;
  compressedSize: number;
  localHeaderOffset: number;
}

function readZipEntries(buf: Buffer): Map<string, ZipEntry> {
  const eocdIdx = buf.lastIndexOf(SIG_EOCD);
  if (eocdIdx === -1) throw new Error('xlsx-lite: EOCD imzasi tapilmadi - fayl ZIP deyil?');
  const totalEntries = buf.readUInt16LE(eocdIdx + 10);
  const cdOffset = buf.readUInt32LE(eocdIdx + 16);

  const entries = new Map<string, ZipEntry>();
  let p = cdOffset;
  for (let i = 0; i < totalEntries; i++) {
    if (buf.readUInt32LE(p) !== SIG_CD.readUInt32LE(0)) {
      throw new Error('xlsx-lite: Central Directory imzasi uygun gelmir (offset ' + p + ')');
    }
    const compressionMethod = buf.readUInt16LE(p + 10);
    const compressedSize = buf.readUInt32LE(p + 20);
    const filenameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localHeaderOffset = buf.readUInt32LE(p + 42);
    const filename = buf.toString('utf8', p + 46, p + 46 + filenameLen);
    entries.set(filename, { compressionMethod, compressedSize, localHeaderOffset });
    p += 46 + filenameLen + extraLen + commentLen;
  }
  return entries;
}

function readZipEntryData(buf: Buffer, entry: ZipEntry): Buffer {
  const lp = entry.localHeaderOffset;
  const filenameLen = buf.readUInt16LE(lp + 26);
  const extraLen = buf.readUInt16LE(lp + 28);
  const dataStart = lp + 30 + filenameLen + extraLen;
  const raw = buf.subarray(dataStart, dataStart + entry.compressedSize);
  if (entry.compressionMethod === 0) return Buffer.from(raw);
  if (entry.compressionMethod === 8) return inflateRawSync(raw);
  throw new Error('xlsx-lite: dəstəklənməyən sıxılma üsulu: ' + entry.compressionMethod);
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_m, dec: string) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&amp;/g, '&');
}

function parseSharedStrings(xml: string): string[] {
  const out: string[] = [];
  const siRe = /<si\b[^>]*>([\s\S]*?)<\/si>|<si\b[^>]*\/>/g;
  let m: RegExpExecArray | null;
  while ((m = siRe.exec(xml))) {
    const inner = m[1] ?? '';
    let text = '';
    const tRe = /<t\b[^>]*>([\s\S]*?)<\/t>|<t\b[^>]*\/>/g;
    let tm: RegExpExecArray | null;
    while ((tm = tRe.exec(inner))) text += tm[1] ?? '';
    out.push(decodeXmlEntities(text));
  }
  return out;
}

/** Hüceyrə istinadından ("B37") sütun hərfini ayırır ("B"). */
function colLetterOf(cellRef: string): string {
  const m = cellRef.match(/^([A-Z]+)\d+$/);
  return m ? m[1] : '';
}

/**
 * Bir vərəqin bütün dolu hüceyrələrini `{ "B37": "..." }` şəklində qaytarır
 * (paylaşılan sətirlər/inline mətn HƏLL OLUNUB, rəqəmlər XAM mətn kimi).
 */
export function readXlsxSheetCells(xlsxPath: string, sheetName: string): Map<string, string> {
  const buf = readFileSync(xlsxPath);
  const entries = readZipEntries(buf);

  const readXml = (name: string): string => {
    const e = entries.get(name);
    if (!e) throw new Error('xlsx-lite: ZIP daxilində tapilmadi: ' + name);
    return readZipEntryData(buf, e).toString('utf8');
  };

  const workbookXml = readXml('xl/workbook.xml');
  const sheetTagRe = /<sheet\b([^>]*)\/>/g;
  let sheetRid: string | null = null;
  let sm: RegExpExecArray | null;
  while ((sm = sheetTagRe.exec(workbookXml))) {
    const attrs = sm[1];
    const nameM = attrs.match(/\bname="([^"]*)"/);
    const ridM = attrs.match(/\br:id="([^"]*)"/);
    if (nameM && decodeXmlEntities(nameM[1]) === sheetName) {
      sheetRid = ridM ? ridM[1] : null;
      break;
    }
  }
  if (!sheetRid) throw new Error('xlsx-lite: vərəq tapilmadi: "' + sheetName + '"');

  const relsXml = readXml('xl/_rels/workbook.xml.rels');
  const relRe = /<Relationship\b([^>]*)\/>/g;
  let sheetTarget: string | null = null;
  let rm: RegExpExecArray | null;
  while ((rm = relRe.exec(relsXml))) {
    const attrs = rm[1];
    const idM = attrs.match(/\bId="([^"]*)"/);
    const targetM = attrs.match(/\bTarget="([^"]*)"/);
    if (idM && idM[1] === sheetRid && targetM) {
      sheetTarget = targetM[1];
      break;
    }
  }
  if (!sheetTarget) throw new Error('xlsx-lite: rel tapilmadi: ' + sheetRid);
  const sheetPath = 'xl/' + sheetTarget.replace(/^\/?xl\//, '').replace(/^\.?\//, '');

  let sharedStrings: string[] = [];
  if (entries.has('xl/sharedStrings.xml')) {
    sharedStrings = parseSharedStrings(readXml('xl/sharedStrings.xml'));
  }

  const sheetXml = readXml(sheetPath);
  const cells = new Map<string, string>();
  const rowRe = /<row\b[^>]*>([\s\S]*?)<\/row>/g;
  let rowM: RegExpExecArray | null;
  while ((rowM = rowRe.exec(sheetXml))) {
    const rowInner = rowM[1];
    const cellRe = /<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;
    let cellM: RegExpExecArray | null;
    while ((cellM = cellRe.exec(rowInner))) {
      const attrs = cellM[1];
      const inner = cellM[2];
      if (!inner) continue; // boş hüceyrə (öz-özünü bağlayan <c/>) - dəyər yoxdur
      const refM = attrs.match(/\br="([^"]*)"/);
      if (!refM) continue;
      const ref = refM[1];
      const typeM = attrs.match(/\bt="([^"]*)"/);
      const type = typeM ? typeM[1] : 'n';

      let value = '';
      if (type === 'inlineStr') {
        const isM = inner.match(/<is\b[^>]*>([\s\S]*?)<\/is>/);
        if (isM) {
          let text = '';
          const tRe = /<t\b[^>]*>([\s\S]*?)<\/t>/g;
          let tm: RegExpExecArray | null;
          while ((tm = tRe.exec(isM[1]))) text += tm[1];
          value = decodeXmlEntities(text);
        }
      } else {
        const vM = inner.match(/<v>([\s\S]*?)<\/v>/);
        if (!vM) continue;
        const raw = vM[1];
        value = type === 's' ? sharedStrings[parseInt(raw, 10)] ?? '' : decodeXmlEntities(raw);
      }
      if (value !== '') cells.set(ref, value);
    }
  }
  return cells;
}

/** `cells`-dən "B" + sətir nömrəsi üçün budaqlanmış dəyəri oxuyur, boşdursa null. */
export function cellAt(cells: Map<string, string>, colLetter: string, row: number): string | null {
  const v = cells.get(colLetter + row);
  return v && v.trim() !== '' ? v.trim() : null;
}

export { colLetterOf };
