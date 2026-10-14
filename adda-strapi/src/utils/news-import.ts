/**
 * F5.51 — köhnə saytdan idxal və tədbirlər, ARXA PLANDA (port bloklanmır):
 *
 *   1. `certImages:v1` — sertifikat skanları (cert-block.ts → attachCertImages);
 *   2. `newsImport:v1` — köhnə saytın 15.07–14.10.2026 arası 6 xəbəri və 5 elanı
 *      (news-import-content.ts): az dilində, dərc olunmuş, köhnə saytdakı tarixlə;
 *      qapaq, qalereya və PDF-lər köhnə saytdan endirilib media kitabxanasına
 *      yüklənir, mətndəki {{file:N}} yüklənən PDF-in ünvanı olur;
 *   3. `eventsF551:v1` — ana səhifənin tədbir zolağı üçün 3 aidiyyəti tədbir
 *      (EVENTS_F551; tarix və yer admində dəqiqləşdirilir).
 *
 * Təkrar yaranmır: slug (və ya eyni başlıq + tarix) varsa qeyd ötürülür.
 * Web Push GETMİR: qeyd `create({ status: 'published' })` ilə yaranır — Document
 * Service `publish` hərəkətini daxildə çağırır, push middleware-i isə yalnız
 * ayrıca `publish` çağırışını tutur (köhnə xəbərlər üçün bildiriş lazım deyil).
 *
 * Köhnə sayt əlçatmazdırsa (şəbəkə) idxal dayanır və növbəti başlanğıcda
 * təkrarlanır (`legacyImport:tries`); 3-cü uğursuz başlanğıcdan sonra qeydlər
 * şəkilsiz yaradılır (PDF keçidləri köhnə sayta aparır) və logda yazılır.
 */
import type { Core } from '@strapi/strapi';
import { attachCertImages } from './cert-block';
import { importLegacyFile, legacyUrl, LegacyUnreachable } from './legacy-files';
import { IMPORT_ANNOUNCEMENTS, IMPORT_ARTICLES } from './news-import-content';

type Row = Record<string, unknown>;

const NEWS_MARKER = 'newsImport:v1';
const EVENTS_MARKER = 'eventsF551:v1';
const CERT_IMAGES_MARKER = 'certImages:v1';
const TRIES_KEY = 'legacyImport:tries';
const MAX_TRIES = 3;

export interface EventSeed {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  format: 'fiziki' | 'onlayn' | 'hibrid';
  /** Bakı vaxtı ilə (+04:00). */
  startAt: string;
  endAt: string;
  venueBuilding: string;
  venueRoom: string | null;
  platform: string | null;
}

/**
 * Ana səhifənin tədbir zolağı (5 sütun) boş qalmasın deyə 3 aidiyyəti tədbir.
 * NASCO 29 — ADDA-nın 20.08.2026 elanından (tarix, yer, format); Zəfər Günü və
 * Heydər Əliyevin anım günü — Akademiyanın hər il keçirdiyi tədbirlər (2024 və
 * 2025-in xəbərləri). Saat və zal təxminidir — admində dəqiqləşdirin.
 */
