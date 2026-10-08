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

## DİZAYN QAYDALARI — hər tapşırıqda təkrar yazılmır, DAİMİDİR

### Bir səhifə, bir en
Bir səhifədə yalnız BİR konteyner eni işlənir (`.container`, 1240px).
Bölmələrin fərqli enlərdə olması QADAĞANDIR. Komponent öz `max-width`
gətirirsə, səhifə kontekstində LƏĞV EDİLİR.

### Vidcet qabığı ≠ səhifə qabığı
`.cx` (23-correction.css) KİÇİK VİDCET üçündür — kənarda, məzmunun
yanında. Tam səhifə forması üçün İŞLƏDİLMİR. Səhifə forması öz
qabığını qurur.

### Kilidli dizayn sistemi
- Şrift: Fraunces (başlıq) + Manrope (mətn). Başqa şrift YOX.
- Rəng: navy #0B3D5C, qızılı #C9A961. Başqa palitra YOX.
- İkon: Tabler şrifti (`ti ti-*`). lucide, Font Awesome, YENİ PAKET YOX.
- Emoji QADAĞANDIR — bütün səhifələrdə.
- Tailwind YOXDUR. Yalnız `_styles/*.css`.
- Boşluq şkalası: 4/8/12/16/24/32/48px (F4.9e).

### Boş məzmun
Boş sahə/blok render OLUNMUR. «—» və ya boş xana ilə doldurulmur.

### Yeni asılılıq
Yeni npm paketi ƏLAVƏ EDİLMİR. Mövcud vasitə kifayət etmirsə,
əvvəlcə soruşulur.

---

## İş qaydaları

### Commit

- **Yalnız lokal commit. Push HƏMİŞƏ Zaurdadır.** Heç vaxt `git push` etmə.
- Commit mesajı **yalnız ASCII**, ingilis dilində, `F3.x: ...` formatında.
- `git add` üçün **`--literal-pathspecs` məcburidir** — `[locale]` qovluq adı joker
  simvol kimi oxunur və fayl əlavə olunmur. Bu, `git`-in ÖZ seçimidir:
  `git --literal-pathspecs add <yol>`. `git add --literal-pathspecs` XƏTA verir.

### Qapılar — dəyişiklikdən sonra MÜTLƏQ

