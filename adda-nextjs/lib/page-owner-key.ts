/**
 * F5.39 — səhifənin «məsul redaktor» açarı.
 *
 * Strapi-dəki EYNİ funksiyanın güzgüsü (adda-strapi/src/utils/page-owners.ts →
 * normalizePath/ownerKey). Biri dəyişəndə o biri də dəyişməlidir:
 *   /sehife/x və /hazirlanir/x → page:x  (eyni səhifə, hazırlanır → hazır)
 *   /struktur/x → unit:x, /ixtisaslar/x → program:x, /fakulteler/x → faculty:x,
 *   /emekdas/x → person:x, /auditoriyalar/x → facility:x,
 *   /qehremanlarimiz/x → hero:x, /sabiq-rektorlar/x → rector:x
 *   digərləri → path:/xeberler və s.
 */
const DETAIL: [RegExp, string][] = [
  [/^\/(?:sehife|hazirlanir)\/([^/]+)$/, 'page'],
  [/^\/struktur\/([^/]+)$/, 'unit'],
  [/^\/ixtisaslar\/([^/]+)$/, 'program'],
  [/^\/fakulteler\/([^/]+)$/, 'faculty'],
  [/^\/emekdas\/([^/]+)$/, 'person'],
  [/^\/auditoriyalar\/([^/]+)$/, 'facility'],
  [/^\/qehremanlarimiz\/([^/]+)$/, 'hero'],
  [/^\/sabiq-rektorlar\/([^/]+)$/, 'rector'],
];

export function normalizePath(raw: string): string | null {
  let p = (raw || '').trim();
  if (!p || p.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(p) || !p.startsWith('/')) return null;
  p = p.split('#')[0].split('?')[0];
  try {
    p = decodeURI(p);
  } catch {
    /* olduğu kimi */
  }
  p = p.replace(/\/{2,}/g, '/');
  if (p.length > 1) p = p.replace(/\/+$/, '');
  p = p.replace(/^\/(az|ru|en)(?=\/|$)/, '') || '/';
  return p.slice(0, 280);
}

export function ownerKey(raw: string): string | null {
  const p = normalizePath(raw);
  if (!p) return null;
  for (const [re, kind] of DETAIL) {
    const m = p.match(re);
    if (m) return `${kind}:${m[1].toLowerCase()}`;
  }
  return `path:${p}`;
}

export interface PageOwnerInfo {
  name: string;
  position: string | null;
  positionRu: string | null;
  positionEn: string | null;
  personSlug: string | null;
}
