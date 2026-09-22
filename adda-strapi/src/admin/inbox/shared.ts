/**
 * F5.38 — «Bildirişlər»: ortaq tiplər, etiketlər, API çağırışları, formatlama.
 *
 * Server tərəfi: src/utils/admin-inbox.ts (/adda-inbox/* admin marşrutları).
 * Content Manager API-si İŞLƏDİLMİR: `status` sahəsi Strapi 5-in ayrılmış
 * adı ilə toqquşur və CM onu göstərmir/dəyişə bilmir (bax server faylı).
 */
import { getFetchClient } from '@strapi/strapi/admin';

export type Kind = 'appeal' | 'correction' | 'rsvp';
export const KINDS: Kind[] = ['appeal', 'correction', 'rsvp'];

export const KIND_UID: Record<Kind, string> = {
  appeal: 'api::appeal.appeal',
  correction: 'api::correction.correction',
  rsvp: 'api::rsvp.rsvp',
};
export const UID_KIND: Record<string, Kind> = {
  'api::appeal.appeal': 'appeal',
  'api::correction.correction': 'correction',
  'api::rsvp.rsvp': 'rsvp',
};

export const KIND_LABEL: Record<Kind, { one: string; many: string; short: string }> = {
  appeal: { one: 'Vətəndaş müraciəti', many: 'Müraciətlər', short: 'Müraciət' },
  correction: { one: 'Düzəliş təklifi', many: 'Düzəliş təklifləri', short: 'Düzəliş' },
  rsvp: { one: 'Tədbir qeydiyyatı', many: 'Tədbir qeydiyyatları', short: 'Qeydiyyat' },
};

export type BadgeTone = 'success' | 'primary' | 'danger' | 'warning' | 'neutral' | 'secondary' | 'alternative';

export const STATUS_META: Record<Kind, Record<string, { label: string; tone: BadgeTone }>> = {
  appeal: {
    yeni: { label: 'Yeni', tone: 'primary' },
    baxilir: { label: 'Baxılır', tone: 'warning' },
    cavablandi: { label: 'Cavablandı', tone: 'success' },
    bagli: { label: 'Bağlı', tone: 'neutral' },
  },
  correction: {
    pending: { label: 'Gözləyir', tone: 'primary' },
    approved: { label: 'Təsdiqləndi', tone: 'success' },
    rejected: { label: 'Rədd edildi', tone: 'danger' },
    applied: { label: 'Tətbiq olundu', tone: 'neutral' },
  },
  rsvp: {
    going: { label: 'Gələcək', tone: 'success' },
    maybe: { label: 'Bəlkə', tone: 'warning' },
    declined: { label: 'Gəlməyəcək', tone: 'neutral' },
  },
};

export const APPEAL_TYPE_LABEL: Record<string, string> = {
  sual: 'Sual',
  teklif: 'Təklif',
  erize: 'Ərizə',
  sikayet: 'Şikayət',
};

export const TARGET_LABEL: Record<string, string> = {
  article: 'Xəbər',
  announcement: 'Elan',
  event: 'Tədbir',
  milestone: 'Tarix mərhələsi',
  person: 'Əməkdaş',
  page: 'Səhifə',
  general: 'Ümumi',
};

/** Düzəliş vidcetinin sahə seçimi (CorrectionIsland: title | body | other). */
export const FIELD_LABEL: Record<string, string> = {
  title: 'başlıq',
  body: 'mətn',
  other: 'digər',
};

/** İctimai saytın ünvanı (düzəliş/qeydiyyat hədəfinə keçid üçün). */
export const SITE_URL = 'https://demo.adda.edu.az';

