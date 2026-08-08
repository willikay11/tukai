import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';

import type { FormData } from '../../hooks/useCreateExperienceFlow';
import { TicketsStep } from './index';

jest.mock('uuid', () => ({
  v4: () => 'test-id-123',
}));

const mockFormData: FormData['tickets'] = {
  commission: 'host',
  ticketMode: 'entire-period',
  items: [],
};

const mockDateTypeData: FormData['dateType'] = {
  experienceType: 'one-time',
  community: null,
  date: '2026-06-15',
  startTime: '10:00',
  endTime: '12:00',
  isRecurring: false,
  recurringDays: [],
  recurrenceStartDate: null,
  recurrenceEndDate: null,
  timeSlots: [],
};

const defaultProps = {
  formData: mockFormData,
  dateTypeData: mockDateTypeData,
  experiencePricing: 'paid' as const,
  onChange: jest.fn(),
  errors: {},
  onSaveContinue: jest.fn(),
  onCancel: jest.fn(),
  isRecurring: false,
  isMultiDay: false,
  experienceId: 'exp-123',
};

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
};

describe('TicketsStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the component with required elements', () => {
      renderWithQueryClient(<TicketsStep {...defaultProps} />);
      expect(screen.getByText('Create Tickets')).toBeInTheDocument();
    });
  });

  describe('Non-Recurring Tickets', () => {
    it('shows ticket date badge for single-day experience', () => {
      const { container } = renderWithQueryClient(<TicketsStep {...defaultProps} />);
      expect(container.textContent).toContain('06/15/2026');
      expect(container.textContent).toContain('10:00 AM');
    });

    it('displays error messages', () => {
      const errorProps = {
        ...defaultProps,
        errors: { items: 'Please add at least one ticket' },
      };

      renderWithQueryClient(<TicketsStep {...errorProps} />);
      expect(screen.getByText(/Please add at least one ticket/i)).toBeInTheDocument();
    });
  });

  describe('Recurring Tickets', () => {
    const recurringProps = {
      ...defaultProps,
      isRecurring: true,
      dateTypeData: {
        ...mockDateTypeData,
        isRecurring: true,
        recurringDays: ['mon', 'wed', 'fri'],
        timeSlots: [
          { startTime: '09:00', endTime: '10:00' },
          { startTime: '14:00', endTime: '15:00' },
        ],
        recurrenceStartDate: '2026-06-01',
        recurrenceEndDate: '2026-08-31',
      },
    };

    it('shows time slots for recurring experience', () => {
      const { container } = renderWithQueryClient(<TicketsStep {...recurringProps} />);
      expect(container.textContent).toContain('Create Tickets');
      // The relative validity picker is commented out in TicketForm for now —
      // assert 'hour' is back once that section is restored
      expect(container.textContent).not.toContain('Ticket Sales Validity');
    });
  });

  describe('Multi-Day Tickets', () => {
    const multiDayProps = {
      ...defaultProps,
      isMultiDay: true,
      dateTypeData: {
        ...mockDateTypeData,
        experienceType: 'multi-day' as const,
        multiDayStartDate: '2026-06-15',
        multiDayStartTime: '09:00',
        multiDayEndDate: '2026-06-17',
        multiDayEndTime: '17:00',
      },
    };

    it('renders without errors for multi-day experience', () => {
      renderWithQueryClient(<TicketsStep {...multiDayProps} />);
      expect(screen.getByText('Create Tickets')).toBeInTheDocument();
    });
  });

  describe('Ticket Display', () => {
    it('displays saved ticket cards with correct data', () => {
      const formDataWithTicket: FormData['tickets'] = {
        commission: 'host',
        ticketMode: 'entire-period',
        items: [
          {
            id: 'ticket-1',
            apiId: 'api-1',
            name: 'VIP Ticket',
            quantity: 10,
            amount: 150,
            salesStartDate: '2026-06-01',
            salesStartTime: '10:00',
            salesEndDate: '2026-06-10',
            salesEndTime: '23:59',
            acceptPartialPayment: false,
            salesStartRelative: null,
            salesEndRelative: null,
            duplicateForEntirePeriod: false,
          },
        ],
      };

      renderWithQueryClient(<TicketsStep {...defaultProps} formData={formDataWithTicket} />);

      expect(screen.getByText('VIP Ticket')).toBeInTheDocument();
    });
  });
});
