# ADDA — məzmun miqrasiyası (K mərhələsi)

`adda.edu.az` (köhnə PHP CMS) → Strapi 5.

## Niyə crawl?

Köhnə saytın bazasına SQL/FTP girişi yoxdur, ona görə yeganə mənbə saytın özüdür.
Yaxşı xəbər: köhnə sayt **artıq trilingualdır** və eyni ID hər üç dildə işləyir
(`/az/news/1984` = `/ru/news/1984` = `/en/news/1984`) — yəni **ru/en tərcümələri hazırdır**.

## Memarlıq: crawl ≠ parse

Bu iki mərhələ **qəsdən ayrıdır**:

| Mərhələ | Skript | Şəbəkə | Nəticə |
|---|---|---|---|
| 0 — zond | `probe.mjs` | bəli (~50 sorğu) | konsol hesabatı |
| 1 — yığım | `crawl.mjs` | bəli (~6000 sorğu) | `data/raw/**.html` |
| 2 — inventar | `inventory.mjs` | **yox** | `data/inventory.{json,csv}` |
| 2b — struktur | `structure.mjs`, `dump.mjs` | **yox** | konsol diaqnostikası |
| 3 — ekstraksiya | `extract.mjs` | **yox** | `data/extracted/*.json` |
| 3b — baxış | `preview.mjs` | **yox** | konsol |
| 4 — idxal | `import.mjs` | Strapi | `data/import-state.json` |
| 5 — doğrulama | `verify.mjs` | Strapi (oxu) | konsol hesabatı |
| 6 — təmizləmə | `cleanup.mjs` | Strapi | silinmiş qeydlər |
| 7 — media yükləmə | `media-upload.mjs` | adda.edu.az + Strapi | `data/media-map.<host>.json` |
| 8 — media bağlama | `media-link.mjs` | Strapi | `data/media-linked.<host>.json` |
| 9 — qalereya | `gallery-crawl.mjs` | adda.edu.az | `data/galleries.json` |
| 10 — yönləndirmə | `gen-redirects.mjs` | **yox** | `adda-nextjs/lib/legacy-redirects.ts` |

Səbəb: selektorları tənzimləyərkən ADDA-nın **canlı prod serverinə təkrar getmək
lazım gəlməməlidir**. Bir dəfə yığ, dəfələrlə parse et.

## Sıra

```bash
cd tools/migration

# 0) Zond — TAM CRAWL-DAN ƏVVƏL MÜTLƏQ. ~1 dəqiqə.
node probe.mjs
#    Nəticəni Claude-a göndər: "mövcud ID" əlaməti buradan müəyyən olunur.

# 1) Kiçik sınaq — real xəbərlər olduğunu bildiyimiz aralıq
node crawl.mjs --section=news --from=1975 --to=1984
#    Gözlənilən: 10 tapıldı, data/raw/news/ altında 30 fayl (10 ID x 3 dil)

# 2) Tam yığım (bir neçə saat, kəsilsə davam etdirmək olar)
node crawl.mjs

# 3) İnventar (şəbəkəsiz, dəfələrlə işlədilə bilər)
npm install
node inventory.mjs
```

## Bərpa olunma

`crawl.mjs` hər 25 sorğudan bir `data/manifest.json`-a yazır. Kəsilsə eyni əmri
təkrar işlət — alınmışlar atlanır. Yenidən yığmaq üçün `data/manifest.json`-u sil.

## Nəzakət

Bu **ADDA-nın canlı prod serveridir**. Standart: tək paralel sorğu + 400 ms gecikmə
(~2.5 sorğu/san). Server rahat aparırsa `config.mjs`-də `THROTTLE_MS` azaldıla bilər.
İş saatlarından kənarda işlətmək tövsiyə olunur.

## Mövcudluq qaydası (23.07.2026 zondu ilə ÖLÇÜLÜB)

İki fərqli davranış var:

| Bölmə | Olmayan ID | Ayırıcı |
|---|---|---|
| `news`, `announce` | düzgün **404** | status kifayətdir |
| `content`, `faculty` | **200 + boş şablon** | yalnız **bayt ölçüsü** |

