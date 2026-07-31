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
      <main className="na-wrap">
        <header className="st-head">
          <p className="st-kicker">{tr('Təhsil', locale)}</p>
          <h1 className="st-title">{tr('Fakültələr', locale)}</h1>
        </header>
        {faculties.length ? (
          <ul className="hy-list">
            {faculties.map((f) => (
              <li key={f.slug} className="hy-item">
                <Link href={`/${locale}/fakulteler/${f.slug}`} className="hy-person">
                  {f.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="hy-empty">{tr('Məlumat hazırda əlçatan deyil.', locale)}</p>
        )}
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
