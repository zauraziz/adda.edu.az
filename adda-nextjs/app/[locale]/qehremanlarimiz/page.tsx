// F5.21b — /[locale]/qehremanlarimiz
//
// MÖVCUD NÜMUNƏ: /sabiq-rektorlar (page.tsx + [slug]/page.tsx) — kart
// şəbəkəsi + kart→detal keçidi strukturu oradan götürülüb, amma TON
// QƏSDƏN DƏYİŞİB (bax _styles/39-heroes.css başlığı): bu, Vətən uğrunda
// şəhid olan məzunların xatirə səhifəsidir, "Hazırda" kimi status nişanı
// və parlaq hover effekti YOXDUR.
//
// MƏNBƏ: Strapi `api::hero.hero` (F5.21a sxemi, F5.21c seed).
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
import '../../_styles/39-heroes.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeaderStack from '../../_components/SiteHeaderStack';
import Footer from '../../_components/Footer';
import { CarnationIcon, SilhouetteIcon } from '../../_components/HeroIcons';
import { getMenu, getHeroes, mediaUrl, HEROES_DEDICATION, type HeroPerson, type SiteMenu } from '@/lib/strapi';
import { tr, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

export const revalidate = 300;

/** ADDA-da oxuduğu ixtisas + illər — hər ikisi boşdursa heç nə göstərilmir. */
function programMeta(h: Pick<HeroPerson, 'addaProgram' | 'studyYears'>): string | null {
  const parts = [h.addaProgram, h.studyYears].filter(Boolean);
  return parts.length ? parts.join(' · ') : null;
}

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
    title: tr('Qəhrəmanlarımız', locale),
    description: tr(HEROES_DEDICATION, locale),
  };
}

export default async function HeroesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  const [menu, heroes] = await Promise.all([
    getMenu(locale).catch(() => null as SiteMenu | null),
    getHeroes(locale),
  ]);

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main>
        <section className="np-hero">
          <div className="container np-hero-inner">
            <div className="np-eyebrow">{tr('Əbədi xatirə', locale)}</div>
            <h1 className="np-h1">{tr('Qəhrəmanlarımız', locale)}</h1>
            <p className="hr-dedication">{tr(HEROES_DEDICATION, locale)}</p>
          </div>
        </section>

        <section className="hr-wrap">
          <div className="container">
            {heroes.length ? (
              <ul className="hr-grid">
                {heroes.map((h) => {
                  const photo = mediaUrl(h.photo);
                  const meta = programMeta(h);
                  return (
                    <li key={h.slug}>
                      <Link href={`/${locale}/qehremanlarimiz/${h.slug}`} className="hr-card">
                        <span className="hr-plate">
                          <CarnationIcon className="hr-carnation" />
                          {photo ? (
                            <img className="hr-photo" src={photo} alt="" loading="lazy" />
                          ) : (
                            <span className="hr-silhouette">
                              <SilhouetteIcon />
                            </span>
                          )}
                        </span>
                        <span className="hr-card-body">
                          <span className="hr-name">{h.name}</span>
                          {meta ? <span className="hr-meta">{meta}</span> : null}
                          <span className="hr-more">{tr('Tam bioqrafiya', locale)}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="np-empty">{tr('Məlumat hazırda əlçatan deyil.', locale)}</p>
            )}
          </div>
        </section>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
