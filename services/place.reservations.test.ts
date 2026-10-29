import { api, apiWithToken } from '@/services/apiService';

import {
  fetchPlaceAvailability,
  fetchPlaceReservationProfile,
  fetchPlaceReservationProfiles,
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
