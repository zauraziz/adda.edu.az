/**
 * F2.6e — RSVP lifecycle (hardening).
 *
 * `correction` üçün F2.6d-də qurulan pattern-in eynisi, RSVP-yə tətbiq olunur.
 * Bu qat SON müdafiə xəttidir: nəzarətçi artıq təmizləyir, amma admin panelindən
 * və (IDENTITY_ENFORCE söndürülü ikən) public `create`-dən gələn yazılar da buradan keçir.
 *
 *  - Nəzarət simvolları silinir, uzunluqlar kəsilir (injection / log-forging).
 *  - `guests` 0..10 aralığına sıxılır.
 *  - `verified` MÜŞTƏRİDƏN QƏBUL EDİLMİR — yalnız `identity` bağlantısından törəyir.
 *
 * Standalone kompilyasiya olunur — @strapi/strapi tipləri import EDİLMİR.
 */
type Data = Record<string, unknown>;
type Event = { params: { data?: Data } };

const STATUSES = ['going', 'maybe', 'declined'];
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

function clamp(raw: unknown, min: number, max: number, fallback: number): number {
  const n = typeof raw === 'number' ? raw : parseInt(String(raw ?? ''), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

function sanitize(data: Data | undefined, isCreate: boolean): void {
  if (!data) return;

  if (typeof data.eventSlug === 'string') {
    const slug = clean(data.eventSlug, 200).toLowerCase();
    if (isCreate && !SLUG_RE.test(slug)) {
      throw new Error('rsvp: eventSlug formati yanlisdir');
    }
    data.eventSlug = slug;
  }
  if (data.eventTitle !== undefined) data.eventTitle = clean(data.eventTitle, 300);
  if (data.name !== undefined) data.name = clean(data.name, 120);
  if (data.note !== undefined) data.note = clean(data.note, 1000);
  if (data.guests !== undefined) data.guests = clamp(data.guests, 0, 10, 0);

  if (data.status !== undefined && STATUSES.indexOf(String(data.status)) === -1) {
    data.status = 'going';
  }

  // Nişan saxtalaşdırıla bilməz: yalnız kimlik bağlantısı varsa true.
  if (isCreate || data.verified !== undefined || data.identity !== undefined) {
    data.verified = data.identity !== undefined && data.identity !== null;
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
