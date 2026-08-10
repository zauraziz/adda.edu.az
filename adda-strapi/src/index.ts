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
                "url": "/hazirlanir/reqemler-ve-faktlar"
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
                "url": "/hazirlanir/keyfiyyetin-monitorinqi"
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
                "url": "/hazirlanir/binalar-ve-infrastruktur"
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
                "url": "/hazirlanir/tedris-gemisi"
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
                "url": "/hazirlanir/reqemler-ve-faktlar"
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
                "url": "/hazirlanir/sosial-teminat-ve-maddi-yardim"
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
                "url": "/hazirlanir/akademik-terefdaslar"
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
                "url": "/hazirlanir/mezunlarin-isle-teminati"
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

    // Mərhələ (milestone) — 144 illik marşrut skeleti (boşdursa)
    // QEYD: bunlar redaktə üçün SKELET nöqtələrdir. Təsis ili mübahisəsi
    // (1881 vs 1996) həll edilməmiş məzmun məsələsidir — editorlar dəqiqləşdirir.
    try {
      const uid = 'api::milestone.milestone';
      const first = await strapi.documents(uid).findFirst({ locale: 'az' });
      if (!first) {
        const seeds: Array<{ year: number; era: string; sortOrder: number; title: string; description: string }> = [
          { year: 1881, era: 'temel', sortOrder: 10, title: 'Dəniz təhsilinin ilk təməlləri', description: 'Xəzər regionunda peşəkar dəniz təhsilinin erkən mərhələsi.' },
          { year: 1920, era: 'inkisaf', sortOrder: 20, title: 'İnstitusional formalaşma', description: 'Təhsil strukturunun institusional əsasda qurulması.' },
          { year: 1960, era: 'inkisaf', sortOrder: 30, title: 'Genişlənmə dövrü', description: 'İxtisasların və tədris bazasının genişlənməsi.' },
          { year: 1996, era: 'muasir', sortOrder: 40, title: 'Müasir akademiya statusu', description: 'Müstəqillik dövründə akademiyanın yenidən təşkili.' },
          { year: 2020, era: 'muasir', sortOrder: 50, title: 'Rəqəmsal transformasiya', description: 'Rəqəmsal tədris və beynəlxalq inteqrasiya istiqamətləri.' },
        ];
        for (const s of seeds) {
          await strapi.documents(uid).create({
            data: { year: s.year, era: s.era, sortOrder: s.sortOrder, title: s.title, description: s.description } as never,
            locale: 'az',
          });
        }
        strapi.log.info('[seed] Merhele skeleti yaradildi: ' + seeds.length + ' nogte (az).');
      } else {
        strapi.log.info('[seed] Merhele artiq movcuddur, otulur.');
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
  },
};
