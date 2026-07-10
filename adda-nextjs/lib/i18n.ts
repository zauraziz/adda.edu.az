// i18n — locale idarəetməsi + statik UI mətnlərinin tərcüməsi.
// Yanaşma: uzun/fərqli az sətirləri ru/en ilə əvəz olunur (unikal, təhlükəsiz).
// Tərcüməsi olmayan sətirlər az qalır (fallback). Placeholder tərcümələr — sonra dəqiqləşdiriləcək.

export type Locale = 'az' | 'ru' | 'en';
export const LOCALES: Locale[] = ['az', 'ru', 'en'];
export const DEFAULT_LOCALE: Locale = 'az';

export function isLocale(x: string): x is Locale {
  return (LOCALES as string[]).includes(x);
}

// [az, ru, en] — yalnız unikal, uzun sətirlər (qısa/ambiqu sözlər DAXİL EDİLMİR).
const T: Array<[string, string, string]> = [
  // Hero
  ['Firuzəyi üfüqlərə açılan rəqəmsal təhsil. Beynəlxalq STCW standartları, canlı simulyasiya mühiti və qlobal karyera trayektoriyası.',
   'Цифровое образование, открывающее бирюзовые горизонты. Международные стандарты STCW, среда живой симуляции и глобальная карьерная траектория.',
   'Digital education opening turquoise horizons. International STCW standards, a live simulation environment and a global career trajectory.'],
  ['Daxil ol', 'Войти', 'Enter'],
  ['Qəbul — 2026', 'Приём — 2026', 'Admission — 2026'],
  ['hover → keçid', 'наведите → переход', 'hover → link'],
  ['Aşağı', 'Вниз', 'Scroll'],
  // Spotlight
  ['Niyə məhz ADDA?', 'Почему именно ADDA?', 'Why ADDA?'],
  ['Xəzərin sahilində, 1881-ci ilə uzanan dənizçilik təhsili ənənəsi üzərində qurulmuş müasir akademiya.',
   'Современная академия на берегу Каспия, построенная на традиции морского образования, восходящей к 1881 году.',
   'A modern academy on the Caspian shore, built on a maritime education tradition dating back to 1881.'],
  ['1881-dən gələn ənənə', 'Традиция с 1881 года', 'Tradition since 1881'],
  ['STCW standartlı hazırlıq', 'Подготовка по стандарту STCW', 'STCW-standard training'],
  ['Tam missiya simulyatorları', 'Полномиссионные симуляторы', 'Full-mission simulators'],
  ['Dənizdə real təcrübə', 'Реальная практика на море', 'Real experience at sea'],
  ['Beynəlxalq tələbə dəstəyi', 'Поддержка иностранных студентов', 'International student support'],
  ['Karyera perspektivi', 'Карьерная перспектива', 'Career prospects'],
  ['Sən də ADDA ailəsinə qoşul:', 'Присоединяйся к семье ADDA:', 'Join the ADDA family:'],
  ['Abituriyent qəbulu', 'Приём абитуриентов', 'Applicant admission'],
  // Stats
  ['Rəqəmlərlə ADDA', 'ADDA в цифрах', 'ADDA in numbers'],
  ['Ənənə, beynəlxalq standart və real nəticə: akademiyanın bugünkü potensialının rəqəmsal mənzərəsi.',
   'Традиция, международный стандарт и реальный результат: цифровая картина сегодняшнего потенциала академии.',
   'Tradition, international standard and real results: a digital picture of the academy\u2019s potential today.'],
  ['Dünya donanmalarında xidmət edən peşəkar dənizçilər nəsli.', 'Поколение профессиональных моряков, служащих во флотах мира.', 'A generation of professional seafarers serving in the world\u2019s fleets.'],
  ['STCW tələblərinə uyğun verilmiş peşə sənədləri.', 'Профессиональные документы, выданные согласно требованиям STCW.', 'Professional certificates issued per STCW requirements.'],
  ['Körpü və maşın otağı üzrə real təlim ssenariləri.', 'Реальные учебные сценарии для мостика и машинного отделения.', 'Real training scenarios for the bridge and engine room.'],
  ['Universitetlər və aparıcı gəmiçilik şirkətləri ilə əməkdaşlıq.', 'Сотрудничество с университетами и ведущими судоходными компаниями.', 'Collaboration with universities and leading shipping companies.'],
  ['Bakalavriat və magistratura pillələri üzrə seçim.', 'Выбор на уровнях бакалавриата и магистратуры.', 'Choice across bachelor\u2019s and master\u2019s levels.'],
  ['Son buraxılış məzunlarının məşğulluq göstəricisi.', 'Показатель трудоустройства последних выпускников.', 'Employment rate of recent graduates.'],
  // News
  ['İnformasiya mərkəzi', 'Информационный центр', 'Information centre'],
  ['Bütün xəbərlər', 'Все новости', 'All news'],
  ['Elan və tədbirlər', 'Объявления и события', 'Announcements & events'],
  // Campus
  ['Kampus həyatı', 'Жизнь кампуса', 'Campus life'],
  ['Dərs cədvəli bitəndə ADDA bitmir. Dəniz klubundan innovasiya məkanına, idmandan yaradıcılığa — kampus gündəlik yaşayan bir ekosistemdir.',
   'ADDA не заканчивается с расписанием занятий. От морского клуба до пространства инноваций, от спорта до творчества — кампус живёт каждый день.',
   'ADDA doesn\u2019t end when classes do. From the sea club to the innovation space, from sport to creativity — the campus lives every day.'],
  ['Kampus turuna qoşul', 'Присоединиться к туру по кампусу', 'Join the campus tour'],
  ['360° virtual tur', '360° виртуальный тур', '360° virtual tour'],
  ['Klublar və dərnəklər', 'Клубы и кружки', 'Clubs & societies'],
  ['Kampusda yaşam', 'Проживание в кампусе', 'Living on campus'],
  ['İnnovasiya məkanı', 'Пространство инноваций', 'Innovation space'],
  ['Rifah və dəstək', 'Благополучие и поддержка', 'Wellbeing & support'],
  ['Tədbir təqvimi', 'Календарь событий', 'Events calendar'],
  ['Qlobal icma', 'Глобальное сообщество', 'Global community'],
  // Intl
  ['Beynəlxalq əməkdaşlıq və nüfuz', 'Международное сотрудничество и авторитет', 'International cooperation & standing'],
  ['ADDA 5 qitədə 47-dən çox universitet, dənizçilik akademiyası və beynəlxalq qurumla əməkdaşlıq edir.',
   'ADDA сотрудничает с более чем 47 университетами, морскими академиями и международными организациями на 5 континентах.',
   'ADDA cooperates with more than 47 universities, maritime academies and international organisations across 5 continents.'],
  ['Partnyorluq təklifi', 'Предложение о партнёрстве', 'Partnership proposal'],
  ['Mübadilə proqramları', 'Программы обмена', 'Exchange programmes'],
  ['Sürüşdür və fırlat', 'Тяните и вращайте', 'Drag to rotate'],
  ['Tərəfdaş şəhər', 'Город-партнёр', 'Partner city'],
  ['Etibar şəbəkəsi', 'Сеть доверия', 'Network of trust'],
  // Social
  ['ADDA sosial şəbəkələrdə', 'ADDA в социальных сетях', 'ADDA on social media'],
  ['Tələbələrimizin gözü ilə ADDA: dəniz klubundan yataqxana axşamlarına, simulyator gecələrindən beynəlxalq görüşlərə.',
   'ADDA глазами наших студентов: от морского клуба до вечеров в общежитии, от ночей на симуляторе до международных встреч.',
   'ADDA through our students\u2019 eyes: from the sea club to dorm evenings, from simulator nights to international meetups.'],
  // Footer
  ['ADDA-nı yaşa', 'Живи ADDA', 'Live ADDA'],
  ['Xəbərlərə abunə olun', 'Подпишитесь на новости', 'Subscribe to news'],
  ['Qəbul elanları, tədbirlər və akademiya yenilikləri — birbaşa e-poçtunuza.',
   'Объявления о приёме, события и новости академии — прямо на вашу почту.',
   'Admission announcements, events and academy news — straight to your inbox.'],
  ['Abunə ol', 'Подписаться', 'Subscribe'],
  ['Rəsmi qurumlar', 'Официальные учреждения', 'Official institutions'],
  ['Bütün hüquqlar qorunur.', 'Все права защищены.', 'All rights reserved.'],
  ['Məxfilik siyasəti', 'Политика конфиденциальности', 'Privacy policy'],
  ['İstifadə şərtləri', 'Условия использования', 'Terms of use'],
  ['Korporativ stil', 'Фирменный стиль', 'Brand guidelines'],
  ['Rektorla əlaqə', 'Связь с ректором', 'Contact the rector'],
  ['Xəbərlər, elanlar', 'Новости, объявления', 'News, announcements'],
  ['və tədbirlər', 'и события', '& events'],
];

/** MARKUP-dakı statik az mətnləri aktiv dilə çevirir (yalnız lüğətdəki unikal sətirlər). */
export function translateStatic(html: string, locale: Locale): string {
  if (locale === 'az') return html;
  const idx = locale === 'ru' ? 1 : 2;
  const rows = [...T].sort((a, b) => b[0].length - a[0].length);
  for (const row of rows) {
    const to = row[idx];
    if (to && html.includes(row[0])) html = html.split(row[0]).join(to);
  }
  return html;
}
