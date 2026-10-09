/**
 * F5.45 — «Qəbul» menyusunun səhifələri: məzmun (yalnız məlumat, məntiq
 * src/utils/qebul-pages.ts-dədir).
 *
 * Quruluş HSE.ru abituriyent portallarının skeleti ilə qurulub: hər pillədə
 * eyni suallar — kim müraciət edə bilər → qəbul trayektoriyası (addımlar) →
 * ixtisaslar, yer sayı, haqq, keçid balı (kataloqdan CANLI gəlir, burada
 * yazılmır) → sənədlər → suallar və cavablar. Ruben və b. «A Guide for
 * Leaders in Higher Education»: maraqlı tərəfin (abituriyent, valideyn,
 * əcnəbi) dili ilə, hər mövzu bir yerdə, rəqəm mənbəsi bir.
 *
 * MƏNBƏLƏR (2026-cı il, hamısı yoxlanılıb):
 *   - DİM: «Tələbə qəbulu – 2026» elanları (ali, 11 illik kollec), magistratura
 *     elanı və təlimatı (14.01.2026, 2026/2027 seçimi), bakalavriat qaydaları
 *     (I qrup: RK/Rİ altqrupları, 300 + 400 bal);
 *   - ADDA elanları: doktorantura (18.05.2026), təkrar ali təhsil (08.06.2026),
 *     əcnəbilər (11.06.2026), qəbul olunanların nəzərinə (25.08.2026),
 *     tibbi müayinə (19.03.2020);
 *   - 2026/2027 qəbul proqnozu (17.11.2025): kollecin 9/11 illik bölgüsü;
 *   - saytın mövcud səhifələri (bakalavriat, magistratura, doktorantura,
 *     əcnəbilər, yataqxana, məzunlar) — köhnə mətn yenidən qurulub.
 * Tarixlər hər il dəyişir: addımlarda AY göstərilir, dəqiq tarix üçün DİM-ə
 * və Akademiyanın elanına keçid verilir.
 *
 * Sahələr: Strapi «1. Məzmun — Səhifə» (layout=qebul). Admin bu mətni
 * sonradan dəyişə bilər — miqrasiya BİR DƏFƏ yazır (bax qebul-pages.ts).
 */

export type FactIcon =
  | 'tarix'
  | 'muddet'
  | 'yer'
  | 'haqq'
  | 'bal'
  | 'dil'
  | 'forma'
  | 'sened'
  | 'imtahan'
  | 'diplom'
  | 'unvan'
  | 'telefon'
  | 'qrup'
  | 'bina'
  | 'qoruma'
  | 'diger';

export type DataBlock =
  | 'yox'
  | 'subbakalavr'
  | 'bakalavr'
  | 'magistr'
  | 'doktorantura'
  | 'tekrar_ali'
  | 'ingilis'
  | 'qebul_cedveli'
  | 'aciq_qapi';

export interface StepSeed {
  /** Bir səhifədə bir neçə trayektoriya varsa (məs. 9 və 11 illik baza). */
  track?: string;
  title: string;
  period?: string;
  who?: string;
  body?: string;
  linkLabel?: string;
  linkUrl?: string;
}
export interface FactSeed {
  label: string;
  value: string;
  icon?: FactIcon;
}
export interface FaqSeed {
  question: string;
  answer: string;
}
export interface LinkSeed {
  label: string;
  url: string;
}
export interface PageLocaleSeed {
  title: string;
  lead: string;
  body: string;
  seoDescription: string;
  /** Addımlar blokunun başlığı; boşdursa «Qəbul trayektoriyası». */
  stepsTitle?: string;
  facts?: FactSeed[];
  steps?: StepSeed[];
  faq?: FaqSeed[];
  sideLinks?: LinkSeed[];
  contact?: string;
}
export interface QebulPageSeed {
  slug: string;
  dataBlock: DataBlock;
  az: PageLocaleSeed;
  en?: PageLocaleSeed;
  ru?: PageLocaleSeed;
}

// ── Təkrarlanan keçidlər ─────────────────────────────────────────────────────
const DIM_CABINET: LinkSeed = { label: 'DİM: şəxsi kabinet', url: 'https://ekabinet.dim.gov.az' };
const DIM_BAK: LinkSeed = { label: 'DİM: bakalavriata qəbul', url: 'https://dim.gov.az/az/fealiyyet/qebul-ve-imtahanlar/bakalavriat' };
const DIM_BAK_FORM: LinkSeed = { label: 'DİM: abituriyentin elektron ərizəsi', url: 'https://eservices.dim.gov.az/erizebak/erize' };
const DIM_COLLEGE: LinkSeed = { label: 'DİM: kolleclərə qəbul', url: 'https://dim.gov.az/az/fealiyyet/qebul-ve-imtahanlar/orta-ixtisas-tehsili' };
const DIM_MAG: LinkSeed = { label: 'DİM: magistraturaya qəbul', url: 'https://dim.gov.az/az/fealiyyet/qebul-ve-imtahanlar/magistratura' };
const DIM_MAG_FORM: LinkSeed = { label: 'DİM: bakalavrın elektron ərizəsi', url: 'https://eservices.dim.gov.az/erizemag/erize' };
const DIM_PHD: LinkSeed = { label: 'DİM: doktoranturaya qəbul', url: 'https://dim.gov.az/az/fealiyyet/qebul-ve-imtahanlar/doktorantura' };
const PORTAL: LinkSeed = { label: 'portal.edu.az', url: 'https://portal.edu.az' };
const MYGOV: LinkSeed = { label: 'my.gov.az', url: 'https://my.gov.az' };
const SCORES: LinkSeed = { label: 'Keçid balları, yer sayı və təhsil haqqı', url: '/sehife/kecid-ballari' };
const DORM: LinkSeed = { label: 'Yataqxana', url: '/sehife/yataqxana' };
const APPLY: LinkSeed = { label: 'Onlayn müraciət', url: '/sehife/onlayn-muraciet' };

const ADDRESS = 'Bakı, Zərifə Əliyeva küçəsi 18 («Sahil» metrosunun yaxınlığı)';
const CONTACT_AZ =
  `**Ünvan:** ${ADDRESS}\n\n**Telefon:** +994 12 404 33 40\n\n**E-poçt:** info@adda.edu.az\n\n` +
  'Qəbul barədə sualınızı [onlayn göndərin](/vetendaslarin-muracieti?istiqamet=qebul) — cavab e-poçtunuza gəlir.';

// ── 1. Kollecə qəbul (subbakalavr) ───────────────────────────────────────────
const SUBBAKALAVR: QebulPageSeed = {
  slug: 'subbakalavr',
  dataBlock: 'subbakalavr',
  az: {
    title: 'Kollecə qəbul (subbakalavr)',
    seoDescription:
      'Azərbaycan Dənizçilik Kollecinə qəbul: 9 və 11 illik baza, DİM-də ərizə və ixtisas seçimi, plan yerləri və təhsil haqqı.',
    lead:
      'Akademiyanın nəzdindəki Azərbaycan Dənizçilik Kolleci dəniz nəqliyyatı üçün subbakalavr (orta ixtisas) kadrları hazırlayır. ' +
      'Qəbul Dövlət İmtahan Mərkəzi (DİM) vasitəsilə, 9 və ya 11 illik ümumi təhsil bazasında aparılır.',
    facts: [
      { label: 'Təhsil bazası', value: '9 və 11 illik', icon: 'diplom' },
      { label: 'Qəbul', value: 'DİM, buraxılış imtahanının nəticəsi ilə', icon: 'imtahan' },
      { label: 'Təhsil forması', value: 'Əyani', icon: 'forma' },
      { label: 'Tədris dili', value: 'Azərbaycan', icon: 'dil' },
    ],
    steps: [
      {
        track: '9 illik baza (ümumi orta təhsil)',
        title: '9-cu sinfin buraxılış imtahanı',
        period: 'Yaz',
        who: 'DİM',
        body: 'Müsabiqədə 9-cu sinfin buraxılış imtahanının nəticəsi ilə iştirak edirsiniz. Ayrıca qəbul imtahanı yoxdur.',
      },
      {
        track: '9 illik baza (ümumi orta təhsil)',
        title: 'İxtisas seçimi',
        period: 'Avqustun əvvəli',
        who: 'DİM',
        body:
          'Nəticələr açıqlanandan sonra DİM-in saytında elektron ixtisas seçimi ərizəsini doldurursunuz. ' +
          'Bu bazada yerlərin bir hissəsi ödənişsizdir (dövlət sifarişi).',
        linkLabel: 'DİM: kolleclərə qəbul',
        linkUrl: 'https://dim.gov.az/az/fealiyyet/qebul-ve-imtahanlar/orta-ixtisas-tehsili',
      },
      {
        track: '9 illik baza (ümumi orta təhsil)',
        title: 'Yerləşdirmə və qeydiyyat',
        period: 'Avqust',
        who: 'DİM, kollec',
        body: 'Kollecə yerləşdirilən abituriyent elanda göstərilən müddətdə elektron qeydiyyatdan keçir və sənədlərini təqdim edir.',
      },
      {
        track: '11 illik baza (tam orta təhsil)',
        title: 'Elektron ərizə',
        period: 'Fevral–mart',
        who: 'DİM',
        body:
          'ekabinet.dim.gov.az-da şəxsi kabinet yaradın, sonra «Abituriyentin elektron ərizəsi»ni doldurub təsdiqləyin. ' +
          'Cari ilin məzunları ərizəni özləri təsdiqləyir. Ərizəsini təsdiqləməyən abituriyent müsabiqəyə buraxılmır.',
        linkLabel: 'DİM: elektron ərizə',
        linkUrl: 'https://eservices.dim.gov.az/erizebak/erize',
      },
      {
        track: '11 illik baza (tam orta təhsil)',
        title: 'Buraxılış (qəbul) imtahanı',
        period: 'Mart–aprel',
        who: 'DİM',
        body:
          'Azərbaycan (rus) dili, riyaziyyat və xarici dil — hər biri 100, cəmi 300 bal. Cari ilin məzunları imtahan vermir: ' +
          '11-ci sinfin buraxılış imtahanının nəticəsi götürülür. Əvvəlki illərin məzunları imtahanı aprel ayında verir. Nəticə 2 il qüvvədədir.',
      },
      {
        track: '11 illik baza (tam orta təhsil)',
        title: 'İxtisas seçimi',
        period: 'Avqustun sonu – sentyabrın əvvəli',
        who: 'DİM',
        body:
          'Seçimə ümumi balı 50-dən, Azərbaycan (rus) dili və riyaziyyat üzrə hər biri 10-dan az olmayan abituriyentlər buraxılır. ' +
          'Akademiyanın kollecində 11 illik baza üzrə yerlər ödənişlidir.',
      },
      {
        track: '11 illik baza (tam orta təhsil)',
        title: 'Yerləşdirmə və qeydiyyat',
        period: 'Sentyabr',
        who: 'DİM, kollec',
        body:
          'Yerləşdirilən abituriyent 10 iş günü ərzində kollec üzrə elektron qeydiyyatdan keçməlidir. ' +
          'Keçməyən abituriyent yerdən imtina etmiş sayılır.',
      },
    ],
    body: [
      '## Kollec kimlər üçündür',
      '',
      'Kollec 9 və ya 11 illik məktəbi bitirib dəniz sahəsində tez peşə qazanmaq istəyənlər üçündür. ' +
        'Dörd ixtisas üzrə gəmi sürücülüyü, gəmi energetik qurğularının istismarı, elektrik təchizatı və gəmilərin təmiri öyrədilir. ' +
        'İxtisasların siyahısı, yer sayı və təhsil haqqı aşağıdakı cədvəldədir.',
      '',
      'Kollec Akademiyanın struktur bölməsidir — ətraflı: [Azərbaycan Dənizçilik Kolleci](/struktur/azerbaycan-denizcilik-kolleci-phs).',
      '',
      '## Qəbul necə aparılır',
      '',
      'Kolleclərə qəbulu Dövlət İmtahan Mərkəzi aparır. Akademiya ayrıca imtahan keçirmir.',
      '',
      '- **9 illik baza (ümumi orta təhsil):** müsabiqə 9-cu sinfin buraxılış imtahanının nəticəsi ilə aparılır.',
      '- **11 illik baza (tam orta təhsil):** müsabiqə Azərbaycan (rus) dili, riyaziyyat və xarici dil üzrə imtahanın nəticəsi ilə aparılır (maksimal bal 300). ' +
        'Cari ilin məzunlarının buraxılış imtahanı nəticəsi götürülür, əvvəlki illərin məzunları imtahanı yenidən verir və ya ötən ilin nəticəsindən istifadə edir — nəticə 2 il qüvvədədir.',
      '- Yerləşdirmə elektron ixtisas seçimi ərizəsində yazdığınız ardıcıllıqla aparılır: keçdiyiniz ilk seçimə yerləşirsiniz.',
      '',
      'Dəqiq tarixlər hər il DİM-in qəbul elanında açıqlanır.',
      '',
      '## Yerlərin bölgüsü (2026/2027)',
      '',
      '| İxtisas | 9 illik baza: ödənişsiz | 9 illik baza: ödənişli | 11 illik baza: ödənişli |',
      '|---|---|---|---|',
      '| Gəmi sürücülüyü | 15 | 25 | 50 |',
      '| Gəmi energetik qurğularının istismarı | 15 | 25 | 50 |',
      '| Elektrik təchizatı (su nəqliyyatında) | 15 | 25 | 50 |',
      '| Gəmilərin təmiri | 10 | 15 | 25 |',
      '',
      'Mənbə: Akademiyanın 2026/2027-ci tədris ili üçün qəbul planı. Ödənişsiz yerlər yalnız 9 illik baza üzrədir. ' +
        'Dövlət hər təhsil səviyyəsində yalnız bir dəfə pulsuz təhsil almaq hüququnu təmin edir.',
      '',
      '## Kollecdən sonra',
      '',
      'Kolleci bitirən subbakalavr dənizdə və ya sahildə işləyə, sonra Akademiyanın bakalavriatına qəbul ola bilər. ' +
        'Subbakalavr diplomu ilə bakalavriata qəbul olunanlar qeydiyyatda diplom və əlavəsini, iş yerindən arayışı və dənizçinin tibbi kitabçasının surətini təqdim edir. ' +
        'Ətraflı: [Bakalavriata qəbul](/sehife/bakalavriat).',
    ].join('\n'),
    faq: [
      {
        question: '9-cu sinfi bitirmişəm. Ayrıca imtahan verməliyəmmi?',
        answer: 'Xeyr. Müsabiqədə 9-cu sinfin buraxılış imtahanının nəticəsi ilə iştirak edirsiniz. İxtisası DİM-in saytında elektron seçirsiniz.',
      },
      {
        question: 'Ödənişsiz oxumaq mümkündürmü?',
        answer:
          '2026/2027-ci ildə Akademiyanın kollecində ödənişsiz (dövlət sifarişi) yerlər yalnız 9 illik baza üzrədir: 55 yer. 11 illik baza üzrə yerlər ödənişlidir.',
      },
      {
        question: 'Keçən il buraxılış imtahanı vermişəm. Nəticəm keçərlidirmi?',
        answer:
          'Bəli. 11 illik baza üzrə buraxılış (qəbul) imtahanının nəticəsi 2 il qüvvədədir. Hər iki ilin nəticəsi varsa, hansı ilə iştirak edəcəyinizi ixtisas seçimində özünüz seçirsiniz.',
      },
      {
        question: 'Kollecdən sonra bakalavriata keçə bilərəmmi?',
        answer: 'Bəli, subbakalavr diplomu ilə DİM-in müsabiqəsi vasitəsilə Akademiyanın bakalavriatına qəbul olmaq mümkündür.',
      },
    ],
    sideLinks: [DIM_COLLEGE, DIM_CABINET, DIM_BAK_FORM, SCORES, APPLY],
    contact: CONTACT_AZ,
  },
};

