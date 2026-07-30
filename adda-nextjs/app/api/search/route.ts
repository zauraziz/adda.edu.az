import { NextRequest, NextResponse } from 'next/server';

// Meilisearch axtarış proxy-si — search key serverdə qalır (browser-ə açılmır).
const HOST = process.env.MEILISEARCH_HOST;
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

  if (out.statsStatus === 404) {
    out.verdict = `"${INDEX}" indeksi YOXDUR — Strapi admin-de Meilisearch plugin-den indeksle.`;
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
