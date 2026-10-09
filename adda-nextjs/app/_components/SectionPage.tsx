// F5.45 — sağ panelli səhifə şablonu (layout = bolmeli | qebul).
//
// İxtisas səhifəsinin (ixtisaslar/[slug]) dizayn dili: başlıq + fakt
// zolağı, iki sütun, hər bölmə öz `<section id>`-i, yan paneldə sticky
// mündəricat (ProgramToc) — mobildə başlıqdan sonra çip cərgəsi. Mətndəki
// hər «## » başlıq ayrıca bölmədir; «Trayektoriya» addımları, kataloqdan
// canlı blok (AdmissionData) və «Suallar» strukturlaşdırılmış sahələrdən.
// Boş sahə render olunmur. `qebul` — üstəlik «Qəbul» qırıntısı və yan
// paneldə «Sual ver» (müraciət forması, «Qəbul məsələləri» istiqaməti).
// F5.46: `tehsil` — «Təhsil» qırıntısı (kataloq) və «Sual ver» → «Tədris
// prosesi və sənədlər».
import Link from 'next/link';
import { marked } from 'marked';
import SiteHeaderStack from './SiteHeaderStack';
import Footer from './Footer';
import CorrectionIsland from './CorrectionIsland';
import ExpandBlock from './ExpandBlock';
import ProgramToc from './ProgramToc';
import { AdminProvider } from './AdminGate';
import { BlockTitle } from './AdminOnly';
import { AllLevels, LevelTable, OpenDays, SideSummary } from './AdmissionData';
import type { Article, EventItem, MenuLink, PageDoc, PageStep, SiteMenu } from '@/lib/strapi';
import { BLOCK_TAB, englishRows, rowsForTab, stats, type AdmissionRow } from '@/lib/admission';
import { tr, fallbackNotice, type Locale } from '@/lib/i18n';
import { isExternalHref, localHref, localizeLinks } from '@/lib/md-links';

const PAGE_UID = 'api::page.page';

/** page.fact `icon` → Tabler ikonu. */
const FACT_ICON: Record<string, string> = {
  tarix: 'ti-calendar-event',
  muddet: 'ti-clock',
  yer: 'ti-users',
  haqq: 'ti-cash',
  bal: 'ti-chart-bar',
  dil: 'ti-language',
  forma: 'ti-building-bank',
  sened: 'ti-file-text',
  imtahan: 'ti-pencil',
  diplom: 'ti-certificate',
  unvan: 'ti-map-pin',
  telefon: 'ti-phone',
  qrup: 'ti-category',
  bina: 'ti-building',
  qoruma: 'ti-shield-check',
  gemi: 'ti-ship',
  kitab: 'ti-books',
  diger: 'ti-star',
};

// ── Mətn köməkçiləri ─────────────────────────────────────────────────────────
const AZ_FOLD: Record<string, string> = { ə: 'e', ı: 'i', ö: 'o', ü: 'u', ş: 's', ç: 'c', ğ: 'g' };
const RU_TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm',
  н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

/** Başlıqdan lövbər: «Qəbul olunanlar üçün: sənədlər» → qebul-olunanlar-ucun-senedler (ru transliterasiya ilə). */
export function sectionId(title: string): string {
  const low = title.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
  let out = '';
  for (const ch of low) out += AZ_FOLD[ch] ?? RU_TRANSLIT[ch] ?? ch;
  return out
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'bolme';
}

interface Section {
  id: string;
  title: string;
  md: string;
}

