/**
 * F2.7-1 — RAG parçalayıcısı (chunker).
 *
 * Sənədləri embedding üçün hazırlayır: markdown təmizlənir, PII silinir,
 * mətn üst-üstə düşən parçalara bölünür.
 *
 * NİYƏ AYRI FAYL: `site-search` nəzarətçisindəki `clean()` ilə oxşardır, amma
 * ONU TƏKRAR İSTİFADƏ ETMİRİK — orada `\s+` → ` ` abzasları da yeyir.
 * Parçalama üçün abzas sərhədi LAZIMDIR (parça ortasından kəsmək mənanı
 * pozur), ona görə burada `toPlain()` abzasları saxlayır.
 *
 * Standalone kompilyasiya olunur — @strapi/strapi tipləri import EDİLMİR.
 */
import { createHash } from 'node:crypto';

/* ── Mənbələr ─────────────────────────────────────────────────────────── */

export interface SourceDef {
  /** Qısa açar — API-də və CLI-də istifadə olunur. */
  key: string;
  uid: string;
  /** Başlıq sahəsinin adı (tiplər arasında fərqlidir: `title` / `name`). */
  title: string;
  /** Gövdə sahəsi. `metaOnly` mənbələrdə yoxdur. */
  body?: string;
  excerpt?: string;
  /** İctimai marşrut prefiksi — sitat linki bundan qurulur. */
  route: string;
  /**
   * true = YALNIZ metadata indekslənir, gövdə YOX.
   *
   * `person` üçün qərar (F2.7 açılışı): yalnız ad / vəzifə / bölmə.
   * Bio, e-poçt, telefon, doğum tarixi RAG indeksinə DÜŞMÜR. Səbəb:
   * `person` REST-də onsuz da açıqdır, amma 163 nəfəri bir LLM kontekstinə
   * yığmaq fərqli risk sinfidir — kütləvi çıxarış («bütün müəllimlərin
   * telefonunu ver») ictimai API ilə mümkün olmayan hücumdur.
   */
  metaOnly?: boolean;
  /** `documents().findMany` üçün sahə siyahısı. */
  fields: string[];
  populate?: Record<string, { fields: string[] }>;
}

export const SOURCES: SourceDef[] = [
  {
    key: 'article',
    uid: 'api::article.article',
    title: 'title',
    body: 'body',
    excerpt: 'excerpt',
    route: '/xeberler/',
    fields: ['documentId', 'slug', 'title', 'body', 'excerpt', 'publishedAt'],
  },
  {
    key: 'announcement',
    uid: 'api::announcement.announcement',
    title: 'title',
    body: 'body',
    excerpt: 'excerpt',
    route: '/elanlar/',
    fields: ['documentId', 'slug', 'title', 'body', 'excerpt', 'publishedAt'],
  },
  {
    key: 'event',
    uid: 'api::event.event',
    title: 'title',
    body: 'body',
    excerpt: 'excerpt',
    route: '/tedbirler/',
    fields: ['documentId', 'slug', 'title', 'body', 'excerpt', 'publishedAt'],
  },
  {
    key: 'page',
    uid: 'api::page.page',
    title: 'title',
    body: 'body',
    excerpt: 'seoDescription',
    route: '/sehife/',
    fields: ['documentId', 'slug', 'title', 'body', 'seoDescription', 'publishedAt'],
  },
  {
    key: 'department',
    uid: 'api::department.department',
    title: 'name',
    body: 'about',
    route: '/struktur/',
    fields: ['documentId', 'slug', 'name', 'about', 'publishedAt'],
  },
  {
    key: 'program',
    uid: 'api::program.program',
    title: 'title',
    body: 'description',
    route: '/ixtisaslar/',
    fields: ['documentId', 'slug', 'title', 'description', 'publishedAt'],
  },
  {
    key: 'faculty',
    uid: 'api::faculty.faculty',
    title: 'name',
    body: 'about',
    route: '/fakulteler/',
    fields: ['documentId', 'slug', 'name', 'about', 'publishedAt'],
  },
  {
    key: 'person',
    uid: 'api::person.person',
    title: 'displayName',
    route: '/emekdas/',
    metaOnly: true,
    // DİQQƏT: `bio`, `email`, `phone`, `teaching` QƏSDƏN YOXDUR.
    // Sahə əlavə etməzdən əvvəl yuxarıdakı `metaOnly` şərhini oxu.
    fields: ['documentId', 'slug', 'name', 'displayName', 'position', 'academicTitle', 'academicDegree', 'staffType'],
    populate: {
      faculty: { fields: ['name'] },
      department: { fields: ['name'] },
      unit: { fields: ['name'] },
    },
  },
];