Boş şablon ölçüləri: `content` = 24361 b, `faculty` = 24365–24369 b.
Ən kiçik real səhifələr: `content/58` = 26223 b, `faculty/1` = 28267 b.

**Başlıq ayırıcı kimi işləmir** — `faculty/1` real olsa da `<title>`-ı sadəcə
"Azərbaycan Dövlət Dəniz Akademiyası"-dır, səhifə adı yoxdur.

Hədlər (`config.mjs` → `minBytes`) qəsdən **aşağı** seçilib: real səhifəni
itirməkdənsə bir neçə boşu içəri buraxmaq daha təhlükəsizdir. `inventory.mjs`
həddə yaxın olanları **SERHED** kimi işarələyir — onlara əl ilə baxılır.

## Dil modeli (K1d diaqnostikası ilə ÖLÇÜLÜB)

Köhnə CMS-də **vahid ID ardıcıllığı** var; hər yazının dil sahələri ayrıdır və
boş dil üçün server 404 qaytarır. Tərcümələr **qismənidir**:

```
/az/news/1984 -> 200  "Bu gün ADDA-nın 30 illik yubileyidir"
/ru/news/1984 -> 404
/ru/news/1336 -> 200  "ASCO организовало морской тур..."
/en/news/1336 -> 200  "ASCO organized a cruise tour..."
/en/news/1452 -> 200  "Wishing you all the happiness..."
```

Nəticələr:

1. **Dillər müstəqil skan olunmalıdır.** az boş olanda ru/en-i atlamaq (`--gate`)
   `news` üçün TƏHLÜKƏLİDİR — az-da olmayıb ru/en-də olan yazılar itir.
   Ona görə gating standart olaraq **söndürülüb**.
2. `content` (41 ID), `announce` (6 ID görünən) və `faculty` (2 ID) hər üç dildə
   **eyni ID dəsti** verir və `content/1` üç dildə fərqli ölçü + düzgün tərcümə
   olunmuş başlıq qaytarır — bunlar tam trilingualdır.
3. Yalnız `news` qarışıqdır. Dəqiq mənzərəni `inventory.mjs`-in
   **DIL KOMBINASIYALARI** cədvəli verəcək.

Qeyd: akademiya `en`-də **ASMA**, `ru`-da **АГМА** kimi keçir.

## Təxmini həcm (zond nümunələrindən)

| Bölmə | Real aralıq | Təxmin |
|---|---|---|
| news | ~1100–1984 (1..1091 tamamilə boşdur) | ~850 |
| announce | ~150–519 | ~370 |
| content | 1..71, seyrək | ~45 |
| faculty | 1–2 | 2 |

≈ **1270 sənəd × 3 dil ≈ 3800 giriş**. Aralıqlar buna baxmayaraq tam skan olunur —
az-əvvəl məntiqi sayəsində boş ID cəmi 1 sorğuya başa gəlir.

## Hələ bilinməyən

- Gövdənin CSS selektoru → `inventory.mjs` namizədləri **ölçür**, təxmin etmir

## Markup (K1g ilə ÖLÇÜLÜB)

```html
<div class="center static-inside">
  <div class="page-title-line">
    <span class="page-title">- XƏBƏRLƏR -</span>   <!-- content/faculty-də BAŞLIQ -->
    <div class="page-options">…sayğac, A-/A+, arxiv…</div>
  </div>
  <div class="news-image"><img …>                  <!-- əsas şəkil -->
    <div class="news_gallery"><a class="more_photo" href="/az/photogallery/1984">
  </div>
  <span class="news-title">BAŞLIQ<br>2026.07.15 14:53</span>
  <span class="news-text">…GÖVDƏ…</span>
  <div class="share-social">…</div>
</div>
```

**Ən vacib tapıntı:** başlıq və tarix EYNİ elementdədir, `<br>` ilə ayrılıb.
Tarix başqa heç yerdə yoxdur — səhifədəki `availableDates` massivi arxiv
təqvimidir və bütün səhifələrdə eynidir (`news` üçün 687 tarix, `announce` üçün 284).

