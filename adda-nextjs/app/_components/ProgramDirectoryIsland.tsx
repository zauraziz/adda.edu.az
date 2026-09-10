'use client';

// F5.17/F5.18c — /[locale]/ixtisaslar: dərəcə tabları (klik ilə keçid, aktiv
// tabın altında xətt) + düz sətir siyahısı (fakültə qruplaşdırması və axtarış
// F5.18c-də SİLİNDİ — sadə sıralı cədvəl). Yeni server sorğusu YOXDUR — bütün
// proqramlar page.tsx-də bir dəfə çəkilib, tab keçidi client state-dir.
//
// LABEL-LƏR PROPS İLƏ GƏLİR, `tr()` BURADA ÇAĞIRILMIR — StaffDirectoryIsland
// ilə eyni qayda (lib/i18n.ts lüğəti 55 kB-dır, client bundle-a düşməməlidir).
// Sətir mətnləri (müddət, qəbul balı, dillər və s.) server tərəfdə (page.tsx)
// hazırlanıb hazır string kimi gəlir — bura YALNIZ tab keçidi və "Təhsil haqqı"
// sütununun görünürlüyünü hesablayır.

import { useMemo, useState } from 'react';
import Link from 'next/link';

export interface ProgramRow {
  slug: string;
  title: string;
  code: string | null;
  durationYears: number | null;
  studyFormLabel: string | null;
  tuitionFee: string | null;
  admissionLabel: string;
  languagesLabel: string;
}

export interface ProgramDegreeGroup {
  degree: string;
  label: string;
  items: ProgramRow[];
}

interface Labels {
  colSpeciality: string;
  colCode: string;
  colDuration: string;
  colForm: string;
  colTuition: string;
  colAdmission: string;
  colLanguages: string;
  years: string;
}

interface Props {
  groups: ProgramDegreeGroup[];
  basePath: string;
  labels: Labels;
}

export default function ProgramDirectoryIsland({ groups, basePath, labels }: Props) {
  const [activeDegree, setActiveDegree] = useState(groups[0]?.degree ?? '');

  const activeGroup = groups.find((g) => g.degree === activeDegree) ?? groups[0];
  const items = activeGroup?.items ?? [];

  // F5.18c — "Təhsil haqqı" sütunu YALNIZ ən azı bir proqramda doludursa
  // görünür (başlığı daxil) — hamısı boşdursa sütun tam yox olur, "—" ilə
  // doldurulmur.
  const hasTuition = useMemo(() => items.some((p) => p.tuitionFee), [items]);

  if (!groups.length) return null;

  return (
    <>
      {groups.length > 1 ? (
        <nav className="prg-tabs" aria-label={labels.colSpeciality}>
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

      {/* F5.20b — geniş ekranda cədvəl (CSS grid, çevik sütunlar), dar ekranda
          hər sətir öz kartına çevrilir: kod+ad başlıq, qalanı etiket:dəyər
          cütü (bax 38-programs-list.css `::before` texnikası, `data-label`
          BURADAN gəlir). Üfüqi sürüşmə default DEYİL, yalnız ehtiyat. */}
      <div className={'prg-table' + (hasTuition ? ' prg-table--with-tuition' : '')} role="table">
        <div className="prg-row prg-row--head" role="row">
          <span className="prg-cell prg-cell--code" role="columnheader">{labels.colCode}</span>
          <span className="prg-cell prg-cell--name" role="columnheader">{labels.colSpeciality}</span>
          <span className="prg-cell prg-cell--duration" role="columnheader">{labels.colDuration}</span>
          <span className="prg-cell prg-cell--form" role="columnheader">{labels.colForm}</span>
          {hasTuition ? (
            <span className="prg-cell prg-cell--tuition" role="columnheader">{labels.colTuition}</span>
          ) : null}
          <span className="prg-cell prg-cell--admission" role="columnheader">{labels.colAdmission}</span>
          <span className="prg-cell prg-cell--langs" role="columnheader">{labels.colLanguages}</span>
        </div>
        {items.map((p) => (
          <Link key={p.slug} href={`${basePath}/${p.slug}`} className="prg-row prg-row--item" role="row">
            <span className="prg-cell prg-cell--code" role="cell">{p.code ?? '—'}</span>
            <span className="prg-cell prg-cell--name" role="cell">{p.title}</span>
            <span className="prg-cell prg-cell--duration" role="cell" data-label={labels.colDuration}>
              {p.durationYears ? `${p.durationYears} ${labels.years}` : '—'}
            </span>
            <span className="prg-cell prg-cell--form" role="cell" data-label={labels.colForm}>
              {p.studyFormLabel ?? '—'}
            </span>
            {hasTuition ? (
              <span className="prg-cell prg-cell--tuition" role="cell" data-label={labels.colTuition}>
                {p.tuitionFee ?? '—'}
              </span>
            ) : null}
            <span className="prg-cell prg-cell--admission" role="cell" data-label={labels.colAdmission}>
              {p.admissionLabel}
            </span>
            <span className="prg-cell prg-cell--langs" role="cell" data-label={labels.colLanguages}>
              {p.languagesLabel}
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
