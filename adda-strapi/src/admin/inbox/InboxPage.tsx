/**
 * F5.38 — «Bildirişlər» səhifəsi (/admin/bildirisler).
 *
 * Solda gələn qeydlər (yenidən köhnəyə, baxılmamışlar qalın + nöqtə),
 * sağda seçilmiş qeydin oxu paneli. Seçim URL-dədir (?kind=&id=) — toast
 * və ana səhifə vidcetindən birbaşa konkret qeydə keçid işləyir.
 *
 * Dar ekranda (≤1100px) iki sütun sığmır: ya siyahı, ya oxu paneli
 * göstərilir («Siyahıya qayıt» ilə geri). Əks halda oxu paneli uzun
 * siyahının ALTINA düşür və seçilən qeyd görünmür.
 */
import * as React from 'react';
import { Badge, Box, Button, Flex, Loader, Typography } from '@strapi/design-system';
import { ArrowClockwise, ArrowLeft, Paperclip } from '@strapi/icons';
import { Layouts, Page } from '@strapi/strapi/admin';
import { useSearchParams } from 'react-router-dom';
import { styled } from 'styled-components';
import { ItemReader } from './ItemReader';
import { refreshInboxSummary, useInboxSummary } from './store';
import {
  fmtCount,
  fmtRelative,
  inboxApi,
  itemFrom,
  itemSnippet,
  itemTitle,
  KIND_LABEL,
  KINDS,
  statusMeta,
  type InboxItem,
  type Kind,
} from './shared';

type Tab = Kind | 'all';
const PAGE = 30;
const NARROW_QUERY = '(max-width: 1100px)';

function useNarrow(): boolean {
  const read = () => (typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia(NARROW_QUERY).matches : false);
  const [narrow, setNarrow] = React.useState(read);
  React.useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia(NARROW_QUERY);
    const onChange = () => setNarrow(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return narrow;
}

const Columns = styled.div`
  display: grid;
  grid-template-columns: minmax(30rem, 42rem) minmax(0, 1fr);
  gap: 2.4rem;
  align-items: start;
  @media (max-width: 1100px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Panel = styled.div`
  background: ${({ theme }) => theme.colors.neutral0};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.shadows.tableShadow};
  overflow: hidden;
`;

const ReaderPanel = styled(Panel)`
  padding: 3.2rem;
  min-height: 32rem;
  @media (min-width: 1101px) {
    position: sticky;
    top: 2.4rem;
    max-height: calc(100vh - 4.8rem);
    overflow-y: auto;
  }
`;

const RowButton = styled.button<{ $selected: boolean }>`
  display: block;
  width: 100%;
  padding: 1.4rem 1.6rem 1.4rem 2.4rem;
  position: relative;
  border: 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral150};
  background: ${({ theme, $selected }) => ($selected ? theme.colors.primary100 : 'transparent')};
  text-align: left;
  cursor: pointer;
  font: inherit;
  &:hover {
    background: ${({ theme, $selected }) => ($selected ? theme.colors.primary100 : theme.colors.neutral100)};
  }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary600};
    outline-offset: -2px;
  }
`;

const NewDot = styled.span`
  position: absolute;
  left: 0.9rem;
  top: 1.9rem;
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary600};
`;

const OneLine = styled(Typography)`
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

function ListRow({ item, selected, showKind, onSelect }: { item: InboxItem; selected: boolean; showKind: boolean; onSelect: () => void }) {
  const meta = statusMeta(item);
  const hasFile = Boolean(item.attachment);
  return (
    <RowButton type="button" $selected={selected} onClick={onSelect} aria-current={selected ? 'true' : undefined}>
      {item.isNew ? <NewDot aria-label="baxılmamış" /> : null}
      <Flex justifyContent="space-between" alignItems="baseline" gap={3}>
        <OneLine variant="omega" fontWeight={item.isNew ? 'bold' : 'semiBold'} textColor="neutral800">
          {itemTitle(item)}
        </OneLine>
        <Typography variant="pi" textColor="neutral500" style={{ whiteSpace: 'nowrap' }}>
          {fmtRelative(item.createdAt)}
        </Typography>
      </Flex>
      <Flex justifyContent="space-between" alignItems="center" gap={3} paddingTop={1}>
        <OneLine variant="pi" textColor="neutral600">
          {showKind ? `${KIND_LABEL[item.kind].short} · ` : ''}
          {itemFrom(item)}
        </OneLine>
        <Flex gap={2} alignItems="center">
          {hasFile ? <Paperclip width="1.4rem" height="1.4rem" fill="neutral500" aria-label="əlavə var" /> : null}
          {meta ? (
            <Badge size="S" variant={meta.tone}>
              {meta.label}
            </Badge>
          ) : null}
        </Flex>
      </Flex>
      <Box paddingTop={1}>
        <OneLine variant="pi" textColor="neutral500">
          {itemSnippet(item)}
        </OneLine>
      </Box>
    </RowButton>
  );
}

