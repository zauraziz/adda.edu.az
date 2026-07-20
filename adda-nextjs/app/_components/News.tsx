// ── Faza 1 / News (server component) ─────────────────────────────────
// "Gündəm" bölməsi: xəbər mozaikası (CMS) + elan raili + tədbirlər.
// Əvvəl HomeClient-də MARKUP + {{NEWS_CARDS}} tokeni ilə qurulurdu.
import type { NewsItem } from '@/lib/strapi';
import { tr, type Locale } from '@/lib/i18n';
import { FALLBACK_NEWS } from '@/lib/news-fallback';

const CAT_LABELS: Record<Locale, Record<string, string>> = {
  az: { xeber: 'Xəbər', elan: 'Elan', tedbir: 'Tədbir', elm: 'Elm' },
  ru: { xeber: 'Новость', elan: 'Объявление', tedbir: 'Событие', elm: 'Наука' },
  en: { xeber: 'News', elan: 'Announcement', tedbir: 'Event', elm: 'Science' },
};
const MONTHS: Record<Locale, string[]> = {
  az: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'],
  ru: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

function fmtDate(iso: string | null, locale: Locale): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getUTCDate()).padStart(2, '0')} ${MONTHS[locale][d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

// Elan raili (statik — F2-də `announcement` tipinə bağlanacaq)
const RAIL: Array<{ img?: string; alt?: string; chip: string; date: string; title: string }> = [
  { img: 'https://images.unsplash.com/photo-1724597500306-a4cbb7d1324e?fm=jpg&q=75&w=800&h=380&fit=crop', alt: 'Yay imtahan sessiyası', chip: 'Akademik', date: '09 İyun', title: 'Yay imtahan sessiyasının cədvəli dərc olundu' },
  { chip: 'Sertifikat', date: '05 İyun', title: 'STCW təzələmə kurslarına sənəd qəbulu davam edir' },
  { chip: 'Tələbə', date: '02 İyun', title: 'Yataqxana yerləşdirilməsi üçün elektron müraciət açıldı' },
];

// Tədbirlər (statik — F5-də `event` tipinə bağlanacaq)
const EVENTS: Array<{ d: string; m: string; chip: string; title: string; place: string; time: string }> = [
  { d: '14', m: 'İyn', chip: 'Abituriyent', title: 'Açıq qapı günü', place: 'Əsas korpus', time: '11:00' },
  { d: '18', m: 'İyn', chip: 'Karyera', title: '"Dəniz peşələri" karyera sərgisi', place: 'Akt zalı', time: '14:00' },
  { d: '21', m: 'İyn', chip: 'Elm', title: 'IAMU regional seminarı', place: 'Konfrans zalı', time: '10:00' },
  { d: '25', m: 'İyn', chip: 'Təlim', title: 'STCW yanğınla mübarizə təlimi', place: 'Təlim poliqonu', time: '09:00' },
  { d: '28', m: 'İyn', chip: 'İcma', title: 'Məzunlarla görüş axşamı', place: 'Akademiya həyəti', time: '17:00' },
];

type Card = { image: string | null; chip: string; date: string; title: string; slug?: string };

export default function News({ news, locale }: { news: NewsItem[]; locale: Locale }) {
  const slots = ['nx-a', 'nx-b', 'nx-c', 'nx-d'];

  // CMS varsa ondan, yoxdursa data-əsaslı fallback-dan — hər ikisi eyni forma
  const cards: Card[] = news.length
    ? news.slice(0, 4).map((n) => ({
        image: n.image,
        chip: CAT_LABELS[locale][n.category] ?? CAT_LABELS[locale].xeber,
        date: fmtDate(n.date, locale),
        title: n.title,
        slug: n.slug,
      }))
    : FALLBACK_NEWS.map((f) => ({
        image: f.image,
        chip: tr(f.chip, locale),
        date: fmtDate(f.date, locale),
        title: tr(f.title, locale),
      }));

  return (
    <section className="newsx" id="xeberler">
      <div className="container">
        <div className="nx-head">
          <div className="nx-head-l">
            <div className="nx-eyebrow">{tr('İnformasiya mərkəzi', locale)}</div>
            <h2 className="nx-title" dangerouslySetInnerHTML={{ __html: tr('Xəbərlər, elanlar <em>və tədbirlər</em>', locale) }} />
          </div>
          <div className="nx-actions">
            <a href={'/' + locale + '/xeberler'} className="nx-btn">{tr('Bütün xəbərlər', locale) + ' '}<i className="ti ti-arrow-right" /></a>
            <a href="#" className="nx-btn nx-btn--ghost">{tr('Elan və tədbirlər', locale) + ' '}<i className="ti ti-arrow-right" /></a>
          </div>
        </div>

        <div className="nx-grid">
          <div className="nx-news">
            {cards.map((c, i) => (
              <a
                key={i}
                href={c.slug ? '/' + locale + '/xeberler/' + c.slug : '/' + locale + '/xeberler'}
                className={`nx-card ${slots[i]}`}
                style={c.image ? { backgroundImage: `url('${c.image}')` } : { background: 'linear-gradient(135deg,#0B3D5C,#0a2f47)' }}
              >
                <span className="nx-ov" />
                <span className="nx-tx">
                  <span className="nx-chip">{c.chip}</span>
                  <span className="nx-date"><i className="ti ti-calendar" />{' ' + c.date}</span>
                  <h3>{c.title}</h3>
                </span>
              </a>
            ))}
          </div>

          <aside className="nx-rail">
            <div className="nx-sub"><i className="ti ti-speakerphone" />{' ' + tr('Elanlar', locale)}</div>
            {RAIL.map((r, i) => (
              <a href="#" className="elx" key={i}>
                {r.img && <img className="elx-thumb" src={r.img} alt={tr(r.alt ?? r.title, locale)} loading="lazy" />}
                <span className="elx-row">
                  <span className="elx-chip">{tr(r.chip, locale)}</span>
                  <span className="elx-date">{tr(r.date, locale)}</span>
                </span>
                <span className="elx-title">{tr(r.title, locale)}</span>
              </a>
            ))}
          </aside>
        </div>

        <div className="nx-sub nx-sub--ev"><i className="ti ti-calendar-event" />{' ' + tr('Tədbirlər', locale)}</div>
        <div className="nx-events">
          {EVENTS.map((e, i) => (
            <a href="#" className="evx" key={i}>
              <span className="evx-date"><b>{e.d}</b><span>{tr(e.m, locale)}</span></span>
              <span className="evx-body">
                <span className="evx-chip">{tr(e.chip, locale)}</span>
                <span className="evx-title">{tr(e.title, locale)}</span>
                <span className="evx-meta"><i className="ti ti-map-pin" />{' ' + tr(e.place, locale)}</span>
                <span className="evx-meta"><i className="ti ti-clock" />{' ' + e.time}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
