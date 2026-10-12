/**
 * F5.48 — «Beynəlxalq əlaqələr» menyusunun səhifələri: məzmun (yalnız
 * məlumat, məntiq src/utils/section-pages.ts-dədir). Şablon: layout=beynelxalq
 * (SectionPage — «Beynəlxalq əlaqələr» qırıntısı, «Sual ver» → müraciət
 * formasında «Beynəlxalq əlaqələr və əcnəbi tələbələr» istiqaməti).
 *
 * Quruluş HSE.ru beynəlxalq portalları ilə (global.hse.ru, studyabroad.hse.ru,
 * istudents.hse.ru): auditoriyaya görə giriş (tələbə, müəllim, əcnəbi
 * abituriyent və tələbə, xarici tərəfdaş) → tərəfdaşlar və üzvlüklər →
 * mübadilə → ikili diplom → əcnəbi tələbənin bələdçisi; əvvəldə rəqəmlər,
 * sonda əlaqə. Ruben və b. «A Guide for Leaders in Higher Education»:
 * beynəlmiləlləşmə sübutla (tarix, sənəd, xəbər), hər mövzunun bir yeri.
 *
 * MƏNBƏLƏR (12 oktyabr 2026, yoxlanılıb):
 *   - saytın mövcud səhifələri: «Beynəlxalq əməkdaşlıq», «Akademik tərəfdaşlar»,
 *     «Beynəlxalq əlaqələr qrupu» (funksiyalar), «ADDA dünən və bu gün»,
 *     «Əcnəbi vətəndaşların qəbulu» (F5.45), «Əcnəbi tələbələrin təhsili»;
 *   - ADDA xəbərləri: IAMU (07.09 və 01.11.2016), Yesenov Universiteti (2017,
 *     2022, 2023), Erasmus+ — Liyepaya (24.05 və 11.08.2023), Qazi Universiteti
 *     (28.09.2023), əcnəbi tələbələr (25.11.2022, 15.11.2023, 30.12.2025),
 *     GN Group (01.02, 31.03, 22.05.2026), Piri Reis
 *     (10.02, 22.05.2026), İÜ-Cerrahpaşa (21.05.2026), Yıldız TU (24.05.2026),
 *     Ukraynanın Milli Nəqliyyat Universiteti (03.07.2026), Səudiyyə
 *     Ərəbistanı (05.11.2025, 28.04.2026), KOICA (23.12.2025), TİKA
 *     (09.10.2025), Türk Loydu (24.05.2026), Harbin (24.06.2026);
 *   - Xüsusi Gəmilər və İntellektual Sistemlər Beynəlxalq Alyansına üzvlük
 *     (avqust 2026) — Akademiyanın məlumatı, saytda xəbəri hələ yoxdur.
 * DÜZƏLDİLİB: köhnə səhifədə «11 ölkənin 18 universiteti» yazılıb 17-si
 * sadalanırdı; en/ru mətnində «UNEC», «Sevastopol» və «Yesenin» səhvləri var
 * idi. Erasmus+ layihə təklifləri (DEMIS, KARVAN və b.) maliyyələşmiş kimi
 * YAZILMAYIB — yalnız təqdim olunub. Türk Loydu memorandumu imzalanmış kimi
 * yazılmayıb (layihədir).
 */
import type { LinkSeed, QebulPageSeed } from './qebul-pages-content';

export type BeynelxalqPageSeed = QebulPageSeed;

// ── Təkrarlanan keçidlər ─────────────────────────────────────────────────────
export const BEYNELXALQ_HUB_SLUG = 'beynelxalq-emekdasliq';
const HUB = `/sehife/${BEYNELXALQ_HUB_SLUG}`;
const PARTNERS = '/sehife/akademik-terefdaslar';
const MOBILITY = '/sehife/mobillik-ve-mubadile';
const DOUBLE = '/sehife/ikili-diplom-layiheleri';
const GUIDE = '/sehife/ecnebi-telebelerin-tehsili';
const ADMISSION = '/sehife/ecnebi-telebelerin-qebulu-qaydalari';
const ENGLISH = '/sehife/ingilis-dilinde-tedris';
const ABROAD = '/sehife/xaricde-tehsil-ve-ixtisasartirma';
const DORM = '/sehife/yataqxana';
const GRANTS = '/sehife/qrantlar';
const PRACTICE = '/sehife/tecrube-haqqinda';
const OFFICE = '/struktur/elmi-tedqiqat-ve-beynelxalq-elaqeler-sobesi';
const OFFICE_PHONE = '(+99412) 493-36-44 (3078)';
const ASK = '/vetendaslarin-muracieti?istiqamet=beynelxalq';
const IAMU = 'https://iamu-edu.org';
const EVISA = 'https://evisa.gov.az';
const MIGRATION = 'https://migration.gov.az';
/** 2026/2027 əcnəbilərin qəbulu elanı. */
const ADMISSION_2026 = '/elanlar/elan-2026';

const NEWS = {
  iamu2016: '/xeberler/adda-deniz-universitetlerinin-beynelxalq-assosiasiyasina-uzv-qebul-edildi',
  gnMou: '/xeberler/azerbaycan-dovlet-deniz-akademiyasi-adda-ile-gn-group-corporation-arasinda-emekd',
  gnVisit: '/xeberler/adda-numayende-heyeti-gn-group-corporation-da-gorus-kecirib',
  gnPractice: '/xeberler/adda-telebeleri-turkiyede-tecrube-kecir',
  piriMou: '/xeberler/azerbaycan-dovlet-deniz-akademiyasi-ve-turkiyenin-piri-reis-universiteti-arasind',
  piriVisit: '/xeberler/adda-numayende-heyeti-piri-reis-universitetinde-seferde-olub',
  cerrahpasa: '/xeberler/adda-numayende-heyeti-istanbul-universiteti-cerrahpasada-seferde-olub',
  yildiz: '/xeberler/adda-numayende-heyeti-yildiz-texnik-universitetinde-isguzar-gorus-kecirib',
  ntu: '/xeberler/azerbaycan-dovlet-deniz-akademiyasi-ile-ukraynanin-milli-neqliyyat-universiteti',
  harbin: '/xeberler/harbin-muhendislik-universitetinin-numayende-heyeti-adda-da-seferde-olub',
  turkLoydu: '/xeberler/adda-ve-turk-loydu-emekdasliq-imkanlarini-muzakire-edib',
  saudi: '/xeberler/erebistanli-qonaqlar-deniz-akademiyasinda',
  tika: '/xeberler/turk-is-birliyi-ve-koordinasiya-agentliyi-ile-emekdasliq-muzakire-edilib',
  koica: '/xeberler/azerbaycan-dovlet-deniz-akademiyasi-adda-ve-koreya-beynelxalq-emekdasliq-agentli',
  latvia2023: '/xeberler/latviyali-qonaqlar-adda-da',
  erasmus2023: '/xeberler/erasmus-proqrami-cercivesinde-emekdasliq',
  gazi2023: '/xeberler/tetbiqi-mexanika-kafedrasinda-master-klass',
  btu2025: '/xeberler/alimlerimiz-almaniyada-elmi-ezamiyyetde',
  kz2017: '/xeberler/qazaxistanli-terefdaslarla-yeni-memorandum-imzalanib',
  kz2022: '/xeberler/adda-da-ecnebi-telebeler-ucun-yeni-imkanlar-yaradilir',
  kzCouncil2022: '/xeberler/elmi-suranin-ilk-iclasi',
  kzPractice2023: '/xeberler/adda-da-ii-kursda-tehsil-alan-ecnebi-telebeler-sabit-orucov-gemisinde-tecrube-ke',
  foreign2023: '/xeberler/adda-ya-cari-tedris-ilinde-20-ecnebi-telebe-qebul-olub',
  newYear2025: '/xeberler/hemreylik-ruhunda-semimi-yeni-il-gorusu',
  lawQuiz: '/xeberler/huquq-zekasi-intellektual-yarisi',
};
/** ru/en səhifəsindən az xəbərə və elana: dilə görə az-a qayıtmır, prefiks açıq yazılır. */
const AZ = (path: string): string => `/az${path}`;

const CONTACT_AZ =
  '**Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsi**\n\nKorpus 1, 4-cü mərtəbə\n\n' +
  `**Daxili telefon:** ${OFFICE_PHONE}\n\n**Əcnəbi tələbələr:** akademiya@asco.az, +994 12 493 36 44\n\n` +
  `Sualınızı [onlayn göndərin](${ASK}) — cavab e-poçtunuza gəlir.`;
const CONTACT_EN =
  '**Research and International Relations Department**\n\nBuilding 1, 4th floor\n\n' +
  `**Internal phone:** ${OFFICE_PHONE}\n\n**International students:** akademiya@asco.az, +994 12 493 36 44\n\n` +
  `[Send your question online](${ASK}) — the reply comes to your e-mail.`;
const CONTACT_RU =
  '**Отдел научных исследований и международных связей**\n\nКорпус 1, 4-й этаж\n\n' +
  `**Внутренний телефон:** ${OFFICE_PHONE}\n\n**Иностранные студенты:** akademiya@asco.az, +994 12 493 36 44\n\n` +
  `[Задайте вопрос онлайн](${ASK}) — ответ придёт на e-mail.`;

const L_AZ = {
  hub: { label: 'Beynəlxalq əməkdaşlıq', url: HUB },
  partners: { label: 'Akademik tərəfdaşlar', url: PARTNERS },
  mobility: { label: 'Mübadilə və Erasmus+', url: MOBILITY },
  double: { label: 'İkili diplom proqramları', url: DOUBLE },
  guide: { label: 'Əcnəbi tələbələr üçün bələdçi', url: GUIDE },
  admission: { label: 'Əcnəbi vətəndaşların qəbulu', url: ADMISSION },
  office: { label: 'Beynəlxalq əlaqələr şöbəsi', url: OFFICE },
} satisfies Record<string, LinkSeed>;
const L_EN = {
  hub: { label: 'International cooperation', url: HUB },
  partners: { label: 'Academic partners', url: PARTNERS },
  mobility: { label: 'Exchange and Erasmus+', url: MOBILITY },
  double: { label: 'Double degree programmes', url: DOUBLE },
  guide: { label: 'Guide for international students', url: GUIDE },
  admission: { label: 'Admission of international students', url: ADMISSION },
  office: { label: 'International Relations Department', url: OFFICE },
} satisfies Record<string, LinkSeed>;
const L_RU = {
  hub: { label: 'Международное сотрудничество', url: HUB },
  partners: { label: 'Академические партнёры', url: PARTNERS },
  mobility: { label: 'Обмен и Erasmus+', url: MOBILITY },
  double: { label: 'Программы двойного диплома', url: DOUBLE },
  guide: { label: 'Путеводитель иностранного студента', url: GUIDE },
  admission: { label: 'Приём иностранных граждан', url: ADMISSION },
  office: { label: 'Отдел международных связей', url: OFFICE },
} satisfies Record<string, LinkSeed>;

