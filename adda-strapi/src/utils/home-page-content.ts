/**
 * F5.50 — ana səhifənin admində idarə olunan bloklarının DEFOLT məzmunu
 * («3. Sayt — Ana səhifə», bax src/utils/home-page.ts).
 *
 * Next.js ehtiyatı adda-nextjs/lib/home-fallback.ts-dədir — EYNİ dəyərlər
 * (Strapi əlçatmaz olanda və ya tip hələ deploy olunmayıbsa sayt bunu göstərir).
 * Birini dəyişəndə o birini də dəyiş.
 *
 * Rəqəm və iddialar YALNIZ saytın mənbəli səhifələrindəndir, hər fakt kartı
 * sübut səhifəsinə aparır:
 *   1881 / 1996 — «ADDA dünən və bu gün», FAQ (Nazirlər Kabinetinin 15.07.1996 qərarı);
 *   170+ ölkə, IMO kataloqu № 012, IAMU (2016), 11 ölkə — «Beynəlxalq əməkdaşlıq»,
 *     «Akademik tərəfdaşlar» (beynelxalq-pages-content.ts);
 *   52 həftə, «General Əsədov», ASCO gəmiləri — «Təcrübə (praktika)» (tehsil-pages-content.ts);
 *   ISO 9001:2015, GMDSS, ARPA, ECDIS, DP (The Nautical Institute) — Təlim-Tədris
 *     Mərkəzi (tehsil-units-content.ts), «Keyfiyyət və nəticələr»;
 *   ASCO-nun tabeliyi və əsas kadr mənbəyi — «ASCO və Akademiya» (info-pages-content.ts);
 *   yataqxana (104 otaq, 311 yer), idman, mədəniyyət — telebe-pages-content.ts.
 *
 * Şəkillər Akademiyanın öz xəbər arxivindəndir (Cloudinary, prod media
 * kitabxanası): seed həmin URL-li faylı media kitabxanasında tapıb bağlayır,
 * tapmasa (lokal baza) sahə boş qalır və sayt URL-i ehtiyatdan götürür.
 *
 * Sitat blokunun videosu (F5.51) — Akademiyanın rəsmi YouTube kanalından
 * (@AzerbaijanStateMarineAcademy) «Azərbaycan Dövlət Dəniz Akademiyası 2026»
 * filmi, yerləşdirməyə (embed) açıqdır. Fon şəkli boşdursa sayt əvvəlki
 * dizaynın fotosunu göstərir (adda-nextjs/lib/home-fallback.ts → HOME_QUOTE_BG).
 */

export interface L3 {
  az: string;
  en: string;
  ru: string;
}

export interface HomeSlideSeed {
  /** Arxiv şəklinin tam URL-i (media kitabxanasında axtarılır). */
  image: string;
  kicker: L3;
  /** «*söz*» — vurğulanan hissə (qızılı kursiv). */
  title: L3;
  lead: L3;
  cta: L3;
  url: string;
}

export interface HomeFactSeed {
  value: string;
  unit: L3;
  title: L3;
  desc: L3;
  url: string;
}

export interface HomePhotoSeed {
  image: string;
  chip: L3;
  title: L3;
  note: L3;
  url: string;
}

const CLD = 'https://res.cloudinary.com/xpjtibwa/image/upload/';

