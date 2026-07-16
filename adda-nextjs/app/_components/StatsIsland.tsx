'use client';

// ── Faza 1 / Stats island ────────────────────────────────────────────
// ui.js bölmə 4 (sayğaclar) buraya köçdü. Markup server-dədir (Stats.tsx).
// ui.js variantından fərqləri:
//   · scroll listener → IntersectionObserver (hər scroll-da getBoundingClientRect YOX)
//   · rəqəm formatı locale-a uyğun (əvvəl həmişə 'az' idi → /en-də "12 000" görünürdü)
//   · prefers-reduced-motion: animasiya yox, dərhal son dəyər
//   · unmount-da tam cleanup (əvvəl interval-lar asılı qalırdı)
import { useEffect } from 'react';
import type { Locale } from '@/lib/i18n';

const DURATION_MS = 1500; // ui.js: 60 addım × 25ms
const STEPS = 60;

export default function StatsIsland({ locale }: { locale: Locale }) {
  useEffect(() => {
    const sec = document.querySelector<HTMLElement>('.statsec');
    if (!sec) return;
    const nums = Array.from(sec.querySelectorAll<HTMLElement>('.num'));
    if (!nums.length) return;

    const fmt = new Intl.NumberFormat(locale);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timers: Array<ReturnType<typeof setInterval>> = [];
    let done = false;

    const run = () => {
      if (done) return;
      done = true;
      nums.forEach((n) => {
        const target = Number(n.dataset.target || 0);
        const span = n.querySelector('span');
        if (!span) return;
        if (reduced) { span.textContent = fmt.format(target); return; }
        let c = 0;
        const step = target / STEPS;
        const iv = setInterval(() => {
          c += step;
          if (c >= target) { c = target; clearInterval(iv); }
          span.textContent = fmt.format(Math.round(c));
        }, DURATION_MS / STEPS);
        timers.push(iv);
      });
    };

    const io = new IntersectionObserver((es) => {
      if (es[0].isIntersecting) { run(); io.disconnect(); }
    }, { threshold: 0 });
    io.observe(sec);

    return () => {
      io.disconnect();
      timers.forEach(clearInterval);
    };
  }, [locale]);

  return null;
}
