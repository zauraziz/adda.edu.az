// `content` bölməsinin hədəf content type-a xəritəsi.
//
// NİYƏ LAZIMDIR: köhnə saytda hər şey `/content/{id}`-dir — şöbə də, prorektor da,
// ixtisas da. Strapi-də isə ayrı tiplər var. Xəritə canlı saytın öz sitemap-ından
// (23.07.2026) çıxarılıb; siyahıda olmayan ID standart olaraq `page` sayılır.
//
// SƏN DÜZƏLİŞ EDƏ BİLƏRSƏN: `node import.mjs --plan` əmri hər `content` sənədinin
// başlığını və təyin olunmuş tipini cədvəl kimi çap edir. Səhv varsa buranı düzəlt.

export const CONTENT_MAP = {
  // ── İXTİSASLAR -> program ──────────────────────────────────────────────
  58: 'program', // DƏNİZ NAVİQASİYASI MÜHƏNDİSLİYİ
  60: 'program', // GƏMİ ENERGETİK QURĞULARININ İSTİSMARI MÜHƏNDİSLİYİ
  61: 'program', // GƏMİQAYIRMA VƏ GƏMİ TƏMİRİ MÜHƏNDİSLİYİ
  62: 'program', // ELEKTRİK VƏ ELEKTRONİKA MÜHƏNDİSLİYİ

  // ── STRUKTUR / şöbələr -> department ───────────────────────────────────
  27: 'department', // TƏDRİS PROSESLƏRİNİN TƏŞKİLİ ŞÖBƏSİ
  55: 'department', // ELMİ-TƏDQİQAT VƏ BEYNƏLXALQ ƏLAQƏLƏR ŞÖBƏSİ
  49: 'department', // TƏSƏRRÜFAT İŞLƏRİ ŞÖBƏSİ
  8: 'department', // MÜHASİBAT UÇOTU VƏ HESABAT ŞÖBƏSİ
  17: 'department', // PERSONALIN İDARƏ EDİLMƏSİ ŞÖBƏSİ
  21: 'department', // HÜQUQ MƏSLƏHƏTÇİSİ
  7: 'department', // MƏTBƏƏ
  31: 'department', // İNFORMASİYA RESURSLARI MƏRKƏZİ
  2: 'department', // İNFORMASİYA-RESURS MƏRKƏZİ
  29: 'department', // TƏLİM-TƏDRİS MƏRKƏZİ
  30: 'department', // AZƏRBAYCAN DƏNİZÇİLİK KOLLECİ

  // Qalan hər şey -> page
};

/**
 * `person` NİYƏ YOXDUR: REKTOR (19), PROREKTOR (22, 23, 25), ELMİ KATİB (43),
 * REKTOR KÖMƏKÇİSİ (24) səhifələri şəxs profilidir, amma `person` CT-də
 * ad/vəzifə/şəkil kimi struktur sahələr var — bir HTML gövdəsini oraya
 * tökmək məlumatı korlayır. Onlar `page` kimi gəlir, `person` qeydləri isə
 * K4-də əl ilə (və ya ayrıca çıxarışla) qurulur.
 */
export const PERSON_PAGES = [19, 22, 23, 24, 25, 43];

export function targetTypeFor(section, legacyId) {
  if (section === 'news') return 'article';
  if (section === 'announce') return 'announcement';
  if (section === 'faculty') return 'faculty';
  if (section === 'content') return CONTENT_MAP[legacyId] || 'page';
  return 'page';
}

/** Strapi REST-də plural yol seqmenti. */
export const PLURAL = {
  article: 'articles',
  announcement: 'announcements',
  page: 'pages',
  faculty: 'faculties',
  program: 'programs',
  department: 'departments',
};

/**
 * Sahə xəritəsi — hədəf tiplər fərqli adlandırma işlədir:
 *   page/article/announcement -> title + body
 *   faculty/department        -> name  + about
 *   program                   -> title + description
 */
export const FIELDS = {
  article: { title: 'title', body: 'body' },
  announcement: { title: 'title', body: 'body' },
  page: { title: 'title', body: 'body' },
  faculty: { title: 'name', body: 'about' },
  program: { title: 'title', body: 'description' },
  department: { title: 'name', body: 'about' },
};
