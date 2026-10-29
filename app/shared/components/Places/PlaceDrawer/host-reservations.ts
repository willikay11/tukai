import { PlaceBookingRequest } from '@/types/placeReservation';
import { linkedUserName } from '@/types/user';

import { dayKey } from './week-strip';

export type HostReservationGroup = 'reservations' | 'admitted' | 'no-show';

export const HOST_RESERVATION_GROUPS: { id: HostReservationGroup; label: string }[] = [
  { id: 'reservations', label: 'Reservations' },
  { id: 'admitted', label: 'Admitted' },
  { id: 'no-show', label: 'No show' },
];

export type HostSummaryTab = 'request' | 'confirmed' | 'admitted' | 'no-show';

/** The four counts the place page shows, and the list group each one opens. */
export const HOST_SUMMARY_TABS: {
  id: HostSummaryTab;
  label: string;
  group: HostReservationGroup;
}[] = [
  { id: 'request', label: 'Requests', group: 'reservations' },
  { id: 'confirmed', label: 'Confirmed', group: 'reservations' },
  { id: 'admitted', label: 'Admitted', group: 'admitted' },
  { id: 'no-show', label: 'No show', group: 'no-show' },
];

const OPEN_STATUSES = new Set<PlaceBookingRequest['status']>([
  'requested',
  'accepted',
  'pending',
  'completed',
]);
const MISSED_STATUSES = new Set<PlaceBookingRequest['status']>([
  'declined',
  'cancelled',
  'expired',
]);

export type HostReservation = PlaceBookingRequest & {
  start: Date;
  dayKey: string;
  group: HostReservationGroup;
  guestName: string;
  partySize: number;
  note: string;
};

const groupOf = (status: PlaceBookingRequest['status']): HostReservationGroup | null => {
  if (status === 'redeemed') return 'admitted';
  if (OPEN_STATUSES.has(status)) return 'reservations';
  return MISSED_STATUSES.has(status) ? 'no-show' : null;
};

export const hostReservations = (requests: PlaceBookingRequest[]): HostReservation[] =>
  requests
    .map((request): HostReservation | null => {
      const group = groupOf(request.status);
      const start = new Date(request.occurrence?.startDate ?? Number.NaN);
      if (!group || Number.isNaN(start.getTime())) return null;

      return {
        ...request,
        start,
        dayKey: dayKey(start),
        group,
        guestName: linkedUserName(request.user),
        partySize: request.restaurantDetail?.partySize ?? 1,
        note: request.restaurantDetail?.specialRequests || request.message || '',
      };
    })
    .filter((reservation): reservation is HostReservation => reservation !== null)
    .sort((left, right) => left.start.getTime() - right.start.getTime());

export const summaryTabOf = (reservation: HostReservation): HostSummaryTab => {
  if (reservation.group === 'admitted' || reservation.group === 'no-show') return reservation.group;
  return reservation.status === 'requested' ? 'request' : 'confirmed';
};

export const summaryCounts = (reservations: HostReservation[]): Record<HostSummaryTab, number> => {
  const counts: Record<HostSummaryTab, number> = {
    request: 0,
    confirmed: 0,
    admitted: 0,
    'no-show': 0,
  };
  for (const reservation of reservations) counts[summaryTabOf(reservation)] += 1;
  return counts;
};

export const isAwaitingAnswer = (reservation: HostReservation): boolean =>
  reservation.status === 'requested';

export const isAdmittable = (reservation: HostReservation): boolean =>
  reservation.status === 'completed';

export const paymentLine = (reservation: HostReservation): string | null => {
  if (reservation.status === 'accepted') return 'Payment due';
  if (reservation.status === 'pending') return 'Payment pending';
  return null;
};

export const reservationsOnDay = (
  reservations: HostReservation[],
  key: string,
): HostReservation[] => reservations.filter((reservation) => reservation.dayKey === key);

export const inGroup = (
  reservations: HostReservation[],
  group: HostReservationGroup,
): HostReservation[] => reservations.filter((reservation) => reservation.group === group);

export const liveCountsByDay = (reservations: HostReservation[]): Map<string, number> => {
  const counts = new Map<string, number>();
  for (const reservation of inGroup(reservations, 'reservations')) {
    counts.set(reservation.dayKey, (counts.get(reservation.dayKey) ?? 0) + 1);
  }
  return counts;
};

export const daysAwaitingAnswer = (reservations: HostReservation[]): Set<string> =>
  new Set(reservations.filter(isAwaitingAnswer).map((reservation) => reservation.dayKey));

export const awaitingAnswerCount = (reservations: HostReservation[]): number =>
  reservations.filter(isAwaitingAnswer).length;

export const matchesGuest = (reservation: HostReservation, query: string): boolean => {
  const needle = query.trim().toLowerCase();
  return !needle || reservation.guestName.toLowerCase().includes(needle);
};
