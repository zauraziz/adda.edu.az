// K27a — Sabiq rektorlar reyestri.
//
// NİYƏ STRAPI-DƏ DEYİL:
// Bu, tarixi və qapalı siyahıdır — dörd şəxs, dəyişməyən dövrlər. Ayrıca
// content-type yaratmaq admin panelinə bir daha doldurulmayacaq forma əlavə
// edərdi. `/struktur` ağacı ilə eyni qərar.
//
// TƏRCÜMƏ VƏZİYYƏTİ:
// Struktur sahələr (ad, dövr, elmi dərəcə, xülasə) üç dildədir.
// Tam bioqrafiya HƏLƏLİK yalnız `az` — layihənin qüvvədə olan qaydası:
// arxiv mətni maşın tərcüməsi ilə çoxaldılmır. `ru`/`en` üçün `null` qoyulub,
// səhifə bunu görüb qeyd göstərir. Redaktə edilmiş tərcümə gələndə sadəcə
// massiv doldurulur — səhifə koduna toxunulmur.

export interface RectorName {
  az: string;
  ru: string;
  en: string;
}

export interface Rector {
  /** Sabit açar — ankor linki və React key üçün. */
  id: string;
  name: RectorName;
  /** Portret olmadığı üçün monoqram lövhəsi göstərilir. */
  monogram: string;
  termFrom: number;
  termTo: number;
  degree: RectorName;
  /** Bir cümləlik xülasə — kartın üst hissəsində. */
  summary: RectorName;
  /** Tam bioqrafiya, abzas-abzas. `null` = həmin dildə hazır deyil. */
  bio: { az: string[]; ru: string[] | null; en: string[] | null };
  /** Yalnız vəfat etmiş şəxslər üçün — ISO tarix. */
  died?: string;
}

/** Siyahı və detal səhifələri eyni lid cümləsini işlədir — bir yerdə saxlanılır. */
export const RECTORS_LEAD =
  'Akademiyaya 1997–2024-cü illərdə rəhbərlik etmiş dörd rektor: fəaliyyət dövrləri, elmi dərəcələri və bioqrafiyaları.';

