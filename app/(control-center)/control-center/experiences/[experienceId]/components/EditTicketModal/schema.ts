import { z } from 'zod';

import { Ticket } from '@/types/ticket';

/**
 * Editing a ticket that has already sold.
 *
 * The name is locked once anything has sold — buyers hold tickets under that
 * name — so only the amount and quantity are editable, which is what the write
 * serializer accepts anyway (name is sent back unchanged).
 */
export const editTicketSchema = (soldCount: number) =>
  z.object({
    price: z.number({ invalid_type_error: 'Enter an amount' }).min(0, 'Amount cannot be negative'),
    // The writable field is the TOTAL for this ticket type; it can never drop
    // below what has already been sold
    quantity: z
      .number({ invalid_type_error: 'Enter a quantity' })
      .int('Use a whole number')
      .min(
        soldCount,
        soldCount > 0
          ? `Cannot be fewer than the ${soldCount} already sold`
          : 'Quantity cannot be negative',
      ),
  });

export type EditTicketValues = z.infer<ReturnType<typeof editTicketSchema>>;

export const ticketQuantity = (ticket: Ticket): number => Number(ticket.quantity) || 0;

export const ticketAvailable = (ticket: Ticket): number =>
  Number(ticket.availableQuantity ?? ticket.available_quantity ?? 0) || 0;

// The API reports the total created and how many remain; the difference is what
// buyers hold
export const ticketsSoldFor = (ticket: Ticket): number =>
  Math.max(ticketQuantity(ticket) - ticketAvailable(ticket), 0);
