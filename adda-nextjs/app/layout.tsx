import type { Metadata } from 'next';
import { Fraunces, Manrope } from 'next/font/google';
import '@/styles/globals.css';

const fraunces = Fraunces({
  // F5.18a — Ə/Ş/Ğ/Ç/Ö/Ü kimi Azərbaycan hərfləri "latin" alt çoxluğunda YOXDUR,
  // "latin-ext"dədir. Bunsuz next/font bu hərflər üçün sistem fontuna keçir.
  subsets: ['latin', 'latin-ext'],
  variable: '--font-display',
  display: 'swap',
  axes: ['opsz'],
});

const manrope = Manrope({
  subsets: ['latin', 'cyrillic', 'latin-ext'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'ADDA — Azərbaycan Dövlət Dəniz Akademiyası',
    template: '%s | ADDA',
  },
  description:
    '1996-cı ildə təsis olunmuş, kökləri 1881-ci ilə uzanan dənizçilik təhsili məktəbi. Xəzər-Qara dəniz regionunun ən qabaqcıl dəniz akademiyası.',
  metadataBase: new URL('https://adda.edu.az'),
  openGraph: {
    type: 'website',
    locale: 'az_AZ',
    siteName: 'ADDA',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="az" className={`${fraunces.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
