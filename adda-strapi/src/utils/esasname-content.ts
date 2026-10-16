/**
 * F5.54 — «Əsasnamələr» (media kitabxanası, qovluq «Əsəsnamələr»: ADDA-ƏS-001…021,
 * keyfiyyəti idarəetmə sisteminin sənədləri, ISO 9001:2015) əsasında məzmun.
 *
 *   REGULATIONS     — 21 əsasnamə: sənəd («1. Məzmun — Sənəd», kateqoriya «esasname»)
 *                     yoxdursa yaradılır; bölmənin öz əsasnaməsi bölməyə, qalanları
 *                     səhifəyə (`url`) bağlanır. Fayl media kitabxanasında adındakı
 *                     koddan tapılır («ADDA-ES_009…»).
 *   ESASNAME_PAGES  — reyestr + 7 yeni səhifə (mətn əsasnamələrdən: təyinat, vəzifə,
 *                     hüquq, iş qaydası; KİS sənədinin «Tətbiq sahəsi», «Resurslar»,
 *                     «Prosesin ölçüləri» kimi texniki bölmələri saytda yoxdur).
 *   UNIT_FILLS      — bölmənin BOŞ «Missiya», «Fəaliyyət sahəsi», «Xidmətlər» sahələri
 *                     (az) və «Quruluş və idarəetmə» əlavə bloku (əlavə bloku yoxdursa).
 *   PAGE_LINKS      — mövcud səhifələrin yan keçidlərinə əsasnamə (redaktə olunmuş
 *                     səhifənin mətninə toxunulmur, yalnız keçid əlavə olunur).
 *
 * Fayl keçidləri `{{ES:n}}` — miqrasiya media kitabxanasındakı faylın ünvanını qoyur
 * (fayl tapılmasa keçid düşür). Mətn yalnız az dilindədir: əsasnamələrin özü də.
 */
import type { LinkSeed, QebulPageSeed } from './qebul-pages-content';
import { ACADEMY_PHONE_AZ } from './phone-fix';

export const REGISTRY_SLUG = 'struktur-bolmelerin-esasnameleri';

export interface RegulationSeed {
  /** ADDA-ƏS-<code>. */
  code: number;
  /** Rəsmi ad (sənəd başlığı «… (ADDA-ƏS-0NN)» olur). */
  title: string;
  /** Bölmənin öz əsasnaməsi — sənəd bu bölmələrə bağlanır. */
  units?: string[];
  /** Bölməsi olmayan əsasnamənin səhifəsi. */
  url?: string;
}

const KAFEDRAS = [
  'deniz-naviqasiyasi-kafedrasi',
  'gemiqayirma-ve-gemi-temiri-kafedrasi',
  'ingilis-dili-kafedrasi',
  'humanitar-fenler-kafedrasi',
  'tetbiqi-mexanika-kafedrasi',
  'gemi-energetik-qurgulari-kafedrasi',
  'gemi-elektroavtomatikasi-kafedrasi',
];
const PERSONAL = 'personalin-idareedilmesi-emek-haqqi-ve-karguzarliq-sobesi';

export const REGULATIONS: RegulationSeed[] = [
  { code: 1, title: 'Himayədarlar Şurasının Əsasnaməsi', url: '/sehife/himayeciler-surasi' },
  { code: 2, title: 'Məzunlar Assosiasiyasının Nizamnaməsi', url: '/sehife/mezunlar-assosiasiyasi' },
  { code: 3, title: 'Tədris-metodiki komissiyasının Əsasnaməsi', url: '/sehife/tedris-metodiki-sura' },
  { code: 4, title: 'Tədris-metodiki Şuranın Əsasnaməsi', url: '/sehife/tedris-metodiki-sura' },
  { code: 5, title: '«İlin tələbəsi» müsabiqəsi haqqında Əsasnamə', url: '/sehife/ilin-telebesi' },
  { code: 6, title: '«Ən yaxşı müəllim» müsabiqəsinin keçirilməsi qaydaları haqqında Əsasnamə', url: '/sehife/en-yaxsi-muellim' },
  { code: 7, title: 'Buraxılış yekun dövlət attestasiyasının keçirilməsi haqqında Əsasnamə', url: '/sehife/yekun-dovlet-attestasiyasi' },
  { code: 8, title: 'Tələbələrin təcrübə keçmələri haqqında Əsasnamə', url: '/sehife/tecrube-haqqinda' },
  { code: 9, title: 'Keyfiyyəti idarəetmə sisteminin Daxili Audit Komissiyasının Əsasnaməsi', url: '/sehife/keyfiyyet-idareetme-sistemi' },
  { code: 10, title: 'Doktorant və dissertantların attestasiyası haqqında Əsasnamə', url: '/sehife/doktorantura' },
  { code: 11, title: 'Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsinin Əsasnaməsi', units: ['elmi-tedqiqat-ve-beynelxalq-elaqeler-sobesi'] },
  { code: 12, title: 'İnformasiya resurs mərkəzinin Əsasnaməsi', units: ['informasiya-resurs-merkezi'] },
  { code: 13, title: 'Personalın idarə edilməsi və əmək haqqı şöbəsinin Əsasnaməsi', units: [PERSONAL] },
  { code: 14, title: 'Kafedralar haqqında Əsasnamə', units: KAFEDRAS },
  { code: 15, title: 'Mühasibat uçotu və hesabatı şöbəsinin Əsasnaməsi', units: ['muhasibat-ucotu-ve-hesabati-sobesi'] },
  { code: 16, title: 'Təlim Tədris Mərkəzinin Əsasnaməsi', units: ['telim-tedris-merkezi'] },
  { code: 17, title: 'Tələbə yataqxanasının Əsasnaməsi', url: '/sehife/yataqxana' },
  { code: 18, title: 'Mətbəənin Əsasnaməsi', units: ['metbee'] },
  { code: 19, title: 'Fakültələr haqqında Əsasnamə', units: ['gemi-suruculuyu-fakultesi', 'gemi-mexanikasi-ve-elektromexanikasi-fakultesi'] },
  {
    code: 20,
    title: 'İcraya nəzarət, kargüzarlıq və təsərrüfat işləri qrupunun Əsasnaməsi',
    units: [PERSONAL, 'teserrufat-isleri-sobesi'],
  },
  { code: 21, title: 'Tədris qeydiyyat şöbəsinin Əsasnaməsi', units: ['tedris-proseslerinin-teskili-sobesi'] },
];

/** «ADDA-ƏS-007». */
export const regCode = (n: number): string => `ADDA-ƏS-${String(n).padStart(3, '0')}`;

/** Fayl keçidi (miqrasiya `{{ES:n}}`-i faylın ünvanı ilə əvəz edir). */
const file = (n: number, label: string): LinkSeed => ({ label, url: `{{ES:${n}}}` });

const REGISTRY_LINK: LinkSeed = { label: 'Struktur bölmələrin əsasnamələri', url: `/sehife/${REGISTRY_SLUG}` };
const CHARTER_LINK: LinkSeed = { label: 'Akademiyanın Nizamnaməsi', url: '/sehife/nizamname' };
const ASK = '/vetendaslarin-muracieti';
const PHONE = `**Telefon:** ${ACADEMY_PHONE_AZ}`;
const MAIL = '**E-poçt:** info@adda.edu.az';

