/**
 * F5.60 — «gündə iki dəfə yemək» və «pulsuz yemək» ifadələri saytdan çıxır (Zaur müəllim,
 * 29.10.2026: «saytda hər yerdən gündə iki dəfə yemək və pulsuz yemək ifadələrini yığışdır»).
 *
 * Mənbə: prod-un ictimai API-si (29.10.2026) — səhifələr (F5.48 «Təqaüd və sosial dəstək»,
 * «Tələbə həyatı», F5.49 FAQ), köhnə saytdan gələn 31 xəbər və 2 elan. Hər cüt DƏQİQ
 * mətndir: redaktor cümləni dəyişibsə toxunulmur, qalıq logda (meal-text.ts → MEAL_RE).
 * Cümlə bütöv silinəndə ardınca gələn boşluq da silinir; qalan cümlə qrammatik qalır
 * («…geyim forması və dərs vəsaitləri ilə təmin olunurlar»).
 *
 * Toxunulmayanlar (yemək haqqında, amma pulsuz yemək iddiası deyil): «isti yemək xidmətinin
 * satın alınması» elanı, açıq qapı günündə «yeməkxanada nahar», kollecin Nizamnaməsində
 * «iaşə xidmətini təşkil etmək» (rəsmi mətn).
 */

export interface TextPair {
  find: string;
  replace: string;
}

/** Səhifələrin mətn sahələri və komponentləri (suallar, faktlar, addımlar) — az, ru, en. */
export const PAGE_PAIRS: TextPair[] = [
  // «Təqaüd və sosial dəstək» (sosial-teminat-ve-maddi-yardim)
  { find: '- gündə iki dəfə yemək;\n', replace: '' },
  { find: 'geyim forması, dərs vəsaitləri və gündə iki dəfə yeməklə ödənişsiz', replace: 'geyim forması və dərs vəsaitləri ilə ödənişsiz' },
  { find: 'ödənişsiz forma, dərslik və yemək, yataqxana', replace: 'ödənişsiz forma və dərslik, yataqxana' },
  { find: 'ödənişsizdir; gündə iki dəfə yemək verilir.', replace: 'ödənişsizdir.' },
  { find: '- двухразовое питание;\n', replace: '' },
  { find: 'формой, учебными пособиями и двухразовым питанием, общежитием', replace: 'формой и учебными пособиями, общежитием' },
  { find: 'бесплатные форма, учебники и питание, общежитие', replace: 'бесплатные форма и учебники, общежитие' },
  { find: 'бесплатны, предоставляется двухразовое питание.', replace: 'бесплатны.' },
  { find: '- two meals a day;\n', replace: '' },
  { find: 'uniforms, textbooks and two meals a day free of charge', replace: 'uniforms and textbooks free of charge' },
  { find: 'free uniform, textbooks and meals, residence hall', replace: 'free uniform and textbooks, residence hall' },
  { find: 'free of charge, and two meals a day are provided.', replace: 'free of charge.' },
  // «Tələbə həyatı» (telebe-heyati): mətn və fakt
  { find: 'yay və qış geyim forması, dərs vəsaitləri və gündə iki dəfə yemək ([xəbər]', replace: 'yay və qış geyim forması və dərs vəsaitləri ([xəbər]' },
  { find: 'летняя и зимняя форма, учебные пособия и двухразовое питание ([новость]', replace: 'летняя и зимняя форма и учебные пособия ([новость]' },
  { find: 'summer and winter uniforms, textbooks and two meals a day ([news]', replace: 'summer and winter uniforms and textbooks ([news]' },
  { find: 'Forma, dərslik, yemək', replace: 'Forma və dərslik' },
  { find: 'Форма, учебники, питание', replace: 'Форма и учебники' },
  { find: 'Uniform, textbooks, meals', replace: 'Uniform and textbooks' },
  // «Tez-tez verilən suallar» (faq)
  { find: 'Yay və qış geyim forması, dərs vəsaitləri və gündə iki dəfə yemək.', replace: 'Yay və qış geyim forması və dərs vəsaitləri.' },
  { find: 'Летнюю и зимнюю форму, учебные пособия и двухразовое питание.', replace: 'Летнюю и зимнюю форму и учебные пособия.' },
  { find: 'Summer and winter uniforms, textbooks and two meals a day.', replace: 'Summer and winter uniforms and textbooks.' },
  // F3 seed (PAGES, köhnə quruluş) — yenidən qurulmamış bazada
  { find: '- Gündə iki dəfə yemək\n', replace: '' },
  { find: '- двухразовым питанием\n', replace: '' },
  { find: '- Two meals a day\n', replace: '' },
];

/** «Təqaüd və sosial dəstək» səhifəsinin fakt zolağı: bu faktlar silinir (dəqiq ad + dəyər). */
export const PAGE_FACT_DROP: { label: string; value: string }[] = [
  { label: 'Yemək', value: 'Gündə 2 dəfə' },
  { label: 'Питание', value: 'Два раза в день' },
  { label: 'Meals', value: 'Twice a day' },
];

