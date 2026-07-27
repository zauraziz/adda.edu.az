# ADDA — Faza 2 keçid promptu: **F2.6e** (magic-link + Web Push + hardening)

> Bu sənəd yeni chat-ın **ilk mesajı** kimi yapışdırılır. Aşağıdakı hər şey təsdiqlənmiş vəziyyətdir.

---

## 1. ROL VƏ ÜNSİYYƏT

Sən ADDA (Azərbaycan Dövlət Dəniz Akademiyası) saytının modernizasiyasında **icraçısan**.

- Ünsiyyət **Azərbaycan dilində**, qısa və direktiv. Uzun izahat yox — nəticə və qərar.
- **Zaur push edir.** Sən yalnız **lokal-commit-hazır `.ps1`** çatdırırsan. Heç vaxt push etmə, heç vaxt push etməyi simulyasiya etmə.
- Hər faza öz chat-ində. Faza bitəndə növbəti üçün bu formatda keçid sənədi hazırla.
- Spesifikasiya olmadan kod yazma. Şübhə varsa soruş.
- Standart: "2031-ə qədər gələcəyə davamlı", production-ready, trilingual (az/ru/en).

---

## 2. LAYİHƏ KONSTANTLARI

**Monorepo:** `github.com/zauraziz/adda.edu.az`

| Repo | Stack | Deploy |
|---|---|---|
| `adda-nextjs/` | Next.js 15.1 + React 19 | Vercel → `demo.adda.edu.az` |
| `adda-strapi/` | Strapi 5.50 | Render → `https://adda-edu-az.onrender.com` |

- **DB:** Neon Postgres (prod) / SQLite (lokal dev)
- **Search:** Meilisearch, index `adda`, `strapi-plugin-meilisearch@^0.16.5`
- **Animasiya:** cobe 0.6.4, gsap 3.12.5
- **Dev mühiti:** Windows, PowerShell 5.1, `E:\web-projects\adda.edu.az`
- Vercel: proyekt `prj_u6eNrG0FMyT9pHHV2v2hs2vavqwy`, team `team_W6LJ6hacEhzqZm9vBGWxEUpb`

### Dizayn KİLİDLİDİR
`globals.css :root` tokenləri:
- navy: `--navy-900 #071E2E`, `--navy-800 #0B3D5C`, `--navy-700 #0E4D73`, `--navy-600 #12608F`, `--navy-50 #F0F8FF`
- gold: `--gold-600 #A68942`, `--gold-500 #C9A961`, `--gold-400 #D4BB7C`, `--gold-100 #F5EDDA`
- `--error #DC2626`, boz palitra, `--gradient-navy`
- Şrift: **Fraunces** (display) / **Manrope** (body)
- `--nav-dur 280ms`, `--nav-ease cubic-bezier(0.16,1,0.3,1)`
- İkonlar: Tabler → `<i className="ti ti-*" />`

⚠️ **`--navy-400` və `--nav-sh-md` MÖVCUD DEYİL.** Köhnə kodda bu baq var idi, F2.6c-də təmizləndi. İşlətmə.

Yaşıl/qırmızı token yoxdur — diff rəngləri `23-correction.css`-də scoped literal: `#e3f2e9/#0e7a3b` (əlavə), `#fbe7e7/#b42318` (silinmə).

---

## 3. CARİ VƏZİYYƏT (origin/main)

```
6ec743a  fix: default STRAPI_URL to public Strapi (client islands stop hitting localhost)
efe2714  feat(F2.6d): correction inbox + word-diff + moderation queue
a39bc64  feat(F2.6c): ReactionBar redo - polished maritime reactions
a34ea01  feat(F2.6b): RSVP + .ics redo - polished panel, pill status
```

**İlk addım hər yeni chat-da:** `git clone --depth 1` + `git log --oneline -3` → baseline-ı təsdiqlə.

### Tamamlanmış (F2.6 "icma")
| Alt-faza | Nəticə |
|---|---|
| F2.6b | RSVP + `.ics` generasiya → `RsvpIsland.tsx`, `21-rsvp.css` |
| F2.6c | Dənizçilik reaksiyaları ⚓🚢🧭🌊 → `ReactionBar.tsx`, `22-reactions.css` |
| F2.6d | Düzəliş inbox + söz-səviyyəli LCS diff → `CorrectionIsland.tsx`, `23-correction.css`, `correction/lifecycles.ts` |
| fix | `STRAPI_URL` default → public Strapi |

