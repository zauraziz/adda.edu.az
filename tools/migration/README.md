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

## Bilinməyənlər (zonddan sonra dəqiqləşəcək)

- Olmayan ID `404` qaytarır, yoxsa `200` + boş şablon? → `probe.mjs` cavab verir
- Xəbər gövdəsinin CSS selektoru → `inventory.mjs` namizədləri **ölçür**, təxmin etmir
- `news/1..2000` aralığında neçə real xəbər var → inventar sayır

## Növbəti mərhələlər

- **K2** — ekstraksiya: HTML→Markdown, slug (`ə→e, ş→s, ç→c...`), redirect xəritəsi
- **K3** — idxal: idempotent Strapi API importer, az əvvəl → ru/en lokalizasiya, media → Cloudinary
- **K4** — doğrulama: say pariteti, Meilisearch reindex, 301 redirect-lər, redaktə düzəlişləri
