// F2.7-6 / AI köməkçi — /[locale]/kopilot
//
// Səhifə SERVER komponentidir: menyu, başlıq və altlıq server tərəfdə qurulur,
// yalnız sual paneli client island-dır. Etiketlər burada tərcümə olunub props
// kimi ötürülür — `T` lüğəti (~55 kB) brauzer bundle-ına düşməsin.
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
import '../../_styles/31-copilot.css';
import type { Metadata } from 'next';
import SiteHeaderStack from '../../_components/SiteHeaderStack';
import Footer from '../../_components/Footer';
import CopilotIsland from '../../_components/CopilotIsland';
import { getMenu, type SiteMenu } from '@/lib/strapi';
import { tr, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  return {
    title: tr('AI köməkçi', locale),
    description: tr('Sayt məzmunu üzrə suallarınıza mənbə göstərməklə cavab verir.', locale),
    // Cavablar generasiya olunur və dəyişkəndir — axtarış indeksinə düşməməlidir.
    robots: { index: false, follow: true },
  };
}

const SAMPLES: Record<Locale, string[]> = {
  az: ['Hansı ixtisaslar var?', 'Qəbul necə aparılır?', 'Fakültələr hansılardır?'],
  ru: ['Какие есть специальности?', 'Как проходит приём?', 'Какие факультеты есть?'],
  en: ['What programmes are offered?', 'How does admission work?', 'What faculties are there?'],
};

export default async function CopilotPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  let menu: SiteMenu | null = null;
  try {
    menu = await getMenu(locale);
  } catch {
    menu = null;
  }

  const labels: Record<string, string> = {
    title: tr('AI köməkçi', locale),
    lede: tr('Sayt məzmunu üzrə suallarınıza mənbə göstərməklə cavab verir.', locale),
    placeholder: tr('Sualınızı yazın…', locale),
    ask: tr('Soruş', locale),
    working: tr('Axtarılır…', locale),
    samples: tr('Nümunə:', locale),
    searching: tr('Mənbələr axtarılır…', locale),
    generating: tr('Cavab hazırlanır…', locale),
    sources: tr('Mənbələr', locale),
    related: tr('Əlaqəli səhifələr', locale),
    refusal_hint: tr('Sualı başqa sözlərlə yazmağa cəhd edin və ya axtarışdan istifadə edin.', locale),
    note: tr('Cavab yalnız saytdakı məzmuna əsaslanır. Mühüm məsələlərdə mənbə səhifəsini yoxlayın.', locale),
    err_rate_limited: tr('Çox sayda sorğu göndərildi. Bir az sonra yenidən cəhd edin.', locale),
    err_query_too_short: tr('Sual çox qısadır.', locale),
    err_unreachable: tr('Xidmət hazırda əlçatmazdır.', locale),
    err_generic: tr('Xəta baş verdi. Yenidən cəhd edin.', locale),
  };

  return (
    <>
      <SiteHeaderStack locale={locale} menu={menu} />
      <main>
        <CopilotIsland locale={locale} labels={labels} samples={SAMPLES[locale]} />
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
