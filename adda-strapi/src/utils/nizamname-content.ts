/**
 * F5.54 — «Azərbaycan Dövlət Dəniz Akademiyasının Nizamnaməsi» (Nazirlər Kabinetinin
 * 21.09.2022 tarixli 361 nömrəli Qərarı ilə təsdiq edilib) — RƏSMİ MƏTN.
 *
 * Mənbə: admində 16.10.2026-da yaradılan səhifə (/sehife/az-rbaycan-doevl-t-d-niz-
 * akademiyasinin-nizamnam-si) — PDF-dən köçürülmüş sətirlər (bənd ortasında sətir
 * sonu, bölmə bir paraqraf). Mətn DƏYİŞMƏYİB: yalnız sətirlər bəndlərə birləşdirilib,
 * bölmələr «##» başlıq (mündəricat), 2-ci səviyyə bəndlər paraqraf, 3-cü səviyyə
 * siyahı. Yoxlama (scratchpad f554/charter_md.py): boşluq və işarələr nəzərə
 * alınmadan mənbə ilə simvol-simvol eynidir.
 *
 * Səhifə: /sehife/nizamname (layout=akademiya), köhnə ünvan 301 ilə (next.config.js).
 */
import type { QebulPageSeed } from './qebul-pages-content';
import { ACADEMY_PHONE_AZ } from './phone-fix';

export const CHARTER_SLUG = 'nizamname';
/** Admində yaradılan səhifənin ünvanı (Strapi uid «ə»-ni atıb). */
export const CHARTER_OLD_SLUG = 'az-rbaycan-doevl-t-d-niz-akademiyasinin-nizamnam-si';
/** Mənbə mətnin hələ toxunulmadığını göstərən cümlə (PDF sətir sonu ilə). */
export const CHARTER_RAW_MARK = '1.1. Azərbaycan Dövlət Dəniz Akademiyası (bundan sonra – Akademiya) Azərbaycan Respublikası Nazirlər';

