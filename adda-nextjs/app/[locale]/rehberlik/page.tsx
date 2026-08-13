// F3.11 — /[locale]/rehberlik
//
// Akademiyanın rəhbər heyəti, iyerarxiya üzrə.
//
// MƏNBƏ: `api::unit.unit` → `head` əlaqəsi. Ayrıca «rəhbərlik» siyahısı YOXDUR
// və olmamalıdır: rəhbər kimdirsə, o, bölmənin `head`-idir. İki yerdə saxlansa
// biri köhnələr.
//
// İYERARXİYA `parent.slug` üzərindən BURADA qurulur — Strapi iç-içə populate-i
// dərinlik üzrə məhdudlaşdırır, 5 səviyyəni bir sorğu ilə gətirmək olmur.
//
// Qruplar ad üzrə deyil, AĞACIN FORMASI üzrə seçilir:
//   rektor                → Rektor
//   rektorun uşaqları     → prorektorlar və rektor yanında vəzifələr
//   daha dərin            → struktur bölmə rəhbərləri
// Bu qərar qəsdəndir: bölmə adı dəyişəndə səhifə sınmır. Qrup daxilindəki
// sıra `sortOrder` ilə admin panelindən idarə olunur.
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
import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeaderStack from '../../_components/SiteHeaderStack';
import Footer from '../../_components/Footer';
import {
  getMenu,
  getLeadership,
  degreeLabel,
  mediaUrl,
  type SiteMenu,
  type LeadershipUnit,
} from '@/lib/strapi';
import { tr, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

export const revalidate = 300;

const ROOT_SLUG = 'rektor';
const COUNCIL_SLUG = 'elmi-sura';

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
    title: tr('Rəhbərlik', locale),
    description: tr('Akademiyanın rəhbər heyəti və struktur bölmə rəhbərləri.', locale),
  };
}

/** Ad göstərilməsi: `displayName` («Ad Ata Soyad») varsa o, yoxsa `name`. */
function personName(u: LeadershipUnit): string {
  return u.head?.displayName?.trim() || u.head?.name?.trim() || '';
}

