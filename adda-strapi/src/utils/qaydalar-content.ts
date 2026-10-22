/**
 * F5.57 — «Qaydalar» və «Təlimat» qovluqları (media kitabxanası): ADDA-TL-001…027 və
 * ADDA-ƏP-001…004, keyfiyyəti idarəetmə sisteminin sənədləri (ISO 9001:2015).
 *
 *   RULE_DOCS        — 30 sənəd («1. Məzmun — Sənəd»): qaydalar — kateqoriya «qayda»,
 *                      təlimat və prosedurlar — «telimat». Yoxdursa yaradılır və dərc
 *                      olunur; bölmənin sənədi bölməyə, hamısı izah olunduğu səhifəyə
 *                      (`url`) bağlanır. Fayl media kitabxanasında adındakı koddan
 *                      tapılır («ADDA_-TL-024…», «ADDA-EP-003…»).
 *   QAYDA_PAGES      — reyestr (dataBlock=qaydalar) və 12 yeni səhifə (az): sənədlərin
 *                      tələbə, müəllim və vətəndaş üçün vacib hissəsi sadə dillə; KİS
 *                      sənədlərinin «Prosesin ölçüləri», «Resurslar» kimi texniki
 *                      bölmələri saytda yoxdur.
 *   TEXT_FIXES       — mövcud səhifələrin seed mətnində dəqiq fraqment dəyişikliyi
 *                      (yekun attestasiya, əcnəbi tələbələr); redaktor dəyişibsə toxunulmur.
 *   RULE_PAGE_LINKS  — mövcud səhifələrin yan keçidləri (yalnız yoxdursa).
 *   RULE_MENU_*      — menyunun «hazırlanır» keçidləri və yeni keçidlər.
 *
 * Fayl keçidləri `{{TL:n}}` / `{{EP:n}}` — miqrasiya faylın ünvanını qoyur (fayl
 * tapılmasa keçid düşür). Mətn yalnız az dilindədir (sənədlərin özü də); ru/en
 * tərcümə işi (translate-missing.ts) yenidən işə salınanda doldurulur.
 *
 * Mənbələr arasında uyğunsuzluqlar (CLAUDE.md, F5.57): TL-008-in faylı «ADDA-TL-009…»
 * adı ilə yüklənib; TL-012-nin iki variantı var (bağlanan — «Daxili intizam
 * qaydaları», 28.01.2025); TL-006 üç dəfə yüklənib (bağlanan — PDF); apellyasiya
 * müddəti ƏS-007-də «1 iş günü, rektora», TL-018-də «elan günü, apellyasiya
 * komissiyasına» — səhifədə ƏS-007-nin mətni saxlanılıb.
 */
import type { LinkSeed, QebulPageSeed } from './qebul-pages-content';
import { ACADEMY_PHONE_AZ } from './phone-fix';

export const RULES_SLUG = 'qaydalar-ve-telimatlar';

export type RulePrefix = 'TL' | 'EP';
export type RuleCategory = 'qayda' | 'telimat';

export interface RuleDocSeed {
  prefix: RulePrefix;
  /** Sənədin özündəki kod (ADDA-TL-0NN / ADDA-ƏP-00N). */
  code: number;
  /** Fayl adındakı kod fərqlidirsə (TL-008 → «ADDA-TL-009…»). */
  fileCode?: number;
  /** Bir kodun bir neçə faylı varsa üstünlük verilən (fayl adı). */
  prefer?: RegExp;
  category: RuleCategory;
  /** Rəsmi ad (sənəd başlığı «… (ADDA-TL-0NN)» olur; 255 simvola qədər). */
  title: string;
  /** Qısa təsvir (500 simvola qədər). */
  description: string;
  /** İzah olunduğu səhifə. */
  url?: string;
  /** Bölmənin sənədi — bu bölmələrin «Sənədlər» siyahısında. */
  units?: string[];
}

/** «ADDA-TL-024», «ADDA-ƏP-003». */
export const ruleCode = (prefix: RulePrefix, n: number): string =>
  `ADDA-${prefix === 'EP' ? 'ƏP' : 'TL'}-${String(n).padStart(3, '0')}`;

/** Fayl keçidi (miqrasiya `{{TL:n}}`-i faylın ünvanı ilə əvəz edir). */
const tl = (n: number, label: string): LinkSeed => ({ label, url: `{{TL:${n}}}` });
const ep = (n: number, label: string): LinkSeed => ({ label, url: `{{EP:${n}}}` });

const TEDRIS = 'tedris-proseslerinin-teskili-sobesi';
const TTM = 'telim-tedris-merkezi';
const PERSONAL = 'personalin-idareedilmesi-emek-haqqi-ve-karguzarliq-sobesi';
const ETBES = 'elmi-tedqiqat-ve-beynelxalq-elaqeler-sobesi';
const INGILIS = 'ingilis-dili-kafedrasi';

const p = (slug: string): string => `/sehife/${slug}`;
const U = (slug: string): string => `/struktur/${slug}`;

export const RULE_PAGE_SLUGS = {
  registry: RULES_SLUG,
  credit: 'kredit-sistemi',
  exams: 'qiymetlendirme-ve-imtahan-qaydalari',
  summer: 'yay-semestri-ve-elave-kesir',
  transfer: 'kocurme-ve-berpa',
  practice: 'diplomqabagi-tecrube',
  teaching: 'tedrisin-teskili',
  diploma: 'diplom-ve-transkript',
  integrity: 'akademik-durustluk',
  discipline: 'daxili-intizam-qaydalari',
  honorary: 'fexri-adlar',
  appeals: 'muracietlere-baxilma-qaydasi',
  hiring: 'ise-qebul-qaydalari',
} as const;
const S = RULE_PAGE_SLUGS;

// ── Sənədlər ─────────────────────────────────────────────────────────────────
export const RULE_DOCS: RuleDocSeed[] = [
  // Qovluq «Qaydalar»
  {
    prefix: 'TL',
    code: 10,
    category: 'qayda',
    title: 'Antiplagiat sisteminin istifadə qaydaları',
    description:
      'Dissertasiya, məqalə və tədris vəsaitlərinin StrikePlagiarism sistemində yoxlanılması: oxşarlıq əmsalları, icazə verilən hədlər, Plagiat Məsələləri üzrə Komissiya və apellyasiya.',
    url: p(S.integrity),
    units: [ETBES],
  },
  {
    prefix: 'TL',
    code: 11,
    category: 'qayda',
    title: 'Əcnəbilərin və vətəndaşlığı olmayan şəxslərin hazırlıq kurslarında təhsil alması qaydaları',
    description:
      'Əcnəbilərin Akademiyanın hazırlıq kurslarına qəbulu (TMİS), sənədlər, qəbul tarixləri, təhsil müddəti, ödəniş və xaric olunma halları.',
    url: p('ecnebi-telebelerin-qebulu-qaydalari'),
    units: [ETBES],
  },
  {
    prefix: 'TL',
    code: 12,
    prefer: /intizam/i,
    category: 'qayda',
    title: 'Daxili intizam qaydaları',
    description:
      'İşçilərin, tələbələrin və dinləyicilərin əmək və tədris intizamı, iş vaxtı, davranış qaydaları, həvəsləndirmə və intizam tənbehləri.',
    url: p(S.discipline),
    units: [PERSONAL],
  },
  {
    prefix: 'TL',
    code: 13,
    category: 'qayda',
    title: 'Akademiyanın «Fəxri doktoru» haqqında qayda',
    description:
      '«Akademiyanın fəxri doktoru» adının statusu və hüquqları, namizədliyin irəli sürülməsi, Elmi Şuranın qərarı və diplomun təqdim mərasimi.',
    url: p(S.honorary),
    units: [ETBES],
  },
  {
    prefix: 'TL',
    code: 14,
    category: 'qayda',
    title: 'İşçi qrupu haqqında qaydalar',
    description:
      'Keyfiyyəti idarəetmə sistemi (ISO 9001) üzrə işçi qrupunun funksiyaları, hüquqları, məsuliyyəti və digər bölmələrlə qarşılıqlı əlaqəsi.',
    url: p('keyfiyyet-idareetme-sistemi'),
  },
  {
    prefix: 'TL',
    code: 15,
    category: 'qayda',
    title: 'Akademiyanın «Fəxri professoru» haqqında qayda',
    description:
      '«Fəxri professor» adının verilmə şərtləri (elmi dərəcə, ən azı 15 il elmi-pedaqoji təcrübə), namizədliyin irəli sürülməsi və Elmi Şuranın qərarı.',
    url: p(S.honorary),
    units: [ETBES],
  },
  {
    prefix: 'TL',
    code: 16,
    category: 'qayda',
    title: '«Qaynar xətt» xidməti haqqında qaydalar',
    description:
      '«Qaynar xətt»in telefonları və e-poçtu, zənglərin və elektron müraciətlərin qəbulu, qeydiyyatı və cavablandırılması.',
    url: p(S.appeals),
  },
  {
    prefix: 'TL',
    code: 17,
    category: 'qayda',
    title: 'İmtahanların keçirilmə qaydaları',
    description:
      'Semestr imtahanları: imtahan günü qaydaları, yazılı, test (Elektron Akademiya) və yazılı-şifahi imtahan, nəticələrin elanı və apellyasiya.',
    url: p(S.exams),
    units: [TEDRIS],
  },
  {
    prefix: 'TL',
    code: 18,
    category: 'qayda',
    title: 'Buraxılış yekun dövlət attestasiyasının (dövlət imtahanının) keçirilməsi qaydaları',
    description:
      'Dövlət imtahanının iki mərhələsi (nəzəri və praktiki suallar), biletlər, vaxt normaları, Dövlət Attestasiya Komissiyasının iş qaydası.',
    url: p('yekun-dovlet-attestasiyasi'),
    units: [TEDRIS],
  },
  {
    prefix: 'TL',
    code: 19,
    category: 'qayda',
    title: 'Professor-müəllim heyətinin və əməkdaşların işə qəbulu',
    description:
      'Vakansiya elanları, tələb olunan sənədlər, açıq sınaq dərsi, sınaq müddəti, əmək müqaviləsi, ixtisasartırma və kadrların yenidən hazırlanması.',
    url: p(S.hiring),
    units: [PERSONAL],
  },
  {
    prefix: 'TL',
    code: 20,
    category: 'qayda',
    title: 'Tədrisi ingilis dilində aparılan fənlər üzrə imtahanların keçirilmə qaydaları',
    description:
      'İngilis dilində tədris olunan qruplarda ingilis dili fənləri üzrə imtahanlar: biletlərin quruluşu, vaxt, 50 ballıq qiymətləndirmə.',
    url: p(S.exams),
    units: [INGILIS],
  },
  {
    prefix: 'TL',
    code: 21,
    category: 'qayda',
    title: 'Diplomqabağı təcrübənin qiymətləndirilməsi qaydaları',
    description:
      'Diplomqabağı təcrübənin təşkili, yekun hesabatın tərtibi və iki mərhələli qiymətləndirmə: təcrübə bazasında və Akademiyada.',
    url: p(S.practice),
  },
  {
    prefix: 'TL',
    code: 22,
    category: 'qayda',
    title: 'İxtisas üzrə əmək fəaliyyəti əsasında tədris təcrübəsindən azad olunma qaydaları (qiyabi təhsil)',
    description:
      'Qiyabi təhsil alan tələbənin ixtisası üzrə əmək fəaliyyətinin tədris təcrübəsi kimi tanınması: şərtlər, sənədlər və Təcrübə Komissiyasının qərarı.',
    url: p(S.practice),
    units: [TEDRIS],
  },
  {
    prefix: 'TL',
    code: 23,
    category: 'qayda',
    title: 'Bakalavriat səviyyəsinə qəbul olunan subbakalavrların kreditlərinin tanınması qaydaları',
    description:
      'Kollecdən bakalavriata qəbul olunanların fənlərinin uyğunlaşdırma cədvəli, kafedraların rəyi, fakültə Elmi Şurasının təsdiqi və fərdi tədris planı.',
    url: p(S.transfer),
    units: [TEDRIS],
  },
  {
    prefix: 'TL',
    code: 24,
    category: 'qayda',
    title:
      'Bərpa, köçürmə, akademik məzuniyyət, təhsil formasının dəyişməsi, ikili diplom, mübadilə və təkrar ali təhsil zamanı kreditlərin tanınması qaydaları',
    description:
      'Rəsmi adı: «Bərpa olunan, akademik məzuniyyətdən qayıdan, təhsilalma formasını dəyişən, köçürülən, ikili diplom və ya mübadilə proqramlarında iştirak edən, təkrar ali təhsilə qəbul olunan tələbələrin kreditlərinin tanınması və kredit fərqlərinin müəyyənləşdirilməsi qaydaları».',
    url: p(S.transfer),
    units: [TEDRIS],
  },
  {
    prefix: 'TL',
    code: 25,
    category: 'qayda',
    title: 'Fənlər üzrə əlavə kəsir qruplarının təşkili qaydaları',
    description:
      'Akademik borcu ləğv etmək üçün semestr ərzində əlavə kəsir qruplarının təşkili: qeydiyyat, minimum tələbə sayı, davamiyyət, imtahana buraxılış və ödəniş.',
    url: p(S.summer),
    units: [TEDRIS],
  },
  {
    prefix: 'TL',
    code: 26,
    category: 'qayda',
    title: 'Yay semestrinin təşkili qaydaları',
    description:
      'Yay semestrinin məqsədləri, qeydiyyat (5 iyuladək), müddət, kredit həddi, imtahanlar, apellyasiya və ödəniş qaydası.',
    url: p(S.summer),
    units: [TEDRIS],
  },
  {
    prefix: 'TL',
    code: 27,
    category: 'qayda',
    title: 'Bakalavriat və magistratura səviyyələrində kredit sistemi ilə tədrisin təşkili qaydaları',
    description:
      'Tədris ili və kreditlər, fərdi tədris planı, davamiyyət, akademik borc və təkrar imtahan, yay semestri, akademik məsləhətçi (tyutor) və akademik mobillik.',
    url: p(S.credit),
    units: [TEDRIS],
  },
  // Qovluq «Təlimat»
  {
    prefix: 'TL',
    code: 1,
    category: 'telimat',
    title: 'Kursun təlim planının və proqramının işlənib hazırlanması',
    description: 'Tədris planı, fənn proqramı və işçi proqramın (sillabusun) quruluşu və hazırlanması qaydası.',
    url: p(S.teaching),
    units: [TEDRIS],
  },
  {
    prefix: 'TL',
    code: 2,
    category: 'telimat',
    title: 'Qısa müddətli kursların keçirilməsi',
    description:
      'Təlim Tədris Mərkəzində qısa müddətli kurslara hazırlıq, təlimin keçirilməsi, dinləyicilərin biliyinin yoxlanılması və nəzarət.',
    units: [TTM],
  },
  {
    prefix: 'TL',
    code: 3,
    category: 'telimat',
    title: 'Kredit sistemi ilə tədris prosesinin təşkili',
    description:
      'Tədris ilinə hazırlıq, tələbələrin qəbulu, tədrisin təşkili və nəzarət, biliklərin yoxlanılması, kursdan kursa köçürmə, təcrübələr və yekun attestasiya.',
    url: p(S.credit),
    units: [TEDRIS],
  },
  {
    prefix: 'TL',
    code: 4,
    category: 'telimat',
    title: 'Mühazirə dərsləri',
    description: 'Mühazirə dərslərinin məqsədi, müddəti, hazırlanması, keçirilməsi və keyfiyyətinin yoxlanılması.',
    url: p(S.teaching),
  },
  {
    prefix: 'TL',
    code: 5,
    category: 'telimat',
    title: 'Laboratoriya dərsləri',
    description: 'Laboratoriya dərslərinin məqsədi, onlara qoyulan tələblər, hazırlıq və keçirilmə qaydası.',
    url: p(S.teaching),
  },
  {
    prefix: 'TL',
    code: 6,
    prefer: /\.pdf$/i,
    category: 'telimat',
    title: 'Praktiki məşğələ və trenajor hazırlığı təlimatı',
    description:
      'Praktiki məşğələlərin keçirilməsi, keyfiyyət meyarları, tələbələrin qiymətləndirilməsi və trenajor avadanlığına texniki dəstək.',
    url: p(S.teaching),
    units: [TTM],
  },
  {
    prefix: 'TL',
    code: 7,
    category: 'telimat',
    title: 'Kurs layihəsi və kurs işi',
    description: 'Kurs layihəsi və kurs işinin məqsədi, planlaşdırılması, mövzuların təsdiqi, rəhbərlik və müdafiə.',
    url: p(S.teaching),
  },
  {
    prefix: 'TL',
    code: 8,
    fileCode: 9,
    category: 'telimat',
    title: 'Trenajorda hazırlığın və qiymətləndirmənin aparılması',
    description:
      'Naviqasiya, gəmi energetikası və elektrik ixtisasları üzrə trenajor dərsləri (STCW A-I/12, B-I/12, IMO model kursları) və MER-3D trenajorunda tapşırıqların qiymətləndirilməsi.',
    url: p(S.teaching),
    units: [TTM],
  },
  {
    prefix: 'EP',
    code: 1,
    category: 'telimat',
    title: 'İstehlakçılarla iş',
    description:
      'Müəssisə və təşkilatlarla təhsil müqavilələrinin hazırlanması, razılaşdırılması və izlənilməsi, istehlakçıların rəy və şikayətləri.',
    units: [TTM],
  },
  {
    prefix: 'EP',
    code: 2,
    category: 'telimat',
    title: 'Tədris prosesinin təmin edilməsi və həyata keçirilməsi',
    description:
      'Tədris prosesinin təmin edilməsi prosesinin giriş və çıxış məlumatları, cavabdehlər, tədris qrafiki və hesabatlar.',
    url: p(S.teaching),
    units: [TEDRIS],
  },
  {
    prefix: 'EP',
    code: 3,
    category: 'telimat',
    title: 'Diplomların, akademik transkriptlərin və dublikat diplomların alınması, saxlanılması, doldurulması və qeydiyyatı proseduru',
    description:
      'Diplom blanklarının sifarişi və saxlanılması, diplomun doldurulması və verilməsi, dublikat diplom və akademik transkriptin verilməsi.',
    url: p(S.diploma),
    units: [TEDRIS],
  },
  {
    prefix: 'EP',
    code: 4,
    category: 'telimat',
    title: 'Distant təhsilin təşkili',
    description: 'Distant təhsilin modelləri və texnologiyaları, onun Akademiyada təşkili və tətbiqi.',
    url: p(S.teaching),
    units: [TEDRIS],
  },
];