| Bölmə | Başlıq | Tarix | Gövdə |
|---|---|---|---|
| news, announce | `span.news-title` (`<br>`-dan əvvəl) | `<br>`-dan sonra | `span.news-text` |
| content, faculty | `span.page-title` (`- … -` kəsilir) | yoxdur | `div.page-full-text` |

⚠️ `div.page-title-line` gövdə zibili kimi silinməməlidir — `content` başlığı onun içindədir.

## Slug siyasəti

`az` mənbədir: ru/en **eyni slug-ı paylaşır**, ona görə dil dəyişdiricisi
URL-i dəyişmir. az olmayan sənədlərdə (2 ədəd) slug öz dilindən yaranır.
Azərbaycan hərfləri əl ilə xəritələnir — `toLowerCase()` `I`/`İ` fərqini korlayır.

## Növbəti mərhələlər

- **K2 ✓** — ekstraksiya: HTML→Markdown, slug, redirect xəritəsi, media manifesti
- **K3 ✓** — idxal: idempotent Strapi importer (media hələ yox)

### İdxal (K3)

```bash
cp .env.example .env      # STRAPI_TOKEN-i doldur (Full access, Unlimited)
node import.mjs --plan                     # hec ne yazmir, xeriteni gosterir
node import.mjs --section=news --limit=5   # kicik sinaq
node import.mjs                            # hamisi
```

- **Standart hədəf lokaldır.** Prod-a yazmaq üçün `.env`-də `STRAPI_URL`
  dəyişməli VƏ `--force` verilməlidir — təsadüfən prod-a 1200 sənəd tökməmək üçün.
- **İdempotent:** `data/import-state.json` `bölmə/id → documentId` saxlayır.
  Təkrar run yeni yazı yaratmır, mövcudu yeniləyir. Yarıda kəsilsə davam etdirilir.
- **Dil:** `az` əvvəl yaradılır (documentId alınır), ru/en həmin sənədə
  lokalizasiya kimi əlavə olunur — F2.3 relSync-in gözlədiyi mənbə-dil qaydası.
- `isEmpty` işarəli qeydlər atlanır (`--include-empty` ilə daxil edilir).
- `publishedAt` payload-a qoyulur, əks halda qeydlər DRAFT qalıb public API-də
  görünməzdi.

`content/*` səhifələrinin hədəf tipi `mapping.mjs`-dədir (canlı saytın
sitemap-ından). Səhv təyinat varsa həmin faylı düzəlt və `--plan` ilə yoxla.
- **K4 ✓** — doğrulama: `verify.mjs`
- **K5 ✓** — təmizləmə: `cleanup.mjs`
- **K6** — media → Cloudinary, 301 redirect-lər, Meilisearch reindex, redaktə düzəlişləri

### Təmizləmə (K5)

```bash
node extract.mjs        # MƏCBURİ — isEmpty sahələri üçün
node cleanup.mjs        # yalnız göstərir
node cleanup.mjs --confirm
node import.mjs         # səhv tipdə olanlar düzgün tipdə yenidən yaranır
node verify.mjs
```

İki problemi həll edir:

1. **Boş sənədlər.** Yalnız mənbədə `isEmpty` işarəli qeydlər silinir —
   Strapi-də "qısa görünən" hər şey yox. Məsələn yeni il təbriki elanının
   gövdəsi qısadır, amma şəkli var və qanuni məzmundur.
   Hədəf `documentId` ilə dəqiq tapılır; başlıq/slug üzrə axtarış YOXDUR.
2. **Səhv tip.** `mapping.mjs` idxaldan sonra dəyişibsə (məs. `content/28`
   `page` → `department`), sənəd köhnə tipdə qalır və `import.mjs` onu
   yeniləyə bilmir. Belələri silinir və növbəti idxalda düzgün tipdə yaranır.