const CHARTER_BODY = `_Azərbaycan Respublikası Nazirlər Kabinetinin 2022-ci il 21 sentyabr tarixli 361 nömrəli Qərarı ilə təsdiq edilmişdir._

## 1. Ümumi müddəalar

**1.1.** Azərbaycan Dövlət Dəniz Akademiyası (bundan sonra – Akademiya) Azərbaycan Respublikası Nazirlər Kabinetinin 1996-cı il 15 iyul tarixli 91 nömrəli Qərarı ilə yaradılmışdır. Akademiya “Azərbaycan Xəzər Dəniz Gəmiçiliyi” Qapalı Səhmdar Cəmiyyətinin (bundan sonra – ASCO) tabeliyində fəaliyyət göstərir.

**1.2.** Akademiya ictimai əhəmiyyət daşıyan fəaliyyətlə məşğul olub, “Təhsil haqqında” Azərbaycan Respublikasının Qanununa uyğun olaraq dəniz nəqliyyatı sahəsində müvafiq səviyyələr üzrə ali təhsil, habelə orta ixtisas və əlavə təhsil proqramlarını həyata keçirən, “Elm haqqında” Azərbaycan Respublikasının Qanununa əsasən fundamental, nəzəri-metodoloji, pedaqoji-metodiki və tətbiqi elmi tədqiqatlar aparan publik hüquqi şəxsdir.

**1.3.** Akademiya öz fəaliyyətində Azərbaycan Respublikasının Konstitusiyasını, Beynəlxalq Dəniz Təşkilatının “Dənizçilərin hazırlanmasına, onlara diplom verilməsinə və növbə çəkməyə dair” 1978-ci il Beynəlxalq Konvensiyasının (əlavələrlə birlikdə) tələblərini, Azərbaycan Respublikasının Mülki Məcəlləsini, “Publik hüquqi şəxslər haqqında”, “Təhsil haqqında”, “Elm haqqında” Azərbaycan Respublikasının qanunlarını, Azərbaycan Respublikası Prezidentinin fərman və sərəncamlarını, bu Nizamnaməni, Azərbaycan Respublikası Nazirlər Kabinetinin digər qərar və sərəncamlarını, habelə Azərbaycan Respublikasının digər normativ hüquqi aktlarını və ASCO-nun Nizamnaməsini, əmr və sərəncamlarını rəhbər tutur.

**1.4.** Akademiyanın müstəqil balansı, istifadəsində olan dövlət əmlakı, bank hesabı, üzərində ASCO-nun adı, həmçinin öz adı həkk olunmuş möhürü, müvafiq ştampları və blankları vardır.

**1.5.** Akademiya “Hüquqi şəxslərin dövlət qeydiyyatı və dövlət reyestri haqqında” Azərbaycan Respublikasının Qanunu ilə müəyyən edilmiş qaydada Azərbaycan Respublikasının İqtisadiyyat Nazirliyi yanında Dövlət Vergi Xidməti tərəfindən dövlət qeydiyyatına alındıqdan sonra hüquqi şəxs statusu əldə edir. Akademiyanın hüquq qabiliyyətinə onun ləğvinin başa çatdığı an xitam verilir.

**1.6.** Akademiya öz vəzifələrini yerinə yetirərkən və hüquqlarını həyata keçirərkən, dövlət orqanları (qurumları) ilə, yerli özünüidarəetmə orqanları ilə, beynəlxalq və qeyri-hökumət təşkilatları, habelə digər hüquqi və fiziki şəxslərlə qarşılıqlı əlaqədə fəaliyyət göstərir.

**1.7.** Qanuna uyğun olaraq Akademiyanın əqdlər bağlamaq, öz adından əmlak və qeyri-əmlak hüquqları əldə etmək və həyata keçirmək hüququ, həmçinin vəzifələri vardır. Akademiya məhkəmədə iddiaçı və ya cavabdeh qismində çıxış edə bilər.

**1.8.** Akademiya “Təhsil haqqında” Azərbaycan Respublikasının Qanununa, onun elmi qurumları isə “Elm haqqında” Azərbaycan Respublikasının Qanununa uyğun olaraq akkreditasiya edilir.

**1.9.** Akademiyada siyasi partiyaların və dini qurumların strukturlarının yaradılmasına və fəaliyyətinə yol verilmir.

**1.10.** Akademiyanın ali təhsil sahəsində beynəlxalq əlaqələri “Təhsil haqqında” Azərbaycan Respublikasının Qanununa uyğun olaraq həyata keçirilir.

**1.11.** Akademiya Bakı şəhəri, Səbail rayonu, Zərifə Əliyeva küçəsi, 18 ünvanında (hüquqi ünvan) yerləşir.

## 2. Akademiyanın fəaliyyətinin istiqamətləri

**2.1.** Akademiyanın fəaliyyət istiqamətləri aşağıdakılardır:

- **2.1.1.** bakalavriat təhsil səviyyəsində tam orta təhsil və orta ixtisas təhsili bazasında ayrı-ayrı ixtisasların təhsil proqramları üzrə ali təhsilli mütəxəssislərin hazırlanması;
- **2.1.2.** magistratura təhsil səviyyəsində ixtisaslaşmalar üzrə hər hansı ixtisas sahəsinin elmi tədqiqat və ya peşəkar məqsədlər üçün daha dərindən öyrənilməsi;
- **2.1.3.** doktorantura təhsil səviyyəsində yüksəkixtisaslı elmi kadrların hazırlanması, ixtisas və elmi dərəcələrin yüksəldilməsi;
- **2.1.4.** orta ixtisas və əlavə təhsil proqramlarının həyata keçirilməsi;
- **2.1.5.** elmin müxtəlif sahələri və istiqamətləri üzrə tədqiqatlar aparılması.

## 3. Akademiyanın vəzifələri və hüquqları

**3.1.** Bu Nizamnamə ilə müəyyən edilmiş fəaliyyət istiqamətlərinə uyğun olaraq, Akademiyanın vəzifələri aşağıdakılardır:

- **3.1.1.** ali təhsil sahəsində dövlət siyasətinin həyata keçirilməsində iştirak etmək;
- **3.1.2.** dövlət təhsil standartlarına uyğun olaraq, təhsilalanların zəruri biliyə və həyati bacarıqlara yiyələnməsini təmin etmək;
- **3.1.3.** hər bir təhsilalanın intellektual, mədəni və mənəvi inkişafını, təhsilalma tələblərini ödəmək;
- **3.1.4.** təlim-tərbiyə prosesini yüksək səviyyədə təşkil etmək və onun monitorinqini həyata keçirmək;
- **3.1.5.** təlim-tərbiyə prosesində innovativ texnologiyalardan və yeni təlim üsullarından istifadə etmək;
- **3.1.6.** ali təhsilin müvafiq səviyyələri üzrə yüksəkixtisaslı mütəxəssislərin, elmi və elmi-pedaqoji kadrların hazırlanmasını həyata keçirmək;
- **3.1.7.** profilinə uyğun olaraq, elmin müxtəlif sahələri və istiqamətləri üzrə fundamental, nəzəri-metodoloji, pedaqoji-metodiki və tətbiqi elmi tədqiqatlar aparmaq və elmi-metodiki sənədlər hazırlamaq;
- **3.1.8.** dövlət təhsil standartlarına və ayrı-ayrı pillələr və ixtisaslar (ixtisaslaşmalar) üzrə təhsil proqramlarına uyğun tədris sənədlərini və tədris prosesinin təşkilinə aid digər sənədləri səlahiyyətləri çərçivəsində hazırlamaq;
- **3.1.9.** elmi, ixtisaslaşdırılmış və dissertasiya şuralarının işini təşkil etmək və həyata keçirmək;
- **3.1.10.** fəaliyyət istiqamətlərinə aid məsələlərlə bağlı Akademiyanın beynəlxalq fəaliyyətini və xarici əlaqələrini təmin etmək;
- **3.1.11.** qabaqcıl beynəlxalq təcrübəni nəzərə almaqla, fəaliyyət istiqamətlərinə aid məsələlərlə bağlı elmi-texniki nailiyyətlərin tətbiqini təmin etmək;
- **3.1.12.** “Təhsil haqqında” Azərbaycan Respublikasının Qanununa uyğun olaraq, iaşə xidmətini, tibbi və psixoloji xidməti təşkil etmək və “Psixoloji yardım haqqında” Azərbaycan Respublikası Qanununun tələblərinə riayət edilməklə, psixoloji yardım həyata keçirmək;
- **3.1.13.** hər bir təhsilalanın, valideynin və ya digər qanuni nümayəndənin Akademiyanın nizamnaməsi və dövlət akkreditasiyası haqqında sənədlə tanış olmasına şərait yaratmaq;
- **3.1.14.** Akademiyanın əməkdaşlarının əlavə təhsili və peşəkarlığının yüksəldilməsi üçün tədbirlər görmək;
- **3.1.15.** fəaliyyət istiqamətlərinə aid məsələlərlə bağlı inzibati xəta və cinayət əlamətləri aşkar etdikdə, aidiyyəti üzrə məlumat vermək;
- **3.1.16.** Akademiyanın fəaliyyəti ilə bağlı daxil olan müraciətlərə “Vətəndaşların müraciətləri haqqında”, “İnzibati icraat haqqında” və “İnformasiya əldə etmək haqqında” Azərbaycan Respublikasının qanunlarına uyğun olaraq baxmaq və qanunla müəyyən edilmiş qaydada tədbirlər görmək;
- **3.1.17.** öz fəaliyyəti haqqında əhalinin məlumatlandırılmasını, rəsmi internet saytının yaradılmasını, malik olduğu və siyahısı “İnformasiya əldə etmək haqqında” Azərbaycan Respublikasının Qanunu ilə müəyyən edilmiş açıqlanmalı olan ictimai informasiyanın həmin saytda yerləşdirilməsini və bu informasiyanın daim yenilənməsini təmin etmək;
- **3.1.18.** Akademiyaya ayrılan büdcə vəsaitindən, kredit, qrant və digər maliyyə vəsaitindən təyinatı üzrə səmərəli istifadə olunmasını təmin etmək;
- **3.1.19.** dövlət və kommersiya sirrinin, habelə məxfilik rejiminin qorunması üçün tədbirlər görmək;
- **3.1.20.** Akademiyanın informasiya təminatını təşkil etmək və onun təhlükəsizliyini təmin etmək;
- **3.1.21.** Akademiyanın strukturunun və fəaliyyətinin təkmilləşdirilməsi üçün tədbirlər görmək;
- **3.1.22.** maddi-texniki və tədris bazasının möhkəmləndirilməsi və genişləndirilməsi istiqamətində işlər görmək;
- **3.1.23.** “Təhsil Mərkəzləşdirilmiş İnformasiya Sistemi”nə və “Tələbə-məzun” dövlət elektron məlumat sisteminə qoşulmaq;
- **3.1.24.** kargüzarlığı və vətəndaşların qəbulunu müvafiq normativ hüquqi aktların tələblərinə uyğun təşkil etmək;
- **3.1.25.** “Təhsil haqqında” Azərbaycan Respublikasının Qanununa uyğun olaraq təhsil haqqında dövlət sənədi, habelə müvafiq arayış vermək;
- **3.1.26.** “Təhsil haqqında” və “Elm haqqında” Azərbaycan Respublikasının qanunlarından, habelə bu Nizamnamədən irəli gələn digər vəzifələri yerinə yetirmək.

**3.2.** Öz vəzifələrini yerinə yetirmək üçün Akademiyanın aşağıdakı hüquqları vardır:

- **3.2.1.** müvafiq struktur bölmələrində ASCO-nun və Azərbaycan Respublikası Elm və Təhsil Nazirliyinin (bundan sonra – Nazirlik) razılığı ilə orta ixtisas təhsili həyata keçirmək;
- **3.2.2.** “Təhsil haqqında” Azərbaycan Respublikasının Qanununa və bu Nizamnaməyə uyğun olaraq vətəndaşların əlavə təhsil almasını təşkil etmək;
- **3.2.3.** xarici dövlətlərin ali təhsil müəssisələri ilə bağlanılmış ikitərəfli və çoxtərəfli müqavilələrə uyğun olaraq, beynəlxalq təhsil proqramları həyata keçirmək;
- **3.2.4.** “Təhsil haqqında” Azərbaycan Respublikasının Qanununa və bu Nizamnaməyə uyğun olaraq, Azərbaycan Respublikasında və xarici dövlətlərin ərazisində filiallar (Azərbaycan Respublikasının Nazirlər Kabineti ilə razılaşdırmaqla), idarə və nümayəndəliklər açmaq, təsərrüfat cəmiyyətləri yaratmaq və ya onlarda iştirak etmək, habelə təhsilin inkişafı və təkmilləşdirilməsi məqsədilə ictimai təşkilatlarla təhsil birlikləri, assosiasiyaları və ittifaqları yaratmaq, eləcə də bu kimi təşkilatlara üzv olmaq;
- **3.2.5.** “Azərbaycan Respublikasının beynəlxalq müqavilələrinin bağlanması, icrası və ləğv edilməsi qaydaları haqqında” Azərbaycan Respublikasının Qanununa və özünün fəaliyyət xüsusiyyətlərinə uyğun olaraq, xarici ölkələrin ali təhsil müəssisələri, təşkilatları ilə, beynəlxalq qurumlarla və fondlarla əlaqələr yaratmaq, əməkdaşlıq haqqında müqavilələr bağlamaq və qarşılıqlı əməkdaşlığın digər formalarını həyata keçirmək;
- **3.2.6.** elmi əsərlər, dərslik, dərs vəsaiti, tədris və tədris-metodik ədəbiyyat hazırlamaq və nəşr etmək;
- **3.2.7.** “Təhsil haqqında” və “Publik hüquqi şəxslər haqqında” Azərbaycan Respublikasının qanunları ilə müəyyən edilmiş qaydada sahibkarlıq fəaliyyəti ilə məşğul olmaq;
- **3.2.8.** təhsilalanlar və əməkdaşlar üçün idman, sağlamlıq, iaşə, məişət xidmətləri təşkil etmək və göstərmək;
- **3.2.9.** fəxri professor (doktor) adı vermək;
- **3.2.10.** fəaliyyət istiqamətlərinə aid məsələlərlə bağlı araşdırmalar aparmaq, işçi qruplar və komissiyalar yaratmaq;
- **3.2.11.** dövlət orqanlarına (qurumlarına), yerli özünüidarəetmə orqanlarına, hüquqi və fiziki şəxslərə zəruri məlumatlar (sənədlər) barədə sorğu vermək və onlardan belə məlumatları (sənədləri) almaq;
- **3.2.12.** fəaliyyət istiqamətləri üzrə rəy və təkliflər vermək, təhlillər və ümumiləşdirmələr aparmaq, analitik materiallar hazırlamaq;
- **3.2.13.** müstəqil ekspertləri və mütəxəssisləri qanunvericiliklə müəyyən edilmiş qaydada öz fəaliyyətinə cəlb etmək;
- **3.2.14.** fəaliyyət istiqamətlərinə aid məsələlərlə bağlı konfranslar, müşavirələr, seminarlar keçirmək və digər tədbirlər təşkil etmək;
- **3.2.15.** əməkdaşlarını dövlət təltiflərinə və digər mükafatlara təqdim etmək, onların həvəsləndirilməsi üçün tədbirlər görmək;
- **3.2.16.** tabeliyində olan təlim-tədris mərkəzi vasitəsilə dəniz nəqliyyatı sahəsində keçirilmiş təlimlərlə bağlı müvafiq sertifikatların verilməsini təşkil etmək;
- **3.2.17.** “Təhsil haqqında” və “Elm haqqında” Azərbaycan Respublikasının qanunlarından və bu Nizamnamədən irəli gələn, habelə bu Nizamnamə ilə müəyyən edilmiş digər hüquqları həyata keçirmək.

**3.3.** Akademiyada təhsil dövlət hesabına və (və ya) ödənişli əsaslarla həyata keçirilir. Qanunvericiliklə müəyyən edilmiş şəxslərin Akademiyada təhsil xərcləri müvafiq qaydada dövlət büdcəsinin vəsaiti hesabına ödənilir.

**3.4.** Ali təhsil proqramlarına və onların həyata keçirilməsinə qoyulan ümumi tələbləri Azərbaycan Respublikasının Nazirlər Kabineti ali təhsil pilləsi üzrə təsdiq edilən dövlət təhsil standartı ilə müəyyənləşdirir.

**3.5.** Akademiyada tədris ali təhsil pilləsi üzrə təhsilin məzmununu və mənimsənilməsi qaydalarını müəyyən edən və Nazirliyin təsdiq etdiyi təhsil proqramları ilə həyata keçirilir.

**3.6.** Akademiyada təlim-tərbiyə prosesinin təşkili ilə bağlı digər məsələlər “Təhsil haqqında” və “Elm haqqında” Azərbaycan Respublikasının qanunlarına, həmçinin həmin qanunlardan irəli gələrək Azərbaycan Respublikası Nazirlər Kabinetinin və Nazirliyin müəyyən etdiyi qaydalara uyğun olaraq həyata keçirilir.

## 4. Akademiyanın idarə olunması

**4.1.** Akademiya aşkarlıq, şəffaflıq və demokratiklik prinsipləri əsas tutulmaqla, “Təhsil haqqında”, “Elm haqqında”, “Publik hüquqi şəxslər haqqında” Azərbaycan Respublikasının qanunlarına və bu Nizamnaməyə uyğun olaraq idarə edilir.

**4.2.** Akademiyanın təsisçisinin səlahiyyətləri aşağıdakılardır:

- **4.2.1.** Akademiyanın nizamnaməsinin təsdiq olunması və nizamnamə fondunun miqdarının müəyyən edilməsi, onların dəyişdirilməsi;
- **4.2.2.** Akademiyanın idarəetmə orqanlarının yaradılması;
- **4.2.3.** rektor istisna olmaqla, Akademiyanın idarəetmə orqanlarının rəhbərlərinin (üzvlərinin) vəzifəyə təyin və vəzifədən azad edilməsi;
- **4.2.4.** inkişaf istiqamətlərinin müəyyən edilməsi, illik maliyyə hesabatlarının təsdiqi;
- **4.2.5.** Akademiyanın strukturunun təsdiqi;
- **4.2.6.** təsərrüfat cəmiyyətlərinin yaradılmasına və ya onlarda iştirak etməyə, idarə, filial və nümayəndəliklərin yaradılmasına razılıq verilməsi;
- **4.2.7.** xalis aktivlərinin dəyərinin 25 faizindən artıq məbləğdə olan əqdin (xüsusi əhəmiyyətli əqdin), habelə Akademiyaya aidiyyəti olan şəxslərlə əqdin (əqdin dəyəri aktivlərin 5 faiz və daha çox hissəsini təşkil etdikdə) bağlanılmasına razılıq verilməsi;
- **4.2.8.** nizamnaməsində nəzərdə tutulmayan məqsədlər üçün Akademiyanın mənfəətinin dövlət büdcəsinə köçürülməsi barədə qərar qəbul edilməsi;
- **4.2.9.** Akademiyanın yenidən təşkil və ləğv edilməsi.

**4.3.** Bu Nizamnamədə dəyişikliklər Akademiyanın Elmi Şurasında müzakirə olunur və təsdiq olunmaq üçün aidiyyəti üzrə Azərbaycan Respublikasının Nazirlər Kabinetinə təqdim edilir.

**4.4.** Akademiyaya münasibətdə təsisçinin səlahiyyətlərini (Akademiyanın rektorunun vəzifəyə təyin və ya vəzifədən azad edilməsi, həmçinin bu Nizamnamənin 4.2.1-ci, 4.2.2-ci və 4.2.9-cu yarımbəndlərində nəzərdə tutulmuş səlahiyyətlər istisna olmaqla) ASCO həyata keçirir.

**4.5.** Akademiyanın ali idarəetmə orqanı Elmi Şuradır. Elmi Şuranın yaradılması, səlahiyyətləri və fəaliyyətinin təşkili qaydası Nazirliyin təsdiq etdiyi müvafiq əsasnamə və bu Nizamnamə ilə müəyyən olunur.

**4.6.** Akademiyanın strateji inkişaf məsələləri üzrə idarəetmə orqanı ictimai əsaslarla fəaliyyət göstərən Himayəçilər Şurasıdır. Himayəçilər Şurasının tərkibini 5 nəfər olmaqla, ASCO təsdiq edir. Himayəçilər Şurasının yaradılması, səlahiyyətləri və fəaliyyətinin təşkili qaydası Nazirliyin təsdiq etdiyi əsasnamə və bu Nizamnamə ilə müəyyən olunur.

**4.7.** Akademiyanın tədris-metodiki işlərinin həyata keçirilməsi üçün Himayəçilər Şurası tərəfindən Elmi-metodiki Şura yaradılır. Elmi-metodiki Şuranın yaradılması qaydası və səlahiyyətləri Himayəçilər Şurasının təsdiq etdiyi əsasnamə ilə müəyyən olunur.

**4.8.** Akademiyanın cari fəaliyyətinə Azərbaycan Respublikasının Prezidenti vəzifəyə təyin və ya vəzifədən azad etdiyi rektor rəhbərlik edir.

**4.9.** Rektor Akademiyanın mənafeləri üçün vəzifələrini yerinə yetirərkən, vicdanla, peşəkar qaydada və məntiqlə hərəkət etməyə, Akademiyanın maraqlarına sadiq olmağa, onun maraqlarını öz maraqlarından üstün tutmağa, ehtiyatlı olmağa, qərarların qəbulu zamanı ədalətli və qərəzsiz olmağa, habelə adına xələl gətirə biləcək hərəkətlərə və çıxışlara yol verməməyə borcludur.

**4.10.** Rektorun fəaliyyətinin təşkili qaydası Nazirliyin təsdiq etdiyi əsasnamə və bu Nizamnamə ilə müəyyən olunur.

**4.11.** Rektor:

- **4.11.1.** Akademiyanın cari fəaliyyətinə rəhbərlik edir və bu fəaliyyət üçün şəxsən məsuliyyət daşıyır;
- **4.11.2.** Akademiyanı dövlət orqanları (qurumları), yerli özünüidarəetmə orqanları, beynəlxalq qurumlarla, digər hüquqi və fiziki şəxslərlə təmsil edir;
- **4.11.3.** Akademiyanın fəaliyyətinin təşkili ilə əlaqədar icrası məcburi olan daxili sərəncam və əmrlər verir;
- **4.11.4.** təsisçinin səlahiyyətlərinin həyata keçirilməsi üçün ASCO-ya təkliflər verir və sənədlər (o cümlədən Akademiyanın maliyyə hesabatını və fəaliyyətinə dair illik hesabatı) təqdim edir;
- **4.11.5.** müəyyən edilmiş struktur daxilində əməyin ödənişi fondunu, işçilərin say həddini və ştat cədvəlini, habelə ASCO ilə razılaşdırmaqla xərclər smetasını təsdiq edir;
- **4.11.6.** Akademiyanın daxili intizam qaydalarını və işçilərin vəzifə təlimatlarını təsdiq edir;
- **4.11.7.** Akademiyanın işçilərinin (prorektorlar və daxili audit bölməsinin əməkdaşları istisna olmaqla), onun idarə, filial və nümayəndəliklərinin, habelə tabeliyindəki digər qurumların rəhbərlərinin ASCO ilə razılaşdırmaqla vəzifəyə təyin və vəzifədən azad edilməsinə, onlar barəsində həvəsləndirmə və intizam tənbehi tədbirləri görülməsinə dair qərarlar qəbul edir;
- **4.11.8.** Akademiyanın fəaliyyət istiqamətlərinə dair qəbul olunmuş aktların icrasını təşkil edir, yoxlayır və buna nəzarəti həyata keçirir;
- **4.11.9.** Elmi Şuranın qərarlarını təsdiq edir, onun və digər idarəetmə orqanlarının qərarlarını həyata keçirir;
- **4.11.10.** özünün və Akademiyanın vəzifəli şəxslərinin qanunvericiliyə zidd olan qərarlarını ləğv edir;
- **4.11.11.** Elmi Şura qarşısında elm və tədris məsələlərinə dair, Himayəçilər Şurası qarşısında Akademiyanın cari fəaliyyətinə dair hesabatlar verir;
- **4.11.12.** ASCO tərəfindən təsdiq olunan əməyin ödənişi fondu çərçivəsində Akademiya işçilərinə vəzifə maaşlarının, vəzifə maaşlarına əlavələrin, mükafatların və digər ödənişlərin verilməsini təşkil edir;
- **4.11.13.** Akademiyanın əmlakından bu Nizamnamədə nəzərdə tutulmuş məqsədlərə uyğun istifadə olunmasına nəzarət edir, habelə Nizamnamənin 3.1.18-ci yarımbəndində nəzərdə tutulan vəsaitdən təyinatı üzrə səmərəli istifadə olunmasını təmin edir;
- **4.11.14.** bu Nizamnamə ilə müəyyən edilmiş səlahiyyətlər çərçivəsində Akademiyanın adından əməliyyatlar aparır, müqavilələr (o cümlədən ASCO-nun razılığı ilə Akademiyanın xalis aktivlərinin dəyərinin 25 faizindən artıq məbləğdə olan əqd (xüsusi əhəmiyyətli əqd) və aidiyyəti şəxslə dəyəri Akademiyanın aktivlərinin 5 faizini və daha çox, həmçinin 5 faizədək hissəsini təşkil edən əqd) bağlayır və onların yerinə yetirilməsini təmin edir;
- **4.11.15.** fəaliyyət istiqamətlərinə aid məsələlərlə bağlı komissiyalar və işçi qruplar yaradır;
- **4.11.16.** fəaliyyət istiqamətləri üzrə dövlət sirrinin və məxfilik rejiminin, habelə qanunla qorunan digər məlumatların mühafizəsi üçün zəruri tədbirlər görür;
- **4.11.17.** kargüzarlıq və arxiv işinin aparılmasını təmin edir;
- **4.11.18.** müraciətlərə baxılmanı və vətəndaşların qəbulunu təmin edir;
- **4.11.19.** kənar auditorun yoxlamalarının, habelə digər yoxlamaların nəticələrinə dair tədbirlər görür;
- **4.11.20.** Akademiyanın cari fəaliyyəti ilə bağlı, habelə digər idarəetmə orqanlarının səlahiyyətlərinə aid edilməyən məsələləri həll edir;
- **4.11.21.** bu Nizamnaməyə uyğun olaraq Akademiyanın fəaliyyəti ilə bağlı ASCO-nun müvafiq qərarlarının icrasını və daxili sənədlərinin tələblərinə əməl olunmasını təmin edir.

**4.12.** Akademiyanın 2 (iki) prorektoru vardır. Prorektorları Akademiyanın rektorunun təqdimatı əsasında ASCO təyin edir. Rektor olmadıqda Akademiyanın fəaliyyətinə rəhbərliyi ASCO tərəfindən müəyyən edilən prorektor həyata keçirir.

**4.13.** Akademiya təhsil kompleksi və kampus formasında da fəaliyyət göstərə bilər. Akademiyanın strukturunda onun profilinə uyğun istehsal, klinik, elmi tədqiqat, yaradıcılıq müəssisəsi və təşkilatları yaradıla bilər.

**4.14.** Akademiyada elmi-pedaqoji (professor-müəllim heyəti, elmi işçilər), mühəndis-texniki, inzibati, inzibati-təsərrüfat, tədris-köməkçi və digər heyətlər üzrə vəzifələr nəzərdə tutulur. Professor-müəllim heyəti, dekan və kafedra müdiri vəzifələrinin tutulması seçki, digərləri isə (prorektorlar istisna olmaqla) qanunvericiliyə və ASCO-nun aidiyyəti daxili sənədlərinə uyğun olaraq təyinat yolu ilə həyata keçirilir və Akademiyanın rektorunun əmri ilə rəsmiləşdirilir.

**4.15.** Təhsilalanların, təhsilverənlərin, Akademiyanın inzibati, inzibati-idarəetmə, inzibati-təsərrüfat və digər heyətinin hüquq və vəzifələri Azərbaycan Respublikasının Əmək Məcəlləsi, “Təhsil haqqında” və “Elm haqqında” Azərbaycan Respublikasının qanunları, bu Nizamnamə və daxili intizam qaydaları ilə, eləcə də Akademiya ilə əmək münasibətləri olan şəxslərə münasibətdə, eyni zamanda əmək müqavilələri ilə tənzimlənir.

## 5. Akademiyanın nizamnamə fondu, əmlakı və maliyyə fəaliyyətinin əsasları

**5.1.** Akademiyanın nizamnamə fondu 21.750.138 (iyirmi bir milyon yeddi yüz əlli min yüz otuz səkkiz) manatdır və əmlak formasındadır. Nizamnamə fondu qanunla müəyyən edilmiş qaydada Akademiyanın mülkiyyətindəki qiymətləndirilmiş aktivlərin balans dəyərindən təşkil olunur.

**5.2.** Akademiyanın əmlakı nizamnamə fondundan, təsisçinin ona verdiyi digər əmlakdan, dövlət büdcəsindən ayrılan vəsaitdən, fəaliyyətindən əldə olunmuş gəlirdən, o cümlədən ödənişli təhsildən əldə edilən vəsaitdən, ianələrdən, qrantlardan, cəlb edilən investisiyalardan və qanunla qadağan olunmayan digər vəsaitdən formalaşdırılır.

**5.3.** Akademiyanın balansında olan dövlət əmlakına münasibətdə səlahiyyətləri Azərbaycan Respublikası Prezidentinin “Dövlət əmlakının qorunub saxlanılması və səmərəli istifadə edilməsinin təkmilləşdirilməsi haqqında” 2007-ci il 6 iyun tarixli 586 nömrəli və “Azərbaycan Xəzər Dəniz Gəmiçiliyi” Qapalı Səhmdar Cəmiyyətinin fəaliyyətinin təşkili haqqında” Azərbaycan Respublikası Prezidentinin 2014-cü il 10 yanvar tarixli 213 nömrəli Sərəncamında dəyişikliklər edilməsi və “Azərbaycan Xəzər Dəniz Gəmiçiliyi” Qapalı Səhmdar Cəmiyyətinin fəaliyyətinin təkmilləşdirilməsi ilə bağlı əlavə tədbirlər barədə” 2016-cı il 9 mart tarixli 827 nömrəli fərmanları ilə müəyyən edilmiş qaydada həyata keçirilir.

**5.4.** Akademiya ona verilmiş əmlakdan yalnız Nizamnaməsi ilə müəyyən olunmuş məqsədlərə uyğun istifadə edir. Akademiyanın əmlakından təhsildənkənar məqsədlər üçün istifadə edilməsi qadağandır.

**5.5.** Bu Nizamnamənin 5.3-cü bəndi nəzərə alınmaqla, Akademiya əmlakı üzərində sahiblik və istifadə hüquqlarını məqsədlərinə uyğun olaraq sərbəst, sərəncam vermək hüququnu isə ASCO ilə razılaşdırmaqla və onun müəyyən etdiyi qaydada həyata keçirir.

**5.6.** Akademiya mülkiyyətində və istifadəsində olan əmlakın saxlanılması, qorunması və ondan səmərəli istifadə edilməsi üçün məsuliyyət daşıyır. Akademiyanın əmlakının idarə olunması ilə bağlı fəaliyyətinə nəzarəti ASCO, yaxud onun səlahiyyət verdiyi şəxs həyata keçirir.

**5.7.** Akademiyanın maddi-texniki bazası və təhsil infrastrukturu Azərbaycan Respublikası Nazirlər Kabinetinin müəyyən etdiyi müvafiq normativlərə uyğun olmalıdır.

**5.8.** Akademiya “Təhsil haqqında” və “Elm haqqında” Azərbaycan Respublikasının qanunlarında nəzərdə tutulmuş mənbələrdən maliyyələşdirilir.

**5.9.** Akademiya Azərbaycan Respublikası Nazirlər Kabinetinin müəyyən etdiyi müvafiq normativlərə uyğun maliyyələşdirilir.

**5.10.** Akademiya bilavasitə mənfəət əldə etmək məqsədi güdmür.

**5.11.** Akademiya Azərbaycan Respublikası Nazirlər Kabinetinin müəyyən etdiyi müvafiq sahibkarlıq fəaliyyəti növləri ilə məşğul ola bilər. Bunun üçün Akademiya ASCO-nun razılığı ilə təsərrüfat cəmiyyətləri yaradır və ya onlarda iştirak edir.

**5.12.** Akademiyanın bu Nizamnamənin 5.2-ci bəndində göstərilən mənbələrdən (büdcə vəsaiti istisna olmaqla) daxil olan vəsait hesabına əldə etdiyi əmlak qanunvericiliyə uyğun olaraq onun mülkiyyətinə daxil edilir.

**5.13.** Akademiyanın fəaliyyətindən əldə etdiyi vəsait yalnız təhsilin inkişafına, onun maddi-texniki bazasının inkişafına, təhsilalanların və təhsilverənlərin sosial müdafiəsinə, habelə normativ hüquqi aktlarla müəyyən edilmiş digər məqsədlərə yönəldilir.

**5.14.** Akademiya fəaliyyətindən əldə olunan vəsaitin xərclənməsi istiqamətlərini sərbəst (bu Nizamnamənin 5.13-cü bəndi nəzərə alınmaqla) müəyyən edir, təhsilverənlərə və təhsilalanlara maddi yardım göstərir.

**5.15.** Akademiyada dövlət hesabına göstərilən xidmətlərin dəyəri Azərbaycan Respublikası Nazirlər Kabinetinin təsdiq etdiyi maliyyə normativləri ilə müəyyən edilir. Akademiyanın ödənişli təhsil xidmətlərinin və bu Nizamnamənin 5.11-ci bəndində nəzərdə tutulmuş fəaliyyətlə bağlı müvafiq məhsulların (malların, işlərin, xidmətlərin) qiymətləri tənzimlənən qiymətlərə aid deyildir.

## 6. Akademiyanın fəaliyyətinə nəzarətin forması və əhatə dairəsi

**6.1.** Akademiyanın fəaliyyətinə nəzarəti ASCO, həmçinin nizamnaməsi ilə müəyyən edilmiş qaydada Akademiyanın idarəetmə orqanları həyata keçirirlər.

**6.2.** ASCO Akademiyada və onun tabeliyində olan qurumlarda plan üzrə və ya plandankənar yoxlamalar həyata keçirə bilər.

**6.3.** Akademiyanın fəaliyyətinə dair illik hesabat ASCO-ya təqdim edilir.

**6.4.** Akademiyanın fəaliyyətinə nəzarətin digər formaları “Təhsil haqqında” və “Publik hüquqi şəxslər haqqında” Azərbaycan Respublikasının qanunları ilə müəyyən edilir.

**6.5.** Akademiya idarə, filial, nümayəndəlik və təsərrüfat cəmiyyətlərinin, habelə tabeliyindəki digər qurumların maliyyə-təsərrüfat fəaliyyətinin yoxlanılmasını təmin edir.

**6.6.** Akademiyanın fəaliyyətinin müstəqil surətdə yoxlanılması üçün Himayəçilər Şurası kənar auditor təyin edir və onun audit hesabatını qəbul edir.

**6.7.** Akademiyada daxili audit bölməsinin fəaliyyətinə Himayəçilər Şurası nəzarət edir və fəaliyyətinə dair hesabatlar alır, habelə onun üzvlərinin vəzifəyə təyin və vəzifədən azad edilməsi barədə qərar qəbul edir.

## 7. Akademiyada uçot və hesabat

**7.1.** Akademiya “Mühasibat uçotu haqqında” Azərbaycan Respublikasının Qanunu ilə publik hüquqi şəxslər üçün müəyyən edilmiş qaydada mühasibat uçotu aparır, maliyyə hesabatlarını tərtib, təqdim və dərc edir.

**7.2.** Akademiya “Rəsmi statistika haqqında” Azərbaycan Respublikasının Qanununa uyğun olaraq statistik hesabatları tərtib və təqdim edir.

## 8. Akademiyanın yenidən təşkili və ləğv edilməsi

Akademiyanın yenidən təşkilini və ləğv edilməsini Azərbaycan Respublikasının Prezidenti ilə razılaşdırmaqla, Azərbaycan Respublikasının Nazirlər Kabineti həyata keçirir.`;