// ── Ümumi keçidlər və əlaqə ──────────────────────────────────────────────────
const REGISTRY_LINK: LinkSeed = { label: 'Qaydalar və təlimatlar', url: p(RULES_SLUG) };
const OFFICE_LINK: LinkSeed = { label: 'Tədris ofisi', url: U(TEDRIS) };
const CREDIT_LINK: LinkSeed = { label: 'Kredit sistemi ilə tədris', url: p(S.credit) };
const EXAMS_LINK: LinkSeed = { label: 'Qiymətləndirmə və imtahan qaydaları', url: p(S.exams) };
const YDA_LINK: LinkSeed = { label: 'Yekun dövlət attestasiyası', url: p('yekun-dovlet-attestasiyasi') };
const ASK = '/vetendaslarin-muracieti';
const PHONE = `**Telefon:** ${ACADEMY_PHONE_AZ}`;
const MAIL = '**E-poçt:** info@adda.edu.az';
const OFFICE = '[Tədris proseslərinin təşkili şöbəsi](/struktur/tedris-proseslerinin-teskili-sobesi)';
const TEDRIS_CONTACT =
  `**Təşkilat:** ${OFFICE}, fakültə dekanlıqları\n\n${PHONE}\n\n` + `Sualınızı [onlayn göndərin](${ASK}?istiqamet=tedris).`;

// ── 1. Reyestr ───────────────────────────────────────────────────────────────
const REGISTRY_PAGE: QebulPageSeed = {
  slug: RULES_SLUG,
  dataBlock: 'qaydalar',
  layout: 'akademiya',
  az: {
    title: 'Qaydalar və təlimatlar',
    lead:
      'Akademiyada tədrisin, imtahanların, təcrübənin və daxili həyatın qaydaları, dərslərin təşkili üzrə təlimat və prosedurlar: hər sənədin faylı və izah olunduğu səhifə bir yerdə.',
    body: `Qaydalar, təlimatlar və prosedurlar Akademiyanın [keyfiyyəti idarəetmə sisteminin](/sehife/keyfiyyet-idareetme-sistemi) (ISO 9001:2015) sənədləridir. Onlar «Təhsil haqqında» Qanuna, Nazirlər Kabinetinin qərarlarına, STCW Konvensiyasına və Akademiyanın [Nizamnaməsinə](/sehife/nizamname) əsaslanır. Struktur bölmələrin, şuraların və proseslərin vəzifələri isə [əsasnamələrdə](/sehife/struktur-bolmelerin-esasnameleri) verilib.

Siyahıda sənədin adı onun izah olunduğu səhifəyə aparır. Tələbələr üçün əsas qaydalar ayrıca səhifələrdə qısa izah olunub:

- [Kredit sistemi ilə tədris](/sehife/kredit-sistemi): tədris ili, kreditlər, fərdi tədris planı, davamiyyət, akademik borc.
- [Qiymətləndirmə və imtahan qaydaları](/sehife/qiymetlendirme-ve-imtahan-qaydalari): imtahan günü, yazılı, test və yazılı-şifahi imtahan, apellyasiya.
- [Yay semestri və əlavə kəsir qrupları](/sehife/yay-semestri-ve-elave-kesir): akademik borcun ləğvi və qiymətin yüksəldilməsi.
- [Köçürmə, bərpa və kreditlərin tanınması](/sehife/kocurme-ve-berpa).
- [Diplomqabağı təcrübə](/sehife/diplomqabagi-tecrube): hesabat, qiymətləndirmə, qiyabi təhsildə təcrübədən azad olunma.
- [Daxili intizam qaydaları](/sehife/daxili-intizam-qaydalari) və [akademik dürüstlük](/sehife/akademik-durustluk).

## Sənədlərin qüvvəsi

Sənədləri Akademiyanın rəhbərliyi təsdiq edir, onlara dəyişiklik Elmi Şurada müzakirə olunur. Sənədin tələbi qanunvericiliklə ziddiyyət təşkil edərsə, qüvvədə olan qanunvericilik və Akademiyanın Nizamnaməsi əsas götürülür. Saytdakı izah qısa məlumatdır, rəsmi mətn sənədin faylıdır.`,
    seoDescription:
      'ADDA-nın qaydaları, təlimatları və prosedurları (ADDA-TL, ADDA-ƏP): tədris, imtahan, təcrübə, daxili intizam; fayllar və aid olduqları səhifələr.',
    sideLinks: [
      { label: 'Struktur bölmələrin əsasnamələri', url: p('struktur-bolmelerin-esasnameleri') },
      { label: 'Akademiyanın Nizamnaməsi', url: p('nizamname') },
      { label: 'Keyfiyyəti idarəetmə sistemi', url: p('keyfiyyet-idareetme-sistemi') },
      OFFICE_LINK,
    ],
    contact:
      `**Tədris qaydaları:** ${OFFICE}\n\n**Hüquqi məsələlər:** [Hüquq məsləhətçisi](/struktur/huquq-meslehetcisi)\n\n` +
      `${PHONE}\n\n${MAIL}`,
  },
};

// ── 2. Kredit sistemi (TL-027, TL-003) ───────────────────────────────────────
const CREDIT_PAGE: QebulPageSeed = {
  slug: S.credit,
  dataBlock: 'yox',
  layout: 'tehsil',
  az: {
    title: 'Kredit sistemi ilə tədris',
    lead:
      'Bakalavriat və magistraturada tədris kredit sistemi ilə aparılır: hər tələbənin fərdi tədris planı var, fənlər kreditlə ölçülür, bakalavr 240, magistr 120 kredit toplayır.',
    body: `Akademiyada bakalavriat və magistratura səviyyələrində tədris Nazirlər Kabinetinin 24 dekabr 2013-cü il tarixli 348 nömrəli qərarı ilə təsdiq edilmiş qaydalar və Akademiyanın «Kredit sistemi ilə tədrisin təşkili qaydaları» (ADDA-TL-027) əsasında aparılır. Dənizçilik ixtisaslarında STCW Konvensiyasının və IMO model kurslarının tələbləri də nəzərə alınır. Qaydalar əyani (tədrisə tam və qismən cəlb olunma) və qiyabi təhsilə şamil edilir, kredit sistemini [Tədris ofisi](/struktur/tedris-proseslerinin-teskili-sobesi) və dekanlıqlar tənzimləyir.

## Tədris ili və kreditlər

- Tədris ili iki semestrdən (payız və yaz) ibarətdir; yay tətilində 6 həftəyə qədər [yay semestri](/sehife/yay-semestri-ve-elave-kesir) təşkil oluna bilər.
- Əyani təhsildə tədris ili 40 həftədir, hər semestr 20 həftə (o cümlədən 5 həftə imtahan sessiyası).
- Qiyabi təhsildə tədris ili 32 həftədir. Hər semestr 16 həftədir: 12 həftə sərbəst hazırlıq, 3 həftə nəzəri dərslər, 1 həftə imtahan sessiyası; semestrə 24 kredit müəyyən edilir.
- 1 kredit tələbənin auditoriya və auditoriyadankənar 30 saatlıq işidir. Həftəlik yük 45 saat, yəni 1,5 kreditdir; təcrübəyə, imtahanlara və buraxılış işinə ayrılan hər həftə də 1,5 kredit sayılır.
- Semestrə tədrisə tam cəlb olunan (full-time) tələbəyə 30, qismən cəlb olunan (part-time) tələbəyə 20-yə qədər kredit müəyyən edilir. Bir semestrdə götürülən kreditlər 40-dan çox ola bilməz.
- Bakalavriatda 240, magistraturada (normativ müddət 2 il) 120 kredit toplamaq məcburidir.

## Dəniz təcrübəsi

STCW Konvensiyasının tələblərinə görə dənizçilik ixtisaslarında 52 həftə təcrübə (üzmə) nəzərdə tutulur. Bunun 14 həftəsi diplomqabağı üzmə təcrübəsidir və 21 kredit verir; qalan 38 həftə kreditsiz, lakin məcburidir. Ətraflı: [Təcrübə (praktika)](/sehife/tecrube-haqqinda), [Diplomqabağı təcrübə](/sehife/diplomqabagi-tecrube).

## Fərdi tədris planı

- Hər tələbənin fərdi tədris planı var: tədris ili ərzində keçəcəyi fənlər, onların kreditləri və müəllimlər.
- Birinci kurs tələbəsinin planını fakültə hazırlayır, tələbə onu 10 sentyabradək alır.
- Sonrakı illərdə tələbə planını özü tərtib edir və 5–15 iyul tarixlərində fakültəyə təqdim edir, 10 sentyabradək düzəliş edə bilər. Planı vaxtında təqdim etməyən tələbənin təhsili ixtisasın tədris qrafikinə uyğun təşkil olunur.
- Plan tərtib edilərkən fənlərin ardıcıllığı (prerekvizitlər) gözlənilir; əvvəlki ildən akademik borcu qalan fənlər plana birinci daxil edilir.
- Sonradan dəyişiklik edilmir. Yalnız payız semestrindən akademik borcu qalanlar qış tətilinin ilk həftəsində növbəti semestrin planına düzəliş edə bilər.
- Fənn üzrə müəyyən sayda tələbə yığılmadıqda həmin fənn tədris olunmur və tələbələr planlarını dəyişir.

## Akademik məsləhətçi (tyutor)

Tyutor rektorun əmri ilə təyin olunur. O, tələbəyə fərdi tədris planını tərtib etməyə və dəyişməyə kömək edir, tədris prosesi ilə bağlı məlumat və sənədləri təqdim edir, tələbələrin hüquqlarını və akademik maraqlarını qoruyur, yay semestrinin təşkilində iştirak edir.

## Davamiyyət

Fənn üzrə auditoriya saatlarının müəyyən həddindən çoxunda iştirak etməyən tələbə həmin fəndən imtahana buraxılmır. Elmi Şuranın qərarı ilə bu hədd bakalavriatın əyani formasında 15, qiyabi formasında və magistraturada 20 faizdir. Üzrlü səbəb (xəstəlik, yaxın qohumun vəfatı və s.) rəsmi sənədlə təsdiqləndikdə hədd 25 faiz götürülür ([Daxili intizam qaydaları](/sehife/daxili-intizam-qaydalari)). Milli yığma komandaların üzvü olan idmançı-tələbələrə bu məhdudiyyət şamil edilmir.

## Akademik borc və təkrar imtahan

- Fəndən müvəffəq qiymət alan tələbə həmin fənnin kreditlərini qazanır. Qeyri-müvəffəq qiymət alan və ya imtahanda iştirak etməyən tələbənin həmin fəndən akademik borcu yaranır.
- Akademik borcu olan tələbə fənni yenidən dinləmədən təkrar imtahan verə bilər: hər semestrdə ən çox iki fəndən, hər fəndən bir dəfə. Bu imtahanın haqqını, fənn üçün müəyyən olunan məbləğin 25 faizindən çox olmamaqla, Elmi Şura müəyyən edir.
- Üzrlü səbəbdən imtahanda iştirak etməyən tələbəyə növbəti semestrin dərsləri başlayanadək bir dəfə ödənişsiz imtahan vermək imkanı yaradılır.
- Digər hallarda fənn yenidən dinlənilir. Borcu ləğv etmək üçün [yay semestri və əlavə kəsir qrupları](/sehife/yay-semestri-ve-elave-kesir) da təşkil olunur.
- Semestrdə akademik borcu qalan tələbə növbəti semestrdə təqaüddən məhrum edilir; bütün fənlərdən kreditləri qazandıqda təqaüd bərpa olunur.
- Normativ müddətdə kreditləri toplaya bilməyən tələbə xaric edilmir, təhsilini ödənişli əsaslarla davam etdirir. Ödəniş illik təhsil haqqının 60-a bölünüb götürülən fənlərin kreditlərinə vurulması ilə hesablanır.
- Normativ müddətdən sonrakı 3 il ərzində (hərbi xidmət müddəti nəzərə alınmadan) kreditləri toplaya bilməyən tələbə məzmunu əsaslı dəyişmiş peşə hazırlığı fənlərindən əvvəl qazandığı kreditləri itirir.

## Əlavə fənlər və mobillik

- Tədrisə tam cəlb olunan tələbə ödənişli əsaslarla əlavə fənn seçə bilər. Dövlət sifarişi ilə oxuyan və bütün fənlərdən 81–100 bal toplayan tələbə öz ixtisası üzrə əlavə fənni ödənişsiz seçə bilər.
- Tələbə Akademiyanın razılığı ilə digər ali təhsil müəssisələrində, o cümlədən xaricdə kredit qazana bilər; belə kreditlər ixtisas üzrə kreditlərin 30 faizindən çox olmamalıdır. Mobillik üçün akademik transkript, ərizə forması, tədris razılığı və məlumat paketi tələb olunur ([Mübadilə və Erasmus+](/sehife/mobillik-ve-mubadile)).
- Tələbə öz akademik transkriptini təhsil dövründə istənilən vaxt ala bilər ([Diplom və akademik transkript](/sehife/diplom-ve-transkript)).

## Tədris prosesinin təşkili

Tədris ilinə hazırlıq (akademik yükün bölünməsi, auditoriya, laboratoriya və trenajorların hazırlanması, metodik materiallar), tələbələrin qəbulu, imtahanlar, kursdan kursa köçürmə, təcrübələr və [yekun dövlət attestasiyası](/sehife/yekun-dovlet-attestasiyasi) «Kredit sistemi ilə tədris prosesinin təşkili» təlimatı (ADDA-TL-003) üzrə aparılır. Dərs növləri: [Tədrisin təşkili və dərs növləri](/sehife/tedrisin-teskili).`,
    seoDescription:
      'ADDA-da kredit sistemi: tədris ili və kreditlər, fərdi tədris planı, davamiyyət, akademik borc, təkrar imtahan, tyutor və mobillik (ADDA-TL-027).',
    facts: [
      { label: 'Tədris ili', value: '40 həftə (əyani)', icon: 'tarix' },
      { label: '1 kredit', value: '30 saatlıq iş', icon: 'muddet' },
      { label: 'Bakalavriat / magistratura', value: '240 / 120 kredit', icon: 'diplom' },
    ],
    faq: [
      {
        question: 'Kreditləri vaxtında toplaya bilməsəm, Akademiyadan xaric olunacağam?',
        answer:
          'Xeyr. Normativ müddətdə kreditləri toplaya bilməyən tələbə tələbələr sırasında qalır və təhsilini ödənişli əsaslarla davam etdirir. Ödəniş illik təhsil haqqının 60-a bölünüb götürdüyünüz fənlərin kreditlərinə vurulması ilə hesablanır.',
      },
      {
        question: 'Fənni yenidən dinləmədən imtahan verə bilərəmmi?',
        answer:
          'Bəli, hər semestrdə ən çox iki fəndən, hər fəndən bir dəfə. Haqqı fənn üçün müəyyən olunan məbləğin 25 faizindən çox olmur və Elmi Şura tərəfindən müəyyən edilir.',
      },
      {
        question: 'Fərdi tədris planını nə vaxt təqdim etməliyəm?',
        answer:
          'Növbəti tədris ili üçün planı 5–15 iyul tarixlərində fakültəyə təqdim edirsiniz və 10 sentyabradək düzəliş edə bilərsiniz. Birinci kurs tələbələrinin planını fakültə hazırlayır.',
      },
    ],
    sideLinks: [
      OFFICE_LINK,
      EXAMS_LINK,
      { label: 'Yay semestri və əlavə kəsir', url: p(S.summer) },
      REGISTRY_LINK,
      tl(27, 'Kredit sistemi ilə tədrisin təşkili qaydaları (ADDA-TL-027)'),
      tl(3, 'Kredit sistemi ilə tədris prosesinin təşkili (ADDA-TL-003)'),
    ],
    contact: TEDRIS_CONTACT,
  },
};

