// F2.6e-2 / Kimlik — /[locale]/kimlik
// Parolsuz (magic-link) giriş səhifəsi. Kimlik vəziyyəti client island-da
// oxunur (`/api/identity/me`), ona görə səhifə statik qalır.
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
import '../../_styles/24-identity.css';
import type { Metadata } from 'next';
import SiteHeaderStack from '../../_components/SiteHeaderStack';
import Footer from '../../_components/Footer';
import IdentityIsland from '../../_components/IdentityIsland';
import { getMenu, type SiteMenu } from '@/lib/strapi';
import { tr, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  return { title: tr('Kimlik', locale) };
}

export default async function IdentityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const menu = await getMenu(locale).catch(() => null as SiteMenu | null);

  const labels: Record<string, string> = {
    // qapi
    verifyHeading: tr('Kimliyinizi təsdiqləyin', locale),
    verifyIntro: tr('E-poçtunuza bir dəfəlik giriş linki göndərəcəyik. Parol lazım deyil.', locale),
    emailPlaceholder: tr('Email ünvanınız', locale),
    sendLink: tr('Giriş linki göndər', locale),
    sending: tr('Göndərilir', locale),
    linkSent: tr('Link göndərildi', locale),
    checkInbox: tr('Poçt qutunuzu yoxlayın. Link 15 dəqiqə etibarlıdır.', locale),
    otherAddress: tr('Başqa ünvan yaz', locale),
    badEmail: tr('Düzgün e-poçt ünvanı daxil edin.', locale),
    tooMany: tr('Çox sayda cəhd. Bir az sonra yenidən yoxlayın.', locale),
    unconfigured: tr('Kimlik xidməti hazırda əlçatan deyil.', locale),
    error: tr('Uğursuz əməliyyat', locale),
    // kart
    verified: tr('Təsdiqlənmiş', locale),
    verifiedNote: tr('Bu brauzerdə təsdiqlənmisiniz. Qeydiyyat və düzəliş göndərə bilərsiniz.', locale),
    logout: tr('Çıxış', locale),
    loading: tr('Yüklənir', locale),
    // tesdiq
    confirmHeading: tr('Girişi tamamlayın', locale),
    confirmIntro: tr('Aşağıdakı düymə ilə kimliyinizi təsdiqləyin.', locale),
    confirm: tr('Təsdiqlə', locale),
    confirming: tr('Təsdiqlənir', locale),
    verifiedOk: tr('Kimliyiniz təsdiqləndi.', locale),
    continue: tr('Davam et', locale),
    linkInvalid: tr('Link etibarsızdır və ya vaxtı keçib.', locale),
    linkMissing: tr('Linki tapmaq mümkün olmadı.', locale),
    requestNew: tr('Yeni link istə', locale),
  };

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main className="idn-page">
        <div className="container">
          <header className="idn-page-head">
            <span className="idn-page-kicker">{tr('Kimlik', locale)}</span>
            <h1 className="idn-page-title">{tr('Parolsuz giriş', locale)}</h1>
            <p className="idn-page-sub">
              {tr('ADDA saytında qeydiyyat və düzəliş göndərmək üçün e-poçtunuzu bir dəfə təsdiqləyin.', locale)}
            </p>
          </header>
          <IdentityIsland locale={locale} labels={labels} />
        </div>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
