# ADDA saytı — çat ötürməsi

**Tarix:** 19.09.2026 · **Son commit:** `46a96fc` (F5.34e)

Bu sənəd hər çatın sonunda `/handoff` əmri ilə yenilənir. Layihənin daimi
qaydaları **repodakı `CLAUDE.md`**-dədir — bu fayl onu əvəz etmir, yalnız
**açıq qalan işləri** sadalayır.

---

## 1. İlk addım — vəziyyəti ölç

Yeni çatda işə başlamazdan əvvəl `/durum` əmrini işlət. Əl ilə:

```
cd adda-nextjs
npm run check:units          # struktur bölmələr
npm run check:gaps           # məzmun doluluğu (son ölçmə: 37%)
npm run check:program-gaps   # ixtisaslar (son ölçmə: 64%)
npm run check:menu           # menyu keçidləri
```

Köhnə rəqəmlərə güvənmək əvəzinə təzə ölçmə ilə başlamaq daha düzgündür.

---

## 2. Dərhal edilməli — Strapi admin (kod deyil)

| İş | Səbəb |
|---|---|
| **`facility` → Public rol → `find`, `findOne`** | F5.34a-da yaradılıb. Verilməsə auditoriya blokları boş görünəcək — `hero` tipində eyni səhv olmuşdu |
| **`MENU_RESEED` bayrağını Render-də yoxla** | `true` qalıbsa hər deploy menyunu sərt seed strukturuna qaytarır — silinən bəndlər geri gəlir |
| **2 mərkəz rəhbərinin `position` sahəsi** | «Müdir» → «Mərkəz müdiri» (şöbələrlə eyni standart). İnformasiya resurs mərkəzi, Təhsil innovasiyaları mərkəzi |
| **`«Tətbiqi mexanika»` kafedralı 1 şəxs → Publish** | Qaralama təmiz, nəşr köhnə qalıb (F3.16 seed qüsuru) |

---

## 3. İşlədilməli seed bayraqları

Repoda data faylları **var**, amma seed işlədilib-işlədilmədiyi təsdiqlənməyib.
İş axını üçün `/seed <BAYRAQ>` əmrinə bax.

```
FACILITY_SEED         facilities.json — 31 auditoriya/laboratoriya
PROGRAM_TEXT_SEED     19 × program-content-*.json — abituriyent mətnləri
PROGRAM_UPDATE_SEED   program-updates-2026.json — təhsil haqqı, dillər, yer sayı
NEW_PROGRAM_SEED      new-programs-2026.json — 4 Kollec + 3 doktorantura
HERO_SEED             heroes-seed.json — 5 şəhid məzun
```

**Qayda (CLAUDE.md):** bayraq qoy → deploy → logu yoxla → **bayrağı SİL**.
Bütün seed-lər yalnız qaralamaya yazır — admin paneldə oxuyub **Publish**
etmək lazımdır.

---

## 4. Cavabı gözlənilən suallar

Bunlar olmadan müvafiq iş davam edə bilməz:

1. **Mərkəzi telefon** — səhifədə `+994 12 4043700`, altbilgidə `+994 12 404 33 40`. Hansı doğrudur?
2. **Qanuni müddətlər** — vətəndaş müraciətlərinə baxılma müddəti (hüquq məsləhətçisi təsdiqləməlidir). Korrupsiya müraciətləri üçün 20 iş günü təsdiqlənib, ümumi müddət yox.
3. **İngilis dili kafedrası auditoriyası** — mənbə cədvəldə «Təyinatı» var, amma otaq nömrəsi və ad **boşdur**. Dəqiqləşdirilsə əlavə olunar.
4. **Dəniz naviqasiyası Təhsil Proqramı sənədi** — yan panelə PDF kimi qoymaq üçün. Digər ixtisasların sənədləri var, yalnız bu birinin `.docx`/imzalı PDF-i çatmır.
5. **EEM STCW sertifikatı** — TVS-də «Təlim Tədris Mərkəzindən öyrənə bilərsən» yazılıb, dəqiq cavab bilinmir.
6. **Kitabxana (Elektron Kitabxana, I və II korpus)** — kafedra deyil, `informasiya-resurs-merkezi`-yə bağlansın?

---

## 5. Məzmun işi — əsas əngəl

Kod tərəfi irəlidədir, **məzmun geri qalır**. Son ölçmə:

- `check:gaps` **37%** (52/140 blok)
- `check:program-gaps` **64%**
- 22/23 rəhbərdə foto yoxdur, telefon və otaq da 1/23

**Ən sərfəli iş sırası** (check:gaps «sürətli qazanc» siyahısından):

1. 67 tək-sahə fürsəti — hər biri 1 sahə ilə bütöv blok açır
2. 2 proqram yalnız `tuitionFee` ilə tam olur
3. Əlaqə məlumatı (korpus/mərtəbə/otaq/telefon/e-poçt) — 27 bölmə
4. Fəaliyyət sahəsi mətnləri — ən çox vaxt aparan hissə

**İdarəetmə sənədi:** `ADDA_Mezmun_Plani_v3.xlsx` — 28 bölmə + 12 ixtisas, sahib və
e-poçt sütunları ilə. Microsoft 365-ə köçürmə addımları sənədin «365_Təlimatı»
vərəqindədir (SharePoint List → `Sahib = [Me]` filtri → hər kəs öz işini görür).

---

## 6. Qalan kod işləri

| İş | Vəziyyət |
|---|---|
| Meilisearch plugininin `package.json`-dan çıxarılması | boot-da xəta yazır |
| F2.7 RAG co-pilot | məzmun dolandan sonra |
| «Şöbələr və xidmətlər» menyu qrupu | «Təşkilati struktur» ilə təkrarlanır — qərar verilməyib |
| Vətəndaş müraciəti — status izləmə səhifəsi | izləmə kodu verilir, status yoxlama səhifəsi yoxdur |

---

## 7. Repoya düşmüş data faylları

Hamısı `tools/migration/data/` altındadır və commit olunub:

```
facilities.json                    31 auditoriya/laboratoriya
program-content-*.json (19 ədəd)   abituriyent üslubunda ixtisas mətnləri
program-updates-2026.json          12 proqram — təhsil haqqı, dil, yer sayı
new-programs-2026.json             4 Kollec + 3 doktorantura
heroes-seed.json                   5 şəhid məzun
tedris-plani-*.json                tədris planları
program-texts-*.json               rəsmi Təhsil Proqramı mətnləri
```

**Diqqət:** `tools/migration/.gitignore` `data/*`-ı bağlayır, hər yeni fayl üçün
`!data/<ad>.json` istisnası əl ilə əlavə edilməlidir. Bu, iki dəfə unudulub.

---

## 8. Yadda saxlanmalı üç tələ

Tam siyahı `CLAUDE.md`-dədir. Ən çox təkrarlananlar:

- **`İ` hərfi və `.lower()`** — `azLower(s) = s.replace('İ','i').replace('I','ı').lower()`.
- **Strapi `documents().update()` yalnız qaralamaya yazır** — `publish()` məcburidir.
- **Yeni content type → Public rol icazəsi** — verilməsə frontend səssizcə boş qalır.
