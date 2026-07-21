// F2.5 / Elan detalı — /[locale]/elanlar/[slug]
// getAnnouncementBySlug (F2.5). Body markdown -> HTML (marked). importance,
// deadline, requiresAck və qoşma faylları göstərilir.
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
import { marked } from 'marked';
import SiteHeaderStack from '../../../_components/SiteHeaderStack';
import Footer from '../../../_components/Footer';
import { getAnnouncementBySlug, getMenu, mediaUrl, type SiteMenu } from '@/lib/strapi';
import { tr, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';
import { fmtDate, IMPORTANCE_LABELS } from '@/lib/format';

export const revalidate = 60;
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const item = await getAnnouncementBySlug(slug, locale);
  if (!item) return { title: tr('Elan', locale) };
  return { title: item.title, description: item.excerpt ?? undefined };
}

export default async function AnnouncementDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const [item, menu] = await Promise.all([
    getAnnouncementBySlug(slug, locale),
    getMenu(locale).catch(() => null as SiteMenu | null),
  ]);
  if (!item) notFound();

  const img = mediaUrl(item.cover);
  const bodyHtml = item.body ? await marked.parse(item.body) : '';
  const attachments = (item.attachments ?? []).filter((f) => mediaUrl(f));
  const impCls =
    item.importance === 'kritik' ? 'na-badge na-badge--kritik'
    : item.importance === 'vacib' ? 'na-badge na-badge--vacib'
    : 'na-badge';

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main className="na-wrap">
        <div className="container">
          <Link href={'/' + locale + '/elanlar'} className="na-back">
            <i className="ti ti-arrow-left" />
            {' ' + tr('Bütün elanlar', locale)}
          </Link>
        </div>

        <article>
          <div className="container na-head">
            <span className={impCls}>{IMPORTANCE_LABELS[locale][item.importance] ?? IMPORTANCE_LABELS[locale].normal}</span>
            <h1 className="na-title">{item.title}</h1>
            <div className="na-meta">
              <span>
                <i className="ti ti-calendar" />
                {' ' + fmtDate(item.publishAt ?? item.publishedAt, locale)}
              </span>
              {item.deadlineAt ? (
                <span>
                  <i className="ti ti-clock-hour-4" />
                  {' ' + tr('Son tarix', locale) + ': ' + fmtDate(item.deadlineAt, locale)}
                </span>
              ) : null}
              {item.requiresAck ? (
                <span>
                  <i className="ti ti-checkbox" />
                  {' ' + tr('Təsdiq tələb olunur', locale)}
                </span>
              ) : null}
            </div>
          </div>

          {img ? (
            <div className="container">
              <div className="na-cover">
                <img src={img} alt={item.title} />
              </div>
            </div>
          ) : null}

          <div className="container">
            {bodyHtml ? (
              <div className="na-body" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
            ) : item.excerpt ? (
              <div className="na-body"><p>{item.excerpt}</p></div>
            ) : null}

            {attachments.length ? (
              <div className="na-files">
                <div className="na-files-h">{tr('Sənədlər', locale)}</div>
                {attachments.map((f, i) => (
                  <a key={i} href={mediaUrl(f) ?? '#'} className="na-file" target="_blank" rel="noopener noreferrer">
                    <i className="ti ti-file-download" />
                    <span>{f.alternativeText ?? tr('Sənədi yüklə', locale)}</span>
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </article>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