// ── 2. Bakalavriata qəbul ────────────────────────────────────────────────────
const BAKALAVRIAT: QebulPageSeed = {
  slug: 'bakalavriat',
  dataBlock: 'bakalavr',
  az: {
    title: 'Bakalavriata qəbul',
    seoDescription:
      'ADDA-nın bakalavriatına qəbul: DİM, I ixtisas qrupu, dənizçi ixtisasları üçün tibbi müayinə, ixtisas seçimi, sənədlər və tarixlər.',
    lead:
      'Bakalavriata qəbul Dövlət İmtahan Mərkəzinin (DİM) imtahanı ilə, I ixtisas qrupu üzrə aparılır. ' +
      'Dənizçi ixtisaslarına əlavə şərt var: ərizədən sonra xüsusi tibbi müayinə.',
    facts: [
      { label: 'İxtisas qrupu', value: 'I qrup', icon: 'qrup' },
      { label: 'Maksimal bal', value: '700 (300 + 400)', icon: 'bal' },
      { label: 'Təhsil müddəti', value: '4 il', icon: 'muddet' },
      { label: 'Təhsil forması', value: 'Əyani, qiyabi', icon: 'forma' },
      { label: 'Tədris dili', value: 'Azərbaycan, ingilis, rus', icon: 'dil' },
    ],
    steps: [
      {
        title: 'Şəxsi kabinet və elektron ərizə',
        period: 'Fevral–mart',
        who: 'DİM',
        body:
          'ekabinet.dim.gov.az-da şəxsi kabinet yaradın, sonra «Abituriyentin elektron ərizəsi»ni doldurub təsdiqləyin. ' +
          'Cari ilin və 2012-ci ildən sonrakı illərin məzunları ərizəni özləri təsdiqləyir, digərləri sənəd qəbulu komissiyasına gedir.',
        linkLabel: 'DİM: elektron ərizə',
        linkUrl: 'https://eservices.dim.gov.az/erizebak/erize',
      },
      {
        title: 'Xüsusi tibbi müayinə (dənizçi ixtisasları)',
        period: 'Ərizə təsdiqlənəndən sonra',
        who: 'Dənizçilər poliklinikası',
        body:
          'Dəniz naviqasiyası, Gəmi energetik qurğularının istismarı və Elektrik və elektronika mühəndisliyi ixtisaslarını seçmək istəyənlər ' +
          'ASCO-nun «Dənizçilər poliklinikası»nda müayinədən keçməlidir. Tarix Akademiyanın elanında bildirilir.',
        linkLabel: 'Ətraflı: tibbi müayinə',
        linkUrl: '#xususi-tibbi-muayine',
      },
      {
        title: 'I mərhələ: buraxılış imtahanı',
        period: 'Mart–aprel',
        who: 'DİM',
        body:
          'Azərbaycan (rus) dili, riyaziyyat və xarici dil — hər biri 100, cəmi 300 bal. Cari ilin məzunları üçün 11-ci sinfin buraxılış imtahanı sayılır. ' +
          'Nəticə 2 il qüvvədədir. I mərhələdə iştirak etməyən II mərhələyə buraxılmır.',
      },
      {
        title: 'II mərhələ: I qrup üzrə imtahan',
        period: 'İyun–iyul',
        who: 'DİM',
        body:
          'Riyaziyyat (150 bal), fizika (150) və kimya — RK altqrupu, ya da informatika — Rİ altqrupu (100). Cəmi 400 bal. ' +
          'İmtahanın iki cəhdi var. II mərhələnin nəticəsi yalnız cari il üçün keçərlidir.',
      },
      {
        title: 'İxtisas seçimi',
        period: 'Avqust',
        who: 'DİM',
        body:
          'Elektron ixtisas seçimi ərizəsində ixtisasları istədiyiniz ardıcıllıqla yazırsınız: keçdiyiniz ilk seçimə yerləşdirilirsiniz. ' +
          'Seçimdən əvvəl ixtisasları, yer sayını və son illərin keçid ballarını müqayisə edin.',
        linkLabel: 'Keçid balları, yer sayı və təhsil haqqı',
        linkUrl: '/sehife/kecid-ballari',
      },
      {
        title: 'Qəbul olunanların qeydiyyatı',
        period: 'Avqustun sonu – sentyabr',
        who: 'my.gov.az',
        body:
          'mygov ID ilə my.gov.az-a daxil olun: «Xidmətlər» → «Qurumlar» → Elm və Təhsil Nazirliyi → «Ali və orta ixtisas təhsil müəssisələrinə təhsilalanların qeydiyyatı». ' +
          'Qeydiyyatdan keçməyən abituriyent qəbul olunmamış sayılır və barəsində qəbul əmri verilmir.',
        linkLabel: 'my.gov.az',
        linkUrl: 'https://my.gov.az',
      },
      {
        title: 'Sənədlərin Akademiyaya təqdimi',
        period: 'Sentyabrın əvvəli',
        who: 'ADDA',
        body:
          'Sənədləri şəxsən əsas tədris binasına gətirirsiniz. Əyani tələbələrdən geyim forması ölçüləri və yataqxana ərizəsi də burada götürülür.',
        linkLabel: 'Sənədlərin siyahısı',
        linkUrl: '#qebul-olunanlar-ucun-senedler',
      },
      {
        title: 'Dərslər başlayır',
        period: '15 sentyabr',
        who: 'ADDA',
        body: 'Yeni tədris ili sentyabrın 15-də başlayır.',
      },
    ],
    body: [
      '## İxtisaslar və tədris dili',
      '',
      'Akademiya I ixtisas qrupu üzrə dörd mühəndislik ixtisasına tələbə qəbul edir. Hər ixtisasın plan yerləri, təhsil haqqı və son keçid balı aşağıdakı cədvəldədir, tədris planı isə ixtisas səhifəsindədir.',
      '',
      '- Tədris Azərbaycan dilindədir; Dəniz naviqasiyası mühəndisliyi üzrə həm də ingilis və rus, Gəmi energetik qurğularının istismarı mühəndisliyi üzrə ingilis dilində qruplar var.',
      '- Əyani formadan başqa qiyabi yerlər də var (cədvəldə «qiyabi»).',
      '- İngilisdilli qruplar barədə: [İngilis dilində tədris](/sehife/ingilis-dilinde-tedris).',
      '',
      '## Qəbul imtahanı və bal',
      '',
      '| Mərhələ | Fənlər | Maksimal bal |',
      '|---|---|---|',
      '| I mərhələ (buraxılış) | Azərbaycan (rus) dili, riyaziyyat, xarici dil | 300 |',
      '| II mərhələ (I qrup) | Riyaziyyat (×1,5), fizika (×1,5), kimya və ya informatika | 400 |',
      '| **Müsabiqə balı** | iki mərhələnin cəmi | **700** |',
      '',
      'I mərhələnin nəticəsi 2 il, II mərhələninki 1 il qüvvədədir. İmtahanı başqa dildə verənlər dövlət dili imtahanından «məqbul» almalıdır. ' +
        'Dəqiq tarixlər hər il DİM-in qəbul elanında açıqlanır.',
      '',
      '## Xüsusi tibbi müayinə',
      '',
      '«Dəniz naviqasiyası mühəndisliyi», «Gəmi energetik qurğularının istismarı mühəndisliyi» və «Elektrik və elektronika mühəndisliyi» ixtisaslarına qəbul olmaq istəyən abituriyentlər ' +
        'elektron ərizəni təsdiqlədikdən sonra «Azərbaycan Xəzər Dəniz Gəmiçiliyi» QSC-nin «Dənizçilər poliklinikası» MMC-də xüsusi tibbi müayinədən keçməlidir.',
      '',
      'Tibbi komissiyaya adətən təqdim olunur:',
      '',
      '- şəxsiyyət vəsiqəsi;',
      '- hərbi qeydiyyata alınma haqqında vəsiqə və ya hərbi bilet;',
      '- elektron ərizənin iş nömrəsi;',
      '- psixonevroloji və narkoloji dispanserlərdən arayış;',
      '- qeydiyyatda olduğunuz poliklinikadan qısa epikriz.',
      '',
      'Poliklinikanın ünvanı: Bakı, K. Kazımov küçəsi 120A (Mərkəzi Gömrük Hospitalının yanı). Müayinənin tarixi və dəqiq sənəd siyahısı hər il Akademiyanın elanında verilir.',
      '',
      '## Qəbul olunanlar üçün: sənədlər',
      '',
      'my.gov.az-da qeydiyyatdan keçəndən sonra sənədləri Akademiyanın əsas tədris binasına (' + ADDRESS + ') şəxsən təqdim edirsiniz. 2026-cı ildə sənəd qəbulu 7–11 sentyabr, saat 09:00–16:00 aparılıb.',
      '',
      '1. Şəxsiyyət vəsiqəsinin surəti (2 nüsxə).',
      '2. Attestatın əsli və surəti.',
      '3. Çağırışçı şəhadətnaməsi və ya hərbi biletin əsli və surəti.',
      '4. Tibbi arayış (forma 086).',
      '5. Narkoloji və psixoloji dispanserdən arayış.',
      '6. 8 ədəd 3×4 ölçülü fotoşəkil.',
      '7. Ödənişli tələbələr üçün ödəniş qəbzinin surəti.',
      '8. İmtiyazlı tələbələr üçün imtiyazı təsdiq edən sənədin notarial qaydada təsdiqlənmiş surəti.',
      '9. Yaşayış yerindən arayış.',
      '',
      '**Subbakalavr (kollec) diplomu ilə qəbul olunanlar** əlavə olaraq diplomun və əlavəsinin əslini və surətini, iş yerindən arayışı, dənizçinin tibbi kitabçasının və hərbi biletin surətini təqdim edir.',
      '',
      '## Təhsil haqqı və ödənişsiz yerlər',
      '',
      'Plan yerləri dövlət sifarişi (ödənişsiz) və ödənişli yerlərdən ibarətdir, bölgünü DİM aparır. Dövlət hər təhsil səviyyəsində yalnız bir dəfə pulsuz təhsil almaq hüququnu təmin edir. ' +
        'Ödənişli yerlərin illik haqqı cədvəldədir; ödəniş qəbzi qeydiyyatda təqdim olunur.',
    ].join('\n'),
    faq: [
      {
        question: 'Hansı ixtisas qrupu üzrə qəbul olunur?',
        answer:
          'I ixtisas qrupu. II mərhələdə riyaziyyat və fizika ilə yanaşı kimya (RK altqrupu) və ya informatika (Rİ altqrupu) verilir. İxtisasın hansı altqrupda olduğu DİM-in ixtisas siyahısında göstərilir.',
      },
      {
        question: 'Keçən il buraxılış imtahanı vermişəm. Yenidən verməliyəmmi?',
        answer: 'I mərhələnin (buraxılış imtahanının) nəticəsi 2 il qüvvədədir. II mərhələni isə hər il yenidən vermək lazımdır.',
      },
      {
        question: 'Tibbi müayinə bütün ixtisaslar üçün tələb olunurmu?',
        answer:
          'Xeyr. Xüsusi tibbi müayinə Dəniz naviqasiyası, Gəmi energetik qurğularının istismarı və Elektrik və elektronika mühəndisliyi ixtisaslarına aiddir.',
      },
      {
        question: 'Keçid balı nə qədər olur?',
        answer:
          'Hər il dəyişir: müsabiqə həmin il müraciət edənlərin nəticəsindən asılıdır. Son illərin ballarını «Keçid balları, yer sayı və təhsil haqqı» səhifəsində görə bilərsiniz.',
      },
      {
        question: 'Yataqxanada yer verilirmi?',
        answer: 'Bəli. Əyani tələbələr yataqxana üçün ərizəni sənəd təqdimi zamanı verir. Şərait barədə: «Yataqxana» səhifəsi.',
      },
      {
        question: 'Kollec diplomu ilə bakalavriata necə qəbul olunmaq olar?',
        answer:
          'DİM-in subbakalavrlar üçün müsabiqəsi vasitəsilə. Qəbul olunanda qeydiyyatda kollec diplomu, iş yerindən arayış və dənizçinin tibbi kitabçası təqdim olunur.',
      },
    ],
    sideLinks: [DIM_BAK, DIM_BAK_FORM, DIM_CABINET, MYGOV, SCORES, DORM],
    contact: CONTACT_AZ,
  },
};

