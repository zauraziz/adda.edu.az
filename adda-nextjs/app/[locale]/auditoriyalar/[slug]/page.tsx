// F5.35c — /[locale]/auditoriyalar/[slug]: bir obyektin səhifəsi.
// BOŞ SAHƏ GÖSTƏRİLMİR — bölmə, başlığı və yan panel sətri sahə boşdursa
// render olunmur (CLAUDE.md, «Boş məzmun»). Bir səhifə, bir en: yalnız
// .container (bax .un-layout).
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
import '../../../_styles/36-unit.css';
import '../../../_styles/41-facility.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeaderStack from '../../../_components/SiteHeaderStack';
import Footer from '../../../_components/Footer';
import GalleryIsland, { type GalleryImage } from '../../../_components/GalleryIsland';
import { DocList } from '../../../_components/DocList';
import {
  getMenu,
  getFacilityBySlug,
  getFacilitySlugs,
  mediaUrl,
  type SiteMenu,
  type Facility,
  type FacilityCondition,
  type UnitDocumentItem,
} from '@/lib/strapi';
import { tr, isLocale, DEFAULT_LOCALE, LOCALES, type Locale } from '@/lib/i18n';

export const revalidate = 300;

const CONDITION_LABEL: Record<FacilityCondition, string> = {
  islek: 'İşlək',
  qismen: 'Qismən işlək',
  yararsiz: 'İstifadəyə yararsız',
};

