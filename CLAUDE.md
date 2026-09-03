# ADDA — adda.edu.az

Azərbaycan Dövlət Dəniz Akademiyasının saytı. Üçdilli (az/ru/en), 2031+-ə qədər
məzmunla idarə olunan platforma. Tək developer: Zaur.

**Ünsiyyət dili: Azərbaycan dili.** Qısa və konkret. Uzun izahat istənilmir.

---

## Stek

| Qat | Texnologiya | Yer |
|---|---|---|
| Frontend | Next.js 15.1 / React 19 | Vercel — `demo.adda.edu.az` |
| CMS | Strapi 5.50 | Render pulsuz plan — `adda-edu-az.onrender.com` |
| Baza | Neon Postgres (+ pgvector) | |
| Media | Cloudinary | |
| E-poçt | Resend | |
| AI | Gemini (`gemini-3.5-flash`, `gemini-embedding-001`) | |

Monorepo: `adda-nextjs/`, `adda-strapi/`, `tools/`.
Mühit: Windows, PowerShell 5.1, `E:\web-projects\adda.edu.az`.

**Dizayn (kilidli):** Fraunces (başlıq) + Manrope (mətn), navy `#0B3D5C`, qızılı `#C9A961`.

---

## İş qaydaları

### Commit

- **Yalnız lokal commit. Push HƏMİŞƏ Zaurdadır.** Heç vaxt `git push` etmə.
- Commit mesajı **yalnız ASCII**, ingilis dilində, `F3.x: ...` formatında.
- `git add` üçün **`--literal-pathspecs` məcburidir** — `[locale]` qovluq adı joker
  simvol kimi oxunur və fayl əlavə olunmur.

### Qapılar — dəyişiklikdən sonra MÜTLƏQ

```bash
# Strapi
cd adda-strapi && npx tsc --noEmit -p tsconfig.json
# sxem (schema.json) dəyişibsə ƏLAVƏ olaraq:
npm run build

# Next.js
cd adda-nextjs && npx tsc --noEmit
```

`npm run build` (Next.js) qumluqda `fonts.googleapis.com` bloklandığı üçün
uğursuz olur — **etibarlı qapı deyil**, `tsc --noEmit` işlət.

Strapi sxemi dəyişəndə tiplər də yenilənməlidir (fayl git-də izlənir):

```bash
cd adda-strapi && node node_modules/@strapi/strapi/bin/strapi.js ts:generate-types
```

### Dəyişikliyin ölçüsü

- Kiçik, bir-iki nöqtəli düzəliş → birbaşa redaktə.
- `src/index.ts` (215 KB) kimi böyük fayllarda **çoxlu ardıcıl lövbər işlətmə**.
  Səbəb: əvvəlki əvəzləmə sonrakı lövbərin kontekstini dəyişir və proses ortada
  dayanır. Belə hallarda faylı bütövlükdə yaz.

---

## Ölümcül tələlər

### Azərbaycan dili

```js
// toLowerCase() TƏK BAŞINA SƏHVDİR:
//   'I'.toLowerCase() === 'i'   (doğrusu 'ı')
//   'İ'.toLowerCase() === 'i̇'   (iki kod nöqtəsi!)
const azLower = (s) => s.replace(/İ/g, 'i').replace(/I/g, 'ı').toLowerCase();
```

- **Əlifba sırası:** `localeCompare(a, b, 'az')` məcburidir. Standart müqayisədə
  `Ə` hərfi `Z`-dən sonra düşür — Əliyev, Əsgərov siyahının sonuna atılır.
- **Diakritik bükmə** (`ə→e`, `ş→s`, `ç→c`, `ğ→g`, `ı→i`, `ö→o`, `ü→u`) ad
  uyğunlaşdırması üçün işlədilir. Mətn offsetləri lazımdırsa bükmə xəritəsi
  **1:1 uzunluq saxlamalıdır**.
- **JavaScript `\b` sözü qeyri-ASCII-də işləmir.** `(?<![\p{L}])` + `u` bayrağı.
- **Vəzifə uyğunlaşdırması sıralı və lövbərli olmalıdır.** Alt sətir toqquşmaları:
  `Rektor` ⊂ `Prorektor`, `Müəllim` ⊂ `Baş müəllim`, `dekan` ⊂ `dekan müavini`.
  Həmişə `müavin` istisnasını əvvəl yoxla.

### Strapi 5

- **`documents().update()` YALNIZ qaralamaya yazır.** `publish()` çağırılmasa
  dəyişiklik ictimai API-də görünmür. Bu, ən çox təkrarlanan səhvdir.
