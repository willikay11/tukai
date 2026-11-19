import moment from 'moment';

import { coverPhotoUrl } from '@/types/photo';
import { PlaceBookingRequest, bookingStatusOf } from '@/types/placeReservation';
import { placePath } from '@/utils/detail-paths';
import { formatCurrencyAmount } from '@/utils/money';

import type { DashboardPlaceBookingItem } from '../hooks/useDashboardReservations';
import { dayOffsetOf } from './day-offset';
import { mapPlaceBookingStatus } from './place-booking-status';

/** Bookings that stay a couple of days after their date, so the guest sees the outcome */
const LINGERING = new Set(['declined', 'expired', 'not_paid_in_time']);
const LINGER_DAYS = 2;

/**
 * One of the person's own bookings at a place, as the Dashboard's
 * My reservations row draws it (DEV-387), or null when it isn't shown.
 *
 * Per the handoff: today and later; declined, expired and released ones stay
 * for 2 days after their date; cancelled ones never show.
 */
export const toDashboardPlaceBooking = (
  booking: PlaceBookingRequest,
  now: Date = new Date(),
): DashboardPlaceBookingItem | null => {
  const place = booking.experience?.place;
  const date = booking.occurrence?.startDate;
  if (!place || !date || Number.isNaN(new Date(date).getTime())) return null;

  const state = bookingStatusOf(booking);
  const offset = dayOffsetOf(date, now);
  if (offset < (LINGERING.has(state) ? -LINGER_DAYS : 0)) return null;

  const due = booking.depositAmount ?? booking.balanceDue;
  const status = mapPlaceBookingStatus(state, due ? formatCurrencyAmount(due) : '');
  if (!status) return null;

  return {
    key: booking.id,
    date,
    placeName: place.title,
    image: coverPhotoUrl(place.photos, 'thumb') || undefined,
    party: booking.restaurantDetail?.partySize ?? 1,
    time: moment(date).format('h:mm A'),
    isRestaurant: booking.experience?.experienceType !== 'cinema_reservation',
    status,
    onOpenHref: placePath(place),
  };
};
