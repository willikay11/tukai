'use client';

import { IconComponent } from '@/app/shared/components/Icons';
import { Button } from '@/components/ui/button';
import { PlaceAvailabilityRule, PlaceReservationProfile } from '@/types/placeReservation';

import { reservationSummary } from './reservation-summary';

/**
 * What a manager sees at the top of their own place: which of their
 * communities holds it, how it is set up, the way into the settings, and
 * Boost (DEV-392).
 */
export const PlaceManagerBanner = ({
  communityName,
  profile,
  rules,
  onOpenSettings,
  onBoost,
}: {
  communityName?: string;
  profile?: PlaceReservationProfile;
  rules: PlaceAvailabilityRule[];
  onOpenSettings: () => void;
  onBoost?: () => void;
}) => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl bg-surface-brand p-4">
    <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white">
      <IconComponent
        iconName="StoreVerified01Icon"
        size={22}
        color="currentColor"
        className="text-brand"
      />
    </span>

    <div className="flex min-w-0 flex-[1_1_220px] flex-col gap-0.5">
      <p className="text-[15px] font-semibold text-brand-ink">
        {communityName ? `You manage this place through ${communityName}` : 'You manage this place'}
      </p>
      <p className="text-[13.5px] leading-[1.45] text-ink-summary">
        {reservationSummary(profile, rules)}
      </p>
    </div>

    <Button
      type="button"
      variant="gradient"
      onClick={onOpenSettings}
      className="h-11 flex-shrink-0 rounded-full px-[18px] text-[14px] font-semibold"
    >
      <IconComponent iconName="Calendar03Icon" size={18} color="currentColor" />
      {profile ? 'Reservation settings' : 'Set up reservations'}
    </Button>

    {onBoost && (
      <Button
        type="button"
        variant="outline-primary"
        onClick={onBoost}
        className="h-11 flex-shrink-0 rounded-full px-[18px] text-[14px] font-semibold"
      >
        <IconComponent iconName="RocketIcon" size={18} color="currentColor" />
        Boost
      </Button>
    )}
  </div>
);
