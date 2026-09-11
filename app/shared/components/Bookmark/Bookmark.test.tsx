import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { Bookmark } from './index';

jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));

const openSignInWithCallback = jest.fn();
jest.mock('@/context/AuthDialogContext', () => ({
  useAuthDialog: () => ({ openSignInWithCallback, setOpenSignIn: jest.fn() }),
}));

jest.mock('@/app/shared/components/BucketList', () => ({
  BucketListPicker: ({ isOpen, experienceId, placeId }: Record<string, unknown>) =>
    isOpen ? (
      <div
        data-testid="picker"
        data-experience={experienceId as string}
        data-place={placeId as string}
      />
    ) : null,
}));

const USER = '8129381931983';

describe('Bookmark', () => {
  beforeEach(() => jest.clearAllMocks());

  // One treatment everywhere: the basket. The bookmark-pin variant is gone.
  it('is a basket, whatever it is saving', () => {
    render(<Bookmark userId={USER} bookmarked={false} experienceId="exp-1" />);

    expect(screen.getByTestId('ShoppingBasketAdd02Icon')).toBeInTheDocument();
    expect(screen.queryByTestId('Bookmark02Icon')).not.toBeInTheDocument();
  });

  it('fills the basket in once something is saved', () => {
    render(<Bookmark userId={USER} bookmarked experienceId="exp-1" />);

    expect(screen.getByTestId('ShoppingBasketDone02Icon')).toBeInTheDocument();
  });

  // Which list is a choice, so it asks rather than toggling
  it('opens the picker for an experience', () => {
    render(<Bookmark userId={USER} bookmarked={false} experienceId="exp-1" />);

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByTestId('picker')).toHaveAttribute('data-experience', 'exp-1');
  });

  it('opens the picker for a place', () => {
    render(<Bookmark userId={USER} bookmarked={false} placeId="place-1" />);

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByTestId('picker')).toHaveAttribute('data-place', 'place-1');
  });

  it('signs a reader in first, then opens the picker', () => {
    render(<Bookmark userId={null} bookmarked={false} experienceId="exp-1" />);

    fireEvent.click(screen.getByRole('button'));

    expect(screen.queryByTestId('picker')).not.toBeInTheDocument();
    expect(openSignInWithCallback).toHaveBeenCalled();

    // What signing in runs, inside act so the reopen is rendered
    act(() => openSignInWithCallback.mock.calls[0][0]());

    expect(screen.getByTestId('picker')).toBeInTheDocument();
  });

  // The control sits over a card that is itself a link
  it('does not let the press reach the card underneath', () => {
    const onCardClick = jest.fn();
    render(
      <a href="/somewhere" onClick={onCardClick}>
        <Bookmark userId={USER} bookmarked={false} experienceId="exp-1" />
      </a>,
    );

    fireEvent.click(screen.getByRole('button'));

    expect(onCardClick).not.toHaveBeenCalled();
  });

  describe('without anything to save onto a list', () => {
    it('falls back to the caller’s own bookmarking', () => {
      const onBookmark = jest.fn();
      render(<Bookmark userId={USER} bookmarked={false} onBookmark={onBookmark} />);

      fireEvent.click(screen.getByRole('button'));

      expect(onBookmark).toHaveBeenCalled();
      expect(screen.queryByTestId('picker')).not.toBeInTheDocument();
    });

    it('unbookmarks what was already bookmarked', () => {
      const onUnbookmark = jest.fn();
      render(<Bookmark userId={USER} bookmarked onUnbookmark={onUnbookmark} />);

      fireEvent.click(screen.getByRole('button'));

      expect(onUnbookmark).toHaveBeenCalled();
    });
  });

  /**
   * The state was seeded once at mount. A card that re-read its experience
   * after a save — which is what the reader sees on coming back to the page —
   * kept showing the empty basket until it was unmounted and built again.
   */
  it('follows the saved state when its card re-reads', () => {
    const { rerender } = render(<Bookmark userId={USER} bookmarked={false} experienceId="exp-1" />);

    expect(screen.getByTestId('ShoppingBasketAdd02Icon')).toBeInTheDocument();

    rerender(<Bookmark userId={USER} bookmarked experienceId="exp-1" />);

    expect(screen.getByTestId('ShoppingBasketDone02Icon')).toBeInTheDocument();
  });
});
