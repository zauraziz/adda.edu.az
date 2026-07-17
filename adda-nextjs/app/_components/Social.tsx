// ── Faza 1 / Social (server component) ───────────────────────────────
// "ADDA sosial şəbəkələrdə" (socialx · scroll-x karusel) bölməsi.
// Əvvəl HomeClient MARKUP-ında idi. Mətnlər tr() (exact-match) ilə.
// tr() lüğətdə olmayan sətri olduğu kimi qaytarır — ona görə handle
// (@adda.official) və rəqəmlər (1,2K) də eyni yoldan keçir, amma dəyişmir;
// 'ADDA rəsmi' və '23K baxış' isə T-də olduğu üçün tərcümə olunur.
//
// JS contract ID-ləri: #sosial · #sxSpace · #sxViewport · #sxTrack · #sxBar
// Karusel davranışı client island-dadır (SocialIsland.tsx).
import { tr, type Locale } from '@/lib/i18n';
import SocialIsland from './SocialIsland';

const SOCIALS: { name: string; icon: string }[] = [
  { name: 'Instagram', icon: 'ti-brand-instagram' },
  { name: 'TikTok', icon: 'ti-brand-tiktok' },
  { name: 'YouTube', icon: 'ti-brand-youtube' },
  { name: 'Facebook', icon: 'ti-brand-facebook' },
  { name: 'LinkedIn', icon: 'ti-brand-linkedin' },
];

// Heşteqlər brend kimliyidir — üç dildə eynidir, tərcümə olunmur.
const TAGS = ['#ADDAlife', '#DənizçiOl', '#ADDA2026'];

type Meta = { icon: string; val: string };
type Card = {
  img: string;
  icon: string;
  chipMod?: string;
  handle: string;
  play?: 'sm' | 'lg';
  dur?: string;
  cap: string;
  tag?: string;
  meta: Meta[];
};

const U = 'https://images.unsplash.com/';

// Stub UGC datası — Faza 2-də CMS-ə bağlanır (href="#" da onda real olur).
const CARDS: Card[] = [
  {
    img: U + 'photo-1724597500306-a4cbb7d1324e?fm=jpg&q=78&w=700&h=960&fit=crop',
    icon: 'ti-brand-instagram',
    handle: '@adda.official',
    cap: 'Dəniz klubunun yelkən məşqi — Xəzərdə ilk solo dövrə 🌊',
    tag: '#ADDAlife',
    meta: [{ icon: 'ti-heart', val: '1,2K' }, { icon: 'ti-message-circle', val: '84' }],
  },
  {
    img: U + 'photo-1641467613990-b74163e280e3?fm=jpg&q=78&w=700&h=960&fit=crop&crop=entropy',
    icon: 'ti-brand-tiktok',
    handle: '@adda.students',
    play: 'sm',
    cap: 'POV: körpü simulyatorunda ilk gecə növbən ⚓',
    tag: '#DənizçiOl',
    meta: [{ icon: 'ti-heart', val: '8,4K' }, { icon: 'ti-share-3', val: '612' }],
  },
  {
    img: U + 'photo-1751779057940-43cc385452f7?fm=jpg&q=78&w=700&h=960&fit=crop&crop=left',
    icon: 'ti-brand-instagram',
    handle: '@adda.official',
    cap: 'Beynəlxalq tələbə axşamı: 12 ölkə, bir süfrə 🌍',
    meta: [{ icon: 'ti-heart', val: '976' }, { icon: 'ti-message-circle', val: '41' }],
  },
  {
    img: U + 'photo-1724597500306-a4cbb7d1324e?fm=jpg&q=78&w=700&h=960&fit=crop&crop=right',
    icon: 'ti-brand-youtube',
    chipMod: 'sx-chip--yt',
    handle: 'ADDA TV',
    play: 'lg',
    dur: '4:37',
    cap: 'Bir gün kursantla: səhər sırasından axşam kitabxanasına',
    meta: [{ icon: 'ti-eye', val: '23K baxış' }],
  },
  {
    img: U + 'photo-1641467613990-b74163e280e3?fm=jpg&q=78&w=700&h=960&fit=crop&crop=left',
    icon: 'ti-brand-facebook',
    handle: 'ADDA rəsmi',
    cap: 'Məzun günü 2026: 340 yeni zabit dənizə yola düşür 🎓',
    meta: [{ icon: 'ti-heart', val: '2,1K' }, { icon: 'ti-share-3', val: '388' }],
  },
  {
    img: U + 'photo-1751779057940-43cc385452f7?fm=jpg&q=78&w=700&h=960&fit=crop&crop=right',
    icon: 'ti-brand-linkedin',
    handle: 'ADDA Careers',
    cap: 'Karyera sərgisində 28 gəmiçilik şirkəti kursantlarımızla görüşdü',
    meta: [{ icon: 'ti-thumb-up', val: '540' }, { icon: 'ti-message-circle', val: '37' }],
  },
  {
    img: U + 'photo-1724597500306-a4cbb7d1324e?fm=jpg&q=78&w=700&h=960&fit=crop&crop=top',
    icon: 'ti-brand-instagram',
    handle: '@adda.sport',
    cap: 'Fakültələrarası üzgüçülük finalı — rekord qırıldı 🏊',
    tag: '#ADDA2026',
    meta: [{ icon: 'ti-heart', val: '1,7K' }, { icon: 'ti-message-circle', val: '96' }],
  },
];

