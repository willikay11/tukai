import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { PlaceDrawer } from './index';

const usePlace = jest.fn();
const usePlaceOwnership = jest.fn();

jest.mock('@/app/shared/hooks/usePlaces', () => ({
  usePlace: (id: string | null, enabled: boolean) => usePlace(id, enabled),
  usePlaceOwnership: (id: string, enabled: boolean) => usePlaceOwnership(id, enabled),
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
  PlaceDrawerFooter: () => <div data-testid="footer" />,
}));
jest.mock('./PlaceDrawerHeader', () => ({
  PlaceDrawerHeader: ({ place, onClose }: { place: { title: string }; onClose: () => void }) => (
    <div>
      <h2>{place.title}</h2>
      <button type="button" onClick={onClose}>
        close
      </button>
    </div>
  ),
}));
jest.mock('@/app/shared/components/Moments', () => ({
  ContextMoments: ({ emptyMessage }: { emptyMessage: string }) => <div>{emptyMessage}</div>,
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
  });

  it('shows the place and its sections', () => {
    render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);

    expect(screen.getByRole('heading', { name: 'Kazuri Beads Workshop' })).toBeInTheDocument();
    expect(screen.getByTestId('about')).toBeInTheDocument();
    expect(screen.getByTestId('upcoming')).toBeInTheDocument();
    expect(screen.getByTestId('reviews')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
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
});
