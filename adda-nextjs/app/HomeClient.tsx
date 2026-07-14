'use client';

import { useEffect } from 'react';
import createGlobe, { type Marker } from 'cobe';
import type { NewsItem, SiteMenu, MenuFooterCol, MenuQuick } from '@/lib/strapi';
import { translateStatic, type Locale } from '@/lib/i18n';
import { FALLBACK_MENU } from '@/lib/menu-fallback';

// Bridge (Merhele 0): orijinal statik HTML render + qalan vanilla JS inject.
// Qlobus artiq bundle-dan (cobe npm) isleyir - CDN/modul yukleme asililigi yoxdur.
const SCRIPTS: { src: string; module?: boolean }[] = [
  { src: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js' },
  { src: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js' },
  { src: '/home/socialx.mjs', module: true },
  { src: '/home/ui.js' },
];

// ADDA qlobus (cobe) - onRender animasiya + seher marker-lerinde hover tooltip.
type City = { name: string; lat: number; lng: number; size: number; home?: boolean };
const CITIES: City[] = [
  { name: 'Bakı', lat: 40.4093, lng: 49.8671, size: 0.09, home: true },
  { name: 'İstanbul', lat: 41.0082, lng: 28.9784, size: 0.045 },
  { name: 'Varna', lat: 43.2141, lng: 27.9147, size: 0.04 },
  { name: 'Gdynia', lat: 54.5189, lng: 18.5305, size: 0.04 },
  { name: 'Rotterdam', lat: 51.9244, lng: 4.4777, size: 0.045 },
  { name: 'Sautgempton', lat: 50.9097, lng: -1.4044, size: 0.04 },
  { name: 'Tokio', lat: 35.6762, lng: 139.6503, size: 0.05 },
  { name: 'Şanxay', lat: 31.2304, lng: 121.4737, size: 0.045 },
  { name: 'İsgəndəriyyə', lat: 31.2001, lng: 29.9187, size: 0.04 },
  { name: 'Konstansa', lat: 44.1598, lng: 28.6348, size: 0.04 },
];

function initGlobe(): () => void {
  const stage = document.getElementById('ixStage');
  const canvas = document.getElementById('ixGlobe') as HTMLCanvasElement | null;
  if (!stage || !canvas) { console.warn('[globe] stage/canvas tapilmadi'); return () => {}; }

  const DEG = Math.PI / 180;
  const GOLD: [number, number, number] = [0.86, 0.72, 0.44];
  const BLUE: [number, number, number] = [0.40, 0.66, 0.94];
  const MARKERS: Marker[] = CITIES.map((ct) => ({
    location: [ct.lat, ct.lng],
    size: ct.size,
    color: ct.home ? GOLD : BLUE,
  }));
  // cobe-nin baza 3B movqeyi (firlanmadan evvel) - U() formulu ile eyni.
  const bp = CITIES.map((ct) => {
    const lat = ct.lat * DEG, L = ct.lng * DEG - Math.PI, S = Math.cos(lat);
    return { x: -S * Math.cos(L), y: Math.sin(lat), z: S * Math.sin(L) };
  });

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const THETA = 0.24;
  const SPEED = reduced ? 0 : 0.0032;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  let globe: ReturnType<typeof createGlobe> | null = null;
  let phi = 0;
  let w = 0;
  let curTheta = THETA;
  let hoverIdx = -1;
  const scr = CITIES.map(() => ({ vis: false, x: 0, y: 0 }));
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
    tip.textContent = CITIES[i].name;
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

  return () => {
    if (globe) globe.destroy();
    ro?.disconnect();
    canvas.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    canvas.removeEventListener('pointerleave', onLeave);
    window.removeEventListener('resize', onResize);
    tip.remove();
    stage.classList.remove('is-live');
  };
}

// Footer abune formu: validasiya + /api/subscribe POST.
function initNewsletter(): () => void {
  const form = document.getElementById('nlForm') as HTMLFormElement | null;
  const input = document.getElementById('nlEmail') as HTMLInputElement | null;
  const btn = document.getElementById('nlBtn') as HTMLButtonElement | null;
  const msg = document.getElementById('nlMsg');
  if (!form || !input || !btn || !msg) return () => {};
  const setMsg = (t: string, ok: boolean) => {
    msg.textContent = t;
    (msg as HTMLElement).style.color = ok ? '#8FD9B0' : '#F2B8B5';
  };
  const onSubmit = async (e: Event) => {
    e.preventDefault();
    const email = input.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setMsg('Zəhmət olmasa düzgün e-poçt ünvanı daxil edin.', false);
      input.focus();
      return;
    }
    btn.disabled = true;
    const t0 = btn.innerHTML;
    btn.textContent = 'Göndərilir…';
    try {
      const r = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (r.ok) { setMsg('Təşəkkürlər! Abunəliyiniz qeydə alındı.', true); form.reset(); }
      else setMsg('Xəta baş verdi. Bir az sonra yenidən cəhd edin.', false);
    } catch {
      setMsg('Şəbəkə xətası. Yenidən cəhd edin.', false);
    }
    btn.disabled = false;
    btn.innerHTML = t0;
  };
  form.addEventListener('submit', onSubmit);
  return () => form.removeEventListener('submit', onSubmit);
}


// ── Xəbər kartları (CMS) ──────────────────────────────────────────────
const CAT_LABELS: Record<Locale, Record<string, string>> = {
  az: { xeber: 'Xəbər', elan: 'Elan', tedbir: 'Tədbir', elm: 'Elm' },
  ru: { xeber: 'Новость', elan: 'Объявление', tedbir: 'Событие', elm: 'Наука' },
  en: { xeber: 'News', elan: 'Announcement', tedbir: 'Event', elm: 'Science' },
};
const MONTHS: Record<Locale, string[]> = {
  az: ['Yanvar','Fevral','Mart','Aprel','May','İyun','İyul','Avqust','Sentyabr','Oktyabr','Noyabr','Dekabr'],
  ru: ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'],
  en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
};

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function fmtDate(iso: string | null, locale: Locale): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[locale][d.getMonth()]} ${d.getFullYear()}`;
}
function buildNewsCards(news: NewsItem[], locale: Locale): string {
  const slots = ['nx-a', 'nx-b', 'nx-c', 'nx-d'];
  const labels = CAT_LABELS[locale];
  return news.slice(0, 4).map((n, i) => {
    const bg = n.image
      ? `background-image:url('${escHtml(n.image)}')`
      : 'background:linear-gradient(135deg,#0B3D5C,#0a2f47)';
    const cat = labels[n.category] ?? labels.xeber;
    const date = fmtDate(n.date, locale);
    return `<a href="#" class="nx-card ${slots[i]}" style="${bg}">
          <span class="nx-ov"></span>
          <span class="nx-tx">
            <span class="nx-chip">${escHtml(cat)}</span>
            <span class="nx-date"><i class="ti ti-calendar"></i> ${escHtml(date)}</span>
            <h3>${escHtml(n.title)}</h3>
          </span>
        </a>`;
  }).join('\n        ');
}

const FALLBACK_CARDS = `        <a href="#" class="nx-card nx-a" style="background-image:url('https://images.unsplash.com/photo-1751779057940-43cc385452f7?fm=jpg&q=80&w=1600&auto=format&fit=crop')">
          <span class="nx-ov"></span>
          <span class="nx-tx">
            <span class="nx-chip">Beynəlxalq</span>
            <span class="nx-date"><i class="ti ti-calendar"></i> 05 İyun 2026</span>
            <h3>ADDA TURMARIN layihəsi çərçivəsində Türk dövlətləri ilə dənizçilik tədqiqat şəbəkəsi yaradır</h3>
          </span>
        </a>
        <a href="#" class="nx-card nx-b" style="background-image:url('https://images.unsplash.com/photo-1641467613990-b74163e280e3?fm=jpg&q=80&w=1200&auto=format&fit=crop')">
          <span class="nx-ov"></span>
          <span class="nx-tx">
            <span class="nx-chip">Qəbul</span>
            <span class="nx-date"><i class="ti ti-calendar"></i> 01 İyun 2026</span>
            <h3>2026–2027 akademik ili üçün qəbul planı təsdiqləndi</h3>
          </span>
        </a>
        <a href="#" class="nx-card nx-c" style="background-image:url('https://images.unsplash.com/photo-1724597500306-a4cbb7d1324e?fm=jpg&q=80&w=1200&auto=format&fit=crop')">
          <span class="nx-ov"></span>
          <span class="nx-tx">
            <span class="nx-chip">Tələbə həyatı</span>
            <span class="nx-date"><i class="ti ti-calendar"></i> 28 May 2026</span>
            <h3>Tələbələr Xəzər dənizində təcrübə səfərini başa vurdu</h3>
          </span>
        </a>
        <a href="#" class="nx-card nx-d" style="background-image:url('https://images.unsplash.com/photo-1641467613990-b74163e280e3?fm=jpg&q=78&w=1200&h=700&fit=crop')">
          <span class="nx-ov"></span>
          <span class="nx-tx">
            <span class="nx-chip">Elm və tədqiqat</span>
            <span class="nx-date"><i class="ti ti-calendar"></i> 18 May 2026</span>
            <h3>Akademiya IAMU illik konfransında təmsil olundu</h3>
          </span>
        </a>
      `;

// ── Menyu (CMS) ──────────────────────────────────────────────────────
function escM(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function buildFooterCols(cols: MenuFooterCol[]): string {
  return cols
    .map((col) => {
      const links = (col.links ?? []).map((l) => `<a href="${escM(l.url || '#')}">${escM(l.label)}</a>`).join('');
      return `<div class="foot-col"><h4>${escM(col.title)}</h4>${links}</div>`;
    })
    .join('\n        ');
}

function buildQuicknav(items: MenuQuick[]): string {
  return items.map((q) => `<a href="${escM(q.url || '#')}" class="qnav-item"><i class="ti ti-${escM(q.icon || 'point')}"></i> ${escM(q.label)}</a>`).join('\n    ');
}

// ── Axtarış (Meilisearch, /api/search) ──
function initSearch(): () => void {
  const btn = document.querySelector('.util-icon[aria-label="Axtarış"]') as HTMLButtonElement | null;
  const modal = document.getElementById('searchModal');
  const input = document.getElementById('searchInput') as HTMLInputElement | null;
  const results = document.getElementById('searchResults');
  if (!btn || !modal || !input || !results) return () => {};

  const pathLoc = window.location.pathname.split('/')[1];
  const uiLoc = (['az', 'ru', 'en'].includes(pathLoc) ? pathLoc : 'az') as 'az' | 'ru' | 'en';
  const SUI = {
    az: { ph: 'Xəbər, ixtisas, səhifə axtar...', types: { article: 'Xəbər', program: 'İxtisas', page: 'Səhifə' }, empty: 'Nəticə tapılmadı', loading: 'Axtarılır…', error: 'Xəta baş verdi' },
    ru: { ph: 'Поиск: новости, специальности, страницы...', types: { article: 'Новость', program: 'Специальность', page: 'Страница' }, empty: 'Ничего не найдено', loading: 'Идёт поиск…', error: 'Произошла ошибка' },
    en: { ph: 'Search news, programmes, pages...', types: { article: 'News', program: 'Programme', page: 'Page' }, empty: 'No results found', loading: 'Searching…', error: 'Something went wrong' },
  }[uiLoc];
  input.placeholder = SUI.ph;

  const open = () => { modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); setTimeout(() => input.focus(), 60); };
  const close = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); };
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
  btn.addEventListener('click', open);
  modal.querySelectorAll('[data-search-close]').forEach((el) => el.addEventListener('click', close));
  document.addEventListener('keydown', onKey);

  const TYPE_LABEL: Record<string, string> = SUI.types;
  type Hit = { title?: string; excerpt?: string; contentType?: string };
  const render = (hits: Hit[]) => {
    if (!hits.length) { results.innerHTML = `<div class="search-empty">${SUI.empty}</div>`; return; }
    results.innerHTML = hits
      .map((h) => `<a href="#" class="search-hit"><span class="sh-type">${escM(TYPE_LABEL[h.contentType || ''] || '')}</span><span class="sh-main"><b>${escM(h.title || '')}</b>${h.excerpt ? `<small>${escM(h.excerpt)}</small>` : ''}</span><i class="ti ti-arrow-up-right"></i></a>`)
      .join('');
  };

  let timer: ReturnType<typeof setTimeout>;
  let seq = 0;
  const onInput = () => {
    const q = input.value.trim();
    clearTimeout(timer);
    if (!q) { results.innerHTML = ''; return; }
    results.innerHTML = `<div class="search-loading">${SUI.loading}</div>`;
    const mine = ++seq;
    timer = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}&locale=${uiLoc}`);
        const data = await r.json();
        if (mine === seq) render((data.hits || []) as Hit[]);
      } catch {
        if (mine === seq) results.innerHTML = `<div class="search-empty">${SUI.error}</div>`;
      }
    }, 220);
  };
  input.addEventListener('input', onInput);

  return () => {
    btn.removeEventListener('click', open);
    input.removeEventListener('input', onInput);
    document.removeEventListener('keydown', onKey);
  };
}


