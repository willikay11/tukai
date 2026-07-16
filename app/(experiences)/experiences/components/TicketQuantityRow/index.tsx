import { Quantity } from '@/components/ui/quantity';
import { Ticket } from '@/types/ticket';

interface TicketQuantityRowProps {
  ticket: Ticket;
  quantity: number;
  onChange: (qty: number) => void;
}

export const TicketQuantityRow = ({ ticket, quantity, onChange }: TicketQuantityRowProps) => {
  const maxQty =
    typeof ticket.availableQuantity === 'number'
      ? ticket.availableQuantity
      : typeof ticket.available_quantity === 'number'
        ? ticket.available_quantity
        : ticket.quantity;

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
      <div>
        <p className="text-sm font-semibold">
          ${typeof ticket.price === 'string' ? ticket.price : ticket.price.toFixed(2)}/person
        </p>
        <p className="text-xs text-gray-500">{ticket.name}</p>
      </div>
      <Quantity value={quantity} onChange={onChange} min={0} max={maxQty} />
    </div>
  );
};
