'use client';

import { useEffect } from 'react';
import type { NewsItem, SiteMenu, MenuFooterCol } from '@/lib/strapi';
import { translateStatic, tr, type Locale } from '@/lib/i18n';
import { FALLBACK_MENU } from '@/lib/menu-fallback';

// Bridge (Merhele 0): orijinal statik HTML render + qalan vanilla JS inject.
// Qlobus Faza 1 / Intl-de app/_components/IntlGlobe.tsx-e kocdu (cobe dinamik import).
const SCRIPTS: { src: string; module?: boolean }[] = [
  { src: '/home/socialx.mjs', module: true },
];

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

  useEffect(initNewsletter, []);

  const fcols = menu && menu.footerMenyusu.length ? menu.footerMenyusu : FALLBACK_MENU.footerMenyusu;
  const markup = translateStatic(MARKUP, locale)
    .replace('{{FOOTER_COLS}}', buildFooterCols(fcols, locale));
  return <div dangerouslySetInnerHTML={{ __html: markup }} />;
}

const MARKUP = `<!-- 7. ADDA SOSİAL ŞƏBƏKƏLƏRDƏ — scroll-x karusel (UGC divarı) -->
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
