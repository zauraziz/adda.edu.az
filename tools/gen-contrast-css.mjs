#!/usr/bin/env node
// F5.49 — yüksək kontrast rejimi: adda-nextjs/app/_styles/43-a11y.css yaradır.
//
// NƏ EDİR. Bütün üslub fayllarındakı `color:` qaydalarını oxuyur və hər
// birini <html data-contrast="high"> altında YENİDƏN yazır (eyni sıra, eyni
// nisbi spesifiklik — kaskad dəyişmir, :hover/aktiv hallar öz yerində qalır),
// zəif olanları isə düzəldərək:
//   - açıq fonda (ağ, açıq boz, açıq qızılı) mətn eyni çalarda tündləşir — ≥ 7:1;
//   - tünd fonda (navy zolaqlar, footer, hero, mobil menyu) yarımşəffaf və ya
//     solğun mətn açılır — ≥ 7:1;
//   - orta fonda (qızılı düymələr) mətn ən yaxın keçərli tünd/açıq rəngə keçir.
//
// FONU NECƏ BİLİR. CSS-dən hər seçicinin öz fonu (background, background-color)
// və JSX-dən (app/**/*.tsx, TypeScript parseri ilə) elementlərin iç-içəliyi
// oxunur: element → ən yaxın fonu olan valideyn (komponent istifadə yerləri də
// izlənir). Eyni sinif həm açıq, həm tünd fonda işlənirsə, tünd fon üçün ayrıca
// əhatəli qayda yazılır (məs. `.statsec .stx-note`).
//
// NİYƏ GENERATOR. Rənglər 40-dan çox faylda əl ilə yazılıb (tokenlə yox) —
// yalnız dəyişənləri dəyişmək onları tutmur. Üslub və ya komponent dəyişəndə
// yenidən işlət:
//   cd adda-nextjs && npm run gen:contrast          (--report: düzəlişlərin siyahısı)
//   cd adda-nextjs && npm run gen:contrast -- --check   (qapı: fayl aktualdırmı)
// VACİB: fayl BÜTÜN «color» qaydalarını təkrarlayır — CSS-də rəng dəyişib
// generator işlədilməsə, yüksək kontrast rejimində KÖHNƏ rəng qalır.
// Yeni asılılıq yoxdur: `typescript` layihənin öz devDependency-sidir.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'adda-nextjs');
const require = createRequire(path.join(ROOT, 'package.json'));
const ts = require('typescript');
const STYLES = path.join(ROOT, 'app', '_styles');
const OUT = path.join(STYLES, '43-a11y.css');
const FILES = [
  path.join(ROOT, 'styles', 'globals.css'),
  ...readdirSync(STYLES)
    .filter((f) => f.endsWith('.css') && f !== '43-a11y.css')
    .sort()
    .map((f) => path.join(STYLES, f)),
];
const PREFIX = 'html[data-contrast="high"]';
const TARGET = 7; // AAA
const REPORT = process.argv.includes('--report');
/**
 * Fonu CSS rəngi ilə yox, şəkil/foto ilə qurulan tünd bölmələr (fon rəngi
 * tapılmır, mətn ağdır). Yeni belə bölmə əlavə olunanda bura yaz.
 */
const DARK_EXTRA = ['.hero', '.hero-wrap', '.np-hero', '.na-hero', '#siteHeader', 'header', 'footer', '.gov-banner', '.mega-cta', '.mc-card', '.vquote', '.cl-photo', '.nx-card', '.sx-card', '.cmp'];
/** Naməlum tünd/açıq fon üçün ehtiyat istinad rəngləri. */
const REF_DARK = [14, 77, 115]; // --navy-700 (tünd fonların ən açığı)
const REF_LIGHT = [243, 246, 249]; // ağ və açıq bozların ən tündü

