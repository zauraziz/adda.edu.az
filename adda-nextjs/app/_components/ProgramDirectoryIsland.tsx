'use client';

// F5.17/F5.18c/F5.24d — /[locale]/ixtisaslar: tab keçidi (klik ilə, aktiv
// tabın altında xətt) + düz sətir siyahısı (fakültə qruplaşdırması və axtarış
// F5.18c-də SİLİNDİ — sadə sıralı cədvəl). Yeni server sorğusu YOXDUR — bütün
// proqramlar page.tsx-də bir dəfə çəkilib, tab keçidi client state-dir.
//
// F5.40 — `?tab=` və `?dil=` ilə birbaşa keçid (menyunun «Təhsil» bölməsi).
//
// F5.24d — tab AÇARI `catalogTab`-dır (əvvəl `degree` idi) — qrup adı və
// sırası artıq page.tsx-dəki CATALOG_TAB_ORDER-dən gəlir, bura yalnız
// hazır qrupları göstərir.
//
// LABEL-LƏR PROPS İLƏ GƏLİR, `tr()` BURADA ÇAĞIRILMIR — StaffDirectoryIsland
// ilə eyni qayda (lib/i18n.ts lüğəti 55 kB-dır, client bundle-a düşməməlidir).
// Sətir mətnləri (müddət, qəbul balı, dillər və s.) server tərəfdə (page.tsx)
// hazırlanıb hazır string kimi gəlir — bura YALNIZ tab keçidi və şərti
// sütunların (Təhsil haqqı, Yer sayı) görünürlüyünü hesablayır.

import { useEffect, useMemo, useState } from 'react';
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
  /** F5.24d — admissionSeats.total, boşdursa sütun tam gizlənir. */
  seatsTotal: number | null;
  /** F5.40 — tədris dilləri (az/ru/en), `?dil=` filtri üçün. */
  langCodes: string[];
}

export interface ProgramCatalogGroup {
  tab: string;
  label: string;
  items: ProgramRow[];
  /** F5.46 — pillənin qəbul səhifəsi (tabın altında keçid). */
  note?: { href: string; label: string } | null;
}

interface Labels {
  colSpeciality: string;
  colCode: string;
  colDuration: string;
  colForm: string;
  colTuition: string;
  colAdmission: string;
  colLanguages: string;
  colSeats: string;
  years: string;
  /** F5.40 — `?dil=` filtri aktiv olanda: «Tədris dili: EN · Bütün proqramlar». */
  langFilter: string;
  showAll: string;
}

interface Props {
  groups: ProgramCatalogGroup[];
  basePath: string;
  labels: Labels;
  /** F5.46 — `?dil=` filtri aktiv olanda əlavə keçid (məs. en → ingilis dilində tədris səhifəsi). */
  langNotes?: Record<string, { href: string; label: string }>;
}

const LANGS = ['az', 'ru', 'en'];

