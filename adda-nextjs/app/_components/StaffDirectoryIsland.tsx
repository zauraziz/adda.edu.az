'use client';

// K26-11 — heyət kataloqu (axtarış + əlifba + filtrlər).
//
// NİYƏ CLIENT ISLAND: 162 nəfər üçün hər klikdə server gedişi lazım deyil —
// bütün siyahı bir dəfə gəlir, filtrləmə anındadır. Server komponenti eyni
// siyahını SSR edir, ona görə JS olmadan da tam siyahı görünür (yalnız
// filtrlər cavab vermir).
//
// LABEL-LƏR PROPS İLƏ GƏLİR, `tr()` BURADA ÇAĞIRILMIR: i18n lüğəti 55 kB-dır
// və client bundle-a düşməməlidir. Bölmə/vəzifə adları da server tərəfdə
// tərcümə olunub göndərilir.

import { useMemo, useState } from 'react';
import Link from 'next/link';

export interface DirectoryPerson {
  slug: string;
  name: string;
  letter: string;
  position: string;
  unit: string | null;
  building: string | null;
  degree: string | null;
  academicTitle: string | null;
  photo: string | null;
  email: string | null;
  phone: string | null;
  tags: string[];
  langs: string[];
  types: string[];
}

export interface FilterOption {
  value: string;
  label: string;
}

interface Props {
  people: DirectoryPerson[];
  alphabet: string[];
  filters: {
    building: FilterOption[];
    unit: FilterOption[];
    degree: FilterOption[];
    position: FilterOption[];
    lang: FilterOption[];
  };
  labels: Record<string, string>;
  basePath: string;
}

const EMPTY = '';