// ── Mega menyu drill-down (HSE üslubu) ──
function initMegaNav(): () => void {
  const megas = Array.from(document.querySelectorAll<HTMLElement>('.nav-mega'));
  const off: Array<() => void> = [];
  megas.forEach((m) => {
    const items = Array.from(m.querySelectorAll<HTMLElement>('.mg-item'));
    const panels = Array.from(m.querySelectorAll<HTMLElement>('.mega-panel'));
    if (!items.length) return;
    items.forEach((btn) => {
      const act = () => {
        const i = btn.getAttribute('data-mi');
        items.forEach((b) => b.classList.toggle('active', b === btn));
        panels.forEach((p) => p.classList.toggle('active', p.getAttribute('data-mp') === i));
      };
      const click = (e: Event) => { e.preventDefault(); act(); };
      btn.addEventListener('mouseenter', act);
      btn.addEventListener('focus', act);
      btn.addEventListener('click', click);
      off.push(() => { btn.removeEventListener('mouseenter', act); btn.removeEventListener('focus', act); btn.removeEventListener('click', click); });
    });
  });
  return () => off.forEach((f) => f());
}

export default function HomeClient({ news, menu, locale }: { news: NewsItem[]; menu: SiteMenu | null; locale: Locale }) {
  useEffect(() => {
    document.querySelectorAll('script[data-adda-home]').forEach((el) => el.remove());
    let cancelled = false;
    const injected: HTMLScriptElement[] = [];
    const loadNext = (i: number) => {
      if (cancelled) return;
      if (i >= SCRIPTS.length) {
        // Köhnə skriptlərin bəzisi window 'load'-da işə düşür (artıq baş verib) — sintetik dispatch.
        if (document.readyState === 'complete') window.dispatchEvent(new Event('load'));
        return;
      }
      const spec = SCRIPTS[i];
      const s = document.createElement('script');
      s.src = spec.src;
      if (spec.module) s.type = 'module';
      s.async = false;
      s.dataset.addaHome = '1';
      s.onload = () => loadNext(i + 1);
      s.onerror = () => loadNext(i + 1);
      document.body.appendChild(s);
      injected.push(s);
    };
    loadNext(0);
    return () => {
      cancelled = true;
      injected.forEach((el) => el.remove());
    };
  }, []);

  useEffect(initGlobe, []);
  useEffect(initNewsletter, []);
  useEffect(initSearch, []);
  useEffect(initMegaNav, []);

  const suretli = menu && menu.suretliKecidler.length ? menu.suretliKecidler : FALLBACK_MENU.suretliKecidler;
  const fcols = menu && menu.footerMenyusu.length ? menu.footerMenyusu : FALLBACK_MENU.footerMenyusu;
  const markup = translateStatic(MARKUP, locale)
    .replace('{{NEWS_CARDS}}', news.length ? buildNewsCards(news, locale) : FALLBACK_CARDS)
    .replace('{{FOOTER_COLS}}', buildFooterCols(fcols))
    .replace('{{QUICKNAV}}', buildQuicknav(suretli));
  return <div dangerouslySetInnerHTML={{ __html: markup }} />;
}

