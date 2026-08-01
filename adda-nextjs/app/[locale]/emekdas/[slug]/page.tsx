// K26-11 — /[locale]/emekdas/[slug] — əməkdaşın fərdi profili.
//
// TAB-LAR YALNIZ MƏZMUNU OLANDA GÖRÜNÜR. Ştatdan gələn 162 nəfərin hazırda
// yalnız adı, vəzifəsi və bölməsi var — 6 boş tab göstərmək səhifəni sınıq
// göstərərdi. Tab siyahısı hər profil üçün ayrıca hesablanır.
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
import '../../../_styles/28-staff.css';
import '../../../_styles/29-directory.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { marked } from 'marked';
import SiteHeaderStack from '../../../_components/SiteHeaderStack';
import Footer from '../../../_components/Footer';
import CorrectionIsland from '../../../_components/CorrectionIsland';
import {
  getMenu,
  getPersonBySlug,
  getPersonSlugs,
  getPersonArticles,
  mediaUrl,
  type Article,
  type PersonFull,
  type SiteMenu,
} from '@/lib/strapi';
import { tr, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';
import { fmtDate } from '@/lib/format';

export const revalidate = 300;

const DEGREE_LABEL: Record<string, string> = {
  elmler_doktoru: 'Elmlər doktoru',
  felsefe_doktoru: 'Fəlsəfə doktoru',
  yoxdur: '',
};
const LANG_LABEL: Record<string, string> = {
  az: 'Azərbaycan',
  tr: 'Türk',
  en: 'İngilis',
  ru: 'Rus',
  diger: 'Digər',
};

/** Elmi identifikator -> xarici profil URL-i. Yalnız formatı məlum olanlar. */
const SCHOLAR_HREF: Record<string, (v: string) => string | null> = {
  orcid: (v) => `https://orcid.org/${v}`,
  scopusAuthorId: (v) => `https://www.scopus.com/authid/detail.uri?authorId=${v}`,
  researcherId: (v) => `https://www.webofscience.com/wos/author/record/${v}`,
  googleScholar: (v) => (v.startsWith('http') ? v : `https://scholar.google.com/citations?user=${v}`),
  spin: () => null,
};
const SCHOLAR_LABEL: Record<string, string> = {
  spin: 'SPIN-kod',
  orcid: 'ORCID',
  researcherId: 'ResearcherID',
  scopusAuthorId: 'Scopus AuthorID',
  googleScholar: 'Google Scholar',
};

export async function generateStaticParams() {
  const slugs = await getPersonSlugs('az').catch(() => [] as string[]);
  return slugs.flatMap((slug) => ['az', 'ru', 'en'].map((locale) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const p = await getPersonBySlug(slug, locale).catch(() => null);
  if (!p) return { title: tr('Əməkdaş', locale) };
  const post = p.roles?.[0]?.position ?? p.position ?? '';
  return { title: p.name, description: post ? `${p.name} — ${tr(post, locale)}` : p.name };
}

function nonEmpty(s: string | null | undefined): boolean {
  return Boolean(s && s.trim());
}

export default async function PersonPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;

  const [menu, person] = await Promise.all([
    getMenu(locale).catch(() => null as SiteMenu | null),
    getPersonBySlug(slug, locale).catch(() => null as PersonFull | null),
  ]);
  if (!person) notFound();

  const news = await getPersonArticles(slug, locale, 6).catch(() => [] as Article[]);

  const roles = person.roles ?? [];
  const areas = person.researchAreas ?? [];
  const langs = person.languages ?? [];
  const pubs = person.publications ?? [];
  const exp = [...(person.experience ?? [])].sort((a, b) => (b.sortYear ?? 0) - (a.sortYear ?? 0));
  const edu = [...(person.education ?? [])].sort((a, b) => (b.sortYear ?? 0) - (a.sortYear ?? 0));
  const scholar = person.scholar ?? null;
  const scholarRows = scholar
    ? (Object.keys(SCHOLAR_LABEL) as (keyof typeof SCHOLAR_LABEL)[])
        .map((k) => ({ key: k, value: (scholar as unknown as Record<string, string | null>)[k] }))
        .filter((r) => nonEmpty(r.value))
    : [];

  const photo = mediaUrl(person.photo);
  const degree = person.academicDegree ? DEGREE_LABEL[person.academicDegree] : '';

  // Tab-lar: yalnız məzmunu olanlar. `home` həmişə var.
  const tabs: { id: string; label: string }[] = [{ id: 'esas', label: tr('Əsas səhifə', locale) }];
  if (nonEmpty(person.teaching)) tabs.push({ id: 'tedris', label: tr('Tədris', locale) });
  if (pubs.length) tabs.push({ id: 'nesrler', label: tr('Nəşrlər və tədqiqatlar', locale) });
  if (exp.length) tabs.push({ id: 'tecrube', label: tr('İş təcrübəsi', locale) });
  if (nonEmpty(person.other)) tabs.push({ id: 'diger', label: tr('Digər', locale) });
  if (news.length) tabs.push({ id: 'xeberler', label: tr('Xəbərlərdə', locale) });

  const bioHtml = nonEmpty(person.bio) ? await marked.parse(person.bio as string) : '';
  const teachHtml = nonEmpty(person.teaching) ? await marked.parse(person.teaching as string) : '';
  const respHtml = nonEmpty(person.responsibilities)
    ? await marked.parse(person.responsibilities as string)
    : '';
  const otherHtml = nonEmpty(person.other) ? await marked.parse(person.other as string) : '';

  const correctionLabels: Record<string, string> = {
    title: tr('Düzəliş təklif et', locale),
    subtitle: tr('Səhv gördünüzsə bizə bildirin.', locale),
    fieldLabel: tr('Hansı sahə?', locale),
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
  };

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main>
        <section className="np-hero">
          <div className="container np-hero-inner prf-top">
            <div className="prf-avatar">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt={person.name} />
              ) : (
                <span className="prf-avatar-fallback">{person.name.trim()[0]}</span>
              )}
            </div>
            <div className="prf-ident">
              <div className="np-eyebrow">{tr('Əməkdaş', locale)}</div>
              <h1 className="np-h1 prf-name">{person.name}</h1>
              {roles.length ? (
                <ul className="prf-roles">
                  {roles.map((r, i) => (
                    <li key={`${r.position}-${i}`}>
                      {tr(r.position, locale)}
                      {r.unitName ? <span className="prf-role-unit"> — {tr(r.unitName, locale)}</span> : null}
                    </li>
                  ))}
                </ul>
              ) : null}
              {nonEmpty(person.academicTitle) || nonEmpty(degree) ? (
                <p className="prf-rank">
                  {[person.academicTitle, degree].filter(nonEmpty).map((v) => tr(v as string, locale)).join(' · ')}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="np-wrap">
          <div className="container prf-grid">
            <aside className="prf-side">
              <h2 className="prf-side-title">{tr('Əlaqə', locale)}</h2>
              <ul className="prf-facts">
                {person.email ? (
                  <li>
                    <span className="prf-fact-k">{tr('E-poçt', locale)}</span>
                    <a className="prf-fact-v dir-link" href={`mailto:${person.email}`}>{person.email}</a>
                  </li>
                ) : null}
                {person.phone ? (
                  <li>
                    <span className="prf-fact-k">{tr('Telefon', locale)}</span>
                    <a className="prf-fact-v dir-link" href={`tel:${person.phone.replace(/[^\d+]/g, '')}`}>
                      {person.phone}
                    </a>
                  </li>
                ) : null}
                {nonEmpty(person.building) ? (
                  <li>
                    <span className="prf-fact-k">{tr('Tədris binası', locale)}</span>
                    <span className="prf-fact-v">{tr(person.building as string, locale)}</span>
                  </li>
                ) : null}
                {nonEmpty(person.office) ? (
                  <li>
                    <span className="prf-fact-k">{tr('İş otağı', locale)}</span>
                    <span className="prf-fact-v">{tr(person.office as string, locale)}</span>
                  </li>
                ) : null}
                {!person.email && !person.phone && !nonEmpty(person.office) && !nonEmpty(person.building) ? (
                  <li className="prf-fact-none">{tr('Əlaqə məlumatı əlavə olunmayıb.', locale)}</li>
                ) : null}
              </ul>

              {langs.length ? (
                <>
                  <h2 className="prf-side-title">{tr('Dil bilikləri', locale)}</h2>
                  <ul className="prf-facts">
                    {langs.map((l, i) => (
                      <li key={`${l.lang}-${i}`}>
                        <span className="prf-fact-k">{tr(LANG_LABEL[l.lang] ?? l.lang, locale)}</span>
                        {l.level ? <span className="prf-fact-v">{tr(l.level, locale)}</span> : null}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              {scholarRows.length ? (
                <>
                  <h2 className="prf-side-title">{tr('Elmi identifikatorlar', locale)}</h2>
                  <ul className="prf-facts">
                    {scholarRows.map((r) => {
                      const href = SCHOLAR_HREF[r.key]?.(r.value as string) ?? null;
                      return (
                        <li key={r.key}>
                          <span className="prf-fact-k">{SCHOLAR_LABEL[r.key]}</span>
                          {href ? (
                            <a
                              className="prf-fact-v dir-link"
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {r.value}
                            </a>
                          ) : (
                            <span className="prf-fact-v">{r.value}</span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : null}

              {areas.length ? (
                <>
                  <h2 className="prf-side-title">{tr('Peşəkar maraqlar', locale)}</h2>
                  <ul className="dir-tags prf-tags">
                    {areas.map((a, i) => (
                      <li key={`${a.label}-${i}`} className="np-chip dir-tag">
                        {tr(a.label, locale)}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </aside>

            <div className="prf-main">
              {tabs.length > 1 ? (
                <nav className="stf-tabs prf-tabs" aria-label={tr('Bölmələr', locale)}>
                  {tabs.map((t) => (
                    <a key={t.id} href={`#${t.id}`} className="stf-tab">
                      {t.label}
                    </a>
                  ))}
                </nav>
              ) : null}

              <section id="esas" className="prf-sec">
                <h2 className="stf-sec-title">{tr('Əsas səhifə', locale)}</h2>
                {bioHtml ? (
                  <div className="na-body" dangerouslySetInnerHTML={{ __html: bioHtml }} />
                ) : (
                  <p className="prf-none">{tr('Bu əməkdaş haqqında ətraflı məlumat hazırlanır.', locale)}</p>
                )}
                {respHtml ? (
                  <>
                    <h3 className="prf-sub">{tr('Səlahiyyətlər və vəzifələr', locale)}</h3>
                    <div className="na-body" dangerouslySetInnerHTML={{ __html: respHtml }} />
                  </>
                ) : null}
                {edu.length ? (
                  <>
                    <h3 className="prf-sub">{tr('Təhsil və elmi dərəcələr', locale)}</h3>
                    <ol className="prf-time">
                      {edu.map((e, i) => (
                        <li key={`${e.period}-${i}`}>
                          <span className="prf-time-when">{e.period}</span>
                          <span className="prf-time-what">
                            <strong>{tr(e.institution, locale)}</strong>
                            {e.qualification ? <em>{tr(e.qualification, locale)}</em> : null}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </>
                ) : null}
              </section>

              {teachHtml ? (
                <section id="tedris" className="prf-sec">
                  <h2 className="stf-sec-title">{tr('Tədris', locale)}</h2>
                  <div className="na-body" dangerouslySetInnerHTML={{ __html: teachHtml }} />
                </section>
              ) : null}

              {pubs.length ? (
                <section id="nesrler" className="prf-sec">
                  <h2 className="stf-sec-title">{tr('Nəşrlər və tədqiqatlar', locale)}</h2>
                  <ul className="prf-pubs">
                    {pubs.map((p, i) => (
                      <li key={`${p.title}-${i}`}>
                        {p.url ? (
                          <a href={p.url} target="_blank" rel="noopener noreferrer" className="dir-link">
                            {p.title}
                          </a>
                        ) : (
                          <span>{p.title}</span>
                        )}
                        <span className="prf-pub-meta">
                          {[p.source, p.year ? String(p.year) : null].filter(Boolean).join(' · ')}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {exp.length ? (
                <section id="tecrube" className="prf-sec">
                  <h2 className="stf-sec-title">{tr('İş təcrübəsi', locale)}</h2>
                  <ol className="prf-time">
                    {exp.map((e, i) => (
                      <li key={`${e.period}-${i}`}>
                        <span className="prf-time-when">{e.period}</span>
                        <span className="prf-time-what">
                          <strong>{tr(e.organization, locale)}</strong>
                          {e.position ? <em>{tr(e.position, locale)}</em> : null}
                        </span>
                      </li>
                    ))}
                  </ol>
                </section>
              ) : null}

              {otherHtml ? (
                <section id="diger" className="prf-sec">
                  <h2 className="stf-sec-title">{tr('Digər', locale)}</h2>
                  <div className="na-body" dangerouslySetInnerHTML={{ __html: otherHtml }} />
                </section>
              ) : null}

              {news.length ? (
                <section id="xeberler" className="prf-sec">
                  <h2 className="stf-sec-title">{tr('Xəbərlərdə', locale)}</h2>
                  <div className="np-grid">
                    {news.map((a) => {
                      const img = mediaUrl(a.cover);
                      return (
                        <Link key={a.documentId} href={`/${locale}/xeberler/${a.slug}`} className="np-card">
                          <span
                            className="np-card-media"
                            style={img ? { backgroundImage: `url('${img}')` } : undefined}
                          />
                          <span className="np-card-body">
                            <span className="np-date">{fmtDate(a.newsDate ?? a.publishedAt, locale)}</span>
                            <h3 className="np-card-title">{a.title}</h3>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              <div className="prf-correction">
                <CorrectionIsland
                  targetType="person"
                  targetSlug={slug}
                  title={person.name}
                  locale={locale}
                  labels={correctionLabels}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
