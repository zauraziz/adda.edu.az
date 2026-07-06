'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './HeroSlider.module.css';

const SLIDES = [
  {
    id: 1,
    image: '/images/hero/campus-aerial.jpg',
    eyebrow: '1881-ci ildən bəri',
    title: 'Dənizçilik təhsilinin\nliderinə xoş gəlmisiniz',
    subtitle: 'Xəzər-Qara dəniz regionunun ən qabaqcıl dəniz akademiyası olaraq gələcəyin peşəkarlarını yetişdiririk.',
    cta: { label: 'Qəbul 2026', href: '/qebul' },
    ctaSecondary: { label: 'Akademiya haqqında', href: '/haqqimizda' },
  },
  {
    id: 2,
    image: '/images/hero/simulation-lab.jpg',
    eyebrow: 'Akademiya 4.0',
    title: 'Rəqəmsal transformasiya\ndövründə təhsil',
    subtitle: 'Son texnologiyalarla təchiz olunmuş simulyasiya laboratoriyaları və rəqəmsal kampus infrastrukturumuz.',
    cta: { label: 'Proqramları kəşf et', href: '/tehsil' },
    ctaSecondary: { label: 'Virtual tur', href: '/virtual-tur' },
  },
  {
    id: 3,
    image: '/images/hero/graduation.jpg',
    eyebrow: 'Beynəlxalq standartlar',
    title: 'IMO və STCW\nstandartlarına uyğunluq',
    subtitle: '45+ beynəlxalq tərəfdaşla birlikdə qlobal dənizçilik ekosisteminə inteqrasiya.',
    cta: { label: 'Tərəfdaşlarımız', href: '/beynelxalq' },
    ctaSecondary: { label: 'Akkreditasiyalar', href: '/haqqimizda/akkreditasiya' },
  },
];

const INTERVAL = 6000;

export function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused, next]);

  const slide = SLIDES[current];

  return (
    <section
      className={styles.hero}
      aria-roledescription="carousel"
      aria-label="Əsas slaydlar"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background layers */}
      <div className={styles.bgWrapper}>
        {SLIDES.map((s, i) => (
          <div
            key={s.id}
            className={`${styles.bgSlide} ${i === current ? styles.bgActive : ''}`}
            style={{ backgroundImage: `url(${s.image})` }}
            role="img"
            aria-label={s.title.replace('\n', ' ')}
          />
        ))}
        <div className={styles.overlay} />
      </div>

      {/* Content */}
      <div className={styles.container}>
        <div className={styles.content} key={current}>
          <span className={styles.eyebrow}>{slide.eyebrow}</span>
          <h1 className={styles.title}>
            {slide.title.split('\n').map((line, i) => (
              <span key={i} className={styles.titleLine}>{line}</span>
            ))}
          </h1>
          <p className={styles.subtitle}>{slide.subtitle}</p>
          <div className={styles.ctas}>
            <a href={slide.cta.href} className={styles.ctaPrimary}>
              {slide.cta.label}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
            <a href={slide.ctaSecondary.href} className={styles.ctaSecondary}>
              {slide.ctaSecondary.label}
            </a>
          </div>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.dots}>
            {SLIDES.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
                onClick={() => setCurrent(i)}
                aria-label={`Slayd ${i + 1}`}
                aria-current={i === current}
              >
                {i === current && <span className={styles.dotProgress} />}
              </button>
            ))}
          </div>
          <div className={styles.arrows}>
            <button className={styles.arrow} onClick={prev} aria-label="Əvvəlki slayd">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <button className={styles.arrow} onClick={next} aria-label="Növbəti slayd">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 6 15 12 9 18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
