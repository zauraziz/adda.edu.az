'use client';

import styles from './PartnerLogos.module.css';

const PARTNERS = [
  { name: 'World Maritime University', abbr: 'WMU' },
  { name: 'International Maritime Organization', abbr: 'IMO' },
  { name: 'International Association of Maritime Universities', abbr: 'IAMU' },
  { name: 'University of Plymouth', abbr: 'Plymouth' },
  { name: 'Massachusetts Maritime Academy', abbr: 'MMA' },
  { name: 'ITMO University', abbr: 'ITMO' },
];

export function PartnerLogos() {
  return (
    <section className={styles.section} aria-label="Tərəfdaş qurumlar">
      <div className={styles.container}>
        <p className={styles.label}>Etibarlı beynəlxalq tərəfdaşlarımız</p>
        <div className={styles.logoStrip}>
          {PARTNERS.map((partner) => (
            <div key={partner.abbr} className={styles.logo} title={partner.name}>
              <div className={styles.logoMark}>{partner.abbr}</div>
              <span className={styles.logoName}>{partner.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
