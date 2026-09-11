// F5.21b — /[locale]/qehremanlarimiz/[slug]
//
// MÖVCUD NÜMUNƏ: /sabiq-rektorlar/[slug] — yan panel (foto lövhəsi +
// faktlar) + əsas bioqrafiya sütunu strukturu oradan götürülüb, TON
// QƏSDƏN DƏYİŞİB (bax _styles/39-heroes.css). Əvvəlki/sonrakı naviqasiyası
// BURAYA KÖÇÜRÜLMƏYİB — qəhrəmanlar arasında rektorlardakı kimi xronoloji
// "varislik" mənası yoxdur, uydurma sıra naviqasiyası əlavə olunmayıb.
//
// Düzəliş təklifi vidceti (CorrectionIsland) ƏLAVƏ OLUNMUR — bu səhifə
// üçün münasib deyil (tapşırıqda açıq qeyd olunub).
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
import '../../../_styles/39-heroes.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { marked } from 'marked';
import SiteHeaderStack from '../../../_components/SiteHeaderStack';
import Footer from '../../../_components/Footer';
import { SilhouetteIcon } from '../../../_components/HeroIcons';
import { getMenu, getHeroes, getHeroBySlug, mediaUrl, type SiteMenu } from '@/lib/strapi';
import { fmtDate } from '@/lib/format';
import { tr, LOCALES, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

export const revalidate = 300;

/** JSON-LD/metadata description üçün — ilk abzas, markdown işarələri çıxarılıb. */
function plainExcerpt(markdown: string): string {
  return markdown
    .split(/\r?\n\s*\r?\n/)[0]
    .replace(/[#*_`>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function generateStaticParams() {
  const out: Array<{ locale: string; slug: string }> = [];
  for (const locale of LOCALES) {
    for (const h of await getHeroes(locale)) out.push({ locale, slug: h.slug });
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
  const h = await getHeroBySlug(slug, locale);
  if (!h) return { title: tr('Qəhrəmanlarımız', locale) };
  return {
    title: `${h.name} — ${tr('Qəhrəmanlarımız', locale)}`,
    description: h.biography ? plainExcerpt(h.biography) : undefined,
  };
}

export default async function HeroDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  const [h, menu] = await Promise.all([
    getHeroBySlug(slug, locale),
    getMenu(locale).catch(() => null as SiteMenu | null),
  ]);
  if (!h) notFound();

  const listHref = `/${locale}/qehremanlarimiz`;
  const photo = mediaUrl(h.photo);
  const bioHtml = h.biography ? await marked.parse(h.biography) : '';
  const programMeta = [h.addaProgram, h.studyYears].filter(Boolean).join(' · ');

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main>
        <section className="np-hero">
          <div className="container np-hero-inner">
            <Link href={listHref} className="hr-back">
              <i className="ti ti-arrow-left" aria-hidden="true" />
              {' ' + tr('Qəhrəmanlarımız', locale)}
            </Link>
            <h1 className="np-h1">{h.name}</h1>
          </div>
        </section>

        <section className="hr-wrap">
          <div className="container hr-detail">
            <aside className="hr-side">
              <div className="hr-plate hr-plate--lg">
                {photo ? (
                  <img className="hr-photo" src={photo} alt={h.name} />
                ) : (
                  <span className="hr-silhouette">
                    <SilhouetteIcon />
                  </span>
                )}
              </div>

              <dl className="hr-facts">
                {h.birthDate ? (
                  <>
                    <dt className="hr-fact-k">{tr('Doğum tarixi', locale)}</dt>
                    <dd className="hr-fact-v">{fmtDate(h.birthDate, locale)}</dd>
                  </>
                ) : null}
                {h.birthPlace ? (
                  <>
                    <dt className="hr-fact-k">{tr('Doğum yeri', locale)}</dt>
                    <dd className="hr-fact-v">{h.birthPlace}</dd>
                  </>
                ) : null}
                {programMeta ? (
                  <>
                    <dt className="hr-fact-k">{tr('ADDA-da ixtisas', locale)}</dt>
                    <dd className="hr-fact-v">{programMeta}</dd>
                  </>
                ) : null}
                {h.martyrdomDate ? (
                  <>
                    <dt className="hr-fact-k">{tr('Şəhid olduğu tarix', locale)}</dt>
                    <dd className="hr-fact-v">{fmtDate(h.martyrdomDate, locale)}</dd>
                  </>
                ) : null}
                {h.martyrdomPlace ? (
                  <>
                    <dt className="hr-fact-k">{tr('Şəhid olduğu yer', locale)}</dt>
                    <dd className="hr-fact-v">{h.martyrdomPlace}</dd>
                  </>
                ) : null}
                {h.honors.length ? (
                  <>
                    <dt className="hr-fact-k">{tr('Təltifləri', locale)}</dt>
                    <dd className="hr-fact-v">
                      <ul className="hr-honors">
                        {h.honors.map((honor, i) => (
                          <li key={i} className="hr-honor-item">
                            {honor.label}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </>
                ) : null}
              </dl>
            </aside>

            <div className="hr-main">
              <h2 className="hr-sec-title">{tr('Bioqrafiya', locale)}</h2>
              {bioHtml ? (
                <div className="hr-bio" dangerouslySetInnerHTML={{ __html: bioHtml }} />
              ) : (
                <p className="hr-note">{tr('Bu səhifənin məzmunu hazırlanır.', locale)}</p>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
