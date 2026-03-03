'use client';

import { Ticket } from '@/types/ticket';

const currencyFormatter = new Intl.NumberFormat('en-KE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatKsh(value: number) {
  return `Ksh ${currencyFormatter.format(Number.isFinite(value) ? value : 0)}`;
}

export interface ReviewTicketsProps {
  tickets?: Ticket[];
  coverPhoto?: string;
}

export default function ReviewTickets({ tickets, coverPhoto }: ReviewTicketsProps) {
  if (!tickets || tickets.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-gray-900">Tickets</h3>
      <div className="mt-2 space-y-3">
        {tickets.map((ticket) => (
          <ReviewTicketCard key={ticket.id} ticket={ticket} coverPhoto={coverPhoto} />
        ))}
      </div>
    </div>
  );
}

function ReviewTicketCard({
  ticket,
  coverPhoto,
}: {
  ticket: Ticket;
  coverPhoto?: string;
}) {
  return (
    <div className="relative rounded-[12px] border border-dashed border-primary bg-emerald-50 p-2">
      {/* Top notch */}
      <div className="absolute -top-[1px] left-[102px] h-1.5 w-3 -translate-x-1/2 rounded-b-full border border-t-0 border-dashed border-primary bg-white" />
      {/* Bottom notch */}
      <div className="absolute -bottom-[1px] left-[102px] h-1.5 w-3 -translate-x-1/2 rounded-t-full border border-b-0 border-dashed border-primary bg-white" />

      <div className="flex items-center gap-3">
        {coverPhoto && (
          <img
            src={coverPhoto}
            alt={ticket.name}
            className="h-20 w-20 flex-shrink-0 rounded-[12px] object-cover"
          />
        )}

        <div className="h-16 border-l border-dashed border-primary" />

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-gray-800">{ticket.name}</p>

          <div className="mt-3 grid grid-cols-6 gap-2">
            <div className="col-span-1">
              <p className="text-xs text-gray-500">Qty</p>
              <p className="text-xs font-semibold text-gray-800">{ticket.quantity}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-500">PRICE</p>
              <p className="text-xs font-semibold text-gray-800">{formatKsh(ticket.price)}</p>
            </div>
            <div className="col-span-3">
              <p className="text-xs text-gray-500">Available</p>
              <p className="truncate text-xs font-semibold text-gray-800">{ticket.availableQuantity}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
