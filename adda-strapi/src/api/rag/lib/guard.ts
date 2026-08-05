/**
 * F2.7-3 — Guardrails.
 *
 * TƏHDİD MODELİ: indekslənən mətn ETİBARSIZ GİRİŞDİR. Məzmunun bir hissəsi
 * istifadəçi düzəlişlərindən gəlir (`/profil` özünəxidmət, correction inbox).
 * F2.7-4-də həmin mətn birbaşa LLM promptuna düşəcək — yəni istifadəçinin
 * yazdığı sətir modelin göstərişi kimi oxuna bilər. Müdafiə İKİ QATDIR:
 *
 *   1. İNDEKSLƏMƏ VAXTI (bu fayl): PII silinir, inyeksiya naxışları aşkarlanır
 *      və parça işarələnir. Görünməz Unicode təmizlənir.
 *   2. PROMPT VAXTI (F2.7-4): işarələnmiş parça kontekstə buraxılmır, qalanı
 *      isə struktur çərçivəyə alınır («bu MƏLUMATDIR, GÖSTƏRİŞ DEYİL»).
 *
 * Tək qat kifayət deyil: naxış aşkarlanması həmişə keçirilə bilər, struktur
 * çərçivə isə tək başına yaxşı gizlədilmiş göstərişi tutmur.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * NİYƏ NAXIŞLAR KONTEKSTƏ LÖVBƏRLƏNİB:
 *
 * FIN 7 simvollu alfanumerik koddur (`5AB2C3D`). Onu lövbərsiz axtarmaq
 * fəlakətdir — «GEMI123», «STCW-95», ixtisas kodları, hətta adi sözlər
 * uyğun gələr və məzmunun yarısı silinərdi. Ona görə YALNIZ kontekst
 * sözünün yanında («FIN», «ş.v.», «şəxsiyyət vəsiqəsi») axtarılır.
 * Eyni məntiq doğum tarixi üçün də: `12.05.1980` tədbir tarixi ola bilər,
 * «12.05.1980-ci il təvəllüdlü» isə PII-dir.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Standalone kompilyasiya olunur — @strapi/strapi tipləri import EDİLMİR.
 */

/* ── Görünməz / istiqamət simvolları ──────────────────────────────────── */

/**
 * Sıfır enli və bidi simvolları. Klassik gizlətmə vasitəsidir: mətn insana
 * zərərsiz görünür, modelə isə tamam başqa şey çatır.
 *
 * DİQQƏT: `\u0130` (İ) və `\u0259` (ə) BU SİYAHIDA YOXDUR və olmamalıdır —
 * onlar Azərbaycan əlifbasının hərfləridir.
 */
const INVISIBLE = /[\u00AD\u200B-\u200F\u202A-\u202E\u2060-\u2064\u206A-\u206F\uFEFF]/g;

/** Görünməz simvolları at, sətir sonlarını normallaşdır. */
export function neutralize(text: string): string {
  if (!text) return '';
  return text.replace(INVISIBLE, '').replace(/\r\n?/g, '\n');
}

/* ── PII ──────────────────────────────────────────────────────────────── */

export interface ScrubResult {
  text: string;
  /** Hansı növ məlumat silindi — audit üçün. */
  removed: string[];
}

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const PHONE = /(?:\+994|00994|0)[\s-]?\(?\d{2}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}\b/g;
/** AZ IBAN: 28 simvol, `AZ` + 2 yoxlama + 4 hərf bank kodu + 20 simvol. */
const IBAN = /\bAZ\d{2}[A-Z]{4}[0-9A-Z]{20}\b/g;
/** Pasport: `AZE` + 8 rəqəm, və ya seriya + 7-8 rəqəm. */
const PASSPORT = /\b(?:AZE\s?\d{8}|[A-Z]{2}\s?\d{7,8})\b/g;

