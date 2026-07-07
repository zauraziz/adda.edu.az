import HomeClient from './HomeClient';
import { getHomeNews, type NewsItem } from '@/lib/strapi';

// Ana səhifə — Server Component. Xəbərləri Strapi-dən çəkir (ISR, hər 60 san yenilənir).
export const revalidate = 60;

export default async function Page() {
  let news: NewsItem[] = [];
  try {
    news = await getHomeNews('az', 4);
  } catch (err) {
    console.error('[home] Strapi xeber cekilmedi:', err);
  }
  return <HomeClient news={news} />;
}
