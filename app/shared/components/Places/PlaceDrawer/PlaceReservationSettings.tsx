'use client';

import Link from 'next/link';

import { IconComponent } from '@/app/shared/components/Icons';
import { Place } from '@/types/place';
import { PlaceAvailabilityRule, PlaceReservationProfile } from '@/types/placeReservation';

import {
  activeDays,
  openingHours,
  reservationTypeLabel,
  slotInterval,
} from './reservation-summary';

const Fact = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="min-w-0">
    <p className="text-[15px] text-ink-muted">{label}</p>
    <div className="mt-1 text-[19px] font-bold text-brand-ink">{children}</div>
  </div>
);

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-xl bg-surface px-4 py-3 text-[15px] text-brand-ink">
    {children}
  </span>
);

const STATUS_LINES: Record<string, (name: string) => string> = {
  active: (name) => `Live. Guests can reserve ${name} now.`,
  paused: (name) => `Paused. Nobody can reserve ${name} at the moment.`,
  draft: (name) => `Not live yet. ${name} is set up but closed to guests.`,
};

/**
 * A manager's reservation setup, read-only, inside the drawer. Changing any of
 * it is the control centre's job, which the button at the end opens.
 *
 * ⚠️ The design also shows entry fees by guest type (Residents, Visitors,
 * Kids), a max party size per booking, a buffer between bookings, and wallet
 * details. None of the first three exist on the API at all — there is no fee
 * or guest-type field anywhere, and `max_party_size` is not on the documented
 * serializer — so they are left out rather than drawn empty. The slot interval
 * below IS real, and is the gap the picker steps by rather than a buffer after
 * a booking, so it is labelled as what it is.
 */
export const PlaceReservationSettings = ({
  place,
  profile,
  rules,
}: {
  place: Place;
  profile?: PlaceReservationProfile;
  rules: PlaceAvailabilityRule[];
}) => {
  const days = activeDays(rules);
  const hours = openingHours(rules);
  const interval = slotInterval(rules);
  const status = profile?.status ?? 'draft';
  const locality = place.location?.city ?? place.location?.name;

  return (
    <div className="space-y-6 py-6">
      <p className="flex items-center gap-2.5 text-[15px] text-ink-muted">
        <IconComponent
          iconName="StoreVerified01Icon"
          size={20}
          color="currentColor"
          className="flex-shrink-0 text-brand"
        />
        {[place.title, locality].filter(Boolean).join(', ')}
      </p>

      {profile ? (
        <p className="flex items-start gap-2.5 rounded-xl bg-surface-brand px-5 py-4 text-[17px] text-brand">
          <IconComponent
            iconName={status === 'active' ? 'Tick02Icon' : 'InformationCircleIcon'}
            size={22}
            color="currentColor"
            className="mt-0.5 flex-shrink-0"
          />
          {(STATUS_LINES[status] ?? STATUS_LINES.draft)(place.title)}
        </p>
      ) : (
        <p className="rounded-xl bg-surface px-5 py-4 text-[17px] text-ink-muted">
          {place.title} is not open to reservations yet.
        </p>
      )}

      {profile && (
        <>
          <div className="border-t border-line pt-6">
            <Fact label="Reservation type">{reservationTypeLabel(profile)}</Fact>
          </div>

          <div className="grid grid-cols-1 gap-6 border-t border-line pt-6 sm:grid-cols-2">
            {profile.seatingCapacity !== undefined && (
              <Fact label="Total seating capacity">{profile.seatingCapacity} guests</Fact>
            )}
            {interval !== null && (
              <Fact label="Time between bookable slots">{interval} minutes</Fact>
            )}
          </div>

          <div className="border-t border-line pt-6">
            <p className="text-[15px] text-ink-muted">Active days</p>
            {days.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2.5">
                {days.map((day) => (
                  <Pill key={day}>{day}</Pill>
                ))}
              </div>
            ) : (
              <p className="mt-1 text-[17px] text-ink-muted">No days are open for booking yet.</p>
            )}
          </div>

          {hours && (
            <div className="border-t border-line pt-6">
              <p className="text-[15px] text-ink-muted">Opening hours</p>
              <p className="mt-1 flex items-center gap-2.5 text-[19px] font-bold text-brand-ink">
                <IconComponent
                  iconName="Clock01Icon"
                  size={22}
                  color="currentColor"
                  className="text-brand"
                />
                {hours}
              </p>
            </div>
          )}

          {/* Hours differ day to day, so there is no one window to print */}
          {!hours && days.length > 0 && (
            <div className="border-t border-line pt-6">
              <p className="text-[15px] text-ink-muted">Opening hours</p>
              <p className="mt-1 text-[17px] text-ink-muted">
                They vary by day. The settings show each one.
              </p>
            </div>
          )}
        </>
      )}

      <div className="flex justify-end border-t border-line pt-6">
        <Link
          href={`/control-center/places/${place.id}/reservations`}
          className="inline-flex h-12 items-center gap-2.5 rounded-full bg-lime px-6 text-[15px] font-bold text-brand-ink transition-colors hover:bg-lime-dark"
        >
          <IconComponent iconName="PencilEdit02Icon" size={20} color="currentColor" />
          {profile ? 'Edit settings' : 'Set up reservations'}
        </Link>
      </div>
    </div>
  );
};
