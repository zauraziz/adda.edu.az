// F2.5c / Tədbir detalı — /[locale]/tedbirler/[slug]
// getEventBySlug (F2.5b). Body markdown -> HTML (marked). Format, tarix/vaxt,
// məkan/onlayn, tutum, spikerlər struktur blokda.
// F2.6b: RSVP + .ics · F2.6c: dənizçilik reaksiyaları — kontent sütununda.
import '../../../_styles/01-base.css';
import '../../../_styles/02-header.css';
import '../../../_styles/03-hero.css';
import '../../../_styles/04-quicknav.css';
import '../../../_styles/05-legacy.css';
import '../../../_styles/06-spotlight.css';
import '../../../_styles/07-stats.css';
import '../../../_styles/08-news.css';
import '../../../_styles/09-campus.css';
import '../../../_styles/10-intl.css';
import '../../../_styles/11-social.css';
import '../../../_styles/12-vquote.css';
import '../../../_styles/13-legacy2.css';
import '../../../_styles/14-footer.css';
import '../../../_styles/15-responsive.css';
import '../../../_styles/16-footer-ftx.css';
import '../../../_styles/17-header-mega.css';
import '../../../_styles/18-search.css';
import '../../../_styles/19-news-page.css';
import '../../../_styles/21-rsvp.css';
import '../../../_styles/22-reactions.css';
import '../../../_styles/23-correction.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { marked } from 'marked';
import SiteHeaderStack from '../../../_components/SiteHeaderStack';
import Footer from '../../../_components/Footer';
import RsvpIsland from '../../../_components/RsvpIsland';
import ReactionBar from '../../../_components/ReactionBar';
import CorrectionIsland from '../../../_components/CorrectionIsland';
import { getEventBySlug, getMenu, mediaUrl, type SiteMenu } from '@/lib/strapi';
import { tr, isLocale, DEFAULT_LOCALE, type Locale } from '@/lib/i18n';
import { fmtDateTime, EVENT_FORMAT_LABELS } from '@/lib/format';

export const revalidate = 60;
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const ev = await getEventBySlug(slug, locale);
  if (!ev) return { title: tr('Tədbir', locale) };
  return { title: ev.title, description: ev.excerpt ?? undefined };
}

