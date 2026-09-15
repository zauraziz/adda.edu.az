/**
 * F5.31d — Appeal kontrolleri (create override).
 *
 * Default factory kontrolleri KAFİ deyil: `trackingCode` YARADILMALI
 * (ADDA-<il>-<ardıcıl>) və bildiriş e-poçtları göndərilməlidir (F5.31e).
 * Marşrut DƏYİŞMİR (`POST /api/appeals`, bax routes/appeal.ts — factory
 * router) — YALNIZ `create` əməliyyatı əvəz olunur.
 *
 * SƏTH: bu, Next.js-in `/api/submit/appeal` marşrutundan (F5.31d) çağırılır,
 * O ARTIQ honeypot/uzunluq yoxlamasını edib — bura YALNIZ gerçək sahələr
 * gəlməlidir. Buna baxmayaraq `data`-nı KOR-KORANƏ YAYMIRIQ (spread etmirik)
 * — yalnız GÖZLƏNİLƏN açarlar oxunur, çağıran YERİ ETİBAR EDİLMƏSƏ belə
 * (məs. admin panelindən sınaq) əlavə/yad sahə keçə bilməz.
 *
 * Ardıcıl nömrə HƏSABLANMASI sadədir (DB oxuma + say), TAM ATOMİK DEYİL —
 * eyni anda iki müraciət nəzəri cəhətdən eyni nömrəni ala bilər. `schema.json`-
 * dakı `unique: true` toqquşmanı DB səviyyəsində tutur; bu halda ikinci
 * cəhd bir addım irəli sürüşdürülür (aşağıda `MAX_RETRY`). Real yükdə
 * (universitet həcmi) bu, kifayət qədər etibarlıdır — "sadə" tələbinə uyğun.
 */
import { factories } from '@strapi/strapi';

type Row = Record<string, unknown>;

interface Ctx {
  request: { body?: unknown };
  body: unknown;
  status: number;
}

interface StrapiLike {
  documents(uid: string): {
    create(args: Row): Promise<Row>;
    findMany(args: Row): Promise<Row[]>;
  };
  log: { info(m: string): void; warn(m: string): void; error(m: string): void };
}

const APPEAL_TYPES = ['sual', 'teklif', 'erize', 'sikayet'];
const UID = 'api::appeal.appeal';
const MAX_RETRY = 3;

function bodyOf(ctx: Ctx): Row {
  const raw = ctx.request.body;
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const b = raw as Row;
    const data = b.data;
    if (data && typeof data === 'object' && !Array.isArray(data)) return data as Row;
  }
  return {};
}

function str(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

/** Cari ilin `ADDA-<il>-` prefiksli ən son sıra nömrəsi + 1. */
async function nextTrackingCode(strapi: StrapiLike, attempt: number): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = 'ADDA-' + year + '-';
  const rows = (await strapi.documents(UID).findMany({
    filters: { trackingCode: { $startsWith: prefix } },
    fields: ['trackingCode'],
    limit: 10000,
  })) as Array<{ trackingCode?: string }>;
  const seq = rows.length + 1 + attempt;
  return prefix + String(seq).padStart(4, '0');
}

export default factories.createCoreController(UID, ({ strapi }: { strapi: StrapiLike }) => ({
  async create(ctx: Ctx) {
    const b = bodyOf(ctx);

    const appealType = str(b.appealType, 20);
    if (APPEAL_TYPES.indexOf(appealType) === -1) {
      ctx.status = 400;
      ctx.body = { ok: false, error: 'bad_appeal_type' };
      return;
    }

    const data: Row = {
      appealType,
      firstName: str(b.firstName, 100),
      lastName: str(b.lastName, 100),
      patronymic: str(b.patronymic, 100),
      email: str(b.email, 254),
      phone: str(b.phone, 40),
      address: str(b.address, 300),
      subject: str(b.subject, 300),
      message: str(b.message, 5000),
    };
    if (!data.firstName || !data.lastName || !data.email || !data.phone || !data.subject || !data.message) {
      ctx.status = 400;
      ctx.body = { ok: false, error: 'missing_fields' };
      return;
    }

    const targetUnit = str(b.targetUnit, 40);
    if (targetUnit) data.targetUnit = targetUnit;

    let created: Row | null = null;
    let lastErr: unknown = null;
    for (let attempt = 0; attempt < MAX_RETRY; attempt++) {
      const trackingCode = await nextTrackingCode(strapi, attempt);
      try {
        created = await strapi.documents(UID).create({ data: { ...data, trackingCode } });
        break;
      } catch (err) {
        lastErr = err;
        // unique toqquşması ola bilər — növbəti cəhddə sıra +1 sürüşür.
      }
    }

    if (!created) {
      strapi.log.error('[appeal] yaradila bilmedi: ' + (lastErr as Error)?.message);
      ctx.status = 500;
      ctx.body = { ok: false, error: 'create_failed' };
      return;
    }

    // F5.31e-də bildiriş e-poçtu BURAYA əlavə olunacaq (müraciət artıq
    // qeydə alınıb, e-poçt bunun davamıdır — ayrıca commit).

    ctx.status = 200;
    ctx.body = { ok: true, trackingCode: created.trackingCode };
  },
}));
