import { api, apiWithToken } from '@/services/apiService';

import {
  buyPlaceBoost,
  changePlaceBooking,
  fetchBoostPackages,
  fetchMyPlaceClaims,
  fetchPlaceAvailability,
  fetchPlaceBoosts,
  fetchPlaceCommunities,
  fetchPlaceGuides,
  fetchPlaceReservationProfile,
  fetchPlaceReservationProfiles,
  markPlaceBookingNoShow,
  reorderPlacePhotos,
} from './place';

jest.mock('@/services/apiService', () => ({
  api: { get: jest.fn() },
  apiWithToken: jest.fn(),
}));

const mockGet = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (apiWithToken as jest.Mock).mockResolvedValue({ get: mockGet });
});

describe('the reservation reads', () => {
  it('go out with the reader’s token, not as an anonymous request', async () => {
    mockGet.mockResolvedValue({ status: 200, data: { results: [] } });

    await fetchPlaceReservationProfiles('p1');
    await fetchPlaceReservationProfile('p1', 'rp1');
    await fetchPlaceAvailability('p1', 'rp1');

    expect(api.get).not.toHaveBeenCalled();
    expect(mockGet).toHaveBeenCalledTimes(4);
  });

  it('read the profile list from the place', async () => {
    mockGet.mockResolvedValue({ status: 200, data: { results: [{ seating_capacity: 10 }] } });

    const response = await fetchPlaceReservationProfiles('p1');

    expect(mockGet).toHaveBeenCalledWith('/v1/places/p1/reservation-profile/');
    expect(response.data.results[0].seatingCapacity).toBe(10);
  });
});

describe('fetchPlaceAvailability', () => {
  const respond = () =>
    mockGet.mockImplementation(async (url: string) => ({
      status: 200,
      data: {
        results: url.endsWith('availability-rules/')
          ? [{ id: 'r1', day_of_week: 0, open_time: '06:30:00', close_time: '18:30:00' }]
          : [{ id: 'x1', date: '2026-11-03', is_closed: true }],
      },
    }));

  it('asks for a full page of each, so no day is cut off', async () => {
    respond();

    await fetchPlaceAvailability('p1', 'rp1');

    expect(mockGet).toHaveBeenCalledWith(
      '/v1/places/p1/reservation-profile/rp1/availability-rules/',
      { params: { page_size: 100 } },
    );
    expect(mockGet).toHaveBeenCalledWith(
      '/v1/places/p1/reservation-profile/rp1/availability-exceptions/',
      { params: { page_size: 100 } },
    );
  });

  it('returns the weekly hours and the closures', async () => {
    respond();

    const { data } = await fetchPlaceAvailability('p1', 'rp1');

    expect(data.rules[0]).toMatchObject({ dayOfWeek: 0, openTime: '06:30:00' });
    expect(data.exceptions[0]).toMatchObject({ date: '2026-11-03', isClosed: true });
  });

  it('says why when the read is refused, as when the allowance has run out', async () => {
    mockGet.mockRejectedValue({
      response: { status: 429, data: { detail: 'Request was throttled.' } },
    });
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(fetchPlaceAvailability('p1', 'rp1')).rejects.toMatchObject({
      status: 429,
      success: false,
    });
  });
});

// DEV-407: hosts mark a guest who didn't come, and undo it
describe('markPlaceBookingNoShow', () => {
  const mockPost = jest.fn();
  beforeEach(() => {
    (apiWithToken as jest.Mock).mockResolvedValue({ post: mockPost });
  });

  it('marks, and undoes, with no_show on the purchase', async () => {
    mockPost.mockResolvedValue({
      status: 200,
      data: { id: 'pu1', booking_status: 'no_show', no_show_at: '2026-11-03T20:00:00Z' },
    });

    const marked = await markPlaceBookingNoShow('pu1', true);
    expect(mockPost).toHaveBeenCalledWith('/v1/experiences/purchases/pu1/no-show/', {
      no_show: true,
    });
    expect(marked.data).toMatchObject({ bookingStatus: 'no_show' });

    await markPlaceBookingNoShow('pu1', false);
    expect(mockPost).toHaveBeenLastCalledWith('/v1/experiences/purchases/pu1/no-show/', {
      no_show: false,
    });
  });

  it('says why when the API refuses', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockPost.mockRejectedValue({
      response: {
        status: 400,
        data: {
          type: 'validation_error',
          errors: [
            {
              code: 'invalid',
              detail: 'A booking can only be marked as a no-show once its time has come.',
              attr: null,
            },
          ],
        },
      },
    });

    await expect(markPlaceBookingNoShow('pu1', true)).rejects.toMatchObject({
      status: 400,
      message: 'A booking can only be marked as a no-show once its time has come.',
    });
  });
});

// DEV-389: changing an unpaid booking
describe('changePlaceBooking', () => {
  const mockPost = jest.fn();
  beforeEach(() => {
    (apiWithToken as jest.Mock).mockResolvedValue({ post: mockPost });
  });

  it('sends the new day, time, party and message to the booking', async () => {
    mockPost.mockResolvedValue({ status: 200, data: { id: 'pu1', status: 'requested' } });

    await changePlaceBooking('pu1', {
      requestedDate: '2026-11-05',
      requestedTime: '20:00',
      partySize: 4,
      specialRequests: 'Window seat',
    });

    expect(mockPost).toHaveBeenCalledWith('/v1/experiences/purchases/pu1/change/', {
      requested_date: '2026-11-05',
      requested_time: '20:00',
      party_size: 4,
      special_requests: 'Window seat',
    });
  });

  it('says why when it is refused', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockPost.mockRejectedValue({
      response: {
        status: 400,
        data: { errors: [{ code: 'not_changeable', detail: 'Paid bookings can’t be changed.' }] },
      },
    });

    await expect(
      changePlaceBooking('pu1', {
        requestedDate: '2026-11-05',
        requestedTime: '20:00',
        partySize: 2,
      }),
    ).rejects.toMatchObject({ status: 400, message: 'Paid bookings can’t be changed.' });
  });
});

