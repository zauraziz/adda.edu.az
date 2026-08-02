// K26-18 — SMTP diaqnostikası.
//
// NİYƏ LAZIMDIR: magic-link göndərilməyəndə səbəb üç yerdə ola bilər —
// `SMTP_HOST` təyin edilməyib, kimlik məlumatları səhvdir, və ya port
// bağlıdır. Render loglarını qazmaq əvəzinə bu alət real xəta mətnini verir.
//
// İSTİFADƏ:
//   node mail-check.mjs                      # yalniz konfiqurasiyani goster
//   node mail-check.mjs zaur@adda.edu.az     # test mektubu gonder
//
// PowerShell-də sirri TƏK DIRNAQLA ver:
//   $env:ADMIN_IMPORT_SECRET = '<sirr>'
// İkiqat dırnaq `$` işarəsini dəyişən kimi oxuyur və sirri korlayır.

import { createHash } from 'node:crypto';
import { STRAPI_URL, api } from './lib/strapi.mjs';

const fp = (v) => (v ? createHash('sha256').update(v, 'utf8').digest('hex').slice(0, 8) : '(bos)');

/**
 * WINDOWS-DA `process.exit()` İŞLƏDİLMİR.
 *
 * Node stdout-u hələ boşaltmamış proses bağlananda libuv assert atır:
 *   Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), src\win\async.c
 * `process.exitCode` təyin edib təbii çıxışı gözləmək eyni nəticəni verir,
 * amma çıxış mesajları itmir. Ona görə bütün məntiq `main()` içindədir və
 * dayandırmaq üçün adi `return` işlədilir.
 */
async function main() {
  const to = process.argv[2] || '';
  const raw = process.env.ADMIN_IMPORT_SECRET || '';
  // Server tərəfdə də trim olunur — kopyalama zamanı düşən boşluq və sətir
  // sonu gözlə görünmür, amma müqayisəni pozur.
  const secret = raw.trim();

  if (secret.length < 16) {
    console.error('\n  XETA: ADMIN_IMPORT_SECRET teyin edilmeyib (min 16 simvol).');
    console.error("  PowerShell:  $env:ADMIN_IMPORT_SECRET = '<sirr>'\n");
    return 1;
  }
  if (raw !== secret) {
    console.log('  QEYD: sirrde artiq bosluq/setir sonu var idi, kesildi.');
  }

  console.log(`\n  hedef       : ${STRAPI_URL}`);
  console.log(`  sirr        : ${secret.length} simvol, barmaq izi ${fp(secret)}`);
  if (to) console.log(`  test mektubu: ${to}`);
  console.log('');

  const res = await api('POST', '/api/identity/admin/mail-test', to ? { to } : {}, {
    headers: { 'x-adda-admin-secret': secret },
  });

  const cfg = res.data?.config;
  if (cfg) {
    console.log('  KONFIQURASIYA:');
    for (const [k, v] of Object.entries(cfg)) {
      const shown = v === true ? 'VAR' : v === false ? 'YOXDUR  <-- problem burada ola biler' : v;
      console.log(`    ${k.padEnd(12)} ${shown}`);
    }
    console.log('');
  }

  if (res.status === 403) {
    console.error('  XETA: sirr uygun gelmedi.\n');
    console.error(`  Gonderilen: ${res.data?.sentLength ?? secret.length} simvol, barmaq izi ${res.data?.sentFingerprint ?? fp(secret)}`);
    console.error('  Render loglarinda AXTAR: "admin/mail-test: sehv sirr"');
    console.error('  Orada GOZLENILEN barmaq izi ve uzunluq yazilib -- yuxaridaki ile tutusdur.\n');
    console.error('  EN COX RAST GELINEN SEBEB -- PowerShell dirnaqlari:');
    console.error('    $env:X = "a$b!c"   <-- IKIQAT dirnaq `$b`-ni DEYISEN sayir ve silir.');
    console.error("    $env:X = 'a$b!c'   <-- TEK dirnaq: deyer olduju kimi qalir. BUNU ISLET.\n");
    console.error('  Uzunlugu yoxla:  $env:ADMIN_IMPORT_SECRET.Length');
    console.error('  Render-deki sirrin uzunlugu ile eyni olmalidir.\n');
    return 1;
  }
  if (res.status === 404) {
    console.error('  XETA: endpoint tapilmadi -- son deploy tetbiq olunmayib.\n');
    return 1;
  }
  if (res.data?.error === 'admin_import_disabled') {
    console.error('  XETA: Render-de ADMIN_IMPORT_SECRET teyin edilmeyib.');
    console.error('  Environment bolmesine elave et ve YENIDEN DEPLOY et.\n');
    return 1;
  }
  if (res.data?.error === 'mail_unconfigured') {
    console.error('  NETICE: SMTP_HOST teyin edilmeyib -- magic link HEC VAXT gonderilmir.');
    console.error('  Render -> Environment bolmesinde bunlari elave et:\n');
    console.error('    SMTP_HOST   mes. smtp-relay.brevo.com');
    console.error('    SMTP_PORT   587');
    console.error('    SMTP_USER   <istifadeci>');
    console.error('    SMTP_PASS   <sifre>');
    console.error('    SMTP_FROM   ADDA <no-reply@adda.edu.az>');
    console.error('    SITE_URL    https://demo.adda.edu.az\n');
    return 1;
  }
  if (!res.ok) {
    console.error(`  NETICE: gonderme ugursuz (HTTP ${res.status}).`);
    if (res.data?.message) console.error(`  SEBEB : ${res.data.message}`);
    console.error('');
    console.error('  Tez-tez rast gelinen sebebler:');
    console.error('    "Invalid login" / 535     -> SMTP_USER ve ya SMTP_PASS sehvdir');
    console.error('    "ECONNREFUSED"            -> host/port sehvdir ve ya blokdur');
    console.error('    "self signed certificate" -> SMTP_SECURE deyerini yoxla');
    console.error('    "Sender address rejected" -> SMTP_FROM domeni tesdiqlenmeyib\n');
    return 1;
  }

  if (res.data?.sent) {
    console.log(`  OK: test mektubu ${to} unvanina gonderildi.`);
    console.log('  Gelmediyse spam qovlugunu ve SMTP_FROM domeninin SPF/DKIM qeydlerini yoxla.\n');
  } else {
    console.log('  OK: SMTP konfiqurasiyasi tam gorunur.');
    console.log('  Real gonderme yoxlamasi ucun: node mail-check.mjs <e-poct>\n');
  }
  return 0;
}

process.exitCode = await main();
