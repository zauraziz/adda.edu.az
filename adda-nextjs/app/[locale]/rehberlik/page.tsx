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
  STRAPI_URL,
  type SiteMenu,
  type LeadershipUnit,
} from '@/lib/strapi';
import { tr, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

export const revalidate = 300;

const ROOT_SLUG = 'rektor';
const COUNCIL_SLUG = 'elmi-sura';

/**
 * «Rəhbərlik» bloku: prorektorlar + elmi katib + rektorun müşaviri.
 *
 * Bu siyahı QƏSDƏN açıqdır, ağacdan çıxarılmır. Rektorun birbaşa tabeliyində
 * həm bu vəzifələr, həm də mühasibatlıq, personal, təsərrüfat kimi şöbələr
 * dayanır — ağacın forması onları ayırmır. Yeni prorektor əlavə olunanda
 * slug-da `prorektor` sözü olduğu üçün avtomatik düşəcək.
 */
const LEADERSHIP_EXTRA = ['elmi-katib', 'rektorun-musaviri'];

/**
 * Admin redaktə keçidləri.
 *
 * QAPALI olduğu üçün ictimai saytda görünmür — `NEXT_PUBLIC_ADMIN_EDIT_LINKS=true`
 * yalnız demo mühitində qoyulur. Bu, qəsdən belədir: CMS ünvanını hər ziyarətçiyə
 * göstərmək nə gərəklidir, nə də səliqəlidir.
 *
 * `NEXT_PUBLIC_` prefiksi məcburidir — onsuz dəyər brauzer paketinə düşmür.
 */
const SHOW_ADMIN_LINKS = process.env.NEXT_PUBLIC_ADMIN_EDIT_LINKS === 'true';

/** Strapi 5 content-manager URL-i. Dil parametri olmadan `en` açılır. */
function adminUrl(uid: string, documentId: string, locale: Locale): string {
  return (
    `${STRAPI_URL}/admin/content-manager/collection-types/${uid}/${documentId}` +
    `?plugins[i18n][locale]=${locale}`
  );
}

/** Rəhbərlik səhifəsində GÖSTƏRİLMİR (öz bölmə səhifələri qalır). */
const HIDDEN = ['rektorun-komekcisi', 'referent'];

const azLower = (s: string) =>
  String(s ?? '').replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();

/** Tədris bölməsi: dekan və kafedra müdiri. Müavinlər rəhbər sayılmır. */
function isAcademicPost(position: string | null | undefined): boolean {
  const p = azLower(position ?? '');
  if (!p || /müavin/.test(p)) return false;
  return /dekan|kafedra müdiri/.test(p);
}

/**
 * Əlifba sırası ÜÇÜN `name` («Soyad Ad Ata») işlənir, `displayName` yox —
 * kataloq da soyada görə sıralanır, iki səhifə bir-birindən fərqlənməsin.
 *
 * `localeCompare(..., 'az')` MƏCBURİDİR: standart müqayisədə «Ə» hərfi «Z»-dən
 * sonra düşür və Əliyev, Əsgərov siyahının sonuna atılır.
 */
const byName = (a: LeadershipUnit, b: LeadershipUnit) =>
  (a.head?.name ?? '').localeCompare(b.head?.name ?? '', 'az');

/** Vəzifə növünə görə blok daxilində sıra. Kiçik rəqəm yuxarıda. */
function postRank(position: string | null | undefined, order: RegExp[]): number {
  const p = azLower(position ?? '');
  for (let i = 0; i < order.length; i++) if (order[i].test(p)) return i;
  return order.length;
}

/** Rəhbərlik bloku: prorektor -> elmi katib -> müşavir. */
const LEAD_ORDER = [/prorektor/, /elmi katib/, /müşavir/];
/** Tədris bloku: əvvəlcə dekanlar, sonra kafedra müdirləri. */
const ACADEMIC_ORDER = [/dekan/, /kafedra müdiri/];

/** Əvvəl vəzifə növü, sonra əlifba. */
const byRankThenName = (order: RegExp[]) => (a: LeadershipUnit, b: LeadershipUnit) =>
  postRank(a.head?.position, order) - postRank(b.head?.position, order) || byName(a, b);

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

  // Rəhbəri olmayan bölmə HEÇ GÖSTƏRİLMİR. Boş kart məlumat vermir, sadəcə
  // səhifəni doldurur. Süzgəc çağıran tərəfdədir; bu yoxlama TypeScript üçün.
  if (!head) return null;

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
        {SHOW_ADMIN_LINKS ? (
          <div className="ld-admin">
            <span>{tr('Redaktə', locale)}:</span>
            <a href={adminUrl('api::person.person', head.documentId, locale)} target="_blank" rel="noreferrer">
              {tr('şəxs', locale)}
            </a>
            <a href={adminUrl('api::unit.unit', unit.documentId, locale)} target="_blank" rel="noreferrer">
              {tr('bölmə', locale)}
            </a>
          </div>
        ) : null}
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

  const rector = bySlug.get(ROOT_SLUG) ?? null;
  const council = bySlug.get(COUNCIL_SLUG) ?? null;

  // Rəhbəri olmayan bölmə səhifədə iştirak etmir — vakant kart göstərilmir.
  const staffed = units.filter((u) => u.head && !HIDDEN.includes(u.slug));

  const isLeadership = (u: LeadershipUnit) =>
    u.slug.includes('prorektor') || LEADERSHIP_EXTRA.includes(u.slug);

  const leadership = [...staffed.filter(isLeadership)].sort(byRankThenName(LEAD_ORDER));

  const rest = staffed.filter(
    (u) => u.slug !== ROOT_SLUG && u.slug !== COUNCIL_SLUG && !isLeadership(u),
  );

  // Tədris / inzibati ayrımı VƏZİFƏYƏ görədir, ağaca görə yox: təsərrüfat
  // şöbəsi ağacda prorektorluq altındadır, amma tədris bölməsi deyil.
  const academic = [...rest.filter((u) => isAcademicPost(u.head?.position))].sort(
    byRankThenName(ACADEMIC_ORDER),
  );
  const administrative = [...rest.filter((u) => !isAcademicPost(u.head?.position))].sort(byName);

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

        {rector?.head ? (
          <section className="ld-group ld-group--lead">
            <div className="container">
              <h2 className="ld-h2">{tr('Rektor', locale)}</h2>
              <ul className="ld-grid ld-grid--single">
                <LeaderCard unit={rector} locale={locale} featured />
              </ul>
            </div>
          </section>
        ) : null}

        <Group title={tr('Rəhbərlik', locale)} units={leadership} locale={locale} />

        <Group title={tr('Tədris bölmələri', locale)} units={academic} locale={locale} />

        <Group
          title={tr('İnzibati və dəstək bölmələri', locale)}
          units={administrative}
          locale={locale}
        />

        {council?.head ? (
          <Group title={tr('Elmi Şura', locale)} units={[council]} locale={locale} />
        ) : null}

        {!staffed.length ? (
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
