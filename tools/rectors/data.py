#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# K27b — rektorlarin uc dilli meluamt bazasi.
# BU FAYL TEK MENBEDIR: hem Strapi seed bloku, hem de Next fallback modulu
# burdan generasiya olunur. Ikisini elle saxlasaq bir gun ayrilacaqdilar.

RECTORS = [
    {
        "slug": "sambur-hemdullaoglu",
        "termFrom": 1997, "termTo": 2009, "sortOrder": 10, "died": None,
        "name": {
            "az": "Sambur Həmdullaoğlu",
            "ru": "Самбур Гамдуллаоглу",
            "en": "Sambur Hamdullaoglu",
        },
        "degree": {
            "az": "Texnika elmləri namizədi (texnika üzrə fəlsəfə doktoru), dosent",
            "ru": "Кандидат технических наук (доктор философии по технике), доцент",
            "en": "PhD in Engineering, Associate Professor",
        },
        "summary": {
            "az": "Akademiyanın ən uzun rektorluq dövrü — 12 il. Sonradan «Gəmi energetik qurğuları» kafedrasının müdiri olub.",
            "ru": "Самый длительный ректорский срок в истории Академии — 12 лет. Позже возглавлял кафедру судовых энергетических установок.",
            "en": "The longest rectorship in the Academy\u2019s history \u2014 12 years. Later headed the Marine Power Plants department.",
        },
        "bio": {
            "az": [
                "1931-ci il avqustun 7-də Bakı şəhərinin Biləcəri qəsəbəsində anadan olub.",
                "1950-ci ildə İ. V. Stalin adına Moskva Lenin ordenli və Qırmızı Əmək Bayrağı ordenli Dəmir Yolu Mühəndisləri İnstitutuna daxil olub. 1956-cı ildə həmin institutda «Dəmir yolu nəqliyyatının vaqon heyəti üzrə mühəndislik və pedaqoji hazırlıq» üzrə tam təhsil kursunu başa vuraraq «dəmir yolu mühəndis-mexaniki» ixtisasına yiyələnib.",
                "1956-cı ildə «Azərbaycan Dəmir Yolları Mühəndislik Evi»ndə məsləhətçi-mühəndis vəzifəsinə işə qəbul olunub. 1961-ci ilin avqustunda «Azərbaycan Dəmir Yolları İdarəsinin Təhsil Müəssisələri» şöbəsinin baş inspektoru təyin edilib. Həmin ilin noyabrında M. Əzizbəyov adına Azərbaycan Neft və Kimya İnstitutunun əyani aspiranturasına daxil olub və 1964-cü ilin dekabrında təhsilini bitirib.",
                "1965-ci ildə institut şurasının qərarı ilə ona texnika elmləri namizədi elmi dərəcəsi verilib. 1971-ci ildə Ali Attestasiya Komissiyasının qərarı ilə «İstilik mühəndisliyinin nəzəri əsasları» kafedrası üzrə dosent elmi adı təsdiqlənib.",
                "Aspiranturanı bitirdikdən sonra 1965–1966-cı illərdə «Ümumi istilik mühəndisliyi» kafedrasında assistent, 1967–1970-ci illərdə «Daxili yanma mühərriklərinin istilik mühəndisliyi» kafedrasında baş müəllim işləyib. 1970–1972-ci illərdə Energetika fakültəsində əyani təhsil üzrə dekan müavini, 1973–1979-cu illərdə həmin fakültənin axşam təhsili üzrə dekanı, 1980–1982-ci illərdə institutun qiyabi təhsil üzrə dekanı, 1982–1983-cü illərdə «İstilik mühəndisliyi» fakültəsinin axşam və qiyabi təhsil üzrə dekan müavini vəzifələrində çalışıb.",
                "1984–1988-ci illərdə Odessa Dəniz Mühəndisləri İnstitutunun axşam və qiyabi fakültəsinin Bakı filialının dekanı, 1988–1996-cı illərdə Novorossiysk Ali Dəniz Mühəndisliyi Məktəbinin axşam və qiyabi fakültəsinin Bakı filialının müdiri vəzifələrində işləyib.",
                "1997–2009-cu illərdə Azərbaycan Dövlət Dəniz Akademiyasının rektoru olub. Dənizçilik sahəsində tanınmış ziyalı və rəhbər kimi akademiyanın beynəlxalq aləmdə tanınmasında və dənizçi kadrların yetişdirilməsində böyük əməyi olub.",
                "2009–2014-cü illərdə «Gəmi energetik qurğuları» kafedrasının müdiri, 2014–2015-ci illərdə həmin kafedranın dosenti vəzifəsində çalışıb. «Gəmi daxiliyanma mühərriklərinin hesabı» kitabının (İsmayılov A. Ş., Sambur H. O., Əliyev S. N.) və çoxsaylı dərs vəsaitlərinin, elmi məqalələrin müəlliflərindən biridir.",
            ],
            "ru": [
                "Родился 7 августа 1931 года в посёлке Биляджари города Баку.",
                "В 1950 году поступил в Московский ордена Ленина и ордена Трудового Красного Знамени институт инженеров железнодорожного транспорта имени И. В. Сталина. В 1956 году завершил там полный курс обучения по специальности «Инженерная и педагогическая подготовка по вагонному составу железнодорожного транспорта» и получил квалификацию инженера-механика железнодорожного транспорта.",
                "В 1956 году принят на должность инженера-консультанта в «Дом инженеров Азербайджанских железных дорог». В августе 1961 года назначен главным инспектором отдела «Учебные заведения Управления Азербайджанских железных дорог». В ноябре того же года поступил в очную аспирантуру Азербайджанского института нефти и химии имени М. Азизбекова, которую окончил в декабре 1964 года.",
                "В 1965 году решением учёного совета института ему была присуждена учёная степень кандидата технических наук. В 1971 году решением Высшей аттестационной комиссии утверждён в учёном звании доцента по кафедре «Теоретические основы теплотехники».",
                "После окончания аспирантуры в 1965–1966 годах работал ассистентом кафедры «Общая теплотехника», в 1967–1970 годах — старшим преподавателем кафедры «Теплотехника двигателей внутреннего сгорания». В 1970–1972 годах — заместитель декана энергетического факультета по очному обучению, в 1973–1979 годах — декан того же факультета по вечернему обучению, в 1980–1982 годах — декан института по заочному обучению, в 1982–1983 годах — заместитель декана факультета «Теплотехника» по вечернему и заочному обучению.",
                "В 1984–1988 годах — декан бакинского филиала вечернего и заочного факультета Одесского института инженеров морского флота, в 1988–1996 годах — заведующий бакинским филиалом вечернего и заочного факультета Новороссийского высшего инженерного морского училища.",
                "В 1997–2009 годах — ректор Азербайджанской государственной морской академии. Как известный специалист и руководитель в области морского дела внёс большой вклад в международное признание академии и в подготовку морских кадров.",
                "В 2009–2014 годах заведовал кафедрой «Судовые энергетические установки», в 2014–2015 годах работал доцентом той же кафедры. Один из авторов книги «Расчёт судовых двигателей внутреннего сгорания» (Исмайлов А. Ш., Самбур Г. О., Алиев С. Н.), а также многочисленных учебных пособий и научных статей.",
            ],
            "en": [
                "Born on 7 August 1931 in the Bilajari settlement of Baku.",
                "In 1950 he entered the Stalin Moscow Institute of Railway Transport Engineers, holder of the Order of Lenin and the Order of the Red Banner of Labour. In 1956 he completed the full course in engineering and teaching for railway rolling stock, qualifying as a railway mechanical engineer.",
                "In 1956 he joined the Azerbaijan Railways Engineering House as a consulting engineer. In August 1961 he was appointed chief inspector of the Educational Institutions department of the Azerbaijan Railways Administration. In November of that year he began full-time postgraduate study at the M. Azizbeyov Azerbaijan Institute of Oil and Chemistry, completing it in December 1964.",
                "In 1965 the institute\u2019s academic council awarded him the degree of Candidate of Technical Sciences. In 1971 the Higher Attestation Commission confirmed him as Associate Professor in the Theoretical Foundations of Heat Engineering department.",
                "After his postgraduate studies he was an assistant lecturer in the General Heat Engineering department (1965\u20131966) and a senior lecturer in the Heat Engineering of Internal Combustion Engines department (1967\u20131970). He then served as deputy dean of the Faculty of Power Engineering for full-time study (1970\u20131972), dean of the same faculty for evening study (1973\u20131979), dean of the institute for correspondence study (1980\u20131982), and deputy dean of the Heat Engineering faculty for evening and correspondence study (1982\u20131983).",
                "From 1984 to 1988 he was dean of the Baku branch of the evening and correspondence faculty of the Odessa Institute of Marine Engineers, and from 1988 to 1996 head of the Baku branch of the corresponding faculty at the Novorossiysk Higher Marine Engineering School.",
                "He served as Rector of the Azerbaijan State Maritime Academy from 1997 to 2009. A respected scholar and leader in maritime affairs, he contributed substantially to the Academy\u2019s international recognition and to the training of seafaring professionals.",
                "From 2009 to 2014 he headed the Marine Power Plants department, and from 2014 to 2015 worked there as an associate professor. He is a co-author of the book \u00abCalculation of Marine Internal Combustion Engines\u00bb (A. Sh. Ismayilov, H. O. Sambur, S. N. Aliyev) and of numerous teaching materials and research papers.",
            ],
        },
    },
    {
        "slug": "rasim-besirov",
        "termFrom": 2009, "termTo": 2014, "sortOrder": 20, "died": None,
        "name": {
            "az": "Rasim Bəşirov",
            "ru": "Расим Баширов",
            "en": "Rasim Bashirov",
        },
        "degree": {
            "az": "Texnika elmləri doktoru, professor",
            "ru": "Доктор технических наук, профессор",
            "en": "Doctor of Sciences in Engineering, Professor",
        },
        "summary": {
            "az": "Rektorluğundan əvvəl səkkiz il akademiyada prorektor işləyib. Elmi əsərlər jurnalının təsisçisidir.",
            "ru": "До ректорства восемь лет работал проректором Академии. Основатель журнала научных трудов.",
            "en": "Served eight years as vice-rector before his rectorship. Founded the Academy\u2019s scientific journal.",
        },
        "bio": {
            "az": [
                "Bəşirov Rasim Cavad oğlu 1957-ci il martın 15-də Abşeron rayonunun Güzdək qəsəbəsində anadan olub.",
                "1974–1979-cu illərdə Azərbaycan Politexnik İnstitutunun mexanika fakültəsində ali təhsil alaraq «Maşınqayırma texnologiyası, metalkəsən dəzgahlar və alətlər» ixtisasını fərqlənmə diplomu ilə bitirib.",
                "2004-cü ildə «Mexaniki və fiziki-texniki emal prosesləri, dəzgahlar, alətlər və texnoloji avadanlıqlar» ixtisası üzrə texnika elmləri doktoru dissertasiyasını müdafiə edib. 1994-cü ildən dosent, 2010-cu ildən professordur.",
                "1979–1983-cü illərdə Tətbiqi Fizika Elmi-Tədqiqat İnstitutunda mühəndis və mühəndis-konstruktor vəzifələrində çalışıb. 1983–2000-ci illərdə Azərbaycan Politexnik İnstitutunda baş müəllim, dosent və prorektor kimi fəaliyyət göstərib.",
                "1996–2004-cü illərdə Azərbaycan Dövlət Dəniz Akademiyasında dosent və tədris işləri üzrə prorektor vəzifələrində çalışaraq ali dəniz təhsil sisteminin formalaşdırılmasında iştirak edib. Bu dövrdə akademiyanın ilk nizamnaməsinin və müasir tələblərə cavab verən tədris planlarının hazırlanmasında birbaşa iştirakı olub. Gəmiqayırma və gəmi təmiri ixtisası üzrə Azərbaycanda ilk professorlardan biri kimi bu sahənin ali təhsil və elmi istiqamət kimi formalaşmasına töhfə verib.",
                "Akademiyanın beynəlxalq səviyyəyə çıxması məqsədilə 2000-ci ildə Londonda keçirilən Beynəlxalq Dənizçilik Təşkilatının sessiyasında iştirak edərək akademiya diplomlarının beynəlxalq səviyyədə tanınmasına nail olunmasında fəal rol oynayıb.",
                "Rektorluğu dövründə akademiyanın maddi-texniki bazasının möhkəmləndirilməsi, beynəlxalq əlaqələrin genişləndirilməsi və elmi-tədqiqat potensialının artırılması istiqamətində işlər həyata keçirib, elmi əsərlər jurnalını təsis edərək müntəzəm nəşrini təmin edib. Elmi kadr hazırlığına xüsusi diqqət yetirib — rəhbərliyi altında 4 nəfər texnika üzrə fəlsəfə doktoru elmi dərəcəsi alıb.",
                "200-dən artıq elmi və elmi-metodiki məqalənin, 2 monoqrafiyanın, 7 ixtiranın, 5 dərsliyin və 10-dan artıq dərs vəsaitinin müəllifidir. Bir sıra beynəlxalq konfransların iştirakçısıdır; elmi əsərlərinin əksəriyyəti Scopus və Web of Science indeksli jurnallarda çap edilib.",
                "2015-ci ildən Azərbaycan Texniki Universitetində kafedra müdiri, hazırda isə «Xüsusi texnologiyalar və avadanlıqlar» kafedrasının professorudur.",
            ],
            "ru": [
                "Баширов Расим Джавад оглы родился 15 марта 1957 года в посёлке Гюздек Абшеронского района.",
                "В 1974–1979 годах учился на механическом факультете Азербайджанского политехнического института и с отличием окончил специальность «Технология машиностроения, металлорежущие станки и инструменты».",
                "В 2004 году защитил докторскую диссертацию по специальности «Процессы механической и физико-технической обработки, станки, инструменты и технологическое оборудование». Доцент с 1994 года, профессор — с 2010 года.",
                "В 1979–1983 годах работал инженером и инженером-конструктором в Научно-исследовательском институте прикладной физики. В 1983–2000 годах занимал в Азербайджанском политехническом институте должности старшего преподавателя, доцента и проректора.",
                "В 1996–2004 годах работал доцентом и проректором по учебной работе Азербайджанской государственной морской академии, участвуя в формировании системы высшего морского образования. В этот период он непосредственно участвовал в разработке первого устава академии и современных учебных планов. Как один из первых в Азербайджане профессоров по специальности судостроения и судоремонта внёс вклад в становление этого направления в высшем образовании и науке.",
                "В 2000 году принял участие в сессии Международной морской организации в Лондоне и сыграл активную роль в достижении международного признания дипломов академии.",
                "В период ректорства осуществил работу по укреплению материально-технической базы академии, расширению международных связей и наращиванию научно-исследовательского потенциала, а также учредил журнал научных трудов и обеспечил его регулярный выпуск. Особое внимание уделял подготовке научных кадров — под его руководством 4 сотрудника получили степень доктора философии по технике.",
                "Автор более 200 научных и научно-методических статей, 2 монографий, 7 изобретений, 5 учебников и более 10 учебных пособий. Участник ряда международных конференций; большинство его работ опубликовано в журналах, индексируемых в Scopus и Web of Science.",
                "С 2015 года работает в Азербайджанском техническом университете: заведовал кафедрой, в настоящее время — профессор кафедры «Специальные технологии и оборудование».",
            ],
            "en": [
                "Rasim Javad oglu Bashirov was born on 15 March 1957 in the settlement of Guzdek, Absheron district.",
                "From 1974 to 1979 he studied at the mechanical faculty of the Azerbaijan Polytechnic Institute, graduating with honours in machine-building technology, metal-cutting machines and tools.",
                "In 2004 he defended his doctoral dissertation in mechanical and physico-technical processing, machine tools and technological equipment. He has been an associate professor since 1994 and a full professor since 2010.",
                "He worked as an engineer and design engineer at the Applied Physics Research Institute from 1979 to 1983, and from 1983 to 2000 held posts as senior lecturer, associate professor and vice-rector at the Azerbaijan Polytechnic Institute.",
                "Between 1996 and 2004 he served the Azerbaijan State Maritime Academy as associate professor and vice-rector for academic affairs, helping to shape the country\u2019s system of higher maritime education. In that period he took direct part in drafting the Academy\u2019s first statute and its modern curricula. As one of Azerbaijan\u2019s first professors in shipbuilding and ship repair, he contributed to establishing the field as an academic and research discipline.",
                "In 2000 he attended the session of the International Maritime Organization in London and played an active part in securing international recognition of the Academy\u2019s diplomas.",
                "As rector he strengthened the Academy\u2019s facilities, widened its international links and expanded its research capacity. He founded the Academy\u2019s journal of scientific works and ensured its regular publication, and gave particular attention to training researchers \u2014 four staff members earned doctoral degrees in engineering under his supervision.",
                "He is the author of more than 200 scientific and methodological articles, 2 monographs, 7 inventions, 5 textbooks and over 10 teaching manuals. He has taken part in a number of international conferences, and most of his work has appeared in journals indexed by Scopus and Web of Science.",
                "Since 2015 he has worked at Azerbaijan Technical University, where he headed a department and is currently professor in the Special Technologies and Equipment department.",
            ],
        },
    },
    {
        "slug": "cingiz-eliyev",
        "termFrom": 2014, "termTo": 2019, "sortOrder": 30, "died": "2019-01-07",
        "name": {
            "az": "Çingiz Əliyev",
            "ru": "Чингиз Алиев",
            "en": "Chingiz Aliyev",
        },
        "degree": {
            "az": "Texnika elmləri namizədi (texnika üzrə fəlsəfə doktoru), dosent",
            "ru": "Кандидат технических наук (доктор философии по технике), доцент",
            "en": "PhD in Engineering, Associate Professor",
        },
        "summary": {
            "az": "Kapitan rütbəsinədək yüksəlmiş dənizçi. Akademiyaya əvvəlcə prorektor, sonra rektor kimi rəhbərlik edib.",
            "ru": "Моряк, дослужившийся до звания капитана. Работал в Академии сначала проректором, затем ректором.",
            "en": "A seafarer who rose to the rank of captain. Served the Academy first as vice-rector, then as rector.",
        },
        "bio": {
            "az": [
                "Əliyev Çingiz Mansur oğlu 1963-cü il yanvarın 5-də Bakı şəhərində anadan olub.",
                "1986-cı ildə Leninqrad Su Nəqliyyatı İnstitutunu gəmi mühəndisliyi ixtisası üzrə bitirib.",
                "1987–1993-cü illərdə «Xəzərdənizneftdonanma» idarəsində kapitan köməkçisi vəzifəsindən kapitan rütbəsinədək yüksəlib. 1993–1996-cı illərdə həmin idarədə dənizdə təhlükəsiz üzmə xidməti üzrə rəis müavini, 1996–2006-cı illərdə British Petroleum şirkətində dəniz işləri üzrə rəis, 2006–2013-cü illərdə «Caspian Marine Services» LTD şirkətində direktor vəzifələrində çalışıb.",
                "2013-cü ildən Azərbaycan Dövlət Dəniz Akademiyasının beynəlxalq əlaqələr üzrə, 2014–2015-ci illərdə isə tədris və tərbiyə işləri üzrə prorektoru olub. Həmçinin «Naviqasiya» kafedrasının dosenti kimi fəaliyyət göstərib.",
                "«Caspian Marine Services» LTD şirkətində işlədiyi dövrdə «Silindr oymaqlarının xarici səthinə məsaməli örtük çəkməklə dizel mühərriklərinin uzunömürlülüyünün artırılması» mövzusunda dissertasiya müdafiə edərək texnika üzrə fəlsəfə doktoru elmi dərəcəsi alıb.",
                "17 elmi məqalənin, 2 dərsliyin, 1 monoqrafiyanın və 7 dərs vəsaitinin müəllifidir.",
            ],
            "ru": [
                "Алиев Чингиз Мансур оглы родился 5 января 1963 года в городе Баку.",
                "В 1986 году окончил Ленинградский институт водного транспорта по специальности «судовая инженерия».",
                "В 1987–1993 годах в управлении «Каспморнефтефлот» прошёл путь от помощника капитана до звания капитана. В 1993–1996 годах работал там же заместителем начальника службы безопасности мореплавания, в 1996–2006 годах — начальником по морским работам в компании British Petroleum, в 2006–2013 годах — директором компании «Caspian Marine Services» LTD.",
                "С 2013 года — проректор Азербайджанской государственной морской академии по международным связям, в 2014–2015 годах — проректор по учебной и воспитательной работе. Работал также доцентом кафедры «Навигация».",
                "Во время работы в «Caspian Marine Services» LTD защитил диссертацию на тему «Повышение долговечности дизельных двигателей нанесением пористого покрытия на внешнюю поверхность цилиндровых втулок» и получил учёную степень доктора философии по технике.",
                "Автор 17 научных статей, 2 учебников, 1 монографии и 7 учебных пособий.",
            ],
            "en": [
                "Chingiz Mansur oglu Aliyev was born on 5 January 1963 in Baku.",
                "He graduated from the Leningrad Institute of Water Transport in 1986 with a degree in marine engineering.",
                "Between 1987 and 1993 he rose from chief mate to the rank of captain at the Caspian Oil Fleet administration, and from 1993 to 1996 served there as deputy head of the maritime safety service. He was head of marine operations at British Petroleum from 1996 to 2006 and director of Caspian Marine Services LTD from 2006 to 2013.",
                "From 2013 he was vice-rector for international relations at the Azerbaijan State Maritime Academy, and in 2014\u20132015 vice-rector for academic and student affairs. He also taught as an associate professor in the Navigation department.",
                "While at Caspian Marine Services LTD he defended a dissertation on extending the service life of diesel engines by applying a porous coating to the outer surface of cylinder liners, earning a doctoral degree in engineering.",
                "He was the author of 17 research papers, 2 textbooks, 1 monograph and 7 teaching manuals.",
            ],
        },
    },
    {
        "slug": "heyder-esedov",
        "termFrom": 2019, "termTo": 2024, "sortOrder": 40, "died": None,
        "name": {
            "az": "Heydər Əsədov",
            "ru": "Гейдар Асадов",
            "en": "Heydar Asadov",
        },
        "degree": {
            "az": "İqtisad elmləri namizədi (iqtisad üzrə fəlsəfə doktoru), dosent",
            "ru": "Кандидат экономических наук (доктор философии по экономике), доцент",
            "en": "PhD in Economics, Associate Professor",
        },
        "summary": {
            "az": "Maliyyə və dövlət idarəçiliyindən gələn rektor — Hesablama Palatasının sədri və kənd təsərrüfatı naziri işləyib.",
            "ru": "Ректор с опытом в финансах и государственном управлении — председатель Счётной палаты и министр сельского хозяйства.",
            "en": "A rector from finance and public administration \u2014 former Chairman of the Chamber of Accounts and Minister of Agriculture.",
        },
        "bio": {
            "az": [
                "Heydər Əsədov 1959-cu il oktyabrın 24-də anadan olub. 1983-cü ildə D. Bünyadzadə adına Azərbaycan Xalq Təsərrüfatı İnstitutunu bitirib.",
                "1983–1992-ci illərdə Azərbaycan Dövlət İqtisad İnstitutunda müəllim işləyib. 1987-ci ildə M. V. Lomonosov adına Moskva Dövlət Universitetində namizədlik dissertasiyasını müdafiə edərək iqtisad elmləri namizədi elmi dərəcəsini alıb.",
                "1995-ci ildə Azərbaycan Respublikası Prezidentinin sərəncamı ilə maliyyə nazirinin müavini təyin edilib. 1996–2007-ci illərdə Maliyyə Nazirliyi yanında Baş Dövlət Xəzinədarlığının baş direktoru, 2007–2013-cü illərdə Azərbaycan Respublikası Hesablama Palatasının sədri vəzifələrində çalışıb.",
                "Azərbaycan Respublikası Prezidentinin 2013-cü il 22 oktyabr tarixli sərəncamı ilə Azərbaycan Respublikasının kənd təsərrüfatı naziri, 2019-cu il 3 aprel tarixli sərəncamı ilə isə Azərbaycan Dövlət Dəniz Akademiyasının rektoru təyin edilib.",
                "Azərbaycan Respublikası Prezidentinin müvafiq sərəncamları ilə 2011-ci ildə 2-ci dərəcəli «Vətənə xidmətə görə» ordeni, 2019-cu ildə «Azərbaycan Xalq Cümhuriyyətinin 100 illiyi (1918–2018)» yubiley medalı, həmçinin təhsilin inkişafındakı xidmətlərinə görə «Şöhrət» ordeni ilə təltif olunub.",
                "3 monoqrafiyanın və 30-dan çox elmi əsərin müəllifidir.",
            ],
            "ru": [
                "Гейдар Асадов родился 24 октября 1959 года. В 1983 году окончил Азербайджанский институт народного хозяйства имени Д. Буниатзаде.",
                "В 1983–1992 годах работал преподавателем в Азербайджанском государственном экономическом институте. В 1987 году защитил кандидатскую диссертацию в Московском государственном университете имени М. В. Ломоносова и получил учёную степень кандидата экономических наук.",
                "В 1995 году распоряжением Президента Азербайджанской Республики назначен заместителем министра финансов. В 1996–2007 годах — генеральный директор Главного государственного казначейства при Министерстве финансов, в 2007–2013 годах — председатель Счётной палаты Азербайджанской Республики.",
                "Распоряжением Президента Азербайджанской Республики от 22 октября 2013 года назначен министром сельского хозяйства Азербайджанской Республики, а распоряжением от 3 апреля 2019 года — ректором Азербайджанской государственной морской академии.",
                "Соответствующими распоряжениями Президента Азербайджанской Республики награждён орденом «За службу Отечеству» 2-й степени (2011), юбилейной медалью «100-летие Азербайджанской Демократической Республики (1918–2018)» (2019), а также орденом «Шохрат» за заслуги в развитии образования.",
                "Автор 3 монографий и более 30 научных работ.",
            ],
            "en": [
                "Heydar Asadov was born on 24 October 1959. In 1983 he graduated from the D. Bunyadzade Azerbaijan Institute of National Economy.",
                "From 1983 to 1992 he taught at the Azerbaijan State Economic Institute. In 1987 he defended his candidate\u2019s dissertation at Lomonosov Moscow State University, earning the degree of Candidate of Economic Sciences.",
                "In 1995, by order of the President of the Republic of Azerbaijan, he was appointed Deputy Minister of Finance. He served as Director General of the State Treasury under the Ministry of Finance from 1996 to 2007, and as Chairman of the Chamber of Accounts of the Republic of Azerbaijan from 2007 to 2013.",
                "By presidential order of 22 October 2013 he was appointed Minister of Agriculture of the Republic of Azerbaijan, and by presidential order of 3 April 2019 Rector of the Azerbaijan State Maritime Academy.",
                "By the relevant presidential orders he received the Order For Service to the Fatherland, 2nd class (2011), the jubilee medal marking the centenary of the Azerbaijan Democratic Republic, 1918\u20132018 (2019), and the Order of Glory (\u00abShohrat\u00bb) for services to the development of education.",
                "He is the author of 3 monographs and more than 30 scholarly works.",
            ],
        },
    },
]

