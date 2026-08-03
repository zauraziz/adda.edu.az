// Strapi 5 REST müştərisi — idxal üçün.
//
// NİYƏ REST, birbaşa DB deyil: `documents` qatı lifecycle-ları, i18n
// əlaqələrini və Meilisearch indeksləməsini işə salır. Birbaşa SQL yazsaq
// axtarış indeksi boş qalar və F2.3 relSync middleware-i heç vaxt işləməz.
import { loadEnv } from './env.mjs';

loadEnv();

export const STRAPI_URL = (process.env.STRAPI_URL || 'http://localhost:1337').replace(/\/+$/, '');
const TOKEN = process.env.STRAPI_TOKEN || '';

export function assertToken() {
  if (!TOKEN) {
    console.error('\n  XETA: STRAPI_TOKEN teyin olunmayib.');
    console.error('  tools/migration/.env yarat (numune: .env.example):');
    console.error('    STRAPI_URL=http://localhost:1337');
    console.error('    STRAPI_TOKEN=<Strapi admin -> Settings -> API Tokens -> Full access>\n');
    process.exit(1);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Cavab HEÇ VAXT throw etmir — uzun idxal bir xətadan dayanmasın. */
/**
 * `headers` — əlavə başlıqlar (məs. admin sirri). Authorization ÜSTÜNDƏN
 * yazılmır: spread `Authorization`-dan SONRA gəlsə, çağıran onu təsadüfən
 * silə bilərdi.
 */
export async function api(method, path, body, { retries = 3, headers = {}, timeoutMs = 60000 } = {}) {
  let lastError = null;
  for (let attempt = 1; attempt <= retries; attempt++) {
    // TIMEOUT MƏCBURİDİR: Node-un `fetch`-ində default vaxt həddi YOXDUR.
    // Server tərəf asılsa (məs. SMTP bağlantısı cavab vermir) bu döngə
    // əbədi gözləyər və istifadəçi heç bir mesaj görməz.
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), timeoutMs);
    try {
      const res = await fetch(STRAPI_URL + path, {
        method,
        signal: ac.signal,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
          Authorization: 'Bearer ' + TOKEN,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      let json = null;
      const text = await res.text();
      if (text) {
        try {
          json = JSON.parse(text);
        } catch {
          json = { raw: text.slice(0, 300) };
        }
      }
      // 5xx keçici ola bilər; 4xx qətidir.
      if (res.status >= 500 && attempt < retries) {
        lastError = `HTTP ${res.status}`;
        await sleep(500 * attempt);
        continue;
      }
      return { ok: res.ok, status: res.status, data: json };
    } catch (err) {
      lastError =
        err && err.name === 'AbortError'
          ? `${timeoutMs} ms icinde cavab gelmedi (timeout)`
          : String((err && err.message) || err);
      if (attempt < retries) await sleep(500 * attempt);
    } finally {
      clearTimeout(timer);
    }
  }
  return { ok: false, status: 0, data: null, error: lastError };
}

export async function ping() {
  const res = await api('GET', '/api/articles?pagination[pageSize]=1');
  if (res.status === 0) {
    console.error(`\n  XETA: ${STRAPI_URL} elcatan deyil. Strapi isleyirmi?\n  (${res.error})\n`);
    process.exit(1);
  }
  if (res.status === 401 || res.status === 403) {
    console.error(`\n  XETA: token qebul olunmadi (HTTP ${res.status}). Full access olduguna emin ol.\n`);
    process.exit(1);
  }
  return res;
}
