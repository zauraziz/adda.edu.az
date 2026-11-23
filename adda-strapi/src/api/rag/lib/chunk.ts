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
import { guard, inspectInjection, scrubPII } from './guard';

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
  populate?: Record<string, unknown>;
  /**
   * F5.61 — gövdədən sonra əlavə mətn (komponentlər, digər mətn sahələri). Gövdə ilə
   * birlikdə təmizlənir, PII-dən keçir və parçalanır. Sitat linki eyni səhifəyədir.
   */
  extra?: (entry: Record<string, unknown>, locale: string) => string;
}

type Entry = Record<string, unknown>;

const s0 = (v: unknown): string => (typeof v === 'string' ? v.trim() : v == null ? '' : String(v));
const list = (v: unknown): Entry[] => (Array.isArray(v) ? (v as Entry[]) : []);
const paras = (...parts: unknown[]): string => parts.map(s0).filter(Boolean).join('\n\n');

/** Suallar — «Sual: … Cavab: …» (unit.faq, page.faq, program.faq). */
function faqText(v: unknown): string {
  return list(v)
    .map((f) => (s0(f.question) && s0(f.answer) ? `${s0(f.question)}\n${s0(f.answer)}` : ''))
    .filter(Boolean)
    .join('\n\n');
}

/** F5.45+ səhifələri: fakt zolağı, addımlar, suallar, əlaqə — mətnin yarısı gövdədə deyil. */
function pageExtra(e: Entry): string {
  const facts = list(e.facts)
    .map((f) => (s0(f.label) && s0(f.value) ? `${s0(f.label)}: ${s0(f.value)}` : ''))
    .filter(Boolean)
    .join('\n');
  const steps = list(e.steps)
    .map((st) => {
      const head = [s0(st.title), s0(st.period), s0(st.who)].filter(Boolean).join(' · ');
      return paras(head, st.body);
    })
    .filter(Boolean)
    .join('\n\n');
  return paras(facts, s0(e.stepsTitle) && steps ? s0(e.stepsTitle) : '', steps, faqText(e.faq), e.contact);
}

/** Bölmə: missiya, fəaliyyət, xidmətlər, nəticələr, strategiya, əlavə bloklar, qəbul saatları. */
function unitExtra(e: Entry, locale: string): string {
  const blocks = list(e.extraBlocks)
    .map((b) => paras(b.title, b.body))
    .filter(Boolean)
    .join('\n\n');
  // `unit.faq` dilsizdir (az mətni) — yalnız az indeksinə.
  return paras(e.mission, e.functions, e.services, e.results, e.strategy, blocks, e.receptionHours, locale === 'az' ? faqText(e.faq) : '');
}

const DEGREE_LABEL: Record<string, Record<string, string>> = {
  az: { subbachelor: 'subbakalavr', bachelor: 'bakalavr', master: 'magistr', phd: 'doktorantura (fəlsəfə doktoru)' },
  ru: { subbachelor: 'младший бакалавр', bachelor: 'бакалавриат', master: 'магистратура', phd: 'докторантура' },
  en: { subbachelor: 'sub-bachelor (associate)', bachelor: 'bachelor', master: 'master', phd: 'doctorate (PhD)' },
};
const FORM_LABEL: Record<string, Record<string, string>> = {
  az: { eyani: 'əyani', qiyabi: 'qiyabi' },
  ru: { eyani: 'очная', qiyabi: 'заочная' },
  en: { eyani: 'full-time', qiyabi: 'part-time' },
};
const LANG_LABEL: Record<string, Record<string, string>> = {
  az: { az: 'Azərbaycan', ru: 'rus', en: 'ingilis' },
  ru: { az: 'азербайджанский', ru: 'русский', en: 'английский' },
  en: { az: 'Azerbaijani', ru: 'Russian', en: 'English' },
};
const PROGRAM_WORDS: Record<string, Record<string, string>> = {
  az: { degree: 'Təhsil pilləsi', form: 'Təhsil forması', years: 'Təhsil müddəti', yearsUnit: 'il', lang: 'Tədris dili', code: 'İxtisas kodu', credits: 'Kredit', fee: 'Təhsil haqqı', score: 'Keçid balı', paid: 'ödənişli', free: 'dövlət sifarişli', seats: 'Plan yerləri' },
  ru: { degree: 'Ступень', form: 'Форма обучения', years: 'Срок обучения', yearsUnit: 'лет', lang: 'Язык обучения', code: 'Код специальности', credits: 'Кредиты', fee: 'Стоимость обучения', score: 'Проходной балл', paid: 'платно', free: 'гос. заказ', seats: 'План приёма' },
  en: { degree: 'Degree', form: 'Study mode', years: 'Duration', yearsUnit: 'years', lang: 'Language of instruction', code: 'Programme code', credits: 'Credits', fee: 'Tuition fee', score: 'Admission score', paid: 'fee-paying', free: 'state-funded', seats: 'Places' },
};

