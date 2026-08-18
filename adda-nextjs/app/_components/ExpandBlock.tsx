'use client';

// F4.6c/F4.7a — uzun mətn bloklarının aç/yığ akkordeonu. Başlığın özü açar
// («ətraflı»/«Yığ» sözləri yoxdur — vəziyyət oxla göstərilir, bax
// 36-unit.css .un-expand-arrow). `aria-expanded` DƏYİŞMƏLİDİR — bunu native
// <details> avtomatik təmin etmir, ona görə klient komponentidir. Tərcümə
// edilmiş mətn PROP kimi gəlir — tam `tr()` lüğəti klient bundle-ına
// düşməsin deyə (bax CLAUDE.md, Next.js tələləri).
import { useState } from 'react';

export default function ExpandBlock({ html, label }: { html: string; label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <details className="un-expand" open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className="un-expand-toggle" aria-expanded={open}>
        {label}
      </summary>
      <div className="na-body" style={{ maxWidth: 'none' }} dangerouslySetInnerHTML={{ __html: html }} />
    </details>
  );
}
