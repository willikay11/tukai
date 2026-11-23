import { apiWithToken } from '@/services/apiService';

import { answerJoinRequest, leaveCommunity } from './community';

jest.mock('@/services/apiService', () => ({
  api: { get: jest.fn(), post: jest.fn() },
  apiWithToken: jest.fn(),
}));

const post = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  (apiWithToken as jest.Mock).mockResolvedValue({ post });
});

// DEV-447
describe('answerJoinRequest', () => {
  it('approves one person', async () => {
    post.mockResolvedValue({ status: 204 });

    await answerJoinRequest('c1', 'u2', 'accepted');

    expect(post).toHaveBeenCalledWith('/v1/communities/c1/update-join-status/', {
      invite_status: 'accepted',
      user_ids: ['u2'],
    });
  });

  it('turns one person down', async () => {
    post.mockResolvedValue({ status: 204 });

    await answerJoinRequest('c1', 'u2', 'rejected');

    expect(post).toHaveBeenCalledWith(
      '/v1/communities/c1/update-join-status/',
      expect.objectContaining({ invite_status: 'rejected' }),
    );
  });

  it('throws the API reason', async () => {
    post.mockRejectedValue({ response: { status: 400, data: { detail: 'Not a member' } } });

    await expect(answerJoinRequest('c1', 'u2', 'accepted')).rejects.toThrow();
  });
});

describe('withdrawing a request', () => {
  it('goes through leave', async () => {
    post.mockResolvedValue({
      status: 200,
      data: { result: 'Request to join community has been withdrawn.' },
    });

    await leaveCommunity('c1');

    expect(post).toHaveBeenCalledWith('/v1/communities/c1/leave/', {});
  });
});
