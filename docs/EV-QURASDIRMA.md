# Ev kompüterində quraşdırma

Bu sənəd ADDA saytı layihəsini **ikinci bir kompüterdə** işə salmaq və işi
Claude Desktop-un **Code** bölməsindən davam etdirmək üçündür.

İş rejimi: **frontend lokal, Strapi uzaqda.** `adda-nextjs` sənin
kompüterində işləyir, məzmunu Render-dəki canlı Strapi-dən
(`adda-edu-az.onrender.com`) çəkir. Lokal Strapi, lokal baza, Cloudinary
açarı — **heç biri lazım deyil.**

Sənəddəki yollar **nümunədir**. Hər kompüterdə fərqli ola bilər:
`E:\web-projects\adda.edu.az`, `C:\Users\<ad>\source\adda.edu.az` və s.

---

## 1. Ön şərtlər

| Alət | Versiya | Yoxlama |
|---|---|---|
| Git | istənilən müasir | `git --version` |
| Node.js | **20 LTS və ya daha yeni** (minimum 18.18) | `node --version` |
| npm | Node ilə gəlir | `npm --version` |

Node yoxdursa: <https://nodejs.org> → LTS. Quraşdırmadan sonra PowerShell
pəncərəsini **bağlayıb yenidən aç** — `PATH` yenilənsin.

---

## 2. Quraşdırma — iki yol

### A. Adi hal: git ilə (tövsiyə olunan)

`.claude/` sazlamaları və `docs/` sənədləri **repoda izlənir**, ona görə
klonlama hər şeyi gətirir — skriptə ehtiyac yoxdur:

```powershell
git clone https://github.com/zauraziz/adda.edu.az.git "C:\<yol>\adda.edu.az"
cd "C:\<yol>\adda.edu.az\adda-nextjs"
npm install
copy .env.local.example .env.local     # istəyə görə, bax 6-cı bölmə
```

Mövcud klonda sadəcə: `git pull` → dəyişiklik varsa `npm install`.

### B. Sıfırdan, bootstrap skripti ilə

`ADDA-EV-SETUP.ps1` yuxarıdakı addımları bir dəfəyə edir və `.claude/`
fayllarını da yazır — repoda hələ commit olunmayıbsa faydalıdır.

> **Skript repoda YOXDUR.** Kökdəki `*.ps1` faylları `.gitignore`-dadır
> (`/*.ps1` qaydası — çatdırma skriptləri commit olunmur). Skript ayrıca
> ötürülməlidir: flash-disk, e-poçt, və ya Claude-dan yenidən istə.

```powershell
powershell -ExecutionPolicy Bypass -File .\ADDA-EV-SETUP.ps1
powershell -ExecutionPolicy Bypass -File .\ADDA-EV-SETUP.ps1 -Root "C:\<yol>\adda.edu.az"
```

Brauzerdən endirilibsə Windows bloklaya bilər — bir dəfəlik:
`Unblock-File .\ADDA-EV-SETUP.ps1`

Skript nə edir: ön şərtləri yoxlayır → repo yoxdursa klonlayır →
`.claude/` və `docs/` fayllarını yazır → `adda-nextjs/.env.local` yoxdursa
yaradır (varsa **üstündən yazmır**) → `npm install`.
**İdempotentdir** — ikinci dəfə `stage sayi: 0` yazıb çıxır.

---

## 3. Claude Desktop → Code

1. Claude Desktop → **Code** bölməsi
2. **Open project / Add folder** → repo qovluğunu seç
3. İlk açılışda **qovluğa etibar** soruşulacaq — təsdiq et.
   Təsdiq olmadan `.claude/settings.json`-dakı icazə qaydaları işləmir.
4. `/durum` yaz — hər şey yerindədirsə dörd yoxlayıcı işləyəcək.

Claude Code `CLAUDE.md` faylını avtomatik oxuyur — layihənin bütün daimi
qaydaları (dizayn kilidi, Azərbaycan dili tələləri, Strapi tələləri,
PowerShell 5.1 tələləri) orada.