// ── CSS oxuma ────────────────────────────────────────────────────────────────
function stripComments(s) {
  return s.replace(/\/\*[\s\S]*?\*\//g, '');
}
/** Mötərizə və dırnaq içində olmayan ilk `stop` simvolu. */
function scan(s, i, stops) {
  let depth = 0;
  let q = null;
  for (; i < s.length; i++) {
    const c = s[i];
    if (q) {
      if (c === '\\') i++;
      else if (c === q) q = null;
      continue;
    }
    if (c === '"' || c === "'") q = c;
    else if (c === '(') depth++;
    else if (c === ')') depth--;
    else if (depth === 0 && stops.includes(c)) return i;
  }
  return -1;
}
function blockEnd(s, i) {
  let depth = 1;
  let q = null;
  for (; i < s.length; i++) {
    const c = s[i];
    if (q) {
      if (c === '\\') i++;
      else if (c === q) q = null;
      continue;
    }
    if (c === '"' || c === "'") q = c;
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return i;
  }
  return s.length;
}
function parse(src, media = []) {
  const rules = [];
  let i = 0;
  const s = src;
  while (i < s.length) {
    const j = scan(s, i, ['{', ';', '}']);
    if (j < 0) break;
    const prelude = s.slice(i, j).trim();
    if (s[j] !== '{') {
      i = j + 1;
      continue;
    }
    const end = blockEnd(s, j + 1);
    const body = s.slice(j + 1, end);
    if (prelude.startsWith('@media') || prelude.startsWith('@supports')) {
      rules.push(...parse(body, [...media, prelude]));
    } else if (!prelude.startsWith('@')) {
      const decls = [];
      let k = 0;
      while (k < body.length) {
        const e = scan(body, k, [';']);
        const d = body.slice(k, e < 0 ? body.length : e).trim();
        const c = d.indexOf(':');
        if (c > 0) decls.push({ prop: d.slice(0, c).trim().toLowerCase(), value: d.slice(c + 1).trim() });
        if (e < 0) break;
        k = e + 1;
      }
      rules.push({ selector: prelude, decls, media });
    }
    i = end + 1;
  }
  return rules;
}
function splitSelectors(sel) {
  sel = sel.replace(/\s+/g, ' ');
  const out = [];
  let i = 0;
  while (i <= sel.length) {
    const j = scan(sel, i, [',']);
    out.push(sel.slice(i, j < 0 ? sel.length : j).trim());
    if (j < 0) break;
    i = j + 1;
  }
  return out.filter(Boolean);
}

// ── Seçici: birləşmə hissələri (compound) ────────────────────────────────────
const STATE = /:(hover|focus|focus-visible|focus-within|active|visited|checked|target|disabled)\b/;
/** `:not(...)`, `:is(...)` və s. funksional psevdoları və atributları at. */
function stripFunctional(s) {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '[') {
      const j = s.indexOf(']', i);
      i = j < 0 ? s.length : j;
      continue;
    }
    if (s[i] === ':') {
      const m = s.slice(i).match(/^::?[\w-]+\(/);
      if (m) {
        let depth = 0;
        let k = i + m[0].length - 1;
        for (; k < s.length; k++) {
          if (s[k] === '(') depth++;
          else if (s[k] === ')' && --depth === 0) break;
        }
        i = k;
        continue;
      }
    }
    out += s[i];
  }
  return out;
}
function parseCompound(raw) {
  const s = stripFunctional(raw).replace(/::?[\w-]+/g, '');
  return {
    raw,
    cls: [...s.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].map((m) => m[1]),
    ids: [...s.matchAll(/#(-?[_a-zA-Z][\w-]*)/g)].map((m) => m[1]),
    tag: (s.match(/^([a-zA-Z][\w-]*)/) ?? [])[1]?.toLowerCase() ?? '',
    pseudoEl: /::[\w-]+|:(before|after|marker|placeholder|selection)\b/.test(raw),
    state: STATE.test(raw),
  };
}
function compounds(sel) {
  const parts = [];
  let cur = '';
  let pending = '';
  let depth = 0;
  let br = 0;
  let q = null;
  const close = () => {
    if (cur.trim()) {
      parts.push({ ...parseCompound(cur.trim()), comb: parts.length ? pending || ' ' : '' });
      pending = '';
    }
    cur = '';
  };
  for (let i = 0; i < sel.length; i++) {
    const c = sel[i];
    if (q) {
      cur += c;
      if (c === q) q = null;
      continue;
    }
    if (c === '"' || c === "'") q = c;
    else if (c === '(') depth++;
    else if (c === ')') depth--;
    else if (c === '[') br++;
    else if (c === ']') br--;
    if (depth === 0 && br === 0 && (/\s/.test(c) || c === '>' || c === '+' || c === '~')) {
      close();
      if (c !== ' ' && !/\s/.test(c)) pending = c;
      continue;
    }
    cur += c;
  }
  close();
  return parts;
}
const hasTokens = (c) => c.cls.length > 0 || c.ids.length > 0 || Boolean(c.tag);
/** Əcdad hissələri: qonşu kombinatorlu (`a + b`, `a ~ b`) hissə əcdad deyil. */
const ancestorParts = (cs, k) => cs.slice(0, k).filter((c, i) => hasTokens(c) && !['+', '~'].includes(cs[i + 1]?.comb));

// ── Rəng ─────────────────────────────────────────────────────────────────────
const NAMED = { white: [255, 255, 255, 1], black: [0, 0, 0, 1], transparent: [0, 0, 0, 0] };
const VARS = {};
function resolveVars(v, seen = new Set()) {
  return v.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)/g, (_, name, fb) => {
    if (seen.has(name)) return fb ?? '';
    const val = VARS[name];
    if (val === undefined) return fb ?? '';
    return resolveVars(val, new Set([...seen, name]));
  });
}
function parseColor(str) {
  const v = str.trim().toLowerCase();
  if (NAMED[v]) return NAMED[v];
  let m = v.match(/^#([0-9a-f]{3,8})$/);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    const n = (k) => parseInt(h.slice(k, k + 2), 16);
    return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1];
  }
  m = v.match(/^rgba?\(([^)]+)\)$/);
  if (m) {
    const p = m[1].split(/[\s,/]+/).filter(Boolean);
    const num = (x) => (x.endsWith('%') ? (parseFloat(x) * 255) / 100 : parseFloat(x));
    const a = p[3] === undefined ? 1 : p[3].endsWith('%') ? parseFloat(p[3]) / 100 : parseFloat(p[3]);
    return [num(p[0]), num(p[1]), num(p[2]), a];
  }
  return null;
}
/** Dəyərdəki bütün rənglər (qradiyent üçün). */
function colorsIn(value) {
  const v = resolveVars(value);
  const found = v.match(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|\b(?:white|black)\b/g) ?? [];
  return found.map(parseColor).filter(Boolean);
}
const lin = (c) => {
  const x = c / 255;
  return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
};
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const over = ([r, g, b, a], [R, G, B]) => [r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a)];
function toHsl([r, g, b]) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h /= 6;
  }
  return [h, s, l];
}
function fromHsl([h, s, l]) {
  const f = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [f(p, q, h + 1 / 3) * 255, f(p, q, h) * 255, f(p, q, h - 1 / 3) * 255];
}
const clamp = (x) => Math.round(Math.max(0, Math.min(255, x)));
const hex = (c) => '#' + c.slice(0, 3).map((x) => clamp(x).toString(16).padStart(2, '0')).join('');
/** Eyni çalarda işıqlığı `dir` istiqamətində dəyiş — `bg`-yə qarşı ≥ TARGET. */
function shift(rgb, bg, dir) {
  const [h, s, l0] = toHsl(rgb);
  let l = l0;
  let c = rgb.slice(0, 3);
  while (ratio(c, bg) < TARGET && (dir < 0 ? l > 0 : l < 1)) {
    l = Math.max(0, Math.min(1, l + dir * 0.01));
    c = fromHsl([h, s, l]);
  }
  return c;
}
const fmt = (c, a = 1) =>
  a >= 0.995 ? hex(c) : `rgba(${c.slice(0, 3).map(clamp).join(',')},${String(Math.round(a * 100) / 100).replace(/^0/, '')})`;

