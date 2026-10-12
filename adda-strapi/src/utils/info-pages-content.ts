/**
 * F5.49 — iki yeni səhifənin məzmunu (yalnız məlumat, məntiq
 * src/utils/section-pages.ts-dədir):
 *
 *   1. «Tez-tez verilən suallar» (/sehife/faq, layout=faq) — üst menyudakı
 *      «FAQ». Səhifədə ümumi suallar (bu fayl, admində redaktə olunur) və
 *      saytın digər səhifələrinin «Suallar» bölmələri mövzular üzrə avtomatik
 *      toplanır (Next.js: FaqPage). Cavabda «[mətn](/ünvan)» keçid olur.
 *   2. «ASCO və Akademiya» (/sehife/asco-ve-akademiya, layout=akademiya) —
 *      «Akademiya → Akademik irs və missiya». Canlı blok: adında «ASCO» olan
 *      xəbərlər (dataBlock=asco).
 *
 * MƏNBƏLƏR (12 oktyabr 2026, yoxlanılıb):
 *   - saytın səhifələri: «ADDA dünən və bu gün» (1881, 1996), «Elektron
 *     kitabxana» (Nazirlər Kabinetinin 15.07.1996 qərarı), «Tədris gəmisi»
 *     («General Əsədov», 15.09.2015), «Təcrübə», «Bakalavriat» (Dənizçilər
 *     poliklinikası), «Yataqxana» (104 otaq, 311 yer), «Təqaüd və sosial dəstək»
 *     (ASCO-nun əlavə təqaüdü: 2019 — 42, 2020 — 71 + 4), «İxtisasartırma və
 *     xaricdə təhsil» (Gəmiçilikdə Təqaüd Proqramı, 2016), «Məzunların işlə
 *     təminatı», əcnəbi tələbələr (5100 AZN, 2026/2027), Elmi Şura (bölmə);
 *   - ADDA xəbərləri: yeni tədris korpusu (Kazım Kazımzadə 127), ASCO
 *     təlimatçıları üçün kurs, ASCO-nun əlavə təqaüdü;
 *   - APA, 22.09.2022: Nazirlər Kabinetinin qərarı — Akademiya ASCO-nun
 *     tabeliyində publik hüquqi şəxs, Dənizçilik Kolleci onun nəzdində;
 *   - Vikipediya (Azerbaijan Caspian Shipping Company): ASCO — Prezidentin
 *     22.10.2013 fərmanı, iki donanmanın birləşməsi, kökləri 1858.
 * YAZILMAYIB: ASCO donanmasının gəmi sayı (tarixli rəsmi rəqəm tapılmadı),
 * məzunların ASCO-da işə «zəmanəti» (mənbə yalnız «əsas kadr mənbəyi» deyir).
 */
import type { LinkSeed, QebulPageSeed } from './qebul-pages-content';

export const FAQ_SLUG = 'faq';
export const ASCO_SLUG = 'asco-ve-akademiya';

const ASK = '/vetendaslarin-muracieti';
const APA_2022 = 'https://apa.az/social/deniz-akademiyasi-ve-onun-nezdindeki-denizcilik-kolleci-yeniden-teskil-edilecek-723604';
const NEWS = {
  newBlock: '/xeberler/deniz-akademiyasinin-yeni-tedris-korpusu-istifadeye-verildi',
  instructors: '/xeberler/asco-da-telimatcilar-ucun-telim-kursu-kecirilib',
  scholarships2020: '/xeberler/teqaudler-teyin-edilib',
  asco2019: '/xeberler/adda-ya-yuksek-balla-qebul-olmus-42-telebeye-asco-nun-vesaiti-hesabina-elave-teq',
};
/** ru/en səhifəsindən az xəbərə: prefiks açıq yazılır (xəbər dilə görə az-a qayıtmır). */
const AZ = (path: string): string => `/az${path}`;

const CONTACT_AZ =
  '**Ünvan:** Bakı, Zərifə Əliyeva küçəsi 18 («Sahil» metrosunun yaxınlığı)\n\n**Telefon:** +994 12 404 33 40\n\n' +
  `**E-poçt:** info@adda.edu.az\n\nSualınızı [onlayn göndərin](${ASK}) — cavab e-poçtunuza gəlir.`;
const CONTACT_EN =
  '**Address:** 18 Zarifa Aliyeva Street, Baku (near Sahil metro station)\n\n**Phone:** +994 12 404 33 40\n\n' +
  `**E-mail:** info@adda.edu.az\n\n[Send your question online](${ASK}) — the reply comes to your e-mail.`;
const CONTACT_RU =
  '**Адрес:** Баку, ул. Зарифы Алиевой, 18 (рядом со станцией метро «Сахил»)\n\n**Телефон:** +994 12 404 33 40\n\n' +
  `**E-mail:** info@adda.edu.az\n\n[Задайте вопрос онлайн](${ASK}) — ответ придёт на e-mail.`;

// ── 1. Tez-tez verilən suallar ───────────────────────────────────────────────
const FAQ_LINKS_AZ: LinkSeed[] = [
  { label: 'Onlayn müraciət', url: ASK },
  { label: 'Əlaqə', url: '/elaqe' },
  { label: 'Abituriyentlər üçün', url: '/bunlar-ucun/abituriyentler' },
  { label: 'Əcnəbi tələbələr üçün bələdçi', url: '/sehife/ecnebi-telebelerin-tehsili' },
];
const FAQ_LINKS_EN: LinkSeed[] = [
  { label: 'Online enquiry', url: ASK },
  { label: 'Contacts', url: '/elaqe' },
  { label: 'For applicants', url: '/bunlar-ucun/abituriyentler' },
  { label: 'Guide for international students', url: '/sehife/ecnebi-telebelerin-tehsili' },
];
const FAQ_LINKS_RU: LinkSeed[] = [
  { label: 'Онлайн-обращение', url: ASK },
  { label: 'Контакты', url: '/elaqe' },
  { label: 'Абитуриентам', url: '/bunlar-ucun/abituriyentler' },
  { label: 'Путеводитель для иностранных студентов', url: '/sehife/ecnebi-telebelerin-tehsili' },
];

