// ── Kampus həyatı (server component) ─────────────────────────────────
// Bento (campusx) — dizayn və quruluş dəyişməyib. F5.50: bütün kartlar real
// səhifələrə aparır, mətnlər saytın mənbəli səhifələrindəndir (Tələbə həyatı,
// İdman, Mədəniyyət və yaradıcılıq, Yataqxana, TGT, TEC, Təqaüd, Əcnəbi
// tələbələr); mənbəsiz rəqəmlər («30+ klub», «200+ tədbir», «2031 →») və
// olmayan xidmətlər (360° tur, AI laboratoriyası, psixoloji xidmət) çıxarıldı.
// 3 foto kartı admindən («3. Sayt — Ana səhifə» → «Kampus foto kartları»),
// ehtiyat — Akademiyanın xəbər arxivindən real foto (lib/home-fallback.ts).
//
// CLIENT JS YOXDUR.
import { Fragment, type ReactNode } from 'react';
import { tr, type Locale } from '@/lib/i18n';
import type { CampusPhoto } from '@/lib/home';

// Atribut sırası orijinal markup ilə eynidir (fill → stroke → width → linecap → linejoin)
const sw = (w: string) =>
  ({ fill: 'none', stroke: 'currentColor', strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round' } as const);

const SLOTS = ['cl-feat', 'cl-sport', 'cl-living'] as const;

function PhotoCard({ p, cls }: { p: CampusPhoto; cls: string }) {
  return (
    <a href={p.href} className={`cl-card cl-photo ${cls}`} style={{ backgroundImage: `url('${p.img}')` }}>
      <span className="cl-ov" />
      <span className="cl-tx">
        {p.chip ? <span className="cl-chip">{p.chip}</span> : null}
        <b className="cl-name">{p.title}</b>
        {p.note ? <span className="cl-note">{p.note}</span> : null}
      </span>
    </a>
  );
}

// ── Təşkilat və dərnək tickeri (aria-hidden — dekorativ, iki dəfə təkrarlanır) ──
const CLUBS = [
  'Tələbə Gənclər Təşkilatı',
  'Tələbə Həmkarlar İttifaqı Komitəsi',
  'Tələbə Elmi Cəmiyyəti',
  'Bədii özfəaliyyət dərnəkləri',
  '«Kim? Nə? Harada?»',
  'Könüllülük',
  'Akademiyanın muzeyi',
  'İdman seksiyaları',
];

// ── Mini kartlar (cl-well, cl-events, cl-global) ─────────────────────
const IC: Record<'well' | 'events' | 'global', ReactNode> = {
  well: (
    <svg width="20" height="20" viewBox="0 0 24 24" {...sw('1.8')}>
      <path d="M19.5 12.6L12 20l-7.5-7.4a5 5 0 1 1 7.5-6.6 5 5 0 1 1 7.5 6.6z" />
    </svg>
  ),
  events: (
    <svg width="20" height="20" viewBox="0 0 24 24" {...sw('1.8')}>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <line x1="16" y1="3" x2="16" y2="7" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="4" y1="11" x2="20" y2="11" />
      <path d="M8 15h2v2H8z" />
    </svg>
  ),
  global: (
    <svg width="20" height="20" viewBox="0 0 24 24" {...sw('1.8')}>
      <circle cx="12" cy="12" r="9" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <path d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9z" />
    </svg>
  ),
};

function Mini({
  cls,
  icon,
  name,
  href,
  locale,
  children,
}: {
  cls: string;
  icon: ReactNode;
  name: string;
  href: string;
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <a href={`/${locale}${href}`} className={`cl-card cl-mini ${cls}`}>
      <span className="cl-mic" aria-hidden="true">{icon}</span>
      <b className="cl-name cl-name--ink">{tr(name, locale)}</b>
      <span className="cl-mini-p">{children}</span>
    </a>
  );
}

export default function Campus({ photos, locale }: { photos: CampusPhoto[]; locale: Locale }) {
  const [feat, sport, living] = SLOTS.map((cls, i) => (photos[i] ? <PhotoCard p={photos[i]} cls={cls} /> : null));
  return (
    <section className="campusx" id="kampus">
      <div className="container">
        <div className="cl-grid">
          <div className="cl-intro">
            <div className="cl-eyebrow">{tr('Kampus həyatı', locale)}</div>
            {/* <em> saxlayır → tr() nəticəsi olduğu kimi yerləşdirilir */}
            <h2
              className="cl-title"
              dangerouslySetInnerHTML={{ __html: tr('Təhsildən kənarda da <em>yaşam</em> buradadır', locale) }}
            />
            <p className="cl-lead">
              {tr(
                'Dərs bitəndə Akademiya həyatı davam edir: hovuz və idman seksiyaları, üç tələbə təşkilatı, konsertlər və intellektual yarışlar, 311 yerlik yataqxana.',
                locale
              )}
            </p>
            <div className="cl-cta">
              <a href={`/${locale}/sehife/telebe-heyati`} className="cl-btn">
                {tr('Tələbə həyatı', locale) + ' '}
                <svg width="15" height="15" viewBox="0 0 24 24" {...sw('2.3')} aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
              <a href={`/${locale}/bunlar-ucun/telebeler`} className="cl-btn cl-btn--ghost">
                <i className="ti ti-users" aria-hidden="true" />
                {' ' + tr('Tələbələr üçün', locale)}
              </a>
            </div>
          </div>

          {feat}
          {sport}

          <a href={`/${locale}/sehife/telebe-gencler-teskilati`} className="cl-card cl-clubs">
            <div className="cl-clubs-head">
              <span className="cl-chip cl-chip--gold">{tr('İcma', locale)}</span>
              <span className="cl-stat">{tr('3 təşkilat', locale)}</span>
            </div>
            <b className="cl-name cl-name--ink">{tr('Tələbə təşkilatları və dərnəklər', locale)}</b>
            <div className="cl-ticker" aria-hidden="true">
              <div className="cl-track">
                {[...CLUBS, ...CLUBS].map((c, i) => (
                  <Fragment key={i}>
                    <span>{tr(c, locale)}</span>
                    <i />
                  </Fragment>
                ))}
              </div>
            </div>
          </a>

          {living}

          <a href={`/${locale}/sehife/telebe-elmi-cemiyyeti`} className="cl-card cl-innov">
            <span className="cl-chip cl-chip--future">{tr('2002-ci ildən', locale)}</span>
            <b className="cl-name">{tr('Tələbə Elmi Cəmiyyəti', locale)}</b>
            <p className="cl-innov-p">
              {tr('Tələbələri elmi işə cəlb edir: kafedrada elmi rəhbər, müsabiqələr və konfrans çıxışları.', locale)}
            </p>
            <ul className="cl-il">
              <li>{tr('Elmi seminarlar', locale)}</li>
              <li>{tr('Olimpiadalar və debatlar', locale)}</li>
              <li>{tr('Hər yaz tələbə konfransı', locale)}</li>
            </ul>
          </a>

          <Mini cls="cl-well" icon={IC.well} name="Təqaüd və sosial dəstək" href="/sehife/sosial-teminat-ve-maddi-yardim" locale={locale}>
            {tr('Forma, dərslik və yemək ödənişsizdir; fərqlənənlərə ASCO təqaüdü.', locale)}
          </Mini>

          <Mini cls="cl-events" icon={IC.events} name="Tədbirlər təqvimi" href="/tedbirler" locale={locale}>
            {tr('Konsertlər, yarışlar və seminarlar: hamısı bir təqvimdə.', locale)}
          </Mini>

          <Mini cls="cl-global" icon={IC.global} name="Əcnəbi tələbələr" href="/sehife/ecnebi-telebelerin-tehsili" locale={locale}>
            {tr('İngilis dilində tədris, qəbul qaydaları və gəliş bələdçisi.', locale)}
          </Mini>
        </div>
      </div>
    </section>
  );
}