export async function generateStaticParams() {
  const out: Array<{ locale: string; slug: string }> = [];
  for (const locale of LOCALES) {
    const slugs = await getFacilitySlugs(locale).catch(() => [] as string[]);
    for (const slug of slugs) out.push({ locale, slug });
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
  const f = await getFacilityBySlug(slug, locale).catch(() => null as Facility | null);
  return { title: f?.name ?? tr('Auditoriya və laboratoriyalar', locale) };
}

export default async function FacilityPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  const [menu, f] = await Promise.all([
    getMenu(locale).catch(() => null as SiteMenu | null),
    getFacilityBySlug(slug, locale).catch(() => null as Facility | null),
  ]);
  if (!f) notFound();

  // Tək obyekt üçün təkil («Simulyator»), kataloq qruplarında isə cəm işlənir.
  const typeRaw = tr(f.facilityType, locale);
  const typeLabel = typeRaw.charAt(0).toLocaleUpperCase(locale) + typeRaw.slice(1);
  const paragraphs = (f.description ?? '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const inventory = (f.inventory ?? []).filter((r) => r.name);
  const hasQty = inventory.some((r) => r.quantity != null);
  const hasNote = inventory.some((r) => r.note);
  const person = f.responsiblePerson;
  const docs = (f.documents ?? []).filter((d): d is UnitDocumentItem => Boolean(d && mediaUrl(d.file)));
  const gallery: GalleryImage[] = (f.photos ?? [])
    .map((m) => ({ url: mediaUrl(m) ?? '', alt: m.alternativeText || f.name, width: m.width, height: m.height }))
    .filter((m) => m.url);
  const galleryLabels: Record<string, string> = {
    gallery: tr('Foto qalereya', locale),
    openImage: tr('Şəkli aç', locale),
    previous: tr('Əvvəlki şəkil', locale),
    next: tr('Növbəti şəkil', locale),
    close: tr('Bağla', locale),
  };
  const unitName = f.unit?.name ? tr(f.unit.name, locale) : null;

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main>
        <section className="np-hero">
          <div className="container np-hero-inner">
            <div className="np-eyebrow">{tr('Akademiya', locale)}</div>
            <h1 className="np-h1">{f.name}</h1>
            <nav className="un-crumbs" aria-label={tr('Auditoriya və laboratoriyalar', locale)}>
              <Link href={`/${locale}/auditoriyalar`}>{tr('Auditoriya və laboratoriyalar', locale)}</Link>
              <span className="un-crumb-sep">/</span> <span className="un-crumb-cur">{f.name}</span>
            </nav>
            <div className="fc-badges">
              <span className="fc-badge">{typeLabel}</span>
              {f.roomNumber ? (
                <span className="fc-badge fc-badge--room">
                  {tr('Otaq', locale)} {f.roomNumber}
                </span>
              ) : null}
            </div>
          </div>
        </section>

        <section className="np-wrap">
          <div className="container">
            <div className="un-layout">
              <div className="un-main">
                {paragraphs.length ? (
                  <section className="un-block">
                    <h2 className="un-block-title">{tr('Haqqında', locale)}</h2>
                    {paragraphs.map((p, i) => (
                      <p key={i} className="un-fac-desc">
                        {p}
                      </p>
                    ))}
                  </section>
                ) : null}

                {inventory.length ? (
                  <section className="un-block">
                    <h2 className="un-block-title">{tr('İnventar', locale)}</h2>
                    <table className="un-fac-table">
                      <thead>
                        <tr>
                          <th>{tr('Ad', locale)}</th>
                          {hasQty ? <th>{tr('Say', locale)}</th> : null}
                          {hasNote ? <th>{tr('Qeyd', locale)}</th> : null}
                        </tr>
                      </thead>
                      <tbody>
                        {inventory.map((r) => (
                          <tr key={r.id}>
                            <td>{r.name}</td>
                            {hasQty ? <td>{r.quantity ?? ''}</td> : null}
                            {hasNote ? <td>{r.note ?? ''}</td> : null}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </section>
                ) : null}

                {f.software ? (
                  <section className="un-block">
                    <h2 className="un-block-title">{tr('Proqram təminatı', locale)}</h2>
                    <p className="un-fac-desc">{f.software}</p>
                  </section>
                ) : null}

                {f.capacity != null ? (
                  <section className="un-block">
                    <h2 className="un-block-title">{tr('Tutum', locale)}</h2>
                    <p className="un-fac-desc">{f.capacity}</p>
                  </section>
                ) : null}

                {f.condition ? (
                  <section className="un-block">
                    <h2 className="un-block-title">{tr('Vəziyyət', locale)}</h2>
                    <p className="un-fac-desc">{tr(CONDITION_LABEL[f.condition], locale)}</p>
                  </section>
                ) : null}

                {person ? (
                  <section className="un-block">
                    <h2 className="un-block-title">{tr('Məsul şəxs', locale)}</h2>
                    <p className="un-fac-desc">
                      <Link href={`/${locale}/emekdas/${person.slug}`}>{person.displayName || person.name}</Link>
                    </p>
                  </section>
                ) : null}

                {f.accreditation ? (
                  <section className="un-block">
                    <h2 className="un-block-title">{tr('Sertifikat və akkreditasiya', locale)}</h2>
                    <p className="un-fac-desc">{f.accreditation}</p>
                  </section>
                ) : null}

                {docs.length ? (
                  <section className="un-block">
                    <h2 className="un-block-title">{tr('Əlavə sənədlər', locale)}</h2>
                    <DocList docs={docs} locale={locale} />
                  </section>
                ) : null}

                {gallery.length ? (
                  <section className="un-block">
                    <h2 className="un-block-title">{tr('Fotolar', locale)}</h2>
                    <GalleryIsland images={gallery} labels={galleryLabels} />
                  </section>
                ) : null}
              </div>

              <aside className="un-side">
                {f.unit && unitName ? (
                  <div>
                    <div className="un-sub-title">{tr('Kafedra', locale)}</div>
                    <Link href={`/${locale}/struktur/${f.unit.slug}`} className="un-link-btn">
                      <i className="ti ti-sitemap" aria-hidden="true" />
                      {unitName}
                    </Link>
                  </div>
                ) : null}
                {f.relatedProgram ? (
                  <div>
                    <div className="un-sub-title">{tr('Bağlı olduğu ixtisas', locale)}</div>
                    <p className="un-side-text">{f.relatedProgram}</p>
                  </div>
                ) : null}
                <div>
                  <div className="un-sub-title">{tr('Tip', locale)}</div>
                  <p className="un-side-text">{typeLabel}</p>
                </div>
                {f.roomNumber ? (
                  <div>
                    <div className="un-sub-title">{tr('Otaq', locale)}</div>
                    <p className="un-side-text">{f.roomNumber}</p>
                  </div>
                ) : null}
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
