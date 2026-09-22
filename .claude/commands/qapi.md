---
description: Məcburi yoxlama qapıları — tsc --noEmit (hər iki layihə), sxem dəyişibsə əlavə build və tip generasiyası
argument-hint: (arqumentsiz)
allowed-tools: Bash(npx tsc --noEmit*) PowerShell(npx tsc --noEmit*) Bash(git status *) Bash(git diff *) Read Grep Glob
---

# Yoxlama qapıları

Hər kod dəyişikliyindən sonra, commit-dən ƏVVƏL işləyir.

## 1. Nəyin dəyişdiyini gör

`git status --short` və `git diff --stat` — hansı layihələrə toxunulub.

## 2. Qapılar

**Next.js** (dəyişiklik `adda-nextjs/` altındadırsa):

```
cd adda-nextjs && npx tsc --noEmit
```

**Strapi** (dəyişiklik `adda-strapi/` altındadırsa):

```
cd adda-strapi && npx tsc --noEmit -p tsconfig.json
```

**Strapi admin paneli** (dəyişiklik `adda-strapi/src/admin/` altındadırsa —
server tsconfig-i bu qovluğu İSTİSNA edir, yuxarıdakı qapı onu yoxlamır):

```
cd adda-strapi && npx tsc --noEmit -p src/admin/tsconfig.json
cd adda-strapi && npm run build
```

## 3. Sxem dəyişibsə ƏLAVƏ olaraq

`adda-strapi/src/api/**/schema.json` dəyişibsə:

```
cd adda-strapi && npm run build
cd adda-strapi && node node_modules/@strapi/strapi/bin/strapi.js ts:generate-types
```

Generasiya olunan tiplər git-də izlənir — commit-ə daxil edilməlidir.

## 4. Tələlər

- **`npm run build` (Next.js) etibarlı qapı DEYİL** — qumluqda
  `fonts.googleapis.com` bloklandığı üçün uğursuz olur. Yalnız
  `tsc --noEmit` işlət.
- PowerShell 5.1-də `$ErrorActionPreference='Stop'` altında `tsc`-nin
  `stderr`-i `NativeCommandError` kimi partlayır — skript içində
  müvəqqəti `Continue` qoy.
- Yeni content type əlavə olunubsa: **Strapi admin paneldə Public rola
  `find` və `findOne` icazəsi verilməlidir.** Verilməsə frontend səssizcə
  boş qalır — bu, `hero` və `facility` tiplərində artıq iki dəfə olub.
  Bunu qapı siyahısına xatırlatma kimi yaz.

## 5. Nəticə

Hər qapı üçün: **keçdi / keçmədi + xəta mətni**. Bir qapı keçmirsə
commit təklif etmə — əvvəlcə düzəlt.