// ── CSS toplama ──────────────────────────────────────────────────────────────
const ALL = [];
for (const f of FILES) {
  const rules = parse(stripComments(readFileSync(f, 'utf8').replace(/\r\n?/g, '\n')));
  for (const r of rules) r.file = path.basename(f);
  ALL.push(...rules);
}
ALL.forEach((r, i) => (r.order = i));
for (const r of ALL) {
  if (/^(:root|html)$/.test(r.selector.trim()) && !r.media.length) {
    for (const d of r.decls) if (d.prop.startsWith('--')) VARS[d.prop] = d.value;
  }
}

// ── Fon xəritəsi: seçici → tünd / açıq / orta ───────────────────────────────
function classify(rgb) {
  const L = lum(rgb);
  return L < 0.2 ? 'dark' : L > 0.55 ? 'light' : 'mid';
}
function bgOfRule(r) {
  const decl = r.decls.filter((d) => d.prop === 'background' || d.prop === 'background-color' || d.prop === 'background-image').pop();
  if (!decl) return null;
  const v = resolveVars(decl.value).trim().toLowerCase();
  if (/^(transparent|none|initial|inherit|unset)\b/.test(v)) return { kind: 'none' };
  const cs = colorsIn(decl.value);
  if (!cs.length) return null; // yalnız şəkil — naməlum
  const a = cs.reduce((s, c) => s + c[3], 0) / cs.length;
  if (a < 0.02) return { kind: 'none' };
  let avg = [0, 1, 2].map((k) => cs.reduce((s, c) => s + c[k], 0) / cs.length);
  let stops = null;
  if (cs.length > 1) {
    // qradiyent: mətn ən çətin nöqtədə də oxunmalıdır — tünd fonda ən açıq,
    // açıq fonda ən tünd dayanacaq
    const sorted = [...cs].sort((p, q) => lum(p) - lum(q));
    const k = classify(avg);
    if (k === 'dark') avg = sorted[sorted.length - 1].slice(0, 3);
    else if (k === 'light') avg = sorted[0].slice(0, 3);
    else stops = [sorted[0].slice(0, 3), sorted[sorted.length - 1].slice(0, 3)]; // orta (qızılı qradiyent)
  }
  // yarımşəffaf tünd örtük (foto üstündə) tünd sayılır; digər yarımşəffaf fon
  // valideynin fonu üzərinə qoyulur (contextsOf), burada ağ üstündə ilkin təxmin
  const dark = a >= 0.45 && a < 0.95 && lum(avg) < 0.2;
  const rgb = a >= 0.95 || dark ? avg : over([...avg, a], [255, 255, 255]);
  return { kind: classify(rgb), rgb, avg, a: dark ? 1 : a, stops: a >= 0.95 ? stops : null };
}
const BG = []; // { subj, anc, kind, rgb, avg, a, scope, order }
for (const r of ALL) {
  const bg = bgOfRule(r);
  if (!bg) continue;
  for (const sel of splitSelectors(r.selector)) {
    const cs = compounds(sel);
    const subj = cs[cs.length - 1];
    // hal (:hover, [aria-pressed]) və psevdo-element fonu konteksti təyin etmir
    if (!subj || subj.pseudoEl || cs.some((c) => c.state) || subj.raw.includes('[') || !hasTokens(subj)) continue;
    if (/^(html|body|:root)$/.test(subj.raw)) continue;
    BG.push({ subj, anc: ancestorParts(cs, cs.length - 1), ...bg, scope: subj.raw, order: r.order });
  }
}
for (const sel of DARK_EXTRA) {
  const [subj] = compounds(sel);
  BG.push({ subj, anc: [], kind: 'dark', rgb: REF_DARK, avg: REF_DARK, a: 1, scope: sel, order: -1, photo: true });
}

// ── JSX: elementlərin iç-içəliyi ─────────────────────────────────────────────
function listTsx(dir) {
  const out = [];
  for (const name of readdirSync(dir).sort()) {
    if (name.startsWith('.') || name === 'node_modules') continue;
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) out.push(...listTsx(p));
    else if (name.endsWith('.tsx')) out.push(p);
  }
  return out;
}
function resolveModule(from, spec) {
  let base = null;
  if (spec.startsWith('.')) base = path.resolve(path.dirname(from), spec);
  else if (spec.startsWith('@/')) base = path.join(ROOT, spec.slice(2));
  if (!base) return null;
  for (const ext of ['', '.tsx', '.ts', '/index.tsx', '/index.ts']) {
    const p = base + ext;
    if (existsSync(p) && statSync(p).isFile()) return p;
  }
  return null;
}
const NODES = []; // { id, file, owner, kind: 'el'|'use', tag, cls:Set, sure:Set, maybe:Set, ids:Set, parent, comp?, empty? }
const all2 = (x) => [...x.sure, ...x.maybe];
const IMPORTS = new Map();
const DEFAULT_ALIAS = new Map();

const TOKEN = /^-?[_a-zA-Z][\w-]*$/;
/**
 * className ifadəsindən siniflər: `sure` — hər halda olan, `maybe` — şərti
 * (`a ? 'x is-active' : 'x'` → sure {x}, maybe {is-active}). İfadəyə bitişik
 * yarımçıq ad (`np-chip--${kind}`) atılır.
 */
