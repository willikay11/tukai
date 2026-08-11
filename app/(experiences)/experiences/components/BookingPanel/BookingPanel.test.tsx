import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Experience } from '@/types/experience';

import { BookingPanel } from './index';

let mockSession: { data: { user: { id: string } } | null } = { data: { user: { id: 'u1' } } };
jest.mock('next-auth/react', () => ({
  useSession: () => mockSession,
}));

// Camel-cased shape of the real v2 ticket-purchases 201 response
const purchaseResponse = {
  status: 201,
  success: true,
  data: {
    detail: "Purchased tickets for the experience 'Gikuyu na Mumbi' successfully.",
    order: { id: 'd45da06f-18e9-443f-9f86-f6054fa1213a', status: 'pending' },
    paymentDetails: {
      authorizationUrl: 'https://checkout.paystack.com/mgk99hs4wr21ejb',
      accessCode: 'mgk99hs4wr21ejb',
      reference: 'TRN-20260714-4OIK5LDP',
    },
  },
};

// Camel-cased occurrences as returned by /v1/experiences/{id}/occurrences/
const occurrences = [
  {
    id: 'bed13941-c542-4468-925c-b8da94842bd0',
    startDate: '2026-08-27T14:00:00Z',
    endDate: '2026-08-27T17:00:00Z',
    slotTemplate: { id: 'c093ca3e', startTime: '14:00:00', durationMinutes: 180 },
  },
  {
    id: 'b643f113-8500-4589-9f22-15e7de6736e6',
    startDate: '2026-08-27T18:00:00Z',
    endDate: '2026-08-27T21:00:00Z',
    slotTemplate: { id: 'ba199d91', startTime: '18:00:00', durationMinutes: 180 },
  },
];

const mockMutate = jest.fn(
  (_payload: unknown, options?: { onSuccess?: (response: typeof purchaseResponse) => void }) => {
    options?.onSuccess?.(purchaseResponse);
  },
);

jest.mock('@/app/shared/hooks/useExperiences', () => ({
  useFetchExperienceOccurrences: () => ({ data: { data: occurrences } }),
  usePurchaseExperienceTicketV2: () => ({
    mutate: mockMutate,
    isPending: false,
    data: purchaseResponse,
  }),
}));

const experience = {
  id: 'a97edd4f-763f-49ef-a9bc-fea0a36c1dbe',
  title: 'Gikuyu na Mumbi',
  recurrenceRule:
    'DTSTART:20260827T110000Z\nRRULE:FREQ=WEEKLY;UNTIL=20260829T205959Z;BYDAY=TH,SA,FR',
  startDate: '2026-08-27T14:00:00Z',
  endDate: '2026-08-29T21:00:00Z',
  currency: 'Ksh.',
  isPaid: true,
  priceStartsFrom: { amount: 1500, currency: 'KES' },
  // Mirrors live data: one ticket per slot template
  tickets: [
    { id: 'ticket-1', name: 'Normal', price: '1500.00', quantity: 10, slotTemplate: 'c093ca3e' },
    { id: 'ticket-2', name: 'VIP', price: '2500.00', quantity: 5, slotTemplate: 'ba199d91' },
  ],
} as unknown as Experience;

