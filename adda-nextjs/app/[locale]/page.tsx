// home.css bölmə-bölmə bölündü (TT F1). ÖLÜ CSS SİLİNMƏYİB — ayrıca hesabat.
// SIRA KRİTİKDİR: bölmələr bitişik deyil, fayllar ORİJİNAL SIRAYA görə nömrələnib.
import '../_styles/01-base.css';
import '../_styles/02-header.css';
import '../_styles/03-hero.css';
import '../_styles/04-quicknav.css';
import '../_styles/05-legacy.css';
import '../_styles/06-spotlight.css';
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
import WhyAdda from '../_components/WhyAdda';
import News from '../_components/News';
import Campus from '../_components/Campus';
import Intl from '../_components/Intl';
import Social from '../_components/Social';
import VQuote from '../_components/VQuote';
import Footer from '../_components/Footer';
import {
  getAcademyAnnouncements,
  getHomeNews,
  getHomePage,
  getMenu,
  getUpcomingEvents,
  type Announcement,
  type EventItem,
  type NewsItem,
  type SiteMenu,
} from '@/lib/strapi';
import { homeView } from '@/lib/home';
import { isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

export const revalidate = 60;

export function generateStaticParams() {
  return [{ locale: 'az' }, { locale: 'ru' }, { locale: 'en' }];
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const [news, announcements, events, menu, home] = await Promise.all([
    getHomeNews(locale, 4).catch(() => [] as NewsItem[]),
    // 5 çəkilir; `News` şəkilli birinci karta görə 4-ə və ya 5-ə kəsir.
    getAcademyAnnouncements(locale, 5).catch(() => [] as Announcement[]),
    // Yalnız yaxınlaşan tədbirlər (startAt >= indi), tarixə görə artan.
    getUpcomingEvents(locale, 5).catch(() => [] as EventItem[]),
    getMenu(locale).catch(() => null as SiteMenu | null),
    // F5.50 — admində «3. Sayt — Ana səhifə»; əlçatmazdırsa null → ehtiyat.
    getHomePage(),
  ]);
  const view = homeView(home, locale);
  // F5.50 — sıra: gündəlik istifadə üçün əvvəl Gündəm (xəbər/elan/tədbir),
  // sonra «Niyə məhz ADDA» (əvvəlki iki blok birləşib), kampus, beynəlxalq,
  // sosial, sitat (F5.51: əvvəlki dizayn, video admindən).
  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <Hero slides={view.slides} locale={locale} />
      <Quicknav menu={menu} locale={locale} />
      <News news={news} announcements={announcements} events={events} locale={locale} />
      <WhyAdda facts={view.facts} locale={locale} />
      <Campus photos={view.campus} locale={locale} />
      <Intl locale={locale} />
      <Social locale={locale} />
      <VQuote quote={view.quote} locale={locale} />
      <Footer menu={menu} locale={locale} />
    </>
  );
}
