/**
 * F5.38 — Admin «Bildirişlər» API-si (yalnız admin panel, admin JWT ilə).
 *
 * Niyə Content Manager API-si yox:
 *   Strapi 5-də `status` sənədin qaralama/nəşr vəziyyəti üçün AYRILMIŞ
 *   addır. `appeal.status`, `correction.status`, `rsvp.status` sahələri bu
 *   adla toqquşur: Content Manager siyahıda dəyəri «published» ilə ƏVƏZ
 *   edir, redaktə səhifəsində ümumiyyətlə göstərmir, `PUT {status:"baxilir"}`
 *   isə 400 «Invalid status» qaytarır (lokal Strapi 5.50-də yoxlanılıb).
 *   Document Service-də isə sahə normal işləyir (oxu, filtr, yeniləmə) —
 *   bu API ona söykənir. Sahənin adını dəyişmək məlumat miqrasiyası tələb
 *   edərdi (Neon), ona görə toxunulmayıb.
 *
 * Marşrutlar (prefiks /adda-inbox, `type: 'admin'` — admin girişi məcburi):
 *   GET  /summary                         yeni sayları + hər növün ən son yenisi
 *   GET  /items?kind=&filter=&limit=&before=   birləşmiş siyahı (yenidən köhnəyə)
 *   GET  /items/:kind/:documentId         tam qeyd (əlavə, bölmə, kimlik)
 *   PUT  /items/:kind/:documentId/status  iş axını statusu
 *   PUT  /items/appeal/:documentId/note   müraciətin daxili qeydi
 *   POST /seen/rsvp                       tədbir qeydiyyatlarını «baxılıb» say
 *
 * «Yeni» nə deməkdir:
 *   müraciət — status «yeni»; düzəliş — status «pending» (hər ikisi
 *   yaradılarkən lifecycle-da məcburi qoyulur); tədbir qeydiyyatı — iş
 *   axını yoxdur, admin həmin siyahıya SONUNCU dəfə baxandan sonra gələnlər
 *   (vaxt hər admin üçün ayrıca, core store-da saxlanılır).
 *
 * İcazələr: hər növ üçün admin rolunun Content Manager icazəsi yoxlanılır
 * (read — oxu, update — status/qeyd). İcazəsi olmayan növ cavaba DÜŞMÜR.
 */
import type { Core } from '@strapi/strapi';

type Row = Record<string, unknown>;
type Kind = 'appeal' | 'correction' | 'rsvp';

interface KindDef {
  uid: string;
  /** İş axını statusları; `null` — statussuz növ (tədbir qeydiyyatı). */
  statuses: string[] | null;
  newStatus: string | null;
  /** /summary-dəki `latest` üçün — hər dəqiqə sorğulanır, tam qeyd lazım deyil. */
  summaryFields: string[];
  listPopulate: Row;
  detailPopulate: Row;
}

const KINDS: Record<Kind, KindDef> = {
  appeal: {
    uid: 'api::appeal.appeal',
    statuses: ['yeni', 'baxilir', 'cavablandi', 'bagli'],
    newStatus: 'yeni',
    summaryFields: ['subject', 'firstName', 'lastName', 'patronymic', 'email', 'status', 'createdAt'],
    listPopulate: { attachment: { fields: ['name', 'mime'] } },
    detailPopulate: {
      attachment: { fields: ['name', 'url', 'mime', 'ext', 'size', 'width', 'height'] },
      targetUnit: { fields: ['name', 'slug'] },
      assignedTo: { fields: ['name', 'displayName', 'slug'] },
    },
  },
  correction: {
    uid: 'api::correction.correction',
    statuses: ['pending', 'approved', 'rejected', 'applied'],
    newStatus: 'pending',
    summaryFields: ['targetType', 'fieldPath', 'submitterName', 'submitterEmail', 'status', 'createdAt'],
    listPopulate: {},
    detailPopulate: { identity: { fields: ['email', 'displayName', 'verifiedAt'] } },
  },
  rsvp: {
    uid: 'api::rsvp.rsvp',
    statuses: null,
    newStatus: null,
    summaryFields: ['eventTitle', 'eventSlug', 'name', 'email', 'status', 'createdAt'],
    listPopulate: {},
    detailPopulate: { identity: { fields: ['email', 'displayName', 'verifiedAt'] } },
  },
};

