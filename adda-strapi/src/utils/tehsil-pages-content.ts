/**
 * F5.46 — «Təhsil» menyusunun səhifələri: məzmun (yalnız məlumat, məntiq
 * src/utils/tehsil-pages.ts-dədir). Şablon: layout=tehsil (SectionPage —
 * F5.45-in sağ panelli şablonu, «Təhsil» qırıntısı və «Sual ver» →
 * «Tədris prosesi və sənədlər»).
 *
 * Quruluş HSE.ru nümunəsi ilə: istifadəçinin sualı → qısa cavab (giriş və
 * faktlar) → yol (addımlar) → təfərrüat (bölmələr) → suallar → yan paneldə
 * əlaqə və keçidlər. Ruben və b. «A Guide for Leaders in Higher Education»
 * (EHE modeli): maraqlı tərəfin dili ilə, nəticə sübutla (sertifikat, il,
 * mənbə), hər mövzunun bir yeri var.
 *
 * MƏNBƏLƏR (9 oktyabr 2026, yoxlanılıb):
 *   - saytın mövcud səhifələri: «Təcrübə haqqında», «Tədris gəmisi»,
 *     «Xaricdə təhsil və ixtisasartırma», «Elektron kitabxana», «Keyfiyyətin
 *     menecmenti və monitorinqi», «İnformasiya resurs mərkəzi» — köhnə mətn
 *     yenidən qurulub, rəqəmlər oradandır;
 *   - ADDA xəbərləri: Dünya Dənizçilik Universiteti (10.03.2017, 13.11.2017),
 *     imtahan sessiyası və Elektron Akademiya (06.01.2022), Harbin (24.06.2026),
 *     əməkdaşlıq memorandumları;
 *   - IMO: STCW Konvensiyası (II/1, III/1, III/6, VI/1–VI/6); MSC.1/Circ.1164
 *     (Azərbaycan «Ağ siyahı»da, Rev.23, 2021);
 *   - ddla.gov.az: Rəqəmsal İnkişaf və Nəqliyyat Nazirliyinin tabeliyində
 *     Dövlət Dəniz və Liman Agentliyi (dənizçi diplomları, ixtisas imtahanları).
 * Yoxlanılmayan məlumat YAZILMAYIB (məs. akkreditasiya qərarı, kitabxananın
 * iş saatı, TTM-in e-poçtu).
 */
import type { LinkSeed, QebulPageSeed } from './qebul-pages-content';

export type TehsilPageSeed = QebulPageSeed;

// ── Təkrarlanan keçidlər ─────────────────────────────────────────────────────
const TECRUBE: LinkSeed = { label: 'Təcrübə (praktika)', url: '/sehife/tecrube-haqqinda' };
const GEMI: LinkSeed = { label: 'Tədris gəmisi', url: '/sehife/tedris-gemisi' };
const LAB: LinkSeed = { label: 'Laboratoriya və trenajorlar', url: '/auditoriyalar' };
const TTM: LinkSeed = { label: 'STCW kursları — Təlim-Tədris Mərkəzi', url: '/struktur/telim-tedris-merkezi' };
const OFIS: LinkSeed = { label: 'Tədris ofisi', url: '/struktur/tedris-proseslerinin-teskili-sobesi' };
const DDLA: LinkSeed = { label: 'Dövlət Dəniz və Liman Agentliyi', url: 'https://ddla.gov.az' };
const STCW_URL = 'https://www.imo.org/en/OurWork/HumanElement/Pages/STCW-Convention.aspx';
const ASCO: LinkSeed = { label: 'ASCO', url: 'https://asco.az' };
const IRM: LinkSeed = { label: 'İnformasiya resurs mərkəzi', url: '/struktur/informasiya-resurs-merkezi' };

const OFIS_PHONE = '(+99412) 498-73-94';
const CONTACT_PRACTICE_AZ =
  `**Təcrübə bölməsi** — [Tədris proseslərinin təşkili şöbəsi](/struktur/tedris-proseslerinin-teskili-sobesi)\n\n` +
  `**Telefon:** ${OFIS_PHONE}\n\n` +
  'Sualınızı [onlayn göndərin](/vetendaslarin-muracieti?istiqamet=tedris) — cavab e-poçtunuza gəlir.';
const CONTACT_PRACTICE_EN =
  `**Practical training office** — [Academic Process Department](/struktur/tedris-proseslerinin-teskili-sobesi)\n\n` +
  `**Phone:** ${OFIS_PHONE}\n\n` +
  '[Send your question online](/vetendaslarin-muracieti?istiqamet=tedris) — the reply comes to your e-mail.';
const CONTACT_PRACTICE_RU =
  `**Отдел практики** — [Отдел организации учебного процесса](/struktur/tedris-proseslerinin-teskili-sobesi)\n\n` +
  `**Телефон:** ${OFIS_PHONE}\n\n` +
  '[Задайте вопрос онлайн](/vetendaslarin-muracieti?istiqamet=tedris) — ответ придёт на e-mail.';

