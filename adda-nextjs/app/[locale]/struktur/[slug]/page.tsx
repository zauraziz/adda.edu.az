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
import ExpandBlock from '../../../_components/ExpandBlock';
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
// toruna çevrilməyəndə) aç/yığ düyməsi arxasında açılır. Qısa mətn üçün
// heç bir klient JS-i getmir — <ExpandBlock> yalnız HƏQİQƏTƏN uzun olanda
// render olunur (F4.6c: düymə hər blokun öz adını daşıyır, açıq halda
// "Yığ" olur — bu, native <details>-in avtomatik vermədiyi davranışdır).
const LONG_TEXT_THRESHOLD = 1200;

function longText(raw: string, html: string, labelClosed: string, labelOpen: string) {
  const body = <div className="na-body" style={{ maxWidth: 'none' }} dangerouslySetInnerHTML={{ __html: html }} />;
  if (raw.length <= LONG_TEXT_THRESHOLD) return body;
  return <ExpandBlock html={html} labelClosed={labelClosed} labelOpen={labelOpen} />;
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

  const contactHas = Boolean(unit.building || unit.floor || unit.room || unit.phoneExt || unit.email);
  const block1Has = Boolean(unit.mission || unit.about);
  const block2Has = Boolean(staffSorted.length);
  const block3Has = Boolean(unit.functions || unit.services);
  const block4Has = Boolean(unit.links.length);
  const subunits = [...unit.children].sort(
    (a, b) => (a.sortOrder ?? 100) - (b.sortOrder ?? 100) || azSort(a.name, b.name),
  );
  // F4.5c — alt bölmələr artıq blok 5-in İÇİNDƏ deyil (səhifənin sonuna öz
  // kart cərgəsinə keçib, aşağıda) — ona görə "var" statusu subunits-i
  // SAYMIR, əks halda başlıq görünüb altı boş qalardı.
  // F4.6d — hesabat bloku ikiyə bölünür: nəticə mətni (unit.results) + varsa
  // PDF sənədləri.
  // F4.6e — xəbər/elan artıq bu blokda deyil, ayrıca "Əlaqəli xəbərlər" blokundadır.
  const block5Has = Boolean(unit.results || hesabat.length);
  const block6Has = Boolean(articles.length || announcements.length);

  // F4.5c — hər alt bölmə kartında ad + rəhbər + heyət sayı. Rəhbər `allUnits`-dən
  // (artıq yüklənib, əlavə sorğu yoxdur); heyət sayı üçün hər alt bölmə üçün
  // `getUnitStaff` çağrılır (adətən 2-7 uşaq — qəbul edilə bilən əlavə yük).
  const subunitHeadBySlug = new Map(allUnits.map((u) => [u.slug, u.head ?? null]));
  const subunitStaffCounts = await Promise.all(
    subunits.map((c) => getUnitStaff(c.slug, c.name).then((s) => s.length).catch(() => 0)),
  );

  const blockTitle1 = tr('Struktur bölmə', locale);
  const blockTitle2 = tr('Kim işləyir?', locale);
  const blockTitle3 = tr('Bölmə nə işlə məşğuldur?', locale);
  const blockTitle4 = tr('Faydalı linklər', locale);
  const blockTitle5 = tr('Görülmüş işlər və nəticələr', locale);
  const blockTitle6 = tr('Əlaqəli xəbərlər', locale);
  const blockStatus = [
    { has: block1Has, title: blockTitle1 },
    { has: block2Has, title: blockTitle2 },
    { has: block3Has, title: blockTitle3 },
    { has: block4Has, title: blockTitle4 },
    { has: block5Has, title: blockTitle5 },
    { has: block6Has, title: blockTitle6 },
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
  const blockClass = (n: 0 | 1 | 2 | 3 | 4 | 5) => 'un-block' + (blockTint[n] ? ' un-block--tint' : '');

  // F4.5a — sağ yan sütun: rəhbər · əlaqə · qəbul saatları · əsasnamə ·
  // onlayn xidmətlər. Heç biri yoxdursa sütun render olunmur, səhifə TƏK
  // SÜTUN olur (27/28 bölmədə baş verir — bax .un-layout--single, 36-unit.css).
  const sideHas = Boolean(
    unit.head || contactHas || unit.receptionHours || esasname.length || unit.onlineServices.length,
  );

  // F4.5b — fakt zolağı: otaq · daxili telefon · qəbul saatları · heyət sayı
  // · alt bölmə sayı. Uydurma metrika yoxdur, YALNIZ mövcud dəyərlər — bir
  // dənə də yoxdursa zolaq render olunmur.
  const factsHas = Boolean(
    unit.room || unit.phoneExt || unit.receptionHours || staffSorted.length || subunits.length,
  );

  const aboutHtml = unit.about ? await marked.parse(unit.about) : '';
  const functionsHtml = unit.functions ? await marked.parse(unit.functions) : '';
  const servicesHtml = unit.services ? await marked.parse(unit.services) : '';
  const resultsHtml = unit.results ? await marked.parse(unit.results) : '';
  const functionCards = unit.functions ? parseListCards(unit.functions) : null;
  const serviceCards = unit.services ? parseListCards(unit.services) : null;

  // F4.6c — hər yığılmış blokun düyməsi öz adını daşıyır ("Ətraflı" YERİNƏ).
  const expandLabelOpen = tr('Yığ', locale);
  const aboutExpandLabel = `${tr('Bölmə haqqında', locale)} — ${tr('ətraflı', locale)}`;
  const functionsExpandLabel = `${tr('Fəaliyyət sahəsi', locale)} — ${tr('ətraflı', locale)}`;
  const servicesExpandLabel = `${tr('Xidmətlər', locale)} — ${tr('ətraflı', locale)}`;
  const resultsExpandLabel = `${tr('Görülmüş işlər və nəticələr', locale)} — ${tr('ətraflı', locale)}`;

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
            {factsHas ? (
              <ul className="un-facts" aria-label={tr('Əsas faktlar', locale)}>
                {unit.room ? (
                  <li className="un-fact">
                    <i className="ti ti-map-pin" aria-hidden="true" />
                    <span className="un-fact-k">{tr('Otaq', locale)}</span>
                    <span className="un-fact-v">{unit.room}</span>
                  </li>
                ) : null}
                {unit.phoneExt ? (
                  <li className="un-fact">
                    <i className="ti ti-phone" aria-hidden="true" />
                    <span className="un-fact-k">{tr('Daxili telefon', locale)}</span>
                    <span className="un-fact-v">{unit.phoneExt}</span>
                  </li>
                ) : null}
                {unit.receptionHours ? (
                  <li className="un-fact">
                    <i className="ti ti-clock" aria-hidden="true" />
                    <span className="un-fact-k">{tr('Qəbul saatları', locale)}</span>
                    <span className="un-fact-v">{unit.receptionHours}</span>
                  </li>
                ) : null}
                {staffSorted.length ? (
                  <li className="un-fact">
                    <i className="ti ti-users" aria-hidden="true" />
                    <span className="un-fact-k">{tr('Heyət', locale)}</span>
                    <span className="un-fact-v">{staffSorted.length}</span>
                  </li>
                ) : null}
                {subunits.length ? (
                  <li className="un-fact">
                    <i className="ti ti-sitemap" aria-hidden="true" />
                    <span className="un-fact-k">{tr('Alt bölmə', locale)}</span>
                    <span className="un-fact-v">{subunits.length}</span>
                  </li>
                ) : null}
              </ul>
            ) : null}
          </div>
        </section>

        <div className="container">
          {SHOW_ADMIN_LINKS ? (
            <div className="un-admin-status">
              {tr('Bloklar', locale)}: {openBlockCount}/{blockStatus.length}
              {closedBlockTitles.length ? ' · ' + tr('boş', locale) + ': ' + closedBlockTitles.join(', ') : ''}
            </div>
          ) : null}

          {/* F4.5a — iki sütun: əsas mətn + yapışqan yan sütun (rəhbər/əlaqə/
              qəbul saatları/əsasnamə/onlayn xidmətlər). Yan sütunda heç nə
              yoxdursa (.un-layout--single) tək sütuna düşür. */}
          <div className={'un-layout' + (sideHas ? '' : ' un-layout--single')}>
            <div className="un-main">
              {/* ── 1. Struktur bölmə — F4.5c: başlıqsız, səhifə adı onsuz da yuxarıda ── */}
              {block1Has ? (
                <section className={blockClass(0)}>
                  {SHOW_ADMIN_LINKS ? (
                    <div className="un-block-head" style={{ justifyContent: 'flex-end' }}>
                      <a
                        className="un-admin-edit"
                        href={adminUrl('api::unit.unit', unit.documentId, locale)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {tr('redaktə', locale)}
                      </a>
                    </div>
                  ) : null}
                  {unit.mission ? <p className="un-mission">{unit.mission}</p> : null}
                  {unit.about ? longText(unit.about, aboutHtml, aboutExpandLabel, expandLabelOpen) : null}
                </section>
              ) : SHOW_ADMIN_LINKS ? (
                <EmptyBlock title={blockTitle1} documentId={unit.documentId} locale={locale} tint={blockTint[0]} />
              ) : null}

              {/* ── 2. Rəhbərlik və heyət — rəhbər kartı yan sütunda, burada YALNIZ heyət ── */}
              {block2Has ? (
                <section className={blockClass(1)}>
                  <BlockTitle title={blockTitle2} documentId={unit.documentId} locale={locale} />
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
                </section>
              ) : SHOW_ADMIN_LINKS ? (
                <EmptyBlock title={blockTitle2} documentId={unit.documentId} locale={locale} tint={blockTint[1]} />
              ) : null}

              {/* ── 3. Bölmə nə işlə məşğuldur? (F4.5c: sual formasında, əvvəlki
                  "Funksional fəaliyyət") ── */}
              {block3Has ? (
                <section className={blockClass(2)}>
                  <BlockTitle title={blockTitle3} documentId={unit.documentId} locale={locale} />
                  {unit.functions ? (
                    functionCards ? (
                      <FnCardGrid cards={functionCards} />
                    ) : (
                      longText(unit.functions, functionsHtml, functionsExpandLabel, expandLabelOpen)
                    )
                  ) : null}
                  {unit.services ? (
                    <>
                      <div className="un-sub-title">{tr('Hansı məsələ ilə müraciət edə bilərsiniz?', locale)}</div>
                      {serviceCards ? (
                        <FnCardGrid cards={serviceCards} />
                      ) : (
                        longText(unit.services, servicesHtml, servicesExpandLabel, expandLabelOpen)
                      )}
                    </>
                  ) : null}
                </section>
              ) : SHOW_ADMIN_LINKS ? (
                <EmptyBlock title={blockTitle3} documentId={unit.documentId} locale={locale} tint={blockTint[2]} />
              ) : null}

              {/* ── 4. Faydalı linklər (əlaqə/onlayn xidmətlər yan sütuna keçib) ── */}
              {block4Has ? (
                <section className={blockClass(3)}>
                  <BlockTitle title={blockTitle4} documentId={unit.documentId} locale={locale} />
                  <div className="un-links">
                    {unit.links.map((l, i) => (
                      <a key={i} href={l.url} className="un-link-btn" target="_blank" rel="noreferrer">
                        <i className="ti ti-link" aria-hidden="true" />
                        {l.label}
                      </a>
                    ))}
                  </div>
                </section>
              ) : SHOW_ADMIN_LINKS ? (
                <EmptyBlock title={blockTitle4} documentId={unit.documentId} locale={locale} tint={blockTint[3]} />
              ) : null}

              {/* ── 5. Görülmüş işlər və nəticələr (F4.6d: mətn + varsa PDF-lər) ── */}
              {block5Has ? (
                <section className={blockClass(4)}>
                  <BlockTitle title={blockTitle5} documentId={unit.documentId} locale={locale} />
                  {unit.results ? longText(unit.results, resultsHtml, resultsExpandLabel, expandLabelOpen) : null}
                  {hesabat.length ? (
                    <>
                      <div className="un-sub-title">{tr('Hesabat sənədləri', locale)}</div>
                      <DocList docs={hesabat} locale={locale} />
                    </>
                  ) : null}
                </section>
              ) : SHOW_ADMIN_LINKS ? (
                <EmptyBlock title={blockTitle5} documentId={unit.documentId} locale={locale} tint={blockTint[4]} />
              ) : null}

              {/* ── 6. Əlaqəli xəbərlər (F4.6e: hesabatdan ayrı öz bloku; elanlar
                  varsa eyni blokda qısa siyahı kimi). Xəbər şəkilli (kiçik üz
                  qabığı şəkli), elan qısa/tarixli/şəkilsiz qalır (F4.5c). ── */}
              {block6Has ? (
                <section className={blockClass(5)}>
                  <BlockTitle title={blockTitle6} documentId={unit.documentId} locale={locale} />
                  {articles.length ? (
                    <ul className="un-row-list">
                      {articles.map((a) => {
                        const thumb = mediaUrl(a.cover);
                        return (
                          <li key={a.documentId} className="un-row un-row--news">
                            <span className="un-row-thumb">
                              {thumb ? <img src={thumb} alt="" loading="lazy" /> : <i className="ti ti-news" aria-hidden="true" />}
                            </span>
                            <span className="un-row-date">{fmtDate(a.newsDate ?? a.publishedAt, locale)}</span>
                            <Link href={`/${locale}/xeberler/${a.slug}`} className="un-row-title">{a.title}</Link>
                          </li>
                        );
                      })}
                    </ul>
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
                </section>
              ) : SHOW_ADMIN_LINKS ? (
                <EmptyBlock title={blockTitle6} documentId={unit.documentId} locale={locale} tint={blockTint[5]} />
              ) : null}

              {SHOW_ADMIN_LINKS ? (
                <div className="un-block" style={{ paddingTop: 0 }}>
                  <a href={adminUrl('api::unit.unit', unit.documentId, locale)} target="_blank" rel="noreferrer" className="un-link-btn">
                    {tr('Redaktə', locale)}: {tr('bölmə', locale)}
                  </a>
                </div>
              ) : null}
            </div>

            {sideHas ? (
              <aside className="un-side">
                {unit.head ? (
                  <div>
                    <div className="un-sub-title">{tr('Rəhbər', locale)}</div>
                    <ul className="ld-grid ld-grid--single">
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
                  </div>
                ) : null}

                {contactHas ? (
                  <div>
                    <div className="un-sub-title">{tr('Əlaqə', locale)}</div>
                    <div className="na-event-info" style={{ maxWidth: 'none', margin: 0 }}>
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
                  </div>
                ) : null}

                {unit.receptionHours ? (
                  <div>
                    <div className="un-sub-title">{tr('Qəbul saatları', locale)}</div>
                    <p className="un-side-text">{unit.receptionHours}</p>
                  </div>
                ) : null}

                {esasname.length ? (
                  <div>
                    <div className="un-sub-title">{tr('Əsasnamə', locale)}</div>
                    <DocList docs={esasname} locale={locale} />
                  </div>
                ) : null}

                {unit.onlineServices.length ? (
                  <div>
                    <div className="un-sub-title">{tr('Onlayn xidmətlər', locale)}</div>
                    <div className="un-links">
                      {unit.onlineServices.map((l, i) => (
                        <a key={i} href={l.url} className="un-link-btn" target="_blank" rel="noreferrer">
                          <i className="ti ti-external-link" aria-hidden="true" />
                          {l.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}
              </aside>
            ) : null}
          </div>

          {/* F4.5c — alt bölmələr blok 5-dən çıxıb səhifənin sonuna öz kart
              cərgəsinə keçib (HSE "Другие программы" nümunəsi). Hər kartda
              ad + rəhbər + heyət sayı — mövcud olmayan sahə göstərilmir. */}
          {subunits.length ? (
            <section className="un-subunits">
              <h2 className="un-block-title">{tr('Alt bölmələr', locale)}</h2>
              <ul className="un-subunit-grid">
                {subunits.map((c, i) => {
                  const h = subunitHeadBySlug.get(c.slug);
                  const n = subunitStaffCounts[i] ?? 0;
                  return (
                    <li key={c.slug}>
                      <Link href={`/${locale}/struktur/${c.slug}`} className="un-subunit-card">
                        <div className="un-subunit-name">{c.name}</div>
                        {h ? <div className="un-subunit-head">{h.name}</div> : null}
                        {n ? <div className="un-subunit-count">{tr('Heyət', locale)}: {n}</div> : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
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
