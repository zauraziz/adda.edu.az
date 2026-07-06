'use client';

import styles from './Academy40.module.css';

const FEATURES = [
  {
    icon: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
    title: 'Rəqəmsal Kampus',
    description: 'Buludda yerləşən inteqrasiya olunmuş təhsil idarəetmə sistemi.',
  },
  {
    icon: <><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></>,
    title: 'Simulyasiya Mərkəzi',
    description: 'Tam missiya körpü və maşın dairəsi simulyatorları.',
  },
  {
    icon: <><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>,
    title: 'Qlobal Şəbəkə',
    description: '45+ beynəlxalq tərəfdaşla real-vaxt əməkdaşlıq platforması.',
  },
  {
    icon: <><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>,
    title: 'AI Assistent',
    description: 'Tələbələr üçün 24/7 süni intellekt dəstək sistemi.',
  },
];

export function Academy40() {
  return (
    <section className={styles.section} aria-label="Akademiya 4.0">
      <div className={styles.bgPattern} aria-hidden="true" />
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>Rəqəmsal transformasiya</span>
          <h2 className={styles.title}>Akademiya 4.0</h2>
          <p className={styles.subtitle}>
            Ənənəvi dənizçilik təhsilini müasir texnologiyalarla birləşdirən
            rəqəmsal ekosistem. Gələcəyin dənizçiləri bugünün innovasiyaları ilə yetişir.
          </p>
        </div>

        <div className={styles.grid}>
          {FEATURES.map((feature) => (
            <div key={feature.title} className={styles.card}>
              <div className={styles.iconWrap}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {feature.icon}
                </svg>
              </div>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardDesc}>{feature.description}</p>
            </div>
          ))}
        </div>

        <div className={styles.cta}>
          <a href="/akademiya-4-0" className={styles.ctaBtn}>
            Ətraflı məlumat
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