// ── Reyestr ──────────────────────────────────────────────────────────────────
const REGISTRY_PAGE: QebulPageSeed = {
  slug: REGISTRY_SLUG,
  dataBlock: 'esasnameler',
  layout: 'akademiya',
  az: {
    title: 'Struktur bölmələrin əsasnamələri',
    lead:
      'Akademiyanın struktur bölmələrinin, şuralarının və əsas proseslərinin əsasnamələri: hər sənədin aid olduğu səhifə və faylı bir yerdə.',
    body: `Əsasnamə bölmənin, şuranın və ya prosesin məqsədini, vəzifə və hüquqlarını, idarə olunması qaydasını müəyyən edir. Sənədlər Akademiyanın [Nizamnaməsinə](/sehife/nizamname) əsaslanır və [keyfiyyəti idarəetmə sisteminin](/sehife/keyfiyyet-idareetme-sistemi) (ISO 9001:2015) sənədləridir; hər birinin təsdiq qaydası sənədin özündə göstərilib.

Bölmənin öz əsasnaməsi həmin bölmənin səhifəsində, «Sənədlər» siyahısında da var.`,
    seoDescription:
      'Azərbaycan Dövlət Dəniz Akademiyasının struktur bölmələrinin, şuralarının və proseslərinin əsasnamələri: sənədlər və aid olduqları səhifələr.',
    sideLinks: [
      CHARTER_LINK,
      { label: 'Təşkilati struktur', url: '/struktur' },
      { label: 'Keyfiyyəti idarəetmə sistemi', url: '/sehife/keyfiyyet-idareetme-sistemi' },
      { label: 'Akkreditasiya və sertifikatlar', url: '/sertifikatlar' },
    ],
    contact: `**Hüquqi məsələlər:** [Hüquq məsləhətçisi](/struktur/huquq-meslehetcisi)\n\n${PHONE}\n\n${MAIL}`,
  },
};

// ── Himayəçilər Şurası (ADDA-ƏS-001 + Nizamnamə 4.6, 4.7, 6.6, 6.7) ───────────
const HIMAYECILER_PAGE: QebulPageSeed = {
  slug: 'himayeciler-surasi',
  dataBlock: 'yox',
  layout: 'akademiya',
  az: {
    title: 'Himayəçilər Şurası',
    lead:
      'Akademiyanın strateji inkişaf məsələləri üzrə ictimai əsaslarla fəaliyyət göstərən idarəetmə orqanı: təhsilin və elmin inkişafına, maddi-texniki bazanın möhkəmləndirilməsinə və məzunların işlə təminatına dəstək olur.',
    body: `Himayəçilər Şurası Akademiyanın strateji inkişaf məsələləri üzrə idarəetmə orqanıdır və ictimai əsaslarla fəaliyyət göstərir ([Nizamnamə](/sehife/nizamname), 4.6). Akademiyanın daxili sənədlərində «Himayədarlar Şurası» adı ilə də keçir.

Şura hüquqi şəxs deyil, üzvləri könüllü və əvəzsiz çalışır. Şura Akademiyanın rəhbərliyi ilə sıx işgüzar əlaqə saxlayır, lakin onun cari və inzibati işlərinə müdaxilə etmir: səlahiyyəti xaricindəki qərarları tövsiyə və məsləhət xarakteri daşıyır.

## Nizamnaməyə görə səlahiyyətləri

- Şuranın tərkibini 5 nəfər olmaqla «Azərbaycan Xəzər Dəniz Gəmiçiliyi» QSC (ASCO) təsdiq edir (4.6).
- Akademiyanın tədris-metodiki işləri üçün Elmi-metodiki Şuranı yaradır və onun əsasnaməsini təsdiq edir (4.7).
- Akademiyanın fəaliyyətinin müstəqil yoxlanılması üçün kənar auditor təyin edir və onun audit hesabatını qəbul edir (6.6).
- Daxili audit bölməsinin fəaliyyətinə nəzarət edir, hesabatlarını alır, üzvlərinin vəzifəyə təyin və vəzifədən azad edilməsi barədə qərar qəbul edir (6.7).
- Rektor Himayəçilər Şurası qarşısında Akademiyanın cari fəaliyyətinə dair hesabat verir (4.11.11).

## Əsas məqsədləri

- fasiləsiz təhsil sisteminin inkişafına, tələbələrin mənəvi tərbiyəsinə, işgüzar və peşəkar keyfiyyətlərinin formalaşmasına dəstək olmaq;
- əmək bazarının inkişafını nəzərə alaraq mütəxəssis hazırlığının perspektiv istiqamətlərinin müəyyən edilməsinə və tədris proqramlarının dövlət orqanlarının və biznesin sorğularına uyğun yenilənməsinə kömək etmək;
- elmi-tədqiqat və innovasiya fəaliyyətinə, elmi məktəblərin formalaşmasına, tədris və elmin inteqrasiyasına dəstək vermək;
- məzun hazırlığının keyfiyyətini artıran proqramların həyata keçirilməsinə və maliyyələşdirilməsinə imkan yaratmaq;
- tədris və elmi obyektlərin tikintisinə, avadanlıq və texniki vasitələrin alınmasına dəstək vermək;
- beynəlxalq elmi-texniki və mədəni əməkdaşlığın genişlənməsinə kömək etmək;
- tələbə təcrübəsinin təşkilinə və məzunların işlə təmin olunmasına dəstək vermək;
- büdcədənkənar vəsaitin cəlb edilməsinə və xeyriyyə fəaliyyətinə, əməkdaşların sosial müdafiəsinə və tələbələrə maddi dəstəyə şərait yaratmaq.

## Hüquqları

- Akademiyanın və onun struktur bölmələrinin fəaliyyəti barədə məlumat almaq;
- maliyyə-təsərrüfat fəaliyyəti, inkişaf plan və proqramlarının, Şura qərarlarının icrası barədə rektorun illik və növbədənkənar hesabatını dinləmək;
- Akademiyanın inkişafına dair təkliflərlə dövlət orqanlarına müraciət etmək;
- Akademiyanın konfranslarında, iclaslarında və digər tədbirlərində iştirak etmək, kütləvi informasiya vasitələrində çıxış etmək;
- Şuranın sədri Akademiyanın işində aşkar edilmiş çatışmazlıqlar barədə rəhbərliyi xəbərdar edir və onların aradan qaldırılması üçün təkliflər verir.

Şuranın hüquqları təhsil sahəsində qüvvədə olan qanunvericiliyə zidd ola bilməz.

## İşin təşkili

- Şura öz planına uyğun olaraq ildə iki dəfə iclas keçirir; növbədənkənar iclası zərurət olduqda sədr çağırır.
- Şuranın sədri iclasda seçilir və Akademiyanın kollektivindən ola bilməz. Zəruri hallarda sədrin təqdimatı ilə sədr müavini seçilir.
- Şuranın katibini Akademiyanın rəhbərliyi təyin edir; katib Şuranın üzvü sayılmır.
- Qərarlar iclasda iştirak edən üzvlərin açıq səsverməsi ilə qəbul olunur, səslər bərabər olduqda sədrlik edənin səsi həlledicidir. Qərarlar protokollaşdırılır, sədr və katib imzalayır.
- Akademiya Şuranın təşkilati-texniki xidmətini həyata keçirir və iclasların materiallarını hazırlayır.

## Vəsaitlər

Şuranın vəsaiti xeyriyyə və layihələrdən toplanan vəsait hesabına formalaşır. Maddi-texniki bazanın inkişafına yönəlmiş vəsait Akademiyanın hesabına keçirilir; Akademiya Şura üzvlərinə vəsaitin xərclənməsi barədə məlumat və illik hesabat təqdim edir.`,
    seoDescription:
      'ADDA-nın Himayəçilər Şurası: Nizamnaməyə görə səlahiyyətləri, məqsədləri, hüquqları və iş qaydası (ADDA-ƏS-001).',
    facts: [
      { label: 'Hüquqi əsas', value: 'Nizamnamə, 4.6 və 4.7', icon: 'sened' },
      { label: 'Tərkib', value: '5 nəfər, ASCO təsdiq edir', icon: 'qrup' },
      { label: 'İclaslar', value: 'ildə iki dəfə', icon: 'tarix' },
    ],
    sideLinks: [
      CHARTER_LINK,
      { label: 'Elmi Şura', url: '/struktur/elmi-sura' },
      { label: 'Rəhbərlik', url: '/rehberlik' },
      REGISTRY_LINK,
      file(1, 'Himayədarlar Şurasının Əsasnaməsi (ADDA-ƏS-001)'),
    ],
    contact: `${PHONE}\n\n${MAIL}\n\nSualınızı [onlayn göndərin](${ASK}).`,
  },
};

