/**
 * F5.48 — «Tələbə həyatı» menyusunun səhifələri: məzmun (yalnız məlumat,
 * məntiq src/utils/section-pages.ts-dədir). Şablon: layout=telebe (SectionPage
 * — F5.45-in sağ panelli şablonu, «Tələbə həyatı» qırıntısı və «Sual ver»).
 *
 * Quruluş HSE.ru tələbə portalları ilə: bir giriş səhifəsi (yaşayış, pul,
 * təşkilatlar, idman, mədəniyyət, könüllülük) → hər mövzunun öz səhifəsi;
 * birinci kurs tələbəsinin addımları; «necə qoşulmaq olar» hər təşkilatda.
 * Ruben və b. «A Guide for Leaders in Higher Education» (EHE): tələbə
 * təcrübəsi təhsilin bir hissəsidir — rifah, iştirak və tələbənin səsi.
 *
 * MƏNBƏLƏR (12 oktyabr 2026, yoxlanılıb):
 *   - saytın mövcud səhifələri: TGT (Əsasnamə), THİK (qrup həmkarlar ittifaqı
 *     təşkilatları barədə Əsasnamə, 18.06.2004), TEC, «Sosial təminat və maddi
 *     yardım», «İdman», «Muzey», «Yataqxana» (F5.45), Elmi Şura (bölmə);
 *   - ADDA xəbərləri: təqaüdlər (18.09.2020), ASCO-nun əlavə təqaüdü (2019),
 *     pulsuz təminat (2022–2024), TGT sədr seçkisi (08.06 və 10.06.2026), Novruz
 *     və himn (18.03.2026), Elmi Şura — dərnəklər üçün işçi qrup (27.04.2026),
 *     Müstəqillik Günü konserti (26.05.2026), futbol çempionatı (2026),
 *     üzgüçülük (2024, 2026), regata (2023), ASCO Spartakiadası (2018),
 *     «Kim? Nə? Harada?» (2022, 29.12.2023), maarifləndirmə (21.11.2025,
 *     02.04.2026), «Könüllülər ili» (2020); bədii dərnəklər elanı (22.04.2022).
 * YAZILMAYIB: tələbələrin telefonları və qrup nömrələri, köhnə idarə heyətlərinin
 * siyahıları (köhnə səhifədə idi — mətn store-da `telebePages:backup:…`),
 * təqaüd məbləğləri (Nazirlər Kabineti və ASCO dəyişir), psixoloji və tibbi
 * xidmət (məlumat yoxdur — «Məsul redaktorlar»-da gözləyir).
 */
import type { LinkSeed, QebulPageSeed } from './qebul-pages-content';

export type TelebePageSeed = QebulPageSeed;

// ── Təkrarlanan keçidlər ─────────────────────────────────────────────────────
export const TELEBE_HUB_SLUG = 'telebe-heyati';
const HUB = `/sehife/${TELEBE_HUB_SLUG}`;
const DORM = '/sehife/yataqxana';
const SOCIAL = '/sehife/sosial-teminat-ve-maddi-yardim';
const TGT = '/sehife/telebe-gencler-teskilati';
const THIK = '/sehife/telebe-hemkarlar-ittifaqi-komitesi';
const TEC = '/sehife/telebe-elmi-cemiyyeti';
const SPORT = '/sehife/idman';
const CULTURE = '/sehife/medeniyyet-ve-yaradiciliq-dernekleri';
const EVENTS = '/tedbirler';
const LIBRARY = '/struktur/informasiya-resurs-merkezi';
const COUNCIL = '/struktur/elmi-sura';
const ASK = '/vetendaslarin-muracieti';
const TGT_INSTAGRAM = 'https://www.instagram.com/adda_tgt/';

const NEWS = {
  tgt2026: '/xeberler/adda-telebe-gencler-teskilatinin-yeni-sedri-secilib',
  tgtInterview: '/xeberler/adda-tgt-sedr-seckilerinin-musahibe-merhelesi-basa-catib',
  fibonacci: '/xeberler/adda-telebeleri-fibonacci-intellektual-yarisinda',
  nesimi: '/xeberler/nesimi-650',
  tecAi: '/xeberler/denizcilikde-suni-intellektin-huquqi-aspektleri-muzakire-olunub',
  tecYouth: '/xeberler/tec-uzvleri-gencliyin-tedqiqati-tedbirinde-istirak-edib',
  tecSeminar: '/xeberler/adda-da-elmi-tedqiqat-metodlarina-dair-seminar-kecirilib',
  tecAsa: '/xeberler/adda-ve-asa-telebe-elmi-cemiyyetleri-arasinda-emekdasliq',
  studentConf: '/xeberler/telebe-ve-genc-tedqiqatcilarin-elmi-texniki-konfransi-kecirilib',
  scholarships2020: '/xeberler/teqaudler-teyin-edilib',
  asco2019: '/xeberler/adda-ya-yuksek-balla-qebul-olmus-42-telebeye-asco-nun-vesaiti-hesabina-elave-teq',
  benefits2024: '/xeberler/adda-nin-yaradilmasindan-28-il-otur',
  football2026: '/xeberler/telebeler-arasinda-futbol-cempionatinin-final-oyunu-kecirilib',
  swim2026: '/xeberler/adda-nin-yubileylerine-hesr-olunmus-uzguculuk-yarisi-kecirilib',
  swim2024: '/xeberler/akademiya-telebelerinin-uguru',
  regatta2023: '/xeberler/telebemizin-uguru',
  spartakiad2018: '/xeberler/adda-cempion',
  novruz2026: '/xeberler/adda-da-novruz-senliyi-kecirilib',
  independence2026: '/xeberler/adda-da-musteqillik-gunune-hesr-olunmus-konsert-proqrami-teskil-edilib',
  flagConcert: '/xeberler/adda-da-bayram-konserti',
  quiz2023: '/xeberler/adda-da-intellektual-yaris-kecirilib',
  quiz2022: '/xeberler/adda-da-susa-ili-ile-bagli-kim-ne-harada-intellektual-yarisi-kecirildi',
  lawQuiz: '/xeberler/huquq-zekasi-intellektual-yarisi',
  theatre: '/xeberler/telebelerimiz-genc-tamasacilar-teatrinda',
  council2026: '/xeberler/adda-da-elmi-suranin-novbeti-iclasi-kecirilib-2026',
  winterSchool2020: '/xeberler/adda-telebeleri-qis-liderlik-mektebine-qatiliblar',
  soldier2020: '/xeberler/denizci-telebeler-esgere-salam-herbi-vetenperlik-aksiyasina-qosulublar',
  blood: '/xeberler/adda-da-qanverme-aksiyasi-kecirildi',
  hiv2025: '/xeberler/maariflendirme-tedbiri-2025',
  organ2026: '/xeberler/adda-da-orqan-donorluguna-hesr-olunmus-maariflendirici-seminar-kecirilib',
  drugs: '/xeberler/adda-da-narkomaniyaya-qarsi-maariflendirme-tedbiri-kecirilib',
};
/** Bədii özfəaliyyət dərnəkləri elanı (22.04.2022). */
const CLUBS_2022 = '/elanlar/elan-telebelerin-nezerine';
/** ru/en səhifəsindən az xəbərə və elana: dilə görə az-a qayıtmır, prefiks açıq yazılır. */
const AZ = (path: string): string => `/az${path}`;

const ADDRESS_AZ = 'Bakı, Zərifə Əliyeva küçəsi 18';
const CONTACT_AZ =
  `**Ünvan:** ${ADDRESS_AZ}\n\n**Telefon:** (012) 493 36 44\n\n**E-poçt:** info@adda.edu.az\n\n` +
  `Sualınızı [onlayn göndərin](${ASK}) — cavab e-poçtunuza gəlir.`;
const CONTACT_EN =
  '**Address:** 18 Zarifa Aliyeva Street, Baku\n\n**Phone:** +994 12 493 36 44\n\n**E-mail:** info@adda.edu.az\n\n' +
  `[Send your question online](${ASK}) — the reply comes to your e-mail.`;
const CONTACT_RU =
  '**Адрес:** Баку, ул. Зарифы Алиевой, 18\n\n**Телефон:** +994 12 493 36 44\n\n**E-mail:** info@adda.edu.az\n\n' +
  `[Задайте вопрос онлайн](${ASK}) — ответ придёт на e-mail.`;

const L_AZ = {
  hub: { label: 'Tələbə həyatı', url: HUB },
  dorm: { label: 'Yataqxana', url: DORM },
  social: { label: 'Təqaüd və sosial dəstək', url: SOCIAL },
  tgt: { label: 'Tələbə Gənclər Təşkilatı', url: TGT },
  thik: { label: 'Tələbə Həmkarlar İttifaqı Komitəsi', url: THIK },
  tec: { label: 'Tələbə Elmi Cəmiyyəti', url: TEC },
  sport: { label: 'İdman', url: SPORT },
  culture: { label: 'Mədəniyyət və yaradıcılıq', url: CULTURE },
  events: { label: 'Tədbirlər təqvimi', url: EVENTS },
} satisfies Record<string, LinkSeed>;
const L_EN = {
  hub: { label: 'Student life', url: HUB },
  dorm: { label: 'Residence hall', url: DORM },
  social: { label: 'Scholarships and student support', url: SOCIAL },
  tgt: { label: 'Student Youth Organisation', url: TGT },
  thik: { label: 'Student Trade Union Committee', url: THIK },
  tec: { label: 'Student Research Society', url: TEC },
  sport: { label: 'Sport', url: SPORT },
  culture: { label: 'Culture and creativity', url: CULTURE },
  events: { label: 'Events calendar', url: EVENTS },
} satisfies Record<string, LinkSeed>;
const L_RU = {
  hub: { label: 'Студенческая жизнь', url: HUB },
  dorm: { label: 'Общежитие', url: DORM },
  social: { label: 'Стипендии и социальная поддержка', url: SOCIAL },
  tgt: { label: 'Организация студенческой молодёжи', url: TGT },
  thik: { label: 'Студенческий профсоюзный комитет', url: THIK },
  tec: { label: 'Студенческое научное общество', url: TEC },
  sport: { label: 'Спорт', url: SPORT },
  culture: { label: 'Культура и творчество', url: CULTURE },
  events: { label: 'Календарь мероприятий', url: EVENTS },
} satisfies Record<string, LinkSeed>;

