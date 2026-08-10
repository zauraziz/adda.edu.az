import { createHash } from 'node:crypto';
import type { Core } from '@strapi/strapi';

/**
 * ADDA — "Menyu" single-type seed.
 * Boşdursa doldurur (Strapi single-type-da boş giriş avtomatik yaradır,
 * ona görə create yerinə "boşdursa update/create" məntiqi işlədilir).
 */

/**
 * Public rol üçün oxu icazələri (find / findOne).
 * Strapi 5-də icazə qeydinin MÖVCUDLUĞU = icazə verilmiş deməkdir (enabled sütunu yoxdur).
 * Bu blok yalnız ƏLAVƏ edir — heç bir icazəni silmir və ya söndürmür.
 */
const PUBLIC_READ_UIDS = [
  'api::announcement.announcement',
  'api::article.article',
  'api::department.department',
  'api::document.document',
  'api::event.event',
  'api::faculty.faculty',
  'api::menu.menu',
  'api::milestone.milestone',
  'api::page.page',
  'api::person.person',
  'api::program.program',
  'api::rector.rector',
  'api::social-block.social-block',
  'api::social-post.social-post',
  'api::reaction.reaction',
  'api::tag.tag',
  'api::unit.unit',
];

// Public rol — YAZ (create) icazələri: crowdsourced submission tipləri.
// QEYD: acıq yaz endpointləridir → istehsalda rate-limit / captcha / validasiya
// qatı əlavə olunmalıdır (F2.6 möhkəmləndirmə). Read moderasiya üçün admin-də qalır.
const PUBLIC_CREATE_UIDS = [
  'api::rsvp.rsvp',
  'api::reaction.reaction',
  'api::correction.correction',
];

// --- F2.6e: SERT KIMLIK REJIMI ---
// IDENTITY_ENFORCE=true olanda rsvp/correction ucun public `create` icazesi
// HEM verilmir, HEM DE movcud qeyd silinir. Bundan sonra yeganə yazi yolu
// /api/identity/submit/* -dir (tesdiqlenmis magic-link sessiyasi teleb olunur).
//
// NIYE ENV ILE SERTLENDIRILIR: Vercel (Next) ve Render (Strapi) musteqil deploy
// olunur. Icaze derhal legv olunsa, F2.6e-2 frontend-i cixana qeder RSVP/duzelis
// KESILERDI. Duzgun sira: (1) bu commit deploy olunur, (2) F2.6e-2 deploy olunur,
// (3) Render-de IDENTITY_ENFORCE=true qoyulur.
//
// DIQQET: enforce sondurulu ikən public `create` hələ aciqdir, yəni gonderen
// `identity` sahesini saxtalasdira biler (netice: yalniz saxta "tesdiqlenmis"
// nisani, moderasiya novbesi toxunulmaz qalir). IDENTITY_ENFORCE=true bunu baglayir.
const IDENTITY_GATED_UIDS = ['api::rsvp.rsvp', 'api::correction.correction'];
const IDENTITY_ENFORCE = process.env.IDENTITY_ENFORCE === 'true';

