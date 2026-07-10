import { NextRequest, NextResponse } from 'next/server';

// Meilisearch axtarış proxy-si — search key serverdə qalır (browser-ə açılmır).
const HOST = process.env.MEILISEARCH_HOST;
const KEY = process.env.MEILISEARCH_SEARCH_KEY;

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') || '').trim();
  const locale = req.nextUrl.searchParams.get('locale') || 'az';
  if (!q || !HOST) return NextResponse.json({ hits: [] });
  try {
    const r = await fetch(`${HOST}/indexes/adda/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(KEY ? { Authorization: `Bearer ${KEY}` } : {}),
      },
      body: JSON.stringify({
        q,
        limit: 8,
        filter: [`locale = "${locale}"`],
        attributesToRetrieve: ['title', 'slug', 'excerpt', 'contentType', 'category', 'documentId'],
      }),
    });
    if (!r.ok) return NextResponse.json({ hits: [] });
    const data = (await r.json()) as { hits?: unknown[] };
    return NextResponse.json({ hits: data.hits || [] });
  } catch {
    return NextResponse.json({ hits: [] });
  }
}
