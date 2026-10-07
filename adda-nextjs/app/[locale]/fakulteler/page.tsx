// K26 — /[locale]/fakulteler
// K26-3-de menyudan bura link qoymusdum, amma siyahi sehifesi yox idi -> 404.
//
// F5.41 — BU, SİYAHI SƏHİFƏSİDİR (kafedralar nümunəsi). /fakulteler/[slug]
// DETAL SƏHİFƏSİ SİLİNDİ: eyni fakültənin iki səhifəsi (/fakulteler/x və
// /struktur/x) çaşqınlıq yaradırdı. Kart birbaşa /struktur/[slug]-ə keçir —
// fakültənin YEGANƏ səhifəsi struktur bölmədir; köhnə /fakulteler/x ünvanı
// next.config.js-də 301 ilə ora gedir. Məlumat da bölmələrdən gəlir
// (getFacultyUnits): ad ru/en-də var, dekan bölmənin rəhbəridir.
// «2. Akademiya — Fakültə» (Strapi) arxivdir — burada OXUNMUR.
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
import { getMenu, getFacultyUnits, type FacultyUnit, type SiteMenu } from '@/lib/strapi';
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

/** Kart üçün qısa düz mətn — Markdown işarələri, şəkil və keçidlər atılır. */
function plainExcerpt(md: string | null, max = 180): string {
  if (!md) return '';
  const t = md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^[ \t]*(?:[-*+>]|\d+\.)\s+/gm, '')
    .replace(/^[ \t]*#{1,6}\s+/gm, '')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const sp = cut.lastIndexOf(' ');
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut).trimEnd() + '…';
}

function FacultyCard({ f, locale }: { f: FacultyUnit; locale: Locale }) {
  const dean = f.head ? f.head.displayName?.trim() || f.head.name.trim() : '';
  const role = f.head?.position?.trim() || 'Dekan';
  const excerpt = plainExcerpt(f.about);
  const kafedras = (f.children ?? []).filter((c) => c.slug.endsWith('-kafedrasi')).length;
  return (
    <Link href={`/${locale}/struktur/${f.slug}`} className="np-card">
      <span className="np-card-body">
        <h2 className="np-card-title">{f.name}</h2>
        {dean ? (
          <p className="np-card-ex">
            {tr(role, locale)}: {dean}
          </p>
        ) : null}
        {excerpt ? <p className="np-card-ex">{excerpt}</p> : null}
        {kafedras ? (
          <span className="np-meta">
            <span className="np-date">
              <i className="ti ti-sitemap" aria-hidden="true" />
              {tr('Kafedralar', locale)}: {kafedras}
            </span>
          </span>
        ) : null}
      </span>
    </Link>
  );
}

export default async function FacultyListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  const [menu, faculties] = await Promise.all([
    getMenu(locale).catch(() => null as SiteMenu | null),
    // Bölmənin ru/en versiyası yoxdursa az siyahısı (slug eynidir).
    getFacultyUnits(locale)
      .then((list) => (list.length || locale === 'az' ? list : getFacultyUnits('az')))
      .catch(() => [] as FacultyUnit[]),
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
                  <FacultyCard key={f.slug} f={f} locale={locale} />
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
