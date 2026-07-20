// F2.5 / Xəbər detalı — /[locale]/xeberler/[slug]
// getArticleBySlug (F2.4). Body richtext=markdown olduğu üçün v1-də təhlükəsiz
// paraqraf-bölmə ilə render olunur (dangerouslySetInnerHTML YOX). Tam markdown
// (başlıq/link/siyahı) üçün fast-follow: `marked` renderer əlavə ediləcək.
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
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeaderStack from '../../../_components/SiteHeaderStack';
import Footer from '../../../_components/Footer';
import { getArticleBySlug, getMenu, mediaUrl, type SiteMenu } from '@/lib/strapi';
import { tr, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

export const revalidate = 60;
export const dynamicParams = true;

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

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const article = await getArticleBySlug(slug, locale);
  if (!article) return { title: tr('Xəbər', locale) };
  return { title: article.title, description: article.excerpt ?? undefined };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const [article, menu] = await Promise.all([
    getArticleBySlug(slug, locale),
    getMenu(locale).catch(() => null as SiteMenu | null),
  ]);
  if (!article) notFound();

  const img = mediaUrl(article.cover);
  const paragraphs = (article.body ?? '').split(/\n\n+/).map((p) => p.trim()).filter(Boolean);

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main className="na-wrap">
        <div className="container">
          <Link href={'/' + locale + '/xeberler'} className="na-back">
            <i className="ti ti-arrow-left" />
            {' ' + tr('Bütün xəbərlər', locale)}
          </Link>
        </div>

        <article>
          <div className="container na-head">
            <div className="na-eyebrow">{CAT_LABELS[locale][article.category] ?? CAT_LABELS[locale].xeber}</div>
            <h1 className="na-title">{article.title}</h1>
            <div className="na-meta">
              <span>
                <i className="ti ti-calendar" />
                {' ' + fmtDate(article.newsDate ?? article.publishedAt, locale)}
              </span>
              {article.readingMinutes ? (
                <span>
                  <i className="ti ti-clock" />
                  {' ' + article.readingMinutes + ' ' + tr('dəq oxu', locale)}
                </span>
              ) : null}
            </div>
          </div>

          {img ? (
            <div className="container">
              <div className="na-cover">
                <img src={img} alt={article.title} />
              </div>
            </div>
          ) : null}

          <div className="container">
            <div className="na-body">
              {paragraphs.length ? (
                paragraphs.map((p, i) => <p key={i}>{p}</p>)
              ) : article.excerpt ? (
                <p>{article.excerpt}</p>
              ) : null}
            </div>
          </div>
        </article>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