// ── 3. Qiymətləndirmə və imtahanlar (TL-017, TL-020) ─────────────────────────
const EXAMS_PAGE: QebulPageSeed = {
  slug: S.exams,
  dataBlock: 'yox',
  layout: 'tehsil',
  az: {
    title: 'Qiymətləndirmə və imtahan qaydaları',
    lead:
      'Semestr imtahanları Elektron Akademiya platforması üzərindən yazılı, test və yazılı-şifahi qaydada keçirilir. Nəticə imtahan günü elan olunur, narazı tələbə həmin gün apellyasiya komissiyasına müraciət edə bilər.',
    body: `İmtahan tələbənin nəzəri biliyini, sərbəst işləmə bacarığını və bilikdən təcrübədə istifadə qabiliyyətini qiymətləndirir. İmtahan sessiyası rektorun əmri ilə keçirilir; ona tədris işləri üzrə prorektor, [Tədris ofisi](/struktur/tedris-proseslerinin-teskili-sobesi) və fakültə dekanları cavabdehdir, fənn üzrə yekun nəzarəti kafedra aparır. Qaydalar «İmtahanların keçirilmə qaydaları» (ADDA-TL-017) sənədindədir.

## İmtahana hazırlıq

- Fənn üzrə auditoriya saatlarının bakalavriatın əyani formasında 15, qiyabi formasında və magistraturada 20 faizindən çoxunda iştirak etməyən tələbə imtahana buraxılmır ([Kredit sistemi ilə tədris](/sehife/kredit-sistemi)).
- Hər fənn üzrə semestr ərzində 2 sərbəst iş və 1 kollokvium nəzərdə tutulur.
- İmtahan sualları semestrin başlanğıcından bir ay ərzində kafedrada təsdiq olunur və sessiyaya bir ay qalmış Elektron Akademiyaya yüklənir.

## İmtahan günü

- İmtahan cədvəli ilə əvvəlcədən tanış olun: tarix, saat və auditoriya.
- İmtahanın başlanmasına 15 dəqiqə qalmış auditoriyanın qarşısında olun; auditoriyaya imtahana 5 dəqiqə qalmış dəvət olunursunuz.
- İmtahana tələbə bileti (kartı) ilə buraxılırsınız.
- İmtahan başlayandan 10 dəqiqədən çox gecikən tələbə imtahana buraxılmır. Gecikmənin üzrlü səbəbi rəsmi sənədlə (məsələn, tibbi arayışla) təsdiqləndikdə həmin imtahanı növbəti semestrin dərsləri başlayanadək bir dəfə vermək imkanı yaradılır.
- Kitab, lüğət, konspekt, telefon və digər elektron vasitələr qadağandır. İmtahan vaxtı danışmaq, nəzarətçinin icazəsi olmadan zalı tərk etmək, siqaret çəkmək, qazsız sudan başqa nəsə yemək və içmək olmaz.
- Qayda pozulduqda nəzarətçi akt tərtib edir və tələbəni imtahandan kənarlaşdırır.
- Nəticələr imtahan günü, müstəsna hallarda ertəsi gün elan olunur.

## Yazılı imtahan

- Bilet və «Cavab kitabçası» götürüb təyin olunmuş yerdə əyləşirsiniz; cavablar yalnız bu kitabçaya yazılır.
- Qələm, karandaş və kalkulyator gətirmək olar. Kalkulyator proqramlaşdırılmayan və hərf klaviaturası olmayan olmalıdır; «Ali riyaziyyat» imtahanında kalkulyatora icazə verilmir.
- Səhv yazılmış hissənin üstündən xətt çəkilir; qaralamaq və korrektordan istifadə etmək olmaz. Cavabını bilmədiyiniz sual barədə bildiyinizi yazın: bu da qiymətləndirilir.
- Zalı imtahan başlayandan ən azı 40 dəqiqə sonra tərk etmək olar; sonda qalan iki tələbə zalı birlikdə tərk edir. «Cavab kitabçası»nı və bileti nəzarətçiyə təhvil vermədən çıxmaq olmaz.

## Test imtahanı

- Test imtahanı Elektron Akademiya platformasında keçirilir. İstənilən boş kompüterdə istifadəçi adınızı və şifrənizi özünüz daxil edirsiniz, qeydiyyat üçün 5 dəqiqə verilir. Şifrəni başqasına vermək və nəticəni saxtalaşdırmaq intizam məsuliyyəti yaradır.
- Sistem administratoru imtahana başlamaq üçün birdəfəlik şifrə verir.
- Test imtahanı 60 dəqiqədir; zalı başlanğıcdan 25 dəqiqə sonra tərk etmək olar. Nəticə ekranda görünür.
- Elektrik, internet və ya proqram nasazlığı üzündən imtahan yarımçıq qalarsa, hal araşdırılır və imtahana davam etmək üçün yeni birdəfəlik şifrə verilir.

## Yazılı-şifahi imtahan

- Biletdə 5 sual olur. Hazırlıq və qeydlər üçün 20 dəqiqəyə qədər, sualların cavablandırılması üçün 25 dəqiqəyə qədər vaxt verilir.
- Auditoriyada eyni vaxtda 3 nəfərdən çox tələbə olmur: əvvəlcə 2 tələbə dəvət olunur, növbəti tələbə əvvəlki cavab verməyə hazır olanda daxil olur.
- Hər sualın izahından sonra komissiya üzvləri əlavə suallar verə bilər; yekun qiymət cavablar əsasında müəyyən edilir.
- İmtahan bir akademik qrupun imtahana buraxılan bütün tələbələri imtahan verənədək davam edir.

## Nəticədən narazılıq

Nəticə ilə razı olmayan tələbə nəticələr elan olunan gün Akademiyanın apellyasiya komissiyasına şikayət verə bilər. Şikayətə 3 iş günü ərzində baxılır və qərar qəbul edilir. Yay semestrində apellyasiya müraciəti nəticə elan olunduqdan 24 saat ərzində verilir.

## İngilis dilində tədris olunan qruplarda

İngilis dilində tədris olunan qruplarda ingilis dili fənləri bir semestr (15 həftə) ərzində keçilir: Ümumi ingilis dili (90 saat), Kommunikativ ingilis dili (90 saat), Peşəkar ingilis dili (90 saat), İşgüzar ingilis dili (60 saat), Akademik oxu və yazı (60 saat). İmtahanlar ənənəvi qaydada və ya Microsoft Teams platformasında onlayn keçirilir, bilet 5 tapşırıqdan ibarətdir, nəticə 50 ballıq şkala ilə qiymətləndirilir («Tədrisi ingilis dilində aparılan fənlər üzrə imtahanların keçirilmə qaydaları», ADDA-TL-020).

- **Kommunikativ ingilis dili.** Tələbə 5–10 dəqiqə ərzində semestrdə keçilən 30 mövzudan birini danışır. Nitqin axıcılığı, rabitəliliyi, söz ehtiyatı, qrammatika və tələffüz hər biri 10 balla, B1 səviyyəsinin meyarlarına görə qiymətləndirilir. Cavabı ən azı 3 müəllim qiymətləndirir, imtahan yazıya alınır və apellyasiyada istifadə oluna bilər.
- **Digər fənlər.** Ənənəvi imtahan 2 saat, onlayn imtahan 1 saatdır. Biletin 5-ci tapşırığı esse (Akademik oxu və yazı, Peşəkar ingilis dili) və ya işgüzar yazışmadır (CV, dəvətnamə, sifariş və etiraz məktubu; İşgüzar ingilis dili). İşlər həmin gün yoxlanılır və nəticə elan olunur.

## Yekun attestasiya, təcrübə və dissertasiyalar

Buraxılış imtahanının qaydaları: [Yekun dövlət attestasiyası](/sehife/yekun-dovlet-attestasiyasi). Diplomqabağı təcrübənin qiymətləndirilməsi: [Diplomqabağı təcrübə](/sehife/diplomqabagi-tecrube). Dissertasiyaların antiplagiat yoxlaması: [Akademik dürüstlük və antiplagiat](/sehife/akademik-durustluk).`,
    seoDescription:
      'ADDA-da semestr imtahanları: imtahan günü qaydaları, yazılı, test və yazılı-şifahi imtahan, nəticələr və apellyasiya, ingilis dili imtahanları (ADDA-TL-017, TL-020).',
    facts: [
      { label: 'Gəlmə vaxtı', value: 'İmtahandan 15 dəqiqə əvvəl', icon: 'muddet' },
      { label: 'Test imtahanı', value: '60 dəqiqə', icon: 'imtahan' },
      { label: 'Apellyasiya', value: 'Nəticə elan olunan gün', icon: 'sened' },
    ],
    faq: [
      {
        question: 'İmtahana gecikdim. Nə etməliyəm?',
        answer:
          'İmtahan başlayandan 10 dəqiqədən çox gecikən tələbə buraxılmır. Gecikmənin üzrlü səbəbi varsa (məsələn, xəstəlik), rəsmi sənədi dekanlığa təqdim edin: imtahanı növbəti semestrin dərsləri başlayanadək bir dəfə vermək imkanı yaradılır.',
      },
      {
        question: 'Hansı kalkulyatordan istifadə etmək olar?',
        answer:
          'Proqramlaşdırılmayan və hərf klaviaturası olmayan kalkulyatordan. «Ali riyaziyyat» imtahanında kalkulyatora icazə verilmir.',
      },
      {
        question: 'Test zamanı internet kəsilsə nə olur?',
        answer: 'Hal araşdırılır; nasazlıq təsdiqlənərsə sizə yeni birdəfəlik şifrə verilir və imtahana davam edirsiniz.',
      },
    ],
    sideLinks: [
      OFFICE_LINK,
      CREDIT_LINK,
      YDA_LINK,
      REGISTRY_LINK,
      tl(17, 'İmtahanların keçirilmə qaydaları (ADDA-TL-017)'),
      tl(20, 'İngilis dili fənləri üzrə imtahan qaydaları (ADDA-TL-020)'),
    ],
    contact: TEDRIS_CONTACT,
  },
};

// ── 4. Yay semestri və əlavə kəsir (TL-026, TL-025) ──────────────────────────
const SUMMER_PAGE: QebulPageSeed = {
  slug: S.summer,
  dataBlock: 'yox',
  layout: 'tehsil',
  az: {
    title: 'Yay semestri və əlavə kəsir qrupları',
    lead:
      'Akademik borcu ləğv etmək, seçmə fənlərdən kredit qazanmaq və ya qiyməti yüksəltmək üçün yay semestri, semestr ərzində isə əlavə kəsir qrupları təşkil olunur. Hər ikisi könüllü və ödənişlidir.',
    body: `Yay semestri «Yay semestrinin təşkili qaydaları» (ADDA-TL-026), əlavə kəsir qrupları isə «Fənlər üzrə əlavə kəsir qruplarının təşkili qaydaları» (ADDA-TL-025) əsasında təşkil olunur. Hər ikisinə Akademiyanın tələbələri ilə yanaşı digər ali təhsil müəssisələrinin tələbələri də qoşula bilər.

## Yay semestri nə üçündür

- akademik borcların ləğvi;
- humanitar fənlər bölümündən Akademiyanın müəyyən etdiyi seçmə fənlərin kreditlərinin qazanılması (prerekvizitlər gözlənilməklə);
- müvəffəq qiymət alınmış fəndən qiymətin yüksəldilməsi: fənn yenidən dinlənilir və imtahan verilir, məqsədə çatılmasa əvvəlki bal qüvvədə qalır;
- digər ali təhsil müəssisələrinin tələbələrinin Akademiyanın fənləri üzrə kredit qazanması.

## Yay semestrinin qaydaları

- Qeydiyyat yaz semestrinin imtahan sessiyasından sonra, 5 iyuladək aparılır; qrupun təşkil olunub-olunmadığı qeydiyyat bitəndən 1 gün sonra elan edilir.
- Qrupda ən azı 5 (qiyabi təhsildə 3) tələbə olmalıdır. Say çatmadıqda tələbə digər tələbələrin ödənişini könüllü öz üzərinə götürərək qrupun açılmasını istəyə bilər.
- Bir tələbə yay semestrində 10 kreditdən çox götürə bilməz.
- Əyani təhsildə yay semestri 6 həftədir, imtahanlar sonuncu həftədə keçirilir (1 həftədən çox olmamaqla); qiyabi təhsildə tədris 3 həftədir. Yay semestri iyulun sonuncu həftəsindən gec olmayaraq başlayır və növbəti semestrin başlanmasına 2 həftə qalmış başa çatır.
- Semestrdə imtahana buraxılmayan, lakin fənn üzrə dərslərin 50 faizindən çoxunda iştirak etmiş tələbə həmin fənni yay semestrində götürə bilər.
- Dərslərin əyani təhsildə 15, qiyabi təhsildə 20 faizindən çoxunda iştirak etməyən tələbə imtahana buraxılmır. İmtahana imtahanqabağı ən azı 25 bal toplayan tələbə buraxılır.
- İmtahan cədvəli imtahanlara 5 iş günü qalmış elan olunur, nəticələr həmin gün yoxlanılır. Apellyasiya müraciəti nəticə elan olunduqdan 24 saat ərzində verilir.
- Üzrlü səbəbdən (xəstəlik, ezamiyyət, yaşayış yerindən kənarda məzuniyyət, yaxın qohumun vəfatı və s.) imtahanda iştirak etməyən tələbə üçün növbəti semestr başlayanadək bir dəfə imtahan təşkil olunur.
- Payız semestri üçün fərdi tədris planı yay semestrində iştirakdan asılı olmayaraq 5–15 iyul tarixlərində fakültəyə təqdim olunur.

## Əlavə kəsir qrupları

Əlavə kəsir qrupu semestr ərzində, cari semestrdə alt qruplarda iştirakı mümkün olmayan tələbələrin akademik borcunu ləğv etmək üçün təşkil olunur. Kredit fərqi olan tələbələr (məsələn, bərpa olunan və ya köçürülən) üçün də belə qruplar yaradılır.

- Qeydiyyat semestrin başlanmasına bir həftə qalanadək aparılır; qrupun təşkili barədə qeydiyyat bitəndən 1 gün sonra məlumat verilir.
- Qrupda ən azı 5 (qiyabi təhsildə 3) tələbə olmalıdır; dərslər və imtahanlar cari semestr və imtahan sessiyası ilə eyni müddətdə keçir.
- Davamiyyət həddi (15 və 20 faiz) və imtahana buraxılış (imtahanqabağı ən azı 25 bal) yay semestrindəki kimidir.
- Qrup yaranmadıqda tələbə rəhbərliyin razılığı ilə həmin fənni digər ali təhsil müəssisəsində keçə bilər; nəticə Akademiyaya rəsmi məktubla göndərilir.

## Necə müraciət etmək olar

1. Fakültə dekanına ərizə ilə müraciət edin: yay semestri üçün 5 iyuladək, əlavə kəsir qrupu üçün semestrə bir həftə qalanadək. Normativ təhsil müddəti başa çatmış tələbələr ərizəyə həqiqi hərbi xidmət və ya hərbi xidmətdən möhlət haqqında rəsmi sənədin surətini əlavə edir.
2. Qrupun təşkili elan olunduqdan sonra 2 iş günü ərzində ödənişi Akademiyanın bank hesabına edin və qəbzi dekanlığa təqdim edin.
3. Dərs cədvəli dərslərə 3 iş günü qalmış saytda, Elektron Akademiyada və elektron tablolarda elan olunur.

## Ödəniş

Bir fənnin haqqı illik təhsil haqqının 60-a bölünüb fənnin kreditinə vurulması ilə hesablanır. Ödəniş edilmədiyi üçün qrup minimum saya çatmazsa, qrup təşkil olunmur və ödənilən məbləğ qaytarılır. Digər hallarda ödəniş geri qaytarılmır.`,
    seoDescription:
      'ADDA-da yay semestri və əlavə kəsir qrupları: qeydiyyat, minimum tələbə sayı, kredit həddi, imtahanlar, apellyasiya və ödəniş (ADDA-TL-026, TL-025).',
    facts: [
      { label: 'Yay semestrinə qeydiyyat', value: '5 iyuladək', icon: 'tarix' },
      { label: 'Müddət', value: '6 həftə (qiyabi 3 həftə)', icon: 'muddet' },
      { label: 'Kredit həddi', value: '10 kreditədək', icon: 'kitab' },
    ],
    faq: [
      {
        question: 'Müvəffəq qiymət aldığım fəndən qiymətimi yüksəldə bilərəmmi?',
        answer:
          'Bəli, yay semestrində: fənni yenidən götürür, dinləyir və imtahan verirsiniz. Nəticə yüksəlməsə əvvəlki balınız qüvvədə qalır. Sadəcə təkrar imtahan verməklə qiyməti yüksəltməyə icazə verilmir.',
      },
      {
        question: 'Qrupda tələbə sayı çatmasa nə olur?',
        answer:
          'Qrup açılmır və ödənilmiş məbləğ qaytarılır. İstəsəniz digər tələbələrin ödəniş öhdəliyini könüllü üzərinizə götürərək qrupun açılmasını istəyə və ya rəhbərliyin razılığı ilə fənni başqa ali təhsil müəssisəsində keçə bilərsiniz.',
      },
    ],
    sideLinks: [
      OFFICE_LINK,
      CREDIT_LINK,
      EXAMS_LINK,
      REGISTRY_LINK,
      tl(26, 'Yay semestrinin təşkili qaydaları (ADDA-TL-026)'),
      tl(25, 'Əlavə kəsir qruplarının təşkili qaydaları (ADDA-TL-025)'),
    ],
    contact: TEDRIS_CONTACT,
  },
};

