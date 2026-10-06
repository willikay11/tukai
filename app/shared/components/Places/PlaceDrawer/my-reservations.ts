import { PlaceBookingRequest } from '@/types/placeReservation';

/**
 * Statuses the reader can still act on. Declined, cancelled, expired and the
 * rest have no table to turn up to, so they are not listed as upcoming.
 */
const LIVE_STATUSES = new Set<PlaceBookingRequest['status']>(['requested', 'accepted', 'pending']);

export type UpcomingReservation = PlaceBookingRequest & { start: Date };

/**
 * The reader's live reservations still to come, soonest first.
 *
 * A reservation with no occurrence, or a start that cannot be read, has no day
 * to sit on - it is left out rather than shown under a made-up date.
 */
export const upcomingReservations = (
  reservations: PlaceBookingRequest[],
  now: Date = new Date(),
): UpcomingReservation[] =>
  reservations
    .filter((reservation) => LIVE_STATUSES.has(reservation.status))
    .map((reservation) => ({
      ...reservation,
      start: new Date(reservation.occurrence?.startDate ?? Number.NaN),
    }))
    .filter((reservation) => !Number.isNaN(reservation.start.getTime()))
    .filter((reservation) => reservation.start.getTime() >= now.getTime())
    .sort((left, right) => left.start.getTime() - right.start.getTime());
