'use client';

import styles from './PartnershipCards.module.css';

const PARTNERSHIPS = [
  {
    title: 'Tələbə Mübadiləsi',
    description: 'Erasmus+ və ikitərəfli müqavilələr çərçivəsində beynəlxalq mobillik imkanları.',
    stat: '12',
    statLabel: 'ölkə',
    href: '/beynelxalq/mubadile',
  },
  {
    title: 'Birgə Diplomlar',
    description: 'Aparıcı Avropa universitetləri ilə ikili diplom proqramları.',
    stat: '5',
    statLabel: 'proqram',
    href: '/beynelxalq/birge-diplom',
  },
  {
    title: 'Elmi Əməkdaşlıq',
    description: 'Beynəlxalq tədqiqat layihələri və akademik nəşrlər.',
    stat: '30+',
    statLabel: 'layihə',
    href: '/beynelxalq/elmi',
  },
];

export function PartnershipCards() {
  return (
    <section className={styles.section} aria-label="Beynəlxalq tərəfdaşlıq">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>Beynəlxalq əlaqələr</span>
          <h2 className={styles.title}>Qlobal tərəfdaşlıq</h2>
        </div>

        <div className={styles.grid}>
          {PARTNERSHIPS.map((item) => (
            <a key={item.title} href={item.href} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.stat}>{item.stat}</span>
                <span className={styles.statLabel}>{item.statLabel}</span>
              </div>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardDesc}>{item.description}</p>
              <span className={styles.link}>
                Ətraflı
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
