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
import '../../_styles/28-staff.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeaderStack from '../../_components/SiteHeaderStack';
import Footer from '../../_components/Footer';
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

interface Node extends OrgUnit {
  children: Node[];
  staffCount: number;
}

function buildTree(units: OrgUnit[], staff: Person[]): Node[] {
  const counts = new Map<string, number>();
  for (const p of staff) {
    for (const r of p.roles ?? []) {
      if (r.unitName) counts.set(r.unitName, (counts.get(r.unitName) ?? 0) + 1);
    }
  }

  const nodes = new Map<string, Node>();
  for (const u of units) {
    nodes.set(u.slug, { ...u, children: [], staffCount: counts.get(u.name) ?? 0 });
  }

  const roots: Node[] = [];
  for (const n of nodes.values()) {
    const parent = n.parent?.slug ? nodes.get(n.parent.slug) : null;
    if (parent) parent.children.push(n);
    else roots.push(n);
  }
  return roots;
}

function Branch({ nodes, locale }: { nodes: Node[]; locale: Locale }) {
  if (!nodes.length) return null;
  return (
    <ul className="stf-tree">
      {nodes.map((n) => {
        const vacancies = n.vacancies ?? [];
        const meta: string[] = [];
        if (n.staffCount) meta.push(`${n.staffCount} ${tr('işçi', locale)}`);
        if (n.children.length) meta.push(`${n.children.length} ${tr('bölmə', locale)}`);
        return (
          <li key={n.slug} className={n.children.length ? 'stf-node' : 'stf-node stf-node--leaf'}>
            <Link href={`/${locale}/struktur/${n.slug}`} className="stf-unit">
              <span className="stf-unit-name">{tr(n.name, locale)}</span>
              {meta.length ? <span className="stf-unit-meta">{meta.join(' · ')}</span> : null}
              {vacancies.map((v) => (
                <span key={v.position} className="stf-vac">
                  {tr(v.position, locale)} — {tr('vakant', locale)}
                </span>
              ))}
            </Link>
            <Branch nodes={n.children} locale={locale} />
          </li>
        );
      })}
    </ul>
  );
}

export default async function StructurePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  const [menu, units, staff] = await Promise.all([
    getMenu(locale).catch(() => null as SiteMenu | null),
    getUnits(locale).catch(() => [] as OrgUnit[]),
    getStaff(locale).catch(() => [] as Person[]),
  ]);

  const roots = buildTree(units, staff);

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main>
        <section className="np-hero">
          <div className="container np-hero-inner">
            <div className="np-eyebrow">{tr('Akademiya', locale)}</div>
            <h1 className="np-h1">{tr('Təşkilati struktur', locale)}</h1>
            <p className="np-lead">{tr('Akademiyanın 2025-ci il üçün təsdiqlənmiş təşkilati strukturu.', locale)}</p>
          </div>
        </section>

        <section className="np-wrap">
          <div className="container">
            {roots.length ? (
              <Branch nodes={roots} locale={locale} />
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
