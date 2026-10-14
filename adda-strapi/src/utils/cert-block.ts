/**
 * F5.51 — Akademiyanın sertifikatları admində: tək tip `api::cert-block.cert-block`
 * («3. Sayt — Sertifikatlar»), təkrarlanan komponent `cert.item`: ad (az) +
 * titleEn/titleRu, qısa ad (footer; «Qurum: sənəd» — «: »-dən sonrası ikinci
 * sətirdə), şəkil (skan), fayl (istəyə bağlı, PDF və ya orijinal), «Footer-də
 * göstər», «Gizlət». Sıra admində sürüklə-burax ilə dəyişir.
 *
 * Saytda: «/sertifikatlar» səhifəsi (hamısı) və footer zolağı (`footer` işarəlilər).
 * Next.js ehtiyatı: adda-nextjs/lib/cert-fallback.ts (EYNİ siyahı, şəkilsiz).
 *
 *   applyCertBlockV1  — BİR DƏFƏ (`certBlock:v1`): siyahı boşdursa köhnə
 *     saytın «Sertifikatlarımız» səhifəsindəki 6 sənədi (adda.edu.az/az/certificates)
 *     ŞƏKİLSİZ yazır. Admin artıq doldurubsa toxunulmur.
 *   attachCertImages  — ARXA PLANDA (news-import.ts → `certImages:v1`): şəkli
 *     boş olan və adı seed-dəki kimi qalan sertifikata köhnə saytdakı skanı
 *     endirib bağlayır.
 *   applyCertMenuV1   — BİR DƏFƏ (`certMenu:v1`): menyuda «Akkreditasiya və
 *     sertifikatlar», «Keyfiyyət siyasəti» və footer-də «Akkreditasiya» hələ
 *     «hazırlanır» səhifəsinə (və ya «#») aparırsa → «/sertifikatlar». Admin
 *     keçidi dəyişibsə toxunulmur.
 *   placeCertFields   — BİR DƏFƏ (`certLayout:v1`): sertifikatın forması (ad tam
 *     endə, qısa ad az/en/ru bir sətirdə, şəkil + fayl) və tək tiplərin başlığı
 *     («Sertifikatlar», «Rəsmi qurumlar» — documentId əvəzinə tipin adı).
 */
import type { Core } from '@strapi/strapi';
import { importLegacyFile, LegacyUnreachable } from './legacy-files';

type Row = Record<string, unknown>;

const UID = 'api::cert-block.cert-block';
const MARKER = 'certBlock:v1';
export const CERT_IMAGES_MARKER = 'certImages:v1';
const MENU_MARKER = 'certMenu:v1';
export const CERT_URL = '/sertifikatlar';

export interface L3 {
  az: string;
  en: string;
  ru: string;
}

export interface CertSeed {
  /** Köhnə saytdakı skanın yolu. */
  path: string;
  /** Media kitabxanasında fayl adı (uzantısız). */
  file: string;
  title: L3;
  short: L3;
  footer: boolean;
}