const FAQ_PAGE: QebulPageSeed = {
  slug: FAQ_SLUG,
  dataBlock: 'yox',
  az: {
    title: 'Tez-tez verilən suallar',
    seoDescription:
      'ADDA haqqında tez-tez verilən suallar: qəbul, keçid balları, yataqxana, təqaüd, dəniz təcrübəsi, əcnəbi tələbələr, ASCO, müraciət.',
    lead:
      'Qəbul, təhsil, tələbə həyatı, elm və beynəlxalq əlaqələr barədə ən çox verilən suallar bir yerdə. ' +
      'Cavab tapmadınızsa, sualınızı onlayn göndərin.',
    body: '',
    faq: [
      {
        question: 'ADDA nədir?',
        answer:
          'Azərbaycan Dövlət Dəniz Akademiyası dəniz nəqliyyatı üçün mühəndis və dənizçi kadrlar hazırlayan ali təhsil müəssisəsidir. ' +
          'Nazirlər Kabinetinin 15 iyul 1996-cı il qərarı ilə yaradılıb; Azərbaycanda dənizçilik təhsilinin kökləri 1881-ci ilə gedib çıxır. ' +
          'Ətraflı — [Akademiya haqqında](/sehife/adda-dunen-ve-bugun).',
      },
      {
        question: 'Akademiya kimin tabeliyindədir?',
        answer:
          'Akademiya publik hüquqi şəxsdir və «Azərbaycan Xəzər Dəniz Gəmiçiliyi» QSC-nin (ASCO) tabeliyindədir. ' +
          'Bunun tələbə üçün mənası — təcrübə, təqaüd və işə qəbul — [ASCO və Akademiya](/sehife/asco-ve-akademiya) səhifəsindədir.',
      },
      {
        question: 'Akademiyanın binaları harada yerləşir?',
        answer:
          'Əsas bina — Bakı, Zərifə Əliyeva küçəsi 18 («Sahil» metrosunun yaxınlığı). 2-ci tədris korpusu — Kazım Kazımzadə küçəsi 127 ' +
          '(«Elmlər Akademiyası» metrosunun yaxınlığı). Yataqxana — Üzeyir Hacıbəyli küçəsi 114.',
      },
      {
        question: 'Akademiyaya necə qəbul olmaq olar?',
        answer:
          'Qəbul Dövlət İmtahan Mərkəzi (DİM) vasitəsilə aparılır. Kollec, bakalavriat, magistratura və doktorantura üzrə şərtlər, ' +
          'tarixlər və sənədlər [Abituriyentlər üçün](/bunlar-ucun/abituriyentler) bölməsindədir. Əcnəbi vətəndaşlar müsahibə əsasında qəbul olunur.',
      },
      {
        question: 'Keçid balları və təhsil haqqı harada verilir?',
        answer:
          'Hər ixtisas üzrə son illərin keçid balları, plan yerləri və təhsil haqqı ixtisas kataloqundadır: ' +
          '[Keçid balları, yer sayı və təhsil haqqı](/sehife/kecid-ballari).',
      },
      {
        question: 'Tibbi müayinə lazımdırmı?',
        answer:
          'Dənizçi ixtisaslarına (məsələn, dəniz naviqasiyası, gəmi energetik qurğularının istismarı) qəbul olmaq istəyənlər elektron ərizəni ' +
          'təsdiqlədikdən sonra ASCO-nun «Dənizçilər poliklinikası»nda xüsusi tibbi müayinədən keçir. Ətraflı — [Bakalavriat](/sehife/bakalavriat).',
      },
      {
        question: 'Tələbələrə yataqxana verilirmi?',
        answer:
          'Bəli. Yataqxanada 104 otaq, 311 yer var; tələbələrə güzəştli şərtlə, əcnəbi tələbələrə 2026/2027-ci ildə ödənişsiz verilir. ' +
          'Qayda və şərait — [Yataqxana](/sehife/yataqxana).',
      },
      {
        question: 'Tələbələr nə ilə ödənişsiz təmin olunur?',
        answer:
          'Yay və qış geyim forması, dərs vəsaitləri və gündə iki dəfə yemək. Təqaüd semestrin nəticəsinə görə təyin olunur; ' +
          'fərqlənən tələbələrə ASCO-nun əlavə təqaüdü də verilib. Ətraflı — [Təqaüd və sosial dəstək](/sehife/sosial-teminat-ve-maddi-yardim).',
      },
      {
        question: 'Dəniz təcrübəsi harada keçirilir?',
        answer:
          'Tədris gəmisi «General Əsədov»da, ASCO gəmilərində, gəmi təmiri və tikintisi müəssisələrində; müddəti ixtisasa görə dəyişir. ' +
          'Təcrübə STCW üzrə işçi diplomuna yol açır — [Təcrübə (praktika)](/sehife/tecrube-haqqinda).',
      },
      {
        question: 'Tədris hansı dillərdədir?',
        answer:
          'Əsas tədris dili Azərbaycan dilidir; bəzi ixtisaslarda ingilis və rus dilində qruplar var. Siyahı — ' +
          '[İngilis dilində tədris](/sehife/ingilis-dilinde-tedris) və ixtisas kataloqu.',
      },
      {
        question: 'Əcnəbi vətəndaşlar Akademiyada necə oxuya bilər?',
        answer:
          'Bakalavriat və magistraturaya müsahibə ilə qəbul olunur. 2026/2027-ci ildə illik təhsil haqqı 5100 manatdır; geyim forması, ' +
          'tədris materialları və yataqxana ödənişsizdir. Gəliş və qeydiyyat — [Əcnəbi tələbələr üçün bələdçi](/sehife/ecnebi-telebelerin-tehsili).',
      },
      {
        question: 'Akademiyaya sualımı necə göndərim?',
        answer:
          `[Onlayn müraciət formasında](${ASK}) mövzunu seçin — cavab e-poçtunuza gəlir. Telefon: +994 12 404 33 40, e-poçt: info@adda.edu.az.`,
      },
      {
        question: 'Xəbər və tədbirləri necə izləyim?',
        answer:
          '[Xəbərlər](/xeberler), [Elanlar](/elanlar) və [Tədbirlər](/tedbirler) bölmələrində. Saytın altındakı formadan xəbərlərə e-poçtla abunə olmaq olar.',
      },
    ],
    sideLinks: FAQ_LINKS_AZ,
    contact: CONTACT_AZ,
  },
  en: {
    title: 'Frequently asked questions',
    seoDescription:
      'Frequently asked questions about ADDA: admission, pass scores, residence hall, scholarships, sea training, international students, ASCO.',
    lead:
      'The most common questions about admission, studies, student life, research and international relations in one place. ' +
      'If you cannot find an answer, send us your question online.',
    body: '',
    faq: [
      {
        question: 'What is ADDA?',
        answer:
          'Azerbaijan State Marine Academy trains engineers and seafarers for maritime transport. It was established by a Cabinet of Ministers decision ' +
          'of 15 July 1996; maritime education in Azerbaijan dates back to 1881. More — [About the Academy](/sehife/adda-dunen-ve-bugun).',
      },
      {
        question: 'Who does the Academy report to?',
        answer:
          'The Academy is a public legal entity under Azerbaijan Caspian Shipping Company CJSC (ASCO). What this means for students — ' +
          'sea training, scholarships and jobs — is explained on [ASCO and the Academy](/sehife/asco-ve-akademiya).',
      },
      {
        question: 'Where are the Academy buildings?',
        answer:
          'Main building — 18 Zarifa Aliyeva Street, Baku (near Sahil metro station). Second academic building — 127 Kazim Kazimzade Street ' +
          '(near Elmlar Akademiyasi metro station). Residence hall — 114 Uzeyir Hajibeyli Street.',
      },
      {
        question: 'How do I apply?',
        answer:
          'Admission is run through the State Examination Centre (DIM). Requirements, dates and documents for college, bachelor’s, master’s and ' +
          'doctoral studies are in [For applicants](/bunlar-ucun/abituriyentler). International applicants are admitted after an interview.',
      },
      {
        question: 'Where can I find pass scores and tuition fees?',
        answer:
          'Recent pass scores, planned places and tuition fees for every programme are in the programme catalogue: ' +
          '[Pass scores, places and tuition](/sehife/kecid-ballari).',
      },
      {
        question: 'Is a medical examination required?',
        answer:
          'Applicants to seafaring programmes (for example, marine navigation or ship power plant operation) take a special medical examination ' +
          'at ASCO’s Seafarers’ Polyclinic after confirming their online application. More — [Bachelor’s admission](/sehife/bakalavriat).',
      },
      {
        question: 'Do students get a place in the residence hall?',
        answer:
          'Yes. The residence hall has 104 rooms and 311 places; students live there on preferential terms, international students free of charge ' +
          'in 2026/2027. Rules and facilities — [Residence hall](/sehife/yataqxana).',
      },
      {
        question: 'What do students receive free of charge?',
        answer:
          'Summer and winter uniforms, textbooks and two meals a day. Scholarships depend on semester results; ASCO has also awarded additional ' +
          'scholarships to top students. More — [Scholarships and student support](/sehife/sosial-teminat-ve-maddi-yardim).',
      },
      {
        question: 'Where does sea training take place?',
        answer:
          'On the training ship General Asadov, on ASCO vessels and at ship repair and shipbuilding yards; the length depends on the programme. ' +
          'Training leads to an STCW certificate of competency — [Practical training](/sehife/tecrube-haqqinda).',
      },
      {
        question: 'What is the language of instruction?',
        answer:
          'The main language is Azerbaijani; some programmes have English- and Russian-medium groups. See ' +
          '[Teaching in English](/sehife/ingilis-dilinde-tedris) and the programme catalogue.',
      },
      {
        question: 'How can international students study at the Academy?',
        answer:
          'Bachelor’s and master’s admission is by interview. In 2026/2027 the annual tuition fee is AZN 5,100; uniforms, study materials and the ' +
          'residence hall are free. Arrival and registration — [Guide for international students](/sehife/ecnebi-telebelerin-tehsili).',
      },
      {
        question: 'How do I send a question to the Academy?',
        answer:
          `Choose a topic in the [online enquiry form](${ASK}) — the reply comes to your e-mail. Phone: +994 12 404 33 40, e-mail: info@adda.edu.az.`,
      },
      {
        question: 'How can I follow news and events?',
        answer:
          'In [News](/xeberler), [Announcements](/elanlar) and [Events](/tedbirler). You can subscribe to news by e-mail at the bottom of every page.',
      },
    ],
    sideLinks: FAQ_LINKS_EN,
    contact: CONTACT_EN,
  },
  ru: {
    title: 'Часто задаваемые вопросы',
    seoDescription:
      'Часто задаваемые вопросы об АГМА: поступление, проходные баллы, общежитие, стипендии, морская практика, иностранные студенты, ASCO.',
    lead:
      'Самые частые вопросы о поступлении, учёбе, студенческой жизни, науке и международных связях — в одном месте. ' +
      'Не нашли ответа — задайте вопрос онлайн.',
    body: '',
    faq: [
      {
        question: 'Что такое АГМА?',
        answer:
          'Азербайджанская государственная морская академия готовит инженеров и моряков для морского транспорта. Создана решением Кабинета министров ' +
          'от 15 июля 1996 года; морское образование в Азербайджане ведёт начало с 1881 года. Подробнее — [Об академии](/sehife/adda-dunen-ve-bugun).',
      },
      {
        question: 'Кому подчиняется Академия?',
        answer:
          'Академия — публичное юридическое лицо в ведении ЗАО «Азербайджанское Каспийское морское пароходство» (ASCO). Что это значит для студента — ' +
          'практика, стипендии, трудоустройство — на странице [ASCO и Академия](/sehife/asco-ve-akademiya).',
      },
      {
        question: 'Где находятся здания Академии?',
        answer:
          'Главный корпус — Баку, ул. Зарифы Алиевой, 18 (рядом со станцией метро «Сахил»). Второй учебный корпус — ул. Кязыма Кязымзаде, 127 ' +
          '(рядом со станцией метро «Элмляр Академиясы»). Общежитие — ул. Узеира Гаджибейли, 114.',
      },
      {
        question: 'Как поступить в Академию?',
        answer:
          'Приём ведётся через Государственный экзаменационный центр (ГЭЦ). Условия, сроки и документы для колледжа, бакалавриата, магистратуры ' +
          'и докторантуры — в разделе [Абитуриентам](/bunlar-ucun/abituriyentler). Иностранные граждане поступают по результатам собеседования.',
      },
      {
        question: 'Где узнать проходные баллы и стоимость обучения?',
        answer:
          'Проходные баллы последних лет, плановые места и стоимость обучения по каждой специальности — в каталоге: ' +
          '[Проходные баллы, места и стоимость](/sehife/kecid-ballari).',
      },
      {
        question: 'Нужен ли медицинский осмотр?',
        answer:
          'Поступающие на морские специальности (например, морская навигация, эксплуатация судовых энергетических установок) после подтверждения ' +
          'электронного заявления проходят специальный медосмотр в «Поликлинике моряков» ASCO. Подробнее — [Бакалавриат](/sehife/bakalavriat).',
      },
      {
        question: 'Предоставляется ли общежитие?',
        answer:
          'Да. В общежитии 104 комнаты и 311 мест; студентам — на льготных условиях, иностранным студентам в 2026/2027 году — бесплатно. ' +
          'Правила и условия — [Общежитие](/sehife/yataqxana).',
      },
      {
        question: 'Что студенты получают бесплатно?',
        answer:
          'Летнюю и зимнюю форму, учебные пособия и двухразовое питание. Стипендия назначается по итогам семестра; отличившимся студентам ' +
          'ASCO также выплачивало дополнительную стипендию. Подробнее — [Стипендии и социальная поддержка](/sehife/sosial-teminat-ve-maddi-yardim).',
      },
      {
        question: 'Где проходит морская практика?',
        answer:
          'На учебном судне «Генерал Асадов», на судах ASCO, на судоремонтных и судостроительных предприятиях; продолжительность зависит от специальности. ' +
          'Практика ведёт к рабочему диплому по STCW — [Практика](/sehife/tecrube-haqqinda).',
      },
      {
        question: 'На каком языке ведётся обучение?',
        answer:
          'Основной язык — азербайджанский; по ряду специальностей есть группы с обучением на английском и русском языках. Список — ' +
          '[Обучение на английском языке](/sehife/ingilis-dilinde-tedris) и каталог специальностей.',
      },
      {
        question: 'Как иностранным гражданам учиться в Академии?',
        answer:
          'В бакалавриат и магистратуру — по результатам собеседования. В 2026/2027 году стоимость обучения — 5100 манатов в год; форма, учебные ' +
          'материалы и общежитие бесплатны. Приезд и регистрация — [Путеводитель для иностранных студентов](/sehife/ecnebi-telebelerin-tehsili).',
      },
      {
        question: 'Как отправить вопрос в Академию?',
        answer:
          `Выберите тему в [форме онлайн-обращения](${ASK}) — ответ придёт на e-mail. Телефон: +994 12 404 33 40, e-mail: info@adda.edu.az.`,
      },
      {
        question: 'Как следить за новостями и мероприятиями?',
        answer:
          'В разделах [Новости](/xeberler), [Объявления](/elanlar) и [Мероприятия](/tedbirler). Подписаться на новости по e-mail можно внизу любой страницы.',
      },
    ],
    sideLinks: FAQ_LINKS_RU,
    contact: CONTACT_RU,
  },
};

