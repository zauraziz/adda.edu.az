// K26-16 — SMTP diaqnostikası.
//
// NİYƏ LAZIMDIR: magic-link göndərilməyəndə səbəb üç yerdə ola bilər —
// `SMTP_HOST` təyin edilməyib, kimlik məlumatları səhvdir, və ya port
// bağlıdır. Render loglarını qazmaq əvəzinə bu alət real xəta mətnini verir.
//
// İSTİFADƏ:
//   node mail-check.mjs                      # yalniz konfiqurasiyani goster
//   node mail-check.mjs zaur@adda.edu.az     # test mektubu gonder
//
// `ADMIN_IMPORT_SECRET` mühit dəyişəni lazımdır — Render-dəki ilə eyni:
//   $env:ADMIN_IMPORT_SECRET = '<sirr>'

import { STRAPI_URL, api } from './lib/strapi.mjs';

const to = process.argv[2] || '';
const secret = process.env.ADMIN_IMPORT_SECRET || '';

if (secret.length < 16) {
  console.error('\n  XETA: ADMIN_IMPORT_SECRET teyin edilmeyib (min 16 simvol).');
  console.error('  PowerShell: $env:ADMIN_IMPORT_SECRET = \'<Render-dekiile eyni sirr>\'\n');
  process.exit(1);
}

console.log(`\n  hedef: ${STRAPI_URL}`);
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
  console.error('  XETA: sirr uygun gelmedi. Render-deki ADMIN_IMPORT_SECRET ile eyni olmalidir.\n');
  process.exit(1);
}
if (res.status === 404) {
  console.error('  XETA: endpoint tapilmadi -- K26-16 deploy olunmayib.\n');
  process.exit(1);
}
if (res.data?.error === 'admin_import_disabled') {
  console.error('  XETA: Render-de ADMIN_IMPORT_SECRET teyin edilmeyib.\n');
  process.exit(1);
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
  process.exit(1);
}
if (!res.ok) {
  console.error(`  NETICE: gonderme ugursuz (HTTP ${res.status}).`);
  if (res.data?.message) console.error(`  SEBEB : ${res.data.message}`);
  console.error('');
  console.error('  Tez-tez rast gelinen sebebler:');
  console.error('    "Invalid login" / 535   -> SMTP_USER ve ya SMTP_PASS sehvdir');
  console.error('    "ECONNREFUSED"          -> host/port sehvdir ve ya blokdur');
  console.error('    "self signed certificate"-> SMTP_SECURE deyerini yoxla');
  console.error('    "Sender address rejected"-> SMTP_FROM domeni tesdiqlenmeyib\n');
  process.exit(1);
}

if (res.data?.sent) {
  console.log(`  OK: test mektubu ${to} unvanina gonderildi.`);
  console.log('  Gelmediyse spam qovlugunu ve SMTP_FROM domeninin SPF/DKIM qeydlerini yoxla.\n');
} else {
  console.log('  OK: SMTP konfiqurasiyasi tam gorunur.');
  console.log('  Real gonderme yoxlamasi ucun: node mail-check.mjs <e-poct>\n');
}
