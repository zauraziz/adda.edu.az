import type { SiteMenu, MenuPortal } from './strapi';

// Strapi əlçatan olmadıqda header + quicknav + footer üçün ehtiyat menyu (az).
// SiteHeaderStack, Quicknav və Footer (hamısı server) bu eyni mənbəni işlədir.
export const FALLBACK_MENU: SiteMenu = {
  esasMenyu: [
    { label: 'Akademiya', order: 1, url: '#', groups: [
      { title: 'Akademik irs və missiya', links: [{label:'Akademiya haqqında',url:'/sehife/adda-dunen-ve-bugun'},{label:'ASCO və Akademiya',url:'/sehife/asco-ve-akademiya'},{label:'Akademiyanın tarixi',url:'/tarix'},{label:'Sabiq rektorlarımız',url:'/sabiq-rektorlar'},{label:'ADDA Qəhrəmanları',url:'#'},{label:'Fəxri doktorlarımız',url:'#'},{label:'Fəxri məzunlar',url:'#'},{label:'ADDA reytinqlərdə',url:'#'},{label:'Rəqəmlər və faktlar',url:'#'}] },
      { title: 'Rəhbərlik və idarəetmə', links: [{label:'Rektor',url:'#'},{label:'Rəhbərlik',url:'#'},{label:'Elmi Şura',url:'#'},{label:'Himayəçilər Şurası',url:'#'},{label:'Təşkilati struktur',url:'#'},{label:'Fakültələr',url:'/fakulteler'},{label:'Kafedralar',url:'/kafedralar'}] },
      { title: 'Hüquqi baza və etika', links: [{label:'Nizamnamə və təsis sənədləri',url:'#'},{label:'Normativ-hüquqi sənədlər',url:'#'},{label:'Struktur bölmələrin əsasnamələri',url:'#'},{label:'Akademik dürüstlük bəyannaməsi',url:'#'},{label:'ADDA etika kodeksi',url:'#'},{label:'Müraciətlərə baxılma qaydası',url:'#'}] },
      { title: 'Keyfiyyət və hesabatlılıq', links: [{label:'Keyfiyyət siyasəti',url:'/sertifikatlar#keyfiyyet-sahesinde-siyaset'},{label:'Akkreditasiya və sertifikatlar',url:'/sertifikatlar'},{label:'İllik fəaliyyət hesabatları',url:'#'},{label:'Özünüqiymətləndirmə nəticələri',url:'#'},{label:'Tələbə və məzun sorğuları',url:'#'},{label:'Məzunların məşğulluq göstəriciləri',url:'#'},{label:'Dayanıqlı inkişaf',url:'#'}] },
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
    // F5.47 — «Elm və innovasiya» v1 (adda-strapi/src/utils/menu-elm.ts ELM_MENU_V1 ilə eyni).
    { label: 'Elm və innovasiya', order: 4, url: '/sehife/elmi-tedqiqat-fealiyyeti', groups: [
      { title: 'Tədqiqat', links: [{label:'Ümumi baxış',url:'/sehife/elmi-tedqiqat-fealiyyeti'},{label:'Elmi-tədqiqat laboratoriyaları',url:'/sehife/elmi-tedqiqat-laboratoriyalari'},{label:'Elmi-tədqiqat şöbəsi',url:'/struktur/elmi-tedqiqat-ve-beynelxalq-elaqeler-sobesi'}] },
      { title: 'Nəşrlər və resurslar', links: [{label:'«Elmi Əsərlər» jurnalı',url:'/sehife/elmi-jurnal'},{label:'Elm Portalı (CRIS)',url:'https://cris.adda.edu.az'},{label:'Kitabxana və elektron resurslar',url:'/sehife/elektron-kitabxana'}] },
      { title: 'Doktorantura və gənc alimlər', links: [{label:'Doktorantura',url:'/sehife/doktorantura'},{label:'Gənc alimlər və tədqiqatçılar',url:'/sehife/genc-alimler-surasi'}] },
      { title: 'Konfranslar və qrantlar', links: [{label:'Elmi konfranslar',url:'/sehife/elmi-konfranslar'},{label:'Qrantlar və müsabiqələr',url:'/sehife/qrantlar'}] },
    ]},
    // F5.48 — «Tələbə həyatı» və «Beynəlxalq əlaqələr» v1 (adda-strapi/src/utils/menu-telebe-beynelxalq.ts ilə eyni).
    { label: 'Tələbə həyatı', order: 5, url: '/sehife/telebe-heyati', groups: [
      { title: 'Tələbə üçün', links: [{label:'Ümumi baxış',url:'/sehife/telebe-heyati'},{label:'Yataqxana',url:'/sehife/yataqxana'},{label:'Təqaüd və sosial dəstək',url:'/sehife/sosial-teminat-ve-maddi-yardim'}] },
      { title: 'Tələbə təşkilatları', links: [{label:'Tələbə Gənclər Təşkilatı',url:'/sehife/telebe-gencler-teskilati'},{label:'Tələbə Həmkarlar İttifaqı Komitəsi',url:'/sehife/telebe-hemkarlar-ittifaqi-komitesi'},{label:'Tələbə Elmi Cəmiyyəti',url:'/sehife/telebe-elmi-cemiyyeti'}] },
      { title: 'İdman, mədəniyyət və tədbirlər', links: [{label:'İdman',url:'/sehife/idman'},{label:'Mədəniyyət və yaradıcılıq',url:'/sehife/medeniyyet-ve-yaradiciliq-dernekleri'},{label:'Tədbirlər təqvimi',url:'/tedbirler'}] },
    ]},
    { label: 'Beynəlxalq əlaqələr', order: 6, url: '/sehife/beynelxalq-emekdasliq', groups: [
      { title: 'Əməkdaşlıq', links: [{label:'Ümumi baxış',url:'/sehife/beynelxalq-emekdasliq'},{label:'Akademik tərəfdaşlar',url:'/sehife/akademik-terefdaslar'},{label:'Beynəlxalq əlaqələr şöbəsi',url:'/struktur/elmi-tedqiqat-ve-beynelxalq-elaqeler-sobesi'}] },
      { title: 'Mobillik və ikili diplom', links: [{label:'Mübadilə və Erasmus+',url:'/sehife/mobillik-ve-mubadile'},{label:'İkili diplom proqramları',url:'/sehife/ikili-diplom-layiheleri'},{label:'İxtisasartırma və xaricdə təhsil',url:'/sehife/xaricde-tehsil-ve-ixtisasartirma'}] },
      { title: 'Əcnəbi tələbələr', links: [{label:'Qəbul qaydaları və təhsil haqqı',url:'/sehife/ecnebi-telebelerin-qebulu-qaydalari'},{label:'Əcnəbi tələbələr üçün bələdçi',url:'/sehife/ecnebi-telebelerin-tehsili'},{label:'İngilis dilində tədris',url:'/sehife/ingilis-dilinde-tedris'}] },
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
    // F5.49 — «Tez-tez verilən suallar» (adda-strapi/src/utils/menu-f549.ts ilə eyni).
    { label: 'FAQ', order: 4, url: '/sehife/faq', groups: [] },
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
    // F5.49
    { label: 'Tərəfdaşlar və işəgötürənlər', url: '/bunlar-ucun/terefdaslar' },
  ],
  suretliKecidler: [
    { label: 'Tələbə kabineti', url: '#', icon: 'device-laptop' }, { label: 'Elektron jurnal', url: '#', icon: 'notebook' },
    { label: 'E-Kitabxana', url: '#', icon: 'books' }, { label: 'Dərs cədvəli', url: '#', icon: 'calendar' },
    { label: 'Karyera Mərkəzi', url: '#', icon: 'briefcase' }, { label: 'Əlaqə', url: '#', icon: 'mail' },
  ],
  footerMenyusu: [
    { title: 'Akademiya', links: [{label:'Haqqımızda',url:'#'},{label:'Rəhbərlik',url:'#'},{label:'Struktur',url:'#'},{label:'Tarix',url:'#'},{label:'Akkreditasiya',url:'/sertifikatlar'}] },
    { title: 'Qəbul', links: [{label:'Bakalavr qəbulu',url:'/sehife/bakalavriat'},{label:'Magistratura qəbulu',url:'/sehife/magistratura'},{label:'Keçid balları, yer sayı və təhsil haqqı',url:'/sehife/kecid-ballari'},{label:'Onlayn müraciət',url:'/sehife/onlayn-muraciet'}] },
    { title: 'Təhsil', links: [{label:'İxtisaslar',url:'/ixtisaslar'},{label:'Bakalavriat',url:'/ixtisaslar?tab=bakalavr'},{label:'Magistratura',url:'/ixtisaslar?tab=magistr'},{label:'Qiyabi və təkrar ali təhsil',url:'/ixtisaslar?tab=tekrar_ali'},{label:'Təcrübə (praktika)',url:'/sehife/tecrube-haqqinda'}] },
    { title: 'Universitet', links: [{label:'Elm və innovasiya',url:'/sehife/elmi-tedqiqat-fealiyyeti'},{label:'Tələbə həyatı',url:'/sehife/telebe-heyati'},{label:'Beynəlxalq əməkdaşlıq',url:'/sehife/beynelxalq-emekdasliq'},{label:'Xəbərlər',url:'#'},{label:'Kampus',url:'#'}] },
  ],
};

export const FALLBACK_EACAD = FALLBACK_MENU.eAkademiya as MenuPortal;