function tokSets(n, consts, depth = 0) {
  const S = (sure = [], maybe = []) => ({ sure: new Set(sure), maybe: new Set(maybe) });
  const all = (x) => [...x.sure, ...x.maybe];
  /** Mətn parçası: ifadəyə bitişik (boşluqsuz) ilk/son ad yarımçıqdır. */
  const piece = (text, cutStart, cutEnd) => {
    const toks = text.split(/\s+/);
    if (cutStart && !/^\s/.test(text)) toks.shift();
    if (cutEnd && !/\s$/.test(text)) toks.pop();
    return toks.filter((t) => TOKEN.test(t));
  };
  if (!n) return S();
  if (ts.isJsxExpression(n) || ts.isParenthesizedExpression(n) || ts.isAsExpression(n) || ts.isNonNullExpression(n)) return tokSets(n.expression, consts, depth);
  if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) return S(piece(n.text, false, false));
  if (ts.isTemplateExpression(n)) {
    const sure = piece(n.head.text, false, true);
    const maybe = [];
    n.templateSpans.forEach((sp, i) => {
      maybe.push(...all(tokSets(sp.expression, consts, depth)));
      sure.push(...piece(sp.literal.text, true, i < n.templateSpans.length - 1));
    });
    return S(sure, maybe);
  }
  if (ts.isConditionalExpression(n)) {
    const a = tokSets(n.whenTrue, consts, depth);
    const b = tokSets(n.whenFalse, consts, depth);
    const sure = [...a.sure].filter((t) => b.sure.has(t));
    return S(sure, [...all(a), ...all(b)].filter((t) => !sure.includes(t)));
  }
  if (ts.isBinaryExpression(n)) {
    if (n.operatorToken.kind === ts.SyntaxKind.PlusToken) {
      // 'a b ' + x: sətir hissəsinin ifadəyə bitişik adı yarımçıqdır
      const l = ts.isStringLiteral(n.left) ? S(piece(n.left.text, false, true)) : tokSets(n.left, consts, depth);
      const r = ts.isStringLiteral(n.right) ? S(piece(n.right.text, true, false)) : tokSets(n.right, consts, depth);
      return S([...l.sure, ...r.sure], [...l.maybe, ...r.maybe]);
    }
    return S([], [...all(tokSets(n.left, consts, depth)), ...all(tokSets(n.right, consts, depth))]);
  }
  if (ts.isArrayLiteralExpression(n)) {
    const sure = [];
    const maybe = [];
    for (const e of n.elements) {
      const t = tokSets(e, consts, depth);
      (ts.isStringLiteral(e) ? sure : maybe).push(...all(t));
    }
    return S(sure, maybe);
  }
  if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && ['join', 'filter', 'trim'].includes(n.expression.name.text)) {
    return tokSets(n.expression.expression, consts, depth);
  }
  if (ts.isIdentifier(n) && consts.has(n.text) && depth < 3) return tokSets(consts.get(n.text), consts, depth + 1);
  // digər (funksiya çağırışı və s.): içindəki bütün sətirlər — şərti
  const maybe = [];
  const visit = (x) => {
    if (ts.isStringLiteral(x) || ts.isNoSubstitutionTemplateLiteral(x)) maybe.push(...piece(x.text, false, false));
    ts.forEachChild(x, visit);
  };
  visit(n);
  return S([], maybe);
}
function scanFile(file) {
  const sf = ts.createSourceFile(file, readFileSync(file, 'utf8').replace(/\r\n?/g, '\n'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const imports = new Map();
  const consts = new Map();
  const top = new Set();
  for (const st of sf.statements) {
    if (ts.isImportDeclaration(st) && st.importClause && ts.isStringLiteral(st.moduleSpecifier)) {
      const target = resolveModule(file, st.moduleSpecifier.text);
      if (!target) continue;
      if (st.importClause.name) imports.set(st.importClause.name.text, { file: target, name: 'default' });
      const nb = st.importClause.namedBindings;
      if (nb && ts.isNamedImports(nb)) for (const el of nb.elements) imports.set(el.name.text, { file: target, name: (el.propertyName ?? el.name).text });
    }
    const isDefault = ts.canHaveModifiers(st) && (ts.getModifiers(st) ?? []).some((m) => m.kind === ts.SyntaxKind.DefaultKeyword);
    if (ts.isFunctionDeclaration(st)) {
      const name = st.name?.text ?? 'default';
      top.add(name);
      if (isDefault) DEFAULT_ALIAS.set(file, name);
    }
    if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name)) top.add(d.name.text);
    if (ts.isExportAssignment(st) && ts.isIdentifier(st.expression)) DEFAULT_ALIAS.set(file, st.expression.text);
  }
  const collectConsts = (n) => {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer) consts.set(n.name.text, n.initializer);
    ts.forEachChild(n, collectConsts);
  };
  collectConsts(sf);
  IMPORTS.set(file, imports);

  const isTopDecl = (n) =>
    (ts.isFunctionDeclaration(n) && n.parent === sf) ||
    (ts.isVariableDeclaration(n) &&
      n.parent?.parent?.parent === sf &&
      n.initializer &&
      (ts.isArrowFunction(n.initializer) || ts.isFunctionExpression(n.initializer)));
  const add = (node) => {
    node.id = NODES.length;
    NODES.push(node);
    return node.id;
  };
  const walk = (n, owner, parent) => {
    if (isTopDecl(n)) owner = n.name?.text ?? 'default';
    if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n)) {
      const open = ts.isJsxElement(n) ? n.openingElement : n;
      const tag = open.tagName.getText(sf);
      let id;
      if (/^[a-z]/.test(tag)) {
        let sure = new Set();
        let maybe = new Set();
        const ids = new Set();
        for (const a of open.attributes.properties) {
          if (!ts.isJsxAttribute(a) || !a.initializer) continue;
          const an = a.name.getText(sf);
          if (an === 'className') ({ sure, maybe } = tokSets(a.initializer, consts));
          else if (an === 'id') for (const t of all2(tokSets(a.initializer, consts))) ids.add(t);
        }
        for (const t of sure) maybe.delete(t);
        // mətni olmayan boş element (<span className="k-dot" />) — rəng qaydasının konteksti deyil
        const empty = ts.isJsxSelfClosingElement(n) && !['i', 'input', 'textarea', 'select', 'svg'].includes(tag);
        // birbaşa mətn (və ya mətn ola biləcək ifadə) və ikon şrifti
        const text =
          tag === 'i' ||
          (ts.isJsxElement(n) && n.children.some((ch) => (ts.isJsxText(ch) && ch.text.trim()) || (ts.isJsxExpression(ch) && ch.expression)));
        id = add({ file, owner, kind: 'el', tag, cls: new Set([...sure, ...maybe]), sure, maybe, ids, parent, empty, text });
      } else {
        id = add({ file, owner, kind: 'use', comp: tag, parent, cls: new Set(), ids: new Set(), tag: '' });
      }
      for (const a of open.attributes.properties) walk(a, owner, id);
      if (ts.isJsxElement(n)) for (const ch of n.children) walk(ch, owner, id);
      return;
    }
    // JSX içində çağırılan/ötürülən yerli və ya import olunan funksiya (renderX(), items.map(Row))
    if (parent !== null && ts.isIdentifier(n) && !ts.isPropertyAccessExpression(n.parent) && (top.has(n.text) || imports.has(n.text))) {
      add({ file, owner, kind: 'use', comp: n.text, parent, cls: new Set(), ids: new Set(), tag: '' });
    }
    ts.forEachChild(n, (ch) => walk(ch, owner, parent));
  };
  walk(sf, null, null);
}
const TSX = [...listTsx(path.join(ROOT, 'app')), ...(existsSync(path.join(ROOT, 'lib')) ? listTsx(path.join(ROOT, 'lib')) : [])];
for (const f of TSX) scanFile(f);

