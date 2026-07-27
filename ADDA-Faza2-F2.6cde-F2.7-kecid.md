# ADDA — Faza 2 keçid promptu: F2.6c (redo) → F2.6d → F2.6e → F2.7

> Bunu yeni çatın ƏVVƏLİNƏ yapışdır. Claude birbaşa icra edir (Gemini yox). Ünsiyyət: **Azərbaycanca, qısa, direktiv.**

---

## 0. ROL & KONTEKST
Zaur — frontend arxitekt, ADDA (Azərbaycan Dövlət Dəniz Akademiyası) saytını modernləşdirir. Trilingual (az/ru/en), "2031-ə qədər gələcəyə davamlı" standart. Hər faza öz çatında; keçid tam-kontekst sənədlə. Dizayn QIFILLI, dəyişmir.

## 1. TEXNİKİ STACK
- **Monorepo:** `github.com/zauraziz/adda.edu.az` — `adda-nextjs/` + `adda-strapi/`. Zaur bütün push-ları özü edir; Claude **lokal-commit-ready `.ps1`** verir.
- **Frontend:** Next.js 15.1 + React 19 → Vercel (`demo.adda.edu.az`, prj_u6eNrG0FMyT9pHHV2v2hs2vavqwy, team_W6LJ6hacEhzqZm9vBGWxEUpb). marked (markdown), cobe 0.6.4, gsap 3.12.5.
- **CMS:** Strapi 5.50 → Render (`https://adda-edu-az.onrender.com`). draftAndPublish=True → public API yalnız **published** qaytarır.
- **DB:** Neon Postgres (prod), SQLite (local dev).
- **Search:** Meilisearch, index `adda`, `strapi-plugin-meilisearch@^0.16.5`. `MEILISEARCH_HOST` MÜTLƏQ `https://` prefiksli.
- **Dev:** Windows, PowerShell 5.1, `E:\web-projects\adda.edu.az`.

## 2. DİZAYN TOKENLƏRİ (globals.css :root — dəyişməz)
```
Navy:  --navy-900 #071E2E · --navy-800 #0B3D5C · --navy-700 #0E4D73 · --navy-600 #12608F · --navy-50 #F0F8FF
Gold:  --gold-600 #A68942 · --gold-500 #C9A961 · --gold-400 #D4BB7C · --gold-100 #F5EDDA
Gray:  50 #F9FAFB · 100 #F3F4F6 · 200 #E5E7EB · 300 #D1D5DB · 500 #6B7280 · 700 #374151 · 900 #111827
--white #FFFFFF · --error #DC2626
--font-display 'Fraunces', serif   (başlıqlar)
--font-body 'Manrope', sans-serif  (gövdə)
--text-xs/sm/base/lg/xl (clamp) · --gradient-navy (linear 180deg navy)
--nav-sh-lg: 0 12px 32px -6px rgba(11,61,92,.18) · --nav-dur 280ms · --nav-ease cubic-bezier(0.16,1,0.3,1)
DİQQƏT: --nav-sh-md YOXDUR (inline shadow işlət). İkonlar: Tabler `ti ti-*`.
```

## 3. İŞ QAYDALARI — BLOK A (deliverable)
1. Təzə `git clone --depth 1` → tam-fayl dəyişiklik → **BOM-prefiksli `.ps1`** → **lokal commit, PUSH ETMƏ**.
2. `.ps1` Python generatorla yaradılır: payload oxu `io.open(...,encoding='utf-8')`; `.ps1` yaz `io.open(...,'utf-8-sig',newline='\n')` (BOM + Unix LF + trailing `\n`).
3. Fayl məzmunu **literal here-string** `@'...'@` (interpolasiya yox). Generator assert etməlidir: **heç bir məzmun sətri `'@` ilə başlamır**.
4. `Write-FileNoBom` = `[System.IO.File]::WriteAllText($path, ($c -replace "`r`n","`n"), (New-Object System.Text.UTF8Encoding($false)))` + trailing `\n`.
5. `$env:GIT_LITERAL_PATHSPECS = '1'` (bracket `[locale]`/`[slug]` yolları üçün). `git add -- (Join-Path $nx '...')` mütləq yollarla, `Set-Location $nx`. **`-A` işlətmə.**
6. Idempotent: `stage sayi: 0` → **exit 0** (xəta yox, sarı info). i18n dəyişiklikləri `.Contains()` guard + `.Replace()` (regex yox).
7. Commit mesajı **ASCII** (PS 5.1 Azərbaycan hərflərini mangling edir).