- **Defolt dil `az`-dır** (F3.6-da `en`-dən dəyişdirildi). Buna baxmayaraq
  sorğularda `locale` **açıq verilməlidir** — parametrsiz sorğu gələcəkdə səhv
  qeyd tapa bilər.
- **`config/api.ts` `maxLimit: 100`** — daha böyük `pagination[pageSize]`
  **səssizcə kəsilir**. Həmişə səhifələ.
- **Qeydləri yeniləyən dövrədə paginasiya SABİT SIRA tələb edir**
  (`sort: 'slug:asc'`). Sıra verilməsə sətirlər sürüşür və bəzi qeydlər heç vaxt
  emal olunmur.
- **Lokallaşdırılmış tip → lokallaşdırılmış tip əlaqəsi:** hədəf həmin dildə
  mövcud olmalıdır. Yoxdursa Strapi belə atır:
  `Document with id "...", locale "ru" not found` — və **bu, mənbə sənəd deyil,
  ƏLAQƏNİN HƏDƏFİ haqqındadır**.
- **i18n söndürmək DAĞIDICIDIR.** `@strapi/core/dist/migrations/i18n.js`:
  `deleteMany({ where: { locale: { $ne: defaultLocale } } })`.
  Defolt dildən başqa bütün sətirlər silinir. Əvvəlcə Neon snapshot, sonra
  dil əhatəsi yoxlaması.
- Single type üçün «boşdursa yenilə», «yoxdursa yarat» yox — Strapi boş qeydi
  özü yaradır.
- `@strapi/design-system` **2.2.3-ə kilidlidir** (`@codemirror/state` toqquşması).
- Upload servisi `originalFilename` (kiçik `n`) və `refId` üçün rəqəm ID istəyir.
- **`plugins.ts` əl ilə redaktə olunmamalıdır.**

### Seed blokları

Hamısı `adda-strapi/src/index.ts` → `bootstrap()` içindədir və env bayrağı ilə
qorunur:

`UNIT_RESEED` · `HEAD_RESEED` · `KAFEDRA_RESEED` · `NAME_CLEAN` · `STAFF_ARCHIVE`
`MENU_RESEED` · `PAGES_RESEED` · `MILESTONE_RESEED` · `RECTOR_RESEED`
`SOCIAL_RESEED` · `LEADERSHIP_RESEED` · `ABOUT_MIGRATE`

**İş qaydası:** `FLAG=true` → deploy → **logu yoxla** → **flagı SİL**.

> Flag silinməyəndə hər boot-da yenidən işləyir. Bir dəfə `HEAD_RESEED` +
> `KAFEDRA_RESEED` unudulub və boot 220 saniyəyə çıxıb.

**Ağır seed portu bloklamamalıdır.** Strapi `bootstrap()` bitənə qədər portu
açmır — Render `No open ports detected` yazıb gözləyir, sayt əlçatmaz qalır.
Bir dəfə 162 qeydlik miqrasiya 35 dəqiqə saytı söndürüb. Nümunə (`NAME_CLEAN`):

```ts
strapi.log.info('[seed] ... ARXA PLANDA baslayir - port bloklanmir.');
setTimeout(() => { void (async () => { /* ağır iş */ })().catch(...); }, 5000);
```

Uzun seed **hər 25 qeyddə irəliləyiş yazmalıdır** — əks halda ilişib-ilişmədiyi
bilinmir.

### PowerShell 5.1

- `[locale]` yolda **joker simvol sinfi** kimi oxunur → hər yerdə `-LiteralPath`.
  `New-Item`-də `-LiteralPath` yoxdur; `[System.IO.Directory]::CreateDirectory()`
  işlət.
- Dəyişən adları **hərf həssas deyil** — `$LibStrapi` və `$libStrapi` eynidir.
- `$home`, `$host`, `$error` **qorunmuş** dəyişənlərdir.
- `$ErrorActionPreference='Stop'` altında native əmrin `stderr`-i
  `NativeCommandError` kimi partlayır → `tsc`/`npm` çağırışında müvəqqəti
  `Continue` qoy.
- Sətir müqayisəsində `-eq` **hərf həssas deyil**; bayt dəqiqliyi üçün `-ceq`.

### Next.js

- Klient adaları tam `T` lüğətini (55 kB) **dəyər kimi import etməməlidir** —
  server komponentindən hazır tərcümə string-ləri prop kimi ötür.
