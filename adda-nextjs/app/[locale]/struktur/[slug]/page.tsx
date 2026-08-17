// F3.22 — /[locale]/struktur/[slug]: bölmə səhifəsi, beş blok.
//
// ƏN VACİB QAYDA: boş blok göstərilmir. Məzmun demək olar ki, sıfırdır
// (about 0/28, foto 1/23) — sahə boşdursa blok, başlıq və ayırıcı da
// görünməməlidir, əks halda səhifə boş başlıqlar divarı olar.
//
// HƏR İKİ MƏNBƏ: `unit` (2025 təşkilati sxemi, beş blok) və `department`
// (köhnə saytdan miqrasiya, yalnız ad+mətn) EYNİ ŞEYİ modelləşdirir, cəmi
// 5 slug üst-üstə düşür. `unit` tapılarsa beş blok qurulur; tapılmasa və
// `department` varsa köhnə sadə görünüşə (ContentPage) keçilir ki, mövcud
// keçidlər 404 verməsin.
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
import '../../../_styles/23-correction.css';
import '../../../_styles/24-identity.css';
import '../../../_styles/28-staff.css';
import '../../../_styles/35-leadership.css';
import '../../../_styles/36-unit.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { marked } from 'marked';
import SiteHeaderStack from '../../../_components/SiteHeaderStack';
import Footer from '../../../_components/Footer';
import ContentPage from '../../../_components/ContentPage';
import CorrectionIsland from '../../../_components/CorrectionIsland';
import {
  getDepartmentBySlug,
  getDepartmentSlugs,
  getMenu,
  getUnitDetail,
  getUnitDocuments,
  getUnitStaff,
  getUnitArticles,
  getUnitAnnouncements,
  getUnits,
  docText,
  mediaUrl,
  degreeLabel,
  STRAPI_URL,
  type SiteMenu,
  type UnitDetail,
  type UnitDocumentItem,
  type Person,
  type Article,
  type Announcement,
  type Department,
  type OrgUnit,
} from '@/lib/strapi';
import { tr, isLocale, DEFAULT_LOCALE, LOCALES, type Locale } from '@/lib/i18n';
import { fmtDate } from '@/lib/format';

export const revalidate = 300;

const SHOW_ADMIN_LINKS = process.env.NEXT_PUBLIC_ADMIN_EDIT_LINKS === 'true';

function adminUrl(uid: string, documentId: string, locale: Locale): string {
  return (
    `${STRAPI_URL}/admin/content-manager/collection-types/${uid}/${documentId}` +
    `?plugins[i18n][locale]=${locale}`
  );
}

