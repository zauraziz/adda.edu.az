'use client';

// ── Faza 1 / Footer: newsletter formu (client island) ────────────────
// HomeClient-dəki initNewsletter() buraya köçdü (HomeClient tamamilə silindi).
// Markup server-dədir (Footer.tsx) — bu ada yalnız davranış qoşur.
//
// DİQQƏT: burada '@/lib/i18n' İMPORT EDİLMİR. initNewsletter()-də locale
// parametri ümumiyyətlə yox idi → mesajlar /ru və /en-də azərbaycanca çıxırdı.
// Həll: mətnlər server tərəfdə tr() ilə çevrilib prop kimi ötürülür. Beləliklə
// həm baq bağlanır, həm də 55 kB-lıq T lüğəti client bundle-a düşmür.
import { useEffect } from 'react';

export type NewsletterMsgs = {
  invalid: string;
  sending: string;
  ok: string;
  fail: string;
  net: string;
};

export default function NewsletterIsland({ msgs }: { msgs: NewsletterMsgs }) {
  useEffect(() => {
    const form = document.getElementById('nlForm') as HTMLFormElement | null;
    const input = document.getElementById('nlEmail') as HTMLInputElement | null;
    const btn = document.getElementById('nlBtn') as HTMLButtonElement | null;
    const msg = document.getElementById('nlMsg');
    if (!form || !input || !btn || !msg) return;

    const setMsg = (t: string, ok: boolean) => {
      msg.textContent = t;
      (msg as HTMLElement).style.color = ok ? '#8FD9B0' : '#F2B8B5';
    };
    const onSubmit = async (e: Event) => {
      e.preventDefault();
      const email = input.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        setMsg(msgs.invalid, false);
        input.focus();
        return;
      }
      btn.disabled = true;
      const t0 = btn.innerHTML;
      btn.textContent = msgs.sending;
      try {
        const r = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        if (r.ok) { setMsg(msgs.ok, true); form.reset(); }
        else setMsg(msgs.fail, false);
      } catch {
        setMsg(msgs.net, false);
      }
      btn.disabled = false;
      btn.innerHTML = t0;
    };

    form.addEventListener('submit', onSubmit);
    return () => form.removeEventListener('submit', onSubmit);
  }, [msgs]);

  return null;
}