// ── 1. Təcrübə (praktika) ────────────────────────────────────────────────────
const TECRUBE_PAGE: TehsilPageSeed = {
  slug: 'tecrube-haqqinda',
  dataBlock: 'yox',
  az: {
    title: 'Təcrübə (praktika)',
    lead:
      'Dənizçi ixtisaslarında tələbələr 4 ildə 52 həftə, gəmiqayırmada 14 həftə təcrübə keçirlər — tədris gəmisində, ASCO-nun gəmilərində və zavodlarda. ' +
      'Təcrübə STCW Konvensiyasının tələblərinə uyğun təşkil olunur və gələcək işçi diplomunun əsasıdır.',
    seoDescription:
      'ADDA-da təcrübə: növləri, müddəti, bazaları (ASCO gəmiləri, tədris gəmisi, zavodlar), Təcrübə jurnalı və STCW üzrə işçi diplomuna yol.',
    stepsTitle: 'Təcrübə trayektoriyası',
    facts: [
      { label: 'Dənizçi ixtisasları', value: '52 həftə (4 ildə)', icon: 'muddet' },
      { label: 'Gəmiqayırma', value: '14 həftə (4 ildə)', icon: 'muddet' },
      { label: 'Əsas baza', value: 'ASCO donanması', icon: 'gemi' },
      { label: 'Standart', value: 'STCW-78 (2010 düzəlişləri)', icon: 'qoruma' },
    ],
    steps: [
      {
        track: 'Dənizçi ixtisasları',
        title: 'Təhlükəsizlik hazırlığı və sənədlər',
        period: 'İlk dəniz təcrübəsindən əvvəl',
        who: 'ADDA və ASCO',
        body:
          'Dənizdə sağqalma, yanğınsöndürmə, ilk tibbi yardım və şəxsi təhlükəsizlik üzrə baza hazırlığı (STCW VI/1). ' +
          'Təcrübə üçün lazım olan sənəd və sertifikatları, xüsusi geyim formasını ASCO və Akademiya təmin edir.',
      },
      {
        track: 'Dənizçi ixtisasları',
        title: 'Tədris (üzmə) təcrübəsi',
        who: 'Tədris gəmisi «General Əsədov»',
        body:
          'Nəzəri bilik real gəmi şəraitində: gəmi mexanizmləri, idarəetmə sistemləri və naviqasiya avadanlığı, həyəcan siqnalları və qayıq təlimləri.',
        linkLabel: 'Tədris gəmisi',
        linkUrl: '/sehife/tedris-gemisi',
      },
      {
        track: 'Dənizçi ixtisasları',
        title: 'İstehsalat (üzmə) təcrübəsi',
        who: 'ASCO gəmiləri',
        body:
          'ASCO-nun Dəniz Nəqliyyat Donanması və Xəzər Dəniz Neft Donanmasının gəmilərində; xarici sularda üzən gəmilərdə də imkan var. ' +
          'Görülən iş hər gün Təcrübə jurnalına yazılır, qeydləri kapitan və ya baş mexanik imzalayır.',
      },
      {
        track: 'Dənizçi ixtisasları',
        title: 'Diplomqabağı təcrübə',
        period: 'Təhsilin sonunda',
        who: 'Gəmi və ya müəssisə',
        body: 'Buraxılış işinə hazırlıqla bağlı təcrübə.',
      },
      {
        track: 'Dənizçi ixtisasları',
        title: 'İşçi diplomu (Certificate of Competency)',
        period: 'Məzun olduqdan sonra',
        who: 'Dövlət Dəniz və Liman Agentliyi',
        body:
          'Diplomu Rəqəmsal İnkişaf və Nəqliyyat Nazirliyinin tabeliyindəki Dövlət Dəniz və Liman Agentliyi verir. ' +
          'Təhsil sənədi, üzmə stajı və Təcrübə jurnalı əsas sənədlərdir; müraciət və ixtisas imtahanları barədə məlumat Agentliyin saytındadır.',
        linkLabel: 'ddla.gov.az',
        linkUrl: 'https://ddla.gov.az',
      },
      {
        track: 'Gəmiqayırma və gəmi təmiri',
        title: 'Zavod təcrübəsi',
        who: 'Gəmi təmiri və gəmiqayırma zavodları',
        body:
          '«Bibiheybət» gəmi təmiri zavodu, «Zığ» gəmi təmiri və tikintisi zavodu, Bakı Gəmiqayırma Zavodu — gəmi tikintisi və təmiri istehsalat şəraitində.',
      },
      {
        track: 'Gəmiqayırma və gəmi təmiri',
        title: 'Elmi-tədqiqat institutunda təcrübə',
        who: '«Xəzərdənizlayihə» ETİ',
        body: 'Gəmi layihələri ilə işləyən elmi-tədqiqat institutunda təcrübə.',
      },
      {
        track: 'Gəmiqayırma və gəmi təmiri',
        title: 'Diplomqabağı təcrübə',
        period: 'Təhsilin sonunda',
        who: 'Zavod və ya institut',
        body: 'Buraxılış işinə hazırlıqla bağlı təcrübə.',
      },
    ],
    body: `## Təcrübənin növləri və müddəti

Təcrübənin üç növü var: **tədris (üzmə)**, **istehsalat (üzmə)** və **diplomqabağı** təcrübə. Müddət ixtisasa görə dəyişir:

| İxtisas | 4 ildə təcrübə | Harada |
|---|---|---|
| Dəniz naviqasiyası mühəndisliyi | 52 həftə | Tədris gəmisi, ASCO gəmiləri |
| Gəmi energetik qurğularının istismarı mühəndisliyi | 52 həftə | Tədris gəmisi, ASCO gəmiləri |
| Elektrik və elektronika mühəndisliyi | 52 həftə | Tədris gəmisi, ASCO gəmiləri |
| Gəmiqayırma və gəmi təmiri mühəndisliyi | 14 həftə | Gəmi təmiri və gəmiqayırma zavodları |

Təcrübə «Təhsil haqqında» Azərbaycan Respublikasının Qanunu, STCW-78 Konvensiyası və Akademiyanın tələbələrin təcrübə keçməsi haqqında Əsasnaməsi əsasında təşkil olunur.

## Təcrübə bazaları

- **ASCO** — Dəniz Nəqliyyat Donanması və Xəzər Dəniz Neft Donanmasının gəmiləri; ASCO-nun xarici sularda üzən gəmilərində də təcrübə imkanı var.
- **Tədris gəmisi «General Əsədov»** — [ətraflı](/sehife/tedris-gemisi).
- **Digər gəmiçilik şirkətləri** — Azərbaycanda fəaliyyət göstərən yerli və xarici şirkətlərlə əməkdaşlıq edilir.
- **Zavodlar və institut** (gəmiqayırma ixtisası) — «Bibiheybət» gəmi təmiri zavodu, «Zığ» gəmi təmiri və tikintisi zavodu, Bakı Gəmiqayırma Zavodu, «Xəzərdənizlayihə» elmi-tədqiqat institutu.

Təcrübə üçün tələb olunan sənəd və sertifikatlarla, xüsusi geyim forması ilə tələbələri ASCO və Akademiya təmin edir.

## STCW və işçi diplomu

Gəmidə zabit kimi işləmək üçün STCW Konvensiyası üzrə işçi diplomu (Certificate of Competency) lazımdır. Diplom üçün təhsillə yanaşı təsdiq olunmuş üzmə stajı tələb olunur. Təcrübə təsdiq olunmuş təhsil proqramının hissəsidirsə və Təcrübə jurnalında sənədləşdirilirsə, STCW-nin minimumu belədir:

| Diplom (STCW qaydası) | İxtisas | Minimum staj |
|---|---|---|
| Naviqasiya növbəsi rəisi (II/1) | Dəniz naviqasiyası mühəndisliyi | 12 ay üzmə stajı |
| Maşın növbəsi rəisi — mexanik (III/1) | Gəmi energetik qurğularının istismarı mühəndisliyi | 12 ay — emalatxana hazırlığı və üzmə stajı birlikdə |
| Elektrik-mexanik, ETO (III/6) | Elektrik və elektronika mühəndisliyi | 12 ay — emalatxana hazırlığı və üzmə stajı birlikdə, ən azı 6 ayı dənizdə |

Dəqiq tələblər və imtahan qaydası üçün: [Dövlət Dəniz və Liman Agentliyi](https://ddla.gov.az).

**Təcrübə jurnalı (Training Record Book).** Gəmiyə qalxan hər tələbə rəsmi jurnal aparır: hansı naviqasiya və ya mühəndislik əməliyyatında iştirak etdiyi, hansı avadanlığa xidmət etdiyi gündəlik yazılır, qeydləri kapitan və ya baş mexanik imzalayır. Təcrübə zamanı tələbələr ISM (təhlükəsiz idarəetmə) və ISPS (gəmi və liman vasitələrinin mühafizəsi) məcəllələrinin gəmidə necə tətbiq olunduğunu öyrənirlər.

Azərbaycan IMO-nun STCW üzrə «Ağ siyahı»sına daxildir — bu, ölkədə verilən dənizçi diplomlarının digər dövlətlərdə tanınması üçün əsasdır.

## Təşkilat

Təcrübəni [Tədris proseslərinin təşkili şöbəsinin](/struktur/tedris-proseslerinin-teskili-sobesi) təcrübə bölməsi təşkil edir və ona nəzarət edir. Sahildə hazırlıq — [laboratoriya və trenajorlar](/auditoriyalar); dənizçi sertifikatları üzrə kurslar — [Təlim-Tədris Mərkəzi](/struktur/telim-tedris-merkezi).`,
    faq: [
      {
        question: 'Təcrübəni harada keçəcəyəm?',
        answer:
          'Dənizçi ixtisaslarında — tədris gəmisində və ASCO-nun gəmilərində (Dəniz Nəqliyyat Donanması, Xəzər Dəniz Neft Donanması), imkan olduqda xarici sularda üzən gəmilərdə. Gəmiqayırma ixtisasında — gəmi təmiri və gəmiqayırma zavodlarında.',
      },
      {
        question: 'Sənəd, sertifikat və geyim formasını kim verir?',
        answer: 'Təcrübə üçün tələb olunan sənəd və sertifikatları, xüsusi geyim formasını ASCO və Akademiya təmin edir.',
      },
      {
        question: 'Təcrübə jurnalı nə üçün lazımdır?',
        answer:
          'İşçi diplomu üçün üzmə stajı təsdiq olunmuş təhsil proqramı çərçivəsində jurnalda sənədləşdirilməlidir. Qeydləri kapitan və ya baş mexanik imzalayır — jurnalı vaxtında doldurun və qoruyun.',
      },
      {
        question: 'Məzun olduqdan sonra diplomu (CoC) haradan alım?',
        answer:
          'Rəqəmsal İnkişaf və Nəqliyyat Nazirliyinin tabeliyindəki Dövlət Dəniz və Liman Agentliyindən (ddla.gov.az). Müraciət qaydası və ixtisas imtahanları barədə məlumat Agentliyin saytındadır.',
      },
    ],
    sideLinks: [GEMI, LAB, TTM, OFIS, DDLA, { label: 'IMO: STCW Konvensiyası', url: STCW_URL }],
    contact: CONTACT_PRACTICE_AZ,
  },
  en: {
    title: 'Practical Training',
    lead:
      'Students of the seagoing programmes complete 52 weeks of practical training over four years, shipbuilding students 14 weeks — on the training ship, on ASCO vessels and at shipyards. ' +
      'Training follows the STCW Convention and is the basis of the future certificate of competency.',
    seoDescription:
      'Practical training at ADDA: types, duration, training bases (ASCO fleet, training ship, shipyards), the Training Record Book and the route to an STCW certificate.',
    stepsTitle: 'Training pathway',
    facts: [
      { label: 'Seagoing programmes', value: '52 weeks (over 4 years)', icon: 'muddet' },
      { label: 'Shipbuilding', value: '14 weeks (over 4 years)', icon: 'muddet' },
      { label: 'Main base', value: 'ASCO fleet', icon: 'gemi' },
      { label: 'Standard', value: 'STCW-78, as amended in 2010', icon: 'qoruma' },
    ],
    steps: [
      {
        track: 'Seagoing programmes',
        title: 'Safety training and documents',
        period: 'Before the first sea practice',
        who: 'ADDA and ASCO',
        body:
          'Basic training in personal survival, fire fighting, first aid and personal safety (STCW VI/1). ASCO and the Academy provide the documents, certificates and uniform required for training.',
      },
      {
        track: 'Seagoing programmes',
        title: 'Training (sea) practice',
        who: 'Training ship General Asadov',
        body: 'Theory in a real ship environment: ship machinery, control systems, navigation equipment, alarm and boat drills.',
        linkLabel: 'Training ship',
        linkUrl: '/sehife/tedris-gemisi',
      },
      {
        track: 'Seagoing programmes',
        title: 'Production (sea) practice',
        who: 'ASCO vessels',
        body:
          "On vessels of ASCO's Marine Transport Fleet and Caspian Sea Oil Fleet; placements on ships trading in foreign waters are also possible. Daily work is entered in the Training Record Book and signed by the master or chief engineer.",
      },
      {
        track: 'Seagoing programmes',
        title: 'Pre-graduation practice',
        period: 'At the end of studies',
        who: 'Ship or company',
        body: 'Practice linked to the graduation project.',
      },
      {
        track: 'Seagoing programmes',
        title: 'Certificate of competency',
        period: 'After graduation',
        who: 'State Maritime and Port Agency',
        body:
          'Certificates are issued by the State Maritime and Port Agency under the Ministry of Digital Development and Transport. The diploma, sea service and the Training Record Book are the key documents; application and examination details are on the Agency website.',
        linkLabel: 'ddla.gov.az',
        linkUrl: 'https://ddla.gov.az',
      },
      {
        track: 'Shipbuilding and ship repair',
        title: 'Shipyard practice',
        who: 'Ship repair yards and shipyards',
        body: 'Bibiheybat ship repair yard, Zigh ship repair and building yard, Baku Shipyard — shipbuilding and repair in a production setting.',
      },
      {
        track: 'Shipbuilding and ship repair',
        title: 'Practice at a research institute',
        who: 'Khazardanizlayiha institute',
        body: 'Practice at a research institute working on ship projects.',
      },
      {
        track: 'Shipbuilding and ship repair',
        title: 'Pre-graduation practice',
        period: 'At the end of studies',
        who: 'Shipyard or institute',
        body: 'Practice linked to the graduation project.',
      },
    ],
    body: `## Types and duration

There are three types of practical training: **training (sea) practice**, **production (sea) practice** and **pre-graduation practice**. Duration depends on the programme:

| Programme | Practice over 4 years | Where |
|---|---|---|
| Marine Navigation Engineering | 52 weeks | Training ship, ASCO vessels |
| Marine Power Plant Operation Engineering | 52 weeks | Training ship, ASCO vessels |
| Electrical and Electronics Engineering | 52 weeks | Training ship, ASCO vessels |
| Shipbuilding and Ship Repair Engineering | 14 weeks | Ship repair yards and shipyards |

Training is organised under the Law of the Republic of Azerbaijan on Education, the STCW-78 Convention and the Academy's regulation on student practice.

## Training bases

- **ASCO** — vessels of the Marine Transport Fleet and the Caspian Sea Oil Fleet; placements on ASCO ships in foreign waters are also possible.
- **Training ship General Asadov** — [details](/sehife/tedris-gemisi).
- **Other shipping companies** — the Academy cooperates with local and foreign companies operating in Azerbaijan.
- **Shipyards and institute** (shipbuilding programme) — Bibiheybat ship repair yard, Zigh ship repair and building yard, Baku Shipyard, Khazardanizlayiha research institute.

ASCO and the Academy provide students with the documents, certificates and uniform required for training.

## STCW and the certificate of competency

To serve as an officer on board you need an STCW certificate of competency. Besides education it requires approved seagoing service. When the service is part of an approved training programme documented in a Training Record Book, the STCW minimum is:

| Certificate (STCW regulation) | Programme | Minimum service |
|---|---|---|
| Officer in charge of a navigational watch (II/1) | Marine Navigation Engineering | 12 months seagoing service |
| Officer in charge of an engineering watch (III/1) | Marine Power Plant Operation Engineering | 12 months of combined workshop training and seagoing service |
| Electro-technical officer (III/6) | Electrical and Electronics Engineering | 12 months combined, at least 6 months at sea |

For exact requirements and examinations see the [State Maritime and Port Agency](https://ddla.gov.az).

**Training Record Book.** Every student on board keeps an official record book: navigation or engineering operations and equipment served are entered daily and signed by the master or chief engineer. Students also see how the ISM and ISPS codes work on board.

Azerbaijan is on the IMO STCW "White List" — the basis for recognition of Azerbaijani seafarer certificates by other states.

## Organisation

Practical training is organised and supervised by the practice unit of the [Academic Process Department](/struktur/tedris-proseslerinin-teskili-sobesi). Shore-based training — [laboratories and simulators](/auditoriyalar); STCW courses — the [Training Centre](/struktur/telim-tedris-merkezi).`,
    faq: [
      {
        question: 'Where will I do my practice?',
        answer:
          'Seagoing programmes — on the training ship and on ASCO vessels (Marine Transport Fleet, Caspian Sea Oil Fleet), when possible on ships in foreign waters. Shipbuilding — at ship repair yards and shipyards.',
      },
      {
        question: 'Who provides documents, certificates and uniform?',
        answer: 'ASCO and the Academy provide the documents, certificates and uniform required for training.',
      },
      {
        question: 'Why is the Training Record Book needed?',
        answer:
          'For a certificate of competency, sea service within an approved programme must be documented in the record book. Entries are signed by the master or chief engineer — keep it complete and safe.',
      },
      {
        question: 'Where do I get my certificate of competency after graduation?',
        answer:
          'From the State Maritime and Port Agency under the Ministry of Digital Development and Transport (ddla.gov.az). Application and examination details are on its website.',
      },
    ],
    sideLinks: [
      { label: 'Training ship', url: '/sehife/tedris-gemisi' },
      { label: 'Laboratories and simulators', url: '/auditoriyalar' },
      { label: 'STCW courses — Training Centre', url: '/struktur/telim-tedris-merkezi' },
      { label: 'Academic Process Department', url: '/struktur/tedris-proseslerinin-teskili-sobesi' },
      { label: 'State Maritime and Port Agency', url: 'https://ddla.gov.az' },
      { label: 'IMO: STCW Convention', url: STCW_URL },
    ],
    contact: CONTACT_PRACTICE_EN,
  },
  ru: {
    title: 'Практика',
    lead:
      'Студенты морских специальностей за четыре года проходят 52 недели практики, судостроители — 14 недель: на учебном судне, судах ASCO и на заводах. ' +
      'Практика организована по требованиям Конвенции ПДНВ и служит основой будущего рабочего диплома.',
    seoDescription:
      'Практика в ADDA: виды, продолжительность, базы (суда ASCO, учебное судно, заводы), Книга регистрации подготовки и путь к рабочему диплому по ПДНВ.',
    stepsTitle: 'Траектория практики',
    facts: [
      { label: 'Морские специальности', value: '52 недели (за 4 года)', icon: 'muddet' },
      { label: 'Судостроение', value: '14 недель (за 4 года)', icon: 'muddet' },
      { label: 'Основная база', value: 'Флот ASCO', icon: 'gemi' },
      { label: 'Стандарт', value: 'ПДНВ-78 (поправки 2010 г.)', icon: 'qoruma' },
    ],
    steps: [
      {
        track: 'Морские специальности',
        title: 'Подготовка по безопасности и документы',
        period: 'До первой морской практики',
        who: 'ADDA и ASCO',
        body:
          'Начальная подготовка по выживанию на море, борьбе с пожаром, первой помощи и личной безопасности (ПДНВ VI/1). Документы, сертификаты и форменную одежду для практики обеспечивают ASCO и Академия.',
      },
      {
        track: 'Морские специальности',
        title: 'Учебная (плавательная) практика',
        who: 'Учебное судно «Генерал Асадов»',
        body: 'Теория в реальных судовых условиях: механизмы, системы управления, навигационное оборудование, тревоги и шлюпочные учения.',
        linkLabel: 'Учебное судно',
        linkUrl: '/sehife/tedris-gemisi',
      },
      {
        track: 'Морские специальности',
        title: 'Производственная (плавательная) практика',
        who: 'Суда ASCO',
        body:
          'На судах Морского транспортного флота и Каспийского морского нефтяного флота ASCO; возможна практика на судах в иностранных водах. Ежедневная работа записывается в Книгу регистрации подготовки, записи подписывает капитан или старший механик.',
      },
      {
        track: 'Морские специальности',
        title: 'Преддипломная практика',
        period: 'В конце обучения',
        who: 'Судно или предприятие',
        body: 'Практика, связанная с выпускной работой.',
      },
      {
        track: 'Морские специальности',
        title: 'Рабочий диплом',
        period: 'После окончания',
        who: 'Государственное морское и портовое агентство',
        body:
          'Дипломы выдаёт Государственное морское и портовое агентство (Dövlət Dəniz və Liman Agentliyi) при Министерстве цифрового развития и транспорта. Основные документы — диплом об образовании, плавательный ценз и Книга регистрации подготовки; порядок подачи и экзамены — на сайте Агентства.',
        linkLabel: 'ddla.gov.az',
        linkUrl: 'https://ddla.gov.az',
      },
      {
        track: 'Судостроение и судоремонт',
        title: 'Заводская практика',
        who: 'Судоремонтные и судостроительные заводы',
        body: 'Судоремонтный завод «Бибиэйбат», судоремонтно-судостроительный завод «Зых», Бакинский судостроительный завод — постройка и ремонт судов в производственных условиях.',
      },
      {
        track: 'Судостроение и судоремонт',
        title: 'Практика в научно-исследовательском институте',
        who: 'НИИ «Хазарденизлайиха»',
        body: 'Практика в институте, работающем с судовыми проектами.',
      },
      {
        track: 'Судостроение и судоремонт',
        title: 'Преддипломная практика',
        period: 'В конце обучения',
        who: 'Завод или институт',
        body: 'Практика, связанная с выпускной работой.',
      },
    ],
    body: `## Виды и продолжительность

Практика бывает трёх видов: **учебная (плавательная)**, **производственная (плавательная)** и **преддипломная**. Продолжительность зависит от специальности:

| Специальность | Практика за 4 года | Где |
|---|---|---|
| Инженерия морской навигации | 52 недели | Учебное судно, суда ASCO |
| Инженерия эксплуатации судовых энергетических установок | 52 недели | Учебное судно, суда ASCO |
| Электротехника и электроника | 52 недели | Учебное судно, суда ASCO |
| Инженерия судостроения и судоремонта | 14 недель | Судоремонтные и судостроительные заводы |

Практика организуется по Закону Азербайджанской Республики «Об образовании», Конвенции ПДНВ-78 и Положению Академии о практике студентов.

## Базы практики

- **ASCO** — суда Морского транспортного флота и Каспийского морского нефтяного флота; возможна практика на судах ASCO в иностранных водах.
- **Учебное судно «Генерал Асадов»** — [подробнее](/sehife/tedris-gemisi).
- **Другие судоходные компании** — Академия сотрудничает с местными и иностранными компаниями, работающими в Азербайджане.
- **Заводы и институт** (судостроение) — «Бибиэйбат», «Зых», Бакинский судостроительный завод, НИИ «Хазарденизлайиха».

Документами, сертификатами и форменной одеждой для практики студентов обеспечивают ASCO и Академия.

## ПДНВ и рабочий диплом

Чтобы работать на судне офицером, нужен рабочий диплом по Конвенции ПДНВ (Certificate of Competency). Кроме образования требуется одобренный плавательный ценз. Если практика входит в одобренную программу подготовки и записана в Книге регистрации подготовки, минимум ПДНВ таков:

| Диплом (правило ПДНВ) | Специальность | Минимальный ценз |
|---|---|---|
| Вахтенный помощник капитана (II/1) | Инженерия морской навигации | 12 месяцев плавания |
| Вахтенный механик (III/1) | Эксплуатация судовых энергетических установок | 12 месяцев — мастерские и плавание вместе |
| Электромеханик (III/6) | Электротехника и электроника | 12 месяцев вместе, не менее 6 из них в море |

Точные требования и экзамены — на сайте [Государственного морского и портового агентства](https://ddla.gov.az).

**Книга регистрации подготовки (Training Record Book).** Каждый студент на судне ведёт официальную книгу: ежедневно записывается, в каких навигационных или машинных операциях он участвовал и какое оборудование обслуживал; записи подписывает капитан или старший механик. На практике студенты видят, как на судне работают кодексы МКУБ (ISM) и ОСПС (ISPS).

Азербайджан входит в «Белый список» ИМО по ПДНВ — это основа признания азербайджанских дипломов моряков другими государствами.

## Организация

Практику организует и контролирует отдел практики [Отдела организации учебного процесса](/struktur/tedris-proseslerinin-teskili-sobesi). Подготовка на берегу — [лаборатории и тренажёры](/auditoriyalar); курсы ПДНВ — [Учебно-тренировочный центр](/struktur/telim-tedris-merkezi).`,
    faq: [
      {
        question: 'Где я буду проходить практику?',
        answer:
          'Морские специальности — на учебном судне и судах ASCO (Морской транспортный флот, Каспийский морской нефтяной флот), при возможности — на судах в иностранных водах. Судостроение — на судоремонтных и судостроительных заводах.',
      },
      {
        question: 'Кто выдаёт документы, сертификаты и форму?',
        answer: 'Документы, сертификаты и форменную одежду для практики обеспечивают ASCO и Академия.',
      },
      {
        question: 'Зачем нужна Книга регистрации подготовки?',
        answer:
          'Для рабочего диплома плавательный ценз в рамках одобренной программы должен быть записан в книге. Записи подписывает капитан или старший механик — заполняйте вовремя и храните её.',
      },
      {
        question: 'Где получить рабочий диплом после окончания?',
        answer:
          'В Государственном морском и портовом агентстве при Министерстве цифрового развития и транспорта (ddla.gov.az). Порядок подачи и экзамены — на сайте Агентства.',
      },
    ],
    sideLinks: [
      { label: 'Учебное судно', url: '/sehife/tedris-gemisi' },
      { label: 'Лаборатории и тренажёры', url: '/auditoriyalar' },
      { label: 'Курсы ПДНВ — Учебно-тренировочный центр', url: '/struktur/telim-tedris-merkezi' },
      { label: 'Отдел организации учебного процесса', url: '/struktur/tedris-proseslerinin-teskili-sobesi' },
      { label: 'Морское и портовое агентство', url: 'https://ddla.gov.az' },
      { label: 'ИМО: Конвенция ПДНВ', url: STCW_URL },
    ],
    contact: CONTACT_PRACTICE_RU,
  },
};

