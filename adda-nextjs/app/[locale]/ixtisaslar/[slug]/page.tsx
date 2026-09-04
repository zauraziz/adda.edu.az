// F5.1c/F5.5c — /[locale]/ixtisaslar/[slug]: ixtisas (proqram) səhifəsi.
//
// Struktur bölmə səhifəsi ilə EYNİ dizayn dili (F4.9–F4.13): iki sütun +
// yapışqan yan panel, admin qapısı (AdminGate.tsx), boş sahə heç vaxt
// render olunmur. F5.5c-dən sonra beş mətn bölməsi TAM AÇIQ (akkordeon
// DEYİL) — hər biri öz `<section id>`-i, yan paneldə sticky mündəricat
// (ProgramToc.tsx) + IntersectionObserver ilə "hardayam" vurğusu. YALNIZ
// tədris planı (46 fənn, uzun) ExpandBlock-da qalır. Admin-bəzək
// köməkçiləri (BlockTitle/EmptyBlock/AdminEditRow) `_components/AdminOnly`-dən
// (F5.2a, struktur/[slug]/page.tsx ilə paylaşılır).
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
import '../../../_styles/36-unit.css';
import '../../../_styles/37-program.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { marked } from 'marked';
import SiteHeaderStack from '../../../_components/SiteHeaderStack';
import Footer from '../../../_components/Footer';
import CorrectionIsland from '../../../_components/CorrectionIsland';
import ExpandBlock from '../../../_components/ExpandBlock';
import ProgramToc from '../../../_components/ProgramToc';
import LeaderCard from '../../../_components/LeaderCard';
import { AdminProvider, AdminOnly } from '../../../_components/AdminGate';
import { BlockTitle, AdminEditRow, EmptyBlock } from '../../../_components/AdminOnly';
import { DocList } from '../../../_components/DocList';
import {
  getProgramDetail,
  getProgramDocuments,
  getProgramSlugs,
  getFacultyBySlug,
  getMenu,
  getPrograms,
  withAzFallback,
  KAFEDRA_FACULTY,
  type ProgramDetail,
  type ProgramCourse,
  type Program,
  type SiteMenu,
} from '@/lib/strapi';
import { tr, isLocale, DEFAULT_LOCALE, LOCALES, fallbackNotice, type Locale } from '@/lib/i18n';

export const revalidate = 300;

const DEGREE_LABEL: Record<ProgramDetail['degree'], string> = {
  bachelor: 'Bakalavriat',
  master: 'Magistratura',
  phd: 'Doktorantura',
};

// F5.8a — dil DEYİL, fakt (bax schema.json `studyForm`, localized:false).
const STUDY_FORM_LABEL: Record<NonNullable<ProgramDetail['studyForm']>, string> = {
  eyani: 'Əyani',
  qiyabi: 'Qiyabi',
};

// F5.5d — schema.org `educationalCredentialAwarded` VERİLƏN dərəcə/diplomun
// ADI-dır ("Bakalavr"), `DEGREE_LABEL`-dəki təhsil PİLLƏSİ ADINDAN
// ("Bakalavriat") FƏRQLİDİR — qarışdırılmasın.
const EDU_CREDENTIAL_LABEL: Record<ProgramDetail['degree'], string> = {
  bachelor: 'Bakalavr',
  master: 'Magistr',
  phd: 'Fəlsəfə doktoru',
};

/**
 * F5.5d — schema.org Course strukturlaşdırılmış məlumatı. YALNIZ MÖVCUD
 * proqram sahələrindən qurulur — boş sahə açarı JSON-LD-yə ÜMUMİYYƏTLƏ
 * düşmür (məs. `totalCredits` boşdursa `numberOfCredits` yoxdur, "0" da
 * yazılmır). `provider`/`hasCourseInstance` müəssisə haqqında SABİT
 * faktlardır (heç bir CMS sahəsindən asılı deyil), ona görə HƏMİŞƏ var.
 */