// ── 2. ASCO və Akademiya ─────────────────────────────────────────────────────
const ASCO_SITE: LinkSeed = { label: 'asco.az', url: 'https://asco.az' };

const ASCO_PAGE: QebulPageSeed = {
  slug: ASCO_SLUG,
  dataBlock: 'asco',
  az: {
    title: 'ASCO və Akademiya',
    seoDescription:
      'ADDA «Azərbaycan Xəzər Dəniz Gəmiçiliyi» QSC-nin (ASCO) tabeliyindədir: tədris gəmisi, dəniz təcrübəsi, təqaüd, xaricdə magistratura, işə qəbul.',
    lead:
      'Akademiya «Azərbaycan Xəzər Dəniz Gəmiçiliyi» QSC-nin (ASCO) tabeliyindədir. Tələbələr ASCO-nun gəmilərində təcrübə keçir, ' +
      'fərqlənənlər ASCO təqaüdü alır, məzunlar isə şirkətin donanmasında işləyir.',
    stepsTitle: 'Tələbədən dənizçiyə: ASCO ilə yol',
    facts: [
      { label: 'Status', value: 'Publik hüquqi şəxs', icon: 'forma' },
      { label: 'ASCO-nun kökləri', value: '1858', icon: 'tarix' },
      { label: 'Tədris gəmisi', value: '«General Əsədov»', icon: 'gemi' },
      { label: 'Təqaüd proqramı', value: '2016-cı ildən', icon: 'diplom' },
    ],
    steps: [
      {
        title: 'Qəbul və tibbi müayinə',
        who: 'Abituriyent',
        body: 'Dənizçi ixtisaslarına qəbul olanlar ASCO-nun «Dənizçilər poliklinikası»nda xüsusi tibbi müayinədən keçir.',
        linkLabel: 'Bakalavriata qəbul',
        linkUrl: '/sehife/bakalavriat',
      },
      {
        title: 'Tədris gəmisində ilk təcrübə',
        who: 'Tədris gəmisi',
        body: '«General Əsədov» — ASCO-nun balansındakı gəmi, 2015-ci ilin sentyabrından Akademiyanın tədris gəmisidir.',
        linkLabel: 'Tədris gəmisi',
        linkUrl: '/sehife/tedris-gemisi',
      },
      {
        title: 'ASCO gəmilərində dəniz təcrübəsi',
        who: 'Təcrübə bölməsi',
        body: 'Üzmə təcrübəsi tədris gəmisində və ASCO gəmilərində keçirilir; dəniz naviqasiyasında müddəti 52 həftədir.',
        linkLabel: 'Təcrübə (praktika)',
        linkUrl: '/sehife/tecrube-haqqinda',
      },
      {
        title: 'Təqaüd',
        who: 'ASCO',
        body: 'Fərqlənən tələbələrə və yüksək balla qəbul olunanlara ASCO-nun vəsaiti hesabına əlavə təqaüd verilib.',
        linkLabel: 'Təqaüd və sosial dəstək',
        linkUrl: '/sehife/sosial-teminat-ve-maddi-yardim',
      },
      {
        title: 'İşə qəbul',
        who: 'Məzun',
        body: 'Akademiya ASCO-nun əsas kadr mənbəyidir; işə qəbulda keyfiyyətə üstünlük verilir.',
        linkLabel: 'Məzunların işlə təminatı',
        linkUrl: '/sehife/mezunlarin-isle-teminati',
      },
      {
        title: 'Xaricdə magistratura',
        who: 'Gəmiçilikdə Təqaüd Proqramı',
        body: 'ASCO-nun vəsaiti hesabına aparıcı xarici universitetdə magistr təhsili, sonra 5 il ASCO-da iş.',
        linkLabel: 'İxtisasartırma və xaricdə təhsil',
        linkUrl: '/sehife/xaricde-tehsil-ve-ixtisasartirma',
      },
    ],
    body: `## ASCO haqqında

«Azərbaycan Xəzər Dəniz Gəmiçiliyi» Qapalı Səhmdar Cəmiyyəti (ASCO) Prezidentin 22 oktyabr 2013-cü il fərmanı ilə Azərbaycan Dövlət Xəzər Dəniz Gəmiçiliyinin və ARDNŞ-nin Xəzər Dəniz Neft Donanmasının birləşdirilməsi yolu ilə yaradılıb. Şirkətin kökləri 1858-ci ildə Bakıda təsis edilmiş «Qafqaz və Merkuri» səhmdar cəmiyyətinə gedib çıxır.

ASCO yük və sərnişin daşımalarını, Bakı (Ələt) – Türkmənbaşı və Bakı (Ələt) – Aktau (Kurık) bərə xətlərini, dənizdə neft-qaz hasilatına xidmət edən donanmanı idarə edir. Rəsmi sayt: [asco.az](https://asco.az).

## Akademiyanın statusu

Nazirlər Kabinetinin 2022-ci ilin sentyabrında qəbul etdiyi qərarla Azərbaycan Dövlət Dəniz Akademiyası «Azərbaycan Xəzər Dəniz Gəmiçiliyi» QSC-nin tabeliyində publik hüquqi şəxs kimi yenidən təşkil olunub; Azərbaycan Dənizçilik Kolleci Akademiyanın nəzdindədir ([APA, 22.09.2022](${APA_2022})). Akademiyanın ümumi rəhbərliyini [Elmi Şura](/struktur/elmi-sura) həyata keçirir.

## Əməkdaşlıq istiqamətləri

| İstiqamət | Necə işləyir | Ətraflı |
|---|---|---|
| Tədris gəmisi | «General Əsədov» — ASCO-nun balansındakı sərnişin gəmisi, 15 sentyabr 2015-ci ildən tələbələrin tədris gəmisidir | [Tədris gəmisi](/sehife/tedris-gemisi) |
| Dəniz təcrübəsi | tələbələr ASCO gəmilərində üzmə təcrübəsi keçir | [Təcrübə](/sehife/tecrube-haqqinda) |
| Tədris binası | Kazım Kazımzadə küçəsi 127-dəki korpus ASCO-nun vəsaiti hesabına əsaslı təmir olunub, 2016-cı ildən istifadədədir | [xəbər](${NEWS.newBlock}) |
| Təqaüd | 2019-cu ildə yüksək balla qəbul olunan 42 tələbəyə, 2020-ci ilin yazında 71 əlaçı bakalavr və 4 magistranta əlavə təqaüd | [Təqaüd və sosial dəstək](/sehife/sosial-teminat-ve-maddi-yardim) |
| Xaricdə təhsil | Gəmiçilikdə Təqaüd Proqramı (2016): xaricdə magistratura, sonra 5 il ASCO-da iş | [İxtisasartırma və xaricdə təhsil](/sehife/xaricde-tehsil-ve-ixtisasartirma) |
| İşə qəbul | Akademiya ASCO-nun əsas kadr mənbəyidir | [Məzunların işlə təminatı](/sehife/mezunlarin-isle-teminati) |
| Tibbi müayinə | dənizçi ixtisaslarına qəbul olanlar ASCO-nun «Dənizçilər poliklinikası»nda | [Bakalavriat](/sehife/bakalavriat) |
| Təlimlər | Akademiyada ASCO təlimatçıları üçün təlim kursları təşkil olunur | [xəbər](${NEWS.instructors}) |`,
    faq: [
      {
        question: 'Akademiya ASCO-nun tərkibindədirmi?',
        answer:
          'Akademiya publik hüquqi şəxsdir və «Azərbaycan Xəzər Dəniz Gəmiçiliyi» QSC-nin tabeliyindədir (Nazirlər Kabinetinin 2022-ci il qərarı). ' +
          'Azərbaycan Dənizçilik Kolleci Akademiyanın nəzdindədir.',
      },
      {
        question: 'Məzunlar ASCO-da işləyə bilərmi?',
        answer:
          'Bəli. Akademiya ASCO-nun əsas kadr mənbəyidir; işə qəbulda keyfiyyətə üstünlük verilir. Məzunlar həmçinin beynəlxalq gəmiçilik şirkətlərində, ' +
          'limanlarda və gəmi təmiri müəssisələrində işləyir.',
      },
      {
        question: 'ASCO təqaüdü kimə verilir?',
        answer:
          'Təhsildə fərqlənən tələbələrə və yüksək balla qəbul olunanlara; şərtləri hər il ASCO müəyyən edir. Məzunlar üçün Gəmiçilikdə Təqaüd Proqramı ' +
          'xaricdə magistr təhsilini əhatə edir — təhsildən sonra 5 il ASCO-da işləmək öhdəliyi ilə.',
      },
      {
        question: 'Tibbi müayinə harada keçirilir?',
        answer:
          'Dənizçi ixtisaslarına qəbul olanlar ASCO-nun «Dənizçilər poliklinikası» MMC-də xüsusi tibbi müayinədən keçir. Tarix və sənəd siyahısı hər il ' +
          'Akademiyanın elanında verilir.',
      },
    ],
    sideLinks: [
      ASCO_SITE,
      { label: 'Akademiya haqqında', url: '/sehife/adda-dunen-ve-bugun' },
      { label: 'Təcrübə (praktika)', url: '/sehife/tecrube-haqqinda' },
      { label: 'Məzunların işlə təminatı', url: '/sehife/mezunlarin-isle-teminati' },
    ],
    contact: CONTACT_AZ,
  },
  en: {
    title: 'ASCO and the Academy',
    seoDescription:
      'ADDA is under Azerbaijan Caspian Shipping Company (ASCO): training ship, sea training, scholarships, master’s abroad, graduate recruitment.',
    lead:
      'The Academy is under Azerbaijan Caspian Shipping Company CJSC (ASCO). Students train on ASCO vessels, top students receive ASCO scholarships, ' +
      'and graduates work in the company’s fleet.',
    stepsTitle: 'From student to seafarer with ASCO',
    facts: [
      { label: 'Status', value: 'Public legal entity', icon: 'forma' },
      { label: 'ASCO’s roots', value: '1858', icon: 'tarix' },
      { label: 'Training ship', value: 'General Asadov', icon: 'gemi' },
      { label: 'Scholarship programme', value: 'Since 2016', icon: 'diplom' },
    ],
    steps: [
      {
        title: 'Admission and medical examination',
        who: 'Applicant',
        body: 'Applicants to seafaring programmes take a special medical examination at ASCO’s Seafarers’ Polyclinic.',
        linkLabel: 'Bachelor’s admission',
        linkUrl: '/sehife/bakalavriat',
      },
      {
        title: 'First training on the training ship',
        who: 'Training ship',
        body: 'General Asadov, a ship on ASCO’s balance, has been the Academy’s training ship since September 2015.',
        linkLabel: 'Training ship',
        linkUrl: '/sehife/tedris-gemisi',
      },
      {
        title: 'Sea training on ASCO vessels',
        who: 'Practical training unit',
        body: 'Sea service takes place on the training ship and on ASCO vessels; for marine navigation it lasts 52 weeks.',
        linkLabel: 'Practical training',
        linkUrl: '/sehife/tecrube-haqqinda',
      },
      {
        title: 'Scholarships',
        who: 'ASCO',
        body: 'ASCO has funded additional scholarships for top students and for entrants with high admission scores.',
        linkLabel: 'Scholarships and student support',
        linkUrl: '/sehife/sosial-teminat-ve-maddi-yardim',
      },
      {
        title: 'Employment',
        who: 'Graduate',
        body: 'The Academy is ASCO’s principal source of personnel; recruitment gives priority to quality.',
        linkLabel: 'Graduate employment',
        linkUrl: '/sehife/mezunlarin-isle-teminati',
      },
      {
        title: 'Master’s degree abroad',
        who: 'Shipping Scholarship Programme',
        body: 'A master’s degree at a leading foreign university funded by ASCO, followed by five years of work at ASCO.',
        linkLabel: 'Professional development and study abroad',
        linkUrl: '/sehife/xaricde-tehsil-ve-ixtisasartirma',
      },
    ],
    body: `## About ASCO

Azerbaijan Caspian Shipping Company CJSC (ASCO) was formed by the presidential decree of 22 October 2013, which merged the Azerbaijan State Caspian Shipping Company and the Caspian Sea Oil Fleet of SOCAR. The company traces its roots to the Caucasus and Mercury joint-stock company founded in Baku in 1858.

ASCO runs cargo and passenger shipping, the Baku (Alat) – Turkmenbashi and Baku (Alat) – Aktau (Kuryk) ferry lines and the fleet that serves offshore oil and gas production. Official website: [asco.az](https://asco.az).

## The Academy’s status

By a decision of the Cabinet of Ministers adopted in September 2022, Azerbaijan State Marine Academy was reorganised as a public legal entity under Azerbaijan Caspian Shipping Company CJSC; the Azerbaijan Maritime College operates under the Academy ([APA, 22.09.2022](${APA_2022})). The Academy is governed by the [Academic Council](/struktur/elmi-sura).

## Areas of cooperation

| Area | How it works | More |
|---|---|---|
| Training ship | General Asadov, a passenger ship on ASCO’s balance, has been the students’ training ship since 15 September 2015 | [Training ship](/sehife/tedris-gemisi) |
| Sea training | students complete sea service on ASCO vessels | [Practical training](/sehife/tecrube-haqqinda) |
| Academic building | the building at 127 Kazim Kazimzade Street was refurbished with ASCO funding and has been in use since 2016 | [news](${AZ(NEWS.newBlock)}) |
| Scholarships | additional scholarships for 42 high-scoring entrants in 2019 and for 71 top bachelor’s and 4 master’s students in spring 2020 | [Scholarships and student support](/sehife/sosial-teminat-ve-maddi-yardim) |
| Study abroad | Shipping Scholarship Programme (2016): a master’s degree abroad, then five years at ASCO | [Professional development and study abroad](/sehife/xaricde-tehsil-ve-ixtisasartirma) |
| Employment | the Academy is ASCO’s principal source of personnel | [Graduate employment](/sehife/mezunlarin-isle-teminati) |
| Medical examination | applicants to seafaring programmes are examined at ASCO’s Seafarers’ Polyclinic | [Bachelor’s admission](/sehife/bakalavriat) |
| Training | the Academy runs courses for ASCO instructors | [news](${AZ(NEWS.instructors)}) |`,
    faq: [
      {
        question: 'Is the Academy part of ASCO?',
        answer:
          'The Academy is a public legal entity under Azerbaijan Caspian Shipping Company CJSC (Cabinet of Ministers decision of 2022). ' +
          'The Azerbaijan Maritime College operates under the Academy.',
      },
      {
        question: 'Can graduates work at ASCO?',
        answer:
          'Yes. The Academy is ASCO’s principal source of personnel; recruitment gives priority to quality. Graduates also work for international ' +
          'shipping companies, in ports and at ship repair yards.',
      },
      {
        question: 'Who receives ASCO scholarships?',
        answer:
          'Top students and entrants with high admission scores; ASCO sets the conditions every year. For graduates, the Shipping Scholarship Programme ' +
          'covers a master’s degree abroad, with an obligation to work at ASCO for five years afterwards.',
      },
      {
        question: 'Where is the medical examination held?',
        answer:
          'Applicants to seafaring programmes are examined at ASCO’s Seafarers’ Polyclinic. Dates and the list of documents are published every year ' +
          'in the Academy’s announcement.',
      },
    ],
    sideLinks: [
      ASCO_SITE,
      { label: 'About the Academy', url: '/sehife/adda-dunen-ve-bugun' },
      { label: 'Practical training', url: '/sehife/tecrube-haqqinda' },
      { label: 'Graduate employment', url: '/sehife/mezunlarin-isle-teminati' },
    ],
    contact: CONTACT_EN,
  },
  ru: {
    title: 'ASCO и Академия',
    seoDescription:
      'АГМА в ведении ЗАО «Азербайджанское Каспийское морское пароходство» (ASCO): учебное судно, практика, стипендии, магистратура за рубежом.',
    lead:
      'Академия находится в ведении ЗАО «Азербайджанское Каспийское морское пароходство» (ASCO). Студенты проходят практику на судах ASCO, ' +
      'лучшие получают стипендии ASCO, выпускники работают во флоте компании.',
    stepsTitle: 'От студента до моряка вместе с ASCO',
    facts: [
      { label: 'Статус', value: 'Публичное юридическое лицо', icon: 'forma' },
      { label: 'История ASCO', value: 'с 1858 года', icon: 'tarix' },
      { label: 'Учебное судно', value: '«Генерал Асадов»', icon: 'gemi' },
      { label: 'Стипендиальная программа', value: 'с 2016 года', icon: 'diplom' },
    ],
    steps: [
      {
        title: 'Поступление и медосмотр',
        who: 'Абитуриент',
        body: 'Поступающие на морские специальности проходят специальный медосмотр в «Поликлинике моряков» ASCO.',
        linkLabel: 'Поступление в бакалавриат',
        linkUrl: '/sehife/bakalavriat',
      },
      {
        title: 'Первая практика на учебном судне',
        who: 'Учебное судно',
        body: '«Генерал Асадов» — судно на балансе ASCO, с сентября 2015 года учебное судно Академии.',
        linkLabel: 'Учебное судно',
        linkUrl: '/sehife/tedris-gemisi',
      },
      {
        title: 'Практика на судах ASCO',
        who: 'Отдел практики',
        body: 'Плавательная практика проходит на учебном судне и на судах ASCO; по морской навигации — 52 недели.',
        linkLabel: 'Практика',
        linkUrl: '/sehife/tecrube-haqqinda',
      },
      {
        title: 'Стипендии',
        who: 'ASCO',
        body: 'ASCO выплачивало дополнительные стипендии отличившимся студентам и поступившим с высокими баллами.',
        linkLabel: 'Стипендии и социальная поддержка',
        linkUrl: '/sehife/sosial-teminat-ve-maddi-yardim',
      },
      {
        title: 'Трудоустройство',
        who: 'Выпускник',
        body: 'Академия — основная кадровая опора ASCO; при приёме на работу приоритет отдаётся качеству.',
        linkLabel: 'Трудоустройство выпускников',
        linkUrl: '/sehife/mezunlarin-isle-teminati',
      },
      {
        title: 'Магистратура за рубежом',
        who: 'Стипендиальная программа в судоходстве',
        body: 'Магистратура в ведущем зарубежном вузе за счёт ASCO, затем пять лет работы в ASCO.',
        linkLabel: 'Повышение квалификации и обучение за рубежом',
        linkUrl: '/sehife/xaricde-tehsil-ve-ixtisasartirma',
      },
    ],
    body: `## Об ASCO

ЗАО «Азербайджанское Каспийское морское пароходство» (ASCO) создано указом Президента от 22 октября 2013 года путём объединения Азербайджанского государственного Каспийского морского пароходства и Каспийского морского нефтяного флота ГНКАР. История компании восходит к акционерному обществу «Кавказ и Меркурий», основанному в Баку в 1858 году.

ASCO осуществляет грузовые и пассажирские перевозки, паромные линии Баку (Алят) – Туркменбаши и Баку (Алят) – Актау (Курык), управляет флотом, обслуживающим морскую добычу нефти и газа. Официальный сайт: [asco.az](https://asco.az).

## Статус Академии

Решением Кабинета министров, принятым в сентябре 2022 года, Азербайджанская государственная морская академия преобразована в публичное юридическое лицо в ведении ЗАО «Азербайджанское Каспийское морское пароходство»; Азербайджанский морской колледж действует при Академии ([APA, 22.09.2022](${APA_2022})). Общее руководство Академией осуществляет [Учёный совет](/struktur/elmi-sura).

## Направления сотрудничества

| Направление | Как работает | Подробнее |
|---|---|---|
| Учебное судно | «Генерал Асадов» — пассажирское судно на балансе ASCO, с 15 сентября 2015 года учебное судно студентов | [Учебное судно](/sehife/tedris-gemisi) |
| Морская практика | студенты проходят плавательную практику на судах ASCO | [Практика](/sehife/tecrube-haqqinda) |
| Учебный корпус | корпус на ул. Кязыма Кязымзаде, 127 капитально отремонтирован за счёт ASCO, используется с 2016 года | [новость](${AZ(NEWS.newBlock)}) |
| Стипендии | в 2019 году — 42 поступившим с высокими баллами, весной 2020 года — 71 бакалавру-отличнику и 4 магистрантам | [Стипендии и социальная поддержка](/sehife/sosial-teminat-ve-maddi-yardim) |
| Обучение за рубежом | Стипендиальная программа в судоходстве (2016): магистратура за рубежом, затем пять лет в ASCO | [Повышение квалификации и обучение за рубежом](/sehife/xaricde-tehsil-ve-ixtisasartirma) |
| Трудоустройство | Академия — основная кадровая опора ASCO | [Трудоустройство выпускников](/sehife/mezunlarin-isle-teminati) |
| Медосмотр | поступающие на морские специальности проходят его в «Поликлинике моряков» ASCO | [Бакалавриат](/sehife/bakalavriat) |
| Обучение персонала | в Академии проводятся курсы для инструкторов ASCO | [новость](${AZ(NEWS.instructors)}) |`,
    faq: [
      {
        question: 'Входит ли Академия в ASCO?',
        answer:
          'Академия — публичное юридическое лицо в ведении ЗАО «Азербайджанское Каспийское морское пароходство» (решение Кабинета министров 2022 года). ' +
          'Азербайджанский морской колледж действует при Академии.',
      },
      {
        question: 'Могут ли выпускники работать в ASCO?',
        answer:
          'Да. Академия — основная кадровая опора ASCO; при приёме на работу приоритет отдаётся качеству. Выпускники работают также в международных ' +
          'судоходных компаниях, портах и на судоремонтных предприятиях.',
      },
      {
        question: 'Кому выплачивается стипендия ASCO?',
        answer:
          'Отличившимся студентам и поступившим с высокими баллами; условия ежегодно определяет ASCO. Для выпускников Стипендиальная программа ' +
          'в судоходстве покрывает магистратуру за рубежом — с обязательством пять лет проработать в ASCO.',
      },
      {
        question: 'Где проходит медосмотр?',
        answer:
          'Поступающие на морские специальности проходят его в ООО «Поликлиника моряков» ASCO. Сроки и перечень документов ежегодно публикуются ' +
          'в объявлении Академии.',
      },
    ],
    sideLinks: [
      ASCO_SITE,
      { label: 'Об академии', url: '/sehife/adda-dunen-ve-bugun' },
      { label: 'Практика', url: '/sehife/tecrube-haqqinda' },
      { label: 'Трудоустройство выпускников', url: '/sehife/mezunlarin-isle-teminati' },
    ],
    contact: CONTACT_RU,
  },
};

export const FAQ_PAGES: QebulPageSeed[] = [FAQ_PAGE];
export const ASCO_PAGES: QebulPageSeed[] = [ASCO_PAGE];
export const INFO_PAGE_SLUGS: string[] = [FAQ_SLUG, ASCO_SLUG];