export const RECTORS: Rector[] = [
  {
    id: 'sambur-hemdullaoglu',
    name: {
      az: 'Sambur Həmdullaoğlu',
      ru: 'Самбур Гамдуллаоглу',
      en: 'Sambur Hamdullaoglu',
    },
    monogram: 'SH',
    termFrom: 1997,
    termTo: 2009,
    degree: {
      az: 'Texnika elmləri namizədi (texnika üzrə fəlsəfə doktoru), dosent',
      ru: 'Кандидат технических наук (доктор философии по технике), доцент',
      en: 'PhD in Engineering, Associate Professor',
    },
    summary: {
      az: 'Akademiyanın ən uzun rektorluq dövrü — 12 il. Sonradan «Gəmi energetik qurğuları» kafedrasının müdiri olub.',
      ru: 'Самый длительный ректорский срок в истории Академии — 12 лет. Позже возглавлял кафедру судовых энергетических установок.',
      en: 'The longest rectorship in the Academy\u2019s history \u2014 12 years. Later headed the Marine Power Plants department.',
    },
    bio: {
      az: [
        '1931-ci il avqustun 7-də Bakı şəhərinin Biləcəri qəsəbəsində anadan olub.',
        '1950-ci ildə İ. V. Stalin adına Moskva Lenin ordenli və Qırmızı Əmək Bayrağı ordenli Dəmir Yolu Mühəndisləri İnstitutuna daxil olub. 1956-cı ildə həmin institutda «Dəmir yolu nəqliyyatının vaqon heyəti üzrə mühəndislik və pedaqoji hazırlıq» üzrə tam təhsil kursunu başa vuraraq «dəmir yolu mühəndis-mexaniki» ixtisasına yiyələnib.',
        '1956-cı ildə «Azərbaycan Dəmir Yolları Mühəndislik Evi»ndə məsləhətçi-mühəndis vəzifəsinə işə qəbul olunub. 1961-ci ilin avqustunda «Azərbaycan Dəmir Yolları İdarəsinin Təhsil Müəssisələri» şöbəsinin baş inspektoru təyin edilib. Həmin ilin noyabrında M. Əzizbəyov adına Azərbaycan Neft və Kimya İnstitutunun əyani aspiranturasına daxil olub və 1964-cü ilin dekabrında təhsilini bitirib.',
        '1965-ci ildə institut şurasının qərarı ilə ona texnika elmləri namizədi elmi dərəcəsi verilib. 1971-ci ildə Ali Attestasiya Komissiyasının qərarı ilə «İstilik mühəndisliyinin nəzəri əsasları» kafedrası üzrə dosent elmi adı təsdiqlənib.',
        'Aspiranturanı bitirdikdən sonra 1965–1966-cı illərdə «Ümumi istilik mühəndisliyi» kafedrasında assistent, 1967–1970-ci illərdə «Daxili yanma mühərriklərinin istilik mühəndisliyi» kafedrasında baş müəllim işləyib. 1970–1972-ci illərdə Energetika fakültəsində əyani təhsil üzrə dekan müavini, 1973–1979-cu illərdə həmin fakültənin axşam təhsili üzrə dekanı, 1980–1982-ci illərdə institutun qiyabi təhsil üzrə dekanı, 1982–1983-cü illərdə «İstilik mühəndisliyi» fakültəsinin axşam və qiyabi təhsil üzrə dekan müavini vəzifələrində çalışıb.',
        '1984–1988-ci illərdə Odessa Dəniz Mühəndisləri İnstitutunun axşam və qiyabi fakültəsinin Bakı filialının dekanı, 1988–1996-cı illərdə Novorossiysk Ali Dəniz Mühəndisliyi Məktəbinin axşam və qiyabi fakültəsinin Bakı filialının müdiri vəzifələrində işləyib.',
        '1997–2009-cu illərdə Azərbaycan Dövlət Dəniz Akademiyasının rektoru olub. Dənizçilik sahəsində tanınmış ziyalı və rəhbər kimi akademiyanın beynəlxalq aləmdə tanınmasında və dənizçi kadrların yetişdirilməsində böyük əməyi olub.',
        '2009–2014-cü illərdə «Gəmi energetik qurğuları» kafedrasının müdiri, 2014–2015-ci illərdə həmin kafedranın dosenti vəzifəsində çalışıb. «Gəmi daxiliyanma mühərriklərinin hesabı» kitabının (İsmayılov A. Ş., Sambur H. O., Əliyev S. N.) və çoxsaylı dərs vəsaitlərinin, elmi məqalələrin müəlliflərindən biridir.',
      ],
      ru: null,
      en: null,
    },
  },
  {
    id: 'rasim-besirov',
    name: {
      az: 'Rasim Bəşirov',
      ru: 'Расим Баширов',
      en: 'Rasim Bashirov',
    },
    monogram: 'RB',
    termFrom: 2009,
    termTo: 2014,
    degree: {
      az: 'Texnika elmləri doktoru, professor',
      ru: 'Доктор технических наук, профессор',
      en: 'Doctor of Sciences in Engineering, Professor',
    },
    summary: {
      az: 'Rektorluğundan əvvəl səkkiz il akademiyada prorektor işləyib. Elmi əsərlər jurnalının təsisçisidir.',
      ru: 'До ректорства восемь лет работал проректором Академии. Основатель журнала научных трудов.',
      en: 'Served eight years as vice-rector before his rectorship. Founded the Academy\u2019s scientific journal.',
    },
    bio: {
      az: [
        'Bəşirov Rasim Cavad oğlu 1957-ci il martın 15-də Abşeron rayonunun Güzdək qəsəbəsində anadan olub.',
        '1974–1979-cu illərdə Azərbaycan Politexnik İnstitutunun mexanika fakültəsində ali təhsil alaraq «Maşınqayırma texnologiyası, metalkəsən dəzgahlar və alətlər» ixtisasını fərqlənmə diplomu ilə bitirib.',
        '2004-cü ildə «Mexaniki və fiziki-texniki emal prosesləri, dəzgahlar, alətlər və texnoloji avadanlıqlar» ixtisası üzrə texnika elmləri doktoru dissertasiyasını müdafiə edib. 1994-cü ildən dosent, 2010-cu ildən professordur.',
        '1979–1983-cü illərdə Tətbiqi Fizika Elmi-Tədqiqat İnstitutunda mühəndis və mühəndis-konstruktor vəzifələrində çalışıb. 1983–2000-ci illərdə Azərbaycan Politexnik İnstitutunda baş müəllim, dosent və prorektor kimi fəaliyyət göstərib.',
        '1996–2004-cü illərdə Azərbaycan Dövlət Dəniz Akademiyasında dosent və tədris işləri üzrə prorektor vəzifələrində çalışaraq ali dəniz təhsil sisteminin formalaşdırılmasında iştirak edib. Bu dövrdə akademiyanın ilk nizamnaməsinin və müasir tələblərə cavab verən tədris planlarının hazırlanmasında birbaşa iştirakı olub. Gəmiqayırma və gəmi təmiri ixtisası üzrə Azərbaycanda ilk professorlardan biri kimi bu sahənin ali təhsil və elmi istiqamət kimi formalaşmasına töhfə verib.',
        'Akademiyanın beynəlxalq səviyyəyə çıxması məqsədilə 2000-ci ildə Londonda keçirilən Beynəlxalq Dənizçilik Təşkilatının sessiyasında iştirak edərək akademiya diplomlarının beynəlxalq səviyyədə tanınmasına nail olunmasında fəal rol oynayıb.',
        'Rektorluğu dövründə akademiyanın maddi-texniki bazasının möhkəmləndirilməsi, beynəlxalq əlaqələrin genişləndirilməsi və elmi-tədqiqat potensialının artırılması istiqamətində işlər həyata keçirib, elmi əsərlər jurnalını təsis edərək müntəzəm nəşrini təmin edib. Elmi kadr hazırlığına xüsusi diqqət yetirib — rəhbərliyi altında 4 nəfər texnika üzrə fəlsəfə doktoru elmi dərəcəsi alıb.',
        '200-dən artıq elmi və elmi-metodiki məqalənin, 2 monoqrafiyanın, 7 ixtiranın, 5 dərsliyin və 10-dan artıq dərs vəsaitinin müəllifidir. Bir sıra beynəlxalq konfransların iştirakçısıdır; elmi əsərlərinin əksəriyyəti Scopus və Web of Science indeksli jurnallarda çap edilib.',
        '2015-ci ildən Azərbaycan Texniki Universitetində kafedra müdiri, hazırda isə «Xüsusi texnologiyalar və avadanlıqlar» kafedrasının professorudur.',
      ],
      ru: null,
      en: null,
    },
  },
  {
    id: 'cingiz-eliyev',
    name: {
      az: 'Çingiz Əliyev',
      ru: 'Чингиз Алиев',
      en: 'Chingiz Aliyev',
    },
    monogram: 'ÇƏ',
    termFrom: 2014,
    termTo: 2019,
    degree: {
      az: 'Texnika elmləri namizədi (texnika üzrə fəlsəfə doktoru), dosent',
      ru: 'Кандидат технических наук (доктор философии по технике), доцент',
      en: 'PhD in Engineering, Associate Professor',
    },
    summary: {
      az: 'Kapitan rütbəsinədək yüksəlmiş dənizçi. Akademiyaya əvvəlcə prorektor, sonra rektor kimi rəhbərlik edib.',
      ru: 'Моряк, дослужившийся до звания капитана. Работал в Академии сначала проректором, затем ректором.',
      en: 'A seafarer who rose to the rank of captain. Served the Academy first as vice-rector, then as rector.',
    },
    died: '2019-01-07',
    bio: {
      az: [
        'Əliyev Çingiz Mansur oğlu 1963-cü il yanvarın 5-də Bakı şəhərində anadan olub.',
        '1986-cı ildə Leninqrad Su Nəqliyyatı İnstitutunu gəmi mühəndisliyi ixtisası üzrə bitirib.',
        '1987–1993-cü illərdə «Xəzərdənizneftdonanma» idarəsində kapitan köməkçisi vəzifəsindən kapitan rütbəsinədək yüksəlib. 1993–1996-cı illərdə həmin idarədə dənizdə təhlükəsiz üzmə xidməti üzrə rəis müavini, 1996–2006-cı illərdə British Petroleum şirkətində dəniz işləri üzrə rəis, 2006–2013-cü illərdə «Caspian Marine Services» LTD şirkətində direktor vəzifələrində çalışıb.',
        '2013-cü ildən Azərbaycan Dövlət Dəniz Akademiyasının beynəlxalq əlaqələr üzrə, 2014–2015-ci illərdə isə tədris və tərbiyə işləri üzrə prorektoru olub. Həmçinin «Naviqasiya» kafedrasının dosenti kimi fəaliyyət göstərib.',
        '«Caspian Marine Services» LTD şirkətində işlədiyi dövrdə «Silindr oymaqlarının xarici səthinə məsaməli örtük çəkməklə dizel mühərriklərinin uzunömürlülüyünün artırılması» mövzusunda dissertasiya müdafiə edərək texnika üzrə fəlsəfə doktoru elmi dərəcəsi alıb.',
        '17 elmi məqalənin, 2 dərsliyin, 1 monoqrafiyanın və 7 dərs vəsaitinin müəllifidir.',
      ],
      ru: null,
      en: null,
    },
  },
  {
    id: 'heyder-esedov',
    name: {
      az: 'Heydər Əsədov',
      ru: 'Гейдар Асадов',
      en: 'Heydar Asadov',
    },
    monogram: 'HƏ',
    termFrom: 2019,
    termTo: 2024,
    degree: {
      az: 'İqtisad elmləri namizədi (iqtisad üzrə fəlsəfə doktoru), dosent',
      ru: 'Кандидат экономических наук (доктор философии по экономике), доцент',
      en: 'PhD in Economics, Associate Professor',
    },
    summary: {
      az: 'Maliyyə və dövlət idarəçiliyindən gələn rektor — Hesablama Palatasının sədri və kənd təsərrüfatı naziri işləyib.',
      ru: 'Ректор с опытом в финансах и государственном управлении — председатель Счётной палаты и министр сельского хозяйства.',
      en: 'A rector from finance and public administration \u2014 former Chairman of the Chamber of Accounts and Minister of Agriculture.',
    },
    bio: {
      az: [
        'Heydər Əsədov 1959-cu il oktyabrın 24-də anadan olub. 1983-cü ildə D. Bünyadzadə adına Azərbaycan Xalq Təsərrüfatı İnstitutunu bitirib.',
        '1983–1992-ci illərdə Azərbaycan Dövlət İqtisad İnstitutunda müəllim işləyib. 1987-ci ildə M. V. Lomonosov adına Moskva Dövlət Universitetində namizədlik dissertasiyasını müdafiə edərək iqtisad elmləri namizədi elmi dərəcəsini alıb.',
        '1995-ci ildə Azərbaycan Respublikası Prezidentinin sərəncamı ilə maliyyə nazirinin müavini təyin edilib. 1996–2007-ci illərdə Maliyyə Nazirliyi yanında Baş Dövlət Xəzinədarlığının baş direktoru, 2007–2013-cü illərdə Azərbaycan Respublikası Hesablama Palatasının sədri vəzifələrində çalışıb.',
        'Azərbaycan Respublikası Prezidentinin 2013-cü il 22 oktyabr tarixli sərəncamı ilə Azərbaycan Respublikasının kənd təsərrüfatı naziri, 2019-cu il 3 aprel tarixli sərəncamı ilə isə Azərbaycan Dövlət Dəniz Akademiyasının rektoru təyin edilib.',
        'Azərbaycan Respublikası Prezidentinin müvafiq sərəncamları ilə 2011-ci ildə 2-ci dərəcəli «Vətənə xidmətə görə» ordeni, 2019-cu ildə «Azərbaycan Xalq Cümhuriyyətinin 100 illiyi (1918–2018)» yubiley medalı, həmçinin təhsilin inkişafındakı xidmətlərinə görə «Şöhrət» ordeni ilə təltif olunub.',
        '3 monoqrafiyanın və 30-dan çox elmi əsərin müəllifidir.',
      ],
      ru: null,
      en: null,
    },
  },
];
