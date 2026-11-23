import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Community, CommunityMember } from '@/types/community';

import { JoinCommunityPanel } from './JoinCommunityPanel';

const refresh = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));
const needAuth = jest.fn();
jest.mock('@/context/AuthDialogContext', () => ({
  useAuthDialog: () => ({ needAuth }),
}));

const joinMutate = jest.fn();
const leaveMutate = jest.fn();
const acceptMutate = jest.fn();
const declineMutate = jest.fn();
jest.mock('@/app/shared/hooks/useCommunities', () => ({
  useJoinCommunity: () => ({ mutate: joinMutate, isPending: false }),
  useLeaveCommunity: () => ({ mutate: leaveMutate, isPending: false }),
  useAcceptCommunityInvite: () => ({ mutate: acceptMutate, isPending: false }),
  useDeclineCommunityInvite: () => ({ mutate: declineMutate, isPending: false }),
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

  // DEV-447: a private community keeps admin approval
  it('shows a request as Requested, with a way to withdraw it', () => {
    render(
      <JoinCommunityPanel
        community={community({ isPublic: false, members: [member('u1', 'requested')] })}
        currentUserId="u1"
      />,
    );

    expect(screen.getByText('Requested')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Withdraw request' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: /Leave community/ })).not.toBeInTheDocument();
  });

  it('withdraws the request through leave, and offers to ask again', async () => {
    const user = userEvent.setup();
    leaveMutate.mockImplementation((_vars, { onSuccess }) => onSuccess());
    render(
      <JoinCommunityPanel
        community={community({ isPublic: false, members: [member('u1', 'requested')] })}
        currentUserId="u1"
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Withdraw request' }));

    expect(leaveMutate).toHaveBeenCalledWith(
      { communityId: 'c1', userId: 'u1' },
      expect.anything(),
    );
    expect(await screen.findByRole('button', { name: 'Request to Join' })).toBeEnabled();
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Request to join Hikers withdrawn.' }),
    );
  });

  // An invite was a disabled "Request pending" with no way to accept it
  it('lets an invited reader accept straight away', async () => {
    const user = userEvent.setup();
    acceptMutate.mockImplementation((_id, { onSuccess }) => onSuccess());
    render(
      <JoinCommunityPanel
        community={community({ isPublic: false, members: [member('u1', 'pending')] })}
        currentUserId="u1"
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Accept invite' }));

    expect(acceptMutate).toHaveBeenCalledWith('c1', expect.anything());
    expect(joinMutate).not.toHaveBeenCalled();
    expect(await screen.findByRole('button', { name: /Leave community/ })).toBeInTheDocument();
  });

  it('lets an invited reader decline', async () => {
    const user = userEvent.setup();
    declineMutate.mockImplementation((_id, { onSuccess }) => onSuccess());
    render(
      <JoinCommunityPanel
        community={community({ isPublic: false, members: [member('u1', 'pending')] })}
        currentUserId="u1"
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Decline' }));

    expect(declineMutate).toHaveBeenCalledWith('c1', expect.anything());
    expect(await screen.findByRole('button', { name: 'Request to Join' })).toBeInTheDocument();
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

    expect(await screen.findByText('Requested')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Withdraw request' })).toBeInTheDocument();
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

  /**
   * The canvas states the join policy either way rather than only flagging
   * the exception, so a reader knows where they stand before pressing.
   */
  describe('the policy chip', () => {
    it('says anyone can join an open community', () => {
      render(<JoinCommunityPanel community={community()} currentUserId="u1" />);

      expect(screen.getByText('Anyone can join')).toBeInTheDocument();
    });

    it('says private for a closed one', () => {
      render(<JoinCommunityPanel community={community({ isPublic: false })} currentUserId="u1" />);

      expect(screen.getByText('Private')).toBeInTheDocument();
      expect(screen.queryByText('Anyone can join')).not.toBeInTheDocument();
    });
  });

  // Joining a community is not booking a seat in its experiences, and the
  // canvas says so where "Joined" alone would imply otherwise
  describe('what the toasts promise', () => {
    it('does not let joining read as a reservation', async () => {
      const user = userEvent.setup();
      joinMutate.mockImplementation((_id, { onSuccess }) => onSuccess());

      render(<JoinCommunityPanel community={community()} currentUserId="u1" />);
      await user.click(screen.getByRole('button', { name: 'Join Community' }));

      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: expect.stringContaining('does not reserve a seat'),
        }),
      );
    });

    it('reassures on the way out', async () => {
      const user = userEvent.setup();
      leaveMutate.mockImplementation((_vars, { onSuccess }) => onSuccess());

      render(
        <JoinCommunityPanel
          community={community({ members: [member('u1', 'accepted')] })}
          currentUserId="u1"
        />,
      );
      await user.click(screen.getByRole('button', { name: /Leave community/ }));
      await user.click(screen.getByRole('button', { name: 'Leave community' }));

      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: expect.stringContaining('still yours'),
        }),
      );
    });
  });

  /**
   * The community page lost its auth gate in the merge - it is public to read
   * now - so a reader without an account reaches this button.
   */
  describe('a reader who is not signed in', () => {
    it('is asked to sign in rather than joining', async () => {
      const user = userEvent.setup();
      render(<JoinCommunityPanel community={community()} currentUserId="" />);

      await user.click(screen.getByRole('button', { name: 'Join Community' }));

      expect(joinMutate).not.toHaveBeenCalled();
      expect(needAuth).toHaveBeenCalled();
    });

    it('joins once signing in is done, so the press is not wasted', async () => {
      const user = userEvent.setup();
      joinMutate.mockImplementation((_id, { onSuccess }) => onSuccess());

      render(<JoinCommunityPanel community={community()} currentUserId="" />);
      await user.click(screen.getByRole('button', { name: 'Join Community' }));
      needAuth.mock.calls[0][1]();

      expect(joinMutate).toHaveBeenCalledWith('c1', expect.anything());
    });
  });
});
