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
# CSS-də rəng/fon və ya komponentin sinfi dəyişibsə (F5.49, bax «Next.js» tələləri):
npm run gen:contrast && npm run gen:contrast -- --check
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
- **`strapi.db.query().update()` `updatedAt`-ı HƏMİŞƏ indiki vaxta qoyur**
  (@strapi/database timestamps abunəçisi verilən dəyərin üstündən yazır). Mexaniki
  düzəliş (F5.53 telefon) redaktə tarixini dəyişməməlidir: yoxsa `section-pages.ts`
  sonrakı miqrasiyada səhifəni «redaktor dəyişib» sayıb atlayır, admində qaralama
  «Dəyişdirilib» görünə bilər. `updateMany({ where: { id }, data: { ...d, updatedAt: köhnə } })`
  — obyekt datada vaxt qoyulmur.
- **Admin interfeysi Azərbaycancadır, amma dili `en`-dir (F5.39).** `az`
  Strapi-nin `languageNativeNames` siyahısında yoxdur → mətnlər
  `config.translations.en` ÜZƏRİNƏ yazılır (`src/admin/translations/az.ts`,
  ~1960 açar). Strapi yenilənəndə yeni açarlar ingiliscə çıxır: həm
  `translations/en.json`-u, həm kodda olan `id: '…', defaultMessage: '…'`
  açarlarını yoxla. Plagin açarı prefikslidir və hərf həssasdır
  (`cloud.Plugin.name`, `content-type-builder.*`). Nisbi vaxt («3 saat əvvəl»)
  `app.tsx → azRelativeTime()`, `<html lang="az">` isə `dom-guard.ts → keepHtmlLangAz()` ilə.
