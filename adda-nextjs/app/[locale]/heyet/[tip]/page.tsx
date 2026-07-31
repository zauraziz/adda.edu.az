// K26 — /[locale]/heyet/[tip]
//
// Menyudakı üç bənd bura gəlir:
//   professor-muellim -> akademik
//   telimci-texniki   -> telimci_texniki
//   inzibati          -> inzibati + rehberlik
//
// FİLTR `roles` ÜZRƏDİR, `staffType` üzrə DEYİL. Səbəb: 22 nəfərin iki
// vəzifəsi var (məs. dekan + professor). Yalnız əsas `staffType`-a baxsaydıq,
// dekan professor siyahısından tamamilə düşərdi.
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
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeaderStack from '../../../_components/SiteHeaderStack';
import Footer from '../../../_components/Footer';
import { getMenu, getStaff, type Person, type SiteMenu, type StaffType } from '@/lib/strapi';
import { tr, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

export const revalidate = 300;

const TABS: { slug: string; label: string; types: StaffType[] }[] = [
  { slug: 'professor-muellim', label: 'Professor-müəllim heyəti', types: ['akademik'] },
  { slug: 'telimci-texniki', label: 'Təlimçi-texniki heyət', types: ['telimci_texniki'] },
  { slug: 'inzibati', label: 'İnzibati heyət', types: ['inzibati', 'rehberlik'] },
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

/** Vəzifə sıra nömrəsi — ştatdakı ardıcıllığı saxlayır (rəhbərlik yuxarıda). */
function sortKey(p: Person, types: StaffType[]): number {
  const own = (p.roles ?? []).filter((r) => types.includes(r.staffType));
  const min = own.reduce((a, r) => Math.min(a, r.sortOrder ?? 9999), 9999);
  return min;
}

export default async function StaffPage({
  params,
}: {
  params: Promise<{ locale: string; tip: string }>;
}) {
  const { locale: raw, tip } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  const tab = TABS.find((t) => t.slug === tip);
  if (!tab) notFound();

  const [menu, all] = await Promise.all([
    getMenu(locale).catch(() => null as SiteMenu | null),
    getStaff(locale).catch(() => [] as Person[]),
  ]);

  const people = all
    .filter((p) => (p.roles ?? []).some((r) => tab.types.includes(r.staffType)))
    .sort((a, b) => sortKey(a, tab.types) - sortKey(b, tab.types));

  // Bölmə üzrə qruplaşdırma — inzibati heyət üçün mənalıdır, akademik
  // heyət üçün ştatda bölmə göstərilmir, ona görə tək siyahı qalır.
  const grouped = new Map<string, Person[]>();
  for (const p of people) {
    const role = (p.roles ?? []).find((r) => tab.types.includes(r.staffType));
    const key = role?.unitName || '';
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(p);
  }
  const useGroups = grouped.size > 1 && !grouped.has('');

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main className="na-wrap">
        <header className="st-head">
          <p className="st-kicker">{tr('Akademiya', locale)}</p>
          <h1 className="st-title">{tr(tab.label, locale)}</h1>
        </header>

        <nav className="hy-tabs" aria-label={tr('Heyət', locale)}>
          {TABS.map((t) => (
            <Link
              key={t.slug}
              href={`/${locale}/heyet/${t.slug}`}
              className="hy-tab"
              aria-current={t.slug === tab.slug ? 'page' : undefined}
            >
              {tr(t.label, locale)}
            </Link>
          ))}
        </nav>

        <p className="hy-count">
          {people.length} {tr('nəfər', locale)}
        </p>

        {!people.length ? (
          <p className="hy-empty">{tr('Bu bölmə üzrə məlumat hazırda əlçatan deyil.', locale)}</p>
        ) : useGroups ? (
          [...grouped.entries()].map(([unit, list]) => (
            <section key={unit} className="hy-group">
              <h2 className="hy-group-title">{tr(unit, locale)}</h2>
              <PersonList list={list} types={tab.types} locale={locale} />
            </section>
          ))
        ) : (
          <PersonList list={people} types={tab.types} locale={locale} />
        )}
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}

function PersonList({
  list,
  types,
  locale,
}: {
  list: Person[];
  types: StaffType[];
  locale: Locale;
}) {
  return (
    <ul className="hy-list">
      {list.map((p) => {
        const roles = p.roles ?? [];
        const primary = roles.find((r) => types.includes(r.staffType));
        // Bu siyahıya aid OLMAYAN digər vəzifə — kontekst üçün göstərilir.
        const other = roles.find((r) => !types.includes(r.staffType));
        return (
          <li key={p.slug} className="hy-item">
            <span className="hy-person">{p.name}</span>
            {primary ? <span className="hy-role">{tr(primary.position, locale)}</span> : null}
            {other ? (
              <span className="hy-role hy-role--extra">{tr(other.position, locale)}</span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
