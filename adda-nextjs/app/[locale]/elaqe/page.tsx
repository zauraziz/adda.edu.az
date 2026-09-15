// F5.30a — /[locale]/elaqe: yeni, öz marşrutlu əlaqə səhifəsi.
//
// Köhnə `/sehife/elaqe` Strapi `page` qeydi idi (ContentPage.tsx, tək
// markdown blobu). Bu səhifə /qehremanlarimiz (F5.21d) nümunəsi ilə ÖZ
// marşrutuna köçür — köhnə URL-dən 301 (bax next.config.js). Məzmun
// STATİKDİR (CMS-dən çəkilmir) — hardcode edilmiş sabit faktlar (ünvan,
// telefon, e-poçt) + daxili keçidlər, ona görə admin redaktə qapısı yoxdur.
//
// TELEFON: bax _components/Footer.tsx SITE_PHONE — üç fərqli nömrə
// mənbəyi arasından seçilib (Zaur müəllim təsdiqləyib), bu səhifə EYNİ
// sabiti idxal edir ki, səhifə/altbilgi arasında YENİDƏN uyğunsuzluq
// yaranmasın.
//
// İŞ SAATLARI/NƏQLİYYAT QEYDİ: mənbə YOXDUR (heç bir unit-in
// `receptionHours`-u ümumi akademiya saatını təmsil etmir — cəmi bir
// bölmədə var, o da dar 2 saatlıq pəncərədir). UYDURULMUR, sadəcə
// göstərilmir — Zaur müəllim təsdiqləyəndən sonra əlavə olunacaq.
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
import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeaderStack from '../../_components/SiteHeaderStack';
import Footer, { SITE_PHONE } from '../../_components/Footer';
import { getMenu, type SiteMenu } from '@/lib/strapi';
import { tr, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

export const revalidate = 300;

/**
 * F5.30a — «Kimə müraciət etməli?» marşrutlaşdırıcı cədvəl. ƏLAQƏ
 * MƏLUMATI (telefon/e-poçt/otaq) BURADA TƏKRARLANMIR — hədəf bölmə
 * səhifəsində (`/struktur/[slug]`) onsuz da var.
 *
 * Altı sətrin YALNIZ İKİSİ real `struktur` bölməsinə uyğun gəlir
 * (yoxlanıb, bax `npm run check:units` və birbaşa API sorğusu — 28
 * bölmənin heç birində "Qəbul", "Karyera" və ya "Kommunikasiya" adı
 * YOXDUR). Qalan dördü:
 *   — Qəbul: real `struktur` YOXDUR, ən yaxın MÖVCUD məzmun `/ixtisaslar`
 *     (tam qurulmuş proqram kataloqu, qəbul məlumatları F5.26e-də var).
 *   — Karyera: real məzmun YOXDUR, menyuda ARTIQ QEYDİYYATDAN keçmiş
 *     `/hazirlanir/karyera-merkezi-haqqinda` istifadə olunur (uydurma
 *     slug DEYİL — mövcud "Karyera Mərkəzi haqqında" keçidi).
 *   — Beynəlxalq: real `struktur` YOXDUR, AMMA `sehife` qeydi VAR
 *     (`beynelxalq-elaqeler-qrupu`) — ona bağlanır.
 *   — Kommunikasiya: heç bir real VƏ YA qeydiyyatdan keçmiş hazirlanir
 *     hədəfi YOXDUR — keçidsiz, sadəcə ad göstərilir.
 * Zaur müəllim struktur bölmələri yaradanda/adı dəqiqləşdirəndə bu
 * siyahı yenilənməlidir.
 */
interface RouteRow {
  audience: string;
  target: string;
  href: string | null;
}
const ROUTING_TABLE: RouteRow[] = [
  { audience: 'Abituriyent', target: 'Qəbul', href: '/ixtisaslar' },
  { audience: 'Tələbə', target: 'Tədris proseslərinin təşkili şöbəsi', href: '/struktur/tedris-proseslerinin-teskili-sobesi' },
  { audience: 'Məzun', target: 'Karyera', href: '/hazirlanir/karyera-merkezi-haqqinda' },
  { audience: 'İşəgötürən', target: 'Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsi', href: '/struktur/elmi-tedqiqat-ve-beynelxalq-elaqeler-sobesi' },
  { audience: 'Beynəlxalq', target: 'Beynəlxalq əlaqələr qrupu', href: '/sehife/beynelxalq-elaqeler-qrupu' },
  { audience: 'Media', target: 'Kommunikasiya', href: null },
];

export function generateStaticParams() {
  return [{ locale: 'az' }, { locale: 'ru' }, { locale: 'en' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  return {
    title: tr('Əlaqə', locale),
    description: tr('Akademiya ilə əlaqə, kimə müraciət etməli və yerləşmə məlumatı.', locale),
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const menu = await getMenu(locale).catch(() => null as SiteMenu | null);

  const address = tr('AZ1000, Bakı, Zərifə Əliyeva küçəsi 18', locale);

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main>
        <section className="np-hero">
          <div className="container np-hero-inner">
            <div className="np-eyebrow">{tr('Kommunikasiya', locale)}</div>
            <h1 className="np-h1">{tr('Əlaqə', locale)}</h1>
            <p className="np-lead">
              {tr('Akademiya ilə əlaqə, kimə müraciət etməli və yerləşmə məlumatı.', locale)}
            </p>
          </div>
        </section>

        <div className="container">
          <section className="un-block" style={{ borderTop: 'none' }}>
            <h2 className="un-block-title">{tr('Ümumi əlaqə', locale)}</h2>
            <div className="prose">
              <p><i className="ti ti-map-pin" aria-hidden="true" /> {address}</p>
              <p><i className="ti ti-phone" aria-hidden="true" /> <a href={SITE_PHONE.href}>{SITE_PHONE.display}</a></p>
              <p><i className="ti ti-mail" aria-hidden="true" /> <a href="mailto:info@adda.edu.az">info@adda.edu.az</a></p>
            </div>
          </section>

          <section className="un-block">
            <h2 className="un-block-title">{tr('Kimə müraciət etməli?', locale)}</h2>
            <ul className="un-row-list">
              {ROUTING_TABLE.map((r) => (
                <li className="un-row" key={r.audience}>
                  <span className="un-row-date">{tr(r.audience, locale)}</span>
                  {r.href ? (
                    <Link href={`/${locale}${r.href}`} className="un-row-title">
                      {tr(r.target, locale)}
                    </Link>
                  ) : (
                    <span className="un-row-title" style={{ textDecoration: 'none' }}>{tr(r.target, locale)}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="un-block">
            <h2 className="un-block-title">{tr('Rəhbərliklə əlaqə', locale)}</h2>
            <p className="un-mission">
              {tr('Rəhbərliyin qəbul saatları və bölmə üzrə əlaqə məlumatı Rəhbərlik səhifəsindədir.', locale)}
            </p>
            <div className="un-links">
              <Link href={`/${locale}/rehberlik`} className="un-link-btn">
                <i className="ti ti-users" aria-hidden="true" />
                {tr('Rəhbərlik', locale)}
              </Link>
            </div>
          </section>

          <section className="un-block">
            <h2 className="un-block-title">{tr('Rəsmi müraciət', locale)}</h2>
            <p className="un-mission">
              {tr(
                'Rəsmi ərizə, təklif və ya şikayət göndərmək istəyirsinizsə, Vətəndaşların müraciəti qaydası ilə tanış olun.',
                locale,
              )}
            </p>
            <div className="un-links">
              <Link href={`/${locale}/vetendaslarin-muracieti`} className="un-link-btn">
                <i className="ti ti-file-text" aria-hidden="true" />
                {tr('Vətəndaşların müraciəti', locale)}
              </Link>
            </div>
          </section>

          <section className="un-block" style={{ paddingBottom: '48px' }}>
            <h2 className="un-block-title">{tr('Yerləşmə', locale)}</h2>
            <div className="prose">
              <p><i className="ti ti-map-pin" aria-hidden="true" /> {address}</p>
            </div>
            {/* F5.30a — nəqliyyat qeydi (hansı avtobus/metro) MƏNBƏSİZDİR,
                UYDURULMUR. Xəritə YALNIZ Zaur müəllim koordinat verəndə
                əlavə olunacaq (tapşırıqda açıq şərtləndirilib). */}
          </section>
        </div>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
