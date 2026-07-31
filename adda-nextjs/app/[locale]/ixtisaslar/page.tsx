// K26 — /[locale]/ixtisaslar
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
import { getMenu, getPrograms, type Program, type SiteMenu } from '@/lib/strapi';
import { tr, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

export const revalidate = 300;

const DEGREE: Record<Program['degree'], string> = {
  bachelor: 'Bakalavriat',
  master: 'Magistratura',
  phd: 'Doktorantura',
};

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
    title: tr('İxtisaslar', locale),
    description: tr('Bakalavriat, magistratura və doktorantura proqramları.', locale),
  };
}

export default async function ProgramListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  const [menu, programs] = await Promise.all([
    getMenu(locale).catch(() => null as SiteMenu | null),
    getPrograms(locale).catch(() => [] as Program[]),
  ]);

  const groups = (Object.keys(DEGREE) as Program['degree'][])
    .map((d) => ({ degree: d, list: programs.filter((p) => p.degree === d) }))
    .filter((g) => g.list.length);

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main>
        <section className="np-hero">
          <div className="container np-hero-inner">
            <div className="np-eyebrow">{tr('Təhsil', locale)}</div>
            <h1 className="np-h1">{tr('İxtisaslar', locale)}</h1>
            <p className="np-lead">{tr('Bakalavriat, magistratura və doktorantura proqramları.', locale)}</p>
          </div>
        </section>

        <section className="np-wrap">
          <div className="container">
            {groups.length ? (
              groups.map((g) => (
                <section key={g.degree} className="stf-sec">
                  <h2 className="stf-sec-title">{tr(DEGREE[g.degree], locale)}</h2>
                  <div className="np-grid">
                    {g.list.map((p) => (
                      <Link key={p.slug} href={`/${locale}/ixtisaslar/${p.slug}`} className="np-card">
                        <span className="np-card-body">
                          {p.faculty ? <span className="np-meta"><span className="np-chip">{p.faculty.name}</span></span> : null}
                          <h3 className="np-card-title">{p.title}</h3>
                          {p.description ? <p className="np-card-ex">{p.description.slice(0, 160)}</p> : null}
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              ))
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
