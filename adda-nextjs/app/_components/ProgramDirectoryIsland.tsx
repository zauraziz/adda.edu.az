'use client';

// F5.17 — /[locale]/ixtisaslar: dərəcə tabları (klik ilə keçid, aktiv tabın
// altında xətt) + fakültəyə görə alt qruplaşdırılmış sətir siyahısı (HSE
// nümunəsi, kart toru ƏVƏZİNƏ) + ad üzrə axtarış. Yeni server sorğusu YOXDUR —
// bütün proqramlar page.tsx-də bir dəfə çəkilib, tab/axtarış client state-dir.
//
// LABEL-LƏR PROPS İLƏ GƏLİR, `tr()` BURADA ÇAĞIRILMIR — StaffDirectoryIsland
// ilə eyni qayda (lib/i18n.ts lüğəti 55 kB-dır, client bundle-a düşməməlidir).

import { useMemo, useState } from 'react';
import Link from 'next/link';

export interface ProgramRow {
  slug: string;
  title: string;
  facultyName: string | null;
  durationYears: number | null;
  studyFormLabel: string | null;
}

export interface ProgramDegreeGroup {
  degree: string;
  label: string;
  items: ProgramRow[];
}

interface Labels {
  searchPlaceholder: string;
  found: string;
  noResults: string;
  colProgram: string;
  colDuration: string;
  colForm: string;
  years: string;
  other: string;
}

interface Props {
  groups: ProgramDegreeGroup[];
  basePath: string;
  labels: Labels;
}

/**
 * Axtarış üçün Azərbaycan-həssas kiçiltmə + diakritik bükmə.
 * StaffDirectoryIsland-dakı FOLD/fold ilə EYNİ — hər island öz nüsxəsini
 * saxlayır (bax lib/strapi.ts KAFEDRA_FACULTY-dəki eyni layihə-daxili
 * təkrarlama qərarı).
 */
const FOLD: Record<string, string> = {
  ə: 'e', Ə: 'e', ı: 'i', I: 'i', İ: 'i', i: 'i',
  ö: 'o', Ö: 'o', ü: 'u', Ü: 'u', ç: 'c', Ç: 'c',
  ş: 's', Ş: 's', ğ: 'g', Ğ: 'g',
};
function fold(s: string): string {
  let out = '';
  for (const ch of s) out += FOLD[ch] ?? ch;
  return out.toLowerCase();
}

interface FacultySection {
  name: string;
  items: ProgramRow[];
}

/**
 * Fakültəyə görə alt qruplaşdırma (HSE-nin kateqoriya sətri nümunəsi).
 * Boş fakültə `otherLabel` ("Digər") qrupuna düşür və HƏMİŞƏ sonda gəlir.
 */
function groupByFaculty(items: ProgramRow[], otherLabel: string): FacultySection[] {
  const map = new Map<string, ProgramRow[]>();
  for (const p of items) {
    const key = p.facultyName || otherLabel;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  }
  const other = map.get(otherLabel);
  const sections: FacultySection[] = [...map.entries()]
    .filter(([name]) => name !== otherLabel)
    .sort((a, b) => a[0].localeCompare(b[0], 'az'))
    .map(([name, list]) => ({ name, items: list }));
  if (other?.length) sections.push({ name: otherLabel, items: other });
  return sections;
}

export default function ProgramDirectoryIsland({ groups, basePath, labels }: Props) {
  const [activeDegree, setActiveDegree] = useState(groups[0]?.degree ?? '');
  const [q, setQ] = useState('');

  const activeGroup = groups.find((g) => g.degree === activeDegree) ?? groups[0];
  const qf = fold(q.trim());

  const filtered = useMemo(() => {
    const items = activeGroup?.items ?? [];
    if (!qf) return items;
    return items.filter((p) => fold(p.title).includes(qf));
  }, [activeGroup, qf]);

  const sections = useMemo(() => groupByFaculty(filtered, labels.other), [filtered, labels.other]);

  if (!groups.length) return null;

  return (
    <>
      {groups.length > 1 ? (
        <nav className="prg-tabs" aria-label={labels.colProgram}>
          {groups.map((g) => (
            <button
              key={g.degree}
              type="button"
              className="prg-tab"
              aria-current={g.degree === activeGroup?.degree ? 'page' : undefined}
              onClick={() => setActiveDegree(g.degree)}
            >
              {g.label}
            </button>
          ))}
        </nav>
      ) : null}

      <div className="dir-search prg-search">
        <i className="ti ti-search" aria-hidden="true" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={labels.searchPlaceholder}
          aria-label={labels.searchPlaceholder}
        />
      </div>

      <p className="np-total prg-count">
        {labels.found}: {filtered.length}
      </p>

      {filtered.length ? (
        <div className="prg-table" role="table">
          <div className="prg-row prg-row--head" role="row">
            <span className="prg-cell prg-cell--name" role="columnheader">{labels.colProgram}</span>
            <span className="prg-cell prg-cell--duration" role="columnheader">{labels.colDuration}</span>
            <span className="prg-cell prg-cell--form" role="columnheader">{labels.colForm}</span>
          </div>
          {sections.map((sec) => (
            <div key={sec.name} className="prg-section" role="rowgroup">
              <div className="prg-cat" role="row">
                <span className="prg-cat-name" role="cell">{sec.name}</span>
              </div>
              {sec.items.map((p) => (
                <Link
                  key={p.slug}
                  href={`${basePath}/${p.slug}`}
                  className="prg-row prg-row--item"
                  role="row"
                >
                  <span className="prg-cell prg-cell--name" role="cell">{p.title}</span>
                  <span className="prg-cell prg-cell--duration" role="cell">
                    {p.durationYears ? `${p.durationYears} ${labels.years}` : '—'}
                  </span>
                  <span className="prg-cell prg-cell--form" role="cell">{p.studyFormLabel ?? '—'}</span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <p className="np-empty">{labels.noResults}</p>
      )}
    </>
  );
}
