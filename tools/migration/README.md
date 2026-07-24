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
- **K5** — media → Cloudinary, 301 redirect-lər, Meilisearch reindex, redaktə düzəlişləri

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
