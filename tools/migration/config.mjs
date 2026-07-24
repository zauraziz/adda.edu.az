// ADDA — köhnə saytın miqrasiyası / konfiqurasiya.
//
// Köhnə sayt eyni ID-ni hər üç dildə işlədir (/az/news/1984 = /ru/news/1984),
// yəni tərcümələr HAZIRDIR — ru/en üçün ayrıca iş lazım deyil.

export const BASE = 'https://adda.edu.az';
export const LOCALES = ['az', 'ru', 'en'];

// ID aralıqları 23.07.2026 tarixli canlı sayt müşahidəsinə əsaslanır:
//   ən son xəbər  = /az/news/1984
//   ən son elan   = /az/announce/519
//   statik səhifə = content/1 .. content/71 (seyrək)
// Yuxarı sərhədlərə ehtiyat pay qoyulub.
//
// MÖVCUDLUQ QAYDASI (23.07.2026 zondundan ölçülüb, təxmin DEYİL):
//   news / announce  -> olmayan ID üçün düzgün 404. minBytes lazım deyil.
//   content / faculty -> olmayan ID üçün 200 + BOŞ ŞABLON qaytarır:
//        content  boş = 24361 b   | ən kiçik real = 26223 b (id 58)
//        faculty  boş = 24365..69 b | ən kiçik real = 28267 b (id 1)
//   Başlıq ayırıcı kimi İŞLƏMİR — faculty/1 real olsa da başlığı sadəcə
//   "Azərbaycan Dövlət Dəniz Akademiyası"-dır. Yeganə etibarlı siqnal ölçüdür.
//
// Hədlər qəsdən AŞAĞI seçilib: səhvən boş sayıb real səhifəni itirməkdənsə,
// bir neçə boşu içəri buraxıb inventory.mjs-də işarələmək daha təhlükəsizdir.
export const SECTIONS = {
  content: { label: 'Statik səhifə', path: (l, id) => `/${l}/content/${id}`, from: 1, to: 80, minBytes: 24500 },
  news: { label: 'Xəbər', path: (l, id) => `/${l}/news/${id}`, from: 1, to: 2000, minBytes: 0 },
  announce: { label: 'Elan', path: (l, id) => `/${l}/announce/${id}`, from: 1, to: 540, minBytes: 0 },
  faculty: { label: 'Fakültə', path: (l, id) => `/${l}/faculty/${id}`, from: 1, to: 12, minBytes: 24800 },
};

// inventory.mjs həddin bu qədər yaxınlığındakı səhifələri "sərhəd" kimi işarələyir
// ki, əl ilə baxılsın.
export const BORDERLINE_MARGIN = 2000;

// Nəzakət: bu, ADDA-nın canlı prod serveridir. Tək paralel sorğu + gecikmə.
// ~2.5 sorğu/san. Server rahat aparırsa THROTTLE_MS azaldıla bilər.
export const THROTTLE_MS = 400;
export const RETRIES = 3;
export const TIMEOUT_MS = 20000;
export const USER_AGENT = 'ADDA-Migration/1.0 (internal content migration; contact akademiya@asco.az)';

// Manifest hər N yazıdan bir diskə flush olunur (qəza halında itki azalsın).
export const FLUSH_EVERY = 25;
