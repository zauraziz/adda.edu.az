/* 1. WEBGL LIQUID
   Faza 1 / Hero 2c-də app/_components/HeroFluid.tsx-ə köçdü (xam WebGL,
   three.js olmadan — piksel-eyni). Burada TƏKRAR ETMƏ. */

/* 2-3. JALUZİ SLICES + MAGNETIC BUTTON
   Faza 1 / Hero 2b-də app/_components/HeroSlider.tsx-ə köçdü
   (SLIDES artıq dilə uyğun, gsap npm-dən dinamik import).
   Burada TƏKRAR ETMƏ — ikiqat listener/slice yaranar. */

/* 4. SAYĞACLAR (statsec)
   Faza 1 / Stats-da app/_components/StatsIsland.tsx-ə köçdü.
   Header/a11y (scrolled, şrift, kontrast), infofor, burger → HeaderIsland.tsx.
   Burada TƏKRAR ETMƏ — ikiqat listener yaranar. */
/* (sayğac kodu StatsIsland.tsx-ə köçdü — burada TƏKRAR ETMƏ) */

/* Calendar interaction */
document.querySelectorAll('.cal-d.ev').forEach(d=>d.addEventListener('click',()=>{
  const day=d.dataset.day;
  document.querySelectorAll('.cal-d.ev').forEach(x=>x.classList.toggle('on',x===d));
  document.querySelectorAll('.cal-ev').forEach(ev=>ev.classList.toggle('on',ev.dataset.day===day));
}));
