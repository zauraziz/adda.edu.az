'use client';

import { useState } from 'react';
import styles from './FaqAccordion.module.css';

const FAQS = [
  {
    q: 'Qəbul üçün hansı sənədlər tələb olunur?',
    a: 'Bakalavr səviyyəsinə qəbul üçün tam orta təhsil haqqında sənəd, DİM buraxılış imtahanı nəticələri, tibbi arayış və şəxsiyyət vəsiqəsinin surəti tələb olunur. Dənizçilik ixtisasları üçün əlavə tibbi komissiya keçmək lazımdır.',
  },
  {
    q: 'Beynəlxalq tələbələr üçün hansı proqramlar mövcuddur?',
    a: 'Akademiyamız Erasmus+ və ikitərəfli müqavilələr çərçivəsində beynəlxalq tələbə mübadiləsi proqramları təklif edir. İngilis dilində tədris olunan bir sıra magistr proqramları da mövcuddur.',
  },
  {
    q: 'STCW sertifikatları akademiyada verilirmi?',
    a: 'Bəli, ADDA IMO və STCW konvensiyalarına tam uyğun olaraq bütün zəruri dənizçilik sertifikatlarını verir. Simulyasiya mərkəzimiz beynəlxalq standartlara cavab verir.',
  },
  {
    q: 'Təhsil haqqı və təqaüd imkanları nələrdir?',
    a: 'Dövlət sifarişi əsasında qəbul olan tələbələr üçün təhsil ödənişsizdir və təqaüd təyin olunur. Ödənişli təhsil formaları üçün müxtəlif güzəşt və təqaüd proqramları mövcuddur.',
  },
  {
    q: 'Tələbələr üçün yataqxana təmin olunurmu?',
    a: 'Bəli, akademiyanın müasir yataqxana kompleksi var. Yerlər ilk növbədə region tələbələrinə və beynəlxalq mübadilə iştirakçılarına ayrılır.',
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className={styles.section} aria-label="Tez-tez verilən suallar">
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>Kömək mərkəzi</span>
          <h2 className={styles.title}>Tez-tez verilən suallar</h2>
        </div>

        <div className={styles.accordion}>
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className={`${styles.item} ${isOpen ? styles.itemOpen : ''}`}>
                <button
                  className={styles.question}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <span className={styles.iconWrap} aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 5v14M5 12h14" className={styles.plusV} />
                    </svg>
                  </span>
                </button>
                <div className={styles.answerWrap} style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
                  <div className={styles.answerInner}>
                    <p className={styles.answer}>{faq.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.footer}>
          <p>Sualınıza cavab tapmadınız?</p>
          <a href="/elaqe" className={styles.contactLink}>Bizimlə əlaqə saxlayın</a>
        </div>
      </div>
    </section>
  );
}
