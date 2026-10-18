// F5.51 — /[locale]/sertifikatlar: Akademiyanın sertifikatları.
//
// Köhnə saytın «Sertifikatlarımız» səhifəsi (adda.edu.az/az/certificates —
// next.config.js-də 301 bura) yeni saytda yox idi. Mənbə: admində
// «3. Sayt — Sertifikatlar» (sıra, ad üç dildə, skan, fayl); Strapi
// əlçatmazdırsa lib/cert-fallback.ts (skan yerində ikon).
//
// Hər sənəd öz lövbəri ilə (#…): footer zolağının kartları və menyudakı
// «Keyfiyyət siyasəti» birbaşa sənədə aparır. Skana basanda böyüdülmüş
// görünüş (CertIsland); JS-siz «Tam ölçüdə aç» faylın özünü açır.
import '../../_styles/01-base.css';
import '../../_styles/02-header.css';
import '../../_styles/03-hero.css';
import '../../_styles/04-quicknav.css';
import '../../_styles/05-legacy.css';
import '../../_styles/06-spotlight.css';
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
import '../../_styles/27-gallery.css';
import '../../_styles/45-certs.css';
import type { Metadata } from 'next';
import SiteHeaderStack from '../../_components/SiteHeaderStack';
import Footer from '../../_components/Footer';
import CertIsland from '../../_components/CertIsland';
import { getCertBlock, getMenu, type SiteMenu } from '@/lib/strapi';
import { certView } from '@/lib/cert';
import { tr, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

export const revalidate = 86400;

const LEAD = 'Akademiyanın tanınmasını, akkreditasiyasını, beynəlxalq üzvlüyünü və keyfiyyət idarəetmə sistemini təsdiq edən sənədlər.';

export function generateStaticParams() {
  return [{ locale: 'az' }, { locale: 'ru' }, { locale: 'en' }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  return {
    title: tr('Akkreditasiya və sertifikatlar', locale),
    description: tr(LEAD, locale),
  };
}

export default async function CertificatesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const [menu, certItems] = await Promise.all([getMenu(locale).catch(() => null as SiteMenu | null), getCertBlock()]);
  const items = certView(certItems, locale);
  const slides = items.map((c) => (c.large ? { src: c.large, title: c.title } : null));
  const zoom = tr('Böyüt', locale);

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main>
        <section className="np-hero">
          <div className="container np-hero-inner">
            <div className="np-eyebrow">{tr('Keyfiyyət və hesabatlılıq', locale)}</div>
            <h1 className="np-h1">{tr('Akkreditasiya və sertifikatlar', locale)}</h1>
            <p className="np-lead">{tr(LEAD, locale)}</p>
          </div>
        </section>

        <section className="np-wrap">
          <div className="container">
            {items.length ? (
              <ul className="cert-grid" id="certGrid">
                {items.map((c, i) => (
                  <li className="cert-card" id={c.anchor} key={c.anchor}>
                    {c.preview ? (
                      <button type="button" className="cert-doc" data-cert={i} aria-label={zoom + ': ' + c.title}>
                        <img src={c.preview} alt="" loading="lazy" decoding="async" />
                        <span className="cert-zoom" aria-hidden="true">
                          <i className="ti ti-zoom-in" />
                        </span>
                      </button>
                    ) : (
                      <div className="cert-doc cert-doc--empty" aria-hidden="true">
                        <i className="ti ti-certificate" />
                      </div>
                    )}
                    <div className="cert-body">
                      {c.org && c.org !== c.title ? <div className="cert-org">{c.org}</div> : null}
                      <h2 className="cert-title">{c.title}</h2>
                      {c.open ? (
                        <a className="cert-open" href={c.open} target="_blank" rel="noopener noreferrer">
                          <i className={'ti ' + (c.isPdf ? 'ti-file-type-pdf' : 'ti-external-link')} aria-hidden="true" />
                          {' ' + tr(c.isPdf ? 'PDF faylını aç' : 'Tam ölçüdə aç', locale)}
                        </a>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="np-empty">{tr('Hələlik sənəd yoxdur.', locale)}</p>
            )}
          </div>
        </section>
        {slides.some(Boolean) ? (
          <CertIsland
            items={slides}
            labels={{ close: tr('Bağla', locale), previous: tr('Əvvəlki şəkil', locale), next: tr('Növbəti şəkil', locale) }}
          />
        ) : null}
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