// ── 1. Tələbə həyatı (bölmənin ana səhifəsi) ─────────────────────────────────
const HUB_PAGE: TelebePageSeed = {
  slug: TELEBE_HUB_SLUG,
  dataBlock: 'tedbirler',
  az: {
    title: 'Tələbə həyatı',
    lead:
      'Dərsdən kənar həyat da dənizçi hazırlığının bir hissəsidir. Yataqxana, təqaüd və sosial dəstək, üç tələbə təşkilatı, ' +
      'idman, mədəniyyət və könüllülük — hamısı bu bölmədədir.',
    seoDescription:
      'ADDA-da tələbə həyatı: yataqxana, təqaüd və sosial dəstək, TGT, Həmkarlar İttifaqı Komitəsi, Tələbə Elmi Cəmiyyəti, idman, mədəniyyət və tədbirlər.',
    stepsTitle: 'Birinci kurs tələbəsi üçün addımlar',
    facts: [
      { label: 'Tələbə təşkilatı', value: '3', icon: 'qrup' },
      { label: 'Yataqxana', value: '311 yer', icon: 'bina' },
      { label: 'İdman bazası', value: 'Hovuz və idman zalları', icon: 'idman' },
      { label: 'Forma, dərslik, yemək', value: 'Ödənişsiz', icon: 'haqq' },
    ],
    steps: [
      {
        title: 'Yataqxanaya ərizə verin',
        period: 'Sənəd təqdimi zamanı',
        who: 'Qəbul komissiyası',
        body: 'Əyani tələbələr yataqxana üçün ərizəni sənəd təqdimi zamanı verir. Yerləşdirmə tələbə ilə bağlanan müqavilə əsasında aparılır.',
        linkLabel: 'Yataqxana',
        linkUrl: DORM,
      },
      {
        title: 'Forma və dərs vəsaitlərini alın',
        who: 'Akademiya',
        body: 'Yay və qış geyim forması, dərs vəsaitləri ödənişsizdir. Forma ölçüləri sənəd təqdimi zamanı götürülür.',
      },
      {
        title: 'Təqaüd qaydası ilə tanış olun',
        period: 'Hər semestr',
        who: 'Dekanlıq',
        body: 'Təqaüd imtahan sessiyasının nəticəsinə görə rektorun əmri ilə təyin olunur: əlaçı, həvəsləndirici və adi. Təhsildə fərqlənənlərə ASCO əlavə təqaüd verir.',
        linkLabel: 'Təqaüd və sosial dəstək',
        linkUrl: SOCIAL,
      },
      {
        title: 'Tələbə təşkilatına qoşulun',
        who: 'TGT, Həmkarlar İttifaqı, TEC',
        body: 'Üzvlük könüllüdür. Təşkilatlar tələbələri təmsil edir, tədbir, yarış və elmi işləri təşkil edir.',
        linkLabel: 'Tələbə təşkilatları',
        linkUrl: '#telebe-teskilatlari',
      },
      {
        title: 'İdman və ya yaradıcılıq seçin',
        who: '«Bədən tərbiyəsi və idman» kafedrası, dekanlıqlar',
        body: 'Üzgüçülük, yelkən idmanı, voleybol, futbol, basketbol, güləş seksiyaları; bədii özfəaliyyət və intellektual yarışlar.',
        linkLabel: 'İdman',
        linkUrl: SPORT,
      },
      {
        title: 'Tədbirləri izləyin',
        who: 'Tədbirlər təqvimi',
        body: 'Akademiyanın tədbirləri təqvimdədir; növbəti tədbirlər və tələbə həyatından xəbərlər bu səhifədə avtomatik görünür.',
        linkLabel: 'Tədbirlər təqvimi',
        linkUrl: EVENTS,
      },
    ],
    body: `## Yaşayış və gündəlik şərait

- **Yataqxana** — Üzeyir Hacıbəyli küçəsi 114: 104 otaq, 311 yer; tələbələrə güzəştli şərtlə, əcnəbi tələbələrə 2026/2027-ci ildə ödənişsiz. Qayda və şərait: [Yataqxana](${DORM}).
- **Ödənişsiz təminat** — yay və qış geyim forması, dərs vəsaitləri və gündə iki dəfə yemək ([xəbər](${NEWS.benefits2024})).
- **Kitabxana** — Azərbaycan, rus və ingilis dillərində dənizçilik ədəbiyyatı: [İnformasiya resurs mərkəzi](${LIBRARY}).
- **İdman** — üzgüçülük hovuzu və idman zalları: [İdman](${SPORT}).

Təqaüdlər və əlavə dəstək: [Təqaüd və sosial dəstək](${SOCIAL}).

## Tələbə təşkilatları

| Təşkilat | Nə ilə məşğuldur |
|---|---|
| [Tələbə Gənclər Təşkilatı (TGT)](${TGT}) | tələbələrin maraqlarını təmsil və müdafiə edir; tədbirlər, yarışlar, festivallar, maarifləndirmə |
| [Tələbə Həmkarlar İttifaqı Komitəsi](${THIK}) | sosial-iqtisadi hüquqlar, təqaüdlərin vaxtında verilməsinə nəzarət, yataqxana, istirahət və idman |
| [Tələbə Elmi Cəmiyyəti (TEC)](${TEC}) | elmi seminarlar, olimpiadalar, debatlar, hər yaz tələbə konfransı |

Tələbələrin səsi rəhbərliyə çatır: TGT tələbələrin problemlərini Elmi Şuraya və rəhbərliyə çıxarır, Tələbə Elmi Cəmiyyətinin sədri [Elmi Şuranın](${COUNCIL}) üzvüdür.

## İdman

Akademiyada «Bədən tərbiyəsi və idman» kafedrası 2004-cü ildən fəaliyyət göstərir. Fakültələrarası yarışlar hər il keçirilir; 2026-cı ilin mayında tələbələr arasında futbol çempionatının finalı oynanılıb ([xəbər](${NEWS.football2026})), Akademiyanın komandası 2024-cü ildə ali məktəblərarası üzgüçülük yarışında üçüncü yeri tutub ([xəbər](${NEWS.swim2024})). Seksiyalar və nəticələr: [İdman](${SPORT}).

## Mədəniyyət və asudə vaxt

- Novruz şənliyində (17 mart 2026) Akademiyanın tarixində ilk himn təqdim olunub ([xəbər](${NEWS.novruz2026})).
- Bayram konsertləri, teatr səfərləri, «Kim? Nə? Harada?» intellektual yarışları.
- 2026-cı ilin aprelində Elmi Şurada tələbə dərnəklərinin formalaşdırılması üçün işçi qrup məsələsi müzakirə olunub ([xəbər](${NEWS.council2026})).

Ətraflı: [Mədəniyyət və yaradıcılıq](${CULTURE}).

## Könüllülük və maarifləndirmə

- **Könüllülük** — 2020-ci il «Könüllülər ili»ndə tələbələr Həmkarlar İttifaqları Konfederasiyasının Qış Liderlik Məktəbinə qatılıb ([xəbər](${NEWS.winterSchool2020})), «Əsgərə salam» aksiyasına qoşulub ([xəbər](${NEWS.soldier2020})); Akademiyada qanvermə aksiyaları keçirilir ([xəbər](${NEWS.blood})).
- **Sağlamlıq** — İİV/QİÇS-in profilaktikası (noyabr 2025, [xəbər](${NEWS.hiv2025})), orqan donorluğu (aprel 2026, [xəbər](${NEWS.organ2026})), narkomaniyaya qarşı maarifləndirmə ([xəbər](${NEWS.drugs})).`,
    faq: [
      {
        question: 'Yataqxanada yer necə alınır?',
        answer:
          'Əyani tələbələr ərizəni sənəd təqdimi zamanı verir; yerləşdirmə müqavilə əsasında aparılır. Şərait, qaydalar və hüquqlar «Yataqxana» səhifəsindədir.',
      },
      {
        question: 'Təqaüd kimə və necə verilir?',
        answer:
          'Təqaüd hər semestr imtahan sessiyasının nəticəsinə görə rektorun əmri ilə təyin olunur: əlaçı, həvəsləndirici və adi. Valideynlərini itirmiş və valideyn himayəsindən məhrum olmuş tələbələr qanuna görə təqaüdün iki mislini alır. Ətraflı — «Təqaüd və sosial dəstək» səhifəsində.',
      },
      {
        question: 'Tələbə təşkilatına necə üzv olmaq olar?',
        answer:
          'Üzvlük könüllüdür. TGT-yə İdarəetmə Şurasına yazılı müraciətlə (10 gün ərzində baxılır), Həmkarlar İttifaqına qrupunuzun həmkarlar ittifaqı təşkilatçısı vasitəsilə, Tələbə Elmi Cəmiyyətinə kafedranız vasitəsilə qoşulursunuz.',
      },
      {
        question: 'Tədbirlər haqqında haradan xəbər tuturam?',
        answer: 'Tədbirlər təqvimindən və xəbərlərdən. Növbəti tədbirlər və tələbə həyatından son xəbərlər bu səhifədə avtomatik görünür.',
      },
    ],
    sideLinks: [L_AZ.dorm, L_AZ.social, L_AZ.events, { label: 'İnformasiya resurs mərkəzi', url: LIBRARY }],
    contact: CONTACT_AZ,
  },
  en: {
    title: 'Student Life',
    lead:
      'Life outside the classroom is part of a seafarer’s training. Accommodation, scholarships and support, three student organisations, ' +
      'sport, culture and volunteering — all in this section.',
    seoDescription:
      'Student life at ADDA: residence hall, scholarships and support, student organisations, trade union committee, scientific society, sport, culture and events.',
    stepsTitle: 'First steps for first-year students',
    facts: [
      { label: 'Student organisations', value: '3', icon: 'qrup' },
      { label: 'Residence hall', value: '311 places', icon: 'bina' },
      { label: 'Sports facilities', value: 'Swimming pool and gyms', icon: 'idman' },
      { label: 'Uniform, textbooks, meals', value: 'Free of charge', icon: 'haqq' },
    ],
    steps: [
      {
        title: 'Apply for the residence hall',
        period: 'When submitting documents',
        who: 'Admissions committee',
        body: 'Full-time students apply for a place in the residence hall when they submit their documents. Accommodation is arranged under a contract with the student.',
        linkLabel: 'Residence hall',
        linkUrl: DORM,
      },
      {
        title: 'Collect your uniform and textbooks',
        who: 'The Academy',
        body: 'Summer and winter uniforms and textbooks are provided free of charge. Uniform sizes are taken when you submit your documents.',
      },
      {
        title: 'Learn how scholarships work',
        period: 'Every semester',
        who: 'Dean’s office',
        body: 'Scholarships are awarded by the Rector’s order on the basis of exam-session results: excellence, incentive and standard. ASCO pays an additional scholarship to top students.',
        linkLabel: 'Scholarships and student support',
        linkUrl: SOCIAL,
      },
      {
        title: 'Join a student organisation',
        who: 'Youth Organisation, Trade Union, Scientific Society',
        body: 'Membership is voluntary. The organisations represent students and run events, competitions and research activities.',
        linkLabel: 'Student organisations',
        linkUrl: '#student-organisations',
      },
      {
        title: 'Choose a sport or a creative activity',
        who: 'Physical Education and Sport Department, dean’s offices',
        body: 'Swimming, sailing, volleyball, football, basketball and wrestling sections; amateur arts and quiz competitions.',
        linkLabel: 'Sport',
        linkUrl: SPORT,
      },
      {
        title: 'Follow the events',
        who: 'Events calendar',
        body: 'Academy events are listed in the calendar; upcoming events and student-life news appear on this page automatically.',
        linkLabel: 'Events calendar',
        linkUrl: EVENTS,
      },
    ],
    body: `## Accommodation and daily life

- **Residence hall** — 114 Uzeyir Hajibeyli Street: 104 rooms, 311 places; offered to students on preferential terms and free of charge to international students in 2026/2027. Rules and facilities: [Residence hall](${DORM}).
- **Free provision** — summer and winter uniforms, textbooks and two meals a day ([news](${AZ(NEWS.benefits2024)})).
- **Library** — maritime literature in Azerbaijani, Russian and English: [Information Resource Centre](${LIBRARY}).
- **Sport** — swimming pool and gyms: [Sport](${SPORT}).

Scholarships and additional support: [Scholarships and student support](${SOCIAL}).

## Student organisations

| Organisation | What it does |
|---|---|
| [Student Youth Organisation](${TGT}) | represents and defends students’ interests; events, competitions, festivals, awareness campaigns |
| [Student Trade Union Committee](${THIK}) | social and economic rights, timely payment of scholarships, accommodation, leisure and sport |
| [Student Research Society](${TEC}) | research seminars, olympiads, debates, the annual spring student conference |

Students have a voice: the Youth Organisation raises students’ problems with the Academic Council and the management, and the chair of the Student Research Society is a member of the [Academic Council](${COUNCIL}).

## Sport

The Physical Education and Sport Department has existed since 2004. Inter-faculty competitions are held every year; in May 2026 the final of the student football championship was played ([news](${AZ(NEWS.football2026)})), and in 2024 the Academy team took third place in an inter-university swimming competition ([news](${AZ(NEWS.swim2024)})). Sections and results: [Sport](${SPORT}).

## Culture and leisure

- At the Novruz celebration (17 March 2026) the first anthem in the Academy’s history was presented ([news](${AZ(NEWS.novruz2026)})).
- Holiday concerts, theatre visits and “What? Where? When?” quiz competitions.
- In April 2026 the Academic Council discussed setting up a working group to form student clubs ([news](${AZ(NEWS.council2026)})).

More: [Culture and creativity](${CULTURE}).

## Volunteering and awareness

- **Volunteering** — in the 2020 “Year of Volunteers” students took part in the Trade Unions Confederation’s Winter Leadership School ([news](${AZ(NEWS.winterSchool2020)})) and the “Greetings to the Soldier” campaign ([news](${AZ(NEWS.soldier2020)})); blood donation drives are held at the Academy ([news](${AZ(NEWS.blood)})).
- **Health** — HIV/AIDS prevention (November 2025, [news](${AZ(NEWS.hiv2025)})), organ donation (April 2026, [news](${AZ(NEWS.organ2026)})) and drug-prevention events ([news](${AZ(NEWS.drugs)})).`,
    faq: [
      {
        question: 'How do I get a place in the residence hall?',
        answer:
          'Full-time students apply when they submit their documents; accommodation is arranged under a contract. Facilities, rules and rights are on the “Residence hall” page.',
      },
      {
        question: 'Who receives a scholarship and how?',
        answer:
          'Scholarships are awarded every semester by the Rector’s order on the basis of exam-session results: excellence, incentive and standard. By law, orphans and students deprived of parental care receive double the scholarship. Details are on the “Scholarships and student support” page.',
      },
      {
        question: 'How do I join a student organisation?',
        answer:
          'Membership is voluntary. You join the Youth Organisation by a written application to its Governing Board (considered within 10 days), the Trade Union through your group’s union organiser, and the Scientific Society through your department.',
      },
      {
        question: 'Where can I find out about events?',
        answer: 'In the events calendar and the news. Upcoming events and the latest student-life news appear on this page automatically.',
      },
    ],
    sideLinks: [L_EN.dorm, L_EN.social, L_EN.events, { label: 'Information Resource Centre', url: LIBRARY }],
    contact: CONTACT_EN,
  },
  ru: {
    title: 'Студенческая жизнь',
    lead:
      'Жизнь вне аудитории — тоже часть подготовки моряка. Общежитие, стипендии и социальная поддержка, три студенческие организации, ' +
      'спорт, культура и волонтёрство — всё в этом разделе.',
    seoDescription:
      'Студенческая жизнь в АГМА: общежитие, стипендии и поддержка, студенческие организации, профком, научное общество, спорт, культура и мероприятия.',
    stepsTitle: 'Первые шаги первокурсника',
    facts: [
      { label: 'Студенческие организации', value: '3', icon: 'qrup' },
      { label: 'Общежитие', value: '311 мест', icon: 'bina' },
      { label: 'Спортивная база', value: 'Бассейн и спортзалы', icon: 'idman' },
      { label: 'Форма, учебники, питание', value: 'Бесплатно', icon: 'haqq' },
    ],
    steps: [
      {
        title: 'Подайте заявление на общежитие',
        period: 'При подаче документов',
        who: 'Приёмная комиссия',
        body: 'Студенты очной формы подают заявление на общежитие при подаче документов. Заселение проводится по договору со студентом.',
        linkLabel: 'Общежитие',
        linkUrl: DORM,
      },
      {
        title: 'Получите форму и учебники',
        who: 'Академия',
        body: 'Летняя и зимняя форма и учебные пособия выдаются бесплатно. Размеры формы снимают при подаче документов.',
      },
      {
        title: 'Узнайте, как назначается стипендия',
        period: 'Каждый семестр',
        who: 'Деканат',
        body: 'Стипендия назначается приказом ректора по итогам экзаменационной сессии: отличная, поощрительная и обычная. Отличившимся студентам ASCO выплачивает дополнительную стипендию.',
        linkLabel: 'Стипендии и социальная поддержка',
        linkUrl: SOCIAL,
      },
      {
        title: 'Вступите в студенческую организацию',
        who: 'Молодёжная организация, профком, научное общество',
        body: 'Членство добровольное. Организации представляют студентов, проводят мероприятия, соревнования и научную работу.',
        linkLabel: 'Студенческие организации',
        linkUrl: '#studencheskie-organizatsii',
      },
      {
        title: 'Выберите спорт или творчество',
        who: 'Кафедра физического воспитания и спорта, деканаты',
        body: 'Секции плавания, парусного спорта, волейбола, футбола, баскетбола, борьбы; художественная самодеятельность и интеллектуальные игры.',
        linkLabel: 'Спорт',
        linkUrl: SPORT,
      },
      {
        title: 'Следите за мероприятиями',
        who: 'Календарь мероприятий',
        body: 'Мероприятия Академии — в календаре; ближайшие мероприятия и новости студенческой жизни появляются на этой странице автоматически.',
        linkLabel: 'Календарь мероприятий',
        linkUrl: EVENTS,
      },
    ],
    body: `## Проживание и быт

- **Общежитие** — ул. Узеира Гаджибейли, 114: 104 комнаты, 311 мест; студентам — на льготных условиях, иностранным студентам в 2026/2027 году — бесплатно. Правила и условия: [Общежитие](${DORM}).
- **Бесплатное обеспечение** — летняя и зимняя форма, учебные пособия и двухразовое питание ([новость](${AZ(NEWS.benefits2024)})).
- **Библиотека** — морская литература на азербайджанском, русском и английском языках: [Информационно-ресурсный центр](${LIBRARY}).
- **Спорт** — плавательный бассейн и спортивные залы: [Спорт](${SPORT}).

Стипендии и дополнительная поддержка: [Стипендии и социальная поддержка](${SOCIAL}).

## Студенческие организации

| Организация | Чем занимается |
|---|---|
| [Организация студенческой молодёжи](${TGT}) | представляет и защищает интересы студентов; мероприятия, соревнования, фестивали, просвещение |
| [Студенческий профсоюзный комитет](${THIK}) | социально-экономические права, контроль своевременной выплаты стипендий, общежитие, отдых и спорт |
| [Студенческое научное общество](${TEC}) | научные семинары, олимпиады, дебаты, ежегодная весенняя студенческая конференция |

Голос студентов слышен: молодёжная организация выносит проблемы студентов на Учёный совет и руководству, а председатель Студенческого научного общества — член [Учёного совета](${COUNCIL}).

## Спорт

Кафедра физического воспитания и спорта работает с 2004 года. Межфакультетские соревнования проходят ежегодно; в мае 2026 года состоялся финал студенческого чемпионата по футболу ([новость](${AZ(NEWS.football2026)})), а в 2024 году команда Академии заняла третье место на межвузовских соревнованиях по плаванию ([новость](${AZ(NEWS.swim2024)})). Секции и результаты: [Спорт](${SPORT}).

## Культура и досуг

- На празднике Новруз (17 марта 2026 года) был представлен первый в истории Академии гимн ([новость](${AZ(NEWS.novruz2026)})).
- Праздничные концерты, походы в театр, интеллектуальные игры «Что? Где? Когда?».
- В апреле 2026 года Учёный совет обсудил создание рабочей группы по формированию студенческих кружков ([новость](${AZ(NEWS.council2026)})).

Подробнее: [Культура и творчество](${CULTURE}).

## Волонтёрство и просвещение

- **Волонтёрство** — в «Год волонтёров» (2020) студенты участвовали в Зимней школе лидерства Конфедерации профсоюзов ([новость](${AZ(NEWS.winterSchool2020)})) и акции «Привет солдату» ([новость](${AZ(NEWS.soldier2020)})); в Академии проходят акции по сдаче крови ([новость](${AZ(NEWS.blood)})).
- **Здоровье** — профилактика ВИЧ/СПИДа (ноябрь 2025, [новость](${AZ(NEWS.hiv2025)})), органное донорство (апрель 2026, [новость](${AZ(NEWS.organ2026)})), профилактика наркомании ([новость](${AZ(NEWS.drugs)})).`,
    faq: [
      {
        question: 'Как получить место в общежитии?',
        answer:
          'Студенты очной формы подают заявление при подаче документов; заселение проводится по договору. Условия, правила и права — на странице «Общежитие».',
      },
      {
        question: 'Кому и как назначается стипендия?',
        answer:
          'Стипендия назначается каждый семестр приказом ректора по итогам экзаменационной сессии: отличная, поощрительная и обычная. Студенты-сироты и лишённые родительской опеки по закону получают стипендию в двойном размере. Подробнее — на странице «Стипендии и социальная поддержка».',
      },
      {
        question: 'Как вступить в студенческую организацию?',
        answer:
          'Членство добровольное. В молодёжную организацию — письменным заявлением в Управляющий совет (рассматривается в течение 10 дней), в профсоюз — через профорга группы, в научное общество — через кафедру.',
      },
      {
        question: 'Где узнать о мероприятиях?',
        answer: 'В календаре мероприятий и новостях. Ближайшие мероприятия и последние новости студенческой жизни появляются на этой странице автоматически.',
      },
    ],
    sideLinks: [L_RU.dorm, L_RU.social, L_RU.events, { label: 'Информационно-ресурсный центр', url: LIBRARY }],
    contact: CONTACT_RU,
  },
};

