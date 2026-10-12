'use client';

// F5.49 — FAQ səhifəsində axtarış: yazdıqca uyğun olmayan suallar gizlənir,
// boş qalan səhifə və mövzu blokları da. Hər söz ayrıca axtarılır (sıra
// fərq etmir), hərf və diakritik fərqi nəzərə alınmır (lib/search-fold.ts).
// Ünvanda ?q=… varsa (saytın axtarışından gələndə) sahə doldurulur.
import { useEffect, useRef, useState } from 'react';
import { searchFold } from '@/lib/search-fold';

export interface FaqSearchText {
  label: string;
  placeholder: string;
  found: string;
  none: string;
  clear: string;
}

export default function FaqSearch({ text, total }: { text: FaqSearchText; total: number }) {
  const [q, setQ] = useState('');
  const [count, setCount] = useState(total);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('q');
    if (p) setQ(p);
  }, []);

  useEffect(() => {
    const words = searchFold(q).split(' ').filter(Boolean);
    let n = 0;
    document.querySelectorAll<HTMLElement>('[data-faq-item]').forEach((el) => {
      const hay = el.dataset.q ?? '';
      const ok = words.every((w) => hay.includes(w));
      el.hidden = !ok;
      if (ok) n++;
    });
    document.querySelectorAll<HTMLElement>('[data-faq-source], [data-faq-group]').forEach((el) => {
      el.hidden = !el.querySelector('[data-faq-item]:not([hidden])');
    });
    setCount(n);
  }, [q]);

  return (
    <div className="faq-search" role="search">
      <label className="vh" htmlFor="faqSearch">
        {text.label}
      </label>
      <i className="ti ti-search" aria-hidden="true" />
      <input
        ref={input}
        id="faqSearch"
        type="search"
        value={q}
        placeholder={text.placeholder}
        autoComplete="off"
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setQ('');
        }}
      />
      {q ? (
        <button
          type="button"
          className="faq-search-clear"
          aria-label={text.clear}
          onClick={() => {
            setQ('');
            input.current?.focus();
          }}
        >
          <i className="ti ti-x" aria-hidden="true" />
        </button>
      ) : null}
      <p className="faq-search-status" role="status" aria-live="polite">
        {q ? (count ? text.found.replace('{n}', String(count)) : text.none) : ''}
      </p>
    </div>
  );
}
