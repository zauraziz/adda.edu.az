// ── Faza 1 / Campus (server component) ───────────────────────────────
// "ADDA-da yaşam" (campusx · bento) bölməsi. Əvvəl HomeClient MARKUP-ında idi.
// Mətnlər tr() (exact-match) ilə — 39/39 sətir T-də mövcuddur, tərcümələr
// dəyişməyib. Başlıq <em> saxladığı üçün tam-sətir girişi ilə verilir.
//
// CLIENT JS YOXDUR. public/home/ui.js-dəki təqvim kodu (.cal-d / .cal-ev) bu
// bölməyə AİD DEYİLDİ — uyğun markup repoda heç yerdə yox idi (ölü kod), ona
// görə island yaradılmadı, ui.js tamamilə silindi. .cal-* CSS (home.css)
// da ölüdür → Faza 1 yekununda təmizlənəcək.
import { Fragment, type ReactNode } from 'react';
import { tr, type Locale } from '@/lib/i18n';

// Atribut sırası orijinal markup ilə eynidir (fill → stroke → width → linecap → linejoin)
const sw = (w: string) =>
  ({ fill: 'none', stroke: 'currentColor', strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round' } as const);

// ── Foto kartlar (cl-feat, cl-sport, cl-living) ──────────────────────
type Photo = { cls: string; img: string; chip: string; name: string; note: string };

const PH: Record<'feat' | 'sport' | 'living', Photo> = {
  feat: {
    cls: 'cl-feat',
    img: 'https://images.unsplash.com/photo-1724597500306-a4cbb7d1324e?fm=jpg&q=80&w=1600&auto=format&fit=crop',
    chip: 'İdman · Dəniz',
    name: 'Dəniz klubu',
    note: 'Yelkən, avarçəkmə və sualtı üzgüçülük — Xəzər sənin məşq meydanındır.',
  },
  sport: {
    cls: 'cl-sport',
    img: 'https://images.unsplash.com/photo-1641467613990-b74163e280e3?fm=jpg&q=80&w=1200&h=980&fit=crop',
    chip: 'İdman',
    name: 'İdman kompleksi',
    note: 'Hovuz, döyüş idmanları, fitness və tələbə liqaları.',
  },
  living: {
    cls: 'cl-living',
    img: 'https://images.unsplash.com/photo-1751779057940-43cc385452f7?fm=jpg&q=80&w=1200&auto=format&fit=crop',
    chip: 'Yaşayış',
    name: 'Kampusda yaşam',
    note: 'Yataqxana, coworking guşələri və 24/7 oxu zonaları.',
  },
};

// Faza 2: href="#" → real marşrut (kampus turu · foto kartlar)
function PhotoCard({ p, locale }: { p: Photo; locale: Locale }) {
  return (
    <a href="#" className={`cl-card cl-photo ${p.cls}`} style={{ backgroundImage: `url('${p.img}')` }}>
      <span className="cl-ov" />
      <span className="cl-tx">
        <span className="cl-chip">{tr(p.chip, locale)}</span>
        <b className="cl-name">{tr(p.name, locale)}</b>
        <span className="cl-note">{tr(p.note, locale)}</span>
      </span>
    </a>
  );
}

// ── Klub tickeri (aria-hidden — dekorativ, iki dəfə təkrarlanır) ─────
const CLUBS = [
  'Media klubu',
  'Robototexnika',
  'Debat cəmiyyəti',
  'Şahmat',
  'Dəniz tarixi dərnəyi',
  'Musiqi qrupu',
  'Könüllülər hərəkatı',
  'Foto-video studiya',
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
  locale,
  children,
}: {
  cls: string;
  icon: ReactNode;
  name: string;
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <div className={`cl-card cl-mini ${cls}`}>
      <span className="cl-mic">{icon}</span>
      <b className="cl-name cl-name--ink">{tr(name, locale)}</b>
      <span className="cl-mini-p">{children}</span>
    </div>
  );
}

export default function Campus({ locale }: { locale: Locale }) {
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
                'Dərs cədvəli bitəndə ADDA bitmir. Dəniz klubundan innovasiya məkanına, idman liqalarından festival səhnəsinə — burada bacarıq, dostluq və maraqların üçün ayrıca bir ekosistem var.',
                locale
              )}
            </p>
            <div className="cl-cta">
              <a href="#" className="cl-btn">
                {tr('Kampus turuna qoşul', locale) + ' '}
                <svg width="15" height="15" viewBox="0 0 24 24" {...sw('2.3')}>
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
              <a href="#" className="cl-btn cl-btn--ghost">
                <svg width="15" height="15" viewBox="0 0 24 24" {...sw('1.9')}>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9z" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                </svg>
                {' ' + tr('360° virtual tur', locale)}
              </a>
            </div>
          </div>

          <PhotoCard p={PH.feat} locale={locale} />
          <PhotoCard p={PH.sport} locale={locale} />

          <div className="cl-card cl-clubs">
            <div className="cl-clubs-head">
              <span className="cl-chip cl-chip--gold">{tr('İcma', locale)}</span>
              <span className="cl-stat">{tr('30+ klub', locale)}</span>
            </div>
            <b className="cl-name cl-name--ink">{tr('Klublar və dərnəklər', locale)}</b>
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
          </div>

          <PhotoCard p={PH.living} locale={locale} />

          <div className="cl-card cl-innov">
            {/* rəqəm + ox — üç dildə eynidir, tərcümə olunmur */}
            <span className="cl-chip cl-chip--future">2031 →</span>
            <b className="cl-name">{tr('İnnovasiya məkanı', locale)}</b>
            <p className="cl-innov-p">
              {tr(
                'Simulyasiya mərkəzinin açıq saatları, AI laboratoriyası və maker-space — ideyanı prototipə çevir.',
                locale
              )}
            </p>
            <ul className="cl-il">
              <li>{tr('VR körpü sessiyaları', locale)}</li>
              <li>{tr('AI & data klinikaları', locale)}</li>
              <li>{tr('3D emalatxana', locale)}</li>
            </ul>
          </div>

          <Mini cls="cl-well" icon={IC.well} name="Rifah və dəstək" locale={locale}>
            {tr('Psixoloji xidmət, tibb məntəqəsi və mentorluq — özünü yaxşı hiss etməyin sistemi.', locale)}
          </Mini>

          <Mini cls="cl-events" icon={IC.events} name="Tədbir təqvimi" locale={locale}>
            {tr('Dənizçi günü, festivallar, konsertlər və idman turnirləri — il boyu', locale)}{' '}
            <b className="cl-b">{tr('200+ tədbir', locale)}</b>.
          </Mini>

          <Mini cls="cl-global" icon={IC.global} name="Qlobal icma" locale={locale}>
            {tr('Beynəlxalq tələbə klubu, dil tandemləri və mədəniyyət axşamları.', locale)}
          </Mini>
        </div>
      </div>
    </section>
  );
}
