'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './StatsCounter.module.css';
import { STATS } from '@/lib/constants';

function useCountUp(end: number, isVisible: boolean, duration = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, isVisible, duration]);

  return count;
}

function StatCard({ value, suffix, label, isVisible }: {
  value: number; suffix: string; label: string; isVisible: boolean;
}) {
  const count = useCountUp(value, isVisible);

  return (
    <div className={styles.stat}>
      <span className={styles.value}>
        {count.toLocaleString('az-AZ')}
        <span className={styles.suffix}>{suffix}</span>
      </span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}

export function StatsCounter() {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className={styles.section} aria-label="Rəqəmlərlə ADDA">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>Rəqəmlərlə</span>
          <h2 className={styles.title}>ADDA bir baxışda</h2>
        </div>
        <div className={styles.grid}>
          {STATS.map((stat) => (
            <StatCard key={stat.label} {...stat} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
}
