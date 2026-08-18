// F4.7d — /[locale]/struktur/[slug]/senedler: yan paneldəki «Sənədlər»
// siyahısı 5-dən çoxdursa «Hamısı» keçidinin hədəfi. Bura yalnız hesabatdan
// başqa kateqoriyalar düşür (hesabat əsas səhifədə qalır, F4.6d) — heç bir
// kəsmə olmadan, eyni kateqoriya qruplaşdırması.
import '../../../../_styles/01-base.css';
import '../../../../_styles/02-header.css';
import '../../../../_styles/03-hero.css';
import '../../../../_styles/04-quicknav.css';
import '../../../../_styles/05-legacy.css';
import '../../../../_styles/06-spotlight.css';
import '../../../../_styles/07-stats.css';
import '../../../../_styles/08-news.css';
import '../../../../_styles/09-campus.css';
import '../../../../_styles/10-intl.css';
import '../../../../_styles/11-social.css';
import '../../../../_styles/12-vquote.css';
import '../../../../_styles/13-legacy2.css';
import '../../../../_styles/14-footer.css';
import '../../../../_styles/15-responsive.css';
import '../../../../_styles/16-footer-ftx.css';
import '../../../../_styles/17-header-mega.css';
import '../../../../_styles/18-search.css';
import '../../../../_styles/19-news-page.css';
import '../../../../_styles/36-unit.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeaderStack from '../../../../_components/SiteHeaderStack';
import Footer from '../../../../_components/Footer';
import { DocList, DOC_CATEGORY_LABEL_AZ, groupDocsByCategory } from '../../../../_components/DocList';
import { getMenu, getUnitDetail, getUnitDocuments, type SiteMenu, type UnitDetail } from '@/lib/strapi';
import { tr, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const unit = await getUnitDetail(slug, locale).catch(() => null as UnitDetail | null);
  const title = tr('Sənədlər', locale) + (unit ? ` — ${unit.name}` : '');
  return { title };
}

export default async function UnitDocumentsPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  const [unit, menu] = await Promise.all([
    getUnitDetail(slug, locale).catch(() => null as UnitDetail | null),
    getMenu(locale).catch(() => null as SiteMenu | null),
  ]);
  if (!unit) notFound();

  const docs = await getUnitDocuments(unit.slug).catch(() => []);
  const groups = groupDocsByCategory(docs);

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main>
        <section className="np-hero">
          <div className="container np-hero-inner">
            <div className="np-eyebrow">{tr('Struktur', locale)}</div>
            <h1 className="np-h1">{tr('Sənədlər', locale)}</h1>
            <nav className="un-crumbs" aria-label={tr('Struktur', locale)}>
              <Link href={`/${locale}/struktur`}>{tr('Struktur', locale)}</Link>
              <span className="un-crumb-sep">/</span>{' '}
              <Link href={`/${locale}/struktur/${unit.slug}`}>{unit.name}</Link>
              <span className="un-crumb-sep">/</span> <span className="un-crumb-cur">{tr('Sənədlər', locale)}</span>
            </nav>
          </div>
        </section>

        <div className="container">
          <div className="un-block" style={{ borderTop: 'none' }}>
            {groups.length ? (
              groups.map((g) => (
                <div key={g.cat} style={{ marginBottom: '1.75rem' }}>
                  <div className="un-sub-title">{tr(DOC_CATEGORY_LABEL_AZ[g.cat], locale)}</div>
                  <DocList docs={g.items} locale={locale} />
                </div>
              ))
            ) : (
              <p className="un-empty">{tr('Bu bölmə üçün sənəd əlavə olunmayıb.', locale)}</p>
            )}
          </div>
        </div>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
