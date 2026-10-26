// F5.58 — /[locale]/axtaris?q=&tip= — sayt axtarışının tam nəticələri.
//
// Başlıqdakı axtarış pəncərəsi ilk 8 nəticəni göstərir; «Bütün nəticələr (N)»
// və Enter bura gətirir. Mənbə Strapi `/api/site-search` (bütün məzmun: əməkdaş,
// səhifə, bölmə, ixtisas, sənəd, xəbər, elan, tədbir, auditoriya, sabiq rektor,
// qəhrəman, tarix, sertifikat — bax adda-strapi/src/utils/search-index.ts).
// Sorğu hər açılışda Strapi-nin yaddaş indeksinə gedir, bazaya yox.
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
import '../../_styles/48-search-page.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeaderStack from '../../_components/SiteHeaderStack';
import Footer from '../../_components/Footer';
import { getMenu, STRAPI_URL, type SiteMenu } from '@/lib/strapi';
import { tr, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';
import { SEARCH_UI, hitHref, searchPageHref, type SearchHit } from '@/lib/search-ui';

export const dynamic = 'force-dynamic';

type Params = Promise<{ locale: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] ?? '' : v ?? '');
const cleanQ = (v: string | string[] | undefined): string => one(v).trim().slice(0, 120);
const cleanType = (v: string | string[] | undefined): string => one(v).replace(/[^a-z,-]/g, '').slice(0, 60);

/** Növlərin sırası (nişanlar). */
const TYPE_ORDER = ['person', 'page', 'unit', 'faculty', 'program', 'document', 'article', 'announcement', 'event', 'facility', 'rector', 'hero', 'milestone', 'cert'];

interface Result {
  hits: SearchHit[];
  total: number;
  counts: Record<string, number>;
}

async function runSearch(q: string, locale: Locale, type: string): Promise<Result | null> {
  try {
    const url = `${STRAPI_URL}/api/site-search?q=${encodeURIComponent(q)}&locale=${locale}&limit=50${type ? `&type=${type}` : ''}`;
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) return null;
    const d = (await r.json()) as Partial<Result>;
    return { hits: d.hits ?? [], total: d.total ?? (d.hits ?? []).length, counts: d.counts ?? {} };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params, searchParams }: { params: Params; searchParams: Search }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const q = cleanQ((await searchParams).q);
  return {
    title: q ? `${tr('Axtarış', locale)}: ${q}` : tr('Axtarış', locale),
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const sp = await searchParams;
  const q = cleanQ(sp.q);
  const type = cleanType(sp.tip);
  const ui = SEARCH_UI[locale];
  const [menu, res] = await Promise.all([
    getMenu(locale).catch(() => null as SiteMenu | null),
    q.length >= 2 ? runSearch(q, locale, type) : Promise.resolve(null),
  ]);
  const all = res ? Object.values(res.counts).reduce((a, b) => a + b, 0) : 0;
  const chips = res
    ? Object.keys(res.counts).sort((a, b) => {
        const ia = TYPE_ORDER.indexOf(a);
        const ib = TYPE_ORDER.indexOf(b);
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
      })
    : [];

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main>
        <section className="np-hero">
          <div className="container np-hero-inner">
            <div className="np-eyebrow">{tr('Axtarış', locale)}</div>
            <h1 className="np-h1">{q ? `«${q}»` : tr('Axtarış nəticələri', locale)}</h1>
            {res && q ? (
              <p className="np-lead">
                {all} {tr('nəticə', locale)}
              </p>
            ) : null}
          </div>
        </section>

        <section className="np-wrap">
          <div className="container srp">
            <form className="srp-form" action={`/${locale}/axtaris`} method="get" role="search">
              <input
                className="srp-input"
                type="search"
                name="q"
                defaultValue={q}
                placeholder={ui.ph}
                aria-label={tr('Axtarış', locale)}
                minLength={2}
                maxLength={120}
              />
              <button className="srp-btn" type="submit">
                <i className="ti ti-search" aria-hidden="true" />
                <span>{tr('Axtar', locale)}</span>
              </button>
            </form>

            {chips.length > 1 ? (
              <nav className="srp-chips" aria-label={tr('Axtarış', locale)}>
                <Link href={searchPageHref(locale, q)} className="srp-chip" aria-current={!type ? 'page' : undefined}>
                  {tr('Hamısı', locale)} <span>{all}</span>
                </Link>
                {chips.map((t) => (
                  <Link key={t} href={searchPageHref(locale, q, t)} className="srp-chip" aria-current={type === t ? 'page' : undefined}>
                    {ui.types[t] || t} <span>{res?.counts[t]}</span>
                  </Link>
                ))}
              </nav>
            ) : null}

            {q.length < 2 ? (
              <p className="srp-empty">{tr('Axtarmaq üçün ən azı 2 hərf yazın.', locale)}</p>
            ) : !res ? (
              <p className="srp-empty">{ui.error}</p>
            ) : !res.hits.length ? (
              <p className="srp-empty">{ui.empty}</p>
            ) : (
              <ol className="srp-list">
                {res.hits.map((h, i) => {
                  const link = hitHref(locale, h);
                  return (
                    <li key={`${h.contentType}-${h.documentId}-${i}`} className="srp-item">
                      <span className="srp-type">{ui.types[h.contentType || ''] || ''}</span>
                      <div className="srp-main">
                        {link ? (
                          <a
                            className="srp-title"
                            href={link.href}
                            {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                          >
                            {h.title}
                          </a>
                        ) : (
                          <span className="srp-title">{h.title}</span>
                        )}
                        {h.lang && h.lang !== locale ? (
                          <span className="srp-lang" title={tr('Azərbaycan dilində', locale)}>
                            {ui.azOnly}
                          </span>
                        ) : null}
                        {h.excerpt ? <p className="srp-excerpt">{h.excerpt}</p> : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            {res && res.total > res.hits.length ? (
              <p className="srp-more">{tr('İlk 50 nəticə göstərilir. Axtarışı dəqiqləşdirin.', locale)}</p>
            ) : null}
          </div>
        </section>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
