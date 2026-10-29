import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { PlaceDrawer } from './index';

const usePlace = jest.fn();
const useExperiences = jest.fn();

jest.mock('@/app/shared/hooks/useExperiences', () => ({
  useExperiences: (...args: unknown[]) => useExperiences(...args),
}));

const usePlaceManager = jest.fn();
const usePlaceReservationProfiles = jest.fn();
const usePlaceAvailability = jest.fn();
const usePlaceBookingRequests = jest.fn();
jest.mock('@/app/shared/hooks/usePlaces', () => ({
  usePlaceBookingRequests: (placeId: string, profileId: string | undefined) =>
    usePlaceBookingRequests(placeId, profileId),
  usePlace: (id: string | null, enabled: boolean) => usePlace(id, enabled),
  usePlaceManager: (id: string) => usePlaceManager(id),
  usePlaceReservationProfiles: () => usePlaceReservationProfiles(),
  usePlaceAvailability: (placeId: string, profileId: string | undefined) =>
    usePlaceAvailability(placeId, profileId),
}));
jest.mock('./PlaceBookingForm', () => ({
  PlaceBookingForm: ({ onDone }: { onDone: () => void }) => (
    <div data-testid="booking-form">
      <button type="button" onClick={onDone}>
        sent
      </button>
    </div>
  ),
}));
jest.mock('./PlaceManagerBanner', () => ({
  PlaceManagerBanner: ({ onOpenSettings }: { onOpenSettings: () => void }) => (
    <button type="button" onClick={onOpenSettings}>
      Reservation settings
    </button>
  ),
}));
jest.mock('./HostReservationsSection', () => ({
  HostReservationsSection: ({
    reservations,
    onOpen,
  }: {
    reservations: unknown[];
    onOpen: (day: string, group: string) => void;
  }) => (
    <div data-testid="host-section" data-count={reservations.length}>
      <button type="button" onClick={() => onOpen('2026-11-04', 'admitted')}>
        open all reservations
      </button>
    </div>
  ),
}));
jest.mock('./HostReservations', () => ({
  HostReservations: ({
    initialDay,
    initialGroup,
    onOpenHoldOff,
    onOpenSettings,
  }: {
    initialDay?: string;
    initialGroup?: string;
    onOpenHoldOff: () => void;
    onOpenSettings: () => void;
  }) => (
    <div data-testid="host-reservations" data-day={initialDay} data-group={initialGroup}>
      <button type="button" onClick={onOpenHoldOff}>
        open hold off
      </button>
      <button type="button" onClick={onOpenSettings}>
        open settings
      </button>
    </div>
  ),
}));
jest.mock('./HoldOffReservations', () => ({
  HoldOffReservations: () => <div data-testid="hold-off" />,
}));
jest.mock('./PlaceReservationSettings', () => ({
  PlaceReservationSettings: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="reservation-settings">
      <button type="button" onClick={onClose}>
        close settings
      </button>
    </div>
  ),
}));

