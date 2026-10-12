/**
 * F5.49 — GIZ EasTnT istinadlarının səhifələrdən çıxarılması: düzəliş siyahısı.
 * AVTOMATİK YARADILIB (scratchpad gen-giz-data.cjs): F5.48-in (c0bd1c1) məzmun
 * modulları ilə yeni modulların fərqi. Əl ilə redaktə etmə — məzmun faylını
 * dəyiş və siyahını yenidən yarat. Tətbiq: src/utils/giz-clean.ts.
 */
export interface GizTextFix { field: 'title' | 'lead' | 'seoDescription' | 'stepsTitle' | 'contact'; from: string; to: string }
export interface GizLineFix { from: string; to: string | null }
export interface GizCompFix { component: 'facts' | 'steps' | 'faq' | 'sideLinks'; key: string; from: string; to: string }
export interface GizFix { slug: string; locale: 'az' | 'en' | 'ru'; text: GizTextFix[]; body: GizLineFix[]; comp: GizCompFix[] }

export const GIZ_FIXES: GizFix[] = [
  {
    slug: "elmi-tedqiqat-fealiyyeti",
    locale: "az",
    text: [],
    body: [
      {
        from: "- **GIZ EasTnT** — anlaşma memorandumu: gənc tədqiqatçılar üçün təqaüd və qrant imkanları, xarici mütəxəssislərin mühazirələri ([xəbər](/xeberler/adda-ve-giz-eastnt-arasinda-emekdasliga-dair-anlasma-memorandumu-imzalandi)).",
        to: null
      }
    ],
    comp: []
  },
  {
    slug: "elmi-tedqiqat-fealiyyeti",
    locale: "en",
    text: [],
    body: [
      {
        from: "- **GIZ EasTnT** — memorandum of understanding: scholarships and grants for young researchers, lectures by foreign experts.",
        to: null
      }
    ],
    comp: []
  },
  {
    slug: "elmi-tedqiqat-fealiyyeti",
    locale: "ru",
    text: [],
    body: [
      {
        from: "- **GIZ EasTnT** — меморандум о взаимопонимании: стипендии и гранты для молодых исследователей, лекции зарубежных специалистов.",
        to: null
      }
    ],
    comp: []
  },
  {
    slug: "genc-alimler-surasi",
    locale: "az",
    text: [],
    body: [
      {
        from: "- GIZ EasTnT ilə anlaşma memorandumu — gənc tədqiqatçılar üçün təqaüd və qrant imkanlarının artırılması, Almaniya və digər ölkələrdən mütəxəssislərin mühazirələri ([xəbər](/xeberler/adda-ve-giz-eastnt-arasinda-emekdasliga-dair-anlasma-memorandumu-imzalandi));",
        to: null
      }
    ],
    comp: [
      {
        component: "steps",
        key: "body",
        from: "Azərbaycan Elm Fondunun müsabiqələri; GIZ EasTnT ilə memorandum gənc tədqiqatçılar üçün təqaüd və qrant imkanlarını nəzərdə tutur.",
        to: "Azərbaycan Elm Fondunun müsabiqələri, tərəfdaş universitetlərlə mübadilə və xaricdə təhsil proqramları."
      }
    ]
  },
  {
    slug: "genc-alimler-surasi",
    locale: "en",
    text: [],
    body: [
      {
        from: "- the memorandum of understanding with GIZ EasTnT — more scholarships and grants for young researchers, lectures by experts from Germany and other countries;",
        to: null
      }
    ],
    comp: [
      {
        component: "steps",
        key: "body",
        from: "Azerbaijan Science Foundation competitions; the memorandum with GIZ EasTnT provides for scholarships and grants for young researchers.",
        to: "Azerbaijan Science Foundation competitions, exchanges with partner universities and study-abroad programmes."
      }
    ]
  },
  {
    slug: "genc-alimler-surasi",
    locale: "ru",
    text: [],
    body: [
      {
        from: "- меморандум о взаимопонимании с GIZ EasTnT — расширение стипендий и грантов для молодых исследователей, лекции специалистов из Германии и других стран;",
        to: null
      }
    ],
    comp: [
      {
        component: "steps",
        key: "body",
        from: "Конкурсы Научного фонда Азербайджана; меморандум с GIZ EasTnT предусматривает стипендии и гранты для молодых исследователей.",
        to: "Конкурсы Научного фонда Азербайджана, обмен с университетами-партнёрами и программы обучения за рубежом."
      }
    ]
  },
  {
    slug: "qrantlar",
    locale: "az",
    text: [],
    body: [
      {
        from: "- **GIZ EasTnT** — anlaşma memorandumu: gənc tədqiqatçılar üçün təqaüd və qrant imkanlarının artırılması, Almaniya və digər ölkələrdən mütəxəssislərin mühazirələri ([xəbər](/xeberler/adda-ve-giz-eastnt-arasinda-emekdasliga-dair-anlasma-memorandumu-imzalandi)).",
        to: null
      }
    ],
    comp: [
      {
        component: "faq",
        key: "answer",
        from: "GIZ EasTnT ilə memorandum gənc tədqiqatçılar üçün təqaüd və qrant imkanlarının artırılmasını nəzərdə tutur. Elanları izləyin və şöbə ilə əlaqə saxlayın.",
        to: "Bəli: tələbə və gənc tədqiqatçıların elmi-texniki konfransı, akademik yazı təlimi, mübadilə və xaricdə təhsil proqramları — «Gənc alimlər və tədqiqatçılar» səhifəsində. Elanları izləyin və şöbə ilə əlaqə saxlayın."
      }
    ]
  },
  {
    slug: "qrantlar",
    locale: "en",
    text: [],
    body: [
      {
        from: "- **GIZ EasTnT** — memorandum of understanding: more scholarships and grants for young researchers, lectures by experts from Germany and other countries.",
        to: null
      }
    ],
    comp: []
  },
  {
    slug: "qrantlar",
    locale: "ru",
    text: [],
    body: [
      {
        from: "- **GIZ EasTnT** — меморандум о взаимопонимании: расширение стипендий и грантов для молодых исследователей, лекции специалистов из Германии и других стран.",
        to: null
      }
    ],
    comp: []
  },
  {
    slug: "xaricde-tehsil-ve-ixtisasartirma",
    locale: "az",
    text: [],
    body: [
      {
        from: "- [GIZ EasTnT](/xeberler/adda-ve-giz-eastnt-arasinda-emekdasliga-dair-anlasma-memorandumu-imzalandi)",
        to: null
      }
    ],
    comp: []
  },
  {
    slug: "beynelxalq-emekdasliq",
    locale: "az",
    text: [
      {
        field: "seoDescription",
        from: "ADDA-nın beynəlxalq əməkdaşlığı: IAMU üzvlüyü, 11 ölkənin tərəfdaş universitetləri, 2025–2026 memorandumları, Erasmus+, ikili diplom, əcnəbi tələbələr.",
        to: "ADDA-nın beynəlxalq əməkdaşlığı: IAMU üzvlüyü, 11 ölkənin tərəfdaş universitetləri, 2026 memorandumları, Erasmus+, ikili diplom, əcnəbi tələbələr."
      }
    ],
    body: [
      {
        from: "## 2025–2026: yeni anlaşmalar",
        to: "## 2026: yeni anlaşmalar"
      },
      {
        from: "| 25.11.2025 | GIZ EasTnT (Almaniya) | tələbə və əməkdaş mübadiləsi, beynəlxalq təcrübə, birgə tədqiqat, gənc tədqiqatçılara qrantlar ([xəbər](/xeberler/adda-ve-giz-eastnt-arasinda-emekdasliga-dair-anlasma-memorandumu-imzalandi)) |",
        to: null
      }
    ],
    comp: [
      {
        component: "facts",
        key: "label",
        from: "Memorandum (noyabr 2025 – iyul 2026)",
        to: "Memorandum (yanvar–iyul 2026)"
      },
      {
        component: "facts",
        key: "value",
        from: "6",
        to: "5"
      }
    ]
  },
  {
    slug: "beynelxalq-emekdasliq",
    locale: "en",
    text: [
      {
        field: "seoDescription",
        from: "International cooperation at ADDA: IAMU membership, partner universities in 11 countries, 2025–2026 agreements, Erasmus+, double degrees, international students.",
        to: "International cooperation at ADDA: IAMU membership, partner universities in 11 countries, 2026 agreements, Erasmus+, double degrees, international students."
      }
    ],
    body: [
      {
        from: "## New agreements, 2025–2026",
        to: "## New agreements, 2026"
      },
      {
        from: "| 25.11.2025 | GIZ EasTnT (Germany) | student and staff exchange, international internships, joint research, grants for young researchers ([news](/az/xeberler/adda-ve-giz-eastnt-arasinda-emekdasliga-dair-anlasma-memorandumu-imzalandi)) |",
        to: null
      }
    ],
    comp: [
      {
        component: "facts",
        key: "label",
        from: "Agreements (Nov 2025 – Jul 2026)",
        to: "Agreements (Jan–Jul 2026)"
      },
      {
        component: "facts",
        key: "value",
        from: "6",
        to: "5"
      }
    ]
  },
  {
    slug: "beynelxalq-emekdasliq",
    locale: "ru",
    text: [
      {
        field: "seoDescription",
        from: "Международное сотрудничество АГМА: членство в IAMU, вузы-партнёры из 11 стран, соглашения 2025–2026 годов, Erasmus+, двойной диплом, иностранные студенты.",
        to: "Международное сотрудничество АГМА: членство в IAMU, вузы-партнёры из 11 стран, соглашения 2026 года, Erasmus+, двойной диплом, иностранные студенты."
      }
    ],
    body: [
      {
        from: "## Новые соглашения 2025–2026 годов",
        to: "## Новые соглашения 2026 года"
      },
      {
        from: "| 25.11.2025 | GIZ EasTnT (Германия) | обмен студентами и сотрудниками, международные стажировки, совместные исследования, гранты молодым исследователям ([новость](/az/xeberler/adda-ve-giz-eastnt-arasinda-emekdasliga-dair-anlasma-memorandumu-imzalandi)) |",
        to: null
      }
    ],
    comp: [
      {
        component: "facts",
        key: "label",
        from: "Меморандумы (ноябрь 2025 – июль 2026)",
        to: "Меморандумы (январь–июль 2026)"
      },
      {
        component: "facts",
        key: "value",
        from: "6",
        to: "5"
      }
    ]
  },
  {
    slug: "akademik-terefdaslar",
    locale: "az",
    text: [],
    body: [
      {
        from: "- **GIZ EasTnT (Almaniya)** — mübadilə, beynəlxalq təcrübə, birgə tədqiqat, gənc tədqiqatçılara qrantlar ([xəbər](/xeberler/adda-ve-giz-eastnt-arasinda-emekdasliga-dair-anlasma-memorandumu-imzalandi)).",
        to: null
      }
    ],
    comp: []
  },
  {
    slug: "akademik-terefdaslar",
    locale: "en",
    text: [],
    body: [
      {
        from: "- **GIZ EasTnT (Germany)** — exchanges, international internships, joint research, grants for young researchers ([news](/az/xeberler/adda-ve-giz-eastnt-arasinda-emekdasliga-dair-anlasma-memorandumu-imzalandi)).",
        to: null
      }
    ],
    comp: []
  },
  {
    slug: "akademik-terefdaslar",
    locale: "ru",
    text: [],
    body: [
      {
        from: "- **GIZ EasTnT (Германия)** — обмены, международные стажировки, совместные исследования, гранты молодым исследователям ([новость](/az/xeberler/adda-ve-giz-eastnt-arasinda-emekdasliga-dair-anlasma-memorandumu-imzalandi)).",
        to: null
      }
    ],
    comp: []
  },
  {
    slug: "mobillik-ve-mubadile",
    locale: "az",
    text: [],
    body: [
      {
        from: "- GIZ EasTnT — Almaniya və digər ölkələrin universitetləri ilə tələbə və əməkdaş mübadiləsi, beynəlxalq təcrübə, gənc tədqiqatçılara qrantlar ([xəbər](/xeberler/adda-ve-giz-eastnt-arasinda-emekdasliga-dair-anlasma-memorandumu-imzalandi)).",
        to: null
      }
    ],
    comp: []
  },
  {
    slug: "mobillik-ve-mubadile",
    locale: "en",
    text: [],
    body: [
      {
        from: "- GIZ EasTnT — student and staff exchange with universities in Germany and other countries, international internships, grants for young researchers ([news](/az/xeberler/adda-ve-giz-eastnt-arasinda-emekdasliga-dair-anlasma-memorandumu-imzalandi)).",
        to: null
      }
    ],
    comp: []
  },
  {
    slug: "mobillik-ve-mubadile",
    locale: "ru",
    text: [],
    body: [
      {
        from: "- GIZ EasTnT — обмен студентами и сотрудниками с университетами Германии и других стран, международные стажировки, гранты молодым исследователям ([новость](/az/xeberler/adda-ve-giz-eastnt-arasinda-emekdasliga-dair-anlasma-memorandumu-imzalandi)).",
        to: null
      }
    ],
    comp: []
  }
];
