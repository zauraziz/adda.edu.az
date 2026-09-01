'use client';

// F4.6c/F4.7a/F4.7b/F4.8a/F4.10 — uzun mətn bloklarının aç/yığ akkordeonu
// (HSE istinadı): bütöv enli kart, sağda dairəvi ox vəziyyəti göstərir (bax
// 36-unit.css .un-expand-arrow). Başlıq AYRICA <h2> DEYİL — akkordeon
// zolağının özü <h2><button aria-expanded>…</button></h2>-dir (F4.8a: əvvəl
// bloklar həm öz h2-sini, həm akkordeon zolağını eyni adla göstərirdi —
// ad iki dəfə yazılırdı). Native <details> ƏVƏZİNƏ h2+button seçilib ki,
// başlıq semantikası h2 səviyyəsində qalsın (WAI-ARIA accordion nümunəsi).
// Tərcümə edilmiş mətn PROP kimi gəlir — tam `tr()` lüğəti klient
// bundle-ına düşməsin deyə (bax CLAUDE.md, Next.js tələləri).
// F4.10 — gövdə `html` string YOX, `children` qəbul edir: struktur
// səhifəsindəki akkordeon qrupu prose HTML-i, kart torunu (FnCardGrid) və
// hesabat sənəd siyahısını EYNİ qabıqda göstərir (bax struktur/[slug]/page.tsx).
import { useState } from 'react';

export default function ExpandBlock({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="un-expand">
      <h2 className="un-expand-head">
        <button
          type="button"
          className="un-expand-toggle"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {label}
          <span className="un-expand-arrow" aria-hidden="true" />
        </button>
      </h2>
      <div className="un-expand-body" hidden={!open}>
        {children}
      </div>
    </div>
  );
}
