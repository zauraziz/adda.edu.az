import HomeClient from '../HomeClient';
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
  return <HomeClient news={news} menu={menu} locale={locale} />;
}