/** Fotosuz kartlar üçün monoqram. */
function initials(full: string): string {
  const parts = full.split(/\s+/).filter(Boolean);
  if (!parts.length) return '—';
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

function LeaderCard({
  unit,
  locale,
  featured = false,
}: {
  unit: LeadershipUnit;
  locale: Locale;
  featured?: boolean;
}) {
  const head = unit.head;
  const name = personName(unit);
  const photo = head ? mediaUrl(head.photo) : null;
  const degree = head ? degreeLabel(head.academicDegree) : null;
  const place = [head?.building, head?.office].filter(Boolean).join(', ');

  // Rəhbəri təyin olunmamış bölmə GİZLƏDİLMİR. Vakantlıq məlumatdır:
  // rektor vəzifəsi hazırda boşdur və bunu göstərmək düzgündür.
  if (!head) {
    return (
      <li className={featured ? 'ld-card ld-card--lead ld-card--vacant' : 'ld-card ld-card--vacant'}>
        <div className="ld-plate" aria-hidden="true">
          <span className="ld-mono">—</span>
        </div>
        <div className="ld-body">
          <div className="ld-unit">{unit.name}</div>
          <div className="ld-vacant">{tr('Vəzifə hazırda vakantdır', locale)}</div>
        </div>
      </li>
    );
  }

  return (
    <li className={featured ? 'ld-card ld-card--lead' : 'ld-card'}>
      <Link href={`/${locale}/emekdas/${head.slug}`} className="ld-plate">
        {photo ? (
          <img className="ld-photo" src={photo} alt="" loading="lazy" />
        ) : (
          <span className="ld-mono" aria-hidden="true">
            {initials(name)}
          </span>
        )}
      </Link>
      <div className="ld-body">
        <div className="ld-unit">{unit.name}</div>
        <Link href={`/${locale}/emekdas/${head.slug}`} className="ld-name">
          {name}
        </Link>
        {head.position ? <div className="ld-position">{head.position}</div> : null}
        {degree || head.academicTitle ? (
          <div className="ld-degree">{[degree, head.academicTitle].filter(Boolean).join(' · ')}</div>
        ) : null}
        <dl className="ld-contact">
          {head.email ? (
            <>
              <dt>{tr('E-poçt', locale)}</dt>
              <dd>
                <a href={`mailto:${head.email}`}>{head.email}</a>
              </dd>
            </>
          ) : null}
          {head.phone ? (
            <>
              <dt>{tr('Telefon', locale)}</dt>
              <dd>
                <a href={`tel:${head.phone.replace(/[^\d+]/g, '')}`}>{head.phone}</a>
              </dd>
            </>
          ) : null}
          {place ? (
            <>
              <dt>{tr('Yerləşmə', locale)}</dt>
              <dd>{place}</dd>
            </>
          ) : null}
        </dl>
        <Link href={`/${locale}/struktur/${unit.slug}`} className="ld-more">
          {tr('Bölmə haqqında', locale)}
          <i className="ti ti-arrow-right" aria-hidden="true" />
        </Link>
      </div>
    </li>
  );
}

function Group({
  title,
  units,
  locale,
}: {
  title: string;
  units: LeadershipUnit[];
  locale: Locale;
}) {
  if (!units.length) return null;
  return (
    <section className="ld-group">
      <div className="container">
        <h2 className="ld-h2">{title}</h2>
        <ul className="ld-grid">
          {units.map((u) => (
            <LeaderCard key={u.slug} unit={u} locale={locale} />
          ))}
        </ul>
      </div>
    </section>
  );
}

export default async function LeadershipPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  const [menu, units] = await Promise.all([
    getMenu(locale).catch(() => null as SiteMenu | null),
    getLeadership(locale).catch(() => [] as LeadershipUnit[]),
  ]);

  const bySlug = new Map(units.map((u) => [u.slug, u]));

  /** Kökə qədər neçə addım var. Dövr olsa 20-də dayanır (sonsuz döngü olmasın). */
  const depthOf = (u: LeadershipUnit): number => {
    let d = 0;
    let cur: LeadershipUnit | undefined = u;
    while (cur?.parent?.slug && d < 20) {
      cur = bySlug.get(cur.parent.slug);
      d++;
    }
    return d;
  };

  const rector = bySlug.get(ROOT_SLUG) ?? null;
  const council = bySlug.get(COUNCIL_SLUG) ?? null;

  const directReports = units.filter((u) => u.parent?.slug === ROOT_SLUG);
  const deeper = units.filter(
    (u) =>
      u.slug !== ROOT_SLUG &&
      u.slug !== COUNCIL_SLUG &&
      u.parent?.slug !== ROOT_SLUG &&
      u.head, // dərin səviyyədə yalnız rəhbəri olanlar göstərilir
  );

  const sorted = (list: LeadershipUnit[]) =>
    [...list].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || depthOf(a) - depthOf(b));

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main>
        <section className="np-hero">
          <div className="container np-hero-inner">
            <div className="np-eyebrow">{tr('İdarəetmə', locale)}</div>
            <h1 className="np-h1">{tr('Rəhbərlik', locale)}</h1>
            <p className="np-lead">
              {tr('Akademiyanın rəhbər heyəti və struktur bölmə rəhbərləri.', locale)}
            </p>
          </div>
        </section>

        {rector ? (
          <section className="ld-group ld-group--lead">
            <div className="container">
              <h2 className="ld-h2">{tr('Rektor', locale)}</h2>
              <ul className="ld-grid ld-grid--single">
                <LeaderCard unit={rector} locale={locale} featured />
              </ul>
            </div>
          </section>
        ) : null}

        <Group
          title={tr('Prorektorlar və rektor yanında vəzifələr', locale)}
          units={sorted(directReports)}
          locale={locale}
        />

        <Group
          title={tr('Struktur bölmə rəhbərləri', locale)}
          units={sorted(deeper)}
          locale={locale}
        />

        {council ? (
          <Group title={tr('Elmi Şura', locale)} units={[council]} locale={locale} />
        ) : null}

        {!units.length ? (
          <section className="ld-group">
            <div className="container">
              <p className="ld-empty">{tr('Məlumat hazırda əlçatan deyil.', locale)}</p>
            </div>
          </section>
        ) : null}
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
