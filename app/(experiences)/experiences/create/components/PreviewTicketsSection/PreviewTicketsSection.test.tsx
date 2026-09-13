import { render, screen } from '@testing-library/react';

import type { Ticket } from '@/types/ticket';

import { PreviewTicketsSection } from './index';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: any) => <span>{iconName}</span>,
}));

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

    it('renders multiple tickets', () => {
      const { container } = render(<PreviewTicketsSection tickets={mockTickets} />);
      expect(container.textContent).toContain('General Admission');
      expect(container.textContent).toContain('VIP Pass');
    });

    it('renders ticket section with cover photo', () => {
      const coverPhoto = 'https://example.com/cover.jpg';
      const { container } = render(
        <PreviewTicketsSection tickets={mockTickets} coverPhoto={coverPhoto} />,
      );
      expect(container).toBeInTheDocument();
    });
  });

  // TicketCard has its Validity line commented out for now, so none of the
  // computed strings reach the DOM. Restore these cases — and the ones under
  // "Relative Validity Units" below — when that line comes back.
  describe('Validity Display', () => {
    it('does not render the validity line', () => {
      const { container } = render(<PreviewTicketsSection tickets={mockTickets} />);
      expect(container.textContent).not.toContain('Validity');
    });

    // it('displays absolute date validity for single-day tickets', () => {
    //   const { container } = render(<PreviewTicketsSection tickets={mockTickets} />);
    //   const text = container.textContent;
    //   expect(text).toContain('Jun');
    //   expect(text).toContain('2026');
    // });
    //
    // it('displays relative validity for recurring tickets', () => {
    //   const { container } = render(<PreviewTicketsSection tickets={recurringTickets} />);
    //   const text = container.textContent;
    //   expect(text).toContain('hour');
    //   expect(text).toContain('experience');
    // });
    //
    // it('displays "Not set" for tickets without validity', () => {
    //   const ticketNoValidity: Ticket[] = [
    //     {
    //       id: 'ticket-3',
    //       name: 'Test Ticket',
    //       quantity: 10,
    //       price: 100,
    //       experience: 'exp-789',
    //       availableQuantity: 10,
    //       salesStartDate: null,
    //       salesEndDate: null,
    //       is_sales_window_active: true,
    //     } as Ticket,
    //   ];
    //
    //   const { container } = render(<PreviewTicketsSection tickets={ticketNoValidity} />);
    //   expect(container.textContent).toContain('Not set');
    // });
  });

  describe('Commission Handling', () => {
    it('displays host commission without additional cost', () => {
      render(<PreviewTicketsSection tickets={mockTickets} commissionPayer="host" />);
      // Should only show base price, not customer pay
      expect(screen.queryByText(/Customer Pays/i)).not.toBeInTheDocument();
    });

    it('displays customer commission with total cost', () => {
      render(<PreviewTicketsSection tickets={mockTickets} commissionPayer="customer" />);
      // Should show customer pays with 4% commission
      expect(screen.getAllByText(/Customer Pays/i)).toBeDefined();
    });

    it('displays split commission correctly', () => {
      render(<PreviewTicketsSection tickets={mockTickets} commissionPayer="split" />);
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

      const { container } = render(<PreviewTicketsSection tickets={ticketWithStringPrice} />);
      expect(container.textContent).toContain('500');
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
      const mixedTickets: Ticket[] = [mockTickets[0], recurringTickets[0]];

      const { container } = render(<PreviewTicketsSection tickets={mixedTickets} />);
      const text = container.textContent;
      expect(text).toContain('General Admission');
      expect(text).toContain('Class Ticket');
    });
  });

  // Restore with the Validity line in TicketCard — see the note above.
  //
  // describe('Relative Validity Units', () => {
  //   it('displays relative validity with hour unit', () => {
  //     const hourTicket: Ticket[] = [
  //       {
  //         ...recurringTickets[0],
  //         salesEndRelative: {
  //           amount: 2,
  //           unit: 'hour',
  //           anchor: 'end',
  //         } as any,
  //       } as Ticket,
  //     ];
  //
  //     const { container } = render(<PreviewTicketsSection tickets={hourTicket} />);
  //     expect(container.textContent).toContain('hour');
  //   });
  //
  //   it('displays relative validity with day unit', () => {
  //     const dayTicket: Ticket[] = [
  //       {
  //         ...recurringTickets[0],
  //         salesEndRelative: {
  //           amount: 3,
  //           unit: 'day',
  //           anchor: 'start',
  //         } as any,
  //       } as Ticket,
  //     ];
  //
  //     const { container } = render(<PreviewTicketsSection tickets={dayTicket} />);
  //     expect(container.textContent).toContain('day');
  //   });
  //
  //   it('displays relative validity with week unit', () => {
  //     const weekTicket: Ticket[] = [
  //       {
  //         ...recurringTickets[0],
  //         salesEndRelative: {
  //           amount: 1,
  //           unit: 'week',
  //           anchor: 'start',
  //         } as any,
  //       } as Ticket,
  //     ];
  //
  //     const { container } = render(<PreviewTicketsSection tickets={weekTicket} />);
  //     expect(container.textContent).toContain('week');
  //   });
  // });
});