- `NEXT_PUBLIC_` prefiksi olmadan dəyər brauzer paketinə düşmür.
- `STRAPI_URL` defoltu **produksiya Render URL-i** olmalıdır, `localhost` yox.
- CSS: `@import` URL-lərində nöqtəli vergül var — sadəlövh parser sındırır.
  Ölü CSS statik analizlə silinməməlidir (runtime siniflər görünmür).

### Render / Neon

- Pulsuz plan **fəaliyyətsizlikdən sonra yatır**; cron-job.org hər 10 dəqiqədə
  `/_health`-i döyəcləyir. Buna baxmayaraq yoxlayıcılarda **isinmə fazası** var.
- SMTP portları (25/465/587) **səssizcə bloklanır** — Resend işlədilir.
- «Clear build cache» **lazımsızdır** və pulsuz planda build-i 20+ dəqiqəyə çıxarır.

---

## Diaqnostika alətləri

```bash
cd adda-nextjs
npm run check:units      # bölmə/rəhbər/heyət bağlantısı, sahələrin doluluğu
npm run check:locales    # bölmələrin dil əhatəsi, head dil üzrə
npm run plan:heads       # vəzifəyə görə rəhbər təklifi (yalnız oxuma)
npm run check:audiences  # auditoriya keçidlərinin bütövlüyü
npm run check:menu       # menyu keçidlərinin auditi (yalnız oxuma)
```

**Qayda: əvvəlcə diaqnostika, sonra düzəliş.** Alətin öz çıxışını istə, təxmin
etmə. Bu layihədə iki dəfə səhv diaqnoz məhz bu addım atlandığı üçün olub.

---

## F3 sprintinin vəziyyəti

### Tamamlanıb (lokal, `HEAD` = `86f392b`)

- `unit.head` → `manyToOne` (+ `person.headOf` tərs əlaqə)
- 23 bölmə rəhbəri təyin olunub
- Defolt dil `en` → `az`
- 74 akademik heyət 7 kafedraya bağlanıb; `academicDegree`-yə `elmler_namizedi`
- Bölmə adlarından `«»` çıxarılıb (`UNIT_TREE` + baza + `roles[].unitName`)
- `person` sorğularından `locale` çıxarılıb
- `/[locale]/rehberlik` səhifəsi + menyu keçidi
- Ağır seed-lər portu bloklamır
- **F3.17** `document.units` çoxa-çox əlaqə (sxem)
- **F3.18** dil əhatəsi yoxlayıcısı (`npm run check:locale-coverage`)
- **F3.9** `person` i18n-dən çıxarıldı, `positionRu/En` / `academicTitleRu/En` /
  `bioRu/En` əlavə olundu, `REL_SYNC`-dən `person` silindi
- **F3.19** `HEAD_RESEED` idempotentlik yoxlaması düzəldildi — əvvəlki versiya
  yalnız `az`-a baxırdı, ona görə `HEAD_RESEED=true` işə salınsa belə ru/en
  heç vaxt dolmayacaqdı (23/0/0 vəziyyətində əbədi qalacaqdı). **Deploy
  edilib, təsdiqlənib: `head` az 23/28, ru 23/28, en 23/28.**
- **F3.20** `document` i18n-dən çıxarıldı, `titleRu/En` / `descriptionRu/En`
  əlavə olundu, `REL_SYNC`-ə `unit.documents` əlavə olundu (F3.17-dən sonra
  üzə çıxan boşluq — əks halda admin paneldə `az` bölməsinə bağlanan
  əsasnamə `ru`/`en` sətirlərində görünməyəcəkdi)
- **F3.21** `/struktur/[slug]` beş bloku üçün sxem (yalnız sxem, səhifə
  qurulmayıb): `unit`-ə `mission`, `receptionHours`, `functions`, `services`,
  `onlineServices`/`links` (`nav.link` component), `building`/`floor`/`room`,
  `phoneExt`, `email` (hamısı localized); `article.unit` və
  `announcement.unit` (manyToOne, inversedBy yox); `REL_SYNC`-ə hər ikisinin
  massivinə `unit` əlavə olundu
