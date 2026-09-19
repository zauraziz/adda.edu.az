---
description: Ev qaydası ilə deliverable paketi hazırla — Python-la generasiya olunan idempotent BOM-lu .ps1
argument-hint: [F5.35 paketin adı və məqsədi]
allowed-tools: Read Grep Glob Write Edit Bash(python3 *) Bash(git status *) Bash(git diff *)
---

# Paket: $ARGUMENTS

## Format qaydaları — dəyişmir

- Skript **Python ilə generasiya olunur**, əl ilə yazılmır.
- Çıxış: `.ps1`, **BOM-lu UTF-8** (`utf-8-sig`), **LF** sətir sonu.
- **İdempotent:** ikinci işləmədə `stage sayi: 0`, sarı info mesajı, `exit 0`.
  Bayt-baytda eyni nəticə.
- Repo kökündəki `*.ps1` faylları `.gitignore`-dadır — commit olunmur.

## PowerShell 5.1 tələləri

- `[locale]` yolda **joker simvol sinfi** kimi oxunur → hər yerdə
  `-LiteralPath` (`Test-Path`, `Select-String`, `Get-Item`).
- `New-Item`-də `-LiteralPath` YOXDUR →
  `[System.IO.Directory]::CreateDirectory($yol)` işlət.
- Tək dırnaqlı here-string (`@'...'@`) parsinqi sındırır → fayl məzmununu
  **base64 kimi göm**, `[System.IO.File]::WriteAllBytes` ilə yaz.
- Qorunmuş dəyişənlər: `$home`, `$host`, `$error` — işlətmə.
- Dəyişən adları hərf həssas deyil: `$LibStrapi` və `$libStrapi` eynidir.
- `$ErrorActionPreference='Stop'` altında native əmrin `stderr`-i
  `NativeCommandError` kimi partlayır → `npm`/`tsc` çağırışında müvəqqəti
  `Continue`.
- Sətir müqayisəsi `-eq` hərf həssas deyil; bayt dəqiqliyi üçün `-ceq`.

## Böyük fayl qaydası

`adda-strapi/src/index.ts` (215 KB) kimi fayllarda **çoxlu ardıcıl lövbər
işlətmə** — əvvəlki əvəzləmə sonrakı lövbərin kontekstini dəyişir və proses
ortada dayanır. Belə hallarda faylı bütövlükdə yaz.

## Paketin tərkibi

1. Nə dəyişir — fayl siyahısı, hər biri bir sətirlə
2. Skriptin özü
3. Qapılar (`/qapi`) — hansıları işlədilməlidir
4. Commit mesajı (ASCII, `F5.x: ...`)
5. Seed bayrağı lazımdırsa — hansı, hansı sıra ilə (`/seed`)
6. Admin paneldə əl işi lazımdırsa — dəqiq siyahı

## Prinsiplər

- **Ya tam, ya heç nə.** Yarımçıq tətbiq olunmuş dəyişiklik ən pis nəticədir.
- **Üstündən yazma.** Mövcud dəyəri deyil, yalnız boş sahəni doldur.
- Yeni npm paketi ƏLAVƏ EDİLMİR — mövcud vasitə çatmırsa əvvəlcə soruş.
