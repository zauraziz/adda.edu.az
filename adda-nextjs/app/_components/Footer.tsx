// ── Faza 1 / Footer (server component) ───────────────────────────────
// Footer bölməsi. Əvvəl HomeClient MARKUP-ında idi — bu addımdan sonra
// HomeClient.tsx TAMAMİLƏ silindi və page.tsx yalnız server komponentlərdən
// ibarətdir.
//
// Köçürülənlər:
//   · {{FOOTER_COLS}} tokeni → CMS-driven <nav> (menu.footerMenyusu),
//     FALLBACK_MENU fallback-ı saxlanılıb (TT Konvensiya 4);
//   · buildFooterCols() → aşağıdakı JSX map-i;
//   · escM() → SİLİNDİ, ehtiyac qalmadı: JSX mətn və atributları avtomatik
//     escape edir (HTML string yığmadığımız üçün əl ilə escape lazım deyil);
//   · initNewsletter() → NewsletterIsland.tsx (mesajlar burada tərcümə olunur).
import { tr, type Locale } from '@/lib/i18n';
import type { SiteMenu } from '@/lib/strapi';
import { FALLBACK_MENU } from '@/lib/menu-fallback';
import NewsletterIsland, { type NewsletterMsgs } from './NewsletterIsland';

const SOCIALS: { name: string; icon: string }[] = [
  { name: 'Facebook', icon: 'ti-brand-facebook' },
  { name: 'Instagram', icon: 'ti-brand-instagram' },
  { name: 'LinkedIn', icon: 'ti-brand-linkedin' },
  { name: 'YouTube', icon: 'ti-brand-youtube' },
];

// Rəsmi qurumlar. mark = abbreviatura (⚠ Faza 12: rəsmi loqo SVG-ləri ilə əvəzlənməli).
// name iki sətirdir (<br> ilə) — hər sətir T-də ayrıca açardır.
const ORGS: { href: string; mark: string; l1: string; l2: string }[] = [
  { href: 'https://mincom.gov.az', mark: 'RİNN', l1: 'Rəqəmsal İnkişaf və', l2: 'Nəqliyyat Nazirliyi' },
  { href: 'https://edu.gov.az', mark: 'ETN', l1: 'Elm və Təhsil', l2: 'Nazirliyi' },
  { href: 'https://ddla.gov.az', mark: 'DDLA', l1: 'Dövlət Dəniz və', l2: 'Liman Agentliyi' },
  { href: 'https://azcon.gov.az', mark: 'AZCON', l1: 'Nəqliyyat və Kommunikasiya', l2: 'Holdinqi' },
  { href: 'https://asco.az', mark: 'ASCO', l1: 'Azərbaycan Xəzər Dəniz', l2: 'Gəmiçiliyi QSC' },
];

const LEGAL = ['Məxfilik siyasəti', 'İstifadə şərtləri', 'Korporativ stil', 'Rektorla əlaqə'];

export default function Footer({ menu, locale }: { menu: SiteMenu | null; locale: Locale }) {
  const fcols = menu && menu.footerMenyusu.length ? menu.footerMenyusu : FALLBACK_MENU.footerMenyusu;

  const msgs: NewsletterMsgs = {
    invalid: tr('Zəhmət olmasa düzgün e-poçt ünvanı daxil edin.', locale),
    sending: tr('Göndərilir…', locale),
    ok: tr('Təşəkkürlər! Abunəliyiniz qeydə alındı.', locale),
    fail: tr('Xəta baş verdi. Bir az sonra yenidən cəhd edin.', locale),
    net: tr('Şəbəkə xətası. Yenidən cəhd edin.', locale),
  };

  return (
    <footer>
      <div className="container">
        <div className="ftx-news">
          <div className="ftx-news-text">
            <h3>{tr('Xəbərlərə abunə olun', locale)}</h3>
            <p>{tr('Qəbul elanları, tədbirlər və akademiya yenilikləri — birbaşa e-poçtunuza.', locale)}</p>
          </div>
          <form id="nlForm" className="ftx-form" noValidate>
            <label className="ftx-vh" htmlFor="nlEmail">{tr('E-poçt ünvanı', locale)}</label>
            <input
              id="nlEmail"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder={tr('E-poçt ünvanınız', locale)}
            />
            <button id="nlBtn" type="submit">
              {tr('Abunə ol', locale) + ' '}
              <i className="ti ti-send" aria-hidden="true" />
            </button>
          </form>
          <p id="nlMsg" className="ftx-msg" role="status" aria-live="polite" />
        </div>

        <div className="ftx-grid">
          <div className="foot-brand">
            {/* Faza 2: href="#" → ana səhifə marşrutu */}
            <a href="#" className="brand">
              <div className="brand-emblem"><img src="/home/emblem.webp" alt={tr('ADDA logo', locale)} /></div>
              <div className="brand-divider" style={{ background: 'rgba(255,255,255,0.18)' }} />
              <div className="brand-text">
                <span className="b-name" style={{ color: '#fff' }}>ADDA</span>
                <span className="b-full" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {tr('Azərbaycan Dövlət Dəniz Akademiyası', locale)}
                </span>
              </div>
            </a>
            <div className="foot-contact">
              <a href="#"><i className="ti ti-map-pin" />{' ' + tr('Bakı şəhəri, AZ1000, Azərbaycan', locale)}</a>
              <a href="tel:+994124043340"><i className="ti ti-phone" />{' +994 12 404 33 40'}</a>
              <a href="mailto:info@adda.edu.az"><i className="ti ti-mail" />{' info@adda.edu.az'}</a>
            </div>
            <div className="ftx-social" aria-label={tr('Sosial şəbəkələr', locale)}>
              {SOCIALS.map((s) => (
                <a href="#" aria-label={s.name} key={s.name}><i className={`ti ${s.icon}`} /></a>
              ))}
            </div>
          </div>

          {/* CMS-driven: menu.footerMenyusu, Strapi əlçatmazsa FALLBACK_MENU */}
          <nav className="ftx-cols" aria-label={tr('Sayt bölmələri', locale)}>
            {fcols.map((col) => (
              <div className="foot-col" key={col.title}>
                <h4>{tr(col.title, locale)}</h4>
                {(col.links ?? []).map((l, i) => (
                  <a href={l.url || '#'} key={`${l.label}-${i}`}>{tr(l.label, locale)}</a>
                ))}
              </div>
            ))}
          </nav>
        </div>

        <div className="ftx-orgs">
          <span className="ftx-orgs-label">{tr('Rəsmi qurumlar', locale)}</span>
          <ul className="ftx-org-list">
            {ORGS.map((o) => (
              <li key={o.mark}>
                <a href={o.href} target="_blank" rel="noopener noreferrer">
                  <span className="fo-mark">{o.mark}</span>
                  <span className="fo-name">{tr(o.l1, locale)}<br />{tr(o.l2, locale)}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="ftx-bottom">
          <p>{tr('© 2026 Azərbaycan Dövlət Dəniz Akademiyası. Bütün hüquqlar qorunur.', locale)}</p>
          <ul className="ftx-legal">
            {LEGAL.map((x) => (
              // Faza 2: href="#" → real marşrutlar
              <li key={x}><a href="#">{tr(x, locale)}</a></li>
            ))}
          </ul>
        </div>
      </div>

      <NewsletterIsland msgs={msgs} />
    </footer>
  );
}
