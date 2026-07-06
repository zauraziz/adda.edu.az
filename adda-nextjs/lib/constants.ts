/* ═══════════════════════════════════════════════════════
   ADDA — Shared Constants & Types
   ═══════════════════════════════════════════════════════ */

export const NAV_LINKS = [
  { label: 'Haqqımızda', href: '/haqqimizda', children: [
    { label: 'Tariximiz', href: '/haqqimizda/tarix' },
    { label: 'Missiya və Vizyon', href: '/haqqimizda/missiya' },
    { label: 'Rəhbərlik', href: '/haqqimizda/rehberlik' },
    { label: 'Struktur', href: '/haqqimizda/struktur' },
  ]},
  { label: 'Təhsil', href: '/tehsil', children: [
    { label: 'Bakalavr', href: '/tehsil/bakalavr' },
    { label: 'Magistratura', href: '/tehsil/magistratura' },
    { label: 'Doktorantura', href: '/tehsil/doktorantura' },
  ]},
  { label: 'Elm', href: '/elm' },
  { label: 'Beynəlxalq əlaqələr', href: '/beynelxalq' },
  { label: 'Tələbə həyatı', href: '/telebe' },
  { label: 'Karyera', href: '/karyera' },
  { label: 'Əlaqə', href: '/elaqe' },
] as const;

export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/addaeduaz',
  instagram: 'https://instagram.com/adda_edu_az',
  youtube: 'https://youtube.com/@addaeduaz',
  linkedin: 'https://linkedin.com/school/adda',
} as const;

export const CONTACT_INFO = {
  phone: '+994 12 493 59 27',
  email: 'info@adda.edu.az',
  address: 'Z.Əliyeva küç. 18, Bakı, AZ1000',
  coordinates: { lat: 40.3699, lng: 49.8372 },
} as const;

export const STATS = [
  { value: 143, suffix: '+', label: 'İllik tarix' },
  { value: 5000, suffix: '+', label: 'Tələbə' },
  { value: 350, suffix: '+', label: 'Professor-müəllim heyəti' },
  { value: 45, suffix: '+', label: 'Beynəlxalq tərəfdaş' },
] as const;

export type NavLink = {
  label: string;
  href: string;
  children?: NavLink[];
};

export type StatItem = {
  value: number;
  suffix: string;
  label: string;
};
