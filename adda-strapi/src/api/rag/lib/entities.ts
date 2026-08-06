/**
 * F2.7-5 — Varlıq tanıma (NER) və məzmuna bağlama.
 *
 * ┌─ NİYƏ QAZETTİR, MAŞIN ÖYRƏNMƏSİ DEYİL ──────────────────────────────┐
 * │ Varlıq dəsti QAPALIDIR və tam bilinir: 163 şəxs, 4 ixtisas,         │
 * │ 2 fakültə, ~23 bölmə. Bu halda hazır siyahı üzərində dəqiq uyğunluq │
 * │ statistik modeldən HƏR CƏHƏTDƏN üstündür:                           │
 * │   • Azərbaycan dili üçün etibarlı NER modeli praktiki olaraq yoxdur │
 * │   • xərci sıfırdır — nə çıxarış vaxtı, nə sorğu başına ödəniş       │
 * │   • auditə açıqdır: nəyin niyə tanındığı birmənalıdır               │
 * │   • yanlış tanıma «uydurma link» yaradır — model burada risklidir   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Standalone kompilyasiya olunur — @strapi/strapi tipləri import EDİLMİR.
 */
import type { StrapiDocsLike } from './lexical';

export type EntityKind = 'person' | 'program' | 'faculty' | 'department' | 'unit';

export interface EntityDef {
  kind: EntityKind;
  docId: string;
  title: string;
  url: string;
  /** Normallaşdırılmış axtarış açarları (ad variantları). */
  keys: string[];
}

export interface EntityMatch {
  kind: EntityKind;
  docId: string;
  title: string;
  url: string;
  /** Mətndə tapılan forma (şəkilçi ilə birlikdə). */
  surface: string;
  at: number;
}

/**
 * Azərbaycan dilinə uyğun kiçik hərfə çevirmə.
 *
 * `toLowerCase()` TƏK BAŞINA YANLIŞDIR:
 *   `İ` → `i̇` (i + birləşən nöqtə) — sonrakı müqayisələr sınır
 *   `I` → `i`  — Azərbaycan dilində `I`-nin kiçiyi `ı`-dır, `i` deyil
 * Ona görə bu iki hərf ƏVVƏLCƏ əl ilə əvəzlənir.
 */
export function azLower(s: string): string {
  return s.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
}

/**
 * Diakritikanı ASCII-yə qatla.
 *
 * NİYƏ MƏCBURİDİR: istifadəçi «Esgerov Rafiq» yazır, qazettirdə isə
 * «əsgərov rafiq» var — dəqiq uyğunluq HEÇ NƏ tapmır. Azərbaycan hərfləri
 * olmayan klaviaturada bu, istisna deyil, normadır.
 *
 * XƏRİTƏ 1:1-DİR və elə qalmalıdır: mətndəki mövqe (`at`) qatlanmış sətir
 * üzərində hesablanır, sonra ORİJİNAL mətndən kəsilir. Bir simvol iki
 * simvola çevrilsə bütün ofsetlər sürüşərdi.
 */
// REGİSTR SAXLANILIR: `foldAz` YALNIZ diakritikanı qatlayır. Registr işi
// `azLower`-indir — iki məsuliyyəti bir funksiyaya yığmaq `foldAz`-ı tək
// başına çağıran kodu gözlənilməz nəticə ilə qarşılaşdırardı.
const FOLD: Record<string, string> = {
  ə: 'e', ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u',
  Ə: 'E', Ç: 'C', Ğ: 'G', İ: 'I', Ö: 'O', Ş: 'S', Ü: 'U',
};

export function foldAz(s: string): string {
  let out = '';
  for (const ch of s) out += FOLD[ch] !== undefined ? FOLD[ch] : ch;
  return out;
}

/** Hərf sayılan simvollar — Azərbaycan əlifbası daxil. */
const LETTER = /[0-9a-zA-ZəƏçÇğĞıIİöÖşŞüÜ]/;

function isLetter(ch: string): boolean {
  return LETTER.test(ch);
}

