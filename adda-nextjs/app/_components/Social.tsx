// ── K31 / Social (server component) ──────────────────────────────────
// «ADDA sosial şəbəkələrdə» (socialx · scroll-x karusel) bölməsi.
//
// ARTIQ STRAPI-DƏN GƏLİR. Əvvəl bütün bölmə koda yazılmış UYDURMA data idi:
// Unsplash şəkilləri, saxta hesablar (@adda.students), saxta bəyənmə sayları
// (8,4K) və hər kartda `href="#"`. Faylın öz şərhi bunu «Stub UGC datası —
// Faza 2-də CMS-ə bağlanır» deyə qeyd edirdi. Bağlandı:
//   · `api::social-block.social-block`  — başlıq, mətn, heşteqlər, hesab linkləri
//   · `api::social-post.social-post`    — karusel kartları
//
// PAYLAŞIM YOXDURSA BÖLMƏ RENDER OLUNMUR. Uydurma məzmunu ehtiyat surət kimi
// saxlamaq olardı, amma saxta rəqəmləri ana səhifədə göstərmək məlumat
// deyil, desinformasiyadır. Boş karusel də sınmış görünərdi. Redaktor ilk
// real paylaşımı əlavə edən kimi bölmə görünür.
//
// JS contract ID-ləri dəyişməyib: #sosial · #sxSpace · #sxViewport · #sxTrack · #sxBar
import { tr, type Locale } from '@/lib/i18n';
import { fmtCount } from '@/lib/format';
import {
  getSocialBlock,
  getSocialPosts,
  mediaUrl,
  type SocialBlock,
  type SocialNetwork,
  type SocialPost,
} from '@/lib/strapi';
import SocialIsland from './SocialIsland';

/** Şəbəkə → Tabler ikonu. Frontend məsələsidir, admin-də seçim enum-dur. */
const NET_ICON: Record<SocialNetwork, string> = {
  instagram: 'ti-brand-instagram',
  tiktok: 'ti-brand-tiktok',
  youtube: 'ti-brand-youtube',
  facebook: 'ti-brand-facebook',
  linkedin: 'ti-brand-linkedin',
};

const NET_LABEL: Record<SocialNetwork, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
};

/** Rəsmi hesab düymələri — yalnız URL doldurulmuş şəbəkələr göstərilir. */
function follows(block: SocialBlock | null): { net: SocialNetwork; url: string }[] {
  if (!block) return [];
  const pairs: [SocialNetwork, string | null][] = [
    ['instagram', block.instagramUrl],
    ['tiktok', block.tiktokUrl],
    ['youtube', block.youtubeUrl],
    ['facebook', block.facebookUrl],
    ['linkedin', block.linkedinUrl],
  ];
  return pairs.filter(([, u]) => !!u && u.trim()).map(([net, u]) => ({ net, url: (u as string).trim() }));
}

/** Heşteqlər: sətir və ya vergüllə ayrılır, `#` yoxdursa əlavə olunur. */
function hashtags(block: SocialBlock | null): string[] {
  if (!block?.hashtags) return [];
  return block.hashtags
    .split(/[\n,]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => (t.startsWith('#') ? t : '#' + t));
}

/** Kartın göstəriciləri — yalnız doldurulmuş sahələr. */
function metrics(p: SocialPost, locale: Locale): { icon: string; val: string }[] {
  const out: { icon: string; val: string }[] = [];
  const push = (icon: string, n: number | null) => {
    const v = fmtCount(n, locale);
    if (v) out.push({ icon, val: v });
  };
  push('ti-eye', p.views);
  push('ti-heart', p.likes);
  push('ti-message-circle', p.comments);
  push('ti-share-3', p.shares);
  return out.slice(0, 2);
}

const PlayIcon = ({ n }: { n: number }) => (
  <svg width={n} height={n} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="6 3 21 12 6 21 6 3" />
  </svg>
);

