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
  type ReceptionDay,
  type ReceptionSlot,
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

// F4.11c — `receptionSlots` həftə sırası (bax unit/reception-slot.json enum-u,
// EYNİ sıra). Əlifba ilə YOX — "Şənbə" (Ə-dən sonra) əlifba sırasında sona
// düşərdi, amma həftədə altıncı gündür.
const RECEPTION_DAY_ORDER: ReceptionDay[] = [
  'bazar_ertesi',
  'cerşenbe_axsami',
  'cerşenbe',
  'cume_axsami',
  'cume',
  'senbe',
];
const RECEPTION_DAY_FULL: Record<ReceptionDay, string> = {
  bazar_ertesi: 'Bazar ertəsi',
  cerşenbe_axsami: 'Çərşənbə axşamı',
  cerşenbe: 'Çərşənbə',
  cume_axsami: 'Cümə axşamı',
  cume: 'Cümə',
  senbe: 'Şənbə',
};
// F4.11c — ARDICIL BİRLƏŞDİRİLMİŞ sıra üçün qısaldılmış ad («B.e–Cümə»);
// artıq bir sözdən ibarət günlər (Çərşənbə/Cümə/Şənbə) qısalmır.
const RECEPTION_DAY_SHORT: Record<ReceptionDay, string> = {
  bazar_ertesi: 'B.e',
  cerşenbe_axsami: 'Ç.a',
  cerşenbe: 'Çərşənbə',
  cume_axsami: 'C.a',
  cume: 'Cümə',
  senbe: 'Şənbə',
};

function fmtReceptionTime(t: string | null): string {
  return t ? t.slice(0, 5) : '';
}

interface ReceptionRow { label: string; time: string; note: string | null }

/**
 * F4.11c — həftə sırasına düzür, ARDICIL eyni saatlı (və eyni qeydli)
 * günləri BİRLƏŞDİRİR («B.e–Cümə 09:00–17:00»). Fasilə (aradan bir gün
 * çıxarsa) birləşməni pozur. Tək gün qısaltma ALMIR, tam ad göstərir.
 */
function buildReceptionRows(slots: ReceptionSlot[], locale: Locale): ReceptionRow[] {
  const bySlot = new Map(slots.map((s) => [s.day, s]));
  const ordered = RECEPTION_DAY_ORDER.filter((d) => bySlot.has(d)).map((d) => bySlot.get(d) as ReceptionSlot);
  const rows: ReceptionRow[] = [];
  let i = 0;
  while (i < ordered.length) {
    let j = i;
    while (
      j + 1 < ordered.length &&
      RECEPTION_DAY_ORDER.indexOf(ordered[j + 1].day) === RECEPTION_DAY_ORDER.indexOf(ordered[j].day) + 1 &&
      ordered[j + 1].timeFrom === ordered[i].timeFrom &&
      ordered[j + 1].timeTo === ordered[i].timeTo &&
      (ordered[j + 1].note ?? '') === (ordered[i].note ?? '')
    ) {
      j++;
    }
    const start = ordered[i];
    const end = ordered[j];
    const label =
      j > i
        ? `${tr(RECEPTION_DAY_SHORT[start.day], locale)}–${tr(RECEPTION_DAY_SHORT[end.day], locale)}`
        : tr(RECEPTION_DAY_FULL[start.day], locale);
    rows.push({
      label,
      time: `${fmtReceptionTime(start.timeFrom)}–${fmtReceptionTime(start.timeTo)}`,
      note: start.note,
    });
    i = j + 1;
  }
  return rows;
}

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

/**
 * F4.10 — akkordeon qrupu (.un-expand-group) daxilində boş sahə, YALNIZ
 * admin sessiyasında (bax çağıran yerdəki <AdminOnly>). EmptyBlock-dan
 * fərqli olaraq bounded/tinted section YOX — qrupun içindəki digər
 * .un-expand kartları ilə eyni qabıqda, sadəcə kəsik sərhədlə (.un-expand--empty).
 */
function EmptyExpandItem({ title, documentId, locale }: { title: string; documentId: string; locale: Locale }) {
  return (
    <div className="un-expand un-expand--empty">
      <div className="un-expand-empty-head">
        <span className="un-expand-empty-title">
          {title}
          <span className="un-admin-badge">{tr('yalnız admin', locale)}</span>
        </span>
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
    </div>
  );
}

