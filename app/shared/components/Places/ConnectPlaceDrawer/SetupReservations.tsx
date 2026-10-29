'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { usePlaceReservationProfiles } from '@/app/shared/hooks/usePlaces';
import { Button } from '@/components/ui/button';
import { usePlaceDrawer } from '@/context/PlaceDrawerContext';
import { ClaimPlaceSummary } from '@/types/claim';

const ROW_CLASS =
  'inline-flex h-11 flex-shrink-0 items-center gap-2 rounded-full bg-surface-brand px-4 text-sm font-semibold text-brand hover:bg-surface-tab';

// The place drawer is mounted once at the app root (`PlaceDrawerProvider` in
// `app/layout.tsx`), so `usePlaceDrawer()` is non-null everywhere this
// renders in the real app - the optional chaining below is only for a
// component rendered in isolation, in a test, without that provider.
export const SetupReservations = ({
  place,
  variant,
  onNavigate,
}: {
  place: ClaimPlaceSummary;
  variant: 'row' | 'footer';
  onNavigate: () => void;
}) => {
  const drawer = usePlaceDrawer();
  const { data: profilesResponse } = usePlaceReservationProfiles(place.id);
  const hasSettings = (profilesResponse?.data?.results ?? []).length > 0;
  const label = hasSettings ? 'Reservation settings' : 'Set up reservations';

  const open = () => {
    onNavigate();
    drawer?.openPlace(place.id, { view: 'reservations' });
  };

  if (variant === 'footer') {
    return (
      <Button
        type="button"
        variant="lime"
        onClick={open}
        className="ml-auto h-12 rounded-full px-6 text-[15px]"
      >
        {label}
      </Button>
    );
  }

  return (
    <button type="button" onClick={open} className={ROW_CLASS}>
      <IconComponent iconName="Settings02Icon" size={18} color="currentColor" />
      {label}
    </button>
  );
};