export default async function Social({ locale }: { locale: Locale }) {
  const [block, posts] = await Promise.all([
    getSocialBlock(locale),
    getSocialPosts(locale, 12),
  ]);

  const cards = posts.filter((p) => mediaUrl(p.image));
  if (!cards.length) return null;

  const fw = follows(block);
  const tags = hashtags(block);

  return (
    <section className="socialx" id="sosial">
      <div className="sx-space" id="sxSpace">
        <div className="sx-sticky">
          <div className="container sx-head">
            <div className="sx-head-l">
              {block?.eyebrow ? <div className="sx-eyebrow">{block.eyebrow}</div> : null}
              {block?.title ? (
                // `<em>` redaktorun yazdığı vurğudur — olduğu kimi yerləşdirilir.
                <h2 className="sx-title" dangerouslySetInnerHTML={{ __html: block.title }} />
              ) : null}
              {block?.lead ? <p className="sx-lead">{block.lead}</p> : null}
            </div>
            <div className="sx-head-r">
              {fw.length ? (
                <div className="sx-follow">
                  {fw.map((f) => (
                    <a
                      href={f.url}
                      className="sx-fbtn"
                      aria-label={NET_LABEL[f.net]}
                      target="_blank"
                      rel="noopener noreferrer"
                      key={f.net}
                    >
                      <i className={`ti ${NET_ICON[f.net]}`} aria-hidden="true" />
                    </a>
                  ))}
                </div>
              ) : null}
              {tags.length ? (
                <div className="sx-tags">
                  {tags.map((t) => (
                    <span className="sx-tag" key={t}>{t}</span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div
            className="sx-viewport"
            id="sxViewport"
            tabIndex={0}
            aria-label={tr('Sosial paylaşımlar karuseli — sürüşdür', locale)}
          >
            <div className="sx-track" id="sxTrack">
              {cards.map((c, i) => {
                const img = mediaUrl(c.image) as string;
                const ms = metrics(c, locale);
                return (
                  <a
                    href={c.url}
                    className="sx-card"
                    style={{ backgroundImage: `url('${img}')` }}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={c.documentId ?? i}
                  >
                    <span className="sx-ov" />
                    <span className="sx-top">
                      <span className={c.network === 'youtube' ? 'sx-chip sx-chip--yt' : 'sx-chip'}>
                        <i className={`ti ${NET_ICON[c.network]}`} aria-hidden="true" />
                        {' ' + c.handle}
                      </span>
                    </span>
                    {c.video ? (
                      <span className={c.duration ? 'sx-play sx-play--lg' : 'sx-play'}>
                        <PlayIcon n={c.duration ? 20 : 16} />
                      </span>
                    ) : null}
                    {c.duration ? <span className="sx-dur">{c.duration}</span> : null}
                    <span className="sx-body">
                      {c.caption ? (
                        <span className="sx-cap">
                          {c.caption}
                          {c.hashtag ? <>{' '}<b>{c.hashtag}</b></> : null}
                        </span>
                      ) : null}
                      {ms.length ? (
                        <span className="sx-meta">
                          {ms.map((m) => (
                            <span className="sx-mi" key={m.icon}>
                              <i className={`ti ${m.icon}`} aria-hidden="true" />
                              {' ' + m.val}
                            </span>
                          ))}
                        </span>
                      ) : null}
                    </span>
                  </a>
                );
              })}

              {block?.ctaText || fw.length ? (
                <div className="sx-card sx-card--cta">
                  {block?.ctaText ? (
                    <span className="sx-cta-t" dangerouslySetInnerHTML={{ __html: block.ctaText }} />
                  ) : null}
                  {fw.length ? (
                    <span className="sx-cta-icons">
                      {fw.map((f) => (
                        <a
                          href={f.url}
                          aria-label={NET_LABEL[f.net]}
                          target="_blank"
                          rel="noopener noreferrer"
                          key={f.net}
                        >
                          <i className={`ti ${NET_ICON[f.net]}`} aria-hidden="true" />
                        </a>
                      ))}
                    </span>
                  ) : null}
                  {block?.ctaTag ? <span className="sx-cta-tag">{block.ctaTag}</span> : null}
                </div>
              ) : null}
            </div>
          </div>

          <div className="sx-progress" aria-hidden="true"><i id="sxBar" /></div>
        </div>
      </div>

      <SocialIsland />
    </section>
  );
}
