// ── Faza 1 / VQuote (server component) ───────────────────────────────
// "Video sitat" (vquote) bölməsi. Əvvəl HomeClient MARKUP-ında idi.
// Mətnlər tr() (exact-match) ilə — 3/3 sətir T-də mövcuddur, tərcümələr
// dəyişmir. Client JS yoxdur.
//
// ⚠ MƏZMUN FLAGI (Faza 12 — redaksiya): attribusiyada təsis ili 1996-dır,
// hero/spotlight-da isə 1881 ("1881-dən gələn ənənə"). Mətn QƏSDƏN
// dəyişdirilməyib — rəsmi formul sifarişçidən gözlənilir.
import { tr, type Locale } from '@/lib/i18n';

const BG = 'https://images.unsplash.com/photo-1724597500306-a4cbb7d1324e?fm=jpg&q=80&w=2000&auto=format&fit=crop';

export default function VQuote({ locale }: { locale: Locale }) {
  return (
    <section className="vquote" style={{ backgroundImage: `url('${BG}')` }}>
      <span className="vq-ov" />
      <div className="vq-in">
        {/* Dırnaq işarələri lüğətdə dil üzrə fərqlidir: az "…" · ru «…» · en “…” */}
        <blockquote>
          {tr(
            '"Dəniz insana üfüqün arxasında daha böyük bir dünyanın olduğunu öyrədir — biz o dünyaya gedən yolu öyrədirik."',
            locale
          )}
        </blockquote>
        <div className="vq-attr">{tr('Azərbaycan Dövlət Dəniz Akademiyası · 1996', locale)}</div>
        {/* Faza 2: href="#" → real video marşrutu */}
        <a href="#" className="vq-play">
          <span className="c">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
              <polygon points="6 3 21 12 6 21 6 3" />
            </svg>
          </span>
          {' ' + tr('ADDA-nı yaşa', locale)}
        </a>
      </div>
    </section>
  );
}
