// ── Faza 1 / Intl (server component) ─────────────────────────────────
// "Beynəlxalq əməkdaşlıq və nüfuz" (intlx · cobe qlobus) bölməsi.
// Əvvəl HomeClient MARKUP-ında idi. Mətnlər tr() (exact-match) ilə —
// tərcümələr dəyişmir. Başlıq <em> saxladığı üçün tam-sətir girişi ilə verilir.
//
// JS contract ID-ləri: #ixStage · #ixGlobe — IntlGlobe adası bunlara bağlanır.
// Qlobusun özü client island-dadır (IntlGlobe.tsx, cobe dinamik import).
import { tr, type Locale } from '@/lib/i18n';
import { intlCities } from '@/lib/intl-cities';
import IntlGlobe from './IntlGlobe';

// Atribut sırası orijinal markup ilə eynidir (fill → stroke → width → linecap → linejoin)
const sw = (w: string) =>
  ({ fill: 'none', stroke: 'currentColor', strokeWidth: w, strokeLinecap: 'round', strokeLinejoin: 'round' } as const);

// Rəqəm dildən asılı deyil, etiket tərcümə olunur.
const STATS: { n: string; label: string }[] = [
  { n: '47+', label: 'Tərəfdaş qurum' },
  { n: '5', label: 'Qitə' },
  { n: '20+', label: 'Mübadilə istiqaməti' },
];

// Beynəlxalq abbreviaturalar — üç dildə eynidir, tərcümə olunmur.
const ORGS: { icon: string; name: string }[] = [
  { icon: 'ti-anchor', name: 'IMO' },
  { icon: 'ti-world', name: 'IAMU' },
  { icon: 'ti-shield-check', name: 'EMSA' },
  { icon: 'ti-certificate', name: 'STCW' },
  { icon: 'ti-school', name: 'Erasmus+' },
  { icon: 'ti-ship', name: 'TURMARIN' },
  { icon: 'ti-building-bank', name: 'ASCO' },
];

export default function Intl({ locale }: { locale: Locale }) {
  return (
    <section className="intlx" id="beynelxalq">
      <div className="container">
        <div className="ix-grid">
          <div className="ix-tx">
            <div className="ix-eyebrow">{tr('Beynəlxalq əməkdaşlıq və nüfuz', locale)}</div>
            {/* <em> saxlayır → tr() nəticəsi olduğu kimi yerləşdirilir */}
            <h2
              className="ix-title"
              dangerouslySetInnerHTML={{ __html: tr('Bakıdan <em>dünyaya</em> uzanan şəbəkə', locale) }}
            />
            <p className="ix-lead">
              {tr(
                'ADDA 5 qitədə 47-dən çox universitet, dənizçilik akademiyası və beynəlxalq qurumla əməkdaşlıq edir. IAMU üzvlüyü, Erasmus+ mobillik proqramları və TURMARIN regional şəbəkəsi tələbələrimizə qlobal təhsil trayektoriyası açır — məzunlarımız dünya donanmalarında, beynəlxalq limanlarda və IMO strukturlarında çalışırlar.',
                locale
              )}
            </p>
            <div className="ix-stats">
              {STATS.map((s) => (
                <div className="ix-stat" key={s.label}>
                  <b>{s.n}</b>
                  <span>{tr(s.label, locale)}</span>
                </div>
              ))}
            </div>
            <div className="ix-cta">
              {/* Faza 2: href="#" → real marşrut */}
              <a href="#" className="ix-btn">
                {tr('Partnyorluq təklifi', locale) + ' '}
                <svg width="15" height="15" viewBox="0 0 24 24" {...sw('2.3')}>
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
              <a href="#" className="ix-btn ix-btn--ghost">{tr('Mübadilə proqramları', locale)}</a>
            </div>
          </div>

          <div className="ix-globe-wrap">
            <div className="ix-stage" id="ixStage">
              <div className="ix-static" aria-hidden="true" />
              <canvas id="ixGlobe" aria-label={tr('İnteraktiv qlobus — tərəfdaş şəhərlər', locale)} />
            </div>
            <div className="ix-hint">
              <span className="ix-drag">
                <svg width="14" height="14" viewBox="0 0 24 24" {...sw('2')}>
                  <polyline points="9 6 4 12 9 18" />
                  <polyline points="15 6 20 12 15 18" />
                </svg>
                {' ' + tr('Sürüşdür və fırlat', locale)}
              </span>
              <span className="ix-leg"><i className="ix-dot ix-dot--home" />{' ' + tr('Bakı', locale)}</span>
              <span className="ix-leg"><i className="ix-dot" />{' ' + tr('Tərəfdaş şəhər', locale)}</span>
            </div>
            <p className="ix-cities">
              {tr('İstanbul · Varna · Gdynia · Rotterdam · Sautgempton · Tokio · Şanxay · İsgəndəriyyə · Konstansa', locale)}
            </p>
          </div>
        </div>

        <div className="ix-orgs">
          <span className="ix-orgs-label">{tr('Etibar şəbəkəsi', locale)}</span>
          <div className="ix-chiprow">
            {ORGS.map((o) => (
              <span className="ix-org" key={o.name}><i className={`ti ${o.icon}`} />{' ' + o.name}</span>
            ))}
          </div>
        </div>
      </div>

      <IntlGlobe cities={intlCities(locale)} />
    </section>
  );
}
