// ── Faza 1 / News (server component) ─────────────────────────────────
// "Gündəm" bölməsi: xəbər mozaikası (CMS) + elan raili + tədbirlər.
// Əvvəl HomeClient-də MARKUP + {{NEWS_CARDS}} tokeni ilə qurulurdu.
import { mediaUrl, type Announcement, type NewsItem } from '@/lib/strapi';
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

// F2/K7 — elan raili artıq CMS-dəndir. Statik placeholder silindi.
//
// NİYƏ FALLBACK YOXDUR: xəbər mozaikasında `FALLBACK_NEWS` var idi və Strapi boş
// qaytaranda saxta kartlar göstərirdi — bu, "məzmun görünür" illüziyası yaradıb
// real problemi gizlədirdi. Rail-da bunu təkrarlamırıq: elan yoxdursa rail
// ümumiyyətlə render olunmur və grid tək sütuna keçir.
const RAIL_IMP: Record<Locale, Record<Announcement['importance'], string>> = {
  az: { normal: 'Elan', vacib: 'Vacib', kritik: 'Təcili' },
  ru: { normal: 'Объявление', vacib: 'Важно', kritik: 'Срочно' },
  en: { normal: 'Notice', vacib: 'Important', kritik: 'Urgent' },
};

/** Rail-da qısa tarix: "09 İyun" */
function fmtShort(iso: string | null, locale: Locale): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return String(d.getUTCDate()).padStart(2, '0') + ' ' + MONTHS[locale][d.getUTCMonth()];
}

/**
 * Rail-a neçə elan sığır — `.nx-news` 632px hündürlüyünə görə ÖLÇÜLÜB:
 *   başlıq zolağı (.nx-sub)         ~34px
 *   şəkilli kart                    ~232px
 *   şəkilsiz kart (2 sətir clamp)   ~101px
 *   aralıq (gap)                     12px
 * Şəkilli birinci kart varsa: 232 + 3×113 = 571px → 4 element.
 * Şəkil yoxdursa:             101 + 4×113 = 553px → 5 element.
 * Hər iki halda 598px-lik boşluğa sığır və aşağı hədd xəbər blokuna yaxın olur.
 */
function railFit(items: Announcement[]): Announcement[] {
  const hasCover = Boolean(items[0] && mediaUrl(items[0].cover));
  return items.slice(0, hasCover ? 4 : 5);
}

// Tədbirlər (statik — F5-də `event` tipinə bağlanacaq)
const EVENTS: Array<{ d: string; m: string; chip: string; title: string; place: string; time: string }> = [
  { d: '14', m: 'İyn', chip: 'Abituriyent', title: 'Açıq qapı günü', place: 'Əsas korpus', time: '11:00' },
  { d: '18', m: 'İyn', chip: 'Karyera', title: '"Dəniz peşələri" karyera sərgisi', place: 'Akt zalı', time: '14:00' },
  { d: '21', m: 'İyn', chip: 'Elm', title: 'IAMU regional seminarı', place: 'Konfrans zalı', time: '10:00' },
  { d: '25', m: 'İyn', chip: 'Təlim', title: 'STCW yanğınla mübarizə təlimi', place: 'Təlim poliqonu', time: '09:00' },
  { d: '28', m: 'İyn', chip: 'İcma', title: 'Məzunlarla görüş axşamı', place: 'Akademiya həyəti', time: '17:00' },
];

type Card = { image: string | null; chip: string; date: string; title: string; slug?: string };

export default function News({
  news,
  announcements = [],
  locale,
}: {
  news: NewsItem[];
  announcements?: Announcement[];
  locale: Locale;
}) {
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

  const rail = railFit(announcements);

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
            <a href={'/' + locale + '/elanlar'} className="nx-btn nx-btn--ghost">{tr('Elan və tədbirlər', locale) + ' '}<i className="ti ti-arrow-right" /></a>
          </div>
        </div>

        <div className={'nx-grid' + (rail.length ? '' : ' nx-grid--norail')}>
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

          {rail.length ? (
            <aside className="nx-rail">
              <div className="nx-sub"><i className="ti ti-speakerphone" />{' ' + tr('Elanlar', locale)}</div>
              {rail.map((a, i) => {
                const img = i === 0 ? mediaUrl(a.cover) : null;
                return (
                  <a href={'/' + locale + '/elanlar/' + a.slug} className="elx" key={a.documentId}>
                    {img ? <img className="elx-thumb" src={img} alt={a.title} loading="lazy" /> : null}
                    <span className="elx-row">
                      <span className={'elx-chip' + (a.importance !== 'normal' ? ' is-' + a.importance : '')}>
                        {RAIL_IMP[locale][a.importance] ?? RAIL_IMP[locale].normal}
                      </span>
                      <span className="elx-date">{fmtShort(a.publishAt, locale)}</span>
                    </span>
                    <span className="elx-title">{a.title}</span>
                  </a>
                );
              })}
            </aside>
          ) : null}
        </div>

        <div className="nx-sub nx-sub--ev"><i className="ti ti-calendar-event" />{' ' + tr('Tədbirlər', locale)}</div>
        <div className="nx-events">
          {EVENTS.map((e, i) => (
            <a href={'/' + locale + '/tedbirler'} className="evx" key={i}>
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
