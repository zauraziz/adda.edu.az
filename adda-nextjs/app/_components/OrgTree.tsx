'use client';

// ── K36: təşkilati struktur ağacı ────────────────────────────────────
//
// NİYƏ KLİENT KOMPONENTİ. Ağac 21 bölmədən və 3 səviyyədən ibarətdir.
// Əvvəlki variant hamısını eyni ağırlıqlı kart kimi düzürdü: nə bağlayıcı
// xətt, nə səviyyə fərqi, nə yığma, nə axtarış vardı — 21 kartlıq uzun
// sürüşmə idi. Filtr və qatlama vəziyyət tələb edir, ona görə ağac burada
// render olunur; məlumat isə serverdə hazırlanır və PROPS ilə gəlir
// (i18n lüğəti bundle-a düşmür).
import { useMemo, useState } from 'react';
import Link from 'next/link';

export interface OrgNode {
  slug: string;
  name: string;
  href: string;
  /** Bölmə rəhbəri — varsa göstərilir. */
  head: { name: string; href: string } | null;
  staffCount: number;
  vacancies: string[];
  children: OrgNode[];
}
export interface OrgLabels {
  search: string;
  clear: string;
  expandAll: string;
  collapseAll: string;
  staff: string;
  units: string;
  vacant: string;
  nothing: string;
}

/** Axtarış üçün: Azərbaycan hərflərini qorumaqla kiçildir. */
function fold(s: string): string {
  return s.toLocaleLowerCase('az');
}

/** Alt ağacda uyğunluq varsa node saxlanılır — valideyn kontekstini itirmə. */
function filterTree(nodes: OrgNode[], q: string): OrgNode[] {
  if (!q) return nodes;
  const out: OrgNode[] = [];
  for (const n of nodes) {
    const kids = filterTree(n.children, q);
    const hit =
      fold(n.name).includes(q) || (n.head ? fold(n.head.name).includes(q) : false);
    if (hit || kids.length) out.push({ ...n, children: kids });
  }
  return out;
}

function collectSlugs(nodes: OrgNode[], acc: string[] = []): string[] {
  for (const n of nodes) {
    if (n.children.length) acc.push(n.slug);
    collectSlugs(n.children, acc);
  }
  return acc;
}

export default function OrgTree({
  roots,
  labels,
}: {
  roots: OrgNode[];
  labels: OrgLabels;
}) {
  const allBranches = useMemo(() => collectSlugs(roots), [roots]);
  // Defolt: hamısı açıq — struktur bir baxışda görünməlidir.
  const [closed, setClosed] = useState<Set<string>>(new Set());
  const [q, setQ] = useState('');

  const query = fold(q.trim());
  const shown = useMemo(() => filterTree(roots, query), [roots, query]);

  const toggle = (slug: string) =>
    setClosed((cur) => {
      const next = new Set(cur);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  const renderNodes = (nodes: OrgNode[], level: number) => (
    <ul className={level === 1 ? 'org-tree org-tree--root' : 'org-tree'}>
      {nodes.map((n) => {
        const hasKids = n.children.length > 0;
        // Axtarış zamanı hər şey açıq qalır — nəticəni gizlətmək mənasızdır.
        const open = query ? true : !closed.has(n.slug);
        return (
          <li className={`org-item org-item--l${Math.min(level, 3)}`} key={n.slug}>
            <div className="org-row">
              {hasKids ? (
                <button
                  type="button"
                  className={open ? 'org-toggle is-open' : 'org-toggle'}
                  aria-expanded={open}
                  aria-label={n.name}
                  onClick={() => toggle(n.slug)}
                >
                  <i className="ti ti-chevron-right" aria-hidden="true" />
                </button>
              ) : (
                <span className="org-toggle org-toggle--leaf" aria-hidden="true" />
              )}

              <Link href={n.href} className="org-card">
                <span className="org-name">{n.name}</span>
                {n.head ? (
                  <span className="org-head">
                    <i className="ti ti-user" aria-hidden="true" />
                    {n.head.name}
                  </span>
                ) : null}
                <span className="org-meta">
                  {n.staffCount ? (
                    <span className="org-chip">
                      {n.staffCount} {labels.staff}
                    </span>
                  ) : null}
                  {hasKids ? (
                    <span className="org-chip">
                      {n.children.length} {labels.units}
                    </span>
                  ) : null}
                  {n.vacancies.map((v) => (
                    <span className="org-chip org-chip--vac" key={v}>
                      {v} — {labels.vacant}
                    </span>
                  ))}
                </span>
              </Link>
            </div>

            {hasKids && open ? renderNodes(n.children, level + 1) : null}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="org-wrap">
      <div className="org-bar">
        <div className="org-search">
          <i className="ti ti-search" aria-hidden="true" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={labels.search}
            aria-label={labels.search}
          />
          {q ? (
            <button type="button" className="org-clear" onClick={() => setQ('')} aria-label={labels.clear}>
              <i className="ti ti-x" aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <div className="org-actions">
          <button type="button" onClick={() => setClosed(new Set())} disabled={!!query}>
            {labels.expandAll}
          </button>
          <button type="button" onClick={() => setClosed(new Set(allBranches))} disabled={!!query}>
            {labels.collapseAll}
          </button>
        </div>
      </div>

      {shown.length ? renderNodes(shown, 1) : <p className="org-empty">{labels.nothing}</p>}
    </div>
  );
}
