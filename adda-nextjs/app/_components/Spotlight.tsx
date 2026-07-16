// ── Faza 1 / Spotlight (server component) ────────────────────────────
// "Niyə məhz ADDA?" bölməsi. Əvvəl HomeClient MARKUP-ında idi.
// Mətnlər tr() (exact-match) ilə — 20/20 sətir T-də mövcuddur, tərcümələr
// dəyişməyib. Başlıq <em> saxladığı üçün tam-sətir girişi ilə verilir.
import type { ReactNode } from 'react';
import { tr, type Locale } from '@/lib/i18n';

// Atribut sırası orijinal markup ilə eynidir (fill → stroke → width → linecap → linejoin)
const sw = (w: string) => ({ fill: 'none', stroke: 'currentColor', strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round' } as const);

type Why = { icon: ReactNode; title: string; text: string };

const WHY: Why[] = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...sw('1.7')}><circle cx="12" cy="5" r="3" /><line x1="12" y1="8" x2="12" y2="21" /><path d="M5 12H3a9 9 0 0 0 18 0h-2" /></svg>
    ),
    title: '1881-dən gələn ənənə',
    text: 'Xəzər regionunda dənizçilik təhsilinin ən dərin köklərinə sahib məktəb — nəsillərin təcrübəsi bugünkü tədrisdə yaşayır.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...sw('1.7')}><circle cx="12" cy="9" r="6" /><path d="M9.5 14.5L8 22l4-2.5L16 22l-1.5-7.5" /><path d="M10 9l1.5 1.5L14.5 7.5" /></svg>
    ),
    title: 'STCW standartlı hazırlıq',
    text: 'Tədris proqramları IMO konvensiyalarının tələblərinə uyğun qurulub — biliklərin dünya donanmalarında keçərlidir.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...sw('1.7')}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2.5" /><line x1="12" y1="3" x2="12" y2="7" /><line x1="12" y1="17" x2="12" y2="21" /><line x1="3" y1="12" x2="7" y2="12" /><line x1="17" y1="12" x2="21" y2="12" /><line x1="6" y1="6" x2="8.5" y2="8.5" /><line x1="15.5" y1="15.5" x2="18" y2="18" /><line x1="18" y1="6" x2="15.5" y2="8.5" /><line x1="8.5" y1="15.5" x2="6" y2="18" /></svg>
    ),
    title: 'Tam missiya simulyatorları',
    text: 'Körpü və maşın otağı simulyasiya mərkəzində dənizə çıxmazdan əvvəl yüzlərlə real ssenari yaşayırsan.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...sw('1.7')}><path d="M2 20a2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1" /><path d="M4 18l-1-5h18l-1 5" /><path d="M5 13V7h6l2 3h6v3" /><path d="M8 7V4h3v3" /></svg>
    ),
    title: 'Dənizdə real təcrübə',
    text: 'Aparıcı gəmiçilik şirkətləri ilə təcrübə proqramları — nəzəriyyə göyərtədə peşəyə çevrilir.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...sw('1.7')}><circle cx="12" cy="12" r="9" /><line x1="3" y1="12" x2="21" y2="12" /><path d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9z" /></svg>
    ),
    title: 'Beynəlxalq tələbə dəstəyi',
    text: 'İngilisdilli modullar, mübadilə proqramları, yataqxana və adaptasiya xidməti — for international students, from day one.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" {...sw('1.7')}><polyline points="3 17 9 11 13 15 21 7" /><polyline points="15 7 21 7 21 13" /></svg>
    ),
    title: 'Karyera perspektivi',
    text: 'Karyera mərkəzi məzunları qlobal əmək bazarına hazırlayır — dəniz peşəsi sərhəd tanımır.',
  },
];

export default function Spotlight({ locale }: { locale: Locale }) {
  return (
    <section className="spotlight" id="spotlight">
      <i className="ti ti-anchor spot-wm" />
      <div className="container">
        <div className="spot-rule"><h2>{tr('Niyə məhz ADDA?', locale)}</h2></div>

        <div className="spot-head">
          {/* <em> saxlayır → tr() nəticəsi olduğu kimi yerləşdirilir */}
          <h3
            className="spot-title serif"
            dangerouslySetInnerHTML={{ __html: tr('Dənizə gedən yol <em>buradan</em> başlayır', locale) }}
          />
          <p className="spot-lead">
            {tr('Xəzərin sahilində, 1881-ci ilə uzanan dənizçilik təhsili ənənəsi üzərində qurulmuş akademiya — beynəlxalq standartlar, real dəniz təcrübəsi və qlobal karyera perspektivi bir ünvanda.', locale)}
          </p>
        </div>

        <div className="why-grid">
          {WHY.map((w, i) => (
            <div className="why-card" key={i}>
              <span className="wc-ic">{w.icon}</span>
              <b>{tr(w.title, locale)}</b>
              <p>{tr(w.text, locale)}</p>
            </div>
          ))}
        </div>

        <div className="spot-cta">
          <p className="spot-cta-note">{tr('Sən də ADDA ailəsinə qoşul:', locale)}</p>
          <a href="#" className="btn-adm">
            {tr('Abituriyent qəbulu', locale) + ' '}
            <svg width="16" height="16" viewBox="0 0 24 24" {...sw('2.3')}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
          </a>
          <a href="#" className="btn-intl">
            <svg width="16" height="16" viewBox="0 0 24 24" {...sw('1.9')}><circle cx="12" cy="12" r="9" /><line x1="3" y1="12" x2="21" y2="12" /><path d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9z" /></svg>
            {' ' + tr('International Admissions', locale)}
          </a>
        </div>
      </div>
    </section>
  );
}
