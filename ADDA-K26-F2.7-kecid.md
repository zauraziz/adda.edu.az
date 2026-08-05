# ADDA — Keçid promptu: K26 (bağlandı) → F2.7 (Grounded RAG AI co-pilot)

Bu sənəd yeni çatın **ilk mesajı** kimi göndərilir. Əvvəlki çat K26-nı (legacy
migrasiya + heyət platforması + poçt zənciri) tamamladı; F2.7 ayrıca fazadır.

---

## 0. ROL & KONTEKST

Zaur ADDA (Azərbaycan Dövlət Dəniz Akademiyası) saytının yeganə
tərtibatçısıdır. Claude **icraçıdır**: commit-ə hazır deliverable hazırlayır,
push etmir. Ünsiyyət **Azərbaycanca, qısa və direktiv**.

Repo: `github.com/zauraziz/adda.edu.az` → `adda-nextjs/`, `adda-strapi/`, `tools/`
Mühit: Windows, PowerShell 5.1, `E:\web-projects\adda.edu.az`

---

## 1. TEXNİKİ STACK

Next.js 15.1 + React 19 (Vercel, `demo.adda.edu.az`) · Strapi 5.50 (Render,
`adda-edu-az.onrender.com`) · Neon Postgres · Cloudinary · Meilisearch (index
`adda`) · Resend (poçt, HTTP API).

Dizayn **kilidlidir**: Fraunces (başlıq) + Manrope (mətn); navy `#0B3D5C` /
gold `#C9A961`; ağ fon / `#1F2937` mətn.

---

## 2. DELİVERABLE QAYDALARI (dəyişməz)

1. BOM-prefiksli (`utf-8-sig`), LF, sonda `\n` olan `.ps1`
2. Hər skript **təzə `git clone --depth 1`**-dan başlayır
3. Byte-identiklik + BOM/CR yoxlaması
4. **Real kompilyasiya qapısı** (aşağıya bax)
5. İdempotentlik: ikinci run → `stage sayi: 0`, `exit 0`
6. Lokal commit — **push Zaur edir**
7. ASCII commit mesajı

### PowerShell tələləri

- `[locale]` yol daxilində wildcard sayılır → `-LiteralPath`; `Split-Path`
  əvəzinə `[System.IO.Path]::GetDirectoryName()`
- **Dəyişən adları HƏRF HƏSSAS DEYİL.** `$LibStrapi` və `$libStrapi` eyni
  dəyişəndir — bir paket məhz bundan sındı. Generatorda toqquşma yoxlaması qoy.
- `$home`, `$host`, `$error` qorunmuş
- Tək dırnaqlı here-string parsingi pozur
- `stage sayi: 0` xəta deyil — sarı mesaj + `exit 0`

---

## 3. VALİDASİYA — BU ÇATDA ÖYRƏNİLƏNLƏR

### esbuild Strapi ÜÇÜN QAPI DEYİL

esbuild **tipləri silir, yoxlamır**. K26 boyunca Strapi tərəfi esbuild ilə
"yoxlanılırdı" və bir `TS2339` Render build-ini sındırdı. Sınandı:

```
səhvli kod + esbuild → KEÇDİ (yalançı yaşıl)
səhvli kod + tsc     → TS2339
```

**Strapi qapısı:** `cd adda-strapi && npx tsc --noEmit -p tsconfig.json`
Sxem/plugin dəyişəndə əlavə: `npm run build` (Render ilə eyni əmr, ~70 s).

**Next qapısı:** `cd adda-nextjs && npx tsc --noEmit -p tsconfig.json`

### Sandbox prod-a çıxa bilmir

`onrender.com` → `x-deny-reason: host_not_allowed`. Prod haqqında **heç bir
nəticə çıxarma** — Zaurun işlədəcəyi CLI diaqnostikası yaz. Bir dəfə "prod
boşdur" yanlış siqnalı verildi; səbəb şəbəkə bloku idi.

---

## 4. CARİ VƏZİYYƏT

`origin/main` son commit: `eafbff5` (K26-28).

| sahə | vəziyyət |
|---|---|
| Menyu | 204 bənd: **77 real**, 106 `/hazirlanir`, 21 `#` |
| Heyət | 163 şəxs, 23 struktur bölmə, hamısı published |
| Legacy redirect | 1206 URL, `middleware.ts` |
| Poçt | Resend HTTP API, magic-link işləyir |
| Migrasiya | 808 xəbər, 345 elan, 36 səhifə, 12 şöbə, 4 ixtisas, 2 fakültə |

### Marşrutlar

`/heyet` (kataloq) · `/heyet/[tip]` · `/emekdas/[slug]` · `/profil`
(özünəxidmət) · `/struktur` (ağac) · `/struktur/[slug]` · `/fakulteler` ·
`/ixtisaslar` · `/hazirlanir/[slug]` (noindex)

### Render env (təyin olunub)

`RESEND_API_KEY` · `BREVO_API_KEY` (işlənmir, Resend üstündür) ·
`ADMIN_IMPORT_SECRET` · `SITE_URL` · `CLOUDINARY_*` · `MENU_RESEED` (**deploy
sonrası silinməlidir**)