// ── 2. Tədris gəmisi ─────────────────────────────────────────────────────────
const GEMI_PAGE: TehsilPageSeed = {
  slug: 'tedris-gemisi',
  dataBlock: 'yox',
  az: {
    title: 'Tədris gəmisi',
    lead:
      '«General Əsədov» 2015-ci ildən ADDA-nın tədris gəmisidir. Konvensiya (STCW) ixtisaslarının tələbələri nəzəri və praktiki məşğələlərini, istehsalat təcrübəsinin bir hissəsini burada — real gəmi şəraitində keçir.',
    seoDescription:
      'ADDA-nın tədris gəmisi «General Əsədov»: göstəricilər, gəmidə tədris və təcrübə, təhlükəsizlik təlimləri, Təcrübə jurnalı, STCW tələbləri.',
    stepsTitle: 'Gəmidə təcrübə necə keçir',
    facts: [
      { label: 'Gəmi', value: '«General Əsədov»', icon: 'gemi' },
      { label: 'Tədris gəmisi kimi', value: '15 sentyabr 2015-dən', icon: 'tarix' },
      { label: 'İnşa ili', value: '1983', icon: 'tarix' },
      { label: 'Ölçülər', value: '73,92 × 14,82 m', icon: 'diger' },
      { label: 'IMO nömrəsi', value: '8128183', icon: 'sened' },
    ],
    steps: [
      {
        title: 'Hazırlıq',
        who: 'Akademiya',
        body: 'Gəmiyə çıxmazdan əvvəl baza təhlükəsizlik hazırlığı: dənizdə sağqalma, yanğınsöndürmə, ilk tibbi yardım, şəxsi təhlükəsizlik.',
      },
      {
        title: 'Gəmidə təlimlər',
        who: 'Gəmi heyəti',
        body: 'Həyəcan siqnalları və qayıq təlimləri müntəzəm keçirilir — təhlükəsizlik vərdişi təkrarla formalaşır.',
      },
      {
        title: 'İş yerlərində',
        who: 'Kapitan körpüsü, maşın şöbəsi',
        body: 'Naviqasiya avadanlığının, gəmi mexanizmlərinin və idarəetmə sistemlərinin işi ilə real şəraitdə tanışlıq.',
      },
      {
        title: 'Təcrübə jurnalı',
        who: 'Kapitan və ya baş mexanik',
        body: 'Gündəlik iş Təcrübə jurnalına (Training Record Book) yazılır və imzalanır.',
      },
    ],
    body: `## Gəmilər

- **«General Əsədov»** — ASCO-nun balansında olan sərnişin gəmisi; 15 sentyabr 2015-ci ildən ADDA tələbələrinin tədris gəmisidir. 1983-cü ildə inşa olunub, IMO nömrəsi 8128183, uzunluğu 73,92 m, eni 14,82 m. Layihə üzrə 577 sərnişin tutumu var; dənizçi hazırlığı üçün uyğunlaşdırılıb.
- **«Sabit Orucov»** — sərnişin gəmisi, 2017-ci ildən tədrisdə istifadə olunur.

## Gəmidə nə öyrənilir

«Dəniz naviqasiyası mühəndisliyi», «Gəmi energetik qurğularının istismarı mühəndisliyi», «Elektrik və elektronika mühəndisliyi» və digər ixtisasların tələbələri nəzəri biliyi real iş şəraitində tətbiq edir:

- naviqasiya avadanlığı və kapitan körpüsünün işi;
- gəmi mexanizmləri və energetik qurğular;
- idarəetmə və elektrik sistemləri.

Tələbələr həmçinin ISM (təhlükəsiz idarəetmə) və ISPS (gəmi və liman vasitələrinin mühafizəsi) məcəllələrinin gəmidə necə tətbiq olunduğunu görürlər.

## Təhlükəsizlik

Təcrübəyə başlamazdan əvvəl tələbələrin dənizdə sağqalma, yanğınsöndürmə, ilk tibbi yardım və şəxsi təhlükəsizlik üzrə baza sertifikatları olmalıdır. Tədris gəmisində bu vərdişlər həyəcan siqnalları və qayıq təlimləri ilə möhkəmləndirilir.

## STCW və Təcrübə jurnalı

Gəmidə təcrübə STCW Konvensiyasına əsaslanır. Hər tələbə rəsmi Təcrübə jurnalı (Training Record Book) aparır; qeydləri kapitan və ya baş mexanik imzalayır. İşçi diplomu (Certificate of Competency) üçün tələb olunan üzmə stajı real gəmilərdə toplanır — ixtisaslar üzrə minimum: [Təcrübə (praktika)](/sehife/tecrube-haqqinda).

Azərbaycan IMO-nun STCW üzrə «Ağ siyahı»sına daxildir.

## Digər təcrübə bazaları

Tələbələr ASCO-nun digər gəmilərində və Bakı Gəmiqayırma Zavodunda da ixtisas fənlərini öyrənir, istehsalat təcrübəsi keçirlər.`,
    faq: [
      {
        question: 'Tədris gəmisində kimlər təcrübə keçir?',
        answer:
          'Konvensiya (STCW) ixtisaslarının tələbələri: dəniz naviqasiyası, gəmi energetik qurğularının istismarı, elektrik və elektronika mühəndisliyi və digər ixtisaslar.',
      },
      {
        question: 'Gəmiyə çıxmaq üçün hansı hazırlıq lazımdır?',
        answer: 'Dənizdə sağqalma, yanğınsöndürmə, ilk tibbi yardım və şəxsi təhlükəsizlik üzrə baza hazırlığı (STCW VI/1).',
      },
      {
        question: 'Təcrübə jurnalı nədir?',
        answer:
          'STCW üzrə üzmə stajını sənədləşdirən rəsmi jurnal. Gündəlik iş yazılır, kapitan və ya baş mexanik imzalayır; jurnal işçi diplomu üçün lazımdır.',
      },
    ],
    sideLinks: [TECRUBE, LAB, TTM, ASCO],
    contact: CONTACT_PRACTICE_AZ,
  },
  en: {
    title: 'Training Ship',
    lead:
      "General Asadov has been ADDA's training ship since 2015. Students of the STCW (convention) programmes take theory and practical classes and part of their production practice here — in real shipboard conditions.",
    seoDescription:
      "ADDA's training ship General Asadov: particulars, teaching and practice on board, safety drills, the Training Record Book, STCW requirements.",
    stepsTitle: 'How practice on board works',
    facts: [
      { label: 'Ship', value: 'General Asadov', icon: 'gemi' },
      { label: 'Training ship since', value: '15 September 2015', icon: 'tarix' },
      { label: 'Built', value: '1983', icon: 'tarix' },
      { label: 'Dimensions', value: '73.92 × 14.82 m', icon: 'diger' },
      { label: 'IMO number', value: '8128183', icon: 'sened' },
    ],
    steps: [
      { title: 'Preparation', who: 'Academy', body: 'Basic safety training before going on board: personal survival, fire fighting, first aid, personal safety.' },
      { title: 'Drills on board', who: 'Ship crew', body: 'Alarm and boat drills are held regularly — safety habits are built by repetition.' },
      { title: 'At the workstations', who: 'Bridge, engine room', body: 'Hands-on work with navigation equipment, ship machinery and control systems.' },
      { title: 'Training Record Book', who: 'Master or chief engineer', body: 'Daily work is entered in the Training Record Book and signed.' },
    ],
    body: `## Ships

- **General Asadov** — a passenger ship on ASCO's balance; ADDA's training ship since 15 September 2015. Built in 1983, IMO number 8128183, length 73.92 m, breadth 14.82 m. Designed for 577 passengers, adapted for seafarer training.
- **Sabit Orujov** — a passenger ship used for training since 2017.

## What students learn on board

Students of Marine Navigation Engineering, Marine Power Plant Operation Engineering, Electrical and Electronics Engineering and other programmes apply theory in real working conditions:

- navigation equipment and bridge operations;
- ship machinery and power plants;
- control and electrical systems.

Students also see how the ISM (safety management) and ISPS (ship and port facility security) codes are applied on board.

## Safety

Before practice students must hold basic certificates in personal survival, fire fighting, first aid and personal safety. On the training ship these skills are reinforced through alarm and boat drills.

## STCW and the Training Record Book

Practice on board is based on the STCW Convention. Every student keeps an official Training Record Book signed by the master or chief engineer. The seagoing service required for a certificate of competency is gained on real ships — minimums by programme: [Practical Training](/sehife/tecrube-haqqinda).

Azerbaijan is on the IMO STCW "White List".

## Other training bases

Students also study and complete production practice on other ASCO vessels and at Baku Shipyard.`,
    faq: [
      {
        question: 'Who trains on the training ship?',
        answer: 'Students of the STCW programmes: marine navigation, marine power plant operation, electrical and electronics engineering and others.',
      },
      {
        question: 'What preparation is needed before going on board?',
        answer: 'Basic training in personal survival, fire fighting, first aid and personal safety (STCW VI/1).',
      },
      {
        question: 'What is the Training Record Book?',
        answer:
          'The official book documenting seagoing service under STCW. Daily work is entered and signed by the master or chief engineer; it is required for the certificate of competency.',
      },
    ],
    sideLinks: [
      { label: 'Practical Training', url: '/sehife/tecrube-haqqinda' },
      { label: 'Laboratories and simulators', url: '/auditoriyalar' },
      { label: 'STCW courses — Training Centre', url: '/struktur/telim-tedris-merkezi' },
      { label: 'ASCO', url: 'https://asco.az' },
    ],
    contact: CONTACT_PRACTICE_EN,
  },
  ru: {
    title: 'Учебное судно',
    lead:
      '«Генерал Асадов» с 2015 года — учебное судно ADDA. Студенты конвенционных специальностей (ПДНВ) проходят здесь теоретические и практические занятия и часть производственной практики — в реальных судовых условиях.',
    seoDescription:
      'Учебное судно ADDA «Генерал Асадов»: характеристики, обучение и практика на борту, учения по безопасности, Книга регистрации подготовки, требования ПДНВ.',
    stepsTitle: 'Как проходит практика на судне',
    facts: [
      { label: 'Судно', value: '«Генерал Асадов»', icon: 'gemi' },
      { label: 'Учебное судно', value: 'с 15 сентября 2015 г.', icon: 'tarix' },
      { label: 'Год постройки', value: '1983', icon: 'tarix' },
      { label: 'Размеры', value: '73,92 × 14,82 м', icon: 'diger' },
      { label: 'Номер ИМО', value: '8128183', icon: 'sened' },
    ],
    steps: [
      { title: 'Подготовка', who: 'Академия', body: 'До выхода на судно — начальная подготовка по безопасности: выживание на море, борьба с пожаром, первая помощь, личная безопасность.' },
      { title: 'Учения на борту', who: 'Экипаж', body: 'Регулярно проводятся тревоги и шлюпочные учения — навыки безопасности закрепляются повторением.' },
      { title: 'На рабочих местах', who: 'Мостик, машинное отделение', body: 'Работа с навигационным оборудованием, судовыми механизмами и системами управления в реальных условиях.' },
      { title: 'Книга регистрации подготовки', who: 'Капитан или старший механик', body: 'Ежедневная работа записывается в Книгу регистрации подготовки и подписывается.' },
    ],
    body: `## Суда

- **«Генерал Асадов»** — пассажирское судно на балансе ASCO; с 15 сентября 2015 года — учебное судно студентов ADDA. Построено в 1983 году, номер ИМО 8128183, длина 73,92 м, ширина 14,82 м. По проекту рассчитано на 577 пассажиров, адаптировано для подготовки моряков.
- **«Сабит Оруджев»** — пассажирское судно, используется в обучении с 2017 года.

## Чему учатся на борту

Студенты специальностей «Инженерия морской навигации», «Инженерия эксплуатации судовых энергетических установок», «Электротехника и электроника» и других применяют теорию в реальных условиях:

- навигационное оборудование и работа мостика;
- судовые механизмы и энергетические установки;
- системы управления и электрооборудование.

Студенты видят, как на судне применяются кодексы МКУБ (ISM) и ОСПС (ISPS).

## Безопасность

До начала практики у студентов должны быть базовые сертификаты по выживанию на море, борьбе с пожаром, первой помощи и личной безопасности. На учебном судне эти навыки закрепляются тревогами и шлюпочными учениями.

## ПДНВ и Книга регистрации подготовки

Практика на судне основана на Конвенции ПДНВ. Каждый студент ведёт официальную Книгу регистрации подготовки (Training Record Book), записи подписывает капитан или старший механик. Плавательный ценз для рабочего диплома набирается на реальных судах — минимумы по специальностям: [Практика](/sehife/tecrube-haqqinda).

Азербайджан входит в «Белый список» ИМО по ПДНВ.

## Другие базы практики

Студенты также изучают специальные дисциплины и проходят производственную практику на других судах ASCO и на Бакинском судостроительном заводе.`,
    faq: [
      {
        question: 'Кто проходит практику на учебном судне?',
        answer: 'Студенты конвенционных (ПДНВ) специальностей: морская навигация, эксплуатация судовых энергетических установок, электротехника и электроника и другие.',
      },
      {
        question: 'Какая подготовка нужна до выхода на судно?',
        answer: 'Начальная подготовка по выживанию на море, борьбе с пожаром, первой помощи и личной безопасности (ПДНВ VI/1).',
      },
      {
        question: 'Что такое Книга регистрации подготовки?',
        answer:
          'Официальная книга, подтверждающая плавательный ценз по ПДНВ. Ежедневная работа записывается и подписывается капитаном или старшим механиком; книга нужна для рабочего диплома.',
      },
    ],
    sideLinks: [
      { label: 'Практика', url: '/sehife/tecrube-haqqinda' },
      { label: 'Лаборатории и тренажёры', url: '/auditoriyalar' },
      { label: 'Курсы ПДНВ — Учебно-тренировочный центр', url: '/struktur/telim-tedris-merkezi' },
      { label: 'ASCO', url: 'https://asco.az' },
    ],
    contact: CONTACT_PRACTICE_RU,
  },
};

