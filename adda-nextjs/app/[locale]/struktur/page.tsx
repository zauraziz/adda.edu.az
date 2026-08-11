// K26 — /[locale]/struktur
//
// Bu marşrut ƏVVƏL YOX İDİ: yalnız `struktur/[slug]` mövcud idi, ona görə
// menyudakı "Təşkilati struktur" 404 verirdi.
//
// Ağac SƏHİFƏDƏ qurulur, Strapi-də yox — iç-içə populate dərinliyi məhduddur,
// düz siyahı + `parent.slug` isə istənilən dərinlikdə işləyir.
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
import '../../_styles/34-org.css';
import '../../_styles/28-staff.css';
import type { Metadata } from 'next';
import SiteHeaderStack from '../../_components/SiteHeaderStack';
import Footer from '../../_components/Footer';
import OrgTree, { type OrgNode } from '../../_components/OrgTree';
import { getMenu, getUnits, getStaff, type OrgUnit, type Person, type SiteMenu } from '@/lib/strapi';
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
    title: tr('Təşkilati struktur', locale),
    description: tr('Azərbaycan Dövlət Dəniz Akademiyasının təşkilati strukturu.', locale),
  };
}

// Ağac serverdə qurulur və SERİALİZASİYA OLUNAN formada klientə verilir.
// `tr()` burada tətbiq olunur — i18n lüğəti klient bundle-ına düşmür.
function buildTree(units: OrgUnit[], staff: Person[], locale: Locale): OrgNode[] {
  const counts = new Map<string, number>();
  for (const p of staff) {
    for (const r of p.roles ?? []) {
      if (r.unitName) counts.set(r.unitName, (counts.get(r.unitName) ?? 0) + 1);
    }
  }

  const nodes = new Map<string, OrgNode & { _parent: string | null }>();
  for (const u of units) {
    nodes.set(u.slug, {
      slug: u.slug,
      name: tr(u.name, locale),
      href: `/${locale}/struktur/${u.slug}`,
      head: u.head
        ? { name: u.head.name, href: `/${locale}/emekdas/${u.head.slug}` }
        : null,
      staffCount: counts.get(u.name) ?? 0,
      vacancies: (u.vacancies ?? []).map((v) => tr(v.position, locale)),
      children: [],
      _parent: u.parent?.slug ?? null,
    });
  }

  const roots: OrgNode[] = [];
  for (const n of nodes.values()) {
    const parent = n._parent ? nodes.get(n._parent) : null;
    if (parent) parent.children.push(n);
    else roots.push(n);
  }
  return roots;
}

export default async function StructurePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  const [menu, units, staff] = await Promise.all([
    getMenu(locale).catch(() => null as SiteMenu | null),
    getUnits(locale).catch(() => [] as OrgUnit[]),
    getStaff(locale).catch(() => [] as Person[]),
  ]);

  const roots = buildTree(units, staff, locale);

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main>
        <section className="np-hero">
          <div className="container np-hero-inner">
            <div className="np-eyebrow">{tr('Akademiya', locale)}</div>
            <h1 className="np-h1">{tr('Təşkilati struktur', locale)}</h1>
            <p className="np-lead">
              {tr(
                'Akademiyanın təsdiqlənmiş təşkilati strukturu — bölmələr, rəhbərlər və tabelik silsiləsi.',
                locale,
              )}
            </p>
          </div>
        </section>

        <section className="np-wrap">
          <div className="container">
            {roots.length ? (
              <OrgTree
                roots={roots}
                labels={{
                  search: tr('Bölmə və ya rəhbər axtar', locale),
                  clear: tr('Təmizlə', locale),
                  expandAll: tr('Hamısını aç', locale),
                  collapseAll: tr('Hamısını yığ', locale),
                  staff: tr('işçi', locale),
                  units: tr('bölmə', locale),
                  vacant: tr('vakant', locale),
                  nothing: tr('Uyğun bölmə tapılmadı.', locale),
                }}
              />
            ) : (
              <p className="np-empty">{tr('Struktur məlumatı hazırda əlçatan deyil.', locale)}</p>
            )}
          </div>
        </section>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
