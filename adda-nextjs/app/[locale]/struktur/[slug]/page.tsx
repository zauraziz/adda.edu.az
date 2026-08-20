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
import StaffReveal from '../../../_components/StaffReveal';
import { AdminProvider, AdminOnly } from '../../../_components/AdminGate';
import { DocList, DOC_CATEGORY_ORDER, DOC_CATEGORY_LABEL_AZ, groupDocsByCategory } from '../../../_components/DocList';
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
  mediaUrl,
  STRAPI_URL,
  type SiteMenu,
  type UnitDetail,
  type UnitDocumentItem,
  type Person,
  type StrapiMedia,
  type Article,
  type Announcement,
  type Department,
  type OrgUnit,
} from '@/lib/strapi';
import { tr, isLocale, DEFAULT_LOCALE, LOCALES, type Locale } from '@/lib/i18n';
import { fmtDate } from '@/lib/format';

export const revalidate = 300;

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

// F4.7a — başlıqlar bölmə adının sonluğundan törəyən tipdən qurulur (Mərkəz/
// Mərkəzin, Kafedra/Kafedranın və s.). CLAUDE.md-dəki azLower MƏCBURİdir —
// sadə toLowerCase() 'I'/'İ' hərflərini səhv çevirir. Uyğunluq yoxdursa
// (məs. "Elmi Şura" — "şurası" YOX, çılpaq "Şura") tip sözü yazılmır.
const azLower = (s: string) => s.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
const UNIT_TYPE_SUFFIXES: { suffix: string; nom: string; gen: string }[] = [
  { suffix: 'mərkəzi', nom: 'Mərkəz', gen: 'Mərkəzin' },
  { suffix: 'kafedrası', nom: 'Kafedra', gen: 'Kafedranın' },
  { suffix: 'şöbəsi', nom: 'Şöbə', gen: 'Şöbənin' },
  { suffix: 'fakültəsi', nom: 'Fakültə', gen: 'Fakültənin' },
  { suffix: 'şurası', nom: 'Şura', gen: 'Şuranın' },
  { suffix: 'kolleci', nom: 'Kollec', gen: 'Kollecin' },
];
function unitType(name: string): { nom: string; gen: string } | null {
  const lower = azLower(name);
  return UNIT_TYPE_SUFFIXES.find((t) => lower.endsWith(t.suffix)) ?? null;
}

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

/** F4.3/F4.9b — blok başlığı + admin sessiyasında kiçik «redaktə» keçidi.
 * `<AdminOnly>` klient adasıdır (bax _components/AdminGate.tsx) — kimlik
 * yoxlaması `/api/identity/is-admin`-dən hidrasiyadan sonra gəlir, server
 * heç kimin admin olub-olmadığını bilmir (səhifə statik qalır). */
function BlockTitle({ title, documentId, locale }: { title: string; documentId: string; locale: Locale }) {
  return (
    <div className="un-block-head">
      <h2 className="un-block-title">{title}</h2>
      <AdminOnly>
        <a
          className="un-admin-edit"
          href={adminUrl('api::unit.unit', documentId, locale)}
          target="_blank"
          rel="noreferrer"
        >
          {tr('redaktə', locale)}
        </a>
      </AdminOnly>
    </div>
  );
}

/**
 * F4.8a — blok öz h2-sini göstərmir (hər sahə öz başlığını daşıyır, bax
 * longText/fieldBlock), amma admin redaktə keçidi itməməlidir. Sadəcə
 * sağa düzülmüş kiçik keçid sətri.
 */
function AdminEditRow({ documentId, locale }: { documentId: string; locale: Locale }) {
  return (
    <AdminOnly>
      <div className="un-block-head" style={{ justifyContent: 'flex-end' }}>
        <a
          className="un-admin-edit"
          href={adminUrl('api::unit.unit', documentId, locale)}
          target="_blank"
          rel="noreferrer"
        >
          {tr('redaktə', locale)}
        </a>
      </div>
    </AdminOnly>
  );
}

