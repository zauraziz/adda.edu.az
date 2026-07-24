// Boğulmuş (throttled), təkrar cəhdli HTTP. Xarici asılılıq YOXDUR —
// Node 18+ daxili fetch. Beləliklə crawl mərhələsi `npm install` olmadan işləyir.
import { RETRIES, THROTTLE_MS, TIMEOUT_MS, USER_AGENT } from '../config.mjs';

let lastAt = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function throttle() {
  const wait = lastAt + THROTTLE_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastAt = Date.now();
}

/**
 * Səhifəni gətir. HEÇ VAXT throw etmir — həmişə nəticə obyekti qaytarır ki,
 * uzun crawl bir xətadan dayanmasın.
 * @returns {{ status:number, body:string, bytes:number, error:string|null }}
 */
export async function get(url) {
  let lastError = null;

  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    await throttle();
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,application/xhtml+xml' },
        redirect: 'follow',
        signal: ac.signal,
      });
      const body = await res.text();
      clearTimeout(timer);

      // 5xx keçici ola bilər — təkrar cəhd. 4xx qətidir.
      if (res.status >= 500 && attempt < RETRIES) {
        lastError = 'HTTP ' + res.status;
        await sleep(1000 * attempt);
        continue;
      }
      return { status: res.status, body, bytes: Buffer.byteLength(body, 'utf8'), error: null };
    } catch (err) {
      clearTimeout(timer);
      lastError = err && err.name === 'AbortError' ? 'timeout' : String((err && err.message) || err);
      if (attempt < RETRIES) await sleep(1000 * attempt);
    }
  }

  return { status: 0, body: '', bytes: 0, error: lastError };
}