export async function generateStaticParams() {
  const out: Array<{ locale: string; slug: string }> = [];
  // `unit` (K36) və `department` (K18) slug-larının BİRLƏŞMƏSİ — yalnız 5-i üst-üstə düşür.
  for (const locale of LOCALES) {
    const seen = new Set<string>();
    const units = await getUnits(locale).catch(() => [] as OrgUnit[]);
    for (const u of units) seen.add(u.slug);
    for (const slug of await getDepartmentSlugs(locale)) seen.add(slug);
    for (const slug of seen) out.push({ locale, slug });
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
  const [unit, dep] = await Promise.all([
    getUnitDetail(slug, locale).catch(() => null as UnitDetail | null),
    getDepartmentBySlug(slug, locale).catch(() => null as Department | null),
  ]);
  const name = unit?.name ?? dep?.name;
  return name ? { title: name } : { title: tr('Struktur', locale) };
}

const azSort = (a: string, b: string) => a.localeCompare(b, 'az');

/** `unit.parent` yalnız BİR səviyyə gəlir — tam ata zənciri düz siyahıdan qurulur. */
function buildCrumbs(unit: UnitDetail, allUnits: OrgUnit[]): { slug: string; name: string }[] {
  const bySlug = new Map(allUnits.map((u) => [u.slug, u]));
  const chain: { slug: string; name: string }[] = [];
  let cur = unit.parent;
  const seen = new Set<string>();
  while (cur && !seen.has(cur.slug)) {
    seen.add(cur.slug);
    chain.unshift({ slug: cur.slug, name: cur.name });
    const full = bySlug.get(cur.slug);
    cur = full?.parent ?? null;
  }
  return chain;
}

/** F4.3 — blok başlığı + admin rejimində kiçik «redaktə» keçidi. */
function BlockTitle({ title, documentId, locale }: { title: string; documentId: string; locale: Locale }) {
  return (
    <div className="un-block-head">
      <h2 className="un-block-title">{title}</h2>
      {SHOW_ADMIN_LINKS ? (
        <a
          className="un-admin-edit"
          href={adminUrl('api::unit.unit', documentId, locale)}
          target="_blank"
          rel="noreferrer"
        >
          {tr('redaktə', locale)}
        </a>
      ) : null}
    </div>
  );
}

/**
 * F4.3 — boş blok, YALNIZ SHOW_ADMIN_LINKS aktiv olanda render olunur.
 * check:gaps hansı blokun boş olduğunu terminalda deyir, amma səhifədə
 * görünmürdü — məhz doldurulmalı yerdə keçid yox idi. İctimai görünüşdə
 * boş blok HEÇ VAXT render olunmur (yuxarıdakı əsas qayda dəyişmir).
 */
function EmptyBlock({
  title,
  documentId,
  locale,
  tint,
}: {
  title: string;
  documentId: string;
  locale: Locale;
  tint: boolean;
}) {
  return (
    <section className={'un-block un-block--empty' + (tint ? ' un-block--tint' : '')}>
      <BlockTitle title={title} documentId={documentId} locale={locale} />
      <p className="un-block-empty-note">{tr('Bu blok boşdur.', locale)}</p>
    </section>
  );
}

// F4.4 — 1200 simvoldan uzun `about`/`functions`/`services` mətni (kart
// toruna çevrilməyəndə) «Ətraflı» arxasında açılır. Native <details>/<summary>
// qəsdən seçilib: JS lazım deyil,
// klaviatura/reduced-motion pulsuz gəlir, hər instansiya MÜSTƏQİLDİR (bir
// blokun açılması digərini bağlamır — akkordeon DEYİL).
const LONG_TEXT_THRESHOLD = 1200;

function LongHtml({ raw, html, locale }: { raw: string; html: string; locale: Locale }) {
  const body = <div className="na-body" style={{ maxWidth: 'none' }} dangerouslySetInnerHTML={{ __html: html }} />;
  if (raw.length <= LONG_TEXT_THRESHOLD) return body;
  return (
    <details className="un-expand">
      <summary className="un-expand-toggle">{tr('Ətraflı', locale)}</summary>
      {body}
    </details>
  );
}

// F4.4 — `functions`/`services` üçün markdown siyahısı kart toruna çevrilir.
// Format: `- **Başlıq** — açıqlama`. YALNIZ hər sətir bullet-lə başlayırsa
// siyahı sayılır (qarışıq abzas+siyahı halında SƏHV parçalanmanın qarşısını
// almaq üçün) — əks halda `null` qaytarılır və çağıran adi mətn kimi render
// edir.
interface FnCard { title: string | null; body: string }

function parseListCards(raw: string): FnCard[] | null {
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (!lines.length) return null;
  const items: string[] = [];
  for (const line of lines) {
    const m = line.match(/^[-*]\s+(.+)$/);
    if (!m) return null;
    items.push(m[1].trim());
  }
  return items.map((item) => {
    const m = item.match(/^\*\*(.+?)\*\*\s*(?:[—-]\s*)?(.*)$/);
    if (m) return { title: m[1].trim(), body: m[2].trim() };
    return { title: null, body: item };
  });
}

function FnCardGrid({ cards }: { cards: FnCard[] }) {
  return (
    <div className="un-card-grid">
      {cards.map((c, i) => (
        <div key={i} className="un-card">
          {c.title ? <div className="un-card-title">{c.title}</div> : null}
          {c.body ? (
            <div className="un-card-body" dangerouslySetInnerHTML={{ __html: marked.parseInline(c.body) as string }} />
          ) : null}
        </div>
      ))}
    </div>
  );
}

function DocList({ docs, locale }: { docs: UnitDocumentItem[]; locale: Locale; }) {
  if (!docs.length) return null;
  return (
    <div className="na-files" style={{ maxWidth: 'none', margin: 0 }}>
      {docs.map((d) => {
        const { title } = docText(d, locale);
        const url = mediaUrl(d.file);
        if (!url) return null;
        return (
          <a key={d.documentId} href={url} className="na-file" target="_blank" rel="noopener noreferrer">
            <i className="ti ti-file-download" />
            <span>{title}{d.year ? ` (${d.year})` : ''}</span>
          </a>
        );
      })}
    </div>
  );
}

export default async function UnitPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  const [unit, dep, menu] = await Promise.all([
    getUnitDetail(slug, locale).catch(() => null as UnitDetail | null),
    getDepartmentBySlug(slug, locale).catch(() => null as Department | null),
    getMenu(locale).catch(() => null as SiteMenu | null),
  ]);

  if (!unit && !dep) notFound();

  // ── `department`-yalnız fallback: köhnə sadə görünüş, dağıtmır ──
  if (!unit) {
    const d = dep as Department;
    const correctionLabels: Record<string, string> = {
      promptHint: tr('Bu səhifədə səhv gördünüz?', locale),
      prompt: tr('Düzəliş təklif et', locale),
      title: tr('Düzəliş təklifi', locale),
      subtitle: tr('Səhv gördünüzsə bizə bildirin.', locale),
      fieldLabel: tr('Hansı sahə?', locale),
      f_title: tr('Başlıq', locale),
      f_body: tr('Mətn', locale),
      f_other: tr('Digər', locale),
      currentLabel: tr('Cari mətn', locale),
      currentHint: tr('Düzəliş lazım olan hissəni bura köçürün', locale),
      suggestedLabel: tr('Təklif etdiyiniz düzəliş', locale),
      suggestedHint: tr('Düzgün variant', locale),
      diffLabel: tr('Fərq önizləməsi', locale),
      reasonLabel: tr('Səbəb (istəyə bağlı)', locale),
      submit: tr('Düzəlişi göndər', locale),
      sending: tr('Göndərilir', locale),
      successMsg: tr('Təklifiniz göndərildi. Töhfəniz üçün təşəkkür edirik.', locale),
      successSub: tr('Redaktə komandamız qısa zamanda yoxlayacaq.', locale),
      emptyErr: tr('Zəhmət olmasa düzəliş mətnini daxil edin.', locale),
      close: tr('Bağla', locale),
      error: tr('Uğursuz əməliyyat', locale),
      verified: tr('Təsdiqlənmiş', locale),
      gateCorrection: tr('Düzəliş göndərmək üçün kimlik təsdiqi lazımdır', locale),
      verifyHeading: tr('Kimliyinizi təsdiqləyin', locale),
      verifyIntro: tr('E-poçtunuza bir dəfəlik giriş linki göndərəcəyik. Parol lazım deyil.', locale),
      emailPlaceholder: tr('Email ünvanınız', locale),
      sendLink: tr('Giriş linki göndər', locale),
      linkSent: tr('Link göndərildi', locale),
      checkInbox: tr('Poçt qutunuzu yoxlayın. Link 15 dəqiqə etibarlıdır.', locale),
      otherAddress: tr('Başqa ünvan yaz', locale),
      badEmail: tr('Düzgün e-poçt ünvanı daxil edin.', locale),
      tooMany: tr('Çox sayda cəhd. Bir az sonra yenidən yoxlayın.', locale),
      unconfigured: tr('Kimlik xidməti hazırda əlçatan deyil.', locale),
      mailFailed: tr('E-poçt göndərilə bilmədi. Bir az sonra yenidən cəhd edin və ya kadrlar şöbəsinə müraciət edin.', locale),
    };
    return (
      <ContentPage
        locale={locale}
        menu={menu}
        kicker={tr('Struktur', locale)}
        title={d.name}
        body={d.about}
        correction={{ targetType: 'general', targetSlug: slug, labels: correctionLabels }}
      />
    );
  }

  // ── `unit` — beş blok ──
  const [allUnits, docs, staff, articles, announcements] = await Promise.all([
    getUnits(locale).catch(() => [] as OrgUnit[]),
    getUnitDocuments(unit.slug).catch(() => [] as UnitDocumentItem[]),
    getUnitStaff(unit.slug, unit.name).catch(() => [] as Person[]),
    getUnitArticles(unit.slug, locale, 6),
    getUnitAnnouncements(unit.slug, locale, 6),
  ]);

  const crumbs = buildCrumbs(unit, allUnits);

  const esasname = docs.filter((d) => d.category === 'esasname');
  const hesabat = [...docs.filter((d) => d.category === 'hesabat')].sort(
    (a, b) => (b.year ?? 0) - (a.year ?? 0),
  );

  // SIRALAMA: əvvəl rəhbər, sonra əlifba (name, localeCompare 'az' MƏCBURİ).
  const headSlug = unit.head?.slug;
  const staffSorted = [...staff].sort((a, b) => {
    if (a.slug === headSlug) return -1;
    if (b.slug === headSlug) return 1;
    return azSort(a.name ?? '', b.name ?? '');
  });

  const headPhoto = unit.head ? mediaUrl(unit.head.photo) : null;
  const headDegree = unit.head ? degreeLabel(unit.head.academicDegree) : null;

  const block1Has = Boolean(unit.mission || unit.about || esasname.length);
  const block2Has = Boolean(unit.head || staffSorted.length || unit.receptionHours);
  const block3Has = Boolean(unit.functions || unit.services || unit.onlineServices.length);
  const contactHas = Boolean(unit.building || unit.floor || unit.room || unit.phoneExt || unit.email);
  const block4Has = Boolean(contactHas || unit.links.length);
  const subunits = [...unit.children].sort(
    (a, b) => (a.sortOrder ?? 100) - (b.sortOrder ?? 100) || azSort(a.name, b.name),
  );
  const block5Has = Boolean(hesabat.length || articles.length || announcements.length || subunits.length);

  const blockTitle1 = tr('Struktur bölmə', locale);
  const blockTitle2 = tr('Rəhbərlik və heyət', locale);
  const blockTitle3 = tr('Funksional fəaliyyət', locale);
  const blockTitle4 = tr('Kommunikasiya və yerləşmə', locale);
  const blockTitle5 = tr('Hesabatlılıq və şəffaflıq', locale);
  const blockStatus = [
    { has: block1Has, title: blockTitle1 },
    { has: block2Has, title: blockTitle2 },
    { has: block3Has, title: blockTitle3 },
    { has: block4Has, title: blockTitle4 },
    { has: block5Has, title: blockTitle5 },
  ];
  const openBlockCount = blockStatus.filter((b) => b.has).length;
  const closedBlockTitles = blockStatus.filter((b) => !b.has).map((b) => b.title);

  // F4.4 — ağ/boz ritm YALNIZ faktiki render olunan bloklara görə sayılır.
  // Boş bloklar public görünüşdə heç render olunmur, admin rejimində isə
  // (EmptyBlock kimi) render olunur — hər iki halda sayğac DOĞRU işləməlidir.
  let tintCursor = 0;
  const blockTint = blockStatus.map((b) => {
    const willRender = b.has || SHOW_ADMIN_LINKS;
    if (!willRender) return false;
    const tint = tintCursor % 2 === 1;
    tintCursor++;
    return tint;
  });
  const blockClass = (n: 0 | 1 | 2 | 3 | 4) => 'un-block' + (blockTint[n] ? ' un-block--tint' : '');

  const aboutHtml = unit.about ? await marked.parse(unit.about) : '';
  const functionsHtml = unit.functions ? await marked.parse(unit.functions) : '';
  const servicesHtml = unit.services ? await marked.parse(unit.services) : '';
  const functionCards = unit.functions ? parseListCards(unit.functions) : null;
  const serviceCards = unit.services ? parseListCards(unit.services) : null;

  const correctionLabels: Record<string, string> = {
    promptHint: tr('Bu səhifədə səhv gördünüz?', locale),
    prompt: tr('Düzəliş təklif et', locale),
    title: tr('Düzəliş təklifi', locale),
    subtitle: tr('Səhv gördünüzsə bizə bildirin.', locale),
    fieldLabel: tr('Hansı sahə?', locale),
    f_title: tr('Başlıq', locale),
    f_body: tr('Mətn', locale),
    f_other: tr('Digər', locale),
    currentLabel: tr('Cari mətn', locale),
    currentHint: tr('Düzəliş lazım olan hissəni bura köçürün', locale),
    suggestedLabel: tr('Təklif etdiyiniz düzəliş', locale),
    suggestedHint: tr('Düzgün variant', locale),
    diffLabel: tr('Fərq önizləməsi', locale),
    reasonLabel: tr('Səbəb (istəyə bağlı)', locale),
    submit: tr('Düzəlişi göndər', locale),
    sending: tr('Göndərilir', locale),
    successMsg: tr('Təklifiniz göndərildi. Töhfəniz üçün təşəkkür edirik.', locale),
    successSub: tr('Redaktə komandamız qısa zamanda yoxlayacaq.', locale),
    emptyErr: tr('Zəhmət olmasa düzəliş mətnini daxil edin.', locale),
    close: tr('Bağla', locale),
    error: tr('Uğursuz əməliyyat', locale),
    verified: tr('Təsdiqlənmiş', locale),
    gateCorrection: tr('Düzəliş göndərmək üçün kimlik təsdiqi lazımdır', locale),
    verifyHeading: tr('Kimliyinizi təsdiqləyin', locale),
    verifyIntro: tr('E-poçtunuza bir dəfəlik giriş linki göndərəcəyik. Parol lazım deyil.', locale),
    emailPlaceholder: tr('Email ünvanınız', locale),
    sendLink: tr('Giriş linki göndər', locale),
    linkSent: tr('Link göndərildi', locale),
    checkInbox: tr('Poçt qutunuzu yoxlayın. Link 15 dəqiqə etibarlıdır.', locale),
    otherAddress: tr('Başqa ünvan yaz', locale),
    badEmail: tr('Düzgün e-poçt ünvanı daxil edin.', locale),
    tooMany: tr('Çox sayda cəhd. Bir az sonra yenidən yoxlayın.', locale),
    unconfigured: tr('Kimlik xidməti hazırda əlçatan deyil.', locale),
    mailFailed: tr('E-poçt göndərilə bilmədi. Bir az sonra yenidən cəhd edin və ya kadrlar şöbəsinə müraciət edin.', locale),
  };

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main>
        <section className="np-hero">
          <div className="container np-hero-inner">
            <div className="np-eyebrow">{tr('Struktur', locale)}</div>
            <h1 className="np-h1">{unit.name}</h1>
            <nav className="un-crumbs" aria-label={tr('Struktur', locale)}>
              <Link href={`/${locale}/struktur`}>{tr('Struktur', locale)}</Link>
              {crumbs.map((c) => (
                <span key={c.slug}>
                  <span className="un-crumb-sep">/</span>{' '}
                  <Link href={`/${locale}/struktur/${c.slug}`}>{c.name}</Link>
                </span>
              ))}
              <span className="un-crumb-sep">/</span> <span className="un-crumb-cur">{unit.name}</span>
            </nav>
          </div>
        </section>

        <div className="container">
          {SHOW_ADMIN_LINKS ? (
            <div className="un-admin-status">
              {tr('Bloklar', locale)}: {openBlockCount}/5
              {closedBlockTitles.length ? ' · ' + tr('boş', locale) + ': ' + closedBlockTitles.join(', ') : ''}
            </div>
          ) : null}

          {/* ── 1. Struktur bölmə ── */}
          {block1Has ? (
            <section className={blockClass(0)}>
              <BlockTitle title={blockTitle1} documentId={unit.documentId} locale={locale} />
              {unit.mission ? <p className="un-mission">{unit.mission}</p> : null}
              {unit.about ? <LongHtml raw={unit.about} html={aboutHtml} locale={locale} /> : null}
              {esasname.length ? (
                <>
                  <div className="un-sub-title">{tr('Əsasnamə', locale)}</div>
                  <DocList docs={esasname} locale={locale} />
                </>
              ) : null}
            </section>
          ) : SHOW_ADMIN_LINKS ? (
            <EmptyBlock title={blockTitle1} documentId={unit.documentId} locale={locale} tint={blockTint[0]} />
          ) : null}

          {/* ── 2. Rəhbərlik və heyət ── */}
          {block2Has ? (
            <section className={blockClass(1)}>
              <BlockTitle title={blockTitle2} documentId={unit.documentId} locale={locale} />
              {unit.head ? (
                <div className="un-sub-title">{tr('Rəhbər', locale)}</div>
              ) : null}
              {unit.head ? (
                <ul className="ld-grid ld-grid--single" style={{ marginBottom: '1.75rem' }}>
                  <li className="ld-card">
                    <Link href={`/${locale}/emekdas/${unit.head.slug}`} className="ld-plate">
                      {headPhoto ? (
                        <img className="ld-photo" src={headPhoto} alt="" loading="lazy" />
                      ) : (
                        <span className="ld-mono" aria-hidden="true">
                          {(unit.head.displayName || unit.head.name || '—').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                        </span>
                      )}
                    </Link>
                    <div className="ld-body">
                      <Link href={`/${locale}/emekdas/${unit.head.slug}`} className="ld-name">
                        {unit.head.displayName || unit.head.name}
                      </Link>
                      {unit.head.position ? <div className="ld-position">{unit.head.position}</div> : null}
                      {headDegree || unit.head.academicTitle ? (
                        <div className="ld-degree">{[headDegree, unit.head.academicTitle].filter(Boolean).join(' · ')}</div>
                      ) : null}
                      <dl className="ld-contact">
                        {unit.head.email ? (
                          <>
                            <dt>{tr('E-poçt', locale)}</dt>
                            <dd><a href={`mailto:${unit.head.email}`}>{unit.head.email}</a></dd>
                          </>
                        ) : null}
                        {unit.head.phone ? (
                          <>
                            <dt>{tr('Telefon', locale)}</dt>
                            <dd><a href={`tel:${unit.head.phone.replace(/[^\d+]/g, '')}`}>{unit.head.phone}</a></dd>
                          </>
                        ) : null}
                      </dl>
                      {SHOW_ADMIN_LINKS ? (
                        <div className="ld-admin">
                          <span>{tr('Redaktə', locale)}:</span>
                          <a href={adminUrl('api::person.person', unit.head.documentId, locale)} target="_blank" rel="noreferrer">
                            {tr('şəxs', locale)}
                          </a>
                        </div>
                      ) : null}
                    </div>
                  </li>
                </ul>
              ) : null}

              {staffSorted.length ? (
                <>
                  <div className="un-sub-title">{tr('Heyət', locale)} ({staffSorted.length})</div>
                  <ul className="un-staff-grid">
                    {staffSorted.map((p) => {
                      const role = (p.roles ?? []).find((r) => r.unitName === unit.name);
                      const post = role?.position || p.position || '';
                      const initials = (p.displayName || p.name || '—')
                        .split(/\s+/)
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join('')
                        .toUpperCase();
                      return (
                        <li key={p.documentId} className="un-staff-card">
                          <Link href={`/${locale}/emekdas/${p.slug}`} className="un-staff-mono" aria-hidden="true" tabIndex={-1}>
                            {initials}
                          </Link>
                          <div className="un-staff-body">
                            <Link href={`/${locale}/emekdas/${p.slug}`} className="un-staff-name">
                              {p.displayName || p.name}
                            </Link>
                            {post ? <div className="un-staff-post">{post}</div> : null}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : null}

              {unit.receptionHours ? (
                <p style={{ marginTop: '1.5rem' }}>
                  <strong>{tr('Qəbul saatları', locale)}:</strong> {unit.receptionHours}
                </p>
              ) : null}
            </section>
          ) : SHOW_ADMIN_LINKS ? (
            <EmptyBlock title={blockTitle2} documentId={unit.documentId} locale={locale} tint={blockTint[1]} />
          ) : null}

          {/* ── 3. Funksional fəaliyyət ── */}
          {block3Has ? (
            <section className={blockClass(2)}>
              <BlockTitle title={blockTitle3} documentId={unit.documentId} locale={locale} />
              {unit.functions ? (
                <>
                  <div className="un-sub-title">{tr('Funksiyalar', locale)}</div>
                  {functionCards ? (
                    <FnCardGrid cards={functionCards} />
                  ) : (
                    <LongHtml raw={unit.functions} html={functionsHtml} locale={locale} />
                  )}
                </>
              ) : null}
              {unit.services ? (
                <>
                  <div className="un-sub-title">{tr('Xidmətlər', locale)}</div>
                  {serviceCards ? (
                    <FnCardGrid cards={serviceCards} />
                  ) : (
                    <LongHtml raw={unit.services} html={servicesHtml} locale={locale} />
                  )}
                </>
              ) : null}
              {unit.onlineServices.length ? (
                <>
                  <div className="un-sub-title">{tr('Onlayn xidmətlər', locale)}</div>
                  <div className="un-links">
                    {unit.onlineServices.map((l, i) => (
                      <a key={i} href={l.url} className="un-link-btn" target="_blank" rel="noreferrer">
                        <i className="ti ti-external-link" aria-hidden="true" />
                        {l.label}
                      </a>
                    ))}
                  </div>
                </>
              ) : null}
            </section>
          ) : SHOW_ADMIN_LINKS ? (
            <EmptyBlock title={blockTitle3} documentId={unit.documentId} locale={locale} tint={blockTint[2]} />
          ) : null}

          {/* ── 4. Kommunikasiya və yerləşmə ── */}
          {block4Has ? (
            <section className={blockClass(3)}>
              <BlockTitle title={blockTitle4} documentId={unit.documentId} locale={locale} />
              {contactHas ? (
                <div className="na-event-info" style={{ maxWidth: 'none', margin: '0 0 1.25rem' }}>
                  {unit.building ? (
                    <div className="na-ei-row">
                      <i className="ti ti-building na-ei-ic" aria-hidden="true" />
                      <div>
                        <div className="na-ei-k">{tr('Korpus', locale)}</div>
                        <div className="na-ei-v">{unit.building}</div>
                      </div>
                    </div>
                  ) : null}
                  {unit.floor ? (
                    <div className="na-ei-row">
                      <i className="ti ti-stairs na-ei-ic" aria-hidden="true" />
                      <div>
                        <div className="na-ei-k">{tr('Mərtəbə', locale)}</div>
                        <div className="na-ei-v">{unit.floor}</div>
                      </div>
                    </div>
                  ) : null}
                  {unit.room ? (
                    <div className="na-ei-row">
                      <i className="ti ti-map-pin na-ei-ic" aria-hidden="true" />
                      <div>
                        <div className="na-ei-k">{tr('Otaq', locale)}</div>
                        <div className="na-ei-v">{unit.room}</div>
                      </div>
                    </div>
                  ) : null}
                  {unit.phoneExt ? (
                    <div className="na-ei-row">
                      <i className="ti ti-phone na-ei-ic" aria-hidden="true" />
                      <div>
                        <div className="na-ei-k">{tr('Daxili telefon', locale)}</div>
                        <div className="na-ei-v">{unit.phoneExt}</div>
                      </div>
                    </div>
                  ) : null}
                  {unit.email ? (
                    <div className="na-ei-row">
                      <i className="ti ti-mail na-ei-ic" aria-hidden="true" />
                      <div>
                        <div className="na-ei-k">{tr('E-poçt', locale)}</div>
                        <div className="na-ei-v"><a href={`mailto:${unit.email}`}>{unit.email}</a></div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
              {unit.links.length ? (
                <>
                  <div className="un-sub-title">{tr('Faydalı linklər', locale)}</div>
                  <div className="un-links">
                    {unit.links.map((l, i) => (
                      <a key={i} href={l.url} className="un-link-btn" target="_blank" rel="noreferrer">
                        <i className="ti ti-link" aria-hidden="true" />
                        {l.label}
                      </a>
                    ))}
                  </div>
                </>
              ) : null}
            </section>
          ) : SHOW_ADMIN_LINKS ? (
            <EmptyBlock title={blockTitle4} documentId={unit.documentId} locale={locale} tint={blockTint[3]} />
          ) : null}

          {/* ── 5. Hesabatlılıq və şəffaflıq ── */}
          {block5Has ? (
            <section className={blockClass(4)}>
              <BlockTitle title={blockTitle5} documentId={unit.documentId} locale={locale} />
              {hesabat.length ? (
                <>
                  <div className="un-sub-title">{tr('İllik hesabatlar', locale)}</div>
                  <DocList docs={hesabat} locale={locale} />
                </>
              ) : null}
              {articles.length ? (
                <>
                  <div className="un-sub-title">{tr('Xəbərlər', locale)}</div>
                  <ul className="un-row-list">
                    {articles.map((a) => (
                      <li key={a.documentId} className="un-row">
                        <span className="un-row-date">{fmtDate(a.newsDate ?? a.publishedAt, locale)}</span>
                        <Link href={`/${locale}/xeberler/${a.slug}`} className="un-row-title">{a.title}</Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
              {announcements.length ? (
                <>
                  <div className="un-sub-title">{tr('Elanlar', locale)}</div>
                  <ul className="un-row-list">
                    {announcements.map((a) => (
                      <li key={a.documentId} className="un-row">
                        <span className="un-row-date">{fmtDate(a.publishAt ?? a.publishedAt, locale)}</span>
                        <Link href={`/${locale}/elanlar/${a.slug}`} className="un-row-title">{a.title}</Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
              {subunits.length ? (
                <>
                  <div className="un-sub-title">{tr('Alt bölmələr', locale)}</div>
                  <ul className="un-sub-grid">
                    {subunits.map((c) => (
                      <li key={c.slug}>
                        <Link href={`/${locale}/struktur/${c.slug}`} className="stf-unit">
                          <span className="stf-unit-name">{c.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </section>
          ) : SHOW_ADMIN_LINKS ? (
            <EmptyBlock title={blockTitle5} documentId={unit.documentId} locale={locale} tint={blockTint[4]} />
          ) : null}

          {SHOW_ADMIN_LINKS ? (
            <div className="un-block" style={{ paddingTop: 0 }}>
              <a href={adminUrl('api::unit.unit', unit.documentId, locale)} target="_blank" rel="noreferrer" className="un-link-btn">
                {tr('Redaktə', locale)}: {tr('bölmə', locale)}
              </a>
            </div>
          ) : null}

          <div style={{ paddingBottom: '48px' }}>
            <CorrectionIsland
              targetType="general"
              targetSlug={slug}
              title={unit.name}
              locale={locale}
              labels={correctionLabels}
            />
          </div>
        </div>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