### KRİTİK PowerShell 5.1 tələləri
- `[locale]` bracket **glob** kimi qəbul edilir: `Test-Path -LiteralPath`, `Select-String`, `Get-Item` MÖVCUD OLMAYAN faylda səhv `True` qaytarır → **mövcudluq üçün `[System.IO.File]::Exists` / `[System.IO.Directory]::Exists` / `Join-Path`** (bunlar glob etmir).
- `New-Item` `-LiteralPath` yoxdur (amma faylları overwrite edirsənsə WriteAllText kifayət, mkdir lazım deyil).
- Rezerv dəyişənlər: `$home`, `$host`, `$error` — işlətmə.
- Single-quote here-string `@'...'@` template literal / `$` / backtick olan fayllar üçün.

## 4. VALİDASİYA METODLARI
### Frontend REAL tsc (GOLD STANDARD — bu sessiyada təsdiqləndi)
adda-nextjs **AZ dependency-lidir**: `npm install` cəmi **31 paket, ~17s** (sürətli!). Ona görə:
```
cd adda-nextjs && npm install --no-audit --no-fund
node_modules/.bin/tsc --noEmit -p tsconfig.json > /tmp/x.log 2>&1; echo $?   # exit 0 tələb
```
Real `@types/react` client island `onChange`/`onSubmit` handler-larını **düzgün** yoxlayır (shim artefaktı yox). **Bunu işlət.**
- `next build` sandbox-da İŞLƏMİR: `fonts.googleapis.com` bloklanıb → `next/font/google` Fraunces/Manrope çəkə bilmir → font mərhələsində fail. Modullar (öz fayların) ondan ƏVVƏL kompilyasiya olur — bu "fail" kodla bağlı DEYİL. **tsc gate kifayətdir.**
- Strapi tsc: `/home/claude/adda/adda-strapi/node_modules/.bin/tsc` (əgər clone edilibsə).

### `.ps1` testi (təzə clone)
`.ps1`-i clone kökünə kopyala → `/opt/pwsh/pwsh -NoProfile -File ./x.ps1`. Yoxla: stage sayı düzgün, commit yaradıldı, **bayt-eyni** (`diff -q` hər fayl işçi clone ilə), BOM (`head -c3 | od -An -tx1` → `efbbbf`), **CR=0** (`python3 -c "print(open(f,'rb').read().count(b'\r'))"`), **idempotent** (2ci run stage 0 + i18n "artiq movcud"), toxunulmamalı fayllar dəyişməyib (`git diff --name-only HEAD~1 HEAD`).

### bash_tool mühiti (DİQQƏT)
`/bin/sh` = **dash**: `${PIPESTATUS[0]}`, `$'\r'` (ANSI-C quoting), `<()` process substitution **YOXDUR**. → `cmd > file 2>&1; echo $?` işlət, CR sayı üçün Python. `/bin/bash -c "..."` alternativ.

## 5. CARİ VƏZİYYƏT (git zənciri, ən son sonda)
```
b7e6bfc  F2.5 i18n backfill (T lüğəti trilingual) — F2.5 BİTMİŞ
9be28ab  F2.6a  Strapi rsvp/reaction/correction tipləri + PUBLIC_CREATE_UIDS + reaction READ icazəsi
b8e3795  F2.6b  (Gemini RSVP — SONRADAN CLAUDE TƏRƏFİNDƏN ƏVƏZ EDİLDİ)
e275b97  fix    RSVP null→undefined
f872ad5  F2.6c  (Gemini ReactionBar)
a8d5ab3  fix    STRAPI_URL → NEXT_PUBLIC_STRAPI_URL client-ə expose
ae1c681  revert F2.6c (BOTCHED)
3b347ec  fix(F2.6c) strapi.ts build crash düzəldildi & Reactions  ← origin BURADA idi
[yeni]   feat(F2.6b): RSVP + .ics redo - polished panel, pill status  ← Claude verdi, ZAUR PUSH EDİR
```
**İLK ADDIM (yeni çat):** `git clone` sonra `git log --oneline -5` ilə F2.6b-redo commit-inin origin-də olduğunu təsdiqlə. Yoxdursa → Zaur hələ push etməyib, gözlə/soruş.

### Strapi (F2.6a — origin-də hazır)
`rsvp` (eventSlug, eventTitle, name, email, status, guests, note), `reaction` (targetType, targetSlug, emoji), `correction` (F2.6d üçün) content-type-ları. `PUBLIC_CREATE_UIDS` public `create` icazəsi. `reaction` üçün public `READ` (sayğac üçün). Public role icazələri **hər endpoint üçün açıq** olmalıdır.

### Frontend strapi.ts (kritik)
`export const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || process.env.STRAPI_URL || 'http://localhost:1337'` — **client island-lar bunu import edir** (RsvpIsland, ReactionBar). Server fetch-lər də NEXT_PUBLIC_STRAPI_URL-a birinci baxır.

