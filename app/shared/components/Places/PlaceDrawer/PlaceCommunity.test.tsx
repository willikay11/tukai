import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { PlaceCommunity } from './PlaceCommunity';

const useSession = jest.fn();
const useCommunityDetail = jest.fn();
const joinCommunity = jest.fn();
const openSignInWithCallback = jest.fn();

jest.mock('next-auth/react', () => ({ useSession: () => useSession() }));
jest.mock('@/app/shared/hooks/useCommunities', () => ({
  useCommunityDetail: (id: string, enabled: boolean) => useCommunityDetail(id, enabled),
  useJoinCommunity: () => ({ mutate: joinCommunity, isPending: false }),
}));
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast: jest.fn() }) }));
jest.mock('@/context/AuthDialogContext', () => ({
  useAuthDialog: () => ({ openSignInWithCallback }),
}));

const member = (id: string, role: string, inviteStatus: string, name = id) =>
  ({
    id,
    role,
    inviteStatus,
    user: { id, displayName: name, firstName: name, lastName: '' },
  }) as never;

const community = (members: unknown[]) => ({
  id: 'c1',
  slug: 'nairobi-hikers',
  title: 'Nairobi Hikers',
  isPublic: true,
  photos: [],
  members,
  membersCount: members.length,
});

const signedInAs = (id: string | undefined) =>
  useSession.mockReturnValue({ data: id ? { user: { id } } : null });

const withCommunity = (members: unknown[]) =>
  useCommunityDetail.mockReturnValue({ data: { data: community(members) } });

describe('PlaceCommunity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing for an unclaimed place', () => {
    signedInAs('me');
    useCommunityDetail.mockReturnValue({ data: undefined });

    const { container } = render(<PlaceCommunity communityId="" />);

    expect(container).toBeEmptyDOMElement();
  });

  it('names the community, linked to its page, and its host', () => {
    signedInAs('me');
    withCommunity([member('host', 'owner', 'accepted', 'Wanjiru')]);

    render(<PlaceCommunity communityId="c1" />);

    expect(screen.getByRole('link', { name: /Nairobi Hikers/ })).toHaveAttribute(
      'href',
      '/communities/nairobi-hikers',
    );
    expect(screen.getByText('Hosted by Wanjiru')).toBeInTheDocument();
  });

  it('offers Join to a reader who is not in the community', () => {
    signedInAs('me');
    withCommunity([member('host', 'owner', 'accepted')]);

    render(<PlaceCommunity communityId="c1" />);

    fireEvent.click(screen.getByRole('button', { name: /Join/ }));

    expect(joinCommunity).toHaveBeenCalledWith('c1', expect.any(Object));
  });

  it('hides Join from a member', () => {
    signedInAs('me');
    withCommunity([member('me', 'regular', 'accepted')]);

    render(<PlaceCommunity communityId="c1" />);

    expect(screen.queryByRole('button', { name: /Join/ })).not.toBeInTheDocument();
  });

  it('hides Join while a request to a private community is waiting', () => {
    signedInAs('me');
    withCommunity([member('me', 'regular', 'requested')]);

    render(<PlaceCommunity communityId="c1" />);

    expect(screen.queryByRole('button', { name: /Join/ })).not.toBeInTheDocument();
  });

  it('sends a signed-out reader through sign-in before joining', () => {
    signedInAs(undefined);
    withCommunity([member('host', 'owner', 'accepted')]);

    render(<PlaceCommunity communityId="c1" />);

    fireEvent.click(screen.getByRole('button', { name: /Join/ }));

    expect(openSignInWithCallback).toHaveBeenCalledWith(expect.any(Function));
    expect(joinCommunity).not.toHaveBeenCalled();
  });
});