---

## 4. Hazır əmrlər

| Əmr | Nə edir |
|---|---|
| `/durum` | dörd diaqnostikanı işlədir, faizləri və ən sərfəli işləri göstərir |
| `/qapi` | commit-dən əvvəl məcburi yoxlamalar (`tsc --noEmit`, sxem dəyişibsə build) |
| `/seed FACILITY_SEED` | seed bayrağı iş axını — qoy → deploy → log → SİL → Publish |
| `/commit F5.35: ...` | `--literal-pathspecs` ilə stage + ASCII commit (push etmir) |
| `/paket <ad>` | ev qaydası ilə deliverable paketi (idempotent BOM-lu `.ps1`) |
| `/handoff` | `docs/HANDOFF.md` ötürmə sənədini yeniləyir |

---

## 5. İcazələr — nə avtomatik, nə soruşulur, nə qadağan

`.claude/settings.json` faylındadır, repoda izlənir.

**Soruşmadan işləyir:** `npm run check:*`, `npx tsc --noEmit`,
`git add` / `git commit` / `git status` / `git diff` / `git log`,
`node ../tools/*`, ADDA domenlərinə WebFetch.

**Soruşur:** `npm install <paket>` (CLAUDE.md: yeni asılılıq əlavə edilmir),
`git reset --hard`, `git clean`, `npm run develop`.

**Qadağan:** `git push` — push həmişə səndədir.
`.env` və `.env.local` fayllarının oxunması və redaktəsi də bağlıdır
(nümunə fayllar — `.env.example`, `.env.local.example` — açıqdır).

Özün üçün dəyişmək istəsən `.claude/settings.local.json` yarat — o fayl
kök `.gitignore`-dakı `.env*.local` deyil, Claude Code-un öz qlobal
istisnası ilə commit-dən kənarda qalır. Məsələn hər redaktəni
təsdiqləməmək üçün:

```json
{ "permissions": { "defaultMode": "acceptEdits" } }
```

---

## 6. Lokal işə salma

```powershell
cd adda-nextjs
npm run dev
```

→ <http://localhost:3000/az>

**Render pulsuz plandadır və fəaliyyətsizlikdən sonra yatır.** İlk sorğu
30-60 saniyə çəkə bilər — bu xəta deyil. Eyni şey `check:*` alətlərinə də
aiddir.

`adda-nextjs/.env.local` faylı praktiki olaraq boşdur: env olmayanda kod
onsuz da produksiya Strapi URL-inə qoşulur. İki hal üçün lazımdır:

- `NEXT_PUBLIC_STRAPI_URL=http://localhost:1337` — lokal Strapi işlədəndə
  (`NEXT_PUBLIC_` prefiksi **məcburidir**, prefiks olmasa brauzer sorğuları
  səhv ünvana düşür)
- `ADMIN_EMAILS=...` — struktur/rəhbərlik səhifələrində admin bəzəklərini
  görmək üçün (prefiks **olmamalıdır**)

---

## 7. İki kompüter arasında işləyəndə

- **Push həmişə əl ilə, səndən.** Claude push etmir.
- Yeni kompüterdə işə başlamazdan əvvəl: `git pull` → `npm install`
  (paketlər dəyişibsə) → `/durum`.
- **`.claude/` və `docs/` repoda izlənir.** Sazlamanı və ya sənədləri
  dəyişəndə commit et — əks halda o biri kompüterə çatmayacaq.
- `adda-nextjs/.env.local` **izlənmir** (kök `.gitignore`: `.env*.local`) —
  hər kompüterdə ayrıca yaradılır. Nümunəsi `.env.local.example`-dadır.
- `tools/migration/data/` altına yeni JSON düşübsə,
  `tools/migration/.gitignore` faylında `!data/<ad>.json` istisnası
  olmalıdır — yoxsa fayl digər kompüterə heç vaxt getməyəcək.
- Çatı bağlayanda `/handoff` işlət — növbəti sessiya `docs/HANDOFF.md`
  ilə başlayır.