// ── 3. Magistraturaya qəbul ──────────────────────────────────────────────────
const MAGISTRATURA: QebulPageSeed = {
  slug: 'magistratura',
  dataBlock: 'magistr',
  az: {
    title: 'Magistraturaya qəbul',
    seoDescription:
      'ADDA-nın magistraturasına qəbul: DİM-in imtahanı (məntiq, informatika, xarici dil, esse), ixtisaslaşma seçimi, sənədlər və tarixlər.',
    lead:
      'Magistraturaya qəbul DİM-in test imtahanı və ixtisaslaşma seçimi ilə aparılır. İmtahan ildə bir neçə dəfə keçirilir, ' +
      'müsabiqədə ən yaxşı nəticənizlə iştirak edə bilərsiniz.',
    facts: [
      { label: 'Qəbul', value: 'DİM', icon: 'imtahan' },
      { label: 'Maksimal bal', value: '100', icon: 'bal' },
      { label: 'Təhsil müddəti', value: '2 il', icon: 'muddet' },
      { label: 'Təhsil forması', value: 'Əyani', icon: 'forma' },
      { label: 'Tədris dili', value: 'Azərbaycan, rus', icon: 'dil' },
    ],
    steps: [
      {
        title: 'Elektron ərizə',
        period: 'Yanvar; növbəti imtahanlar üçün aprel, may',
        who: 'DİM',
        body:
          'ekabinet.dim.gov.az-da şəxsi kabinet yaradın, sonra «Bakalavrın elektron ərizəsi»ni doldurub təsdiqləyin. ' +
          'Ərizə ödənişlidir (2026-cı ildə 50 AZN). Hər imtahan cəhdi üçün ayrıca qeydiyyat elan olunur.',
        linkLabel: 'DİM: elektron ərizə',
        linkUrl: 'https://eservices.dim.gov.az/erizemag/erize',
      },
      {
        title: 'Qəbul imtahanı',
        period: 'Fevral, may, iyun',
        who: 'DİM',
        body:
          'Məntiqi təfəkkür (50 bal), informatika (25), xarici dil (20) və esse (5) — cəmi 100 bal. Testlərə 3 saat, esseyə 30 dəqiqə verilir; səhv cavab balı azaltmır.',
      },
      {
        title: 'İxtisaslaşma seçimi',
        period: 'İyul',
        who: 'DİM',
        body:
          '20-dək ixtisaslaşmanın kodunu ödənişsiz və ya ödənişli əsas göstərməklə yazırsınız. Yerləşdirmə ardıcıllığa görədir: keçdiyiniz ilk seçimə düşürsünüz. ' +
          'Hansı imtahanın nəticəsi ilə iştirak edəcəyinizi özünüz seçirsiniz. Ərizə təsdiqlənəndən sonra dəyişmək olmur.',
      },
      {
        title: 'Nəticə',
        period: 'İyulun sonu',
        who: 'DİM',
        body: 'Əsas müsabiqənin nəticəsi açıqlanır. Boş qalan yerlərə əlavə seçim avqustun sonunda aparılır.',
      },
      {
        title: 'Akademiyada qeydiyyat',
        period: 'Avqust–sentyabr',
        who: 'ADDA',
        body: 'Qəbul olunanlar Tədris qeydiyyat şöbəsinə sənədlərini şəxsən təqdim edir. Vaxt Akademiyanın elanında bildirilir.',
        linkLabel: 'Sənədlərin siyahısı',
        linkUrl: '#qebul-olunanlar-ucun-senedler',
      },
    ],
    body: [
      '## Kimlər müraciət edə bilər',
      '',
      '- Azərbaycanda ali təhsil müəssisəsini bitirən bakalavrlar (bu ilin məzunları diplom əvəzinə arayış təqdim edir);',
      '- xaricdə təhsil alıb diplomu Təhsildə Keyfiyyət Təminatı Agentliyi tərəfindən tanınan bakalavrlar.',
      '',
      'Dövlət hər təhsil səviyyəsində yalnız bir dəfə pulsuz təhsil almaq hüququnu təmin edir: əvvəl dövlət hesabına magistraturada oxuyanlar yalnız ödənişli yerləri seçə bilər. ' +
        'Əcnəbilər də yalnız ödənişli yerləri seçir.',
      '',
      '## İmtahan: nə yoxlanılır',
      '',
      '| Hissə | Tapşırıq | Maksimal bal |',
      '|---|---|---|',
      '| Məntiqi təfəkkür | 50 (5-i açıq) | 50 |',
      '| İnformatika | 25 (5-i açıq) | 25 |',
      '| Xarici dil | 20 (2-si açıq) | 20 |',
      '| Esse | 1 | 5 |',
      '| **Cəmi** | | **100** |',
      '',
      '2026-cı il qaydasına görə texniki ixtisaslaşmalarda müsabiqəyə buraxılmaq üçün ümumi bal ən azı 40, məntiq üzrə 15, informatika və xarici dil üzrə 5 olmalıdır. ' +
        'Minimal ballar hər il DİM-in qəbul elanında təsdiqlənir.',
      '',
      '## İxtisaslaşmalar',
      '',
      'DİM-in seçimində magistr proqramları ixtisaslaşma adları ilə göstərilir. Akademiyanın ixtisaslaşmaları:',
      '',
      '- Gəmiçilik və gəmilərin hərəkətinin idarə edilməsi;',
      '- Dəniz texnikası və texnologiyası mühəndisliyi;',
      '- Dəniz texnikası və avadanlıqlarının istismarı mühəndisliyi;',
      '- Elektrik və elektronika mühəndisliyi.',
      '',
      'Hər proqramın plan yerləri və təhsil haqqı cədvəldə, tədris planı ixtisas səhifəsindədir.',
      '',
      '## Qəbul olunanlar üçün: sənədlər',
      '',
      'Magistraturaya qəbul olunanlar Tədris qeydiyyat şöbəsinə «DİM-in ödəmə kartı» və aşağıdakı sənədlərlə şəxsən müraciət edir:',
      '',
      '1. Şəxsiyyət vəsiqəsi (əsli və surəti).',
      '2. Bakalavr diplomunun əsli və əlavəsi (bu ilin məzunları — bakalavriatı bitirmək haqqında arayış).',
      '3. 3×4 ölçüdə 6 ədəd rəngli fotoşəkil.',
      '4. Tərcümeyi-hal.',
      '5. Ödənişli əsasla qəbul olunanlar üçün təhsil haqqının ödəniş qəbzi.',
    ].join('\n'),
    faq: [
      {
        question: 'İmtahanı neçə dəfə vermək olar?',
        answer:
          '2026-cı ildə imtahan üç dəfə — fevralda, mayda və iyunda keçirilib. Hər cəhd üçün ayrıca qeydiyyat olur. İxtisaslaşma seçimində hansı cəhdin nəticəsi ilə iştirak edəcəyinizi özünüz seçirsiniz.',
      },
      {
        question: 'Bu il bakalavriatı bitirirəm. Müraciət edə bilərəmmi?',
        answer: 'Bəli. Qeydiyyatda diplom əvəzinə bakalavriatı bitirmək haqqında arayış təqdim edirsiniz.',
      },
      {
        question: 'Esse necə qiymətləndirilir?',
        answer: 'Esseyə 30 dəqiqə verilir, maksimum 5 balla qiymətləndirilir.',
      },
      {
        question: 'Ödənişsiz yerlər varmı?',
        answer:
          'Bəli, dövlət sifarişi ilə yerlər var. Əvvəl dövlət hesabına magistraturada oxuyanlar və əcnəbilər yalnız ödənişli yerləri seçə bilər.',
      },
      {
        question: 'Magistraturada hansı dildə oxunur?',
        answer: 'Azərbaycan dilində; bəzi ixtisaslarda rus dilində qruplar da var — cədvəldə «Tədris dili» sütununa baxın.',
      },
    ],
    sideLinks: [DIM_MAG, DIM_MAG_FORM, DIM_CABINET, SCORES],
    contact: CONTACT_AZ,
  },
};

// ── 4. Doktoranturaya qəbul ──────────────────────────────────────────────────
const DOKTORANTURA: QebulPageSeed = {
  slug: 'doktorantura',
  dataBlock: 'doktorantura',
  az: {
    title: 'Doktoranturaya qəbul',
    seoDescription:
      'ADDA-nın doktoranturasına qəbul: fəlsəfə doktoru proqramı, 3 ixtisas, portal.edu.az-da müraciət, xarici dil, fəlsəfə və ixtisas imtahanları.',
    lead:
      'Akademiyada fəlsəfə doktoru proqramı üzrə üç dənizçilik ixtisasında doktorantura var. ' +
      'Sənədlər portal.edu.az-da qəbul olunur, imtahanlar iyunda (xarici dil, DİM) və sentyabrda (fəlsəfə və ixtisas, Akademiya) keçirilir.',
    facts: [
      { label: 'Proqram', value: 'Fəlsəfə doktoru', icon: 'diplom' },
      { label: 'İxtisas', value: '3', icon: 'qrup' },
      { label: 'Qəbul', value: 'Müsabiqə, 3 imtahan', icon: 'imtahan' },
      { label: 'Müraciət', value: 'portal.edu.az', icon: 'sened' },
    ],
    steps: [
      {
        title: 'Elektron müraciət',
        period: 'May–iyun',
        who: 'portal.edu.az',
        body:
          '«Ali və orta ixtisas təhsili müəssisələrinə təhsilalan qeydiyyatı» xidmətini seçib təlimata uyğun müraciət edin və sənədləri yükləyin. ' +
          '2026-cı ildə sənəd qəbulu 19 may – 9 iyun tarixlərində aparılıb.',
        linkLabel: 'portal.edu.az',
        linkUrl: 'https://portal.edu.az',
      },
      {
        title: 'Xarici dil imtahanı',
        period: 'İyun',
        who: 'DİM',
        body:
          'Magistratura səviyyəsi həcmində. Dil sərbəst və ya ixtisasa uyğun seçilir, rus dili istisnadır. Keçid balını toplamayan növbəti imtahana buraxılmır.',
      },
      {
        title: 'Fəlsəfə imtahanı',
        period: 'Sentyabr',
        who: 'ADDA',
        body: 'Xarici dildən keçid balını toplayanlar buraxılır.',
      },
      {
        title: 'İxtisas imtahanı',
        period: 'Sentyabr',
        who: 'ADDA',
        body: 'Fəlsəfədən «məqbul» alanlar buraxılır. Plan yerləri imtahan nəticələrinə görə müsabiqə ilə tutulur.',
      },
    ],
    body: [
      '## Kimlər müraciət edə bilər',
      '',
      'Fəlsəfə doktoru proqramı üzrə doktoranturaya ali təhsilin magistratura səviyyəsini bitirən (magistr dissertasiyasını müdafiə edən) Azərbaycan Respublikasının vətəndaşları müsabiqə ilə qəbul olunur. ' +
        'Doktorantura 2010-cu ildə yaradılıb, kadr hazırlığı Nazirlər Kabinetinin «Doktoranturaların yaradılması və doktoranturaya qəbul Qaydaları» ilə aparılır.',
      '',
      '## İxtisaslar və təhsil müddəti',
      '',
      '- 3319.01 — Gəmiçilik texnikası;',
      '- 3319.02 — Gəmiçilik və su nəqliyyatının istismarı;',
      '- 3319.03 — Gəmiqayırma və gəmi təmiri texnologiyası.',
      '',
      'Fəlsəfə doktoru proqramı üzrə qiyabi təhsil müddəti 4 il, elmlər doktoru proqramı üzrə 5 ildir; müstəsna hallarda uzadıla bilər. Plan yerləri və təhsil forması cədvəldədir.',
      '',
      '## Sənədlər',
      '',
      'portal.edu.az-a yüklənir:',
      '',
      '- tərcümeyi-hal;',
      '- 2 ədəd fotoşəkil (3×4);',
      '- iş yerindən xasiyyətnamə;',
      '- iş stajı olanlar üçün əmək kitabçasından çıxarış;',
      '- çap olunmuş elmi işlərin siyahısı və ya seçilmiş ixtisas üzrə referat;',
      '- ali təhsil diplomunun təsdiqlənmiş surəti;',
      '- xaricdə təhsil alanlar üçün təhsil sənədinin tanınması haqqında şəhadətnamə;',
      '- şəxsiyyət vəsiqəsinin surəti.',
      '',
      '## Təhsil dövründə attestasiya',
      '',
      '| İl | Əsas tələblər |',
      '|---|---|',
      '| 1-ci | Mövzunun kafedrada müzakirəsi və Elmi Şurada təsdiqi, fərdi iş planı, ədəbiyyat icmalı, elmi konfransda çıxış |',
      '| 2-ci | Ali Attestasiya Komissiyasının siyahısındakı nəşrlərdə ən azı iki məqalə, konfransda çıxış, nəticələrin kafedrada müzakirəsi |',
      '| 3-cü | Ən azı iki məqalə, konfransda çıxış, fərdi plan üzrə hesabat |',
      '| 4-cü | Dissertasiyanın kafedrada yekun müzakirəsi, ən azı iki məqalə |',
      '',
      'Hər il sonunda doktorant aparıcı kafedrada hesabat verir və Elmi Şurada attestasiyadan keçir.',
      '',
      '## Normativ sənədlər',
      '',
      '- [Elm haqqında Azərbaycan Respublikasının Qanunu](https://e-qanun.az/framework/33488)',
      '- [Elmi dərəcələr verilməsi qaydası haqqında Əsasnamə](http://www.e-qanun.az/framework/42605)',
      '- [Doktoranturaların yaradılması və doktoranturaya qəbul Qaydaları](http://www.e-qanun.az/framework/19800)',
      '- [Ali Attestasiya Komissiyası](http://www.aak.gov.az/)',
      '- [Avtoreferatın tərtibi Qaydası](https://res.cloudinary.com/xpjtibwa/image/upload/v1785218179/Avtoreferat_n_t_rtibi_Qaydas_e1525b652f.pdf)',
      '- [Dissertasiyanın tərtibi Qaydası](https://res.cloudinary.com/xpjtibwa/image/upload/v1785218181/Dissertasiyan_n_t_rtibi_Qaydas_15a6f68d59.pdf)',
      '- [Fəlsəfə doktoru imtahanlarının keçirilməsi Qaydası](https://res.cloudinary.com/xpjtibwa/image/upload/v1785218187/F_ls_f_doktoru_imtahanlar_n_n_ke_irilm_Qaydas_905e8ce2fa.pdf)',
    ].join('\n'),
    faq: [
      {
        question: 'Xarici dil imtahanında hansı dili seçmək olar?',
        answer: 'Rus dili istisna olmaqla istənilən dili — sərbəst və ya ixtisasa uyğun.',
      },
      {
        question: 'Fəlsəfə imtahanına kimlər buraxılır?',
        answer: 'Xarici dil imtahanında keçid balını toplayanlar. Fəlsəfədən «məqbul» alanlar ixtisas imtahanına buraxılır.',
      },
      {
        question: 'Elmlər doktoru proqramı varmı?',
        answer: 'Bəli, elmlər doktoru proqramı üzrə qiyabi təhsil müddəti 5 ildir.',
      },
    ],
    sideLinks: [
      PORTAL,
      DIM_PHD,
      { label: '2026-cı il qəbul elanı', url: '/elanlar/doktoranturaya-sened-qebulu-elan-edilir-2026' },
      { label: 'Ali Attestasiya Komissiyası', url: 'http://www.aak.gov.az/' },
    ],
    contact: CONTACT_AZ,
  },
};

