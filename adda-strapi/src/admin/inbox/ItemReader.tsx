/**
 * F5.38 — oxu paneli: müraciət / düzəliş təklifi / tədbir qeydiyyatı.
 *
 * Content Manager-in redaktə formasından fərqli olaraq burada mətn oxumaq
 * üçün düzülüb: başlıq, göndərən kartı, mətn (sətir sonları qorunur),
 * əlavə faylın birbaşa önizləməsi, bir kliklə status dəyişikliyi.
 */
import * as React from 'react';
import { Badge, Box, Button, Field, Flex, Loader, LinkButton, Textarea, Typography } from '@strapi/design-system';
import { ArrowRight, Check, Mail, Pencil, Phone } from '@strapi/icons';
import { useNotification } from '@strapi/strapi/admin';
import { Link } from 'react-router-dom';
import { styled } from 'styled-components';
import { AttachmentPreview } from './AttachmentPreview';
import { refreshInboxSummary } from './store';
import {
  APPEAL_TYPE_LABEL,
  appealSender,
  editPath,
  fmtDateTime,
  inboxApi,
  itemTitle,
  KIND_LABEL,
  publicUrl,
  STATUS_META,
  statusMeta,
  TARGET_LABEL,
  type InboxFile,
  type InboxItem,
  type Kind,
} from './shared';

const s = (v: unknown): string => (typeof v === 'string' ? v : '');

const Message = styled.div`
  max-width: 76ch;
  font-size: 1.5rem;
  line-height: 1.75;
  color: ${({ theme }) => theme.colors.neutral800};
  white-space: pre-wrap;
  overflow-wrap: anywhere;
`;

const Label = styled(Typography).attrs({ variant: 'sigma', textColor: 'neutral600' })`
  display: block;
  margin-bottom: 0.6rem;
`;

const Value = styled(Box)`
  font-size: 1.4rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.neutral800};
  white-space: pre-wrap;
  overflow-wrap: anywhere;
`;

const Compare = styled.div<{ $single?: boolean }>`
  display: grid;
  grid-template-columns: ${({ $single }) => ($single ? '1fr' : '1fr 1fr')};
  gap: 1.2rem;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Plain = styled.a`
  font-size: 1.4rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.primary600};
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box paddingTop={6}>
      <Label>{title}</Label>
      {children}
    </Box>
  );
}

function StatusBadge({ item }: { item: Pick<InboxItem, 'kind' | 'status'> }) {
  const meta = statusMeta(item);
  if (!meta) return null;
  return (
    <Badge variant={meta.tone} size="M">
      {meta.label}
    </Badge>
  );
}

function StatusBar({
  item,
  statuses,
  canUpdate,
  busy,
  onChange,
}: {
  item: InboxItem;
  statuses: string[] | null;
  canUpdate: boolean;
  busy: string | null;
  onChange: (status: string) => void;
}) {
  if (!statuses || !canUpdate) return null;
  const labels = STATUS_META[item.kind];
  return (
    <Flex gap={2} wrap="wrap" alignItems="center">
      <Typography variant="pi" fontWeight="bold" textColor="neutral600" style={{ marginRight: '0.4rem' }}>
        Status:
      </Typography>
      {statuses.map((st) => {
        const current = item.status === st;
        return (
          <Button
            key={st}
            size="S"
            variant={current ? 'default' : 'tertiary'}
            startIcon={current ? <Check /> : undefined}
            loading={busy === st}
            disabled={current || busy !== null}
            onClick={() => onChange(st)}
          >
            {labels[st]?.label ?? st}
          </Button>
        );
      })}
    </Flex>
  );
}

function Contact({ email, phone, address }: { email?: string; phone?: string; address?: string }) {
  return (
    <Flex direction="column" alignItems="flex-start" gap={2}>
      {email ? (
        <Flex gap={2} alignItems="center">
          <Mail fill="neutral500" />
          <Plain href={`mailto:${email}`}>{email}</Plain>
        </Flex>
      ) : null}
      {phone ? (
        <Flex gap={2} alignItems="center">
          <Phone fill="neutral500" />
          <Plain href={`tel:${phone.replace(/[^+\d]/g, '')}`}>{phone}</Plain>
        </Flex>
      ) : null}
      {address ? (
        <Typography variant="omega" textColor="neutral700">
          {address}
        </Typography>
      ) : null}
    </Flex>
  );
}

