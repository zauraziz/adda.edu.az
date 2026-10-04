/**
 * F5.39 — «Məsul redaktorlar» (/admin/mesul-redaktorlar).
 *
 * Baş admin: menyudakı bütün səhifələr, hər birinə məsul redaktor seçir;
 *            «Xatırlatma göndər» — məzmun gözləyən səhifələr barədə məktub.
 * Redaktor:  «Mənim səhifələrim» — yalnız özünə təyin olunanlar.
 *
 * /admin/mesul-redaktorlar/ac?key=… — məktubdakı «Məzmun əlavə et» keçidi:
 * hazırlanır səhifəsi üçün qaralama yaradır və redaktə formasını açır.
 */
import * as React from 'react';
import {
  Badge,
  Box,
  Button,
  Dialog,
  Flex,
  LinkButton,
  Loader,
  Searchbar,
  SingleSelect,
  SingleSelectOption,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Typography,
} from '@strapi/design-system';
import { ExternalLink, Mail, Pencil, Plus } from '@strapi/icons';
import { Layouts, Page, useNotification } from '@strapi/strapi/admin';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { editPath, NEEDS_CONTENT, ownersApi, siteUrl, STATUS_META, type EditorOption, type OwnerPage, type PagesResponse } from './api';

type Filter = 'all' | 'needs' | 'unassigned';

const groupOf = (p: OwnerPage): string => p.trail.filter(Boolean).join(' › ') || 'Digər';

function OpenRedirect({ keyParam }: { keyParam: string }) {
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => {
    let alive = true;
    ownersApi
      .open(keyParam)
      .then((t) => alive && navigate(editPath(t), { replace: true }))
      .catch((e: { response?: { data?: { error?: string } } }) => {
        const code = e?.response?.data?.error;
        if (!alive) return;
        setError(
          code === 'not_owner'
            ? 'Bu səhifə sizə təyin olunmayıb. Baş adminə müraciət edin.'
            : code === 'not_editable'
              ? 'Bu səhifə kodla qurulub — admindən redaktə olunmur.'
              : 'Səhifə açılmadı.',
        );
      });
    return () => {
      alive = false;
    };
  }, [keyParam, navigate]);
  return (
    <Page.Main lang="az">
      <Layouts.Content>
        <Box paddingTop={10}>
          {error ? (
            <Flex direction="column" alignItems="flex-start" gap={4}>
              <Typography variant="beta" tag="p">
                {error}
              </Typography>
              <Button variant="secondary" onClick={() => navigate('/mesul-redaktorlar', { replace: true })}>
                Səhifələrə qayıt
              </Button>
            </Flex>
          ) : (
            <Loader>Səhifə açılır…</Loader>
          )}
        </Box>
      </Layouts.Content>
    </Page.Main>
  );
}

function OwnerSelect({ page, editors, busy, onAssign }: { page: OwnerPage; editors: EditorOption[]; busy: boolean; onAssign: (id: number | null) => void }) {
  const sorted = [...editors].sort((a, b) => Number(b.isEditor) - Number(a.isEditor) || a.name.localeCompare(b.name, 'az'));
  return (
    <SingleSelect
      size="S"
      aria-label={`${page.label} — məsul redaktor`}
      placeholder="Təyin olunmayıb"
      value={page.editorId === null ? undefined : String(page.editorId)}
      disabled={busy}
      onChange={(v: string | number) => onAssign(Number(v))}
      onClear={page.editorId === null ? undefined : () => onAssign(null)}
      clearLabel="Məsulu götür"
    >
      {sorted.map((e) => (
        <SingleSelectOption key={e.id} value={String(e.id)}>
          {e.isEditor ? e.name : `${e.name} (${(e.roles ?? []).join(', ') || 'rol yoxdur'})`}
        </SingleSelectOption>
      ))}
    </SingleSelect>
  );
}

