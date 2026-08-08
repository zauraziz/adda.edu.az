// K30 — /[locale]/bunlar-ucun/[slug]
//
// Header-dəki «Bunlar üçün» menyusunun altı bəndi indi real səhifəyə gedir.
// Hər səhifə saytın həmin auditoriya üçün kəsilmiş versiyasıdır: yeni məzmun
// deyil, MÖVCUD səhifələrin auditoriyaya görə seçilmiş yığımı.
//
// Kuratorluq `lib/audiences.ts`-dədir (səbəb orada yazılıb). Bütün 99 link
// mövcud marşrutlara işarə edir — `npm run check:audiences` bunu yoxlayır.
import '../../../_styles/01-base.css';
import '../../../_styles/02-header.css';
import '../../../_styles/03-hero.css';
import '../../../_styles/04-quicknav.css';
import '../../../_styles/05-legacy.css';
import '../../../_styles/06-spotlight.css';
import '../../../_styles/07-stats.css';
import '../../../_styles/08-news.css';
import '../../../_styles/09-campus.css';
import '../../../_styles/10-intl.css';
import '../../../_styles/11-social.css';
import '../../../_styles/12-vquote.css';
import '../../../_styles/13-legacy2.css';
import '../../../_styles/14-footer.css';
import '../../../_styles/15-responsive.css';
import '../../../_styles/16-footer-ftx.css';
import '../../../_styles/17-header-mega.css';
import '../../../_styles/18-search.css';
import '../../../_styles/19-news-page.css';
import '../../../_styles/33-audience.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeaderStack from '../../../_components/SiteHeaderStack';
import Footer from '../../../_components/Footer';
import { getMenu, getHomeNews, type SiteMenu } from '@/lib/strapi';
import { AUDIENCES, audienceBySlug } from '@/lib/audiences';
import { fmtDate } from '@/lib/format';
import { tr, LOCALES, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => AUDIENCES.map((a) => ({ locale, slug: a.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const aud = audienceBySlug(slug);
  if (!aud) return { title: tr('Bunlar üçün', locale) };
  return { title: tr(aud.label, locale), description: tr(aud.lead, locale) };
}

export default async function AudiencePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const aud = audienceBySlug(slug);
  if (!aud) notFound();

  const [menu, news] = await Promise.all([
    getMenu(locale).catch(() => null as SiteMenu | null),
    getHomeNews(locale, 3).catch(() => []),
  ]);

  const href = (u: string) => `/${locale}${u}`;

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main>
        <section className="np-hero">
          <div className="container np-hero-inner">
            <div className="np-eyebrow">{tr('Bunlar üçün', locale)}</div>
            <h1 className="np-h1">{tr(aud.label, locale)}</h1>
            <p className="np-lead">{tr(aud.lead, locale)}</p>
          </div>
        </section>

        <section className="aud-wrap">
          <div className="container">
            {/* Auditoriya dəyişdirici — altı bənd arasında yan keçid */}
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

            <h2 className="aud-h">{tr('İlk addımlar', locale)}</h2>
            <ul className="aud-steps">
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
            </ul>

            <h2 className="aud-h">{tr('Bütün bölmələr', locale)}</h2>
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

            {news.length ? (
              <>
                <h2 className="aud-h">{tr('Son xəbərlər', locale)}</h2>
                <ul className="aud-news">
                  {news.map((n) => (
                    <li key={n.slug}>
                      <Link href={`/${locale}/xeberler/${n.slug}`}>
                        <time dateTime={n.date ?? undefined}>{fmtDate(n.date, locale)}</time>
                        <span>{n.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            <aside className="aud-cta">
              <div>
                <b>{tr('Sualınız var?', locale)}</b>
                <small>{tr('Akademiya ilə birbaşa əlaqə saxlayın.', locale)}</small>
              </div>
              <Link href={href('/sehife/elaqe')} className="aud-cta-btn">
                {tr('Əlaqə', locale)}
                <i className="ti ti-arrow-right" aria-hidden="true" />
              </Link>
            </aside>
          </div>
        </section>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
