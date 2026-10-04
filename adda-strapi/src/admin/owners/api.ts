/**
 * F5.39 — «Məsul redaktorlar»: admin API çağırışları və ortaq tiplər.
 * Server tərəfi: src/utils/page-owners.ts (/adda-owners/* admin marşrutları).
 */
import { getFetchClient } from '@strapi/strapi/admin';

export type PageStatus = 'ready' | 'empty' | 'draft' | 'missing' | 'section' | 'static';

export interface EditTarget {
  uid: string;
  documentId?: string;
  locale?: string | null;
  list?: boolean;
}

export interface OwnerPage {
  key: string;
  path: string;
  label: string;
  trail: string[];
  status: PageStatus;
  title: string | null;
  editTarget: EditTarget | null;
  editorId: number | null;
  editorName: string | null;
  assignedAt: string | null;
  notifiedAt: string | null;
}

export interface EditorOption {
  id: number;
  name: string;
  email: string;
  roles?: string[];
  isEditor: boolean;
}

export interface PagesResponse {
  ok: boolean;
  isSuperAdmin: boolean;
  pages: OwnerPage[];
  editors: EditorOption[];
}

export interface RecordOwner {
  ok: boolean;
  key: string | null;
  path?: string;
  label?: string | null;
  editorId?: number | null;
  editorName?: string | null;
  isSuperAdmin?: boolean;
  /** Bu istifadəçi qeydi dəyişə bilərmi (serverdə CM icazə yoxlaması). */
  canEdit?: boolean;
  editors?: EditorOption[];
}

export const STATUS_META: Record<PageStatus, { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral' | 'secondary' }> = {
  ready: { label: 'Məzmun var', tone: 'success' },
  empty: { label: 'Mətn boşdur', tone: 'warning' },
  draft: { label: 'Qaralama', tone: 'secondary' },
  missing: { label: 'Hazırlanır', tone: 'danger' },
  section: { label: 'Siyahı bölməsi', tone: 'neutral' },
  static: { label: 'Sabit səhifə', tone: 'neutral' },
};

export const NEEDS_CONTENT: PageStatus[] = ['missing', 'empty', 'draft'];

/** İctimai saytın ünvanı (səhifəyə «Saytda bax» keçidi). */
export const SITE_URL = 'https://demo.adda.edu.az';
export const siteUrl = (path: string): string => `${SITE_URL}/az${path === '/' ? '' : path}`;

/** Admin redaktə/siyahı yolu (react-router). */
export function editPath(t: EditTarget): string {
  const base = `/content-manager/collection-types/${t.uid}`;
  if (t.list || !t.documentId) return base;
  return `${base}/${t.documentId}${t.locale ? `?plugins[i18n][locale]=${t.locale}` : ''}`;
}

export const ownersApi = {
  async pages(): Promise<PagesResponse> {
    const { get } = getFetchClient();
    return (await get<PagesResponse>('/adda-owners/pages')).data;
  },
  async assign(path: string, label: string, editorId: number | null): Promise<{ ok: boolean; changed: boolean }> {
    const { put } = getFetchClient();
    return (await put('/adda-owners/assign', { path, label, editorId })).data;
  },
  async notify(editorId?: number): Promise<{ ok: boolean; editors: number; pages: number }> {
    const { post } = getFetchClient();
    return (await post('/adda-owners/notify', editorId ? { editorId } : {})).data;
  },
  async open(key: string): Promise<EditTarget & { ok: boolean }> {
    const { post } = getFetchClient();
    return (await post('/adda-owners/open', { key })).data;
  },
  async forRecord(uid: string, documentId: string): Promise<RecordOwner> {
    const { get } = getFetchClient();
    return (await get<RecordOwner>('/adda-owners/for-record', { params: { uid, documentId } })).data;
  },
};