// F4.10 — `about`/`functions`/`services`/`results` artıq VAHİD akkordeon
// qrupudur (bax UnitPage-dəki un-expand-group), uzunluqdan asılı olmayaraq
// HAMISI ExpandBlock qabığında göstərilir (əvvəlki 1200-simvol eşiyi və
// qısa-mətn/akkordeon ayrımı LƏĞV EDİLDİ — "eyni konteyner, eyni davranış"
// tələbi qarışıq görünüşə yol vermir).

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

  // F4.11b — «Hüquqi sənədlər» əsas sütun bloku: eyni `sideDocsAll` (hesabat
  // İSTİSNA), amma KƏSİLMƏDƏN — yan panelin 5-lik limiti bura tətbiq olunmur.
  const legalDocGroups = groupDocsByCategory(sideDocsAll);
  const legalDocsHas = Boolean(legalDocGroups.length);

  // F4.8c — heyət siyahısında rəhbər TƏKRARLANMIR (yan paneldə onsuz da
  // var, bax .un-side rəhbər kartı) — `unit.head.documentId` ilə süzülür,
  // sıralama sadə əlifba (name, localeCompare 'az' MƏCBURİ). Fakt zolağının
  // "Heyət" sayı isə TAM heyəti göstərir (bax `staff.length`, aşağıda).
  const staffList = staff
    .filter((p) => !unit.head || p.documentId !== unit.head.documentId)
    .sort((a, b) => azSort(a.name ?? '', b.name ?? ''));

  const headPhoto = unit.head ? mediaUrl(unit.head.photo) : null;

  const contactHas = Boolean(unit.building || unit.floor || unit.room || unit.phoneExt || unit.email);
  // F4.11c — `receptionSlots` doludursa köhnə `receptionHours` sətrinin ƏVƏZİNƏ göstərilir.
  const receptionRows = buildReceptionRows(unit.receptionSlots, locale);
  const missionHas = Boolean(unit.mission);
  const aboutHas = Boolean(unit.about);
  const functionsHas = Boolean(unit.functions);
  const servicesHas = Boolean(unit.services);
  const block4Has = Boolean(unit.links.length);
  const subunits = [...unit.children].sort(
    (a, b) => (a.sortOrder ?? 100) - (b.sortOrder ?? 100) || azSort(a.name, b.name),
  );
  // F4.5c — alt bölmələr artıq nəticələr sahəsinin İÇİNDƏ deyil (səhifənin
  // sonuna öz kart cərgəsinə keçib, aşağıda) — ona görə "var" statusu
  // subunits-i SAYMIR, əks halda başlıq görünüb altı boş qalardı.
  // F4.6d — hesabat bloku ikiyə bölünür: nəticə mətni (unit.results) + varsa
  // PDF sənədləri.
  // F4.6e — xəbər/elan artıq bu sahədə deyil, ayrıca "Əlaqəli xəbərlər" blokundadır.
  const resultsHas = Boolean(unit.results || hesabat.length);
  // F4.11d — akkordeon qrupunun BEŞİNCİ (sonuncu) elementi.
  const strategyHas = Boolean(unit.strategy);
  // F4.11e — «Açıq vəzifələr» qısa siyahısı və akkordeon qrupundan AYRI FAQ bloku.
  const vacanciesHas = Boolean(unit.vacancies.length);
  const faqHas = Boolean(unit.faq.length);
  // F4.10/F4.11d — «Haqqında»/«Fəaliyyət sahəsi»/«Xidmətlər»/«Görülmüş işlər
  // və nəticələr»/«Strateji hədəflər üzrə öhdəliklər» VAHİD akkordeon
  // qrupudur (bax .un-expand-group aşağıda); qrup ictimai görünürsə bu 5
  // sahədən ƏN AZI biri doludur.
  const groupHas = aboutHas || functionsHas || servicesHas || resultsHas || strategyHas;
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
  const blockTitleLegal = tr('Hüquqi sənədlər', locale);
  const blockTitleStrategy = tr('Strateji hədəflər üzrə öhdəliklər', locale);
  const blockTitleVacancies = tr('Açıq vəzifələr', locale);
  const blockTitleFaq = tr('Tez-tez verilən suallar', locale);
  // F4.9a — heyət yan panelə keçib, artıq "blok" deyil (bax .un-side).
  // F4.10/F4.11d/F4.11e — admin diaqnostikası indi 10 AYRI sahə sayır (əvvəl
  // 5 birləşdirilmiş blok idi: missiya+haqqında bir, fəaliyyət+xidmət bir) —
  // CMS-də konkret hansı sahənin boş olduğunu göstərir.
  const fieldStatus = [
    { has: missionHas, title: missionTitle },
    { has: aboutHas, title: blockTitle1 },
    { has: functionsHas, title: blockTitle3 },
    { has: servicesHas, title: tr('Xidmətlər', locale) },
    { has: resultsHas, title: blockTitle5 },
    { has: strategyHas, title: blockTitleStrategy },
    { has: block4Has, title: blockTitle4 },
    { has: legalDocsHas, title: blockTitleLegal },
    { has: vacanciesHas, title: blockTitleVacancies },
    { has: faqHas, title: blockTitleFaq },
    { has: block6Has, title: blockTitle6 },
  ];
  const openBlockCount = fieldStatus.filter((f) => f.has).length;
  const closedBlockTitles = fieldStatus.filter((f) => !f.has).map((f) => f.title);

  // F4.4/F4.9b/F4.10 — ağ/boz ritm YALNIZ ictimai görünüşdə faktiki render
  // olunan bloklara görə sayılır (missiya/qrup/linklər/xəbərlər). Akkordeon
  // qrupu (F4.10: "F4.5b tint bu qrupa tətbiq olunmur") HEÇ VAXT tint almır,
  // amma növbəni İRƏLİ APARIR ki, ondan sonrakı bloklar (linklər/xəbərlər)
  // öz alternasiya növbəsini itirməsin. Admin boş-blok görünüşü artıq
  // server-də deyil, klient adasında qərarlaşır — tint hesabı bunu gözləyə
  // bilməz, ona görə YALNIZ ictimai `has`. Boş blokun tint-i vizual olaraq
  // önəmsizdir: .un-block--empty öz fonunu üstələyir (F4.8e).
  type TopKey = 'mission' | 'group' | 'links' | 'legalDocs' | 'vacancies' | 'faq' | 'news';
  const topSections: { key: TopKey; has: boolean; tintable: boolean }[] = [
    { key: 'mission', has: missionHas, tintable: true },
    { key: 'group', has: groupHas, tintable: false },
    { key: 'links', has: block4Has, tintable: true },
    { key: 'legalDocs', has: legalDocsHas, tintable: true },
    { key: 'vacancies', has: vacanciesHas, tintable: true },
    { key: 'faq', has: faqHas, tintable: true },
    { key: 'news', has: block6Has, tintable: true },
  ];
  let tintCursor = 0;
  const tintByKey = {} as Record<TopKey, boolean>;
  for (const s of topSections) {
    if (!s.has) continue;
    tintByKey[s.key] = s.tintable && tintCursor % 2 === 1;
    tintCursor++;
  }
  const blockClass = (key: TopKey) => 'un-block' + (tintByKey[key] ? ' un-block--tint' : '');

  // F4.5a/F4.7d — sağ yan sütun: rəhbər · əlaqə · qəbul saatları · onlayn
  // xidmətlər · tabe olduğu qurum · sənədlər. Heç biri yoxdursa sütun
  // render olunmur, səhifə TƏK SÜTUN olur (bax .un-layout--single,
  // 36-unit.css). Düzəliş təklifi (CorrectionIsland) BU statusa DAXİL
  // DEYİL — o, sütun varsa altına, yoxdursa əsas sütuna keçir (aşağıda).
  const sideHas = Boolean(
    unit.head ||
      staffList.length ||
      contactHas ||
      receptionRows.length ||
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
  const strategyHtml = unit.strategy ? await marked.parse(unit.strategy) : '';
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
            {/* F4.11d — yaranma tarixi və əsası, adın altında kiçik/solğun sətir. */}
            {unit.establishedNote ? <p className="un-established-note">{unit.establishedNote}</p> : null}
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
              {tr('Bloklar', locale)}: {openBlockCount}/{fieldStatus.length}
              {closedBlockTitles.length ? ' · ' + tr('boş', locale) + ': ' + closedBlockTitles.join(', ') : ''}
            </div>
          </AdminOnly>

          {/* F4.5a — iki sütun: əsas mətn + yapışqan yan sütun (rəhbər/əlaqə/
              qəbul saatları/əsasnamə/onlayn xidmətlər). Yan sütunda heç nə
              yoxdursa (.un-layout--single) tək sütuna düşür. */}
          <div className={'un-layout' + (sideHas ? '' : ' un-layout--single')}>
            <div className="un-main">
              {/* ── Missiya (F4.8b) — akkordeon qrupundan KƏNAR, tək cümləlik
                  ləp (bax .un-mission), F4.10-un dörd sahəsinə daxil deyil. ── */}
              {missionHas ? (
                <section className={blockClass('mission')}>
                  <AdminEditRow documentId={unit.documentId} locale={locale} />
                  <h2 className="un-block-title">{missionTitle}</h2>
                  <p className="un-mission">{unit.mission}</p>
                </section>
              ) : null}

              {/* ── F4.10/F4.11d: Haqqında / Fəaliyyət sahəsi / Xidmətlər /
                  Görülmüş işlər və nəticələr / Strateji hədəflər üzrə
                  öhdəliklər — VAHİD akkordeon qrupu. Eyni konteyner
                  (ExpandBlock/.un-expand), eyni davranış, aralarında bölmə
                  ayırıcısı yoxdur, F4.5b tint tətbiq olunmur (bax
                  .un-expand-group, 36-unit.css). Hər sahə müstəqil aç/bağla —
                  biri digərini bağlamır. ── */}
              {groupHas ? (
                <section className="un-block un-accordion-group">
                  <AdminEditRow documentId={unit.documentId} locale={locale} />
                  <div className="un-expand-group">
                    {aboutHas ? (
                      <ExpandBlock label={blockTitle1}>
                        <div className="prose" dangerouslySetInnerHTML={{ __html: aboutHtml }} />
                      </ExpandBlock>
                    ) : (
                      <AdminOnly>
                        <EmptyExpandItem title={blockTitle1} documentId={unit.documentId} locale={locale} />
                      </AdminOnly>
                    )}
                    {functionsHas ? (
                      <ExpandBlock label={blockTitle3}>
                        {functionCards ? (
                          <FnCardGrid cards={functionCards} />
                        ) : (
                          <div className="prose" dangerouslySetInnerHTML={{ __html: functionsHtml }} />
                        )}
                      </ExpandBlock>
                    ) : (
                      <AdminOnly>
                        <EmptyExpandItem title={blockTitle3} documentId={unit.documentId} locale={locale} />
                      </AdminOnly>
                    )}
                    {servicesHas ? (
                      <ExpandBlock label={tr('Xidmətlər', locale)}>
                        {serviceCards ? (
                          <FnCardGrid cards={serviceCards} />
                        ) : (
                          <div className="prose" dangerouslySetInnerHTML={{ __html: servicesHtml }} />
                        )}
                      </ExpandBlock>
                    ) : (
                      <AdminOnly>
                        <EmptyExpandItem title={tr('Xidmətlər', locale)} documentId={unit.documentId} locale={locale} />
                      </AdminOnly>
                    )}
                    {resultsHas ? (
                      <ExpandBlock label={blockTitle5}>
                        {unit.results ? (
                          <div className="prose" dangerouslySetInnerHTML={{ __html: resultsHtml }} />
                        ) : null}
                        {hesabat.length ? (
                          <>
                            <div className="un-sub-title">{tr('Hesabat sənədləri', locale)}</div>
                            <DocList docs={hesabat} locale={locale} />
                          </>
                        ) : null}
                      </ExpandBlock>
                    ) : (
                      <AdminOnly>
                        <EmptyExpandItem title={blockTitle5} documentId={unit.documentId} locale={locale} />
                      </AdminOnly>
                    )}
                    {strategyHas ? (
                      <ExpandBlock label={blockTitleStrategy}>
                        <div className="prose" dangerouslySetInnerHTML={{ __html: strategyHtml }} />
                      </ExpandBlock>
                    ) : (
                      <AdminOnly>
                        <EmptyExpandItem title={blockTitleStrategy} documentId={unit.documentId} locale={locale} />
                      </AdminOnly>
                    )}
                  </div>
                </section>
              ) : (
                <AdminOnly>
                  <section className="un-block un-accordion-group">
                    <AdminEditRow documentId={unit.documentId} locale={locale} />
                    <div className="un-expand-group">
                      <EmptyExpandItem title={blockTitle1} documentId={unit.documentId} locale={locale} />
                      <EmptyExpandItem title={blockTitle3} documentId={unit.documentId} locale={locale} />
                      <EmptyExpandItem title={tr('Xidmətlər', locale)} documentId={unit.documentId} locale={locale} />
                      <EmptyExpandItem title={blockTitle5} documentId={unit.documentId} locale={locale} />
                      <EmptyExpandItem title={blockTitleStrategy} documentId={unit.documentId} locale={locale} />
                    </div>
                  </section>
                </AdminOnly>
              )}

              {/* ── Faydalı linklər (əlaqə/onlayn xidmətlər yan sütuna keçib).
                  F4.10 — əvvəllər Fəaliyyət/Xidmətlər ilə Nəticələr arasında
                  idi, akkordeon qrupunu ikiyə bölürdü; indi qrupdan SONRA. ── */}
              {block4Has ? (
                <section className={blockClass('links')}>
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
                  <EmptyBlock title={blockTitle4} documentId={unit.documentId} locale={locale} tint={tintByKey.links} />
                </AdminOnly>
              )}

              {/* ── F4.11b: Hüquqi sənədlər — `unit.documents`, hesabat İSTİSNA
                  (F4.6d-də qalır), kateqoriyaya görə qruplaşdırılıb (bax
                  DocList.tsx). Faylı olmayan sənəd DocList içində süzülür. ── */}
              {legalDocsHas ? (
                <section className={blockClass('legalDocs')}>
                  <BlockTitle title={blockTitleLegal} documentId={unit.documentId} locale={locale} />
                  {legalDocGroups.map((g) => (
                    <div key={g.cat}>
                      <div className="un-sub-title">{tr(DOC_CATEGORY_LABEL_AZ[g.cat], locale)}</div>
                      <DocList docs={g.items} locale={locale} />
                    </div>
                  ))}
                </section>
              ) : (
                <AdminOnly>
                  <EmptyBlock title={blockTitleLegal} documentId={unit.documentId} locale={locale} tint={tintByKey.legalDocs} />
                </AdminOnly>
              )}

              {/* ── F4.11e: Açıq vəzifələr — `unit.vacancies`, qısa siyahı. ── */}
              {vacanciesHas ? (
                <section className={blockClass('vacancies')}>
                  <BlockTitle title={blockTitleVacancies} documentId={unit.documentId} locale={locale} />
                  <ul className="un-vacancy-list">
                    {unit.vacancies.map((v, i) => (
                      <li key={i} className="un-vacancy-row">
                        <div className="un-vacancy-position">{v.position}</div>
                        {v.note ? <div className="un-vacancy-note">{v.note}</div> : null}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : (
                <AdminOnly>
                  <EmptyBlock title={blockTitleVacancies} documentId={unit.documentId} locale={locale} tint={tintByKey.vacancies} />
                </AdminOnly>
              )}

              {/* ── F4.11e: FAQ — akkordeon qrupundan AYRI, amma EYNİ üslubda
                  (bax .un-expand-group, ExpandBlock hər sual üçün). ── */}
              {faqHas ? (
                <section className={blockClass('faq')}>
                  <BlockTitle title={blockTitleFaq} documentId={unit.documentId} locale={locale} />
                  <div className="un-expand-group">
                    {unit.faq.map((f, i) => (
                      <ExpandBlock key={i} label={f.question}>
                        <p className="prose" style={{ whiteSpace: 'pre-line' }}>{f.answer}</p>
                      </ExpandBlock>
                    ))}
                  </div>
                </section>
              ) : (
                <AdminOnly>
                  <EmptyBlock title={blockTitleFaq} documentId={unit.documentId} locale={locale} tint={tintByKey.faq} />
                </AdminOnly>
              )}

              {/* ── Əlaqəli xəbərlər (F4.6e: hesabatdan ayrı öz bloku; elanlar
                  varsa eyni blokda qısa siyahı kimi). Xəbər şəkilli (kiçik üz
                  qabığı şəkli), elan qısa/tarixli/şəkilsiz qalır (F4.5c). ── */}
              {block6Has ? (
                <section className={blockClass('news')}>
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
                  <EmptyBlock title={blockTitle6} documentId={unit.documentId} locale={locale} tint={tintByKey.news} />
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
                          <i className="ti ti-door na-ei-ic" aria-hidden="true" />
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

                {/* F4.11c — `receptionSlots` doludursa gün-gün cədvəl (ardıcıl
                    eyni saatlı günlər birləşir), boşdursa köhnə sətir. */}
                {receptionRows.length ? (
                  <div>
                    <div className="un-sub-title">{tr('Qəbul saatları', locale)}</div>
                    <div className="na-event-info" style={{ maxWidth: 'none', margin: 0 }}>
                      {receptionRows.map((r, i) => (
                        <div key={i} className="na-ei-row">
                          <i className="ti ti-clock na-ei-ic" aria-hidden="true" />
                          <div>
                            <div className="na-ei-k">{r.label}</div>
                            <div className="na-ei-v">{r.time}{r.note ? ` · ${r.note}` : ''}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : unit.receptionHours ? (
                  <div>
                    <div className="un-sub-title">{tr('Qəbul saatları', locale)}</div>
                    <p className="un-side-text un-side-text--icon">
                      <i className="ti ti-clock" aria-hidden="true" />
                      {unit.receptionHours}
                    </p>
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
