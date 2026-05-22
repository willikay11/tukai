'use client';

import moment from 'moment';

import { IconComponent } from '@/app/shared/components/Icons';

import { SavedTicketCard } from '../TicketCard';

interface PreviewTicketsSectionProps {
  tickets?: Array<{
    id: string;
    name: string;
    quantity: number;
    amount: number;
    salesStartDate: string | null;
    salesStartTime: string | null;
    salesEndDate: string | null;
    salesEndTime: string | null;
    acceptPartialPayment?: boolean;
    salesStartRelative?: {
      amount: number;
      unit: 'hour' | 'day' | 'week';
      anchor: 'start' | 'end';
    } | null;
    salesEndRelative?: {
      amount: number;
      unit: 'hour' | 'day' | 'week';
      anchor: 'start' | 'end';
    } | null;
    duplicateForEntirePeriod?: boolean;
  }>;
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
            <IconComponent iconName="Edit02Icon" size={16} />
          </button>
        )}
      </div>

      {hasTickets ? (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const validity =
              ticket.salesStartDate &&
              ticket.salesStartTime &&
              ticket.salesEndDate &&
              ticket.salesEndTime
                ? `${moment(ticket.salesStartDate).format('MMM D, YYYY,')} ${moment(ticket.salesStartTime, 'HH:mm').format('h:mm A')} – ${moment(ticket.salesEndDate).format('MMM D, YYYY,')} ${moment(ticket.salesEndTime, 'HH:mm').format('h:mm A')}`
                : ticket.salesStartRelative && ticket.salesEndRelative
                  ? `${ticket.salesStartRelative.amount} ${ticket.salesStartRelative.unit} ${ticket.salesStartRelative.anchor === 'start' ? 'before' : 'after'} – ${ticket.salesEndRelative.amount} ${ticket.salesEndRelative.unit} ${ticket.salesEndRelative.anchor === 'start' ? 'before' : 'after'}`
                  : 'Not set';

            return (
              <SavedTicketCard
                key={ticket.id}
                name={ticket.name}
                quantity={ticket.quantity}
                amount={ticket.amount}
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
