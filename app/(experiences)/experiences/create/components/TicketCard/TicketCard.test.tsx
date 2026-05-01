import { render, screen } from '@testing-library/react';
import { TicketCard } from './TicketCard';

jest.mock('@/app/shared/components/Icons', () => ({
  IconComponent: ({ iconName }: any) => <span>{iconName}</span>,
}));

describe('TicketCard', () => {
  const mockTicket = {
    id: '1',
    name: 'VIP Ticket',
    imageUrl: 'https://example.com/ticket.jpg',
    quantity: 50,
    amount: 5000,
    salesStartDate: 'Feb 23',
    salesStartTime: '10:00 AM',
    salesEndDate: 'Feb 23',
    salesEndTime: '1:00 PM',
  };

  it('renders ticket name', () => {
    render(<TicketCard ticket={mockTicket} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('VIP Ticket')).toBeInTheDocument();
  });

  it('displays ticket metadata', () => {
    render(<TicketCard ticket={mockTicket} onEdit={() => {}} onDelete={() => {}} />);
    expect(screen.getByText(/Qty: 50/)).toBeInTheDocument();
    expect(screen.getByText(/Price: Ksh 5000/)).toBeInTheDocument();
  });

  it('renders edit and delete buttons', () => {
    const onEdit = jest.fn();
    const onDelete = jest.fn();
    render(<TicketCard ticket={mockTicket} onEdit={onEdit} onDelete={onDelete} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(2);
  });

  it('calls onEdit when edit button clicked', () => {
    const onEdit = jest.fn();
    render(<TicketCard ticket={mockTicket} onEdit={onEdit} onDelete={() => {}} />);
    const editButton = screen.getByTitle('Edit ticket');
    editButton.click();
    expect(onEdit).toHaveBeenCalledWith('1');
  });

  it('calls onDelete when delete button clicked', () => {
    const onDelete = jest.fn();
    render(<TicketCard ticket={mockTicket} onEdit={() => {}} onDelete={onDelete} />);
    const deleteButton = screen.getByTitle('Delete ticket');
    deleteButton.click();
    expect(onDelete).toHaveBeenCalledWith('1');
  });
});
