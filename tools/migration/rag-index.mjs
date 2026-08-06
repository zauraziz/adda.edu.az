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
//   node rag-index.mjs --run --max-items=900 # kvota budcesi (element sayi)
//   node rag-index.mjs --purge --source=page
//   node rag-index.mjs --purge-hard          # cedveli at (olcu deyisende)
//   node rag-index.mjs --search="deniz naqliyyati" --locale=az
//   node rag-index.mjs --audit               # isarelenmis (subheli) parcalar
//   node rag-index.mjs --ask "Gemi mexanikasi ixtisasina qebul necedir?" 

import { STRAPI_URL, api } from './lib/strapi.mjs';

// Deyer goturen bayraqlar. `--search=metn` DE, `--search metn` DE islemelidir.
//
// KOHNE PARSER SESSIZ SEHV VERIRDI: `--search "sual"` formasinda bayraq
// `true` olurdu ve servere sorgu kimi "true" gedirdi -- netice qaytarilirdi,
// yalniz tamam basqa sual ucun. Sessiz olmasi ucun indi deyeri catismayan
// bayraq XETA verir.
const VALUE_FLAGS = new Set(['search', 'ask', 'probe', 'source', 'locale', 'limit', 'max-items', 'max-wait']);

const args = (() => {
  const out = {};
  const argv = process.argv.slice(2);
  const loose = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const m = a.match(/^--([^=]+)(?:=([\s\S]*))?$/);
    if (!m) {
      loose.push(a);
      continue;
    }
    const key = m[1];
    if (m[2] !== undefined) {
      out[key] = m[2];
    } else if (VALUE_FLAGS.has(key)) {
      const next = argv[i + 1];
      if (next === undefined || /^--/.test(next)) {
        console.error(`\n  XETA: --${key} deyer teleb edir.  Menual: --${key}=<deyer>  ve ya  --${key} <deyer>\n`);
        process.exit(1);
      }
      out[key] = next;
      i++;
    } else {
      out[key] = true;
    }
  }
  if (loose.length) {
    console.error(`\n  XETA: taninmayan arqument(ler): ${loose.join(' ')}`);
    console.error('  Deyerli bayraqlar: --' + Array.from(VALUE_FLAGS).join(' --') + '\n');
    process.exit(1);
  }
  return out;
})();

const SECRET = (process.env.ADMIN_IMPORT_SECRET || '').trim();
if (SECRET.length < 16) {
  console.error('\n  XETA: ADMIN_IMPORT_SECRET teyin edilmeyib (min 16 simvol).');
  console.error("  PowerShell:  $env:ADMIN_IMPORT_SECRET = '<sirr>'\n");
  process.exit(1);
}

