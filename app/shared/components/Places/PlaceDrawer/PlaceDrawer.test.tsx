import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { PlaceDrawer } from './index';

const usePlace = jest.fn();
const usePlaceOwnership = jest.fn();

const usePlaceManager = jest.fn();
jest.mock('@/app/shared/hooks/usePlaces', () => ({
  usePlace: (id: string | null, enabled: boolean) => usePlace(id, enabled),
  usePlaceOwnership: (id: string, enabled: boolean) => usePlaceOwnership(id, enabled),
  usePlaceManager: (id: string) => usePlaceManager(id),
  usePlaceReservationProfiles: () => ({ data: { data: { results: [] } } }),
  usePlaceAvailability: () => ({ data: undefined }),
}));
jest.mock('./PlaceManagerBanner', () => ({
  PlaceManagerBanner: ({ onOpenSettings }: { onOpenSettings: () => void }) => (
    <button type="button" onClick={onOpenSettings}>
      Reservation settings
    </button>
  ),
}));
jest.mock('./PlaceReservationSettings', () => ({
  PlaceReservationSettings: () => <div data-testid="reservation-settings" />,
}));

// Each of these is its own unit; this suite is about the drawer's shell
jest.mock('./PlaceAboutSection', () => ({
  PlaceAboutSection: () => <div data-testid="about" />,
}));
jest.mock('./UpcomingExperiences', () => ({
  UpcomingExperiences: ({ placeTitle }: { placeTitle: string }) => (
    <div data-testid="upcoming">{placeTitle}</div>
  ),
}));
jest.mock('./PlaceDrawerFooter', () => ({
  PlaceDrawerFooter: ({ onAddReview }: { onAddReview: () => void }) => (
    <button type="button" onClick={onAddReview}>
      Add a review
    </button>
  ),
}));
jest.mock('./PlaceReviewForm', () => ({
  PlaceReviewForm: ({ onDone }: { onDone: () => void }) => (
    <div data-testid="review-form">
      <button type="button" onClick={onDone}>
        posted
      </button>
    </div>
  ),
}));
jest.mock('./PlaceDrawerHeader', () => ({
  PlaceDrawerHeader: ({
    place,
    onClose,
    title,
    onBack,
  }: {
    place: { title: string };
    onClose: () => void;
    title?: string;
    onBack?: () => void;
  }) => (
    <div>
      <h2>{title ?? place.title}</h2>
      {onBack && (
        <button type="button" onClick={onBack}>
          back
        </button>
      )}
      <button type="button" onClick={onClose}>
        close
      </button>
    </div>
  ),
}));
jest.mock('@/app/shared/components/Moments', () => ({
  ContextMoments: ({ emptyMessage, onShare }: { emptyMessage: string; onShare: () => void }) => (
    <div>
      {emptyMessage}
      <button type="button" onClick={onShare}>
        Share moment
      </button>
    </div>
  ),
  MomentComposerForm: ({ onDone }: { onDone: () => void }) => (
    <div data-testid="moment-form">
      <button type="button" onClick={onDone}>
        shared
      </button>
    </div>
  ),
}));
jest.mock('@/app/(places)/places/[placeId]/components/PlaceReviewsSection', () => ({
  PlaceReviewsSection: ({ showAddReview }: { showAddReview?: boolean }) => (
    <div data-testid="reviews" data-add-review={String(showAddReview)} />
  ),
}));
jest.mock('@/app/(places)/places/[placeId]/components/ClaimPlacePrompt', () => ({
  ClaimPlacePrompt: ({ placeName }: { placeName: string }) => (
    <div data-testid="claim">{placeName}</div>
  ),
}));
jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: { iconName: string }) => <span data-testid={iconName} />,
}));

const place = {
  id: 'p1',
  title: 'Kazuri Beads Workshop',
  averageRating: 4.7,
  totalReviews: 14,
  photos: [],
};