// ── 3. İxtisasartırma və xaricdə təhsil ─────────────────────────────────────
const XARICDE_PAGE: TehsilPageSeed = {
  slug: 'xaricde-tehsil-ve-ixtisasartirma',
  dataBlock: 'yox',
  az: {
    title: 'İxtisasartırma və xaricdə təhsil',
    lead:
      'Məzun və dənizçilər üçün iki yol: Təlim-Tədris Mərkəzində STCW kursları ilə ixtisasartırma və ASCO-nun Təqaüd Proqramı ilə xarici dənizçilik universitetlərində magistr təhsili.',
    seoDescription:
      'ADDA: STCW kursları ilə ixtisasartırma, ASCO-nun Gəmiçilikdə Təqaüd Proqramı (Dünya Dənizçilik Universiteti), şərtlər, sənədlər, beynəlxalq tərəfdaşlar.',
    stepsTitle: 'Təqaüd proqramına yol',
    facts: [
      { label: 'Təqaüd proqramı', value: '2016-cı ildən', icon: 'tarix' },
      { label: 'Maliyyələşdirir', value: 'ASCO', icon: 'haqq' },
      { label: 'Öhdəlik', value: '5 il ASCO-da iş', icon: 'sened' },
      { label: 'STCW kursları', value: 'Təlim-Tədris Mərkəzi', icon: 'diplom' },
    ],
    steps: [
      {
        title: 'Dil sertifikatı və qəbul',
        who: 'Namizəd',
        body: 'Xarici universitetin tələb etdiyi dil sertifikatı (məs., IELTS) və həmin universitetdən qəbul sənədi.',
      },
      {
        title: 'Sənədlərin təqdimi',
        who: 'ASCO',
        body: 'Aşağıdakı siyahı üzrə sənədlər: diplom və əlavəsi, dil sertifikatı, tövsiyə məktubları və s.',
      },
      {
        title: 'Müsabiqə',
        who: 'ASCO və ADDA',
        body: '2017-ci ildə seçim dil imtahanının (IELTS) və Akademiyanın daxili imtahanlarının nəticələri ilə aparılıb.',
      },
      { title: 'Xaricdə təhsil', who: 'ASCO maliyyələşdirir', body: 'Təhsil xərclərini ASCO ödəyir.' },
      { title: 'Qayıdış', who: 'ASCO', body: 'Təhsildən sonra 5 il ASCO-da işləmək öhdəliyi.' },
    ],
    body: `## İxtisasartırma: STCW kursları

Dənizçilər STCW sertifikatlarını almaq, yeniləmək və ixtisasını artırmaq üçün Akademiyanın [Təlim-Tədris Mərkəzinə](/struktur/telim-tedris-merkezi) müraciət edir. Mərkəzdə 50-dən çox kurs keçirilir: baza təhlükəsizlik hazırlığı, kapitan körpüsü və maşın şöbəsinin resurslarının idarə olunması, ECDIS, GMDSS, tanker və sərnişin gəmiləri üzrə hazırlıq, gəmi mühafizəsi, dinamik mövqe saxlama (DP) və başqaları.

STCW üzrə bəzi sertifikatlar (məsələn, baza təhlükəsizlik, xilasedici qayıq və sallar, geniş proqram üzrə yanğınla mübarizə) hər 5 ildən bir təkmilləşdirmə kursu ilə təsdiqlənir.

## ASCO-nun Təqaüd Proqramı

«Azərbaycan Xəzər Dəniz Gəmiçiliyi» QSC (ASCO) 2016-cı ildə Gəmiçilikdə Təqaüd Proqramını təsis edib. Məqsəd — istedadlı gənclərin dənizçilik sahəsində aparıcı xarici universitetlərdə təhsil almasıdır. Proqram təsis olunanda hər il 2 gəncin ASCO-nun vəsaiti hesabına xaricdə təhsil alması nəzərdə tutulub.

**Namizədlərə tələblər:**

- bakalavr dərəcəsi;
- seçilmiş xarici universitetin tələb etdiyi xarici dil biliyi;
- təhsildən sonra Azərbaycana qayıdıb 5 il ASCO-da işləmək öhdəliyi.

**Sənədlər:**

1. Xarici ali təhsil müəssisəsinə qəbul sənədi
2. Dil sertifikatı
3. Qəbul imtahanının (DİM, keçmiş TQDK) balı haqqında arayış
4. Ümumvətəndaş pasportu
5. Diplom və əlavəsi
6. Məzun olduğunuza dair arayış
7. Hazırda təhsil aldığınıza dair arayış (tələbədirsə)
8. Tövsiyə məktubları
9. Hərbi bilet və ya hərbi möhlət hüququ haqqında sənəd
10. Sağlamlıq haqqında arayış
11. CV və tərcümeyi-hal

Yeni müsabiqə və cari şərtlər barədə ASCO-dan məlumat alın.

## Proqramın iştirakçıları

2017-ci ildə ADDA məzunları Nərminə Cabbarova və Aqşin Muxtarov müsabiqədən keçərək (IELTS 6.5 və Akademiyanın daxili imtahanları) İsveçin Malmö şəhərindəki Dünya Dənizçilik Universitetinin (World Maritime University, IMO tərəfindən təsis olunub) «Dəniz daşımalarının idarə olunması və loqistika» ixtisası üzrə 14 aylıq magistr proqramına qəbul olunublar. Təhsil xərclərini ASCO ödəyib.

- [Dünya Dənizçilik Universitetində magistr təhsili alacaq iki tələbənin bütün xərclərini Gəmiçilik ödəyəcək](/xeberler/dunya-denizcilik-universitetinde-magistr-tehsili-alacaq-iki-telebenin-butun-xerc) — 10 mart 2017
- [Məzunumuz Dünya Dənizçilik Universitetindəki təhsili ilə bağlı təəssüratları ilə bölüşüb](/xeberler/mezunumuz-dunya-denizcilik-universitetindeki-tehsili-ile-bagli-teessuratlari-ile)
- [Daha bir məzunumuzun xaricdə təhsil uğuru](/xeberler/daha-bir-mezunumuzun-xaricde-tehsil-uguru) — 13 noyabr 2017

## Beynəlxalq tərəfdaşlar

ADDA xarici universitet və təşkilatlarla əməkdaşlıq memorandumları imzalayıb:

- [Türkiyənin Piri Reis Universiteti — strateji əməkdaşlıq](/xeberler/azerbaycan-dovlet-deniz-akademiyasi-ve-turkiyenin-piri-reis-universiteti-arasind)
- [Ukraynanın Milli Nəqliyyat Universiteti](/xeberler/azerbaycan-dovlet-deniz-akademiyasi-ile-ukraynanin-milli-neqliyyat-universiteti)
- [Qazaxıstanlı tərəfdaşlar — tələbə və müəllim mobilliyi](/xeberler/qazaxistanli-terefdaslarla-yeni-memorandum-imzalanib)
- [İstanbul Universiteti-Cerrahpaşa](/xeberler/adda-numayende-heyeti-istanbul-universiteti-cerrahpasada-seferde-olub)
- [Harbin Mühəndislik Universiteti (Çin)](/xeberler/harbin-muhendislik-universitetinin-numayende-heyeti-adda-da-seferde-olub) — 2026
- [GIZ EasTnT](/xeberler/adda-ve-giz-eastnt-arasinda-emekdasliga-dair-anlasma-memorandumu-imzalandi)

Bütün istiqamətlər: [Beynəlxalq əməkdaşlıq](/sehife/beynelxalq-emekdasliq).`,
    faq: [
      {
        question: 'Təqaüd proqramına kimlər müraciət edə bilər?',
        answer:
          'Bakalavr dərəcəsi olan, xarici universitetin tələb etdiyi dili bilən və təhsildən sonra 5 il ASCO-da işləməyə razı olan gənclər.',
      },
      {
        question: 'Təhsil xərclərini kim ödəyir?',
        answer: 'ASCO. 2017-ci ildə Dünya Dənizçilik Universitetinə qəbul olunan iki ADDA məzununun bütün təhsil xərclərini ASCO ödəyib.',
      },
      {
        question: 'STCW sertifikatımın müddəti bitir — hara müraciət edim?',
        answer: 'Akademiyanın Təlim-Tədris Mərkəzinə: təkmilləşdirmə və ixtisasartırma kursları orada keçirilir.',
      },
    ],
    sideLinks: [
      TTM,
      { label: 'Beynəlxalq əməkdaşlıq', url: '/sehife/beynelxalq-emekdasliq' },
      { label: 'World Maritime University', url: 'https://www.wmu.se' },
      ASCO,
    ],
    contact:
      '**STCW kursları** — [Təlim-Tədris Mərkəzi](/struktur/telim-tedris-merkezi): (+99412) 404 39 46, (+99412) 404 39 47\n\n' +
      'Sualınızı [onlayn göndərin](/vetendaslarin-muracieti?istiqamet=telim).',
  },
};

