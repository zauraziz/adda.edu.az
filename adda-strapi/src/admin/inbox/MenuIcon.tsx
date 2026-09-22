/**
 * F5.38 — sol menyudakı «Bildirişlər» ikonu: zəng + yeni qeydlərin sayı.
 *
 * Strapi menyu elementinin `notificationsCount`-u statikdir (qeydiyyat
 * anında bir dəfə oxunur), ona görə canlı say ikonun ÖZÜNDƏ çəkilir.
 * İkon admin açıq olduğu müddətdə həmişə görünür — «yeni müraciət gəldi»
 * toast-ları da buradan göstərilir (hansı səhifədə olmağından asılı deyil).
 *
 * Toast keçidi: Strapi-nin öz `link` sahəsi HƏMİŞƏ yeni vərəqdə açılır
 * (Notifications.mjs: `isExternal: true`) — hər bildirişdə ikinci admin
 * vərəqi açılardı. Ona görə keçid mesajın içində, react-router `Link` ilə
 * (eyni vərəqdə) verilir. Toaster router kontekstinin içindədir.
 */
import * as React from 'react';
import { Bell } from '@strapi/icons';
import { useNotification } from '@strapi/strapi/admin';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from 'styled-components';
import { takeArrivals, useInboxSummary, type Arrival } from './store';
import { fmtCount, inboxPath, itemFrom, itemTitle, KIND_LABEL, KINDS, type Summary } from './shared';

const GREETED_KEY = 'adda.inbox.greeted';

const Wrap = styled.span`
  position: relative;
  display: inline-flex;
`;

const Count = styled.span`
  position: absolute;
  top: -7px;
  right: -10px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  box-sizing: border-box;
  background: ${({ theme }) => theme.colors.danger600};
  box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.neutral0};
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
  pointer-events: none;
`;

const ToastLink = styled(RouterLink)`
  margin-left: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  color: ${({ theme }) => theme.colors.primary600};
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

/** Mətn + eyni vərəqdə açılan keçid. Tip `string`-dir, icrada ReactNode render olunur (Alert children). */
function withLink(text: string, to: string, label: string): string {
  return (
    <span>
      {text}
      <ToastLink to={to}>{label}</ToastLink>
    </span>
  ) as unknown as string;
}

function arrivalToast(a: Arrival) {
  return {
    type: 'info' as const,
    title: `Yeni: ${KIND_LABEL[a.kind].one.toLowerCase()}`,
    message: withLink(`${itemFrom(a.item)} — ${itemTitle(a.item)}`, inboxPath(a.kind, a.item.documentId), 'Aç'),
    timeout: 10000,
  };
}

function greetingText(summary: Summary): string {
  const parts: string[] = [];
  for (const kind of KINDS) {
    const n = summary.kinds[kind]?.new ?? 0;
    if (n > 0) parts.push(`${n} ${KIND_LABEL[kind].short.toLowerCase()}`);
  }
  return parts.length ? `Baxılmamış: ${parts.join(', ')}.` : '';
}

type IconProps = React.SVGProps<SVGSVGElement> & { fill?: string };

export const InboxMenuIcon = (props: IconProps) => {
  const { summary } = useInboxSummary();
  const { toggleNotification } = useNotification();
  const total = summary?.total ?? 0;

  React.useEffect(() => {
    if (!summary) return;
    // 1) Sessiyada bir dəfə: gözləyən işlərin xülasəsi.
    let greeted = true;
    try {
      greeted = window.sessionStorage.getItem(GREETED_KEY) === '1';
      if (!greeted) window.sessionStorage.setItem(GREETED_KEY, '1');
    } catch {
      greeted = true;
    }
    if (!greeted && summary.total > 0) {
      toggleNotification({
        type: 'info',
        title: 'Bildirişlər',
        message: withLink(greetingText(summary), inboxPath(), 'Bax'),
        timeout: 10000,
      });
    }
    // 2) Admin açıq ikən gələn yeni qeydlər (ən çoxu 3 ayrıca toast).
    const arrivals = takeArrivals();
    arrivals.slice(0, 3).forEach((a) => toggleNotification(arrivalToast(a)));
    if (arrivals.length > 3) {
      toggleNotification({
        type: 'info',
        title: 'Bildirişlər',
        message: withLink(`Daha ${arrivals.length - 3} yeni qeyd gəldi.`, inboxPath(), 'Bax'),
        timeout: 10000,
      });
    }
  }, [summary, toggleNotification]);

  return (
    <Wrap>
      <Bell {...(props as React.ComponentProps<typeof Bell>)} />
      {total > 0 ? <Count aria-label={`${total} baxılmamış`}>{fmtCount(total)}</Count> : null}
    </Wrap>
  );
};
