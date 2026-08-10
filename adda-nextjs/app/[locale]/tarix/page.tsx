// F2.5d / Tarix — /[locale]/tarix — 144 illik Nautical marşrut səhifəsi.
// getMilestones (F2.5d) lentini istehlak edir. Timeline komponenti native CSS
// scroll-driven animasiya ilə mərhələləri açır. Hero başlığı View Transitions
// üçün adlandırılıb (dəstəkləyən brauzerlərdə səhifələr arası morf).
import '../../_styles/01-base.css';
import '../../_styles/02-header.css';
import '../../_styles/03-hero.css';
import '../../_styles/04-quicknav.css';
import '../../_styles/05-legacy.css';
import '../../_styles/06-spotlight.css';
import '../../_styles/07-stats.css';
import '../../_styles/08-news.css';
import '../../_styles/09-campus.css';
import '../../_styles/10-intl.css';
import '../../_styles/11-social.css';
import '../../_styles/12-vquote.css';
import '../../_styles/13-legacy2.css';
import '../../_styles/14-footer.css';
import '../../_styles/15-responsive.css';
import '../../_styles/16-footer-ftx.css';
import '../../_styles/17-header-mega.css';
import '../../_styles/18-search.css';
import '../../_styles/19-news-page.css';
import '../../_styles/20-timeline.css';
import type { Metadata } from 'next';
import SiteHeaderStack from '../../_components/SiteHeaderStack';
import Footer from '../../_components/Footer';
import Timeline from '../../_components/Timeline';
import { getMilestones, getMenu, type SiteMenu } from '@/lib/strapi';
import { tr, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

export const revalidate = 60;

export function generateStaticParams() {
  return [{ locale: 'az' }, { locale: 'ru' }, { locale: 'en' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  return {
    title: tr('Dənizçilik təhsilimizin marşrutu', locale),
    description: tr('Təməldən bu günə — akademiyanın dənizçilik təhsilindəki tarixi yolu.', locale),
  };
}

export default async function HistoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const [milestones, menu] = await Promise.all([
    getMilestones(locale),
    getMenu(locale).catch(() => null as SiteMenu | null),
  ]);

  // Dövr aralığı MƏLUMATDAN hesablanır. Başlıqda «144 illik» sabit yazılmışdı;
  // 2026-da bu rəqəm artıq səhv idi və hər il əl ilə düzəldilməli olurdu.
  const years = milestones.map((m) => m.year).filter((y) => Number.isFinite(y));
  const span = years.length
    ? `${Math.min(...years)} — ${Math.max(...years)} · ${milestones.length} ${tr('mərhələ', locale)}`
    : null;

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main>
        <section className="np-hero tl-hero">
          <div className="container np-hero-inner">
            <div className="np-eyebrow">{tr('Akademiyanın tarixi', locale)}</div>
            <h1 className="np-h1" style={{ viewTransitionName: 'history-title' }}>
              {tr('Dənizçilik təhsilimizin marşrutu', locale)}
            </h1>
            <p className="np-lead">
              {tr(
                'Xəzərin sahilində dənizçilik təhsilinin ilk siniflərindən müasir akademiyaya qədər — adlar, qərarlar və dönüş nöqtələri ilə.',
                locale,
              )}
            </p>
            {span ? <p className="tl-span">{span}</p> : null}
          </div>
        </section>

        <section className="tl-wrap">
          <div className="container">
            <Timeline milestones={milestones} locale={locale} />
          </div>
        </section>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
