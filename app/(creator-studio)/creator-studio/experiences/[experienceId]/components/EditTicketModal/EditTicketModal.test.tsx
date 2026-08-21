import React from 'react';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { Ticket } from '@/types/ticket';

import { EditTicketModal } from './index';

const mockUpdate = jest.fn();

jest.mock('@/app/shared/hooks/useExperiences', () => ({
  useUpdateExperienceTicket: () => ({ mutate: mockUpdate, isPending: false }),
}));
const mockToast = jest.fn();
jest.mock('@/app/shared/hooks/useToast', () => ({
  toast: (...args: unknown[]) => mockToast(...args),
}));

const ticket = (overrides: Partial<Ticket> = {}): Ticket =>
  ({
    id: 't1',
    name: 'Tainted Confession (includes all movies)',
    quantity: 68,
    availableQuantity: 20,
    price: '45',
    experience: 'e1',
    ...overrides,
  }) as Ticket;

const defaults = { experienceId: 'e1', currency: 'USD', onClose: jest.fn() };

beforeEach(() => jest.clearAllMocks());

describe('EditTicketModal', () => {
  it('renders nothing until a ticket is chosen', () => {
    const { container } = render(<EditTicketModal {...defaults} ticket={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the heading and subtitle', () => {
    render(<EditTicketModal {...defaults} ticket={ticket()} />);

    expect(screen.getByText('Edit ticket')).toBeInTheDocument();
    expect(screen.getByText('Changes apply to tickets not yet sold.')).toBeInTheDocument();
  });

  // Sold count is total created minus what remains available
  it('warns how many are already sold and locks the name', () => {
    render(<EditTicketModal {...defaults} ticket={ticket()} />);

    expect(
      screen.getByText(/48 tickets already sold\. Only the amount and quantity can be changed\./),
    ).toBeInTheDocument();
    // The name is shown as text, never as an editable input
    expect(screen.getByText('Tainted Confession (includes all movies)')).toBeInTheDocument();
    expect(screen.queryByLabelText('Ticket Name')).not.toBeInTheDocument();
  });

  it('hides the warning when nothing has sold', () => {
    render(
      <EditTicketModal {...defaults} ticket={ticket({ quantity: 20, availableQuantity: 20 })} />,
    );

    expect(screen.queryByText(/already sold/)).not.toBeInTheDocument();
  });

  it('singularises a single sold ticket', () => {
    render(
      <EditTicketModal {...defaults} ticket={ticket({ quantity: 21, availableQuantity: 20 })} />,
    );

    expect(screen.getByText(/1 ticket already sold/)).toBeInTheDocument();
  });

  it('prefills the amount and quantity', () => {
    render(<EditTicketModal {...defaults} ticket={ticket()} />);

    expect(screen.getByLabelText('Amount per ticket')).toHaveValue(45);
    expect(screen.getByLabelText('Available quantity')).toHaveValue(68);
  });

  it('submits the editable fields with the locked name unchanged', async () => {
    render(<EditTicketModal {...defaults} ticket={ticket()} />);

    fireEvent.change(screen.getByLabelText('Amount per ticket'), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText('Available quantity'), { target: { value: '70' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Ticket' }));

    await waitFor(() =>
      expect(mockUpdate).toHaveBeenCalledWith(
        {
          experience: 'e1',
          name: 'Tainted Confession (includes all movies)',
          quantity: 70,
          price: '50',
        },
        expect.anything(),
      ),
    );
  });

  // Cutting the total below what buyers already hold would orphan their tickets
  it('refuses a quantity below the number already sold', async () => {
    render(<EditTicketModal {...defaults} ticket={ticket()} />);

    fireEvent.change(screen.getByLabelText('Available quantity'), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Ticket' }));

    await waitFor(() =>
      expect(screen.getByText('Cannot be fewer than the 48 already sold')).toBeInTheDocument(),
    );
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('refuses a negative amount', async () => {
    render(<EditTicketModal {...defaults} ticket={ticket()} />);

    fireEvent.change(screen.getByLabelText('Amount per ticket'), { target: { value: '-5' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Ticket' }));

    await waitFor(() => expect(screen.getByText('Amount cannot be negative')).toBeInTheDocument());
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('confirms a successful save with a success toast, not the default one', async () => {
    mockUpdate.mockImplementation((_payload, options) => options.onSuccess());
    render(<EditTicketModal {...defaults} ticket={ticket()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Save Ticket' }));

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Ticket updated', variant: 'success' }),
      ),
    );
  });

  it('uses the destructive toast when saving fails', async () => {
    mockUpdate.mockImplementation((_payload, options) => options.onError());
    render(<EditTicketModal {...defaults} ticket={ticket()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Save Ticket' }));

    await waitFor(() =>
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Could not save', variant: 'destructive' }),
      ),
    );
  });

  it('closes on Cancel without saving', () => {
    const onClose = jest.fn();
    render(<EditTicketModal {...defaults} onClose={onClose} ticket={ticket()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
