/**
 * F5.47 — «Elm və innovasiya» menyusunun səhifələri: məzmun (yalnız məlumat,
 * məntiq src/utils/elm-pages.ts-dədir). Şablon: layout=elm (SectionPage —
 * F5.45-in sağ panelli şablonu, «Elm və innovasiya» qırıntısı və «Sual ver» →
 * Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsi).
 *
 * Quruluş HSE.ru «Наука» bölməsi ilə: kimlər və harada (istiqamətlər,
 * laboratoriyalar, şöbə) → nəticələr (jurnal, Elm Portalı, konfranslar) →
 * resurslar (qrantlar, gənc alimlər, doktorantura). Ruben və b. «A Guide for
 * Leaders in Higher Education» (EHE modeli): tədqiqatçının dili ilə, hər
 * mövzunun bir yeri, nəticə sübutla (il, rəqəm, mənbə).
 *
 * MƏNBƏLƏR (9 oktyabr 2026, yoxlanılıb):
 *   - saytın mövcud səhifələri (az/ru/en): «Elmi-tədqiqat fəaliyyəti»,
 *     «Elmi-tədqiqat laboratoriyaları», «Elmi jurnal», «Elmi jurnalımız onlayn
 *     versiyada», «Gənc Alimlər Şurası», «Elmi konfranslar», «V Avrasiya
 *     konfransı (RİSK-2023)» və «Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsi»;
 *   - ADDA xəbərləri: XII (04.05.2017), XVII (2022) və XX (02.05.2025)
 *     beynəlxalq konfrans; Elm Fondu qrantı (14.10.2024); Brandenburq TU
 *     (13.11.2025); tələbə konfransı (09.04.2026); «Akademik yazı və etika»
 *     (08.04.2026); TEC tədbirləri; Türk Loydu. F5.49: GIZ EasTnT səhifələrdən
 *     çıxarılıb (xəbər qalır) — src/utils/giz-clean.ts.
 *   - aef.gov.az/az/grant/view/54 (2024-cü il «Əsas qrant müsabiqəsi»);
 *   - ADDA Elm Portalı: cris.adda.edu.az.
 * Yoxlanılmayan və köhnələ bilən məlumat YAZILMAYIB: əməkdaş sayları (köhnə
 * səhifədə 2018-ci ilə aid idi), jurnalın redaksiya heyətinin adları və Gənc
 * Alimlər Şurasının sədri (rəhbərlik dəyişib — redaksiya təsdiq edəndən sonra
 * admində əlavə olunur; köhnə mətn store-da `elmPages:backup:…`-dədir),
 * CJMSE jurnal saytı (ISSN hələ yoxdur).
 */
import type { LinkSeed, QebulPageSeed } from './qebul-pages-content';

export type ElmPageSeed = QebulPageSeed;

// ── Təkrarlanan keçidlər ─────────────────────────────────────────────────────
export const ELM_HUB_SLUG = 'elmi-tedqiqat-fealiyyeti';
const HUB = `/sehife/${ELM_HUB_SLUG}`;
const OFFICE = '/struktur/elmi-tedqiqat-ve-beynelxalq-elaqeler-sobesi';
// F5.53 — ümumi nömrə + daxili nömrə, dilin formatında (src/utils/phone-fix.ts).
const OFFICE_PHONE_AZ = '(012) 493 36 44, daxili 3078';
const OFFICE_PHONE_EN = '+994 12 493 36 44, ext. 3078';
const OFFICE_PHONE_RU = '+994 12 493 36 44, доб. 3078';
const CRIS = 'https://cris.adda.edu.az';
const AEF = 'https://www.aef.gov.az';
const AEF_2024 = 'https://www.aef.gov.az/az/grant/view/54';
const ASK = '/vetendaslarin-muracieti?istiqamet=elm';

const NEWS = {
  grant2024: '/xeberler/qrant-musabiqesini-qazandiq',
  btu2025: '/xeberler/alimlerimiz-almaniyada-elmi-ezamiyyetde',
  conf2025: '/xeberler/xx-beynelxalq-elmi-texniki-konfrans-ise-basladi',
  conf2022: '/xeberler/xvii-beynelxalq-elmi-texniki-konfrans-kecirilib',
  conf2022Proc: '/xeberler/xvii-beynelxalq-elmi-texniki-konfransin-meruze-materiallari-cap-olundu',
  conf2017: '/xeberler/beynelxalq-konfrans-ise-basladi',
  student2026: '/xeberler/telebe-ve-genc-tedqiqatcilarin-elmi-texniki-konfransi-kecirilib',
  writing2026: '/xeberler/adda-da-akademik-yazi-ve-etika-movzusunda-telimler-kecirilir',
  tecSeminar: '/xeberler/adda-da-elmi-tedqiqat-metodlarina-dair-seminar-kecirilib',
  tecAi: '/xeberler/denizcilikde-suni-intellektin-huquqi-aspektleri-muzakire-olunub',
  tecAsa: '/xeberler/adda-ve-asa-telebe-elmi-cemiyyetleri-arasinda-emekdasliq',
  turkLoydu: '/xeberler/adda-ve-turk-loydu-emekdasliq-imkanlarini-muzakire-edib',
};
/** ru/en səhifəsindən az xəbərə: xəbər səhifəsi dilə görə az-a qayıtmır, prefiks açıq yazılır. */
const AZ_NEWS = (path: string): string => `/az${path}`;
const RISK_2023 = '/sehife/heyder-eliyevin-anadan-olmasinin-100-illiyine-hesr-olunmus-v-avrasiya-konfransi';

/** «Elmi Əsərlər» arxivi (Cloudinary, köhnə səhifədən). Siyahıda olmayan nömrənin keçidi köhnə saytda qırıq idi. */
const PDF = 'https://res.cloudinary.com/xpjtibwa/image/upload/';
const ARCHIVE: { year: number; issues: [number, string][] }[] = [
  { year: 2025, issues: [[1, 'v1785223413/EE_N_1_2025_bcd60c2c9a.pdf'], [2, 'v1785223419/Elmi_eserler_2_2025_a953338766.pdf']] },
  { year: 2024, issues: [[1, 'v1785223394/Elmi_eserler_1_b3fa57b3f4.pdf'], [2, 'v1785223402/Elmi_eserler_2_docx_Y_bdb553c8e0.pdf']] },
  { year: 2023, issues: [[1, 'v1785223382/Elmi_s_rl_r_1_pdf_83693bac43.pdf'], [2, 'v1785223388/ej_2_d4c4feb2de.pdf']] },
  { year: 2022, issues: [[1, 'v1785223370/EE_012022_0c4b7fce14.pdf']] },
  { year: 2020, issues: [[1, 'v1785223344/Elmi_eserler_1_2020_459ec2c474.pdf'], [2, 'v1785223350/Elmi_eserler_2020_f1f884331a.pdf']] },
  { year: 2019, issues: [[1, 'v1785223330/Elmi_eserler_N1_325d61ea89.pdf']] },
  { year: 2018, issues: [[1, 'v1785223319/Proceedings_of_ASMA_fc03c234f8.pdf'], [2, 'v1785223324/Eilmi_s_rl_r_2_2018_cda746ed73.pdf']] },
];
/** «- **2025:** [№ 1](…), [№ 2](…)» — boş xana yoxdur, olmayan nömrə sadəcə yazılmır. */
function archiveList(year: (y: number) => string, issue: (n: number) => string): string {
  return ARCHIVE.map((a) => `- **${year(a.year)}:** ${a.issues.map(([n, f]) => `[${issue(n)}](${PDF}${f})`).join(', ')}`).join('\n');
}

const CONTACT_AZ =
  '**Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsi**\n\nKorpus 1, 4-cü mərtəbə\n\n' +
  `**Telefon:** ${OFFICE_PHONE_AZ}\n\n` +
  `E-poçt və heyət — [şöbənin səhifəsində](${OFFICE}). Sualınızı [onlayn göndərin](${ASK}) — cavab e-poçtunuza gəlir.`;
const CONTACT_EN =
  '**Research and International Relations Department**\n\nBuilding 1, 4th floor\n\n' +
  `**Phone:** ${OFFICE_PHONE_EN}\n\n` +
  `E-mail and staff are on the [department page](${OFFICE}). [Send your question online](${ASK}) — the reply comes to your e-mail.`;
const CONTACT_RU =
  '**Отдел научных исследований и международных связей**\n\nКорпус 1, 4-й этаж\n\n' +
  `**Телефон:** ${OFFICE_PHONE_RU}\n\n` +
  `Электронная почта и сотрудники — на [странице отдела](${OFFICE}). [Задайте вопрос онлайн](${ASK}) — ответ придёт на e-mail.`;

const OFFICE_AZ: LinkSeed = { label: 'Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsi', url: OFFICE };
const OFFICE_EN: LinkSeed = { label: 'Research and International Relations Department', url: OFFICE };
const OFFICE_RU: LinkSeed = { label: 'Отдел научных исследований и международных связей', url: OFFICE };

