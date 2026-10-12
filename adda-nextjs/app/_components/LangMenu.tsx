'use client';

// F5.49 — dil seçimi: düymədə cari dil (kod), klikdə digər dillərin siyahısı.
// Keçid eyni səhifənin digər dildəki ünvanıdır (lib/locale-path.ts). Klaviatura:
// Enter/Boşluq açır, ↑/↓ seçir, Esc bağlayır və fokusu düyməyə qaytarır;
// kənara klik bağlayır. Mətnlər server komponentindən (tr()) props ilə gəlir.
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { switchLocalePath } from '@/lib/locale-path';
import type { Locale } from '@/lib/i18n';

export interface LangOption {
  code: Locale;
  /** Düymədə: AZ / EN / RU. */
  short: string;
  /** Siyahıda öz dilində: Azərbaycanca / English / Русский. */
  name: string;
}

export default function LangMenu({ locale, options, label }: { locale: Locale; options: LangOption[]; label: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const current = options.find((o) => o.code === locale) ?? options[0];
  const others = options.filter((o) => o.code !== locale);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btn.current?.focus();
      }
    };
    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onKey);
    // İlk bəndə fokus — klaviatura ilə açılanda dərhal seçmək olsun.
    wrap.current?.querySelector<HTMLAnchorElement>('.lang-menu a')?.focus();
    return () => {
      document.removeEventListener('click', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const onMenuKey = (e: React.KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const items = Array.from(e.currentTarget.querySelectorAll<HTMLAnchorElement>('a'));
    const i = items.indexOf(document.activeElement as HTMLAnchorElement);
    const next = e.key === 'ArrowDown' ? (i + 1) % items.length : (i - 1 + items.length) % items.length;
    items[next]?.focus();
  };

  return (
    <div className={'lang-dd' + (open ? ' open' : '')} ref={wrap}>
      <button
        ref={btn}
        type="button"
        className="lang-btn"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`${label}: ${current.name}`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <i className="ti ti-world" aria-hidden="true" />
        <span>{current.short}</span>
        <i className="ti ti-chevron-down lang-chev" aria-hidden="true" />
      </button>
      {open ? (
        <ul className="lang-menu" aria-label={label} onKeyDown={onMenuKey}>
          {others.map((o) => (
            <li key={o.code}>
              <a href={switchLocalePath(pathname, o.code)} hrefLang={o.code} lang={o.code}>
                <span className="lang-code">{o.short}</span>
                <span>{o.name}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
