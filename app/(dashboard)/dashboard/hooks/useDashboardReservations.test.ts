import { renderHook } from '@testing-library/react';

import { useDashboardReservations } from './useDashboardReservations';

jest.mock('@/app/shared/hooks/useExperiences', () => ({
  useTicketPurchases: () => ({ data: { data: { results: [] } }, isLoading: false }),
  useExperiences: () => ({ data: { data: { results: [] } }, isLoading: false }),
}));
jest.mock('@/app/(profile)/hooks/useMyReviews', () => ({ useMyReviews: () => ({ written: [] }) }));

let mockBookings: unknown[] = [];
const usePlaceBookings = jest.fn();
jest.mock('@/app/shared/hooks/usePlaces', () => ({
  usePlaceBookings: (...args: unknown[]) => {
    usePlaceBookings(...args);
    return { data: mockBookings, isLoading: false };
  },
}));

const dayFromNow = (days: number, hour = 19) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

const booking = (id: string, startDate: string) => ({
  id,
  status: 'completed',
  bookingStatus: 'confirmed',
  occurrence: { id: `o-${id}`, startDate },
  restaurantDetail: { partySize: 2 },
  experience: {
    id: 'x',
    experienceType: 'restaurant_reservation',
    place: { id: 'pl1', slug: 'thyme', title: 'About Thyme', photos: [] },
  },
});

// DEV-387: My reservations shows the person's bookings at places
describe('useDashboardReservations, place bookings', () => {
  beforeEach(() => {
    usePlaceBookings.mockClear();
    mockBookings = [];
  });

  it('reads the person’s own bookings at every place, in one request', () => {
    renderHook(() => useDashboardReservations('u1', null));

    expect(usePlaceBookings).toHaveBeenCalledWith('guest', { enabled: true });
  });

  it('puts each booking’s day on the date rail', () => {
    mockBookings = [
      booking('a', dayFromNow(1)),
      booking('b', dayFromNow(1, 21)),
      booking('c', dayFromNow(3)),
    ];
    const { result } = renderHook(() => useDashboardReservations('u1', null));

    expect(result.current.days.map((day) => [day.offset, day.count])).toEqual([
      [1, 2],
      [3, 1],
    ]);
  });

  it('shows the bookings on the day picked, the soonest day first by default', () => {
    mockBookings = [booking('a', dayFromNow(1)), booking('c', dayFromNow(3))];

    const first = renderHook(() => useDashboardReservations('u1', null));
    expect(first.result.current.placeBookings.map((item) => item.key)).toEqual(['a']);

    const later = renderHook(() => useDashboardReservations('u1', 3));
    expect(later.result.current.placeBookings.map((item) => item.key)).toEqual(['c']);
  });

  it('has none when there are none', () => {
    const { result } = renderHook(() => useDashboardReservations('u1', null));

    expect(result.current.placeBookings).toEqual([]);
    expect(result.current.days).toEqual([]);
  });
});