// ── 5. Köçürmə, bərpa, kreditlərin tanınması (TL-024, TL-023) ────────────────
const TRANSFER_PAGE: QebulPageSeed = {
  slug: S.transfer,
  dataBlock: 'yox',
  layout: 'tehsil',
  az: {
    title: 'Köçürmə, bərpa və kreditlərin tanınması',
    lead:
      'Bərpa olunan, akademik məzuniyyətdən qayıdan, təhsil formasını dəyişən, köçürülən, kollecdən bakalavriata qəbul olunan və ya mübadilədən qayıdan tələbənin əvvəl qazandığı kreditlər fənlərin uyğunlaşdırma cədvəli ilə tanınır.',
    body: `Kreditlərin tanınması iki sənədlə tənzimlənir: «Bərpa olunan, akademik məzuniyyətdən qayıdan, təhsilalma formasını dəyişən, köçürülən, ikili diplom və ya mübadilə proqramlarında iştirak edən, təkrar ali təhsilə qəbul olunan tələbələrin kreditlərinin tanınması və kredit fərqlərinin müəyyənləşdirilməsi qaydaları» (ADDA-TL-024) və «Bakalavriat səviyyəsinə qəbul olunan subbakalavrların kreditlərinin tanınması qaydaları» (ADDA-TL-023).

## Kimlərə aiddir

- tələbələr sırasına bərpa olunanlar;
- akademik məzuniyyətdən qayıdanlar;
- təhsilalma formasını dəyişənlər;
- başqa ali təhsil müəssisəsindən və ya ixtisasdan köçürülənlər;
- təkrar ali təhsilə qəbul olunanlar;
- kollecdən (subbakalavr) bakalavriata qəbul olunanlar;
- ikili diplom və mübadilə proqramlarının iştirakçıları.

## Kreditlər necə tanınır

1. Fakültə tələbənin keçdiyi fənləri ixtisasın tədris planı ilə kredit və fənlər üzrə müqayisə edən uyğunlaşdırma cədvəli hazırlayır. Cədvəl tələbənin qeydiyyatından sonra 10 iş günü ərzində hazırlanır və Tədris ofisi ilə razılaşdırılır.
2. Cədvəl fənlər üzrə rəy üçün kafedralara göndərilir; kafedralar kompetensiyaların uyğun olub-olmadığını qiymətləndirir.
3. Kafedraların rəyi fakültənin Elmi Şurasında müzakirə olunur və cədvəl təsdiq edilir.
4. Akademik məsləhətçi (tyutor) kreditləri tanınmış fənləri nəzərə alaraq tələbənin fərdi tədris planını hazırlayır.

Cədvəl 2 nüsxədə hazırlanır: biri fakültədə, biri [Tədris ofisində](/struktur/tedris-proseslerinin-teskili-sobesi) saxlanılır. Eyni təhsil proqramı və ixtisas üzrə keçilmiş fənlər bu prosedur olmadan birbaşa cədvəldə qeyd olunur. Kredit fərqini ləğv etmək üçün [əlavə kəsir qrupları](/sehife/yay-semestri-ve-elave-kesir) təşkil olunur.

## İkili diplom və mübadilə

- İkili diplom proqramında kreditlər tərəfdaş universitetlə əvvəlcədən razılaşdırılmış ortaq tədris planına uyğun tanınır; tələbənin fərdi tədris planı həmin plana görə hazırlanır.
- Mübadilə proqramında tələbənin keçəcəyi fənlərin siyahısı əvvəlcədən müəyyən edilir. Qarşılıqlı əvəzlənən və Akademiyada tanınan fənlər müqaviləyə əlavə olunub tərəfdaş universitetə göndərilir. Tələbə qayıtdıqdan sonra tərəfdaşda qazandığı kreditlər tanınır.
- Digər ali təhsil müəssisələrində qazanılan kreditlər ixtisas üzrə kreditlərin 30 faizindən çox olmamalıdır. Ətraflı: [Mübadilə və Erasmus+](/sehife/mobillik-ve-mubadile), [İkili diplom proqramları](/sehife/ikili-diplom-layiheleri).

## Akademiyadan köçürülmə

Akademiyadan başqa ali təhsil müəssisəsinə köçürülmək istəyən və ya Akademiyadan xaric olunan tələbəyə ərizə əsasında akademik transkript verilir. Köçürülmə Elm və Təhsil Nazirliyinin və «Azərbaycan Xəzər Dəniz Gəmiçiliyi» QSC-nin (ASCO) razılığı ilə həyata keçirilir ([Diplom və akademik transkript](/sehife/diplom-ve-transkript)).

## Kreditlərin itirilməsi

Normativ təhsil müddətindən sonrakı 3 il ərzində (hərbi xidmət müddəti nəzərə alınmadan) kreditləri toplaya bilməyən tələbə məzmunu əsaslı dəyişdirilmiş peşə hazırlığı fənlərindən əvvəl qazandığı kreditləri itirir və onları yenidən toplamalıdır.`,
    seoDescription:
      'ADDA-da bərpa, köçürmə, akademik məzuniyyət, kollecdən bakalavriata keçid, ikili diplom və mübadilə zamanı kreditlərin tanınması (ADDA-TL-024, TL-023).',
    facts: [
      { label: 'Uyğunlaşdırma cədvəli', value: '10 iş günü ərzində', icon: 'muddet' },
      { label: 'Təsdiq', value: 'Fakültə Elmi Şurası', icon: 'sened' },
      { label: 'Kənarda qazanılan kredit', value: '30 faizədək', icon: 'beynelxalq' },
    ],
    faq: [
      {
        question: 'Kollecdə keçdiyim fənlər bakalavriatda sayılırmı?',
        answer:
          'Kompetensiyaları uyğun gələn fənlərin kreditləri tanınır. Fakültə uyğunlaşdırma cədvəli hazırlayır, kafedralar rəy verir, cədvəli fakültənin Elmi Şurası təsdiq edir. Eyni təhsil proqramı üzrə keçilmiş fənlər birbaşa tanınır.',
      },
    ],
    sideLinks: [
      OFFICE_LINK,
      CREDIT_LINK,
      { label: 'Mübadilə və Erasmus+', url: p('mobillik-ve-mubadile') },
      REGISTRY_LINK,
      tl(24, 'Kreditlərin tanınması qaydaları (ADDA-TL-024)'),
      tl(23, 'Subbakalavrların kreditlərinin tanınması (ADDA-TL-023)'),
    ],
    contact: TEDRIS_CONTACT,
  },
};

// ── 6. Diplomqabağı təcrübə (TL-021, TL-022) ─────────────────────────────────
const PRACTICE_PAGE: QebulPageSeed = {
  slug: S.practice,
  dataBlock: 'yox',
  layout: 'tehsil',
  az: {
    title: 'Diplomqabağı təcrübə',
    lead:
      'Diplomqabağı təcrübə bakalavriatın yekun mərhələsidir: tələbə ixtisası üzrə gəmidə, zavodda və ya müəssisədə material toplayır, sonra yekun hesabatını komissiya qarşısında müdafiə edir. Keçid balı 100 baldan 51-dir.',
    body: `Diplomqabağı təcrübəyə bütün nəzəri dərsləri və digər təcrübələri (tədris və istehsalat) uğurla başa vuran tələbələr buraxılır. Təşkili və qiymətləndirilməsi Nazirlər Kabinetinin müvafiq qərarlarına, STCW-78 Konvensiyasına, Akademiyanın [təcrübə haqqında Əsasnaməsinə](/sehife/tecrube-haqqinda) və «Diplomqabağı təcrübənin qiymətləndirilməsi qaydaları»na (ADDA-TL-021) əsaslanır.

## Təşkili

- Təcrübə ixtisasa uyğun olaraq gəmiçilik şirkətinin gəmilərində, Akademiyanın təcrübə bazasında və ya kənar müəssisələrdə keçirilir; tələbə tədqiq edəcəyi məsələ ilə bilavasitə bağlı yerə göndərilir.
- Dənizçilik ixtisaslarında diplomqabağı üzmə təcrübəsi 14 həftədir və 21 kredit verir ([Kredit sistemi ilə tədris](/sehife/kredit-sistemi)); təcrübənin hər həftəsi 1,5 kreditdir.
- Qiyabi təhsil alan tələbələr 8 həftəlik diplomqabağı təcrübəyə göndərilir.
- Təhsil proqramında buraxılış işi yoxdursa, onun kreditləri təcrübəyə əlavə olunur və proqram yekun hesabatın müdafiəsi ilə tamamlanır. Proqram buraxılış işi ilə tamamlanırsa, təcrübədən «qeyri-kafi» alan tələbə [yekun dövlət attestasiyasına](/sehife/yekun-dovlet-attestasiyasi) buraxılmır.
- Təcrübəyə [Tədris ofisi](/struktur/tedris-proseslerinin-teskili-sobesi), fakültə dekanlıqları və ixtisas kafedraları nəzarət edir.

## Yekun hesabat

- Mətn A4 formatında, «Arial» 12 şrifti ilə, 1,5 sətirarası intervalla yazılır; boş sahələr soldan 30, sağdan 10, yuxarı və aşağıdan 20 mm. Həcm 25–30 səhifədir, üz səhifəsindən başqa bütün səhifələr nömrələnir.
- Hesabatda təcrübə yeri haqqında məlumat, yerinə yetirilən işlər və vəzifələr, şəkil, qrafik və hesablamalar, sonda təəssüratlar olur. Hər ixtisasın mövzuları qaydanın özündə verilib.
- Eyni gəmidə və ya müəssisədə təcrübə keçən tələbələrin hesabatları eyni olarsa, qiymətləndirməyə qəbul edilmir.

## Qiymətləndirmə: təcrübə bazasında

Gəmidə və ya zavodda yaradılan komissiya tələbənin fəaliyyətini 50 balla qiymətləndirir:

| Meyar | Bal |
|---|---|
| Davamiyyət (hər 10 faiz qayıba görə 1 bal çıxılır) | 0–10 |
| Nizam-intizam, təhlükəsizlik və etik davranış | 0–5 |
| İstehsalat tapşırıqları və ya STCW üzrə növbə çəkmə | 0–10 |
| Təcrübə proqramının mənimsənilməsi və təcrübə jurnalı | 0–20 |
| Hesabatın proqrama uyğun yazılması | 0–5 |

Saatların 25 faizindən çoxunda iştirak etməyən tələbə qiymətləndirilmir. 25 baldan az toplayan tələbə «qeyri-kafi» alır və yekun hesabatın müdafiəsinə buraxılmır. Komissiyanın protokolunu tələbə Akademiyadakı təcrübə rəhbərinə və ya ixtisas kafedrasının müdirinə təqdim edir; «Gəmiqayırma və gəmi təmiri mühəndisliyi» ixtisası istisna olmaqla xasiyyətnamə və üzmə haqqında arayış da təqdim olunur.

## Qiymətləndirmə: Akademiyada

Rektorun əmri ilə hər ixtisas üçün yaradılan komissiya yekun qiymətləndirməni 50 balla aparır:

| Meyar | Bal |
|---|---|
| Hesabatın tərtibatı və təqdimat | 0–20 |
| Ümumi orta müvəffəqiyyət göstəricisi (ÜOMG) | 0–5 |
| Müdafiə: təqdimat və suallar | 0–25 |

Tərtibatdan 7 baldan az toplayan tələbə müdafiəyə buraxılmır. ÜOMG 51–60 olduqda 1, 61–70 olduqda 2, 71–80 olduqda 3, 81–90 olduqda 4, 91–100 olduqda 5 bal verilir. Müdafiədə tələbə hesabatı 5–10 dəqiqə təqdim edir, sonra 5 dəqiqə suallara cavab verir; 9 baldan az toplayan tələbə «qeyri-kafi» alır.

İki mərhələnin balı toplanır: 51 və daha çox bal toplayan tələbə təcrübədən keçmiş sayılır. Müdafiə təcrübə bitdikdən sonra 2 həftə ərzində keçirilir, bir gündə 15 nəfərdən çox tələbə dəvət olunmur, nəticə həmin gün elan edilir.

## Təkrar müdafiə və təkrar təcrübə

- Yekun qiymətləndirmədə «qeyri-kafi» alan tələbə komissiyanın səlahiyyət müddətində yekun hesabatı bir dəfə təkrar müdafiə edə bilər; təkrar müdafiə ödənişlidir.
- Təcrübədə iştirak etməyən və ya təcrübə bazasında «qeyri-kafi» alan tələbə təcrübəni ödənişli əsaslarla yenidən keçir; vaxtını Akademiya müəyyən edir.

## Qiyabi təhsildə təcrübədən azad olunma

Qiyabi təhsil alan və dəniz nəqliyyatı sahəsində ixtisasına uyğun vəzifədə işləyən tələbənin əmək fəaliyyəti tədris təcrübəsi kimi tanına bilər. Əsas: Nazirlər Kabinetinin 30 dekabr 2023-cü il tarixli 489 nömrəli qərarı ilə təsdiq edilmiş «Ali və orta ixtisas təhsili müəssisələri tələbələrinin ixtisas üzrə təcrübə keçmə Qaydası»nın 3.12-ci bəndi və «İxtisas üzrə əmək fəaliyyəti əsasında tədris təcrübəsindən azad olunma qaydaları» (ADDA-TL-022).

Şərtlər:

- vəzifə ixtisasa uyğundur: naviqasiya ixtisasında matros, bosman, kapitan köməkçisi və göyərtə heyətinin digər vəzifələri; gəmi energetikası və elektrik ixtisaslarında motorçu, elektrik, mexanik, elektromexanik və maşın şöbəsinin digər vəzifələri; gəmiqayırma ixtisasında gəmiqayırma və gəmi təmiri zavodlarının istehsalat sahəsində və ya gəminin maşın-qazan şöbəsində iş;
- həftəlik iş vaxtı ən azı 20 saatdır;
- ixtisas üzrə iş stajı tədris planındakı təcrübə müddətindən az deyil;
- əmək fəaliyyəti qanunvericiliyə uyğun rəsmiləşdirilib.

Hər iş həftəsi 1,5 kredit kimi tanınır. Təqdim olunan sənədlər: işlədiyi təşkilatdan rəsmi arayış (blankda, möhürlü və imzalı; təşkilatın adı və statusu, vəzifə, iş müddəti, həftəlik iş saatı), dənizçi pasportundan çıxarış və ya sertifikat (gəmi, gəmidə olma müddəti, vəzifə), əmək müqaviləsinin surəti, əmək kitabçasının surəti (varsa). Sənədlərə fakültənin ixtisas üzrə Təcrübə Komissiyası 10 iş günü ərzində baxır. Saxta və ya yanlış məlumat aşkarlanarsa azadolma qərarı ləğv edilir.`,
    seoDescription:
      'ADDA-da diplomqabağı təcrübə: təşkili, yekun hesabatın tələbləri, iki mərhələli qiymətləndirmə, təkrar müdafiə və qiyabi təhsildə təcrübədən azad olunma (ADDA-TL-021, TL-022).',
    facts: [
      { label: 'Dəniz ixtisaslarında', value: '14 həftə, 21 kredit', icon: 'gemi' },
      { label: 'Qiymətləndirmə', value: '50 + 50 bal, keçid 51', icon: 'bal' },
      { label: 'Müdafiə', value: 'Təcrübədən sonra 2 həftə ərzində', icon: 'tarix' },
    ],
    faq: [
      {
        question: 'Hesabatı neçə səhifə yazmalıyam?',
        answer:
          '25–30 səhifə, A4 formatında, «Arial» 12 şrifti və 1,5 sətirarası intervalla. Eyni gəmidə təcrübə keçənlərin eyni hesabatları qəbul edilmir.',
      },
      {
        question: 'Qiyabi oxuyuram və gəmidə işləyirəm. Tədris təcrübəsindən azad ola bilərəmmi?',
        answer:
          'Bəli, vəzifəniz ixtisasınıza uyğundursa, həftədə ən azı 20 saat işləyirsinizsə və stajınız təcrübə müddətindən az deyilsə. Arayış, dənizçi pasportundan çıxarış, əmək müqaviləsi və (varsa) əmək kitabçasının surətini fakültəyə təqdim edin: Təcrübə Komissiyası 10 iş günü ərzində qərar verir.',
      },
    ],
    sideLinks: [
      { label: 'Təcrübə (praktika)', url: p('tecrube-haqqinda') },
      YDA_LINK,
      OFFICE_LINK,
      REGISTRY_LINK,
      tl(21, 'Diplomqabağı təcrübənin qiymətləndirilməsi qaydaları (ADDA-TL-021)'),
      tl(22, 'Qiyabi təhsildə təcrübədən azad olunma qaydaları (ADDA-TL-022)'),
    ],
    contact: TEDRIS_CONTACT,
  },
};

