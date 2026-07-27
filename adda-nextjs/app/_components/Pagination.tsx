// F2.5b — səhifələmə. Server komponentidir: `<Link>` işlədir, JS lazım deyil,
// yəni botlar və JS-siz brauzerlər bütün 70 səhifəni gəzə bilir (SEO üçün vacib).
//
// 840 xəbər / 12 = 70 səhifə, ona görə bütün nömrələri çap etmək olmaz.
// Pəncərə: ilk, son, cari ± 1, aralarda ellipsis.
import Link from 'next/link';

interface PaginationProps {
  page: number;
  pageCount: number;
  /** Səhifə 1 üçün təmiz URL: /az/xeberler ; qalanlar üçün ?page=N */
  basePath: string;
  labels: { prev: string; next: string; page: string; of: string };
}

function windowed(page: number, pageCount: number): (number | '…')[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const out: (number | '…')[] = [1];
  const from = Math.max(2, page - 1);
  const to = Math.min(pageCount - 1, page + 1);
  if (from > 2) out.push('…');
  for (let i = from; i <= to; i++) out.push(i);
  if (to < pageCount - 1) out.push('…');
  out.push(pageCount);
  return out;
}

export default function Pagination({ page, pageCount, basePath, labels }: PaginationProps) {
  if (pageCount <= 1) return null;
  const href = (n: number) => (n <= 1 ? basePath : basePath + '?page=' + n);

  return (
    <nav className="pgn" aria-label={labels.page}>
      {page > 1 ? (
        <Link href={href(page - 1)} className="pgn-arrow" rel="prev">
          <i className="ti ti-chevron-left" aria-hidden="true" />
          <span className="pgn-arrow-t">{labels.prev}</span>
        </Link>
      ) : (
        <span className="pgn-arrow is-off" aria-disabled="true">
          <i className="ti ti-chevron-left" aria-hidden="true" />
          <span className="pgn-arrow-t">{labels.prev}</span>
        </span>
      )}

      <ol className="pgn-list">
        {windowed(page, pageCount).map((n, i) =>
          n === '…' ? (
            <li key={'gap' + i} className="pgn-gap" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={n}>
              {n === page ? (
                <span className="pgn-n is-active" aria-current="page">
                  {n}
                </span>
              ) : (
                <Link href={href(n)} className="pgn-n">
                  {n}
                </Link>
              )}
            </li>
          ),
        )}
      </ol>

      {page < pageCount ? (
        <Link href={href(page + 1)} className="pgn-arrow" rel="next">
          <span className="pgn-arrow-t">{labels.next}</span>
          <i className="ti ti-chevron-right" aria-hidden="true" />
        </Link>
      ) : (
        <span className="pgn-arrow is-off" aria-disabled="true">
          <span className="pgn-arrow-t">{labels.next}</span>
          <i className="ti ti-chevron-right" aria-hidden="true" />
        </span>
      )}

      <span className="pgn-count">
        {page} {labels.of} {pageCount}
      </span>
    </nav>
  );
}
