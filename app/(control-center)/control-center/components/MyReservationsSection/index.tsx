'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import moment from 'moment';

import { DateRail, DateRailDay } from '../DateRail';
import { useDashboardReservations } from '../../hooks/useDashboardReservations';
import { PlaceBookingItemCard } from './PlaceBookingItemCard';
import { ReservationItemCard } from './ReservationItemCard';

const railAriaLabel = (day: DateRailDay) => {
  const count = day.count ?? 0;
  const base = `${moment(day.date).format('dddd D MMM')}, ${count} ${count === 1 ? 'booking' : 'bookings'}`;
  return day.isPast ? `${base}, past` : base;
};

export const MyReservationsSection = ({
  userId,
  selectedOffset,
  onSelectOffset,
}: {
  userId: string | undefined;
  selectedOffset: number | null;
  onSelectOffset: (offset: number) => void;
}) => {
  const router = useRouter();
  const { items, days, selectedOffset: resolvedOffset, writtenByExperienceId, placeBookings } =
    useDashboardReservations(userId, selectedOffset);

  const hasAnyItems = items.length > 0 || placeBookings.length > 0;

  return (
    <section aria-label="My reservations" className="flex min-w-0 flex-col gap-3">
      <div>
        <h2 className="text-[17px] font-bold tracking-[-0.2px] text-brand-ink">
          My reservations
        </h2>
        <p className="mt-1 text-[13.5px] text-ink-muted">Your experiences &amp; reservations</p>
      </div>

      <div className="grid min-w-0 grid-cols-[repeat(auto-fill,minmax(min(100%,360px),1fr))] gap-x-3 gap-y-2">
        <div className="flex min-w-0 flex-col gap-1.5 rounded-14 border-[0.5px] border-line-shell bg-shell p-1.5">
          {days.length > 0 && (
            <DateRail
              days={days}
              selectedOffset={resolvedOffset}
              onSelect={onSelectOffset}
              ariaLabel={railAriaLabel}
            />
          )}

          <div className="flex min-w-0 flex-col gap-2">
            {items.map((item) => (
              <ReservationItemCard
                key={item.key}
                item={item}
                review={writtenByExperienceId.get(item.experienceId)}
                onOpen={() => router.push(`/experiences/${item.experienceId}`)}
              />
            ))}

            {placeBookings.map((booking) => (
              <PlaceBookingItemCard
                key={booking.key}
                item={booking}
                onOpen={() => router.push(booking.onOpenHref)}
                onAction={() => router.push(booking.onOpenHref)}
              />
            ))}

            {!hasAnyItems && (
              <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl bg-white px-4 py-2.5 shadow-[0_1px_3px_rgba(1,51,52,.07)]">
                <span className="text-sm text-ink-muted">No bookings yet.</span>
                <Link href="/" className="h-11 px-1 text-sm font-semibold leading-[44px] text-brand">
                  Find experiences
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
