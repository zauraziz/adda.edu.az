/**
 * F5.38 — «Bildirişlər» sayğacı: modul səviyyəli TƏK sorğu dövrü.
 *
 * Niyə React state yox: sol menyunun ikon komponenti Strapi-nin daxilində
 * hər render-də YENİDƏN mount olunur (MainNavLinks.mjs `LinkElement`-i
 * map-in içində yaradır). Sayğac və «yeni gəldi» siqnalı komponentdə
 * saxlansaydı, hər yenidən mount-da sıfırlanar və sorğular çoxalardı.
 * Burada vəziyyət modul səviyyəsindədir, komponentlər yalnız abunə olur.
 *
 * Dövr: 60 san-dən bir, yalnız vərəq görünəndə; vərəqə qayıdanda dərhal.
 * Abunəçi qalmayanda (məs. çıxış) 5 san sonra dayanır.
 */
import { useSyncExternalStore } from 'react';
import { inboxApi, KINDS, type InboxItem, type Kind, type Summary } from './shared';

const POLL_MS = 60_000;
const MIN_GAP_MS = 10_000;
const STOP_DELAY_MS = 5_000;

export interface Arrival {
  kind: Kind;
  item: InboxItem;
}

interface State {
  summary: Summary | null;
  error: boolean;
  loadedAt: number;
}

let state: State = { summary: null, error: false, loadedAt: 0 };
const listeners = new Set<() => void>();
const arrivalQueue: Arrival[] = [];
/** Hər növün sorğu dövrünün gördüyü ən yeni «yeni» qeydinin vaxtı. */
let lastLatest: Partial<Record<Kind, string>> | null = null;

let timer: ReturnType<typeof setInterval> | null = null;
let stopTimer: ReturnType<typeof setTimeout> | null = null;
let inFlight: Promise<void> | null = null;
let lastPollAt = 0;
let subscribers = 0;

function emit(): void {
  listeners.forEach((l) => l());
}

async function poll(force = false): Promise<void> {
  if (inFlight) return inFlight;
  if (!force && Date.now() - lastPollAt < MIN_GAP_MS) return;
  lastPollAt = Date.now();
  inFlight = (async () => {
    try {
      const summary = await inboxApi.summary();
      const prev = lastLatest;
      const next: Partial<Record<Kind, string>> = { ...(prev ?? {}) };
      for (const kind of KINDS) {
        const latest = summary.kinds[kind]?.latest;
        if (!latest?.createdAt || latest.createdAt <= (next[kind] ?? '')) continue;
        // İlk sorğuda heç nə «gəlmiş» sayılmır — yalnız sonrakı fərqlər.
        if (prev) arrivalQueue.push({ kind, item: latest });
        next[kind] = latest.createdAt;
      }
      // Yalnız ARTIR: ən yeni qeyd «baxılır» edilib sonra yenə «yeni»yə
      // qaytarılanda o, təzədən «gəldi» sayılmır.
      lastLatest = next;
      state = { summary, error: false, loadedAt: Date.now() };
    } catch {
      state = { ...state, error: true };
    } finally {
      inFlight = null;
      emit();
    }
  })();
  return inFlight;
}

function onVisibility(): void {
  if (document.visibilityState === 'visible') void poll();
}

function start(): void {
  if (stopTimer) {
    clearTimeout(stopTimer);
    stopTimer = null;
  }
  if (timer) return;
  void poll(true);
  timer = setInterval(() => {
    if (document.visibilityState === 'visible') void poll();
  }, POLL_MS);
  document.addEventListener('visibilitychange', onVisibility);
}

function scheduleStop(): void {
  if (stopTimer) clearTimeout(stopTimer);
  stopTimer = setTimeout(() => {
    stopTimer = null;
    if (subscribers > 0) return;
    if (timer) clearInterval(timer);
    timer = null;
    document.removeEventListener('visibilitychange', onVisibility);
  }, STOP_DELAY_MS);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  subscribers += 1;
  start();
  return () => {
    listeners.delete(listener);
    subscribers -= 1;
    if (subscribers <= 0) {
      subscribers = 0;
      scheduleStop();
    }
  };
}

function getSnapshot(): State {
  return state;
}

/** Sayğacı oxu (abunə olmaq dövrü başladır). */
export function useInboxSummary(): State {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Status dəyişəndən sonra sayğacı dərhal yenilə. */
export function refreshInboxSummary(): Promise<void> {
  return poll(true);
}

/** Toast üçün yığılmış «yeni gəldi» hadisələrini götür (növbə boşalır). */
export function takeArrivals(): Arrival[] {
  return arrivalQueue.splice(0, arrivalQueue.length);
}