LEAD = {
    "az": "Akademiyaya 1997\u20132024-c\u00fc ill\u0259rd\u0259 r\u0259hb\u0259rlik etmi\u015f d\u00f6rd rektor: f\u0259aliyy\u0259t d\u00f6vrl\u0259ri, elmi d\u0259r\u0259c\u0259l\u0259ri v\u0259 bioqrafiyalar\u0131.",
    "ru": "\u0427\u0435\u0442\u044b\u0440\u0435 \u0440\u0435\u043a\u0442\u043e\u0440\u0430, \u0432\u043e\u0437\u0433\u043b\u0430\u0432\u043b\u044f\u0432\u0448\u0438\u0435 \u0410\u043a\u0430\u0434\u0435\u043c\u0438\u044e \u0432 1997\u20132024 \u0433\u043e\u0434\u0430\u0445: \u0441\u0440\u043e\u043a\u0438 \u043f\u043e\u043b\u043d\u043e\u043c\u043e\u0447\u0438\u0439, \u0443\u0447\u0451\u043d\u044b\u0435 \u0441\u0442\u0435\u043f\u0435\u043d\u0438 \u0438 \u0431\u0438\u043e\u0433\u0440\u0430\u0444\u0438\u0438.",
    "en": "The four rectors who led the Academy between 1997 and 2024 \u2014 terms of office, academic degrees and biographies.",
}

LOCALES = ['az', 'ru', 'en']


def validate():
    seen = set()
    for r in RECTORS:
        assert r['slug'] not in seen, 'təkrar slug: ' + r['slug']
        seen.add(r['slug'])
        for loc in LOCALES:
            for f in ('name', 'degree', 'summary'):
                assert r[f][loc].strip(), '%s/%s bosdur' % (r['slug'], f)
            assert len(r['bio'][loc]) > 0, '%s/%s bio bosdur' % (r['slug'], loc)
        # abzas sayi uc dilde uygun olmalidir - bir dil unudulsa derhal gorunur
        n = len(r['bio']['az'])
        for loc in LOCALES:
            assert len(r['bio'][loc]) == n, \
                '%s: abzas sayi uygun deyil (az=%d %s=%d)' % (r['slug'], n, loc, len(r['bio'][loc]))
    return True


if __name__ == '__main__':
    validate()
    total = sum(len(r['bio'][l]) for r in RECTORS for l in LOCALES)
    print('OK — %d rektor, %d abzas (3 dil)' % (len(RECTORS), total))
