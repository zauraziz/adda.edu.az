/**
 * F5.55 — çatışmayan ru/en məzmunun tərcüməsi (Zaur müəllim, 18.10.2026).
 *
 * Nə: yalnız az dilində olan məzmun — səhifələr (dərc olunmuş az, ru/en sətri YOXDUR),
 * struktur bölmələrin mətn sahələri (ru/en-də BOŞDUR) və sənəd adları/təsvirləri
 * (`titleRu/En`, `descriptionRu/En` BOŞDUR). Mövcud ru/en mətninə toxunulmur.
 * Xəbər, elan, tədbir, ixtisas — bu işə daxil deyil.
 *
 * Necə: Gemini (`GEMINI_API_KEY`, model `TRANSLATE_MODEL` → `RAG_CHAT_MODEL` →
 * gemini-3.5-flash), JSON rejimi, terminologiya lüğəti. Cavab yoxlanılır (eyni
 * quruluş, keçid ünvanları saxlanıb, hədəf dildədir); uğursuzdursa bir dəfə
 * təkrarlanır, sonra element ötürülür (növbəti başlanğıcda yenidən, ən çoxu 3 dəfə).
 * Nizamnamənin tərcüməsinin əvvəlində «qeyri-rəsmi tərcümə» qeydi.
 *
 * ARXA PLANDA (port bloklanmır), addım-addım, sorğular arası fasilə; görülən iş
 * store-da (`tercume:done`) — yarımçıq qalsa növbəti başlanğıcda davam edir.
 * BİR DƏFƏ (`tercume:v1`). `TRANSLATE_MISSING=true` — marker olsa da yenidən
 * axtarır (yeni az məzmunu üçün; yalnız boşluqları doldurur), sonra bayrağı silin.
 * `TRANSLATE_PROVIDER=mock` — lokal sınaq (Gemini çağırılmır).
 */
import type { Core } from '@strapi/strapi';

type Row = Record<string, unknown>;
type Lang = 'en' | 'ru';
const LANGS: Lang[] = ['en', 'ru'];

const MARKER = 'tercume:v1';
const DONE_KEY = 'tercume:done';
const TRIES_KEY = 'tercume:tries';
const TAG = '[tercume] F5.55';
const MAX_TRIES = 3;
/** Bu uzunluqdan böyük mətn «## » bölmələri üzrə hissə-hissə tərcümə olunur. */
const CHUNK = 7000;
const OFFICIAL_TEXTS: Record<string, Record<Lang, string>> = {
  nizamname: {
    en: '*Unofficial translation. The official text of the Charter is in Azerbaijani.*',
    ru: '*Неофициальный перевод. Официальный текст Устава — на азербайджанском языке.*',
  },
};

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const list = (v: unknown): Row[] => (Array.isArray(v) ? (v as Row[]) : []);
const time = (v: unknown): number => (typeof v === 'string' || v instanceof Date ? new Date(v as string).getTime() : 0);
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const intEnv = (name: string, def: number): number => {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? n : def;
};

// ── Tərcüməçi ────────────────────────────────────────────────────────────────
const LANG_NAME: Record<Lang, string> = { en: 'English', ru: 'Russian' };

