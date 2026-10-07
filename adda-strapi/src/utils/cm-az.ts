/**
 * F5.39 — Content Manager: sahə adları və doldurma qaydaları Azərbaycan dilində.
 *
 * Strapi sahənin adını standart olaraq atribut adı ilə göstərir
 * («academicTitle», «seoDescription»). Bu modul hər bölmə və komponent üçün:
 *   - ad (label) — redaktə formasında və siyahı başlığında;
 *   - qayda (description) — sahənin altında: nə yazılır, format, nümunə;
 *   - nümunə (placeholder) — boş sahənin içində (yalnız lazım olan yerdə).
 *
 * BİR DƏFƏ işləyir (core store: `cmAz:v1`). Adminin öz dəyişikliklərinin
 * ÜSTÜNDƏN YAZMIR: ad yalnız hələ standartdırsa (atribut adına bərabərdir),
 * qayda və nümunə yalnız boşdursa yazılır. Sxemə yeni sahə əlavə olunanda
 * buraya yazılır və versiya artırılır (`cmAz:v2`) — köhnə sahələr toxunulmaz
 * qalır, çünki onların adı artıq standart deyil.
 *
 * Bayraq tələb etmir: yalnız admin panelinin görünüş ayarlarıdır, məzmuna
 * toxunmur. Portu bloklamır (bootstrap-da gözlənilmir).
 */
import type { Core } from '@strapi/strapi';
import { FACULTY_ARCHIVE_NOTE } from './faculty-units';

/** [ad, qayda?, nümunə?] */
type F = [string, string?, string?];
type Dict = Record<string, F>;

// ── Təkrarlanan qaydalar ─────────────────────────────────────────────────────
const SLUG = 'Saytdakı ünvanın son hissəsi. Başlıqdan avtomatik yaranır: kiçik latın hərfi, rəqəm, «-». Dərcdən sonra dəyişməyin — köhnə keçidlər qırılır.';
const MD = 'Markdown: «## » başlıq, «- » siyahı, **qalın**, [mətn](https://…). Word-dən köçürəndə formatı yoxlayın.';
const SORT = 'Kiçik rəqəm yuxarıda görünür.';
const AUTO = 'Avtomatik doldurulur — əl ilə dəyişməyin.';
const AUTO_REL = 'Avtomatik: qarşı tərəfdəki əlaqədən gəlir.';
const URL_RULE = 'Tam ünvan, https:// ilə.';
const RU = 'Rus dilində variant (istəyə bağlı).';
const EN = 'İngilis dilində variant (istəyə bağlı).';
const EXCERPT = 'Kartda və siyahıda görünən 1–2 cümlə (300 simvola qədər).';
const COVER = 'Kartda və səhifənin başında görünür. Üfüqi şəkil (16:9), ən azı 1200 px en.';
const VISIBILITY = 'academy — bütün sayt (ana səhifə lentləri); faculty — yalnız seçilmiş fakültənin səhifəsi; person — yalnız seçilmiş əməkdaşın profili.';
const SHOW_ON_HOME = 'Aktivdirsə ana səhifənin seçilmiş blokuna namizəddir; göstərilməsi üçün «Ana səhifə statusu» approved olmalıdır.';
const HOME_STATUS = 'none — təklif yoxdur; pending — təsdiq gözləyir; approved — ana səhifədə göstərilir.';
const TAGS = 'Mövzu etiketləri. Struktur bölmənin slug-ı ilə eyni etiket qeydi həmin bölmənin səhifəsinə də çıxarır.';
const PHOTO_PORTRAIT = 'Portret, kvadrata yaxın (məs. 800×800 px), JPEG/PNG/WebP, 4 MB-a qədər.';