export function publicUrl(targetType: unknown, slug: unknown): string | null {
  const s = typeof slug === 'string' && slug ? encodeURIComponent(slug) : '';
  switch (targetType) {
    case 'article':
      return s ? `${SITE_URL}/az/xeberler/${s}` : null;
    case 'announcement':
      return s ? `${SITE_URL}/az/elanlar/${s}` : null;
    case 'event':
      return s ? `${SITE_URL}/az/tedbirler/${s}` : null;
    case 'person':
      return s ? `${SITE_URL}/az/emekdas/${s}` : null;
    case 'page':
      return s ? `${SITE_URL}/az/sehife/${s}` : null;
    case 'milestone':
      return `${SITE_URL}/az/tarix`;
    default:
      return null;
  }
}

/** Content Manager-də redaktə səhifəsi (admin daxilində, react-router yolu). */
export function editPath(kind: Kind, documentId: string): string {
  return `/content-manager/collection-types/${KIND_UID[kind]}/${documentId}`;
}

/** Bildirişlər səhifəsi / konkret qeyd — admin daxilində react-router yolu. */
export function inboxPath(kind?: Kind, documentId?: string): string {
  const q = kind && documentId ? `?kind=${kind}&id=${encodeURIComponent(documentId)}` : '';
  return `/bildirisler${q}`;
}

// ── Tiplər ────────────────────────────────────────────────────────────────────

export interface InboxFile {
  id?: number;
  name?: string;
  url?: string;
  mime?: string;
  ext?: string;
  /** Strapi fayl ölçüsünü KB ilə saxlayır. */
  size?: number;
  width?: number | null;
  height?: number | null;
}

export interface InboxItem {
  kind: Kind;
  documentId: string;
  createdAt: string;
  updatedAt?: string;
  status?: string | null;
  isNew: boolean;
  [key: string]: unknown;
}

export interface KindSummary {
  new: number;
  latest: InboxItem | null;
}

export interface Summary {
  ok: boolean;
  total: number;
  kinds: Partial<Record<Kind, KindSummary>>;
  serverTime: string;
}

export interface ListResponse {
  ok: boolean;
  items: InboxItem[];
  hasMore: boolean;
  kinds: Kind[];
}

export interface ItemResponse {
  ok: boolean;
  item: InboxItem;
  statuses: string[] | null;
  canUpdate: boolean;
}

// ── API ───────────────────────────────────────────────────────────────────────

export const inboxApi = {
  async summary(): Promise<Summary> {
    const { get } = getFetchClient();
    return (await get<Summary>('/adda-inbox/summary')).data;
  },
  async list(params: { kind?: Kind | 'all'; filter?: 'new' | 'all'; limit?: number; before?: string }): Promise<ListResponse> {
    const { get } = getFetchClient();
    return (await get<ListResponse>('/adda-inbox/items', { params })).data;
  },
  async item(kind: Kind, documentId: string): Promise<ItemResponse> {
    const { get } = getFetchClient();
    return (await get<ItemResponse>(`/adda-inbox/items/${kind}/${encodeURIComponent(documentId)}`)).data;
  },
  async setStatus(kind: Kind, documentId: string, status: string): Promise<{ ok: boolean; item: InboxItem | null }> {
    const { put } = getFetchClient();
    return (await put(`/adda-inbox/items/${kind}/${encodeURIComponent(documentId)}/status`, { status })).data;
  },
  async setNote(documentId: string, internalNote: string): Promise<{ ok: boolean }> {
    const { put } = getFetchClient();
    return (await put(`/adda-inbox/items/appeal/${encodeURIComponent(documentId)}/note`, { internalNote })).data;
  },
  async markRsvpSeen(): Promise<{ ok: boolean }> {
    const { post } = getFetchClient();
    return (await post('/adda-inbox/seen/rsvp', {})).data;
  },
};

// ── Formatlama ────────────────────────────────────────────────────────────────

const str = (v: unknown): string => (typeof v === 'string' ? v : '');

export function appealSender(item: InboxItem): string {
  return [str(item.lastName), str(item.firstName), str(item.patronymic)].filter(Boolean).join(' ');
}

