// K27b — /[locale]/sabiq-rektorlar/[slug]
//
// Bir rektorun səhifəsi: portret/monoqram lövhəsi + faktlar (yapışqan yan
// sütun) və tam bioqrafiya. Altda əvvəlki/sonrakı keçidi — varislik sırası
// naviqasiyaya çevrilir.
//
// SİYAHI ÇƏKİLİR, TƏK QEYD YOX: qonşular onsuz da lazımdır və dörd qeyd üçün
// ikinci sorğu mənasızdır.
//
// `dynamicParams` AÇIQDIR: admin panelində yeni rektor əlavə olunanda səhifə
// yenidən build etmədən görünməlidir. Slug siyahıda yoxdursa 404.
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
import '../../../_styles/32-rectors.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { marked } from 'marked';
import SiteHeaderStack from '../../../_components/SiteHeaderStack';
import Footer from '../../../_components/Footer';
import { getMenu, getRectors, mediaUrl, type Rector, type SiteMenu } from '@/lib/strapi';
import { fmtDate } from '@/lib/format';
import { RECTORS_FALLBACK, monogram } from '@/lib/rectors';
import { tr, LOCALES, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

export const revalidate = 300;

async function listFor(locale: Locale): Promise<Rector[]> {
  const fetched = await getRectors(locale);
  return fetched.length ? fetched : RECTORS_FALLBACK[locale];
}

export async function generateStaticParams() {
  const out: Array<{ locale: string; slug: string }> = [];
  for (const locale of LOCALES) {
    for (const r of await listFor(locale)) out.push({ locale, slug: r.slug });
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
  const r = (await listFor(locale)).find((x) => x.slug === slug);
  if (!r) return { title: tr('Sabiq rektorlarımız', locale) };
  return {
    title: `${r.name} — ${tr('Sabiq rektorlarımız', locale)}`,
    description: r.summary ?? undefined,
  };
}

export default async function RectorDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  const list = await listFor(locale);
  const idx = list.findIndex((x) => x.slug === slug);
  if (idx < 0) notFound();
  const r = list[idx];
  const prev = idx > 0 ? list[idx - 1] : null;
  const next = idx < list.length - 1 ? list[idx + 1] : null;

  const menu = await getMenu(locale).catch(() => null as SiteMenu | null);
  const listHref = `/${locale}/sabiq-rektorlar`;
  const photo = mediaUrl(r.photo);
  const bioHtml = r.bio ? await marked.parse(r.bio) : '';

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main>
        <section className="np-hero">
          <div className="container np-hero-inner">
            <Link href={listHref} className="rk-back">
              <i className="ti ti-arrow-left" aria-hidden="true" />
              {' ' + tr('Sabiq rektorlarımız', locale)}
            </Link>
            <h1 className="np-h1">{r.name}</h1>
            {r.summary ? <p className="np-lead">{r.summary}</p> : null}
          </div>
        </section>

        <section className="rk-wrap">
          <div className="container rk-detail">
            <aside className="rk-side">
              <div className="rk-plate rk-plate--lg">
                {photo ? (
                  <img className="rk-photo" src={photo} alt={r.name} />
                ) : (
                  <span className="rk-monogram" aria-hidden="true">
                    {monogram(r.name)}
                  </span>
                )}
                <span className="rk-plate-term">
                  {r.termFrom}&ndash;{r.termTo ?? ''}
                </span>
              </div>

              <dl className="rk-facts">
                <dt className="rk-fact-k">{tr('Rektorluq dövrü', locale)}</dt>
                <dd className="rk-fact-v">
                  {r.termFrom}&ndash;{r.termTo ?? ''}
                </dd>
                {r.degree ? (
                  <>
                    <dt className="rk-fact-k">{tr('Elmi dərəcə', locale)}</dt>
                    <dd className="rk-fact-v">{r.degree}</dd>
                  </>
                ) : null}
                {r.died ? (
                  <>
                    <dt className="rk-fact-k">{tr('Vəfat edib', locale)}</dt>
                    <dd className="rk-fact-v">{fmtDate(r.died, locale)}</dd>
                  </>
                ) : null}
              </dl>
            </aside>

            <div className="rk-main">
              <h2 className="rk-sec-title">{tr('Bioqrafiya', locale)}</h2>
              {bioHtml ? (
                <div className="rk-bio" dangerouslySetInnerHTML={{ __html: bioHtml }} />
              ) : (
                <p className="rk-note">{tr('Bu səhifənin məzmunu hazırlanır.', locale)}</p>
              )}

              <nav className="rk-nav" aria-label={tr('Sabiq rektorlarımız', locale)}>
                {prev ? (
                  <Link href={`/${locale}/sabiq-rektorlar/${prev.slug}`} className="rk-nav-item">
                    <span className="rk-nav-dir">
                      <i className="ti ti-arrow-left" aria-hidden="true" />
                      {' ' + tr('Əvvəlki', locale)}
                    </span>
                    <span className="rk-nav-name">{prev.name}</span>
                  </Link>
                ) : (
                  <span />
                )}
                {next ? (
                  <Link href={`/${locale}/sabiq-rektorlar/${next.slug}`} className="rk-nav-item rk-nav-item--next">
                    <span className="rk-nav-dir">
                      {tr('Sonrakı', locale) + ' '}
                      <i className="ti ti-arrow-right" aria-hidden="true" />
                    </span>
                    <span className="rk-nav-name">{next.name}</span>
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            </div>
          </div>
        </section>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
