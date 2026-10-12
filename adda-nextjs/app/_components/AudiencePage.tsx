// F5.49 — «Bunlar üçün» auditoriya səhifəsi digər bölmələrin sağ panelli
// şablonunda (SectionPage dizaynı): hero + fakt zolağı, auditoriya seçimi,
// «… yolu» addımları, bütün bölmələr, canlı lent (tədbir və xəbər başlığında
// açar sözlər), mənbə səhifələrin «Suallar»-ı; yan paneldə mündəricat, «Sual
// ver» (müraciət formasında auditoriyanın istiqaməti) və digər auditoriyalar.
// Kuratorluq: lib/audiences.ts.
import Link from 'next/link';
import SiteHeaderStack from './SiteHeaderStack';
import Footer from './Footer';
import ExpandBlock from './ExpandBlock';
import ProgramToc from './ProgramToc';
import { OpenDays, type FeedText } from './AdmissionData';
import { AUDIENCES, type Audience } from '@/lib/audiences';
import type { Article, EventItem, FaqSource, SiteMenu } from '@/lib/strapi';
import { FEED_TEXT } from '@/lib/feed-text';
import { faqAnswerHtml } from '@/lib/faq-html';
import { tr, type Locale } from '@/lib/i18n';

/** Mənbə səhifədən ən çox neçə sual, cəmi neçə sual. */
const FAQ_PER_SOURCE = 2;
const FAQ_MAX = 6;

export interface AudiencePageProps {
  locale: Locale;
  menu: SiteMenu | null;
  aud: Audience;
  events: EventItem[];
  news: Article[];
  sources: FaqSource[];
  now: number;
}

