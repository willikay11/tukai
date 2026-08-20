import { apiWithToken } from '@/services/apiService';

import { fetchMoments } from './moments';

jest.mock('@/services/apiService', () => ({
  apiWithToken: jest.fn(),
}));

const mockGet = jest.fn();
const mockApiWithToken = apiWithToken as jest.Mock;

describe('fetchMoments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiWithToken.mockResolvedValue({ get: mockGet });
  });

  // Regression: /v1/moments/ 401s without a bearer token, so the unauthenticated
  // client silently produced an empty row
  it('uses the authenticated client', async () => {
    mockGet.mockResolvedValue({ status: 200, data: { count: 0, results: [] } });

    await fetchMoments();

    expect(mockApiWithToken).toHaveBeenCalled();
  });

  it('requests the moments list and camel-cases the response', async () => {
    mockGet.mockResolvedValue({
      status: 200,
      data: {
        count: 1,
        results: [
          {
            id: 'm1',
            total_likes: 4,
            author: { first_name: 'Asha', display_name: null, is_following: false },
            media: [{ id: 'md1', media_type: 'photo', photo: 'https://cdn.tukai.co/a.jpg' }],
          },
        ],
      },
    });

    const result = await fetchMoments({ page: 1, page_size: 10 });

    expect(mockGet).toHaveBeenCalledWith('/v1/moments/', { params: { page: 1, page_size: 10 } });
    expect(result.success).toBe(true);
    expect(result.data.results[0].totalLikes).toBe(4);
    expect(result.data.results[0].author.firstName).toBe('Asha');
    expect(result.data.results[0].media[0].mediaType).toBe('photo');
  });

  it('throws a normalised error when the request fails', async () => {
    mockGet.mockRejectedValue({ response: { status: 500, data: { detail: 'boom' } } });

    await expect(fetchMoments()).rejects.toMatchObject({ status: 500, success: false });
  });
});