// ── 1. Elm və innovasiya (bölmənin ana səhifəsi) ─────────────────────────────
const HUB_PAGE: ElmPageSeed = {
  slug: ELM_HUB_SLUG,
  dataBlock: 'yox',
  az: {
    title: 'Elm və innovasiya',
    lead:
      'ADDA-da elmi-tədqiqat dəniz nəqliyyatının real məsələlərinə yönəlib: gəmiqayırma və gəmi təmiri, gəmi energetikası, naviqasiyanın təhlükəsizliyi, ətraf mühit. ' +
      'Laboratoriyalar, «Elmi Əsərlər» jurnalı, doktorantura, konfranslar və qrantlar bu bölmədədir.',
    seoDescription:
      'ADDA-da elm: tədqiqat istiqamətləri, laboratoriyalar, «Elmi Əsərlər» jurnalı, Elm Portalı, doktorantura, gənc alimlər, konfranslar və qrantlar.',
    stepsTitle: 'Tədqiqatçı üçün addımlar',
    facts: [
      { label: 'Elmi jurnal', value: 'ISSN 2220-1025', icon: 'kitab' },
      { label: 'Beynəlxalq konfrans', value: 'Hər il, may', icon: 'konfrans' },
      { label: 'Elmi-tədqiqat laboratoriyası', value: '3', icon: 'laboratoriya' },
      { label: 'Doktorantura ixtisası', value: '3', icon: 'diplom' },
    ],
    steps: [
      {
        title: 'ORCID identifikatoru alın',
        who: 'Hər tədqiqatçı',
        body:
          'ORCID — tədqiqatçının pulsuz beynəlxalq identifikatorudur: nəşrləriniz adınızın yazılışından asılı olmadan sizə bağlanır. ' +
          'Jurnallar və qrant proqramları çox vaxt onu tələb edir.',
        linkLabel: 'orcid.org',
        linkUrl: 'https://orcid.org',
      },
      {
        title: 'Elm Portalında profilinizə baxın',
        who: 'ADDA Elm Portalı (CRIS)',
        body:
          'Portalda Akademiyanın tədqiqatçıları və nəşrləri bir yerdə toplanır. Nəşrlərinizin tam və düzgün olması həm sizin, həm Akademiyanın görünürlüyü üçün vacibdir.',
        linkLabel: 'cris.adda.edu.az',
        linkUrl: CRIS,
      },
      {
        title: 'Mövzunu təsdiq etdirin',
        who: 'Kafedra və Elmi Şura',
        body:
          'Tədqiqat və dissertasiya mövzusu kafedrada müzakirə olunur, Elmi Şurada təsdiq edilir. Kafedraların illik elmi-tədqiqat planları da Elmi Şurada təsdiqlənir.',
        linkLabel: 'Elmi Şura',
        linkUrl: '/struktur/elmi-sura',
      },
      {
        title: 'Maliyyə və tərəfdaş tapın',
        who: 'Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsi',
        body:
          'Azərbaycan Elm Fondunun müsabiqələri, beynəlxalq proqramlar, xarici universitetlərlə birgə layihələr. Şöbə beynəlxalq layihə və müqavilələrin hazırlanmasında iştirak edir.',
        linkLabel: 'Qrantlar və müsabiqələr',
        linkUrl: '/sehife/qrantlar',
      },
      {
        title: 'Nəticəni dərc edin',
        who: 'Jurnal və konfranslar',
        body:
          'Məqaləni Akademiyanın AAK siyahısındakı «Elmi Əsərlər» jurnalına və ya beynəlxalq jurnala, məruzəni Akademiyanın illik konfranslarına təqdim edin.',
        linkLabel: '«Elmi Əsərlər» jurnalı',
        linkUrl: '/sehife/elmi-jurnal',
      },
      {
        title: 'Hesabat verin',
        period: 'Hər il',
        who: 'Kafedra və şöbə',
        body:
          'Kafedra və laboratoriyaların elmi-tədqiqat hesabatları şöbədə yoxlanılır və Azərbaycan Milli Elmlər Akademiyasına təqdim olunur; nəticələr AMEA-nın illik hesabatına daxil edilir.',
      },
    ],
    body: `## Tədqiqat istiqamətləri

Akademiyanın elmi-tədqiqat işləri «Su nəqliyyatının problemləri» ümumi mövzusu ətrafında qurulub. İstiqamətlər «Elmi Əsərlər» jurnalının və beynəlxalq konfransın bölmələri ilə eynidir:

| İstiqamət | Mövzulardan nümunələr |
|---|---|
| Gəmiqayırma və gəmi təmiri texnologiyası | gəmi gövdəsinin qaynaq birləşmələrinin keyfiyyəti və korroziyaya davamlılığı; daxiliyanma mühərriklərinin detallarının bərpası; rəqəmli proqramla idarə olunan dəzgahlarda emal |
| Gəmiçilik və su nəqliyyatının istismarı | məhdud akvatoriyada gəmilərin sovuşmasının təhlükəsizlik meyarları; yükdaşıma və yükləmə-boşaltma texnologiyası |
| Gəmiçilik texnikası | gəmi dizellərinin istismar parametrləri; köməkçi mexanizmlər; val-generator qurğuları; energetik qurğuların səmərəliliyi və ətraf mühitə təsiri |
| Gəmiçilikdə təbiət elmləri problemləri | Mn və Sm qatqılı GaSb birləşməsinin elektrofiziki xassələri; qaz-maye mühitinin mexanikası |
| Humanitar və dilçilik məsələləri | multikultural proseslərin tarixi-fəlsəfi, sosial-iqtisadi və siyasi-hüquqi aspektləri |

Laboratoriyalarda aparılan işlər: [Elmi-tədqiqat laboratoriyaları](/sehife/elmi-tedqiqat-laboratoriyalari).

## Elmi idarəetmə

- **[Elmi Şura](/struktur/elmi-sura)** — elmi-tədqiqat planlarını və dissertasiya mövzularını təsdiqləyir, məqalələri çapa tövsiyə edir.
- **[Elmi işlər və beynəlxalq əlaqələr üzrə prorektor](/struktur/elmi-isler-ve-beynelxalq-elaqeler-uzre-prorektorluq)** — elm və beynəlxalq əlaqələr istiqaməti.
- **[Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsi](${OFFICE})** — planların toplanması və Elmi Şuraya təqdimi, hesabatların yoxlanılması və AMEA-ya təqdimi, nəşr olunmuş əsərlərin qeydiyyatı, dissertasiyaların ekspertizasının təşkili, doktorant və magistrantlar üçün seminarlar, Tələbə Elmi Cəmiyyəti ilə iş, beynəlxalq müqavilələr və mübadilə.
- **[Gənc Alimlər Şurası](/sehife/genc-alimler-surasi)** — gənc alim, doktorant və dissertantların elmi təşəbbüsləri.

Akademiyanın alimləri dissertasiya müdafiələrində aparıcı təşkilat, opponent və rəyçi kimi, dissertasiya şuralarının üzvü və sədri, Ali Attestasiya Komissiyasının ekspert şurasının üzvü kimi çıxış edir.

## Nəşrlər və Elm Portalı

**«ADDA-nın Elmi Əsərləri»** — Akademiyanın elmi-texniki jurnalı: ISSN 2220-1025, Ali Attestasiya Komissiyasının dövri elmi nəşrlər siyahısında, ildə iki nömrə, Azərbaycan, rus və ingilis dillərində. Konfrans materialları ayrıca toplularda dərc olunur. [Jurnal, arxiv və müəlliflər üçün qaydalar](/sehife/elmi-jurnal).

**[ADDA Elm Portalı (CRIS)](${CRIS})** — Akademiyanın tədqiqatçıları və onların nəşrləri bir yerdə: nəşr siyahıları, həmmüəlliflər və beynəlxalq əməkdaşlıq.

## Beynəlxalq elmi əməkdaşlıq

- **Brandenburq Texniki Universiteti (Almaniya)** — Azərbaycan Elm Fondunun qrant layihəsi çərçivəsində birgə tədqiqat və eksperimentlər; noyabr 2025 ([xəbər](${NEWS.btu2025})).
- **Azərbaycan Texniki Universiteti** — Elm Fondunun 2024-cü il qrant layihəsində tərəfdaş ([Qrantlar və müsabiqələr](/sehife/qrantlar)).
- **AMEA Riyaziyyat və Mexanika İnstitutu** — əməkdaşlıq müqaviləsi əsasında birgə dissertasiya işləri.
- **Türk Loydu** — elmi-tədqiqat və innovasiya layihələrində, beynəlxalq qrant proqramlarında əməkdaşlıq imkanları müzakirə olunub ([xəbər](${NEWS.turkLoydu})).

Beynəlxalq konfransımızda Türkiyə, Rusiya, ABŞ, Ukrayna, Gürcüstan, Latviya, Polşa, Qazaxıstan və digər ölkələrin alimləri iştirak edir — [Elmi konfranslar](/sehife/elmi-konfranslar). Bütün tərəfdaşlar: [Beynəlxalq əməkdaşlıq](/sehife/beynelxalq-emekdasliq).

## Tədqiqat etikası və akademik yazı

- «Elmi Əsərlər»ə təqdim olunan məqaləyə antiplagiat yoxlamasının nəticəsi əlavə edilir; müəllif professor deyilsə, rəy də tələb olunur.
- Magistr dissertasiyaları antiplagiat yoxlamasından keçirilir.
- 2026-cı ilin yazında 43 müəllim və gənc tədqiqatçı 14 həftəlik (42 saat) «Akademik yazı və etika» təlimində iştirak edib ([xəbər](${NEWS.writing2026})).
- Tələbə Elmi Cəmiyyəti tələbələr üçün elmi tədqiqat metodları, məqalənin strukturu və akademik dürüstlük üzrə seminarlar keçirir ([xəbər](${NEWS.tecSeminar})).

## Elm tədrisdə

Tədqiqat nəticələri dərslərə daxil edilir: «Gəmiqayırma materialları», «Materialşünaslıq və materialların texnologiyası», «Gəmi maşın və mexanizmlərinin diaqnostikası», «Dəniz daşımalarının texnologiyası», «Yükdaşıma texnologiyası», «Yükşünaslıq», «Yükləmə-boşaltma proseslərinin texnologiyası və təşkili», həmçinin «Azərbaycan tarixi», «Fəlsəfə», «İqtisadiyyat» və «Multikulturalizm» fənləri.

Tələbələr elmə [Tələbə Elmi Cəmiyyəti](/sehife/telebe-elmi-cemiyyeti) və hər yaz keçirilən tələbə konfransı ilə qoşulur — [Gənc alimlər və tədqiqatçılar](/sehife/genc-alimler-surasi).`,
    faq: [
      {
        question: 'Tələbə elmi işə necə qoşula bilər?',
        answer:
          'Tələbə Elmi Cəmiyyətinə qoşulun və kafedranızda elmi rəhbər seçin. Hər yaz tələbə, magistr və gənc tədqiqatçıların elmi-texniki konfransı keçirilir: məruzələr «Tezislər toplusu»nda dərc olunur, bölmələr üzrə ilk üç yer diplomla təltif edilir.',
      },
      {
        question: 'Məqaləmi «Elmi Əsərlər»də necə dərc etdirə bilərəm?',
        answer:
          'Tərtib qaydaları, tələb olunan sənədlər (rəy, antiplagiat, elmi şuranın tövsiyəsi) və redaksiyanın əlaqəsi jurnal səhifəsindədir.',
      },
      {
        question: 'Qrant müraciəti barədə kimə yazım?',
        answer:
          `Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsinə: Korpus 1, 4-cü mərtəbə, telefon ${OFFICE_PHONE_AZ}. Sualı onlayn da göndərə bilərsiniz — «Elmi işlər, nəşr və qrantlar» istiqamətini seçin.`,
      },
      {
        question: 'Akademiyada doktorantura varmı?',
        answer:
          'Bəli, fəlsəfə doktoru proqramı üzrə üç ixtisasda: gəmiçilik texnikası, gəmiçilik və su nəqliyyatının istismarı, gəmiqayırma və gəmi təmiri texnologiyası. Qəbul qaydası «Doktoranturaya qəbul» səhifəsindədir.',
      },
    ],
    sideLinks: [
      OFFICE_AZ,
      { label: 'Elmi Şura', url: '/struktur/elmi-sura' },
      { label: 'ADDA Elm Portalı (CRIS)', url: CRIS },
      { label: 'Doktoranturaya qəbul', url: '/sehife/doktorantura' },
      { label: 'Azərbaycan Elm Fondu', url: AEF },
      { label: 'ORCID', url: 'https://orcid.org' },
    ],
    contact: CONTACT_AZ,
  },
  en: {
    title: 'Research and Innovation',
    lead:
      'Research at ADDA addresses real problems of maritime transport: shipbuilding and ship repair, marine power plants, navigation safety and the environment. ' +
      'Laboratories, the “Proceedings” journal, doctoral studies, conferences and grants are all in this section.',
    seoDescription:
      'Research at ADDA: research areas, laboratories, the Proceedings journal, the Research Portal, doctoral studies, young scientists, conferences and grants.',
    stepsTitle: 'Steps for researchers',
    facts: [
      { label: 'Scientific journal', value: 'ISSN 2220-1025', icon: 'kitab' },
      { label: 'International conference', value: 'Every May', icon: 'konfrans' },
      { label: 'Research laboratories', value: '3', icon: 'laboratoriya' },
      { label: 'Doctoral specialities', value: '3', icon: 'diplom' },
    ],
    steps: [
      {
        title: 'Get an ORCID iD',
        who: 'Every researcher',
        body:
          'ORCID is a free international researcher identifier: your publications are linked to you whatever the spelling of your name. Journals and grant programmes often require it.',
        linkLabel: 'orcid.org',
        linkUrl: 'https://orcid.org',
      },
      {
        title: 'Check your profile on the Research Portal',
        who: 'ADDA Research Portal (CRIS)',
        body:
          'The portal brings together the Academy’s researchers and their publications. A complete and correct publication list matters for your visibility and the Academy’s.',
        linkLabel: 'cris.adda.edu.az',
        linkUrl: CRIS,
      },
      {
        title: 'Have your topic approved',
        who: 'Department and Academic Council',
        body:
          'Research and dissertation topics are discussed in the department and approved by the Academic Council, which also approves the departments’ annual research plans.',
        linkLabel: 'Academic Council',
        linkUrl: '/struktur/elmi-sura',
      },
      {
        title: 'Find funding and partners',
        who: 'Research and International Relations Department',
        body:
          'Azerbaijan Science Foundation competitions, international programmes and joint projects with foreign universities. The department takes part in preparing international projects and agreements.',
        linkLabel: 'Grants and competitions',
        linkUrl: '/sehife/qrantlar',
      },
      {
        title: 'Publish your results',
        who: 'Journal and conferences',
        body:
          'Submit your article to the Academy’s “Proceedings”, listed by the Higher Attestation Commission, or to an international journal, and your paper to the Academy’s annual conferences.',
        linkLabel: 'The “Proceedings” journal',
        linkUrl: '/sehife/elmi-jurnal',
      },
      {
        title: 'Report',
        period: 'Every year',
        who: 'Department and research office',
        body:
          'Research reports of departments and laboratories are reviewed by the research office and submitted to the Azerbaijan National Academy of Sciences (ANAS); the results are included in the ANAS annual report.',
      },
    ],
    body: `## Research areas

Research at the Academy is built around the common theme “Problems of Water Transport”. The areas match the sections of the “Proceedings” journal and of the international conference:

| Area | Examples of topics |
|---|---|
| Shipbuilding and ship repair technology | quality and corrosion resistance of welded hull joints; restoration of internal combustion engine parts; machining on numerically controlled machines |
| Shipping and operation of water transport | safety criteria for ships passing each other in restricted waters; cargo transport and cargo handling technology |
| Marine engineering | operating parameters of marine diesel engines; auxiliary machinery; shaft generator sets; efficiency and environmental impact of marine power plants |
| Natural science problems in shipping | electrophysical properties of GaSb doped with Mn and Sm; mechanics of gas–liquid media |
| Humanities and linguistics | historical, philosophical, socio-economic and legal aspects of multicultural processes |

Work carried out in the laboratories: [Research laboratories](/sehife/elmi-tedqiqat-laboratoriyalari).

## Research governance

- **[Academic Council](/struktur/elmi-sura)** — approves research plans and dissertation topics and recommends articles for publication.
- **[Vice-Rector for Research and International Relations](/struktur/elmi-isler-ve-beynelxalq-elaqeler-uzre-prorektorluq)** — research and international relations.
- **[Research and International Relations Department](${OFFICE})** — collects research plans for the Academic Council, reviews reports and submits them to ANAS, registers staff publications, organises expert review of dissertations, runs seminars for doctoral and master’s students, works with the Student Research Society, handles international agreements and exchanges.
- **[Young Scientists Council](/sehife/genc-alimler-surasi)** — research initiatives of young scientists and doctoral students.

The Academy’s scientists act as leading organisation, opponents and reviewers at dissertation defences, serve as members and chairs of dissertation councils and as members of expert councils of the Higher Attestation Commission.

## Publications and the Research Portal

**“Proceedings of Azerbaijan State Marine Academy”** — the Academy’s scientific and technical journal: ISSN 2220-1025, on the list of periodicals of the Higher Attestation Commission, two issues a year, in Azerbaijani, Russian and English. Conference papers are published in separate proceedings. [Journal, archive and author guidelines](/sehife/elmi-jurnal).

**[ADDA Research Portal (CRIS)](${CRIS})** — the Academy’s researchers and their publications in one place: publication lists, co-authors and international collaboration.

## International research cooperation

- **Brandenburg University of Technology (Germany)** — joint research and experiments under an Azerbaijan Science Foundation grant; November 2025 ([news in Azerbaijani](${AZ_NEWS(NEWS.btu2025)})).
- **Azerbaijan Technical University** — partner in the 2024 Science Foundation grant project ([Grants and competitions](/sehife/qrantlar)).
- **ANAS Institute of Mathematics and Mechanics** — joint dissertation work under a cooperation agreement.
- **Türk Loydu** — opportunities for joint research and innovation projects and international grant programmes have been discussed.

Scientists from Türkiye, Russia, the USA, Ukraine, Georgia, Latvia, Poland, Kazakhstan and other countries take part in our international conference — [Scientific conferences](/sehife/elmi-konfranslar). All partners: [International cooperation](/sehife/beynelxalq-emekdasliq).

## Research ethics and academic writing

- Articles submitted to the “Proceedings” must include an anti-plagiarism report; a review is also required if the author is not a professor.
- Master’s dissertations are checked for plagiarism.
- In spring 2026, 43 lecturers and young researchers took the 14-week (42-hour) “Academic writing and ethics” course.
- The Student Research Society runs seminars on research methods, article structure and academic integrity.

## Research in teaching

Research results feed into courses such as “Shipbuilding materials”, “Materials science and technology”, “Diagnostics of ship machinery”, “Maritime transport technology”, “Cargo transport technology”, “Cargo science” and “Cargo handling technology and organisation”, as well as “History of Azerbaijan”, “Philosophy”, “Economics” and “Multiculturalism”.

Students join research through the [Student Research Society](/sehife/telebe-elmi-cemiyyeti) and the student conference held every spring — [Young scientists and researchers](/sehife/genc-alimler-surasi).`,
    faq: [
      {
        question: 'How can a student get involved in research?',
        answer:
          'Join the Student Research Society and choose a supervisor in your department. Every spring the Academy holds a conference of students, master’s students and young researchers: papers are published in the book of abstracts and the top three in each section receive diplomas.',
      },
      {
        question: 'How can I publish in the “Proceedings”?',
        answer:
          'The formatting rules, required documents (review, anti-plagiarism report, recommendation of an academic council) and the editorial contact are on the journal page.',
      },
      {
        question: 'Whom should I contact about a grant application?',
        answer: `The Research and International Relations Department: Building 1, 4th floor, phone ${OFFICE_PHONE_EN}. You can also write online and choose “Research, publications and grants”.`,
      },
    ],
    sideLinks: [
      OFFICE_EN,
      { label: 'Academic Council', url: '/struktur/elmi-sura' },
      { label: 'ADDA Research Portal (CRIS)', url: CRIS },
      { label: 'Doctoral admission', url: '/sehife/doktorantura' },
      { label: 'Azerbaijan Science Foundation', url: AEF },
      { label: 'ORCID', url: 'https://orcid.org' },
    ],
    contact: CONTACT_EN,
  },
  ru: {
    title: 'Наука и инновации',
    lead:
      'Научные исследования в ADDA посвящены реальным задачам морского транспорта: судостроению и судоремонту, судовой энергетике, безопасности мореплавания и экологии. ' +
      'Лаборатории, журнал «Научные труды», докторантура, конференции и гранты — в этом разделе.',
    seoDescription:
      'Наука в ADDA: направления исследований, лаборатории, журнал «Научные труды», Научный портал, докторантура, молодые учёные, конференции и гранты.',
    stepsTitle: 'Шаги исследователя',
    facts: [
      { label: 'Научный журнал', value: 'ISSN 2220-1025', icon: 'kitab' },
      { label: 'Международная конференция', value: 'Ежегодно, май', icon: 'konfrans' },
      { label: 'Научно-исследовательские лаборатории', value: '3', icon: 'laboratoriya' },
      { label: 'Специальности докторантуры', value: '3', icon: 'diplom' },
    ],
    steps: [
      {
        title: 'Получите идентификатор ORCID',
        who: 'Каждый исследователь',
        body:
          'ORCID — бесплатный международный идентификатор исследователя: публикации связываются с вами независимо от написания имени. Журналы и грантовые программы часто его требуют.',
        linkLabel: 'orcid.org',
        linkUrl: 'https://orcid.org',
      },
      {
        title: 'Проверьте профиль на Научном портале',
        who: 'Научный портал ADDA (CRIS)',
        body:
          'На портале собраны исследователи Академии и их публикации. Полный и точный список публикаций важен для вашей видимости и видимости Академии.',
        linkLabel: 'cris.adda.edu.az',
        linkUrl: CRIS,
      },
      {
        title: 'Утвердите тему',
        who: 'Кафедра и Учёный совет',
        body:
          'Тема исследования и диссертации обсуждается на кафедре и утверждается Учёным советом; годовые планы научных работ кафедр также утверждает Учёный совет.',
        linkLabel: 'Учёный совет',
        linkUrl: '/struktur/elmi-sura',
      },
      {
        title: 'Найдите финансирование и партнёров',
        who: 'Отдел научных исследований и международных связей',
        body:
          'Конкурсы Научного фонда Азербайджана, международные программы, совместные проекты с зарубежными университетами. Отдел участвует в подготовке международных проектов и договоров.',
        linkLabel: 'Гранты и конкурсы',
        linkUrl: '/sehife/qrantlar',
      },
      {
        title: 'Опубликуйте результат',
        who: 'Журнал и конференции',
        body:
          'Статью — в журнал Академии «Научные труды» (перечень ВАК) или в международный журнал, доклад — на ежегодные конференции Академии.',
        linkLabel: 'Журнал «Научные труды»',
        linkUrl: '/sehife/elmi-jurnal',
      },
      {
        title: 'Отчитайтесь',
        period: 'Ежегодно',
        who: 'Кафедра и отдел',
        body:
          'Отчёты кафедр и лабораторий о научной работе проверяются в отделе и представляются в Национальную академию наук Азербайджана; результаты входят в годовой отчёт НАНА.',
      },
    ],
    body: `## Направления исследований

Научная работа Академии строится вокруг общей темы «Проблемы водного транспорта». Направления совпадают с разделами журнала «Научные труды» и секциями международной конференции:

| Направление | Примеры тем |
|---|---|
| Технология судостроения и судоремонта | качество и коррозионная стойкость сварных соединений корпуса; восстановление деталей двигателей внутреннего сгорания; обработка на станках с ЧПУ |
| Судоходство и эксплуатация водного транспорта | критерии безопасности расхождения судов в стеснённых водах; технология перевозок и погрузочно-разгрузочных работ |
| Судовая техника | эксплуатационные параметры судовых дизелей; вспомогательные механизмы; валогенераторные установки; эффективность и экологичность судовых энергетических установок |
| Проблемы естествознания в судоходстве | электрофизические свойства GaSb, легированного Mn и Sm; механика газожидкостных сред |
| Гуманитарные и лингвистические проблемы | историко-философские, социально-экономические и правовые аспекты мультикультурных процессов |

Работы лабораторий: [Научно-исследовательские лаборатории](/sehife/elmi-tedqiqat-laboratoriyalari).

## Управление наукой

- **[Учёный совет](/struktur/elmi-sura)** — утверждает планы научных работ и темы диссертаций, рекомендует статьи к печати.
- **[Проректор по научной работе и международным связям](/struktur/elmi-isler-ve-beynelxalq-elaqeler-uzre-prorektorluq)** — наука и международные связи.
- **[Отдел научных исследований и международных связей](${OFFICE})** — сбор планов и представление их Учёному совету, проверка отчётов и передача их в НАНА, учёт публикаций сотрудников, организация экспертизы диссертаций, семинары для докторантов и магистрантов, работа со Студенческим научным обществом, международные договоры и обмены.
- **[Совет молодых учёных](/sehife/genc-alimler-surasi)** — научные инициативы молодых учёных и докторантов.

Учёные Академии выступают ведущей организацией, оппонентами и рецензентами на защитах, входят в диссертационные советы и возглавляют их, являются членами экспертных советов ВАК.

## Публикации и Научный портал

**«Научные труды АГМА»** — научно-технический журнал Академии: ISSN 2220-1025, в перечне периодических изданий ВАК, два номера в год, на азербайджанском, русском и английском языках. Материалы конференций издаются отдельными сборниками. [Журнал, архив и правила для авторов](/sehife/elmi-jurnal).

**[Научный портал ADDA (CRIS)](${CRIS})** — исследователи Академии и их публикации в одном месте: списки публикаций, соавторы и международное сотрудничество.

## Международное научное сотрудничество

- **Бранденбургский технический университет (Германия)** — совместные исследования и эксперименты в рамках гранта Научного фонда Азербайджана; ноябрь 2025 года.
- **Азербайджанский технический университет** — партнёр по грантовому проекту Научного фонда 2024 года ([Гранты и конкурсы](/sehife/qrantlar)).
- **Институт математики и механики НАНА** — совместные диссертационные работы по договору о сотрудничестве.
- **Türk Loydu** — обсуждены возможности совместных научных и инновационных проектов и международных грантовых программ.

В международной конференции Академии участвуют учёные Турции, России, США, Украины, Грузии, Латвии, Польши, Казахстана и других стран — [Научные конференции](/sehife/elmi-konfranslar). Все партнёры: [Международное сотрудничество](/sehife/beynelxalq-emekdasliq).

## Научная этика и академическое письмо

- К статье, подаваемой в «Научные труды», прилагается результат проверки на плагиат; если автор не профессор, нужна и рецензия.
- Магистерские диссертации проходят проверку на плагиат.
- Весной 2026 года 43 преподавателя и молодых исследователя прошли 14-недельный (42 часа) курс «Академическое письмо и этика».
- Студенческое научное общество проводит семинары по методам исследования, структуре статьи и академической честности.

## Наука в обучении

Результаты исследований используются в курсах «Судостроительные материалы», «Материаловедение и технология материалов», «Диагностика судовых машин и механизмов», «Технология морских перевозок», «Технология грузовых перевозок», «Грузоведение», «Технология и организация погрузочно-разгрузочных работ», а также «История Азербайджана», «Философия», «Экономика» и «Мультикультурализм».

Студенты приходят в науку через [Студенческое научное общество](/sehife/telebe-elmi-cemiyyeti) и ежегодную весеннюю студенческую конференцию — [Молодые учёные и исследователи](/sehife/genc-alimler-surasi).`,
    faq: [
      {
        question: 'Как студенту заняться наукой?',
        answer:
          'Вступите в Студенческое научное общество и выберите научного руководителя на кафедре. Каждую весну проходит научно-техническая конференция студентов, магистрантов и молодых исследователей: доклады публикуются в «Сборнике тезисов», первые три места в секциях отмечаются дипломами.',
      },
      {
        question: 'Как опубликовать статью в «Научных трудах»?',
        answer:
          'Правила оформления, необходимые документы (рецензия, проверка на плагиат, рекомендация учёного совета) и контакты редакции — на странице журнала.',
      },
      {
        question: 'К кому обратиться по поводу гранта?',
        answer: `В Отдел научных исследований и международных связей: корпус 1, 4-й этаж, телефон ${OFFICE_PHONE_RU}. Можно написать и онлайн, выбрав направление «Наука, публикации и гранты».`,
      },
    ],
    sideLinks: [
      OFFICE_RU,
      { label: 'Учёный совет', url: '/struktur/elmi-sura' },
      { label: 'Научный портал ADDA (CRIS)', url: CRIS },
      { label: 'Приём в докторантуру', url: '/sehife/doktorantura' },
      { label: 'Научный фонд Азербайджана', url: AEF },
      { label: 'ORCID', url: 'https://orcid.org' },
    ],
    contact: CONTACT_RU,
  },
};

