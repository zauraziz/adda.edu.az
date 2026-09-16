/**
 * F5.31d/F5.32e — Appeal kontrolleri (create override).
 *
 * Default factory kontrolleri KAFİ deyil: `trackingCode` YARADILMALI
 * (ADDA-<il>-<ardıcıl>), bildiriş e-poçtları göndərilməlidir (F5.31e) və
 * OPSİONAL fayl əlavəsi server tərəfdə YOXLANILIB yüklənməlidir (F5.32e).
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
 *
 * FAYL ƏLAVƏSİ (F5.32e) — `api::identity.identity`-nin `uploadPhoto`
 * (profile/photo) ilə EYNİ üsul: fayl base64 kimi JSON gövdəsində gəlir
 * (magic-bayt yoxlaması üçün onsuz da yaddaşa oxunmalıdır, multipart əlavə
 * addım olardı — bax config/middlewares.ts `jsonLimit` şərhi). MIME
 * KLİENTİN dediyi DEYİL, FAYLIN İLK BAYTLARINDAN təyin olunur (`sniffFile`)
 * — Content-Type başlığı saxtalaşdırıla bilər, ilk baytlar saxtalaşdırılsa
 * fayl artıq açılmaz. `refId`/`ref`/`field` yükləmə çağırışına QƏSDƏN
 * VERİLMİR (identity.ts-dəki EYNİ tələ: `documentId` sətri ilə əlaqə
 * qurulmur) — əvəzinə yüklənmiş faylın ədədi `id`-si birbaşa `data.attachment`-ə
 * yazılır (appeal hələ yaradılmayıb, ona görə UPLOAD → sonra CREATE sırası,
 * photo axınındakı "CREATE artıq var, sonra UPLOAD+UPDATE" sırasından FƏRQLİ).
 */
import { writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { factories } from '@strapi/strapi';
import { notifyAppeal } from '../../../utils/appeal-mail';

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
    // notifyAppeal (utils/appeal-mail.ts) targetUnit-in e-poçtunu tapmaq
    // üçün işlədir — bura strukturca uyğun gəlsin deyə əlavə olunub.
    findOne(args: Row): Promise<Row | null>;
  };
  plugin(name: string): {
    service(name: string): { upload(args: Row): Promise<Row | Row[]> };
  };
  log: { info(m: string): void; warn(m: string): void; error(m: string): void };
}

const APPEAL_TYPES = ['sual', 'teklif', 'erize', 'sikayet'];
const UID = 'api::appeal.appeal';
const MAX_RETRY = 3;
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

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

/**
 * F5.32e — icazəli 5 tip, İLK BAYTLARDAN (magic bytes), Content-Type-dan
 * DEYİL. DOC/DOCX-in konteyner formatları (OLE2/ZIP) digər Office
 * fayllarıyla (xls/ppt, xlsx/pptx) PAYLAŞILIR — daxili stream/açar
 * adlarını oxumaq (dəqiq ayrım üçün) bu "sadə" tələbin əhatəsindən
 * kənardır; konteyner səviyyəsində yoxlama əsas hədəfi (icra oluna bilən
 * fayl gizlədilməsini) bağlayır. SVG QƏSDƏN İCAZƏLİ DEYİL (identity.ts-
 * dəki eyni səbəb: icra oluna bilən <script> XSS riski).
 */
function sniffFile(buf: Buffer): { mime: string; ext: string } | null {
  if (buf.length < 8) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { mime: 'image/jpeg', ext: 'jpg' };
  }
  if (
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) {
    return { mime: 'image/png', ext: 'png' };
  }
  if (buf.toString('ascii', 0, 4) === '%PDF') {
    return { mime: 'application/pdf', ext: 'pdf' };
  }
  if (
    buf[0] === 0xd0 && buf[1] === 0xcf && buf[2] === 0x11 && buf[3] === 0xe0 &&
    buf[4] === 0xa1 && buf[5] === 0xb1 && buf[6] === 0x1a && buf[7] === 0xe1
  ) {
    return { mime: 'application/msword', ext: 'doc' };
  }
  if (buf[0] === 0x50 && buf[1] === 0x4b && (buf[2] === 0x03 || buf[2] === 0x05 || buf[2] === 0x07)) {
    return {
      mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ext: 'docx',
    };
  }
  return null;
}

/**
 * Base64 (data-url prefiksi ilə/siz) əlavəni yükləyir, `data.attachment`-ə
 * ədədi `id`-ni yazır. Tip/ölçü səhvdirsə `error` qaytarır (çağıran 400 ilə
 * cavab verir) — appeal BU HALDA YARADILMIR (fail-fast, yarımçıq qeyd yox).
 */
async function attachIfPresent(
  strapi: StrapiLike,
  raw: unknown,
  data: Row,
): Promise<{ error?: string }> {
  if (typeof raw !== 'string' || !raw) return {};

  const b64 = raw.replace(/^data:[^;]+;base64,/, '');
  let buf: Buffer;
  try {
    buf = Buffer.from(b64, 'base64');
  } catch {
    return { error: 'bad_attachment_encoding' };
  }
  if (!buf.length || buf.length > MAX_ATTACHMENT_BYTES) {
    return { error: 'attachment_too_large' };
  }

  const kind = sniffFile(buf);
  if (!kind) {
    return { error: 'bad_attachment_type' };
  }

  // Ad İSTİFADƏÇİDƏN GƏLMİR (yol keçidi / icra olunan uzantı riski,
  // identity.ts-dəki eyni qayda) — vaxt damğası kifayətdir.
  const name = 'appeal-' + Date.now() + '.' + kind.ext;
  const tmp = join(tmpdir(), name);
  try {
    writeFileSync(tmp, buf);
    const res = await strapi.plugin('upload').service('upload').upload({
      data: {},
      files: { filepath: tmp, originalFilename: name, mimetype: kind.mime, size: buf.length },
    });
    const uploaded = Array.isArray(res) ? res[0] : res;
    data.attachment = uploaded?.id;
    return {};
  } catch (err) {
    strapi.log.error('[appeal] elave yuklenmedi: ' + (err as Error).message);
    return { error: 'attachment_upload_failed' };
  } finally {
    try { unlinkSync(tmp); } catch { /* temizlik — xetasi emeliyyati dayandirmir */ }
  }
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
    if (!data.firstName || !data.lastName || !data.patronymic || !data.email || !data.phone || !data.subject || !data.message) {
      ctx.status = 400;
      ctx.body = { ok: false, error: 'missing_fields' };
      return;
    }

    const targetUnit = str(b.targetUnit, 40);
    if (targetUnit) data.targetUnit = targetUnit;

    const attach = await attachIfPresent(strapi, b.attachment, data);
    if (attach.error) {
      ctx.status = 400;
      ctx.body = { ok: false, error: attach.error };
      return;
    }

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

    // F5.31e — bildiriş e-poçtları. Müraciət ARTIQ QEYDƏ ALINIB — e-poçt
    // uğursuz olsa belə istifadəçiyə xəta göstərilmir, yalnız log yazılır.
    notifyAppeal(strapi, created).catch((err: Error) => {
      strapi.log.error('[appeal] bildiris xetasi: ' + err.message);
    });

    ctx.status = 200;
    ctx.body = { ok: true, trackingCode: created.trackingCode };
  },
}));
