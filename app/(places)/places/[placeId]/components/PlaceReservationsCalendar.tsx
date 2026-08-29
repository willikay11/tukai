'use client';

import { useMemo, useState } from 'react';

import { MonthDayFilter } from '@/app/shared/components/Calendar';
import { NoData } from '@/components/ui/noData';
import { PlaceBookingRequest } from '@/types/placeReservation';
import {
  ALL_DAYS,
  buildActiveDays,
  groupByDay,
  initialMonthFor,
} from '@/utils/reservation-calendar';

import { PlaceReservationCard } from './PlaceReservationCard';

type DatedReservation = PlaceBookingRequest & { start: string | null };

/**
 * A reader's own reservations at this place, laid out the way the experiences
 * reserved tab lays out bookings: a month at a time, filtered by day.
 *
 * The panel sits in a sidebar column, so a flat list grew unusable as soon as
 * someone had booked a handful of tables.
 */
/** Holds the panel's shape while the bookings request is in flight. */
const ReservationsSkeleton = () => (
  <div role="status" aria-label="Loading your reservations" className="rounded-3xl bg-gray-50 p-4">
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
        <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
      </div>
      <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
    </div>

    <div className="mt-4 flex items-center gap-2">
      {[0, 1, 2].map((pill) => (
        <div
          key={pill}
          className="h-10 w-20 flex-shrink-0 animate-pulse rounded-full bg-gray-200"
        />
      ))}
    </div>

    <div className="mt-4 space-y-3">
      {[0, 1].map((row) => (
        <div key={row} className="flex items-start gap-3 rounded-2xl bg-white p-4">
          <div className="h-12 w-12 flex-shrink-0 animate-pulse rounded-xl bg-gray-100" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
            <div className="h-5 w-28 animate-pulse rounded-full bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const PlaceReservationsCalendar = ({
  reservations,
  placeName,
  isLoading = false,
  isCancelling,
  onCancel,
}: {
  reservations: PlaceBookingRequest[];
  placeName: string;
  isLoading?: boolean;
  isCancelling: boolean;
  onCancel: (purchaseId: string) => void;
}) => {
  const items: DatedReservation[] = useMemo(
    () =>
      reservations.map((reservation) => ({
        ...reservation,
        start: reservation.occurrence?.startDate ?? null,
      })),
    [reservations],
  );

  const byDay = useMemo(() => groupByDay(items), [items]);

  const [monthCursor, setMonthCursor] = useState(() => initialMonthFor(items));
  const [selectedKey, setSelectedKey] = useState<string>(ALL_DAYS);

  const days = useMemo(() => buildActiveDays(items, monthCursor), [items, monthCursor]);

  const monthItems = useMemo(
    () => items.filter((item) => item.start && monthCursor.isSame(item.start, 'month')),
    [items, monthCursor],
  );

  const visibleItems = selectedKey === ALL_DAYS ? monthItems : (byDay[selectedKey] ?? []);

  const changeMonth = (delta: number) => {
    setMonthCursor((cursor) => cursor.clone().add(delta, 'month'));
    setSelectedKey(ALL_DAYS);
  };

  // A reservation the API returned without an occurrence has no day to sit on,
  // so it would vanish from a calendar that only reads dates
  const undated = items.filter((item) => !item.start);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <p className="pt-2 font-bold text-gray-900">My Reservations</p>
        <ReservationsSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="pt-2 font-bold text-gray-900">My Reservations</p>

      <div className="rounded-3xl bg-gray-50 p-4">
        <MonthDayFilter
          monthCursor={monthCursor}
          days={days}
          countLabel={`${monthItems.length} ${monthItems.length === 1 ? 'booking' : 'bookings'}`}
          selectedKey={selectedKey}
          daysWithItems={new Set(Object.keys(byDay).filter((key) => byDay[key].length > 0))}
          onChangeMonth={changeMonth}
          onSelectKey={setSelectedKey}
        />

        <div className="mt-4 space-y-3">
          {visibleItems.length === 0 ? (
            <div className="py-6">
              <NoData
                message={selectedKey === ALL_DAYS ? 'Nothing this month' : 'Nothing on this day'}
              />
            </div>
          ) : (
            visibleItems.map((reservation) => (
              <PlaceReservationCard
                key={reservation.id}
                reservation={reservation}
                placeName={placeName}
                onCancel={() => onCancel(reservation.id)}
                isCancelling={isCancelling}
              />
            ))
          )}
        </div>
      </div>

      {undated.map((reservation) => (
        <PlaceReservationCard
          key={reservation.id}
          reservation={reservation}
          placeName={placeName}
          onCancel={() => onCancel(reservation.id)}
          isCancelling={isCancelling}
        />
      ))}
    </div>
  );
};
