import { useMemo } from 'react';

import { buildCalendarAgenda, CalendarItem } from '@/app/(profile)/hooks/calendar-agenda';
import { useMyReviews, WrittenReview } from '@/app/(profile)/hooks/useMyReviews';
import { useExperiences, useTicketPurchases } from '@/app/shared/hooks/useExperiences';
import { Experience } from '@/types/experience';
import { TicketPurchase } from '@/types/ticket-purchase';

import { DateRailDay } from '../components/DateRail';
import { dateFromOffset, dayOffsetOf, defaultDayOffset } from '../utils/day-offset';
import { PlaceBookingStatusVm } from '../utils/place-booking-status';

/**
 * A booking at a place, shaped for the "Place booking" item row. Nothing
 * populates this yet - see the hook's own doc comment - but the type and the
 * row it renders are real, so wiring a real source later is a data change,
 * not a UI one.
 */
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
 * Place bookings are a third item type the handoff calls for, but there is no
 * endpoint for "all of my bookings across every place" - only a per-place
 * query. This returns an empty `placeBookings` array until that exists; see
 * the Dashboard backend-gaps note.
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

  const days: DateRailDay[] = useMemo(() => {
    const countByOffset = new Map<number, number>();
    agenda.forEach((item) => {
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
  }, [agenda]);

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
    isLoading: isLoadingPurchases || isLoadingReserved,
    items,
    days,
    selectedOffset: resolvedOffset,
    writtenByExperienceId,
    // Stubbed pending a cross-place bookings endpoint - see backend-gaps note.
    placeBookings: [] as DashboardPlaceBookingItem[],
  };
};
