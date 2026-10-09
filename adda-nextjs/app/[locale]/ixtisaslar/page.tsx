// K26 / F5.17 / F5.18c / F5.24d — /[locale]/ixtisaslar
// K26-3-de menyudan bura link qoymusdum, amma siyahi sehifesi yox idi -> 404.
//
// F5.17 — kart toru YERİNƏ tablar (klik ilə keçid).
// Tərcümə/hazırlıq BURADA (server), interaktivlik (tab keçidi) ProgramDirectoryIsland-da
// (StaffDirectory/StaffDirectoryIsland ilə eyni iş bölgüsü, bax o fayllar).
// Boş tab GÖRÜNMÜR — `.filter((g) => g.items.length)` K26-dan bəri dəyişməyib.
// F5.18c — axtarış və fakültə qruplaşdırması SİLİNDİ, sadə düz sətir siyahısı;
// şifr/təhsil haqqı/qəbul balı/dillər sütunları əlavə olundu (bax
// ProgramDirectoryIsland.tsx).
// F5.24d — tab qruplaşdırması `degree`-dən `catalogTab`-a keçdi (bax aşağı),
// "Yer sayı (2026/27)" sütunu əlavə olundu (admissionSeats.total, şərti).
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
import '../../_styles/28-staff.css';
import '../../_styles/38-programs-list.css';
import type { Metadata } from 'next';
import SiteHeaderStack from '../../_components/SiteHeaderStack';
import Footer from '../../_components/Footer';
import ProgramDirectoryIsland, {
  type ProgramCatalogGroup,
  type ProgramRow,
} from '../../_components/ProgramDirectoryIsland';
import { getMenu, getPrograms, type Program, type ProgramCatalogTab, type SiteMenu } from '@/lib/strapi';
import { tr, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';
import { fmtFee, fmtScore } from '@/lib/format';

export const revalidate = 300;

// F5.24d — tab qruplaşdırması `degree`-dən DEYİL, `catalogTab`-dan gəlir
// (qiyabi bakalavr «tekrar_ali» tabındadır — sadə degree+studyForm qaydası
// bunu tuta bilməzdi, bax lib/strapi.ts ProgramCatalogTab). Sıra BURADA
// TƏYİN OLUNUR (obyekt açar sırası deyil) — .filter(...) boş tabı gizlədir.
const CATALOG_TAB_ORDER: ProgramCatalogTab[] = ['subbakalavr', 'bakalavr', 'magistr', 'tekrar_ali', 'doktorantura'];
const CATALOG_TAB_LABEL: Record<ProgramCatalogTab, string> = {
  subbakalavr: 'Subbakalavr',
  bakalavr: 'Bakalavriat',
  magistr: 'Magistratura',
  tekrar_ali: 'Təkrar ali təhsil',
  doktorantura: 'Doktorantura',
};

// F5.46 — «Təhsil» menyusu pillə tablarına aparır; pillənin QƏBUL səhifəsi
// (F5.45) tabın altında keçid kimi — təhsil (kataloq) və qəbul ayrı yerdədir.
const TAB_ADMISSION: Partial<Record<ProgramCatalogTab, { slug: string; label: string }>> = {
  subbakalavr: { slug: 'subbakalavr', label: 'Kollecə qəbul: şərtlər, tarixlər, sənədlər' },
  bakalavr: { slug: 'bakalavriat', label: 'Bakalavriata qəbul: şərtlər, tarixlər, sənədlər' },
  magistr: { slug: 'magistratura', label: 'Magistraturaya qəbul: şərtlər, tarixlər, sənədlər' },
  doktorantura: { slug: 'doktorantura', label: 'Doktoranturaya qəbul: şərtlər, tarixlər, sənədlər' },
  tekrar_ali: { slug: 'tekrar-ali-tehsil', label: 'Təkrar ali təhsilə qəbul: şərtlər, tarixlər, sənədlər' },
};
const CATALOG_LEAD = 'Kollec, bakalavriat, magistratura, doktorantura və təkrar ali təhsil proqramları — müddət, təhsil haqqı, yer sayı və keçid balları.';

// F5.8a — dil DEYİL, fakt (bax ProgramDetail eyni sabit, [slug]/page.tsx — TOXUNULMUR).
const STUDY_FORM_LABEL: Record<NonNullable<Program['studyForm']>, string> = {
  eyani: 'Əyani',
  qiyabi: 'Qiyabi',
};

// F5.18c — "Dillər" sütunu üçün sabit sıra (yaddan yazılma sırasından asılı olmasın).
const LANG_ORDER: Program['languages'][number]['code'][] = ['az', 'ru', 'en'];

function languagesLabel(languages: Program['languages']): string {
  if (!languages.length) return '—';
  const codes = new Set(languages.map((l) => l.code));
  return LANG_ORDER.filter((c) => codes.has(c))
    .map((c) => c.toUpperCase())
    .join('+');
}

/**
 * F5.20d — siyahı görünüşü YALNIZI: ən son il (year azalan sıra, ilk
 * element), ödənişli/ödənişsiz AYRI-AYRI YOX, minimum/maksimum kimi
 * ("239,5 / 385"). Yalnız biri mövcuddursa, o göstərilir.
 * DİQQƏT: AdmissionScoreChart.tsx-də ödənişli/ödənişsiz ayrımı DƏQİQ
 * qalır — bu funksiya ora TƏSİR ETMİR, TOXUNULMAYIB (F5.20d).
 */
function admissionLabel(scores: Program['admissionScores'], locale: Locale): string {
  if (!scores.length) return '—';
  const latest = [...scores].sort((a, b) => b.year - a.year)[0];
  const paid = latest.minScorePaid;
  const free = latest.minScoreFree;
  if (paid == null && free == null) return '—';
  if (paid != null && free != null) {
    return `${fmtScore(Math.min(paid, free), locale)} / ${fmtScore(Math.max(paid, free), locale)}`;
  }
  return fmtScore(paid ?? free!, locale);
}

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
    title: tr('İxtisaslar', locale),
    description: tr(CATALOG_LEAD, locale),
  };
}

