// K18 — Struktur səhifəsi: /[locale]/struktur/[slug]
//
// Miqrasiyadan gələn məzmun burada görünür. Layout `ContentPage`-dədir,
// bu fayl yalnız məlumat çəkir və etiketləri hazırlayır.
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
import '../../../_styles/23-correction.css';
import '../../../_styles/24-identity.css';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ContentPage from '../../../_components/ContentPage';
import {
  getDepartmentBySlug,
  getDepartmentSlugs,
  getMenu,
  getStaff,
  getUnitBySlug,
  getUnitSlugs,
  type Department,
  type OrgUnit,
  type Person,
  type SiteMenu,
} from '@/lib/strapi';
import { tr, isLocale, DEFAULT_LOCALE, LOCALES, type Locale } from '@/lib/i18n';

export const revalidate = 300;

/**
 * HƏR İKİ MƏNBƏ. `unit` 2025 təşkilati sxemidir (23 bölmə), `department` isə
 * köhnə saytdan gələn məzmundur (12 sənəd). Yalnız 5 slug üst-üstə düşür.
 *
 * K26-9-da struktur ağacı `unit` slug-larına link verirdi, bu səhifə isə
 * yalnız `department`-ə baxırdı — 23 bölmədən 18-i 404 verirdi.
 */
export async function generateStaticParams() {
  const out: Array<{ locale: string; slug: string }> = [];
  for (const locale of LOCALES) {
    const seen = new Set<string>();
    for (const slug of await getUnitSlugs(locale)) seen.add(slug);
    for (const slug of await getDepartmentSlugs(locale)) seen.add(slug);
    for (const slug of seen) out.push({ locale, slug });
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const [unit, dep] = await Promise.all([
    getUnitBySlug(slug, locale).catch(() => null),
    getDepartmentBySlug(slug, locale).catch(() => null),
  ]);
  const name = unit?.name ?? dep?.name;
  return name ? { title: name } : { title: tr('Struktur', locale) };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  const [unit, dep, menu, staff] = await Promise.all([
    getUnitBySlug(slug, locale).catch(() => null as OrgUnit | null),
    getDepartmentBySlug(slug, locale).catch(() => null as Department | null),
    getMenu(locale).catch(() => null as SiteMenu | null),
    getStaff(locale).catch(() => [] as Person[]),
  ]);

  if (!unit && !dep) notFound();

  const name = unit?.name ?? (dep as Department).name;

  // Məzmun: `department`-dəki mətn üstündür (köhnə saytdan gələn təsvir),
  // yoxdursa `unit.about`.
  const body = dep?.about || unit?.about || null;

  // Bu bölmədə çalışanlar — `roles[].unitName` ilə uyğunlaşır.
  const people = unit
    ? staff.filter((p) => (p.roles ?? []).some((r) => r.unitName === unit.name))
    : [];

  const vacancies = unit?.vacancies ?? [];

  const extra: string[] = [];
  if (unit?.parent) {
    extra.push(`**${tr('Tabeliyi', locale)}:** [${tr(unit.parent.name, locale)}](/${locale}/struktur/${unit.parent.slug})`);
  }
  if (vacancies.length) {
    extra.push(`**${tr('Vakansiya', locale)}:** ${vacancies.map((v) => tr(v.position, locale)).join(', ')}`);
  }
  if (people.length) {
    extra.push('', `### ${tr('Heyət', locale)} (${people.length})`, '');
    for (const p of people) {
      const role = (p.roles ?? []).find((r) => r.unitName === unit?.name);
      const post = role ? ` — ${tr(role.position, locale)}` : '';
      extra.push(`- [${p.displayName || p.name}](/${locale}/emekdas/${p.slug})${post}`);
    }
  }

  const fullBody = [body, extra.length ? extra.join('\n') : null].filter(Boolean).join('\n\n') || null;

  const correctionLabels: Record<string, string> = {
    title: tr('Düzəliş təklif et', locale),
    subtitle: tr('Səhv gördünüzsə bizə bildirin.', locale),
    fieldLabel: tr('Hansı sahə?', locale),
    close: tr('Bağla', locale),
    error: tr('Uğursuz əməliyyat', locale),
    verified: tr('Təsdiqlənmiş', locale),
    gateCorrection: tr('Düzəliş göndərmək üçün kimlik təsdiqi lazımdır', locale),
    verifyHeading: tr('Kimliyinizi təsdiqləyin', locale),
    verifyIntro: tr('E-poçtunuza bir dəfəlik giriş linki göndərəcəyik. Parol lazım deyil.', locale),
    emailPlaceholder: tr('Email ünvanınız', locale),
    sendLink: tr('Giriş linki göndər', locale),
    linkSent: tr('Link göndərildi', locale),
    checkInbox: tr('Poçt qutunuzu yoxlayın. Link 15 dəqiqə etibarlıdır.', locale),
    otherAddress: tr('Başqa ünvan yaz', locale),
    badEmail: tr('Düzgün e-poçt ünvanı daxil edin.', locale),
    tooMany: tr('Çox sayda cəhd. Bir az sonra yenidən yoxlayın.', locale),
    unconfigured: tr('Kimlik xidməti hazırda əlçatan deyil.', locale),
    mailFailed: tr('E-poçt göndərilə bilmədi. Bir az sonra yenidən cəhd edin və ya kadrlar şöbəsinə müraciət edin.', locale),
  };

  return (
    <ContentPage
      locale={locale}
      menu={menu}
      kicker={tr('Struktur', locale)}
      title={name}
      body={fullBody}
      correction={{ targetType: 'general', targetSlug: slug, labels: correctionLabels }}
    />
  );
}
