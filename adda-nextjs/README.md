# ADDA — Rəqəmsal Platforma

Azərbaycan Dövlət Dəniz Akademiyası (adda.edu.az) ana səhifəsinin Next.js 15 (App Router) modul komponent arxitekturası.

## Texnologiya
- **Next.js 15** — App Router, React Server Components
- **CSS Modules** — qlobal toqquşmalardan azad, komponent-səviyyəli styling
- **Design Tokens** — `styles/globals.css` daxilində CSS custom properties
- **Fraunces + Manrope** — `next/font/google` ilə optimallaşdırılmış
- **Sıfır xarici asılılıq** — heç bir UI kitabxanası, tam nəzarət

## Struktur
```
app/
├── layout.tsx          Root layout (fontlar, metadata)
├── page.tsx            Ana səhifə (bölmələri birləşdirir)
components/
├── layout/             TopBar, Navbar, Footer
├── sections/           9 səhifə bölməsi
└── ui/                 (paylaşılan komponentlər üçün)
lib/
└── constants.ts        Naviqasiya, əlaqə, statistika
styles/
└── globals.css         Design tokens + reset
```

## Quraşdırma
```bash
npm install
npm run dev       # http://localhost:3000
```

## Şəkillər
Komponentlər `/public/images/...` yollarına istinad edir. Real şəkilləri həmin qovluğa yerləşdirin:
```
public/images/
├── hero/           campus-aerial.jpg, simulation-lab.jpg, graduation.jpg
├── news/           conference-2026.jpg, partnership.jpg, research.jpg, students.jpg
└── career/         career-center.jpg
```

## Komponent Xəritəsi
| Bölmə | Komponent |
|-------|-----------|
| Üst zolaq | `layout/TopBar` |
| Naviqasiya | `layout/Navbar` |
| Hero slider | `sections/HeroSlider` |
| Sürətli keçidlər | `sections/GlassDock` |
| Statistika | `sections/StatsCounter` |
| Xəbərlər | `sections/NewsGrid` |
| Akademiya 4.0 | `sections/Academy40` |
| Tərəfdaşlıq | `sections/PartnershipCards` |
| Tərəfdaş loqoları | `sections/PartnerLogos` |
| Karyera mərkəzi | `sections/CareerCenter` |
| FAQ | `sections/FaqAccordion` |
| Footer | `layout/Footer` |

## Design System
Tam design token dokumentasiyası üçün `DESIGN.md` faylına baxın.

## Əlçatanlıq (WCAG 2.1 AA)
- Semantik HTML5 (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`)
- Bütün interaktiv elementlər üçün ARIA atributları
- Klaviatura naviqasiyası və görünən focus göstəriciləri
- `prefers-reduced-motion` dəstəyi
- Rəng kontrastı: navy/white 10.87:1 (AAA)
- Minimum 44×44px toxunuş hədəfləri

## CMS İnteqrasiyası
Bütün məzmun (`constants.ts`, komponent daxilindəki massivlər) Strapi CMS-dən
gələn məlumatlarla asanlıqla əvəz edilə bilər. Komponentlər props qəbul edəcək
şəkildə strukturlaşdırılıb.
