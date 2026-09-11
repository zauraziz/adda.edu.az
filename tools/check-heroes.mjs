// tools/check-heroes.mjs — F5.23b Qəhrəmanlarımız (`api::hero.hero`) vəziyyət
// yoxlayıcısı.
//
// NİYƏ LAZIMDIR: F5.21c-nin HERO_SEED bloku YALNIZ QARALAMAYA yazır
// (publish() heç çağırılmır) — bu skript o qaralamaların həqiqətən yaranıb-
// yaranmadığını, hansı dillərdə olduğunu və dərc statusunu göstərir.
//
// NİYƏ AVTORİZASİYA LAZIMDIR (digər check-*.mjs-lərdən FƏRQLİ olaraq):
// `api::hero.hero` `PUBLIC_READ_UIDS`-də DEYİL (adda-strapi/src/index.ts) —
// anonim sorğu 403 qaytarardı. Üstəlik `status=draft` HEÇ VAXT public API-də
// görünmür (Strapi-nin öz qaydasıdır, icazədən asılı olmayaraq) — draft
// vəziyyəti görmək üçün Full-access admin tokeni MƏCBURİDİR. Ona görə
// `tools/migration/lib/strapi.mjs`-dəki avtorizasiyalı `api()` işlədilir
// (digər check-*.mjs-lər anonim fetch işlədir, çünki onların tipləri
// public-oxunandır).
//
// BU SKRİPT HEÇ NƏYƏ TOXUNMUR — yalnız oxuyur.
//
//   node tools/check-heroes.mjs

import { api, assertToken, ping } from './migration/lib/strapi.mjs';

const LOCALES = ['az', 'ru', 'en'];
const STATUSES = ['draft', 'published'];

assertToken();
await ping();

console.log('='.repeat(72));
console.log('Qəhrəmanlarımız — dil × status matrisi');
console.log('='.repeat(72));

/** locale -> status -> sətirlər (uğurlu olanda) */
const results = new Map();
let anyRows = false;

for (const locale of LOCALES) {
  results.set(locale, new Map());
  for (const status of STATUSES) {
    const res = await api(
      'GET',
      `/api/heroes?locale=${locale}&status=${status}&sort=sortOrder:asc` +
        '&fields[0]=slug&fields[1]=name&fields[2]=publishedAt&fields[3]=sortOrder' +
        '&populate[honors]=true',
    );

    console.log('');
    console.log(`── locale=${locale} · status=${status} ` + '─'.repeat(Math.max(0, 40 - locale.length - status.length)));

    if (!res.ok) {
      // Tapşırığın tələb etdiyi hissə: API-nin öz xəta mesajı GÖSTƏRİLİR,
      // gizlədilmir və ya təxmin edilmir.
      const msg = res.data?.error?.message ?? res.error ?? ('HTTP ' + res.status);
      console.log('  XƏTA: ' + msg);
      continue;
    }

    const rows = res.data?.data ?? [];
    results.get(locale).set(status, rows);
    if (rows.length) anyRows = true;

    if (!rows.length) {
      console.log('  (boş)');
      continue;
    }

    for (const r of rows) {
      const honorsCount = Array.isArray(r.honors) ? r.honors.length : 0;
      // publishedAt DƏYİŞKƏN UZUNLUQDADIR (ISO möhür və ya "boş") — sütun
      // ardıcıllığında SONA qoyulur ki, uzun dəyər digər sütunları sürüşdürməsin.
      const publishedLabel = r.publishedAt ? 'dolu (' + r.publishedAt + ')' : 'boş';
      console.log(
        '  ' + (r.slug ?? '(slug yoxdur)').padEnd(45) +
          'honors: ' + String(honorsCount).padEnd(4) +
          (r.name ?? '').padEnd(35) +
          'publishedAt: ' + publishedLabel,
      );
    }
  }
}

console.log('');
console.log('='.repeat(72));
console.log('Xülasə (qeyd sayı, locale × status)');
console.log('='.repeat(72));
const header = 'locale'.padEnd(8) + STATUSES.map((s) => s.padEnd(12)).join('');
console.log(header);
for (const locale of LOCALES) {
  const byStatus = results.get(locale);
  const line = locale.padEnd(8) + STATUSES.map((s) => String(byStatus.get(s)?.length ?? '-').padEnd(12)).join('');
  console.log(line);
}

console.log('');
if (!anyRows) {
  console.log('Heç bir locale/status kombinasiyasında qeyd tapılmadı.');
  console.log('Ehtimal: HERO_SEED=true hələ deploy edilməyib, VƏ YA Strapi hələ yatıb (soyuq start).');
}
console.log('');
console.log('Bu skript HEÇ NƏYƏ TOXUNMADI — yalnız oxudu.');