// ── 7. Tədrisin təşkili (TL-001…008, ƏP-002, ƏP-004) ─────────────────────────
const TEACHING_PAGE: QebulPageSeed = {
  slug: S.teaching,
  dataBlock: 'yox',
  layout: 'tehsil',
  az: {
    title: 'Tədrisin təşkili və dərs növləri',
    lead:
      'Dərslər tədris planı, fənn proqramı və sillabus əsasında keçirilir: mühazirə, praktiki məşğələ, laboratoriya dərsi, trenajor hazırlığı, kurs layihəsi və kurs işi. Hər dərs növünün qaydası Akademiyanın təlimatlarında müəyyən edilib.',
    body: `Tədris prosesi «Tədris prosesinin təmin edilməsi və həyata keçirilməsi» proseduru (ADDA-ƏP-002) və dərs növləri üzrə təlimatlar (ADDA-TL-001…008) əsasında təşkil olunur. Bu səhifə tələbələr və müəllimlər üçün əsas qaydaları qısa izah edir.

## Tədris sənədləri

- **Tədris planı:** tədrisin məqsədi və müddəti, forması, tədris qrafiki, həftəlik saatlar, fənlərin siyahısı və semestrlər üzrə ardıcıllığı, kreditlər, yekun dövlət attestasiyasının müddəti.
- **Fənn proqramı:** mövzular və onların təsviri, saatların bölgüsü, mühazirə, praktiki və laboratoriya məşğələlərinin mövzuları, kurs işlərinin mövzuları, ədəbiyyat.
- **Sillabus (işçi proqram):** fənnin adı, kodu və kreditləri, müəllim və onun əlaqə məlumatı, fənnin qısa təsviri, məqsəd və vəzifələri, prerekvizit fənlər, mövzular.
- **Fərdi tədris planı:** hər tələbənin tədris ili üzrə fənləri və kreditləri ([Kredit sistemi ilə tədris](/sehife/kredit-sistemi)).

## Mühazirə

- Mühazirə dərsi fasiləsiz 80 dəqiqə davam edir. Mühazirələr bir qayda olaraq günün əvvəlində keçirilir və gün ərzində 160 dəqiqədən çox olmur.
- Dərslər tədris işləri üzrə prorektorun təsdiq etdiyi dərs cədvəli ilə keçirilir; tələbələr bütün mühazirələrdə iştirak etməlidir.
- Pandemiya və ya fors-major hallarında tədris distant formada, telekommunikasiya və kompüter şəbəkələri vasitəsilə aparılır («Distant təhsilin təşkili», ADDA-ƏP-004).

## Praktiki məşğələ

- Praktiki məşğələ iki akademik saat davam edir və müvafiq mövzu üzrə mühazirədən sonra keçirilir; dərsdə mövzunun 2–4 əsas sualına baxılır.
- Müəllim dərsin mövzusunu və məqsədini elan edir, nəzəri anlayışlar müzakirə olunur, məşqlər aparılır. Sonda material yoxlama sualları ilə möhkəmləndirilir və müstəqil iş müəyyən edilir.
- Müəllim məşğələ və kollokviumlarda tələbələri, onların testlərini və referatlarını qiymətləndirir.

## Laboratoriya dərsləri

Laboratoriya dərsi fənnin nəzəri müddəalarını təcrübədə açmaq, avadanlıqla işləmə və eksperiment bacarıqlarını aşılamaq üçündür. Dərslər sillabusa uyğun keçirilir, bir-birini təkrarlamır, mühazirə və praktiki məşğələlərlə ardıcıllıq təşkil edir və tədqiqat elementləri daxil edir. Laboratoriyalar: [Laboratoriya və trenajorlar](/auditoriyalar).

## Trenajor hazırlığı

- Trenajorlar «Dəniz naviqasiyası mühəndisliyi», «Gəmi energetik qurğularının istismarı mühəndisliyi» və «Elektrik və elektronika mühəndisliyi» ixtisasları üçündür və STCW Məcəlləsinin A-I/12 və B-I/12 bölmələrinin tələblərinə uyğundur.
- Dərslər IMO-nun 7.01, 7.02, 7.03, 7.04 və 7.08 model kurslarına əsasən aparılır. Tədrisə yalnız IMO-nun 6.09, 6.10 və 3.12 model kursları üzrə təlimatçı və qiymətləndirici hazırlığı keçmiş müəllimlər buraxılır.
- MER-3D maşın şöbəsi trenajorunda «Gəmi energetik qurğularında növbəçəkmə» və «Gəmi maşın və mexanizmlərinin avtomatik idarə edilməsi» fənləri üzrə tapşırıqlar verilir: tələbə 1–2 dəqiqə tapşırıqla tanış olur, sonra tapşırıq-qiymətləndirmə vərəqindəki ardıcıllıqla icra edib izah edir. Hər tələbənin ayda ən azı 3 qiyməti olmalıdır.

## Kurs layihəsi və kurs işi

- Kurs layihəsi və kurs işi tədris planına uyğun olaraq bütün ixtisaslar üçün məcburidir və bir qayda olaraq ixtisas fənlərindən yerinə yetirilir; yekun dövlət attestasiyasına hazırlıq mərhələsidir.
- Mövzular fənn proqramına uyğun olaraq kafedrada müzakirə və təsdiq edilir, tapşırığı kafedra müdiri təsdiq edir, rəhbərlik fənni tədris edən müəllimə həvalə olunur. Mövzular tədqiqat, layihə, texnoloji, konstruktor və ya eksperimental istiqamətdə ola bilər.

## Qısamüddətli kurslar

Dənizçilər üçün STCW təlimləri və digər qısamüddətli kurslar [Təlim-Tədris Mərkəzində](/struktur/telim-tedris-merkezi) «Qısa müddətli kursların keçirilməsi» təlimatı (ADDA-TL-002) üzrə keçirilir: kurs dinləyicilərin qeydiyyatı və ilkin bilik yoxlaması ilə başlayır, təsdiq olunmuş kurs proqramı ilə aparılır, davamiyyətə və tədrisin keyfiyyətinə Mərkəzin direktoru nəzarət edir.`,
    seoDescription:
      'ADDA-da tədrisin təşkili: tədris planı və sillabus, mühazirə, praktiki məşğələ, laboratoriya, trenajor hazırlığı (STCW, IMO), kurs layihəsi və qısamüddətli kurslar.',
    facts: [
      { label: 'Mühazirə', value: '80 dəqiqə', icon: 'muddet' },
      { label: 'Praktiki məşğələ', value: '2 akademik saat', icon: 'kitab' },
      { label: 'Trenajorlar', value: 'STCW A-I/12, B-I/12', icon: 'gemi' },
    ],
    sideLinks: [
      OFFICE_LINK,
      { label: 'Laboratoriya və trenajorlar', url: '/auditoriyalar' },
      REGISTRY_LINK,
      tl(4, 'Mühazirə dərsləri (ADDA-TL-004)'),
      tl(5, 'Laboratoriya dərsləri (ADDA-TL-005)'),
      tl(6, 'Praktiki məşğələ və trenajor hazırlığı (ADDA-TL-006)'),
      tl(7, 'Kurs layihəsi və kurs işi (ADDA-TL-007)'),
      tl(8, 'Trenajorda hazırlıq və qiymətləndirmə (ADDA-TL-008)'),
    ],
    contact: TEDRIS_CONTACT,
  },
};

// ── 8. Diplom və transkript (ƏP-003) ─────────────────────────────────────────
const DIPLOMA_PAGE: QebulPageSeed = {
  slug: S.diploma,
  dataBlock: 'yox',
  layout: 'tehsil',
  az: {
    title: 'Diplom və akademik transkript',
    lead:
      'Məzunlara Elm və Təhsil Nazirliyinin blankında ali təhsil haqqında diplom və diploma əlavə verilir. Diplom itəndə dublikat, köçürülən və xaric olunan tələbəyə akademik transkript verilir.',
    body: `Diplomların, akademik transkriptlərin və dublikat diplomların alınması, saxlanılması, doldurulması və qeydiyyatı Akademiyanın prosedurunda (ADDA-ƏP-003) müəyyən edilib. İşləri rektorun əmri ilə təyin olunmuş məsul şəxslər aparır.

## Diplom necə hazırlanır

- Diplom blankları məzunların təxmini sayına görə Elm və Təhsil Nazirliyindən sifariş edilir, məzunlar haqqında məlumatlar Nazirliyin Diplom təsdiq sisteminə (dts.edu.az) daxil edilir.
- Blanklar [Tədris ofisində](/struktur/tedris-proseslerinin-teskili-sobesi) xüsusi seyfdə saxlanılır, istifadəsi qeydiyyat kitabında qeydə alınır.
- Diplom kalliqrafik xətlə qara tuşla doldurulur, diploma əlavə kompüterdə çap olunur, Akademiyanın möhürü vurulur. Blankda düzəliş və qaralamaya yol verilmir.
- Məzuna ixtisas dərəcəsi və diplom [Dövlət Attestasiya Komissiyasının](/sehife/yekun-dovlet-attestasiyasi) qərarı ilə verilir.

## Diplomun verilməsi

- Diplom və diploma əlavə Akademiyanı bitirdikdən sonra sahibinə şəxsən, ya da etibarnamə ilə başqa şəxsə verilir.
- Diplomun və əlavənin surəti məzunun şəxsi işində saxlanılır, verilməsi daimi saxlanılan qeydiyyat kitabında imza ilə qeydə alınır.

## Dublikat diplom

1. Diplomu və ya diploma əlavəni itirən şəxs Akademiyanın rektoruna ərizə ilə müraciət edir.
2. Ərizəyə sənədin axtarışda olması barədə məlumat və «Azərbaycan müəllimi» qəzetində verilmiş elan əlavə olunur.
3. Akademiya məzunun təhsil məlumatlarını Elm və Təhsil Nazirliyinə təqdim edir və yeni blank üçün müraciət edir.
4. Dublikat arxiv sənədləri əsasında doldurulur; diplomun və əlavənin sağ səhifəsinin yuxarı küncünə «Dublikat» ştampı vurulur.

## Akademik transkript

- Akademik transkript tələbənin keçdiyi fənlər üzrə topladığı kreditləri və qiymətləri əks etdirir; tələbə onu təhsil dövründə istənilən vaxt ala bilər ([Kredit sistemi ilə tədris](/sehife/kredit-sistemi)).
- Akademiyadan başqa ali təhsil müəssisəsinə köçürülmək istəyən və ya xaric olunan tələbəyə ərizə əsasında Elm və Təhsil Nazirliyinin blankında transkript verilir, verilməsi ayrıca kitabda qeydə alınır.
- Akademiyadan köçürülmə Elm və Təhsil Nazirliyinin və ASCO-nun razılığı ilə həyata keçirilir ([Köçürmə, bərpa və kreditlərin tanınması](/sehife/kocurme-ve-berpa)).`,
    seoDescription:
      'ADDA-da diplom, diploma əlavə, dublikat diplom və akademik transkriptin verilməsi qaydası (ADDA-ƏP-003).',
    facts: [
      { label: 'Blank', value: 'Elm və Təhsil Nazirliyi', icon: 'diplom' },
      { label: 'Verilir', value: 'Şəxsən və ya etibarnamə ilə', icon: 'sened' },
      { label: 'Dublikat', value: 'Rektora ərizə ilə', icon: 'forma' },
    ],
    faq: [
      {
        question: 'Diplomumu itirmişəm. Nə etməliyəm?',
        answer:
          'Rektora ərizə yazın; ərizəyə sənədin axtarışda olması barədə məlumatı və «Azərbaycan müəllimi» qəzetində verdiyiniz elanı əlavə edin. Akademiya Elm və Təhsil Nazirliyinə müraciət edir, dublikat arxiv sənədləri əsasında doldurulur.',
      },
    ],
    sideLinks: [
      OFFICE_LINK,
      YDA_LINK,
      { label: 'Köçürmə, bərpa və kreditlərin tanınması', url: p(S.transfer) },
      REGISTRY_LINK,
      ep(3, 'Diplom və akademik transkriptlərin verilməsi proseduru (ADDA-ƏP-003)'),
    ],
    contact: TEDRIS_CONTACT,
  },
};

