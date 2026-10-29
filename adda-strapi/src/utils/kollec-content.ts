/**
 * F5.60 — Azərbaycan Dənizçilik Kolleci: məzmun (Zaur müəllim, 29.10.2026: «bu məlumatları
 * nəzərə alaraq kolleclə bağlı məlumatları yenilə və çatışmayan səhifələri formalaşdır»).
 *
 * Mənbələr (kollecin göndərdiyi 12 fayl, 29.10.2026):
 *   - «1-ADK məlumat» — tarix, təhsil və ixtisaslar, dörd ixtisasın təsviri;
 *   - «8. Təcrübə» — II kursda 20 həftə, «General Əsədov», «ZIĞ», ASCO-nun üzən gəmiləri
 *     (tələbələrin adı saytda YAZILMIR, yalnız gəmilər);
 *   - «Auditoriya» — 14 auditoriya, 1 imtahan otağı (laboratoriya və trenajor otağı yoxdur:
 *     ADK mətnindəki «trenajorlarda» sözü səhifəyə yazılmayıb, logda və sənəddə qeyd);
 *   - «10. Müəllim və inzibati ştat» — vəzifələr və adlar (maaşlar YAZILMIR; xidmət heyəti —
 *     yığışdıran, bağban, qazanxana operatoru, elektromontyor — saytda yoxdur);
 *   - «12-14 Qəbul plan» — 2026/2027: 2 il, 1200 AZN/il, ən yüksək və minimal bal;
 *   - «Sayta düzəliş» — /sehife/subbakalavr mətninə düzəlişlər;
 *   - «Əlaqə məlumatları» — ünvan, iki telefon, e-poçt;
 *   - Təhsil Nazirliyinin 2021-ci il təhsil proqramları (040515, 040520, 040521, 040522) —
 *     120 AKTS, STCW bölmələri, təcrübənin qiymətləndirilməsi, bakalavriata davam;
 *   - nizamname.pdf — kollec-nizamname-content.ts.
 *
 * Səhifələr layout=kollec (qırıntı — kollecin bölmə səhifəsi), yalnız az dilində (mənbələr
 * az dilindədir; ru/en sayt az mətni xəbərdarlıqla göstərir).
 */
import type { FaqSeed, LinkSeed, QebulPageSeed } from './qebul-pages-content';
import { KOLLEC_CHARTER_BODY } from './kollec-nizamname-content';

export const KOLLEC_UNIT_SLUG = 'azerbaycan-denizcilik-kolleci-phs';
export const KOLLEC_UNIT_NAME = 'Azərbaycan Dənizçilik Kolleci PHŞ';
export const KOLLEC_LAYOUT = 'kollec';

export const KOLLEC_ADDRESS = 'Bakı şəhəri, Xətai rayonu, Əhmədli qəsəbəsi, Cavanşir küçəsi 3, keçid 823';
export const KOLLEC_PHONES = '(012) 371 95 84, (012) 371 34 30';
export const KOLLEC_EMAIL = 'kollec@asco.az';
export const KOLLEC_CONTACT = `**Ünvan:** ${KOLLEC_ADDRESS}\n\n**Telefon:** ${KOLLEC_PHONES}\n\n**E-poçt:** ${KOLLEC_EMAIL}`;

/** Nizamnamənin PDF-i (admində yüklənmiş sənəd) — miqrasiyada faylın ünvanı ilə əvəz olunur. */
export const CHARTER_PDF_TOKEN = '{{KOLLEC_NIZAMNAME_PDF}}';
/** Sənəd: admində yaradılıb (27.10.2026), bölməyə bağlıdır. */
export const CHARTER_DOC_TITLE = 'Azərbaycan Dənizçilik Kollecinin nizamnaməsi';

export const URL = {
  unit: `/struktur/${KOLLEC_UNIT_SLUG}`,
  tarix: '/sehife/kollecin-tarixi',
  tehsil: '/sehife/kollecde-tehsil',
  tecrube: '/sehife/kollecde-tecrube',
  nizamname: '/sehife/kollecin-nizamnamesi',
  qebul: '/sehife/subbakalavr',
  ixtisaslar: '/ixtisaslar?tab=subbakalavr',
} as const;

const L: Record<string, LinkSeed> = {
  unit: { label: 'Azərbaycan Dənizçilik Kolleci', url: URL.unit },
  tarix: { label: 'Kollecin tarixi', url: URL.tarix },
  tehsil: { label: 'Təhsil və ixtisaslar', url: URL.tehsil },
  tecrube: { label: 'İstehsalat təcrübəsi', url: URL.tecrube },
  nizamname: { label: 'Kollecin Nizamnaməsi', url: URL.nizamname },
  qebul: { label: 'Kollecə qəbul (subbakalavr)', url: URL.qebul },
  ixtisaslar: { label: 'İxtisaslar, plan yerləri və təhsil haqqı', url: URL.ixtisaslar },
};

export const PROGRAM_SLUG = {
  gs: 'gemi-suruculuyu-kollec',
  geqi: 'gemi-energetik-qurgularinin-istismari-kollec',
  et: 'elektrik-techizati-su-neqliyyatinda-kollec',
  gt: 'gemilerin-temiri-kollec',
} as const;

