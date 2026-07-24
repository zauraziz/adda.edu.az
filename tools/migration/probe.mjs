// MƏRHƏLƏ 0 — zondlama. TAM CRAWL-DAN ƏVVƏL BUNU İŞLƏT.
//
// Məqsəd: "bu ID mövcuddur" əlamətini TAPMAQ, təxmin etmək yox.
// Köhnə CMS-lər olmayan ID üçün çox vaxt 404 yox, 200 + boş şablon qaytarır.
// Zond aralıq boyu bərabər paylanmış nümunə götürür və status/ölçü paylanmasını
// göstərir — hədd (threshold) buradan görünür.
//
// İstifadə:
//   node probe.mjs                    # hər bölmədən 12 nümunə
//   node probe.mjs news 30            # yalnız xəbərlər, 30 nümunə
import { BASE, SECTIONS } from './config.mjs';
import { get } from './lib/http.mjs';

const [sectionArg, countArg] = process.argv.slice(2);
const sections = sectionArg ? [sectionArg] : Object.keys(SECTIONS);
const samples = Math.max(4, parseInt(countArg || '12', 10));

function pickIds(from, to, n) {
  if (to - from + 1 <= n) {
    const all = [];
    for (let i = from; i <= to; i++) all.push(i);
    return all;
  }
  const step = (to - from) / (n - 1);
  const out = new Set();
  for (let i = 0; i < n; i++) out.add(Math.round(from + i * step));
  return [...out].sort((a, b) => a - b);
}

for (const name of sections) {
  const section = SECTIONS[name];
  if (!section) {
    console.error(`Bilinmeyen bolme: ${name}. Movcud: ${Object.keys(SECTIONS).join(', ')}`);
    process.exit(1);
  }

  console.log(`\n=== ${name} (${section.label}) — ${section.from}..${section.to} ===`);
  console.log('   id | status |    bayt | basliq');
  console.log('------+--------+---------+------------------------------------------');

  const stats = [];
  for (const id of pickIds(section.from, section.to, samples)) {
    const res = await get(BASE + section.path('az', id));
    const m = res.body.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = (m ? m[1] : res.error || '').replace(/\s+/g, ' ').trim().slice(0, 42);
    stats.push({ id, status: res.status, bytes: res.bytes });
    console.log(
      String(id).padStart(5) + ' | ' + String(res.status).padStart(6) + ' | ' + String(res.bytes).padStart(7) + ' | ' + title
    );
  }

  const ok = stats.filter((s) => s.status === 200).map((s) => s.bytes).sort((a, b) => a - b);
  if (ok.length) {
    console.log(
      `\n  200 cavab: ${ok.length}/${stats.length} | min ${ok[0]} b | median ${ok[Math.floor(ok.length / 2)]} b | max ${ok[ok.length - 1]} b`
    );
    console.log('  -> min ile median arasinda boyuk ucurum varsa, kicikler BOS sablondur.');
    console.log('     Hemin heddi crawl.mjs --min-bytes=N ile ver.');
  }
}

console.log('\nZond bitdi. Neticeni Claude-a gonder ki, movcudluq qaydasi deqiqlessin.\n');
