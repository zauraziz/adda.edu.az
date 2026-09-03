'use client';

// F5.5c — ixtisas səhifəsi mündəricatı. Beş mətn bölməsi (+ üzmə təcrübəsi
// + tədris planı) akkordeon ƏVƏZİNƏ tam açıq render olunur (bax page.tsx),
// ona görə uzun səhifədə "haradayam" sualı üçün lövbərli mündəricat və
// scroll-spy (IntersectionObserver) lazımdır.
//
// EYNİ komponent İKİ yerdə render olunur (page.tsx-ə bax): `.un-side`-ın
// yuxarısında (masaüstü, sticky yan panel pulsuz irsi olunur — bax
// 36-unit.css .un-side) və başlıqdan sonra (mobil, üfüqi çip cərgəsi —
// 900px-dən aşağı .un-side onsuz da `order:-1` ilə yuxarı keçir, bax
// 36-unit.css). CSS media sorğusu hansının göründüyünü həll edir, hər iki
// nüsxə öz-özünə müstəqil scroll-spy aparır (ucuz — 5-7 bölmə).
import { useEffect, useState } from 'react';

export interface TocItem {
  id: string;
  label: string;
}

export default function ProgramToc({ items, variant }: { items: TocItem[]; variant: 'desktop' | 'mobile' }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '');

  useEffect(() => {
    if (!items.length) return;
    const els = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!els.length) return;

    // F5.5c — üst zolaqda (sabit header altında) "aktiv zona" — bölmənin
    // başlığı bura girəndə həmin bölmə mündəricatda vurğulanır.
    const observer = new IntersectionObserver(
      (entries) => {
        setActiveId((prev) => {
          const visible = entries.filter((e) => e.isIntersecting);
          if (!visible.length) return prev;
          const top = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b));
          return top.target.id || prev;
        });
      },
      { rootMargin: '-110px 0px -75% 0px', threshold: 0 },
    );
    for (const el of els) observer.observe(el);
    return () => observer.disconnect();
  }, [items]);

  if (!items.length) return null;

  return (
    <nav className={'pr-toc pr-toc--' + variant} aria-label="Mündəricat">
      <ul className="pr-toc-list">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={'#' + item.id}
              className={'pr-toc-link' + (activeId === item.id ? ' pr-toc-link--active' : '')}
              aria-current={activeId === item.id ? 'true' : undefined}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
