'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { usePlaceAvailability, usePlaceReservationProfiles } from '@/app/shared/hooks/usePlaces';
import {
  PlaceAvailabilityException,
  PlaceAvailabilityRule,
  PlaceReservationProfile,
} from '@/types/placeReservation';
import { placeOpenState } from '@/utils/place-hours';

/**
 * "Open now · Closes 10 PM", or "Closed · Opens 10 AM".
 *
 * ⚠️ Only a place opened to reservations has hours to read. They are not on
 * the place serializer at all — they hang off a reservation profile's
 * availability rules, two requests deep — so this renders nothing for every
 * other place rather than guessing. That is also why it is not on the cards in
 * a rail: two requests per card is not a trade worth making for a line of
 * text.
 */
export const PlaceOpenStatus = ({ placeId }: { placeId: string }) => {
  const { data: profilesResponse } = usePlaceReservationProfiles(placeId);
  const profiles: PlaceReservationProfile[] = profilesResponse?.data?.results ?? [];

  // Hours a venue has not published are not hours: a draft or paused profile
  // is settings in progress
  const profile = profiles.find((entry) => entry.status === 'active');

  const { data: availability } = usePlaceAvailability(placeId, profile?.id);
  const rules: PlaceAvailabilityRule[] = availability?.data?.rules ?? [];
  const exceptions: PlaceAvailabilityException[] = availability?.data?.exceptions ?? [];

  const state = placeOpenState(rules, exceptions);
  if (!state) return null;

  return (
    <span
      className={`flex items-center gap-1 ${state.isOpen ? 'text-brand' : 'text-ink-muted'}`}
      data-testid="place-open-status"
    >
      <IconComponent
        iconName={state.isOpen ? 'Sun03Icon' : 'Moon02Icon'}
        size={14}
        color="currentColor"
      />
      <span>
        <span className="font-semibold">{state.isOpen ? 'Open now' : 'Closed'}</span>
        {/* A venue with nothing open all week says only "Closed", so the
            detail is dropped rather than repeated back. The separator carries
            its own spaces: a flex gap reads right but leaves the two halves
            jammed together for anything reading the text. */}
        {state.label !== 'Closed' && <span>{` · ${state.label}`}</span>}
      </span>
    </span>
  );
};