// ── 1. Beynəlxalq əməkdaşlıq (bölmənin ana səhifəsi) ─────────────────────────
const HUB_PAGE: BeynelxalqPageSeed = {
  slug: BEYNELXALQ_HUB_SLUG,
  dataBlock: 'beynelxalq',
  az: {
    title: 'Beynəlxalq əməkdaşlıq',
    lead:
      'Akademiyanın diplomu 170-dən çox ölkədə tanınır. ADDA Beynəlxalq Dəniz Universitetləri Assosiasiyasının (IAMU) üzvüdür, 11 ölkənin universitetləri ilə ' +
      'ikitərəfli əməkdaşlıq edir, Erasmus+ və ikili diplom proqramlarında iştirak edir, əcnəbi tələbələr qəbul edir.',
    seoDescription:
      'ADDA-nın beynəlxalq əməkdaşlığı: IAMU üzvlüyü, 11 ölkənin tərəfdaş universitetləri, 2026 memorandumları, Erasmus+, ikili diplom, əcnəbi tələbələr.',
    stepsTitle: 'Tərəfdaşlıq necə qurulur',
    facts: [
      { label: 'Diplom tanınır', value: '170-dən çox ölkədə', icon: 'diplom' },
      { label: 'IAMU üzvü', value: '2016-cı ildən', icon: 'beynelxalq' },
      { label: 'Memorandum (yanvar–iyul 2026)', value: '5', icon: 'sened' },
      { label: 'Əcnəbi tələbə (2023/2024)', value: '43', icon: 'qrup' },
    ],
    steps: [
      {
        title: 'Təklif göndərin',
        who: 'Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsi',
        body: 'Universitet, təşkilat və ya şirkət əməkdaşlıq təklifini şöbəyə göndərir. Şöbə xarici təhsil və elm müəssisələri, beynəlxalq qurum və fondlarla birbaşa əlaqə qurur.',
        linkLabel: 'Şöbənin səhifəsi',
        linkUrl: OFFICE,
      },
      {
        title: 'Görüş və müzakirə',
        who: 'Akademiyanın rəhbərliyi',
        body: 'Əməkdaşlıq istiqamətləri onlayn görüşdə və ya qarşılıqlı səfərlərdə müzakirə olunur.',
      },
      {
        title: 'Anlaşma memorandumu',
        who: 'Rektor və tərəfdaşın rəhbəri',
        body: 'Mübadilə, birgə proqramlar, tədqiqat və tədbirləri əhatə edən memorandum imzalanır.',
      },
      {
        title: 'Fəaliyyət planı',
        who: 'Hər iki tərəf',
        body: 'Memorandumdan sonra konkret tədbirlər planı hazırlanır — məsələn, Ukraynanın Milli Nəqliyyat Universiteti ilə 2026-cı ildə belə razılaşdırılıb.',
        linkLabel: 'Xəbər',
        linkUrl: NEWS.ntu,
      },
      {
        title: 'İcra',
        who: 'Kafedralar, şöbə, tələbələr',
        body: 'Tələbə və müəllim mübadiləsi, birgə layihə və konfranslar. Nəticələr Akademiyanın xəbərlərində dərc olunur.',
      },
    ],
    body: `## Kimə nə lazımdır

| Siz | Haradan başlamalı |
|---|---|
| ADDA tələbəsi | [Mübadilə və Erasmus+](${MOBILITY}), [İkili diplom proqramları](${DOUBLE}), [xaricdə magistratura](${ABROAD}) |
| Müəllim və tədqiqatçı | Erasmus+ müəllim mobilliyi və birgə tədqiqat — [Mübadilə və Erasmus+](${MOBILITY}), [Qrantlar və müsabiqələr](${GRANTS}) |
| Əcnəbi abituriyent | [Əcnəbi vətəndaşların qəbulu](${ADMISSION}), [İngilis dilində tədris](${ENGLISH}) |
| Əcnəbi tələbə | [Əcnəbi tələbələr üçün bələdçi](${GUIDE}) |
| Xarici universitet, təşkilat, şirkət | [Akademik tərəfdaşlar](${PARTNERS}), [Beynəlxalq əlaqələr şöbəsi](${OFFICE}) |

## Beynəlxalq tanınma

Akademiya ilk gündən təhsili Beynəlxalq Dənizçilik Təşkilatının (IMO) STCW Konvensiyasının tələblərinə uyğun qurub; baza təhsil proqramları IMO tərəfindən qəbul olunub. ADDA **012 nömrəsi** altında dünya ali dəniz təhsili sisteminin kataloquna daxil edilib, diplomu **170-dən çox ölkədə** tanınır.

## Üzvlüklər

- **Beynəlxalq Dəniz Universitetləri Assosiasiyası (IAMU)** — 2016-cı ildən; üzvlük sertifikatı Vyetnamın Hayfon şəhərində keçirilən illik baş məclisdə təqdim olunub ([xəbər](${NEWS.iamu2016})).
- **MDB ölkələrinin dənizçilik ali məktəblərinin Tədris-Metodiki Şurası** — admiral S. O. Makarov adına Dövlət Dəniz və Çay Donanması Universiteti (Sankt-Peterburq) nəzdində.
- **Xəzəryanı dövlətlərin Ali Məktəbləri Assosiasiyası** — fəal iştirakçı.
- **Xüsusi Gəmilər və İntellektual Sistemlər Beynəlxalq Alyansı** — Harbin Mühəndislik Universitetinin təşəbbüsü; ADDA 2026-cı ilin avqustunda institusional üzv qəbul olunub.

## 2026: yeni anlaşmalar

| Tarix | Tərəfdaş | Əsas istiqamətlər |
|---|---|---|
| 2026, yanvar–fevral | GN Group Corporation (Türkiyə) | gəmilərdə və tərsanələrdə təcrübə, təlimlər, qış və yay məktəbləri, məzunların işə qəbulu ([xəbər](${NEWS.gnMou})) |
| 10.02.2026 | Piri Reis Universiteti (Türkiyə) | strateji əməkdaşlıq: akademik mübadilə, birgə tədris proqramları, elmi layihələr ([xəbər](${NEWS.piriMou})) |
| 18.05.2026 | İstanbul Universiteti-Cerrahpaşa (Türkiyə) | mobillik, ikili diplom, rəqəmsallaşma, birgə layihələr ([xəbər](${NEWS.cerrahpasa})) |
| 21.05.2026 | Yıldız Texniki Universiteti (Türkiyə) | müəllimlərin Akademiyada tədrisi, birgə elmi rəhbərlik, yay və qış məktəbləri ([xəbər](${NEWS.yildiz})) |
| 03.07.2026 | Milli Nəqliyyat Universiteti (Ukrayna) | bakalavr və magistr mübadiləsi, müəllim səfərləri, birgə tədqiqat, qısamüddətli proqramlar ([xəbər](${NEWS.ntu})) |

## Müzakirə olunan əməkdaşlıq

- **Səudiyyə Ərəbistanının Nəqliyyat Baş İdarəsi** — mübadilə, ikili diplom, Səudiyyə şirkətlərində təcrübə (aprel 2026, [xəbər](${NEWS.saudi})). Bir il əvvəl iki ölkənin nəqliyyat qurumları arasında STCW-nin I/10 qaydası üzrə sertifikatların qarşılıqlı tanınması memorandumu imzalanıb.
- **Türk Loydu** — təcrübə, təlim və qrant layihələri; memorandum layihəsi hazırlanıb ([xəbər](${NEWS.turkLoydu})).
- **Koreya Beynəlxalq Əməkdaşlıq Agentliyi (KOICA)** — rəqəmsallaşma, laboratoriya və trenajorların yenilənməsi, əməkdaşların inkişafı (dekabr 2025, [xəbər](${NEWS.koica})).
- **TİKA** — Türkiyədən tələbələrin cəlbi, Türkiyə universitetləri ilə əlaqələr, ikili diplom (oktyabr 2025, [xəbər](${NEWS.tika})).
- **Harbin Mühəndislik Universiteti (Çin)** — nümayəndə heyətinin səfəri və əməkdaşlıq təklifləri (iyun 2026, [xəbər](${NEWS.harbin})).

## Beynəlxalq əlaqələr şöbəsi

Beynəlxalq əlaqələri [Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsi](${OFFICE}) aparır:

- xarici universitet, təşkilat və fondlarla ikitərəfli və çoxtərəfli müqavilələr;
- beynəlxalq təhsil və elm layihələrinin hazırlanması;
- müəllim, tədqiqatçı, tələbə, magistrant və doktorantların mübadiləsi;
- xarici ölkələrin səfirlik və nümayəndəlikləri ilə əməkdaşlıq;
- Elm və Təhsil Nazirliyi və Dövlət Miqrasiya Xidməti ilə əlaqə, əcnəbi tələbələrin müvəqqəti yaşama icazəsi üçün sənədlər;
- beynəlxalq konfrans və seminarlarda Akademiyanın təmsili, xarici alimlərin dəvəti.`,
    faq: [
      {
        question: 'Akademiyanın diplomu xaricdə tanınırmı?',
        answer:
          'Bəli. Təhsil IMO-nun STCW Konvensiyasının tələblərinə uyğundur, ADDA dünya ali dəniz təhsili kataloqunda 012 nömrəsi ilə qeydiyyatdadır; diplom 170-dən çox ölkədə tanınır.',
      },
      {
        question: 'Xarici universitetdə oxumaq mümkündürmü?',
        answer:
          'Bəli — Erasmus+ və universitetlərarası memorandumlar çərçivəsində mübadilə, Qazaxıstan tərəfdaşı ilə ikili diplom, ASCO təqaüdü ilə xaricdə magistratura. Addımlar «Mübadilə və Erasmus+» səhifəsindədir.',
      },
      {
        question: 'Universitetimiz ADDA ilə necə əməkdaşlıq qura bilər?',
        answer:
          'Təklifinizi Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsinə göndərin. Görüşdən sonra anlaşma memorandumu və fəaliyyət planı hazırlanır.',
      },
      {
        question: 'Əcnəbi vətəndaş Akademiyaya necə qəbul olunur?',
        answer:
          'Bakalavriat və magistraturaya müsahibə ilə. 2026/2027-ci ildə illik təhsil haqqı 5100 manatdır; geyim forması, tədris materialları və yataqxana ödənişsizdir.',
      },
    ],
    sideLinks: [L_AZ.partners, L_AZ.mobility, L_AZ.double, L_AZ.guide, { label: 'IAMU', url: IAMU }],
    contact: CONTACT_AZ,
  },
  en: {
    title: 'International Cooperation',
    lead:
      'The Academy’s diploma is recognised in more than 170 countries. ADDA is a member of the International Association of Maritime Universities (IAMU), cooperates ' +
      'with universities in 11 countries, takes part in Erasmus+ and double degree programmes and admits international students.',
    seoDescription:
      'International cooperation at ADDA: IAMU membership, partner universities in 11 countries, 2026 agreements, Erasmus+, double degrees, international students.',
    stepsTitle: 'How a partnership is built',
    facts: [
      { label: 'Diploma recognised', value: 'In 170+ countries', icon: 'diplom' },
      { label: 'IAMU member', value: 'Since 2016', icon: 'beynelxalq' },
      { label: 'Agreements (Jan–Jul 2026)', value: '5', icon: 'sened' },
      { label: 'International students (2023/2024)', value: '43', icon: 'qrup' },
    ],
    steps: [
      {
        title: 'Send a proposal',
        who: 'Research and International Relations Department',
        body: 'A university, organisation or company sends its proposal to the department, which works directly with foreign universities, research institutions, international bodies and foundations.',
        linkLabel: 'Department page',
        linkUrl: OFFICE,
      },
      {
        title: 'Meet and discuss',
        who: 'Academy leadership',
        body: 'Areas of cooperation are discussed at an online meeting or during mutual visits.',
      },
      {
        title: 'Memorandum of understanding',
        who: 'Rector and the partner’s head',
        body: 'A memorandum covering exchanges, joint programmes, research and events is signed.',
      },
      {
        title: 'Action plan',
        who: 'Both partners',
        body: 'After the memorandum a concrete action plan is prepared — as agreed with Ukraine’s National Transport University in 2026, for example.',
        linkLabel: 'News',
        linkUrl: AZ(NEWS.ntu),
      },
      {
        title: 'Implementation',
        who: 'Departments, office, students',
        body: 'Student and staff exchanges, joint projects and conferences. Results are published in the Academy news.',
      },
    ],
    body: `## Where to start

| You are | Start here |
|---|---|
| An ADDA student | [Exchange and Erasmus+](${MOBILITY}), [Double degree programmes](${DOUBLE}), [a master’s degree abroad](${ABROAD}) |
| A lecturer or researcher | Erasmus+ staff mobility and joint research — [Exchange and Erasmus+](${MOBILITY}), [Grants and competitions](${GRANTS}) |
| An international applicant | [Admission of international students](${ADMISSION}), [English-taught programmes](${ENGLISH}) |
| An international student | [Guide for international students](${GUIDE}) |
| A foreign university, organisation or company | [Academic partners](${PARTNERS}), [International Relations Department](${OFFICE}) |

## International recognition

From its first day the Academy has built its programmes around the requirements of the IMO’s STCW Convention; its core curricula were accepted by the IMO. ADDA is listed in the catalogue of the world maritime higher education system under **number 012**, and its diploma is recognised in **more than 170 countries**.

## Memberships

- **International Association of Maritime Universities (IAMU)** — since 2016; the membership certificate was presented at the annual general assembly in Haiphong, Vietnam ([news](${AZ(NEWS.iamu2016)})).
- **Educational and Methodological Council of maritime universities of the CIS** — based at the Admiral S. O. Makarov State University of Maritime and Inland Shipping (St Petersburg).
- **Association of Universities of the Caspian States** — active participant.
- **Special Ships and Intelligent Systems International Alliance** — initiated by Harbin Engineering University; ADDA became an institutional member in August 2026.

## New agreements, 2026

| Date | Partner | Main areas |
|---|---|---|
| Jan–Feb 2026 | GN Group Corporation (Türkiye) | training on ships and in shipyards, courses, winter and summer schools, graduate recruitment ([news](${AZ(NEWS.gnMou)})) |
| 10.02.2026 | Piri Reis University (Türkiye) | strategic cooperation: academic exchange, joint programmes, research projects ([news](${AZ(NEWS.piriMou)})) |
| 18.05.2026 | Istanbul University-Cerrahpaşa (Türkiye) | mobility, double degrees, digitalisation, joint projects ([news](${AZ(NEWS.cerrahpasa)})) |
| 21.05.2026 | Yıldız Technical University (Türkiye) | visiting lecturers at the Academy, joint supervision, summer and winter schools ([news](${AZ(NEWS.yildiz)})) |
| 03.07.2026 | National Transport University (Ukraine) | bachelor’s and master’s exchange, staff visits, joint research, short programmes ([news](${AZ(NEWS.ntu)})) |

## Cooperation under discussion

- **Transport General Authority of Saudi Arabia** — exchanges, double degrees, internships with Saudi companies (April 2026, [news](${AZ(NEWS.saudi)})). A year earlier the two countries’ transport authorities signed a memorandum on mutual recognition of certificates under STCW regulation I/10.
- **Türk Loydu** — internships, training and grant projects; a draft memorandum has been prepared ([news](${AZ(NEWS.turkLoydu)})).
- **Korea International Cooperation Agency (KOICA)** — digitalisation, upgrading laboratories and simulators, staff development (December 2025, [news](${AZ(NEWS.koica)})).
- **TİKA** — attracting students from Türkiye, links with Turkish universities, double degrees (October 2025, [news](${AZ(NEWS.tika)})).
- **Harbin Engineering University (China)** — a delegation visit and cooperation proposals (June 2026, [news](${AZ(NEWS.harbin)})).

## International Relations Department

International relations are handled by the [Research and International Relations Department](${OFFICE}):

- bilateral and multilateral agreements with foreign universities, organisations and foundations;
- preparing international education and research projects;
- exchanges of lecturers, researchers, students, master’s and doctoral students;
- cooperation with foreign embassies and missions;
- liaison with the Ministry of Science and Education and the State Migration Service, residence-permit documents for international students;
- representing the Academy at international conferences and seminars, inviting foreign scholars.`,
    faq: [
      {
        question: 'Is the Academy’s diploma recognised abroad?',
        answer:
          'Yes. Training meets the requirements of the IMO’s STCW Convention, ADDA is listed under number 012 in the world catalogue of maritime higher education, and its diploma is recognised in more than 170 countries.',
      },
      {
        question: 'Can I study at a foreign university?',
        answer:
          'Yes — through exchanges under Erasmus+ and university agreements, the double degree with our Kazakh partner, and master’s study abroad on an ASCO scholarship. The steps are on the “Exchange and Erasmus+” page.',
      },
      {
        question: 'How can our university cooperate with ADDA?',
        answer:
          'Send your proposal to the Research and International Relations Department. After a meeting, a memorandum of understanding and an action plan are prepared.',
      },
      {
        question: 'How are international students admitted?',
        answer:
          'To bachelor’s and master’s programmes after an interview. In 2026/2027 the annual tuition fee is 5,100 AZN; uniform, study materials and the residence hall are free of charge.',
      },
    ],
    sideLinks: [L_EN.partners, L_EN.mobility, L_EN.double, L_EN.guide, { label: 'IAMU', url: IAMU }],
    contact: CONTACT_EN,
  },
  ru: {
    title: 'Международное сотрудничество',
    lead:
      'Диплом Академии признаётся более чем в 170 странах. АГМА — член Международной ассоциации морских университетов (IAMU), сотрудничает ' +
      'с университетами 11 стран, участвует в Erasmus+ и программах двойного диплома, принимает иностранных студентов.',
    seoDescription:
      'Международное сотрудничество АГМА: членство в IAMU, вузы-партнёры из 11 стран, соглашения 2026 года, Erasmus+, двойной диплом, иностранные студенты.',
    stepsTitle: 'Как строится партнёрство',
    facts: [
      { label: 'Диплом признаётся', value: 'Более чем в 170 странах', icon: 'diplom' },
      { label: 'Член IAMU', value: 'С 2016 года', icon: 'beynelxalq' },
      { label: 'Меморандумы (январь–июль 2026)', value: '5', icon: 'sened' },
      { label: 'Иностранные студенты (2023/2024)', value: '43', icon: 'qrup' },
    ],
    steps: [
      {
        title: 'Направьте предложение',
        who: 'Отдел научных исследований и международных связей',
        body: 'Университет, организация или компания направляет предложение в отдел, который устанавливает прямые связи с зарубежными вузами, научными учреждениями, международными организациями и фондами.',
        linkLabel: 'Страница отдела',
        linkUrl: OFFICE,
      },
      {
        title: 'Встреча и обсуждение',
        who: 'Руководство Академии',
        body: 'Направления сотрудничества обсуждаются на онлайн-встрече или во время взаимных визитов.',
      },
      {
        title: 'Меморандум о взаимопонимании',
        who: 'Ректор и руководитель партнёра',
        body: 'Подписывается меморандум, охватывающий обмены, совместные программы, исследования и мероприятия.',
      },
      {
        title: 'План действий',
        who: 'Обе стороны',
        body: 'После меморандума готовится конкретный план мероприятий — так, например, договорились в 2026 году с Национальным транспортным университетом Украины.',
        linkLabel: 'Новость',
        linkUrl: AZ(NEWS.ntu),
      },
      {
        title: 'Реализация',
        who: 'Кафедры, отдел, студенты',
        body: 'Обмен студентами и преподавателями, совместные проекты и конференции. Результаты публикуются в новостях Академии.',
      },
    ],
    body: `## С чего начать

| Вы | С чего начать |
|---|---|
| Студент АГМА | [Обмен и Erasmus+](${MOBILITY}), [Программы двойного диплома](${DOUBLE}), [магистратура за рубежом](${ABROAD}) |
| Преподаватель или исследователь | мобильность преподавателей по Erasmus+ и совместные исследования — [Обмен и Erasmus+](${MOBILITY}), [Гранты и конкурсы](${GRANTS}) |
| Иностранный абитуриент | [Приём иностранных граждан](${ADMISSION}), [Обучение на английском языке](${ENGLISH}) |
| Иностранный студент | [Путеводитель иностранного студента](${GUIDE}) |
| Зарубежный вуз, организация, компания | [Академические партнёры](${PARTNERS}), [Отдел международных связей](${OFFICE}) |

## Международное признание

С первого дня Академия выстроила обучение в соответствии с требованиями Конвенции ПДНВ Международной морской организации (ИМО); базовые образовательные программы приняты ИМО. АГМА включена в каталог мировой системы высшего морского образования под **номером 012**, её диплом признаётся **более чем в 170 странах**.

## Членство

- **Международная ассоциация морских университетов (IAMU)** — с 2016 года; сертификат члена вручён на ежегодной генеральной ассамблее в Хайфоне (Вьетнам) ([новость](${AZ(NEWS.iamu2016)})).
- **Учебно-методический совет морских вузов стран СНГ** — при Государственном университете морского и речного флота имени адмирала С. О. Макарова (Санкт-Петербург).
- **Ассоциация вузов прикаспийских государств** — активный участник.
- **Международный альянс специальных судов и интеллектуальных систем** — по инициативе Харбинского инженерного университета; АГМА принята институциональным членом в августе 2026 года.

## Новые соглашения 2026 года

| Дата | Партнёр | Основные направления |
|---|---|---|
| 2026, январь–февраль | GN Group Corporation (Турция) | практика на судах и верфях, тренинги, зимние и летние школы, трудоустройство выпускников ([новость](${AZ(NEWS.gnMou)})) |
| 10.02.2026 | Университет Пири Реис (Турция) | стратегическое сотрудничество: академический обмен, совместные программы, научные проекты ([новость](${AZ(NEWS.piriMou)})) |
| 18.05.2026 | Стамбульский университет — Джеррахпаша (Турция) | мобильность, двойной диплом, цифровизация, совместные проекты ([новость](${AZ(NEWS.cerrahpasa)})) |
| 21.05.2026 | Технический университет Йылдыз (Турция) | преподавание в Академии, совместное научное руководство, летние и зимние школы ([новость](${AZ(NEWS.yildiz)})) |
| 03.07.2026 | Национальный транспортный университет (Украина) | обмен бакалаврами и магистрантами, визиты преподавателей, совместные исследования, краткосрочные программы ([новость](${AZ(NEWS.ntu)})) |

## Обсуждаемое сотрудничество

- **Главное управление транспорта Саудовской Аравии** — обмены, двойной диплом, стажировки в саудовских компаниях (апрель 2026, [новость](${AZ(NEWS.saudi)})). Годом ранее транспортные ведомства двух стран подписали меморандум о взаимном признании сертификатов по правилу I/10 ПДНВ.
- **Türk Loydu** — стажировки, обучение и грантовые проекты; подготовлен проект меморандума ([новость](${AZ(NEWS.turkLoydu)})).
- **Корейское агентство международного сотрудничества (KOICA)** — цифровизация, модернизация лабораторий и тренажёров, развитие персонала (декабрь 2025, [новость](${AZ(NEWS.koica)})).
- **TİKA** — привлечение студентов из Турции, связи с турецкими вузами, двойной диплом (октябрь 2025, [новость](${AZ(NEWS.tika)})).
- **Харбинский инженерный университет (Китай)** — визит делегации и предложения о сотрудничестве (июнь 2026, [новость](${AZ(NEWS.harbin)})).

## Отдел международных связей

Международными связями занимается [Отдел научных исследований и международных связей](${OFFICE}):

- двусторонние и многосторонние соглашения с зарубежными вузами, организациями и фондами;
- подготовка международных образовательных и научных проектов;
- обмен преподавателями, исследователями, студентами, магистрантами и докторантами;
- сотрудничество с иностранными посольствами и представительствами;
- связь с Министерством науки и образования и Государственной миграционной службой, документы иностранных студентов на временное проживание;
- представление Академии на международных конференциях и семинарах, приглашение зарубежных учёных.`,
    faq: [
      {
        question: 'Признаётся ли диплом Академии за рубежом?',
        answer:
          'Да. Обучение соответствует требованиям Конвенции ПДНВ ИМО, АГМА внесена в мировой каталог высшего морского образования под номером 012, диплом признаётся более чем в 170 странах.',
      },
      {
        question: 'Можно ли учиться в зарубежном университете?',
        answer:
          'Да — по обмену в рамках Erasmus+ и межвузовских меморандумов, по программе двойного диплома с казахстанским партнёром, в зарубежной магистратуре по стипендии ASCO. Шаги — на странице «Обмен и Erasmus+».',
      },
      {
        question: 'Как нашему университету начать сотрудничество с АГМА?',
        answer:
          'Направьте предложение в Отдел научных исследований и международных связей. После встречи готовятся меморандум о взаимопонимании и план действий.',
      },
      {
        question: 'Как поступить в Академию иностранному гражданину?',
        answer:
          'В бакалавриат и магистратуру — по результатам собеседования. В 2026/2027 году стоимость обучения — 5100 манатов в год; форма, учебные материалы и общежитие бесплатны.',
      },
    ],
    sideLinks: [L_RU.partners, L_RU.mobility, L_RU.double, L_RU.guide, { label: 'IAMU', url: IAMU }],
    contact: CONTACT_RU,
  },
};

