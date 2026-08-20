'use client';

import Link from 'next/link';

import { IconComponent } from '@/app/shared/components/Icons';
import { TukaiImage } from '@/components/ui/image';

import { PROFILE_MENU_ITEMS, ProfileMenuItem, UNAVAILABLE_TITLE } from './items';

interface ProfileMenuProps {
  name: string;
  // The user's @handle; users who never set one show no handle line
  handle?: string | null;
  image?: string | null;
  hasUnreadNotifications?: boolean;
  onSignOut: () => void;
}

const itemClasses =
  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-gray-800';

const MenuRow = ({
  item,
  hasUnreadNotifications,
}: {
  item: ProfileMenuItem;
  hasUnreadNotifications: boolean;
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
    <Link href={item.href} className={`${itemClasses} hover:bg-gray-50`}>
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
}: ProfileMenuProps) => (
  <div className="w-[300px] p-2">
    <div className="flex items-center gap-3 px-3 py-3">
      <div className="relative aspect-square h-12 w-12 flex-shrink-0">
        <TukaiImage
          src={image || ''}
          alt={name}
          className="h-12 w-12 rounded-full"
          quality={100}
          fill
          style={{ objectFit: 'cover' }}
          showNotFoundText={false}
        />
      </div>
      <div className="min-w-0">
        <p className="truncate text-base font-bold text-gray-900">{name}</p>
        {handle && <p className="truncate text-sm text-gray-400">@{handle}</p>}
      </div>
    </div>

    <div className="my-1 h-px bg-gray-100" />

    <div className="flex flex-col">
      {PROFILE_MENU_ITEMS.map((item) => (
        <MenuRow key={item.label} item={item} hasUnreadNotifications={hasUnreadNotifications} />
      ))}
    </div>

    <div className="my-1 h-px bg-gray-100" />

    <button type="button" onClick={onSignOut} className={`${itemClasses} hover:bg-red-50`}>
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