// ── Bölmələr (content type) ──────────────────────────────────────────────────
const CT: Record<string, Dict> = {
  'api::page.page': {
    title: ['Başlıq', 'Səhifənin adı — menyuda və brauzer vərəqində görünür. Məs.: «Akademiyanın tarixi».'],
    slug: ['Ünvan (slug)', SLUG + ' Ünvan: /sehife/<slug>.'],
    body: ['Mətn', 'Səhifənin əsas mətni. ' + MD],
    seoDescription: ['Axtarış təsviri', 'Google nəticəsində başlığın altında görünən 1–2 cümlə (180 simvola qədər).'],
  },
  'api::article.article': {
    title: ['Başlıq', 'Qısa və konkret, 60–90 simvol. Sonda nöqtə qoyulmur.'],
    slug: ['Ünvan (slug)', SLUG],
    excerpt: ['Qısa təsvir', EXCERPT],
    tldr: ['Qısa xülasə', 'Xəbərin 2–3 cümləlik xülasəsi (400 simvola qədər), istəyə bağlı.'],
    body: ['Mətn', MD],
    cover: ['Üz şəkli', COVER],
    gallery: ['Foto qalereya', 'Mətnin altındakı əlavə şəkillər. Üz şəklini burada təkrarlamayın.'],
    category: ['Kateqoriya', 'xeber — xəbər; elan — elan; tedbir — tədbir; elm — elm.'],
    newsDate: ['Xəbərin tarixi', 'Saytda görünən tarix; siyahılar bu tarixə görə düzülür. Boşdursa dərc tarixi göstərilir.'],
    readingMinutes: ['Oxu müddəti (dəq)', 'Təxmini oxu vaxtı, dəqiqə ilə. İstəyə bağlı.'],
    tags: ['Etiketlər', TAGS],
    visibility: ['Görünmə əhatəsi', VISIBILITY],
    faculty: ['Fakültə', '«faculty» əhatəsində xəbər bu fakültənin səhifəsində görünür.'],
    person: ['Əməkdaş', '«person» əhatəsində xəbər bu əməkdaşın profilində görünür.'],
    unit: ['Struktur bölmə', 'Xəbər bu bölmənin səhifəsində də göstərilir.'],
    showOnHome: ['Ana səhifəyə təklif et', SHOW_ON_HOME],
    homeStatus: ['Ana səhifə statusu', HOME_STATUS],
  },
  'api::announcement.announcement': {
    title: ['Başlıq', 'Elanın mövzusu, qısa. Məs.: «Yay semestri imtahan cədvəli».'],
    slug: ['Ünvan (slug)', SLUG],
    excerpt: ['Qısa təsvir', EXCERPT],
    body: ['Mətn', MD],
    cover: ['Üz şəkli', COVER + ' İstəyə bağlı.'],
    importance: ['Vaciblik', 'normal — adi; vacib — «vacib» nişanı; kritik — «kritik» nişanı.'],
    publishAt: ['Elan tarixi', 'Elanın rəsmi tarixi; siyahı bu tarixə görə düzülür (yenisi yuxarıda).'],
    expiresAt: ['Qüvvədən düşmə tarixi', 'Elanın aktuallığının bitdiyi gün. İstəyə bağlı.'],
    deadlineAt: ['Son tarix', 'Müraciət/təqdimat üçün son gün — elanda «Son tarix» kimi görünür.'],
    requiresAck: ['Tanışlıq məcburidir', 'Aktivdirsə elanda «tanış olmaq məcburidir» qeydi göstərilir.'],
    attachments: ['Qoşma fayllar', 'PDF, Word və s. — elanın altında yükləmə siyahısı kimi görünür.'],
    tags: ['Etiketlər', TAGS],
    visibility: ['Görünmə əhatəsi', VISIBILITY],
    faculty: ['Fakültə', '«faculty» əhatəsində elan bu fakültənin səhifəsində görünür.'],
    person: ['Əməkdaş', '«person» əhatəsində elan bu əməkdaşın profilində görünür.'],
    unit: ['Struktur bölmə', 'Elan bu bölmənin səhifəsində də göstərilir.'],
    showOnHome: ['Ana səhifəyə təklif et', SHOW_ON_HOME],
    homeStatus: ['Ana səhifə statusu', HOME_STATUS],
  },
  'api::event.event': {
    title: ['Başlıq', 'Tədbirin adı. Məs.: «Dənizçilik günü — açıq qapı».'],
    slug: ['Ünvan (slug)', SLUG],
    excerpt: ['Qısa təsvir', EXCERPT],
    body: ['Mətn', 'Proqram, mövzular, qeydiyyat qaydası. ' + MD],
    cover: ['Üz şəkli', COVER],
    format: ['Format', 'fiziki — auditoriyada; onlayn — internetdə; hibrid — hər ikisi.'],
    startAt: ['Başlama vaxtı', 'Tarix və saat (Bakı vaxtı). Yaxınlaşan tədbirlər bu vaxta görə düzülür.'],
    endAt: ['Bitmə vaxtı', 'İstəyə bağlı.'],
    venueBuilding: ['Bina', 'Məs.: «I tədris binası».'],
    venueRoom: ['Zal / otaq', 'Məs.: «Akt zalı» və ya «305».'],
    onlineUrl: ['Onlayn keçid', 'Zoom/Teams linki — onlayn və hibrid tədbir üçün. ' + URL_RULE],
    platform: ['Platforma', 'Məs.: Zoom, Microsoft Teams.'],
    speakers: ['Məruzəçilər', 'Hər məruzəçi ayrıca sətir.'],
    capacity: ['Yer sayı', 'Qeydiyyat üçün ən çox iştirakçı sayı. Boşdursa məhdudiyyət yoxdur.'],
    tags: ['Etiketlər', TAGS],
    visibility: ['Görünmə əhatəsi', VISIBILITY],
    faculty: ['Fakültə', '«faculty» əhatəsində tədbir bu fakültənin səhifəsində görünür.'],
    person: ['Əməkdaş', '«person» əhatəsində tədbir bu əməkdaşın profilində görünür.'],
    showOnHome: ['Ana səhifəyə təklif et', SHOW_ON_HOME],
    homeStatus: ['Ana səhifə statusu', HOME_STATUS],
  },
  'api::document.document': {
    title: ['Sənədin adı', 'Rəsmi ad, məs.: «Kafedra haqqında Əsasnamə».'],
    titleRu: ['Ad (rusca)', RU],
    titleEn: ['Ad (ingiliscə)', EN],
    description: ['Qısa təsvir', '1–2 cümlə (500 simvola qədər).'],
    descriptionRu: ['Təsvir (rusca)', RU],
    descriptionEn: ['Təsvir (ingiliscə)', EN],
    category: ['Növ', 'normativ; esasname — əsasnamə; emr — əmr; qerar — qərar; hesabat; etika; akkreditasiya; forma — blank; diger — digər.'],
    file: ['Fayl', 'PDF tövsiyə olunur (brauzerdə açılır). Word faylı yüklənərək açılır.'],
    year: ['İl', 'Qəbul/təsdiq ili, məs. 2024.'],
    units: ['Struktur bölmələr', 'Sənəd bu bölmələrin səhifəsində «Sənədlər» siyahısında görünür.'],
    programs: ['İxtisaslar', 'Sənəd bu ixtisasların səhifəsində görünür.'],
    facilities: ['Auditoriya və laboratoriyalar', 'Sənəd bu obyektlərin səhifəsində görünür.'],
  },
  'api::tag.tag': {
    name: ['Ad', 'Qısa, kiçik hərflə: «naviqasiya», «beynəlxalq əməkdaşlıq».'],
    slug: ['Ünvan (slug)', SLUG],
    articles: ['Xəbərlər', AUTO_REL],
    announcements: ['Elanlar', AUTO_REL],
    events: ['Tədbirlər', AUTO_REL],
  },
  'api::person.person': {
    name: ['Ad, soyad, ata adı', 'Ştat cədvəlindəki kimi: Soyad Ad Ata adı — məs. «Məmmədov Rauf Elçin oğlu». Əməkdaş özü dəyişə bilməz.'],
    displayName: ['Görünən ad', 'Saytda başqa formada göstərmək lazımdırsa, məs. «Rauf Məmmədov». Boşdursa yuxarıdakı ad göstərilir.'],
    profileUpdatedAt: ['Profil yenilənib', 'Əməkdaş profilini özü yeniləyəndə ' + AUTO.toLowerCase()],
    slug: ['Ünvan (slug)', 'Profilin ünvanı: /emekdas/<slug>, latın hərfi ilə «soyad-ad» (məs. «mammadov-rauf»). Dərcdən sonra dəyişməyin.'],
    staffType: ['Heyət növü', 'akademik — professor-müəllim; telimci_texniki — təlimçi/texniki; inzibati — inzibati; rehberlik — rəhbərlik; diger — digər.'],
    position: ['Vəzifə', 'Ştat cədvəlindəki vəzifə: «Dosent», «Şöbə müdiri». Bir neçə vəzifə varsa hamısını «Vəzifələr» siyahısına yazın.'],
    positionRu: ['Vəzifə (rusca)', RU],
    positionEn: ['Vəzifə (ingiliscə)', EN],
    academicTitle: ['Elmi ad', 'Kiçik hərflə: «dosent», «professor», «akademik». Yoxdursa boş saxlayın.'],
    academicTitleRu: ['Elmi ad (rusca)', RU],
    academicTitleEn: ['Elmi ad (ingiliscə)', EN],
    academicDegree: ['Elmi dərəcə', 'elmler_doktoru — elmlər doktoru; felsefe_doktoru — fəlsəfə doktoru; elmler_namizedi — elmlər namizədi; yoxdur — yoxdur.'],
    roles: ['Vəzifələr (bölmələr üzrə)', 'Hər vəzifə ayrıca sətir: vəzifə + bölmənin adı. Profil və bölmə səhifələrində göstərilir.'],
    bio: ['Haqqında', 'Üçüncü şəxsdə 3–6 cümlə: ixtisas, iş yeri, elmi istiqamət. ' + MD],
    bioRu: ['Haqqında (rusca)', RU],
    bioEn: ['Haqqında (ingiliscə)', EN],
    languages: ['Dil bilikləri', 'Dil + səviyyə (məs. «B2», «sərbəst»). Hər dil ayrıca sətir.'],
    scholar: ['Elmi identifikatorlar', 'ORCID, Scopus, Google Scholar və s. — yalnız olanları doldurun.'],
    researchAreas: ['Peşəkar maraqlar', 'Hər mövzu ayrıca etiket, 2–4 söz: «dizel mühərrikləri».'],
    teaching: ['Tədris', 'Tədris etdiyi fənlər — hər biri «- » ilə yeni sətirdə.'],
    publications: ['Nəşrlər', 'Hər nəşr ayrıca sətir: ad, il, mənbə, keçid. Yenisi yuxarıda.'],
    experience: ['İş təcrübəsi', 'Yenidən köhnəyə. Dövr: «2010–2015» və ya «2018–indiyədək».'],
    education: ['Təhsil', 'Dövr, müəssisə, ixtisas/dərəcə. Yenidən köhnəyə.'],
    responsibilities: ['Səlahiyyətlər və vəzifələr', 'Vəzifə öhdəlikləri (rəhbərlik və inzibati heyət üçün). ' + MD],
    other: ['Digər', 'Təltiflər, üzvlüklər, layihələr. ' + MD],
    photo: ['Şəkil', PHOTO_PORTRAIT],
    email: ['Korporativ e-poçt', '@adda.edu.az ünvanı. Əməkdaş profilinə bu ünvanla daxil olur — dəqiq yazılmalıdır.'],
    altEmail: ['Əlavə e-poçt', 'İkinci @adda.edu.az ünvanı varsa — onunla da profilə daxil olmaq olur.'],
    phone: ['Telefon', 'Format: +994 12 404 37 15. Daxili nömrə üçün: «daxili 1234».', '+994 12 404 37 15'],
    office: ['İş otağı', 'Məs.: «305».'],
    building: ['Bina', 'Məs.: «II tədris binası».'],
    faculty: ['Fakültə', 'Akademik heyət üçün.'],
    department: ['Kafedra (köhnə)', 'Köhnə «Kafedra» bölməsi ilə əlaqə. Yeni əlaqə üçün «Struktur bölmə» sahəsini işlədin.'],
    unit: ['Struktur bölmə', 'Əsas iş yeri — əməkdaş bu bölmənin səhifəsində görünür.'],
    headOf: ['Rəhbəri olduğu bölmələr', 'Avtomatik: bölmənin «Rəhbər» sahəsindən gəlir.'],
    articles: ['Xəbərlər', AUTO_REL],
    announcements: ['Elanlar', AUTO_REL],
    events: ['Tədbirlər', AUTO_REL],
  },
  'api::unit.unit': {
    name: ['Adı', 'Rəsmi ad, dırnaqsız: «Tədris proseslərinin təşkili şöbəsi».'],
    slug: ['Ünvan (slug)', SLUG + ' Ünvan: /struktur/<slug>.'],
    about: ['Haqqında', 'Bölmənin qısa təqdimatı: nə ilə məşğuldur, kimə xidmət edir. ' + MD],
    mission: ['Missiya', '1–2 cümlə.'],
    receptionHours: ['Qəbul saatları (qısa)', 'Bir sətir, məs. «B.e.–Cümə, 09:00–18:00». Günlər üzrə cədvəl üçün «Qəbul cədvəli».'],
    functions: ['Funksiyalar', 'Əsasnamədəki əsas funksiyalar — «- » ilə siyahı.'],
    services: ['Xidmətlər', 'Tələbə və əməkdaşlara göstərilən xidmətlər — «- » ilə siyahı.'],
    results: ['Görülmüş işlər və nəticələr', 'Son illərin əsas nəticələri, mümkünsə rəqəmlərlə. ' + MD],
    onlineServices: ['Onlayn xidmətlər', 'Ad + keçid (https://…). Hər xidmət ayrıca sətir.'],
    links: ['Faydalı keçidlər', 'Ad + keçid. Hər keçid ayrıca sətir.'],
    building: ['Bina', 'Məs.: «I tədris binası».'],
    floor: ['Mərtəbə', 'Məs.: «3».'],
    room: ['Otaq', 'Məs.: «305».'],
    phoneExt: ['Daxili telefon', 'Məs.: «1234».'],
    email: ['E-poçt', 'Bölmənin ümumi ünvanı.'],
    vacancies: ['Vakansiyalar', 'Açıq vəzifələr. Vəzifə tutulanda sətri silin.'],
    strategy: ['Strateji hədəflər üzrə öhdəliklər', MD],
    establishedNote: ['Yaradılma qeydi', 'Bir sətir, məs. «1996-cı ildə yaradılıb».'],
    faq: ['Tez-tez verilən suallar', 'Sual + cavab, hər biri ayrıca sətir.'],
    receptionSlots: ['Qəbul cədvəli', 'Gün + saat aralığı; hər gün ayrıca sətir.'],
    head: ['Rəhbər', 'Bölmənin rəhbəri (Heyət siyahısından).'],
    parent: ['Üst bölmə', 'Strukturda tabe olduğu bölmə.'],
    children: ['Alt bölmələr', 'Avtomatik: alt bölmənin «Üst bölmə» sahəsindən gəlir.'],
    people: ['Əməkdaşlar', 'Avtomatik: əməkdaşın «Struktur bölmə» sahəsindən gəlir.'],
    sortOrder: ['Sıra', SORT + ' Standart: 100.'],
    documents: ['Sənədlər', 'Əsasnamə, hesabat və s.'],
    facilities: ['Auditoriya və laboratoriyalar', 'Avtomatik: obyektin «Struktur bölmə» sahəsindən gəlir.'],
  },
  'api::program.program': {
    title: ['İxtisasın adı', 'Rəsmi ad, məs. «Dəniz naviqasiyası mühəndisliyi».'],
    slug: ['Ünvan (slug)', SLUG + ' Ünvan: /ixtisaslar/<slug>.'],
    degree: ['Təhsil pilləsi', 'subbachelor — subbakalavr; bachelor — bakalavr; master — magistr; phd — doktorantura.'],
    durationYears: ['Müddət (il)', 'Məs.: 4.'],
    studyForm: ['Təhsil forması', 'eyani — əyani; qiyabi — qiyabi.'],
    faculty: ['Fakültə'],
    description: ['Qısa təsvir', 'Kataloq kartında görünən 1–3 cümlə. ' + MD],
    code: ['İxtisas kodu', 'Rəsmi təsnifat kodu, məs. «050621».'],
    planYear: ['Tədris planının ili', 'Məs.: 2024.'],
    totalCredits: ['Ümumi kredit', 'Məs.: 240.'],
    overview: ['İxtisas haqqında', MD],
    outcomes: ['Məzun olanda nə bacaracaq', 'Təlim nəticələri — «- » ilə siyahı.'],
    competencies: ['Səriştələr', MD],
    careerPaths: ['Harada işləyə bilər', 'İş yerləri və vəzifələr — «- » ilə siyahı.'],
    conventions: ['Beynəlxalq standartlar', 'STCW, IMO konvensiyaları və s. ' + MD],
    practiceNote: ['Təcrübə qeydi', 'Üzmə/istehsalat təcrübəsi haqqında qısa mətn.'],
    unit: ['Struktur bölmə', 'İxtisası aparan kafedra/bölmə.'],
    documents: ['Sənədlər', 'Tədris planı, proqram və s.'],
    courses: ['Fənlər (tədris planı)', 'Hər fənn ayrıca sətir: kod, ad, kredit, saatlar, semestr.'],
    tuitionFee: ['Təhsil haqqı', 'Mətn kimi, məs. «2 500 AZN / il».'],
    languages: ['Tədris dilləri'],
    admissionScores: ['Keçid balları', 'Hər il ayrıca sətir. Onluq bal NÖQTƏ ilə yazılır: 239.5 — vergül rəqəmi 2395 edir.'],
    catalogTab: ['Kataloq bölməsi', '/ixtisaslar səhifəsində tab: subbakalavr, bakalavr, magistr, tekrar_ali (təkrar ali), doktorantura.'],
    durationNote: ['Müddət qeydi', 'Məs.: «4 il (əyani), 5 il (qiyabi)».'],
    admissionSeats: ['Qəbul yerləri', 'Cari ilin plan yerləri.'],
    tagline: ['Şüar', 'Başlığın altında bir cümlə.'],
    highlights: ['Seçilmiş faktlar', 'Rəqəm + izah, məs. «240» — «kredit».'],
    faq: ['Tez-tez verilən suallar', 'Sual + cavab, hər biri ayrıca sətir.'],
  },
  // F5.41 — arxiv: fakültənin səhifəsi struktur bölmədir (src/utils/faculty-units.ts).
  'api::faculty.faculty': {
    name: ['Adı', FACULTY_ARCHIVE_NOTE],
    slug: ['Ünvan (slug)', SLUG + ' Struktur bölmənin slug-ı ilə eyni olmalıdır (/struktur/<slug>).'],
    about: ['Haqqında', MD],
    dean: ['Dekan', 'Heyət siyahısından.'],
    departments: ['Kafedralar (köhnə)', AUTO_REL],
    people: ['Əməkdaşlar', AUTO_REL],
    articles: ['Xəbərlər', AUTO_REL],
    announcements: ['Elanlar', AUTO_REL],
    events: ['Tədbirlər', AUTO_REL],
    programs: ['İxtisaslar', AUTO_REL],
  },
  'api::department.department': {
    name: ['Adı', 'Köhnə «Kafedra» bölməsi. Yeni kafedra məlumatı «Struktur bölmə»-yə yazılır.'],
    slug: ['Ünvan (slug)', SLUG],
    about: ['Haqqında', MD],
    head: ['Kafedra müdiri', 'Heyət siyahısından.'],
    faculty: ['Fakültə'],
    people: ['Əməkdaşlar', AUTO_REL],
  },
  'api::facility.facility': {
    name: ['Adı', 'Məs.: «Naviqasiya körpüsü simulyatoru».'],
    slug: ['Ünvan (slug)', SLUG + ' Ünvan: /auditoriyalar/<slug>.'],
    roomNumber: ['Otaq nömrəsi', 'Məs.: «305».'],
    facilityType: ['Növü', 'simulyator; trenajor; laboratoriya; auditoriya.'],
    description: ['Təsvir', 'Nə üçün istifadə olunur — 2–4 cümlə.'],
    inventory: ['Avadanlıq', 'Ad + say, hər biri ayrıca sətir.'],
    software: ['Proqram təminatı', 'Məs.: «Transas NTPRO 5000».'],
    condition: ['Vəziyyəti', 'islek — işlək; qismen — qismən işlək; yararsiz — yararsız.'],
    capacity: ['Tutum (nəfər)', 'Eyni anda neçə nəfər.'],
    unit: ['Struktur bölmə', 'Obyekt bu bölmənin səhifəsində görünür.'],
    relatedProgram: ['Əlaqəli ixtisas', 'Mətn kimi, məs. «Dəniz naviqasiyası».'],
    responsiblePerson: ['Məsul şəxs', 'Heyət siyahısından.'],
    accreditation: ['Akkreditasiya', 'Sertifikat/akkreditasiya qeydi (DNV və s.).'],
    documents: ['Sənədlər'],
    photos: ['Şəkillər', 'Üfüqi şəkillər; birincisi kartda görünür.'],
    sortOrder: ['Sıra', SORT],
  },
  'api::milestone.milestone': {
    year: ['İl', 'Məs.: 1881.'],
    title: ['Başlıq', 'Qısa: hadisənin adı.'],
    description: ['Təsvir', '600 simvola qədər.'],
    image: ['Şəkil'],
    era: ['Dövr', 'temel — təməl illəri; inkisaf — inkişaf; muasir — müasir dövr.'],
    sortOrder: ['Sıra', 'Eyni ildə bir neçə mərhələ varsa. ' + SORT],
  },
  'api::rector.rector': {
    slug: ['Ünvan (slug)', 'Latın hərfi ilə «soyad-ad».'],
    name: ['Ad, soyad, ata adı'],
    termFrom: ['Başlanğıc ili', 'Rəhbərliyə başladığı il.'],
    termTo: ['Bitmə ili', 'Boşdursa «indiyədək».'],
    degree: ['Elmi dərəcə və ad'],
    summary: ['Qısa məlumat', 'Kartda görünür, 400 simvola qədər.'],
    bio: ['Tərcümeyi-hal'],
    died: ['Vəfat tarixi'],
    photo: ['Şəkil', PHOTO_PORTRAIT],
    sortOrder: ['Sıra', SORT],
  },
  'api::hero.hero': {
    name: ['Ad, soyad, ata adı'],
    photo: ['Şəkil', PHOTO_PORTRAIT],
    birthDate: ['Doğum tarixi'],
    birthPlace: ['Doğum yeri'],
    addaProgram: ['ADDA-da ixtisası'],
    studyYears: ['Təhsil illəri', 'Məs.: «2015–2019».'],
    martyrdomDate: ['Şəhid olduğu tarix'],
    martyrdomPlace: ['Şəhid olduğu yer'],
    honors: ['Təltiflər', 'Hər təltif ayrıca sətir.'],
    biography: ['Tərcümeyi-hal', MD],
    slug: ['Ünvan (slug)', SLUG],
    sortOrder: ['Sıra', SORT],
  },
  'api::menu.menu': {
    esasMenyu: ['Əsas menyu', 'Başlıqdakı əsas kateqoriyalar, onların qrupları və keçidləri.'],
    ustMenyu: ['Üst menyu', 'Ən yuxarıdakı kiçik menyu.'],
    eAkademiya: ['E-Akademiya paneli', 'Sağ yuxarıdakı «E-Akademiya» düyməsinin kartları.'],
    istifadeciQruplari: ['«Bunlar üçün» menyusu', 'İstifadəçi qrupları: abituriyent, tələbə, əməkdaş və s.'],
    suretliKecidler: ['Sürətli keçidlər'],
    footerMenyusu: ['Footer menyusu', 'Saytın altındakı sütunlar.'],
  },
  'api::social-block.social-block': {
    eyebrow: ['Üst yazı', 'Başlığın üstündəki kiçik yazı.'],
    title: ['Başlıq'],
    lead: ['Mətn', '1–2 cümlə (600 simvola qədər).'],
    ctaText: ['Çağırış mətni'],
    ctaTag: ['Çağırış heşteqi', 'Məs.: «#ADDA».'],
    hashtags: ['Heşteqlər', 'Vergül və ya yeni sətirlə ayırın: #ADDA, #dənizçilik'],
    instagramUrl: ['Instagram keçidi', URL_RULE],
    tiktokUrl: ['TikTok keçidi', URL_RULE],
    youtubeUrl: ['YouTube keçidi', URL_RULE],
    facebookUrl: ['Facebook keçidi', URL_RULE],
    linkedinUrl: ['LinkedIn keçidi', URL_RULE],
  },
  'api::social-post.social-post': {
    network: ['Şəbəkə'],
    handle: ['Hesab adı', 'Məs.: «@adda.edu.az».'],
    url: ['Paylaşımın keçidi', URL_RULE],
    image: ['Şəkil', 'Kvadrat və ya şaquli kadr.'],
    caption: ['Altyazı', '300 simvola qədər.'],
    captionRu: ['Altyazı (rusca)', RU],
    captionEn: ['Altyazı (ingiliscə)', EN],
    hashtag: ['Heşteq', 'Məs.: «#ADDA».'],
    video: ['Videodur', 'Aktivdirsə kartda oynatma nişanı görünür.'],
    duration: ['Video müddəti', 'Məs.: «0:45».'],
    likes: ['Bəyənmə'],
    comments: ['Şərh'],
    views: ['Baxış'],
    shares: ['Paylaşım sayı'],
    sortOrder: ['Sıra', SORT],
  },
  // ── Müraciətlər (F5.38 adları artıq qoyulub — burada yalnız qaydalar əlavə olunur)
  'api::appeal.appeal': {
    trackingCode: ['İzləmə kodu', 'Avtomatik verilir (ADDA-İL-NÖMRƏ) — dəyişməyin.'],
    appealType: ['Növ', 'sual; teklif — təklif; erize — ərizə; sikayet — şikayət.'],
    message: ['Mətn', 'Vətəndaşın yazdığı mətn — dəyişməyin.'],
    targetUnit: ['Aidiyyəti bölmə', 'Müraciətin yönəldiyi bölmə.'],
    isFormal: ['Rəsmi müraciət', 'Növdən avtomatik təyin olunur.'],
    submittedAt: ['Göndərilib', AUTO],
    respondedAt: ['Cavablanıb', 'Status «Cavablandı» olanda avtomatik yazılır.'],
    attachment: ['Əlavə fayl', '«Bildirişlər» səhifəsində birbaşa baxmaq olur.'],
    internalNote: ['Daxili qeyd', 'Yalnız admində görünür, vətəndaşa getmir.'],
    assignedTo: ['Məsul şəxs', 'Müraciətə baxan əməkdaş.'],
  },
  'api::correction.correction': {
    targetType: ['Hədəf növü', 'article — xəbər; announcement — elan; event — tədbir; milestone — tarix; person — əməkdaş; page — səhifə; general — digər.'],
    targetSlug: ['Hədəf (slug)', 'Düzəliş təklif olunan səhifənin ünvanı.'],
    fieldPath: ['Sahə', 'title — başlıq; body — mətn; other — digər.'],
    currentValue: ['Hazırkı mətn'],
    suggestedValue: ['Təklif olunan mətn'],
    reason: ['Səbəb'],
    moderatorNote: ['Moderator qeydi', 'Daxili qeyd — göndərənə getmir.'],
    verified: ['E-poçt təsdiqlənib', AUTO],
    identity: ['Kimlik', AUTO],
  },
  'api::rsvp.rsvp': {
    eventSlug: ['Tədbir (slug)', AUTO],
    eventTitle: ['Tədbir'],
    guests: ['Qonaq sayı', 'Özü ilə gətirəcəyi qonaqlar.'],
    verified: ['E-poçt təsdiqlənib', AUTO],
    identity: ['Kimlik', AUTO],
  },
  // ── Sistem bölmələri: əsasən avtomatik, əl ilə dəyişilmir
  'api::person.profile-revision': {
    personSlug: ['Əməkdaş (slug)', AUTO],
    actorEmail: ['Dəyişən şəxsin e-poçtu', AUTO],
    changedFields: ['Dəyişən sahələr', AUTO],
    previous: ['Əvvəlki dəyərlər', 'Dəyişiklikdən əvvəlki vəziyyət — lazım olsa geri qaytarmaq üçün.'],
    clientIp: ['IP ünvanı', AUTO],
    person: ['Əməkdaş', AUTO],
  },
  'api::person.staff-private': {
    personSlug: ['Əməkdaş (slug)', 'Heyət qeydinin slug-ı.'],
    birthDate: ['Doğum tarixi', 'Saytda GÖRÜNMÜR — yalnız daxili istifadə üçün.'],
    person: ['Əməkdaş'],
  },
  'api::identity.identity': {
    email: ['E-poçt', AUTO],
    displayName: ['Ad'],
    locale: ['Dil'],
    verifiedAt: ['Təsdiqlənib', AUTO],
    lastSeenAt: ['Son giriş', AUTO],
    blocked: ['Bloklanıb', 'Aktivdirsə bu ünvan düzəliş/qeydiyyat göndərə bilmir.'],
    tokens: ['Tokenlər', AUTO],
    rsvps: ['Tədbir qeydiyyatları', AUTO],
    corrections: ['Düzəliş təklifləri', AUTO],
    pushSubscriptions: ['Push abunəlikləri', AUTO],
  },
  'api::identity.identity-token': {
    tokenHash: ['Token (hash)', AUTO],
    purpose: ['Təyinat', 'magic — giriş linki; session — sessiya.'],
    email: ['E-poçt', AUTO],
    locale: ['Dil'],
    expiresAt: ['Bitmə vaxtı', AUTO],
    usedAt: ['İstifadə olunub', AUTO],
    revokedAt: ['Ləğv olunub', AUTO],
    identity: ['Kimlik', AUTO],
  },
  'api::push.push-broadcast': {
    dedupeKey: ['Açar', AUTO],
    targetUid: ['Bölmə', AUTO],
    docId: ['Qeyd ID', AUTO],
    slug: ['Ünvan (slug)', AUTO],
    title: ['Başlıq', AUTO],
    sentCount: ['Göndərilib', AUTO],
    failedCount: ['Uğursuz', AUTO],
    prunedCount: ['Silinmiş abunəlik', AUTO],
    sentAt: ['Göndərilmə vaxtı', AUTO],
  },
  'api::push.push-subscription': {
    locale: ['Dil'],
    topics: ['Mövzular', AUTO],
    failCount: ['Uğursuz cəhd', AUTO],
    lastSeenAt: ['Son aktivlik', AUTO],
    identity: ['Kimlik', AUTO],
  },
  'api::reaction.reaction': {
    targetType: ['Hədəf növü', AUTO],
    targetSlug: ['Hədəf (slug)', AUTO],
    emoji: ['Reaksiya', 'anchor — lövbər; ship — gəmi; compass — kompas; wave — dalğa.'],
    sessionId: ['Sessiya', AUTO],
  },
};

