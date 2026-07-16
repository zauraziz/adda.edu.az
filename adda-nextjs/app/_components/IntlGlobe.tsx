'use client';

// ── Faza 1 / Intl: cobe qlobusu (client island) ──────────────────────
// HomeClient-dəki CITIES + initGlobe() buraya köçdü.
// Markup server-dədir (Intl.tsx) — bu ada yalnız davranış qoşur.
// initGlobe variantından fərqləri:
//   · cobe DİNAMİK import olunur → First Load JS-ə düşmür (əvvəl HomeClient
//     statik import edirdi, ona görə hər səhifədə bundle-da idi);
//   · şəhər adları artıq dilə uyğun (prop ilə gəlir) — əvvəl tooltip
//     /ru və /en-də azərbaycanca göstərirdi;
//   · bölmə ekrandan çıxanda phenomenon.toggle(false) ilə RAF dayanır
//     (əvvəl qlobus görünməsə də fasiləsiz GPU yükü yaradırdı).
// Fırlanma/sürüşdürmə riyaziyyatı və cobe parametrləri BAYT-BAYT eynidir.
// prefers-reduced-motion əvvəldən var idi (SPEED=0) — saxlanılıb: sürüşdürmə
// və hover işlək qalsın deyə render dayandırılmır, yalnız avto-fırlanma söndürülür.
import { useEffect } from 'react';
import type { Marker } from 'cobe';
import type { IntlCity } from '@/lib/intl-cities';

export default function IntlGlobe({ cities }: { cities: IntlCity[] }) {
  useEffect(() => {
    const stage = document.getElementById('ixStage');
    const canvas = document.getElementById('ixGlobe') as HTMLCanvasElement | null;
    if (!stage || !canvas) {
      console.warn('[globe] stage/canvas tapilmadi');
      return;
    }

    let disposed = false;
    let teardown: (() => void) | null = null;

    // cobe dinamik yüklənir — bundle-a yalnız qlobus render olunanda daxil olur.
    import('cobe')
      .then((mod) => {
        if (disposed) return;
        teardown = run(mod.default, stage, canvas, cities);
      })
      .catch((err) => {
        console.error('[globe] cobe yuklenmedi:', err);
      });

    return () => {
      disposed = true;
      teardown?.();
    };
  }, [cities]);

  return null;
}

type CreateGlobe = typeof import('cobe').default;

