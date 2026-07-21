// F2.5 / Tədbir siyahısı — /[locale]/tedbirler
// F2.4 getAcademyEvents lentini istehlak edir. Xəbər/elan səhifələri ilə eyni
// vizual dil (.np-* kartlar), əlavə: format nişanı + məkan.
import '../../_styles/01-base.css';
import '../../_styles/02-header.css';
import '../../_styles/03-hero.css';
import '../../_styles/04-quicknav.css';
import '../../_styles/05-legacy.css';
import '../../_styles/06-spotlight.css';
import '../../_styles/07-stats.css';
import '../../_styles/08-news.css';
import '../../_styles/09-campus.css';
import '../../_styles/10-intl.css';
import '../../_styles/11-social.css';
import '../../_styles/12-vquote.css';
import '../../_styles/13-legacy2.css';
import '../../_styles/14-footer.css';
import '../../_styles/15-responsive.css';
import '../../_styles/16-footer-ftx.css';
import '../../_styles/17-header-mega.css';
import '../../_styles/18-search.css';
import '../../_styles/19-news-page.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeaderStack from '../../_components/SiteHeaderStack';
import Footer from '../../_components/Footer';
import { getAcademyEvents, getMenu, mediaUrl, type EventItem, type SiteMenu } from '@/lib/strapi';
import { tr, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';
import { fmtDate, EVENT_FORMAT_LABELS } from '@/lib/format';

export const revalidate = 60;

export function generateStaticParams() {
  return [{ locale: 'az' }, { locale: 'ru' }, { locale: 'en' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  return {
    title: tr('Tədbirlər', locale),
    description: tr('Akademiyanın konfranslar, seminarlar və digər tədbirləri.', locale),
  };
}

function venueLine(e: EventItem, locale: Locale): string {
  if (e.format === 'onlayn') return EVENT_FORMAT_LABELS[locale].onlayn;
  const parts = [e.venueBuilding, e.venueRoom].filter(Boolean);
  return parts.length ? parts.join(', ') : EVENT_FORMAT_LABELS[locale][e.format] ?? '';
}

export default async function EventListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const [items, menu] = await Promise.all([
    getAcademyEvents(locale, 24),
    getMenu(locale).catch(() => null as SiteMenu | null),
  ]);

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main>
        <section className="np-hero">
          <div className="container np-hero-inner">
            <div className="np-eyebrow">{tr('İnformasiya mərkəzi', locale)}</div>
            <h1 className="np-h1">{tr('Tədbirlər', locale)}</h1>
            <p className="np-lead">
              {tr('Akademiyanın konfranslar, seminarlar və digər tədbirləri.', locale)}
            </p>
          </div>
        </section>

        <section className="np-wrap">
          <div className="container">
            {items.length ? (
              <div className="np-grid">
                {items.map((e: EventItem) => {
                  const img = mediaUrl(e.cover);
                  return (
                    <Link key={e.documentId} href={'/' + locale + '/tedbirler/' + e.slug} className="np-card">
                      <span
                        className="np-card-media"
                        style={img ? { backgroundImage: "url('" + img + "')" } : undefined}
                      />
                      <span className="np-card-body">
                        <span className="np-meta">
                          <span className="np-chip np-chip--event">{EVENT_FORMAT_LABELS[locale][e.format] ?? EVENT_FORMAT_LABELS[locale].fiziki}</span>
                          <span className="np-date">
                            <i className="ti ti-calendar-event" />
                            {' ' + fmtDate(e.startAt ?? e.publishedAt, locale)}
                          </span>
                        </span>
                        <h2 className="np-card-title">{e.title}</h2>
                        <span className="np-place">
                          <i className="ti ti-map-pin" />
                          {' ' + venueLine(e, locale)}
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="np-empty">{tr('Hələlik tədbir yoxdur.', locale)}</p>
            )}
          </div>
        </section>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