**Strapi content type-lar (16):** announcement, article, correction, department, document, event, faculty, menu, milestone, page, person, program, reaction, rsvp, tag, unit

### Client island pattern (VACİB)
Hər üç island (`RsvpIsland`, `ReactionBar`, `CorrectionIsland`):
- `"use client"`, `import { STRAPI_URL } from "@/lib/strapi"`
- **Böyük `T` lüğətini value kimi import ETMİR** (~55 kB bundle). Server komponent `tr()` çağırır → `labels: Record<string,string>` prop kimi ötürür.
- POST birbaşa Strapi-yə: `/api/rsvps`, `/api/reactions`, `/api/corrections`

### STRAPI_URL (fix-dən sonra)
```ts
// adda-nextjs/lib/strapi.ts
export const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || process.env.STRAPI_URL || 'https://adda-edu-az.onrender.com';
```
- **Vercel-də env dəyişəni TƏLƏB OLUNMUR.**
- Yalnız `NEXT_PUBLIC_*` brauzerə inline olunur (build zamanı). Sadə `STRAPI_URL` client-də `undefined`.
- Lokal Strapi üçün `adda-nextjs/.env.local` (gitignore-da): `NEXT_PUBLIC_STRAPI_URL=http://localhost:1337`
- Strapi CORS (`adda-strapi/config/middlewares.ts`) artıq icazə verir: `demo.adda.edu.az`, `adda.edu.az`, `localhost:3000`, `localhost:1337`

---

## 4. DELIVERABLE METODOLOGİYASI (sınaqdan keçib — dəyişdirmə)

