import type { Core } from '@strapi/strapi';

/**
 * ADDA — bootstrap seed.
 * Seed datası bu faylın içindədir (Strapi ayrı alt-qovluqları compile etmir).
 * İlk işə düşəndə (baza boşdursa) naviqasiya + sürətli keçidlər doldurulur.
 * Admin bundan sonra Content Manager-dən redaktə/sıralayır.
 */

interface SeedLink { label: string; url: string; }
interface SeedGroup { title: string; links: SeedLink[]; }
interface SeedCategory { label: string; order: number; url: string; groups: SeedGroup[]; }
interface SeedQuick { label: string; url: string; icon: string; order: number; }

const MENU: SeedCategory[] = [
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
            "label": "Dənizçilik qanunvericiliyi",
            "url": "#"
          },
          {
            "label": "Beynəlxalq standartlar (IMO/STCW)",
            "url": "#"
          }
        ]
      },
      {
        "title": "Keyfiyyətin qiymətləndirilməsi",
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
        "title": "Tədqiqat mərkəzləri",
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
            "label": "Konvensiyalar fondu",
            "url": "#"
          },
          {
            "label": "Tərəfdaş kitabxanalar",
            "url": "#"
          }
        ]
      },
      {
        "title": "Doktorantura və elmi kadrlar",
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
          }
        ]
      }
    ]
  },
  {
    "label": "Məzunlar",
    "order": 5,
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
            "label": "Mentorluq proqramı",
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
    "label": "Tələbə həyatı",
    "order": 6,
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
    "label": "Karyera",
    "order": 7,
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
    "label": "Beynəlxalq əlaqələr",
    "order": 8,
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
        "title": "Beynəlxalq assosiasiyalar",
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
];

const QUICK_LINKS: SeedQuick[] = [
  {
    "label": "Tələbə kabineti",
    "url": "#",
    "icon": "device-laptop",
    "order": 1
  },
  {
    "label": "Elektron jurnal",
    "url": "#",
    "icon": "notebook",
    "order": 2
  },
  {
    "label": "E-Kitabxana",
    "url": "#",
    "icon": "books",
    "order": 3
  },
  {
    "label": "Dərs cədvəli",
    "url": "#",
    "icon": "calendar",
    "order": 4
  },
  {
    "label": "Karyera Mərkəzi",
    "url": "#",
    "icon": "briefcase",
    "order": 5
  },
  {
    "label": "Əlaqə",
    "url": "#",
    "icon": "mail",
    "order": 6
  }
];

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // ── Lokallar (az/ru/en) mövcud olsun ──
    try {
      const localesService = strapi.plugin('i18n').service('locales') as {
        find: () => Promise<Array<{ code: string }>>;
        create: (d: { code: string; name: string }) => Promise<unknown>;
      };
      const existing = await localesService.find();
      const codes = new Set((existing || []).map((l) => l.code));
      const wanted: Array<[string, string]> = [
        ['az', 'Azərbaycan (az)'],
        ['ru', 'Русский (ru)'],
        ['en', 'English (en)'],
      ];
      for (const [code, name] of wanted) {
        if (!codes.has(code)) await localesService.create({ code, name });
      }
    } catch (err) {
      strapi.log.warn('[seed] locale ensure skipped: ' + (err as Error).message);
    }

    // ── Menyu kateqoriyaları (yalnız baza boşdursa) ──
    try {
      const count = await strapi.documents('api::menu-category.menu-category').count({});
      if (count === 0) {
        strapi.log.info('[seed] Menyu kateqoriyalari yaradilir...');
        for (const cat of MENU) {
          await strapi.documents('api::menu-category.menu-category').create({
            data: {
              label: cat.label,
              order: cat.order,
              url: cat.url,
              groups: cat.groups.map((g) => ({
                title: g.title,
                links: g.links.map((l) => ({ label: l.label, url: l.url })),
              })),
              locale: 'az',
            },
          });
        }
        strapi.log.info(`[seed] ${MENU.length} menyu kateqoriyasi yaradildi.`);
      }
    } catch (err) {
      strapi.log.error('[seed] menu-category xetasi: ' + (err as Error).message);
    }

    // ── Sürətli keçidlər (yalnız baza boşdursa) ──
    try {
      const qCount = await strapi.documents('api::quick-link.quick-link').count({});
      if (qCount === 0) {
        for (const q of QUICK_LINKS) {
          await strapi.documents('api::quick-link.quick-link').create({
            data: { label: q.label, url: q.url, icon: q.icon, order: q.order, locale: 'az' },
          });
        }
        strapi.log.info(`[seed] ${QUICK_LINKS.length} suretli kecid yaradildi.`);
      }
    } catch (err) {
      strapi.log.error('[seed] quick-link xetasi: ' + (err as Error).message);
    }
  },
};