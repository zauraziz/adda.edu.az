/**
 * F5.38 — admin ana səhifəsində «Bildirişlər» vidceti: növlər üzrə
 * baxılmamış sayı + son 5 baxılmamış qeyd (konkret qeydə keçidlə).
 */
import * as React from 'react';
import { Badge, Box, Flex, Typography } from '@strapi/design-system';
import { Widget } from '@strapi/strapi/admin';
import { Link } from 'react-router-dom';
import { styled } from 'styled-components';
import { useInboxSummary } from './store';
import { fmtRelative, inboxApi, inboxPath, itemFrom, itemTitle, KIND_LABEL, KINDS, type InboxItem } from './shared';

const Row = styled(Link)`
  display: block;
  padding: 0.8rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral150};
  text-decoration: none;
  color: inherit;
  &:last-child {
    border-bottom: 0;
  }
  &:hover span[data-title] {
    text-decoration: underline;
  }
`;

const Title = styled.span`
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 1.4rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.neutral800};
`;

export const InboxWidget = () => {
  const { summary, error } = useInboxSummary();
  const [latest, setLatest] = React.useState<InboxItem[] | null>(null);
  const total = summary?.total ?? 0;

  React.useEffect(() => {
    let alive = true;
    inboxApi
      .list({ filter: 'new', limit: 5 })
      .then((r) => alive && setLatest(r.items))
      .catch(() => alive && setLatest([]));
    return () => {
      alive = false;
    };
  }, [total]);

  if (!summary) return error ? <Widget.Error>Bildirişlər yüklənmədi.</Widget.Error> : <Widget.Loading />;

  return (
    <Flex lang="az" direction="column" alignItems="stretch" gap={4} width="100%">
      <Flex gap={2} wrap="wrap">
        {KINDS.filter((k) => summary.kinds[k]).map((k) => {
          const n = summary.kinds[k]?.new ?? 0;
          return (
            <Badge key={k} variant={n > 0 ? 'primary' : 'neutral'}>
              {KIND_LABEL[k].many}: {n}
            </Badge>
          );
        })}
      </Flex>
      {latest && latest.length ? (
        <Box>
          {latest.map((it) => (
            <Row key={`${it.kind}:${it.documentId}`} to={inboxPath(it.kind, it.documentId)}>
              <Title data-title>{itemTitle(it)}</Title>
              <Typography variant="pi" textColor="neutral600">
                {KIND_LABEL[it.kind].short} · {itemFrom(it)} · {fmtRelative(it.createdAt)}
              </Typography>
            </Row>
          ))}
        </Box>
      ) : (
        <Typography variant="omega" textColor="neutral600">
          {total > 0 ? '' : 'Baxılmamış qeyd yoxdur.'}
        </Typography>
      )}
    </Flex>
  );
};