Silinən sənəd vəziyyət faylından da çıxarılır.

3. **Miqrasiyadan əvvəlki əl işi.** Strapi slug-ı `targetField: title`-dan
   avtomatik doldurur və nəticə tip adının özü olur (`article-2`,
   `announcement-1`). Bizim importer slug-ı həmişə açıq göndərir, ona görə belə
   slug idxaldan gələ **bilməz** — admin-də əl ilə yaradılıb və çox vaxt
   idxal olunanı təkrarlayır. Opt-in silinir:
   `node cleanup.mjs --confirm --delete-autoslug`

⚠️ **Silinmə həmişə `?locale=` ilə aparılır.** Strapi-nin standart dili `en`-dir
(`config/plugins.ts`-də i18n konfiqurasiyası yoxdur). Locale verilməyən `DELETE`
`en` versiyasını axtarır və `en` tərcüməsi olmayan sənəddə **404** qaytarır —
köhnə versiya bunu "uğur" sayıb sənədi bazada saxlayırdı. İndi hər dil ayrıca
silinir və nəticə **yoxlanılır**.

## Vəziyyət faylı HƏDƏF ÜZRƏ ayrıdır (K9)

`documentId` **bazaya xasdır**. Lokala idxaldan sonra eyni vəziyyət faylı ilə
prod-a getsək, importer sənədlərin mövcud olduğunu düşünüb prod-a `PUT` göndərir —
həmin ID-lər orada yoxdur, hamısı 404 verir.

Ona görə fayl adı hədəf host-dan törəyir:

```
http://localhost:1337             -> data/import-state.localhost-1337.json
https://adda-edu-az.onrender.com  -> data/import-state.adda-edu-az-onrender-com.json
```

Köhnə tək-fayl formatı (`import-state.json`) ilk işə salışda avtomatik köçürülür —
yalnız **lokal** hədəf üçün, çünki o fayl lokala qarşı yaradılmışdı.

## Repoya nə girir

| Girir | Girmir |
|---|---|
| `data/extracted/*.json` | `data/raw/` (1373 xam HTML) |
| `data/redirects.json` | `data/manifest.json` |
| `data/media.json` | `data/import-state.*.json` |
| | `data/inventory.{json,csv}` |

Ekstraksiya nəticəsi commit olunur, çünki o, prod idxalının mənbəyidir və
53 dəqiqəlik crawl-ın davamlı ehtiyat nüsxəsidir — `data/raw/` repoda yoxdur,
yəni disk itsə yenidən yığmaq lazım gələrdi.

## Prod-a idxal

```bash
# .env-də: STRAPI_URL=https://adda-edu-az.onrender.com
node import.mjs --plan          # hedefi tesdiqle
node import.mjs --force         # PROD ucun --force MECBURIDIR
node verify.mjs
```

### Doğrulama (K4)

```bash
node verify.mjs
```

Beş yoxlama:

1. **Say pariteti** — hər tip/dil üçün mənbə vs Strapi
2. **Lokalizasiya bütövlüyü** — ru/en eyni `documentId` altındadırmı.
   Ən kritik yoxlama: `PUT ?locale=ru` lokalizasiya yaratmalıdır, ayrıca
   sənəd yox. HTTP 200 almaq bunu sübut etmir.
3. **Boş gövdələr** — `isEmpty` filtri işləyibmi
4. **Slug sağlamlığı** — `article-1` kimi avtomatik slug qalıbmı
   (bunlar idxaldan əvvəl əl ilə əlavə olunmuş qeydlərdir)
5. **Draft/dərc** — `publishedAt` işləyibmi; draft qeydlər public API-də görünmür

Arxiv **az-only** qalır (qərar: 23.07.2026). Tərcümə örtüyü: 1212 sənəddən
cəmi 28-i tam trilingualdır. ru/en lokalizasiyaları yalnız mövcud olduqda yaradılır.

## Media köçürməsi (K15)

```bash
node media-upload.mjs --dry-run
node media-upload.mjs --limit=20     # kicik sinaq
node media-upload.mjs --force        # PROD ucun --force MECBURI
node media-link.mjs --force
```