// ── Komponentlər ─────────────────────────────────────────────────────────────
const COMP: Record<string, Dict> = {
  'staff.role': {
    staffType: ['Heyət növü', 'akademik; telimci_texniki; inzibati; rehberlik; diger.'],
    position: ['Vəzifə', 'Məs.: «Kafedra müdiri».'],
    unitName: ['Bölmə', 'Bölmənin tam adı, dırnaqsız — bölmə səhifəsindəki adla EYNİ yazılmalıdır.'],
    sortOrder: ['Sıra', SORT],
  },
  'staff.language': {
    lang: ['Dil', 'az; tr; en; ru; diger — digər.'],
    level: ['Səviyyə', 'Məs.: «C1», «sərbəst», «ana dili».'],
  },
  'staff.scholar': {
    spin: ['SPIN-kod', 'eLibrary (RİNTS) müəllif kodu.'],
    orcid: ['ORCID', 'Format: 0000-0002-1825-0097.', '0000-0000-0000-0000'],
    researcherId: ['ResearcherID', 'Web of Science, məs. «A-1234-2018».'],
    scopusAuthorId: ['Scopus Author ID', 'Yalnız rəqəmlər.'],
    googleScholar: ['Google Scholar', 'Profilin tam keçidi, https:// ilə.'],
  },
  'staff.tag': { label: ['Mövzu', '2–4 söz.'] },
  'staff.publication': {
    title: ['Nəşrin adı'],
    year: ['İl'],
    source: ['Jurnal / mənbə'],
    url: ['Keçid', 'DOI və ya məqalənin ünvanı, https:// ilə.'],
  },
  'staff.experience': {
    period: ['Dövr', '«2010–2015» və ya «2018–indiyədək».'],
    organization: ['Təşkilat'],
    position: ['Vəzifə'],
    sortYear: ['Sıralama ili', 'Başlanğıc ili, məs. 2018 — siyahı bu ilə görə düzülür.'],
  },
  'staff.education': {
    period: ['Dövr', 'Məs.: «2004–2008».'],
    institution: ['Təhsil müəssisəsi'],
    qualification: ['İxtisas / dərəcə', 'Məs.: «Bakalavr, gəmi mexanikası».'],
    sortYear: ['Sıralama ili', 'Başlanğıc ili — siyahı bu ilə görə düzülür.'],
  },
  'staff.vacancy': {
    position: ['Vəzifə'],
    note: ['Qeyd', 'Tələblər, əlaqə və s.'],
  },
  'nav.link': {
    label: ['Ad', 'Menyuda görünən mətn.'],
    url: ['Keçid', 'Daxili səhifə «/sehife/…» kimi (dilsiz), xarici sayt https:// ilə. Hazır olmayan səhifə: «/hazirlanir/<slug>».'],
  },
  'nav.group': {
    title: ['Qrupun adı'],
    links: ['Keçidlər'],
  },
  'nav.category': {
    label: ['Ad'],
    order: ['Sıra', SORT],
    url: ['Keçid', '«#» — açılan menyu; ünvan — birbaşa keçid.'],
    groups: ['Qruplar'],
  },
  'nav.footercol': {
    title: ['Sütunun adı'],
    links: ['Keçidlər'],
  },
  'nav.portal': {
    title: ['Başlıq'],
    subtitle: ['Alt başlıq'],
    cards: ['Kartlar'],
  },
  'nav.portalcard': {
    label: ['Ad'],
    description: ['Təsvir', 'Bir qısa cümlə.'],
    url: ['Keçid', URL_RULE],
    icon: ['İkon', 'Tabler ikon adı, məs. «school» (ti ti-school).'],
  },
  'nav.quicklink': {
    label: ['Ad'],
    url: ['Keçid'],
    icon: ['İkon', 'Tabler ikon adı, məs. «calendar».'],
  },
  'program.course': {
    code: ['Kod', 'Fənnin şifri.'],
    name: ['Fənnin adı'],
    credits: ['Kredit'],
    totalHours: ['Ümumi saat'],
    auditHours: ['Auditoriya saatı'],
    selfStudyHours: ['Sərbəst iş saatı'],
    semester: ['Semestr', 'Məs.: «1» və ya «1–2».'],
    prerequisite: ['Ön şərt fənn'],
    corequisite: ['Paralel fənn'],
    weeklyLoad: ['Həftəlik yük', 'Məs.: «2+2».'],
    groupCode: ['Qrup kodu', '«İxt-…» — ixtisaslaşma fənni; «ÜF-», «MF-» — ortaq fənlər.'],
    isPractice: ['Təcrübədir', 'Üzmə/istehsalat təcrübəsi üçün aktiv edin.'],
  },
  'program.admission-score': {
    year: ['İl'],
    minScorePaid: ['Ödənişli (minimum bal)', 'Onluq bal NÖQTƏ ilə: 239.5 — vergül rəqəmi 2395 edir.'],
    minScoreFree: ['Ödənişsiz (minimum bal)', 'Onluq bal NÖQTƏ ilə: 239.5.'],
  },
  'program.admission-seats': {
    year: ['İl'],
    total: ['Cəmi yer'],
    azFullTime: ['Azərbaycan bölməsi, əyani'],
    azPartTime: ['Azərbaycan bölməsi, qiyabi'],
    ruFullTime: ['Rus bölməsi, əyani'],
    enFullTime: ['İngilis bölməsi, əyani'],
    stateFunded: ['Dövlət sifarişi'],
    paid: ['Ödənişli'],
  },
  'program.highlight': {
    value: ['Rəqəm / fakt', 'Məs.: «240».'],
    label: ['İzah', 'Məs.: «kredit».'],
  },
  'program.language': { code: ['Dil', 'az; ru; en.'] },
  'unit.faq': {
    question: ['Sual'],
    answer: ['Cavab'],
  },
  'unit.reception-slot': {
    day: ['Gün'],
    timeFrom: ['Başlanğıc', 'Məs.: 09:00.'],
    timeTo: ['Bitmə', 'Məs.: 13:00.'],
    note: ['Qeyd', 'Məs.: «yalnız tələbələr üçün».'],
  },
  'event.speaker': {
    name: ['Ad, soyad'],
    role: ['Vəzifə / mövzu'],
    org: ['Təşkilat'],
    photo: ['Şəkil', PHOTO_PORTRAIT],
  },
  'facility.inventory': {
    name: ['Avadanlıq'],
    quantity: ['Say'],
    note: ['Qeyd'],
  },
  'hero.honor': { label: ['Təltif', 'Məs.: «“Vətən uğrunda” medalı».'] },
};

