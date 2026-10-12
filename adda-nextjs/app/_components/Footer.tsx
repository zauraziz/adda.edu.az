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
import { menuHref } from '@/lib/menu-href';
import { getOrgBlock, getSocialBlock, mediaUrl, type SiteMenu, type SocialBlock } from '@/lib/strapi';
import { FALLBACK_MENU } from '@/lib/menu-fallback';
import { orgName, visibleOrgs } from '@/lib/org-fallback';
import NewsletterIsland, { type NewsletterMsgs } from './NewsletterIsland';
import PageOwnerNote from './PageOwnerNote';

// F5.49 — sosial şəbəkə keçidləri «3. Sayt — Sosial blok»-dan (əvvəl hamısı
// «#» idi). Ünvanı yazılmayan şəbəkə göstərilmir.
const SOCIALS: { name: string; icon: string; key: keyof SocialBlock }[] = [
  { name: 'Facebook', icon: 'ti-brand-facebook', key: 'facebookUrl' },
  { name: 'Instagram', icon: 'ti-brand-instagram', key: 'instagramUrl' },
  { name: 'LinkedIn', icon: 'ti-brand-linkedin', key: 'linkedinUrl' },
  { name: 'YouTube', icon: 'ti-brand-youtube', key: 'youtubeUrl' },
  { name: 'TikTok', icon: 'ti-brand-tiktok', key: 'tiktokUrl' },
];

// F5.49 — «Rəsmi qurumlar» admində idarə olunur («3. Sayt — Rəsmi qurumlar»:
// ad üç dildə, sayt, loqo, sıra, gizlətmə). Strapi əlçatmazdırsa —
// lib/org-fallback.ts. Loqo yoxdursa qısa ad nişan kimi görünür.

// F5.30c — "Rektorla əlaqə" ölü `#` keçidi idi, /rehberlik-ə bağlanmışdı.
// F5.36c — vətəndaş müraciəti formasına yönəlir, «Rektora müraciət»
// istiqaməti əvvəlcədən seçili (`?istiqamet=rektor`, bax
// vetendaslarin-muracieti/page.tsx APPEAL_DIRECTIONS). Qalan üçü hələ də
// Faza 2 yer tutucusudur, TOXUNULMUR.
const LEGAL: { label: string; href?: string }[] = [
  { label: 'Məxfilik siyasəti' },
  { label: 'İstifadə şərtləri' },
  { label: 'Korporativ stil' },
  { label: 'Rektorla əlaqə', href: '/vetendaslarin-muracieti?istiqamet=rektor' },
];

/**
 * F5.30a/c — sayt üzrə TƏK telefon mənbəyi. Köhnə `/sehife/elaqe` (Strapi
 * `page` qeydi, 4043700) və işlənməyən `lib/constants.ts` (493 59 27) fərqli
 * nömrələr göstərirdi — bura artıq canlıda olan, kod-dan gələn (DB-dən
 * asılı olmayan) nömrə əsas götürülüb. Zaur müəllim düzgün olduğunu
 * TƏSDİQLƏMƏLİDİR. `/elaqe` səhifəsi (F5.30a) EYNİ sabiti idxal edir ki,
 * iki yerdə YENİDƏN uyğunsuzluq yaranmasın.
 */
export const SITE_PHONE = { display: '+994 12 404 33 40', href: 'tel:+994124043340' };

