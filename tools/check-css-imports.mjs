#!/usr/bin/env node
// F5.58 — hər səhifə istifadə etdiyi siniflərin CSS faylını import edirmi?
//
// Sayt CSS-i səhifə-səhifə import edir (app/[locale]/**/page.tsx). Komponentin
// stili yalnız BAŞQA səhifədə import olunubsa, həmin səhifədən keçəndə (klient
// naviqasiyası) stil yaddaşda qalır və komponent düzgün görünür, səhifəyə birbaşa
// girəndə isə stilsiz qalır — «bəzən» xətası (Zaur müəllim, 26.10.2026: əməkdaş
// səhifəsində «Düzəliş təklif et» düyməsi brauzerin adi düyməsi kimi görünürdü).
//
// Alət: səhifənin import ağacındakı (app/, lib/) faylların className-lərindən
// sinifləri yığır; sinif YALNIZ səhifənin (və ya ağacdakı komponentin) import
// etmədiyi CSS faylında təyin olunubsa — xəta. 43-a11y.css generatordur, sayılmır.
//
//   cd adda-nextjs && npm run check:css      (çıxış kodu 1 — tapıntı var)
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'adda-nextjs');
const APP = path.join(ROOT, 'app');
const STYLES = path.join(APP, '_styles');

function walkDir(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walkDir(p, out);
    else out.push(p);
  }
  return out;
}

// Sinif → onu təyin edən CSS faylları.
const defs = new Map();
for (const f of readdirSync(STYLES).filter((n) => n.endsWith('.css'))) {
  if (f.startsWith('43-a11y')) continue;
  const txt = readFileSync(path.join(STYLES, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of txt.matchAll(/\.([A-Za-z_][\w-]*)/g)) {
    if (!defs.has(m[1])) defs.set(m[1], new Set());
    defs.get(m[1]).add(f);
  }
}

function resolve(from, spec) {
  let base;
  if (spec.startsWith('@/')) base = path.join(ROOT, spec.slice(2));
  else if (spec.startsWith('.')) base = path.resolve(path.dirname(from), spec);
  else return null;
  for (const ext of ['', '.tsx', '.ts', '/index.tsx', '/index.ts']) {
    const p = base + ext;
    if (existsSync(p) && statSync(p).isFile()) return p;
  }
  return null;
}

const IMPORT = /import\s+(?:type\s+)?(?:[^'"]+\s+from\s+)?['"]([^'"]+)['"]/g;

function graph(entry) {
  const seen = new Set();
  const stack = [entry];
  while (stack.length) {
    const f = stack.pop();
    if (seen.has(f)) continue;
    seen.add(f);
    const src = readFileSync(f, 'utf8');
    for (const m of src.matchAll(IMPORT)) {
      if (m[1].endsWith('.css')) continue;
      const p = resolve(f, m[1]);
      if (p && (p.startsWith(APP) || p.startsWith(path.join(ROOT, 'lib'))) && /\.tsx?$/.test(p)) stack.push(p);
    }
  }
  return seen;
}

function cssImports(files) {
  const out = new Set();
  for (const f of files) {
    const src = readFileSync(f, 'utf8');
    for (const m of src.matchAll(/import\s+['"]([^'"]+\.css)['"]/g)) out.add(path.basename(m[1]));
  }
  return out;
}

function classes(f) {
  const src = readFileSync(f, 'utf8');
  const toks = new Set();
  const add = (s) => {
    for (const t of s.split(/\s+/)) if (t && !t.includes('$') && !t.includes('{')) toks.add(t);
  };
  for (const m of src.matchAll(/className=\{?["'`]([^"'`]+)["'`]/g)) add(m[1]);
  for (const m of src.matchAll(/className=\{`([^`]+)`\}/g)) add(m[1].replace(/\$\{[^}]*\}/g, ' '));
  for (const m of src.matchAll(/class=\\?"([^"\\]+)\\?"/g)) add(m[1]);
  return toks;
}

const layoutCss = cssImports([path.join(APP, 'layout.tsx')]);
const pages = walkDir(path.join(APP, '[locale]')).filter((f) => f.endsWith(`${path.sep}page.tsx`));
let problems = 0;
for (const pg of pages.sort()) {
  const files = graph(pg);
  const imported = new Set([...cssImports(files), ...layoutCss]);
  const missing = new Map();
  for (const f of files) {
    for (const t of classes(f)) {
      const where = defs.get(t);
      if (!where || [...where].some((c) => imported.has(c))) continue;
      const key = [...where].sort().join(', ');
      if (!missing.has(key)) missing.set(key, new Set());
      missing.get(key).add(t);
    }
  }
  if (!missing.size) continue;
  problems++;
  console.log(`- ${path.relative(APP, pg)}`);
  for (const [css, toks] of missing) console.log(`    ${css} ← ${[...toks].sort().slice(0, 12).join(' ')}`);
}
if (problems) {
  console.log(`\n${problems} səhifədə CSS importu çatışmır — səhifəyə (və ya komponentin özünə) import əlavə edin.`);
  process.exit(1);
}
console.log(`CSS importları tamdır (${pages.length} səhifə).`);