export const HOME_SLIDES: HomeSlideSeed[] = [
  {
    // «İki yubiley, bir yol: Dəniz Akademiyasında yeni dövr» (02.03.2026) — Akademiyanın binası.
    image: CLD + 'v1785221511/xazar_2026_1_f1e5e48e60.jpg',
    kicker: {
      az: 'Azərbaycan Dövlət Dəniz Akademiyası',
      en: 'Azerbaijan State Marine Academy',
      ru: 'Азербайджанская государственная морская академия',
    },
    title: {
      az: 'Dənizçilik təhsili *1881-ci ildən*',
      en: 'Maritime education *since 1881*',
      ru: 'Морское образование *с 1881 года*',
    },
    lead: {
      az: 'Xəzər sahilində dənizçi və gəmi mühəndisləri hazırlayan akademiya: kollecdən doktoranturaya qədər bütün pillələr bir ünvanda.',
      en: 'An academy on the Caspian shore that trains seafarers and marine engineers, from college to doctoral level, at one address.',
      ru: 'Академия на берегу Каспия, готовящая моряков и судовых инженеров: от колледжа до докторантуры в одном месте.',
    },
    cta: { az: 'Akademiya haqqında', en: 'About the Academy', ru: 'Об Академии' },
    url: '/sehife/adda-dunen-ve-bugun',
  },
  {
    // «ADDA-da yaz semestrinə start verildi» (2026) — dərs zalında kursantlar.
    image: CLD + 'v1785392773/xnad_2026_5_b08315ae58.jpg',
    kicker: { az: 'Qəbul', en: 'Admissions', ru: 'Поступление' },
    title: {
      az: 'Gələcəyini *dənizlə* bağla',
      en: 'Link your future *to the sea*',
      ru: 'Свяжи будущее *с морем*',
    },
    lead: {
      az: 'İxtisaslar, keçid balları, yer sayı və qəbul addımları: abituriyent üçün lazım olan hər şey bir səhifədə.',
      en: 'Programmes, pass scores, places and admission steps: everything an applicant needs on one page.',
      ru: 'Специальности, проходные баллы, число мест и шаги поступления: всё, что нужно абитуриенту, на одной странице.',
    },
    cta: { az: 'Abituriyentlər üçün', en: 'For applicants', ru: 'Абитуриентам' },
    url: '/bunlar-ucun/abituriyentler',
  },
  {
    // «ADDA tələbələri Türkiyədə təcrübə keçir» (2026) — gəmi körpüsündə.
    image: CLD + 'v1785221595/1774948242_gnad_2026_5_7c1398104f.jpg',
    kicker: { az: 'Dəniz təcrübəsi', en: 'Sea training', ru: 'Морская практика' },
    title: {
      az: 'Nəzəriyyə *göyərtədə* peşəyə çevrilir',
      en: 'Theory becomes a profession *on deck*',
      ru: 'Теория становится профессией *на палубе*',
    },
    lead: {
      az: 'Dənizçi ixtisaslarında 4 ildə 52 həftəlik təcrübə: «General Əsədov» tədris gəmisində və ASCO-nun gəmilərində.',
      en: '52 weeks of sea training over 4 years in seafaring programmes, on the training ship General Asadov and on ASCO vessels.',
      ru: '52 недели практики за 4 года на морских специальностях: на учебном судне «Генерал Асадов» и судах ASCO.',
    },
    cta: { az: 'Təcrübə haqqında', en: 'About sea training', ru: 'О практике' },
    url: '/sehife/tecrube-haqqinda',
  },
  {
    // «ADDA-da Məzun günü» (2023) — Akademiyanın həyətində məzunlar.
    image: CLD + 'v1785396051/mg_7_f0f388aaa1.jpg',
    kicker: { az: 'Beynəlxalq tanınma', en: 'International recognition', ru: 'Международное признание' },
    title: {
      az: 'Diplom *170-dən çox* ölkədə tanınır',
      en: 'A diploma recognised in *170+ countries*',
      ru: 'Диплом признаётся *более чем в 170 странах*',
    },
    lead: {
      az: 'Tədris IMO-nun STCW Konvensiyasına uyğundur; Akademiya dünya ali dəniz təhsili kataloqunda 012 nömrəsi ilə qeydiyyatdadır.',
      en: 'Training meets the IMO STCW Convention; the Academy is listed under number 012 in the world catalogue of maritime higher education.',
      ru: 'Обучение соответствует Конвенции ПДНВ ИМО; Академия внесена в мировой каталог высшего морского образования под номером 012.',
    },
    cta: { az: 'Beynəlxalq əməkdaşlıq', en: 'International cooperation', ru: 'Международное сотрудничество' },
    url: '/sehife/beynelxalq-emekdasliq',
  },
];

