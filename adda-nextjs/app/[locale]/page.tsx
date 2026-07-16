import '../home.css';
import HomeClient from '../HomeClient';
import SiteHeaderStack from '../_components/SiteHeaderStack';
import Hero from '../_components/Hero';
import Quicknav from '../_components/Quicknav';
import Spotlight from '../_components/Spotlight';
import Stats from '../_components/Stats';
import News from '../_components/News';
import Campus from '../_components/Campus';
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
      <HomeClient news={news} menu={menu} locale={locale} />
    </>
  );
}
