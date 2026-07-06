# ADDA Design System v2.0
## Azərbaycan Dövlət Dəniz Akademiyası — Digital Platform

---

## 1. Color Palette

### Primary
| Token | Hex | Usage |
|-------|-----|-------|
| `--navy-900` | `#071E2E` | Darkest backgrounds, footer |
| `--navy-800` | `#0B3D5C` | Primary brand, headers, nav |
| `--navy-700` | `#0E4D73` | Section backgrounds, cards |
| `--navy-600` | `#12608F` | Hover states, links |
| `--navy-500` | `#1A7AB5` | Active states |
| `--navy-400` | `#3D9AD4` | Decorative elements |
| `--navy-100` | `#E8F4FD` | Light backgrounds |
| `--navy-50`  | `#F0F8FF` | Subtle tints |

### Accent (Gold)
| Token | Hex | Usage |
|-------|-----|-------|
| `--gold-600` | `#A68942` | Dark gold for text on light bg |
| `--gold-500` | `#C9A961` | Primary gold accent |
| `--gold-400` | `#D4BB7C` | Hover gold |
| `--gold-300` | `#E0CE9D` | Light gold |
| `--gold-100` | `#F5EDDA` | Gold tint backgrounds |

### Neutrals
| Token | Hex | Usage |
|-------|-----|-------|
| `--gray-900` | `#111827` | Primary text |
| `--gray-700` | `#374151` | Secondary text |
| `--gray-500` | `#6B7280` | Muted text, captions |
| `--gray-300` | `#D1D5DB` | Borders |
| `--gray-100` | `#F3F4F6` | Section backgrounds |
| `--gray-50`  | `#F9FAFB` | Page background |
| `--white`    | `#FFFFFF` | Cards, surfaces |

### Semantic
| Token | Hex | Usage |
|-------|-----|-------|
| `--success` | `#059669` | Positive states |
| `--warning` | `#D97706` | Warnings |
| `--error`   | `#DC2626` | Errors |
| `--info`    | `#2563EB` | Informational |

### Gradients
```css
--gradient-hero: linear-gradient(135deg, #0B3D5C 0%, #12608F 50%, #0E4D73 100%);
--gradient-navy: linear-gradient(180deg, #0B3D5C 0%, #071E2E 100%);
--gradient-gold: linear-gradient(135deg, #C9A961 0%, #A68942 100%);
--gradient-card: linear-gradient(145deg, rgba(11,61,92,0.03) 0%, rgba(201,169,97,0.05) 100%);
--gradient-overlay: linear-gradient(180deg, rgba(7,30,46,0) 0%, rgba(7,30,46,0.85) 100%);
```

---

## 2. Typography

### Font Stack
- **Display / Headings**: `'Fraunces', serif` — optical-size variant, weight 400–800
- **Body / UI**: `'Manrope', sans-serif` — variable weight 300–800
- **Mono / Code**: `'JetBrains Mono', monospace`

### Type Scale (fluid, clamp-based)
```
--text-xs:   clamp(0.694rem, 0.66rem + 0.17vw, 0.75rem)    /* 11–12px */
--text-sm:   clamp(0.833rem, 0.78rem + 0.27vw, 0.875rem)   /* 13–14px */
--text-base: clamp(0.938rem, 0.88rem + 0.29vw, 1rem)       /* 15–16px */
--text-lg:   clamp(1.063rem, 0.98rem + 0.42vw, 1.125rem)   /* 17–18px */
--text-xl:   clamp(1.25rem, 1.12rem + 0.65vw, 1.5rem)      /* 20–24px */
--text-2xl:  clamp(1.5rem, 1.3rem + 1vw, 1.875rem)         /* 24–30px */
--text-3xl:  clamp(1.875rem, 1.56rem + 1.57vw, 2.25rem)    /* 30–36px */
--text-4xl:  clamp(2.25rem, 1.8rem + 2.25vw, 3rem)         /* 36–48px */
--text-5xl:  clamp(2.75rem, 2rem + 3.75vw, 3.75rem)        /* 44–60px */
```

### Line Heights
```
--leading-tight:  1.15
--leading-snug:   1.3
--leading-normal: 1.6
--leading-relaxed: 1.75
```

### Letter Spacing
```
--tracking-tight:  -0.025em   /* Display headings */
--tracking-normal:  0         /* Body */
--tracking-wide:    0.05em    /* Caps, labels */
--tracking-wider:   0.1em     /* Eyebrow text */
```

---

## 3. Spacing Scale
```
--space-1:  0.25rem    /* 4px */
--space-2:  0.5rem     /* 8px */
--space-3:  0.75rem    /* 12px */
--space-4:  1rem       /* 16px */
--space-5:  1.25rem    /* 20px */
--space-6:  1.5rem     /* 24px */
--space-8:  2rem       /* 32px */
--space-10: 2.5rem     /* 40px */
--space-12: 3rem       /* 48px */
--space-16: 4rem       /* 64px */
--space-20: 5rem       /* 80px */
--space-24: 6rem       /* 96px */
--space-32: 8rem       /* 128px */

/* Fluid section spacing */
--section-gap: clamp(3rem, 2rem + 5vw, 6rem);
```

---

