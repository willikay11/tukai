import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Experience } from '@/types/experience';
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
jest.mock('../DiscountCodesSection', () => ({ DiscountCodesSection: () => null }));
jest.mock('../SalesDeadlineSection', () => ({ SalesDeadlineSection: () => null }));

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
  render(
    <TicketsCreatedTab
      experience={
        {
          id: 'e1',
          slug: 'sunrise-hike',
          title: 'Sunrise hike',
          currency: 'KES',
          tickets,
        } as unknown as Experience
      }
    />,
  );

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

    expect(screen.getByRole('button', { name: 'Pause ticket sales' })).toBeInTheDocument();
    expect(screen.queryByText('Paused')).not.toBeInTheDocument();
  });

  it('offers to resume one that is paused, and says so', () => {
    renderTab([ticket({ ticketSalesPausedAt: '2026-09-30T10:00:00Z' })]);

    expect(screen.getByRole('button', { name: 'Resume ticket sales' })).toBeInTheDocument();
    expect(screen.getByText('Paused')).toBeInTheDocument();
  });

  // The API answers with either spelling depending on which serializer replied
  it('reads the snake_case spelling too', () => {
    renderTab([ticket({ ticket_sales_paused_at: '2026-09-30T10:00:00Z' } as Partial<Ticket>)]);

    expect(screen.getByRole('button', { name: 'Resume ticket sales' })).toBeInTheDocument();
  });

  it('pauses the ticket it was pressed on', async () => {
    const user = userEvent.setup();
    renderTab([ticket()]);

    await user.click(screen.getByRole('button', { name: 'Pause ticket sales' }));

    expect(setSales).toHaveBeenCalledWith({ ticketId: 't1', paused: true }, expect.anything());
  });

  it('resumes a paused one', async () => {
    const user = userEvent.setup();
    renderTab([ticket({ ticketSalesPausedAt: '2026-09-30T10:00:00Z' })]);

    await user.click(screen.getByRole('button', { name: 'Resume ticket sales' }));

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

    await user.click(screen.getByRole('button', { name: 'Pause ticket sales' }));

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

    await user.click(screen.getByRole('button', { name: 'Pause ticket sales' }));

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Sales already closed', variant: 'destructive' }),
    );
  });
});

/**
 * The canvas shows seven figures under each ticket type, in its own order and
 * wording - "Ticket currency", not "Currency", and the currency written out.
 */
describe('the per-ticket stat block', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pending = false;
  });

  it('names every figure the canvas asks for', () => {
    renderTab([ticket()]);

    [
      'Ticket currency',
      'Tickets created',
      'Amount per ticket',
      'Tickets sold',
      'Amount sold',
      'Available tickets',
      'Estimated sales expiry',
      // "Amount per ticket" reads on the stub as well as in the block
    ].forEach((label) => expect(screen.getAllByText(label).length).toBeGreaterThan(0));
  });

  it('writes the currency out in words', () => {
    renderTab([ticket()]);

    expect(screen.getByText('Kenya shillings')).toBeInTheDocument();
  });

  // Created minus available is the only honest count of what buyers hold
  it('counts what has sold from what is left', () => {
    renderTab([ticket({ quantity: 50, availableQuantity: 20 })]);

    expect(screen.getByText('Tickets sold').nextSibling).toHaveTextContent('30');
    expect(screen.getByText('Amount sold').nextSibling).toHaveTextContent('KES 45,000');
  });

  it('calls a free ticket free rather than showing a zero', () => {
    renderTab([ticket({ price: 0 })]);

    expect(screen.getAllByText('Free').length).toBeGreaterThan(0);
  });

  // A host needs to see that sales are off before reading when they would end
  it('replaces the expiry with the words when sales are paused', () => {
    renderTab([ticket({ ticketSalesPausedAt: '2026-09-30T10:00:00Z' })]);

    expect(screen.getByText('Ticket sales')).toBeInTheDocument();
    expect(screen.queryByText('Estimated sales expiry')).not.toBeInTheDocument();
  });

  it('gathers the paused types under their own heading', () => {
    renderTab([
      ticket(),
      ticket({ id: 't2', name: 'Gate', ticketSalesPausedAt: '2026-09-30T10:00:00Z' }),
    ]);

    expect(screen.getByText('Paused tickets')).toBeInTheDocument();
  });

  it('leaves the heading out when nothing is paused', () => {
    renderTab([ticket()]);

    expect(screen.queryByText('Paused tickets')).not.toBeInTheDocument();
  });

  it('does not offer to edit a paused type', () => {
    renderTab([ticket({ ticketSalesPausedAt: '2026-09-30T10:00:00Z' })]);

    expect(screen.queryByRole('button', { name: 'Edit ticket' })).not.toBeInTheDocument();
  });
});

/**
 * There is no per-ticket page and no per-ticket link on the API, so this shares
 * the experience's own page and says which type is on sale there.
 */
describe('sharing a ticket type', () => {
  const writeText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    pending = false;
    writeText.mockResolvedValue(undefined);
    // jsdom exposes `clipboard` as a getter, so it has to be redefined
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
  });

  it('copies the link to the experience', async () => {
    renderTab([ticket()]);

    await userEvent.click(screen.getByRole('button', { name: 'Share Early Bird' }));

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('/experiences/sunrise-hike'));
  });

  it('names the type that is on sale there', async () => {
    renderTab([ticket()]);

    await userEvent.click(screen.getByRole('button', { name: 'Share Early Bird' }));

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Link copied',
        description: 'Early Bird is on sale on the Sunrise hike page.',
      }),
    );
  });

  // Sharing a type nobody can buy would waste whoever received it
  it('refuses to share a paused type', async () => {
    renderTab([ticket({ ticketSalesPausedAt: '2026-09-30T10:00:00Z' })]);

    await userEvent.click(screen.getByRole('button', { name: 'Share Early Bird' }));

    expect(writeText).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Early Bird is paused',
        description: 'Resume sales before you share it.',
        variant: 'destructive',
      }),
    );
  });

  it('gives the link in the open when the clipboard is refused', async () => {
    writeText.mockRejectedValue(new Error('denied'));
    renderTab([ticket()]);

    await userEvent.click(screen.getByRole('button', { name: 'Share Early Bird' }));

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Copy this link to share it.' }),
    );
  });
});
