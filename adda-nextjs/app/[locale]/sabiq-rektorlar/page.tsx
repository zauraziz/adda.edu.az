// K27a — /[locale]/sabiq-rektorlar
//
// Kart şəbəkəsi. Hər kart öz səhifəsinə aparır: /sabiq-rektorlar/{id}
// Tam bioqrafiya BURADA GÖSTƏRİLMİR — dörd uzun mətn bir səhifədə
// oxunmurdu, siyahı isə cavab verməli olduğu suala («kim, nə vaxt»)
// bir ekranda cavab verir.
//
// Məlumat mənbəyi: `lib/rectors.ts`.
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
import '../../_styles/32-rectors.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeaderStack from '../../_components/SiteHeaderStack';
import Footer from '../../_components/Footer';
import { getMenu, type SiteMenu } from '@/lib/strapi';
import { RECTORS, RECTORS_LEAD } from '@/lib/rectors';
import { tr, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

export const revalidate = 3600;

export function generateStaticParams() {
  return [{ locale: 'az' }, { locale: 'ru' }, { locale: 'en' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  return {
    title: tr('Sabiq rektorlarımız', locale),
    description: tr(RECTORS_LEAD, locale),
  };
}

export default async function FormerRectorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const menu = await getMenu(locale).catch(() => null as SiteMenu | null);

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main>
        <section className="np-hero">
          <div className="container np-hero-inner">
            <div className="np-eyebrow">{tr('Akademik irs və missiya', locale)}</div>
            <h1 className="np-h1">{tr('Sabiq rektorlarımız', locale)}</h1>
            <p className="np-lead">{tr(RECTORS_LEAD, locale)}</p>
          </div>
        </section>

        <section className="rk-wrap">
          <div className="container">
            <ul className="rk-grid">
              {RECTORS.map((r) => (
                <li key={r.id}>
                  <Link href={`/${locale}/sabiq-rektorlar/${r.id}`} className="rk-card">
                    <span className="rk-plate">
                      <span className="rk-monogram" aria-hidden="true">
                        {r.monogram}
                      </span>
                      <span className="rk-plate-term">
                        {r.termFrom}&ndash;{r.termTo}
                      </span>
                    </span>
                    <span className="rk-card-body">
                      <span className="rk-name">{r.name[locale]}</span>
                      <span className="rk-degree">{r.degree[locale]}</span>
                      <span className="rk-excerpt">{r.summary[locale]}</span>
                      <span className="rk-more">
                        {tr('Ətraflı', locale)}
                        <i className="ti ti-arrow-right" aria-hidden="true" />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}

              <li>
                <Link href={`/${locale}/sehife/rektor`} className="rk-card rk-card--now">
                  <span className="rk-plate rk-plate--now">
                    <span className="rk-monogram" aria-hidden="true">
                      <i className="ti ti-anchor" />
                    </span>
                    <span className="rk-plate-term">2024&ndash;</span>
                  </span>
                  <span className="rk-card-body">
                    <span className="rk-name">{tr('Hazırkı rektor', locale)}</span>
                    <span className="rk-excerpt">
                      {tr('Akademiyanın hazırkı rəhbərliyi barədə məlumat rektorun səhifəsindədir.', locale)}
                    </span>
                    <span className="rk-more">
                      {tr('Rektor', locale)}
                      <i className="ti ti-arrow-right" aria-hidden="true" />
                    </span>
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </section>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
