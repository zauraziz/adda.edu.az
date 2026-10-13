// ── «Niyə məhz ADDA» (server component) — F5.50 ──────────────────────
// Əvvəlki iki blok — «Niyə məhz ADDA?» (spotlight, 6 iddia kartı) və
// «Rəqəmlərlə ADDA» (statsec, mənbəsiz sayğaclar) — BİR yığcam blokda:
// hər üstünlük öz sübutu ilə: rəqəm + başlıq + bir cümlə + mənbə səhifəsi
// (EHE/«Guide for Leaders»: iddia yalnız yoxlanan dəlillə). Kartlar admindən
// («3. Sayt — Ana səhifə» → «Niyə məhz ADDA» kartları), ehtiyat lib/home-fallback.ts.
import { tr, type Locale } from '@/lib/i18n';
import type { FactCard } from '@/lib/home';

function Card({ f }: { f: FactCard }) {
  const inner = (
    <>
      <span className="wx-num">
        <b>{f.value}</b>
        {f.unit ? <small>{f.unit}</small> : null}
      </span>
      <span className="wx-t">{f.title}</span>
      {f.desc ? <span className="wx-p">{f.desc}</span> : null}
      {f.href ? (
        <span className="wx-go" aria-hidden="true">
          <i className="ti ti-arrow-up-right" />
        </span>
      ) : null}
    </>
  );
  return f.href ? (
    <a className="wx-card" href={f.href}>
      {inner}
    </a>
  ) : (
    <div className="wx-card">{inner}</div>
  );
}

export default function WhyAdda({ facts, locale }: { facts: FactCard[]; locale: Locale }) {
  // «International Admissions» ingiliscədir — az səhifəsindən ingilis versiyasına aparır.
  const intlHref = (locale === 'az' ? '/en' : `/${locale}`) + '/bunlar-ucun/beynelxalq-telebeler';
  return (
    <section className="whyx" id="niye-adda" aria-labelledby="whyx-title">
      <i className="ti ti-compass whyx-wm" aria-hidden="true" />
      <div className="container whyx-in">
        <div className="wx-head">
          <div>
            <div className="wx-eyebrow">{tr('Niyə məhz ADDA?', locale)}</div>
            {/* <em> saxlayır → tam-sətir tr() nəticəsi olduğu kimi yerləşdirilir */}
            <h2
              id="whyx-title"
              className="wx-title"
              dangerouslySetInnerHTML={{ __html: tr('Dənizə gedən yol <em>buradan</em> başlayır', locale) }}
            />
          </div>
          <a className="wx-more" href={`/${locale}/sehife/adda-dunen-ve-bugun`}>
            {tr('Akademiya haqqında', locale) + ' '}
            <i className="ti ti-arrow-right" aria-hidden="true" />
          </a>
        </div>

        {facts.length ? (
          <ul className="wx-grid">
            {facts.map((f, i) => (
              <li key={i}>
                <Card f={f} />
              </li>
            ))}
          </ul>
        ) : null}

        <div className="wx-cta">
          <a href={`/${locale}/bunlar-ucun/abituriyentler`} className="btn-adm">
            {tr('Abituriyent qəbulu', locale) + ' '}
            <i className="ti ti-arrow-right" aria-hidden="true" />
          </a>
          <a href={intlHref} className="btn-intl" hrefLang={locale === 'az' ? 'en' : undefined}>
            <i className="ti ti-world" aria-hidden="true" />
            {' ' + tr('International Admissions', locale)}
          </a>
        </div>
      </div>
    </section>
  );
}
