'use client';

// ── Sertifikatın böyüdülmüş görünüşü (client island) — F5.51 ─────────
// Kartlar server-dədir (sertifikatlar/page.tsx, #certGrid). Bu ada skanın
// düyməsinə (.cert-doc[data-cert]) basanda lightbox açır: böyük skan, ad,
// «n / N», ← → və Esc, fokus bağlama düyməsinə keçir və bağlananda geri qayıdır.
// Görünüş 27-gallery.css-in lightbox-undandır (.gal-lb). Lüğət prop kimi gəlir.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface CertSlide {
  src: string;
  title: string;
}

export default function CertIsland({ items, labels }: { items: (CertSlide | null)[]; labels: Record<string, string> }) {
  const [open, setOpen] = useState<number | null>(null);
  const back = useRef<HTMLElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement | null>(null);
  const shown = useMemo(() => items.map((s, i) => (s ? i : -1)).filter((i) => i >= 0), [items]);

  const close = useCallback(() => {
    setOpen(null);
    back.current?.focus();
  }, []);
  const step = useCallback(
    (d: number) =>
      setOpen((cur) => {
        if (cur === null) return null;
        const at = shown.indexOf(cur);
        return shown[(at + d + shown.length) % shown.length];
      }),
    [shown],
  );

  useEffect(() => {
    const grid = document.getElementById('certGrid');
    if (!grid) return;
    const onClick = (e: MouseEvent) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>('[data-cert]');
      if (!b) return;
      const i = Number(b.dataset.cert);
      if (!items[i]) return;
      back.current = b;
      setOpen(i);
    };
    grid.addEventListener('click', onClick);
    return () => grid.removeEventListener('click', onClick);
  }, [items]);

  useEffect(() => {
    if (open === null) return;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close, step]);

  const cur = open === null ? null : items[open];
  if (!cur || open === null) return null;
  const n = shown.indexOf(open) + 1;

  return (
    <div
      className="gal-lb cert-lb"
      role="dialog"
      aria-modal="true"
      aria-label={cur.title}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <button type="button" className="gal-x" onClick={close} aria-label={labels.close} ref={closeBtn}>
        <i className="ti ti-x" aria-hidden="true" />
      </button>
      {shown.length > 1 ? (
        <button type="button" className="gal-nav gal-nav--prev" onClick={() => step(-1)} aria-label={labels.previous}>
          <i className="ti ti-chevron-left" aria-hidden="true" />
        </button>
      ) : null}
      <figure className="gal-stage">
        <img src={cur.src} alt={cur.title} />
        <figcaption className="gal-cap">
          {cur.title}
          {shown.length > 1 ? <span className="cert-lb-n">{` · ${n} / ${shown.length}`}</span> : null}
        </figcaption>
      </figure>
      {shown.length > 1 ? (
        <button type="button" className="gal-nav gal-nav--next" onClick={() => step(1)} aria-label={labels.next}>
          <i className="ti ti-chevron-right" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
