// F5.21b — /[locale]/qehremanlarimiz üçün iki kiçik dekorativ SVG.
// Server komponentləridir (klient JS lazım deyil, sadəcə statik markup).

/**
 * Qırmızı qərənfil — Azərbaycanda şəhid xatirəsinin rəsmi rəmzi. Kiçik,
 * TƏVAZÖKAR: iri çiçək qrafikası əvəzinə yeddi üst-üstə dairədən qurulan
 * sadə "pomponlu" silüet (qərənfilin qırışıq ləçəkli görünüşünə işarə) +
 * nazik gövdə. `currentColor` işlədir — rəng çağıran tərəfin `color`
 * dəyərindən gəlir (bax 39-heroes.css `.hr-carnation`).
 */
export function CarnationIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="currentColor">
        <circle cx="12" cy="8" r="3.4" />
        <circle cx="15.2" cy="8" r="3.4" />
        <circle cx="13.6" cy="10.8" r="3.4" />
        <circle cx="10.4" cy="10.8" r="3.4" />
        <circle cx="8.8" cy="8" r="3.4" />
        <circle cx="10.4" cy="5.2" r="3.4" />
        <circle cx="13.6" cy="5.2" r="3.4" />
      </g>
      <path d="M12 11c-1 3 1 6 0 10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Foto olmayan qəhrəman üçün sadə tünd siluet — rəngli monoqram YOX.
 * `width`/`height` faiz verilir ki, kart (kiçik) və fərdi səhifə (böyük)
 * lövhələrində eyni komponent nisbətli qalsın.
 */
export function SilhouetteIcon() {
  return (
    <svg width="42%" height="42%" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="8" r="4" fill="currentColor" />
      <path d="M4 22c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="currentColor" />
    </svg>
  );
}