const HEADERS = { 'x-adda-admin-secret': SECRET };
const LOCALES = ['az', 'ru', 'en'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function hhmmss(ms) {
  const t = Math.round(ms / 1000);
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}

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
  const gd = d.guard || {};
  console.log(`  guard : e-poct/telefon=${gd.contacts !== false ? 'aciq' : 'SONULU'}  FIN/IBAN/kart=${gd.identifiers !== false ? 'aciq' : 'SONULU'}  inyeksiya=${gd.injection !== false ? 'aciq' : 'SONULU'}`);
  const flagged = d.indexed.reduce((a, r) => a + (r.flagged || 0), 0);
  if (flagged) console.log(`          ${flagged} parca ISARELENIB -> node rag-index.mjs --audit\n`);
  else console.log('');

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

  const grand = { docs: 0, chunks: 0, embedded: 0, skipped: 0, trimmed: 0, calls: 0, items: 0, batches: 0, waitedMs: 0, quotaHits: 0 };
  const t0 = Date.now();

  // Kvota budcesi: pulsuz tarifde gunluk element haddi var, ona gore bir
  // gedisi qesden kesmek olur. 0 = limitsiz.
  const maxItems = args['max-items'] ? parseInt(String(args['max-items']), 10) : 0;
  const maxWaitMs = (args['max-wait'] ? parseInt(String(args['max-wait']), 10) : 900) * 1000;
  let stop = false;

  for (const pair of pairs) {
    if (stop) break;
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

      // KVOTA (429) KECICIDIR -- menbeni terk etmirik, gozleyib EYNI
      // kursordan davam edirik. Kohne davranis 502 kimi baxib `article/az`-i
      // 75-ci senedde atirdi.
      if (res.status === 429) {
        const advised = res.data?.retryAfterMs || 30000;
        if (grand.waitedMs + advised > maxWaitMs) {
          console.log(`\n    KVOTA @${cursor}: umumi gozleme haddi (${hhmmss(maxWaitMs)}) asildi -- dayanildi.`);
          console.log(`    Novbeti gedisde eyni emr qaldigi yerden davam edecek.`);
          stop = true;
          break;
        }
        process.stdout.write(`[kvota ${Math.round(advised / 1000)}s]`);
        grand.waitedMs += advised;
        grand.quotaHits++;
        await sleep(advised + 500);
        continue;   // EYNI kursor
      }

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
      grand.items += s.items || 0;
      grand.batches++;
      process.stdout.write('.');
      if (maxItems && grand.items >= maxItems) {
        console.log(`\n    BUDCE: ${grand.items} element gonderildi (--max-items=${maxItems}) -- dayanildi.`);
        stop = true;
        break;
      }
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
  if (!dryRun) {
    console.log(`    API sorgu  : ${grand.calls}`);
    console.log(`    element    : ${grand.items}   <- KVOTA BUNU SAYIR (HTTP sorgusunu yox)`);
    if (grand.quotaHits) console.log(`    kvota gozlemesi: ${grand.quotaHits} defe, cemi ${hhmmss(grand.waitedMs)}`);
  }
  console.log('');
  if (stop) console.log('  Eyni emri tekrar isle sal -- qaldigi yerden davam edecek.\n');
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
  console.log(`  cavab verile biler: ${d.answerable ? 'BELI' : 'XEYR'}`);
  if (d.counts) console.log(`  namized: leksik ${d.counts.lexical}, vektor ${d.counts.vector} sened (${d.counts.chunks} parca, ${d.counts.candidates} xam)`);
  if (d.similarity) {
    const s2 = d.similarity;
    console.log(`  oxsarliq: top ${s2.top}  median ${s2.median}  alt ${s2.bottom}  sapma ${s2.stdev}  gapZ ${s2.gapZ}`);
    console.log(`  qapi    : simZ=${d.gate.simZ}  simDrop=${d.gate.simDrop}  simFloor=${d.gate.simFloor}`);
  }
  for (const n of d.notes || []) console.log(`  QEYD  : ${n}`);
  console.log('');

  if (!d.hits.length) {
    console.log('  netice yoxdur.\n');
    return;
  }
  if (d.similarity && d.similarity.gapZ < 2 && d.counts && d.counts.lexical === 0) {
    console.log('  DIQQET: gapZ asagidir ve leksik uygunluq yoxdur -- bu, yeqin ki,');
    console.log('          "hec ne uygun gelmir" halidir. RAG_SIM_Z ile kesilmelidir.\n');
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

/* ── --entities (F2.7-5) ──────────────────────────────────────────────── */

async function runEntities() {
  const res = await call('/api/rag/admin/entities', {
    locale: args.locale ? String(args.locale) : 'az',
    refresh: Boolean(args.refresh),
    ...(args.probe ? { probe: String(args.probe) } : {}),
  });
  if (!res.ok) {
    console.error(`\n  XETA: HTTP ${res.status} — ${JSON.stringify(res.data)?.slice(0, 300)}\n`);
    process.exit(1);
  }
  const d = res.data;
  console.log(`\n  qazettir : ${d.total} varliq, ${d.keys} acar   (${d.locale}, qurulub ${d.builtAt})`);
  for (const [k, n] of Object.entries(d.byKind)) console.log(`    ${pad(k, 14)}${n}`);
  console.log(`\n  en uzun acar : ${d.longestKeys[0]}`);
  console.log(`  en qisa acar : ${d.shortestKeys[d.shortestKeys.length - 1]}`);
  if (d.probe !== undefined) {
    console.log(`\n  sinaq metni: "${d.probe}"`);
    if (!d.matches.length) console.log('    heç nə tanınmadı.');
    for (const m of d.matches) console.log(`    [${m.kind}] "${m.surface}" -> ${m.title}  ${m.url}`);
  }
  console.log('');
}

/* ── --ask (F2.7-4) ───────────────────────────────────────────────────── */

async function runAsk(q) {
  const locale = args.locale ? String(args.locale) : 'az';
  const res = await call('/api/rag/answer', {
    q,
    locale,
    debug: true,
    ...(args.source ? { sources: String(args.source) } : {}),
  });
  if (res.status === 429) {
    console.error(`\n  KVOTA: ${Math.round((res.data?.retryAfterMs || 30000) / 1000)}s sonra tekrarla.\n`);
    process.exit(1);
  }
  if (!res.ok) {
    console.error(`\n  XETA: HTTP ${res.status} — ${JSON.stringify(res.data)?.slice(0, 300)}\n`);
    process.exit(1);
  }
  const d = res.data;

  console.log(`\n  sual  : ${d.query}   (${locale})`);
  console.log(`  cavab : ${d.answered ? 'VERILDI' : 'IMTINA — ' + d.reason}   ${d.tookMs} ms${d.cached ? '   [kesden]' : ''}`);
  for (const n of d.notes || []) console.log(`  QEYD  : ${n}`);
  console.log('');
  console.log('  ' + String(d.answer).split('\n').join('\n  '));
  console.log('');

  if (d.sources?.length) {
    console.log('  Menbeler:');
    for (const s2 of d.sources) console.log(`    [${s2.n}] ${s2.title}\n         ${s2.url}`);
    console.log('');
  }
  if (d.entities?.length) {
    console.log('  Tanınan varlıqlar:');
    for (const en of d.entities) console.log(`    [${en.kind}] "${en.surface}" -> ${en.url}`);
    console.log('');
  }
  if (d.invalidCitations?.length) {
    console.log(`  DIQQET: model uydurulmus istinad yazdi -> [${d.invalidCitations.join('], [')}]  (atildi)\n`);
  }
  if (!d.answered && d.rawAnswer) {
    console.log('  Atilmis xam cavab (debug):');
    console.log('    ' + String(d.rawAnswer).slice(0, 400).split('\n').join('\n    '));
    console.log('');
  }
}

/* ── --audit (F2.7-3) ─────────────────────────────────────────────────── */

async function runAudit() {
  const res = await call('/api/rag/admin/audit', { limit: args.limit ? parseInt(String(args.limit), 10) : 100 });
  if (!res.ok) {
    console.error(`\n  XETA: HTTP ${res.status} — ${JSON.stringify(res.data)?.slice(0, 300)}\n`);
    process.exit(1);
  }
  const d = res.data;
  console.log(`\n  guardrail: e-poct/telefon=${d.guard.contacts}  FIN/IBAN/kart=${d.guard.identifiers}  inyeksiya=${d.guard.injection}  dropFlagged=${d.guard.dropFlagged}`);
  console.log(`  isarelenmis parca: ${d.total}\n`);
  if (!d.total) {
    console.log('  Temizdir.\n');
    return;
  }
  for (const [sig, n] of Object.entries(d.bySignal).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${pad(sig, 24)}${n}`);
  }
  console.log('');
  for (const c of d.chunks) {
    console.log(`  [${c.source}] ${c.title}  (parca ${c.chunkIx})`);
    console.log(`    ${c.url}`);
    console.log(`    siqnal: ${c.signals}`);
    console.log(`    ${c.text.replace(/\s+/g, ' ').slice(0, 160)}`);
    console.log('');
  }
  console.log('  YALANCI MUSBET gorursensa naxislar deqiqlesdirilmelidir --');
  console.log('  hemin parcalar hazirda axtarisdan TAMAMILE cixarilir.\n');
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

if (args.entities) await runEntities();
else if (args.ask) await runAsk(String(args.ask));
else if (args.audit) await runAudit();
else if (args.search) await runSearch(String(args.search));
else if (args['purge-hard']) await runPurge(true);
else if (args.purge) await runPurge(false);
else if (args.run) await runIndex({ dryRun: false });
else if (args.plan) await runIndex({ dryRun: true });
else if (args.status) await showStatus();
else {
  console.log('\n  Bayraq lazimdir: --status | --plan | --run | --search=<sorgu> | --ask=<sual>');
  console.log('                   --entities [--probe=<metn>] [--refresh] | --audit | --purge | --purge-hard');
  console.log('  Elave: --source=<menbe> --locale=az|ru|en --limit=<n> --force');
  console.log('         --max-items=<n> (kvota budcesi)  --max-wait=<saniye, defolt 900)\n');
  process.exit(1);
}