// ── 5. Təkrar ali təhsil ─────────────────────────────────────────────────────
const TEKRAR_ALI: QebulPageSeed = {
  slug: 'tekrar-ali-tehsil',
  dataBlock: 'tekrar_ali',
  az: {
    title: 'Təkrar ali təhsil',
    seoDescription:
      'ADDA-da təkrar ali təhsil: ali təhsillilər üçün dənizçilik ixtisası, qiyabi və ödənişli, portal.edu.az-da müraciət, müsahibə, sənədlər və haqq.',
    lead:
      'Ali təhsili olanlar dənizçilik ixtisaslarından birini ikinci ixtisas kimi qiyabi formada, ödənişli əsaslarla ala bilər. ' +
      'Müraciət portal.edu.az-da, qəbul Akademiyadakı müsahibə ilə aparılır.',
    facts: [
      { label: 'Kimlər üçün', value: 'Ali təhsili olanlar', icon: 'diplom' },
      { label: 'Təhsil forması', value: 'Qiyabi, ödənişli', icon: 'forma' },
      { label: 'Qəbul', value: 'Müsahibə', icon: 'imtahan' },
      { label: 'Müraciət', value: 'portal.edu.az', icon: 'sened' },
    ],
    steps: [
      {
        title: 'Elektron müraciət',
        period: 'İyun–avqust',
        who: 'portal.edu.az',
        body:
          'Sənədləri portal.edu.az platformasında elektron təqdim edin. Baza təhsil məlumatlarınız «Tələbə-Məzun» dövlət elektron məlumat sistemində (TM DEMS) əks olunmalıdır. ' +
          '2026-cı ildə sənəd qəbulu 9 iyun – 24 avqust tarixlərində aparılıb.',
        linkLabel: 'portal.edu.az',
        linkUrl: 'https://portal.edu.az',
      },
      {
        title: 'Müsahibə',
        period: 'Sənəd qəbulundan sonra',
        who: 'ADDA',
        body:
          'Qeydiyyatdan keçən və tələblərə cavab verənlər Akademiyaya müsahibəyə dəvət olunur. Üzən gəmilərdə dənizdə olanlar üçün müsahibə onlayn təşkil olunur.',
      },
      {
        title: 'Sənədlərin əsli və müqavilə',
        period: 'Müsahibədən sonra',
        who: 'ADDA',
        body: 'Müsahibədən keçənlər sənədlərin əslini Akademiyanın komissiyasına təqdim edir və təhsil haqqı üzrə müqavilə bağlayır.',
        linkLabel: 'Sənədlərin siyahısı',
        linkUrl: '#senedler',
      },
      {
        title: 'Təhsil',
        period: 'Sentyabrdan',
        who: 'ADDA',
        body: 'Təhsil qiyabi formada, Akademiyanın təsdiq etdiyi xüsusi proqramlarla aparılır.',
      },
    ],
    body: [
      '## Kimlər üçündür',
      '',
      'Təkrar ali təhsil ali təhsili olan və dənizçilik ixtisası almaq istəyənlər üçündür: bir ixtisas üzrə ali təhsil alıb dənizdə işləmək istəyənlər, gəmidə işləyib diplomunu dənizçilik ixtisası ilə tamamlamaq istəyənlər.',
      '',
      '- Təhsil müqavilə əsasında, Akademiyanın hazırladığı ixtisaslar üzrə aparılır.',
      '- Proqram əvvəlki ixtisasla yeni ixtisas arasındakı fərqə görə qurulur: əvvəl keçdiyiniz və məzmunu uyğun gələn fənlərdən azad oluna bilərsiniz.',
      '- Qruplarda 15–30 tələbə olur.',
      '- 1993-cü ildən sonra xaricdə ali təhsil almış şəxslər diplomları Elm və Təhsil Nazirliyi tərəfindən tanındıqdan sonra müraciət edə bilər.',
      '',
      '## İxtisaslar (2026/2027)',
      '',
      '- 6006006 — Dəniz naviqasiyası mühəndisliyi;',
      '- 6006012 — Gəmi energetik qurğularının istismarı mühəndisliyi.',
      '',
      'Təhsil qiyabi formada və ödənişli əsaslarla aparılır.',
      '',
      '## Sənədlər',
      '',
      'Müsahibəyə dəvət olunanlar təqdim edir:',
      '',
      '1. Rektorun adına ərizə ([ərizə forması](/elanlar/tekrar-ali-tehsil-almaq-isteyenler-ucun-erize-formasi)).',
      '2. Ali təhsil haqqında sənədin (diplom və diploma əlavə) notarial qaydada təsdiqlənmiş surəti.',
      '3. İş yerindən arayış (işləyənlər üçün).',
      '4. 3×4 ölçüdə 6 ədəd fotoşəkil.',
      '5. Şəxsiyyət vəsiqəsinin surəti.',
      '6. Sağlamlıq haqqında arayış.',
      '7. Yaşayış yerindən arayış.',
      '',
      '## Təhsil haqqı',
      '',
      'İllik təhsil haqqı **3800 AZN**-dir (2026/2027-ci tədris ili üzrə elan).',
      '',
      '## Nə alırsınız',
      '',
      'Təhsil müddətində nəzəri diplomla yanaşı işçi diplom, dənizçinin qeyd kitabçası, dənizçinin şəxsiyyət sənədi və müvafiq sertifikatlar verilir.',
    ].join('\n'),
    faq: [
      {
        question: 'Dənizdəyəm. Müsahibəyə necə qatılım?',
        answer: 'Üzən gəmilərdə dənizdə olan müraciətçilər üçün müsahibə onlayn təşkil olunur.',
      },
      {
        question: 'Əvvəl keçdiyim fənlər sayılırmı?',
        answer: 'Bəli. Əvvəlki ixtisasda öyrəndiyiniz fənnin məzmunu yeni proqramdakı fənnə uyğundursa, həmin fənn üzrə məşğələ və attestasiyadan azad olunursunuz.',
      },
      {
        question: 'Xaricdə aldığım diplomla müraciət edə bilərəmmi?',
        answer: '1993-cü ildən sonra xaricdə alınmış diplom Elm və Təhsil Nazirliyi tərəfindən tanınandan sonra.',
      },
      {
        question: 'Təhsil hansı formada aparılır?',
        answer: 'Qiyabi formada və ödənişli əsaslarla.',
      },
    ],
    sideLinks: [
      PORTAL,
      { label: '2026/2027 qəbul elanı', url: '/elanlar/adda-2026-2027-ci-tedris-ili-uzre-tekrar-ali-tehsil-ucun-sened-qebulu-elan-edir' },
      { label: 'Ərizə forması', url: '/elanlar/tekrar-ali-tehsil-almaq-isteyenler-ucun-erize-formasi' },
      SCORES,
    ],
    contact: CONTACT_AZ,
  },
};

// ── 6. Keçid balları, yer sayı və təhsil haqqı ──────────────────────────────
const KECID_BALLARI: QebulPageSeed = {
  slug: 'kecid-ballari',
  dataBlock: 'qebul_cedveli',
  az: {
    title: 'Keçid balları, yer sayı və təhsil haqqı',
    seoDescription:
      'ADDA-nın bütün ixtisasları üzrə plan yerləri, illik təhsil haqqı və son illərin keçid balları: kollec, bakalavriat, magistratura, doktorantura.',
    lead:
      'Bütün pillələr üzrə ixtisaslar bir yerdə: cari ilin plan yerləri, illik təhsil haqqı və son illərin keçid balları. ' +
      'Rəqəmlər ixtisasların kataloqundan avtomatik gəlir.',
    facts: [
      { label: 'Bakalavriatda maksimal bal', value: '700', icon: 'bal' },
      { label: 'Magistraturada maksimal bal', value: '100', icon: 'bal' },
      { label: 'Kollecdə maksimal bal (11 illik)', value: '300', icon: 'bal' },
    ],
    body: [
      '## Cədvəli necə oxumalı',
      '',
      '- **Keçid balı** — həmin il ixtisasa qəbul olunanların ən aşağı balıdır; ödənişsiz və ödənişli yerlər üzrə ayrıca göstərilir.',
      '- Bal hər il dəyişir: müsabiqə həmin il müraciət edənlərin nəticəsindən asılıdır. Ötən ilin balı zəmanət deyil, istiqamətdir.',
      '- **Plan yerləri** — cari tədris ili üçün təsdiqlənmiş qəbul planıdır; bölgü (əyani, qiyabi, dil, ödənişsiz) rəqəmin altında göstərilir.',
      '- **Təhsil haqqı** — ödənişli yerlər üçün illik məbləğdir. Əcnəbi vətəndaşlar üçün haqq ayrıca müəyyən olunur: [Əcnəbi vətəndaşlar](/sehife/ecnebi-telebelerin-qebulu-qaydalari).',
      '',
      '## Mənbə',
      '',
      'Plan yerləri Akademiyanın təsdiq olunmuş qəbul planından, keçid balları DİM-in yerləşdirmə nəticələrindən götürülür. Cədvəl ixtisas səhifələri ilə eyni mənbədən qurulur — ixtisas yenilənəndə burada da yenilənir.',
    ].join('\n'),
    faq: [
      {
        question: 'Keçid balı növbəti il üçün zəmanətdirmi?',
        answer: 'Xeyr. Keçid balı müsabiqənin nəticəsidir və hər il müraciət edənlərin sayına və nəticəsinə görə dəyişir.',
      },
      {
        question: 'Bəzi ixtisaslarda keçid balı niyə yoxdur?',
        answer: 'İxtisas yenidirsə və ya həmin il üzrə nəticə hələ dərc olunmayıbsa, bal göstərilmir.',
      },
    ],
    sideLinks: [
      { label: 'Kollecə qəbul', url: '/sehife/subbakalavr' },
      { label: 'Bakalavriata qəbul', url: '/sehife/bakalavriat' },
      { label: 'Magistraturaya qəbul', url: '/sehife/magistratura' },
      { label: 'Doktoranturaya qəbul', url: '/sehife/doktorantura' },
      { label: 'Təkrar ali təhsil', url: '/sehife/tekrar-ali-tehsil' },
      { label: 'Bütün ixtisaslar', url: '/ixtisaslar' },
    ],
  },
};

// ── 7. Məzunların işlə təminatı ──────────────────────────────────────────────
const MEZUNLAR: QebulPageSeed = {
  slug: 'mezunlarin-isle-teminati',
  dataBlock: 'yox',
  az: {
    title: 'Məzunların işlə təminatı',
    seoDescription:
      'ADDA məzunları harada işləyir: ASCO-nun kadr mənbəyi, zəmanət məktubu ilə işə qəbul, üzmə təcrübəsi, ASCO hesabına xaricdə təhsil.',
    lead:
      'Akademiya «Azərbaycan Xəzər Dəniz Gəmiçiliyi» QSC-nin (ASCO) əsas kadr mənbəyidir. Məzunlar Xəzərdə və dünya sularında üzən gəmilərdə, ' +
      'limanlarda, gəmi təmiri müəssisələrində və beynəlxalq şirkətlərdə çalışır.',
    facts: [
      { label: 'Əsas işəgötürən', value: 'ASCO', icon: 'bina' },
      { label: 'İşə qəbul', value: 'Zəmanət məktubu ilə', icon: 'sened' },
      { label: 'Diplom', value: '170-dən çox ölkədə tanınır', icon: 'diplom' },
    ],
    stepsTitle: 'Karyera yolu',
    steps: [
      {
        title: 'Təhsil və dənizçi sənədləri',
        period: 'Təhsil boyu',
        who: 'ADDA',
        body: 'Nəzəri diplomla yanaşı işçi diplom və beynəlxalq sertifikatlar verilir.',
      },
      {
        title: 'Üzmə təcrübəsi',
        period: 'Hər il',
        who: 'Gəmilər',
        body: 'Tələbələr gəmilərdə təcrübə keçir; hər il bir qrup tələbə Qara dənizdəki gəmilərə göndərilir.',
        linkLabel: 'Təcrübə haqqında',
        linkUrl: '/sehife/tecrube-haqqinda',
      },
      {
        title: 'Xaricdə təhsil (seçimlə)',
        period: 'Təhsil dövründə',
        who: 'ASCO',
        body: 'Əla və zərbəçi tələbələr seçimlə xarici ölkələrin dənizçilik ali məktəblərində ASCO-nun vəsaiti hesabına müddətli təhsil alır.',
      },
      {
        title: 'İşə qəbul',
        period: 'Məzuniyyətdən sonra',
        who: 'ASCO',
        body: 'Təhsildə uğurlu nəticələrlə fərqlənən məzunların işə qəbulu zəmanət məktubları əsasında aparılır.',
      },
    ],
    body: [
      '## Məzunlar harada işləyir',
      '',
      'Gəmiçiliyin yüksəkixtisaslı kadrlara daimi ehtiyacı keyfiyyətə üstünlük verilməsi şərti ilə ödənilir. Məzunlar:',
      '',
      '- Xəzər dənizində və dünyanın müxtəlif sularında üzən gəmilərdə;',
      '- aparıcı beynəlxalq gəmiçilik şirkətlərində;',
      '- limanlarda və gəmi təmiri müəssisələrində işləyir.',
      '',
      'Hər ixtisas üzrə vəzifələr ixtisas səhifəsindəki «Harada işləyə bilərsən?» bölməsindədir: [İxtisaslar](/ixtisaslar).',
      '',
      '## Karyera dəstəyi',
      '',
      'Məzunlar üçün karyera inkişafı, əlavə təhsil və sosial müdafiənin gücləndirilməsi imkanları yaradılır. ' +
        'Dənizçilər sertifikatlarını [Təlim-Tədris Mərkəzinin](/struktur/telim-tedris-merkezi) STCW kurslarında yeniləyir.',
      '',
      '## Dəniz təcrübəsi',
      '',
      'Dənizçi kadrların beynəlxalq standartlara uyğun hazırlanması üçün hər il bir qrup tələbə Qara dənizdəki gəmilərə üzmə təcrübəsinə göndərilir. ' +
        'Akademiyanın [tədris gəmisi](/sehife/tedris-gemisi) də var.',
    ].join('\n'),
    sideLinks: [
      { label: 'Təcrübə haqqında', url: '/sehife/tecrube-haqqinda' },
      { label: 'Tədris gəmisi', url: '/sehife/tedris-gemisi' },
      { label: 'STCW kursları', url: '/struktur/telim-tedris-merkezi' },
      { label: 'Bütün ixtisaslar', url: '/ixtisaslar' },
    ],
  },
};