**Niyə Strapi üzərindən, birbaşa Cloudinary-yə yox:** `cover` sahəsi Strapi fayl
`id`-si ilə bağlanır. Birbaşa Cloudinary-yə yükləsək Strapi-də media qeydi olmaz
və heç nəyə bağlaya bilmərik.

| Tip | Media sahələri |
|---|---|
| `article` | `cover` ← əsas şəkil, `gallery` ← gövdə şəkilləri |
| `announcement` | `cover`, `attachments` ← PDF/doc |
| `page`, `faculty`, `program`, `department` | media sahəsi yoxdur — yalnız gövdə URL-ləri |

Hər iki mərhələ **idempotentdir**: `media-map` yüklənənləri, `media-linked`
bağlananları saxlayır. Kəsilsə eyni əmr davam etdirir. `--relink` məcburi
yenidən bağlama üçündür.

⚠️ Yükləmə **ADDA-nın canlı serverindən** gedir və `lib/http.mjs`-in boğma
mexanizmindən keçir. 1192 fayl ~30 dəqiqə çəkir.

⚠️ Prod Strapi-də `CLOUDINARY_NAME` / `CLOUDINARY_KEY` / `CLOUDINARY_SECRET`
env dəyişənləri qurulmalıdır — yoxdursa fayllar Render-in müvəqqəti diskinə
düşür və növbəti deploy-da İTİR.

## Foto qalereyalar (K16)

**Tapıntı:** xəbərin gövdəsində (`span.news-text`) şəkil demək olar ki yoxdur —
yalnız mətn. Tək şəkil `div.news-image`-dəkidir və o, `cover`-ə gedir.
Həqiqi qalereya **ayrıca səhifədədir**:

```html
<div class="news_gallery">
  <a href="/az/photogallery/1984" class="more_photo">Foto</a>
</div>
```

`extract.mjs` bu URL-i `gallery` sahəsində saxlayırdı, amma səhifələrin özü
crawl olunmamışdı — ona görə `article.gallery` boş qalırdı (1192 mediadan
cəmi 29 qalereya elementi).

```bash
node gallery-crawl.mjs --probe      # MECBURI ilk addim: markup-u olc
node gallery-crawl.mjs              # ~800 sehife
node media-upload.mjs --force       # yeni sekiller Cloudinary-ye
node media-link.mjs --force --relink
```

`--relink` **məcburidir**: `media-linked` faylı sənədləri artıq "bağlanmış"
sayır, yeni qalereya şəkilləri onsuz tətbiq olunmaz.

`media-upload.mjs` və `media-link.mjs` `galleries.json`-u avtomatik oxuyur.

## Köhnə URL yönləndirmələri (K19)

```bash
node extract.mjs          # redirects.json yenilensin
node gen-redirects.mjs    # -> adda-nextjs/lib/legacy-redirects.ts
```

Köhnə saytın ünvanları (`/az/news/1981`) Google indeksindədir və xarici
saytlardan link alır. Yönləndirmə olmasa hamısı 404 verər.

**Niyə kod, JSON yox:** middleware Edge runtime-da işləyir və fayl sistemini
oxuya bilmir — xəritə bundle-a daxil olmalıdır.

**Sıxılma:** `redirects.json`-da 1316 sətir var (438 sənəd × 3 dil), amma
ru/en **eyni slug-ı paylaşır** (K2 qərarı). Ona görə xəritə dilsiz saxlanılır
və dil prefiksini middleware özü qoyur — 1316 → ~440 yazı.

Generator dil üzrə slug fərqi tapsa **dayanır**: sıxılma o halda etibarsızdır.

| Köhnə | Yeni |
|---|---|
| `/az/news/1981` | `301 → /az/xeberler/{slug}` |
| `/ru/news/1981` | `301 → /ru/xeberler/{slug}` (dil qorunur) |
| `/news/1981` | `301 → /az/xeberler/{slug}` |
| `/az/photogallery/1981` | `301 → /az/xeberler/{slug}` (qalereya artıq xəbərin içindədir) |

