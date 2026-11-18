import { render, screen } from '@testing-library/react';

import { TicketsStep } from './TicketsStep';

jest.mock('uuid', () => ({ v4: () => 'test-uuid-v4' }));
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast: jest.fn() }) }));
jest.mock('@/services/experience');

let mockFee = { ratePct: 8, planName: 'Basic' as string | null };
// The host's plan fee (useHostingFee), and the same formatter the context uses
jest.mock('@/context/HostingPlanContext', () => ({
  useHostingFee: () => mockFee,
  formatFeePct: (pct: number) => `${Number(pct.toFixed(2))}%`,
}));

// Just the parts of the create flow the Tickets step reads
const flowFor = (experiencePricing: 'paid' | 'free') =>
  ({
    experienceId: 'exp-1',
    formData: {
      dateType: { experiencePricing, experienceType: 'one-time', isRecurring: false },
      tickets: { items: [], commission: 'host', ticketMode: 'entire-period' },
    },
    ticketsErrors: {},
    slotTemplateRecords: [],
    timeZone: 'Africa/Nairobi',
    updateTicketsFormData: jest.fn(),
    handlers: { handleUpdateFeesAllocation: jest.fn() },
  }) as unknown as Parameters<typeof TicketsStep>[0]['flow'];

describe('TicketsStep', () => {
  // DEV-420: ticket checkout always charges the full price, and the API
  // refuses a deposit on a standard or itinerary ticket
  it('offers no partial payments on a paid experience', () => {
    render(<TicketsStep flow={flowFor('paid')} />);

    expect(screen.getByText('I will pay the full commission')).toBeInTheDocument();
    expect(screen.queryByRole('switch', { name: /partial payments/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/partial payments/i)).not.toBeInTheDocument();
  });

  // DEV-350: the fee is the host's plan's, and splitting it means half each
  it('names the host’s own plan fee, and half of it each for a split', () => {
    mockFee = { ratePct: 3.5, planName: 'Premium' };
    render(<TicketsStep flow={flowFor('paid')} />);

    expect(screen.getByText(/Tukai charges 3.5% on your Premium plan/)).toBeInTheDocument();
    expect(
      screen.getByText(/Split 50-50 between the customer and me \(1.75% each\)/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/4% commission/)).not.toBeInTheDocument();
  });
});
