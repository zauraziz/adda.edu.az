// F2.7-1 — RAG indeksləmə sürücüsü.
//
// Embedding SERVER TƏRƏFDƏ olur (Strapi-də), bu skript yalnız kursoru sürür.
// Səbəb: F2.7-4-də sorğu vektoru da lazımdır, yəni GEMINI_API_KEY onsuz da
// Render-də olmalıdır — açarı iki yerdə saxlamağın mənası yoxdur.
//
// İDEMPOTENT: hər parçanın SHA-256-sı saxlanılır. İkinci run dəyişməyən
// parçaları ATLAYIR — yalnız redaktə olunmuş sənədlər yenidən embed olunur.
//
// TƏLƏB: ADMIN_IMPORT_SECRET (Render-dəki ilə eyni, min 16 simvol)
//
// İSTİFADƏ:
//   $env:ADMIN_IMPORT_SECRET = '<sirr>'
//   node rag-index.mjs --status              # rejim + provayder + əhatə
//   node rag-index.mjs --plan                # nə embed olunacaq (yazma yox)
//   node rag-index.mjs --run                 # indeksle
//   node rag-index.mjs --run --source=page --locale=az
//   node rag-index.mjs --run --force         # hamısını yenidən embed et
//   node rag-index.mjs --purge --source=page
//   node rag-index.mjs --purge-hard          # cedveli at (olcu deyisende)
//   node rag-index.mjs --search="deniz naqliyyati" --locale=az

import { STRAPI_URL, api } from './lib/strapi.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [m[1], m[2] ?? true] : [a, true];
  }),
);

const SECRET = (process.env.ADMIN_IMPORT_SECRET || '').trim();
if (SECRET.length < 16) {
  console.error('\n  XETA: ADMIN_IMPORT_SECRET teyin edilmeyib (min 16 simvol).');
  console.error("  PowerShell:  $env:ADMIN_IMPORT_SECRET = '<sirr>'\n");
  process.exit(1);
}

const HEADERS = { 'x-adda-admin-secret': SECRET };
const LOCALES = ['az', 'ru', 'en'];

async function call(path, body) {
  // Indeksleme paketi embedding-i gozleyir -- 60 s bezen azdir.
  const res = await api('POST', path, body, { headers: HEADERS, timeoutMs: 180000, retries: 2 });
  if (res.status === 403) {
    console.error('\n  XETA: sirr qebul olunmadi (403).');
    if (res.data) console.error(`  gonderilen iz: ${res.data.sentFingerprint} (${res.data.sentLength} simvol)`);
    console.error('  Render-deki ADMIN_IMPORT_SECRET ile eyni olmalidir.\n');
    process.exit(1);
  }
  if (res.status === 503 && res.data?.error === 'admin_import_disabled') {
    console.error('\n  XETA: Render-de ADMIN_IMPORT_SECRET teyin edilmeyib.\n');
    process.exit(1);
  }
  if (res.status === 404) {
    console.error(`\n  XETA: ${path} tapilmadi -- Strapi deploy olunubmu?\n`);
    process.exit(1);
  }
  return res;
}

function pad(s, n) {
  return String(s).padEnd(n);
}

/* ── --status ─────────────────────────────────────────────────────────── */

