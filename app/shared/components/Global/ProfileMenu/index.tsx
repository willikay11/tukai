'use client';

import Link from 'next/link';

import { IconComponent } from '@/app/shared/components/Icons';
import { TukaiImage } from '@/components/ui/image';

import {
  PROFILE_MENU_DIVIDER_AFTER,
  PROFILE_MENU_ITEMS,
  ProfileMenuItem,
  UNAVAILABLE_TITLE,
} from './items';

interface ProfileMenuProps {
  name: string;
  // The user's @handle; users who never set one show no handle line
  handle?: string | null;
  image?: string | null;
  hasUnreadNotifications?: boolean;
  onSignOut: () => void;
  // Fired when a row is chosen. Client navigation does not unmount the popover
  // this sits in, so it has to be told to close.
  onItemSelect?: () => void;
}

const itemClasses =
  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-gray-800';

const MenuRow = ({
  item,
  hasUnreadNotifications,
  onSelect,
}: {
  item: ProfileMenuItem;
  hasUnreadNotifications: boolean;
  onSelect?: () => void;
}) => {
  const content = (
    <>
      <IconComponent
        iconName={item.icon}
        size={18}
        color="currentColor"
        className="flex-shrink-0 text-gray-700"
      />
      <span className="flex-1">{item.label}</span>
      {item.showsUnreadDot && hasUnreadNotifications && (
        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
      )}
    </>
  );

  if (!item.href) {
    return (
      <button
        type="button"
        disabled
        title={UNAVAILABLE_TITLE}
        className={`${itemClasses} opacity-40`}
      >
        {content}
      </button>
    );
  }

  return (
    <Link href={item.href} onClick={onSelect} className={`${itemClasses} hover:bg-gray-50`}>
      {content}
    </Link>
  );
};

export const ProfileMenu = ({
  name,
  handle,
  image,
  hasUnreadNotifications = false,
  onSignOut,
  onItemSelect,
}: ProfileMenuProps) => (
  <div className="w-[300px] p-2">
    {/* The canvas makes the whole header the way to the profile, rather than
        listing "My Profile" as one row among the rest */}
    <Link
      href="/profile"
      onClick={onItemSelect}
      className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-gray-50"
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
        <p className="truncate text-sm text-ink-muted">{handle ? `@${handle}` : 'View profile'}</p>
      </div>
    </Link>

    <div className="my-1 h-px bg-gray-100" />

    <div className="flex flex-col">
      {PROFILE_MENU_ITEMS.map((item, index) => (
        <div key={item.label}>
          <MenuRow
            item={item}
            hasUnreadNotifications={hasUnreadNotifications}
            onSelect={onItemSelect}
          />
          {/* A rule after the three that are yours, as the canvas groups them */}
          {index === PROFILE_MENU_DIVIDER_AFTER - 1 && <div className="my-1 h-px bg-gray-100" />}
        </div>
      ))}
    </div>

    <div className="my-1 h-px bg-gray-100" />

    <button
      type="button"
      onClick={() => {
        onItemSelect?.();
        onSignOut();
      }}
      className={`${itemClasses} hover:bg-red-50`}
    >
      <IconComponent
        iconName="Logout04Icon"
        size={18}
        color="currentColor"
        className="flex-shrink-0 text-red-600"
      />
      <span className="flex-1 text-red-600">Sign Out</span>
    </button>
  </div>
);