// komponent istifadələri: açar `${file}#${name}`
const keyOf = (file, name) => `${file}#${name === 'default' ? (DEFAULT_ALIAS.get(file) ?? 'default') : name}`;
const USES = new Map();
for (const n of NODES) {
  if (n.kind !== 'use') continue;
  const imp = IMPORTS.get(n.file)?.get(n.comp.split('.')[0]);
  const key = imp ? keyOf(imp.file, imp.name) : keyOf(n.file, n.comp);
  if (!USES.has(key)) USES.set(key, []);
  USES.get(key).push(n.id);
}
const BY_CLASS = new Map();
const BY_TAG = new Map();
for (const n of NODES) {
  if (n.kind !== 'el') continue;
  for (const c of n.cls) (BY_CLASS.get(c) ?? BY_CLASS.set(c, []).get(c)).push(n.id);
  (BY_TAG.get(n.tag) ?? BY_TAG.set(n.tag, []).get(n.tag)).push(n.id);
}

/** Valideyn düyünləri (komponent istifadə yerləri daxil). */
function parentsOf(id) {
  const n = NODES[id];
  if (n.parent !== null) return [n.parent];
  return USES.get(keyOf(n.file, n.owner ?? 'default')) ?? [];
}
/** Bütün əcdadların token birləşməsi (seçicinin əcdad hissəsini yoxlamaq üçün). */
const ANC = new Map();
function ancestorTokens(id) {
  if (ANC.has(id)) return ANC.get(id);
  const acc = new Set();
  const seen = new Set([id]);
  const stack = [...parentsOf(id)];
  while (stack.length) {
    const p = stack.pop();
    if (seen.has(p)) continue;
    seen.add(p);
    const pn = NODES[p];
    for (const c of pn.cls) acc.add('.' + c);
    for (const i of pn.ids) acc.add('#' + i);
    if (pn.tag) acc.add(pn.tag);
    stack.push(...parentsOf(p));
  }
  ANC.set(id, acc);
  return acc;
}
const subjMatches = (s, n) => s.cls.every((c) => n.cls.has(c)) && s.ids.every((i) => n.ids.has(i)) && (!s.tag || s.tag === n.tag);
const ancMatches = (anc, id) => {
  if (!anc.length) return true;
  const at = ancestorTokens(id);
  return anc.every((a) => a.cls.every((c) => at.has('.' + c)) && a.ids.every((i) => at.has('#' + i)) && (!a.tag || at.has(a.tag)));
};
const weight = (b) => b.subj.cls.length + b.subj.ids.length * 10 + (b.subj.tag ? 0.5 : 0) + b.anc.length * 0.1;
/**
 * Elementin öz fonu: `sure` — həmişə olan siniflərlə ən spesifik qayda;
 * `maybe` — şərti sinifli (is-active, --ghost) daha spesifik qaydalar.
 */
function ownBgs(id) {
  const n = NODES[id];
  if (n.kind !== 'el') return { sure: null, maybe: [] };
  let best = null;
  const cond = [];
  for (const b of BG) {
    if (!subjMatches(b.subj, n) || !ancMatches(b.anc, id)) continue;
    const isSure = b.subj.cls.every((c) => n.sure.has(c));
    if (isSure) {
      if (!best || weight(b) > weight(best) || (weight(b) === weight(best) && b.order > best.order)) best = b;
    } else cond.push(b);
  }
  const maybe = cond.filter((b) => !best || weight(b) >= weight(best));
  return { sure: best, maybe };
}
/** Fon qaydasının «öz» əhatəsi (birləşməyə əlavə olunan hissə — tipsiz). */
const selfScope = (b) => b.subj.raw.replace(/^[a-zA-Z][\w-]*/, '');
/**
 * Elementin mətninin altındakı fon(lar): ən yaxın fonlu düyün (komponent
 * istifadə yerləri də). Yarımşəffaf fon valideynin fonu üzərinə qoyulur.
 * { kind, rgb, scope, self } — `self`: fon elementin özündədir.
 */
