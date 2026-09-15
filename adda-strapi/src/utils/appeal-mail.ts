/**
 * F5.31e — Müraciət bildirişləri (yeni appeal yaradılandan sonra).
 *
 * İKİ e-poçt:
 *  1. AİDİYYƏTİ ÜNVANA — `targetUnit` seçilibsə VƏ o bölmənin `email`-i
 *     doludursa ora, əks halda ümumi əlaqə ünvanına (F5.30a-da təsdiqlənmiş
 *     `info@adda.edu.az`, bax _components/Footer.tsx SITE_PHONE-un yanındakı
 *     eyni qərar — bir mənbə, iki səhifədə TƏKRARLANMASIN deyə burada da
 *     həmin ünvan HARDCODE olunub, Strapi-də ayrıca "əlaqə ünvanı" sahəsi yoxdur).
 *  2. MÜRACİƏT EDƏNƏ (təsdiq) — izləmə kodu + növ + qanuni müddət qeydi.
 *     Qeyd BURADA DA rəqəm YAZMIR (F5.31b/c-dəki eyni qayda) — YALNIZ
 *     səhifəyə keçid verir.
 *
 * `deliver()` identity xidmətindən İDXAL OLUNUR (Resend/Brevo/SMTP seçimi
 * TƏKRAR yazılmasın, bax ../api/identity/services/identity.ts). Xəta
 * BURDAN YUXARI ATILMIR — çağıran (appeal kontrolleri) artıq
 * `.catch(...)`-lə tutur, müraciət YARADILDIQDAN sonra e-poçt uğursuz
 * olsa belə istifadəçiyə xəta göstərilmir (qeyd artıq bazadadır).
 *
 * Standalone kompilyasiya olunur — @strapi/strapi tipləri import EDİLMİR.
 */
import { deliver } from '../api/identity/services/identity';

type Row = Record<string, unknown>;

interface StrapiLike {
  documents(uid: string): {
    findOne(args: Row): Promise<Row | null>;
  };
  log: { info(m: string): void; warn(m: string): void; error(m: string): void };
}

const FALLBACK_EMAIL = 'info@adda.edu.az';

const TYPE_LABEL: Record<string, string> = {
  sual: 'Sual',
  teklif: 'Təklif',
  erize: 'Ərizə',
  sikayet: 'Şikayət',
};

const SITE_URL = (process.env.SITE_URL || 'https://demo.adda.edu.az').replace(/\/+$/, '');

interface AppealRow {
  documentId: unknown;
  trackingCode: unknown;
  appealType: unknown;
  firstName: unknown;
  lastName: unknown;
  patronymic: unknown;
  email: unknown;
  phone: unknown;
  address: unknown;
  subject: unknown;
  message: unknown;
  targetUnit: unknown;
}

/** `targetUnit` seçilmiş bölmənin e-poçtu, yoxdursa ümumi ünvan. */
async function resolveTargetEmail(strapi: StrapiLike, appeal: AppealRow): Promise<string> {
  const rel = appeal.targetUnit as Row | string | null | undefined;
  const documentId = typeof rel === 'string' ? rel : (rel?.documentId as string | undefined);
  if (!documentId) return FALLBACK_EMAIL;

  try {
    const unit = await strapi.documents('api::unit.unit').findOne({
      documentId,
      fields: ['email'],
    });
    const email = unit?.email;
    return typeof email === 'string' && email ? email : FALLBACK_EMAIL;
  } catch {
    return FALLBACK_EMAIL;
  }
}

function fullName(appeal: AppealRow): string {
  return [appeal.firstName, appeal.patronymic, appeal.lastName]
    .filter((v) => typeof v === 'string' && v)
    .join(' ');
}

export async function notifyAppeal(strapi: StrapiLike, appealIn: unknown): Promise<void> {
  const appeal = appealIn as AppealRow;
  const trackingCode = String(appeal.trackingCode ?? '');
  const typeLabel = TYPE_LABEL[String(appeal.appealType)] ?? String(appeal.appealType);
  const name = fullName(appeal);
  const appealsUrl = SITE_URL + '/az/vetendaslarin-muracieti';

  const targetEmail = await resolveTargetEmail(strapi, appeal);
  const staffText = [
    'Yeni müraciət qeydə alındı: ' + trackingCode,
    '',
    'Növ: ' + typeLabel,
    'Ad Soyad: ' + name,
    'E-poçt: ' + String(appeal.email ?? ''),
    'Telefon: ' + String(appeal.phone ?? ''),
    appeal.address ? 'Ünvan: ' + String(appeal.address) : '',
    'Mövzu: ' + String(appeal.subject ?? ''),
    '',
    String(appeal.message ?? ''),
  ]
    .filter(Boolean)
    .join('\n');

  const staffResult = await deliver({
    to: targetEmail,
    subject: '[ADDA müraciət] ' + trackingCode + ' — ' + String(appeal.subject ?? ''),
    text: staffText,
  });
  if (staffResult.status !== 'sent') {
    strapi.log.warn('[appeal-mail] adiyyeti unvana getmedi (' + staffResult.status + '/' + staffResult.via + '): ' + trackingCode);
  }

  const submitterText = [
    'Hörmətli ' + name + ',',
    '',
    'Müraciətiniz qəbul edildi. İzləmə kodunuz: ' + trackingCode,
    'Növ: ' + typeLabel,
    '',
    'Baxılma müddəti hüquqi əsasda müəyyən olunur — ətraflı: ' + appealsUrl,
    '',
    'Azərbaycan Dövlət Dəniz Akademiyası',
  ].join('\n');

  const submitterEmail = typeof appeal.email === 'string' ? appeal.email : '';
  if (submitterEmail) {
    const r = await deliver({
      to: submitterEmail,
      subject: 'Müraciətiniz qəbul edildi — ' + trackingCode,
      text: submitterText,
    });
    if (r.status !== 'sent') {
      strapi.log.warn('[appeal-mail] tesdiq e-poctu getmedi (' + r.status + '/' + r.via + '): ' + trackingCode);
    }
  }
}
