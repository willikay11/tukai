import React from 'react';

import { render, screen } from '@testing-library/react';

import { Community } from '@/types/community';

import { CommunityCard } from '.';

jest.mock('@/app/(experiences)/experiences/components/AvatarStack', () => ({
  AvatarStack: () => null,
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

const community = (upcomingExperiencesCount?: number) =>
  ({
    id: 'c1',
    title: 'Nairobi Hikers',
    isPublic: true,
    membersCount: 40,
    categories: [{ id: 'k1', name: 'Hiking', icon: 'Mountain' }],
    owners: [],
    upcomingExperiencesCount,
  }) as unknown as Community;

// DEV-413: upcoming_experiences_count on the card
describe('CommunityCard upcoming count', () => {
  it('shows how many experiences are coming up, and says so in its name', () => {
    render(<CommunityCard community={community(3)} />);

    expect(screen.getByTestId('upcoming-count')).toHaveTextContent('3');
    expect(screen.getByRole('link')).toHaveAccessibleName(
      'Nairobi Hikers. 40 members. Hiking. 3 upcoming experiences.',
    );
  });

  it('leaves it out when nothing is coming up', () => {
    render(<CommunityCard community={community(0)} />);

    expect(screen.queryByTestId('upcoming-count')).not.toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAccessibleName('Nairobi Hikers. 40 members. Hiking.');
  });

  it('leaves it out when the response has no count', () => {
    render(<CommunityCard community={community()} />);

    expect(screen.queryByTestId('upcoming-count')).not.toBeInTheDocument();
  });

  it('hides it with the rest of the meta', () => {
    render(<CommunityCard community={community(3)} showMeta={false} />);

    expect(screen.queryByTestId('upcoming-count')).not.toBeInTheDocument();
  });
});
