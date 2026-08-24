import React from 'react';

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Place } from '@/types/place';

import { ReservePageContent } from './ReservePageContent';

const push = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push, back: jest.fn() }) }));
jest.mock('next-auth/react', () => ({ useSession: () => ({ data: null }) }));

jest.mock('@/app/shared/components/Images', () => ({
  PhotoImage: ({ fallback }: Record<string, unknown>) => <span>{fallback as React.ReactNode}</span>,
}));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

const requestBooking = jest.fn();
const usePlaceReservationProfiles = jest.fn();
const usePlaceAvailability = jest.fn();
jest.mock('@/app/shared/hooks/usePlaces', () => ({
  usePlaceReservationProfiles: () => usePlaceReservationProfiles(),
  usePlaceAvailability: () => usePlaceAvailability(),
  useCreatePlaceBookingRequest: () => ({ mutate: requestBooking, isPending: false }),
  useFollowing: () => ({ data: { data: { results: [] } }, isLoading: false }),
}));

const place = {
  id: 'p1',
  title: 'Mawimbi Seafood House',
  photos: [{ id: 'ph1', photo: 'https://cdn.tukai.co/a.jpg', isCover: true }],
  categories: [{ id: 'c1', name: 'Seafood', group: 'interests' }],
  location: { city: 'Kilifi' },
} as unknown as Place;

// Open every day, 12:00–15:00 in 90-minute steps
const rules = Array.from({ length: 7 }, (_, day) => ({
  id: `r${day}`,
  reservationProfile: 'rp1',
  dayOfWeek: day,
  openTime: '12:00',
  closeTime: '15:00',
  slotIntervalMinutes: 90,
}));

const withProfile = (profile: Record<string, unknown> | null, isLoading = false) =>
  usePlaceReservationProfiles.mockReturnValue({
    data: { data: { results: profile ? [profile] : [] } },
    isLoading,
  });

const activeProfile = {
  id: 'rp1',
  place: 'p1',
  reservationType: 'restaurant_reservation',
  status: 'active',
  seatingCapacity: 40,
};

const renderPage = () => render(<ReservePageContent place={place} />);

const pickFirstSlot = async (user: ReturnType<typeof userEvent.setup>) => {
  const days = screen.getAllByRole('button', { pressed: false });
  await user.click(days[0]);
  await user.click(screen.getAllByRole('button', { name: /:\d\d (AM|PM)/ })[0]);
};

describe('ReservePageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    withProfile(activeProfile);
    usePlaceAvailability.mockReturnValue({ data: { data: { rules, exceptions: [] } } });
  });

  describe('page', () => {
    it('heads the page and links back to the place', () => {
      renderPage();

      expect(screen.getByRole('heading', { name: 'Make a reservation' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Back to Mawimbi Seafood House/ }),
      ).toBeInTheDocument();
    });

    it('renders every step of the form', () => {
      renderPage();

      ['Name your reservation', 'Date & time', 'Guests', 'Add a message', 'Invite people'].forEach(
        (title) => expect(screen.getByRole('heading', { name: title })).toBeInTheDocument(),
      );
    });

    it('shows the place in the summary', () => {
      renderPage();

      expect(screen.getByText('Seafood · Kilifi')).toBeInTheDocument();
    });
  });

  describe('naming', () => {
    it('fills the field from a preset', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole('button', { name: 'Date Night' }));

      expect(screen.getByPlaceholderText("e.g. Valentine's Dinner Date")).toHaveValue('Date Night');
    });
  });

  describe('summary', () => {
    it('cannot submit before a date and time are picked', () => {
      renderPage();

      expect(screen.getByRole('button', { name: 'Pick a date & time' })).toBeDisabled();
    });

    it('updates live as the reader fills the form', async () => {
      const user = userEvent.setup();
      renderPage();

      expect(screen.getByText('Pick a date')).toBeInTheDocument();
      expect(screen.getByText('2 guests')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'More guests' }));

      expect(screen.getByText('3 guests')).toBeInTheDocument();
    });

    it('enables the request once a slot is chosen', async () => {
      const user = userEvent.setup();
      renderPage();
      await pickFirstSlot(user);

      expect(screen.getByRole('button', { name: 'Request Reservation' })).toBeEnabled();
    });
  });

  describe('guests', () => {
    it('will not go below one', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole('button', { name: 'Fewer guests' }));
      expect(screen.getByRole('button', { name: 'Fewer guests' })).toBeDisabled();
    });
  });

  describe('submitting', () => {
    it('sends the party size and the reader’s note', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.type(screen.getByPlaceholderText("e.g. Valentine's Dinner Date"), 'Date Night');
      await user.type(
        screen.getByPlaceholderText('Write a short note to the place...'),
        'Window seat',
      );
      await pickFirstSlot(user);
      await user.click(screen.getByRole('button', { name: 'Request Reservation' }));

      expect(requestBooking).toHaveBeenCalledWith(
        expect.objectContaining({
          ticketPurchases: [
            expect.objectContaining({
              partySize: 2,
              specialRequests: 'Date Night — Window seat',
            }),
          ],
        }),
        expect.anything(),
      );
    });
  });

  describe('a place that is not bookable', () => {
    it('says so rather than showing the form', () => {
      withProfile(null);

      renderPage();

      expect(
        screen.getByText('Mawimbi Seafood House has not opened up reservations yet.'),
      ).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Date & time' })).not.toBeInTheDocument();
    });

    it('shows a skeleton while the profile loads', () => {
      withProfile(null, true);

      const { container } = renderPage();

      expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });

  // The API cannot take money before the venue accepts
  it('does not promise a charge on request', () => {
    renderPage();

    expect(screen.getByText(/Nothing is charged to request it/)).toBeInTheDocument();
  });
});
