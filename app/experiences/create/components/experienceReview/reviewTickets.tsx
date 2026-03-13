'use client';

import { Ticket } from '@/types/ticket';

import SavedTicketCard from '../savedTicketCard';

export interface ReviewTicketsProps {
  tickets?: Ticket[];
  coverPhoto?: string;
}

export default function ReviewTickets({ tickets, coverPhoto }: ReviewTicketsProps) {
  if (!tickets || tickets.length === 0) {
    return null;
  }

  const getTicketValidity = (ticket: Ticket): string => {
    const ticketWithValidity = ticket as Ticket & { validity?: string | null };
    return ticketWithValidity.validity?.trim() ? ticketWithValidity.validity : '-';
  };

  return (
    <div className="mt-6">
      <h3 className="text-base font-semibold text-gray-700">Tickets</h3>
      <div className="mt-2 space-y-3">
        {tickets.map((ticket) => (
          <SavedTicketCard
            key={ticket.id}
            name={ticket.name}
            quantity={ticket.quantity}
            amount={ticket.price}
            validity={getTicketValidity(ticket)}
            coverPhoto={coverPhoto}
          />
        ))}
      </div>
    </div>
  );
}
