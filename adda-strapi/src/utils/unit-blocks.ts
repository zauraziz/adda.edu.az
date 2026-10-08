/**
 * F5.43 — bölmə səhifəsində blok başlıqları və əlavə bloklar: admin forması.
 *
 *   - «Blok başlıqları» və «Əlavə bloklar» sahələri «Əsas foto / Qalereya»-dan
 *     dərhal sonra (Strapi yeni sahəni uzun formanın SONUNA qoyur — tapılmır);
 *   - «Blok başlığı» sətrinin bağlı görünüşündə blokun adı (standart: başlıq —
 *     gizlədilən blokda başlıq boş olur, sətir adsız qalırdı).
 *
 * BİR DƏFƏ (store `adda-admin` → `unitBlocks:v1`). Admin düzümü əl ilə
 * dəyişibsə (sahələr artıq sonda deyil) toxunulmur.
 */
import type { Core } from '@strapi/strapi';

type Row = Record<string, unknown>;
type Cell = { name: string; size: number };
type Conf = { settings: Row; metadatas: Row; layouts: { edit: Cell[][] } & Row };

const MARKER = 'unitBlocks:v1';
const UID = 'api::unit.unit';
const FIELDS = ['blockSettings', 'extraBlocks'];

async function placeFields(strapi: Core.Strapi): Promise<string> {
  const cts = strapi.plugin('content-manager').service('content-types') as unknown as {
    findContentType: (uid: string) => { uid: string } | null;
    findConfiguration: (ct: { uid: string }) => Promise<Conf>;
    updateConfiguration: (ct: { uid: string }, conf: Conf) => Promise<unknown>;
  };
  const ct = cts.findContentType(UID);
  if (!ct) return 'bölmə tipi yoxdur';
  const conf = await cts.findConfiguration(ct);
  const edit = conf.layouts?.edit ?? [];
  const names = edit.flat().map((c) => c.name);
  if (!FIELDS.every((f) => names.includes(f))) return 'sahələr formada yoxdur';
  // Yalnız Strapi defoltu: iki sahə formanın sonundadır.
  if (names.slice(-FIELDS.length).sort().join() !== [...FIELDS].sort().join()) return 'əl ilə dəyişilib — toxunulmadı';
  const rest = edit.map((r) => r.filter((c) => !FIELDS.includes(c.name))).filter((r) => r.length);
  let at = rest.findIndex((r) => r.some((c) => c.name === 'gallery' || c.name === 'photo'));
  if (at < 0) at = rest.findIndex((r) => r.some((c) => c.name === 'about'));
  if (at < 0) return '«Haqqında» tapılmadı — toxunulmadı';
  rest.splice(at + 1, 0, ...FIELDS.map((name) => [{ name, size: 12 }]));
  conf.layouts.edit = rest;
  await cts.updateConfiguration(ct, { settings: conf.settings, metadatas: conf.metadatas, layouts: conf.layouts });
  return 'qalereyadan sonra';
}

async function blockMainField(strapi: Core.Strapi): Promise<boolean> {
  const comps = strapi.plugin('content-manager').service('components') as unknown as {
    findComponent: (uid: string) => { uid: string } | null | undefined;
    findConfiguration: (c: { uid: string }) => Promise<Conf>;
    updateConfiguration: (c: { uid: string }, conf: Conf) => Promise<unknown>;
  };
  const c = comps.findComponent('unit.block-setting');
  if (!c) return false;
  const conf = await comps.findConfiguration(c);
  if (conf.settings?.mainField === 'block') return false;
  if (conf.settings?.mainField && conf.settings.mainField !== 'title' && conf.settings.mainField !== 'id') return false;
  conf.settings = { ...conf.settings, mainField: 'block' };
  await comps.updateConfiguration(c, { settings: conf.settings, metadatas: conf.metadatas, layouts: conf.layouts });
  return true;
}

export async function placeUnitBlockFields(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: MARKER })) === true) return;
  const where = await placeFields(strapi);
  const main = await blockMainField(strapi).catch((e: Error) => {
    strapi.log.warn('[unit-blocks] F5.43: «Blok başlığı» görünüşü yazılmadı: ' + e.message);
    return false;
  });
  await store.set({ key: MARKER, value: true });
  strapi.log.info(`[unit-blocks] F5.43: «Blok başlıqları» və «Əlavə bloklar» admin formasında: ${where}; sətir adı: ${main ? 'blok' : 'toxunulmadı'}.`);
}