export const EVENTS_F551: EventSeed[] = [
  {
    slug: 'nasco-29-doktorantlarin-ve-genc-tedqiqatcilarin-xxix-respublika-elmi-konfransi',
    title: 'NASCO 29: Doktorantların və gənc tədqiqatçıların XXIX Respublika elmi konfransı',
    excerpt:
      'ADDA-nın doktorant, magistrant və gənc tədqiqatçıları Naxçıvan Dövlət Universitetində keçirilən konfransda əyani və distant formatda iştirak edir.',
    body:
      'Doktorantların və gənc tədqiqatçıların XXIX Respublika elmi konfransı (NASCO 29) 15–16 oktyabr 2026-cı il tarixlərində Naxçıvan Dövlət Universitetində keçirilir. Azərbaycan Dövlət Dəniz Akademiyasının doktorantları, magistrantları və gənc tədqiqatçıları konfransda məqalə ilə çıxış edir.\n\n' +
      '- **Format:** əyani və distant (onlayn videokonfrans); hər təhsil müəssisəsi üzrə iştirakçıların ən çox 30%-i distant qatıla bilər.\n' +
      '- **Sənəd qəbulu:** 1 oktyabr 2026-cı ildə başa çatıb.\n\n' +
      'Əlavə məlumat üçün ADDA-nın müvafiq kafedralarına və ya Elmi tədqiqat və beynəlxalq əlaqələr şöbəsinə müraciət edin. Elan: [ADDA-nın doktorant, magistrant və gənc tədqiqatçılarının nəzərinə](/az/elanlar/adda-nin-doktorant-magistrant-ve-genc-tedqiqatcilarinin-nezerine).',
    format: 'hibrid',
    startAt: '2026-10-15T10:00:00+04:00',
    endAt: '2026-10-16T17:00:00+04:00',
    venueBuilding: 'Naxçıvan Dövlət Universiteti',
    venueRoom: null,
    platform: 'Videokonfrans',
  },
  {
    slug: '8-noyabr-zefer-gunune-hesr-olunmus-tedbir-2026',
    title: '8 Noyabr – Zəfər Gününə həsr olunmuş tədbir',
    excerpt:
      'Akademiyanın rəhbərliyi, professor-müəllim heyəti, tələbələri və Vətən müharibəsi qazilərinin iştirakı ilə Zəfər Gününə həsr olunmuş tədbir.',
    body:
      '8 Noyabr – Zəfər Günü münasibətilə Azərbaycan Dövlət Dəniz Akademiyasında tədbir keçiriləcək. Vətən müharibəsi şəhidlərinin əziz xatirəsi bir dəqiqəlik sükutla yad ediləcək; Akademiyanın rəhbərliyi, professor-müəllim heyəti, tələbələr və dəvət olunmuş qazilər çıxış edəcək.\n\n' +
      'Tədbirə Akademiyanın bütün tələbə və əməkdaşları dəvət olunur.',
    format: 'fiziki',
    startAt: '2026-11-06T11:00:00+04:00',
    endAt: '2026-11-06T12:30:00+04:00',
    venueBuilding: 'Əsas tədris binası',
    venueRoom: 'Akt zalı',
    platform: null,
  },
  {
    slug: 'umummilli-lider-heyder-eliyevin-anim-gunu-2026',
    title: 'Ümummilli Lider Heydər Əliyevin anım günü',
    excerpt: '12 Dekabr – Ümummilli Lider Heydər Əliyevin anım günü ilə əlaqədar Akademiyada anım mərasimi.',
    body:
      'Müstəqil Azərbaycan dövlətinin memarı və qurucusu, Ümummilli Lider Heydər Əliyevin anım günü ilə əlaqədar Azərbaycan Dövlət Dəniz Akademiyasında anım mərasimi keçiriləcək. Ulu Öndərin əziz xatirəsi bir dəqiqəlik sükutla yad ediləcək, Akademiyanın rəhbərliyi, professor-müəllim heyəti və tələbələri çıxış edəcək.',
    format: 'fiziki',
    startAt: '2026-12-11T11:00:00+04:00',
    endAt: '2026-12-11T12:30:00+04:00',
    venueBuilding: 'Əsas tədris binası',
    venueRoom: 'Akt zalı',
    platform: null,
  },
];

interface Docs {
  findFirst: (a: Row) => Promise<Row | null>;
  create: (a: Row) => Promise<Row>;
}
const docsOf = (strapi: Core.Strapi, uid: string): Docs => strapi.documents(uid as never) as unknown as Docs;

/** Mətndəki fayl keçidi tam ünvan olmalıdır (Cloudinary-də onsuz da belədir; lokal provayderdə «/uploads/…»). */
function absUrl(u: string): string {
  if (!u.startsWith('/')) return u;
  return (process.env.ADMIN_PUBLIC_URL || 'https://adda-edu-az.onrender.com').trim().replace(/\/+$/, '') + u;
}