const SEED = {
    "esasMenyu": [
      {
        "label": "Akademiya",
        "order": 1,
        "url": "#",
        "groups": [
          {
            "title": "Akademik irs və missiya",
            "links": [
              {
                "label": "Akademiya haqqında",
                "url": "/sehife/adda-dunen-ve-bugun"
              },
              {
                "label": "Akademiyanın tarixi",
                "url": "/tarix"
              },
              {
                "label": "Sabiq rektorlarımız",
                "url": "/sabiq-rektorlar"
              },
              {
                "label": "ADDA Qəhrəmanları",
                "url": "/sehife/qehremanlarimiz"
              },
              {
                "label": "Fəxri doktorlarımız",
                "url": "/hazirlanir/fexri-doktorlarimiz"
              },
              {
                "label": "Fəxri məzunlar",
                "url": "/hazirlanir/fexri-mezunlar"
              },
              {
                "label": "ADDA reytinqlərdə",
                "url": "/hazirlanir/adda-reytinqlerde"
              },
              {
                "label": "Rəqəmlər və faktlar",
                "url": "/sehife/reqemler-ve-faktlar"
              }
            ]
          },
          {
            "title": "Rəhbərlik və idarəetmə",
            "links": [
              {
                "label": "Rektor",
                "url": "/sehife/rektor"
              },
              {
                "label": "Rəhbərlik",
                "url": "/hazirlanir/rehberlik"
              },
              {
                "label": "Elmi Şura",
                "url": "/sehife/elmi-sura"
              },
              {
                "label": "Himayəçilər Şurası",
                "url": "/hazirlanir/himayeciler-surasi"
              },
              {
                "label": "Təşkilati struktur",
                "url": "/struktur"
              },
              {
                "label": "Ümumi işlər üzrə prorektor",
                "url": "/sehife/umumi-isler-uzre-prorektor"
              },
              {
                "label": "Rektor köməkçisi",
                "url": "/sehife/rektor-komekcisi"
              },
              {
                "label": "Elmi katib",
                "url": "/sehife/elmi-katib"
              }
            ]
          },
          {
            "title": "Hüquqi baza, etika və keyfiyyət",
            "links": [
              {
                "label": "Təhsil müəssisəsi haqqında",
                "url": "/hazirlanir/tehsil-muessisesi-haqqinda"
              },
              {
                "label": "Normativ-hüquqi sənədlər",
                "url": "/sehife/h-x-esedovun-azerbaycan-dovlet-deniz-akademiyasinin-rektoru-teyin-edilmesi-haqqi"
              },
              {
                "label": "Akademik dürüstlük bəyannaməsi",
                "url": "/hazirlanir/akademik-durustluk-beyannamesi"
              },
              {
                "label": "ADDA etika kodeksi",
                "url": "/hazirlanir/adda-etika-kodeksi"
              },
              {
                "label": "Keyfiyyətin monitorinqi",
                "url": "/sehife/keyfiyyetin-monitorinqi"
              },
              {
                "label": "Dayanıqlı inkişaf",
                "url": "/sehife/iqlim-ile-elaqeli-korporativ-idareetme"
              }
            ]
          },
          {
            "title": "Heyət",
            "links": [
              {
                "label": "Professor-müəllim heyəti",
                "url": "/heyet/professor-muellim"
              },
              {
                "label": "Təlimçi-texniki heyət",
                "url": "/heyet/telimci-texniki"
              },
              {
                "label": "İnzibati heyət",
                "url": "/heyet/inzibati"
              }
            ]
          },
          {
            "title": "Təminat",
            "links": [
              {
                "label": "Satınalmalar",
                "url": "/hazirlanir/satinalmalar"
              },
              {
                "label": "Binalar və infrastruktur",
                "url": "/sehife/binalar-ve-infrastruktur"
              },
              {
                "label": "I və II tədris binaları",
                "url": "/hazirlanir/i-ve-ii-tedris-binalari"
              },
              {
                "label": "Yataqxana",
                "url": "/sehife/yataqxana"
              },
              {
                "label": "Təlim-Tədris Mərkəzi",
                "url": "/struktur/telim-tedris-merkezi-ttm"
              },
              {
                "label": "Tədris gəmisi",
                "url": "/sehife/tedris-gemisi"
              },
              {
                "label": "Kollec",
                "url": "/struktur/azerbaycan-denizcilik-kolleci"
              },
              {
                "label": "Muzey",
                "url": "/sehife/muzey"
              }
            ]
          },
          {
            "title": "Kommunikasiya",
            "links": [
              {
                "label": "Vətəndaşların müraciəti",
                "url": "/hazirlanir/vetendaslarin-muracieti"
              },
              {
                "label": "Əlaqə",
                "url": "/sehife/elaqe"
              },
              {
                "label": "Korporativ üslub",
                "url": "/sehife/korporativ-uslub"
              }
            ]
          },
          {
            "title": "Şöbələr və xidmətlər",
            "links": [
              {
                "label": "Tədris proseslərinin təşkili şöbəsi",
                "url": "/struktur/tedris-proseslerinin-teskili-sobesi"
              },
              {
                "label": "Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsi",
                "url": "/struktur/elmi-tedqiqat-ve-beynelxalq-elaqeler-sobesi"
              },
              {
                "label": "Mühasibat uçotu və hesabat şöbəsi",
                "url": "/struktur/muhasibat-ucotu-ve-hesabat-sobesi"
              },
              {
                "label": "Personalın idarə edilməsi şöbəsi",
                "url": "/struktur/personalin-idare-edilmesi-emek-haqqi-sobesi-ve-karguzarliq-sobesi"
              },
              {
                "label": "Təsərrüfat işləri şöbəsi",
                "url": "/struktur/teserrufat-isleri-sobesi"
              },
              {
                "label": "Hüquq məsləhətçisi",
                "url": "/struktur/huquq-meslehetcisi"
              },
              {
                "label": "İnformasiya Resurs Mərkəzi",
                "url": "/struktur/informasiya-resurs-merkezi"
              },
              {
                "label": "Mətbəə",
                "url": "/struktur/metbee"
              }
            ]
          }
        ]
      },
      {
        "label": "Qəbul",
        "order": 2,
        "url": "#",
        "groups": [
          {
            "title": "Akademik səviyyələr üzrə qəbul",
            "links": [
              {
                "label": "Bakalavriat",
                "url": "/sehife/bakalavriat"
              },
              {
                "label": "Subbakalavr",
                "url": "/hazirlanir/subbakalavr"
              },
              {
                "label": "Əcnəbi tələbələr",
                "url": "/sehife/ecnebi-telebelerin-tehsili"
              },
              {
                "label": "Magistratura",
                "url": "/sehife/magistratura"
              },
              {
                "label": "Doktorantura",
                "url": "/sehife/doktorantura"
              }
            ]
          },
          {
            "title": "Əlavə təhsil",
            "links": [
              {
                "label": "Təkrar ali təhsil",
                "url": "/hazirlanir/tekrar-ali-tehsil"
              },
              {
                "label": "İxtisasartırma",
                "url": "/sehife/xaricde-tehsil-ve-ixtisasartirma"
              },
              {
                "label": "Təkmilləşdirmə",
                "url": "/hazirlanir/tekmillesdirme"
              },
              {
                "label": "Sertifikatlar",
                "url": "#"
              }
            ]
          },
          {
            "title": "Əcnəbi tələbə qəbulu",
            "links": [
              {
                "label": "Əcnəbi tələbələrin qəbulu",
                "url": "/sehife/ecnebi-telebelerin-qebulu-qaydalari"
              },
              {
                "label": "Viza və miqrasiya dəstəyi",
                "url": "/hazirlanir/viza-ve-miqrasiya-desteyi"
              }
            ]
          },
          {
            "title": "Faydalı məlumatlar və keçidlər",
            "links": [
              {
                "label": "Qeydiyyat xidməti",
                "url": "/hazirlanir/qeydiyyat-xidmeti"
              },
              {
                "label": "Təhsil haqqı və güzəştlər",
                "url": "/hazirlanir/tehsil-haqqi-ve-guzestler"
              },
              {
                "label": "Onlayn qeydiyyat",
                "url": "/hazirlanir/onlayn-qeydiyyat"
              },
              {
                "label": "Açıq qapı günləri",
                "url": "/hazirlanir/aciq-qapi-gunleri"
              },
              {
                "label": "Faydalı linklər",
                "url": "/sehife/faydali-linkler"
              }
            ]
          }
        ]
      },
      {
        "label": "Təhsil",
        "order": 3,
        "url": "#",
        "groups": [
          {
            "title": "Rəqəmsal Akademiya",
            "links": [
              {
                "label": "LMS Portalı",
                "url": "#"
              },
              {
                "label": "E-Tədris resursları",
                "url": "/hazirlanir/e-tedris-resurslari"
              }
            ]
          },
          {
            "title": "Proqramların kataloqu",
            "links": [
              {
                "label": "Bakalavriat",
                "url": "/sehife/bakalavriat"
              },
              {
                "label": "Magistratura",
                "url": "/sehife/magistratura"
              },
              {
                "label": "Doktorantura",
                "url": "/sehife/doktorantura"
              },
              {
                "label": "Əlavə təhsil",
                "url": "/hazirlanir/elave-tehsil"
              },
              {
                "label": "Dəniz naviqasiyası mühəndisliyi",
                "url": "/ixtisaslar/deniz-naviqasiyasi-muhendisliyi"
              },
              {
                "label": "Gəmi energetik qurğularının istismarı mühəndisliyi",
                "url": "/ixtisaslar/gemi-energetik-qurgularinin-istismari-muhendisliyi"
              },
              {
                "label": "Gəmiqayırma və gəmi təmiri mühəndisliyi",
                "url": "/ixtisaslar/gemiqayirma-ve-gemi-temiri-muhendisliyi"
              },
              {
                "label": "Elektrik və elektronika mühəndisliyi",
                "url": "/ixtisaslar/elektrik-ve-elektronika-muhendisliyi-su-neqliyyati-uzre"
              }
            ]
          },
          {
            "title": "Təhsil standartları",
            "links": [
              {
                "label": "Dənizçilik qanunvericilik sənədləri",
                "url": "/hazirlanir/denizcilik-qanunvericilik-senedleri"
              },
              {
                "label": "Beynəlxalq standartlar (IMO/STCW)",
                "url": "/hazirlanir/beynelxalq-standartlar-imo-stcw"
              }
            ]
          },
          {
            "title": "Təhsilin keyfiyyətinin qiymətləndirilməsi",
            "links": [
              {
                "label": "Yerli və beynəlxalq akkreditasiya",
                "url": "/hazirlanir/yerli-ve-beynelxalq-akkreditasiya"
              },
              {
                "label": "Tələbə sorğuları",
                "url": "/hazirlanir/telebe-sorgulari"
              },
              {
                "label": "Qaynar xətt və təkliflər",
                "url": "/hazirlanir/qaynar-xett-ve-teklifler"
              }
            ]
          },
          {
            "title": "Fakültələr",
            "links": [
              {
                "label": "Gəmi sürücülüyü fakültəsi",
                "url": "/fakulteler/gemi-suruculuyu-fakultesi"
              },
              {
                "label": "Gəmi mexanikası və elektromexanikası fakültəsi",
                "url": "/fakulteler/gemi-mexanikasi-ve-elektromexanikasi-fakultesi"
              }
            ]
          }
        ]
      },
      {
        "label": "Elm və innovasiya",
        "order": 4,
        "url": "#",
        "groups": [
          {
            "title": "Elmi idarəetmə və strategiya",
            "links": [
              {
                "label": "Elmi siyasət",
                "url": "/hazirlanir/elmi-siyaset"
              },
              {
                "label": "Tədris-Metodiki Şura",
                "url": "/hazirlanir/tedris-metodiki-sura"
              },
              {
                "label": "Rəqəmlər və faktlar",
                "url": "/sehife/reqemler-ve-faktlar"
              }
            ]
          },
          {
            "title": "Elmi-tədqiqat mərkəzləri və laboratoriyalar",
            "links": [
              {
                "label": "Tədqiqat mərkəzləri və laboratoriyalar",
                "url": "/sehife/elmi-tedqiqat-laboratoriyalari"
              },
              {
                "label": "Elmi-tədqiqat qrupu",
                "url": "/sehife/elmi-tedqiqat-qrupu"
              }
            ]
          },
          {
            "title": "Elmi nəşrlər və kitabxana",
            "links": [
              {
                "label": "ADDA-nın Elmi Jurnalı",
                "url": "/sehife/elmi-jurnal"
              },
              {
                "label": "Əməkdaşların nəşrləri",
                "url": "/hazirlanir/emekdaslarin-nesrleri"
              },
              {
                "label": "E-Kitabxana",
                "url": "/sehife/elektron-kitabxana"
              },
              {
                "label": "Konvensiyalar və normativ sənədlər fondu",
                "url": "/hazirlanir/konvensiyalar-ve-normativ-senedler-fondu"
              },
              {
                "label": "Tərəfdaş kitabxanalar və elmi bazalar",
                "url": "/hazirlanir/terefdas-kitabxanalar-ve-elmi-bazalar"
              },
              {
                "label": "Elmi jurnalımız onlayn versiyada",
                "url": "/sehife/elmi-jurnalimiz-onlayn-versiyada"
              }
            ]
          },
          {
            "title": "Doktorantura və elmi kadrların hazırlığı",
            "links": [
              {
                "label": "Doktorantura",
                "url": "/sehife/doktorantura"
              },
              {
                "label": "Dissertasiya şuraları",
                "url": "/hazirlanir/dissertasiya-suralari"
              },
              {
                "label": "Gənc alimlərin platforması",
                "url": "/sehife/genc-alimler-surasi"
              }
            ]
          },
          {
            "title": "Qrantlar, müsabiqələr və tədbirlər",
            "links": [
              {
                "label": "Qrantlar",
                "url": "/hazirlanir/qrantlar"
              },
              {
                "label": "Mükafatlar",
                "url": "/hazirlanir/mukafatlar"
              },
              {
                "label": "Elmi tədbirlər təqvimi",
                "url": "/hazirlanir/elmi-tedbirler-teqvimi"
              },
              {
                "label": "Beynəlxalq Dənizçilik Konfransları",
                "url": "/hazirlanir/beynelxalq-denizcilik-konfranslari"
              },
              {
                "label": "Sahəvi seminarlar və təlimlər",
                "url": "/hazirlanir/sahevi-seminarlar-ve-telimler"
              }
            ]
          }
        ]
      },
      {
        "label": "Tələbə həyatı",
        "order": 5,
        "url": "#",
        "groups": [
          {
            "title": "Tələbə təşkilatları",
            "links": [
              {
                "label": "Tələbə Gənclər Təşkilatı (TGK)",
                "url": "/sehife/telebe-gencler-teskilati"
              },
              {
                "label": "Tələbə Həmkarlar İttifaqı (THİK)",
                "url": "/sehife/telebe-hemkarlar-ittifaqi-komitesi"
              },
              {
                "label": "Tələbə Elmi Cəmiyyəti (TEC)",
                "url": "/sehife/telebe-elmi-cemiyyeti"
              },
              {
                "label": "Könüllülük hərəkatı",
                "url": "/hazirlanir/konulluluk-herekati"
              }
            ]
          },
          {
            "title": "Yaşayış və rifah",
            "links": [
              {
                "label": "Tələbə yataqxanası",
                "url": "/sehife/yataqxana"
              },
              {
                "label": "Onlayn müraciət və yerləşdirmə",
                "url": "/hazirlanir/onlayn-muraciet-ve-yerlesdirme"
              },
              {
                "label": "Sosial təminat və maddi yardım",
                "url": "/sehife/sosial-teminat-ve-maddi-yardim"
              },
              {
                "label": "Təqaüd proqramları",
                "url": "/hazirlanir/teqaud-proqramlari"
              },
              {
                "label": "Psixoloji dəstək xidməti",
                "url": "/hazirlanir/psixoloji-destek-xidmeti"
              },
              {
                "label": "Tibb xidməti",
                "url": "/hazirlanir/tibb-xidmeti"
              }
            ]
          },
          {
            "title": "Yaradıcılıq, idman və asudə vaxt",
            "links": [
              {
                "label": "İdman klubları",
                "url": "/sehife/idman"
              },
              {
                "label": "Mədəniyyət və yaradıcılıq dərnəkləri",
                "url": "/hazirlanir/medeniyyet-ve-yaradiciliq-dernekleri"
              },
              {
                "label": "İntellektual oyun klubları",
                "url": "/hazirlanir/intellektual-oyun-klublari"
              }
            ]
          },
          {
            "title": "Media və kommunikasiya",
            "links": [
              {
                "label": "Sosial media elçiləri",
                "url": "/hazirlanir/sosial-media-elcileri"
              },
              {
                "label": "Tədbirlər təqvimi",
                "url": "/hazirlanir/tedbirler-teqvimi"
              }
            ]
          }
        ]
      },
      {
        "label": "Beynəlxalq əlaqələr",
        "order": 6,
        "url": "#",
        "groups": [
          {
            "title": "Akademik tərəfdaşlıq və ikili diplom",
            "links": [
              {
                "label": "İkili diplom layihələri",
                "url": "/hazirlanir/ikili-diplom-layiheleri"
              },
              {
                "label": "Akademik tərəfdaşlar",
                "url": "/sehife/akademik-terefdaslar"
              },
              {
                "label": "Beynəlxalq əlaqələr qrupu",
                "url": "/sehife/beynelxalq-elaqeler-qrupu"
              }
            ]
          },
          {
            "title": "Mobillik proqramları",
            "links": [
              {
                "label": "Erasmus+ və Mevlana",
                "url": "/hazirlanir/erasmus-ve-mevlana"
              },
              {
                "label": "Müəllim mübadiləsi",
                "url": "/hazirlanir/muellim-mubadilesi"
              },
              {
                "label": "Yay məktəbləri",
                "url": "/hazirlanir/yay-mektebleri"
              }
            ]
          },
          {
            "title": "Beynəlxalq assosiasiyalar və təşkilatlar",
            "links": [
              {
                "label": "IAMU",
                "url": "/hazirlanir/iamu"
              },
              {
                "label": "IMO",
                "url": "/hazirlanir/imo"
              },
              {
                "label": "BSAMI",
                "url": "/hazirlanir/bsami"
              },
              {
                "label": "Digər təşkilatlar",
                "url": "/hazirlanir/diger-teskilatlar"
              }
            ]
          },
          {
            "title": "Xarici gəmiçilik şirkətləri",
            "links": [
              {
                "label": "Kadet proqramları",
                "url": "/hazirlanir/kadet-proqramlari"
              },
              {
                "label": "Məzunların işlə təminatı",
                "url": "/sehife/mezunlarin-isle-teminati"
              }
            ]
          },
          {
            "title": "Beynəlxalq elmi araşdırmalar",
            "links": [
              {
                "label": "Birgə elmi konfranslar",
                "url": "/sehife/elmi-konfranslar"
              },
              {
                "label": "Qrant layihələri",
                "url": "/hazirlanir/qrant-layiheleri"
              }
            ]
          }
        ]
      }
    ],
    "ustMenyu": [
      {
        "label": "ADDA Məzunları",
        "order": 1,
        "url": "#",
        "groups": [
          {
            "title": "Məzun mərkəzi",
            "links": [
              {
                "label": "Məzunlar assosiasiyası",
                "url": "/hazirlanir/mezunlar-assosiasiyasi"
              },
              {
                "label": "Regional və beynəlxalq nümayəndəliklər",
                "url": "/hazirlanir/regional-ve-beynelxalq-numayendelikler"
              },
              {
                "label": "Məzunların mentorluq proqramı",
                "url": "/hazirlanir/mezunlarin-mentorluq-proqrami"
              },
              {
                "label": "Məzunlar-işəgötürənlər şəbəkəsi",
                "url": "/hazirlanir/mezunlar-isegoturenler-sebekesi"
              }
            ]
          },
          {
            "title": "Karyera və inkişaf",
            "links": [
              {
                "label": "Vakansiyalar",
                "url": "/hazirlanir/vakansiyalar"
              },
              {
                "label": "Məzunlar üçün təkmilləşdirmə",
                "url": "/hazirlanir/mezunlar-ucun-tekmillesdirme"
              },
              {
                "label": "Karyera hekayələri",
                "url": "/hazirlanir/karyera-hekayeleri"
              },
              {
                "label": "Elm-təhsil-istehsalat platforması",
                "url": "/hazirlanir/elm-tehsil-istehsalat-platformasi"
              },
              {
                "label": "Diskussiya klubu",
                "url": "/hazirlanir/diskussiya-klubu"
              },
              {
                "label": "Karyera sərgisi",
                "url": "/hazirlanir/karyera-sergisi"
              }
            ]
          },
          {
            "title": "Tədbirlər və layihələr",
            "links": [
              {
                "label": "Məzun günü",
                "url": "/hazirlanir/mezun-gunu"
              },
              {
                "label": "Peşəkar görüşlər",
                "url": "/hazirlanir/pesekar-gorusler"
              },
              {
                "label": "İnkişafa dəstək təşəbbüsləri",
                "url": "/hazirlanir/inkisafa-destek-tesebbusleri"
              },
              {
                "label": "Məzun kartı",
                "url": "/hazirlanir/mezun-karti"
              },
              {
                "label": "Məzunların rəyləri",
                "url": "/hazirlanir/mezunlarin-reyleri"
              }
            ]
          }
        ]
      },
      {
        "label": "Karyera",
        "order": 2,
        "url": "#",
        "groups": [
          {
            "title": "Karyera Mərkəzi",
            "links": [
              {
                "label": "Karyera Mərkəzi haqqında",
                "url": "/hazirlanir/karyera-merkezi-haqqinda"
              },
              {
                "label": "Karyera bələdçisi",
                "url": "/hazirlanir/karyera-beledcisi"
              },
              {
                "label": "Fərdi konsultasiyalar",
                "url": "/hazirlanir/ferdi-konsultasiyalar"
              },
              {
                "label": "Tələbə portfolioları",
                "url": "/hazirlanir/telebe-portfoliolari"
              }
            ]
          },
          {
            "title": "İş və təcrübə imkanları",
            "links": [
              {
                "label": "Vakansiyalar",
                "url": "/hazirlanir/vakansiyalar"
              },
              {
                "label": "Təcrübə proqramları",
                "url": "/sehife/tecrube-haqqinda"
              },
              {
                "label": "Könüllü təcrübəçilik",
                "url": "/hazirlanir/konullu-tecrubecilik"
              }
            ]
          },
          {
            "title": "İstehsalat ilə əlaqələr",
            "links": [
              {
                "label": "Korporativ tərəfdaşlar",
                "url": "/hazirlanir/korporativ-terefdaslar"
              },
              {
                "label": "Sərgilər və forumlar",
                "url": "/hazirlanir/sergiler-ve-forumlar"
              }
            ]
          },
          {
            "title": "Bacarıqların inkişafı",
            "links": [
              {
                "label": "Soft Skills təlimləri",
                "url": "/hazirlanir/soft-skills-telimleri"
              },
              {
                "label": "Sertifikatlaşdırma dəstəyi",
                "url": "/hazirlanir/sertifikatlasdirma-desteyi"
              },
              {
                "label": "Master-klaslar",
                "url": "/hazirlanir/master-klaslar"
              }
            ]
          }
        ]
      },
      {
        "label": "Kollec",
        "order": 3,
        "url": "#",
        "groups": [
          {
            "title": "Kollec",
            "links": [
              {
                "label": "Fakültələr",
                "url": "/fakulteler"
              },
              {
                "label": "Əlavə təhsil",
                "url": "/hazirlanir/elave-tehsil"
              },
              {
                "label": "İnfrastruktur",
                "url": "/hazirlanir/infrastruktur"
              }
            ]
          }
        ]
      },
      {
        "label": "FAQ",
        "order": 4,
        "url": "/hazirlanir/faq",
        "groups": []
      },
      {
        "label": "Əlaqə",
        "order": 5,
        "url": "/sehife/elaqe",
        "groups": []
      }
    ],
    "eAkademiya": {
      "title": "E-Akademiya platforması",
      "subtitle": "Rəqəmsal təhsil ekosistemi",
      "cards": [
        {
          "label": "Tələbə kabineti",
          "description": "ADDA Lider sistemi",
          "url": "#",
          "icon": "device-laptop"
        },
        {
          "label": "Müəllim kabineti",
          "description": "Tədris idarəetməsi",
          "url": "#",
          "icon": "chalkboard"
        },
        {
          "label": "Elektron jurnal",
          "description": "Qiymət və davamiyyət",
          "url": "#",
          "icon": "notebook"
        },
        {
          "label": "Dərs cədvəli",
          "description": "Cari semestr",
          "url": "#",
          "icon": "calendar"
        },
        {
          "label": "E-Kitabxana",
          "description": "Elektron resurslar",
          "url": "/sehife/elektron-kitabxana",
          "icon": "books"
        },
        {
          "label": "Sertifikatlar",
          "description": "STCW & Təlim mərkəzi",
          "url": "#",
          "icon": "certificate"
        },
        {
          "label": "Profilim",
          "description": "Əməkdaşlar üçün — öz səhifəni yenilə",
          "url": "/profil",
          "icon": "user-edit"
        }
      ]
    },
    "istifadeciQruplari": [
      {
        "label": "Abituriyentlər",
        "url": "/bunlar-ucun/abituriyentler"
      },
      {
        "label": "Tələbələr",
        "url": "/bunlar-ucun/telebeler"
      },
      {
        "label": "Məzunlar",
        "url": "/bunlar-ucun/mezunlar"
      },
      {
        "label": "Əməkdaşlar",
        "url": "/bunlar-ucun/emekdaslar"
      },
      {
        "label": "Beynəlxalq tələbələr",
        "url": "/bunlar-ucun/beynelxalq-telebeler"
      },
      {
        "label": "Valideynlər",
        "url": "/bunlar-ucun/valideynler"
      }
    ],
    "suretliKecidler": [
      {
        "label": "Tələbə kabineti",
        "url": "#",
        "icon": "device-laptop"
      },
      {
        "label": "Elektron jurnal",
        "url": "#",
        "icon": "notebook"
      },
      {
        "label": "E-Kitabxana",
        "url": "/sehife/elektron-kitabxana",
        "icon": "books"
      },
      {
        "label": "Dərs cədvəli",
        "url": "#",
        "icon": "calendar"
      },
      {
        "label": "Karyera Mərkəzi",
        "url": "/hazirlanir/karyera-merkezi",
        "icon": "briefcase"
      },
      {
        "label": "Əlaqə",
        "url": "/sehife/elaqe",
        "icon": "mail"
      }
    ],
    "footerMenyusu": [
      {
        "title": "Akademiya",
        "links": [
          {
            "label": "Haqqımızda",
            "url": "/sehife/adda-dunen-ve-bugun"
          },
          {
            "label": "Rəhbərlik",
            "url": "/hazirlanir/rehberlik"
          },
          {
            "label": "Struktur",
            "url": "/struktur"
          },
          {
            "label": "Tarix",
            "url": "/tarix"
          },
          {
            "label": "Akkreditasiya",
            "url": "/hazirlanir/akkreditasiya"
          }
        ]
      },
      {
        "title": "Qəbul",
        "links": [
          {
            "label": "Bakalavr qəbulu",
            "url": "/sehife/bakalavriat"
          },
          {
            "label": "Magistratura qəbulu",
            "url": "/sehife/magistratura"
          },
          {
            "label": "Onlayn müraciət",
            "url": "#"
          },
          {
            "label": "Qəbul şərtləri",
            "url": "/hazirlanir/qebul-sertleri"
          }
        ]
      },
      {
        "title": "Təhsil",
        "links": [
          {
            "label": "Bakalavriat",
            "url": "/sehife/bakalavriat"
          },
          {
            "label": "Magistratura",
            "url": "/sehife/magistratura"
          },
          {
            "label": "Qiyabi təhsil",
            "url": "/hazirlanir/qiyabi-tehsil"
          },
          {
            "label": "İxtisaslar",
            "url": "/ixtisaslar"
          },
          {
            "label": "E-Akademiya",
            "url": "#"
          }
        ]
      },
      {
        "title": "Universitet",
        "links": [
          {
            "label": "Elm və innovasiya",
            "url": "/sehife/elmi-tedqiqat-fealiyyeti"
          },
          {
            "label": "Tələbə həyatı",
            "url": "/hazirlanir/telebe-heyati"
          },
          {
            "label": "Beynəlxalq əməkdaşlıq",
            "url": "/sehife/beynelxalq-emekdasliq"
          },
          {
            "label": "Xəbərlər",
            "url": "/xeberler"
          },
          {
            "label": "Kampus",
            "url": "/hazirlanir/kampus"
          }
        ]
      }
    ]
  };

/**
 * F2.3 — Relation lokalizasiya sinxronu.
 * Strapi relation-lari lokala gore KOCURMUR (F2.1-de olculdu): redaktor ru/en
 * tercumesini yazib relation-a toxunmayanda yazi yetim qalir (faculty=NULL) ve
 * ne qlobal, ne fakulte lentine dusur. Bu middleware az (esas lokal) relation-larini
 * butun lokallar arasinda ayna edir:
 *   - az yazilanda  -> movcud diger lokallara YAYILIR
 *   - qeyri-az yazilanda -> az-dan CEKILIR
 * Idempotent; rekursiya module-level inFlight Set ile bloklanir.
 */
const REL_SYNC: Record<string, string[]> = {
  'api::article.article': ['faculty', 'person', 'tags'],
  'api::announcement.announcement': ['faculty', 'person', 'tags'],
  'api::event.event': ['faculty', 'person', 'tags'],
  'api::program.program': ['faculty'],
  'api::person.person': ['faculty', 'department', 'unit'],
  'api::department.department': ['faculty', 'head'],
  'api::faculty.faculty': ['dean'],
  'api::unit.unit': ['head', 'parent'],
};
const SYNC_DEFAULT_LOCALE = 'az';


// ── K27b · Sabiq rektorlar ──
// Redaktə admin panelindən gedir; bu blok yalnız İLK doldurmadır.
// `slug` uyğunluq açarıdır: mövcud qeyd varsa toxunulmur.
// RECTOR_RESEED=true bir dəfəlik üzərinə yazmağa icazə verir (MENU_RESEED
// ilə eyni rəqs: qoy → deploy → logu yoxla → SİL). Əks halda editorun
// admin-dəki düzəlişləri hər deploy-da geri qayıdardı.
interface RectorSeedText { name: string; degree: string; summary: string; bio: string }
interface RectorSeed {
  slug: string;
  termFrom: number;
  termTo: number | null;
  died: string | null;
  sortOrder: number;
  az: RectorSeedText;
  ru: RectorSeedText;
  en: RectorSeedText;
}