const KIND_ORDER: Kind[] = ['appeal', 'correction', 'rsvp'];
const MAX_LIMIT = 50;
/** Tədbir qeydiyyatına heç baxmamış admin üçün «yeni» pəncərəsi. */
const RSVP_DEFAULT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

interface AdminCtx {
  params: Record<string, string>;
  query: Record<string, unknown>;
  request: { body?: unknown };
  state: {
    user?: { id?: number | string };
    userAbility?: {
      can: (action: string, subject?: string) => boolean;
      rulesFor?: (action: string, subject: string) => { inverted?: boolean; conditions?: unknown }[];
    };
  };
  body: unknown;
  status: number;
}

function isKind(v: unknown): v is Kind {
  return typeof v === 'string' && (KIND_ORDER as string[]).indexOf(v) !== -1;
}

/**
 * Rolun Content Manager icazəsi. ŞƏRTLİ icazə (məs. Author rolunun «yalnız öz
 * yaratdığı» qaydası) burada tətbiq oluna bilmir — bu API bütün qeydləri
 * qaytarır — ona görə yalnız ŞƏRTSİZ icazə sayılır (Super Admin, Editor).
 */
function can(ctx: AdminCtx, action: 'read' | 'update', uid: string): boolean {
  const ability = ctx.state.userAbility;
  if (!ability || typeof ability.can !== 'function') return false;
  const act = 'plugin::content-manager.explorer.' + action;
  try {
    if (!ability.can(act, uid)) return false;
    if (typeof ability.rulesFor !== 'function') return true;
    return ability.rulesFor(act, uid).some((r) => !r.inverted && !r.conditions);
  } catch {
    return false;
  }
}

function fail(ctx: AdminCtx, status: number, error: string): void {
  ctx.status = status;
  ctx.body = { ok: false, error };
}

function bodyOf(ctx: AdminCtx): Row {
  const b = ctx.request.body;
  return b && typeof b === 'object' && !Array.isArray(b) ? (b as Row) : {};
}