// ── 8. Yataqxana ─────────────────────────────────────────────────────────────
const YATAQXANA: QebulPageSeed = {
  slug: 'yataqxana',
  dataBlock: 'yox',
  az: {
    title: 'Yataqxana',
    seoDescription:
      'ADDA-nın tələbə yataqxanası: Üzeyir Hacıbəyli küçəsi 114, 104 otaq, 311 yer, yerləşmə qaydası, şərait, hüquq və vəzifələr.',
    lead:
      'Akademiyanın 5 mərtəbəli tələbə yataqxanası Bakıda, Üzeyir Hacıbəyli küçəsi 114-də yerləşir: 104 otaq, 311 yer. ' +
      'Yer qeydiyyat zamanı verilən ərizə və müqavilə əsasında ayrılır.',
    facts: [
      { label: 'Ünvan', value: 'Üzeyir Hacıbəyli küç. 114', icon: 'unvan' },
      { label: 'Otaq', value: '104 (18,3 m²)', icon: 'bina' },
      { label: 'Yer', value: '311', icon: 'yer' },
      { label: 'Mühafizə', value: '24 saat', icon: 'qoruma' },
    ],
    stepsTitle: 'Yer necə alınır',
    steps: [
      {
        title: 'Ərizə',
        period: 'Qeydiyyat zamanı (sentyabr)',
        who: 'ADDA',
        body: 'Əyani təhsilə qəbul olunanlar sənəd təqdimi zamanı yataqxanaya yerləşdirilmə üçün ərizə verir.',
      },
      {
        title: 'Müqavilə',
        period: 'Yerləşmədən əvvəl',
        who: 'Yataqxana',
        body: 'Tələbə ilə yataqxana arasında müqavilə imzalanır. Yerləşdirmə ADDA yataqxanası haqqında Əsasnaməyə uyğun aparılır.',
      },
      {
        title: 'Yerləşmə',
        period: 'Tədris ilinin əvvəli',
        who: 'Yataqxana',
        body: 'Təhsil dövrü üçün otaq təhkim olunur, daxili nizam qaydaları ilə tanış olursunuz.',
      },
    ],
    body: [
      '## Yaşayış şəraiti',
      '',
      'Yataqxana 2016-cı ildə əsaslı təmirdən çıxıb. Ümumi sahəsi 3491,4 m²-dir: hər biri 18,3 m² olan 104 yaşayış otağı, 10 xidməti otaq və hər biri 40 m² olan 2 istirahət otağı var.',
      '',
      '![Tələbə yataqxanası](https://res.cloudinary.com/xpjtibwa/image/upload/v1785218147/IMG_6366_09bdbf2dc5.jpg)',
      '',
      '- Hər mərtəbənin iki tərəfində hamam, ayaqyolu, mətbəx və paltar qurutmaq üçün yer var; çamaşırxana işləyir.',
      '- Otaqlar mebel, avadanlıq və yataq dəsti ilə təmin olunur. Dəsmallar həftədə bir, yataq dəstləri 10 gündə bir dəyişdirilir.',
      '- İsti və soyuq su, mərkəzi istilik sistemi, internet.',
      '- Bina 24 saat canlı mühafizə olunur, müşahidə kameraları quraşdırılıb.',
      '',
      '![Yataqxana otağı](https://res.cloudinary.com/xpjtibwa/image/upload/v1785218150/IMG_6287_6ba9f5007a.jpg)',
      '',
      '## Asudə vaxt',
      '',
      'Həftə sonları Akademiya tələbələr üçün teatr, muzey, sərgi və tarixi yerlərə pulsuz gəzinti turları təşkil edir. Tələbə şurası mədəni-kütləvi və idman tədbirləri keçirir.',
      '',
      '## Əcnəbi tələbələr',
      '',
      'Akademiyada təhsil alan əcnəbilər yataqxanada ümumi əsaslarla yerləşdirilir. 2026/2027-ci ildə əcnəbi tələbələr yataqxana ilə ödənişsiz təmin olunur.',
      '',
      '## Hüquq və vəzifələr',
      '',
      '**Tələbə hüququna malikdir:** təhkim olunmuş otaqda yaşamaq; ümumi istifadə yerlərindən və avadanlıqdan istifadə etmək; müdiriyyətin razılığı ilə başqa otağa köçmək; tələbə şurasını seçmək və seçilmək; tədbirlərdə iştirak etmək.',
      '',
      '**Tələbə borcludur:** daxili nizam-intizam, texniki və yanğın təhlükəsizliyi qaydalarına əməl etmək; otağa və əmlaka qayğı ilə yanaşmaq, enerjiyə və suya qənaət etmək, otağı hər gün təmizləmək; növbətçilik cədvəlinə əməl etmək; ' +
        'otaqdan çıxanda işığı söndürmək, cihazları elektrik şəbəkəsindən ayırmaq; vurduğu ziyanı ödəmək.',
      '',
      '**Qadağandır:** özbaşına otaq dəyişmək və əşya aparmaq; elektrik cihazlarını özbaşına təmir etmək; divara şəkil və elan asmaq; səs yüksəldici cihazlardan istifadə etmək; otaqda kənar şəxsin gecələməsinə şərait yaratmaq; spirtli içki saxlamaq və istifadə etmək.',
      '',
      'Tələbələr yataqxanaya saat 22:00-dan gec olmayaraq qayıtmalıdır. İşləyən tələbələr üçün bu vaxt tələbə şurasının və yataqxana müdirinin təqdimatı ilə rektorun icazəsi əsasında uzadıla bilər. ' +
        'Şəxsi əşyalar yataqxana müdiriyyəti ilə razılaşdırılaraq gətirilir.',
    ].join('\n'),
    faq: [
      {
        question: 'Yataqxanaya necə müraciət edim?',
        answer: 'Əyani təhsilə qəbul olunduqdan sonra sənəd təqdimi zamanı ərizə verirsiniz; yerləşmə müqavilə əsasında aparılır.',
      },
      {
        question: 'Saat neçəyə qədər qayıtmaq lazımdır?',
        answer: 'Saat 22:00-a qədər. İşləyən tələbələr üçün rektorun icazəsi ilə uzadıla bilər.',
      },
      {
        question: 'Əcnəbi tələbələr yataqxanada yaşaya bilərmi?',
        answer: 'Bəli, ümumi əsaslarla. 2026/2027-ci ildə əcnəbi tələbələr üçün yataqxana ödənişsizdir.',
      },
    ],
    sideLinks: [
      { label: 'Bakalavriata qəbul', url: '/sehife/bakalavriat' },
      { label: 'Əcnəbi vətəndaşlar', url: '/sehife/ecnebi-telebelerin-qebulu-qaydalari' },
    ],
    contact: '**Yataqxana müdiri:** Hüseyn Məhərrəmov\n\n**Mobil:** +994 50 278 06 05\n\n**Ünvan:** Bakı, Üzeyir Hacıbəyli küçəsi 114',
  },
};

// ── 9. Əcnəbi vətəndaşlar: qəbul qaydaları və təhsil haqqı (az/en/ru) ────────
const FOREIGN_CONTACT_AZ = '**Ünvan:** Bakı, Zərifə Əliyeva küçəsi 18\n\n**Telefon:** +994 12 493 36 44\n\n**E-poçt:** akademiya@asco.az';