export default async function Footer({ menu, locale }: { menu: SiteMenu | null; locale: Locale }) {
  const fcols = menu && menu.footerMenyusu.length ? menu.footerMenyusu : FALLBACK_MENU.footerMenyusu;
  const [orgItems, social] = await Promise.all([
    getOrgBlock(),
    getSocialBlock(locale).then((b) => b ?? (locale === 'az' ? null : getSocialBlock('az'))),
  ]);
  const orgs = visibleOrgs(orgItems);
  const socials = SOCIALS.map((s) => ({ ...s, href: ((social?.[s.key] as string | null) ?? '').trim() })).filter((s) =>
    /^https?:\/\//i.test(s.href),
  );

  const msgs: NewsletterMsgs = {
    invalid: tr('Zəhmət olmasa düzgün e-poçt ünvanı daxil edin.', locale),
    sending: tr('Göndərilir…', locale),
    ok: tr('Təşəkkürlər! Abunəliyiniz qeydə alındı.', locale),
    fail: tr('Xəta baş verdi. Bir az sonra yenidən cəhd edin.', locale),
    net: tr('Şəbəkə xətası. Yenidən cəhd edin.', locale),
  };

  return (
    <>
    {/* F5.39 — səhifənin məsul redaktoru (təyin olunubsa). Footer hər səhifədədir. */}
    <PageOwnerNote locale={locale} label={tr('Bu səhifənin məzmununa məsul', locale)} />
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
            <a href={`/${locale}`} className="brand">
              <div className="brand-emblem"><img src="/home/emblem.webp" alt={tr('ADDA logo', locale)} /></div>
              <div className="brand-divider" style={{ background: 'rgba(255,255,255,0.18)' }} />
              <div className="brand-text">
                {/* Rəng 14-footer.css-dən (inline yox — yüksək kontrast onu dəyişə bilsin) */}
                <span className="b-name">ADDA</span>
                <span className="b-full">
                  {tr('Azərbaycan Dövlət Dəniz Akademiyası', locale)}
                </span>
              </div>
            </a>
            <div className="foot-contact">
              <a href="#"><i className="ti ti-map-pin" />{' ' + tr('Bakı şəhəri, AZ1000, Azərbaycan', locale)}</a>
              <a href={SITE_PHONE.href}><i className="ti ti-phone" />{' ' + SITE_PHONE.display}</a>
              <a href="mailto:info@adda.edu.az"><i className="ti ti-mail" />{' info@adda.edu.az'}</a>
            </div>
            {socials.length ? (
              <div className="ftx-social" aria-label={tr('Sosial şəbəkələr', locale)}>
                {socials.map((s) => (
                  <a href={s.href} aria-label={s.name} key={s.name} target="_blank" rel="noopener noreferrer">
                    <i className={`ti ${s.icon}`} aria-hidden="true" />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          {/* CMS-driven: menu.footerMenyusu, Strapi əlçatmazsa FALLBACK_MENU */}
          <nav className="ftx-cols" aria-label={tr('Sayt bölmələri', locale)}>
            {fcols.map((col) => (
              <div className="foot-col" key={col.title}>
                <h4>{tr(col.title, locale)}</h4>
                {(col.links ?? []).map((l, i) => (
                  <a href={menuHref(l.url, locale)} key={`${l.label}-${i}`}>{tr(l.label, locale)}</a>
                ))}
              </div>
            ))}
          </nav>
        </div>

        <div className="ftx-orgs">
          <span className="ftx-orgs-label">{tr('Rəsmi qurumlar', locale)}</span>
          <ul className="ftx-org-list">
            {orgs.map((o, i) => {
              const name = orgName(o, locale);
              const logo = mediaUrl(o.logo);
              return (
                <li key={`${o.url}-${i}`}>
                  <a href={o.url} target="_blank" rel="noopener noreferrer">
                    {logo ? (
                      <span className="fo-logo">
                        <img src={logo} alt="" loading="lazy" decoding="async" />
                      </span>
                    ) : (
                      <span className="fo-mark" aria-hidden="true">{(o.short ?? '').trim() || name.slice(0, 4).toUpperCase()}</span>
                    )}
                    <span className="fo-name">{name}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="ftx-bottom">
          <p>{tr('© 2026 Azərbaycan Dövlət Dəniz Akademiyası. Bütün hüquqlar qorunur.', locale)}</p>
          <ul className="ftx-legal">
            {LEGAL.map((x) => (
              // Faza 2: qalan üçünün href="#" → real marşrutlar. "Rektorla
              // əlaqə" F5.30c-də bağlanıb, `x.href` varsa o işlənir.
              <li key={x.label}><a href={x.href ? `/${locale}${x.href}` : '#'}>{tr(x.label, locale)}</a></li>
            ))}
          </ul>
        </div>
      </div>

      <NewsletterIsland msgs={msgs} />
    </footer>
    </>
  );
}
