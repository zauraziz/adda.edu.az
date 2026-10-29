// K30 — «Bunlar üçün» auditoriya səhifələri.
//
// NƏ ÜÇÜNDÜR. Header-dəki `infofor-menu` auditoriya bəndləri göstərir; bu
// modul onların hər birinə real səhifə verir: saytın həmin auditoriya üçün
// kəsilmiş versiyası.
//
// NİYƏ STRAPI-DƏ DEYİL. Bu, məzmun deyil — NAVİQASİYA KURATORLUĞUDUR.
// Hər link mövcud marşruta işarə etməlidir; hansı səhifənin hazır olduğunu
// isə repo bilir, redaktor yox. Yeni səhifə hazır olanda onsuz da repoya
// toxunulur; həmin an bura da əlavə edilir. Suallar isə Strapi-dəndir:
// `faqFrom` — hansı səhifələrin «Suallar» bölməsi göstərilir (redaktor öz
// səhifəsində dəyişir, burada da yenilənir).
//
// F5.49 — HSE.ru auditoriya bölmələri (Admissions, International Support,
// Alumni, Faculty & Staff, International Partnerships) və digər menyuların
// qaydası ilə: fakt zolağı, addımlar («… yolu»), bölmələr, canlı lent
// (`feed`, lib/strapi.ts → TITLE_FEEDS), suallar, «Sual ver» (`appeal` —
// müraciət formasının istiqaməti). YENİ: «Tərəfdaşlar və işəgötürənlər».
//
// ETİKETLƏR `tr()`-dən keçir — burada yalnız Azərbaycan dilində yazılır.
// `npm run check:audiences` hər mətnin lüğətdə, hər keçidin marşrutda olduğunu
// yoxlayır (massiv düz literal qalmalıdır — skript onu eval edir; massivdən
// sonra kodda «]» işlətmə).
import type { Locale } from './i18n';
import type { TitleFeed } from './strapi';

export interface AudLink {
  /** i18n lüğətindəki açar (az). */
  label: string;
  href: string;
}
export interface AudStep extends AudLink {
  /** Kartın altındakı bir sətirlik izah. */
  note: string;
}
export interface AudGroup {
  title: string;
  links: AudLink[];
}
export interface AudFact {
  label: string;
  value: string;
  /** Tabler ikonu (ti-…). */
  icon: string;
}
export interface Audience {
  slug: string;
  /** Menyudakı etiket — i18n-də artıq var. */
  label: string;
  icon: string;
  lead: string;
  facts?: AudFact[];
  /** Addımlar blokunun başlığı; yoxdursa «İlk addımlar». */
  stepsTitle?: string;
  steps: AudStep[];
  groups: AudGroup[];
  /** Canlı lent (tədbir və xəbər başlığında açar sözlər). */
  feed?: TitleFeed;
  /** «Suallar»-ı göstərilən səhifələr (slug), sıra ilə. */
  faqFrom?: string[];
  /** «Sual ver» — müraciət formasının istiqaməti (boş — ümumi forma). */
  appeal?: string;
}