// ── 2. Akademik tərəfdaşlar ──────────────────────────────────────────────────
const PARTNERS_PAGE: BeynelxalqPageSeed = {
  slug: 'akademik-terefdaslar',
  dataBlock: 'yox',
  az: {
    title: 'Akademik tərəfdaşlar',
    lead:
      'Akademiya 11 ölkənin dənizçilik və texniki universitetləri ilə ikitərəfli əməkdaşlıq edir: tələbə və müəllim mübadiləsi, ikili diplom, ' +
      'birgə konfrans və tədqiqat. 2026-cı ildə Türkiyə və Ukraynanın dörd universiteti ilə yeni memorandum imzalanıb.',
    seoDescription:
      'ADDA-nın tərəfdaş universitetləri ölkələr üzrə: Türkiyə, Ukrayna, Qazaxıstan, Gürcüstan, Latviya və b.; 2026 memorandumları, şirkətlər və təşkilatlar.',
    facts: [
      { label: 'Ölkə', value: '11', icon: 'beynelxalq' },
      { label: 'Yeni memorandum (2026)', value: '4 universitet', icon: 'sened' },
      { label: 'Erasmus+ müqaviləsi', value: '2021–2027', icon: 'tarix' },
      { label: 'İkili diplom', value: 'Qazaxıstan', icon: 'diplom' },
    ],
    body: `## Tərəfdaş universitetlər

Ölkələr üzrə; mötərizədə — son anlaşma və ya əməkdaşlıq forması.

- **Türkiyə** — İstanbul Texniki Universiteti; Piri Reis Universiteti (strateji əməkdaşlıq memorandumu, 10.02.2026); İstanbul Universiteti-Cerrahpaşa (memorandum, 18.05.2026); Yıldız Texniki Universiteti (memorandum, 21.05.2026).
- **Ukrayna** — Milli Nəqliyyat Universiteti, Hetman Petro Konaşeviç-Sahaydaçnı adına Kiyev Su Nəqliyyatı İnstitutu ilə (memorandum, 03.07.2026); Admiral Makarov adına Milli Gəmiqayırma Universiteti; Odessa Milli Dəniz Universiteti.
- **Qazaxıstan** — Ş. Yesenov adına Xəzər Texnologiya və Mühəndislik Universiteti, Aktau ([ikili diplom](${DOUBLE}), 2011-ci ildən).
- **Gürcüstan** — Batumi Dövlət Dəniz Akademiyası; Batumi Naviqasiya Tədris Universiteti.
- **Latviya** — Latviya Dəniz Akademiyası; Riqa Texniki Universitetinin Liyepaya Dəniz Kolleci (Erasmus+, 2021–2027).
- **Estoniya** — Estoniya Dəniz Akademiyası (TalTech).
- **Litva** — Klaypeda Universiteti.
- **Polşa** — Şetsin Dəniz Universiteti.
- **Bolqarıstan** — Varna Texniki Universiteti.
- **Monteneqro** — Monteneqro Universiteti.
- **Rusiya** — admiral S. O. Makarov adına Dövlət Dəniz və Çay Donanması Universiteti; Həştərxan Dövlət Texniki Universiteti; admiral F. F. Uşakov adına Dövlət Dəniz Universiteti; admiral G. İ. Nevelskoy adına Dəniz Dövlət Universiteti.

## Şirkətlər və təşkilatlar

- **GN Group Corporation (Türkiyə)** — tələbələrin şirkətin gəmilərində və tərsanələrində təcrübəsi, təlimlər, məzunların işə qəbulu ([xəbər](${NEWS.gnMou})).
- **Informacinė Raida (Litva)** və **Turksen Eğitim (Türkiyə)** — uzunmüddətli əməkdaşlıq.
- **TİKA** — Türkiyə universitetləri və şirkətləri ilə əlaqələrin qurulmasına dəstək; 2026-cı ilin mayında İstanbuldakı görüşləri təşkil edib ([xəbər](${NEWS.cerrahpasa})).

## Elmi tərəfdaşlar

- **Brandenburq Texniki Universiteti (Almaniya)** — Azərbaycan Elm Fondunun qrant layihəsi çərçivəsində birgə tədqiqat və eksperimentlər (2025, [xəbər](${NEWS.btu2025})).
- Akademiyanın illik beynəlxalq elmi-texniki konfransında Türkiyə, Rusiya, ABŞ, Ukrayna, Gürcüstan, Latviya, Polşa və Qazaxıstan alimləri iştirak edir — [Elmi konfranslar](/sehife/elmi-konfranslar).

## Tərəfdaş olmaq istəyirsiniz?

Təklifinizi [Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsinə](${OFFICE}) göndərin; əməkdaşlığın necə qurulduğu [Beynəlxalq əməkdaşlıq](${HUB}) səhifəsindədir.`,
    faq: [
      {
        question: 'Tərəfdaş universitetdə oxumaq üçün nə etməliyəm?',
        answer: 'Mübadilə proqramlarının elanını izləyin və Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsi ilə məsləhətləşin. Addımlar «Mübadilə və Erasmus+» səhifəsindədir.',
      },
      {
        question: 'Siyahıda olmayan universitetlə əməkdaşlıq mümkündürmü?',
        answer: 'Bəli. Təklif şöbəyə göndərilir; görüşdən sonra anlaşma memorandumu imzalanır.',
      },
    ],
    sideLinks: [L_AZ.hub, L_AZ.mobility, L_AZ.double, L_AZ.office],
    contact: CONTACT_AZ,
  },
  en: {
    title: 'Academic Partners',
    lead:
      'The Academy cooperates with maritime and technical universities in 11 countries: student and staff exchange, double degrees, joint conferences and research. ' +
      'In 2026 new memoranda were signed with four universities in Türkiye and Ukraine.',
    seoDescription:
      'ADDA’s partner universities by country: Türkiye, Ukraine, Kazakhstan, Georgia, Latvia and others; 2026 memoranda, companies and organisations.',
    facts: [
      { label: 'Countries', value: '11', icon: 'beynelxalq' },
      { label: 'New memoranda (2026)', value: '4 universities', icon: 'sened' },
      { label: 'Erasmus+ agreement', value: '2021–2027', icon: 'tarix' },
      { label: 'Double degree', value: 'Kazakhstan', icon: 'diplom' },
    ],
    body: `## Partner universities

By country; in brackets — the latest agreement or form of cooperation.

- **Türkiye** — Istanbul Technical University; Piri Reis University (strategic cooperation memorandum, 10.02.2026); Istanbul University-Cerrahpaşa (memorandum, 18.05.2026); Yıldız Technical University (memorandum, 21.05.2026).
- **Ukraine** — National Transport University, together with the Hetman Petro Konashevych-Sahaidachnyi Kyiv Institute of Water Transport (memorandum, 03.07.2026); Admiral Makarov National University of Shipbuilding; Odesa National Maritime University.
- **Kazakhstan** — Yessenov University (Caspian University of Technology and Engineering named after Sh. Yessenov), Aktau ([double degree](${DOUBLE}), since 2011).
- **Georgia** — Batumi State Maritime Academy; Batumi Navigation Teaching University.
- **Latvia** — Latvian Maritime Academy; Liepāja Maritime College of Riga Technical University (Erasmus+, 2021–2027).
- **Estonia** — Estonian Maritime Academy (TalTech).
- **Lithuania** — Klaipėda University.
- **Poland** — Maritime University of Szczecin.
- **Bulgaria** — Technical University of Varna.
- **Montenegro** — University of Montenegro.
- **Russia** — Admiral Makarov State University of Maritime and Inland Shipping; Astrakhan State Technical University; Admiral Ushakov Maritime State University; Admiral Nevelskoy Maritime State University.

## Companies and organisations

- **GN Group Corporation (Türkiye)** — training for students on the company’s ships and in its shipyards, courses, graduate recruitment ([news](${AZ(NEWS.gnMou)})).
- **Informacinė Raida (Lithuania)** and **Turksen Eğitim (Türkiye)** — long-standing cooperation.
- **TİKA** — support in building links with Turkish universities and companies; organised the Istanbul meetings in May 2026 ([news](${AZ(NEWS.cerrahpasa)})).

## Research partners

- **Brandenburg University of Technology (Germany)** — joint research and experiments under an Azerbaijan Science Foundation grant (2025, [news](${AZ(NEWS.btu2025)})).
- Scientists from Türkiye, Russia, the USA, Ukraine, Georgia, Latvia, Poland and Kazakhstan take part in the Academy’s annual international conference — [Scientific conferences](/sehife/elmi-konfranslar).

## Want to become a partner?

Send your proposal to the [Research and International Relations Department](${OFFICE}); how cooperation is built is described on the [International cooperation](${HUB}) page.`,
    faq: [
      {
        question: 'What do I need to study at a partner university?',
        answer: 'Watch for exchange announcements and talk to the Research and International Relations Department. The steps are on the “Exchange and Erasmus+” page.',
      },
      {
        question: 'Can we cooperate with a university that is not on the list?',
        answer: 'Yes. Send a proposal to the department; after a meeting a memorandum of understanding is signed.',
      },
    ],
    sideLinks: [L_EN.hub, L_EN.mobility, L_EN.double, L_EN.office],
    contact: CONTACT_EN,
  },
  ru: {
    title: 'Академические партнёры',
    lead:
      'Академия сотрудничает с морскими и техническими университетами 11 стран: обмен студентами и преподавателями, двойной диплом, совместные конференции и исследования. ' +
      'В 2026 году подписаны новые меморандумы с четырьмя университетами Турции и Украины.',
    seoDescription:
      'Вузы-партнёры АГМА по странам: Турция, Украина, Казахстан, Грузия, Латвия и другие; меморандумы 2026 года, компании и организации.',
    facts: [
      { label: 'Стран', value: '11', icon: 'beynelxalq' },
      { label: 'Новые меморандумы (2026)', value: '4 университета', icon: 'sened' },
      { label: 'Соглашение Erasmus+', value: '2021–2027', icon: 'tarix' },
      { label: 'Двойной диплом', value: 'Казахстан', icon: 'diplom' },
    ],
    body: `## Вузы-партнёры

По странам; в скобках — последнее соглашение или форма сотрудничества.

- **Турция** — Стамбульский технический университет; Университет Пири Реис (меморандум о стратегическом сотрудничестве, 10.02.2026); Стамбульский университет — Джеррахпаша (меморандум, 18.05.2026); Технический университет Йылдыз (меморандум, 21.05.2026).
- **Украина** — Национальный транспортный университет вместе с Киевским институтом водного транспорта имени гетмана Петра Конашевича-Сагайдачного (меморандум, 03.07.2026); Национальный университет кораблестроения имени адмирала Макарова; Одесский национальный морской университет.
- **Казахстан** — Каспийский университет технологий и инжиниринга имени Ш. Есенова, Актау ([двойной диплом](${DOUBLE}), с 2011 года).
- **Грузия** — Батумская государственная морская академия; Батумский навигационный учебный университет.
- **Латвия** — Латвийская морская академия; Лиепайский морской колледж Рижского технического университета (Erasmus+, 2021–2027).
- **Эстония** — Эстонская морская академия (TalTech).
- **Литва** — Клайпедский университет.
- **Польша** — Морской университет Щецина.
- **Болгария** — Варненский технический университет.
- **Черногория** — Университет Черногории.
- **Россия** — Государственный университет морского и речного флота имени адмирала С. О. Макарова; Астраханский государственный технический университет; Государственный морской университет имени адмирала Ф. Ф. Ушакова; Морской государственный университет имени адмирала Г. И. Невельского.

## Компании и организации

- **GN Group Corporation (Турция)** — практика студентов на судах и верфях компании, тренинги, трудоустройство выпускников ([новость](${AZ(NEWS.gnMou)})).
- **Informacinė Raida (Литва)** и **Turksen Eğitim (Турция)** — многолетнее сотрудничество.
- **TİKA** — содействие в установлении связей с турецкими вузами и компаниями; организовало встречи в Стамбуле в мае 2026 года ([новость](${AZ(NEWS.cerrahpasa)})).

## Научные партнёры

- **Бранденбургский технический университет (Германия)** — совместные исследования и эксперименты по гранту Научного фонда Азербайджана (2025, [новость](${AZ(NEWS.btu2025)})).
- В ежегодной международной научно-технической конференции Академии участвуют учёные Турции, России, США, Украины, Грузии, Латвии, Польши и Казахстана — [Научные конференции](/sehife/elmi-konfranslar).

## Хотите стать партнёром?

Направьте предложение в [Отдел научных исследований и международных связей](${OFFICE}); как строится сотрудничество — на странице [Международное сотрудничество](${HUB}).`,
    faq: [
      {
        question: 'Что нужно, чтобы учиться в вузе-партнёре?',
        answer: 'Следите за объявлениями об обменах и проконсультируйтесь в Отделе научных исследований и международных связей. Шаги — на странице «Обмен и Erasmus+».',
      },
      {
        question: 'Возможно ли сотрудничество с вузом, которого нет в списке?',
        answer: 'Да. Предложение направляется в отдел; после встречи подписывается меморандум о взаимопонимании.',
      },
    ],
    sideLinks: [L_RU.hub, L_RU.mobility, L_RU.double, L_RU.office],
    contact: CONTACT_RU,
  },
};