const ECNEBI: QebulPageSeed = {
  slug: 'ecnebi-telebelerin-qebulu-qaydalari',
  dataBlock: 'yox',
  az: {
    title: 'Əcnəbi vətəndaşların qəbulu',
    seoDescription:
      'ADDA-ya əcnəbi vətəndaşların qəbulu: ixtisaslar və tədris dili, 2026/2027 təhsil haqqı, müraciət addımları, sənədlər, miqrasiya qeydiyyatı.',
    lead:
      'Əcnəbilər və vətəndaşlığı olmayan şəxslər bakalavriat və magistraturaya müsahibə ilə qəbul olunur. ' +
      '2026/2027-ci tədris ilində illik təhsil haqqı 5100 manatdır; geyim forması, tədris materialları və yataqxana ödənişsizdir.',
    facts: [
      { label: 'Təhsil haqqı (2026/2027)', value: '5100 AZN/il', icon: 'haqq' },
      { label: 'Bakalavriat', value: '4 il', icon: 'muddet' },
      { label: 'Magistratura', value: '2 il', icon: 'muddet' },
      { label: 'Tədris dili', value: 'Azərbaycan, ingilis, rus', icon: 'dil' },
      { label: 'Dərslər', value: '15 sentyabrdan', icon: 'tarix' },
    ],
    steps: [
      {
        title: 'İlkin müraciət',
        period: 'Qəbul elanından sonra',
        who: 'E-poçt',
        body:
          'Pasportun və orta təhsil sənədinin (magistratura üçün — bakalavr diplomunun) surətini Akademiyaya göndərin. Elektron qeydiyyat portal.edu.az-da aparılır.',
        linkLabel: 'akademiya@asco.az',
        linkUrl: 'mailto:akademiya@asco.az',
      },
      {
        title: 'Müsahibə',
        period: 'Sənədlərə baxılandan sonra',
        who: 'ADDA',
        body:
          'Təhsil səviyyəniz üzrə hazırlığınız və tədris dilini bilmə dərəcəniz Akademiyanın müsahibə komissiyasında yoxlanılır. Tələblərə uyğun gəlsəniz, qəbul rəsmiləşdirilir.',
      },
      {
        title: 'Sənədlərin əsli',
        period: 'Gəlişdən sonra',
        who: 'ADDA',
        body: 'Sənədlərin əslini təqdim edirsiniz. Bütün sənədlər tərcümə edilməli və notarial qaydada təsdiqlənməlidir.',
        linkLabel: 'Sənədlərin siyahısı',
        linkUrl: '#senedler',
      },
      {
        title: 'Miqrasiya qeydiyyatı',
        period: 'Təhsilin əvvəlində',
        who: 'Dövlət Miqrasiya Xidməti',
        body:
          'Əyani təhsil alan əcnəbi tələbələr qeydiyyata alınır və onlara bir illik müvəqqəti yaşamaq hüququ verilir. Miqrasiya Xidməti üçün tibbi arayış Bakıdakı International Medical Center-dən alınır.',
      },
      {
        title: 'Dərslər başlayır',
        period: '15 sentyabr',
        who: 'ADDA',
        body: 'Lazım olsa, əvvəlcə Azərbaycan və ya ingilis dili üzrə ödənişli hazırlıq kursu keçə bilərsiniz.',
      },
    ],
    body: [
      '## Qəbulun əsasları',
      '',
      'Əcnəbilərin və vətəndaşlığı olmayan şəxslərin qəbulu aşağıdakı əsaslarla aparılır:',
      '',
      '- Azərbaycan Respublikası ilə xarici ölkələr arasında təhsil, elm və mədəniyyət sahəsində hökumətlərarası və idarələrarası sazişlər;',
      '- təhsil müəssisələri arasında bağlanmış birbaşa müqavilələr;',
      '- qeyri-hökumət və xeyriyyə təşkilatlarının təqaüdləri;',
      '- Akademiyanın xarici təşkilat, şirkət, assosiasiya və vətəndaşlarla bağladığı müqavilələr.',
      '',
      '## İxtisaslar və tədris dili (2026/2027)',
      '',
      '| Pillə | İxtisas | Tədris dili |',
      '|---|---|---|',
      '| Bakalavriat (4 il) | Dəniz naviqasiyası mühəndisliyi | Azərbaycan, ingilis, rus |',
      '| Bakalavriat (4 il) | Gəmi energetik qurğularının istismarı mühəndisliyi | Azərbaycan, ingilis |',
      '| Bakalavriat (4 il) | Gəmiqayırma və gəmi təmiri mühəndisliyi | Azərbaycan |',
      '| Bakalavriat (4 il) | Elektrik və elektronika mühəndisliyi | Azərbaycan |',
      '| Magistratura (2 il) | Gəmiçilik və gəmilərin hərəkətinin idarə edilməsi | Azərbaycan |',
      '| Magistratura (2 il) | Dəniz texnikası və texnologiyası mühəndisliyi | Azərbaycan |',
      '| Magistratura (2 il) | Dəniz texnikası və avadanlıqlarının istismarı mühəndisliyi | Azərbaycan |',
      '| Magistratura (2 il) | Elektrik və elektronika mühəndisliyi | Azərbaycan |',
      '',
      'Təhsil əyani formadadır. Akademiyanın və digər universitetlərin məzunları dənizçilik ixtisaslarından biri üzrə [ikinci ali təhsil](/sehife/tekrar-ali-tehsil) ala bilər.',
      '',
      '## Təhsil haqqı və təminat',
      '',
      '- İllik təhsil haqqı — **5100 manat** (2026/2027-ci tədris ili üzrə elan).',
      '- Geyim forması, tədris materialları və [yataqxana](/sehife/yataqxana) ödənişsizdir.',
      '- Tələbələr nəzəri diplomla yanaşı işçi diplom və beynəlxalq sertifikatlarla təmin olunur.',
      '- Akademiyanın diplomları 170-dən çox ölkədə tanınır. Akademiya Beynəlxalq Dəniz Universitetləri Assosiasiyasının və Xəzəryanı ölkələrin Dövlət Universitetləri Assosiasiyasının üzvüdür.',
      '',
      '## Sənədlər',
      '',
      '**İlkin mərhələ (e-poçtla, surət):**',
      '',
      '- pasport;',
      '- orta təhsil sənədi (attestat və ya diplom);',
      '- bakalavr diplomu (yalnız magistratura üçün).',
      '',
      '**Növbəti mərhələ (əsli):**',
      '',
      '1. Rektorun adına ərizə.',
      '2. Orta təhsil sənədi və onun əlavəsi.',
      '3. Pasport və vizalı səhifələrin surəti.',
      '4. Qırmızı fonda 8 ədəd rəngli fotoşəkil (3×4).',
      '5. Sağlamlıq haqqında arayış: Akademiya üçün — gəldiyiniz ölkənin tibb müəssisəsindən; Miqrasiya Xidməti üçün — Bakıdakı International Medical Center-dən.',
      '6. Bakalavr diplomu və əlavəsi (yalnız magistratura üçün).',
      '',
      'Bütün sənədlər tərcümə edilməli və notarial qaydada təsdiqlənməlidir.',
      '',
      '## Hazırlıq kursları',
      '',
      'Tədris dilini kifayət qədər bilməyənlər üçün Akademiyada Azərbaycan və ingilis dili üzrə ödənişli hazırlıq kursları təşkil olunur.',
    ].join('\n'),
    faq: [
      {
        question: 'Təhsil haqqına nə daxildir?',
        answer: '2026/2027-ci ildə illik haqq 5100 manatdır. Geyim forması, tədris materialları və yataqxana əlavə ödənişsiz verilir.',
      },
      {
        question: 'Hansı dildə oxuya bilərəm?',
        answer:
          'Bakalavriatda Dəniz naviqasiyası mühəndisliyi Azərbaycan, ingilis və rus, Gəmi energetik qurğularının istismarı mühəndisliyi Azərbaycan və ingilis dillərində tədris olunur. Magistratura Azərbaycan dilindədir.',
      },
      {
        question: 'Tədris dilini bilmirəm. Nə etməliyəm?',
        answer: 'Akademiyada Azərbaycan və ingilis dili üzrə ödənişli hazırlıq kursları var.',
      },
      {
        question: 'Yaşamaq icazəsini necə alıram?',
        answer: 'Əyani təhsil alan əcnəbi tələbə Dövlət Miqrasiya Xidmətində qeydiyyata alınır və ona bir illik müvəqqəti yaşamaq hüququ verilir.',
      },
      {
        question: 'Diplom tanınırmı?',
        answer: 'Akademiyanın diplomları 170-dən çox ölkədə tanınır.',
      },
    ],
    sideLinks: [
      { label: '2026/2027 qəbul elanı', url: '/elanlar/elan-2026' },
      PORTAL,
      { label: 'İngilis dilində tədris', url: '/sehife/ingilis-dilinde-tedris' },
      DORM,
      { label: 'Beynəlxalq əlaqələr qrupu', url: '/sehife/beynelxalq-elaqeler-qrupu' },
    ],
    contact: FOREIGN_CONTACT_AZ,
  },
  en: {
    title: 'Admission of International Students',
    seoDescription:
      'Admission of international students to ADDA: programmes and language of instruction, 2026/2027 tuition fee, how to apply, documents, migration registration.',
    lead:
      'Foreign nationals and stateless persons are admitted to bachelor’s and master’s programmes after an interview. ' +
      'In 2026/2027 the annual tuition fee is 5,100 AZN; uniform, study materials and a place in the residence hall are provided free of charge.',
    facts: [
      { label: 'Tuition fee (2026/2027)', value: '5,100 AZN per year', icon: 'haqq' },
      { label: 'Bachelor’s', value: '4 years', icon: 'muddet' },
      { label: 'Master’s', value: '2 years', icon: 'muddet' },
      { label: 'Language of instruction', value: 'Azerbaijani, English, Russian', icon: 'dil' },
      { label: 'Classes start', value: '15 September', icon: 'tarix' },
    ],
    steps: [
      {
        title: 'Initial application',
        period: 'After the admission announcement',
        who: 'E-mail',
        body:
          'Send copies of your passport and school-leaving certificate (for the master’s — your bachelor’s diploma) to the Academy. Online registration is carried out at portal.edu.az.',
        linkLabel: 'akademiya@asco.az',
        linkUrl: 'mailto:akademiya@asco.az',
      },
      {
        title: 'Interview',
        period: 'After your documents are reviewed',
        who: 'ADDA',
        body:
          'The Academy’s interview board checks your academic preparation and your command of the language of instruction. If you meet the requirements, your admission is formalised.',
      },
      {
        title: 'Original documents',
        period: 'On arrival',
        who: 'ADDA',
        body: 'You submit the original documents. All documents must be translated and notarised.',
        linkLabel: 'List of documents',
        linkUrl: '#documents',
      },
      {
        title: 'Migration registration',
        period: 'At the start of studies',
        who: 'State Migration Service',
        body:
          'Full-time international students are registered and granted a one-year temporary residence permit. For the Migration Service the medical certificate is issued by International Medical Center in Baku.',
      },
      {
        title: 'Classes start',
        period: '15 September',
        who: 'ADDA',
        body: 'If needed, you can first take a paid preparatory course in Azerbaijani or English.',
      },
    ],
    body: [
      '## Grounds for admission',
      '',
      'Foreign nationals and stateless persons are admitted on the basis of:',
      '',
      '- intergovernmental and interagency agreements between the Republic of Azerbaijan and other countries on cooperation in education, science and culture;',
      '- direct agreements between educational institutions;',
      '- scholarships established by non-governmental and charitable organisations;',
      '- contracts between the Academy and foreign organisations, companies, associations and individuals.',
      '',
      '## Programmes and language of instruction (2026/2027)',
      '',
      '| Level | Programme | Language of instruction |',
      '|---|---|---|',
      '| Bachelor’s (4 years) | Marine Navigation Engineering | Azerbaijani, English, Russian |',
      '| Bachelor’s (4 years) | Marine Power Plant Operation Engineering | Azerbaijani, English |',
      '| Bachelor’s (4 years) | Shipbuilding and Ship Repair Engineering | Azerbaijani |',
      '| Bachelor’s (4 years) | Electrical and Electronics Engineering | Azerbaijani |',
      '| Master’s (2 years) | Shipping and Ship Traffic Management | Azerbaijani |',
      '| Master’s (2 years) | Marine Engineering and Technology | Azerbaijani |',
      '| Master’s (2 years) | Operation of Marine Machinery and Equipment | Azerbaijani |',
      '| Master’s (2 years) | Electrical and Electronics Engineering | Azerbaijani |',
      '',
      'Studies are full-time. Graduates of the Academy and other universities can obtain a [second higher education](/sehife/tekrar-ali-tehsil) in one of the maritime programmes.',
      '',
      '## Tuition fee and support',
      '',
      '- Annual tuition fee — **5,100 AZN** (2026/2027 admission announcement).',
      '- Uniform, study materials and a place in the [residence hall](/sehife/yataqxana) are free of charge.',
      '- In addition to the academic diploma, students receive a working diploma and international certificates.',
      '- The Academy’s diplomas are recognised in more than 170 countries. The Academy is a member of the International Association of Maritime Universities and the Association of State Universities of the Caspian States.',
      '',
      '## Documents',
      '',
      '**First stage (copies, by e-mail):**',
      '',
      '- passport;',
      '- school-leaving certificate or diploma;',
      '- bachelor’s diploma (master’s applicants only).',
      '',
      '**Second stage (originals):**',
      '',
      '1. Application addressed to the Rector.',
      '2. School-leaving certificate (or diploma) with its supplement.',
      '3. Passport and copies of the pages with visas.',
      '4. 8 colour photos, 3×4 cm, on a red background.',
      '5. Medical certificate: for the Academy — from a medical institution in your home country; for the Migration Service — from International Medical Center in Baku.',
      '6. Bachelor’s diploma with its supplement (master’s applicants only).',
      '',
      'All documents must be translated and notarised.',
      '',
      '## Preparatory courses',
      '',
      'Students who do not yet have sufficient command of the language of instruction can take paid preparatory courses in Azerbaijani and English at the Academy.',
    ].join('\n'),
    faq: [
      {
        question: 'What does the tuition fee include?',
        answer: 'In 2026/2027 the annual fee is 5,100 AZN. Uniform, study materials and a place in the residence hall are provided at no extra cost.',
      },
      {
        question: 'In which language can I study?',
        answer:
          'At the bachelor’s level, Marine Navigation Engineering is taught in Azerbaijani, English and Russian, and Marine Power Plant Operation Engineering in Azerbaijani and English. Master’s programmes are taught in Azerbaijani.',
      },
      {
        question: 'I do not speak the language of instruction. What should I do?',
        answer: 'The Academy offers paid preparatory courses in Azerbaijani and English.',
      },
      {
        question: 'How do I get a residence permit?',
        answer: 'Full-time international students are registered with the State Migration Service and granted a one-year temporary residence permit.',
      },
      {
        question: 'Is the diploma recognised abroad?',
        answer: 'The Academy’s diplomas are recognised in more than 170 countries.',
      },
    ],
    sideLinks: [
      { label: '2026/2027 admission announcement (in Azerbaijani)', url: '/elanlar/elan-2026' },
      PORTAL,
      { label: 'English-taught programmes', url: '/sehife/ingilis-dilinde-tedris' },
      { label: 'Residence hall', url: '/sehife/yataqxana' },
      { label: 'International Relations Group', url: '/sehife/beynelxalq-elaqeler-qrupu' },
    ],
    contact: '**Address:** 18 Zarifa Aliyeva Street, Baku\n\n**Phone:** +994 12 493 36 44\n\n**E-mail:** akademiya@asco.az',
  },
  ru: {
    title: 'Приём иностранных граждан',
    seoDescription:
      'Приём иностранных граждан в ADDA: специальности и язык обучения, стоимость обучения в 2026/2027 году, порядок подачи, документы, миграционная регистрация.',
    lead:
      'Иностранцы и лица без гражданства принимаются в бакалавриат и магистратуру по результатам собеседования. ' +
      'В 2026/2027 учебном году стоимость обучения — 5100 манатов в год; форменная одежда, учебные материалы и место в общежитии предоставляются бесплатно.',
    facts: [
      { label: 'Стоимость обучения (2026/2027)', value: '5100 AZN в год', icon: 'haqq' },
      { label: 'Бакалавриат', value: '4 года', icon: 'muddet' },
      { label: 'Магистратура', value: '2 года', icon: 'muddet' },
      { label: 'Язык обучения', value: 'азербайджанский, английский, русский', icon: 'dil' },
      { label: 'Начало занятий', value: '15 сентября', icon: 'tarix' },
    ],
    steps: [
      {
        title: 'Предварительная заявка',
        period: 'После объявления о приёме',
        who: 'Электронная почта',
        body:
          'Отправьте в Академию копии паспорта и документа о среднем образовании (для магистратуры — диплома бакалавра). Электронная регистрация проводится на portal.edu.az.',
        linkLabel: 'akademiya@asco.az',
        linkUrl: 'mailto:akademiya@asco.az',
      },
      {
        title: 'Собеседование',
        period: 'После рассмотрения документов',
        who: 'ADDA',
        body:
          'Комиссия Академии проверяет уровень подготовки и владение языком обучения. Если вы соответствуете требованиям, приём оформляется.',
      },
      {
        title: 'Оригиналы документов',
        period: 'После приезда',
        who: 'ADDA',
        body: 'Вы представляете оригиналы документов. Все документы должны быть переведены и нотариально заверены.',
        linkLabel: 'Список документов',
        linkUrl: '#dokumenty',
      },
      {
        title: 'Миграционная регистрация',
        period: 'В начале обучения',
        who: 'Государственная миграционная служба',
        body:
          'Иностранные студенты очной формы обучения регистрируются и получают право временного проживания сроком на один год. Медицинская справка для Миграционной службы выдаётся в International Medical Center (Баку).',
      },
      {
        title: 'Начало занятий',
        period: '15 сентября',
        who: 'ADDA',
        body: 'При необходимости можно сначала пройти платные подготовительные курсы азербайджанского или английского языка.',
      },
    ],
    body: [
      '## Основания для приёма',
      '',
      'Приём иностранцев и лиц без гражданства осуществляется на основании:',
      '',
      '- межправительственных и межведомственных соглашений Азербайджанской Республики с зарубежными странами о сотрудничестве в области образования, науки и культуры;',
      '- прямых договоров между образовательными учреждениями;',
      '- стипендий, учреждённых неправительственными и благотворительными организациями;',
      '- договоров Академии с зарубежными организациями, компаниями, ассоциациями и гражданами.',
      '',
      '## Специальности и язык обучения (2026/2027)',
      '',
      '| Уровень | Специальность | Язык обучения |',
      '|---|---|---|',
      '| Бакалавриат (4 года) | Инженерия морской навигации | азербайджанский, английский, русский |',
      '| Бакалавриат (4 года) | Инженерия эксплуатации судовых энергетических установок | азербайджанский, английский |',
      '| Бакалавриат (4 года) | Инженерия судостроения и судоремонта | азербайджанский |',
      '| Бакалавриат (4 года) | Электротехника и электроника | азербайджанский |',
      '| Магистратура (2 года) | Судоходство и управление движением судов | азербайджанский |',
      '| Магистратура (2 года) | Инженерия морской техники и технологий | азербайджанский |',
      '| Магистратура (2 года) | Инженерия эксплуатации морской техники и оборудования | азербайджанский |',
      '| Магистратура (2 года) | Электротехника и электроника | азербайджанский |',
      '',
      'Обучение очное. Выпускники Академии и других вузов могут получить [второе высшее образование](/sehife/tekrar-ali-tehsil) по одной из морских специальностей.',
      '',
      '## Стоимость обучения и обеспечение',
      '',
      '- Стоимость обучения — **5100 манатов в год** (объявление о приёме на 2026/2027 учебный год).',
      '- Форменная одежда, учебные материалы и место в [общежитии](/sehife/yataqxana) — бесплатно.',
      '- Помимо диплома студенты получают рабочий диплом и международные сертификаты.',
      '- Дипломы Академии признаются более чем в 170 странах. Академия — член Международной ассоциации морских университетов и Ассоциации государственных университетов прикаспийских стран.',
      '',
      '## Документы',
      '',
      '**Первый этап (копии, по электронной почте):**',
      '',
      '- паспорт;',
      '- аттестат или диплом о среднем образовании;',
      '- диплом бакалавра (только для магистратуры).',
      '',
      '**Второй этап (оригиналы):**',
      '',
      '1. Заявление на имя ректора.',
      '2. Документ о среднем образовании с приложением.',
      '3. Паспорт и копии страниц с визами.',
      '4. 8 цветных фотографий 3×4 на красном фоне.',
      '5. Медицинская справка: для Академии — из медицинского учреждения вашей страны; для Миграционной службы — из International Medical Center (Баку).',
      '6. Диплом бакалавра с приложением (только для магистратуры).',
      '',
      'Все документы должны быть переведены и нотариально заверены.',
      '',
      '## Подготовительные курсы',
      '',
      'Для тех, кто недостаточно владеет языком обучения, в Академии организованы платные подготовительные курсы азербайджанского и английского языков.',
    ].join('\n'),
    faq: [
      {
        question: 'Что входит в стоимость обучения?',
        answer: 'В 2026/2027 году обучение стоит 5100 манатов в год. Форменная одежда, учебные материалы и общежитие предоставляются без дополнительной оплаты.',
      },
      {
        question: 'На каком языке можно учиться?',
        answer:
          'В бакалавриате инженерия морской навигации преподаётся на азербайджанском, английском и русском языках, инженерия эксплуатации судовых энергетических установок — на азербайджанском и английском. Магистратура — на азербайджанском языке.',
      },
      {
        question: 'Я не владею языком обучения. Что делать?',
        answer: 'В Академии работают платные подготовительные курсы азербайджанского и английского языков.',
      },
      {
        question: 'Как получить разрешение на проживание?',
        answer: 'Иностранный студент очной формы регистрируется в Государственной миграционной службе и получает право временного проживания сроком на один год.',
      },
      {
        question: 'Признаётся ли диплом?',
        answer: 'Дипломы Академии признаются более чем в 170 странах.',
      },
    ],
    sideLinks: [
      { label: 'Объявление о приёме 2026/2027 (на азербайджанском)', url: '/elanlar/elan-2026' },
      PORTAL,
      { label: 'Обучение на английском языке', url: '/sehife/ingilis-dilinde-tedris' },
      { label: 'Общежитие', url: '/sehife/yataqxana' },
      { label: 'Группа международных связей', url: '/sehife/beynelxalq-elaqeler-qrupu' },
    ],
    contact: '**Адрес:** Баку, ул. Зарифы Алиевой, 18\n\n**Телефон:** +994 12 493 36 44\n\n**E-mail:** akademiya@asco.az',
  },
};

