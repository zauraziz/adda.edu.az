// F5.49 — «Tez-tez verilən suallar» (/sehife/faq, layout=faq).
//
// Səhifənin öz «Suallar»-ı (admində redaktə olunur) — «Ümumi suallar»; sonra
// saytın bütün səhifələrinin «Suallar» bölmələri mövzular üzrə AVTOMATİK
// toplanır (getFaqSources): Qəbul, Təhsil, Tələbə həyatı, Beynəlxalq əlaqələr,
// Elm və innovasiya, Akademiya. Sual bir yerdə yazılır (öz səhifəsində) və
// burada da görünür — iki nüsxə yoxdur (EHE: məlumat bir yerdə). Hər cavabın
// altında mənbə səhifəyə keçid. Axtarış — FaqSearch (klient); Google üçün
// schema.org FAQPage.
import Link from 'next/link';
import { marked } from 'marked';
import SiteHeaderStack from './SiteHeaderStack';
import Footer from './Footer';
import ExpandBlock from './ExpandBlock';
import ProgramToc from './ProgramToc';
import CorrectionIsland from './CorrectionIsland';
import FaqSearch from './FaqSearch';
import { AdminProvider } from './AdminGate';
import { BlockTitle } from './AdminOnly';
import type { FaqSource, MenuLink, PageDoc, PageFaq, PageLayout, SiteMenu } from '@/lib/strapi';
import { tr, fallbackNotice, type Locale } from '@/lib/i18n';
import { faqAnswerHtml, faqAnswerText } from '@/lib/faq-html';
import { isExternalHref, localHref, localizeLinks } from '@/lib/md-links';
import { searchFold } from '@/lib/search-fold';

const PAGE_UID = 'api::page.page';

/** Mövzular — sıra abituriyentin yolu ilə (HSE «Вопросы и ответы»). */
const GROUPS: { id: string; label: string; icon: string; layouts: Array<PageLayout | null> }[] = [
  { id: 'qebul', label: 'Qəbul', icon: 'ti-school', layouts: ['qebul'] },
  { id: 'tehsil', label: 'Təhsil', icon: 'ti-book', layouts: ['tehsil'] },
  { id: 'telebe-heyati', label: 'Tələbə həyatı', icon: 'ti-users', layouts: ['telebe'] },
  { id: 'beynelxalq', label: 'Beynəlxalq əlaqələr', icon: 'ti-world', layouts: ['beynelxalq'] },
  { id: 'elm', label: 'Elm və innovasiya', icon: 'ti-flask', layouts: ['elm'] },
  { id: 'akademiya', label: 'Akademiya', icon: 'ti-building-bank', layouts: ['akademiya'] },
  // F5.60 — kollecin səhifələri (layout=kollec).
  { id: 'kollec', label: 'Kollec', icon: 'ti-anchor', layouts: ['kollec'] },
  { id: 'diger', label: 'Digər suallar', icon: 'ti-help-circle', layouts: ['bolmeli', 'standart', null] },
];

const itemQ = (q: PageFaq) => searchFold(`${q.question} ${faqAnswerText(q.answer)}`);

export interface FaqPageProps {
  locale: Locale;
  menu: SiteMenu | null;
  doc: PageDoc;
  slug: string;
  isFallback?: boolean;
  sources: FaqSource[];
  correctionLabels: Record<string, string>;
}

