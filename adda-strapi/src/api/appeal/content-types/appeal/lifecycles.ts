/**
 * F5.31a — Appeal lifecycle (hardening).
 *
 * `rsvp`/`correction` üçün F2.6e-də qurulan pattern-in eynisi (bax
 * ../../rsvp/content-types/rsvp/lifecycles.ts): bu qat SON müdafiə
 * xəttidir — nəzarətçi (F5.31d) artıq təmizləyir, amma admin panelindən
 * gələn yazılar da buradan keçir.
 *
 *  - Nəzarət simvolları silinir, uzunluqlar kəsilir (injection / log-forging).
 *  - `appealType`/`status` whitelist-dən kənar dəyər ATILIR (schema enum
 *    validasiyası onsuz da var, bura TƏKRAR yoxlamadır).
 *  - `isFormal` MÜŞTƏRİDƏN QƏBUL EDİLMİR — həmişə `appealType`-dan törəyir.
 *  - `status` YARADILARKƏN həmişə "yeni"dir, müştəri dəyəri NƏZƏRƏ ALINMIR.
 *  - `submittedAt` YARADILARKƏN serverdə təyin olunur.
 *  - `trackingCode` — FORMATI yoxlanılır (`ADDA-YYYY-NNNN`), uyğun gəlməyən
 *    dəyər (o cümlədən müştərinin göndərdiyi ISTƏNİLƏN sərbəst mətn) SİLİNİR.
 *    Kontroller (F5.31d, bax appeal/controllers/appeal.ts) YARADILMAZDAN
 *    ƏVVƏL düzgün formatlı kodu özü hesablayıb `data`-ya qoyur — bura ONU
 *    SİLMİR, yalnız formatı yanlış olanı. `unique: true` (schema) toqquşma
 *    ehtimalını DB səviyyəsində bağlayır.
 *  - `respondedAt` YARADILARKƏN həmişə boşdur — yalnız admin panelində
 *    cavab veriləndə doldurulur.
 *  - F5.32f — `internalNote`/`assignedTo` YARADILARKƏN həmişə silinir:
 *    bunlar ADMİN AXINI sahələridir (daxili qeyd/təyin edilmiş şəxs),
 *    müraciət EDƏN tərəfindən DEYİL, YALNIZ admin panelində sonradan
 *    doldurulur. Kontroller (F5.31d) onsuz da bunları müştəridən oxumur —
 *    bura İKİNCİ müdafiə qatıdır (məs. gələcəkdə `update` icazəsi
 *    səhvən açılarsa belə).
 *
 * Standalone kompilyasiya olunur — @strapi/strapi tipləri import EDİLMİR.
 */
type Data = Record<string, unknown>;
type Event = { params: { data?: Data } };

const APPEAL_TYPES = ['sual', 'teklif', 'erize', 'sikayet'];
const STATUSES = ['yeni', 'baxilir', 'cavablandi', 'bagli'];
const TRACKING_RE = /^ADDA-\d{4}-\d{4,}$/;

function clean(raw: unknown, max: number): string {
  if (typeof raw !== 'string') return '';
  let out = '';
  for (const ch of raw) {
    const c = ch.codePointAt(0) as number;
    if (c === 9 || c === 10) { out += ch; continue; }
    if (c < 32 || (c >= 127 && c <= 159)) continue;
    out += ch;
  }
  return out.trim().slice(0, max);
}

function sanitize(data: Data | undefined, isCreate: boolean): void {
  if (!data) return;

  if (data.firstName !== undefined) data.firstName = clean(data.firstName, 100);
  if (data.lastName !== undefined) data.lastName = clean(data.lastName, 100);
  if (data.patronymic !== undefined) data.patronymic = clean(data.patronymic, 100);
  if (data.email !== undefined) data.email = clean(data.email, 254);
  if (data.phone !== undefined) data.phone = clean(data.phone, 40);
  if (data.address !== undefined) data.address = clean(data.address, 300);
  if (data.subject !== undefined) data.subject = clean(data.subject, 300);
  if (data.message !== undefined) data.message = clean(data.message, 5000);

  if (data.appealType !== undefined && APPEAL_TYPES.indexOf(String(data.appealType)) === -1) {
    delete data.appealType;
  }
  if (data.status !== undefined && STATUSES.indexOf(String(data.status)) === -1) {
    delete data.status;
  }

  // F5.31a — derivə olunan sahə, müştəridən DEYİL, appealType-dan.
  if (isCreate || data.appealType !== undefined) {
    data.isFormal = data.appealType !== undefined && data.appealType !== 'sual';
  }

  if (data.trackingCode !== undefined && !TRACKING_RE.test(String(data.trackingCode))) {
    delete data.trackingCode;
  }

  if (data.internalNote !== undefined) data.internalNote = clean(data.internalNote, 5000);

  if (isCreate) {
    data.status = 'yeni';
    data.submittedAt = new Date().toISOString();
    data.respondedAt = null;
    // F5.32f — admin axını sahələri, müraciət edən DOLDURMUR.
    delete data.internalNote;
    delete data.assignedTo;
  } else {
    // Yenilənmədə submittedAt DƏYİŞDİRİLMİR — yalnız yaradılış anını göstərir.
    delete data.submittedAt;
  }
}

export default {
  async beforeCreate(event: Event) {
    sanitize(event.params.data, true);
  },
  async beforeUpdate(event: Event) {
    sanitize(event.params.data, false);
  },
};
