import React from 'react';

import { render, screen } from '@testing-library/react';

import { Community } from '@/types/community';

import { CommunityRow } from './index';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));
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

const owner = (id: string, firstName: string) => ({
  id,
  firstName,
  lastName: 'Wachira',
  displayName: null,
  picture: null,
});

const makeCommunity = (overrides: Partial<Community> = {}): Community =>
  ({
    id: 'c1',
    title: 'Weekend Readers',
    photos: [{ id: 'p1', photo: 'https://cdn.tukai.co/c1.jpg', isCover: true }],
    categories: [
      { id: 'cat1', name: 'Food', icon: 'Bowl01Icon' },
      { id: 'cat2', name: 'Books', icon: 'Book01Icon' },
    ],
    membersCount: 18,
    owners: [owner('u1', 'Amina'), owner('u2', 'Kevo'), owner('u3', 'Njeri')],
    ...overrides,
  }) as unknown as Community;

describe('CommunityRow', () => {
  it('names the community and links to it', () => {
    render(<CommunityRow community={makeCommunity()} />);

    expect(screen.getByText('Weekend Readers')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/communities/c1');
  });

  it('shows what the community is about, as icons', () => {
    render(<CommunityRow community={makeCommunity()} />);

    expect(screen.getByTestId('Bowl01Icon')).toBeInTheDocument();
    expect(screen.getByTestId('Book01Icon')).toBeInTheDocument();
  });

  // A category with no icon would render an empty gap
  it('skips a category the API gave no icon for', () => {
    const community = makeCommunity({
      categories: [{ id: 'cat1', name: 'Food', icon: '' }] as never,
    });

    const { container } = render(<CommunityRow community={community} />);

    expect(container.querySelectorAll('[data-testid]')).toHaveLength(0);
  });

  /**
   * ⚠️ The list endpoint returns no membership records, so the faces are the
   * OWNERS and the overflow is everyone else counted but not described.
   */
  describe('the facepile', () => {
    it('counts the members who are not pictured', () => {
      render(<CommunityRow community={makeCommunity()} />);

      // 18 members, three owner faces shown
      expect(screen.getByText('+15')).toBeInTheDocument();
    });

    it('shows no overflow when everyone is pictured', () => {
      render(<CommunityRow community={makeCommunity({ membersCount: 3 })} />);

      expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
    });

    it('never counts below zero', () => {
      render(<CommunityRow community={makeCommunity({ membersCount: 1 })} />);

      expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
    });

    it('is left out for a community with no owners listed', () => {
      render(<CommunityRow community={makeCommunity({ owners: [] })} />);

      expect(screen.getByText('Weekend Readers')).toBeInTheDocument();
      expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
    });
  });
});
