/**
 * F5.39 — redaktə səhifəsinin yan paneli: bu səhifənin məsul redaktoru.
 * Baş admin buradan dəyişir (təyinat məktubu gedir); digərləri yalnız görür.
 * Qeydi dəyişə bilməyən istifadəçiyə əvvəlcədən xəbərdarlıq göstərilir
 * (şərtli icazədə Strapi sahələri açıq saxlayır, server isə rədd edir).
 * Səhifələr, struktur bölmələr, ixtisaslar, fakültələr, heyət, obyektlər,
 * qəhrəmanlar və sabiq rektorlar üçün (bax src/utils/page-owners.ts KIND_UID).
 */
import * as React from 'react';
import { Box, Flex, LinkButton, Loader, SingleSelect, SingleSelectOption, Typography } from '@strapi/design-system';
import { ExternalLink } from '@strapi/icons';
import { useNotification } from '@strapi/strapi/admin';
import type { PanelComponent } from '@strapi/content-manager/strapi-admin';
import { ownersApi, siteUrl, type RecordOwner } from './api';

const OWNED_UIDS = new Set([
  'api::page.page', 'api::unit.unit', 'api::program.program', 'api::faculty.faculty', 'api::person.person',
  'api::facility.facility', 'api::hero.hero', 'api::rector.rector',
]);

function OwnerPanelContent({ uid, documentId }: { uid: string; documentId: string }) {
  const { toggleNotification } = useNotification();
  const [data, setData] = React.useState<RecordOwner | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    ownersApi
      .forRecord(uid, documentId)
      .then((r) => alive && setData(r))
      .catch(() => alive && setData({ ok: false, key: null }));
    return () => {
      alive = false;
    };
  }, [uid, documentId]);

  if (!data) {
    return (
      <Flex justifyContent="center" padding={2}>
        <Loader small>Yüklənir…</Loader>
      </Flex>
    );
  }
  if (!data.key || !data.path) {
    return (
      <Typography variant="pi" textColor="neutral600">
        Ünvan (slug) yazılıb yadda saxlanandan sonra məsul təyin etmək olar.
      </Typography>
    );
  }

  const change = async (v: string | number) => {
    const editorId = v === '' || v === undefined ? null : Number(v);
    setBusy(true);
    try {
      await ownersApi.assign(data.path as string, data.label || data.path || '', editorId);
      const e = data.editors?.find((x) => x.id === editorId);
      setData({ ...data, editorId, editorName: e?.name ?? null });
      toggleNotification({ type: 'success', message: editorId === null ? 'Məsul götürüldü.' : `Məsul: ${e?.name ?? ''}. Məktub göndərilir.` });
    } catch {
      toggleNotification({ type: 'danger', message: 'Təyin olunmadı.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Flex lang="az" direction="column" alignItems="stretch" gap={3} width="100%">
      {data.isSuperAdmin ? (
        <SingleSelect
          size="S"
          aria-label="Məsul redaktor"
          placeholder="Təyin olunmayıb"
          value={data.editorId == null ? undefined : String(data.editorId)}
          disabled={busy}
          onChange={(v: string | number) => void change(v)}
          onClear={data.editorId == null ? undefined : () => void change('')}
          clearLabel="Məsulu götür"
        >
          {(data.editors ?? []).map((e) => (
            <SingleSelectOption key={e.id} value={String(e.id)}>
              {e.name}
            </SingleSelectOption>
          ))}
        </SingleSelect>
      ) : (
        <Typography fontWeight="semiBold">{data.editorName ?? 'Təyin olunmayıb'}</Typography>
      )}
      {data.canEdit === false ? (
        <Box background="warning100" borderColor="warning200" hasRadius padding={3}>
          <Typography variant="pi" textColor="warning700" tag="p">
            Bu səhifə sizə təyin olunmayıb: baxa bilərsiniz, amma dəyişiklik yadda saxlanmayacaq.
          </Typography>
        </Box>
      ) : null}
      <Box>
        <Typography variant="pi" textColor="neutral600" tag="p">
          Məsul redaktor bu səhifəni dəyişə bilir; adı saytda səhifənin altında görünür.
        </Typography>
      </Box>
      <LinkButton size="S" variant="tertiary" endIcon={<ExternalLink />} href={siteUrl(data.path)} target="_blank" rel="noreferrer">
        Saytda bax
      </LinkButton>
    </Flex>
  );
}

export const OwnerSidePanel: PanelComponent = ({ model, documentId }) => {
  if (!OWNED_UIDS.has(model) || !documentId) return null;
  return {
    title: 'Məsul redaktor',
    content: <OwnerPanelContent uid={model} documentId={documentId} />,
  };
};
