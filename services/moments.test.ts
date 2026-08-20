import { apiWithToken } from '@/services/apiService';

import {
  addMomentComment,
  fetchFlagReasons,
  fetchMomentComments,
  fetchMoments,
  flagComment,
  flagMoment,
  toggleCommentLike,
  toggleMomentLike,
} from './moments';

jest.mock('@/services/apiService', () => ({
  apiWithToken: jest.fn(),
}));

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockApiWithToken = apiWithToken as jest.Mock;

describe('fetchMoments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiWithToken.mockResolvedValue({ get: mockGet, post: mockPost });
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

describe('moment comments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiWithToken.mockResolvedValue({ get: mockGet, post: mockPost });
  });

  it('fetches a page of comments and camel-cases them', async () => {
    mockGet.mockResolvedValue({
      status: 200,
      data: {
        count: 1,
        results: [
          {
            id: 'c1',
            content: 'Lovely',
            total_likes: 2,
            date_created: '2026-08-01',
            commenter: { first_name: 'Asha', display_name: null },
          },
        ],
      },
    });

    const result = await fetchMomentComments('m1', { page: 1, page_size: 20 });

    expect(mockGet).toHaveBeenCalledWith('/v1/moments/m1/comments/', {
      params: { page: 1, page_size: 20 },
    });
    expect(result.data.results[0].totalLikes).toBe(2);
    expect(result.data.results[0].commenter.firstName).toBe('Asha');
  });

  it('posts a comment as { content }', async () => {
    mockPost.mockResolvedValue({ status: 201, data: { id: 'c2', content: 'Nice' } });

    await addMomentComment('m1', 'Nice');

    expect(mockPost).toHaveBeenCalledWith('/v1/moments/m1/comments/', { content: 'Nice' });
  });
});

// The read serializers carry no is_liked, so the status code is the only
// signal for whether the toggle turned the like on or off
describe('like toggles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiWithToken.mockResolvedValue({ get: mockGet, post: mockPost });
  });

  it('reads 201 as liked and 204 as unliked for a moment', async () => {
    mockPost.mockResolvedValue({ status: 201 });
    await expect(toggleMomentLike('m1')).resolves.toEqual({ isLiked: true });

    mockPost.mockResolvedValue({ status: 204 });
    await expect(toggleMomentLike('m1')).resolves.toEqual({ isLiked: false });

    expect(mockPost).toHaveBeenCalledWith('/v1/moments/m1/like/');
  });

  it('reads 201 as liked and 204 as unliked for a comment', async () => {
    mockPost.mockResolvedValue({ status: 201 });
    await expect(toggleCommentLike('m1', 'c1')).resolves.toEqual({ isLiked: true });

    mockPost.mockResolvedValue({ status: 204 });
    await expect(toggleCommentLike('m1', 'c1')).resolves.toEqual({ isLiked: false });

    expect(mockPost).toHaveBeenCalledWith('/v1/moments/m1/comments/c1/like/');
  });
});

describe('flagging', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiWithToken.mockResolvedValue({ get: mockGet, post: mockPost });
  });

  it('sends flag_reason_id in snake_case for a moment', async () => {
    mockPost.mockResolvedValue({ status: 201, data: {} });

    const result = await flagMoment('m1', 'r1');

    expect(mockPost).toHaveBeenCalledWith('/v1/moments/m1/flag/', { flag_reason_id: 'r1' });
    expect(result.status).toBe(201);
  });

  it('surfaces 204 so callers can say "already reported"', async () => {
    mockPost.mockResolvedValue({ status: 204, data: {} });

    await expect(flagComment('m1', 'c1', 'r1')).resolves.toMatchObject({ status: 204 });
    expect(mockPost).toHaveBeenCalledWith('/v1/moments/m1/comments/c1/flag/', {
      flag_reason_id: 'r1',
    });
  });

  it('fetches flag reasons', async () => {
    mockGet.mockResolvedValue({ status: 200, data: { results: [{ id: 'r1', reason: 'Spam' }] } });

    const result = await fetchFlagReasons();

    expect(mockGet).toHaveBeenCalledWith('/v1/moments/flag-reasons/');
    expect(result.data.results[0].reason).toBe('Spam');
  });
});
