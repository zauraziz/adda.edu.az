/**
 * F5.46 — «Təhsil» menyusunun iki bölmə səhifəsi (struktur bölmə, `unit`):
 * «STCW kursları» → Təlim-Tədris Mərkəzi, «Tədris ofisi» → Tədris
 * proseslərinin təşkili şöbəsi. Bölmə şablonu (F5.42) dəyişmir — yalnız
 * sahələr: missiya, haqqında, fəaliyyət sahəsi, xidmətlər, görülmüş işlər,
 * suallar, keçidlər, blok başlıqları. Məntiq: src/utils/tehsil-pages.ts.
 *
 * Mənbə: bölmələrin mövcud mətni (9 oktyabr 2026). Kurs siyahısı TTM-in öz
 * siyahısıdır, mövzu üzrə qruplaşdırılıb; STCW qaydası yalnız birmənalı
 * olanlarda göstərilib (VI/1–VI/6, IV/2, V/1-1, V/2). Köhnə mətndəki qırıq
 * e-poçt (Cloudflare qoruması), uyğunsuz sayt ünvanı və ümumi LinkedIn
 * keçidi YAZILMAYIB — TTM-in e-poçtu və saytı yoxlanılmalıdır.
 */
import type { LinkSeed } from './qebul-pages-content';

/** unit.block-setting `block` açarları (src/components/unit/block-setting.json). */
export type UnitBlockKey =
  | 'missiya'
  | 'haqqinda'
  | 'fealiyyet_sahesi'
  | 'xidmetler'
  | 'gorulmus_isler'
  | 'faydali_linkler'
  | 'suallar';

export interface UnitSeed {
  slug: string;
  mission: string;
  about: string;
  functions?: string;
  services?: string;
  results?: string;
  /** Yalnız boşdursa yazılır. */
  building?: string;
  /** Yalnız boşdursa yazılır. */
  links?: LinkSeed[];
  /** Yalnız boşdursa yazılır. */
  onlineServices?: LinkSeed[];
  /** Yalnız boşdursa yazılır (sahə dil üzrə eynidir). */
  faq?: { question: string; answer: string }[];
  /** Standart blok başlığı — həmin blok üçün admində ayar yoxdursa. */
  blockTitles?: { block: UnitBlockKey; title: string }[];
}

