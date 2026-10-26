// F5.58 — menyuda açıq səhifənin yeri.
//
// Əvvəl üst menyuda HƏR səhifədə birinci bölmə («Akademiya») vurğulanırdı
// (SiteHeaderStack: `active = i === 0`), açıq səhifənin bölməsi göstərilmirdi
// (Zaur müəllim, 26.10.2026: «Qaydalar və təlimatlar» menyuda iki yerdə olsa da
// səhifədə heç biri seçilmirdi). İndi cari ünvana ən yaxın menyu keçidi tapılır:
// masaüstündə bölmə vurğulanır, mega paneldə həmin qrup açıq və keçid seçilmiş,
// mobil menyuda bölmə və keçid işarəli. Saf funksiya — server keşinə toxunmur.

const LOCALE = /^\/(?:az|ru|en)(?=\/|$)/;

function split(href: string): { path: string; query: URLSearchParams } | null {
  const h = String(href || '').trim();
  if (!h || h.startsWith('#') || /^[a-z]+:/i.test(h)) return null;
  const noHash = h.split('#')[0];
  const [rawPath, rawQuery = ''] = noHash.split('?');
  if (!rawPath.startsWith('/')) return null;
  const path = rawPath.replace(LOCALE, '').replace(/\/+$/, '') || '/';
  return { path, query: new URLSearchParams(rawQuery) };
}

/** Struktur bölməsinin siyahı səhifəsi: kafedra → /kafedralar, fakültə → /fakulteler. */
function aliases(path: string): string[] {
  const m = /^\/struktur\/([^/]+)$/.exec(path);
  if (m) {
    if (m[1].endsWith('-kafedrasi')) return ['/kafedralar'];
    if (m[1].endsWith('-fakultesi')) return ['/fakulteler'];
  }
  return [];
}

export interface NavMatch {
  index: number;
  /** Keçidin özü açıq səhifədir (əks halda yalnız bölmə/qrup). */
  exact: boolean;
}

/**
 * `hrefs` arasında cari səhifəyə (`pathname` + `search`) ən uyğun keçid.
 * Bal: eyni yol (+ eyni sorğu parametrləri) > bölmə siyahısı (kafedra →
 * «Kafedralar») > yolun başlanğıcı (ən uzunu) > əməkdaş → «Heyət». Bərabərlikdə
 * menyuda birinci gələn.
 */
export function navMatch(pathname: string, search: string, hrefs: string[]): NavMatch | null {
  const cur = split(pathname + (search || ''));
  if (!cur) return null;
  const alias = aliases(cur.path);
  let best: { index: number; score: number } | null = null;
  hrefs.forEach((href, index) => {
    const h = split(href);
    if (!h || h.path === '/') return;
    let score = 0;
    if (h.path === cur.path) {
      const keys = [...h.query.keys()];
      if (!keys.length) score = 1000;
      else score = keys.every((k) => cur.query.get(k) === h.query.get(k)) ? 1100 : 400;
    } else if (alias.includes(h.path)) score = 150;
    else if (cur.path.startsWith(h.path + '/')) score = 100 + h.path.length;
    else if (cur.path.startsWith('/emekdas/') && h.path.startsWith('/heyet')) score = 90;
    if (score && (!best || score > best.score)) best = { index, score };
  });
  if (!best) return null;
  const b = best as { index: number; score: number };
  return { index: b.index, exact: b.score >= 1000 };
}
