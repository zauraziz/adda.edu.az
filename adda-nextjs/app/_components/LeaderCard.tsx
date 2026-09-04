// F5.14a — struktur/[slug] rəhbər kartı (F4.9d) BURAYA çıxarılıb ki,
// ixtisas səhifəsi (F5.14a) EYNİ kart/CSS-i işlətsin (bax 36-unit.css
// .un-head-*). Çağıran `head` mövcudluğunu özü yoxlayır (kart null halı
// göstərmir).
import Link from 'next/link';
import { AdminOnly } from './AdminGate';
import { adminUrl } from './AdminOnly';
import { mediaUrl, type LeaderPerson } from '@/lib/strapi';
import { tr, type Locale } from '@/lib/i18n';

/**
 * F4.7c/F4.9d — e-poçt `overflow-wrap: anywhere` ilə söz ortasından qırılırdı
 * («zaur.aziz@add / a.edu.az»). `word-break: break-all` da işlədilmir (eyni
 * problem). `<wbr>` YALNIZ `@`-dan sonra qırılma nöqtəsi əlavə edir, CSS-də
 * `overflow-wrap: normal` ilə birlikdə (bax 36-unit.css .un-head-contact dd)
 * qırılma YALNIZ bu yerdə baş verir.
 */
function EmailWrap({ email }: { email: string }) {
  const at = email.indexOf('@');
  if (at === -1) return <>{email}</>;
  return (
    <>
      {email.slice(0, at + 1)}
      <wbr />
      {email.slice(at + 1)}
    </>
  );
}

export default function LeaderCard({ head, locale }: { head: LeaderPerson; locale: Locale }) {
  const photo = mediaUrl(head.photo);
  return (
    <div>
      <div className="un-sub-title">{tr('Rəhbər', locale)}</div>
      <div className="un-head-card">
        <div className="un-head-top">
          <Link href={`/${locale}/emekdas/${head.slug}`} className="un-head-plate">
            {photo ? (
              <img src={photo} alt="" loading="lazy" />
            ) : (
              <span className="un-head-mono" aria-hidden="true">
                {(head.displayName || head.name || '—').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
              </span>
            )}
          </Link>
          {head.position ? <div className="un-head-position">{head.position}</div> : null}
        </div>
        <Link href={`/${locale}/emekdas/${head.slug}`} className="un-head-name">
          {head.displayName || head.name}
        </Link>
        <dl className="un-head-contact">
          {head.email ? (
            <div>
              <dt>{tr('E-poçt', locale)}</dt>
              <dd><a href={`mailto:${head.email}`}><EmailWrap email={head.email} /></a></dd>
            </div>
          ) : null}
          {head.phone ? (
            <div>
              <dt>{tr('Telefon', locale)}</dt>
              <dd><a href={`tel:${head.phone.replace(/[^\d+]/g, '')}`}>{head.phone}</a></dd>
            </div>
          ) : null}
        </dl>
        <AdminOnly>
          <div className="un-head-admin">
            <span>{tr('Redaktə', locale)}:</span>
            <a href={adminUrl('api::person.person', head.documentId, locale)} target="_blank" rel="noreferrer">
              {tr('şəxs', locale)}
            </a>
          </div>
        </AdminOnly>
      </div>
    </div>
  );
}
