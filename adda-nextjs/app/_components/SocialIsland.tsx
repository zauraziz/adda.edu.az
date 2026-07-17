'use client';

// ── Faza 1 / Social: scroll-x karusel (client island) ────────────────
// public/home/socialx.mjs buraya köçdü (sonra fayl silindi).
// Markup server-dədir (Social.tsx) — bu ada yalnız davranış qoşur.
// Progressive enhancement DƏYİŞMƏYİB:
//   · baza rejim = native üfüqi scroll (CSS) — JS olmasa da işləyir;
//   · sticky scroll-drive YALNIZ geniş ekranda (>899px) və motion icazəsi olanda.
// socialx.mjs variantından fərqi: IIFE bir dəfə işləyib heç vaxt təmizlənmirdi
// (listener-lər anonim idi) → burada hamısı adlandırılıb və unmount-da silinir.
import { useEffect } from 'react';

const NARROW = '(max-width: 899px)';

export default function SocialIsland() {
  useEffect(() => {
    const sec = document.getElementById('sosial');
    const space = document.getElementById('sxSpace');
    const vp = document.getElementById('sxViewport');
    const track = document.getElementById('sxTrack');
    const bar = document.getElementById('sxBar');
    if (!sec || !space || !vp || !track) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const narrow = window.matchMedia(NARROW);
    let max = 0, ticking = false, active = false;

    const measure = () => {
      max = track.scrollWidth - vp.clientWidth;
      if (active) space.style.height = (window.innerHeight + max) + 'px';
    };
    const progress = () => {
      const r = space.getBoundingClientRect();
      const total = space.offsetHeight - window.innerHeight;
      return total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
    };
    const render = () => {
      ticking = false;
      const p = progress();
      track.style.transform = 'translate3d(' + (-p * max) + 'px,0,0)';
      if (bar) bar.style.width = (p * 100) + '%';
    };
    const onScroll = () => { if (!ticking && active) { ticking = true; requestAnimationFrame(render); } };

    const setMode = () => {
      const want = !reduced.matches && !narrow.matches;
      if (want === active) { if (active) { measure(); render(); } return; }
      active = want;
      sec.classList.toggle('sx-js', active);
      if (active) { measure(); render(); }
      else { space.style.height = ''; track.style.transform = ''; if (bar) bar.style.width = '0%'; }
    };

    const onResize = () => { setMode(); };
    // native rejimdə scroll ilə progress bar
    const onVpScroll = () => {
      if (active || !bar) return;
      const m = track.scrollWidth - vp.clientWidth;
      bar.style.width = (m > 0 ? (vp.scrollLeft / m) * 100 : 0) + '%';
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    reduced.addEventListener('change', setMode);
    narrow.addEventListener('change', setMode);
    vp.addEventListener('scroll', onVpScroll, { passive: true });

    setMode();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      reduced.removeEventListener('change', setMode);
      narrow.removeEventListener('change', setMode);
      vp.removeEventListener('scroll', onVpScroll);
      // qoyulmuş inline stilləri geri qaytar (əks halda unmount-dan sonra qalırdı)
      sec.classList.remove('sx-js');
      space.style.height = '';
      track.style.transform = '';
      if (bar) bar.style.width = '';
    };
  }, []);

  return null;
}
