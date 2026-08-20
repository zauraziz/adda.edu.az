// F4.7d — sənəd siyahısı + kateqoriya lüğəti paylaşılan komponentə çıxarılıb
// ki, həm struktur/[slug] yan paneli, həm də /struktur/[slug]/senedler
// (F4.7d «Hamısı» keçidinin hədəfi) eyni render/etiketlərdən istifadə etsin.
import { docText, mediaUrl, type UnitDocumentItem } from '@/lib/strapi';
import type { Locale } from '@/lib/i18n';

export function DocList({ docs, locale }: { docs: UnitDocumentItem[]; locale: Locale }) {
  if (!docs.length) return null;
  return (
    <div className="na-files" style={{ maxWidth: 'none', margin: 0 }}>
      {docs.map((d) => {
        const { title } = docText(d, locale);
        const url = mediaUrl(d.file);
        if (!url) return null;
        return (
          <a key={d.documentId} href={url} className="na-file" target="_blank" rel="noopener noreferrer">
            <i className="ti ti-file-text" aria-hidden="true" />
            <span>{title}{d.year ? ` (${d.year})` : ''}</span>
          </a>
        );
      })}
    </div>
  );
}

/** `hesabat` BURADA YOXDUR — o, əsas sütunda qalır (F4.6d). */
export const DOC_CATEGORY_ORDER: UnitDocumentItem['category'][] = [
  'esasname',
  'emr',
  'qerar',
  'normativ',
  'forma',
  'etika',
  'akkreditasiya',
  'diger',
];

export const DOC_CATEGORY_LABEL_AZ: Record<string, string> = {
  esasname: 'Əsasnamə',
  emr: 'Əmrlər',
  qerar: 'Qərarlar',
  normativ: 'Normativ sənədlər',
  forma: 'Nümunəvi sənədlər',
  etika: 'Etika',
  akkreditasiya: 'Akkreditasiya',
  diger: 'Digər',
};

export interface DocGroup {
  cat: UnitDocumentItem['category'];
  items: UnitDocumentItem[];
}

/** `docs`-u (hesabat ÇIXARILARAQ) kateqoriya sırasına görə qruplaşdırır. */
export function groupDocsByCategory(docs: UnitDocumentItem[]): DocGroup[] {
  const rest = docs.filter((d) => d.category !== 'hesabat');
  return DOC_CATEGORY_ORDER.map((cat) => ({ cat, items: rest.filter((d) => d.category === cat) })).filter(
    (g) => g.items.length,
  );
}
