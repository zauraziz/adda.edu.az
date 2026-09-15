// F5.30b — /[locale]/vetendaslarin-muracieti: vətəndaşların müraciətinə
// baxılması qaydası. HÜQUQİ SƏHİFƏDİR — mətn tapşırıqda verilən bəndlərə
// SÖZBƏSÖZ uyğun tutulub, ƏLAVƏ hüquqi iddia YAZILMAYIB.
//
// Məzmun STATİKDİR (CMS-dən çəkilmir), ona görə admin redaktə qapısı yoxdur.
//
// DİQQƏT — «Baxılma müddətləri» bölməsi QƏSDƏN boş şablondur: ümumi
// baxılma müddəti (15/30 gün) TƏSDİQLƏNMƏYİB. Rəqəm YAZILMAYIB, ADDA-nın
// hüquq məsləhətçisi dəqiqləşdirənədək. Digər bəndlərdəki konkret müddətlər
// (5/20/10 iş günü) tapşırıqda AÇIQ verilib, ona görə yazılıb.
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
import '../../_styles/36-unit.css';
import '../../_styles/23-correction.css';
import '../../_styles/40-appeal.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeaderStack from '../../_components/SiteHeaderStack';
import Footer from '../../_components/Footer';
import AppealIsland from '../../_components/AppealIsland';
import { getMenu, getUnits, type SiteMenu } from '@/lib/strapi';
import { tr, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

export const revalidate = 300;

export function generateStaticParams() {
  return [{ locale: 'az' }, { locale: 'ru' }, { locale: 'en' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  return {
    title: tr('Vətəndaşların müraciəti', locale),
    description: tr(
      'Rəsmi ərizə, təklif və şikayət vermək qaydası Azərbaycan Respublikasının qanunvericiliyinə əsasən.',
      locale,
    ),
  };
}

export default async function CitizenAppealsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const [menu, units] = await Promise.all([
    getMenu(locale).catch(() => null as SiteMenu | null),
    getUnits(locale).catch(() => []),
  ]);

  // F5.31c — CorrectionIsland ilə EYNİ qayda: tərcümə klient bundle-ına
  // (55 kB-lıq tam T lüğəti) düşməsin deyə hazır string-lər PROP kimi ötürülür.
  const appealLabels: Record<string, string> = {
    title: tr('Müraciət et', locale),
    subtitle: tr('Sual, təklif, ərizə və ya şikayətinizi bura yazın.', locale),
    typeLabel: tr('Müraciət növü', locale),
    type_sual: tr('Sual', locale),
    type_teklif: tr('Təklif', locale),
    type_erize: tr('Ərizə', locale),
    type_sikayet: tr('Şikayət', locale),
    informalNote: tr(
      'Bu, rəsmi müraciət deyil. Rəsmi cavab üçün Təklif/Ərizə/Şikayət seçin.',
      locale,
    ),
    deadlineNote: tr(
      'Bu, rəsmi müraciətdir. Baxılma müddətləri yuxarıdakı bölmədə göstərilib.',
      locale,
    ),
    firstNameLabel: tr('Ad', locale),
    lastNameLabel: tr('Soyad', locale),
    patronymicLabel: tr('Ata adı', locale),
    emailLabel: tr('E-poçt', locale),
    phoneLabel: tr('Telefon', locale),
    addressLabel: tr('Ünvan (istəyə bağlı)', locale),
    unitLabel: tr('Aidiyyəti bölmə (istəyə bağlı)', locale),
    unitPlaceholder: tr('Seçilməyib', locale),
    subjectLabel: tr('Mövzu', locale),
    messageLabel: tr('Mətn', locale),
    submit: tr('Göndər', locale),
    sending: tr('Göndərilir', locale),
    successMsg: tr('Müraciətiniz qəbul edildi.', locale),
    successSub: tr('Cavab yuxarıda göstərdiyiniz e-poçt ünvanına göndəriləcək.', locale),
    trackingLabel: tr('İzləmə kodu', locale),
    requiredErr: tr('Zəhmət olmasa məcburi sahələri doldurun.', locale),
    tooMany: tr('Çox sayda cəhd. Bir az sonra yenidən yoxlayın.', locale),
    error: tr('Müraciət göndərilə bilmədi. Bir az sonra yenidən cəhd edin.', locale),
  };

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main>
        <section className="np-hero">
          <div className="container np-hero-inner">
            <div className="np-eyebrow">{tr('Kommunikasiya', locale)}</div>
            <h1 className="np-h1">{tr('Vətəndaşların müraciəti', locale)}</h1>
            <p className="np-lead">{tr('Vətəndaşların müraciətinə baxılması qaydası', locale)}</p>
          </div>
        </section>

        <div className="container">
          <section className="un-block" style={{ borderTop: 'none' }}>
            <h2 className="un-block-title">{tr('Hüquqi əsas', locale)}</h2>
            <div className="prose">
              <p>
                {tr(
                  'Bu qayda Azərbaycan Respublikası Konstitusiyasının 57-ci maddəsinə və «Vətəndaşların müraciətlərinə baxılması qaydası haqqında» Azərbaycan Respublikasının Qanununa əsaslanır.',
                  locale,
                )}
              </p>
            </div>
          </section>

          <section className="un-block">
            <h2 className="un-block-title">{tr('Müraciət növləri', locale)}</h2>
            <div className="prose">
              <p>
                {tr(
                  'Qanunun 3-cü maddəsinə əsasən müraciətlər üç növə bölünür: təklif, ərizə və şikayət.',
                  locale,
                )}
              </p>
            </div>
          </section>

          <section className="un-block">
            <h2 className="un-block-title">{tr('Müraciət yolları', locale)}</h2>
            <div className="prose">
              <ul>
                <li>{tr('Yazılı', locale)}</li>
                <li>{tr('Elektron', locale)}</li>
                <li>{tr('Şəxsən', locale)}</li>
                <li>{tr('Telefonla', locale)}</li>
              </ul>
            </div>
          </section>

          <section className="un-block">
            <h2 className="un-block-title">{tr('Müraciətdə nə göstərilməlidir', locale)}</h2>
            <div className="prose">
              <p>
                {tr('Müraciətdə aşağıdakılar göstərilməlidir:', locale)}
              </p>
              <ul>
                <li>{tr('Ad', locale)}</li>
                <li>{tr('Ata adı', locale)}</li>
                <li>{tr('Soyad', locale)}</li>
                <li>{tr('Ünvan və ya iş yeri', locale)}</li>
                <li>{tr('İmza', locale)}</li>
              </ul>
              <p>
                {tr('Bunlar göstərilmədikdə müraciət anonim sayılır.', locale)}
              </p>
            </div>
          </section>

          <section className="un-block" id="baxilma-muddetleri">
            <h2 className="un-block-title">{tr('Baxılma müddətləri', locale)}</h2>
            {/* F5.30b — QƏSDƏN BOŞ ŞABLON. Rəqəm YAZILMAYIB (bax fayl başındakı izah). */}
            <p className="pr-plan-note">
              {tr('Bu bənd ADDA-nın hüquq məsləhətçisi tərəfindən dəqiqləşdirilənədək boş saxlanılır.', locale)}
            </p>
          </section>

          <section className="un-block">
            <h2 className="un-block-title">{tr('Cavab', locale)}</h2>
            <div className="prose">
              <p>
                {tr(
                  'Müraciətə yazılı cavab verilir. Müraciət təmin edilmədikdə səbəb göstərilir və şikayət vermək qaydası izah olunur.',
                  locale,
                )}
              </p>
            </div>
          </section>

          <section className="un-block">
            <h2 className="un-block-title">{tr('Təkrar müraciətlər', locale)}</h2>
            <div className="prose">
              <p>
                {tr(
                  'Eyni məsələ üzrə bir il ərzində 3 dəfə əsaslandırılmış cavab verilibsə və yeni məlumat yoxdursa, növbəti müraciət baxılmamış saxlanıla bilər. Bu barədə müraciət edənə 5 iş günü ərzində məlumat verilir.',
                  locale,
                )}
              </p>
            </div>
          </section>

          <section className="un-block" style={{ paddingBottom: '48px' }}>
            <h2 className="un-block-title">{tr('Korrupsiya ilə bağlı müraciətlər', locale)}</h2>
            <div className="prose">
              <p>
                {tr(
                  'Korrupsiya ilə bağlı müraciətlərə 20 iş günü ərzində baxılır. Əlavə məlumat tələb olunduqda müddət daha 10 iş günü uzadıla bilər.',
                  locale,
                )}
              </p>
            </div>
          </section>

          <section className="un-block">
            <AppealIsland
              units={units.map((u) => ({ documentId: u.documentId, name: u.name }))}
              labels={appealLabels}
            />
          </section>

          <section className="un-block" style={{ paddingBottom: '48px' }}>
            <div className="un-links">
              <Link href={`/${locale}/elaqe`} className="un-link-btn">
                <i className="ti ti-arrow-left" aria-hidden="true" />
                {tr('Əlaqə', locale)}
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
