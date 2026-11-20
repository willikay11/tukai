import React from 'react';

import { render, screen } from '@testing-library/react';

import { Community } from '@/types/community';

import { CommunityCard } from '.';

const stackProps = jest.fn();
jest.mock('@/app/(experiences)/experiences/components/AvatarStack', () => ({
  AvatarStack: (props: { users: { name: string }[] }) => {
    stackProps(props);
    return null;
  },
}));
jest.mock('@/app/shared/components/Communities/CommunityLink', () => ({
  CommunityLink: ({ ariaLabel, children }: { ariaLabel: string; children: React.ReactNode }) => (
    <a href="/c" aria-label={ariaLabel}>
      {children}
    </a>
  ),
}));
jest.mock('@/app/shared/components/Images', () => ({ PhotoImage: () => null }));
jest.mock('@/app/shared/components/Icons', () => ({ IconComponent: () => null }));
jest.mock('@/app/shared/hooks/useCommunities', () => ({
  useCommunityDetail: () => ({ data: undefined }),
}));

const community = {
  id: 'c1',
  title: 'Nairobi Hikers',
  isPublic: true,
  membersCount: 40,
  categories: [],
  owners: [{ id: 'o1', firstName: 'Owner', lastName: '', displayName: 'Owner', picture: null }],
  friendPreviews: [
    { id: 'f1', firstName: 'Amina', lastName: 'Y', displayName: 'Amina Yusuf', picture: null },
    { id: 'f2', firstName: 'Njeri', lastName: 'K', displayName: 'Njeri Kamau', picture: null },
  ],
  friendsCount: 2,
} as unknown as Community;

// DEV-384
describe('CommunityCard friends', () => {
  beforeEach(() => jest.clearAllMocks());

  it('shows the friends who joined, and names them', () => {
    render(<CommunityCard community={community} showFriends />);

    expect(stackProps).toHaveBeenCalledWith(
      expect.objectContaining({
        users: [
          expect.objectContaining({ name: 'Amina Yusuf' }),
          expect.objectContaining({ name: 'Njeri Kamau' }),
        ],
      }),
    );
    expect(screen.getByRole('link')).toHaveAccessibleName(
      'Nairobi Hikers. Amina, Njeri joined. 40 members.',
    );
  });

  it('shows its owners, and no friends, elsewhere', () => {
    render(<CommunityCard community={community} />);

    expect(stackProps).toHaveBeenCalledWith(
      expect.objectContaining({ users: [expect.objectContaining({ name: 'Owner' })] }),
    );
    expect(screen.getByRole('link')).toHaveAccessibleName('Nairobi Hikers. 40 members.');
  });
});
