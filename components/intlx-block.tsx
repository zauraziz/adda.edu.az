<!-- 6. BEYNƏLXALQ ƏMƏKDAŞLIQ VƏ NÜFUZ — interaktiv qlobus (cobe) -->
<section class="intlx" id="beynelxalq">
  <div class="container">
    <div class="ix-grid">

      <div class="ix-tx">
        <div class="ix-eyebrow">Beynəlxalq əməkdaşlıq və nüfuz</div>
        <h2 class="ix-title">Bakıdan <em>dünyaya</em> uzanan şəbəkə</h2>
        <p class="ix-lead">ADDA 5 qitədə 47-dən çox universitet, dənizçilik akademiyası və beynəlxalq qurumla əməkdaşlıq edir. IAMU üzvlüyü, Erasmus+ mobillik proqramları və TURMARIN regional şəbəkəsi tələbələrimizə qlobal təhsil trayektoriyası açır — məzunlarımız dünya donanmalarında, beynəlxalq limanlarda və IMO strukturlarında çalışırlar.</p>
        <div class="ix-stats">
          <div class="ix-stat"><b>47+</b><span>Tərəfdaş qurum</span></div>
          <div class="ix-stat"><b>5</b><span>Qitə</span></div>
          <div class="ix-stat"><b>20+</b><span>Mübadilə istiqaməti</span></div>
        </div>
        <div class="ix-cta">
          <a href="#" class="ix-btn">Partnyorluq təklifi <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>
          <a href="#" class="ix-btn ix-btn--ghost">Mübadilə proqramları</a>
        </div>
      </div>

      <div class="ix-globe-wrap">
        <div class="ix-stage" id="ixStage">
          <div class="ix-static" aria-hidden="true"></div>
          <canvas id="ixGlobe" aria-label="İnteraktiv qlobus — tərəfdaş şəhərlər"></canvas>
        </div>
        <div class="ix-hint">
          <span class="ix-drag"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 4 12 9 18"/><polyline points="15 6 20 12 15 18"/></svg> Sürüşdür və fırlat</span>
          <span class="ix-leg"><i class="ix-dot ix-dot--home"></i> Bakı</span>
          <span class="ix-leg"><i class="ix-dot"></i> Tərəfdaş şəhər</span>
        </div>
        <p class="ix-cities">İstanbul · Varna · Gdynia · Rotterdam · Sautgempton · Tokio · Şanxay · İsgəndəriyyə · Konstansa</p>
      </div>

    </div>

    <div class="ix-orgs">
      <span class="ix-orgs-label">Etibar şəbəkəsi</span>
      <div class="ix-chiprow">
        <span class="ix-org"><i class="ti ti-anchor"></i> IMO</span>
        <span class="ix-org"><i class="ti ti-world"></i> IAMU</span>
        <span class="ix-org"><i class="ti ti-shield-check"></i> EMSA</span>
        <span class="ix-org"><i class="ti ti-certificate"></i> STCW</span>
        <span class="ix-org"><i class="ti ti-school"></i> Erasmus+</span>
        <span class="ix-org"><i class="ti ti-ship"></i> TURMARIN</span>
        <span class="ix-org"><i class="ti ti-building-bank"></i> ASCO</span>
      </div>
    </div>
  </div>

  <script type="module">
  /* ═ ADDA Globe — cobe vanilla portu (React komponentinin birbaşa ekvivalenti)
     · yalnız bu bölməyə aiddir, mövcud skriptlərə toxunmur
     · CDN alınmasa .ix-static CSS qlobusu qalır (graceful fallback)        */
  (async () => {
    const stage  = document.getElementById('ixStage');
    const canvas = document.getElementById('ixGlobe');
    if (!stage || !canvas) return;
    let createGlobe;
    try {
      ({ default: createGlobe } = await import('https://esm.sh/cobe@0.6.4'));
    } catch (e1) {
      try { ({ default: createGlobe } = await import('https://unpkg.com/cobe@0.6.4/dist/index.esm.js')); }
      catch (e2) { return; } /* fallback sferası qalır */
    }

    const MARKERS = [
      { location: [40.4093, 49.8671], size: 0.09 },  /* Bakı — mərkəz */
      { location: [41.0082, 28.9784], size: 0.045 }, /* İstanbul */
      { location: [43.2141, 27.9147], size: 0.04 },  /* Varna */
      { location: [54.5189, 18.5305], size: 0.04 },  /* Gdynia */
      { location: [51.9244,  4.4777], size: 0.045 }, /* Rotterdam */
      { location: [50.9097, -1.4044], size: 0.04 },  /* Sautgempton */
      { location: [35.6762,139.6503], size: 0.05 },  /* Tokio — IAMU */
      { location: [31.2304,121.4737], size: 0.045 }, /* Şanxay */
      { location: [31.2001, 29.9187], size: 0.04 },  /* İsgəndəriyyə */
      { location: [44.1598, 28.6348], size: 0.04 }   /* Konstansa */
    ];

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let globe = null, raf = 0, phi = 0, w = 0;
    const drag = { on: null, off: { phi: 0, theta: 0 }, base: { phi: 0, theta: 0 }, v: { phi: 0, theta: 0 }, last: null };
    const THETA = 0.24, SPEED = reduced ? 0 : 0.0032;

    function build() {
      w = stage.offsetWidth;
      if (!w) return;
      if (globe) { globe.destroy(); cancelAnimationFrame(raf); }
      globe = createGlobe(canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        width: w, height: w,
        phi: 0, theta: THETA, dark: 1, diffuse: 1.6,
        mapSamples: 14000, mapBrightness: 5.5,
        baseColor: [0.16, 0.32, 0.46],
        markerColor: [0.86, 0.72, 0.44],
        glowColor: [0.05, 0.11, 0.17],
        opacity: 0.85,
        markers: MARKERS
      });
      const loop = () => {
        if (!drag.on) {
          phi += SPEED;
          if (Math.abs(drag.v.phi) > 1e-4 || Math.abs(drag.v.theta) > 1e-4) {
            drag.base.phi += drag.v.phi; drag.base.theta += drag.v.theta;
            drag.v.phi *= 0.94; drag.v.theta *= 0.94;
          }
          if (drag.base.theta < -0.4) drag.base.theta += (-0.4 - drag.base.theta) * 0.1;
          if (drag.base.theta >  0.4) drag.base.theta += ( 0.4 - drag.base.theta) * 0.1;
        }
        globe.update({ phi: phi + drag.base.phi + drag.off.phi,
                       theta: THETA + drag.base.theta + drag.off.theta });
        raf = requestAnimationFrame(loop);
      };
      loop();
      requestAnimationFrame(() => stage.classList.add('is-live'));
    }

    canvas.addEventListener('pointerdown', e => {
      drag.on = { x: e.clientX, y: e.clientY };
      drag.last = { x: e.clientX, y: e.clientY, t: Date.now() };
      canvas.style.cursor = 'grabbing';
    });
    window.addEventListener('pointermove', e => {
      if (!drag.on) return;
      drag.off.phi   = (e.clientX - drag.on.x) / 280;
      drag.off.theta = (e.clientY - drag.on.y) / 900;
      const now = Date.now(), dt = Math.max(now - drag.last.t, 1), cap = 0.15;
      drag.v.phi   = Math.max(-cap, Math.min(cap, (e.clientX - drag.last.x) / dt * 0.3));
      drag.v.theta = Math.max(-cap, Math.min(cap, (e.clientY - drag.last.y) / dt * 0.08));
      drag.last = { x: e.clientX, y: e.clientY, t: now };
    }, { passive: true });
    window.addEventListener('pointerup', () => {
      if (drag.on) { drag.base.phi += drag.off.phi; drag.base.theta += drag.off.theta;
                     drag.off.phi = drag.off.theta = 0; }
      drag.on = null; canvas.style.cursor = 'grab';
    }, { passive: true });

    if (stage.offsetWidth > 0) build();
    else new ResizeObserver((en, ro) => { if (en[0].contentRect.width > 0) { ro.disconnect(); build(); } }).observe(stage);
    let rT; window.addEventListener('resize', () => {
      clearTimeout(rT);
      rT = setTimeout(() => { if (Math.abs(stage.offsetWidth - w) > 80) build(); }, 220);
    });
  })();
  </script>
</section>