// ── 4. Kitabxana və elektron resurslar ───────────────────────────────────────
const KITABXANA_PAGE: TehsilPageSeed = {
  slug: 'elektron-kitabxana',
  dataBlock: 'yox',
  az: {
    title: 'Kitabxana və elektron resurslar',
    lead:
      'ADDA kitabxanasının əsası 1893-cü ildə qoyulub: fondda Azərbaycan, rus və ingilis dillərində 53 mindən çox kitab var. Dərs materialları və elektron kitabxana tələbənin Elektron Akademiyadakı kabinetindədir.',
    seoDescription:
      'ADDA kitabxanası: fond, qiraət və kompüter zalları, Elektron Akademiyada elektron kitabxana, açıq elektron resurslar, kitabxanalararası abonement.',
    stepsTitle: 'Kitab və material necə tapılır',
    facts: [
      { label: 'Əsası', value: '1893', icon: 'tarix' },
      { label: 'Fond', value: '53 526 kitab', icon: 'kitab' },
      { label: 'Dillər', value: 'Azərbaycan, rus, ingilis', icon: 'dil' },
      { label: 'Zallar', value: 'Qiraət və kompüter zalı', icon: 'bina' },
    ],
    steps: [
      {
        title: 'Elektron Akademiya',
        who: 'Tələbə kabineti',
        body: 'Müəllimin yerləşdirdiyi mühazirə və seminar materialları, tapşırıqlar və elektron kitabxana.',
      },
      {
        title: 'Kataloq',
        who: 'Kitabxana',
        body: 'Kitab elektron və ənənəvi əlifba kataloqundan, mövzu üzrə — sistemli kataloqdan (UOT) tapılır.',
      },
      {
        title: 'Qiraət və kompüter zalı',
        who: 'Kitabxana',
        body: 'Nəşrlərlə zalda iş, kompüter zalında elektron resurslardan istifadə.',
      },
      {
        title: 'Kitabxanalararası abonement',
        who: 'Tərəfdaş kitabxanalar',
        body: 'Kitab fondda yoxdursa, kitabxanalararası abonement və internet vasitəsilə tapılır.',
      },
    ],
    body: `## Fond

Fondda dərsliklər, elmi əsərlər, dissertasiyalar, patent ədəbiyyatı, dövri nəşrlər, nadir və qədim kitablar, xarici nəşrlər var. Nəşrlər ayrı zallarda UOT üzrə yerləşdirilib:

- rus dilində tədris ədəbiyyatı;
- Azərbaycan dilində əsas tədris ədəbiyyatı;
- ictimai-siyasi ədəbiyyat;
- bədii ədəbiyyat;
- nadir kitablar;
- xarici ədəbiyyat;
- elmi əsərlər;
- dövri nəşrlər.

Kitabxana tədris planları və elmi mövzularla tanış olur, yeni nəşrlər barədə kafedralara tövsiyə siyahıları hazırlayır; fond oxucu sorğularının nəticələrinə görə komplektləşdirilir.

## Elektron resurslar

**Elektron Akademiya.** 2021/2022-ci tədris ilindən işləyən Elektron Akademiyada hər tələbənin kabineti var: müəllimin yerləşdirdiyi mühazirə və seminar materialları, kurs və sərbəst işlərin tapşırıqları, elektron kitabxana.

**Açıq resurslar** (pulsuz):

- [WMU Maritime Commons](https://commons.wmu.se) — Dünya Dənizçilik Universitetinin açıq elmi arxivi;
- [DOAJ](https://doaj.org) — açıq girişli elmi jurnalların kataloqu;
- [IMO](https://www.imo.org) — konvensiyalar və məcəllələr haqqında rəsmi məlumat;
- [Azərbaycan Milli Kitabxanası](https://www.anl.az) — elektron kataloq.

2016-cı ilin fevralında S. O. Makarov adına Dövlət Dəniz və Çay Yolları Universiteti (Sankt-Peterburq) ADDA kitabxanasına öz elektron kitabxanasına pulsuz giriş icazəsi verib.

## Xidmətlər

- **Qiraət zalı** — oxucunun sorğusuna uyğun ədəbiyyatla xidmət.
- **Kompüter zalı** — elektron kataloq və informasiya texnologiyalarından istifadə.
- **Məlumat-biblioqrafiya xidməti** — mövzu üzrə ədəbiyyat siyahısı, UOT üzrə məlumat.
- **Kitabxanalararası abonement** — fondda olmayan nəşrin tərəfdaş kitabxanalardan tapılması.

## Tərəfdaş kitabxanalar

- M. F. Axundov adına Azərbaycan Milli Kitabxanası
- AMEA-nın əsas kitabxanası
- Azərbaycan Texniki Universitetinin kitabxanası
- Azərbaycan Dövlət Neft və Sənaye Universitetinin kitabxanası
- Milli Aviasiya Akademiyasının kitabxanası
- S. O. Makarov adına Dövlət Dəniz və Çay Yolları Universitetinin kitabxanası

## Tarix

Azərbaycanda dənizçi kadr hazırlığı 1881-ci ildə başlayıb: dənizçi sinifləri, mexanika kursları, sonra Bakı Dəniz Yolları məktəbinin zəngin kitabxanası olub. 1996-cı ildə Nazirlər Kabinetinin 15 iyul tarixli 91 saylı qərarı ilə Akademiya yaradılanda kitabxana onun strukturuna uyğunlaşdırılıb. 2015-ci ildən kitabxana [İnformasiya resurs mərkəzinin](/struktur/informasiya-resurs-merkezi) tərkibindədir; 2016-cı ildə əsaslı təmir olunub, yeni mebel və kompüter texnikası ilə təchiz edilib.`,
    faq: [
      { question: 'Elektron kitabxanaya necə daxil olum?', answer: 'Elektron Akademiyadakı tələbə kabinetinizdən.' },
      {
        question: 'Lazım olan kitab fondda yoxdursa?',
        answer: 'Kitabxana kitabxanalararası abonement və tərəfdaş kitabxanalar vasitəsilə tapmağa kömək edir.',
      },
      {
        question: 'Kitabxana hansı bölmənin tərkibindədir?',
        answer: 'İnformasiya resurs mərkəzinin (İRM). Heyət və əlaqə — İRM-in səhifəsində.',
      },
    ],
    sideLinks: [
      IRM,
      { label: 'WMU Maritime Commons', url: 'https://commons.wmu.se' },
      { label: 'DOAJ — açıq jurnallar', url: 'https://doaj.org' },
      { label: 'Azərbaycan Milli Kitabxanası', url: 'https://www.anl.az' },
      { label: 'IMO', url: 'https://www.imo.org' },
    ],
    contact: '**Kitabxana** — [İnformasiya resurs mərkəzi](/struktur/informasiya-resurs-merkezi)',
  },
};