/**
 * Axtarış üçün normallaşdırma.
 *
 * Azərbaycan dilində `I`-nın kiçiyi `ı`, `İ`-nin kiçiyi `i`-dir. JavaScript-in
 * `toLowerCase()`-i bunu bilmir və `İ` → `i̇` (birləşən nöqtə ilə) verir.
 * Ona görə hərflər ƏVVƏLCƏ əl ilə xəritələnir, sonra kiçildilir.
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

export default function StaffDirectoryIsland({ people, alphabet, filters, labels, basePath }: Props) {
  const [q, setQ] = useState('');
  const [area, setArea] = useState('');
  const [letter, setLetter] = useState(EMPTY);
  const [building, setBuilding] = useState(EMPTY);
  const [unit, setUnit] = useState(EMPTY);
  const [degree, setDegree] = useState(EMPTY);
  const [position, setPosition] = useState(EMPTY);
  const [lang, setLang] = useState(EMPTY);

  const qf = fold(q.trim());
  const areaf = fold(area.trim());

  const shown = useMemo(() => {
    return people.filter((p) => {
      if (letter && p.letter !== letter) return false;
      if (building && p.building !== building) return false;
      if (unit && p.unit !== unit) return false;
      if (degree && p.degree !== degree) return false;
      if (position && p.position !== position) return false;
      if (lang && !p.langs.includes(lang)) return false;
      if (areaf && !p.tags.some((t) => fold(t).includes(areaf))) return false;
      if (qf) {
        const hay = fold(`${p.name} ${p.position} ${p.unit ?? ''} ${p.tags.join(' ')}`);
        if (!hay.includes(qf)) return false;
      }
      return true;
    });
  }, [people, qf, areaf, letter, building, unit, degree, position, lang]);

  // Əlifbada yalnız real nəticəsi olan hərflər aktiv olsun — boş hərfə klik
  // etmək istifadəçini boş ekrana aparır.
  const active = useMemo(() => new Set(people.map((p) => p.letter)), [people]);

  const dirty = Boolean(q || area || letter || building || unit || degree || position || lang);

  function reset() {
    setQ(''); setArea(''); setLetter(EMPTY); setBuilding(EMPTY);
    setUnit(EMPTY); setDegree(EMPTY); setPosition(EMPTY); setLang(EMPTY);
  }

  const selects: [string, string, FilterOption[], (v: string) => void][] = [
    [labels.building, building, filters.building, setBuilding],
    [labels.unit, unit, filters.unit, setUnit],
    [labels.degree, degree, filters.degree, setDegree],
    [labels.position, position, filters.position, setPosition],
    [labels.lang, lang, filters.lang, setLang],
  ];

  return (
    <>
      <div className="dir-controls">
        <div className="dir-search">
          <i className="ti ti-search" aria-hidden="true" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={labels.searchPlaceholder}
            aria-label={labels.searchPlaceholder}
          />
        </div>

        <nav className="dir-alpha" aria-label={labels.alphabet}>
          <button
            type="button"
            className="dir-letter"
            aria-pressed={letter === EMPTY}
            onClick={() => setLetter(EMPTY)}
          >
            {labels.all}
          </button>
          {alphabet.map((ch) => (
            <button
              key={ch}
              type="button"
              className="dir-letter"
              aria-pressed={letter === ch}
              disabled={!active.has(ch)}
              onClick={() => setLetter(letter === ch ? EMPTY : ch)}
            >
              {ch}
            </button>
          ))}
        </nav>

        {/* Yalnız məlumatı olan filtrlər göstərilir. Boş açılan siyahı
            istifadəçiyə "sınıq" təsiri bağışlayır. */}
        {selects.some(([, , opts]) => opts.length > 1) ? (
          <div className="dir-filters">
            {selects.map(([label, value, opts, set]) =>
              opts.length > 1 ? (
                <label key={label} className="dir-field">
                  <span className="dir-field-label">{label}</span>
                  <select value={value} onChange={(e) => set(e.target.value)}>
                    <option value={EMPTY}>{labels.all}</option>
                    {opts.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null,
            )}
          </div>
        ) : null}

        {people.some((p) => p.tags.length) ? (
          <div className="dir-search dir-search--area">
            <i className="ti ti-flask" aria-hidden="true" />
            <input
              type="search"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder={labels.areaPlaceholder}
              aria-label={labels.areaPlaceholder}
            />
          </div>
        ) : null}
      </div>

      <p className="np-total dir-count">
        {labels.found}: {shown.length}
        {dirty ? (
          <button type="button" className="dir-reset" onClick={reset}>
            {labels.reset}
          </button>
        ) : null}
      </p>

      {shown.length ? (
        <div className="dir-list">
          {shown.map((p) => (
            <article key={p.slug} className="dir-card">
              <Link href={`${basePath}/${p.slug}`} className="dir-photo" aria-hidden="true" tabIndex={-1}>
                {p.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.photo} alt="" loading="lazy" />
                ) : (
                  <span className="dir-photo-fallback">{p.letter}</span>
                )}
              </Link>

              <div className="dir-body">
                <h2 className="dir-name">
                  <Link href={`${basePath}/${p.slug}`}>{p.name}</Link>
                </h2>
                <p className="dir-post">
                  {p.academicTitle ? <span className="dir-rank">{p.academicTitle}</span> : null}
                  {p.position}
                </p>
                {p.unit ? <p className="dir-unit">{p.unit}</p> : null}

                {p.tags.length ? (
                  <ul className="dir-tags">
                    {p.tags.slice(0, 4).map((t) => (
                      <li key={t} className="np-chip dir-tag">
                        {t}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              {p.email || p.phone ? (
                <div className="dir-contact">
                  {p.email ? (
                    <a href={`mailto:${p.email}`} className="dir-link">
                      <i className="ti ti-mail" aria-hidden="true" /> {p.email}
                    </a>
                  ) : null}
                  {p.phone ? (
                    <a href={`tel:${p.phone.replace(/[^\d+]/g, '')}`} className="dir-link">
                      <i className="ti ti-phone" aria-hidden="true" /> {p.phone}
                    </a>
                  ) : null}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="np-empty">{labels.noResults}</p>
      )}
    </>
  );
}