// ── 1. Kollecin tarixi ───────────────────────────────────────────────────────
const TARIX: QebulPageSeed = {
  slug: 'kollecin-tarixi',
  dataBlock: 'yox',
  layout: KOLLEC_LAYOUT,
  az: {
    title: 'Kollecin tarixi',
    seoDescription:
      'Azərbaycan Dənizçilik Kollecinin tarixi: 1930-cu ildə Zaqafqaziya Balıq Sənayesi Texnikumu, adlar və tabeçilik, 2016-cı ildən ASCO və Akademiyanın nəzdində.',
    lead:
      'Kollec 1930-cu ildə Bakıda Zaqafqaziya Balıq Sənayesi Texnikumu kimi yaradılıb. 2016-cı ildən «Azərbaycan Xəzər Dəniz Gəmiçiliyi» ' +
      'QSC-nin tabeliyində, Azərbaycan Dövlət Dəniz Akademiyasının nəzdində fəaliyyət göstərir, 2022-ci ildən publik hüquqi şəxsdir.',
    facts: [
      { label: 'Yaradılıb', value: '1930', icon: 'tarix' },
      { label: 'İlk adı', value: 'Zaqafqaziya Balıq Sənayesi Texnikumu', icon: 'kitab' },
      { label: 'Akademiyanın nəzdində', value: '2016-cı ildən', icon: 'bina' },
      { label: 'Publik hüquqi şəxs', value: '2022-ci ildən', icon: 'qoruma' },
    ],
    body: `Azərbaycan Dənizçilik Kolleci dənizçilik sahəsi üzrə ixtisaslı kadrların hazırlanmasında mühüm rol oynayan, zəngin tarixə malik təhsil ocağıdır.

## Yaranması

Kollec 1930-cu ildə Ümumittifaq Dövlət Balıq Təsərrüfatı Birliyinin 21 may tarixli 88 saylı qərarı ilə Bakı şəhərində yaradılmış və Zaqafqaziya Balıq Sənayesi Texnikumu adlandırılmışdır.

Texnikum ilkin dövrlərdə Zaqafqaziya respublikaları üçün «Balıq ovu» və «Balığın emalı» ixtisasları üzrə mütəxəssis hazırlayırdı. 1939-cu ilə qədər onun tədris binası olmayıb: həmin il texnikum üçün beşmərtəbəli xüsusi tədris binası tikilmişdir. 1946-cı ildən texnikum bütün ölkə üçün balıqçı mütəxəssislər hazırlamağa başlamış, bir sıra ixtisaslar üzrə kadr yetişdirilməsinə xüsusi diqqət verilmişdir.

## İxtisasların genişlənməsi

1950-ci ildən burada «Balıq və dəniz heyvanlarının ovu texnikası», «Balıq məhsullarının texnologiyası», «İxtiologiya və balıqçılıq» ixtisasları yaradıldı.

1960-cı ildən başlayaraq balıq sənayesində böyük sürətli sıçrayışlar oldu. İqtisadiyyatın bu sahədəki uğurları texnikumda mütəxəssis hazırlığı üzrə ixtisasları genişləndirmək zərurətini yaratdı: bu dövrdə «Gəmi güc qurğuları», «Mühasibat uçotu» və «Dəniz gəmi sürücüsü» ixtisasları açıldı.

Hal-hazırda Kollecdə yalnız dənizçilik sahəsi üzrə ixtisaslara qəbul aparılır: [təhsil və ixtisaslar](${URL.tehsil}).

## Mərhələlər

| İl | Hadisə |
|---|---|
| 1930 | Ümumittifaq Dövlət Balıq Təsərrüfatı Birliyinin 21 may tarixli 88 saylı qərarı ilə Bakıda Zaqafqaziya Balıq Sənayesi Texnikumu yaradılıb |
| 1939 | Texnikum üçün beşmərtəbəli tədris binası tikilib |
| 1946 | Texnikum bütün ölkə üçün balıqçı mütəxəssislər hazırlamağa başlayıb |
| 1950 | «Balıq və dəniz heyvanlarının ovu texnikası», «Balıq məhsullarının texnologiyası», «İxtiologiya və balıqçılıq» ixtisasları yaradılıb |
| 1960-cı illər | «Gəmi güc qurğuları», «Mühasibat uçotu» və «Dəniz gəmi sürücüsü» ixtisasları açılıb |
| 2000 | Texnikum Təhsil Nazirliyinin tabeliyinə keçib, Azərbaycan Dəniz Balıq Sənayesi Texnikumu adlandırılıb |
| 2010 | Nazirlər Kabinetinin 16 iyun 2010-cu il tarixli qərarı ilə Azərbaycan Dəniz Balıq Sənayesi Kolleci adlandırılıb |
| 2016 | Nazirlər Kabinetinin 19 may 2016-cı il tarixli 197 saylı qərarı ilə «Azərbaycan Xəzər Dəniz Gəmiçiliyi» QSC-nin tabeliyinə verilib, Azərbaycan Dövlət Dəniz Akademiyasının nəzdində Azərbaycan Dənizçilik Kolleci adlandırılıb |
| 2021 | Dörd ixtisasın tədris planları yenidən işlənib, Dövlət Dəniz və Liman Agentliyi ilə razılaşdırılıb və Akademiya tərəfindən təsdiq olunub (2021/2022-ci tədris ilindən) |
| 2022 | Nazirlər Kabinetinin 21 sentyabr 2022-ci il tarixli 361 nömrəli qərarı ilə Azərbaycan Dövlət Dəniz Akademiyasının nəzdində «Azərbaycan Dənizçilik Kolleci» publik hüquqi şəxsi adlandırılıb |
| 2023 | Kollecin Nizamnaməsi Elm və Təhsil Nazirliyi tərəfindən təsdiq edilib (21 avqust) və dövlət qeydiyyatına alınıb (18 sentyabr): [Nizamnamə](${URL.nizamname}) |

## Tabeçilik

Kollec fəaliyyəti dövründə müxtəlif adlarla ayrı-ayrı dövrlərdə keçmiş SSRİ nazirliklərinin və baş idarələrinin tabeliyində olmuşdur.

| Dövr | Tabe olduğu qurum |
|---|---|
| 1930–1945 | Ümumittifaq Dövlət Balıq Təsərrüfatı Birliyi |
| 1946–1955 | Azərbaycan SSR Balıq Sənayesi Nazirliyi |
| 1956–1959 | Xalq Təsərrüfatı Şurası |
| 1960–1962 | Ali və Orta İxtisas Təhsili Komitəsi |
| 1963–1980 | SSRİ Balıq Təsərrüfatı Nazirliyinin Xəzər hövzəsinin Baş Balıq Sənayesi İdarəsi («Xəzərbalıq») |
| 1980–1991 | SSRİ Balıq Təsərrüfatı Nazirliyinin Xəzər hövzəsinin Ümumittifaq Balıq Sənaye Birliyi («Xəzərbalıq») |
| 1992 – 2000-ci ilin birinci yarısı | «Azərbalıq» Dövlət Konserni |
| 2000-ci ilin ikinci yarısı – 2016 | Azərbaycan Respublikasının Təhsil Nazirliyi |
| 2016-cı ildən | «Azərbaycan Xəzər Dəniz Gəmiçiliyi» QSC (ASCO), Azərbaycan Dövlət Dəniz Akademiyasının nəzdində |

1946–1962-ci illərdə tədris müəssisəsi Azərbaycan Dövlət Balıq Sənayesi Texnikumu adlanırdı.`,
    sideLinks: [L.unit, L.tehsil, L.nizamname, { label: 'Akademiyanın tarixi', url: '/tarix' }],
    contact: KOLLEC_CONTACT,
  },
};

// ── 2. Təhsil və ixtisaslar ──────────────────────────────────────────────────
const TEHSIL_FAQ: FaqSeed[] = [
  {
    question: 'Kollecdə hansı ixtisaslar var?',
    answer:
      'Dörd ixtisas: 040521 Gəmi sürücülüyü, 040520 Gəmi energetik qurğularının istismarı, 040515 Elektrik təchizatı (su nəqliyyatında) ' +
      'və 040522 Gəmilərin təmiri. Təhsil 2 il, əyani formada, Azərbaycan dilində aparılır.',
  },
  {
    question: 'Kollecdən sonra Akademiyada oxumaq olarmı?',
    answer:
      'Bəli. Subbakalavr proqramının məzunları təhsillərini bakalavr səviyyəsində davam etdirə bilər; ixtisas uyğunluğu Elm və Təhsil ' +
      'Nazirliyinin təsdiq etdiyi ixtisas seçimi cədvəli ilə müəyyən olunur. Ətraflı: [Bakalavriata qəbul](/sehife/bakalavriat).',
  },
  {
    question: 'Təhsil haqqı nə qədərdir?',
    answer:
      '2026/2027-ci tədris ilində illik təhsil haqqı 1200 AZN-dir. Tam orta təhsil bazasından plan yerləri həm dövlət hesabına, həm də ' +
      `ödənişli əsaslarladır. Ətraflı: [Kollecə qəbul](${URL.qebul}).`,
  },
];

