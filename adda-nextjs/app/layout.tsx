import type { Metadata } from 'next';
import { Fraunces, Manrope } from 'next/font/google';
import '@/styles/globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  axes: ['opsz'],
});

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'ADDA — Azərbaycan Dövlət Dəniz Akademiyası',
    template: '%s | ADDA',
  },
  description:
    '1881-ci ildən bəri dənizçilik təhsilinin lideri. Xəzər-Qara dəniz regionunun ən qabaqcıl dəniz akademiyası.',
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
