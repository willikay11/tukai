import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Community, CommunityMember } from '@/types/community';

import { CommunityDrawerFooter } from './CommunityDrawerFooter';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={`icon-${iconName}`} />,
}));

jest.mock('@/app/shared/components/SendMessage', () => ({
  SendMessage: ({ open }: { open: boolean }) => (open ? <div data-testid="send-message" /> : null),
}));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const needAuth = jest.fn();
jest.mock('@/context/AuthDialogContext', () => ({
  useAuthDialog: () => ({ needAuth }),
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

const owner: CommunityMember = {
  id: 'm-owner',
  role: 'owner',
  user: { id: 'owner-1' },
} as never;

const onShareMoment = jest.fn();
const onBlockedShareMoment = jest.fn();

describe('CommunityDrawerFooter', () => {
  beforeEach(() => jest.clearAllMocks());

  it('offers to join when not a member', async () => {
    render(
      <CommunityDrawerFooter
        community={community()}
        currentUserId="u1"
        isOwnerSelf={false}
        onShareMoment={onShareMoment}
        onBlockedShareMoment={onBlockedShareMoment}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Join community' }));

    expect(joinCommunity).toHaveBeenCalledWith('c1', expect.anything());
  });

  it('sends a signed-out reader to sign in before joining', async () => {
    render(
      <CommunityDrawerFooter
        community={community()}
        isOwnerSelf={false}
        onShareMoment={onShareMoment}
        onBlockedShareMoment={onBlockedShareMoment}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Join community' }));

    expect(joinCommunity).not.toHaveBeenCalled();
    expect(needAuth).toHaveBeenCalled();
  });

  it('shows the pending request as disabled once a private join is sent', async () => {
    joinCommunity.mockImplementation((_id, { onSuccess }) => onSuccess());
    render(
      <CommunityDrawerFooter
        community={community({ isPublic: false })}
        currentUserId="u1"
        isOwnerSelf={false}
        onShareMoment={onShareMoment}
        onBlockedShareMoment={onBlockedShareMoment}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Join community' }));

    expect(screen.getByRole('button', { name: 'Request pending' })).toBeDisabled();
  });

  it('offers to message the host and leave immediately for a member who is not the owner', async () => {
    render(
      <CommunityDrawerFooter
        community={community({
          members: [{ id: 'm1', user: { id: 'u1' }, inviteStatus: 'accepted' } as never],
        })}
        currentUserId="u1"
        owner={owner}
        isOwnerSelf={false}
        onShareMoment={onShareMoment}
        onBlockedShareMoment={onBlockedShareMoment}
      />,
    );

    expect(screen.getByRole('button', { name: /Message host/ })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Leave community/ }));

    expect(leaveCommunity).toHaveBeenCalledWith(
      { communityId: 'c1', userId: 'u1' },
      expect.anything(),
    );
  });

  it('offers to message members and has no Leave button for the owner', () => {
    render(
      <CommunityDrawerFooter
        community={community({
          members: [{ id: 'm1', user: { id: 'u1' }, inviteStatus: 'accepted' } as never],
        })}
        currentUserId="u1"
        owner={owner}
        isOwnerSelf
        onShareMoment={onShareMoment}
        onBlockedShareMoment={onBlockedShareMoment}
      />,
    );

    expect(screen.getByRole('button', { name: /Message members/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Leave community/ })).not.toBeInTheDocument();
  });

  it('always offers Share moment, gated on membership', async () => {
    render(
      <CommunityDrawerFooter
        community={community()}
        currentUserId="u1"
        isOwnerSelf={false}
        onShareMoment={onShareMoment}
        onBlockedShareMoment={onBlockedShareMoment}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Share moment' }));

    expect(onBlockedShareMoment).toHaveBeenCalled();
    expect(onShareMoment).not.toHaveBeenCalled();
  });
});
