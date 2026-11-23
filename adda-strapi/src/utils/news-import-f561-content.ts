/**
 * F5.61 — köhnə saytın (adda.edu.az) 15.10–23.11.2026 xəbərləri (news/1991–2004).
 * AVTOMATİK YARADILIB — ƏL İLƏ DƏYİŞDİRMƏ: tools/migration/f561-news.mjs
 * (mənbə tools/migration/data/f561-oldsite.json, redaktələr orada sadalanıb).
 *
 * Seed: src/utils/news-import.ts (`newsImport:v2`). Şəkillər köhnə saytın media
 * ünvanındadır (tam ünvan) — seed endirib media kitabxanasına yükləyir. Köhnə URL-lər
 * adda-nextjs/lib/legacy-redirects.ts-dədir (gen-redirects.mjs → IMPORTED).
 */
import type { ImportArticle } from './news-import-content';

export const IMPORT_ARTICLES_F561: ImportArticle[] = [
  {
    "legacy": "news/1991",
    "slug": "18-oktyabr-musteqilliyin-berpasi-gunudur",
    "title": "18 Oktyabr – Müstəqilliyin Bərpası Günüdür",
    "date": "2026-10-18T13:00:00+04:00",
    "hero": "https://adda-media.pages.dev/uploads/news/1792314040_18_Oktyabr.png",
    "gallery": [],
    "body": "Bu gün Azərbaycan Respublikasının dövlət müstəqilliyinin bərpa edilməsindən 35 il ötür.\n\n1991-ci il oktyabrın 18-də dövlət müstəqilliyimizin bərpası Azərbaycanın tarixində mühüm hadisə olmaqla, xalqımızın azadlıq iradəsinin və milli dövlətçilik əzminin təcəssümüdür. Azərbaycan Dövlət Dəniz Akademiyası xalqımızı 18 Oktyabr – Müstəqilliyin Bərpası Günü münasibətilə təbrik edir.\n\nBu əlamətdar gün münasibətilə Azərbaycan xalqına sülh, əmin-amanlıq və davamlı tərəqqi arzulayırıq.\n\n**Müstəqilliyimiz əbədi olsun!**"
  },
  {
    "legacy": "news/1992",
    "slug": "adda-ya-yuksek-balla-qebul-olmus-telebelerle-asco-da-gorus-kecirilib",
    "title": "ADDA-ya yüksək balla qəbul olmuş tələbələrlə ASCO-da görüş keçirilib",
    "date": "2026-10-22T12:21:00+04:00",
    "hero": "https://adda-media.pages.dev/uploads/news/1792657266_M.jpg",
    "gallery": [
      "https://adda-media.pages.dev/uploads/news/news_in/3d75f4276bec40f8dc8359cd7514ea19.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/abc39c0dc17eb75cfd68fac982172433.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/7225489d2941b5bfae455481af94aa5f.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/39c8cd6c88d711c875e1c47721e21c9d.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/301384d15880f0f34b64a905940d5503.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/30e7884496dc04526c34eb4560a054ef.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/d0317aac4493da739232dab17b7a936b.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/ccbf8d47720722ccaaba10a51a03678e.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/12c5b62b03a7d63e90600d0efd8b7635.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/ac5e042b2d77af38ea3f0158d2374831.jpeg",
      "https://adda-media.pages.dev/uploads/news/news_in/e8d4ca25afe1ebe899cf5a05b3e2a95e.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/a4b21f630156e0888f4146147fd254dd.jpeg",
      "https://adda-media.pages.dev/uploads/news/news_in/d2ace1a8861350352a4ff62fb44b4f27.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/c0e123d28abfd0353b8f6fc5e0144e7d.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/0cfea3f3861e680736fb08f0f118ef87.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/5a4409baa1a6897df308c131eaebc873.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/42ac74bbd76adedcc700e26c33e71f64.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/2801109280ea34640e15a006ddedf0ef.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/1c9d5e010e4610534baa9385670679a1.png",
      "https://adda-media.pages.dev/uploads/news/news_in/32708fa9f052a51e3faf1fdb2a064198.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/4dbb0d6b23cfd2c1e4a2bb54a06253ab.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/69cf9f70f6f598635e6a31623b7852da.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/5d3bf044bd2d46fcf9304be80f0bb654.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/7b4a0c45aba6a4447ba4a57739b6efa6.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/5ce8e398bb80792ddbf2c5237056aa54.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/56f2a366390b64cdb7c3eb9b071b2d60.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/f1d8607b69145c0b27b37e9234b01994.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/22f639dfd7d2d1572a3b66e44f6829d0.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/8ccb27152e910d6facf1d65a3a44bba4.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/4dfe545c24d9afc080b88329874eb4e8.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/20b2145b7c55ea27f199b8e67b6d3ae2.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/8ce4f8dc2af07072ef8872f64b1abbd8.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/b8fc993118b3ca804583c9805c2f0565.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/8916f7d93ab94df845e62ea07181f400.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/7749ce026f78f2ba969cb2f834d411f9.jpg"
    ],
    "body": "2026/2027-ci tədris ilində 500-600 bal toplayaraq Azərbaycan Dövlət Dəniz Akademiyasına (ADDA) qəbul olmuş 20 nəfər tələbə ilə “Azərbaycan Xəzər Dəniz Gəmiçiliyi” QSC-də (ASCO) görüş təşkil edilib.\n\nTədbirdə tələbələrə Azərbaycanda gəmiçiliyin tarixi, ASCO-nun fəaliyyət istiqamətləri, donanmanın daha da müasirləşdirilməsi və əməliyyatların səmərəliliyinin artırılması istiqamətində strateji hədəfləri barədə ətraflı məlumat verilib.\n\nÇıxışlarda insan kapitalının inkişafının ASCO-nun əsas prioritetlərindən biri olduğu vurğulanıb. Bu çərçivədə regionun aparıcı dənizçilik ali təhsil müəssisələrindən olan ADDA-da tələbələrin keyfiyyətli təhsil alması, nəzəri biliklərini praktiki bacarıqlarla möhkəmləndirməsi və peşəkar mütəxəssislər kimi yetişməsi üçün yaradılan şəraitin bundan sonra da diqqətdə saxlanılacağı bildirilib.\n\nGörüşdə iştirak edən tələbələr dənizçilik peşəsini seçmələrinin səbəbləri və gələcək hədəflərindən danışıblar. Onlar Akademiyada mövcud olan peşəkar tədris mühitinə, imkan və güzəştlərə, təhsillərinə və inkişaflarına göstərilən diqqətə görə ASCO rəhbərliyinə təşəkkür ediblər.\n\nTədbirdə, həmçinin ASCO-nun gəmi heyəti üzvləri çıxış edərək dənizçilik peşəsinin spesifik tərəfləri və Xəzərin naviqasiya xüsusiyyətlərindən danışıblar. Mütəxəssislər öz təcrübələrini bölüşərək əzmkarlığın və davamlı öyrənməyin gəmiçilik sahəsində mühüm rol oynadığını diqqətə çatdırıblar.\n\nTədbir “Açıq mikrofon” formatında sual-cavab sessiyası ilə davam edib. ASCO-da karyera imkanları, işə qəbul prosesi və şirkətin fəaliyyət istiqamətləri ilə bağlı tələbələri maraqlandıran suallar cavablandırılıb.\n\nGörüşdə tələbələrə ASCO adından hədiyyələr təqdim olunub.\n\nProqram çərçivəsində gənclər “Suraxanı” gəmi-muzeyi ilə də tanış olaraq Azərbaycanın dənizçilik tarixi və ənənələri haqqında məlumat əldə ediblər."
  },
  {
    "legacy": "news/1993",
    "slug": "adda-telebeleri-ginius-telebe-kuboku-2026-intellektual-yarisinda-istirak-edibler",
    "title": "ADDA tələbələri “GİNius – Tələbə Kuboku 2026” intellektual yarışında iştirak ediblər",
    "date": "2026-10-22T15:37:00+04:00",
    "hero": "https://adda-media.pages.dev/uploads/news/1792669748_TELEBE_kubok_1.jpg",
    "gallery": [],
    "body": "Bakıda Gənclər və İdman Nazirliyinin dəstəyi ilə “GİNius – Tələbə Kuboku 2026” intellektual yarışı keçirilib.\n\nAzərbaycan Dövlət Dəniz Akademiyasını (ADDA) yarışda ali məktəbin fəal tələbələrindən formalaşdırılmış “Albatros” komandası təmsil edib.\n\nTələbələr müxtəlif istiqamətlər üzrə təqdim olunan sualları cavablandıraraq bilik, məntiq və analitik təfəkkürlərini, operativ qərarvermə və komanda şəklində fəaliyyət bacarıqlarını nümayiş etdiriblər.\n\nADDA tələbələrinin bu kimi intellektual layihələrdə iştirakı onların peşə hazırlığı ilə yanaşı, dünyagörüşünün, yaradıcı və analitik düşünmə qabiliyyətlərinin inkişafına xidmət edir."
  },
  {
    "legacy": "news/1994",
    "slug": "yeni-tedris-ilinde-elmi-suranin-ilk-iclasi",
    "title": "Yeni tədris ilində Elmi Şuranın ilk iclası",
    "date": "2026-10-23T17:13:00+04:00",
    "hero": "https://adda-media.pages.dev/uploads/news/1792762271_ESH5.jpg",
    "gallery": [
      "https://adda-media.pages.dev/uploads/news/news_in/d2750e7159c28204f6dd37781dabde8d.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/db61b5be62f1f900e078178caff34d08.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/f92ab1725fa5d933df32a328070fcaec.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/195f7aebc33954a334bd4fe79915048c.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/08c598e73e0766fce768cadbb510b65c.jpg"
    ],
    "body": "Oktyabrın 20-də “ADDA” PHŞ-nin Elmi Şurasının yeni tədris ilində ilk iclası keçirilib.\n\nİclasda 2026/2027-ci tədris ili üzrə qəbulun nəticələri müzakirə olunub. Növbəti tədris ili üçün tələbə qəbulu proqnozunun əmək bazarının tələblərinə uyğun hazırlanması, əcnəbi tələbələrin sayının artırılması və “Gəmiqayırma və gəmi təmiri mühəndisliyi” ixtisası üzrə ingiliscə tədris olunan bölmənin açılması ilə bağlı araşdırmaların aparılması tapşırılıb.\n\nHəmçinin Akademiyada Rəqəmsal Transformasiya Strategiyası və \"Elektron Akademiya\" sisteminin tətbiqi üzrə hazırlanan normativ-hüquqi, təşkilati və metodiki sənədlər paketi müzakirə edilib. Son dövrdə həyata keçirilən kadr dəyişiklikləri nəzərə alınaraq Rəqəmsallaşma strategiyasının hazırlanması üzrə İşçi qrupunun tərkibi yenidən təsdiqlənib və fəaliyyət müddəti uzadılıb.\n\nElmi Şurada Akademiyada açılması planlaşdırılan yeni ixtisaslar - “Beynəlxalq ticarət və logistika”, “Menecment” (Su nəqliyyatı üzrə), “Ekologiya” (Su hövzələri üzrə) və “Dizayn” (Su nəqliyyatı üzrə) ixtisasları üzrə aparılan hazırlıq işləri də müzakirə olunub. Tədris-metodiki məsələlər çərçivəsində professor-müəllim heyətinin hazırladıqları yeni dərs vəsaitləri çapa tövsiyə edilib və Akademiyanın “Elmi əsərlər” jurnalının adı dəyişdirilərək “Xəzər Dəniz Elmləri və Mühəndisliyi Jurnalı” kimi təsdiq edilib.\n\nMüzakirələrin yekununda tələbələrin dərsə davamiyyət limitinin tənzimlənməsi məsələsinə baxılıb. Elmi Şuranın əvvəlki qərarları ilə müəyyən edilmiş 15%-lik davamiyyət məhdudiyyəti ləğv edilərək Azərbaycan Respublikası Nazirlər Kabinetinin 348 nömrəli Qərarına uyğunlaşdırılıb. Qərara əsasən, 2026/2027-ci tədris ilinin yaz semestrindən etibarən təhsilin bütün pillələrində fənnə ayrılmış auditoriya saatlarının 25%-dən çoxunda iştirak etməyən tələbələrin imtahana buraxılmaması qaydasının tətbiq edilməsi və bu barədə müvafiq tənzimləmə işlərinin aparılması qərara alınıb."
  },
  {
    "legacy": "news/1995",
    "slug": "adda-emekdaslari-vii-umumdunya-medeniyyetlerarasi-dialoq-forumunda",
    "title": "ADDA əməkdaşları VII Ümumdünya Mədəniyyətlərarası Dialoq Forumunda",
    "date": "2026-10-30T10:29:00+04:00",
    "hero": "https://adda-media.pages.dev/uploads/news/1793364924_manshet_4.jpg",
    "gallery": [
      "https://adda-media.pages.dev/uploads/news/news_in/76eec95166ad7ba5300d7ac88c330d43.jpeg",
      "https://adda-media.pages.dev/uploads/news/news_in/f31c411c107f5e43ca77c90f9dd11f69.jpeg",
      "https://adda-media.pages.dev/uploads/news/news_in/0b7c47a870d26194bdc73ea8a500ed6c.jpeg"
    ],
    "body": "27–28 oktyabr 2026-cı il tarixlərində Bakıda keçirilən VII Ümumdünya Mədəniyyətlərarası Dialoq Forumunda Azərbaycan Dövlət Dəniz Akademiyasının (ADDA) əməkdaşları da iştirak ediblər.\n\n“Ortaq gələcək naminə dialoq: parçalanmış dünyada körpülər qurmaq” mövzusuna həsr olunan Forum müxtəlif ölkələrin nümayəndələrini, beynəlxalq təşkilatların təmsilçilərini, alimləri və mütəxəssisləri bir araya gətirərək mədəniyyətlərarası və dinlərarası dialoqun inkişafı, qarşılıqlı anlaşmanın gücləndirilməsi və beynəlxalq əməkdaşlığın genişləndirilməsi məsələlərinin müzakirəsi üçün mühüm platforma rolunu oynayır. Forum Azərbaycan Respublikasının Mədəniyyət Nazirliyi, UNESCO, BMT-nin Sivilizasiyalar Alyansı (UNAOC), İslam Dünyası Təhsil, Elm və Mədəniyyət Təşkilatı (ICESCO) və BMT-nin Ümumdünya Turizm Təşkilatının tərəfdaşlığı ilə keçirilir.\n\nForum çərçivəsində Azərbaycan Milli Elmlər Akademiyasının Rəyasət Heyətinin binasında və ADA Universitetində təşkil olunan sessiyalara ADDA əməkdaşları Gülçöhrə Alıyeva, Nəsir Hüseynov, Bəbir Quliyev, İlqar Abdullayev, Natalya Fatyanova, Zaur Əziz, Samirə Gözəlova və Əlihüseyn Həziyev də qoşulublar.\n\nForumda iştirak ADDA əməkdaşlarının beynəlxalq elmi və ictimai platformalarda təmsil olunması, müxtəlif mədəniyyətlər arasında qarşılıqlı anlaşma və əməkdaşlıq prinsiplərinin təşviqi baxımından əhəmiyyət daşıyır. Belə tədbirlər ali təhsil müəssisələrinin beynəlxalq əməkdaşlıq imkanlarının genişləndirilməsinə, qlobal məsələlərə dair fikir mübadiləsinin aparılmasına və akademik mühitdə dialoq mədəniyyətinin təşviqinə töhfə verir."
  },
  {
    "legacy": "news/1996",
    "slug": "nasco29-konfransinda-denizcilik-uzre-uc-elmi-tedqiqat-teqdim-edilib",
    "title": "NASCO29 konfransında dənizçilik üzrə üç elmi tədqiqat təqdim edilib",
    "date": "2026-11-02T15:15:00+04:00",
    "hero": "https://adda-media.pages.dev/uploads/news/1793618157_Manshet.jpeg",
    "gallery": [
      "https://adda-media.pages.dev/uploads/news/news_in/9b354c329f57b085154dd29c4d12d590.jpeg",
      "https://adda-media.pages.dev/uploads/news/news_in/8825e26267f617f926ed907696bff86b.jpeg",
      "https://adda-media.pages.dev/uploads/news/news_in/a2039fcaed942349cd0306af6bf696e0.jpeg",
      "https://adda-media.pages.dev/uploads/news/news_in/1bc0ef96c4a03befdaa3335ed46e6a90.jpeg"
    ],
    "body": "ASCO-nun Dəniz üzgüçülüyünün təhlükəsizliyi departamentinin Qəza dəyanətliliyi üzrə sahil xidməti qrupunun rəhbəri, eyni zamanda Azərbaycan Dövlət Dəniz Akademiyasının (ADDA) magistrantı Fərman Nağıyev və ADDA-nın “Gəmi sürücülüyü” fakültəsinin dekanı texnika üzrə fəlsəfə doktoru, dosent Elnur Abbasov Naxçıvan Dövlət Universitetində keçirilən Doktorantların və Gənc Tədqiqatçıların 29-cu Respublika Elmi Konfransında (NASCO29) iştirak ediblər.\n\nKonfransın “Mühəndislik elmləri” bölməsində Fərman Nağıyev “İnteqrasiya olunmuş naviqasiya və DP sistemlərində kiber təhlükəsizlik riskləri” mövzusunda elmi məruzə ilə çıxış edib. Tədqiqat işi Fərman Nağıyev, Elnur Abbasov və Akademiyanın doktorantı Eldar Temirbulatov tərəfindən birgə hazırlanıb.\n\nKonfrans çərçivəsində ADDA-nın magistrantı Aytac Rüstəmli və “Gəmi sürücülüyü” fakültəsinin dekanı Elnur Abbasovun həmmüəllifi olduqları “«Qurban Abasov» gəmisində DP avtomatlaşdırma səviyyəsinin kapitanın növbə köməkçisinin qərar verməsinə təsiri” mövzusunda elmi məruzə də təqdim olunub.\n\nBundan əlavə, ADDA-nın doktorantı Kənan Hüseynov konfransa onlayn qoşularaq “Gəmi elektroenergetik sistemlərində enerji saxlama texnologiyalarının tətbiqi” mövzusunda məruzə ilə çıxış edib.\n\nTəqdim olunan elmi işlər aktuallığı və praktiki əhəmiyyəti baxımından yüksək qiymətləndirilib.\n\n30–31 oktyabr tarixlərində keçirilən konfrans Elm və Təhsil Nazirliyi, Elm və Ali Təhsil üzrə Dövlət Agentliyi və Naxçıvan Dövlət Universitetinin təşkilatçılığı ilə baş tutub."
  },
  {
    "legacy": "news/1997",
    "slug": "adda-nin-telebeleri-startup-school-4-beynelxalq-innovasiya-proqraminda",
    "title": "ADDA-nın tələbələri “Startup School 4” beynəlxalq innovasiya proqramında",
    "date": "2026-11-02T16:38:00+04:00",
    "hero": "https://adda-media.pages.dev/uploads/news/1793623103_manshet.jpeg",
    "gallery": [
      "https://adda-media.pages.dev/uploads/news/news_in/dc4dcb53b9830b1ee2dedc879b015ab9.jpeg",
      "https://adda-media.pages.dev/uploads/news/news_in/81d6ab1d0c4eb358c7129a20e499391e.jpeg",
      "https://adda-media.pages.dev/uploads/news/news_in/8d3ab2ebe2508f02086e21c1ea0b074f.jpeg"
    ],
    "body": "31 oktyabr 2026-cı il tarixində Bakıda İqtisadi İslahatların Təhlili və Kommunikasiya Mərkəzinin “Enterprise Azerbaijan” portalının təşkilatçılığı ilə həyata keçirilən “Startup School 4: Five Continents – 500 Startups” qlobal innovasiya proqramının yekun mərhələsi – “Demo Day” tədbiri keçirilib.\n\n“TEI Forum 2026” çərçivəsində “Sabah.City” innovasiya məkanında təşkil olunan tədbirdə Azərbaycan Dövlət Dəniz Akademiyasının (ADDA) nümayəndə heyəti, eləcə də beynəlxalq proqramda iştirak etmiş tələbə startap komandalarının nümayəndələri iştirak ediblər.\n\nBeş qitəni əhatə edən proqram çərçivəsində müxtəlif ölkələrdən seçilmiş 233 startap komandası beynəlxalq ekspert və mentorların iştirakı ilə üç ay davam edən təlim və mentorluq proqramına cəlb olunub. Təlim mərhələsinin yekununda 70 startap komandası finala yüksələrək innovativ layihələrini və minimum işlək məhsullarını investorlar, sahibkarlar və innovasiya ekosisteminin nümayəndələri qarşısında təqdim etmək imkanı qazanıb.\n\nADDA-nın 5 tələbəsinin müəllifi olduğu 4 innovativ layihə də “Startup School 4” proqramının seçim mərhələsini uğurla keçərək beynəlxalq təlimlərdə iştirak edib.\n\nProqram müddətində ADDA tələbələri innovativ ideyaların inkişaf etdirilməsi, biznes modellərinin formalaşdırılması, rəqəmsal texnologiyalar, layihələrin kommersiyalaşdırılması, investisiyaya hazırlıq və startapların beynəlxalq bazarlara çıxış imkanları istiqamətində bilik və praktiki bacarıqlar əldə ediblər.\n\nAkademiya tələbələrinin belə beynəlxalq proqramlarda iştirakı onların innovativ düşüncə, texnoloji sahibkarlıq və layihə idarəetməsi bacarıqlarının inkişafına, eləcə də ADDA-da innovasiya və startap mühitinin gücləndirilməsinə xidmət edir."
  },
  {
    "legacy": "news/1998",
    "slug": "8-noyabr-zefer-gunune-hesr-olunmus-zefer-tariximiz-qurur-menbeyimiz-adli-tedbir",
    "title": "8 Noyabr – Zəfər Gününə həsr olunmuş “Zəfər tariximiz, qürur mənbəyimiz” adlı tədbir keçirilib",
    "date": "2026-11-04T13:11:00+04:00",
    "hero": "https://adda-media.pages.dev/uploads/news/1793783498_570.jpg",
    "gallery": [
      "https://adda-media.pages.dev/uploads/news/news_in/a00324b6d4700acfcfd7ea544b743bae.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/e60a5249dab782387836f26c25aa0504.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/fa45844e2ec2d7400283095c0a54aea7.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/9c8a7b383fcdfee6c00400b392d75bd1.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/bd34135b2f4a171ec09f2cfe49d11512.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/0d7f62a8b41a8d45909ccade555b7aa6.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/adba9c1f39a16f071bce9fafe5ec550b.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/1b8872700551730a901284c6f4f71348.jpg"
    ],
    "body": "Noyabrın 3-də Azərbaycan Dövlət Dəniz Akademiyasında Azərbaycan Respublikasının 8 Noyabr – Zəfər Gününə həsr olunmuş “Zəfər tariximiz, qürur mənbəyimiz” adlı tədbir təşkil edilib. Professor-müəllim heyəti və çoxsaylı tələbələrin iştirak etdiyi tədbir Akademiyanın Tələbə Həmkarlar İttifaqı Komitəsinin təşəbbüs və təşkilatçılığı ilə keçirilib.\n\nTədbirin əsas məqsədi tələbə gənclər arasında vətənpərvərlik ruhunun gücləndirilməsi, 44 günlük Vətən müharibəsində qazanılmış tarixi Zəfərin əhəmiyyətinin təbliği, şəhidlərimizin əziz xatirəsinin yad edilməsi və Vətən müdafiəçilərinin qəhrəmanlığına dərin ehtiramın ifadə olunmasıdır.\n\nTədbir şəhidlərimizin əziz xatirəsinin ehtiramla anılması ilə başlayıb. İştirakçılar Vətənin ərazi bütövlüyü və müstəqilliyi uğrunda canından keçmiş qəhrəman övladlarımızın xatirəsinə hörmətlərini bildirmiş, Vətən müharibəsi iştirakçılarına və qazilərimizə dərin minnətdarlıqlarını ifadə ediblər.\n\nTədbir çərçivəsində Azərbaycan xalqının qəhrəmanlığına, Vətən müharibəsinin tarixi hadisələrinə və ölkəmizin Zəfərə aparan yoluna həsr olunmuş “Hadrut, sən azadsan” adlı film nümayiş etdirilib. Film iştirakçılara Hadrutun azad edilməsi kimi mühüm qələbələrlə yazılan Zəfər yolunun qəhrəmanlıq səhifələrini xatırladıb.\n\nDaha sonra keçirilən fikir mübadiləsi zamanı tələbələr filmlə bağlı təəssüratlarını bölüşmüş, vətənpərvərlik, Vətənə sədaqət, milli həmrəylik və tarixi yaddaşın qorunmasının əhəmiyyəti ətrafında fikirlərini bildiriblər. Tələbələrin fəal iştirakı gənc nəslin Zəfər tarixinə dərin marağı və bu tarixi dəyərlərin davamçısı olmaq əzmini nümayiş etdirib.\n\nKeçirilən tədbir tələbə gənclər arasında vətənpərvərlik hisslərinin gücləndirilməsi, milli-mənəvi dəyərlərin aşılanması və Azərbaycanın qəhrəmanlıq tarixinin gənc nəsil tərəfindən daha dərindən mənimsənilməsi baxımından mühüm əhəmiyyət kəsb edir. Akademiya gələcəkdə də gənclərin vətənpərvər ruhda tərbiyə olunmasına xidmət edən bu kimi tədbirlərin davam etdirilməsini nəzərdə tutur."
  },
  {
    "legacy": "news/1999",
    "slug": "usaq-huquqlari-ayligi-diqqet-merkezinde",
    "title": "Uşaq Hüquqları Aylığı diqqət mərkəzində",
    "date": "2026-11-05T16:20:00+04:00",
    "hero": "https://adda-media.pages.dev/uploads/news/1793952657_Manshet_1.png",
    "gallery": [
      "https://adda-media.pages.dev/uploads/news/news_in/6f74023ff32396de1e5061a997be610f.png",
      "https://adda-media.pages.dev/uploads/news/news_in/218b74fe38618b2ee14a405b95d824a2.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/6d8955c81c547c44319f504b30005137.jpeg",
      "https://adda-media.pages.dev/uploads/news/news_in/81a8d1ed847dbcb44564afb6e7fcb876.jpeg"
    ],
    "body": "Noyabrın 4-də Azərbaycan Dövlət Dəniz Akademiyasında “Azərbaycan Respublikasında Uşaqların Hüquqlarının qorunması” mövzusunda “Dəyirmi masa” keçirilmişdir.\n\nTədbirdə “Humanitar fənlər” kafedrasının müdiri, dosent İlqar Abdullayev Uşaq hüququnun qorunmasının əhəmiyyətini vurğulamış, həmin kafedranın baş müəllimi, ixtisasca hüquqşünas Elbrus Həşimov “Azərbaycan Respublikasında Uşaqların Hüquqlarının qorunması” mövzusunda məruzə etmiş, “Gəmi sürücülüyü” fakültəsinin Gənclər Təşkilatının sədri Fərhad Abbasov Azərbaycanda Uşaq hüquqlarının qorunmasını şərtləndirən amillərə diqqət yetirmişdir.\n\nMüzakirələrdə qeyd olunmuşdur ki, BMT Baş Məclisinin 44-cü sessiyasında 20 noyabr 1989-cu il tarixində “Uşaq Hüquqları haqqında” Konvensiya qəbul edilmişdir. Azərbaycan Respublikası da BMT-nin “Uşaq hüquqları haqqında” Konvensiyasına qoşulmaqla uşaqların hüquqlarının təmin olunması sahəsində üzərinə bir sıra öhdəliklər götürmüşdür. Uşaq hüquqlarının müdafiəsi və təşviqi Azərbaycan Respublikasının İnsan Hüquqları üzrə Müvəkkilinin (Ombudsmanın) fəaliyyətində də önəmli yer tutur. Hər il olduğu kimi bu il də Azərbaycan Respublikasının Ombudsmanı tərəfindən “Uşaq Hüquqları haqqında” Konvensiyanın qəbul edilməsinin ildönümü ərəfəsində 20 oktyabr – 20 noyabr tarixləri ölkədə “Uşaq Hüquqları Aylığı” elan edilmişdir."
  },
  {
    "legacy": "news/2000",
    "slug": "bgz-de-tecrube-kecmis-adda-telebelerine-sertifikatlar-teqdim-olunub",
    "title": "BGZ-də təcrübə keçmiş ADDA tələbələrinə sertifikatlar təqdim olunub",
    "date": "2026-11-06T11:46:00+04:00",
    "hero": "https://adda-media.pages.dev/uploads/news/1793951160_Man.et.jpeg",
    "gallery": [
      "https://adda-media.pages.dev/uploads/news/news_in/a95eb3a0fee115bb02083a6fe8727b02.jpeg",
      "https://adda-media.pages.dev/uploads/news/news_in/558dfb3fc75a772082254e0e88a829e1.jpeg",
      "https://adda-media.pages.dev/uploads/news/news_in/f3c85b9e69abf4b1bcde8882f355b879.jpeg",
      "https://adda-media.pages.dev/uploads/news/news_in/ce622c5a7600301db56d9fadff33aad7.jpeg",
      "https://adda-media.pages.dev/uploads/news/news_in/479f8d0d2eff1456e5cadf695d19ef49.jpeg",
      "https://adda-media.pages.dev/uploads/news/news_in/6e40426d8279eafe0b831a507c0361fb.jpeg",
      "https://adda-media.pages.dev/uploads/news/news_in/aaf91e5817ced1e930cbbac43c9ebf2b.jpeg",
      "https://adda-media.pages.dev/uploads/news/news_in/83013b1b62670cfd6a899425f734bd2b.jpeg",
      "https://adda-media.pages.dev/uploads/news/news_in/020eb593acc1025586c157429dc3967b.jpeg",
      "https://adda-media.pages.dev/uploads/news/news_in/30073735fb52671a3c9f1c9e311d48f5.jpeg",
      "https://adda-media.pages.dev/uploads/news/news_in/77617bee9e2086d14db5669a028b53e2.jpeg",
      "https://adda-media.pages.dev/uploads/news/news_in/fbbe6158527f5b5dbccf22c28f41ceaa.jpeg",
      "https://adda-media.pages.dev/uploads/news/news_in/46927f4cab4ed17c8273c9d22d9235be.jpeg",
      "https://adda-media.pages.dev/uploads/news/news_in/a65dfba23d2c8f2b78125b3ca5fe3626.jpeg"
    ],
    "body": "Azərbaycan Dövlət Dəniz Akademiyasında (ADDA) Gəmiqayırma və gəmi təmiri mühəndisliyi ixtisası üzrə təhsil alan 30 tələbəyə “Bakı Gəmiqayırma Zavodu” MMC-də tədris təcrübəsini uğurla başa vurduqlarına görə sertifikatlar təqdim olunub.\n\nHəmin tələbələr I kursu bitirdikdən sonra, 2026-cı ilin iyul ayında zavodda dörd həftəlik tədris təcrübəsi keçib və proqramı müvəffəqiyyətlə tamamlayıblar.\n\nTədbirdə ADDA ilə Bakı Gəmiqayırma Zavodu arasında faydalı əməkdaşlıqdan və təcrübənin gələcək mühəndislərin peşə hazırlığında oynadığı vacib roldan bəhs edilib.\n\nTədbirin sonunda tədris təcrübəsini müvəffəqiyyətlə başa vurmuş tələbələrə sertifikatlar verilib."
  },
  {
    "legacy": "news/2001",
    "slug": "adda-da-zefer-gunune-hesr-olunmus-sahmat-yarisi-kecirilib",
    "title": "ADDA-da Zəfər Gününə həsr olunmuş şahmat yarışı keçirilib",
    "date": "2026-11-06T16:59:00+04:00",
    "hero": "https://adda-media.pages.dev/uploads/news/1793969979_3.jpg",
    "gallery": [
      "https://adda-media.pages.dev/uploads/news/news_in/cf835624ba2f11a545a682a55d53f247.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/7c2554522943c57bd686c5724a1f382b.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/e2fa39584c3b9195b8406d805063d790.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/518d065469d1e3ab2a3a2ee98a4d7704.jpg"
    ],
    "body": "ASCO-nun Azərbaycan Dövlət Dəniz Akademiyasında (ADDA) 8 Noyabr – Zəfər Gününə həsr olunmuş şahmat yarışı keçirilib.\n\n«Zəfər zəka ilə başlayır» devizi altında təşkil olunan turnirdə 42 tələbə iştirak edib. Yarış İsveçrə sistemi üzrə 7 turdan ibarət olub.\n\nGərgin və maraqlı keçən mübarizədə iştirakçılar intellektual potensialını, məntiqi təfəkkür və strateji düşünmə bacarıqlarını nümayiş etdiriblər.\n\nTurnirin yekun nəticələrinə əsasən, Ülvi Əlizadə bütün rəqiblərini üstələyərək qalib olub. 1-ci və 2-ci yerləri isə müvafiq olaraq Nihad Quliyev və Səid Ramazanlı bölüşüblər.\n\nQaliblər hədiyyə və diplomlarla təltif ediliblər."
  },
  {
    "legacy": "news/2002",
    "slug": "8-noyabr-zefer-gunu",
    "title": "8 Noyabr – Zəfər Günü",
    "date": "2026-11-07T23:20:00+04:00",
    "hero": "https://adda-media.pages.dev/uploads/news/1794162286_Shusha.jpg",
    "gallery": [],
    "body": "8 Noyabr – Zəfər Günü Azərbaycan xalqının qəhrəmanlığını, milli birliyini və Vətənə bağlılığını təcəssüm etdirən şanlı tarixdir. Bu əlamətdar gün münasibətilə xalqımızı təbrik edir, Vətən uğrunda canından keçən şəhidlərimizin əziz xatirəsini dərin ehtiramla yad edirik.\n\nZəfər Günümüz mübarək!"
  },
  {
    "legacy": "news/2003",
    "slug": "adda-da-zefer-gunune-hesr-olunmus-tedbir-kecirilib",
    "title": "ADDA-da Zəfər Gününə həsr olunmuş tədbir keçirilib",
    "date": "2026-11-08T14:00:00+04:00",
    "hero": "https://adda-media.pages.dev/uploads/news/1794162704_0.jpg",
    "gallery": [
      "https://adda-media.pages.dev/uploads/news/news_in/748698cd2a69db87a54d529624c47b20.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/86da53ea45fa4b3ceeaf783dff57a45c.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/e7d621bfacc335a0aa6398a1e23008b0.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/81214afdba998c23b3dcddf3817df1c0.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/c013273d029637ad3d4ecec62409aef1.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/45ec3a5a3c97e189bdf29674e7987f4b.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/f75a4306c23ea17cf261aca4000ecf48.jpg",
      "https://adda-media.pages.dev/uploads/news/news_in/62d2855bf0d1494572829561a9573b6b.jpg"
    ],
    "body": "ASCO-nun Azərbaycan Dövlət Dəniz Akademiyasında 8 Noyabr – Zəfər Gününə həsr olunmuş “Zəfər zəka və qürur mənbəyimizdir” mövzusunda Akademiyanın professor-müəllim heyəti, tələbələr, həmçinin müharibə iştirakçısı və qazi tələbələrinin iştirakı ilə tədbir keçirilib.\n\nAzərbaycan Respublikasının Dövlət Himninin səsləndirilməsi ilə başlanan tədbirdə ölkəmizin suverenliyi, müstəqilliyi və ərazi bütövlüyü uğrunda əbədiyyətə qovuşmuş bütün şəhidlərimizin müqəddəs xatirəsi bir dəqiqəlik sükutla yad edilib.\n\nTədbiri giriş sözü ilə açan Humanitar fənlər kafedrasının müdiri, dosent İlqar Abdullayev Zəfər Gününün tarixi mahiyyətindən, xalqımızın əldə etdiyi misilsiz Qələbənin əhəmiyyətindən danışıb.\n\nDaha sonra Tədris prosesinin təşkili şöbəsinin müdiri, dosent Əsədullah Süleymanov müəllim və tələbələri təbrik edərək Zəfər salnaməmizi yaşadan bu cür tədbirlərin gənclərdə milli qürur və vətənpərvərlik ruhunun daha da möhkəmlənməsinə xidmət etdiyini vurğulayıb.\n\nTədbirdə Birinci və İkinci Qarabağ müharibələrinin iştirakçısı, müharibə veteranı, hüquq elmləri doktoru, professor, polkovnik Nəsir Hüseynov döyüş yolundan və Azərbaycan əsgərinin şücaətindən bəhs edib. O, gənclərə vətənpərvərlik çağırışları edərək ordumuzun qüdrətindən söz açıb.\n\nToplantıda dosent İlqar Abdullayev “Zəfər Gününün tarixi və mənəvi əhəmiyyəti” mövzusunda ətraflı məruzə ilə çıxış edib.\n\n“Gəmi elektroavtomatikası” kafedrasının müəllimi, Vətən müharibəsi iştirakçısı Ruslan Əlicanov, “Dəniz naviqasiyası mühəndisliyi” ixtisası üzrə V kurs tələbəsi, Vətən müharibəsi qazisi Cavid Məhərrəmli və həmin ixtisasın IV kurs tələbəsi, Vətən müharibəsi iştirakçısı Müşviq Qəhrəmanov çıxış edərək xatirələrini bölüşüb, qələbənin qürurunu yaşadıqlarını bildiriblər.\n\n“Gəmi sürücülüyü” fakültəsinin dekanı, dosent Elnur Abbasov çıxışında tarixi Qələbənin Azərbaycan gəncliyinin mənəvi formalaşmasındakı rolundan söhbət açıb. O, qazilərimizin və müharibə iştirakçısı olan gənclərin Akademiyada təhsil almasının bütün tələbələr üçün böyük fəxr və örnək olduğunu vurğulayıb.\n\nTədbirin gedişində Azərbaycanın ərazi bütövlüyü uğrunda şəhid olmuş Vətən övladlarının, o cümlədən Akademiyanın şəhid məzunlarının əziz xatirəsinə həsr olunmuş qısa videoçarx nümayiş etdirilib, bədii hissədə “Dəniz naviqasiyası mühəndisliyi” ixtisası üzrə təhsil alan Mustafa Məhərrəmov tərəfindən Zəfər Gününə, şəhidlərin əziz xatirəsinə və Vətənə həsr olunmuş müəllif şeiri səsləndirilib.\n\nSonda Akademiyanın Tələbə Gənclər Təşkilatı (TGT) tərəfindən Vətən müharibəsi iştirakçıları və qazilərə dərin ehtiram əlaməti olaraq xüsusi hədiyyələr təqdim edilib."
  },
  {
    "legacy": "news/2004",
    "slug": "adda-da-kibertehlukesizlik-movzusunda-infosessiya-kecirilib",
    "title": "ADDA-da kibertəhlükəsizlik mövzusunda infosessiya keçirilib",
    "date": "2026-11-20T04:37:00+04:00",
    "hero": "",
    "gallery": [],
    "body": "Azərbaycan Dövlət Dəniz Akademiyasında (ADDA) Su Nəqliyyatında Polis İdarəsi ilə birgə kibertəhlükəsizlik mövzusunda infosessiya təşkil olunub.\n\nGörüşdə iştirakçılara kiberrisklər, onlardan qorunma yolları, o cümlədən onlayn əməliyyatlar zamanı diqqət yetirilməli olan əsas məqamlar barədə ətraflı məlumat verilib.\n\nDiqqətə çatdırılıb ki, internetdə ehtiyatlı davranmaq, şübhəli keçidlərdən istifadə etməmək, şəxsi məlumatları qorumaq kiber təhlükələrdən müdafiənin əsas şərtlərindəndir. Məhz bunlar sayəsində rəqəmsal mühitdə təhlükəsiz davranış vərdişləri formalaşdırmaq olar.\n\nİnteraktiv formatda keçirilən infosessiyada iştirakçıları maraqlandıran suallar cavablandırılıb, mövzu ətrafında fikir mübadiləsi aparılıb."
  }
];