`lib/legacy-redirects.ts` **boş** göndərilir — generator işlədilənə qədər
yönləndirmə yoxdur, amma sayt normal işləyir.

## RAG indeksi (F2.7-1)

```bash
$env:ADMIN_IMPORT_SECRET = '<Render-dəki sirr>'
node rag-index.mjs --status     # rejim + provayder + əhatə
node rag-index.mjs --plan       # nə embed olunacaq (yazma yox)
node rag-index.mjs --run        # indekslə
```

`rag_chunks` **Strapi content type deyil** — `strapi.db.connection` (knex)
üzərində öz cədvəlimizdir. Səbəb: 5000 parça admin panelində zibil olardı,
`schema.json`-da `vector` tipi yoxdur, draft/publish maşını isə burada mənasız.

**İki rejim:** Neon-da `vector(768)` + HNSW indeksi (pgvector), lokal SQLite-da
JSON. Rejim `--status` çıxışında görünür — pgvector qurulmasa deqradasiya
səssiz olmur.

**Embedding server tərəfdədir.** CLI yalnız kursoru sürür. Açar Render-də
qalır, çünki F2.7-4-də sorğu vektoru üçün onsuz da orada lazımdır.

**İdempotentdir:** hər parçanın SHA-256-sı saxlanılır, dəyişməyən parça
yenidən embed olunmur. İkinci run `atlandi: <hamısı>` verir və provaydere
sıfır sorğu göndərir.

| bayraq | təyinat |
|---|---|
| `--status` | anbar rejimi, provayder hazırlığı, mənbə/dil üzrə əhatə |
| `--plan` | quru gediş — açar olmadan da işləyir |
| `--run` | indekslə (`--source=`, `--locale=`, `--force`) |
| `--purge` | parçaları sil (`--source=`, `--locale=` ilə süzülür) |
| `--purge-hard` | cədvəli at — **`RAG_EMBED_DIMS` dəyişəndə məcburidir** |

**Ölçü dəyişməsi susmur:** `vector(768)` DDL-də sabitdir. Env-də ölçü
dəyişilsə köhnə vektorlar yeni sorğularla müqayisə oluna bilməz — nəticə
mənasız olardı, xəta isə çıxmazdı. Ona görə `rag_meta` cədvəli ölçünü/modeli
yadda saxlayır və uyğunsuzluqda indeksləmə **dayanır**.

**PII:** `person` yalnız metadata kimi indekslənir — ad, vəzifə, elmi ad/dərəcə,
bölmə, fakültə. Bio, e-poçt, telefon, doğum tarixi **düşmür**. Bütün mənbələrdə
mətndən e-poçt/telefon naxışları da silinir (`RAG_SCRUB_CONTACTS=false` ilə
söndürülür).

## Hibrid axtarış (F2.7-2)

```bash
node rag-index.mjs --search="gəmi mühərrikləri üzrə işə düzəlmək" --locale=az
```

`GET /api/rag-search?q=…&locale=az&limit=8[&sources=…][&debug=1]` —
**yalnız mənbə qaytarır**, cavab generasiyası yoxdur (o, F2.7-4-dür).

**Niyə iki qol:** çoxdilli embedding modelləri Azərbaycan dilində az-resurslu
rejimdə işləyir. Xüsusi adlar və kodlar (`AZCON`, `ASCO`, `6231`) vektor
fəzasında pis ayrılır — leksik qol orada dayaq olur. Əksinə, «gəmi mühərrikləri
üzrə işə düzəlmək» sorğusunda leksik qol **sıfır** nəticə verir, çünki bu sözlər
mətndə yoxdur; vektor qolu «Gəmi mexanikası ixtisası»nı tapır.

