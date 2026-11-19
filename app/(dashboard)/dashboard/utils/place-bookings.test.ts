import { PlaceBookingRequest } from '@/types/placeReservation';

import { toDashboardPlaceBooking } from './place-bookings';

const NOW = new Date('2026-11-19T12:00:00');

const booking = (extra: Partial<PlaceBookingRequest> = {}): PlaceBookingRequest => ({
  id: 'pu1',
  status: 'completed',
  bookingStatus: 'confirmed',
  occurrence: { id: 'o1', startDate: '2026-11-20T19:00:00' },
  restaurantDetail: { partySize: 4 },
  experience: {
    id: 'x1',
    experienceType: 'restaurant_reservation',
    place: {
      id: 'pl1',
      slug: 'about-thyme',
      title: 'About Thyme',
      photos: [{ id: 'ph', mediaType: 'photo', photo: 'https://cdn/thyme.jpg', isCover: true }],
    },
  },
  ...extra,
});

// DEV-387: the person's own bookings at every place, on the Dashboard
describe('toDashboardPlaceBooking', () => {
  it('draws a booking with its place, party, time and pill', () => {
    expect(toDashboardPlaceBooking(booking(), NOW)).toMatchObject({
      key: 'pu1',
      date: '2026-11-20T19:00:00',
      placeName: 'About Thyme',
      image: 'https://cdn/thyme.jpg',
      party: 4,
      time: '7:00 PM',
      isRestaurant: true,
      onOpenHref: '/places/about-thyme',
      status: { label: 'Confirmed' },
    });
  });

  it('offers to pay what is due on an accepted booking', () => {
    const item = toDashboardPlaceBooking(
      booking({
        status: 'accepted',
        bookingStatus: 'accepted',
        depositAmount: { amount: '1500.00', currency: 'KES' },
      }),
      NOW,
    );

    expect(item?.status.actions[0].label).toBe('Pay KES 1,500.00');
  });

  it('shows today and later, and hides a confirmed booking once its day is gone', () => {
    expect(
      toDashboardPlaceBooking(
        booking({ occurrence: { id: 'o', startDate: '2026-11-19T08:00:00' } }),
        NOW,
      ),
    ).not.toBeNull();
    expect(
      toDashboardPlaceBooking(
        booking({ occurrence: { id: 'o', startDate: '2026-11-18T19:00:00' } }),
        NOW,
      ),
    ).toBeNull();
  });

  it('keeps a declined, expired or released booking for 2 days after', () => {
    const twoDaysAgo = { id: 'o', startDate: '2026-11-17T19:00:00' };
    const threeDaysAgo = { id: 'o', startDate: '2026-11-16T19:00:00' };

    for (const bookingStatus of ['declined', 'expired', 'not_paid_in_time'] as const) {
      expect(
        toDashboardPlaceBooking(booking({ bookingStatus, occurrence: twoDaysAgo }), NOW),
      ).not.toBeNull();
      expect(
        toDashboardPlaceBooking(booking({ bookingStatus, occurrence: threeDaysAgo }), NOW),
      ).toBeNull();
    }
  });

  it('never shows a cancelled booking', () => {
    expect(
      toDashboardPlaceBooking(booking({ status: 'cancelled', bookingStatus: 'cancelled' }), NOW),
    ).toBeNull();
  });

  it('leaves out a booking with no place or no date to draw', () => {
    expect(toDashboardPlaceBooking(booking({ experience: { id: 'x' } }), NOW)).toBeNull();
    expect(toDashboardPlaceBooking(booking({ occurrence: undefined }), NOW)).toBeNull();
  });

  it('calls a cinema booking a visit, not a table', () => {
    expect(
      toDashboardPlaceBooking(
        booking({
          experience: { ...booking().experience!, experienceType: 'cinema_reservation' },
        }),
        NOW,
      )?.isRestaurant,
    ).toBe(false);
  });
});
