/* ═ Scroll-X karusel — 21st.dev pattern-inin vanilla portu.
     Baza rejim: native üfüqi scroll (JS-siz də işləyir).
     JS + geniş ekran + motion icazəsi → sticky scroll-drive aktivləşir. */
  (() => {
    const sec = document.getElementById('sosial');
    const space = document.getElementById('sxSpace');
    const vp = document.getElementById('sxViewport');
    const track = document.getElementById('sxTrack');
    const bar = document.getElementById('sxBar');
    if (!sec || !space || !vp || !track) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const narrow  = window.matchMedia('(max-width: 899px)');
    let max = 0, ticking = false, active = false;

    function measure() {
      max = track.scrollWidth - vp.clientWidth;
      if (active) space.style.height = (window.innerHeight + max) + 'px';
    }
    function progress() {
      const r = space.getBoundingClientRect();
      const total = space.offsetHeight - window.innerHeight;
      return total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
    }
    function render() {
      ticking = false;
      const p = progress();
      track.style.transform = 'translate3d(' + (-p * max) + 'px,0,0)';
      if (bar) bar.style.width = (p * 100) + '%';
    }
    function onScroll() { if (!ticking && active) { ticking = true; requestAnimationFrame(render); } }

    function setMode() {
      const want = !reduced.matches && !narrow.matches;
      if (want === active) { if (active) { measure(); render(); } return; }
      active = want;
      sec.classList.toggle('sx-js', active);
      if (active) { measure(); render(); }
      else { space.style.height = ''; track.style.transform = ''; if (bar) bar.style.width = '0%'; }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { setMode(); }, { passive: true });
    reduced.addEventListener('change', setMode);
    narrow.addEventListener('change', setMode);
    /* native rejimdə scroll ilə progress bar */
    vp.addEventListener('scroll', () => {
      if (active || !bar) return;
      const m = track.scrollWidth - vp.clientWidth;
      bar.style.width = (m > 0 ? (vp.scrollLeft / m) * 100 : 0) + '%';
    }, { passive: true });

    setMode();
  })();
