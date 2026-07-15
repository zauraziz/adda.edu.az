/* 1. WEBGL LIQUID
   Faza 1 / Hero 2c-də app/_components/HeroFluid.tsx-ə köçdü (xam WebGL,
   three.js olmadan — piksel-eyni). Burada TƏKRAR ETMƏ. */

/* 2-3. JALUZİ SLICES + MAGNETIC BUTTON
   Faza 1 / Hero 2b-də app/_components/HeroSlider.tsx-ə köçdü
   (SLIDES artıq dilə uyğun, gsap npm-dən dinamik import).
   Burada TƏKRAR ETMƏ — ikiqat listener/slice yaranar. */

/* 4. SAYĞACLAR (statsec)
   Qeyd: header/a11y (scrolled, şrift, kontrast), infofor və burger
   Faza 1b-də app/_components/HeaderIsland.tsx-ə köçdü — burada TƏKRAR ETMƏ,
   yoxsa listener-lər ikiqat bağlanar. */
const nums=document.querySelectorAll('.statsec .num');let counted=false;
function countUp(){if(counted)return;const sec=document.querySelector('.statsec');const r=sec.getBoundingClientRect();if(r.top<window.innerHeight&&r.bottom>0){counted=true;nums.forEach(n=>{const t=+n.dataset.target;const span=n.querySelector('span');let c=0;const step=t/60;const iv=setInterval(()=>{c+=step;if(c>=t){c=t;clearInterval(iv);}span.textContent=Math.round(c).toLocaleString('az');},25);});}}
window.addEventListener('scroll',countUp);window.addEventListener('load',countUp);


/* Calendar interaction */
document.querySelectorAll('.cal-d.ev').forEach(d=>d.addEventListener('click',()=>{
  const day=d.dataset.day;
  document.querySelectorAll('.cal-d.ev').forEach(x=>x.classList.toggle('on',x===d));
  document.querySelectorAll('.cal-ev').forEach(ev=>ev.classList.toggle('on',ev.dataset.day===day));
}));
