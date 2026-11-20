import { apiWithToken } from '@/services/apiService';

import { fetchCommunityPlaces, fetchCommunityRatingSummary } from './community';

jest.mock('@/services/apiService', () => ({
  api: { get: jest.fn() },
  apiWithToken: jest.fn(),
}));

const get = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (apiWithToken as jest.Mock).mockResolvedValue({ get });
});

// DEV-382
describe('fetchCommunityPlaces', () => {
  it('reads the places with how the community knows them', async () => {
    get.mockResolvedValue({
      status: 200,
      data: { results: [{ id: 'p1', relationship: 'owned', experiences_count: 3 }] },
    });

    const result = await fetchCommunityPlaces('c1');

    expect(get).toHaveBeenCalledWith('/v1/communities/c1/places/', expect.anything());
    expect(result.data.results[0]).toEqual(
      expect.objectContaining({ relationship: 'owned', experiencesCount: 3 }),
    );
  });

  it('reports a failure rather than throwing', async () => {
    get.mockRejectedValue({ response: { status: 404, data: {} } });

    expect((await fetchCommunityPlaces('c1')).success).toBe(false);
  });
});

// DEV-383
describe('fetchCommunityRatingSummary', () => {
  it('reads the average, count and split', async () => {
    get.mockResolvedValue({
      status: 200,
      data: { average_rating: 4.6, ratings_count: 23, distribution: { '5': 20 } },
    });

    const result = await fetchCommunityRatingSummary('c1');

    expect(get).toHaveBeenCalledWith('/v1/communities/c1/ratings/summary/');
    expect(result.data).toEqual(expect.objectContaining({ averageRating: 4.6, ratingsCount: 23 }));
  });
});