// ── STCW kursları — Təlim-Tədris Mərkəzi ────────────────────────────────────
const TTM: UnitSeed = {
  slug: 'telim-tedris-merkezi',
  mission: 'Dənizçilərin STCW Konvensiyasının tələblərinə uyğun hazırlanması, sertifikatlaşdırılması və peşəkar səviyyəsinin artırılması.',
  about: `«Azərbaycan Xəzər Dəniz Gəmiçiliyi» QSC-nin (ASCO) Təlim-Tədris Mərkəzi Azərbaycan Dövlət Dəniz Akademiyasının tərkibindədir. Mərkəzdə dənizçilərin sertifikatlaşdırılması üçün nəzəri və praktik təlimlər, məşqlər və qiymətləndirmə aparılır.

**Ünvanlar**

- Əsas inzibati bina — Səlyan şossesi 23: müasir auditoriyalar, trenajorlar və dənizçilik avadanlığı;
- II korpus — Kazım Kazımzadə küçəsi 127: ASCO-nun 6 mərtəbəli binasının III və IV mərtəbələri.

**Telefon:** (+99412) 404 39 46, (+99412) 404 39 47

**Mobil:** (+99450) 277 02 79, (+99450) 243 91 74

Kurs və sertifikatla bağlı sualınızı [onlayn göndərin](/vetendaslarin-muracieti?istiqamet=telim).`,
  functions: `- Təlimlər **Dövlət Dəniz Agentliyi** və **Amerika Gəmiçilik Bürosu (ABS)** tərəfindən akkreditasiya olunub.
- Mərkəz **ISO 9001:2015** keyfiyyət menecmenti sistemi ilə işləyir; **Bureau Veritas** audit edib və sertifikat verib.
- **The Nautical Institute** (Böyük Britaniya) Mərkəzin dinamik mövqe saxlama (DP) simulyatoruna sertifikat verib: DP Induction, DP Simulator, DP Revalidation and Refresher / Competency Assessment və DP Vessel Maintainer təlimləri bu sertifikatla keçirilir.

Mərkəzin məqsədi dənizçilərin hazırlanması, sertifikatlaşdırılması və STCW Konvensiyası ilə ona edilmiş düzəlişlərin tələblərinə uyğun nəzəri və praktik təlimlərin təşkilidir.`,
  services: `Kurs cədvəli və qeydiyyat üçün Mərkəzə zəng edin: (+99412) 404 39 46, 404 39 47.

### Baza təhlükəsizlik və xilasetmə

- Bütün dənizçilər üçün təhlükəsizlik üzrə tanışlıq, ilkin hazırlıq və təlimat (STCW VI/1)
- Sürətli olmayan xilasedici qayıq və sallar üzrə mütəxəssis (VI/2)
- Sürətli xilasetmə qayığı mütəxəssisi (VI/2)
- «Yanğınla mübarizə» geniş proqram üzrə (VI/3)
- Kapitanın yanğın üzrə köməkçisinin təkmilləşdirmə kursu
- Gəmidə ilk tibbi yardım (VI/4)
- Gəmidə tibbi nəzarət (VI/4)

### Naviqasiya və kapitan körpüsü

- Elektron Xəritə Displeyinin və İnformasiya Sistemlərinin (ECDIS) istismar qaydaları
- Kapitan körpüsünün resurslarının idarə olunması
- Gəminin idarə olunması və manevr edilməsi
- Radar müşahidəsi və təsviri, avtomatik radar müşahidəsi vasitələrinin istismarı (istismar səviyyəsi)
- Radar, avtomatik radar müşahidə vasitələri, kapitan körpüsü komandası və axtarış-xilasetmə (idarəetmə səviyyəsi; qısaldılmış baza kursu da var)
- Gəmi dayanıqlığı
- Liderlik və heyətlə iş birliyi

### Radiorabitə — GMDSS (IV/2)

- Qlobal Dəniz Fəlakət və Əmniyyətli Rabitə Sisteminin məhdud rayon operatoru
- Ümumi rayon operatoru — tam və qısaldılmış baza kursu

### Maşın şöbəsi və elektrik

- Maşın şöbəsinin resurslarının idarə olunması
- Gəmi dizel energetik qurğularının istismarı — trenajor hazırlığı
- Gəmi elektroenergetik sistemi — trenajor hazırlığı
- 1000 voltdan yuxarı gərginlikli sistemlərin təhlükəsiz istismarı və texniki nəzarət
- Gəmi mexanikləri, gəmi elektrik mexanikləri və gəmi sürücüləri üçün ixtisasartırma (qısamüddətli kurs da var)

### Tanker və təhlükəli yüklər

- Neft və kimyəvi maddələr daşıyan tankerlərdə yük əməliyyatına dair ilkin hazırlıq (V/1-1)
- Neftdaşıyan tankerlərdə yük əməliyyatına dair geniş proqram (V/1-1)
- Kimyəvi maddələr daşıyan tankerlərdə yük əməliyyatları — idarəetmə səviyyəsi (V/1-1)
- İnert qaz sistemi
- Gəmidə qazanalizatorları və onların istismarı
- Təhlükəli və zərərli yüklərin daşınması

### Sərnişin gəmiləri (V/2)

- Sərnişinlərin, yükün və gəmi gövdəsinin təhlükəsizliyi (RO-RO)
- Sərnişinlərə bilavasitə xidmət göstərən heyət üçün hazırlıq
- İzdihamın idarə olunması
- Böhran zamanı idarəetmə və insan davranışı
- Kapitanın sərnişin üzrə köməkçilərinin hazırlığı

### Mühafizə və təhlükəsiz idarəetmə

- Gəminin mühafizəsi üzrə məsul şəxs (VI/5)
- Gəmi mühafizəsi üzrə müəyyən vəzifələri olan şəxslər (VI/6)
- Gəmi mühafizəsi üzrə ümumi hazırlıq və təlimat (VI/6)
- Liman vasitələrinin mühafizəsi
- Əmniyyətli İdarəetmə haqqında Beynəlxalq Məcəllə (ISM) — idarəetmə səviyyəsi və sıravi heyət
- Gəmi əmniyyətliyi üzrə məsul şəxs

### Dinamik mövqe saxlama (DP) — The Nautical Institute akkreditasiyası

- DP operatorlarının hazırlığı: baza kursu və simulyator kursu
- DP üzrə revalidasiya və təkmilləşdirmə, bacarıqların qiymətləndirilməsi
- DP sisteminə texniki xidmət
- Başqa mərkəzdə DP kursunu bitirənlər üçün imtahan və qeydiyyat kitabı (Logbook)

### Təlimatçılar və qiymətləndiricilər

- Dənizçilərin bilik və bacarığının yoxlanması və qiymətləndirilməsi
- Trenajor təlimatçılarının və qiymətləndiricilərin hazırlığı
- Təlimatçılar üçün hazırlıq`,
  results: `- Qravitasiya tipli xilasetmə qayığı
- «Viking» xilasetmə salı
- GMDSS trenajoru (POSEIDON və TRANSAS) və GMDSS-in real avadanlığı
- Radar müşahidəsi və avtomatik radar müşahidəsi (ARPA) trenajoru (POSEIDON)
- ECDIS trenajoru
- Sürətli xilasetmə qayığı mütəxəssisi hazırlığı trenajoru (TRANSAS)
- Dinamik mövqe saxlama (DP) simulyatoru — The Nautical Institute sertifikatı ilə`,
  building: 'Səlyan şossesi 23',
  links: [{ label: 'Facebook: Təlim-Tədris Mərkəzi', url: 'https://www.facebook.com/acsctrainingcenter/' }],
  onlineServices: [{ label: 'Kurs və sertifikat üzrə onlayn müraciət', url: '/vetendaslarin-muracieti?istiqamet=telim' }],
  faq: [
    {
      question: 'Kursa necə yazılım?',
      answer:
        'Mərkəzə zəng edin: (+99412) 404 39 46, 404 39 47. Onlayn müraciət formasında «Dənizçi sertifikatları və kurslar» istiqamətini də seçə bilərsiniz.',
    },
    {
      question: 'Sertifikatımın müddəti bitir — nə etməliyəm?',
      answer:
        'STCW üzrə bəzi sertifikatlar (baza təhlükəsizlik, xilasedici qayıq və sallar, geniş proqram üzrə yanğınla mübarizə) hər 5 ildən bir təkmilləşdirmə kursu ilə təsdiqlənir. Uyğun kursu Mərkəzdə keçə bilərsiniz.',
    },
    {
      question: 'DP kursları kimlər üçündür?',
      answer:
        'Dinamik mövqe saxlama sistemi olan gəmilərdə işləyən və ya işləyəcək zabitlər və texniki heyət üçün. Kurslar The Nautical Institute-un sertifikatlaşdırdığı simulyatorda keçirilir.',
    },
  ],
  blockTitles: [
    { block: 'fealiyyet_sahesi', title: 'Akkreditasiya və tanınma' },
    { block: 'xidmetler', title: 'Kurslar' },
    { block: 'gorulmus_isler', title: 'Trenajorlar və avadanlıq' },
  ],
};