/** Köhnə saytdakı dərc vaxtı: Document Service `publishedAt`-ı «indi» yazır. */
async function keepPublishedAt(strapi: Core.Strapi, uid: string, documentId: string, iso: string): Promise<void> {
  await strapi.db.query(uid as never).updateMany({
    where: { documentId, publishedAt: { $notNull: true } },
    data: { publishedAt: new Date(iso) },
  });
}

/** slug və ya (başlıq + tarix sahəsi) üzrə artıq varmı. */
async function exists(strapi: Core.Strapi, uid: string, slug: string, title: string, dateField: string, date: string): Promise<boolean> {
  const docs = docsOf(strapi, uid);
  const bySlug = await docs.findFirst({ locale: 'az', status: 'draft', filters: { slug }, fields: ['id'] });
  if (bySlug) return true;
  const byTitle = await docs.findFirst({ locale: 'az', status: 'draft', filters: { title, [dateField]: date }, fields: ['id'] });
  return Boolean(byTitle);
}

/** Fayl: yüklənən id + ünvan; alınmasa null (LegacyUnreachable yuxarı ötürülür). */
async function fileOrNull(strapi: Core.Strapi, path: string, name: string, alt: string, misses: string[]): Promise<{ id: number; url: string } | null> {
  try {
    return await importLegacyFile(strapi, path, name, alt);
  } catch (e) {
    if (e instanceof LegacyUnreachable) throw e;
    misses.push(`${path} (${(e as Error).message})`);
    return null;
  }
}

async function importNews(strapi: Core.Strapi, offline: boolean): Promise<string> {
  const misses: string[] = [];
  let made = 0;
  let skipped = 0;
  let files = 0;

  for (const a of IMPORT_ARTICLES) {
    const uid = 'api::article.article';
    const day = a.date.slice(0, 10);
    if (await exists(strapi, uid, a.slug, a.title, 'newsDate', day)) {
      skipped++;
      continue;
    }
    const id = a.legacy.split('/')[1];
    let cover: number | null = null;
    const gallery: number[] = [];
    if (!offline) {
      const c = await fileOrNull(strapi, a.hero, `xeber-${id}-qapaq`, a.title, misses);
      if (c) {
        cover = c.id;
        files++;
      }
      for (let i = 0; i < a.gallery.length; i++) {
        const g = await fileOrNull(strapi, a.gallery[i], `xeber-${id}-foto-${String(i + 1).padStart(2, '0')}`, a.title, misses);
        if (g) {
          gallery.push(g.id);
          files++;
        }
      }
    }
    const doc = await docsOf(strapi, uid).create({
      locale: 'az',
      status: 'published',
      data: {
        title: a.title,
        slug: a.slug,
        body: a.body,
        category: 'xeber',
        newsDate: day,
        visibility: 'academy',
        showOnHome: false,
        homeStatus: 'none',
        cover,
        gallery,
      },
    });
    await keepPublishedAt(strapi, uid, String(doc.documentId), a.date);
    made++;
    strapi.log.info(`[news] F5.51: xəbər yazıldı — ${a.legacy} → ${a.slug} (foto: ${(cover ? 1 : 0) + gallery.length}/${1 + a.gallery.length}).`);
  }

  for (const n of IMPORT_ANNOUNCEMENTS) {
    const uid = 'api::announcement.announcement';
    if (await exists(strapi, uid, n.slug, n.title, 'publishAt', new Date(n.date).toISOString())) {
      skipped++;
      continue;
    }
    const attachments: number[] = [];
    let body = n.body;
    for (let i = 0; i < n.files.length; i++) {
      const f = n.files[i];
      const up = offline ? null : await fileOrNull(strapi, f.path, f.name, f.label, misses);
      if (up) {
        attachments.push(up.id);
        files++;
      }
      // Yüklənməyibsə keçid köhnə saytdakı faylda qalır.
      body = body.split(`{{file:${i}}}`).join(up ? absUrl(up.url) : legacyUrl(f.path));
    }
    const doc = await docsOf(strapi, uid).create({
      locale: 'az',
      status: 'published',
      data: {
        title: n.title,
        slug: n.slug,
        body,
        importance: 'normal',
        publishAt: n.date,
        visibility: 'academy',
        showOnHome: false,
        homeStatus: 'none',
        attachments,
      },
    });
    await keepPublishedAt(strapi, uid, String(doc.documentId), n.date);
    made++;
    strapi.log.info(`[news] F5.51: elan yazıldı — ${n.legacy} → ${n.slug} (fayl: ${attachments.length}/${n.files.length}).`);
  }

  if (misses.length) {
    strapi.log.warn(`[news] F5.51: köhnə saytdan alınmayan fayllar (${misses.length}): ${misses.slice(0, 8).join('; ')}${misses.length > 8 ? ' …' : ''}`);
  }
  return `xəbər/elan yazıldı: ${made}, artıq vardı: ${skipped}, fayl: ${files}` + (offline ? ' (köhnə sayt əlçatmaz — şəkilsiz)' : '');
}

