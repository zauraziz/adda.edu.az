// K26 — /[locale]/fakulteler
// K26-3-de menyudan bura link qoymusdum, amma siyahi sehifesi yox idi -> 404.
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
import '../../_styles/28-staff.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeaderStack from '../../_components/SiteHeaderStack';
import Footer from '../../_components/Footer';
import { getMenu, getFaculties, type FacultyDoc, type SiteMenu } from '@/lib/strapi';
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
    title: tr('Fakültələr', locale),
    description: tr('Akademiyanın fakültələri və tədris istiqamətləri.', locale),
  };
}

export default async function FacultyListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  const [menu, faculties] = await Promise.all([
    getMenu(locale).catch(() => null as SiteMenu | null),
    getFaculties(locale).catch(() => [] as FacultyDoc[]),
  ]);

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main>
        <section className="np-hero">
          <div className="container np-hero-inner">
            <div className="np-eyebrow">{tr('Təhsil', locale)}</div>
            <h1 className="np-h1">{tr('Fakültələr', locale)}</h1>
            <p className="np-lead">{tr('Akademiyanın fakültələri və tədris istiqamətləri.', locale)}</p>
          </div>
        </section>

        <section className="np-wrap">
          <div className="container">
            {faculties.length ? (
              <div className="np-grid">
                {faculties.map((f) => (
                  <Link key={f.slug} href={`/${locale}/fakulteler/${f.slug}`} className="np-card">
                    <span className="np-card-body">
                      <h2 className="np-card-title">{f.name}</h2>
                      {f.about ? <p className="np-card-ex">{f.about.slice(0, 160)}</p> : null}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="np-empty">{tr('Məlumat hazırda əlçatan deyil.', locale)}</p>
            )}
          </div>
        </section>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
