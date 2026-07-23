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
  esasMenyu: [
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
                                    "url": "#"
                              },
                              {
                                    "label": "Akademiyanın tarixi",
                                    "url": "#"
                              },
                              {
                                    "label": "Sabiq rektorlarımız",
                                    "url": "#"
                              },
                              {
                                    "label": "ADDA Qəhrəmanları",
                                    "url": "#"
                              },
                              {
                                    "label": "Fəxri doktorlarımız",
                                    "url": "#"
                              },
                              {
                                    "label": "Fəxri məzunlar",
                                    "url": "#"
                              },
                              {
                                    "label": "ADDA reytinqlərdə",
                                    "url": "#"
                              },
                              {
                                    "label": "Rəqəmlər və faktlar",
                                    "url": "#"
                              }
                        ]
                  },
                  {
                        "title": "Rəhbərlik və idarəetmə",
                        "links": [
                              {
                                    "label": "Rektor",
                                    "url": "#"
                              },
                              {
                                    "label": "Rəhbərlik",
                                    "url": "#"
                              },
                              {
                                    "label": "Elmi Şura",
                                    "url": "#"
                              },
                              {
                                    "label": "Himayəçilər Şurası",
                                    "url": "#"
                              },
                              {
                                    "label": "Təşkilati struktur",
                                    "url": "#"
                              }
                        ]
                  },
                  {
                        "title": "Hüquqi baza, etika və keyfiyyət",
                        "links": [
                              {
                                    "label": "Təhsil müəssisəsi haqqında",
                                    "url": "#"
                              },
                              {
                                    "label": "Normativ-hüquqi sənədlər",
                                    "url": "#"
                              },
                              {
                                    "label": "Akademik dürüstlük bəyannaməsi",
                                    "url": "#"
                              },
                              {
                                    "label": "ADDA etika kodeksi",
                                    "url": "#"
                              },
                              {
                                    "label": "Keyfiyyətin monitorinqi",
                                    "url": "#"
                              },
                              {
                                    "label": "Dayanıqlı inkişaf",
                                    "url": "#"
                              }
                        ]
                  },
                  {
                        "title": "Heyət",
                        "links": [
                              {
                                    "label": "Professor-müəllim heyəti",
                                    "url": "#"
                              },
                              {
                                    "label": "Təlimçi-texniki heyət",
                                    "url": "#"
                              },
                              {
                                    "label": "İnzibati heyət",
                                    "url": "#"
                              }
                        ]
                  },
                  {
                        "title": "Təminat",
                        "links": [
                              {
                                    "label": "Satınalmalar",
                                    "url": "#"
                              },
                              {
                                    "label": "Binalar və infrastruktur",
                                    "url": "#"
                              },
                              {
                                    "label": "I və II tədris binaları",
                                    "url": "#"
                              },
                              {
                                    "label": "Yataqxana",
                                    "url": "#"
                              },
                              {
                                    "label": "Təlim-Tədris Mərkəzi",
                                    "url": "#"
                              },
                              {
                                    "label": "Tədris gəmisi",
                                    "url": "#"
                              },
                              {
                                    "label": "Kollec",
                                    "url": "#"
                              }
                        ]
                  },
                  {
                        "title": "Kommunikasiya",
                        "links": [
                              {
                                    "label": "Vətəndaşların müraciəti",
                                    "url": "#"
                              },
                              {
                                    "label": "Əlaqə",
                                    "url": "#"
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
                                    "url": "#"
                              },
                              {
                                    "label": "Subbakalavr",
                                    "url": "#"
                              },
                              {
                                    "label": "Əcnəbi tələbələr",
                                    "url": "#"
                              },
                              {
                                    "label": "Magistratura",
                                    "url": "#"
                              },
                              {
                                    "label": "Doktorantura",
                                    "url": "#"
                              }
                        ]
                  },
                  {
                        "title": "Əlavə təhsil",
                        "links": [
                              {
                                    "label": "Təkrar ali təhsil",
                                    "url": "#"
                              },
                              {
                                    "label": "İxtisasartırma",
                                    "url": "#"
                              },
                              {
                                    "label": "Təkmilləşdirmə",
                                    "url": "#"
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
                                    "url": "#"
                              },
                              {
                                    "label": "Viza və miqrasiya dəstəyi",
                                    "url": "#"
                              }
                        ]
                  },
                  {
                        "title": "Faydalı məlumatlar və keçidlər",
                        "links": [
                              {
                                    "label": "Qeydiyyat xidməti",
                                    "url": "#"
                              },
                              {
                                    "label": "Təhsil haqqı və güzəştlər",
                                    "url": "#"
                              },
                              {
                                    "label": "Onlayn qeydiyyat",
                                    "url": "#"
                              },
                              {
                                    "label": "Açıq qapı günləri",
                                    "url": "#"
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
                                    "url": "#"
                              }
                        ]
                  },
                  {
                        "title": "Proqramların kataloqu",
                        "links": [
                              {
                                    "label": "Bakalavriat",
                                    "url": "#"
                              },
                              {
                                    "label": "Magistratura",
                                    "url": "#"
                              },
                              {
                                    "label": "Doktorantura",
                                    "url": "#"
                              },
                              {
                                    "label": "Əlavə təhsil",
                                    "url": "#"
                              }
                        ]
                  },
                  {
                        "title": "Təhsil standartları",
                        "links": [
                              {
                                    "label": "Dənizçilik qanunvericilik sənədləri",
                                    "url": "#"
                              },
                              {
                                    "label": "Beynəlxalq standartlar (IMO/STCW)",
                                    "url": "#"
                              }
                        ]
                  },
                  {
                        "title": "Təhsilin keyfiyyətinin qiymətləndirilməsi",
                        "links": [
                              {
                                    "label": "Yerli və beynəlxalq akkreditasiya",
                                    "url": "#"
                              },
                              {
                                    "label": "Tələbə sorğuları",
                                    "url": "#"
                              },
                              {
                                    "label": "Qaynar xətt və təkliflər",
                                    "url": "#"
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
                                    "url": "#"
                              },
                              {
                                    "label": "Tədris-Metodiki Şura",
                                    "url": "#"
                              },
                              {
                                    "label": "Rəqəmlər və faktlar",
                                    "url": "#"
                              }
                        ]
                  },
                  {
                        "title": "Elmi-tədqiqat mərkəzləri və laboratoriyalar",
                        "links": [
                              {
                                    "label": "Tədqiqat mərkəzləri və laboratoriyalar",
                                    "url": "#"
                              }
                        ]
                  },
                  {
                        "title": "Elmi nəşrlər və kitabxana",
                        "links": [
                              {
                                    "label": "ADDA-nın Elmi Jurnalı",
                                    "url": "#"
                              },
                              {
                                    "label": "Əməkdaşların nəşrləri",
                                    "url": "#"
                              },
                              {
                                    "label": "E-Kitabxana",
                                    "url": "#"
                              },
                              {
                                    "label": "Konvensiyalar və normativ sənədlər fondu",
                                    "url": "#"
                              },
                              {
                                    "label": "Tərəfdaş kitabxanalar və elmi bazalar",
                                    "url": "#"
                              }
                        ]
                  },
                  {
                        "title": "Doktorantura və elmi kadrların hazırlığı",
                        "links": [
                              {
                                    "label": "Doktorantura",
                                    "url": "#"
                              },
                              {
                                    "label": "Dissertasiya şuraları",
                                    "url": "#"
                              },
                              {
                                    "label": "Gənc alimlərin platforması",
                                    "url": "#"
                              }
                        ]
                  },
                  {
                        "title": "Qrantlar, müsabiqələr və tədbirlər",
                        "links": [
                              {
                                    "label": "Qrantlar",
                                    "url": "#"
                              },
                              {
                                    "label": "Mükafatlar",
                                    "url": "#"
                              },
                              {
                                    "label": "Elmi tədbirlər təqvimi",
                                    "url": "#"
                              },
                              {
                                    "label": "Beynəlxalq Dənizçilik Konfransları",
                                    "url": "#"
                              },
                              {
                                    "label": "Sahəvi seminarlar və təlimlər",
                                    "url": "#"
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
                                    "url": "#"
                              },
                              {
                                    "label": "Tələbə Həmkarlar İttifaqı (THİK)",
                                    "url": "#"
                              },
                              {
                                    "label": "Tələbə Elmi Cəmiyyəti (TEC)",
                                    "url": "#"
                              },
                              {
                                    "label": "Könüllülük hərəkatı",
                                    "url": "#"
                              }
                        ]
                  },
                  {
                        "title": "Yaşayış və rifah",
                        "links": [
                              {
                                    "label": "Tələbə yataqxanası",
                                    "url": "#"
                              },
                              {
                                    "label": "Onlayn müraciət və yerləşdirmə",
                                    "url": "#"
                              },
                              {
                                    "label": "Sosial təminat və maddi yardım",
                                    "url": "#"
                              },
                              {
                                    "label": "Təqaüd proqramları",
                                    "url": "#"
                              },
                              {
                                    "label": "Psixoloji dəstək xidməti",
                                    "url": "#"
                              },
                              {
                                    "label": "Tibb xidməti",
                                    "url": "#"
                              }
                        ]
                  },
                  {
                        "title": "Yaradıcılıq, idman və asudə vaxt",
                        "links": [
                              {
                                    "label": "İdman klubları",
                                    "url": "#"
                              },
                              {
                                    "label": "Mədəniyyət və yaradıcılıq dərnəkləri",
                                    "url": "#"
                              },
                              {
                                    "label": "İntellektual oyun klubları",
                                    "url": "#"
                              }
                        ]
                  },
                  {
                        "title": "Media və kommunikasiya",
                        "links": [
                              {
                                    "label": "Sosial media elçiləri",
                                    "url": "#"
                              },
                              {
                                    "label": "Tədbirlər təqvimi",
                                    "url": "#"
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
                                    "url": "#"
                              },
                              {
                                    "label": "Akademik tərəfdaşlar",
                                    "url": "#"
                              }
                        ]
                  },
                  {
                        "title": "Mobillik proqramları",
                        "links": [
                              {
                                    "label": "Erasmus+ və Mevlana",
                                    "url": "#"
                              },
                              {
                                    "label": "Müəllim mübadiləsi",
                                    "url": "#"
                              },
                              {
                                    "label": "Yay məktəbləri",
                                    "url": "#"
                              }
                        ]
                  },
                  {
                        "title": "Beynəlxalq assosiasiyalar və təşkilatlar",
                        "links": [
                              {
                                    "label": "IAMU",
                                    "url": "#"
                              },
                              {
                                    "label": "IMO",
                                    "url": "#"
                              },
                              {
                                    "label": "BSAMI",
                                    "url": "#"
                              },
                              {
                                    "label": "Digər təşkilatlar",
                                    "url": "#"
                              }
                        ]
                  },
                  {
                        "title": "Xarici gəmiçilik şirkətləri",
                        "links": [
                              {
                                    "label": "Kadet proqramları",
                                    "url": "#"
                              },
                              {
                                    "label": "Məzunların işlə təminatı",
                                    "url": "#"
                              }
                        ]
                  },
                  {
                        "title": "Beynəlxalq elmi araşdırmalar",
                        "links": [
                              {
                                    "label": "Birgə elmi konfranslar",
                                    "url": "#"
                              },
                              {
                                    "label": "Qrant layihələri",
                                    "url": "#"
                              }
                        ]
                  }
            ]
      }
],
  ustMenyu: [
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
                                    "url": "#"
                              },
                              {
                                    "label": "Regional və beynəlxalq nümayəndəliklər",
                                    "url": "#"
                              },
                              {
                                    "label": "Məzunların mentorluq proqramı",
                                    "url": "#"
                              },
                              {
                                    "label": "Məzunlar-işəgötürənlər şəbəkəsi",
                                    "url": "#"
                              }
                        ]
                  },
                  {
                        "title": "Karyera və inkişaf",
                        "links": [
                              {
                                    "label": "Vakansiyalar",
                                    "url": "#"
                              },
                              {
                                    "label": "Məzunlar üçün təkmilləşdirmə",
                                    "url": "#"
                              },
                              {
                                    "label": "Karyera hekayələri",
                                    "url": "#"
                              },
                              {
                                    "label": "Elm-təhsil-istehsalat platforması",
                                    "url": "#"
                              },
                              {
                                    "label": "Diskussiya klubu",
                                    "url": "#"
                              },
                              {
                                    "label": "Karyera sərgisi",
                                    "url": "#"
                              }
                        ]
                  },
                  {
                        "title": "Tədbirlər və layihələr",
                        "links": [
                              {
                                    "label": "Məzun günü",
                                    "url": "#"
                              },
                              {
                                    "label": "Peşəkar görüşlər",
                                    "url": "#"
                              },
                              {
                                    "label": "İnkişafa dəstək təşəbbüsləri",
                                    "url": "#"
                              },
                              {
                                    "label": "Məzun kartı",
                                    "url": "#"
                              },
                              {
                                    "label": "Məzunların rəyləri",
                                    "url": "#"
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
                                    "url": "#"
                              },
                              {
                                    "label": "Karyera bələdçisi",
                                    "url": "#"
                              },
                              {
                                    "label": "Fərdi konsultasiyalar",
                                    "url": "#"
                              },
                              {
                                    "label": "Tələbə portfolioları",
                                    "url": "#"
                              }
                        ]
                  },
                  {
                        "title": "İş və təcrübə imkanları",
                        "links": [
                              {
                                    "label": "Vakansiyalar",
                                    "url": "#"
                              },
                              {
                                    "label": "Təcrübə proqramları",
                                    "url": "#"
                              },
                              {
                                    "label": "Könüllü təcrübəçilik",
                                    "url": "#"
                              }
                        ]
                  },
                  {
                        "title": "İstehsalat ilə əlaqələr",
                        "links": [
                              {
                                    "label": "Korporativ tərəfdaşlar",
                                    "url": "#"
                              },
                              {
                                    "label": "Sərgilər və forumlar",
                                    "url": "#"
                              }
                        ]
                  },
                  {
                        "title": "Bacarıqların inkişafı",
                        "links": [
                              {
                                    "label": "Soft Skills təlimləri",
                                    "url": "#"
                              },
                              {
                                    "label": "Sertifikatlaşdırma dəstəyi",
                                    "url": "#"
                              },
                              {
                                    "label": "Master-klaslar",
                                    "url": "#"
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
                                    "url": "#"
                              },
                              {
                                    "label": "Əlavə təhsil",
                                    "url": "#"
                              },
                              {
                                    "label": "İnfrastruktur",
                                    "url": "#"
                              }
                        ]
                  }
            ]
      },
      {
            "label": "FAQ",
            "order": 4,
            "url": "#",
            "groups": []
      },
      {
            "label": "Əlaqə",
            "order": 5,
            "url": "#",
            "groups": []
      }
],
  eAkademiya: {
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
                  "url": "#",
                  "icon": "books"
            },
            {
                  "label": "Sertifikatlar",
                  "description": "STCW & Təlim mərkəzi",
                  "url": "#",
                  "icon": "certificate"
            }
      ]
},
  istifadeciQruplari: [
      {
            "label": "Abituriyentlər",
            "url": "#"
      },
      {
            "label": "Tələbələr",
            "url": "#"
      },
      {
            "label": "Məzunlar",
            "url": "#"
      },
      {
            "label": "Əməkdaşlar",
            "url": "#"
      },
      {
            "label": "Beynəlxalq tələbələr",
            "url": "#"
      },
      {
            "label": "Valideynlər",
            "url": "#"
      }
],
  suretliKecidler: [
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
            "url": "#",
            "icon": "books"
      },
      {
            "label": "Dərs cədvəli",
            "url": "#",
            "icon": "calendar"
      },
      {
            "label": "Karyera Mərkəzi",
            "url": "#",
            "icon": "briefcase"
      },
      {
            "label": "Əlaqə",
            "url": "#",
            "icon": "mail"
      }
],
  footerMenyusu: [
      {
            "title": "Akademiya",
            "links": [
                  {
                        "label": "Haqqımızda",
                        "url": "#"
                  },
                  {
                        "label": "Rəhbərlik",
                        "url": "#"
                  },
                  {
                        "label": "Struktur",
                        "url": "#"
                  },
                  {
                        "label": "Tarix",
                        "url": "#"
                  },
                  {
                        "label": "Akkreditasiya",
                        "url": "#"
                  }
            ]
      },
      {
            "title": "Qəbul",
            "links": [
                  {
                        "label": "Bakalavr qəbulu",
                        "url": "#"
                  },
                  {
                        "label": "Magistratura qəbulu",
                        "url": "#"
                  },
                  {
                        "label": "Onlayn müraciət",
                        "url": "#"
                  },
                  {
                        "label": "Qəbul şərtləri",
                        "url": "#"
                  }
            ]
      },
      {
            "title": "Təhsil",
            "links": [
                  {
                        "label": "Bakalavriat",
                        "url": "#"
                  },
                  {
                        "label": "Magistratura",
                        "url": "#"
                  },
                  {
                        "label": "Qiyabi təhsil",
                        "url": "#"
                  },
                  {
                        "label": "İxtisaslar",
                        "url": "#"
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
                        "url": "#"
                  },
                  {
                        "label": "Tələbə həyatı",
                        "url": "#"
                  },
                  {
                        "label": "Beynəlxalq əməkdaşlıq",
                        "url": "#"
                  },
                  {
                        "label": "Xəbərlər",
                        "url": "#"
                  },
                  {
                        "label": "Kampus",
                        "url": "#"
                  }
            ]
      }
],
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
      if (!hasData) {
        if (existing) {
          await strapi.documents(uid).update({ documentId: existing.documentId, data: SEED as never, locale: 'az' });
        } else {
          await strapi.documents(uid).create({ data: SEED as never, locale: 'az' });
        }
        strapi.log.info('[seed] Menyu dolduruldu (esas 6 + ust 5 + portal + qruplar + suretli + footer).');
      } else {
        strapi.log.info('[seed] Menyu artiq doludur, otulur.');
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
  },
};