## 6. F2.6b REDO — CLAUDE-UN YENİCƏ ETDİYİ (push gözlənilir)
Gemini F2.6b silindi, cilalanmış yenidən quruldu. **5 fayl** (overwrite): `lib/ics.ts` (RFC 5545 escape), `app/_components/RsvpIsland.tsx` (pill status seçici, navy-gradient panel, gold CTA), `app/_styles/21-rsvp.css` (on-brand), `app/[locale]/tedbirler/[slug]/page.tsx` (F2.5c struktur + RSVP + ReactionBar **kontent sütununda** `.na-reactions` wrapper) + `lib/i18n.ts` (+2 açar: `Göndərilir`, `Bu tədbirdə yerinizi təsdiqləyin`).
- **Validasiya:** real `tsc --noEmit` exit 0; `.ps1` bayt-eyni + BOM+LF + idempotent; F2.6c toxunulmadı.
- **VACİB:** page.tsx artıq `ReactionBar`-ı təmiz inteqrasiya edir (`.na-reactions { max-width:720px; margin:1.75rem auto 0 }` 21-rsvp.css-də). F2.6c redo **səhifəni yenidən yazmamalıdır** — yalnız ReactionBar.tsx + 22-reactions.css-i əvəz et.
- **RsvpIsland etiketləri** page-də `tr()` ilə props kimi ötürülür (client tam T lüğətini import ETMİR — ~55kB islands qaydası). Açarlar: register/subtitle/status/going/maybe/declined/name/email/guests/note/submit/sending/successMsg/addToCal/error.

---

## 7. BU ÇATDA GÖRÜLƏCƏK İŞLƏR (sıra ilə)

### ▸ F2.6c — REDO (ReactionBar, cilalanmış) — İLK
Gemini-nin ReactionBar-ı botched revert (ae1c681) + tələsik recovery (3b347ec) keçib. F2.6b kimi **özün yenidən qur, estetikaya diqqət.**
- Origin-dən oxu: `app/_components/ReactionBar.tsx` + `app/_styles/22-reactions.css` (cari işlək versiya, real tsc exit 0).
- **Dənizçilik reaksiyaları:** ⚓ 🚢 🧭 🌊 (bu emoji dəsti QALIR). Client island; `STRAPI_URL` import edir; POST `/api/reactions` body `{data:{targetType,targetSlug,emoji}}`; sayğaclar üçün GET (F2.6a public READ). Props: `targetType` (məs "event"), `targetSlug`.
- **Overwrite yalnız 2 fayl:** ReactionBar.tsx + 22-reactions.css. **Səhifə toxunulmur** (F2.6b redo-dan təmiz gəlir). Optimist UI, gold vurğu, `.na-reactions` konteynerinə uyğun eni (720px), reduced-motion, on-brand navy/gold.
- Validasiya: təzə clone (F2.6b-redo baseline) → npm install → real tsc exit 0 → .ps1 (2 fayl, idempotent, bayt-eyni).

### ▸ F2.6d — Düzəliş inbox + diff-view + moderation queue
Crowdsourced content düzəlişi (istifadəçi "bu mətndə səhv var" bildirir).
- **Strapi:** `correction` tipi F2.6a-da yaradılıb (yoxla: sahələr — məs targetType, targetSlug, field, originalText, suggestedText, submitterEmail, status[pending/approved/rejected]). Lazımsa genişləndir + public `create` icazəsi.
- **Frontend:** detal səhifələrinə (article/event) "Düzəliş təklif et" island → **strukturlaşdırılmış diff-view** (original vs təklif, sətir/söz səviyyəsində fərq). POST `/api/corrections`.
- **Moderation:** Strapi admin-də moderation queue (pending korreksiyalar). Sadə admin siyahı/status-dəyişmə kifayət ola bilər (custom admin plugin lazım deyilsə).
- Trilingual i18n; on-brand estetik (diff yaşıl/qırmızı ştrixlər navy/gold ilə uyğunlaşdırılmış).

### ▸ F2.6e — Passwordless magic-link identity + Web Push + hardening
- **Magic-link:** email → tokenli keçid (parolsuz). Strapi tərəfdə token yaratma/təsdiq + qısa-ömürlü. (RSVP/correction submitter-lərini bağlamaq üçün.)
- **Web Push:** notification subscription (VAPID), tədbir xatırlatmaları / yeni məzmun. Service worker.
- **Hardening:** rate-limit, PII minimizasiya, token expiry, CSRF/injection müdafiəsi.