---

## 5. F2.7 — GÖRÜLƏCƏK İŞ

Strapi məzmunu üzərində **əsaslandırılmış** (grounded) AI köməkçi.

- **Retrieval:** Meilisearch (`adda`) hybrid semantic search
- **NER entity-linking:** şəxs / proqram / fakültə / bölmə → məzmuna bağla
- **Guardrails:** PII müdafiəsi + prompt-injection müdafiəsi
- **Translation QA:** trilingual keyfiyyət yoxlaması
- **Unified notification center:** F2.6e push + korreksiya statusu + RSVP
- Yalnız Strapi məzmunundan cavab (hallüsinasiya yox), **mənbə göstərilir**

Faza sırası: oxu (F2.4 ✓) → səth (F2.5 ✓) → icma (F2.6 ✓) → **intellekt (F2.7)**

### F2.7-yə xas risklər

- **PII:** `person` public API-də açıqdır. Doğum tarixi qəsdən ayrı,
  marşrutsuz `staff-private` content type-ındadır — RAG indeksinə **düşməməlidir**.
- **Prompt injection:** məzmun istifadəçi düzəlişlərindən (`/profil`,
  correction inbox) gəlir. İndekslənən mətn etibarsız girişdir.
- **Meilisearch:** `MEILISEARCH_HOST` `https://` prefiksi olmadan **səssizcə**
  sınır. K25-də axtarış Meilisearch-dən DB-yə keçirilib — F2.7 üçün onu geri
  qaytarmaq lazım gələ bilər, əvvəlcə cari vəziyyəti yoxla.

---

## 6. AÇIQ İŞLƏR — ZAURDAN ASILI

| # | iş |
|---|---|
| 7 | `node staff-import.mjs --delete-orphan=person` (Abbasov Elnur dublikatı) |
| 8 | 12 e-xidmət URL-i: Tələbə/Müəllim kabineti, Elektron jurnal, Dərs cədvəli, Sertifikatlar, E-Akademiya, Onlayn müraciət, LMS |
| 10 | Təlim Tədris Mərkəzi heyəti |
| 12 | Ştatda olmayan 6 nəfər (Abdulov Həsən, Quliyeva Sevinc, Rəhimov Emin, Hüseynova Günay, Quliyeva Aygül, Əliyev Ənvər) |
| 13+19 | 106 `/hazirlanir` səhifəsinin məzmunu + `content/31` (`irm`) dublikatının təmizlənməsi |
| 17 | Əməkdaşlara bildiriş: `node staff-import.mjs --stale` hazır siyahı verir |
| — | `SMTP_FROM` → `ADDA <no-reply@adda.edu.az>` (Resend-də domen `verified` olandan sonra) |

**`content/31` haqqında:** `content/2`-nin qısa surətidir (8676 vs 11654
simvol, eyni açılış cümləsi). Kanonik olan `content/2`
(`informasiya-resurs-merkezi`).

---

## 7. ƏSAS ÖYRƏNMƏLƏR

### Strapi 5

- **`documents().update()` YALNIZ DRAFT yazır.** Mənbədə
  `filterDataPublishedAt` `publishedAt`-i data-dan silir, `setStatusToDraft`
  statusu məcburi draft edir. İctimai sayta çatması üçün **`publish()`
  çağırılmalıdır**. `/profil` redaktələri bir müddət yalnız draft-da qalmışdı.
- **`config/api.ts` → `maxLimit: 100`.** `pagination[pageSize]: 400` **səssizcə**
  100-ə kəsilir. 163 nəfərdən 100-ü görünürdü. Həll: müştəri tərəfdə
  səhifələmə (`fetchAllPages`, `id:asc` — açar unikal olmalıdır), server
  konfiqurasiyasını genişlətmək **yox**.
- **Upload service:** `originalFilename` (kiçik `n`); `refId` **rəqəmsal
  entity id** gözləyir — `documentId` sətri yükləməni sındırır. Ən sadəsi:
  `refId`/`ref`/`field` ötürməmək, əlaqəni `update()` ilə qurmaq.
- `@strapi/design-system` **2.2.1/2.2.2** `@codemirror/state`-i öz bundle-ının
  içinə hopdurur → admin paneldə JSON sahəsi "Something went wrong" verir.
  Vite `dedupe` **kömək etmir** (hopdurulmuş kod modul deyil). Həll:
  `overrides: { "@strapi/design-system": "2.2.3" }`.
- Seed data `src/index.ts`-də inline olmalıdır; single-type üçün
  "update-if-empty"; locale-siz DELETE/GET 404 verir (default locale `en`).
- Menyu SEED-i artıq doludursa `!hasData` qapısı yeni SEED-i buraxmır →
  `MENU_RESEED=true`, sonra **sil**.

### Poçt

- **Render pulsuz tarif 25/465/587 portlarını bloklayır** (26.09.2025-dən).
  Paketlər DROP olunur → `ECONNREFUSED` yox, sadəcə asılma. Heç bir SMTP
  parametri bunu həll etmir → **HTTP API** (adi HTTPS).
