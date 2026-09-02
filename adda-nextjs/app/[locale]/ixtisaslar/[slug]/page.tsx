// F5.1c — /[locale]/ixtisaslar/[slug]: ixtisas (proqram) səhifəsi.
//
// Struktur bölmə səhifəsi ilə EYNİ dizayn dili (F4.9–F4.13): iki sütun +
// yapışqan yan panel, akkordeon qrupu (ExpandBlock/.un-expand-group, F4.10),
// admin qapısı (AdminGate.tsx), boş sahə heç vaxt render olunmur. Kiçik
// admin-bəzək köməkçiləri (BlockTitle/EmptyBlock/EmptyExpandItem) BURADA
// TƏKRAR YAZILIB — struktur/[slug]/page.tsx-dəki eyniadlı funksiyalar
// import edilmir (hər səhifə öz-özünə kifayətdir, layihənin mövcud
// konvensiyası — bax CLAUDE.md "Komponent xəritəsi").
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
import { AdminProvider, AdminOnly } from '../../../_components/AdminGate';
import { BlockTitle, AdminEditRow, EmptyBlock, EmptyExpandItem } from '../../../_components/AdminOnly';
import { DocList } from '../../../_components/DocList';
import {
  getProgramDetail,
  getProgramDocuments,
  getProgramSlugs,
  getMenu,
  withAzFallback,
  type ProgramDetail,
  type ProgramCourse,
  type SiteMenu,
} from '@/lib/strapi';
import { tr, isLocale, DEFAULT_LOCALE, LOCALES, fallbackNotice, type Locale } from '@/lib/i18n';

export const revalidate = 300;

const DEGREE_LABEL: Record<ProgramDetail['degree'], string> = {
  bachelor: 'Bakalavriat',
  master: 'Magistratura',
  phd: 'Doktorantura',
};

// F5.1c — semestr sırası roman rəqəmlərlə, ƏLİFBA İLƏ YOX (VIII "V"-dən
// əvvəl əlifba sırasına düşərdi). Semestri boş olan sətirlər (məs. üzmə
// təcrübəsi sətirləri) sona düşür.
const SEMESTER_ORDER = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
function semesterRank(s: string | null): number {
  if (!s) return SEMESTER_ORDER.length;
  const i = SEMESTER_ORDER.indexOf(s);
  return i === -1 ? SEMESTER_ORDER.length : i;
}

interface SemesterGroup {
  semester: string | null;
  courses: ProgramCourse[];
}
function groupBySemester(courses: ProgramCourse[]): SemesterGroup[] {
  const map = new Map<string, ProgramCourse[]>();
  for (const c of courses) {
    const key = c.semester ?? '';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(c);
  }
  return [...map.entries()]
    .map(([semester, list]) => ({ semester: semester || null, courses: list }))
    .sort((a, b) => semesterRank(a.semester) - semesterRank(b.semester));
}

