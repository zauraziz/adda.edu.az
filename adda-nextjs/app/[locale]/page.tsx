// home.css bölmə-bölmə bölündü (TT F1). ÖLÜ CSS SİLİNMƏYİB — ayrıca hesabat.
// SIRA KRİTİKDİR: bölmələr bitişik deyil, fayllar ORİJİNAL SIRAYA görə nömrələnib.
import '../_styles/01-base.css';
import '../_styles/02-header.css';
import '../_styles/03-hero.css';
import '../_styles/04-quicknav.css';
import '../_styles/05-legacy.css';
import '../_styles/06-spotlight.css';
import '../_styles/07-stats.css';
import '../_styles/08-news.css';
import '../_styles/09-campus.css';
import '../_styles/10-intl.css';
import '../_styles/11-social.css';
import '../_styles/12-vquote.css';
import '../_styles/13-legacy2.css';
import '../_styles/14-footer.css';
import '../_styles/15-responsive.css';
import '../_styles/16-footer-ftx.css';
import '../_styles/17-header-mega.css';
import '../_styles/18-search.css';
import SiteHeaderStack from '../_components/SiteHeaderStack';
import Hero from '../_components/Hero';
import Quicknav from '../_components/Quicknav';
import Spotlight from '../_components/Spotlight';
import Stats from '../_components/Stats';
import News from '../_components/News';
import Campus from '../_components/Campus';
import Intl from '../_components/Intl';
import Social from '../_components/Social';
import VQuote from '../_components/VQuote';
import Footer from '../_components/Footer';
import { getHomeNews, getMenu, type NewsItem, type SiteMenu } from '@/lib/strapi';
import { isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

export const revalidate = 60;

export function generateStaticParams() {
  return [{ locale: 'az' }, { locale: 'ru' }, { locale: 'en' }];
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const [news, menu] = await Promise.all([
    getHomeNews(locale, 4).catch(() => [] as NewsItem[]),
    getMenu(locale).catch(() => null as SiteMenu | null),
  ]);
  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <Hero locale={locale} />
      <Quicknav menu={menu} locale={locale} />
      <Spotlight locale={locale} />
      <Stats locale={locale} />
      <News news={news} locale={locale} />
      <Campus locale={locale} />
      <Intl locale={locale} />
      <Social locale={locale} />
      <VQuote locale={locale} />
      <Footer menu={menu} locale={locale} />
    </>
  );
}
