// F5.18e — proqram detal səhifəsi: 5 illik qəbul balı qrafiki.
//
// NİYƏ ÖZ SVG-Sİ: package.json-da charting kitabxanası yoxdur və bu tapşırıq
// üçün biri ƏLAVƏ EDİLMİR — 5 il × 2 seriya üçün asılılıqsız SVG kifayətdir.
// Server komponentidir (klient JS yoxdur, tooltip/animasiya yoxdur), LeaderCard.tsx
// ilə eyni qayda: `locale` prop kimi gəlir, `tr()` birbaşa burada çağırılır.
import { tr, type Locale } from '@/lib/i18n';
import type { ProgramAdmissionScore } from '@/lib/strapi';

const CHART_HEIGHT = 140;
const BAR_WIDTH = 20;
const BAR_GAP = 6;
const GROUP_WIDTH = BAR_WIDTH * 2 + BAR_GAP + 24;
const TOP_PAD = 22;
const BOTTOM_PAD = 26;
const SIDE_PAD = 16;

export default function AdmissionScoreChart({
  scores,
  locale,
}: {
  scores: ProgramAdmissionScore[];
  locale: Locale;
}) {
  const rows = [...scores].sort((a, b) => a.year - b.year);
  const values = rows.flatMap((r) => [r.minScorePaid, r.minScoreFree]).filter((v): v is number => v != null);
  const maxValue = values.length ? Math.max(...values) : 0;
  // Sıfıra bölünmə qorunması + ən yuxarı çubuğun tavana yapışmaması üçün 10% pay.
  const scaleMax = maxValue > 0 ? maxValue * 1.1 : 1;

  const width = rows.length * GROUP_WIDTH + SIDE_PAD * 2;
  const height = TOP_PAD + CHART_HEIGHT + BOTTOM_PAD;
  const baseY = TOP_PAD + CHART_HEIGHT;

  function barHeight(v: number | null): number {
    if (v == null) return 0;
    return Math.round((v / scaleMax) * CHART_HEIGHT);
  }

  return (
    <div className="pr-chart-scroll">
      <svg
        className="pr-chart"
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label={tr('İllər üzrə minimum qəbul balı (ödənişsiz/ödənişli)', locale)}
      >
        <line x1={SIDE_PAD} y1={baseY} x2={width - SIDE_PAD} y2={baseY} className="pr-chart-axis" />
        {rows.map((r, i) => {
          const gx = SIDE_PAD + i * GROUP_WIDTH;
          const freeH = barHeight(r.minScoreFree);
          const paidH = barHeight(r.minScorePaid);
          const freeX = gx + 12;
          const paidX = freeX + BAR_WIDTH + BAR_GAP;
          return (
            <g key={r.year}>
              {r.minScoreFree != null ? (
                <>
                  <rect
                    x={freeX}
                    y={baseY - freeH}
                    width={BAR_WIDTH}
                    height={freeH}
                    className="pr-chart-bar pr-chart-bar--free"
                  />
                  <text x={freeX + BAR_WIDTH / 2} y={baseY - freeH - 6} className="pr-chart-value">
                    {r.minScoreFree}
                  </text>
                </>
              ) : null}
              {r.minScorePaid != null ? (
                <>
                  <rect
                    x={paidX}
                    y={baseY - paidH}
                    width={BAR_WIDTH}
                    height={paidH}
                    className="pr-chart-bar pr-chart-bar--paid"
                  />
                  <text x={paidX + BAR_WIDTH / 2} y={baseY - paidH - 6} className="pr-chart-value">
                    {r.minScorePaid}
                  </text>
                </>
              ) : null}
              <text x={gx + GROUP_WIDTH / 2} y={baseY + 18} className="pr-chart-year">
                {r.year}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="pr-chart-legend">
        <span className="pr-chart-legend-item">
          <span className="pr-chart-swatch pr-chart-swatch--free" aria-hidden="true" />
          {tr('Ödənişsiz', locale)}
        </span>
        <span className="pr-chart-legend-item">
          <span className="pr-chart-swatch pr-chart-swatch--paid" aria-hidden="true" />
          {tr('Ödənişli', locale)}
        </span>
      </div>
    </div>
  );
}
