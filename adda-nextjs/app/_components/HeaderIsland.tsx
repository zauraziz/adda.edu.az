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
import { usePathname } from 'next/navigation';
import { navMatch } from '@/lib/nav-active';
import { SEARCH_UI, hitHref, searchPageHref, type SearchHit } from '@/lib/search-ui';
import type { Locale } from '@/lib/i18n';
import { A11Y_KEY, FS_STEPS, readA11y, type A11yState } from '@/lib/a11y';

/** Ekran oxuyucusu üçün elanlar (server-də tr() ilə). */
export interface A11yText {
  font: string;
  contrastOn: string;
  contrastOff: string;
  reset: string;
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export default function HeaderIsland({ locale, a11y }: { locale: Locale; a11y: A11yText }) {
  const pathname = usePathname();
  // ── #siteHeader.scrolled (scrollY > 120) ──
  useEffect(() => {
    const header = document.getElementById('siteHeader');
    if (!header) return;
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 120);
    onScroll(); // reload-da scroll mövqeyi bərpa olunanda da düzgün başlasın
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── A11y (F5.49): şrift ölçüsü (--fs-scale 90–130%) + yüksək kontrast ──
  // Vəziyyət <html data-fs / data-contrast>-dadır və localStorage-da qalır:
  // app/layout.tsx-dəki skript onu səhifə boyanmadan ƏVVƏL tətbiq edir, bu
  // ada isə düymələri idarə edir. Əvvəlki variant body-yə `filter` qoyurdu
  // (sabit başlıq və pəncərələr pozulurdu) və px şriftlər böyümürdü.
  useEffect(() => {
    const root = document.documentElement;
    const up = document.getElementById('fontUpBtn') as HTMLButtonElement | null;
    const down = document.getElementById('fontDownBtn') as HTMLButtonElement | null;
    const contrast = document.getElementById('contrastBtn') as HTMLButtonElement | null;
    const reset = document.getElementById('a11yResetBtn') as HTMLButtonElement | null;
    const status = document.getElementById('a11yStatus');
    let state: A11yState = readA11y(root);

    const render = () => {
      root.style.setProperty('--fs-scale', String(state.fs));
      if (state.fs === 1) root.removeAttribute('data-fs');
      else root.setAttribute('data-fs', String(state.fs));
      if (state.contrast) root.setAttribute('data-contrast', 'high');
      else root.removeAttribute('data-contrast');
      contrast?.setAttribute('aria-pressed', String(state.contrast));
      if (up) up.disabled = state.fs >= FS_STEPS[FS_STEPS.length - 1];
      if (down) down.disabled = state.fs <= FS_STEPS[0];
      const pct = `${Math.round(state.fs * 100)}%`;
      up?.setAttribute('data-pct', pct);
      down?.setAttribute('data-pct', pct);
    };
    const save = () => {
      try {
        if (state.fs === 1 && !state.contrast) localStorage.removeItem(A11Y_KEY);
        else localStorage.setItem(A11Y_KEY, JSON.stringify(state));
      } catch {
        // gizli rejim və s. — ayar yalnız bu səhifədə qalır
      }
    };
    const say = (text: string) => {
      if (status) status.textContent = text;
    };
    const step = (dir: 1 | -1) => {
      const i = FS_STEPS.indexOf(state.fs);
      const next = FS_STEPS[Math.min(FS_STEPS.length - 1, Math.max(0, (i < 0 ? FS_STEPS.indexOf(1) : i) + dir))];
      state = { ...state, fs: next };
      render();
      save();
      say(`${a11y.font}: ${Math.round(next * 100)}%`);
    };
    const onUp = () => step(1);
    const onDown = () => step(-1);
    const onContrast = () => {
      state = { ...state, contrast: !state.contrast };
      render();
      save();
      say(state.contrast ? a11y.contrastOn : a11y.contrastOff);
    };
    const onReset = () => {
      state = { fs: 1, contrast: false };
      render();
      save();
      say(a11y.reset);
      up?.focus();
    };
    render();
    up?.addEventListener('click', onUp);
    down?.addEventListener('click', onDown);
    contrast?.addEventListener('click', onContrast);
    reset?.addEventListener('click', onReset);
    return () => {
      up?.removeEventListener('click', onUp);
      down?.removeEventListener('click', onDown);
      contrast?.removeEventListener('click', onContrast);
      reset?.removeEventListener('click', onReset);
    };
  }, [a11y]);

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

  // ── F5.58: menyuda açıq səhifənin yeri (lib/nav-active.ts) ──
  // Bölmə vurğulanır, mega paneldə keçidin qrupu açıq və keçid seçilmiş olur.
  // Əvvəl SSR hər səhifədə birinci bölməni («Akademiya») vurğulayırdı.
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>('.mainnav > .nav-item'));
    const entries: { item: HTMLElement; link: HTMLAnchorElement; top: boolean }[] = [];
    items.forEach((item) => {
      item.querySelectorAll<HTMLAnchorElement>('.mp-links a').forEach((link) => entries.push({ item, link, top: false }));
      const top = item.querySelector<HTMLAnchorElement>(':scope > a');
      if (top) entries.push({ item, link: top, top: true });
    });
    items.forEach((it) => it.querySelector(':scope > a')?.classList.remove('active'));
    document.querySelectorAll('.mp-links a.is-current').forEach((a) => {
      a.classList.remove('is-current');
      a.removeAttribute('aria-current');
    });
    const m = navMatch(window.location.pathname, window.location.search, entries.map((e) => e.link.getAttribute('href') || ''));
    if (!m) return;
    const e = entries[m.index];
    e.item.querySelector(':scope > a')?.classList.add('active');
    if (e.top) return;
    const panel = e.link.closest('.mega-panel');
    const gi = panel?.getAttribute('data-mp');
    if (panel && gi != null) {
      e.item.querySelectorAll('.mg-item').forEach((b) => b.classList.toggle('active', b.getAttribute('data-mi') === gi));
      e.item.querySelectorAll('.mega-panel').forEach((pn) => pn.classList.toggle('active', pn === panel));
    }
    if (m.exact) {
      e.link.classList.add('is-current');
      e.link.setAttribute('aria-current', 'page');
    }
  }, [pathname]);

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

    // F5.58 — bütün məzmun: nəticənin `url`-i (əməkdaş, sənəd, auditoriya…), ru/en-də
    // az məzmununa «az» nişanı, altda tam nəticələr səhifəsi («Bütün nəticələr (N)»).
    const render = (hits: SearchHit[], total: number, q: string) => {
      if (!hits.length) { results.innerHTML = `<div class="search-empty">${esc(ui.empty)}</div>`; return; }
      const rows = hits
        // K20: netice artiq kliklenir. Marsrut yoxdursa (bilinmeyen tip)
        // element <a> deyil <span> kimi render olunur — sinmis link olmasin.
        .map((h) => {
          const link = hitHref(locale, h);
          const lang = h.lang && h.lang !== locale ? ` <em class="sh-lang">${esc(ui.azOnly)}</em>` : '';
          const inner = `<span class="sh-type">${esc(ui.types[h.contentType || ''] || '')}</span><span class="sh-main"><b>${esc(h.title || '')}${lang}</b>${h.excerpt ? `<small>${esc(h.excerpt)}</small>` : ''}</span><i class="ti ti-arrow-up-right"></i>`;
          return link
            ? `<a href="${esc(link.href)}" class="search-hit"${link.external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${inner}</a>`
            : `<span class="search-hit is-plain">${inner}</span>`;
        })
        .join('');
      const more = total > hits.length
        ? `<a class="search-all" href="${esc(searchPageHref(locale, q))}">${esc(ui.all)} (${total}) <i class="ti ti-arrow-right" aria-hidden="true"></i></a>`
        : '';
      results.innerHTML = rows + more;
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
          const data = (await r.json()) as { hits?: SearchHit[]; total?: number };
          if (mine === seq) render(data.hits || [], data.total ?? (data.hits || []).length, q);
        } catch {
          if (mine === seq) results.innerHTML = `<div class="search-empty">${esc(ui.error)}</div>`;
        }
      }, 220);
    };

    // Enter — tam nəticələr səhifəsi.
    const onEnter = (e: KeyboardEvent) => {
      const q = input.value.trim();
      if (e.key === 'Enter' && q.length >= 2) {
        e.preventDefault();
        window.location.href = searchPageHref(locale, q);
      }
    };

    btn.addEventListener('click', open);
    closers.forEach((el) => el.addEventListener('click', close));
    document.addEventListener('keydown', onKey);
    input.addEventListener('input', onInput);
    input.addEventListener('keydown', onEnter);
    return () => {
      clearTimeout(timer);
      btn.removeEventListener('click', open);
      closers.forEach((el) => el.removeEventListener('click', close));
      document.removeEventListener('keydown', onKey);
      input.removeEventListener('input', onInput);
      input.removeEventListener('keydown', onEnter);
    };
  }, [locale]);

  return null;
}