// ── 9. Akademik dürüstlük (TL-010) ───────────────────────────────────────────
const INTEGRITY_PAGE: QebulPageSeed = {
  slug: S.integrity,
  dataBlock: 'yox',
  layout: 'elm',
  az: {
    title: 'Akademik dürüstlük və antiplagiat',
    lead:
      'Dissertasiyalar, məqalələr, dərsliklər və monoqrafiyalar StrikePlagiarism antiplagiat sistemində yoxlanılır. Oxşarlıq həddi aşıldıqda iş müdafiəyə və ya çapa buraxılmır, müəllifə düzəliş üçün bir ay vaxt verilir.',
    body: `Elmi plagiat başqa müəlliflərin əsərlərindən müəllifinə və mənbəyinə istinad etmədən istifadə etməkdir. Akademiyada magistr, fəlsəfə doktoru və elmlər doktoru dissertasiyaları, monoqrafiyalar, məqalələr və tədris vəsaitləri (dərslik, dərs vəsaiti, metodiki göstəriş) «Antiplagiat sisteminin istifadə qaydaları» (ADDA-TL-010) üzrə yoxlanılır. Yoxlamanın nəticəsini əks etdirən plagiat arayışı elmi plagiatın müəyyən edilməsi üçün əsas sənəddir.

## Oxşarlıq əmsalları

- **1-ci əmsal:** işdə 5 ardıcıl sözdən ibarət oxşar hissələrin işin ümumi həcmində payı. Qanun, ədəbiyyat və sənəd adlarından, standart ifadələrdən istifadəni məhdudlaşdırır.
- **2-ci əmsal:** 25 ardıcıl sözdən ibarət oxşar hissələrin payı. İstinad göstərilib-göstərilməməsindən asılı olmayaraq hesablanır və qismən dəyişdirilmiş hissələri də tutur.
- **3-cü əmsal:** dırnaq içində yazılmış bütün hissələrin (sitatların) payı.

Görünməz işarələr, hərf dəyişikliyi, mikroboşluqlar və parafraz kimi üsullarla plagiatı gizlətmək cəhdi manipulyasiya sayılır.

## İcazə verilən hədlər

| İş | 1-ci əmsal | 2-ci əmsal |
|---|---|---|
| Magistr dissertasiyası | 50 faizədək | 10 faizədək |
| Fəlsəfə və elmlər doktoru dissertasiyası | 20 faizədək | 5 faizədək |
| Dərslik, dərs vəsaiti, metodiki göstəriş, məqalə, monoqrafiya | 50 faizədək | 5 faizədək |

- Bütün işlərdə 3-cü əmsal 25 faizdən çox olmamalıdır.
- İxtisas fənləri üzrə dərslik və vəsaitlərdə beynəlxalq konvensiyaların (STCW, MARPOL, SOLAS) və təsnifat cəmiyyətlərinin qaydaları təhrifsiz verildiyi üçün 2-ci əmsal 15 faizədək olduqda iş Komissiyanın qərarı ilə çapa tövsiyə edilə bilər.
- Plagiat faktı olmasa da sitatlar işin 50 faizindən çoxdursa, işin orijinallığı aşağı sayılır və müdafiəyə buraxılmır.

## Yoxlama necə aparılır

1. İş müdafiədən 1 ay əvvəl kafedraya çap olunmuş və elektron (DOC, DOCX və ya redaktə olunan PDF) formada təqdim edilir; çap və elektron mətn eyni olmalıdır.
2. Müəllif sistem administratoruna Plagiat Məsələləri üzrə Komissiyanın sədrinin adına ərizə, bəyannamə (ADDA-F-063), işin elektron versiyası və lazım olduqda ödəniş qəbzi təqdim edir.
3. Yoxlama 5 iş günü ərzində aparılır. Administrator qısa hesabatı 3 nüsxədə çap edib müəllifə, elmi rəhbərə və Komissiyaya təqdim edir.
4. Hədd aşılarsa, Komissiya səbəbləri və istinad edilən mənbələri araşdırır, rəyini ADDA-F-065 formasında rəsmiləşdirir. Müəllifə düzəliş üçün 1 ay vaxt verilir, sonra iş təkrar yoxlanılır.
5. Üç dəfə düzəlişdən sonra hədd yenə aşılarsa, məqalə və tədris vəsaiti təkrar yoxlamaya qəbul edilmir. Plagiat aşkarlanan dissertasiya müdafiəyə buraxılmır, məqalə və vəsait çapa tövsiyə olunmur.

Müdafiəyə buraxılan elmi işlər və qriflə çap olunan tədris vəsaitləri sistemin məlumat bazasına daxil edilir.

## Ödəniş

Akademiyanın tələbələri və əməkdaşları üçün eyni işin ilk yoxlaması ödənişsizdir, təkrar yoxlamalar ödənişlidir. Kənar şəxslər və təşkilatlar üçün yoxlama bütün hallarda ödənişlidir; tariflər qaydanın əlavəsində verilib.

## Nəticədən narazılıq

- Müəllif plagiat arayışının konkret müddəalarına əsaslandırılmış etirazla Plagiat Məsələləri üzrə Komissiyaya müraciət edə bilər. Komissiya müəllifin öz əvvəlki əsərlərinə aid hissələri plagiat saymaya bilər.
- Komissiya qərarı açıq səsvermə ilə, sadə səs çoxluğu ilə qəbul edir və protokolla rəsmiləşdirir.
- Komissiyanın qərarı ilə razı olmayan müəllif və ya elmi rəhbər qərar açıqlandıqdan sonra 3 iş günü ərzində rektora müraciət edə bilər; yekun qərarı rektor qəbul edir. Apellyasiya yalnız bir dəfə verilir.`,
    seoDescription:
      'ADDA-da akademik dürüstlük: dissertasiya, məqalə və dərsliklərin antiplagiat yoxlaması, oxşarlıq hədləri, prosedur, ödəniş və apellyasiya (ADDA-TL-010).',
    facts: [
      { label: 'Sistem', value: 'StrikePlagiarism', icon: 'sened' },
      { label: 'Təqdim', value: 'Müdafiədən 1 ay əvvəl', icon: 'tarix' },
      { label: 'İlk yoxlama', value: 'Ödənişsiz (tələbə və əməkdaşlar)', icon: 'haqq' },
    ],
    faq: [
      {
        question: 'Dissertasiyamı nə vaxt yoxlamaya verməliyəm?',
        answer:
          'Müdafiədən 1 ay əvvəl kafedraya, çap olunmuş və elektron formada. Yoxlama 5 iş günü ərzində aparılır; hədd aşılarsa düzəliş üçün 1 ay vaxt verilir.',
      },
      {
        question: 'Yoxlama ödənişlidirmi?',
        answer:
          'Akademiyanın tələbə və əməkdaşları üçün eyni işin ilk yoxlaması ödənişsizdir, təkrar yoxlamalar ödənişlidir. Kənar müəlliflər üçün bütün yoxlamalar ödənişlidir.',
      },
    ],
    sideLinks: [
      { label: 'Doktorantura', url: p('doktorantura') },
      { label: 'Magistratura', url: p('magistratura') },
      { label: 'Elmi jurnal', url: p('elmi-jurnal') },
      REGISTRY_LINK,
      tl(10, 'Antiplagiat sisteminin istifadə qaydaları (ADDA-TL-010)'),
    ],
    contact:
      '**Təşkilat:** [Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsi](/struktur/elmi-tedqiqat-ve-beynelxalq-elaqeler-sobesi), Plagiat Məsələləri üzrə Komissiya\n\n' +
      `${PHONE}\n\nSualınızı [onlayn göndərin](${ASK}?istiqamet=elm).`,
  },
};

// ── 10. Daxili intizam qaydaları (TL-012) ────────────────────────────────────
const DISCIPLINE_PAGE: QebulPageSeed = {
  slug: S.discipline,
  dataBlock: 'yox',
  layout: 'akademiya',
  az: {
    title: 'Daxili intizam qaydaları',
    lead:
      'Akademiyanın binalarında, yataqxanada və Təlim-Tədris Mərkəzində işçilərin, tələbələrin və dinləyicilərin iş və tədris intizamı, davranış qaydaları, həvəsləndirmə və intizam tənbehləri.',
    body: `Daxili intizam qaydaları (ADDA-TL-012) Əmək Məcəlləsinin 182 və 183-cü maddələrinə uyğun hazırlanıb. Onlar Akademiyanın əsas inzibati binasında, II tədris korpusunda, [yataqxanada](/sehife/yataqxana) və [Təlim-Tədris Mərkəzində](/struktur/telim-tedris-merkezi) çalışan işçilərə, təhsil alan tələbələrə və dinləyicilərə şamil edilir. Təşkilati davranışın əsasını Təhsil Nazirliyinin Kollegiyasının 6 noyabr 2014-cü il tarixli 1/2 nömrəli qərarı ilə təsdiq edilmiş «Müəllimlərin etik davranış qaydaları» təşkil edir.

## Davranış prinsipləri

Humanizm, ədalətlilik, şəffaflıq və tərəfsizlik, cavabdehlik və məsuliyyət, təşəbbüskarlıq. Hər bir əməkdaş işinə təsir edən problemi ilk növbədə struktur bölmənin rəhbəri və ya aidiyyəti prorektorla müzakirə edə bilər; bu müzakirələr məxfi saxlanılır, üçüncü şəxsə yalnız əməkdaşın razılığı ilə məlumat verilir.

## Tələbələr üçün

- Tədris ili 15 sentyabrda başlayır (tədris qrafikinə görə dəyişə bilər). Semestrin dərs cədvəli semestrə ən geci 5 gün qalmış elan olunur.
- Dərs başlandıqdan sonra auditoriyaya daxil olmaq və müəllimin icazəsi olmadan dərsi tərk etmək olmaz.
- Davamiyyət Elektron Akademiya üzərindən və qrup jurnalında qeydə alınır. Üzrsüz səbəbdən dərslərin bakalavriatın əyani formasında 15, magistraturada 20 faizindən çoxunu buraxan tələbə semestr imtahanlarına buraxılmır; üzrlü səbəb rəsmi sənədlə təsdiqləndikdə hədd 25 faizdir ([Kredit sistemi ilə tədris](/sehife/kredit-sistemi)). Hər fənn üzrə semestrdə 2 sərbəst iş və 1 kollokvium nəzərdə tutulur.
- Qrup nümayəndəsi hər tədris ilinin əvvəlində birinci kursa ən yüksək balla qəbul olunmuş tələbələr arasından seçilir. O, dərs intizamının təmin edilməsində iştirak edir, dərsliklərin paylanmasını təşkil edir, cədvəl dəyişikliyi barədə qrupu məlumatlandırır, müəllim dərsə gəlmədikdə dekanlığa xəbər verir.
- Tələbələr mövsümə uyğun forma geyinir, onu təmiz və səliqəli saxlayır; xarici görünüş dənizçinin normalarına uyğun olmalıdır (üz qırxılmış, saç qısa).
- Binaya tələbə kartı ilə daxil olunur. Otaqlarda üst və baş geyimində olmaq, uca səslə danışmaq, dərs vaxtı dəhlizlərdə gəzmək, təyin olunmamış yerdə siqaret çəkmək, spirtli içki, narkotik və psixotrop maddələr qadağandır.
- Akademiyada hər hansı adla tələbələrdən pul toplanması qadağandır.
- Tələbə Akademiyada da, ictimai yerlərdə də Akademiya tələbəsinin adına layiq davranmalı, Akademiyanın əmlakını qorumalıdır; vurulan maddi ziyanın əvəzi ödənilir.

## Tələbələrə intizam tənbehləri

Nizamnaməni, tədris intizamını, daxili intizam qaydalarını və ya etik normaları pozan tələbəyə, dinləyiciyə və doktoranta bu tənbehlər tətbiq oluna bilər:

- xəbərdarlıq;
- töhmət (xəbərdarlıqdan nəticə çıxarılmadıqda);
- şiddətli töhmət;
- Akademiyadan xaric edilmə;
- yataqxanadan çıxarılma (əvvəl verilmiş eyni tənbeh təkrarlandıqda).

Tənbeh pozuntu aşkar edildiyi gündən bir ay, baş verdiyi gündən altı ay ərzində (tətil vaxtı istisna olmaqla) tətbiq edilir. Əvvəlcə tələbədən yazılı izahat alınır; izahatdan imtina tənbehə mane olmur. Xəstəlik, tətil və akademik məzuniyyət dövründə tələbəni xaric etmək qadağandır. Eyni xətanın 6 ay ərzində təkrarı kobud pozuntu sayılır.

## İşçilər üçün

- İş günü 08:30-da başlayır, 17:00-da bitir; nahar fasiləsi 12:00–12:30-dur. Professor-müəllim heyəti üçün gündəlik normal iş vaxtı 6 saat (Nazirlər Kabinetinin 12 avqust 2003-cü il tarixli 106 nömrəli qərarı), digər əməkdaşlar üçün həftəlik iş vaxtı 40 saatdır. Bayramdan əvvəlki iş günü bir saat qısa olur.
- İşə gəliş və çıxış elektron kartla qeydə alınır; kartı başqasına vermək olmaz.
- İşçi vəzifəsini vicdanla yerinə yetirir, Akademiyanın əmlakını, xidməti və kommersiya məlumatlarını qoruyur, internet və rabitə vasitələrindən yalnız xidməti məqsədlə istifadə edir.
- Tam ştatda işləyən əməkdaş kənar təşkilatda yalnız işəgötürənin razılığı ilə işləyə bilər.
- İntizam tənbehi pozuntu aşkar edildiyi gündən bir ay, törədildiyi gündən altı ay ərzində verilir, əvvəlcə işçidən izahat alınır. İlk dəfə xəbərdarlıq edilə bilər; xəbərdarlıq intizam tənbehi sayılmır.

## Həvəsləndirmə

Fərqlənən işçilərə struktur bölmənin rəhbərinin və ya prorektorun təqdimatı ilə təşəkkür, pul mükafatı, qiymətli hədiyyə, əmək haqqına fərdi əlavə, sanatoriya-kurort və turist yollayışının ödənilməsi, fəxri fərman və «İlin müəllimi» adı verilə, dövlət təltifinə təqdimat qaldırıla bilər. Bax: [«Ən yaxşı müəllim» müsabiqəsi](/sehife/en-yaxsi-muellim).`,
    seoDescription:
      'ADDA-nın daxili intizam qaydaları: tələbə və işçilər üçün davranış, davamiyyət, forma, iş vaxtı, intizam tənbehləri və həvəsləndirmə (ADDA-TL-012).',
    facts: [
      { label: 'İş günü', value: '08:30–17:00', icon: 'muddet' },
      { label: 'Tədris ili', value: '15 sentyabrdan', icon: 'tarix' },
      { label: 'Hüquqi əsas', value: 'Əmək Məcəlləsi, 182–183-cü maddələr', icon: 'sened' },
    ],
    faq: [
      {
        question: 'Dərsə gecikdim. Auditoriyaya daxil ola bilərəmmi?',
        answer:
          'Dərs başlandıqdan sonra auditoriyaya daxil olmaq qadağandır. Xüsusi hallarda bu yalnız dərsi aparan müəllimin icazəsi ilə mümkündür.',
      },
    ],
    sideLinks: [
      { label: 'Akademiyanın Nizamnaməsi', url: p('nizamname') },
      { label: 'Yataqxana', url: p('yataqxana') },
      { label: 'İşə qəbul qaydaları', url: p(S.hiring) },
      REGISTRY_LINK,
      tl(12, 'Daxili intizam qaydaları (ADDA-TL-012)'),
    ],
    contact:
      '**Əməkdaşlar üçün:** [Personalın idarəedilməsi, əmək haqqı və kargüzarlıq şöbəsi](/struktur/personalin-idareedilmesi-emek-haqqi-ve-karguzarliq-sobesi)\n\n' +
      `**Tələbələr üçün:** fakültə dekanlıqları, ${OFFICE}\n\n${PHONE}`,
  },
};

