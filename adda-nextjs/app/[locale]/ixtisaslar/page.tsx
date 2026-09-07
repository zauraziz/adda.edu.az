// K26 / F5.17 — /[locale]/ixtisaslar
// K26-3-de menyudan bura link qoymusdum, amma siyahi sehifesi yox idi -> 404.
//
// F5.17 — kart toru YERİNƏ dərəcə tabları (Bakalavr/Magistr, klik ilə keçid)
// + fakültəyə görə qruplaşdırılmış sətir siyahısı + ad üzrə axtarış.
// Tərcümə/qruplaşdırma BURADA (server), interaktivlik ProgramDirectoryIsland-da
// (StaffDirectory/StaffDirectoryIsland ilə eyni iş bölgüsü, bax o fayllar).
// `Doktorantura` proqram yoxdursa tab da yoxdur — `.filter((g) => g.items.length)`
// K26-dan bəri dəyişməyib, sadəcə H2 bölmələri tab keçidinə çevrilib.
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
import '../../_styles/29-directory.css';
import '../../_styles/38-programs-list.css';
import type { Metadata } from 'next';
import SiteHeaderStack from '../../_components/SiteHeaderStack';
import Footer from '../../_components/Footer';
import ProgramDirectoryIsland, {
  type ProgramDegreeGroup,
  type ProgramRow,
} from '../../_components/ProgramDirectoryIsland';
import { getMenu, getPrograms, type Program, type SiteMenu } from '@/lib/strapi';
import { tr, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';

export const revalidate = 300;

const DEGREE: Record<Program['degree'], string> = {
  bachelor: 'Bakalavriat',
  master: 'Magistratura',
  phd: 'Doktorantura',
};

// F5.8a — dil DEYİL, fakt (bax ProgramDetail eyni sabit, [slug]/page.tsx — TOXUNULMUR).
const STUDY_FORM_LABEL: Record<NonNullable<Program['studyForm']>, string> = {
  eyani: 'Əyani',
  qiyabi: 'Qiyabi',
};

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
    description: tr('Bakalavriat, magistratura və doktorantura proqramları.', locale),
  };
}

export default async function ProgramListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  const [menu, programs] = await Promise.all([
    getMenu(locale).catch(() => null as SiteMenu | null),
    getPrograms(locale).catch(() => [] as Program[]),
  ]);

  const groups: ProgramDegreeGroup[] = (Object.keys(DEGREE) as Program['degree'][])
    .map((d) => ({
      degree: d,
      label: tr(DEGREE[d], locale),
      items: programs
        .filter((p) => p.degree === d)
        .map(
          (p): ProgramRow => ({
            slug: p.slug,
            title: p.title,
            facultyName: p.faculty?.name ?? null,
            durationYears: p.durationYears,
            studyFormLabel: p.studyForm ? tr(STUDY_FORM_LABEL[p.studyForm], locale) : null,
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
            <p className="np-lead">{tr('Bakalavriat, magistratura və doktorantura proqramları.', locale)}</p>
          </div>
        </section>

        <section className="np-wrap">
          <div className="container">
            {groups.length ? (
              <ProgramDirectoryIsland
                groups={groups}
                basePath={`/${locale}/ixtisaslar`}
                labels={{
                  searchPlaceholder: tr('Ad üzrə axtarın', locale),
                  found: tr('Tapıldı', locale),
                  noResults: tr('Heç nə tapılmadı.', locale),
                  colProgram: tr('Proqram', locale),
                  colDuration: tr('Müddət', locale),
                  colForm: tr('Təhsil forması', locale),
                  years: tr('il', locale),
                  other: tr('Digər', locale),
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
