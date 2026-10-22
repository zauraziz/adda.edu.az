/**
 * F5.57 — media kitabxanasının «Qaydalar» və «Təlimat» qovluqları (ADDA-TL-001…027,
 * ADDA-ƏP-001…004) üzrə BİR DƏFƏLİK miqrasiyalar. Məzmun: qaydalar-content.ts.
 *
 *   1. Sənədlər (`qaydaDocs:v1`): hər qayda və təlimat üçün «1. Məzmun — Sənəd»
 *      (kateqoriya «qayda» / «telimat») — yoxdursa yaradılır və dərc olunur; varsa
 *      yalnız boş «Səhifə» (url) doldurulur və «diger» → yeni kateqoriya. Fayl
 *      adındakı koddan tapılır; bir kodun bir neçə faylı varsa seed-in `prefer`-i
 *      (TL-012 — «Daxili intizam qaydaları», TL-006 — PDF), yoxsa ən yenisi.
 *   2. Səhifələr (`qaydaPages:v1`, section-pages.ts qaydası): reyestr
 *      (dataBlock=qaydalar) və 12 yeni səhifə; fayl keçidləri `{{TL:n}}`, `{{EP:n}}`.
 *      «Fəxri doktorlarımız» və «Akademik dürüstlük bəyannaməsi» yer tutanlarının
 *      məsul redaktoru yeni səhifəyə keçir.
 *   3. Mətn (`qaydaText:v1`): mövcud səhifələrin seed mətnində dəqiq fraqment
 *      (yekun attestasiyaya «İmtahan günü», əcnəbilərin hazırlıq kursları, «6 və ya
 *      12 ay» → «6 və ya 9 ay») — birbaşa bazada, hər dilin qaralama VƏ dərc olunmuş
 *      sətrində, redaktə tarixi saxlanılır (poliklinika-fix.ts kimi). Fraqment
 *      tapılmasa (redaktor dəyişib) toxunulmur, logda.
 *   4. Yan keçidlər (`qaydaLinks:v1`): mövcud səhifələrə — keçid artıq yoxdursa.
 *   5. Menyu (`qaydaMenu:v1`): «hazırlanır» keçidləri → yeni səhifələr; «Hüquqi baza
 *      və etika», «Heyət», «Dəniz praktikası», «Tələbə üçün» qruplarına keçidlər,
 *      «Təhsil»-ə yeni «Tədris qaydaları» qrupu (yoxdursa).
 *
 * Hər addım öz markeri ilə, xətası digərlərini dayandırmır. Birbaşa bazaya yazandan
 * sonra sayt yenilənir (site-revalidate.ts).
 */
import type { Core } from '@strapi/strapi';
import { applySectionPages } from './section-pages';
import { absUrl, hasPendingDraft, unitTargets, type Docs, type MediaFile } from './esasnameler';
import { requestSiteRevalidate } from './site-revalidate';
import type { LinkSeed, QebulPageSeed } from './qebul-pages-content';
import {
  QAYDA_PAGES,
  RULE_DOCS,
  RULE_MENU_ADD,
  RULE_MENU_RULES,
  RULE_PAGE_LINKS,
  TEXT_FIXES,
  ruleCode,
  type RuleDocSeed,
  type RulePrefix,
} from './qaydalar-content';

type Row = Record<string, unknown>;

const PAGE_UID = 'api::page.page';
const DOC_UID = 'api::document.document';
const TAG = '[qayda] F5.57';

interface Q {
  findMany: (a: Row) => Promise<Row[]>;
  updateMany: (a: Row) => Promise<{ count: number }>;
}

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const list = (v: unknown): Row[] => (Array.isArray(v) ? (v as Row[]) : []);
const docs = (strapi: Core.Strapi, uid: string) => strapi.documents(uid as never) as unknown as Docs;
const store = (strapi: Core.Strapi) => strapi.store({ type: 'plugin', name: 'adda-admin' });
const q = (strapi: Core.Strapi, uid: string) => strapi.db.query(uid as never) as unknown as Q;

// ── Media: qayda və təlimat faylları ─────────────────────────────────────────
export type RuleFiles = Map<string, MediaFile[]>;