const RECTOR_SEED: RectorSeed[] = [
  {
    slug: 'sambur-hemdullaoglu',
    termFrom: 1997,
    termTo: 2009,
    died: null,
    sortOrder: 10,
    az: {
      name: 'Sambur Həmdullaoğlu',
      degree: 'Texnika elmləri namizədi (texnika üzrə fəlsəfə doktoru), dosent',
      summary: 'Akademiyanın ən uzun rektorluq dövrü — 12 il. Sonradan «Gəmi energetik qurğuları» kafedrasının müdiri olub.',
      bio: '1931-ci il avqustun 7-də Bakı şəhərinin Biləcəri qəsəbəsində anadan olub.\n\n1950-ci ildə İ. V. Stalin adına Moskva Lenin ordenli və Qırmızı Əmək Bayrağı ordenli Dəmir Yolu Mühəndisləri İnstitutuna daxil olub. 1956-cı ildə həmin institutda «Dəmir yolu nəqliyyatının vaqon heyəti üzrə mühəndislik və pedaqoji hazırlıq» üzrə tam təhsil kursunu başa vuraraq «dəmir yolu mühəndis-mexaniki» ixtisasına yiyələnib.\n\n1956-cı ildə «Azərbaycan Dəmir Yolları Mühəndislik Evi»ndə məsləhətçi-mühəndis vəzifəsinə işə qəbul olunub. 1961-ci ilin avqustunda «Azərbaycan Dəmir Yolları İdarəsinin Təhsil Müəssisələri» şöbəsinin baş inspektoru təyin edilib. Həmin ilin noyabrında M. Əzizbəyov adına Azərbaycan Neft və Kimya İnstitutunun əyani aspiranturasına daxil olub və 1964-cü ilin dekabrında təhsilini bitirib.\n\n1965-ci ildə institut şurasının qərarı ilə ona texnika elmləri namizədi elmi dərəcəsi verilib. 1971-ci ildə Ali Attestasiya Komissiyasının qərarı ilə «İstilik mühəndisliyinin nəzəri əsasları» kafedrası üzrə dosent elmi adı təsdiqlənib.\n\nAspiranturanı bitirdikdən sonra 1965–1966-cı illərdə «Ümumi istilik mühəndisliyi» kafedrasında assistent, 1967–1970-ci illərdə «Daxili yanma mühərriklərinin istilik mühəndisliyi» kafedrasında baş müəllim işləyib. 1970–1972-ci illərdə Energetika fakültəsində əyani təhsil üzrə dekan müavini, 1973–1979-cu illərdə həmin fakültənin axşam təhsili üzrə dekanı, 1980–1982-ci illərdə institutun qiyabi təhsil üzrə dekanı, 1982–1983-cü illərdə «İstilik mühəndisliyi» fakültəsinin axşam və qiyabi təhsil üzrə dekan müavini vəzifələrində çalışıb.\n\n1984–1988-ci illərdə Odessa Dəniz Mühəndisləri İnstitutunun axşam və qiyabi fakültəsinin Bakı filialının dekanı, 1988–1996-cı illərdə Novorossiysk Ali Dəniz Mühəndisliyi Məktəbinin axşam və qiyabi fakültəsinin Bakı filialının müdiri vəzifələrində işləyib.\n\n1997–2009-cu illərdə Azərbaycan Dövlət Dəniz Akademiyasının rektoru olub. Dənizçilik sahəsində tanınmış ziyalı və rəhbər kimi akademiyanın beynəlxalq aləmdə tanınmasında və dənizçi kadrların yetişdirilməsində böyük əməyi olub.\n\n2009–2014-cü illərdə «Gəmi energetik qurğuları» kafedrasının müdiri, 2014–2015-ci illərdə həmin kafedranın dosenti vəzifəsində çalışıb. «Gəmi daxiliyanma mühərriklərinin hesabı» kitabının (İsmayılov A. Ş., Sambur H. O., Əliyev S. N.) və çoxsaylı dərs vəsaitlərinin, elmi məqalələrin müəlliflərindən biridir.',
    },
    ru: {
      name: 'Самбур Гамдуллаоглу',
      degree: 'Кандидат технических наук (доктор философии по технике), доцент',
      summary: 'Самый длительный ректорский срок в истории Академии — 12 лет. Позже возглавлял кафедру судовых энергетических установок.',
      bio: 'Родился 7 августа 1931 года в посёлке Биляджари города Баку.\n\nВ 1950 году поступил в Московский ордена Ленина и ордена Трудового Красного Знамени институт инженеров железнодорожного транспорта имени И. В. Сталина. В 1956 году завершил там полный курс обучения по специальности «Инженерная и педагогическая подготовка по вагонному составу железнодорожного транспорта» и получил квалификацию инженера-механика железнодорожного транспорта.\n\nВ 1956 году принят на должность инженера-консультанта в «Дом инженеров Азербайджанских железных дорог». В августе 1961 года назначен главным инспектором отдела «Учебные заведения Управления Азербайджанских железных дорог». В ноябре того же года поступил в очную аспирантуру Азербайджанского института нефти и химии имени М. Азизбекова, которую окончил в декабре 1964 года.\n\nВ 1965 году решением учёного совета института ему была присуждена учёная степень кандидата технических наук. В 1971 году решением Высшей аттестационной комиссии утверждён в учёном звании доцента по кафедре «Теоретические основы теплотехники».\n\nПосле окончания аспирантуры в 1965–1966 годах работал ассистентом кафедры «Общая теплотехника», в 1967–1970 годах — старшим преподавателем кафедры «Теплотехника двигателей внутреннего сгорания». В 1970–1972 годах — заместитель декана энергетического факультета по очному обучению, в 1973–1979 годах — декан того же факультета по вечернему обучению, в 1980–1982 годах — декан института по заочному обучению, в 1982–1983 годах — заместитель декана факультета «Теплотехника» по вечернему и заочному обучению.\n\nВ 1984–1988 годах — декан бакинского филиала вечернего и заочного факультета Одесского института инженеров морского флота, в 1988–1996 годах — заведующий бакинским филиалом вечернего и заочного факультета Новороссийского высшего инженерного морского училища.\n\nВ 1997–2009 годах — ректор Азербайджанской государственной морской академии. Как известный специалист и руководитель в области морского дела внёс большой вклад в международное признание академии и в подготовку морских кадров.\n\nВ 2009–2014 годах заведовал кафедрой «Судовые энергетические установки», в 2014–2015 годах работал доцентом той же кафедры. Один из авторов книги «Расчёт судовых двигателей внутреннего сгорания» (Исмайлов А. Ш., Самбур Г. О., Алиев С. Н.), а также многочисленных учебных пособий и научных статей.',
    },
    en: {
      name: 'Sambur Hamdullaoglu',
      degree: 'PhD in Engineering, Associate Professor',
      summary: 'The longest rectorship in the Academy’s history — 12 years. Later headed the Marine Power Plants department.',
      bio: 'Born on 7 August 1931 in the Bilajari settlement of Baku.\n\nIn 1950 he entered the Stalin Moscow Institute of Railway Transport Engineers, holder of the Order of Lenin and the Order of the Red Banner of Labour. In 1956 he completed the full course in engineering and teaching for railway rolling stock, qualifying as a railway mechanical engineer.\n\nIn 1956 he joined the Azerbaijan Railways Engineering House as a consulting engineer. In August 1961 he was appointed chief inspector of the Educational Institutions department of the Azerbaijan Railways Administration. In November of that year he began full-time postgraduate study at the M. Azizbeyov Azerbaijan Institute of Oil and Chemistry, completing it in December 1964.\n\nIn 1965 the institute’s academic council awarded him the degree of Candidate of Technical Sciences. In 1971 the Higher Attestation Commission confirmed him as Associate Professor in the Theoretical Foundations of Heat Engineering department.\n\nAfter his postgraduate studies he was an assistant lecturer in the General Heat Engineering department (1965–1966) and a senior lecturer in the Heat Engineering of Internal Combustion Engines department (1967–1970). He then served as deputy dean of the Faculty of Power Engineering for full-time study (1970–1972), dean of the same faculty for evening study (1973–1979), dean of the institute for correspondence study (1980–1982), and deputy dean of the Heat Engineering faculty for evening and correspondence study (1982–1983).\n\nFrom 1984 to 1988 he was dean of the Baku branch of the evening and correspondence faculty of the Odessa Institute of Marine Engineers, and from 1988 to 1996 head of the Baku branch of the corresponding faculty at the Novorossiysk Higher Marine Engineering School.\n\nHe served as Rector of the Azerbaijan State Maritime Academy from 1997 to 2009. A respected scholar and leader in maritime affairs, he contributed substantially to the Academy’s international recognition and to the training of seafaring professionals.\n\nFrom 2009 to 2014 he headed the Marine Power Plants department, and from 2014 to 2015 worked there as an associate professor. He is a co-author of the book «Calculation of Marine Internal Combustion Engines» (A. Sh. Ismayilov, H. O. Sambur, S. N. Aliyev) and of numerous teaching materials and research papers.',
    },
  },
  {
    slug: 'rasim-besirov',
    termFrom: 2009,
    termTo: 2014,
    died: null,
    sortOrder: 20,
    az: {
      name: 'Rasim Bəşirov',
      degree: 'Texnika elmləri doktoru, professor',
      summary: 'Rektorluğundan əvvəl səkkiz il akademiyada prorektor işləyib. Elmi əsərlər jurnalının təsisçisidir.',
      bio: 'Bəşirov Rasim Cavad oğlu 1957-ci il martın 15-də Abşeron rayonunun Güzdək qəsəbəsində anadan olub.\n\n1974–1979-cu illərdə Azərbaycan Politexnik İnstitutunun mexanika fakültəsində ali təhsil alaraq «Maşınqayırma texnologiyası, metalkəsən dəzgahlar və alətlər» ixtisasını fərqlənmə diplomu ilə bitirib.\n\n2004-cü ildə «Mexaniki və fiziki-texniki emal prosesləri, dəzgahlar, alətlər və texnoloji avadanlıqlar» ixtisası üzrə texnika elmləri doktoru dissertasiyasını müdafiə edib. 1994-cü ildən dosent, 2010-cu ildən professordur.\n\n1979–1983-cü illərdə Tətbiqi Fizika Elmi-Tədqiqat İnstitutunda mühəndis və mühəndis-konstruktor vəzifələrində çalışıb. 1983–2000-ci illərdə Azərbaycan Politexnik İnstitutunda baş müəllim, dosent və prorektor kimi fəaliyyət göstərib.\n\n1996–2004-cü illərdə Azərbaycan Dövlət Dəniz Akademiyasında dosent və tədris işləri üzrə prorektor vəzifələrində çalışaraq ali dəniz təhsil sisteminin formalaşdırılmasında iştirak edib. Bu dövrdə akademiyanın ilk nizamnaməsinin və müasir tələblərə cavab verən tədris planlarının hazırlanmasında birbaşa iştirakı olub. Gəmiqayırma və gəmi təmiri ixtisası üzrə Azərbaycanda ilk professorlardan biri kimi bu sahənin ali təhsil və elmi istiqamət kimi formalaşmasına töhfə verib.\n\nAkademiyanın beynəlxalq səviyyəyə çıxması məqsədilə 2000-ci ildə Londonda keçirilən Beynəlxalq Dənizçilik Təşkilatının sessiyasında iştirak edərək akademiya diplomlarının beynəlxalq səviyyədə tanınmasına nail olunmasında fəal rol oynayıb.\n\nRektorluğu dövründə akademiyanın maddi-texniki bazasının möhkəmləndirilməsi, beynəlxalq əlaqələrin genişləndirilməsi və elmi-tədqiqat potensialının artırılması istiqamətində işlər həyata keçirib, elmi əsərlər jurnalını təsis edərək müntəzəm nəşrini təmin edib. Elmi kadr hazırlığına xüsusi diqqət yetirib — rəhbərliyi altında 4 nəfər texnika üzrə fəlsəfə doktoru elmi dərəcəsi alıb.\n\n200-dən artıq elmi və elmi-metodiki məqalənin, 2 monoqrafiyanın, 7 ixtiranın, 5 dərsliyin və 10-dan artıq dərs vəsaitinin müəllifidir. Bir sıra beynəlxalq konfransların iştirakçısıdır; elmi əsərlərinin əksəriyyəti Scopus və Web of Science indeksli jurnallarda çap edilib.\n\n2015-ci ildən Azərbaycan Texniki Universitetində kafedra müdiri, hazırda isə «Xüsusi texnologiyalar və avadanlıqlar» kafedrasının professorudur.',
    },
    ru: {
      name: 'Расим Баширов',
      degree: 'Доктор технических наук, профессор',
      summary: 'До ректорства восемь лет работал проректором Академии. Основатель журнала научных трудов.',
      bio: 'Баширов Расим Джавад оглы родился 15 марта 1957 года в посёлке Гюздек Абшеронского района.\n\nВ 1974–1979 годах учился на механическом факультете Азербайджанского политехнического института и с отличием окончил специальность «Технология машиностроения, металлорежущие станки и инструменты».\n\nВ 2004 году защитил докторскую диссертацию по специальности «Процессы механической и физико-технической обработки, станки, инструменты и технологическое оборудование». Доцент с 1994 года, профессор — с 2010 года.\n\nВ 1979–1983 годах работал инженером и инженером-конструктором в Научно-исследовательском институте прикладной физики. В 1983–2000 годах занимал в Азербайджанском политехническом институте должности старшего преподавателя, доцента и проректора.\n\nВ 1996–2004 годах работал доцентом и проректором по учебной работе Азербайджанской государственной морской академии, участвуя в формировании системы высшего морского образования. В этот период он непосредственно участвовал в разработке первого устава академии и современных учебных планов. Как один из первых в Азербайджане профессоров по специальности судостроения и судоремонта внёс вклад в становление этого направления в высшем образовании и науке.\n\nВ 2000 году принял участие в сессии Международной морской организации в Лондоне и сыграл активную роль в достижении международного признания дипломов академии.\n\nВ период ректорства осуществил работу по укреплению материально-технической базы академии, расширению международных связей и наращиванию научно-исследовательского потенциала, а также учредил журнал научных трудов и обеспечил его регулярный выпуск. Особое внимание уделял подготовке научных кадров — под его руководством 4 сотрудника получили степень доктора философии по технике.\n\nАвтор более 200 научных и научно-методических статей, 2 монографий, 7 изобретений, 5 учебников и более 10 учебных пособий. Участник ряда международных конференций; большинство его работ опубликовано в журналах, индексируемых в Scopus и Web of Science.\n\nС 2015 года работает в Азербайджанском техническом университете: заведовал кафедрой, в настоящее время — профессор кафедры «Специальные технологии и оборудование».',
    },
    en: {
      name: 'Rasim Bashirov',
      degree: 'Doctor of Sciences in Engineering, Professor',
      summary: 'Served eight years as vice-rector before his rectorship. Founded the Academy’s scientific journal.',
      bio: 'Rasim Javad oglu Bashirov was born on 15 March 1957 in the settlement of Guzdek, Absheron district.\n\nFrom 1974 to 1979 he studied at the mechanical faculty of the Azerbaijan Polytechnic Institute, graduating with honours in machine-building technology, metal-cutting machines and tools.\n\nIn 2004 he defended his doctoral dissertation in mechanical and physico-technical processing, machine tools and technological equipment. He has been an associate professor since 1994 and a full professor since 2010.\n\nHe worked as an engineer and design engineer at the Applied Physics Research Institute from 1979 to 1983, and from 1983 to 2000 held posts as senior lecturer, associate professor and vice-rector at the Azerbaijan Polytechnic Institute.\n\nBetween 1996 and 2004 he served the Azerbaijan State Maritime Academy as associate professor and vice-rector for academic affairs, helping to shape the country’s system of higher maritime education. In that period he took direct part in drafting the Academy’s first statute and its modern curricula. As one of Azerbaijan’s first professors in shipbuilding and ship repair, he contributed to establishing the field as an academic and research discipline.\n\nIn 2000 he attended the session of the International Maritime Organization in London and played an active part in securing international recognition of the Academy’s diplomas.\n\nAs rector he strengthened the Academy’s facilities, widened its international links and expanded its research capacity. He founded the Academy’s journal of scientific works and ensured its regular publication, and gave particular attention to training researchers — four staff members earned doctoral degrees in engineering under his supervision.\n\nHe is the author of more than 200 scientific and methodological articles, 2 monographs, 7 inventions, 5 textbooks and over 10 teaching manuals. He has taken part in a number of international conferences, and most of his work has appeared in journals indexed by Scopus and Web of Science.\n\nSince 2015 he has worked at Azerbaijan Technical University, where he headed a department and is currently professor in the Special Technologies and Equipment department.',
    },
  },
  {
    slug: 'cingiz-eliyev',
    termFrom: 2014,
    termTo: 2019,
    died: '2019-01-07',
    sortOrder: 30,
    az: {
      name: 'Çingiz Əliyev',
      degree: 'Texnika elmləri namizədi (texnika üzrə fəlsəfə doktoru), dosent',
      summary: 'Kapitan rütbəsinədək yüksəlmiş dənizçi. Akademiyaya əvvəlcə prorektor, sonra rektor kimi rəhbərlik edib.',
      bio: 'Əliyev Çingiz Mansur oğlu 1963-cü il yanvarın 5-də Bakı şəhərində anadan olub.\n\n1986-cı ildə Leninqrad Su Nəqliyyatı İnstitutunu gəmi mühəndisliyi ixtisası üzrə bitirib.\n\n1987–1993-cü illərdə «Xəzərdənizneftdonanma» idarəsində kapitan köməkçisi vəzifəsindən kapitan rütbəsinədək yüksəlib. 1993–1996-cı illərdə həmin idarədə dənizdə təhlükəsiz üzmə xidməti üzrə rəis müavini, 1996–2006-cı illərdə British Petroleum şirkətində dəniz işləri üzrə rəis, 2006–2013-cü illərdə «Caspian Marine Services» LTD şirkətində direktor vəzifələrində çalışıb.\n\n2013-cü ildən Azərbaycan Dövlət Dəniz Akademiyasının beynəlxalq əlaqələr üzrə, 2014–2015-ci illərdə isə tədris və tərbiyə işləri üzrə prorektoru olub. Həmçinin «Naviqasiya» kafedrasının dosenti kimi fəaliyyət göstərib.\n\n«Caspian Marine Services» LTD şirkətində işlədiyi dövrdə «Silindr oymaqlarının xarici səthinə məsaməli örtük çəkməklə dizel mühərriklərinin uzunömürlülüyünün artırılması» mövzusunda dissertasiya müdafiə edərək texnika üzrə fəlsəfə doktoru elmi dərəcəsi alıb.\n\n17 elmi məqalənin, 2 dərsliyin, 1 monoqrafiyanın və 7 dərs vəsaitinin müəllifidir.',
    },
    ru: {
      name: 'Чингиз Алиев',
      degree: 'Кандидат технических наук (доктор философии по технике), доцент',
      summary: 'Моряк, дослужившийся до звания капитана. Работал в Академии сначала проректором, затем ректором.',
      bio: 'Алиев Чингиз Мансур оглы родился 5 января 1963 года в городе Баку.\n\nВ 1986 году окончил Ленинградский институт водного транспорта по специальности «судовая инженерия».\n\nВ 1987–1993 годах в управлении «Каспморнефтефлот» прошёл путь от помощника капитана до звания капитана. В 1993–1996 годах работал там же заместителем начальника службы безопасности мореплавания, в 1996–2006 годах — начальником по морским работам в компании British Petroleum, в 2006–2013 годах — директором компании «Caspian Marine Services» LTD.\n\nС 2013 года — проректор Азербайджанской государственной морской академии по международным связям, в 2014–2015 годах — проректор по учебной и воспитательной работе. Работал также доцентом кафедры «Навигация».\n\nВо время работы в «Caspian Marine Services» LTD защитил диссертацию на тему «Повышение долговечности дизельных двигателей нанесением пористого покрытия на внешнюю поверхность цилиндровых втулок» и получил учёную степень доктора философии по технике.\n\nАвтор 17 научных статей, 2 учебников, 1 монографии и 7 учебных пособий.',
    },
    en: {
      name: 'Chingiz Aliyev',
      degree: 'PhD in Engineering, Associate Professor',
      summary: 'A seafarer who rose to the rank of captain. Served the Academy first as vice-rector, then as rector.',
      bio: 'Chingiz Mansur oglu Aliyev was born on 5 January 1963 in Baku.\n\nHe graduated from the Leningrad Institute of Water Transport in 1986 with a degree in marine engineering.\n\nBetween 1987 and 1993 he rose from chief mate to the rank of captain at the Caspian Oil Fleet administration, and from 1993 to 1996 served there as deputy head of the maritime safety service. He was head of marine operations at British Petroleum from 1996 to 2006 and director of Caspian Marine Services LTD from 2006 to 2013.\n\nFrom 2013 he was vice-rector for international relations at the Azerbaijan State Maritime Academy, and in 2014–2015 vice-rector for academic and student affairs. He also taught as an associate professor in the Navigation department.\n\nWhile at Caspian Marine Services LTD he defended a dissertation on extending the service life of diesel engines by applying a porous coating to the outer surface of cylinder liners, earning a doctoral degree in engineering.\n\nHe was the author of 17 research papers, 2 textbooks, 1 monograph and 7 teaching manuals.',
    },
  },
  {
    slug: 'heyder-esedov',
    termFrom: 2019,
    termTo: 2024,
    died: null,
    sortOrder: 40,
    az: {
      name: 'Heydər Əsədov',
      degree: 'İqtisad elmləri namizədi (iqtisad üzrə fəlsəfə doktoru), dosent',
      summary: 'Maliyyə və dövlət idarəçiliyindən gələn rektor — Hesablama Palatasının sədri və kənd təsərrüfatı naziri işləyib.',
      bio: 'Heydər Əsədov 1959-cu il oktyabrın 24-də anadan olub. 1983-cü ildə D. Bünyadzadə adına Azərbaycan Xalq Təsərrüfatı İnstitutunu bitirib.\n\n1983–1992-ci illərdə Azərbaycan Dövlət İqtisad İnstitutunda müəllim işləyib. 1987-ci ildə M. V. Lomonosov adına Moskva Dövlət Universitetində namizədlik dissertasiyasını müdafiə edərək iqtisad elmləri namizədi elmi dərəcəsini alıb.\n\n1995-ci ildə Azərbaycan Respublikası Prezidentinin sərəncamı ilə maliyyə nazirinin müavini təyin edilib. 1996–2007-ci illərdə Maliyyə Nazirliyi yanında Baş Dövlət Xəzinədarlığının baş direktoru, 2007–2013-cü illərdə Azərbaycan Respublikası Hesablama Palatasının sədri vəzifələrində çalışıb.\n\nAzərbaycan Respublikası Prezidentinin 2013-cü il 22 oktyabr tarixli sərəncamı ilə Azərbaycan Respublikasının kənd təsərrüfatı naziri, 2019-cu il 3 aprel tarixli sərəncamı ilə isə Azərbaycan Dövlət Dəniz Akademiyasının rektoru təyin edilib.\n\nAzərbaycan Respublikası Prezidentinin müvafiq sərəncamları ilə 2011-ci ildə 2-ci dərəcəli «Vətənə xidmətə görə» ordeni, 2019-cu ildə «Azərbaycan Xalq Cümhuriyyətinin 100 illiyi (1918–2018)» yubiley medalı, həmçinin təhsilin inkişafındakı xidmətlərinə görə «Şöhrət» ordeni ilə təltif olunub.\n\n3 monoqrafiyanın və 30-dan çox elmi əsərin müəllifidir.',
    },
    ru: {
      name: 'Гейдар Асадов',
      degree: 'Кандидат экономических наук (доктор философии по экономике), доцент',
      summary: 'Ректор с опытом в финансах и государственном управлении — председатель Счётной палаты и министр сельского хозяйства.',
      bio: 'Гейдар Асадов родился 24 октября 1959 года. В 1983 году окончил Азербайджанский институт народного хозяйства имени Д. Буниатзаде.\n\nВ 1983–1992 годах работал преподавателем в Азербайджанском государственном экономическом институте. В 1987 году защитил кандидатскую диссертацию в Московском государственном университете имени М. В. Ломоносова и получил учёную степень кандидата экономических наук.\n\nВ 1995 году распоряжением Президента Азербайджанской Республики назначен заместителем министра финансов. В 1996–2007 годах — генеральный директор Главного государственного казначейства при Министерстве финансов, в 2007–2013 годах — председатель Счётной палаты Азербайджанской Республики.\n\nРаспоряжением Президента Азербайджанской Республики от 22 октября 2013 года назначен министром сельского хозяйства Азербайджанской Республики, а распоряжением от 3 апреля 2019 года — ректором Азербайджанской государственной морской академии.\n\nСоответствующими распоряжениями Президента Азербайджанской Республики награждён орденом «За службу Отечеству» 2-й степени (2011), юбилейной медалью «100-летие Азербайджанской Демократической Республики (1918–2018)» (2019), а также орденом «Шохрат» за заслуги в развитии образования.\n\nАвтор 3 монографий и более 30 научных работ.',
    },
    en: {
      name: 'Heydar Asadov',
      degree: 'PhD in Economics, Associate Professor',
      summary: 'A rector from finance and public administration — former Chairman of the Chamber of Accounts and Minister of Agriculture.',
      bio: 'Heydar Asadov was born on 24 October 1959. In 1983 he graduated from the D. Bunyadzade Azerbaijan Institute of National Economy.\n\nFrom 1983 to 1992 he taught at the Azerbaijan State Economic Institute. In 1987 he defended his candidate’s dissertation at Lomonosov Moscow State University, earning the degree of Candidate of Economic Sciences.\n\nIn 1995, by order of the President of the Republic of Azerbaijan, he was appointed Deputy Minister of Finance. He served as Director General of the State Treasury under the Ministry of Finance from 1996 to 2007, and as Chairman of the Chamber of Accounts of the Republic of Azerbaijan from 2007 to 2013.\n\nBy presidential order of 22 October 2013 he was appointed Minister of Agriculture of the Republic of Azerbaijan, and by presidential order of 3 April 2019 Rector of the Azerbaijan State Maritime Academy.\n\nBy the relevant presidential orders he received the Order For Service to the Fatherland, 2nd class (2011), the jubilee medal marking the centenary of the Azerbaijan Democratic Republic, 1918–2018 (2019), and the Order of Glory («Shohrat») for services to the development of education.\n\nHe is the author of 3 monographs and more than 30 scholarly works.',
    },
  },
];


