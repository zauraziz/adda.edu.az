// F5.35c — /[locale]/auditoriyalar: simulyator/trenajor/laboratoriya/
// ixtisaslaşdırılmış auditoriya kataloqu, tipə görə qruplaşdırılıb. Hər sətir:
// otaq nömrəsi · ad (obyekt səhifəsinə keçid) · kafedra (struktur səhifəsinə
// keçid). Kafedraya görə süzgəc client-side-dır (FacilityCatalog).
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
import '../../_styles/36-unit.css';
import '../../_styles/41-facility.css';
import type { Metadata } from 'next';
import SiteHeaderStack from '../../_components/SiteHeaderStack';
import Footer from '../../_components/Footer';
import FacilityCatalog, { type FacilityGroup } from '../../_components/FacilityCatalog';
import {
  getMenu,
  getFacilityCatalog,
  FACILITY_TYPES,
  FACILITY_PLURAL_AZ,
  type SiteMenu,
  type Facility,
} from '@/lib/strapi';
import { tr, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  return { title: tr('Auditoriya və laboratoriyalar', locale) };
}

export default async function FacilitiesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  const [menu, facilities] = await Promise.all([
    getMenu(locale).catch(() => null as SiteMenu | null),
    getFacilityCatalog(locale).catch(() => [] as Facility[]),
  ]);

  const sorted = [...facilities].sort((a, b) => a.sortOrder - b.sortOrder);
  const groups: FacilityGroup[] = FACILITY_TYPES.map((t) => ({
    type: t,
    label: tr(FACILITY_PLURAL_AZ[t], locale),
    items: sorted
      .filter((f) => f.facilityType === t && f.slug)
      .map((f) => ({
        slug: f.slug,
        href: `/${locale}/auditoriyalar/${f.slug}`,
        roomNumber: f.roomNumber,
        name: f.name,
        unit: f.unit?.name
          ? { slug: f.unit.slug, name: tr(f.unit.name, locale), href: `/${locale}/struktur/${f.unit.slug}` }
          : null,
      })),
  })).filter((g) => g.items.length);

  // Süzgəc siyahısı: obyekti olan kafedralar, əlifba sırası (az).
  const unitMap = new Map<string, string>();
  for (const g of groups) for (const i of g.items) if (i.unit) unitMap.set(i.unit.slug, i.unit.name);
  const units = [...unitMap.entries()]
    .map(([slug, name]) => ({ slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'az'));

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main>
        <section className="np-hero">
          <div className="container np-hero-inner">
            <div className="np-eyebrow">{tr('Akademiya', locale)}</div>
            <h1 className="np-h1">{tr('Auditoriya və laboratoriyalar', locale)}</h1>
            <p className="np-lead">
              {tr(
                'Akademiyanın simulyator, trenajor, laboratoriya və ixtisaslaşdırılmış auditoriyaları — kafedralar üzrə.',
                locale,
              )}
            </p>
          </div>
        </section>

        <section className="np-wrap">
          <div className="container">
            {groups.length ? (
              <FacilityCatalog
                groups={groups}
                units={units}
                labels={{
                  filter: tr('Kafedraya görə süz', locale),
                  all: tr('Bütün kafedralar', locale),
                  nothing: tr('Uyğun obyekt tapılmadı.', locale),
                }}
              />
            ) : (
              <p className="np-empty">{tr('Obyekt məlumatı hazırda əlçatan deyil.', locale)}</p>
            )}
          </div>
        </section>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