const TEHSIL: QebulPageSeed = {
  slug: 'kollecde-tehsil',
  dataBlock: 'subbakalavr',
  layout: KOLLEC_LAYOUT,
  az: {
    title: 'Kollecdə təhsil və ixtisaslar',
    seoDescription:
      'Azərbaycan Dənizçilik Kollecində təhsil: subbakalavr pilləsi, STCW tələbləri, dörd dənizçilik ixtisası, 120 AKTS, tədris bazası və məzunlar.',
    lead:
      'Kollecdə təhsil subbakalavr təhsil pilləsi üzrə aparılır, qəbul yalnız dənizçilik ixtisaslarına olur. Təhsil proqramları Beynəlxalq ' +
      'Dəniz Təşkilatının STCW Konvensiyasının tələblərinə uyğun hazırlanıb, hər proqram 2 il və 120 AKTS kreditdir.',
    facts: [
      { label: 'Təhsil pilləsi', value: 'Subbakalavr (orta ixtisas)', icon: 'diplom' },
      { label: 'Müddət', value: '2 il, 120 AKTS', icon: 'muddet' },
      { label: 'İxtisas', value: '4', icon: 'qrup' },
      { label: 'Keyfiyyət', value: 'ISO 9001:2015', icon: 'qoruma' },
    ],
    body: `Hal-hazırda Kollecdə yalnız dənizçilik sahəsi üzrə ixtisaslara qəbul aparılır. Təhsil proqramları və tədris planları Beynəlxalq Dəniz Təşkilatının (IMO) «Dənizçilərin hazırlanmasına, onlara diplom verilməsinə və növbə çəkməyə dair» Beynəlxalq Konvensiyasının (STCW) tələblərinə uyğun olaraq hazırlanmışdır.

## İxtisaslar

| Şifrə | İxtisas | STCW tələbi | Məzunun vəzifəsi |
|---|---|---|---|
| 040521 | [Gəmi sürücülüyü](/ixtisaslar/${PROGRAM_SLUG.gs}) | II/1 qaydası | növbə köməkçisi |
| 040520 | [Gəmi energetik qurğularının istismarı](/ixtisaslar/${PROGRAM_SLUG.geqi}) | A-III/1 qaydası | növbə mexaniki |
| 040515 | [Elektrik təchizatı (su nəqliyyatında)](/ixtisaslar/${PROGRAM_SLUG.et}) | A-III/6 qaydası | elektrik mexaniki |
| 040522 | [Gəmilərin təmiri](/ixtisaslar/${PROGRAM_SLUG.gt}) | konkret qayda göstərilməyib | texnik-usta, qaynaqçı, çilingər |

### 040521 Gəmi sürücülüyü

«Gəmi sürücülüyü» ixtisası üzrə subbakalavr pilləsində mütəxəssis hazırlığı Azərbaycan Respublikasının üzv olduğu Beynəlxalq Dəniz Təşkilatının (BDT-İMO) «Dənizçilərin hazırlanmasına, onlara diplom verilməsinə və növbə çəkməyə dair» 1978-ci il tarixli (DHDNÇ, əlavələr edilmiş) Beynəlxalq Konvensiyanın II/1 qaydasının tələblərinə uyğun olaraq həyata keçirilir.

Tələbələr gəmi sürücülüyünün naviqasiya təminatını, gəminin idarə və manevr edilməsinin əsaslarını, o cümlədən suda olan adamın xilas edilməsi, lövbərə durma və körpüyə yanalma əməliyyatları zamanı manevretmə bacarığını, RADAR-la müşahidə və təsvir-trenajor hazırlığına dair bilikləri öyrənir. Tədris prosesi ixtisaslaşdırılmış auditoriyalarda və tədris gəmisində təşkil olunur.

Məzunlar beynəlxalq səfərlər həyata keçirən gəmilərdə növbə köməkçisi vəzifələrində çalışa bilirlər.

### 040520 Gəmi energetik qurğularının istismarı

Mütəxəssis hazırlığı STCW Konvensiyasının A-III/1 qaydasının tələblərinə uyğun olaraq həyata keçirilir.

Tələbələr gəmi dizellərinin, buxar qazanlarının, köməkçi mexanizmlərin, sistemlərin konstruktiv xüsusiyyətlərini, onların iş prinsiplərini, yanacaq və yağlayıcı materialların fiziki-kimyəvi xassələrini, nasos və boru sistemlərinin istismar qaydalarını və onlara edilən texniki xidməti, eləcə də gəmi energetik qurğularının istismarına aid digər sahələr üzrə bilikləri öyrənir. Tədris prosesi ixtisaslaşdırılmış auditoriyalarda və tədris gəmisində təşkil olunur.

Məzunlar beynəlxalq səfərlər həyata keçirən gəmilərdə növbə mexaniki vəzifələrində çalışa bilirlər.

### 040515 Elektrik təchizatı (su nəqliyyatında)

Mütəxəssis hazırlığı STCW Konvensiyasının A-III/6 qaydasının tələblərinə uyğun olaraq həyata keçirilir.

Tələbələr ixtisasın peşə fənləri ilə yanaşı gəmidə növbəçəkmə və gəmi elektriki hazırlığını, gəmi avtomatlaşdırılmış elektroenergetika sistemlərini, gəmi avtomatlaşdırılmış elektrik intiqalını, gəmi energetik və elektrik qurğularının avtomatik idarə sistemlərini, elektrik avadanlığının diaqnostikasını və gəmi elektrik avadanlığının texniki istismarını öyrənirlər. Tədris prosesi ixtisaslaşdırılmış auditoriyalarda və tədris gəmisində təşkil olunur.

Məzunlar beynəlxalq səfərlər həyata keçirən gəmilərdə elektrik mexaniki vəzifəsində çalışa bilirlər.

### 040522 Gəmilərin təmiri

Tələbələr ümumpeşə hazırlığı fənləri ilə yanaşı gəmilərin quruluşunu, üzmə keyfiyyətlərini, gəmi gövdəsinin konstruksiyalarını, gövdə konstruksiyalarının qaynaq texnologiyasını, gövdənin korroziyadan mühafizə tədbirlərini və gəmi təmiri texnologiyasını öyrənirlər. Tədris prosesi ixtisaslaşdırılmış auditoriyalarda təşkil olunur.

Məzunlar gəmiqayırma və gəmi təmiri zavodlarında, tərsanələrdə və liman müəssisələrində gəmi gövdəsi, mühərrik və mexanizmlərin təmiri üzrə texnik-usta, qaynaqçı və ya çilingər kimi işləyə bilərlər. Onlar həmçinin dəniz nəqliyyatı şirkətlərində gəmilərin texniki vəziyyətinə nəzarət edən texniki heyət üzvü kimi fəaliyyət göstərə bilirlər.

## Tədrisin hüquqi əsası

Kollecdə təhsil subbakalavr təhsil pilləsi üzrə aparılır və «Təhsil haqqında» Azərbaycan Respublikasının Qanununa, Azərbaycan Respublikası Nazirlər Kabinetinin müvafiq qərarları ilə təsdiq edilmiş «Orta ixtisas təhsil pilləsinin dövlət standartı və proqramı»na, «Orta ixtisas təhsili üzrə ixtisasların təsnifatı»na, «Orta ixtisas təhsili müəssisələrində kredit sistemi ilə tədrisin təşkili qaydaları»na uyğun təşkil olunur.

Subbakalavr üzrə təhsil proqramları Azərbaycan Respublikası Nazirlər Kabinetinin 17.04.2020-ci il tarixli 140 nömrəli qərarı ilə təsdiq edilmiş «Orta ixtisas təhsili üzrə ixtisasların Təsnifatı»na uyğun olaraq Təhsil Nazirliyinin 17.08.2021-ci il tarixli F-410 nömrəli qərarı ilə təsdiq edilmişdir. Hər təhsil proqramı 120 AKTS kreditdən (2 il) ibarətdir; proqramın mətni ixtisas səhifəsinin «Sənədlər» siyahısındadır.

2021-ci ildə dörd ixtisas üzrə tədris planları orta ixtisas təhsilinin subbakalavriat proqramlarının bakalavriat səviyyəsinin müvafiq proqramlarına uyğunlaşdırılması məqsədi ilə yenidən işlənib hazırlanmış, Dövlət Dəniz və Liman Agentliyi ilə razılaşdırılmaqla Azərbaycan Dövlət Dəniz Akademiyası tərəfindən təsdiq olunmuşdur. Bu tədris planları 2021/2022-ci tədris ilindən istifadə olunur.

Kollec ISO 9001:2015 Keyfiyyəti İdarəetmə Sistemi sertifikatına malikdir.

## Tədris bazası

Kollecdə 14 auditoriya və 1 imtahan otağı var. İstehsalat təcrübəsi ASCO-nun «General Əsədov» tədris gəmisində və «ZIĞ» Gəmi Təmiri və Tikintisi Zavodunda keçirilir: [istehsalat təcrübəsi](${URL.tecrube}).

## Məzunlar

Kollec məzunları dəniz nəqliyyatı, gəmiçilik şirkətləri, limanlar, texniki xidmət müəssisələri və digər aidiyyəti olan sahələrdə çalışa bilirlər. Əldə etdikləri bilik və bacarıqlar onlara həm ölkə daxilində, həm də beynəlxalq səviyyədə fəaliyyət göstərmək üçün möhkəm baza yaradır.

Subbakalavr proqramının məzunları təhsillərini bakalavr səviyyəsində davam etdirə bilərlər: ixtisas uyğunluğu Elm və Təhsil Nazirliyinin təsdiq etdiyi ixtisas seçimi cədvəlinə əsasən müəyyən olunur. Ətraflı: [Bakalavriata qəbul](/sehife/bakalavriat).`,
    faq: TEHSIL_FAQ,
    sideLinks: [L.unit, L.ixtisaslar, L.tecrube, L.qebul, L.nizamname],
    contact: KOLLEC_CONTACT,
  },
};