// ── 11. Fəxri adlar (TL-013, TL-015) ─────────────────────────────────────────
const HONORARY_PAGE: QebulPageSeed = {
  slug: S.honorary,
  dataBlock: 'yox',
  layout: 'akademiya',
  az: {
    title: 'Fəxri doktor və fəxri professor',
    lead:
      'Akademiyanın iki fəxri adı var: «Akademiyanın fəxri doktoru» beynəlxalq elmi əməkdaşlığa töhfə vermiş alim və xadimlərə, «Fəxri professor» isə elm və təhsildə yüksək nailiyyətləri olan mütəxəssislərə verilir. Hər iki adı Elmi Şura verir.',
    body: `Fəxri adların verilməsi «Akademiyanın fəxri doktoru haqqında qayda» (ADDA-TL-013) və «Akademiyanın fəxri professoru haqqında qayda» (ADDA-TL-015) ilə tənzimlənir.

## Akademiyanın fəxri doktoru

Akademik fəxri addır: elmi-pedaqoji fəaliyyəti ilə fərqlənən professor və dosentlərə, dünya elminin və təhsilinin inkişafında xüsusi xidmətləri olan xarici ölkələrin alim və ictimai xadimlərinə verilir. Ad naviqasiya, gəmi təmiri və gəmiqayırma üzrə beynəlxalq elmi əməkdaşlığa töhfə vermiş elm, təhsil, mədəniyyət, dövlət və ictimai xadimlərinə verilir.

Fəxri doktor:

- Elmi Şuranın iclaslarında məsləhətçi səs hüququ ilə iştirak edir;
- Akademiyada mühazirə oxuya və elmi tədqiqat apara bilər;
- Akademiyanın konfrans, simpozium və elmi oxunuşlarında iştirak edir.

**Ad necə verilir.**

- Namizədliyi Elmi Şuranın sədri (rektor), elmi işlər və beynəlxalq əlaqələr üzrə prorektor, eləcə də fakültənin Elmi Şurası irəli sürür. Prorektor ildə ən çox bir, fakültə Elmi Şurası iki ildə bir namizəd irəli sürə bilər; fakültə Elmi Şurasının qərarı açıq səsvermə ilə, iştirak edən üzvlərin ən azı üçdə ikisinin səsi ilə qəbul olunur.
- Namizədin xidmətləri, beynəlxalq əməkdaşlığa töhfəsi və əsas elmi əsərləri Elmi Şurada təqdim olunur; Elmi Şuranın Daimi Komissiyası öz tövsiyəsini verir.
- Elmi Şura adı açıq səsvermə ilə, iclasda iştirak edən üzvlərin ən azı üçdə ikisinin səsi ilə verir.
- Diplom Elmi Şura üzvlərinin, qonaqların və tələbələrin iştirakı ilə təntənəli mərasimdə təqdim olunur; fəxri doktor çıxış etmək və ictimai mühazirə oxumaq hüququ alır. Adı, titulları, ölkəsi və adın verilmə tarixi Akademiyanın Fəxri Doktorlar Kitabına yazılır. Mərasimin xərclərini Akademiya ödəyir.

## Fəxri professor

«Azərbaycan Dövlət Dəniz Akademiyasının fəxri professoru» adı ixtisası, pedaqoji bacarığı, dərin peşə biliyi və elmi nailiyyətləri olan professor-müəllim heyəti üzvlərinə, habelə ictimai və elm xadimlərinə verilir. Akademiyanın əməkdaşına bu ad üçün elmi dərəcə və ən azı 15 il elmi-pedaqoji iş təcrübəsi tələb olunur.

- Ad şəxsi sertifikat və «Fəxri professor» döş nişanı ilə təsdiq edilir; adı Akademiyanın muzey və sərgi kompleksində saxlanılan Əməkdar Xadimlər Kitabına yazılır.
- Fəxri professor adı almış əməkdaş aylıq pul mükafatı ilə həvəsləndirilir və kafedrada professor vəzifəsini tutmaq hüququ qazanır.
- Namizəd Akademiyanın əməkdaşıdırsa kafedranın təqdimatı ilə, əməkdaşı deyilsə rektorluğun təqdimatı ilə irəli sürülür.
- Qərarı Elmi Şura qəbul edir: iclasda Şura üzvlərinin ən azı üçdə ikisi və mövcud üzvlərin yarıdan çoxu iştirak etməlidir.
- Sertifikat və döş nişanı Elmi Şuranın iclasında təntənəli şəraitdə təqdim olunur. Bir şəxs bu ada təkrar irəli sürülmür.`,
    seoDescription:
      'ADDA-nın fəxri adları: «Akademiyanın fəxri doktoru» və «Fəxri professor», verilmə şərtləri, namizədliyin irəli sürülməsi və Elmi Şuranın qərarı (ADDA-TL-013, TL-015).',
    facts: [
      { label: 'Qərar', value: 'Elmi Şura, ən azı 2/3 səs', icon: 'qrup' },
      { label: 'Fəxri doktor', value: 'Diplom, Fəxri Doktorlar Kitabı', icon: 'diplom' },
      { label: 'Fəxri professor', value: 'Sertifikat və döş nişanı', icon: 'diplom' },
    ],
    sideLinks: [
      { label: 'Elmi Şura', url: U('elmi-sura') },
      { label: 'Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsi', url: U(ETBES) },
      REGISTRY_LINK,
      tl(13, 'Fəxri doktor haqqında qayda (ADDA-TL-013)'),
      tl(15, 'Fəxri professor haqqında qayda (ADDA-TL-015)'),
    ],
    contact:
      '**Təşkilat:** [Elmi Şura](/struktur/elmi-sura), [Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsi](/struktur/elmi-tedqiqat-ve-beynelxalq-elaqeler-sobesi)\n\n' +
      `${PHONE}\n\n${MAIL}`,
  },
};

// ── 12. Müraciətlərə baxılma qaydası (TL-016) ────────────────────────────────
const HOTLINE_PHONES = '(012) 493 36 44, (012) 493 09 19';
const HOTLINE_MAIL = 'akademiya@asco.az';

const APPEALS_PAGE: QebulPageSeed = {
  slug: S.appeals,
  dataBlock: 'yox',
  layout: 'akademiya',
  az: {
    title: 'Müraciətlərə baxılma qaydası',
    lead:
      'Akademiyaya sual, təklif və şikayətlə «Qaynar xətt» telefonu, e-poçt və ya saytdakı onlayn forma ilə müraciət etmək olar. Hər müraciət qeydə alınır, araşdırılır və cavablandırılır.',
    body: `Akademiyanın «Qaynar xətt» xidmətinin iş qaydası «Qaynar xətt xidməti haqqında qaydalar» (ADDA-TL-016) ilə müəyyən edilib. Müraciətin növləri, onda göstərilməli məlumatlar, cavab müddətləri və hüquqi əsas [Vətəndaşların müraciəti](/vetendaslarin-muracieti) səhifəsindədir.

## «Qaynar xətt»

- Telefonlar: ${HOTLINE_PHONES}. Zənglər iş günü ərzində fasiləsiz qəbul edilir.
- Zəngi Akademiyanın qəbul otağının məsul əməkdaşı qəbul edir: danışıq qısa yazılır, zənglərin qeydiyyat kitabında qeyd olunur və dərhal rəhbərliyə məruzə edilir.
- Zəng edən Akademiya haqqında ümumi məlumat, o cümlədən rəhbərliyin qəbul günləri və saatları barədə məlumat ala, sual verə, təklif və şikayət bildirə bilər.

## E-poçtla müraciət

Sual, təklif və ya şikayətinizi ${HOTLINE_MAIL} ünvanına göndərə bilərsiniz. Məktubda adınızı, soyadınızı, ünvanınızı və telefon nömrənizi göstərin: müraciət araşdırıldıqdan sonra cavab e-poçtunuza göndərilir.

## Onlayn müraciət

Saytdakı [onlayn forma](/vetendaslarin-muracieti) ilə müraciəti birbaşa aidiyyəti istiqamətə ünvanlaya bilərsiniz: rektor, qəbul, tədris prosesi, dənizçi sertifikatları, elmi işlər və ya beynəlxalq əlaqələr. Bildiriş həmin bölməyə göndərilir, cavab e-poçtunuza gəlir.

## Xidmətin keyfiyyəti

Müraciətlər aidiyyəti üzrə yönləndirilir və operativ araşdırılır, hər müraciətin nəticəsi sənədləşdirilir. Qaydaya görə müraciətlərin ən azı 95 faizi vaxtında cavablandırılmalı, problemlərin 90 faizdən çoxu həll edilməlidir.`,
    seoDescription:
      'ADDA-ya müraciət: «Qaynar xətt» telefonları, e-poçt və onlayn forma; müraciətlərin qəbulu, qeydiyyatı və cavablandırılması (ADDA-TL-016).',
    facts: [
      { label: 'Qaynar xətt', value: '(012) 493 36 44', icon: 'telefon' },
      { label: 'E-poçt', value: HOTLINE_MAIL, icon: 'unvan' },
      { label: 'Onlayn', value: 'Vətəndaşların müraciəti', icon: 'forma' },
    ],
    sideLinks: [
      { label: 'Vətəndaşların müraciəti', url: ASK },
      { label: 'Əlaqə', url: '/elaqe' },
      { label: 'Rektor', url: U('rektor') },
      REGISTRY_LINK,
      tl(16, '«Qaynar xətt» xidməti haqqında qaydalar (ADDA-TL-016)'),
    ],
    contact: `**Qaynar xətt:** ${HOTLINE_PHONES}\n\n**E-poçt:** ${HOTLINE_MAIL}\n\n**Ünvan:** Bakı, Zərifə Əliyeva küçəsi 18`,
  },
};

// ── 13. İşə qəbul qaydaları (TL-019) ─────────────────────────────────────────
const HIRING_PAGE: QebulPageSeed = {
  slug: S.hiring,
  dataBlock: 'yox',
  layout: 'akademiya',
  az: {
    title: 'İşə qəbul qaydaları',
    lead:
      'Professor-müəllim heyətinə vakansiyalar mətbuatda elan olunur, namizəd rektorun adına ərizə verir; pedaqoji stajı olmayanlar üçün açıq sınaq dərsi keçirilir. Əmək müqaviləsi 3 aylıq sınaq müddəti ilə bağlanır.',
    body: `Professor-müəllim heyətinin və əməkdaşların işə qəbulu «Professor-müəllim heyətinin və əməkdaşların işə qəbulu» proseduru (ADDA-TL-019), Əmək Məcəlləsi və Akademiyanın [daxili intizam qaydaları](/sehife/daxili-intizam-qaydalari) əsasında aparılır. İşə qəbulu bir qayda olaraq işə qəbul komissiyası həyata keçirir.

## Professor-müəllim heyəti

1. Kafedralardakı vakant yerlər barədə elanlar mətbuatda («Azərbaycan müəllimi», «Dənizçi» qəzetləri və s.) dərc olunur.
2. Namizəd rektorun adına ərizə və sənədləri təqdim edir.
3. Pedaqoji stajı olmayan namizəd üçün açıq sınaq dərsi təşkil edilir; pedaqoji stajı olanlar üçün bu məcburi deyil.
4. Kafedranın müsbət rəyindən sonra namizədlə 3 ay sınaq müddətinə əmək müqaviləsi bağlanır.
5. Sınaq müddəti qənaətbəxş olarsa müqavilə bir tədris ili üçün bağlanır; hər il fəaliyyət qiymətləndirilir və növbəti il üçün müqavilə nəzərdən keçirilir.

Professor-müəllim heyətinə 0,25 və 0,75 ştat vahidi ilə işə qəbul aparılmır; müstəsna hallarda rəhbərliyin göstərişi ilə 0,25 ştata yol verilə bilər.

## Tələb olunan sənədlər

- şəxsiyyət vəsiqəsi;
- sosial sığorta kartının surəti;
- diplomların surəti (bakalavr, magistr, elmi dərəcə və elmi ad);
- sertifikatların surəti;
- tərcümeyi-hal və kadr uçotu üzrə şəxsi vərəqə;
- əmək kitabçası;
- hərbi biletin surəti;
- 4 ədəd 3x4 və 4 ədəd 4x6 ölçüdə fotoşəkil.

## Digər əməkdaşlar

1. Ərizə elektron sənəd dövriyyəsində qeydə alınır və rəhbərliyə təqdim olunur.
2. Rəhbərlik ərizəni işə qəbul komissiyasına yönləndirir; komissiya müsabiqə günü təyin edir, sənədlərə baxır, protokol tərtib edir və rəhbərliyə təklif verir.
3. Namizədlə 3 ay sınaq müddətinə əmək müqaviləsi bağlanır, əmr verilir. Sınaq dövrü qənaətbəxş olarsa müqavilə bir il üçün bağlanır və illik qiymətləndirmə ilə uzadılır.

İşə qəbul zamanı Əmək Məcəlləsinin 48-ci maddəsində göstərilən sənədlər tələb olunur; Məcəllədə nəzərdə tutulmayan əlavə sənəd tələb etmək qadağandır. Əmək müqaviləsinin bağlanması yaşayış yeri üzrə qeydiyyatdan asılı edilə bilməz.

## İxtisasartırma

- Ştatda olan professor-müəllim heyəti ixtisasını qısamüddətli (tematik) kurslarda, ən azı 5 ildə bir dəfə dövri kurslarda, qabaqcıl müəssisələrdə stajkeçmə və xarici ezamiyyətlər vasitəsilə artırır.
- Təlim ehtiyacları struktur bölmələrdə, o cümlədən STCW Konvensiyasının tələblərinə görə təhlil edilir. Təlimlər ölkədə və xarici tərəfdaşlarla keçirilir, sonda sertifikat verilir və bilik bölmədə daxili təqdimatla paylaşılır.`,
    seoDescription:
      'ADDA-da işə qəbul: professor-müəllim heyəti və əməkdaşlar üçün elan, sənədlər, açıq sınaq dərsi, sınaq müddəti, əmək müqaviləsi və ixtisasartırma (ADDA-TL-019).',
    facts: [
      { label: 'Sınaq müddəti', value: '3 ay', icon: 'muddet' },
      { label: 'Müqavilə', value: '1 tədris ili, illik qiymətləndirmə ilə', icon: 'sened' },
      { label: 'İxtisasartırma', value: 'Ən azı 5 ildə bir dəfə', icon: 'kitab' },
    ],
    sideLinks: [
      { label: 'Professor-müəllim heyəti', url: '/heyet/professor-muellim' },
      { label: 'Elanlar', url: '/elanlar' },
      { label: 'Daxili intizam qaydaları', url: p(S.discipline) },
      REGISTRY_LINK,
      tl(19, 'İşə qəbul proseduru (ADDA-TL-019)'),
    ],
    contact:
      '**Təşkilat:** [Personalın idarəedilməsi, əmək haqqı və kargüzarlıq şöbəsi](/struktur/personalin-idareedilmesi-emek-haqqi-ve-karguzarliq-sobesi)\n\n' +
      `${PHONE}\n\n${MAIL}`,
  },
};

export const QAYDA_PAGES: QebulPageSeed[] = [
  REGISTRY_PAGE,
  CREDIT_PAGE,
  EXAMS_PAGE,
  SUMMER_PAGE,
  TRANSFER_PAGE,
  PRACTICE_PAGE,
  TEACHING_PAGE,
  DIPLOMA_PAGE,
  INTEGRITY_PAGE,
  DISCIPLINE_PAGE,
  HONORARY_PAGE,
  APPEALS_PAGE,
  HIRING_PAGE,
];

// ── Mövcud səhifələrin mətni: dəqiq fraqmentlər ──────────────────────────────
export interface TextFix {
  slug: string;
  locale: 'az' | 'en' | 'ru';
  /** Mətndə dəqiq bir dəfə olmalıdır (yoxdursa — redaktor dəyişib, toxunulmur). */
  find: string;
  replace: string;
  /** Artıq tətbiq olunubsa (təkrar işləmə) — bu fraqment mətndə var. */
  doneIf: string;
}