/** Köhnə saytdakı sıra ilə (adda.edu.az/az/certificates, 14.10.2026). */
export const DEFAULT_CERTS: CertSeed[] = [
  {
    path: '/uploads/certificates/ser_ad_2025.jpg',
    file: 'sertifikat-dda-taninma-2025',
    title: {
      az: 'Azərbaycan Dövlət Dəniz Akademiyasının tanınması haqqında Azərbaycan Respublikasının Dövlət Dəniz Administrasiyasının şəhadətnaməsi',
      en: 'Certificate of the State Maritime Administration of the Republic of Azerbaijan on the recognition of the Azerbaijan State Marine Academy',
      ru: 'Свидетельство Государственной морской администрации Азербайджанской Республики о признании Азербайджанской государственной морской академии',
    },
    short: {
      az: 'Dövlət Dəniz Administrasiyası: tanınma şəhadətnaməsi',
      en: 'State Maritime Administration: certificate of recognition',
      ru: 'Государственная морская администрация: свидетельство о признании',
    },
    footer: true,
  },
  {
    path: '/uploads/certificates/tehsil_Nazirliyi.jpg',
    file: 'sertifikat-tehsil-nazirliyi-akkreditasiya',
    title: {
      az: 'Azərbaycan Respublikası Təhsil Nazirliyinin akkreditasiya sertifikatı',
      en: 'Accreditation certificate of the Ministry of Education of the Republic of Azerbaijan',
      ru: 'Сертификат об аккредитации Министерства образования Азербайджанской Республики',
    },
    short: {
      az: 'Təhsil Nazirliyi: akkreditasiya sertifikatı',
      en: 'Ministry of Education: accreditation certificate',
      ru: 'Министерство образования: сертификат об аккредитации',
    },
    footer: true,
  },
  {
    path: '/uploads/certificates/IAMU-SERTIFiKAT.jpg',
    file: 'sertifikat-iamu-uzvluk',
    title: {
      az: 'Beynəlxalq Dəniz Universitetləri Assosiasiyasına üzvlük sertifikatı',
      en: 'Certificate of membership of the International Association of Maritime Universities (IAMU)',
      ru: 'Сертификат о членстве в Международной ассоциации морских университетов (IAMU)',
    },
    short: {
      az: 'IAMU: üzvlük sertifikatı',
      en: 'IAMU: certificate of membership',
      ru: 'IAMU: сертификат о членстве',
    },
    footer: true,
  },
  {
    path: '/uploads/Sertifikat_2025_1.jpg',
    file: 'sertifikat-iso-9001-2015-en',
    title: {
      az: 'ISO 9001:2015 sertifikatı (ingilis dilində)',
      en: 'ISO 9001:2015 certificate (English)',
      ru: 'Сертификат ISO 9001:2015 (на английском языке)',
    },
    short: {
      az: 'ISO 9001:2015: sertifikat (ingiliscə)',
      en: 'ISO 9001:2015: certificate (English)',
      ru: 'ISO 9001:2015: сертификат (на английском)',
    },
    footer: false,
  },
  {
    path: '/uploads/Sertifikat_2025.jpg',
    file: 'sertifikat-iso-9001-2015',
    title: {
      az: 'ISO 9001:2015 sertifikatı',
      en: 'ISO 9001:2015 certificate',
      ru: 'Сертификат ISO 9001:2015',
    },
    short: {
      az: 'ISO 9001:2015: keyfiyyət idarəetmə sistemi',
      en: 'ISO 9001:2015: quality management system',
      ru: 'ISO 9001:2015: система менеджмента качества',
    },
    footer: true,
  },
  {
    path: '/uploads/kts_2025.jpg',
    file: 'keyfiyyet-sahesinde-siyaset',
    title: {
      az: 'Keyfiyyət sahəsində siyasət',
      en: 'Quality policy',
      ru: 'Политика в области качества',
    },
    short: {
      az: 'Keyfiyyət sahəsində siyasət',
      en: 'Quality policy',
      ru: 'Политика в области качества',
    },
    footer: false,
  },
];

interface SingleDocs {
  findFirst: (a?: Row) => Promise<Row | null>;
  create: (a: Row) => Promise<Row>;
  update: (a: Row) => Promise<Row>;
}

const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const mediaId = (v: unknown): number | null =>
  v && typeof v === 'object' && typeof (v as { id?: unknown }).id === 'number' ? (v as { id: number }).id : null;

function l3(name: string, v: L3): Row {
  return { [name]: v.az, [name + 'En']: v.en, [name + 'Ru']: v.ru };
}

export async function applyCertBlockV1(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: MARKER })) === true) return;

  const docs = strapi.documents(UID as never) as unknown as SingleDocs;
  const cur = await docs.findFirst({ populate: ['items'] });
  const items = Array.isArray(cur?.items) ? (cur?.items as Row[]) : [];
  if (items.length) {
    await store.set({ key: MARKER, value: true });
    strapi.log.info(`[cert] F5.51: «Sertifikatlar» artıq doludur (${items.length}) — toxunulmadı.`);
    return;
  }
  const data = {
    items: DEFAULT_CERTS.map((c) => ({ ...l3('title', c.title), ...l3('short', c.short), footer: c.footer, hidden: false })),
  };
  if (cur?.documentId) await docs.update({ documentId: cur.documentId, data });
  else await docs.create({ data });
  await store.set({ key: MARKER, value: true });
  strapi.log.info(
    `[cert] F5.51: «3. Sayt — Sertifikatlar» yazıldı — ${DEFAULT_CERTS.length} sənəd (skanlar arxa planda köhnə saytdan yüklənir).`,
  );
}

/**
 * Şəkli boş olan seed sertifikatlarına skanı bağlayır. `offline` — köhnə sayt
 * əlçatmazdırsa (3 cəhddən sonra) şəkilsiz qalır və marker yazılır.
 * Qaytarır: bağlanan şəkil sayı. Şəbəkə xətası → LegacyUnreachable (çağıran tutur).
 */