export function sourceByKey(key: string): SourceDef | undefined {
  return SOURCES.find((s) => s.key === key);
}

/* ── Mətn hazırlığı ───────────────────────────────────────────────────── */

/**
 * Markdown → düz mətn. ABZASLAR SAXLANILIR.
 *
 * DİQQƏT: defis (`-`) silinmir — `[#*_\`>|-]` sinfi "ADDA-da"-nı "ADDA da"
 * edirdi (K20-də tapılmış səhv, `plugins.ts`-də də qeyd olunub).
 */
export function toPlain(raw: unknown): string {
  if (typeof raw !== 'string' || !raw) return '';
  return raw
    .replace(/\r\n?/g, '\n')
    .replace(/```[\s\S]*?```/g, ' ')                 // kod blokları
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')           // şəkillər
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')         // linklər → mətn
    .replace(/<[^>]+>/g, ' ')                        // qalıq HTML
    .replace(/^[ \t]*#{1,6}[ \t]+/gm, '')            // başlıqlar
    .replace(/^[ \t]*[-*+>][ \t]+/gm, '')            // siyahı / sitat işarələri
    .replace(/^[ \t]*\|.*\|[ \t]*$/gm, (m) => m.replace(/\|/g, ' '))  // cədvəl
    .replace(/[*_`]/g, '')                           // vurğu işarələri
    .replace(/[ \t]+/g, ' ')                         // YALNIZ üfüqi boşluq
    .replace(/\n{3,}/g, '\n\n')                      // abzas sərhədi qalır
    .split('\n')
    .map((l) => l.trim())
    .join('\n')
    .trim();
}

/**
 * Əlaqə məlumatını mətndən çıxar.
 *
 * NİYƏ: co-pilot e-poçt/telefon yığıcısına çevrilməməlidir. Sitat linki
 * mənbə səhifəsinə aparır — istifadəçi əlaqəni orada görür, LLM isə onu
 * kütləvi şəkildə sadalaya bilmir.
 *
 * `RAG_SCRUB_CONTACTS=false` ilə söndürülür (defolt: AÇIQ).
 * F2.7-3-də bu qat genişlənəcək (şəxsi ID nömrələri, ünvanlar).
 */
export function scrubContacts(text: string, enabled = true): string {
  if (!enabled || !text) return text;
  return text
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[e-poct]')
    // AZ nömrə formatları: +994 XX XXX XX XX / (012) 123-45-67 / 050-123-45-67
    .replace(/(?:\+994|00994|0)[\s-]?\(?\d{2}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}\b/g, '[telefon]');
}

/* ── Parçalama ────────────────────────────────────────────────────────── */

export const CHUNK_CHARS = 900;
export const CHUNK_OVERLAP = 150;
/**
 * Bir sənəddən maksimum parça sayı.
 *
 * Miqrasiyada 11 654 simvollıq səhifələr var; 40 parça ilə ~36 000 simvol
 * örtülür. Bundan uzun sənəd yoxdur, amma hədd qoyulmasa bir zibil sənəd
 * indeksin yarısını yeyə bilər.
 */
export const MAX_CHUNKS = 40;

/** Uzun abzası cümlə sərhədindən böl. */
function sentences(p: string): string[] {
  const out: string[] = [];
  let buf = '';
  for (const part of p.split(/(?<=[.!?…])\s+/)) {
    if (!part) continue;
    if (buf && buf.length + part.length + 1 > CHUNK_CHARS) {
      out.push(buf);
      buf = part;
    } else {
      buf = buf ? buf + ' ' + part : part;
    }
    // Tək cümlə də hədddən uzundursa zorla kəs (nadir: cədvəl qalığı).
    while (buf.length > CHUNK_CHARS) {
      out.push(buf.slice(0, CHUNK_CHARS));
      buf = buf.slice(CHUNK_CHARS - CHUNK_OVERLAP);
    }
  }
  if (buf) out.push(buf);
  return out;
}

/** Mətni üst-üstə düşən parçalara böl. */
export function splitChunks(text: string): string[] {
  const plain = text.trim();
  if (!plain) return [];
  if (plain.length <= CHUNK_CHARS) return [plain];

  const units: string[] = [];
  for (const para of plain.split(/\n{2,}/)) {
    const p = para.trim();
    if (!p) continue;
    if (p.length <= CHUNK_CHARS) units.push(p);
    else units.push(...sentences(p));
  }

  const out: string[] = [];
  let buf = '';
  for (const u of units) {
    if (buf && buf.length + u.length + 2 > CHUNK_CHARS) {
      out.push(buf);
      if (out.length >= MAX_CHUNKS) return out;
      // Üst-üstə düşmə: əvvəlki parçanın quyruğu yeni parçanın başına.
      // Kontekst itməsin deyə — sual parçanın tikişinə düşəndə hər iki
      // tərəf tapılır.
      const tail = buf.slice(-CHUNK_OVERLAP);
      const cut = tail.indexOf(' ');
      buf = (cut > 0 ? tail.slice(cut + 1) : tail) + '\n\n' + u;
    } else {
      buf = buf ? buf + '\n\n' + u : u;
    }
  }
  if (buf) out.push(buf);
  return out.slice(0, MAX_CHUNKS);
}

/* ── Sənəd → parça qeydləri ───────────────────────────────────────────── */

export interface ChunkRecord {
  source: string;
  docId: string;
  locale: string;
  slug: string;
  title: string;
  url: string;
  chunkIx: number;
  /** İstifadəçiyə göstərilən xam parça. */
  text: string;
  /** Embedding-ə verilən mətn (başlıq kontekst kimi qabağa əlavə olunur). */
  embedText: string;
  /** `embedText`-in SHA-256-sı — dəyişməyən parça yenidən embed olunmur. */
  hash: string;
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : v == null ? '' : String(v);
}

function relName(v: unknown): string {
  if (!v || typeof v !== 'object') return '';
  return str((v as Record<string, unknown>).name);
}

const DEGREE_AZ: Record<string, string> = {
  elmler_doktoru: 'elmlər doktoru',
  felsefe_doktoru: 'fəlsəfə doktoru',
  yoxdur: '',
};

/** `metaOnly` mənbələr üçün mətn — YALNIZ ad / vəzifə / bölmə. */
function metaText(entry: Record<string, unknown>): string {
  const parts: string[] = [];
  const name = str(entry.displayName) || str(entry.name);
  if (name) parts.push(name);
  const pos = str(entry.position);
  if (pos) parts.push('Vəzifə: ' + pos);
  const t = str(entry.academicTitle);
  if (t) parts.push('Elmi ad: ' + t);
  const d = DEGREE_AZ[str(entry.academicDegree)] || '';
  if (d) parts.push('Elmi dərəcə: ' + d);
  const unit = relName(entry.department) || relName(entry.unit);
  if (unit) parts.push('Bölmə: ' + unit);
  const fac = relName(entry.faculty);
  if (fac) parts.push('Fakültə: ' + fac);
  return parts.join('. ') + '.';
}

const TYPE_LABEL: Record<string, string> = {
  article: 'Xəbər',
  announcement: 'Elan',
  event: 'Tədbir',
  page: 'Səhifə',
  department: 'Şöbə',
  program: 'İxtisas',
  faculty: 'Fakültə',
  person: 'Əməkdaş',
};

export function sha256(s: string): string {
  return createHash('sha256').update(s, 'utf8').digest('hex');
}

/**
 * Bir sənəddən parça qeydləri qur.
 *
 * `embedText` başlıqla PREFİKSLƏNİR. Bu vacibdir: 3-cü parçada mövzu adı
 * keçmir, prefiks olmasa vektor "hansı sənəd" məlumatını itirir və
 * «Dəniz Nəqliyyat fakültəsi nə vaxt yaradılıb» tipli suallar tapılmır.
 */
export function buildChunks(
  src: SourceDef,
  entry: Record<string, unknown>,
  locale: string,
  scrub: boolean,
): ChunkRecord[] {
  const docId = str(entry.documentId);
  const slug = str(entry.slug);
  const title = str(entry[src.title]) || str(entry.name) || slug;
  if (!docId || !title) return [];

  const label = TYPE_LABEL[src.key] || src.key;
  const url = '/' + locale + src.route + slug;

  let texts: string[];
  if (src.metaOnly) {
    texts = [metaText(entry)];
  } else {
    const body = toPlain(src.body ? entry[src.body] : '');
    const lead = src.excerpt ? toPlain(entry[src.excerpt]) : '';
    const full = lead && !body.startsWith(lead) ? lead + '\n\n' + body : body;
    texts = splitChunks(scrubContacts(full, scrub));
    // Gövdəsi boş sənəd (miqrasiyada var) — heç olmasa başlıq indekslənsin.
    if (!texts.length) texts = [title];
  }

  return texts.map((text, i) => {
    const embedText = `[${label}] ${title}\n\n${text}`;
    return {
      source: src.key,
      docId,
      locale,
      slug,
      title,
      url,
      chunkIx: i,
      text,
      embedText,
      hash: sha256(embedText),
    };
  });
}