function run(createGlobe: CreateGlobe, stage: HTMLElement, canvas: HTMLCanvasElement, cities: IntlCity[]): () => void {
  const DEG = Math.PI / 180;
  const GOLD: [number, number, number] = [0.86, 0.72, 0.44];
  const BLUE: [number, number, number] = [0.40, 0.66, 0.94];
  const MARKERS: Marker[] = cities.map((ct) => ({
    location: [ct.lat, ct.lng],
    size: ct.size,
    color: ct.home ? GOLD : BLUE,
  }));
  // cobe-nin baza 3B movqeyi (firlanmadan evvel) - U() formulu ile eyni.
  const bp = cities.map((ct) => {
    const lat = ct.lat * DEG, L = ct.lng * DEG - Math.PI, S = Math.cos(lat);
    return { x: -S * Math.cos(L), y: Math.sin(lat), z: S * Math.sin(L) };
  });

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const THETA = 0.24;
  const SPEED = reduced ? 0 : 0.0032;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  let globe: ReturnType<CreateGlobe> | null = null;
  let phi = 0;
  let w = 0;
  let curTheta = THETA;
  let hoverIdx = -1;
  let visible = true;
  const scr = cities.map(() => ({ vis: false, x: 0, y: 0 }));
  const drag = {
    on: null as null | { x: number; y: number },
    off: { phi: 0, theta: 0 },
    base: { phi: 0, theta: 0 },
    v: { phi: 0, theta: 0 },
    last: null as null | { x: number; y: number; t: number },
  };

  // Tooltip elementi
  const tip = document.createElement('div');
  tip.setAttribute('role', 'tooltip');
  tip.style.position = 'absolute';
  tip.style.left = '0';
  tip.style.top = '0';
  tip.style.transform = 'translate(-50%, -145%)';
  tip.style.padding = '5px 11px';
  tip.style.borderRadius = '8px';
  tip.style.pointerEvents = 'none';
  tip.style.fontWeight = '700';
  tip.style.fontSize = '12.5px';
  tip.style.lineHeight = '1.2';
  tip.style.fontFamily = 'var(--nav-font, system-ui, sans-serif)';
  tip.style.letterSpacing = '.3px';
  tip.style.color = '#0B1B2B';
  tip.style.background = 'linear-gradient(180deg,#EBD9A8,#C9A961)';
  tip.style.boxShadow = '0 8px 22px rgba(0,0,0,.42)';
  tip.style.whiteSpace = 'nowrap';
  tip.style.opacity = '0';
  tip.style.transition = 'opacity .16s ease';
  tip.style.zIndex = '5';
  stage.appendChild(tip);
  const showTip = (i: number) => {
    tip.textContent = cities[i].name;
    tip.style.left = scr[i].x + 'px';
    tip.style.top = scr[i].y + 'px';
    tip.style.opacity = '1';
  };
  const hideTip = () => { tip.style.opacity = '0'; };

  // Her marker-in 2B ekran movqeyi - cobe shader-inin L(theta,phi) firlanmasi ile.
  const project = () => {
    const c = Math.cos(curTheta), e = Math.sin(curTheta);
    const ph = phi + drag.base.phi + drag.off.phi;
    const d = Math.cos(ph), f = Math.sin(ph);
    for (let i = 0; i < bp.length; i++) {
      const s = bp[i];
      const hx = d * s.x + f * s.z;
      const hy = f * e * s.x + c * s.y - d * e * s.z;
      const hz = -f * c * s.x + e * s.y + d * c * s.z;
      scr[i].vis = hz > 0.03;
      scr[i].x = ((0.8 * hx) + 1) / 2 * w;
      scr[i].y = (1 - (0.8 * hy)) / 2 * w;
    }
  };

  const build = () => {
    w = stage.offsetWidth;
    if (!w) return;
    if (globe) globe.destroy();
    try {
      globe = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width: w * dpr,
        height: w * dpr,
        phi: 0,
        theta: THETA,
        dark: 1,
        diffuse: 1.6,
        mapSamples: 14000,
        mapBrightness: 5.5,
        baseColor: [0.16, 0.32, 0.46],
        markerColor: [0.86, 0.72, 0.44],
        glowColor: [0.05, 0.11, 0.17],
        opacity: 0.85,
        markers: MARKERS,
        onRender: (state) => {
          const frozen = drag.on || hoverIdx >= 0;
          if (!frozen) {
            phi += SPEED;
            if (Math.abs(drag.v.phi) > 1e-4 || Math.abs(drag.v.theta) > 1e-4) {
              drag.base.phi += drag.v.phi; drag.base.theta += drag.v.theta;
              drag.v.phi *= 0.94; drag.v.theta *= 0.94;
            }
            if (drag.base.theta < -0.4) drag.base.theta += (-0.4 - drag.base.theta) * 0.1;
            if (drag.base.theta > 0.4) drag.base.theta += (0.4 - drag.base.theta) * 0.1;
          }
          curTheta = THETA + drag.base.theta + drag.off.theta;
          state.phi = phi + drag.base.phi + drag.off.phi;
          state.theta = curTheta;
          state.width = w * dpr;
          state.height = w * dpr;
          project();
          if (hoverIdx >= 0) { if (scr[hoverIdx].vis) showTip(hoverIdx); else { hoverIdx = -1; hideTip(); } }
        },
      });
      // Yenidən qurulanda cobe render-i avtomatik başladır — bölmə ekranda
      // deyilsə dərhal dayandır (əks halda gizli qlobus RAF yandırardı).
      if (!visible) globe.toggle(false);
      requestAnimationFrame(() => stage.classList.add('is-live'));
    } catch (err) {
      console.error('[globe] createGlobe xetasi:', err);
    }
  };

  const pick = (mx: number, my: number) => {
    let best = -1, bestD = 26 * 26;
    for (let i = 0; i < scr.length; i++) {
      if (!scr[i].vis) continue;
      const dx = scr[i].x - mx, dy = scr[i].y - my, dd = dx * dx + dy * dy;
      if (dd < bestD) { bestD = dd; best = i; }
    }
    return best;
  };

  const onDown = (e: PointerEvent) => {
    drag.on = { x: e.clientX, y: e.clientY };
    drag.last = { x: e.clientX, y: e.clientY, t: Date.now() };
    canvas.style.cursor = 'grabbing';
  };
  const onMove = (e: PointerEvent) => {
    if (drag.on && drag.last) {
      drag.off.phi = (e.clientX - drag.on.x) / 280;
      drag.off.theta = (e.clientY - drag.on.y) / 900;
      const now = Date.now(); const dt = Math.max(now - drag.last.t, 1); const cap = 0.15;
      drag.v.phi = Math.max(-cap, Math.min(cap, ((e.clientX - drag.last.x) / dt) * 0.3));
      drag.v.theta = Math.max(-cap, Math.min(cap, ((e.clientY - drag.last.y) / dt) * 0.08));
      drag.last = { x: e.clientX, y: e.clientY, t: now };
      return;
    }
    const r = canvas.getBoundingClientRect();
    const idx = pick(e.clientX - r.left, e.clientY - r.top);
    if (idx !== hoverIdx) {
      hoverIdx = idx;
      if (idx >= 0) { showTip(idx); canvas.style.cursor = 'pointer'; }
      else { hideTip(); canvas.style.cursor = 'grab'; }
    } else if (idx >= 0) {
      showTip(idx);
    }
  };
  const onUp = () => {
    if (drag.on) { drag.base.phi += drag.off.phi; drag.base.theta += drag.off.theta; drag.off.phi = 0; drag.off.theta = 0; }
    drag.on = null;
    canvas.style.cursor = 'grab';
  };
  const onLeave = () => { if (hoverIdx >= 0) { hoverIdx = -1; hideTip(); } };
  canvas.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerup', onUp, { passive: true });
  canvas.addEventListener('pointerleave', onLeave);

  let ro: ResizeObserver | null = null;
  if (stage.offsetWidth > 0) build();
  else { ro = new ResizeObserver((en) => { if (en[0].contentRect.width > 0) { ro?.disconnect(); build(); } }); ro.observe(stage); }

  let rT: ReturnType<typeof setTimeout>;
  const onResize = () => { clearTimeout(rT); rT = setTimeout(() => { if (Math.abs(stage.offsetWidth - w) > 80) build(); }, 220); };
  window.addEventListener('resize', onResize);

  // Bölmə ekrandan çıxanda RAF-ı dayandır (HeroFluid ilə eyni pattern).
  // phenomenon.toggle(false) → requestAnimationFrame söndürülür, resurs yanmır.
  const io = new IntersectionObserver((es) => {
    visible = es[0].isIntersecting;
    if (!globe) return;
    globe.toggle(visible);
    if (!visible && hoverIdx >= 0) { hoverIdx = -1; hideTip(); }
  }, { threshold: 0 });
  io.observe(stage);

  return () => {
    io.disconnect();
    if (globe) globe.destroy();
    ro?.disconnect();
    clearTimeout(rT);
    canvas.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    canvas.removeEventListener('pointerleave', onLeave);
    window.removeEventListener('resize', onResize);
    tip.remove();
    stage.classList.remove('is-live');
  };
}
