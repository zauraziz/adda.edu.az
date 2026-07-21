// F2.5d / Nautical timeline komponenti — 144 illik marşrut.
// Server komponent (interaktivlik yoxdur; animasiya tamamilə native CSS
// scroll-driven-dir — 20-timeline.css). Mərhələləri "liman" node-ları kimi
// bir spine (marşrut xətti) boyunca növbələşən tərəflərdə göstərir.
import { mediaUrl, type Milestone } from '@/lib/strapi';
import { tr, type Locale } from '@/lib/i18n';

const ERA_LABELS: Record<Locale, Record<string, string>> = {
  az: { temel: 'Təməl', inkisaf: 'İnkişaf', muasir: 'Müasir' },
  ru: { temel: 'Основание', inkisaf: 'Развитие', muasir: 'Современность' },
  en: { temel: 'Foundation', inkisaf: 'Development', muasir: 'Modern' },
};

export default function Timeline({ milestones, locale }: { milestones: Milestone[]; locale: Locale }) {
  if (!milestones.length) {
    return <p className="tl-empty">{tr('Tarix mərhələləri hələ əlavə edilməyib.', locale)}</p>;
  }
  return (
    <div className="tl-route">
      <span className="tl-spine" aria-hidden="true">
        <span className="tl-spine-fill" />
      </span>
      <ol className="tl-list">
        {milestones.map((m, i) => {
          const img = mediaUrl(m.image);
          const side = i % 2 === 0 ? 'l' : 'r';
          return (
            <li className={'tl-stop tl-stop--' + side} key={m.documentId}>
              <span className="tl-node" aria-hidden="true">
                <i className="ti ti-anchor" />
              </span>
              <div className="tl-card">
                <div className="tl-year">{m.year}</div>
                <span className={'tl-era tl-era--' + m.era}>
                  {ERA_LABELS[locale][m.era] ?? ERA_LABELS[locale].muasir}
                </span>
                <h3 className="tl-title">{m.title}</h3>
                {m.description ? <p className="tl-desc">{m.description}</p> : null}
                {img ? <img className="tl-img" src={img} alt={m.title} loading="lazy" /> : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