export function itemTitle(item: InboxItem): string {
  if (item.kind === 'appeal') return str(item.subject) || 'Mövzusuz müraciət';
  if (item.kind === 'correction') {
    const target = TARGET_LABEL[str(item.targetType)] || 'Düzəliş';
    const field = str(item.fieldPath);
    return field ? `${target}: ${FIELD_LABEL[field] ?? field}` : target;
  }
  return str(item.eventTitle) || str(item.eventSlug) || 'Tədbir';
}

export function itemFrom(item: InboxItem): string {
  if (item.kind === 'appeal') return appealSender(item) || str(item.email);
  if (item.kind === 'correction') {
    const identity = item.identity as { email?: string; displayName?: string } | null | undefined;
    return str(item.submitterName) || str(item.submitterEmail) || str(identity?.displayName) || str(identity?.email) || 'Anonim';
  }
  return str(item.name) || str(item.email);
}

export function itemSnippet(item: InboxItem): string {
  if (item.kind === 'appeal') return str(item.message);
  if (item.kind === 'correction') {
    const cur = str(item.currentValue);
    return cur ? `${cur} → ${str(item.suggestedValue)}` : str(item.suggestedValue);
  }
  const guests = typeof item.guests === 'number' && item.guests > 0 ? ` · +${item.guests} qonaq` : '';
  return `${STATUS_META.rsvp[str(item.status)]?.label ?? ''}${guests}`;
}

export function statusMeta(item: Pick<InboxItem, 'kind' | 'status'>): { label: string; tone: BadgeTone } | null {
  const s = str(item.status);
  return s ? STATUS_META[item.kind][s] ?? null : null;
}

const MONTHS_AZ = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];

/** «22 sentyabr 2026, 15:26» — Intl-in `az` dəstəyindən asılı olmadan. */
export function fmtDateTime(iso: unknown): string {
  if (typeof iso !== 'string' || !iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()} ${MONTHS_AZ[d.getMonth()]} ${d.getFullYear()}, ${hh}:${mm}`;
}

/** «5 dəq əvvəl», «3 saat əvvəl», «dünən», əks halda tarix. */
export function fmtRelative(iso: unknown, now: number = Date.now()): string {
  if (typeof iso !== 'string' || !iso) return '';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const diff = Math.max(0, now - t);
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'indicə';
  if (min < 60) return `${min} dəq əvvəl`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} saat əvvəl`;
  const days = Math.floor(h / 24);
  if (days === 1) return 'dünən';
  if (days < 7) return `${days} gün əvvəl`;
  const d = new Date(t);
  return `${d.getDate()} ${MONTHS_AZ[d.getMonth()]}${d.getFullYear() !== new Date(now).getFullYear() ? ' ' + d.getFullYear() : ''}`;
}

/** Strapi `size` KB-dır. */
export function fmtSize(kb: unknown): string {
  if (typeof kb !== 'number' || !Number.isFinite(kb) || kb <= 0) return '';
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1).replace('.', ',')} MB`;
}

export type FileKind = 'image' | 'pdf' | 'word' | 'other';

export function fileKind(file: InboxFile | null | undefined): FileKind {
  const mime = str(file?.mime).toLowerCase();
  const ext = str(file?.ext).toLowerCase();
  if (mime.startsWith('image/')) return 'image';
  if (mime === 'application/pdf' || ext === '.pdf') return 'pdf';
  if (mime.includes('word') || mime === 'application/msword' || ext === '.doc' || ext === '.docx') return 'word';
  return 'other';
}

/**
 * Cloudinary şəkil/PDF faylını «yüklə» rejimində açan URL (`fl_attachment`).
 * `raw` fayllar (DOC/DOCX) çevrilmə bayrağı qəbul etmir və brauzer onları
 * onsuz da yükləyir — onlar və Cloudinary olmayan ünvanlar olduğu kimi qalır.
 */
export function downloadUrl(url: string): string {
  const m = url.match(/^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/);
  return m ? `${m[1]}fl_attachment/${m[2]}` : url;
}

export function fmtCount(n: number): string {
  return n > 99 ? '99+' : String(n);
}