const MARKUP = `<div class="hero-wrap">

  <!-- ════ HERO — Komanda körpüsü (ultra-modern · akademik + dənizçilik) ════ -->
  <section class="hero" id="hero">
    <canvas id="fluidCanvas"></canvas>
    <div class="slices" id="slices"></div>
    <div class="hero-veil"></div>
    <div class="hero-chart" aria-hidden="true"></div>

    <div class="hero-content">
      <div class="hero-copy">
        <div class="gc-kicker gc-anim"><span class="k-dot"></span><span id="gcKicker">Azərbaycan Dövlət Dəniz Akademiyası</span></div>
        <h1 class="gc-anim" id="gcTitle">Gələcəyin <em>dənizçiliyi</em></h1>
        <p class="lead gc-anim" id="gcLead">Firuzəyi üfüqlərə açılan rəqəmsal təhsil. Beynəlxalq STCW standartları, canlı simulyasiya mühiti və qlobal karyera trayektoriyası.</p>
        <div class="cta-row gc-anim">
          <a href="#" class="btn-mag" id="btnMag">
            <span id="gcCta">Daxil ol</span>
            <span class="arr" id="magArr"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>
          </a>
          <a href="#" class="link-quiet">Qəbul — 2026</a>
        </div>
        <div class="hero-meta">
          <span class="hm-est">EST · 1881</span>
          <span class="hm-sep"></span>
          <span class="hm-coord">40.3653° N — 49.8407° E · Bakı</span>
        </div>
      </div>
    </div>

    <div class="hero-nums" id="heroNums">
      <button class="numb active" data-n="0">01<span class="pb"><i></i></span></button>
      <button class="numb" data-n="1">02<span class="pb"><i></i></span></button>
      <button class="numb" data-n="2">03<span class="pb"><i></i></span></button>
      <span class="nums-hint">hover → keçid</span>
    </div>

    <a href="#spotlight" class="scroll-ind" aria-label="Aşağı sürüşdür">
      <span>Aşağı</span>
      <div class="mouse"></div>
      <svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
    </a>

    <div class="hero-waves">
      <svg viewBox="0 0 1440 90" preserveAspectRatio="none">
        <g class="wlayer w3" fill="#90E0EF" opacity="0.45">
          <path d="M0,50 C180,80 360,20 720,42 C1080,64 1260,28 1440,50 L1440,90 L0,90 Z"/>
          <path d="M1440,50 C1620,80 1800,20 2160,42 C2520,64 2700,28 2880,50 L2880,90 L1440,90 Z"/>
        </g>
        <g class="wlayer w2" fill="#48CAE4" opacity="0.5">
          <path d="M0,58 C220,34 400,72 720,54 C1040,36 1220,72 1440,56 L1440,90 L0,90 Z"/>
          <path d="M1440,58 C1660,34 1840,72 2160,54 C2480,36 2660,72 2880,56 L2880,90 L1440,90 Z"/>
        </g>
        <g class="wlayer w1" fill="#FAFDFE">
          <path d="M0,66 C200,52 380,80 720,68 C1060,56 1240,82 1440,68 L1440,90 L0,90 Z"/>
          <path d="M1440,66 C1640,52 1820,80 2160,68 C2500,56 2680,82 2880,68 L2880,90 L1440,90 Z"/>
        </g>
      </svg>
    </div>
  </section>
</div>

<!-- ════ QUICKNAV — Sürətli keçidlər ════ -->
<nav class="quicknav" aria-label="Sürətli keçidlər">
  <div class="quicknav-inner">{{QUICKNAV}}</div>
</nav>

<!-- 2. SPOTLIGHT — Niyə məhz ADDA? (abituriyent + beynəlxalq tələbə dəyər təklifi) -->
<section class="spotlight" id="spotlight">
  <i class="ti ti-anchor spot-wm"></i>
  <div class="container">
    <div class="spot-rule"><h2>Niyə məhz ADDA?</h2></div>

    <div class="spot-head">
      <h3 class="spot-title serif">Dənizə gedən yol <em>buradan</em> başlayır</h3>
      <p class="spot-lead">Xəzərin sahilində, 1881-ci ilə uzanan dənizçilik təhsili ənənəsi üzərində qurulmuş akademiya — beynəlxalq standartlar, real dəniz təcrübəsi və qlobal karyera perspektivi bir ünvanda.</p>
    </div>

    <div class="why-grid">
      <div class="why-card">
        <span class="wc-ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="8" x2="12" y2="21"/><path d="M5 12H3a9 9 0 0 0 18 0h-2"/></svg></span>
        <b>1881-dən gələn ənənə</b>
        <p>Xəzər regionunda dənizçilik təhsilinin ən dərin köklərinə sahib məktəb — nəsillərin təcrübəsi bugünkü tədrisdə yaşayır.</p>
      </div>
      <div class="why-card">
        <span class="wc-ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="6"/><path d="M9.5 14.5L8 22l4-2.5L16 22l-1.5-7.5"/><path d="M10 9l1.5 1.5L14.5 7.5"/></svg></span>
        <b>STCW standartlı hazırlıq</b>
        <p>Tədris proqramları IMO konvensiyalarının tələblərinə uyğun qurulub — biliklərin dünya donanmalarında keçərlidir.</p>
      </div>
      <div class="why-card">
        <span class="wc-ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/><line x1="12" y1="3" x2="12" y2="7"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="3" y1="12" x2="7" y2="12"/><line x1="17" y1="12" x2="21" y2="12"/><line x1="6" y1="6" x2="8.5" y2="8.5"/><line x1="15.5" y1="15.5" x2="18" y2="18"/><line x1="18" y1="6" x2="15.5" y2="8.5"/><line x1="8.5" y1="15.5" x2="6" y2="18"/></svg></span>
        <b>Tam missiya simulyatorları</b>
        <p>Körpü və maşın otağı simulyasiya mərkəzində dənizə çıxmazdan əvvəl yüzlərlə real ssenari yaşayırsan.</p>
      </div>
      <div class="why-card">
        <span class="wc-ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1"/><path d="M4 18l-1-5h18l-1 5"/><path d="M5 13V7h6l2 3h6v3"/><path d="M8 7V4h3v3"/></svg></span>
        <b>Dənizdə real təcrübə</b>
        <p>Aparıcı gəmiçilik şirkətləri ilə təcrübə proqramları — nəzəriyyə göyərtədə peşəyə çevrilir.</p>
      </div>
      <div class="why-card">
        <span class="wc-ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9z"/></svg></span>
        <b>Beynəlxalq tələbə dəstəyi</b>
        <p>İngilisdilli modullar, mübadilə proqramları, yataqxana və adaptasiya xidməti — for international students, from day one.</p>
      </div>
      <div class="why-card">
        <span class="wc-ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 17 9 11 13 15 21 7"/><polyline points="15 7 21 7 21 13"/></svg></span>
        <b>Karyera perspektivi</b>
        <p>Karyera mərkəzi məzunları qlobal əmək bazarına hazırlayır — dəniz peşəsi sərhəd tanımır.</p>
      </div>
    </div>

    <div class="spot-cta">
      <p class="spot-cta-note">Sən də ADDA ailəsinə qoşul:</p>
      <a href="#" class="btn-adm">Abituriyent qəbulu <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>
      <a href="#" class="btn-intl"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9z"/></svg> International Admissions</a>
    </div>
  </div>
</section>

<!-- 3. RƏQƏMLƏRLƏ ADDA — inkişaf etdirilmiş blok -->
<section class="statsec">
  <i class="ti ti-compass stat-wm"></i>
  <div class="container statsec-in">
    <div class="statsec-head">
      <div class="stx-eyebrow">Rəqəmlərlə ADDA</div>
      <h3 class="stx-title">Fəaliyyətimiz — <em>rəqəmlərin</em> dilində</h3>
      <p class="stx-lead">Ənənə, beynəlxalq standart və real nəticə: akademiyanın bugünkü potensialını ən yaxşı rəqəmlər danışır.</p>
    </div>
    <div class="statsec-grid">
      <div class="stx">
        <div class="num" data-target="12000"><span>0</span><span class="plus">+</span></div>
        <div class="label">Məzun</div>
        <p class="stx-desc">Dünya donanmalarında xidmət edən peşəkar dənizçilər nəsli.</p>
      </div>
      <div class="stx">
        <div class="num" data-target="8000"><span>0</span><span class="plus">+</span></div>
        <div class="label">Beynəlxalq sertifikat</div>
        <p class="stx-desc">STCW tələblərinə uyğun verilmiş peşə sənədləri.</p>
      </div>
      <div class="stx">
        <div class="num" data-target="15"><span>0</span><span class="plus">+</span></div>
        <div class="label">Tam missiya simulyatoru</div>
        <p class="stx-desc">Körpü və maşın otağı üzrə real təlim ssenariləri.</p>
      </div>
      <div class="stx">
        <div class="num" data-target="47"><span>0</span><span class="plus">+</span></div>
        <div class="label">Beynəlxalq tərəfdaş</div>
        <p class="stx-desc">Universitetlər və aparıcı gəmiçilik şirkətləri ilə əməkdaşlıq.</p>
      </div>
      <div class="stx">
        <div class="num" data-target="25"><span>0</span><span class="plus">+</span></div>
        <div class="label">İxtisas proqramı</div>
        <p class="stx-desc">Bakalavriat və magistratura pillələri üzrə seçim.</p>
      </div>
      <div class="stx">
        <div class="num" data-target="100"><span>0</span><span class="pct">%</span></div>
        <div class="label">İşlə təminat statusu</div>
        <p class="stx-desc">Son buraxılış məzunlarının məşğulluq göstəricisi.</p>
      </div>
    </div>
    <p class="stx-note">Göstəricilər 2025/2026 tədris ili üzrə yenilənir; rəsmi hesabatlarla təsdiqlənən dəyərlər dərcdən əvvəl dəqiqləşdirilir.</p>
  </div>
</section>

<!-- 4. GÜNDƏM — Xəbərlər (mozaika) · Elanlar · Tədbirlər -->
<section class="newsx" id="xeberler">
  <div class="container">

    <div class="nx-head">
      <div class="nx-head-l">
        <div class="nx-eyebrow">İnformasiya mərkəzi</div>
        <h2 class="nx-title">Xəbərlər, elanlar <em>və tədbirlər</em></h2>
      </div>
      <div class="nx-actions">
        <a href="#" class="nx-btn">Bütün xəbərlər <i class="ti ti-arrow-right"></i></a>
        <a href="#" class="nx-btn nx-btn--ghost">Elan və tədbirlər <i class="ti ti-arrow-right"></i></a>
      </div>
    </div>

    <div class="nx-grid">
      <div class="nx-news">
{{NEWS_CARDS}}
      </div>

      <aside class="nx-rail">
        <div class="nx-sub"><i class="ti ti-speakerphone"></i> Elanlar</div>
        <a href="#" class="elx">
          <img class="elx-thumb" src="https://images.unsplash.com/photo-1724597500306-a4cbb7d1324e?fm=jpg&q=75&w=800&h=380&fit=crop" alt="Yay imtahan sessiyası" loading="lazy">
          <span class="elx-row"><span class="elx-chip">Akademik</span><span class="elx-date">09 İyun</span></span>
          <span class="elx-title">Yay imtahan sessiyasının cədvəli dərc olundu</span>
        </a>
        <a href="#" class="elx">
          <span class="elx-row"><span class="elx-chip">Sertifikat</span><span class="elx-date">05 İyun</span></span>
          <span class="elx-title">STCW təzələmə kurslarına sənəd qəbulu davam edir</span>
        </a>
        <a href="#" class="elx">
          <span class="elx-row"><span class="elx-chip">Tələbə</span><span class="elx-date">02 İyun</span></span>
          <span class="elx-title">Yataqxana yerləşdirilməsi üçün elektron müraciət açıldı</span>
        </a>
      </aside>
    </div>

    <div class="nx-sub nx-sub--ev"><i class="ti ti-calendar-event"></i> Tədbirlər</div>
    <div class="nx-events">
      <a href="#" class="evx">
        <span class="evx-date"><b>14</b><span>İyn</span></span>
        <span class="evx-body">
          <span class="evx-chip">Abituriyent</span>
          <span class="evx-title">Açıq qapı günü</span>
          <span class="evx-meta"><i class="ti ti-map-pin"></i> Əsas korpus</span>
          <span class="evx-meta"><i class="ti ti-clock"></i> 11:00</span>
        </span>
      </a>
      <a href="#" class="evx">
        <span class="evx-date"><b>18</b><span>İyn</span></span>
        <span class="evx-body">
          <span class="evx-chip">Karyera</span>
          <span class="evx-title">"Dəniz peşələri" karyera sərgisi</span>
          <span class="evx-meta"><i class="ti ti-map-pin"></i> Akt zalı</span>
          <span class="evx-meta"><i class="ti ti-clock"></i> 14:00</span>
        </span>
      </a>
      <a href="#" class="evx">
        <span class="evx-date"><b>21</b><span>İyn</span></span>
        <span class="evx-body">
          <span class="evx-chip">Elm</span>
          <span class="evx-title">IAMU regional seminarı</span>
          <span class="evx-meta"><i class="ti ti-map-pin"></i> Konfrans zalı</span>
          <span class="evx-meta"><i class="ti ti-clock"></i> 10:00</span>
        </span>
      </a>
      <a href="#" class="evx">
        <span class="evx-date"><b>25</b><span>İyn</span></span>
        <span class="evx-body">
          <span class="evx-chip">Təlim</span>
          <span class="evx-title">STCW yanğınla mübarizə təlimi</span>
          <span class="evx-meta"><i class="ti ti-map-pin"></i> Təlim poliqonu</span>
          <span class="evx-meta"><i class="ti ti-clock"></i> 09:00</span>
        </span>
      </a>
      <a href="#" class="evx">
        <span class="evx-date"><b>28</b><span>İyn</span></span>
        <span class="evx-body">
          <span class="evx-chip">İcma</span>
          <span class="evx-title">Məzunlarla görüş axşamı</span>
          <span class="evx-meta"><i class="ti ti-map-pin"></i> Akademiya həyəti</span>
          <span class="evx-meta"><i class="ti ti-clock"></i> 17:00</span>
        </span>
      </a>
    </div>

  </div>
</section>

<!-- 5. ADDA-DA YAŞAM — kampus həyatı (bento · 2031 horizontu) -->
<section class="campusx" id="kampus">
  <div class="container">
    <div class="cl-grid">

      <div class="cl-intro">
        <div class="cl-eyebrow">Kampus həyatı</div>
        <h2 class="cl-title">Təhsildən kənarda da <em>yaşam</em> buradadır</h2>
        <p class="cl-lead">Dərs cədvəli bitəndə ADDA bitmir. Dəniz klubundan innovasiya məkanına, idman liqalarından festival səhnəsinə — burada bacarıq, dostluq və maraqların üçün ayrıca bir ekosistem var.</p>
        <div class="cl-cta">
          <a href="#" class="cl-btn">Kampus turuna qoşul <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>
          <a href="#" class="cl-btn cl-btn--ghost"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9z"/><line x1="3" y1="12" x2="21" y2="12"/></svg> 360° virtual tur</a>
        </div>
      </div>

      <a href="#" class="cl-card cl-photo cl-feat" style="background-image:url('https://images.unsplash.com/photo-1724597500306-a4cbb7d1324e?fm=jpg&q=80&w=1600&auto=format&fit=crop')">
        <span class="cl-ov"></span>
        <span class="cl-tx">
          <span class="cl-chip">İdman · Dəniz</span>
          <b class="cl-name">Dəniz klubu</b>
          <span class="cl-note">Yelkən, avarçəkmə və sualtı üzgüçülük — Xəzər sənin məşq meydanındır.</span>
        </span>
      </a>

      <a href="#" class="cl-card cl-photo cl-sport" style="background-image:url('https://images.unsplash.com/photo-1641467613990-b74163e280e3?fm=jpg&q=80&w=1200&h=980&fit=crop')">
        <span class="cl-ov"></span>
        <span class="cl-tx">
          <span class="cl-chip">İdman</span>
          <b class="cl-name">İdman kompleksi</b>
          <span class="cl-note">Hovuz, döyüş idmanları, fitness və tələbə liqaları.</span>
        </span>
      </a>

      <div class="cl-card cl-clubs">
        <div class="cl-clubs-head">
          <span class="cl-chip cl-chip--gold">İcma</span>
          <span class="cl-stat">30+ klub</span>
        </div>
        <b class="cl-name cl-name--ink">Klublar və dərnəklər</b>
        <div class="cl-ticker" aria-hidden="true">
          <div class="cl-track">
            <span>Media klubu</span><i></i><span>Robototexnika</span><i></i><span>Debat cəmiyyəti</span><i></i><span>Şahmat</span><i></i><span>Dəniz tarixi dərnəyi</span><i></i><span>Musiqi qrupu</span><i></i><span>Könüllülər hərəkatı</span><i></i><span>Foto-video studiya</span><i></i><span>Media klubu</span><i></i><span>Robototexnika</span><i></i><span>Debat cəmiyyəti</span><i></i><span>Şahmat</span><i></i><span>Dəniz tarixi dərnəyi</span><i></i><span>Musiqi qrupu</span><i></i><span>Könüllülər hərəkatı</span><i></i><span>Foto-video studiya</span><i></i>
          </div>
        </div>
      </div>

      <a href="#" class="cl-card cl-photo cl-living" style="background-image:url('https://images.unsplash.com/photo-1751779057940-43cc385452f7?fm=jpg&q=80&w=1200&auto=format&fit=crop')">
        <span class="cl-ov"></span>
        <span class="cl-tx">
          <span class="cl-chip">Yaşayış</span>
          <b class="cl-name">Kampusda yaşam</b>
          <span class="cl-note">Yataqxana, coworking guşələri və 24/7 oxu zonaları.</span>
        </span>
      </a>

      <div class="cl-card cl-innov">
        <span class="cl-chip cl-chip--future">2031 →</span>
        <b class="cl-name">İnnovasiya məkanı</b>
        <p class="cl-innov-p">Simulyasiya mərkəzinin açıq saatları, AI laboratoriyası və maker-space — ideyanı prototipə çevir.</p>
        <ul class="cl-il">
          <li>VR körpü sessiyaları</li>
          <li>AI &amp; data klinikaları</li>
          <li>3D emalatxana</li>
        </ul>
      </div>

      <div class="cl-card cl-mini cl-well">
        <span class="cl-mic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19.5 12.6L12 20l-7.5-7.4a5 5 0 1 1 7.5-6.6 5 5 0 1 1 7.5 6.6z"/></svg></span>
        <b class="cl-name cl-name--ink">Rifah və dəstək</b>
        <span class="cl-mini-p">Psixoloji xidmət, tibb məntəqəsi və mentorluq — özünü yaxşı hiss etməyin sistemi.</span>
      </div>

      <div class="cl-card cl-mini cl-events">
        <span class="cl-mic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="16" rx="2"/><line x1="16" y1="3" x2="16" y2="7"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="4" y1="11" x2="20" y2="11"/><path d="M8 15h2v2H8z"/></svg></span>
        <b class="cl-name cl-name--ink">Tədbir təqvimi</b>
        <span class="cl-mini-p">Dənizçi günü, festivallar, konsertlər və idman turnirləri — il boyu <b class="cl-b">200+ tədbir</b>.</span>
      </div>

      <div class="cl-card cl-mini cl-global">
        <span class="cl-mic"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9z"/></svg></span>
        <b class="cl-name cl-name--ink">Qlobal icma</b>
        <span class="cl-mini-p">Beynəlxalq tələbə klubu, dil tandemləri və mədəniyyət axşamları.</span>
      </div>

    </div>
  </div>
</section>

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

  
</section>

<!-- 7. ADDA SOSİAL ŞƏBƏKƏLƏRDƏ — scroll-x karusel (UGC divarı) -->
<section class="socialx" id="sosial">
  <div class="sx-space" id="sxSpace">
    <div class="sx-sticky">

      <div class="container sx-head">
        <div class="sx-head-l">
          <div class="sx-eyebrow">ADDA sosial şəbəkələrdə</div>
          <h2 class="sx-title">Kampusun nəbzi — <em>canlı yayımda</em></h2>
          <p class="sx-lead">Tələbələrimizin gözü ilə ADDA: dəniz klubundan yataqxana axşamlarına, simulyator sessiyalarından məzun gününə. İzlə, bəyən, sabah özün paylaş.</p>
        </div>
        <div class="sx-head-r">
          <div class="sx-follow">
            <a href="#" class="sx-fbtn" aria-label="Instagram"><i class="ti ti-brand-instagram"></i></a>
            <a href="#" class="sx-fbtn" aria-label="TikTok"><i class="ti ti-brand-tiktok"></i></a>
            <a href="#" class="sx-fbtn" aria-label="YouTube"><i class="ti ti-brand-youtube"></i></a>
            <a href="#" class="sx-fbtn" aria-label="Facebook"><i class="ti ti-brand-facebook"></i></a>
            <a href="#" class="sx-fbtn" aria-label="LinkedIn"><i class="ti ti-brand-linkedin"></i></a>
          </div>
          <div class="sx-tags"><span class="sx-tag">#ADDAlife</span><span class="sx-tag">#DənizçiOl</span><span class="sx-tag">#ADDA2026</span></div>
        </div>
      </div>

      <div class="sx-viewport" id="sxViewport" tabindex="0" aria-label="Sosial paylaşımlar karuseli — sürüşdür">
        <div class="sx-track" id="sxTrack">

          <a href="#" class="sx-card" style="background-image:url('https://images.unsplash.com/photo-1724597500306-a4cbb7d1324e?fm=jpg&q=78&w=700&h=960&fit=crop')">
            <span class="sx-ov"></span>
            <span class="sx-top"><span class="sx-chip"><i class="ti ti-brand-instagram"></i> @adda.official</span></span>
            <span class="sx-body">
              <span class="sx-cap">Dəniz klubunun yelkən məşqi — Xəzərdə ilk solo dövrə 🌊 <b>#ADDAlife</b></span>
              <span class="sx-meta"><span class="sx-mi"><i class="ti ti-heart"></i> 1,2K</span><span class="sx-mi"><i class="ti ti-message-circle"></i> 84</span></span>
            </span>
          </a>

          <a href="#" class="sx-card" style="background-image:url('https://images.unsplash.com/photo-1641467613990-b74163e280e3?fm=jpg&q=78&w=700&h=960&fit=crop&crop=entropy')">
            <span class="sx-ov"></span>
            <span class="sx-top"><span class="sx-chip"><i class="ti ti-brand-tiktok"></i> @adda.students</span></span>
            <span class="sx-play"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 21 12 6 21 6 3"/></svg></span>
            <span class="sx-body">
              <span class="sx-cap">POV: körpü simulyatorunda ilk gecə növbən ⚓ <b>#DənizçiOl</b></span>
              <span class="sx-meta"><span class="sx-mi"><i class="ti ti-heart"></i> 8,4K</span><span class="sx-mi"><i class="ti ti-share-3"></i> 612</span></span>
            </span>
          </a>

          <a href="#" class="sx-card" style="background-image:url('https://images.unsplash.com/photo-1751779057940-43cc385452f7?fm=jpg&q=78&w=700&h=960&fit=crop&crop=left')">
            <span class="sx-ov"></span>
            <span class="sx-top"><span class="sx-chip"><i class="ti ti-brand-instagram"></i> @adda.official</span></span>
            <span class="sx-body">
              <span class="sx-cap">Beynəlxalq tələbə axşamı: 12 ölkə, bir süfrə 🌍</span>
              <span class="sx-meta"><span class="sx-mi"><i class="ti ti-heart"></i> 976</span><span class="sx-mi"><i class="ti ti-message-circle"></i> 41</span></span>
            </span>
          </a>

          <a href="#" class="sx-card" style="background-image:url('https://images.unsplash.com/photo-1724597500306-a4cbb7d1324e?fm=jpg&q=78&w=700&h=960&fit=crop&crop=right')">
            <span class="sx-ov"></span>
            <span class="sx-top"><span class="sx-chip sx-chip--yt"><i class="ti ti-brand-youtube"></i> ADDA TV</span></span>
            <span class="sx-play sx-play--lg"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 21 12 6 21 6 3"/></svg></span>
            <span class="sx-dur">4:37</span>
            <span class="sx-body">
              <span class="sx-cap">Bir gün kursantla: səhər sırasından axşam kitabxanasına</span>
              <span class="sx-meta"><span class="sx-mi"><i class="ti ti-eye"></i> 23K baxış</span></span>
            </span>
          </a>

          <a href="#" class="sx-card" style="background-image:url('https://images.unsplash.com/photo-1641467613990-b74163e280e3?fm=jpg&q=78&w=700&h=960&fit=crop&crop=left')">
            <span class="sx-ov"></span>
            <span class="sx-top"><span class="sx-chip"><i class="ti ti-brand-facebook"></i> ADDA rəsmi</span></span>
            <span class="sx-body">
              <span class="sx-cap">Məzun günü 2026: 340 yeni zabit dənizə yola düşür 🎓</span>
              <span class="sx-meta"><span class="sx-mi"><i class="ti ti-heart"></i> 2,1K</span><span class="sx-mi"><i class="ti ti-share-3"></i> 388</span></span>
            </span>
          </a>

          <a href="#" class="sx-card" style="background-image:url('https://images.unsplash.com/photo-1751779057940-43cc385452f7?fm=jpg&q=78&w=700&h=960&fit=crop&crop=right')">
            <span class="sx-ov"></span>
            <span class="sx-top"><span class="sx-chip"><i class="ti ti-brand-linkedin"></i> ADDA Careers</span></span>
            <span class="sx-body">
              <span class="sx-cap">Karyera sərgisində 28 gəmiçilik şirkəti kursantlarımızla görüşdü</span>
              <span class="sx-meta"><span class="sx-mi"><i class="ti ti-thumb-up"></i> 540</span><span class="sx-mi"><i class="ti ti-message-circle"></i> 37</span></span>
            </span>
          </a>

          <a href="#" class="sx-card" style="background-image:url('https://images.unsplash.com/photo-1724597500306-a4cbb7d1324e?fm=jpg&q=78&w=700&h=960&fit=crop&crop=top')">
            <span class="sx-ov"></span>
            <span class="sx-top"><span class="sx-chip"><i class="ti ti-brand-instagram"></i> @adda.sport</span></span>
            <span class="sx-body">
              <span class="sx-cap">Fakültələrarası üzgüçülük finalı — rekord qırıldı 🏊 <b>#ADDA2026</b></span>
              <span class="sx-meta"><span class="sx-mi"><i class="ti ti-heart"></i> 1,7K</span><span class="sx-mi"><i class="ti ti-message-circle"></i> 96</span></span>
            </span>
          </a>

          <div class="sx-card sx-card--cta">
            <span class="sx-cta-t">Sən də <em>izlə</em> —<br>sabah bu kadrlarda ol</span>
            <span class="sx-cta-icons">
              <a href="#" aria-label="Instagram"><i class="ti ti-brand-instagram"></i></a>
              <a href="#" aria-label="TikTok"><i class="ti ti-brand-tiktok"></i></a>
              <a href="#" aria-label="YouTube"><i class="ti ti-brand-youtube"></i></a>
              <a href="#" aria-label="Facebook"><i class="ti ti-brand-facebook"></i></a>
              <a href="#" aria-label="LinkedIn"><i class="ti ti-brand-linkedin"></i></a>
            </span>
            <span class="sx-cta-tag">#ADDAlife</span>
          </div>

        </div>
      </div>

      <div class="sx-progress" aria-hidden="true"><i id="sxBar"></i></div>
    </div>
  </div>

  
</section>

<!-- 9. VİDEO SİTAT (Image 6 üslubu) -->
<section class="vquote" style="background-image:url('https://images.unsplash.com/photo-1724597500306-a4cbb7d1324e?fm=jpg&q=80&w=2000&auto=format&fit=crop')">
  <span class="vq-ov"></span>
  <div class="vq-in">
    <blockquote>"Dəniz insana üfüqün arxasında daha böyük bir dünyanın olduğunu öyrədir — biz o dünyaya gedən yolu öyrədirik."</blockquote>
    <div class="vq-attr">Azərbaycan Dövlət Dəniz Akademiyası · 1996</div>
    <a href="#" class="vq-play"><span class="c"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="margin-left:2px"><polygon points="6 3 21 12 6 21 6 3"/></svg></span> ADDA-nı yaşa</a>
  </div>
</section>

<!-- 8. Footer -->
<footer>
  <div class="container">

    <div class="ftx-news">
      <div class="ftx-news-text">
        <h3>Xəbərlərə abunə olun</h3>
        <p>Qəbul elanları, tədbirlər və akademiya yenilikləri — birbaşa e-poçtunuza.</p>
      </div>
      <form id="nlForm" class="ftx-form" novalidate>
        <label class="ftx-vh" for="nlEmail">E-poçt ünvanı</label>
        <input id="nlEmail" name="email" type="email" autocomplete="email" required placeholder="E-poçt ünvanınız">
        <button id="nlBtn" type="submit">Abunə ol <i class="ti ti-send" aria-hidden="true"></i></button>
      </form>
      <p id="nlMsg" class="ftx-msg" role="status" aria-live="polite"></p>
    </div>

    <div class="ftx-grid">
      <div class="foot-brand">
        <a href="#" class="brand">
          <div class="brand-emblem"><img src="/home/emblem.webp" alt="ADDA logo"></div>
          <div class="brand-divider" style="background:rgba(255,255,255,0.18)"></div>
          <div class="brand-text"><span class="b-name" style="color:#fff">ADDA</span><span class="b-full" style="color:rgba(255,255,255,0.5)">Azərbaycan Dövlət Dəniz Akademiyası</span></div>
        </a>
        <div class="foot-contact">
          <a href="#"><i class="ti ti-map-pin"></i> Bakı şəhəri, AZ1000, Azərbaycan</a>
          <a href="tel:+994124043340"><i class="ti ti-phone"></i> +994 12 404 33 40</a>
          <a href="mailto:info@adda.edu.az"><i class="ti ti-mail"></i> info@adda.edu.az</a>
        </div>
        <div class="ftx-social" aria-label="Sosial şəbəkələr">
          <a href="#" aria-label="Facebook"><i class="ti ti-brand-facebook"></i></a>
          <a href="#" aria-label="Instagram"><i class="ti ti-brand-instagram"></i></a>
          <a href="#" aria-label="LinkedIn"><i class="ti ti-brand-linkedin"></i></a>
          <a href="#" aria-label="YouTube"><i class="ti ti-brand-youtube"></i></a>
        </div>
      </div>
      <nav class="ftx-cols" aria-label="Sayt bölmələri">
        {{FOOTER_COLS}}
      </nav>
    </div>

    <div class="ftx-orgs">
      <span class="ftx-orgs-label">Rəsmi qurumlar</span>
      <ul class="ftx-org-list">
        <li><a href="https://mincom.gov.az" target="_blank" rel="noopener noreferrer"><span class="fo-mark">RİNN</span><span class="fo-name">Rəqəmsal İnkişaf və<br>Nəqliyyat Nazirliyi</span></a></li>
        <li><a href="https://edu.gov.az" target="_blank" rel="noopener noreferrer"><span class="fo-mark">ETN</span><span class="fo-name">Elm və Təhsil<br>Nazirliyi</span></a></li>
        <li><a href="https://ddla.gov.az" target="_blank" rel="noopener noreferrer"><span class="fo-mark">DDLA</span><span class="fo-name">Dövlət Dəniz və<br>Liman Agentliyi</span></a></li>
        <li><a href="https://azcon.gov.az" target="_blank" rel="noopener noreferrer"><span class="fo-mark">AZCON</span><span class="fo-name">Nəqliyyat və Kommunikasiya<br>Holdinqi</span></a></li>
        <li><a href="https://asco.az" target="_blank" rel="noopener noreferrer"><span class="fo-mark">ASCO</span><span class="fo-name">Azərbaycan Xəzər Dəniz<br>Gəmiçiliyi QSC</span></a></li>
      </ul>
    </div>

    <div class="ftx-bottom">
      <p>© 2026 Azərbaycan Dövlət Dəniz Akademiyası. Bütün hüquqlar qorunur.</p>
      <ul class="ftx-legal">
        <li><a href="#">Məxfilik siyasəti</a></li>
        <li><a href="#">İstifadə şərtləri</a></li>
        <li><a href="#">Korporativ stil</a></li>
        <li><a href="#">Rektorla əlaqə</a></li>
      </ul>
    </div>

  </div>
</footer>`;