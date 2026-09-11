import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Community, CommunityMember } from '@/types/community';

import { JoinCommunityPanel } from './JoinCommunityPanel';

const refresh = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const joinMutate = jest.fn();
const leaveMutate = jest.fn();
jest.mock('@/app/shared/hooks/useCommunities', () => ({
  useJoinCommunity: () => ({ mutate: joinMutate, isPending: false }),
  useLeaveCommunity: () => ({ mutate: leaveMutate, isPending: false }),
}));

const member = (id: string, inviteStatus: CommunityMember['inviteStatus']): CommunityMember =>
  ({
    id: `m-${id}`,
    user: { id, firstName: 'Ada', lastName: 'L', displayName: 'Ada', picture: null },
    role: 'regular',
    dateCreated: '2026-01-01',
    inviteStatus,
  }) as unknown as CommunityMember;

const community = (overrides: Partial<Community> = {}): Community =>
  ({
    id: 'c1',
    title: 'Hikers',
    description: '',
    categories: [],
    isPublic: true,
    members: [],
    membersCount: 4,
    dateCreated: '2026-01-01',
    dateModified: '2026-01-01',
    ...overrides,
  }) as unknown as Community;

describe('JoinCommunityPanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('offers to join when the reader is not a member', () => {
    render(<JoinCommunityPanel community={community()} currentUserId="u1" />);

    expect(screen.getByRole('button', { name: 'Join Community' })).toBeEnabled();
  });

  it('offers to leave when the reader is already a member', () => {
    render(
      <JoinCommunityPanel
        community={community({ members: [member('u1', 'accepted')] })}
        currentUserId="u1"
      />,
    );

    expect(screen.getByRole('button', { name: /Leave community/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Join Community' })).not.toBeInTheDocument();
  });

  it('shows a pending request rather than a leave action', () => {
    render(
      <JoinCommunityPanel
        community={community({ isPublic: false, members: [member('u1', 'requested')] })}
        currentUserId="u1"
      />,
    );

    expect(screen.getByRole('button', { name: 'Request pending' })).toBeDisabled();
  });

  it('switches to leave once a public join succeeds', async () => {
    const user = userEvent.setup();
    joinMutate.mockImplementation((_id, { onSuccess }) => onSuccess());

    render(<JoinCommunityPanel community={community()} currentUserId="u1" />);
    await user.click(screen.getByRole('button', { name: 'Join Community' }));

    expect(await screen.findByRole('button', { name: /Leave community/ })).toBeInTheDocument();
    expect(refresh).toHaveBeenCalled();
  });

  it('keeps a private join as a pending request', async () => {
    const user = userEvent.setup();
    joinMutate.mockImplementation((_id, { onSuccess }) => onSuccess());

    render(<JoinCommunityPanel community={community({ isPublic: false })} currentUserId="u1" />);
    await user.click(screen.getByRole('button', { name: 'Request to Join' }));

    expect(await screen.findByRole('button', { name: 'Request pending' })).toBeDisabled();
  });

  it('confirms before leaving, then removes the reader by id', async () => {
    const user = userEvent.setup();
    leaveMutate.mockImplementation((_vars, { onSuccess }) => onSuccess());

    render(
      <JoinCommunityPanel
        community={community({ members: [member('u1', 'accepted')] })}
        currentUserId="u1"
      />,
    );

    await user.click(screen.getByRole('button', { name: /Leave community/ }));
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
    expect(leaveMutate).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Leave community' }));

    expect(leaveMutate).toHaveBeenCalledWith(
      { communityId: 'c1', userId: 'u1' },
      expect.anything(),
    );
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Join Community' })).toBeInTheDocument(),
    );
  });
});
