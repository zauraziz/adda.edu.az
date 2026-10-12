import type { Metadata } from 'next';
import Script from 'next/script';
import { Fraunces, Manrope } from 'next/font/google';
import '@/styles/globals.css';
// F5.49 — yüksək kontrast rejimi (bütün səhifələr; <html data-contrast="high">).
import './_styles/43-a11y.css';
import { A11Y_INIT_SCRIPT } from '@/lib/a11y';

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
    // suppressHydrationWarning: lang, data-fs və data-contrast-ı init skripti
    // hidrasiyadan əvvəl dəyişir (dil yoldan, əlçatanlıq ayarı localStorage-dan).
    <html lang="az" className={`${fraunces.variable} ${manrope.variable}`} suppressHydrationWarning>
      <body>
        <Script id="adda-a11y-init" strategy="beforeInteractive">
          {A11Y_INIT_SCRIPT}
        </Script>
        {children}
      </body>
    </html>
  );
}