// ── 3. Mübadilə və Erasmus+ (yeni; köhnə «Erasmus+ və Mevlana» yer tutanı) ────
const MOBILITY_PAGE: BeynelxalqPageSeed = {
  slug: 'mobillik-ve-mubadile',
  dataBlock: 'yox',
  az: {
    title: 'Mübadilə və Erasmus+',
    lead:
      'Tələbə və müəllimlərin xaricdə təhsil, tədris və təcrübə imkanları: Erasmus+ çərçivəsində Latviya ilə 2021–2027 müqaviləsi, ' +
      'Türkiyə və Ukrayna universitetləri ilə mübadilə memorandumları, xarici gəmiçilik şirkətində dəniz təcrübəsi.',
    seoDescription:
      'ADDA-da mübadilə: Erasmus+ (Liyepaya, 2021–2027), Türkiyə və Ukrayna universitetləri ilə memorandumlar, xaricdə təcrübə, müəllim mobilliyi, necə müraciət etmək.',
    stepsTitle: 'Mübadiləyə necə getmək olar',
    facts: [
      { label: 'Erasmus+ müqaviləsi', value: '2021–2027', icon: 'tarix' },
      { label: 'Erasmus+ tərəfdaşı', value: 'Liyepaya Dəniz Kolleci (Latviya)', icon: 'beynelxalq' },
      { label: 'Mübadilə memorandumu (2026)', value: '4 universitet', icon: 'sened' },
      { label: 'Xaricdə dəniz təcrübəsi', value: 'GN Group, Türkiyə', icon: 'gemi' },
    ],
    steps: [
      {
        title: 'Elanı izləyin',
        who: 'Şöbə və kafedralar',
        body: 'Mübadilə və Erasmus+ müsabiqələri Akademiyanın xəbər və elanlarında, kafedralarda elan olunur; seçim meyarları və müddət elanda göstərilir.',
      },
      {
        title: 'Şöbə ilə məsləhətləşin',
        who: 'Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsi',
        body: 'Hansı tərəfdaşa, hansı semestrdə və hansı dildə getmək mümkün olduğunu şöbədə öyrənin.',
        linkLabel: 'Şöbənin səhifəsi',
        linkUrl: OFFICE,
      },
      {
        title: 'Sənədləri hazırlayın',
        who: 'Tələbə',
        body: 'Adətən ərizə, akademik arayış (transkript), dil bilgisini təsdiq edən sənəd və motivasiya məktubu istənilir. Dəqiq siyahı elandadır.',
      },
      {
        title: 'Öyrənmə razılaşması',
        who: 'Tələbə, ADDA, tərəfdaş universitet',
        body: 'Erasmus+ qaydasına görə getməzdən əvvəl üçtərəfli öyrənmə razılaşması (Learning Agreement) imzalanır: xaricdə keçəcəyiniz fənlər və onların Akademiyada tanınması əvvəlcədən razılaşdırılır.',
      },
      {
        title: 'Qayıdış və kreditlərin tanınması',
        who: 'Dekanlıq',
        body: 'Tərəfdaş universitetin transkripti əsasında razılaşdırılmış fənlər Akademiyada nəzərə alınır.',
      },
    ],
    body: `## Erasmus+

- **Riqa Texniki Universitetinin Liyepaya Dəniz Kolleci (Latviya)** — 2021–2027-ci illər üçün Erasmus+ müqaviləsi. 2023-cü ilin mayında kollecin müəllimləri Akademiyada ingilisdilli qruplara mühazirə oxuyub ([xəbər](${NEWS.latvia2023})), avqustda ADDA-nın iki müəllimi Liyepayada dərs deyib və sertifikat alıb ([xəbər](${NEWS.erasmus2023})).
- **Qazi Universiteti (Türkiyə)** — Erasmus+ ekspertləri 2023-cü ilin sentyabrında «Tətbiqi mexanika» kafedrasında ustad dərsi keçib ([xəbər](${NEWS.gazi2023})).
- Akademiya Erasmus+ çərçivəsində koordinator kimi layihə təklifləri də hazırlayıb təqdim edib: «Development Education Management Information Systems», «Promotion of Entrepreneurial Spirit in HEIs» və nəqliyyat-logistika mühəndisliyi kurikulumu üzrə KARVAN.

## Universitetlərlə mübadilə (2026-cı il memorandumları)

| Universitet | Nə nəzərdə tutulub |
|---|---|
| Piri Reis Universiteti (Türkiyə) | akademik mübadilə, birgə tədris proqramları, ikili diplom, birgə elmi rəhbərlik, rəqəmsal təhsil ([xəbər](${NEWS.piriVisit})) |
| İstanbul Universiteti-Cerrahpaşa (Türkiyə) | mobillik, ikili diplom, rəqəmsallaşma, birgə layihələr ([xəbər](${NEWS.cerrahpasa})) |
| Yıldız Texniki Universiteti (Türkiyə) | universitet müəllimlərinin Akademiyada üç aylıq tədrisi, doktorantlara birgə elmi rəhbərlik, birgə məqalələr, yay və qış məktəbləri ([xəbər](${NEWS.yildiz})) |
| Milli Nəqliyyat Universiteti (Ukrayna) | bakalavr və magistrlərin mübadiləsi, müəllim səfərləri, birgə tədqiqat, qısamüddətli proqramlar ([xəbər](${NEWS.ntu})) |

## Xaricdə dəniz təcrübəsi

- **GN Group Corporation (Türkiyə)** — memorandum əsasında tələbələr 2026-cı ilin fevral–may aylarında şirkətin gəmilərində Qara, Mərmərə, Egey və Aralıq dənizlərində diplomqabağı təcrübə keçib ([xəbər](${NEWS.gnPractice})); yay mövsümündə daha 20 tələbənin təcrübəsi müzakirə olunub ([xəbər](${NEWS.gnVisit})).
- **Səudiyyə Ərəbistanı** — Nəqliyyat Baş İdarəsi ilə Səudiyyə şirkətlərində təcrübə imkanları müzakirə olunub (aprel 2026, [xəbər](${NEWS.saudi})).
- Təcrübənin növləri, müddəti və bazaları: [Təcrübə (praktika)](${PRACTICE}).

## Müəllim və tədqiqatçı mobilliyi

- Erasmus+ çərçivəsində müəllim mübadiləsi (Liyepaya, 2023).
- Yıldız Texniki Universitetinin müəllimlərinin Akademiyada tədrisi və birgə elmi rəhbərlik (2026 memorandumu).
- Brandenburq Texniki Universiteti (Almaniya) — Elm Fondunun qrantı ilə birgə tədqiqat ([xəbər](${NEWS.btu2025})).

## Yay və qış məktəbləri

Yay və qış məktəbləri Yıldız Texniki Universiteti və GN Group ilə memorandumlarda nəzərdə tutulub. Proqram elan olunanda Akademiyanın xəbərlərində dərc olunur.

## Xaricdə magistratura

ASCO-nun Gəmiçilikdə Təqaüd Proqramı məzunlara xaricdə magistr təhsili imkanı verir — [İxtisasartırma və xaricdə təhsil](${ABROAD}).`,
    faq: [
      {
        question: 'Mübadiləyə kim gedə bilər?',
        answer:
          'Bu, tərəfdaş universitetin və proqramın şərtlərindən asılıdır; meyarlar hər elanda göstərilir. Adətən akademik borcu olmayan və tədris dilini bilən tələbələr seçilir.',
      },
      {
        question: 'Xaricdə keçdiyim fənlər Akademiyada sayılırmı?',
        answer: 'Erasmus+ qaydasına görə öyrənmə razılaşmasında əvvəlcədən razılaşdırılmış fənlər tərəfdaşın transkripti əsasında nəzərə alınır.',
      },
      {
        question: 'Müəllimlər də mübadiləyə gedə bilərmi?',
        answer: 'Bəli. Erasmus+ çərçivəsində müəllim mobilliyi var; 2023-cü ildə ADDA müəllimləri Liyepayada, Liyepaya müəllimləri Bakıda dərs deyib.',
      },
      {
        question: 'Yay məktəbi varmı?',
        answer: 'Yay və qış məktəbləri Yıldız Texniki Universiteti və GN Group ilə memorandumlarda nəzərdə tutulub; proqram elan olunanda xəbərlərdə dərc olunur.',
      },
    ],
    sideLinks: [L_AZ.partners, L_AZ.double, { label: 'İxtisasartırma və xaricdə təhsil', url: ABROAD }, L_AZ.office],
    contact: CONTACT_AZ,
  },
  en: {
    title: 'Exchange and Erasmus+',
    lead:
      'Opportunities for students and staff to study, teach and train abroad: an Erasmus+ agreement with Latvia for 2021–2027, ' +
      'exchange memoranda with universities in Türkiye and Ukraine, and sea training with a foreign shipping company.',
    seoDescription:
      'Exchange at ADDA: Erasmus+ (Liepāja, 2021–2027), memoranda with universities in Türkiye and Ukraine, training abroad, staff mobility and how to apply.',
    stepsTitle: 'How to go on exchange',
    facts: [
      { label: 'Erasmus+ agreement', value: '2021–2027', icon: 'tarix' },
      { label: 'Erasmus+ partner', value: 'Liepāja Maritime College (Latvia)', icon: 'beynelxalq' },
      { label: 'Exchange memoranda (2026)', value: '4 universities', icon: 'sened' },
      { label: 'Sea training abroad', value: 'GN Group, Türkiye', icon: 'gemi' },
    ],
    steps: [
      {
        title: 'Watch for announcements',
        who: 'Office and departments',
        body: 'Exchange and Erasmus+ calls are announced in the Academy news and announcements and in the departments; each call states the selection criteria and dates.',
      },
      {
        title: 'Talk to the office',
        who: 'Research and International Relations Department',
        body: 'Find out which partner you can go to, in which semester and in which language.',
        linkLabel: 'Department page',
        linkUrl: OFFICE,
      },
      {
        title: 'Prepare your documents',
        who: 'Student',
        body: 'Usually an application, a transcript of records, proof of language skills and a motivation letter. The exact list is in the call.',
      },
      {
        title: 'Learning Agreement',
        who: 'Student, ADDA, partner university',
        body: 'Under Erasmus+ rules a three-party Learning Agreement is signed before departure: the courses you will take abroad and their recognition at the Academy are agreed in advance.',
      },
      {
        title: 'Return and credit recognition',
        who: 'Dean’s office',
        body: 'The agreed courses are recognised at the Academy on the basis of the partner university’s transcript.',
      },
    ],
    body: `## Erasmus+

- **Liepāja Maritime College of Riga Technical University (Latvia)** — an Erasmus+ agreement for 2021–2027. In May 2023 the college’s lecturers taught the Academy’s English-medium groups ([news](${AZ(NEWS.latvia2023)})), and in August two ADDA lecturers taught in Liepāja and received certificates ([news](${AZ(NEWS.erasmus2023)})).
- **Gazi University (Türkiye)** — Erasmus+ experts gave a master class in the Applied Mechanics Department in September 2023 ([news](${AZ(NEWS.gazi2023)})).
- As coordinator, the Academy has also prepared and submitted Erasmus+ project proposals: “Development Education Management Information Systems”, “Promotion of Entrepreneurial Spirit in HEIs” and KARVAN, on a transport and logistics engineering curriculum.

## University exchanges (2026 memoranda)

| University | What is planned |
|---|---|
| Piri Reis University (Türkiye) | academic exchange, joint programmes, double degrees, joint supervision, digital education ([news](${AZ(NEWS.piriVisit)})) |
| Istanbul University-Cerrahpaşa (Türkiye) | mobility, double degrees, digitalisation, joint projects ([news](${AZ(NEWS.cerrahpasa)})) |
| Yıldız Technical University (Türkiye) | three-month teaching stays at the Academy by its lecturers, joint supervision of doctoral students, joint papers, summer and winter schools ([news](${AZ(NEWS.yildiz)})) |
| National Transport University (Ukraine) | bachelor’s and master’s exchange, staff visits, joint research, short programmes ([news](${AZ(NEWS.ntu)})) |

## Sea training abroad

- **GN Group Corporation (Türkiye)** — under the memorandum, students did their pre-graduation sea training on the company’s ships in the Black, Marmara, Aegean and Mediterranean seas from February to May 2026 ([news](${AZ(NEWS.gnPractice)})); summer placements for 20 more students were discussed ([news](${AZ(NEWS.gnVisit)})).
- **Saudi Arabia** — internships with Saudi companies were discussed with the Transport General Authority (April 2026, [news](${AZ(NEWS.saudi)})).
- Types, duration and bases of practical training: [Practical training](${PRACTICE}).

## Staff and researcher mobility

- Staff exchange under Erasmus+ (Liepāja, 2023).
- Teaching stays and joint supervision with Yıldız Technical University (2026 memorandum).
- Brandenburg University of Technology (Germany) — joint research funded by the Science Foundation ([news](${AZ(NEWS.btu2025)})).

## Summer and winter schools

Summer and winter schools are provided for in the memoranda with Yıldız Technical University and GN Group. When a programme is announced, it is published in the Academy news.

## Master’s degree abroad

ASCO’s Shipping Scholarship Programme gives graduates the opportunity to take a master’s degree abroad — [Professional development and study abroad](${ABROAD}).`,
    faq: [
      {
        question: 'Who can go on exchange?',
        answer:
          'It depends on the partner university and the programme; the criteria are given in each call. Students without academic debts who know the language of instruction are usually selected.',
      },
      {
        question: 'Will the courses I take abroad count at the Academy?',
        answer: 'Under Erasmus+ rules, courses agreed in advance in the Learning Agreement are recognised on the basis of the partner’s transcript.',
      },
      {
        question: 'Can lecturers go on exchange too?',
        answer: 'Yes. Erasmus+ includes staff mobility; in 2023 ADDA lecturers taught in Liepāja and Liepāja lecturers taught in Baku.',
      },
      {
        question: 'Are there summer schools?',
        answer: 'Summer and winter schools are provided for in the memoranda with Yıldız Technical University and GN Group; programmes are announced in the news.',
      },
    ],
    sideLinks: [L_EN.partners, L_EN.double, { label: 'Professional development and study abroad', url: ABROAD }, L_EN.office],
    contact: CONTACT_EN,
  },
  ru: {
    title: 'Обмен и Erasmus+',
    lead:
      'Возможности для студентов и преподавателей учиться, преподавать и проходить практику за рубежом: соглашение Erasmus+ с Латвией на 2021–2027 годы, ' +
      'меморандумы об обмене с университетами Турции и Украины, морская практика в зарубежной судоходной компании.',
    seoDescription:
      'Обмен в АГМА: Erasmus+ (Лиепая, 2021–2027), меморандумы с вузами Турции и Украины, практика за рубежом, мобильность преподавателей, как подать заявку.',
    stepsTitle: 'Как поехать по обмену',
    facts: [
      { label: 'Соглашение Erasmus+', value: '2021–2027', icon: 'tarix' },
      { label: 'Партнёр по Erasmus+', value: 'Лиепайский морской колледж (Латвия)', icon: 'beynelxalq' },
      { label: 'Меморандумы об обмене (2026)', value: '4 университета', icon: 'sened' },
      { label: 'Морская практика за рубежом', value: 'GN Group, Турция', icon: 'gemi' },
    ],
    steps: [
      {
        title: 'Следите за объявлениями',
        who: 'Отдел и кафедры',
        body: 'Конкурсы по обмену и Erasmus+ объявляются в новостях и объявлениях Академии и на кафедрах; критерии отбора и сроки указаны в объявлении.',
      },
      {
        title: 'Проконсультируйтесь в отделе',
        who: 'Отдел научных исследований и международных связей',
        body: 'Узнайте, к какому партнёру, в каком семестре и на каком языке можно поехать.',
        linkLabel: 'Страница отдела',
        linkUrl: OFFICE,
      },
      {
        title: 'Подготовьте документы',
        who: 'Студент',
        body: 'Обычно требуются заявление, академическая справка (транскрипт), подтверждение знания языка и мотивационное письмо. Точный список — в объявлении.',
      },
      {
        title: 'Соглашение об обучении',
        who: 'Студент, АГМА, вуз-партнёр',
        body: 'По правилам Erasmus+ до отъезда подписывается трёхстороннее соглашение об обучении (Learning Agreement): дисциплины за рубежом и их признание в Академии согласуются заранее.',
      },
      {
        title: 'Возвращение и признание кредитов',
        who: 'Деканат',
        body: 'Согласованные дисциплины засчитываются в Академии на основании транскрипта вуза-партнёра.',
      },
    ],
    body: `## Erasmus+

- **Лиепайский морской колледж Рижского технического университета (Латвия)** — соглашение Erasmus+ на 2021–2027 годы. В мае 2023 года преподаватели колледжа читали лекции англоязычным группам Академии ([новость](${AZ(NEWS.latvia2023)})), в августе два преподавателя АГМА вели занятия в Лиепае и получили сертификаты ([новость](${AZ(NEWS.erasmus2023)})).
- **Университет Гази (Турция)** — эксперты Erasmus+ провели мастер-класс на кафедре прикладной механики в сентябре 2023 года ([новость](${AZ(NEWS.gazi2023)})).
- Как координатор Академия также подготовила и подала проектные предложения Erasmus+: «Development Education Management Information Systems», «Promotion of Entrepreneurial Spirit in HEIs» и KARVAN — учебная программа по транспортно-логистической инженерии.

## Обмен с университетами (меморандумы 2026 года)

| Университет | Что предусмотрено |
|---|---|
| Университет Пири Реис (Турция) | академический обмен, совместные программы, двойной диплом, совместное научное руководство, цифровое образование ([новость](${AZ(NEWS.piriVisit)})) |
| Стамбульский университет — Джеррахпаша (Турция) | мобильность, двойной диплом, цифровизация, совместные проекты ([новость](${AZ(NEWS.cerrahpasa)})) |
| Технический университет Йылдыз (Турция) | трёхмесячное преподавание его сотрудников в Академии, совместное руководство докторантами, совместные статьи, летние и зимние школы ([новость](${AZ(NEWS.yildiz)})) |
| Национальный транспортный университет (Украина) | обмен бакалаврами и магистрантами, визиты преподавателей, совместные исследования, краткосрочные программы ([новость](${AZ(NEWS.ntu)})) |

## Морская практика за рубежом

- **GN Group Corporation (Турция)** — по меморандуму студенты в феврале–мае 2026 года прошли преддипломную практику на судах компании в Чёрном, Мраморном, Эгейском и Средиземном морях ([новость](${AZ(NEWS.gnPractice)})); обсуждена летняя практика ещё для 20 студентов ([новость](${AZ(NEWS.gnVisit)})).
- **Саудовская Аравия** — с Главным управлением транспорта обсуждены стажировки в саудовских компаниях (апрель 2026, [новость](${AZ(NEWS.saudi)})).
- Виды, сроки и базы практики: [Практика](${PRACTICE}).

## Мобильность преподавателей и исследователей

- Обмен преподавателями по Erasmus+ (Лиепая, 2023).
- Преподавание и совместное научное руководство с Техническим университетом Йылдыз (меморандум 2026 года).
- Бранденбургский технический университет (Германия) — совместные исследования по гранту Научного фонда ([новость](${AZ(NEWS.btu2025)})).

## Летние и зимние школы

Летние и зимние школы предусмотрены меморандумами с Техническим университетом Йылдыз и GN Group. Когда программа будет объявлена, её опубликуют в новостях Академии.

## Магистратура за рубежом

Стипендиальная программа ASCO в области судоходства даёт выпускникам возможность получить магистерскую степень за рубежом — [Повышение квалификации и обучение за рубежом](${ABROAD}).`,
    faq: [
      {
        question: 'Кто может поехать по обмену?',
        answer:
          'Это зависит от условий вуза-партнёра и программы; критерии указываются в каждом объявлении. Обычно отбирают студентов без академических задолженностей, владеющих языком обучения.',
      },
      {
        question: 'Засчитают ли в Академии дисциплины, пройденные за рубежом?',
        answer: 'По правилам Erasmus+ дисциплины, заранее согласованные в соглашении об обучении, засчитываются на основании транскрипта партнёра.',
      },
      {
        question: 'Могут ли по обмену поехать преподаватели?',
        answer: 'Да. Erasmus+ включает мобильность преподавателей; в 2023 году преподаватели АГМА вели занятия в Лиепае, а преподаватели из Лиепаи — в Баку.',
      },
      {
        question: 'Есть ли летние школы?',
        answer: 'Летние и зимние школы предусмотрены меморандумами с Техническим университетом Йылдыз и GN Group; программы объявляются в новостях.',
      },
    ],
    sideLinks: [L_RU.partners, L_RU.double, { label: 'Повышение квалификации и обучение за рубежом', url: ABROAD }, L_RU.office],
    contact: CONTACT_RU,
  },
};

