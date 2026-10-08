/**
 * F5.42 — bölmənin «Əsas foto» və «Qalereya» sahələri admin formasında
 * «Haqqında»-dan dərhal sonra (Strapi yeni sahəni formanın SONUNA qoyur —
 * uzun formada redaktor tapmır).
 *
 * BİR DƏFƏ (store `adda-admin` → `unitMedia:v1`). Admin düzümü əl ilə
 * dəyişibsə (sahələr artıq sonda deyil) toxunulmur.
 */
import type { Core } from '@strapi/strapi';

type Row = Record<string, unknown>;
type Cell = { name: string; size: number };
type Conf = { settings: Row; metadatas: Row; layouts: { edit: Cell[][] } & Row };

const MARKER = 'unitMedia:v1';
const UID = 'api::unit.unit';
const MEDIA = ['photo', 'gallery'];

export async function placeUnitMediaFields(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: MARKER })) === true) return;

  const cts = strapi.plugin('content-manager').service('content-types') as unknown as {
    findContentType: (uid: string) => { uid: string } | null;
    findConfiguration: (ct: { uid: string }) => Promise<Conf>;
    updateConfiguration: (ct: { uid: string }, conf: Conf) => Promise<unknown>;
  };
  const ct = cts.findContentType(UID);
  if (!ct) return;
  const conf = await cts.findConfiguration(ct);
  const edit = conf.layouts?.edit ?? [];
  const aboutRow = edit.findIndex((r) => r.some((c) => c.name === 'about'));
  // Media sahələri yalnız formanın sonundadırsa (Strapi defoltu) köçürülür.
  const tail = edit.slice(aboutRow + 1).flat().map((c) => c.name);
  const lastNames = edit.flat().slice(-MEDIA.length).map((c) => c.name).sort().join();
  if (aboutRow < 0 || lastNames !== [...MEDIA].sort().join() || tail.length === MEDIA.length) {
    await store.set({ key: MARKER, value: true });
    strapi.log.info('[unit-media] F5.42: admin düzümü toxunulmadı (sahələr artıq yerində və ya əl ilə dəyişilib).');
    return;
  }
  const rest = edit.map((r) => r.filter((c) => !MEDIA.includes(c.name))).filter((r) => r.length);
  const at = rest.findIndex((r) => r.some((c) => c.name === 'about'));
  rest.splice(at + 1, 0, MEDIA.map((name) => ({ name, size: 6 })));
  conf.layouts.edit = rest;
  await cts.updateConfiguration(ct, { settings: conf.settings, metadatas: conf.metadatas, layouts: conf.layouts });
  await store.set({ key: MARKER, value: true });
  strapi.log.info('[unit-media] F5.42: «Əsas foto» və «Qalereya» admin formasında «Haqqında»-dan sonra.');
}
