/**
 * F5.59 — 10 əməkdaşın profil məlumatı (Zaur müəllim, 27.10.2026: prorektor, iki dekan,
 * yeddi kafedra müdiri). Mənbə: Zaur müəllimin göndərdiyi JSON; mətn yalnız tipoqrafik
 * düzəlişlə («dırnaq», il aralığı «2015–2017», «h/h» → «indiyədək», telefon «(012) 371 03 24»).
 * `sortYear` — başlanğıc ili (admin qaydası). Miqrasiya: src/utils/staff-profiles.ts
 * (`staffProfiles:v1`) — yalnız BOŞ sahələrə yazır.
 *
 * `birthDate` saytda GÖRÜNMÜR: admində «5. Sistem — Heyət — məxfi» (staff-private) qeydinə
 * yazılır, onun REST marşrutu yoxdur.
 */
import type { StaffProfileSeed } from './staff-profiles';

export const STAFF_PROFILES: StaffProfileSeed[] = [
  {
    "fullName": "Süleymanova İradə Əli qızı",
    "position": "Tədris işləri üzrə prorektor",
    "department": "Rektorluq",
    "degree": "Biologiya üzrə fəlsəfə doktoru",
    "degreeYear": 2007,
    "title": "Dosent",
    "titleYear": 2014,
    "education": [
      {
        "period": "1981–1986",
        "institution": "Bakı Dövlət Universiteti",
        "qualification": "Bioloq, Biologiya və kimya müəllimliyi",
        "sortYear": 1981
      }
    ],
    "career": [
      {
        "period": "2024–2026",
        "organization": "Qarabağ Universiteti",
        "position": "Tələbələrlə iş mərkəzinin direktoru",
        "sortYear": 2024
      },
      {
        "period": "2015–2024",
        "organization": "Bakı Dövlət Universiteti",
        "position": "SABAH Mərkəzinin rəhbəri",
        "sortYear": 2015
      },
      {
        "period": "2012–2024",
        "organization": "Bakı Dövlət Universiteti, Zoologiya-fiziologiya kafedrası",
        "position": "Dosent",
        "sortYear": 2012
      },
      {
        "period": "2010–2012",
        "organization": "Bakı Dövlət Universiteti",
        "position": "Baş müəllim",
        "sortYear": 2010
      },
      {
        "period": "1991–1996",
        "organization": "176 №-li orta məktəb",
        "position": "Biologiya müəllimi",
        "sortYear": 1991
      },
      {
        "period": "1988–1991",
        "organization": "AMEA Zoologiya Elmi-Tədqiqat İnstitutu",
        "position": "Baş laborant",
        "sortYear": 1988
      },
      {
        "period": "1986–1988",
        "organization": "Səhiyyə Nazirliyinin nəzdində Mikrobiologiya, Virusologiya və Epidemiologiya İnstitutu",
        "position": "Baş laborant",
        "sortYear": 1986
      }
    ],
    "highlights": [
      "Paris Sorbonna Universiteti Əbu-Dabi təcrübə mübadiləsi və təhsildə innovativ həllər proqramları (Bakı 2015, Əbu-Dabi 2016, Paris 2016)",
      "Thomson Reuters Web of Science sertifikat proqramı (2016)",
      "Ali təhsilin idarə olunması, akkreditasiya meyarları və xarici keyfiyyət təminatı üzrə 20-dən çox təlim və konfrans iştirakçısı / təlimçisi (2009–2023)",
      "Xəzər dənizinin bioekologiyası üzrə yerli və beynəlxalq elmi nəşrlərdə dərc edilmiş 18 elmi məqalə və tezis"
    ],
    "awards": [
      "Bakı Dövlət Universitetinin 100 illik yubileyi medalı"
    ],
    "languages": [
      {
        "lang": "az"
      },
      {
        "lang": "ru",
        "level": "əla"
      },
      {
        "lang": "tr",
        "level": "əla"
      },
      {
        "lang": "en",
        "level": "orta"
      }
    ],
    "email": "irada.suleymanova@asco.az",
    "birthDate": "1964-09-03"
  },
  {
    "fullName": "Abbasov Elnur Oruc oğlu",
    "position": "Dekan",
    "department": "«Gəmi sürücülüyü» («Dəniz naviqasiyası») fakültəsi",
    "degree": "Texnika üzrə fəlsəfə doktoru",
    "degreeYear": 2017,
    "title": "Dosent",
    "titleYear": 2022,
    "education": [
      {
        "period": "2002–2004",
        "institution": "Azərbaycan Dövlət Dəniz Akademiyası (Magistr)",
        "qualification": "Gəmiçilik və gəmilərin hərəkətinin idarə edilməsi",
        "sortYear": 2002
      },
      {
        "period": "1997–2001",
        "institution": "Azərbaycan Dövlət Dəniz Akademiyası (Bakalavr)",
        "qualification": "Gəmiçilik və gəmilərin hərəkətinin idarə edilməsi",
        "sortYear": 1997
      }
    ],
    "career": [
      {
        "period": "2017–indiyədək",
        "organization": "Azərbaycan Dövlət Dəniz Akademiyası, «Gəmi sürücülüyü» fakültəsi",
        "position": "Dekan",
        "sortYear": 2017
      },
      {
        "period": "2015–2017",
        "organization": "Azərbaycan Dövlət Dəniz Akademiyası, «Dəniz naviqasiyası» kafedrası və fakültəsi",
        "position": "Baş müəllim, dekan müavini",
        "sortYear": 2015
      },
      {
        "period": "2014–2015",
        "organization": "Azərbaycan Dövlət Dəniz Akademiyası, «Naviqasiya» kafedrası",
        "position": "Baş müəllim",
        "sortYear": 2014
      },
      {
        "period": "2013–2014",
        "organization": "Azərbaycan Dövlət Dəniz Akademiyası, «Naviqasiya» kafedrası",
        "position": "Kafedra müdiri, baş müəllim",
        "sortYear": 2013
      },
      {
        "period": "2011–2013",
        "organization": "Azərbaycan Dövlət Dəniz Akademiyası, «Dəniz texnikası və gəmiçilik» fakültəsi",
        "position": "Baş müəllim, dekan müavini",
        "sortYear": 2011
      },
      {
        "period": "2010–2011",
        "organization": "Azərbaycan Dövlət Dəniz Akademiyası, «Gəmi sürücülüyü» kafedrası",
        "position": "Baş müəllim",
        "sortYear": 2010
      },
      {
        "period": "2004–2010",
        "organization": "Azərbaycan Dövlət Dəniz Akademiyası, «Gəmi sürücülüyü» kafedrası",
        "position": "Assistent",
        "sortYear": 2004
      },
      {
        "period": "2003–2004",
        "organization": "Azərbaycan Dövlət Dəniz Akademiyası, «Gəmi sürücülüyü» kafedrası",
        "position": "Baş laborant",
        "sortYear": 2003
      }
    ],
    "highlights": [
      "SEASPOL beynəlxalq layihəsi çərçivəsində elmi konfrans iştirakçısı (Odessa, Ukrayna)"
    ],
    "awards": [
      "«AXDG» QSC tərəfindən «Fəxri fərman»"
    ],
    "languages": [
      {
        "lang": "az"
      },
      {
        "lang": "ru",
        "level": "yaxşı"
      },
      {
        "lang": "en"
      }
    ],
    "email": "elnur.abbasov@asco.az",
    "birthDate": "1980-03-19"
  },
  {
    "fullName": "Əsgərov Rafiq Xəlil oğlu",
    "position": "Dekan",
    "department": "«Gəmi energetik qurğuları və elektromexanikası» fakültəsi",
    "degree": "Texnika üzrə fəlsəfə doktoru",
    "degreeYear": 2015,
    "title": "Dosent",
    "titleYear": 2015,
    "education": [
      {
        "period": "1974–1979",
        "institution": "Bakı Dövlət Universiteti (ADU)",
        "qualification": "Mexanika-riyaziyyat fakültəsi, Riyaziyyatçı",
        "sortYear": 1974
      }
    ],
    "career": [
      {
        "period": "2003–indiyədək",
        "organization": "Azərbaycan Dövlət Dəniz Akademiyası",
        "position": "Baş müəllim, dekan müavini, dekan",
        "sortYear": 2003
      },
      {
        "period": "1996–2000",
        "organization": "Azərbaycan Dövlət Dəniz Akademiyası",
        "position": "Laboratoriya müdiri",
        "sortYear": 1996
      },
      {
        "period": "1990–1996",
        "organization": "Bakı Dəniz Yolları Məktəbi",
        "position": "Tədris işləri üzrə rəis müavini",
        "sortYear": 1990
      },
      {
        "period": "1985–1990",
        "organization": "Bakı Dəniz Yolları Məktəbi",
        "position": "Müəllim",
        "sortYear": 1985
      },
      {
        "period": "1983–1985",
        "organization": "2 №-li Dəmiryol Texniki Peşə Məktəbi",
        "position": "Müəllim",
        "sortYear": 1983
      },
      {
        "period": "1979–1983",
        "organization": "Təbii Ehtiyatların Kosmik Tədqiqatı İnstitutu",
        "position": "Böyük mühəndis",
        "sortYear": 1979
      }
    ],
    "highlights": [
      "ADDA-nın elmi konfransları və III Elmi-Praktiki Beynəlxalq Konfrans iştirakçısı"
    ],
    "awards": [],
    "languages": [
      {
        "lang": "az"
      },
      {
        "lang": "ru",
        "level": "sərbəst"
      },
      {
        "lang": "en"
      }
    ],
    "email": "rafiq.asgarov@asco.az",
    "phone": "(012) 371 03 24",
    "birthDate": "1957-01-24"
  },
  {
    "fullName": "Həsənov Yusif Nadir oğlu",
    "position": "Kafedra müdiri",
    "department": "«Tətbiqi mexanika» kafedrası",
    "degree": "Texnika elmləri doktoru",
    "degreeYear": 2007,
    "title": "Professor",
    "titleYear": 2016,
    "education": [
      {
        "period": "1980–1985",
        "institution": "Azərbaycan Texniki Universiteti (Ç.İldırım adına AzPİ)",
        "qualification": "Mühəndis-mexanik (Fərqlənmə diplomu)",
        "sortYear": 1980
      }
    ],
    "career": [
      {
        "period": "2025–indiyədək",
        "organization": "Azərbaycan Dövlət Dəniz Akademiyası, «Tətbiqi mexanika» kafedrası",
        "position": "Kafedra müdiri",
        "sortYear": 2025
      },
      {
        "period": "2018–2025",
        "organization": "Azərbaycan Dövlət Dəniz Akademiyası, «Tətbiqi mexanika» kafedrası",
        "position": "Professor",
        "sortYear": 2018
      },
      {
        "period": "2010–2018",
        "organization": "Standartlaşdırma, Metrologiya və Patent üzrə Dövlət Komitəsinin Mərkəzi Aparatının Metrologiya şöbəsi",
        "position": "Müdir müavini",
        "sortYear": 2010
      },
      {
        "period": "2009–2010",
        "organization": "Standartlaşdırma, Metrologiya və Patent üzrə Dövlət Komitəsinin Daxili Nəzarət şöbəsi",
        "position": "Baş məsləhətçi",
        "sortYear": 2009
      },
      {
        "period": "2008–2009",
        "organization": "Standartlaşdırma, Metrologiya və Patent üzrə Dövlət Agentliyi yanında Milli Metrologiya Mərkəzi",
        "position": "Direktor",
        "sortYear": 2008
      },
      {
        "period": "2006–2008",
        "organization": "Standartlaşdırma, Metrologiya və Patent üzrə Dövlət Agentliyi",
        "position": "Sektor müdiri, şöbə müdirinin müavini",
        "sortYear": 2006
      },
      {
        "period": "1991–2006",
        "organization": "Azərbaycan Texniki Universiteti, «Standartlaşdırma və metrologiya» kafedrası",
        "position": "Assistent, baş müəllim, dosent",
        "sortYear": 1991
      },
      {
        "period": "1988–1991",
        "organization": "Ç.İldırım adına Azərbaycan Politexnik İnstitutu",
        "position": "Aspirant",
        "sortYear": 1988
      },
      {
        "period": "1985–1988",
        "organization": "ВНИИПТнефтьмаш (AzMTİ)",
        "position": "Mühəndis-texnoloq",
        "sortYear": 1985
      }
    ],
    "highlights": [
      "150-dən çox elmi məqalənin, 18 monoqrafiya və dərs vəsaitinin, 5 ixtiranın müəllifi",
      "Dövlət qulluğunun müşaviri (2011)",
      "Rusiya, Belarusiya və Ukrayna Metrologiya Akademiyalarının həqiqi üzvü"
    ],
    "awards": [
      "Metrologiya sahəsində «Xidmətlərinə görə» xüsusi döş nişanı",
      "MDB-nin Standartlaşdırma, Metrologiya və Uyğunluğun Qiymətləndirilməsi üzrə MQS təşkilatının «Xidmətlərinə görə» medalı",
      "KOOMET təşkilatının (21 dövlət üzrə) «Əməkdar Metroloq» fəxri adı və döş nişanı",
      "Türk Dünyası Araştırmaları Uluslararası İlimler Akademisinin «Uluslararası» ödülü"
    ],
    "languages": [
      {
        "lang": "az",
        "level": "sərbəst"
      },
      {
        "lang": "ru",
        "level": "sərbəst"
      },
      {
        "lang": "de"
      }
    ],
    "email": "yusif.hasanov@asco.az",
    "birthDate": "1963-03-14"
  },
  {
    "fullName": "Nəbiyev Həzi Nəbi oğlu",
    "position": "Kafedra müdiri",
    "department": "«Dəniz naviqasiyası» kafedrası",
    "degree": "Texnika üzrə fəlsəfə doktoru",
    "degreeYear": 2018,
    "title": "Dosent",
    "titleYear": 2025,
    "education": [
      {
        "period": "2018–2023",
        "institution": "Azərbaycan Dövlət Dəniz Akademiyası",
        "qualification": "Gəmiqayırma və gəmi təmiri",
        "sortYear": 2018
      },
      {
        "period": "1982–1990",
        "institution": "Nijni Novqorod Su Nəqliyyatı Mühəndisləri İnstitutu",
        "qualification": "Mühəndis-gəmisürən, Gəmisürücüsü",
        "sortYear": 1982
      }
    ],
    "career": [
      {
        "period": "2020–indiyədək",
        "organization": "Azərbaycan Dövlət Dəniz Akademiyası, «Dəniz naviqasiyası» kafedrası",
        "position": "Kafedra müdiri",
        "sortYear": 2020
      },
      {
        "period": "2016–2020",
        "organization": "Caspian Marine Services Ltd",
        "position": "Marine Superintendent",
        "sortYear": 2016
      },
      {
        "period": "2011–2016",
        "organization": "Caspian Marine Services Ltd",
        "position": "Gəmi üzrə nəzarətçi",
        "sortYear": 2011
      },
      {
        "period": "2010",
        "organization": "Caspian Marine Services Ltd / Momentum",
        "position": "«İ. Hüseynov» borudüzən gəmisində kapitan",
        "sortYear": 2010
      },
      {
        "period": "2009–2010",
        "organization": "Xəzər Dəniz Neft Donanması",
        "position": "Müxtəlif gəmilərdə kapitan",
        "sortYear": 2009
      },
      {
        "period": "2008",
        "organization": "Albros gəmiçilik şirkəti",
        "position": "Gəmi tikintisinə texniki nəzarətçi",
        "sortYear": 2008
      },
      {
        "period": "1999–2008",
        "organization": "Caspian Geophysical - WesternGeco",
        "position": "Müxtəlif gəmilərdə kapitan",
        "sortYear": 1999
      },
      {
        "period": "1996–1999",
        "organization": "BP Şahdəniz (Shelf-5 layihəsi) / BP-Amoco Bakı ofisi",
        "position": "Dəniz işləri üzrə koordinator, təchizatçı",
        "sortYear": 1996
      },
      {
        "period": "1990–1996",
        "organization": "Xəzər Dəniz Neft Donanması",
        "position": "Kapitanın 3-cü, 2-ci, baş köməkçisi, kapitan",
        "sortYear": 1990
      }
    ],
    "highlights": [
      "Uzaq səfərlər kapitanı və dəniz əməliyyatları üzrə 30 ildən artıq beynəlxalq sənaye təcrübəsi"
    ],
    "awards": [],
    "languages": [
      {
        "lang": "az"
      },
      {
        "lang": "ru",
        "level": "sərbəst"
      },
      {
        "lang": "en",
        "level": "sərbəst"
      }
    ],
    "email": "hazi.nabiyev@asco.az",
    "phone": "(012) 464 15 31",
    "birthDate": "1965-03-05"
  },
  {
    "fullName": "Xankişiyev İsaq Abuzər oğlu",
    "position": "Kafedra müdiri",
    "department": "«Gəmiqayırma və gəmi təmiri» kafedrası",
    "degree": "Texnika elmləri üzrə fəlsəfə doktoru",
    "degreeYear": 2019,
    "title": "Dosent",
    "titleYear": 2021,
    "education": [
      {
        "period": "2013–2017",
        "institution": "Azərbaycan Dövlət Dəniz Akademiyası (Doktorantura)",
        "qualification": "Gəmiqayırma və gəmi təmiri texnologiyası",
        "sortYear": 2013
      },
      {
        "period": "2007–2009",
        "institution": "Azərbaycan Dövlət Dəniz Akademiyası (Magistr)",
        "qualification": "Gəmiqayırma və dəniz texnikası",
        "sortYear": 2007
      },
      {
        "period": "2001–2005",
        "institution": "Azərbaycan Dövlət Dəniz Akademiyası (Bakalavr)",
        "qualification": "Gəmiqayırma və gəmi təmiri",
        "sortYear": 2001
      }
    ],
    "career": [
      {
        "period": "2018–indiyədək",
        "organization": "Azərbaycan Dövlət Dəniz Akademiyası, «Gəmiqayırma və gəmi təmiri» kafedrası",
        "position": "Kafedra müdiri, dosent",
        "sortYear": 2018
      },
      {
        "period": "2018",
        "organization": "Azərbaycan Dövlət Dəniz Akademiyası",
        "position": "Tədris qeydiyyat şöbəsinin müdiri",
        "sortYear": 2018
      },
      {
        "period": "2017–2018",
        "organization": "Azərbaycan Dövlət Dəniz Akademiyası, «Gəmi mexanikası» fakültəsi",
        "position": "Dekan müavini",
        "sortYear": 2017
      },
      {
        "period": "2016–2017",
        "organization": "Azərbaycan Dövlət Dəniz Akademiyası, «Gəmiqayırma və gəmi təmiri» kafedrası",
        "position": "Baş müəllim",
        "sortYear": 2016
      },
      {
        "period": "2012–2016",
        "organization": "Azərbaycan Dövlət Dəniz Akademiyası, «Gəmiqayırma və gəmi təmiri» kafedrası",
        "position": "Assistent",
        "sortYear": 2012
      },
      {
        "period": "2010–2012",
        "organization": "Azərbaycan Dövlət Dəniz Akademiyası, «Gəmiqayırma və gəmi təmiri» kafedrası",
        "position": "Laboratoriya müdiri",
        "sortYear": 2010
      },
      {
        "period": "2007–2009",
        "organization": "Azərbaycan Dövlət Dəniz Akademiyası, «Gəmi elektrik avadanlığı» kafedrası",
        "position": "Laborant",
        "sortYear": 2007
      }
    ],
    "highlights": [
      "56 elmi və metodiki işin müəllifi: 22 elmi məqalə (6-sı xarici jurnallarda), 11 beynəlxalq konfrans materialı, 16 fənn proqramı, 2 dərslik, 2 dərs vəsaiti, 3 metodik göstəriş",
      "ADDA Elmi Şurasının üzvü",
      "Mühəndislik proqramları: AutoCAD, SeaSolution"
    ],
    "awards": [
      "«AXDG» QSC sədrinin sərəncamı ilə ADDA-da «İlin ən yaxşı müəllimi» mükafatı (2018)"
    ],
    "languages": [
      {
        "lang": "az"
      },
      {
        "lang": "tr",
        "level": "yaxşı"
      },
      {
        "lang": "ru"
      },
      {
        "lang": "en"
      }
    ],
    "email": "isaq.xankishiyev@asco.az",
    "birthDate": "1984-01-30"
  },
  {
    "fullName": "Sultanov Elşən Fəxrəddin oğlu",
    "position": "Kafedra müdiri",
    "department": "«Gəmi elektrik avadanlığı» kafedrası",
    "degree": "Texnika üzrə fəlsəfə doktoru",
    "degreeYear": 2013,
    "title": "Dosent",
    "titleYear": 2016,
    "education": [
      {
        "period": "2009–2012",
        "institution": "Azərbaycan Dövlət Dəniz Akademiyası (Doktorantura)",
        "qualification": "Texnika üzrə fəlsəfə doktoru",
        "sortYear": 2009
      },
      {
        "period": "2004–2006",
        "institution": "Azərbaycan Dövlət Dəniz Akademiyası (Magistr)",
        "qualification": "Gəmilərin elektrik avadanlığı və avtomatikası",
        "sortYear": 2004
      },
      {
        "period": "2000–2004",
        "institution": "Azərbaycan Dövlət Dəniz Akademiyası (Bakalavr)",
        "qualification": "Gəmilərin elektrik avadanlığı və avtomatikası",
        "sortYear": 2000
      }
    ],
    "career": [
      {
        "period": "2007–indiyədək",
        "organization": "Azərbaycan Dövlət Dəniz Akademiyası, «Gəmi elektrik avadanlığı» kafedrası",
        "position": "İstehsalat təlimi üzrə usta, laboratoriya müdiri, assistent, baş müəllim, kafedra müdiri, dekan, kafedra müdiri",
        "sortYear": 2007
      }
    ],
    "highlights": [],
    "awards": [
      "Azərbaycan Respublikası Prezidentinin 20.10.2018-ci il tarixli Sərəncamı ilə «Tərəqqi» medalı"
    ],
    "languages": [
      {
        "lang": "az"
      },
      {
        "lang": "tr",
        "level": "sərbəst"
      },
      {
        "lang": "ru",
        "level": "yaxşı"
      },
      {
        "lang": "en",
        "level": "yaxşı"
      }
    ],
    "email": "elshan.sultanov@asco.az",
    "phone": "(012) 537 19 83",
    "birthDate": "1983-09-10"
  },
  {
    "fullName": "İsmayılov Akif Şəmil oğlu",
    "position": "Kafedra müdiri",
    "department": "«Gəmi energetik qurğuları» kafedrası",
    "degree": "Texnika elmləri namizədi",
    "degreeYear": 1990,
    "title": "Dosent",
    "titleYear": 1993,
    "education": [
      {
        "period": "1972–1976",
        "institution": "N.E.Bauman adına Moskva Ali Texniki Məktəbi",
        "qualification": "Daxili yanma mühərrikləri, Mühəndis-mexanik",
        "sortYear": 1972
      },
      {
        "period": "1969–1972",
        "institution": "Azərbaycan Politexnik İnstitutu",
        "qualification": "Daxili yanma mühərrikləri",
        "sortYear": 1969
      }
    ],
    "career": [
      {
        "period": "2016–indiyədək",
        "organization": "Azərbaycan Dövlət Dəniz Akademiyası",
        "position": "Kafedra müdiri",
        "sortYear": 2016
      },
      {
        "period": "1997–2012",
        "organization": "Azərbaycan Dövlət Dəniz Akademiyası (əvəzçiliklə)",
        "position": "Dosent",
        "sortYear": 1997
      },
      {
        "period": "2006–2015",
        "organization": "«Unisel» MMC, «Katel» MMC, «NP Systems» MMC",
        "position": "Baş direktorun müavini, departament rəisi, vitse-prezident",
        "sortYear": 2006
      },
      {
        "period": "1984–2015",
        "organization": "Azərbaycan Texniki Universiteti",
        "position": "Assistent, baş müəllim, dosent, magistratura şöbəsinin müdiri, kafedra müdiri",
        "sortYear": 1984
      },
      {
        "period": "1981–1983",
        "organization": "Azərbaycan Politexnik İnstitutu",
        "position": "Aspirant",
        "sortYear": 1981
      },
      {
        "period": "1976–1981",
        "organization": "Bakı Mexaniki Ekskavator Təmiri Zavodu",
        "position": "Mühəndis-texnoloq, sex rəisi, aparıcı mühəndis",
        "sortYear": 1976
      }
    ],
    "highlights": [
      "Moskva Kimya Maşınqayırması İnstitutunda «Aşağı temperaturların texnikası və fizikası» üzrə ixtisasartırma (1988)"
    ],
    "awards": [],
    "languages": [
      {
        "lang": "az"
      },
      {
        "lang": "ru",
        "level": "sərbəst"
      },
      {
        "lang": "fr"
      }
    ],
    "email": "akif.ismayilov@asco.az",
    "birthDate": "1952-01-27"
  },
  {
    "fullName": "Alıyeva Gülçöhrə Babaəli qızı",
    "position": "Kafedra müdiri",
    "department": "«İngilis dili» kafedrası",
    "degree": "Filologiya üzrə fəlsəfə doktoru",
    "degreeYear": 2001,
    "title": "Dosent",
    "titleYear": 2004,
    "education": [
      {
        "period": "1978–1983",
        "institution": "Azərbaycan Pedaqoji Xarici Dillər İnstitutu",
        "qualification": "İngilis dili müəllimi",
        "sortYear": 1978
      }
    ],
    "career": [
      {
        "period": "2020–indiyədək",
        "organization": "Azərbaycan Dövlət Dəniz Akademiyası, «İngilis dili» kafedrası",
        "position": "Kafedra müdiri",
        "sortYear": 2020
      },
      {
        "period": "2016–2019",
        "organization": "Azərbaycan Dövlət Pedaqoji Universiteti, «İngilis dili» kafedrası",
        "position": "Kafedra müdiri",
        "sortYear": 2016
      },
      {
        "period": "2008–2016",
        "organization": "Azərbaycan Dövlət Pedaqoji Universiteti, «Xarici dillər» kafedrası",
        "position": "Kafedra müdiri",
        "sortYear": 2008
      },
      {
        "period": "2003–2008",
        "organization": "Azərbaycan Dövlət Dəniz Akademiyası, «Dillər» kafedrası",
        "position": "Dosent",
        "sortYear": 2003
      },
      {
        "period": "1997–2003",
        "organization": "Azərbaycan Dövlət Dəniz Akademiyası, «Dillər» kafedrası",
        "position": "Assistent",
        "sortYear": 1997
      },
      {
        "period": "1994–1996",
        "organization": "Q.Məmmədov adına Bakı Dəniz Yolları Məktəbi",
        "position": "İngilis dili müəllimi",
        "sortYear": 1994
      }
    ],
    "highlights": [],
    "awards": [
      "«Qabaqcıl təhsil işçisi» döş nişanı"
    ],
    "languages": [
      {
        "lang": "az",
        "level": "sərbəst"
      },
      {
        "lang": "en",
        "level": "sərbəst"
      },
      {
        "lang": "ru",
        "level": "sərbəst"
      }
    ],
    "email": "gulchohra.aliyeva@asco.az",
    "phone": "(012) 493 36 44",
    "birthDate": "1959-10-13"
  },
  {
    "fullName": "Abdullayev İlqar Ağamməd oğlu",
    "position": "Kafedra müdiri",
    "department": "«Humanitar fənlər» kafedrası",
    "degree": "Fəlsəfə elmləri namizədi",
    "degreeYear": 1998,
    "title": "Dosent",
    "titleYear": 2016,
    "education": [
      {
        "period": "1984–1992",
        "institution": "M.F.Axundov adına Azərbaycan Pedaqoji Rus Dili və Ədəbiyyatı İnstitutu",
        "qualification": "Rus dili və ədəbiyyatı müəllimi",
        "sortYear": 1984
      }
    ],
    "career": [
      {
        "period": "2011–indiyədək",
        "organization": "Azərbaycan Dövlət Dəniz Akademiyası",
        "position": "Kafedra müdiri, dosent",
        "sortYear": 2011
      },
      {
        "period": "2009–2011",
        "organization": "Azərbaycan Respublikası Fövqəladə Hallar Nazirliyi",
        "position": "Böyük metodist",
        "sortYear": 2009
      },
      {
        "period": "1994–2009",
        "organization": "Azərbaycan Texniki Universiteti, «Fəlsəfə və politologiya» kafedrası",
        "position": "Laborant, böyük laborant, müəllim, baş müəllim",
        "sortYear": 1994
      },
      {
        "period": "1992–1994",
        "organization": "Bağırlı kənd orta məktəbi",
        "position": "Müəllim",
        "sortYear": 1992
      }
    ],
    "highlights": [
      "Bakı Beynəlxalq Multikulturalizm Mərkəzi: «Multikulturalizmə giriş» və «Azərbaycan multikulturalizmi» sertifikat proqramı (2015)"
    ],
    "awards": [],
    "languages": [
      {
        "lang": "az"
      },
      {
        "lang": "ru",
        "level": "sərbəst"
      },
      {
        "lang": "tr",
        "level": "yaxşı"
      }
    ],
    "email": "ilqar.abdullayev@asco.az",
    "birthDate": "1966-08-01"
  }
];