// ── K31 · Sosial blok ──
// Bölmənin başlıq mətni onsuz da yazılmışdı (Social.tsx-də sabit idi) —
// buraya köçürülür ki, redaktor admin paneldən dəyişə bilsin.
// Hesab linkləri BOŞ gəlir: rəsmi ünvanları redaktor doldurur.
const SOCIAL_BLOCK_SEED = {
  shared: {
    ctaTag: '#ADDAlife',
    hashtags: '#ADDAlife\n#DənizçiOl\n#ADDA2026',
    instagramUrl: '',
    tiktokUrl: '',
    youtubeUrl: '',
    facebookUrl: '',
    linkedinUrl: '',
  },
  az: {
    eyebrow: 'ADDA sosial şəbəkələrdə',
    title: 'Kampusun nəbzi — <em>canlı yayımda</em>',
    lead: 'Tələbələrimizin gözü ilə ADDA: dəniz klubundan yataqxana axşamlarına, simulyator sessiyalarından məzun gününə. İzlə, bəyən, sabah özün paylaş.',
    ctaText: 'Sən də <em>izlə</em> —<br>sabah bu kadrlarda ol',
  },
  ru: {
    eyebrow: 'АГМА в социальных сетях',
    title: 'Пульс кампуса — <em>в прямом эфире</em>',
    lead: 'АГМА глазами наших студентов: от морского клуба до вечеров в общежитии, от сессий на тренажёре до выпускного. Следи, ставь лайк, а завтра поделись своим.',
    ctaText: 'Подпишись <em>и ты</em> —<br>завтра окажись в этих кадрах',
  },
  en: {
    eyebrow: 'ASMA on social media',
    title: 'The pulse of campus — <em>live</em>',
    lead: 'ASMA through our students\u2019 eyes: from the sailing club to evenings in the halls, from simulator sessions to graduation day. Follow, like, and share your own tomorrow.',
    ctaText: 'Follow us <em>too</em> —<br>be in these frames tomorrow',
  },
};


// ── K33 · «ADDA dünən və bu gün» səhifəsinin bölünməsi ──
// Bir səhifədə 8 mövzu vardı; ~1100 söz təkrar idi. Mövzular aidiyyəti
// menyu bəndlərinə ayrıldı. `page` tipi draftAndPublish=true olduğu üçün
// yaratmaqdan sonra publish() AÇIQ çağırılır — əks halda qaralamada qalır.
interface PageSplitText { title: string; body: string }
interface PageSplitSeed { slug: string; az: PageSplitText; ru: PageSplitText; en: PageSplitText }

