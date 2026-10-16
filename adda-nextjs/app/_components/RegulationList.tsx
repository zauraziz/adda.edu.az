// F5.54 — «Struktur bölmələrin əsasnamələri» reyestri (page.dataBlock = esasnameler).
//
// Mənbə «1. Məzmun — Sənəd»: kateqoriyası «esasname» olan bütün sənədlər
// (lib/strapi.ts getRegulations) — yeni əsasnamə admində əlavə olunan kimi
// burada görünür. Kod (ADDA-ƏS-0NN) başlıqdan və ya fayl adından, sıra koda
// görə. Ad sənədin «Səhifə» sahəsinə (url), yoxdursa yeganə bağlı bölməyə
// aparır; bir neçə bölməyə bağlı sənəddə (kafedralar, fakültələr) bölmələr
// ayrıca keçid kimi. Fayl düyməsində uzantı və ölçü.
import Link from 'next/link';
import { docText, mediaUrl, type RegulationItem } from '@/lib/strapi';
import { tr, type Locale } from '@/lib/i18n';
import { localHref } from '@/lib/md-links';

export const REGULATIONS_ID = 'esasnameler';

const CODE_ANY = /ADDA[-_\s]?(?:ƏS|ES)[-_\s]?0*(\d{1,3})(?!\d)/iu;
/** Başlığın sonundakı «(ADDA-ƏS-001)» — ad ondan təmizlənir, kod ayrıca sütundadır. */
const CODE_TAIL = /\s*\(\s*ADDA[-_\s]?(?:ƏS|ES)[-_\s]?\d{1,3}\s*\)\s*$/iu;

interface Row {
  key: string;
  code: number | null;
  title: string;
  href: string | null;
  units: { slug: string; name: string }[];
  file: { url: string; ext: string; size: string | null } | null;
}

function fileSize(kb: number | null | undefined, locale: Locale): string | null {
  if (!kb || kb <= 0) return null;
  const sep = locale === 'en' ? '.' : ',';
  if (kb < 1024) return `${Math.max(1, Math.round(kb))} KB`;
  return `${(kb / 1024).toFixed(1).replace('.', sep)} MB`;
}

function extLabel(ext: string | null | undefined, url: string, locale: Locale): string {
  const e = (ext || /\.([a-z0-9]{2,5})(?:[?#]|$)/i.exec(url)?.[1] || '').replace(/^\./, '');
  return e ? e.toUpperCase() : tr('Fayl', locale);
}

/** Bölmə hər dildə ayrı sətirdir: slug üzrə bir dəfə, ad cari dildə (yoxdursa az). */
function unitsOf(item: RegulationItem, locale: Locale): { slug: string; name: string }[] {
  const by = new Map<string, { slug: string; name: string; score: number }>();
  for (const u of item.units ?? []) {
    if (!u?.slug) continue;
    const score = u.locale === locale ? 2 : u.locale === 'az' || !u.locale ? 1 : 0;
    const prev = by.get(u.slug);
    if (!prev || score > prev.score) by.set(u.slug, { slug: u.slug, name: u.name || u.slug, score });
  }
  return [...by.values()]
    .map(({ slug, name }) => ({ slug, name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'az'));
}

function toRow(item: RegulationItem, locale: Locale): Row {
  const { title: raw } = docText(item, locale);
  const fileUrl = mediaUrl(item.file);
  const m = CODE_ANY.exec(raw) ?? CODE_ANY.exec(fileUrl ?? '');
  const units = unitsOf(item, locale);
  const own = (item.url ?? '').trim();
  const href = own ? localHref(own, locale) : units.length === 1 ? `/${locale}/struktur/${units[0].slug}` : null;
  return {
    key: item.documentId,
    code: m ? Number(m[1]) : null,
    title: raw.replace(CODE_TAIL, '').trim() || raw,
    href,
    // Yeganə bölmə adın özündədirsə ayrıca göstərilmir.
    units: !own && units.length === 1 ? [] : units,
    file: fileUrl ? { url: fileUrl, ext: extLabel(item.file?.ext, fileUrl, locale), size: fileSize(item.file?.size, locale) } : null,
  };
}

const codeLabel = (n: number) => `ADDA-ƏS-${String(n).padStart(3, '0')}`;

export default function RegulationList({ items, locale }: { items: RegulationItem[]; locale: Locale }) {
  const rows = items
    .map((it) => ({ row: toRow(it, locale), withUnits: (it.units ?? []).length > 0 }))
    .sort(
      (a, b) =>
        (a.row.code ?? 9999) - (b.row.code ?? 9999) || a.row.title.localeCompare(b.row.title, 'az'),
    );
  if (!rows.length) return null;
  const groups = [
    { key: 'bolme', title: 'Struktur bölmələr', rows: rows.filter((r) => r.withUnits).map((r) => r.row) },
    { key: 'sura', title: 'Şuralar, birliklər və proseslər', rows: rows.filter((r) => !r.withUnits).map((r) => r.row) },
  ].filter((g) => g.rows.length);
  const heads = groups.length > 1;
  const openLabel = tr('Faylı aç', locale);

  return (
    <div className="rg-list">
      {groups.map((g) => (
        <div key={g.key} className="rg-group">
          {heads ? (
            <h3 className="rg-h">
              {tr(g.title, locale)} <span className="rg-count">{g.rows.length}</span>
            </h3>
          ) : null}
          <ol className="rg-rows">
            {g.rows.map((r) => (
              <li key={r.key} className="rg-row">
                <span className="rg-code">{r.code ? codeLabel(r.code) : ''}</span>
                <div className="rg-main">
                  {r.href ? (
                    <Link href={r.href} className="rg-title">
                      {r.title}
                    </Link>
                  ) : (
                    <span className="rg-title">{r.title}</span>
                  )}
                  {r.units.length ? (
                    <div className="rg-units">
                      {r.units.map((u) => (
                        <Link key={u.slug} href={`/${locale}/struktur/${u.slug}`} className="rg-unit">
                          {u.name}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
                {r.file ? (
                  <a
                    href={r.file.url}
                    className="rg-file"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${openLabel}: ${r.title} (${r.file.ext}${r.file.size ? ', ' + r.file.size : ''})`}
                  >
                    <i className="ti ti-download" aria-hidden="true" />
                    <span>{r.file.ext}</span>
                    {r.file.size ? <small>{r.file.size}</small> : null}
                  </a>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}
