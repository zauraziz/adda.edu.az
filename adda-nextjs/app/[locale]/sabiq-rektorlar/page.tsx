// K27c — /[locale]/sabiq-rektorlar
//
// Kart şəbəkəsi. Hər kart öz səhifəsinə aparır: /sabiq-rektorlar/{slug}
//
// MƏNBƏ: Strapi `api::rector.rector` (admin panelindən redaktə olunur).
// Strapi cavab verməsə `RECTORS_FALLBACK` işə düşür — Render pulsuz tarifdə
// yuxuya getdiyi üçün soyuq startda səhifə boş qalmamalıdır.
//
// SIRA `bySuccession` ilə İKİNCİ DƏFƏ tətbiq olunur. Strapi sorğusu onsuz da
// xronoloji sıralayır, amma fallback və gözlənilməz məlumat eyni qaydaya
// düşməlidir — sıra bir yerdə qərarlaşdırılır, iki yerdə yox.
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
import { getMenu, getRectors, mediaUrl, type SiteMenu } from '@/lib/strapi';
import { RECTORS_FALLBACK, RECTORS_LEAD, bySuccession, isCurrent, monogram, termLabel } from '@/lib/rectors';
import { tr, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

export const revalidate = 300;

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

  const [menu, fetched] = await Promise.all([
    getMenu(locale).catch(() => null as SiteMenu | null),
    getRectors(locale),
  ]);
  const rectors = [...(fetched.length ? fetched : RECTORS_FALLBACK[locale])].sort(bySuccession);

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
              {rectors.map((r) => {
                const photo = mediaUrl(r.photo);
                const current = isCurrent(r.termTo);
                return (
                  <li key={r.slug}>
                    <Link
                      href={`/${locale}/sabiq-rektorlar/${r.slug}`}
                      className={current ? 'rk-card rk-card--current' : 'rk-card'}
                    >
                      <span className="rk-plate">
                        {photo ? (
                          <img className="rk-photo" src={photo} alt="" loading="lazy" />
                        ) : (
                          <span className="rk-monogram" aria-hidden="true">
                            {monogram(r.name)}
                          </span>
                        )}
                        <span className="rk-plate-term">{termLabel(r.termFrom, r.termTo)}</span>
                      </span>
                      <span className="rk-card-body">
                        <span className="rk-name">{r.name}</span>
                        {current ? <span className="rk-badge">{tr('Hazırda', locale)}</span> : null}
                        {r.degree ? <span className="rk-degree">{r.degree}</span> : null}
                        {r.summary ? <span className="rk-excerpt">{r.summary}</span> : null}
                        <span className="rk-more">
                          {tr('Ətraflı', locale)}
                          <i className="ti ti-arrow-right" aria-hidden="true" />
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
