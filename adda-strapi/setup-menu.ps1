# ADDA — 'Menyu' modeli (yenilenmis struktur). adda-strapi icinde islet.
$ErrorActionPreference = 'Stop'
$enc = New-Object System.Text.UTF8Encoding $false
function W($rel, $text) { $full = Join-Path $PWD $rel; New-Item -ItemType Directory -Force -Path (Split-Path $full) | Out-Null; [System.IO.File]::WriteAllText($full, $text, $enc) }

Remove-Item -Recurse -Force src\api\menu-category, src\api\quick-link, src\api\seed, src\seed -ErrorAction SilentlyContinue

W 'src\components\nav\link.json' @'
{
  "collectionName": "components_nav_links",
  "info": {
    "displayName": "Link",
    "icon": "link"
  },
  "options": {},
  "attributes": {
    "label": {
      "type": "string",
      "required": true
    },
    "url": {
      "type": "string",
      "default": "#"
    }
  }
}
'@

W 'src\components\nav\group.json' @'
{
  "collectionName": "components_nav_groups",
  "info": {
    "displayName": "Qrup",
    "icon": "bulletList"
  },
  "options": {},
  "attributes": {
    "title": {
      "type": "string",
      "required": true
    },
    "links": {
      "type": "component",
      "repeatable": true,
      "component": "nav.link"
    }
  }
}
'@

W 'src\components\nav\category.json' @'
{
  "collectionName": "components_nav_categorys",
  "info": {
    "displayName": "Əsas menyu kateqoriyası",
    "icon": "apps"
  },
  "options": {},
  "attributes": {
    "label": {
      "type": "string",
      "required": true
    },
    "order": {
      "type": "integer",
      "default": 0
    },
    "url": {
      "type": "string",
      "default": "#"
    },
    "groups": {
      "type": "component",
      "repeatable": true,
      "component": "nav.group"
    }
  }
}
'@

W 'src\components\nav\quicklink.json' @'
{
  "collectionName": "components_nav_quicklinks",
  "info": {
    "displayName": "Sürətli keçid",
    "icon": "bolt"
  },
  "options": {},
  "attributes": {
    "label": {
      "type": "string",
      "required": true
    },
    "url": {
      "type": "string",
      "default": "#"
    },
    "icon": {
      "type": "string"
    }
  }
}
'@

W 'src\components\nav\portalcard.json' @'
{
  "collectionName": "components_nav_portalcards",
  "info": {
    "displayName": "Panel kartı",
    "icon": "layoutGrid"
  },
  "options": {},
  "attributes": {
    "label": {
      "type": "string",
      "required": true
    },
    "description": {
      "type": "string"
    },
    "url": {
      "type": "string",
      "default": "#"
    },
    "icon": {
      "type": "string"
    }
  }
}
'@

W 'src\components\nav\portal.json' @'
{
  "collectionName": "components_nav_portals",
  "info": {
    "displayName": "E-Akademiya paneli",
    "icon": "dashboard"
  },
  "options": {},
  "attributes": {
    "title": {
      "type": "string"
    },
    "subtitle": {
      "type": "string"
    },
    "cards": {
      "type": "component",
      "repeatable": true,
      "component": "nav.portalcard"
    }
  }
}
'@

W 'src\components\nav\footercol.json' @'
{
  "collectionName": "components_nav_footercols",
  "info": {
    "displayName": "Footer sütunu",
    "icon": "layoutColumns"
  },
  "options": {},
  "attributes": {
    "title": {
      "type": "string",
      "required": true
    },
    "links": {
      "type": "component",
      "repeatable": true,
      "component": "nav.link"
    }
  }
}
'@

W 'src\api\menu\content-types\menu\schema.json' @'
{
  "kind": "singleType",
  "collectionName": "menus",
  "info": {
    "singularName": "menu",
    "pluralName": "menus",
    "displayName": "Menyu",
    "description": "Saytın bütün menyuları — Əsas, Üst, E-Akademiya, İstifadəçi qrupları, Sürətli keçidlər, Footer"
  },
  "options": {
    "draftAndPublish": false
  },
  "pluginOptions": {
    "i18n": {
      "localized": true
    }
  },
  "attributes": {
    "esasMenyu": {
      "type": "component",
      "repeatable": true,
      "component": "nav.category",
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "ustMenyu": {
      "type": "component",
      "repeatable": true,
      "component": "nav.category",
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "eAkademiya": {
      "type": "component",
      "repeatable": false,
      "component": "nav.portal",
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "istifadeciQruplari": {
      "type": "component",
      "repeatable": true,
      "component": "nav.link",
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "suretliKecidler": {
      "type": "component",
      "repeatable": true,
      "component": "nav.quicklink",
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    },
    "footerMenyusu": {
      "type": "component",
      "repeatable": true,
      "component": "nav.footercol",
      "pluginOptions": {
        "i18n": {
          "localized": true
        }
      }
    }
  }
}
'@

W 'src\index.ts' @'
import type { Core } from '@strapi/strapi';

/**
 * ADDA — "Menyu" single-type seed.
 * Boşdursa doldurur (Strapi single-type-da boş giriş avtomatik yaradır,
 * ona görə create yerinə "boşdursa update/create" məntiqi işlədilir).
 */

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

export default {
  register() {},

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
  },
};

'@

W 'src\api\menu\controllers\menu.ts' "import { factories } from '@strapi/strapi';`r`n`r`nexport default factories.createCoreController('api::menu.menu');`r`n"
W 'src\api\menu\routes\menu.ts'      "import { factories } from '@strapi/strapi';`r`n`r`nexport default factories.createCoreRouter('api::menu.menu');`r`n"
W 'src\api\menu\services\menu.ts'    "import { factories } from '@strapi/strapi';`r`n`r`nexport default factories.createCoreService('api::menu.menu');`r`n"

Write-Host ''
Write-Host 'Menyu modeli yenilendi (esas 6 kat + ust 5 kat + seed) OK' -ForegroundColor Green
Write-Host 'Indi: npm run develop'