/** «ADDA_-TL-024_…», «ADDA-TL_010…», «ADDA-EP-003…» → { prefix, code }. */
export function ruleCodeOf(name: string): { prefix: RulePrefix; code: number } | null {
  const m = /ADDA[-_ ]*(TL|EP|ƏP)[-_ ]*0*(\d{1,3})(?!\d)/i.exec(name);
  if (!m) return null;
  return { prefix: m[1].toUpperCase() === 'TL' ? 'TL' : 'EP', code: Number(m[2]) };
}

const fileKey = (prefix: RulePrefix, code: number): string => `${prefix}:${code}`;

export async function ruleFiles(strapi: Core.Strapi): Promise<RuleFiles> {
  const rows = await q(strapi, 'plugin::upload.file').findMany({
    where: { name: { $containsi: 'ADDA' } },
    select: ['id', 'name', 'url', 'ext', 'createdAt'],
    orderBy: { createdAt: 'desc' },
  });
  const out: RuleFiles = new Map();
  for (const r of rows) {
    const name = str(r.name);
    const code = ruleCodeOf(name);
    if (!code || !/\.(pdf|docx?)$/i.test(str(r.ext) || name)) continue;
    const key = fileKey(code.prefix, code.code);
    const arr = out.get(key) ?? [];
    arr.push({ id: Number(r.id), name, url: absUrl(str(r.url)) });
    out.set(key, arr);
  }
  return out;
}

/** Sənədin bütün faylları (ən yenisi əvvəl) və seçilən fayl. */
export function filesOf(seed: RuleDocSeed, files: RuleFiles): { all: MediaFile[]; pick: MediaFile | null } {
  const all = files.get(fileKey(seed.prefix, seed.fileCode ?? seed.code)) ?? [];
  const pick = (seed.prefer && all.find((f) => seed.prefer!.test(f.name))) || all[0] || null;
  return { all, pick };
}

const seedOf = (prefix: RulePrefix, code: number): RuleDocSeed | undefined =>
  RULE_DOCS.find((d) => d.prefix === prefix && d.code === code);

/** `{{TL:n}}` / `{{EP:n}}` → faylın ünvanı; tapılmasa keçid atılır. */
export function resolveRuleLinks(links: LinkSeed[] | undefined, files: RuleFiles): LinkSeed[] {
  const out: LinkSeed[] = [];
  for (const l of links ?? []) {
    const m = /^\{\{(TL|EP):(\d+)\}\}$/.exec(l.url);
    if (!m) {
      out.push(l);
      continue;
    }
    const prefix = m[1] as RulePrefix;
    const code = Number(m[2]);
    const seed = seedOf(prefix, code);
    const f = seed ? filesOf(seed, files).pick : (files.get(fileKey(prefix, code)) ?? [])[0];
    if (f) out.push({ label: l.label, url: f.url });
  }
  return out;
}

function withFiles(seed: QebulPageSeed, files: RuleFiles): QebulPageSeed {
  return { ...seed, az: { ...seed.az, sideLinks: resolveRuleLinks(seed.az.sideLinks, files) } };
}

// ── 1. Sənədlər ──────────────────────────────────────────────────────────────
const DOCS_MARKER = 'qaydaDocs:v1';