export function registerAdminInbox(strapi: Core.Strapi): void {
  // Tip dəqiqliyi burada lazım deyil: sahə adları KINDS-dən gəlir, UID-lər sabitdir.
  const docs = (uid: string) =>
    strapi.documents(uid as Parameters<typeof strapi.documents>[0]) as unknown as {
      count: (a: Row) => Promise<number>;
      findMany: (a: Row) => Promise<Row[]>;
      findOne: (a: Row) => Promise<Row | null>;
      update: (a: Row) => Promise<Row | null>;
    };
  const store = () => strapi.store({ type: 'plugin', name: 'adda-inbox' });

  const rsvpSeenAt = async (ctx: AdminCtx): Promise<string> => {
    const uid = ctx.state.user?.id;
    if (uid !== undefined) {
      const v = await store().get({ key: 'rsvpSeenAt:' + String(uid) });
      if (typeof v === 'string' && v) return v;
    }
    return new Date(Date.now() - RSVP_DEFAULT_WINDOW_MS).toISOString();
  };

  const newFilter = async (ctx: AdminCtx, kind: Kind): Promise<Row> => {
    const def = KINDS[kind];
    if (def.newStatus) return { status: { $eq: def.newStatus } };
    return { createdAt: { $gt: await rsvpSeenAt(ctx) } };
  };

  const isNew = (kind: Kind, row: Row, seenAt: string | null): boolean => {
    const def = KINDS[kind];
    if (def.newStatus) return row.status === def.newStatus;
    return seenAt !== null && String(row.createdAt) > seenAt;
  };

  const readableKinds = (ctx: AdminCtx): Kind[] => KIND_ORDER.filter((k) => can(ctx, 'read', KINDS[k].uid));

  const shape = (kind: Kind, row: Row, seenAt: string | null): Row => ({
    ...row,
    kind,
    isNew: isNew(kind, row, seenAt),
  });

  // ── GET /summary ───────────────────────────────────────────────────────────
  const summary = async (ctx: AdminCtx) => {
    const kinds: Row = {};
    let total = 0;
    for (const kind of readableKinds(ctx)) {
      const def = KINDS[kind];
      const filters = await newFilter(ctx, kind);
      const count = await docs(def.uid).count({ filters });
      const latest = count
        ? (await docs(def.uid).findMany({ filters, sort: 'createdAt:desc', limit: 1, fields: def.summaryFields }))[0] ?? null
        : null;
      kinds[kind] = { new: count, latest: latest ? shape(kind, latest, null) : null };
      total += count;
    }
    ctx.body = { ok: true, total, kinds, serverTime: new Date().toISOString() };
  };

  // ── GET /items ─────────────────────────────────────────────────────────────
  const list = async (ctx: AdminCtx) => {
    const q = ctx.query;
    const wanted = q.kind === undefined || q.kind === 'all' ? KIND_ORDER : isKind(q.kind) ? [q.kind] : [];
    const kinds = wanted.filter((k) => can(ctx, 'read', KINDS[k].uid));
    const onlyNew = q.filter === 'new';
    const limit = Math.max(1, Math.min(MAX_LIMIT, parseInt(String(q.limit ?? '25'), 10) || 25));
    const before = typeof q.before === 'string' && !Number.isNaN(Date.parse(q.before)) ? q.before : null;
    const seenAt = kinds.indexOf('rsvp') !== -1 ? await rsvpSeenAt(ctx) : null;

    const rows: Row[] = [];
    for (const kind of kinds) {
      const def = KINDS[kind];
      const filters: Row = { ...(onlyNew ? await newFilter(ctx, kind) : {}) };
      if (before) filters.createdAt = { ...((filters.createdAt as Row) || {}), $lt: before };
      // limit + 1: «daha çox var» siqnalı üçün.
      const found = await docs(def.uid).findMany({ filters, sort: 'createdAt:desc', limit: limit + 1, populate: def.listPopulate });
      for (const r of found) rows.push(shape(kind, r, seenAt));
    }
    rows.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    const items = rows.slice(0, limit);
    ctx.body = { ok: true, items, hasMore: rows.length > limit, kinds };
  };

  // ── GET /items/:kind/:documentId ───────────────────────────────────────────
  const getOne = async (ctx: AdminCtx) => {
    const { kind, documentId } = ctx.params;
    if (!isKind(kind)) return fail(ctx, 404, 'unknown_kind');
    const def = KINDS[kind];
    if (!can(ctx, 'read', def.uid)) return fail(ctx, 403, 'forbidden');
    const row = await docs(def.uid).findOne({ documentId, populate: def.detailPopulate });
    if (!row) return fail(ctx, 404, 'not_found');
    const seenAt = kind === 'rsvp' ? await rsvpSeenAt(ctx) : null;
    ctx.body = {
      ok: true,
      item: shape(kind, row, seenAt),
      statuses: def.statuses,
      canUpdate: can(ctx, 'update', def.uid),
    };
  };

  // ── PUT /items/:kind/:documentId/status ────────────────────────────────────
  const setStatus = async (ctx: AdminCtx) => {
    const { kind, documentId } = ctx.params;
    if (!isKind(kind)) return fail(ctx, 404, 'unknown_kind');
    const def = KINDS[kind];
    if (!def.statuses) return fail(ctx, 400, 'no_workflow');
    if (!can(ctx, 'update', def.uid)) return fail(ctx, 403, 'forbidden');
    const status = bodyOf(ctx).status;
    if (typeof status !== 'string' || def.statuses.indexOf(status) === -1) return fail(ctx, 400, 'bad_status');
    const current = await docs(def.uid).findOne({ documentId, fields: ['status', 'respondedAt'] as unknown as Row });
    if (!current) return fail(ctx, 404, 'not_found');
    const data: Row = { status };
    // Müraciət «cavablandı» olanda cavab vaxtı yazılır (artıq varsa saxlanılır,
    // «bağlı»ya keçid də onu saxlayır). Cavabsız vəziyyətə (yeni/baxılır)
    // qaytarılanda — məs. səhvən basılıbsa — cavab vaxtı silinir.
    if (kind === 'appeal' && status === 'cavablandi' && !current.respondedAt) data.respondedAt = new Date().toISOString();
    if (kind === 'appeal' && (status === 'yeni' || status === 'baxilir') && current.respondedAt) data.respondedAt = null;
    await docs(def.uid).update({ documentId, data });
    const row = await docs(def.uid).findOne({ documentId, populate: def.detailPopulate });
    ctx.body = { ok: true, item: row ? shape(kind, row, null) : null };
  };

  // ── PUT /items/appeal/:documentId/note ─────────────────────────────────────
  const setNote = async (ctx: AdminCtx) => {
    const { documentId } = ctx.params;
    const def = KINDS.appeal;
    if (!can(ctx, 'update', def.uid)) return fail(ctx, 403, 'forbidden');
    const note = bodyOf(ctx).internalNote;
    if (typeof note !== 'string') return fail(ctx, 400, 'bad_note');
    const current = await docs(def.uid).findOne({ documentId, fields: ['documentId'] as unknown as Row });
    if (!current) return fail(ctx, 404, 'not_found');
    // Uzunluq/simvol təmizliyi appeal lifecycle-dadır (5000 simvol).
    await docs(def.uid).update({ documentId, data: { internalNote: note } });
    ctx.body = { ok: true };
  };

  // ── POST /seen/rsvp ────────────────────────────────────────────────────────
  const markRsvpSeen = async (ctx: AdminCtx) => {
    const uid = ctx.state.user?.id;
    if (uid === undefined) return fail(ctx, 401, 'no_user');
    const at = new Date().toISOString();
    await store().set({ key: 'rsvpSeenAt:' + String(uid), value: at });
    ctx.body = { ok: true, seenAt: at };
  };

  const auth = { policies: ['admin::isAuthenticatedAdmin'] };
  strapi.server.routes({
    type: 'admin',
    prefix: '/adda-inbox',
    routes: [
      { method: 'GET', path: '/summary', handler: summary, config: auth },
      { method: 'GET', path: '/items', handler: list, config: auth },
      { method: 'GET', path: '/items/:kind/:documentId', handler: getOne, config: auth },
      { method: 'PUT', path: '/items/:kind/:documentId/status', handler: setStatus, config: auth },
      { method: 'PUT', path: '/items/appeal/:documentId/note', handler: setNote, config: auth },
      { method: 'POST', path: '/seen/rsvp', handler: markRsvpSeen, config: auth },
    ],
  } as unknown as Parameters<typeof strapi.server.routes>[0]);
}

