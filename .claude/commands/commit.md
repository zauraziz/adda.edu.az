---
description: Lokal commit — ASCII mesaj, F-seriyalı format, --literal-pathspecs məcburi, push QADAĞAN
argument-hint: [F5.35: qisa ingilis mesaj]
allowed-tools: Bash(git status *) Bash(git diff *) Bash(git add *) Bash(git commit *) Bash(git log *) PowerShell(git add *) PowerShell(git commit *)
---

# Lokal commit

## Əvvəl: qapılar

Kod dəyişibsə `/qapi` addımları keçməlidir. Keçməyibsə commit etmə.

## 1. Vəziyyəti göstər

`git status --short` — nə dəyişib, nə izlənmir.

## 2. Stage

```
git add --literal-pathspecs <yollar>
```

**`--literal-pathspecs` MƏCBURİDİR.** `[locale]` qovluq adı joker simvol
kimi oxunur və fayl səssizcə əlavə olunmur.

`tools/migration/data/` altında yeni JSON varsa: əvvəlcə
`tools/migration/.gitignore` faylında `!data/<ad>.json` istisnası olduğunu
yoxla, olmasa əlavə et — əks halda `git add` faylı qəbul etməyəcək.
Stage-dən sonra `git status` ilə faylın həqiqətən düşdüyünü TƏSDİQLƏ.

## 3. Commit

```
git commit -m "F5.35: short english message"
```

- **Yalnız ASCII**, ingilis dilində. Azərbaycan hərfləri, emoji YOX.
- Format: `F<sprint>.<nömrə>: ...` və ya `K<nömrə>: ...`
- Nömrə verilməyibsə: `git log --oneline -10` ilə sonuncunu tap, növbətini seç.

## 4. Push

**Heç vaxt `git push` etmə.** Push Zaur müəllimindir.
Commit-dən sonra yalnız hash və qısa xülasə ver:

```
<hash>  F5.35: short english message
   <n> fayl, +<n>/-<n>
```

Push lazımdırsa bunu Zaur müəllimə DE, özün etmə.