export default function ProgramDirectoryIsland({ groups, basePath, labels, langNotes }: Props) {
  const [activeTab, setActiveTab] = useState(groups[0]?.tab ?? '');
  const [lang, setLang] = useState<string | null>(null);

  // F5.40 — menyudan birbaşa keçid: `?tab=<catalogTab>` və `?dil=<az|ru|en>`.
  // Menyu keçidləri adi <a>-dır (səhifə yenidən yüklənir), ona görə URL-i
  // ilk render-dən sonra bir dəfə oxumaq kifayətdir. Server HTML-i dəyişmir —
  // səhifə statik/ISR qalır, ilk tab axtarış sistemləri üçün görünür.
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const dil = sp.get('dil');
    if (dil && LANGS.includes(dil)) setLang(dil);
    const tab = sp.get('tab');
    if (tab && groups.some((g) => g.tab === tab)) setActiveTab(tab);
  }, [groups]);

  // Filtr heç nə tapmasa (məs. /en-də ingilisdilli proqramın ingiliscə versiyası
  // hələ yoxdur) boş cədvəl göstərilmir — bütün proqramlar, filtr sətri olmadan.
  const filtered = useMemo(
    () => (lang ? groups.map((g) => ({ ...g, items: g.items.filter((p) => p.langCodes.includes(lang)) })).filter((g) => g.items.length) : []),
    [groups, lang],
  );
  const langActive = Boolean(lang) && filtered.length > 0;
  const shown = langActive ? filtered : groups;
  const activeGroup = shown.find((g) => g.tab === activeTab) ?? shown[0];
  const items = activeGroup?.items ?? [];

  // Tab dəyişəndə ünvan da dəyişir — keçidi paylaşmaq və «geri» düyməsi üçün.
  const pickTab = (tab: string) => {
    setActiveTab(tab);
    const sp = new URLSearchParams(window.location.search);
    sp.set('tab', tab);
    window.history.replaceState(window.history.state, '', `${window.location.pathname}?${sp.toString()}`);
  };

  // F5.18c/F5.24d — "Təhsil haqqı" və "Yer sayı" sütunları YALNIZ ən azı bir
  // proqramda doludursa görünür (başlığı daxil) — hamısı boşdursa sütun tam
  // yox olur, "—" ilə doldurulmur.
  const hasTuition = useMemo(() => items.some((p) => p.tuitionFee), [items]);
  const hasSeats = useMemo(() => items.some((p) => p.seatsTotal != null), [items]);

  if (!groups.length) return null;

  return (
    <>
      {langActive && lang ? (
        <p className="prg-filter">
          {labels.langFilter}: <strong>{lang.toUpperCase()}</strong>
          <span aria-hidden="true"> · </span>
          <a href={basePath}>{labels.showAll}</a>
          {langNotes?.[lang] ? (
            <>
              <span aria-hidden="true"> · </span>
              <Link href={langNotes[lang].href}>{langNotes[lang].label}</Link>
            </>
          ) : null}
        </p>
      ) : null}
      {shown.length > 1 ? (
        <nav className="prg-tabs" aria-label={labels.colSpeciality}>
          {shown.map((g) => (
            <button
              key={g.tab}
              type="button"
              className="prg-tab"
              aria-current={g.tab === activeGroup?.tab ? 'page' : undefined}
              onClick={() => pickTab(g.tab)}
            >
              {g.label}
            </button>
          ))}
        </nav>
      ) : null}

      {activeGroup?.note ? (
        <p className="prg-note">
          <Link href={activeGroup.note.href}>
            {activeGroup.note.label}
            <i className="ti ti-arrow-right" aria-hidden="true" />
          </Link>
        </p>
      ) : null}

      {/* F5.20b — geniş ekranda cədvəl (CSS grid, çevik sütunlar), dar ekranda
          hər sətir öz kartına çevrilir: kod+ad başlıq, qalanı etiket:dəyər
          cütü (bax 38-programs-list.css `::before` texnikası, `data-label`
          BURADAN gəlir). Üfüqi sürüşmə default DEYİL, yalnız ehtiyat. */}
      <div
        className={
          'prg-table' +
          (hasTuition ? ' prg-table--with-tuition' : '') +
          (hasSeats ? ' prg-table--with-seats' : '')
        }
        role="table"
      >
        <div className="prg-row prg-row--head" role="row">
          <span className="prg-cell prg-cell--code" role="columnheader">{labels.colCode}</span>
          <span className="prg-cell prg-cell--name" role="columnheader">{labels.colSpeciality}</span>
          <span className="prg-cell prg-cell--duration" role="columnheader">{labels.colDuration}</span>
          <span className="prg-cell prg-cell--form" role="columnheader">{labels.colForm}</span>
          {hasTuition ? (
            <span className="prg-cell prg-cell--tuition" role="columnheader">{labels.colTuition}</span>
          ) : null}
          {hasSeats ? (
            <span className="prg-cell prg-cell--seats" role="columnheader">{labels.colSeats}</span>
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
            {hasSeats ? (
              <span className="prg-cell prg-cell--seats" role="cell" data-label={labels.colSeats}>
                {p.seatsTotal ?? '—'}
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