// ── 2. Elmi-tədqiqat laboratoriyaları ────────────────────────────────────────
const LAB_PAGE: ElmPageSeed = {
  slug: 'elmi-tedqiqat-laboratoriyalari',
  dataBlock: 'yox',
  az: {
    title: 'Elmi-tədqiqat laboratoriyaları',
    lead:
      'Akademiyanın üç elmi-tədqiqat laboratoriyasında alimlər və gənc tədqiqatçılar gəmi texnikasının real məsələləri üzərində işləyir: ' +
      'mühərrik detallarının bərpası, val-generator qurğuları, gəmi energetik qurğularının səmərəliliyi və ekologiyası.',
    seoDescription:
      'ADDA-nın elmi-tədqiqat laboratoriyaları: gəmiqayırma və gəmi təmiri, gəmi elektrik avadanlığı, gəmi energetik qurğuları — mövzular və tədqiqata qoşulmaq.',
    stepsTitle: 'Laboratoriyada tədqiqata necə qoşulmaq olar',
    facts: [
      { label: 'Laboratoriya', value: '3', icon: 'laboratoriya' },
      { label: 'Sahə', value: 'Gəmi texnikası və energetikası', icon: 'gemi' },
      { label: 'Kimlər üçün', value: 'Alimlər və gənc tədqiqatçılar', icon: 'qrup' },
    ],
    steps: [
      {
        title: 'Elmi rəhbər tapın',
        who: 'Kafedra',
        body: 'Laboratoriyada iş kafedranın elmi-tədqiqat planı çərçivəsində aparılır — mövzunu kafedra müdiri və ya gələcək elmi rəhbərinizlə müzakirə edin.',
      },
      {
        title: 'Mövzunu plana salın',
        who: 'Kafedra və Elmi Şura',
        body: 'Tədqiqat mövzusu kafedranın illik elmi-tədqiqat planına daxil edilir; plan Elmi Şurada təsdiq olunur.',
      },
      {
        title: 'Nəticəni təqdim edin',
        who: 'Konfrans, jurnal, hesabat',
        body: 'Nəticələr Akademiyanın konfranslarında məruzə edilir, «Elmi Əsərlər» jurnalında dərc olunur və illik elmi hesabata daxil edilir.',
        linkLabel: 'Elmi konfranslar',
        linkUrl: '/sehife/elmi-konfranslar',
      },
    ],
    body: `## Gəmiqayırma və gəmi təmiri laboratoriyası

Tədqiqatlar gəmi daxiliyanma mühərriklərinin detallarının bərpa texnologiyasının işlənməsinə həsr olunub.

«Gəmiqayırma və gəmi təmiri» kafedrasının alimləri Azərbaycan Texniki Universiteti ilə birgə Azərbaycan Elm Fondunun qrant layihəsini icra edir: «Rəqəmli proqramla idarə olunan dəzgahlarda iqtisadi emal şərtlərinin texnoloji təminatı» (2024–2026). Layihə çərçivəsində Almaniyanın Brandenburq Texniki Universitetinin laboratoriyalarında birgə eksperimentlər aparılıb — [Qrantlar və müsabiqələr](/sehife/qrantlar).

## Gəmi elektrik avadanlığı laboratoriyası

«Gəmi val-generator qurğularının tədqiqi» mövzusunda elmi-tədqiqat işi yerinə yetirilib. Val-generator elektrik enerjisini baş mühərrikin hesabına istehsal edir — bu, dizel-generatorların iş vaxtını, yanacaq sərfini və tullantıları azaltmağa imkan verir.

## Gəmi energetik qurğuları laboratoriyası

Elmi-tədqiqat işləri iki mövzu üzrə aparılır:

- istismar zamanı gəmi energetik qurğularının effektivliyinin yüksəldilməsi və onların ətraf mühitə zərərli təsirinin azaldılması;
- nəqliyyat gəmilərində energetik qurğuların istismar effektivliyinin artırılması.

Mövzular gəmilərdən atmosferə atılan zərərli tullantıların azaldılmasına dair beynəlxalq tələblərlə (MARPOL Konvensiyasının VI əlavəsi) bağlıdır.

## Tədqiqatdan tədrisə

Laboratoriyaların nəticələri «Gəmiqayırma materialları», «Materialşünaslıq və materialların texnologiyası» və «Gəmi maşın və mexanizmlərinin diaqnostikası» fənlərinin tədrisində istifadə olunur. Tədris laboratoriyaları və trenajorlar ayrıca siyahıdadır: [Laboratoriya və trenajorlar](/auditoriyalar).`,
    faq: [
      {
        question: 'Tələbə laboratoriyada tədqiqata qoşula bilərmi?',
        answer:
          'Tələbələr elmi işə Tələbə Elmi Cəmiyyəti və kafedra vasitəsilə qoşulur. Laboratoriyada iş imkanını və mövzunu kafedra müdiri ilə dəqiqləşdirin; nəticəni yazda keçirilən tələbə konfransında təqdim etmək olar.',
      },
      {
        question: 'Xarici tərəfdaşla birgə tədqiqat mümkündürmü?',
        answer:
          'Bəli. Məsələn, «Gəmiqayırma və gəmi təmiri» kafedrasının alimləri Elm Fondunun qrant layihəsi çərçivəsində Brandenburq Texniki Universitetində (Almaniya) birgə eksperimentlər aparıb. Tərəfdaşlıq Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsi vasitəsilə qurulur.',
      },
    ],
    sideLinks: [
      { label: 'Elm və innovasiya', url: HUB },
      { label: 'Laboratoriya və trenajorlar', url: '/auditoriyalar' },
      { label: 'Qrantlar və müsabiqələr', url: '/sehife/qrantlar' },
      OFFICE_AZ,
    ],
    contact: CONTACT_AZ,
  },
  en: {
    title: 'Research Laboratories',
    lead:
      'In the Academy’s three research laboratories, scientists and young researchers work on real problems of marine engineering: ' +
      'restoring engine parts, shaft generator sets, efficiency and environmental performance of marine power plants.',
    seoDescription:
      'ADDA research laboratories: shipbuilding and ship repair, ship electrical equipment, marine power plants — research topics and how to join.',
    stepsTitle: 'How to join research in a laboratory',
    facts: [
      { label: 'Laboratories', value: '3', icon: 'laboratoriya' },
      { label: 'Field', value: 'Marine engineering and power', icon: 'gemi' },
      { label: 'For', value: 'Scientists and young researchers', icon: 'qrup' },
    ],
    steps: [
      {
        title: 'Find a supervisor',
        who: 'Department',
        body: 'Laboratory work follows the department’s research plan — discuss your topic with the head of department or your future supervisor.',
      },
      {
        title: 'Put the topic in the plan',
        who: 'Department and Academic Council',
        body: 'The topic is included in the department’s annual research plan, which is approved by the Academic Council.',
      },
      {
        title: 'Present the results',
        who: 'Conference, journal, report',
        body: 'Results are presented at the Academy’s conferences, published in the “Proceedings” and included in the annual research report.',
        linkLabel: 'Scientific conferences',
        linkUrl: '/sehife/elmi-konfranslar',
      },
    ],
    body: `## Shipbuilding and Ship Repair Laboratory

Research is devoted to technologies for restoring parts of marine internal combustion engines.

Scientists of the Shipbuilding and Ship Repair department, together with Azerbaijan Technical University, carry out an Azerbaijan Science Foundation grant project, “Technological support of economical machining conditions on numerically controlled machines” (2024–2026). Joint experiments under the project were carried out in the laboratories of the Brandenburg University of Technology, Germany — [Grants and competitions](/sehife/qrantlar).

## Ship Electrical Equipment Laboratory

A research project on ship shaft generator sets has been completed. A shaft generator produces electricity from the main engine, which reduces the running hours of diesel generators, fuel consumption and emissions.

## Marine Power Plants Laboratory

Research covers two topics:

- improving the efficiency of marine power plants in operation and reducing their harmful environmental impact;
- improving the operating efficiency of power plants on cargo ships.

The topics relate to international requirements on air emissions from ships (MARPOL Annex VI).

## From research to teaching

Laboratory results are used in teaching “Shipbuilding materials”, “Materials science and technology” and “Diagnostics of ship machinery”. Teaching laboratories and simulators are listed separately: [Laboratories and simulators](/auditoriyalar).`,
    faq: [
      {
        question: 'Can students take part in laboratory research?',
        answer:
          'Students join research through the Student Research Society and their department. Agree the topic and access to the laboratory with the head of department; results can be presented at the student conference held every spring.',
      },
      {
        question: 'Is joint research with foreign partners possible?',
        answer:
          'Yes. For example, scientists of the Shipbuilding and Ship Repair department carried out joint experiments at the Brandenburg University of Technology (Germany) under a Science Foundation grant. Partnerships are arranged through the Research and International Relations Department.',
      },
    ],
    sideLinks: [
      { label: 'Research and Innovation', url: HUB },
      { label: 'Laboratories and simulators', url: '/auditoriyalar' },
      { label: 'Grants and competitions', url: '/sehife/qrantlar' },
      OFFICE_EN,
    ],
    contact: CONTACT_EN,
  },
  ru: {
    title: 'Научно-исследовательские лаборатории',
    lead:
      'В трёх научно-исследовательских лабораториях Академии учёные и молодые исследователи решают реальные задачи судовой техники: ' +
      'восстановление деталей двигателей, валогенераторные установки, эффективность и экологичность судовых энергетических установок.',
    seoDescription:
      'Научно-исследовательские лаборатории ADDA: судостроение и судоремонт, судовое электрооборудование, судовые энергетические установки — темы и участие.',
    stepsTitle: 'Как присоединиться к исследованиям',
    facts: [
      { label: 'Лаборатории', value: '3', icon: 'laboratoriya' },
      { label: 'Область', value: 'Судовая техника и энергетика', icon: 'gemi' },
      { label: 'Для кого', value: 'Учёные и молодые исследователи', icon: 'qrup' },
    ],
    steps: [
      {
        title: 'Найдите научного руководителя',
        who: 'Кафедра',
        body: 'Работа в лаборатории ведётся в рамках плана научных работ кафедры — обсудите тему с заведующим кафедрой или будущим руководителем.',
      },
      {
        title: 'Включите тему в план',
        who: 'Кафедра и Учёный совет',
        body: 'Тема включается в годовой план научных работ кафедры, который утверждает Учёный совет.',
      },
      {
        title: 'Представьте результаты',
        who: 'Конференция, журнал, отчёт',
        body: 'Результаты докладываются на конференциях Академии, публикуются в журнале «Научные труды» и входят в годовой научный отчёт.',
        linkLabel: 'Научные конференции',
        linkUrl: '/sehife/elmi-konfranslar',
      },
    ],
    body: `## Лаборатория судостроения и судоремонта

Исследования посвящены разработке технологии восстановления деталей судовых двигателей внутреннего сгорания.

Учёные кафедры «Судостроение и судоремонт» совместно с Азербайджанским техническим университетом выполняют грантовый проект Научного фонда Азербайджана «Технологическое обеспечение условий экономичной обработки на станках с ЧПУ» (2024–2026). В рамках проекта совместные эксперименты проведены в лабораториях Бранденбургского технического университета (Германия) — [Гранты и конкурсы](/sehife/qrantlar).

## Лаборатория судового электрооборудования

Выполнена научно-исследовательская работа «Исследование судовых валогенераторных установок». Валогенератор вырабатывает электроэнергию за счёт главного двигателя, что сокращает время работы дизель-генераторов, расход топлива и выбросы.

## Лаборатория судовых энергетических установок

Исследования ведутся по двум темам:

- повышение эффективности судовых энергетических установок в эксплуатации и снижение их вредного воздействия на окружающую среду;
- повышение эксплуатационной эффективности энергетических установок транспортных судов.

Темы связаны с международными требованиями по сокращению вредных выбросов с судов (Приложение VI к Конвенции МАРПОЛ).

## От исследований к обучению

Результаты лабораторий используются в курсах «Судостроительные материалы», «Материаловедение и технология материалов» и «Диагностика судовых машин и механизмов». Учебные лаборатории и тренажёры — отдельный список: [Лаборатории и тренажёры](/auditoriyalar).`,
    faq: [
      {
        question: 'Может ли студент участвовать в исследованиях лаборатории?',
        answer:
          'Студенты приходят в науку через Студенческое научное общество и кафедру. Возможность работы в лаборатории и тему согласуйте с заведующим кафедрой; результаты можно представить на весенней студенческой конференции.',
      },
      {
        question: 'Возможны ли совместные исследования с зарубежными партнёрами?',
        answer:
          'Да. Например, учёные кафедры «Судостроение и судоремонт» в рамках гранта Научного фонда провели совместные эксперименты в Бранденбургском техническом университете (Германия). Партнёрство оформляется через Отдел научных исследований и международных связей.',
      },
    ],
    sideLinks: [
      { label: 'Наука и инновации', url: HUB },
      { label: 'Лаборатории и тренажёры', url: '/auditoriyalar' },
      { label: 'Гранты и конкурсы', url: '/sehife/qrantlar' },
      OFFICE_RU,
    ],
    contact: CONTACT_RU,
  },
};