// ── Tətbiq ───────────────────────────────────────────────────────────────────
type Meta = { edit?: Record<string, unknown>; list?: Record<string, unknown> };
interface Conf {
  settings: Record<string, unknown>;
  metadatas: Record<string, Meta>;
  layouts: Record<string, unknown>;
}

const isDefault = (label: unknown, field: string): boolean => label === undefined || label === null || label === '' || label === field;
const isEmpty = (v: unknown): boolean => v === undefined || v === null || v === '';

/** Bir konfiqurasiyaya lüğəti tətbiq et. Dəyişən sahələrin sayını qaytarır. */
function merge(conf: Conf, dict: Dict): number {
  let n = 0;
  for (const [field, [label, description, placeholder]] of Object.entries(dict)) {
    const meta = conf.metadatas[field];
    if (!meta) continue;
    let touched = false;
    if (meta.edit) {
      if (isDefault(meta.edit.label, field)) { meta.edit.label = label; touched = true; }
      if (description && isEmpty(meta.edit.description)) { meta.edit.description = description; touched = true; }
      if (placeholder && isEmpty(meta.edit.placeholder)) { meta.edit.placeholder = placeholder; touched = true; }
    }
    if (meta.list && isDefault(meta.list.label, field)) { meta.list.label = label; touched = true; }
    if (touched) n++;
  }
  return n;
}