/** İxtisas: kataloq faktları + mətn sahələri (əvvəl yalnız `description` indekslənirdi). */
function programExtra(e: Entry, locale: string): string {
  const L = locale === 'ru' || locale === 'en' ? locale : 'az';
  const W = PROGRAM_WORDS[L];
  const facts: string[] = [];
  const degree = DEGREE_LABEL[L][s0(e.degree)];
  if (degree) facts.push(`${W.degree}: ${degree}`);
  const form = FORM_LABEL[L][s0(e.studyForm)];
  if (form) facts.push(`${W.form}: ${form}`);
  if (s0(e.durationNote)) facts.push(`${W.years}: ${s0(e.durationNote)}`);
  else if (Number(e.durationYears) > 0) facts.push(`${W.years}: ${Number(e.durationYears)} ${W.yearsUnit}`);
  const langs = list(e.languages).map((x) => LANG_LABEL[L][s0(x.code)]).filter(Boolean);
  if (langs.length) facts.push(`${W.lang}: ${langs.join(', ')}`);
  if (s0(e.code)) facts.push(`${W.code}: ${s0(e.code)}`);
  if (Number(e.totalCredits) > 0) facts.push(`${W.credits}: ${Number(e.totalCredits)}`);
  if (s0(e.tuitionFee)) facts.push(`${W.fee}: ${s0(e.tuitionFee)}`);
  const scores = list(e.admissionScores)
    .filter((x) => Number(x.year) > 0)
    .sort((a, b) => Number(b.year) - Number(a.year))
    .slice(0, 2)
    .map((x) => {
      const parts = [
        x.minScoreFree != null && x.minScoreFree !== '' ? `${W.free} ${String(x.minScoreFree)}` : '',
        x.minScorePaid != null && x.minScorePaid !== '' ? `${W.paid} ${String(x.minScorePaid)}` : '',
      ].filter(Boolean);
      return parts.length ? `${W.score} (${Number(x.year)}): ${parts.join(', ')}` : '';
    })
    .filter(Boolean);
  facts.push(...scores);
  const seats = list(e.admissionSeats)
    .filter((x) => Number(x.year) > 0 && Number(x.total) > 0)
    .sort((a, b) => Number(b.year) - Number(a.year))[0];
  if (seats) facts.push(`${W.seats} (${Number(seats.year)}): ${Number(seats.total)}`);
  return paras(
    facts.join('\n'),
    e.tagline,
    e.overview,
    e.outcomes,
    e.competencies,
    e.careerPaths,
    e.conventions,
    e.practiceNote,
    L === 'az' ? faqText(e.faq) : '',
  );
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
    // F5.61: `lead` (səhifədə görünən giriş) — əvvəl `seoDescription` idi.
    excerpt: 'lead',
    route: '/sehife/',
    fields: ['documentId', 'slug', 'title', 'lead', 'body', 'stepsTitle', 'contact', 'publishedAt'],
    populate: { facts: true, steps: true, faq: true },
    extra: (e) => pageExtra(e),
  },
  {
    // F5.61 — struktur bölmə (fakültə, kafedra, şöbə, mərkəz): saytda yeganə səhifəsi
    // /struktur/<slug>-dir. Köhnə «department» (F5.43) və «faculty» (F5.41) arxivdir —
    // indeksdən çıxarılıb (avtomatik indeks onların parçalarını silir).
    key: 'unit',
    uid: 'api::unit.unit',
    title: 'name',
    body: 'about',
    route: '/struktur/',
    fields: ['documentId', 'slug', 'name', 'about', 'mission', 'functions', 'services', 'results', 'strategy', 'receptionHours', 'publishedAt'],
    populate: { extraBlocks: true, faq: true },
    extra: (e, locale) => unitExtra(e, locale),
  },
  {
    key: 'program',
    uid: 'api::program.program',
    title: 'title',
    body: 'description',
    route: '/ixtisaslar/',
    fields: [
      'documentId', 'slug', 'title', 'description', 'degree', 'studyForm', 'durationYears', 'durationNote', 'code',
      'totalCredits', 'tuitionFee', 'tagline', 'overview', 'outcomes', 'competencies', 'careerPaths', 'conventions',
      'practiceNote', 'publishedAt',
    ],
    populate: { languages: true, admissionScores: true, admissionSeats: true, faq: true },
    extra: (e, locale) => programExtra(e, locale),
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
 *
 * F2.7-3-dən etibarən əsl iş `guard.ts`-dədir (FIN, IBAN, kart, pasport,
 * doğum tarixi + inyeksiya aşkarlanması). Bu funksiya geriyə uyğunluq üçün
 * saxlanılır.
 */
export function scrubContacts(text: string, enabled = true): string {
  if (!enabled || !text) return text;
  return scrubPII(text, { contacts: true, identifiers: false }).text;
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
  /**
   * Aşkarlanan inyeksiya siqnalları. Boş deyilsə parça ŞÜBHƏLİDİR və
   * F2.7-4-də LLM kontekstinə buraxılmır.
   */
  signals: string[];
  /** Silinmiş PII növləri — audit üçün. */
  removed: string[];
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
  unit: 'Bölmə',
  program: 'İxtisas',
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
export interface BuildOptions {
  /** E-poçt/telefon silinsin (`RAG_SCRUB_CONTACTS`). */
  contacts?: boolean;
  /** FIN/IBAN/kart/pasport/doğum tarixi silinsin (`RAG_SCRUB_IDENTIFIERS`). */
  identifiers?: boolean;
  /** İnyeksiya naxışları yoxlanılsın (`RAG_GUARD_INJECTION`). */
  injection?: boolean;
}

export function buildChunks(
  src: SourceDef,
  entry: Record<string, unknown>,
  locale: string,
  opts: BuildOptions | boolean = {},
): ChunkRecord[] {
  // Köhnə imza (`scrub: boolean`) hələ dəstəklənir.
  const o: BuildOptions = typeof opts === 'boolean' ? { contacts: opts } : opts;
  const docId = str(entry.documentId);
  const slug = str(entry.slug);
  const title = str(entry[src.title]) || str(entry.name) || slug;
  if (!docId || !title) return [];

  const label = TYPE_LABEL[src.key] || src.key;
  const url = '/' + locale + src.route + slug;

  let texts: string[];
  let removed: string[] = [];
  if (src.metaOnly) {
    // `metaOnly` mətni struktur olaraq qurulur — sərbəst istifadəçi girişi
    // deyil, amma `position` sahəsi `/profil`-dən redaktə oluna bilir.
    const g = guard(metaText(entry), o);
    texts = [g.text];
    removed = g.removed;
  } else {
    const body = toPlain(src.body ? entry[src.body] : '');
    const lead = src.excerpt ? toPlain(entry[src.excerpt]) : '';
    const more = src.extra ? toPlain(src.extra(entry, locale)) : '';
    const main = lead && !body.startsWith(lead) ? lead + '\n\n' + body : body;
    const full = more ? (main ? main + '\n\n' + more : more) : main;
    // PII BÖLMƏDƏN ƏVVƏL silinir: naxış iki parçanın tikişinə düşsə
    // yarısı indeksdə qalardı.
    const g = guard(full, o);
    removed = g.removed;
    texts = splitChunks(g.text);
    // Gövdəsi boş sənəd (miqrasiyada var) — heç olmasa başlıq indekslənsin.
    if (!texts.length) texts = [title];
  }

  return texts.map((text, i) => {
    const embedText = `[${label}] ${title}\n\n${text}`;
    // İnyeksiya PARÇA SƏVİYYƏSİNDƏ yoxlanılır: bir zəhərli abzas bütün
    // sənədi indeksdən çıxarmamalıdır.
    const sig = o.injection === false ? { signals: [] } : inspectInjection(embedText);
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
      signals: sig.signals,
      removed,
    };
  });
}