// Each of these is its own unit; this suite is about the drawer's shell
jest.mock('./PlaceAboutSection', () => ({
  PlaceAboutSection: () => <div data-testid="about" />,
}));
jest.mock('./MyReservations', () => ({
  MyReservations: () => null,
}));
jest.mock('./PlaceCommunity', () => ({
  PlaceCommunity: ({ communityId }: { communityId: string }) =>
    communityId ? <div data-testid="community">{communityId}</div> : null,
}));
jest.mock('./UpcomingExperiences', () => ({
  UPCOMING_PAGE_SIZE: 50,
  UpcomingExperiences: ({ placeTitle }: { placeTitle: string }) => (
    <div data-testid="upcoming">{placeTitle}</div>
  ),
}));
jest.mock('./PlaceDrawerFooter', () => ({
  PlaceDrawerFooter: ({
    onAddReview,
    onBook,
    isManager,
  }: {
    onAddReview: () => void;
    onBook?: () => void;
    isManager?: boolean;
  }) =>
    isManager ? (
      <div data-testid="manager-footer" />
    ) : (
      <>
        <button type="button" onClick={onAddReview}>
          Add review
        </button>
        {onBook && (
          <button type="button" onClick={onBook}>
            Book a table
          </button>
        )}
      </>
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
  MomentComposerForm: () => <div data-testid="moment-form" />,
  MomentDrawer: () => null,
  // The drawer owns the hook directly and renders its own Share button -
  // `handleShare` stands in for a share that always succeeds immediately
  useMomentComposer: (_context: unknown, onDone: () => void) => ({
    canShare: true,
    isPending: false,
    handleShare: onDone,
    sharedMoment: null,
    onCloseSharedMoment: () => {},
  }),
}));
jest.mock('./PlaceDrawerReviews', () => ({
  PlaceDrawerReviews: () => <div data-testid="reviews" />,
}));
jest.mock('@/app/shared/components/Places/ClaimCard', () => ({
  ClaimCard: ({ placeName }: { placeName: string }) => <div data-testid="claim">{placeName}</div>,
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
  verifiedOwner: null,
};

describe('PlaceDrawer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePlace.mockReturnValue({ data: { data: place }, isLoading: false });
    usePlaceManager.mockReturnValue({ isManager: false, owningCommunity: undefined });
    useExperiences.mockReturnValue({ data: { data: { results: [{ id: 'e1' }] } } });
    usePlaceReservationProfiles.mockReturnValue({ data: { data: { results: [] } } });
    usePlaceAvailability.mockReturnValue({ data: undefined });
    usePlaceBookingRequests.mockReturnValue({ data: undefined });
  });

  it('shows the place and its sections', () => {
    render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);

    expect(screen.getByRole('heading', { name: 'Kazuri Beads Workshop' })).toBeInTheDocument();
    expect(screen.getByTestId('about')).toBeInTheDocument();
    expect(screen.getByTestId('upcoming')).toBeInTheDocument();
    expect(screen.getByTestId('reviews')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add review' })).toBeInTheDocument();
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

  it('separates thousands in the review count', () => {
    usePlace.mockReturnValue({
      data: { data: { ...place, totalReviews: 1400 } },
      isLoading: false,
    });

    render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);

    expect(screen.getByRole('tab', { name: /Reviews \(1,400\)/ })).toBeInTheDocument();
  });

  it('offers Experiences only where the place has some', () => {
    useExperiences.mockReturnValue({ data: { data: { results: [] } } });

    render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);

    expect(screen.queryByRole('tab', { name: 'Experiences' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('upcoming')).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Moments' })).toBeInTheDocument();
  });

  it('keeps the Experiences tab in the order the design gives it', () => {
    render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);

    const labels = screen.getAllByRole('tab').map((tab) => tab.textContent);
    expect(labels).toEqual(['About', 'Experiences', 'Moments', 'Reviews (14)']);
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

  describe('the community that holds the place', () => {
    it('is shown to any visitor, from the place itself', () => {
      usePlace.mockReturnValue({
        data: { data: { ...place, verifiedOwner: { id: 'c1', title: 'Weekend Readers' } } },
        isLoading: false,
      });

      render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);

      expect(screen.getByTestId('community')).toHaveTextContent('c1');
    });

    it('is not shown where nobody has been approved', () => {
      render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);

      expect(screen.queryByTestId('community')).not.toBeInTheDocument();
    });
  });

  describe('the claim prompt', () => {
    it('is offered where nobody owns the place', () => {
      render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);

      expect(screen.getByTestId('claim')).toBeInTheDocument();
    });

    it('is left out where someone does', () => {
      usePlace.mockReturnValue({
        data: { data: { ...place, verifiedOwner: { id: 'c1', title: 'Weekend Readers' } } },
        isLoading: false,
      });

      render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);

      expect(screen.queryByTestId('claim')).not.toBeInTheDocument();
    });

    // A response that says nothing about an owner is "we do not know", and a
    // place must never be called unclaimed on that
    it('is left out when the place says nothing about an owner', () => {
      usePlace.mockReturnValue({
        data: { data: { ...place, verifiedOwner: undefined } },
        isLoading: false,
      });

      render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);

      expect(screen.queryByTestId('claim')).not.toBeInTheDocument();
    });
  });

  describe('booking a table', () => {
    const liveProfile = {
      id: 'profile-1',
      reservationType: 'restaurant_reservation',
      status: 'active',
    };
    const weeklyHours = { data: { data: { rules: [{ id: 'r1', dayOfWeek: 1 }], exceptions: [] } } };

    const openOnClaimedPlace = (
      overrides: {
        profiles?: unknown[];
        availability?: unknown;
        manager?: boolean;
      } = {},
    ) => {
      usePlace.mockReturnValue({
        data: { data: { ...place, verifiedOwner: { id: 'c1', title: 'Weekend Readers' } } },
        isLoading: false,
      });
      usePlaceManager.mockReturnValue({
        isManager: overrides.manager ?? false,
        owningCommunity: undefined,
      });
      usePlaceReservationProfiles.mockReturnValue({
        data: { data: { results: overrides.profiles ?? [liveProfile] } },
      });
      usePlaceAvailability.mockReturnValue(
        overrides.availability === undefined
          ? weeklyHours
          : { data: { data: overrides.availability } },
      );
      render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);
    };

    it('is offered on a claimed place that is taking bookings', () => {
      openOnClaimedPlace();

      expect(screen.getByRole('button', { name: 'Book a table' })).toBeInTheDocument();
    });

    it('reads the availability of the live profile for a visitor', () => {
      openOnClaimedPlace();

      expect(usePlaceAvailability).toHaveBeenCalledWith('p1', 'profile-1');
    });

    it('is not offered on a place that has no reservation profile', () => {
      openOnClaimedPlace({ profiles: [] });

      expect(screen.queryByRole('button', { name: 'Book a table' })).not.toBeInTheDocument();
    });

    it('is not offered to the community that runs the place', () => {
      openOnClaimedPlace({ manager: true });

      expect(screen.queryByRole('button', { name: 'Book a table' })).not.toBeInTheDocument();
    });

    it('is not offered while the profile is still a draft', () => {
      openOnClaimedPlace({ profiles: [{ ...liveProfile, status: 'draft' }] });

      expect(screen.queryByRole('button', { name: 'Book a table' })).not.toBeInTheDocument();
    });

    it('is not offered for a profile that does not take table bookings', () => {
      openOnClaimedPlace({ profiles: [{ ...liveProfile, reservationType: 'cinema_reservation' }] });

      expect(screen.queryByRole('button', { name: 'Book a table' })).not.toBeInTheDocument();
    });

    it('is not offered before the place has opened any days', () => {
      openOnClaimedPlace({ availability: { rules: [], exceptions: [] } });

      expect(screen.queryByRole('button', { name: 'Book a table' })).not.toBeInTheDocument();
    });

    it('takes the drawer over with the booking form and returns to the place once sent', () => {
      openOnClaimedPlace();

      fireEvent.click(screen.getByRole('button', { name: 'Book a table' }));

      expect(screen.getByTestId('booking-form')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Make a booking' })).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'sent' }));

      expect(screen.queryByTestId('booking-form')).not.toBeInTheDocument();
      expect(screen.getByTestId('about')).toBeInTheDocument();
    });
  });

  /**
   * Writing a review takes the drawer over rather than opening a second one on
   * top of it.
   */
  describe('writing a review', () => {
    const openForm = () => {
      render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: 'Add review' }));
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
      fireEvent.click(screen.getByRole('button', { name: 'Share moment' }));

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

    it('goes back to the place when the settings are closed', () => {
      usePlaceManager.mockReturnValue({
        isManager: true,
        owningCommunity: { title: 'Weekend Readers' },
      });
      render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: 'Reservation settings' }));

      fireEvent.click(screen.getByRole('button', { name: 'close settings' }));

      expect(screen.getByTestId('about')).toBeInTheDocument();
    });

    it('opens straight on the settings when asked to, as from an approved claim', () => {
      render(<PlaceDrawer placeId="p1" isOpen initialView="reservations" onClose={jest.fn()} />);

      expect(screen.getByTestId('reservation-settings')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Reservation settings' })).toBeInTheDocument();
    });

    it('gives the manager their own footer in place of review and booking', () => {
      usePlaceManager.mockReturnValue({
        isManager: true,
        owningCommunity: { title: 'Weekend Readers' },
      });

      render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);

      expect(screen.getByTestId('manager-footer')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Add review' })).not.toBeInTheDocument();
    });

    it('gives a visitor the review footer', () => {
      render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);

      expect(screen.queryByTestId('manager-footer')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add review' })).toBeInTheDocument();
    });

    it('offers a manager with no profile the setup, and no Reservations tab or section', () => {
      usePlaceManager.mockReturnValue({
        isManager: true,
        owningCommunity: { title: 'Weekend Readers' },
      });
      usePlaceReservationProfiles.mockReturnValue({ data: { data: { results: [] } } });

      render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);

      expect(screen.getByRole('button', { name: 'Reservation settings' })).toBeInTheDocument();
      expect(screen.queryByRole('tab', { name: 'Reservations' })).not.toBeInTheDocument();
      expect(screen.queryByTestId('host-section')).not.toBeInTheDocument();
    });

    it('opens on the place itself otherwise', () => {
      render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);

      expect(screen.getByTestId('about')).toBeInTheDocument();
      expect(screen.queryByTestId('reservation-settings')).not.toBeInTheDocument();
    });
  });

  describe('answering reservations', () => {
    const liveProfile = {
      id: 'profile-1',
      reservationType: 'restaurant_reservation',
      status: 'active',
    };

    const openAsManager = () => {
      usePlaceManager.mockReturnValue({
        isManager: true,
        owningCommunity: { title: 'Weekend Readers' },
      });
      usePlaceReservationProfiles.mockReturnValue({ data: { data: { results: [liveProfile] } } });
      render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);
    };

    it('asks for the venue’s requests only for a manager', () => {
      render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);

      expect(usePlaceBookingRequests).toHaveBeenCalledWith('p1', undefined);
    });

    it('asks for the requests of the live profile when the reader manages the place', () => {
      openAsManager();

      expect(usePlaceBookingRequests).toHaveBeenCalledWith('p1', 'profile-1');
    });

    it('puts the reservations in the tabs next to About, for a manager with a profile', () => {
      openAsManager();

      const names = screen.getAllByRole('tab').map((tab) => tab.textContent);
      expect(names.slice(0, 2)).toEqual(['About', 'Reservations']);
    });

    it('leaves the Reservations tab and section to the manager', () => {
      render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);

      expect(screen.queryByRole('tab', { name: 'Reservations' })).not.toBeInTheDocument();
      expect(screen.queryByTestId('host-section')).not.toBeInTheDocument();
    });

    it('leaves the Reservations tab out until the place has a profile', () => {
      usePlaceManager.mockReturnValue({ isManager: true, owningCommunity: undefined });
      render(<PlaceDrawer placeId="p1" isOpen onClose={jest.fn()} />);

      expect(screen.queryByRole('tab', { name: 'Reservations' })).not.toBeInTheDocument();
      expect(screen.queryByTestId('host-section')).not.toBeInTheDocument();
    });

    it('gives the tab a section to scroll to, right after About', () => {
      openAsManager();

      const about = document.getElementById('place-about') as HTMLElement;
      const reservations = document.getElementById('place-reservations') as HTMLElement;

      expect(reservations).toContainElement(screen.getByTestId('host-section'));
      expect(about.compareDocumentPosition(reservations)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
      expect(reservations.nextElementSibling).not.toBeNull();
    });

    it('hands the section the venue’s reservations', () => {
      usePlaceBookingRequests.mockReturnValue({
        data: {
          data: {
            results: [
              {
                id: 'a',
                status: 'requested',
                occurrence: { id: 'o', startDate: '2026-11-03T18:00:00' },
              },
              {
                id: 'b',
                status: 'completed',
                occurrence: { id: 'o', startDate: '2026-11-04T18:00:00' },
              },
            ],
          },
        },
      });
      openAsManager();

      expect(screen.getByTestId('host-section')).toHaveAttribute('data-count', '2');
    });

    it('opens the list in place, under its own title', () => {
      openAsManager();

      fireEvent.click(screen.getByRole('button', { name: 'open all reservations' }));

      expect(screen.getByTestId('host-reservations')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Reservations' })).toBeInTheDocument();
      expect(screen.queryByTestId('about')).not.toBeInTheDocument();
    });

    it('opens the list on the day and group that was picked', () => {
      openAsManager();

      fireEvent.click(screen.getByRole('button', { name: 'open all reservations' }));

      expect(screen.getByTestId('host-reservations')).toHaveAttribute('data-day', '2026-11-04');
      expect(screen.getByTestId('host-reservations')).toHaveAttribute('data-group', 'admitted');
    });

    it('goes from the list to hold off and back to the place', () => {
      openAsManager();
      fireEvent.click(screen.getByRole('button', { name: 'open all reservations' }));

      fireEvent.click(screen.getByRole('button', { name: 'open hold off' }));

      expect(screen.getByTestId('hold-off')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Hold off reservations' })).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'back' }));

      expect(screen.getByTestId('about')).toBeInTheDocument();
    });

    it('goes from the list to the settings', () => {
      openAsManager();
      fireEvent.click(screen.getByRole('button', { name: 'open all reservations' }));

      fireEvent.click(screen.getByRole('button', { name: 'open settings' }));

      expect(screen.getByTestId('reservation-settings')).toBeInTheDocument();
    });
  });
});
