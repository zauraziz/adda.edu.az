'use client';

import styles from './GlassDock.module.css';

const QUICK_LINKS = [
  { icon: '🎓', label: 'Qəbul', href: '/qebul', color: '#0B3D5C' },
  { icon: '📚', label: 'Kitabxana', href: '/kitabxana', color: '#12608F' },
  { icon: '🧪', label: 'Elmi jurnal', href: '/elm/jurnal', color: '#0E4D73' },
  { icon: '📋', label: 'E-Tələbə', href: '/e-telebe', color: '#1A7AB5' },
  { icon: '🌐', label: 'Virtual tur', href: '/virtual-tur', color: '#C9A961' },
  { icon: '📞', label: 'Əlaqə', href: '/elaqe', color: '#A68942' },
];

export function GlassDock() {
  return (
    <section className={styles.dock} aria-label="Sürətli keçidlər">
      <div className={styles.container}>
        <div className={styles.grid}>
          {QUICK_LINKS.map((link) => (
            <a key={link.label} href={link.href} className={styles.card}>
              <span className={styles.icon} aria-hidden="true">{link.icon}</span>
              <span className={styles.label}>{link.label}</span>
              <svg className={styles.arrow} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7V17"/>
              </svg>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
