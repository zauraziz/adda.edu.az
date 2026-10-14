// ── Sitat bloku (server component) — F5.51 ───────────────────────────
// F5.50-dəki «Dəniz həyatı» video slayderi (VideoSea) əvəzinə ƏVVƏLKİ «video
// sitat» dizaynı qaytarıldı: tam enli foto fon + tünd örtük, mərkəzdə sitat,
// müəllif və «ADDA-nı yaşa» düyməsi. Fərq: mətn, fon şəkli, düymə və video
// admində («3. Sayt — Ana səhifə»). Düymə videonu pəncərədə (dialog) açır —
// YouTube yalnız kliklə (youtube-nocookie) və ya yüklənmiş MP4 (VQuoteIsland).
// JS-siz düymə videonun özünə aparır. Video yoxdursa düymə göstərilmir.
import type { Locale } from '@/lib/i18n';
import { tr } from '@/lib/i18n';
import type { QuoteView } from '@/lib/home';
import VQuoteIsland from './VQuoteIsland';

// Dırnaq dil üzrə: az “…”, ru «…», en “…” (əvvəlki T sətirləri ilə eyni).
const QUOTES: Record<Locale, [string, string]> = { az: ['“', '”'], ru: ['«', '»'], en: ['“', '”'] };

export default function VQuote({ quote, locale }: { quote: QuoteView; locale: Locale }) {
  const [qo, qc] = QUOTES[locale];
  const v = quote.video;
  return (
    <section className="vquote" id="video" style={{ backgroundImage: `url('${quote.bg}')` }}>
      <span className="vq-ov" />
      <div className="vq-in">
        <blockquote>{qo + quote.text + qc}</blockquote>
        {quote.attr ? <div className="vq-attr">{quote.attr}</div> : null}
        {v ? (
          <a
            href={v.href}
            className="vq-play"
            target="_blank"
            rel="noopener noreferrer"
            aria-haspopup="dialog"
            data-vq={v.kind}
            data-src={v.kind === 'youtube' ? v.id : v.src}
            data-mime={v.kind === 'file' ? v.mime : undefined}
          >
            <span className="c">
              <i className="ti ti-player-play-filled" aria-hidden="true" />
            </span>
            {' ' + quote.cta}
          </a>
        ) : null}
      </div>
      {v ? <VQuoteIsland title={quote.cta} close={tr('Bağla', locale)} /> : null}
    </section>
  );
}