export const CHARTER_PAGE: QebulPageSeed = {
  slug: CHARTER_SLUG,
  dataBlock: 'yox',
  layout: 'akademiya',
  az: {
    title: 'Azərbaycan Dövlət Dəniz Akademiyasının Nizamnaməsi',
    lead:
      'Akademiyanın hüquqi statusu, fəaliyyət istiqamətləri, vəzifə və hüquqları, idarə olunması, əmlakı və fəaliyyətinə nəzarət. ' +
      'Nizamnamə Nazirlər Kabinetinin 21 sentyabr 2022-ci il tarixli 361 nömrəli Qərarı ilə təsdiq edilib.',
    body: CHARTER_BODY,
    seoDescription:
      'Azərbaycan Dövlət Dəniz Akademiyasının Nizamnaməsi: ümumi müddəalar, fəaliyyət istiqamətləri, vəzifə və hüquqlar, idarəetmə, əmlak və nəzarət.',
    facts: [
      { label: 'Təsdiq edib', value: 'Nazirlər Kabineti, 21.09.2022, № 361', icon: 'sened' },
      { label: 'Hüquqi forma', value: 'Publik hüquqi şəxs', icon: 'qoruma' },
      { label: 'Tabelik', value: 'ASCO', icon: 'bina' },
      { label: 'Hüquqi ünvan', value: 'Bakı, Səbail rayonu, Zərifə Əliyeva küçəsi 18', icon: 'unvan' },
    ],
    sideLinks: [
      { label: 'ASCO və Akademiya', url: '/sehife/asco-ve-akademiya' },
      { label: 'Təşkilati struktur', url: '/struktur' },
      { label: 'Elmi Şura', url: '/struktur/elmi-sura' },
      { label: 'Himayəçilər Şurası', url: '/sehife/himayeciler-surasi' },
      { label: 'Struktur bölmələrin əsasnamələri', url: '/sehife/struktur-bolmelerin-esasnameleri' },
      { label: 'Rəhbərlik', url: '/rehberlik' },
    ],
    contact:
      `**Hüquqi məsələlər:** [Hüquq məsləhətçisi](/struktur/huquq-meslehetcisi)\n\n**Telefon:** ${ACADEMY_PHONE_AZ}\n\n` +
      '**E-poçt:** info@adda.edu.az\n\nSualınızı [onlayn göndərin](/vetendaslarin-muracieti).',
  },
};
