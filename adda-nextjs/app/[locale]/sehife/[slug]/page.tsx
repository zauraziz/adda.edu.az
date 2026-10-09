// K18 — Səhifə səhifəsi: /[locale]/sehife/[slug]
//
// Miqrasiyadan gələn məzmun burada görünür. Layout `ContentPage`-dədir,
// bu fayl yalnız məlumat çəkir və etiketləri hazırlayır.
// F5.45 — `layout` bolmeli/qebul olan səhifə sağ panelli şablonda
// (`SectionPage`, ixtisas səhifəsinin dizaynı); `dataBlock` üçün canlı
// məlumat (kataloq, açıq qapı tədbirləri) burada çəkilir.
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
import '../../../_styles/36-unit.css';
import '../../../_styles/37-program.css';
import '../../../_styles/42-qebul.css';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ContentPage from '../../../_components/ContentPage';
import SectionPage, { type SectionPageData } from '../../../_components/SectionPage';
import {
  getPageBySlug,
  getPageSlugs,
  getMenu,
  getPrograms,
  getOpenDayEvents,
  getOpenDayNews,
  withAzFallback,
  type PageDoc,
  type Program,
  type SiteMenu,
} from '@/lib/strapi';
import { buildRows } from '@/lib/admission';
import { tr, isLocale, DEFAULT_LOCALE, LOCALES, type Locale } from '@/lib/i18n';

export const revalidate = 300;

export async function generateStaticParams() {
  const out: Array<{ locale: string; slug: string }> = [];
  for (const locale of LOCALES) {
    for (const slug of await getPageSlugs(locale)) out.push({ locale, slug });
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
  const { doc } = await withAzFallback((loc) => getPageBySlug(slug, loc), locale);
  if (!doc) return { title: tr('Səhifə', locale) };
  return doc.seoDescription ? { title: doc.title, description: doc.seoDescription } : { title: doc.title };
}

/** F5.45 — `dataBlock` üçün canlı məlumat. Xəta olsa boş — səhifə sınmasın. */
async function loadSectionData(doc: PageDoc, locale: Locale): Promise<SectionPageData> {
  const block = doc.dataBlock ?? 'yox';
  if (block === 'yox') return {};
  if (block === 'aciq_qapi') {
    const [events, news] = await Promise.all([getOpenDayEvents(locale), getOpenDayNews(locale)]);
    return { events, news, now: Date.now() };
  }
  // Kataloq: az tam siyahıdır, cari dildə yalnız başlıq/slug (documentId üzrə).
  const [az, loc] = await Promise.all([
    getPrograms('az').catch(() => [] as Program[]),
    locale === 'az' ? Promise.resolve([] as Program[]) : getPrograms(locale).catch(() => [] as Program[]),
  ]);
  return { rows: buildRows(az, loc) };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  const [{ doc, isFallback }, menu] = await Promise.all([
    withAzFallback((loc) => getPageBySlug(slug, loc), locale),
    getMenu(locale).catch(() => null as SiteMenu | null),
  ]);

  if (!doc) notFound();

  const correctionLabels: Record<string, string> = {
    promptHint: tr('Bu səhifədə səhv gördünüz?', locale),
    prompt: tr('Düzəliş təklif et', locale),
    title: tr('Düzəliş təklifi', locale),
    subtitle: tr('Səhv gördünüzsə bizə bildirin.', locale),
    fieldLabel: tr('Hansı sahə?', locale),
    f_title: tr('Başlıq', locale),
    f_body: tr('Mətn', locale),
    f_other: tr('Digər', locale),
    currentLabel: tr('Cari mətn', locale),
    currentHint: tr('Düzəliş lazım olan hissəni bura köçürün', locale),
    suggestedLabel: tr('Təklif etdiyiniz düzəliş', locale),
    suggestedHint: tr('Düzgün variant', locale),
    diffLabel: tr('Fərq önizləməsi', locale),
    reasonLabel: tr('Səbəb (istəyə bağlı)', locale),
    submit: tr('Düzəlişi göndər', locale),
    sending: tr('Göndərilir', locale),
    successMsg: tr('Təklifiniz göndərildi. Töhfəniz üçün təşəkkür edirik.', locale),
    successSub: tr('Redaktə komandamız qısa zamanda yoxlayacaq.', locale),
    emptyErr: tr('Zəhmət olmasa düzəliş mətnini daxil edin.', locale),
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

  if (doc.layout === 'bolmeli' || doc.layout === 'qebul') {
    const data = await loadSectionData(doc, locale);
    return (
      <SectionPage
        locale={locale}
        menu={menu}
        doc={doc}
        slug={slug}
        isFallback={isFallback}
        data={data}
        correctionLabels={correctionLabels}
      />
    );
  }

  return (
    <ContentPage
      locale={locale}
      menu={menu}
      isFallback={isFallback}
      kicker={tr('Səhifə', locale)}
      title={doc.title}
      body={doc.body}
      correction={{ targetType: 'page', targetSlug: slug, labels: correctionLabels }}
    />
  );
}
