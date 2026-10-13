// ── Hero (server component) ──────────────────────────────────────────
// JS kontraktları (HeroSlider/HeroFluid bunlara bağlanır):
//   #hero · #fluidCanvas · #slices · #gcKicker · #gcTitle · #gcLead · #gcCta
//   #btnMag · #magArr · #heroPause · .numb[data-n] · .gc-anim
// F5.50: slaydlar admindən («3. Sayt — Ana səhifə», lib/home.ts) — mətn,
// real foto və düymənin keçidi slaydla birgə dəyişir. İlk slaydın şəkli
// server-də #slices fonudur (JS-siz də görünür), ön yükləmə ilə.
import { preload } from 'react-dom';
import { tr, type Locale } from '@/lib/i18n';
import type { HeroSlide } from '@/lib/home';
import HeroSlider from './HeroSlider';
import HeroFluid from './HeroFluid';

export default function Hero({ slides, locale }: { slides: HeroSlide[]; locale: Locale }) {
  const first = slides[0];
  if (first?.img) preload(first.img, { as: 'image', fetchPriority: 'high' });
  return (
    <div className="hero-wrap">
      <section className="hero" id="hero" aria-roledescription={tr('slayder', locale)}>
        <canvas id="fluidCanvas" />
        <div className="slices" id="slices" style={first?.img ? { backgroundImage: `url('${first.img}')` } : undefined} />
        <div className="hero-veil" />
        <div className="hero-chart" aria-hidden="true" />

        <div className="hero-content">
          {/* Avtomatik keçiddə «off» (hər 5 san. oxunmasın), dayandırılanda HeroSlider «polite» edir */}
          <div className="hero-copy" aria-live="off">
            <div className="gc-kicker gc-anim" hidden={!first?.kicker}>
              <span className="k-dot" />
              <span id="gcKicker">{first?.kicker}</span>
            </div>
            {/* Başlıq lib/home.ts-də qaçırılıb, yalnız <em> saxlayır */}
            <h1 className="gc-anim" id="gcTitle" dangerouslySetInnerHTML={{ __html: first?.title ?? '' }} />
            <p className="lead gc-anim" id="gcLead" hidden={!first?.lead}>
              {first?.lead}
            </p>
            <div className="cta-row gc-anim">
              <a href={first?.href || '#'} className="btn-mag" id="btnMag" hidden={!first?.cta}>
                <span id="gcCta">{first?.cta}</span>
                <span className="arr" id="magArr">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                </span>
              </a>
              <a href={`/${locale}/sehife/kecid-ballari`} className="link-quiet">{tr('Keçid balları və yer sayı', locale)}</a>
            </div>
            <div className="hero-meta">
              <span className="hm-est">EST · 1996</span>
              <span className="hm-sep" />
              <span className="hm-coord">{tr('40.3653° N — 49.8407° E · Bakı', locale)}</span>
            </div>
          </div>
        </div>

        {slides.length > 1 ? (
          <div className="hero-nums" id="heroNums">
            {slides.map((s, i) => (
              <button
                type="button"
                className={'numb' + (i === 0 ? ' active' : '')}
                data-n={i}
                key={i}
                aria-label={`${tr('Slayd', locale)} ${i + 1}`}
                aria-current={i === 0 ? 'true' : undefined}
              >
                {String(i + 1).padStart(2, '0')}
                <span className="pb"><i /></span>
              </button>
            ))}
            <button type="button" className="hero-pause" id="heroPause" aria-pressed="false" aria-label={tr('Slaydları dayandır', locale)}>
              <i className="ti ti-player-pause" aria-hidden="true" />
            </button>
          </div>
        ) : null}

        <a href="#xeberler" className="scroll-ind" aria-label={tr('Aşağı sürüşdür', locale)}>
          <span>{tr('Aşağı', locale)}</span>
          <div className="mouse" />
          <svg className="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
        </a>

        <div className="hero-waves">
          <svg viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
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

      {/* Davranış: WebGL maye fon + jaluzi slayder + mətn keçidi + magnit düymə */}
      <HeroFluid />
      <HeroSlider slides={slides} labels={{ pause: tr('Slaydları dayandır', locale), play: tr('Slaydları davam etdir', locale) }} />
    </div>
  );
}
