'use client';

// F4.9a — yan panel yapışqandır (sticky); 13 nəfərlik heyət siyahısı tam
// göstərilsə panel ekrandan uzun olur və sınır. İlk 6-dan sonrakılar bu
// komponentin içindədir, `hidden` atributu ilə (DOM-dan çıxarılmır — JS-siz
// halda da mətn qalır), «Hamısı (N)» düyməsi açır.
import { useState, type ReactNode } from 'react';

export default function StaffReveal({ moreLabel, children }: { moreLabel: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div hidden={!open}>{children}</div>
      {!open ? (
        <button type="button" className="un-staff-more" onClick={() => setOpen(true)}>
          {moreLabel}
        </button>
      ) : null}
    </>
  );
}
