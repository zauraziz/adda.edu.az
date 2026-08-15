// K18 — statik məzmun səhifəsi (paylaşılan server komponenti).
//
// Miqrasiyadan gələn 53 sənəd — səhifə, şöbə, ixtisas, fakültə — eyni formadadır:
// başlıq + Markdown gövdə. Dörd marşrut bu komponenti işlədir, yəni layout,
// naviqasiya və stil bir yerdə saxlanılır.
//
// `19-news-page.css`-in `na-*` sinifləri təkrar işlədilir — xəbər səhifəsi ilə
// eyni tipoqrafiya və ölçülər, yeni CSS yazılmır.
import Link from 'next/link';
import { marked } from 'marked';
import SiteHeaderStack from './SiteHeaderStack';
import Footer from './Footer';
import CorrectionIsland, { type TargetType } from './CorrectionIsland';
import type { SiteMenu } from '@/lib/strapi';
import { tr, fallbackNotice, type Locale } from '@/lib/i18n';

export interface ContentPageProps {
  locale: Locale;
  menu: SiteMenu | null;
  /** Üst sətir — bölmənin adı (məs. "Struktur") */
  kicker: string;
  title: string;
  body: string | null;
  /** Geri linki: [mətn, yol] */
  back?: { label: string; href: string };
  /** Düzəliş adası üçün hədəf tipi; verilməsə ada göstərilmir. */
  correction?: { targetType: TargetType; targetSlug: string; labels: Record<string, string> };
  /** F3.28: cari dildə tapılmadı, `az` versiyası göstərilir. */
  isFallback?: boolean;
}

export default async function ContentPage({
  locale,
  menu,
  kicker,
  title,
  body,
  back,
  correction,
  isFallback,
}: ContentPageProps) {
  const bodyHtml = body ? await marked.parse(body) : '';
  const notice = isFallback ? fallbackNotice(locale) : null;

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main className="na-wrap">
        {back ? (
          <div className="container">
            <Link href={back.href} className="na-back">
              <i className="ti ti-arrow-left" />
              {' ' + back.label}
            </Link>
          </div>
        ) : null}

        <article>
          {notice ? (
            <div className="container">
              <div
                role="status"
                style={{
                  background: '#FBF4E4',
                  border: '1px solid #C9A961',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  color: '#0B3D5C',
                  fontSize: '0.95rem',
                }}
              >
                {notice}
              </div>
            </div>
          ) : null}

          <div className="container na-head">
            <div className="na-eyebrow">{kicker}</div>
            <h1 className="na-title">{title}</h1>
          </div>

          <div className="container">
            {bodyHtml ? (
              <div className="na-body" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
            ) : (
              <div className="na-body">
                <p>{tr('Bu səhifənin məzmunu hazırlanır.', locale)}</p>
              </div>
            )}
          </div>

          {correction ? (
            <div className="container" style={{ paddingBottom: '48px' }}>
              <CorrectionIsland
                targetType={correction.targetType}
                targetSlug={correction.targetSlug}
                title={title}
                locale={locale}
                labels={correction.labels}
              />
            </div>
          ) : null}
        </article>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
