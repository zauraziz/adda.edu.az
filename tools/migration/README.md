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

## Növbəti mərhələlər

- **K2** — ekstraksiya: HTML→Markdown, slug (`ə→e, ş→s, ç→c...`), redirect xəritəsi
- **K3** — idxal: idempotent Strapi API importer, az əvvəl → ru/en lokalizasiya, media → Cloudinary
- **K4** — doğrulama: say pariteti, Meilisearch reindex, 301 redirect-lər, redaktə düzəlişləri
