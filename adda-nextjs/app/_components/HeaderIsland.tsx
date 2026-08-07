'use client';

// ── Faza 1b: header interaktivliyi ────────────────────────────────────
// Markup server-də (SiteHeaderStack) qalır — bu ada yalnız davranış qoşur:
// scrolled · şrift · kontrast · infofor · meganav · axtarış.
// Burger ARTIQ BURADA DEYİL — mobil çekməcə `MobileNav` komponentindədir
// (vəziyyət React-də, görünüş CSS-də; inline stil injeksiyası aradan qalxdı).
// ui.js/HomeClient variantından fərqi: tiplənmiş, bundle-da (ayrıca sorğu yox),
// hər effektdə tam cleanup (naviqasiyada listener yığılmır), locale props-dan
// gəlir (pathname parse YOX). Contract ID/selektorlar dəyişməyib.
import { useEffect } from 'react';
import { SEARCH_UI, searchHref } from '@/lib/search-ui';
import type { Locale } from '@/lib/i18n';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export default function HeaderIsland({ locale }: { locale: Locale }) {
  // ── #siteHeader.scrolled (scrollY > 120) ──
  useEffect(() => {
    const header = document.getElementById('siteHeader');
    if (!header) return;
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 120);
    onScroll(); // reload-da scroll mövqeyi bərpa olunanda da düzgün başlasın
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── A11y: şrift ölçüsü (--fs-scale 0.9–1.3) + kontrast ──
  useEffect(() => {
    const up = document.getElementById('fontUpBtn');
    const down = document.getElementById('fontDownBtn');
    const contrast = document.getElementById('contrastBtn');
    let scale = 1;
    const apply = (v: number) => {
      scale = Math.round(v * 10) / 10; // float artefaktının qarşısını alır
      document.documentElement.style.setProperty('--fs-scale', String(scale));
    };
    const onUp = () => apply(Math.min(1.3, scale + 0.1));
    const onDown = () => apply(Math.max(0.9, scale - 0.1));
    const onContrast = () => document.body.classList.toggle('high-contrast');
    up?.addEventListener('click', onUp);
    down?.addEventListener('click', onDown);
    contrast?.addEventListener('click', onContrast);
    return () => {
      up?.removeEventListener('click', onUp);
      down?.removeEventListener('click', onDown);
      contrast?.removeEventListener('click', onContrast);
    };
  }, []);

  // ── "Bunlar üçün" dropdown (.infofor.open) ──
  useEffect(() => {
    const wrap = document.getElementById('infofor');
    const btn = document.getElementById('infoforBtn');
    if (!wrap || !btn) return;
    const set = (open: boolean) => {
      wrap.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
    };
    const onBtn = (e: Event) => { e.stopPropagation(); set(!wrap.classList.contains('open')); };
    const onDoc = (e: MouseEvent) => { if (!wrap.contains(e.target as Node)) set(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') set(false); };
    btn.addEventListener('click', onBtn);
    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      btn.removeEventListener('click', onBtn);
      document.removeEventListener('click', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // ── Mega menyu drill-down: .mg-item[data-mi] → .mega-panel[data-mp] ──
  useEffect(() => {
    const off: Array<() => void> = [];
    document.querySelectorAll<HTMLElement>('.nav-mega').forEach((mega) => {
      const items = Array.from(mega.querySelectorAll<HTMLElement>('.mg-item'));
      const panels = Array.from(mega.querySelectorAll<HTMLElement>('.mega-panel'));
      if (!items.length) return;
      items.forEach((btn) => {
        const act = () => {
          const i = btn.getAttribute('data-mi');
          items.forEach((b) => b.classList.toggle('active', b === btn));
          panels.forEach((p) => p.classList.toggle('active', p.getAttribute('data-mp') === i));
        };
        const onClick = (e: Event) => { e.preventDefault(); act(); };
        btn.addEventListener('mouseenter', act);
        btn.addEventListener('focus', act);
        btn.addEventListener('click', onClick);
        off.push(() => {
          btn.removeEventListener('mouseenter', act);
          btn.removeEventListener('focus', act);
          btn.removeEventListener('click', onClick);
        });
      });
    });
    return () => off.forEach((f) => f());
  }, []);

  // ── Axtarış modalı (debounce 220ms; köhnəlmiş cavab seq ilə kəsilir) ──
  useEffect(() => {
    const btn = document.querySelector<HTMLElement>('[data-search-open]');
    const modal = document.getElementById('searchModal');
    const input = document.getElementById('searchInput') as HTMLInputElement | null;
    const results = document.getElementById('searchResults');
    if (!btn || !modal || !input || !results) return;
    const ui = SEARCH_UI[locale];

    const open = () => {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      setTimeout(() => input.focus(), 60);
    };
    const close = () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    const closers = Array.from(modal.querySelectorAll('[data-search-close]'));

    type Hit = { title?: string; excerpt?: string; contentType?: string; slug?: string };
    const render = (hits: Hit[]) => {
      if (!hits.length) { results.innerHTML = `<div class="search-empty">${esc(ui.empty)}</div>`; return; }
      results.innerHTML = hits
        // K20: netice artiq kliklenir. Marsrut yoxdursa (bilinmeyen tip)
        // element <a> deyil <span> kimi render olunur — sinmis link olmasin.
        .map((h) => {
          const href = searchHref(locale, h.contentType, h.slug);
          const inner = `<span class="sh-type">${esc(ui.types[h.contentType || ''] || '')}</span><span class="sh-main"><b>${esc(h.title || '')}</b>${h.excerpt ? `<small>${esc(h.excerpt)}</small>` : ''}</span><i class="ti ti-arrow-up-right"></i>`;
          return href
            ? `<a href="${esc(href)}" class="search-hit">${inner}</a>`
            : `<span class="search-hit is-plain">${inner}</span>`;
        })
        .join('');
    };

    let timer: ReturnType<typeof setTimeout>;
    let seq = 0;
    const onInput = () => {
      const q = input.value.trim();
      clearTimeout(timer);
      if (!q) { results.innerHTML = ''; return; }
      results.innerHTML = `<div class="search-loading">${esc(ui.loading)}</div>`;
      const mine = ++seq;
      timer = setTimeout(async () => {
        try {
          const r = await fetch(`/api/search?q=${encodeURIComponent(q)}&locale=${locale}`);
          const data = await r.json();
          if (mine === seq) render((data.hits || []) as Hit[]);
        } catch {
          if (mine === seq) results.innerHTML = `<div class="search-empty">${esc(ui.error)}</div>`;
        }
      }, 220);
    };

    btn.addEventListener('click', open);
    closers.forEach((el) => el.addEventListener('click', close));
    document.addEventListener('keydown', onKey);
    input.addEventListener('input', onInput);
    return () => {
      clearTimeout(timer);
      btn.removeEventListener('click', open);
      closers.forEach((el) => el.removeEventListener('click', close));
      document.removeEventListener('keydown', onKey);
      input.removeEventListener('input', onInput);
    };
  }, [locale]);

  return null;
}