- **Brevo magic-link üçün yararsızdır:** tranzaksiya məktublarında bütün
  linkləri öz izləmə domeninə yenidən yazır və bunu söndürmək mümkün deyil.
  Üç problem: artıq nasazlıq nöqtəsi; token üçüncü tərəfdə; **poçt skanerləri
  linki öncədən açır və birdəfəlik token yanır**. → **Resend** (klik izləmə
  defolt söndürülüdür).
- HTML məktubda `&` mütləq `&amp;` (`?t=…&r=…` sınırdı). Düymə **cədvəl
  əsaslı** olmalıdır — Outlook `display:inline-block`-u klikləmir.
- `SITE_URL` markdown sarğısı ilə gələ bilər (`[url](url)`) — təmizlə **və**
  `new URL()` ilə yoxla; keçməsə **göndərmə**.

### Next.js

- Client island tam i18n lüğətini (55 kB) **dəyər kimi import etməməlidir** —
  server komponentindən tərcümə olunmuş sətirlər props kimi ötürülür.
- Yalnız `NEXT_PUBLIC_*` brauzer bundle-ına düşür.
- `next build` sandbox-da `fonts.googleapis.com` blokuna görə sınır — qapı kimi
  işlətmə.

### Azərbaycan dili

- Əlifba **A–Z deyil**: `Ç Ə Ğ İ Ö Ş Ü` ayrı hərflərdir. `localeCompare(…, 'az')`.
- **`Ə` DB kollasiyasında `Z`-dən sonra sıralanır** — limitə düşən sorğuda
  `Əziz…` kəsilən hissədə qalırdı.
- `I`→`i` və `İ`→`i` ayrı işlənməlidir; `toLowerCase()` korlayır.
- Ad sırası: `name` = ştatdakı "Soyad Ad Ata", `displayName` = **"Ad Ata Soyad"**
  (göstərmə və əlifba indeksi bunu işlədir).
- Sətir axtarışı tələsi: **`Rektor` ⊂ `Prorektor`**, `Müəllim` ⊂ `Baş müəllim`
  → sıralı, lövbərli regex naxışları işlət.

### Migrasiya

- `redirects.json`-un `to` sahəsinə **güvənmə** — bütün `content/*`-ı
  `/sehife/`-yə göndərir, halbuki `mapping.mjs` 11-ini `department`-ə, 4-ünü
  `program`-a marşrutlaşdırır. Seqment `targetTypeFor()`-dan hesablanmalıdır.
- `isEmpty` sənədlərə yönləndirmə qurma: 301 → 404 zənciri birbaşa 404-dən pisdir.
- `/struktur/[slug]` **həm** `unit` (2025 sxemi), **həm** `department` (legacy)
  oxuyur — cəmi 5 slug üst-üstə düşür.
- CSS: postcss işlət, hand-rolled parser `@import` URL-indəki `;` üzərində sınır.

### Məzmun faktları

- Təsis ili **1996**; 1881-də **sələfi** yaradılıb (Hero `EST · 1996`,
  Spotlight-dakı "1881-dən gələn ənənə" doğrudur)
- **AZCON Holding** (ASCON yox), 07.11.2024 fərman
- Nazirlik: Rəqəmsal İnkişaf və Nəqliyyat Nazirliyi (mincom.gov.az)
- ASCO = Azərbaycan Xəzər Dəniz Gəmiçiliyi QSC (asco.az)
- Ştat düzəlişi kodda: `Əziz Zaur Vaqif **oğlu**` (ştatda `qızı` yazılıb)

---

## 8. ALƏTLƏR

`tools/migration/`:

| alət | təyinat |
|---|---|
| `staff-parse.mjs` | ştat.txt → `data/staff.json` (repoya düşmür — PII) |
| `staff-contacts.mjs` | HeyetAdGunu.csv → e-poçt + doğum tarixi |
| `staff-import.mjs` | idxal · `--plan --verify --audit --stale --orphans --contacts` |
| `staff-template.mjs` | 162 nəfərlik CSV şablonu (UTF-8 BOM — Excel üçün) |
| `menu-map.mjs` | menyu ↔ sənəd uyğunlaşdırma hesabatı |
| `gen-redirects.mjs` | legacy redirect xəritəsi |
| `verify-redirects.mjs` | xəritəni **prod-a qarşı** yoxlayır (`--live`) |
| `mail-check.mjs` | poçt diaqnostikası (`ADMIN_IMPORT_SECRET` lazımdır) |

`data/` `.gitignore`-dadır — 163 nəfərin PII-si repoya düşmür.

Mühit: `/opt/pwsh/pwsh -NoProfile -File` · şəbəkə: github/npm/pypi/ubuntu ·
**əlçatmaz:** onrender.com, fonts.googleapis.com

---

## 9. İLK ADDIM

F2.7-yə başlamazdan əvvəl cari axtarış vəziyyətini yoxla — K25-də Meilisearch
DB-əsaslı axtarışla əvəz olunub, RAG üçün onu geri qaytarmaq lazım gələ bilər:

```
grep -rn "meilisearch" adda-strapi/config/plugins.ts adda-nextjs/lib/
```
