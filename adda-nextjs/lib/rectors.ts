// K27c — sabiq rektorlar: köməkçilər.
//
// MƏZMUN BURADA DEYİL. Əsas mənbə Strapi-dir (`api::rector.rector`);
// ehtiyat surəti `rectors-fallback.ts`-dədir və `tools/rectors/sync.mjs`
// tərəfindən CANLI Strapi-dən generasiya olunur.
//
// NİYƏ AYRILDI: admin paneldə yeni rektor əlavə olunanda ehtiyat surəti
// köhnəlirdi və Render yuxuya gedəndə həmin rektor səhifədən yox olurdu.
// İndi `node tools/rectors/sync.mjs` bir əmrlə surəti yeniləyir. Bu fayl
// əl ilə yazılıb qalır — sync onun üzərinə yazmır.
import type { Rector } from './strapi';

export { RECTORS_FALLBACK } from './rectors-fallback';

/**
 * Səhifə lid cümləsi — `tr()` lüğətindən keçir.
 *
 * SAY VƏ İL DİAPAZONU YOXDUR. Əvvəlki variant «1997–2024 … dörd rektor»
 * yazırdı; beşinci qeyd əlavə olunan kimi mətn yalan oldu. Məzmun admin
 * paneldən dəyişdiyi üçün lid mətni ona bağlı olmamalıdır.
 */
export const RECTORS_LEAD =
  'Akademiyaya rəhbərlik etmiş rektorlar — fəaliyyət dövrləri, elmi dərəcələri və bioqrafiyaları.';

/**
 * Ad → monoqram. Portret arxivi hazır olana qədər lövhədə bu göstərilir.
 * `toUpperCase()` İŞLƏDİLMİR: Azərbaycan dilində `I`/`ı` və `İ`/`i`
 * cütləri JS-in defolt qaydası ilə korlanır. Adlar onsuz da baş hərflə
 * başlayır, ona görə sadəcə ilk hərflər götürülür.
 */
export function monogram(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((p) => Array.from(p)[0] ?? '').join('');
}

/** `termTo` boşdursa rektor HƏLƏ VƏZİFƏDƏDİR. */
export function isCurrent(termTo: number | null | undefined): boolean {
  return termTo === null || termTo === undefined;
}

/**
 * Fəaliyyət dövrü etiketi. Vəzifədə olan üçün interval AÇIQ qalır
 * («2024–»); uydurma bitmə ili yazılmır.
 */
export function termLabel(termFrom: number, termTo: number | null | undefined): string {
  return isCurrent(termTo) ? `${termFrom}\u2013` : `${termFrom}\u2013${termTo}`;
}

/**
 * Varislik sırası.
 *
 * `termFrom` ƏSAS açardır — xronologiya məlumatın öz xassəsidir və
 * editorun əl ilə nömrə yazmasından asılı olmamalıdır. Strapi-də yeni
 * qeydin `sortOrder`-i defolt 0-dır: köhnə sıralama (yalnız `sortOrder`)
 * belə qeydi siyahının BAŞINA atırdı.
 *
 * `sortOrder` yalnız eyni ildə başlayan iki qeyd üçün əl ilə düzəlişdir.
 */
export function bySuccession(a: Rector, b: Rector): number {
  if (a.termFrom !== b.termFrom) return a.termFrom - b.termFrom;
  const ao = a.sortOrder ?? 0;
  const bo = b.sortOrder ?? 0;
  if (ao !== bo) return ao - bo;
  return a.slug.localeCompare(b.slug, 'az');
}
