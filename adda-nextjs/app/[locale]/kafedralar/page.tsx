// F5.11 — /[locale]/kafedralar
//
// MÜHÜM PRİNSİP: bu, siyahı səhifəsidir. /kafedralar/[slug] DETAL SƏHİFƏSİ
// YOXDUR VƏ YARADILMAYACAQ — hər kart birbaşa /struktur/[slug]-ə keçir,
// kafedranın YEGANƏ detal səhifəsi odur. Eyni bölmə üçün iki ayrı detal
// səhifəsi (department/unit, /fakulteler/[slug] vs /struktur/[slug]) bu
// layihədə dəfələrlə problem yaradıb (bax CLAUDE.md) — təkrarlanmır.
//
// DATA MƏNBƏYİ: getLeadership(locale) (F3.11) — YENİ sorğu yazılmır, bu
// funksiya artıq head/foto/parent.slug daşıyır. Fakültə adı əlavə sorğu
// olmadan eyni siyahıdan (`parent.slug` → siyahıdakı həmin slug-lı qeydin
// `name`-i) tapılır.
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
import '../../_styles/35-leadership.css';
import '../../_styles/38-kafedra.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeaderStack from '../../_components/SiteHeaderStack';
import Footer from '../../_components/Footer';
import { getMenu, getLeadership, type SiteMenu, type LeadershipUnit } from '@/lib/strapi';
import { unitType } from '@/lib/unit-type';
import { tr, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

export const revalidate = 300;

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
    title: tr('Kafedralar', locale),
    description: tr('Akademiyanın kafedraları və rəhbərləri.', locale),
  };
}

/** Ad göstərilməsi: `displayName` («Ad Ata Soyad») varsa o, yoxsa `name`. */
function personName(u: LeadershipUnit): string {
  return u.head?.displayName?.trim() || u.head?.name?.trim() || '';
}

function KafedraCard({ unit, locale }: { unit: LeadershipUnit; locale: Locale }) {
  const head = unit.head;
  const headName = head ? personName(unit) : '';

  return (
    // F5.12 — foto/monoqram sahəsi (`.ld-plate`) və fakültə adı sətri
    // (`.ld-unit`) BURADAN silinib; qruplaşdırma (FacultyGroup başlığı)
    // TOXUNULMAYIB. `.ld-card`/`.ld-plate` rehberlik səhifəsi ilə ORTAQ
    // sinifdir (35-leadership.css) — ona görə bu kart `.kf-card` (səhifəyə
    // xas, 38-kafedra.css) işlədir, `.ld-card` YOX.
    <li className="kf-card">
      <div className="ld-body">
        <Link href={`/${locale}/struktur/${unit.slug}`} className="ld-name kf-card-hit">
          {unit.name}
        </Link>
        {head ? (
          <div className="ld-position">
            {headName}
            {head.position ? ` — ${head.position}` : ''}
          </div>
        ) : null}
        <Link href={`/${locale}/struktur/${unit.slug}`} className="ld-more">
          {tr('Kafedra haqqında', locale)}
          <i className="ti ti-arrow-right" aria-hidden="true" />
        </Link>
      </div>
    </li>
  );
}

function FacultyGroup({ title, units, locale }: { title: string; units: LeadershipUnit[]; locale: Locale }) {
  if (!units.length) return null;
  return (
    <section className="ld-group">
      <div className="container">
        <h2 className="ld-h2">{title}</h2>
        <ul className="ld-grid">
          {units.map((u) => (
            <KafedraCard key={u.slug} unit={u} locale={locale} />
          ))}
        </ul>
      </div>
    </section>
  );
}

export default async function KafedraListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  const [menu, units] = await Promise.all([
    getMenu(locale).catch(() => null as SiteMenu | null),
    getLeadership(locale).catch(() => [] as LeadershipUnit[]),
  ]);

  const bySlug = new Map(units.map((u) => [u.slug, u]));
  const kafedras = units.filter((u) => unitType(u.name)?.nom === 'Kafedra');

  const groups = new Map<string, LeadershipUnit[]>();
  for (const k of kafedras) {
    const parentSlug = k.parent?.slug ?? '';
    const list = groups.get(parentSlug) ?? [];
    list.push(k);
    groups.set(parentSlug, list);
  }

  const orderedGroups = [...groups.entries()]
    .map(([parentSlug, list]) => ({
      parentSlug,
      facultyName: bySlug.get(parentSlug)?.name ?? null,
      units: [...list].sort((a, b) => a.name.localeCompare(b.name, 'az')),
    }))
    .sort((a, b) =>
      (a.facultyName ?? '').localeCompare(b.facultyName ?? '', 'az'),
    );

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main>
        <section className="np-hero">
          <div className="container np-hero-inner">
            <div className="np-eyebrow">{tr('Təhsil', locale)}</div>
            <h1 className="np-h1">{tr('Kafedralar', locale)}</h1>
            <p className="np-lead">{tr('Akademiyanın kafedraları və rəhbərləri.', locale)}</p>
          </div>
        </section>

        {orderedGroups.length ? (
          orderedGroups.map((g) => (
            <FacultyGroup
              key={g.parentSlug}
              title={g.facultyName ?? tr('Digər kafedralar', locale)}
              units={g.units}
              locale={locale}
            />
          ))
        ) : (
          <section className="ld-group">
            <div className="container">
              <p className="ld-empty">{tr('Məlumat hazırda əlçatan deyil.', locale)}</p>
            </div>
          </section>
        )}
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
