import { apiWithToken } from '@/services/apiService';

import {
  acceptCommunityInvite,
  declineCommunityInvite,
  fetchCommunityInvites,
  messageCommunityMembers,
} from './community';

jest.mock('@/services/apiService', () => ({
  api: { get: jest.fn(), post: jest.fn() },
  apiWithToken: jest.fn(),
}));

const get = jest.fn();
const post = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  (apiWithToken as jest.Mock).mockResolvedValue({ get, post });
});

// DEV-380
describe('fetchCommunityInvites', () => {
  it('reads the invites with who sent them', async () => {
    get.mockResolvedValue({
      status: 200,
      data: {
        count: 1,
        results: [
          {
            id: 'c1',
            title: 'Nairobi Hikers',
            invite: {
              id: 'm1',
              role: 'regular',
              invited_by: { id: 'u9', display_name: 'Amina' },
              date_invited: '2026-11-19T10:00:00Z',
            },
          },
        ],
      },
    });

    const result = await fetchCommunityInvites();

    expect(get).toHaveBeenCalledWith('/v1/communities/invites/', expect.anything());
    expect(result.data.results[0].invite.invitedBy.displayName).toBe('Amina');
  });

  it('reports a failure rather than throwing', async () => {
    get.mockRejectedValue({ response: { status: 500, data: {} } });

    const result = await fetchCommunityInvites();

    expect(result.success).toBe(false);
  });
});

// DEV-381
describe('answering an invite', () => {
  it('accepts through accept-invite, not request-to-join', async () => {
    post.mockResolvedValue({ status: 200, data: { invite_status: 'accepted' } });

    await acceptCommunityInvite('c1');

    expect(post).toHaveBeenCalledWith('/v1/communities/c1/accept-invite/');
  });

  it('declines through decline-invite', async () => {
    post.mockResolvedValue({ status: 204 });

    await declineCommunityInvite('c1');

    expect(post).toHaveBeenCalledWith('/v1/communities/c1/decline-invite/');
  });

  it('throws the API reason when there is no invite', async () => {
    post.mockRejectedValue({
      response: { status: 400, data: { detail: "You don't have an invite to 'Nairobi Hikers'." } },
    });

    await expect(declineCommunityInvite('c1')).rejects.toThrow(/invite/);
  });
});

// DEV-379
describe('messageCommunityMembers', () => {
  it('sends the message and reports how many got it', async () => {
    post.mockResolvedValue({ status: 201, data: { sent: 12 } });

    const result = await messageCommunityMembers('c1', 'Hike moved to 7am');

    expect(post).toHaveBeenCalledWith('/v1/communities/c1/message-members/', {
      content: 'Hike moved to 7am',
    });
    expect(result).toEqual({ sent: 12 });
  });

  it('throws when the reader may not message the members', async () => {
    post.mockRejectedValue({ response: { status: 403, data: { detail: 'Only the owner' } } });

    await expect(messageCommunityMembers('c1', 'Hi')).rejects.toThrow();
  });
});
