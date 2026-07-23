/**
 * F2.6d/F2.6e — Düzəliş lifecycle (hardening).
 *
 * F2.6d: public `create` açıq olduğu üçün göndərən `status` / `moderatorNote`
 * sahələrini inject edə bilməsin deyə hər yeni düzəliş MƏCBURİ "pending" başlayır.
 *
 * F2.6e əlavəsi:
 *  - Nəzarət simvolları silinir, uzunluqlar kəsilir (injection / log-forging).
 *  - `targetSlug` slug formatına uyğun olmalıdır.
 *  - `verified` MÜŞTƏRİDƏN QƏBUL EDİLMİR — yalnız `identity` bağlantısından törəyir.
 *
 * Standalone kompilyasiya olunur — @strapi/strapi tipləri import EDİLMİR.
 */
type Data = Record<string, unknown>;
type Event = { params: { data?: Data } };

const TARGETS = ['article', 'announcement', 'event', 'milestone', 'page', 'general'];
const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,198}[a-z0-9])?$/;

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

  if (data.targetType !== undefined && TARGETS.indexOf(String(data.targetType)) === -1) {
    data.targetType = 'general';
  }
  if (typeof data.targetSlug === 'string') {
    const slug = clean(data.targetSlug, 200).toLowerCase();
    if (isCreate && slug && !SLUG_RE.test(slug)) {
      throw new Error('correction: targetSlug formati yanlisdir');
    }
    data.targetSlug = slug;
  }
  if (data.fieldPath !== undefined) data.fieldPath = clean(data.fieldPath, 200);
  if (data.currentValue !== undefined) data.currentValue = clean(data.currentValue, 5000);
  if (data.suggestedValue !== undefined) data.suggestedValue = clean(data.suggestedValue, 5000);
  if (data.reason !== undefined) data.reason = clean(data.reason, 1000);
  if (data.submitterName !== undefined) data.submitterName = clean(data.submitterName, 120);

  if (isCreate || data.verified !== undefined || data.identity !== undefined) {
    data.verified = data.identity !== undefined && data.identity !== null;
  }
}

export default {
  async beforeCreate(event: Event) {
    const data = event.params.data;
    sanitize(data, true);
    if (!data) return;
    data.status = 'pending';
    delete data.moderatorNote;
    if (!clean(data.suggestedValue, 5000)) {
      throw new Error('correction: suggestedValue bosdur');
    }
  },

  async beforeUpdate(event: Event) {
    sanitize(event.params.data, false);
  },
};