function norm(s: string): string {
  return azLower(String(s || ''))
    .replace(/[«»""'']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Açar və mətn EYNİ funksiyadan keçir — yoxsa uyğunluq asimmetrik olar. */
function matchKey(s: string): string {
  return foldAz(norm(s));
}

/* ── Qazettir qurulması ───────────────────────────────────────────────── */

export interface Gazetteer {
  locale: string;
  builtAt: number;
  entities: EntityDef[];
  /** Uzunluğa görə AZALAN sıra — «Gəmi mexanikası» «Gəmi»dən əvvəl yoxlanılır. */
  keyIndex: Array<{ key: string; def: EntityDef }>;
}

interface SourceSpec {
  kind: EntityKind;
  uid: string;
  route: string;
  fields: string[];
  /** Ad sahələri — hamısı ayrıca açar kimi qeydə alınır. */
  nameFields: string[];
}

const SPECS: SourceSpec[] = [
  {
    kind: 'person',
    uid: 'api::person.person',
    route: '/emekdas/',
    // `name` = ştatdakı «Soyad Ad Ata», `displayName` = «Ad Ata Soyad».
    // İSTİFADƏÇİ HƏR İKİ SIRA İLƏ YAZA BİLƏR, ona görə ikisi də açardır.
    fields: ['documentId', 'slug', 'name', 'displayName'],
    nameFields: ['displayName', 'name'],
  },
  { kind: 'program', uid: 'api::program.program', route: '/ixtisaslar/', fields: ['documentId', 'slug', 'title'], nameFields: ['title'] },
  { kind: 'faculty', uid: 'api::faculty.faculty', route: '/fakulteler/', fields: ['documentId', 'slug', 'name'], nameFields: ['name'] },
  { kind: 'department', uid: 'api::department.department', route: '/struktur/', fields: ['documentId', 'slug', 'name'], nameFields: ['name'] },
  { kind: 'unit', uid: 'api::unit.unit', route: '/struktur/', fields: ['documentId', 'slug', 'name'], nameFields: ['name'] },
];

/** Şəxs adından qısaldılmış variantlar: «Ad Soyad» / «Soyad Ad». */
function personVariants(full: string): string[] {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return [];
  const out: string[] = [];
  // «Əziz Zaur Vaqif oğlu» → «Əziz Zaur», «Zaur Əziz»
  const a = parts[0];
  const b = parts[1];
  out.push(a + ' ' + b);
  out.push(b + ' ' + a);
  return out;
}

/**
 * Açar minimum uzunluğu.
 *
 * Qısa açarlar fəlakət olardı: «Su», «Elm» kimi bölmə adları mətnin hər
 * yerində «tanınardı». 6 simvol praktiki həddir.
 */
const MIN_KEY = 6;

/** Ümumi sözlərdən ibarət açarlar — bunlar link kimi faydasızdır. */
const STOPKEYS = new Set(['akademiya', 'fakulte', 'kafedra', 'sobe', 'merkez', 'metbee', 'anbar']);

export async function buildGazetteer(strapi: StrapiDocsLike, locale: string): Promise<Gazetteer> {
  const entities: EntityDef[] = [];

  for (const spec of SPECS) {
    let rows: Array<Record<string, unknown>> = [];
    try {
      // `config/api.ts` → `maxLimit: 100` YALNIZ REST parametrlərinə aiddir;
      // bu daxili çağırışdır. Yenə də açıq hədd qoyulur.
      rows = await strapi.documents(spec.uid).findMany({
        locale,
        status: 'published',
        fields: spec.fields,
        limit: 500,
        sort: 'id:asc',
      } as Record<string, unknown>);
    } catch (err) {
      strapi.log.warn('[rag/entities] ' + spec.uid + ' atlandi: ' + String((err as Error).message).slice(0, 140));
      continue;
    }

    for (const r of rows) {
      const docId = String(r.documentId ?? '');
      const slug = String(r.slug ?? '');
      if (!docId || !slug) continue;
      const primary = String(r[spec.nameFields[0]] ?? '') || String(r[spec.nameFields[1] || ''] ?? '');
      if (!primary) continue;

      const raw: string[] = [];
      for (const f of spec.nameFields) {
        const v = String(r[f] ?? '');
        if (v) raw.push(v);
      }
      if (spec.kind === 'person') {
        for (const v of raw.slice()) raw.push(...personVariants(v));
      }

      // Açarlar QATLANMIŞ formada saxlanılır (diakritikasız yazılış üçün).
      const keys = Array.from(new Set(raw.map(matchKey)))
        .filter((k) => k.length >= MIN_KEY && !STOPKEYS.has(k));
      if (!keys.length) continue;

      entities.push({
        kind: spec.kind,
        docId,
        title: primary,
        url: '/' + locale + spec.route + slug,
        keys,
      });
    }
  }

  const keyIndex: Array<{ key: string; def: EntityDef }> = [];
  for (const def of entities) for (const key of def.keys) keyIndex.push({ key, def });
  // UZUN AÇAR ƏVVƏL: «Gəmi mexanikası və elektromexanikası fakültəsi»
  // «Gəmi mexanikası»ndan əvvəl yoxlanmalıdır, yoxsa qısa açar uzununu udar.
  // Eyni tələ `Rektor` ⊂ `Prorektor` halında da var.
  keyIndex.sort((a, b) => b.key.length - a.key.length);

  return { locale, builtAt: Date.now(), entities, keyIndex };
}

/* ── Keş ──────────────────────────────────────────────────────────────── */

const CACHE = new Map<string, Gazetteer>();
const TTL_MS = 15 * 60 * 1000;

export function resetGazetteer(): void {
  CACHE.clear();
}

export async function getGazetteer(strapi: StrapiDocsLike, locale: string, force = false): Promise<Gazetteer> {
  const hit = CACHE.get(locale);
  if (!force && hit && Date.now() - hit.builtAt < TTL_MS) return hit;
  const g = await buildGazetteer(strapi, locale);
  CACHE.set(locale, g);
  return g;
}

/* ── Tanıma ───────────────────────────────────────────────────────────── */

/**
 * Şəkilçi dözümlülüyü.
 *
 * Azərbaycan dili aqqlütinativdir: «Əsgərovun», «fakültəsinin»,
 * «ixtisasına». Açardan sonra 10 simvola qədər hərf gələ bilər və bu hələ
 * də eyni varlıqdır. Hədd qoyulmasa «Gəmi mexanikası» «Gəmi mexanikasısız
 * tamamilə başqa söz»ü də udardı.
 */
const MAX_SUFFIX = 10;

export function findEntities(gaz: Gazetteer, text: string): EntityMatch[] {
  if (!text) return [];
  // Qatlama 1:1 olduğu üçün `hay` uzunluğu `text` ilə eynidir və ofsetlər
  // orijinal mətnə birbaşa tətbiq olunur. Qoruyucu yoxlama:
  const hay = foldAz(azLower(text));
  if (hay.length !== text.length) return [];
  const taken: Array<[number, number]> = [];
  const out: EntityMatch[] = [];

  const overlaps = (a: number, b: number): boolean =>
    taken.some(([s, e]) => a < e && b > s);

  for (const { key, def } of gaz.keyIndex) {
    let from = 0;
    for (;;) {
      const at = hay.indexOf(key, from);
      if (at < 0) break;
      from = at + 1;

      // Söz başlanğıcı olmalıdır.
      if (at > 0 && isLetter(hay[at - 1])) continue;

      // Sonrakı hərflər şəkilçi sayılır — amma hədd daxilində.
      let end = at + key.length;
      let suf = 0;
      while (end < hay.length && isLetter(hay[end]) && suf < MAX_SUFFIX) {
        end++;
        suf++;
      }
      if (end < hay.length && isLetter(hay[end])) continue; // şəkilçi çox uzun

      if (overlaps(at, end)) continue;
      taken.push([at, end]);
      out.push({
        kind: def.kind,
        docId: def.docId,
        title: def.title,
        url: def.url,
        surface: text.slice(at, end),
        at,
      });
    }
  }

  out.sort((a, b) => a.at - b.at);
  return out;
}

/** Eyni varlığın təkrarlarını birləşdir. */
export function uniqueEntities(matches: EntityMatch[]): EntityMatch[] {
  const seen = new Set<string>();
  const out: EntityMatch[] = [];
  for (const m of matches) {
    const k = m.kind + ':' + m.docId;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(m);
  }
  return out;
}
