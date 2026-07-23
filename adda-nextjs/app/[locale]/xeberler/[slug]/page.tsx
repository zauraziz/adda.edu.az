// F2.5 / Xəbər detalı — /[locale]/xeberler/[slug]
// getArticleBySlug (F2.4). Body markdown -> HTML (marked / F2.5b).
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
import '../../../_styles/22-reactions.css';
import '../../../_styles/23-correction.css';
import '../../../_styles/24-identity.css';
import ReactionBar from '../../../_components/ReactionBar';
import CorrectionIsland from '../../../_components/CorrectionIsland';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { marked } from 'marked';
import SiteHeaderStack from '../../../_components/SiteHeaderStack';
import Footer from '../../../_components/Footer';
import { getArticleBySlug, getMenu, mediaUrl, type SiteMenu } from '@/lib/strapi';
import { tr, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';
import { fmtDate, CAT_LABELS } from '@/lib/format';

export const revalidate = 60;
export const dynamicParams = true;

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
  const bodyHtml = article.body ? await marked.parse(article.body) : '';

  const correctionLabels: Record<string, string> = {
    promptHint: tr('Bu səhifədə səhv gördünüz?', locale),
    prompt: tr('Düzəliş təklif et', locale),
    title: tr('Düzəliş təklifi', locale),
    subtitle: tr('Təklifiniz moderasiyadan sonra nəzərdən keçiriləcək.', locale),
    fieldLabel: tr('Hansı hissə?', locale),
    f_title: tr('Başlıq', locale),
    f_body: tr('Mətn', locale),
    f_other: tr('Digər', locale),
    currentLabel: tr('Cari mətn', locale),
    currentHint: tr('Düzəliş lazım olan hissəni bura köçürün', locale),
    suggestedLabel: tr('Təklif etdiyiniz düzəliş', locale),
    suggestedHint: tr('Düzgün variant', locale),
    diffLabel: tr('Fərq önizləməsi', locale),
    reasonLabel: tr('Səbəb (istəyə bağlı)', locale),
    nameLabel: tr('Adınız', locale),
    emailLabel: tr('Email (istəyə bağlı)', locale),
    submit: tr('Düzəlişi göndər', locale),
    sending: tr('Göndərilir', locale),
    successMsg: tr('Təklifiniz göndərildi. Töhfəniz üçün təşəkkür edirik.', locale),
    successSub: tr('Redaktə komandamız qısa zamanda yoxlayacaq.', locale),
    close: tr('Bağla', locale),
    error: tr('Uğursuz əməliyyat', locale),
    emptyErr: tr('Zəhmət olmasa düzəliş mətnini daxil edin.', locale),
    // --- F2.6e kimlik qapisi ---
    verifyHeading: tr('Kimliyinizi təsdiqləyin', locale),
    verifyIntro: tr('E-poçtunuza bir dəfəlik giriş linki göndərəcəyik. Parol lazım deyil.', locale),
    emailPlaceholder: tr('Email ünvanınız', locale),
    sendLink: tr('Giriş linki göndər', locale),
    linkSent: tr('Link göndərildi', locale),
    checkInbox: tr('Poçt qutunuzu yoxlayın. Link 15 dəqiqə etibarlıdır.', locale),
    otherAddress: tr('Başqa ünvan yaz', locale),
    badEmail: tr('Düzgün e-poçt ünvanı daxil edin.', locale),
    tooMany: tr('Çox sayda cəhd. Bir az sonra yenidən yoxlayın.', locale),
    unconfigured: tr('Kimlik xidməti hazırda əlçatan deyil.', locale),
    verified: tr('Təsdiqlənmiş', locale),
    gateCorrection: tr('Düzəliş göndərmək üçün kimlik təsdiqi lazımdır', locale),
  };

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
            {bodyHtml ? (
              <div className="na-body" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
            ) : article.excerpt ? (
              <div className="na-body"><p>{article.excerpt}</p></div>
            ) : null}
          </div>
        
        <div className="container" style={{ paddingBottom: '40px' }}>
          <ReactionBar targetType="article" targetSlug={slug} />
        </div>
        <div className="container" style={{ paddingBottom: '48px' }}>
          <CorrectionIsland targetType="article" targetSlug={slug} title={article.title} locale={locale} labels={correctionLabels} />
        </div>
        </article>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
