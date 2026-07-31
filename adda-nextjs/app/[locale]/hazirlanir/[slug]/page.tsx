// K26 — /[locale]/hazirlanir/[slug]
//
// Menyuda 180 bənd var, arxivdə isə cəmi 56 struktur sənədi. Qarşılığı olmayan
// bəndlər `#` ilə qalsaydı klik heç nə etməzdi — bu, sınıq link kimi hiss olunur.
// Ona görə həmin bəndlər bura yönəlir.
//
// İKİ QAYDA:
//  1. `noindex` — Google bu səhifələri indeksləməməlidir (nazik məzmun).
//  2. Slug menyuda MÖVCUD olmalıdır, yoxsa 404. Belə olmasa istənilən uydurma
//     slug 200 qaytarardı və sayt sonsuz sayda boş səhifə göstərərdi.
//
// Səhifə çıxılmaz yol olmasın deyə həmin qrupdakı İŞLƏYƏN qardaş linklər
// göstərilir — istifadəçi geri qayıtmadan davam edə bilir.
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
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ContentPage from '../../../_components/ContentPage';
import { getMenu, type SiteMenu, type MenuCategory, type MenuLink } from '@/lib/strapi';
import { menuHref, isPlaceholderHref } from '@/lib/menu-href';
import { tr, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

export const revalidate = 300;

interface Found {
  label: string;
  trail: string[];
  siblings: MenuLink[];
}

/** Menyu ağacında verilmiş `/hazirlanir/{slug}` URL-ini axtarır. */
function findInMenu(menu: SiteMenu | null, href: string): Found | null {
  if (!menu) return null;
  for (const [, value] of Object.entries(menu as unknown as Record<string, unknown>)) {
    const cats = Array.isArray(value) ? value : [value];
    for (const raw of cats) {
      const cat = raw as Partial<MenuCategory> & { title?: string; links?: MenuLink[] };
      if (!cat || typeof cat !== 'object') continue;
      const groups = Array.isArray(cat.groups) ? cat.groups : cat.links ? [{ title: cat.title ?? '', links: cat.links }] : [];
      for (const g of groups) {
        const links = Array.isArray(g?.links) ? g.links : [];
        const hit = links.find((l) => l?.url === href);
        if (hit) {
          return {
            label: hit.label,
            trail: [cat.label ?? cat.title ?? '', g.title ?? ''].filter(Boolean),
            siblings: links.filter((l) => l !== hit && l?.url && l.url !== '#' && !isPlaceholderHref(l.url)),
          };
        }
      }
      if (cat.url === href && cat.label) return { label: cat.label, trail: [], siblings: [] };
    }
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const menu = await getMenu(locale).catch(() => null as SiteMenu | null);
  const found = findInMenu(menu, `/hazirlanir/${slug}`);
  return {
    title: found ? tr(found.label, locale) : tr('Hazırlanır', locale),
    robots: { index: false, follow: false },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  const menu = await getMenu(locale).catch(() => null as SiteMenu | null);
  const found = findInMenu(menu, `/hazirlanir/${slug}`);

  // Menyuda olmayan slug = uydurma URL. 404 ver.
  if (!found) notFound();

  const intro = tr('Bu bölmə üzərində iş gedir. Məzmun hazır olan kimi burada yerləşdiriləcək.', locale);
  const meanwhile = tr('Bu arada axtarışdan istifadə edə və ya aşağıdakı bölmələrə keçə bilərsiniz.', locale);

  const lines = [`_${intro}_`, '', meanwhile];
  if (found.siblings.length) {
    lines.push('');
    for (const s of found.siblings) lines.push(`- [${tr(s.label, locale)}](${menuHref(s.url, locale)})`);
  }

  return (
    <ContentPage
      locale={locale}
      menu={menu}
      kicker={found.trail.map((t) => tr(t, locale)).join(' · ') || tr('Səhifə', locale)}
      title={tr(found.label, locale)}
      body={lines.join('\n')}
      back={{ label: tr('Ana səhifə', locale), href: `/${locale}` }}
    />
  );
}