**RRF, bal normallaşdırması yox:** leksik bal 0..1030, kosinus isə -1..1
aralığındadır. Onları eyni şkalaya gətirən hər çevirmə özbaşınadır və məlumat
paylanması dəyişəndə sürüşür. RRF yalnız **sıraya** baxır — miqyasdan asılı
deyil. `RAG_W_LEXICAL` / `RAG_W_VECTOR` ilə çəkilər tənzimlənir, indeksi
yenidən qurmadan.

**`person` artıq axtarılır.** `site-search` heyəti ümumiyyətlə axtarmırdı
(K25-dən qalan boşluq). Burada həm `displayName` («Ad Ata Soyad»), həm `name`
(ştatdakı «Soyad Ad Ata») sorğulanır — istifadəçi hər iki sıra ilə yaza bilər.

**Endpoint defolt BAĞLIDIR.** Hər sorğu keşlənməyibsə provaydere pullu
gedişdir və guardrails F2.7-3-dədir. `RAG_SEARCH_PUBLIC=true` ilə açılır; admin
sirri həmişə işləyir. Sorğu vektorları yaddaşda keşlənir (500 sorğu, LRU) —
təkrar sual provaydere getmir.

### Oxşarlıq kəsimi — KALİBRLƏNMƏLİDİR

Vektor axtarışı **həmişə** `limit` qədər nəticə qaytarır, sorğu ilə heç bir
əlaqəsi olmasa belə. Bu parçalar F2.7-4-də birbaşa prompta düşəcək, ona görə
kəsim var:

| dəyişən | defolt | nə edir |
|---|---|---|
| `RAG_SIM_DROP` | `0.15` | **nisbi**: ən yaxşıdan bu qədər geri qalanı atır |
| `RAG_SIM_FLOOR` | `0` (sönülü) | **mütləq**: bu həddin altını atır |

**Nisbi kəsim «heç nə uyğun gəlmir» halını TUTA BİLMİR** — bütün nəticələr
eyni dərəcədə zəif olanda ən zəifi də keçir. Bunun üçün mütləq hədd lazımdır,
onu isə real rəqəmlərə baxmadan təyin etmək olmaz: Gemini embedding-lərinin
kosinus paylanması sıfır ətrafında mərkəzlənmir, «0.5-dən aşağı = əlaqəsiz»
kimi sehrli rəqəm uydurmaq yanlış olardı.

**Kalibrləmə addımı (indeks qurulandan sonra):**

```bash
node rag-index.mjs --search="<real sual>"        # oxsarliq: top / bottom
node rag-index.mjs --search="kvant kriptoqrafiyasi qara delik"   # cefengiyat
```

İki halın `top` dəyərləri arasındakı sərhədi `RAG_SIM_FLOOR`-a yaz.

## Kvota tənzimləməsi (F2.7-1a)

**Kvota HTTP sorğusunu yox, hər mətn elementini sayır.** Metrik adı bunu
birbaşa deyir: `embed_content_free_tier_requests`. Praktik sübut: `batch=50`
ilə 681 parça cəmi ~14 HTTP sorğusudur, lakin 1000-lik gündəlik hədd doldu.
Nəticə: `RAG_EMBED_BATCH`-i böyütmək kvotaya **qənaət etmir** — yalnız şəbəkə
gedişlərini azaldır.

| dəyişən | defolt | nə edir |
|---|---|---|
| `RAG_EMBED_RPM` | `90` | element/dəqiqə; sürüşən 60 s pəncərəsi. `0` = sönülü |
| `RAG_EMBED_RETRIES` | `6` | 429/5xx üçün cəhd sayı |

**Provayderin dediyi qədər gözlənilir.** Əvvəlki sabit `1000 × cəhd²` sxemi
4 cəhddə cəmi ~14 s verirdi, Google isə «retry in 43s» deyirdi — imtina
qaçılmaz idi. İndi cavabdakı `retryDelay` oxunur.

**429 artıq mənbəni tərk etmir.** Əvvəl kvota xətası 502 kimi qaytarılırdı və
CLI mənbəni atırdı (`article/az` 811 sənəddən 75-də dayanmışdı). İndi server
429 qaytarır, CLI gözləyib **eyni kursordan** davam edir.

