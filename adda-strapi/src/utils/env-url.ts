/**
 * F5.60 — mühit dəyişənindəki ünvan (SITE_URL, ADMIN_PUBLIC_URL, LEGACY_SITE_URL).
 *
 * REAL HADİSƏ (F5.14-də kimlik məktubu, 28.10.2026-da sayt yeniləməsi): Render-də
 * SITE_URL markdown keçidi kimi yazılıb — «[https://demo.adda.edu.az](https://demo.adda.edu.az)».
 * Çatdan və ya sənəddən kopyalananda mətn keçidə çevrilir, mənbəyi düşür. Kimlik
 * servisi dəyəri təmizləyirdi, sayt yeniləməsi (site-revalidate.ts) isə YOX: hər dərcdən
 * sonra «Failed to parse URL from [https://…](https://…)/api/revalidate», sayt keşi
 * 1 günə qədər köhnə qalırdı.
 *
 * Qayda: markdown, <…>, ətraf dırnaqlar və sondakı «/» atılır; nəticə http(s) ünvanı
 * deyilsə — defolt. Yanlış yazılış açılışda logda (site-revalidate.ts → envUrlIssue).
 */

/** «[mətn](url)», «<url>», dırnaqlı yazılış → url (sondakı «/» olmadan). */
export function cleanUrl(raw: unknown): string {
  let v = String(raw ?? '').trim();
  const md = v.match(/^\[[^\]]*\]\(([^)]+)\)/);
  if (md) v = md[1].trim();
  v = v.replace(/^<+/, '').replace(/>+$/, '');
  v = v.replace(/^["']+/, '').replace(/["']+$/, '');
  return v.replace(/\/+$/, '').trim();
}

export function isHttpUrl(v: string): boolean {
  try {
    const u = new URL(v);
    return (u.protocol === 'https:' || u.protocol === 'http:') && Boolean(u.hostname);
  } catch {
    return false;
  }
}

/** Env ünvanı təmizlənmiş; boş və ya etibarsızdırsa — defolt. */
export function envUrl(name: string, fallback: string): string {
  const v = cleanUrl(process.env[name]);
  return v && isHttpUrl(v) ? v : fallback;
}

/** Env dəyəri səhv yazılıbsa (təmizlənib və ya ünvan deyil) — log üçün qısa izah, yoxsa null. */
export function envUrlIssue(name: string): string | null {
  const raw = String(process.env[name] ?? '').trim();
  if (!raw) return null;
  const v = cleanUrl(raw);
  if (!v || !isHttpUrl(v)) return `${name} ünvan deyil («${raw.slice(0, 120)}») — defolt işlədilir`;
  if (raw.replace(/\/+$/, '') !== v) return `${name} səhv yazılıb («${raw.slice(0, 120)}»), işlədilən: ${v}`;
  return null;
}
