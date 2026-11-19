import { bookingStatusOf } from '@/types/placeReservation';

import { mapPlaceBookingStatus } from './place-booking-status';

// DEV-407: the pills read booking_status, which has the three states the
// API used to lack
describe('mapPlaceBookingStatus', () => {
  const pill = (status: Parameters<typeof mapPlaceBookingStatus>[0]) =>
    mapPlaceBookingStatus(status, 'KES 500');

  it('shows a confirmed booking with a way to cancel it', () => {
    expect(pill('confirmed')).toMatchObject({ label: 'Confirmed', icon: 'CheckmarkCircle02Icon' });
    expect(pill('confirmed')?.actions.map((action) => action.key)).toEqual(['cancel']);
  });

  it('shows a no-show as Missed, with nothing to do', () => {
    expect(pill('no_show')).toMatchObject({ label: 'Missed', icon: 'Clock01Icon', actions: [] });
  });

  it('shows a booking not paid in time as Released, offering another time', () => {
    expect(pill('not_paid_in_time')).toMatchObject({ label: 'Released' });
    expect(pill('not_paid_in_time')?.actions.map((action) => action.key)).toEqual(['rebook']);
  });

  it('tells an unanswered expiry apart from an unpaid one', () => {
    expect(pill('expired')?.label).toBe('Expired');
  });

  it('hides cancelled and refunded bookings', () => {
    expect(pill('cancelled')).toBeNull();
    expect(pill('refunded')).toBeNull();
  });
});

describe('bookingStatusOf', () => {
  it('reads booking_status when the API sends it', () => {
    expect(bookingStatusOf({ status: 'completed', bookingStatus: 'no_show' })).toBe('no_show');
  });

  it('works it out from status for a row without it', () => {
    expect(bookingStatusOf({ status: 'completed' })).toBe('confirmed');
    expect(bookingStatusOf({ status: 'completed', noShowAt: '2026-11-03T20:00:00Z' })).toBe(
      'no_show',
    );
    expect(bookingStatusOf({ status: 'expired', payBy: '2026-11-02T10:00:00Z' })).toBe(
      'not_paid_in_time',
    );
    expect(bookingStatusOf({ status: 'expired' })).toBe('expired');
    expect(bookingStatusOf({ status: 'requested' })).toBe('requested');
  });
});