```bash
node rag-index.mjs --run --max-items=900   # gunluk kvota budcesi
node rag-index.mjs --run --max-wait=1800   # umumi gozleme haddi (saniye)
```

Hədd dolanda skript təmiz dayanır və nə qədər element göndərildiyini yazır.
Eyni əmri sabah işlət — idempotentdir, qaldığı yerdən davam edir.

**Pulsuz tarifin arifmetikası:** ~4300 parça ÷ 1000 element/gün ≈ 5 gün.
Ödənişli tarifə keçmək bunu bir gedişə endirir; `RAG_EMBED_RPM` orada da
lazımdır, çünki dəqiqəlik hədd ödənişlidə də var.

## Guardrails (F2.7-3)

**Təhdid modeli:** indekslənən mətn **etibarsız girişdir**. Məzmunun bir hissəsi
istifadəçi düzəlişlərindən gəlir (`/profil`, correction inbox). F2.7-4-də həmin
mətn birbaşa LLM promptuna düşəcək — yəni istifadəçinin yazdığı sətir modelin
göstərişi kimi oxuna bilər.

Müdafiə iki qatdır: indeksləmə vaxtı naxış aşkarlanması (`guard.ts`) + prompt
vaxtı struktur çərçivə (F2.7-4). Tək qat kifayət deyil — naxışlar həmişə
keçirilə bilər, çərçivə isə tək başına yaxşı gizlədilmiş göstərişi tutmur.

### PII — kontekstə lövbərlənib

| növ | necə tutulur |
|---|---|
| e-poçt, telefon | birbaşa naxış |
| IBAN (`AZ…`), pasport | birbaşa naxış |
| kart nömrəsi | **Luhn yoxlanışı** ilə — yoxsa hər 16 rəqəmli kod silinərdi |
| FIN | **yalnız** «FİN», «ş.v.», «şəxsiyyət vəsiqəsi» sözünün yanında |
| doğum tarixi | **yalnız** «doğum tarixi», «təvəllüdlü» kontekstində |

Lövbər olmasa fəlakət olardı: FIN 7 simvollu alfanumerik koddur, lövbərsiz
`STCW-95`, `GEMI123`, ixtisas kodları da silinərdi. `12.05.2024` tədbir
tarixidir, `12.05.1980-ci il təvəllüdlü` isə PII.

### İnyeksiya

Naxışlar **üç dildə**: `ignore previous instructions`, `əvvəlki göstərişləri
nəzərə alma`, `игнорируй … инструкции`, `system prompt`, `you are now`,
`<|im_start|>`, saxta növbə başlıqları, HTML şərhləri, görünməz Unicode.

> **JS tələsi:** `\b` yalnız ASCII hərflər üzərində işləyir — `ə`, `İ`, `и`
> üçün söz sərhədi **heç vaxt yaranmır** və naxış səssizcə heç nə tutmur.
> Ona görə AZ/RU naxışlarında `(?<![\p{L}])` + `u` bayrağı işlədilir.

### Nəticə: işarələnmiş parça axtarışa DÜŞMÜR

```bash
node rag-index.mjs --audit        # ne tutulub, hansi siqnalla
```

| dəyişən | defolt |
|---|---|
| `RAG_SCRUB_IDENTIFIERS` | `true` |
| `RAG_GUARD_INJECTION` | `true` |
| `RAG_DROP_FLAGGED` | `true` |

**Yalançı müsbətin qiyməti realdır:** işarələnən parça çıxarılır, yəni sənəd
co-pilot üçün görünməz olur. `--audit` məhz buna görə var — siyahını nəzərdən
keçir, yalançı müsbət varsa naxışı dəqiqləşdir.

**Sütun ALTER ilə əlavə olunur, cədvəl yenidən qurulmur** — prodda artıq
indekslənmiş parçalar itməsin deyə. Köhnə sətirlərdə `signals` NULL qalır
(«təmiz»); yenidən indeksləmə isə hash dəyişdiyi üçün **avtomatik** baş verir,
`--force` lazım deyil.
