// F5.2a — struktur və ixtisas səhifələrində əl ilə TƏKRARLANMIŞ admin
// bəzəkləri (adminUrl/BlockTitle/AdminEditRow/EmptyBlock/EmptyExpandItem)
// bura çıxarılıb. Bu, admin QAPISIDIR (bax AdminGate.tsx) — iki nüsxə
// demək bir tərəfdə edilən düzəlişin digərində unudulması, ya da
// redaktə keçidinin ictimai səhifədə yanlışlıqla görünməsi riski demək
// idi. Davranış DƏYİŞMİR — hər iki səhifə əvvəlki kimi işləyir, sadəcə
// hədəf kolleksiya (`uid`, məs. 'api::unit.unit'/'api::program.program')
// indi PROP-dur, hardcode deyil.
//
// `'use client'` YOXDUR qəsdən — bu funksiyalar sərf sadə JSX qaytarır,
// klient sərhədi `<AdminOnly>`-nin özündədir (bax AdminGate.tsx). Server
// komponenti olan səhifələr bunları birbaşa import edə bilər.
import { AdminOnly } from './AdminGate';
import { STRAPI_URL } from '@/lib/strapi';
import { tr, type Locale } from '@/lib/i18n';

export function adminUrl(uid: string, documentId: string, locale: Locale): string {
  return (
    `${STRAPI_URL}/admin/content-manager/collection-types/${uid}/${documentId}` +
    `?plugins[i18n][locale]=${locale}`
  );
}

/** F4.3/F4.9b — blok başlığı + admin sessiyasında kiçik «redaktə» keçidi.
 * `<AdminOnly>` klient adasıdır (bax AdminGate.tsx) — kimlik yoxlaması
 * `/api/identity/is-admin`-dən hidrasiyadan sonra gəlir, server heç kimin
 * admin olub-olmadığını bilmir (səhifə statik qalır). */
export function BlockTitle({
  uid,
  title,
  documentId,
  locale,
}: {
  uid: string;
  title: string;
  documentId: string;
  locale: Locale;
}) {
  return (
    <div className="un-block-head">
      <h2 className="un-block-title">{title}</h2>
      <AdminOnly>
        <a className="un-admin-edit" href={adminUrl(uid, documentId, locale)} target="_blank" rel="noreferrer">
          {tr('redaktə', locale)}
        </a>
      </AdminOnly>
    </div>
  );
}

/**
 * F4.8a — blok öz h2-sini göstərmir (hər sahə öz başlığını daşıyır), amma
 * admin redaktə keçidi itməməlidir. Sadəcə sağa düzülmüş kiçik keçid sətri.
 */
export function AdminEditRow({ uid, documentId, locale }: { uid: string; documentId: string; locale: Locale }) {
  return (
    <AdminOnly>
      <div className="un-block-head" style={{ justifyContent: 'flex-end' }}>
        <a className="un-admin-edit" href={adminUrl(uid, documentId, locale)} target="_blank" rel="noreferrer">
          {tr('redaktə', locale)}
        </a>
      </div>
    </AdminOnly>
  );
}

/**
 * F4.3/F4.9b — boş blok, YALNIZ təsdiqlənmiş admin sessiyasında görünür
 * (bax çağıran yerdəki `<AdminOnly>` örtüyü). İctimai görünüşdə boş blok
 * HEÇ VAXT render olunmur.
 *
 * F4.8e — real (dolu) blokla qarışmasın deyə BlockTitle-dan AYRI render
 * olunur: kəsik çərçivə/solğun fon (.un-block--empty, 36-unit.css) +
 * başlıqda «yalnız admin» nişanı.
 */
export function EmptyBlock({
  uid,
  title,
  documentId,
  locale,
  tint,
}: {
  uid: string;
  title: string;
  documentId: string;
  locale: Locale;
  tint: boolean;
}) {
  return (
    <section className={'un-block un-block--empty' + (tint ? ' un-block--tint' : '')}>
      <div className="un-block-head">
        <h2 className="un-block-title">
          {title}
          <span className="un-admin-badge">{tr('yalnız admin', locale)}</span>
        </h2>
        <a className="un-admin-edit" href={adminUrl(uid, documentId, locale)} target="_blank" rel="noreferrer">
          {tr('redaktə', locale)}
        </a>
      </div>
      <p className="un-block-empty-note">{tr('Bu blok boşdur.', locale)}</p>
    </section>
  );
}

/**
 * F4.10 — akkordeon qrupu (.un-expand-group) daxilində boş sahə, YALNIZ
 * admin sessiyasında. EmptyBlock-dan fərqli olaraq bounded/tinted section
 * YOX — qrupun içindəki digər .un-expand kartları ilə eyni qabıqda,
 * sadəcə kəsik sərhədlə (.un-expand--empty).
 */
export function EmptyExpandItem({
  uid,
  title,
  documentId,
  locale,
}: {
  uid: string;
  title: string;
  documentId: string;
  locale: Locale;
}) {
  return (
    <div className="un-expand un-expand--empty">
      <div className="un-expand-empty-head">
        <span className="un-expand-empty-title">
          {title}
          <span className="un-admin-badge">{tr('yalnız admin', locale)}</span>
        </span>
        <a className="un-admin-edit" href={adminUrl(uid, documentId, locale)} target="_blank" rel="noreferrer">
          {tr('redaktə', locale)}
        </a>
      </div>
      <p className="un-block-empty-note">{tr('Bu blok boşdur.', locale)}</p>
    </div>
  );
}