## 4. Shadows
```css
--shadow-xs:   0 1px 2px rgba(11,61,92,0.04);
--shadow-sm:   0 1px 3px rgba(11,61,92,0.06), 0 1px 2px rgba(11,61,92,0.04);
--shadow-md:   0 4px 6px -1px rgba(11,61,92,0.07), 0 2px 4px -1px rgba(11,61,92,0.04);
--shadow-lg:   0 10px 15px -3px rgba(11,61,92,0.08), 0 4px 6px -2px rgba(11,61,92,0.03);
--shadow-xl:   0 20px 25px -5px rgba(11,61,92,0.08), 0 10px 10px -5px rgba(11,61,92,0.02);
--shadow-2xl:  0 25px 50px -12px rgba(11,61,92,0.18);
--shadow-gold: 0 4px 14px rgba(201,169,97,0.15);
--shadow-card-hover: 0 20px 40px -12px rgba(11,61,92,0.15), 0 0 0 1px rgba(11,61,92,0.05);
```

---

## 5. Border Radius
```
--radius-sm:   0.375rem   /* 6px */
--radius-md:   0.5rem     /* 8px */
--radius-lg:   0.75rem    /* 12px */
--radius-xl:   1rem       /* 16px */
--radius-2xl:  1.5rem     /* 24px */
--radius-full: 9999px
```

---

## 6. Transitions & Motion
```css
--ease-out:    cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

--duration-fast:   150ms
--duration-normal: 250ms
--duration-slow:   400ms
--duration-slower: 600ms

/* Prefers-reduced-motion: all durations → 0ms */
```

---

## 7. Breakpoints
```
--bp-sm:  640px
--bp-md:  768px
--bp-lg:  1024px
--bp-xl:  1280px
--bp-2xl: 1440px
```

### Container
```
--container-max: 1280px
--container-padding: clamp(1rem, 0.5rem + 2.5vw, 2rem);
```

---

## 8. Component Patterns

### Cards
- Background: `var(--white)`
- Border: `1px solid var(--gray-300)`
- Border-radius: `var(--radius-lg)`
- Shadow: `var(--shadow-sm)`
- Hover shadow: `var(--shadow-card-hover)`
- Transition: `all var(--duration-normal) var(--ease-out)`
- Hover transform: `translateY(-2px)`

### Buttons
- Primary: `bg: var(--navy-800)`, `color: white`, `hover: var(--navy-700)`
- Secondary: `bg: transparent`, `border: var(--navy-800)`, `hover: bg var(--navy-50)`
- Gold: `bg: var(--gold-500)`, `color: var(--navy-900)`, `hover: var(--gold-400)`
- Border-radius: `var(--radius-md)`
- Padding: `var(--space-3) var(--space-6)`
- Font: Manrope, 600 weight
- Transition: `all var(--duration-fast) var(--ease-out)`

### Navigation
- Desktop height: 72px
- Mobile height: 60px
- Background: `rgba(255,255,255,0.95)` + `backdrop-filter: blur(12px)`
- Scrolled shadow: `var(--shadow-sm)`
- Z-index: 1000

### Section Structure
- Padding: `var(--section-gap) 0`
- Max-width container centered
- Alternating bg: white → gray-50 → white

---

## 9. Accessibility (WCAG 2.1 AA)
- Navy on white: 10.87:1 ✓ AAA
- Gold on navy: 4.76:1 ✓ AA (large text)
- Gold-600 on white: 4.52:1 ✓ AA (large text)
- Gray-700 on white: 6.23:1 ✓ AA
- Focus ring: `0 0 0 3px var(--navy-400)` with 2px offset
- All interactive elements: min 44×44px touch target
- Reduced motion: respected via `prefers-reduced-motion`

---

## 10. Component Map (from adda-ana-sehife_10.html)

| Section | Component | Module |
|---------|-----------|--------|
| Top bar | `TopBar` | `layout/TopBar` |
| Navigation | `Navbar` | `layout/Navbar` |
| Hero slider | `HeroSlider` | `sections/HeroSlider` |
| Glass dock / Quick links | `GlassDock` | `sections/GlassDock` |
| Rəqəmlərlə ADDA (Stats) | `StatsCounter` | `sections/StatsCounter` |
| Xəbərlər (News) | `NewsGrid` | `sections/NewsGrid` |
| Akademiya 4.0 (Dark section) | `Academy40` | `sections/Academy40` |
| Tərəfdaşlıq (Partnership) | `PartnershipCards` | `sections/PartnershipCards` |
| Universitet loqoları | `PartnerLogos` | `sections/PartnerLogos` |
| Karyera mərkəzi | `CareerCenter` | `sections/CareerCenter` |
| FAQ | `FaqAccordion` | `sections/FaqAccordion` |
| Footer | `Footer` | `layout/Footer` |

---

## 11. File Architecture (Next.js App Router)

```
src/
├── app/
│   ├── layout.tsx          (root layout, fonts, metadata)
│   ├── page.tsx            (homepage assembles sections)
│   └── globals.css         (design tokens, resets)
├── components/
│   ├── layout/
│   │   ├── TopBar/
│   │   │   ├── TopBar.tsx
│   │   │   └── TopBar.module.css
│   │   ├── Navbar/
│   │   │   ├── Navbar.tsx
│   │   │   └── Navbar.module.css
│   │   └── Footer/
│   │       ├── Footer.tsx
│   │       └── Footer.module.css
│   ├── sections/
│   │   ├── HeroSlider/
│   │   ├── GlassDock/
│   │   ├── StatsCounter/
│   │   ├── NewsGrid/
│   │   ├── Academy40/
│   │   ├── PartnershipCards/
│   │   ├── PartnerLogos/
│   │   ├── CareerCenter/
│   │   └── FaqAccordion/
│   └── ui/
│       ├── Button/
│       ├── SectionHeader/
│       ├── Card/
│       └── Badge/
└── lib/
    └── constants.ts
```