const GLOSSARY = `Azərbaycan Dövlət Dəniz Akademiyası = Azerbaijan State Marine Academy = Азербайджанская государственная морская академия (abbreviation ADDA stays ADDA)
Akademiya = the Academy = Академия
«Azərbaycan Xəzər Dəniz Gəmiçiliyi» QSC (ASCO) = Azerbaijan Caspian Shipping Company CJSC (ASCO) = ЗАО «Азербайджанское Каспийское морское пароходство» (ASCO)
Dövlət İmtahan Mərkəzi (DİM) = State Examination Centre (DIM) = Государственный экзаменационный центр (ГЭЦ)
Elm və Təhsil Nazirliyi = Ministry of Science and Education = Министерство науки и образования
Nazirlər Kabineti = Cabinet of Ministers = Кабинет министров
Elmi Şura = Academic Council = Учёный совет
Himayəçilər Şurası = Board of Trustees = Попечительский совет
Tədris-metodiki Şura = Academic Methodology Council = Учебно-методический совет
Keyfiyyəti idarəetmə sistemi = Quality Management System = Система менеджмента качества
Təlim Tədris Mərkəzi = Training Centre = Учебно-тренировочный центр
Azərbaycan Dənizçilik Kolleci = Azerbaijan Maritime College = Азербайджанский морской колледж
Nizamnamə = Charter = Устав; Əsasnamə = Regulations = Положение
fakültə = faculty = факультет; kafedra = department = кафедра; şöbə = department/office = отдел
bakalavriat = bachelor's programme = бакалавриат; magistratura = master's programme = магистратура; doktorantura = doctoral studies = докторантура; subbakalavr = sub-bachelor (college) = суббакалавр (колледж)
rektor = Rector = ректор; prorektor = Vice-Rector = проректор; dekan = Dean = декан
yataqxana = dormitory = общежитие; təqaüd = scholarship = стипендия
Dəniz naviqasiyası = Marine Navigation = Морская навигация; Gəmi energetik qurğularının istismarı = Operation of Ship Power Plants = Эксплуатация судовых энергетических установок`;

function systemPrompt(lang: Lang): string {
  return [
    `You are the professional translator of the official website of the Azerbaijan State Marine Academy (Baku).`,
    `Translate every string value of the user's JSON from Azerbaijani into ${LANG_NAME[lang]}.`,
    'Rules:',
    '1. Return ONLY a JSON object with exactly the same structure: the same keys, the same array lengths and order. Do not translate keys.',
    '2. Keep Markdown: headings (##), lists, tables, **bold**, *italic*, line breaks. Translate link text, but never change link URLs: [text](url) keeps the same url.',
    '3. Keep unchanged: URLs, e-mail addresses, numbers, dates, document codes and numbers (ADDA-ƏS-001, № 361), ISO/STCW/IMO references.',
    `4. Phone numbers: "(012) 493 36 44" becomes "+994 12 493 36 44"; "daxili 3078" becomes "${lang === 'en' ? 'ext. 3078' : 'доб. 3078'}".`,
    '5. Use this terminology (Azerbaijani = English = Russian):',
    GLOSSARY,
    '6. Formal, clear official style. Do not add explanations, notes or content; do not omit anything. Personal names: standard transliteration.',
  ].join('\n');
}

interface TResult {
  ok: boolean;
  value?: unknown;
  error?: string;
  retryAfterMs?: number;
}

function parseJson(text: string): unknown {
  const t = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  return JSON.parse(t);
}

async function gemini(lang: Lang, payload: unknown): Promise<TResult> {
  const key = (process.env.GEMINI_API_KEY || '').trim();
  const model = (process.env.TRANSLATE_MODEL || process.env.RAG_CHAT_MODEL || 'gemini-3.5-flash').trim();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const body = {
    systemInstruction: { parts: [{ text: systemPrompt(lang) }] },
    contents: [{ role: 'user', parts: [{ text: JSON.stringify(payload) }] }],
    generationConfig: { temperature: 0.1, maxOutputTokens: 32768, responseMimeType: 'application/json' },
  };
  for (let attempt = 1; attempt <= 4; attempt++) {
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), intEnv('TRANSLATE_TIMEOUT_MS', 120_000));
    try {
      const res = await fetch(url, {
        method: 'POST',
        signal: ac.signal,
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(body),
      });
      const raw = await res.text();
      let json: Row = {};
      try {
        json = JSON.parse(raw) as Row;
      } catch {
        json = {};
      }
      if (!res.ok) {
        const msg = `HTTP ${res.status}: ${str((json.error as Row | undefined)?.message) || raw.slice(0, 160)}`;
        const m = /retry in ([0-9.]+)s/i.exec(raw);
        const wait = m ? Math.ceil(parseFloat(m[1]) * 1000) + 500 : res.status === 429 ? 30_000 : 2000 * attempt;
        if ((res.status === 429 || res.status >= 500) && attempt < 4) {
          await sleep(wait);
          continue;
        }
        return { ok: false, error: msg, retryAfterMs: res.status === 429 ? wait : undefined };
      }
      const cand = list(json.candidates)[0];
      const parts = list((cand?.content as Row | undefined)?.parts);
      const text = parts.map((p) => str(p.text)).join('');
      if (!text) return { ok: false, error: `boş cavab (${str(cand?.finishReason) || '?'})` };
      if (str(cand?.finishReason) === 'MAX_TOKENS') return { ok: false, error: 'cavab kəsildi (MAX_TOKENS)' };
      return { ok: true, value: parseJson(text) };
    } catch (e) {
      const err = e as Error;
      if (attempt < 4) {
        await sleep(2000 * attempt);
        continue;
      }
      return { ok: false, error: err.name === 'AbortError' ? 'timeout' : err.message };
    } finally {
      clearTimeout(timer);
    }
  }
  return { ok: false, error: 'cəhdlər bitdi' };
}

