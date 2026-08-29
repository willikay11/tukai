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

      [
        'Name your reservation',
        'Date & time',
        'Guests',
        'Add a message (Optional)',
        'Invite people (Optional)',
      ].forEach((title) =>
        expect(screen.getByRole('heading', { name: title })).toBeInTheDocument(),
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
    // The button stays live on an incomplete form: pressing it is how the
    // reader finds out what is still missing
    it('marks what is missing rather than sitting disabled', async () => {
      const user = userEvent.setup();
      renderPage();

      const request = screen.getByRole('button', { name: 'Request Reservation' });
      expect(request).toBeEnabled();

      await user.click(request);

      expect(screen.getByText('Give your reservation a name')).toBeInTheDocument();
      expect(screen.getByText('Pick a day for your reservation')).toBeInTheDocument();
      expect(requestBooking).not.toHaveBeenCalled();
    });

    it('drops a field’s error once it is answered', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole('button', { name: 'Request Reservation' }));
      expect(screen.getByText('Give your reservation a name')).toBeInTheDocument();

      await user.type(screen.getByPlaceholderText("e.g. Valentine's Dinner Date"), 'Date Night');

      expect(screen.queryByText('Give your reservation a name')).not.toBeInTheDocument();
    });

    it('updates live as the reader fills the form', async () => {
      const user = userEvent.setup();
      renderPage();

      // The summary's own placeholder, not an error
      expect(screen.getByText('Pick a date')).toBeInTheDocument();
      expect(screen.getByText('2 guests')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'More guests' }));

      expect(screen.getByText('3 guests')).toBeInTheDocument();
    });

    // The name is required, so a slot alone is not enough to send it
    it('still asks for a name once a slot is chosen', async () => {
      const user = userEvent.setup();
      renderPage();
      await pickFirstSlot(user);

      await user.click(screen.getByRole('button', { name: 'Request Reservation' }));

      expect(screen.getByText('Give your reservation a name')).toBeInTheDocument();
      expect(requestBooking).not.toHaveBeenCalled();
    });
  });

  describe('invites', () => {
    // The same field the create-experience flow uses: several addresses in one
    // go, separated by commas
    it('takes several invitees at once, comma separated', async () => {
      const user = userEvent.setup();
      renderPage();

      const field = screen.getByPlaceholderText('Add guest emails, separated by commas');
      await user.type(field, 'ada@tukai.co,grace@tukai.co,');

      expect(screen.getByText('ada@tukai.co')).toBeInTheDocument();
      expect(screen.getByText('grace@tukai.co')).toBeInTheDocument();
    });

    it('keeps an address that does not parse in the field to be corrected', async () => {
      const user = userEvent.setup();
      renderPage();

      const field = screen.getByPlaceholderText('Add guest emails, separated by commas');
      await user.type(field, 'not-an-email,');

      expect(screen.getByText(/is not a valid email/)).toBeInTheDocument();
      expect(field).toHaveValue('not-an-email');
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
    // The serializer is flat: requested_date, requested_time and party_size are
    // the required fields, not a ticket_purchases array
    it('sends the date, time, party size and the reader’s note', async () => {
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
          requestedDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          requestedTime: expect.stringMatching(/^\d{2}:\d{2}$/),
          partySize: 2,
          specialRequests: 'Date Night',
          message: 'Window seat',
        }),
        expect.anything(),
      );
    });

    // The same modal the create-experience flow ends on, rather than a toast
    // that disappears while the reader is still reading it
    it('confirms with the created modal once the request lands', async () => {
      const user = userEvent.setup();
      // The mutation reports success through its own callback
      requestBooking.mockImplementation(
        (_payload: unknown, { onSuccess }: { onSuccess: () => void }) => onSuccess(),
      );
      renderPage();

      await user.type(screen.getByPlaceholderText("e.g. Valentine's Dinner Date"), 'Date Night');
      await pickFirstSlot(user);
      await user.click(screen.getByRole('button', { name: 'Request Reservation' }));

      expect(await screen.findByText('Reservation Requested Successfully!')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /View Mawimbi Seafood House/ })).toBeInTheDocument();
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
