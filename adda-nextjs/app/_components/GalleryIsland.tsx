"use client";

// F2/K17 — xəbər foto qalereyası.
//
// Köhnə saytda qalereya ayrıca səhifədə idi (`/az/photogallery/{id}`).
// Miqrasiyadan sonra şəkillər `article.gallery`-dədir və burada göstərilir.
//
// Şəbəkə: yoxdur — şəkillər server komponentindən prop kimi gəlir.
// Lüğət də prop kimi ötürülür (tam `T` bundle-a düşməsin deyə).
import { useCallback, useEffect, useState } from "react";

export interface GalleryImage {
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
}

interface GalleryIslandProps {
  images: GalleryImage[];
  labels: Record<string, string>;
}

export default function GalleryIsland({ images, labels }: GalleryIslandProps) {
  const [open, setOpen] = useState<number | null>(null);
  const L = (k: string): string => labels[k] ?? k;

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (delta: number) => setOpen((i) => (i === null ? null : (i + delta + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    // Lightbox açıq ikən arxa fon sürüşməsin.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close, step]);

  if (!images.length) return null;

  return (
    <section className="gal" aria-label={L("gallery")}>
      <h2 className="gal-h">
        <i className="ti ti-photo" aria-hidden="true" />
        {" " + L("gallery")}
        <span className="gal-count">{images.length}</span>
      </h2>

      <ul className="gal-grid">
        {images.map((img, i) => (
          <li key={img.url + i}>
            <button
              type="button"
              className="gal-cell"
              onClick={() => setOpen(i)}
              aria-label={`${L("openImage")} ${i + 1}`}
            >
              <img src={img.url} alt={img.alt} loading="lazy" decoding="async" />
            </button>
          </li>
        ))}
      </ul>

      {open !== null ? (
        <div
          className="gal-lb"
          role="dialog"
          aria-modal="true"
          aria-label={L("gallery")}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <button type="button" className="gal-x" onClick={close} aria-label={L("close")}>
            <i className="ti ti-x" aria-hidden="true" />
          </button>

          {images.length > 1 ? (
            <button
              type="button"
              className="gal-nav gal-nav--prev"
              onClick={() => step(-1)}
              aria-label={L("previous")}
            >
              <i className="ti ti-chevron-left" aria-hidden="true" />
            </button>
          ) : null}

          <figure className="gal-stage">
            <img src={images[open].url} alt={images[open].alt} />
            <figcaption className="gal-cap">
              {open + 1} / {images.length}
            </figcaption>
          </figure>

          {images.length > 1 ? (
            <button
              type="button"
              className="gal-nav gal-nav--next"
              onClick={() => step(1)}
              aria-label={L("next")}
            >
              <i className="ti ti-chevron-right" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
