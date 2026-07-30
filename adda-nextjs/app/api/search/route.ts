import { NextRequest, NextResponse } from 'next/server';

// Meilisearch axtarış proxy-si — search key serverdə qalır (browser-ə açılmır).
//
// ⚠️ K24: SONDAKI `/` MÜTLƏQ KƏSİLİR.
// `https://ms-x.meilisearch.io/` + `/health` = `...io//health` — ikiqat slash.
// Meilisearch Cloud-un şlüzü (Kong) belə yolu tanımır və `no Route matched`
// qaytarır. Səhv "indeks yoxdur" kimi görünür, halbuki səbəb URL-dədir.
// Bu, `https://` prefiksinin yoxluğu ilə eyni sinifdən tələdir.
const HOST = (process.env.MEILISEARCH_HOST || '').replace(/\/+$/, '') || undefined;
const KEY = process.env.MEILISEARCH_SEARCH_KEY;

const INDEX = 'adda';

function authHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    ...(KEY ? { Authorization: `Bearer ${KEY}` } : {}),
  };
}

/**
 * K21 — DİAQNOSTİKA REJİMİ: `/api/search?debug=1`
 *
 * NİYƏ LAZIM OLDU: bu marşrutun ÜÇ fərqli uğursuzluğu eyni cavabı verirdi —
 * `{hits: []}`. Host qurulmayıb? İndeks yoxdur? Filtr sınıb? Kənardan ayırd
 * etmək mümkün deyildi, ona görə "nəticə tapılmadı" səbəbsiz qalırdı.
 *
 * Sirr SIZDIRMIR: yalnız boolean-lar, status kodları və saylar qaytarılır —
 * nə host ünvanı, nə açar.
 */