function buildCourseJsonLd(program: ProgramDetail): Record<string, unknown> {
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: program.title,
    provider: {
      '@type': 'Organization',
      name: 'Azərbaycan Dövlət Dəniz Akademiyası',
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'full-time',
    },
  };
  if (program.overview) {
    // ilk abzas — boş sətirə qədər, markdown işarələri çıxarılıb (JSON-LD
    // adi mətn gözləyir, HTML/markdown YOX).
    const firstParagraph = program.overview
      .split(/\r?\n\s*\r?\n/)[0]
      .replace(/[#*_`>]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (firstParagraph) jsonLd.description = firstParagraph;
  }
  if (program.code) jsonLd.courseCode = program.code;
  if (program.degree) jsonLd.educationalCredentialAwarded = EDU_CREDENTIAL_LABEL[program.degree];
  if (program.totalCredits) jsonLd.numberOfCredits = program.totalCredits;
  if (program.durationYears) jsonLd.timeRequired = 'P' + program.durationYears + 'Y';
  return jsonLd;
}

// F5.1c/F5.3 — semestr sırası roman rəqəmlərlə, ƏLİFBA İLƏ YOX (VIII "V"-dən
// əvvəl əlifba sırasına düşərdi). Semestri olmayan sətirlər (üzmə təcrübəsi)
// bu qruplaşdırmaya heç DAXİL EDİLMİR — bax `swimPracticeCourses`, ayrıca
// "Üzmə təcrübəsi" blokunda göstərilir.
const SEMESTER_ORDER = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
function semesterRank(s: string | null): number {
  if (!s) return SEMESTER_ORDER.length;
  const i = SEMESTER_ORDER.indexOf(s);
  return i === -1 ? SEMESTER_ORDER.length : i;
}

interface SemesterGroup {
  semester: string;
  courses: ProgramCourse[];
}
/** Çağıran YALNIZ `semester` doldurulmuş fənləri ötürməlidir (bax `swimPracticeCourses`). */
function groupBySemester(courses: ProgramCourse[]): SemesterGroup[] {
  const map = new Map<string, ProgramCourse[]>();
  for (const c of courses) {
    if (!c.semester) continue;
    if (!map.has(c.semester)) map.set(c.semester, []);
    map.get(c.semester)!.push(c);
  }
  return [...map.entries()]
    .map(([semester, list]) => ({ semester, courses: list }))
    .sort((a, b) => semesterRank(a.semester) - semesterRank(b.semester));
}

// F5.2a — BlockTitle/AdminEditRow/EmptyBlock/EmptyExpandItem/adminUrl
// artıq _components/AdminOnly.tsx-dədir (struktur/ixtisas səhifələri
// eyni komponentləri idxal edir, iki nüsxə saxlanılmır).

/**
 * F5.5a — F5.3-dəki cədvəl markup-u BURAYA çıxarılıb ki, həm semestr
 * qrupları, həm "Üzmə təcrübəsi" bloku EYNİ cədvəli işlətsin (əvvəl
 * yalnız semestr qruplarında idi, üzmə təcrübəsi sadə siyahı idi).
 * Sütun məntiqi (prerekvizit/korekvizit şərti, saat üç sütunu) F5.3-dən
 * DƏYİŞMƏDƏN köçürülüb — TOXUNMA (bax tapşırıq).
 */
function CourseTable({
  courses,
  hasPrerequisite,
  hasCorequisite,
  locale,
}: {
  courses: ProgramCourse[];
  hasPrerequisite: boolean;
  hasCorequisite: boolean;
  locale: Locale;
}) {
  return (
    <div className="pr-plan-scroll">
      <table className="pr-plan-table">
        <thead>
          <tr>
            <th>{tr('Şifr', locale)}</th>
            <th>{tr('Fənn', locale)}</th>
            <th>{tr('Kredit', locale)}</th>
            <th>{tr('Cəmi', locale)}</th>
            <th>{tr('Auditoriya', locale)}</th>
            <th>{tr('Sərbəst', locale)}</th>
            {hasPrerequisite ? <th>{tr('Prerekvizit', locale)}</th> : null}
            {hasCorequisite ? <th>{tr('Korekvizit', locale)}</th> : null}
          </tr>
        </thead>
        <tbody>
          {courses.map((c, i) => (
            <tr key={i} className={c.isPractice ? 'pr-plan-row--practice' : undefined}>
              <td>
                <span className="pr-plan-code">
                  <span>{c.code}</span>
                  {c.isPractice ? <span className="pr-plan-badge">{tr('Təcrübə', locale)}</span> : null}
                </span>
              </td>
              <td>{c.name}</td>
              <td>{c.credits ?? ''}</td>
              <td>{c.totalHours ?? ''}</td>
              <td>{c.auditHours ?? ''}</td>
              <td>{c.selfStudyHours ?? ''}</td>
              {hasPrerequisite ? <td>{c.prerequisite ?? ''}</td> : null}
              {hasCorequisite ? <td>{c.corequisite ?? ''}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export async function generateStaticParams() {
  const out: Array<{ locale: string; slug: string }> = [];
  for (const locale of LOCALES) {
    for (const slug of await getProgramSlugs(locale)) out.push({ locale, slug });
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
  const { doc } = await withAzFallback((loc) => getProgramDetail(slug, loc), locale);
  if (!doc) return { title: tr('İxtisas', locale) };
  return { title: doc.title };
}

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  const [{ doc: program, isFallback }, menu, allPrograms] = await Promise.all([
    withAzFallback((loc) => getProgramDetail(slug, loc), locale),
    getMenu(locale).catch(() => null as SiteMenu | null),
    getPrograms(locale).catch(() => [] as Program[]),
  ]);

  if (!program) notFound();

  const docs = await getProgramDocuments(program.slug).catch(() => []);

  // F5.14b — cari proqram çıxarılır, qalanı yan panel DEYİL, səhifə
  // sonunda kart cərgəsi (abituriyent ixtisasları müqayisə etsin).
  const otherPrograms = allPrograms.filter((p) => p.slug !== program.slug);

  // F5.5b/F5.6 — `program.faculty` sxemdə var, amma boş ola bilər. Boşdursa
  // KAFEDRA_FACULTY sabitindən (bax lib/strapi.ts) götürülür — `unit.parent`
  // zənciri ARTIQ GƏZİLMİR, birbaşa kafedranın öz slug-ı ilə axtarılır.
  const facultyDisplay = program.faculty
    ? { name: program.faculty.name, slug: program.faculty.slug }
    : program.unit && KAFEDRA_FACULTY[program.unit.slug]
      ? await getFacultyBySlug(KAFEDRA_FACULTY[program.unit.slug], locale)
          .then((f) => (f ? { name: f.name, slug: f.slug } : null))
          .catch(() => null)
      : null;

  const overviewHas = Boolean(program.overview);
  const outcomesHas = Boolean(program.outcomes);
  const competenciesHas = Boolean(program.competencies);
  const careerPathsHas = Boolean(program.careerPaths);
  const conventionsHas = Boolean(program.conventions);

  const coursesHas = Boolean(program.courses.length);
  // F5.5a — semestri olan fənlər YALNIZ "Tədris planı" blokunda; semestrsiz
  // təcrübə (T-B01..T-B04) artıq bu blokda DEYİL, öz "Üzmə təcrübəsi"
  // blokundadır (aşağıda). Semestrli təcrübə (T-B05, VIII) öz semestrində qalır.
  const semesterGroups = coursesHas ? groupBySemester(program.courses) : [];
  const swimPracticeCourses = program.courses.filter((c) => c.isPractice && !c.semester);
  const swimPracticeHas = Boolean(swimPracticeCourses.length || program.practiceNote);
  // F5.3 — prerekvizit/korekvizit sütunları ŞƏRTİ: heç bir fənndə dəyər
  // yoxdursa sütun ÜMUMİYYƏTLƏ göstərilmir (46 fənndə hazırda ikisi də boş).
  // TOXUNMA (F5.5): bu məntiq dəyişmir, sadəcə `CourseTable`-a çıxarılıb.
  const hasPrerequisite = program.courses.some((c) => c.prerequisite);
  const hasCorequisite = program.courses.some((c) => c.corequisite);

  const blockTitleOverview = tr('Proqram haqqında', locale);
  const blockTitleOutcomes = tr('Təlim nəticələri', locale);
  const blockTitleCompetencies = tr('Kompetensiyalar', locale);
  const blockTitleCareerPaths = tr('Karyera imkanları', locale);
  const blockTitleConventions = tr('Konvensiya tələbləri', locale);
  const blockTitleSwim = tr('Üzmə təcrübəsi', locale);
  const blockTitlePlan = tr('Tədris planı', locale);

  // F5.5c — akkordeon ƏVƏZİNƏ hər bölmə öz TAM AÇIQ `<section id>`-dir
  // (lövbər üçün) — beş mətn bölməsi abituriyent sual ardıcıllığı ilə
  // (F5.5a), sonra üzmə təcrübəsi, sonda tədris planı (YALNIZ bu, uzun
  // olduğu üçün, ExpandBlock-da qalır). `id` mündəricat (ProgramToc) və
  // scroll-margin üçün eynidir.
  type TopKey = 'overview' | 'career-paths' | 'competencies' | 'conventions' | 'outcomes' | 'swim-practice' | 'study-plan';
  const fieldStatus: { id: TopKey; has: boolean; title: string }[] = [
    { id: 'overview', has: overviewHas, title: blockTitleOverview },
    { id: 'career-paths', has: careerPathsHas, title: blockTitleCareerPaths },
    { id: 'competencies', has: competenciesHas, title: blockTitleCompetencies },
    { id: 'conventions', has: conventionsHas, title: blockTitleConventions },
    { id: 'outcomes', has: outcomesHas, title: blockTitleOutcomes },
    { id: 'swim-practice', has: swimPracticeHas, title: blockTitleSwim },
    { id: 'study-plan', has: coursesHas, title: blockTitlePlan },
  ];
  const openBlockCount = fieldStatus.filter((f) => f.has).length;
  const closedBlockTitles = fieldStatus.filter((f) => !f.has).map((f) => f.title);
  // F5.5c — mündəricat YALNIZ faktiki render olunan bölmələri sadalayır
  // ("boş sahə görünmür" qaydası mündəricata da aiddir).
  const tocItems = fieldStatus.filter((f) => f.has).map((f) => ({ id: f.id, label: f.title }));

  // F5.5c — akkordeon qrupu ləğv edildiyi üçün F4.10-un "qrup tint almır"
  // istisnası da YOXDUR — indi HAMISI ağ/boz ritmə bərabər qatılır.
  let tintCursor = 0;
  const tintByKey = {} as Record<TopKey, boolean>;
  for (const f of fieldStatus) {
    if (!f.has) continue;
    tintByKey[f.id] = tintCursor % 2 === 1;
    tintCursor++;
  }

  // F5.3/F5.5b/F5.5c — şifr/dərəcə/müddət/kredit fakt zolağında onsuz da var
  // (aşağıda, np-hero), yan paneldə TƏKRARLANMIR — orada mündəricat, fakültə/
  // kafedra keçidi, plan ili və sənədlər qalır.
  const sideHas = Boolean(tocItems.length || facultyDisplay || program.unit || docs.length || program.planYear);

  const factsHas = Boolean(
    program.degree ||
      program.durationYears ||
      program.studyForm ||
      program.totalCredits ||
      program.code ||
      facultyDisplay,
  );

  const overviewHtml = program.overview ? await marked.parse(program.overview) : '';
  const outcomesHtml = program.outcomes ? await marked.parse(program.outcomes) : '';
  const competenciesHtml = program.competencies ? await marked.parse(program.competencies) : '';
  const careerPathsHtml = program.careerPaths ? await marked.parse(program.careerPaths) : '';
  const conventionsHtml = program.conventions ? await marked.parse(program.conventions) : '';

  const notice = isFallback ? fallbackNotice(locale) : null;

  // F5.5d — script içindəki `</script>`-ə bənzər ardıcıllıqları qırmaq üçün
  // `<` işarəsi qaçırılır (Next.js-in öz JSON-LD nümunəsindəki qayda).
  const courseJsonLd = JSON.stringify(buildCourseJsonLd(program)).replace(/</g, '\\u003c');

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
      {/* F5.5d — schema.org Course strukturlaşdırılmış məlumatı (bax
          buildCourseJsonLd yuxarıda). AYRI səhifələrə BÖLÜNMÜR — vahid
          axtarış niyyəti üçün bir güclü səhifə beş nazik səhifədən
          üstündür, keçid çəkisi bölünməsin deyə. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: courseJsonLd }}
      />
      <SiteHeaderStack menu={menu} locale={locale} />
      <main>
        <section className="np-hero">
          <div className="container np-hero-inner">
            <div className="np-eyebrow">{tr('İxtisas', locale)}</div>
            <h1 className="np-h1">{program.title}</h1>
            <nav className="un-crumbs" aria-label={tr('İxtisas', locale)}>
              <Link href={`/${locale}/ixtisaslar`}>{tr('İxtisaslar', locale)}</Link>
              <span className="un-crumb-sep">/</span> <span className="un-crumb-cur">{program.title}</span>
            </nav>
            {factsHas ? (
              <ul className="un-facts" aria-label={tr('Əsas faktlar', locale)}>
                {facultyDisplay ? (
                  <li className="un-fact">
                    <i className="ti ti-building-arch" aria-hidden="true" />
                    <span className="un-fact-k">{tr('Fakültə', locale)}</span>
                    <Link href={`/${locale}/fakulteler/${facultyDisplay.slug}`} className="un-fact-v">
                      {facultyDisplay.name}
                    </Link>
                  </li>
                ) : null}
                {program.degree ? (
                  <li className="un-fact">
                    <i className="ti ti-school" aria-hidden="true" />
                    <span className="un-fact-k">{tr('Dərəcə', locale)}</span>
                    <span className="un-fact-v">{tr(DEGREE_LABEL[program.degree], locale)}</span>
                  </li>
                ) : null}
                {program.durationYears ? (
                  <li className="un-fact">
                    <i className="ti ti-calendar" aria-hidden="true" />
                    <span className="un-fact-k">{tr('Müddət', locale)}</span>
                    <span className="un-fact-v">{program.durationYears} {tr('il', locale)}</span>
                  </li>
                ) : null}
                {/* F5.8a — dil deyil, fakt: yan paneldə YOX (F5.3-də şifr/
                    dərəcə/müddət/kredit təkrarı buradan çıxarılmışdı, eyni
                    qayda) — YALNIZ fakt zolağında. */}
                {program.studyForm ? (
                  <li className="un-fact">
                    <i className="ti ti-building-bank" aria-hidden="true" />
                    <span className="un-fact-k">{tr('Təhsil forması', locale)}</span>
                    <span className="un-fact-v">{tr(STUDY_FORM_LABEL[program.studyForm], locale)}</span>
                  </li>
                ) : null}
                {program.totalCredits ? (
                  <li className="un-fact">
                    <i className="ti ti-certificate" aria-hidden="true" />
                    <span className="un-fact-k">{tr('Kredit', locale)}</span>
                    <span className="un-fact-v">{program.totalCredits}</span>
                  </li>
                ) : null}
                {program.code ? (
                  <li className="un-fact">
                    <i className="ti ti-hash" aria-hidden="true" />
                    <span className="un-fact-k">{tr('Şifr', locale)}</span>
                    <span className="un-fact-v">{program.code}</span>
                  </li>
                ) : null}
              </ul>
            ) : null}
          </div>
        </section>

        <div className="container">
          {/* F5.5c — mündəricat, mobil variant: başlıqdan (yuxarıdakı np-hero)
              dərhal sonra, üfüqi çip cərgəsi (bax 37-program.css). Masaüstü
              variant aşağıda, `.un-side`-ın yuxarısındadır — CSS media
              sorğusu hər ekranda YALNIZ birini göstərir. */}
          <ProgramToc items={tocItems} variant="mobile" />

          {notice ? (
            <div
              role="status"
              style={{
                background: '#FBF4E4',
                border: '1px solid #C9A961',
                borderRadius: '8px',
                padding: '12px 16px',
                margin: '24px 0 0',
                color: '#0B3D5C',
                fontSize: '0.95rem',
              }}
            >
              {notice}
            </div>
          ) : null}

          {/* F4.9b örnəyi — admin bəzəkləri klient adasında (bax _components/AdminGate.tsx). */}
          <AdminProvider>
          <AdminOnly>
            <div className="un-admin-status">
              {tr('Bloklar', locale)}: {openBlockCount}/{fieldStatus.length}
              {closedBlockTitles.length ? ' · ' + tr('boş', locale) + ': ' + closedBlockTitles.join(', ') : ''}
            </div>
          </AdminOnly>

          <div className={'un-layout' + (sideHas ? '' : ' un-layout--single')}>
            <div className="un-main">
              {/* ── F5.5c: beş mətn bölməsi akkordeon ƏVƏZİNƏ TAM AÇIQ —
                  hər biri öz `<section id>`-i (lövbər/mündəricat üçün, bax
                  ProgramToc.tsx). Sıra abituriyentin sual ardıcıllığı ilədir
                  (F5.5a): overview/careerPaths/competencies/conventions,
                  outcomes sonda (heç bir seed doldurmur, "boş sahə görünmür"
                  qaydası ilə öz-özünə görünəcək). ── */}
              {overviewHas ? (
                <section id="overview" className={'un-block pr-anchor' + (tintByKey.overview ? ' un-block--tint' : '')}>
                  <BlockTitle uid="api::program.program" title={blockTitleOverview} documentId={program.documentId} locale={locale} />
                  <div className="prose" dangerouslySetInnerHTML={{ __html: overviewHtml }} />
                </section>
              ) : (
                <AdminOnly>
                  <EmptyBlock uid="api::program.program" title={blockTitleOverview} documentId={program.documentId} locale={locale} tint={tintByKey.overview} />
                </AdminOnly>
              )}

              {careerPathsHas ? (
                <section id="career-paths" className={'un-block pr-anchor' + (tintByKey['career-paths'] ? ' un-block--tint' : '')}>
                  <BlockTitle uid="api::program.program" title={blockTitleCareerPaths} documentId={program.documentId} locale={locale} />
                  <div className="prose" dangerouslySetInnerHTML={{ __html: careerPathsHtml }} />
                </section>
              ) : (
                <AdminOnly>
                  <EmptyBlock uid="api::program.program" title={blockTitleCareerPaths} documentId={program.documentId} locale={locale} tint={tintByKey['career-paths']} />
                </AdminOnly>
              )}

              {competenciesHas ? (
                <section id="competencies" className={'un-block pr-anchor' + (tintByKey.competencies ? ' un-block--tint' : '')}>
                  <BlockTitle uid="api::program.program" title={blockTitleCompetencies} documentId={program.documentId} locale={locale} />
                  <div className="prose" dangerouslySetInnerHTML={{ __html: competenciesHtml }} />
                </section>
              ) : (
                <AdminOnly>
                  <EmptyBlock uid="api::program.program" title={blockTitleCompetencies} documentId={program.documentId} locale={locale} tint={tintByKey.competencies} />
                </AdminOnly>
              )}

              {conventionsHas ? (
                <section id="conventions" className={'un-block pr-anchor' + (tintByKey.conventions ? ' un-block--tint' : '')}>
                  <BlockTitle uid="api::program.program" title={blockTitleConventions} documentId={program.documentId} locale={locale} />
                  <div className="prose" dangerouslySetInnerHTML={{ __html: conventionsHtml }} />
                </section>
              ) : (
                <AdminOnly>
                  <EmptyBlock uid="api::program.program" title={blockTitleConventions} documentId={program.documentId} locale={locale} tint={tintByKey.conventions} />
                </AdminOnly>
              )}

              {outcomesHas ? (
                <section id="outcomes" className={'un-block pr-anchor' + (tintByKey.outcomes ? ' un-block--tint' : '')}>
                  <BlockTitle uid="api::program.program" title={blockTitleOutcomes} documentId={program.documentId} locale={locale} />
                  <div className="prose" dangerouslySetInnerHTML={{ __html: outcomesHtml }} />
                </section>
              ) : (
                <AdminOnly>
                  <EmptyBlock uid="api::program.program" title={blockTitleOutcomes} documentId={program.documentId} locale={locale} tint={tintByKey.outcomes} />
                </AdminOnly>
              )}

              {/* ── F5.5a/F5.5c: Üzmə təcrübəsi — TAM AÇIQ, öz bloku.
                  `practiceNote` (PROGRAM_TEXT_SEED, F5.4) + semestrsiz
                  təcrübə sətirləri (T-B01..T-B04) EYNİ cədvəldə (bax
                  CourseTable). Semestrli təcrübə (T-B05, VIII) öz semestr
                  qrupunda qalır, bura düşmür. ── */}
              {swimPracticeHas ? (
                <section id="swim-practice" className={'un-block pr-anchor' + (tintByKey['swim-practice'] ? ' un-block--tint' : '')}>
                  <BlockTitle uid="api::program.program" title={blockTitleSwim} documentId={program.documentId} locale={locale} />
                  {program.practiceNote ? (
                    <p className="un-mission" style={{ whiteSpace: 'pre-line' }}>{program.practiceNote}</p>
                  ) : null}
                  {swimPracticeCourses.length ? (
                    <CourseTable
                      courses={swimPracticeCourses}
                      hasPrerequisite={hasPrerequisite}
                      hasCorequisite={hasCorequisite}
                      locale={locale}
                    />
                  ) : null}
                </section>
              ) : (
                <AdminOnly>
                  <EmptyBlock uid="api::program.program" title={blockTitleSwim} documentId={program.documentId} locale={locale} tint={tintByKey['swim-practice']} />
                </AdminOnly>
              )}

              {/* ── F5.1c/F5.3/F5.5a/F5.5c: Tədris planı — SONDA (arayış
                  materialı). YALNIZ bu bölmə ExpandBlock-da qalır (uzundur,
                  46 fənn) — beş mətn bölməsindən fərqli olaraq. Saat
                  "Cəmi/Auditoriya/Sərbəst" üç sütuna bölünüb, mobildə "Cəmi"
                  ilk görünən sütundur, qalanı üfüqi sürüşmədədir (bax
                  .pr-plan-scroll, 37-program.css). Prerekvizit/korekvizit
                  ŞƏRTİ göstərilir — heç bir fənndə dəyər yoxdursa sütun
                  ÜMUMİYYƏTLƏ yoxdur (TOXUNMA, F5.3-dən dəyişməyib). ── */}
              {coursesHas ? (
                <section id="study-plan" className={'un-block pr-anchor' + (tintByKey['study-plan'] ? ' un-block--tint' : '')}>
                  <AdminEditRow uid="api::program.program" documentId={program.documentId} locale={locale} />
                  <ExpandBlock label={blockTitlePlan}>
                    {semesterGroups.map((g) => (
                      <div key={g.semester} className="pr-plan-group">
                        <div className="un-sub-title">{tr('Semestr', locale) + ' ' + g.semester}</div>
                        <CourseTable
                          courses={g.courses}
                          hasPrerequisite={hasPrerequisite}
                          hasCorequisite={hasCorequisite}
                          locale={locale}
                        />
                      </div>
                    ))}
                  </ExpandBlock>
                </section>
              ) : (
                <AdminOnly>
                  <EmptyBlock uid="api::program.program" title={blockTitlePlan} documentId={program.documentId} locale={locale} tint={tintByKey['study-plan']} />
                </AdminOnly>
              )}
            </div>

            {sideHas ? (
              <aside className="un-side">
                {/* F5.5c — mündəricat, masaüstü variant: yan panelin
                    YUXARISINDA, sticky (bax .un-side, 36-unit.css). Mobil
                    variant yuxarıda, başlıqdan dərhal sonra render olunub. */}
                <ProgramToc items={tocItems} variant="desktop" />

                {/* F5.3/F5.5b — şifr/dərəcə/müddət/kredit BURADAN ÇIXARILIB
                    (fakt zolağında var, yuxarıda) — yan paneldə YALNIZ
                    fakültə/kafedra keçidi, sənədlər və plan ili qalır. */}
                {facultyDisplay ? (
                  <div>
                    <div className="un-sub-title">{tr('Fakültə', locale)}</div>
                    <Link href={`/${locale}/fakulteler/${facultyDisplay.slug}`} className="un-link-btn">
                      <i className="ti ti-building-arch" aria-hidden="true" />
                      {facultyDisplay.name}
                    </Link>
                  </div>
                ) : null}

                {program.unit ? (
                  <div>
                    <div className="un-sub-title">{tr('Kafedra', locale)}</div>
                    <Link href={`/${locale}/struktur/${program.unit.slug}`} className="un-link-btn">
                      <i className="ti ti-sitemap" aria-hidden="true" />
                      {program.unit.name}
                    </Link>
                  </div>
                ) : null}

                {/* F5.14a — kafedra müdiri, «Sənədlər»dən əvvəl (struktur
                    səhifəsi ilə eyni komponent, bax _components/LeaderCard.tsx). */}
                {program.unit?.head ? <LeaderCard head={program.unit.head} locale={locale} /> : null}

                {docs.length ? (
                  <div>
                    <div className="un-sub-title">{tr('Sənədlər', locale)}</div>
                    <DocList docs={docs} locale={locale} />
                  </div>
                ) : null}

                {program.planYear ? (
                  <div>
                    <div className="un-sub-title">{tr('Plan ili', locale)}</div>
                    <p className="un-side-text">{program.planYear}</p>
                  </div>
                ) : null}

                <CorrectionIsland
                  targetType="general"
                  targetSlug={slug}
                  title={program.title}
                  locale={locale}
                  labels={correctionLabels}
                />
              </aside>
            ) : null}
          </div>

          {/* F5.14b — «Digər ixtisaslar»: struktur səhifəsindəki F4.13-də
              qəsdən silinmiş «qohum bölmələr» bloku ilə QARIŞDIRILMASIN —
              bura fərqli məntiqdir (abituriyent ixtisas seçərkən müqayisə
              ehtiyacı). İxtisaslar siyahısı (`/ixtisaslar`) ilə EYNİ kart
              üslubu (`.np-grid`/`.np-card`, bax 19-news-page.css) — YENİ
              CSS YAZILMAYIB. */}
          {otherPrograms.length ? (
            <section className="un-block">
              <h2 className="un-block-title">{tr('Digər ixtisaslar', locale)}</h2>
              <div className="np-grid">
                {otherPrograms.map((p) => (
                  <Link key={p.slug} href={`/${locale}/ixtisaslar/${p.slug}`} className="np-card">
                    <span className="np-card-body">
                      <h3 className="np-card-title">{p.title}</h3>
                      <span className="np-meta">
                        <span className="np-chip">{tr(DEGREE_LABEL[p.degree], locale)}</span>
                        {p.durationYears ? <span className="np-date">{p.durationYears} {tr('il', locale)}</span> : null}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <div style={{ paddingBottom: '48px' }}>
            {!sideHas ? (
              <CorrectionIsland
                targetType="general"
                targetSlug={slug}
                title={program.title}
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