export const HOME_FACTS: HomeFactSeed[] = [
  {
    value: '1881',
    unit: { az: '', en: '', ru: '' },
    title: { az: 'Ənənə', en: 'Tradition', ru: 'Традиция' },
    desc: {
      az: 'Azərbaycanda dənizçi hazırlığı 1881-ci ildə başlayıb; Akademiya 1996-cı ildə Nazirlər Kabinetinin qərarı ilə yaradılıb.',
      en: 'Seafarer training in Azerbaijan began in 1881; the Academy was established by a Cabinet of Ministers decision in 1996.',
      ru: 'Подготовка моряков в Азербайджане началась в 1881 году; Академия создана решением Кабинета министров в 1996 году.',
    },
    url: '/sehife/adda-dunen-ve-bugun',
  },
  {
    value: '170+',
    unit: { az: 'ölkə', en: 'countries', ru: 'стран' },
    title: { az: 'Tanınan diplom', en: 'Recognised diploma', ru: 'Признанный диплом' },
    desc: {
      az: 'Tədris IMO-nun STCW Konvensiyasına uyğundur; Akademiya dünya kataloqunda 012 nömrəsi ilə qeydiyyatdadır.',
      en: 'Training follows the IMO STCW Convention; the Academy is No. 012 in the world catalogue of maritime higher education.',
      ru: 'Обучение по Конвенции ПДНВ ИМО; Академия значится под № 012 в мировом каталоге высшего морского образования.',
    },
    url: '/sehife/beynelxalq-emekdasliq',
  },
  {
    value: '52',
    unit: { az: 'həftə', en: 'weeks', ru: 'недели' },
    title: { az: 'Dəniz təcrübəsi', en: 'Sea training', ru: 'Морская практика' },
    desc: {
      az: 'Dənizçi ixtisaslarında 4 il ərzində: «General Əsədov» tədris gəmisində və ASCO-nun gəmilərində.',
      en: 'Over 4 years in seafaring programmes: on the training ship General Asadov and on ASCO vessels.',
      ru: 'За 4 года на морских специальностях: на учебном судне «Генерал Асадов» и судах ASCO.',
    },
    url: '/sehife/tecrube-haqqinda',
  },
  {
    value: 'ISO 9001',
    unit: { az: '', en: '', ru: '' },
    title: { az: 'Sertifikatlı simulyatorlar', en: 'Certified simulators', ru: 'Сертифицированные тренажёры' },
    desc: {
      az: 'ISO 9001:2015 ilə işləyən Təlim-Tədris Mərkəzində GMDSS, ARPA, ECDIS və The Nautical Institute sertifikatlı DP simulyatoru.',
      en: 'The ISO 9001:2015 Training Centre runs GMDSS, ARPA and ECDIS simulators and a DP simulator certified by The Nautical Institute.',
      ru: 'Учебно-тренировочный центр с ISO 9001:2015: тренажёры ГМССБ, САРП, ЭКНИС и DP-тренажёр, сертифицированный The Nautical Institute.',
    },
    url: '/struktur/telim-tedris-merkezi',
  },
  {
    value: '2016',
    unit: { az: '', en: '', ru: '' },
    title: { az: 'IAMU üzvü', en: 'IAMU member', ru: 'Член IAMU' },
    desc: {
      az: 'Beynəlxalq Dəniz Universitetləri Assosiasiyasının üzvü; 11 ölkənin universitetləri ilə mübadilə və birgə proqramlar.',
      en: 'Member of the International Association of Maritime Universities; exchanges and joint programmes with universities in 11 countries.',
      ru: 'Член Международной ассоциации морских университетов; обмен и совместные программы с вузами 11 стран.',
    },
    url: '/sehife/akademik-terefdaslar',
  },
  {
    value: 'ASCO',
    unit: { az: '', en: '', ru: '' },
    title: { az: 'Karyera yolu', en: 'Career path', ru: 'Путь в профессию' },
    desc: {
      az: 'Akademiya ASCO-nun tabeliyindədir və onun əsas kadr mənbəyidir: təcrübə, təqaüd və işə qəbul.',
      en: 'The Academy operates under ASCO and is its main source of staff: sea training, scholarships and jobs.',
      ru: 'Академия находится в ведении ASCO и является его основным кадровым источником: практика, стипендии, работа.',
    },
    url: '/sehife/asco-ve-akademiya',
  },
];

