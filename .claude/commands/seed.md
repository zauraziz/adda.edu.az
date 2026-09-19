---
description: Seed bayrağı iş axını — bayraq qoy, deploy, logu yoxla, bayrağı SİL, admin paneldə Publish et
argument-hint: [BAYRAQ_ADI]
allowed-tools: Read Grep Glob Bash(git log *) Bash(git diff *)
---

# Seed bayrağı: $ARGUMENTS

Bütün seed blokları `adda-strapi/src/index.ts` → `bootstrap()` içindədir və
env bayrağı ilə qorunur.

## Dörd addım — sırası dəyişmir

1. **Render-də `$ARGUMENTS=true` qoy** (Environment → Add variable)
2. **Deploy** (manual deploy və ya avtomatik)
3. **Logu oxu** — neçə qeyd yazıldı, neçəsi atlandı, xəta varmı
4. **Bayrağı SİL** — Render-dən dəyişəni tam çıxar

> Bayraq silinməyəndə hər boot-da yenidən işləyir. Bir dəfə `HEAD_RESEED` +
> `KAFEDRA_RESEED` unudulub və boot 220 saniyəyə çıxıb.

## 5. Sonra: admin paneldə Publish

**Bütün seed-lər yalnız QARALAMAYA yazır.** `documents().update()` publish
etmir. Seed kodunda `publish()` çağırılmayıbsa, məzmun ictimai API-də
GÖRÜNMÜR — admin paneldə əl ilə Publish etmək lazımdır.

Seed koduna bax və hansının olduğunu de: `publish()` var → əl işi lazım
deyil; yoxdur → hansı qeydlərin Publish edilməli olduğunu siyahıla.

## Mövcud bayraqlar

```
UNIT_RESEED · HEAD_RESEED · KAFEDRA_RESEED · NAME_CLEAN · STAFF_ARCHIVE
MENU_RESEED · PAGES_RESEED · MILESTONE_RESEED · RECTOR_RESEED
SOCIAL_RESEED · LEADERSHIP_RESEED · ABOUT_MIGRATE · PLAN_SEED
PROGRAM_TEXT_SEED · HERO_SEED · PROGRAM_UPDATE_SEED · NEW_PROGRAM_SEED
FACILITY_SEED
```

Bayraq adı verilməyibsə: `adda-strapi/src/index.ts`-də `process.env.` axtar,
mövcud bayraqları və hər birinin nə oxuduğunu siyahıla, sonra soruş.

## Yoxlanılası tələlər

- **Ağır seed portu bloklamamalıdır.** Strapi `bootstrap()` bitənə qədər
  portu açmır — Render `No open ports detected` yazır, sayt əlçatmaz qalır.
  Uzun iş `setTimeout(..., 5000)` ilə arxa plana atılmalıdır.
- **Hər 25 qeyddə irəliləyiş logu** — əks halda ilişib-ilişmədiyi bilinmir.
- **Üstündən yazma yoxdur** — seed yalnız BOŞ sahəni doldurur.
- Data faylı `tools/migration/data/` altındadırsa, `tools/migration/.gitignore`
  faylında `!data/<ad>.json` istisnası olmalıdır. **Bu iki dəfə unudulub** —
  fayl repoda yoxdursa Render-də seed boş işləyir. Yoxla.
- `MENU_RESEED` xüsusi haldır: `true` qalıbsa hər deploy menyunu sərt seed
  strukturuna qaytarır, əl ilə silinmiş bəndlər geri gəlir.
