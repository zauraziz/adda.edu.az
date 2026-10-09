import type { SiteMenu, MenuPortal } from './strapi';

// Strapi əlçatan olmadıqda header + quicknav + footer üçün ehtiyat menyu (az).
// SiteHeaderStack, Quicknav və Footer (hamısı server) bu eyni mənbəni işlədir.
export const FALLBACK_MENU: SiteMenu = {
  esasMenyu: [
    { label: 'Akademiya', order: 1, url: '#', groups: [
      { title: 'Akademik irs və missiya', links: [{label:'Akademiya haqqında',url:'#'},{label:'Akademiyanın tarixi',url:'#'},{label:'Sabiq rektorlarımız',url:'/sabiq-rektorlar'},{label:'ADDA Qəhrəmanları',url:'#'},{label:'Fəxri doktorlarımız',url:'#'},{label:'Fəxri məzunlar',url:'#'},{label:'ADDA reytinqlərdə',url:'#'},{label:'Rəqəmlər və faktlar',url:'#'}] },
      { title: 'Rəhbərlik və idarəetmə', links: [{label:'Rektor',url:'#'},{label:'Rəhbərlik',url:'#'},{label:'Elmi Şura',url:'#'},{label:'Himayəçilər Şurası',url:'#'},{label:'Təşkilati struktur',url:'#'},{label:'Fakültələr',url:'/fakulteler'},{label:'Kafedralar',url:'/kafedralar'}] },
      { title: 'Hüquqi baza və etika', links: [{label:'Nizamnamə və təsis sənədləri',url:'#'},{label:'Normativ-hüquqi sənədlər',url:'#'},{label:'Struktur bölmələrin əsasnamələri',url:'#'},{label:'Akademik dürüstlük bəyannaməsi',url:'#'},{label:'ADDA etika kodeksi',url:'#'},{label:'Müraciətlərə baxılma qaydası',url:'#'}] },
      { title: 'Keyfiyyət və hesabatlılıq', links: [{label:'Keyfiyyət siyasəti',url:'#'},{label:'Akkreditasiya və sertifikatlar',url:'#'},{label:'İllik fəaliyyət hesabatları',url:'#'},{label:'Özünüqiymətləndirmə nəticələri',url:'#'},{label:'Tələbə və məzun sorğuları',url:'#'},{label:'Məzunların məşğulluq göstəriciləri',url:'#'},{label:'Dayanıqlı inkişaf',url:'#'}] },
      { title: 'Heyət', links: [{label:'Professor-müəllim heyəti',url:'#'},{label:'Təlimçi-texniki heyət',url:'#'},{label:'İnzibati heyət',url:'#'}] },
      { title: 'Təminat', links: [{label:'Satınalmalar',url:'#'},{label:'Binalar və infrastruktur',url:'#'},{label:'Yataqxana',url:'#'},{label:'Təlim-Tədris Mərkəzi',url:'#'},{label:'Tədris gəmisi',url:'#'},{label:'Kollec',url:'#'}] },
      { title: 'Kommunikasiya', links: [{label:'Vətəndaşların müraciəti',url:'#'},{label:'Əlaqə',url:'#'}] },
    ]},
    // F5.45 — «Qəbul» v2 (adda-strapi/src/utils/menu-qebul.ts QEBUL_MENU_V2 ilə eyni).
    { label: 'Qəbul', order: 2, url: '/bunlar-ucun/abituriyentler', groups: [
      { title: 'Pillələr üzrə qəbul', links: [{label:'Subbakalavr (kollec)',url:'/sehife/subbakalavr'},{label:'Bakalavriat',url:'/sehife/bakalavriat'},{label:'Magistratura',url:'/sehife/magistratura'},{label:'Doktorantura',url:'/sehife/doktorantura'},{label:'Təkrar ali təhsil',url:'/sehife/tekrar-ali-tehsil'}] },
      { title: 'İxtisas seçimi', links: [{label:'Keçid balları, yer sayı və təhsil haqqı',url:'/sehife/kecid-ballari'},{label:'Məzunların işlə təminatı',url:'/sehife/mezunlarin-isle-teminati'},{label:'Yataqxana',url:'/sehife/yataqxana'}] },
      { title: 'Əcnəbi vətəndaşlar', links: [{label:'Qəbul qaydaları və təhsil haqqı',url:'/sehife/ecnebi-telebelerin-qebulu-qaydalari'},{label:'İngilis dilində tədris',url:'/sehife/ingilis-dilinde-tedris'}] },
      { title: 'Tanışlıq və əlaqə', links: [{label:'Açıq qapı günləri',url:'/sehife/aciq-qapi-gunleri'},{label:'Onlayn müraciət',url:'/sehife/onlayn-muraciet'}] },
    ]},
    // F5.40 — «Təhsil» yeni quruluşu (adda-strapi/src/utils/menu-tehsil.ts ilə eyni).
    { label: 'Təhsil', order: 3, url: '/ixtisaslar', groups: [
      { title: 'Təhsil proqramları', links: [{label:'Bütün ixtisaslar',url:'/ixtisaslar'},{label:'Subbakalavr (kollec)',url:'/ixtisaslar?tab=subbakalavr'},{label:'Bakalavriat',url:'/ixtisaslar?tab=bakalavr'},{label:'Magistratura',url:'/ixtisaslar?tab=magistr'},{label:'Doktorantura',url:'/ixtisaslar?tab=doktorantura'},{label:'Qiyabi və təkrar ali təhsil',url:'/ixtisaslar?tab=tekrar_ali'},{label:'İngilis dilində tədris',url:'/ixtisaslar?dil=en'}] },
      { title: 'Dəniz praktikası', links: [{label:'Təcrübə (praktika)',url:'/sehife/tecrube-haqqinda'},{label:'Tədris gəmisi',url:'/sehife/tedris-gemisi'},{label:'Laboratoriya və trenajorlar',url:'/auditoriyalar'}] },
      { title: 'Əlavə təhsil', links: [{label:'STCW kursları',url:'/struktur/telim-tedris-merkezi'},{label:'İxtisasartırma və xaricdə təhsil',url:'/sehife/xaricde-tehsil-ve-ixtisasartirma'}] },
      { title: 'Tədris prosesi və keyfiyyət', links: [{label:'Tədris ofisi',url:'/struktur/tedris-proseslerinin-teskili-sobesi'},{label:'E-Kitabxana',url:'/sehife/elektron-kitabxana'},{label:'Keyfiyyət və nəticələr',url:'/sehife/keyfiyyetin-monitorinqi'}] },
    ]},
    { label: 'Elm və innovasiya', order: 4, url: '#', groups: [
      { title: 'Elmi idarəetmə və strategiya', links: [{label:'Elmi siyasət',url:'#'},{label:'Tədris-Metodiki Şura',url:'#'},{label:'Rəqəmlər və faktlar',url:'#'}] },
      { title: 'Elmi-tədqiqat mərkəzləri və laboratoriyalar', links: [{label:'Tədqiqat mərkəzləri və laboratoriyalar',url:'#'}] },
      { title: 'Elmi nəşrlər və kitabxana', links: [{label:'ADDA-nın Elmi Jurnalı',url:'#'},{label:'Əməkdaşların nəşrləri',url:'#'},{label:'E-Kitabxana',url:'#'},{label:'Konvensiyalar və normativ sənədlər fondu',url:'#'},{label:'Tərəfdaş kitabxanalar və elmi bazalar',url:'#'}] },
      { title: 'Doktorantura və elmi kadrların hazırlığı', links: [{label:'Doktorantura',url:'#'},{label:'Dissertasiya şuraları',url:'#'},{label:'Gənc alimlərin platforması',url:'#'}] },
      { title: 'Qrantlar, müsabiqələr və tədbirlər', links: [{label:'Qrantlar',url:'#'},{label:'Mükafatlar',url:'#'},{label:'Elmi tədbirlər təqvimi',url:'#'},{label:'Beynəlxalq Dənizçilik Konfransları',url:'#'},{label:'Sahəvi seminarlar və təlimlər',url:'#'}] },
    ]},
    { label: 'Tələbə həyatı', order: 5, url: '#', groups: [
      { title: 'Tələbə təşkilatları', links: [{label:'Tələbə Gənclər Təşkilatı (TGK)',url:'#'},{label:'Tələbə Həmkarlar İttifaqı (THİK)',url:'#'},{label:'Tələbə Elmi Cəmiyyəti (TEC)',url:'#'},{label:'Könüllülük hərəkatı',url:'#'}] },
      { title: 'Yaşayış və rifah', links: [{label:'Tələbə yataqxanası',url:'#'},{label:'Onlayn müraciət və yerləşdirmə',url:'#'},{label:'Sosial təminat və maddi yardım',url:'#'},{label:'Təqaüd proqramları',url:'#'},{label:'Psixoloji dəstək xidməti',url:'#'},{label:'Tibb xidməti',url:'#'}] },
      { title: 'Yaradıcılıq, idman və asudə vaxt', links: [{label:'İdman klubları',url:'#'},{label:'Mədəniyyət və yaradıcılıq dərnəkləri',url:'#'},{label:'İntellektual oyun klubları',url:'#'}] },
      { title: 'Media və kommunikasiya', links: [{label:'Sosial media elçiləri',url:'#'},{label:'Tədbirlər təqvimi',url:'#'}] },
    ]},
    { label: 'Beynəlxalq əlaqələr', order: 6, url: '#', groups: [
      { title: 'Akademik tərəfdaşlıq və ikili diplom', links: [{label:'İkili diplom layihələri',url:'#'},{label:'Akademik tərəfdaşlar',url:'#'}] },
      { title: 'Mobillik proqramları', links: [{label:'Erasmus+ və Mevlana',url:'#'},{label:'Müəllim mübadiləsi',url:'#'},{label:'Yay məktəbləri',url:'#'}] },
      { title: 'Beynəlxalq assosiasiyalar və təşkilatlar', links: [{label:'IAMU',url:'#'},{label:'IMO',url:'#'},{label:'BSAMI',url:'#'},{label:'Digər təşkilatlar',url:'#'}] },
      { title: 'Xarici gəmiçilik şirkətləri', links: [{label:'Kadet proqramları',url:'#'},{label:'Məzunların işlə təminatı',url:'#'}] },
      { title: 'Beynəlxalq elmi araşdırmalar', links: [{label:'Birgə elmi konfranslar',url:'#'},{label:'Qrant layihələri',url:'#'}] },
    ]},
  ],
  ustMenyu: [
    { label: 'ADDA Məzunları', order: 1, url: '#', groups: [
      { title: 'Məzun mərkəzi', links: [{label:'Məzunlar assosiasiyası',url:'#'},{label:'Regional və beynəlxalq nümayəndəliklər',url:'#'},{label:'Məzunların mentorluq proqramı',url:'#'},{label:'Məzunlar-işəgötürənlər şəbəkəsi',url:'#'}] },
      { title: 'Karyera və inkişaf', links: [{label:'Vakansiyalar',url:'#'},{label:'Məzunlar üçün təkmilləşdirmə',url:'#'},{label:'Karyera hekayələri',url:'#'},{label:'Elm-təhsil-istehsalat platforması',url:'#'},{label:'Diskussiya klubu',url:'#'},{label:'Karyera sərgisi',url:'#'}] },
      { title: 'Tədbirlər və layihələr', links: [{label:'Məzun günü',url:'#'},{label:'Peşəkar görüşlər',url:'#'},{label:'İnkişafa dəstək təşəbbüsləri',url:'#'},{label:'Məzun kartı',url:'#'},{label:'Məzunların rəyləri',url:'#'}] },
    ]},
    { label: 'Karyera', order: 2, url: '#', groups: [
      { title: 'Karyera Mərkəzi', links: [{label:'Karyera Mərkəzi haqqında',url:'#'},{label:'Karyera bələdçisi',url:'#'},{label:'Fərdi konsultasiyalar',url:'#'},{label:'Tələbə portfolioları',url:'#'}] },
      { title: 'İş və təcrübə imkanları', links: [{label:'Vakansiyalar',url:'#'},{label:'Təcrübə proqramları',url:'#'},{label:'Könüllü təcrübəçilik',url:'#'}] },
      { title: 'İstehsalat ilə əlaqələr', links: [{label:'Korporativ tərəfdaşlar',url:'#'},{label:'Sərgilər və forumlar',url:'#'}] },
      { title: 'Bacarıqların inkişafı', links: [{label:'Soft Skills təlimləri',url:'#'},{label:'Sertifikatlaşdırma dəstəyi',url:'#'},{label:'Master-klaslar',url:'#'}] },
    ]},
    { label: 'Kollec', order: 3, url: '#', groups: [ { title: 'Kollec', links: [{label:'Fakültələr',url:'#'},{label:'Əlavə təhsil',url:'#'},{label:'İnfrastruktur',url:'#'}] } ] },
    { label: 'FAQ', order: 4, url: '#', groups: [] },
    { label: 'Əlaqə', order: 5, url: '#', groups: [] },
  ],
  eAkademiya: { title: 'E-Akademiya platforması', subtitle: 'Rəqəmsal təhsil ekosistemi', cards: [
    { label: 'Tələbə kabineti', description: 'ADDA Lider sistemi', url: '#', icon: 'device-laptop' },
    { label: 'Müəllim kabineti', description: 'Tədris idarəetməsi', url: '#', icon: 'chalkboard' },
    { label: 'Elektron jurnal', description: 'Qiymət və davamiyyət', url: '#', icon: 'notebook' },
    { label: 'Dərs cədvəli', description: 'Cari semestr', url: '#', icon: 'calendar' },
    { label: 'E-Kitabxana', description: 'Elektron resurslar', url: '#', icon: 'books' },
    { label: 'Sertifikatlar', description: 'STCW & Təlim mərkəzi', url: '#', icon: 'certificate' },
  ]},
  istifadeciQruplari: [
    { label: 'Abituriyentlər', url: '/bunlar-ucun/abituriyentler' }, { label: 'Tələbələr', url: '/bunlar-ucun/telebeler' },
    { label: 'Məzunlar', url: '/bunlar-ucun/mezunlar' }, { label: 'Əməkdaşlar', url: '/bunlar-ucun/emekdaslar' },
    { label: 'Beynəlxalq tələbələr', url: '/bunlar-ucun/beynelxalq-telebeler' }, { label: 'Valideynlər', url: '/bunlar-ucun/valideynler' },
  ],
  suretliKecidler: [
    { label: 'Tələbə kabineti', url: '#', icon: 'device-laptop' }, { label: 'Elektron jurnal', url: '#', icon: 'notebook' },
    { label: 'E-Kitabxana', url: '#', icon: 'books' }, { label: 'Dərs cədvəli', url: '#', icon: 'calendar' },
    { label: 'Karyera Mərkəzi', url: '#', icon: 'briefcase' }, { label: 'Əlaqə', url: '#', icon: 'mail' },
  ],
  footerMenyusu: [
    { title: 'Akademiya', links: [{label:'Haqqımızda',url:'#'},{label:'Rəhbərlik',url:'#'},{label:'Struktur',url:'#'},{label:'Tarix',url:'#'},{label:'Akkreditasiya',url:'#'}] },
    { title: 'Qəbul', links: [{label:'Bakalavr qəbulu',url:'/sehife/bakalavriat'},{label:'Magistratura qəbulu',url:'/sehife/magistratura'},{label:'Keçid balları, yer sayı və təhsil haqqı',url:'/sehife/kecid-ballari'},{label:'Onlayn müraciət',url:'/sehife/onlayn-muraciet'}] },
    { title: 'Təhsil', links: [{label:'İxtisaslar',url:'/ixtisaslar'},{label:'Bakalavriat',url:'/ixtisaslar?tab=bakalavr'},{label:'Magistratura',url:'/ixtisaslar?tab=magistr'},{label:'Qiyabi və təkrar ali təhsil',url:'/ixtisaslar?tab=tekrar_ali'},{label:'Təcrübə (praktika)',url:'/sehife/tecrube-haqqinda'}] },
    { title: 'Universitet', links: [{label:'Elm və innovasiya',url:'#'},{label:'Tələbə həyatı',url:'#'},{label:'Beynəlxalq əməkdaşlıq',url:'#'},{label:'Xəbərlər',url:'#'},{label:'Kampus',url:'#'}] },
  ],
};

export const FALLBACK_EACAD = FALLBACK_MENU.eAkademiya as MenuPortal;