/** Kampus blokunun 3 foto kartı: 1 — böyük, 2 — sağda, 3 — aşağıda. */
export const HOME_CAMPUS: HomePhotoSeed[] = [
  {
    // «ADDA-nın yubileylərinə həsr olunmuş üzgüçülük yarışı keçirilib» (2026).
    image: CLD + 'v1785393498/f5c42513e269b19bd9b87c41a1342834_b08639bbff.jpg',
    chip: { az: 'İdman · Dəniz', en: 'Sport · Sea', ru: 'Спорт · Море' },
    title: { az: 'Üzgüçülük və yelkən', en: 'Swimming and sailing', ru: 'Плавание и парусный спорт' },
    note: {
      az: 'Hovuz, yelkən idmanı seksiyası və bayramlarda dənizdə yelkənli qayıq yarışları.',
      en: 'A swimming pool, a sailing section and sailing-boat races at sea on public holidays.',
      ru: 'Бассейн, секция парусного спорта и парусные гонки в море в праздничные дни.',
    },
    url: '/sehife/idman',
  },
  {
    // «ADDA-da Novruz şənliyi keçirilib» (18.03.2026) — Akademiyanın həyətində tonqal.
    image: CLD + 'v1785393023/8_jpeg_a278e110ba.jpg',
    chip: { az: 'Mədəniyyət', en: 'Culture', ru: 'Культура' },
    title: { az: 'Bayramlar və konsertlər', en: 'Festivals and concerts', ru: 'Праздники и концерты' },
    note: {
      az: 'Novruz şənliyi, Akademiyanın himni, «Kim? Nə? Harada?» yarışları və teatr səfərləri.',
      en: 'Novruz celebrations, the Academy anthem, quiz contests and theatre visits.',
      ru: 'Новруз, гимн Академии, игры «Что? Где? Когда?» и походы в театр.',
    },
    url: '/sehife/medeniyyet-ve-yaradiciliq-dernekleri',
  },
  {
    // «Həmrəylik Günü və Yeni İl ADDA-nın yataqxanasında da qeyd edilib» (2026).
    image: CLD + 'v1785221395/ytad_2026_4_f7f64382b9.jpg',
    chip: { az: 'Yaşayış', en: 'Living', ru: 'Проживание' },
    title: { az: 'Yataqxana', en: 'Residence hall', ru: 'Общежитие' },
    note: {
      az: 'Üzeyir Hacıbəyli küçəsi 114: 104 otaq, 311 yer.',
      en: '114 Uzeyir Hajibeyli Street: 104 rooms, 311 places.',
      ru: 'Улица Узеира Гаджибейли, 114: 104 комнаты, 311 мест.',
    },
    url: '/sehife/yataqxana',
  },
];

/** Sitat bloku (F5.51 — əvvəlki dizayn qaytarıldı): mətn və müəllif admində redaktə olunur. */
export const HOME_QUOTE: { text: L3; attr: L3 } = {
  text: {
    az: 'Dəniz insana üfüqün arxasında daha böyük bir dünyanın olduğunu öyrədir — biz o dünyaya gedən yolu öyrədirik.',
    en: 'The sea teaches that a bigger world lies beyond the horizon — we teach the way to that world.',
    ru: 'Море учит человека тому, что за горизонтом есть больший мир — мы учим пути в этот мир.',
  },
  attr: {
    az: 'Azərbaycan Dövlət Dəniz Akademiyası · 1996',
    en: 'Azerbaijan State Marine Academy · 1996',
    ru: 'Азербайджанская государственная морская академия · 1996',
  },
};

/** «ADDA-nı yaşa» düyməsinin videosu: Akademiyanın rəsmi kanalı, «Azərbaycan Dövlət Dəniz Akademiyası 2026». */
export const HOME_QUOTE_VIDEO = 'https://www.youtube.com/watch?v=o1xEKQgUqJA';

/** Düymənin mətni (boşdursa sayt bunu göstərir). */
export const HOME_QUOTE_CTA: L3 = { az: 'ADDA-nı yaşa', en: 'Live ADDA', ru: 'Живи ADDA' };