/** Lokal sınaq: Gemini çağırılmır, sətirlər işarələnir (ünvanlar saxlanır). */
function mock(lang: Lang, payload: unknown): TResult {
  const tag = lang === 'en' ? '[EN] ' : '[RU] ';
  const walk = (v: unknown): unknown =>
    typeof v === 'string' ? (v ? tag + v : v) : Array.isArray(v) ? v.map(walk) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)])) : v;
  return { ok: true, value: walk(payload) };
}

const isMock = (): boolean => (process.env.TRANSLATE_PROVIDER || '').trim().toLowerCase() === 'mock';

// ── Yoxlama ──────────────────────────────────────────────────────────────────
const URL_RE = /\]\(([^)\s]+)\)|https?:\/\/[^\s)\]»"']+/g;
const urlsOf = (s: string): string[] => [...s.matchAll(URL_RE)].map((m) => m[1] || m[0]);
const AZ_LETTERS = /[əğıöüşçƏĞİÖÜŞÇ]/g;
const CYR = /[а-яёА-ЯЁ]/g;

function sameShape(src: unknown, out: unknown, lang: Lang, path: string, errs: string[]): void {
  if (typeof src === 'string') {
    if (typeof out !== 'string') return void errs.push(`${path}: sətir deyil`);
    if (src.trim() && !out.trim()) return void errs.push(`${path}: boş`);
    for (const u of urlsOf(src)) if (!out.includes(u)) errs.push(`${path}: ünvan itib (${u.slice(0, 60)})`);
    // Dil yoxlaması yalnız abzas uzunluğunda (adlar, ünvanlar, kodlar qısa sətirdə payı şişirdir);
    // ünvan və e-poçt hərfləri sayılmır.
    if (!isMock() && src.length > 120) {
      const text = out.replace(URL_RE, ' ').replace(/[\w.+-]+@[\w.-]+/g, ' ');
      const letters = text.replace(/[^\p{L}]/gu, '').length || 1;
      if (lang === 'ru' && (text.match(CYR) || []).length / letters < 0.5) errs.push(`${path}: rusca deyil`);
      if ((text.match(AZ_LETTERS) || []).length / letters > 0.04) errs.push(`${path}: azərbaycanca qalıb`);
    }
    return;
  }
  if (Array.isArray(src)) {
    if (!Array.isArray(out) || out.length !== src.length) return void errs.push(`${path}: massivin uzunluğu fərqlidir`);
    src.forEach((x, i) => sameShape(x, out[i], lang, `${path}[${i}]`, errs));
    return;
  }
  if (src && typeof src === 'object') {
    if (!out || typeof out !== 'object' || Array.isArray(out)) return void errs.push(`${path}: obyekt deyil`);
    for (const k of Object.keys(src)) sameShape((src as Row)[k], (out as Row)[k], lang, `${path}.${k}`, errs);
  }
}

