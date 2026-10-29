'use client';

import Link from 'next/link';

import { IconComponent } from '@/app/shared/components/Icons';
import { useCreateExperienceDrawer } from '@/context/CreateExperienceDrawerContext';

/**
 * What the community that owns this place can do with it.
 *
 * Takes the reservation panel's slot rather than sitting above the page: an
 * owner is not going to book their own table, so the column is theirs. The work
 * itself happens in the Dashboard, where there is room for the forms.
 */
type OwnerAction =
  | { kind: 'link'; icon: string; title: string; detail: string; href: (id: string) => string }
  | { kind: 'drawer'; icon: string; title: string; detail: string };

const OWNER_ACTIONS: OwnerAction[] = [
  {
    kind: 'link',
    icon: 'Edit02Icon',
    title: 'Edit place',
    detail: 'Update the photos, description and details readers see here.',
    href: (id) => `/dashboard/places/${id}/edit`,
  },
  {
    kind: 'drawer',
    icon: 'PlusSignIcon',
    title: 'New experience',
    detail: 'Run something at this place and list it for people to book.',
  },
  {
    kind: 'link',
    icon: 'Calendar03Icon',
    title: 'Reservation settings',
    detail: 'Open your tables, set the hours you take them, and answer requests.',
    href: (id) => `/dashboard/places/${id}/reservations`,
  },
];

const RowContent = ({ action }: { action: OwnerAction }) => (
  <>
    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-green-200">
      <IconComponent iconName={action.icon} size={18} color="currentColor" className="text-primary" />
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
  </>
);

const ROW_CLASS =
  'flex w-full items-start gap-3 rounded-2xl bg-white p-4 text-left transition hover:bg-gray-100';

export const PlaceOwnerPanel = ({ placeId, placeName }: { placeId: string; placeName: string }) => {
  // TODO: seed the create flow with this place - it holds `about.placeId` but
  // does not read one from an opener yet
  const { openCreateExperience } = useCreateExperienceDrawer()!;

  return (
    <div className="space-y-5">
      <div>
        <p className="flex items-center gap-2 text-sm font-medium text-primary">
          <IconComponent
            iconName="CheckmarkBadge01Icon"
            variant="bulk"
            size={18}
            color="currentColor"
          />
          You manage this place
        </p>
        <h2 className="mt-2 text-xl font-bold text-gray-900">{placeName}</h2>
        <p className="mt-1 text-sm text-gray-500">
          Everything for this listing lives in your Dashboard.
        </p>
      </div>

      <ul className="space-y-2">
        {OWNER_ACTIONS.map((action) =>
          action.kind === 'link' ? (
            <li key={action.title}>
              <Link href={action.href(placeId)} className={ROW_CLASS}>
                <RowContent action={action} />
              </Link>
            </li>
          ) : (
            <li key={action.title}>
              <button
                type="button"
                onClick={() => openCreateExperience()}
                className={ROW_CLASS}
              >
                <RowContent action={action} />
              </button>
            </li>
          ),
        )}
      </ul>
    </div>
  );
};
