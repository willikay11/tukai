import { render, screen } from '@testing-library/react';

import { TicketsStep } from './TicketsStep';

jest.mock('uuid', () => ({ v4: () => 'test-uuid-v4' }));
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast: jest.fn() }) }));
jest.mock('@/services/experience');

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
});
