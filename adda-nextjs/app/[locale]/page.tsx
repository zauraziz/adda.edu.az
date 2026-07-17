import '../home.css';
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