```bash
# Strapi
cd adda-strapi && npx tsc --noEmit -p tsconfig.json
# sxem (schema.json) dəyişibsə ƏLAVƏ olaraq:
npm run build
# admin paneli (src/admin/) dəyişibsə ƏLAVƏ olaraq — server tsconfig-i
# src/admin/-i İSTİSNA edir, yuxarıdakı qapı onu YOXLAMIR:
npx tsc --noEmit -p src/admin/tsconfig.json && npm run build

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
- **`status` adlı sahə Strapi 5-də AYRILMIŞ addır** (qaralama/nəşr vəziyyəti).
  `appeal`/`correction`/`rsvp`-dəki `status` Content Manager-də İŞLƏMİR:
  siyahıda «published» görünür, redaktə formasında yoxdur, `PUT` isə
  400 «Invalid status» qaytarır. Document Service-də normal işləyir. Bu
  statuslar admin «Bildirişlər» səhifəsindən idarə olunur (F5.38,
  `src/utils/admin-inbox.ts` + `src/admin/inbox/`). Yeni tipdə bu adı İŞLƏTMƏ.
- Upload servisi `originalFilename` (kiçik `n`) və `refId` üçün rəqəm ID istəyir.
- **`plugins.ts` əl ilə redaktə olunmamalıdır.**
- **Admin interfeysi Azərbaycancadır, amma dili `en`-dir (F5.39).** `az`
  Strapi-nin `languageNativeNames` siyahısında yoxdur → mətnlər
  `config.translations.en` ÜZƏRİNƏ yazılır (`src/admin/translations/az.ts`,
  ~1960 açar). Strapi yenilənəndə yeni açarlar ingiliscə çıxır: həm
  `translations/en.json`-u, həm kodda olan `id: '…', defaultMessage: '…'`
  açarlarını yoxla. Plagin açarı prefikslidir və hərf həssasdır
  (`cloud.Plugin.name`, `content-type-builder.*`). Nisbi vaxt («3 saat əvvəl»)
  `app.tsx → azRelativeTime()`, `<html lang="az">` isə `keepHtmlLangAz()` ilə.
- **Content Manager sahə adları və qaydaları `src/utils/cm-az.ts`-dədir** (28
  tip + 25 komponent). BİR DƏFƏ yazılır (store `adda-admin` → `cmAz:v1`),
  yalnız defolt adı (sahə adının özü) və boş təsviri əvəz edir — admində
  «Görünüşü tənzimlə»-dən dəyişilən üstündən yazılmır. Yeni sahə əlavə edəndə
  lüğətə də yaz və markeri `cmAz:v2`-yə qaldır.
- **Xüsusi RBAC şərti yalnız `bootstrap()`-da qeydiyyatdan keçir**
  (`conditionProvider.register`, F5.39 `api::adda-page-owner`). Handler
  istifadəçi + `permission` alır, `true` / `false` / filtr (`{slug: {$in}}`)
  qaytarır. Admin interfeysi şərtli icazəni qiymətləndirə bilmir — redaktə
  forması açıq görünür, server isə yadda saxlamağı 403 ilə rədd edir. Ona
  görə yan panel `canEdit`-i serverdə CM `permission-checker` ilə yoxlayır.
- **«Məsul redaktor» rolu BİR DƏFƏ yaradılır** (store `editorRole:v1`).
  Sonra Ayarlar → Rollar-dan dəyişilir; `page-owners.ts`-dəki
  `EDITABLE`/`LISTS` siyahısını dəyişmək mövcud rolu YENİLƏMİR.

### Seed blokları

Hamısı `adda-strapi/src/index.ts` → `bootstrap()` içindədir və env bayrağı ilə
qorunur:

`UNIT_RESEED` · `HEAD_RESEED` · `KAFEDRA_RESEED` · `NAME_CLEAN` · `STAFF_ARCHIVE`
`MENU_RESEED` · `PAGES_RESEED` · `MILESTONE_RESEED` · `RECTOR_RESEED`
`SOCIAL_RESEED` · `LEADERSHIP_RESEED` · `ABOUT_MIGRATE` · `PLAN_SEED`
`PROGRAM_TEXT_SEED` · `HERO_SEED` · `PROGRAM_UPDATE_SEED` · `NEW_PROGRAM_SEED`

**İş qaydası:** `FLAG=true` → deploy → **logu yoxla** → **flagı SİL**.

Bir dəfəlik, admin məzmununu əzməyən yeniləmələr (F5.38+) bayraqsız işləyir:
plugin store marker-i (`adda-inbox` → `cmLayout:v1`; `adda-admin` → `cmAz:v3`,
`editorRole:v1`, `tehsilMenu:v2`, `facultyUnits:v1`, `admissionScores:v1`,
`unitMedia:v1`, `facilitySlugs:v1`, `dedupe:v1`, `unitBlocks:v1`,
`facilitySeed:v1`) + mövcud vəziyyətin yoxlanması. Marker silinmədən təkrar
işləmir.

`FACILITY_SEED` (F5.43-dən): YALNIZ boş bazada, bir dəfə (`facilitySeed:v1`).
Bayraq Render-də qalmışdı və hər deploy-da redaktorun adını dəyişdiyi obyekti
«<slug>-2» qaralaması kimi yenidən yaradırdı. `LEADERSHIP_RESEED` (F5.43-dən)
mətni SƏHİFƏYƏ yox, struktur bölmənin «Haqqında»-sına yazır (rektor, Elmi Şura).

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
- **Vercel funksiyasına gələn sorğu bədəni ≤ 4.5 MB.** Aşanda funksiya işə
  düşmür, Vercel özü `413 FUNCTION_PAYLOAD_TOO_LARGE` qaytarır (cavab JSON
  deyil). Faylı base64 JSON-da göndərmə (×1.37 şişir) — `multipart/form-data`
  göndər, limiti hər iki tərəfdə yoxla (F5.37: müraciət əlavəsi, 4 MB).
- **Marşrut silinəndə `.next/types` köhnə qalır** və `npx tsc --noEmit`
  `Cannot find module '…/page.js'` verir (F5.41). Qovluq keşdir — sil,
  `next dev`/`build` yenidən yaradır. Paket skripti bunu özü edir.
- **Məzmun komponentində `<header>` elementi işlətmə — `<div>` işlət.**
  `02-header.css`-dəki qlobal `header{}` seçicisi (saytın öz başlığı üçün) HƏR
  `<header>`-ə navy gradient, kölgə və `z-index: 90` verir. Öz fonu olmayan
  başlıq göy fonda tünd/boz mətnlə qalır (F5.36: müraciət forması).

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
9. **F5.20a — qəbul balı (F5.42-də HƏLL OLUNUB, aşağıdakı tarixçədir).**
   F5.42: 700-dən böyük bal vergüllü onluq sayılır və 10-a bölünür — həm
   yazılanda (`registerScoreNormalizer`, document middleware), həm bazada
   bir dəfə (`admissionScores:v1`, `src/utils/admission-scores.ts`).
   Admində «227,6» də, «227.6» də düzgün saxlanır. Saytda bal `fmtScore`
   ilə (lib/format.ts): az/ru vergül, en nöqtə. Köhnə qeyd:
   **qəbul balı sahələri əl ilə düzəldilməlidir.** `admission-score`
   komponentində `minScorePaid`/`minScoreFree` `integer` → `decimal` dəyişdi,
   AMMA mövcud korlanmış dəyərlər (onluq nöqtəsi/vergülü admin paneldə
   itib, "370,5" → "3705" kimi yazılıb) AVTOMATIK DÜZƏLMİR. Deploy edildikdən
   sonra Zaur müəllim admin paneldə bu 4 proqramın (21 sətir) ballarını əl
   ilə yenidən yazmalıdır. **Admində NÖQTƏ ilə yazılır: `239.5`.** Admin
   interfeysi `en` dil rejimindədir (F5.39-da da belə qalır — Azərbaycan
   mətnləri `en` üzərinə yazılır) və rəqəm sahəsində vergül MİNLİK ayırıcısı
   sayılır: `239,5` → `2395` (`@internationalized/number`, yoxlanılıb) —
   3705 korlanmasının səbəbi məhz budur. Proqramlar:
   `deniz-naviqasiyasi-muhendisliyi` (5 il), `gemiqayirma-ve-gemi-temiri-muhendisliyi`
   (5 il), `deniz-naviqasiyasi-muhendisliyi-en-eyani` (5 il),
   `gemi-energetik-qurgularinin-istismari-muhendisliyi-en-eyani` (4 il).
10. **F5.39 — Məsul redaktorlar** (`src/utils/page-owners.ts`,
   `src/admin/owners/`, cədvəl `page_owners`). Baş admin admin panelində
   istifadəçi yaradır (rol «Məsul redaktor»), sonra «Məsul redaktorlar»
   səhifəsində menyudakı səhifələrə təyin edir. Açar səhifə ünvanından
   hesablanır (`page:<slug>`, `unit:<slug>`, `path:/xeberler`); Next-də EYNİ
   funksiya var (`lib/page-owner-key.ts`) — biri dəyişəndə o biri də.
   Məktublar Resend ilə gedir (`RESEND_API_KEY` yoxdursa yalnız loga yazılır);
   keçidlər üçün Render env: `ADMIN_PUBLIC_URL` (defolt
   `https://adda-edu-az.onrender.com`), `SITE_URL` (defolt
   `https://demo.adda.edu.az`). Həftəlik xatırlatma: bazar ertəsi 09:00 (Bakı).
   Saytda ad 5 dəqiqəyə qədər gecikmə ilə görünür (keş: Strapi 60 s + Next 300 s).