### ▸ F2.7 — Grounded RAG AI co-pilot ("intellekt")
Strapi məzmunu üzərində əsaslandırılmış (grounded) AI köməkçi.
- **Retrieval:** Meilisearch (`adda` index) ilə hybrid semantic search.
- **NER entity-linking:** varlıqları (şəxs/proqram/fakültə) məzmuna bağla.
- **Guardrails:** PII müdafiəsi + prompt-injection müdafiəsi.
- **Translation QA:** trilingual keyfiyyət yoxlaması.
- **Unified notification center:** F2.6e push + korreksiya statusu + RSVP təsdiqi bir mərkəzdə.
- Yalnız Strapi məzmunundan cavab (hallucination yox); mənbə göstərmə.

**Faza sırası (memory):** oxu (F2.4 ✓) → səth (F2.5 ✓) → icma (F2.6) → intellekt (F2.7).

---

## 8. ƏSAS ÖYRƏNMƏLƏR
**Strapi:** `default:` schema-da yalnız application-layer (ALTER TABLE backfill etmir) → idempotent bootstrap backfill lazım. Seed `src/index.ts`-də inline (import yox → Cannot find module). Single-type seed "update-if-empty". `MEILISEARCH_HOST` `https://` prefiksli.

**Next.js / i18n:** Client island-lar tam T lüğətini (~55kB) DƏYƏR kimi import etməməli → server komponentindən əvvəlcədən tərcümə edilmiş string-ləri props kimi ötür (NewsletterIsland / RsvpIsland pattern). Content: Article, Program, Page (single-type Menu), Event (F2.5), i18n + factory faylları.

**CSS:** CSS transformasiyası üçün postcss (hand-rolled parser `@import` URL-lərindəki `;` üzərində qırılır). Build success + eyni HTML CSS-in tətbiq olunduğunu SÜBUT ETMİR. "Ölü" CSS-i static analizlə silmə (runtime `className = 'face front'` scanner-ə görünmür). Bundle yoxlaması müstəqil parser CONTROL vs TEST.

**Təşkilati faktlar (təsdiqli):** "Rabitə nazirliyi" → **Rəqəmsal İnkişaf və Nəqliyyat Nazirliyi** (mincom.gov.az). "ASCON Holdinq" → **AZCON Holding** (7 Noyabr 2024 fərman). DDLA (ddla.gov.az) o nazirlik altında. ASCO = **Azərbaycan Xəzər Dəniz Gəmiçiliyi QSC** (asco.az). Təsis ili uyğunsuzluğu: **1881 vs 1996 — həll olunmayıb** (məzmun məsələsi, flag edilib).

## 9. PROD INCIDENT (guidance verildi — təkrarlanarsa)
Şikayət: admin-də əlavə olunan xəbər/tədbir/elan `demo.adda.edu.az/az`-da görünmür. **Build problem DEYİL** (3b347ec real tsc exit 0). Ana səhifə `getHomeNews→getArticles` (visibility filtri yox, son 4 published); fetch boş → `News.tsx` static `FALLBACK_NEWS` göstərir (problemi maskalayır). Elan/tədbir /az-da statik placeholder — əsl siyahılar `/az/elanlar`, `/az/tedbirler`-də.
**Ən ehtimallı səbəb:** Vercel-də `NEXT_PUBLIC_STRAPI_URL` səhv/boş → server fetch də sınır → fallback. **Test:** brauzerdə `https://adda-edu-az.onrender.com/api/articles?locale=az&sort=newsDate:desc&pagination[pageSize]=5` aç → xəbərlər görünür = frontend/Vercel problemi; `{"data":[]}` = published deyil / səhv locale; timeout = Render pulsuz Strapi yatıb. **Tövsiyə:** Vercel → Env Vars → `NEXT_PUBLIC_STRAPI_URL = https://adda-edu-az.onrender.com` (sonda `/` yox) → Redeploy. Keep-alive: cron-job.org → `/_health` (10 dəq).

## 10. ALƏTLƏR / MÜHİT
- pwsh: `/opt/pwsh/pwsh -NoProfile -File`.
- Network allow: github/npm/pypi/ubuntu/crates/api.anthropic.com. **ƏLÇATMAZ:** prod Strapi (onrender.com), `fonts.googleapis.com`.
- İşçi clone konvensiyası: bir davamlı clone (`/home/claude/w` və ya analoji) + per-faza `tsc` gate; admin build yalnız sonda; tight grep (log dump yox); specs-siz kor build yox.
- Deliverable: BOM-prefiksli `.ps1` (utf-8-sig, Unix LF, trailing `\n`).
- Dev-də pulsuz resurs tövsiyə et; paid yalnız prod üçün.