const CTX = new Map();
const LIGHT_ROOT = { kind: 'light', rgb: [255, 255, 255], scope: null, selfScope: '', self: false };
function contextsOf(id, guard = new Set()) {
  if (CTX.has(id)) return CTX.get(id);
  if (guard.has(id)) return [];
  guard.add(id);
  const res = [];
  const push = (x) => {
    if (!res.some((y) => y.kind === x.kind && y.scope === x.scope && y.self === x.self && Math.abs(lum(y.rgb) - lum(x.rgb)) < 0.02)) res.push(x);
  };
  let under = null;
  const parentCtx = () => {
    if (under) return under;
    const ps = parentsOf(id);
    under = [];
    for (const p of ps) for (const x of contextsOf(p, guard)) under.push({ ...x, self: false });
    if (!under.length) under = [LIGHT_ROOT];
    return under;
  };
  const resolve = (b, self) => {
    const base = { scope: b.scope, selfScope: selfScope(b), self };
    if (b.a >= 0.95) return [{ kind: b.kind, rgb: b.rgb, stops: b.stops, solid: true, ...base }];
    return parentCtx().map((u) => {
      const rgb = over([...b.avg, b.a], u.rgb);
      return { kind: classify(rgb), rgb, solid: false, ...base };
    });
  };
  const own = ownBgs(id);
  if (own.sure && own.sure.kind !== 'none') for (const x of resolve(own.sure, true)) push(x);
  else for (const x of parentCtx()) push(x);
  for (const b of own.maybe) {
    if (b.kind === 'none') {
      if (own.sure && own.sure.kind !== 'none') for (const x of parentCtx()) push({ ...x, selfScope: selfScope(b), self: true, cond: true });
      continue;
    }
    for (const x of resolve(b, true)) push({ ...x, cond: true });
  }
  guard.delete(id);
  CTX.set(id, res);
  return res;
}
// Valideyn konteksti (fonlu əcdad) daxilində elementin öz şərti fonu: əhatə
// seçicisi `.x.is-active` olur; valideyninki — `.panel .x`.
/** Ən yaxın valideyn element(lər)i (komponent qatları şəffafdır). */
function parentEls(id) {
  const out = [];
  const seen = new Set();
  const stack = [...parentsOf(id)];
  while (stack.length) {
    const p = stack.pop();
    if (seen.has(p)) continue;
    seen.add(p);
    if (NODES[p].kind === 'el') out.push(p);
    else stack.push(...parentsOf(p));
  }
  return out;
}
/** Əcdad hissələri: qonşu kombinatorlu (`a + b`, `a ~ b`) hissə əcdad deyil. */
/** Seçiciyə uyğun JSX elementləri (yoxdursa — ən yaxın uyğun əcdad hissəsi). */
function elementsFor(cs) {
  for (let k = cs.length - 1; k >= 0; k--) {
    const s = cs[k];
    if (!hasTokens(s)) continue;
    // `a`, `h2` kimi qlobal tip seçicisi — elementə bağlamaq mənasızdır
    if (!s.cls.length && !s.ids.length && cs.slice(0, k).every((c) => !c.cls.length && !c.ids.length)) return null;
    const pool = s.cls.length
      ? (BY_CLASS.get(s.cls[0]) ?? [])
      : s.ids.length
        ? NODES.filter((n) => n.ids.has(s.ids[0])).map((n) => n.id)
        : (BY_TAG.get(s.tag) ?? []);
    const direct = s.comb === '>' && k > 0 && hasTokens(cs[k - 1]) ? cs[k - 1] : null;
    const hit = pool.filter(
      (id) =>
        subjMatches(s, NODES[id]) &&
        ancMatches(ancestorParts(cs, direct ? k - 1 : k), id) &&
        (!direct || parentEls(id).some((p) => subjMatches(direct, NODES[p]))),
    );
    if (!hit.length) continue;
    const withText = k === cs.length - 1 ? hit.filter((id) => !NODES[id].empty) : hit;
    return { ids: withText.length ? withText : hit, exact: k === cs.length - 1 };
  }
  return null;
}
/** Elementin valideyninin fonu (qayda elementin öz fonunu ləğv edəndə: --ghost). */
function parentContexts(id) {
  const ps = parentsOf(id);
  const out = [];
  for (const p of ps) for (const x of contextsOf(p)) out.push({ ...x, self: false });
  return out.length ? out : [LIGHT_ROOT];
}

// ── Düzəliş ─────────────────────────────────────────────────────────────────
const sameCtx = (a, b) => a.kind === b.kind && a.scope === b.scope && a.self === b.self && a.selfScope === b.selfScope && Math.abs(lum(a.rgb) - lum(b.rgb)) < 0.02;
/**
 * Bir fon kontekstində rəngin yüksək kontrast dəyəri (lazım deyilsə null).
 * İlkin dizaynda mətn fonuna qarşı < 2:1 ola bilməz (görünməzdi) — belə
 * nəticə fonun səhv təyin olunduğunu göstərir: əks fon götürülür.
 */
