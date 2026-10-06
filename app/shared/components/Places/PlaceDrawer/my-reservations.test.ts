import { PlaceBookingRequest } from '@/types/placeReservation';

import { upcomingReservations } from './my-reservations';

const NOW = new Date(2026, 9, 7, 12);

const booking = (
  id: string,
  startDate: string | undefined,
  status: PlaceBookingRequest['status'] = 'accepted',
): PlaceBookingRequest => ({
  id,
  status,
  occurrence: startDate ? { id: `o-${id}`, startDate } : undefined,
});

describe('upcomingReservations', () => {
  it('lists live bookings still to come, soonest first', () => {
    const list = upcomingReservations(
      [
        booking('late', '2026-10-12T19:00:00'),
        booking('early', '2026-10-09T19:00:00', 'requested'),
      ],
      NOW,
    );

    expect(list.map((entry) => entry.id)).toEqual(['early', 'late']);
  });

  it('leaves out bookings the venue has turned away or the reader cancelled', () => {
    const list = upcomingReservations(
      [
        booking('declined', '2026-10-09T19:00:00', 'declined'),
        booking('cancelled', '2026-10-09T19:00:00', 'cancelled'),
        booking('expired', '2026-10-09T19:00:00', 'expired'),
      ],
      NOW,
    );

    expect(list).toEqual([]);
  });

  it('leaves out bookings already in the past', () => {
    const list = upcomingReservations([booking('gone', '2026-10-06T19:00:00')], NOW);

    expect(list).toEqual([]);
  });

  it('leaves out a booking with no day to sit on', () => {
    expect(upcomingReservations([booking('undated', undefined)], NOW)).toEqual([]);
  });
});