const MARKER = 'cmAz:v1';

export async function applyAzFieldLabels(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  if ((await store.get({ key: MARKER })) === true) return;

  const cm = strapi.plugin('content-manager');
  const cts = cm.service('content-types') as unknown as {
    findContentType: (uid: string) => { uid: string } | null;
    findConfiguration: (ct: { uid: string }) => Promise<Conf & { uid?: string }>;
    updateConfiguration: (ct: { uid: string }, conf: Conf) => Promise<unknown>;
  };
  const comps = cm.service('components') as unknown as {
    findComponent: (uid: string) => { uid: string } | null | undefined;
    findConfiguration: (c: { uid: string }) => Promise<Conf & { uid?: string; category?: string }>;
    updateConfiguration: (c: { uid: string }, conf: Conf) => Promise<unknown>;
  };

  let types = 0;
  let fields = 0;
  for (const [uid, dict] of Object.entries(CT)) {
    const ct = cts.findContentType(uid);
    if (!ct) continue;
    const conf = await cts.findConfiguration(ct);
    const n = merge(conf, dict);
    if (!n) continue;
    await cts.updateConfiguration(ct, { settings: conf.settings, metadatas: conf.metadatas, layouts: conf.layouts });
    types++;
    fields += n;
  }
  for (const [uid, dict] of Object.entries(COMP)) {
    const c = comps.findComponent(uid);
    if (!c) continue;
    const conf = await comps.findConfiguration(c);
    const n = merge(conf, dict);
    if (!n) continue;
    await comps.updateConfiguration(c, { settings: conf.settings, metadatas: conf.metadatas, layouts: conf.layouts });
    types++;
    fields += n;
  }
  await store.set({ key: MARKER, value: true });
  strapi.log.info(`[adda-admin] Az sahə adları və qaydalar: ${types} bölmə/komponent, ${fields} sahə.`);
}

/** Yoxlama üçün (lokal sınaq): lüğətdə olan bölmə və sahə sayı. */
export const CM_AZ_SIZE = {
  types: Object.keys(CT).length + Object.keys(COMP).length,
  fields: [...Object.values(CT), ...Object.values(COMP)].reduce((a, d) => a + Object.keys(d).length, 0),
};
