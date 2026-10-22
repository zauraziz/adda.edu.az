// F5.54 — «Struktur bölmələrin əsasnamələri» reyestri (page.dataBlock = esasnameler).
// F5.57 — eyni siyahı «Qaydalar və təlimatlar» üçün (page.dataBlock = qaydalar, kind="qayda").
//
// Mənbə «1. Məzmun — Sənəd»: kateqoriyası «esasname» (və ya «qayda», «telimat»)
// olan bütün sənədlər (lib/strapi.ts getRegulations) — yeni sənəd admində əlavə
// olunan kimi burada görünür. Kod (ADDA-ƏS-0NN, ADDA-TL-0NN, ADDA-ƏP-00N)
// başlıqdan və ya fayl adından, sıra koda görə. Ad sənədin «Səhifə» sahəsinə
// (url), yoxdursa yeganə bağlı bölməyə aparır; bir neçə bölməyə bağlı sənəddə
// (kafedralar, fakültələr) bölmələr ayrıca keçid kimi. Qısa təsvir adın altında.
// Fayl düyməsində uzantı və ölçü.
import Link from 'next/link';
import { docText, mediaUrl, type RegulationItem } from '@/lib/strapi';
import { tr, type Locale } from '@/lib/i18n';
import { localHref } from '@/lib/md-links';

export const REGULATIONS_ID = 'esasnameler';
export const RULES_ID = 'qaydalar';

export type RegulationKind = 'esasname' | 'qayda';
type Prefix = 'ƏS' | 'TL' | 'ƏP';

const CODE: Record<RegulationKind, RegExp> = {
  esasname: /ADDA[-_\s]?(ƏS|ES)[-_\s]?0*(\d{1,3})(?!\d)/iu,
  qayda: /ADDA[-_\s]*(TL|ƏP|EP)[-_\s]*0*(\d{1,3})(?!\d)/iu,
};
/** Başlığın sonundakı «(ADDA-ƏS-001)» — ad ondan təmizlənir, kod ayrıca sütundadır. */
const CODE_TAIL: Record<RegulationKind, RegExp> = {
  esasname: /\s*\(\s*ADDA[-_\s]?(?:ƏS|ES)[-_\s]?\d{1,3}\s*\)\s*$/iu,
  qayda: /\s*\(\s*ADDA[-_\s]*(?:TL|ƏP|EP)[-_\s]*\d{1,3}\s*\)\s*$/iu,
};
const PREFIX_ORDER: Record<Prefix, number> = { ƏS: 0, TL: 0, ƏP: 1 };

interface Row {
  key: string;
  prefix: Prefix;
  code: number | null;
  title: string;
  description: string | null;
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

function prefixOf(raw: string | undefined, kind: RegulationKind): Prefix {
  const p = (raw ?? '').toUpperCase();
  if (kind === 'esasname') return 'ƏS';
  return p === 'TL' ? 'TL' : 'ƏP';
}

function toRow(item: RegulationItem, locale: Locale, kind: RegulationKind): Row {
  const { title: raw, description } = docText(item, locale);
  const fileUrl = mediaUrl(item.file);
  const m = CODE[kind].exec(raw) ?? CODE[kind].exec(fileUrl ?? '');
  const units = unitsOf(item, locale);
  const own = (item.url ?? '').trim();
  const href = own ? localHref(own, locale) : units.length === 1 ? `/${locale}/struktur/${units[0].slug}` : null;
  return {
    key: item.documentId,
    prefix: prefixOf(m?.[1], kind),
    code: m ? Number(m[2]) : null,
    title: raw.replace(CODE_TAIL[kind], '').trim() || raw,
    description: (description ?? '').trim() || null,
    href,
    // Yeganə bölmə adın özündədirsə ayrıca göstərilmir.
    units: !own && units.length === 1 ? [] : units,
    file: fileUrl ? { url: fileUrl, ext: extLabel(item.file?.ext, fileUrl, locale), size: fileSize(item.file?.size, locale) } : null,
  };
}

const codeLabel = (r: Row) => (r.code ? `ADDA-${r.prefix}-${String(r.code).padStart(3, '0')}` : '');

const byCode = (a: Row, b: Row) =>
  PREFIX_ORDER[a.prefix] - PREFIX_ORDER[b.prefix] ||
  (a.code ?? 9999) - (b.code ?? 9999) ||
  a.title.localeCompare(b.title, 'az');

export default function RegulationList({
  items,
  locale,
  kind = 'esasname',
}: {
  items: RegulationItem[];
  locale: Locale;
  kind?: RegulationKind;
}) {
  const rows = items
    .map((it) => ({ row: toRow(it, locale, kind), withUnits: (it.units ?? []).length > 0, category: it.category }))
    .sort((a, b) => byCode(a.row, b.row));
  if (!rows.length) return null;
  const groups = (
    kind === 'qayda'
      ? [
          { key: 'qayda', title: 'Qaydalar', rows: rows.filter((r) => r.category !== 'telimat').map((r) => r.row) },
          { key: 'telimat', title: 'Təlimatlar və prosedurlar', rows: rows.filter((r) => r.category === 'telimat').map((r) => r.row) },
        ]
      : [
          { key: 'bolme', title: 'Struktur bölmələr', rows: rows.filter((r) => r.withUnits).map((r) => r.row) },
          { key: 'sura', title: 'Şuralar, birliklər və proseslər', rows: rows.filter((r) => !r.withUnits).map((r) => r.row) },
        ]
  ).filter((g) => g.rows.length);
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
                <span className="rg-code">{codeLabel(r)}</span>
                <div className="rg-main">
                  {r.href ? (
                    <Link href={r.href} className="rg-title">
                      {r.title}
                    </Link>
                  ) : (
                    <span className="rg-title">{r.title}</span>
                  )}
                  {r.description ? <p className="rg-desc">{r.description}</p> : null}
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
