import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CommunityInvites } from '.';

let invitesResponse: unknown;
const accept = jest.fn();
const decline = jest.fn();
jest.mock('@/app/shared/hooks/useCommunities', () => ({
  useCommunityInvites: () => ({ data: invitesResponse }),
  useAcceptCommunityInvite: () => ({ mutate: accept, isPending: false }),
  useDeclineCommunityInvite: () => ({ mutate: decline, isPending: false }),
}));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const openCommunity = jest.fn();
jest.mock('@/context/CommunityDrawerContext', () => ({
  useCommunityDrawer: () => ({ openCommunity }),
}));

jest.mock('@/app/shared/components/Images', () => ({ PhotoImage: () => null }));
jest.mock('@/app/shared/components/Icons', () => ({ IconComponent: () => null }));

const invite = (id: string, title: string, by = 'Amina', members = 12) => ({
  id,
  title,
  membersCount: members,
  photos: [],
  invite: {
    id: `m-${id}`,
    role: 'regular',
    invitedBy: { id: 'u9', displayName: by },
    dateInvited: '',
  },
});

const respond = (...results: unknown[]) => {
  invitesResponse = { success: true, data: { results } };
};

// DEV-380 / DEV-381
describe('CommunityInvites', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    respond();
  });

  it('shows nothing while there are no invites', () => {
    const { container } = render(<CommunityInvites />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows nothing when the invites could not load', () => {
    invitesResponse = { success: false, message: 'Nope' };
    const { container } = render(<CommunityInvites />);
    expect(container).toBeEmptyDOMElement();
  });

  it('names the inviter and the community when there is one', () => {
    respond(invite('c1', 'Nairobi Hikers'));
    render(<CommunityInvites />);

    expect(screen.getByText('Community invites (1)')).toBeInTheDocument();
    expect(screen.getByText('Amina invited you to join Nairobi Hikers.')).toBeInTheDocument();
  });

  it('counts them when there are several', () => {
    respond(invite('c1', 'Nairobi Hikers'), invite('c2', 'Karura Runners', 'Kevo'));
    render(<CommunityInvites />);

    expect(screen.getByText('Community invites (2)')).toBeInTheDocument();
    expect(screen.getByText('You have been invited to join 2 communities.')).toBeInTheDocument();
  });

  it('opens onto each invite, collapsed until then', async () => {
    respond(invite('c1', 'Nairobi Hikers'));
    render(<CommunityInvites />);

    const toggle = screen.getByRole('button', { name: /Community invites/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('button', { name: 'Join Nairobi Hikers' })).not.toBeInTheDocument();

    await userEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Invited by Amina, 12 members')).toBeInTheDocument();
  });

  it('joins through the invite', async () => {
    respond(invite('c1', 'Nairobi Hikers'));
    accept.mockImplementation((_id: string, options: { onSuccess: () => void }) =>
      options.onSuccess(),
    );
    render(<CommunityInvites />);

    await userEvent.click(screen.getByRole('button', { name: /Community invites/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Join Nairobi Hikers' }));

    expect(accept).toHaveBeenCalledWith('c1', expect.anything());
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'You joined Nairobi Hikers. Joining does not book or pay for anything.',
      }),
    );
  });

  it('declines for good', async () => {
    respond(invite('c1', 'Nairobi Hikers'));
    decline.mockImplementation((_id: string, options: { onSuccess: () => void }) =>
      options.onSuccess(),
    );
    render(<CommunityInvites />);

    await userEvent.click(screen.getByRole('button', { name: /Community invites/ }));
    await userEvent.click(
      screen.getByRole('button', { name: 'Decline the invite to Nairobi Hikers' }),
    );

    expect(decline).toHaveBeenCalledWith('c1', expect.anything());
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Invite to Nairobi Hikers declined.' }),
    );
  });

  it('says why when an answer fails', async () => {
    respond(invite('c1', 'Nairobi Hikers'));
    accept.mockImplementation((_id: string, options: { onError: (e: Error) => void }) =>
      options.onError(new Error('Try again')),
    );
    render(<CommunityInvites />);

    await userEvent.click(screen.getByRole('button', { name: /Community invites/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Join Nairobi Hikers' }));

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Could not join', description: 'Try again' }),
    );
  });

  it('opens the community from its name', async () => {
    respond(invite('c1', 'Nairobi Hikers'));
    render(<CommunityInvites />);

    await userEvent.click(screen.getByRole('button', { name: /Community invites/ }));
    await userEvent.click(screen.getByRole('button', { name: /^Nairobi Hikers/ }));

    expect(openCommunity).toHaveBeenCalledWith('c1');
  });

  it('falls back to Someone when the inviter is unknown', () => {
    respond({ ...invite('c1', 'Nairobi Hikers'), invite: null });
    render(<CommunityInvites />);

    expect(screen.getByText('Someone invited you to join Nairobi Hikers.')).toBeInTheDocument();
  });
});
