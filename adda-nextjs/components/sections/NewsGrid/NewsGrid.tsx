'use client';

import styles from './NewsGrid.module.css';

const NEWS_ITEMS = [
  {
    id: 1,
    image: '/images/news/conference-2026.jpg',
    category: 'Konfrans',
    date: '28 İyun 2026',
    title: 'Beynəlxalq Dənizçilik Konfransı 2026 başa çatdı',
    excerpt: 'Akademiyamızda keçirilən konfransda 15 ölkədən 200+ nümayəndə iştirak etdi.',
    href: '/xeberler/konfrans-2026',
    featured: true,
  },
  {
    id: 2,
    image: '/images/news/partnership.jpg',
    category: 'Əməkdaşlıq',
    date: '25 İyun 2026',
    title: 'WMU ilə yeni müqavilə imzalandı',
    excerpt: 'Tələbə mübadiləsi proqramı genişləndirildi.',
    href: '/xeberler/wmu-muqavile',
  },
  {
    id: 3,
    image: '/images/news/research.jpg',
    category: 'Elm',
    date: '20 İyun 2026',
    title: 'Dəniz ekologiyası üzrə yeni tədqiqat layihəsi',
    excerpt: 'Xəzər dənizinin ekoloji monitorinqi üçün innovativ yanaşma.',
    href: '/xeberler/ekoloji-tedqiqat',
  },
  {
    id: 4,
    image: '/images/news/students.jpg',
    category: 'Tələbə',
    date: '18 İyun 2026',
    title: 'Tələbələrimiz beynəlxalq yarışda qalib gəldi',
    excerpt: 'Naviqasiya simulyasiyası yarışmasında birincilik.',
    href: '/xeberler/yarisma-qalib',
  },
];

export function NewsGrid() {
  const featured = NEWS_ITEMS.find((n) => n.featured);
  const rest = NEWS_ITEMS.filter((n) => !n.featured);

  return (
    <section className={styles.section} aria-label="Xəbərlər">
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>Son yeniliklər</span>
            <h2 className={styles.title}>Xəbərlər və hadisələr</h2>
          </div>
          <a href="/xeberler" className={styles.viewAll}>
            Bütün xəbərlər
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>

        <div className={styles.grid}>
          {/* Featured large card */}
          {featured && (
            <a href={featured.href} className={styles.featuredCard}>
              <div className={styles.featuredImage}>
                <img src={featured.image} alt="" loading="lazy" />
                <div className={styles.featuredOverlay} />
              </div>
              <div className={styles.featuredContent}>
                <div className={styles.meta}>
                  <span className={styles.category}>{featured.category}</span>
                  <time className={styles.date}>{featured.date}</time>
                </div>
                <h3 className={styles.featuredTitle}>{featured.title}</h3>
                <p className={styles.featuredExcerpt}>{featured.excerpt}</p>
              </div>
            </a>
          )}

          {/* Smaller cards */}
          <div className={styles.sideCards}>
            {rest.map((item) => (
              <a key={item.id} href={item.href} className={styles.card}>
                <div className={styles.cardImage}>
                  <img src={item.image} alt="" loading="lazy" />
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.meta}>
                    <span className={styles.category}>{item.category}</span>
                    <time className={styles.date}>{item.date}</time>
                  </div>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