/** Xəbər və elanlar (başlıq, qısa mətn, xülasə, mətn) — köhnə saytdan gələn mətnlər. */
export const NEWS_PAIRS: TextPair[] = [
  // xəbərlər (az)
  { find: 'geyim forması, gündə iki dəfə pulsuz isti yemək, bütün', replace: 'geyim forması, bütün' },
  { find: 'yataqxana, geyim forması və gündə 2 dəfə isti yeməklə pulsuz', replace: 'yataqxana və geyim forması ilə pulsuz' },
  { find: 'dərs vəsaitləri, gündə 2 dəfə isti yemək və yataqxana', replace: 'dərs vəsaitləri və yataqxana' },
  { find: 'yataqxana, gündə iki dəfə isti yemək, geyim forması', replace: 'yataqxana, geyim forması' },
  { find: 'Tələbələrə  pulsuz səhər və nahar yeməyi verilir. Onlar forma', replace: 'Tələbələr forma' },
  { find: 'pulsuz yataqxana və yeməklə təmin', replace: 'pulsuz yataqxana ilə təmin' },
  { find: 'Həftənin 5 tədris günü tələbələr ödənişsiz  yeməklə (səhər yeməyi və naharla) təmin olunurlar. ', replace: '' },
  { find: 'geyim forması, gündə iki dəfə pulsuz yeməklə təmin', replace: 'geyim forması ilə təmin' },
  { find: 'Gündə iki dəfə pulsuz yemək verilir. ', replace: '' },
  { find: 'yataqxana, geyim forması və gündə iki dəfə isti yeməklə pulsuz', replace: 'yataqxana və geyim forması ilə pulsuz' },
  { find: 'yataqxana, geyim forması və gündə iki dəfə isti yeməklə təmin', replace: 'yataqxana və geyim forması ilə təmin' },
  { find: 'geyim forması, dərs vəsaitləri, gündə 2 dəfə isti yeməklə ödənişsiz', replace: 'geyim forması və dərs vəsaitləri ilə ödənişsiz' },
  {
    find:
      'Akademiyamızın üstünlüyü ondan ibarətdir ki, biz tələbələrimizə gündə iki dəfə isti yemək veririk. ' +
      'Müəllim və professorlarımız da tələbələrlə eyni qazandan yemək yeyir. Bundan əlavə, biz tələbələrimizi',
    replace: 'Biz tələbələrimizi',
  },
  { find: 'Onlar da pulsuz yemək və geyimlə təmin olunurlar.', replace: 'Onlar da pulsuz geyimlə təmin olunurlar.' },
  { find: 'Pulsuz geyim forması, gündəlik pulsuz yemək, ən güzəştli', replace: 'Pulsuz geyim forması, ən güzəştli' },
  { find: 'pulsuz geyim forması, dərs vəsaiti, gündə iki dəfə yeməklə təmin', replace: 'pulsuz geyim forması və dərs vəsaiti ilə təmin' },
  { find: 'pulsuz dərs vəsaitləri, geyim forması və gündə 2 dəfə isti yeməklə təmin', replace: 'pulsuz dərs vəsaitləri və geyim forması ilə təmin' },
  { find: 'pulsuz dərs vəsaitləri, geyim forması və gündə iki dəfə isti yeməklə təmin', replace: 'pulsuz dərs vəsaitləri və geyim forması ilə təmin' },
  // xəbər (ru, en) — «Açıq qapı günü» (2018)
  { find: 'общежитием, форменной одеждой и горячим двухразовым питанием', replace: 'общежитием и форменной одеждой' },
  { find: 'dormitory, uniforms and two hot meals a day', replace: 'dormitory and uniforms' },
  // elan «Diqqət! Diqqət!» (2019 qəbulu): az, ru
  { find: 'Yalnız bu  təhsil ocağının yeməkxanasında tələbələrə səhər və nahar yeməyi pulsuz verilir. ', replace: '' },
  { find: 'Только в столовой этого учебного заведения студентам предоставляется бесплатный завтрак и обед. ', replace: '' },
  {
    find: 'Форма одежды, учебные пособия и ежедневное двухразовое питание студентам предоставляется бесплатно.',
    replace: 'Форма одежды и учебные пособия студентам предоставляются бесплатно.',
  },
];

/**
 * Qalıq: düzəlişdən sonra hələ qalan «pulsuz/ödənişsiz yemək», «gündə iki dəfə yemək» və
 * tərcümələri (logda, admində əl ilə). Yeməkxana, iaşə, «isti yemək xidmətinin satın
 * alınması» buraya düşmür.
 */
export const MEAL_RE =
  /gündə\s+(?:iki|2)\s+dəfə[^.\n]{0,30}yem|(?:pulsuz|ödənişsiz)[^.\n]{0,40}yemək(?!xana)|yemək(?!xana)[^.\n]{0,40}(?:pulsuz|ödənişsiz)|səhər\s+və\s+nahar\s+yeməyi|двухразов\S*\s+питани|бесплатн\S*[^.\n]{0,30}(?:питани|завтрак)|two\s+(?:hot\s+)?meals|free\s+meals|meals\s+(?:are|is)\s+(?:provided|free)/i;