- **Admin brauzerdə tərcümə OLUNMAMALIDIR (F5.52).** Chrome/Edge «Tərcümə et»
  mətn düyünlərini `<font>`-la əvəz edir, React öz düyününü silə bilmir:
  «Failed to execute 'removeChild' on 'Node'» → ekran «Xəta baş verdi»
  (tərcümə olunmuş ekranda xəta mətni də Azərbaycancaya çevrilir, «Strapi's GitHub»
  → «Strapi'nin GitHub-u» — tanınma əlaməti). `src/admin/dom-guard.ts` admin modulu
  yüklənəndə (register-dən ƏVVƏL, brauzer dili load-dan sonra təyin edir):
  `<html translate="no" class="notranslate">`, `<meta name="google" content="notranslate">`,
  `lang="az"` və ehtiyat qoruyucu (`removeChild`/`insertBefore` kənar DOM
  dəyişikliyində xəta atmır, konsola `[adda]` xəbərdarlığı). Statik
  `index.html`-i Strapi özü yaradır (`DefaultDocument`, `lang="en"`) — ona
  toxunmaq lazım deyil. Reproduksiya: tərcüməçi modeli ilə ilk qeydi açanda çökür.
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
plugin store marker-i (`adda-inbox` → `cmLayout:v1`; `adda-admin` → `cmAz:v5`,
`editorRole:v1`, `tehsilMenu:v2`, `facultyUnits:v1`, `admissionScores:v1`,
`unitMedia:v1`, `facilitySlugs:v1`, `dedupe:v1`, `unitBlocks:v1`,
`facilitySeed:v1`, `qebulMenu:v1`, `qebulMenu:v2`, `qebulPages:v1`,
`pageLayout:v1`, `tehsilMenu:v3`, `tehsilPages:v1`, `cmAz:v6`, `elmMenu:v1`, `elmPages:v1`,
`dedupe:v2`, `cmAz:v7`, `telebeMenu:v1`, `beynelxalqMenu:v1`, `telebePages:v1`,
`beynelxalqPages:v1`, `dedupe:v3`, `cmAz:v8`, `cmAz:v9`, `faqMenu:v1`, `ascoMenu:v1`,
`audienceMenu:v1`, `faqPage:v1`, `ascoPage:v1`, `gizClean:v1`, `orgBlock:v1`,
`cmAz:v10`, `homeLayout:v1`, `homePage:v1`, `homeQuote:v1`, `homeLayout:v2`, `cmAz:v11`,
`certBlock:v1`, `certLayout:v1`, `certMenu:v1`, `certImages:v1`, `newsImport:v1`,
`eventsF551:v1`, `structOrder:v1`, `phoneFix:v1`, `legalPages:v1`, `corpPage:v1`, `cmAz:v12`,
`esasnameDocs:v1`, `nizamname:v1`, `esasnamePages:v1`, `esasnameUnits:v1`, `esasnameLinks:v1`,
`esasnameMenu:v1`, `cmAz:v13`, `cmAz:v14`, `poliklinika:v1`, `eAkademiya:v1`, `tercume:v1`
(irəliləyiş `tercume:done`, `tercume:tries`), `qaydaDocs:v1`, `qaydaPages:v1`, `qaydaText:v1`,
`qaydaLinks:v1`, `qaydaMenu:v1`, `cmAz:v15`;
sayğaclar `legacyImport:tries`, `corpPage:tries`, fayl xəritəsi `legacyFiles:v1`;
F5.56 son deploy-un commit-i `siteRevalidate:commit` — marker deyil, sayt yeniləməsi üçün) + mövcud
vəziyyətin yoxlanması. Marker silinmədən təkrar işləmir.

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
  başlıq göy fonda tünd/boz mətnlə qalır (F5.36: müraciət forması; F5.49-da
  düzəliş forması, kimlik və kopilot başlıqları — mətn görünmürdü).
- **Yüksək kontrast faylı (`43-a11y.css`) GENERATORDUR** (`tools/gen-contrast-css.mjs`,
  F5.49). BÜTÜN `color` qaydalarını `html[data-contrast="high"]` altında eyni
  sıra ilə təkrarlayır (kaskad, :hover və aktiv hallar saxlanır), zəifləri
  fona görə düzəldir (≥ 7:1). Fonu CSS-dən + JSX iç-içəliyindən (TypeScript
  parseri) tapır. **CSS-də rəng dəyişib generator işlədilməsə, kontrast
  rejimində KÖHNƏ rəng qalır** — `npm run gen:contrast`; qapı `-- --check`.
  Foto fonlu yeni bölmə (rəngi CSS-də olmayan) → generatorda `DARK_EXTRA`.
- **Şrift böyütmə** (F5.49): `html` font-size × `--fs-scale` (0.9–1.3), məzmun
  CSS-də `font-size: calc(Npx * var(--fs-scale))`. Üst menyu zolağı
  (`02-header.css`, `17-header-mega.css`, `.mainnav>.nav-mega>a`) BÖYÜMÜR — yer
  yoxdur. `rem` özü böyüyür: `.container`-in px boşluğuna (40/24px) bağlı
  mənfi kənar/boşluğu `rem` ilə yazma (130%-də üfüqi sürüşmə).
- **`.container` + öz sinif:** öz sinifdə `padding: X 0 Y` konteynerin yan
  boşluğunu sıfırlayır (mobildə mətn kənara yapışır, F5.49: `aud-wrap`,
  `na-head`) — `padding-top`/`padding-bottom` yaz.

### Render / Neon

- Pulsuz plan **fəaliyyətsizlikdən sonra yatır**; cron-job.org hər 10 dəqiqədə
  `/_health`-i döyəcləyir. Buna baxmayaraq yoxlayıcılarda **isinmə fazası** var.
  `/_health` bazaya getmir — Neon-u oyatmır.
- **Neon pulsuz kvotası (F5.56).** Kompüt saatı bitəndə baza söndürülür, Strapi
  `Your account or project has exceeded the quota` ilə dayanır və Render onu
  dövri yenidən başladır. Neon sorğu olmayanda 5 dəqiqə sonra yatır — yatmağa
  imkan verən hər şey qoruyulmalıdır: **saytın keşi gündəlikdir** (`lib/strapi.ts`
  `STRAPI_TAG`, marşrutlar `revalidate = 86400`, ana səhifə 3600; `strapiFetch`-ə qısa
  müddət YAZMA — səhifə ən qısa fetch-in müddətini götürür), dəyişiklik
  sayta Strapi-nin `POST /api/revalidate` çağırışı ilə çıxır (`src/utils/site-revalidate.ts`,
  env `REVALIDATE_SECRET` Render + Vercel-də EYNİ). Klient adası Strapi-yə
  birbaşa GET etməməlidir (keşli Next marşrutu: `/api/reactions`, `/api/page-owners`);
  admin sorğusu boş qalanda dayanır (`src/admin/inbox/store.ts`); Strapi-də
  dövri baza işi (setInterval, tez-tez cron) yazılmamalıdır. Yeni növ saytda
  görünürsə → `SITE_TYPES`-a əlavə et.
- SMTP portları (25/465/587) **səssizcə bloklanır** — Resend işlədilir.
- «Clear build cache» **lazımsızdır** və pulsuz planda build-i 20+ dəqiqəyə çıxarır.

### Cloudinary

- **PDF çatdırılması** 15.10.2026-da bağlı idi (`image/upload/…pdf` → 401, `x-cld-error:
  deny or ACL failure`); **22.10.2026 yoxlanılıb — açılır** (konsolda «Allow delivery of
  PDF and ZIP files» qoşulub). Yenidən 401 olarsa həll kodda deyil: Cloudinary konsolu →
  Settings → Security. Şəkil, `.ai`, `raw/upload` (DOCX, PPTX, CDR) işləyir.

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

## Əsasnamələr (ADDA-ƏS-001…021, F5.54)

Media kitabxanası, qovluq «Əsəsnamələr»: 21 fayl (KİS sənədləri, ISO 9001:2015; fayl
adında kod — «+ADDA-ES_009_-_24_…», `esasnameler.ts` → `codeOf`). Hər birinə «1. Məzmun —
Sənəd» qeydi (kateqoriya «esasname», başlıq «… (ADDA-ƏS-0NN)»). Bölmənin öz əsasnaməsi
bölməyə bağlıdır (bölmə səhifəsində «Sənədlər»), qalanları «Səhifə» (`url`) sahəsi ilə
səhifəyə; hamısı `/sehife/struktur-bolmelerin-esasnameleri` reyestrindədir
(`dataBlock=esasnameler`, `RegulationList.tsx`). Xəritə: `esasname-content.ts` → `REGULATIONS`.

| Kod | Sənəd | Hara |
|---|---|---|
| 001 | Himayədarlar Şurası | /sehife/himayeciler-surasi |
| 002 | Məzunlar Assosiasiyası (nizamnamə) | /sehife/mezunlar-assosiasiyasi |
| 003, 004 | Tədris-metodiki komissiya, Şura | /sehife/tedris-metodiki-sura |
| 005, 006 | «İlin tələbəsi», «Ən yaxşı müəllim» | /sehife/ilin-telebesi, /sehife/en-yaxsi-muellim |
| 007 | Buraxılış yekun dövlət attestasiyası | /sehife/yekun-dovlet-attestasiyasi |
| 008, 010, 017 | Təcrübə, doktorant attestasiyası, yataqxana | mövcud səhifələr |
| 009 | KİS Daxili Audit Komissiyası | /sehife/keyfiyyet-idareetme-sistemi |
| 011–016, 018–021 | Bölmələr (014 — 7 kafedra, 019 — 2 fakültə, 020 — personal + təsərrüfat, 021 — tədris proseslərinin təşkili şöbəsi) | bölmə |

Mənbə səhvləri (fayllarda, saytda düzəldilməyib): 004 prod-da «Elmi Şuranın əsasnaməsi»
adı ilə Elmi Şuraya bağlanmışdı (F5.54 düzəldir); 001 «Himayədarlar», Nizamnamə
«Himayəçilər» deyir, üzv sayını 001 vermir, Nizamnamə 5 nəfər (4.6) — sayt Nizamnaməyə
uyğundur; 016-da təsdiq «AXDG QSC-nin sədri» (ASCO şablonundan qalıb); 016, 017, 018-də
Elmi Şuranın təsdiq tarixi və protokolu boşdur, 015-də təsdiq sətri yoxdur; 019-un başlıq cədvəlində səhvən «İnformasiya resurs mərkəzi»;
021-in sənəd nömrəsi 020 ilə toqquşur. Hamısı az dilindədir — `titleRu/En` boşdur.

---

## Qaydalar və təlimatlar (ADDA-TL, ADDA-ƏP, F5.57)

Media kitabxanası, qovluqlar «Qaydalar» (TL-010…027, 19 fayl) və «Təlimat» (TL-001…009,
ƏP-001…004, 15 fayl). Kod fayl adındadır («ADDA_-TL-024…», «ADDA-EP-003…»; `qaydalar.ts` →
`ruleCodeOf`). Hər sənədə «1. Məzmun — Sənəd» qeydi: qaydalar — kateqoriya `qayda`,
təlimat və prosedurlar — `telimat`, başlıq «… (ADDA-TL-0NN)» / «… (ADDA-ƏP-00N)», qısa
təsvir. Hamısı `/sehife/qaydalar-ve-telimatlar` reyestrindədir (`dataBlock=qaydalar`,
`RegulationList.tsx kind="qayda"`, iki qrup). Xəritə: `qaydalar-content.ts` → `RULE_DOCS`.

| Kod | Sənəd | İzah olunduğu səhifə |
|---|---|---|
| TL-027, TL-003 | Kredit sistemi qaydaları, tədris prosesinin təşkili | /sehife/kredit-sistemi |
| TL-017, TL-020 | İmtahanlar, ingilis dili imtahanları | /sehife/qiymetlendirme-ve-imtahan-qaydalari |
| TL-026, TL-025 | Yay semestri, əlavə kəsir qrupları | /sehife/yay-semestri-ve-elave-kesir |
| TL-024, TL-023 | Kreditlərin tanınması (bərpa, köçürmə…; subbakalavr) | /sehife/kocurme-ve-berpa |
| TL-021, TL-022 | Diplomqabağı təcrübə, qiyabidə təcrübədən azad olunma | /sehife/diplomqabagi-tecrube |
| TL-018 | Dövlət imtahanının keçirilməsi | /sehife/yekun-dovlet-attestasiyasi («İmtahan günü») |
| TL-001, 004–008, ƏP-002, ƏP-004 | Tədris planı, dərs növləri, trenajor, distant | /sehife/tedrisin-teskili |
| ƏP-003 | Diplom, transkript, dublikat | /sehife/diplom-ve-transkript |
| TL-010 | Antiplagiat | /sehife/akademik-durustluk |
| TL-012 | Daxili intizam qaydaları | /sehife/daxili-intizam-qaydalari |
| TL-013, TL-015 | Fəxri doktor, fəxri professor | /sehife/fexri-adlar |
| TL-016 | «Qaynar xətt» | /sehife/muracietlere-baxilma-qaydasi |
| TL-019 | İşə qəbul | /sehife/ise-qebul-qaydalari |
| TL-011 | Əcnəbilərin hazırlıq kursları | /sehife/ecnebi-telebelerin-qebulu-qaydalari |
| TL-014 | KİS işçi qrupu | /sehife/keyfiyyet-idareetme-sistemi |
| TL-002, ƏP-001 | Qısamüddətli kurslar, istehlakçılarla iş | TTM bölməsi |

Mənbə uyğunsuzluqları (fayllarda, saytda düzəldilməyib): TL-008-in faylı «ADDA-TL-009…» adı
ilə yüklənib (sənədin özündə TL-008 — `fileCode: 9`); TL-012-nin iki variantı var — bağlanan
«Daxili intizam qaydaları» (28.01.2025), ikincisi «daxili_nizamdocx» bağlanmır; TL-006 üç
dəfə yüklənib (bağlanan PDF); apellyasiya müddəti ƏS-007-də «1 iş günü, rektora», TL-018-də
«elan günü, apellyasiya komissiyasına» — YDA səhifəsində ƏS-007 saxlanılıb; TL-018 nəzəri
suala hazırlığı həm 20, həm 30 dəqiqə yazır (saytda yazılmayıb); davamiyyət həddi TL-027-də
bakalavr qiyabi 20%, TL-012-də bakalavr 15% / magistr və təkrar ali 20%; TL-017-də yazılı-şifahi
imtahan «ADDA-ƏS-009»-a istinad edir (ƏS-009 KİS audit komissiyasıdır); TL-016 «Qaynar xətt»
üçün (012) 493 09 19 və akademiya@asco.az verir (saytın ümumi ünvanı info@adda.edu.az);
əcnəbi bələdçisində hazırlıq kursu «6 və ya 12 ay» idi, TL-011 — 6 və ya 9 ay (düzəldildi).
Eyni adlı «Praktiki məşğələ və trenajor hazırlığı təlimatı» sənədi (fayl «pasport 308.docx»,
«diger») otaq pasportudur — toxunulmayıb. Hamısı az dilindədir.

---

## Qalan iş

1. Push (F3.17→F3.24) → `ABOUT_MIGRATE=true` → deploy → logu yoxla → flagı sil
2. Menyu: ru/en Heyət keçidi (F3.9-dan sonra) — `positionRu/En`,
   `academicTitleRu/En`, `bioRu/En` sahələrinin frontend-də göstərilməsi daxil
3. Əsasnamələr (F5.54), qaydalar və təlimatlar (F5.57) yüklənib və bağlanıb —
   `titleRu/En` / `descriptionRu/En` və yeni səhifələrin ru/en mətni açıq qalır
   (Gemini kvotası, bax 28)
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
   Saytda ad dərhal yenilənir (F5.56: təyinat → `POST /api/revalidate`), ən gec 1 saat (`/api/page-owners` keşi).
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
15. **F5.44 — «Qəbul» menyusu, 1-ci mərhələ** (təhlil: layihə sənədi
   `claude/qebul-menyusu-optimallasdirma.md`). `src/utils/menu-qebul.ts`, BİR
   DƏFƏ (`qebulMenu:v1`), yalnız «Qəbul» köhnə 4 qrupdadırsa; footer-in «Qəbul»
   sütunu da yalnız köhnə 4 keçiddirsə. Zəncirdə F5.43 `dedupe:v1` və F5.40-dan
   SONRA — menyuya yazan iki miqrasiya eyni anda işləməməlidir. 4 qrup /
   12 keçid, hamısı işləyən səhifəyə; başlıq `/bunlar-ucun/abituriyentler`
   (`lib/audiences.ts` qrupları menyu ilə eynidir). Seed, `lib/menu-fallback.ts`
   eyni quruluşdadır, yeni etiketlər `MENU_T`-də. 2-ci və 3-cü mərhələnin
   səhifələri (`QEBUL_PENDING_PAGES`: tibbi müayinə, qəbul təqvimi, qeydiyyat,
   suallar, haqq, viza, açıq qapı, kollec, təkrar ali) «Məsul redaktorlar»-da
   «Menyuda yoxdur» kimi gözləyir — dərc olunanda menyuya əl ilə və ya yeni
   miqrasiya (`qebulMenu:v2`) ilə əlavə olunur. «Əlaqə» keçidi qəbul
   komissiyasının əlaqəsi verilənə qədər `/elaqe`-dir.
   `npm run check:audiences` sorğulu keçidi (`?tab=`) və bölmə seed-ini tanıyır.
16. **F5.45 — «Qəbul» səhifələri sağ panelli şablonda** (2-ci və 3-cü mərhələ,
   təhlil: eyni layihə sənədi).
   - **Şablon:** `page.layout` (`standart` | `bolmeli` | `qebul`) və
     `page.dataBlock` — dil üzrə EYNİ (non-localized). `bolmeli`/`qebul` →
     `app/_components/SectionPage.tsx` (ixtisas səhifəsi kimi): mətn `## `
     başlıqlarından `<section id>` + mündəricat, hero-da fakt zolağı
     (`page.facts`, komponent `page.fact`), «Qəbul trayektoriyası»
     (`page.steps`, `page.step`; `track` doludursa bir neçə yol), suallar
     (`page.faq` = `unit.faq`), yan panel: kataloq xülasəsi, «Sual ver»
     (`/vetendaslarin-muracieti?istiqamet=qebul`), `sideLinks`, `contact`.
     `standart` — köhnə `ContentPage`.
   - **Canlı blok** (`dataBlock`): pillə cədvəli, `qebul_cedveli` (bütün
     pillələr + keçid balı illəri), `ingilis` (EN dili/yeri olan ixtisaslar),
     `aciq_qapi` (adında «açıq qapı» olan tədbir + xəbər; qeydiyyat
     `/tedbirler/<slug>#qeydiyyat`). Rəqəmlər ixtisas kataloqundandır
     (`lib/admission.ts`) — səhifə mətninə yer sayı/bal YAZILMIR.
   - **Miqrasiya** `src/utils/qebul-pages.ts` (məzmun `qebul-pages-content.ts`),
     BİR DƏFƏ (`qebulPages:v1`): 12 səhifə yaradılır və ya yenidən qurulur
     (köhnə başlıq/mətn store-da `qebulPages:backup:<slug>:<locale>`);
     9.10.2026-dan sonra redaktə olunan dil TOXUNULMUR. ru/en yalnız iki əcnəbi
     səhifəsində yazılır; digərlərinin dərc olunmuş ru/en sətri köhnə mətn və
     köhnə şablonda qalır (yenidən dərc olunanda yeni şablona keçir). Təkrar
     ali haqqı 2500/2700 qalıbsa → `3800 AZN/il`. F5.44-ün 6 gözləyən
     «Məsul redaktorlar» sətri (tibbi müayinə, təqvim, qeydiyyat, suallar,
     haqq, viza) redaktorsuzdursa silinir — mövzu pillə səhifələrinin
     içindədir. `PAGES_RESEED` bu 12 səhifəyə toxunmur.
   - **Menyu v2** (`qebulMenu:v2`, `menu-qebul.ts`, v1-dən SONRA): yalnız
     «Qəbul» F5.44 və ya köhnə quruluşdadırsa (əks halda logda xəbərdarlıq,
     marker yazılmır). 12 keçidin hamısı qəbul səhifəsinə; «Tanışlıq və əlaqə»
     = «Açıq qapı günləri» + «Onlayn müraciət» (Valideynlər «Bunlar üçün»-də
     qalır; `/elaqe`-də «Abituriyent» → onlayn müraciət). Seed, fallback,
     `audiences.ts` eyni quruluşdadır.
   - **Vaxt:** sayt tarix/saatı Bakı vaxtı ilə göstərir (`lib/format.ts`,
     UTC+4; Vercel serveri UTC-dədir). Haqq `fmtFee` ilə («3800 AZN/il»).
     Admin: `cmAz:v4` (yeni sahə adları), `pageLayout:v1` (yeni sahələrin yeri).
17. **F5.46 — «Təhsil» səhifələri eyni şablonda** (təhlil: layihə sənədi
   `claude/tehsil-menyusu-optimallasdirma.md`).
   - **Şablon `layout=tehsil`:** SectionPage-də «Təhsil» qırıntısı (`/ixtisaslar`)
     və «Sual ver» → `?istiqamet=tedris` (Tədris ofisi). Fakt ikonlarına
     `gemi`, `kitab` əlavə olundu. Admin qaydaları `cmAz:v5`-dədir: v4 mətni
     YALNIZ admində dəyişdirilməyibsə yenilənir (`applyAzFieldUpgrades`).
   - **Miqrasiya** `src/utils/tehsil-pages.ts` (`tehsilPages:v1`, qayda F5.45-dəki
     kimi, ehtiyat `tehsilPages:backup:…`): 5 səhifə — təcrübə, tədris gəmisi,
     ixtisasartırma və xaricdə təhsil, kitabxana, keyfiyyət (ru/en: təcrübə,
     gəmi, keyfiyyət). İki bölmə (`tehsil-units-content.ts`): TTM (kurslar
     mövzu və STCW qaydası üzrə, akkreditasiya, trenajorlar) və Tədris ofisi
     (tələbə xidmətləri, funksiyalar) — yalnız az; keçid/sual/bina yalnız
     boşdursa, blok başlığı yalnız ayarı olmayan bloka. F5.40-ın «STCW
     standartları» gözləyən sətri silinir (mövzu təcrübə və TTM-dədir).
     `PAGES_RESEED` bu 5 səhifəyə də toxunmur.
   - **Menyu v3** (`tehsilMenu:v3`, `menu-tehsil.ts`): yalnız «Təhsil» F5.40
     quruluşundadırsa. Bakalavriat/Magistratura/Doktorantura kataloqun pillə
     tabına (`?tab=bakalavr|magistr|doktorantura`) — `/sehife/bakalavriat` və s.
     F5.45-dən QƏBUL səhifəsidir; kataloqda tabın altında həmin qəbul səhifəsinə
     keçid var. «Struktur və keyfiyyət» → «Tədris prosesi və keyfiyyət»
     (Tədris ofisi, E-Kitabxana, Keyfiyyət). Fakültələr və Kafedralar
     təşkilati quruluşdur → «Akademiya → Rəhbərlik və idarəetmə»
     («Təşkilati struktur»-dan sonra). Footer «Təhsil» kataloqa. Seed,
     fallback eyni; F5.40 v2 seed-dən gələn v3 bazanı «artıq yeni» sayır.
   - **Keçidlər:** redaktor mətnindəki «/…» keçidinə dil prefiksi həm
     səhifədə, həm bölmə səhifəsində (`lib/md-links.ts`); bölmənin
     «Onlayn xidmətlər» və «Faydalı linklər» düymələri daxili ünvanda
     eyni vərəqdə açılır.
18. **F5.47 — «Elm və innovasiya» menyusu və səhifələri** (təhlil: layihə sənədi
   `claude/elm-menyusu-optimallasdirma.md`).
   - **Menyu v1** (`elmMenu:v1`, `src/utils/menu-elm.ts`): yalnız «Elm və
     innovasiya» köhnə 5 qrup / 19 keçid quruluşundadırsa (əks halda logda
     xəbərdarlıq, marker yazılmır). 4 qrup / 10 keçid, hamısı işləyən səhifəyə;
     başlıq `#` → `/sehife/elmi-tedqiqat-fealiyyeti`. «Elm Portalı (CRIS)» xarici
     keçiddir (cris.adda.edu.az). Məzmunu olmayan 4 mövzu (dissertasiya
     şuraları, mükafatlar, konvensiyalar fondu, Tədris-Metodiki Şura)
     «Məsul redaktorlar»-da «Menyuda yoxdur». Seed, fallback eyni; yeni
     etiketlər `MENU_T`-də.
   - **Şablon `layout=elm`:** «Elm və innovasiya» qırıntısı (ana səhifənin özündə
     yoxdur), «Sual ver» → `?istiqamet=elm` (müraciət formasında 5-ci istiqamət —
     Elmi-tədqiqat və beynəlxalq əlaqələr şöbəsi). Canlı blok `dataBlock=konfrans`:
     adında «konfrans» olan tədbirlər və elmi konfrans xəbərləri (`getTitleFeedEvents/News`,
     açar sözlər `lib/strapi.ts` → `TITLE_FEEDS`; «təlim-konfrans» düşmür).
     Fakt ikonları: `laboratoriya`, `konfrans`, `beynelxalq`. Admin: `cmAz:v6`.
   - **Səhifələr** (`elmPages:v1`, `src/utils/elm-pages.ts`, məzmun
     `elm-pages-content.ts`, qayda F5.46 kimi, ehtiyat `elmPages:backup:…`):
     ana səhifə, laboratoriyalar, «Elmi Əsərlər» jurnalı (arxiv 2018–2025,
     tərtib qaydaları), gənc alimlər, elmi konfranslar, YENİ «Qrantlar və
     müsabiqələr» — hamısı az/en/ru. Redaksiya heyətinin adları və Gənc Alimlər
     Şurasının sədri yazılmayıb (rəhbərlik dəyişib) — redaksiya təsdiq edəndən
     sonra admində. CJMSE saytına keçid ISSN alınandan sonra.
   - **Təkrarlar v2** (`dedupe:v2`): «Elmi-tədqiqat qrupu» → şöbənin bölmə
     səhifəsi, «Elmi jurnalımız onlayn versiyada» → «Elmi jurnal»
     (`PAGE_PAGE_MOVES`, SİNXRON: `next.config.js` `PAGE_PAGE_MAP`,
     `gen-redirects.mjs` `MOVED`); səhifələr dərcdən çıxır, «Məsul redaktor»
     yeni ünvana (yeni adla). Zəncir: menyu → səhifələr → təkrarlar.
19. **F5.48 — «Tələbə həyatı» və «Beynəlxalq əlaqələr» menyuları və səhifələri**
   (təhlil: layihə sənədi `claude/telebe-ve-beynelxalq-menyulari.md`).
   - **Menyular v1** (`telebeMenu:v1`, `beynelxalqMenu:v1`,
     `src/utils/menu-telebe-beynelxalq.ts`): yalnız kateqoriya köhnə quruluşdadırsa
     (Tələbə 4 qrup / 15 keçid, Beynəlxalq 5 qrup / 14 keçid; əks halda logda
     xəbərdarlıq, marker yazılmır). Hər biri 3 qrup / 9 keçid, hamısı işləyən
     səhifəyə; başlıq `#` → `/sehife/telebe-heyati`, `/sehife/beynelxalq-emekdasliq`.
     Footer «Universitet» → «Tələbə həyatı» yalnız hələ `/hazirlanir/...`-dırsa.
     Psixoloji dəstək və tibb xidməti «Məsul redaktorlar»-da «Menyuda yoxdur».
     Seed, fallback eyni; yeni etiketlər `MENU_T`-də.
   - **Şablonlar `telebe`, `beynelxalq`:** SectionPage-də şablon fərqləri bir
     yerdədir — `SECTION_CFG` (üst sətir, qırıntı, «Sual ver»); yeni şablon üçün
     `page.tsx`-ə toxunmaq lazım deyil. «Sual ver»: tələbə — forma istiqamətsiz,
     beynəlxalq — `?istiqamet=beynelxalq` (6-cı istiqamət, şöbə elm ilə eyni).
   - **Canlı bloklar** (`lib/strapi.ts` → `TITLE_FEEDS`, mətnlər SectionPage →
     `FEED_TEXT`): `tedbirler` (Akademiyanın növbəti tədbirləri + başlığında
     «tələbə» olan xəbərlər), `idman`, `medeniyyet`, `beynelxalq` (yalnız xəbər;
     boşdursa blok görünmür). Lentdə az-a qayıdan tədbir/xəbər öz dilinin ünvanında
     açılır (`/az/xeberler/...` — əvvəl en/ru-da 404 verirdi). SectionPage-in
     `<main lang>`-ı səhifənin dilidir (en/ru-da böyük hərf «İ» ilə çıxmasın).
     Fakt ikonları: `idman`, `medeniyyet`. Admin: `cmAz:v7`.
   - **Səhifələr** (`telebePages:v1`, `beynelxalqPages:v1`, ümumi köməkçi
     `src/utils/section-pages.ts`, məzmun `telebe-pages-content.ts`,
     `beynelxalq-pages-content.ts`, qayda F5.47 kimi, `REVIEWED_UNTIL`
     12.10.2026, ehtiyat `<prefix>:backup:…`): 12 səhifə az/en/ru — tələbə
     həyatının ana səhifəsi (YENİ), TGT, Həmkarlar İttifaqı, TEC, təqaüd və sosial
     dəstək, idman, mədəniyyət (YENİ, köhnə «hazırlanır» ünvanı); beynəlxalq
     əməkdaşlıq, tərəfdaşlar, mübadilə və Erasmus+ (YENİ), ikili diplom (YENİ),
     əcnəbi tələbələr üçün bələdçi. Tələbələrin telefonları, qrup nömrələri,
     köhnə idarə heyətləri və təqaüd məbləğləri yazılmayıb. «Erasmus+ və
     Mevlana» təyinatı «Mübadilə və Erasmus+»-a keçir. `PAGES_RESEED` bu
     səhifələrə toxunmur.
   - **Təkrarlar v3** (`dedupe:v3`): «Beynəlxalq əlaqələr qrupu» → şöbənin bölmə
     səhifəsi (SİNXRON: `moved-pages.ts`, `next.config.js`, `gen-redirects.mjs`);
     «Faydalı keçidlər» (nav.link) də yeni ünvana.
20. **F5.49 — rəsmi qurumlar, GIZ, FAQ, ASCO, «Bunlar üçün», dil menyusu,
   əlçatanlıq, paylaşım** (layihə sənədi `claude/f549-qurumlar-faq-asco-elcatanliq.md`).
   - **Rəsmi qurumlar:** single type «3. Sayt — Rəsmi qurumlar»
     (`api::org-block.org-block`, dilsiz; komponent `org.item`: ad az/en/ru, qısa
     ad, sayt, loqo, «tabe olduğu qurum», gizlət). Sıra admində sürüşdürməklə,
     əlavə/silmə orada. BİR DƏFƏ (`orgBlock:v1`, `src/utils/org-block.ts`) yalnız
     boşdursa 5 qurum yazılır. Next: `getOrgBlock()`; Strapi əlçatmazdırsa
     `lib/org-fallback.ts` (EYNİ siyahı — biri dəyişəndə o biri də). «Tabe olduğu
     qurum» (ASCO) rəsmi zolaqda: «ASCO-nun tabeliyində» + loqo və ya qısa ad →
     `/sehife/asco-ve-akademiya`. Loqoları admin yükləyir (kodda loqo yoxdur).
     Footer sosial ikonları «Sosial blok»-dan (boşdursa görünmür).
   - **GIZ** (`gizClean:v1`, `src/utils/giz-clean.ts`, dəyişikliklər
     `giz-clean-data.ts`): GIZ EasTnT elm, beynəlxalq və təhsil səhifələrindən
     sətir dəqiqliyi ilə çıxarılır; xəbərlərə toxunulmur. Admində redaktə olunub
     dərc olunmamış (qaralama ≠ dərc) səhifədə yalnız qaralama yazılır + log.
   - **FAQ** (`/sehife/faq`, layout `faq`, `faqPage:v1`, məzmun
     `src/utils/info-pages-content.ts`; menyu `faqMenu:v1`): ümumi suallar + saytın
     bütün səhifələrinin «Suallar»-ı mövzular üzrə AVTOMATİK (`getFaqSources`,
     `FaqPage`) — sual öz səhifəsində yazılır, FAQ-da ikinci nüsxə yoxdur.
     Axtarış (`FaqSearch`), schema.org FAQPage; cavabda `[mətn](/ünvan)` keçid olur
     (`lib/faq-html.ts`).
   - **ASCO** (`/sehife/asco-ve-akademiya`, layout `akademiya`, blok `asco`,
     `ascoPage:v1`; menyu `ascoMenu:v1`: «Akademiya → Akademik irs və missiya»).
     Tabelik mənbəyi: APA, 22.09.2022. Təsisçi səlahiyyətlərinin bölgüsü yazılmayıb.
   - **«Bunlar üçün»** (`lib/audiences.ts` + `AudiencePage`): 7 auditoriya (YENİ
     «Tərəfdaşlar və işəgötürənlər», `audienceMenu:v1`), SectionPage dizaynında:
     faktlar, «… yolu» addımları, bütün bölmələr, canlı lent, mənbə səhifələrin
     sualları, «Sual ver» auditoriyanın istiqaməti ilə. `npm run check:audiences`.
   - **Dil menyusu** (`LangMenu`): klikdə açılır; eyni səhifənin digər dili
     (`lib/locale-path.ts`; xəbər/elan/tədbir detalı → həmin dilin siyahısı).
   - **Əlçatanlıq:** şrift 90–130%, yüksək kontrast, sıfırlama; seçim
     `localStorage` `adda-a11y` (`lib/a11y.ts`), ilk boyamadan əvvəl
     (beforeInteractive skript) — titrəmə yoxdur; `<html lang>` dildən.
   - **Paylaşım** (`ShareBar`): xəbər, elan, tədbir — Facebook, X, LinkedIn,
     WhatsApp, Telegram, keçidi kopyala, telefonda sistem paylaşımı; OG/Twitter
     meta (`lib/site.ts`, `NEXT_PUBLIC_SITE_URL`, defolt `https://demo.adda.edu.az`).
   - Admin: `cmAz:v8` (yeni tiplərin adları), `cmAz:v9` (şablon/blok qaydaları).
21. **F5.50 — ana səhifə** (layihə sənədi `claude/f550-ana-sehife.md`).
   - **Sıra:** Hero → Sürətli keçidlər → Xəbərlər, elanlar, tədbirlər →
     «Niyə məhz ADDA» → Kampus həyatı → Beynəlxalq → Sosial → Sitat + video → Footer.
   - **Admin: single type «3. Sayt — Ana səhifə»** (`api::home-page.home-page`,
     dilsiz; hər mətn az + `…En`/`…Ru`): `heroSlides` (`home.slide`: şəkil, üst yazı,
     başlıq — vurğu `*ulduzla*`, mətn, düymə + keçid, gizlət), `facts`
     (`home.fact`: rəqəm, vahid, başlıq, cümlə, **mənbə səhifəsi**), `campusCards`
     (`home.photo`, 3 kart), `quote*`, `videos` (`home.video`: YouTube ünvanı/ID),
     `videoChannel`. Seed BİR DƏFƏ, yalnız boşdursa (`homePage:v1`,
     `src/utils/home-page.ts`, məzmun `home-page-content.ts`); şəkilləri media
     kitabxanasında URL ilə tapıb bağlayır (prod-da xəbər arxivinin faylları),
     tapmasa boş qalır. Forma düzümü az/en/ru üçlüyü (`homeLayout:v1`).
   - **Next:** `getHomePage()` + `lib/home.ts` (`homeView`: dil seçimi, `*vurğu*` →
     `<em>` qaçırılmış HTML, Cloudinary kiçiltmə `c_limit,w_…,q_auto,f_auto`, boş
     sahə/şəkil → ehtiyat). Ehtiyat `lib/home-fallback.ts` = Strapi
     `home-page-content.ts` (EYNİ; yoxlama `same50`).
   - **Rəqəmlər yalnız mənbəli:** hər fakt kartı sübut səhifəsinə aparır. Köhnə
     «Rəqəmlərlə ADDA» (12000+, 8000+, 47+, 100%) və kampusdakı «30+ klub»,
     «200+ tədbir», «2031 →» SİLİNİB; Beynəlxalq blokunda «47+ / 5 qitə / 20+»
     əvəzinə 11 ölkə, 5 memorandum (2026), Erasmus+ və tərəfdaş şəhərləri.
     Yeni rəqəm yalnız saytın səhifəsində mənbəsi olanda.
   - **Hero** (`HeroSlider`): slayd sayı 1–6, düymənin mətni İLƏ keçidi dəyişir,
     hər şəklin öz nisbəti (əvvəl hamısı 16:9 sayılırdı → 3:2, 4:3 dartılırdı),
     ilk şəkil server-də `#slices` fonu + `preload`. WCAG 2.2.2: «Dayandır»
     düyməsi; mətn blokunda kursor/fokus, gizli vərəq, ekrandan kənar → dayanır;
     ← → yalnız hero görünəndə. Mobil `≤640px` `.hero-meta` gizlidir.
   - **«Niyə məhz ADDA»** (`WhyAdda`, `06-spotlight.css`): köhnə Spotlight +
     Stats bir blokda, 3×2 kart; mobildə üfüqi sürüşən sıra. `07-stats.css`,
     `Spotlight/Stats/StatsIsland/VQuote.tsx`, `lib/hero-slides.ts` silinib.
   - **Video** (`VideoSea` + `VideoSeaIsland`) — **F5.51-də silindi** (bax 22):
     sitat bloku əvvəlki dizayndadır. Qayda qalır: YouTube yalnız kliklə
     (`youtube-nocookie.com`), iframe-in `referrerPolicy`-si `no-referrer`
     OLMAMALIDIR (YouTube «153» pleyer xətası verir).
   - **Footer qurumları:** bərabər xanalar 3/2/1 sütun, natamam sətir mərkəzdə,
     loqo/nişan 64×44.
22. **F5.51 — sertifikatlar, sitat bloku, köhnə saytdan xəbər/elan, tədbirlər**
   (layihə sənədi `claude/f551-sertifikatlar-sitat-idxal.md`).
   - **Sertifikatlar:** single type «3. Sayt — Sertifikatlar» (`api::cert-block.cert-block`,
     dilsiz; `cert.item`: ad az/en/ru, qısa ad «Qurum: sənəd» — `: `-dən sonrası
     footer-də ikinci sətir, skan, fayl, «Footer-də göstər», gizlət). `certBlock:v1`
     (boşdursa köhnə saytın 6 sənədi), skanlar ARXA PLANDA köhnə saytdan
     (`certImages:v1`), forma `certLayout:v1` (+ tək tiplərin başlığı: documentId
     əvəzinə tipin adı, org-block da). Next: `/sertifikatlar` (lövbər az qısa
     addan — `lib/cert.ts` `certAnchor`; böyütmə `CertIsland`), footer zolağı
     «Rəsmi qurumlar»-dan əvvəl (4/2/1). Ehtiyat `lib/cert-fallback.ts` =
     `DEFAULT_CERTS` (yoxlama `same51`). Menyu `certMenu:v1`: «Akkreditasiya və
     sertifikatlar» və footer «Akkreditasiya» → `/sertifikatlar`, «Keyfiyyət siyasəti»
     → `/sertifikatlar#keyfiyyet-sahesinde-siyaset` (yalnız hələ «hazırlanır»/«#» idisə).
     301: `/certificates`, `/hazirlanir/akkreditasiya*` (`next.config.js`).
   - **Sitat bloku:** F5.50-nin video slayderi silindi (`home.video`, `videos`,
     `videoChannel`) — əvvəlki «video sitat» dizaynı: `VQuote` + `VQuoteIsland`,
     `12-vquote.css`. Admin: `quoteImage` (fon; boşdursa əvvəlki foto
     `HOME_QUOTE_BG`), `quoteVideo` (YouTube), `quoteVideoFile` (MP4 ≤ 100 MB,
     üstündür), `quoteCta*`; ikisi də boşdursa düymə yoxdur. Video `<dialog>`-da —
     qlobal `*{margin:0}` dialogun mərkəzləməsini silir, `margin:auto` MƏCBURİDİR.
     Defolt video Akademiyanın rəsmi kanalındandır; `homeQuote:v1` (boşdursa),
     forma `homeLayout:v2`.
   - **Köhnə saytdan idxal** (`src/utils/news-import.ts`, `legacy-files.ts`; məzmun
     `news-import-content.ts` AVTOMATİKDİR: `tools/migration/f551-news.mjs` ←
     `data/f551-oldsite.json`): 15.07–14.10.2026 — 6 xəbər (news/1985–1990), 5 elan
     (announce/520–524), az, köhnə tarixlə; Web Push GETMİR (`create({ status:
     'published' })` push middleware-inin tutduğu `publish` hərəkəti deyil). Şəkil və
     PDF arxa planda `LEGACY_SITE_URL`-dən (defolt `https://adda.edu.az`), yol başına
     bir dəfə (`legacyFiles:v1`); TLS zənciri natamamdırsa http; şəbəkə xətasında
     növbəti başlanğıcda, 3 uğursuzluqdan sonra şəkilsiz. Köhnə URL-lər
     `gen-redirects.mjs` → `IMPORTED`.
   - **Tədbirlər** (`eventsF551:v1`, az): NASCO 29 (15–16.10, Naxçıvan Dövlət
     Universiteti, hibrid), Zəfər Günü (06.11), Heydər Əliyevin anım günü (11.12) —
     saat və zal təxminidir. Ana səhifə zolağı tarix/saatı Bakı vaxtı ilə göstərir
     (`lib/format.ts` → `bakuTime`); 5-dən az tədbirdə sütun sayı = tədbir sayı.
   - Admin: `cmAz:v11`.
23. **F5.52 — admin «removeChild» xətası** (layihə sənədi `claude/f552-admin-removechild.md`).
   Səbəb brauzer tərcüməsidir (bax «Strapi 5» tələləri). `src/admin/dom-guard.ts`:
   tərcümə bağlanır + DOM qoruyucusu. Server tərəfi, sxem, marker YOXDUR.
24. **F5.53 — struktur sırası, ümumi telefon, «əməkdaş», hüquqi səhifələr, korporativ üslub**
   (layihə sənədi `claude/f553-struktur-telefon-huquqi.md`).
   - **Sıra:** bölmələr saytda `sortOrder`, sonra ad ilə. «Gəmi sürücülüyü fakültəsi»
     «Gəmi mexanikası…»-ndan əvvəl; rektorun BİRBAŞA tabeliyi: tədris prorektoru →
     elmi işlər və beynəlxalq əlaqələr prorektoru → mərkəzlər → şöbələr → digərləri
     (müşavir, köməkçi, elmi katib, referent, hüquq məsləhətçisi, kollec). Prorektorların
     tabeliyi dəyişmir. BİR DƏFƏ (`structOrder:v1`, `src/utils/structure-order.ts`,
     `updateMany` documentId üzrə — bütün dil/qaralama sətirləri), sonra admində «Sıra».
     `UNIT_TREE` eyni sırada; `/kafedralar` qrupları və `/rehberlik` dekanları fakültə sırası ilə.
     Əlifba sırası olan filtrlər (heyət, auditoriyalar) əlifba ilə qalır.
   - **Telefon:** Akademiyanın nömrəsi (012) 493 36 44 (+994 12 404 33 40 SƏHV idi).
     TƏK mənbə: Next `lib/phone.ts`, Strapi `src/utils/phone-fix.ts` (EYNİ format): az
     «(012) 493 36 44», en/ru «+994 12 493 36 44»; daxili nömrə «…, daxili 3078» /
     «ext.» / «доб.», keçid `tel:+994124933644,3078`. Üst zolaq (mobil menyuda da),
     footer, `/elaqe`; bölmə səhifəsində «Əlaqə» həmişə telefonla. `person.phone` və
     `unit.phoneExt` render zamanı `phoneView` ilə (qısa nömrə və köhnə
     «(+99412) 493-36-44 (3078)» — eyni format; başqa nömrə olduğu kimi). Səhifə mətnləri
     BİR DƏFƏ (`phoneFix:v1`): bütün sətirlər + komponentlər (suallar, addımlar, faktlar,
     yan keçidlər), `updatedAt` SAXLANIR; seed faylları yeni formatdadır. Başqa birbaşa
     nömrələr (Tədris ofisi 498-73-94, TTM 404 39 46/47) dəyişməyib.
   - **«Əməkdaş»:** bölmədə çalışanların sayı «N əməkdaş» / «Əməkdaş: N» («heyət» yox);
     kateqoriya adları (Professor-müəllim heyəti, İnzibati heyət) qalır.
   - **Hüquqi səhifələr** (`legalPages:v1`, `src/utils/legal-pages.ts`, məzmun
     `legal-pages-content.ts`, layout `akademiya`, qayda section-pages.ts kimi):
     `/sehife/mexfilik-siyaseti`, `/sehife/istifade-sertleri` az/en/ru. Kukilər
     (`adda_id`, `adda-a11y`, `adda_session_id`) və emal edənlər (Vercel, Render, Neon,
     Cloudinary, Resend, Gemini, Web Push) mətndə adbaad — yeni kuki/servis əlavə
     olunanda mətn də. **Hüquq şöbəsi yoxlamalıdır.**
   - **Korporativ üslub** (`/sehife/korporativ-uslub`, `corpPage:v1`, ARXA PLANDA 12 s,
     sayğac `corpPage:tries`): köhnə səhifə yeni quruluşda — loqotip (PNG, PDF, CDR),
     təqdimat şablonu (PPTX), qaydalar, `dataBlock=korporativ` → `BrandStyle.tsx`
     (rənglər HEX/RGB, şriftlər — kilidli dizayn sistemi; dəyişəndə orada da). Köhnə
     səhifədə Cloudinary-də olan fayllar təkrar endirilmir, qalanı köhnə saytdan
     (`legacy-files.ts`, `documents: true` PPTX/CDR qəbul edir). CSS prefiksi `corp-`
     (`.brand` başlığın loqo blokudur — eyni ad bloku ortaya sıxırdı).
   - Footer: Məxfilik siyasəti, İstifadə şərtləri, Korporativ stil → səhifələr.
     Admin: `cmAz:v12` (blok «korporativ», telefon sahələrinin qaydası).
25. **F5.54 — Nizamnamə və əsasnamələr** (layihə sənədi `claude/f554-nizamname-esasnameler.md`).
   Hamısı `src/utils/esasnameler.ts`, məzmun `nizamname-content.ts`, `esasname-content.ts`;
   addımlar ayrı-ayrı BİR DƏFƏ, biri xəta versə digərləri işləyir:
   - **Sənədlər** (`esasnameDocs:v1`): kodu olan fayl media kitabxanasında adından tapılır;
     sənəd yoxdursa yaradılır (bölməyə bağlanırsa — bölmənin MÖVCUD dil sətirlərinə) və
     dərc olunur; varsa yalnız boş `url` və kateqoriya. Kodsuz «diger» sənəd adında
     «əsasnamə» varsa → «esasname». Qaralamada dərc olunmamış redaktə varsa yalnız qaralama.
   - **Nizamnamə** (`nizamname:v1`, köhnə dəyərlər `nizamname:backup`): admində yaradılan
     səhifə `/sehife/nizamname` olur (köhnə oxunmaz ünvan 301: `next.config.js`
     PAGE_PAGE_MAP, `moved-pages.ts` PAGE_SLUG_RENAMES, `gen-redirects.mjs`). Mətn hələ
     PDF-dən köçürülmüşdürsə (`CHARTER_RAW_MARK`, layout standart) — rəsmi mətn 8 fəsil,
     bəndlər qalın nömrə ilə, layout `akademiya`; redaktə olunubsa YALNIZ ünvan
     (`updateMany`, `updatedAt` saxlanır). Keçid komponentlərində köhnə ünvan → yeni,
     məsul redaktor `page:nizamname`-ə.
   - **Səhifələr** (`esasnamePages:v1`, section-pages.ts qaydası, `seed.layout` artıq
     səhifə üzrə): reyestr + Himayəçilər Şurası, Məzunlar Assosiasiyası (akademiya),
     Tədris-metodiki Şura və komissiya, «Ən yaxşı müəllim», Yekun dövlət attestasiyası
     (tehsil), «İlin tələbəsi» (telebe), Keyfiyyəti idarəetmə sistemi (akademiya). Yalnız az;
     fayl keçidi `{{ES:n}}` → media URL (lokalda `ADMIN_PUBLIC_URL` + `/uploads/…`).
   - **Bölmələr** (`esasnameUnits:v1`): İRM, mühasibatlıq, personal, mətbəə — yalnız BOŞ
     missiya/fəaliyyət/xidmətlər (az) və əlavə bloku yoxdursa «Quruluş və idarəetmə».
   - **Yan keçidlər** (`esasnameLinks:v1`): təcrübə, yataqxana, doktorantura → əsasnamə
     faylı; keyfiyyətin monitorinqi → KİS; tələbə həyatı → «İlin tələbəsi».
   - **Menyu** (`esasnameMenu:v1`): «Nizamnamə və təsis sənədləri» (prod-da köhnə ünvan
     idi), «Struktur bölmələrin əsasnamələri», «Himayəçilər Şurası», «Məzunlar
     assosiasiyası» — yalnız yer tutan/köhnə ünvandadırsa; «Tədris prosesi və keyfiyyət» +
     yekun attestasiya, TMŞ; «Keyfiyyət və hesabatlılıq» + KİS («Akkreditasiya və
     sertifikatlar»-dan sonra). Seed MENU və `menu-fallback.ts` eyni.
   - Sxem: `document.url` (string, 300), `page.dataBlock` + «esasnameler». Admin:
     `cmAz:v13` (`url` adı), `cmAz:v14` (blok «esasnameler» qaydası).
   - Mobil: `.un-block { padding: 16px 0 }` (≤560px) boz blokun yan boşluğunu
     sıfırlayırdı — indi yalnız şaquli (`36-unit.css`).
   - Lokal sınaq: `dist`-də əl ilə dəyişiklikdən sonra `dist/tsconfig.tsbuildinfo` silinməlidir,
     yoxsa `tsc` faylı yenidən yazmır.
26. **F5.55 — Dənizçilər poliklinikası, E-Akademiya, ru/en tərcümə.**
   - **Poliklinika** (`poliklinika:v1`, `src/utils/poliklinika-fix.ts`): ASCO-nun «Dənizçilər
     poliklinikası» 2021-də ləğv edilib. Bakalavriat, FAQ, «ASCO və Akademiya» (az/en/ru):
     tibbi müayinənin «yeri və vaxtı Akademiyanın elanında bildirilir», ünvan və ASCO
     cədvəlinin «Tibbi müayinə» sətri çıxıb, addımın «Kim»-i «Tibbi komissiya». Yalnız seed-in
     dəqiq cümlələri, bütün sətirlər birbaşa bazada, `updatedAt` saxlanır; qalıq logda.
     Müayinənin yeni yeri mənbədə yoxdur — məlum olanda mətnə yazılır.
   - **E-Akademiya** (`eAkademiya:v1`, `src/utils/eakademiya-menu.ts`): «Elektron jurnal»,
     «Dərs cədvəli», «Sertifikatlar» → Elm Portalı (cris.adda.edu.az), CJMSE jurnalı
     (cjmse.adda.edu.az), Kurslara qeydiyyat (portal.adda.edu.az — Vercel `adda-courses`).
     Seed, `menu-fallback.ts`, `MENU_T` eyni.
   - **Tərcümə** (`tercume:v1`, `src/utils/translate-missing.ts`, ARXA PLANDA 45 s):
     Gemini (`GEMINI_API_KEY`; model `TRANSLATE_MODEL` → `RAG_CHAT_MODEL`), JSON rejimi,
     terminologiya lüğəti. Doldurur: dərc olunmuş az səhifənin OLMAYAN ru/en sətri
     (yaradılır və dərc olunur; az mətni 80 simvoldan qısa yer tutanlar yox), bölmənin
     ru/en-də BOŞ mətn sahələri, əlavə blokları, keçid etiketləri (sətir yoxdursa
     yaradılır), sənədin boş `titleRu/En`, `descriptionRu/En`. Mövcud tərcüməyə
     toxunulmur. Cavab yoxlanılır (quruluş, keçid ünvanları, dil), 7000 simvoldan uzun
     mətn «## » bölmələri ilə; nizamnamədə «qeyri-rəsmi tərcümə» qeydi. Görülən iş
     `tercume:done`-da, xəta element başına 3 başlanğıca qədər təkrarlanır. Yeni az
     məzmunu üçün: `TRANSLATE_MISSING=true` → deploy → log → bayrağı sil. Lokal sınaq:
     `TRANSLATE_PROVIDER=mock`. Xəbər, elan, tədbir, ixtisas daxil DEYİL; bölmənin
     «Suallar»-ı (`unit.faq`) dilsizdir — tərcümə olunmur.
27. **F5.56 — Neon kvotası: sayt Strapi-ni gündə bir dəfə yeniləyir, dərcdə dərhal.**
   Neon pulsuz kompüt saatı bitmişdi (Render logu: «exceeded the quota»). Səbəb: saytın
   keşi 60 s idi (`strapiFetch` defoltu; marşrutlar 60/300), hər ziyarət dəqiqədə bir
   Strapi-ni və bazanı oyadırdı; xəbər səhifəsindəki reaksiya adası hər açılışda Strapi-yə
   gedirdi; açıq qalan admin vərəqi 60 s-dən bir «Bildirişlər»i soruşurdu.
   - **Next:** `strapiFetch` 86400 s + teq `STRAPI_TAG`; lentlər 86400 (yaxınlaşan tədbirlər
     3600, vaxt saata yuvarlaqlaşdırılır — URL sabit, keş tutur); marşrutlar 86400, ana
     səhifə 3600; `/api/page-owners` 3600. **Səhifənin effektiv müddəti ən qısa fetch-inkidir:**
     `strapiFetch`-ə açıq verilən 60/120/300 (ana səhifə bloku, orqan/sertifikat blokları,
     başlıq lentləri, detal) bütün səhifələri 2–5 dəqiqədə saxlayırdı — hamısı `CACHE_DAY`.
     Yoxlama: `next build` → `.next/prerender-manifest.json` `initialRevalidateSeconds`
     (gözlənilən: ana səhifə 3600, qalanı 86400).
   - **Strapi əlçatmazdırsa** (şəbəkə, 5xx, 429, JSON deyil) `strapiFetch` bir dəfə də
     soruşur, bu dəfə `RETRY_TTL` = 60 s ilə: Next səhifənin müddətini ən qısa fetch-dən
     götürür (uğursuz fetch də sayılır), xətanı tutub boş blokla (və ya 404 ilə) çıxan
     səhifə 1 gün yox, 60 s keşdə qalır və Strapi qayıdanda özü düzəlir (lokal yoxlanılıb:
     Strapi söndürülüb → `s-maxage=60`, qaytarılıb → 86400). 4xx-də təkrar yoxdur. `POST /api/revalidate` (başlıq
     `x-revalidate-secret` = `REVALIDATE_SECRET`, yoxdursa `ADMIN_IMPORT_SECRET`):
     `revalidateTag(STRAPI_TAG)` + `revalidatePath('/', 'layout')`. Reaksiyalar
     `GET /api/reactions?type=&slug=` (Next keşi 1 gün, CDN 1 saat); öz reaksiyası
     brauzerdə (`localStorage.adda_rx`) — keşdə yoxdursa sayğaca +1. POST əvvəlki kimi Strapi-yə.
   - **Strapi:** `src/utils/site-revalidate.ts` — Document Service middleware:
     `SITE_TYPES`; dərc olunan növdə publish/unpublish/delete, qalanlarında
     create/update/delete; media faylı dəyişəndə/silinəndə; məsul redaktor təyinatı;
     yeni deploy (`RENDER_GIT_COMMIT` ≠ `siteRevalidate:commit`). 8 s birləşdirmə, ən gec
     60 s. Yalnız Render-də (`RENDER`) və ya `REVALIDATE_URL` ilə; sirr yoxdursa açılışda
     xəbərdarlıq, heç nə göndərilmir. Xəta (401/503/404) logda səbəbi ilə.
   - **Baza hovuzu:** `min 0`, `idleTimeoutMillis 30000` (env `DATABASE_POOL_MIN`,
     `DATABASE_POOL_IDLE_MS`) — Neon yatanda ölü bağlantı qalmır.
   - **Admin:** «Bildirişlər» sorğusu 10 dəqiqə hərəkət olmayanda dayanır, qayıdanda dərhal.
   - **Quraşdırma:** Render (Strapi) və Vercel-də eyni `REVALIDATE_SECRET`; Vercel-ə
     dəyişən əlavə olunandan sonra yenidən deploy. Sirr yoxdursa sayt dəyişikliyi 1
     günə qədər gecikmə ilə göstərir. Lokal sınaq: Strapi `REVALIDATE_URL=http://localhost:3000/api/revalidate`.
28. **F5.57 — qaydalar və təlimatlar** (layihə sənədi `claude/f557-qaydalar-telimatlar.md`).
   Hamısı `src/utils/qaydalar.ts`, məzmun `qaydalar-content.ts`; addımlar ayrı-ayrı BİR DƏFƏ:
   - **Sənədlər** (`qaydaDocs:v1`): 30 qeyd (yuxarıdakı cədvəl); varsa (fayl və ya başlıqdakı
     kod üzrə) yalnız «diger» → yeni kateqoriya, boş `url`, boş təsvir. Eyni kodlu artıq
     fayllar logda. Bölməyə bağlanma bölmənin mövcud dil sətirlərinə (F5.54 kimi).
   - **Səhifələr** (`qaydaPages:v1`, section-pages.ts qaydası, yalnız az): reyestr + 12
     səhifə (`tehsil`: kredit sistemi, qiymətləndirmə, yay semestri, köçürmə, diplomqabağı
     təcrübə, tədrisin təşkili, diplom; `elm`: akademik dürüstlük; `akademiya`: daxili
     intizam, fəxri adlar, müraciətlər, işə qəbul). Fayl keçidi `{{TL:n}}` / `{{EP:n}}`.
     Məsul redaktor: `page:fexri-doktorlarimiz` → `page:fexri-adlar`,
     `page:akademik-durustluk-beyannamesi` → `page:akademik-durustluk`.
   - **Mətn** (`qaydaText:v1`, `TEXT_FIXES`): seed mətnində dəqiq fraqment — YDA-ya
     «İmtahan günü» (TL-018), əcnəbilərin qəbulu az/en/ru — hazırlıq kursları (TL-011),
     bələdçi az/en/ru — «6 və ya 9 ay». `updateMany`, hər dilin qaralama və dərc sətri,
     `updatedAt` saxlanır; fraqment tapılmasa logda (admində əl ilə).
   - **Yan keçidlər** (`qaydaLinks:v1`): 16 mövcud səhifəyə, yalnız yoxdursa; qaralamada
     dərc olunmamış redaktə varsa yalnız qaralama.
   - **Menyu** (`qaydaMenu:v1`): «Fəxri doktorlarımız» → «Fəxri doktor və fəxri professor»,
     «Akademik dürüstlük bəyannaməsi» → «Akademik dürüstlük və antiplagiat», «Müraciətlərə
     baxılma qaydası» — yalnız hələ «hazırlanır»/«#»-dirsə; «Hüquqi baza və etika» +
     qaydalar, daxili intizam; «Heyət» + işə qəbul; «Dəniz praktikası» + diplomqabağı
     təcrübə; «Təhsil» + yeni qrup «Tədris qaydaları» (7 keçid); «Tələbə üçün» + daxili
     intizam. Seed MENU, `menu-fallback.ts`, `MENU_T` eyni; 301 `/hazirlanir/…` →
     `next.config.js` `HAZIRLANIR_PAGE_MAP`.
   - Sxem: `document.category` + `qayda`, `telimat` (`DocList`-də «Əsasnamə»-dən sonra);
     `page.dataBlock` + `qaydalar`. Admin: `cmAz:v15`. `esasnameler.ts`-dən `absUrl`,
     `hasPendingDraft`, `unitTargets` ixrac olunur.
   - **Tərcümə (22.10.2026 ölçüsü, F5.57-dən əvvəl):** səhifə ru 42/57, en 42/57 (simvolla
     67% / 83%); bölmə mətnləri az 107 176 simvol, en 31%, ru 12% (ru/en sətri var, sahələr
     boş); sənəd adları 0/54. Gemini 19.10-da 91 işdən 21-ni etdi (7 səhifə × ru/en dərc
     olundu; 7 bölmə tərcüməsi qaralamada — ru/en sətrində dərc olunmamış redaktə olduğu
     üçün dərc edilmədi). Sonra `HTTP 429: You exceeded your current quota` (pulsuz kvota),
     Render-in təkrar başlatmaları hər elementin 3 cəhdini yedi, iş 20.10-da bağlandı
     (`tercume:v1`). Davam: Gemini açarında ödəniş/kvota → Render `TRANSLATE_MISSING=true` →
     deploy → «hazırdır» logu → bayrağı sil; 7 bölmə qaralaması admində yoxlanıb dərc edilir.
   - Lokal sınaq: SQLite, təmiz baza → bütün zəncir; sonra fayllar, köhnə menyu, redaktor
     halları ilə F5.57 yenidən və təkrar (74 yoxlama). `strapi.db.query().update()` vaxtı
     yazır — sınaq skriptində də `updateMany`.

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