/** Mənbədə boş olan sətir tərcümədə də boş qalır (model «boşluğu» doldurmasın). */
function keepEmpty(src: unknown, out: unknown): unknown {
  if (typeof src === 'string') return src.trim() ? out : '';
  if (Array.isArray(src) && Array.isArray(out)) return src.map((x, i) => keepEmpty(x, out[i]));
  if (src && typeof src === 'object' && out && typeof out === 'object') {
    return Object.fromEntries(Object.keys(src).map((k) => [k, keepEmpty((src as Row)[k], (out as Row)[k])]));
  }
  return out;
}

/** Tərcümə + yoxlama; uğursuzdursa bir dəfə təkrar. */
async function translate<T>(lang: Lang, payload: T): Promise<{ ok: true; value: T } | { ok: false; error: string }> {
  let lastErr = '';
  for (let attempt = 1; attempt <= 2; attempt++) {
    const r = isMock() ? mock(lang, payload) : await gemini(lang, payload);
    if (!r.ok) {
      lastErr = r.error || 'xəta';
      if (r.retryAfterMs) await sleep(r.retryAfterMs);
      continue;
    }
    const errs: string[] = [];
    sameShape(payload, r.value, lang, '$', errs);
    if (!errs.length) return { ok: true, value: keepEmpty(payload, r.value) as T };
    lastErr = errs.slice(0, 3).join('; ');
  }
  return { ok: false, error: lastErr };
}