// ── Məzunlar Assosiasiyası (ADDA-ƏS-002) ──────────────────────────────────────
const MEZUNLAR_PAGE: QebulPageSeed = {
  slug: 'mezunlar-assosiasiyasi',
  dataBlock: 'yox',
  layout: 'akademiya',
  az: {
    title: 'Məzunlar Assosiasiyası',
    lead:
      'Akademiya məzunlarını bir araya gətirən ictimai birlik: peşəkar əlaqələr şəbəkəsi, məzun günləri, işə düzəlməyə köməklik və Akademiyanın inkişafına töhfə.',
    body: `Azərbaycan Dövlət Dəniz Akademiyasının Məzunlar Assosiasiyası ictimai birlikdir. Assosiasiya hüquqi şəxs deyil və könüllülük, üzvlərin bərabər hüquqlu olması, özünüidarə və aşkarlıq prinsipləri əsasında fəaliyyət göstərir.

Məqsəd məzunları Akademiya ilə daim əlaqə saxlamağa həvəsləndirmək, tələbələr və məzunlar arasında əməkdaşlıq ruhunu və Akademiyaya sadiqlik hissini gücləndirməkdir. Assosiasiya gəlir götürmək məqsədi daşımır; üzvləri Akademiyanın inkişafına ianə və hədiyyə ilə kömək edə bilər.

## Məqsəd və vəzifələr

- məzunların mədəni və peşəkar ünsiyyətinə şərait yaratmaq;
- məzunların təcrübəsindən istifadə etməklə elmi, tədris və sosial-iqtisadi layihələr həyata keçirmək;
- Akademiyanın beynəlxalq əlaqələrini genişləndirmək və nüfuzunu artırmaq;
- məzunlar və professor-müəllim heyəti arasında məlumat mübadiləsini qurmaq;
- məzunların müntəzəm görüşlərini və Akademiyada məzun gününü keçirmək;
- tədris, elmi-tədqiqat və tərbiyə işlərinə köməklik göstərmək;
- Akademiya ilə müəssisə və təşkilatlar arasında elmi və işgüzar əlaqələrin qurulmasına kömək etmək;
- məzunların işlə təmin olunmasına köməklik göstərmək;
- Assosiasiyanın tərkibində kapitanlar, mexaniklər və digər peşə klubları yaratmaq.

## Üzvlük

Akademiyanın hər bir məzunu öz istəyi ilə Assosiasiyanın üzvü ola bilər; üzvlər bərabər hüquqludur. Üzvlükdən İdarə Heyətinə ərizə verməklə çıxmaq olar.

**Üzvlərin hüquqları:** Assosiasiyanın rəhbər orqanına seçilmək, idarə olunmasında iştirak etmək, metodik və məlumat materiallarını, tədbirlər planını almaq və onlardan istifadə etmək, tədris, elm və beynəlxalq əlaqələrin inkişafı üçün Akademiya rəhbərliyinə təkliflər vermək.

**Üzvlərin vəzifələri:** Assosiasiyanın məqsədlərinin həyata keçirilməsinə səy göstərmək, onun tədbirlərində fəal iştirak etmək, Nizamnaməyə və rəhbər orqanın qərarlarına əməl etmək, iş yeri, vəzifəsi və əlaqə məlumatları dəyişdikdə məlumat vermək, Akademiya məzunu adına xələl gətirən hərəkətlərə yol verməmək.

## İdarəetmə

- Assosiasiyanın ali orqanı ümumi yığıncaqdır; üç ildə bir dəfədən az olmayaraq keçirilir. Növbədənkənar yığıncağı İdarə Heyətinin sədri və ya üzvlərin üçdə biri çağıra bilər.
- Nizamnaməyə dəyişikliklər, fəaliyyətin prioritet istiqamətləri və İdarə Heyətinin seçilməsi yığıncağın müstəsna səlahiyyətidir; bu qərarlar iştirakçıların üçdə iki səs çoxluğu ilə qəbul edilir.
- Cari işə İdarə Heyətinin üzvləri arasından 3 il müddətinə seçilən sədr rəhbərlik edir; sədr yığıncağa hesabat verir, işinə Akademiya nəzarət edir. Cari məsələlər üçün sədr işçi qrup yaradır.
- Assosiasiyanın fəaliyyətinə Akademiyanın Elmi Şurasının qərarı ilə xitam verilə bilər.`,
    seoDescription:
      'ADDA Məzunlar Assosiasiyası: məqsəd və vəzifələr, üzvlük, üzvlərin hüquq və vəzifələri, idarəetmə (ADDA-ƏS-002).',
    facts: [
      { label: 'Status', value: 'İctimai birlik', icon: 'qrup' },
      { label: 'Üzvlük', value: 'Könüllü, bütün məzunlar üçün', icon: 'diplom' },
      { label: 'Ümumi yığıncaq', value: '3 ildə ən azı bir dəfə', icon: 'tarix' },
    ],
    sideLinks: [
      { label: 'Məzunlar üçün', url: '/bunlar-ucun/mezunlar' },
      { label: 'Məzunların işlə təminatı', url: '/sehife/mezunlarin-isle-teminati' },
      REGISTRY_LINK,
      file(2, 'Məzunlar Assosiasiyasının Nizamnaməsi (ADDA-ƏS-002)'),
    ],
    contact: `**Ünvan:** Bakı, Zərifə Əliyeva küçəsi 18\n\n**E-poçt:** akademiya@asco.az\n\n${PHONE}`,
  },
};

