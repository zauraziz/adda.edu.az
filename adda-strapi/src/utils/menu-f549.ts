/**
 * F5.49 — menyuya üç kiçik dəyişiklik, hər biri BİR DƏFƏ (store `adda-admin`):
 *
 *   - `faqMenu:v1`  — üst menyunun «FAQ» keçidi `/hazirlanir/faq` (və ya «#»)
 *     idisə → `/sehife/faq` (yeni «Tez-tez verilən suallar» səhifəsi).
 *   - `ascoMenu:v1` — «Akademiya → Akademik irs və missiya» qrupuna «Akademiya
 *     haqqında»-dan sonra «ASCO və Akademiya» (`/sehife/asco-ve-akademiya`).
 *   - `audienceMenu:v1` — «Bunlar üçün» siyahısının sonuna «Tərəfdaşlar və
 *     işəgötürənlər» (`/bunlar-ucun/terefdaslar`).
 *
 * Admin keçidi artıq dəyişibsə (başqa ünvan) və ya keçid artıq varsa
 * toxunulmur — logda yazılır. Qalan kateqoriyalar komponent id-ləri ilə geri
 * yazılır. «Məsul redaktor» açarı (`page:faq`) `/hazirlanir/faq` və
 * `/sehife/faq` üçün eynidir — təyinat qalır.
 *
 * Eyni quruluş: seed (src/index.ts → MENU), Next.js lib/menu-fallback.ts,
 * lib/audiences.ts. Etiketlərin ru/en tərcüməsi: lib/i18n.ts → MENU_T.
 */
import type { Core } from '@strapi/strapi';

type Row = Record<string, unknown>;

export const FAQ_URL = '/sehife/faq';
export const ASCO_LINK = { label: 'ASCO və Akademiya', url: '/sehife/asco-ve-akademiya' };
export const PARTNERS_AUDIENCE = { label: 'Tərəfdaşlar və işəgötürənlər', url: '/bunlar-ucun/terefdaslar' };

const AKADEMIYA = 'Akademiya';
const AKADEMIYA_GROUP = 'Akademik irs və missiya';
const AKADEMIYA_ABOUT_URL = '/sehife/adda-dunen-ve-bugun';
const FAQ_OLD = ['/hazirlanir/faq', '#', ''];

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

function keepLink(l: Row): Row {
  return { id: l.id, label: l.label, url: l.url };
}
function keepCategory(c: Row, patch?: (g: Row, links: Row[]) => Row[]): Row {
  return {
    id: c.id,
    label: c.label,
    order: c.order,
    url: c.url,
    groups: ((c.groups as Row[]) ?? []).map((g) => {
      const links = ((g.links as Row[]) ?? []).map(keepLink);
      return { id: g.id, title: g.title, links: patch ? patch(g, links) : links };
    }),
  };
}

export async function applyMenuF549(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  const done = {
    faq: (await store.get({ key: 'faqMenu:v1' })) === true,
    asco: (await store.get({ key: 'ascoMenu:v1' })) === true,
    aud: (await store.get({ key: 'audienceMenu:v1' })) === true,
  };
  if (done.faq && done.asco && done.aud) return;

  const docs = strapi.documents('api::menu.menu' as never) as unknown as {
    findFirst: (a: Row) => Promise<Row | null>;
    update: (a: Row) => Promise<Row>;
  };
  const menu = await docs.findFirst({
    populate: {
      esasMenyu: { populate: { groups: { populate: { links: true } } } },
      ustMenyu: { populate: { groups: { populate: { links: true } } } },
      istifadeciQruplari: true,
    },
  });
  if (!menu) {
    strapi.log.warn('[menu] F5.49: menyu tapılmadı — FAQ, ASCO və «Bunlar üçün» yenilənmədi.');
    return;
  }

  const data: Row = {};
  const notes: string[] = [];
  const markers: string[] = [];

  // ── FAQ ──
  if (!done.faq) {
    const ust = (menu.ustMenyu as Row[]) ?? [];
    const idx = ust.findIndex((c) => str(c.label).toUpperCase() === 'FAQ' || str(c.url) === '/hazirlanir/faq');
    if (idx < 0) {
      notes.push('FAQ: üst menyuda yoxdur — toxunulmadı');
    } else if (str(ust[idx].url) === FAQ_URL) {
      notes.push('FAQ: artıq yenidir');
    } else if (FAQ_OLD.includes(str(ust[idx].url))) {
      data.ustMenyu = ust.map((c, i) => (i === idx ? { ...keepCategory(c), url: FAQ_URL } : keepCategory(c)));
      notes.push(`FAQ → ${FAQ_URL}`);
    } else {
      notes.push(`FAQ: admin ünvanı dəyişib (${str(ust[idx].url)}) — toxunulmadı`);
    }
    markers.push('faqMenu:v1');
  }

  // ── ASCO ──
  if (!done.asco) {
    const cats = (menu.esasMenyu as Row[]) ?? [];
    const cIdx = cats.findIndex((c) => str(c.label) === AKADEMIYA);
    const groups = cIdx >= 0 ? ((cats[cIdx].groups as Row[]) ?? []) : [];
    const has = groups.some((g) => ((g.links as Row[]) ?? []).some((l) => str(l.url) === ASCO_LINK.url));
    const gIdx = groups.findIndex((g) => str(g.title) === AKADEMIYA_GROUP);
    if (has) {
      notes.push('ASCO: keçid artıq menyudadır');
    } else if (cIdx < 0 || gIdx < 0) {
      notes.push(`ASCO: «${AKADEMIYA} → ${AKADEMIYA_GROUP}» tapılmadı — toxunulmadı (keçidi admində əl ilə əlavə edin: ${ASCO_LINK.url})`);
    } else {
      const target = groups[gIdx];
      data.esasMenyu = cats.map((c, i) =>
        i !== cIdx
          ? keepCategory(c)
          : keepCategory(c, (g, links) => {
              if (g !== target) return links;
              const at = links.findIndex((l) => str(l.url) === AKADEMIYA_ABOUT_URL || str(l.label) === 'Akademiya haqqında');
              const next = links.slice();
              next.splice(at >= 0 ? at + 1 : next.length, 0, { label: ASCO_LINK.label, url: ASCO_LINK.url });
              return next;
            }),
      );
      notes.push(`ASCO: «${AKADEMIYA_GROUP}» qrupuna əlavə olundu`);
    }
    markers.push('ascoMenu:v1');
  }

  // ── «Bunlar üçün» ──
  if (!done.aud) {
    const aud = (menu.istifadeciQruplari as Row[]) ?? [];
    if (aud.some((l) => str(l.url) === PARTNERS_AUDIENCE.url)) {
      notes.push('«Bunlar üçün»: tərəfdaşlar artıq var');
    } else {
      data.istifadeciQruplari = [...aud.map(keepLink), { label: PARTNERS_AUDIENCE.label, url: PARTNERS_AUDIENCE.url }];
      notes.push(`«Bunlar üçün»: ${aud.length} → ${aud.length + 1} («${PARTNERS_AUDIENCE.label}»)`);
    }
    markers.push('audienceMenu:v1');
  }

  if (Object.keys(data).length) await docs.update({ documentId: menu.documentId, data });
  for (const key of markers) await store.set({ key, value: true });
  strapi.log.info(`[menu] F5.49: ${notes.join('; ')}.`);
}