// ── 3. İstehsalat təcrübəsi ──────────────────────────────────────────────────
const TECRUBE: QebulPageSeed = {
  slug: 'kollecde-tecrube',
  dataBlock: 'yox',
  layout: KOLLEC_LAYOUT,
  az: {
    title: 'Kollecdə istehsalat təcrübəsi',
    seoDescription:
      'Azərbaycan Dənizçilik Kollecində istehsalat təcrübəsi: II kursda 20 həftə, «General Əsədov» tədris gəmisi, «ZIĞ» zavodu, ASCO-nun üzən gəmiləri.',
    lead:
      'Tədris planlarına uyğun olaraq Kollecin II kurs tələbələri 20 həftəlik istehsalat təcrübəsi keçir. Dənizçi ixtisasları ASCO-nun ' +
      '«General Əsədov» tədris gəmisində, «Gəmilərin təmiri» ixtisası «ZIĞ» Gəmi Təmiri və Tikintisi Zavodunda təcrübə keçir.',
    facts: [
      { label: 'Kurs', value: 'II kurs', icon: 'qrup' },
      { label: 'Müddət', value: '20 həftə', icon: 'muddet' },
      { label: '2026-cı ildə', value: '16 fevral – 7 iyul', icon: 'tarix' },
      { label: 'Tədris gəmisi', value: '«General Əsədov»', icon: 'gemi' },
    ],
    stepsTitle: 'Təcrübə necə keçir',
    steps: [
      {
        title: 'Təcrübə bazası',
        who: 'Kollec, ASCO',
        body:
          '«Gəmi sürücülüyü», «Gəmi energetik qurğularının istismarı» və «Elektrik təchizatı (su nəqliyyatında)» ixtisasları üzrə təcrübə ' +
          '«Azərbaycan Xəzər Dəniz Gəmiçiliyi» QSC-nin Xəzər Dəniz Neft Donanmasına məxsus «General Əsədov» tədris gəmisində, «Gəmilərin təmiri» ' +
          'ixtisası üzrə «ZIĞ» Gəmi Təmiri və Tikintisi Zavodunda keçirilir.',
      },
      {
        title: 'Yüksək nəticə göstərənlər üzən gəmilərdə',
        who: 'ASCO',
        body:
          'Ötən ilin imtahan sessiyasının nəticələrinə görə ÜOMG (ümumi orta müvəffəqiyyət göstəricisi) sıralamasında yüksək yer tutan ' +
          'tələbələrin təcrübəsi ASCO-ya məxsus üzən gəmilərdə təşkil olunur.',
      },
      {
        title: 'Təcrübə jurnalı və hesabat',
        who: 'Kollec, Pedaqoji Şura',
        body:
          'Tapşırıqlar STCW Konvensiyasının tələbləri nəzərə alınmaqla hazırlanmış təcrübə jurnalında qeyd olunur. Jurnal və tələbənin ' +
          'təcrübənin yekunlarına dair hesabatı Kollecin Pedaqoji Şurasının müəyyən etdiyi qaydada qiymətləndirilir.',
      },
    ],
    body: `Təcrübə tələbənin nəzəri biliklərini praktikada tətbiq etməsi və peşə bacarıqlarının gücləndirilməsi üçün vacibdir. Kollecdə istehsalat təcrübəsi tədris planlarına uyğun olaraq II kursda keçirilir və 20 həftə davam edir (2026-cı ildə 16 fevral – 7 iyul).

## Təcrübə bazaları

| İxtisas | Təcrübə yeri |
|---|---|
| 040521 Gəmi sürücülüyü | «General Əsədov» tədris gəmisi (ASCO, Xəzər Dəniz Neft Donanması) |
| 040520 Gəmi energetik qurğularının istismarı | «General Əsədov» tədris gəmisi |
| 040515 Elektrik təchizatı (su nəqliyyatında) | «General Əsədov» tədris gəmisi |
| 040522 Gəmilərin təmiri | «ZIĞ» Gəmi Təmiri və Tikintisi Zavodu |

Tədris gəmisi haqqında ətraflı: [«General Əsədov»](/sehife/tedris-gemisi).

## Üzən gəmilərdə təcrübə

2026-cı ildə ötən ilin imtahan sessiyasının nəticələrinə görə ÜOMG sıralamasında yüksək nəticə göstərmiş 9 tələbənin təcrübəsi Xəzər Dəniz Neft Donanmasının üzən gəmilərində təşkil olunub: «Şirvan-2», «Məcik-1», «Atlet-5», «General Əliağa Şıxlinski», «Atlet-8», «Nefteqaz-62», «Şirvan-3», «Nefteqaz-64» və «Z. Hacıyev».`,
    faq: [
      {
        question: 'Təcrübə nə vaxt keçirilir?',
        answer: 'II kursda, 20 həftə. 2026-cı ildə təcrübə 16 fevraldan 7 iyuladək davam edib.',
      },
      {
        question: 'Təcrübəni başqa müəssisədə keçmək olarmı?',
        answer:
          'Bəli. Təhsil proqramına görə tələbənin fərdi müraciəti əsasında onun ixtisasına uyğun digər müəssisədə, o cümlədən xaricdə ' +
          'təcrübə keçməsinə icazə verilir. Təcrübədən əvvəl Kolleclə həmin müəssisə arasında müqavilə imzalanır.',
      },
      {
        question: 'Təcrübə necə qiymətləndirilir?',
        answer:
          'STCW tələbləri nəzərə alınmaqla hazırlanmış təcrübə jurnalındakı tapşırıqların yerinə yetirilməsi və tələbənin yekun hesabatı ' +
          'əsasında, Kollecin Pedaqoji Şurasının müəyyən etdiyi qaydada.',
      },
    ],
    sideLinks: [{ label: 'Tədris gəmisi «General Əsədov»', url: '/sehife/tedris-gemisi' }, L.tehsil, L.unit, L.qebul],
    contact: KOLLEC_CONTACT,
  },
};