// ── Müraciət ─────────────────────────────────────────────────────────────────

function AppealNote({ item, canUpdate }: { item: InboxItem; canUpdate: boolean }) {
  const { toggleNotification } = useNotification();
  const [note, setNote] = React.useState(s(item.internalNote));
  const [saving, setSaving] = React.useState(false);
  const dirty = note !== s(item.internalNote);
  React.useEffect(() => setNote(s(item.internalNote)), [item.documentId, item.internalNote]);
  if (!canUpdate && !note) return null;
  const save = async () => {
    setSaving(true);
    try {
      await inboxApi.setNote(item.documentId, note);
      item.internalNote = note;
      toggleNotification({ type: 'success', message: 'Daxili qeyd yadda saxlanıldı.' });
    } catch {
      toggleNotification({ type: 'danger', message: 'Qeyd yadda saxlanılmadı.' });
    } finally {
      setSaving(false);
    }
  };
  return (
    <Section title="Daxili qeyd (yalnız admin görür)">
      <Field.Root name="internalNote">
        <Textarea
          value={note}
          disabled={!canUpdate}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
          placeholder="Məs.: dekanlığa göndərildi, cavab gözlənilir."
        />
      </Field.Root>
      {canUpdate ? (
        <Box paddingTop={2}>
          <Button size="S" variant="secondary" disabled={!dirty} loading={saving} onClick={save}>
            Qeydi yadda saxla
          </Button>
        </Box>
      ) : null}
    </Section>
  );
}

function AppealBody({ item, canUpdate }: { item: InboxItem; canUpdate: boolean }) {
  const unit = item.targetUnit as { name?: string } | null | undefined;
  const person = item.assignedTo as { displayName?: string; name?: string } | null | undefined;
  const file = item.attachment as InboxFile | null | undefined;
  const type = APPEAL_TYPE_LABEL[s(item.appealType)] ?? s(item.appealType);
  const mailSubject = `Re: ${s(item.subject)}${item.trackingCode ? ` [${s(item.trackingCode)}]` : ''}`;
  return (
    <>
      <Flex gap={2} wrap="wrap" alignItems="center">
        <Badge>{type}</Badge>
        <Badge variant={item.isFormal ? 'secondary' : 'neutral'}>{item.isFormal ? 'Rəsmi müraciət' : 'Qeyri-rəsmi sorğu'}</Badge>
        <StatusBadge item={item} />
      </Flex>
      <Box paddingTop={3}>
        <Typography variant="alpha" tag="h2">
          {s(item.subject) || 'Mövzusuz müraciət'}
        </Typography>
      </Box>
      <Box paddingTop={2}>
        <Typography variant="pi" textColor="neutral600">
          {[s(item.trackingCode), fmtDateTime(item.submittedAt || item.createdAt), unit?.name ? `→ ${unit.name}` : '']
            .filter(Boolean)
            .join(' · ')}
        </Typography>
      </Box>

      <Section title="Göndərən">
        <Box hasRadius background="neutral100" padding={4}>
          <Typography variant="delta" tag="p">
            {appealSender(item)}
          </Typography>
          <Box paddingTop={3}>
            <Contact email={s(item.email)} phone={s(item.phone)} address={s(item.address)} />
          </Box>
        </Box>
      </Section>

      <Section title="Müraciətin mətni">
        <Message>{s(item.message)}</Message>
      </Section>

      {file?.url ? (
        <Section title="Əlavə fayl">
          <AttachmentPreview file={file} />
        </Section>
      ) : null}

      {item.respondedAt || person ? (
        <Section title="İcra">
          <Typography variant="omega" textColor="neutral700">
            {[person ? `Məsul: ${person.displayName || person.name}` : '', item.respondedAt ? `Cavablanıb: ${fmtDateTime(item.respondedAt)}` : '']
              .filter(Boolean)
              .join(' · ')}
          </Typography>
        </Section>
      ) : null}

      <Box paddingTop={6}>
        <Flex gap={2} wrap="wrap">
          {s(item.email) ? (
            <LinkButton
              variant="secondary"
              startIcon={<Mail />}
              href={`mailto:${s(item.email)}?subject=${encodeURIComponent(mailSubject)}`}
            >
              E-poçtla cavab yaz
            </LinkButton>
          ) : null}
        </Flex>
      </Box>

      <AppealNote item={item} canUpdate={canUpdate} />
    </>
  );
}

