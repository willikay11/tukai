'use client';

import { KeyboardEvent, useEffect, useId, useRef } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { useUnreadConversationCount } from '@/app/shared/hooks/useMessages';
import { useUnreadNotificationCount } from '@/app/shared/hooks/useNotifications';
import { cn } from '@/lib/utils';

import { CountBadge } from './CountBadge';
import { MessagesTab } from './MessagesTab';
import { NotificationsTab } from './NotificationsTab';

export type InboxTab = 'notifications' | 'messages';

const TABS: { id: InboxTab; label: string; icon: string }[] = [
  { id: 'notifications', label: 'Notifications', icon: 'Notification02Icon' },
  { id: 'messages', label: 'Messages', icon: 'MessageMultiple01Icon' },
];

/**
 * The inbox's two tabs and whichever one is picked - the body of the inbox
 * panel, and of the /inbox page a link can still land on.
 *
 * The tab is the caller's, so opening from the account menu can set it.
 * `autoFocus` puts focus on the picked tab once mounted, which is where the
 * panel wants it when it opens.
 */
export const InboxContent = ({
  myId,
  tab,
  onTabChange,
  onOpenNotification,
  autoFocus = false,
}: {
  myId: string;
  tab: InboxTab;
  onTabChange: (tab: InboxTab) => void;
  onOpenNotification?: (href: string | null) => void;
  autoFocus?: boolean;
}) => {
  const baseId = useId();
  const tabRefs = useRef<Partial<Record<InboxTab, HTMLButtonElement | null>>>({});

  const { data: countResponse } = useUnreadNotificationCount();
  const unreadConversations = useUnreadConversationCount(myId);
  const counts: Record<InboxTab, number> = {
    notifications: Number(countResponse?.data?.count ?? 0),
    messages: unreadConversations,
  };

  useEffect(() => {
    if (autoFocus) tabRefs.current[tab]?.focus({ preventScroll: true });
    // Only on arrival; after that, focus follows the reader
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = (next: InboxTab) => {
    onTabChange(next);
    tabRefs.current[next]?.focus();
  };

  // Arrow keys move between the tabs, wrapping, as a tablist does
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = TABS.findIndex((option) => option.id === tab);
    const to: Record<string, number> = {
      ArrowRight: (index + 1) % TABS.length,
      ArrowLeft: (index - 1 + TABS.length) % TABS.length,
      Home: 0,
      End: TABS.length - 1,
    };
    if (!(event.key in to)) return;

    event.preventDefault();
    pick(TABS[to[event.key]].id);
  };

  const tabId = (id: InboxTab) => `${baseId}-tab-${id}`;
  const panelId = (id: InboxTab) => `${baseId}-panel-${id}`;

  return (
    <>
      <div role="tablist" aria-label="Inbox" onKeyDown={onKeyDown} className="flex flex-wrap gap-2">
        {TABS.map((option) => {
          const isActive = tab === option.id;

          return (
            <button
              key={option.id}
              ref={(element) => {
                tabRefs.current[option.id] = element;
              }}
              id={tabId(option.id)}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId(option.id)}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTabChange(option.id)}
              className={cn(
                'inline-flex h-11 flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full pl-3 pr-[18px] text-[14.5px] font-medium hover:brightness-[.97] active:scale-[0.98]',
                isActive ? 'bg-surface-pill-active text-brand' : 'bg-surface text-gray-800',
              )}
            >
              <IconComponent
                iconName={option.icon}
                variant={isActive ? 'bulk' : 'twotone'}
                size={21}
                color="currentColor"
              />
              {option.label}
              <CountBadge count={counts[option.id]} />
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={panelId(tab)} aria-labelledby={tabId(tab)}>
        {tab === 'notifications' ? (
          <NotificationsTab
            onOpen={onOpenNotification}
            // The button that had focus goes once everything is read
            onMarkedAll={() => tabRefs.current.notifications?.focus()}
          />
        ) : (
          <MessagesTab myId={myId} />
        )}
      </div>
    </>
  );
};
