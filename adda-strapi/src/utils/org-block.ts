/**
 * F5.49 — «Rəsmi qurumlar» (footer) admində idarə olunur: tək tip
 * `api::org-block.org-block` («3. Sayt — Rəsmi qurumlar»), təkrarlanan
 * komponent `org.item`: ad (az) + nameEn/nameRu, qısa ad (loqo yoxdursa
 * nişan), sayt, loqo, «Tabe olduğu qurum» (saytın ən yuxarısındakı zolaqda —
 * ASCO), «Gizlət». Sıra admində sürüklə-burax ilə dəyişir, qurum əlavə olunur
 * və silinir.
 *
 * Bu modul BİR DƏFƏ (store `adda-admin` → `orgBlock:v1`) siyahı boşdursa
 * əvvəlki koddakı 5 qurumu yazır (Footer.tsx ORGS). Siyahı doludursa (admin
 * artıq doldurub) toxunulmur. Loqoları redaktor yükləyir — kod loqo çəkmir.
 * Next.js ehtiyatı: adda-nextjs/lib/org-fallback.ts (EYNİ siyahı).
 */
import type { Core } from '@strapi/strapi';

type Row = Record<string, unknown>;

const UID = 'api::org-block.org-block';
const MARKER = 'orgBlock:v1';

export interface OrgSeed {
  name: string;
  nameEn: string;
  nameRu: string;
  short: string;
  url: string;
  parent: boolean;
}

export const DEFAULT_ORGS: OrgSeed[] = [
  {
    name: 'Rəqəmsal İnkişaf və Nəqliyyat Nazirliyi',
    nameEn: 'Ministry of Digital Development and Transport',
    nameRu: 'Министерство цифрового развития и транспорта',
    short: 'RİNN',
    url: 'https://mincom.gov.az',
    parent: false,
  },
  {
    name: 'Elm və Təhsil Nazirliyi',
    nameEn: 'Ministry of Science and Education',
    nameRu: 'Министерство науки и образования',
    short: 'ETN',
    url: 'https://edu.gov.az',
    parent: false,
  },
  {
    name: 'Dövlət Dəniz və Liman Agentliyi',
    nameEn: 'State Maritime and Port Agency',
    nameRu: 'Государственное агентство моря и портов',
    short: 'DDLA',
    url: 'https://ddla.gov.az',
    parent: false,
  },
  {
    name: 'Nəqliyyat və Kommunikasiya Holdinqi',
    nameEn: 'Transport and Communications Holding',
    nameRu: 'Транспортно-коммуникационный холдинг',
    short: 'AZCON',
    url: 'https://azcon.gov.az',
    parent: false,
  },
  {
    name: 'Azərbaycan Xəzər Dəniz Gəmiçiliyi QSC',
    nameEn: 'Azerbaijan Caspian Shipping Company CJSC',
    nameRu: 'ЗАО «Азербайджанское Каспийское морское пароходство»',
    short: 'ASCO',
    url: 'https://asco.az',
    parent: true,
  },
];

interface SingleDocs {
  findFirst: (a?: Row) => Promise<Row | null>;
  create: (a: Row) => Promise<Row>;
  update: (a: Row) => Promise<Row>;
}

export async function applyOrgBlockV1(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: MARKER })) === true) return;

  const docs = strapi.documents(UID as never) as unknown as SingleDocs;
  const cur = await docs.findFirst({ populate: ['items'] });
  const items = Array.isArray(cur?.items) ? (cur?.items as Row[]) : [];
  if (items.length) {
    await store.set({ key: MARKER, value: true });
    strapi.log.info(`[org] F5.49: «Rəsmi qurumlar» artıq doludur (${items.length}) — toxunulmadı.`);
    return;
  }

  const data = { items: DEFAULT_ORGS.map((o) => ({ ...o, hidden: false })) };
  if (cur?.documentId) await docs.update({ documentId: cur.documentId, data });
  else await docs.create({ data });

  await store.set({ key: MARKER, value: true });
  strapi.log.info(
    `[org] F5.49: «Rəsmi qurumlar» admində idarə olunur — ${DEFAULT_ORGS.length} qurum yazıldı ` +
      '(«3. Sayt — Rəsmi qurumlar»; loqoları orada yükləyin, ASCO «Tabe olduğu qurum» kimi yuxarı zolaqdadır).',
  );
}
