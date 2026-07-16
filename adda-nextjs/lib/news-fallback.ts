// ── Xəbər fallback (Strapi əlçatmaz olduqda) ─────────────────────────
// TT Konvensiya 4: fallback DATA-əsaslı olmalıdır (əvvəl HTML string idi
// və {{NEWS_CARDS}} .replace-i translateStatic-dən SONRA gəldiyi üçün
// /ru və /en-də kartlar azərbaycanca qalırdı).
// Tarixlər ISO-dur → fmtDate() dilə uyğun formatlayır (əl ilə yazılmır).
// chip/title tr() ilə tərcümə olunur.
export type FallbackCard = { image: string; chip: string; date: string; title: string };

export const FALLBACK_NEWS: FallbackCard[] = [
  {
    image: 'https://images.unsplash.com/photo-1751779057940-43cc385452f7?fm=jpg&q=80&w=1600&auto=format&fit=crop',
    chip: 'Beynəlxalq',
    date: '2026-06-05',
    title: 'ADDA TURMARIN layihəsi çərçivəsində Türk dövlətləri ilə dənizçilik tədqiqat şəbəkəsi yaradır',
  },
  {
    image: 'https://images.unsplash.com/photo-1641467613990-b74163e280e3?fm=jpg&q=80&w=1200&auto=format&fit=crop',
    chip: 'Qəbul',
    date: '2026-06-01',
    title: '2026–2027 akademik ili üçün qəbul planı təsdiqləndi',
  },
  {
    image: 'https://images.unsplash.com/photo-1724597500306-a4cbb7d1324e?fm=jpg&q=80&w=1200&auto=format&fit=crop',
    chip: 'Tələbə həyatı',
    date: '2026-05-28',
    title: 'Tələbələr Xəzər dənizində təcrübə səfərini başa vurdu',
  },
  {
    image: 'https://images.unsplash.com/photo-1641467613990-b74163e280e3?fm=jpg&q=78&w=1200&h=700&fit=crop',
    chip: 'Elm və tədqiqat',
    date: '2026-05-18',
    title: 'Akademiya IAMU illik konfransında təmsil olundu',
  },
];