- **F3.22** `/struktur/[slug]` yenidən quruldu — tək markdown blobu yerinə
  beş mənbəli blok (struktur/əsasnamə · rəhbərlik və heyət · funksional
  fəaliyyət · kommunikasiya və yerləşmə · hesabatlılıq və şəffaflıq).
  **Boş sahə blokunu, başlığını və ayırıcısını tam gizlədir** — lokalda
  test edilib (`rektor`: 4 blok gizlənir, yalnız uşaq bölmələr qalan tək
  blokda görünür; boş kafedra: bütün 5 blok gizlənir, sadəcə ad+breadcrumb).
  Heyət siyahısı `person.unit` + `roles[].unitName` birləşməsidir. Xəbər/elan
  hibrid filtri (`unit` əlaqəsi VƏ YA bərabər slug-lı tag) Strapi-də
  `filters[$or]` ilə birbaşa yoxlanıb, xəta yoxdur. `department`-yalnız
  slug-lar köhnə `ContentPage` görünüşünə düşür (dağılmır).
  Yan-effekt düzəlişi: `ContentPage` işlədən 5 səhifədən (struktur, sehife,
  ixtisaslar, fakulteler, hazirlanir — sonuncunun correction-u yoxdur)
  4-ündə `promptHint`/`prompt` (və əksəriyyətində bütün açıq panel
  etiketləri) `correctionLabels`-də YOX idi — canlıda «promptHint prompt»
  xam mətni görünürdü. Hamısı tam etiket dəstinə keçirildi.
- **F3.23** `department.about` → uyğun `unit.about` köçürülməsi
  (`ABOUT_MIGRATE`). F3.22-də iki tip eyni slug-da olanda `unit` beş-bloklu
  görünüşü üstün gəlirdi və köhnə `department` mətni görünməz qalırdı.
  Yalnız `unit.about` BOŞDURSA yazır (üstündən yazma yoxdur), hər üç dil
  ayrıca. Lokalda test edilib: ilk iş 12 yazdı/12 atladı, ikinci iş
  (idempotentlik) 0 yazdı/24 atladı, `publish()` təsdiqləndi (draft deyil,
  ictimai cavabda görünür). **Diqqət:** lokal fixture-də `elmi-sura`
  `department` qeydi ümumiyyətlə yoxdur (yalnız Neon-da) — production-da
  işə salınanda bu bölmə də əlavə yazılacaq.
- **F3.24** `tools/check-menu-links.mjs` (`npm run check:menu`, yalnız
  oxuma). Marşrut cədvəli fayl sistemindən qurulur (əl ilə yazılmır).
  Production nəticəsi: 204 `az` keçid — 101 OK (11 həqiqi səhifə, 90
  `/hazirlanir`), 81 DINAMIK, 21 PLASEHOLDER, **1 QIRIQ**:
  `/sehife/umumi-isler-uzre-prorektor` heç bir `page`-ə uyğun gəlmir.
  `ru`/`en` üçün `menu` single type-ında sətir yoxdur (təsdiqləndi,
  təxmin edilmədi). Alət yazarkən tapılan baq: Strapi single type-da
  olmayan lokal `404` qaytarır — bu, keçici şəbəkə xətası kimi 5 dəfə
  təkrar cəhd edilib bütün skripti çökdürürdü, düzəldildi.

**Push edilməyib** — Zaurun işidir (bax "Commit" bölməsi).

Neon snapshot **var**: `pre-f3-9-person-doc`.

### Növbəti addım

Push → `ABOUT_MIGRATE=true` → deploy → logu yoxla (6-7 bölmə gözlənilir,
`elmi-sura` daxil) → flagı sil → əsasnamələrin yüklənməsi.

### Dil əhatəsi (`npm run check:locale-coverage`, son ölçmə)

i18n **söndürülə bilər** (ru/en məzmun yoxdur, itki riski sıfır):

| Tip | az / ru / en |
|---|---|
| `person` (Heyət) | 162 / 0 / 0 — **edildi (F3.9)** |
| `document` (Sənədlər) | 0 / 0 / 0 — **edildi (F3.20)** |
| `event` (Tədbirlər) | 6 / 0 / 0 |
| `tag` (Etiketlər) | 0 / 0 / 0 |

**TOXUNMA** — ru/en məzmunu var, i18n söndürülsə geri qaytarılmaz itki olar:

| Tip | az / ru / en |
|---|---|
| `unit` (Struktur bölmələr) | 28 / 28 / 28 |
| `article` (Xəbərlər) | 811 / 23 / 17 |
| `announcement` (Elanlar) | 345 / 10 / 6 |
| `page` (Səhifələr) | 42 / 25 / 26 |
| `department` (Kafedralar, köhnə) | 11 / 3 / 10 |
| `milestone` (Mərhələlər) | 14 / 14 / 14 |
| `rector` (Sabiq rektorlar) | 4 / 4 / 4 |
| `program` (Proqramlar) | 4 / 0 / 3 |
| `faculty` (Fakültələr) | 2 / 0 / 2 |

