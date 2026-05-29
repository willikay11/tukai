import { render, screen } from '@testing-library/react';
import { PreviewTicketsSection } from './index';
import type { Ticket } from '@/types/ticket';

describe('PreviewTicketsSection', () => {
  const mockTickets: Ticket[] = [
    {
      id: 'ticket-1',
      name: 'General Admission',
      quantity: 100,
      price: 500,
      experience: 'exp-123',
      availableQuantity: 100,
      ticket_sales_closing_duration: 1,
      ticket_sales_closing_unit: 'hours',
      ticket_sales_closing_condition: 'before_start',
      salesStartDate: '2026-06-01',
      salesEndDate: '2026-06-10',
      is_sales_window_active: true,
    } as Ticket,
    {
      id: 'ticket-2',
      name: 'VIP Pass',
      quantity: 20,
      price: 1000,
      experience: 'exp-123',
      availableQuantity: 20,
      ticket_sales_closing_duration: 2,
      ticket_sales_closing_unit: 'days',
      ticket_sales_closing_condition: 'before_end',
      salesStartDate: '2026-06-05',
      salesEndDate: '2026-06-08',
      is_sales_window_active: true,
    } as Ticket,
  ];

  const recurringTickets: Ticket[] = [
    {
      id: 'recurring-1',
      name: 'Class Ticket',
      quantity: 30,
      price: 300,
      experience: 'exp-456',
      availableQuantity: 30,
      ticket_sales_closing_duration: 1,
      ticket_sales_closing_unit: 'hours',
      ticket_sales_closing_condition: 'before_start',
      salesStartDate: null,
      salesEndDate: null,
      is_sales_window_active: true,
      salesEndRelative: {
        amount: 1,
        unit: 'hour',
        anchor: 'start',
      } as any,
    } as Ticket,
  ];

  describe('Rendering', () => {
    it('renders the Tickets heading', () => {
      render(<PreviewTicketsSection tickets={mockTickets} />);
      expect(screen.getByText('Tickets')).toBeInTheDocument();
    });

    it('renders "Not set yet" when no tickets', () => {
      render(<PreviewTicketsSection tickets={[]} />);
      expect(screen.getByText('Not set yet')).toBeInTheDocument();
    });

    it('renders edit button when onEdit is provided', () => {
      const onEdit = jest.fn();
      render(<PreviewTicketsSection tickets={mockTickets} onEdit={onEdit} />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('does not render edit button when onEdit is not provided', () => {
      render(<PreviewTicketsSection tickets={mockTickets} />);
      // Should only render ticket cards, no edit button
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Ticket Display', () => {
    it('displays all ticket names', () => {
      render(<PreviewTicketsSection tickets={mockTickets} />);
      expect(screen.getByText('General Admission')).toBeInTheDocument();
      expect(screen.getByText('VIP Pass')).toBeInTheDocument();
    });

    it('displays ticket quantities', () => {
      render(<PreviewTicketsSection tickets={mockTickets} />);
      // Quantities should be visible in the SavedTicketCard
      expect(screen.getAllByText(/Qty/i)).toHaveLength(mockTickets.length);
    });

    it('displays ticket prices in KES format', () => {
      render(<PreviewTicketsSection tickets={mockTickets} />);
      // Should show prices formatted as KES 500.00, KES 1000.00
      expect(screen.getByText(/KES 500/)).toBeInTheDocument();
      expect(screen.getByText(/KES 1,000/)).toBeInTheDocument();
    });

    it('displays cover photo when provided', () => {
      const coverPhoto = 'https://example.com/cover.jpg';
      render(
        <PreviewTicketsSection tickets={mockTickets} coverPhoto={coverPhoto} />
      );
      const images = screen.getAllByAltText('General Admission');
      expect(images.length).toBeGreaterThan(0);
    });
  });

  describe('Validity Display', () => {
    it('displays absolute date validity for single-day tickets', () => {
      render(<PreviewTicketsSection tickets={mockTickets} />);
      expect(screen.getByText(/Jun 1, 2026/i)).toBeInTheDocument();
      expect(screen.getByText(/Jun 10, 2026/i)).toBeInTheDocument();
    });

    it('displays relative validity for recurring tickets', () => {
      render(<PreviewTicketsSection tickets={recurringTickets} />);
      expect(screen.getByText(/1 hour before the experience starts/i)).toBeInTheDocument();
    });

    it('displays "Not set" for tickets without validity', () => {
      const ticketNoValidity: Ticket[] = [
        {
          id: 'ticket-3',
          name: 'Test Ticket',
          quantity: 10,
          price: 100,
          experience: 'exp-789',
          availableQuantity: 10,
          salesStartDate: null,
          salesEndDate: null,
          is_sales_window_active: true,
        } as Ticket,
      ];

      render(<PreviewTicketsSection tickets={ticketNoValidity} />);
      expect(screen.getByText(/Not set/i)).toBeInTheDocument();
    });
  });

  describe('Commission Handling', () => {
    it('displays host commission without additional cost', () => {
      render(
        <PreviewTicketsSection
          tickets={mockTickets}
          commissionPayer="host"
        />
      );
      // Should only show base price, not customer pay
      expect(screen.queryByText(/Customer Pays/i)).not.toBeInTheDocument();
    });

    it('displays customer commission with total cost', () => {
      render(
        <PreviewTicketsSection
          tickets={mockTickets}
          commissionPayer="customer"
        />
      );
      // Should show customer pays with 4% commission
      expect(screen.getAllByText(/Customer Pays/i)).toBeDefined();
    });

    it('displays split commission correctly', () => {
      render(
        <PreviewTicketsSection
          tickets={mockTickets}
          commissionPayer="split"
        />
      );
      // Should show customer pays with 2% commission (split)
      expect(screen.getAllByText(/Customer Pays/i)).toBeDefined();
    });
  });

  describe('Multiple Tickets', () => {
    it('displays all tickets in order', () => {
      const manyTickets = [
        { ...mockTickets[0], id: 'ticket-1', name: 'Ticket 1' },
        { ...mockTickets[0], id: 'ticket-2', name: 'Ticket 2' },
        { ...mockTickets[0], id: 'ticket-3', name: 'Ticket 3' },
      ];

      render(<PreviewTicketsSection tickets={manyTickets} />);
      expect(screen.getByText('Ticket 1')).toBeInTheDocument();
      expect(screen.getByText('Ticket 2')).toBeInTheDocument();
      expect(screen.getByText('Ticket 3')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles tickets with string price values', () => {
      const ticketWithStringPrice: Ticket[] = [
        {
          ...mockTickets[0],
          price: '500.50',
        } as any,
      ];

      render(<PreviewTicketsSection tickets={ticketWithStringPrice} />);
      expect(screen.getByText(/KES 500.50/)).toBeInTheDocument();
    });

    it('handles tickets without availableQuantity', () => {
      const ticketNoAvailable: Ticket[] = [
        {
          ...mockTickets[0],
          availableQuantity: undefined,
        } as Ticket,
      ];

      render(<PreviewTicketsSection tickets={ticketNoAvailable} />);
      expect(screen.getByText('General Admission')).toBeInTheDocument();
    });

    it('handles mixed absolute and relative validity in different tickets', () => {
      const mixedTickets: Ticket[] = [
        mockTickets[0], // Has absolute dates
        recurringTickets[0], // Has relative validity
      ];

      render(<PreviewTicketsSection tickets={mixedTickets} />);
      expect(screen.getByText(/Jun 1, 2026/i)).toBeInTheDocument();
      expect(screen.getByText(/1 hour before the experience starts/i)).toBeInTheDocument();
    });
  });

  describe('Relative Validity Units', () => {
    it('displays relative validity with hour unit', () => {
      const hourTicket: Ticket[] = [
        {
          ...recurringTickets[0],
          salesEndRelative: {
            amount: 2,
            unit: 'hour',
            anchor: 'end',
          } as any,
        } as Ticket,
      ];

      render(<PreviewTicketsSection tickets={hourTicket} />);
      expect(screen.getByText(/2 hour before the experience ends/i)).toBeInTheDocument();
    });

    it('displays relative validity with day unit', () => {
      const dayTicket: Ticket[] = [
        {
          ...recurringTickets[0],
          salesEndRelative: {
            amount: 3,
            unit: 'day',
            anchor: 'start',
          } as any,
        } as Ticket,
      ];

      render(<PreviewTicketsSection tickets={dayTicket} />);
      expect(screen.getByText(/3 day before the experience starts/i)).toBeInTheDocument();
    });

    it('displays relative validity with week unit', () => {
      const weekTicket: Ticket[] = [
        {
          ...recurringTickets[0],
          salesEndRelative: {
            amount: 1,
            unit: 'week',
            anchor: 'start',
          } as any,
        } as Ticket,
      ];

      render(<PreviewTicketsSection tickets={weekTicket} />);
      expect(screen.getByText(/1 week before the experience starts/i)).toBeInTheDocument();
    });
  });
});
