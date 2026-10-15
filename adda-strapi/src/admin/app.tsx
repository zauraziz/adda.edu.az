/**
 * ADDA — Strapi admin panelinin genişləndirilməsi.
 *
 * F5.38 «Bildirişlər»:
 *   - sol menyuda «Bildirişlər» (zəng + baxılmamışların canlı sayı);
 *     admin açıq ikən yeni müraciət/düzəliş/qeydiyyat gələndə toast;
 *   - /admin/bildirisler — bütün gələnlər bir siyahıda + oxu paneli
 *     (əlavə faylın birbaşa önizləməsi, status bir kliklə);
 *   - ana səhifədə vidcet;
 *   - Content Manager redaktə səhifəsində yan panel (status + əlavə fayl).
 * Server tərəfi: src/utils/admin-inbox.ts.
 *
 * F5.39:
 *   - admin interfeysi Azərbaycan dilində (translations/az.ts → `en` üzərinə;
 *     nisbi vaxt da — azRelativeTime);
 *   - «Məsul redaktorlar» səhifəsi, yan panel və vidcet (src/admin/owners/,
 *     server: src/utils/page-owners.ts).
 *
 * F5.52: brauzer tərcüməsi admini «removeChild» xətası ilə çökdürürdü —
 * dom-guard.ts (translate="no", notranslate, lang="az", DOM qoruyucusu).
 */
import type { StrapiApp } from '@strapi/strapi/admin';
import { Bell, User } from '@strapi/icons';
import { protectAdminDom } from './dom-guard';
import { InboxMenuIcon } from './inbox/MenuIcon';
import { InboxSidePanel } from './inbox/SidePanel';
import { OwnerSidePanel } from './owners/OwnerSidePanel';
import { AZ_ADMIN_TRANSLATIONS } from './translations/az';

// Modul yüklənəndə — React ilk dəfə render etməzdən və brauzer səhifənin dilini
// təyin etməzdən ƏVVƏL (register() isə şəbəkə sorğusundan sonra çağırılır).
protectAdminDom();

type ContentManagerApis = { apis: { addEditViewSidePanel: (panels: unknown[]) => void } };

/** «Bildirişlər»-in mənbələri (server: src/utils/admin-inbox.ts KINDS). */
const INBOX_READ = ['api::appeal.appeal', 'api::correction.correction', 'api::rsvp.rsvp'].map((subject) => ({
  action: 'plugin::content-manager.explorer.read',
  subject,
}));

/**
 * Nisbi vaxt («3 hours ago») — admin `en` dilindədir, Intl.RelativeTimeFormat
 * ingiliscə yazır. `en` üçün format() Azərbaycanca qaytarılır: «3 saat əvvəl»,
 * «dünən», «indi». Brauzerin `az` ICU məlumatına güvənmirik (bəzi Chromium
 * qurğularında yoxdur). Digər dillərə (məs. rus) toxunulmur.
 */
const AZ_UNITS: Record<string, string> = {
  second: 'saniyə', minute: 'dəqiqə', hour: 'saat', day: 'gün', week: 'həftə', month: 'ay', quarter: 'rüb', year: 'il',
};
function azRelativeTime(): void {
  if (typeof Intl === 'undefined' || !Intl.RelativeTimeFormat) return;
  const Base = Intl.RelativeTimeFormat;
  class AzRelativeTimeFormat extends Base {
    private readonly az: boolean;
    private readonly auto: boolean;
    constructor(locales?: string | string[], options?: Intl.RelativeTimeFormatOptions) {
      super(locales, options);
      this.az = /^en(?:-|$)/i.test(super.resolvedOptions().locale);
      this.auto = options?.numeric === 'auto';
    }
    format(value: number, unit: Intl.RelativeTimeFormatUnit): string {
      const u = String(unit).replace(/s$/, '');
      const word = AZ_UNITS[u];
      if (!this.az || !word || !Number.isFinite(value)) return super.format(value, unit);
      if (this.auto) {
        if (u === 'day' && value === -1) return 'dünən';
        if (u === 'day' && value === 1) return 'sabah';
        if (value === 0) return u === 'second' ? 'indi' : `bu ${word}`;
      }
      return `${Math.abs(value)} ${word} ${value < 0 || Object.is(value, -0) ? 'əvvəl' : 'sonra'}`;
    }
  }
  Object.defineProperty(Intl, 'RelativeTimeFormat', { value: AzRelativeTimeFormat, writable: true, configurable: true });
}

export default {
  config: {
    locales: [],
    translations: { en: AZ_ADMIN_TRANSLATIONS },
  },
  register(app: StrapiApp) {
    azRelativeTime();
    app.addMenuLink({
      to: 'bildirisler',
      icon: InboxMenuIcon,
      intlLabel: { id: 'adda.inbox.menu', defaultMessage: 'Bildirişlər' },
      // Gələnlərdən BİRİNİ oxuya bilən görür (məs. «Məsul redaktor» görmür).
      permissions: INBOX_READ,
      position: 2,
      Component: () => import('./inbox/InboxPage'),
    });
    app.addMenuLink({
      to: 'mesul-redaktorlar',
      icon: User,
      intlLabel: { id: 'adda.owners.menu', defaultMessage: 'Məsul redaktorlar' },
      permissions: [],
      position: 3,
      Component: () => import('./owners/OwnersPage'),
    });
    app.widgets.register({
      id: 'adda-inbox',
      icon: Bell,
      title: { id: 'adda.inbox.widget.title', defaultMessage: 'Bildirişlər' },
      link: { label: { id: 'adda.inbox.widget.link', defaultMessage: 'Hamısına bax' }, href: '/bildirisler' },
      // Vidcetdə icazələrin HAMISI tələb olunur — əsas gələn: müraciətlər.
      permissions: [INBOX_READ[0]],
      component: () => import('./inbox/HomeWidget').then((m) => m.InboxWidget),
    });
    app.widgets.register({
      id: 'adda-owners',
      icon: User,
      // Redaktor: öz səhifələri; baş admin: bütün menyu (məsulsuz və boş səhifələr).
      title: { id: 'adda.owners.widget.title', defaultMessage: 'Səhifələrin məzmunu' },
      link: { label: { id: 'adda.owners.widget.link', defaultMessage: 'Hamısına bax' }, href: '/mesul-redaktorlar' },
      component: () => import('./owners/OwnersWidget').then((m) => m.OwnersWidget),
    });
  },
  bootstrap(app: Pick<StrapiApp, 'getPlugin'>) {
    const cm = app.getPlugin('content-manager') as unknown as ContentManagerApis | undefined;
    cm?.apis?.addEditViewSidePanel([InboxSidePanel, OwnerSidePanel]);
  },
};
