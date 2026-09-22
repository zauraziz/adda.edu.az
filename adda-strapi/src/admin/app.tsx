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
 */
import type { StrapiApp } from '@strapi/strapi/admin';
import { Bell } from '@strapi/icons';
import { InboxMenuIcon } from './inbox/MenuIcon';
import { InboxSidePanel } from './inbox/SidePanel';

type ContentManagerApis = { apis: { addEditViewSidePanel: (panels: unknown[]) => void } };

export default {
  config: {
    locales: [],
  },
  register(app: StrapiApp) {
    app.addMenuLink({
      to: 'bildirisler',
      icon: InboxMenuIcon,
      intlLabel: { id: 'adda.inbox.menu', defaultMessage: 'Bildirişlər' },
      permissions: [],
      position: 2,
      Component: () => import('./inbox/InboxPage'),
    });
    app.widgets.register({
      id: 'adda-inbox',
      icon: Bell,
      title: { id: 'adda.inbox.widget.title', defaultMessage: 'Bildirişlər' },
      link: { label: { id: 'adda.inbox.widget.link', defaultMessage: 'Hamısına bax' }, href: '/bildirisler' },
      component: () => import('./inbox/HomeWidget').then((m) => m.InboxWidget),
    });
  },
  bootstrap(app: Pick<StrapiApp, 'getPlugin'>) {
    const cm = app.getPlugin('content-manager') as unknown as ContentManagerApis | undefined;
    cm?.apis?.addEditViewSidePanel([InboxSidePanel]);
  },
};