describe('PlaceDrawer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePlace.mockReturnValue({ data: { data: place }, isLoading: false });
    usePlaceOwnership.mockReturnValue({ data: { success: true, data: null } });
    usePlaceManager.mockReturnValue({ isManager: false, owningCommunity: undefined });
  });

  it('shows the place and its sections', () => {
    render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);

    expect(screen.getByRole('heading', { name: 'Kazuri Beads Workshop' })).toBeInTheDocument();
    expect(screen.getByTestId('about')).toBeInTheDocument();
    expect(screen.getByTestId('upcoming')).toBeInTheDocument();
    expect(screen.getByTestId('reviews')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add a review' })).toBeInTheDocument();
  });

  it('counts the reviews on its tab', () => {
    render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);

    expect(screen.getByRole('tab', { name: /Reviews \(14\)/ })).toBeInTheDocument();
  });

  it('says only Reviews where there are none to count', () => {
    usePlace.mockReturnValue({ data: { data: { ...place, totalReviews: 0 } }, isLoading: false });

    render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);

    expect(screen.getByRole('tab', { name: 'Reviews' })).toBeInTheDocument();
  });

  it('invites a moment naming the place', () => {
    render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);

    expect(
      screen.getByText('No moments from Kazuri Beads Workshop yet. Yours could be the first.'),
    ).toBeInTheDocument();
  });

  it('closes on the header control', () => {
    const onClose = jest.fn();
    render(<PlaceDrawer placeId="p1" isOpen onClose={onClose} />);

    fireEvent.click(screen.getByText('close'));

    expect(onClose).toHaveBeenCalled();
  });

  it('asks for nothing while it is shut', () => {
    render(<PlaceDrawer placeId="p1" isOpen={false} onClose={jest.fn()} />);

    expect(usePlace).toHaveBeenCalledWith('p1', false);
  });

  describe('the claim prompt', () => {
    it('is offered where nobody owns the place', () => {
      render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);

      expect(screen.getByTestId('claim')).toBeInTheDocument();
    });

    it('is left out where someone does', () => {
      usePlaceOwnership.mockReturnValue({ data: { success: true, data: { id: 'c1' } } });

      render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);

      expect(screen.queryByTestId('claim')).not.toBeInTheDocument();
    });

    // A request that failed is "we do not know", and a place must never be
    // called unclaimed on that
    it('is left out when the ownership request failed', () => {
      usePlaceOwnership.mockReturnValue({ data: undefined });

      render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);

      expect(screen.queryByTestId('claim')).not.toBeInTheDocument();
    });
  });

  // The footer pins Add review; a second one in the reviews header would read
  // as a different control
  it('leaves the write-a-review control to the footer', () => {
    render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);

    expect(screen.getByTestId('reviews')).toHaveAttribute('data-add-review', 'false');
  });

  /**
   * Writing a review takes the drawer over rather than opening a second one on
   * top of it.
   */
  describe('writing a review', () => {
    const openForm = () => {
      render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: 'Add a review' }));
    };

    it('replaces the place with the form', () => {
      openForm();

      expect(screen.getByTestId('review-form')).toBeInTheDocument();
      expect(screen.queryByTestId('about')).not.toBeInTheDocument();
      expect(screen.queryByTestId('reviews')).not.toBeInTheDocument();
    });

    it('renames the header and offers a way back', () => {
      openForm();

      expect(screen.getByRole('heading', { name: 'Add a review' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'back' })).toBeInTheDocument();
    });

    // The tabs point at sections that are not on screen while the form is
    it('puts the tabs away', () => {
      openForm();

      expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    });

    it('comes back on the back control', () => {
      openForm();
      fireEvent.click(screen.getByRole('button', { name: 'back' }));

      expect(screen.getByTestId('about')).toBeInTheDocument();
      expect(screen.queryByTestId('review-form')).not.toBeInTheDocument();
    });

    it('comes back once the review has been posted', () => {
      openForm();
      fireEvent.click(screen.getByRole('button', { name: 'posted' }));

      expect(screen.getByTestId('about')).toBeInTheDocument();
    });
  });

  // Same shape as the review: in place, not a second panel over the first
  describe('sharing a moment', () => {
    const openForm = () => {
      render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: 'Share moment' }));
    };

    it('replaces the place with the composer', () => {
      openForm();

      expect(screen.getByTestId('moment-form')).toBeInTheDocument();
      expect(screen.queryByTestId('about')).not.toBeInTheDocument();
    });

    it('calls it a new moment, with a way back', () => {
      openForm();

      expect(screen.getByRole('heading', { name: 'New moment' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'back' })).toBeInTheDocument();
    });

    it('comes back once the moment has gone', () => {
      openForm();
      fireEvent.click(screen.getByRole('button', { name: 'shared' }));

      expect(screen.getByTestId('about')).toBeInTheDocument();
    });
  });

  /**
   * A manager is shown their own setup at the top of the place, and the way
   * into it, without leaving the drawer.
   */
  describe('managing the place', () => {
    it('shows nothing of the sort to anyone else', () => {
      render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);

      expect(
        screen.queryByRole('button', { name: 'Reservation settings' }),
      ).not.toBeInTheDocument();
    });

    it('offers the banner to a manager', () => {
      usePlaceManager.mockReturnValue({
        isManager: true,
        owningCommunity: { title: 'Weekend Readers' },
      });

      render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);

      expect(screen.getByRole('button', { name: 'Reservation settings' })).toBeInTheDocument();
    });

    it('opens the settings in place', () => {
      usePlaceManager.mockReturnValue({
        isManager: true,
        owningCommunity: { title: 'Weekend Readers' },
      });

      render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: 'Reservation settings' }));

      expect(screen.getByTestId('reservation-settings')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Reservation settings' })).toBeInTheDocument();
      expect(screen.queryByTestId('about')).not.toBeInTheDocument();
    });
  });
});
