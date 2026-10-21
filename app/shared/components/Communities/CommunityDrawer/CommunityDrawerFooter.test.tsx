import React from 'react';

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Community } from '@/types/community';

import { CommunityDrawerFooter } from './CommunityDrawerFooter';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={`icon-${iconName}`} />,
}));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const openSignInWithCallback = jest.fn();
jest.mock('@/context/AuthDialogContext', () => ({
  useAuthDialog: () => ({ openSignInWithCallback }),
}));

const joinCommunity = jest.fn();
const leaveCommunity = jest.fn();
jest.mock('@/app/shared/hooks/useCommunities', () => ({
  useJoinCommunity: () => ({ mutate: joinCommunity, isPending: false }),
  useLeaveCommunity: () => ({ mutate: leaveCommunity, isPending: false }),
}));

const community = (overrides: Partial<Community> = {}): Community =>
  ({
    id: 'c1',
    title: 'Nairobi Trail Runners',
    isPublic: true,
    members: [],
    ...overrides,
  }) as Community;

describe('CommunityDrawerFooter', () => {
  beforeEach(() => jest.clearAllMocks());

  it('offers to join a public community', async () => {
    render(<CommunityDrawerFooter community={community()} currentUserId="u1" />);

    await userEvent.click(screen.getByRole('button', { name: 'Join community' }));

    expect(joinCommunity).toHaveBeenCalledWith('c1', expect.anything());
  });

  it('offers to request to join a private one', () => {
    render(<CommunityDrawerFooter community={community({ isPublic: false })} currentUserId="u1" />);

    expect(screen.getByRole('button', { name: 'Request to join' })).toBeInTheDocument();
  });

  it('sends a signed-out reader to sign in before joining', async () => {
    render(<CommunityDrawerFooter community={community()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Join community' }));

    expect(joinCommunity).not.toHaveBeenCalled();
    expect(openSignInWithCallback).toHaveBeenCalled();
  });

  it('shows the pending request as disabled', async () => {
    joinCommunity.mockImplementation((_id, { onSuccess }) => onSuccess());
    render(<CommunityDrawerFooter community={community({ isPublic: false })} currentUserId="u1" />);

    // Click through the mocked join to reach the pending state
    await userEvent.click(screen.getByRole('button', { name: 'Request to join' }));

    expect(screen.getByRole('button', { name: 'Request pending' })).toBeDisabled();
  });

  it('offers to leave a community the reader is on', () => {
    render(
      <CommunityDrawerFooter
        community={community({
          members: [{ id: 'm1', user: { id: 'u1' }, inviteStatus: 'accepted' } as never],
        })}
        currentUserId="u1"
      />,
    );

    expect(screen.getByRole('button', { name: /Leave community/ })).toBeInTheDocument();
  });

  it('confirms before leaving, and tells a private member rejoining needs an invite', async () => {
    render(
      <CommunityDrawerFooter
        community={community({
          isPublic: false,
          members: [{ id: 'm1', user: { id: 'u1' }, inviteStatus: 'accepted' } as never],
        })}
        currentUserId="u1"
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /Leave community/ }));

    const dialog = screen.getByRole('alertdialog');
    expect(within(dialog).getByText(/Rejoining needs an administrator/)).toBeInTheDocument();

    leaveCommunity.mockImplementation((_payload, { onSuccess }) => onSuccess());
    await userEvent.click(within(dialog).getByRole('button', { name: 'Leave community' }));

    expect(leaveCommunity).toHaveBeenCalledWith(
      { communityId: 'c1', userId: 'u1' },
      expect.anything(),
    );
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Left community' }));
  });

  it('backs out of the leave confirm on "Stay a member"', async () => {
    render(
      <CommunityDrawerFooter
        community={community({
          members: [{ id: 'm1', user: { id: 'u1' }, inviteStatus: 'accepted' } as never],
        })}
        currentUserId="u1"
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /Leave community/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Stay a member' }));

    expect(leaveCommunity).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});