// ════════════════════════════════════════════════════════════════════════════
// F5.38 — Content Manager görünüşü (müraciət / düzəliş / tədbir qeydiyyatı)
// ════════════════════════════════════════════════════════════════════════════
//
// BİR DƏFƏ işləyir (core store-da `cmLayout:v1` işarəsi) — sonra admin
// «Configure the view» ilə dəyişsə, ÜSTÜNDƏN YAZILMIR. Bayraq tələb etmir:
// yalnız admin panelinin görünüş ayarlarıdır, məzmuna toxunmur.
//
//   - `status` redaktə formasında GİZLƏDİLİR: Strapi 5-də bu ad ayrılmışdır,
//     CM sahəni boş göstərir və «Invalid status» ilə yadda saxlamağa imkan
//     vermir. Status «Bildirişlər» səhifəsindən / yan paneldən dəyişdirilir.
//   - Sahə adları Azərbaycan dilinə — YALNIZ hələ standart (atribut adı) olanda.
//   - Siyahı: mövzu/göndərən/tarix sütunları, yenidən köhnəyə — YALNIZ standart
//     siyahıda (ilk sütun `id`) və standart sıralamada.
//   - Redaktə forması: mətn tam en, oxu ardıcıllığı — YALNIZ sahələr hələ sxem
//     sırasındadırsa (admin yerlərini dəyişməyibsə).

