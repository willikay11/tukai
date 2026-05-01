import { render, screen } from '@testing-library/react';
import { TicketCard } from './TicketCard';

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
