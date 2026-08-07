'use client';

// ── K29: mobil naviqasiya — hse.ru məntiqi ───────────────────────────
//
// STRUKTUR (hse.ru-dan): bölmə → adlandırılmış qruplar → linklər.
// Panelin başında bölmənin ÖZ linki durur ("Bölməyə keç"), sonra qrup
// başlıqları və altındakı linklər. Portal kartlarının təsviri də göstərilir —
// hse.ru-da hər qrupda bir seçilmiş bənd izahla verilir.
//
// AKKORDEON DEYİL, SƏVİYYƏ. Əvvəlki variant bölmələri yerindəcə açırdı;
// 107 bənd bir siyahıda uzun sürüşməyə çevrilirdi və istifadəçi hansı
// bölmədə olduğunu itirirdi. İndi bölməyə toxunanda panel sürüşür və yalnız
// həmin bölmə görünür — desktopdakı mega panelin mobil qarşılığı. Geri
// düyməsi valideynin adını daşıyır.
//
// PORTAL (createPortal) MƏCBURİDİR. `header{position:relative;z-index:90}`
// stacking context yaradır; çekməcə header-in içində render olunanda onun
// `z-index:500`-ü həmin kontekstin İÇİNDƏ qalırdı və kənarda hələ də 90
// sayılırdı. `.gov-banner` və `.utility` isə 95-dədir — çekməcənin üstünə
// çıxıb bağlama düyməsini yarıya qədər örtürdü. `document.body`-yə portal
// bu zənciri tamamilə qırır.
//
// Mətnlər PROPS ilə gəlir — server komponentində `tr()`-dən keçir.
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';

export interface MNavLink {
  label: string;
  href: string;
  /** hse.ru-dakı seçilmiş bənd kimi — yalnız portal kartlarında var. */
  description?: string;
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
export interface MNavLang {
  code: string;
  label: string;
  href: string;
  active: boolean;
}
export interface MNavLabels {
  menu: string;
  close: string;
  back: string;
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
  languages: MNavLang[];
  labels: MNavLabels;
}

export default function MobileNav({ data }: { data: MNavData }) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<MNavSection | null>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { labels } = data;

  useEffect(() => setMounted(true), []);

  // Bağlananda səviyyə kökə qayıdır — növbəti açılış yarımçıq qalmasın.
  const close = () => {
    setOpen(false);
    setSection(null);
  };

  useEffect(() => {
    setOpen(false);
    setSection(null);
  }, [pathname]);

  // Səviyyə dəyişəndə sürüşmə yuxarı qayıdır.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [section]);

  // Escape: əvvəlcə bir səviyyə geri, kökdədirsə bağlanır.
  // Tab: fokus panel daxilində qapalı dövrədə qalır.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (section) setSection(null);
        else close();
        return;
      }
      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const f = panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
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
  }, [open, section]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia('(min-width: 981px)');
    const onChange = () => {
      if (mq.matches) close();
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [open]);

  useEffect(() => {
    if (open) panelRef.current?.querySelector<HTMLElement>('button')?.focus();
    else burgerRef.current?.focus({ preventScroll: true });
  }, [open]);

  const rows = (list: MNavSection[], keyPrefix: string) =>
    list.map((s, i) =>
      s.groups.length ? (
        <button
          type="button"
          key={`${keyPrefix}-${i}`}
          className="mnav-row"
          onClick={() => setSection(s)}
        >
          <span>{s.label}</span>
          <i className="ti ti-chevron-right" aria-hidden="true" />
        </button>
      ) : (
        <a key={`${keyPrefix}-${i}`} className="mnav-row" href={s.href}>
          <span>{s.label}</span>
          <i className="ti ti-arrow-up-right" aria-hidden="true" />
        </a>
      ),
    );

  const drawer = (
    <div className={open ? 'mnav is-open' : 'mnav'} id="mobileNav">
      <div className="mnav-backdrop" onClick={close} aria-hidden="true" />
      <div
        className="mnav-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={labels.menu}
      >
        <div className="mnav-top">
          {section ? (
            <button type="button" className="mnav-back" onClick={() => setSection(null)}>
              <i className="ti ti-chevron-left" aria-hidden="true" />
              <span>{labels.back}</span>
            </button>
          ) : (
            <span className="mnav-title">{labels.menu}</span>
          )}
          <button type="button" className="mnav-close" aria-label={labels.close} onClick={close}>
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>

        <div className="mnav-scroll" ref={scrollRef}>
          {section ? (
            <div className="mnav-view" key={section.href + section.label}>
              <h2 className="mnav-h">{section.label}</h2>
              <a className="mnav-overview" href={section.href}>
                {labels.overview}
                <i className="ti ti-arrow-right" aria-hidden="true" />
              </a>
              {section.groups.map((g, gi) => (
                <div className="mnav-grp" key={`g-${gi}`}>
                  <span className="mnav-grp-h">{g.title}</span>
                  {g.links.map((l, li) => (
                    <a key={`g-${gi}-l-${li}`} className="mnav-link" href={l.href}>
                      {l.label}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="mnav-view" key="root">
              <p className="mnav-kicker">{labels.sections}</p>
              {rows(data.main, 'm')}

              {data.portal && data.portal.cards.length ? (
                <>
                  <p className="mnav-kicker">{data.portal.title}</p>
                  {data.portal.cards.map((c, i) => (
                    <a key={`p-${i}`} className="mnav-feature" href={c.href}>
                      <b>{c.label}</b>
                      {c.description ? <small>{c.description}</small> : null}
                    </a>
                  ))}
                </>
              ) : null}

              {data.utility.length ? (
                <>
                  <p className="mnav-kicker">{labels.more}</p>
                  {rows(data.utility, 'u')}
                </>
              ) : null}

              {data.audiences.length ? (
                <>
                  <p className="mnav-kicker">{labels.audiences}</p>
                  {data.audiences.map((l, i) => (
                    <a key={`a-${i}`} className="mnav-row" href={l.href}>
                      <span>{l.label}</span>
                      <i className="ti ti-arrow-up-right" aria-hidden="true" />
                    </a>
                  ))}
                </>
              ) : null}

              {data.languages.length ? (
                <div className="mnav-langs">
                  {data.languages.map((l) => (
                    <a
                      key={l.code}
                      href={l.href}
                      className={l.active ? 'is-active' : undefined}
                      lang={l.code}
                    >
                      {l.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );

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
      {/* Portal: header-in stacking context-indən çıxmaq üçün — bax yuxarıdakı qeyd. */}
      {mounted ? createPortal(drawer, document.body) : null}
    </>
  );
}