// ── 4. Nizamnamə ─────────────────────────────────────────────────────────────
const NIZAMNAME: QebulPageSeed = {
  slug: 'kollecin-nizamnamesi',
  dataBlock: 'yox',
  layout: KOLLEC_LAYOUT,
  az: {
    title: 'Kollecin Nizamnaməsi',
    seoDescription:
      '«Azərbaycan Dövlət Dəniz Akademiyasının nəzdində Azərbaycan Dənizçilik Kolleci» publik hüquqi şəxsin Nizamnaməsi (2023): vəzifələr, idarəetmə, əmlak, nəzarət.',
    lead:
      'Kollecin Nizamnaməsi Azərbaycan Respublikası Elm və Təhsil Nazirliyinin 2023-cü il 21 avqust tarixli əmri ilə təsdiq edilib və ' +
      '18 sentyabr 2023-cü ildə dövlət qeydiyyatına alınıb. Rəsmi nüsxə PDF faylıdır, mətni aşağıdadır.',
    facts: [
      { label: 'Təsdiq edib', value: 'Elm və Təhsil Nazirliyi, 21.08.2023', icon: 'sened' },
      { label: 'Dövlət qeydiyyatı', value: '18.09.2023', icon: 'tarix' },
      { label: 'Hüquqi status', value: 'Publik hüquqi şəxs', icon: 'qoruma' },
      { label: 'Hüquqi ünvan', value: 'Bakı, Cavanşir küçəsi 3, keçid 823', icon: 'unvan' },
    ],
    body: KOLLEC_CHARTER_BODY,
    sideLinks: [
      { label: 'Nizamnamə (PDF, rəsmi nüsxə)', url: CHARTER_PDF_TOKEN },
      { label: 'Akademiyanın Nizamnaməsi', url: '/sehife/nizamname' },
      L.unit,
      L.tarix,
    ],
    contact: KOLLEC_CONTACT,
  },
};

export const KOLLEC_PAGES: QebulPageSeed[] = [TARIX, TEHSIL, TECRUBE, NIZAMNAME];

// ── 5. Kollecə qəbul (/sehife/subbakalavr): «Sayta düzəliş» faylı ────────────
export const ADMISSION_SLUG = 'subbakalavr';

export interface FieldFix {
  field: 'lead' | 'body' | 'contact';
  find: string;
  replace: string;
  /** Bu mətn artıq varsa düzəliş tətbiq olunub sayılır (əlavə üçün). */
  doneIf?: string;
}

const RESULTS_TITLE = '## 2026/2027-ci tədris ili: qəbulun nəticələri';
const RESULTS = `${RESULTS_TITLE}

| İxtisas | Təhsil müddəti | İllik təhsil haqqı | Ən yüksək bal | Minimal keçid balı |
|---|---|---|---|---|
| 040521 Gəmi sürücülüyü | 2 il | 1200 AZN | 194,2 | 103,3 |
| 040520 Gəmi energetik qurğularının istismarı | 2 il | 1200 AZN | 186,4 | 84,8 |
| 040515 Elektrik təchizatı (su nəqliyyatında) | 2 il | 1200 AZN | 153,2 | 68,3 |
| 040522 Gəmilərin təmiri | 2 il | 1200 AZN | 146,3 | 52 |

Ballar 300 ballıq şkala üzrədir: Azərbaycan (rus) dili, riyaziyyat və xarici dil.`;

