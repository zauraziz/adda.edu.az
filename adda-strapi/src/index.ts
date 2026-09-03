import { createHash } from 'node:crypto';
import path from 'node:path';
import { readFileSync } from 'node:fs';
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
                "url": "/rehberlik"
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
                "url": "/struktur/telim-tedris-merkezi"
              },
              {
                "label": "Tədris gəmisi",
                "url": "/sehife/tedris-gemisi"
              },
              {
                "label": "Kollec",
                "url": "/struktur/azerbaycan-denizcilik-kolleci-phs"
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
                "url": "/struktur/muhasibat-ucotu-ve-hesabati-sobesi"
              },
              {
                "label": "Personalın idarə edilməsi şöbəsi",
                "url": "/struktur/personalin-idareedilmesi-emek-haqqi-ve-karguzarliq-sobesi"
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
            "url": "/rehberlik"
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
  'api::article.article': ['faculty', 'person', 'tags', 'unit'],
  'api::announcement.announcement': ['faculty', 'person', 'tags', 'unit'],
  'api::event.event': ['faculty', 'person', 'tags'],
  'api::program.program': ['faculty', 'unit', 'documents'],
  'api::department.department': ['faculty', 'head'],
  'api::faculty.faculty': ['dean'],
  'api::unit.unit': ['head', 'parent', 'documents'],
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


// ── K35 · Rəhbərlik səhifələri ──
// Rektor vəzifəsi vakantdır; icraçı tədris üzrə prorektordur.
// Elmi Şura tərkibi yeniləndi: sədr dəyişdi, ayrılan əməkdaş çıxarıldı.
// `page` draftAndPublish=true → publish() AÇIQ çağırılır.
interface LeadText { title: string; body: string }
interface LeadSeed { slug: string; az: LeadText; ru: LeadText; en: LeadText }

const LEADERSHIP_SEED: LeadSeed[] = [
  {
    slug: 'rektor',
    az: { title: 'Rektor', body: '**Hazırda Azərbaycan Dövlət Dəniz Akademiyasının rektoru vəzifəsi vakantdır.**\n\nRektor vəzifəsi üzrə əmək funksiyalarının icrasını müvəqqəti olaraq tədrisin təşkili və idarəedilməsi üzrə prorektor həyata keçirir.\n\n> ### [İradə Süleymanova](/emekdas/irade-suleymanova)\n> Tədrisin təşkili və idarəedilməsi üzrə prorektor\n> Rektor vəzifəsinin icrasını müvəqqəti həyata keçirən\n\nVəzifəyə təyinat Azərbaycan Respublikası Prezidentinin sərəncamı ilə həyata keçirilir. Təyinat baş verdikdə bu səhifə yenilənəcək.\n\n## Əlaqəli səhifələr\n\n- [Elmi Şura](/sehife/elmi-sura) — sədr eyni şəxsdir\n- [Təşkilati struktur](/struktur)\n- [Ümumi işlər üzrə prorektor](/sehife/umumi-isler-uzre-prorektor)\n- [Sabiq rektorlarımız](/sabiq-rektorlar)\n- [İnzibati heyət](/heyet/inzibati)' },
    ru: { title: 'Ректор', body: '**В настоящее время должность ректора Азербайджанской Государственной Морской Академии вакантна.**\n\nОбязанности ректора временно исполняет проректор по организации и управлению учебным процессом.\n\n> ### [Ирада Сулейманова](/emekdas/irade-suleymanova)\n> Проректор по организации и управлению учебным процессом\n> Временно исполняющая обязанности ректора\n\nНазначение на должность осуществляется распоряжением Президента Азербайджанской Республики. Страница будет обновлена после назначения.\n\n## Связанные страницы\n\n- [Учёный совет](/sehife/elmi-sura) — председателем является то же лицо\n- [Организационная структура](/struktur)\n- [Проректор по общим вопросам](/sehife/umumi-isler-uzre-prorektor)\n- [Бывшие ректоры](/sabiq-rektorlar)\n- [Административный персонал](/heyet/inzibati)' },
    en: { title: 'Rector', body: '**The post of Rector of the Azerbaijan State Marine Academy is currently vacant.**\n\nThe duties of the Rector are temporarily discharged by the Vice-Rector for Academic Organisation and Management.\n\n> ### [Irada Suleymanova](/emekdas/irade-suleymanova)\n> Vice-Rector for Academic Organisation and Management\n> Acting Rector\n\nAppointment to the post is made by order of the President of the Republic of Azerbaijan. This page will be updated once an appointment is made.\n\n## Related pages\n\n- [Academic Council](/sehife/elmi-sura) — chaired by the same person\n- [Organisational structure](/struktur)\n- [Vice-Rector for General Affairs](/sehife/umumi-isler-uzre-prorektor)\n- [Former rectors](/sabiq-rektorlar)\n- [Administrative staff](/heyet/inzibati)' },
  },
  {
    slug: 'elmi-sura',
    az: { title: 'Elmi Şura', body: '**«Azərbaycan Dövlət Dəniz Akademiyası» Publik Hüquqi Şəxsinə ümumi rəhbərlik Elmi Şura tərəfindən həyata keçirilir.**\n\nŞuranın tərkibi Təhsil Nazirliyinin 10 noyabr 1997-ci il tarixli 792 nömrəli «Ali təhsil müəssisəsinin Elmi Şurası haqqında Əsasnamə»yə və «Azərbaycan Xəzər Dəniz Gəmiçiliyi» QSC-nin 6 dekabr 2023-cü il tarixli 13-3/2-4641/2023 nömrəli məktubuna əsasən təsdiq edilib.\n\n## Sədr\n\n> ### [İradə Süleymanova](/emekdas/irade-suleymanova)\n> Tədrisin təşkili və idarəedilməsi üzrə prorektor, rektor vəzifəsinin icrasını müvəqqəti həyata keçirən\n\n## Üzvlər\n\n| Ad | Vəzifə |\n|---|---|\n| [Almaz Yaqub qızı İmanova](/emekdas/imanova-almaz-yaqub-qizi) | Elmi katib |\n| [Elnur Oruc oğlu Abbasov](/emekdas/abbasov-elnur-oruc-oglu) | «Gəmi sürücülüyü» fakültəsinin dekanı |\n| [Rafiq Xəlil oğlu Əsgərov](/emekdas/esgerov-rafiq-xelil-oglu) | «Gəmi mexanikası və elektromexanikası» fakültəsinin dekanı |\n| Emil Məmmədniyaz oğlu Manafov | Təlim Tədris Mərkəzinin direktoru |\n| [Əsədullah Mahmud oğlu Süleymanov](/emekdas/suleymanov-esedullah-mahmud-oglu) | Tədris prosesinin təşkili şöbəsinin müdiri |\n| Həzi Nəbi oğlu Nəbiyev | «Dəniz naviqasiyası» kafedrasının müdiri |\n| Akif Şəmil oğlu İsmayılov | «Gəmi energetik qurğuları» kafedrasının müdiri |\n| Elşən Fəxrəddin oğlu Sultanov | «Gəmi elektroavtomatikası» kafedrasının müdiri |\n| İsaq Abuzər oğlu Xankişiyev | «Gəmiqayırma və gəmi təmiri» kafedrasının müdiri |\n| [İsmayıl Hüseyn oğlu Dünyamalıyev](/emekdas/dunyamaliyev-ismayil-huseyn-oglu) | Həmkarlar təşkilatının sədri |\n| Rüslan Ramiz oğlu Əlicanov | Tələbə Elmi Cəmiyyətinin sədri |\n| Fuad Aqil oğlu Rəşidli | Tələbə Həmkarlar İttifaqı Komitəsinin sədri, 054İ qrup tələbəsi |\n\n## Səlahiyyətlər\n\nElmi Şura:\n\n- ADDA-nın Nizamnaməsini qəbul edir, ona əlavə və dəyişikliklər üçün təkliflər verir;\n- İnkişaf Proqramını təsdiq edir, inkişafın əsas istiqamətlərini, tədris və elmi fəaliyyət məsələlərini, beynəlxalq əlaqələri həll edir;\n- Tələbə, müəllim, əməkdaş, doktorant və dinləyicilər üçün daxili intizam qaydalarını təsdiq edir;\n- Əsasnamə, təlimat və digər normativ sənədləri təsdiq edir;\n- Hər il rektorun fəaliyyət hesabatını və maliyyə hesabatını dinləyir;\n- Mütəxəssis və elmi-pedaqoji kadr hazırlığı, əlavə təhsil, təlim-tərbiyə və elmi-tədqiqat məsələlərini həll edir;\n- Komissiyalar yaradır, hesabatlarını dinləyir və qərar qəbul edir;\n- Şura üzvləri arasından elmi katib seçir;\n- Fakültə, kafedra və digər struktur bölmələrin yaradılması, ləğvi və yenidən təşkili məsələlərini həll edir;\n- Fakültələrin tədris, elmi-tədqiqat və tərbiyə işləri barədə hesabatlarını dinləyir;\n- «Professor» və «dosent» elmi adlarının verilməsi üçün Ali Attestasiya Komissiyası qarşısında vəsatət qaldırır;\n- Əməkdaşları fəxri ad, mükafat, orden və medallara təqdim edir;\n- Tədris planlarını təsdiq edir.\n\n## İş qaydası\n\n| Məsələ | Qayda |\n|---|---|\n| Səlahiyyət müddəti | 3 il |\n| İclasların tezliyi | ayda ən azı bir dəfə |\n| Yetərsay | üzvlərin ən azı 2/3 hissəsi |\n| Qərar qəbulu | iştirakçıların 50%-dən çoxunun səsi |\n| Səsvermə | açıq; elmi ad və fəxri adlar üzrə gizli |\n| Qüvvəyə minmə | rektorun təsdiqindən sonra |\n\nŞura təsdiqlənmiş iş planı əsasında fəaliyyət göstərir. İclaslar protokollaşdırılır, sədr və katib tərəfindən imzalanır və elmi katibdə saxlanılır. Sədr qərarların icrasının müntəzəm yoxlanılmasını təşkil edir.\n\nŞuranın vaxtından əvvəl yenidən yaradılması üzvlərin ən azı 2/3 hissəsinin tələbi ilə mümkündür. Qərarın obyektiv olmadığı və ya qanunvericiliyə zidd olduğu müəyyənləşdikdə, qərar «Azərbaycan Xəzər Dəniz Gəmiçiliyi» QSC və Elm və Təhsil Nazirliyi tərəfindən ləğv oluna bilər.' },
    ru: { title: 'Учёный совет', body: '**Общее руководство публично-правовым лицом «Азербайджанская Государственная Морская Академия» осуществляет Учёный совет.**\n\nСостав Совета утверждён в соответствии с «Положением об Учёном совете высшего учебного заведения» Министерства образования № 792 от 10 ноября 1997 года и письмом ЗАО «Азербайджанское Каспийское Морское Пароходство» № 13-3/2-4641/2023 от 6 декабря 2023 года.\n\n## Председатель\n\n> ### [Ирада Сулейманова](/emekdas/irade-suleymanova)\n> Проректор по организации и управлению учебным процессом, временно исполняющая обязанности ректора\n\n## Члены\n\n| Ф.И.О. | Должность |\n|---|---|\n| [Алмаз Ягуб кызы Иманова](/emekdas/imanova-almaz-yaqub-qizi) | Учёный секретарь |\n| [Эльнур Оруджоглу Аббасов](/emekdas/abbasov-elnur-oruc-oglu) | Декан факультета судовождения |\n| [Рафиг Халил оглу Аскеров](/emekdas/esgerov-rafiq-xelil-oglu) | Декан факультета судовой механики и электромеханики |\n| Эмиль Мамеднияз оглу Манафов | Директор Учебно-тренировочного центра |\n| [Асадулла Махмуд оглу Сулейманов](/emekdas/suleymanov-esedullah-mahmud-oglu) | Начальник отдела организации учебного процесса |\n| Хази Наби оглу Набиев | Заведующий кафедрой морской навигации |\n| Акиф Шамиль оглу Исмайлов | Заведующий кафедрой судовых энергетических установок |\n| Эльшан Фахреддин оглу Султанов | Заведующий кафедрой судовой электроавтоматики |\n| Исаг Абузар оглу Ханкишиев | Заведующий кафедрой судостроения и судоремонта |\n| [Исмаил Гусейн оглу Дуньямалыев](/emekdas/dunyamaliyev-ismayil-huseyn-oglu) | Председатель профсоюзной организации |\n| Руслан Рамиз оглу Алиджанов | Председатель Студенческого научного общества |\n| Фуад Агиль оглу Рашидли | Председатель Студенческого профсоюзного комитета, студент группы 054И |\n\n## Полномочия\n\nУчёный совет:\n\n- принимает Устав АГМА, вносит предложения о дополнениях и изменениях к нему;\n- утверждает Программу развития, решает вопросы основных направлений развития, учебной и научной деятельности, международных связей;\n- утверждает правила внутреннего распорядка для студентов, преподавателей, сотрудников, докторантов и слушателей;\n- утверждает положения, инструкции и другие нормативные документы;\n- ежегодно заслушивает отчёт ректора о деятельности и финансовый отчёт;\n- решает вопросы подготовки специалистов и научно-педагогических кадров, дополнительного образования, учебно-воспитательной и научно-исследовательской работы;\n- создаёт комиссии, заслушивает их отчёты и принимает решения;\n- избирает учёного секретаря из числа членов Совета;\n- решает вопросы создания, ликвидации и реорганизации факультетов, кафедр и других структурных подразделений;\n- заслушивает отчёты факультетов об учебной, научно-исследовательской и воспитательной работе;\n- ходатайствует перед Высшей аттестационной комиссией о присвоении учёных званий «профессор» и «доцент»;\n- представляет сотрудников к почётным званиям, премиям, орденам и медалям;\n- утверждает учебные планы.\n\n## Порядок работы\n\n| Вопрос | Правило |\n|---|---|\n| Срок полномочий | 3 года |\n| Периодичность заседаний | не реже одного раза в месяц |\n| Кворум | не менее 2/3 членов |\n| Принятие решения | более 50% голосов присутствующих |\n| Голосование | открытое; по учёным и почётным званиям — тайное |\n| Вступление в силу | после утверждения ректором |\n\nСовет действует на основании утверждённого плана работы. Заседания протоколируются, протоколы подписываются председателем и секретарём и хранятся у учёного секретаря. Председатель организует регулярную проверку исполнения решений.\n\nДосрочное переизбрание Совета возможно по требованию не менее 2/3 его членов. Если решение признано необъективным или противоречащим законодательству, оно может быть отменено ЗАО «Азербайджанское Каспийское Морское Пароходство» и Министерством науки и образования.' },
    en: { title: 'Academic Council', body: '**Overall governance of the Azerbaijan State Marine Academy public legal entity is exercised by the Academic Council.**\n\nThe Council\'s composition was approved under the Ministry of Education\'s Regulation on the Academic Council of a Higher Education Institution, No. 792 of 10 November 1997, and letter No. 13-3/2-4641/2023 of 6 December 2023 from the Azerbaijan Caspian Shipping Company.\n\n## Chair\n\n> ### [Irada Suleymanova](/emekdas/irade-suleymanova)\n> Vice-Rector for Academic Organisation and Management, Acting Rector\n\n## Members\n\n| Name | Position |\n|---|---|\n| [Almaz Yagub gizi Imanova](/emekdas/imanova-almaz-yaqub-qizi) | Academic Secretary |\n| [Elnur Oruj oglu Abbasov](/emekdas/abbasov-elnur-oruc-oglu) | Dean of the Faculty of Navigation |\n| [Rafig Khalil oglu Asgarov](/emekdas/esgerov-rafiq-xelil-oglu) | Dean of the Faculty of Marine Engineering and Electrical Engineering |\n| Emil Mammadniyaz oglu Manafov | Director of the Training Centre |\n| [Asadullah Mahmud oglu Suleymanov](/emekdas/suleymanov-esedullah-mahmud-oglu) | Head of the Academic Process Organisation Department |\n| Hazi Nabi oglu Nabiyev | Head of the Marine Navigation Department |\n| Akif Shamil oglu Ismayilov | Head of the Marine Power Plants Department |\n| Elshan Fakhraddin oglu Sultanov | Head of the Marine Electrical Automation Department |\n| Isag Abuzar oglu Khankishiyev | Head of the Shipbuilding and Ship Repair Department |\n| [Ismayil Huseyn oglu Dunyamaliyev](/emekdas/dunyamaliyev-ismayil-huseyn-oglu) | Chair of the Trade Union Organisation |\n| Ruslan Ramiz oglu Alijanov | Chair of the Student Research Society |\n| Fuad Agil oglu Rashidli | Chair of the Student Trade Union Committee, student of group 054I |\n\n## Powers\n\nThe Academic Council:\n\n- adopts the Academy\'s Charter and proposes additions and amendments to it;\n- approves the Development Programme and decides on the principal directions of development, academic and research activity, and international relations;\n- approves internal rules for students, lecturers, staff, doctoral candidates and course participants;\n- approves regulations, instructions and other normative documents;\n- hears the Rector\'s annual activity report and the annual financial report;\n- decides matters of specialist and academic staff training, further education, teaching and research work;\n- establishes commissions, hears their reports and adopts decisions;\n- elects an academic secretary from among its members;\n- decides on the establishment, closure and reorganisation of faculties, departments and other structural units;\n- hears faculty reports on teaching, research and student work;\n- petitions the Higher Attestation Commission for the award of the titles of professor and associate professor;\n- nominates staff for honorary titles, prizes, orders and medals;\n- approves curricula.\n\n## Procedure\n\n| Matter | Rule |\n|---|---|\n| Term of office | 3 years |\n| Frequency of meetings | at least monthly |\n| Quorum | at least two thirds of members |\n| Adoption of decisions | more than 50% of those present |\n| Voting | open; secret for academic and honorary titles |\n| Entry into force | after approval by the Rector |\n\nThe Council works to an approved plan. Meetings are minuted, signed by the chair and the secretary, and kept by the academic secretary. The chair arranges regular checks on the implementation of decisions.\n\nThe Council may be reconstituted early at the request of at least two thirds of its members. Where a decision is found not to be objective or to contravene legislation, it may be annulled by the Azerbaijan Caspian Shipping Company and the Ministry of Science and Education.' },
  },
];


// ── K38 · Struktur ağacı ──
// Təsdiqlənmiş ierarxiya: Elmi Şura → Rektor → prorektorlar → şöbə/fakültə
// → kafedra. Uyğunluq əvvəlcə `slug`, tapılmasa NORMALLAŞDIRILMIŞ AD üzrə
// qurulur — mövcud qeydlər təkrarlanmasın deyə. Tapılmayan yaradılır.
// `unit` draftAndPublish=true → publish() AÇIQ çağırılır.
interface UnitSeed {
  slug: string;
  az: string;
  ru: string;
  en: string;
  parent: string | null;
  sortOrder: number;
}

const UNIT_TREE: UnitSeed[] = [
  { slug: 'elmi-sura', az: 'Elmi Şura', ru: 'Учёный совет', en: 'Academic Council', parent: null, sortOrder: 10 },
  { slug: 'rektor', az: 'Rektor', ru: 'Ректор', en: 'Rector', parent: 'elmi-sura', sortOrder: 10 },
  { slug: 'rektorun-musaviri', az: 'Rektorun müşaviri', ru: 'Советник ректора', en: 'Adviser to the Rector', parent: 'rektor', sortOrder: 10 },
  { slug: 'rektorun-komekcisi', az: 'Rektorun köməkçisi', ru: 'Помощник ректора', en: 'Assistant to the Rector', parent: 'rektor', sortOrder: 20 },
  { slug: 'elmi-katib', az: 'Elmi katib', ru: 'Учёный секретарь', en: 'Academic Secretary', parent: 'rektor', sortOrder: 30 },
  { slug: 'referent', az: 'Referent', ru: 'Референт', en: 'Referent', parent: 'rektor', sortOrder: 40 },
  { slug: 'tedrisin-teskili-ve-idareedilmesi-uzre-prorektorluq', az: 'Tədrisin təşkili və idarəedilməsi üzrə prorektor', ru: 'Проректор по организации и управлению учебным процессом', en: 'Vice-Rector for Academic Organisation and Management', parent: 'rektor', sortOrder: 50 },
  { slug: 'gemi-mexanikasi-ve-elektromexanikasi-fakultesi', az: 'Gəmi mexanikası və elektromexanikası fakültəsi', ru: 'Факультет судовой механики и электромеханики', en: 'Faculty of Marine Engineering and Electrical Engineering', parent: 'tedrisin-teskili-ve-idareedilmesi-uzre-prorektorluq', sortOrder: 10 },
  { slug: 'tetbiqi-mexanika-kafedrasi', az: 'Tətbiqi mexanika kafedrası', ru: 'Кафедра прикладной механики', en: 'Applied Mechanics Department', parent: 'gemi-mexanikasi-ve-elektromexanikasi-fakultesi', sortOrder: 10 },
  { slug: 'gemi-energetik-qurgulari-kafedrasi', az: 'Gəmi energetik qurğuları kafedrası', ru: 'Кафедра судовых энергетических установок', en: 'Marine Power Plants Department', parent: 'gemi-mexanikasi-ve-elektromexanikasi-fakultesi', sortOrder: 20 },
  { slug: 'gemi-elektroavtomatikasi-kafedrasi', az: 'Gəmi elektroavtomatikası kafedrası', ru: 'Кафедра судовой электроавтоматики', en: 'Marine Electrical Automation Department', parent: 'gemi-mexanikasi-ve-elektromexanikasi-fakultesi', sortOrder: 30 },
  { slug: 'gemi-suruculuyu-fakultesi', az: 'Gəmi sürücülüyü fakültəsi', ru: 'Факультет судовождения', en: 'Faculty of Navigation', parent: 'tedrisin-teskili-ve-idareedilmesi-uzre-prorektorluq', sortOrder: 20 },
  { slug: 'deniz-naviqasiyasi-kafedrasi', az: 'Dəniz naviqasiyası kafedrası', ru: 'Кафедра морской навигации', en: 'Marine Navigation Department', parent: 'gemi-suruculuyu-fakultesi', sortOrder: 10 },
  { slug: 'gemiqayirma-ve-gemi-temiri-kafedrasi', az: 'Gəmiqayırma və gəmi təmiri kafedrası', ru: 'Кафедра судостроения и судоремонта', en: 'Shipbuilding and Ship Repair Department', parent: 'gemi-suruculuyu-fakultesi', sortOrder: 20 },
  { slug: 'ingilis-dili-kafedrasi', az: 'İngilis dili kafedrası', ru: 'Кафедра английского языка', en: 'English Language Department', parent: 'gemi-suruculuyu-fakultesi', sortOrder: 30 },
  { slug: 'humanitar-fenler-kafedrasi', az: 'Humanitar fənlər kafedrası', ru: 'Кафедра гуманитарных дисциплин', en: 'Humanities Department', parent: 'gemi-suruculuyu-fakultesi', sortOrder: 40 },
  { slug: 'tedris-proseslerinin-teskili-sobesi', az: 'Tədris proseslərinin təşkili şöbəsi', ru: 'Отдел организации учебного процесса', en: 'Academic Process Organisation Department', parent: 'tedrisin-teskili-ve-idareedilmesi-uzre-prorektorluq', sortOrder: 30 },
  { slug: 'teserrufat-isleri-sobesi', az: 'Təsərrüfat işləri şöbəsi', ru: 'Отдел хозяйственных работ', en: 'Facilities Department', parent: 'tedrisin-teskili-ve-idareedilmesi-uzre-prorektorluq', sortOrder: 40 },
  { slug: 'elmi-isler-ve-beynelxalq-elaqeler-uzre-prorektorluq', az: 'Elmi işlər və beynəlxalq əlaqələr üzrə prorektor', ru: 'Проректор по научной работе и международным связям', en: 'Vice-Rector for Research and International Relations', parent: 'rektor', sortOrder: 60 },
  { slug: 'elmi-tedqiqat-ve-beynelxalq-elaqeler-sobesi', az: 'Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsi', ru: 'Отдел научных исследований и международных связей', en: 'Research and International Relations Department', parent: 'elmi-isler-ve-beynelxalq-elaqeler-uzre-prorektorluq', sortOrder: 10 },
  { slug: 'informasiya-resurs-merkezi', az: 'İnformasiya resurs mərkəzi', ru: 'Информационно-ресурсный центр', en: 'Information Resource Centre', parent: 'elmi-isler-ve-beynelxalq-elaqeler-uzre-prorektorluq', sortOrder: 20 },
  { slug: 'metbee', az: 'Mətbəə', ru: 'Типография', en: 'Printing House', parent: 'elmi-isler-ve-beynelxalq-elaqeler-uzre-prorektorluq', sortOrder: 30 },
  { slug: 'muhasibat-ucotu-ve-hesabati-sobesi', az: 'Mühasibat uçotu və hesabatı şöbəsi', ru: 'Отдел бухгалтерского учёта и отчётности', en: 'Accounting and Reporting Department', parent: 'rektor', sortOrder: 70 },
  { slug: 'huquq-meslehetcisi', az: 'Hüquq məsləhətçisi', ru: 'Юрисконсульт', en: 'Legal Adviser', parent: 'rektor', sortOrder: 80 },
  { slug: 'personalin-idareedilmesi-emek-haqqi-ve-karguzarliq-sobesi', az: 'Personalın idarəedilməsi, əmək haqqı və kargüzarlıq şöbəsi', ru: 'Отдел управления персоналом, оплаты труда и делопроизводства', en: 'HR, Payroll and Records Department', parent: 'rektor', sortOrder: 90 },
  { slug: 'tehsil-innovasiyalari-ve-reqemsal-heller-merkezi', az: 'Təhsil innovasiyaları və rəqəmsal həllər mərkəzi', ru: 'Центр образовательных инноваций и цифровых решений', en: 'Centre for Educational Innovation and Digital Solutions', parent: 'rektor', sortOrder: 100 },
  { slug: 'telim-tedris-merkezi', az: 'Təlim Tədris Mərkəzi', ru: 'Учебно-тренировочный центр', en: 'Training Centre', parent: 'rektor', sortOrder: 110 },
  { slug: 'azerbaycan-denizcilik-kolleci-phs', az: 'Azərbaycan Dənizçilik Kolleci PHŞ', ru: 'Азербайджанский морской колледж ППЛ', en: 'Azerbaijan Maritime College', parent: 'rektor', sortOrder: 120 },
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

      // ── Defolt dil: az ───────────────────────────────────────────────
      //
      // NIYE KRITIKDIR: Strapi `en` ilə gəlir və bura indiyədək toxunulmayıb.
      // Bütün məzmun isə `az`-dadır. Bir content type-da i18n söndürülsə,
      // Strapi-nin öz miqrasiyası (@strapi/core/dist/migrations/i18n.js)
      // belə edir:
      //
      //   deleteMany({ where: { locale: { $ne: defaultLocale } } })
      //
      // Yəni defolt `en` qalarsa, `person` üzərində i18n söndürmək 162
      // əməkdaşın HAMISINI silərdi — heç biri `en`-də deyil.
      //
      // Bu blok həmin mərmini boşaldır. İdempotentdir: artıq `az`-dırsa
      // heç nə etmir.
      try {
        const lsvc = strapi.plugin('i18n').service('locales') as unknown as {
          getDefaultLocale: () => Promise<string>;
          setDefaultLocale: (d: { code: string }) => Promise<unknown>;
        };
        const current = await lsvc.getDefaultLocale();
        if (current === 'az') {
          strapi.log.info('[seed] Defolt dil artiq az.');
        } else {
          await lsvc.setDefaultLocale({ code: 'az' });
          const after = await lsvc.getDefaultLocale();
          if (after === 'az') {
            strapi.log.info('[seed] Defolt dil deyisdirildi: ' + current + ' -> az');
          } else {
            strapi.log.error(
              '[seed] Defolt dil DEYISMEDI: hele de ' + after + '. i18n sondurulmemelidir!',
            );
          }
        }
      } catch (err) {
        strapi.log.error('[seed] defolt dil xetasi: ' + (err as Error).message);
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
    // Rəhbərlik səhifələri — rektor vakansiyası və Elmi Şura tərkibi
    //
    // Bu iki səhifə MÖVCUDDUR, ona görə yalnız LEADERSHIP_RESEED=true ilə
    // yenilənir. Ayrıca bayraq götürülüb ki, PAGES_RESEED bütün səhifələri
    // birdən üzərinə yazmasın — redaktorun digər düzəlişləri qorunsun.
    try {
      const uid = 'api::page.page';
      if (process.env.LEADERSHIP_RESEED !== 'true') {
        strapi.log.info('[seed] Rehberlik sehifeleri otuldu. Yenilemek ucun LEADERSHIP_RESEED=true.');
      } else {
        let n = 0;
        for (const p of LEADERSHIP_SEED) {
          const existing = (await strapi.documents(uid).findFirst({
            locale: 'az',
            filters: { slug: p.slug },
            status: 'draft',
          })) as { documentId: string } | null;

          let documentId: string;
          if (existing) {
            documentId = existing.documentId;
            await strapi.documents(uid).update({
              documentId,
              locale: 'az',
              data: { slug: p.slug, title: p.az.title, body: p.az.body } as never,
            });
          } else {
            const doc = await strapi.documents(uid).create({
              locale: 'az',
              data: { slug: p.slug, title: p.az.title, body: p.az.body } as never,
            });
            documentId = doc.documentId;
          }
          for (const loc of ['ru', 'en'] as const) {
            await strapi.documents(uid).update({
              documentId,
              locale: loc,
              data: { slug: p.slug, title: p[loc].title, body: p[loc].body } as never,
            });
          }
          for (const loc of ['az', 'ru', 'en'] as const) {
            await strapi.documents(uid).publish({ documentId, locale: loc });
          }
          n++;
        }
        strapi.log.info('[seed] Rehberlik sehifeleri: ' + n + ' x 3 dil yazildi (LEADERSHIP_RESEED=true).');
      }
    } catch (err) {
      strapi.log.error('[seed] rehberlik sehifeleri xetasi: ' + (err as Error).message);
    }
    // Struktur ağacı — təsdiqlənmiş ierarxiya
    //
    // UNIT_RESEED=true olmadan İŞLƏMİR: bu blok mövcud bölmələrin valideyn
    // əlaqəsini və sırasını dəyişir, təsadüfən işə düşməməlidir.
    // Heç bir qeyd SİLİNMİR — ağacda olmayanlar yalnız loga yazılır ki,
    // redaktor admin paneldə özü qərar versin.
    try {
      const uid = 'api::unit.unit';
      if (process.env.UNIT_RESEED !== 'true') {
        strapi.log.info('[seed] Struktur agaci otuldu. Qurmaq ucun UNIT_RESEED=true.');
      } else {
        const norm = (s: string) =>
          (s || '').replace(/[«»"“”]/g, '').replace(/\s+/g, ' ').trim().toLocaleLowerCase('az');

        const existing = (await strapi.documents(uid).findMany({
          locale: 'az',
          fields: ['slug', 'name'],
          limit: 500,
          status: 'draft',
        })) as unknown as Array<{ documentId: string; slug: string; name: string }>;

        const bySlug = new Map(existing.map((e) => [e.slug, e]));
        const byName = new Map(existing.map((e) => [norm(e.name), e]));
        const ids = new Map<string, string>(); // seed slug -> documentId
        const matched = new Set<string>();

        // 1-ci keçid: qeydləri tap və ya yarat (valideyn hələ qoyulmur)
        for (const u of UNIT_TREE) {
          const hit = bySlug.get(u.slug) ?? byName.get(norm(u.az));
          if (hit) {
            ids.set(u.slug, hit.documentId);
            matched.add(hit.documentId);
            await strapi.documents(uid).update({
              documentId: hit.documentId,
              locale: 'az',
              data: { name: u.az, sortOrder: u.sortOrder } as never,
            });
          } else {
            const doc = await strapi.documents(uid).create({
              locale: 'az',
              data: { name: u.az, slug: u.slug, sortOrder: u.sortOrder } as never,
            });
            ids.set(u.slug, doc.documentId);
            matched.add(doc.documentId);
          }
        }

        // 2-ci keçid: valideyn əlaqələri (hamısı artıq mövcuddur)
        for (const u of UNIT_TREE) {
          const documentId = ids.get(u.slug) as string;
          const parentId = u.parent ? ids.get(u.parent) : null;
          for (const loc of ['az', 'ru', 'en'] as const) {
            const text = loc === 'az' ? u.az : loc === 'ru' ? u.ru : u.en;
            await strapi.documents(uid).update({
              documentId,
              locale: loc,
              data: {
                name: text,
                slug: u.slug,
                sortOrder: u.sortOrder,
                parent: parentId ?? null,
              } as never,
            });
          }
          for (const loc of ['az', 'ru', 'en'] as const) {
            await strapi.documents(uid).publish({ documentId, locale: loc });
          }
        }

        const extras = existing.filter((e) => !matched.has(e.documentId));
        strapi.log.info(
          '[seed] Struktur agaci: ' + UNIT_TREE.length + ' bolme x 3 dil yazildi.',
        );
        if (extras.length) {
          strapi.log.warn(
            '[seed] Agacda OLMAYAN ' + extras.length + ' bolme qaldi (silinmedi): ' +
              extras.map((e) => e.slug).join(', '),
          );
        }
      }
    } catch (err) {
      strapi.log.error('[seed] struktur agaci xetasi: ' + (err as Error).message);
    }

    // ── Bölmə rəhbərləri (F3.3 / F3.4) ───────────────────────────────────
    //
    // F3.3 23-dən yalnız 1-ini yazdı. Səbəb bilinmir, çünki bir istisna
    // bütün dövrəni dayandırırdı. Bu versiya HƏR bölməni və HƏR dili ayrıca
    // qoruyur — bir uğursuzluq qalanları saxlamır və logda dəqiq görünür.
    //
    // Əlavə: Qocayev Eldar (elmi işlər üzrə prorektor) ştatda var.
    //
    // Təyin olunmayan 3 bölmə (rektor VAKANT, elmi-sura, TTM, Kollec)
    // admin panelindən verilir.
    //
    // HEAD_RESEED=true olmadan İŞLƏMİR.
    try {
      if (process.env.HEAD_RESEED !== 'true') {
        strapi.log.info('[seed] Bolme rehberleri otuldu. Teyin etmek ucun HEAD_RESEED=true.');
      } else {
        const UNIT_HEADS: Record<string, string> = {
          'deniz-naviqasiyasi-kafedrasi': 'nebiyev-hezi-nebi-oglu',
          'elmi-tedqiqat-ve-beynelxalq-elaqeler-sobesi': 'huseynov-nesir-cavansir-oglu',
          'gemi-elektroavtomatikasi-kafedrasi': 'sultanov-elsen-fexreddin-oglu',
          'gemi-energetik-qurgulari-kafedrasi': 'ismayilov-akif-semil-oglu',
          'gemi-mexanikasi-ve-elektromexanikasi-fakultesi': 'esgerov-rafiq-xelil-oglu',
          'gemi-suruculuyu-fakultesi': 'abbasov-elnur-oruc-oglu',
          'gemiqayirma-ve-gemi-temiri-kafedrasi': 'xankisiyev-isaq-abuzer-oglu',
          'humanitar-fenler-kafedrasi': 'abdullayev-ilqar-agammed-oglu',
          'informasiya-resurs-merkezi': 'sadiqov-adil-salman-oglu',
          'ingilis-dili-kafedrasi': 'aliyeva-gulcohre-babaeli-qizi',
          'metbee': 'sadiqova-mehbare-pasa-qizi',
          'muhasibat-ucotu-ve-hesabati-sobesi': 'qasimov-asif-samxelil-oglu',
          'personalin-idareedilmesi-emek-haqqi-ve-karguzarliq-sobesi': 'suleymanova-terane-ismayil-qizi',
          'tedris-proseslerinin-teskili-sobesi': 'suleymanov-esedullah-mahmud-oglu',
          'tehsil-innovasiyalari-ve-reqemsal-heller-merkezi': 'eziz-zaur-vaqif-oglu',
          'teserrufat-isleri-sobesi': 'huseynova-leyla-xanhuseyn-qizi',
          'tetbiqi-mexanika-kafedrasi': 'hesenov-yusif-nadir-oglu',
          'rektorun-musaviri': 'sadiqov-vuqar-boyukaga-oglu',
          'rektorun-komekcisi': 'mirelekberli-eli-mirteyyub-oglu',
          'referent': 'tagiyeva-ilahe-asef-qizi',
          'elmi-katib': 'imanova-almaz-yaqub-qizi',
          'huquq-meslehetcisi': 'imanov-sameddin-mursel-oglu',
          'tedrisin-teskili-ve-idareedilmesi-uzre-prorektorluq': 'irade-suleymanova',
          // Ştatda var, F3.3-də buraxılmışdı — Strapi-də tapılmasa log deyəcək.
          'elmi-isler-ve-beynelxalq-elaqeler-uzre-prorektorluq': 'qocayev-eldar-adigozel-oglu',
        };

        const total = Object.keys(UNIT_HEADS).length;
        let okAz = 0;
        let skipped = 0;
        const failed: string[] = [];

        for (const [unitSlug, personSlug] of Object.entries(UNIT_HEADS)) {
          try {
            // `locale` MÜTLƏQ verilir — Strapi-nin defolt dili `en`.
            const units = await strapi.documents('api::unit.unit').findMany({
              locale: 'az',
              filters: { slug: { $eq: unitSlug } },
              fields: ['slug'],
              limit: 2,
            });
            if (units.length !== 1) {
              failed.push(unitSlug + ': bolme ' + units.length + ' defe tapildi');
              continue;
            }

            const people = await strapi.documents('api::person.person').findMany({
              locale: 'az',
              filters: { slug: { $eq: personSlug } },
              fields: ['slug'],
              limit: 2,
            });
            if (people.length !== 1) {
              failed.push(unitSlug + ': sexs «' + personSlug + '» ' + people.length + ' defe tapildi');
              continue;
            }

            const documentId = String(units[0].documentId);
            const headId = String(people[0].documentId);

            // Artıq HƏR ÜÇ DİLDƏ düzgündürsə toxunma.
            //
            // Yalnız `az`-a baxmaq SƏHVDİR: `person` lokallaşdırılana qədər ru/en
            // yazıları uğursuz olurdu, ona görə az dolu, ru/en boş qala bilər.
            // Belə halda yalnız az-a baxan yoxlama hamısını atlayır və ru/en heç
            // vaxt dolmur.
            const already = await Promise.all(
              (['az', 'ru', 'en'] as const).map(async (loc) => {
                try {
                  const d = (await strapi.documents('api::unit.unit').findOne({
                    documentId,
                    locale: loc,
                    populate: ['head'],
                  })) as unknown as { head?: { documentId?: string } | null } | null;
                  return d?.head?.documentId === headId;
                } catch {
                  return false;
                }
              }),
            );
            if (already.every(Boolean)) {
              skipped++;
              continue;
            }

            // AZ ƏSASDIR. Sayt `az` üzərində qurulur, `REL_SYNC` middleware-i
            // digər dilləri az qaralamasından güzgüləyir. Ona görə `az` ayrıca
            // yazılır və uğursuzluğu ayrıca sayılır — ru/en xətası az-ı
            // aparmamalıdır.
            try {
              await strapi.documents('api::unit.unit').update({
                documentId,
                locale: 'az',
                data: { head: headId } as never,
              });
              // update() YALNIZ qaralamaya yazır.
              await strapi.documents('api::unit.unit').publish({ documentId, locale: 'az' });
              okAz++;
              strapi.log.info('[seed] head az OK: ' + unitSlug + ' -> ' + personSlug);
            } catch (e) {
              failed.push(unitSlug + ' (az): ' + (e as Error).message);
              continue;
            }

            for (const loc of ['ru', 'en'] as const) {
              try {
                await strapi.documents('api::unit.unit').update({
                  documentId,
                  locale: loc,
                  data: { head: headId } as never,
                });
                await strapi.documents('api::unit.unit').publish({ documentId, locale: loc });
              } catch (e) {
                // Dil qeydi yoxdursa və ya güzgüləmə toqquşursa yalnız
                // xəbərdarlıq — az artıq yazılıb.
                strapi.log.warn(
                  '[seed] head ' + loc + ' atlandi: ' + unitSlug + ' — ' + (e as Error).message,
                );
              }
            }
          } catch (e) {
            failed.push(unitSlug + ': ' + (e as Error).message);
          }
        }

        strapi.log.info(
          '[seed] Bolme rehberleri: ' + okAz + '/' + total + ' (az) yazildi, ' +
          skipped + ' artiq duzgun idi.',
        );
        if (failed.length) {
          for (const f of failed) strapi.log.error('[seed] head UGURSUZ — ' + f);
        }
        strapi.log.info(
          '[seed] Elle qalan: rektor (VAKANT), elmi-sura, telim-tedris-merkezi, ' +
            'azerbaycan-denizcilik-kolleci-phs',
        );
      }
    } catch (err) {
      strapi.log.error('[seed] bolme rehberleri xetasi: ' + (err as Error).message);
    }

    // ── Kafedra heyəti (F3.7) ────────────────────────────────────────────
    //
    // Mənbə: kafedra üzrə heyət siyahısı (74 sətir, 7 kafedra).
    // Ştat cədvəlində professor-müəllim heyətinin kafedra bağlantısı YOXDUR
    // — ona görə bu siyahı yeganə mənbədir.
    //
    // Adlardakı üç yazı səhvi mənbədə deyil, burada düzəldilib:
    //   Talıbov Nurməmməd  -> Nurməhəmməd     (ştatda belədir)
    //   Məhərəmmova Qəhraman -> Məhərrəmova Qəhrəman
    //   Alfeedo            -> Alfaheeda
    //
    // «Elmi dərəcə» sütununda 20 fərqli yazılış var idi, hamısı üç enum
    // dəyərinə yığılıb. «elmlər namizədi» ayrıca saxlanılır.
    //
    // ÜSTÜNDƏN YAZMIR: mövcud `unit`, `position`, `academicDegree`,
    // `academicTitle` dəyərlərinə toxunmur — yalnız boş sahələri doldurur.
    // Səbəb: dekan/müdir kimi inzibati vəzifələr kafedra vəzifəsindən
    // üstündür və silinməməlidir.
    //
    // KAFEDRA_RESEED=true olmadan İŞLƏMİR.
    try {
      if (process.env.KAFEDRA_RESEED !== 'true') {
        strapi.log.info('[seed] Kafedra heyeti otuldu. Qurmaq ucun KAFEDRA_RESEED=true.');
      } else {
        // DIRNAQSIZ. F3.10 bölmə adlarından «» işarələrini çıxardı; burada
        // köhnə forma qalsaydı, KAFEDRA_RESEED-in növbəti işləməsi 74 nəfərə
        // yenidən köhnə formatda vəzifə sətri yazıb təmizliyi ləğv edərdi.
        const KAFEDRA_NAMES: Record<string, string> = {
          'tetbiqi-mexanika-kafedrasi': 'Tətbiqi mexanika kafedrası',
          'deniz-naviqasiyasi-kafedrasi': 'Dəniz naviqasiyası kafedrası',
          'gemi-elektroavtomatikasi-kafedrasi': 'Gəmi elektroavtomatikası kafedrası',
          'gemi-energetik-qurgulari-kafedrasi': 'Gəmi energetik qurğuları kafedrası',
          'gemiqayirma-ve-gemi-temiri-kafedrasi': 'Gəmiqayırma və gəmi təmiri kafedrası',
          'humanitar-fenler-kafedrasi': 'Humanitar fənlər kafedrası',
          'ingilis-dili-kafedrasi': 'İngilis dili kafedrası',
        };

        // slug, kafedra, elmi derece, elmi ad, vezife
        const STAFF: Array<[string, string, string | null, string | null, string]> = [
          ['hesenov-yusif-nadir-oglu', 'tetbiqi-mexanika-kafedrasi', 'elmler_doktoru', 'Professor', 'Professor'],
          ['humbeteliyev-rovsen-zulfuqar-oglu', 'tetbiqi-mexanika-kafedrasi', 'elmler_doktoru', null, 'Professor'],
          ['agarzayev-behruz-kerimbala-oglu', 'tetbiqi-mexanika-kafedrasi', 'felsefe_doktoru', null, 'Dosent'],
          ['hesenova-leyla-agamverdi-qizi', 'tetbiqi-mexanika-kafedrasi', 'elmler_namizedi', 'Dosent', 'Dosent'],
          ['eliyeva-irade-kerim-qizi', 'tetbiqi-mexanika-kafedrasi', 'elmler_namizedi', 'Dosent', 'Dosent'],
          ['esgerov-rafiq-xelil-oglu', 'tetbiqi-mexanika-kafedrasi', 'felsefe_doktoru', 'Dosent', 'Dosent'],
          ['imanova-almaz-yaqub-qizi', 'tetbiqi-mexanika-kafedrasi', 'elmler_namizedi', 'Dosent', 'Dosent'],
          ['abdullayeva-aynur-ramiz-qizi', 'tetbiqi-mexanika-kafedrasi', null, null, 'Baş müəllim'],
          ['abdullayeva-nazile-baheddin-qizi', 'tetbiqi-mexanika-kafedrasi', null, null, 'Baş müəllim'],
          ['rustemov-zakir-eliaga-oglu', 'deniz-naviqasiyasi-kafedrasi', null, 'Professor', 'Professor'],
          ['abbasov-elnur-oruc-oglu', 'deniz-naviqasiyasi-kafedrasi', 'felsefe_doktoru', 'Dosent', 'Dosent'],
          ['kelbiyev-ferqan-memmed-oglu', 'deniz-naviqasiyasi-kafedrasi', 'felsefe_doktoru', 'Dosent', 'Dosent'],
          ['sireliyev-ekber-tapdiq-oglu', 'deniz-naviqasiyasi-kafedrasi', null, null, 'Baş müəllim'],
          ['qonaqov-musaim-novruz-oglu', 'deniz-naviqasiyasi-kafedrasi', null, null, 'Baş müəllim'],
          ['rzayev-resid-esref-oglu', 'deniz-naviqasiyasi-kafedrasi', null, null, 'Baş müəllim'],
          ['gozelova-samire-saban-qizi', 'deniz-naviqasiyasi-kafedrasi', null, null, 'Baş müəllim'],
          ['xelilov-asif-hemid-oglu', 'deniz-naviqasiyasi-kafedrasi', null, null, 'Baş müəllim'],
          ['dunyamaliyev-ismayil-huseyn-oglu', 'deniz-naviqasiyasi-kafedrasi', null, null, 'Baş müəllim'],
          ['qafarov-aydin-vaqif-oglu', 'deniz-naviqasiyasi-kafedrasi', null, null, 'Baş müəllim'],
          ['eliyev-rovsen-logman-oglu', 'deniz-naviqasiyasi-kafedrasi', null, null, 'Baş müəllim'],
          ['recebov-polad-ilyas-oglu', 'deniz-naviqasiyasi-kafedrasi', null, null, 'Müəllim'],
          ['xaliqov-rufet-nureli-oglu', 'deniz-naviqasiyasi-kafedrasi', null, null, 'Müəllim'],
          ['sultanov-elsen-fexreddin-oglu', 'gemi-elektroavtomatikasi-kafedrasi', 'felsefe_doktoru', 'Dosent', 'Dosent'],
          ['allahverdiyeva-aynure-tevekkul-qizi', 'gemi-elektroavtomatikasi-kafedrasi', null, null, 'Baş müəllim'],
          ['bayramova-ilhame-pasa-qizi', 'gemi-elektroavtomatikasi-kafedrasi', null, null, 'Baş müəllim'],
          ['memmedov-emil-memmed-oglu', 'gemi-elektroavtomatikasi-kafedrasi', null, null, 'Baş müəllim'],
          ['elicanov-ruslan-ramiz-oglu', 'gemi-elektroavtomatikasi-kafedrasi', null, null, 'Müəllim'],
          ['rzayev-mehemmed-ejder-oglu', 'gemi-energetik-qurgulari-kafedrasi', 'elmler_namizedi', 'Dosent', 'Dosent'],
          ['eliyev-nazim-sedreddin-oglu', 'gemi-energetik-qurgulari-kafedrasi', 'elmler_namizedi', 'Dosent', 'Dosent'],
          ['ismayilov-akif-semil-oglu', 'gemi-energetik-qurgulari-kafedrasi', 'elmler_namizedi', 'Dosent', 'Dosent'],
          ['rehmanov-muqabil-xanoglan-oglu', 'gemi-energetik-qurgulari-kafedrasi', null, null, 'Baş müəllim'],
          ['elekberov-ikram-ismayil-oglu', 'gemi-energetik-qurgulari-kafedrasi', null, null, 'Baş müəllim'],
          ['ismayilov-mehman-hacixelil-oglu', 'gemi-energetik-qurgulari-kafedrasi', null, null, 'Baş müəllim'],
          ['memmedov-salamat-musa-oglu', 'gemi-energetik-qurgulari-kafedrasi', null, null, 'Baş müəllim'],
          ['fatyanova-natalya-vladimirovna', 'gemi-energetik-qurgulari-kafedrasi', 'felsefe_doktoru', null, 'Baş müəllim'],
          ['quliyev-elvan-rza-oglu', 'gemi-energetik-qurgulari-kafedrasi', null, null, 'Baş müəllim'],
          ['axundov-ilham-siyavus-oglu', 'gemi-energetik-qurgulari-kafedrasi', null, null, 'Baş müəllim'],
          ['kerimov-elnur-nadir-oglu', 'gemi-energetik-qurgulari-kafedrasi', null, null, 'Baş müəllim'],
          ['talibov-nurmehemmed-sixmehemmed', 'gemi-energetik-qurgulari-kafedrasi', null, null, 'Baş müəllim'],
          ['heziyev-elihuseyn-rasim-oglu', 'gemi-energetik-qurgulari-kafedrasi', null, null, 'Müəllim'],
          ['eliyev-elivahid-azer-oglu', 'gemi-energetik-qurgulari-kafedrasi', null, null, 'Müəllim'],
          ['ismayilov-nizami-sayi-oglu', 'gemiqayirma-ve-gemi-temiri-kafedrasi', 'elmler_doktoru', 'Professor', 'Professor'],
          ['qafarov-aydin-memis-oglu', 'gemiqayirma-ve-gemi-temiri-kafedrasi', 'elmler_doktoru', 'Professor', 'Professor'],
          ['orucov-fazil-sedi-oglu', 'gemiqayirma-ve-gemi-temiri-kafedrasi', 'felsefe_doktoru', 'Dosent', 'Dosent'],
          ['sadiqov-vuqar-boyukaga-oglu', 'gemiqayirma-ve-gemi-temiri-kafedrasi', 'elmler_namizedi', 'Dosent', 'Dosent'],
          ['xankisiyev-isaq-abuzer-oglu', 'gemiqayirma-ve-gemi-temiri-kafedrasi', 'felsefe_doktoru', 'Dosent', 'Dosent'],
          ['memmedov-elxan-demir-oglu', 'gemiqayirma-ve-gemi-temiri-kafedrasi', 'felsefe_doktoru', 'Dosent', 'Dosent'],
          ['quliyev-yaqub-mikayil-oglu', 'gemiqayirma-ve-gemi-temiri-kafedrasi', null, null, 'Baş müəllim'],
          ['ismayilov-allahverdi-qesem-oglu', 'gemiqayirma-ve-gemi-temiri-kafedrasi', null, null, 'Baş müəllim'],
          ['cabbarov-rovsen-calal-oglu', 'gemiqayirma-ve-gemi-temiri-kafedrasi', null, null, 'Baş müəllim'],
          ['huseynov-resul-erestun-oglu', 'gemiqayirma-ve-gemi-temiri-kafedrasi', null, null, 'Baş müəllim'],
          ['mecnunov-elsen-elman-oglu', 'gemiqayirma-ve-gemi-temiri-kafedrasi', null, null, 'Müəllim'],
          ['huseynov-nesir-cavansir-oglu', 'humanitar-fenler-kafedrasi', 'felsefe_doktoru', 'Professor', 'Professor'],
          ['abdullayev-ilqar-agammed-oglu', 'humanitar-fenler-kafedrasi', 'elmler_namizedi', 'Dosent', 'Dosent'],
          ['suleymanov-esedullah-mahmud-oglu', 'humanitar-fenler-kafedrasi', 'felsefe_doktoru', null, 'Dosent'],
          ['rzayeva-sevinc-rasim-qizi', 'humanitar-fenler-kafedrasi', 'felsefe_doktoru', null, 'Baş müəllim'],
          ['namazova-lamiyye-sexavet-qizi', 'humanitar-fenler-kafedrasi', 'felsefe_doktoru', null, 'Baş müəllim'],
          ['hesimov-elbrus-efrasiyab-oglu', 'humanitar-fenler-kafedrasi', null, null, 'Baş müəllim'],
          ['qasimov-elitaleh-yusif-oglu', 'humanitar-fenler-kafedrasi', null, null, 'Baş müəllim'],
          ['feteliyev-agarza-resul-oglu', 'humanitar-fenler-kafedrasi', null, null, 'Baş müəllim'],
          ['imanov-sameddin-mursel-oglu', 'humanitar-fenler-kafedrasi', null, null, 'Baş müəllim'],
          ['aliyeva-gulcohre-babaeli-qizi', 'ingilis-dili-kafedrasi', 'elmler_doktoru', 'Professor', 'Professor'],
          ['murselova-melahet-memmed-qizi', 'ingilis-dili-kafedrasi', 'felsefe_doktoru', null, 'Dosent'],
          ['besirova-gulnar-rasim-qizi', 'ingilis-dili-kafedrasi', 'felsefe_doktoru', null, 'Dosent'],
          ['ferecova-ramile-misirxan-qizi', 'ingilis-dili-kafedrasi', 'felsefe_doktoru', null, 'Dosent'],
          ['sefizade-irade-nesib-qizi', 'ingilis-dili-kafedrasi', null, null, 'Baş müəllim'],
          ['meherremova-gunay-qehreman-qizi', 'ingilis-dili-kafedrasi', null, null, 'Baş müəllim'],
          ['veliyeva-kemale-saleh-qizi', 'ingilis-dili-kafedrasi', null, null, 'Baş müəllim'],
          ['zeynalov-eldar-atamali-oglu', 'ingilis-dili-kafedrasi', null, null, 'Baş müəllim'],
          ['xelilova-rena-kamil-qizi', 'ingilis-dili-kafedrasi', 'felsefe_doktoru', null, 'Baş müəllim'],
          ['quliyev-orxan-cavansir-oglu', 'ingilis-dili-kafedrasi', null, null, 'Müəllim'],
          ['zeynalova-zuleyxa-hafiz-qizi', 'ingilis-dili-kafedrasi', null, null, 'Müəllim'],
          ['huseynova-esmer-mehman-qizi', 'ingilis-dili-kafedrasi', null, null, 'Müəllim'],
          ['alfaheeda-sevinc-zahid-qizi', 'ingilis-dili-kafedrasi', null, null, 'Müəllim'],
        ];

        const unitCache = new Map<string, string>();
        const getUnit = async (slug: string): Promise<string | null> => {
          if (unitCache.has(slug)) return unitCache.get(slug) as string;
          const u = await strapi.documents('api::unit.unit').findMany({
            locale: 'az',
            filters: { slug: { $eq: slug } },
            fields: ['slug'],
            limit: 2,
          });
          if (u.length !== 1) return null;
          unitCache.set(slug, String(u[0].documentId));
          return String(u[0].documentId);
        };

        let linked = 0, enriched = 0, roleAdded = 0;
        const notFound: string[] = [];

        for (const [slug, unitSlug, degree, title, position] of STAFF) {
          try {
            const found = await strapi.documents('api::person.person').findMany({
              locale: 'az',
              filters: { slug: { $eq: slug } },
              populate: ['unit', 'roles'],
              limit: 2,
            });
            if (found.length !== 1) { notFound.push(slug); continue; }

            const p = found[0] as unknown as {
              documentId: string;
              unit?: { documentId: string } | null;
              position?: string | null;
              academicDegree?: string | null;
              academicTitle?: string | null;
              roles?: Array<{ staffType: string; position: string; unitName?: string | null; sortOrder?: number }>;
            };
            const unitId = await getUnit(unitSlug);
            if (!unitId) { notFound.push(unitSlug + ' (bolme)'); continue; }

            const patch: Record<string, unknown> = {};
            if (!p.unit) { patch.unit = unitId; linked++; }
            if (!p.academicDegree && degree) { patch.academicDegree = degree; enriched++; }
            if (!p.academicTitle && title) patch.academicTitle = title;
            if (!p.position) patch.position = position;

            // roles[]: kafedra vezifesi ayrica setir kimi elave olunur ki,
            // bir adamin hem inzibati, hem kafedra baglantisi gorunsun.
            const kafName = KAFEDRA_NAMES[unitSlug];
            const roles = p.roles ?? [];
            if (!roles.some((r) => (r.unitName ?? '') === kafName)) {
              patch.roles = [
                ...roles.map((r) => ({
                  staffType: r.staffType,
                  position: r.position,
                  unitName: r.unitName ?? null,
                  sortOrder: r.sortOrder ?? 0,
                })),
                { staffType: 'akademik', position, unitName: kafName, sortOrder: roles.length },
              ];
              roleAdded++;
            }

            if (Object.keys(patch).length === 0) continue;
            await strapi.documents('api::person.person').update({
              documentId: p.documentId,
              locale: 'az',
              data: patch as never,
            });
            await strapi.documents('api::person.person').publish({ documentId: p.documentId, locale: 'az' });
          } catch (e) {
            notFound.push(slug + ': ' + (e as Error).message);
          }
        }

        strapi.log.info(
          '[seed] Kafedra heyeti: ' + STAFF.length + ' setir | kafedraya baglandi: ' + linked +
          ' | derece yazildi: ' + enriched + ' | vezife setri elave olundu: ' + roleAdded,
        );
        for (const n of notFound) strapi.log.error('[seed] kafedra UGURSUZ - ' + n);
      }
    } catch (err) {
      strapi.log.error('[seed] kafedra heyeti xetasi: ' + (err as Error).message);
    }

    // ── Dırnaq təmizliyi və təkrar vəzifələrin birləşdirilməsi (F3.10) ───
    //
    // PROBLEM: bölmə adları «Dırnaqlı» formada idi, köhnə heyət idxalı isə
    // dırnaqsız yazmışdı. Nəticədə eyni kafedra iki ayrı ad kimi görünürdü:
    //   «İngilis dili» kafedrası   -> müəllimlər
    //   İngilis dili kafedrası     -> kafedra müdiri
    //
    // HƏLL: dırnaqsız forma kanonik qəbul olunur. 9 bölmənin `az` adı
    // yenilənir, bütün `roles[].unitName` dəyərləri həmin ada gətirilir,
    // eyni bölməyə işarə edən təkrar sətirlər birləşdirilir.
    //
    // Yalnız `az` adları dırnaqlı idi — ru/en toxunulmur.
    //
    // NAME_CLEAN=true olmadan İŞLƏMİR.
    try {
      if (process.env.NAME_CLEAN !== 'true') {
        strapi.log.info('[seed] Dirnaq temizliyi otuldu. Ucun NAME_CLEAN=true.');
      } else {
        // ARXA PLAN. `bootstrap()` bitmədən Strapi portu AÇMIR, ona görə burada
        // görülən hər saniyə saytın əlçatmaz qaldığı saniyədir.
        //
        // `setTimeout` işi növbəyə atır: bootstrap dərhal qayıdır, port açılır,
        // təmizlik sayt işləyərkən davam edir. İş idempotentdir — yarıda
        // kəsilsə növbəti dəfə qaldığı yerdən davam edir.
        strapi.log.info('[seed] Dirnaq temizliyi ARXA PLANDA baslayir - port bloklanmir.');
        setTimeout(() => {
          void (async () => {
        // Azərbaycan dilində kiçik hərf: toLowerCase() tək başına
        // I -> 'i' (doğrusu 'ı'), İ -> 'i̇' (iki kod nöqtəsi) verir.
        const azLower = (s: string) =>
          String(s ?? '').replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
        const fold = (s: string) =>
          azLower(s)
            .replace(/[«»""''"']/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        const strip = (s: string) =>
          String(s ?? '').replace(/[«»""'']/g, '').replace(/\s+/g, ' ').trim();

        // ---- 1. bölmə adları -------------------------------------------
        const units = (await strapi.documents('api::unit.unit').findMany({
          locale: 'az',
          fields: ['name', 'slug'],
          limit: 200,
          status: 'draft',
        })) as unknown as Array<{ documentId: string; name: string; slug: string }>;

        let renamed = 0;
        for (const u of units) {
          const clean = strip(u.name);
          if (clean === u.name) continue;
          await strapi.documents('api::unit.unit').update({
            documentId: u.documentId,
            locale: 'az',
            data: { name: clean } as never,
          });
          await strapi.documents('api::unit.unit').publish({ documentId: u.documentId, locale: 'az' });
          strapi.log.info('[seed] ad temizlendi: ' + u.name + '  ->  ' + clean);
          renamed++;
        }

        // kanonik ad xəritəsi: bükülmüş forma -> təmiz ad
        const canon = new Map<string, string>();
        for (const u of units) canon.set(fold(u.name), strip(u.name));

        // ---- 2. vəzifə sətirləri ---------------------------------------
        // Eyni bölmədə iki sətir qalarsa hansı saxlanılır: inzibati vəzifə
        // akademikdən üstündür. «Kafedra müdiri» qalır, «Professor» düşür —
        // elmi ad onsuz da `academicTitle` sahəsindədir.
        const rank = (position: string): number => {
          const p = azLower(position);
          if (/müavin/.test(p)) return 5;
          if (/müdir|dekan|rəis|direktor|prorektor|rektor|baş mühasib/.test(p)) return 0;
          if (/professor/.test(p)) return 1;
          if (/dosent|dossent/.test(p)) return 2;
          if (/baş müəllim/.test(p)) return 3;
          return 4;
        };

        type Role = { staffType: string; position: string; unitName?: string | null; sortOrder?: number };
        let touched = 0, merged = 0, renamedRoles = 0;

        for (let page = 1; page <= 20; page++) {
          const people = (await strapi.documents('api::person.person').findMany({
            locale: 'az',
            populate: ['roles'],
            fields: ['slug'],
            // SABİT SIRA MƏCBURİDİR. Bu dövrə qeydləri YENİLƏYİR; sıra
            // verilməsə baza sətirləri yenidən düzə bilər və səhifələr
            // arasında sürüşən qeyd HEÇ VAXT emal olunmur. Məhz buna görə
            // bir nəfərdə köhnə «Tətbiqi mexanika» kafedrası dəyəri qalmışdı.
            // `slug` dəyişməyən sahədir — sıralama üçün etibarlıdır.
            sort: 'slug:asc',
            start: (page - 1) * 50,
            limit: 50,
            status: 'draft',
          })) as unknown as Array<{ documentId: string; slug: string; roles?: Role[] }>;
          if (!people.length) break;

          for (const p of people) {
            const roles = p.roles ?? [];
            if (!roles.length) continue;

            // adları kanonik formaya gətir
            let changed = false;
            const fixed = roles.map((r) => {
              const raw = r.unitName ?? '';
              if (!raw) return r;
              const target = canon.get(fold(raw));
              if (target && target !== raw) {
                changed = true;
                renamedRoles++;
                return { ...r, unitName: target };
              }
              return r;
            });

            // eyni bölmədəki təkrarları birləşdir
            const best = new Map<string, Role>();
            const extras: Role[] = [];
            for (const r of fixed) {
              const key = r.unitName ?? '';
              if (!key) { extras.push(r); continue; }
              const cur = best.get(key);
              if (!cur) { best.set(key, r); continue; }
              changed = true;
              merged++;
              if (rank(r.position) < rank(cur.position)) best.set(key, r);
            }

            if (!changed) continue;

            const out = [...best.values(), ...extras].map((r, i) => ({
              staffType: r.staffType,
              position: r.position,
              unitName: r.unitName ?? null,
              sortOrder: i,
            }));

            await strapi.documents('api::person.person').update({
              documentId: p.documentId,
              locale: 'az',
              data: { roles: out } as never,
            });
            await strapi.documents('api::person.person').publish({
              documentId: p.documentId,
              locale: 'az',
            });
            touched++;
            if (touched % 25 === 0) {
              strapi.log.info('[seed] temizlik gedir: ' + touched + ' sexs yazildi...');
            }
          }
        }

        strapi.log.info(
          '[seed] Dirnaq temizliyi BITDI: ' + renamed + ' bolme adi | ' + touched +
          ' sexs yenilendi | ' + renamedRoles + ' vezife adi duzeldildi | ' +
          merged + ' tekrar birlesdirildi.',
        );
          })().catch((e) =>
            strapi.log.error('[seed] dirnaq temizliyi (arxa plan) xetasi: ' + (e as Error).message),
          );
        }, 5000);
      }
    } catch (err) {
      strapi.log.error('[seed] dirnaq temizliyi xetasi: ' + (err as Error).message);
    }


    // ── Ayrılmış əməkdaşlar (F3.7) ───────────────────────────────────────
    //
    // Ştatda «Professor-müəllim heyyəti» kimi qeyd olunub, lakin yeni
    // kafedra siyahısında yoxdur -> artıq işləmir.
    //
    // DİQQƏT: «Tədris köməkçi-heyət» (10 laborant) BURAYA DAXİL DEYİL.
    // Kafedra siyahısı yalnız müəllim vəzifələrini sadalayır, ona görə
    // laborantların orada olmaması işdən ayrıldıqları demək deyil.
    //
    // SİLMİR — yalnız nəşrdən çıxarır. Geri qaytarmaq üçün admin paneldə
    // «Publish» kifayətdir.
    //
    // STAFF_ARCHIVE=true olmadan İŞLƏMİR.
    try {
      if (process.env.STAFF_ARCHIVE !== 'true') {
        strapi.log.info('[seed] Ayrilmis emekdaslar otuldu. Ucun STAFF_ARCHIVE=true.');
      } else {
        const GONE: string[] = [
          'agayeva-gulsum-allahyar-qizi', 'agazade-sahin-mutarif-oglu', 'babayev-lacin-vasif-oglu',
          'bayramov-azad-memmed-oglu', 'cabbarov-samir-muzeffer-oglu', 'dadasova-nermin-rasim-qizi',
          'ferhadov-vahid-qara-oglu', 'hesenov-elsever-akif-oglu', 'memmedov-sahlar-eyyub-oglu',
          'quliyev-namiq-nizami-oglu', 'rustemli-qara-rustem-oglu', 'semedova-ulker-ferrux-qizi',
          'yusubov-nizami-demir-oglu', 'yusubov-sahid-tahir-oglu', 'celebi-iftixar-qurbaneli-oglu',
          'imanli-mehemmed-nagi-oglu', 'ismayilov-sahib-soyun-oglu', 'ehmedov-beyali-behcet-oglu',
          'ehmedov-ferrux-enver-oglu', 'ehmedov-iqbal-novruz-oglu', 'ehmedova-rena-haciaga-qizi',
          'eliyev-eli-sahin-oglu',
        ];
        let done = 0;
        const skipped: string[] = [];
        for (const slug of GONE) {
          try {
            const f = await strapi.documents('api::person.person').findMany({
              locale: 'az', filters: { slug: { $eq: slug } }, fields: ['slug'], limit: 2,
            });
            if (f.length !== 1) { skipped.push(slug + ' (' + f.length + ' tapildi)'); continue; }
            await strapi.documents('api::person.person').unpublish({
              documentId: String(f[0].documentId), locale: 'az',
            });
            done++;
          } catch (e) {
            skipped.push(slug + ': ' + (e as Error).message);
          }
        }
        strapi.log.info('[seed] Ayrilmis emekdaslar: ' + done + '/' + GONE.length + ' nesrden cixarildi.');
        for (const s of skipped) strapi.log.warn('[seed] arxiv atlandi - ' + s);
      }
    } catch (err) {
      strapi.log.error('[seed] arxiv xetasi: ' + (err as Error).message);
    }

    // ── Department mətninin unit-ə köçürülməsi (F3.23) ───────────────────
    //
    // PROBLEM: F3.22-də slug hər iki tipdə (`unit` + `department`) varsa
    // beş bloklu `unit` görünüşü üstün gəlir və `department.about` heç vaxt
    // göstərilmir. Altı bölmədə köhnə saytdan gələn real mətn bu səbəbdən
    // görünməz qalıb.
    //
    // HƏLL: hər `department` üçün eyni slug-lı `unit` tapılır. `unit.about`
    // (qaralama) BOŞDURSA `department.about` ora yazılır + publish().
    // DOLUDURSA TOXUNULMUR — üstündən yazma yoxdur. Hər üç dil ayrıca
    // yoxlanılır: `department`-də ru/en versiyası varsa (az 11, ru 3, en 10)
    // yalnız o dillər üçün `unit`-ə yazılır.
    //
    // F3.26: bəzi cütlərdə slug eyni deyil (quyruq/şəkilçi/söz sırası fərqi) —
    // avtomatik uyğunlaşdırma DEYİL, ƏL İLƏ yoxlanıb yazılıb (bax:
    // tools/check-duplicate-units.mjs, F3.25 tapıntısı). Xəritədə olmayan
    // department-lər yenə öz slug-ına uyğun unit axtarır (F3.23 davranışı).
    const DEPT_UNIT_MAP: Record<string, string> = {
      'azerbaycan-denizcilik-kolleci': 'azerbaycan-denizcilik-kolleci-phs',
      'telim-tedris-merkezi-ttm': 'telim-tedris-merkezi',
      'muhasibat-ucotu-ve-hesabat-sobesi': 'muhasibat-ucotu-ve-hesabati-sobesi',
      'personalin-idare-edilmesi-emek-haqqi-sobesi-ve-karguzarliq-sobesi':
        'personalin-idareedilmesi-emek-haqqi-ve-karguzarliq-sobesi',
    };

    // ABOUT_MIGRATE=true olmadan İŞLƏMİR.
    try {
      if (process.env.ABOUT_MIGRATE !== 'true') {
        strapi.log.info('[seed] Department -> unit about kocurmesi otuldu. Ucun ABOUT_MIGRATE=true.');
      } else {
        const LOCS = ['az', 'ru', 'en'] as const;
        let written = 0;
        let skipped = 0;
        const failed: string[] = [];

        for (const loc of LOCS) {
          const deps = (await strapi.documents('api::department.department').findMany({
            locale: loc,
            // Yalnız 12 qeyd — SABİT SIRA yenə də tələb olunur (layihə qaydası).
            sort: 'slug:asc',
            fields: ['slug', 'about'],
            limit: 100,
          })) as unknown as Array<{ slug: string; about?: string | null }>;

          for (const d of deps) {
            if (!d.about) continue;
            const targetSlug = DEPT_UNIT_MAP[d.slug] ?? d.slug;
            try {
              const units = (await strapi.documents('api::unit.unit').findMany({
                locale: loc,
                filters: { slug: { $eq: targetSlug } },
                fields: ['slug', 'about'],
                status: 'draft',
                limit: 2,
              })) as unknown as Array<{ documentId: string; about?: string | null }>;
              if (units.length !== 1) {
                skipped++;
                continue;
              }
              const u = units[0];
              if (u.about) {
                skipped++;
                continue;
              }

              await strapi.documents('api::unit.unit').update({
                documentId: u.documentId,
                locale: loc,
                data: { about: d.about } as never,
              });
              // update() YALNIZ qaralamaya yazır.
              await strapi.documents('api::unit.unit').publish({ documentId: u.documentId, locale: loc });
              written++;
              strapi.log.info(
                '[seed] about kocuruldu (' + loc + '): ' + d.slug + ' -> ' + targetSlug + ' (' + d.about.length + ' simvol)',
              );
            } catch (e) {
              failed.push(d.slug + ' -> ' + targetSlug + ' (' + loc + '): ' + (e as Error).message);
            }
          }
        }

        strapi.log.info('[seed] Department about kocurmesi: ' + written + ' yazildi, ' + skipped + ' atlandi.');
        for (const f of failed) strapi.log.error('[seed] about kocurme UGURSUZ - ' + f);
      }
    } catch (err) {
      strapi.log.error('[seed] about kocurme xetasi: ' + (err as Error).message);
    }

    // ── Əsasnamə sənədlərinin ilkin yaradılması (F4.2) ────────────────────
    //
    // MƏQSƏD: admin paneldə hər sənəd üçün başlıq + kateqoriya + bölmə
    // seçimi əvəzinə, Zaur yalnız PDF-i əlavə etsin.
    //
    // `file` BOŞ qalır: sxemdə `required: true` olsa da, Strapi-nin document
    // service validator-ı media sahələri üçün `required` yoxlaması APARMIR
    // (yalnız content-manager UI-də tətbiq olunur) — ona görə boş `file` ilə
    // `create()`/`publish()` uğurla keçir. `year` də boş: mənbə sənədlərdə
    // tarix ziddiyyətlidir (bax CLAUDE.md). `titleRu`/`titleEn` boş: rəsmi
    // tərcümə yoxdur.
    //
    // Hər bölmə üçün `units` əlaqəsi az/ru/en HƏR ÜÇ lokalın sənəd
    // (documentId eynidir, `unit` yalnız `az`-dan tapılır) entry-lərinə
    // ayrıca bağlanır — əks halda `unit` `ru`/`en` görünüşündə sənəd
    // görünməzdi (populate yalnız faktiki bağlı lokal/status cütünə baxır).
    //
    // İDEMPOTENT: eyni başlıqlı (`title`) sənəd varsa keçilir.
    interface EsasnameSeed {
      title: string;
      unitSlugs: string[];
      description?: string;
    }
    const ESASNAME_SEED: EsasnameSeed[] = [
      {
        title: 'Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsinin Əsasnaməsi (ADDA-ƏS-011)',
        unitSlugs: ['elmi-tedqiqat-ve-beynelxalq-elaqeler-sobesi'],
      },
      {
        title: 'İnformasiya resurs mərkəzinin Əsasnaməsi (ADDA-ƏS-012)',
        unitSlugs: ['informasiya-resurs-merkezi'],
      },
      {
        title: 'Personalın idarə edilməsi və əmək haqqı şöbəsinin Əsasnaməsi (ADDA-ƏS-013)',
        unitSlugs: ['personalin-idareedilmesi-emek-haqqi-ve-karguzarliq-sobesi'],
      },
      {
        title: 'Kafedralar haqqında Əsasnamə (ADDA-ƏS-014)',
        unitSlugs: [
          'tetbiqi-mexanika-kafedrasi',
          'deniz-naviqasiyasi-kafedrasi',
          'gemi-elektroavtomatikasi-kafedrasi',
          'gemi-energetik-qurgulari-kafedrasi',
          'gemiqayirma-ve-gemi-temiri-kafedrasi',
          'humanitar-fenler-kafedrasi',
          'ingilis-dili-kafedrasi',
        ],
      },
      {
        title: 'Mühasibat uçotu və hesabatı şöbəsinin Əsasnaməsi (ADDA-ƏS-015)',
        unitSlugs: ['muhasibat-ucotu-ve-hesabati-sobesi'],
      },
      {
        title: 'Təlim Tədris Mərkəzinin Əsasnaməsi (ADDA-ƏS-016)',
        unitSlugs: ['telim-tedris-merkezi'],
      },
      {
        title: 'Mətbəənin Əsasnaməsi (ADDA-ƏS-018)',
        unitSlugs: ['metbee'],
      },
      {
        title: 'Fakültələr haqqında Əsasnamə (ADDA-ƏS-019)',
        unitSlugs: ['gemi-mexanikasi-ve-elektromexanikasi-fakultesi', 'gemi-suruculuyu-fakultesi'],
      },
      {
        title: 'İcraya nəzarət, kargüzarlıq və təsərrüfat işləri qrupunun Əsasnaməsi (ADDA-ƏS-020)',
        unitSlugs: [
          'personalin-idareedilmesi-emek-haqqi-ve-karguzarliq-sobesi',
          'teserrufat-isleri-sobesi',
        ],
        description:
          'Sənəd 2020-ci ildə yaradılmış qrupa aiddir. Qrupun funksiyaları sonradan Personalın idarəedilməsi və Təsərrüfat işləri şöbələri arasında bölüşdürülüb.',
      },
      {
        title: 'Tədris qeydiyyat şöbəsinin Əsasnaməsi (ADDA-ƏS-021)',
        unitSlugs: ['tedris-proseslerinin-teskili-sobesi'],
        description: 'Sənəddə şöbənin köhnə adı — Tədris qeydiyyat şöbəsi — işlədilir.',
      },
    ];

    try {
      if (process.env.ESASNAME_SEED !== 'true') {
        strapi.log.info('[seed] Esasname senedleri otuldu. Ucun ESASNAME_SEED=true.');
      } else {
        const LOCS = ['az', 'ru', 'en'] as const;
        let created = 0;
        let skipped = 0;
        let errored = 0;

        for (const doc of ESASNAME_SEED) {
          try {
            const existing = (await strapi.documents('api::document.document').findMany({
              filters: { title: { $eq: doc.title } },
              fields: ['title'],
              status: 'draft',
              limit: 2,
            })) as unknown as Array<{ documentId: string }>;
            if (existing.length > 0) {
              skipped++;
              strapi.log.info('[seed] esasname atlandi (movcuddur): ' + doc.title);
              continue;
            }

            // Her bolme slug-i ucun documentId (az-dan - documentId lokaldan
            // asili deyil). Tapilmasa XETA - sened YARADILMIR.
            const unitDocIds: string[] = [];
            let missing = false;
            for (const slug of doc.unitSlugs) {
              const units = (await strapi.documents('api::unit.unit').findMany({
                locale: 'az',
                filters: { slug: { $eq: slug } },
                fields: ['slug'],
                limit: 2,
              })) as unknown as Array<{ documentId: string }>;
              if (units.length !== 1) {
                strapi.log.error('[seed] esasname XETA - bolme tapilmadi: ' + slug + ' (' + doc.title + ')');
                missing = true;
                continue;
              }
              unitDocIds.push(units[0].documentId);
            }
            if (missing) {
              errored++;
              continue;
            }

            const unitsConnect = unitDocIds.flatMap((id) =>
              LOCS.map((locale) => ({ documentId: id, locale })),
            );

            const createData: Record<string, unknown> = {
              title: doc.title,
              category: 'esasname',
              units: { connect: unitsConnect },
            };
            if (doc.description) createData.description = doc.description;

            const createdDoc = (await strapi.documents('api::document.document').create({
              data: createData as never,
            })) as unknown as { documentId: string };

            // update() YALNIZ qaralamaya yazir - publish() olmadan ictimai
            // API-de gorunmur.
            await strapi.documents('api::document.document').publish({ documentId: createdDoc.documentId });

            created++;
            strapi.log.info('[seed] esasname yaradildi: ' + doc.title + ' -> [' + doc.unitSlugs.join(', ') + ']');
          } catch (e) {
            errored++;
            strapi.log.error('[seed] esasname XETA - ' + doc.title + ': ' + (e as Error).message);
          }
        }

        strapi.log.info(
          '[seed] Esasname senedleri: ' + created + ' yaradildi, ' + skipped + ' atlandi, ' + errored + ' xeta.',
        );
      }
    } catch (err) {
      strapi.log.error('[seed] esasname seed xetasi: ' + (err as Error).message);
    }

    // ── Nümunəvi məzmun — YALNIZ QARALAMA (F4.13) ─────────────────────────
    //
    // ƏHATƏ: YALNIZ `tehsil-innovasiyalari-ve-reqemsal-heller-merkezi`.
    // Digər bölmələrin faktlarını bilmirik, ona görə TOXUNULMUR.
    //
    // `publish()` BURADA QƏSDƏN ÇAĞIRILMIR — yalnız `az` qaralamasına
    // yazılır, Zaur admin paneldə oxuyub təsdiqləyəcək (bax CLAUDE.md
    // "Strapi 5": `update()` yalnız qaralamaya yazır, adətən dərhal
    // `publish()` izləyir — bu dəfə İSTİSNA, qəsdən).
    //
    // Sahə BOŞ DEYİLSƏ TOXUNULMUR (üstündən yazma yoxdur) — hər sahə ayrıca
    // yoxlanılır, ona görə ikinci işləmə 0 dəyişiklik verir (idempotent).
    //
    // `establishedNote`/`vacancies` BURADA YAZILMIR — əmr nömrəsi/tarix və
    // real açıq vəzifə mə'lumatı olmadan uydurmaq YANLIŞDIR.
    try {
      if (process.env.SAMPLE_CONTENT !== 'true') {
        strapi.log.info('[seed] Numunevi mezmun (F4.13) oturuldu. Ucun SAMPLE_CONTENT=true.');
      } else {
        const TARGET_SLUG = 'tehsil-innovasiyalari-ve-reqemsal-heller-merkezi';

        const units = (await strapi.documents('api::unit.unit').findMany({
          locale: 'az',
          filters: { slug: { $eq: TARGET_SLUG } },
          status: 'draft',
          fields: ['slug', 'strategy'],
          populate: ['faq', 'receptionSlots'],
          limit: 2,
        })) as unknown as Array<{
          documentId: string;
          strategy?: string | null;
          faq?: Array<{ question: string; answer: string }>;
          receptionSlots?: Array<{ day: string; timeFrom?: string | null; timeTo?: string | null }>;
        }>;

        if (units.length !== 1) {
          strapi.log.error('[seed] numunevi mezmun XETA - bolme tapilmadi: ' + TARGET_SLUG);
        } else {
          const u = units[0];
          const data: Record<string, unknown> = {};
          let written = 0;
          let skipped = 0;

          const SAMPLE_STRATEGY =
            'Mərkəz Akademiyanın rəqəmsal transformasiya istiqamətində aşağıdakı öhdəlikləri daşıyır:\n\n' +
            '- Tədris və inzibati proseslərin mərhələli şəkildə elektron formaya keçirilməsi\n' +
            '- Rəqəmsal xidmətlərin vahid standart və istifadəçi təcrübəsi üzrə uyğunlaşdırılması\n' +
            '- Struktur bölmələrin rəqəmsal bacarıqlarının artırılmasına metodiki dəstək\n' +
            '- Akademiyanın rəsmi rəqəmsal təmsilçiliyinin aktual və dəqiq saxlanılması';

          if (u.strategy) {
            skipped++;
            strapi.log.info('[seed] numunevi mezmun: strategy atlandi (doludur)');
          } else {
            data.strategy = SAMPLE_STRATEGY;
            written++;
            strapi.log.info('[seed] numunevi mezmun: strategy yazilir');
          }

          const SAMPLE_FAQ = [
            {
              question: 'Bölməmizin sayt səhifəsindəki məlumatı necə yeniləyə bilərik?',
              answer:
                'Yeniləmə tələbi ilə mərkəzə müraciət edin. Məzmun bölmənin özü tərəfindən təqdim olunur, mərkəz texniki yerləşdirməni və format uyğunluğunu təmin edir.',
            },
            {
              question: 'Elektron tədris platformasında texniki problem yaranıb, kimə müraciət edim?',
              answer:
                'Platforma ilə bağlı texniki müraciətlər mərkəzə ünvanlanır. Müraciətdə problemin baş verdiyi səhifə və vaxt göstərilsə, həlli sürətlənir.',
            },
            {
              question: 'Yeni rəqəmsal xidmət təklifim var, necə irəli sürə bilərəm?',
              answer:
                'Təklifi yazılı şəkildə mərkəzə təqdim edin. Təkliflər texniki reallaşdırıla bilmə və Akademiyanın rəqəmsal inkişaf istiqamətlərinə uyğunluq baxımından qiymətləndirilir.',
            },
            {
              question: 'Tədris materiallarımı elektron formata keçirmək üçün dəstək ala bilərəmmi?',
              answer:
                'Bəli. Mərkəz müəllimlərə elektron tədris resurslarının hazırlanması və platformalarda yerləşdirilməsi üzrə metodiki dəstək göstərir.',
            },
            {
              question: 'Rəqəmsal xidmətlərdən istifadə zamanı problem yaşayan tələbə hara müraciət etməlidir?',
              answer: 'Tələbələr texniki problemlərlə bağlı mərkəzə birbaşa müraciət edə bilər.',
            },
          ];

          if (u.faq && u.faq.length > 0) {
            skipped++;
            strapi.log.info('[seed] numunevi mezmun: faq atlandi (doludur)');
          } else {
            data.faq = SAMPLE_FAQ;
            written++;
            strapi.log.info('[seed] numunevi mezmun: faq yazilir (5 giris)');
          }

          const SAMPLE_RECEPTION_SLOTS = [
            { day: 'cerşenbe_axsami', timeFrom: '10:00:00.000', timeTo: '12:00:00.000' },
            { day: 'cume_axsami', timeFrom: '10:00:00.000', timeTo: '12:00:00.000' },
          ];

          if (u.receptionSlots && u.receptionSlots.length > 0) {
            skipped++;
            strapi.log.info('[seed] numunevi mezmun: receptionSlots atlandi (doludur)');
          } else {
            data.receptionSlots = SAMPLE_RECEPTION_SLOTS;
            written++;
            strapi.log.info('[seed] numunevi mezmun: receptionSlots yazilir (2 giris)');
          }

          if (Object.keys(data).length > 0) {
            await strapi.documents('api::unit.unit').update({
              documentId: u.documentId,
              locale: 'az',
              data: data as never,
            });
            // update() YALNIZ qaralamaya yazir - publish() BURADA QESDEN CAGIRILMIR.
          }

          strapi.log.info(
            '[seed] Numunevi mezmun (F4.13): ' + written + ' sahe yazildi, ' + skipped + ' atlandi.',
          );
        }
      }
    } catch (err) {
      strapi.log.error('[seed] numunevi mezmun xetasi: ' + (err as Error).message);
    }

    // ── Tədris planı — proqramın kurs cədvəli (F5.1b/F5.2b, PLAN_SEED) ─────
    //
    // MƏNBƏ: `tools/migration/data/tedris-plani-6006006-2026.json` — BİR
    // DƏFƏLİK `tools/migration/data/TP_6006006_DN_2026.xlsx`-dən çıxarılıb
    // (units.json ilə EYNİ format: düz massiv, JSON.stringify(...,null,2)).
    // F5.2b-yə qədər burada 190 sətirlik əl ilə yazılmış OOXML oxuyucusu
    // (`./lib/xlsx-lite`) var idi — SİLİNİB: paylaşılan sətir cədvəli/inline
    // string kimi tələləri var, səhv səssiz keçə bilərdi. JSON isə plan
    // dəyişəndə YENİDƏN YARADILIR (mənbə `.xlsx` arxiv kimi qalır, seed
    // onu OXUMUR).
    //
    // ƏHATƏ: YALNIZ `deniz-naviqasiyasi-muhendisliyi` proqramı. `courses`
    // sahəsi DOLUDURSA TOXUNULMUR. `publish()` ÇAĞIRILMIR — yalnız `az`
    // qaralamasına yazılır.
    //
    // YOXLAMA: fənn sayı/kredit cəmi/blok cəmləri JSON-dakı `groupCode`-a
    // görə RIYAZI OLARAQ YENİDƏN HESABLANIR (xarici sabit deyil) — F5.1-də
    // Excel COM ilə əl ilə yoxlanıb: 46 fənn/təcrübə sətri, kredit cəmi 240,
    // blok cəmləri ÜF-B00=30, İF-B00=120, ATMF-B00=60 (ilkin tapşırıqdakı
    // "51" rəqəmi səhv imiş, Zaur təsdiqləyib).
    try {
      if (process.env.PLAN_SEED !== 'true') {
        strapi.log.info('[seed] Tedris plani (F5.1b) oturuldu. Ucun PLAN_SEED=true.');
      } else {
        const PLAN_PROGRAM_SLUG = 'deniz-naviqasiyasi-muhendisliyi';
        const PLAN_JSON_PATH = path.join(
          strapi.dirs.app.root,
          '..',
          'tools',
          'migration',
          'data',
          'tedris-plani-6006006-2026.json',
        );

        interface PlanCourse {
          code?: string;
          name: string;
          credits?: number | null;
          totalHours?: number | null;
          auditHours?: number | null;
          selfStudyHours?: number | null;
          semester?: string | null;
          prerequisite?: string | null;
          corequisite?: string | null;
          weeklyLoad?: string | null;
          groupCode?: string | null;
          isPractice: boolean;
        }

        try {
          const courses: PlanCourse[] = JSON.parse(readFileSync(PLAN_JSON_PATH, 'utf8'));

          const blockTotals: Record<string, number> = {};
          let creditSum = 0;
          for (const c of courses) {
            if (c.credits) creditSum += c.credits;
            if (c.groupCode) blockTotals[c.groupCode] = (blockTotals[c.groupCode] ?? 0) + (c.credits ?? 0);
          }

          const EXPECTED_COUNT = 46;
          const EXPECTED_CREDIT_SUM = 240;
          const EXPECTED_BLOCKS: Record<string, number> = {
            'ÜF-B00': 30,
            'İF-B00': 120,
            'ATMF-B00': 60,
          };

          const errors: string[] = [];
          if (courses.length !== EXPECTED_COUNT) {
            errors.push('fenn sayi ' + courses.length + ' (gozlenilen ' + EXPECTED_COUNT + ')');
          }
          if (creditSum !== EXPECTED_CREDIT_SUM) {
            errors.push('kredit cemi ' + creditSum + ' (gozlenilen ' + EXPECTED_CREDIT_SUM + ')');
          }
          for (const [code, expected] of Object.entries(EXPECTED_BLOCKS)) {
            if (blockTotals[code] !== expected) {
              errors.push('blok ' + code + ' cemi ' + (blockTotals[code] ?? '-') + ' (gozlenilen ' + expected + ')');
            }
          }

          if (errors.length > 0) {
            strapi.log.error('[seed] Tedris plani XETA - yoxlama uygun gelmir, YAZILMIR: ' + errors.join('; '));
          } else {
            strapi.log.info(
              '[seed] Tedris plani yoxlama OK: ' +
                courses.length +
                ' fenn, kredit cemi ' +
                creditSum +
                ', blok cemleri ' +
                Object.entries(blockTotals)
                  .map(([k, v]) => k + '=' + v)
                  .join(', '),
            );

            // F5.2c: skalyar sahələr (code/planYear/totalCredits/unit) EYNİ
            // proqrama, EYNİ qaralamaya, hər biri AYRICA "boşdursa" yoxlaması ilə.
            const PLAN_KAFEDRA_SLUG = 'deniz-naviqasiyasi-kafedrasi';

            const programs = (await strapi.documents('api::program.program').findMany({
              locale: 'az',
              filters: { slug: { $eq: PLAN_PROGRAM_SLUG } },
              status: 'draft',
              fields: ['slug', 'code', 'planYear', 'totalCredits'],
              populate: ['courses', 'unit'],
              limit: 2,
            })) as unknown as Array<{
              documentId: string;
              courses?: unknown[];
              code?: string | null;
              planYear?: number | null;
              totalCredits?: number | null;
              unit?: { documentId: string } | null;
            }>;

            if (programs.length !== 1) {
              strapi.log.error('[seed] Tedris plani XETA - proqram tapilmadi: ' + PLAN_PROGRAM_SLUG);
            } else {
              const p = programs[0];
              const data: Record<string, unknown> = {};

              if (p.courses && p.courses.length > 0) {
                strapi.log.info('[seed] Tedris plani: courses atlandi (doludur, ' + p.courses.length + ' fenn).');
              } else {
                data.courses = courses;
              }

              if (p.code) {
                strapi.log.info('[seed] Tedris plani: code atlandi (doludur).');
              } else {
                data.code = '6006006';
              }

              if (p.planYear) {
                strapi.log.info('[seed] Tedris plani: planYear atlandi (doludur).');
              } else {
                data.planYear = 2026;
              }

              if (p.totalCredits) {
                strapi.log.info('[seed] Tedris plani: totalCredits atlandi (doludur).');
              } else {
                data.totalCredits = EXPECTED_CREDIT_SUM;
              }

              if (p.unit) {
                strapi.log.info('[seed] Tedris plani: unit atlandi (doludur).');
              } else {
                const units = (await strapi.documents('api::unit.unit').findMany({
                  locale: 'az',
                  filters: { slug: { $eq: PLAN_KAFEDRA_SLUG } },
                  fields: ['slug'],
                  limit: 2,
                })) as unknown as Array<{ documentId: string }>;
                if (units.length === 1) {
                  data.unit = units[0].documentId;
                } else {
                  strapi.log.error('[seed] Tedris plani XETA - kafedra tapilmadi: ' + PLAN_KAFEDRA_SLUG);
                }
              }

              if (Object.keys(data).length === 0) {
                strapi.log.info('[seed] Tedris plani: hec bir sahe yazilmadi (hamisi doludur): ' + PLAN_PROGRAM_SLUG);
              } else {
                await strapi.documents('api::program.program').update({
                  documentId: p.documentId,
                  locale: 'az',
                  data: data as never,
                });
                // update() YALNIZ qaralamaya yazir - publish() BURADA QESDEN CAGIRILMIR.
                strapi.log.info(
                  '[seed] Tedris plani yazildi (' + Object.keys(data).join(', ') + '): ' + PLAN_PROGRAM_SLUG,
                );
              }
            }
          }
        } catch (e) {
          strapi.log.error('[seed] Tedris plani oxuma xetasi: ' + (e as Error).message);
        }
      }
    } catch (err) {
      strapi.log.error('[seed] tedris plani seed xetasi: ' + (err as Error).message);
    }

    // F5.6 — kafedra -> fakültə uyğunluğu, EXPLICIT sabit (F3.26-dakı
    // DEPT_UNIT_MAP nümunəsi ilə). Slug uyğunluğu (unit.slug === faculty.slug)
    // TƏSADÜFİ DEYİL — akademiyada cəmi 2 fakültə var, hər ikisi (`unit` VƏ
    // `faculty` content type-ları) EYNİ kanonik addan yaradılıb (bax
    // tools/migration/data/extracted/faculty.json). Yeni fakültə əlavə
    // olunarsa BURA da ƏL İLƏ əlavə edilməlidir.
    //
    // EYNİ sabit `adda-nextjs/lib/strapi.ts`-də (page.tsx-in `facultyDisplay`
    // geri dönüşü üçün) TƏKRARLANIB — adda-strapi və adda-nextjs AYRI
    // layihələrdir (import mümkün deyil), dəyişəndə HƏR İKİSİ yenilənməlidir.
    const KAFEDRA_FACULTY: Record<string, string> = {
      'tetbiqi-mexanika-kafedrasi': 'gemi-mexanikasi-ve-elektromexanikasi-fakultesi',
      'gemi-energetik-qurgulari-kafedrasi': 'gemi-mexanikasi-ve-elektromexanikasi-fakultesi',
      'gemi-elektroavtomatikasi-kafedrasi': 'gemi-mexanikasi-ve-elektromexanikasi-fakultesi',
      'deniz-naviqasiyasi-kafedrasi': 'gemi-suruculuyu-fakultesi',
      'gemiqayirma-ve-gemi-temiri-kafedrasi': 'gemi-suruculuyu-fakultesi',
      'ingilis-dili-kafedrasi': 'gemi-suruculuyu-fakultesi',
      'humanitar-fenler-kafedrasi': 'gemi-suruculuyu-fakultesi',
    };

    // ── İxtisas mətnləri — proqramın akkordeon mətnləri (F5.4, PROGRAM_TEXT_SEED) ──
    //
    // MƏNBƏ: `tools/migration/data/program-texts-6006006.json` (Zaur qoyub).
    // Fayl PARSE OLUNUR, mətn koda köçürülmür — fayl mənbədir, burada mətn
    // sabiti YOXDUR.
    //
    // Beş sahə: overview/competencies/careerPaths/practiceNote/conventions.
    // Sahə BOŞ DEYİLSƏ TOXUNULMUR (üstündən yazma yoxdur). YALNIZ `az`
    // qaralamasına — `publish()` BURADA ÇAĞIRILMIR.
    //
    // Tədris planı 2026-dan, bu mətnlər 2020-ci il Təhsil Proqramından —
    // ziyarətçi hansı sənədə baxdığını bilsin deyə hər yazılan sahənin
    // SONUNA JSON-dakı `sourceNote` ayrıca abzas kimi əlavə olunur
    // (kursivsiz — sadə paraqraf, `\n\n` ilə ayrılıb).
    try {
      if (process.env.PROGRAM_TEXT_SEED !== 'true') {
        strapi.log.info('[seed] Ixtisas metnleri (F5.4) oturuldu. Ucun PROGRAM_TEXT_SEED=true.');
      } else {
        const TEXT_JSON_PATH = path.join(
          strapi.dirs.app.root,
          '..',
          'tools',
          'migration',
          'data',
          'program-texts-6006006.json',
        );

        interface ProgramTextSeed {
          programSlug: string;
          sourceNote: string;
          fields: {
            overview?: string;
            competencies?: string;
            careerPaths?: string;
            practiceNote?: string;
            conventions?: string;
          };
        }
        const TEXT_FIELD_KEYS = ['overview', 'competencies', 'careerPaths', 'practiceNote', 'conventions'] as const;

        try {
          const seed: ProgramTextSeed = JSON.parse(readFileSync(TEXT_JSON_PATH, 'utf8'));

          const programs = (await strapi.documents('api::program.program').findMany({
            locale: 'az',
            filters: { slug: { $eq: seed.programSlug } },
            status: 'draft',
            fields: ['slug', ...TEXT_FIELD_KEYS],
            populate: {
              faculty: { fields: ['slug'] },
              unit: { fields: ['slug'] },
            },
            limit: 2,
          })) as unknown as Array<
            { documentId: string; faculty?: { documentId: string } | null; unit?: { documentId: string; slug: string } | null } & Record<
              (typeof TEXT_FIELD_KEYS)[number],
              string | null
            >
          >;

          if (programs.length !== 1) {
            strapi.log.error('[seed] Ixtisas metnleri XETA - proqram tapilmadi: ' + seed.programSlug);
          } else {
            const p = programs[0];
            const data: Record<string, unknown> = {};
            let skipped = 0;

            for (const key of TEXT_FIELD_KEYS) {
              const raw = seed.fields[key];
              if (!raw) continue; // JSON-da bu sahə yoxdur - tetiklenmir.
              if (p[key]) {
                skipped++;
                strapi.log.info('[seed] Ixtisas metnleri: ' + key + ' atlandi (doludur).');
                continue;
              }
              const withNote = raw + '\n\n' + seed.sourceNote;
              data[key] = withNote;
              strapi.log.info('[seed] Ixtisas metnleri: ' + key + ' yazilir (' + withNote.length + ' simvol).');
            }

            // F5.5b/F5.6 — `faculty` sxemdə var, bu proqramda boş ola bilər.
            // KAFEDRA_FACULTY sabitindən (bax aşağıda) tapılır — `unit.parent`
            // zənciri ARTIQ GƏZİLMİR, birbaşa kafedranın öz slug-ı ilə axtarılır.
            if (p.faculty) {
              strapi.log.info('[seed] Ixtisas metnleri: faculty atlandi (doludur).');
            } else if (!p.unit || !KAFEDRA_FACULTY[p.unit.slug]) {
              strapi.log.info('[seed] Ixtisas metnleri: faculty atlandi (kafedra KAFEDRA_FACULTY-də yoxdur).');
            } else {
              const facultySlug = KAFEDRA_FACULTY[p.unit.slug];
              const faculties = (await strapi.documents('api::faculty.faculty').findMany({
                locale: 'az',
                filters: { slug: { $eq: facultySlug } },
                fields: ['slug'],
                limit: 2,
              })) as unknown as Array<{ documentId: string }>;
              if (faculties.length === 1) {
                data.faculty = faculties[0].documentId;
                strapi.log.info('[seed] Ixtisas metnleri: faculty yazilir (' + facultySlug + ').');
              } else {
                strapi.log.error('[seed] Ixtisas metnleri XETA - fakulte tapilmadi: ' + facultySlug);
              }
            }

            if (Object.keys(data).length === 0) {
              strapi.log.info(
                '[seed] Ixtisas metnleri: hec bir sahe yazilmadi (' + skipped + ' atlandi): ' + seed.programSlug,
              );
            } else {
              await strapi.documents('api::program.program').update({
                documentId: p.documentId,
                locale: 'az',
                data: data as never,
              });
              // update() YALNIZ qaralamaya yazir - publish() BURADA QESDEN CAGIRILMIR.
              strapi.log.info(
                '[seed] Ixtisas metnleri yazildi (' +
                  Object.keys(data).join(', ') +
                  '), ' +
                  skipped +
                  ' atlandi: ' +
                  seed.programSlug,
              );
            }
          }
        } catch (e) {
          strapi.log.error('[seed] Ixtisas metnleri oxuma xetasi: ' + (e as Error).message);
        }
      }
    } catch (err) {
      strapi.log.error('[seed] ixtisas metnleri seed xetasi: ' + (err as Error).message);
    }

  },
};