export const AUDIENCES: Audience[] = [
  {
    slug: 'abituriyentler',
    label: 'Abituriyentlər',
    icon: 'ti-school',
    lead: 'Pilləni və ixtisası seçin, keçid balını yoxlayın, qəbul addımlarını izləyin — Akademiyaya yol bir səhifədə.',
    facts: [
      { label: 'Diplom tanınır', value: '170-dən çox ölkədə', icon: 'ti-world' },
      { label: 'Yataqxana', value: '311 yer', icon: 'ti-building' },
      { label: 'Forma və dərslik', value: 'Ödənişsiz', icon: 'ti-shield-check' },
      { label: 'Dəniz təcrübəsi', value: 'Tədris gəmisi və ASCO gəmiləri', icon: 'ti-ship' },
    ],
    stepsTitle: 'Abituriyentin yolu',
    steps: [
      // F5.44/F5.45 — «Qəbul» menyusunun başlığı bura aparır: qruplar menyu
      // ilə eynidir (adda-strapi/src/utils/menu-qebul.ts, QEBUL_MENU_V2).
      { label: 'İxtisaslar', href: '/ixtisaslar', note: 'Kataloq: dil, müddət, təhsil forması' },
      { label: 'Keçid balları, yer sayı və təhsil haqqı', href: '/sehife/kecid-ballari', note: 'Hər ixtisas üzrə — proqram kataloqunda' },
      { label: 'Bakalavriat', href: '/sehife/bakalavriat', note: 'DİM-də ərizə, ixtisas seçimi və tibbi müayinə' },
      { label: 'Açıq qapı günləri', href: '/sehife/aciq-qapi-gunleri', note: 'Akademiyanı yerində görün' },
      { label: 'Onlayn müraciət', href: '/sehife/onlayn-muraciet', note: 'Sualınızı yazın — cavab e-poçtunuza gəlir' },
    ],
    groups: [
      {
        title: 'Pillələr üzrə qəbul',
        links: [
          { label: 'Subbakalavr (kollec)', href: '/sehife/subbakalavr' },
          { label: 'Bakalavriat', href: '/sehife/bakalavriat' },
          { label: 'Magistratura', href: '/sehife/magistratura' },
          { label: 'Doktorantura', href: '/sehife/doktorantura' },
          { label: 'Təkrar ali təhsil', href: '/sehife/tekrar-ali-tehsil' },
        ],
      },
      {
        title: 'İxtisas seçimi',
        links: [
          { label: 'Keçid balları, yer sayı və təhsil haqqı', href: '/sehife/kecid-ballari' },
          { label: 'Məzunların işlə təminatı', href: '/sehife/mezunlarin-isle-teminati' },
          { label: 'Yataqxana', href: '/sehife/yataqxana' },
        ],
      },
      {
        title: 'Əcnəbi vətəndaşlar',
        links: [
          { label: 'Qəbul qaydaları və təhsil haqqı', href: '/sehife/ecnebi-telebelerin-qebulu-qaydalari' },
          { label: 'İngilis dilində tədris', href: '/sehife/ingilis-dilinde-tedris' },
        ],
      },
      {
        title: 'Tanışlıq və əlaqə',
        links: [
          { label: 'Açıq qapı günləri', href: '/sehife/aciq-qapi-gunleri' },
          { label: 'Onlayn müraciət', href: '/sehife/onlayn-muraciet' },
          { label: 'Tez-tez verilən suallar', href: '/sehife/faq' },
        ],
      },
      {
        title: 'Akademiya haqqında',
        links: [
          { label: 'Akademiyanın tarixi', href: '/tarix' },
          { label: 'ADDA dünən və bu gün', href: '/sehife/adda-dunen-ve-bugun' },
          { label: 'ASCO və Akademiya', href: '/sehife/asco-ve-akademiya' },
          { label: 'Struktur', href: '/struktur' },
          { label: 'Muzey', href: '/sehife/muzey' },
        ],
      },
      {
        // F5.48 — «Tələbə həyatı» menyusu (adda-strapi/src/utils/menu-telebe-beynelxalq.ts).
        title: 'Tələbə həyatı',
        links: [
          { label: 'Tələbə həyatı', href: '/sehife/telebe-heyati' },
          { label: 'Təqaüd və sosial dəstək', href: '/sehife/sosial-teminat-ve-maddi-yardim' },
          { label: 'İdman', href: '/sehife/idman' },
          { label: 'Tələbə Gənclər Təşkilatı', href: '/sehife/telebe-gencler-teskilati' },
        ],
      },
    ],
    feed: 'abituriyent',
    faqFrom: ['bakalavriat', 'kecid-ballari', 'yataqxana'],
    appeal: 'qebul',
  },
  {
    slug: 'telebeler',
    label: 'Tələbələr',
    icon: 'ti-book',
    lead: 'Tədris, resurslar, təşkilatlar və kampus — gündəlik lazım olanlar.',
    facts: [
      { label: 'Tələbə təşkilatı', value: '3', icon: 'ti-users' },
      { label: 'Təqaüd', value: 'Hər semestr', icon: 'ti-cash' },
      { label: 'Yataqxana', value: '311 yer', icon: 'ti-building' },
      { label: 'Tələbə konfransı', value: 'Hər yaz', icon: 'ti-presentation' },
    ],
    stepsTitle: 'Tələbə üçün addımlar',
    steps: [
      { label: 'Tədris ofisi', href: '/struktur/tedris-proseslerinin-teskili-sobesi', note: 'Dərs cədvəli, arayışlar və sənədlər' },
      { label: 'Elektron kitabxana', href: '/sehife/elektron-kitabxana', note: 'Fond, Elektron Akademiya və açıq resurslar' },
      { label: 'Təcrübə (praktika)', href: '/sehife/tecrube-haqqinda', note: 'Növlər, müddət, bazalar və işçi diplomu' },
      { label: 'Təqaüd və sosial dəstək', href: '/sehife/sosial-teminat-ve-maddi-yardim', note: 'Təqaüd növləri və ödənişsiz təminat' },
      { label: 'Tələbə həyatı', href: '/sehife/telebe-heyati', note: 'Təşkilatlar, idman, mədəniyyət və tədbirlər' },
    ],
    groups: [
      {
        title: 'Tədris',
        links: [
          { label: 'Fakültələr', href: '/fakulteler' },
          { label: 'İxtisaslar', href: '/ixtisaslar' },
          { label: 'Təcrübə (praktika)', href: '/sehife/tecrube-haqqinda' },
          { label: 'Tədris gəmisi', href: '/sehife/tedris-gemisi' },
          { label: 'Tədris proseslərinin təşkili şöbəsi', href: '/struktur/tedris-proseslerinin-teskili-sobesi' },
        ],
      },
      {
        title: 'Resurslar',
        links: [
          { label: 'Elektron kitabxana', href: '/sehife/elektron-kitabxana' },
          { label: 'İnformasiya Resurs Mərkəzi', href: '/struktur/informasiya-resurs-merkezi' },
          { label: 'Laboratoriya və trenajorlar', href: '/auditoriyalar' },
        ],
      },
      {
        title: 'Tələbə təşkilatları',
        links: [
          { label: 'Tələbə Gənclər Təşkilatı', href: '/sehife/telebe-gencler-teskilati' },
          { label: 'Tələbə Elmi Cəmiyyəti', href: '/sehife/telebe-elmi-cemiyyeti' },
          { label: 'Tələbə Həmkarlar İttifaqı Komitəsi', href: '/sehife/telebe-hemkarlar-ittifaqi-komitesi' },
        ],
      },
      {
        title: 'Kampus',
        links: [
          { label: 'Tələbə həyatı', href: '/sehife/telebe-heyati' },
          { label: 'Yataqxana', href: '/sehife/yataqxana' },
          { label: 'Təqaüd və sosial dəstək', href: '/sehife/sosial-teminat-ve-maddi-yardim' },
          { label: 'İdman', href: '/sehife/idman' },
          { label: 'Mədəniyyət və yaradıcılıq', href: '/sehife/medeniyyet-ve-yaradiciliq-dernekleri' },
          { label: 'Muzey', href: '/sehife/muzey' },
        ],
      },
      {
        title: 'Elmi fəaliyyət',
        links: [
          { label: 'Elmi jurnal', href: '/sehife/elmi-jurnal' },
          { label: 'Elmi konfranslar', href: '/sehife/elmi-konfranslar' },
          { label: 'Gənc alimlər və tədqiqatçılar', href: '/sehife/genc-alimler-surasi' },
        ],
      },
    ],
    feed: 'tedbirler',
    faqFrom: ['telebe-heyati', 'sosial-teminat-ve-maddi-yardim', 'tecrube-haqqinda'],
    appeal: 'tedris',
  },
  {
    slug: 'mezunlar',
    label: 'Məzunlar',
    icon: 'ti-award',
    lead: 'Sertifikatın yenilənməsi, ixtisasartırma, xaricdə magistratura və Akademiya ilə bağlılıq.',
    facts: [
      { label: 'Diplom tanınır', value: '170-dən çox ölkədə', icon: 'ti-world' },
      { label: 'STCW kursları', value: 'Təlim-Tədris Mərkəzi', icon: 'ti-certificate' },
      { label: 'Xaricdə magistratura', value: 'ASCO təqaüd proqramı', icon: 'ti-school' },
    ],
    stepsTitle: 'Məzun üçün imkanlar',
    steps: [
      { label: 'STCW kursları', href: '/struktur/telim-tedris-merkezi', note: 'Sertifikatın yenilənməsi və ixtisasartırma' },
      { label: 'İxtisasartırma və xaricdə təhsil', href: '/sehife/xaricde-tehsil-ve-ixtisasartirma', note: 'ASCO-nun Gəmiçilikdə Təqaüd Proqramı' },
      { label: 'Məzunların işlə təminatı', href: '/sehife/mezunlarin-isle-teminati', note: 'Harada işləyirlər, karyera dəstəyi' },
      { label: 'Doktorantura', href: '/sehife/doktorantura', note: 'Elmi karyeraya davam' },
      { label: 'Qəhrəmanlarımız', href: '/qehremanlarimiz', note: 'Vətən uğrunda şəhid olan məzunlar' },
    ],
    groups: [
      {
        title: 'Karyera və təhsil',
        links: [
          { label: 'Məzunların işlə təminatı', href: '/sehife/mezunlarin-isle-teminati' },
          { label: 'STCW kursları', href: '/struktur/telim-tedris-merkezi' },
          { label: 'İxtisasartırma və xaricdə təhsil', href: '/sehife/xaricde-tehsil-ve-ixtisasartirma' },
          { label: 'Magistratura', href: '/sehife/magistratura' },
          { label: 'Doktorantura', href: '/sehife/doktorantura' },
        ],
      },
      {
        title: 'Akademiya',
        links: [
          { label: 'Akademiyanın tarixi', href: '/tarix' },
          { label: 'ADDA dünən və bu gün', href: '/sehife/adda-dunen-ve-bugun' },
          { label: 'ASCO və Akademiya', href: '/sehife/asco-ve-akademiya' },
          { label: 'Sabiq rektorlarımız', href: '/sabiq-rektorlar' },
          { label: 'Struktur', href: '/struktur' },
        ],
      },
      {
        title: 'Elm və nəşrlər',
        links: [
          { label: 'Elmi jurnal', href: '/sehife/elmi-jurnal' },
          // F5.47: köhnə «onlayn versiya» səhifəsi jurnalın içindədir (301).
          { label: 'Elm və innovasiya', href: '/sehife/elmi-tedqiqat-fealiyyeti' },
          { label: 'Elmi konfranslar', href: '/sehife/elmi-konfranslar' },
        ],
      },
      {
        title: 'Xatirə və kimlik',
        links: [
          { label: 'Qəhrəmanlarımız', href: '/qehremanlarimiz' },
          { label: 'Muzey', href: '/sehife/muzey' },
          { label: 'Korporativ üslub', href: '/sehife/korporativ-uslub' },
        ],
      },
    ],
    feed: 'mezunlar',
    faqFrom: ['xaricde-tehsil-ve-ixtisasartirma', 'mezunlarin-isle-teminati', 'doktorantura'],
  },
  {
    slug: 'emekdaslar',
    label: 'Əməkdaşlar',
    icon: 'ti-id-badge-2',
    lead: 'Heyət, struktur bölmələri, elmi fəaliyyət və şəxsi profil idarəetməsi.',
    facts: [
      { label: 'Profil', value: 'Özünüz yeniləyirsiniz', icon: 'ti-user-edit' },
      { label: 'Qrantlar', value: 'Elm Fondunun müsabiqələri', icon: 'ti-trophy' },
      { label: 'Elmi jurnal', value: '2003-cü ildən', icon: 'ti-book' },
    ],
    stepsTitle: 'Əməkdaş üçün addımlar',
    steps: [
      { label: 'Profilim', href: '/profil', note: 'Öz məlumatlarını özün yenilə' },
      { label: 'Elm və innovasiya', href: '/sehife/elmi-tedqiqat-fealiyyeti', note: 'Tədqiqatçı üçün addımlar' },
      { label: 'Qrantlar və müsabiqələr', href: '/sehife/qrantlar', note: 'Elm Fondunun müsabiqələrinə hazırlıq' },
      { label: 'Elmi jurnal', href: '/sehife/elmi-jurnal', note: 'Məqalə təqdimi və tərtib qaydaları' },
      { label: 'Elmi Şura', href: '/struktur/elmi-sura', note: 'Tərkib və iclas qaydaları' },
    ],
    groups: [
      {
        title: 'Heyət',
        links: [
          { label: 'Professor-müəllim heyəti', href: '/heyet/professor-muellim' },
          { label: 'İnzibati heyət', href: '/heyet/inzibati' },
          { label: 'Təlimçi-texniki heyət', href: '/heyet/telimci-texniki' },
          { label: 'Rəhbərlik', href: '/rehberlik' },
        ],
      },
      {
        title: 'Struktur bölmələri',
        links: [
          { label: 'Struktur', href: '/struktur' },
          { label: 'Personalın idarə edilməsi, əmək haqqı şöbəsi və kargüzarlıq şöbəsi', href: '/struktur/personalin-idareedilmesi-emek-haqqi-ve-karguzarliq-sobesi' },
          { label: 'Mühasibat uçotu və hesabat şöbəsi', href: '/struktur/muhasibat-ucotu-ve-hesabati-sobesi' },
          { label: 'Tədris proseslərinin təşkili şöbəsi', href: '/struktur/tedris-proseslerinin-teskili-sobesi' },
        ],
      },
      {
        title: 'Elmi fəaliyyət',
        links: [
          { label: 'Elmi Şura', href: '/struktur/elmi-sura' },
          { label: 'Elm və innovasiya', href: '/sehife/elmi-tedqiqat-fealiyyeti' },
          { label: 'Elmi-tədqiqat laboratoriyaları', href: '/sehife/elmi-tedqiqat-laboratoriyalari' },
          { label: 'Elmi jurnal', href: '/sehife/elmi-jurnal' },
          { label: 'Qrantlar və müsabiqələr', href: '/sehife/qrantlar' },
          { label: 'Elmi katib', href: '/struktur/elmi-katib' },
        ],
      },
      {
        title: 'Beynəlxalq',
        links: [
          { label: 'Beynəlxalq əməkdaşlıq', href: '/sehife/beynelxalq-emekdasliq' },
          { label: 'Mübadilə və Erasmus+', href: '/sehife/mobillik-ve-mubadile' },
          { label: 'Xaricdə təhsil və ixtisasartırma', href: '/sehife/xaricde-tehsil-ve-ixtisasartirma' },
        ],
      },
    ],
    feed: 'emekdaslar',
    faqFrom: ['elmi-tedqiqat-fealiyyeti', 'qrantlar', 'elmi-jurnal'],
    appeal: 'elm',
  },
  {
    slug: 'beynelxalq-telebeler',
    label: 'Beynəlxalq tələbələr',
    icon: 'ti-world',
    lead: 'Əcnəbi vətəndaşlar üçün qəbul qaydaları, gəliş, qeydiyyat, təhsil şəraiti və yaşayış.',
    facts: [
      { label: 'Təhsil haqqı (2026/2027)', value: '5100 AZN/il', icon: 'ti-cash' },
      { label: 'Yataqxana, forma, dərs vəsaiti', value: 'Ödənişsiz', icon: 'ti-building' },
      { label: 'Tədris dili', value: 'Azərbaycan, ingilis, rus', icon: 'ti-language' },
      { label: 'Diplom tanınır', value: '170-dən çox ölkədə', icon: 'ti-world' },
    ],
    stepsTitle: 'Gəlişdən dərslərə qədər',
    steps: [
      { label: 'Əcnəbi tələbələrin qəbulu qaydaları', href: '/sehife/ecnebi-telebelerin-qebulu-qaydalari', note: 'Sənədlər və müraciət ardıcıllığı' },
      // F5.48 — qəbuldan sonrası: gəliş, miqrasiya qeydiyyatı, yataqxana.
      { label: 'Əcnəbi tələbələr üçün bələdçi', href: '/sehife/ecnebi-telebelerin-tehsili', note: 'Gəliş, qeydiyyat, yaşayış və dəstək' },
      { label: 'İngilis dilində tədris', href: '/sehife/ingilis-dilinde-tedris', note: 'Tədris dili və proqramlar' },
      { label: 'Yataqxana', href: '/sehife/yataqxana', note: 'Əcnəbi tələbələr üçün ödənişsiz' },
      { label: 'Beynəlxalq əlaqələr şöbəsi', href: '/struktur/elmi-tedqiqat-ve-beynelxalq-elaqeler-sobesi', note: 'Gəlişdən məzuniyyətə qədər kömək' },
    ],
    groups: [
      {
        title: 'Qəbul',
        links: [
          { label: 'Əcnəbi tələbələrin qəbulu qaydaları', href: '/sehife/ecnebi-telebelerin-qebulu-qaydalari' },
          { label: 'İngilis dilində tədris', href: '/sehife/ingilis-dilinde-tedris' },
          { label: 'Bakalavriat', href: '/sehife/bakalavriat' },
          { label: 'Magistratura', href: '/sehife/magistratura' },
        ],
      },
      {
        // F5.48 — «Beynəlxalq əlaqələr» menyusu; köhnə «qrup» səhifəsi şöbəyə köçüb (dedupe:v3).
        title: 'Beynəlxalq əlaqələr',
        links: [
          { label: 'Beynəlxalq əməkdaşlıq', href: '/sehife/beynelxalq-emekdasliq' },
          { label: 'Akademik tərəfdaşlar', href: '/sehife/akademik-terefdaslar' },
          { label: 'Mübadilə və Erasmus+', href: '/sehife/mobillik-ve-mubadile' },
          { label: 'İkili diplom proqramları', href: '/sehife/ikili-diplom-layiheleri' },
          { label: 'Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsi', href: '/struktur/elmi-tedqiqat-ve-beynelxalq-elaqeler-sobesi' },
        ],
      },
      {
        title: 'Təhsil',
        links: [
          { label: 'Fakültələr', href: '/fakulteler' },
          { label: 'İxtisaslar', href: '/ixtisaslar' },
          { label: 'Akademiyanın tarixi', href: '/tarix' },
        ],
      },
      {
        title: 'Yaşayış',
        links: [
          { label: 'Əcnəbi tələbələr üçün bələdçi', href: '/sehife/ecnebi-telebelerin-tehsili' },
          { label: 'Yataqxana', href: '/sehife/yataqxana' },
          { label: 'Tələbə həyatı', href: '/sehife/telebe-heyati' },
          { label: 'Əlaqə', href: '/elaqe' },
        ],
      },
    ],
    feed: 'beynelxalq',
    faqFrom: ['ecnebi-telebelerin-qebulu-qaydalari', 'ecnebi-telebelerin-tehsili', 'ingilis-dilinde-tedris'],
    appeal: 'beynelxalq',
  },
  {
    slug: 'valideynler',
    label: 'Valideynlər',
    icon: 'ti-users',
    lead: 'Akademiya nədir, övladınız hansı ixtisasa yiyələnir və hansı şəraitdə oxuyur.',
    facts: [
      { label: 'Forma və dərslik', value: 'Ödənişsiz', icon: 'ti-shield-check' },
      { label: 'Yataqxana', value: '311 yer', icon: 'ti-building' },
      { label: 'Diplom tanınır', value: '170-dən çox ölkədə', icon: 'ti-world' },
      { label: 'Tabe olduğu qurum', value: 'ASCO', icon: 'ti-ship' },
    ],
    stepsTitle: 'Valideyn üçün əsas suallar',
    steps: [
      { label: 'ADDA dünən və bu gün', href: '/sehife/adda-dunen-ve-bugun', note: 'Akademiya haqqında qısa təsəvvür' },
      { label: 'İxtisaslar', href: '/ixtisaslar', note: 'Məzun hansı peşəni alır' },
      { label: 'Yataqxana', href: '/sehife/yataqxana', note: 'Yaşayış və qayğı şəraiti' },
      { label: 'Təqaüd və sosial dəstək', href: '/sehife/sosial-teminat-ve-maddi-yardim', note: 'Təqaüd və ödənişsiz təminat' },
      { label: 'Məzunların işlə təminatı', href: '/sehife/mezunlarin-isle-teminati', note: 'Məzunlar harada işləyir' },
    ],
    groups: [
      {
        title: 'Akademiya haqqında',
        links: [
          { label: 'Akademiyanın tarixi', href: '/tarix' },
          { label: 'ADDA dünən və bu gün', href: '/sehife/adda-dunen-ve-bugun' },
          { label: 'ASCO və Akademiya', href: '/sehife/asco-ve-akademiya' },
          { label: 'Struktur', href: '/struktur' },
          { label: 'Sabiq rektorlarımız', href: '/sabiq-rektorlar' },
        ],
      },
      {
        title: 'Təhsil',
        links: [
          { label: 'Bakalavriat', href: '/sehife/bakalavriat' },
          { label: 'İxtisaslar', href: '/ixtisaslar' },
          { label: 'Fakültələr', href: '/fakulteler' },
          { label: 'Təcrübə (praktika)', href: '/sehife/tecrube-haqqinda' },
        ],
      },
      {
        title: 'Şərait və qayğı',
        links: [
          { label: 'Yataqxana', href: '/sehife/yataqxana' },
          { label: 'Təqaüd və sosial dəstək', href: '/sehife/sosial-teminat-ve-maddi-yardim' },
          { label: 'Tələbə həyatı', href: '/sehife/telebe-heyati' },
          { label: 'İdman', href: '/sehife/idman' },
          { label: 'Qəhrəmanlarımız', href: '/qehremanlarimiz' },
        ],
      },
      {
        title: 'Əlaqə',
        links: [
          { label: 'Tez-tez verilən suallar', href: '/sehife/faq' },
          { label: 'Xəbərlər', href: '/xeberler' },
          { label: 'Əlaqə', href: '/elaqe' },
        ],
      },
    ],
    feed: 'tedbirler',
    faqFrom: ['yataqxana', 'sosial-teminat-ve-maddi-yardim', 'bakalavriat'],
    appeal: 'qebul',
  },
  {
    // F5.49 — YENİ: gəmiçilik şirkətləri, limanlar, universitetlər (HSE: International Partnerships).
    slug: 'terefdaslar',
    label: 'Tərəfdaşlar və işəgötürənlər',
    icon: 'ti-briefcase',
    lead: 'Gəmiçilik şirkətləri, limanlar və universitetlər üçün: təcrübə bazası olmaq, məzunları işə götürmək, heyəti STCW kurslarında hazırlamaq, birgə layihələr.',
    facts: [
      { label: 'Diplom tanınır', value: '170-dən çox ölkədə', icon: 'ti-world' },
      { label: 'IAMU üzvü', value: '2016-cı ildən', icon: 'ti-anchor' },
      { label: 'Memorandum (yanvar–iyul 2026)', value: '5', icon: 'ti-file-text' },
      { label: 'Tabe olduğu qurum', value: 'ASCO', icon: 'ti-ship' },
    ],
    stepsTitle: 'Əməkdaşlıq necə başlayır',
    steps: [
      { label: 'Təklif göndərin', href: '/vetendaslarin-muracieti?istiqamet=beynelxalq', note: 'Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsinə' },
      { label: 'Tərəfdaşlıq necə qurulur', href: '/sehife/beynelxalq-emekdasliq', note: 'Görüş, memorandum, fəaliyyət planı' },
      { label: 'Təcrübə bazası olun', href: '/sehife/tecrube-haqqinda', note: 'Kursantların gəmidə və zavodda təcrübəsi' },
      { label: 'Məzunları işə götürün', href: '/sehife/mezunlarin-isle-teminati', note: 'İxtisaslar və məzunların işlədiyi yerlər' },
      { label: 'Heyətinizi hazırlayın', href: '/struktur/telim-tedris-merkezi', note: 'STCW kursları və trenajorlar' },
    ],
    groups: [
      {
        title: 'Əməkdaşlıq',
        links: [
          { label: 'Beynəlxalq əməkdaşlıq', href: '/sehife/beynelxalq-emekdasliq' },
          { label: 'Akademik tərəfdaşlar', href: '/sehife/akademik-terefdaslar' },
          { label: 'ASCO və Akademiya', href: '/sehife/asco-ve-akademiya' },
          { label: 'Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsi', href: '/struktur/elmi-tedqiqat-ve-beynelxalq-elaqeler-sobesi' },
        ],
      },
      {
        title: 'Kadr hazırlığı',
        links: [
          { label: 'İxtisaslar', href: '/ixtisaslar' },
          { label: 'Təcrübə (praktika)', href: '/sehife/tecrube-haqqinda' },
          { label: 'Tədris gəmisi', href: '/sehife/tedris-gemisi' },
          { label: 'Məzunların işlə təminatı', href: '/sehife/mezunlarin-isle-teminati' },
        ],
      },
      {
        title: 'Təlim və infrastruktur',
        links: [
          { label: 'STCW kursları', href: '/struktur/telim-tedris-merkezi' },
          { label: 'Laboratoriya və trenajorlar', href: '/auditoriyalar' },
          { label: 'Elmi-tədqiqat laboratoriyaları', href: '/sehife/elmi-tedqiqat-laboratoriyalari' },
        ],
      },
      {
        title: 'Elm və layihələr',
        links: [
          { label: 'Elm və innovasiya', href: '/sehife/elmi-tedqiqat-fealiyyeti' },
          { label: 'Qrantlar və müsabiqələr', href: '/sehife/qrantlar' },
          { label: 'Elmi konfranslar', href: '/sehife/elmi-konfranslar' },
          { label: 'Mübadilə və Erasmus+', href: '/sehife/mobillik-ve-mubadile' },
        ],
      },
    ],
    feed: 'terefdaslar',
    faqFrom: ['beynelxalq-emekdasliq', 'akademik-terefdaslar', 'tecrube-haqqinda'],
    appeal: 'beynelxalq',
  },
];

export function audienceBySlug(slug: string): Audience | undefined {
  return AUDIENCES.find((a) => a.slug === slug);
}

export function audienceHref(slug: string, locale: Locale): string {
  return `/${locale}/bunlar-ucun/${slug}`;
}
