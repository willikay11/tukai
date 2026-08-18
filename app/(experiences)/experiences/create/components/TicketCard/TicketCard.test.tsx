import { render, screen } from '@testing-library/react';

import { TicketCard } from './index';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: any) => <span>{iconName}</span>,
}));

describe('TicketCard', () => {
  const mockProps = {
    name: 'VIP Ticket',
    quantity: 50,
    amount: 5000,
    validity: 'Feb 23, 10:00 AM - 1:00 PM',
    coverPhoto: 'https://example.com/ticket.jpg',
  };

  it('renders ticket name', () => {
    render(<TicketCard {...mockProps} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('VIP Ticket')).toBeInTheDocument();
  });

  it('displays ticket metadata', () => {
    render(<TicketCard {...mockProps} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText(/Ksh 5,000/)).toBeInTheDocument();
  });

  describe('price', () => {
    it('shows the buyer price rather than the host base amount', () => {
      render(<TicketCard {...mockProps} buyerPrice={5100} />);

      expect(screen.getByText(/Ksh 5,100/)).toBeInTheDocument();
      expect(screen.queryByText(/Ksh 5,000/)).not.toBeInTheDocument();
    });

    it('falls back to the entered amount before the ticket is saved', () => {
      render(<TicketCard {...mockProps} commissionPayer="customer" />);

      expect(screen.getByText(/Ksh 5,000/)).toBeInTheDocument();
      // With no buyer price yet, the estimated customer figure still shows
      expect(screen.getByText('Customer Pays')).toBeInTheDocument();
      expect(screen.getByText(/Ksh 5,200/)).toBeInTheDocument();
    });

    it('drops the estimated customer figure once the API price is known', () => {
      render(<TicketCard {...mockProps} commissionPayer="customer" buyerPrice={5100} />);

      expect(screen.getByText(/Ksh 5,100/)).toBeInTheDocument();
      expect(screen.queryByText('Customer Pays')).not.toBeInTheDocument();
    });

    it('shows a zero buyer price rather than treating it as missing', () => {
      render(<TicketCard {...mockProps} buyerPrice={0} />);

      expect(screen.getByText(/Ksh 0.00/)).toBeInTheDocument();
      expect(screen.queryByText(/Ksh 5,000/)).not.toBeInTheDocument();
    });
  });

  it('renders edit and delete buttons', () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    render(<TicketCard {...mockProps} onEdit={onEdit} onDelete={onDelete} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(2);
  });

  it('calls onEdit when edit button clicked', () => {
    const onEdit = jest.fn();
    render(<TicketCard {...mockProps} onEdit={onEdit} onDelete={() => {}} />);
    const editButtons = screen.getAllByRole('button');
    editButtons[0].click();
    expect(onEdit).toHaveBeenCalled();
  });

  it('calls onDelete when delete button clicked', () => {
    const onDelete = jest.fn();
    render(<TicketCard {...mockProps} onEdit={() => {}} onDelete={onDelete} />);
    const deleteButtons = screen.getAllByRole('button');
    deleteButtons[1].click();
    expect(onDelete).toHaveBeenCalled();
  });
});
