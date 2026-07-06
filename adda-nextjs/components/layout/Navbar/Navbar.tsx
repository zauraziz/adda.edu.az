'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './Navbar.module.css';
import { NAV_LINKS } from '@/lib/constants';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const toggleDropdown = useCallback((label: string) => {
    setActiveDropdown((prev) => (prev === label ? null : label));
  }, []);

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <a href="/" className={styles.logo} aria-label="ADDA Ana Səhifə">
          <div className={styles.logoMark}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="var(--navy-800)" strokeWidth="2" />
              <path d="M12 28L20 10L28 28" stroke="var(--navy-800)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14.5 23H25.5" stroke="var(--gold-500)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>ADDA</span>
            <span className={styles.logoSub}>Dəniz Akademiyası</span>
          </div>
        </a>

        <nav className={styles.desktopNav} aria-label="Əsas naviqasiya">
          <ul className={styles.navList}>
            {NAV_LINKS.map((link) => (
              <li
                key={link.label}
                className={styles.navItem}
                onMouseEnter={() => link.children && setActiveDropdown(link.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <a href={link.href} className={styles.navLink}>
                  {link.label}
                  {link.children && (
                    <svg className={styles.chevron} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  )}
                </a>
                {link.children && activeDropdown === link.label && (
                  <div className={styles.dropdown}>
                    {link.children.map((child) => (
                      <a key={child.href} href={child.href} className={styles.dropdownLink}>
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <a href="/qebul" className={styles.ctaBtn}>Qəbul 2026</a>
          <button
            className={`${styles.hamburger} ${mobileOpen ? styles.hamburgerOpen : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label="Menyunu aç"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      <div className={`${styles.mobileOverlay} ${mobileOpen ? styles.mobileOpen : ''}`}>
        <nav className={styles.mobileNav} aria-label="Mobil naviqasiya">
          {NAV_LINKS.map((link) => (
            <div key={link.label} className={styles.mobileItem}>
              <button
                className={styles.mobileLink}
                onClick={() => link.children ? toggleDropdown(link.label) : setMobileOpen(false)}
              >
                {link.label}
                {link.children && (
                  <svg
                    className={`${styles.mobileChevron} ${activeDropdown === link.label ? styles.mobileChevronOpen : ''}`}
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                )}
              </button>
              {link.children && activeDropdown === link.label && (
                <div className={styles.mobileDropdown}>
                  {link.children.map((child) => (
                    <a key={child.href} href={child.href} className={styles.mobileDropdownLink}>
                      {child.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          <a href="/qebul" className={styles.mobileCta}>Qəbul 2026</a>
        </nav>
      </div>
    </header>
  );
}