// ── 3. «ADDA-nın Elmi Əsərləri» jurnalı ──────────────────────────────────────
const JOURNAL_PAGE: ElmPageSeed = {
  slug: 'elmi-jurnal',
  dataBlock: 'yox',
  az: {
    title: '«ADDA-nın Elmi Əsərləri» jurnalı',
    lead:
      'Akademiyanın elmi-texniki jurnalı 2003-cü ildən nəşr olunur: Ali Attestasiya Komissiyasının dövri elmi nəşrlər siyahısındadır, ildə iki nömrə çıxır, ' +
      'məqalələr Azərbaycan, rus və ingilis dillərində dərc edilir. Elmi dərəcə iddiaçılarının orijinal tədqiqatları üçün əsas platformadır.',
    seoDescription:
      '«ADDA-nın Elmi Əsərləri»: ISSN 2220-1025, AAK siyahısında, ildə 2 nömrə, 3 dil. Arxiv (2018–2025), bölmələr, məqalələrin tərtibi qaydaları və redaksiya.',
    stepsTitle: 'Məqalə necə təqdim olunur',
    facts: [
      { label: 'ISSN', value: '2220-1025', icon: 'sened' },
      { label: 'Status', value: 'AAK siyahısında', icon: 'qoruma' },
      { label: 'Dövrilik', value: 'İldə 2 nömrə', icon: 'tarix' },
      { label: 'Dillər', value: 'Azərbaycan, rus, ingilis', icon: 'dil' },
    ],
    steps: [
      {
        title: 'Məqaləni qaydalara uyğun hazırlayın',
        who: 'Müəllif',
        body:
          'Həcm 8–10 səhifə, UOT və ya PACS kodu, üç dildə xülasə (100–150 söz) və açar sözlər (ən azı 5), Times New Roman 12, bir interval. Tam qaydalar aşağıdadır.',
      },
      {
        title: 'Rəy və antiplagiat',
        who: 'Müəllif',
        body: 'Antiplagiat yoxlamasının nəticəsi əlavə olunur; müəllif professor deyilsə, məqaləyə rəy də tələb edilir.',
      },
      {
        title: 'Elmi şuranın tövsiyəsi',
        who: 'Müəllifin müəssisəsi',
        body:
          'Məqalənin sonunda onu çapa tövsiyə edən müəssisənin elmi şurası iclasının protokol nömrəsi və tarixi göstərilir. Müəllif(lər) dərcə yazılı razılıq verir.',
      },
      {
        title: 'Redaksiyaya təqdim edin',
        who: 'Redaksiya',
        body: 'Əlyazma 2 nüsxədə və elektron variantda təqdim olunur. Redaksiyanın e-poçtu «Əlaqə» blokundadır.',
      },
    ],
    body: `## Jurnal haqqında

«Azərbaycan Dövlət Dəniz Akademiyasının Elmi Əsərləri» (Proceedings of Azerbaijan State Marine Academy) — Akademiyanın elmi-texniki jurnalı. 2003-cü ildən nəşr olunur, ISSN 2220-1025, qeydiyyat nömrəsi 311.

Jurnal Ali Attestasiya Komissiyasının dövri elmi nəşrlər siyahısına daxildir və elmi dərəcə iddiaçılarının orijinal tədqiqatlarının nəticələrini dərc edir. İldə iki nömrə çıxır; yerli və xarici alimlərin məqalələri Azərbaycan, rus və ingilis dillərində dərc olunur.

Jurnaldan əlavə Akademiyada keçirilən konfransların — professor-müəllim heyətinin, həmçinin tələbə, magistr və gənc tədqiqatçıların — materialları ayrıca toplu kimi nəşr olunur. Beynəlxalq konfransın ən yaxşı məruzələri jurnalda çap edilir — [Elmi konfranslar](/sehife/elmi-konfranslar).

## Bölmələr

1. Gəmiqayırma və gəmi təmiri texnologiyası
2. Gəmiçilik və su nəqliyyatının istismarı
3. Gəmiçilik texnikası
4. Gəmiçilikdə təbiət elmləri problemləri

## Redaksiya heyəti

Heyət baş redaktor, elmi redaktor, məsul katib və dörd bölmənin redaktorlarından ibarətdir. Akademiyanın professorları ilə yanaşı heyətə Rusiya, Ukrayna, Bolqarıstan və Latviyanın dənizçilik və texniki universitetlərinin alimləri daxildir.

## Arxiv

Nömrələr PDF formatındadır (Proceedings of ASMA):

${archiveList((y) => String(y), (n) => `№ ${n}`)}

Siyahıda olmayan nömrələr (2019 № 2, 2021 № 1–2, 2022 № 2) üçün redaksiyaya yazın.

## Müəlliflər üçün: tərtib qaydaları

- **Format.** A4 (210 × 297 mm); sahələr: yuxarı və aşağı 25 mm, sol və sağ 20 mm. Həcm 8–10 səhifədən çox deyil. Times New Roman, 12 ölçü, bir interval; Azərbaycan dilində latın, rus dilində kiril, ingilis dilində ingilis əlifbası.
- **Təsnifat.** Hər məqalədə UOT indeksi və ya PACS kodu.
- **Dil, xülasə, açar sözlər.** Məqalə Azərbaycan, rus və ya ingilis dilində yazılır. Xülasə üç dildə, 100–150 söz, mətnləri eyni və məqalənin məzmununa uyğun; açar sözlər üç dildə, ən azı 5 söz. Mövzu və müəllifin adı, soyadı, atasının adı ingilis dilinə tərcümə olunur.
- **Düsturlar.** Mətndən bir boş sətirlə ayrılır, sətrin sağında dairəvi mötərizədə ərəb rəqəmi ilə ardıcıl nömrələnir; simvol və əmsalların izahı düsturun altında, düsturdakı ardıcıllıqla.
- **Nəticələr.** Elmi yenilik, tətbiqi əhəmiyyət və iqtisadi səmərə aydın göstərilir.
- **Ədəbiyyat.** Mətndə rast gəlinmə ardıcıllığı ilə; istinad [1] və ya [1, s. 119] şəklində; son 5–10 ilin nəşrlərinə üstünlük verilir.
- **Müəllif məlumatı.** Müəllif(lər)in iş yeri və ünvanı, e-poçtu.
- **Sənədlər.** Çapa tövsiyə edən elmi şuranın protokolunun nömrəsi və tarixi; müəllif(lər)in yazılı razılığı; rəy (müəllif professor deyilsə) və antiplagiat; əlyazma 2 nüsxədə və elektron variantda; səhifələr sağ aşağı küncdə karandaşla nömrələnir.

**Əlyazmanın ardıcıllığı:** UOT indeksi (qalın, 11 ölçü, böyük hərflərlə, solda) → məqalənin adı (qalın, 12 ölçü, böyük hərflərlə; UOT ilə arasında iki interval) → müəlliflərin soyadı, adı, atasının adı (qalın, 12 ölçü) → təşkilatın adı, ünvanı, e-poçt (12 ölçü, kursiv) → Xülasə, Abstract, Аннотация → Açar sözlər, Key words, Ключевые слова → Giriş → Məsələnin qoyuluşu → Alınmış nəticələrin analizi → Nəticə → İstifadə olunmuş ədəbiyyat.

## Xarici jurnal seçəndə

Azərbaycan Respublikasının Prezidenti yanında Ali Attestasiya Komissiyası Web of Science bazasının üç sitat indeksindən birinə daxil olan jurnalları nüfuzlu xarici elmi jurnal hesab edir. Jurnalın indeksdə olub-olmadığını [Master Journal List](https://mjl.clarivate.com)-də yoxlayın.`,
    faq: [
      {
        question: 'Məqalə hansı dildə yazıla bilər?',
        answer: 'Azərbaycan, rus və ya ingilis dilində. Xülasə və açar sözlər hər üç dildə verilir.',
      },
      {
        question: 'Jurnal AAK-ın siyahısındadırmı?',
        answer:
          'Bəli. «ADDA-nın Elmi Əsərləri» Ali Attestasiya Komissiyasının dövri elmi nəşrlər siyahısına daxildir və elmi dərəcə iddiaçılarının orijinal tədqiqatlarını dərc edir.',
      },
      {
        question: 'Konfrans materialları harada dərc olunur?',
        answer:
          'Beynəlxalq konfransın materialları ayrıca topluda, tələbə konfransının məruzələri «Tezislər toplusu»nda dərc olunur. Təşkilat komitəsinin qərarı ilə ən yaxşı məruzələr jurnalda çap edilir.',
      },
      {
        question: 'Lazım olan nömrə arxivdə yoxdursa?',
        answer: 'Redaksiyaya yazın — e-poçt «Əlaqə» blokundadır.',
      },
    ],
    sideLinks: [
      { label: 'Elmi konfranslar', url: '/sehife/elmi-konfranslar' },
      { label: 'ADDA Elm Portalı (CRIS)', url: CRIS },
      { label: 'Master Journal List (Web of Science)', url: 'https://mjl.clarivate.com' },
      { label: 'Elm və innovasiya', url: HUB },
    ],
    contact:
      '**Redaksiya:** [elvina.abdullayeva@asco.az](mailto:elvina.abdullayeva@asco.az)\n\n' +
      `**Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsi** — Korpus 1, 4-cü mərtəbə, telefon ${OFFICE_PHONE_AZ}. [Şöbənin səhifəsi](${OFFICE})`,
  },
  en: {
    title: '“Proceedings of Azerbaijan State Marine Academy”',
    lead:
      'The Academy’s scientific and technical journal has been published since 2003. It is on the list of periodicals of the Higher Attestation Commission, ' +
      'appears twice a year and publishes articles in Azerbaijani, Russian and English — the main venue for original research of degree candidates.',
    seoDescription:
      'Proceedings of ADDA: ISSN 2220-1025, listed by the Higher Attestation Commission, 2 issues a year, 3 languages. Archive 2018–2025, sections, author guidelines.',
    stepsTitle: 'How to submit an article',
    facts: [
      { label: 'ISSN', value: '2220-1025', icon: 'sened' },
      { label: 'Status', value: 'Higher Attestation Commission list', icon: 'qoruma' },
      { label: 'Frequency', value: '2 issues a year', icon: 'tarix' },
      { label: 'Languages', value: 'Azerbaijani, Russian, English', icon: 'dil' },
    ],
    steps: [
      {
        title: 'Prepare the article',
        who: 'Author',
        body:
          '8–10 pages, UDC or PACS code, abstracts in three languages (100–150 words) and at least 5 keywords, Times New Roman 12, single spacing. Full rules below.',
      },
      {
        title: 'Review and anti-plagiarism report',
        who: 'Author',
        body: 'Attach the anti-plagiarism report; a review is also required if the author is not a professor.',
      },
      {
        title: 'Recommendation of an academic council',
        who: 'Author’s institution',
        body:
          'State the number and date of the minutes of the academic council that recommends the article for publication. The author(s) give written consent to publication.',
      },
      {
        title: 'Submit to the editorial office',
        who: 'Editorial office',
        body: 'Submit two printed copies and an electronic version. The editorial e-mail is in the Contact block.',
      },
    ],
    body: `## About the journal

“Proceedings of Azerbaijan State Marine Academy” is the Academy’s scientific and technical journal, published since 2003: ISSN 2220-1025, registration number 311.

The journal is on the list of periodicals of the Higher Attestation Commission under the President of the Republic of Azerbaijan and publishes original research of degree candidates. It appears twice a year; articles by Azerbaijani and foreign scientists are published in Azerbaijani, Russian and English.

Papers of the Academy’s conferences — of the teaching staff and of students, master’s students and young researchers — are published in separate proceedings; the best papers of the international conference appear in the journal — [Scientific conferences](/sehife/elmi-konfranslar).

## Sections

1. Shipbuilding and Ship Repair Technology
2. Shipping and Operation of Water Transport
3. Marine Engineering
4. Natural Science Problems in Shipping

## Editorial board

The board consists of the editor-in-chief, the scientific editor, the executive secretary and the editors of the four sections. Besides the Academy’s professors, it includes scientists of maritime and technical universities of Russia, Ukraine, Bulgaria and Latvia.

## Archive

Issues in PDF (Proceedings of ASMA):

${archiveList((y) => String(y), (n) => `No. ${n}`)}

For issues not listed here (2019 No. 2, 2021 Nos. 1–2, 2022 No. 2), please contact the editorial office.

## Guidelines for authors

- **Format.** A4 (210 × 297 mm); margins 25 mm top and bottom, 20 mm left and right; no more than 8–10 pages. Times New Roman 12, single spacing; Latin script for Azerbaijani, Cyrillic for Russian.
- **Classification.** A UDC index or PACS code in every article.
- **Language, abstracts, keywords.** The article may be in Azerbaijani, Russian or English. Abstracts in all three languages, 100–150 words, identical in content; keywords in three languages, at least 5. The title and the author’s full name are translated into English.
- **Formulas.** Separated from the text by a blank line and numbered consecutively with Arabic numerals in round brackets on the right; symbols explained directly below, in the order they appear.
- **Conclusions.** State the scientific novelty, practical significance and economic effect.
- **References.** In order of citation, as [1] or [1, p. 119]; preference for works of the last 5–10 years.
- **Author details.** Institution, its address and the author’s e-mail.
- **Documents.** Number and date of the minutes of the recommending academic council; written consent of the author(s); review (if the author is not a professor) and anti-plagiarism report; two printed copies and an electronic version; pages numbered in pencil in the lower right corner.

**Order of the manuscript:** UDC index → title → authors’ full names → institution, address, e-mail → abstracts (Azerbaijani, English, Russian) → keywords (three languages) → Introduction → Problem statement → Analysis of results → Conclusion → References.

## Choosing a foreign journal

The Higher Attestation Commission regards journals included in one of the three citation indexes of Web of Science as reputable foreign journals. Check a journal in the [Master Journal List](https://mjl.clarivate.com).`,
    faq: [
      {
        question: 'In which language can I write?',
        answer: 'Azerbaijani, Russian or English. Abstracts and keywords are given in all three languages.',
      },
      {
        question: 'Is the journal on the Higher Attestation Commission list?',
        answer: 'Yes. The “Proceedings” is on the Commission’s list of periodicals and publishes original research of degree candidates.',
      },
      {
        question: 'An issue I need is not in the archive — what should I do?',
        answer: 'Write to the editorial office — the e-mail is in the Contact block.',
      },
    ],
    sideLinks: [
      { label: 'Scientific conferences', url: '/sehife/elmi-konfranslar' },
      { label: 'ADDA Research Portal (CRIS)', url: CRIS },
      { label: 'Master Journal List (Web of Science)', url: 'https://mjl.clarivate.com' },
      { label: 'Research and Innovation', url: HUB },
    ],
    contact:
      '**Editorial office:** [elvina.abdullayeva@asco.az](mailto:elvina.abdullayeva@asco.az)\n\n' +
      `**Research and International Relations Department** — Building 1, 4th floor, phone ${OFFICE_PHONE_EN}. [Department page](${OFFICE})`,
  },
  ru: {
    title: 'Журнал «Научные труды АГМА»',
    lead:
      'Научно-технический журнал Академии издаётся с 2003 года: входит в перечень периодических научных изданий ВАК, выходит два раза в год, ' +
      'статьи публикуются на азербайджанском, русском и английском языках. Основная площадка для оригинальных исследований соискателей учёных степеней.',
    seoDescription:
      '«Научные труды АГМА»: ISSN 2220-1025, перечень ВАК, 2 номера в год, 3 языка. Архив 2018–2025, разделы, правила оформления статей, редакция.',
    stepsTitle: 'Как подать статью',
    facts: [
      { label: 'ISSN', value: '2220-1025', icon: 'sened' },
      { label: 'Статус', value: 'Перечень ВАК', icon: 'qoruma' },
      { label: 'Периодичность', value: '2 номера в год', icon: 'tarix' },
      { label: 'Языки', value: 'Азербайджанский, русский, английский', icon: 'dil' },
    ],
    steps: [
      {
        title: 'Подготовьте статью по правилам',
        who: 'Автор',
        body:
          'Объём 8–10 страниц, индекс УДК или код PACS, аннотации на трёх языках (100–150 слов) и не менее 5 ключевых слов, Times New Roman 12, одинарный интервал. Полные правила — ниже.',
      },
      {
        title: 'Рецензия и проверка на плагиат',
        who: 'Автор',
        body: 'Прилагается результат проверки на плагиат; если автор не профессор, нужна и рецензия.',
      },
      {
        title: 'Рекомендация учёного совета',
        who: 'Организация автора',
        body:
          'В конце статьи указываются номер и дата протокола заседания учёного совета, рекомендующего статью к печати. Автор(ы) дают письменное согласие на публикацию.',
      },
      {
        title: 'Передайте в редакцию',
        who: 'Редакция',
        body: 'Рукопись представляется в 2 экземплярах и в электронном виде. Адрес редакции — в блоке «Контакты».',
      },
    ],
    body: `## О журнале

«Научные труды Азербайджанской государственной морской академии» (Proceedings of Azerbaijan State Marine Academy) — научно-технический журнал Академии. Издаётся с 2003 года, ISSN 2220-1025, регистрационный номер 311.

Журнал входит в перечень периодических научных изданий ВАК при Президенте Азербайджанской Республики и публикует результаты оригинальных исследований соискателей учёных степеней. Выходит два раза в год; статьи азербайджанских и зарубежных учёных публикуются на азербайджанском, русском и английском языках.

Помимо журнала, отдельными сборниками издаются материалы конференций Академии — профессорско-преподавательского состава, а также студентов, магистров и молодых исследователей. Лучшие доклады международной конференции публикуются в журнале — [Научные конференции](/sehife/elmi-konfranslar).

## Разделы

1. Технология судостроения и судоремонта
2. Судоходство и эксплуатация водного транспорта
3. Судовая техника
4. Проблемы естествознания в судоходстве

## Редакционная коллегия

В коллегию входят главный редактор, научный редактор, ответственный секретарь и редакторы четырёх разделов. Наряду с профессорами Академии в её составе — учёные морских и технических университетов России, Украины, Болгарии и Латвии.

## Архив

Номера в формате PDF (Proceedings of ASMA):

${archiveList((y) => String(y), (n) => `№ ${n}`)}

По номерам, которых нет в списке (2019 № 2, 2021 № 1–2, 2022 № 2), обращайтесь в редакцию.

## Авторам: правила оформления

- **Формат.** A4 (210 × 297 мм); поля: сверху и снизу 25 мм, слева и справа 20 мм. Объём — не более 8–10 страниц. Times New Roman 12, одинарный интервал; азербайджанский текст — латиницей, русский — кириллицей.
- **Классификация.** В каждой статье — индекс УДК или код PACS.
- **Язык, аннотации, ключевые слова.** Статья пишется на азербайджанском, русском или английском языке. Аннотации на трёх языках, 100–150 слов, идентичные по содержанию; ключевые слова на трёх языках, не менее 5. Название и ФИО автора переводятся на английский.
- **Формулы.** Отделяются от текста пустой строкой и последовательно нумеруются арабскими цифрами в круглых скобках справа; пояснения символов — сразу под формулой в порядке их появления.
- **Выводы.** Чётко указываются научная новизна, прикладное значение и экономический эффект.
- **Литература.** В порядке упоминания в тексте, ссылки вида [1] или [1, с. 119]; предпочтение — источникам последних 5–10 лет.
- **Сведения об авторах.** Место работы, его адрес и электронная почта автора.
- **Документы.** Номер и дата протокола рекомендующего учёного совета; письменное согласие автора(ов); рецензия (если автор не профессор) и проверка на плагиат; рукопись в 2 экземплярах и в электронном виде; страницы нумеруются карандашом в правом нижнем углу.

**Порядок рукописи:** индекс УДК → название статьи → ФИО авторов → организация, адрес, e-mail → аннотации (азербайджанская, английская, русская) → ключевые слова (на трёх языках) → Введение → Постановка задачи → Анализ полученных результатов → Заключение → Литература.

## Выбор зарубежного журнала

ВАК при Президенте Азербайджанской Республики считает авторитетными зарубежными журналами издания, входящие в один из трёх индексов цитирования Web of Science. Проверить журнал можно в [Master Journal List](https://mjl.clarivate.com).`,
    faq: [
      {
        question: 'На каком языке можно написать статью?',
        answer: 'На азербайджанском, русском или английском. Аннотации и ключевые слова даются на всех трёх языках.',
      },
      {
        question: 'Входит ли журнал в перечень ВАК?',
        answer: 'Да. «Научные труды АГМА» входят в перечень периодических научных изданий ВАК и публикуют оригинальные исследования соискателей.',
      },
      {
        question: 'Нужного номера нет в архиве — что делать?',
        answer: 'Напишите в редакцию — адрес в блоке «Контакты».',
      },
    ],
    sideLinks: [
      { label: 'Научные конференции', url: '/sehife/elmi-konfranslar' },
      { label: 'Научный портал ADDA (CRIS)', url: CRIS },
      { label: 'Master Journal List (Web of Science)', url: 'https://mjl.clarivate.com' },
      { label: 'Наука и инновации', url: HUB },
    ],
    contact:
      '**Редакция:** [elvina.abdullayeva@asco.az](mailto:elvina.abdullayeva@asco.az)\n\n' +
      `**Отдел научных исследований и международных связей** — корпус 1, 4-й этаж, телефон ${OFFICE_PHONE_RU}. [Страница отдела](${OFFICE})`,
  },
};