export const ADMISSION_FIXES: FieldFix[] = [
  {
    field: 'lead',
    find:
      'Akademiyanın nəzdindəki Azərbaycan Dənizçilik Kolleci dəniz nəqliyyatı üçün subbakalavr (orta ixtisas) kadrları hazırlayır. ' +
      'Qəbul Dövlət İmtahan Mərkəzi (DİM) vasitəsilə, 11 illik ümumi təhsil bazasında aparılır.',
    replace:
      'Akademiyanın nəzdindəki Azərbaycan Dənizçilik Kolleci dəniz nəqliyyatı üçün subbakalavr təhsil pilləsi üzrə (orta ixtisas) mütəxəssis ' +
      'hazırlığı aparır. Qəbul Dövlət İmtahan Mərkəzi xətti ilə tam orta təhsil bazasından (11 illik) aparılır.',
  },
  { field: 'body', find: 'tam orta təhsil (11 illik) bazasında dənizçilik', replace: 'tam orta təhsil (11 illik) bazasından dənizçilik' },
  {
    field: 'body',
    find:
      'Kolleci bitirən subbakalavr dənizdə və ya sahildə işləyə, sonra Akademiyanın bakalavriatına qəbul ola bilər. ' +
      'Subbakalavr diplomu ilə bakalavriata qəbul olunanlar',
    replace:
      'Kolleci bitirən subbakalavrlar dənizdə və ya sahildə işləyə, daha sonra Akademiyanın bakalavr təhsil pilləsinə qəbul ola bilər. ' +
      'Subbakalavr diplomu ilə Akademiyaya qəbul olunanlar',
  },
  { field: 'body', find: '\n\n## Kollecdən sonra\n', replace: `\n\n${RESULTS}\n\n## Kollecdən sonra\n`, doneIf: RESULTS_TITLE },
  {
    field: 'contact',
    find: '**Ünvan:** Bakı, Zərifə Əliyeva küçəsi 18 («Sahil» metrosunun yaxınlığı)\n\n**Telefon:** (012) 493 36 44\n\n**E-poçt:** info@adda.edu.az',
    replace: KOLLEC_CONTACT,
  },
];

/** Trayektoriya addımlarının mətni (addımın başlığı ilə tapılır). */
export const ADMISSION_STEP_FIXES: { title: string; find: string; replace: string }[] = [
  {
    title: 'Buraxılış (qəbul) imtahanı',
    find:
      'Cari ilin məzunları imtahan vermir: 11-ci sinfin buraxılış imtahanının nəticəsi götürülür. Əvvəlki illərin məzunları imtahanı aprel ' +
      'ayında verir. Nəticə 2 il qüvvədədir.',
    replace:
      'Cari ilin məzunları kollecə qəbul üçün əlavə imtahan vermir. 11-ci sinfin buraxılış imtahanının nəticəsi əsas götürülür. Nəticə 2 il ' +
      'qüvvədədir. Əvvəlki illərin məzunları isə imtahanı DİM tərəfindən təyin olunmuş tarixdə verir.',
  },
  {
    title: 'İxtisas seçimi',
    find:
      'Seçimə ümumi balı 50-dən, Azərbaycan (rus) dili və riyaziyyat üzrə hər biri 10-dan az olmayan abituriyentlər buraxılır. Akademiyanın ' +
      'kollecində 11 illik baza üzrə yerlər ödənişlidir.',
    replace:
      'İxtisas seçiminə ümumi balı 50-dən, Azərbaycan (rus) dili və riyaziyyat üzrə hər biri 10-dan az olmayan abituriyentlər buraxılır. ' +
      'Tam orta təhsil bazasından plan yerləri həm dövlət hesabına, həm də ödənişli əsaslarladır.',
  },
  {
    title: 'Yerləşdirmə və qeydiyyat',
    find:
      'Yerləşdirilən abituriyent 10 iş günü ərzində kollec üzrə elektron qeydiyyatdan keçməlidir. Keçməyən abituriyent yerdən imtina etmiş sayılır.',
    replace:
      'Kollecə qəbul olan abituriyent 10 iş günü ərzində kollec üzrə elektron qeydiyyatdan keçməlidir. Qeydiyyatdan keçməyən abituriyent ' +
      'təhsil almaqdan imtina etmiş sayılır.',
  },
];

/** Yan keçidlər: kollecin yeni səhifələri (keçid artıq yoxdursa, sona). */
export const ADMISSION_SIDE_LINKS: LinkSeed[] = [L.unit, L.tehsil];

// ── 6. Bölmə (/struktur/azerbaycan-denizcilik-kolleci-phs) ──────────────────
/** «Yaradılıb» qeydi: 2016 — Akademiyanın nəzdinə keçid ili, kollec 1930-cu ildə yaradılıb. */
export const UNIT_ESTABLISHED = { from: '2016-cı ildə yaradılıb', to: '1930-cu ildə yaradılıb' };
/** Əsas şəklin alt mətni (boşdursa). */
export const UNIT_IMAGE_ALT = 'Azərbaycan Dənizçilik Kolleci';
/** «Faydalı linklər» — boşdursa. */
export const UNIT_LINKS: LinkSeed[] = [L.tarix, L.tehsil, L.tecrube, L.nizamname, { label: 'Kollecə qəbul', url: URL.qebul }];
/** Rəhbər (boşdursa): direktor vəzifəsini müvəqqəti icra edən (ştat cədvəlində direktor yeri boşdur). */
export const UNIT_HEAD_SLUG = 'eliyeva-arzu';
/**
 * Əlaqə — yalnız BOŞ sahə, hər dilin sətri: ru/en-də telefon boş idi (saytda Akademiyanın ümumi
 * nömrəsi görünürdü). Telefon və e-poçt az sətrindən (orada da boşdursa kollecin faylından);
 * «Korpus» sahəsinə ünvan (saytda etiket «Ünvan» olur) — ru/en üçün tərcümə.
 */
export const UNIT_BUILDING: Record<string, string> = {
  az: KOLLEC_ADDRESS,
  ru: 'г. Баку, Хатаинский район, пос. Ахмедлы, ул. Джаваншира, 3, проезд 823',
  en: '3 Javanshir Street, passage 823, Ahmadli settlement, Khatai district, Baku',
};

// ── 7. İxtisaslar ────────────────────────────────────────────────────────────
/** Subbakalavr qəbul balı 300-dən çox ola bilməz (Azərbaycan (rus) dili, riyaziyyat, xarici dil — hər biri 100). */
export const SUBBACHELOR_SCORE_MAX = 300;
export const PROGRAM_CREDITS = 120;