export default async function FaqPage({ locale, menu, doc, slug, isFallback, sources, correctionLabels }: FaqPageProps) {
  const general = (doc.faq ?? []).filter((q) => q.question && q.answer);
  const groups = GROUPS.map((g) => ({ ...g, sources: sources.filter((s) => g.layouts.includes(s.layout ?? null)) })).filter(
    (g) => g.sources.length,
  );
  const count = (g: { sources: FaqSource[] }) => g.sources.reduce((n, s) => n + s.faq.length, 0);
  const total = general.length + groups.reduce((n, g) => n + count(g), 0);
  const sideLinks = (doc.sideLinks ?? []).filter((l): l is MenuLink => Boolean(l?.label && l?.url));
  const contactHtml = doc.contact ? localizeLinks(await marked.parse(doc.contact), locale) : '';
  const generalTitle = tr('Ümumi suallar', locale);

  const toc = [
    ...(general.length ? [{ id: 'umumi', label: `${generalTitle} (${general.length})` }] : []),
    ...groups.map((g) => ({ id: g.id, label: `${tr(g.label, locale)} (${count(g)})` })),
  ];
  const notice = isFallback ? fallbackNotice(locale) : null;

  // schema.org FAQPage — bütün suallar (keçid sintaksisi olmadan).
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [...general, ...groups.flatMap((g) => g.sources.flatMap((s) => s.faq))].map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: { '@type': 'Answer', text: faqAnswerText(q.answer) },
    })),
  };

  let tint = 0;
  const nextTint = () => (tint++ % 2 === 1 ? ' un-block--tint' : '');

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main className="qb-page faq-page" lang={locale}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
        <section className="np-hero">
          <div className="container np-hero-inner">
            <div className="np-eyebrow">{tr('Suallar və cavablar', locale)}</div>
            <h1 className="np-h1">{doc.title}</h1>
            {doc.lead ? <p className="np-lead">{doc.lead}</p> : null}
            <FaqSearch
              total={total}
              text={{
                label: tr('Suallarda axtar', locale),
                placeholder: tr('Sualınızı yazın: yataqxana, keçid balı, təqaüd…', locale),
                found: tr('Tapılan sual: {n}', locale),
                none: tr('Uyğun sual tapılmadı. Sualınızı onlayn göndərin.', locale),
                clear: tr('Axtarışı təmizlə', locale),
              }}
            />
            <p className="faq-total">
              {tr('Cəmi suallar', locale)}: <b>{total}</b> · {tr('Mövzular', locale)}: <b>{groups.length + (general.length ? 1 : 0)}</b>
            </p>
          </div>
        </section>

        <div className="container faq-wrap">
          <ProgramToc items={toc} variant="mobile" />
          {notice ? (
            <div role="status" className="qb-notice">
              {notice}
            </div>
          ) : null}

          <AdminProvider>
            <div className="un-layout">
              <div className="un-main">
                {general.length ? (
                  <section id="umumi" className={'un-block pr-anchor faq-group' + nextTint()} data-faq-group="">
                    <BlockTitle uid={PAGE_UID} title={generalTitle} documentId={doc.documentId} locale={locale} />
                    <div className="un-expand-group">
                      {general.map((q, i) => (
                        <div key={i} data-faq-item="" data-q={itemQ(q)}>
                          <ExpandBlock level={3} label={q.question}>
                            <p className="prose" dangerouslySetInnerHTML={{ __html: faqAnswerHtml(q.answer, locale) }} />
                          </ExpandBlock>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}

                {groups.map((g) => (
                  <section key={g.id} id={g.id} className={'un-block pr-anchor faq-group' + nextTint()} data-faq-group="">
                    <h2 className="un-block-title faq-group-h">
                      <i className={`ti ${g.icon}`} aria-hidden="true" />
                      {tr(g.label, locale)}
                      <span className="faq-count">{count(g)}</span>
                    </h2>
                    {g.sources.map((src) => (
                      <div key={src.slug} className="faq-source" data-faq-source="">
                        <p className="faq-source-h">
                          <Link href={`/${locale}/sehife/${src.slug}`}>{src.title}</Link>
                        </p>
                        <div className="un-expand-group">
                          {src.faq.map((q, i) => (
                            <div key={i} data-faq-item="" data-q={itemQ(q)}>
                              <ExpandBlock level={3} label={q.question}>
                                <p className="prose" dangerouslySetInnerHTML={{ __html: faqAnswerHtml(q.answer, locale) }} />
                                <p className="faq-more">
                                  <Link href={`/${locale}/sehife/${src.slug}#suallar`}>
                                    {tr('Ətraflı', locale)}: {src.title}
                                    <i className="ti ti-arrow-right" aria-hidden="true" />
                                  </Link>
                                </p>
                              </ExpandBlock>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </section>
                ))}
              </div>

              <aside className="un-side">
                <ProgramToc items={toc} variant="desktop" />
                <div className="qb-cta">
                  <b>{tr('Sualınız var?', locale)}</b>
                  <small>{tr('Cavab tapmadınızsa, sualınızı onlayn göndərin — cavab e-poçtunuza gəlir.', locale)}</small>
                  <Link href={`/${locale}/vetendaslarin-muracieti`} className="qb-btn">
                    {tr('Sual ver', locale)}
                    <i className="ti ti-arrow-right" aria-hidden="true" />
                  </Link>
                </div>
                {sideLinks.length ? (
                  <div>
                    <div className="un-sub-title">{tr('Faydalı keçidlər', locale)}</div>
                    <div className="qb-side-links">
                      {sideLinks.map((l, i) => {
                        const h = localHref(l.url, locale);
                        return isExternalHref(h) ? (
                          <a key={i} href={h} className="un-link-btn" target="_blank" rel="noopener noreferrer">
                            <i className="ti ti-external-link" aria-hidden="true" />
                            {l.label}
                          </a>
                        ) : (
                          <Link key={i} href={h} className="un-link-btn">
                            <i className="ti ti-arrow-right" aria-hidden="true" />
                            {l.label}
                          </Link>
                        );
                      })}
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
            </div>
          </AdminProvider>
          <div style={{ paddingBottom: '48px' }} />
        </div>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