export default async function EventDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const [ev, menu] = await Promise.all([
    getEventBySlug(slug, locale),
    getMenu(locale).catch(() => null as SiteMenu | null),
  ]);
  if (!ev) notFound();

  const img = mediaUrl(ev.cover);
  const bodyHtml = ev.body ? await marked.parse(ev.body) : '';
  const speakers = ev.speakers ?? [];
  const isOnline = ev.format === 'onlayn' || ev.format === 'hibrid';
  const isPhysical = ev.format === 'fiziki' || ev.format === 'hibrid';
  const venue = [ev.venueBuilding, ev.venueRoom].filter(Boolean).join(', ');

  const labels: Record<string, string> = {
    register: tr('Qeydiyyatdan keç', locale),
    subtitle: tr('Bu tədbirdə yerinizi təsdiqləyin', locale),
    status: tr('Status', locale),
    going: tr('İştirak edirəm', locale),
    maybe: tr('Bəlkə', locale),
    declined: tr('İştirak etmirəm', locale),
    name: tr('Adınız', locale),
    email: tr('Email ünvanınız', locale),
    guests: tr('Qonaq sayı', locale),
    note: tr('Əlavə qeyd', locale),
    submit: tr('Göndər', locale),
    sending: tr('Göndərilir', locale),
    successMsg: tr('Qeydiyyatınız qəbul olundu.', locale),
    addToCal: tr('Təqvimə əlavə et', locale),
    error: tr('Uğursuz əməliyyat', locale),
  };

  const correctionLabels: Record<string, string> = {
    promptHint: tr('Bu səhifədə səhv gördünüz?', locale),
    prompt: tr('Düzəliş təklif et', locale),
    title: tr('Düzəliş təklifi', locale),
    subtitle: tr('Təklifiniz moderasiyadan sonra nəzərdən keçiriləcək.', locale),
    fieldLabel: tr('Hansı hissə?', locale),
    f_title: tr('Başlıq', locale),
    f_body: tr('Mətn', locale),
    f_other: tr('Digər', locale),
    currentLabel: tr('Cari mətn', locale),
    currentHint: tr('Düzəliş lazım olan hissəni bura köçürün', locale),
    suggestedLabel: tr('Təklif etdiyiniz düzəliş', locale),
    suggestedHint: tr('Düzgün variant', locale),
    diffLabel: tr('Fərq önizləməsi', locale),
    reasonLabel: tr('Səbəb (istəyə bağlı)', locale),
    nameLabel: tr('Adınız', locale),
    emailLabel: tr('Email (istəyə bağlı)', locale),
    submit: tr('Düzəlişi göndər', locale),
    sending: tr('Göndərilir', locale),
    successMsg: tr('Təklifiniz göndərildi. Töhfəniz üçün təşəkkür edirik.', locale),
    successSub: tr('Redaktə komandamız qısa zamanda yoxlayacaq.', locale),
    close: tr('Bağla', locale),
    error: tr('Uğursuz əməliyyat', locale),
    emptyErr: tr('Zəhmət olmasa düzəliş mətnini daxil edin.', locale),
  };

  return (
    <>
      <SiteHeaderStack menu={menu} locale={locale} />
      <main className="na-wrap">
        <div className="container">
          <Link href={'/' + locale + '/tedbirler'} className="na-back">
            <i className="ti ti-arrow-left" />
            {' ' + tr('Bütün tədbirlər', locale)}
          </Link>
        </div>

        <article>
          <div className="container na-head">
            <span className="na-badge na-badge--event">{EVENT_FORMAT_LABELS[locale][ev.format] ?? EVENT_FORMAT_LABELS[locale].fiziki}</span>
            <h1 className="na-title">{ev.title}</h1>
            {ev.startAt ? (
              <div className="na-meta">
                <span>
                  <i className="ti ti-calendar-event" />
                  {' ' + fmtDateTime(ev.startAt, locale)}
                </span>
              </div>
            ) : null}
          </div>

          {img ? (
            <div className="container">
              <div className="na-cover">
                <img src={img} alt={ev.title} />
              </div>
            </div>
          ) : null}

          <div className="container">
            <div className="na-event-info">
              {ev.startAt ? (
                <div className="na-ei-row">
                  <i className="ti ti-clock na-ei-ic" />
                  <div>
                    <div className="na-ei-k">{tr('Tarix və vaxt', locale)}</div>
                    <div className="na-ei-v">{fmtDateTime(ev.startAt, locale)}{ev.endAt ? ' — ' + fmtDateTime(ev.endAt, locale) : ''}</div>
                  </div>
                </div>
              ) : null}
              <div className="na-ei-row">
                <i className="ti ti-broadcast na-ei-ic" />
                <div>
                  <div className="na-ei-k">{tr('Format', locale)}</div>
                  <div className="na-ei-v">{EVENT_FORMAT_LABELS[locale][ev.format] ?? EVENT_FORMAT_LABELS[locale].fiziki}</div>
                </div>
              </div>
              {isPhysical && venue ? (
                <div className="na-ei-row">
                  <i className="ti ti-map-pin na-ei-ic" />
                  <div>
                    <div className="na-ei-k">{tr('Məkan', locale)}</div>
                    <div className="na-ei-v">{venue}</div>
                  </div>
                </div>
              ) : null}
              {isOnline && (ev.platform || ev.onlineUrl) ? (
                <div className="na-ei-row">
                  <i className="ti ti-link na-ei-ic" />
                  <div>
                    <div className="na-ei-k">{tr('Onlayn', locale)}</div>
                    <div className="na-ei-v">
                      {ev.platform ? ev.platform : ''}
                      {ev.onlineUrl ? (
                        <>
                          {ev.platform ? ' · ' : ''}
                          <a href={ev.onlineUrl} target="_blank" rel="noopener noreferrer">{tr('Keçid', locale)}</a>
                        </>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
              {ev.capacity ? (
                <div className="na-ei-row">
                  <i className="ti ti-users na-ei-ic" />
                  <div>
                    <div className="na-ei-k">{tr('Tutum', locale)}</div>
                    <div className="na-ei-v">{ev.capacity + ' ' + tr('yer', locale)}</div>
                  </div>
                </div>
              ) : null}
            </div>

            {bodyHtml ? (
              <div className="na-body" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
            ) : ev.excerpt ? (
              <div className="na-body"><p>{ev.excerpt}</p></div>
            ) : null}

            {speakers.length ? (
              <div className="na-speakers">
                <div className="na-files-h">{tr('Spikerlər', locale)}</div>
                <div className="na-sp-grid">
                  {speakers.map((sp, i) => {
                    const photo = mediaUrl(sp.photo);
                    return (
                      <div className="na-speaker" key={i}>
                        <span
                          className="na-sp-photo"
                          style={photo ? { backgroundImage: "url('" + photo + "')" } : undefined}
                        />
                        <div>
                          <div className="na-sp-name">{sp.name}</div>
                          {sp.role ? <div className="na-sp-role">{sp.role}</div> : null}
                          {sp.org ? <div className="na-sp-org">{sp.org}</div> : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <RsvpIsland
              eventSlug={ev.slug}
              eventTitle={ev.title}
              startAt={ev.startAt || new Date().toISOString()}
              endAt={ev.endAt || undefined}
              location={venue || undefined}
              description={ev.excerpt || undefined}
              labels={labels}
            />

            <div className="na-reactions">
              <ReactionBar targetType="event" targetSlug={slug} />
            </div>

            <CorrectionIsland targetType="event" targetSlug={slug} title={ev.title} labels={correctionLabels} />
          </div>
        </article>
      </main>
      <Footer menu={menu} locale={locale} />
    </>
  );
}
