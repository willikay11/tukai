'use client';

import { IconComponent } from '@/app/shared/components/Icons';

interface TicketCardProps {
  ticket: {
    id: string;
    name: string;
    imageUrl?: string;
    quantity: number;
    amount: number;
    salesStartDate: string;
    salesStartTime: string;
    salesEndDate: string;
    salesEndTime: string;
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TicketCard = ({ ticket, onEdit, onDelete }: TicketCardProps) => {
  const validity = `${ticket.salesStartDate} ${ticket.salesStartTime} – ${ticket.salesEndDate}...`;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
      {ticket.imageUrl ? (
        <img
          src={ticket.imageUrl}
          alt={ticket.name}
          className="h-10 w-10 rounded-md object-cover"
        />
      ) : (
        <div className="h-10 w-10 rounded-md bg-gray-200" />
      )}

      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-900">{ticket.name}</p>
        <p className="line-clamp-1 text-xs text-gray-500">
          Qty: {ticket.quantity} · Price: Ksh {ticket.amount} · Validity: {validity}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(ticket.id)}
          className="text-gray-400 hover:text-gray-600"
          title="Edit ticket"
        >
          <IconComponent iconName="PencilEdit02Icon" size={18} />
        </button>
        <button
          onClick={() => onDelete(ticket.id)}
          className="text-gray-400 hover:text-red-600"
          title="Delete ticket"
        >
          <IconComponent iconName="Delete02Icon" size={18} />
        </button>
      </div>
    </div>
  );
};
