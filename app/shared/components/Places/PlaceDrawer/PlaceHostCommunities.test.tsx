import React from 'react';

import { render, screen } from '@testing-library/react';

import { PlaceHostCommunities } from './PlaceHostCommunities';

let mockCommunities: unknown[] = [];
jest.mock('@/app/shared/hooks/usePlaces', () => ({
  usePlaceCommunities: () => ({ data: mockCommunities }),
}));
jest.mock('@/app/shared/components/Images', () => ({ PhotoImage: () => null }));
jest.mock('@/context/PlaceDrawerContext', () => ({ usePlaceDrawer: () => null }));
jest.mock('@/app/shared/components/Communities/CommunityLink', () => ({
  CommunityLink: ({
    community,
    children,
  }: {
    community: { id: string };
    children: React.ReactNode;
  }) => <a href={`/communities/${community.id}`}>{children}</a>,
}));

const community = (id: string, relationship: 'owner' | 'host', experiencesCount = 0) => ({
  id,
  title: `Community ${id}`,
  relationship,
  experiencesCount,
  membersCount: 1,
  photoUrl: null,
  isPublic: true,
});

// DEV-385: communities that have hosted experiences at a place
describe('PlaceHostCommunities', () => {
  it('lists the ones that meet here, not the owner, which has its own section', () => {
    mockCommunities = [community('own', 'owner'), community('hike', 'host', 4)];
    render(<PlaceHostCommunities placeId="pl1" />);

    expect(screen.getByRole('heading', { name: 'Communities that meet here' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Community hike/ })).toHaveAttribute(
      'href',
      '/communities/hike',
    );
    expect(screen.getByText('4 experiences here · 1 member')).toBeInTheDocument();
    expect(screen.queryByText('Community own')).not.toBeInTheDocument();
  });

  it('renders nothing when only the owner is linked', () => {
    mockCommunities = [community('own', 'owner')];
    const { container } = render(<PlaceHostCommunities placeId="pl1" />);

    expect(container).toBeEmptyDOMElement();
  });
});
