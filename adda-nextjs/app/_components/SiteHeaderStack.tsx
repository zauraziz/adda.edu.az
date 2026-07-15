// ── Header 1a (server component) ──────────────────────────────────────
// MARKUP string-inin header hissəsinin (gov banner + utility + search modal +
// <header id="siteHeader">) real JSX qarşılığı. buildMainNav/buildUstMenu/
// buildInfofor/buildEacad*/buildLangSwitch → JSX. Bütün class/id/data-*/aria/SVG
// eyni saxlanılır ki, ui.js + initSearch + initMegaNav dəyişmədən işləsin.
import type {
  SiteMenu, MenuCategory, MenuLink, MenuPortal, MenuPortalCard,
} from '@/lib/strapi';
import { tr, type Locale } from '@/lib/i18n';
import { FALLBACK_MENU, FALLBACK_EACAD } from '@/lib/menu-fallback';
import { SEARCH_UI } from '@/lib/search-ui';
import HeaderIsland from './HeaderIsland';

// ── Paylaşılan SVG-lər (orijinal markup ilə eyni) ──
const MegaChevH = () => (
  <svg className="mega-chev" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
);
const MgArrow = () => (
  <svg className="mgc" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18" /></svg>
);
const UmChev = () => (
  <svg className="um-chev" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
);

const UST_ICONS: Record<string, string> = {
  'ADDA Məzunları': 'users', 'Məzunlar': 'users', 'Karyera': 'briefcase',
  'Kollec': 'building-bank', 'FAQ': 'help-circle', 'Əlaqə': 'mail',
};
const MEGA_CTA: Record<Locale, { eyebrow: string; btn: string; tx: string }> = {
  az: { eyebrow: 'Bölmə', btn: 'Bölməyə keç', tx: 'Bu bölmənin bütün səhifələri, xidmətləri və sənədləri.' },
  ru: { eyebrow: 'Раздел', btn: 'Перейти в раздел', tx: 'Все страницы, сервисы и документы этого раздела.' },
  en: { eyebrow: 'Section', btn: 'Open section', tx: 'All pages, services and documents of this section.' },
};

const byOrder = (a: MenuCategory, b: MenuCategory) => (a.order ?? 0) - (b.order ?? 0);

// ── Gov Banner ──
function GovBanner({ locale }: { locale: Locale }) {
  return (
    <div className="gov-banner">
      <div className="gov-banner-inner">
        <i className="ti ti-shield-check" />
        <p>{tr('Azərbaycan Dövlət Dəniz Akademiyasının rəsmi internet portalı. Portal dövlət informasiya resurslarına dair müəyyən edilmiş tələblərə uyğun olaraq fəaliyyət göstərir.', locale)}</p>
      </div>
    </div>
  );
}