type EditRow = { name: string; size: number }[];
interface CmConfiguration {
  settings: Row;
  metadatas: Record<string, { edit?: Row; list?: Row }>;
  layouts: { list: string[]; edit: EditRow[] };
}
interface LayoutPlan {
  labels: Record<string, string>;
  hidden: string[];
  list: string[];
  edit: [string, number][][];
}

const LAYOUT_PLANS: Record<string, LayoutPlan> = {
  'api::appeal.appeal': {
    labels: {
      trackingCode: 'İzləmə kodu', appealType: 'Növ', firstName: 'Ad', lastName: 'Soyad', patronymic: 'Ata adı',
      email: 'E-poçt', phone: 'Telefon', address: 'Ünvan', subject: 'Mövzu', message: 'Mətn',
      targetUnit: 'Aidiyyəti bölmə', status: 'Status', isFormal: 'Rəsmi müraciət', submittedAt: 'Göndərilib',
      respondedAt: 'Cavablanıb', attachment: 'Əlavə fayl', internalNote: 'Daxili qeyd', assignedTo: 'Məsul şəxs',
      createdAt: 'Daxil olub',
    },
    hidden: ['status'],
    list: ['trackingCode', 'subject', 'lastName', 'firstName', 'appealType', 'createdAt'],
    edit: [
      [['subject', 8], ['trackingCode', 4]],
      [['message', 12]],
      [['attachment', 6], ['targetUnit', 6]],
      [['lastName', 4], ['firstName', 4], ['patronymic', 4]],
      [['email', 6], ['phone', 6]],
      [['address', 12]],
      [['appealType', 6], ['isFormal', 6]],
      [['submittedAt', 6], ['respondedAt', 6]],
      [['assignedTo', 6]],
      [['internalNote', 12]],
    ],
  },
  'api::correction.correction': {
    labels: {
      targetType: 'Hədəf növü', targetSlug: 'Hədəf (slug)', fieldPath: 'Sahə', currentValue: 'Hazırkı dəyər',
      suggestedValue: 'Təklif olunan dəyər', reason: 'Səbəb', submitterName: 'Göndərən', submitterEmail: 'E-poçt',
      status: 'Status', moderatorNote: 'Moderator qeydi', verified: 'E-poçt təsdiqlənib', identity: 'Kimlik',
      createdAt: 'Daxil olub',
    },
    hidden: ['status'],
    list: ['targetType', 'fieldPath', 'suggestedValue', 'submitterName', 'createdAt'],
    edit: [
      [['targetType', 6], ['targetSlug', 6]],
      [['fieldPath', 12]],
      [['currentValue', 6], ['suggestedValue', 6]],
      [['reason', 12]],
      [['submitterName', 6], ['submitterEmail', 6]],
      [['verified', 6], ['identity', 6]],
      [['moderatorNote', 12]],
    ],
  },
  'api::rsvp.rsvp': {
    labels: {
      eventSlug: 'Tədbir (slug)', eventTitle: 'Tədbir', name: 'Ad Soyad', email: 'E-poçt', status: 'İştirak',
      guests: 'Qonaq sayı', note: 'Qeyd', verified: 'E-poçt təsdiqlənib', identity: 'Kimlik', createdAt: 'Daxil olub',
    },
    hidden: ['status'],
    list: ['eventTitle', 'name', 'email', 'guests', 'createdAt'],
    edit: [
      [['eventTitle', 6], ['eventSlug', 6]],
      [['name', 6], ['email', 6]],
      [['guests', 6], ['verified', 6]],
      [['note', 12]],
      [['identity', 6]],
    ],
  },
};

