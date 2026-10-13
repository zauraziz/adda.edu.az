'use client';

// ── Hero slayder + magnit düymə (client island) ──────────────────────
// Markup server-dədir (Hero.tsx) — bu ada yalnız davranış qoşur.
// F5.50:
//   - slayd sayı admindən gəlir (1–6); düymənin mətni İLƏ keçidi də dəyişir;
//   - hər şəklin öz nisbəti (əvvəl hamısı 16:9 sayılırdı → 3:2, 4:3 foto dartılırdı);
//   - növbəti şəkillər əvvəlcədən yüklənir;
//   - WCAG 2.2.2: «Dayandır» düyməsi; kursor/fokus mətn blokunda olanda, səhifə
//     gizlədiləndə və hero görünməyəndə avtomatik keçid dayanır;
//   - ← / → yalnız hero görünəndə və fokus mətn sahəsində/başqa slayderdə deyilkən.
// gsap dinamik import olunur (First Load JS-ə düşmür); prefers-reduced-motion
// hər yerdə nəzərə alınır (avtomatik keçid də olmur).
import { useEffect } from 'react';
import type { HeroSlide } from '@/lib/home';

const N = 9;
const DEFAULT_RATIO = 16 / 9;
const INTERVAL = 5000;

export default function HeroSlider({ slides, labels }: { slides: HeroSlide[]; labels: { pause: string; play: string } }) {
  useEffect(() => {
    const slicesRoot = document.getElementById('slices');
    const hero = document.getElementById('hero');
    if (!slicesRoot || !hero || !slides.length) return;

    let cancelled = false;
    const cleanups: Array<() => void> = [];
    let gsap: typeof import('gsap')['gsap'] | null = null;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── şəkillərin nisbəti + əvvəlcədən yükləmə ──
    const ratios = slides.map(() => DEFAULT_RATIO);

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
    // Server-dəki ilk şəkil (JS-siz görünüş) — dilimlər qurulandan sonra lazım deyil.
    const ssrBg = slicesRoot.style.backgroundImage;
    slicesRoot.style.backgroundImage = 'none';
    cleanups.push(() => { slicesRoot.innerHTML = ''; slicesRoot.style.backgroundImage = ssrBg; });

    let W = 0, H = 0, SW = 0;
    const faceCSS = (el: HTMLElement, idx: number, i: number) => {
      const r = ratios[idx] || DEFAULT_RATIO;
      let bw: number, bh: number;
      if (W / H > r) { bw = W; bh = W / r; } else { bh = H; bw = H * r; }
      const px = -(i * SW) - (bw - W) / 2, py = -(bh - H) / 2;
      el.style.backgroundImage = "url('" + slides[idx].img + "')";
      el.style.backgroundBlendMode = 'normal';
      el.style.backgroundSize = bw + 'px ' + bh + 'px';
      el.style.backgroundPosition = px + 'px ' + py + 'px';
    };

    let cur = 0, anim = false;
    let elapsed = 0; // avtomatik keçid üçün toplanan vaxt (aşağıda)
    const layout = () => {
      W = hero.clientWidth; H = hero.clientHeight; SW = W / N;
      sliceEls.forEach((s, i) => faceCSS(s.front, cur, i));
    };
    layout();
    window.addEventListener('resize', layout);
    cleanups.push(() => window.removeEventListener('resize', layout));

    slides.forEach((s, i) => {
      const im = new Image();
      im.onload = () => {
        if (cancelled || !im.naturalWidth || !im.naturalHeight) return;
        ratios[i] = im.naturalWidth / im.naturalHeight;
        if (i === cur && !anim) layout();
      };
      im.src = s.img;
    });

    if (slides.length < 2) return () => { cancelled = true; cleanups.forEach((f) => f()); };

    const gcKicker = document.getElementById('gcKicker');
    const gcTitle = document.getElementById('gcTitle');
    const gcLead = document.getElementById('gcLead');
    const gcCta = document.getElementById('gcCta');
    const btnMag = document.getElementById('btnMag') as HTMLAnchorElement | null;
    const pauseBtn = document.getElementById('heroPause');
    const copy = hero.querySelector<HTMLElement>('.hero-copy');
    const numBtns = Array.from(hero.querySelectorAll<HTMLElement>('.numb'));

    // Slayd 0 mətni server-də render olunub — ilk yükləmədə toxunulmur.
    const setText = (n: number) => {
      const s = slides[n];
      if (gcKicker) { gcKicker.textContent = s.kicker; (gcKicker.parentElement as HTMLElement).hidden = !s.kicker; }
      if (gcTitle) gcTitle.innerHTML = s.title; // lib/home.ts-də qaçırılıb (yalnız <em>)
      if (gcLead) { gcLead.textContent = s.lead; gcLead.hidden = !s.lead; }
      if (gcCta) gcCta.textContent = s.cta;
      if (btnMag) { btnMag.hidden = !s.cta; btnMag.href = s.href || '#'; }
    };
    const updateNums = () => {
      numBtns.forEach((b) => { b.classList.remove('active'); b.removeAttribute('aria-current'); });
      const a = numBtns[cur];
      if (!a) return;
      void (a.querySelector('.pb i') as HTMLElement | null)?.offsetWidth; // reflow → progress bar yenidən başlasın
      a.classList.add('active');
      a.setAttribute('aria-current', 'true');
    };

    const swapText = (n: number) => {
      const items = hero.querySelectorAll('.gc-anim');
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
      elapsed = 0;
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

    // ── avtomatik keçid: dayandırma səbəbləri ──
    let userPaused = reduced; // reduced-motion → avtomatik keçid yoxdur
    let hover = false, focusIn = false, offscreen = false;
    const running = () => !userPaused && !hover && !focusIn && !offscreen && !document.hidden;
    const syncState = () => {
      hero.classList.toggle('is-paused', !running());
      if (copy) copy.setAttribute('aria-live', userPaused ? 'polite' : 'off');
      if (pauseBtn) {
        pauseBtn.setAttribute('aria-pressed', String(userPaused));
        pauseBtn.setAttribute('aria-label', userPaused ? labels.play : labels.pause);
        const ic = pauseBtn.querySelector('i');
        if (ic) ic.className = 'ti ' + (userPaused ? 'ti-player-play' : 'ti-player-pause');
      }
    };
    // Keçən vaxt yalnız işləyəndə toplanır — dayanıb davam edəndə proqres zolağı
    // (CSS animasiyası da is-paused-da dayanır) ilə sinxron qalır.
    let last = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const dt = now - last;
      last = now;
      if (!running() || anim) return;
      elapsed += dt;
      if (elapsed >= INTERVAL) go(cur + 1);
    }, 200);
    cleanups.push(() => window.clearInterval(timer));
    syncState();

    const listen = (el: EventTarget, ev: string, fn: EventListener) => {
      el.addEventListener(ev, fn);
      cleanups.push(() => el.removeEventListener(ev, fn));
    };
    // Mətn oxunarkən (kursor və ya klaviatura fokusu mətn blokunda) dayanır;
    // nömrə/dayandır düymələrinin fokusu dayandırmır — əks halda «davam et»
    // basılandan sonra fokus düymədə qalır və keçid heç vaxt bərpa olunmurdu.
    if (copy) {
      listen(copy, 'mouseenter', () => { hover = true; syncState(); });
      listen(copy, 'mouseleave', () => { hover = false; syncState(); });
      listen(copy, 'focusin', () => { focusIn = true; syncState(); });
      listen(copy, 'focusout', (e) => {
        if (!copy.contains((e as FocusEvent).relatedTarget as Node | null)) { focusIn = false; syncState(); }
      });
    }
    listen(document, 'visibilitychange', syncState);
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => { offscreen = !es[0]?.isIntersecting; syncState(); }, { threshold: 0.15 });
      io.observe(hero);
      cleanups.push(() => io.disconnect());
    }
    if (pauseBtn) listen(pauseBtn, 'click', () => { userPaused = !userPaused; syncState(); });

    numBtns.forEach((b) => {
      const h = () => go(Number(b.dataset.n));
      listen(b, 'mouseenter', h);
      listen(b, 'click', h);
    });

    listen(document, 'keydown', (ev) => {
      const e = ev as KeyboardEvent;
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      if (t && t !== document.body && !hero.contains(t)) return; // başqa idarəetmə elementi (slayder, forma)
      const r = hero.getBoundingClientRect();
      if (r.bottom < 80 || r.top > window.innerHeight - 80) return;
      go(cur + (e.key === 'ArrowRight' ? 1 : -1));
    });

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
        gsap.killTweensOf(hero.querySelectorAll('.gc-anim'));
      }
      cleanups.forEach((f) => f());
    };
  }, [slides, labels]);

  return null;
}
