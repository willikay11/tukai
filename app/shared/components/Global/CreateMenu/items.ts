export type CreateMenuItemId = 'experience' | 'community' | 'place' | 'bucketList' | 'moment';

export interface CreateMenuItem {
  id: CreateMenuItemId;
  label: string;
  description: string;
  icon: string;
  // Present when the row is a plain link; omitted when selecting it opens a
  // modal instead, which the caller decides what to do with via `onSelect`.
  href?: string;
}

export const CREATE_MENU_ITEMS: CreateMenuItem[] = [
  {
    id: 'experience',
    label: 'Create an experience',
    description: 'Requires a community you own.',
    icon: 'CalendarAdd01Icon',
  },
  {
    id: 'community',
    label: 'Create a community',
    description: 'Needed before you can host or manage a place.',
    icon: 'UserMultipleIcon',
  },
  {
    id: 'place',
    label: 'Connect a place',
    description: 'Claim a business your community runs, with proof of ownership.',
    icon: 'StoreVerified01Icon',
  },
  {
    id: 'bucketList',
    label: 'Create a bucket list',
    description: 'Public or private. Private is invitation only.',
    icon: 'ShoppingBasketAdd02Icon',
  },
  {
    id: 'moment',
    label: 'Share a moment',
    description: 'Attach it to a community, place or experience.',
    icon: 'DashboardCircleAddIcon',
  },
];