/** Uzun markdown — «## » bölmələri (lazım olsa abzaslar) üzrə hissələr. */
function chunks(md: string): string[] {
  if (md.length <= CHUNK) return [md];
  const parts = md.split(/\n(?=## )/);
  const out: string[] = [];
  let cur = '';
  const push = (s: string) => {
    if (s.length <= CHUNK) return void out.push(s);
    let buf = '';
    for (const p of s.split(/\n\n/)) {
      if (buf && (buf + '\n\n' + p).length > CHUNK) {
        out.push(buf);
        buf = p;
      } else buf = buf ? buf + '\n\n' + p : p;
    }
    if (buf) out.push(buf);
  };
  for (const p of parts) {
    if (cur && (cur + '\n' + p).length > CHUNK) {
      push(cur);
      cur = p;
    } else cur = cur ? cur + '\n' + p : p;
  }
  if (cur) push(cur);
  return out;
}

async function translateLong(lang: Lang, md: string): Promise<{ ok: true; value: string } | { ok: false; error: string }> {
  const out: string[] = [];
  for (const c of chunks(md)) {
    const r = await translate(lang, { text: c });
    if (!r.ok) return r;
    out.push(r.value.text);
    await sleep(pace());
  }
  return { ok: true, value: out.join('\n') };
}

const pace = (): number => (isMock() ? 0 : intEnv('TRANSLATE_PACE_MS', 4000));

// ── Tapşırıqlar ──────────────────────────────────────────────────────────────
interface Task {
  key: string;
  label: string;
  run: () => Promise<void>;
}

const docs = (strapi: Core.Strapi, uid: string) =>
  strapi.documents(uid as never) as unknown as {
    findOne: (a: Row) => Promise<Row | null>;
    findMany: (a: Row) => Promise<Row[]>;
    update: (a: Row) => Promise<Row>;
    publish: (a: Row) => Promise<unknown>;
  };
const q = (strapi: Core.Strapi, uid: string) =>
  strapi.db.query(uid as never) as unknown as { findMany: (a: Row) => Promise<Row[]> };

class Fail extends Error {}

/** Səhifə: dərc olunmuş az, ru/en sətri YOXDUR → yeni dil yaradılır və dərc olunur. */
async function pageTasks(strapi: Core.Strapi): Promise<Task[]> {
  const PAGE = 'api::page.page';
  const az = await q(strapi, PAGE).findMany({
    where: { locale: 'az', publishedAt: { $notNull: true } },
    select: ['documentId', 'slug', 'body', 'lead'],
  });
  const ids = az.map((r) => str(r.documentId));
  const have = new Set(
    (await q(strapi, PAGE).findMany({ where: { documentId: { $in: ids }, locale: { $in: LANGS } }, select: ['documentId', 'locale'] })).map(
      (r) => `${str(r.documentId)}|${str(r.locale)}`,
    ),
  );
  const tasks: Task[] = [];
  for (const r of az) {
    const documentId = str(r.documentId);
    const slug = str(r.slug);
    if (str(r.body).length + str(r.lead).length < 80) continue; // yer tutan
    for (const lang of LANGS) {
      if (have.has(`${documentId}|${lang}`)) continue;
      tasks.push({ key: `page:${documentId}:${lang}`, label: `${slug} (${lang})`, run: () => translatePage(strapi, documentId, slug, lang) });
    }
  }
  return tasks;
}

async function translatePage(strapi: Core.Strapi, documentId: string, slug: string, lang: Lang): Promise<void> {
  const d = docs(strapi, 'api::page.page');
  const src = await d.findOne({ documentId, locale: 'az', status: 'published', populate: { facts: true, steps: true, faq: true, sideLinks: true } });
  if (!src) throw new Fail('az dərc olunmayıb');
  // Yarış: başqa yerdən yaranıbsa toxunma.
  if (await d.findOne({ documentId, locale: lang, status: 'draft' })) return;
  const facts = list(src.facts);
  const steps = list(src.steps);
  const faq = list(src.faq);
  const links = list(src.sideLinks);
  const body = str(src.body);
  const head = {
    title: str(src.title),
    lead: str(src.lead),
    seoDescription: str(src.seoDescription),
    stepsTitle: str(src.stepsTitle),
    contact: str(src.contact),
    body: body.length <= CHUNK ? body : '',
    facts: facts.map((f) => ({ label: str(f.label), value: str(f.value) })),
    steps: steps.map((s) => ({ track: str(s.track), title: str(s.title), period: str(s.period), who: str(s.who), body: str(s.body), linkLabel: str(s.linkLabel) })),
    faq: faq.map((x) => ({ question: str(x.question), answer: str(x.answer) })),
    links: links.map((l) => str(l.label)),
  };
  const t = await translate(lang, head);
  if (!t.ok) throw new Fail(t.error);
  let tBody = t.value.body;
  if (body.length > CHUNK) {
    await sleep(pace());
    const long = await translateLong(lang, body);
    if (!long.ok) throw new Fail(long.error);
    tBody = long.value;
  }
  const note = OFFICIAL_TEXTS[slug]?.[lang];
  const v = t.value;
  const nul = (s: string) => s || null;
  await d.update({
    documentId,
    locale: lang,
    data: {
      title: v.title.slice(0, 255),
      slug,
      lead: nul(v.lead),
      body: note ? `${note}\n\n${tBody}` : tBody,
      seoDescription: nul(v.seoDescription.slice(0, 180)),
      stepsTitle: nul(v.stepsTitle),
      contact: nul(v.contact),
      facts: facts.map((f, i) => ({ label: v.facts[i].label, value: v.facts[i].value, icon: f.icon ?? 'diger' })),
      steps: steps.map((s, i) => ({
        track: nul(v.steps[i].track),
        title: v.steps[i].title,
        period: nul(v.steps[i].period),
        who: nul(v.steps[i].who),
        body: nul(v.steps[i].body),
        linkLabel: nul(v.steps[i].linkLabel),
        linkUrl: s.linkUrl ?? null,
      })),
      faq: faq.map((_, i) => ({ question: v.faq[i].question, answer: v.faq[i].answer })),
      sideLinks: links.map((l, i) => ({ label: v.links[i], url: l.url })),
    },
  });
  await d.publish({ documentId, locale: lang });
}

/** Bölmə: az-da dolu, ru/en-də BOŞ sahələr (sətir yoxdursa yaradılır). */
const UNIT_TEXT = ['about', 'mission', 'receptionHours', 'functions', 'services', 'results', 'strategy', 'establishedNote', 'building'];
const UNIT_COPY = ['floor', 'room', 'phoneExt', 'email'];

async function unitTasks(strapi: Core.Strapi): Promise<Task[]> {
  const d = docs(strapi, 'api::unit.unit');
  const tasks: Task[] = [];
  const az = await d.findMany({ locale: 'az', status: 'published', populate: { extraBlocks: true, links: true, onlineServices: true }, limit: 500 });
  for (const u of az) {
    const documentId = str(u.documentId);
    for (const lang of LANGS) {
      const cur = await d.findOne({ documentId, locale: lang, status: 'draft', populate: { extraBlocks: true, links: true, onlineServices: true } });
      const need = UNIT_TEXT.filter((f) => str(u[f]) && !str(cur?.[f]));
      const blocks = list(u.extraBlocks).length > 0 && !list(cur?.extraBlocks).length;
      const lnk = list(u.links).length > 0 && !list(cur?.links).length;
      const onl = list(u.onlineServices).length > 0 && !list(cur?.onlineServices).length;
      if (cur && !need.length && !blocks && !lnk && !onl) continue;
      tasks.push({
        key: `unit:${documentId}:${lang}`,
        label: `${str(u.slug)} (${lang})`,
        run: () => translateUnit(strapi, u, cur, lang, need, blocks, lnk, onl),
      });
    }
  }
  return tasks;
}

async function translateUnit(strapi: Core.Strapi, az: Row, cur: Row | null, lang: Lang, need: string[], blocks: boolean, lnk: boolean, onl: boolean): Promise<void> {
  const d = docs(strapi, 'api::unit.unit');
  const documentId = str(az.documentId);
  const payload: Row = {};
  if (!cur) payload.name = str(az.name);
  for (const f of need) payload[f] = str(az[f]);
  if (blocks) payload.extraBlocks = list(az.extraBlocks).map((b) => ({ title: str(b.title), body: str(b.body) }));
  if (lnk) payload.links = list(az.links).map((l) => str(l.label));
  if (onl) payload.onlineServices = list(az.onlineServices).map((l) => str(l.label));
  const t = await translate(lang, payload);
  if (!t.ok) throw new Fail(t.error);
  const v = t.value as Row;
  const data: Row = {};
  if (!cur) Object.assign(data, { name: v.name, slug: str(az.slug) });
  for (const f of need) data[f] = v[f];
  for (const f of UNIT_COPY) if (str(az[f]) && !str(cur?.[f])) data[f] = az[f];
  if (blocks) data.extraBlocks = list(az.extraBlocks).map((b, i) => ({ title: (v.extraBlocks as Row[])[i].title, body: (v.extraBlocks as Row[])[i].body, after: b.after ?? null }));
  if (lnk) data.links = list(az.links).map((l, i) => ({ label: (v.links as string[])[i], url: l.url }));
  if (onl) data.onlineServices = list(az.onlineServices).map((l, i) => ({ label: (v.onlineServices as string[])[i], url: l.url }));
  // Dərc: yeni dil və ya dərc olunmuş + qaralamada dərc olunmamış redaktə YOXDURSA.
  let publish = !cur;
  if (cur) {
    const pub = await d.findOne({ documentId, locale: lang, status: 'published' });
    publish = Boolean(pub) && time(cur.updatedAt) <= time(pub?.updatedAt) + 1000;
  }
  await d.update({ documentId, locale: lang, data });
  if (publish) await d.publish({ documentId, locale: lang });
}

/** Sənəd: `titleRu/En`, `descriptionRu/En` boşdursa (dilsiz tip). */
async function docTasks(strapi: Core.Strapi): Promise<Task[]> {
  const d = docs(strapi, 'api::document.document');
  const all = await d.findMany({ status: 'draft', limit: 1000 });
  const tasks: Task[] = [];
  for (const lang of LANGS) {
    const T = lang === 'en' ? 'titleEn' : 'titleRu';
    const D = lang === 'en' ? 'descriptionEn' : 'descriptionRu';
    const todo = all.filter((x) => (str(x.title) && !str(x[T])) || (str(x.description) && !str(x[D])));
    for (let i = 0; i < todo.length; i += 25) {
      const batch = todo.slice(i, i + 25);
      tasks.push({
        key: `docs:${lang}:${batch.map((x) => str(x.documentId)).join(',').slice(0, 120)}`,
        label: `sənəd adları (${lang}, ${batch.length})`,
        run: async () => {
          const payload = batch.map((x) => ({ title: !str(x[T]) ? str(x.title) : '', description: str(x.description) && !str(x[D]) ? str(x.description) : '' }));
          const t = await translate(lang, payload);
          if (!t.ok) throw new Fail(t.error);
          for (let k = 0; k < batch.length; k++) {
            const x = batch[k];
            const data: Row = {};
            if (payload[k].title) data[T] = t.value[k].title.slice(0, 255);
            if (payload[k].description) data[D] = t.value[k].description;
            if (!Object.keys(data).length) continue;
            const documentId = str(x.documentId);
            const pub = await d.findOne({ documentId, status: 'published' });
            const pending = Boolean(pub) && time(x.updatedAt) > time(pub?.updatedAt) + 1000;
            await d.update({ documentId, data });
            if (pub && !pending) await d.publish({ documentId });
          }
        },
      });
    }
  }
  return tasks;
}

// ── İş ───────────────────────────────────────────────────────────────────────
async function run(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  const done = new Set(((await store.get({ key: DONE_KEY })) as string[] | null) ?? []);
  const tries = ((await store.get({ key: TRIES_KEY })) as Record<string, number> | null) ?? {};
  const tasks = [...(await pageTasks(strapi)), ...(await unitTasks(strapi)), ...(await docTasks(strapi))].filter(
    (t) => !done.has(t.key) && (tries[t.key] ?? 0) < MAX_TRIES,
  );
  strapi.log.info(`${TAG}: tərcümə olunacaq: ${tasks.length} (səhifə, bölmə, sənəd adları; ru/en).`);
  const ok: string[] = [];
  const failed: string[] = [];
  const failedKeys: string[] = [];
  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    try {
      await t.run();
      done.add(t.key);
      ok.push(t.label);
      await store.set({ key: DONE_KEY, value: [...done] });
    } catch (e) {
      tries[t.key] = (tries[t.key] ?? 0) + 1;
      failed.push(`${t.label}: ${(e as Error).message.slice(0, 120)}`);
      failedKeys.push(t.key);
      await store.set({ key: TRIES_KEY, value: tries });
    }
    if ((i + 1) % 5 === 0) strapi.log.info(`${TAG}: ${i + 1}/${tasks.length} (uğurlu ${ok.length}, xəta ${failed.length}).`);
    await sleep(pace());
  }
  const left = failedKeys.filter((k) => (tries[k] ?? 0) < MAX_TRIES).length;
  if (!left) await store.set({ key: MARKER, value: true });
  strapi.log.info(`${TAG}: hazırdır — tərcümə olundu ${ok.length}${ok.length ? ` (${ok.slice(0, 40).join(', ')}${ok.length > 40 ? ' …' : ''})` : ''}.`);
  if (failed.length) {
    strapi.log.warn(`${TAG}: alınmadı ${failed.length}${left ? ' — növbəti başlanğıcda yenidən' : ''}: ${failed.slice(0, 15).join(' | ')}`);
  }
}

export async function startTranslateMissing(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  const force = process.env.TRANSLATE_MISSING === 'true';
  if (!force && (await store.get({ key: MARKER })) === true) return;
  if (!isMock() && !(process.env.GEMINI_API_KEY || '').trim()) {
    strapi.log.warn(`${TAG}: GEMINI_API_KEY yoxdur — tərcümə edilmədi (açar əlavə olunanda növbəti başlanğıcda).`);
    return;
  }
  if (force) {
    await store.set({ key: TRIES_KEY, value: {} });
    await store.set({ key: DONE_KEY, value: [] });
  }
  strapi.log.info(`${TAG}: çatışmayan ru/en məzmunun tərcüməsi ARXA PLANDA — port bloklanmır.`);
  setTimeout(() => {
    void run(strapi).catch((e: Error) => strapi.log.error(`${TAG}: ${e.message}`));
  }, intEnv('TRANSLATE_DELAY_MS', 45_000));
}