// ── 4. Gənc alimlər və tədqiqatçılar ─────────────────────────────────────────
const YOUNG_PAGE: ElmPageSeed = {
  slug: 'genc-alimler-surasi',
  dataBlock: 'yox',
  az: {
    title: 'Gənc alimlər və tədqiqatçılar',
    lead:
      'Gənc alimlər, doktorantlar, magistrantlar və tələbələr üçün: Gənc Alimlər Şurası, Tələbə Elmi Cəmiyyəti, hər yaz keçirilən elmi-texniki konfrans, ' +
      'akademik yazı təlimləri və qrant imkanları.',
    seoDescription:
      'ADDA-da gənc alimlər: Gənc Alimlər Şurası (2014), Tələbə Elmi Cəmiyyəti, tələbə və gənc tədqiqatçıların konfransı, akademik yazı təlimi, qrantlar.',
    stepsTitle: 'Tələbədən tədqiqatçıya',
    facts: [
      { label: 'Gənc Alimlər Şurası', value: '2014-cü ildən', icon: 'tarix' },
      { label: 'Tələbə konfransı', value: 'Hər il, yazda', icon: 'konfrans' },
      { label: 'Konfrans 2026', value: '167 məruzə, 7 bölmə', icon: 'qrup' },
    ],
    steps: [
      {
        title: 'Tələbə Elmi Cəmiyyətinə qoşulun',
        who: 'Tələbələr',
        body: 'TEC tələbələri elmi işə cəlb edir: seminarlar, debatlar, digər universitetlərin tələbə elmi cəmiyyətləri ilə birgə tədbirlər.',
        linkLabel: 'Tələbə Elmi Cəmiyyəti',
        linkUrl: '/sehife/telebe-elmi-cemiyyeti',
      },
      {
        title: 'Elmi rəhbər və mövzu seçin',
        who: 'Kafedra',
        body: 'Mövzunu kafedrada müəyyənləşdirin. Magistr dissertasiyası antiplagiat yoxlamasından keçir.',
      },
      {
        title: 'İlk məruzənizi edin',
        period: 'Yaz',
        who: 'Tələbə və gənc tədqiqatçıların konfransı',
        body: 'Məruzələr «Tezislər toplusu»nda dərc olunur, bölmələr üzrə ilk üç yer diplomla təltif edilir.',
        linkLabel: 'Elmi konfranslar',
        linkUrl: '/sehife/elmi-konfranslar',
      },
      {
        title: 'Akademik yazını öyrənin',
        who: 'Akademiyanın təlimləri',
        body: '2026-cı ildə 43 müəllim və gənc tədqiqatçı 14 həftəlik (42 saat) «Akademik yazı və etika» təlimində iştirak edib.',
      },
      {
        title: 'Doktoranturaya hazırlaşın',
        who: 'Fəlsəfə doktoru proqramı',
        body: 'Magistraturadan sonra — üç dənizçilik ixtisasında doktorantura.',
        linkLabel: 'Doktoranturaya qəbul',
        linkUrl: '/sehife/doktorantura',
      },
      {
        title: 'Qrant və mübadilə imkanlarına baxın',
        who: 'Elm Fondu və tərəfdaşlar',
        body: 'Azərbaycan Elm Fondunun müsabiqələri, tərəfdaş universitetlərlə mübadilə və xaricdə təhsil proqramları.',
        linkLabel: 'Qrantlar və müsabiqələr',
        linkUrl: '/sehife/qrantlar',
      },
    ],
    body: `## Gənc Alimlər Şurası

Şura gənc alimlərin elmi fəallığını artırmaq məqsədilə 2014-cü ilin dekabrında yaradılıb. Əsas funksiyaları:

- Akademiyanın gənc alimləri, doktorantları və dissertantlarının iştirakı ilə elmi tədbirlərin təşkili;
- gənclərin elmi təşəbbüslərinin dəstəklənməsi və elmi nailiyyətlərinin təbliği;
- gənclərin innovasiya fəaliyyətinin inkişafı;
- gənc alimlərin xarici elmi-tədqiqat təşkilatları və qurumları ilə əlaqələndirilməsi.

## Tələbə Elmi Cəmiyyəti

TEC tələbələri elmi-tədqiqat işinə cəlb edir; cəmiyyətin sədri Akademiyanın Elmi Şurasının üzvüdür. Son tədbirlərdən:

- «Elmi tədqiqat işi necə aparılır?» seminarı — məqalənin strukturu, akademik yazı qaydaları və dürüstlük ([xəbər](${NEWS.tecSeminar}));
- dənizçilikdə süni intellektin hüquqi aspektlərinə dair debat ([xəbər](${NEWS.tecAi}));
- Azərbaycan İdman Akademiyasının Tələbə Elmi Cəmiyyəti ilə əməkdaşlıq ([xəbər](${NEWS.tecAsa})).

Ətraflı: [Tələbə Elmi Cəmiyyəti](/sehife/telebe-elmi-cemiyyeti).

## Tələbə və gənc tədqiqatçıların konfransı

Hər il yazda «Dəniz nəqliyyatının inkişaf perspektivləri» mövzusunda keçirilir. 2026-cı ildə (8–9 aprel) 7 bölmədə 167 məruzə təqdim olunub: gəmiqayırma və gəmi təmiri; dəniz naviqasiyası; gəmi energetik qurğuları; gəmilərin elektrik avadanlıqları və avtomatikası; mexanika; riyaziyyat və informatika; su nəqliyyatının humanitar və dilçilik məsələləri ([xəbər](${NEWS.student2026})).

Məruzələr «Tezislər toplusu»nda dərc olunur, bölmələr üzrə ilk üç yeri tutanlar diplomla təltif edilir. Bütün konfranslar: [Elmi konfranslar](/sehife/elmi-konfranslar).

## Akademik yazı və etika

2026-cı ilin yazında Akademiyanın 43 müəllimi və gənc tədqiqatçısı Türkiyə universitetinin fəxri professoru Hikmət Tahir Karakoçun onlayn «Akademik yazı və etika» təlimində iştirak edib: 14 həftə, 42 saat ([xəbər](${NEWS.writing2026})).

## Qrant və mübadilə imkanları

- Azərbaycan Elm Fondunun müsabiqələri — [Qrantlar və müsabiqələr](/sehife/qrantlar);
- xaricdə təhsil və ixtisasartırma — [ətraflı](/sehife/xaricde-tehsil-ve-ixtisasartirma).`,
    faq: [
      {
        question: 'Gənc Alimlər Şurasına kimlər daxildir?',
        answer:
          'Şura Akademiyanın gənc alimlərini, doktorantlarını və dissertantlarını birləşdirir. Üzvlük və şuranın tərkibi barədə Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsinə müraciət edin.',
      },
      {
        question: 'Tələbə konfransında necə məruzə edə bilərəm?',
        answer: 'Mövzunu kafedranızdakı elmi rəhbərlə seçin. Konfrans elanı Akademiyanın saytında «Elanlar» bölməsində dərc olunur.',
      },
      {
        question: 'Doktoranturaya hazırlığa nədən başlamalı?',
        answer:
          'Magistr dissertasiyanızın mövzusunu gələcək ixtisasınıza yaxın seçin, ilk məruzə və tezislərinizi konfranslarda dərc etdirin. Qəbul qaydası «Doktoranturaya qəbul» səhifəsindədir.',
      },
    ],
    sideLinks: [
      { label: 'Tələbə Elmi Cəmiyyəti', url: '/sehife/telebe-elmi-cemiyyeti' },
      { label: 'Doktoranturaya qəbul', url: '/sehife/doktorantura' },
      { label: 'Elmi konfranslar', url: '/sehife/elmi-konfranslar' },
      { label: 'Qrantlar və müsabiqələr', url: '/sehife/qrantlar' },
      OFFICE_AZ,
    ],
    contact: CONTACT_AZ,
  },
  en: {
    title: 'Young Scientists and Researchers',
    lead:
      'For young scientists, doctoral and master’s students and undergraduates: the Young Scientists Council, the Student Research Society, ' +
      'a research conference every spring, academic writing training and grant opportunities.',
    seoDescription:
      'Young scientists at ADDA: Young Scientists Council (2014), Student Research Society, student and young researchers’ conference, academic writing, grants.',
    stepsTitle: 'From student to researcher',
    facts: [
      { label: 'Young Scientists Council', value: 'Since 2014', icon: 'tarix' },
      { label: 'Student conference', value: 'Every spring', icon: 'konfrans' },
      { label: 'Conference 2026', value: '167 papers, 7 sections', icon: 'qrup' },
    ],
    steps: [
      {
        title: 'Join the Student Research Society',
        who: 'Students',
        body: 'The Society involves students in research: seminars, debates and joint events with research societies of other universities.',
        linkLabel: 'Student Research Society',
        linkUrl: '/sehife/telebe-elmi-cemiyyeti',
      },
      {
        title: 'Choose a supervisor and a topic',
        who: 'Department',
        body: 'Agree your topic in the department. Master’s dissertations are checked for plagiarism.',
      },
      {
        title: 'Give your first paper',
        period: 'Spring',
        who: 'Student and young researchers’ conference',
        body: 'Papers are published in the book of abstracts; the top three in each section receive diplomas.',
        linkLabel: 'Scientific conferences',
        linkUrl: '/sehife/elmi-konfranslar',
      },
      {
        title: 'Learn academic writing',
        who: 'Academy training',
        body: 'In 2026, 43 lecturers and young researchers took the 14-week (42-hour) “Academic writing and ethics” course.',
      },
      {
        title: 'Prepare for doctoral studies',
        who: 'PhD programme',
        body: 'After the master’s degree — doctoral studies in three maritime specialities.',
        linkLabel: 'Doctoral admission',
        linkUrl: '/sehife/doktorantura',
      },
      {
        title: 'Look at grants and exchanges',
        who: 'Science Foundation and partners',
        body: 'Azerbaijan Science Foundation competitions, exchanges with partner universities and study-abroad programmes.',
        linkLabel: 'Grants and competitions',
        linkUrl: '/sehife/qrantlar',
      },
    ],
    body: `## Young Scientists Council

The Council was set up in December 2014 to boost the research activity of young scientists. Its main functions:

- organising research events with the Academy’s young scientists and doctoral students;
- supporting young people’s research initiatives and promoting their achievements;
- developing innovation activity among young researchers;
- connecting young scientists with foreign research organisations.

## Student Research Society

The Society involves students in research; its chair is a member of the Academy’s Academic Council. Recent events include a seminar on how to do research (article structure, academic writing and integrity), a debate on the legal aspects of artificial intelligence in shipping, and cooperation with the student research society of the Azerbaijan Sport Academy. More: [Student Research Society](/sehife/telebe-elmi-cemiyyeti).

## Student and young researchers’ conference

Held every spring on “Prospects for the development of maritime transport”. In 2026 (8–9 April), 167 papers were presented in 7 sections: shipbuilding and ship repair; marine navigation; marine power plants; ship electrical equipment and automation; mechanics; mathematics and computer science; humanities and linguistics of water transport.

Papers are published in the book of abstracts and the top three in each section receive diplomas. All conferences: [Scientific conferences](/sehife/elmi-konfranslar).

## Academic writing and ethics

In spring 2026, 43 of the Academy’s lecturers and young researchers took the online course “Academic writing and ethics” by Hikmet Tahir Karakoç, honorary professor of a Turkish university: 14 weeks, 42 hours.

## Grants and exchanges

- Azerbaijan Science Foundation competitions — [Grants and competitions](/sehife/qrantlar);
- study abroad and professional development — [more](/sehife/xaricde-tehsil-ve-ixtisasartirma).`,
    faq: [
      {
        question: 'Who can join the Young Scientists Council?',
        answer:
          'The Council brings together the Academy’s young scientists and doctoral students. For membership and the current composition, contact the Research and International Relations Department.',
      },
      {
        question: 'How do I present a paper at the student conference?',
        answer: 'Choose a topic with your supervisor in the department. The call for papers is published in the Announcements section of the website.',
      },
    ],
    sideLinks: [
      { label: 'Student Research Society', url: '/sehife/telebe-elmi-cemiyyeti' },
      { label: 'Doctoral admission', url: '/sehife/doktorantura' },
      { label: 'Scientific conferences', url: '/sehife/elmi-konfranslar' },
      { label: 'Grants and competitions', url: '/sehife/qrantlar' },
      OFFICE_EN,
    ],
    contact: CONTACT_EN,
  },
  ru: {
    title: 'Молодые учёные и исследователи',
    lead:
      'Для молодых учёных, докторантов, магистрантов и студентов: Совет молодых учёных, Студенческое научное общество, ежегодная весенняя научно-техническая конференция, ' +
      'курсы академического письма и грантовые возможности.',
    seoDescription:
      'Молодые учёные ADDA: Совет молодых учёных (2014), Студенческое научное общество, конференция студентов и молодых исследователей, академическое письмо, гранты.',
    stepsTitle: 'От студента к исследователю',
    facts: [
      { label: 'Совет молодых учёных', value: 'С 2014 года', icon: 'tarix' },
      { label: 'Студенческая конференция', value: 'Ежегодно, весной', icon: 'konfrans' },
      { label: 'Конференция 2026', value: '167 докладов, 7 секций', icon: 'qrup' },
    ],
    steps: [
      {
        title: 'Вступите в Студенческое научное общество',
        who: 'Студенты',
        body: 'Общество вовлекает студентов в науку: семинары, дебаты, совместные мероприятия с научными обществами других вузов.',
        linkLabel: 'Студенческое научное общество',
        linkUrl: '/sehife/telebe-elmi-cemiyyeti',
      },
      {
        title: 'Выберите руководителя и тему',
        who: 'Кафедра',
        body: 'Определите тему на кафедре. Магистерская диссертация проходит проверку на плагиат.',
      },
      {
        title: 'Сделайте первый доклад',
        period: 'Весна',
        who: 'Конференция студентов и молодых исследователей',
        body: 'Доклады публикуются в «Сборнике тезисов», первые три места в секциях отмечаются дипломами.',
        linkLabel: 'Научные конференции',
        linkUrl: '/sehife/elmi-konfranslar',
      },
      {
        title: 'Освойте академическое письмо',
        who: 'Курсы Академии',
        body: 'В 2026 году 43 преподавателя и молодых исследователя прошли 14-недельный (42 часа) курс «Академическое письмо и этика».',
      },
      {
        title: 'Готовьтесь к докторантуре',
        who: 'Программа доктора философии',
        body: 'После магистратуры — докторантура по трём морским специальностям.',
        linkLabel: 'Приём в докторантуру',
        linkUrl: '/sehife/doktorantura',
      },
      {
        title: 'Изучите гранты и обмены',
        who: 'Научный фонд и партнёры',
        body: 'Конкурсы Научного фонда Азербайджана, обмен с университетами-партнёрами и программы обучения за рубежом.',
        linkLabel: 'Гранты и конкурсы',
        linkUrl: '/sehife/qrantlar',
      },
    ],
    body: `## Совет молодых учёных

Совет создан в декабре 2014 года для повышения научной активности молодых учёных. Основные функции:

- организация научных мероприятий с участием молодых учёных, докторантов и диссертантов Академии;
- поддержка научных инициатив молодёжи и популяризация её научных достижений;
- развитие инновационной деятельности молодёжи;
- установление связей молодых учёных с зарубежными научно-исследовательскими организациями.

## Студенческое научное общество

Общество вовлекает студентов в научную работу; его председатель — член Учёного совета Академии. Среди последних мероприятий — семинар «Как вести научное исследование?» (структура статьи, академическое письмо и честность), дебаты о правовых аспектах искусственного интеллекта в судоходстве, сотрудничество со студенческим научным обществом Азербайджанской академии спорта. Подробнее: [Студенческое научное общество](/sehife/telebe-elmi-cemiyyeti).

## Конференция студентов и молодых исследователей

Проводится каждую весну по теме «Перспективы развития морского транспорта». В 2026 году (8–9 апреля) в 7 секциях представлено 167 докладов: судостроение и судоремонт; судовождение; судовые энергетические установки; электрооборудование и автоматика судов; механика; математика и информатика; гуманитарные и лингвистические вопросы водного транспорта.

Доклады публикуются в «Сборнике тезисов», первые три места в секциях отмечаются дипломами. Все конференции: [Научные конференции](/sehife/elmi-konfranslar).

## Академическое письмо и этика

Весной 2026 года 43 преподавателя и молодых исследователя Академии прошли онлайн-курс «Академическое письмо и этика» почётного профессора турецкого университета Хикмета Тахира Каракоча: 14 недель, 42 часа.

## Гранты и обмены

- конкурсы Научного фонда Азербайджана — [Гранты и конкурсы](/sehife/qrantlar);
- обучение за рубежом и повышение квалификации — [подробнее](/sehife/xaricde-tehsil-ve-ixtisasartirma).`,
    faq: [
      {
        question: 'Кто входит в Совет молодых учёных?',
        answer:
          'Совет объединяет молодых учёных, докторантов и диссертантов Академии. О членстве и составе совета узнайте в Отделе научных исследований и международных связей.',
      },
      {
        question: 'Как выступить на студенческой конференции?',
        answer: 'Выберите тему с научным руководителем на кафедре. Объявление о конференции публикуется на сайте Академии в разделе «Объявления».',
      },
    ],
    sideLinks: [
      { label: 'Студенческое научное общество', url: '/sehife/telebe-elmi-cemiyyeti' },
      { label: 'Приём в докторантуру', url: '/sehife/doktorantura' },
      { label: 'Научные конференции', url: '/sehife/elmi-konfranslar' },
      { label: 'Гранты и конкурсы', url: '/sehife/qrantlar' },
      OFFICE_RU,
    ],
    contact: CONTACT_RU,
  },
};

