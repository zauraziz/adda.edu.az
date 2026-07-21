// F2.5 / Elan siyahısı — /[locale]/elanlar
// F2.4 getAcademyAnnouncements lentini istehlak edir. Xəbər səhifəsi ilə eyni
// vizual dil (.np-* kartlar), əlavə: importance (əhəmiyyət) nişanı.
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
import { getAcademyAnnouncements, getMenu, mediaUrl, type Announcement, type SiteMenu } from '@/lib/strapi';
import { tr, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';
import { fmtDate, IMPORTANCE_LABELS } from '@/lib/format';

export const revalidate = 60;

export function generateStaticParams() {
  return [{ locale: 'az' }, { locale: 'ru' }, { locale: 'en' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  return {
    title: tr('Elanlar', locale),
    description: tr('Akademiyanın rəsmi elanları, müraciət müddətləri və bildirişləri.', locale),
  };
}

function impClass(importance: string): string {
  if (importance === 'kritik') return 'np-chip np-chip--kritik';
  if (importance === 'vacib') return 'np-chip np-chip--vacib';
  return 'np-chip';
}

export default async function AnnouncementListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const [items, menu] = await Promise.all([
    getAcademyAnnouncements(locale, 24),
    getMenu(locale).catch(() => null as SiteMenu | null),
  ]);

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main>
        <section className="np-hero">
          <div className="container np-hero-inner">
            <div className="np-eyebrow">{tr('İnformasiya mərkəzi', locale)}</div>
            <h1 className="np-h1">{tr('Elanlar', locale)}</h1>
            <p className="np-lead">
              {tr('Akademiyanın rəsmi elanları, müraciət müddətləri və bildirişləri.', locale)}
            </p>
          </div>
        </section>

        <section className="np-wrap">
          <div className="container">
            {items.length ? (
              <div className="np-grid">
                {items.map((a: Announcement) => {
                  const img = mediaUrl(a.cover);
                  return (
                    <Link key={a.documentId} href={'/' + locale + '/elanlar/' + a.slug} className="np-card">
                      <span
                        className="np-card-media"
                        style={img ? { backgroundImage: "url('" + img + "')" } : undefined}
                      />
                      <span className="np-card-body">
                        <span className="np-meta">
                          <span className={impClass(a.importance)}>{IMPORTANCE_LABELS[locale][a.importance] ?? IMPORTANCE_LABELS[locale].normal}</span>
                          <span className="np-date">
                            <i className="ti ti-calendar" />
                            {' ' + fmtDate(a.publishAt ?? a.publishedAt, locale)}
                          </span>
                        </span>
                        <h2 className="np-card-title">{a.title}</h2>
                        {a.excerpt ? <p className="np-card-ex">{a.excerpt}</p> : null}
                        {a.deadlineAt ? (
                          <span className="np-deadline">
                            <i className="ti ti-clock-hour-4" />
                            {' ' + tr('Son tarix', locale) + ': ' + fmtDate(a.deadlineAt, locale)}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="np-empty">{tr('Hələlik elan yoxdur.', locale)}</p>
            )}
          </div>
        </section>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
