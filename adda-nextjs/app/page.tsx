import HomeClient from './HomeClient';
import { getHomeNews, getMenu, type NewsItem, type SiteMenu } from '@/lib/strapi';

// Ana səhifə — Server Component. Xəbərləri + menyunu Strapi-dən çəkir (ISR).
export const revalidate = 60;

export default async function Page() {
  const [news, menu] = await Promise.all([
    getHomeNews('az', 4).catch(() => [] as NewsItem[]),
    getMenu('az').catch(() => null as SiteMenu | null),
  ]);
  return <HomeClient news={news} menu={menu} />;
}
