// tools/check-audiences.mjs — «Bunlar üçün» kuratorlugunun qoruyucusu.
//
// NIYE LAZIMDIR: lib/audiences.ts-deki 99 link ELLE secilib. Bir sehife
// silinse ve ya slug deyisse, hemin linkler sessizce olur - tsc bunu
// TUTMUR, cunki href sadece string-dir. Bu skript uc seyi yoxlayir:
//
//   1. her etiket i18n lugetinde varmi (yoxsa ru/en-de az mətn qalir)
//   2. her href-in ilk seqmenti REAL Next marsrutudurmu
//   3. cox seqmentli her href Strapi SEED-inde varmi (yeni real sehife)
//
//   node tools/check-audiences.mjs
//
// Xeta tapilsa exit 1 — CI-a baglamaq olar.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.dirname(HERE);
const NEXT = path.join(REPO, 'adda-nextjs');

const read = (p) => fs.readFileSync(p, 'utf8');

// audiences.ts-den melumati cixar (tip annotasiyalari olmadan qiymetlendir)
const ts = read(path.join(NEXT, 'lib', 'audiences.ts'));
let body = ts.slice(ts.indexOf('=', ts.indexOf('export const AUDIENCES')) + 1);
body = body.slice(0, body.lastIndexOf(']') + 1);
const AUD = eval('(' + body + ')');

const i18n = read(path.join(NEXT, 'lib', 'i18n.ts'));
const seed = read(path.join(REPO, 'adda-strapi', 'src', 'index.ts'));
const seedUrls = new Set([...seed.matchAll(/"url":\s*"([^"]*)"/g)].map((m) => m[1]));
const routes = fs
  .readdirSync(path.join(NEXT, 'app', '[locale]'), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

const problems = [];
const keys = new Set();
const links = [];

for (const a of AUD) {
  keys.add(a.label);
  keys.add(a.lead);
  for (const s of a.steps) {
    keys.add(s.label);
    keys.add(s.note);
    links.push([a.slug, s.href]);
  }
  for (const g of a.groups) {
    keys.add(g.title);
    for (const l of g.links) {
      keys.add(l.label);
      links.push([a.slug, l.href]);
    }
  }
}

for (const k of keys) {
  if (!i18n.includes("['" + k + "'")) problems.push(`i18n lugetinde yoxdur: «${k}»`);
}

for (const [aud, href] of links) {
  const seg = href.split('/')[1];
  if (!routes.includes(seg)) {
    problems.push(`[${aud}] marsrut yoxdur: ${href} (app/[locale]/${seg} tapilmadi)`);
  } else if (href.split('/').length > 2 && !seedUrls.has(href)) {
    problems.push(`[${aud}] SEED-de yoxdur: ${href}`);
  }
}

const slugs = AUD.map((a) => a.slug);
if (new Set(slugs).size !== slugs.length) problems.push('tekrar slug var');

console.log(`auditoriya: ${AUD.length} | link: ${links.length} | unikal acar: ${keys.size}`);
if (problems.length) {
  console.error(`\nPROBLEM: ${problems.length}`);
  problems.forEach((p) => console.error('  ' + p));
  process.exit(1);
}
console.log('hamisi qaydasindadir.');
