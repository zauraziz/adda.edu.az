// F2.5 / Xəbər siyahısı — /[locale]/xeberler
// F2.4 görünürlük lentini istehlak edir (getAcademyArticles). Header + Footer ilə
// mövcud səhifə strukturuna uyğun. CSS bölmə-bölmə import (page.tsx pattern-i).
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
import { getAcademyArticles, getMenu, mediaUrl, type Article, type SiteMenu } from '@/lib/strapi';
import { tr, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

export const revalidate = 60;

export function generateStaticParams() {
  return [{ locale: 'az' }, { locale: 'ru' }, { locale: 'en' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  return {
    title: tr('Xəbərlər', locale),
    description: tr('Akademiyanın son xəbərləri, təhsil və elm sahəsindəki yenilikləri.', locale),
  };
}

const CAT_LABELS: Record<Locale, Record<string, string>> = {
  az: { xeber: 'Xəbər', elan: 'Elan', tedbir: 'Tədbir', elm: 'Elm' },
  ru: { xeber: 'Новость', elan: 'Объявление', tedbir: 'Событие', elm: 'Наука' },
  en: { xeber: 'News', elan: 'Announcement', tedbir: 'Event', elm: 'Science' },
};
const MONTHS: Record<Locale, string[]> = {
  az: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'],
  ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
function fmtDate(iso: string | null, locale: Locale): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return String(d.getUTCDate()).padStart(2, '0') + ' ' + MONTHS[locale][d.getUTCMonth()] + ' ' + d.getUTCFullYear();
}

export default async function NewsListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const [articles, menu] = await Promise.all([
    getAcademyArticles(locale, 24),
    getMenu(locale).catch(() => null as SiteMenu | null),
  ]);

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main>
        <section className="np-hero">
          <div className="container np-hero-inner">
            <div className="np-eyebrow">{tr('İnformasiya mərkəzi', locale)}</div>
            <h1 className="np-h1">{tr('Xəbərlər', locale)}</h1>
            <p className="np-lead">
              {tr('Akademiyanın son xəbərləri, təhsil və elm sahəsindəki yenilikləri.', locale)}
            </p>
          </div>
        </section>

        <section className="np-wrap">
          <div className="container">
            {articles.length ? (
              <div className="np-grid">
                {articles.map((a: Article) => {
                  const img = mediaUrl(a.cover);
                  return (
                    <Link key={a.documentId} href={'/' + locale + '/xeberler/' + a.slug} className="np-card">
                      <span
                        className="np-card-media"
                        style={img ? { backgroundImage: "url('" + img + "')" } : undefined}
                      />
                      <span className="np-card-body">
                        <span className="np-meta">
                          <span className="np-chip">{CAT_LABELS[locale][a.category] ?? CAT_LABELS[locale].xeber}</span>
                          <span className="np-date">
                            <i className="ti ti-calendar" />
                            {' ' + fmtDate(a.newsDate ?? a.publishedAt, locale)}
                          </span>
                        </span>
                        <h2 className="np-card-title">{a.title}</h2>
                        {a.excerpt ? <p className="np-card-ex">{a.excerpt}</p> : null}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="np-empty">{tr('Hələlik xəbər yoxdur.', locale)}</p>
            )}
          </div>
        </section>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
