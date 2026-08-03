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

  // TƏKRAR CƏHD YOXDUR. E-poçt göndərmək idempotent DEYİL: `retries: 3`
  // uğursuz görünən, amma əslində işləyən bağlantıda üç məktub göndərərdi.
  // Timeout uzundur, çünki SMTP əl sıxma + Render-in soyuq başlanğıcı
  // birlikdə yarım dəqiqəyə qədər çəkə bilər.
  const res = await api('POST', '/api/identity/admin/mail-test', to ? { to } : {}, {
    headers: { 'x-adda-admin-secret': secret },
    retries: 1,
    timeoutMs: to ? 90000 : 30000,
  });

  const cfg = res.data?.config;
  if (cfg) {
    console.log('  KONFIQURASIYA:');
    for (const [k, v] of Object.entries(cfg)) {
      const shown = v === true ? 'VAR' : v === false ? 'YOXDUR  <-- problem burada ola biler' : v;
      console.log(`    ${k.padEnd(16)} ${shown}`);
    }
    console.log('');
  }

  // VERSIYA UYGUNLUGU.
  //
  // Lokal alət yenilənib, amma server köhnə kodu işlədirsə, aşağıdakı
  // məsləhətlər BAŞQA kod yoluna aid olur və yanlış istiqamətə aparır.
  // `istifade_olunan` sahəsi HTTP API dəstəyi ilə birlikdə gəlir — yoxdursa
  // server hələ köhnədir.
  if (cfg && cfg.istifade_olunan === undefined) {
    console.error('  DAYANDIRILDI: server KOHNE kodu isledir.\n');
    console.error('  Bu alət HTTP API destegini gozleyir, server ise hele SMTP-lidir.');
    console.error('  Yerli commit yaradilib, amma PUSH EDILMEYIB ve ya deploy bitmeyib.\n');
    console.error('    git log --oneline -1          # yerli son commit');
    console.error('    git log --oneline -1 origin/main   # serverdeki');
    console.error('    git push                      # ferq varsa');
    console.error('');
    console.error('  Render-de deploy bitdikden sonra bu emri tekrar isslet.\n');
    return 1;
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
    console.error('  NETICE: poct xidmeti qurulmayib -- magic link HEC VAXT gonderilmir.\n');
    console.error('  RENDER PULSUZ TARIFDE SMTP ISLEMIR: 25/465/587 portlari bloklanib');
    console.error('  (26 sentyabr 2025-den). Ona gore HTTP API isledin -- adi HTTPS-dir,');
    console.error('  bloklanmir. Render -> Environment:\n');
    console.error('    BREVO_API_KEY   <Brevo -> SMTP & API -> API Keys>');
    console.error('    SMTP_FROM       ADDA <no-reply@adda.edu.az>');
    console.error('    SITE_URL        https://demo.adda.edu.az\n');
    console.error('  Alternativ: RESEND_API_KEY (Resend). Ikisinden biri kifayetdir.\n');
    return 1;
  }
  // HTTP 0 = server-e catmaq mumkun olmadi (cavab GELMEDI).
  // Bunu server-in qaytardigi xetadan ayirmaq vacibdir: birincisi sebekə
  // seviyyesindedir, ikincisi SMTP seviyyesinde.
  if (res.status === 0) {
    console.error('  NETICE: servere catmaq mumkun olmadi -- cavab gelmedi.');
    console.error(`  SEBEB : ${res.error || 'namelum'}\n`);
    console.error('  Ehtimallar:');
    console.error('    timeout            -> SMTP bagintisi asilib. Ən çox rast gelinen:');
    console.error('                          port 465 ucun SMTP_SECURE=true lazimdir,');
    console.error('                          port 587 ucun ise false.');
    console.error('    ECONNRESET / EOF   -> Render sorgunu kesib (SMTP cox uzun cekib)');
    console.error('    fetch failed       -> STRAPI_URL sehvdir ve ya xidmet yatib\n');
    console.error('  Render loglarinda AXTAR: "[identity] mail-test ugursuz"');
    console.error('  Orada nodemailer-in oz xeta metni var.\n');
    return 1;
  }
  if (!res.ok) {
    console.error(`  NETICE: gonderme ugursuz (HTTP ${res.status}).`);
    if (res.data?.message) console.error(`  SEBEB : ${res.data.message}`);
    if (res.data?.ms) console.error(`  MUDDET: ${res.data.ms} ms`);
    if (res.error) console.error(`  SEBEB : ${res.error}`);
    console.error('');
    const via = res.data?.via || '';
    if (via === 'smtp') {
      console.error('  DIQQET: hazirda SMTP isledilir.');
      console.error('  RENDER PULSUZ TARIFDE SMTP BLOKLANIB (25/465/587, 26.09.2025-den).');
      console.error('  Baglanti "asilir" -- ECONNREFUSED vermir, cunki paketler DROP olunur.');
      console.error('  Nece parametr deyisilse de netice eyni olacaq.\n');
      console.error('  HELL: HTTP API isledin (adi HTTPS, bloklanmir):');
      console.error('    Render -> Environment -> BREVO_API_KEY = <Brevo API acari>');
      console.error('  Elave edildikden sonra kod OZU API-ye kecir, SMTP deyisenlerine');
      console.error('  toxunmaq lazim deyil.\n');
      return 1;
    }
    console.error('  Tez-tez rast gelinen sebebler:');
    console.error('    HTTP 401 / unauthorized   -> API acari sehvdir ve ya legv olunub');
    console.error('    "sender ... not valid"    -> SMTP_FROM domeni provayderde tesdiqlenmeyib');
    console.error('    HTTP 400                  -> gonderen unvan formati sehvdir\n');
    return 1;
  }

  if (res.data?.sent) {
    console.log(`  OK: test mektubu ${to} unvanina gonderildi (${res.data.via}, ${res.data.ms} ms).`);
    console.log('  Gelmediyse spam qovlugunu ve SMTP_FROM domeninin SPF/DKIM qeydlerini yoxla.\n');
  } else {
    console.log('  OK: SMTP konfiqurasiyasi tam gorunur.');
    console.log('  Real gonderme yoxlamasi ucun: node mail-check.mjs <e-poct>\n');
  }
  return 0;
}

process.exitCode = await main();
