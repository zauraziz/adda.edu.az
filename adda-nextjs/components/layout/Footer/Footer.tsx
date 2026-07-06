'use client';

import styles from './Footer.module.css';
import { CONTACT_INFO, SOCIAL_LINKS, NAV_LINKS } from '@/lib/constants';

const FOOTER_COLUMNS = [
  {
    title: 'Akademiya',
    links: [
      { label: 'Tariximiz', href: '/haqqimizda/tarix' },
      { label: 'Missiya və Vizyon', href: '/haqqimizda/missiya' },
      { label: 'Rəhbərlik', href: '/haqqimizda/rehberlik' },
      { label: 'Akkreditasiyalar', href: '/haqqimizda/akkreditasiya' },
    ],
  },
  {
    title: 'Təhsil',
    links: [
      { label: 'Bakalavr', href: '/tehsil/bakalavr' },
      { label: 'Magistratura', href: '/tehsil/magistratura' },
      { label: 'Doktorantura', href: '/tehsil/doktorantura' },
      { label: 'Qəbul 2026', href: '/qebul' },
    ],
  },
  {
    title: 'Resurslar',
    links: [
      { label: 'Kitabxana', href: '/kitabxana' },
      { label: 'Elmi jurnal', href: '/elm/jurnal' },
      { label: 'E-Tələbə', href: '/e-telebe' },
      { label: 'Virtual tur', href: '/virtual-tur' },
    ],
  },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.main}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {/* Brand column */}
            <div className={styles.brandCol}>
              <div className={styles.logo}>
                <svg width="44" height="44" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="18" stroke="var(--gold-500)" strokeWidth="2" />
                  <path d="M12 28L20 10L28 28" stroke="var(--white)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14.5 23H25.5" stroke="var(--gold-500)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <div>
                  <span className={styles.logoTitle}>ADDA</span>
                  <span className={styles.logoSub}>Dəniz Akademiyası</span>
                </div>
              </div>
              <p className={styles.brandText}>
                1881-ci ildən bəri dənizçilik təhsilinin lideri. Xəzər-Qara dəniz
                regionunun ən qabaqcıl dəniz akademiyası.
              </p>
              <div className={styles.contact}>
                <a href={`tel:${CONTACT_INFO.phone}`} className={styles.contactItem}>
                  <PhoneIcon /> {CONTACT_INFO.phone}
                </a>
                <a href={`mailto:${CONTACT_INFO.email}`} className={styles.contactItem}>
                  <MailIcon /> {CONTACT_INFO.email}
                </a>
                <span className={styles.contactItem}>
                  <PinIcon /> {CONTACT_INFO.address}
                </span>
              </div>
            </div>

            {/* Link columns */}
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title} className={styles.linkCol}>
                <h3 className={styles.colTitle}>{col.title}</h3>
                <ul className={styles.linkList}>
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <a href={link.href} className={styles.footerLink}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Map column */}
            <div className={styles.mapCol}>
              <h3 className={styles.colTitle}>Bizi tapın</h3>
              <div className={styles.mapWrap}>
                <iframe
                  title="ADDA yerləşməsi"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=49.82%2C40.36%2C49.86%2C40.38&layer=mapnik&marker=40.3699%2C49.8372"
                  className={styles.map}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <div className={styles.container}>
          <div className={styles.bottomInner}>
            <p className={styles.copyright}>
              © {new Date().getFullYear()} Azərbaycan Dövlət Dəniz Akademiyası. Bütün hüquqlar qorunur.
            </p>
            <div className={styles.socials}>
              {Object.entries(SOCIAL_LINKS).map(([key, url]) => (
                <a
                  key={key}
                  href={url}
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={key}
                >
                  <SocialIcon name={key} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function PhoneIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
}
function MailIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>;
}
function PinIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}
function SocialIcon({ name }: { name: string }) {
  const paths: Record<string, JSX.Element> = {
    facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>,
    instagram: <><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></>,
    youtube: <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17zM10 15l5-3-5-3z"/>,
    linkedin: <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></>,
  };
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}