export const PROGRAM_CONVENTIONS: Record<string, string> = {
  [PROGRAM_SLUG.gs]:
    'Təhsil proqramı Beynəlxalq Dəniz Təşkilatının (IMO) «Dənizçilərin hazırlanmasına, onlara diplom verilməsinə və növbə çəkməyə dair» ' +
    '1978-ci il Beynəlxalq Konvensiyasının (**STCW**, A-II/1 və A-II/2 bölmələri) tələblərinə uyğun hazırlanıb.\n\n' +
    'Nəzərə alınan digər sənədlər:\n\n' +
    '- **MARPOL 73/78**: dənizin gəmilərdən çirkləndirilməsinin qarşısının alınması\n' +
    '- **SOLAS-74**: dənizdə insan həyatının təhlükəsizliyi\n' +
    '- «Dəniz nəqliyyatı gəmilərində xidmət Nizamnaməsi»\n' +
    '- IMO-nun 7.01 və 7.03 model kursları\n\n' +
    'Mütəxəssis hazırlığı STCW-nin II/1 qaydasına uyğundur: məzun beynəlxalq səfərlər edən gəmilərdə növbə köməkçisi vəzifəsində çalışa bilir.',
  [PROGRAM_SLUG.geqi]:
    'Təhsil proqramı Beynəlxalq Dəniz Təşkilatının (IMO) «Dənizçilərin hazırlanmasına, onlara diplom verilməsinə və növbə çəkməyə dair» ' +
    '1978-ci il Beynəlxalq Konvensiyasının (**STCW**, A-III/1 və A-III/2 bölmələri) tələblərinə uyğun hazırlanıb.\n\n' +
    'Nəzərə alınan digər sənədlər:\n\n' +
    '- **MARPOL 73/78**: dənizin gəmilərdən çirkləndirilməsinin qarşısının alınması\n' +
    '- **SOLAS-74**: dənizdə insan həyatının təhlükəsizliyi\n' +
    '- «Dəniz nəqliyyatı gəmilərində xidmət Nizamnaməsi»\n' +
    '- IMO-nun 7.02 və 7.04 model kursları\n\n' +
    'Mütəxəssis hazırlığı STCW-nin A-III/1 qaydasına uyğundur: məzun beynəlxalq səfərlər edən gəmilərdə növbə mexaniki vəzifəsində çalışa bilir.',
  [PROGRAM_SLUG.et]:
    'Mütəxəssis hazırlığı Beynəlxalq Dəniz Təşkilatının (IMO) «Dənizçilərin hazırlanmasına, onlara diplom verilməsinə və növbə çəkməyə dair» ' +
    '1978-ci il Beynəlxalq Konvensiyasının (**STCW**) A-III/6 qaydasının tələblərinə uyğun aparılır: məzun beynəlxalq səfərlər edən ' +
    'gəmilərdə elektrik mexaniki vəzifəsində çalışa bilir.\n\n' +
    'Təhsil Nazirliyinin 040515 «Elektrik təchizatı (sahələr üzrə)» təhsil proqramı ümumi ixtisas proqramıdır; su nəqliyyatı üzrə hazırlıq ' +
    'Kollecin tədris planındadır.',
  [PROGRAM_SLUG.gt]:
    'Təhsil proqramı Beynəlxalq Dəniz Təşkilatının (IMO) «Dənizçilərin hazırlanmasına, onlara diplom verilməsinə və növbə çəkməyə dair» ' +
    '1978-ci il Beynəlxalq Konvensiyasının (**STCW**) tələblərinə uyğun hazırlanıb.\n\n' +
    'Proqramda bu ixtisas üçün STCW-nin konkret bölməsi göstərilməyib: hazırlıq dənizçi diplomuna deyil, gəmi təmiri texnikinin işinə yönəlib.',
};

/** Səhv cavab: sual bakalavriata keçid haqqındadır, cavab kollecə qəbul haqqında idi. */
export const PROGRAM_FAQ_FIX = {
  question: 'Kollecdən sonra bakalavriata keçmək olarmı?',
  from: 'Bəli. Qəbul Dövlət İmtahan Mərkəzi xətti ilə tam orta təhsil bazasından (11 illik) aparılır.',
  to:
    'Bəli. Subbakalavr proqramının məzunları təhsillərini Akademiyanın bakalavr təhsil pilləsində davam etdirə bilər. İxtisas uyğunluğu ' +
    'Elm və Təhsil Nazirliyinin təsdiq etdiyi ixtisas seçimi cədvəli ilə müəyyən olunur. Qəbul olunanlar qeydiyyatda diplom və əlavəsini, ' +
    'iş yerindən arayışı və dənizçinin tibbi kitabçasının surətini təqdim edir.',
};

// ── 8. Sənədlər ──────────────────────────────────────────────────────────────
export interface DocFix {
  /** Admində yazılmış ad (dəqiq). */
  title: string;
  newTitle?: string;
  description: string;
  year: number;
  /** «diger» → bu kateqoriya. */
  category: 'normativ';
  /** Sənədin «Səhifə» sahəsi (boşdursa). */
  url?: string;
  /** Bölməyə bağla (bağlı deyilsə). */
  linkUnit?: boolean;
}

export const KOLLEC_DOCS: DocFix[] = [
  {
    title: CHARTER_DOC_TITLE,
    description: 'Elm və Təhsil Nazirliyinin 21.08.2023 tarixli əmri ilə təsdiq edilib, 18.09.2023-də dövlət qeydiyyatına alınıb.',
    year: 2023,
    category: 'normativ',
    url: URL.nizamname,
  },
  ...(
    [
      ['040515', 'Elektrik təchizatı (sahələr üzrə)'],
      ['040520', 'Gəmi energetik qurğularının istismarı'],
      ['040521', 'Gəmi sürücülüyü'],
      ['040522', 'Gəmilərin təmiri'],
    ] as const
  ).map(
    ([code, name]): DocFix => ({
      title: `${code} - Proqram`,
      newTitle: `Təhsil proqramı: ${code} ${name}`,
      description:
        'Orta ixtisas təhsilinin subbakalavriat səviyyəsi üzrə ixtisasın təhsil proqramı (Təhsil Nazirliyi, 2021): məzunun kompetensiyaları, ' +
        '120 AKTS kreditin bölgüsü, təcrübə və məşğulluq.',
      year: 2021,
      category: 'normativ',
      linkUnit: true,
    }),
  ),
];

// ── 9. Əməkdaşlar (ştat cədvəli) ─────────────────────────────────────────────
export type StaffType = 'akademik' | 'telimci_texniki' | 'inzibati' | 'rehberlik' | 'diger';

export interface KollecStaffSeed {
  /** Ştat cədvəlindəki tam ad. */
  fullName: string;
  /** Saytdakı mövcud qeyd (ünvan dəyişmir). Yoxdursa yeni qeyd yaradılır. */
  slug?: string;
  /** Saytdakı ad ştatdakından fərqli yazılıb — ad dəyişmir (logda). */
  keepName?: boolean;
  /** Əsas vəzifə. */
  position: string;
  staffType: StaffType;
  /** Mövcud qeyd: vəzifə YALNIZ bu dəyərlərdən biridirsə dəyişir (admin yazılışı). */
  positionFrom?: string[];
  /** Əlavə vəzifələr (müəllim və s.) — «Vəzifələr» siyahısına. */
  extra?: { position: string; staffType: StaffType }[];
  /** Tədris etdiyi fənlər — «Tədris» sahəsi boşdursa. */
  teaching?: string[];
}

const T = (position: string, staffType: StaffType = 'akademik') => ({ position, staffType });