// ── 10. İngilis dilində tədris (az/en/ru) ────────────────────────────────────
const INGILIS: QebulPageSeed = {
  slug: 'ingilis-dilinde-tedris',
  dataBlock: 'ingilis',
  az: {
    title: 'İngilis dilində tədris',
    seoDescription:
      'ADDA-da ingilis dilində tədris: bakalavr proqramları, ingilisdilli yerlər, təhsil haqqı, Azərbaycan və əcnəbi vətəndaşlar üçün qəbul yolu.',
    lead:
      'Dəniz naviqasiyası mühəndisliyi və Gəmi energetik qurğularının istismarı mühəndisliyi bakalavr proqramlarında ingilisdilli qruplar var. ' +
      'Azərbaycan vətəndaşları bu qruplara DİM vasitəsilə, əcnəbilər müsahibə ilə qəbul olunur.',
    facts: [
      { label: 'Pillə', value: 'Bakalavriat', icon: 'diplom' },
      { label: 'Təhsil müddəti', value: '4 il', icon: 'muddet' },
      { label: 'Təhsil forması', value: 'Əyani', icon: 'forma' },
      { label: 'Qəbul', value: 'DİM; əcnəbilər — müsahibə', icon: 'imtahan' },
    ],
    steps: [
      {
        track: 'Azərbaycan vətəndaşları',
        title: 'DİM-də elektron ərizə',
        period: 'Fevral–mart',
        who: 'DİM',
        body: 'Bakalavriata qəbul kimi: şəxsi kabinet və «Abituriyentin elektron ərizəsi».',
        linkLabel: 'Bakalavriata qəbul',
        linkUrl: '/sehife/bakalavriat',
      },
      {
        track: 'Azərbaycan vətəndaşları',
        title: 'Buraxılış və I qrup imtahanları',
        period: 'Mart–iyul',
        who: 'DİM',
        body: 'I mərhələdə xarici dil də yoxlanılır (100 bal). Dənizçi ixtisasları üçün xüsusi tibbi müayinə tələb olunur.',
      },
      {
        track: 'Azərbaycan vətəndaşları',
        title: 'İxtisas seçimi',
        period: 'Avqust',
        who: 'DİM',
        body: 'Elektron ixtisas seçimində ixtisasın ingilis dilində tədris olunan variantını seçin.',
      },
      {
        track: 'Əcnəbi vətəndaşlar',
        title: 'İlkin müraciət',
        period: 'Qəbul elanından sonra',
        who: 'E-poçt',
        body: 'Pasportun və orta təhsil sənədinin surətini Akademiyaya göndərin.',
        linkLabel: 'Əcnəbi vətəndaşların qəbulu',
        linkUrl: '/sehife/ecnebi-telebelerin-qebulu-qaydalari',
      },
      {
        track: 'Əcnəbi vətəndaşlar',
        title: 'Müsahibə',
        period: 'Sənədlərə baxılandan sonra',
        who: 'ADDA',
        body: 'Hazırlığınız və ingilis dilini bilmə dərəcəniz müsahibədə yoxlanılır.',
      },
      {
        track: 'Əcnəbi vətəndaşlar',
        title: 'Sənədlər və miqrasiya qeydiyyatı',
        period: 'Gəlişdən sonra',
        who: 'ADDA, Miqrasiya Xidməti',
        body: 'Sənədlərin əslini təqdim edirsiniz, bir illik müvəqqəti yaşamaq hüququ alırsınız.',
      },
    ],
    body: [
      '## Niyə ingilis dilində',
      '',
      'Beynəlxalq gəmiçilikdə ünsiyyət dili ingilis dilidir: heyət daxilində, liman və sahil xidmətləri ilə əlaqədə, sənəd və təlimatlarda. ' +
        'İngilisdilli qrupda oxuyan tələbə peşə terminologiyasını əvvəldən ingilis dilində öyrənir.',
      '',
      '## Kimlər müraciət edə bilər',
      '',
      '- **Azərbaycan vətəndaşları** — DİM-in imtahanı ilə, I ixtisas qrupu üzrə, bakalavriata qəbul qaydası ilə.',
      '- **Əcnəbi vətəndaşlar** — müsahibə ilə; 2026/2027-ci ildə illik təhsil haqqı 5100 manatdır.',
      '',
      '## Dil hazırlığı',
      '',
      'Əcnəbi tələbələr üçün Akademiyada Azərbaycan və ingilis dili üzrə ödənişli hazırlıq kursları var.',
      '',
      '## Magistratura',
      '',
      'Magistratura proqramları Azərbaycan dilində, bəzi ixtisaslarda həm də rus dilində tədris olunur: [Magistraturaya qəbul](/sehife/magistratura).',
    ].join('\n'),
    faq: [
      {
        question: 'İngilisdilli qrupda təhsil haqqı nə qədərdir?',
        answer: 'Azərbaycan vətəndaşları üçün — cədvəldəki ixtisas haqqı. Əcnəbilər üçün 2026/2027-ci ildə 5100 manat.',
      },
      {
        question: 'Bütün dərslər ingilis dilindədirmi?',
        answer: 'İngilisdilli qrupda tədris ingilis dilində aparılır. Ətraflı tədris planı ixtisas səhifəsindədir.',
      },
    ],
    sideLinks: [
      { label: 'Bakalavriata qəbul', url: '/sehife/bakalavriat' },
      { label: 'Əcnəbi vətəndaşların qəbulu', url: '/sehife/ecnebi-telebelerin-qebulu-qaydalari' },
      SCORES,
      { label: 'Kataloq: ingilis dilində', url: '/ixtisaslar?dil=en' },
    ],
    contact: CONTACT_AZ,
  },
  en: {
    title: 'English-taught Programmes',
    seoDescription:
      'English-taught programmes at ADDA: bachelor’s programmes, places taught in English, tuition fees and how Azerbaijani and international applicants are admitted.',
    lead:
      'The bachelor’s programmes in Marine Navigation Engineering and Marine Power Plant Operation Engineering have English-taught groups. ' +
      'Citizens of Azerbaijan are admitted through the State Examination Centre (DİM), international applicants after an interview.',
    facts: [
      { label: 'Level', value: 'Bachelor’s', icon: 'diplom' },
      { label: 'Duration', value: '4 years', icon: 'muddet' },
      { label: 'Mode of study', value: 'Full-time', icon: 'forma' },
      { label: 'Admission', value: 'DİM; international — interview', icon: 'imtahan' },
    ],
    steps: [
      {
        track: 'Citizens of Azerbaijan',
        title: 'Online application at DİM',
        period: 'February–March',
        who: 'DİM',
        body: 'As for bachelor’s admission: personal account and the applicant’s electronic application.',
        linkLabel: 'Bachelor’s admission (in Azerbaijani)',
        linkUrl: '/sehife/bakalavriat',
      },
      {
        track: 'Citizens of Azerbaijan',
        title: 'School-leaving and group I exams',
        period: 'March–July',
        who: 'DİM',
        body: 'The first stage includes a foreign language (100 points). Seafaring programmes require a special medical examination.',
      },
      {
        track: 'Citizens of Azerbaijan',
        title: 'Choice of programmes',
        period: 'August',
        who: 'DİM',
        body: 'In the electronic choice of programmes, select the English-taught option of the programme.',
      },
      {
        track: 'International applicants',
        title: 'Initial application',
        period: 'After the admission announcement',
        who: 'E-mail',
        body: 'Send copies of your passport and school-leaving certificate to the Academy.',
        linkLabel: 'Admission of international students',
        linkUrl: '/sehife/ecnebi-telebelerin-qebulu-qaydalari',
      },
      {
        track: 'International applicants',
        title: 'Interview',
        period: 'After your documents are reviewed',
        who: 'ADDA',
        body: 'Your academic preparation and command of English are checked at the interview.',
      },
      {
        track: 'International applicants',
        title: 'Documents and migration registration',
        period: 'On arrival',
        who: 'ADDA, Migration Service',
        body: 'You submit the original documents and receive a one-year temporary residence permit.',
      },
    ],
    body: [
      '## Why study in English',
      '',
      'English is the working language of international shipping: on board, in contact with port and shore services, in documents and manuals. ' +
        'Students of English-taught groups learn the professional terminology in English from the start.',
      '',
      '## Who can apply',
      '',
      '- **Citizens of Azerbaijan** — through the DİM examination, specialty group I, under the bachelor’s admission rules.',
      '- **International applicants** — after an interview; in 2026/2027 the annual tuition fee is 5,100 AZN.',
      '',
      '## Language preparation',
      '',
      'International students can take paid preparatory courses in Azerbaijani and English at the Academy.',
      '',
      '## Master’s programmes',
      '',
      'Master’s programmes are taught in Azerbaijani, some also in Russian: [Master’s admission](/sehife/magistratura).',
    ].join('\n'),
    faq: [
      {
        question: 'What is the tuition fee in an English-taught group?',
        answer: 'For citizens of Azerbaijan — the programme fee shown in the table. For international students — 5,100 AZN per year in 2026/2027.',
      },
      {
        question: 'Are all classes taught in English?',
        answer: 'In an English-taught group the programme is delivered in English. The detailed curriculum is on the programme page.',
      },
    ],
    sideLinks: [
      { label: 'Admission of international students', url: '/sehife/ecnebi-telebelerin-qebulu-qaydalari' },
      { label: 'Bachelor’s admission (in Azerbaijani)', url: '/sehife/bakalavriat' },
      { label: 'Catalogue: taught in English', url: '/ixtisaslar?dil=en' },
    ],
    contact: '**Address:** 18 Zarifa Aliyeva Street, Baku\n\n**Phone:** +994 12 493 36 44\n\n**E-mail:** akademiya@asco.az',
  },
  ru: {
    title: 'Обучение на английском языке',
    seoDescription:
      'Обучение на английском языке в ADDA: программы бакалавриата, места с английским языком обучения, стоимость, порядок приёма граждан Азербайджана и иностранцев.',
    lead:
      'В программах бакалавриата «Инженерия морской навигации» и «Инженерия эксплуатации судовых энергетических установок» есть группы с английским языком обучения. ' +
      'Граждане Азербайджана поступают через Государственный экзаменационный центр (DİM), иностранцы — по результатам собеседования.',
    facts: [
      { label: 'Уровень', value: 'Бакалавриат', icon: 'diplom' },
      { label: 'Срок обучения', value: '4 года', icon: 'muddet' },
      { label: 'Форма обучения', value: 'Очная', icon: 'forma' },
      { label: 'Приём', value: 'DİM; иностранцы — собеседование', icon: 'imtahan' },
    ],
    steps: [
      {
        track: 'Граждане Азербайджана',
        title: 'Электронное заявление в DİM',
        period: 'Февраль–март',
        who: 'DİM',
        body: 'Как при поступлении в бакалавриат: личный кабинет и электронное заявление абитуриента.',
        linkLabel: 'Приём в бакалавриат (на азербайджанском)',
        linkUrl: '/sehife/bakalavriat',
      },
      {
        track: 'Граждане Азербайджана',
        title: 'Выпускной экзамен и экзамен I группы',
        period: 'Март–июль',
        who: 'DİM',
        body: 'На первом этапе проверяется и иностранный язык (100 баллов). Для морских специальностей нужен специальный медицинский осмотр.',
      },
      {
        track: 'Граждане Азербайджана',
        title: 'Выбор специальностей',
        period: 'Август',
        who: 'DİM',
        body: 'При электронном выборе специальностей выберите вариант с английским языком обучения.',
      },
      {
        track: 'Иностранные граждане',
        title: 'Предварительная заявка',
        period: 'После объявления о приёме',
        who: 'Электронная почта',
        body: 'Отправьте в Академию копии паспорта и документа о среднем образовании.',
        linkLabel: 'Приём иностранных граждан',
        linkUrl: '/sehife/ecnebi-telebelerin-qebulu-qaydalari',
      },
      {
        track: 'Иностранные граждане',
        title: 'Собеседование',
        period: 'После рассмотрения документов',
        who: 'ADDA',
        body: 'На собеседовании проверяются подготовка и владение английским языком.',
      },
      {
        track: 'Иностранные граждане',
        title: 'Документы и миграционная регистрация',
        period: 'После приезда',
        who: 'ADDA, Миграционная служба',
        body: 'Вы представляете оригиналы документов и получаете право временного проживания на один год.',
      },
    ],
    body: [
      '## Почему на английском',
      '',
      'Английский — рабочий язык международного судоходства: в экипаже, при связи с портовыми и береговыми службами, в документах и инструкциях. ' +
        'Студенты англоязычных групп с самого начала изучают профессиональную терминологию на английском.',
      '',
      '## Кто может поступить',
      '',
      '- **Граждане Азербайджана** — через экзамен DİM, по I группе специальностей, по правилам приёма в бакалавриат.',
      '- **Иностранные граждане** — по результатам собеседования; в 2026/2027 году стоимость обучения — 5100 манатов в год.',
      '',
      '## Языковая подготовка',
      '',
      'Для иностранных студентов в Академии работают платные подготовительные курсы азербайджанского и английского языков.',
      '',
      '## Магистратура',
      '',
      'Программы магистратуры преподаются на азербайджанском языке, некоторые — также на русском: [Приём в магистратуру](/sehife/magistratura).',
    ].join('\n'),
    faq: [
      {
        question: 'Сколько стоит обучение в англоязычной группе?',
        answer: 'Для граждан Азербайджана — стоимость программы из таблицы. Для иностранцев в 2026/2027 году — 5100 манатов в год.',
      },
      {
        question: 'Все ли занятия проходят на английском?',
        answer: 'В англоязычной группе обучение ведётся на английском языке. Подробный учебный план — на странице специальности.',
      },
    ],
    sideLinks: [
      { label: 'Приём иностранных граждан', url: '/sehife/ecnebi-telebelerin-qebulu-qaydalari' },
      { label: 'Приём в бакалавриат (на азербайджанском)', url: '/sehife/bakalavriat' },
      { label: 'Каталог: на английском языке', url: '/ixtisaslar?dil=en' },
    ],
    contact: '**Адрес:** Баку, ул. Зарифы Алиевой, 18\n\n**Телефон:** +994 12 493 36 44\n\n**E-mail:** akademiya@asco.az',
  },
};

