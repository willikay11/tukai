'use client';

import Link from 'next/link';

import { IconComponent } from '@/app/shared/components/Icons';
import { TukaiImage } from '@/components/ui/image';

import {
  PROFILE_MENU_GROUP_ONE,
  PROFILE_MENU_GROUP_TWO,
  ProfileMenuItem,
  UNAVAILABLE_TITLE,
} from './items';

interface ProfileMenuProps {
  name: string;
  // The user's @handle; users who never set one show no handle line
  handle?: string | null;
  image?: string | null;
  /** The real count, so the badge can show a number rather than just a dot. */
  unreadNotificationCount?: number;
  onSignOut: () => void;
  // Fired when a row is chosen. Client navigation does not unmount the popover
  // this sits in, so it has to be told to close.
  onItemSelect?: () => void;
}

const itemClasses =
  'flex min-h-11 w-full items-center gap-3 rounded-full px-2.5 text-left text-[14.5px] font-semibold text-gray-900';

/** The lime numeric pill the search bar's own Filters button already uses. */
const CountBadge = ({ count }: { count: number }) => (
  <span className="inline-flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-lime px-1.5 text-[11px] font-bold text-brand-ink">
    {count}
  </span>
);

const MenuRow = ({ item, onSelect }: { item: ProfileMenuItem; onSelect?: () => void }) => {
  const content = (
    <>
      <IconComponent
        iconName={item.icon}
        size={19}
        color="currentColor"
        className="flex-shrink-0 text-ink-muted"
      />
      <span className="flex-1">{item.label}</span>
      {Boolean(item.badgeCount) && <CountBadge count={item.badgeCount as number} />}
    </>
  );

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
const MenuGroup = ({ items, onSelect }: { items: ProfileMenuItem[]; onSelect?: () => void }) => (
  <div className="flex flex-col gap-0.5 rounded-xl bg-white p-1.5 shadow-[0_1px_3px_rgba(1,51,52,.07)]">
    {items.map((item) => (
      <MenuRow key={item.label} item={item} onSelect={onSelect} />
    ))}
  </div>
);

export const ProfileMenu = ({
  name,
  handle,
  image,
  unreadNotificationCount = 0,
  onSignOut,
  onItemSelect,
}: ProfileMenuProps) => {
  const groupTwo = PROFILE_MENU_GROUP_TWO.map((item) =>
    item.label === 'Notifications' ? { ...item, badgeCount: unreadNotificationCount } : item,
  );

  return (
    <div role="menu" aria-label="Account" className="w-[284px] p-2">
      {/* The canvas makes the whole header the way to the profile, rather than
          listing "Profile" as one row among the rest */}
      <Link
        href="/profile"
        onClick={onItemSelect}
        role="menuitem"
        className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-surface"
      >
        <div className="relative aspect-square h-11 w-11 flex-shrink-0">
          <TukaiImage
            src={image || ''}
            alt={name}
            className="h-11 w-11 rounded-full"
            quality={100}
            fill
            style={{ objectFit: 'cover' }}
            showNotFoundText={false}
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-gray-900">{name}</p>
          <p className="truncate text-sm text-ink-muted">
            {handle ? `@${handle}` : 'View profile'}
          </p>
        </div>
      </Link>

      {/* The grey tray holding the canvas's two grouped cards */}
      <div className="mt-1 flex flex-col gap-1.5 rounded-xl bg-surface p-1.5">
        <MenuGroup items={PROFILE_MENU_GROUP_ONE} onSelect={onItemSelect} />
        <MenuGroup items={groupTwo} onSelect={onItemSelect} />
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
