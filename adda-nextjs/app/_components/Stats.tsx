// ── Faza 1 / Stats (server component) ────────────────────────────────
// "Rəqəmlərlə ADDA". Əvvəl HomeClient MARKUP-ında idi.
// Sayğac animasiyası StatsIsland-dadır (əvvəl ui.js bölmə 4).
// data-target dəyərləri contract-dır — island onları oxuyur.
import { tr, type Locale } from '@/lib/i18n';
import StatsIsland from './StatsIsland';

type Stat = { target: number; suffix: 'plus' | 'pct'; label: string; desc: string };

const STATS: Stat[] = [
  { target: 12000, suffix: 'plus', label: 'Məzun', desc: 'Dünya donanmalarında xidmət edən peşəkar dənizçilər nəsli.' },
  { target: 8000, suffix: 'plus', label: 'Beynəlxalq sertifikat', desc: 'STCW tələblərinə uyğun verilmiş peşə sənədləri.' },
  { target: 15, suffix: 'plus', label: 'Tam missiya simulyatoru', desc: 'Körpü və maşın otağı üzrə real təlim ssenariləri.' },
  { target: 47, suffix: 'plus', label: 'Beynəlxalq tərəfdaş', desc: 'Universitetlər və aparıcı gəmiçilik şirkətləri ilə əməkdaşlıq.' },
  { target: 25, suffix: 'plus', label: 'İxtisas proqramı', desc: 'Bakalavriat və magistratura pillələri üzrə seçim.' },
  { target: 100, suffix: 'pct', label: 'İşlə təminat statusu', desc: 'Son buraxılış məzunlarının məşğulluq göstəricisi.' },
];

export default function Stats({ locale }: { locale: Locale }) {
  return (
    <section className="statsec">
      <i className="ti ti-compass stat-wm" />
      <div className="container statsec-in">
        <div className="statsec-head">
          <div className="stx-eyebrow">{tr('Rəqəmlərlə ADDA', locale)}</div>
          {/* <em> saxlayır → tam-sətir tr() nəticəsi olduğu kimi yerləşdirilir */}
          <h3
            className="stx-title"
            dangerouslySetInnerHTML={{ __html: tr('Fəaliyyətimiz — <em>rəqəmlərin</em> dilində', locale) }}
          />
          <p className="stx-lead">
            {tr('Ənənə, beynəlxalq standart və real nəticə: akademiyanın bugünkü potensialını ən yaxşı rəqəmlər danışır.', locale)}
          </p>
        </div>

        <div className="statsec-grid">
          {STATS.map((s, i) => (
            <div className="stx" key={i}>
              <div className="num" data-target={s.target}>
                <span>0</span>
                <span className={s.suffix}>{s.suffix === 'pct' ? '%' : '+'}</span>
              </div>
              <div className="label">{tr(s.label, locale)}</div>
              <p className="stx-desc">{tr(s.desc, locale)}</p>
            </div>
          ))}
        </div>

        <p className="stx-note">
          {tr('Göstəricilər 2025/2026 tədris ili üzrə yenilənir; rəsmi hesabatlarla təsdiqlənən dəyərlər dərcdən əvvəl dəqiqləşdirilir.', locale)}
        </p>
      </div>

      {/* Davranış: görünəndə sayğac animasiyası */}
      <StatsIsland locale={locale} />
    </section>
  );
}