// ── 2. Tələbə Gənclər Təşkilatı ──────────────────────────────────────────────
const TGT_PAGE: TelebePageSeed = {
  slug: 'telebe-gencler-teskilati',
  dataBlock: 'yox',
  az: {
    title: 'Tələbə Gənclər Təşkilatı',
    lead:
      'TGT tələbələrin maraqlarını təmsil və müdafiə edən könüllü təşkilatdır: sosial məsələlər, maarifləndirmə, asudə vaxt, yarış və festivallar. ' +
      'Azərbaycan Tələbə Gənclər Təşkilatları İttifaqında (ATGTİ) birləşən təşkilatlardandır.',
    seoDescription:
      'ADDA Tələbə Gənclər Təşkilatı (TGT): məqsəd və vəzifələr, quruluş, üzvlük qaydası, sədr seçkisi, tədbirlər və əlaqə.',
    stepsTitle: 'TGT-yə necə qoşulmaq olar',
    facts: [
      { label: 'Üzvlük', value: 'Könüllü', icon: 'qrup' },
      { label: 'Müraciətə baxılır', value: '10 gün ərzində', icon: 'muddet' },
      { label: 'Ali orqan', value: 'Konfrans, ildə ən azı bir dəfə', icon: 'tarix' },
      { label: 'İttifaq', value: 'ATGTİ', icon: 'diger' },
    ],
    steps: [
      {
        title: 'Yazılı müraciət edin',
        who: 'TGT İdarəetmə Şurası',
        body: 'Akademiyanın istənilən tələbəsi üzv ola bilər. Müraciət İdarəetmə Şurasına yazılı verilir.',
      },
      {
        title: 'Qərarı gözləyin',
        period: '10 gün',
        who: 'İdarəetmə Şurası',
        body: 'Müraciətə 10 gün ərzində baxılır. Şura üzvlərinin yarıdan çoxu razılıq verəndə üzvlüyə qəbul olunursunuz.',
      },
      {
        title: 'Qrupunuzda fəaliyyətə başlayın',
        who: 'Qrup və fakültə təşkilatı',
        body: 'Qrup təşkilatı TGT-nin ilk özəyidir. Təşəbbüslər qrupdan fakültəyə, fakültədən İdarəetmə Şurasına çatdırılır.',
      },
      {
        title: 'Seçin və seçilin',
        who: 'Üzvlər',
        body: 'Üzvlər təşkilatın idarəçiliyində iştirak edir, seçkili orqanlara seçir və seçilir, layihə və proqramlarla çıxış edir.',
      },
    ],
    body: `## Məqsəd və vəzifələr

Təşkilatın məqsədi dövlət gənclər siyasəti istiqamətində tələbələrin və hər bir tələbənin maraqlarını təmsil və müdafiə etmək, onların ictimai, mədəni, sosial və iqtisadi həyatda fəal iştirakını təmin etməkdir. Əsas vəzifələr:

- tələbələrin sosial problemlərinin həlli, hüquqlarının təmin edilməsi;
- maarifləndirmə, narkomaniya, alkoqolizm və digər neqativ meyllərə qarşı profilaktika;
- asudə vaxtın səmərəli təşkili: dərnəklər, studiyalar, klublar, kurslar;
- müsabiqə, olimpiada, sərgi və festivallarda istedadlı tələbələrin iştirakı;
- seminar, forum, dəyirmi masa, diskussiya klubları, görkəmli şəxslərlə görüşlər;
- tələbələrin problemlərinin Elmi Şuraya çıxarılması, rəhbərlik qarşısında vəsatət qaldırılması.

## Quruluş və idarəetmə

| Səviyyə | Necə qurulur |
|---|---|
| Qrup təşkilatı | ən azı 3 üzv; sədr və müavin gizli səsvermə ilə seçilir; üzv sayı 20-dən çox olanda 5 nəfərlik İdarə Heyəti |
| Fakültə təşkilatı | qrupların ən azı yarısında özək olanda yaradılır; ən azı 7 nəfərlik İdarə Heyəti |
| Akademiya üzrə | Konfrans — ali orqan, ildə ən azı bir dəfə; İdarəetmə Şurası — hər fakültədən 2–3 nəfər, ən azı 11 üzv, iki il müddətinə; Təftiş Komissiyası |

İdarəetmə Şurasının iclasları ayda ən azı iki dəfə keçirilir; qərarlar sadə səs çoxluğu ilə qəbul olunur.

## Sədr seçkisi (2026)

2026-cı ildə ADDA TGT-nin sədr seçkisini Azərbaycan Tələbə Gənclər Təşkilatları İttifaqı elan edib və keçirib:

1. **Sənəd qəbulu** — Əsasnamənin tələblərinə uyğun.
2. **Müsahibə (3 iyun)** — namizədlərin liderlik potensialı, təşkilatçılıq və idarəetmə bacarıqları, TGT-nin inkişafına baxışı qiymətləndirilib ([xəbər](${NEWS.tgtInterview})).
3. **Onlayn səsvermə (9 iyun)** — ən çox səs toplayan Hüseyn Camallı TGT-nin sədri seçilib ([xəbər](${NEWS.tgt2026})).

## Tədbirlər və layihələr

- «Nəsimi – 650» — dahi şairin yubileyinə həsr olunmuş tədbir, Humanitar fənlər kafedrası ilə birgə ([xəbər](${NEWS.nesimi})).
- Fibonacci intellektual yarışı (2025) — Gənclər və İdman Nazirliyi, ATGTİ və «Fibonacci» MMC-nin layihəsi ([xəbər](${NEWS.fibonacci})).
- Tələbə yarışları və yığma komandalar — TGT-nin idman sədri vasitəsilə.
- Könüllülük və maarifləndirmə aksiyaları — [Tələbə həyatı](${HUB}#konulluluk-ve-maariflendirme).

## Hüquqi əsas

Tələbə gənclər təşkilatları Azərbaycan Respublikası Prezidentinin İcra Aparatı rəhbərinin 2005-ci il 15 fevral tarixli 41 nömrəli sərəncamı ilə təsdiq olunmuş tədbirlər planı və təhsil nazirinin 2005-ci il 28 fevral tarixli 89 nömrəli əmri əsasında bütün təhsil müəssisələrində yaradılıb. TGT Konstitusiyaya, qanunlara, Gənclər və İdman, Elm və Təhsil nazirliklərinin qərarlarına, Akademiyanın nizamnaməsinə və öz Əsasnaməsinə uyğun fəaliyyət göstərir.`,
    faq: [
      {
        question: 'Kim TGT-yə üzv ola bilər?',
        answer: 'Akademiyanın istənilən tələbəsi. Üzvlük könüllüdür; müraciət İdarəetmə Şurasına yazılı verilir və 10 gün ərzində baxılır.',
      },
      {
        question: 'Üzvlərin hüquqları nələrdir?',
        answer:
          'Təşkilatın idarəçiliyində iştirak etmək, seçkili orqanlara seçmək və seçilmək, tədbirlərdə iştirak etmək, fəaliyyət barədə məlumat almaq, layihə və proqramlarla çıxış etmək, öz maraqlarının müdafiəsi üçün təşkilata müraciət etmək.',
      },
      {
        question: 'TGT tələbənin problemini necə qaldırır?',
        answer:
          'Məsələni öyrənir, Elmi Şuraya çıxarır və ya Akademiyanın rəhbərliyi qarşısında vəsatət qaldırır. Fərdi müraciəti onlayn formada da göndərə bilərsiniz.',
      },
      {
        question: 'Üzvlükdən necə çıxmaq olar?',
        answer: 'Üzv istədiyi vaxt könüllü çıxa bilər. Üzvlüyünə xitam verilməsi ilə razı olmayan üzv İdarəetmə Şurasına şikayət edə bilər.',
      },
    ],
    sideLinks: [{ label: 'TGT Instagram', url: TGT_INSTAGRAM }, L_AZ.hub, L_AZ.thik, L_AZ.tec],
    contact: CONTACT_AZ,
  },
  en: {
    title: 'Student Youth Organisation',
    lead:
      'The Student Youth Organisation (TGT) is a voluntary body that represents and defends students’ interests: social issues, awareness campaigns, leisure, competitions and festivals. ' +
      'It belongs to the Union of Student Youth Organisations of Azerbaijan (ATGTİ).',
    seoDescription:
      'ADDA Student Youth Organisation: aims and tasks, structure, membership, election of the chair, events and contacts.',
    stepsTitle: 'How to join',
    facts: [
      { label: 'Membership', value: 'Voluntary', icon: 'qrup' },
      { label: 'Applications considered', value: 'Within 10 days', icon: 'muddet' },
      { label: 'Supreme body', value: 'Conference, at least once a year', icon: 'tarix' },
      { label: 'Union', value: 'ATGTİ', icon: 'diger' },
    ],
    steps: [
      {
        title: 'Apply in writing',
        who: 'Governing Board',
        body: 'Any student of the Academy may become a member. The application is submitted in writing to the Governing Board.',
      },
      {
        title: 'Wait for the decision',
        period: '10 days',
        who: 'Governing Board',
        body: 'Applications are considered within 10 days. You become a member when more than half of the Board members approve.',
      },
      {
        title: 'Get involved in your group',
        who: 'Group and faculty organisations',
        body: 'The group organisation is the organisation’s basic cell. Initiatives pass from the group to the faculty and on to the Governing Board.',
      },
      {
        title: 'Vote and stand for election',
        who: 'Members',
        body: 'Members take part in running the organisation, elect and may be elected to its bodies, and propose projects and programmes.',
      },
    ],
    body: `## Aims and tasks

The organisation represents and defends the interests of students, individually and collectively, in line with the state youth policy, and encourages their active part in public, cultural, social and economic life. Its main tasks:

- solving students’ social problems and protecting their rights;
- awareness campaigns and prevention of drug and alcohol abuse and other harmful behaviour;
- organising leisure: clubs, studios, societies and courses;
- supporting talented students in competitions, olympiads, exhibitions and festivals;
- seminars, forums, round tables, debate clubs and meetings with prominent people;
- raising students’ problems with the Academic Council and petitioning the management.

## Structure and governance

| Level | How it works |
|---|---|
| Group organisation | at least 3 members; chair and deputy elected by secret ballot; a 5-member board once membership exceeds 20 |
| Faculty organisation | formed when at least half of the faculty’s groups have cells; a board of at least 7 members |
| Academy level | Conference — the supreme body, at least once a year; Governing Board — 2–3 members from each faculty, at least 11 in total, elected for two years; Audit Commission |

The Governing Board meets at least twice a month and decides by simple majority.

## Election of the chair (2026)

In 2026 the election of the chair of ADDA’s Student Youth Organisation was announced and run by the Union of Student Youth Organisations of Azerbaijan:

1. **Applications** — in line with the organisation’s charter.
2. **Interviews (3 June)** — candidates’ leadership potential, organisational and management skills and vision for the organisation were assessed ([news](${AZ(NEWS.tgtInterview)})).
3. **Online vote (9 June)** — Huseyn Jamalli, who received the most votes, was elected chair ([news](${AZ(NEWS.tgt2026)})).

## Events and projects

- “Nasimi 650” — an event marking the great poet’s anniversary, held with the Humanities Department ([news](${AZ(NEWS.nesimi)})).
- Fibonacci quiz competition (2025) — a project of the Ministry of Youth and Sport, ATGTİ and Fibonacci LLC ([news](${AZ(NEWS.fibonacci)})).
- Student competitions and Academy teams — through the organisation’s sports officer.
- Volunteering and awareness campaigns — [Student life](${HUB}#volunteering-and-awareness).

## Legal basis

Student youth organisations were set up in all educational institutions under the action plan approved by Order No. 41 of the Head of the Executive Office of the President of Azerbaijan of 15 February 2005 and Order No. 89 of the Minister of Education of 28 February 2005. The organisation acts in accordance with the Constitution, the law, decisions of the Ministry of Youth and Sport and the Ministry of Science and Education, the Academy’s statute and its own charter.`,
    faq: [
      {
        question: 'Who can join?',
        answer: 'Any student of the Academy. Membership is voluntary; the written application goes to the Governing Board and is considered within 10 days.',
      },
      {
        question: 'What rights do members have?',
        answer:
          'To take part in running the organisation, to elect and be elected to its bodies, to attend its events, to receive information about its work, to propose projects and programmes, and to ask the organisation to defend their interests.',
      },
      {
        question: 'How does the organisation raise a student’s problem?',
        answer:
          'It looks into the issue and brings it to the Academic Council or petitions the Academy’s management. You can also send an individual request through the online form.',
      },
      {
        question: 'How do I leave the organisation?',
        answer: 'A member may leave voluntarily at any time. A member who disagrees with the termination of their membership may appeal to the Governing Board.',
      },
    ],
    sideLinks: [{ label: 'Instagram', url: TGT_INSTAGRAM }, L_EN.hub, L_EN.thik, L_EN.tec],
    contact: CONTACT_EN,
  },
  ru: {
    title: 'Организация студенческой молодёжи',
    lead:
      'Организация студенческой молодёжи (TGT) — добровольное объединение, которое представляет и защищает интересы студентов: социальные вопросы, просвещение, досуг, соревнования и фестивали. ' +
      'Входит в Союз студенческих молодёжных организаций Азербайджана (ATGTİ).',
    seoDescription:
      'Организация студенческой молодёжи АГМА: цели и задачи, структура, членство, выборы председателя, мероприятия и контакты.',
    stepsTitle: 'Как вступить',
    facts: [
      { label: 'Членство', value: 'Добровольное', icon: 'qrup' },
      { label: 'Рассмотрение заявления', value: 'В течение 10 дней', icon: 'muddet' },
      { label: 'Высший орган', value: 'Конференция, не реже раза в год', icon: 'tarix' },
      { label: 'Союз', value: 'ATGTİ', icon: 'diger' },
    ],
    steps: [
      {
        title: 'Подайте письменное заявление',
        who: 'Управляющий совет',
        body: 'Членом организации может стать любой студент Академии. Заявление подаётся в Управляющий совет в письменной форме.',
      },
      {
        title: 'Дождитесь решения',
        period: '10 дней',
        who: 'Управляющий совет',
        body: 'Заявление рассматривается в течение 10 дней. Вы становитесь членом, если «за» проголосовало более половины членов совета.',
      },
      {
        title: 'Начните работу в группе',
        who: 'Групповая и факультетская организации',
        body: 'Групповая организация — первичная ячейка. Инициативы передаются от группы к факультету и далее в Управляющий совет.',
      },
      {
        title: 'Избирайте и будьте избранными',
        who: 'Члены организации',
        body: 'Члены участвуют в управлении организацией, избирают и могут быть избраны в её органы, выступают с проектами и программами.',
      },
    ],
    body: `## Цели и задачи

Цель организации — в русле государственной молодёжной политики представлять и защищать интересы студентов и каждого студента, обеспечивать их активное участие в общественной, культурной, социальной и экономической жизни. Основные задачи:

- решение социальных проблем студентов, защита их прав;
- просвещение, профилактика наркомании, алкоголизма и других негативных явлений;
- организация досуга: кружки, студии, клубы, курсы;
- участие талантливых студентов в конкурсах, олимпиадах, выставках и фестивалях;
- семинары, форумы, круглые столы, дискуссионные клубы, встречи с известными людьми;
- вынесение проблем студентов на Учёный совет, ходатайства перед руководством.

## Структура и управление

| Уровень | Как устроен |
|---|---|
| Групповая организация | не менее 3 членов; председатель и заместитель избираются тайным голосованием; при более чем 20 членах — правление из 5 человек |
| Факультетская организация | создаётся, если ячейки есть не менее чем в половине групп; правление не менее 7 человек |
| Уровень Академии | Конференция — высший орган, не реже раза в год; Управляющий совет — 2–3 человека от каждого факультета, не менее 11 членов, на два года; Ревизионная комиссия |

Управляющий совет собирается не реже двух раз в месяц и принимает решения простым большинством.

## Выборы председателя (2026)

В 2026 году выборы председателя Организации студенческой молодёжи АГМА объявил и провёл Союз студенческих молодёжных организаций Азербайджана:

1. **Приём документов** — в соответствии с уставом организации.
2. **Собеседование (3 июня)** — оценивались лидерский потенциал, организаторские и управленческие навыки кандидатов, их видение развития организации ([новость](${AZ(NEWS.tgtInterview)})).
3. **Онлайн-голосование (9 июня)** — председателем избран набравший больше всего голосов Гусейн Джамаллы ([новость](${AZ(NEWS.tgt2026)})).

## Мероприятия и проекты

- «Насими — 650» — мероприятие к юбилею великого поэта, совместно с кафедрой гуманитарных дисциплин ([новость](${AZ(NEWS.nesimi)})).
- Интеллектуальный конкурс Fibonacci (2025) — проект Министерства молодёжи и спорта, ATGTİ и ООО «Fibonacci» ([новость](${AZ(NEWS.fibonacci)})).
- Студенческие соревнования и сборные Академии — через спортивного председателя организации.
- Волонтёрские и просветительские акции — [Студенческая жизнь](${HUB}#volonterstvo-i-prosveshchenie).

## Правовая основа

Студенческие молодёжные организации созданы во всех учебных заведениях на основании плана мероприятий, утверждённого распоряжением руководителя Исполнительного аппарата Президента Азербайджанской Республики № 41 от 15 февраля 2005 года, и приказа министра образования № 89 от 28 февраля 2005 года. Организация действует в соответствии с Конституцией, законами, решениями Министерства молодёжи и спорта и Министерства науки и образования, уставом Академии и собственным уставом.`,
    faq: [
      {
        question: 'Кто может вступить?',
        answer: 'Любой студент Академии. Членство добровольное; письменное заявление подаётся в Управляющий совет и рассматривается в течение 10 дней.',
      },
      {
        question: 'Какие права у членов организации?',
        answer:
          'Участвовать в управлении организацией, избирать и быть избранным в её органы, участвовать в мероприятиях, получать информацию о её работе, выступать с проектами и программами, обращаться в организацию за защитой своих интересов.',
      },
      {
        question: 'Как организация поднимает проблему студента?',
        answer:
          'Изучает вопрос, выносит его на Учёный совет или ходатайствует перед руководством Академии. Индивидуальное обращение можно отправить и через онлайн-форму.',
      },
      {
        question: 'Как выйти из организации?',
        answer: 'Член организации может выйти добровольно в любое время. Несогласный с прекращением членства может обжаловать решение в Управляющем совете.',
      },
    ],
    sideLinks: [{ label: 'Instagram', url: TGT_INSTAGRAM }, L_RU.hub, L_RU.thik, L_RU.tec],
    contact: CONTACT_RU,
  },
};

