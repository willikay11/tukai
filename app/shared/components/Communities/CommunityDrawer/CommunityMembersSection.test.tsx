import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CommunityMember } from '@/types/community';

import { CommunityMembersSection } from './CommunityMembersSection';

jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: () => <span data-testid="photo" />,
}));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

jest.mock('@/app/shared/hooks/useCommunities', () => ({
  useCancelCommunityInvite: () => ({ mutate: jest.fn(), isPending: false }),
}));

const member = (
  id: string,
  name: string,
  role: CommunityMember['role'] = 'regular',
  inviteStatus: CommunityMember['inviteStatus'] = 'accepted',
) => ({ id, role, inviteStatus, user: { id: `u-${id}`, displayName: name } }) as CommunityMember;

const renderSection = (
  members: CommunityMember[],
  props: Partial<React.ComponentProps<typeof CommunityMembersSection>> = {},
) =>
  render(
    <CommunityMembersSection
      communityId="c1"
      communityTitle="City Sketchers"
      members={members}
      memberCount={members.length}
      isOwnerSelf={false}
      {...props}
    />,
  );

const chipNames = () =>
  Array.from(document.querySelectorAll('span.truncate')).map((node) => node.textContent);

describe('CommunityMembersSection', () => {
  beforeEach(() => jest.clearAllMocks());

  it('counts the members from the API total', () => {
    renderSection([member('1', 'Amina', 'owner')], { memberCount: 32 });

    expect(screen.getByText('32 members')).toBeInTheDocument();
  });

  it('puts the admin first, then the reader, then everyone else', () => {
    renderSection([member('2', 'Baraka'), member('3', 'Wanjiku'), member('1', 'Amina', 'owner')], {
      currentUserId: 'u-3',
    });

    expect(chipNames()).toEqual(['Amina', 'Wanjiku', 'Baraka']);
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('You')).toBeInTheDocument();
  });

  it('calls the owner "You" on their own community', () => {
    renderSection([member('1', 'Amina', 'owner')], { currentUserId: 'u-1', isOwnerSelf: true });

    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('leaves out anyone who has not accepted', () => {
    renderSection([member('1', 'Amina', 'owner'), member('2', 'Baraka', 'regular', 'pending')]);

    expect(chipNames()).toEqual(['Amina']);
  });

  it('stops at nine chips and counts the rest', async () => {
    const members = Array.from({ length: 12 }, (_, index) => member(String(index), `M${index}`));
    renderSection(members, { memberCount: 32 });

    expect(chipNames()).toHaveLength(9);
    await userEvent.click(screen.getByRole('button', { name: 'See all 32 members' }));

    expect(screen.getByRole('button', { name: 'See all 32 members' })).toHaveTextContent('+23');
    expect(toast).toHaveBeenCalledWith({ description: 'Opens all 32 members of City Sketchers.' });
  });

  it('never shows more chips than the member count', () => {
    renderSection([member('1', 'Amina', 'owner'), member('2', 'Baraka')], { memberCount: 1 });

    expect(chipNames()).toHaveLength(1);
  });
});