// ── 5. Elmi konfranslar (canlı blok: adında «konfrans» olan tədbir və xəbərlər) ─
const CONF_PAGE: ElmPageSeed = {
  slug: 'elmi-konfranslar',
  dataBlock: 'konfrans',
  az: {
    title: 'Elmi konfranslar',
    lead:
      'Akademiyada hər il iki elmi konfrans keçirilir: may ayında «Su nəqliyyatının problemləri» beynəlxalq elmi-texniki konfransı, yazda isə tələbə, magistr və ' +
      'gənc tədqiqatçıların konfransı. Elanlar və nəticələr bu səhifədədir.',
    seoDescription:
      'ADDA-nın elmi konfransları: «Su nəqliyyatının problemləri» beynəlxalq konfransı (may), tələbə və gənc tədqiqatçıların konfransı (yaz), bölmələr, materiallar.',
    stepsTitle: 'Konfransda iştirak',
    facts: [
      { label: 'Beynəlxalq konfrans', value: 'Hər il, may', icon: 'konfrans' },
      { label: 'Bölmə', value: '5', icon: 'qrup' },
      { label: 'XX konfrans (2025)', value: '73 məruzə', icon: 'beynelxalq' },
      { label: 'Tələbə konfransı (2026)', value: '167 məruzə', icon: 'konfrans' },
    ],
    steps: [
      {
        track: 'Beynəlxalq konfrans',
        title: 'Elanı izləyin',
        period: 'Yaz',
        who: 'Akademiyanın saytı',
        body: 'Konfransın mövzusu, bölmələri və tələbləri «Elanlar»da və bu səhifədə dərc olunur.',
        linkLabel: 'Elanlar',
        linkUrl: '/elanlar',
      },
      {
        track: 'Beynəlxalq konfrans',
        title: 'Məruzəni təqdim edin',
        who: 'Təşkilat komitəsi',
        body: 'Məruzə beş bölmədən birinə uyğun hazırlanır; materiallar konfrans toplusunda dərc olunur.',
      },
      {
        track: 'Beynəlxalq konfrans',
        title: 'Bölmə iclasında çıxış edin',
        period: 'May',
        who: 'Plenar və bölmə iclasları',
        body: 'Konfrans adətən iki gün davam edir: açılışda plenar iclas, sonra bölmə iclasları.',
      },
      {
        track: 'Beynəlxalq konfrans',
        title: 'Ən yaxşı məruzələr — jurnalda',
        who: '«Elmi Əsərlər» jurnalı',
        body: 'Təşkilat komitəsinin qərarı ilə ən yaxşı məruzə materialları «ADDA-nın Elmi Əsərləri» jurnalında çap olunur.',
        linkLabel: '«Elmi Əsərlər» jurnalı',
        linkUrl: '/sehife/elmi-jurnal',
      },
      {
        track: 'Tələbə konfransı',
        title: 'Mövzu və elmi rəhbər',
        who: 'Kafedra',
        body: 'Tələbə, magistrant və gənc tədqiqatçılar məruzəni elmi rəhbərlə hazırlayır.',
      },
      {
        track: 'Tələbə konfransı',
        title: 'Bölmədə məruzə',
        period: 'Yaz',
        who: 'Konfransın bölmələri',
        body: 'Məruzələr bölmələrdə dinlənilir; ilk üç yer diplomla təltif olunur.',
      },
      {
        track: 'Tələbə konfransı',
        title: 'Tezislər toplusu',
        who: 'Akademiya',
        body: 'Məruzələr «Tezislər toplusu»nda dərc edilir.',
      },
    ],
    body: `## «Su nəqliyyatının problemləri» beynəlxalq elmi-texniki konfransı

Hər il Ümummilli lider Heydər Əliyevin anadan olmasının ildönümünə həsr olunur. Məqsəd — müxtəlif ölkələrin universitet, akademiya və elmi-tədqiqat institutlarının alimlərini, gənc tədqiqatçıları və istehsalatın aparıcı mütəxəssislərini bir araya gətirmək, nailiyyət və təcrübəni təhlil etmək, ortaq problemlərin həllinə dair təkliflər irəli sürmək.

Konfransda Azərbaycanın ali təhsil və elm müəssisələri ilə yanaşı Türkiyə, Rusiya, ABŞ, Ukrayna, Gürcüstan, Latviya, Polşa, Qazaxıstan və digər ölkələrin alimləri iştirak edir.

**Bölmələr:**

1. Gəmiqayırma və gəmi təmiri texnologiyası
2. Gəmiçilik və su nəqliyyatının istismarı
3. Gəmiçilik texnikası
4. Gəmiçilikdə təbiət elmlərinin problemləri
5. Gəmiçilikdə humanitar və dilçilik problemləri

Konfransın materialları ayrıca topluda dərc olunur; ən yaxşı məruzələr «ADDA-nın Elmi Əsərləri» jurnalında çap edilir.

## Son konfranslar

- **XX konfrans** — 1–2 may 2025: 73 məruzə, o cümlədən xarici ölkələrdən 5 ([xəbər](${NEWS.conf2025})).
- **XVII konfrans** — 5–6 may 2022, onlayn ([xəbər](${NEWS.conf2022})); məruzə materialları ayrıca topluda çap olunub ([xəbər](${NEWS.conf2022Proc})).
- **XII konfrans** — may 2017: 100-ə yaxın məruzə; Azərbaycanın 11 ali təhsil və elm müəssisəsi, Türkiyə, Rusiya, Ukrayna və Gürcüstan alimləri ([xəbər](${NEWS.conf2017})).

## Tələbə, magistr və gənc tədqiqatçıların konfransı

«Dəniz nəqliyyatının inkişaf perspektivləri» — hər il yazda, Ümummilli liderin anadan olmasının ildönümünə həsr olunur. Konfrans tələbələri elmi yaradıcılığa həvəsləndirir, fikirlərini sərbəst və aydın ifadə etməyə şərait yaradır.

2026-cı ildə (8–9 aprel) 7 bölmədə 167 məruzə dinlənilib ([xəbər](${NEWS.student2026})). Bölmələr üzrə ilk üç yeri tutanlar diplomla təltif olunur, məruzələr «Tezislər toplusu»nda dərc edilir. Gənc tədqiqatçılar üçün digər imkanlar: [Gənc alimlər və tədqiqatçılar](/sehife/genc-alimler-surasi).

## Digər elmi tədbirlər

- **V Beynəlxalq Avrasiya Risk konfransı (RİSK-2023)** — «Təbii və texnogen risklərin minimallaşdırılması üzrə innovasiyalar»: təbii və istehsalat riskləri, o cümlədən gəmiçilik, yükdaşıma və liman əməliyyatları ilə bağlı risklər ([ətraflı](${RISK_2023})).
- **Təlim və seminarlar** — «Akademik yazı və etika» (2026, [xəbər](${NEWS.writing2026})), Tələbə Elmi Cəmiyyətinin elmi tədqiqat metodları seminarı ([xəbər](${NEWS.tecSeminar})).
- **Xaricdə konfranslar** — 2025-ci ilin noyabrında ADDA alimləri Brandenburq Texniki Universitetində NESEFF (enerji təchizatı və enerji səmərəliliyi şəbəkəsi) beynəlxalq konfransında iştirak edib ([xəbər](${NEWS.btu2025})).`,
    faq: [
      {
        question: 'Xarici alim konfransda iştirak edə bilərmi?',
        answer:
          'Bəli — konfrans beynəlxalqdır. Elan dərc olunanda məruzəni bölmələrdən birinə uyğun hazırlayın; təşkilati suallar üçün Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsinə yazın.',
      },
      {
        question: 'Konfrans materiallarını haradan tapım?',
        answer:
          'Beynəlxalq konfransın materialları ayrıca topluda dərc olunur; ən yaxşı məruzələr «Elmi Əsərlər» jurnalındadır — arxiv jurnal səhifəsində.',
      },
      {
        question: 'Növbəti konfrans nə vaxt elan olunur?',
        answer:
          'Elan «Elanlar» bölməsində dərc olunur. Konfrans «Tədbirlər» bölməsinə əlavə ediləndə bu səhifənin «Növbəti elmi tədbirlər» blokunda avtomatik görünür.',
      },
    ],
    sideLinks: [
      { label: '«Elmi Əsərlər» jurnalı', url: '/sehife/elmi-jurnal' },
      { label: 'Gənc alimlər və tədqiqatçılar', url: '/sehife/genc-alimler-surasi' },
      { label: 'Elanlar', url: '/elanlar' },
      { label: 'Tədbirlər', url: '/tedbirler' },
      OFFICE_AZ,
    ],
    contact: CONTACT_AZ,
  },
  en: {
    title: 'Scientific Conferences',
    lead:
      'The Academy holds two research conferences every year: the international scientific and technical conference “Problems of Water Transport” in May, ' +
      'and the conference of students, master’s students and young researchers in spring. Announcements and results are on this page.',
    seoDescription:
      'ADDA conferences: the international conference “Problems of Water Transport” (May), the student and young researchers’ conference (spring), sections, proceedings.',
    stepsTitle: 'Taking part',
    facts: [
      { label: 'International conference', value: 'Every May', icon: 'konfrans' },
      { label: 'Sections', value: '5', icon: 'qrup' },
      { label: '20th conference (2025)', value: '73 papers', icon: 'beynelxalq' },
      { label: 'Student conference (2026)', value: '167 papers', icon: 'konfrans' },
    ],
    steps: [
      {
        track: 'International conference',
        title: 'Watch for the call',
        period: 'Spring',
        who: 'Academy website',
        body: 'The theme, sections and requirements are published in Announcements and on this page.',
        linkLabel: 'Announcements',
        linkUrl: '/elanlar',
      },
      {
        track: 'International conference',
        title: 'Submit your paper',
        who: 'Organising committee',
        body: 'Prepare the paper for one of the five sections; papers are published in the conference proceedings.',
      },
      {
        track: 'International conference',
        title: 'Present at a section meeting',
        period: 'May',
        who: 'Plenary and section meetings',
        body: 'The conference usually lasts two days: a plenary session at the opening, then section meetings.',
      },
      {
        track: 'International conference',
        title: 'Best papers go to the journal',
        who: 'The “Proceedings” journal',
        body: 'By decision of the organising committee, the best papers are published in the “Proceedings of Azerbaijan State Marine Academy”.',
        linkLabel: 'The “Proceedings” journal',
        linkUrl: '/sehife/elmi-jurnal',
      },
      {
        track: 'Student conference',
        title: 'Topic and supervisor',
        who: 'Department',
        body: 'Students, master’s students and young researchers prepare their papers with a supervisor.',
      },
      {
        track: 'Student conference',
        title: 'Section presentation',
        period: 'Spring',
        who: 'Conference sections',
        body: 'Papers are heard in sections; the top three receive diplomas.',
      },
      {
        track: 'Student conference',
        title: 'Book of abstracts',
        who: 'Academy',
        body: 'Papers are published in the book of abstracts.',
      },
    ],
    body: `## International conference “Problems of Water Transport”

Held every year in honour of the anniversary of the birth of national leader Heydar Aliyev. It brings together scientists of universities, academies and research institutes from different countries, young researchers and leading industry specialists to analyse achievements and experience and to propose solutions to common problems.

Besides Azerbaijani universities and research institutions, scientists from Türkiye, Russia, the USA, Ukraine, Georgia, Latvia, Poland, Kazakhstan and other countries take part.

**Sections:**

1. Shipbuilding and Ship Repair Technology
2. Shipping and Operation of Water Transport
3. Marine Engineering
4. Natural Science Problems in Shipping
5. Humanities and Linguistics in Shipping

Conference papers are published in separate proceedings; the best appear in the “Proceedings of Azerbaijan State Marine Academy”.

## Recent conferences

- **20th conference** — 1–2 May 2025: 73 papers, including 5 from abroad.
- **17th conference** — 5–6 May 2022, online; the papers were published in separate proceedings.
- **12th conference** — May 2017: about 100 papers; 11 Azerbaijani universities and research institutions and scientists from Türkiye, Russia, Ukraine and Georgia.

## Conference of students, master’s students and young researchers

“Prospects for the development of maritime transport” — held every spring in honour of the national leader’s birth anniversary. It encourages students to do research and to express their ideas freely and clearly.

In 2026 (8–9 April), 167 papers were heard in 7 sections. The top three in each section receive diplomas and papers are published in the book of abstracts. More for young researchers: [Young scientists and researchers](/sehife/genc-alimler-surasi).

## Other research events

- **5th International Eurasian Risk Conference (RISK-2023)** — “Innovations in minimising natural and man-made risks”, including risks in shipping, cargo transport and port operations ([details, in Azerbaijani](/az${RISK_2023})).
- **Training and seminars** — “Academic writing and ethics” (2026) and the Student Research Society seminar on research methods.
- **Conferences abroad** — in November 2025, ADDA scientists took part in the international conference of the NESEFF network (energy supply and energy efficiency) at the Brandenburg University of Technology.`,
    faq: [
      {
        question: 'Can foreign scientists take part?',
        answer:
          'Yes — the conference is international. When the call is published, prepare your paper for one of the sections; for organisational questions, write to the Research and International Relations Department.',
      },
      {
        question: 'Where can I find the proceedings?',
        answer: 'The international conference papers are published in separate proceedings; the best papers are in the “Proceedings” journal, whose archive is on the journal page.',
      },
    ],
    sideLinks: [
      { label: 'The “Proceedings” journal', url: '/sehife/elmi-jurnal' },
      { label: 'Young scientists and researchers', url: '/sehife/genc-alimler-surasi' },
      { label: 'Announcements', url: '/elanlar' },
      { label: 'Events', url: '/tedbirler' },
      OFFICE_EN,
    ],
    contact: CONTACT_EN,
  },
  ru: {
    title: 'Научные конференции',
    lead:
      'В Академии ежегодно проходят две научные конференции: в мае — международная научно-техническая конференция «Проблемы водного транспорта», ' +
      'весной — конференция студентов, магистров и молодых исследователей. Объявления и итоги — на этой странице.',
    seoDescription:
      'Конференции ADDA: международная конференция «Проблемы водного транспорта» (май), конференция студентов и молодых исследователей (весна), секции, сборники.',
    stepsTitle: 'Участие в конференции',
    facts: [
      { label: 'Международная конференция', value: 'Ежегодно, май', icon: 'konfrans' },
      { label: 'Секции', value: '5', icon: 'qrup' },
      { label: 'XX конференция (2025)', value: '73 доклада', icon: 'beynelxalq' },
      { label: 'Студенческая конференция (2026)', value: '167 докладов', icon: 'konfrans' },
    ],
    steps: [
      {
        track: 'Международная конференция',
        title: 'Следите за объявлением',
        period: 'Весна',
        who: 'Сайт Академии',
        body: 'Тема, секции и требования публикуются в «Объявлениях» и на этой странице.',
        linkLabel: 'Объявления',
        linkUrl: '/elanlar',
      },
      {
        track: 'Международная конференция',
        title: 'Подайте доклад',
        who: 'Оргкомитет',
        body: 'Доклад готовится для одной из пяти секций; материалы публикуются в сборнике конференции.',
      },
      {
        track: 'Международная конференция',
        title: 'Выступите на секции',
        period: 'Май',
        who: 'Пленарное и секционные заседания',
        body: 'Конференция обычно длится два дня: пленарное заседание на открытии, затем секции.',
      },
      {
        track: 'Международная конференция',
        title: 'Лучшие доклады — в журнале',
        who: 'Журнал «Научные труды»',
        body: 'По решению оргкомитета лучшие материалы публикуются в журнале «Научные труды АГМА».',
        linkLabel: 'Журнал «Научные труды»',
        linkUrl: '/sehife/elmi-jurnal',
      },
      {
        track: 'Студенческая конференция',
        title: 'Тема и руководитель',
        who: 'Кафедра',
        body: 'Студенты, магистранты и молодые исследователи готовят доклад с научным руководителем.',
      },
      {
        track: 'Студенческая конференция',
        title: 'Доклад на секции',
        period: 'Весна',
        who: 'Секции конференции',
        body: 'Доклады заслушиваются по секциям; первые три места отмечаются дипломами.',
      },
      {
        track: 'Студенческая конференция',
        title: 'Сборник тезисов',
        who: 'Академия',
        body: 'Доклады публикуются в «Сборнике тезисов».',
      },
    ],
    body: `## Международная научно-техническая конференция «Проблемы водного транспорта»

Проводится ежегодно и посвящается дню рождения общенационального лидера Гейдара Алиева. Цель — собрать учёных университетов, академий и научно-исследовательских институтов разных стран, молодых исследователей и ведущих специалистов отрасли, проанализировать достижения и опыт, выдвинуть решения общих проблем.

Наряду с вузами и научными учреждениями Азербайджана в конференции участвуют учёные Турции, России, США, Украины, Грузии, Латвии, Польши, Казахстана и других стран.

**Секции:**

1. Технология судостроения и судоремонта
2. Судоходство и эксплуатация водного транспорта
3. Судовая техника
4. Проблемы естествознания в судоходстве
5. Гуманитарные и лингвистические проблемы судоходства

Материалы конференции издаются отдельным сборником; лучшие доклады публикуются в журнале «Научные труды АГМА».

## Последние конференции

- **XX конференция** — 1–2 мая 2025 года: 73 доклада, в том числе 5 из-за рубежа.
- **XVII конференция** — 5–6 мая 2022 года, онлайн; материалы изданы отдельным сборником.
- **XII конференция** — май 2017 года: около 100 докладов; 11 вузов и научных учреждений Азербайджана, учёные Турции, России, Украины и Грузии.

## Конференция студентов, магистров и молодых исследователей

«Перспективы развития морского транспорта» — проводится каждую весну и посвящается дню рождения общенационального лидера. Конференция поощряет студентов к научному творчеству и помогает свободно и ясно излагать свои идеи.

В 2026 году (8–9 апреля) в 7 секциях заслушано 167 докладов. Первые три места в секциях отмечаются дипломами, доклады публикуются в «Сборнике тезисов». Другие возможности для молодых исследователей: [Молодые учёные и исследователи](/sehife/genc-alimler-surasi).

## Другие научные мероприятия

- **V Международная Евразийская конференция по рискам (RISK-2023)** — «Инновации в минимизации природных и техногенных рисков», в том числе рисков судоходства, перевозок и портовых операций ([подробнее, на азербайджанском](/az${RISK_2023})).
- **Курсы и семинары** — «Академическое письмо и этика» (2026), семинар Студенческого научного общества о методах исследования.
- **Конференции за рубежом** — в ноябре 2025 года учёные ADDA участвовали в международной конференции сети NESEFF (энергоснабжение и энергоэффективность) в Бранденбургском техническом университете.`,
    faq: [
      {
        question: 'Могут ли участвовать зарубежные учёные?',
        answer:
          'Да — конференция международная. После объявления подготовьте доклад для одной из секций; по организационным вопросам пишите в Отдел научных исследований и международных связей.',
      },
      {
        question: 'Где найти материалы конференций?',
        answer: 'Материалы международной конференции издаются отдельным сборником; лучшие доклады — в журнале «Научные труды», архив на странице журнала.',
      },
    ],
    sideLinks: [
      { label: 'Журнал «Научные труды»', url: '/sehife/elmi-jurnal' },
      { label: 'Молодые учёные и исследователи', url: '/sehife/genc-alimler-surasi' },
      { label: 'Объявления', url: '/elanlar' },
      { label: 'Мероприятия', url: '/tedbirler' },
      OFFICE_RU,
    ],
    contact: CONTACT_RU,
  },
};

