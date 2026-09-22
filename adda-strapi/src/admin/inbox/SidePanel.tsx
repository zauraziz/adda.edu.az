/**
 * F5.38 — Content Manager redaktə səhifəsinin yan paneli (müraciət,
 * düzəliş təklifi, tədbir qeydiyyatı üçün).
 *
 *   - HƏQİQİ status + bir kliklə dəyişmə. CM formasındakı `status` sahəsi
 *     Strapi 5-in ayrılmış adı ilə toqquşur (boş görünür, yadda saxlamır) —
 *     ona görə status buradan idarə olunur.
 *   - Əlavə fayl: kiçik önizləmə, «Bax» (modal), «Yeni vərəqdə aç», «Yüklə».
 *   - «Oxu görünüşündə aç» — Bildirişlər səhifəsində eyni qeyd.
 */
import * as React from 'react';
import { Badge, Box, Button, Divider, Flex, LinkButton, Loader, Typography } from '@strapi/design-system';
import { Eye } from '@strapi/icons';
import { useNotification } from '@strapi/strapi/admin';
import type { PanelComponent } from '@strapi/content-manager/strapi-admin';
import { Link } from 'react-router-dom';
import { AttachmentPreview } from './AttachmentPreview';
import { refreshInboxSummary } from './store';
import { inboxApi, inboxPath, KIND_LABEL, STATUS_META, statusMeta, UID_KIND, type InboxFile, type InboxItem, type Kind } from './shared';

function SidePanelContent({ kind, documentId }: { kind: Kind; documentId: string }) {
  const { toggleNotification } = useNotification();
  const [item, setItem] = React.useState<InboxItem | null>(null);
  const [statuses, setStatuses] = React.useState<string[] | null>(null);
  const [canUpdate, setCanUpdate] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    inboxApi
      .item(kind, documentId)
      .then((r) => {
        if (!alive) return;
        setItem(r.item);
        setStatuses(r.statuses);
        setCanUpdate(r.canUpdate);
      })
      .catch(() => alive && setItem(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [kind, documentId]);

  if (loading) {
    return (
      <Flex justifyContent="center" padding={2}>
        <Loader small>Yüklənir…</Loader>
      </Flex>
    );
  }
  if (!item) return null;

  const meta = statusMeta(item);
  const file = kind === 'appeal' ? (item.attachment as InboxFile | null | undefined) : null;

  const change = async (st: string) => {
    setBusy(st);
    try {
      const r = await inboxApi.setStatus(kind, documentId, st);
      setItem((prev) => (prev ? { ...prev, ...(r.item ?? {}), status: st, kind } : prev));
      void refreshInboxSummary();
      toggleNotification({ type: 'success', message: `Status: ${STATUS_META[kind][st]?.label ?? st}` });
    } catch {
      toggleNotification({ type: 'danger', message: 'Status dəyişdirilmədi.' });
    } finally {
      setBusy(null);
    }
  };

  return (
    <Flex lang="az" direction="column" alignItems="stretch" gap={4} width="100%">
      <Flex direction="column" alignItems="flex-start" gap={2}>
        <Typography variant="pi" textColor="neutral600">
          {kind === 'rsvp' ? 'İştirak' : 'Status'}
        </Typography>
        {meta ? <Badge variant={meta.tone}>{meta.label}</Badge> : <Typography variant="pi">—</Typography>}
      </Flex>

      {statuses && canUpdate ? (
        <Flex gap={1} wrap="wrap">
          {statuses
            .filter((st) => st !== item.status)
            .map((st) => (
              <Button key={st} size="S" variant="tertiary" loading={busy === st} disabled={busy !== null} onClick={() => change(st)}>
                {STATUS_META[kind][st]?.label ?? st}
              </Button>
            ))}
        </Flex>
      ) : null}

      {file?.url ? (
        <>
          <Divider />
          <Box>
            <Typography variant="pi" textColor="neutral600" tag="p" style={{ marginBottom: '0.8rem' }}>
              Əlavə fayl
            </Typography>
            <AttachmentPreview file={file} variant="compact" />
          </Box>
        </>
      ) : null}

      <Divider />
      <LinkButton size="S" variant="secondary" startIcon={<Eye />} tag={Link} to={inboxPath(kind, documentId)} fullWidth>
        Oxu görünüşündə aç
      </LinkButton>
      <Typography variant="pi" textColor="neutral500">
        {KIND_LABEL[kind].one} — status buradan və «Bildirişlər» səhifəsindən dəyişdirilir.
      </Typography>
    </Flex>
  );
}

export const InboxSidePanel: PanelComponent = ({ model, documentId }) => {
  const kind = UID_KIND[model];
  if (!kind || !documentId) return null;
  return {
    title: KIND_LABEL[kind].one,
    content: <SidePanelContent kind={kind} documentId={documentId} />,
  };
};
