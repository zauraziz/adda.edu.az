---
description: Növbəti çat üçün ötürmə sənədini yenilə (docs/HANDOFF.md) — əvvəlcə ölç, sonra yaz
argument-hint: (arqumentsiz)
allowed-tools: Read Write Edit Grep Glob Bash(npm run check:*) PowerShell(npm run check:*) Bash(git log *) Bash(git status *)
---

# Ötürmə sənədi

Hədəf fayl: `docs/HANDOFF.md`. Köhnəsini oxu, **əvəz et** — yanına yeni fayl yaratma.

## 1. Əvvəlcə ölç

`/durum` addımlarını işlət. Köhnə rəqəmləri köçürmə — təzə ölçmə yaz.
`git log --oneline -1` ilə son commit-i götür.

## 2. Struktur — bu sıra saxlanılır

```
# ADDA saytı — çat ötürməsi
**Tarix:** <bugün> · **Son commit:** `<hash>` (<paket adı>)

1. İlk addım — vəziyyəti ölç        (əmrlər + son ölçmə rəqəmləri)
2. Dərhal edilməli — Strapi admin   (kod deyil, əl işi; cədvəl: İş | Səbəb)
3. İşlədilməli seed bayraqları      (bayraq | hansı data faylını oxuyur)
4. Cavabı gözlənilən suallar        (nömrəli; hansı iş bloklanıb)
5. Məzmun işi — əsas əngəl          (faizlər + ən sərfəli iş sırası)
6. Qalan kod işləri                 (cədvəl: İş | Vəziyyət)
7. Bu söhbətdə çatdırılan fayllar   (yol + bir sətir izah)
8. Yadda saxlanmalı tələlər         (yalnız BU söhbətdə düşülənlər)
```

## 3. Qaydalar

- **Daimi qaydalar `CLAUDE.md`-dədir** — onları təkrarlama. Bu sənəd yalnız
  **açıq qalan işləri** sadalayır.
- Hər bənd **əməl edilə bilən** olmalıdır: kim, nəyi, harada.
- Həll olunmuş bəndləri sil — arxiv saxlama.
- Cavabsız suallar 4-cü bölmədə qalır; cavab gəlibsə sualı silib işi
  müvafiq bölməyə köçür.
- Sənəd bir ekrandan uzun olmasın — uzanırsa ən köhnə həll olunmuş
  bəndləri at.

## 4. Sonunda

Dəyişən bölmələri bir-iki sətirlə xülasə et. `docs/HANDOFF.md` repoda
izlənir — commit üçün `/commit` işlət.
