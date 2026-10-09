// F5.45 — qəbul səhifələrinin canlı blokları (server komponenti).
//
// Pillə cədvəli, bütün pillələr üzrə cədvəl + keçid balı tarixçəsi,
// ingilisdilli yerlər, açıq qapı günləri və yan panelin «N/N+1 qəbul»
// xülasəsi. Rəqəmlər ixtisas kataloqundandır (lib/admission.ts), boş xana
// «—»; heç nə yoxdursa blok ÜMUMİYYƏTLƏ render olunmur (çağıran yoxlayır).
// Cədvəl üslubu ixtisas səhifəsinin tədris planı ilə eynidir (.pr-plan-*).
import Link from 'next/link';
import type { Article, EventItem } from '@/lib/strapi';
import { LEVEL_LABEL, LEVEL_TABS, rowsForTab, scoreYears, type AdmissionRow, type AdmissionStats } from '@/lib/admission';
import { tr, type Locale } from '@/lib/i18n';
import { fmtDate, fmtDateTime, fmtFee, fmtScore } from '@/lib/format';

const DASH = '—';

function ProgramCell({ row, locale }: { row: AdmissionRow; locale: Locale }) {
  return (
    <>
      <Link href={`/${locale}/ixtisaslar/${row.slug}`}>{row.title}</Link>
      {row.code ? <span className="qb-cell-sub">{row.code}</span> : null}
    </>
  );
}

function SeatsCell({ row, locale }: { row: AdmissionRow; locale: Locale }) {
  if (row.seatsTotal == null) return <>{DASH}</>;
  return (
    <>
      <b>{row.seatsTotal}</b>
      {row.seatParts.length ? (
        <span className="qb-cell-sub">{row.seatParts.map((p) => `${tr(p.label, locale)} ${p.value}`).join(' · ')}</span>
      ) : null}
    </>
  );
}

function ScoreCell({ row, locale }: { row: AdmissionRow; locale: Locale }) {
  const l = row.latest;
  if (!l) return <>{DASH}</>;
  return (
    <>
      {l.minScoreFree != null ? (
        <span className="qb-score">
          {tr('ödənişsiz', locale)}: <b>{fmtScore(l.minScoreFree, locale)}</b>
        </span>
      ) : null}
      {l.minScorePaid != null ? (
        <span className="qb-score">
          {tr('ödənişli', locale)}: <b>{fmtScore(l.minScorePaid, locale)}</b>
        </span>
      ) : null}
      <span className="qb-cell-sub">{l.year}</span>
    </>
  );
}

