// ── Sitat + video slayder (server component) — F5.50 ─────────────────
// Əvvəlki «video sitat» (vquote: stok foto, «ADDA-nı yaşa» → href="#") əvəzinə:
// sitat (admində redaktə olunur, mətni dəyişməyib) + ASCO-nun rəsmi
// kanalından gəmi və dənizçilik videoları: böyük pleyer + kaydırılan siyahı.
//
// Məxfilik və sürət: YouTube yalnız kliklə yüklənir (youtube-nocookie.com,
// autoplay=1); ondan əvvəl yalnız önizləmə şəkli (i.ytimg.com) göstərilir.
// JS-siz: hər video YouTube-da yeni pəncərədə açılır.
// Davranış VideoSeaIsland-dadır (#vsStage, #vsRail, .vs-arr).
import { tr, type Locale } from '@/lib/i18n';
import type { VideoItem } from '@/lib/home';
import VideoSeaIsland from './VideoSeaIsland';

const QUOTES: Record<Locale, [string, string]> = { az: ['“', '”'], ru: ['«', '»'], en: ['“', '”'] };
const watch = (id: string) => `https://www.youtube.com/watch?v=${id}`;
const thumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

export default function VideoSea({
  quote,
  videos,
  channel,
  locale,
}: {
  quote: { text: string; attr: string };
  videos: VideoItem[];
  channel: string;
  locale: Locale;
}) {
  const [qo, qc] = QUOTES[locale];
  const first = videos[0];
  return (
    <section className="vsea" id="video" aria-labelledby="vs-title">
      <i className="ti ti-anchor vsea-wm" aria-hidden="true" />
      <div className="container vsea-in">
        <div className={'vs-grid' + (first ? '' : ' vs-grid--solo')}>
          <div className="vs-tx">
            <div className="vs-eyebrow">{tr('Dəniz həyatı', locale)}</div>
            <figure className="vs-quote">
              <blockquote>{qo + quote.text + qc}</blockquote>
              {quote.attr ? <figcaption>{quote.attr}</figcaption> : null}
            </figure>
            {first ? (
              <div className="vs-sub">
                <h2 id="vs-title" className="vs-h">{tr('ASCO gəmilərindən videolar', locale)}</h2>
                <p className="vs-lead">
                  {tr('Tələbələrimizin təcrübə keçdiyi və məzunlarımızın çalışdığı donanma: səfərlər, gəmilər və dənizçilər.', locale)}
                </p>
                <a className="vs-chan" href={channel} target="_blank" rel="noopener noreferrer">
                  <i className="ti ti-brand-youtube" aria-hidden="true" />
                  {' ' + tr('ASCO-nun YouTube kanalı', locale) + ' '}
                  <i className="ti ti-arrow-up-right" aria-hidden="true" />
                </a>
              </div>
            ) : (
              <h2 id="vs-title" className="vs-vh">{tr('Dəniz həyatı', locale)}</h2>
            )}
          </div>

          {first ? (
            <div className="vs-stage" id="vsStage">
              <a
                className="vs-poster"
                href={watch(first.id)}
                target="_blank"
                rel="noopener noreferrer"
                data-id={first.id}
                aria-label={tr('Videonu izlə', locale) + ': ' + first.title}
              >
                <img src={thumb(first.id)} alt="" decoding="async" loading="lazy" />
                <span className="vs-play" aria-hidden="true">
                  <i className="ti ti-player-play-filled" />
                </span>
                <span className="vs-cap">
                  <span className="vs-cap-src">ASCO · YouTube</span>
                  <b className="vs-cap-t">{first.title}</b>
                </span>
              </a>
            </div>
          ) : null}
        </div>

        {videos.length > 1 ? (
          <div className="vs-railwrap">
            <div className="vs-rail-head">
              <span className="vs-rail-label">{tr('Bütün videolar', locale) + ' · ' + videos.length}</span>
              <div className="vs-arrows">
                <button type="button" className="vs-arr" data-dir="-1" aria-label={tr('Əvvəlki videolar', locale)} aria-controls="vsRail">
                  <i className="ti ti-chevron-left" aria-hidden="true" />
                </button>
                <button type="button" className="vs-arr" data-dir="1" aria-label={tr('Sonrakı videolar', locale)} aria-controls="vsRail">
                  <i className="ti ti-chevron-right" aria-hidden="true" />
                </button>
              </div>
            </div>
            <ul className="vs-rail" id="vsRail">
              {videos.map((v, i) => (
                <li className="vs-item" key={v.id}>
                  <a
                    href={watch(v.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-id={v.id}
                    data-title={v.title}
                    aria-current={i === 0 ? 'true' : undefined}
                  >
                    <span className="vs-th">
                      <img src={thumb(v.id)} alt="" decoding="async" loading="lazy" />
                      <span className="vs-th-play" aria-hidden="true">
                        <i className="ti ti-player-play-filled" />
                      </span>
                    </span>
                    <span className="vs-it-t">{v.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {first ? <VideoSeaIsland /> : null}
    </section>
  );
}
