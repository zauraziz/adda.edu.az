// F3.22 — /[locale]/struktur/[slug]: bölmə səhifəsi (fakültə, kafedra,
// şöbə, mərkəz — hamısı `unit`).
//
// F5.42 — quruluş İXTİSAS SƏHİFƏSİ kimidir (ixtisaslar/[slug]): fakt zolağı,
// əsas foto, hər bölmə öz açıq `<section id>`-i + mündəricat (ProgramToc),
// «İxtisaslar» kartları, qalereya, yan panel, alt bölmələr. F4.10-un vahid
// akkordeon qrupu LƏĞV EDİLİB.
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
import '../../../_styles/27-gallery.css';
import '../../../_styles/36-unit.css';
import '../../../_styles/37-program.css';
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
import LeaderCard from '../../../_components/LeaderCard';
import ProgramToc from '../../../_components/ProgramToc';
import GalleryIsland, { type GalleryImage } from '../../../_components/GalleryIsland';
import { AdminProvider, AdminOnly } from '../../../_components/AdminGate';
import { adminUrl, BlockTitle, EmptyBlock } from '../../../_components/AdminOnly';
import { DocList, DOC_CATEGORY_ORDER } from '../../../_components/DocList';
import { unitType, unitTypeBySlug } from '@/lib/unit-type';
import {
  getDepartmentBySlug,
  getDepartmentSlugs,
  getMenu,
  getUnitDetail,
  getUnitDocuments,
  getUnitStaff,
  getUnitArticles,
  getUnitAnnouncements,
  getUnitFacilities,
  getUnitPrograms,
  getUnits,
  mediaUrl,
  docText,
  FACILITY_TYPES,
  FACILITY_PLURAL_AZ,
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
  type Facility,
  type UnitProgramCard,
} from '@/lib/strapi';
import { tr, isLocale, DEFAULT_LOCALE, LOCALES, type Locale } from '@/lib/i18n';
import { fmtDate } from '@/lib/format';

export const revalidate = 300;

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
  if (!name) return { title: tr('Struktur', locale) };
  // F5.42 — əsas foto paylaşım şəkli kimi (sosial şəbəkə önizləməsi).
  const og = mediaUrl(unit?.photo);
  return og ? { title: name, openGraph: { title: name, images: [og] } } : { title: name };
}

const azSort = (a: string, b: string) => a.localeCompare(b, 'az');

// F5.42 — «İxtisaslar» kartları: ixtisas səhifəsindəki DEGREE_LABEL ilə eyni ad.
const DEGREE_ORDER: UnitProgramCard['degree'][] = ['subbachelor', 'bachelor', 'master', 'phd'];
const DEGREE_LABEL: Record<UnitProgramCard['degree'], string> = {
  bachelor: 'Bakalavriat',
  master: 'Magistratura',
  phd: 'Doktorantura',
  subbachelor: 'Subbakalavr',
};

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

// F4.7a/F5.11 — başlıqlar bölmə adının sonluğundan törəyən tipdən qurulur
// (Mərkəz/Mərkəzin, Kafedra/Kafedranın və s.). `unitType`/`UNIT_TYPE_SUFFIXES`
// `kafedralar/page.tsx` ilə PAYLAŞILIR (bax lib/unit-type.ts) — suffiks
// siyahısı TƏKRARLANMASIN deyə buradan çıxarılıb.

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

// F5.2a — BlockTitle/AdminEditRow/EmptyBlock/EmptyExpandItem/adminUrl
// artıq _components/AdminOnly.tsx-dədir (struktur/ixtisas səhifələri
// eyni komponentləri idxal edir, iki nüsxə saxlanılmır).