function schemaOrder(strapi: Core.Strapi, uid: string): string[] {
  const ct = strapi.contentTypes[uid as keyof typeof strapi.contentTypes] as unknown as { attributes: Row } | undefined;
  return ct ? Object.keys(ct.attributes) : [];
}

function mergeLayout(strapi: Core.Strapi, uid: string, conf: CmConfiguration, plan: LayoutPlan): { conf: CmConfiguration; changed: string[] } {
  const changed: string[] = [];
  const metadatas = { ...conf.metadatas };

  for (const [field, label] of Object.entries(plan.labels)) {
    const meta = metadatas[field];
    if (!meta) continue;
    const next = { edit: { ...(meta.edit || {}) }, list: { ...(meta.list || {}) } };
    let touched = false;
    if (meta.edit && (meta.edit.label === field || !meta.edit.label)) { next.edit.label = label; touched = true; }
    if (meta.list && (meta.list.label === field || !meta.list.label)) { next.list.label = label; touched = true; }
    if (touched) metadatas[field] = next;
  }
  if (Object.keys(plan.labels).some((f) => metadatas[f] !== conf.metadatas[f])) changed.push('etiketlər');

  for (const field of plan.hidden) {
    const meta = metadatas[field];
    if (meta?.edit && meta.edit.visible !== false) {
      metadatas[field] = { ...meta, edit: { ...meta.edit, visible: false } };
      changed.push(field + ' gizlədildi');
    }
  }

  let list = conf.layouts.list;
  if (list[0] === 'id') {
    list = plan.list.filter((f) => metadatas[f]);
    changed.push('siyahı sütunları');
  }

  let edit = conf.layouts.edit;
  const flat = edit.flat().map((c) => c.name);
  const order = schemaOrder(strapi, uid).filter((f) => flat.indexOf(f) !== -1);
  const isDefaultOrder = flat.length > 0 && flat.join('|') === order.join('|');
  if (isDefaultOrder) {
    edit = plan.edit
      .map((row) => row.filter(([name]) => metadatas[name] && plan.hidden.indexOf(name) === -1).map(([name, size]) => ({ name, size })))
      .filter((row) => row.length > 0);
    changed.push('redaktə forması');
  } else {
    // Admin yerləri dəyişib — toxunmuruq, yalnız gizlədilən sahəni sıradan çıxarırıq.
    edit = edit.map((row) => row.filter((c) => plan.hidden.indexOf(c.name) === -1)).filter((row) => row.length > 0);
  }

  const settings = { ...conf.settings };
  if (settings.defaultSortBy === settings.mainField || settings.defaultSortBy === 'id') {
    settings.defaultSortBy = 'createdAt';
    settings.defaultSortOrder = 'DESC';
    changed.push('sıralama: yenidən köhnəyə');
  }
  if (settings.pageSize === 10) settings.pageSize = 20;

  return { conf: { ...conf, settings, metadatas, layouts: { list, edit } }, changed };
}

export async function applyInboxLayouts(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'adda-inbox' });
  if ((await store.get({ key: 'cmLayout:v1' })) === true) return;
  const cm = strapi.plugin('content-manager').service('content-types') as unknown as {
    findContentType: (uid: string) => { uid: string } | null;
    findConfiguration: (ct: { uid: string }) => Promise<CmConfiguration>;
    updateConfiguration: (ct: { uid: string }, conf: CmConfiguration) => Promise<unknown>;
  };
  for (const [uid, plan] of Object.entries(LAYOUT_PLANS)) {
    const ct = cm.findContentType(uid);
    if (!ct) continue;
    const current = await cm.findConfiguration(ct);
    const { conf, changed } = mergeLayout(strapi, uid, current, plan);
    const { uid: _drop, ...toStore } = conf as CmConfiguration & { uid?: string };
    await cm.updateConfiguration(ct, toStore as CmConfiguration);
    strapi.log.info(`[adda-inbox] CM görünüşü (${uid}): ${changed.length ? changed.join(', ') : 'dəyişiklik yoxdur'}`);
  }
  await store.set({ key: 'cmLayout:v1', value: true });
}