export const KOLLEC_STAFF: KollecStaffSeed[] = [
  // ── mövcud qeydlər (admində 20.10.2026 yaradılıb) ──
  {
    fullName: 'Əliyeva Arzu Faiq qızı',
    slug: 'eliyeva-arzu',
    position: 'Direktor vəzifəsini müvəqqəti icra edən',
    staffType: 'rehberlik',
    positionFrom: ['Direktor vəzifəsini müvəqətti icra edən', 'Direktor vəzifəsini müvəqqəti icra edən'],
    extra: [T('Direktor müavini', 'rehberlik'), T('Müəllim')],
    teaching: ['Riyaziyyat'],
  },
  {
    fullName: 'İsmayılova Xəyalə Firudin qızı',
    slug: 'ismayilova-xeyale',
    position: 'Mütəxəssis (personalın idarəedilməsi üzrə)',
    staffType: 'inzibati',
    positionFrom: ['Mütəxəssis (personalın idarəedilməsi üz)'],
  },
  {
    fullName: 'Vahidova Könül Hüseyn qızı',
    slug: 'vahidova-konul',
    position: 'Kitabxanaçı, arxivçi',
    staffType: 'inzibati',
    positionFrom: ['Kitabxanaçı'],
    extra: [T('Müəllim')],
  },
  {
    fullName: 'İsgəndərov İlham Vahid oğlu',
    slug: 'iskenderov-ilham',
    keepName: true,
    position: 'Təsərrüfat işləri üzrə mütəxəssis, komendant',
    staffType: 'inzibati',
    positionFrom: ['Təsərrüfat işləri üzrə mütəxəssis-komendantı'],
  },
  {
    fullName: 'Quliyeva Meyrənsə Azad qızı',
    slug: 'quliyeva-meyrense',
    position: 'Sənədləşdirmə üzrə mütəxəssis, referent',
    staffType: 'inzibati',
    positionFrom: ['Sənədləşmə üzrə mütəxəssis'],
  },
  {
    fullName: 'Babayeva Ədilə Əli qızı',
    slug: 'babayeva-edile',
    position: 'Tədris-metodiki şöbənin müdiri',
    staffType: 'akademik',
    positionFrom: ['Şöbə müdiri'],
    extra: [T('Müəllim')],
    teaching: ['Fizika'],
  },
  { fullName: 'Zeynalova Fəridə Ələkbər qızı', slug: 'zeynalova-feride', position: 'Tyutor', staffType: 'inzibati' },
  {
    fullName: 'Nəbiyeva Gülşən Vaqif qızı',
    slug: 'nebiyeve-gulsen',
    position: 'Metodist',
    staffType: 'inzibati',
    positionFrom: ['Tyutor'],
    extra: [T('Müəllim')],
    teaching: ['Riyaziyyat'],
  },
  {
    fullName: 'Muradov Tahir Əhməd oğlu',
    slug: 'muradov-tahir',
    position: 'Tədris üzrə mütəxəssis',
    staffType: 'inzibati',
    positionFrom: ['Mütəxəssis'],
    extra: [T('Müəllim')],
  },
  // ── yeni qeydlər ──
  { fullName: 'Bağırov Niyaməddin Qoşqar oğlu', position: 'Mütəxəssis (satınalma və təchizat üzrə)', staffType: 'inzibati' },
  { fullName: 'Abdullayev Şaik Beydula oğlu', position: 'Müəllim', staffType: 'akademik', teaching: ['Elektrik təchizatının əsasları'] },
  { fullName: 'Əhmədova Natavan Kamal qızı', position: 'Müəllim', staffType: 'akademik', teaching: ['Azərbaycan tarixi'] },
  { fullName: 'Hüseynova Ələmzar Cilingir qızı', position: 'Müəllim', staffType: 'akademik', teaching: ['İngilis dili'] },
  {
    fullName: 'Məmmədzadə Etibar Oğuz oğlu',
    position: 'Müəllim',
    staffType: 'akademik',
    teaching: ['Dənizdə həyat fəaliyyətinin təhlükəsizliyi'],
  },
  { fullName: 'Qayıbova Məlahət Ərşad qızı', position: 'Müəllim', staffType: 'akademik', teaching: ['Azərbaycan dili'] },
  { fullName: 'Şahbalayeva İradə Şəmsəddin', position: 'Müəllim', staffType: 'akademik', teaching: ['İngilis dili'] },
  {
    fullName: 'Rzayeva Gülpəri Hacı qızı',
    position: 'Müəllim',
    staffType: 'akademik',
    teaching: ['Gəmi buxar qazanları, qaz turbinləri və onların istismarı'],
  },
  { fullName: 'Şirinova Nərminə Arif qızı', position: 'Müəllim', staffType: 'akademik', teaching: ['Elektrotexnika və elektronika'] },
  { fullName: 'Həsənov Zəfər Namik', position: 'Müəllim', staffType: 'akademik', teaching: ['Naviqasiya', 'Gəmi quruluşu və nəzəriyyəsi'] },
  { fullName: 'İsmayılov Valeh Tapdıq oğlu', position: 'Müəllim', staffType: 'akademik', teaching: ['Gəmi energetik qurğuları'] },
  { fullName: 'Əlizadə Rəqsanə Hidayət qızı', position: 'Operator', staffType: 'inzibati' },
  { fullName: 'Mehdiyeva Tükəzban Pilağa qızı', position: 'Operator', staffType: 'inzibati' },
];

/** Saytda var, ştat cədvəlində yoxdur — toxunulmur, logda (admində yoxlanmalı). */
export const KOLLEC_NOT_IN_STAFF = ['hesenov-faiq', 'seyfullayeva-sevil'];

// ── 10. Üst menyu «Kollec» ───────────────────────────────────────────────────
/** Köhnə yer tutan keçidlər (F3 seed): yalnız bunlardırsa menyu yenidən qurulur. */
export const MENU_OLD_URLS = ['/fakulteler', '/hazirlanir/elave-tehsil', '/hazirlanir/infrastruktur', '#', ''];
export const MENU_CATEGORY = 'Kollec';
/** «Kollec» başlığının keçidi (yer tutan «#» idi). */
export const KOLLEC_MENU_URL = URL.unit;
export const KOLLEC_MENU: { title: string; links: LinkSeed[] }[] = [
  {
    title: 'Kollec haqqında',
    links: [{ label: 'Kollec haqqında', url: URL.unit }, L.tarix, L.nizamname],
  },
  {
    title: 'Təhsil',
    links: [L.tehsil, L.tecrube, { label: 'Tədris bazası', url: `${URL.tehsil}#tedris-bazasi` }],
  },
  {
    title: 'Qəbul',
    links: [{ label: 'Kollecə qəbul', url: URL.qebul }, L.ixtisaslar],
  },
];
/** Köhnə yer tutan səhifələrin «Məsul redaktorlar» sətri — redaktor təyin olunmayıbsa silinir. */
export const MENU_DROP_OWNERS = ['page:elave-tehsil', 'page:infrastruktur'];