export async function attachCertImages(strapi: Core.Strapi, offline = false): Promise<number> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: CERT_IMAGES_MARKER })) === true) return 0;
  const docs = strapi.documents(UID as never) as unknown as SingleDocs;
  const cur = await docs.findFirst({ populate: { items: { populate: ['image', 'file'] } } });
  const items = Array.isArray(cur?.items) ? (cur?.items as Row[]) : [];
  if (!cur?.documentId || !items.length) {
    await store.set({ key: CERT_IMAGES_MARKER, value: true });
    return 0;
  }
  if (offline) {
    await store.set({ key: CERT_IMAGES_MARKER, value: true });
    strapi.log.warn('[cert] F5.51: köhnə sayt əlçatmazdır — sertifikatların şəkillərini «3. Sayt — Sertifikatlar»-da əl ilə yükləyin.');
    return 0;
  }

  const want = new Map(DEFAULT_CERTS.map((c) => [c.title.az, c]));
  let linked = 0;
  let failed = 0;
  const next: Row[] = [];
  for (const it of items) {
    let image = mediaId(it.image);
    const seed = want.get(str(it.title));
    if (!image && seed) {
      try {
        image = (await importLegacyFile(strapi, seed.path, seed.file, seed.title.az)).id;
        linked++;
      } catch (e) {
        if (e instanceof LegacyUnreachable) throw e;
        failed++;
        strapi.log.warn(`[cert] F5.51: skan yüklənmədi (${seed.path}): ${(e as Error).message}`);
      }
    }
    next.push({
      title: it.title,
      titleEn: it.titleEn,
      titleRu: it.titleRu,
      short: it.short,
      shortEn: it.shortEn,
      shortRu: it.shortRu,
      image,
      file: mediaId(it.file),
      footer: it.footer !== false,
      hidden: it.hidden === true,
    });
  }
  if (linked) await docs.update({ documentId: cur.documentId, data: { items: next } });
  await store.set({ key: CERT_IMAGES_MARKER, value: true });
  strapi.log.info(
    `[cert] F5.51: sertifikat skanları bağlandı: ${linked}` +
      (failed ? `, alınmadı: ${failed} (admində əl ilə yükləyin).` : '.'),
  );
  return linked;
}

// ── Menyu ────────────────────────────────────────────────────────────────────
const OLD = {
  akkreditasiya: ['/hazirlanir/akkreditasiya-ve-sertifikatlar', '#', ''],
  siyaset: ['/hazirlanir/keyfiyyet-siyaseti', '#', ''],
  footer: ['/hazirlanir/akkreditasiya', '#', ''],
};
/** Keyfiyyət siyasəti sənədi səhifədə öz lövbəri ilə (lib/cert.ts → certAnchor). */
export const POLICY_URL = CERT_URL + '#keyfiyyet-sahesinde-siyaset';

function keepLink(l: Row): Row {
  return { id: l.id, label: l.label, url: l.url };
}

export async function applyCertMenuV1(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: MENU_MARKER })) === true) return;
  const docs = strapi.documents('api::menu.menu' as never) as unknown as {
    findFirst: (a: Row) => Promise<Row | null>;
    update: (a: Row) => Promise<Row>;
  };
  const menu = await docs.findFirst({
    populate: {
      esasMenyu: { populate: { groups: { populate: { links: true } } } },
      footerMenyusu: { populate: { links: true } },
    },
  });
  if (!menu) {
    strapi.log.warn('[menu] F5.51: menyu tapılmadı — sertifikat keçidləri yenilənmədi.');
    return;
  }
  const notes: string[] = [];
  const data: Row = {};

  // Əsas menyu: «Akkreditasiya və sertifikatlar», «Keyfiyyət siyasəti».
  let esasChanged = false;
  const esas = ((menu.esasMenyu as Row[]) ?? []).map((c) => ({
    id: c.id,
    label: c.label,
    order: c.order,
    url: c.url,
    groups: ((c.groups as Row[]) ?? []).map((g) => ({
      id: g.id,
      title: g.title,
      links: ((g.links as Row[]) ?? []).map((l) => {
        const label = str(l.label);
        const url = str(l.url);
        const rule =
          label === 'Akkreditasiya və sertifikatlar' || url === OLD.akkreditasiya[0]
            ? { old: OLD.akkreditasiya, to: CERT_URL }
            : label === 'Keyfiyyət siyasəti' || url === OLD.siyaset[0]
              ? { old: OLD.siyaset, to: POLICY_URL }
              : null;
        if (!rule) return keepLink(l);
        if (url === rule.to) {
          notes.push(`«${label}» artıq yenidir`);
          return keepLink(l);
        }
        if (!rule.old.includes(url)) {
          notes.push(`«${label}»: admin ünvanı dəyişib (${url}) — toxunulmadı`);
          return keepLink(l);
        }
        esasChanged = true;
        notes.push(`«${label}» → ${rule.to}`);
        return { ...keepLink(l), url: rule.to };
      }),
    })),
  }));
  if (esasChanged) data.esasMenyu = esas;

  // Footer: «Akademiya» sütununda «Akkreditasiya».
  let footChanged = false;
  const foot = ((menu.footerMenyusu as Row[]) ?? []).map((c) => ({
    id: c.id,
    title: c.title,
    links: ((c.links as Row[]) ?? []).map((l) => {
      const label = str(l.label);
      const url = str(l.url);
      if (!(label === 'Akkreditasiya' || url === OLD.footer[0])) return keepLink(l);
      if (url === CERT_URL) {
        notes.push('footer «Akkreditasiya» artıq yenidir');
        return keepLink(l);
      }
      if (!OLD.footer.includes(url)) {
        notes.push(`footer «Akkreditasiya»: admin ünvanı dəyişib (${url}) — toxunulmadı`);
        return keepLink(l);
      }
      footChanged = true;
      notes.push(`footer «Akkreditasiya» → ${CERT_URL}`);
      return { ...keepLink(l), url: CERT_URL };
    }),
  }));
  if (footChanged) data.footerMenyusu = foot;

  if (Object.keys(data).length) await docs.update({ documentId: menu.documentId, data });
  await store.set({ key: MENU_MARKER, value: true });
  strapi.log.info(`[menu] F5.51: ${notes.length ? notes.join('; ') : 'sertifikat keçidləri tapılmadı — toxunulmadı'}.`);
}