// ── 6. Qrantlar və müsabiqələr (yeni səhifə) ─────────────────────────────────
const GRANTS_PAGE: ElmPageSeed = {
  slug: 'qrantlar',
  dataBlock: 'yox',
  az: {
    title: 'Qrantlar və müsabiqələr',
    lead:
      'Tədqiqat layihəsi üçün maliyyə: Azərbaycan Elm Fondunun müsabiqələri, beynəlxalq proqramlar və tərəfdaşlarla birgə layihələr. ' +
      'ADDA alimləri Elm Fondunun 2024-cü il «Əsas qrant müsabiqəsi»nin qalibləri arasındadır.',
    seoDescription:
      'ADDA-da qrantlar: Azərbaycan Elm Fondunun müsabiqələri, 2024–2026 qrant layihəsi (200 000 AZN), beynəlxalq tərəfdaşlar, müraciətə hazırlıq addımları.',
    stepsTitle: 'Qrant müraciəti: addımlar',
    facts: [
      { label: 'Elm Fondu qrantı', value: '200 000 AZN', icon: 'haqq' },
      { label: 'Layihə müddəti', value: '2024–2026', icon: 'muddet' },
      { label: 'Tərəfdaş', value: 'Azərbaycan Texniki Universiteti', icon: 'qrup' },
      { label: 'Beynəlxalq tərəfdaş', value: 'Brandenburq TU (Almaniya)', icon: 'beynelxalq' },
    ],
    steps: [
      {
        title: 'Müsabiqəni seçin',
        who: 'Azərbaycan Elm Fondu və digər fondlar',
        body: 'Elm Fondu müsabiqələri öz saytında elan edir: şərtləri, maliyyələşmənin həcmini və son tarixi əvvəlcədən oxuyun.',
        linkLabel: 'aef.gov.az',
        linkUrl: AEF,
      },
      {
        title: 'Komanda və tərəfdaş toplayın',
        who: 'Kafedra, digər universitetlər',
        body: 'Layihə kafedranın elmi istiqamətinə uyğun qurulur. Digər universitet və ya xarici tərəfdaşla birgə müraciət mümkündür.',
      },
      {
        title: 'Müraciəti hazırlayın',
        who: 'Layihə rəhbəri',
        body: 'Məqsəd, metodika, gözlənilən nəticə, iş planı və büdcə. Nəşr siyahınızı və ORCID profilinizi yeniləyin.',
      },
      {
        title: 'Şöbə ilə əlaqə saxlayın',
        who: 'Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsi',
        body: 'Şöbə beynəlxalq layihə və əməkdaşlıq müqavilələrinin hazırlanmasında iştirak edir — müraciətdən əvvəl məsləhətləşin.',
        linkLabel: 'Şöbənin səhifəsi',
        linkUrl: OFFICE,
      },
      {
        title: 'İcra və hesabat',
        who: 'Layihə komandası',
        body: 'Nəticələr məqalələrdə, konfranslarda və Akademiyanın illik elmi hesabatında əks olunur.',
      },
    ],
    body: `## Azərbaycan Elm Fondu

Azərbaycan Elm Fondu elmi-tədqiqat layihələrini müsabiqə əsasında maliyyələşdirir; müsabiqələr və nəticələr [aef.gov.az](${AEF}) saytında elan olunur.

**2024-cü il «Əsas qrant müsabiqəsi».** ADDA-nın «Gəmiqayırma və gəmi təmiri» kafedrası və Azərbaycan Texniki Universitetinin «Maşınqayırma texnologiyası» kafedrasının alimləri «Rəqəmli proqramla idarə olunan dəzgahlarda iqtisadi emal şərtlərinin texnoloji təminatı» layihəsi ilə qalib gəlib.

- **Xarakter:** fundamental-tətbiqi;
- **İstiqamətlər:** gəmiqayırma və gəmi təmiri texnologiyası, maşınqayırma texnologiyası, maşınlar, aqreqatlar və proseslər, standartlaşdırma və məhsulun keyfiyyətinin idarə olunması, mexaniki və fiziki-texniki emal prosesləri, riyazi modelləşdirmə;
- **Maliyyələşmə:** 200 min manat, Elm Fondunun büdcəsindən;
- **Müddət:** 2024–2026.

[Müsabiqənin nəticələri](${AEF_2024}) · [xəbər](${NEWS.grant2024})

**Beynəlxalq hissə.** Layihə çərçivəsində kafedranın alimləri 2025-ci ilin noyabrında Almaniyanın Brandenburq Texniki Universitetində elmi ezamiyyətdə olub: nəticələr müzakirə edilib, universitet laboratoriyalarında ilkin eksperimentlər aparılıb, NESEFF beynəlxalq konfransında iştirak olunub. Məqsəd — birgə tədqiqatların nəticələrini yüksək reytinqli jurnallarda birgə dərc etmək ([xəbər](${NEWS.btu2025})).

## Beynəlxalq proqramlar və tərəfdaşlar

- **Türk Loydu** — elmi-tədqiqat və innovasiya layihələrində, beynəlxalq qrant proqramlarında birgə iştirak imkanları müzakirə olunub ([xəbər](${NEWS.turkLoydu})).
- Xarici universitetlərlə əməkdaşlıq — [Beynəlxalq əməkdaşlıq](/sehife/beynelxalq-emekdasliq).

## Müraciətə hazırlıq

- Mövzu kafedranın elmi-tədqiqat planına və Akademiyanın tədqiqat istiqamətlərinə uyğun olsun — [istiqamətlər](${HUB}).
- Nəşrləriniz [Elm Portalında](${CRIS}) və ORCID-də tam olsun: müsabiqədə müraciətçinin elmi nəticələrinə baxılır.
- Büdcəni iş planı ilə bağlayın: avadanlıq, materiallar, ezamiyyət və nəşr xərcləri ayrıca göstərilir.`,
    faq: [
      {
        question: 'Müsabiqə elanını harada görüm?',
        answer:
          'Azərbaycan Elm Fondunun saytında (aef.gov.az). Akademiyaya gələn müsabiqə və tərəfdaşlıq təklifləri barədə Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsi məlumat verir.',
      },
      {
        question: 'Başqa universitetlə birgə müraciət etmək olarmı?',
        answer: 'Bəli. 2024-cü ilin qalib layihəsi ADDA və Azərbaycan Texniki Universitetinin kafedralarının birgə layihəsidir.',
      },
      {
        question: 'Gənc tədqiqatçılar üçün imkan varmı?',
        answer:
          'Bəli: tələbə və gənc tədqiqatçıların elmi-texniki konfransı, akademik yazı təlimi, mübadilə və xaricdə təhsil proqramları — «Gənc alimlər və tədqiqatçılar» səhifəsində. Elanları izləyin və şöbə ilə əlaqə saxlayın.',
      },
    ],
    sideLinks: [
      { label: 'Azərbaycan Elm Fondu', url: AEF },
      OFFICE_AZ,
      { label: 'ADDA Elm Portalı (CRIS)', url: CRIS },
      { label: 'Beynəlxalq əməkdaşlıq', url: '/sehife/beynelxalq-emekdasliq' },
      { label: 'Gənc alimlər və tədqiqatçılar', url: '/sehife/genc-alimler-surasi' },
    ],
    contact: CONTACT_AZ,
  },
  en: {
    title: 'Grants and Competitions',
    lead:
      'Funding for research projects: Azerbaijan Science Foundation competitions, international programmes and joint projects with partners. ' +
      'ADDA scientists are among the winners of the Foundation’s 2024 Main Grant Competition.',
    seoDescription:
      'Grants at ADDA: Azerbaijan Science Foundation competitions, the 2024–2026 grant project (AZN 200,000), international partners and how to prepare an application.',
    stepsTitle: 'Applying for a grant',
    facts: [
      { label: 'Science Foundation grant', value: 'AZN 200,000', icon: 'haqq' },
      { label: 'Project period', value: '2024–2026', icon: 'muddet' },
      { label: 'Partner', value: 'Azerbaijan Technical University', icon: 'qrup' },
      { label: 'International partner', value: 'BTU (Germany)', icon: 'beynelxalq' },
    ],
    steps: [
      {
        title: 'Choose a competition',
        who: 'Azerbaijan Science Foundation and other funders',
        body: 'The Foundation announces competitions on its website: read the conditions, funding level and deadline in advance.',
        linkLabel: 'aef.gov.az',
        linkUrl: AEF,
      },
      {
        title: 'Build a team and find partners',
        who: 'Department, other universities',
        body: 'The project follows the department’s research area. Joint applications with another university or a foreign partner are possible.',
      },
      {
        title: 'Prepare the application',
        who: 'Project leader',
        body: 'Aims, methods, expected results, work plan and budget. Update your publication list and ORCID profile.',
      },
      {
        title: 'Contact the research office',
        who: 'Research and International Relations Department',
        body: 'The department takes part in preparing international projects and cooperation agreements — consult it before applying.',
        linkLabel: 'Department page',
        linkUrl: OFFICE,
      },
      {
        title: 'Deliver and report',
        who: 'Project team',
        body: 'Results appear in articles, at conferences and in the Academy’s annual research report.',
      },
    ],
    body: `## Azerbaijan Science Foundation

The Azerbaijan Science Foundation funds research projects through competitions announced on [aef.gov.az](${AEF}).

**2024 Main Grant Competition.** Scientists of ADDA’s Shipbuilding and Ship Repair department and of the Mechanical Engineering Technology department of Azerbaijan Technical University won with the project “Technological support of economical machining conditions on numerically controlled machines”.

- **Type:** fundamental and applied;
- **Fields:** shipbuilding and ship repair technology, mechanical engineering technology, machines, units and processes, standardisation and product quality management, mechanical and physical-technical processing, mathematical modelling;
- **Funding:** AZN 200,000 from the Foundation’s budget;
- **Period:** 2024–2026.

[Competition results](${AEF_2024})

**International part.** In November 2025, the department’s scientists visited the Brandenburg University of Technology (Germany) under the project: they discussed results, carried out initial experiments in the university’s laboratories and took part in the NESEFF international conference. The aim is to publish joint results in high-ranking journals.

## International programmes and partners

- **Türk Loydu** — opportunities for joint research and innovation projects and international grant programmes have been discussed.
- Cooperation with foreign universities — [International cooperation](/sehife/beynelxalq-emekdasliq).

## Preparing an application

- Match the topic to your department’s research plan and the Academy’s research areas — [research areas](${HUB}).
- Keep your publications complete on the [Research Portal](${CRIS}) and ORCID: reviewers look at the applicant’s track record.
- Link the budget to the work plan: equipment, materials, travel and publication costs listed separately.`,
    faq: [
      {
        question: 'Where are competitions announced?',
        answer:
          'On the Azerbaijan Science Foundation website (aef.gov.az). The Research and International Relations Department informs staff about calls and partnership offers received by the Academy.',
      },
      {
        question: 'Can we apply jointly with another university?',
        answer: 'Yes. The 2024 winning project is a joint project of departments of ADDA and Azerbaijan Technical University.',
      },
    ],
    sideLinks: [
      { label: 'Azerbaijan Science Foundation', url: AEF },
      OFFICE_EN,
      { label: 'ADDA Research Portal (CRIS)', url: CRIS },
      { label: 'International cooperation', url: '/sehife/beynelxalq-emekdasliq' },
      { label: 'Young scientists and researchers', url: '/sehife/genc-alimler-surasi' },
    ],
    contact: CONTACT_EN,
  },
  ru: {
    title: 'Гранты и конкурсы',
    lead:
      'Финансирование исследовательских проектов: конкурсы Научного фонда Азербайджана, международные программы и совместные проекты с партнёрами. ' +
      'Учёные ADDA — среди победителей «Основного грантового конкурса» Фонда 2024 года.',
    seoDescription:
      'Гранты в ADDA: конкурсы Научного фонда Азербайджана, грантовый проект 2024–2026 (200 000 манатов), международные партнёры, подготовка заявки.',
    stepsTitle: 'Грантовая заявка: шаги',
    facts: [
      { label: 'Грант Научного фонда', value: '200 000 AZN', icon: 'haqq' },
      { label: 'Срок проекта', value: '2024–2026', icon: 'muddet' },
      { label: 'Партнёр', value: 'Азербайджанский технический университет', icon: 'qrup' },
      { label: 'Международный партнёр', value: 'БТУ (Германия)', icon: 'beynelxalq' },
    ],
    steps: [
      {
        title: 'Выберите конкурс',
        who: 'Научный фонд Азербайджана и другие фонды',
        body: 'Фонд объявляет конкурсы на своём сайте: заранее изучите условия, объём финансирования и сроки.',
        linkLabel: 'aef.gov.az',
        linkUrl: AEF,
      },
      {
        title: 'Соберите команду и партнёров',
        who: 'Кафедра, другие вузы',
        body: 'Проект строится в русле научного направления кафедры. Возможна совместная заявка с другим вузом или зарубежным партнёром.',
      },
      {
        title: 'Подготовьте заявку',
        who: 'Руководитель проекта',
        body: 'Цель, методика, ожидаемый результат, план работ и бюджет. Обновите список публикаций и профиль ORCID.',
      },
      {
        title: 'Свяжитесь с отделом',
        who: 'Отдел научных исследований и международных связей',
        body: 'Отдел участвует в подготовке международных проектов и договоров о сотрудничестве — посоветуйтесь до подачи заявки.',
        linkLabel: 'Страница отдела',
        linkUrl: OFFICE,
      },
      {
        title: 'Выполнение и отчёт',
        who: 'Команда проекта',
        body: 'Результаты отражаются в статьях, на конференциях и в годовом научном отчёте Академии.',
      },
    ],
    body: `## Научный фонд Азербайджана

Научный фонд Азербайджана финансирует исследовательские проекты на конкурсной основе; конкурсы и итоги объявляются на сайте [aef.gov.az](${AEF}).

**«Основной грантовый конкурс — 2024».** Учёные кафедры «Судостроение и судоремонт» ADDA и кафедры «Технология машиностроения» Азербайджанского технического университета победили с проектом «Технологическое обеспечение условий экономичной обработки на станках с ЧПУ».

- **Характер:** фундаментально-прикладной;
- **Направления:** технология судостроения и судоремонта, технология машиностроения, машины, агрегаты и процессы, стандартизация и управление качеством продукции, механическая и физико-техническая обработка, математическое моделирование;
- **Финансирование:** 200 тысяч манатов из бюджета Фонда;
- **Срок:** 2024–2026.

[Итоги конкурса](${AEF_2024})

**Международная часть.** В ноябре 2025 года учёные кафедры в рамках проекта побывали в Бранденбургском техническом университете (Германия): обсудили результаты, провели первые эксперименты в лабораториях университета и участвовали в международной конференции NESEFF. Цель — совместные публикации в высокорейтинговых журналах.

## Международные программы и партнёры

- **Türk Loydu** — обсуждены возможности совместного участия в научных и инновационных проектах и международных грантовых программах.
- Сотрудничество с зарубежными университетами — [Международное сотрудничество](/sehife/beynelxalq-emekdasliq).

## Подготовка заявки

- Тема должна соответствовать плану научных работ кафедры и направлениям Академии — [направления](${HUB}).
- Публикации должны быть полностью отражены на [Научном портале](${CRIS}) и в ORCID: на конкурсе оценивают научные результаты заявителя.
- Привяжите бюджет к плану работ: оборудование, материалы, командировки и публикации — отдельными статьями.`,
    faq: [
      {
        question: 'Где узнать о конкурсах?',
        answer:
          'На сайте Научного фонда Азербайджана (aef.gov.az). О конкурсах и предложениях о партнёрстве, поступающих в Академию, информирует Отдел научных исследований и международных связей.',
      },
      {
        question: 'Можно ли подать заявку вместе с другим вузом?',
        answer: 'Да. Победивший проект 2024 года — совместный проект кафедр ADDA и Азербайджанского технического университета.',
      },
    ],
    sideLinks: [
      { label: 'Научный фонд Азербайджана', url: AEF },
      OFFICE_RU,
      { label: 'Научный портал ADDA (CRIS)', url: CRIS },
      { label: 'Международное сотрудничество', url: '/sehife/beynelxalq-emekdasliq' },
      { label: 'Молодые учёные и исследователи', url: '/sehife/genc-alimler-surasi' },
    ],
    contact: CONTACT_RU,
  },
};

export const ELM_PAGES: ElmPageSeed[] = [HUB_PAGE, LAB_PAGE, JOURNAL_PAGE, YOUNG_PAGE, CONF_PAGE, GRANTS_PAGE];
export const ELM_PAGE_SLUGS: string[] = ELM_PAGES.map((p) => p.slug);
