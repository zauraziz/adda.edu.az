import type { Locale } from './i18n';

export type HeroSlide = { img: string; kicker: string; title: string; lead: string; cta: string };

// Şəkillər dildən asılı deyil.
// QEYD: hazırda Unsplash stok şəkilləridir → Faza 5-də CMS/Cloudinary-ə keçirilməli.
const IMGS = [
  'https://images.unsplash.com/photo-1724597500306-a4cbb7d1324e?fm=jpg&q=82&w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1641467613990-b74163e280e3?fm=jpg&q=82&w=1920&h=1080&fit=crop',
  'https://images.unsplash.com/photo-1751779057940-43cc385452f7?fm=jpg&q=82&w=1920&h=1080&fit=crop',
];

type SlideText = Omit<HeroSlide, 'img'>;

// Slayd 0 — mövcud T tərcümələri (dəyişməyib, render ilə eynidir).
// Slayd 1-2 — QARALAMA tərcümə: əvvəl ui.js-də yalnız az var idi, ona görə
// /ru və /en-də hero 5 saniyədən sonra azərbaycancaya dönürdü. Redaktə üçün açıqdır.
// Üslub qeydi: mövcud ru tərcüməsi "STCW"-ni latın qrafikasında saxlayır →
// "GMDSS" də eyni prinsiplə saxlanılıb (ГМССБ yazılmayıb).
const TEXT: Record<Locale, SlideText[]> = {
  az: [
    {
      kicker: 'Azərbaycan Dövlət Dəniz Akademiyası',
      title: 'Gələcəyin <em>dənizçiliyi</em>',
      lead: 'Firuzəyi üfüqlərə açılan rəqəmsal təhsil. Beynəlxalq STCW standartları, canlı simulyasiya mühiti və qlobal karyera trayektoriyası.',
      cta: 'Daxil ol',
    },
    {
      kicker: 'Wärtsilä NTPRO təlim bazası',
      title: 'Simulyasiya <em>təcrübəsi</em>',
      lead: 'Kapitan körpüsü, GMDSS və mühərrik simulyatorlarında real ssenarilər. Nəzəriyyə deyil — yaşanan akademik təcrübə.',
      cta: 'Virtual tura başla',
    },
    {
      kicker: '47+ beynəlxalq tərəfdaş',
      title: 'Qlobal <em>üfüqlər</em>',
      lead: 'IAMU şəbəkəsi, mübadilə proqramları və dünya donanmalarına açılan karyera yolları.',
      cta: 'Tərəfdaşlara bax',
    },
  ],
  ru: [
    {
      kicker: 'Азербайджанская государственная морская академия',
      title: 'Морское дело <em>будущего</em>',
      lead: 'Цифровое образование, открывающее бирюзовые горизонты. Международные стандарты STCW, живая среда симуляции и глобальная карьерная траектория.',
      cta: 'Войти',
    },
    {
      kicker: 'Учебная база Wärtsilä NTPRO',
      title: 'Опыт <em>симуляции</em>',
      lead: 'Реальные сценарии на симуляторах капитанского мостика, GMDSS и машинного отделения. Не теория — живой академический опыт.',
      cta: 'Начать виртуальный тур',
    },
    {
      kicker: '47+ международных партнёров',
      title: 'Глобальные <em>горизонты</em>',
      lead: 'Сеть IAMU, программы обмена и карьерные пути во флотах мира.',
      cta: 'Посмотреть партнёров',
    },
  ],
  en: [
    {
      kicker: 'Azerbaijan State Marine Academy',
      title: 'Seafaring <em>of the future</em>',
      lead: 'Digital education opening turquoise horizons. International STCW standards, a live simulation environment and a global career trajectory.',
      cta: 'Sign in',
    },
    {
      kicker: 'Wärtsilä NTPRO training facility',
      title: 'Simulation <em>experience</em>',
      lead: 'Real scenarios on bridge, GMDSS and engine room simulators. Not theory — academic experience you live through.',
      cta: 'Start the virtual tour',
    },
    {
      kicker: '47+ international partners',
      title: 'Global <em>horizons</em>',
      lead: 'The IAMU network, exchange programmes and career paths into fleets worldwide.',
      cta: 'View partners',
    },
  ],
};

export function heroSlides(locale: Locale): HeroSlide[] {
  return TEXT[locale].map((t, i) => ({ ...t, img: IMGS[i] }));
}
