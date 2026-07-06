'use client';

import styles from './CareerCenter.module.css';

const CAREER_FEATURES = [
  {
    icon: <><path d="M20 7h-9M14 17H5" /><circle cx="17" cy="17" r="3" /><circle cx="7" cy="7" r="3" /></>,
    title: 'Karyera Məsləhəti',
    text: 'Fərdi karyera planlaması və peşəkar inkişaf dəstəyi.',
  },
  {
    icon: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>,
    title: 'İş Yerləşdirmə',
    text: 'Aparıcı dənizçilik şirkətləri ilə birbaşa əlaqə.',
  },
  {
    icon: <><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></>,
    title: 'Təcrübə Proqramları',
    text: 'Gəmilərdə və liman infrastrukturunda praktik təcrübə.',
  },
];

export function CareerCenter() {
  return (
    <section className={styles.section} aria-label="Karyera mərkəzi">
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.imageCol}>
            <div className={styles.imageWrap}>
              <img src="/images/career/career-center.jpg" alt="Karyera mərkəzi" loading="lazy" />
            </div>
            <div className={styles.floatingCard}>
              <span className={styles.floatingStat}>94%</span>
              <span className={styles.floatingLabel}>məzun işlə təmin olunur</span>
            </div>
          </div>

          <div className={styles.contentCol}>
            <span className={styles.eyebrow}>Karyera mərkəzi</span>
            <h2 className={styles.title}>Peşəkar gələcəyə hazırlıq</h2>
            <p className={styles.intro}>
              Tələbələrimizin uğurlu karyerası bizim prioritetimizdir. Karyera mərkəzimiz
              təhsil müddətindən başlayaraq məzuniyyətdən sonra da dəstək göstərir.
            </p>

            <div className={styles.features}>
              {CAREER_FEATURES.map((feature) => (
                <div key={feature.title} className={styles.feature}>
                  <div className={styles.featureIcon}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {feature.icon}
                    </svg>
                  </div>
                  <div>
                    <h3 className={styles.featureTitle}>{feature.title}</h3>
                    <p className={styles.featureText}>{feature.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <a href="/karyera" className={styles.ctaBtn}>
              Karyera mərkəzinə keç
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