export const OwnersPage = () => {
  const location = useLocation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { toggleNotification } = useNotification();
  const openKey = location.pathname.replace(/\/+$/, '').endsWith('/ac') ? params.get('key') : null;

  const [data, setData] = React.useState<PagesResponse | null>(null);
  const [error, setError] = React.useState(false);
  const [busyKey, setBusyKey] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState<Filter>('all');
  const [editorFilter, setEditorFilter] = React.useState<string>('');
  const [confirm, setConfirm] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  const load = React.useCallback(() => {
    setError(false);
    ownersApi
      .pages()
      .then(setData)
      .catch(() => setError(true));
  }, []);

  React.useEffect(() => {
    if (!openKey) load();
  }, [load, openKey]);

  if (openKey) return <OpenRedirect keyParam={openKey} />;

  const sup = Boolean(data?.isSuperAdmin);
  const pages = data?.pages ?? [];
  const q = query.trim().toLocaleLowerCase('az');
  const shown = pages.filter((p) => {
    if (filter === 'needs' && !NEEDS_CONTENT.includes(p.status)) return false;
    if (filter === 'unassigned' && p.editorId !== null) return false;
    if (editorFilter && String(p.editorId ?? '') !== editorFilter) return false;
    if (q && !`${p.label} ${p.path} ${groupOf(p)}`.toLocaleLowerCase('az').includes(q)) return false;
    return true;
  });
  const groups: [string, OwnerPage[]][] = [];
  for (const p of shown) {
    const g = groupOf(p);
    const last = groups[groups.length - 1];
    if (last && last[0] === g) last[1].push(p);
    else groups.push([g, [p]]);
  }
  const needs = pages.filter((p) => NEEDS_CONTENT.includes(p.status)).length;
  const unassigned = pages.filter((p) => p.editorId === null).length;

  const assign = async (page: OwnerPage, editorId: number | null) => {
    setBusyKey(page.key);
    try {
      const r = await ownersApi.assign(page.path, page.label, editorId);
      const editor = data?.editors.find((e) => e.id === editorId);
      setData((d) =>
        d ? { ...d, pages: d.pages.map((p) => (p.key === page.key ? { ...p, editorId, editorName: editor?.name ?? null, assignedAt: new Date().toISOString() } : p)) } : d,
      );
      toggleNotification({
        type: 'success',
        message: editorId === null ? `«${page.label}»: məsul götürüldü.` : `«${page.label}» → ${editor?.name ?? ''}${r.changed ? '. Məktub göndərilir.' : '.'}`,
      });
    } catch (e) {
      const code = (e as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toggleNotification({ type: 'danger', message: code === 'editor_inactive' ? 'Bu istifadəçi aktiv deyil.' : 'Təyin olunmadı.' });
    } finally {
      setBusyKey(null);
    }
  };

  const openPage = async (page: OwnerPage) => {
    setBusyKey(page.key);
    try {
      const t = await ownersApi.open(page.key);
      navigate(editPath(t));
    } catch {
      toggleNotification({ type: 'danger', message: 'Səhifə açılmadı.' });
      setBusyKey(null);
    }
  };

  const sendNow = async () => {
    setSending(true);
    try {
      const r = await ownersApi.notify();
      toggleNotification({
        type: 'success',
        message: r.editors ? `${r.editors} redaktora ${r.pages} səhifə barədə məktub göndərildi.` : 'Məzmun gözləyən təyin olunmuş səhifə yoxdur.',
      });
    } catch {
      toggleNotification({ type: 'danger', message: 'Məktublar göndərilmədi.' });
    } finally {
      setSending(false);
      setConfirm(false);
    }
  };

  const title = data && !sup ? 'Mənim səhifələrim' : 'Məsul redaktorlar';
  const subtitle = !data
    ? ''
    : sup
      ? `Menyuda ${pages.length} səhifə · məsulu olmayan: ${unassigned} · məzmun gözləyən: ${needs}. Redaktor yalnız ona təyin olunan səhifəni dəyişə bilir.`
      : `Sizə təyin olunan ${pages.length} səhifə · məzmun gözləyən: ${needs}. Adınız bu səhifələrin altında göstərilir.`;

  return (
    <Page.Main lang="az">
      <Page.Title>{title}</Page.Title>
      <Layouts.Header
        title={title}
        subtitle={subtitle}
        primaryAction={
          sup ? (
            <Button startIcon={<Mail />} variant="secondary" onClick={() => setConfirm(true)}>
              Xatırlatma göndər
            </Button>
          ) : undefined
        }
      />
      <Layouts.Content>
        {error ? (
          <Typography textColor="danger600">Siyahı yüklənmədi.</Typography>
        ) : !data ? (
          <Flex justifyContent="center" padding={10}>
            <Loader>Yüklənir…</Loader>
          </Flex>
        ) : (
          <>
            <Flex gap={3} wrap="wrap" alignItems="center" paddingBottom={4}>
              <Box width="28rem">
                <Searchbar
                  name="q"
                  size="S"
                  value={query}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                  onClear={() => setQuery('')}
                  clearLabel="Təmizlə"
                  placeholder="Səhifə adı və ya ünvanı"
                >
                  Axtar
                </Searchbar>
              </Box>
              <Flex gap={2}>
                {(
                  [
                    ['all', 'Hamısı'],
                    ['needs', `Məzmun gözləyir · ${needs}`],
                    ...(sup ? [['unassigned', `Məsulu yoxdur · ${unassigned}`]] : []),
                  ] as [Filter, string][]
                ).map(([f, l]) => (
                  <Button key={f} size="S" variant={filter === f ? 'secondary' : 'tertiary'} onClick={() => setFilter(f)}>
                    {l}
                  </Button>
                ))}
              </Flex>
              {sup ? (
                <Box width="24rem">
                  <SingleSelect
                    size="S"
                    aria-label="Redaktor filtri"
                    placeholder="Bütün redaktorlar"
                    value={editorFilter || undefined}
                    onChange={(v: string | number) => setEditorFilter(String(v ?? ''))}
                    onClear={editorFilter ? () => setEditorFilter('') : undefined}
                    clearLabel="Filtri təmizlə"
                  >
                    {data.editors.map((e) => (
                      <SingleSelectOption key={e.id} value={String(e.id)}>
                        {e.name}
                      </SingleSelectOption>
                    ))}
                  </SingleSelect>
                </Box>
              ) : null}
            </Flex>

            {!shown.length ? (
              <Box padding={8} background="neutral0" hasRadius shadow="tableShadow">
                <Typography textColor="neutral600">{pages.length ? 'Filtrə uyğun səhifə yoxdur.' : sup ? 'Menyuda səhifə tapılmadı.' : 'Sizə hələ səhifə təyin olunmayıb.'}</Typography>
              </Box>
            ) : (
              <Table colCount={4} rowCount={shown.length + 1}>
                <Thead>
                  <Tr>
                    <Th><Typography variant="sigma">Səhifə</Typography></Th>
                    <Th><Typography variant="sigma">Vəziyyət</Typography></Th>
                    <Th><Typography variant="sigma">Məsul redaktor</Typography></Th>
                    <Th><Typography variant="sigma">Əməliyyat</Typography></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {groups.map(([g, list]) => (
                    <React.Fragment key={g}>
                      <Tr>
                        <Td colSpan={4} background="neutral100">
                          <Typography variant="sigma" textColor="neutral700">{g}</Typography>
                        </Td>
                      </Tr>
                      {list.map((p) => {
                        const meta = STATUS_META[p.status];
                        const busy = busyKey === p.key;
                        return (
                          <Tr key={p.key}>
                            <Td style={{ maxWidth: '36rem', whiteSpace: 'normal' }}>
                              <Typography fontWeight="semiBold" tag="div">{p.label}</Typography>
                              <Typography variant="pi" textColor="neutral600">{p.path}</Typography>
                            </Td>
                            <Td>
                              <Badge variant={meta.tone}>{meta.label}</Badge>
                            </Td>
                            <Td style={{ minWidth: '24rem' }}>
                              {sup ? (
                                <OwnerSelect page={p} editors={data.editors} busy={busy} onAssign={(id) => void assign(p, id)} />
                              ) : (
                                <Typography>{p.editorName ?? '—'}</Typography>
                              )}
                            </Td>
                            <Td>
                              <Flex gap={2}>
                                {p.editTarget || p.status === 'missing' ? (
                                  <Button
                                    size="S"
                                    variant={p.status === 'missing' ? 'default' : 'secondary'}
                                    startIcon={p.status === 'missing' ? <Plus /> : <Pencil />}
                                    loading={busy}
                                    onClick={() => void openPage(p)}
                                  >
                                    {p.status === 'missing' ? 'Məzmun əlavə et' : p.status === 'section' ? 'Qeydlər' : 'Redaktə et'}
                                  </Button>
                                ) : null}
                                <LinkButton size="S" variant="tertiary" endIcon={<ExternalLink />} href={siteUrl(p.path)} target="_blank" rel="noreferrer">
                                  Saytda
                                </LinkButton>
                              </Flex>
                            </Td>
                          </Tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </Tbody>
              </Table>
            )}
          </>
        )}
      </Layouts.Content>

      <Dialog.Root open={confirm} onOpenChange={setConfirm}>
        <Dialog.Content>
          <Dialog.Header>Xatırlatma göndərilsin?</Dialog.Header>
          <Dialog.Body>
            <Typography tag="p" textAlign="center">
              Məzmun gözləyən səhifəsi olan hər redaktora öz səhifələrinin siyahısı e-poçtla göndəriləcək. Bu məktub hər bazar ertəsi saat 09:00-da avtomatik də gedir.
            </Typography>
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.Cancel>
              <Button variant="tertiary">Ləğv et</Button>
            </Dialog.Cancel>
            <Button startIcon={<Mail />} loading={sending} onClick={() => void sendNow()}>
              Göndər
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </Page.Main>
  );
};

export default OwnersPage;