// DEV-391: the person's claims, from the server
describe('fetchMyPlaceClaims', () => {
  it('reads every claim, with its status and decided date', async () => {
    mockGet.mockResolvedValue({
      status: 200,
      data: {
        results: [{ id: 'o1', status: 'approved', decided_at: '2026-11-11T08:00:00Z' }],
      },
    });

    const rows = await fetchMyPlaceClaims();

    expect(mockGet).toHaveBeenCalledWith('/v1/places/claims/', { params: { page_size: 100 } });
    expect(rows).toEqual([{ id: 'o1', status: 'approved', decidedAt: '2026-11-11T08:00:00Z' }]);
  });
});

// DEV-390: a place's photos in a new order, first one the cover
describe('reorderPlacePhotos', () => {
  const mockPatch = jest.fn();
  beforeEach(() => {
    (apiWithToken as jest.Mock).mockResolvedValue({ patch: mockPatch });
  });

  it('sends every photo id in the new order', async () => {
    mockPatch.mockResolvedValue({ status: 200, data: [] });

    await reorderPlacePhotos('pl1', ['ph2', 'ph1']);

    expect(mockPatch).toHaveBeenCalledWith('/v1/places/pl1/photos/reorder/', {
      photo_ids: ['ph2', 'ph1'],
    });
  });

  it('says why when the list is refused', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockPatch.mockRejectedValue({
      response: {
        status: 400,
        data: {
          errors: [{ code: 'invalid', detail: 'List every photo of the place exactly once.' }],
        },
      },
    });

    await expect(reorderPlacePhotos('pl1', ['ph1'])).rejects.toMatchObject({
      message: 'List every photo of the place exactly once.',
    });
  });
});

// DEV-392: boosting a place
describe('place boosts', () => {
  const mockPost = jest.fn();
  beforeEach(() => {
    (apiWithToken as jest.Mock).mockResolvedValue({ get: mockGet, post: mockPost });
  });

  it('reads the packages on offer', async () => {
    mockGet.mockResolvedValue({
      data: [
        {
          id: 'pk1',
          name: 'Week',
          description: '',
          duration_days: 7,
          price: { amount: '1000', currency: 'KES' },
        },
      ],
    });

    await expect(fetchBoostPackages()).resolves.toEqual([
      {
        id: 'pk1',
        name: 'Week',
        description: '',
        durationDays: 7,
        price: { amount: '1000', currency: 'KES' },
      },
    ]);
    expect(mockGet).toHaveBeenCalledWith('/v1/places/boost-packages/');
  });

  it('reads a place’s boosts', async () => {
    mockGet.mockResolvedValue({ data: { results: [{ id: 'b1', is_live: true }] } });

    await expect(fetchPlaceBoosts('pl1')).resolves.toEqual([{ id: 'b1', isLive: true }]);
    expect(mockGet).toHaveBeenCalledWith('/v1/places/pl1/boosts/', { params: { page_size: 50 } });
  });

  it('buys a boost, once per key, and hands back its checkout', async () => {
    mockPost.mockResolvedValue({
      data: {
        boost: { id: 'b9', status: 'pending' },
        payment: { authorization_url: 'https://checkout.paystack.com/x' },
      },
    });

    await expect(buyPlaceBoost('pl1', 'pk1', 'key-1')).resolves.toEqual({
      boost: { id: 'b9', status: 'pending' },
      checkoutUrl: 'https://checkout.paystack.com/x',
    });
    expect(mockPost).toHaveBeenCalledWith('/v1/places/pl1/boosts/', {
      package_id: 'pk1',
      idempotency_key: 'key-1',
    });
  });

  it('says why a boost could not be bought', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockPost.mockRejectedValue({
      response: {
        status: 400,
        data: {
          errors: [
            { code: 'place_not_published', detail: 'Publish the place before boosting it.' },
          ],
        },
      },
    });

    await expect(buyPlaceBoost('pl1', 'pk1', 'key-1')).rejects.toThrow(
      'Publish the place before boosting it.',
    );
  });
});

// DEV-385/386: who a place is linked to
describe('place communities and guides', () => {
  it('reads the communities linked to a place', async () => {
    mockGet.mockResolvedValue({
      data: {
        results: [{ id: 'c1', relationship: 'owner', experiences_count: 2, members_count: 9 }],
      },
    });

    await expect(fetchPlaceCommunities('pl1')).resolves.toEqual([
      { id: 'c1', relationship: 'owner', experiencesCount: 2, membersCount: 9 },
    ]);
    expect(mockGet).toHaveBeenCalledWith('/v1/places/pl1/communities/', {
      params: { page_size: 20 },
    });
  });

  it('reads the tour guides at a place', async () => {
    mockGet.mockResolvedValue({
      data: {
        results: [
          { id: 'g1', experiences_count: 3, average_rating: 4.5, user: { first_name: 'A' } },
        ],
      },
    });

    await expect(fetchPlaceGuides('pl1')).resolves.toEqual([
      { id: 'g1', experiencesCount: 3, averageRating: 4.5, user: { firstName: 'A' } },
    ]);
    expect(mockGet).toHaveBeenCalledWith('/v1/places/pl1/guides/', { params: { page_size: 20 } });
  });
});