// ── Tədris-metodiki Şura və komissiya (ADDA-ƏS-004, ADDA-ƏS-003) ────────────
const TMS_PAGE: QebulPageSeed = {
  slug: 'tedris-metodiki-sura',
  dataBlock: 'yox',
  layout: 'tehsil',
  az: {
    title: 'Tədris-metodiki Şura və komissiya',
    lead:
      'Akademiyada metodiki işi iki kollektiv orqan aparır: Tədris-metodiki Şura metodiki işin istiqamətlərini müəyyən edir və əlaqələndirir, Tədris-metodiki komissiya isə təhsil proqramlarının hazırlanmasında dekanlıq və kafedraların işini koordinasiya edir.',
    body: `Metodiki işin məqsədi təhsilin məzmununun, təşkilinin və tədris metodlarının kompleks təkmilləşdirilməsi ilə tədris prosesinin keyfiyyətini artırmaqdır.

## Tədris-metodiki Şura

Tədris-metodiki Şura (TMŞ) tədris üzrə prorektorun yanında daimi fəaliyyət göstərən kollektiv orqandır və Akademiyada metodiki işin əsas istiqamətlərini müəyyən edir və əlaqələndirir. Şura öz işində Elm və Təhsil Nazirliyinin, Beynəlxalq Dəniz Təşkilatının (IMO), Dövlət Dəniz və Liman Agentliyinin və ASCO-nun normativ sənədlərini rəhbər tutur.

- **Tərkibi:** sədr (tədris işləri üzrə prorektor), sədr müavini, katib və üzvlər. Heyət iki il müddətinə rektorun əmri ilə təsdiq edilir.
- **İclaslar:** iş planına uyğun, semestrdə iki dəfədən az olmayaraq; iclaslar Akademiyanın bütün əməkdaşları üçün açıqdır.
- **Qərarlar:** iştirak edən üzvlərin açıq səsverməsi ilə, yarıdan çoxu lehinə səs verdikdə qəbul olunur və metodiki-informasiya məktubu, Elmi Şuranın qərar layihəsi və ya rektorun əmr layihəsi kimi tərtib edilir.
- **Hesabat:** Şura illik plan üzrə işləyir, sədr Elmi Şuraya illik hesabat təqdim edir. Ayrı-ayrı məsələlər üçün Şuranın yanında işçi qruplar və daimi komissiyalar yaradılır.

## Metodiki işin istiqamətləri

- tədris-metodiki işin keyfiyyətinin təhlili və onu yaxşılaşdıran proqramların hazırlanması;
- fənlər üzrə tədris-metodiki komplekslərin yaradılması, tədris plan və proqramlarının təkmilləşdirilməsi;
- müəllimlərin metodiki fəaliyyətinin qiymətləndirmə meyarlarının və həvəsləndirmə sisteminin hazırlanması;
- tədris prosesinin ədəbiyyat və maddi-texniki təminatının təhlili;
- qabaqcıl təcrübənin, müasir pedaqoji və informasiya texnologiyalarının öyrənilməsi və tətbiqi;
- gənc müəllimlərin ixtisasının artırılması sisteminin qurulması;
- elmi-metodiki konfrans, seminar və müsabiqələrin keçirilməsi, elmi-metodiki tədqiqatlar.

## Şuranın hüquqları

- dekanlıqlardan, kafedralardan və digər bölmələrdən tədris-metodiki materialları tələb etmək;
- məsələlərin müzakirəsinə dekanları, kafedra müdirlərini və müəllimləri dəvət etmək;
- ayrı-ayrı metodiki işlərə Akademiyanın ən təcrübəli əməkdaşlarını cəlb etmək;
- fakültə elmi şuralarına və kafedra iclaslarına tədris-metodiki məsələlərin müzakirəsi üçün üzvlərini göndərmək.

## Tədris-metodiki komissiya

Tədris-metodiki komissiya (TMK) rektorun yanında daimi fəaliyyət göstərən orqandır: bakalavriat və magistratura üzrə dövlət təhsil standartlarının tələblərini reallaşdıran təhsil proqramlarının hazırlanmasında və tətbiqində dekanlıqların və kafedraların birgə işini koordinasiya edir. Komissiyanı rektor yaradır; tərkibinə sədr, sədr müavini və təcrübəli müəllimlər daxildir.

Komissiya:

- bakalavriat və magistratura ixtisaslarının, üzən heyətin ixtisasartırma kurslarının və sıravi heyət hazırlığının tədris planlarının hazırlanmasında iştirak edir;
- fənlərin işçi proqramlarını (sillabusları) yoxlayır, buraxılış işlərinin və magistr dissertasiyalarının mövzularının ekspertizasını aparır;
- seçmə fənlərin siyahısını təhlil edir, tədris, istehsalat (üzmə), elmi-tədqiqat və elmi-pedaqoji təcrübələrin proqramlarını müzakirə edir;
- açıq dərslərin illik planına nəzarət edir, onların təşkilində və müzakirəsində iştirak edir, yeni başlayan müəllimlərə kömək edir.

Komissiya semestrdə iki dəfədən az olmayaraq toplanır. Qərarları tövsiyə xarakterlidir; rektorun təsdiq etdiyi tövsiyələrin icrası bütün kafedralarda məcburidir. Sədr tədris ilinin sonunda Elmi Şuraya hesabat verir.`,
    seoDescription:
      'ADDA-nın Tədris-metodiki Şurası və Tədris-metodiki komissiyası: tərkibi, iş qaydası, metodiki işin istiqamətləri (ADDA-ƏS-003, ADDA-ƏS-004).',
    facts: [
      { label: 'Şuranın sədri', value: 'Tədris işləri üzrə prorektor', icon: 'qrup' },
      { label: 'Heyət', value: '2 il müddətinə, rektorun əmri ilə', icon: 'sened' },
      { label: 'İclaslar', value: 'Semestrdə ən azı iki dəfə', icon: 'tarix' },
    ],
    sideLinks: [
      { label: 'Tədris ofisi', url: '/struktur/tedris-proseslerinin-teskili-sobesi' },
      { label: 'Kafedralar', url: '/kafedralar' },
      { label: 'Keyfiyyət və nəticələr', url: '/sehife/keyfiyyetin-monitorinqi' },
      { label: '«Ən yaxşı müəllim» müsabiqəsi', url: '/sehife/en-yaxsi-muellim' },
      file(4, 'Tədris-metodiki Şuranın Əsasnaməsi (ADDA-ƏS-004)'),
      file(3, 'Tədris-metodiki komissiyasının Əsasnaməsi (ADDA-ƏS-003)'),
    ],
    contact:
      '**Şuranın sədri:** [Tədrisin təşkili və idarəedilməsi üzrə prorektor](/struktur/tedrisin-teskili-ve-idareedilmesi-uzre-prorektorluq)\n\n' +
      `${PHONE}\n\n${MAIL}`,
  },
};

// ── «İlin tələbəsi» (ADDA-ƏS-005) ────────────────────────────────────────────
const ILIN_TELEBESI_PAGE: QebulPageSeed = {
  slug: 'ilin-telebesi',
  dataBlock: 'yox',
  layout: 'telebe',
  az: {
    title: '«İlin tələbəsi» müsabiqəsi',
    lead:
      'Təhsildə, elmdə və ictimai həyatda fərqlənən tələbələr üçün Akademiyanın ən yüksək fəxri mükafatı. Müsabiqə ildə bir dəfə, tədris ilinin yekunlarına görə iki turda keçirilir.',
    body: `Müsabiqənin məqsədi tələbələrin təhsildə, elmdə və peşədə səviyyəsini yüksəltmək, yaradıcılıq sahələrində fəallığını artırmaqdır. Nəticədə ilin ən yaxşı tələbəsi seçilir və onun adı Akademiyanın saytında dərc olunur.

## Kimlər iştirak edə bilər

«Əla» və «yaxşı» qiymətlərlə oxuyan, elmi-tədqiqat işində nailiyyəti olan və Akademiyanın ictimai həyatında fəal iştirak edən II–IV kurs tələbələri. Müsabiqəyə buraxılan tələbələrin sayını hər il komissiya müəyyən edir; bu say hər kursun tələbələrinin 10 faizindən çox ola bilməz.

Namizədləri dekanlıqlar, kafedralar və tələbə ictimai təşkilatları irəli sürür.

## Təqdim olunan sənədlər

- müvəffəqiyyət kitabçasının surəti;
- elmi məqalələrin siyahısı;
- namizəd haqqında məlumat anketi;
- tələbənin ictimai fəaliyyəti barədə fakültə dekanının və ictimai təşkilatların rəyi;
- tələbə olimpiadalarında nəticələr və mükafatlar barədə məlumat.

## Qiymətləndirmə

Yekun nəticə üç göstəriciyə görə müəyyən olunur: təhsildə müvəffəqiyyət, elmi-tədqiqat işləri və ictimai fəallıq. Əsas meyarlar yüksək akademik göstərici (orta bal 91-dən yuxarı), elmi tədqiqatlarda iştirak, ictimai fəallıq və nizam-intizam qaydalarına əməl etməkdir.

## Müsabiqənin gedişi

- Müsabiqə ildə bir dəfə rektorun əmri ilə elan olunur və rektorun əmri ilə yaradılan komissiya tərəfindən keçirilir.
- Komissiyanın sədri tədris və tərbiyə işləri üzrə prorektordur; tərkibinə fakültə dekanları və müavinləri, hər ixtisas üzrə bir tyutor, Tələbə Həmkarlar İttifaqı Komitəsinin və Tələbə Gənclər Təşkilatının sədrləri daxildir.
- **I tur** fakültə komissiyasında keçirilir (sədr: dekan; üzvlər: dekan müavini, tyutor, fakültənin həmkarlar və gənclər təşkilatlarının nümayəndələri).
- **II tur** Akademiyanın müsabiqə komissiyasında keçirilir: komissiya fakültələrin irəli sürdüyü namizədlər arasından ən yaxşılarını seçir.

## Mükafat

«İlin tələbəsi» Akademiyanın ən yüksək fəxri mükafatıdır və keçici xarakter daşıyır: fəxri ad diplom, kubok və maddi mükafatla təqdim olunur.`,
    seoDescription:
      'ADDA-da «İlin tələbəsi» müsabiqəsi: kimlər iştirak edə bilər, hansı sənədlər lazımdır, qiymətləndirmə və mükafat (ADDA-ƏS-005).',
    facts: [
      { label: 'Kimlər', value: 'II–IV kurs tələbələri', icon: 'qrup' },
      { label: 'Mərhələlər', value: '2 tur: fakültə və Akademiya', icon: 'imtahan' },
      { label: 'Mükafat', value: 'Diplom, kubok, maddi mükafat', icon: 'diplom' },
    ],
    sideLinks: [
      { label: 'Tələbə həyatı', url: '/sehife/telebe-heyati' },
      { label: 'Təqaüd və sosial dəstək', url: '/sehife/sosial-teminat-ve-maddi-yardim' },
      { label: 'Tələbə Elmi Cəmiyyəti', url: '/sehife/telebe-elmi-cemiyyeti' },
      REGISTRY_LINK,
      file(5, '«İlin tələbəsi» müsabiqəsi haqqında Əsasnamə (ADDA-ƏS-005)'),
    ],
    contact: `**Namizədlik:** fakültənizin dekanlığı\n\n${PHONE}\n\nSualınızı [onlayn göndərin](${ASK}).`,
  },
};