/**
 * F4.3/F4.9b — boş blok, YALNIZ təsdiqlənmiş admin sessiyasında görünür
 * (bax çağıran yerdəki <AdminOnly> örtüyü). check:gaps hansı blokun boş
 * olduğunu terminalda deyir, amma səhifədə görünmürdü — məhz doldurulmalı
 * yerdə keçid yox idi. İctimai görünüşdə boş blok HEÇ VAXT render olunmur
 * (yuxarıdakı əsas qayda dəyişmir).
 *
 * F4.8e — real (dolu) blokla qarışmasın deyə BlockTitle-dan AYRI render
 * olunur: kəsik çərçivə/solğun fon (.un-block--empty, 36-unit.css) +
 * başlıqda «yalnız admin» nişanı.
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
      <div className="un-block-head">
        <h2 className="un-block-title">
          {title}
          <span className="un-admin-badge">{tr('yalnız admin', locale)}</span>
        </h2>
        <a
          className="un-admin-edit"
          href={adminUrl('api::unit.unit', documentId, locale)}
          target="_blank"
          rel="noreferrer"
        >
          {tr('redaktə', locale)}
        </a>
      </div>
      <p className="un-block-empty-note">{tr('Bu blok boşdur.', locale)}</p>
    </section>
  );
}

// F4.4/F4.8a — 1200 simvoldan uzun `mission`/`about`/`functions`/`services`/
// `results` mətni akkordeon arxasında açılır, ZOLAĞIN ÖZÜ h2 səviyyəli
// başlıqdır. Qısa mətn adi <h2>+mətndir, akkordeon yoxdur — hər iki halda
// HƏR SAHƏ ÖZ BAŞLIĞINI DAŞIYIR, bloklar özləri ayrıca başlıq göstərmir
// (əvvəl ad iki dəfə yazılırdı: həm blokun h2-si, həm akkordeon zolağı).
const LONG_TEXT_THRESHOLD = 1200;

function longText(raw: string, html: string, label: string) {
  if (raw.length <= LONG_TEXT_THRESHOLD) {
    return (
      <>
        <h2 className="un-block-title">{label}</h2>
        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      </>
    );
  }
  return <ExpandBlock html={html} label={label} />;
}

/** Kart toruna çevrilən sahələr (functions/services) üçün: kartlar da öz
 * başlığını daşıyır, sadəcə uzunluğa görə akkordeona düşmür (F4.4-dəki
 * kart toru davranışı SAXLANILIB). */
