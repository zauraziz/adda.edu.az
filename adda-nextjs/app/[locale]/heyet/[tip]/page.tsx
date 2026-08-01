// K26-11 — /[locale]/heyet/[tip] — kateqoriya üzrə heyət.
//
// FİLTR `roles` ÜZRƏDİR, `staffType` üzrə DEYİL: 22 nəfərin iki vəzifəsi var
// (məs. dekan + professor). Yalnız əsas tipə baxsaydıq, dekan professor
// siyahısından tamamilə düşərdi.
import '../../../_styles/01-base.css';
import '../../../_styles/02-header.css';
import '../../../_styles/03-hero.css';
import '../../../_styles/04-quicknav.css';
import '../../../_styles/05-legacy.css';
import '../../../_styles/06-spotlight.css';
import '../../../_styles/07-stats.css';
import '../../../_styles/08-news.css';
import '../../../_styles/09-campus.css';
import '../../../_styles/10-intl.css';
import '../../../_styles/11-social.css';
import '../../../_styles/12-vquote.css';
import '../../../_styles/13-legacy2.css';
import '../../../_styles/14-footer.css';
import '../../../_styles/15-responsive.css';
import '../../../_styles/16-footer-ftx.css';
import '../../../_styles/17-header-mega.css';
import '../../../_styles/18-search.css';
import '../../../_styles/19-news-page.css';
import '../../../_styles/28-staff.css';
import '../../../_styles/29-directory.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeaderStack from '../../../_components/SiteHeaderStack';
import Footer from '../../../_components/Footer';
import StaffDirectory from '../../../_components/StaffDirectory';
import { getMenu, type SiteMenu, type StaffType } from '@/lib/strapi';
import { tr, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

export const revalidate = 300;

const TABS: { slug: string; label: string; lead: string; types: StaffType[] }[] = [
  {
    slug: 'professor-muellim',
    label: 'Professor-müəllim heyəti',
    lead: 'Akademiyanın professor, dosent və müəllim heyəti.',
    types: ['akademik'],
  },
  {
    slug: 'telimci-texniki',
    label: 'Təlimçi-texniki heyət',
    lead: 'Laboratoriya, təlim və texniki dəstək heyəti.',
    types: ['telimci_texniki'],
  },
  {
    slug: 'inzibati',
    label: 'İnzibati heyət',
    lead: 'Rəhbərlik, şöbələr və inzibati xidmət heyəti.',
    types: ['inzibati', 'rehberlik'],
  },
];

export function generateStaticParams() {
  return ['az', 'ru', 'en'].flatMap((locale) => TABS.map((t) => ({ locale, tip: t.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; tip: string }>;
}): Promise<Metadata> {
  const { locale: raw, tip } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const tab = TABS.find((t) => t.slug === tip);
  return { title: tr(tab ? tab.label : 'Heyət', locale) };
}

export default async function StaffTypePage({
  params,
}: {
  params: Promise<{ locale: string; tip: string }>;
}) {
  const { locale: raw, tip } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  const tab = TABS.find((t) => t.slug === tip);
  if (!tab) notFound();

  const menu = await getMenu(locale).catch(() => null as SiteMenu | null);

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main>
        <section className="np-hero">
          <div className="container np-hero-inner">
            <div className="np-eyebrow">{tr('Akademiya', locale)}</div>
            <h1 className="np-h1">{tr(tab.label, locale)}</h1>
            <p className="np-lead">{tr(tab.lead, locale)}</p>
          </div>
        </section>

        <section className="np-wrap">
          <div className="container">
            <nav className="stf-tabs" aria-label={tr('Heyət', locale)}>
              <Link href={`/${locale}/heyet`} className="stf-tab" aria-current={undefined}>
                {tr('Bütün əməkdaşlar', locale)}
              </Link>
              {TABS.map((t) => (
                <Link
                  key={t.slug}
                  href={`/${locale}/heyet/${t.slug}`}
                  className="stf-tab"
                  aria-current={t.slug === tab.slug ? 'page' : undefined}
                >
                  {tr(t.label, locale)}
                </Link>
              ))}
            </nav>

            <StaffDirectory
              locale={locale}
              types={tab.types}
              basePath={`/${locale}/emekdas`}
            />
          </div>
        </section>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