// ── Tədris ofisi — Tədris proseslərinin təşkili şöbəsi ──────────────────────
const OFIS: UnitSeed = {
  slug: 'tedris-proseslerinin-teskili-sobesi',
  mission:
    'Tədris prosesinin planlaşdırılması və təşkili: tədris planları, dərs cədvəli, imtahan sessiyaları, təcrübə və tələbə kontingentinin uçotu.',
  about: `Akademiyanın Tədris şöbəsi 1996-cı ildə yaranıb; 2015–2025-ci illərdə Tədris-qeydiyyat şöbəsi kimi fəaliyyət göstərib. Şöbənin nəzdində **dispetçer xidməti**, **qeydiyyat ofisi** və **təcrübə bölməsi** işləyir.

Şöbə 10 ştat vahidindən ibarətdir: şöbə müdiri, müdir müavini, 6 təhsil üzrə mütəxəssis, metodist və karyera və təcrübənin təşkili üzrə mütəxəssis.

**Şöbə müdiri:** Əsədullah Süleymanov — tel. (+99412) 498-73-94, mob. (+99450) 277-02-94.

Tədris prosesi və sənədlərlə bağlı sualınızı [onlayn göndərin](/vetendaslarin-muracieti?istiqamet=tedris).`,
  services: `- **Dərs cədvəli və auditoriyalar** — cədvəli dispetçer xidməti tərtib edir; cədvəllə bağlı suallar buraya.
- **İmtahan sessiyaları** — sessiyaların və buraxılış işlərinin müdafiəsinin təşkili, nəticələrin ümumiləşdirilməsi.
- **Kredit borcu və yay semestri** — kredit borcu olan tələbələrin qeydiyyatı, yay (III) semestrinin təşkili.
- **Bərpa və köçürmə** — xaric olunmuş tələbənin bərpası, bir təhsil formasından və ya ixtisasdan digərinə köçürmə üçün sənədlərin komissiyaya hazırlanması.
- **Təcrübə** — üzmə-istehsalat təcrübəsinin təşkili və nəzarət: [Təcrübə (praktika)](/sehife/tecrube-haqqinda).
- **Karyera və məzunlar** — karyera və məzunlarla iş üzrə mütəxəssis.`,
  functions: `**Tədris planları və dərs yükü**

- «Ali ixtisas təhsilinin bakalavr (magistr) pilləsinin Dövlət Standartları» əsasında tədris və işçi tədris planlarının hazırlanması və Elmi Şuraya təqdimi
- Kafedralar üzrə tədris yükünün bölgüsü və icrasına nəzarət; saathesabı ödənişlə bağlı əmrlər
- Sillabus, təqvim və tədris planlarının, fənn proqramlarının, dərslik və dərs vəsaitlərinin mövcudluğuna nəzarət

**Tədrisin keyfiyyəti**

- Açıq dərslərin və qarşılıqlı dərs dinləmələrinin qrafik üzrə keçirilməsinə nəzarət
- Tədris intizamına nəzarət və rəhbərliyə məlumat
- İmtahan nəticələri üzrə hesabatların toplanması, ümumiləşdirilməsi və müzakirəsi

**Tələbə kontingenti və hesabatlar**

- Tələbə kontingentinin hərəkəti üzrə aylıq hesabatlar, illik statistik hesablamalar
- Növbəti tədris ili üçün bakalavr və magistr qəbulunun planlaşdırılması
- DAK sədrlərinin siyahısının ASCO-ya təsdiqə göndərilməsi

**Təşkilati işlər**

- Auditoriya fondunun fakültələr arasında bölgüsü və istifadəsinə nəzarət
- Təhsil Nazirliyi və digər qurumlardan daxil olan sənədlərin icrası, tədrislə bağlı əmrlərin hazırlanması
- Dekanlıqların, şöbə və kafedraların tədris materialları ilə təmin olunması`,
  onlineServices: [{ label: 'Tədris prosesi və sənədlər üzrə müraciət', url: '/vetendaslarin-muracieti?istiqamet=tedris' }],
  faq: [
    { question: 'Dərs cədvəli ilə bağlı sualı kimə verim?', answer: 'Cədvəli şöbənin dispetçer xidməti tərtib edir — şöbəyə müraciət edin.' },
    {
      question: 'Kredit borcum var — nə etməliyəm?',
      answer:
        'Kredit borcu olan tələbələrin qeydiyyatını şöbə aparır və onlar üçün yay (III) semestri təşkil olunur. Şərtlər barədə dekanlıqdan və ya şöbədən məlumat alın.',
    },
    {
      question: 'Bərpa və ya köçürmə üçün hara müraciət edim?',
      answer:
        'Bərpa, bir təhsil formasından və ya ixtisasdan digərinə köçürmə üzrə sənədləri komissiya üçün şöbə hazırlayır. Müraciət qaydası barədə şöbədən məlumat alın.',
    },
  ],
  blockTitles: [
    { block: 'xidmetler', title: 'Tələbələr üçün xidmətlər' },
    { block: 'fealiyyet_sahesi', title: 'Şöbənin funksiyaları' },
  ],
};

export const TEHSIL_UNITS: UnitSeed[] = [TTM, OFIS];
