'use client';

import { useEffect } from 'react';
import createGlobe, { type Marker } from 'cobe';
import type { NewsItem, SiteMenu, MenuFooterCol } from '@/lib/strapi';
import { translateStatic, tr, type Locale } from '@/lib/i18n';
import { FALLBACK_MENU } from '@/lib/menu-fallback';

// Bridge (Merhele 0): orijinal statik HTML render + qalan vanilla JS inject.
// Qlobus artiq bundle-dan (cobe npm) isleyir - CDN/modul yukleme asililigi yoxdur.
const SCRIPTS: { src: string; module?: boolean }[] = [
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
function buildFooterCols(cols: MenuFooterCol[], locale: Locale): string {
  return cols
    .map((col) => {
      const links = (col.links ?? []).map((l) => `<a href="${escM(l.url || '#')}">${escM(tr(l.label, locale))}</a>`).join('');
      return `<div class="foot-col"><h4>${escM(tr(col.title, locale))}</h4>${links}</div>`;
    })
    .join('\n        ');
}


// ── Axtarış (Meilisearch, /api/search) ──
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

  const fcols = menu && menu.footerMenyusu.length ? menu.footerMenyusu : FALLBACK_MENU.footerMenyusu;
  const markup = translateStatic(MARKUP, locale)
    .replace('{{NEWS_CARDS}}', news.length ? buildNewsCards(news, locale) : FALLBACK_CARDS)
    .replace('{{FOOTER_COLS}}', buildFooterCols(fcols, locale));
  return <div dangerouslySetInnerHTML={{ __html: markup }} />;
}

const MARKUP = `<!-- 3. RƏQƏMLƏRLƏ ADDA — inkişaf etdirilmiş blok -->
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
