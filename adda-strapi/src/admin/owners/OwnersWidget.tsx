/**
 * F5.39 — ana səhifə vidceti: məzmun gözləyən səhifələrim (redaktor) /
 * məsulu olmayan və məzmun gözləyən səhifələr (baş admin).
 */
import * as React from 'react';
import { Badge, Box, Flex, Typography } from '@strapi/design-system';
import { Widget } from '@strapi/strapi/admin';
import { Link } from 'react-router-dom';
import { styled } from 'styled-components';
import { NEEDS_CONTENT, ownersApi, STATUS_META, type PagesResponse } from './api';

const Row = styled(Link)`
  display: block;
  padding: 0.8rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral150};
  text-decoration: none;
  color: inherit;
  &:last-child {
    border-bottom: 0;
  }
`;

export const OwnersWidget = () => {
  const [data, setData] = React.useState<PagesResponse | null>(null);
  const [error, setError] = React.useState(false);
  React.useEffect(() => {
    ownersApi.pages().then(setData).catch(() => setError(true));
  }, []);
  if (error) return <Widget.Error>Yüklənmədi.</Widget.Error>;
  if (!data) return <Widget.Loading />;
  const needs = data.pages.filter((p) => NEEDS_CONTENT.includes(p.status));
  const unassigned = data.pages.filter((p) => p.editorId === null).length;
  const list = (data.isSuperAdmin ? needs.filter((p) => p.editorId === null) : needs).slice(0, 5);
  return (
    <Flex lang="az" direction="column" alignItems="stretch" gap={3} width="100%">
      <Flex gap={2} wrap="wrap">
        {data.isSuperAdmin ? null : <Badge>Sizə təyin olunub: {data.pages.length}</Badge>}
        <Badge variant={needs.length ? 'warning' : 'success'}>Məzmun gözləyir: {needs.length}</Badge>
        {data.isSuperAdmin ? <Badge variant={unassigned ? 'danger' : 'success'}>Məsulu yoxdur: {unassigned}</Badge> : null}
      </Flex>
      {list.length ? (
        <Box>
          {list.map((p) => (
            <Row key={p.key} to={`/mesul-redaktorlar/ac?key=${encodeURIComponent(p.key)}`}>
              <Typography fontWeight="semiBold" tag="div">{p.label}</Typography>
              <Typography variant="pi" textColor="neutral600">
                {p.path} · {STATUS_META[p.status].label}
              </Typography>
            </Row>
          ))}
        </Box>
      ) : (
        <Typography textColor="neutral600">{data.isSuperAdmin ? 'Məsulu olmayan boş səhifə yoxdur.' : data.pages.length ? 'Bütün səhifələriniz doludur.' : 'Sizə hələ səhifə təyin olunmayıb.'}</Typography>
      )}
    </Flex>
  );
};