async function diagnose(q: string, locale: string) {
  const out: Record<string, unknown> = {
    hostConfigured: Boolean(HOST),
    // Bilinən tələ: `https://` prefiksi olmadan plugin səssizcə sınır.
    hostHasScheme: Boolean(HOST && /^https?:\/\//i.test(HOST)),
    keyConfigured: Boolean(KEY),
  };
  if (!HOST) {
    out.verdict = 'MEILISEARCH_HOST teyin olunmayib (Vercel env).';
    return out;
  }

  // Host adı — yanlış ünvanı görmək üçün lazımdır. Açar SIZDIRILMIR.
  try {
    const u = new URL(HOST);
    out.hostname = u.hostname;
    if (u.pathname !== '/') out.hostPath = u.pathname;
    // Sorğunun HƏQİQİ ünvanı — ikiqat slash və ya artıq yol dərhal görünsün.
    out.probeUrl = `${HOST}/health`;
    out.rawHadTrailingSlash = /\/$/.test(process.env.MEILISEARCH_HOST || '');
  } catch {
    out.verdict = 'MEILISEARCH_HOST duzgun URL deyil.';
    return out;
  }

  // ── 0) BU, HƏQİQƏTƏN MEILISEARCH-DİRMİ? ────────────────────────────────
  //
  // K23: əvvəlki versiya 404-ü avtomatik "indeks yoxdur" kimi oxuyurdu.
  // Amma 404 şlüzdən (gateway) də gələ bilər — Kong "no Route matched with
  // those values" + `request_id` qaytarır, Meilisearch isə
  // `{"code":"index_not_found"}`. İkisini qarışdırmaq yanlış diaqnoz verir.
  let looksLikeMeili = false;
  try {
    const r = await fetch(`${HOST}/health`, { headers: authHeaders(), cache: 'no-store' });
    out.healthStatus = r.status;
    const t = (await r.text()).slice(0, 200);
    out.healthBody = t;
    looksLikeMeili = r.ok && t.includes('status');
  } catch (e) {
    out.healthError = String((e as Error).message).slice(0, 160);
  }

  if (!looksLikeMeili) {
    try {
      const r = await fetch(`${HOST}/version`, { headers: authHeaders(), cache: 'no-store' });
      out.versionStatus = r.status;
      const t = (await r.text()).slice(0, 200);
      out.versionBody = t;
      if (r.ok && t.includes('pkgVersion')) looksLikeMeili = true;
    } catch (e) {
      out.versionError = String((e as Error).message).slice(0, 160);
    }
  }
  out.looksLikeMeilisearch = looksLikeMeili;

  if (!looksLikeMeili) {
    const gateway =
      String(out.healthBody ?? '').includes('request_id') ||
      String(out.versionBody ?? '').includes('request_id') ||
      String(out.healthBody ?? '').includes('no Route matched');
    if (gateway) {
      out.verdict = /meilisearch\.io$/i.test(String(out.hostname))
        ? 'Unvan Meilisearch Cloud-dur, amma slyuz marsrut tapmir. Ehtimallar: (a) proyekt silinib/vaxti bitib, (b) unvanda artiq yol var. Meilisearch Cloud panelinde proyektin aktiv oldugunu yoxla.'
        : 'MEILISEARCH_HOST Meilisearch-e YOX, bir slyuze (gateway) baxir. Unvani yoxla.';
    } else {
      out.verdict = 'MEILISEARCH_HOST Meilisearch kimi cavab vermir (/health ve /version tanninmadi). Unvani yoxla.';
    }
    return out;
  }

  // İndeks siyahısı — `adda` var, yoxsa başqa adla yaranıb?
  try {
    const r = await fetch(`${HOST}/indexes?limit=50`, { headers: authHeaders(), cache: 'no-store' });
    out.indexesStatus = r.status;
    if (r.ok) {
      const d = (await r.json()) as { results?: Array<{ uid?: string }> };
      out.indexes = (d.results ?? []).map((x) => x.uid).filter(Boolean);
    }
  } catch (e) {
    out.indexesError = String((e as Error).message).slice(0, 160);
  }

  // 1) İndeks var və neçə sənəd saxlayır?
  try {
    const r = await fetch(`${HOST}/indexes/${INDEX}/stats`, { headers: authHeaders(), cache: 'no-store' });
    out.statsStatus = r.status;
    if (r.ok) {
      const s = (await r.json()) as { numberOfDocuments?: number };
      out.documents = s.numberOfDocuments ?? null;
    } else {
      out.statsBody = (await r.text()).slice(0, 200);
    }
  } catch (e) {
    out.statsError = String((e as Error).message).slice(0, 160);
  }

  // 2) Parametrlər — `body` axtarıla bilirmi, `locale` filtrlənə bilirmi?
  try {
    const r = await fetch(`${HOST}/indexes/${INDEX}/settings`, { headers: authHeaders(), cache: 'no-store' });
    out.settingsStatus = r.status;
    if (r.ok) {
      const s = (await r.json()) as { searchableAttributes?: string[]; filterableAttributes?: string[] };
      out.searchableAttributes = s.searchableAttributes ?? null;
      out.filterableAttributes = s.filterableAttributes ?? null;
      out.bodySearchable = (s.searchableAttributes ?? []).includes('body');
      out.localeFilterable = (s.filterableAttributes ?? []).includes('locale');
    }
  } catch (e) {
    out.settingsError = String((e as Error).message).slice(0, 160);
  }

  // 3) Filtrli və filtrsiz axtarış — filtrin özü günahkardırsa fərq görünsün.
  const probes: Array<[string, Record<string, unknown>]> = [
    ['withFilter', { q, limit: 3, filter: [`locale = "${locale}"`] }],
    ['noFilter', { q, limit: 3 }],
  ];
  for (const [name, payload] of probes) {
    try {
      const r = await fetch(`${HOST}/indexes/${INDEX}/search`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
        cache: 'no-store',
      });
      const body = await r.text();
      if (r.ok) {
        const d = JSON.parse(body) as { estimatedTotalHits?: number; hits?: unknown[] };
        out[name] = { status: r.status, hits: d.hits?.length ?? 0, estimated: d.estimatedTotalHits ?? null };
      } else {
        out[name] = { status: r.status, error: body.slice(0, 200) };
      }
    } catch (e) {
      out[name] = { error: String((e as Error).message).slice(0, 160) };
    }
  }

  // Nəticə — ən çox rast gəlinən səbəblər sırası ilə.
  const docs = out.documents as number | null | undefined;
  const withF = out.withFilter as { hits?: number } | undefined;
  const noF = out.noFilter as { hits?: number } | undefined;

  const known = (out.indexes as string[] | undefined) ?? [];
  if (out.statsStatus === 404) {
    out.verdict = known.length
      ? `"${INDEX}" indeksi YOXDUR. Movcud indeksler: ${known.join(', ')} — plugins.ts-de indexName bunlarla uygun olmalidir.`
      : `"${INDEX}" indeksi YOXDUR ve hec bir indeks yaranmayib — Strapi admin-de Meilisearch plugin-den indeksle.`;
  } else if (out.statsStatus === 401 || out.statsStatus === 403) {
    out.verdict = 'Acar qebul olunmadi — MEILISEARCH_SEARCH_KEY yanlisdir.';
  } else if (docs === 0) {
    out.verdict = 'Indeks var, amma BOSDUR — Strapi admin-de her tipi indeksle.';
  } else if (out.localeFilterable === false) {
    out.verdict = '`locale` filtrlenmir — indeks kohne parametrlerle qurulub, yeniden indeksle.';
  } else if (out.bodySearchable === false) {
    out.verdict = '`body` axtarilmir — kohne parametrler. Yeniden indeksle (yoxsa yalniz basliq tapilir).';
  } else if (withF?.hits === 0 && (noF?.hits ?? 0) > 0) {
    out.verdict = `Filtr bosaldir: senedlerde locale="${locale}" yoxdur.`;
  } else {
    out.verdict = 'Gorunen problem yoxdur — basqa sorgu sozu ile yoxla.';
  }

  return out;
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') || '').trim();
  const locale = req.nextUrl.searchParams.get('locale') || 'az';

  if (req.nextUrl.searchParams.get('debug') === '1') {
    const res = NextResponse.json(await diagnose(q || 'adda', locale));
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }

  if (!q || !HOST) return NextResponse.json({ hits: [] });
  try {
    const r = await fetch(`${HOST}/indexes/${INDEX}/search`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        q,
        limit: 8,
        filter: [`locale = "${locale}"`],
        // `slug` netice linkini qurmaq ucun MECBURIDIR (K20).
        attributesToRetrieve: ['title', 'slug', 'excerpt', 'contentType', 'category', 'documentId'],
      }),
      cache: 'no-store',
    });
    if (!r.ok) {
      // Səssiz sınmanın qarşısını al: səbəb heç olmasa server logunda qalsın.
      console.error('[search] Meilisearch ' + r.status + ': ' + (await r.text()).slice(0, 200));
      return NextResponse.json({ hits: [] });
    }
    const data = (await r.json()) as { hits?: unknown[] };
    return NextResponse.json({ hits: data.hits || [] });
  } catch (err) {
    console.error('[search] elcatmaz: ' + (err as Error).message);
    return NextResponse.json({ hits: [] });
  }
}