11. **F5.40 — «Təhsil» menyusu v2** (təhlil: layihə sənədi
   `claude/tehsil-menyusu-optimallasdirma.md`). Prod menyusu
   `src/utils/menu-tehsil.ts` ilə BİR DƏFƏ yenilənir: bayraq YOX, store marker
   `tehsilMenu:v2`; yalnız «Təhsil» köhnə 6 qrupdadırsa (admin dəyişibsə
   toxunulmur, logda xəbərdarlıq). Seed (`src/index.ts` MENU) və
   `lib/menu-fallback.ts` eyni quruluşdadır — yeni etiket = `MENU_T`-yə ru/en.
   Kataloq `/ixtisaslar?tab=<catalogTab>` və `?dil=en` qəbul edir
   (ProgramDirectoryIsland). 3-cü mərhələ (akademik təqvim, qiymətləndirmə
   qaydaları, köçürmə/bərpa, STCW standartları) «Məsul redaktorlar»-da
   «Menyuda yoxdur» kimi gözləyir: səhifə dərc olunanda «Tədris prosesi»
   qrupu menyuya əl ilə (və ya yeni miqrasiya ilə) əlavə olunur.
12. **F5.41 — fakültənin YEGANƏ səhifəsi `/struktur/<slug>`-dir** (unit).
   `/fakulteler/[slug]` silindi, `next.config.js` 301 ilə `/struktur/<slug>`-ə
   aparır (köhnə sayt `faculty/N` də birbaşa ora — `gen-redirects.mjs`).
   `/fakulteler` SİYAHISI qalır, kafedralar nümunəsi ilə bölmələrdən qurulur
   (`getFacultyUnits`: unit, slug `…-fakultesi`). Proqram səhifəsində fakültə
   adı/keçidi də bölmədəndir. «2. Akademiya — Fakültə» **arxivdir, silinmir**
   (proqram/xəbər/heyət əlaqələri, kopilot mətni): admin menyusunda «(arxiv)»,
   «Məsul redaktor» sistemində yoxdur, sayt axtarışı fakültəni bölmədən tapır.
   Birdəfəlik (`facultyUnits:v1`, `src/utils/faculty-units.ts`): boş bölməyə
   fakültə mətni (təmizlənmiş), `faculty:<slug>` təyinatları → `unit:<slug>`,
   kopilot parçalarının ünvanı. Açıq qalan: kopilot fakültəni hələ arxiv
   qeydindən oxuyur (`rag/lib/chunk.ts`) — bölmələr kopilot mənbəyi deyil.