/** Markdown-u «## » başlıqlara görə bölür; ilk başlıqdan əvvəlki hissə giriş mətnidir. */
function splitSections(md: string): { intro: string; sections: Section[] } {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const sections: Section[] = [];
  const intro: string[] = [];
  let cur: { title: string; lines: string[] } | null = null;
  let fence = false;
  for (const line of lines) {
    if (/^\s*```/.test(line)) fence = !fence;
    const m = !fence ? line.match(/^##\s+(.+?)\s*#*\s*$/) : null;
    if (m) {
      if (cur) sections.push({ id: '', title: cur.title, md: cur.lines.join('\n').trim() });
      cur = { title: m[1].replace(/\*\*/g, '').trim(), lines: [] };
    } else if (cur) {
      cur.lines.push(line);
    } else {
      intro.push(line);
    }
  }
  if (cur) sections.push({ id: '', title: cur.title, md: cur.lines.join('\n').trim() });
  return { intro: intro.join('\n').trim(), sections };
}

const isExternal = isExternalHref;
export { localHref };

/** marked HTML-i: daxili keçidlərə dil, xarici keçidlər yeni vərəqdə, cədvəl sürüşən qabda. */
function polishHtml(html: string, locale: Locale): string {
  return localizeLinks(html, locale)
    .replace(/<table>/g, '<div class="qb-table-scroll"><table>')
    .replace(/<\/table>/g, '</table></div>');
}

async function mdHtml(md: string, locale: Locale): Promise<string> {
  return md ? polishHtml(await marked.parse(md), locale) : '';
}

function LinkOut({ href, locale, className, children }: { href: string; locale: Locale; className?: string; children: React.ReactNode }) {
  const h = localHref(href, locale);
  if (isExternal(h)) {
    const blank = !/^mailto:|^tel:/i.test(h);
    return (
      <a href={h} className={className} {...(blank ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {children}
      </a>
    );
  }
  if (h.startsWith('#')) {
    return (
      <a href={h} className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={h} className={className}>
      {children}
    </Link>
  );
}

/** Addımlar: trayektoriya üzrə qruplar (sıra ilk görünüşə görə), hər qrupda nömrə 1-dən. */
function Steps({ steps, locale }: { steps: PageStep[]; locale: Locale }) {
  const groups: { track: string; items: PageStep[] }[] = [];
  for (const s of steps) {
    const track = (s.track ?? '').trim();
    const g = groups.find((x) => x.track === track);
    if (g) g.items.push(s);
    else groups.push({ track, items: [s] });
  }
  return (
    <>
      {groups.map((g) => (
        <div key={g.track || '-'} className="qb-track">
          {g.track ? <h3 className="un-sub-title">{g.track}</h3> : null}
          <ol className="qb-steps">
            {g.items.map((s, i) => (
              <li key={i} className="qb-step">
                <span className="qb-step-n" aria-hidden="true">
                  {i + 1}
                </span>
                <div className="qb-step-b">
                  {s.period || s.who ? (
                    <div className="qb-step-meta">
                      {s.period ? (
                        <span className="qb-chip">
                          <i className="ti ti-calendar-event" aria-hidden="true" />
                          {s.period}
                        </span>
                      ) : null}
                      {s.who ? (
                        <span className="qb-chip qb-chip--who">
                          <i className="ti ti-building" aria-hidden="true" />
                          {s.who}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                  <h3 className="qb-step-h">{s.title}</h3>
                  {s.body ? <p className="qb-step-p">{s.body}</p> : null}
                  {s.linkUrl ? (
                    <LinkOut href={s.linkUrl} locale={locale} className="qb-step-link">
                      {s.linkLabel || tr('Ətraflı', locale)}
                      <i className="ti ti-arrow-right" aria-hidden="true" />
                    </LinkOut>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </>
  );
}

export interface SectionPageData {
  /** Kataloq sətirləri (proqram blokları üçün). */
  rows?: AdmissionRow[];
  /** Açıq qapı günləri. */
  events?: EventItem[];
  news?: Article[];
  /** Server vaxtı (ms) — «növbəti / ötən» bölgüsü. */
  now?: number;
}

export interface SectionPageProps {
  locale: Locale;
  menu: SiteMenu | null;
  doc: PageDoc;
  slug: string;
  isFallback?: boolean;
  data: SectionPageData;
  correctionLabels: Record<string, string>;
}

export default async function SectionPage({ locale, menu, doc, slug, isFallback, data, correctionLabels }: SectionPageProps) {
  const isQebul = doc.layout === 'qebul';
  const isTehsil = doc.layout === 'tehsil';
  const block = doc.dataBlock ?? 'yox';
  const facts = (doc.facts ?? []).filter((f) => f.label && f.value);
  const steps = (doc.steps ?? []).filter((s) => s.title);
  const faq = (doc.faq ?? []).filter((q) => q.question && q.answer);
  const sideLinks = (doc.sideLinks ?? []).filter((l): l is MenuLink => Boolean(l?.label && l?.url));

  const { intro, sections } = splitSections(doc.body ?? '');
  const used = new Set<string>(['trayektoriya', 'ixtisaslar', 'suallar']);
  for (const s of sections) {
    let id = sectionId(s.title);
    for (let n = 2; used.has(id); n++) id = `${sectionId(s.title)}-${n}`;
    used.add(id);
    s.id = id;
  }
  const introHtml = await mdHtml(intro, locale);
  const sectionHtml = await Promise.all(sections.map((s) => mdHtml(s.md, locale)));
  const contactHtml = await mdHtml(doc.contact ?? '', locale);

  // ── Canlı blok ──
  const rows = data.rows ?? [];
  const tab = BLOCK_TAB[block];
  const blockRows = tab ? rowsForTab(rows, tab) : block === 'ingilis' ? englishRows(rows) : block === 'qebul_cedveli' ? rows : [];
  const blockStats = blockRows.length ? stats(blockRows) : null;
  const openDays = block === 'aciq_qapi';
  const blockHas = openDays || blockRows.length > 0;
  const blockTitle = openDays
    ? tr('Növbəti açıq qapı günü', locale)
    : block === 'qebul_cedveli'
      ? tr('İxtisaslar üzrə cədvəl', locale)
      : tr('İxtisaslar, yer sayı və haqq', locale);

  const tracks = new Set(steps.map((s) => (s.track ?? '').trim()));
  const stepsTitle =
    (doc.stepsTitle ?? '').trim() ||
    tr(isQebul ? (tracks.size > 1 ? 'Qəbul trayektoriyaları' : 'Qəbul trayektoriyası') : 'Addım-addım', locale);
  const faqTitle = tr('Tez-tez verilən suallar', locale);

  // Sıra: giriş → trayektoriya → canlı blok → mətn bölmələri → suallar.
  const toc = [
    ...(steps.length ? [{ id: 'trayektoriya', label: stepsTitle }] : []),
    ...(blockHas ? [{ id: 'ixtisaslar', label: blockTitle }] : []),
    ...sections.map((s) => ({ id: s.id, label: s.title })),
    ...(faq.length ? [{ id: 'suallar', label: faqTitle }] : []),
  ];
  let tint = 0;
  const nextTint = () => (tint++ % 2 === 1 ? ' un-block--tint' : '');

  const notice = isFallback ? fallbackNotice(locale) : null;
  // Qırıntı və «Sual ver»: qəbul → abituriyent bələdçisi; təhsil → kataloq.
  const crumb = isQebul
    ? { href: `/${locale}/bunlar-ucun/abituriyentler`, label: tr('Qəbul', locale) }
    : isTehsil
      ? { href: `/${locale}/ixtisaslar`, label: tr('Təhsil', locale) }
      : null;
  const cta = isQebul
    ? { text: tr('Qəbul məsələləri üzrə Akademiyaya onlayn yazın.', locale), href: `/${locale}/vetendaslarin-muracieti?istiqamet=qebul` }
    : isTehsil
      ? {
          text: tr('Tədris prosesi, təcrübə və sənədlər üzrə Akademiyaya onlayn yazın.', locale),
          href: `/${locale}/vetendaslarin-muracieti?istiqamet=tedris`,
        }
      : null;
  const sideHas = Boolean(toc.length || sideLinks.length || contactHtml || cta || blockStats);

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main className="qb-page">
        <section className="np-hero">
          <div className="container np-hero-inner">
            <div className="np-eyebrow">{tr(isQebul ? 'Qəbul' : isTehsil ? 'Təhsil' : 'Səhifə', locale)}</div>
            <h1 className="np-h1">{doc.title}</h1>
            {doc.lead ? <p className="np-lead">{doc.lead}</p> : null}
            {crumb ? (
              <nav className="un-crumbs" aria-label={crumb.label}>
                <Link href={crumb.href}>{crumb.label}</Link>
                <span className="un-crumb-sep">/</span> <span className="un-crumb-cur">{doc.title}</span>
              </nav>
            ) : null}
            {facts.length ? (
              <ul className="un-facts" aria-label={tr('Əsas faktlar', locale)}>
                {facts.map((f, i) => (
                  <li className="un-fact" key={i}>
                    <i className={`ti ${FACT_ICON[f.icon ?? 'diger'] ?? 'ti-star'}`} aria-hidden="true" />
                    <span className="un-fact-k">{f.label}</span>
                    <span className="un-fact-v">{f.value}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>

        <div className="container">
          <ProgramToc items={toc} variant="mobile" />

          {notice ? (
            <div role="status" className="qb-notice">
              {notice}
            </div>
          ) : null}

          <AdminProvider>
            <div className={'un-layout' + (sideHas ? '' : ' un-layout--single')}>
              <div className="un-main">
                {introHtml ? (
                  <section className={'un-block' + nextTint()}>
                    <div className="prose" dangerouslySetInnerHTML={{ __html: introHtml }} />
                  </section>
                ) : null}

                {steps.length ? (
                  <section id="trayektoriya" className={'un-block pr-anchor' + nextTint()}>
                    <BlockTitle uid={PAGE_UID} title={stepsTitle} documentId={doc.documentId} locale={locale} />
                    <Steps steps={steps} locale={locale} />
                  </section>
                ) : null}

                {blockHas ? (
                  <section id="ixtisaslar" className={'un-block pr-anchor' + nextTint()}>
                    <h2 className="un-block-title">{blockTitle}</h2>
                    {openDays ? (
                      <OpenDays events={data.events ?? []} news={data.news ?? []} locale={locale} now={data.now ?? 0} />
                    ) : block === 'qebul_cedveli' ? (
                      <AllLevels rows={blockRows} locale={locale} />
                    ) : (
                      <LevelTable rows={blockRows} locale={locale} showLevel={block === 'ingilis'} />
                    )}
                  </section>
                ) : null}

                {sections.map((s, i) => (
                  <section key={s.id} id={s.id} className={'un-block pr-anchor' + nextTint()}>
                    <BlockTitle uid={PAGE_UID} title={s.title} documentId={doc.documentId} locale={locale} />
                    <div className="prose" dangerouslySetInnerHTML={{ __html: sectionHtml[i] }} />
                  </section>
                ))}

                {faq.length ? (
                  <section id="suallar" className={'un-block pr-anchor' + nextTint()}>
                    <BlockTitle uid={PAGE_UID} title={faqTitle} documentId={doc.documentId} locale={locale} />
                    <div className="un-expand-group">
                      {faq.map((q, i) => (
                        <ExpandBlock key={i} label={q.question}>
                          <p className="prose" style={{ whiteSpace: 'pre-line' }}>
                            {q.answer}
                          </p>
                        </ExpandBlock>
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>

              {sideHas ? (
                <aside className="un-side">
                  {blockStats && block !== 'qebul_cedveli' ? <SideSummary s={blockStats} locale={locale} /> : null}

                  <ProgramToc items={toc} variant="desktop" />

                  {/* «Sual ver» mündəricatdan dərhal sonra — uzun yan paneldə də görünsün. */}
                  {cta ? (
                    <div className="qb-cta">
                      <b>{tr('Sualınız var?', locale)}</b>
                      <small>{cta.text}</small>
                      <Link href={cta.href} className="qb-btn">
                        {tr('Sual ver', locale)}
                        <i className="ti ti-arrow-right" aria-hidden="true" />
                      </Link>
                    </div>
                  ) : null}

                  {sideLinks.length ? (
                    <div>
                      <div className="un-sub-title">{tr('Faydalı keçidlər', locale)}</div>
                      <div className="qb-side-links">
                        {sideLinks.map((l, i) => (
                          <LinkOut key={i} href={l.url} locale={locale} className="un-link-btn">
                            <i className={'ti ' + (isExternal(l.url) ? 'ti-external-link' : 'ti-arrow-right')} aria-hidden="true" />
                            {l.label}
                          </LinkOut>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {contactHtml ? (
                    <div>
                      <div className="un-sub-title">{tr('Əlaqə', locale)}</div>
                      <div className="un-side-text qb-contact" dangerouslySetInnerHTML={{ __html: contactHtml }} />
                    </div>
                  ) : null}

                  <CorrectionIsland targetType="page" targetSlug={slug} title={doc.title} locale={locale} labels={correctionLabels} />
                </aside>
              ) : null}
            </div>
          </AdminProvider>
          <div style={{ paddingBottom: '48px' }} />
        </div>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
