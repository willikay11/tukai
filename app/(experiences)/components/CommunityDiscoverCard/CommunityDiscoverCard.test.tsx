import React from 'react';

import { render, screen } from '@testing-library/react';

import { Community } from '@/types/community';

import { CommunityDiscoverCard } from './index';

jest.mock('next/image', () => {
  function MockImage({ alt, src }: { alt: string; src: string }) {
    return <img alt={alt} src={src} />;
  }
  MockImage.displayName = 'MockImage';
  return MockImage;
});
jest.mock('next/link', () => {
  function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  }
  MockLink.displayName = 'MockLink';
  return MockLink;
});

const member = (id: string, firstName: string, picture: string | null = null) =>
  ({
    id,
    role: 'regular',
    dateCreated: '',
    inviteStatus: 'accepted',
    user: { id, firstName, lastName: 'Doe', displayName: '', picture },
  }) as never;

const makeCommunity = (overrides: Partial<Community> = {}): Community =>
  ({
    id: 'c1',
    title: 'Nairobi Hikers',
    description: 'Weekend trails around the city',
    categories: [{ id: 'cat1', name: 'Hiking', icon: '' }],
    photos: [{ id: 'p1', photo: 'https://cdn.tukai.co/cover.jpg', isCover: true }],
    members: [member('m1', 'Ann'), member('m2', 'Ben'), member('m3', 'Cid')],
    isPublic: true,
    status: 'published',
    dateCreated: '',
    dateModified: '',
    ...overrides,
  }) as unknown as Community;

describe('CommunityDiscoverCard', () => {
  it('renders cover, category badge, title and description', () => {
    render(<CommunityDiscoverCard community={makeCommunity()} />);

    expect(screen.getByAltText('Nairobi Hikers')).toHaveAttribute(
      'src',
      'https://cdn.tukai.co/cover.jpg',
    );
    expect(screen.getByText('Hiking')).toBeInTheDocument();
    expect(screen.getByText('Nairobi Hikers')).toBeInTheDocument();
    expect(screen.getByText('Weekend trails around the city')).toBeInTheDocument();
  });

  // Regression: descriptions are stored as HTML and were rendered as literal
  // text, so tags showed up on the card
  it('strips HTML from the description', () => {
    render(
      <CommunityDiscoverCard
        community={makeCommunity({
          description: '<p>Weekend <strong>trails</strong> around the city</p>',
        })}
      />,
    );

    expect(screen.getByText('Weekend trails around the city')).toBeInTheDocument();
    expect(screen.queryByText(/<p>|<strong>/)).not.toBeInTheDocument();
  });

  it('collapses whitespace and entities in the description', () => {
    render(
      <CommunityDiscoverCard
        community={makeCommunity({ description: '<p>Trails &amp;\n   more</p>' })}
      />,
    );

    expect(screen.getByText('Trails & more')).toBeInTheDocument();
  });

  it('links to the community page', () => {
    render(<CommunityDiscoverCard community={makeCommunity()} />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/communities/c1');
  });

  it('shows the overflow count beyond the three visible avatars', () => {
    const members = Array.from({ length: 9 }, (_, index) =>
      member(`m${index}`, `User${index}`),
    );
    render(<CommunityDiscoverCard community={makeCommunity({ members } as never)} />);

    expect(screen.getByText('+6')).toBeInTheDocument();
  });

  it('hides the facepile when the API returned no members', () => {
    render(<CommunityDiscoverCard community={makeCommunity({ members: [] } as never)} />);

    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });

  it('omits the badge when the community has no category', () => {
    render(<CommunityDiscoverCard community={makeCommunity({ categories: [] })} />);

    expect(screen.queryByText('Hiking')).not.toBeInTheDocument();
  });
});