// ── 3. Tələbə Həmkarlar İttifaqı Komitəsi ────────────────────────────────────
const THIK_PAGE: TelebePageSeed = {
  slug: 'telebe-hemkarlar-ittifaqi-komitesi',
  dataBlock: 'yox',
  az: {
    title: 'Tələbə Həmkarlar İttifaqı Komitəsi',
    lead:
      'Həmkarlar ittifaqı tələbələrin sosial və iqtisadi hüquqlarını müdafiə edir: təqaüdlərin vaxtında və düzgün verilməsi, yataqxana və məişət, ' +
      'sağlamlıq və istirahət, idman və mədəni tədbirlər.',
    seoDescription:
      'ADDA Tələbə Həmkarlar İttifaqı Komitəsi: tələbələrin sosial müdafiəsi, təqaüd, yataqxana, sağlamlıq, komissiyalar, qrup təşkilatçısı və müraciət yolu.',
    stepsTitle: 'Həmkarlar ittifaqına necə müraciət etmək olar',
    facts: [
      { label: 'Qrup təşkilatı', value: 'Ən azı 7 üzv', icon: 'qrup' },
      { label: 'Qrup təşkilatçısı', value: '2 il müddətinə seçilir', icon: 'tarix' },
      { label: 'Komissiya', value: '4', icon: 'sened' },
    ],
    steps: [
      {
        title: 'Qrup təşkilatçınıza müraciət edin',
        who: 'Qrup həmkarlar ittifaqı təşkilatçısı',
        body: 'Təşkilatçı qrupun ümumi iclasında açıq səsvermə ilə iki il müddətinə seçilir. İlk müraciət ona edilir.',
      },
      {
        title: 'Məsələ komitəyə çıxarılır',
        who: 'Fakültə və Akademiya komitəsi',
        body: 'Təqaüd, yataqxana, tibbi müayinə və tədris intizamı məsələləri komitədə, lazım olanda dekanlıqla birlikdə müzakirə olunur.',
      },
      {
        title: 'Hüquqi yardım alın',
        who: 'Əmək və sosial müdafiə komissiyası',
        body: 'Komissiya ittifaq üzvlərinə məsləhət verir, ərizə və digər hüquqi sənədlərin hazırlanmasına kömək edir.',
      },
    ],
    body: `## Nə edir

- **Təqaüd** — aylıq təqaüdlərin vaxtında və düzgün verilməsinə nəzarət, təhsildə fərqlənənlərin rəğbətləndirilməsi.
- **Yaşayış** — yataqxanaya ehtiyacı olan tələbələrin yerlə təmini, məişət şəraitinin yaxşılaşdırılması.
- **Sağlamlıq** — tibb məntəqəsi ilə əlaqə, hər il tibbi müayinə, səhhəti zəif olan tələbələr üçün güzəştli sanatoriya-kurort yollayışları.
- **İctimai nəzarət** — tələbələrə xidmət edən obyektlərin işi: kitabxana, yeməkxana, bufet, tibb məntəqəsi, yataqxana, idman qurğuları, kompüter zalları.
- **Asudə vaxt** — muzey və tarixi yerlərə səyahətlər, teatr tamaşaları, intellektual yarışlar, festival və spartakiadalar, bayram tədbirləri.

## Quruluş

Həmkarlar ittifaqı qrupu eyni qrupda təhsil alan ən azı 7 üzvü birləşdirir; qruplar fakültə və Akademiya komitəsində təmsil olunur. Komitə nizamnaməyə uyğun komissiyalar yaradır:

- **Təşkilati-kütləvi iş komissiyası.**
- **Əmək və sosial müdafiə komissiyası** — hüquqi məsləhət, ərizə və sənədlərin hazırlanmasında yardım, kollektiv müqavilənin icrasına nəzarət.
- **Mədəni-kütləvi və idman işləri komissiyası** — bayramlar, səyahətlər, teatr, dərnəklər, intellektual yarışlar, festival və spartakiadalar.
- **Əməyin mühafizəsi komissiyası** — təhlükəsizlik qaydalarına və sanitar-gigiyenik şəraitə nəzarət.

Komitənin nəzdində layihə işləri, idman (İdman Cəmiyyəti — Akademiya daxilində yarışlar) və elmi işlər (elmi tədbirlər, bilik yarışları) üzrə departamentlər var.

## Hüquqi əsas

Qrup təşkilatlarının işi «Ali və orta ixtisas təhsili müəssisələri qrup həmkarlar ittifaqı təşkilatları barədə Əsasnamə» ilə tənzimlənir (Respublika Komitəsinin 18 iyun 2004-cü il Plenumunda təsdiq edilib). Komitənin əsas vəzifəsi ittifaq üzvlərinin sosial, iqtisadi hüquqlarının və qanuni mənafelərinin müdafiəsidir.`,
    faq: [
      {
        question: 'Təqaüdüm gecikir. Kimə müraciət edim?',
        answer: 'Dekanlığa və qrup həmkarlar ittifaqı təşkilatçısına. Həmkarlar ittifaqı təqaüdlərin vaxtında və düzgün verilməsinə nəzarət edir.',
      },
      {
        question: 'Həmkarlar ittifaqı yataqxana məsələsində kömək edə bilərmi?',
        answer:
          'Bəli. Komitə Akademiyanın təsərrüfat bölmələri ilə birlikdə yataqxanaya ehtiyacı olan tələbələrin yerlə təminatını və məişət şəraitini diqqətdə saxlayır.',
      },
      {
        question: 'Sanatoriya yollayışı necə alınır?',
        answer:
          'Səhhəti zəif olan tələbələr üçün həmkarlar ittifaqı vasitəsilə güzəştli sanatoriya-kurort yollayışlarının ayrılmasına çalışılır. Qrup təşkilatçınıza müraciət edin.',
      },
    ],
    sideLinks: [L_AZ.hub, L_AZ.social, L_AZ.dorm, L_AZ.tgt],
    contact: CONTACT_AZ,
  },
  en: {
    title: 'Student Trade Union Committee',
    lead:
      'The trade union defends students’ social and economic rights: timely and correct payment of scholarships, accommodation and living conditions, ' +
      'health and recreation, sport and cultural events.',
    seoDescription:
      'ADDA Student Trade Union Committee: social protection of students, scholarships, accommodation, health, commissions, group organisers and how to apply.',
    stepsTitle: 'How to get help from the trade union',
    facts: [
      { label: 'Group organisation', value: 'At least 7 members', icon: 'qrup' },
      { label: 'Group organiser', value: 'Elected for 2 years', icon: 'tarix' },
      { label: 'Commissions', value: '4', icon: 'sened' },
    ],
    steps: [
      {
        title: 'Talk to your group organiser',
        who: 'Group trade union organiser',
        body: 'The organiser is elected by open vote at the group’s general meeting for two years. Your first request goes to them.',
      },
      {
        title: 'The issue goes to the committee',
        who: 'Faculty and Academy committee',
        body: 'Scholarship, accommodation, medical check-up and study-discipline issues are discussed in the committee, with the dean’s office where needed.',
      },
      {
        title: 'Get legal assistance',
        who: 'Labour and Social Protection Commission',
        body: 'The commission advises members and helps them prepare applications and other legal documents.',
      },
    ],
    body: `## What it does

- **Scholarships** — monitoring timely and correct payment of monthly scholarships; rewarding top students.
- **Accommodation** — places for students who need the residence hall, better living conditions.
- **Health** — liaison with the medical post, annual medical check-ups, discounted sanatorium vouchers for students in poor health.
- **Public oversight** — the services students use: library, canteen, buffet, medical post, residence hall, sports facilities and computer rooms.
- **Leisure** — trips to museums and historic sites, theatre, quiz competitions, festivals and sports days, holiday events.

## Structure

A trade union group brings together at least 7 members studying in the same group; groups are represented on the faculty and Academy committees. The committee sets up commissions in line with the union’s charter:

- **Organisation and Membership Commission.**
- **Labour and Social Protection Commission** — legal advice, help with applications and documents, monitoring the collective agreement.
- **Culture and Sport Commission** — holidays, trips, theatre, clubs, quiz competitions, festivals and sports days.
- **Health and Safety Commission** — oversight of safety rules and sanitary conditions.

The committee also has departments for projects, sport (the Sports Society, which runs competitions within the Academy) and research (academic events and knowledge contests).

## Legal basis

Group organisations operate under the Regulations on Group Trade Union Organisations in Higher and Secondary Specialised Education Institutions, approved by the plenary session of the Republican Committee on 18 June 2004. The committee’s main task is to protect members’ social and economic rights and legitimate interests.`,
    faq: [
      {
        question: 'My scholarship is late. Who should I contact?',
        answer: 'Your dean’s office and your group trade union organiser. The union monitors timely and correct payment of scholarships.',
      },
      {
        question: 'Can the trade union help with accommodation?',
        answer:
          'Yes. Together with the Academy’s facilities services, the committee follows up on residence-hall places for students who need them and on living conditions.',
      },
      {
        question: 'How do I get a sanatorium voucher?',
        answer:
          'For students in poor health the union seeks discounted sanatorium and spa vouchers. Contact your group organiser.',
      },
    ],
    sideLinks: [L_EN.hub, L_EN.social, L_EN.dorm, L_EN.tgt],
    contact: CONTACT_EN,
  },
  ru: {
    title: 'Студенческий профсоюзный комитет',
    lead:
      'Профсоюз защищает социальные и экономические права студентов: своевременная и правильная выплата стипендий, общежитие и быт, ' +
      'здоровье и отдых, спорт и культурные мероприятия.',
    seoDescription:
      'Студенческий профсоюзный комитет АГМА: социальная защита студентов, стипендии, общежитие, здоровье, комиссии, профорг группы и как обратиться.',
    stepsTitle: 'Как обратиться в профсоюз',
    facts: [
      { label: 'Профгруппа', value: 'Не менее 7 членов', icon: 'qrup' },
      { label: 'Профорг группы', value: 'Избирается на 2 года', icon: 'tarix' },
      { label: 'Комиссии', value: '4', icon: 'sened' },
    ],
    steps: [
      {
        title: 'Обратитесь к профоргу группы',
        who: 'Профорг группы',
        body: 'Профорг избирается открытым голосованием на общем собрании группы на два года. Первое обращение — к нему.',
      },
      {
        title: 'Вопрос выносится на комитет',
        who: 'Комитет факультета и Академии',
        body: 'Вопросы стипендии, общежития, медосмотра и учебной дисциплины обсуждаются в комитете, при необходимости вместе с деканатом.',
      },
      {
        title: 'Получите юридическую помощь',
        who: 'Комиссия по труду и социальной защите',
        body: 'Комиссия консультирует членов профсоюза и помогает подготовить заявления и другие юридические документы.',
      },
    ],
    body: `## Чем занимается

- **Стипендия** — контроль своевременной и правильной выплаты ежемесячных стипендий, поощрение отличившихся.
- **Проживание** — места в общежитии для нуждающихся, улучшение бытовых условий.
- **Здоровье** — связь с медпунктом, ежегодный медосмотр, льготные путёвки в санатории для студентов со слабым здоровьем.
- **Общественный контроль** — работа объектов для студентов: библиотека, столовая, буфет, медпункт, общежитие, спортивные сооружения, компьютерные залы.
- **Досуг** — поездки в музеи и по историческим местам, театр, интеллектуальные игры, фестивали и спартакиады, праздничные мероприятия.

## Структура

Профгруппа объединяет не менее 7 членов, обучающихся в одной группе; группы представлены в комитетах факультета и Академии. Комитет создаёт комиссии в соответствии с уставом:

- **Организационно-массовая комиссия.**
- **Комиссия по труду и социальной защите** — юридические консультации, помощь в подготовке заявлений и документов, контроль исполнения коллективного договора.
- **Культурно-массовая и спортивная комиссия** — праздники, поездки, театр, кружки, интеллектуальные игры, фестивали и спартакиады.
- **Комиссия по охране труда** — контроль правил безопасности и санитарно-гигиенических условий.

При комитете работают отделы проектной работы, спорта (Спортивное общество — соревнования внутри Академии) и научной работы (научные мероприятия, конкурсы знаний).

## Правовая основа

Работа профгрупп регулируется Положением о групповых профсоюзных организациях высших и средних специальных учебных заведений (утверждено пленумом Республиканского комитета 18 июня 2004 года). Главная задача комитета — защита социальных и экономических прав и законных интересов членов профсоюза.`,
    faq: [
      {
        question: 'Задерживается стипендия. Куда обратиться?',
        answer: 'В деканат и к профоргу группы. Профсоюз контролирует своевременную и правильную выплату стипендий.',
      },
      {
        question: 'Может ли профсоюз помочь с общежитием?',
        answer:
          'Да. Комитет вместе с хозяйственными службами Академии следит за обеспечением местами нуждающихся студентов и бытовыми условиями.',
      },
      {
        question: 'Как получить путёвку в санаторий?',
        answer: 'Для студентов со слабым здоровьем профсоюз добивается выделения льготных санаторно-курортных путёвок. Обратитесь к профоргу группы.',
      },
    ],
    sideLinks: [L_RU.hub, L_RU.social, L_RU.dorm, L_RU.tgt],
    contact: CONTACT_RU,
  },
};