const YDA_EXAM_DAY = `## İmtahan günü

- İmtahanın yerini və vaxtını ixtisas kafedraları müəyyən edir; məlumat imtahana ən azı 5 gün qalmış saytda yerləşdirilir.
- Tələbə imtahana şəxsiyyət vəsiqəsi və qiymət kitabçası ilə gəlir.
- İmtahan iki mərhələdə keçirilir: əvvəlcə auditoriyada nəzəri suallar (istismar səviyyəsi), günün ikinci yarısında trenajor otağında və ya laboratoriyada praktiki sual (idarəetmə səviyyəsi). «Gəmiqayırma və gəmi təmiri» ixtisası üzrə imtahan bir mərhələdə keçirilə bilər.
- Nəzəri və praktiki suallara aid biletlər eyni nömrə ilə işarələnir; praktiki biletlər o vaxtadək möhürlənmiş zərflərdə saxlanılır. Praktiki sualın yerinə yetirilməsi üçün 25 dəqiqəyə qədər vaxt verilir.
- Auditoriyada eyni vaxtda 2 tələbədən çox olmur; DAK gün ərzində 10 nəfərdən çox tələbədən imtahan qəbul etmir.
- Qaydalar pozulduqda DAK akt tərtib edir və tələbənin imtahan nəticəsi ləğv olunur.

Ətraflı: «Buraxılış yekun dövlət attestasiyasının (dövlət imtahanının) keçirilməsi qaydaları» (ADDA-TL-018).

`;

const PREP_AZ_OLD =
  'Tədris dilini kifayət qədər bilməyənlər üçün Akademiyada Azərbaycan və ingilis dili üzrə ödənişli hazırlıq kursları təşkil olunur.';
const PREP_AZ_NEW = `Tədris dilini kifayət qədər bilməyən əcnəbilər və vətəndaşlığı olmayan şəxslər üçün Akademiyada Azərbaycan və ingilis dili üzrə hazırlıq kursları təşkil olunur. Qaydalar: «Əcnəbilərin və vətəndaşlığı olmayan şəxslərin hazırlıq kurslarında təhsil alması qaydaları» (ADDA-TL-011).

- **Qəbul:** ildə iki dəfə, 1–25 sentyabr və 1–25 yanvar tarixlərində. Dərslər 1 oktyabr və 1 fevraldan başlayır.
- **Müddət:** 6 və ya 9 ay.
- **Müraciət:** Elm və Təhsil Nazirliyinin Təhsil Mərkəzləşdirilmiş İnformasiya Sisteminin (TMİS) «Elektron sənəd qəbulu» altsistemində elektron ərizə ilə. Ərizəyə əvvəlki təhsil sənədinin (leqallaşdırılmış və ya apostil olunmuş) və onun Azərbaycan dilinə notarial qaydada təsdiq edilmiş tərcüməsinin surəti, Azərbaycan Respublikasının səhiyyə müəssisəsindən sağlamlıq arayışı (o cümlədən QİÇS, hepatit B və C daşıyıcısı olmaması barədə), etibarlı sərhədkeçmə sənədi, 3x4 ölçüdə 6 fotoşəkil və milli pasportun təsdiqlənmiş tərcüməsi əlavə olunur. Sənədlər TMİS-də qeydiyyatdan sonra Akademiyaya təqdim edilir.
- **Qəbul qərarı:** sənədlər və komissiya ilə müsahibə əsasında protokolla rəsmiləşdirilir.
- **Ödəniş:** kurslar yalnız ödənişlidir; Akademiya ilə əcnəbi (və ya onun təhsil haqqını ödəyən şəxs) arasında müqavilə bağlanır. Əcnəbi hər hansı səbəbdən xaric olunarsa, ödənilmiş haqq qaytarılmır. Ölkəyə gələ bilməyən şəxs üçün müqavilə nümayəndə vasitəsilə bağlandıqda distant hazırlıq mümkündür.
- **Nəticə:** yekun qiymətləndirmədən məqbul qiymət alan dinləyici Akademiyaya qəbul olunmaq üçün əsas qazanır. Kurs dövründə başqa təhsil müəssisəsinin hazırlıq kursuna köçürülməyə icazə verilmir.
- **Xaric olunma:** öz arzusu ilə, daxili nizam-intizam qaydalarını kobud pozduqda, təhsil haqqını ödəmədikdə və ya səhhətinə görə.`;

const PREP_EN_OLD =
  'Students who do not yet have sufficient command of the language of instruction can take paid preparatory courses in Azerbaijani and English at the Academy.';
const PREP_EN_NEW = `Foreign nationals and stateless persons who do not yet have sufficient command of the language of instruction can take preparatory courses in Azerbaijani and English at the Academy. Rules: “Rules for foreign nationals and stateless persons studying on preparatory courses” (ADDA-TL-011).

- **Intake:** twice a year, 1–25 September and 1–25 January. Classes start on 1 October and 1 February.
- **Duration:** 6 or 9 months.
- **Application:** online, through the “Electronic document submission” subsystem of the Ministry of Science and Education’s Centralised Education Information System (TMİS). Attach scans of your previous education certificate (legalised or apostilled) with a notarised Azerbaijani translation, a health certificate from a medical institution in Azerbaijan (including HIV and hepatitis B and C), a valid travel document, six 3x4 photos and a certified translation of your national passport. After registration in TMİS the documents are submitted to the Academy.
- **Admission decision:** based on the documents and an interview with the commission, recorded in a protocol.
- **Fees:** the courses are fee-paying only; a contract is signed with the student (or the person paying the fees). Fees are not refunded if the student leaves the Academy for any reason. Distance preparation is possible when the contract is signed through a representative for a person unable to come to the country.
- **Result:** students who pass the final assessment qualify for admission to the Academy. Transfer to another institution’s preparatory course is not allowed during the course.
- **Expulsion:** at the student’s own request, for a gross breach of the Academy’s internal rules, for non-payment of fees or on health grounds.`;

const PREP_RU_OLD =
  'Для тех, кто недостаточно владеет языком обучения, в Академии организованы платные подготовительные курсы азербайджанского и английского языков.';
const PREP_RU_NEW = `Для иностранцев и лиц без гражданства, недостаточно владеющих языком обучения, в Академии организованы подготовительные курсы азербайджанского и английского языков. Правила: «Правила обучения иностранцев и лиц без гражданства на подготовительных курсах» (ADDA-TL-011).

- **Приём:** дважды в год, 1–25 сентября и 1–25 января. Занятия начинаются 1 октября и 1 февраля.
- **Срок обучения:** 6 или 9 месяцев.
- **Заявка:** в электронном виде через подсистему «Электронный приём документов» Централизованной информационной системы образования (TMİS) Министерства науки и образования. К заявке прилагаются сканы документа о предыдущем образовании (легализованного или с апостилем) и его нотариально заверенного перевода на азербайджанский язык, справка о состоянии здоровья из медицинского учреждения Азербайджана (в том числе об отсутствии ВИЧ, гепатитов B и C), действительный документ для пересечения границы, 6 фотографий 3x4 и заверенный перевод национального паспорта. После регистрации в TMİS документы представляются в Академию.
- **Решение о приёме:** на основании документов и собеседования с комиссией, оформляется протоколом.
- **Оплата:** курсы только платные; с иностранцем (или лицом, оплачивающим обучение) заключается договор. При отчислении по любой причине плата не возвращается. Если иностранец не может приехать в страну, при заключении договора через представителя возможна дистанционная подготовка.
- **Результат:** слушатель, получивший положительную итоговую оценку, получает основание для поступления в Академию. Перевод на подготовительные курсы другого учебного заведения во время обучения не допускается.
- **Отчисление:** по собственному желанию, за грубое нарушение правил внутреннего распорядка, за неуплату или по состоянию здоровья.`;

export const TEXT_FIXES: TextFix[] = [
  // Yekun attestasiya (F5.54 seed): TL-018-dən «İmtahan günü» — «Qiymətləndirmə şkalası»ndan əvvəl.
  {
    slug: 'yekun-dovlet-attestasiyasi',
    locale: 'az',
    find: '## Qiymətləndirmə şkalası',
    replace: `${YDA_EXAM_DAY}## Qiymətləndirmə şkalası`,
    doneIf: '## İmtahan günü',
  },
  // Əcnəbilərin qəbulu (F5.45 seed): hazırlıq kursları — TL-011.
  { slug: 'ecnebi-telebelerin-qebulu-qaydalari', locale: 'az', find: PREP_AZ_OLD, replace: PREP_AZ_NEW, doneIf: 'ADDA-TL-011' },
  { slug: 'ecnebi-telebelerin-qebulu-qaydalari', locale: 'en', find: PREP_EN_OLD, replace: PREP_EN_NEW, doneIf: 'ADDA-TL-011' },
  { slug: 'ecnebi-telebelerin-qebulu-qaydalari', locale: 'ru', find: PREP_RU_OLD, replace: PREP_RU_NEW, doneIf: 'ADDA-TL-011' },
  // Əcnəbi tələbələr üçün bələdçi (F5.48 seed): «6 və ya 12 ay» → TL-011-ə görə 6 və ya 9 ay.
  {
    slug: 'ecnebi-telebelerin-tehsili',
    locale: 'az',
    find: '- **Hazırlıq kursları:** Azərbaycan və ingilis dili üzrə, ödənişli, 6 və ya 12 ay.',
    replace:
      '- **Hazırlıq kursları:** Azərbaycan və ingilis dili üzrə, ödənişli, 6 və ya 9 ay; qəbul 1–25 sentyabr və 1–25 yanvar ([ətraflı](/sehife/ecnebi-telebelerin-qebulu-qaydalari)).',
    doneIf: '6 və ya 9 ay',
  },
  {
    slug: 'ecnebi-telebelerin-tehsili',
    locale: 'en',
    find: '- **Preparatory courses:** Azerbaijani and English, fee-paying, 6 or 12 months.',
    replace:
      '- **Preparatory courses:** Azerbaijani and English, fee-paying, 6 or 9 months; intake 1–25 September and 1–25 January ([details](/sehife/ecnebi-telebelerin-qebulu-qaydalari)).',
    doneIf: '6 or 9 months',
  },
  {
    slug: 'ecnebi-telebelerin-tehsili',
    locale: 'ru',
    find: '- **Подготовительные курсы:** азербайджанский и английский языки, платные, 6 или 12 месяцев.',
    replace:
      '- **Подготовительные курсы:** азербайджанский и английский языки, платные, 6 или 9 месяцев; приём 1–25 сентября и 1–25 января ([подробнее](/sehife/ecnebi-telebelerin-qebulu-qaydalari)).',
    doneIf: '6 или 9 месяцев',
  },
];

// ── Mövcud səhifələrin yan keçidləri (az, yalnız yoxdursa) ───────────────────
export const RULE_PAGE_LINKS: { slug: string; links: LinkSeed[] }[] = [
  {
    slug: 'tecrube-haqqinda',
    links: [
      { label: 'Diplomqabağı təcrübə', url: p(S.practice) },
      tl(21, 'Diplomqabağı təcrübənin qiymətləndirilməsi qaydaları (ADDA-TL-021)'),
    ],
  },
  {
    slug: 'yekun-dovlet-attestasiyasi',
    links: [
      tl(18, 'Dövlət imtahanının keçirilməsi qaydaları (ADDA-TL-018)'),
      { label: 'Diplom və akademik transkript', url: p(S.diploma) },
    ],
  },
  { slug: 'subbakalavr', links: [{ label: 'Bakalavriata keçiddə kreditlərin tanınması', url: p(S.transfer) }] },
  { slug: 'bakalavriat', links: [CREDIT_LINK, { label: 'Köçürmə, bərpa və kreditlərin tanınması', url: p(S.transfer) }] },
  { slug: 'magistratura', links: [CREDIT_LINK, { label: 'Akademik dürüstlük və antiplagiat', url: p(S.integrity) }] },
  { slug: 'ingilis-dilinde-tedris', links: [tl(20, 'İngilis dili fənləri üzrə imtahan qaydaları (ADDA-TL-020)')] },
  { slug: 'ecnebi-telebelerin-qebulu-qaydalari', links: [tl(11, 'Hazırlıq kursları qaydaları (ADDA-TL-011)')] },
  { slug: 'ecnebi-telebelerin-tehsili', links: [tl(11, 'Hazırlıq kursları qaydaları (ADDA-TL-011)')] },
  {
    slug: 'keyfiyyet-idareetme-sistemi',
    links: [REGISTRY_LINK, tl(14, 'KİS işçi qrupu haqqında qaydalar (ADDA-TL-014)')],
  },
  { slug: 'doktorantura', links: [{ label: 'Akademik dürüstlük və antiplagiat', url: p(S.integrity) }] },
  { slug: 'elmi-jurnal', links: [{ label: 'Akademik dürüstlük və antiplagiat', url: p(S.integrity) }] },
  { slug: 'mobillik-ve-mubadile', links: [{ label: 'Köçürmə, bərpa və kreditlərin tanınması', url: p(S.transfer) }] },
  { slug: 'telebe-heyati', links: [{ label: 'Daxili intizam qaydaları', url: p(S.discipline) }] },
  { slug: 'yataqxana', links: [{ label: 'Daxili intizam qaydaları', url: p(S.discipline) }] },
  { slug: 'struktur-bolmelerin-esasnameleri', links: [REGISTRY_LINK] },
  { slug: 'tedris-metodiki-sura', links: [{ label: 'Tədrisin təşkili və dərs növləri', url: p(S.teaching) }] },
];

// ── Menyu ────────────────────────────────────────────────────────────────────
const PLACEHOLDER = (slug: string): string[] => [`/hazirlanir/${slug}`, `/az/hazirlanir/${slug}`, '#', ''];

/** «Hazırlanır» keçidi → yeni səhifə (etiket dəqiq uyğun, ünvan hələ yer tutan olmalı). */
export const RULE_MENU_RULES: { label: string; old: string[]; to: string; newLabel?: string; ownerFrom?: string }[] = [
  {
    label: 'Fəxri doktorlarımız',
    old: PLACEHOLDER('fexri-doktorlarimiz'),
    to: p(S.honorary),
    newLabel: 'Fəxri doktor və fəxri professor',
    ownerFrom: 'page:fexri-doktorlarimiz',
  },
  {
    label: 'Akademik dürüstlük bəyannaməsi',
    old: PLACEHOLDER('akademik-durustluk-beyannamesi'),
    to: p(S.integrity),
    newLabel: 'Akademik dürüstlük və antiplagiat',
    ownerFrom: 'page:akademik-durustluk-beyannamesi',
  },
  { label: 'Müraciətlərə baxılma qaydası', old: PLACEHOLDER('muracietlere-baxilma-qaydasi'), to: p(S.appeals) },
];

/** Qrupa əlavə olunan keçidlər (ünvan qrupda artıq varsa toxunulmur); `create` — qrup yoxdursa yaradılır. */
export const RULE_MENU_ADD: {
  category: string;
  group: string;
  after?: string;
  create?: boolean;
  links: { label: string; url: string }[];
}[] = [
  {
    category: 'Akademiya',
    group: 'Hüquqi baza və etika',
    after: 'Struktur bölmələrin əsasnamələri',
    links: [
      { label: 'Qaydalar və təlimatlar', url: p(RULES_SLUG) },
      { label: 'Daxili intizam qaydaları', url: p(S.discipline) },
    ],
  },
  { category: 'Akademiya', group: 'Heyət', links: [{ label: 'İşə qəbul qaydaları', url: p(S.hiring) }] },
  {
    category: 'Təhsil',
    group: 'Dəniz praktikası',
    after: 'Təcrübə (praktika)',
    links: [{ label: 'Diplomqabağı təcrübə', url: p(S.practice) }],
  },
  {
    category: 'Təhsil',
    group: 'Tədris qaydaları',
    create: true,
    links: [
      { label: 'Kredit sistemi ilə tədris', url: p(S.credit) },
      { label: 'Qiymətləndirmə və imtahanlar', url: p(S.exams) },
      { label: 'Yay semestri və əlavə kəsir', url: p(S.summer) },
      { label: 'Köçürmə, bərpa və kreditlərin tanınması', url: p(S.transfer) },
      { label: 'Tədrisin təşkili və dərs növləri', url: p(S.teaching) },
      { label: 'Diplom və akademik transkript', url: p(S.diploma) },
      { label: 'Qaydalar və təlimatlar', url: p(RULES_SLUG) },
    ],
  },
  { category: 'Tələbə həyatı', group: 'Tələbə üçün', links: [{ label: 'Daxili intizam qaydaları', url: p(S.discipline) }] },
];
