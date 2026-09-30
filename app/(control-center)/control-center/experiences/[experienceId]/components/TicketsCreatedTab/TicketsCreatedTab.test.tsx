import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Ticket } from '@/types/ticket';

import { TicketsCreatedTab } from './index';

const setSales = jest.fn();
let pending = false;
jest.mock('@/app/shared/hooks/useExperiences', () => ({
  useSetTicketSales: () => ({ mutate: setSales, isPending: pending, variables: undefined }),
}));

const toast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({ useToast: () => ({ toast }) }));

jest.mock('../EditTicketModal', () => ({ EditTicketModal: () => null }));

const ticket = (overrides: Partial<Ticket> = {}): Ticket =>
  ({
    id: 't1',
    name: 'Early Bird',
    quantity: 50,
    availableQuantity: 20,
    price: 1500,
    experience: 'e1',
    ...overrides,
  }) as unknown as Ticket;

const renderTab = (tickets: Ticket[]) =>
  render(<TicketsCreatedTab experienceId="e1" tickets={tickets} currency="KES" />);

/**
 * A host could not stop selling a ticket type at all. Both endpoints existed
 * and neither was called from anywhere in the app.
 */
describe('pausing ticket sales', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pending = false;
  });

  it('offers to pause a type that is on sale', () => {
    renderTab([ticket()]);

    expect(screen.getByRole('button', { name: 'Pause sales' })).toBeInTheDocument();
    expect(screen.queryByText('Paused')).not.toBeInTheDocument();
  });

  it('offers to resume one that is paused, and says so', () => {
    renderTab([ticket({ ticketSalesPausedAt: '2026-09-30T10:00:00Z' })]);

    expect(screen.getByRole('button', { name: 'Resume sales' })).toBeInTheDocument();
    expect(screen.getByText('Paused')).toBeInTheDocument();
  });

  // The API answers with either spelling depending on which serializer replied
  it('reads the snake_case spelling too', () => {
    renderTab([ticket({ ticket_sales_paused_at: '2026-09-30T10:00:00Z' } as Partial<Ticket>)]);

    expect(screen.getByRole('button', { name: 'Resume sales' })).toBeInTheDocument();
  });

  it('pauses the ticket it was pressed on', async () => {
    const user = userEvent.setup();
    renderTab([ticket()]);

    await user.click(screen.getByRole('button', { name: 'Pause sales' }));

    expect(setSales).toHaveBeenCalledWith({ ticketId: 't1', paused: true }, expect.anything());
  });

  it('resumes a paused one', async () => {
    const user = userEvent.setup();
    renderTab([ticket({ ticketSalesPausedAt: '2026-09-30T10:00:00Z' })]);

    await user.click(screen.getByRole('button', { name: 'Resume sales' }));

    expect(setSales).toHaveBeenCalledWith({ ticketId: 't1', paused: false }, expect.anything());
  });

  /**
   * The first thing a host worries about before pressing pause is whether it
   * cancels what people already bought. It does not, and the message says so.
   */
  it('promises that existing buyers keep their tickets', async () => {
    const user = userEvent.setup();
    setSales.mockImplementation((_vars, { onSuccess }) => onSuccess());
    renderTab([ticket()]);

    await user.click(screen.getByRole('button', { name: 'Pause sales' }));

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        description: expect.stringContaining('keep their tickets'),
      }),
    );
  });

  it('reports a refusal rather than looking like it worked', async () => {
    const user = userEvent.setup();
    setSales.mockImplementation((_vars, { onError }) => onError(new Error('Sales already closed')));
    renderTab([ticket()]);

    await user.click(screen.getByRole('button', { name: 'Pause sales' }));

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Sales already closed', variant: 'destructive' }),
    );
  });
});
