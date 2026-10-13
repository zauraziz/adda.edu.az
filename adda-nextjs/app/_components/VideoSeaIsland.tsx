'use client';

// ── Video slayderin davranışı (client island) — F5.50 ────────────────
// Markup server-dədir (VideoSea.tsx). Bu ada:
//   - siyahıdan seçiləni böyük pleyerdə dərhal oynadır (youtube-nocookie, autoplay);
//   - önizləməni kliklə pleyerə çevirir; mümkünsə yüksək keyfiyyətli önizləmə (maxres);
//   - oxlarla siyahını sürüşdürür, kənarlarda oxu söndürür.
// Modifikator düyməsi ilə klik (yeni vərəq) brauzerin öz davranışında qalır.
import { useEffect } from 'react';

const embed = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

export default function VideoSeaIsland() {
  useEffect(() => {
    const stage = document.getElementById('vsStage');
    if (!stage) return;
    const rail = document.getElementById('vsRail');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const cleanups: Array<() => void> = [];
    const listen = (el: EventTarget, ev: string, fn: EventListener, opts?: AddEventListenerOptions) => {
      el.addEventListener(ev, fn, opts);
      cleanups.push(() => el.removeEventListener(ev, fn, opts));
    };

    /** Yüksək keyfiyyətli önizləmə — yoxdursa YouTube 120×90 boz şəkil qaytarır. */
    const upgrade = (img: HTMLImageElement | null, id: string) => {
      if (!img) return;
      const hi = new Image();
      hi.onload = () => {
        if (hi.naturalWidth > 200 && img.isConnected && img.dataset.id === id) img.src = hi.src;
      };
      img.dataset.id = id;
      hi.src = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
    };

    const poster = () => stage.querySelector<HTMLAnchorElement>('.vs-poster');
    upgrade(poster()?.querySelector('img') ?? null, poster()?.dataset.id ?? '');

    const play = (id: string, title: string) => {
      stage.innerHTML = '';
      const f = document.createElement('iframe');
      f.src = embed(id);
      f.title = title;
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      f.allowFullscreen = true;
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      stage.appendChild(f);
      stage.classList.add('is-playing');
    };

    const plain = (e: MouseEvent) => !(e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey);

    // Önizləmə → pleyer
    listen(stage, 'click', (ev) => {
      const e = ev as MouseEvent;
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('.vs-poster');
      if (!a || !plain(e)) return;
      e.preventDefault();
      play(a.dataset.id ?? '', a.querySelector('.vs-cap-t')?.textContent ?? '');
    });

    if (rail) {
      const links = Array.from(rail.querySelectorAll<HTMLAnchorElement>('a[data-id]'));
      listen(rail, 'click', (ev) => {
        const e = ev as MouseEvent;
        const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-id]');
        if (!a || !plain(e)) return;
        e.preventDefault();
        links.forEach((l) => l.removeAttribute('aria-current'));
        a.setAttribute('aria-current', 'true');
        play(a.dataset.id ?? '', a.dataset.title ?? '');
        const r = stage.getBoundingClientRect();
        if (r.top < 0 || r.bottom > window.innerHeight) {
          stage.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
        }
      });

      // Oxlar
      const arrows = Array.from(document.querySelectorAll<HTMLButtonElement>('.vsea .vs-arr'));
      const sync = () => {
        const max = rail.scrollWidth - rail.clientWidth - 2;
        arrows.forEach((b) => {
          b.disabled = Number(b.dataset.dir) < 0 ? rail.scrollLeft <= 2 : rail.scrollLeft >= max;
        });
      };
      arrows.forEach((b) =>
        listen(b, 'click', () => {
          rail.scrollBy({ left: Number(b.dataset.dir) * rail.clientWidth * 0.9, behavior: reduced ? 'auto' : 'smooth' });
        }),
      );
      listen(rail, 'scroll', sync, { passive: true });
      listen(window, 'resize', sync);
      sync();
    }

    return () => cleanups.forEach((f) => f());
  }, []);

  return null;
}