function TabButton({ active, label, count, onClick }: { active: boolean; label: string; count: number; onClick: () => void }) {
  return (
    <Button size="S" variant={active ? 'secondary' : 'tertiary'} onClick={onClick} aria-pressed={active}>
      {label}
      {count > 0 ? ` · ${fmtCount(count)}` : ''}
    </Button>
  );
}

export const InboxPage = () => {
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as Tab) || 'all';
  const onlyNew = params.get('new') === '1';
  const selKind = params.get('kind') as Kind | null;
  const selId = params.get('id');
  const { summary } = useInboxSummary();
  const narrow = useNarrow();

  const [items, setItems] = React.useState<InboxItem[]>([]);
  const [hasMore, setHasMore] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [reloadKey, setReloadKey] = React.useState(0);

  const setParam = React.useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(params);
      for (const [k, v] of Object.entries(patch)) {
        if (v === null) next.delete(k);
        else next.set(k, v);
      }
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  // Siyahı: tab / «yalnız yenilər» dəyişəndə təzədən.
  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(false);
    inboxApi
      .list({ kind: tab, filter: onlyNew ? 'new' : 'all', limit: PAGE })
      .then((r) => {
        if (!alive) return;
        setItems(r.items);
        setHasMore(r.hasMore);
      })
      .catch(() => alive && setError(true))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [tab, onlyNew, reloadKey]);

  // Admin bu səhifədə ikən yeni qeyd gəlibsə (sayğac dövrü görür) — siyahını
  // təzələ. Yalnız ən yeni tarix ARTANDA: status dəyişikliyi siyahını sıfırlamasın.
  const newestSeen = React.useRef<Partial<Record<Kind, string>> | null>(null);
  React.useEffect(() => {
    if (!summary) return;
    const prev = newestSeen.current;
    const next: Partial<Record<Kind, string>> = { ...(prev ?? {}) };
    let grew = false;
    for (const k of KINDS) {
      const at = summary.kinds[k]?.latest?.createdAt ?? '';
      if (at > (next[k] ?? '')) {
        if (prev) grew = true;
        next[k] = at;
      }
    }
    newestSeen.current = next;
    if (grew) setReloadKey((n) => n + 1);
  }, [summary]);

  // Heç nə seçilməyibsə — ilk qeyd (yalnız geniş ekranda; darda siyahı görünür).
  React.useEffect(() => {
    if (!narrow && !selId && items.length) setParam({ kind: items[0].kind, id: items[0].documentId });
  }, [items, selId, setParam, narrow]);

  // Dar ekranda qeyd seçiləndə oxu paneli səhifənin başından görünsün.
  React.useEffect(() => {
    if (narrow && selId) window.scrollTo({ top: 0 });
  }, [narrow, selId]);

  // Tədbir qeydiyyatları: siyahısı açılanda / biri seçiləndə «baxılıb».
  React.useEffect(() => {
    if (tab === 'rsvp' || selKind === 'rsvp') {
      inboxApi
        .markRsvpSeen()
        .then(() => refreshInboxSummary())
        .catch(() => undefined);
    }
  }, [tab, selKind, selId]);

  const loadMore = async () => {
    const last = items[items.length - 1];
    if (!last) return;
    setLoading(true);
    try {
      const r = await inboxApi.list({ kind: tab, filter: onlyNew ? 'new' : 'all', limit: PAGE, before: last.createdAt });
      setItems((prev) => [...prev, ...r.items]);
      setHasMore(r.hasMore);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const onChanged = React.useCallback((changed: InboxItem) => {
    setItems((prev) =>
      prev.map((it) =>
        it.kind === changed.kind && it.documentId === changed.documentId
          ? { ...it, status: changed.status, isNew: Boolean(changed.isNew) }
          : it,
      ),
    );
  }, []);

  const counts = summary?.kinds ?? {};
  const total = summary?.total ?? 0;
  const available: Kind[] = summary ? KINDS.filter((k) => counts[k] !== undefined) : KINDS;

  return (
    <Page.Main lang="az">
      <Page.Title>Bildirişlər</Page.Title>
      <Layouts.Header
        title="Bildirişlər"
        subtitle={
          total > 0
            ? `Baxılmamış: ${total}. Vətəndaş müraciətləri, düzəliş təklifləri və tədbir qeydiyyatları bir yerdə.`
            : 'Vətəndaş müraciətləri, düzəliş təklifləri və tədbir qeydiyyatları bir yerdə.'
        }
        primaryAction={
          <Button
            variant="secondary"
            startIcon={<ArrowClockwise />}
            onClick={() => {
              setReloadKey((k) => k + 1);
              void refreshInboxSummary();
            }}
          >
            Yenilə
          </Button>
        }
      />
      <Layouts.Content>
        <Flex justifyContent="space-between" alignItems="center" gap={4} wrap="wrap" paddingBottom={4}>
          <Flex gap={2} wrap="wrap">
            <TabButton active={tab === 'all'} label="Hamısı" count={total} onClick={() => setParam({ tab: null, kind: null, id: null })} />
            {available.map((k) => (
              <TabButton
                key={k}
                active={tab === k}
                label={KIND_LABEL[k].many}
                count={counts[k]?.new ?? 0}
                onClick={() => setParam({ tab: k, kind: null, id: null })}
              />
            ))}
          </Flex>
          <Flex gap={2}>
            <Button size="S" variant={onlyNew ? 'tertiary' : 'secondary'} onClick={() => setParam({ new: null, kind: null, id: null })}>
              Bütün qeydlər
            </Button>
            <Button size="S" variant={onlyNew ? 'secondary' : 'tertiary'} onClick={() => setParam({ new: '1', kind: null, id: null })}>
              Yalnız baxılmamış
            </Button>
          </Flex>
        </Flex>

        <Columns>
          {!narrow || !selId ? (
            <Panel>
              {error ? (
                <Box padding={6}>
                  <Typography textColor="danger600">Siyahı yüklənmədi.</Typography>
                </Box>
              ) : null}
              {!error && !loading && items.length === 0 ? (
                <Box padding={8}>
                  <Typography variant="omega" textColor="neutral600">
                    {onlyNew ? 'Baxılmamış qeyd yoxdur.' : 'Hələ heç nə daxil olmayıb.'}
                  </Typography>
                </Box>
              ) : null}
              {items.map((it) => (
                <ListRow
                  key={`${it.kind}:${it.documentId}`}
                  item={it}
                  showKind={tab === 'all'}
                  selected={selKind === it.kind && selId === it.documentId}
                  onSelect={() => setParam({ kind: it.kind, id: it.documentId })}
                />
              ))}
              {loading ? (
                <Flex justifyContent="center" padding={6}>
                  <Loader small>Yüklənir…</Loader>
                </Flex>
              ) : null}
              {!loading && hasMore ? (
                <Flex justifyContent="center" padding={4}>
                  <Button variant="tertiary" onClick={loadMore}>
                    Daha çox göstər
                  </Button>
                </Flex>
              ) : null}
            </Panel>
          ) : null}

          {!narrow || selId ? (
            <ReaderPanel>
              {narrow ? (
                <Box paddingBottom={4}>
                  <Button size="S" variant="tertiary" startIcon={<ArrowLeft />} onClick={() => setParam({ kind: null, id: null })}>
                    Siyahıya qayıt
                  </Button>
                </Box>
              ) : null}
              {selKind && selId ? (
                <ItemReader key={`${selKind}:${selId}`} kind={selKind} documentId={selId} onChanged={onChanged} />
              ) : (
                <Typography variant="omega" textColor="neutral600">
                  Oxumaq üçün soldan bir qeyd seçin.
                </Typography>
              )}
            </ReaderPanel>
          ) : null}
        </Columns>
      </Layouts.Content>
    </Page.Main>
  );
};

export default InboxPage;
