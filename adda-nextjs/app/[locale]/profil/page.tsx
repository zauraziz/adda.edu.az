// K26-12 — /[locale]/profil — əməkdaşın öz səhifəsini doldurması.
//
// NİYƏ LAZIMDIR: 162 profili mərkəzdən doldurmaq həm uzundur, həm də bir
// müddət sonra köhnəlir. Sahibinin özü yeniləyəndə məlumat aktual qalır.
//
// GİRİŞ: mövcud magic-link kimliyi. Yalnız korporativ domen (default
// adda.edu.az, `PROFILE_EMAIL_DOMAINS` ilə dəyişir) və yalnız öz qeydi.
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
import '../../_styles/28-staff.css';
import '../../_styles/29-directory.css';
import '../../_styles/30-profile-edit.css';
import type { Metadata } from 'next';
import SiteHeaderStack from '../../_components/SiteHeaderStack';
import Footer from '../../_components/Footer';
import ProfileEditorIsland from '../../_components/ProfileEditorIsland';
import { getMenu, type SiteMenu } from '@/lib/strapi';
import { tr, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

export const revalidate = 0;

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
    title: tr('Profilim', locale),
    // Şəxsi kabinetdir — axtarış sistemlərində olmamalıdır.
    robots: { index: false, follow: false },
  };
}

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const menu = await getMenu(locale).catch(() => null as SiteMenu | null);

  const labels: Record<string, string> = {
    loading: tr('Yüklənir…', locale),
    gateHeading: tr('Korporativ e-poçtunuzla daxil olun', locale),
    deniedTitle: tr('Bu ünvan heyət siyahısında tapılmadı', locale),
    deniedBody: tr('{email} ünvanı heç bir əməkdaş qeydinə bağlı deyil. Korporativ ünvanınızla yenidən cəhd edin və ya kadrlar şöbəsinə müraciət edin.', locale),
    loadFailed: tr('Profil yüklənmədi.', locale),
    retry: tr('Yenidən cəhd et', locale),
    lockedNote: tr('Ad, vəzifə və struktur bölmə ştat cədvəlindən gəlir və burada dəyişdirilmir. Səhv varsa kadrlar şöbəsinə bildirin.', locale),
    contact: tr('Əlaqə', locale),
    phone: tr('Telefon', locale),
    building: tr('Tədris binası', locale),
    office: tr('İş otağı', locale),
    academic: tr('Elmi ad və dərəcə', locale),
    academicTitle: tr('Elmi ad', locale),
    academicDegree: tr('Elmi dərəcə', locale),
    notSelected: tr('Seçilməyib', locale),
    bio: tr('Haqqımda', locale),
    markdownHint: tr('Sadə mətn və ya Markdown yaza bilərsiniz.', locale),
    researchAreas: tr('Peşəkar maraqlar', locale),
    tagPlaceholder: tr('Məsələn: dəniz naviqasiyası', locale),
    languages: tr('Dil bilikləri', locale),
    levelPlaceholder: tr('Səviyyə', locale),
    scholarIds: tr('Elmi identifikatorlar', locale),
    education: tr('Təhsil', locale),
    experience: tr('İş təcrübəsi', locale),
    publications: tr('Nəşrlər', locale),
    periodPlaceholder: tr('1998–2003', locale),
    institution: tr('Təhsil müəssisəsi', locale),
    qualification: tr('İxtisas / dərəcə', locale),
    organization: tr('Təşkilat', locale),
    positionField: tr('Vəzifə', locale),
    pubTitle: tr('Nəşrin adı', locale),
    pubSource: tr('Jurnal / mənbə', locale),
    pubYear: tr('İl', locale),
    teaching: tr('Tədris', locale),
    responsibilities: tr('Səlahiyyətlər və vəzifələr', locale),
    other: tr('Digər', locale),
    add: tr('Sətir əlavə et', locale),
    remove: tr('Sil', locale),
    save: tr('Yadda saxla', locale),
    saving: tr('Saxlanılır…', locale),
    savedMsg: tr('Yadda saxlanıldı.', locale),
    saveFailed: tr('Saxlanmadı.', locale),
    viewPublic: tr('İctimai səhifəmə bax', locale),
    lastUpdated: tr('Son yeniləmə', locale),
    neverUpdated: tr('Hələ yenilənməyib', locale),
    photoPick: tr('Şəkil seç', locale),
    photoBusy: tr('Yüklənir…', locale),
    photoRemove: tr('Şəkli sil', locale),
    photoHint: tr('JPEG, PNG və ya WebP. Ən çox 4 MB. Kvadrata yaxın portret yaxşı görünür.', locale),
    photoFailed: tr('Şəkil yüklənmədi.', locale),
    photoErr_too_large: tr('Fayl çox böyükdür (ən çox 4 MB).', locale),
    photoErr_bad_type: tr('Yalnız JPEG, PNG və WebP qəbul olunur.', locale),
    photoErr_no_file: tr('Fayl seçilməyib.', locale),
    photoErr_rate_limited: tr('Çox sayda cəhd. Bir az sonra yenidən yoxlayın.', locale),
    photoErr_upload_failed: tr('Şəkil serverə yüklənmədi.', locale),
  };

  const gateLabels: Record<string, string> = {
    verifyHeading: tr('Kimliyinizi təsdiqləyin', locale),
    verifyIntro: tr('E-poçtunuza bir dəfəlik giriş linki göndərəcəyik. Parol lazım deyil.', locale),
    emailPlaceholder: tr('Korporativ e-poçt ünvanınız', locale),
    sendLink: tr('Giriş linki göndər', locale),
    linkSent: tr('Link göndərildi', locale),
    checkInbox: tr('Poçt qutunuzu yoxlayın. Link 15 dəqiqə etibarlıdır.', locale),
    otherAddress: tr('Başqa ünvan yaz', locale),
    badEmail: tr('Düzgün e-poçt ünvanı daxil edin.', locale),
    tooMany: tr('Çox sayda cəhd. Bir az sonra yenidən yoxlayın.', locale),
    unconfigured: tr('Kimlik xidməti hazırda əlçatan deyil.', locale),
    mailFailed: tr('E-poçt göndərilə bilmədi. Bir az sonra yenidən cəhd edin və ya kadrlar şöbəsinə müraciət edin.', locale),
    error: tr('Uğursuz əməliyyat', locale),
    close: tr('Bağla', locale),
  };

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main>
        <section className="np-hero">
          <div className="container np-hero-inner">
            <div className="np-eyebrow">{tr('Əməkdaşlar üçün', locale)}</div>
            <h1 className="np-h1">{tr('Profilim', locale)}</h1>
            <p className="np-lead">
              {tr('Öz səhifənizdəki məlumatları buradan yeniləyin. Dəyişiklik dərhal ictimai profilinizdə görünür.', locale)}
            </p>
          </div>
        </section>

        <section className="np-wrap">
          <div className="container">
            <ProfileEditorIsland
              locale={locale}
              labels={labels}
              gateLabels={gateLabels}
              redirect={`/${locale}/profil`}
              degrees={[
                { value: 'elmler_doktoru', label: tr('Elmlər doktoru', locale) },
                { value: 'felsefe_doktoru', label: tr('Fəlsəfə doktoru', locale) },
                { value: 'yoxdur', label: tr('Yoxdur', locale) },
              ]}
              langs={[
                { value: 'az', label: tr('Azərbaycan', locale) },
                { value: 'tr', label: tr('Türk', locale) },
                { value: 'en', label: tr('İngilis', locale) },
                { value: 'ru', label: tr('Rus', locale) },
                { value: 'diger', label: tr('Digər', locale) },
              ]}
            />
          </div>
        </section>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
