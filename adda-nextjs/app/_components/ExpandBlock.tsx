'use client';

// F4.6c — uzun mətn bloklarının aç/yığ düyməsi. Açıq/bağlı vəziyyətə görə
// həm düymə mətni ("Yığ"), həm `aria-expanded` DƏYİŞMƏLİDİR — bunu native
// <details> avtomatik təmin etmir, ona görə klient komponentidir. Tərcümə
// edilmiş mətnlər PROPS kimi gəlir — tam `tr()` lüğəti klient bundle-ına
// düşməsin deyə (bax CLAUDE.md, Next.js tələləri).
import { useState } from 'react';

export default function ExpandBlock({
  html,
  labelClosed,
  labelOpen,
}: {
  html: string;
  labelClosed: string;
  labelOpen: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <details className="un-expand" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className="un-expand-toggle" aria-expanded={open}>
        {open ? labelOpen : labelClosed}
      </summary>
      <div className="na-body" style={{ maxWidth: 'none' }} dangerouslySetInnerHTML={{ __html: html }} />
    </details>
  );
}