export default function AudiencePage({ locale, menu, aud, events, news, sources, now }: AudiencePageProps) {
  const href = (u: string) => `/${locale}${u}`;
  const stepsTitle = tr(aud.stepsTitle ?? 'İlk addımlar', locale);

  // Suallar — `faqFrom` sırası ilə, hər səhifədən ən çox FAQ_PER_SOURCE.
  const faq = (aud.faqFrom ?? [])
    .map((slug) => sources.find((s) => s.slug === slug))
    .filter((s): s is FaqSource => Boolean(s))
    .flatMap((s) => s.faq.slice(0, FAQ_PER_SOURCE).map((q) => ({ ...q, slug: s.slug, title: s.title })))
    .slice(0, FAQ_MAX);

  const feedCfg = aud.feed ? FEED_TEXT[aud.feed] : null;
  const feedText: FeedText | undefined = feedCfg
    ? {
        empty: feedCfg.empty === null ? null : tr(feedCfg.empty, locale),
        past: tr(feedCfg.past, locale),
        action: tr(feedCfg.action, locale),
        hash: feedCfg.hash,
        pastEvents: feedCfg.pastEvents,
      }
    : undefined;
  const feedHas = Boolean(feedCfg) && (events.length > 0 || news.length > 0 || feedCfg?.empty !== null);
  const feedTitle = feedCfg ? tr(feedCfg.title, locale) : '';
  const faqTitle = tr('Tez-tez verilən suallar', locale);

  const toc = [
    { id: 'addimlar', label: stepsTitle },
    { id: 'bolmeler', label: tr('Bütün bölmələr', locale) },
    ...(feedHas ? [{ id: 'lent', label: feedTitle }] : []),
    ...(faq.length ? [{ id: 'suallar', label: faqTitle }] : []),
  ];
  const appealHref = href('/vetendaslarin-muracieti' + (aud.appeal ? `?istiqamet=${aud.appeal}` : ''));
  const facts = aud.facts ?? [];

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main className="qb-page aud-page" lang={locale}>
        <section className="np-hero">
          <div className="container np-hero-inner">
            <div className="np-eyebrow">{tr('Bunlar üçün', locale)}</div>
            <h1 className="np-h1">{tr(aud.label, locale)}</h1>
            <p className="np-lead">{tr(aud.lead, locale)}</p>
            {facts.length ? (
              <ul className="un-facts" aria-label={tr('Əsas faktlar', locale)}>
                {facts.map((f, i) => (
                  <li className="un-fact" key={i}>
                    <i className={`ti ${f.icon}`} aria-hidden="true" />
                    <span className="un-fact-k">{tr(f.label, locale)}</span>
                    <span className="un-fact-v">{tr(f.value, locale)}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>

        <section className="aud-wrap">
          <div className="container">
            {/* Auditoriya dəyişdirici — bütün bəndlər arasında yan keçid */}
            <nav className="aud-switch" aria-label={tr('Bunlar üçün bölməsi', locale)}>
              {AUDIENCES.map((a) => (
                <Link
                  key={a.slug}
                  href={`/${locale}/bunlar-ucun/${a.slug}`}
                  className={a.slug === aud.slug ? 'aud-chip is-active' : 'aud-chip'}
                  aria-current={a.slug === aud.slug ? 'page' : undefined}
                >
                  <i className={`ti ${a.icon}`} aria-hidden="true" />
                  {tr(a.label, locale)}
                </Link>
              ))}
            </nav>

            <ProgramToc items={toc} variant="mobile" />

            <div className="un-layout">
              <div className="un-main">
                <section id="addimlar" className="un-block pr-anchor">
                  <h2 className="un-block-title">{stepsTitle}</h2>
                  <ol className="aud-steps">
                    {aud.steps.map((s, i) => (
                      <li key={`s-${i}`}>
                        <Link href={href(s.href)} className="aud-step">
                          <span className="aud-step-n">{i + 1}</span>
                          <span className="aud-step-b">
                            <b>{tr(s.label, locale)}</b>
                            <small>{tr(s.note, locale)}</small>
                          </span>
                          <i className="ti ti-arrow-right" aria-hidden="true" />
                        </Link>
                      </li>
                    ))}
                  </ol>
                </section>

                <section id="bolmeler" className="un-block un-block--tint pr-anchor">
                  <h2 className="un-block-title">{tr('Bütün bölmələr', locale)}</h2>
                  <div className="aud-grid">
                    {aud.groups.map((g, gi) => (
                      <section className="aud-grp" key={`g-${gi}`}>
                        <h3 className="aud-grp-h">{tr(g.title, locale)}</h3>
                        <ul>
                          {g.links.map((l, li) => (
                            <li key={`g-${gi}-l-${li}`}>
                              <Link href={href(l.href)}>{tr(l.label, locale)}</Link>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ))}
                  </div>
                </section>

                {feedHas ? (
                  <section id="lent" className="un-block pr-anchor">
                    <h2 className="un-block-title">{feedTitle}</h2>
                    <OpenDays events={events} news={news} locale={locale} now={now} text={feedText} />
                  </section>
                ) : null}

                {faq.length ? (
                  <section id="suallar" className="un-block un-block--tint pr-anchor">
                    <h2 className="un-block-title">{faqTitle}</h2>
                    <div className="un-expand-group">
                      {faq.map((q, i) => (
                        <ExpandBlock key={i} level={3} label={q.question}>
                          <p className="prose" dangerouslySetInnerHTML={{ __html: faqAnswerHtml(q.answer, locale) }} />
                          <p className="faq-more">
                            <Link href={href(`/sehife/${q.slug}#suallar`)}>
                              {tr('Ətraflı', locale)}: {q.title}
                              <i className="ti ti-arrow-right" aria-hidden="true" />
                            </Link>
                          </p>
                        </ExpandBlock>
                      ))}
                    </div>
                    <p className="faq-more">
                      <Link href={href('/sehife/faq')}>
                        {tr('Bütün suallar', locale)}
                        <i className="ti ti-arrow-right" aria-hidden="true" />
                      </Link>
                    </p>
                  </section>
                ) : null}
              </div>

              <aside className="un-side">
                <ProgramToc items={toc} variant="desktop" />
                <div className="qb-cta">
                  <b>{tr('Sualınız var?', locale)}</b>
                  <small>{tr('Sualınızı onlayn göndərin — cavab e-poçtunuza gəlir.', locale)}</small>
                  <Link href={appealHref} className="qb-btn">
                    {tr('Sual ver', locale)}
                    <i className="ti ti-arrow-right" aria-hidden="true" />
                  </Link>
                </div>
                <div>
                  <div className="un-sub-title">{tr('Faydalı keçidlər', locale)}</div>
                  <div className="qb-side-links">
                    <Link href={href('/sehife/faq')} className="un-link-btn">
                      <i className="ti ti-help-circle" aria-hidden="true" />
                      {tr('Tez-tez verilən suallar', locale)}
                    </Link>
                    <Link href={href('/elaqe')} className="un-link-btn">
                      <i className="ti ti-phone" aria-hidden="true" />
                      {tr('Əlaqə', locale)}
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