const PlayIcon = ({ n }: { n: number }) => (
  <svg width={n} height={n} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="6 3 21 12 6 21 6 3" />
  </svg>
);

export default function Social({ locale }: { locale: Locale }) {
  return (
    <section className="socialx" id="sosial">
      <div className="sx-space" id="sxSpace">
        <div className="sx-sticky">
          <div className="container sx-head">
            <div className="sx-head-l">
              <div className="sx-eyebrow">{tr('ADDA sosial şəbəkələrdə', locale)}</div>
              {/* <em> saxlayır → tr() nəticəsi olduğu kimi yerləşdirilir */}
              <h2
                className="sx-title"
                dangerouslySetInnerHTML={{ __html: tr('Kampusun nəbzi — <em>canlı yayımda</em>', locale) }}
              />
              <p className="sx-lead">
                {tr(
                  'Tələbələrimizin gözü ilə ADDA: dəniz klubundan yataqxana axşamlarına, simulyator sessiyalarından məzun gününə. İzlə, bəyən, sabah özün paylaş.',
                  locale
                )}
              </p>
            </div>
            <div className="sx-head-r">
              {/* Faza 2: href="#" → rəsmi sosial hesab linkləri */}
              <div className="sx-follow">
                {SOCIALS.map((s) => (
                  <a href="#" className="sx-fbtn" aria-label={s.name} key={s.name}>
                    <i className={`ti ${s.icon}`} />
                  </a>
                ))}
              </div>
              <div className="sx-tags">
                {TAGS.map((t) => (
                  <span className="sx-tag" key={t}>{t}</span>
                ))}
              </div>
            </div>
          </div>

          <div
            className="sx-viewport"
            id="sxViewport"
            tabIndex={0}
            aria-label={tr('Sosial paylaşımlar karuseli — sürüşdür', locale)}
          >
            <div className="sx-track" id="sxTrack">
              {CARDS.map((c, i) => (
                <a href="#" className="sx-card" style={{ backgroundImage: `url('${c.img}')` }} key={i}>
                  <span className="sx-ov" />
                  <span className="sx-top">
                    <span className={c.chipMod ? `sx-chip ${c.chipMod}` : 'sx-chip'}>
                      <i className={`ti ${c.icon}`} />{' ' + tr(c.handle, locale)}
                    </span>
                  </span>
                  {c.play === 'sm' && <span className="sx-play"><PlayIcon n={16} /></span>}
                  {c.play === 'lg' && <span className="sx-play sx-play--lg"><PlayIcon n={20} /></span>}
                  {c.dur && <span className="sx-dur">{c.dur}</span>}
                  <span className="sx-body">
                    <span className="sx-cap">
                      {tr(c.cap, locale)}
                      {c.tag ? <>{' '}<b>{c.tag}</b></> : null}
                    </span>
                    <span className="sx-meta">
                      {c.meta.map((m) => (
                        <span className="sx-mi" key={m.icon}>
                          <i className={`ti ${m.icon}`} />{' ' + tr(m.val, locale)}
                        </span>
                      ))}
                    </span>
                  </span>
                </a>
              ))}

              <div className="sx-card sx-card--cta">
                {/* <em> + <br> saxlayır → tam-sətir T girişi */}
                <span
                  className="sx-cta-t"
                  dangerouslySetInnerHTML={{ __html: tr('Sən də <em>izlə</em> —<br>sabah bu kadrlarda ol', locale) }}
                />
                <span className="sx-cta-icons">
                  {SOCIALS.map((s) => (
                    <a href="#" aria-label={s.name} key={s.name}>
                      <i className={`ti ${s.icon}`} />
                    </a>
                  ))}
                </span>
                <span className="sx-cta-tag">#ADDAlife</span>
              </div>
            </div>
          </div>

          <div className="sx-progress" aria-hidden="true"><i id="sxBar" /></div>
        </div>
      </div>

      <SocialIsland />
    </section>
  );
}
