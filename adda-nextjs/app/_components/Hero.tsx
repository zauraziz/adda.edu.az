// ── Faza 1 / Hero (server component) ─────────────────────────────────
// MARKUP string-inin hero hissəsinin JSX qarşılığı. Bütün class/id eyni:
// ui.js (fluid canvas · jaluzi slices · magnetic btn) həmin ID-lərə bağlanır:
//   #hero · #fluidCanvas · #slices · #gcKicker · #gcTitle · #gcLead · #gcCta
//   #btnMag · #magArr · .numb[data-n] · .gc-anim
// Mətn tr() (exact-match) ilə — alt-sətir mangling yoxdur.
import { tr, type Locale } from '@/lib/i18n';

export default function Hero({ locale }: { locale: Locale }) {
  return (
    <div className="hero-wrap">
      <section className="hero" id="hero">
        <canvas id="fluidCanvas" />
        <div className="slices" id="slices" />
        <div className="hero-veil" />
        <div className="hero-chart" aria-hidden="true" />

        <div className="hero-content">
          <div className="hero-copy">
            <div className="gc-kicker gc-anim">
              <span className="k-dot" />
              <span id="gcKicker">{tr('Azərbaycan Dövlət Dəniz Akademiyası', locale)}</span>
            </div>
            {/* Başlıq <em> saxlayır → tr() nəticəsi olduğu kimi yerləşdirilir */}
            <h1
              className="gc-anim"
              id="gcTitle"
              dangerouslySetInnerHTML={{ __html: tr('Gələcəyin <em>dənizçiliyi</em>', locale) }}
            />
            <p className="lead gc-anim" id="gcLead">
              {tr('Firuzəyi üfüqlərə açılan rəqəmsal təhsil. Beynəlxalq STCW standartları, canlı simulyasiya mühiti və qlobal karyera trayektoriyası.', locale)}
            </p>
            <div className="cta-row gc-anim">
              <a href="#" className="btn-mag" id="btnMag">
                <span id="gcCta">{tr('Daxil ol', locale)}</span>
                <span className="arr" id="magArr">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                </span>
              </a>
              <a href="#" className="link-quiet">{tr('Qəbul — 2026', locale)}</a>
            </div>
            <div className="hero-meta">
              <span className="hm-est">EST · 1881</span>
              <span className="hm-sep" />
              <span className="hm-coord">{tr('40.3653° N — 49.8407° E · Bakı', locale)}</span>
            </div>
          </div>
        </div>

        <div className="hero-nums" id="heroNums">
          <button className="numb active" data-n="0">01<span className="pb"><i /></span></button>
          <button className="numb" data-n="1">02<span className="pb"><i /></span></button>
          <button className="numb" data-n="2">03<span className="pb"><i /></span></button>
          <span className="nums-hint">{tr('hover → keçid', locale)}</span>
        </div>

        <a href="#spotlight" className="scroll-ind" aria-label={tr('Aşağı sürüşdür', locale)}>
          <span>{tr('Aşağı', locale)}</span>
          <div className="mouse" />
          <svg className="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
        </a>

        <div className="hero-waves">
          <svg viewBox="0 0 1440 90" preserveAspectRatio="none">
            <g className="wlayer w3" fill="#90E0EF" opacity="0.45">
              <path d="M0,50 C180,80 360,20 720,42 C1080,64 1260,28 1440,50 L1440,90 L0,90 Z" />
              <path d="M1440,50 C1620,80 1800,20 2160,42 C2520,64 2700,28 2880,50 L2880,90 L1440,90 Z" />
            </g>
            <g className="wlayer w2" fill="#48CAE4" opacity="0.5">
              <path d="M0,58 C220,34 400,72 720,54 C1040,36 1220,72 1440,56 L1440,90 L0,90 Z" />
              <path d="M1440,58 C1660,34 1840,72 2160,54 C2480,36 2660,72 2880,56 L2880,90 L1440,90 Z" />
            </g>
            <g className="wlayer w1" fill="#FAFDFE">
              <path d="M0,66 C200,52 380,80 720,68 C1060,56 1240,82 1440,68 L1440,90 L0,90 Z" />
              <path d="M1440,66 C1640,52 1820,80 2160,68 C2500,56 2680,82 2880,68 L2880,90 L1440,90 Z" />
            </g>
          </svg>
        </div>
      </section>
    </div>
  );
}