// ── Düzəliş təklifi ──────────────────────────────────────────────────────────

function CorrectionBody({ item }: { item: InboxItem }) {
  const identity = item.identity as { email?: string; displayName?: string; verifiedAt?: string } | null | undefined;
  const url = publicUrl(item.targetType, item.targetSlug);
  const sender = s(item.submitterName) || s(identity?.displayName);
  const email = s(item.submitterEmail) || s(identity?.email);
  return (
    <>
      <Flex gap={2} wrap="wrap" alignItems="center">
        <Badge>{TARGET_LABEL[s(item.targetType)] ?? s(item.targetType)}</Badge>
        {item.verified ? <Badge variant="success">E-poçt təsdiqlənib</Badge> : null}
        <StatusBadge item={item} />
      </Flex>
      <Box paddingTop={3}>
        <Typography variant="alpha" tag="h2">
          {itemTitle(item)}
        </Typography>
      </Box>
      <Box paddingTop={2}>
        <Typography variant="pi" textColor="neutral600">
          {[s(item.targetSlug), fmtDateTime(item.createdAt)].filter(Boolean).join(' · ')}
        </Typography>
        {url ? (
          <Box paddingTop={2}>
            <LinkButton size="S" variant="tertiary" endIcon={<ArrowRight />} href={url} target="_blank" rel="noreferrer">
              Saytdakı səhifəni aç
            </LinkButton>
          </Box>
        ) : null}
      </Box>

      <Section title="Təklif olunan düzəliş">
        <Compare $single={!s(item.currentValue)}>
          {s(item.currentValue) ? (
            <Box hasRadius background="neutral100" padding={4}>
              <Label>Hazırkı</Label>
              <Value>{s(item.currentValue)}</Value>
            </Box>
          ) : null}
          <Box hasRadius background="success100" padding={4}>
            <Label>Təklif olunan</Label>
            <Value>{s(item.suggestedValue)}</Value>
          </Box>
        </Compare>
      </Section>

      {s(item.reason) ? (
        <Section title="Səbəb">
          <Message>{s(item.reason)}</Message>
        </Section>
      ) : null}

      <Section title="Göndərən">
        {sender || email ? (
          <Flex direction="column" alignItems="flex-start" gap={2}>
            {sender ? (
              <Typography variant="delta" tag="p">
                {sender}
              </Typography>
            ) : null}
            <Contact email={email} />
          </Flex>
        ) : (
          <Typography variant="omega" textColor="neutral600">
            Anonim
          </Typography>
        )}
      </Section>

      {s(item.moderatorNote) ? (
        <Section title="Moderator qeydi">
          <Message>{s(item.moderatorNote)}</Message>
        </Section>
      ) : null}
    </>
  );
}

// ── Tədbir qeydiyyatı ────────────────────────────────────────────────────────

