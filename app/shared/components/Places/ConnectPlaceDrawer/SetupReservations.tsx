'use client';

import Link from 'next/link';

import { IconComponent } from '@/app/shared/components/Icons';
import { usePlaceReservationProfiles } from '@/app/shared/hooks/usePlaces';
import { Button } from '@/components/ui/button';
import { usePlaceDrawer } from '@/context/PlaceDrawerContext';
import { ClaimPlaceSummary } from '@/types/claim';
import { placeReservationSettingsPath } from '@/utils/detail-paths';

const ROW_CLASS =
  'inline-flex h-11 flex-shrink-0 items-center gap-2 rounded-full bg-surface-brand px-4 text-sm font-semibold text-brand hover:bg-surface-tab';

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
    return drawer ? (
      <Button
        type="button"
        variant="lime"
        onClick={open}
        className="ml-auto h-12 rounded-full px-6 text-[15px]"
      >
        {label}
      </Button>
    ) : (
      <Button asChild variant="lime" className="ml-auto h-12 rounded-full px-6 text-[15px]">
        <Link href={placeReservationSettingsPath(place)} onClick={onNavigate}>
          {label}
        </Link>
      </Button>
    );
  }

  return drawer ? (
    <button type="button" onClick={open} className={ROW_CLASS}>
      <IconComponent iconName="Settings02Icon" size={18} color="currentColor" />
      {label}
    </button>
  ) : (
    <Link href={placeReservationSettingsPath(place)} onClick={onNavigate} className={ROW_CLASS}>
      <IconComponent iconName="Settings02Icon" size={18} color="currentColor" />
      {label}
    </Link>
  );
};