// ── Admin formasının düzümü ─────────────────────────────────────────────────
type Cell = { name: string; size: number };
type Conf = { settings: Row; metadatas: Row; layouts: { edit: Cell[][] } & Row };
const LAYOUT_MARKER = 'certLayout:v1';
const ITEM_LAYOUT: Cell[][] = [
  [{ name: 'title', size: 12 }],
  [{ name: 'titleEn', size: 6 }, { name: 'titleRu', size: 6 }],
  [{ name: 'short', size: 4 }, { name: 'shortEn', size: 4 }, { name: 'shortRu', size: 4 }],
  [{ name: 'image', size: 6 }, { name: 'file', size: 6 }],
  [{ name: 'footer', size: 4 }, { name: 'hidden', size: 4 }],
];

export async function placeCertFields(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: LAYOUT_MARKER })) === true) return;
  const done: string[] = [];
  const comps = strapi.plugin('content-manager').service('components') as unknown as {
    findComponent: (uid: string) => { uid: string } | null | undefined;
    findConfiguration: (c: { uid: string }) => Promise<Conf>;
    updateConfiguration: (c: { uid: string }, conf: Conf) => Promise<unknown>;
  };
  const c = comps.findComponent('cert.item');
  if (c) {
    const conf = await comps.findConfiguration(c);
    const have = (conf.layouts?.edit ?? []).flat().map((x) => x.name);
    const need = ITEM_LAYOUT.flat().map((x) => x.name);
    // Yalnız eyni sahə dəsti — admin sahə əlavə edib/silibsə toxunulmur.
    if (have.length === need.length && need.every((n) => have.includes(n))) {
      conf.layouts.edit = ITEM_LAYOUT;
      await comps.updateConfiguration(c, { settings: conf.settings, metadatas: conf.metadatas, layouts: conf.layouts });
      done.push('cert.item');
    }
  }
  // Tək tipin başlığı: mətn sahəsi olmayanda Strapi documentId göstərir — «id» olanda tipin adı.
  const cts = strapi.plugin('content-manager').service('content-types') as unknown as {
    findContentType: (uid: string) => { uid: string } | null;
    findConfiguration: (ct: { uid: string }) => Promise<Conf>;
    updateConfiguration: (ct: { uid: string }, conf: Conf) => Promise<unknown>;
  };
  for (const uid of [UID, 'api::org-block.org-block']) {
    const ct = cts.findContentType(uid);
    if (!ct) continue;
    const conf = await cts.findConfiguration(ct);
    const main = conf.settings?.mainField;
    if (main && main !== 'documentId') continue;
    conf.settings = { ...conf.settings, mainField: 'id' };
    await cts.updateConfiguration(ct, { settings: conf.settings, metadatas: conf.metadatas, layouts: conf.layouts });
    done.push(uid);
  }
  await store.set({ key: LAYOUT_MARKER, value: true });
  strapi.log.info(`[cert] F5.51: admin formaları düzüldü: ${done.length ? done.join(', ') : 'toxunulmadı'}.`);
}