// F4.10-un vahid akkordeon qrupu F5.42-də LƏĞV EDİLİB: hər sahə ixtisas
// səhifəsindəki kimi öz açıq bölməsidir, mündəricatdan keçilir.

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

  // ── `unit` — F5.42: ixtisas səhifəsinin quruluşu ──
  // Fakt zolağı · əsas foto · hər bölmə öz AÇIQ `<section id>`-i (akkordeon
  // YOX, F4.10 qrupu ləğv) · mündəricat (ProgramToc, mobil + yapışqan yan
  // panel) · «İxtisaslar» kartları (ixtisas səhifəsindəki «Digər
  // ixtisaslar» ilə eyni) · qalereya · alt bölmələr.
  const isFaculty = unit.slug.endsWith('-fakultesi');
  const [allUnits, docs, staff, articles, announcements, facilities, programsRaw] = await Promise.all([
    getUnits(locale).catch(() => [] as OrgUnit[]),
    getUnitDocuments(unit.slug).catch(() => [] as UnitDocumentItem[]),
    getUnitStaff(unit.slug, unit.name).catch(() => [] as (Person & { photo: StrapiMedia | null })[]),
    getUnitArticles(unit.slug, locale, 6),
    getUnitAnnouncements(unit.slug, locale, 6),
    getUnitFacilities(unit.slug, locale).catch(() => [] as Facility[]),
    // Kafedra/kollec: öz ixtisasları; fakültə: alt kafedralarınkı + köhnə
    // `program.faculty` əlaqəsi (slug eynidir, F5.6).
    getUnitPrograms(
      [unit.slug, ...unit.children.map((c) => c.slug)],
      isFaculty ? unit.slug : null,
      locale,
    ).catch(() => [] as UnitProgramCard[]),
  ]);

  const crumbs = buildCrumbs(unit, allUnits);
  const programs = [...programsRaw].sort(
    (a, b) => DEGREE_ORDER.indexOf(a.degree) - DEGREE_ORDER.indexOf(b.degree) || azSort(a.title, b.title),
  );

  const hesabat = [...docs.filter((d) => d.category === 'hesabat')].sort(
    (a, b) => (b.year ?? 0) - (a.year ?? 0),
  );

  // F4.13 — sənədlər YALNIZ yan paneldə, hesabat İSTİSNA (əsas sütunda,
  // «Görülmüş işlər və nəticələr» blokunda). Faylı olmayan sənəd daxil edilmir.
  const sideDocsSorted = [...docs]
    .filter((d) => d.category !== 'hesabat' && Boolean(mediaUrl(d.file)))
    .sort(
      (a, b) =>
        DOC_CATEGORY_ORDER.indexOf(a.category) - DOC_CATEGORY_ORDER.indexOf(b.category) ||
        (b.year ?? 0) - (a.year ?? 0) ||
        azSort(docText(a, locale).title, docText(b, locale).title),
    );

  // F4.8c — heyət siyahısında rəhbər TƏKRARLANMIR (yan paneldə kartı var);
  // fakt zolağının «Heyət» sayı isə TAM heyətdir (`staff.length`).
  const staffList = staff
    .filter((p) => !unit.head || p.documentId !== unit.head.documentId)
    .sort((a, b) => azSort(a.name ?? '', b.name ?? ''));

  const contactHas = Boolean(unit.building || unit.floor || unit.room || unit.phoneExt || unit.email);
  // F4.11c — `receptionSlots` doludursa köhnə `receptionHours` sətrinin ƏVƏZİNƏ göstərilir.
  const receptionRows = buildReceptionRows(unit.receptionSlots, locale);
  const subunits = [...unit.children].sort(
    (a, b) => (a.sortOrder ?? 100) - (b.sortOrder ?? 100) || azSort(a.name, b.name),
  );
  // Alt bölmələrin hamısı kafedradırsa fakt zolağında «Kafedra», əks halda «Alt bölmə».
  const subunitsAreKafedras = subunits.length > 0 && subunits.every((c) => c.slug.endsWith('-kafedrasi'));
  const facilitiesByType = FACILITY_TYPES.map((t) => ({
    type: t,
    label: tr(t, locale),
    items: facilities.filter((f) => f.facilityType === t),
  })).filter((g) => g.items.length);

  // F5.42 — əsas foto + qalereya (dillər üzrə eynidir).
  const photoUrl = mediaUrl(unit.photo);
  const gallery: GalleryImage[] = (unit.gallery ?? [])
    .map((m) => ({ url: mediaUrl(m) ?? '', alt: m.alternativeText || unit.name, width: m.width, height: m.height }))
    .filter((m) => m.url);
  const galleryLabels: Record<string, string> = {
    gallery: tr('Foto qalereya', locale),
    openImage: tr('Şəkli aç', locale),
    previous: tr('Əvvəlki şəkil', locale),
    next: tr('Növbəti şəkil', locale),
    close: tr('Bağla', locale),
  };

  // F4.7a — «… haqqında» kimi başlıqlar az adının sonluğundan (ru/en-də
  // söz sırası fərqlidir — ümumi başlıq); yuxarı sətir isə slug-dan, bütün dillərdə.
  const unitT = unitType(unit.name);
  const typeBySlug = unitTypeBySlug(unit.slug);
  const parentIsFaculty = Boolean(unit.parent?.slug.endsWith('-fakultesi'));
  const blockTitleAbout = unitT ? `${unitT.nom} ${tr('haqqında', locale)}` : tr('Haqqında', locale);
  const blockTitleMission = unitT ? `${unitT.gen} ${tr('missiyası', locale)}` : tr('Missiya', locale);
  const blockTitleFunctions = tr('Fəaliyyət sahəsi', locale);
  const blockTitleServices = tr('Xidmətlər', locale);
  const blockTitlePrograms = tr('İxtisaslar', locale);
  const blockTitleResults = tr('Görülmüş işlər və nəticələr', locale);
  const blockTitleStrategy = tr('Strateji hədəflər üzrə öhdəliklər', locale);
  const blockTitleGallery = tr('Foto qalereya', locale);
  const blockTitleLinks = tr('Faydalı linklər', locale);
  const blockTitleVacancies = tr('Vakansiyalar', locale);
  const blockTitleFaq = tr('Tez-tez verilən suallar', locale);
  const blockTitleNews = tr('Əlaqəli xəbərlər', locale);
  const blockTitleFacilities = tr('Auditoriya və laboratoriyalar', locale);

  // Sıra ixtisas səhifəsinin məntiqi ilə: nədir → nə edir → hansı ixtisaslar →
  // nəticələr → görüntülər → faydalı məlumat → xəbərlər. `editable` — bölmə
  // qeydinin öz sahəsi (admin «boş blok» göstərir); «İxtisaslar» proqramlardan gəlir.
  type TopKey =
    | 'mission' | 'about' | 'functions' | 'services' | 'programs' | 'results'
    | 'strategy' | 'gallery' | 'links' | 'vacancies' | 'faq' | 'news';
  const sections: { id: TopKey; has: boolean; title: string; editable: boolean }[] = [
    { id: 'mission', has: Boolean(unit.mission), title: blockTitleMission, editable: true },
    { id: 'about', has: Boolean(unit.about), title: blockTitleAbout, editable: true },
    { id: 'functions', has: Boolean(unit.functions), title: blockTitleFunctions, editable: true },
    { id: 'services', has: Boolean(unit.services), title: blockTitleServices, editable: true },
    { id: 'programs', has: programs.length > 0, title: blockTitlePrograms, editable: false },
    { id: 'results', has: Boolean(unit.results || hesabat.length), title: blockTitleResults, editable: true },
    { id: 'strategy', has: Boolean(unit.strategy), title: blockTitleStrategy, editable: true },
    { id: 'gallery', has: gallery.length > 0, title: blockTitleGallery, editable: true },
    { id: 'links', has: unit.links.length > 0, title: blockTitleLinks, editable: true },
    { id: 'vacancies', has: unit.vacancies.length > 0, title: blockTitleVacancies, editable: true },
    { id: 'faq', has: unit.faq.length > 0, title: blockTitleFaq, editable: true },
    { id: 'news', has: Boolean(articles.length || announcements.length), title: blockTitleNews, editable: true },
  ];
  const has = Object.fromEntries(sections.map((s) => [s.id, s.has])) as Record<TopKey, boolean>;
  const fieldStatus = sections.filter((s) => s.editable);
  const openBlockCount = fieldStatus.filter((f) => f.has).length + (photoUrl ? 1 : 0);
  const closedBlockTitles = [
    ...(photoUrl ? [] : [tr('Əsas foto', locale)]),
    ...fieldStatus.filter((f) => !f.has).map((f) => f.title),
  ];
  // Mündəricat YALNIZ faktiki render olunan bölmələri sadalayır.
  const tocItems = sections.filter((s) => s.has).map((s) => ({ id: s.id, label: s.title }));
  // Ağ/boz ritm — ixtisas səhifəsi kimi, yalnız görünən bölmələr üzrə.
  let tintCursor = 0;
  const tintByKey = {} as Record<TopKey, boolean>;
  for (const s of sections) {
    if (!s.has) continue;
    tintByKey[s.id] = tintCursor % 2 === 1;
    tintCursor++;
  }
  const blockClass = (key: TopKey) => 'un-block pr-anchor' + (tintByKey[key] ? ' un-block--tint' : '');

  // Yan panel: mündəricat · üst bölmə · rəhbər · heyət · əlaqə · qəbul saatları ·
  // auditoriyalar · onlayn xidmətlər · sənədlər · düzəliş. Heç biri yoxdursa
  // səhifə TƏK SÜTUN olur (.un-layout--single).
  const sideHas = Boolean(
    tocItems.length ||
      unit.head ||
      staffList.length ||
      facilities.length ||
      contactHas ||
      receptionRows.length ||
      unit.receptionHours ||
      unit.onlineServices.length ||
      unit.parent ||
      sideDocsSorted.length,
  );

  // Fakt zolağı (ixtisas səhifəsindəki kimi): fakültə keçidi · ixtisas ·
  // kafedra/alt bölmə · heyət · otaq · daxili telefon · qəbul saatları.
  // Uydurma metrika yoxdur, YALNIZ mövcud dəyərlər.
  const factsHas = Boolean(
    parentIsFaculty || programs.length || subunits.length || staff.length || unit.room || unit.phoneExt || unit.receptionHours,
  );

  const aboutHtml = unit.about ? await marked.parse(unit.about) : '';
  const functionsHtml = unit.functions ? await marked.parse(unit.functions) : '';
  const servicesHtml = unit.services ? await marked.parse(unit.services) : '';
  const resultsHtml = unit.results ? await marked.parse(unit.results) : '';
  const strategyHtml = unit.strategy ? await marked.parse(unit.strategy) : '';
  const functionCards = unit.functions ? parseListCards(unit.functions) : null;
  const serviceCards = unit.services ? parseListCards(unit.services) : null;

  const subunitHeadBySlug = new Map(allUnits.map((u) => [u.slug, u.head ?? null]));
  const subunitStaffCounts = await Promise.all(
    subunits.map((c) => getUnitStaff(c.slug, c.name).then((s) => s.length).catch(() => 0)),
  );

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

  const empty = (id: TopKey, title: string) => (
    <AdminOnly>
      <EmptyBlock uid="api::unit.unit" title={title} documentId={unit.documentId} locale={locale} tint={Boolean(tintByKey[id])} />
    </AdminOnly>
  );

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main>
        <section className="np-hero">
          <div className="container np-hero-inner">
            <div className="np-eyebrow">{typeBySlug ? tr(typeBySlug.nom, locale) : tr('Struktur', locale)}</div>
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
                {parentIsFaculty && unit.parent ? (
                  <li className="un-fact">
                    <i className="ti ti-building-arch" aria-hidden="true" />
                    <span className="un-fact-k">{tr('Fakültə', locale)}</span>
                    <Link href={`/${locale}/struktur/${unit.parent.slug}`} className="un-fact-v">
                      {unit.parent.name}
                    </Link>
                  </li>
                ) : null}
                {programs.length ? (
                  <li className="un-fact">
                    <i className="ti ti-school" aria-hidden="true" />
                    <span className="un-fact-k">{tr('İxtisas', locale)}</span>
                    <a href="#programs" className="un-fact-v">{programs.length}</a>
                  </li>
                ) : null}
                {subunits.length ? (
                  <li className="un-fact">
                    <i className="ti ti-sitemap" aria-hidden="true" />
                    <span className="un-fact-k">{tr(subunitsAreKafedras ? 'Kafedra' : 'Alt bölmə', locale)}</span>
                    <span className="un-fact-v">{subunits.length}</span>
                  </li>
                ) : null}
                {staff.length ? (
                  <li className="un-fact">
                    <i className="ti ti-users" aria-hidden="true" />
                    <span className="un-fact-k">{tr('Heyət', locale)}</span>
                    <span className="un-fact-v">{staff.length}</span>
                  </li>
                ) : null}
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
              </ul>
            ) : null}
          </div>
        </section>

        <div className="container">
          {/* Mündəricat, mobil variant: başlıqdan dərhal sonra (masaüstü yan panelin
              yuxarısındadır — CSS hər ekranda YALNIZ birini göstərir, 37-program.css). */}
          <ProgramToc items={tocItems} variant="mobile" />

          {/* F4.9b — admin bəzəkləri klient adasında (bax _components/AdminGate.tsx). */}
          <AdminProvider>
          <AdminOnly>
            <div className="un-admin-status">
              {tr('Bloklar', locale)}: {openBlockCount}/{fieldStatus.length + 1}
              {closedBlockTitles.length ? ' · ' + tr('boş', locale) + ': ' + closedBlockTitles.join(', ') : ''}
            </div>
          </AdminOnly>

          <div className={'un-layout' + (sideHas ? '' : ' un-layout--single')}>
            <div className="un-main">
              {/* F5.42 — əsas foto: mətndən əvvəl, bütün en (16:9). */}
              {photoUrl ? (
                <figure className="un-cover">
                  <img src={photoUrl} alt={unit.photo?.alternativeText || unit.name} />
                </figure>
              ) : (
                <AdminOnly>
                  <EmptyBlock uid="api::unit.unit" title={tr('Əsas foto', locale)} documentId={unit.documentId} locale={locale} tint={false} />
                </AdminOnly>
              )}

              {has.mission ? (
                <section id="mission" className={blockClass('mission')}>
                  <BlockTitle uid="api::unit.unit" title={blockTitleMission} documentId={unit.documentId} locale={locale} />
                  <p className="un-mission">{unit.mission}</p>
                </section>
              ) : (
                empty('mission', blockTitleMission)
              )}

              {has.about ? (
                <section id="about" className={blockClass('about')}>
                  <BlockTitle uid="api::unit.unit" title={blockTitleAbout} documentId={unit.documentId} locale={locale} />
                  <div className="prose" dangerouslySetInnerHTML={{ __html: aboutHtml }} />
                </section>
              ) : (
                empty('about', blockTitleAbout)
              )}

              {has.functions ? (
                <section id="functions" className={blockClass('functions')}>
                  <BlockTitle uid="api::unit.unit" title={blockTitleFunctions} documentId={unit.documentId} locale={locale} />
                  {functionCards ? (
                    <FnCardGrid cards={functionCards} />
                  ) : (
                    <div className="prose" dangerouslySetInnerHTML={{ __html: functionsHtml }} />
                  )}
                </section>
              ) : (
                empty('functions', blockTitleFunctions)
              )}

              {has.services ? (
                <section id="services" className={blockClass('services')}>
                  <BlockTitle uid="api::unit.unit" title={blockTitleServices} documentId={unit.documentId} locale={locale} />
                  {serviceCards ? (
                    <FnCardGrid cards={serviceCards} />
                  ) : (
                    <div className="prose" dangerouslySetInnerHTML={{ __html: servicesHtml }} />
                  )}
                </section>
              ) : (
                empty('services', blockTitleServices)
              )}

              {/* F5.42 — kafedranın/fakültənin ixtisasları: ixtisas səhifəsindəki
                  «Digər ixtisaslar» ilə EYNİ kart (.np-grid/.np-card, 19-news-page.css). */}
              {has.programs ? (
                <section id="programs" className={blockClass('programs')}>
                  <h2 className="un-block-title">{blockTitlePrograms}</h2>
                  <div className="np-grid">
                    {programs.map((p) => (
                      <Link key={p.slug} href={`/${locale}/ixtisaslar/${p.slug}`} className="np-card">
                        <span className="np-card-body">
                          <h3 className="np-card-title">{p.title}</h3>
                          <span className="np-meta">
                            <span className="np-chip">{tr(DEGREE_LABEL[p.degree], locale)}</span>
                            {p.durationYears ? (
                              <span className="np-date">{p.durationYears} {tr('il', locale)}</span>
                            ) : null}
                            {p.studyForm === 'qiyabi' ? <span className="np-date">{tr('Qiyabi', locale)}</span> : null}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}

              {has.results ? (
                <section id="results" className={blockClass('results')}>
                  <BlockTitle uid="api::unit.unit" title={blockTitleResults} documentId={unit.documentId} locale={locale} />
                  {unit.results ? <div className="prose" dangerouslySetInnerHTML={{ __html: resultsHtml }} /> : null}
                  {hesabat.length ? (
                    <>
                      <div className="un-sub-title">{tr('Hesabat sənədləri', locale)}</div>
                      <DocList docs={hesabat} locale={locale} />
                    </>
                  ) : null}
                </section>
              ) : (
                empty('results', blockTitleResults)
              )}

              {has.strategy ? (
                <section id="strategy" className={blockClass('strategy')}>
                  <BlockTitle uid="api::unit.unit" title={blockTitleStrategy} documentId={unit.documentId} locale={locale} />
                  <div className="prose" dangerouslySetInnerHTML={{ __html: strategyHtml }} />
                </section>
              ) : (
                empty('strategy', blockTitleStrategy)
              )}

              {/* F5.42 — qalereya: xəbər/auditoriya qalereyası ilə eyni ada
                  (GalleryIsland), başlığı bu blokdandır (bare). */}
              {has.gallery ? (
                <section id="gallery" className={blockClass('gallery')}>
                  <BlockTitle uid="api::unit.unit" title={blockTitleGallery} documentId={unit.documentId} locale={locale} />
                  <GalleryIsland images={gallery} labels={galleryLabels} bare />
                </section>
              ) : (
                empty('gallery', blockTitleGallery)
              )}

              {has.links ? (
                <section id="links" className={blockClass('links')}>
                  <BlockTitle uid="api::unit.unit" title={blockTitleLinks} documentId={unit.documentId} locale={locale} />
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
                empty('links', blockTitleLinks)
              )}

              {has.vacancies ? (
                <section id="vacancies" className={blockClass('vacancies')}>
                  <BlockTitle uid="api::unit.unit" title={blockTitleVacancies} documentId={unit.documentId} locale={locale} />
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
                empty('vacancies', blockTitleVacancies)
              )}

              {has.faq ? (
                <section id="faq" className={blockClass('faq')}>
                  <BlockTitle uid="api::unit.unit" title={blockTitleFaq} documentId={unit.documentId} locale={locale} />
                  <div className="un-expand-group">
                    {unit.faq.map((f, i) => (
                      <ExpandBlock key={i} label={f.question}>
                        <p className="prose" style={{ whiteSpace: 'pre-line' }}>{f.answer}</p>
                      </ExpandBlock>
                    ))}
                  </div>
                </section>
              ) : (
                empty('faq', blockTitleFaq)
              )}

              {/* F4.6e — xəbər şəkilli (kiçik üz qabığı), elan qısa/tarixli. */}
              {has.news ? (
                <section id="news" className={blockClass('news')}>
                  <BlockTitle uid="api::unit.unit" title={blockTitleNews} documentId={unit.documentId} locale={locale} />
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
                empty('news', blockTitleNews)
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
                {/* Mündəricat, masaüstü variant — yan panelin YUXARISINDA (ixtisas səhifəsi kimi). */}
                <ProgramToc items={tocItems} variant="desktop" />

                {/* F4.7d — üst bölmə; kafedrada «Fakültə» (ixtisas səhifəsi kimi). */}
                {unit.parent ? (
                  <div>
                    <div className="un-sub-title">{tr(parentIsFaculty ? 'Fakültə' : 'Tabe olduğu qurum', locale)}</div>
                    <Link href={`/${locale}/struktur/${unit.parent.slug}`} className="un-link-btn">
                      <i className={parentIsFaculty ? 'ti ti-building-arch' : 'ti ti-sitemap'} aria-hidden="true" />
                      {unit.parent.name}
                    </Link>
                  </div>
                ) : null}

                {/* F4.9d/F5.14a — rəhbər kartı (_components/LeaderCard.tsx, ixtisas səhifəsi ilə ortaq). */}
                {unit.head ? <LeaderCard head={unit.head} locale={locale} /> : null}

                {/* F4.9a — heyət: ilk 6-dan sonrakılar «Hamısı (N)» arxasında (StaffReveal). */}
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

                {/* F4.11c — `receptionSlots` doludursa gün-gün cədvəl, boşdursa köhnə sətir. */}
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

                {/* F5.35d/F5.36a — auditoriya/laboratoriya: tipə görə açılan başlıqlar
                    (bölmənin YEGANƏ siyahısı, #auditoriyalar ankoru buradadır). */}
                {facilitiesByType.length ? (
                  <div id="auditoriyalar">
                    <div className="un-sub-title">{blockTitleFacilities}</div>
                    <div className="un-expand-group">
                      {facilitiesByType.map((g) => (
                        <ExpandBlock key={g.type} label={`${tr(FACILITY_PLURAL_AZ[g.type], locale)} (${g.items.length})`}>
                          <ul className="un-fac-side-list">
                            {g.items.map((f) => (
                              <li key={f.documentId}>
                                <Link href={`/${locale}/auditoriyalar/${f.slug}`}>
                                  {f.roomNumber ? `${f.roomNumber} · ` : ''}
                                  {f.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </ExpandBlock>
                      ))}
                    </div>
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

                {/* F4.13 — hesabatdan başqa bütün sənədlər, düz siyahı. */}
                {sideDocsSorted.length ? (
                  <div>
                    <div className="un-sub-title">{tr('Sənədlər', locale)}</div>
                    <DocList docs={sideDocsSorted} locale={locale} />
                  </div>
                ) : null}

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

          {/* F4.5c — alt bölmələr səhifənin sonunda öz kart cərgəsində (ad + rəhbər + heyət sayı). */}
          {subunits.length ? (
            <section className="un-subunits">
              <h2 className="un-block-title">{tr(subunitsAreKafedras ? 'Kafedralar' : 'Alt bölmələr', locale)}</h2>
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