export default async function ProgramListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  const [menu, programs] = await Promise.all([
    getMenu(locale).catch(() => null as SiteMenu | null),
    getPrograms(locale).catch(() => [] as Program[]),
  ]);

  const groups: ProgramCatalogGroup[] = CATALOG_TAB_ORDER
    .map((tab) => ({
      tab,
      label: tr(CATALOG_TAB_LABEL[tab], locale),
      note: TAB_ADMISSION[tab]
        ? { href: `/${locale}/sehife/${TAB_ADMISSION[tab]!.slug}`, label: tr(TAB_ADMISSION[tab]!.label, locale) }
        : null,
      items: programs
        .filter((p) => p.catalogTab === tab)
        .map(
          (p): ProgramRow => ({
            slug: p.slug,
            title: p.title,
            code: p.code,
            durationYears: p.durationYears,
            studyFormLabel: p.studyForm ? tr(STUDY_FORM_LABEL[p.studyForm], locale) : null,
            // F5.45 — vahid yazılış («2700» → «2700 AZN/il»).
            tuitionFee: p.tuitionFee ? fmtFee(p.tuitionFee, locale) : null,
            admissionLabel: admissionLabel(p.admissionScores, locale),
            languagesLabel: languagesLabel(p.languages),
            seatsTotal: p.admissionSeats?.total ?? null,
            langCodes: p.languages.map((l) => l.code),
          }),
        ),
    }))
    .filter((g) => g.items.length);

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main>
        <section className="np-hero">
          <div className="container np-hero-inner">
            <div className="np-eyebrow">{tr('Təhsil', locale)}</div>
            <h1 className="np-h1">{tr('İxtisaslar', locale)}</h1>
            <p className="np-lead">{tr(CATALOG_LEAD, locale)}</p>
          </div>
        </section>

        <section className="np-wrap">
          <div className="container">
            {groups.length ? (
              <ProgramDirectoryIsland
                groups={groups}
                basePath={`/${locale}/ixtisaslar`}
                langNotes={{
                  en: { href: `/${locale}/sehife/ingilis-dilinde-tedris`, label: tr('İngilis dilində tədris: qəbul və tələblər', locale) },
                }}
                labels={{
                  colSpeciality: tr('İxtisas', locale),
                  colCode: tr('Şifr', locale),
                  colDuration: tr('Müddət', locale),
                  colForm: tr('Təhsil forması', locale),
                  colTuition: tr('Təhsil haqqı (AZN)', locale),
                  colSeats: tr('Yer sayı (2026/27)', locale),
                  colAdmission: tr('Qəbul balı (minimum/maksimum)', locale),
                  colLanguages: tr('Tədris dili', locale),
                  years: tr('il', locale),
                  langFilter: tr('Tədris dili', locale),
                  showAll: tr('Bütün proqramlar', locale),
                }}
              />
            ) : (
              <p className="np-empty">{tr('Məlumat hazırda əlçatan deyil.', locale)}</p>
            )}
          </div>
        </section>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