// ── 4. Tələbə Elmi Cəmiyyəti ─────────────────────────────────────────────────
const TEC_PAGE: TelebePageSeed = {
  slug: 'telebe-elmi-cemiyyeti',
  dataBlock: 'yox',
  az: {
    title: 'Tələbə Elmi Cəmiyyəti',
    lead:
      '2002-ci ildən fəaliyyət göstərən Tələbə Elmi Cəmiyyəti (TEC) tələbələri elmi işə cəlb edir: seminarlar, olimpiadalar, debatlar, müsabiqələr ' +
      'və hər yaz keçirilən tələbə konfransı.',
    seoDescription:
      'ADDA Tələbə Elmi Cəmiyyəti (TEC): elmi seminarlar, tələbə konfransı, olimpiada, ingilis dilində təqdimat müsabiqəsi, debatlar və necə qoşulmaq olar.',
    stepsTitle: 'Tədqiqata ilk addımlar',
    facts: [
      { label: 'Yaradılıb', value: '2002', icon: 'tarix' },
      { label: 'Tələbə konfransı', value: 'Hər yaz', icon: 'konfrans' },
      { label: 'Olimpiada', value: 'Riyaziyyat, fizika, informatika', icon: 'imtahan' },
      { label: 'Elmi Şurada', value: 'TEC sədri Şuranın üzvüdür', icon: 'qrup' },
    ],
    steps: [
      {
        title: 'Elmi rəhbər seçin',
        who: 'Kafedra',
        body: 'Maraqlandığınız mövzu üzrə kafedranızın müəllimi ilə danışın. Kafedralarda TEC ilə əlaqələndirilmiş tələbə elmi dərnəkləri fəaliyyət göstərir.',
      },
      {
        title: 'Seminarlara qatılın',
        who: 'TEC',
        body: 'Elmi tədqiqat metodları, məqalənin strukturu və akademik dürüstlük üzrə seminarlar.',
        linkLabel: 'Seminar haqqında',
        linkUrl: NEWS.tecSeminar,
      },
      {
        title: 'Məruzə hazırlayın',
        period: 'Hər yaz',
        who: 'Tələbə və gənc tədqiqatçıların konfransı',
        body: 'Məruzələr «Tezislər toplusu»nda dərc olunur; bölmələr üzrə ilk üç yer diplomla təltif edilir.',
        linkLabel: 'Son konfrans',
        linkUrl: NEWS.studentConf,
      },
      {
        title: 'Yarışlarda iştirak edin',
        who: 'TEC və kafedralar',
        body: 'I–II kurslar üçün riyaziyyat, fizika və informatika olimpiadası, ingilis dilində təqdimat müsabiqəsi, debatlar.',
      },
    ],
    body: `## Fəaliyyət istiqamətləri

- tələbələrin elmi işə cəlb olunması, elmi yaradıcılığa həvəsləndirilməsi, fikrin sərbəst və aydın ifadəsi;
- hər il tələbə elmi konfransları və tezislər toplusu;
- olimpiadalar, müsabiqələr və debatlar;
- elmi tədqiqat metodları və akademik yazı üzrə seminarlar;
- digər universitetlərin tələbə elmi cəmiyyətləri ilə əməkdaşlıq — məsələn, Azərbaycan İdman Akademiyası ilə ([xəbər](${NEWS.tecAsa})).

## Olimpiada

Hər il I və II kurs tələbələri arasında ümumpeşə hazırlığı fənləri — riyaziyyat, fizika və informatika üzrə olimpiada keçirilir. Hər fənn üzrə yarış ayrıca, yazılı keçirilir; yoxlamadan sonra müsabiqə komissiyası qalibləri elan edir, yüksək nəticə göstərənlər I–III dərəcəli diplomlarla təltif olunur.

## «Dil — karyeraya gedən yol»

Akademiyanın ənənəvi ümumrespublika ali məktəblərarası tələbə müsabiqəsi. İştirakçı istənilən mövzuda 4 dəqiqəyədək ingilis dilində təqdimat edir və münsiflər heyətinin suallarını cavablandırır. Mövzunun aktuallığı, təqdimat və ingilis dili bacarıqları qiymətləndirilir; qaliblər I–III dərəcəli diplomlarla, digər iştirakçılar sertifikatla təltif olunur.

## Son tədbirlər

- «Dənizçilikdə süni intellektin hüquqi aspektləri» mövzusunda debat ([xəbər](${NEWS.tecAi})).
- «Gəncliyin Tədqiqatı» tədbiri — digər universitetlərin gəncləri ilə ([xəbər](${NEWS.tecYouth})).
- Elmi tədqiqat metodlarına dair seminar ([xəbər](${NEWS.tecSeminar})).
- Tələbə və gənc tədqiqatçıların elmi-texniki konfransı ([xəbər](${NEWS.studentConf})).

## Elmi Şurada təmsil

Tələbə Elmi Cəmiyyətinin sədri Akademiyanın [Elmi Şurasının](${COUNCIL}) üzvüdür. Gənc alim və doktorantlar üçün imkanlar: [Gənc alimlər və tədqiqatçılar](/sehife/genc-alimler-surasi).`,
    faq: [
      {
        question: 'TEC-ə kim qoşula bilər?',
        answer: 'Akademiyanın tələbələri. Kafedranızda elmi rəhbər seçin və tələbə elmi dərnəyinə qoşulun.',
      },
      {
        question: 'Məruzəm harada dərc oluna bilər?',
        answer:
          'Tələbə konfransının tezislər toplusunda. Hazır məqaləni «Elmi Əsərlər» jurnalına da təqdim etmək olar — tələblər jurnal səhifəsindədir.',
      },
      {
        question: 'Olimpiadada kimlər iştirak edir?',
        answer: 'I və II kurs tələbələri — riyaziyyat, fizika və informatika üzrə, hər fənn ayrıca.',
      },
    ],
    sideLinks: [
      { label: 'Gənc alimlər və tədqiqatçılar', url: '/sehife/genc-alimler-surasi' },
      { label: 'Elmi konfranslar', url: '/sehife/elmi-konfranslar' },
      { label: '«Elmi Əsərlər» jurnalı', url: '/sehife/elmi-jurnal' },
      L_AZ.hub,
    ],
    contact: CONTACT_AZ,
  },
  en: {
    title: 'Student Research Society',
    lead:
      'Since 2002 the Student Research Society has involved students in research: seminars, olympiads, debates, competitions ' +
      'and the student conference held every spring.',
    seoDescription:
      'ADDA Student Research Society: research seminars, the student conference, olympiads, an English presentation contest, debates and how to join.',
    stepsTitle: 'First steps in research',
    facts: [
      { label: 'Founded', value: '2002', icon: 'tarix' },
      { label: 'Student conference', value: 'Every spring', icon: 'konfrans' },
      { label: 'Olympiad', value: 'Mathematics, physics, computer science', icon: 'imtahan' },
      { label: 'Academic Council', value: 'The Society’s chair is a member', icon: 'qrup' },
    ],
    steps: [
      {
        title: 'Find a supervisor',
        who: 'Department',
        body: 'Talk to a lecturer in your department about a topic that interests you. Student research groups linked to the Society work in the departments.',
      },
      {
        title: 'Attend the seminars',
        who: 'Student Research Society',
        body: 'Seminars on research methods, the structure of a paper and academic integrity.',
        linkLabel: 'About the seminar',
        linkUrl: AZ(NEWS.tecSeminar),
      },
      {
        title: 'Prepare a paper',
        period: 'Every spring',
        who: 'Conference of students and young researchers',
        body: 'Papers are published in the book of abstracts; the top three in each section receive diplomas.',
        linkLabel: 'The latest conference',
        linkUrl: AZ(NEWS.studentConf),
      },
      {
        title: 'Compete',
        who: 'The Society and departments',
        body: 'An olympiad in mathematics, physics and computer science for first- and second-year students, an English presentation contest and debates.',
      },
    ],
    body: `## What the Society does

- involves students in research and encourages them to think creatively and express their ideas clearly;
- annual student research conferences and books of abstracts;
- olympiads, competitions and debates;
- seminars on research methods and academic writing;
- cooperation with other universities’ student societies — for example the Azerbaijan Sport Academy ([news](${AZ(NEWS.tecAsa)})).

## Olympiad

Every year first- and second-year students compete in an olympiad in the general professional subjects — mathematics, physics and computer science. Each subject is a separate written round; after marking, the committee announces the winners, who receive first-, second- and third-degree diplomas.

## “Language — the Road to a Career”

The Academy’s traditional national inter-university student contest. Each participant gives a presentation of up to four minutes in English on a topic of their choice and answers the jury’s questions. The relevance of the topic, the delivery and English skills are assessed; winners receive first- to third-degree diplomas and other participants certificates.

## Recent events

- A debate on the legal aspects of artificial intelligence in shipping ([news](${AZ(NEWS.tecAi)})).
- The “Youth Research” event with young people from other universities ([news](${AZ(NEWS.tecYouth)})).
- A seminar on research methods ([news](${AZ(NEWS.tecSeminar)})).
- The research and technical conference of students and young researchers ([news](${AZ(NEWS.studentConf)})).

## A seat on the Academic Council

The chair of the Student Research Society is a member of the Academy’s [Academic Council](${COUNCIL}). Opportunities for young scientists and doctoral students: [Young scientists and researchers](/sehife/genc-alimler-surasi).`,
    faq: [
      {
        question: 'Who can join the Society?',
        answer: 'Students of the Academy. Find a supervisor in your department and join a student research group.',
      },
      {
        question: 'Where can my paper be published?',
        answer:
          'In the student conference’s book of abstracts. A finished article can also be submitted to the Academy’s “Proceedings” journal — the requirements are on the journal page.',
      },
      {
        question: 'Who takes part in the olympiad?',
        answer: 'First- and second-year students, in mathematics, physics and computer science, each as a separate round.',
      },
    ],
    sideLinks: [
      { label: 'Young scientists and researchers', url: '/sehife/genc-alimler-surasi' },
      { label: 'Scientific conferences', url: '/sehife/elmi-konfranslar' },
      { label: 'The “Proceedings” journal', url: '/sehife/elmi-jurnal' },
      L_EN.hub,
    ],
    contact: CONTACT_EN,
  },
  ru: {
    title: 'Студенческое научное общество',
    lead:
      'Студенческое научное общество (СНО) с 2002 года привлекает студентов к научной работе: семинары, олимпиады, дебаты, конкурсы ' +
      'и студенческая конференция, которая проходит каждую весну.',
    seoDescription:
      'Студенческое научное общество АГМА: научные семинары, студенческая конференция, олимпиада, конкурс презентаций на английском, дебаты и как вступить.',
    stepsTitle: 'Первые шаги в науке',
    facts: [
      { label: 'Создано', value: '2002', icon: 'tarix' },
      { label: 'Студенческая конференция', value: 'Каждую весну', icon: 'konfrans' },
      { label: 'Олимпиада', value: 'Математика, физика, информатика', icon: 'imtahan' },
      { label: 'Учёный совет', value: 'Председатель СНО — член совета', icon: 'qrup' },
    ],
    steps: [
      {
        title: 'Выберите научного руководителя',
        who: 'Кафедра',
        body: 'Поговорите с преподавателем своей кафедры об интересующей теме. На кафедрах работают студенческие научные кружки, связанные с СНО.',
      },
      {
        title: 'Посещайте семинары',
        who: 'СНО',
        body: 'Семинары по методам научного исследования, структуре статьи и академической честности.',
        linkLabel: 'О семинаре',
        linkUrl: AZ(NEWS.tecSeminar),
      },
      {
        title: 'Подготовьте доклад',
        period: 'Каждую весну',
        who: 'Конференция студентов и молодых исследователей',
        body: 'Доклады публикуются в сборнике тезисов; первые три места в каждой секции отмечаются дипломами.',
        linkLabel: 'Последняя конференция',
        linkUrl: AZ(NEWS.studentConf),
      },
      {
        title: 'Участвуйте в конкурсах',
        who: 'СНО и кафедры',
        body: 'Олимпиада по математике, физике и информатике для I–II курсов, конкурс презентаций на английском языке, дебаты.',
      },
    ],
    body: `## Направления работы

- привлечение студентов к научной работе, поощрение научного творчества, свободного и ясного изложения мыслей;
- ежегодные студенческие научные конференции и сборники тезисов;
- олимпиады, конкурсы и дебаты;
- семинары по методам исследования и академическому письму;
- сотрудничество со студенческими научными обществами других вузов — например, Азербайджанской академии спорта ([новость](${AZ(NEWS.tecAsa)})).

## Олимпиада

Ежегодно среди студентов I и II курсов проводится олимпиада по общепрофессиональным дисциплинам — математике, физике и информатике. По каждому предмету — отдельный письменный тур; после проверки комиссия объявляет победителей, которые награждаются дипломами I–III степени.

## «Язык — путь к карьере»

Традиционный республиканский межвузовский студенческий конкурс Академии. Участник делает презентацию на английском языке продолжительностью до четырёх минут на любую тему и отвечает на вопросы жюри. Оцениваются актуальность темы, подача и знание английского; победители получают дипломы I–III степени, остальные участники — сертификаты.

## Последние мероприятия

- Дебаты о правовых аспектах искусственного интеллекта в судоходстве ([новость](${AZ(NEWS.tecAi)})).
- Мероприятие «Исследование молодёжи» с молодёжью других вузов ([новость](${AZ(NEWS.tecYouth)})).
- Семинар по методам научного исследования ([новость](${AZ(NEWS.tecSeminar)})).
- Научно-техническая конференция студентов и молодых исследователей ([новость](${AZ(NEWS.studentConf)})).

## Представительство в Учёном совете

Председатель Студенческого научного общества — член [Учёного совета](${COUNCIL}) Академии. Возможности для молодых учёных и докторантов: [Молодые учёные и исследователи](/sehife/genc-alimler-surasi).`,
    faq: [
      {
        question: 'Кто может вступить в СНО?',
        answer: 'Студенты Академии. Выберите научного руководителя на своей кафедре и вступите в студенческий научный кружок.',
      },
      {
        question: 'Где можно опубликовать доклад?',
        answer:
          'В сборнике тезисов студенческой конференции. Готовую статью можно подать и в журнал «Научные труды» Академии — требования на странице журнала.',
      },
      {
        question: 'Кто участвует в олимпиаде?',
        answer: 'Студенты I и II курсов — по математике, физике и информатике, каждый предмет отдельным туром.',
      },
    ],
    sideLinks: [
      { label: 'Молодые учёные и исследователи', url: '/sehife/genc-alimler-surasi' },
      { label: 'Научные конференции', url: '/sehife/elmi-konfranslar' },
      { label: 'Журнал «Научные труды»', url: '/sehife/elmi-jurnal' },
      L_RU.hub,
    ],
    contact: CONTACT_RU,
  },
};

