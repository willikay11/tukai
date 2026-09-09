'use client';

import Link from 'next/link';

import { IconComponent } from '@/app/shared/components/Icons';

/**
 * What the community that owns this place can do with it.
 *
 * Takes the reservation panel's slot rather than sitting above the page: an
 * owner is not going to book their own table, so the column is theirs. The work
 * itself happens in Creator Studio, where there is room for the forms.
 */
const OWNER_ACTIONS: {
  icon: string;
  title: string;
  detail: string;
  href: (id: string) => string;
}[] = [
  {
    icon: 'Edit02Icon',
    title: 'Edit place',
    detail: 'Update the photos, description and details readers see here.',
    href: (id) => `/creator-studio/places/${id}`,
  },
  {
    icon: 'PlusSignIcon',
    title: 'New experience',
    detail: 'Run something at this place and list it for people to book.',
    // TODO: seed the create flow with this place — it holds `about.placeId`
    // but does not read one from the URL yet
    href: () => '/experiences/create',
  },
  {
    icon: 'Calendar03Icon',
    title: 'Reservation settings',
    detail: 'Open your tables, set the hours you take them, and answer requests.',
    href: (id) => `/creator-studio/places/${id}?tab=reservations`,
  },
];

export const PlaceOwnerPanel = ({ placeId, placeName }: { placeId: string; placeName: string }) => (
  <div className="space-y-5">
    <div>
      <p className="flex items-center gap-2 text-sm font-medium text-primary">
        <IconComponent iconName="CheckmarkBadge01Icon" size={18} color="currentColor" />
        You manage this place
      </p>
      <h2 className="mt-2 text-xl font-bold text-gray-900">{placeName}</h2>
      <p className="mt-1 text-sm text-gray-500">
        Everything for this listing lives in Creator Studio.
      </p>
    </div>

    <ul className="space-y-2">
      {OWNER_ACTIONS.map((action) => (
        <li key={action.title}>
          <Link
            href={action.href(placeId)}
            className="flex items-start gap-3 rounded-2xl bg-white p-4 transition hover:bg-gray-100"
          >
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-green-200">
              <IconComponent
                iconName={action.icon}
                size={18}
                color="currentColor"
                className="text-primary"
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900">{action.title}</p>
              <p className="text-sm text-gray-500">{action.detail}</p>
            </div>
            <IconComponent
              iconName="ArrowRight01Icon"
              size={16}
              color="currentColor"
              className="mt-0.5 flex-shrink-0 text-gray-400"
            />
          </Link>
        </li>
      ))}
    </ul>
  </div>
);
