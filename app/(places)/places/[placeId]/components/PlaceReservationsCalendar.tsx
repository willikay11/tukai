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
export const PlaceReservationsCalendar = ({
  reservations,
  placeName,
  isCancelling,
  onCancel,
}: {
  reservations: PlaceBookingRequest[];
  placeName: string;
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
