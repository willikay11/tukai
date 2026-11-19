import { useMemo } from 'react';

import { CalendarItem, buildCalendarAgenda } from '@/app/(profile)/hooks/calendar-agenda';
import { WrittenReview, useMyReviews } from '@/app/(profile)/hooks/useMyReviews';
import { useExperiences, useTicketPurchases } from '@/app/shared/hooks/useExperiences';
import { usePlaceBookings } from '@/app/shared/hooks/usePlaces';
import { Experience } from '@/types/experience';
import { TicketPurchase } from '@/types/ticket-purchase';

import { DateRailDay } from '../components/DateRail';
import { dateFromOffset, dayOffsetOf, defaultDayOffset } from '../utils/day-offset';
import { PlaceBookingStatusVm } from '../utils/place-booking-status';
import { toDashboardPlaceBooking } from '../utils/place-bookings';

/** A booking at a place, shaped for the "Place booking" item row. */
export interface DashboardPlaceBookingItem {
  key: string;
  date: string;
  placeName: string;
  image?: string;
  party: number;
  time: string;
  isRestaurant: boolean;
  status: PlaceBookingStatusVm;
  onOpenHref: string;
}

/**
 * The Dashboard's "My reservations" section: experiences this person booked
 * (future and past-attended), built on the same `buildCalendarAgenda` the
 * Profile's calendar uses - with `hostedExperiences` passed as `[]`, since
 * hosting lives in its own Dashboard section. Unlike the Profile calendar
 * (up to 3 items from the selected day onward), the handoff wants every item
 * on the selected day only, so this groups by day itself rather than reusing
 * `itemsFrom`.
 *
 * Place bookings are the third item type: the person's own bookings at every
 * place, in one request (DEV-387). They count towards the date rail and show
 * on the day picked, like the rest.
 */
export const useDashboardReservations = (
  userId: string | undefined,
  selectedOffset: number | null,
) => {
  const { data: purchasesResponse, isLoading: isLoadingPurchases } = useTicketPurchases(userId);
  const purchases: TicketPurchase[] = purchasesResponse?.data?.results ?? [];

  const { data: reservedResponse, isLoading: isLoadingReserved } = useExperiences(
    { page: 1, page_size: 100, reserved_by: userId },
    Boolean(userId),
  );
  const reservedExperiences: Experience[] = reservedResponse?.data?.results ?? [];

  const { agenda } = useMemo(
    () => buildCalendarAgenda(purchases, reservedExperiences, []),
    [purchases, reservedExperiences],
  );

  const { data: placeBookingsData, isLoading: isLoadingPlaceBookings } = usePlaceBookings('guest', {
    enabled: Boolean(userId),
  });
  const allPlaceBookings: DashboardPlaceBookingItem[] = useMemo(
    () =>
      (placeBookingsData ?? [])
        .map((booking) => toDashboardPlaceBooking(booking))
        .filter((item): item is DashboardPlaceBookingItem => item !== null)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [placeBookingsData],
  );

  const days: DateRailDay[] = useMemo(() => {
    const countByOffset = new Map<number, number>();
    [...agenda, ...allPlaceBookings].forEach((item) => {
      const offset = dayOffsetOf(item.date);
      countByOffset.set(offset, (countByOffset.get(offset) ?? 0) + 1);
    });

    return Array.from(countByOffset.entries())
      .sort(([a], [b]) => a - b)
      .map(([offset, count]) => ({
        offset,
        date: dateFromOffset(offset),
        isPast: offset < 0,
        count,
      }));
  }, [agenda, allPlaceBookings]);

  const resolvedOffset =
    selectedOffset !== null && days.some((day) => day.offset === selectedOffset)
      ? selectedOffset
      : days.length
        ? defaultDayOffset(days.map((day) => day.offset))
        : null;

  const items: CalendarItem[] = useMemo(
    () =>
      resolvedOffset === null
        ? []
        : agenda.filter((item) => dayOffsetOf(item.date) === resolvedOffset),
    [agenda, resolvedOffset],
  );

  const attended = useMemo(() => agenda.filter((item) => item.isPast), [agenda]);
  const { written } = useMyReviews(attended, userId);
  const writtenByExperienceId = useMemo(
    () => new Map(written.map((review: WrittenReview) => [review.experienceId, review])),
    [written],
  );

  return {
    isLoading: isLoadingPurchases || isLoadingReserved || isLoadingPlaceBookings,
    items,
    days,
    selectedOffset: resolvedOffset,
    writtenByExperienceId,
    placeBookings:
      resolvedOffset === null
        ? []
        : allPlaceBookings.filter((item) => dayOffsetOf(item.date) === resolvedOffset),
  };
};
