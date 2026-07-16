// ── Faza 1 / Quicknav (server component) ─────────────────────────────
// Əvvəl HomeClient-də MARKUP + {{QUICKNAV}} tokeni ilə qurulurdu.
// Data Strapi-dən (suretliKecidler), əlçatmaz olsa FALLBACK_MENU-dan.
import type { SiteMenu } from '@/lib/strapi';
import { tr, type Locale } from '@/lib/i18n';
import { FALLBACK_MENU } from '@/lib/menu-fallback';

export default function Quicknav({ menu, locale }: { menu: SiteMenu | null; locale: Locale }) {
  const items = menu && menu.suretliKecidler.length ? menu.suretliKecidler : FALLBACK_MENU.suretliKecidler;
  return (
    <nav className="quicknav" aria-label={tr('Sürətli keçidlər', locale)}>
      <div className="quicknav-inner">
        {items.map((q, i) => (
          <a key={i} href={q.url || '#'} className="qnav-item">
            <i className={`ti ti-${q.icon || 'point'}`} />{' ' + tr(q.label, locale)}
          </a>
        ))}
      </div>
    </nav>
  );
}