// ── Utility left ( üst menyu) ──
function UtilityLeft({ cats, locale }: { cats: MenuCategory[]; locale: Locale }) {
  return (
    <>
      {cats.slice().sort(byOrder).map((c, i) => {
        const icon = <i className={`ti ti-${UST_ICONS[c.label] || 'point'}`} />;
        const groups = c.groups ?? [];
        if (!groups.length) {
          return (
            <a key={`ul-${i}`} href={c.url || '#'}>{icon}{' '}{tr(c.label, locale)}</a>
          );
        }
        return (
          <div className="util-item" key={`ul-${i}`}>
            <a href={c.url || '#'}>{icon}{' '}{tr(c.label, locale)}{' '}<UmChev /></a>
            <div className="util-menu">
              {groups.map((g, gi) => (
                <div className="um-g" key={`ug-${gi}`}>
                  <span className="um-h">{tr(g.title, locale)}</span>
                  {(g.links ?? []).map((l, li) => (
                    <a key={`ugl-${li}`} href={l.url || '#'}>{tr(l.label, locale)}</a>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

// ── Infofor (istifadəçi qrupları) ──
function Infofor({ items, locale }: { items: MenuLink[]; locale: Locale }) {
  return (
    <>
      {items.map((l, i) => (
        <a key={`if-${i}`} href={l.url || '#'}>
          <span className="if-ic"><i className="ti ti-user" /></span>
          <span className="if-tx"><b>{tr(l.label, locale)}</b></span>
        </a>
      ))}
    </>
  );
}

// ── Dil dəyişdirici ──
function LangSwitch({ locale }: { locale: Locale }) {
  const items: Array<[string, string]> = [['az', 'AZ'], ['en', 'EN'], ['ru', 'RU']];
  return (
    <>
      {items.map(([l, label]) => (
        <a key={l} href={`/${l}`} className={l === locale ? 'active' : undefined}>{label}</a>
      ))}
    </>
  );
}

// ── Əsas naviqasiya (mega drill-down) ──
function MainNav({ cats, locale }: { cats: MenuCategory[]; locale: Locale }) {
  const cta = MEGA_CTA[locale];
  return (
    <>
      {cats.slice().sort(byOrder).map((c, i) => {
        const active = i === 0;
        const groups = c.groups ?? [];
        if (!groups.length) {
          return (
            <div className="nav-item" key={`nv-${i}`}>
              <a href={c.url || '#'} className={active ? 'active' : undefined}>{tr(c.label, locale)}</a>
            </div>
          );
        }
        return (
          <div className="nav-item nav-mega" key={`nv-${i}`}>
            <a href={c.url || '#'} className={active ? 'active' : undefined}>{tr(c.label, locale)}{' '}<MegaChevH /></a>
            <div className="mega">
              <div className="mega-wrap">
                <nav className="mega-groups" aria-label={tr(c.label, locale)}>
                  {groups.map((g, gi) => (
                    <button type="button" className={`mg-item${gi === 0 ? ' active' : ''}`} data-mi={gi} key={`mi-${gi}`}>
                      <span>{tr(g.title, locale)}</span><MgArrow />
                    </button>
                  ))}
                </nav>
                <div className="mega-panels">
                  {groups.map((g, gi) => (
                    <div className={`mega-panel${gi === 0 ? ' active' : ''}`} data-mp={gi} key={`mp-${gi}`}>
                      <div className="mp-title">{tr(g.title, locale)}</div>
                      <div className="mp-links">
                        {(g.links ?? []).map((l, li) => (
                          <a key={`mpl-${li}`} href={l.url || '#'}>{tr(l.label, locale)}</a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <aside className="mega-cta">
                  <div className="mc-card">
                    <span className="mc-eyebrow">{cta.eyebrow}</span>
                    <span className="mc-name">{tr(c.label, locale)}</span>
                    <a className="mc-btn" href={c.url || '#'}>{cta.btn}{' '}<span aria-hidden="true">→</span></a>
                    <p className="mc-tx">{cta.tx}</p>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

// ── E-Akademiya mega ──
function EacadMega({ eacad, locale }: { eacad: MenuPortal; locale: Locale }) {
  const cards: MenuPortalCard[] = eacad.cards ?? [];
  return (
    <div className="nav-item eacad">
      <a href="#" className="nav-portal">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
        {tr('E-Akademiya', locale)}
        <svg className="ea-chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
      </a>
      <div className="eacad-menu">
        <div className="eacad-head">
          <span className="eacad-title">{tr(eacad.title || 'E-Akademiya', locale)}</span>
          <span className="eacad-sub">{tr(eacad.subtitle || '', locale)}</span>
        </div>
        <div className="eacad-grid">
          {cards.map((c, i) => (
            <a key={`ea-${i}`} href={c.url || '#'} className="eacad-card">
              <span className="ea-ic"><i className={`ti ti-${c.icon || 'circle'}`} /></span>
              <span className="ea-tx"><b>{tr(c.label, locale)}</b><small>{tr(c.description || '', locale)}</small></span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Ana Header stack ──
export default function SiteHeaderStack({ menu, locale }: { menu: SiteMenu | null; locale: Locale }) {
  const esas = menu && menu.esasMenyu.length ? menu.esasMenyu : FALLBACK_MENU.esasMenyu;
  const ust = menu && menu.ustMenyu.length ? menu.ustMenyu : FALLBACK_MENU.ustMenyu;
  const eacad = (menu && menu.eAkademiya) || FALLBACK_EACAD;
  const qruplar = menu && menu.istifadeciQruplari.length ? menu.istifadeciQruplari : FALLBACK_MENU.istifadeciQruplari;

  return (
    <>
      {/* Gov Banner */}
      <GovBanner locale={locale} />

      {/* Utility */}
      <div className="utility">
        <div className="utility-inner">
          <div className="utility-left"><UtilityLeft cats={ust} locale={locale} /></div>
          <div className="utility-right">
            <div className="infofor" id="infofor">
              <button className="infofor-btn" id="infoforBtn" aria-expanded={false}>
                <svg className="lead-ic" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /><path d="M21 21v-2a4 4 0 0 0-3-3.87" /></svg>
                {tr('Bunlar üçün', locale)}
                <svg className="chev" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              <div className="infofor-menu"><Infofor items={qruplar} locale={locale} /></div>
            </div>
            <div className="lang-group"><LangSwitch locale={locale} /></div>
            <button className="util-icon" data-search-open="" aria-label="Axtarış"><i className="ti ti-search" /></button>
            <button className="util-icon" id="contrastBtn" aria-label="Kontrast"><i className="ti ti-contrast" /></button>
            <button className="util-icon" id="fontUpBtn" aria-label="Şrift böyüt"><i className="ti ti-text-plus" /></button>
            <button className="util-icon" id="fontDownBtn" aria-label="Şrift kiçilt"><i className="ti ti-text-minus" /></button>
          </div>
        </div>
      </div>

      {/* Search modal (statik markup — davranış initSearch-dən) */}
      <div className="search-modal" id="searchModal" aria-hidden="true">
        <div className="search-backdrop" data-search-close="" />
        <div className="search-box" role="dialog" aria-label="Axtarış">
          <div className="search-field">
            <i className="ti ti-search" />
            <input type="text" id="searchInput" placeholder={SEARCH_UI[locale].ph} autoComplete="off" spellCheck={false} />
            <button className="search-close" data-search-close="" aria-label="Bağla"><i className="ti ti-x" /></button>
          </div>
          <div className="search-results" id="searchResults" />
        </div>
      </div>

      {/* Header (hero-wrap-dan kənara çıxarıldı — position:relative/fixed olduğu üçün vizual eyni) */}
      <header id="siteHeader">
        <div className="header-inner">
          <a href="#" className="brand">
            <div className="brand-emblem"><img src="/home/emblem.webp" alt="ADDA logo" /></div>
            <div className="brand-divider" />
            <div className="brand-text">
              <span className="b-name">ADDA</span>
              <span className="b-full">{tr('Azərbaycan Dövlət Dəniz Akademiyası', locale)}</span>
            </div>
          </a>
          <nav className="mainnav">
            <MainNav cats={esas} locale={locale} />
            <EacadMega eacad={eacad} locale={locale} />
          </nav>
          <button className="burger" aria-label="Menyu" aria-expanded={false}><i className="ti ti-menu-2" /></button>
        </div>
      </header>

      {/* Davranış: scrolled · şrift · kontrast · infofor · burger · meganav · axtarış */}
      <HeaderIsland locale={locale} />
    </>
  );
}
