'use client';

// ── K28: mobil naviqasiya çekməcəsi ──────────────────────────────────
//
// NİYƏ YAZILDI. Mobildə menyunun 148 bəndindən yalnız 6-sı əlçatan idi:
//   • `.mega{display:none}`      ≤980px → əsas menyunun bütün alt linkləri
//   • `.util-menu{display:none}` ≤980px → üst menyunun alt qrupları
//   • `.eacad-menu` yalnız `:hover` → toxunuş cihazında heç vaxt açılmır,
//     üstəlik düymənin `href`-i `#` idi
//   • `.utility-left{display:none}` ≤600px → üst menyu tamamilə yoxa çıxırdı
// Burger yalnız 6 üst səviyyə başlığını göstərirdi. Bu komponent tam ağacı
// akkordeon şəklində açır.
//
// KÖHNƏ YANAŞMA NİYƏ ATILDI. Əvvəl burger `HeaderIsland`-dan `.mainnav`-a
// INLINE STİL yazırdı (`display:flex`, `position:absolute`, `top:82px` və
// sabit `#053A52` qradiyenti — palitradan kənar). Üç problemi vardı:
//   1. inline stil breakpoint dəyişəndə QALIRDI — telefonu yan çevirəndə
//      desktop header sınırdı (CSS-də `.mainnav[style]{...!important}`
//      adlı yamaq bunun izidir, indi silinir);
//   2. linkə klikdən sonra panel bağlanmırdı;
//   3. `top:82px` header hündürlüyünə əl ilə bağlı idi.
// İndi vəziyyət React-dədir, görünüş isə tam CSS-dədir.
//
// Mətnlər PROPS ilə gəlir — server komponentində `tr()`-dən keçir.
// Klient adası i18n lüğətini dəyər kimi import etmir (bundle qaydası).
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export interface MNavLink {
  label: string;
  href: string;
}
export interface MNavGroup {
  title: string;
  links: MNavLink[];
}
export interface MNavSection {
  label: string;
  href: string;
  groups: MNavGroup[];
}
export interface MNavLabels {
  menu: string;
  close: string;
  sections: string;
  more: string;
  audiences: string;
  overview: string;
}
export interface MNavData {
  main: MNavSection[];
  utility: MNavSection[];
  portal: { title: string; cards: MNavLink[] } | null;
  audiences: MNavLink[];
  labels: MNavLabels;
}

export default function MobileNav({ data }: { data: MNavData }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { labels } = data;

  // Marşrut dəyişəndə bağlanır. Linklər `<a>` olduğu üçün adətən tam
  // yenilənmə olur, amma bu, gələcəkdə <Link>-ə keçsək də qoruyur.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape · fon kliki · fokus tələsi
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const f = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Arxa fonun sürüşməsi kilidlənir (çekməcə öz daxilində sürüşür).
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Ekran desktop enişinə çatanda bağlanır — açıq çekməcə orada mənasızdır.
  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia('(min-width: 981px)');
    const onChange = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [open]);

  // Açılanda fokus panelə keçir, bağlananda burger-ə qayıdır.
  useEffect(() => {
    if (open) panelRef.current?.querySelector<HTMLElement>('button')?.focus();
    else burgerRef.current?.focus({ preventScroll: true });
  }, [open]);

  const toggleSection = (key: string) =>
    setExpanded((cur) => (cur === key ? null : key));

  const renderSections = (sections: MNavSection[], prefix: string) =>
    sections.map((s, i) => {
      const key = `${prefix}-${i}`;
      if (!s.groups.length) {
        return (
          <a key={key} className="mnav-flat" href={s.href}>
            {s.label}
          </a>
        );
      }
      const isOpen = expanded === key;
      return (
        <div className="mnav-acc" key={key}>
          <button
            type="button"
            className={isOpen ? 'mnav-acc-btn is-open' : 'mnav-acc-btn'}
            aria-expanded={isOpen}
            aria-controls={`${key}-body`}
            onClick={() => toggleSection(key)}
          >
            <span>{s.label}</span>
            <i className="ti ti-chevron-down" aria-hidden="true" />
          </button>
          {isOpen ? (
            <div className="mnav-acc-body" id={`${key}-body`}>
              <a className="mnav-overview" href={s.href}>
                {labels.overview}
                <i className="ti ti-arrow-right" aria-hidden="true" />
              </a>
              {s.groups.map((g, gi) => (
                <div className="mnav-grp" key={`${key}-g${gi}`}>
                  <span className="mnav-grp-h">{g.title}</span>
                  {g.links.map((l, li) => (
                    <a key={`${key}-g${gi}-l${li}`} className="mnav-link" href={l.href}>
                      {l.label}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      );
    });

  return (
    <>
      <button
        ref={burgerRef}
        type="button"
        className="burger"
        aria-label={labels.menu}
        aria-expanded={open}
        aria-controls="mobileNav"
        onClick={() => setOpen(true)}
      >
        <i className="ti ti-menu-2" aria-hidden="true" />
      </button>

      <div className={open ? 'mnav is-open' : 'mnav'} id="mobileNav">
        <div className="mnav-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />
        <div
          className="mnav-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={labels.menu}
        >
          <div className="mnav-top">
            <span className="mnav-title">{labels.menu}</span>
            <button
              type="button"
              className="mnav-close"
              aria-label={labels.close}
              onClick={() => setOpen(false)}
            >
              <i className="ti ti-x" aria-hidden="true" />
            </button>
          </div>

          <nav className="mnav-scroll" aria-label={labels.menu}>
            <p className="mnav-kicker">{labels.sections}</p>
            {renderSections(data.main, 'm')}

            {data.portal && data.portal.cards.length ? (
              <>
                <p className="mnav-kicker">{data.portal.title}</p>
                <div className="mnav-portal">
                  {data.portal.cards.map((c, i) => (
                    <a key={`p-${i}`} className="mnav-portal-card" href={c.href}>
                      {c.label}
                    </a>
                  ))}
                </div>
              </>
            ) : null}

            {data.utility.length ? (
              <>
                <p className="mnav-kicker">{labels.more}</p>
                {renderSections(data.utility, 'u')}
              </>
            ) : null}

            {data.audiences.length ? (
              <>
                <p className="mnav-kicker">{labels.audiences}</p>
                {data.audiences.map((l, i) => (
                  <a key={`a-${i}`} className="mnav-flat" href={l.href}>
                    {l.label}
                  </a>
                ))}
              </>
            ) : null}
          </nav>
        </div>
      </div>
    </>
  );
}