// F5.2a — BlockTitle/AdminEditRow/EmptyBlock/EmptyExpandItem/adminUrl
// artıq _components/AdminOnly.tsx-dədir (struktur/ixtisas səhifələri
// eyni komponentləri idxal edir, iki nüsxə saxlanılmır).

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

  const [{ doc: program, isFallback }, menu] = await Promise.all([
    withAzFallback((loc) => getProgramDetail(slug, loc), locale),
    getMenu(locale).catch(() => null as SiteMenu | null),
  ]);

  if (!program) notFound();

  const docs = await getProgramDocuments(program.slug).catch(() => []);

  const overviewHas = Boolean(program.overview);
  const outcomesHas = Boolean(program.outcomes);
  const competenciesHas = Boolean(program.competencies);
  const careerPathsHas = Boolean(program.careerPaths);
  const conventionsHas = Boolean(program.conventions);
  const groupHas = overviewHas || outcomesHas || competenciesHas || careerPathsHas || conventionsHas;

  const coursesHas = Boolean(program.courses.length);
  const semesterGroups = coursesHas ? groupBySemester(program.courses) : [];

  const blockTitleOverview = tr('Proqram haqqında', locale);
  const blockTitleOutcomes = tr('Təlim nəticələri', locale);
  const blockTitleCompetencies = tr('Kompetensiyalar', locale);
  const blockTitleCareerPaths = tr('Karyera imkanları', locale);
  const blockTitleConventions = tr('Konvensiya tələbləri', locale);
  const blockTitlePlan = tr('Tədris planı', locale);

  const fieldStatus = [
    { has: overviewHas, title: blockTitleOverview },
    { has: outcomesHas, title: blockTitleOutcomes },
    { has: competenciesHas, title: blockTitleCompetencies },
    { has: careerPathsHas, title: blockTitleCareerPaths },
    { has: conventionsHas, title: blockTitleConventions },
    { has: coursesHas, title: blockTitlePlan },
  ];
  const openBlockCount = fieldStatus.filter((f) => f.has).length;
  const closedBlockTitles = fieldStatus.filter((f) => !f.has).map((f) => f.title);

  // F4.10 örnəyi — akkordeon qrupu tint ALMIR, amma növbəni irəli aparır ki,
  // tədris planı bloku öz alternasiya növbəsini itirməsin.
  type TopKey = 'group' | 'plan';
  const topSections: { key: TopKey; has: boolean; tintable: boolean }[] = [
    { key: 'group', has: groupHas, tintable: false },
    { key: 'plan', has: coursesHas, tintable: true },
  ];
  let tintCursor = 0;
  const tintByKey = {} as Record<TopKey, boolean>;
  for (const s of topSections) {
    if (!s.has) continue;
    tintByKey[s.key] = s.tintable && tintCursor % 2 === 1;
    tintCursor++;
  }

  const sideHas = Boolean(
    program.code || program.durationYears || program.totalCredits || program.unit || docs.length || program.planYear,
  );

  const factsHas = Boolean(program.degree || program.durationYears || program.totalCredits || program.code);

  const overviewHtml = program.overview ? await marked.parse(program.overview) : '';
  const outcomesHtml = program.outcomes ? await marked.parse(program.outcomes) : '';
  const competenciesHtml = program.competencies ? await marked.parse(program.competencies) : '';
  const careerPathsHtml = program.careerPaths ? await marked.parse(program.careerPaths) : '';
  const conventionsHtml = program.conventions ? await marked.parse(program.conventions) : '';

  const notice = isFallback ? fallbackNotice(locale) : null;

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
            <div className="np-eyebrow">{tr('İxtisas', locale)}</div>
            <h1 className="np-h1">{program.title}</h1>
            <nav className="un-crumbs" aria-label={tr('İxtisas', locale)}>
              <Link href={`/${locale}/ixtisaslar`}>{tr('İxtisaslar', locale)}</Link>
              <span className="un-crumb-sep">/</span> <span className="un-crumb-cur">{program.title}</span>
            </nav>
            {factsHas ? (
              <ul className="un-facts" aria-label={tr('Əsas faktlar', locale)}>
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
              {/* ── F4.10 örnəyi: Proqram haqqında / Təlim nəticələri /
                  Kompetensiyalar / Karyera imkanları / Konvensiya tələbləri —
                  VAHİD akkordeon qrupu, eyni konteyner/davranış, F4.5b tint
                  tətbiq olunmur (bax .un-expand-group, 36-unit.css). ── */}
              {groupHas ? (
                <section className="un-block un-accordion-group">
                  <AdminEditRow uid="api::program.program" documentId={program.documentId} locale={locale} />
                  <div className="un-expand-group">
                    {overviewHas ? (
                      <ExpandBlock label={blockTitleOverview}>
                        <div className="prose" dangerouslySetInnerHTML={{ __html: overviewHtml }} />
                      </ExpandBlock>
                    ) : (
                      <AdminOnly>
                        <EmptyExpandItem uid="api::program.program" title={blockTitleOverview} documentId={program.documentId} locale={locale} />
                      </AdminOnly>
                    )}
                    {outcomesHas ? (
                      <ExpandBlock label={blockTitleOutcomes}>
                        <div className="prose" dangerouslySetInnerHTML={{ __html: outcomesHtml }} />
                      </ExpandBlock>
                    ) : (
                      <AdminOnly>
                        <EmptyExpandItem uid="api::program.program" title={blockTitleOutcomes} documentId={program.documentId} locale={locale} />
                      </AdminOnly>
                    )}
                    {competenciesHas ? (
                      <ExpandBlock label={blockTitleCompetencies}>
                        <div className="prose" dangerouslySetInnerHTML={{ __html: competenciesHtml }} />
                      </ExpandBlock>
                    ) : (
                      <AdminOnly>
                        <EmptyExpandItem uid="api::program.program" title={blockTitleCompetencies} documentId={program.documentId} locale={locale} />
                      </AdminOnly>
                    )}
                    {careerPathsHas ? (
                      <ExpandBlock label={blockTitleCareerPaths}>
                        <div className="prose" dangerouslySetInnerHTML={{ __html: careerPathsHtml }} />
                      </ExpandBlock>
                    ) : (
                      <AdminOnly>
                        <EmptyExpandItem uid="api::program.program" title={blockTitleCareerPaths} documentId={program.documentId} locale={locale} />
                      </AdminOnly>
                    )}
                    {conventionsHas ? (
                      <ExpandBlock label={blockTitleConventions}>
                        <div className="prose" dangerouslySetInnerHTML={{ __html: conventionsHtml }} />
                      </ExpandBlock>
                    ) : (
                      <AdminOnly>
                        <EmptyExpandItem uid="api::program.program" title={blockTitleConventions} documentId={program.documentId} locale={locale} />
                      </AdminOnly>
                    )}
                  </div>
                </section>
              ) : (
                <AdminOnly>
                  <section className="un-block un-accordion-group">
                    <AdminEditRow uid="api::program.program" documentId={program.documentId} locale={locale} />
                    <div className="un-expand-group">
                      <EmptyExpandItem uid="api::program.program" title={blockTitleOverview} documentId={program.documentId} locale={locale} />
                      <EmptyExpandItem uid="api::program.program" title={blockTitleOutcomes} documentId={program.documentId} locale={locale} />
                      <EmptyExpandItem uid="api::program.program" title={blockTitleCompetencies} documentId={program.documentId} locale={locale} />
                      <EmptyExpandItem uid="api::program.program" title={blockTitleCareerPaths} documentId={program.documentId} locale={locale} />
                      <EmptyExpandItem uid="api::program.program" title={blockTitleConventions} documentId={program.documentId} locale={locale} />
                    </div>
                  </section>
                </AdminOnly>
              )}

              {/* ── F5.1c: Tədris planı — akkordeon qrupundan AYRI blok,
                  semestr üzrə qruplaşdırılıb. Mobildə üfüqi sürüşən cədvəl,
                  ilk sütun sabit (bax .pr-plan-scroll, 37-program.css). ── */}
              {coursesHas ? (
                <section className={'un-block' + (tintByKey.plan ? ' un-block--tint' : '')}>
                  <BlockTitle uid="api::program.program" title={blockTitlePlan} documentId={program.documentId} locale={locale} />
                  {program.practiceNote ? <p className="un-mission">{program.practiceNote}</p> : null}
                  {semesterGroups.map((g) => (
                    <div key={g.semester ?? '—'} className="pr-plan-group">
                      <div className="un-sub-title">
                        {g.semester ? tr('Semestr', locale) + ' ' + g.semester : tr('Semestr müəyyən edilməyib', locale)}
                      </div>
                      <div className="pr-plan-scroll">
                        <table className="pr-plan-table">
                          <thead>
                            <tr>
                              <th>{tr('Şifr', locale)}</th>
                              <th>{tr('Fənn', locale)}</th>
                              <th>{tr('Kredit', locale)}</th>
                              <th>{tr('Saat', locale)}</th>
                              <th>{tr('Prerekvizit', locale)}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {g.courses.map((c, i) => (
                              <tr key={i} className={c.isPractice ? 'pr-plan-row--practice' : undefined}>
                                <td>
                                  {c.code}
                                  {c.isPractice ? <span className="pr-plan-badge">{tr('Təcrübə', locale)}</span> : null}
                                </td>
                                <td>{c.name}</td>
                                <td>{c.credits ?? ''}</td>
                                <td>{c.totalHours ?? ''}</td>
                                <td>{c.prerequisite ?? ''}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </section>
              ) : (
                <AdminOnly>
                  <EmptyBlock uid="api::program.program" title={blockTitlePlan} documentId={program.documentId} locale={locale} tint={tintByKey.plan} />
                </AdminOnly>
              )}
            </div>

            {sideHas ? (
              <aside className="un-side">
                {program.code ? (
                  <div>
                    <div className="un-sub-title">{tr('Şifr', locale)}</div>
                    <p className="un-side-text">{program.code}</p>
                  </div>
                ) : null}

                {program.degree ? (
                  <div>
                    <div className="un-sub-title">{tr('Dərəcə', locale)}</div>
                    <p className="un-side-text">{tr(DEGREE_LABEL[program.degree], locale)}</p>
                  </div>
                ) : null}

                {program.durationYears ? (
                  <div>
                    <div className="un-sub-title">{tr('Müddət', locale)}</div>
                    <p className="un-side-text">{program.durationYears} {tr('il', locale)}</p>
                  </div>
                ) : null}

                {program.totalCredits ? (
                  <div>
                    <div className="un-sub-title">{tr('Kredit', locale)}</div>
                    <p className="un-side-text">{program.totalCredits}</p>
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