export async function applyRuleDocsV1(strapi: Core.Strapi, files: RuleFiles): Promise<void> {
  const st = store(strapi);
  if ((await st.get({ key: DOCS_MARKER })) === true) return;
  const d = docs(strapi, DOC_UID);
  const all = await d.findMany({ status: 'draft', populate: { file: { fields: ['id', 'name'] } }, limit: 2000 });
  const created: string[] = [];
  const patched: string[] = [];
  const missing: string[] = [];
  const extra: string[] = [];

  for (const r of RULE_DOCS) {
    const code = ruleCode(r.prefix, r.code);
    const { all: codeFiles, pick } = filesOf(r, files);
    if (codeFiles.length > 1) extra.push(`${code}: ${codeFiles.length} fayl, bağlanan «${pick?.name ?? ''}»`);
    const ids = new Set(codeFiles.map((f) => f.id));
    const mine = all.filter((x) => ids.has(Number((x.file as Row | null)?.id ?? 0)) || str(x.title).includes(code));
    if (!mine.length) {
      if (!pick) {
        missing.push(code);
        continue;
      }
      const units = await unitTargets(strapi, r.units ?? []);
      const doc = await d.create({
        data: {
          title: `${r.title} (${code})`,
          description: r.description.slice(0, 500),
          category: r.category,
          file: pick.id,
          url: r.url ?? null,
          ...(units.length ? { units: { connect: units } } : {}),
        },
      });
      await d.publish({ documentId: str(doc.documentId) });
      created.push(code);
      continue;
    }
    for (const x of mine) {
      const data: Row = {};
      if (str(x.category) === 'diger' || !str(x.category)) data.category = r.category;
      if (!str(x.url) && r.url) data.url = r.url;
      if (!str(x.description)) data.description = r.description.slice(0, 500);
      if (!Object.keys(data).length) continue;
      const documentId = str(x.documentId);
      const { published, pending } = await hasPendingDraft(d, documentId, x);
      await d.update({ documentId, data });
      if (published && !pending) await d.publish({ documentId });
      patched.push(code + (published && pending ? ' (qaralama — dərc redaktorda)' : ''));
    }
  }

  await st.set({ key: DOCS_MARKER, value: true });
  strapi.log.info(
    `${TAG}: qayda və təlimat sənədləri — yaradıldı ${created.length}: ${created.join(', ') || 'yox'}; yeniləndi: ${patched.join(', ') || 'yox'}` +
      (missing.length ? `; media kitabxanasında faylı tapılmadı: ${missing.join(', ')}` : '') +
      '.',
  );
  if (extra.length) strapi.log.warn(`${TAG}: eyni kodlu bir neçə fayl (artıqlarını admində silin): ${extra.join('; ')}.`);
}

