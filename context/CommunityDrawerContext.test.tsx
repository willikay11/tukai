import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { CommunityLink } from '@/app/shared/components/Communities/CommunityLink';

import { CommunityDrawerProvider } from './CommunityDrawerContext';

type DrawerProps = {
  communityId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
};

// The drawer itself is covered by its own tests; here only what it is handed
jest.mock('@/app/shared/components/Communities', () => ({
  CommunityDrawer: ({ communityId, isOpen, onClose, onBack }: DrawerProps) =>
    isOpen ? (
      <div data-testid="drawer" data-community={communityId}>
        {onBack && (
          <button type="button" onClick={onBack}>
            Back
          </button>
        )}
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null,
}));

const renderWith = (link: React.ReactNode) =>
  render(<CommunityDrawerProvider>{link}</CommunityDrawerProvider>);

describe('CommunityDrawerProvider', () => {
  it('opens a community from its link instead of navigating', () => {
    renderWith(<CommunityLink community={{ id: 'c1', slug: 'hikers' }}>Hikers</CommunityLink>);

    const link = screen.getByRole('link', { name: 'Hikers' });
    expect(link).toHaveAttribute('href', '/communities/hikers');

    const navigated = !fireEvent.click(link);

    expect(navigated).toBe(true); // default prevented: the drawer took the click
    expect(screen.getByTestId('drawer')).toHaveAttribute('data-community', 'c1');
  });

  it('leaves a modifier-click to the browser', () => {
    renderWith(<CommunityLink community={{ id: 'c1' }}>Hikers</CommunityLink>);

    fireEvent.click(screen.getByRole('link', { name: 'Hikers' }), { metaKey: true });

    expect(screen.queryByTestId('drawer')).not.toBeInTheDocument();
  });

  it('offers no Back when opened on its own', () => {
    renderWith(<CommunityLink community={{ id: 'c1' }}>Hikers</CommunityLink>);

    fireEvent.click(screen.getByRole('link', { name: 'Hikers' }));

    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
  });

  describe('stacked on another drawer', () => {
    const closeBelow = jest.fn();

    beforeEach(() => {
      closeBelow.mockClear();
      renderWith(
        <CommunityLink community={{ id: 'c1' }} drawerOptions={{ onCloseBelow: closeBelow }}>
          Hikers
        </CommunityLink>,
      );
      fireEvent.click(screen.getByRole('link', { name: 'Hikers' }));
    });

    it('goes Back to the drawer below, leaving it open', () => {
      fireEvent.click(screen.getByRole('button', { name: 'Back' }));

      expect(screen.queryByTestId('drawer')).not.toBeInTheDocument();
      expect(closeBelow).not.toHaveBeenCalled();
    });

    it('closes the whole stack on Close', () => {
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));

      expect(screen.queryByTestId('drawer')).not.toBeInTheDocument();
      expect(closeBelow).toHaveBeenCalled();
    });
  });
});
