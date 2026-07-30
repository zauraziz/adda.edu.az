// AVTOMATİK YARADILIB — ƏL İLƏ DƏYİŞDİRMƏ.
// Mənbə: tools/migration/data/redirects.json
// Yeniləmək: cd tools/migration && node gen-redirects.mjs
//
// Bu, BOŞ başlanğıc versiyadır. Xəritə doldurulana qədər yönləndirmə işləmir,
// amma sayt normal işləyir — middleware boş xəritədə heç nə etmir.
export const LEGACY_REDIRECTS: Record<string, string> = {};

/** Köhnə saytın bölmə adları — middleware naxışı bunlarla məhdudlaşır. */
export const LEGACY_SECTIONS = ['content', 'news', 'announce', 'faculty', 'photogallery'] as const;
