---
description: Layihənin cari vəziyyətini ölç — struktur, məzmun doluluğu, ixtisaslar və menyu keçidləri. Yalnız oxuma, düzəliş etmir.
argument-hint: (arqumentsiz)
allowed-tools: Bash(npm run check:*) PowerShell(npm run check:*) Read Grep Glob
---

# Vəziyyət ölçmə

**Qayda: əvvəlcə diaqnostika, sonra düzəliş.** Bu əmr HEÇ NƏ düzəltmir —
yalnız ölçür və hesabat verir.

## 1. Dörd yoxlayıcını işlət

`adda-nextjs` qovluğundan:

| Əmr | Nə ölçür |
|---|---|
| `npm run check:units` | struktur bölmələri, rəhbər/heyət bağlantısı, sahələrin doluluğu |
| `npm run check:gaps` | məzmun doluluğu faizi + «sürətli qazanc» siyahısı |
| `npm run check:program-gaps` | ixtisas səhifələrinin doluluğu |
| `npm run check:menu` | menyu keçidləri (OK / DINAMIK / PLASEHOLDER / QIRIQ) |

Hər dördü canlı Strapi-yə (`adda-edu-az.onrender.com`) sorğu atır.
**Render pulsuz plandadır** — ilk sorğu 30-60 saniyə isinmə çəkə bilər,
bu xəta deyil. Timeout olarsa bir dəfə təkrar işlət, sonra dayan.

## 2. Nəticəni `docs/HANDOFF.md` ilə tutuşdur

Sənəddəki son ölçmə rəqəmlərini oxu və fərqi göstər — irəliləyiş varmı, geriləmə varmı.

## 3. Hesabat formatı

Qısa cədvəl:

```
check:units          <nəticə>
check:gaps           <%>  (əvvəl: <%>)
check:program-gaps   <%>  (əvvəl: <%>)
check:menu           OK <n> · DINAMIK <n> · PLASEHOLDER <n> · QIRIQ <n>
```

Sonra **ən sərfəli 5 iş** — `check:gaps` çıxışındakı «sürətli qazanc»
siyahısından, hər biri üçün: bölmə adı, çatışmayan sahə, niyə sərfəlidir
(bir sahə bütöv blok açırsa bunu yaz).

## 4. Nə etmə

- Heç bir fayl redaktə etmə.
- Rəqəmləri yaddaşdan və ya `docs/HANDOFF.md`-dən təxmin etmə —
  **alətin öz çıxışını göstər**. Bu layihədə iki dəfə səhv diaqnoz
  məhz bu addım atlandığı üçün olub.
- Yoxlayıcı işləmirsə səbəbini yaz, nəticəni uydurma.
