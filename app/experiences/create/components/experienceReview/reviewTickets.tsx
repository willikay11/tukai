'use client';

import IconComponent from '@/app/components/iconComponent';
import { Ticket } from '@/types/ticket';

import SavedTicketCard from '../savedTicketCard';

export interface ReviewTicketsProps {
  tickets?: Ticket[];
  coverPhoto?: string;
  editable?: boolean;
  onEdit?: () => void;
}

export default function ReviewTickets({ tickets, coverPhoto, editable = false, onEdit }: ReviewTicketsProps) {
  if (!tickets || tickets.length === 0) {
    return null;
  }

  const getTicketValidity = (ticket: Ticket): string => {
    const ticketWithValidity = ticket as Ticket & { validity?: string | null };
    return ticketWithValidity.validity?.trim() ? ticketWithValidity.validity : '-';
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-700">Tickets</h3>
        <button
          type="button"
          onClick={onEdit}
          disabled={editable === false}
          className="text-gray-400 transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Edit Tickets"
        >
          <IconComponent iconName="Edit02Icon" size={16} className='text-primary' />
        </button>
      </div>
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