// ── 5. Təqaüd və sosial dəstək ───────────────────────────────────────────────
const SOCIAL_PAGE: TelebePageSeed = {
  slug: 'sosial-teminat-ve-maddi-yardim',
  dataBlock: 'yox',
  az: {
    title: 'Təqaüd və sosial dəstək',
    lead:
      'Akademiya tələbələri geyim forması, dərs vəsaitləri və gündə iki dəfə yeməklə ödənişsiz, yataqxana ilə güzəştli şərtlə təmin olunur. ' +
      'Təqaüd hər semestr imtahan sessiyasının nəticəsinə görə təyin edilir; təhsildə fərqlənənlərə ASCO əlavə təqaüd verir.',
    seoDescription:
      'ADDA-da təqaüd və sosial dəstək: təqaüd növləri və şərtləri, ASCO-nun əlavə təqaüdü, ödənişsiz forma, dərslik və yemək, yataqxana, həmkarlar ittifaqının köməyi.',
    stepsTitle: 'Təqaüd necə təyin olunur',
    facts: [
      { label: 'Forma və dərs vəsaiti', value: 'Ödənişsiz', icon: 'kitab' },
      { label: 'Yemək', value: 'Gündə 2 dəfə', icon: 'diger' },
      { label: 'Yataqxana', value: 'Güzəştli şərtlə', icon: 'bina' },
      { label: 'Təqaüd', value: 'Hər semestr', icon: 'haqq' },
    ],
    steps: [
      {
        title: 'Sessiyanı borcsuz başa vurun',
        period: 'Hər semestr',
        who: 'Tələbə',
        body: 'Təqaüd imtahan sessiyasının nəticələrinə görə təyin olunur. Akademik borcu olan tələbə təqaüd siyahısına düşmür.',
      },
      {
        title: 'Siyahılar müəyyən olunur',
        who: 'Fakültə',
        body: 'Sessiyanın nəticələrinə görə hər fakültə və pillə üzrə əlaçı, həvəsləndirici və adi təqaüd alanlar müəyyən olunur.',
      },
      {
        title: 'Rektorun əmri',
        who: 'Rektor',
        body: 'Təqaüd növbəti semestr üçün rektorun əmri ilə təyin edilir.',
        linkLabel: 'Nümunə: 2020-ci ilin əmri',
        linkUrl: NEWS.scholarships2020,
      },
      {
        title: 'ASCO-nun əlavə təqaüdü',
        who: 'ASCO',
        body: 'Semestrdə fərqlənən əlaçı tələbələrə ASCO sədrinin əmri ilə xüsusi təqaüd verilir.',
      },
    ],
    body: `## Ödənişsiz təminat

- yay və qış geyim forması;
- dərs vəsaitləri;
- gündə iki dəfə yemək;
- [yataqxana](${DORM}) — güzəştli şərtlə (Üzeyir Hacıbəyli küçəsi 114, 311 yer);
- [informasiya resurs mərkəzi](${LIBRARY}) — Azərbaycan, rus və ingilis dillərində dənizçilik ədəbiyyatı;
- idman zalları və üzgüçülük hovuzu — [İdman](${SPORT}).

## Təqaüd növləri

Təqaüd hər semestr imtahan sessiyasının nəticəsinə görə təyin olunur; bakalavr və magistrantlar üçün qayda eynidir.

| Təqaüd | Şərt |
|---|---|
| Əlaçı | sessiya 91–100 bal aralığında başa vurulub |
| Həvəsləndirici | sessiya üzrə ümumi orta bal 71–100, ən azı bir fənn üzrə 91–100 |
| Adi | sessiya akademik borcsuz başa vurulub |

Valideynlərini itirmiş və valideyn himayəsindən məhrum olmuş tələbələr «Valideynlərini itirmiş və valideyn himayəsindən məhrum olmuş uşaqların sosial müdafiəsi haqqında» Qanuna əsasən təqaüdün iki mislini alır. Təqaüdün məbləğini Nazirlər Kabineti müəyyən edir; cari qaydanı dekanlığınızdan öyrənin ([2020-ci ilin nümunəsi](${NEWS.scholarships2020})).

## ASCO-nun dəstəyi

- ASCO təhsildə fərqlənən tələbələri əlavə təqaüdlə həvəsləndirir: məsələn, 2020-ci ilin yaz semestrində 71 əlaçı bakalavr və 4 magistrant ASCO sədrinin əmri ilə xüsusi təqaüdə layiq görülüb ([xəbər](${NEWS.scholarships2020})).
- Yüksək balla qəbul olunanlara da əlavə təqaüd verilib — 2019-cu ildə 42 tələbəyə ([xəbər](${NEWS.asco2019})). Şərtləri hər il ASCO müəyyən edir.
- ASCO-nun Gəmiçilikdə Təqaüd Proqramı məzunlara xaricdə magistr təhsili imkanı verir — [İxtisasartırma və xaricdə təhsil](/sehife/xaricde-tehsil-ve-ixtisasartirma).

## Sosial müdafiə və kömək

- [Elmi Şura](${COUNCIL}) büdcədənkənar vəsait hesabına tələbə təqaüdləri təsis edə və təhsil alanların sosial müdafiəsi üzrə qərarlar qəbul edə bilər.
- [Tələbə Həmkarlar İttifaqı Komitəsi](${THIK}) təqaüdlərin vaxtında verilməsinə nəzarət edir, yataqxana və güzəştli sanatoriya yollayışları məsələlərində kömək edir.
- [Tələbə Gənclər Təşkilatı](${TGT}) tələbələrin sosial problemlərini öyrənir və rəhbərlik qarşısında qaldırır.

Yazılı müraciət üçün [onlayn forma](${ASK}) var — cavab e-poçtunuza gəlir.`,
    faq: [
      {
        question: 'Təqaüd nə vaxt təyin olunur?',
        answer: 'Hər semestrin imtahan sessiyasından sonra, növbəti semestr üçün, rektorun əmri ilə.',
      },
      {
        question: 'Akademik borcum var. Təqaüd alacağammı?',
        answer: 'Təqaüd üçün sessiya akademik borcsuz başa vurulmalıdır. Borcun ləğvi qaydası və müddəti barədə dekanlığa müraciət edin.',
      },
      {
        question: 'Forma və dərsliklər üçün ödəniş lazımdırmı?',
        answer: 'Xeyr. Yay və qış geyim forması və dərs vəsaitləri ödənişsizdir; gündə iki dəfə yemək verilir.',
      },
      {
        question: 'Valideynlərini itirmiş tələbələrə hansı dəstək var?',
        answer:
          'Qanuna əsasən təqaüdün iki misli ödənilir. Digər sosial məsələlər üzrə dekanlığa və ya Həmkarlar İttifaqı Komitəsinə müraciət edin.',
      },
    ],
    sideLinks: [L_AZ.dorm, L_AZ.thik, { label: 'İxtisasartırma və xaricdə təhsil', url: '/sehife/xaricde-tehsil-ve-ixtisasartirma' }, L_AZ.hub],
    contact: CONTACT_AZ,
  },
  en: {
    title: 'Scholarships and Student Support',
    lead:
      'Students receive uniforms, textbooks and two meals a day free of charge, and a residence-hall place on preferential terms. ' +
      'Scholarships are awarded every semester on the basis of exam-session results; ASCO pays an additional scholarship to top students.',
    seoDescription:
      'Scholarships and support at ADDA: scholarship types and criteria, ASCO’s additional scholarship, free uniform, textbooks and meals, residence hall, trade union help.',
    stepsTitle: 'How scholarships are awarded',
    facts: [
      { label: 'Uniform and textbooks', value: 'Free of charge', icon: 'kitab' },
      { label: 'Meals', value: 'Twice a day', icon: 'diger' },
      { label: 'Residence hall', value: 'Preferential terms', icon: 'bina' },
      { label: 'Scholarship', value: 'Every semester', icon: 'haqq' },
    ],
    steps: [
      {
        title: 'Pass the session without academic debts',
        period: 'Every semester',
        who: 'Student',
        body: 'Scholarships depend on exam-session results. A student with academic debts is not included in the scholarship list.',
      },
      {
        title: 'The lists are drawn up',
        who: 'Faculty',
        body: 'Based on the session results, recipients of excellence, incentive and standard scholarships are identified for each faculty and level.',
      },
      {
        title: 'The Rector’s order',
        who: 'Rector',
        body: 'Scholarships for the next semester are awarded by the Rector’s order.',
        linkLabel: 'Example: the 2020 order',
        linkUrl: AZ(NEWS.scholarships2020),
      },
      {
        title: 'ASCO’s additional scholarship',
        who: 'ASCO',
        body: 'Top students of the semester receive a special scholarship by order of the ASCO Chairman.',
      },
    ],
    body: `## Free provision

- summer and winter uniforms;
- textbooks;
- two meals a day;
- the [residence hall](${DORM}) on preferential terms (114 Uzeyir Hajibeyli Street, 311 places);
- the [Information Resource Centre](${LIBRARY}) — maritime literature in Azerbaijani, Russian and English;
- gyms and a swimming pool — [Sport](${SPORT}).

## Types of scholarship

Scholarships are awarded every semester according to exam-session results; the same rules apply to bachelor’s and master’s students.

| Scholarship | Criterion |
|---|---|
| Excellence | session completed with 91–100 points |
| Incentive | session average of 71–100 with at least one subject at 91–100 |
| Standard | session completed without academic debts |

Under the Law on Social Protection of Orphans and Children Deprived of Parental Care, orphans and students deprived of parental care receive double the scholarship. The amounts are set by the Cabinet of Ministers; ask your dean’s office about the current rules ([the 2020 example](${AZ(NEWS.scholarships2020)})).

## Support from ASCO

- ASCO rewards top students with an additional scholarship: in the spring semester of 2020, for example, 71 bachelor’s and 4 master’s students received a special scholarship by order of the ASCO Chairman ([news](${AZ(NEWS.scholarships2020)})).
- Additional scholarships have also been paid to students admitted with high scores — to 42 students in 2019 ([news](${AZ(NEWS.asco2019)})). ASCO sets the conditions each year.
- ASCO’s Shipping Scholarship Programme gives graduates the chance to take a master’s degree abroad — [Professional development and study abroad](/sehife/xaricde-tehsil-ve-ixtisasartirma).

## Social protection and help

- The [Academic Council](${COUNCIL}) may establish student scholarships from extra-budgetary funds and take decisions on students’ social protection.
- The [Student Trade Union Committee](${THIK}) monitors timely payment of scholarships and helps with accommodation and discounted sanatorium vouchers.
- The [Student Youth Organisation](${TGT}) looks into students’ social problems and raises them with the management.

For written requests there is an [online form](${ASK}) — the reply comes to your e-mail.`,
    faq: [
      {
        question: 'When are scholarships awarded?',
        answer: 'After each semester’s exam session, for the following semester, by the Rector’s order.',
      },
      {
        question: 'I have an academic debt. Will I get a scholarship?',
        answer: 'The session must be completed without academic debts. Ask your dean’s office how and by when a debt can be cleared.',
      },
      {
        question: 'Do I pay for the uniform and textbooks?',
        answer: 'No. Summer and winter uniforms and textbooks are free of charge, and two meals a day are provided.',
      },
      {
        question: 'What support is there for orphans?',
        answer: 'By law they receive double the scholarship. For other social matters, contact your dean’s office or the Student Trade Union Committee.',
      },
    ],
    sideLinks: [L_EN.dorm, L_EN.thik, { label: 'Professional development and study abroad', url: '/sehife/xaricde-tehsil-ve-ixtisasartirma' }, L_EN.hub],
    contact: CONTACT_EN,
  },
  ru: {
    title: 'Стипендии и социальная поддержка',
    lead:
      'Студенты бесплатно обеспечиваются формой, учебными пособиями и двухразовым питанием, общежитием — на льготных условиях. ' +
      'Стипендия назначается каждый семестр по итогам экзаменационной сессии; отличившимся ASCO выплачивает дополнительную стипендию.',
    seoDescription:
      'Стипендии и поддержка в АГМА: виды и условия стипендий, дополнительная стипендия ASCO, бесплатные форма, учебники и питание, общежитие, помощь профсоюза.',
    stepsTitle: 'Как назначается стипендия',
    facts: [
      { label: 'Форма и учебные пособия', value: 'Бесплатно', icon: 'kitab' },
      { label: 'Питание', value: 'Два раза в день', icon: 'diger' },
      { label: 'Общежитие', value: 'На льготных условиях', icon: 'bina' },
      { label: 'Стипендия', value: 'Каждый семестр', icon: 'haqq' },
    ],
    steps: [
      {
        title: 'Сдайте сессию без задолженностей',
        period: 'Каждый семестр',
        who: 'Студент',
        body: 'Стипендия назначается по итогам экзаменационной сессии. Студент с академической задолженностью в стипендиальный список не попадает.',
      },
      {
        title: 'Составляются списки',
        who: 'Факультет',
        body: 'По итогам сессии по каждому факультету и уровню определяются получатели отличной, поощрительной и обычной стипендии.',
      },
      {
        title: 'Приказ ректора',
        who: 'Ректор',
        body: 'Стипендия на следующий семестр назначается приказом ректора.',
        linkLabel: 'Пример: приказ 2020 года',
        linkUrl: AZ(NEWS.scholarships2020),
      },
      {
        title: 'Дополнительная стипендия ASCO',
        who: 'ASCO',
        body: 'Отличникам семестра по приказу председателя ASCO выплачивается специальная стипендия.',
      },
    ],
    body: `## Бесплатное обеспечение

- летняя и зимняя форма;
- учебные пособия;
- двухразовое питание;
- [общежитие](${DORM}) — на льготных условиях (ул. Узеира Гаджибейли, 114, 311 мест);
- [Информационно-ресурсный центр](${LIBRARY}) — морская литература на азербайджанском, русском и английском языках;
- спортивные залы и плавательный бассейн — [Спорт](${SPORT}).

## Виды стипендии

Стипендия назначается каждый семестр по итогам экзаменационной сессии; для бакалавров и магистрантов правила одинаковы.

| Стипендия | Условие |
|---|---|
| Отличная | сессия сдана в диапазоне 91–100 баллов |
| Поощрительная | средний балл за сессию 71–100, хотя бы по одному предмету 91–100 |
| Обычная | сессия сдана без академической задолженности |

Студенты-сироты и лишённые родительской опеки по Закону «О социальной защите детей, потерявших родителей и лишённых родительской опеки» получают стипендию в двойном размере. Размер стипендии устанавливает Кабинет министров; действующие правила уточняйте в деканате ([пример 2020 года](${AZ(NEWS.scholarships2020)})).

## Поддержка ASCO

- ASCO поощряет отличившихся студентов дополнительной стипендией: например, в весеннем семестре 2020 года специальную стипендию по приказу председателя ASCO получили 71 бакалавр и 4 магистранта ([новость](${AZ(NEWS.scholarships2020)})).
- Дополнительная стипендия выплачивалась и поступившим с высокими баллами — в 2019 году 42 студентам ([новость](${AZ(NEWS.asco2019)})). Условия ежегодно определяет ASCO.
- Стипендиальная программа ASCO в области судоходства даёт выпускникам возможность получить магистерскую степень за рубежом — [Повышение квалификации и обучение за рубежом](/sehife/xaricde-tehsil-ve-ixtisasartirma).

## Социальная защита и помощь

- [Учёный совет](${COUNCIL}) может учреждать студенческие стипендии за счёт внебюджетных средств и принимать решения о социальной защите обучающихся.
- [Студенческий профсоюзный комитет](${THIK}) контролирует своевременную выплату стипендий, помогает с общежитием и льготными санаторными путёвками.
- [Организация студенческой молодёжи](${TGT}) изучает социальные проблемы студентов и поднимает их перед руководством.

Для письменных обращений есть [онлайн-форма](${ASK}) — ответ придёт на e-mail.`,
    faq: [
      {
        question: 'Когда назначается стипендия?',
        answer: 'После экзаменационной сессии каждого семестра, на следующий семестр, приказом ректора.',
      },
      {
        question: 'У меня академическая задолженность. Будет ли стипендия?',
        answer: 'Сессия должна быть сдана без задолженностей. Порядок и сроки ликвидации задолженности уточните в деканате.',
      },
      {
        question: 'Нужно ли платить за форму и учебники?',
        answer: 'Нет. Летняя и зимняя форма и учебные пособия бесплатны, предоставляется двухразовое питание.',
      },
      {
        question: 'Какая поддержка есть для сирот?',
        answer: 'По закону стипендия выплачивается в двойном размере. По другим социальным вопросам обращайтесь в деканат или в профсоюзный комитет.',
      },
    ],
    sideLinks: [L_RU.dorm, L_RU.thik, { label: 'Повышение квалификации и обучение за рубежом', url: '/sehife/xaricde-tehsil-ve-ixtisasartirma' }, L_RU.hub],
    contact: CONTACT_RU,
  },
};