const PAGE_SPLIT_SEED: PageSplitSeed[] = [
  {
    slug: 'adda-dunen-ve-bugun',
    az: {
      title: 'ADDA — dünən və bu gün',
      body: '**Azərbaycanda dənizçilik təhsilinin kökləri XIX əsrin sonlarına — 1881-ci ilə gedib çıxır. Azərbaycan Dövlət Dəniz Akademiyasının özü isə 1996-cı ildə, müstəqillik dövründə yaradılıb və bu, dənizçilik təhsilinin inkişafında yeni mərhələnin başlanğıcı oldu.**\n\n## Akademiyaya gedən yol\n\nRespublikamız dəniz ölkəsi olduğundan yüksəkixtisaslı dənizçi kadrlar hazırlayan ali təhsil müəssisəsinin əhəmiyyətini bilən ölkə rəhbəri Heydər Əliyevin təşəbbüsü və Nazirlər Kabinetinin 1996-cı il qərarı ilə Bakı Dəniz Yolları Məktəbinin bazasında Azərbaycan Dövlət Dəniz Akademiyası yaradıldı.\n\n## Beynəlxalq tanınma\n\nAkademiya ilk gündən təhsilini Beynəlxalq Dənizçilik Təşkilatının (IMO) «Dənizçilərin hazırlanması, sertifikatlandırılması və növbə çəkməsi haqqında» Beynəlxalq Konvensiyasının (STCW) tələblərinə uyğun qurub. Bütün ixtisaslar üzrə baza təhsil proqramları, tədris planları və dövlət standartları hazırlanaraq təsdiq edilib və IMO tərəfindən qəbul olunub.\n\nAkademiya **012 nömrəsi** altında dünya ali dəniz təhsili sisteminin kataloquna daxil edilib. Diplomu dünyanın **170-dən çox ölkəsi** tərəfindən tanınır.\n\n## Üzvlüklər\n\n- Beynəlxalq Dənizçilik Ali Məktəbləri Assosiasiyası (IAMU)\n- MDB ölkələrinin dənizçilik ali məktəblərinin Tədris-Metodiki Şurası — admiral S. O. Makarov adına Dövlət Dəniz və Çay Donanması Universiteti (Sankt-Peterburq) nəzdində\n- Xəzəryanı dövlətlərin Ali Məktəbləri Assosiasiyası — fəal iştirakçı\n\nAkademiya **11 ölkənin 18 universiteti** ilə ikitərəfli əməkdaşlıq edir. Tam siyahı: [Akademik tərəfdaşlar](/sehife/akademik-terefdaslar).\n\n## Bu gün\n\nAkademiyada dənizçilik ixtisasları üzrə təhsilin bütün pillələrində — bakalavriat, magistratura və doktorantura — müasir standartlara cavab verən tədris prosesi qurulub. Burada təkcə ölkə gəncləri deyil, bir sıra xarici ölkələrdən gələn tələbələr də təhsil alır.\n\nƏtraflı: [Rəqəmlər və faktlar](/sehife/reqemler-ve-faktlar) · [Fakültələr](/fakulteler) · [Keyfiyyətin menecmenti](/sehife/keyfiyyetin-monitorinqi)',
    },
    ru: {
      title: 'АГМА — вчера и сегодня',
      body: '**Корни морского образования в Азербайджане уходят в конец XIX века — к 1881 году. Сама же Азербайджанская Государственная Морская Академия создана в 1996 году, в период независимости, и это стало началом нового этапа развития морского образования.**\n\n## Путь к Академии\n\nПоскольку наша республика — морская страна, по инициативе руководителя страны Гейдара Алиева, понимавшего значение высшего учебного заведения, готовящего высококвалифицированные морские кадры, и решением Кабинета Министров 1996 года на базе Бакинской школы морских путей была создана Азербайджанская Государственная Морская Академия.\n\n## Международное признание\n\nС первого дня Академия выстроила обучение в соответствии с требованиями Международной конвенции о подготовке и дипломировании моряков и несении вахты (ПДНВ) Международной морской организации (ИМО). По всем специальностям разработаны и утверждены базовые образовательные программы, учебные планы и государственные стандарты, принятые ИМО.\n\nАкадемия включена в каталог мировой системы высшего морского образования под **номером 012**. Её диплом признаётся более чем в **170 странах мира**.\n\n## Членство\n\n- Международная ассоциация морских университетов (IAMU)\n- Учебно-методический совет морских вузов стран СНГ — при Государственном университете морского и речного флота имени адмирала С. О. Макарова (Санкт-Петербург)\n- Ассоциация вузов прикаспийских государств — активный участник\n\nАкадемия ведёт двустороннее сотрудничество с **18 университетами из 11 стран**. Полный список: [Академические партнёры](/sehife/akademik-terefdaslar).\n\n## Сегодня\n\nВ Академии выстроен отвечающий современным стандартам учебный процесс на всех уровнях морского образования — бакалавриат, магистратура и докторантура. Здесь учатся не только азербайджанские, но и иностранные студенты.\n\nПодробнее: [Цифры и факты](/sehife/reqemler-ve-faktlar) · [Факультеты](/fakulteler) · [Менеджмент качества](/sehife/keyfiyyetin-monitorinqi)',
    },
    en: {
      title: 'ASMA — Yesterday and Today',
      body: '**Maritime education in Azerbaijan traces its roots to the late nineteenth century — to 1881. The Azerbaijan State Marine Academy itself was established in 1996, during the years of independence, opening a new chapter in the development of maritime education.**\n\n## The road to the Academy\n\nAs a maritime nation, Azerbaijan needed an institution capable of training highly qualified seafarers. On the initiative of national leader Heydar Aliyev and by a 1996 decision of the Cabinet of Ministers, the Azerbaijan State Marine Academy was founded on the basis of the Baku Maritime School.\n\n## International recognition\n\nFrom its first day the Academy has built its programmes around the requirements of the International Maritime Organization\'s Convention on Standards of Training, Certification and Watchkeeping for Seafarers (STCW). Core curricula, study plans and state standards were developed and approved for every programme, and accepted by the IMO.\n\nThe Academy is listed in the catalogue of the world maritime education system under **number 012**. Its diploma is recognised in more than **170 countries**.\n\n## Memberships\n\n- International Association of Maritime Universities (IAMU)\n- Educational and Methodological Council of maritime universities of the CIS, based at the Admiral S. O. Makarov State University of Maritime and Inland Shipping (St Petersburg)\n- Association of Universities of the Caspian States — active participant\n\nThe Academy maintains bilateral cooperation with **18 universities across 11 countries**. Full list: [Academic partners](/sehife/akademik-terefdaslar).\n\n## Today\n\nThe Academy delivers teaching that meets modern standards at every level of maritime education — bachelor\'s, master\'s and doctoral. Its student body includes both Azerbaijani and international students.\n\nMore: [Facts and figures](/sehife/reqemler-ve-faktlar) · [Faculties](/fakulteler) · [Quality management](/sehife/keyfiyyetin-monitorinqi)',
    },
  },
  {
    slug: 'akademik-terefdaslar',
    az: {
      title: 'Akademik tərəfdaşlar',
      body: '**Azərbaycan Dövlət Dəniz Akademiyası 11 ölkənin 18 universiteti ilə ikitərəfli əməkdaşlıq edir.**\n\n## Tərəfdaş ali təhsil müəssisələri\n\n**Rusiya**\n- Admiral S. O. Makarov adına Dövlət Dəniz və Çay Donanması Universiteti\n- Həştərxan Dövlət Texniki Universiteti\n- F. F. Uşakov adına Novorossiysk Dövlət Dəniz Universiteti\n- Nevelski adına Dövlət Dəniz Universiteti\n\n**Ukrayna**\n- Admiral Makarov adına Milli Gəmiqayırma Universiteti\n- Getman Petr Konaşeviç-Sahaydaçnı adına Kiyev Dövlət Su Nəqliyyatı Akademiyası\n- Odessa Milli Dəniz Universiteti\n\n**Gürcüstan**\n- Batumi Dəniz Akademiyası\n- Batumi Naviqasiya Tədris Universiteti\n\n**Polşa** — Şetsin Dəniz Akademiyası\n**Latviya** — Latviya Dəniz Akademiyası\n**Estoniya** — Estoniya Dəniz Akademiyası (TalTech)\n**Monteneqro** — Monteneqro Universiteti\n**Bolqarıstan** — Varna Texniki Universiteti\n**Qazaxıstan** — Ş. Yesenov adına Xəzər Dövlət Texnologiya və Mühəndislik Universiteti\n**Litva** — Klaypeda Universiteti\n**Türkiyə** — İstanbul Texniki Universiteti\n\n## Beynəlxalq şirkətlər\n\nAkademiya Litvanın **Informacinė Raida** və Türkiyənin **Turksen Eğitim Ltd** şirkətləri ilə də sıx əlaqələr qurub.',
    },
    ru: {
      title: 'Академические партнёры',
      body: '**Азербайджанская Государственная Морская Академия ведёт двустороннее сотрудничество с 18 университетами из 11 стран.**\n\n## Партнёрские вузы\n\n**Россия**\n- Государственный университет морского и речного флота имени адмирала С. О. Макарова\n- Астраханский государственный технический университет\n- Новороссийский государственный морской университет имени Ф. Ф. Ушакова\n- Морской государственный университет имени адмирала Г. И. Невельского\n\n**Украина**\n- Национальный университет кораблестроения имени адмирала Макарова\n- Киевская государственная академия водного транспорта имени гетмана Петра Конашевича-Сагайдачного\n- Одесский национальный морской университет\n\n**Грузия**\n- Батумская морская академия\n- Батумский навигационный учебный университет\n\n**Польша** — Морская академия в Щецине\n**Латвия** — Латвийская морская академия\n**Эстония** — Эстонская морская академия (TalTech)\n**Черногория** — Университет Черногории\n**Болгария** — Технический университет Варны\n**Казахстан** — Каспийский государственный университет технологий и инжиниринга имени Ш. Есенова\n**Литва** — Клайпедский университет\n**Турция** — Стамбульский технический университет\n\n## Международные компании\n\nАкадемия также поддерживает тесные связи с литовской **Informacinė Raida** и турецкой **Turksen Eğitim Ltd**.',
    },
    en: {
      title: 'Academic Partners',
      body: '**The Azerbaijan State Marine Academy maintains bilateral cooperation with 18 universities across 11 countries.**\n\n## Partner institutions\n\n**Russia**\n- Admiral S. O. Makarov State University of Maritime and Inland Shipping\n- Astrakhan State Technical University\n- Admiral F. F. Ushakov Novorossiysk State Maritime University\n- Admiral Nevelskoy Maritime State University\n\n**Ukraine**\n- Admiral Makarov National University of Shipbuilding\n- Kyiv State Maritime Academy named after Hetman Petro Konashevych-Sahaidachnyi\n- Odesa National Maritime University\n\n**Georgia**\n- Batumi Maritime Academy\n- Batumi Navigation Teaching University\n\n**Poland** — Maritime University of Szczecin\n**Latvia** — Latvian Maritime Academy\n**Estonia** — Estonian Maritime Academy (TalTech)\n**Montenegro** — University of Montenegro\n**Bulgaria** — Technical University of Varna\n**Kazakhstan** — Sh. Yessenov Caspian University of Technology and Engineering\n**Lithuania** — Klaipeda University\n**Türkiye** — Istanbul Technical University\n\n## International companies\n\nThe Academy also works closely with **Informacinė Raida** (Lithuania) and **Turksen Eğitim Ltd** (Türkiye).',
    },
  },
  {
    slug: 'keyfiyyetin-monitorinqi',
    az: {
      title: 'Keyfiyyətin menecmenti və monitorinqi',
      body: '**Akademiyada keyfiyyət siyasəti tədris, təlim-trenajor mərkəzləri və dəniz nəqliyyatı mütəxəssislərinin hazırlığı üzrə xidmətlərə qoyulan beynəlxalq və milli standartların şərtsiz yerinə yetirilməsinə əsaslanır və işlərin təşkilinin bütün səviyyələrini əhatə edir.**\n\n## İSO 9001 sertifikatlaşdırılması\n\n| tarix | standart |\n|---|---|\n| 2002-ci ilin oktyabrından | İSO 9001:2000 |\n| 2010-cu ildən | İSO 9001:2008 |\n| 2018-ci ilin fevralından | İSO 9001:2015 |\n\nAkademiya dənizçi mütəxəssislərin hazırlanması sahəsində keyfiyyətin menecmenti sistemi üzrə fasiləsiz olaraq bu standartlarla işləyir.\n\n## Amerika Gəmiçilik Bürosunun (ABS) sertifikatı\n\n2016-cı ilin fevralında dünyanın nüfuzlu təsnifat cəmiyyətlərindən olan **Amerika Gəmiçilik Bürosu (ABS)** Akademiyanın Dənizçilərin hazırlanması və sertifikatlandırılması mərkəzində beynəlxalq audit keçirib. Auditin nəticələri əsasında mərkəzin ABS-in «Tədris müəssisələrinin və təlim kurslarının sertifikatlaşdırılması üzrə standartları»na uyğunluğu təsdiqlənib və Akademiya 2016-cı ildə **ABS uyğunluq sertifikatını** əldə edib.\n\n## Təlim Tədris Mərkəzi\n\nMərkəz İSO 9001:2015 standartına uyğun fəaliyyət göstərir və **Bureau Veritas** beynəlxalq sertifikatlaşdırma təşkilatı tərəfindən audit olunaraq sertifikata layiq görülüb. Ətraflı: [Təlim-Tədris Mərkəzi](/struktur/telim-tedris-merkezi-ttm).',
    },
    ru: {
      title: 'Менеджмент и мониторинг качества',
      body: '**Политика качества Академии основана на безусловном выполнении международных и национальных стандартов, предъявляемых к обучению, тренажёрным центрам и подготовке специалистов морского транспорта, и охватывает все уровни организации работы.**\n\n## Сертификация по ИСО 9001\n\n| дата | стандарт |\n|---|---|\n| с октября 2002 года | ИСО 9001:2000 |\n| с 2010 года | ИСО 9001:2008 |\n| с февраля 2018 года | ИСО 9001:2015 |\n\nАкадемия непрерывно работает по этим стандартам в области системы менеджмента качества подготовки морских специалистов.\n\n## Сертификат Американского бюро судоходства (ABS)\n\nВ феврале 2016 года **Американское бюро судоходства (ABS)**, одно из авторитетнейших классификационных обществ мира, провело международный аудит Центра подготовки и сертификации моряков Академии. По результатам аудита подтверждено соответствие центра «Стандартам сертификации учебных заведений и учебных курсов» ABS, и в 2016 году Академия получила **сертификат соответствия ABS**.\n\n## Учебно-тренировочный центр\n\nЦентр работает в соответствии со стандартом ИСО 9001:2015 и прошёл аудит международной сертификационной организации **Bureau Veritas** с выдачей сертификата. Подробнее: [Учебно-тренировочный центр](/struktur/telim-tedris-merkezi-ttm).',
    },
    en: {
      title: 'Quality Management and Monitoring',
      body: '**The Academy\'s quality policy rests on the unconditional fulfilment of the international and national standards governing teaching, simulator training centres and services for training maritime transport specialists, and covers every level of the organisation.**\n\n## ISO 9001 certification\n\n| date | standard |\n|---|---|\n| from October 2002 | ISO 9001:2000 |\n| from 2010 | ISO 9001:2008 |\n| from February 2018 | ISO 9001:2015 |\n\nThe Academy has worked continuously to these standards in its quality management system for training maritime professionals.\n\n## American Bureau of Shipping (ABS) certificate\n\nIn February 2016 the **American Bureau of Shipping (ABS)**, one of the world\'s leading classification societies, carried out an international audit of the Academy\'s Seafarer Training and Certification Centre. The audit confirmed the centre\'s conformity with the ABS *Standards for Certification of Training Institutions and Courses*, and in 2016 the Academy obtained its **ABS certificate of conformity**.\n\n## Training Centre\n\nThe Centre operates to ISO 9001:2015 and has been audited and certified by the international certification body **Bureau Veritas**. More: [Training Centre](/struktur/telim-tedris-merkezi-ttm).',
    },
  },
  {
    slug: 'reqemler-ve-faktlar',
    az: {
      title: 'Rəqəmlər və faktlar',
      body: '**Akademiyanın bugünkü strukturu və potensialı — rəqəmlərlə.**\n\n## Struktur\n\n| göstərici | say |\n|---|---|\n| Fakültə | 2 |\n| Kafedra | 7 |\n| Qəbul aparılan ixtisas | 4 |\n\n## Tələbə və heyət\n\n| göstərici | say |\n|---|---|\n| Tələbə | 1 093 |\n| Professor | 6 |\n| Dosent | 30 |\n| Baş müəllim | 47 |\n| Assistent müəllim | 17 |\n\n## Qəbul aparılan ixtisaslar\n\n- [Dəniz naviqasiyası mühəndisliyi](/ixtisaslar/deniz-naviqasiyasi-muhendisliyi)\n- [Gəmi energetik qurğularının istismarı mühəndisliyi](/ixtisaslar/gemi-energetik-qurgularinin-istismari-muhendisliyi)\n- [Gəmiqayırma və gəmi təmiri mühəndisliyi](/ixtisaslar/gemiqayirma-ve-gemi-temiri-muhendisliyi)\n- [Elektrik və elektronika mühəndisliyi (su nəqliyyatı üzrə)](/ixtisaslar/elektrik-ve-elektronika-muhendisliyi-su-neqliyyati-uzre)\n\n## Beynəlxalq göstəricilər\n\n- Diplomun tanındığı ölkə sayı: **170-dən çox**\n- Dünya ali dəniz təhsili kataloqunda nömrə: **012**\n- İkitərəfli əməkdaşlıq: **11 ölkənin 18 universiteti**\n- Təlim Tədris Mərkəzində kurs sayı: **53**\n\n*Göstəricilər tədris ili üzrə yenilənir.*',
    },
    ru: {
      title: 'Цифры и факты',
      body: '**Сегодняшняя структура и потенциал Академии — в цифрах.**\n\n## Структура\n\n| показатель | количество |\n|---|---|\n| Факультеты | 2 |\n| Кафедры | 7 |\n| Специальности приёма | 4 |\n\n## Студенты и персонал\n\n| показатель | количество |\n|---|---|\n| Студенты | 1 093 |\n| Профессора | 6 |\n| Доценты | 30 |\n| Старшие преподаватели | 47 |\n| Ассистенты | 17 |\n\n## Специальности приёма\n\n- [Инженерия морской навигации](/ixtisaslar/deniz-naviqasiyasi-muhendisliyi)\n- [Инженерия эксплуатации судовых энергетических установок](/ixtisaslar/gemi-energetik-qurgularinin-istismari-muhendisliyi)\n- [Инженерия судостроения и судоремонта](/ixtisaslar/gemiqayirma-ve-gemi-temiri-muhendisliyi)\n- [Электротехника и электроника (водный транспорт)](/ixtisaslar/elektrik-ve-elektronika-muhendisliyi-su-neqliyyati-uzre)\n\n## Международные показатели\n\n- Стран, признающих диплом: **более 170**\n- Номер в каталоге мирового морского образования: **012**\n- Двустороннее сотрудничество: **18 университетов из 11 стран**\n- Курсов в Учебно-тренировочном центре: **53**\n\n*Показатели обновляются по учебному году.*',
    },
    en: {
      title: 'Facts and Figures',
      body: '**The Academy\'s current structure and capacity, in numbers.**\n\n## Structure\n\n| indicator | count |\n|---|---|\n| Faculties | 2 |\n| Departments | 7 |\n| Admission programmes | 4 |\n\n## Students and staff\n\n| indicator | count |\n|---|---|\n| Students | 1,093 |\n| Professors | 6 |\n| Associate professors | 30 |\n| Senior lecturers | 47 |\n| Assistant lecturers | 17 |\n\n## Admission programmes\n\n- [Marine Navigation Engineering](/ixtisaslar/deniz-naviqasiyasi-muhendisliyi)\n- [Marine Power Plant Operation Engineering](/ixtisaslar/gemi-energetik-qurgularinin-istismari-muhendisliyi)\n- [Shipbuilding and Ship Repair Engineering](/ixtisaslar/gemiqayirma-ve-gemi-temiri-muhendisliyi)\n- [Electrical and Electronics Engineering (Water Transport)](/ixtisaslar/elektrik-ve-elektronika-muhendisliyi-su-neqliyyati-uzre)\n\n## International indicators\n\n- Countries recognising the diploma: **more than 170**\n- Number in the world maritime education catalogue: **012**\n- Bilateral cooperation: **18 universities in 11 countries**\n- Courses at the Training Centre: **53**\n\n*Figures are updated each academic year.*',
    },
  },
  {
    slug: 'tedris-gemisi',
    az: {
      title: 'Tədris gəmisi',
      body: '**Tədris gəmisi Akademiyada müasir tədrisi təmin edən əsas vasitələrdən biridir.**\n\nKonvension ixtisaslarda təhsil alan tələbələrin nəzəri və praktiki məşğələləri, həmçinin istehsalat təcrübələri tədris gəmisində keçirilir.\n\n## Gəmilər\n\n- **«General Əsədov»** — 2015-ci il sentyabrın 15-dən tədris gəmisi kimi ADDA tələbələrinin ixtiyarına verilib\n- **«Sabit Orucov»** sərnişin gəmisi — 2017-ci ildən\n\nTələbələr həmçinin müasir dünya standartlarına cavab verən digər gəmilərdə və **Bakı Gəmiqayırma Zavodunda** həm ixtisas fənlərini, həm də istehsalat təcrübəsini öyrənirlər.\n\nTəcrübə qaydaları haqqında: [Təcrübə haqqında](/sehife/tecrube-haqqinda).',
    },
    ru: {
      title: 'Учебное судно',
      body: '**Учебное судно — одно из главных средств обеспечения современного обучения в Академии.**\n\nТеоретические и практические занятия студентов конвенционных специальностей, а также производственная практика проводятся на учебном судне.\n\n## Суда\n\n- **«Генерал Асадов»** — передано в распоряжение студентов АГМА в качестве учебного судна с 15 сентября 2015 года\n- Пассажирское судно **«Сабит Оруджев»** — с 2017 года\n\nСтуденты также осваивают профильные дисциплины и проходят производственную практику на других судах, отвечающих современным мировым стандартам, и на **Бакинском судостроительном заводе**.\n\nО правилах практики: [О практике](/sehife/tecrube-haqqinda).',
    },
    en: {
      title: 'Training Vessel',
      body: '**The training vessel is one of the Academy\'s principal means of delivering modern instruction.**\n\nTheoretical and practical classes for students on convention programmes, along with their shipboard practice, are carried out aboard the training vessel.\n\n## Vessels\n\n- **General Asadov** — placed at the disposal of ASMA students as a training vessel from 15 September 2015\n- The passenger vessel **Sabit Orujov** — from 2017\n\nStudents also study professional subjects and complete shipboard practice aboard other vessels meeting modern international standards and at the **Baku Shipyard**.\n\nOn practice arrangements: [About practical training](/sehife/tecrube-haqqinda).',
    },
  },
  {
    slug: 'binalar-ve-infrastruktur',
    az: {
      title: 'Binalar və maddi-texniki baza',
      body: '**Gəmiçiliyin donanması müasir gəmilərlə zənginləşdikcə, Akademiyanın tədris prosesi də yeni trenajorlarla təmin edilir və laboratoriya şəbəkəsi genişlənir.**\n\n## Binalar\n\nAkademiyanın yeni korpusu 2016-cı ildən tələbələrin istifadəsinə verilib. **Kazım Kazımzadə küçəsi 127** ünvanındakı dördmərtəbəli bina «Azərbaycan Xəzər Dəniz Gəmiçiliyi» QSC-nin vəsaiti hesabına əsaslı təmir edilib və ərazisi abadlaşdırılıb.\n\n## Trenajorlar\n\nBeynəlxalq Konvensiyanın **B-1/12** bölməsinin tələblərinə cavab verən trenajorlar tədris prosesində istifadə olunur:\n\n- Engine Room Simulator **ERS4000**\n- **NT-4000**\n- **TQS**\n- **NS-3000**\n- «Radar», «Naviqasiya», «Elektron xəritə çəkmə», **GMDSS** trenajorları\n\n## Təlim Tədris Mərkəzinin avadanlığı\n\n1. Qravitasiya tipli AT xilasetmə qayığı\n2. «Wiking» xilasetmə salı\n3. Qlobal Dəniz Fəlakət və Əmniyyətli Rabitə Sistemi (QDFƏRS) trenajoru — POSEIDON və TRANSAS istehsalı\n4. QDFƏRS-in real avadanlığı\n5. «Radar müşahidəsi və təsviri, avtomatik radar müşahidəsi vasitələrinin istismarı» trenajoru — POSEIDON istehsalı\n6. «Elektron Xəritə Displeyinin və İnformasiya Sistemlərinin İstismar Qaydaları» trenajoru\n7. «Sürətli xilasetmə qayıq mütəxəssisi» hazırlığı trenajoru — TRANSAS istehsalı\n\nAkademiya auditoriya, laboratoriya və tədris kabinələrini ən müasir texniki-təlim vasitələri ilə davamlı zənginləşdirir.',
    },
    ru: {
      title: 'Здания и материально-техническая база',
      body: '**По мере пополнения флота современными судами учебный процесс Академии оснащается новыми тренажёрами, а сеть лабораторий расширяется.**\n\n## Здания\n\nНовый корпус Академии передан в пользование студентов с 2016 года. Четырёхэтажное здание по адресу **улица Кязыма Кязымзаде, 127** капитально отремонтировано за счёт средств ЗАО «Азербайджанское Каспийское Морское Пароходство», прилегающая территория благоустроена.\n\n## Тренажёры\n\nВ учебном процессе используются тренажёры, отвечающие требованиям раздела **B-1/12** Международной конвенции:\n\n- Engine Room Simulator **ERS4000**\n- **NT-4000**\n- **TQS**\n- **NS-3000**\n- Тренажёры «Радар», «Навигация», «Электронная картография», **ГМССБ**\n\n## Оборудование Учебно-тренировочного центра\n\n1. Спасательная шлюпка гравитационного типа\n2. Спасательный плот «Wiking»\n3. Тренажёр Глобальной морской системы связи при бедствии и для обеспечения безопасности (ГМССБ) — производства POSEIDON и TRANSAS\n4. Реальное оборудование ГМССБ\n5. Тренажёр «Радиолокационное наблюдение и прокладка, эксплуатация средств САРП» — производства POSEIDON\n6. Тренажёр «Правила эксплуатации ЭКНИС»\n7. Тренажёр подготовки «Специалист по дежурной спасательной шлюпке» — производства TRANSAS\n\nАкадемия постоянно оснащает аудитории, лаборатории и учебные кабинеты новейшими техническими средствами обучения.',
    },
    en: {
      title: 'Buildings and Facilities',
      body: '**As the shipping fleet is renewed with modern vessels, the Academy\'s teaching is equipped with new simulators and its laboratory network expands.**\n\n## Buildings\n\nThe Academy\'s new block has been in student use since 2016. The four-storey building at **127 Kazim Kazimzade Street** was fully refurbished with funding from the Azerbaijan Caspian Shipping Company (ASCO), and its grounds landscaped.\n\n## Simulators\n\nSimulators meeting the requirements of section **B-1/12** of the International Convention are used in teaching:\n\n- Engine Room Simulator **ERS4000**\n- **NT-4000**\n- **TQS**\n- **NS-3000**\n- Radar, Navigation, Electronic Chart and **GMDSS** simulators\n\n## Training Centre equipment\n\n1. Gravity-type lifeboat\n2. Wiking liferaft\n3. Global Maritime Distress and Safety System (GMDSS) simulator — POSEIDON and TRANSAS\n4. Live GMDSS equipment\n5. Radar observation and plotting / ARPA operation simulator — POSEIDON\n6. ECDIS operating procedures simulator\n7. Fast rescue boat specialist training simulator — TRANSAS\n\nThe Academy continuously equips its lecture rooms, laboratories and teaching cabinets with the latest technical training aids.',
    },
  },
  {
    slug: 'mezunlarin-isle-teminati',
    az: {
      title: 'Məzunların işlə təminatı',
      body: '**Akademiya «Azərbaycan Xəzər Dəniz Gəmiçiliyi» QSC-nin (ASCO) əsas kadr sütunudur. Gəmiçiliyin yüksəkixtisaslı kadrlara olan daimi ehtiyacı keyfiyyətə üstünlük verilməsi şərtilə ödənilir.**\n\n## İşə qəbul\n\nTəhsildə uğurlu nəticələrlə fərqlənən məzunların işə qəbulu **zəmanət məktublarının verilməsi əsasında** həyata keçirilir. Məzunlar üçün karyera inkişafı, əlavə təhsil və sosial müdafiənin gücləndirilməsi imkanları yaradılır.\n\n## Dəniz təcrübəsi\n\nDənizçi kadrların beynəlxalq standartlara uyğun inkişafını təmin etmək məqsədilə hər il bir qrup tələbə **Qara dənizdəki gəmilərə üzmə təcrübəsinə** göndərilir.\n\n## Xaricdə təhsil\n\nAkademiyanın zərbəçi və əlaçı tələbələri sırasından müvafiq seçim yolu ilə xarici ölkələrin dənizçilik ali məktəblərində **ASCO-nun vəsaiti hesabına** müddətli təhsilalma imkanı yaradılır.\n\n## Məzunlar hara işə düşür\n\nFakültə məzunları yalnız Xəzər dənizində deyil, dünyanın bütün sularında üzən gəmilərdə, aparıcı beynəlxalq şirkətlərdə, limanlarda və gəmi təmiri müəssisələrində çalışırlar. İxtisaslar üzrə vəzifələr: [İxtisaslar](/ixtisaslar).',
    },
    ru: {
      title: 'Трудоустройство выпускников',
      body: '**Академия — основная кадровая опора ЗАО «Азербайджанское Каспийское Морское Пароходство» (ASCO). Постоянная потребность пароходства в высококвалифицированных кадрах удовлетворяется при приоритете качества.**\n\n## Приём на работу\n\nТрудоустройство выпускников, отличившихся успехами в учёбе, осуществляется **на основании выдачи гарантийных писем**. Для выпускников создаются возможности карьерного роста, дополнительного образования и усиления социальной защиты.\n\n## Морская практика\n\nДля развития морских кадров в соответствии с международными стандартами ежегодно группа студентов направляется на **плавательную практику на суда Чёрного моря**.\n\n## Обучение за рубежом\n\nДля отличников и лучших студентов Академии по итогам соответствующего отбора создаётся возможность срочного обучения в морских вузах зарубежных стран **за счёт средств ASCO**.\n\n## Где работают выпускники\n\nВыпускники факультетов работают не только на Каспии, но и на судах, ходящих во всех водах мира, в ведущих международных компаниях, портах и на судоремонтных предприятиях. Должности по специальностям: [Специальности](/ixtisaslar).',
    },
    en: {
      title: 'Graduate Employment',
      body: '**The Academy is the principal source of personnel for the Azerbaijan Caspian Shipping Company (ASCO). The company\'s continuing need for highly qualified crews is met with quality as the first priority.**\n\n## Recruitment\n\nGraduates who distinguish themselves academically are recruited **on the basis of letters of guarantee**. Opportunities are created for career development, further education and strengthened social protection.\n\n## Sea practice\n\nTo develop seafarers in line with international standards, a group of students is sent each year for **sea practice aboard vessels in the Black Sea**.\n\n## Study abroad\n\nThrough a selection process among the Academy\'s highest-achieving students, fixed-term study at maritime universities abroad is funded **by ASCO**.\n\n## Where graduates work\n\nGraduates serve not only in the Caspian but aboard vessels sailing in all the world\'s waters, with leading international companies, in ports and at ship repair yards. Positions by programme: [Programmes](/ixtisaslar).',
    },
  },
  {
    slug: 'sosial-teminat-ve-maddi-yardim',
    az: {
      title: 'Sosial təminat və maddi yardım',
      body: '**Professor-müəllim və tələbə heyətinin səmərəli fəaliyyəti üçün Akademiyada hər cür şərait yaradılıb.**\n\n## Tələbələrə ödənişsiz təminat\n\nAkademiyada təhsil alan tələbələr aşağıdakılarla **ödənişsiz** təmin olunur:\n\n- Tam təmirli yataqxana (güzəştli şərtlə)\n- Gündə iki dəfə yemək\n- Yay və qış geyim formaları\n\n## Kampus infrastrukturu\n\n- Azərbaycan, rus və ingilis dillərində çoxsaylı dənizçilik ədəbiyyatı ilə təmin olunmuş informasiya-resurs mərkəzi\n- Yeməkxana\n- İdman zalları\n- Hovuz\n\nƏtraflı: [Yataqxana](/sehife/yataqxana) · [İdman](/sehife/idman) · [İnformasiya Resurs Mərkəzi](/struktur/informasiya-resurs-merkezi)\n\n## Tələbə təşkilatları\n\nDövlət gənclər siyasətinin prioritet istiqamətlərinə uyğun olaraq Akademiyada üç tələbə təşkilatı fəaliyyət göstərir:\n\n- [Tələbə Elmi Cəmiyyəti](/sehife/telebe-elmi-cemiyyeti)\n- [Tələbə Gənclər Təşkilatı](/sehife/telebe-gencler-teskilati)\n- [Tələbə Həmkarlar İttifaqı Komitəsi](/sehife/telebe-hemkarlar-ittifaqi-komitesi)',
    },
    ru: {
      title: 'Социальное обеспечение и материальная помощь',
      body: '**В Академии созданы все условия для эффективной работы профессорско-преподавательского состава и студентов.**\n\n## Бесплатное обеспечение студентов\n\nСтуденты Академии **бесплатно** обеспечиваются:\n\n- полностью отремонтированным общежитием (на льготных условиях)\n- двухразовым питанием\n- летней и зимней форменной одеждой\n\n## Инфраструктура кампуса\n\n- Информационно-ресурсный центр с обширной литературой по морскому делу на азербайджанском, русском и английском языках\n- Столовая\n- Спортивные залы\n- Бассейн\n\nПодробнее: [Общежитие](/sehife/yataqxana) · [Спорт](/sehife/idman) · [Информационно-ресурсный центр](/struktur/informasiya-resurs-merkezi)\n\n## Студенческие организации\n\nВ соответствии с приоритетными направлениями государственной молодёжной политики в Академии действуют три студенческие организации:\n\n- [Студенческое научное общество](/sehife/telebe-elmi-cemiyyeti)\n- [Организация студенческой молодёжи](/sehife/telebe-gencler-teskilati)\n- [Студенческий профсоюзный комитет](/sehife/telebe-hemkarlar-ittifaqi-komitesi)',
    },
    en: {
      title: 'Student Welfare and Support',
      body: '**The Academy provides the conditions its teaching staff and students need to work effectively.**\n\n## Provision at no cost to students\n\nStudents at the Academy receive the following **free of charge**:\n\n- Fully refurbished hall of residence (on preferential terms)\n- Two meals a day\n- Summer and winter uniform\n\n## Campus facilities\n\n- An information resource centre stocked with extensive maritime literature in Azerbaijani, Russian and English\n- Canteen\n- Sports halls\n- Swimming pool\n\nMore: [Halls of residence](/sehife/yataqxana) · [Sport](/sehife/idman) · [Information Resource Centre](/struktur/informasiya-resurs-merkezi)\n\n## Student organisations\n\nIn line with the priorities of national youth policy, three student organisations operate at the Academy:\n\n- [Student Research Society](/sehife/telebe-elmi-cemiyyeti)\n- [Student Youth Organisation](/sehife/telebe-gencler-teskilati)\n- [Student Trade Union Committee](/sehife/telebe-hemkarlar-ittifaqi-komitesi)',
    },
  },
];