function RsvpBody({ item }: { item: InboxItem }) {
  const url = publicUrl('event', item.eventSlug);
  const guests = typeof item.guests === 'number' ? item.guests : 0;
  return (
    <>
      <Flex gap={2} wrap="wrap" alignItems="center">
        <Badge>{KIND_LABEL.rsvp.one}</Badge>
        {item.verified ? <Badge variant="success">E-poçt təsdiqlənib</Badge> : null}
        <StatusBadge item={item} />
      </Flex>
      <Box paddingTop={3}>
        <Typography variant="alpha" tag="h2">
          {s(item.eventTitle) || s(item.eventSlug)}
        </Typography>
      </Box>
      <Box paddingTop={2}>
        <Typography variant="pi" textColor="neutral600">
          {fmtDateTime(item.createdAt)}
        </Typography>
        {url ? (
          <Box paddingTop={2}>
            <LinkButton size="S" variant="tertiary" endIcon={<ArrowRight />} href={url} target="_blank" rel="noreferrer">
              Tədbir səhifəsini aç
            </LinkButton>
          </Box>
        ) : null}
      </Box>
      <Section title="İştirakçı">
        <Box hasRadius background="neutral100" padding={4}>
          <Typography variant="delta" tag="p">
            {s(item.name)}
          </Typography>
          <Box paddingTop={3}>
            <Contact email={s(item.email)} />
          </Box>
          <Box paddingTop={3}>
            <Typography variant="omega" textColor="neutral700">
              {guests > 0 ? `Özü ilə ${guests} qonaq` : 'Qonaqsız'}
            </Typography>
          </Box>
        </Box>
      </Section>
      {s(item.note) ? (
        <Section title="Qeyd">
          <Message>{s(item.note)}</Message>
        </Section>
      ) : null}
    </>
  );
}

// ── Konteyner ────────────────────────────────────────────────────────────────

export function ItemReader({
  kind,
  documentId,
  onChanged,
}: {
  kind: Kind;
  documentId: string;
  onChanged?: (item: InboxItem) => void;
}) {
  const { toggleNotification } = useNotification();
  const [state, setState] = React.useState<{
    loading: boolean;
    error: boolean;
    item: InboxItem | null;
    statuses: string[] | null;
    canUpdate: boolean;
  }>({ loading: true, error: false, item: null, statuses: null, canUpdate: false });
  const [busy, setBusy] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    setState((st) => ({ ...st, loading: true, error: false }));
    inboxApi
      .item(kind, documentId)
      .then((r) => {
        if (alive) setState({ loading: false, error: false, item: r.item, statuses: r.statuses, canUpdate: r.canUpdate });
      })
      .catch(() => {
        if (alive) setState((st) => ({ ...st, loading: false, error: true, item: null }));
      });
    return () => {
      alive = false;
    };
  }, [kind, documentId]);

  const changeStatus = async (status: string) => {
    const item = state.item;
    if (!item) return;
    setBusy(status);
    try {
      const r = await inboxApi.setStatus(kind, documentId, status);
      const next: InboxItem = r.item ? { ...item, ...r.item, kind } : { ...item, status };
      setState((st) => ({ ...st, item: next }));
      onChanged?.(next);
      void refreshInboxSummary();
      toggleNotification({ type: 'success', message: `Status: ${STATUS_META[kind][status]?.label ?? status}` });
    } catch {
      toggleNotification({ type: 'danger', message: 'Status dəyişdirilmədi.' });
    } finally {
      setBusy(null);
    }
  };

  if (state.loading) {
    return (
      <Flex justifyContent="center" padding={10}>
        <Loader small>Yüklənir…</Loader>
      </Flex>
    );
  }
  if (state.error || !state.item) {
    return (
      <Box padding={8}>
        <Typography textColor="danger600">Qeyd açılmadı. Silinmiş ola bilər və ya icazəniz yoxdur.</Typography>
      </Box>
    );
  }

  const item = state.item;
  return (
    <Box lang="az">
      <Flex justifyContent="space-between" alignItems="flex-start" gap={4} wrap="wrap">
        <StatusBar item={item} statuses={state.statuses} canUpdate={state.canUpdate} busy={busy} onChange={changeStatus} />
        <LinkButton size="S" variant="tertiary" startIcon={<Pencil />} tag={Link} to={editPath(kind, documentId)}>
          Content Manager-də aç
        </LinkButton>
      </Flex>
      <Box paddingTop={6}>
        {kind === 'appeal' ? <AppealBody item={item} canUpdate={state.canUpdate} /> : null}
        {kind === 'correction' ? <CorrectionBody item={item} /> : null}
        {kind === 'rsvp' ? <RsvpBody item={item} /> : null}
      </Box>
    </Box>
  );
}
