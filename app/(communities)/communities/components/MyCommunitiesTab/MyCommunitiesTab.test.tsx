import React from 'react';

import { render, screen } from '@testing-library/react';

import { MyCommunitiesTab } from './index';

let sessionState: { data: { user: { id: string } } | null } = { data: { user: { id: 'me' } } };
jest.mock('next-auth/react', () => ({ useSession: () => sessionState }));

const feedProps = jest.fn();
jest.mock('../CommunityFeedTab', () => ({
  CommunityFeedTab: (props: Record<string, unknown>) => {
    feedProps(props);
    return <div data-testid="feed" />;
  },
}));

describe('MyCommunitiesTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionState = { data: { user: { id: 'me' } } };
  });

  // `created_by` is the only filter the list endpoint offers for this
  it('asks for the communities the reader created', () => {
    render(<MyCommunitiesTab isSignedIn />);

    expect(feedProps).toHaveBeenCalledWith(
      expect.objectContaining({
        query: { createdBy: 'me' },
        listHeading: 'Created or Hosted by You',
      }),
    );
  });

  it('waits for the user id before asking', () => {
    sessionState = { data: null };
    render(<MyCommunitiesTab isSignedIn />);

    expect(feedProps).toHaveBeenCalledWith(expect.objectContaining({ isSignedIn: false }));
  });

  describe('the create button', () => {
    // On a phone it stands in for the main navigation, which this tab hides
    it('floats along the bottom edge on small screens', () => {
      render(<MyCommunitiesTab isSignedIn />);

      const cta = screen.getByRole('link', { name: /Create Community/ });
      expect(cta).toHaveAttribute('href', '/communities/create');
      expect(cta.closest('div')?.className).toContain('md:hidden');
    });

    it('is not offered to a reader who is not signed in', () => {
      render(<MyCommunitiesTab isSignedIn={false} />);

      expect(screen.queryByRole('link', { name: /Create Community/ })).not.toBeInTheDocument();
    });
  });
});