async function showStatus() {
  const res = await call('/api/rag/admin/status', {});
  if (!res.ok) {
    console.error(`\n  XETA: status HTTP ${res.status} — ${JSON.stringify(res.data)?.slice(0, 300)}\n`);
    process.exit(1);
  }
  const d = res.data;

  console.log(`\n  hedef : ${STRAPI_URL}`);
  console.log(`  anbar : ${d.store.mode}  (client: ${d.store.client}, olcu: ${d.store.dims}, model: ${d.store.model})`);
  if (d.store.mode === 'json') {
    console.log('          QEYD: pgvector yoxdur -- oxsarliq yaddasda hesablanacaq.');
  }
  if (d.store.mismatch) console.log(`          UYGUNSUZLUQ: ${d.store.mismatch}`);
  console.log(`  embed : ${d.embed.provider}/${d.embed.model}  acar: ${d.embed.hasKey ? 'var' : 'YOX'}`);
  if (d.embed.blocker) console.log(`          MANE: ${d.embed.blocker}`);
  console.log(`  temizleme (e-poct/telefon): ${d.scrubContacts ? 'aciq' : 'SONULU'}\n`);

  const indexed = new Map(d.indexed.map((r) => [`${r.source}:${r.locale}`, r]));
  console.log(`  ${pad('menbe', 14)}${pad('dil', 5)}${pad('sened', 8)}${pad('indeks', 8)}${pad('parca', 8)}`);
  console.log('  ' + '-'.repeat(43));
  let totalDocs = 0;
  let totalChunks = 0;
  for (const t of d.totals) {
    const got = indexed.get(`${t.source}:${t.locale}`);
    totalDocs += t.docs;
    totalChunks += got?.chunks || 0;
    const flag = !got ? '  <- bos' : got.docs < t.docs ? `  <- ${t.docs - got.docs} catismir` : '';
    console.log(
      `  ${pad(t.source, 14)}${pad(t.locale, 5)}${pad(t.docs, 8)}${pad(got?.docs || 0, 8)}${pad(got?.chunks || 0, 8)}${flag}`,
    );
  }
  console.log('  ' + '-'.repeat(43));
  console.log(`  ${pad('CEM', 19)}${pad(totalDocs, 8)}${pad('', 8)}${totalChunks} parca\n`);
  return d;
}

/* ── --run / --plan ───────────────────────────────────────────────────── */

