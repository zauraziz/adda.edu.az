'use client';

// F5.35c — /auditoriyalar kataloqu: tipə görə qruplaşdırılmış siyahı +
// kafedraya görə SADƏ client-side süzgəc (yeni asılılıq yoxdur). Məlumat
// və tərcümə edilmiş etiketlər serverdən PROPS ilə gəlir (tam `T` lüğəti
// klient bundle-ına düşməsin — bax CLAUDE.md, Next.js tələləri).
import { useMemo, useState } from 'react';
import Link from 'next/link';

export interface FacilityRow {
  slug: string;
  href: string;
  roomNumber: string | null;
  name: string;
  unit: { slug: string; name: string; href: string } | null;
}
export interface FacilityGroup {
  type: string;
  label: string;
  items: FacilityRow[];
}
export interface FacilityCatalogLabels {
  filter: string;
  all: string;
  nothing: string;
}

export default function FacilityCatalog({
  groups,
  units,
  labels,
}: {
  groups: FacilityGroup[];
  units: { slug: string; name: string }[];
  labels: FacilityCatalogLabels;
}) {
  const [unit, setUnit] = useState('');

  const shown = useMemo(
    () =>
      groups
        .map((g) => ({ ...g, items: unit ? g.items.filter((i) => i.unit?.slug === unit) : g.items }))
        .filter((g) => g.items.length),
    [groups, unit],
  );

  return (
    <div>
      {units.length > 1 ? (
        <div className="fc-bar">
          <label htmlFor="fc-unit">{labels.filter}</label>
          <select id="fc-unit" className="fc-select" value={unit} onChange={(e) => setUnit(e.target.value)}>
            <option value="">{labels.all}</option>
            {units.map((u) => (
              <option key={u.slug} value={u.slug}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {shown.length ? (
        shown.map((g) => (
          <section className="fc-group" key={g.type}>
            <h2 className="fc-group-title">
              {g.label}
              <span className="fc-count">{g.items.length}</span>
            </h2>
            <ul className="fc-list">
              {g.items.map((f) => (
                <li className="fc-row" key={f.slug}>
                  {f.roomNumber ? <span className="fc-room">{f.roomNumber}</span> : null}
                  <span className="fc-name">
                    <Link href={f.href}>{f.name}</Link>
                  </span>
                  {f.unit ? (
                    <span className="fc-unit">
                      <Link href={f.unit.href}>{f.unit.name}</Link>
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ))
      ) : (
        <p className="fc-empty">{labels.nothing}</p>
      )}
    </div>
  );
}