// ── 4. İkili diplom proqramları (yeni; köhnə «hazırlanır» ünvanı) ───────────────
const DOUBLE_PAGE: BeynelxalqPageSeed = {
  slug: 'ikili-diplom-layiheleri',
  dataBlock: 'yox',
  az: {
    title: 'İkili diplom proqramları',
    lead:
      'İkili diplom tələbəyə iki universitetin diplomunu verir. ADDA 2011-ci ildən Qazaxıstanın Ş. Yesenov adına Xəzər Texnologiya və Mühəndislik Universiteti ilə ' +
      'bu modeldə dənizçi hazırlayır; Türkiyə və Səudiyyə Ərəbistanı tərəfdaşları ilə yeni proqramlar müzakirə olunur.',
    seoDescription:
      'ADDA-da ikili diplom: Yesenov Universiteti (Aktau) ilə 1+3+1 modeli, tarixçə və rəqəmlər, Türkiyə və Səudiyyə tərəfdaşları ilə müzakirə olunan proqramlar.',
    stepsTitle: 'Yesenov Universiteti ilə ikili diplom: təhsil yolu',
    facts: [
      { label: 'Tərəfdaş', value: 'Yesenov Universiteti, Aktau', icon: 'beynelxalq' },
      { label: 'Model', value: '1 + 3 + 1 il', icon: 'muddet' },
      { label: 'Diplom', value: '2 universitetin', icon: 'diplom' },
      { label: 'Başlanğıc', value: '2011', icon: 'tarix' },
    ],
    steps: [
      {
        title: '1-ci il — Aktauda',
        who: 'Yesenov Universiteti',
        body: 'Tələbə birinci kursu Qazaxıstanda, tərəfdaş universitetdə oxuyur.',
      },
      {
        title: 'II–IV kurslar — Bakıda',
        who: 'ADDA',
        body: 'Tələbə Akademiyada oxuyur və dəniz təcrübəsi keçir. Yekun attestasiyadan sonra ADDA-nın bakalavr diplomu verilir.',
        linkLabel: 'Təcrübə (praktika)',
        linkUrl: PRACTICE,
      },
      {
        title: '5-ci il — yenidən Aktauda',
        who: 'Yesenov Universiteti',
        body: 'Tələbə tərəfdaş universitetə qayıdır və ikinci diplomu alır.',
      },
    ],
    body: `## Model necə işləyir

| Mərhələ | Harada | Nəticə |
|---|---|---|
| 1-ci il | Yesenov Universiteti (Aktau) | birinci kurs |
| II–IV kurslar | ADDA (Bakı) | ADDA-nın bakalavr diplomu |
| 5-ci il | Yesenov Universiteti | ikinci diplom |

Tədris planları hər iki universitetin proqramları əsasında uzlaşdırılır; ADDA-da bu planlar Elmi Şurada təsdiq olunur (2022, [xəbər](${NEWS.kzCouncil2022})).

## Tarixçə

- **2011** — ikili diplom müqaviləsi. 2017-ci ilə qədər Qazaxıstan üçün 40-a yaxın mütəxəssis (bakalavr və magistr) hazırlanıb ([xəbər](${NEWS.kz2017})).
- **2017** — əlavə memorandum: tələbə və müəllim mobilliyi, birgə tədqiqat və nəşrlər ([xəbər](${NEWS.kz2017})).
- **2021** — «İkili diplom təhsili» üzrə yeni müqavilə; 2022/2023-cü tədris ilində 8 tələbə Akademiyaya gəlib ([xəbər](${NEWS.kz2022})).
- **2023** — II kurs tələbələri (dəniz naviqasiyası və gəmi energetik qurğuları ixtisasları) «Sabit Orucov» gəmisində təcrübə keçib ([xəbər](${NEWS.kzPractice2023})).

## Müzakirə olunan yeni proqramlar

- **Piri Reis Universiteti (Türkiyə)** — ikili diplom 2026-cı ilin mayındakı görüşdə prioritet istiqamətlər arasında olub ([xəbər](${NEWS.piriVisit})).
- **İstanbul Universiteti-Cerrahpaşa (Türkiyə)** — memorandum ikili diplomu da əhatə edir ([xəbər](${NEWS.cerrahpasa})).
- **Səudiyyə Ərəbistanının Nəqliyyat Baş İdarəsi** — ikili diplom və mübadilə müzakirə olunub (aprel 2026, [xəbər](${NEWS.saudi})).
- **TİKA** — türkiyəli tələbələr üçün ikili diplom imkanları müzakirə olunub (oktyabr 2025, [xəbər](${NEWS.tika})).

Yeni proqram razılaşdırılanda şərtləri, ixtisaslar və müraciət qaydası bu səhifədə dərc olunacaq.`,
    faq: [
      {
        question: 'ADDA tələbəsi ikili diploma necə qoşula bilər?',
        answer:
          'Hazırda fəaliyyət göstərən proqram Qazaxıstan tərəfinin tələbələri üçündür. ADDA tələbələri üçün yeni proqramlar Türkiyə tərəfdaşları ilə müzakirə olunur — elanı izləyin və ya şöbəyə yazın.',
      },
      {
        question: 'İkili diplom hansı ixtisaslardadır?',
        answer: 'Yesenov Universiteti ilə proqramın tələbələri 2023-cü ildə dəniz naviqasiyası və gəmi energetik qurğularının istismarı ixtisaslarında oxuyurdu.',
      },
      {
        question: 'İki diplom nə verir?',
        answer: 'Məzun hər iki ölkənin universitetinin diplomuna sahib olur; bu, hər iki ölkənin dənizçilik sektorunda işə qəbulu asanlaşdırır.',
      },
    ],
    sideLinks: [L_AZ.mobility, L_AZ.partners, L_AZ.hub, L_AZ.office],
    contact: CONTACT_AZ,
  },
  en: {
    title: 'Double Degree Programmes',
    lead:
      'A double degree gives the student diplomas from two universities. Since 2011 ADDA has trained seafarers on this model with Yessenov University in Kazakhstan; ' +
      'new programmes are under discussion with partners in Türkiye and Saudi Arabia.',
    seoDescription:
      'Double degrees at ADDA: the 1+3+1 model with Yessenov University (Aktau), history and figures, programmes under discussion with Turkish and Saudi partners.',
    stepsTitle: 'Double degree with Yessenov University: the study path',
    facts: [
      { label: 'Partner', value: 'Yessenov University, Aktau', icon: 'beynelxalq' },
      { label: 'Model', value: '1 + 3 + 1 years', icon: 'muddet' },
      { label: 'Diplomas', value: 'From 2 universities', icon: 'diplom' },
      { label: 'Since', value: '2011', icon: 'tarix' },
    ],
    steps: [
      {
        title: 'Year 1 — in Aktau',
        who: 'Yessenov University',
        body: 'The student takes the first year in Kazakhstan, at the partner university.',
      },
      {
        title: 'Years 2–4 — in Baku',
        who: 'ADDA',
        body: 'The student studies at the Academy and completes sea training. After the final attestation ADDA awards its bachelor’s diploma.',
        linkLabel: 'Practical training',
        linkUrl: PRACTICE,
      },
      {
        title: 'Year 5 — back in Aktau',
        who: 'Yessenov University',
        body: 'The student returns to the partner university and receives the second diploma.',
      },
    ],
    body: `## How the model works

| Stage | Where | Result |
|---|---|---|
| Year 1 | Yessenov University (Aktau) | first year |
| Years 2–4 | ADDA (Baku) | ADDA bachelor’s diploma |
| Year 5 | Yessenov University | second diploma |

The study plans are aligned on the basis of both universities’ programmes; at ADDA they are approved by the Academic Council (2022, [news](${AZ(NEWS.kzCouncil2022)})).

## History

- **2011** — the double degree agreement. By 2017 about 40 specialists (bachelor’s and master’s) had been trained for Kazakhstan ([news](${AZ(NEWS.kz2017)})).
- **2017** — an additional memorandum: student and staff mobility, joint research and publications ([news](${AZ(NEWS.kz2017)})).
- **2021** — a new “double degree education” agreement; 8 students came to the Academy in 2022/2023 ([news](${AZ(NEWS.kz2022)})).
- **2023** — second-year students (marine navigation and marine power plants) did their sea training on the “Sabit Orujov” ship ([news](${AZ(NEWS.kzPractice2023)})).

## New programmes under discussion

- **Piri Reis University (Türkiye)** — double degrees were among the priorities at the May 2026 meeting ([news](${AZ(NEWS.piriVisit)})).
- **Istanbul University-Cerrahpaşa (Türkiye)** — the memorandum also covers double degrees ([news](${AZ(NEWS.cerrahpasa)})).
- **Transport General Authority of Saudi Arabia** — double degrees and exchanges were discussed (April 2026, [news](${AZ(NEWS.saudi)})).
- **TİKA** — double degree options for students from Türkiye were discussed (October 2025, [news](${AZ(NEWS.tika)})).

When a new programme is agreed, its conditions, specialities and application procedure will be published on this page.`,
    faq: [
      {
        question: 'How can an ADDA student join a double degree?',
        answer:
          'The current programme is for students from the Kazakh side. New programmes for ADDA students are being discussed with partners in Türkiye — watch for announcements or write to the office.',
      },
      {
        question: 'Which specialities does the double degree cover?',
        answer: 'In 2023 the Yessenov University students on the programme were studying marine navigation and operation of marine power plants.',
      },
      {
        question: 'What does a double degree give you?',
        answer: 'The graduate holds diplomas from universities in both countries, which makes it easier to find work in either country’s maritime sector.',
      },
    ],
    sideLinks: [L_EN.mobility, L_EN.partners, L_EN.hub, L_EN.office],
    contact: CONTACT_EN,
  },
  ru: {
    title: 'Программы двойного диплома',
    lead:
      'Двойной диплом даёт студенту дипломы двух университетов. С 2011 года АГМА готовит моряков по этой модели вместе с Каспийским университетом ' +
      'технологий и инжиниринга имени Ш. Есенова (Казахстан); новые программы обсуждаются с партнёрами из Турции и Саудовской Аравии.',
    seoDescription:
      'Двойной диплом в АГМА: модель 1+3+1 с Университетом Есенова (Актау), история и цифры, обсуждаемые программы с турецкими и саудовскими партнёрами.',
    stepsTitle: 'Двойной диплом с Университетом Есенова: путь обучения',
    facts: [
      { label: 'Партнёр', value: 'Университет Есенова, Актау', icon: 'beynelxalq' },
      { label: 'Модель', value: '1 + 3 + 1 год', icon: 'muddet' },
      { label: 'Дипломы', value: 'Двух университетов', icon: 'diplom' },
      { label: 'С', value: '2011 года', icon: 'tarix' },
    ],
    steps: [
      {
        title: '1-й год — в Актау',
        who: 'Университет Есенова',
        body: 'Первый курс студент учится в Казахстане, в университете-партнёре.',
      },
      {
        title: 'II–IV курсы — в Баку',
        who: 'АГМА',
        body: 'Студент учится в Академии и проходит морскую практику. После итоговой аттестации выдаётся диплом бакалавра АГМА.',
        linkLabel: 'Практика',
        linkUrl: PRACTICE,
      },
      {
        title: '5-й год — снова в Актау',
        who: 'Университет Есенова',
        body: 'Студент возвращается в университет-партнёр и получает второй диплом.',
      },
    ],
    body: `## Как работает модель

| Этап | Где | Результат |
|---|---|---|
| 1-й год | Университет Есенова (Актау) | первый курс |
| II–IV курсы | АГМА (Баку) | диплом бакалавра АГМА |
| 5-й год | Университет Есенова | второй диплом |

Учебные планы согласуются на основе программ обоих университетов; в АГМА их утверждает Учёный совет (2022, [новость](${AZ(NEWS.kzCouncil2022)})).

## История

- **2011** — соглашение о двойном дипломе. К 2017 году для Казахстана подготовлено около 40 специалистов (бакалавров и магистров) ([новость](${AZ(NEWS.kz2017)})).
- **2017** — дополнительный меморандум: мобильность студентов и преподавателей, совместные исследования и публикации ([новость](${AZ(NEWS.kz2017)})).
- **2021** — новое соглашение об «обучении по программе двойного диплома»; в 2022/2023 учебном году в Академию приехали 8 студентов ([новость](${AZ(NEWS.kz2022)})).
- **2023** — студенты II курса (морская навигация и судовые энергетические установки) прошли практику на судне «Сабит Оруджев» ([новость](${AZ(NEWS.kzPractice2023)})).

## Обсуждаемые новые программы

- **Университет Пири Реис (Турция)** — двойной диплом был среди приоритетов на встрече в мае 2026 года ([новость](${AZ(NEWS.piriVisit)})).
- **Стамбульский университет — Джеррахпаша (Турция)** — меморандум охватывает и двойной диплом ([новость](${AZ(NEWS.cerrahpasa)})).
- **Главное управление транспорта Саудовской Аравии** — обсуждались двойной диплом и обмены (апрель 2026, [новость](${AZ(NEWS.saudi)})).
- **TİKA** — обсуждались возможности двойного диплома для студентов из Турции (октябрь 2025, [новость](${AZ(NEWS.tika)})).

Когда новая программа будет согласована, её условия, специальности и порядок подачи заявлений опубликуют на этой странице.`,
    faq: [
      {
        question: 'Как студенту АГМА попасть на программу двойного диплома?',
        answer:
          'Действующая программа предназначена для студентов казахстанской стороны. Новые программы для студентов АГМА обсуждаются с турецкими партнёрами — следите за объявлениями или напишите в отдел.',
      },
      {
        question: 'По каким специальностям действует двойной диплом?',
        answer: 'В 2023 году студенты программы с Университетом Есенова учились по специальностям «морская навигация» и «эксплуатация судовых энергетических установок».',
      },
      {
        question: 'Что даёт двойной диплом?',
        answer: 'Выпускник получает дипломы университетов двух стран, что облегчает трудоустройство в морской отрасли обеих стран.',
      },
    ],
    sideLinks: [L_RU.mobility, L_RU.partners, L_RU.hub, L_RU.office],
    contact: CONTACT_RU,
  },
};