async function runIndex({ dryRun }) {
  const status = await showStatus();
  if (!dryRun && status.embed.blocker) {
    console.error(`  DAYANDI: ${status.embed.blocker}\n`);
    process.exit(1);
  }
  if (status.store.mismatch) {
    console.error('  DAYANDI: anbar uygunsuzlugu. Once:  node rag-index.mjs --purge-hard\n');
    process.exit(1);
  }

  const only = args.source ? String(args.source) : null;
  const onlyLocale = args.locale ? String(args.locale) : null;
  const force = Boolean(args.force);

  const pairs = status.totals.filter(
    (t) => (!only || t.source === only) && (!onlyLocale || t.locale === onlyLocale),
  );
  if (!pairs.length) {
    console.error('  Uygun menbe/dil cutu tapilmadi.\n');
    process.exit(1);
  }

  const grand = { docs: 0, chunks: 0, embedded: 0, skipped: 0, trimmed: 0, calls: 0, batches: 0 };
  const t0 = Date.now();

  for (const pair of pairs) {
    let cursor = 0;
    let guard = 0;
    process.stdout.write(`  ${pad(pair.source + '/' + pair.locale, 20)}`);
    for (;;) {
      if (++guard > 500) {
        console.log('  DAYANDI: paket haddi asildi (500) -- sonsuz donge subhesi');
        break;
      }
      const res = await call('/api/rag/admin/index', {
        source: pair.source,
        locale: pair.locale,
        cursor,
        dryRun,
        force,
      });
      if (!res.ok) {
        console.log(`\n    XETA @${cursor}: HTTP ${res.status} ${res.data?.error || ''} ${res.data?.detail || ''}`);
        break;
      }
      const s = res.data.stats;
      grand.docs += s.docs;
      grand.chunks += s.chunks;
      grand.embedded += s.embedded;
      grand.skipped += s.skipped;
      grand.trimmed += s.trimmed;
      grand.calls += s.calls;
      grand.batches++;
      process.stdout.write('.');
      if (res.data.done) break;
      cursor = res.data.next;
    }
    console.log('');
  }

  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n  ${dryRun ? 'PLAN' : 'NETICE'} (${secs} s, ${grand.batches} paket)`);
  console.log(`    sened      : ${grand.docs}`);
  console.log(`    parca      : ${grand.chunks}`);
  console.log(`    ${dryRun ? 'embed olunacaq' : 'embed olundu'} : ${dryRun ? grand.chunks - grand.skipped : grand.embedded}`);
  console.log(`    atlandi    : ${grand.skipped}  (deyismeyib)`);
  console.log(`    silindi    : ${grand.trimmed}  (qisalmis senedlerin quyrugu)`);
  if (!dryRun) console.log(`    API sorgu  : ${grand.calls}`);
  console.log('');
}

/* ── --search (F2.7-2) ────────────────────────────────────────────────── */

async function runSearch(q) {
  const locale = args.locale ? String(args.locale) : 'az';
  const limit = args.limit ? parseInt(String(args.limit), 10) : 8;
  const sources = args.source ? `&sources=${encodeURIComponent(String(args.source))}` : '';
  const path =
    `/api/rag-search?q=${encodeURIComponent(q)}&locale=${locale}&limit=${limit}&debug=1${sources}`;

  // GET-dir, amma sirr basligi eyni sekilde otururulur (RAG_SEARCH_PUBLIC
  // acilmayibsa yegane yoldur).
  const res = await api('GET', path, undefined, { headers: HEADERS, timeoutMs: 120000 });
  if (!res.ok) {
    console.error(`\n  XETA: HTTP ${res.status} — ${JSON.stringify(res.data)?.slice(0, 300)}\n`);
    process.exit(1);
  }
  const d = res.data;

  console.log(`\n  sorgu : ${d.query}   (${locale})`);
  console.log(`  qollar: ${d.arms.join(' + ') || 'YOX'}   rejim: ${d.mode}   ${d.tookMs} ms${d.cachedQuery ? '   [sorgu vektoru kesden]' : ''}`);
  if (d.counts) console.log(`  namized: leksik ${d.counts.lexical}, vektor ${d.counts.vector} sened (${d.counts.chunks} parca)`);
  for (const n of d.notes || []) console.log(`  QEYD  : ${n}`);
  console.log('');

  if (!d.hits.length) {
    console.log('  netice yoxdur.\n');
    return;
  }
  let i = 0;
  for (const h of d.hits) {
    i++;
    const r = h.scores || {};
    const rank = `L${r.lexicalRank ?? '-'}/V${r.vectorRank ?? '-'}`;
    console.log(`  ${String(i).padStart(2)}. [${h.source}] ${h.title}`);
    console.log(`      ${h.url}   ${pad(rank, 12)}rrf ${r.rrf ?? '-'}`);
    const snip = (h.snippet || '').replace(/\s+/g, ' ').slice(0, 150);
    if (snip) console.log(`      ${snip}`);
    for (const e of h.evidence || []) {
      console.log(`      · parca ${e.chunkIx} (oxsarliq ${e.similarity}): ${e.text.replace(/\s+/g, ' ').slice(0, 110)}`);
    }
    console.log('');
  }
}

/* ── --purge ──────────────────────────────────────────────────────────── */

async function runPurge(hard) {
  const body = hard
    ? { hard: true }
    : { source: args.source ? String(args.source) : undefined, locale: args.locale ? String(args.locale) : undefined };
  const res = await call('/api/rag/admin/purge', body);
  if (!res.ok) {
    console.error(`\n  XETA: HTTP ${res.status} — ${JSON.stringify(res.data)?.slice(0, 300)}\n`);
    process.exit(1);
  }
  if (hard) console.log('\n  Cedvel atildi. Novbeti addim:  node rag-index.mjs --run\n');
  else console.log(`\n  Silindi: ${JSON.stringify(res.data.purged)}\n`);
}

/* ── Giriş ────────────────────────────────────────────────────────────── */

if (args.locale && LOCALES.indexOf(String(args.locale)) === -1) {
  console.error(`\n  XETA: --locale ${LOCALES.join('/')} olmalidir.\n`);
  process.exit(1);
}

if (args.search) await runSearch(String(args.search));
else if (args['purge-hard']) await runPurge(true);
else if (args.purge) await runPurge(false);
else if (args.run) await runIndex({ dryRun: false });
else if (args.plan) await runIndex({ dryRun: true });
else if (args.status) await showStatus();
else {
  console.log('\n  Bayraq lazimdir: --status | --plan | --run | --search=<sorgu> | --purge | --purge-hard');
  console.log('  Elave: --source=<menbe> --locale=az|ru|en --limit=<n> --force\n');
  process.exit(1);
}