// ── 11. Açıq qapı günləri ────────────────────────────────────────────────────
const ACIQ_QAPI: QebulPageSeed = {
  slug: 'aciq-qapi-gunleri',
  dataBlock: 'aciq_qapi',
  az: {
    title: 'Açıq qapı günləri',
    seoDescription:
      'ADDA-da açıq qapı günləri: növbəti tarix və qeydiyyat, proqram — abituriyentlər və valideynlər üçün Akademiya ilə tanışlıq.',
    lead:
      'Akademiyanı yerində görmək, müəllim və tələbələrlə tanış olmaq istəyən abituriyentlər və valideynlər üçün. ' +
      'Növbəti açıq qapı günü elan olunanda burada görünəcək — qeydiyyatdan keçib yerinizi təsdiqləyə bilərsiniz.',
    facts: [
      { label: 'Kimlər üçün', value: 'Abituriyentlər, valideynlər, məktəblilər', icon: 'yer' },
      { label: 'Məkan', value: 'Əsas tədris binası', icon: 'unvan' },
      { label: 'Qeydiyyat', value: 'Tədbir səhifəsində', icon: 'sened' },
    ],
    stepsTitle: 'Necə qatılmaq olar',
    steps: [
      {
        title: 'Elanı izləyin',
        period: 'Tədbirdən əvvəl',
        who: 'ADDA',
        body: 'Tarix bu səhifədə və «Tədbirlər» bölməsində elan olunur. Xəbər bülleteninə abunə olsanız, elan e-poçtunuza gələcək.',
        linkLabel: 'Tədbirlər',
        linkUrl: '/tedbirler',
      },
      {
        title: 'Qeydiyyatdan keçin',
        period: 'Tədbirə qədər',
        who: 'Sayt',
        body: 'Tədbir səhifəsində «Qeydiyyatdan keç» bölməsində yerinizi təsdiqləyin.',
      },
      {
        title: 'Gəlin',
        period: 'Tədbir günü',
        who: 'ADDA',
        body: 'Əsas tədris binası: ' + ADDRESS + '.',
      },
    ],
    body: [
      '## Açıq qapı günündə nə olur',
      '',
      '- Akademiyanın tədris imkanları və infrastrukturu ilə tanışlıq;',
      '- ixtisaslar barədə ətraflı məlumat;',
      '- tədris laboratoriyaları, simulyator və trenajorlarla tanışlıq;',
      '- rəhbərlik, müəllimlər və tələbələrlə görüş, suallara cavab;',
      '- qəbul qaydaları, beynəlxalq əməkdaşlıq, təcrübə və karyera imkanları barədə məlumat.',
      '',
      '## Kimlər üçündür',
      '',
      'Ali təhsil almağı planlaşdıran abituriyentlər, onların valideynləri və dəniz sahəsinə maraq göstərən hər kəs. Ümumtəhsil məktəblərinin şagirdləri üçün də açıq qapı günləri keçirilir.',
      '',
      '## Gələ bilmirsinizsə',
      '',
      'Laboratoriya və simulyatorlar barədə: [Laboratoriya və trenajorlar](/auditoriyalar). Qəbulla bağlı sualınızı [onlayn göndərin](/sehife/onlayn-muraciet).',
    ].join('\n'),
    faq: [
      {
        question: 'Valideynlər də gələ bilərmi?',
        answer: 'Bəli. Açıq qapı günü abituriyentlər, valideynlər və dəniz sahəsinə maraq göstərən hər kəs üçündür.',
      },
      {
        question: 'Növbəti açıq qapı günü nə vaxtdır?',
        answer: 'Tarix elan olunanda bu səhifənin yuxarısında görünür. Hazırda planlaşdırılmış tədbir yoxdursa, «Tədbirlər» bölməsini izləyin.',
      },
    ],
    sideLinks: [
      { label: 'Tədbirlər', url: '/tedbirler' },
      { label: 'Laboratoriya və trenajorlar', url: '/auditoriyalar' },
      { label: 'Abituriyentlər üçün bələdçi', url: '/bunlar-ucun/abituriyentler' },
      { label: 'Valideynlər', url: '/bunlar-ucun/valideynler' },
    ],
    contact: CONTACT_AZ,
  },
};

// ── 12. Onlayn müraciət ──────────────────────────────────────────────────────
const ONLAYN_MURACIET: QebulPageSeed = {
  slug: 'onlayn-muraciet',
  dataBlock: 'yox',
  az: {
    title: 'Onlayn müraciət',
    seoDescription:
      'Qəbul üçün hara və necə müraciət etməli: DİM, portal.edu.az, my.gov.az və Akademiya — pillələr üzrə. Qəbul barədə sualınızı onlayn göndərin.',
    lead:
      'Ərizəni hansı sistemdə verəcəyiniz pillədən asılıdır: kollec, bakalavriat və magistraturaya — DİM-də, doktorantura və təkrar ali təhsilə — portal.edu.az-da, əcnəbilər — Akademiyaya. ' +
      'Qəbulla bağlı sualınızı isə buradan birbaşa Akademiyaya yaza bilərsiniz.',
    facts: [
      { label: 'Sual', value: 'Onlayn forma: «Qəbul məsələləri»', icon: 'sened' },
      { label: 'Cavab', value: 'E-poçtla', icon: 'diger' },
    ],
    body: [
      '## Hara müraciət etməli',
      '',
      '| Pillə | Harada | Nə vaxt | Ətraflı |',
      '|---|---|---|---|',
      '| Kollec (subbakalavr) | DİM: [elektron ərizə](https://eservices.dim.gov.az/erizebak/erize) | Fevral–mart (11 illik baza); avqust — ixtisas seçimi | [Kollecə qəbul](/sehife/subbakalavr) |',
      '| Bakalavriat | DİM: [elektron ərizə](https://eservices.dim.gov.az/erizebak/erize) | Fevral–mart | [Bakalavriata qəbul](/sehife/bakalavriat) |',
      '| Magistratura | DİM: [elektron ərizə](https://eservices.dim.gov.az/erizemag/erize) | Yanvar; növbəti imtahanlar üçün aprel, may | [Magistraturaya qəbul](/sehife/magistratura) |',
      '| Doktorantura | [portal.edu.az](https://portal.edu.az) | May–iyun | [Doktoranturaya qəbul](/sehife/doktorantura) |',
      '| Təkrar ali təhsil | [portal.edu.az](https://portal.edu.az) | İyun–avqust | [Təkrar ali təhsil](/sehife/tekrar-ali-tehsil) |',
      '| Əcnəbi vətəndaşlar | Akademiya: e-poçt və müsahibə | Qəbul elanından sonra | [Əcnəbi vətəndaşların qəbulu](/sehife/ecnebi-telebelerin-qebulu-qaydalari) |',
      '',
      'DİM-də ərizədən əvvəl [şəxsi kabinet](https://ekabinet.dim.gov.az) yaradılır. Dəqiq tarixlər hər il DİM-in və Akademiyanın qəbul elanında açıqlanır.',
      '',
      '## Qəbul olunduqdan sonra',
      '',
      'Kollecə, bakalavriata və magistraturaya qəbul olunanlar Elm və Təhsil Nazirliyinin qeydiyyat xidmətində ([my.gov.az](https://my.gov.az)) qeydiyyatdan keçir, sonra sənədlərini Akademiyaya təqdim edir. ' +
        'Qeydiyyatdan keçməyən abituriyent qəbul olunmamış sayılır. Sənədlərin siyahısı: [Bakalavriata qəbul](/sehife/bakalavriat#qebul-olunanlar-ucun-senedler), [Magistraturaya qəbul](/sehife/magistratura#qebul-olunanlar-ucun-senedler).',
      '',
      '## Akademiyaya sual',
      '',
      'Qəbul qaydaları, sənədlər, ixtisas seçimi və ya yataqxana barədə sualınızı «Vətəndaşların müraciəti» formasında göndərin — forma «Qəbul məsələləri» istiqaməti seçilmiş açılır. ' +
        'E-poçtunuzu bir dəfəlik linklə təsdiqləyirsiniz, cavab e-poçtunuza göndərilir.',
      '',
      '**[Sual göndər →](/vetendaslarin-muracieti?istiqamet=qebul)**',
    ].join('\n'),
    faq: [
      {
        question: 'Ərizəmi Akademiyaya e-poçtla göndərə bilərəmmi?',
        answer:
          'Kollec, bakalavriat və magistratura üçün — xeyr: ərizə yalnız DİM-in saytında verilir. Doktorantura və təkrar ali təhsil üçün — portal.edu.az-da. Əcnəbi vətəndaşlar ilkin sənədləri Akademiyaya e-poçtla göndərir.',
      },
      {
        question: 'Sualı kimə yazım: DİM-ə, yoxsa Akademiyaya?',
        answer:
          'İmtahan, ərizə və ixtisas seçimi qaydaları barədə — DİM-ə. Akademiyanın ixtisasları, tibbi müayinə, sənəd qəbulu və yataqxana barədə — Akademiyaya, bu səhifədəki forma ilə.',
      },
    ],
    sideLinks: [
      { label: 'Sual göndər', url: '/vetendaslarin-muracieti?istiqamet=qebul' },
      DIM_CABINET,
      PORTAL,
      MYGOV,
      { label: 'Açıq qapı günləri', url: '/sehife/aciq-qapi-gunleri' },
    ],
    contact: CONTACT_AZ,
  },
};

/** Miqrasiyanın yazdığı bütün səhifələr — sıra menyu ilə eynidir. */
export const QEBUL_PAGES: QebulPageSeed[] = [
  SUBBAKALAVR,
  BAKALAVRIAT,
  MAGISTRATURA,
  DOKTORANTURA,
  TEKRAR_ALI,
  KECID_BALLARI,
  MEZUNLAR,
  YATAQXANA,
  ECNEBI,
  INGILIS,
  ACIQ_QAPI,
  ONLAYN_MURACIET,
];

/** Seed-in PAGES_RESEED bloku bu səhifələrin üstündən yazmasın (bax src/index.ts). */
export const QEBUL_PAGE_SLUGS: string[] = QEBUL_PAGES.map((p) => p.slug);