// ── «Ən yaxşı müəllim» (ADDA-ƏS-006) ─────────────────────────────────────────
const EN_YAXSI_MUELLIM_PAGE: QebulPageSeed = {
  slug: 'en-yaxsi-muellim',
  dataBlock: 'yox',
  layout: 'tehsil',
  az: {
    title: '«Ən yaxşı müəllim» müsabiqəsi',
    lead:
      'Yaradıcı, yeniliyə açıq və tədrisdə uğurlu nəticələri ilə seçilən müəllimləri üzə çıxarmaq üçün hər tədris ili keçirilən müsabiqə. Qaliblər rektorun əmri ilə mükafatlandırılır.',
    body: `Müsabiqənin məqsədi Akademiyada çalışan yaradıcı müəllimləri üzə çıxarmaq, müasir təlim texnologiyalarını uğurla tətbiq edən istedadlı müəllimləri müəyyən etmək, novator müəllimlərə pedaqoji ustalıqlarını göstərmək üçün şərait yaratmaq və müəllimin statusunu və nüfuzunu yüksəltməkdir.

Müsabiqəni Akademiyanın rəhbərliyi hər tədris ili keçirir. Ona rəhbərliyi və nəzarəti ictimai əsaslarla işləyən Təşkilat komitəsi (prorektorlar, dekanlar və ictimai təşkilatların nümayəndələri) həyata keçirir; mübahisəli məsələlərə rektorluğun yaratdığı apelyasiya komissiyası baxır.

## İştirak şərtləri

Əsas iş yeri Akademiyada olan, ən azı beş il pedaqoji stajı olan müəllimlər iştirak edə bilər. Nəzərə alınır:

- ixtisasartırma kursları, treninqlər və yeni təlim texnologiyalarının tətbiqinə dair sənədlər, xaricdə təcrübə mübadiləsi kurslarında iştirak;
- pedaqoji mühazirələrdə və elmi-texniki konfranslarda məruzələr, elmi nəşrlərdə məqalələr, dərslik və tədris vəsaiti müəllifliyi;
- tələbələrin semestr imtahanlarında uğurlu nəticələri, fənn üzrə elmi konfranslarda çıxışları və nəşrləri;
- elmi dərəcə və elmi ad, dövlət təltifləri («Şöhrət» ordeni, «Tərəqqi» medalı, «Əməkdar müəllim» fəxri adı, «Donanmanın fəxri işçisi» döş nişanı), Akademiya rəhbərliyinin təşəkkürləri;
- informasiya-kommunikasiya texnologiyalarından istifadə bacarığı;
- ictimai təşkilatların, kafedra, dekanlıq, rəhbərlik və tələbə sorğularında müsbət rəylər.

## Mərhələlər

1. **Sənədlərin ekspertizası.** Müəllim müəyyən olunmuş müddətdə Təşkilat komitəsinə ərizə və şərtləri təsdiq edən sənədlərin surətlərini təqdim edir (ərizə e-poçtla da göndərilə bilər). Daha çox bal toplayan müəllimlər ikinci mərhələyə buraxılır.
2. **Sınaq dərsləri.** İştirakçılar akademik qruplarda öz fənləri üzrə dərs keçir. Dərsləri tanınmış alim və metodistlərdən, təcrübəli mütəxəssislərdən və ictimaiyyət nümayəndələrindən ibarət fənn komissiyaları qiymətləndirir: dərs formasının seçimi, tələbələrin problemin həllinə cəlb edilməsi, interaktiv metodların tətbiqi, mövzunun mənimsənilmə səviyyəsi və qiymətləndirmənin çevikliyi. Hər açıq dərs müəllimin iştirakı ilə təhlil olunur.
3. **Təqdimat.** İştirakçılar Təşkilat komitəsi qarşısında özləri haqqında qısa məlumat verir, təhsilin aktual məsələlərinə dair komitənin təklif etdiyi mövzuda 10 dəqiqəlik təqdimatla çıxış edir və sualları cavablandırır.

Mərhələlərin vaxtını hər il Akademiyanın rəhbərliyi, qiymətləndirmə ballarını Təşkilat komitəsi müəyyən edir.

## Yekun

Təşkilat komitəsi müəllimlərin sayına görə fakültələr üzrə kvota müəyyən edir və hər üç mərhələnin nəticəsinə görə ən çox bal toplayan 10 müəllimi seçir. Siyahı əsaslandırılmış arayışla rektora təqdim olunur; qaliblər rektorun əmri ilə «Ən yaxşı müəllim» mükafatı ilə təltif edilir. Mükafat almış müəllim dörd il keçdikdən sonra müsabiqədə yenidən iştirak edə bilər.`,
    seoDescription:
      'ADDA-da «Ən yaxşı müəllim» müsabiqəsi: iştirak şərtləri, üç mərhələ, qiymətləndirmə və mükafatlandırma (ADDA-ƏS-006).',
    facts: [
      { label: 'Kimlər', value: 'Ən azı 5 il stajı olan müəllimlər', icon: 'qrup' },
      { label: 'Mərhələlər', value: '3: ekspertiza, sınaq dərsi, təqdimat', icon: 'imtahan' },
      { label: 'Qaliblər', value: '10 müəllim, fakültə kvotası ilə', icon: 'diplom' },
    ],
    sideLinks: [
      { label: 'Tədris-metodiki Şura və komissiya', url: '/sehife/tedris-metodiki-sura' },
      { label: 'Kafedralar', url: '/kafedralar' },
      { label: 'Keyfiyyət və nəticələr', url: '/sehife/keyfiyyetin-monitorinqi' },
      REGISTRY_LINK,
      file(6, '«Ən yaxşı müəllim» müsabiqəsi haqqında Əsasnamə (ADDA-ƏS-006)'),
    ],
    contact: `${PHONE}\n\n${MAIL}\n\nSualınızı [onlayn göndərin](${ASK}).`,
  },
};