function fixFor(c, ctx) {
  if (c[3] < 0.2) return null; // dekorativ su nişanı (spot-wm, stat-wm) — toxunma
  let kind = ctx.kind;
  let bg = kind === 'light' ? (lum(ctx.rgb) < lum(REF_LIGHT) ? ctx.rgb : REF_LIGHT) : ctx.rgb;
  // Tünd mətn (navy, boz) tünd fonda, açıq mətn (ağ) açıq fonda olmur — fon
  // səhv təyin olunub (mütləq yerləşdirilmiş ikon, foto): rəngin özünə inan.
  const Lc = lum(c);
  if ((kind === 'dark' || (kind === 'mid' && !ctx.solid)) && Lc < 0.2) [kind, bg] = ['light', REF_LIGHT];
  else if ((kind === 'light' || (kind === 'mid' && !ctx.solid)) && Lc > 0.5) [kind, bg] = ['dark', REF_DARK];
  if (kind === 'mid' && ctx.stops) {
    // qradiyent: tünd mətn üçün ən tünd, açıq mətn üçün ən açıq dayanacaq
    bg = Lc < lum(ctx.rgb) ? ctx.stops[0] : ctx.stops[1];
  }
  let r0 = ratio(over(c, bg), bg);
  // elementin öz bərk fonu etibarlıdır (qızılı düymədə ağ mətn — real zəif kontrast)
  if (r0 < 2 && !(ctx.self && ctx.solid)) {
    for (const [k2, alt] of [['light', REF_LIGHT], ['dark', REF_DARK]]) {
      if (k2 === kind) continue;
      const r1 = ratio(over(c, alt), alt);
      if (r1 > r0) [kind, bg, r0] = [k2, alt, r1];
    }
  }
  if (r0 >= TARGET) return null;
  const solid = over(c, bg);
  let out;
  if (kind === 'light') out = shift(solid, bg, -1);
  else if (kind === 'dark') {
    if (lum(c) >= 0.45) {
      // açıq mətn: əvvəlcə şəffaflığı azalt, çatmırsa açıqlaşdır
      for (let a = c[3]; a <= 1.0001; a += 0.02) {
        if (ratio(over([...c.slice(0, 3), a], bg), bg) >= TARGET) return fmt(c, Math.min(1, a));
      }
    }
    out = shift(over([...c.slice(0, 3), 1], bg), bg, +1);
  } else {
    // orta fon (qızılı düymə): tünd və açıq variantdan dəyişikliyi az olan
    const ok = [shift(solid, bg, -1), shift(solid, bg, +1)].filter((x) => ratio(x, bg) >= TARGET);
    out = ok.length
      ? ok.sort((p, q) => Math.abs(lum(p) - lum(solid)) - Math.abs(lum(q) - lum(solid)))[0]
      : ratio([0, 0, 0], bg) >= ratio([255, 255, 255], bg)
        ? [0, 0, 0]
        : [255, 255, 255];
  }
  return ratio(out, bg) > r0 + 0.05 ? fmt(out) : null;
}
/** Seçicini kontekstə bağla: valideyn fonu — `.statsec .x`; öz şərti fonu — `.x.is-active`. */
function scoped(sel, x) {
  if (x.self) {
    const m = sel.match(/::?(?:before|after|marker|placeholder|selection)\b.*$/);
    return m ? sel.slice(0, m.index) + x.selfScope + m[0] : sel + x.selfScope;
  }
  const m = sel.match(/^((?:html|body|:root)[^\s>+~]*)[\s>+~]+(.*)$/);
  return m ? `${m[1]} ${x.scope} ${m[2]}` : `${x.scope} ${sel}`;
}
const withPrefix = (sel) => (/^html/.test(sel) ? sel.replace(/^html/, PREFIX) : /^:root/.test(sel) ? sel.replace(/^:root/, PREFIX) : `${PREFIX} ${sel}`);

/** Rəng qaydasının (seçicinin) mətninin altındakı fonlar. */
function ruleContexts(sel, ownBgRule, c) {
  const cs = compounds(sel);
  const hit = elementsFor(cs);
  const collect = (fn) => {
    const out = [];
    for (const id of hit.ids) for (const x of fn(id)) if (!out.some((y) => sameCtx(x, y))) out.push(x);
    return out;
  };
  if (ownBgRule && ownBgRule.kind !== 'none') {
    // qaydanın öz fonu (çox vaxt :hover) — yarımşəffafdırsa elementin fonu üzərinə
    if (ownBgRule.a >= 0.95 || !hit) return { ctxs: [{ kind: ownBgRule.kind, rgb: ownBgRule.rgb, stops: ownBgRule.stops, solid: ownBgRule.a >= 0.95, scope: null, selfScope: '', self: true }], certain: true };
    const under = collect(parentContexts);
    return {
      ctxs: under.map((u) => {
        const rgb = over([...ownBgRule.avg, ownBgRule.a], u.rgb);
        return { ...u, kind: classify(rgb), rgb, solid: false };
      }),
      certain: true,
    };
  }
  if (!hit) {
    const guess = lum(c) >= 0.45 ? { kind: 'dark', rgb: REF_DARK } : { kind: 'light', rgb: [255, 255, 255] };
    return { ctxs: [{ ...guess, scope: null, selfScope: '', self: false }], certain: false };
  }
  return { ctxs: collect(ownBgRule?.kind === 'none' ? parentContexts : (id) => contextsOf(id)), certain: hit.exact };
}

/**
 * Mətni solğunlaşdıran şəffaflıq (`opacity: .5–.95`, məs. footer qurum adları
 * .78) yüksək kontrastda 1 olur. Psevdo-element (dekor), hal (:hover,
 * :disabled) və eyni sinfi gizlədən (opacity < .5) qayda olan seçici toxunulmur.
 */
