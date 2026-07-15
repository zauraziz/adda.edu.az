'use client';

// ── Faza 1 / Hero 2b: slayder + magnit düymə ─────────────────────────
// ui.js bölmə 2 (jaluzi slices) və 3 (magnetic button) buraya köçdü.
// Markup server-də (Hero.tsx) qalır — bu ada yalnız davranış qoşur.
// Fərqlər: SLIDES artıq dilə uyğun (əvvəl ru/en-də azərbaycancaya dönürdü),
// gsap dinamik import olunur (First Load JS-ə düşmür, CDN asılılığı yoxdur),
// unmount-da tam cleanup, prefers-reduced-motion hər yerdə nəzərə alınır.
import { useEffect } from 'react';
import type { HeroSlide } from '@/lib/hero-slides';

const N = 9;
const IMG_RATIO = 16 / 9;

export default function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  useEffect(() => {
    const slicesRoot = document.getElementById('slices');
    const hero = document.getElementById('hero');
    if (!slicesRoot || !hero || slides.length < 2) return;

    let cancelled = false;
    const cleanups: Array<() => void> = [];
    let gsap: typeof import('gsap')['gsap'] | null = null;

    // ── jaluzi dilimlərini qur ──
    const sliceEls: Array<{ front: HTMLElement; back: HTMLElement }> = [];
    const flippers: HTMLElement[] = [];
    for (let i = 0; i < N; i++) {
      const s = document.createElement('div'); s.className = 'slice';
      const f = document.createElement('div'); f.className = 'flipper';
      const fr = document.createElement('div'); fr.className = 'face front';
      const bk = document.createElement('div'); bk.className = 'face back';
      f.appendChild(fr); f.appendChild(bk); s.appendChild(f); slicesRoot.appendChild(s);
      sliceEls.push({ front: fr, back: bk }); flippers.push(f);
    }
    cleanups.push(() => { slicesRoot.innerHTML = ''; });

    let W = 0, H = 0, SW = 0;
    const faceCSS = (el: HTMLElement, idx: number, i: number) => {
      let bw: number, bh: number;
      if (W / H > IMG_RATIO) { bw = W; bh = W / IMG_RATIO; } else { bh = H; bw = H * IMG_RATIO; }
      const px = -(i * SW) - (bw - W) / 2, py = -(bh - H) / 2;
      el.style.backgroundImage = "url('" + slides[idx].img + "')";
      el.style.backgroundBlendMode = 'normal';
      el.style.backgroundSize = bw + 'px ' + bh + 'px';
      el.style.backgroundPosition = px + 'px ' + py + 'px';
    };

    let cur = 0, anim = false;
    const layout = () => {
      W = hero.clientWidth; H = hero.clientHeight; SW = W / N;
      sliceEls.forEach((s, i) => faceCSS(s.front, cur, i));
    };
    layout();
    window.addEventListener('resize', layout);
    cleanups.push(() => window.removeEventListener('resize', layout));

    const gcKicker = document.getElementById('gcKicker');
    const gcTitle = document.getElementById('gcTitle');
    const gcLead = document.getElementById('gcLead');
    const gcCta = document.getElementById('gcCta');
    const numBtns = Array.from(document.querySelectorAll<HTMLElement>('.numb'));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Slayd 0 mətni server-də render olunub — ilk yükləmədə toxunulmur.
    const setText = (n: number) => {
      if (gcKicker) gcKicker.textContent = slides[n].kicker;
      if (gcTitle) gcTitle.innerHTML = slides[n].title;
      if (gcLead) gcLead.textContent = slides[n].lead;
      if (gcCta) gcCta.textContent = slides[n].cta;
    };
    const updateNums = () => {
      numBtns.forEach((b) => b.classList.remove('active'));
      const a = numBtns[cur];
      if (!a) return;
      void (a.querySelector('.pb i') as HTMLElement | null)?.offsetWidth; // reflow → progress bar yenidən başlasın
      a.classList.add('active');
    };

    const swapText = (n: number) => {
      const items = document.querySelectorAll('.gc-anim');
      if (gsap && !reduced) {
        const g = gsap;
        g.to(items, { y: 14, opacity: 0, duration: 0.26, stagger: 0.04, ease: 'power2.in', onComplete: () => {
          setText(n);
          g.to(items, { y: 0, opacity: 1, duration: 0.42, stagger: 0.06, ease: 'power3.out', delay: 0.22 });
        } });
      } else setText(n);
    };

    const go = (n: number) => {
      const next = (n + slides.length) % slides.length;
      if (anim || next === cur) return;
      anim = true;
      sliceEls.forEach((s, i) => faceCSS(s.back, next, i));
      swapText(next);
      if (gsap && !reduced) {
        const g = gsap;
        const from: 'start' | 'end' = next > cur ? 'start' : 'end';
        g.to(flippers, { rotationY: 180, duration: 0.92, ease: 'power3.inOut',
          stagger: { each: 0.055, from },
          onComplete: () => {
            sliceEls.forEach((s, i) => faceCSS(s.front, next, i));
            g.set(flippers, { rotationY: 0 });
            cur = next; anim = false; updateNums();
          } });
      } else {
        sliceEls.forEach((s, i) => faceCSS(s.front, next, i));
        cur = next; anim = false; updateNums();
      }
    };

    let timer = window.setInterval(() => go(cur + 1), 5000);
    const resetTimer = () => { window.clearInterval(timer); timer = window.setInterval(() => go(cur + 1), 5000); };
    cleanups.push(() => window.clearInterval(timer));

    numBtns.forEach((b) => {
      const h = () => { go(Number(b.dataset.n)); resetTimer(); };
      b.addEventListener('mouseenter', h);
      b.addEventListener('click', h);
      cleanups.push(() => { b.removeEventListener('mouseenter', h); b.removeEventListener('click', h); });
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { go(cur + 1); resetTimer(); }
      if (e.key === 'ArrowLeft') { go(cur - 1); resetTimer(); }
    };
    document.addEventListener('keydown', onKey);
    cleanups.push(() => document.removeEventListener('keydown', onKey));

    // ── gsap: ayrıca chunk. Yüklənməsə slayder animasiyasız işləyir. ──
    import('gsap').then((m) => {
      if (cancelled) return;
      gsap = m.gsap;
      const btn = document.getElementById('btnMag');
      const arr = document.getElementById('magArr');
      if (!btn || !arr || reduced) return;
      const g = m.gsap;
      const xTo = g.quickTo(btn, 'x', { duration: 0.4, ease: 'power3' });
      const yTo = g.quickTo(btn, 'y', { duration: 0.4, ease: 'power3' });
      const axTo = g.quickTo(arr, 'x', { duration: 0.35, ease: 'power3' });
      const ayTo = g.quickTo(arr, 'y', { duration: 0.35, ease: 'power3' });
      const onMove = (e: MouseEvent) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - r.left - r.width / 2, dy = e.clientY - r.top - r.height / 2;
        xTo(dx * 0.3); yTo(dy * 0.3); axTo(dx * 0.2); ayTo(dy * 0.2);
      };
      const onLeave = () => {
        g.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,.4)' });
        g.to(arr, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,.4)' });
      };
      btn.addEventListener('mousemove', onMove);
      btn.addEventListener('mouseleave', onLeave);
      cleanups.push(() => {
        btn.removeEventListener('mousemove', onMove);
        btn.removeEventListener('mouseleave', onLeave);
        g.killTweensOf([btn, arr]);
      });
    }).catch(() => { /* gsap yüklənmədi → animasiyasız davam edir */ });

    return () => {
      cancelled = true;
      if (gsap) {
        gsap.killTweensOf(flippers);
        gsap.killTweensOf(document.querySelectorAll('.gc-anim'));
      }
      cleanups.forEach((f) => f());
    };
  }, [slides]);

  return null;
}