// ── Buraxılış yekun dövlət attestasiyası (ADDA-ƏS-007) ───────────────────────
const YDA_PAGE: QebulPageSeed = {
  slug: 'yekun-dovlet-attestasiyasi',
  dataBlock: 'yox',
  layout: 'tehsil',
  az: {
    title: 'Buraxılış yekun dövlət attestasiyası',
    lead:
      'Bakalavriatı bitirən tələbələr ixtisas-peşə hazırlığı fənlərindən yazılı-şifahi dövlət imtahanı verir. Suallar STCW Konvensiyasının istismar və idarəetmə səviyyələrinə uyğundur, nəticə 100 ballıq şkala ilə qiymətləndirilir.',
    body: `Buraxılış yekun dövlət attestasiyası təhsil proqramının mənimsənilmə səviyyəsini müəyyən etmək və məzuna ixtisas dərəcəsi vermək üçün keçirilir. Qaydalar «Təhsil haqqında» Qanuna, bakalavr pilləsində dövlət attestasiyası haqqında əsasnaməyə və STCW-78 Konvensiyasının A-II/1, A-II/2, A-III/1, A-III/2, A-III/6, A-III/7 bölmələrinin tələblərinə əsaslanır.

## Kimlər buraxılır

Təhsil proqramının bütün tələblərini yerinə yetirmiş, tədris planındakı fənlər və təcrübələr üzrə kreditləri toplamış tələbələr. İmtahanın proqramı və qiymətləndirmə qaydası Elmi Şurada təsdiq olunur və attestasiyanın başlamasından ən azı 4 ay əvvəl tələbələrə çatdırılır. İmtahan suallarına dair məsləhət saatlarını ixtisas kafedraları keçirir.

## İmtahan necə keçirilir

- İmtahan yazılı-şifahi qaydada, ixtisas-peşə hazırlığı fənlərindən keçirilir; elektron və distant forma qadağandır.
- Tələbəyə 5 nəzəri sual (istismar səviyyəsi, STCW A-II/1, A-III/1, A-III/6) və 1 praktiki tapşırıq (idarəetmə səviyyəsi, A-II/2, A-III/2, A-III/6) verilir.
- Hər nəzəri sual 15 bala, praktiki tapşırıq 25 bala qədər qiymətləndirilir. Nəzəri suallardan 26 baldan az toplayan tələbə növbəti mərhələyə buraxılmır.
- Attestasiyadan keçmək üçün ən azı 51 bal toplamaq lazımdır. Nəticələr imtahan günü elan olunur.
- İmtahanda rabitə vasitələrindən istifadə qəti qadağandır; qadağan olunmuş vasitə aşkar edilərsə akt tərtib olunur və «qeyri-kafi» qiymət verilir.

## Qiymətləndirmə şkalası

| Bal | Qiymət |
|---|---|
| 91–100 | əla (A) |
| 81–90 | çox yaxşı (B) |
| 71–80 | yaxşı (C) |
| 61–70 | qənaətbəxş (D) |
| 51–60 | kafi (E) |
| 51-dən aşağı | qeyri-kafi (F) |

## Dövlət Attestasiya Komissiyası

- İmtahanı hər ixtisas üzrə Dövlət Attestasiya Komissiyası (DAK) aparır. Sədri Akademiyada işləməyən yüksək ixtisaslı mütəxəssislər arasından, ardıcıl 3 ildən çox olmamaq şərti ilə Akademiyanın təqdimatı əsasında ASCO təyin edir.
- Komissiyaya Akademiyanın elmi-pedaqoji heyəti və sahənin aparıcı mütəxəssisləri (ən azı 4 nəfər) daxildir; tərkibi rektor təsdiq edir, səlahiyyət müddəti bir təqvim ilidir.
- Qərarlar üzvlərin üçdə ikisi (sədr mütləq) iştirak etdikdə sadə səs çoxluğu ilə qəbul olunur; səslər bərabər olduqda sədrin səsi həlledicidir.

## Nəticədən narazılıq

Tələbə nəticədən narazıdırsa, nəticələrin elanından sonra 1 iş günü ərzində rektora ərizə ilə müraciət edə bilər. Müraciətə rektorun tapşırığı ilə DAK tələbənin iştirakı ilə yenidən baxır.

## Diplom və fərqlənmə diplomu

DAK-ın qərarı ilə məzuna ixtisas dərəcəsi, ali təhsil haqqında diplom və diploma əlavə verilir. Fərqlənmə diplomu üçün: bütün fənlərdən və təcrübədən qiymət 71-dən az olmamalı, «C» və «B» qiymətləri bütün qiymətlərin 25 faizindən çox olmamalı, imtahanlarda yalnız «A», «B», «C», yekun attestasiyada isə yalnız «A» alınmalıdır.

## Təkrar iştirak

- Üzrlü səbəbdən iştirak etməyən tələbə DAK-ın fəaliyyəti dövründə bir dəfə pulsuz attestasiyadan keçə bilər.
- İştirak etməyən və ya «qeyri-kafi» alan tələbəyə arayış verilir; o, növbəti 4 təqvim ili ərzində iki dəfə yekun attestasiyada iştirak edə bilər. Ödəniş həmin il üçün təhsil haqqının 60-a bölünüb attestasiyanın kreditlərinə vurulması ilə hesablanır.`,
    seoDescription:
      'ADDA-da buraxılış yekun dövlət attestasiyası: imtahanın forması, STCW üzrə suallar, 100 ballıq şkala, DAK, apelyasiya və fərqlənmə diplomu (ADDA-ƏS-007).',
    facts: [
      { label: 'Forma', value: 'Yazılı-şifahi imtahan', icon: 'imtahan' },
      { label: 'Suallar', value: '5 nəzəri və 1 praktiki', icon: 'sened' },
      { label: 'Keçid balı', value: '51 (100 baldan)', icon: 'bal' },
    ],
    sideLinks: [
      { label: 'Tədris ofisi', url: '/struktur/tedris-proseslerinin-teskili-sobesi' },
      { label: 'Təcrübə (praktika)', url: '/sehife/tecrube-haqqinda' },
      { label: 'Bakalavriat ixtisasları', url: '/ixtisaslar?tab=bakalavr' },
      REGISTRY_LINK,
      file(7, 'Yekun dövlət attestasiyası haqqında Əsasnamə (ADDA-ƏS-007)'),
    ],
    contact:
      '**Təşkilat:** [Tədris proseslərinin təşkili şöbəsi](/struktur/tedris-proseslerinin-teskili-sobesi), fakültə dekanlıqları\n\n' +
      `${PHONE}\n\nSualınızı [onlayn göndərin](${ASK}?istiqamet=tedris).`,
  },
};