// ── 2. Səhifələr ─────────────────────────────────────────────────────────────
export async function applyQaydaPagesV1(strapi: Core.Strapi, files: RuleFiles): Promise<void> {
  await applySectionPages(strapi, {
    marker: 'qaydaPages:v1',
    tag: TAG,
    layout: 'akademiya',
    backupPrefix: 'qaydaPages',
    pages: QAYDA_PAGES.map((pg) => withFiles(pg, files)),
    dropIfUnassigned: [],
    ownerMoves: RULE_MENU_RULES.filter((r) => r.ownerFrom).map((r) => ({
      from: r.ownerFrom as string,
      slug: r.to.replace(/^\/sehife\//, ''),
      label: r.newLabel ?? r.label,
    })),
    source: 'src/utils/qaydalar-content.ts',
  });
}

// ── 3. Mövcud səhifələrin mətni ──────────────────────────────────────────────
const TEXT_MARKER = 'qaydaText:v1';

/** Saf funksiya: fraqment dəqiq bir dəfədirsə əvəz olunur; artıq tətbiq olunubsa və ya yoxdursa — null. */
export function applyTextFix(body: string, find: string, replace: string, doneIf: string): string | null {
  if (!body || body.includes(doneIf)) return null;
  const at = body.indexOf(find);
  if (at < 0 || body.indexOf(find, at + find.length) >= 0) return null;
  return body.slice(0, at) + replace + body.slice(at + find.length);
}

export async function applyQaydaTextV1(strapi: Core.Strapi): Promise<number> {
  const st = store(strapi);
  if ((await st.get({ key: TEXT_MARKER })) === true) return 0;
  const repo = q(strapi, PAGE_UID);
  const done: string[] = [];
  const skipped: string[] = [];
  let rowsChanged = 0;
  for (const f of TEXT_FIXES) {
    const rows = await repo.findMany({
      where: { slug: f.slug, locale: f.locale },
      select: ['id', 'body', 'updatedAt', 'publishedAt'],
    });
    const key = `${f.slug} (${f.locale})`;
    if (!rows.length) {
      skipped.push(`${key}: səhifə yoxdur`);
      continue;
    }
    let n = 0;
    let already = 0;
    for (const r of rows) {
      const body = typeof r.body === 'string' ? r.body : '';
      if (body.includes(f.doneIf)) {
        already++;
        continue;
      }
      const next = applyTextFix(body, f.find, f.replace, f.doneIf);
      if (next === null) continue;
      await repo.updateMany({ where: { id: r.id }, data: { body: next, updatedAt: r.updatedAt } });
      n++;
    }
    rowsChanged += n;
    if (n) done.push(`${key}: ${n} sətir`);
    else if (!already) skipped.push(`${key}: seed mətni dəyişib — toxunulmadı`);
  }
  await st.set({ key: TEXT_MARKER, value: true });
  strapi.log.info(`${TAG}: mətn düzəlişləri — ${done.join('; ') || 'yox'}.`);
  if (skipped.length) strapi.log.warn(`${TAG}: mətn düzəlişi tətbiq olunmadı (admində əl ilə): ${skipped.join('; ')}. Mətn: src/utils/qaydalar-content.ts (TEXT_FIXES).`);
  return rowsChanged;
}

// ── 4. Yan keçidlər ──────────────────────────────────────────────────────────
const LINKS_MARKER = 'qaydaLinks:v1';

export async function applyQaydaLinksV1(strapi: Core.Strapi, files: RuleFiles): Promise<void> {
  const st = store(strapi);
  if ((await st.get({ key: LINKS_MARKER })) === true) return;
  const d = docs(strapi, PAGE_UID);
  const done: string[] = [];
  const skipped: string[] = [];
  for (const pl of RULE_PAGE_LINKS) {
    const links = resolveRuleLinks(pl.links, files);
    if (!links.length) {
      skipped.push(`${pl.slug} (fayl yoxdur)`);
      continue;
    }
    const az = await d.findFirst({ locale: 'az', status: 'draft', filters: { slug: { $eq: pl.slug } }, populate: { sideLinks: true } });
    if (!az) {
      skipped.push(`${pl.slug} (səhifə yoxdur)`);
      continue;
    }
    const cur = list(az.sideLinks);
    const fresh = links.filter((l) => !cur.some((c) => str(c.url) === l.url || str(c.label) === l.label));
    if (!fresh.length) {
      skipped.push(`${pl.slug} (keçid var)`);
      continue;
    }
    const documentId = str(az.documentId);
    const { published, pending } = await hasPendingDraft(d, documentId, az, 'az');
    await d.update({
      documentId,
      locale: 'az',
      data: { sideLinks: [...cur.map((l) => ({ id: l.id, label: l.label, url: l.url })), ...fresh.map((l) => ({ label: l.label, url: l.url }))] },
    });
    if (published && !pending) await d.publish({ documentId, locale: 'az' });
    done.push(`${pl.slug} +${fresh.length}${published && pending ? ' (qaralama)' : ''}`);
  }
  await st.set({ key: LINKS_MARKER, value: true });
  strapi.log.info(`${TAG}: yan keçidlər — ${done.join(', ') || 'yox'}${skipped.length ? `; ötürüldü: ${skipped.join(', ')}` : ''}.`);
}

// ── 5. Menyu ─────────────────────────────────────────────────────────────────
const MENU_MARKER = 'qaydaMenu:v1';
const keepLink = (l: Row): Row => ({ id: l.id, label: l.label, url: l.url });

/** Saf funksiya (sınaq üçün): menyunun yeni vəziyyəti və qeydlər. */
export function planRuleMenu(menu: Row): { data: Row; changed: boolean; notes: string[] } {
  const notes: string[] = [];
  let changed = false;

  const rewrite = (l: Row): Row => {
    const label = str(l.label);
    const url = str(l.url);
    const rule = RULE_MENU_RULES.find((r) => r.label === label);
    if (!rule || url === rule.to) return keepLink(l);
    if (!rule.old.includes(url)) {
      notes.push(`«${label}»: admin ünvanı dəyişib (${url}) — toxunulmadı`);
      return keepLink(l);
    }
    changed = true;
    notes.push(`«${label}» → ${rule.to}${rule.newLabel ? ` («${rule.newLabel}»)` : ''}`);
    return { ...keepLink(l), url: rule.to, label: rule.newLabel ?? l.label };
  };

  const addTo = (category: string, group: string, links: Row[]): Row[] => {
    const add = RULE_MENU_ADD.find((a) => a.category === category && a.group === group && !a.create);
    if (!add) return links;
    const fresh = add.links.filter((n) => !links.some((l) => str(l.url) === n.url));
    if (!fresh.length) return links;
    const at = add.after ? links.findIndex((l) => str(l.label) === add.after) : -1;
    changed = true;
    notes.push(`«${group}» + ${fresh.map((n) => `«${n.label}»`).join(', ')}`);
    return at >= 0 ? [...links.slice(0, at + 1), ...fresh, ...links.slice(at + 1)] : [...links, ...fresh];
  };

  const cats = (key: 'esasMenyu' | 'ustMenyu') =>
    list(menu[key]).map((c) => {
      const category = str(c.label);
      const groups: Row[] = list(c.groups).map((g) => {
        let links = list(g.links).map(rewrite);
        if (key === 'esasMenyu') links = addTo(category, str(g.title), links);
        return { id: g.id, title: g.title, links };
      });
      if (key === 'esasMenyu') {
        for (const a of RULE_MENU_ADD.filter((x) => x.create && x.category === category)) {
          const g = groups.find((x) => str(x.title) === a.group);
          if (g) {
            const cur = list(g.links);
            const fresh = a.links.filter((n) => !cur.some((l) => str(l.url) === n.url));
            if (fresh.length) {
              g.links = [...cur, ...fresh];
              changed = true;
              notes.push(`«${a.group}» + ${fresh.map((n) => `«${n.label}»`).join(', ')}`);
            }
          } else {
            groups.push({ title: a.group, links: a.links.map((l) => ({ label: l.label, url: l.url })) });
            changed = true;
            notes.push(`«${category}» + yeni qrup «${a.group}» (${a.links.length} keçid)`);
          }
        }
      }
      return { id: c.id, label: c.label, order: c.order, url: c.url, groups };
    });

  const data: Row = {
    esasMenyu: cats('esasMenyu'),
    ustMenyu: cats('ustMenyu'),
    footerMenyusu: list(menu.footerMenyusu).map((c) => ({ id: c.id, title: c.title, links: list(c.links).map(rewrite) })),
  };
  return { data, changed, notes };
}

export async function applyQaydaMenuV1(strapi: Core.Strapi): Promise<void> {
  const st = store(strapi);
  if ((await st.get({ key: MENU_MARKER })) === true) return;
  const d = strapi.documents('api::menu.menu' as never) as unknown as {
    findFirst: (a: Row) => Promise<Row | null>;
    update: (a: Row) => Promise<Row>;
  };
  const menu = await d.findFirst({
    populate: {
      esasMenyu: { populate: { groups: { populate: { links: true } } } },
      ustMenyu: { populate: { groups: { populate: { links: true } } } },
      footerMenyusu: { populate: { links: true } },
    },
  });
  if (!menu) {
    strapi.log.warn(`${TAG}: menyu tapılmadı — keçidlər yenilənmədi.`);
    return;
  }
  const { data, changed, notes } = planRuleMenu(menu);
  if (changed) await d.update({ documentId: menu.documentId, data });

  // Məsul redaktor qeydində ünvan: açarı eyni qalan yer tutan (page:<slug>) — /hazirlanir/… → /sehife/….
  // Açarı dəyişənlər (fəxri doktor, akademik dürüstlük) səhifələr addımında köçür (ownerMoves).
  const owners = q(strapi, 'api::page-owner.page-owner');
  let paths = 0;
  for (const r of RULE_MENU_RULES.filter((x) => !x.ownerFrom)) {
    const slug = r.to.replace(/^\/sehife\//, '');
    const res = await owners
      .updateMany({ where: { key: `page:${slug}`, path: { $in: r.old.filter(Boolean) } }, data: { path: r.to } })
      .catch(() => ({ count: 0 }));
    paths += res.count;
  }
  await st.set({ key: MENU_MARKER, value: true });
  strapi.log.info(
    `${TAG}: menyu — ${notes.length ? notes.join('; ') : 'dəyişiklik yoxdur'}` + (paths ? `; məsul redaktor qeydlərində ünvan: ${paths}` : '') + '.',
  );
}

// ── Zəncir ───────────────────────────────────────────────────────────────────
export async function applyQaydalarF557(strapi: Core.Strapi): Promise<void> {
  const files = await ruleFiles(strapi);
  const run = async <T>(name: string, fn: () => Promise<T>): Promise<T | undefined> => {
    try {
      return await fn();
    } catch (e) {
      strapi.log.error(`${TAG}: ${name}: ${(e as Error).message}`);
      return undefined;
    }
  };
  await run('sənədlər', () => applyRuleDocsV1(strapi, files));
  await run('səhifələr', () => applyQaydaPagesV1(strapi, files));
  const text = await run('mətn', () => applyQaydaTextV1(strapi));
  await run('yan keçidlər', () => applyQaydaLinksV1(strapi, files));
  await run('menyu', () => applyQaydaMenuV1(strapi));
  // Birbaşa bazaya yazılan mətn Document Service-dən keçmir — sayta ayrıca xəbər.
  if (text) requestSiteRevalidate(strapi, 'qaydalar');
}