// ── 5. Əcnəbi tələbələr üçün bələdçi (köhnə «Əcnəbi tələbələrin təhsili») ──────
const GUIDE_PAGE: BeynelxalqPageSeed = {
  slug: 'ecnebi-telebelerin-tehsili',
  dataBlock: 'yox',
  az: {
    title: 'Əcnəbi tələbələr üçün bələdçi',
    lead:
      'Qəbuldan sonra: Bakıya gəliş, miqrasiya qeydiyyatı, yataqxana, dil hazırlığı, dəniz təcrübəsi və gündəlik dəstək. ' +
      '2023/2024-cü tədris ilində Akademiyada 43 əcnəbi tələbə təhsil alırdı.',
    seoDescription:
      'ADDA-da əcnəbi tələbələr: gəliş və viza, miqrasiya qeydiyyatı, müvəqqəti yaşama icazəsi, ödənişsiz yataqxana, dil kursu, təcrübə, kimə müraciət etmək.',
    stepsTitle: 'Gəlişdən dərslərə qədər',
    facts: [
      { label: 'Təhsil haqqı (2026/2027)', value: '5100 AZN/il', icon: 'haqq' },
      { label: 'Yataqxana, forma, dərs vəsaiti', value: 'Ödənişsiz', icon: 'bina' },
      { label: 'Müvəqqəti yaşama icazəsi', value: '1 il', icon: 'sened' },
      { label: 'Tədris dili', value: 'Azərbaycan, ingilis, rus', icon: 'dil' },
    ],
    steps: [
      {
        title: 'Qəbul və viza',
        who: 'ADDA, ASAN Viza',
        body: 'Müsahibədən sonra qəbulunuz təsdiqlənir. Azərbaycana giriş qaydası vətəndaşlığınızdan asılıdır; elektron viza evisa.gov.az portalında verilir.',
        linkLabel: 'Qəbul qaydaları',
        linkUrl: ADMISSION,
      },
      {
        title: 'Sənədlərin əsli',
        period: 'Gəlişdən sonra',
        who: 'ADDA',
        body: 'Sənədlərin əslini təqdim edirsiniz; hamısı tərcümə edilməli və notarial qaydada təsdiqlənməlidir.',
        linkLabel: 'Sənədlərin siyahısı',
        linkUrl: `${ADMISSION}#senedler`,
      },
      {
        title: 'Tibbi arayış',
        who: 'International Medical Center (Bakı)',
        body: 'Dövlət Miqrasiya Xidməti üçün sağlamlıq arayışı Bakıdakı International Medical Center-dən alınır.',
      },
      {
        title: 'Miqrasiya qeydiyyatı',
        who: 'Beynəlxalq əlaqələr şöbəsi, Dövlət Miqrasiya Xidməti',
        body: 'Şöbə müvəqqəti yaşama icazəsi üçün sənədlərinizi toplayıb Dövlət Miqrasiya Xidmətinə təqdim edir. Əyani təhsil alan əcnəbi tələbəyə bir illik müvəqqəti yaşama hüququ verilir.',
        linkLabel: 'migration.gov.az',
        linkUrl: MIGRATION,
      },
      {
        title: 'Yataqxanaya yerləşmə',
        who: 'ADDA',
        body: 'Əcnəbi tələbələr yataqxanada ümumi əsaslarla yerləşdirilir; 2026/2027-ci ildə yataqxana onlar üçün ödənişsizdir.',
        linkLabel: 'Yataqxana',
        linkUrl: DORM,
      },
      {
        title: 'Dərslər başlayır',
        period: '15 sentyabr',
        who: 'ADDA',
        body: 'Tədris dilini kifayət qədər bilmirsinizsə, əvvəlcə Azərbaycan və ya ingilis dili üzrə ödənişli hazırlıq kursu keçə bilərsiniz.',
      },
    ],
    body: `## Kim kömək edir

Əcnəbi tələbələrlə [Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsi](${OFFICE}) işləyir:

- müvəqqəti yaşama icazəsi üçün sənədləri toplayır və Dövlət Miqrasiya Xidmətinə təqdim edir;
- Elm və Təhsil Nazirliyi və Dövlət Miqrasiya Xidməti ilə əlaqə saxlayır;
- əcnəbi tələbələrin məktub və sorğularını cavablandırır;
- Akademiyadakı tədbir, konfrans və seminarlar barədə məlumat verir.

Qəbul və təhsil haqqı barədə: akademiya@asco.az, +994 12 493 36 44.

## Tədris və dil

- **Bakalavriat (4 il):** Dəniz naviqasiyası mühəndisliyi — Azərbaycan, ingilis, rus; Gəmi energetik qurğularının istismarı mühəndisliyi — Azərbaycan, ingilis; digər ixtisaslar — Azərbaycan dilində.
- **Magistratura (2 il):** Azərbaycan dilində.
- **Hazırlıq kursları:** Azərbaycan və ingilis dili üzrə, ödənişli, 6 və ya 12 ay.
- İngilisdilli qruplar barədə: [İngilis dilində tədris](${ENGLISH}).

## Dəniz təcrübəsi

Əcnəbi tələbələr də tədris planına uyğun dəniz təcrübəsi keçir. Məsələn, 2023-cü ildə ikili diplom proqramının II kurs tələbələri «Sabit Orucov» gəmisində təcrübəyə başlamazdan əvvəl gəmidə təhlükəsizlik üzrə giriş təlimatı keçib ([xəbər](${NEWS.kzPractice2023})). Ətraflı: [Təcrübə (praktika)](${PRACTICE}).

## Gündəlik həyat

- **Yataqxana** — 2026/2027-ci ildə əcnəbi tələbələr üçün ödənişsiz: [Yataqxana](${DORM}).
- **Geyim forması və tədris materialları** — ödənişsiz.
- **Tələbə həyatı** — tələbə təşkilatları, idman və intellektual yarışlar hamı üçün açıqdır; məsələn, «Hüquq zəkası» yarışında əcnəbi tələbələr də iştirak edib ([xəbər](${NEWS.lawQuiz})). 2025-ci ilin dekabrında Həmrəylik Günü və Yeni il münasibətilə əcnəbi tələbələrlə görüş keçirilib ([xəbər](${NEWS.newYear2025})). Ətraflı: [Tələbə həyatı](/sehife/telebe-heyati).

## Rəqəmlər

| Tədris ili | Qəbul olunan əcnəbi tələbə | Ölkələr |
|---|---|---|
| 2022/2023 | 20, o cümlədən ikili diplom proqramı ilə 8 | Hindistan, Türkiyə, Qazaxıstan, İraq ([xəbər](${NEWS.kz2022})) |
| 2023/2024 | 20; ümumilikdə 43 əcnəbi tələbə | Türkiyə, Hindistan, Misir, Sudan, Rusiya ([xəbər](${NEWS.foreign2023})) |

Akademiyanın diplomu 170-dən çox ölkədə tanınır.`,
    faq: [
      {
        question: 'Yaşama icazəsini necə alıram?',
        answer:
          'Beynəlxalq əlaqələr şöbəsi sənədlərinizi toplayıb Dövlət Miqrasiya Xidmətinə təqdim edir. Əyani təhsil alan əcnəbi tələbəyə bir illik müvəqqəti yaşama hüququ verilir; Miqrasiya Xidməti üçün tibbi arayış International Medical Center-dən alınır.',
      },
      {
        question: 'Yataqxana ödənişlidirmi?',
        answer: '2026/2027-ci tədris ilində əcnəbi tələbələr üçün yataqxana, geyim forması və tədris materialları ödənişsizdir.',
      },
      {
        question: 'İngilis dilində oxuya bilərəmmi?',
        answer: 'Bəli: Dəniz naviqasiyası mühəndisliyi və Gəmi energetik qurğularının istismarı mühəndisliyi bakalavriatda ingilis dilində də tədris olunur.',
      },
      {
        question: 'Sualım var. Kimə yazım?',
        answer: 'Qəbul və təhsil haqqı barədə — akademiya@asco.az (+994 12 493 36 44). Digər məsələlər üzrə onlayn forma ilə «Beynəlxalq əlaqələr və əcnəbi tələbələr» istiqamətinə yazın.',
      },
    ],
    sideLinks: [
      L_AZ.admission,
      { label: '2026/2027 qəbul elanı', url: ADMISSION_2026 },
      { label: 'ASAN Viza', url: EVISA },
      { label: 'Dövlət Miqrasiya Xidməti', url: MIGRATION },
      { label: 'İngilis dilində tədris', url: ENGLISH },
    ],
    contact: CONTACT_AZ,
  },
  en: {
    title: 'Guide for International Students',
    lead:
      'After admission: arriving in Baku, migration registration, the residence hall, language preparation, sea training and everyday support. ' +
      'In 2023/2024, 43 international students were studying at the Academy.',
    seoDescription:
      'International students at ADDA: arrival and visa, migration registration, temporary residence permit, free residence hall, language course, training, who to contact.',
    stepsTitle: 'From arrival to the first class',
    facts: [
      { label: 'Tuition fee (2026/2027)', value: '5,100 AZN per year', icon: 'haqq' },
      { label: 'Residence hall, uniform, materials', value: 'Free of charge', icon: 'bina' },
      { label: 'Temporary residence permit', value: '1 year', icon: 'sened' },
      { label: 'Language of instruction', value: 'Azerbaijani, English, Russian', icon: 'dil' },
    ],
    steps: [
      {
        title: 'Admission and visa',
        who: 'ADDA, ASAN Visa',
        body: 'After the interview your admission is confirmed. Entry rules depend on your citizenship; electronic visas are issued at evisa.gov.az.',
        linkLabel: 'Admission rules',
        linkUrl: ADMISSION,
      },
      {
        title: 'Original documents',
        period: 'After arrival',
        who: 'ADDA',
        body: 'You submit the originals; all documents must be translated and notarised.',
        linkLabel: 'List of documents',
        linkUrl: `${ADMISSION}#documents`,
      },
      {
        title: 'Medical certificate',
        who: 'International Medical Center (Baku)',
        body: 'The health certificate for the State Migration Service is issued by the International Medical Center in Baku.',
      },
      {
        title: 'Migration registration',
        who: 'International Relations Department, State Migration Service',
        body: 'The department collects your documents for the temporary residence permit and submits them to the State Migration Service. Full-time international students receive the right to temporary residence for one year.',
        linkLabel: 'migration.gov.az',
        linkUrl: MIGRATION,
      },
      {
        title: 'Moving into the residence hall',
        who: 'ADDA',
        body: 'International students are accommodated in the residence hall on the same basis as others; in 2026/2027 it is free of charge for them.',
        linkLabel: 'Residence hall',
        linkUrl: DORM,
      },
      {
        title: 'Classes start',
        period: '15 September',
        who: 'ADDA',
        body: 'If your command of the language of instruction is not sufficient, you can first take a paid Azerbaijani or English preparatory course.',
      },
    ],
    body: `## Who helps you

The [Research and International Relations Department](${OFFICE}) works with international students:

- collects documents for the temporary residence permit and submits them to the State Migration Service;
- liaises with the Ministry of Science and Education and the State Migration Service;
- answers international students’ letters and requests;
- informs students about events, conferences and seminars at the Academy.

On admission and tuition fees: akademiya@asco.az, +994 12 493 36 44.

## Studies and language

- **Bachelor’s (4 years):** Marine Navigation Engineering — Azerbaijani, English, Russian; Marine Power Plant Operation Engineering — Azerbaijani, English; other programmes — in Azerbaijani.
- **Master’s (2 years):** in Azerbaijani.
- **Preparatory courses:** Azerbaijani and English, fee-paying, 6 or 12 months.
- About English-medium groups: [English-taught programmes](${ENGLISH}).

## Sea training

International students complete sea training according to the curriculum. In 2023, for example, second-year double degree students received a safety induction before starting their training on the “Sabit Orujov” ship ([news](${AZ(NEWS.kzPractice2023)})). More: [Practical training](${PRACTICE}).

## Everyday life

- **Residence hall** — free of charge for international students in 2026/2027: [Residence hall](${DORM}).
- **Uniform and study materials** — free of charge.
- **Student life** — student organisations, sport and quiz competitions are open to everyone; international students took part in the “Legal Mind” quiz, for example ([news](${AZ(NEWS.lawQuiz)})). In December 2025 the Academy held a meeting with its international students for Solidarity Day and the New Year ([news](${AZ(NEWS.newYear2025)})). More: [Student life](/sehife/telebe-heyati).

## Facts and figures

| Academic year | International students admitted | Countries |
|---|---|---|
| 2022/2023 | 20, including 8 on the double degree programme | India, Türkiye, Kazakhstan, Iraq ([news](${AZ(NEWS.kz2022)})) |
| 2023/2024 | 20; 43 international students in total | Türkiye, India, Egypt, Sudan, Russia ([news](${AZ(NEWS.foreign2023)})) |

The Academy’s diploma is recognised in more than 170 countries.`,
    faq: [
      {
        question: 'How do I get a residence permit?',
        answer:
          'The International Relations Department collects your documents and submits them to the State Migration Service. Full-time international students receive temporary residence for one year; the medical certificate for the Migration Service is issued by the International Medical Center.',
      },
      {
        question: 'Do I pay for the residence hall?',
        answer: 'In 2026/2027 the residence hall, uniform and study materials are free of charge for international students.',
      },
      {
        question: 'Can I study in English?',
        answer: 'Yes: Marine Navigation Engineering and Marine Power Plant Operation Engineering are also taught in English at bachelor’s level.',
      },
      {
        question: 'I have a question. Who should I write to?',
        answer: 'About admission and fees — akademiya@asco.az (+994 12 493 36 44). For other matters use the online form and choose “International relations and international students”.',
      },
    ],
    sideLinks: [
      L_EN.admission,
      { label: '2026/2027 admission announcement', url: AZ(ADMISSION_2026) },
      { label: 'ASAN Visa', url: EVISA },
      { label: 'State Migration Service', url: MIGRATION },
      { label: 'English-taught programmes', url: ENGLISH },
    ],
    contact: CONTACT_EN,
  },
  ru: {
    title: 'Путеводитель иностранного студента',
    lead:
      'После поступления: приезд в Баку, миграционная регистрация, общежитие, языковая подготовка, морская практика и повседневная поддержка. ' +
      'В 2023/2024 учебном году в Академии учились 43 иностранных студента.',
    seoDescription:
      'Иностранные студенты в АГМА: приезд и виза, миграционная регистрация, разрешение на временное проживание, бесплатное общежитие, языковые курсы, практика, контакты.',
    stepsTitle: 'От приезда до первого занятия',
    facts: [
      { label: 'Стоимость обучения (2026/2027)', value: '5100 AZN в год', icon: 'haqq' },
      { label: 'Общежитие, форма, учебные материалы', value: 'Бесплатно', icon: 'bina' },
      { label: 'Разрешение на временное проживание', value: '1 год', icon: 'sened' },
      { label: 'Язык обучения', value: 'Азербайджанский, английский, русский', icon: 'dil' },
    ],
    steps: [
      {
        title: 'Поступление и виза',
        who: 'АГМА, ASAN Виза',
        body: 'После собеседования поступление подтверждается. Правила въезда зависят от гражданства; электронная виза оформляется на портале evisa.gov.az.',
        linkLabel: 'Правила приёма',
        linkUrl: ADMISSION,
      },
      {
        title: 'Оригиналы документов',
        period: 'После приезда',
        who: 'АГМА',
        body: 'Вы представляете оригиналы документов; все они должны быть переведены и нотариально заверены.',
        linkLabel: 'Список документов',
        linkUrl: `${ADMISSION}#dokumenty`,
      },
      {
        title: 'Медицинская справка',
        who: 'International Medical Center (Баку)',
        body: 'Справка о здоровье для Государственной миграционной службы выдаётся в International Medical Center в Баку.',
      },
      {
        title: 'Миграционная регистрация',
        who: 'Отдел международных связей, Государственная миграционная служба',
        body: 'Отдел собирает ваши документы на разрешение на временное проживание и передаёт их в Государственную миграционную службу. Иностранным студентам очной формы предоставляется право на временное проживание сроком на один год.',
        linkLabel: 'migration.gov.az',
        linkUrl: MIGRATION,
      },
      {
        title: 'Заселение в общежитие',
        who: 'АГМА',
        body: 'Иностранные студенты заселяются в общежитие на общих основаниях; в 2026/2027 году для них это бесплатно.',
        linkLabel: 'Общежитие',
        linkUrl: DORM,
      },
      {
        title: 'Начало занятий',
        period: '15 сентября',
        who: 'АГМА',
        body: 'Если вы недостаточно владеете языком обучения, сначала можно пройти платные подготовительные курсы азербайджанского или английского языка.',
      },
    ],
    body: `## Кто помогает

С иностранными студентами работает [Отдел научных исследований и международных связей](${OFFICE}):

- собирает документы на разрешение на временное проживание и передаёт их в Государственную миграционную службу;
- поддерживает связь с Министерством науки и образования и Государственной миграционной службой;
- отвечает на письма и запросы иностранных студентов;
- информирует о мероприятиях, конференциях и семинарах в Академии.

По вопросам приёма и стоимости обучения: akademiya@asco.az, +994 12 493 36 44.

## Обучение и язык

- **Бакалавриат (4 года):** морская навигационная инженерия — азербайджанский, английский, русский; эксплуатация судовых энергетических установок — азербайджанский, английский; остальные специальности — на азербайджанском.
- **Магистратура (2 года):** на азербайджанском языке.
- **Подготовительные курсы:** азербайджанский и английский языки, платные, 6 или 12 месяцев.
- Об англоязычных группах: [Обучение на английском языке](${ENGLISH}).

## Морская практика

Иностранные студенты проходят морскую практику по учебному плану. Например, в 2023 году студенты II курса программы двойного диплома перед практикой на судне «Сабит Оруджев» прошли вводный инструктаж по безопасности ([новость](${AZ(NEWS.kzPractice2023)})). Подробнее: [Практика](${PRACTICE}).

## Повседневная жизнь

- **Общежитие** — в 2026/2027 году бесплатно для иностранных студентов: [Общежитие](${DORM}).
- **Форма и учебные материалы** — бесплатно.
- **Студенческая жизнь** — студенческие организации, спорт и интеллектуальные игры открыты для всех; например, иностранные студенты участвовали в конкурсе «Правовой интеллект» ([новость](${AZ(NEWS.lawQuiz)})). В декабре 2025 года ко Дню солидарности и Новому году прошла встреча с иностранными студентами ([новость](${AZ(NEWS.newYear2025)})). Подробнее: [Студенческая жизнь](/sehife/telebe-heyati).

## Цифры

| Учебный год | Принято иностранных студентов | Страны |
|---|---|---|
| 2022/2023 | 20, из них 8 по программе двойного диплома | Индия, Турция, Казахстан, Ирак ([новость](${AZ(NEWS.kz2022)})) |
| 2023/2024 | 20; всего 43 иностранных студента | Турция, Индия, Египет, Судан, Россия ([новость](${AZ(NEWS.foreign2023)})) |

Диплом Академии признаётся более чем в 170 странах.`,
    faq: [
      {
        question: 'Как получить разрешение на проживание?',
        answer:
          'Отдел международных связей собирает ваши документы и передаёт их в Государственную миграционную службу. Иностранным студентам очной формы предоставляется временное проживание на один год; медицинская справка для миграционной службы выдаётся в International Medical Center.',
      },
      {
        question: 'Платное ли общежитие?',
        answer: 'В 2026/2027 учебном году общежитие, форма и учебные материалы для иностранных студентов бесплатны.',
      },
      {
        question: 'Можно ли учиться на английском?',
        answer: 'Да: морская навигационная инженерия и эксплуатация судовых энергетических установок преподаются в бакалавриате и на английском языке.',
      },
      {
        question: 'У меня вопрос. Куда написать?',
        answer: 'О приёме и стоимости — akademiya@asco.az (+994 12 493 36 44). По другим вопросам — через онлайн-форму, направление «Международные связи и иностранные студенты».',
      },
    ],
    sideLinks: [
      L_RU.admission,
      { label: 'Объявление о приёме 2026/2027', url: AZ(ADMISSION_2026) },
      { label: 'ASAN Виза', url: EVISA },
      { label: 'Государственная миграционная служба', url: MIGRATION },
      { label: 'Обучение на английском языке', url: ENGLISH },
    ],
    contact: CONTACT_RU,
  },
};

export const BEYNELXALQ_PAGES: BeynelxalqPageSeed[] = [HUB_PAGE, PARTNERS_PAGE, MOBILITY_PAGE, DOUBLE_PAGE, GUIDE_PAGE];
export const BEYNELXALQ_PAGE_SLUGS: string[] = BEYNELXALQ_PAGES.map((p) => p.slug);