// ── Keyfiyyəti idarəetmə sistemi (ADDA-ƏS-009) ───────────────────────────────
const KIS_PAGE: QebulPageSeed = {
  slug: 'keyfiyyet-idareetme-sistemi',
  dataBlock: 'yox',
  layout: 'akademiya',
  az: {
    title: 'Keyfiyyəti idarəetmə sistemi',
    lead:
      'Akademiyanın keyfiyyəti idarəetmə sistemi ISO 9001:2015 standartı əsasında qurulub: proseslər sənədləşdirilir, daxili auditlər aparılır, nəticələrə görə düzəliş tədbirləri görülür.',
    body: `Keyfiyyəti idarəetmə sistemi (KİS) Akademiyanın tədris, elmi və inzibati proseslərini ISO 9001:2015 beynəlxalq standartının tələblərinə uyğun idarə edir. Sistemin sənədləri bölmələrin və proseslərin [əsasnamələri](/sehife/${REGISTRY_SLUG}) (ADDA-ƏS seriyası) və prosedurlardır (məsələn, ADDA-KP-002 «Sənədləşdirilmiş məlumatların idarə olunması»); hər sənəddə prosesin ölçüləri və meyarları göstərilir.

## Daxili Audit Komissiyası

Komissiyaya Rəhbərliyin Keyfiyyət üzrə Nümayəndəsi rəhbərlik edir. Komissiya müxtəlif sahələrin mütəxəssislərindən ibarət 5 daimi üzvdən təşkil olunur; tərkibində komissiyanın icra orqanı olan işçi qrup fəaliyyət göstərir. Komissiyanın əsasnaməsi Akademiyanın rektorunun əmri ilə təsis və ləğv edilir.

## Komissiyanın vəzifələri

- KİS-in işləkliyini və fasiləsiz təkmilləşdirilməsini təmin etmək, sistemi müşahidə etmək, təhlil etmək və qiymətləndirmək;
- keyfiyyət siyasətinin hazırlanması və yenilənməsi üzrə təkliflər vermək, siyasəti bütün bölmələrə və əməkdaşlara çatdırmaq;
- KİS-in daxili normativ sənədlərinin siyahısını tərtib etmək, onların hazırlanmasını, təsdiqini, yenidən baxılmasını təşkil etmək;
- daxili auditlər keçirmək və aşkar olunan uyğunsuzluqlar üzrə düzəliş tədbirlərinə kömək etmək;
- rəhbərlik tərəfindən sistemin təhlili üçün materiallar hazırlamaq;
- sertifikatlaşdırma və nəzarət auditlərinə hazırlığı təşkil etmək, onların nəticələrinə görə düzəliş tədbirlərində iştirak etmək;
- ISO 9000 standartları üzrə seminarlar keçirmək, əməkdaşlara yeni və dəyişdirilmiş sənədləri təqdim etmək.

## Komissiyanın hüquqları

- bölmələrdən iş üçün zəruri sənəd və məlumatları tələb etmək;
- bölmələrin plan üzrə və zəruri hallarda plandankənar auditini aparmaq, nəticələr üzrə rəy vermək və icrasına nəzarət etmək;
- rektorun əmri ilə digər bölmələrin əməkdaşlarını cəlb etməklə müvəqqəti və ya daimi işçi qruplar yaratmaq;
- normativ və metodiki sənədlərin layihələrini hazırlamaq və rektorun təsdiqinə təqdim etmək;
- keyfiyyətin artırılması üzrə rəhbərliyə təkliflər vermək, keyfiyyət siyasətini və sənədləri izah etmək üçün bölmələrdə iclaslar keçirmək.

## Sertifikatlar

Akademiyanın keyfiyyət idarəetmə sisteminin sertifikatları, akkreditasiya sənədləri və keyfiyyət sahəsində siyasəti [Akkreditasiya və sertifikatlar](/sertifikatlar) səhifəsindədir.`,
    seoDescription:
      'ADDA-nın keyfiyyəti idarəetmə sistemi (ISO 9001:2015): sənədlər, Daxili Audit Komissiyasının tərkibi, vəzifə və hüquqları (ADDA-ƏS-009).',
    facts: [
      { label: 'Standart', value: 'ISO 9001:2015', icon: 'qoruma' },
      { label: 'Daxili audit', value: '5 daimi üzv və işçi qrup', icon: 'qrup' },
      { label: 'Sənədlər', value: 'ADDA-ƏS əsasnamələri, ADDA-KP prosedurları', icon: 'sened' },
    ],
    sideLinks: [
      { label: 'Akkreditasiya və sertifikatlar', url: '/sertifikatlar' },
      { label: 'Keyfiyyət sahəsində siyasət', url: '/sertifikatlar#keyfiyyet-sahesinde-siyaset' },
      { label: 'Keyfiyyət və nəticələr', url: '/sehife/keyfiyyetin-monitorinqi' },
      REGISTRY_LINK,
      file(9, 'Daxili Audit Komissiyasının Əsasnaməsi (ADDA-ƏS-009)'),
    ],
    contact: `${PHONE}\n\n${MAIL}\n\nSualınızı [onlayn göndərin](${ASK}).`,
  },
};

export const ESASNAME_PAGES: QebulPageSeed[] = [
  REGISTRY_PAGE,
  HIMAYECILER_PAGE,
  MEZUNLAR_PAGE,
  TMS_PAGE,
  ILIN_TELEBESI_PAGE,
  EN_YAXSI_MUELLIM_PAGE,
  YDA_PAGE,
  KIS_PAGE,
];

// ── Bölmələr: yalnız BOŞ sahələr (az) ───────────────────────────────────────
export interface UnitFill {
  slug: string;
  mission: string;
  functions: string;
  services?: string;
  /** «Quruluş və idarəetmə» — bölmənin əlavə bloku yoxdursa. */
  structure: string;
}

const STRUCTURE_TITLE = 'Quruluş və idarəetmə';
export { STRUCTURE_TITLE };