### Məlumat vəziyyəti (son ölçmə)

```
28 bölmə · head az/ru/en 23/28 · about 0/28
162 şəxs · person.unit 126 (78%)
rəhbərlərdə: foto 1/23 · telefon 1/23 · otaq 1/23 · e-poçt 22/23
```

Rəhbərsiz 5 bölmə: Rektor (vakant), Elmi Şura, Elmi işlər üzrə prorektor
(Qocayev işdən ayrılıb — nəşrsiz qalması **doğrudur**), Təlim Tədris Mərkəzi,
Dənizçilik Kolleci.

`«Rəhbərlik»` adlı 6 `roles[].unitName` dəyəri qalır — bölmə deyil, kateqoriyadır.

---

## Əsasnamələr (10 sənəd, yüklənməyib)

| № | Sənəd | Bölmə |
|---|---|---|
| 011 | Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsi | 1 |
| 012 | İnformasiya resurs mərkəzi | 1 |
| 013 | Personalın idarə edilməsi və əmək haqqı şöbəsi | 1 |
| 014 | Kafedralar (ümumi) | **7 kafedra** |
| 015 | Mühasibat uçotu və hesabatı şöbəsi | 1 |
| 016 | Təlim Tədris Mərkəzi | 1 |
| 018 | Mətbəə | 1 |
| 019 | Fakültələr (ümumi) | **2 fakültə** |
| 020 | İNKTİQ | **Personal + Təsərrüfat** |
| 021 | Tədris qeydiyyat şöbəsi *(köhnə ad)* | Tədris proseslərinin təşkili şöbəsi |

009 (daxili audit), 010 (doktorant attestasiyası), 017 (yataqxana) — **nəzərə alınmır**.

Mənbə səhvləri: 019-un başlıq cədvəlində səhvən «İnformasiya resurs mərkəzi»
yazılıb; 021-in sənəd nömrəsi 020 ilə toqquşur. Hər ikisi Word faylındadır.

**Açıq qərar:** fayllar `.docx`/`.doc` formatındadır, spesifikasiyada PDF tələb
olunur. Çevirmə kimdə?

---

## Qalan iş

1. Push (F3.17→F3.24) → `ABOUT_MIGRATE=true` → deploy → logu yoxla → flagı sil
2. Menyu: ru/en Heyət keçidi (F3.9-dan sonra) — `positionRu/En`,
   `academicTitleRu/En`, `bioRu/En` sahələrinin frontend-də göstərilməsi daxil
3. Əsasnamələrin yüklənməsi — sxem və səhifə hazırdır (F3.17/F3.20/F3.22), `titleRu/En` /
   `descriptionRu/En` doldurmaq açıq qalır (mənbə `.docx`/`.doc`, çevirmə kimdə
   sualı hələ açıqdır)
4. Məzmun: fotolar, əlaqə məlumatları, bölmə təsvirləri (`about` 0/28)
5. `STAFF_ARCHIVE` — 22 ayrılmış müəllim hələ saytdadır
6. Menyu keçidlərinin bağlanması — F3.24 real ölçüb: 90 `/hazirlanir`
   (məzmun gözləyir), 21 həqiqi PLASEHOLDER (`#`), **1 QIRIQ**
   (`/sehife/umumi-isler-uzre-prorektor`, `check:menu` bax)
7. Meilisearch plugini `package.json`-dan çıxarılmalıdır (boot-da xəta yazır)
8. F2.7 RAG co-pilot — məzmun boşluqları dolandan sonra

---

## Prinsiplər

- **Əvvəlcə diaqnostika, sonra düzəliş.** Diaqnostika aləti qur, çıxışını istə.
- **Paket idempotent olmalıdır** — ikinci işləmədə dəyişiklik sıfır.
- **Ya tam, ya heç nə.** Yarımçıq tətbiq olunmuş dəyişiklik ən pis nəticədir.
- **Üstündən yazma.** Seed mövcud dəyəri deyil, yalnız boş sahəni doldurur —
  əks halda inzibati vəzifələr (dekan, müdir) itir.
- **Ad uyğunlaşdırması sətir müqayisəsinə bağlanmamalıdır.** Bir dırnaq fərqi
  22 nəfəri səssizcə itirib.
- Səhv olanda **etiraf et və düzəlt** — səbəbi gizlətmə.


## Fakültə həlli

`KAFEDRA_FACULTY` sabiti, `lib/strapi.ts`. Slug uyğunluğu
(unit.slug === faculty.slug) qəsdəndir, F5.6-da sənədləşib.
