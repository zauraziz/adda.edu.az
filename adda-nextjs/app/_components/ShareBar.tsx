'use client';

// F5.49 — xəbər, elan və tədbirin sosial şəbəkələrdə paylaşılması:
// Facebook, X, LinkedIn, WhatsApp, Telegram, keçidin kopyalanması və (telefonda)
// cihazın öz «Paylaş» pəncərəsi. Keçidlər server-də mütləq ünvanla yaranır —
// JavaScript olmadan da işləyir; klik kiçik pəncərədə açılır. Önizləmə üçün
// Open Graph: lib/site.ts → shareMetadata.
import { useEffect, useState } from 'react';

export interface ShareLabels {
  share: string;
  copy: string;
  copied: string;
  more: string;
}

const NETS: { key: string; name: string; icon: string; href: (u: string, t: string) => string }[] = [
  { key: 'fb', name: 'Facebook', icon: 'ti-brand-facebook', href: (u) => `https://www.facebook.com/sharer/sharer.php?u=${u}` },
  { key: 'x', name: 'X', icon: 'ti-brand-x', href: (u, t) => `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
  { key: 'in', name: 'LinkedIn', icon: 'ti-brand-linkedin', href: (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
  { key: 'wa', name: 'WhatsApp', icon: 'ti-brand-whatsapp', href: (u, t) => `https://wa.me/?text=${t}%20${u}` },
  { key: 'tg', name: 'Telegram', icon: 'ti-brand-telegram', href: (u, t) => `https://t.me/share/url?url=${u}&text=${t}` },
];

export default function ShareBar({ url, title, labels }: { url: string; title: string; labels: ShareLabels }) {
  const [href, setHref] = useState(url);
  const [copied, setCopied] = useState(false);
  const [native, setNative] = useState(false);

  useEffect(() => {
    // Preview/yerli domendə də düzgün ünvan: yol eyni, host cari.
    try {
      const u = new URL(url);
      setHref(`${window.location.origin}${u.pathname}`);
    } catch {
      /* server ünvanı qalır */
    }
    setNative(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
  }, [url]);

  const u = encodeURIComponent(href);
  const t = encodeURIComponent(title);

  const open = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const w = window.open(e.currentTarget.href, 'adda-share', 'width=620,height=560,noopener,noreferrer');
    if (w) e.preventDefault();
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(href);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = href;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };
  const share = async () => {
    try {
      await navigator.share({ title, url: href });
    } catch {
      /* istifadəçi imtina etdi */
    }
  };

  return (
    <div className="share-bar" role="group" aria-label={labels.share}>
      <span className="share-h">
        <i className="ti ti-share" aria-hidden="true" />
        {labels.share}
      </span>
      <div className="share-btns">
        {NETS.map((n) => (
          <a
            key={n.key}
            className={`share-btn share-btn--${n.key}`}
            href={n.href(u, t)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${labels.share}: ${n.name}`}
            title={n.name}
            onClick={open}
          >
            <i className={`ti ${n.icon}`} aria-hidden="true" />
          </a>
        ))}
        <button type="button" className={'share-btn share-btn--copy' + (copied ? ' is-done' : '')} onClick={copy} aria-label={labels.copy} title={labels.copy}>
          <i className={copied ? 'ti ti-check' : 'ti ti-link'} aria-hidden="true" />
        </button>
        {native ? (
          <button type="button" className="share-btn share-btn--more" onClick={share} aria-label={labels.more} title={labels.more}>
            <i className="ti ti-share-2" aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <span className="vh" role="status" aria-live="polite">
        {copied ? labels.copied : ''}
      </span>
    </div>
  );
}