export const UNIT_FILLS: UnitFill[] = [
  {
    slug: 'informasiya-resurs-merkezi',
    mission:
      'Akademiyanın informasiya-texnoloji təminatı, şəbəkə və saytın idarə edilməsi, «Elektron Akademiya» platformasının tətbiqi, kitabxana fondunun təşkili və oxuculara ənənəvi və elektron kitabxana xidməti.',
    functions: `- **Tədris və elm:** tədrisə, elmi tədqiqatlara və beynəlxalq əlaqələrə (onlayn konfrans və seminarlar daxil) informasiya dəstəyi.
- **Elektronlaşdırma:** tədris prosesinin elektronlaşdırılması üzrə Elmi Şuranın və rəhbərliyin qərarlarının icrası, yeni avadanlıq və texnologiyaların tətbiqinə dair təkliflər.
- **İnformasiya texnologiyaları:** avadanlığın profilaktikası və təmiri, kompüterlərin proqram təminatı, şəbəkəyə, internetə və İP telefoniyaya nəzarət (hər iki korpus, Təlim Tədris Mərkəzi, yataqxana, Dənizçilik Kolleci), yeni avadanlığın texniki parametrlərinin hazırlanması və qəbulu.
- **Sayt və «Elektron Akademiya»:** saytın idarə edilməsi və xəbərlərin üç dildə dərci, platformanın yeni modulları, təlimat kitabçaları və video dərslər.
- **Təhlükəsizlik və imtahanlar:** turniket və video-müşahidə sistemləri, vahid tələbə kartının məlumatları, imtahanlara texniki dəstək və sessiya imtahanlarının monitorinqi.
- **Kitabxana:** fondun komplektləşdirilməsi və yenilənməsi, çap məhsullarının qeydiyyatı, elektron kataloq və elektron kitabxana modulu, kitabxanalararası və beynəlxalq abonement.`,
    services: `- Oxu zalında və abonementdə kitab verilməsi, rezerv olunmuş kitabların təqdimi.
- Elektron kitabxana: dərsliklər, mühazirələr, kurs və laboratoriya işləri.
- İnformasiya axtarışı və biblioqrafiya üzrə köməklik.
- «Elektron Akademiya» üzrə müəllim və tələbələrə təlimat.
- Tədbirlərə texniki dəstək.`,
    structure: `Mərkəz Akademiyanın 09.09.2015 tarixli 1247/K nömrəli əmri ilə yaradılıb. Strukturuna müdir, müdir müavini, informasiya texnologiyaları üzrə baş mütəxəssis və mütəxəssis, mühəndis, kitabxana üzrə mütəxəssis, kitabxanaçı və mühəndis-elektronçu daxildir.

Mərkəzə rektorun təyin etdiyi müdir rəhbərlik edir. İş prorektorun təsdiq etdiyi illik plan, əməkdaşların fəaliyyəti isə fərdi iş planları üzrə təşkil olunur; müdir hər il rəhbərliyə hesabat verir. Əsasnamə Elmi Şuranın 29 dekabr 2023-cü il tarixli iclasında (protokol № 04) təsdiq olunub.`,
  },
  {
    slug: 'muhasibat-ucotu-ve-hesabati-sobesi',
    mission:
      'Akademiyanın maliyyə-təsərrüfat fəaliyyətinin mühasibat uçotu, əmək haqqının və xərclərin təyinatı üzrə ödənilməsi, maddi qiymətlilərin qorunması və hesabatların vaxtında təqdim edilməsi.',
    functions: `- Bütün maliyyə-təsərrüfat fəaliyyəti üzrə mühasibat uçotunun düzgün təşkili.
- Xərc maddələri üzrə vəsaitin təyinatı üzrə və səmərəli istifadəsinə nəzarət, maliyyə, büdcə və ştat intizamına riayət.
- Əmək haqqı fondunun xərclənməsi, vəzifə maaşlarının və əlavələrin ştat cədvəlinə uyğun hesablanması və ödənilməsi.
- Əmlakın, pul vəsaitinin və hesablaşmaların inventarizasiyası, maddi-məsul şəxslərin təlimatlandırılması, çatışmazlıq və mənimsəmə hallarının qarşısının alınması.
- Aylıq, rüblük və illik balansın və hesabatların tərtibi və ASCO-ya, Elm və Təhsil Nazirliyinə, Dövlət Vergi Xidmətinə, Statistika Komitəsinə, Əmək və Əhalinin Sosial Müdafiəsi Nazirliyinə təqdimi.
- Xəzinədarlıq orqanları ilə əməliyyatların üzləşdirilməsi və büdcə ilə hesablaşmalar.
- Kommersiya sirrinin və xidməti məlumatların qorunması.`,
    structure: `Şöbəyə rektorun təqdimatı əsasında ASCO-nun sədrinin təyin etdiyi baş mühasib rəhbərlik edir və şöbənin işinə şəxsən cavabdehdir. Şöbədə baş mühasibin müavini, iqtisadçı və iki mühasib çalışır; onları rektor təyin edir.

Şöbə öz işində Vergi və Əmək məcəllələrini, «Təhsil haqqında» Qanunu, ASCO-nun və Elm və Təhsil Nazirliyinin əmrlərini rəhbər tutur və ASCO-nun struktur vahidləri ilə qarşılıqlı əlaqədə işləyir.`,
  },
  {
    slug: PERSONAL,
    mission:
      'Akademiyanın kadr təminatı: işçilərin seçilməsi, uçotu və yerləşdirilməsi, əmək haqqı sisteminin tətbiqi, ştat cədvəlləri, attestasiya və ixtisasartırmanın təşkili.',
    functions: `- Bölmələrin rəhbər, mühəndis-texniki və ixtisaslı kadrlara tələbatının planlaşdırılması, mütəxəssislərin seçilməsi və işə qəbulun rəsmiləşdirilməsi.
- Kadr ehtiyatının formalaşdırılması, kadr axınının azaldılması, gənc mütəxəssislərdən səmərəli istifadə (Həmkarlar İttifaqı Komitəsi ilə birlikdə).
- Əmək haqqı sisteminin, vəzifə maaşlarının və əlavələrin tətbiqi; ştat cədvəllərinin hazırlanması və dəyişdirilməsi.
- İşə qəbul, yerdəyişmə, işdən azad etmə, həvəsləndirmə və intizam tənbehi barədə əmrlərin hazırlanması.
- Şəxsi işlər, uçot vərəqələri və əmək kitabçaları, tabel uçotu, məzuniyyət cədvəlləri, ezamiyyət və ixtisasartırmanın rəsmiləşdirilməsi.
- İşçilərin attestasiyasının təşkili, təltiflərə təqdimatların hazırlanması, təqaüdə çıxan işçilərin sənədləri.
- Kadr işinin SAP ERP sistemində və elektron sənəd dövriyyəsində aparılması, səmərəlilik göstəricilərinin təhlili.
- Əmək mübahisələrinin nizamlanmasında iştirak, əmək münasibətləri və əmək haqqı ilə bağlı müraciətlərə cavab.`,
    structure: `Şöbə müdirdən, personal və əmək haqqı üzrə mütəxəssislərdən ibarətdir. Müdiri rektor təyin edir və vəzifədən azad edir; müdir şöbənin işini təşkil edir, vəzifə bölgüsü aparır və şöbənin vəzifələrinin icrasına görə cavabdehdir.

Şöbə öz işində Əmək Məcəlləsini, «Təhsil haqqında» Qanunu, Akademiyanın Nizamnaməsini və ASCO sədrinin əmrlərini rəhbər tutur. Əsasnamə Elmi Şuranın 29 dekabr 2023-cü il tarixli iclasında (protokol № 04) təsdiq olunub.`,
  },
  {
    slug: 'metbee',
    mission:
      'Tədris, elmi-tədqiqat və tərbiyə prosesləri üçün lazım olan nəşriyyat-poliqrafiya materiallarının hazırlanması və çapı.',
    functions: `- Tədris, elmi-tədqiqat və tərbiyə proseslərinə lazım olan bütün nəşriyyat-poliqrafiya materiallarının hazırlanması və çapı.
- Tematik plan üzrə əsərlərin çapı, nəşr planının yerinə yetirilməsində iştirak.
- Kitabxana fondunun zənginləşdirilməsi üçün materialların hazırlanması.
- Nəşriyyat-poliqrafiya məhsullarının istehsal proqramının tərtibi.
- Müəlliflərin elektron sənəd dövriyyəsi ilə göndərdiyi və rəhbərliyin təsdiq etdiyi təqdimatlar əsasında tapşırıqların icrası.
- Avadanlıqdan səmərəli istifadə, işin sənədləşdirilməsi və mühasibatlığa təhvili.`,
    structure: `Mətbəəyə rektorun təyin etdiyi müdir rəhbərlik edir; strukturunu və işçilərin sayını rektor müəyyən edir. Müdir mətbəənin fəaliyyətinə, istismarına və daxili nizam-intizam qaydalarına əməl olunmasına bilavasitə rəhbərlik edir.

Mətbəə nəşriyyat-poliqrafiya sərgilərində, seminar və yığıncaqlarda Akademiyanı təmsil edə, tapşırıqları həll etmək üçün bölmələrdən material və məlumat ala bilər.`,
  },
];

// ── Mövcud səhifələrə əsasnamə keçidi ────────────────────────────────────────
export interface PageLink {
  slug: string;
  link: LinkSeed;
}

export const PAGE_LINKS: PageLink[] = [
  { slug: 'tecrube-haqqinda', link: file(8, 'Təcrübə haqqında Əsasnamə (ADDA-ƏS-008)') },
  { slug: 'yataqxana', link: file(17, 'Tələbə yataqxanasının Əsasnaməsi (ADDA-ƏS-017)') },
  { slug: 'doktorantura', link: file(10, 'Doktorantların attestasiyası haqqında Əsasnamə (ADDA-ƏS-010)') },
  { slug: 'keyfiyyetin-monitorinqi', link: { label: 'Keyfiyyəti idarəetmə sistemi', url: '/sehife/keyfiyyet-idareetme-sistemi' } },
  { slug: 'telebe-heyati', link: { label: '«İlin tələbəsi» müsabiqəsi', url: '/sehife/ilin-telebesi' } },
];