/** Bir pillənin ixtisasları: dil, yer (bölgü ilə), haqq, son keçid balı. */
export function LevelTable({ rows, locale, showLevel = false }: { rows: AdmissionRow[]; locale: Locale; showLevel?: boolean }) {
  if (!rows.length) return null;
  const seatsYear = rows.reduce<number | null>((m, r) => (r.seatsYear != null && (m == null || r.seatsYear > m) ? r.seatsYear : m), null);
  return (
    <div className="pr-plan-scroll qb-data">
      <table className="pr-plan-table qb-data-table">
        <thead>
          <tr>
            <th>{tr('İxtisas', locale)}</th>
            {showLevel ? <th>{tr('Pillə', locale)}</th> : null}
            <th>{tr('Tədris dili', locale)}</th>
            <th>
              {tr('Plan yerləri', locale)}
              {seatsYear ? ` ${seatsYear}/${String(seatsYear + 1).slice(-2)}` : ''}
            </th>
            <th>{tr('Təhsil haqqı', locale)}</th>
            <th>{tr('Keçid balı', locale)}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.documentId}>
              <td>
                <ProgramCell row={r} locale={locale} />
              </td>
              {showLevel ? <td>{r.tab ? tr(LEVEL_LABEL[r.tab], locale) : DASH}</td> : null}
              <td>{r.langs.length ? r.langs.join(', ') : DASH}</td>
              <td>
                <SeatsCell row={r} locale={locale} />
              </td>
              <td>{r.fee ? fmtFee(r.fee, locale) : DASH}</td>
              <td>
                <ScoreCell row={r} locale={locale} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Keçid balı tarixçəsi: ixtisas × il (ödənişsiz / ödənişli). */
export function ScoreHistory({ rows, locale }: { rows: AdmissionRow[]; locale: Locale }) {
  const withScores = rows.filter((r) => r.scores.length);
  if (!withScores.length) return null;
  const years = scoreYears(withScores);
  return (
    <div className="pr-plan-scroll qb-data">
      <table className="pr-plan-table qb-data-table">
        <thead>
          <tr>
            <th>{tr('İxtisas', locale)}</th>
            {years.map((y) => (
              <th key={y}>{y}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {withScores.map((r) => (
            <tr key={r.documentId}>
              <td>
                <ProgramCell row={r} locale={locale} />
              </td>
              {years.map((y) => {
                const s = r.scores.find((x) => x.year === y);
                if (!s) return <td key={y}>{DASH}</td>;
                return (
                  <td key={y}>
                    {[s.minScoreFree, s.minScorePaid].map((v) => (v != null ? fmtScore(v, locale) : DASH)).join(' / ')}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="qb-note">
        {tr('ödənişsiz', locale)} / {tr('ödənişli', locale)}
      </p>
    </div>
  );
}

/** Bütün pillələr: hər pillə ayrıca cədvəl + tarixçə. */
export function AllLevels({ rows, locale }: { rows: AdmissionRow[]; locale: Locale }) {
  return (
    <>
      {LEVEL_TABS.map((tab) => {
        const list = rowsForTab(rows, tab);
        if (!list.length) return null;
        return (
          <div key={tab} className="qb-level">
            <h3 className="un-sub-title">{tr(LEVEL_LABEL[tab], locale)}</h3>
            <LevelTable rows={list} locale={locale} />
            {list.some((r) => r.scores.length > 1) ? (
              <>
                <h4 className="qb-level-sub">{tr('Keçid balları üzrə illər', locale)}</h4>
                <ScoreHistory rows={list} locale={locale} />
              </>
            ) : null}
          </div>
        );
      })}
    </>
  );
}

/** Yan panel: «2026/2027 qəbul» xülasəsi. */
export function SideSummary({ s, locale }: { s: AdmissionStats; locale: Locale }) {
  if (!s.programs) return null;
  // Kataloqdakı haqlar AZN/il-dir (fmtFee ilə eyni vahid).
  const unit = locale === 'ru' ? 'AZN/год' : locale === 'en' ? 'AZN/year' : 'AZN/il';
  const fee = s.feeMin != null ? (s.feeMin === s.feeMax ? `${s.feeMin} ${unit}` : `${s.feeMin}–${s.feeMax} ${unit}`) : null;
  const score =
    s.scoreMin != null
      ? s.scoreMin === s.scoreMax
        ? fmtScore(s.scoreMin, locale)
        : `${fmtScore(s.scoreMin, locale)}–${fmtScore(s.scoreMax, locale)}`
      : null;
  return (
    <div>
      <div className="un-sub-title">{s.seatsYear ? `${s.seatsYear}/${s.seatsYear + 1} ${tr('qəbul', locale)}` : tr('Qəbul', locale)}</div>
      <p className="un-side-text un-side-text--icon">
        <i className="ti ti-school" aria-hidden="true" />
        {tr('İxtisas sayı', locale)}: {s.programs}
      </p>
      {s.seats != null ? (
        <p className="un-side-text un-side-text--icon">
          <i className="ti ti-users" aria-hidden="true" />
          {tr('Plan yerləri', locale)}: {s.seats}
        </p>
      ) : null}
      {s.stateFunded != null || s.paid != null ? (
        <p className="un-side-text un-side-text--icon">
          <i className="ti ti-certificate" aria-hidden="true" />
          {[
            s.stateFunded != null ? `${tr('Dövlət sifarişi', locale)}: ${s.stateFunded}` : null,
            s.paid != null ? `${tr('Ödənişli', locale)}: ${s.paid}` : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      ) : null}
      {fee ? (
        <p className="un-side-text un-side-text--icon">
          <i className="ti ti-cash" aria-hidden="true" />
          {tr('Təhsil haqqı', locale)}: {fee}
        </p>
      ) : null}
      {score ? (
        <p className="un-side-text un-side-text--icon">
          <i className="ti ti-chart-bar" aria-hidden="true" />
          {tr('Keçid balı', locale)} ({s.scoreYear}): {score}
        </p>
      ) : null}
    </div>
  );
}

/** Açıq qapı günləri: növbəti tədbir(lər) + ötənlər (tədbir və xəbər). */
export function OpenDays({
  events,
  news,
  locale,
  now,
}: {
  events: EventItem[];
  news: Article[];
  locale: Locale;
  now: number;
}) {
  const time = (e: EventItem) => (e.endAt || e.startAt ? new Date((e.endAt || e.startAt) as string).getTime() : 0);
  const upcoming = events.filter((e) => time(e) >= now).sort((a, b) => time(a) - time(b));
  const past = events.filter((e) => time(e) < now).slice(0, 3);
  return (
    <>
      {upcoming.length ? (
        <ul className="qb-events">
          {upcoming.map((e) => (
            <li key={e.documentId} className="qb-event">
              <div className="qb-event-date">
                <i className="ti ti-calendar-event" aria-hidden="true" />
                {fmtDateTime(e.startAt, locale)}
              </div>
              <h3 className="qb-event-title">{e.title}</h3>
              {e.venueBuilding || e.venueRoom ? (
                <p className="qb-event-place">
                  <i className="ti ti-map-pin" aria-hidden="true" />
                  {[e.venueBuilding, e.venueRoom].filter(Boolean).join(', ')}
                </p>
              ) : null}
              {e.excerpt ? <p className="qb-event-text">{e.excerpt}</p> : null}
              <Link href={`/${locale}/tedbirler/${e.slug}#qeydiyyat`} className="qb-btn">
                {tr('Qeydiyyatdan keç', locale)}
                <i className="ti ti-arrow-right" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="qb-empty">
          <i className="ti ti-calendar-time" aria-hidden="true" />
          {tr('Hazırda planlaşdırılmış açıq qapı günü yoxdur. Tarix elan olunanda burada görünəcək.', locale)}
        </p>
      )}
      {past.length || news.length ? (
        <>
          <h3 className="un-sub-title">{tr('Ötən açıq qapı günləri', locale)}</h3>
          <ul className="un-row-list">
            {past.map((e) => (
              <li className="un-row" key={'e-' + e.documentId}>
                <span className="un-row-date">{fmtDate(e.startAt, locale)}</span>
                <Link href={`/${locale}/tedbirler/${e.slug}`} className="un-row-title">
                  {e.title}
                </Link>
              </li>
            ))}
            {news.map((a) => (
              <li className="un-row" key={'a-' + a.documentId}>
                <span className="un-row-date">{fmtDate(a.newsDate ?? a.publishedAt, locale)}</span>
                <Link href={`/${locale}/xeberler/${a.slug}`} className="un-row-title">
                  {a.title}
                </Link>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </>
  );
}