// ── 6. İdman ─────────────────────────────────────────────────────────────────
const SPORT_PAGE: TelebePageSeed = {
  slug: 'idman',
  dataBlock: 'idman',
  az: {
    title: 'İdman',
    lead:
      'Dənizçi üçün fiziki hazırlıq peşənin bir hissəsidir. Akademiyada üzgüçülük hovuzu və idman zalları, «Bədən tərbiyəsi və idman» kafedrasının seksiyaları var; ' +
      'fakültələrarası yarışlar hər il keçirilir.',
    seoDescription:
      'ADDA-da idman: «Bədən tərbiyəsi və idman» kafedrası, üzgüçülük, yelkən, futbol, voleybol və digər seksiyalar, yarışlar və nəticələr, necə qoşulmaq olar.',
    stepsTitle: 'Seksiyaya necə qoşulmaq olar',
    facts: [
      { label: 'Kafedra', value: '2004-cü ildən', icon: 'tarix' },
      { label: 'İdman bazası', value: 'Hovuz və idman zalları', icon: 'bina' },
      { label: 'Fakültələrarası yarışlar', value: 'Hər il', icon: 'idman' },
    ],
    steps: [
      {
        title: 'İdman növünü seçin',
        who: '«Bədən tərbiyəsi və idman» kafedrası',
        body: 'Üzgüçülük, yelkən idmanı, voleybol, futbol, basketbol, güləş və digər növlər üzrə fakültətiv seksiyalar.',
      },
      {
        title: 'Kafedraya müraciət edin',
        who: 'Kafedra, TGT',
        body: 'Seksiyaya yazılmaq üçün kafedranın müəllimlərinə müraciət edin. Yığma komandalara qeydiyyat elanla aparılır; tələbə yarışlarının təşkilində TGT və Həmkarlar İttifaqı Komitəsinin İdman Cəmiyyəti iştirak edir.',
      },
      {
        title: 'Yarışlara qatılın',
        period: 'Hər il',
        who: 'Akademiya və tərəfdaşlar',
        body: 'Fakültələrarası yarışlar, Ümummilli Lider Heydər Əliyevin anadan olma gününə həsr olunmuş ali məktəblərarası yarışlar, bayramlarda dənizdə yelkənli qayıq yarışları.',
      },
    ],
    body: `## Kafedra və seksiyalar

«Bədən tərbiyəsi və idman» kafedrası 19 may 2004-cü ildən müstəqil fəaliyyət göstərir; 1996–2004-cü illərdə fənn «Humanitar fənlər» kafedrasının tərkibində tədris olunub. Kafedrada üzgüçülük və dəniz işi fənləri ilə yanaşı fakültətiv seksiyalar var: üzgüçülük, yelkən idmanı, voleybol, futbol, basketbol, güləş və digər növlər. Tələbələr respublika və Akademiya yarışlarında futbol, voleybol, güləş və şahmat üzrə də çıxış edir.

## Yarışlar və nəticələr

| İl | Yarış | Nəticə |
|---|---|---|
| 2026 | Tələbələr arasında futbol çempionatı, final — AzFar Koroğlu arenası, 16 may | final 8:4 hesabı ilə başa çatıb ([xəbər](${NEWS.football2026})) |
| 2026 | ADDA-nın yubileylərinə həsr olunmuş üzgüçülük yarışı — Azərbaycan İdman Akademiyasının hovuzu | texniki yönümlü ali məktəblərin tələbələri ([xəbər](${NEWS.swim2026})) |
| 2024 | Heydər Əliyevin 101 illiyinə həsr olunmuş üzgüçülük yarışı | ADDA komandası — III yer ([xəbər](${NEWS.swim2024})) |
| 2023 | «Baku Sailing Regatta-2023» yelkənli qayıq yarışı | tələbəmiz — II yer ([xəbər](${NEWS.regatta2023})) |
| 2018 | ASCO-nun I Spartakiadası | ADDA komandası şahmatda — I yer ([xəbər](${NEWS.spartakiad2018})) |

## Yelkən və dəniz idmanı

Respublika bayramlarında açıq dənizdə yelkənli qayıq yarışları keçirilir. Tələbələr yelkənli qayıq və digər dəniz idman növlərində yarışır — dənizçi üçün vacib olan fiziki hazırlığı da beləcə qoruyurlar.

## Kim təşkil edir

- **Kafedra** — seksiyalar və fakültələrarası yarışlar.
- **[Tələbə Gənclər Təşkilatı](${TGT})** — tələbə yarışları, yığma komandalar.
- **[Həmkarlar İttifaqı Komitəsi](${THIK})** — İdman Cəmiyyəti, spartakiadalar.
- **ASCO** — dənizçilərin spartakiadaları, Akademiyanın komandası da qatılır.`,
    faq: [
      {
        question: 'Hansı idman növləri var?',
        answer: 'Üzgüçülük, yelkən idmanı, voleybol, futbol, basketbol, güləş seksiyaları; yarışlarda şahmat da var.',
      },
      {
        question: 'Yığma komandaya necə düşmək olar?',
        answer: 'Qeydiyyat elanla aparılır — Akademiyanın elanlarını izləyin, kafedraya və ya Tələbə Gənclər Təşkilatına müraciət edin.',
      },
      {
        question: 'Üzgüçülük niyə vacibdir?',
        answer: 'Üzgüçülük dənizçinin peşə hazırlığının bir hissəsidir və kafedrada fənn kimi tədris olunur.',
      },
    ],
    sideLinks: [L_AZ.tgt, L_AZ.thik, L_AZ.events, L_AZ.hub],
    contact: CONTACT_AZ,
  },
  en: {
    title: 'Sport',
    lead:
      'Physical fitness is part of a seafarer’s profession. The Academy has a swimming pool and gyms and the sports sections of the Physical Education and Sport Department; ' +
      'inter-faculty competitions are held every year.',
    seoDescription:
      'Sport at ADDA: the Physical Education and Sport Department, swimming, sailing, football, volleyball and other sections, competitions, results and how to join.',
    stepsTitle: 'How to join a section',
    facts: [
      { label: 'Department', value: 'Since 2004', icon: 'tarix' },
      { label: 'Facilities', value: 'Swimming pool and gyms', icon: 'bina' },
      { label: 'Inter-faculty competitions', value: 'Every year', icon: 'idman' },
    ],
    steps: [
      {
        title: 'Choose a sport',
        who: 'Physical Education and Sport Department',
        body: 'Optional sections in swimming, sailing, volleyball, football, basketball, wrestling and other sports.',
      },
      {
        title: 'Contact the department',
        who: 'Department, Student Youth Organisation',
        body: 'To join a section, speak to the department’s lecturers. Academy teams recruit through announcements; the Student Youth Organisation and the trade union’s Sports Society help to organise student competitions.',
      },
      {
        title: 'Compete',
        period: 'Every year',
        who: 'The Academy and partners',
        body: 'Inter-faculty competitions, inter-university events dedicated to the birthday of national leader Heydar Aliyev, and sailing races at sea on national holidays.',
      },
    ],
    body: `## Department and sections

The Physical Education and Sport Department has been independent since 19 May 2004; from 1996 to 2004 the subject was taught within the Humanities Department. Alongside swimming and seamanship classes, the department runs optional sections: swimming, sailing, volleyball, football, basketball, wrestling and other sports. Students also compete in football, volleyball, wrestling and chess at national and Academy level.

## Competitions and results

| Year | Competition | Result |
|---|---|---|
| 2026 | Student football championship, final — AzFar Koroglu Arena, 16 May | the final ended 8:4 ([news](${AZ(NEWS.football2026)})) |
| 2026 | Swimming competition marking ADDA’s anniversaries — Azerbaijan Sport Academy pool | students of technical universities ([news](${AZ(NEWS.swim2026)})) |
| 2024 | Swimming competition marking Heydar Aliyev’s 101st anniversary | ADDA team — 3rd place ([news](${AZ(NEWS.swim2024)})) |
| 2023 | Baku Sailing Regatta 2023 | our student — 2nd place ([news](${AZ(NEWS.regatta2023)})) |
| 2018 | ASCO’s first Spartakiad | ADDA team — 1st place in chess ([news](${AZ(NEWS.spartakiad2018)})) |

## Sailing and water sports

Sailing races are held at sea on national holidays. Students race sailing boats and take part in other water sports — keeping up the physical fitness a seafarer needs.

## Who organises

- **The department** — sections and inter-faculty competitions.
- **[Student Youth Organisation](${TGT})** — student competitions and Academy teams.
- **[Trade Union Committee](${THIK})** — the Sports Society and sports days.
- **ASCO** — seafarers’ Spartakiads, in which the Academy team also competes.`,
    faq: [
      {
        question: 'Which sports are available?',
        answer: 'Swimming, sailing, volleyball, football, basketball and wrestling sections; chess is also part of the competitions.',
      },
      {
        question: 'How do I get into an Academy team?',
        answer: 'Teams recruit through announcements — follow the Academy’s announcements and contact the department or the Student Youth Organisation.',
      },
      {
        question: 'Why is swimming important?',
        answer: 'Swimming is part of a seafarer’s professional training and is taught as a subject by the department.',
      },
    ],
    sideLinks: [L_EN.tgt, L_EN.thik, L_EN.events, L_EN.hub],
    contact: CONTACT_EN,
  },
  ru: {
    title: 'Спорт',
    lead:
      'Физическая подготовка — часть профессии моряка. В Академии есть плавательный бассейн и спортивные залы, секции кафедры физического воспитания и спорта; ' +
      'межфакультетские соревнования проходят ежегодно.',
    seoDescription:
      'Спорт в АГМА: кафедра физического воспитания и спорта, плавание, парусный спорт, футбол, волейбол и другие секции, соревнования и результаты, как записаться.',
    stepsTitle: 'Как записаться в секцию',
    facts: [
      { label: 'Кафедра', value: 'С 2004 года', icon: 'tarix' },
      { label: 'Спортивная база', value: 'Бассейн и спортзалы', icon: 'bina' },
      { label: 'Межфакультетские соревнования', value: 'Ежегодно', icon: 'idman' },
    ],
    steps: [
      {
        title: 'Выберите вид спорта',
        who: 'Кафедра физического воспитания и спорта',
        body: 'Факультативные секции по плаванию, парусному спорту, волейболу, футболу, баскетболу, борьбе и другим видам.',
      },
      {
        title: 'Обратитесь на кафедру',
        who: 'Кафедра, молодёжная организация',
        body: 'Чтобы записаться в секцию, обратитесь к преподавателям кафедры. Набор в сборные проходит по объявлению; в организации студенческих соревнований участвуют молодёжная организация и Спортивное общество профкома.',
      },
      {
        title: 'Участвуйте в соревнованиях',
        period: 'Ежегодно',
        who: 'Академия и партнёры',
        body: 'Межфакультетские соревнования, межвузовские турниры ко дню рождения общенационального лидера Гейдара Алиева, парусные гонки в открытом море в государственные праздники.',
      },
    ],
    body: `## Кафедра и секции

Кафедра физического воспитания и спорта работает самостоятельно с 19 мая 2004 года; в 1996–2004 годах предмет преподавался в составе кафедры гуманитарных дисциплин. Помимо плавания и морского дела, на кафедре работают факультативные секции: плавание, парусный спорт, волейбол, футбол, баскетбол, борьба и другие. Студенты также выступают на республиканских и академических соревнованиях по футболу, волейболу, борьбе и шахматам.

## Соревнования и результаты

| Год | Соревнование | Результат |
|---|---|---|
| 2026 | Студенческий чемпионат по футболу, финал — арена AzFar Koroğlu, 16 мая | финал завершился со счётом 8:4 ([новость](${AZ(NEWS.football2026)})) |
| 2026 | Соревнования по плаванию к юбилеям АГМА — бассейн Азербайджанской академии спорта | студенты технических вузов ([новость](${AZ(NEWS.swim2026)})) |
| 2024 | Соревнования по плаванию к 101-летию Гейдара Алиева | команда АГМА — III место ([новость](${AZ(NEWS.swim2024)})) |
| 2023 | Парусная регата Baku Sailing Regatta-2023 | наш студент — II место ([новость](${AZ(NEWS.regatta2023)})) |
| 2018 | I Спартакиада ASCO | команда АГМА — I место по шахматам ([новость](${AZ(NEWS.spartakiad2018)})) |

## Парусный и морской спорт

В государственные праздники в открытом море проходят парусные гонки. Студенты соревнуются на парусных лодках и в других морских видах спорта — так поддерживается необходимая моряку физическая форма.

## Кто организует

- **Кафедра** — секции и межфакультетские соревнования.
- **[Организация студенческой молодёжи](${TGT})** — студенческие соревнования, сборные.
- **[Профсоюзный комитет](${THIK})** — Спортивное общество, спартакиады.
- **ASCO** — спартакиады моряков, в которых участвует и команда Академии.`,
    faq: [
      {
        question: 'Какие есть виды спорта?',
        answer: 'Секции плавания, парусного спорта, волейбола, футбола, баскетбола и борьбы; в соревнованиях также есть шахматы.',
      },
      {
        question: 'Как попасть в сборную?',
        answer: 'Набор проходит по объявлению — следите за объявлениями Академии, обращайтесь на кафедру или в молодёжную организацию.',
      },
      {
        question: 'Почему так важно плавание?',
        answer: 'Плавание — часть профессиональной подготовки моряка и преподаётся на кафедре как предмет.',
      },
    ],
    sideLinks: [L_RU.tgt, L_RU.thik, L_RU.events, L_RU.hub],
    contact: CONTACT_RU,
  },
};