13. **F5.42 — bölmə səhifəsi ixtisas səhifəsi quruluşundadır**
   (`struktur/[slug]`): fakt zolağı (kafedrada «Fakültə» keçidi, «İxtisas»
   sayı), əsas foto, hər sahə öz açıq `<section id>`-i + mündəricat
   (`ProgramToc`, mobil + yan panel), «İxtisaslar» kartları
   (`getUnitPrograms`: `program.unit` = bölmə və ya alt bölmələri;
   fakültədə + köhnə `program.faculty`), qalereya (`GalleryIsland bare`).
   F4.10-un akkordeon qrupu LƏĞV EDİLİB. Sxem: `unit.photo` (tək) və
   `unit.gallery` (çox), dillər üzrə eyni; admin formasında «Haqqında»-dan
   sonra (`unitMedia:v1`). Yuxarı sətir tipi slug-dandır (`unitTypeBySlug`,
   bütün dillərdə). İxtisas fakt zolağında `highlights` təkrarı atılır
   («təhsil müddəti», «ECTS krediti», «təhsil forması»), «kredit X» etiketi
   «X: N kredit» olur (`factHighlights`) — məlumat Strapi-də dəyişmir.
14. **F5.43 — təkrarlar, auditoriyalar, blok başlıqları.**
   - **Səhifə ↔ bölmə:** eyni məlumatın iki ünvanı (`/sehife/x` və
     `/struktur/y`) — kanonik bölmədir. Siyahı: `src/utils/moved-pages.ts`
     (`PAGE_UNIT_MOVES`; SİNXRON: `next.config.js` `PAGE_UNIT_MAP`,
     `tools/migration/gen-redirects.mjs` `MOVED`). Rektor və Elmi Şura
     mətni bölmənin boş «Haqqında»-sına köçüb; elmi katib, rektorun köməkçisi,
     iki prorektor üçün köhnə ru/en tərcümeyi-halı səhifələri sadəcə dərcdən
     çıxıb. Yeni belə cüt tapılsa: siyahıya əlavə et + yeni marker (`dedupe:v2`).
   - **Köhnə «Kafedra» (`department`) arxivdir:** saytda göstərilmir
     (`/struktur/[slug]` fallback-i silindi), axtarışda bölmə (`unit`)
     axtarılır. Admin menyusunda «(arxiv)».
   - **/auditoriyalar:** slug-ı boş obyekt atılmır — açar `slug || documentId`
     (`facilityKey`), detal səhifəsi documentId ilə də tapır. Strapi yazılanda
     boş və ya «facility» slug-ı otaq + addan doldurur (`registerFacilitySlugFill`).
   - **Bölmə blokları:** `unit.blockSettings` (standart blokun başlığı /
     gizlədilməsi; açarlar `UnitBlockKey`, Strapi enum-u ilə EYNİ) və
     `unit.extraBlocks` (başlıq + mətn + yer: `basda`, blok açarı, `sonda`),
     dil üzrə. Gizli blok admində «boş blok» kimi təklif olunmur.
   - **«İxtisaslar» bloku:** alt bölmələrin ixtisasları YALNIZ fakültədə
     (rektorun alt bölməsi kollecdir).

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