`.ps1` **Python ilə generasiya olunur**:
- Payload oxu: `io.open(..., encoding='utf-8')`
- `.ps1` yaz: `io.open(..., 'utf-8-sig', newline='\n')` → **BOM `efbbbf` + Unix LF + sonda `\n`**
- Fayl gövdələri **literal here-string** `@'...'@` içində. **Assert:** heç bir sətir `'@` ilə başlamamalıdır.
- Helper:
```powershell
function Write-FileNoBom([string]$Path,[string]$Content) {
  $dir = Split-Path -Parent $Path
  [void][System.IO.Directory]::CreateDirectory($dir)
  $lf = $Content -replace "`r`n", "`n"
  if (-not $lf.EndsWith("`n")) { $lf += "`n" }
  [System.IO.File]::WriteAllText($Path, $lf, (New-Object System.Text.UTF8Encoding($false)))
}
```
- **Məzmun faylları BOM-suz** (mənbə kodu üçün doğru). Yalnız `.ps1` özü BOM-lu.
- `$env:GIT_LITERAL_PATHSPECS = '1'`; `git add -- <path>` (**heç vaxt `-A`**, silinən fayl istisna — onda əvvəlcə `git ls-files` ilə yoxla).
- Commit mesajı **ASCII** (PS5.1 qeyri-ASCII-ni korlayır).
- **İdempotent:** 2-ci run → `stage sayi: 0` → sarı info + `exit 0`.
- Böyük mövcud faylları (məs. 950 sətirlik `i18n.ts`) **üzərinə yazma** — `.Contains()` sentinel guard + `.Replace()` ilə cərrahi insert.

### Doğrulama (hamısı məcburi)
1. Fresh `git clone --depth 1` → baseline commit təsdiqlə
2. `.ps1`-i clone **ROOT**-una kopyala (monorepo kökü, `.git` orada; `adda-nextjs` alt-qovluqdur)
3. Run 1 → gözlənilən fayllar stage olunur, commit yaranır
4. `git diff --name-only HEAD~1 HEAD` → **dəqiq N fayl**
5. `diff -q` işçi clone ilə → **byte-identik**
6. Məzmun faylları: BOM=yox, CR=0, sonda LF
7. `.ps1`: BOM=`efbbbf`, CR=0
8. **REAL tsc** commit olunmuş artefaktda → `exit 0`
9. Run 2 → idempotent, HEAD dəyişmir

### tsc gate
```bash
cd adda-nextjs && npm install --no-audit --no-fund   # ~31 paket, ~17 san
node_modules/.bin/tsc --noEmit -p tsconfig.json; echo $?   # 0 olmalıdır
```
`tsconfig`: `strict:true`, `@/*` alias, jsx preserve.
⚠️ **`next build` sandbox-da UĞURSUZ olur** — `fonts.googleapis.com` bloklanıb. Bu kod problemi DEYİL. tsc gate kifayətdir.

Strapi faylları üçün ayrıca standalone strict tsc (inline tip işlət, Strapi tipi import etmə ki, təkbaşına kompilyasiya olunsun).

---

## 5. SANDBOX MÜHİTİ

- İşçi clone: `/home/claude/w` (davamlı). Test clone: `/home/claude/t*` (hər dəfə təzə).
- `/bin/sh` = **dash** → `${PIPESTATUS}` yox, `<()` yox. İşlət: `cmd > file 2>&1; echo $?` + CR sayımı üçün Python.
- **pwsh ilkin quraşdırılmayıb.** Lazımdırsa: PowerShell 7.4.6 GitHub release-dən → `/opt/pwsh`. (GitHub API rate-limit-lidir; bilinən versiyanı birbaşa endir. `release-assets.githubusercontent.com` allowlist-dədir.)
- **Şəbəkə allowlist:** `onrender.com` **BLOKLANIB** → prod Strapi API-ni sandbox-dan yoxlaya bilmirsən. Zaurdan brauzerdə yoxlamasını istə.
- Git identity sandbox-da qurulmayıb → test clone-da `git config user.email/user.name` təyin et.

---

## 6. i18n MEXANİKASI

`adda-nextjs/lib/i18n.ts`:
- `export type Locale = 'az' | 'ru' | 'en'`
- `const T: Array<[string, string, string]> = [` … ~475 tuple
- `tr(az, locale)` = **tam-sətir exact lookup** (substring yox). Tapılmasa `az` qaytarır.

**Yeni açar əlavə etmə:**
- Anchor: `const T: Array<[string, string, string]> = [`
- Blokun əvvəlinə sentinel şərh qoy (məs. `// --- F2.6e ... ---`) → idempotent skip üçün
- Server komponentdə `tr('<az mətn>', locale)` çağır → `labels` obyektinə yığ → island-a prop ver
- **Apostrof işlətmə** (`'`) — TS tək-dırnaq və here-string-i korlayır
- Mövcud reusable açarlar: `'Adınız'`, `'Göndərilir'`, `'Uğursuz əməliyyat'`, `'Bağla'`, `'Email (istəyə bağlı)'`, `'Səbəb (istəyə bağlı)'`

---

## 7. POWERSHELL 5.1 TƏLƏLƏRİ

- `[locale]` / `[slug]` mötərizələri **wildcard** kimi qəbul olunur → `Test-Path`, `Get-Item`, `Select-String` **İŞLƏTMƏ**. Əvəzinə: `[System.IO.File]::Exists()`, `[System.IO.Directory]::Exists()`
- `New-Item`-də `-LiteralPath` yoxdur → yolu əl ilə böl
- **Rezerv dəyişənlər:** `$home`, `$host`, `$error` — heç vaxt işlətmə
- Tək-dırnaqlı here-string `@'...'@` işlət (template literal / `$` olan məzmun üçün)
- Platform-təhlükəsiz yol: zəncirli `Join-Path` (həm Linux-test pwsh, həm Windows)
- `git add -- 'path'` — literal pathspec ilə

---

## 8. ▸ F2.6e — SPESİFİKASİYA (təsdiqlənmiş)

### Passwordless magic-link identity
- Email → tokenli keçid (parolsuz)
- Strapi tərəfdə token yaratma/təsdiq, **qısa-ömürlü**
- Məqsəd: RSVP və correction submitter-lərini kimliyə bağlamaq

### Web Push
- Notification subscription (**VAPID**)
- Tədbir xatırlatmaları / yeni məzmun bildirişləri
- Service worker

### Hardening
- Rate-limit
- PII minimizasiya
- Token expiry
- CSRF / injection müdafiəsi

### Mövcud baza (F2.6d-dən)
`correction/lifecycles.ts` artıq `beforeCreate`-də `status="pending"` məcbur edir və `moderatorNote` təmizləyir — public `create` açıq olduğu üçün status-injection bağlıdır. **Eyni hardening pattern-i `rsvp` və `reaction` üçün də nəzərdən keçir.**

`adda-strapi/src/index.ts` → `PUBLIC_CREATE_UIDS` = `rsvp`, `reaction`, `correction`. Public read icazələri bootstrap-da verilir.

Moderation queue = **default Strapi admin content-manager** (status=pending filtri). Custom plugin YOX.

---

## 9. ▸ F2.7 — "intellekt" (növbəti)

- Grounded RAG AI co-pilot: Strapi məzmunu üzərində Meilisearch hybrid semantic search ilə
- NER entity-linking
- PII guardrail + prompt-injection müdafiəsi
- Tərcümə QA
- **Unified notification center:** F2.6e push + korreksiya statusu + RSVP təsdiqi bir mərkəzdə
- **Yalnız Strapi məzmunundan cavab** (hallucination yox), mənbə göstərmə

**Faza sırası:** oxu (F2.4 ✓) → səth (F2.5 ✓) → icma (F2.6) → intellekt (F2.7)

---

## 10. AÇIQ MƏSƏLƏLƏR

### ⚠️ HƏLL OLUNMAYIB: prod məzmun görünmür
`demo.adda.edu.az`-da admin-də əlavə edilmiş xəbər/elanlar görünmür.

`News.tsx` məntiqi: `news.length ? real : FALLBACK_NEWS` → Strapi **boş** qaytaranda statik fallback kartlar göstərilir (slug-suz, kliklənməyən). Yəni "xəbərlər görünür" ≠ real məzmun.

**Zaur brauzerdə yoxlamalıdır:**
```
https://adda-edu-az.onrender.com/api/articles?locale=az&pagination[pageSize]=5
```
- `{"data":[]}` → prod baza boş. Ehtimal: məzmun **lokal** Strapi-yə (SQLite) əlavə olunub, Neon-a yox. Həll: `https://adda-edu-az.onrender.com/admin`-də əlavə et.
- `403` → prod-da public read icazələri yoxdur
- ~50 san gözləmə → Render free tier yatıb

**Keep-alive:** cron-job.org → `/_health` endpoint, 10 dəqiqəlik interval (Render free tier yatır).

### Kiçik follow-up-lar
- `CorrectionIsland` yalnız `article` + `event` səhifələrindədir. `elanlar` (announcement) üçün əlavə etmək trivialdır — spec belə tələb edirdi.
- **Təsis ili ziddiyyəti: 1881 vs 1996 — HƏLL OLUNMAYIB.** i18n `T`-də hazırda 1996 işlənir. Məzmun məsələsidir, Zaur qərar verməlidir.

---

## 11. TƏSDİQLƏNMİŞ TƏŞKİLAT FAKTLARI

- "Rabitə nazirliyi" → **"Rəqəmsal İnkişaf və Nəqliyyat Nazirliyi"** (mincom.gov.az)
- "ASCON Holdinq" → **"AZCON Holding"** (7 Noyabr 2024 fərmanı)
- **ASCO** = "Azərbaycan Xəzər Dəniz Gəmiçiliyi" QSC (asco.az)
- **DDLA** (ddla.gov.az) həmin nazirliyin tabeliyindədir

---

## 12. STRAPI ÖYRƏNİLMİŞ DƏRSLƏR

- Sxemdəki `default:` **yalnız application-layer**-dir — `ALTER TABLE` mövcud sətirləri doldurmur. Həmişə idempotent bootstrap backfill yaz.
- Seed datası `src/index.ts`-də **inline** olmalıdır, `src/seed/`-dən import ETMƏ (`Cannot find module`).
- Single-type seed → "update-if-empty" pattern (Strapi boş entry avtomatik yaradır).
- `MEILISEARCH_HOST` mütləq `https://` prefiksi ilə — olmasa plugin səssizcə sınır.
- Public rol icazələri hər endpoint üçün **açıq şəkildə** təyin olunmalıdır.

## 13. CSS ÖYRƏNİLMİŞ DƏRSLƏR

- CSS transformasiyası üçün **postcss** işlət — əl ilə yazılmış parser `@import` URL-lərindəki nöqtəli vergüldə sınır.
- Build uğuru + eyni HTML **sübut etmir** ki, CSS düzgündür və tətbiq olunub.
- "Ölü" CSS-i statik analizlə **silmə** — runtime-da yaranan class-lar (məs. `className = 'face front'`) skanerə görünmür.
- CSS bundle doğrulaması müstəqil parser ilə CONTROL vs TEST build müqayisəsi tələb edir.