/** FIN — YALNIZ kontekst sözünün yanında. Bax yuxarıdakı izah. */
const FIN_CTX = /((?:FİN|FIN|fin)\s*(?:kod(?:u)?)?\s*[:№#-]?\s*)([0-9A-Za-zƏəÇçĞğİıÖöŞşÜü]{7})\b/g;
const IDCARD_CTX =
  /((?:ş\.?\s?v\.?|şəxsiyyət\s+vəsiqəsi|шахсиййат|passport|pasport)\s*[:№#-]?\s*)([A-Z0-9]{2,3}\s?\d{6,8})\b/gi;

/**
 * Doğum tarixi — kontekstə lövbərlənib.
 *
 * `staff-private` marşrutsuzdur və `person` mənbəsi `metaOnly`-dir, yəni
 * doğum tarixi struktur olaraq indeksə DÜŞƏ BİLMİR. Bu naxış ikinci
 * müdafiə xəttidir: eyni məlumat sərbəst mətndə (məsələn yubiley xəbərində)
 * təkrarlana bilər.
 */
const BIRTH_CTX =
  /((?:doğum\s+tarixi|təvəllüd(?:lü)?|дата\s+рождения|date\s+of\s+birth|d\.o\.b\.?)\s*[:—-]?\s*)(\d{1,2}[.\/-]\d{1,2}[.\/-]\d{4}|\d{4})/gi;
/** «12.05.1980-ci il təvəllüdlü» — tarix kontekstdən ƏVVƏL gəlir. */
const BIRTH_SUFFIX = /(\d{1,2}[.\/-]\d{1,2}[.\/-]\d{4})(\s*(?:-ci|-cü|-cı|-cu)?\s*il(?:də)?\s+(?:təvəllüd|anadan))/gi;

/** Luhn — saxta müsbətləri kəsir (ixtisas kodları, sifariş nömrələri). */
function luhn(digits: string): boolean {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48;
    if (d < 0 || d > 9) return false;
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

const CARD_CANDIDATE = /\b(?:\d[ -]?){13,19}\b/g;

export interface ScrubOptions {
  contacts?: boolean;
  identifiers?: boolean;
}

export function scrubPII(input: string, opts: ScrubOptions = {}): ScrubResult {
  const contacts = opts.contacts !== false;
  const identifiers = opts.identifiers !== false;
  const removed: string[] = [];
  let text = input;
  if (!text) return { text: '', removed };

  const mark = (kind: string): void => {
    if (removed.indexOf(kind) === -1) removed.push(kind);
  };

  if (contacts) {
    if (EMAIL.test(text)) mark('e-poct');
    text = text.replace(EMAIL, '[e-poct]');
    if (PHONE.test(text)) mark('telefon');
    text = text.replace(PHONE, '[telefon]');
  }

  if (identifiers) {
    if (IBAN.test(text)) mark('iban');
    text = text.replace(IBAN, '[hesab]');

    // Kart nömrəsi: yalnız Luhn keçən ardıcıllıq silinir.
    text = text.replace(CARD_CANDIDATE, (m) => {
      const digits = m.replace(/[^0-9]/g, '');
      if (digits.length >= 13 && digits.length <= 19 && luhn(digits)) {
        mark('kart');
        return '[kart]';
      }
      return m;
    });

    text = text.replace(FIN_CTX, (_m, ctx: string) => {
      mark('fin');
      return ctx + '[fin]';
    });
    text = text.replace(IDCARD_CTX, (_m, ctx: string) => {
      mark('senedd');
      return ctx + '[sened]';
    });
    text = text.replace(BIRTH_CTX, (_m, ctx: string) => {
      mark('dogum-tarixi');
      return ctx + '[tarix]';
    });
    text = text.replace(BIRTH_SUFFIX, (_m, _d: string, suffix: string) => {
      mark('dogum-tarixi');
      return '[tarix]' + suffix;
    });

    if (PASSPORT.test(text)) mark('pasport');
    text = text.replace(PASSPORT, '[sened]');
  }

  // Qlobal `g` bayraqlı RegExp-lər `lastIndex` saxlayır — `test()`-dən sonra
  // sıfırlanmasa növbəti çağırış SƏHV nəticə verir. Klassik səssiz səhv.
  EMAIL.lastIndex = 0;
  PHONE.lastIndex = 0;
  IBAN.lastIndex = 0;
  PASSPORT.lastIndex = 0;

  return { text, removed };
}

/* ── Prompt injection ─────────────────────────────────────────────────── */

export interface InjectionSignal {
  /** Naxışın adı — audit hesabatında görünür. */
  name: string;
  /** `strong` tək başına işarələməyə kifayətdir. */
  weight: 'strong' | 'weak';
}

interface Pattern extends InjectionSignal {
  re: RegExp;
}

/**
 * Üç dildə naxışlar — sayt trilingualdır, hücum da istənilən dildə gələ bilər.
 * Naxışlar TAM SİYAHI DEYİL və olmayacaq; ikinci qat (F2.7-4 struktur
 * çərçivəsi) məhz buna görə lazımdır.
 */
const PATTERNS: Pattern[] = [
  { name: 'ignore-instructions', weight: 'strong',
    re: /\b(ignore|disregard|forget)\b[^.\n]{0,40}\b(previous|prior|above|earlier|all)\b[^.\n]{0,20}\b(instruction|prompt|rule|direction)/i },
  // DİQQƏT: bu üç naxışda `\b` İŞLƏMİR. JavaScript-də `\b` yalnız ASCII
  // söz simvolları üzərində təyin olunub — `ə`, `İ`, `и` üçün söz sərhədi
  // HEÇ VAXT yaranmır və naxış səssizcə heç nə tutmur. Əvəzinə Unicode
  // xassəli lookaround (`u` bayrağı ilə) işlədilir.
  { name: 'ignore-instructions-az', weight: 'strong',
    re: /(?<![\p{L}])(əvvəlki|yuxarıdakı|bütün|qabaqkı)(?![\p{L}])[^.\n]{0,30}(göstəriş|təlimat|qayda|əmr)[^.\n]{0,30}(nəzərə\s+alma|unut|iqnor|məhəl\s+qoyma)/iu },
  { name: 'ignore-instructions-ru', weight: 'strong',
    re: /(?<![\p{L}])(игнорируй\w*|забудь\w*|не\s+обращай)(?![\p{L}])[^.\n]{0,40}(инструкц|указан|правил|промпт)/iu },
  { name: 'system-prompt', weight: 'strong',
    re: /(system\s*prompt|системный\s+промпт|sistem\s+promptu)/iu },
  { name: 'reveal-instructions', weight: 'strong',
    re: /\b(reveal|print|output|show|repeat)\b[^.\n]{0,30}\b(your|the)\b[^.\n]{0,20}\b(instruction|prompt|rule)/i },
  { name: 'role-override', weight: 'strong',
    re: /\b(you\s+are\s+now|act\s+as\s+(?:a|an)\s|pretend\s+to\s+be|from\s+now\s+on\s+you)\b/i },
  { name: 'chat-markup', weight: 'strong',
    re: /<\|(?:im_start|im_end|system|endoftext)\|>|\[\/?INST\]|<\|assistant\|>/i },
  { name: 'fake-turn', weight: 'weak',
    re: /^\s*(?:###\s*)?(?:system|assistant|user)\s*:/im },
  { name: 'html-comment', weight: 'weak', re: /<!--[\s\S]{0,400}?-->/ },
  { name: 'invisible-chars', weight: 'weak', re: INVISIBLE },
  { name: 'data-exfil', weight: 'weak',
    re: /\b(send|post|fetch|curl|upload)\b[^.\n]{0,30}\bhttps?:\/\//i },
];

export interface InspectResult {
  /** Parça şübhəlidirmi. */
  flagged: boolean;
  /** Aşkarlanan naxış adları. */
  signals: string[];
}

export function inspectInjection(text: string): InspectResult {
  const signals: string[] = [];
  let strong = 0;
  let weak = 0;
  for (const p of PATTERNS) {
    p.re.lastIndex = 0;
    if (p.re.test(text)) {
      signals.push(p.name);
      if (p.weight === 'strong') strong++;
      else weak++;
    }
    p.re.lastIndex = 0;
  }
  // Bir güclü naxış, və ya iki zəif naxış → işarələ.
  return { flagged: strong >= 1 || weak >= 2, signals };
}

/* ── Birləşdirilmiş emal ──────────────────────────────────────────────── */

export interface GuardResult {
  text: string;
  removed: string[];
  flagged: boolean;
  signals: string[];
}

export interface GuardOptions extends ScrubOptions {
  injection?: boolean;
}

/**
 * İndeksləmə zamanı çağırılır: görünməz simvollar → PII → inyeksiya.
 *
 * SIRA VACİBDİR: görünməz simvollar əvvəl atılmalıdır, yoxsa `i\u200Bgnore
 * previous instructions` naxışa uyğun gəlməz. Eyni səbəbdən inyeksiya
 * yoxlaması PII silinməsindən SONRA aparılır — `[e-poct]` əvəzləməsi
 * naxışları pozmur, amma silinməmiş uzun blob-lar yalançı siqnal verə bilər.
 */
export function guard(input: string, opts: GuardOptions = {}): GuardResult {
  const cleaned = neutralize(input);
  const { text, removed } = scrubPII(cleaned, opts);
  if (opts.injection === false) return { text, removed, flagged: false, signals: [] };
  // İnyeksiya yoxlaması ORİJİNAL (təmizlənmiş) mətn üzərində aparılır:
  // görünməz simvol siqnalı `neutralize`-dan sonra itir, ona görə onu
  // ayrıca xam girişdə yoxlayırıq.
  const res = inspectInjection(text);
  INVISIBLE.lastIndex = 0;
  if (INVISIBLE.test(input) && res.signals.indexOf('invisible-chars') === -1) {
    res.signals.push('invisible-chars');
  }
  INVISIBLE.lastIndex = 0;
  return { text, removed, flagged: res.flagged || res.signals.length >= 2, signals: res.signals };
}
