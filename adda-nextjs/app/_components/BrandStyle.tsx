// F5.53 — «Korporativ üslub» səhifəsinin rənglər və şriftlər bloku (page.dataBlock = korporativ).
//
// Dəyərlər saytın kilidli dizayn sistemidir (CLAUDE.md «Kilidli dizayn sistemi»,
// app/_styles/01-base.css tokenləri): navy #0B3D5C, qızılı #C9A961, Fraunces
// (başlıq) + Manrope (mətn). Rəng və şrift DƏYİŞƏNDƏ burada da dəyişməlidir.
// Server komponentidir: HEX seçilə bilən mətndir, kopyalama düyməsi yoxdur.
import { tr, type Locale } from '@/lib/i18n';

export const BRAND_ID = 'rengler-ve-sriftler';

interface Swatch {
  name: string;
  hex: string;
  use: string;
}

const PRIMARY: Swatch[] = [
  { name: 'Dəniz göyü', hex: '#0B3D5C', use: 'Əsas rəng: başlıqlar, menyu, tünd bloklar' },
  { name: 'Qızılı', hex: '#C9A961', use: 'Vurğu: düymələr, xətlər, nişanlar' },
];
const SUPPORT: Swatch[] = [
  { name: 'Tünd dəniz göyü', hex: '#071E2E', use: 'Footer və tünd fonlar' },
  { name: 'Açıq fon', hex: '#F0F8FF', use: 'Açıq bloklar və kartların fonu' },
  { name: 'Ağ', hex: '#FFFFFF', use: 'Fon; tünd fonda mətn' },
];

const FONTS = [
  {
    family: 'Fraunces',
    role: 'Başlıqlar',
    cls: 'corp-font--display',
    url: 'https://fonts.google.com/specimen/Fraunces',
  },
  {
    family: 'Manrope',
    role: 'Əsas mətn',
    cls: 'corp-font--body',
    url: 'https://fonts.google.com/specimen/Manrope',
  },
];

function rgb(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

function Swatches({ items, locale }: { items: Swatch[]; locale: Locale }) {
  return (
    <ul className="corp-swatches">
      {items.map((s) => (
        <li key={s.hex} className="corp-swatch">
          {/* Rəng nümunəsində mətn yoxdur — yüksək kontrast rejimində də olduğu kimi qalır. */}
          <div className="corp-chip" style={{ background: s.hex }} aria-hidden="true" />
          <b className="corp-swatch-name">{tr(s.name, locale)}</b>
          <dl className="corp-codes">
            <div>
              <dt>HEX</dt>
              <dd>{s.hex}</dd>
            </div>
            <div>
              <dt>RGB</dt>
              <dd>{rgb(s.hex)}</dd>
            </div>
          </dl>
          <p className="corp-use">{tr(s.use, locale)}</p>
        </li>
      ))}
    </ul>
  );
}

export default function BrandStyle({ locale }: { locale: Locale }) {
  return (
    <div className="corp-style">
      <h3 className="corp-h">{tr('Əsas rənglər', locale)}</h3>
      <Swatches items={PRIMARY} locale={locale} />
      <h3 className="corp-h">{tr('Köməkçi rənglər', locale)}</h3>
      <Swatches items={SUPPORT} locale={locale} />

      <h3 className="corp-h">{tr('Şriftlər', locale)}</h3>
      <ul className="corp-fonts">
        {FONTS.map((f) => (
          <li key={f.family} className="corp-font">
            <div className="corp-font-head">
              <span className="corp-font-role">{tr(f.role, locale)}</span>
              <b className="corp-font-name">{f.family}</b>
            </div>
            <p className={'corp-specimen ' + f.cls} lang="az">
              Aa Əə Ğğ Iı İi Öö Şş Çç Üü
            </p>
            <p className={'corp-sample ' + f.cls}>{tr('Azərbaycan Dövlət Dəniz Akademiyası', locale)}</p>
            <p className="corp-font-note">
              {tr('Pulsuz şrift, SIL Open Font License 1.1', locale)}
              {' · '}
              <a href={f.url} target="_blank" rel="noopener noreferrer">
                {tr('Google Fonts-da bax', locale)}
                <i className="ti ti-external-link" aria-hidden="true" />
              </a>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
