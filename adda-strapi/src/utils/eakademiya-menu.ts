/**
 * F5.55 — «E-Akademiya» menyusu (Zaur müəllim, 18.10.2026): «Elektron jurnal»,
 * «Dərs cədvəli» və «Sertifikatlar» kartları çıxır, yerlərinə Elm Portalı (CRIS),
 * CJMSE jurnalı və kurslara qeydiyyat portalı (Vercel layihəsi adda-courses).
 *
 * applyEAkademiyaMenuV1 — BİR DƏFƏ (`eAkademiya:v1`): kart etiketi dəqiq uyğun
 * gələrsə həmin yerdə əvəz olunur; etiketi admində dəyişdirilibsə toxunulmur və
 * yeni kart (ünvanı menyuda yoxdursa) sona əlavə olunur. Seed (index.ts) və
 * adda-nextjs/lib/menu-fallback.ts eynidir; tərcümələr lib/i18n.ts → MENU_T.
 */
import type { Core } from '@strapi/strapi';

type Row = Record<string, unknown>;

const MARKER = 'eAkademiya:v1';
const TAG = '[menu] F5.55';

export const EACAD_CARDS: { old: string; label: string; description: string; url: string; icon: string }[] = [
  { old: 'Elektron jurnal', label: 'Elm Portalı (CRIS)', description: 'Tədqiqatçılar və nəşrlər', url: 'https://cris.adda.edu.az', icon: 'microscope' },
  { old: 'Dərs cədvəli', label: 'CJMSE jurnalı', description: 'Dəniz elmləri və mühəndislik', url: 'https://cjmse.adda.edu.az', icon: 'book-2' },
  { old: 'Sertifikatlar', label: 'Kurslara qeydiyyat', description: 'STCW və təlim kursları', url: 'https://portal.adda.edu.az', icon: 'clipboard-check' },
];

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

export async function applyEAkademiyaMenuV1(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: MARKER })) === true) return;
  const d = strapi.documents('api::menu.menu' as never) as unknown as {
    findFirst: (a: Row) => Promise<Row | null>;
    update: (a: Row) => Promise<Row>;
  };
  const menu = await d.findFirst({ populate: { eAkademiya: { populate: { cards: true } } } });
  const portal = (menu?.eAkademiya ?? null) as Row | null;
  if (!menu || !portal) {
    strapi.log.warn(`${TAG}: E-Akademiya bloku tapılmadı — kartlar yenilənmədi.`);
    return;
  }
  const cards = Array.isArray(portal.cards) ? (portal.cards as Row[]) : [];
  const urls = new Set(cards.map((c) => str(c.url)));
  const notes: string[] = [];
  const used = new Set<string>();
  const next: Row[] = cards.map((c) => {
    const keep = { id: c.id, label: c.label, description: c.description, url: c.url, icon: c.icon };
    const rule = EACAD_CARDS.find((r) => r.old === str(c.label));
    if (!rule || urls.has(rule.url)) return keep;
    used.add(rule.url);
    notes.push(`«${rule.old}» → «${rule.label}»`);
    return { id: c.id, label: rule.label, description: rule.description, url: rule.url, icon: rule.icon };
  });
  for (const r of EACAD_CARDS) {
    if (used.has(r.url) || urls.has(r.url)) continue;
    next.push({ label: r.label, description: r.description, url: r.url, icon: r.icon });
    notes.push(`+ «${r.label}»`);
  }
  if (notes.length) {
    await d.update({
      documentId: menu.documentId,
      data: { eAkademiya: { id: portal.id, title: portal.title, subtitle: portal.subtitle, cards: next } },
    });
  }
  await store.set({ key: MARKER, value: true });
  strapi.log.info(`${TAG}: E-Akademiya — ${notes.length ? notes.join('; ') : 'kartlar artıq yenidir'}.`);
}