// ── 7. Mədəniyyət və yaradıcılıq (yeni; köhnə «hazırlanır» ünvanı) ──────────────
const CULTURE_PAGE: TelebePageSeed = {
  slug: 'medeniyyet-ve-yaradiciliq-dernekleri',
  dataBlock: 'medeniyyet',
  az: {
    title: 'Mədəniyyət və yaradıcılıq',
    lead:
      'Bayram şənlikləri və konsertlər, «Kim? Nə? Harada?» intellektual yarışları, teatr səfərləri, Akademiyanın himni və muzeyi. ' +
      'Tələbə dərnəkləri üçün işçi qrup məsələsi 2026-cı ildə Elmi Şurada müzakirə olunub.',
    seoDescription:
      'ADDA-da mədəniyyət və yaradıcılıq: bayram şənlikləri, konsertlər, Akademiyanın himni, intellektual yarışlar, teatr, muzey və bədii özfəaliyyət dərnəkləri.',
    stepsTitle: 'Necə qoşulmaq olar',
    facts: [
      { label: 'Akademiyanın himni', value: '2026', icon: 'tarix' },
      { label: 'İntellektual yarış', value: '«Kim? Nə? Harada?»', icon: 'medeniyyet' },
      { label: 'Muzey', value: '2015-ci ildən', icon: 'bina' },
    ],
    steps: [
      {
        title: 'Tədbirləri izləyin',
        who: 'Tədbirlər təqvimi',
        body: 'Konsert, şənlik və yarışlar təqvimdə və xəbərlərdə elan olunur; son tədbirlər bu səhifədə avtomatik görünür.',
        linkLabel: 'Tədbirlər təqvimi',
        linkUrl: EVENTS,
      },
      {
        title: 'Komandanızı qurun',
        who: 'Qrup və fakültə',
        body: 'İntellektual yarışlarda komandalar beş nəfərdən ibarət olur; 2023-cü ilin dekabrındakı yarışda altı komanda iştirak edib.',
      },
      {
        title: 'Dərnəyə yazılın',
        who: 'Dekanlıq',
        body: 'Musiqi alətində ifa, oxuma, rəqs, rəsm qabiliyyəti olan tələbələr bədii özfəaliyyət dərnəklərinə dekanlıq vasitəsilə yazılır.',
        linkLabel: '2022-ci il elanı',
        linkUrl: CLUBS_2022,
      },
      {
        title: 'Təşəbbüs irəli sürün',
        who: 'Tələbə Gənclər Təşkilatı',
        body: 'Yeni dərnək və ya tədbir ideyanızı TGT-yə təqdim edin: dərnək, studiya və klubların təşkili təşkilatın vəzifələrindəndir.',
        linkLabel: 'Tələbə Gənclər Təşkilatı',
        linkUrl: TGT,
      },
    ],
    body: `## Bayramlar və konsertlər

- **Novruz, 17 mart 2026** — Akademiyanın tarixində ilk himn təqdim olunub. Himn 13 fevral 2026-cı ildə Əqli Mülkiyyət Agentliyində qeydiyyatdan keçib; sözləri Rasif İmanoğlunun, musiqisi «Dəniz naviqasiyası» kafedrasının baş müəllimi Aydın Qafarovundur. Qara Qarayev adına Mərkəzi İncəsənət Məktəbinin konserti, Akademiyanın həyətində tonqal ([xəbər](${NEWS.novruz2026})).
- **Müstəqillik Günü, 26 may 2026** — Gənclərin Respublika Bədii Yaradıcılıq Evi ilə birgə «Zəfərə aparan hürriyyət» tədbiri, tələbələrin konserti ([xəbər](${NEWS.independence2026})).
- **Dövlət Bayrağı Günü** — Gənclərin Respublika Bədii Yaradıcılıq Evinin dərnəklərinin konserti ([xəbər](${NEWS.flagConcert})).

## İntellektual yarışlar

- **«Kim? Nə? Harada?»** — 29 dekabr 2023: altı komanda, hər birində beş iştirakçı; qalib «Xarıbülbül» ([xəbər](${NEWS.quiz2023})). 2022-ci ildə «Şuşa ili» ilə bağlı yarış ([xəbər](${NEWS.quiz2022})).
- **«Hüquq zəkası»** — əcnəbi tələbələr də qatılıb ([xəbər](${NEWS.lawQuiz})).
- **Fibonacci (2025)** — Gənclər və İdman Nazirliyi və ATGTİ-nin layihəsi ([xəbər](${NEWS.fibonacci})).

## Ədəbiyyat, teatr, muzey

- «Nəsimi – 650» — Humanitar fənlər kafedrası və TGT-nin ədəbi tədbiri ([xəbər](${NEWS.nesimi})).
- Gənc Tamaşaçılar Teatrına səfər ([xəbər](${NEWS.theatre})).
- [Muzey](/sehife/muzey) — Ulu Öndər Heydər Əliyevin həyat yoluna həsr olunmuş muzey 27 may 2015-ci ildə yaradılıb.

## Dərnəklər

- 2022-ci ildə bədii özfəaliyyət dərnəkləri yaradılarkən musiqi alətində ifa, oxuma, rəqs və rəsm qabiliyyəti olan tələbələr dekanlıqlara müraciət edib ([elan](${CLUBS_2022})).
- 24 aprel 2026-cı il iclasında Elmi Şura tələbələrin asudə vaxtının səmərəli təşkili və sosial fəallığının artırılması üçün dərnəklərin formalaşdırılmasına dair işçi qrupun yaradılmasını müzakirə edib ([xəbər](${NEWS.council2026})).
- Dərnək, studiya və klubların təşkili [Tələbə Gənclər Təşkilatının](${TGT}) və [Həmkarlar İttifaqı Komitəsinin](${THIK}) vəzifələrindəndir.`,
    faq: [
      {
        question: 'Dərnəyə necə yazılmaq olar?',
        answer: 'Dekanlığa və ya Tələbə Gənclər Təşkilatına müraciət edin. Yeni dərnəklər yaradılanda elan Akademiyanın saytında dərc olunur.',
      },
      {
        question: 'İntellektual yarışa necə qatılmaq olar?',
        answer: 'Komandalar beş nəfərdən ibarət olur. Növbəti yarış elan olunanda təşkilatçıların göstərdiyi qaydada qeydiyyatdan keçin.',
      },
      {
        question: 'Muzeyə kimlər baxa bilər?',
        answer: 'Muzey Akademiyanın binasındadır; ekskursiya barədə Akademiya ilə əlaqə saxlayın.',
      },
    ],
    sideLinks: [{ label: 'Muzey', url: '/sehife/muzey' }, L_AZ.tgt, L_AZ.events, L_AZ.hub],
    contact: CONTACT_AZ,
  },
  en: {
    title: 'Culture and Creativity',
    lead:
      'Holiday celebrations and concerts, “What? Where? When?” quiz competitions, theatre visits, the Academy’s anthem and museum. ' +
      'In 2026 the Academic Council discussed a working group for student clubs.',
    seoDescription:
      'Culture and creativity at ADDA: holiday celebrations, concerts, the Academy anthem, quiz competitions, theatre, the museum and amateur arts clubs.',
    stepsTitle: 'How to get involved',
    facts: [
      { label: 'Academy anthem', value: '2026', icon: 'tarix' },
      { label: 'Quiz competition', value: '“What? Where? When?”', icon: 'medeniyyet' },
      { label: 'Museum', value: 'Since 2015', icon: 'bina' },
    ],
    steps: [
      {
        title: 'Follow the events',
        who: 'Events calendar',
        body: 'Concerts, celebrations and competitions are announced in the calendar and the news; recent events appear on this page automatically.',
        linkLabel: 'Events calendar',
        linkUrl: EVENTS,
      },
      {
        title: 'Build your team',
        who: 'Group and faculty',
        body: 'Quiz teams have five members; six teams took part in the December 2023 competition.',
      },
      {
        title: 'Join a club',
        who: 'Dean’s office',
        body: 'Students who play an instrument, sing, dance or draw join the amateur arts clubs through their dean’s office.',
        linkLabel: 'The 2022 announcement',
        linkUrl: AZ(CLUBS_2022),
      },
      {
        title: 'Propose an initiative',
        who: 'Student Youth Organisation',
        body: 'Bring your idea for a new club or event to the Student Youth Organisation: setting up clubs, studios and societies is one of its tasks.',
        linkLabel: 'Student Youth Organisation',
        linkUrl: TGT,
      },
    ],
    body: `## Holidays and concerts

- **Novruz, 17 March 2026** — the first anthem in the Academy’s history was presented. It was registered with the Intellectual Property Agency on 13 February 2026; the lyrics are by Rasif Imanoghlu and the music by Aydin Gafarov, senior lecturer in the Marine Navigation Department. A concert by the Gara Garayev Central Art School and a bonfire in the Academy courtyard followed ([news](${AZ(NEWS.novruz2026)})).
- **Independence Day, 26 May 2026** — “Freedom that Leads to Victory”, held with the Republican Youth House of Arts, with a student concert ([news](${AZ(NEWS.independence2026)})).
- **National Flag Day** — a concert by the clubs of the Republican Youth House of Arts ([news](${AZ(NEWS.flagConcert)})).

## Quiz competitions

- **“What? Where? When?”** — 29 December 2023: six teams of five; the winner was “Kharibulbul” ([news](${AZ(NEWS.quiz2023)})). In 2022 there was a competition for the “Year of Shusha” ([news](${AZ(NEWS.quiz2022)})).
- **“Legal Mind”** — international students took part as well ([news](${AZ(NEWS.lawQuiz)})).
- **Fibonacci (2025)** — a project of the Ministry of Youth and Sport and ATGTİ ([news](${AZ(NEWS.fibonacci)})).

## Literature, theatre and museum

- “Nasimi 650” — a literary event of the Humanities Department and the Student Youth Organisation ([news](${AZ(NEWS.nesimi)})).
- A visit to the Young Spectators’ Theatre ([news](${AZ(NEWS.theatre)})).
- The [Museum](/sehife/muzey) dedicated to the life of national leader Heydar Aliyev opened on 27 May 2015.

## Clubs

- When the amateur arts clubs were set up in 2022, students who play an instrument, sing, dance or draw applied through their dean’s offices ([announcement](${AZ(CLUBS_2022)})).
- At its meeting on 24 April 2026 the Academic Council discussed creating a working group to form clubs that make the most of students’ free time and increase their social engagement ([news](${AZ(NEWS.council2026)})).
- Setting up clubs, studios and societies is one of the tasks of the [Student Youth Organisation](${TGT}) and the [Trade Union Committee](${THIK}).`,
    faq: [
      {
        question: 'How do I join a club?',
        answer: 'Contact your dean’s office or the Student Youth Organisation. When new clubs are set up, an announcement is published on the Academy website.',
      },
      {
        question: 'How do I take part in a quiz competition?',
        answer: 'Teams have five members. When the next competition is announced, register as the organisers indicate.',
      },
      {
        question: 'Who can visit the museum?',
        answer: 'The museum is in the Academy building; contact the Academy to arrange a visit.',
      },
    ],
    sideLinks: [{ label: 'Museum', url: '/sehife/muzey' }, L_EN.tgt, L_EN.events, L_EN.hub],
    contact: CONTACT_EN,
  },
  ru: {
    title: 'Культура и творчество',
    lead:
      'Праздники и концерты, интеллектуальные игры «Что? Где? Когда?», походы в театр, гимн и музей Академии. ' +
      'В 2026 году Учёный совет обсудил создание рабочей группы для студенческих кружков.',
    seoDescription:
      'Культура и творчество в АГМА: праздники, концерты, гимн Академии, интеллектуальные игры, театр, музей и кружки художественной самодеятельности.',
    stepsTitle: 'Как присоединиться',
    facts: [
      { label: 'Гимн Академии', value: '2026', icon: 'tarix' },
      { label: 'Интеллектуальная игра', value: '«Что? Где? Когда?»', icon: 'medeniyyet' },
      { label: 'Музей', value: 'С 2015 года', icon: 'bina' },
    ],
    steps: [
      {
        title: 'Следите за мероприятиями',
        who: 'Календарь мероприятий',
        body: 'Концерты, праздники и игры объявляются в календаре и новостях; последние мероприятия появляются на этой странице автоматически.',
        linkLabel: 'Календарь мероприятий',
        linkUrl: EVENTS,
      },
      {
        title: 'Соберите команду',
        who: 'Группа и факультет',
        body: 'В интеллектуальных играх команды состоят из пяти человек; в игре в декабре 2023 года участвовали шесть команд.',
      },
      {
        title: 'Запишитесь в кружок',
        who: 'Деканат',
        body: 'Студенты, которые играют на музыкальных инструментах, поют, танцуют или рисуют, записываются в кружки художественной самодеятельности через деканат.',
        linkLabel: 'Объявление 2022 года',
        linkUrl: AZ(CLUBS_2022),
      },
      {
        title: 'Предложите инициативу',
        who: 'Организация студенческой молодёжи',
        body: 'Идею нового кружка или мероприятия предложите молодёжной организации: создание кружков, студий и клубов — одна из её задач.',
        linkLabel: 'Организация студенческой молодёжи',
        linkUrl: TGT,
      },
    ],
    body: `## Праздники и концерты

- **Новруз, 17 марта 2026 года** — представлен первый в истории Академии гимн. Он зарегистрирован в Агентстве интеллектуальной собственности 13 февраля 2026 года; слова — Расифа Иманоглу, музыка — старшего преподавателя кафедры морской навигации Айдына Гафарова. Концерт Центральной школы искусств имени Кара Караева, костёр во дворе Академии ([новость](${AZ(NEWS.novruz2026)})).
- **День независимости, 26 мая 2026 года** — мероприятие «Свобода, ведущая к победе» совместно с Республиканским домом художественного творчества молодёжи, концерт студентов ([новость](${AZ(NEWS.independence2026)})).
- **День Государственного флага** — концерт кружков Республиканского дома художественного творчества молодёжи ([новость](${AZ(NEWS.flagConcert)})).

## Интеллектуальные игры

- **«Что? Где? Когда?»** — 29 декабря 2023 года: шесть команд по пять игроков; победила «Харыбюльбюль» ([новость](${AZ(NEWS.quiz2023)})). В 2022 году — игра, посвящённая «Году Шуши» ([новость](${AZ(NEWS.quiz2022)})).
- **«Правовой интеллект»** — участвовали и иностранные студенты ([новость](${AZ(NEWS.lawQuiz)})).
- **Fibonacci (2025)** — проект Министерства молодёжи и спорта и ATGTİ ([новость](${AZ(NEWS.fibonacci)})).

## Литература, театр, музей

- «Насими — 650» — литературное мероприятие кафедры гуманитарных дисциплин и молодёжной организации ([новость](${AZ(NEWS.nesimi)})).
- Поход в Театр юного зрителя ([новость](${AZ(NEWS.theatre)})).
- [Музей](/sehife/muzey), посвящённый жизненному пути общенационального лидера Гейдара Алиева, открыт 27 мая 2015 года.

## Кружки

- При создании кружков художественной самодеятельности в 2022 году студенты, умеющие играть на инструментах, петь, танцевать и рисовать, обращались в деканаты ([объявление](${AZ(CLUBS_2022)})).
- На заседании 24 апреля 2026 года Учёный совет обсудил создание рабочей группы по формированию кружков для организации досуга и повышения социальной активности студентов ([новость](${AZ(NEWS.council2026)})).
- Создание кружков, студий и клубов — задача [Организации студенческой молодёжи](${TGT}) и [профсоюзного комитета](${THIK}).`,
    faq: [
      {
        question: 'Как записаться в кружок?',
        answer: 'Обратитесь в деканат или в молодёжную организацию. Когда создаются новые кружки, объявление публикуется на сайте Академии.',
      },
      {
        question: 'Как участвовать в интеллектуальной игре?',
        answer: 'Команды состоят из пяти человек. Когда объявят следующую игру, зарегистрируйтесь в порядке, указанном организаторами.',
      },
      {
        question: 'Кто может посетить музей?',
        answer: 'Музей находится в здании Академии; о посещении договоритесь с Академией.',
      },
    ],
    sideLinks: [{ label: 'Музей', url: '/sehife/muzey' }, L_RU.tgt, L_RU.events, L_RU.hub],
    contact: CONTACT_RU,
  },
};

export const TELEBE_PAGES: TelebePageSeed[] = [HUB_PAGE, TGT_PAGE, THIK_PAGE, TEC_PAGE, SOCIAL_PAGE, SPORT_PAGE, CULTURE_PAGE];
export const TELEBE_PAGE_SLUGS: string[] = TELEBE_PAGES.map((p) => p.slug);
