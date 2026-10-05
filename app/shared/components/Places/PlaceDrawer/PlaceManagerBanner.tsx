'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { Button } from '@/components/ui/button';
import { PlaceAvailabilityRule, PlaceReservationProfile } from '@/types/placeReservation';

import { reservationSummary } from './reservation-summary';

/**
 * What a manager sees at the top of their own place: which of their
 * communities holds it, how it is set up, and the way into the settings.
 */
export const PlaceManagerBanner = ({
  communityName,
  profile,
  rules,
  onOpenSettings,
}: {
  communityName?: string;
  profile?: PlaceReservationProfile;
  rules: PlaceAvailabilityRule[];
  onOpenSettings: () => void;
}) => (
  <div className="flex flex-col gap-4 rounded-2xl bg-surface-brand p-5 sm:flex-row sm:items-center">
    <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-white">
      <IconComponent
        iconName="StoreVerified01Icon"
        size={26}
        color="currentColor"
        className="text-brand"
      />
    </span>

    <div className="min-w-0 flex-1">
      <p className="text-[19px] font-bold leading-snug text-brand-ink">
        {communityName ? `You manage this place through ${communityName}` : 'You manage this place'}
      </p>
      <p className="mt-1 text-[15px] text-ink-muted">{reservationSummary(profile, rules)}</p>
    </div>

    <Button
      type="button"
      variant="gradient"
      onClick={onOpenSettings}
      className="h-12 flex-shrink-0 rounded-full px-6 text-[15px] font-bold"
    >
      <IconComponent iconName="Calendar03Icon" size={20} color="currentColor" />
      Reservation settings
    </Button>
  </div>
);