// ── 5. Keyfiyyət və nəticələr ────────────────────────────────────────────────
const KEYFIYYET_PAGE: TehsilPageSeed = {
  slug: 'keyfiyyetin-monitorinqi',
  dataBlock: 'yox',
  az: {
    title: 'Keyfiyyət və nəticələr',
    lead:
      'ADDA-da keyfiyyət sistemi beynəlxalq və milli standartlara əsaslanır: 2002-ci ildən ISO 9001, dənizçi hazırlığında STCW, Təlim-Tədris Mərkəzində ABS, Bureau Veritas və The Nautical Institute sertifikatları. ' +
      'Burada sertifikatlar, daxili monitorinq və nəticələrin dərc olunduğu yerlər toplanıb.',
    seoDescription:
      'ADDA-da keyfiyyət: ISO 9001 (2002-dən), STCW «Ağ siyahı», ABS, Bureau Veritas, The Nautical Institute; daxili monitorinq, nəticələr, rəy bildirmək.',
    stepsTitle: 'Daxili monitorinq necə aparılır',
    facts: [
      { label: 'ISO 9001', value: '2002-ci ildən', icon: 'sened' },
      { label: 'Hazırkı standart', value: 'ISO 9001:2015', icon: 'diplom' },
      { label: 'STCW «Ağ siyahı»', value: 'Azərbaycan daxildir', icon: 'qoruma' },
      { label: 'ABS sertifikatı', value: '2016', icon: 'diplom' },
    ],
    steps: [
      {
        title: 'Tədris sənədləri',
        who: 'Kafedralar, Tədris ofisi',
        body:
          'Tədris və işçi tədris planları Elmi Şurada təsdiqlənir; sillabus, təqvim planları, fənn proqramları, dərslik və dərs vəsaitlərinin mövcudluğu yoxlanılır.',
      },
      {
        title: 'Dərslərin müşahidəsi',
        who: 'Kafedralar',
        body: 'Açıq dərslər və qarşılıqlı dərs dinləmələri qrafik üzrə keçirilir.',
      },
      {
        title: 'İmtahan nəticələri',
        who: 'Fakültələr, Tədris ofisi',
        body: 'İmtahan sessiyalarının və buraxılış işlərinin nəticələri toplanır, ümumiləşdirilir və müzakirə olunur.',
      },
      { title: 'Tədris intizamı', who: 'Tədris ofisi', body: 'Tədris intizamına nəzarət edilir, nəticələr rəhbərliyə təqdim olunur.' },
      {
        title: 'Rəy və müraciətlər',
        who: 'Tələbələr, valideynlər, ictimaiyyət',
        body: 'Hər səhifədə «Düzəliş təklif et» və onlayn müraciət forması; müraciətə yazılı cavab verilir.',
        linkLabel: 'Onlayn müraciət',
        linkUrl: '/vetendaslarin-muracieti?istiqamet=tedris',
      },
    ],
    body: `## Keyfiyyət siyasəti

Akademiyada keyfiyyət siyasəti tədris, təlim-trenajor mərkəzləri və dəniz nəqliyyatı mütəxəssislərinin hazırlığı üzrə xidmətlərə qoyulan beynəlxalq və milli standartların şərtsiz yerinə yetirilməsinə əsaslanır və işin bütün səviyyələrini əhatə edir.

## Sertifikatlar və tanınma

| İl | Sertifikat | Əhatə |
|---|---|---|
| 2002, oktyabr | ISO 9001:2000 | Dənizçi mütəxəssislərin hazırlanmasında keyfiyyət menecmenti sistemi |
| 2010 | ISO 9001:2008 | Eyni sistem, standartın yeni versiyası |
| 2016, fevral | ABS uyğunluq sertifikatı | Dənizçilərin hazırlanması və sertifikatlandırılması mərkəzi — ABS-in tədris müəssisələri və təlim kursları standartları üzrə beynəlxalq audit |
| 2018, fevral | ISO 9001:2015 | Keyfiyyət menecmenti sistemi (hazırkı versiya) |

**Təlim-Tədris Mərkəzi** ISO 9001:2015 üzrə Bureau Veritas tərəfindən audit olunub və sertifikatlaşdırılıb; təlimləri Dövlət Dəniz Agentliyi və Amerika Gəmiçilik Bürosu (ABS) akkreditasiya edib. The Nautical Institute (Böyük Britaniya) Mərkəzin dinamik mövqe saxlama (DP) simulyatorunu sertifikatlaşdırıb. Ətraflı: [Təlim-Tədris Mərkəzi](/struktur/telim-tedris-merkezi).

**STCW.** Azərbaycan IMO-nun STCW üzrə «Ağ siyahı»sındadır (MSC.1/Circ.1164): Konvensiyanı tam həyata keçirdiyi təsdiqlənib. Bu, ölkədə verilən dənizçi diplomlarının digər dövlətlərdə tanınmasının əsasıdır.

## Kim cavabdehdir

Tədrisin keyfiyyətinin monitorinqi [Tədris proseslərinin təşkili şöbəsinin](/struktur/tedris-proseslerinin-teskili-sobesi) işinin bir hissəsidir; şöbədə keyfiyyət təminatı və monitorinq üzrə mütəxəssislər çalışır. Tədris və işçi tədris planları Akademiyanın [Elmi Şurasında](/struktur/elmi-sura) təsdiqlənir.

## Nəticələr: harada baxmalı

- [Keçid balları, yer sayı və təhsil haqqı](/sehife/kecid-ballari) — pillələr və illər üzrə qəbul nəticələri;
- [Məzunların işlə təminatı](/sehife/mezunlarin-isle-teminati) — məzunlar harada işləyir;
- [Rəqəmlər və faktlar](/sehife/reqemler-ve-faktlar);
- [İxtisaslar](/ixtisaslar) — hər proqramın təsviri və tədris planı.

## Rəy bildirin

Tədrisin keyfiyyəti barədə təklif və şikayətinizi [onlayn göndərin](/vetendaslarin-muracieti?istiqamet=tedris) — müraciətə yazılı cavab verilir. Saytdakı səhv məlumat üçün hər səhifənin altında «Düzəliş təklif et» var.`,
    faq: [
      {
        question: 'Sertifikatlar nəyi göstərir?',
        answer:
          'ISO 9001 — Akademiyanın keyfiyyət menecmenti sisteminin beynəlxalq standarta uyğunluğu (2002-ci ildən, 2018-dən ISO 9001:2015). ABS, Bureau Veritas və The Nautical Institute sertifikatları dənizçi hazırlığına və Təlim-Tədris Mərkəzinin kurslarına aiddir.',
      },
      {
        question: 'Azərbaycanda verilən dənizçi diplomu xaricdə tanınırmı?',
        answer:
          'Azərbaycan STCW üzrə «Ağ siyahı»dadır. Bu, digər dövlətlərin Azərbaycan diplomlarını STCW-nin I/10 qaydası ilə tanıması üçün əsasdır; tanınmanı hər dövlətin dəniz administrasiyası təsdiqləyir.',
      },
      {
        question: 'Tədrislə bağlı şikayəti hara yazım?',
        answer:
          'Onlayn müraciət formasında «Tədris prosesi və sənədlər» istiqamətini seçin — müraciət Tədris proseslərinin təşkili şöbəsinə gedir və yazılı cavablandırılır.',
      },
    ],
    sideLinks: [
      { label: 'Təlim-Tədris Mərkəzi', url: '/struktur/telim-tedris-merkezi' },
      OFIS,
      { label: 'Keçid balları, yer sayı və təhsil haqqı', url: '/sehife/kecid-ballari' },
      { label: 'Məzunların işlə təminatı', url: '/sehife/mezunlarin-isle-teminati' },
      { label: 'IMO: STCW Konvensiyası', url: STCW_URL },
    ],
    contact:
      '**Keyfiyyət təminatı və monitorinq** — [Tədris proseslərinin təşkili şöbəsi](/struktur/tedris-proseslerinin-teskili-sobesi)\n\n' +
      `**Telefon:** ${OFIS_PHONE}`,
  },
  en: {
    title: 'Quality and Outcomes',
    lead:
      "ADDA's quality system rests on international and national standards: ISO 9001 since 2002, STCW in seafarer training, ABS, Bureau Veritas and The Nautical Institute certification at the Training Centre. " +
      'This page brings together certificates, internal monitoring and where results are published.',
    seoDescription:
      'Quality at ADDA: ISO 9001 since 2002, the STCW White List, ABS, Bureau Veritas, The Nautical Institute; internal monitoring, results and feedback.',
    stepsTitle: 'How internal monitoring works',
    facts: [
      { label: 'ISO 9001', value: 'since 2002', icon: 'sened' },
      { label: 'Current standard', value: 'ISO 9001:2015', icon: 'diplom' },
      { label: 'STCW White List', value: 'Azerbaijan included', icon: 'qoruma' },
      { label: 'ABS certificate', value: '2016', icon: 'diplom' },
    ],
    steps: [
      {
        title: 'Teaching documents',
        who: 'Departments, Academic Process Department',
        body: 'Curricula are approved by the Academic Council; syllabi, schedules, course programmes, textbooks and teaching aids are checked.',
      },
      { title: 'Class observation', who: 'Departments', body: 'Open lessons and peer observation follow a schedule.' },
      {
        title: 'Examination results',
        who: 'Faculties, Academic Process Department',
        body: 'Results of examination sessions and graduation projects are collected, summarised and discussed.',
      },
      { title: 'Academic discipline', who: 'Academic Process Department', body: 'Academic discipline is monitored and reported to the management.' },
      {
        title: 'Feedback and appeals',
        who: 'Students, parents, the public',
        body: '"Suggest a correction" on every page and the online appeal form; every appeal receives a written reply.',
        linkLabel: 'Online appeal',
        linkUrl: '/vetendaslarin-muracieti?istiqamet=tedris',
      },
    ],
    body: `## Quality policy

The Academy's quality policy is based on strict compliance with international and national standards for education, training and simulator centres and the training of maritime transport specialists, and covers all levels of work.

## Certificates and recognition

| Year | Certificate | Scope |
|---|---|---|
| 2002, October | ISO 9001:2000 | Quality management system in seafarer training |
| 2010 | ISO 9001:2008 | Same system, new version of the standard |
| 2016, February | ABS certificate of compliance | Seafarer training and certification centre — international audit against ABS standards for training institutions and courses |
| 2018, February | ISO 9001:2015 | Quality management system (current version) |

The **Training Centre** was audited and certified by Bureau Veritas to ISO 9001:2015; its courses are accredited by the State Maritime Agency and the American Bureau of Shipping (ABS). The Nautical Institute (UK) certified the Centre's dynamic positioning (DP) simulator. Details: [Training Centre](/struktur/telim-tedris-merkezi).

**STCW.** Azerbaijan is on the IMO STCW "White List" (MSC.1/Circ.1164): it has been confirmed to give full and complete effect to the Convention — the basis for recognition of Azerbaijani seafarer certificates by other states.

## Who is responsible

Monitoring of teaching quality is part of the work of the [Academic Process Department](/struktur/tedris-proseslerinin-teskili-sobesi), which has quality assurance and monitoring specialists. Curricula are approved by the Academy's [Academic Council](/struktur/elmi-sura).

## Results: where to look

- [Passing scores, places and tuition fees](/sehife/kecid-ballari) — admission results by level and year;
- [Graduate employment](/sehife/mezunlarin-isle-teminati) — where graduates work;
- [Facts and figures](/sehife/reqemler-ve-faktlar);
- [Programmes](/ixtisaslar) — description and curriculum of every programme.

## Give feedback

Send suggestions or complaints about teaching quality [online](/vetendaslarin-muracieti?istiqamet=tedris) — every appeal receives a written reply. To report wrong information on the site, use "Suggest a correction" at the bottom of every page.`,
    faq: [
      {
        question: 'What do the certificates show?',
        answer:
          "ISO 9001 — conformity of the Academy's quality management system with the international standard (since 2002; ISO 9001:2015 since 2018). The ABS, Bureau Veritas and Nautical Institute certificates relate to seafarer training and the Training Centre's courses.",
      },
      {
        question: 'Are Azerbaijani seafarer certificates recognised abroad?',
        answer:
          'Azerbaijan is on the STCW White List. This is the basis for other states to recognise Azerbaijani certificates under STCW regulation I/10; recognition is confirmed by each state’s maritime administration.',
      },
      {
        question: 'Where can I send a complaint about teaching?',
        answer: 'Use the online appeal form and choose "Academic process and documents" — it goes to the Academic Process Department and receives a written reply.',
      },
    ],
    sideLinks: [
      { label: 'Training Centre', url: '/struktur/telim-tedris-merkezi' },
      { label: 'Academic Process Department', url: '/struktur/tedris-proseslerinin-teskili-sobesi' },
      { label: 'Passing scores, places and fees', url: '/sehife/kecid-ballari' },
      { label: 'Graduate employment', url: '/sehife/mezunlarin-isle-teminati' },
      { label: 'IMO: STCW Convention', url: STCW_URL },
    ],
    contact:
      '**Quality assurance and monitoring** — [Academic Process Department](/struktur/tedris-proseslerinin-teskili-sobesi)\n\n' +
      `**Phone:** ${OFIS_PHONE}`,
  },
  ru: {
    title: 'Качество и результаты',
    lead:
      'Система качества ADDA основана на международных и национальных стандартах: ISO 9001 с 2002 года, ПДНВ в подготовке моряков, сертификаты ABS, Bureau Veritas и The Nautical Institute в Учебно-тренировочном центре. ' +
      'Здесь собраны сертификаты, внутренний мониторинг и ссылки на опубликованные результаты.',
    seoDescription:
      'Качество в ADDA: ISO 9001 с 2002 года, «Белый список» ПДНВ, ABS, Bureau Veritas, The Nautical Institute; внутренний мониторинг, результаты, обратная связь.',
    stepsTitle: 'Как проводится внутренний мониторинг',
    facts: [
      { label: 'ISO 9001', value: 'с 2002 года', icon: 'sened' },
      { label: 'Текущий стандарт', value: 'ISO 9001:2015', icon: 'diplom' },
      { label: '«Белый список» ПДНВ', value: 'Азербайджан входит', icon: 'qoruma' },
      { label: 'Сертификат ABS', value: '2016', icon: 'diplom' },
    ],
    steps: [
      {
        title: 'Учебная документация',
        who: 'Кафедры, учебный отдел',
        body: 'Учебные и рабочие планы утверждаются Учёным советом; проверяется наличие силлабусов, календарных планов, программ дисциплин, учебников и пособий.',
      },
      { title: 'Наблюдение занятий', who: 'Кафедры', body: 'Открытые занятия и взаимопосещения проводятся по графику.' },
      {
        title: 'Результаты экзаменов',
        who: 'Факультеты, учебный отдел',
        body: 'Результаты сессий и защит выпускных работ собираются, обобщаются и обсуждаются.',
      },
      { title: 'Учебная дисциплина', who: 'Учебный отдел', body: 'Контроль учебной дисциплины, отчёты руководству.' },
      {
        title: 'Отзывы и обращения',
        who: 'Студенты, родители, общественность',
        body: '«Предложить исправление» на каждой странице и онлайн-форма обращения; на обращение даётся письменный ответ.',
        linkLabel: 'Онлайн-обращение',
        linkUrl: '/vetendaslarin-muracieti?istiqamet=tedris',
      },
    ],
    body: `## Политика качества

Политика качества Академии основана на безусловном выполнении международных и национальных стандартов к обучению, учебно-тренажёрным центрам и подготовке специалистов морского транспорта и охватывает все уровни работы.

## Сертификаты и признание

| Год | Сертификат | Охват |
|---|---|---|
| 2002, октябрь | ISO 9001:2000 | Система менеджмента качества в подготовке моряков |
| 2010 | ISO 9001:2008 | Та же система, новая версия стандарта |
| 2016, февраль | Сертификат соответствия ABS | Центр подготовки и сертификации моряков — международный аудит по стандартам ABS для учебных заведений и курсов |
| 2018, февраль | ISO 9001:2015 | Система менеджмента качества (действующая версия) |

**Учебно-тренировочный центр** прошёл аудит Bureau Veritas и сертифицирован по ISO 9001:2015; его курсы аккредитованы Государственным морским агентством и Американским бюро судоходства (ABS). The Nautical Institute (Великобритания) сертифицировал тренажёр динамического позиционирования (DP) Центра. Подробнее: [Учебно-тренировочный центр](/struktur/telim-tedris-merkezi).

**ПДНВ.** Азербайджан входит в «Белый список» ИМО по ПДНВ (MSC.1/Circ.1164): подтверждено полное выполнение Конвенции. Это основа признания азербайджанских дипломов моряков другими государствами.

## Кто отвечает

Мониторинг качества обучения входит в работу [Отдела организации учебного процесса](/struktur/tedris-proseslerinin-teskili-sobesi), где работают специалисты по обеспечению качества и мониторингу. Учебные планы утверждает [Учёный совет](/struktur/elmi-sura) Академии.

## Результаты: где смотреть

- [Проходные баллы, места и стоимость обучения](/sehife/kecid-ballari) — итоги приёма по уровням и годам;
- [Трудоустройство выпускников](/sehife/mezunlarin-isle-teminati) — где работают выпускники;
- [Цифры и факты](/sehife/reqemler-ve-faktlar);
- [Специальности](/ixtisaslar) — описание и учебный план каждой программы.

## Обратная связь

Предложения и жалобы о качестве обучения [отправляйте онлайн](/vetendaslarin-muracieti?istiqamet=tedris) — на обращение даётся письменный ответ. Об ошибке на сайте сообщайте через «Предложить исправление» внизу каждой страницы.`,
    faq: [
      {
        question: 'Что подтверждают сертификаты?',
        answer:
          'ISO 9001 — соответствие системы менеджмента качества Академии международному стандарту (с 2002 года, с 2018 года — ISO 9001:2015). Сертификаты ABS, Bureau Veritas и The Nautical Institute относятся к подготовке моряков и курсам Учебно-тренировочного центра.',
      },
      {
        question: 'Признаются ли азербайджанские дипломы моряков за рубежом?',
        answer:
          'Азербайджан входит в «Белый список» ПДНВ. Это основа для признания азербайджанских дипломов другими государствами по правилу I/10 ПДНВ; признание подтверждает морская администрация каждого государства.',
      },
      {
        question: 'Куда направить жалобу по учебному процессу?',
        answer: 'В онлайн-форме обращения выберите «Учебный процесс и документы» — обращение поступит в Отдел организации учебного процесса, ответ будет письменным.',
      },
    ],
    sideLinks: [
      { label: 'Учебно-тренировочный центр', url: '/struktur/telim-tedris-merkezi' },
      { label: 'Отдел организации учебного процесса', url: '/struktur/tedris-proseslerinin-teskili-sobesi' },
      { label: 'Проходные баллы, места и стоимость', url: '/sehife/kecid-ballari' },
      { label: 'Трудоустройство выпускников', url: '/sehife/mezunlarin-isle-teminati' },
      { label: 'ИМО: Конвенция ПДНВ', url: STCW_URL },
    ],
    contact:
      '**Обеспечение качества и мониторинг** — [Отдел организации учебного процесса](/struktur/tedris-proseslerinin-teskili-sobesi)\n\n' +
      `**Телефон:** ${OFIS_PHONE}`,
  },
};

export const TEHSIL_PAGES: TehsilPageSeed[] = [TECRUBE_PAGE, GEMI_PAGE, XARICDE_PAGE, KITABXANA_PAGE, KEYFIYYET_PAGE];
export const TEHSIL_PAGE_SLUGS: string[] = TEHSIL_PAGES.map((p) => p.slug);
