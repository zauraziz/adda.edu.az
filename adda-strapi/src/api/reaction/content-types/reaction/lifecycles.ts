/**
 * F2.6e — Reaksiya lifecycle (hardening + dedupe).
 *
 * PROBLEM (F2.6c-də açıq qalmışdı): `/api/reactions` public `create`-dir və heç bir
 * təkrar qoruması yox idi — eyni `sessionId` eyni məzmuna sonsuz reaksiya yaza bilirdi.
 *
 * HƏLL: `fingerprint` = sha256(targetType|targetSlug|emoji|sessionId), sxemdə `unique`.
 * Təkrarı BAZA rədd edir və Strapi bunu avtomatik 400 ValidationError-a çevirir —
 * lifecycle-də xəta formalaşdırmağa ehtiyac qalmır. Reaksiyalar anonim qalır
 * (kimlik tələb olunmur) — sürət limiti `rate-limit` middleware-indədir.
 *
 * Standalone kompilyasiya olunur — @strapi/strapi tipləri import EDİLMİR.
 */
import { createHash } from 'node:crypto';

type Data = Record<string, unknown>;
type Event = { params: { data?: Data } };

const TARGETS = ['article', 'announcement', 'event', 'milestone'];
const EMOJIS = ['anchor', 'ship', 'compass', 'wave'];
const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,198}[a-z0-9])?$/;

function clean(raw: unknown, max: number): string {
  if (typeof raw !== 'string') return '';
  let out = '';
  for (const ch of raw) {
    const c = ch.codePointAt(0) as number;
    if (c < 32 || (c >= 127 && c <= 159)) continue;
    out += ch;
  }
  return out.trim().slice(0, max);
}

export function fingerprintOf(targetType: string, targetSlug: string, emoji: string, sessionId: string): string {
  return createHash('sha256')
    .update([targetType, targetSlug, emoji, sessionId].join('|'), 'utf8')
    .digest('hex');
}

export default {
  async beforeCreate(event: Event) {
    const data = event.params.data;
    if (!data) return;

    const targetType = clean(data.targetType, 40);
    const targetSlug = clean(data.targetSlug, 200).toLowerCase();
    const emoji = clean(data.emoji, 20);
    const sessionId = clean(data.sessionId, 100);

    if (TARGETS.indexOf(targetType) === -1) throw new Error('reaction: targetType yanlisdir');
    if (EMOJIS.indexOf(emoji) === -1) throw new Error('reaction: emoji yanlisdir');
    if (!SLUG_RE.test(targetSlug)) throw new Error('reaction: targetSlug formati yanlisdir');
    if (sessionId.length < 8) throw new Error('reaction: sessionId cox qisadir');

    data.targetType = targetType;
    data.targetSlug = targetSlug;
    data.emoji = emoji;
    data.sessionId = sessionId;
    data.fingerprint = fingerprintOf(targetType, targetSlug, emoji, sessionId);
  },

  async beforeUpdate(event: Event) {
    const data = event.params.data;
    if (!data) return;
    // Barmaq izi yalnız törəmə sahədir — əl ilə dəyişdirilməsinə icazə verilmir.
    delete data.fingerprint;
  },
};