function fieldBlock(raw: string, html: string, cards: FnCard[] | null, label: string) {
  if (cards) {
    return (
      <>
        <h2 className="un-block-title">{label}</h2>
        <FnCardGrid cards={cards} />
      </>
    );
  }
  return longText(raw, html, label);
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

/**
 * F4.7c/F4.9d — e-poçt `overflow-wrap: anywhere` ilə söz ortasından qırılırdı
 * («zaur.aziz@add / a.edu.az»). `word-break: break-all` da işlədilmir (eyni
 * problem). `<wbr>` YALNIZ `@`-dan sonra qırılma nöqtəsi əlavə edir, CSS-də
 * `overflow-wrap: normal` ilə birlikdə (bax 36-unit.css .un-head-contact dd)
 * qırılma YALNIZ bu yerdə baş verir.
 */
function EmailWrap({ email }: { email: string }) {
  const at = email.indexOf('@');
  if (at === -1) return <>{email}</>;
  return (
    <>
      {email.slice(0, at + 1)}
      <wbr />
      {email.slice(at + 1)}
    </>
  );
}

/** F4.9a — yan panelin kompakt heyət sətri: monoqram/foto (28px) + ad + vəzifə. */
function StaffMiniRow({
  p,
  unitName,
  locale,
}: {
  p: Person & { photo: StrapiMedia | null };
  unitName: string;
  locale: Locale;
}) {
  const role = (p.roles ?? []).find((r) => r.unitName === unitName);
  const post = role?.position || p.position || '';
  const photo = mediaUrl(p.photo);
  const initials = (p.displayName || p.name || '—')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <li className="un-staff-mini">
      <Link href={`/${locale}/emekdas/${p.slug}`} className="un-staff-mini-pic" aria-hidden="true" tabIndex={-1}>
        {photo ? <img src={photo} alt="" loading="lazy" /> : <span className="un-staff-mini-mono">{initials}</span>}
      </Link>
      <div className="un-staff-mini-body">
        <Link href={`/${locale}/emekdas/${p.slug}`} className="un-staff-mini-name">
          {p.displayName || p.name}
        </Link>
        {post ? <div className="un-staff-mini-post">{post}</div> : null}
      </div>
    </li>
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
    getUnitStaff(unit.slug, unit.name).catch(() => [] as (Person & { photo: StrapiMedia | null })[]),
    getUnitArticles(unit.slug, locale, 6),
    getUnitAnnouncements(unit.slug, locale, 6),
  ]);

  const crumbs = buildCrumbs(unit, allUnits);

  const hesabat = [...docs.filter((d) => d.category === 'hesabat')].sort(
    (a, b) => (b.year ?? 0) - (a.year ?? 0),
  );

  // F4.7d — yan panelin «Sənədlər» bölməsi: hesabat İSTİSNA (əsas sütunda
  // qalır, F4.6d), qalan kateqoriyalar sıra üzrə qruplaşdırılır. 5-dən
  // çoxdursa ilk 5 göstərilir, qalanı /senedler səhifəsindən görünür.
  const sideDocsAll = [...docs]
    .filter((d) => d.category !== 'hesabat')
    .sort((a, b) => DOC_CATEGORY_ORDER.indexOf(a.category) - DOC_CATEGORY_ORDER.indexOf(b.category));
  const SIDE_DOC_LIMIT = 5;
  const sideDocsTruncated = sideDocsAll.length > SIDE_DOC_LIMIT;
  const sideDocGroups = groupDocsByCategory(sideDocsAll.slice(0, SIDE_DOC_LIMIT));

  // F4.8c — heyət siyahısında rəhbər TƏKRARLANMIR (yan paneldə onsuz da
  // var, bax .un-side rəhbər kartı) — `unit.head.documentId` ilə süzülür,
  // sıralama sadə əlifba (name, localeCompare 'az' MƏCBURİ). Fakt zolağının
  // "Heyət" sayı isə TAM heyəti göstərir (bax `staff.length`, aşağıda).
  const staffList = staff
    .filter((p) => !unit.head || p.documentId !== unit.head.documentId)
    .sort((a, b) => azSort(a.name ?? '', b.name ?? ''));

  const headPhoto = unit.head ? mediaUrl(unit.head.photo) : null;

  const contactHas = Boolean(unit.building || unit.floor || unit.room || unit.phoneExt || unit.email);
  const block1Has = Boolean(unit.mission || unit.about);
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

  // F4.7a — başlıqlar bölmə tipindən törəyir (məs. "Mərkəz haqqında",
  // "Kafedranın heyəti"); uyğunluq yoxdursa fallback.
  const unitT = unitType(unit.name);
  const blockTitle1 = unitT ? `${unitT.nom} ${tr('haqqında', locale)}` : tr('Haqqında', locale);
  // F4.8b — missiya AYRICA başlıq daşıyır (genitiv), "haqqında" ilə qarışmır.
  const missionTitle = unitT ? `${unitT.gen} ${tr('missiyası', locale)}` : tr('Missiya', locale);
  const blockTitle3 = tr('Fəaliyyət sahəsi', locale);
  const blockTitle4 = tr('Faydalı linklər', locale);
  const blockTitle5 = tr('Görülmüş işlər və nəticələr', locale);
  const blockTitle6 = tr('Əlaqəli xəbərlər', locale);
  // F4.9a — heyət yan panelə keçib, artıq "blok" deyil (bax .un-side); əsas
  // sütunda 5 blok qalır (1/3/4/5/6 — 2 saxlanılan nömrələmə deyil, sadəcə
  // əvvəlki adlar).
  const blockStatus = [
    { has: block1Has, title: blockTitle1 },
    { has: block3Has, title: blockTitle3 },
    { has: block4Has, title: blockTitle4 },
    { has: block5Has, title: blockTitle5 },
    { has: block6Has, title: blockTitle6 },
  ];
  const openBlockCount = blockStatus.filter((b) => b.has).length;
  const closedBlockTitles = blockStatus.filter((b) => !b.has).map((b) => b.title);

  // F4.4/F4.9b — ağ/boz ritm YALNIZ ictimai görünüşdə faktiki render olunan
  // bloklara görə sayılır. Admin boş-blok görünüşü artıq server-də deyil,
  // klient adasında qərarlaşır (kimlik naməlum ola bilər) — tint hesabı
  // bunu gözləyə bilməz, ona görə YALNIZ `b.has`. Boş blokun tint-i vizual
  // olaraq önəmsizdir: .un-block--empty öz fonunu üstələyir (F4.8e).
  let tintCursor = 0;
  const blockTint = blockStatus.map((b) => {
    if (!b.has) return false;
    const tint = tintCursor % 2 === 1;
    tintCursor++;
    return tint;
  });
  const blockClass = (n: 0 | 1 | 2 | 3 | 4) => 'un-block' + (blockTint[n] ? ' un-block--tint' : '');

  // F4.5a/F4.7d — sağ yan sütun: rəhbər · əlaqə · qəbul saatları · onlayn
  // xidmətlər · tabe olduğu qurum · sənədlər. Heç biri yoxdursa sütun
  // render olunmur, səhifə TƏK SÜTUN olur (bax .un-layout--single,
  // 36-unit.css). Düzəliş təklifi (CorrectionIsland) BU statusa DAXİL
  // DEYİL — o, sütun varsa altına, yoxdursa əsas sütuna keçir (aşağıda).
  const sideHas = Boolean(
    unit.head ||
      staffList.length ||
      contactHas ||
      unit.receptionHours ||
      unit.onlineServices.length ||
      unit.parent ||
      sideDocsAll.length,
  );

  // F4.5b — fakt zolağı: otaq · daxili telefon · qəbul saatları · heyət sayı
  // · alt bölmə sayı. Uydurma metrika yoxdur, YALNIZ mövcud dəyərlər — bir
  // dənə də yoxdursa zolaq render olunmur.
  const factsHas = Boolean(
    unit.room || unit.phoneExt || unit.receptionHours || staff.length || subunits.length,
  );

  const aboutHtml = unit.about ? await marked.parse(unit.about) : '';
  const functionsHtml = unit.functions ? await marked.parse(unit.functions) : '';
  const servicesHtml = unit.services ? await marked.parse(unit.services) : '';
  const resultsHtml = unit.results ? await marked.parse(unit.results) : '';
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
                {staff.length ? (
                  <li className="un-fact">
                    <i className="ti ti-users" aria-hidden="true" />
                    <span className="un-fact-k">{tr('Heyət', locale)}</span>
                    <span className="un-fact-v">{staff.length}</span>
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
          {/* F4.9b — admin bəzəkləri klient adasında (bax _components/AdminGate.tsx):
              server statik qalır, kimlik yoxlaması hidrasiyadan sonra baş verir. */}
          <AdminProvider>
          <AdminOnly>
            <div className="un-admin-status">
              {tr('Bloklar', locale)}: {openBlockCount}/{blockStatus.length}
              {closedBlockTitles.length ? ' · ' + tr('boş', locale) + ': ' + closedBlockTitles.join(', ') : ''}
            </div>
          </AdminOnly>

          {/* F4.5a — iki sütun: əsas mətn + yapışqan yan sütun (rəhbər/əlaqə/
              qəbul saatları/əsasnamə/onlayn xidmətlər). Yan sütunda heç nə
              yoxdursa (.un-layout--single) tək sütuna düşür. */}
          <div className={'un-layout' + (sideHas ? '' : ' un-layout--single')}>
            <div className="un-main">
              {/* ── 1. «<Tipin> missiyası» (F4.8b) + «<Tip> haqqında» — hər sahə
                  öz başlığını daşıyır, blokun ayrıca h2-si yoxdur (F4.8a) ── */}
              {block1Has ? (
                <section className={blockClass(0)}>
                  <AdminEditRow documentId={unit.documentId} locale={locale} />
                  {unit.mission ? (
                    <>
                      <h2 className="un-block-title">{missionTitle}</h2>
                      <p className="un-mission">{unit.mission}</p>
                    </>
                  ) : null}
                  {unit.about ? longText(unit.about, aboutHtml, blockTitle1) : null}
                </section>
              ) : (
                <AdminOnly>
                  <EmptyBlock title={blockTitle1} documentId={unit.documentId} locale={locale} tint={blockTint[0]} />
                </AdminOnly>
              )}

              {/* ── Fəaliyyət sahəsi / Xidmətlər — hər sahə öz başlığını
                  daşıyır (F4.8a), sual formaları silindi (F4.7a) ── */}
              {block3Has ? (
                <section className={blockClass(1)}>
                  <AdminEditRow documentId={unit.documentId} locale={locale} />
                  {unit.functions ? fieldBlock(unit.functions, functionsHtml, functionCards, blockTitle3) : null}
                  {unit.services ? fieldBlock(unit.services, servicesHtml, serviceCards, tr('Xidmətlər', locale)) : null}
                </section>
              ) : (
                <AdminOnly>
                  <EmptyBlock title={blockTitle3} documentId={unit.documentId} locale={locale} tint={blockTint[1]} />
                </AdminOnly>
              )}

              {/* ── Faydalı linklər (əlaqə/onlayn xidmətlər yan sütuna keçib) ── */}
              {block4Has ? (
                <section className={blockClass(2)}>
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
              ) : (
                <AdminOnly>
                  <EmptyBlock title={blockTitle4} documentId={unit.documentId} locale={locale} tint={blockTint[2]} />
                </AdminOnly>
              )}

              {/* ── Görülmüş işlər və nəticələr (F4.6d: mətn + varsa PDF-lər;
                  F4.8a: mətn öz başlığını daşıyır, blokun ayrıca h2-si yoxdur) ── */}
              {block5Has ? (
                <section className={blockClass(3)}>
                  <AdminEditRow documentId={unit.documentId} locale={locale} />
                  {unit.results ? longText(unit.results, resultsHtml, blockTitle5) : null}
                  {hesabat.length ? (
                    <>
                      <div className="un-sub-title">{tr('Hesabat sənədləri', locale)}</div>
                      <DocList docs={hesabat} locale={locale} />
                    </>
                  ) : null}
                </section>
              ) : (
                <AdminOnly>
                  <EmptyBlock title={blockTitle5} documentId={unit.documentId} locale={locale} tint={blockTint[3]} />
                </AdminOnly>
              )}

              {/* ── Əlaqəli xəbərlər (F4.6e: hesabatdan ayrı öz bloku; elanlar
                  varsa eyni blokda qısa siyahı kimi). Xəbər şəkilli (kiçik üz
                  qabığı şəkli), elan qısa/tarixli/şəkilsiz qalır (F4.5c). ── */}
              {block6Has ? (
                <section className={blockClass(4)}>
                  <BlockTitle title={blockTitle6} documentId={unit.documentId} locale={locale} />
                  {articles.length ? (
                    <ul className="un-row-list">
                      {articles.map((a) => {
                        const thumb = mediaUrl(a.cover);
                        return (
                          <li key={a.documentId} className={'un-row' + (thumb ? ' un-row--news' : '')}>
                            {thumb ? (
                              <span className="un-row-thumb">
                                <img src={thumb} alt="" loading="lazy" />
                              </span>
                            ) : null}
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
              ) : (
                <AdminOnly>
                  <EmptyBlock title={blockTitle6} documentId={unit.documentId} locale={locale} tint={blockTint[4]} />
                </AdminOnly>
              )}

              <AdminOnly>
                <div className="un-block" style={{ paddingTop: 0 }}>
                  <a href={adminUrl('api::unit.unit', unit.documentId, locale)} target="_blank" rel="noreferrer" className="un-link-btn">
                    {tr('Redaktə', locale)}: {tr('bölmə', locale)}
                  </a>
                </div>
              </AdminOnly>
            </div>

            {sideHas ? (
              <aside className="un-side">
                {/* F4.9d — rəhbər kartı: üst sətir foto(64px kvadrat)+vəzifə,
                    altında ad, sonra e-poçt/telefon (etiket üstdə, dəyər
                    altda), ən altda nazik ayırıcı + solğun redaktə. */}
                {unit.head ? (
                  <div>
                    <div className="un-sub-title">{tr('Rəhbər', locale)}</div>
                    <div className="un-head-card">
                      <div className="un-head-top">
                        <Link href={`/${locale}/emekdas/${unit.head.slug}`} className="un-head-plate">
                          {headPhoto ? (
                            <img src={headPhoto} alt="" loading="lazy" />
                          ) : (
                            <span className="un-head-mono" aria-hidden="true">
                              {(unit.head.displayName || unit.head.name || '—').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                            </span>
                          )}
                        </Link>
                        {unit.head.position ? <div className="un-head-position">{unit.head.position}</div> : null}
                      </div>
                      <Link href={`/${locale}/emekdas/${unit.head.slug}`} className="un-head-name">
                        {unit.head.displayName || unit.head.name}
                      </Link>
                      <dl className="un-head-contact">
                        {unit.head.email ? (
                          <div>
                            <dt>{tr('E-poçt', locale)}</dt>
                            <dd><a href={`mailto:${unit.head.email}`}><EmailWrap email={unit.head.email} /></a></dd>
                          </div>
                        ) : null}
                        {unit.head.phone ? (
                          <div>
                            <dt>{tr('Telefon', locale)}</dt>
                            <dd><a href={`tel:${unit.head.phone.replace(/[^\d+]/g, '')}`}>{unit.head.phone}</a></dd>
                          </div>
                        ) : null}
                      </dl>
                      <AdminOnly>
                        <div className="un-head-admin">
                          <span>{tr('Redaktə', locale)}:</span>
                          <a href={adminUrl('api::person.person', unit.head.documentId, locale)} target="_blank" rel="noreferrer">
                            {tr('şəxs', locale)}
                          </a>
                        </div>
                      </AdminOnly>
                    </div>
                  </div>
                ) : null}

                {/* F4.9a — heyət yan panelə keçib (Rəhbərdən sonra, Əlaqədən
                    əvvəl). Sticky panel ekrandan uzun olmasın deyə ilk 6-dan
                    sonrakılar «Hamısı (N)» arxasında (bax StaffReveal). */}
                {staffList.length ? (
                  <div>
                    <div className="un-sub-title">{tr('Heyət', locale)}</div>
                    <ul className="un-staff-mini-list">
                      {staffList.slice(0, 6).map((p) => (
                        <StaffMiniRow key={p.documentId} p={p} unitName={unit.name} locale={locale} />
                      ))}
                    </ul>
                    {staffList.length > 6 ? (
                      <StaffReveal moreLabel={`${tr('Hamısı', locale)} (${staffList.length})`}>
                        <ul className="un-staff-mini-list">
                          {staffList.slice(6).map((p) => (
                            <StaffMiniRow key={p.documentId} p={p} unitName={unit.name} locale={locale} />
                          ))}
                        </ul>
                      </StaffReveal>
                    ) : null}
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

                {/* F4.7d — tabe olduğu qurum, slug hazırdır (unit.parent). */}
                {unit.parent ? (
                  <div>
                    <div className="un-sub-title">{tr('Tabe olduğu qurum', locale)}</div>
                    <Link href={`/${locale}/struktur/${unit.parent.slug}`} className="un-link-btn">
                      <i className="ti ti-sitemap" aria-hidden="true" />
                      {unit.parent.name}
                    </Link>
                  </div>
                ) : null}

                {/* F4.7d — hesabatdan başqa bütün sənəd kateqoriyaları, sıraya
                    görə qruplaşdırılıb. 5-dən çoxdursa ilk 5 + «Hamısı» keçidi. */}
                {sideDocGroups.length ? (
                  <div>
                    <div className="un-sub-title">{tr('Sənədlər', locale)}</div>
                    {sideDocGroups.map((g) => (
                      <div key={g.cat}>
                        <div className="un-doc-cat">{tr(DOC_CATEGORY_LABEL_AZ[g.cat], locale)}</div>
                        <DocList docs={g.items} locale={locale} />
                      </div>
                    ))}
                    {sideDocsTruncated ? (
                      <Link href={`/${locale}/struktur/${unit.slug}/senedler`} className="un-link-btn">
                        {tr('Hamısı', locale)}
                      </Link>
                    ) : null}
                  </div>
                ) : null}

                {/* F4.7d — «Bu səhifədə səhv gördünüz?» yan panelin ən altına
                    köçürülüb. Yan panel yoxdursa (sideHas false) aşağıda əsas
                    sütunda fallback edir. */}
                <CorrectionIsland
                  targetType="general"
                  targetSlug={slug}
                  title={unit.name}
                  locale={locale}
                  labels={correctionLabels}
                />
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
            {!sideHas ? (
              <CorrectionIsland
                targetType="general"
                targetSlug={slug}
                title={unit.name}
                locale={locale}
                labels={correctionLabels}
              />
            ) : null}
          </div>
          </AdminProvider>
        </div>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
