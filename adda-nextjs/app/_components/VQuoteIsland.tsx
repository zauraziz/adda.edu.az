'use client';

// ── Sitat blokunun videosu (client island) — F5.51 ───────────────────
// Düymə (.vquote .vq-play, server-də) basılanda video <dialog>-da açılır:
//   - YouTube: youtube-nocookie, autoplay; iframe yalnız klikdən sonra yaranır.
//     referrerPolicy `no-referrer` OLMAMALIDIR (YouTube «153» xətası verir).
//   - Yüklənmiş fayl (MP4): <video controls autoplay>.
// Bağlananda (düymə, Esc, fon) pleyer silinir — səs dayanır; fokus düyməyə
// qayıdır (dialog özü). Modifikator düyməsi ilə klik və <dialog> dəstəkləməyən
// brauzer — keçid videonun özünə aparır.
import { useEffect, useRef } from 'react';

const embed = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

export default function VQuoteIsland({ title, close }: { title: string; close: string }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const a = document.querySelector<HTMLAnchorElement>('.vquote .vq-play');
    const d = dlg.current;
    const f = frame.current;
    if (!a || !d || !f || typeof d.showModal !== 'function') return;

    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      f.innerHTML = '';
      const src = a.dataset.src ?? '';
      if (a.dataset.vq === 'file') {
        const v = document.createElement('video');
        v.controls = true;
        v.autoplay = true;
        v.playsInline = true;
        v.preload = 'metadata';
        const s = document.createElement('source');
        s.src = src;
        if (a.dataset.mime) s.type = a.dataset.mime;
        v.appendChild(s);
        f.appendChild(v);
      } else {
        const i = document.createElement('iframe');
        i.src = embed(src);
        i.title = title;
        i.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        i.allowFullscreen = true;
        i.referrerPolicy = 'strict-origin-when-cross-origin';
        f.appendChild(i);
      }
      d.showModal();
    };
    const onClose = () => {
      f.innerHTML = '';
    };
    // Fona (backdrop) basanda bağlanır — pleyerin içi dialogun özü deyil.
    const onBackdrop = (e: MouseEvent) => {
      if (e.target === d) d.close();
    };
    a.addEventListener('click', onClick);
    d.addEventListener('close', onClose);
    d.addEventListener('click', onBackdrop);
    return () => {
      a.removeEventListener('click', onClick);
      d.removeEventListener('close', onClose);
      d.removeEventListener('click', onBackdrop);
    };
  }, [title]);

  return (
    <dialog className="vq-modal" ref={dlg} aria-label={title}>
      <form method="dialog" className="vq-modal-bar">
        <button type="submit" className="vq-x" aria-label={close}>
          <i className="ti ti-x" aria-hidden="true" />
        </button>
      </form>
      <div className="vq-frame" ref={frame} />
    </dialog>
  );
}
