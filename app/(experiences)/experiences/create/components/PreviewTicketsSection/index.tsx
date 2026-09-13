'use client';

import moment from 'moment';

import { IconComponent } from '@/app/shared/components/Icons';
import { Ticket } from '@/types/ticket';
import { getTicketBuyerAmount } from '@/utils/ticket-utils';

import { SavedTicketCard } from '../TicketCard';

interface PreviewTicketsSectionProps {
  tickets?: Ticket[];
  coverPhoto?: string;
  commissionPayer?: 'host' | 'customer' | 'split';
  onEdit?: () => void;
}

const currencyFormatter = new Intl.NumberFormat('en-KE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatKsh(value: number) {
  return `Ksh ${currencyFormatter.format(Number.isFinite(value) ? value : 0)}`;
}

function getCommissionPercentage(commissionPayer?: 'host' | 'customer' | 'split'): number {
  if (!commissionPayer) return 0;
  return commissionPayer === 'host' ? 0 : commissionPayer === 'customer' ? 4 : 2;
}

export const PreviewTicketsSection = ({
  tickets,
  coverPhoto,
  commissionPayer,
  onEdit,
}: PreviewTicketsSectionProps) => {
  const hasTickets = tickets && tickets.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <h3 className="text-xs font-semibold text-gray-900">Tickets</h3>
        {onEdit && (
          <button onClick={onEdit} className="text-gray-400 hover:text-gray-600">
            <IconComponent iconName="Edit02Icon" size={16} className="text-gray-800" />
          </button>
        )}
      </div>

      {hasTickets ? (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            // Handle both camelCase and snake_case field names from API
            const salesStartDateStr = ticket.salesStartDate || (ticket as any).sales_start_date;
            const salesEndDateStr = ticket.salesEndDate || (ticket as any).sales_end_date;

            let validity = 'Not set';

            if (salesStartDateStr && salesEndDateStr) {
              validity = `${moment(salesStartDateStr).format('MMM D, YYYY,')} ${moment(salesStartDateStr).format('h:mm A')} – ${moment(salesEndDateStr).format('MMM D, YYYY,')} ${moment(salesEndDateStr).format('h:mm A')}`;
            } else if (ticket.salesEndRelative) {
              const { amount, unit, anchor } = ticket.salesEndRelative;
              validity = `${amount} ${unit} before the experience ${anchor === 'start' ? 'starts' : 'ends'}`;
            } else if (ticket.salesStartRelative) {
              const { amount, unit, anchor } = ticket.salesStartRelative;
              validity = `${amount} ${unit} ${anchor === 'start' ? 'before' : 'after'} experience`;
            }

            // Handle both 'amount' (from form) and 'price' (from API)
            const price = (ticket as any).amount || (ticket as any).price;

            return (
              <SavedTicketCard
                key={ticket.id}
                name={ticket.name}
                quantity={ticket.quantity}
                amount={Number(price)}
                buyerPrice={getTicketBuyerAmount(ticket)}
                validity={validity}
                coverPhoto={coverPhoto}
                commissionPayer={commissionPayer}
              />
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-gray-500">Not set yet</p>
      )}
    </div>
  );
};
