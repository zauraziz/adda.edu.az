// K30 — /[locale]/bunlar-ucun/[slug]
//
// Header-dəki «Bunlar üçün» menyusunun bəndləri real səhifəyə gedir. Hər
// səhifə saytın həmin auditoriya üçün kəsilmiş versiyasıdır: yeni məzmun
// deyil, MÖVCUD səhifələrin auditoriyaya görə seçilmiş yığımı.
//
// F5.49 — sağ panelli şablon (AudiencePage): addımlar, bölmələr, canlı lent,
// mənbə səhifələrin sualları; yeddinci auditoriya «Tərəfdaşlar və işəgötürənlər».
// Kuratorluq `lib/audiences.ts`-dədir — `npm run check:audiences` yoxlayır.
import '../../../_styles/01-base.css';
import '../../../_styles/02-header.css';
import '../../../_styles/03-hero.css';
import '../../../_styles/04-quicknav.css';
import '../../../_styles/05-legacy.css';
import '../../../_styles/06-spotlight.css';
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
import '../../../_styles/33-audience.css';
import '../../../_styles/36-unit.css';
import '../../../_styles/37-program.css';
import '../../../_styles/42-qebul.css';
import '../../../_styles/44-faq.css';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AudiencePage from '../../../_components/AudiencePage';
import { getFaqSources, getMenu, getTitleFeedEvents, getTitleFeedNews, type SiteMenu } from '@/lib/strapi';
import { AUDIENCES, audienceBySlug } from '@/lib/audiences';
import { tr, LOCALES, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

export const revalidate = 300;
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => AUDIENCES.map((a) => ({ locale, slug: a.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const aud = audienceBySlug(slug);
  if (!aud) return { title: tr('Bunlar üçün', locale) };
  return { title: tr(aud.label, locale), description: tr(aud.lead, locale) };
}

export default async function AudienceRoute({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const aud = audienceBySlug(slug);
  if (!aud) notFound();

  const [menu, events, news, sources] = await Promise.all([
    getMenu(locale).catch(() => null as SiteMenu | null),
    aud.feed ? getTitleFeedEvents(aud.feed, locale) : Promise.resolve([]),
    aud.feed ? getTitleFeedNews(aud.feed, locale) : Promise.resolve([]),
    aud.faqFrom?.length ? getFaqSources(locale) : Promise.resolve([]),
  ]);

  return (
    <AudiencePage locale={locale} menu={menu} aud={aud} events={events} news={news} sources={sources} now={Date.now()} />
  );
}