## Mövcud kodu yoxlamadan iddia etmə

Bir funksiyanın «olmadığını» yazmazdan ƏVVƏL axtar:
  grep -rn "<açar söz>" adda-nextjs/app adda-nextjs/lib

Komponentlər `app/_components/` altında yaşayır — səhifə faylında
olmaması «yoxdur» demək DEYİL.

## Komponent xəritəsi (struktur səhifəsi)

  ExpandBlock.tsx     akkordeon — başlığın özü açardır (F4.8a)
  ContentPage.tsx     sehife/ixtisaslar/fakulteler üçün ümumi gövdə
                      + az fallback bildirişi (F3.28)
  getUnitArticles()   lib/strapi.ts — hibrid xəbər filtri:
                      $or[unit][slug] + $or[tags][slug] (F3.21)
  isAdmin / adminUrl  səhifədə admin bəzəkləri (F4.9b)

## Sluq uydurma

Yoxlama sluqları `npm run check:units` çıxışından götürülür.
`unit` və `department` sluqları oxşardır, amma FƏRQLİDİR:
  unit:       muhasibat-ucotu-ve-hesabati-sobesi
  department: muhasibat-ucotu-ve-hesabat-sobesi

Fakültə həlli: `KAFEDRA_FACULTY` sabiti, `lib/strapi.ts`. Slug uyğunluğu
(unit.slug === faculty.slug) qəsdəndir, F5.6-da sənədləşib. F5.41-dən
fakültənin səhifəsi YALNIZ `/struktur/<slug>`-dir — `/fakulteler/<slug>`
yaratma (bax «Qalan iş» 12).