async function createEvents(strapi: Core.Strapi): Promise<string> {
  const uid = 'api::event.event';
  let made = 0;
  let skipped = 0;
  for (const e of EVENTS_F551) {
    if (await exists(strapi, uid, e.slug, e.title, 'startAt', new Date(e.startAt).toISOString())) {
      skipped++;
      continue;
    }
    await docsOf(strapi, uid).create({
      locale: 'az',
      status: 'published',
      data: {
        title: e.title,
        slug: e.slug,
        excerpt: e.excerpt,
        body: e.body,
        format: e.format,
        startAt: e.startAt,
        endAt: e.endAt,
        venueBuilding: e.venueBuilding,
        venueRoom: e.venueRoom,
        platform: e.platform,
        visibility: 'academy',
        showOnHome: false,
        homeStatus: 'none',
      },
    });
    made++;
  }
  return `tədbir yazıldı: ${made}, artıq vardı: ${skipped}`;
}

async function run(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  const done = async (k: string) => (await store.get({ key: k })) === true;
  const tries = Number((await store.get({ key: TRIES_KEY })) ?? 0);
  const offline = tries >= MAX_TRIES;
  const notes: string[] = [];
  try {
    if (!(await done(CERT_IMAGES_MARKER))) {
      const n = await attachCertImages(strapi, offline);
      notes.push(`sertifikat skanı: ${n}`);
    }
    if (!(await done(NEWS_MARKER))) {
      notes.push(await importNews(strapi, offline));
      await store.set({ key: NEWS_MARKER, value: true });
    }
  } catch (e) {
    if (!(e instanceof LegacyUnreachable)) throw e;
    await store.set({ key: TRIES_KEY, value: tries + 1 });
    strapi.log.warn(
      `[news] F5.51: köhnə sayt əlçatmazdır (${tries + 1}/${MAX_TRIES}): ${e.message} — növbəti başlanğıcda yenidən` +
        (tries + 1 >= MAX_TRIES ? ' (sonra şəkilsiz yaradılacaq).' : '.'),
    );
  }
  // Tədbirlər köhnə saytdan asılı deyil.
  if (!(await done(EVENTS_MARKER))) {
    notes.push(await createEvents(strapi));
    await store.set({ key: EVENTS_MARKER, value: true });
  }
  if (notes.length) strapi.log.info(`[news] F5.51: ${notes.join('; ')}.`);
}

/** Bootstrap-dan çağırılır; işi 8 saniyə sonra arxa planda başladır (port bloklanmır). */
export async function startLegacyImportF551(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-admin' });
  const pending: string[] = [];
  for (const k of [CERT_IMAGES_MARKER, NEWS_MARKER, EVENTS_MARKER]) {
    if ((await store.get({ key: k })) !== true) pending.push(k);
  }
  if (!pending.length) return;
  strapi.log.info(`[news] F5.51: köhnə saytdan idxal və tədbirlər (${pending.join(', ')}) ARXA PLANDA başlayır — port bloklanmır.`);
  setTimeout(() => {
    void run(strapi).catch((e: Error) => strapi.log.error('[news] F5.51: ' + e.message));
  }, 8000);
}