const HIDERS = new Set();
for (const r of ALL) {
  const o = r.decls.filter((d) => d.prop === 'opacity').pop();
  if (!o || !(parseFloat(o.value) < 0.5)) continue;
  for (const sel of splitSelectors(r.selector)) for (const c of compounds(sel).slice(-1)[0]?.cls ?? []) HIDERS.add(c);
}
function opacityFix(r, sel) {
  const o = r.decls.filter((d) => d.prop === 'opacity').pop();
  const v = o ? parseFloat(o.value) : NaN;
  if (!(v >= 0.5 && v < 0.96)) return false;
  const cs = compounds(sel);
  const subj = cs[cs.length - 1];
  if (!subj || subj.pseudoEl || cs.some((c) => c.state) || /disabled|\[/.test(sel) || subj.cls.some((c) => HIDERS.has(c))) return false;
  // yalnız mətni olan element (dekorativ qrafika — .hero-chart — toxunulmur)
  const hit = elementsFor(cs);
  return Boolean(hit?.exact && hit.ids.some((id) => NODES[id].text));
}

const OUTLINES = []; // { media, text }
let nFix = 0;
let nScoped = 0;
let nKeep = 0;
const report = [];
const WHY = (process.argv.find((a) => a.startsWith('--why=')) ?? '').slice(6);
let nOpacity = 0;
for (const r of ALL) {
  const opSels = splitSelectors(r.selector).filter((sel) => opacityFix(r, sel));
  if (opSels.length) {
    OUTLINES.push({ media: r.media.join(' && '), text: `${opSels.map(withPrefix).join(',')}{opacity:1}` });
    nOpacity += opSels.length;
    if (REPORT) report.push(`${r.file}: ${opSels.join(', ')}  opacity -> 1`);
  }
  const colorDecls = r.decls.filter((d) => d.prop === 'color');
  if (!colorDecls.length) continue;
  const sels = splitSelectors(r.selector).filter((s) => !s.includes('::selection'));
  if (!sels.length) continue;
  const ownBgRule = bgOfRule(r);
  for (const d of colorDecls) {
    const imp = /!important/i.test(d.value) ? '!important' : '';
    const orig = d.value.replace(/\s*!important/i, '').trim();
    const c = parseColor(resolveVars(orig));
    const groups = new Map(); // dəyər → seçicilər (eyni qayda daxilində)
    const extra = []; // əhatəli əlavə qaydalar
    for (const sel of sels) {
      let value = orig;
      if (c && c[3] > 0 && !/^(html|:root)$/.test(sel) && !/disabled/.test(sel)) {
        const { ctxs, certain } = ruleContexts(sel, ownBgRule, c);
        if (WHY && sel === WHY) console.log('WHY', sel, JSON.stringify(ctxs), certain);
        // əsas kontekst: şərtsiz; açıq fon varsa o (ən çox yayılmış), yoxdursa birincisi
        const plain = ctxs.filter((x) => !x.cond);
        const pool = plain.length ? plain : ctxs;
        const base = pool.find((x) => x.kind === 'light') ?? pool[0];
        // eyni növ kontekstlərdə ən çətin fon (açıqda ən tünd, tündə ən açıq)
        const hardest = pool
          .filter((x) => x.kind === base.kind)
          .reduce((a, b) => (base.kind === 'light' ? (lum(b.rgb) < lum(a.rgb) ? b : a) : lum(b.rgb) > lum(a.rgb) ? b : a));
        const f = fixFor(c, hardest);
        if (f) {
          value = f;
          nFix++;
          if (REPORT) report.push(`${r.file}: ${sel}  ${orig} -> ${f}  [${base.kind}${certain ? '' : '?'}]`);
        } else nKeep++;
        for (const x of ctxs) {
          if (pool.includes(x) && x.kind === base.kind) continue;
          const scope = x.self ? x.selfScope : x.scope;
          if (!scope) continue;
          const fx = fixFor(c, x);
          if (!fx || fx === value) continue;
          const ss = scoped(sel, x);
          if (extra.some((e) => e.sel === ss)) continue;
          extra.push({ sel: ss, value: fx });
          nScoped++;
          if (REPORT) report.push(`${r.file}: ${ss}  ${orig} -> ${fx}  [${x.kind}, ehateli]`);
        }
      } else nKeep++;
      if (!groups.has(value)) groups.set(value, []);
      groups.get(value).push(withPrefix(sel));
    }
    const media = r.media.join(' && ');
    for (const [value, list] of groups) OUTLINES.push({ media, text: `${list.join(',')}{color:${value}${imp}}` });
    for (const e of extra) OUTLINES.push({ media, text: `${withPrefix(e.sel)}{color:${e.value}${imp}}` });
  }
}

// Tünd fonlu bölmələr (fokus halqası ağ olsun) — fon xəritəsindən
const darkScopes = [
  ...new Set(BG.filter((b) => b.kind === 'dark' && !b.anc.length && b.subj.cls.length + b.subj.ids.length <= 1 && !/[:[]/.test(b.scope)).map((b) => b.scope)),
].sort();

const header = `/* F5.49 — YÜKSƏK KONTRAST (html[data-contrast="high"]): AVTOMATİK YARADILIB.
   Əl ilə redaktə etmə: tools/gen-contrast-css.mjs (cd adda-nextjs && npm run gen:contrast).
   Bütün «color» qaydaları eyni sıra ilə təkrarlanır (kaskad dəyişmir); zəif olanlar
   fona görə düzəldilir — ≥ ${TARGET}:1. Düzəliş: ${nFix}, əhatəli: ${nScoped}, dəyişməz: ${nKeep},
   solğunlaşdıran opacity → 1: ${nOpacity}. */

/* ── Ümumi ── */
${PREFIX}{color-scheme:light}
${PREFIX} :focus-visible{outline:3px solid #000!important;outline-offset:2px!important;box-shadow:0 0 0 5px #fff!important}
${PREFIX} :is(${darkScopes.join(',')}) :focus-visible{outline-color:#fff!important;box-shadow:0 0 0 5px #000!important}
${PREFIX} :is(.prose,.na-body,.un-main,.aud-wrap,.faq-wrap) a:not([class]){text-decoration:underline;text-underline-offset:2px;text-decoration-thickness:1px}
${PREFIX} :is(input,select,textarea){border-color:#4A5A63!important}
${PREFIX} ::placeholder{color:#3F4A50;opacity:1}

/* ── «color» qaydaları (generator) ── */
`;
const chunks = [];
let curMedia = null;
let buf = [];
const flush = () => {
  if (!buf.length) return;
  if (!curMedia) chunks.push(buf.join('\n'));
  else {
    const opens = curMedia.split(' && ');
    chunks.push(opens.map((m) => `${m}{`).join('') + '\n' + buf.join('\n') + '\n' + '}'.repeat(opens.length));
  }
  buf = [];
};
for (const l of OUTLINES) {
  if (l.media !== curMedia) {
    flush();
    curMedia = l.media;
  }
  buf.push(l.text);
}
flush();
const result = header + chunks.join('\n') + '\n';
if (process.argv.includes('--check')) {
  // qapı: fayl generatorun indiki nəticəsi ilə eynidirmi (CSS dəyişib, generator işlədilməyib?)
  const cur = existsSync(OUT) ? readFileSync(OUT, 'utf8').replace(/\r\n/g, '\n') : '';
  if (cur !== result) {
    console.error('43-a11y.css KOHNEDIR: uslub ve ya komponent deyisib -- `npm run gen:contrast` islet.');
    process.exit(1);
  }
  console.log('43-a11y.css aktualdir.');
  process.exit(0);
}
writeFileSync(OUT, result);
console.log(
  `43-a11y.css: duzelis ${nFix}, ehateli ${nScoped}, deyismez ${nKeep}; JSX elementi ${NODES.filter((n) => n.kind === 'el').length}, fon qaydasi ${BG.length}`,
);
if (REPORT) console.log(report.join('\n'));