// ── K34 · Tarix marşrutu ──
// 1867–2026: 14 mərhələ, hər biri ÜÇ DİLDƏ. Əvvəlki skelet 5 nöqtədən
// ibarət idi və YALNIZ `az` yaradılmışdı — /ru/tarix və /en/tarix boş
// qalırdı. Burada hər mərhələ üçün ru/en lokalizasiyası da yazılır.
interface MilestoneText { title: string; description: string }
interface MilestoneSeed {
  year: number;
  era: 'temel' | 'inkisaf' | 'muasir';
  sortOrder: number;
  az: MilestoneText;
  ru: MilestoneText;
  en: MilestoneText;
}

const MILESTONE_SEED: MilestoneSeed[] = [
  {
    year: 1867,
    era: 'temel',
    sortOrder: 10,
    az: { title: 'Dənizçilik siniflərinin nizamnaməsi', description: 'XIX əsrdə yelkənli taxta gəmilərdən buxar mühərrikli metal gəmilərə keçid dəniz gəmiçiliyi üçün ixtisaslı kadr məsələsini kəskinləşdirdi. 1864-cü ildə «Dənizçilik sinifləri haqqında nizamnamə» və «Şkiper və şturman adı almaq üçün sınaq qaydaları»nı hazırlayan xüsusi komissiya yaradıldı; nizamnamə 27 iyun 1867-ci ildə təsdiq edildi.' },
    ru: { title: 'Устав мореходных классов', description: 'В XIX веке переход от деревянных парусников к металлическим судам с паровыми машинами обострил вопрос подготовки квалифицированных кадров для морского флота. В 1864 году была создана специальная комиссия, разработавшая «Устав о мореходных классах» и «Правила испытаний на звание шкипера и штурмана»; устав был утверждён 27 июня 1867 года.' },
    en: { title: 'The statute of the navigation classes', description: 'In the nineteenth century the shift from wooden sailing vessels to steam-powered metal ships made the training of qualified crews urgent. A commission formed in 1864 drafted the Statute on Navigation Classes and the Rules of Examination for the Ranks of Skipper and Navigator; the statute was approved on 27 June 1867.' },
  },
  {
    year: 1870,
    era: 'temel',
    sortOrder: 20,
    az: { title: 'Bakıda məktəb qərarı', description: 'Bakı limanına təhkim olunmuş gəmilərdə azərbaycanlı dənizçilərin çoxluğu və şəhər ictimaiyyətinin dənizçilik təhsilinə müsbət münasibəti nəzərə alınaraq, Bakıda «Uzaq səfərlər məktəbi»nin təsis edilməsi barədə qərar qəbul olundu.' },
    ru: { title: 'Решение об открытии школы в Баку', description: 'С учётом большого числа азербайджанских моряков на судах, приписанных к Бакинскому порту, и благожелательного отношения городской общественности к морскому образованию было принято решение об учреждении в Баку «Школы дальнего плавания».' },
    en: { title: 'The decision to open a school in Baku', description: 'Given the large number of Azerbaijani seafarers on vessels registered at the port of Baku, and the favourable attitude of the city\'s public towards maritime education, a decision was taken to establish a School of Deep-Sea Navigation in Baku.' },
  },
  {
    year: 1881,
    era: 'temel',
    sortOrder: 30,
    az: { title: 'Bakı dənizçilik məktəbi açılır', description: '27 iyun 1877-ci il tarixli xüsusi Nizamnaməyə əsasən, 8 noyabr 1881-ci ildə Bakıda üç bölmədən ibarət I dərəcəli dənizçilik məktəbi açıldı. Qəbul zamanı xüsusi biliklər tələb olunmurdu — yazıb-oxuma bacarığı kifayət edirdi. İlk direktor dəniz coğrafiyası üzrə baş müəllim, II dərəcəli kapitan N. M. Filippov oldu.' },
    ru: { title: 'Открытие Бакинского мореходного училища', description: 'На основании особого Устава от 27 июня 1877 года 8 ноября 1881 года в Баку было открыто мореходное училище I разряда, состоявшее из трёх отделений. При поступлении специальных знаний не требовалось — было достаточно умения читать и писать. Первым директором стал старший преподаватель морской географии, капитан II разряда Н. М. Филиппов.' },
    en: { title: 'The Baku navigation school opens', description: 'Under a special statute of 27 June 1877, a first-class navigation school with three departments opened in Baku on 8 November 1881. Admission required no specialist knowledge — literacy was sufficient. Its first director was N. M. Filippov, senior lecturer in marine geography and a second-class master mariner.' },
  },
  {
    year: 1896,
    era: 'temel',
    sortOrder: 40,
    az: { title: 'Gəmi mexanikləri məktəbi', description: 'Mühəndis-mexanik A. A. Maslovun yaratdığı «Gəmi mexanikası» kursları — Gəmi mexanikləri məktəbi — fəaliyyətə başladı. Beləliklə, Bakıda naviqasiya ilə yanaşı gəmi maşın heyəti üzrə də hazırlıq quruldu.' },
    ru: { title: 'Школа судовых механиков', description: 'Начали работу курсы «Судовая механика» — Школа судовых механиков, — созданные инженером-механиком А. А. Масловым. Так в Баку наряду с навигацией была выстроена и подготовка судовых механиков.' },
    en: { title: 'The school for marine engineers', description: 'Courses in marine engineering — the School for Marine Engineers — were founded by the engineer A. A. Maslov. Baku thus gained training for engine-room crews alongside navigation.' },
  },
  {
    year: 1902,
    era: 'temel',
    sortOrder: 50,
    az: { title: 'Bakı uzaq səfərlər məktəbi', description: '1 iyul 1902-ci ildə «Bakı dənizçilik sinifləri»nin bazasında üçillik «Bakı uzaq səfərlər məktəbi» yaradıldı, nəzdində hazırlıq kursları təşkil edildi. 1881–1902-ci illərdə dənizçilik siniflərini bitirmiş 945 nəfərdən 126-sı azərbaycanlı idi.' },
    ru: { title: 'Бакинская школа дальнего плавания', description: '1 июля 1902 года на базе «Бакинских мореходных классов» была создана трёхлетняя «Бакинская школа дальнего плавания», при которой организовали подготовительные курсы. Из 945 человек, окончивших мореходные классы в 1881–1902 годах, 126 были азербайджанцами.' },
    en: { title: 'The Baku School of Deep-Sea Navigation', description: 'On 1 July 1902 the three-year Baku School of Deep-Sea Navigation was established on the basis of the Baku navigation classes, with preparatory courses attached. Of the 945 people who completed the navigation classes between 1881 and 1902, 126 were Azerbaijani.' },
  },
  {
    year: 1920,
    era: 'inkisaf',
    sortOrder: 60,
    az: { title: 'Bakı Su Nəqliyyatı Texnikumu', description: '«Bakı uzaq səfərlər məktəbi»nin bazasında Bakı Su Nəqliyyatı Texnikumu yaradıldı. Məktəbin 1910-cu il məzunu, dənizçi kadrların yetişməsində xüsusi xidməti olan Vikenti Pavloviç Koroleviç texnikumun direktoru seçildi. 1 oktyabr 1921-ci ildə texnikumun nəzdində əyani və axşam şöbələri açıldı.' },
    ru: { title: 'Бакинский техникум водного транспорта', description: 'На базе «Бакинской школы дальнего плавания» был создан Бакинский техникум водного транспорта. Директором был избран выпускник школы 1910 года Викентий Павлович Королевич, сыгравший особую роль в подготовке морских кадров. 1 октября 1921 года при техникуме открылись дневное и вечернее отделения.' },
    en: { title: 'The Baku Water Transport Technical College', description: 'The Baku Water Transport Technical College was founded on the basis of the School of Deep-Sea Navigation. Vikenty Pavlovich Korolevich, a 1910 graduate of the school who did much for the training of seafarers, was elected its director. Full-time and evening departments opened on 1 October 1921.' },
  },
  {
    year: 1924,
    era: 'inkisaf',
    sortOrder: 70,
    az: { title: 'Xəzər Dəniz Gəmiçiliyinin tabeliyinə', description: '1 oktyabr 1924-cü ildə Dəniz Nəqliyyatı Mərkəzi İdarəsinin və Yollar xidməti üzrə Xalq Komissarlığının sərəncamı ilə texnikum «Bakı Su Yolları Texnikumu» adlandırılaraq Xəzər Dəniz Gəmiçiliyinin maarif şöbəsinin tabeliyinə verildi. 1925-ci ildə texnikumun nəzdində Azərbaycan bölməsi açıldı.' },
    ru: { title: 'Переход в ведение Каспийского пароходства', description: '1 октября 1924 года распоряжением Центрального управления морского транспорта и Народного комиссариата путей сообщения техникум был переименован в «Бакинский техникум водных путей» и передан в ведение отдела просвещения Каспийского морского пароходства. В 1925 году при техникуме открылось азербайджанское отделение.' },
    en: { title: 'Transfer to the Caspian Shipping Company', description: 'On 1 October 1924, by order of the Central Directorate of Maritime Transport and the People\'s Commissariat of Transport, the college was renamed the Baku Waterways Technical College and placed under the education department of the Caspian Shipping Company. An Azerbaijani-language department opened in 1925.' },
  },
  {
    year: 1930,
    era: 'inkisaf',
    sortOrder: 80,
    az: { title: 'Bakı Dənizçilik Texnikumu', description: 'Hökumətin «Sənaye texnikumlarının sahələr üzrə yenidən təşkili haqqında» qərarına əsasən, 1 sentyabr 1930-cu ildə texnikum «Bakı Dənizçilik Texnikumu» adlandırıldı.' },
    ru: { title: 'Бакинский морской техникум', description: 'На основании постановления правительства «О реорганизации промышленных техникумов по отраслям» 1 сентября 1930 года техникум получил название «Бакинский морской техникум».' },
    en: { title: 'The Baku Maritime Technical College', description: 'Following the government decree on the reorganisation of industrial technical colleges by sector, the college was renamed the Baku Maritime Technical College on 1 September 1930.' },
  },
  {
    year: 1933,
    era: 'inkisaf',
    sortOrder: 90,
    az: { title: 'İlk azərbaycanlı direktor', description: '1933-cü ilin oktyabrında 24 yaşlı Güləhmədov Ağa Qasım Kərbəlayı Kazım oğlu — Qasım Gül — texnikuma ilk azərbaycanlı direktor təyin edildi. Onun qəbul etdiyi ilk mühüm qərar texnikumun nəzdində Azərbaycan bölməsinin fəaliyyətinin bərpası oldu.' },
    ru: { title: 'Первый азербайджанский директор', description: 'В октябре 1933 года 24-летний Агa Гасым Кербалаи Кязым оглу Гюльахмедов — Гасым Гюль — стал первым азербайджанским директором техникума. Его первым важным решением стало восстановление работы азербайджанского отделения.' },
    en: { title: 'The first Azerbaijani director', description: 'In October 1933 the 24-year-old Agha Gasym Karbalayi Kazim oglu Gulahmadov — known as Gasym Gul — became the college\'s first Azerbaijani director. His first significant decision was to restore the Azerbaijani-language department.' },
  },
  {
    year: 1944,
    era: 'inkisaf',
    sortOrder: 100,
    az: { title: 'Bakı Dənizçilik Məktəbi', description: 'Azərbaycan SSR Nazirlər Sovetinin qərarı ilə Bakı Dənizçilik Texnikumu «Bakı Dənizçilik Məktəbi» adlandırıldı.' },
    ru: { title: 'Бакинское мореходное училище', description: 'Постановлением Совета Министров Азербайджанской ССР Бакинский морской техникум был переименован в «Бакинское мореходное училище».' },
    en: { title: 'The Baku Maritime School', description: 'By decision of the Council of Ministers of the Azerbaijan SSR, the Baku Maritime Technical College was renamed the Baku Maritime School.' },
  },
  {
    year: 1958,
    era: 'inkisaf',
    sortOrder: 110,
    az: { title: 'Qafur Məmmədovun adı verilir', description: '23 sentyabr 1958-ci ildən məktəb Azərbaycanın cəsur oğlu Qafur Məmmədovun şərəfinə onun adını daşıdı. Məktəb 1996-cı ilə qədər fəaliyyət göstərdi; bu dövrdə ona Ağaisa Mustafayev (1945–1954), Məcid Kardaşov (1954–1973), Məmməd Yaqubov (1973–1991) və Həsən Əliyev (1991–1996) rəhbərlik etdilər.' },
    ru: { title: 'Присвоение имени Гафура Мамедова', description: 'С 23 сентября 1958 года училище носило имя отважного сына Азербайджана Гафура Мамедова. Училище действовало до 1996 года; в этот период им руководили Агаиса Мустафаев (1945–1954), Меджид Кардашов (1954–1973), Мамед Ягубов (1973–1991) и Гасан Алиев (1991–1996).' },
    en: { title: 'Named after Gafur Mammadov', description: 'From 23 September 1958 the school bore the name of Gafur Mammadov, a courageous son of Azerbaijan. It operated until 1996, led in those years by Aghaisa Mustafayev (1945–1954), Majid Kardashov (1954–1973), Mammad Yagubov (1973–1991) and Hasan Aliyev (1991–1996).' },
  },
  {
    year: 1996,
    era: 'muasir',
    sortOrder: 120,
    az: { title: 'Azərbaycan Dövlət Dəniz Akademiyası', description: 'Ümummilli lider Heydər Əliyevin tövsiyəsi və Xəzər Dəniz Gəmiçiliyi İdarəsinin təsisçiliyi ilə, Nazirlər Kabinetinin 15 iyul 1996-cı il tarixli qərarına əsasən Bakı Dəniz Yolları Məktəbinin bazasında Azərbaycan Dövlət Dəniz Akademiyası yaradıldı. Akademiya qarşısına yalnız Xəzər üçün deyil, dünya sularında işləyə biləcək yüksəkixtisaslı kadrlar hazırlamaq məqsədini qoydu.' },
    ru: { title: 'Азербайджанская Государственная Морская Академия', description: 'По рекомендации общенационального лидера Гейдара Алиева и при учредительстве Каспийского морского пароходства, постановлением Кабинета Министров от 15 июля 1996 года на базе Бакинской школы морских путей была создана Азербайджанская Государственная Морская Академия. Академия поставила целью готовить высококвалифицированные кадры не только для Каспия, но и для работы в водах всего мира.' },
    en: { title: 'The Azerbaijan State Marine Academy', description: 'On the recommendation of national leader Heydar Aliyev and with the Caspian Shipping Company as founder, a decision of the Cabinet of Ministers of 15 July 1996 established the Azerbaijan State Marine Academy on the basis of the Baku Maritime School. Its aim was to train crews qualified to work not only in the Caspian but in the world\'s waters.' },
  },
  {
    year: 2000,
    era: 'muasir',
    sortOrder: 130,
    az: { title: 'Diplom «ağ siyahı»da', description: 'Akademiya ilk gündən Beynəlxalq Dənizçilik Təşkilatının (IMO) 1978-ci il tarixli STCW Konvensiyasının tələblərinə uyğun təhsil sistemi qurdu. Hazırlanmış tədris proqramları və dövlət standartları beynəlxalq səviyyədə tanındı: 2000-ci ildə Akademiyanın diplomu 170 ölkə tərəfindən qəbul edilərək dünya dənizçilik ali məktəblərinin «ağ siyahı»sına daxil edildi.' },
    ru: { title: 'Диплом в «белом списке»', description: 'С первого дня Академия выстроила систему обучения по требованиям Конвенции ПДНВ 1978 года Международной морской организации (ИМО). Разработанные учебные программы и государственные стандарты получили международное признание: в 2000 году диплом Академии был принят 170 странами и вошёл в «белый список» морских вузов мира.' },
    en: { title: 'The diploma on the White List', description: 'From its first day the Academy built its programmes around the 1978 STCW Convention of the International Maritime Organization. Its curricula and state standards won international recognition: in 2000 the Academy\'s diploma was accepted by 170 countries and entered the White List of the world\'s maritime universities.' },
  },
  {
    year: 2026,
    era: 'muasir',
    sortOrder: 140,
    az: { title: 'Otuz il və qlobal şəbəkə', description: 'Bu gün Akademiya Beynəlxalq Dənizçilik Universitetləri Assosiasiyasının (IAMU) və digər nüfuzlu universitet birliklərinin üzvüdür. Beynəlxalq fəaliyyət ikitərəfli tərəfdaşlıqları, beynəlxalq proqramlarda iştirakı və əcnəbi tələbələrin cəlbini əhatə edir; Erasmus+ layihələri bu istiqamətdə xüsusi yer tutur.' },
    ru: { title: 'Тридцать лет и глобальная сеть', description: 'Сегодня Академия — член Международной ассоциации морских университетов (IAMU) и других авторитетных университетских объединений. Международная деятельность охватывает двусторонние партнёрства, участие в международных программах и привлечение иностранных студентов; особое место занимают проекты Erasmus+.' },
    en: { title: 'Thirty years and a global network', description: 'Today the Academy is a member of the International Association of Maritime Universities (IAMU) and other respected university bodies. Its international work spans bilateral partnerships, participation in international programmes and the recruitment of international students, with Erasmus+ projects playing a particular role.' },
  },
];

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    const inFlight = new Set<string>();
    (strapi.documents as unknown as { use: (m: unknown) => void }).use(
      async (context: Record<string, unknown>, next: () => Promise<unknown>) => {
        const result = (await next()) as Record<string, unknown> | null;
        const uid = context && (context.uid as string);
        const action = context && (context.action as string);
        if (action !== 'create' && action !== 'update') return result;
        const fields = REL_SYNC[uid];
        if (!fields || !result) return result;
        const documentId = result.documentId as string | undefined;
        if (!documentId) return result;
        const guardKey = uid + '|' + documentId;
        if (inFlight.has(guardKey)) return result;
        inFlight.add(guardKey);
        try {
          const svc = (strapi.documents as unknown as (u: string) => Record<string, (a: unknown) => Promise<Record<string, unknown> | null>>)(uid);
          const azDoc = await svc.findOne({ documentId, locale: SYNC_DEFAULT_LOCALE, status: 'draft', populate: fields } as unknown);
          if (!azDoc) return result;
          const relData: Record<string, unknown> = {};
          for (const f of fields) {
            const v = azDoc[f] as unknown;
            if (Array.isArray(v)) relData[f] = { set: v.map((x: { documentId: string }) => x.documentId) };
            else if (v && typeof v === 'object' && (v as { documentId?: string }).documentId) relData[f] = { set: [(v as { documentId: string }).documentId] };
            else relData[f] = { set: [] };
          }
          const params = (context.params as Record<string, unknown>) || {};
          const writtenLocale = (result.locale as string) || (params.locale as string) || SYNC_DEFAULT_LOCALE;
          const targets: string[] = [];
          if (writtenLocale === SYNC_DEFAULT_LOCALE) {
            const locales = (await (strapi.plugin('i18n').service('locales') as unknown as { find: () => Promise<Array<{ code: string }>> }).find()) || [];
            for (const loc of locales) {
              if (loc.code === SYNC_DEFAULT_LOCALE) continue;
              const exists = await svc.findOne({ documentId, locale: loc.code, status: 'draft' } as unknown);
              if (exists) targets.push(loc.code);
            }
          } else {
            targets.push(writtenLocale);
          }
          for (const loc of targets) {
            await svc.update({ documentId, locale: loc, data: relData } as unknown);
          }
        } catch (e) {
          strapi.log.error('[relSync] ' + (e as Error).message);
        } finally {
          inFlight.delete(guardKey);
        }
        return result;
      }
    );

    // --- F2.6e-3: publish -> Web Push yayimi ---
    // Ayrica middleware: relSync-e toxunmuruq. `publish` action-i deqiq tutulur,
    // lifecycle-lerde "yeni derc olundu"-nu ayird etmek ise kovrekdir.
    // Yayim FIRE-AND-FORGET-dir: push gonderisi publish sorgusunu bloklamamalidir.
    // Idempotentlik push-broadcast.dedupeKey unikal indeksi ile baza seviyyesindedir,
    // ona gore i18n uzre 3 defe publish olsa da bildiris BIR defe gedir.
    const PUSH_UIDS = [
      'api::article.article',
      'api::announcement.announcement',
      'api::event.event',
    ];
    (strapi.documents as unknown as { use: (m: unknown) => void }).use(
      async (context: Record<string, unknown>, next: () => Promise<unknown>) => {
        const result = (await next()) as Record<string, unknown> | null;
        if ((context.action as string) !== 'publish') return result;
        const uid = context.uid as string;
        if (PUSH_UIDS.indexOf(uid) === -1) return result;
        const params = (context.params as Record<string, unknown>) || {};
        const documentId =
          (params.documentId as string) || ((result && (result.documentId as string)) as string) || '';
        if (!documentId) return result;
        try {
          const push = strapi.service('api::push.push') as unknown as {
            broadcast: (u: string, d: string) => Promise<void>;
          };
          void push.broadcast(uid, documentId).catch((e: Error) => {
            strapi.log.error('[push] yayim uğursuz: ' + e.message);
          });
        } catch (e) {
          strapi.log.error('[push] yayim baslatila bilmedi: ' + (e as Error).message);
        }
        return result;
      }
    );
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Lokallar (az/ru/en)
    try {
      const svc = strapi.plugin('i18n').service('locales') as {
        find: () => Promise<Array<{ code: string }>>;
        create: (d: { code: string; name: string }) => Promise<unknown>;
      };
      const codes = new Set(((await svc.find()) || []).map((l) => l.code));
      for (const [code, name] of [['az','Azərbaycan (az)'],['ru','Русский (ru)'],['en','English (en)']] as Array<[string,string]>) {
        if (!codes.has(code)) await svc.create({ code, name });
      }
    } catch (err) {
      strapi.log.warn('[seed] locale ensure skipped: ' + (err as Error).message);
    }

    // Public rol — oxu icazələri (find / findOne)
    try {
      const role = (await strapi.db
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'public' } })) as { id: number } | null;
      if (!role) {
        strapi.log.warn('[seed] public rol tapilmadi, icazeler otuldu.');
      } else {
        const registry = strapi.contentTypes as unknown as Record<string, { kind?: string }>;
        let added = 0;
        for (const uid of PUBLIC_READ_UIDS) {
          const ct = registry[uid];
          if (!ct) {
            strapi.log.warn('[seed] icaze: ' + uid + ' registrde yoxdur, otuldu.');
            continue;
          }
          const actions = ct.kind === 'singleType' ? ['find'] : ['find', 'findOne'];
          for (const a of actions) {
            const action = uid + '.' + a;
            const has = await strapi.db
              .query('plugin::users-permissions.permission')
              .findOne({ where: { action, role: role.id } });
            if (!has) {
              await strapi.db
                .query('plugin::users-permissions.permission')
                .create({ data: { action, role: role.id } });
              added++;
            }
          }
        }
        strapi.log.info('[seed] public oxu icazeleri: ' + added + ' elave olundu.');

        let addedCreate = 0;
        for (const uid of PUBLIC_CREATE_UIDS) {
          if (IDENTITY_ENFORCE && IDENTITY_GATED_UIDS.indexOf(uid) !== -1) continue;
          const ct = registry[uid];
          if (!ct) {
            strapi.log.warn('[seed] create icaze: ' + uid + ' registrde yoxdur, otuldu.');
            continue;
          }
          const action = uid + '.create';
          const has = await strapi.db
            .query('plugin::users-permissions.permission')
            .findOne({ where: { action, role: role.id } });
          if (!has) {
            await strapi.db
              .query('plugin::users-permissions.permission')
              .create({ data: { action, role: role.id } });
            addedCreate++;
          }
        }
        strapi.log.info('[seed] public create icazeleri: ' + addedCreate + ' elave olundu.');

        // F2.6e — sert rejimde kimlik-qapili tiplerin public create icazesini LEGV et.
        // Strapi 5-de icaze qeydinin MOVCUDLUGU = icaze verilmis demekdir,
        // ona gore geri alma = qeydin silinmesi. Idempotentdir.
        if (IDENTITY_ENFORCE) {
          let revoked = 0;
          for (const uid of IDENTITY_GATED_UIDS) {
            const rows = (await strapi.db
              .query('plugin::users-permissions.permission')
              .findMany({ where: { action: uid + '.create', role: role.id } })) as Array<{ id: number }>;
            for (const r of rows) {
              await strapi.db.query('plugin::users-permissions.permission').delete({ where: { id: r.id } });
              revoked++;
            }
          }
          strapi.log.info('[seed] F2.6e sert kimlik rejimi AKTIV — public create legv: ' + revoked);
        } else {
          strapi.log.warn('[seed] F2.6e sert kimlik rejimi SONDURULU (IDENTITY_ENFORCE!=true) — rsvp/correction public create hele aciqdir.');
        }
      }
    } catch (err) {
      strapi.log.error('[seed] public icaze xetasi: ' + (err as Error).message);
    }

    // Backfill — sxem default-u KOHNE setirlere tetbiq olunmur.
    // Olculdu (F2.1): Strapi-nin "default" deyeri yalniz TETBIQ qatindadir.
    // Miqrasiya sutunu nullable elave edir, DB default-u qoymur ve movcud
    // setirleri doldurmur -> F2.1-den evvelki yazilarda visibility=NULL qalir,
    // F2.4 qlobal lenti (visibility=academy) onlari tamamile kesir.
    // Idempotentdir: yalniz IS NULL olan setirlere toxunur.
    try {
      const backfill: Array<{ table: string; column: string; value: unknown }> = [
        { table: 'articles', column: 'visibility', value: 'academy' },
        { table: 'articles', column: 'show_on_home', value: false },
        { table: 'articles', column: 'home_status', value: 'none' },
      ];
      const knex = strapi.db.connection;
      for (const bf of backfill) {
        if (!(await knex.schema.hasTable(bf.table))) continue;
        if (!(await knex.schema.hasColumn(bf.table, bf.column))) continue;
        const n = await knex(bf.table).whereNull(bf.column).update({ [bf.column]: bf.value });
        if (n > 0) {
          strapi.log.info('[seed] backfill ' + bf.table + '.' + bf.column + ' -> ' + n + ' setir');
        }
      }
    } catch (err) {
      strapi.log.error('[seed] backfill xetasi: ' + (err as Error).message);
    }

    // F2.6e — reaction.fingerprint backfill (F2.1-in oyrenilmis dersi: sxem
    // `unique` movcud setirleri DOLDURMUR; NULL qalan setirler dedupe-dan kenarda
    // qalar). Once kohne dublikatlar temizlenir, sonra barmaq izleri yazilir.
    // Idempotentdir: yalniz fingerprint IS NULL olan setirlere toxunur.
    try {
      const knex = strapi.db.connection;
      if ((await knex.schema.hasTable('reactions')) && (await knex.schema.hasColumn('reactions', 'fingerprint'))) {
        const rows = (await knex('reactions')
          .whereNull('fingerprint')
          .select('id', 'target_type', 'target_slug', 'emoji', 'session_id')) as Array<{
          id: number;
          target_type: string | null;
          target_slug: string | null;
          emoji: string | null;
          session_id: string | null;
        }>;
        const seen = new Set<string>();
        const dupes: number[] = [];
        let filled = 0;
        for (const r of rows) {
          const fp = createHash('sha256')
            .update([r.target_type || '', r.target_slug || '', r.emoji || '', r.session_id || ''].join('|'), 'utf8')
            .digest('hex');
          if (seen.has(fp)) {
            dupes.push(r.id);
            continue;
          }
          seen.add(fp);
          await knex('reactions').where({ id: r.id }).update({ fingerprint: fp });
          filled++;
        }
        if (dupes.length) await knex('reactions').whereIn('id', dupes).del();
        if (filled || dupes.length) {
          strapi.log.info('[seed] reaction fingerprint backfill: ' + filled + ' dolduruldu, ' + dupes.length + ' dublikat silindi.');
        }
      }
    } catch (err) {
      strapi.log.error('[seed] fingerprint backfill xetasi: ' + (err as Error).message);
    }

    // F2.6e — vaxti kecmis kimlik tokenlerini temizle (token expiry gigiyenasi).
    try {
      const pruned = await (
        strapi.service('api::identity.identity') as unknown as { prune: () => Promise<number> }
      ).prune();
      if (pruned) strapi.log.info('[seed] kohne kimlik tokenleri silindi: ' + pruned);
    } catch (err) {
      strapi.log.warn('[seed] token prune otuldu: ' + (err as Error).message);
    }

    // Menyu — boşdursa doldur
    try {
      const uid = 'api::menu.menu';
      const existing = (await strapi.documents(uid).findFirst({
        locale: 'az',
        populate: { esasMenyu: true },
      })) as { documentId: string; esasMenyu?: unknown[] } | null;
      const hasData = !!existing && Array.isArray(existing.esasMenyu) && existing.esasMenyu.length > 0;
      // K26: menyu ARTIQ doludur (180 bend), ona gore `!hasData` qapisi
      // yeni SEED-i PROD-a hec vaxt buraxmazdi -- klassik sessiz ugursuzluq.
      // MENU_RESEED=true bir defelik uzerine yazmaga icaze verir.
      // NIYE avtomatik deyil: her boot-da uzerine yazsaq, admin panelde edilen
      // elle duzelisler itardi. Sira: (1) bu commit deploy olunur,
      // (2) Render-de MENU_RESEED=true qoyulur, (3) log yoxlanilir, (4) silinir.
      const force = process.env.MENU_RESEED === 'true';
      if (!hasData || force) {
        if (existing) {
          await strapi.documents(uid).update({ documentId: existing.documentId, data: SEED as never, locale: 'az' });
        } else {
          await strapi.documents(uid).create({ data: SEED as never, locale: 'az' });
        }
        strapi.log.info('[seed] Menyu yazildi' + (force ? ' (MENU_RESEED=true -- uzerine yazildi).' : ' (bos idi).'));
      } else {
        strapi.log.info('[seed] Menyu artiq doludur, otulur. Yenilemek ucun MENU_RESEED=true.');
      }
    } catch (err) {
      strapi.log.error('[seed] menu xetasi: ' + (err as Error).message);
    }

    // Tarix marşrutu — 1867–2026
    //
    // `year` təbii açardır. Mərhələ mövcuddursa toxunulmur.
    // MILESTONE_RESEED=true bütün mərhələləri SİLİB yenidən yazır: köhnə
    // skelet nöqtələr (1960, 2020 kimi) yeni siyahıda yoxdur və üzərinə
    // yazmaqla təmizlənmirdi. Skelet mətnləri onsuz da yer tutucu idi.
    try {
      const uid = 'api::milestone.milestone';
      const force = process.env.MILESTONE_RESEED === 'true';
      const existing = (await strapi.documents(uid).findMany({
        locale: 'az',
        fields: ['year'],
        limit: 200,
      })) as unknown as Array<{ documentId: string; year: number }>;

      if (existing.length && !force) {
        strapi.log.info(
          '[seed] Merhele: ' + existing.length + ' movcuddur, otulur. Yenilemek ucun MILESTONE_RESEED=true.',
        );
      } else {
        for (const e of existing) {
          await strapi.documents(uid).delete({ documentId: e.documentId });
        }

        for (const m of MILESTONE_SEED) {
          const shared = { year: m.year, era: m.era, sortOrder: m.sortOrder };
          const doc = await strapi.documents(uid).create({
            locale: 'az',
            data: { ...shared, ...m.az } as never,
          });
          // ru/en lokalizasiyaları — bunlar olmasa hemin dillerde sehife bos qalir
          for (const loc of ['ru', 'en'] as const) {
            await strapi.documents(uid).update({
              documentId: doc.documentId,
              locale: loc,
              data: { ...shared, ...m[loc] } as never,
            });
          }
        }
        strapi.log.info(
          '[seed] Merhele marsrutu: ' + existing.length + ' silindi, ' +
            MILESTONE_SEED.length + ' x 3 dil yazildi.',
        );
      }
    } catch (err) {
      strapi.log.error('[seed] merhele xetasi: ' + (err as Error).message);
    }

    // Sabiq rektorlar — /sabiq-rektorlar səhifəsinin mənbəyi
    //
    // `slug` uyğunluq açarıdır. Qeyd MÖVCUDDURSA toxunulmur — əks halda
    // editorun admin-dəki düzəlişləri hər deploy-da geri qayıdardı.
    // RECTOR_RESEED=true bir dəfəlik üzərinə yazır (MENU_RESEED ilə eyni
    // rəqs: qoy → deploy → logu yoxla → SİL).
    try {
      const uid = 'api::rector.rector';
      const force = process.env.RECTOR_RESEED === 'true';

      // locale AÇIQ verilir: defolt lokal `en`-dir, `az` yazılmasa
      // ingilis qeydlərinə baxardıq və hər dəfə təkrar yaradılardı.
      const existing = (await strapi.documents(uid).findMany({
        locale: 'az',
        fields: ['slug'],
        limit: 200,
      })) as unknown as Array<{ documentId: string; slug: string }>;
      const bySlug = new Map(existing.map((e) => [e.slug, e.documentId]));

      let created = 0;
      let rewritten = 0;
      for (const r of RECTOR_SEED) {
        // lokallaşdırılmayan sahələr hər dildə eyni göndərilir
        const shared = {
          slug: r.slug,
          termFrom: r.termFrom,
          termTo: r.termTo,
          died: r.died,
          sortOrder: r.sortOrder,
        };
        const known = bySlug.get(r.slug);
        if (!known) {
          const doc = await strapi.documents(uid).create({
            data: { ...shared, ...r.az } as never,
            locale: 'az',
          });
          for (const loc of ['ru', 'en'] as const) {
            await strapi.documents(uid).update({
              documentId: doc.documentId,
              locale: loc,
              data: { ...shared, ...r[loc] } as never,
            });
          }
          created++;
        } else if (force) {
          for (const loc of ['az', 'ru', 'en'] as const) {
            await strapi.documents(uid).update({
              documentId: known,
              locale: loc,
              data: { ...shared, ...r[loc] } as never,
            });
          }
          rewritten++;
        }
      }
      strapi.log.info(
        '[seed] Sabiq rektor: ' + created + ' yaradildi, ' + rewritten + ' uzerine yazildi' +
          (force ? ' (RECTOR_RESEED=true).' : '. Yenilemek ucun RECTOR_RESEED=true.'),
      );
    } catch (err) {
      strapi.log.error('[seed] rektor xetasi: ' + (err as Error).message);
    }

    // Sosial blok — boşdursa doldur (mətn onsuz da yazılmışdı, kodda idi)
    //
    // Paylaşım kartları SEED OLUNMUR: onlar real sosial hesab linkləri və
    // real şəkillərdir, uydurmaq olmaz. Kart əlavə olunana qədər bölmə ana
    // səhifədə render olunmur — boş karusel göstərməkdənsə gizlətmək düzdür.
    try {
      const uid = 'api::social-block.social-block';
      const force = process.env.SOCIAL_RESEED === 'true';
      let wrote = 0;
      for (const loc of ['az', 'ru', 'en'] as const) {
        const existing = (await strapi.documents(uid).findFirst({ locale: loc })) as
          | { documentId: string; title?: string | null }
          | null;
        const hasData = !!existing && !!existing.title;
        if (hasData && !force) continue;
        const data = { ...SOCIAL_BLOCK_SEED.shared, ...SOCIAL_BLOCK_SEED[loc] };
        if (existing) {
          await strapi.documents(uid).update({ documentId: existing.documentId, locale: loc, data: data as never });
        } else {
          await strapi.documents(uid).create({ locale: loc, data: data as never });
        }
        wrote++;
      }
      strapi.log.info(
        '[seed] Sosial blok: ' + wrote + ' dil yazildi' +
          (force ? ' (SOCIAL_RESEED=true).' : '. Yenilemek ucun SOCIAL_RESEED=true.'),
      );
    } catch (err) {
      strapi.log.error('[seed] sosial blok xetasi: ' + (err as Error).message);
    }
    // Səhifə bölünməsi — «ADDA dünən və bu gün»dən ayrılan mövzular
    //
    // `slug` uyğunluq açarıdır. Səhifə MÖVCUDDURSA toxunulmur — redaktorun
    // admin-dəki düzəlişləri hər deploy-da geri qayıtmasın deyə.
    // PAGES_RESEED=true bir dəfəlik üzərinə yazır. Mövcud
    // `adda-dunen-ve-bugun` səhifəsi məhz bu bayraqla yenilənir.
    try {
      const uid = 'api::page.page';
      const force = process.env.PAGES_RESEED === 'true';
      let created = 0;
      let rewritten = 0;
      let skipped = 0;

      for (const p of PAGE_SPLIT_SEED) {
        // locale AÇIQ verilir: defolt lokal `en`-dir, `az` yazılmasa
        // ingilis qeydlərinə baxardıq.
        const existing = (await strapi.documents(uid).findFirst({
          locale: 'az',
          filters: { slug: p.slug },
          status: 'draft',
        })) as { documentId: string } | null;

        if (existing && !force) {
          skipped++;
          continue;
        }

        let documentId: string;
        if (existing) {
          documentId = existing.documentId;
          await strapi.documents(uid).update({
            documentId,
            locale: 'az',
            data: { slug: p.slug, title: p.az.title, body: p.az.body } as never,
          });
          rewritten++;
        } else {
          const doc = await strapi.documents(uid).create({
            locale: 'az',
            data: { slug: p.slug, title: p.az.title, body: p.az.body } as never,
          });
          documentId = doc.documentId;
          created++;
        }

        for (const loc of ['ru', 'en'] as const) {
          await strapi.documents(uid).update({
            documentId,
            locale: loc,
            data: { slug: p.slug, title: p[loc].title, body: p[loc].body } as never,
          });
        }

        // draftAndPublish=true → publish AÇIQ çağırılmalıdır, əks halda
        // səhifə admin-də görünür, saytda görünmür.
        for (const loc of ['az', 'ru', 'en'] as const) {
          await strapi.documents(uid).publish({ documentId, locale: loc });
        }
      }

      strapi.log.info(
        '[seed] Sehife bolunmesi: ' + created + ' yaradildi, ' + rewritten +
          ' uzerine yazildi, ' + skipped + ' otuldu' +
          (force ? ' (PAGES_RESEED=true).' : '. Yenilemek ucun PAGES_RESEED=true.'),
      );
    } catch (err) {
      strapi.log.error('[seed] sehife bolunmesi xetasi: ' + (err as Error).message);
    }

  },
};