describe('BookingPanel purchase flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSession = { data: { user: { id: 'u1' } } };
  });

  const selectTicketAndSafePaymentOptions = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getAllByRole('button', { name: 'Increase quantity' })[0]);
    // Email delivery avoids the WhatsApp phone requirement, but still needs a
    // valid address of its own
    await user.click(screen.getByRole('button', { name: 'Via Email' }));
    await user.type(screen.getByPlaceholderText('Enter email address'), 'guest@example.com');
    // The payment method picker is commented out, so M-Pesa is always the
    // method and a valid phone number is required
    await user.type(screen.getByPlaceholderText('Enter M-Pesa number'), '712345678');
  };

  it('sends the occurrence id and opens Paystack with the authorization_url from the response', async () => {
    const user = userEvent.setup();
    render(<BookingPanel experience={experience} />);

    await selectTicketAndSafePaymentOptions(user);
    await user.click(screen.getByRole('button', { name: /^pay/i }));

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        ticket_purchases: [{ ticket_id: 'ticket-1', quantity: 1 }],
        occurrence: 'bed13941-c542-4468-925c-b8da94842bd0',
      }),
      expect.anything(),
    );

    // Logged in → no anonymous purchaser fields in the payload
    expect(mockMutate.mock.calls[0][0]).not.toHaveProperty('first_name');

    // The Paystack pop-up shows the checkout url from payment_details.authorization_url
    await waitFor(() => {
      const iframe = document.querySelector('iframe');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', 'https://checkout.paystack.com/mgk99hs4wr21ejb');
    });
  });

  it('clears the purchaser’s details once Paystack reports success', async () => {
    const user = userEvent.setup();
    render(<BookingPanel experience={experience} />);

    await selectTicketAndSafePaymentOptions(user);
    await user.click(screen.getByRole('button', { name: /^pay/i }));

    await waitFor(() => expect(document.querySelector('iframe')).toBeInTheDocument());

    // How the real Paystack component learns the payment went through
    fireEvent(window, new MessageEvent('message', { data: { status: 'success' } }));

    await waitFor(() => expect(screen.getByPlaceholderText('Enter M-Pesa number')).toHaveValue(''));
    expect(screen.getByPlaceholderText('Enter email address')).toHaveValue('');
    // Quantity is uncontrolled, so this only passes because it is remounted
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  // The checkout lives in a dialog now; it used to render inline and unguarded,
  // leaving an empty iframe under the panel before any purchase
  it('does not mount the checkout iframe before a purchase', () => {
    render(<BookingPanel experience={experience} />);

    expect(document.querySelector('iframe')).not.toBeInTheDocument();
  });

  it('shows both occurrence slots for the auto-selected first date', () => {
    render(<BookingPanel experience={experience} />);

    expect(screen.getByText('2:00 PM - 5:00 PM')).toBeInTheDocument();
    expect(screen.getByText('6:00 PM - 9:00 PM')).toBeInTheDocument();
  });

  it('lists only the selected slot’s tickets and swaps them on slot change', async () => {
    const user = userEvent.setup();
    render(<BookingPanel experience={experience} />);

    // First slot (template c093ca3e) auto-selected → only "Normal" shows
    expect(screen.getByText('Normal')).toBeInTheDocument();
    expect(screen.queryByText('VIP')).not.toBeInTheDocument();

    await user.click(screen.getByText('6:00 PM - 9:00 PM'));

    expect(screen.getByText('VIP')).toBeInTheDocument();
    expect(screen.queryByText('Normal')).not.toBeInTheDocument();
  });

  it('keeps quantities picked on another slot out of the total and blocks Pay', async () => {
    const user = userEvent.setup();
    render(<BookingPanel experience={experience} />);

    // Pick a "Normal" ticket on the first slot, then switch slots
    await user.click(screen.getAllByRole('button', { name: 'Increase quantity' })[0]);
    await user.click(screen.getByText('6:00 PM - 9:00 PM'));

    // Pay stays clickable; the hidden slot's quantity is inert, so pressing it
    // reports the missing ticket rather than submitting
    const payButton = screen.getByRole('button', { name: /^pay/i });
    expect(payButton).not.toBeDisabled();

    await user.click(payButton);

    expect(mockMutate).not.toHaveBeenCalled();
    expect(screen.getByText('Please select at least one ticket.')).toBeInTheDocument();
  });

  it('reports every missing field on the inputs when Pay is pressed empty', async () => {
    const user = userEvent.setup();
    render(<BookingPanel experience={experience} />);

    await user.click(screen.getByRole('button', { name: /^pay/i }));

    expect(mockMutate).not.toHaveBeenCalled();
    expect(screen.getByText('Please select at least one ticket.')).toBeInTheDocument();
    // Delivery defaults to WhatsApp, and M-Pesa is the only payment method
    expect(screen.getAllByText('Please enter a valid phone number.')).toHaveLength(2);
  });

  it('blocks anonymous purchase until contact details are valid, then includes them', async () => {
    mockSession = { data: null };
    const user = userEvent.setup();
    render(<BookingPanel experience={experience} />);

    await selectTicketAndSafePaymentOptions(user);
    await user.click(screen.getByRole('button', { name: /^pay/i }));

    expect(mockMutate).not.toHaveBeenCalled();
    expect(screen.getByText('Please enter your first name.')).toBeInTheDocument();
    expect(screen.getByText('Please enter your last name.')).toBeInTheDocument();
    expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('First Name'), 'Tony');
    await user.type(screen.getByPlaceholderText('Last Name'), 'Ouma');
    await user.type(screen.getByPlaceholderText('Email'), 'tony@example.com');
    await user.click(screen.getByRole('button', { name: /^pay/i }));

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        first_name: 'Tony',
        last_name: 'Ouma',
        confirmation_email: 'tony@example.com',
        occurrence: 'bed13941-c542-4468-925c-b8da94842bd0',
      }),
      expect.anything(),
    );
  });
});

// Itinerary experiences have no slot templates — the occurrence arrives with
// slotTemplate: null, which used to crash on `slotTemplate.startTime`
describe('BookingPanel for an experience without slot templates', () => {
  const itineraryExperience = {
    id: 'itinerary-1',
    title: 'Mount Kenya Trek',
    recurrenceRule: null,
    startDate: '2026-09-10T08:00:00Z',
    endDate: '2026-09-12T17:00:00Z',
    currency: 'Ksh.',
    isPaid: true,
    priceStartsFrom: { amount: 5000, currency: 'KES' },
    tickets: [{ id: 'ticket-1', name: 'Standard', price: '5000.00', quantity: 10 }],
  } as unknown as Experience;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSession = { data: { user: { id: 'u1' } } };
    occurrences.length = 0;
    occurrences.push({
      id: 'occurrence-1',
      startDate: '2026-09-10T08:00:00Z',
      endDate: '2026-09-10T17:00:00Z',
      slotTemplate: null,
    } as unknown as (typeof occurrences)[number]);
  });

  it('renders without throwing and still lists the ticket', () => {
    expect(() => render(<BookingPanel experience={itineraryExperience} />)).not.toThrow();
    expect(screen.getByText('Standard')).toBeInTheDocument();
  });
});
