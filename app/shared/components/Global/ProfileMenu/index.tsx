'use client';

import Link from 'next/link';

import { IconComponent } from '@/app/shared/components/Icons';
import { CountBadge, InboxTab } from '@/app/shared/components/Inbox';

import {
  PROFILE_MENU_GROUP_ONE,
  PROFILE_MENU_GROUP_TWO,
  ProfileMenuItem,
  UNAVAILABLE_TITLE,
} from './items';

interface ProfileMenuProps {
  /** The real count, so the badge can show a number rather than just a dot. */
  unreadNotificationCount?: number;
  /** Conversations still waiting on the reader, for the Messages badge. */
  unreadConversationCount?: number;
  /** Opens the inbox panel on a tab. Without it, those rows link to /inbox. */
  onOpenInbox?: (tab: InboxTab) => void;
  onSignOut: () => void;
  // Fired when a row is chosen. Client navigation does not unmount the popover
  // this sits in, so it has to be told to close.
  onItemSelect?: () => void;
}

const itemClasses =
  'flex min-h-11 w-full items-center gap-3 rounded-full px-2.5 text-left text-[14.5px] font-semibold text-gray-900';

const MenuRow = ({
  item,
  onSelect,
  onOpenInbox,
}: {
  item: ProfileMenuItem;
  onSelect?: () => void;
  onOpenInbox?: (tab: InboxTab) => void;
}) => {
  const content = (
    <>
      <IconComponent
        iconName={item.icon}
        size={19}
        color="currentColor"
        className="flex-shrink-0 text-ink-muted"
      />
      <span className="flex-1">{item.label}</span>
      <CountBadge count={item.badgeCount ?? 0} />
    </>
  );

  if (item.inboxTab && onOpenInbox) {
    const tab = item.inboxTab;

    return (
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onSelect?.();
          onOpenInbox(tab);
        }}
        className={`${itemClasses} hover:bg-surface`}
      >
        {content}
      </button>
    );
  }

  if (!item.href) {
    return (
      <button
        type="button"
        role="menuitem"
        disabled
        title={UNAVAILABLE_TITLE}
        className={`${itemClasses} opacity-40`}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onSelect}
      role="menuitem"
      className={`${itemClasses} hover:bg-surface`}
    >
      {content}
    </Link>
  );
};

/** One of the menu's two white cards, sitting inside the grey tray. */
const MenuGroup = ({
  items,
  onSelect,
  onOpenInbox,
}: {
  items: ProfileMenuItem[];
  onSelect?: () => void;
  onOpenInbox?: (tab: InboxTab) => void;
}) => (
  <div className="flex flex-col gap-0.5 rounded-xl bg-white p-1.5 shadow-[0_1px_3px_rgba(1,51,52,.07)]">
    {items.map((item) => (
      <MenuRow key={item.label} item={item} onSelect={onSelect} onOpenInbox={onOpenInbox} />
    ))}
  </div>
);

export const ProfileMenu = ({
  unreadNotificationCount = 0,
  unreadConversationCount = 0,
  onOpenInbox,
  onSignOut,
  onItemSelect,
}: ProfileMenuProps) => {
  const badges: Partial<Record<InboxTab, number>> = {
    notifications: unreadNotificationCount,
    messages: unreadConversationCount,
  };
  const groupTwo = PROFILE_MENU_GROUP_TWO.map((item) =>
    item.inboxTab ? { ...item, badgeCount: badges[item.inboxTab] } : item,
  );

  return (
    <div role="menu" aria-label="Account" className="w-[284px] p-1.5 rounded-2xl bg-surface">
      {/* The grey tray holding the two groups */}
      <div className="flex flex-col gap-1.5">
        <MenuGroup items={PROFILE_MENU_GROUP_ONE} onSelect={onItemSelect} />
        <MenuGroup items={groupTwo} onSelect={onItemSelect} onOpenInbox={onOpenInbox} />
      </div>

      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onItemSelect?.();
          onSignOut();
        }}
        className={`${itemClasses} mt-1.5 hover:bg-danger-surface`}
      >
        <IconComponent
          iconName="LogoutCircle01Icon"
          size={18}
          color="currentColor"
          className="flex-shrink-0 text-danger"
        />
        <span className="flex-1 text-danger">Sign out</span>
      </button>
    </div>
  );
};
