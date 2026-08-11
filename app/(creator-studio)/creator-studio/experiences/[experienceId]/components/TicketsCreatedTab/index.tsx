'use client';

import { useRouter } from 'next/navigation';

import moment from 'moment';

import { IconComponent } from '@/app/shared/components/Icons';
import { NoData } from '@/components/ui/noData';
import { Ticket } from '@/types/ticket';

interface TicketsCreatedTabProps {
  experienceId: string;
  tickets: Ticket[];
  currency: string;
}

const MetricCell = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-gray-400">{label}</p>
    <p className="mt-0.5 text-sm font-semibold text-gray-900">{value}</p>
  </div>
);

export const TicketsCreatedTab = ({ experienceId, tickets, currency }: TicketsCreatedTabProps) => {
  const router = useRouter();

  if (tickets.length === 0) {
    return (
      <div className="py-10">
        <NoData message="No tickets created for this experience yet" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => {
        const created = ticket.quantity ?? 0;
        const available = ticket.availableQuantity ?? 0;
        // No per-ticket sold count exists on the API; the difference between
        // the created and available counts is the closest honest signal
        const sold = Math.max(created - available, 0);
        const price = parseFloat(String(ticket.price)) || 0;
        // Gross of any fees or refunds — there is no revenue endpoint to net it
        const amountSold = sold * price;

        const expiry = ticket.salesEndDate ? moment(ticket.salesEndDate).format('D MMM YYYY') : '—';

        return (
          <div
            key={ticket.id}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-base font-bold text-gray-900">{ticket.name}</p>
              <IconComponent
                iconName="Share08Icon"
                size={16}
                color="currentColor"
                className="text-gray-400"
              />
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
              <IconComponent
                iconName="Ticket01Icon"
                size={20}
                color="currentColor"
                className="flex-shrink-0 text-primary"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{ticket.name}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {currency} {price.toLocaleString()} Per Ticket · {created} Quantity
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <MetricCell label="Tickets Created" value={String(created)} />
              <MetricCell label="Tickets Sold" value={String(sold)} />
              <MetricCell label="Available" value={String(available)} />
              <MetricCell
                label="Amount Sold"
                value={`${currency} ${amountSold.toLocaleString()}`}
              />
              {/* Tickets carry no currency of their own — the experience's applies */}
              <MetricCell label="Currency" value={currency} />
              <MetricCell label="Estimated Date of Expiry" value={expiry} />
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-4 border-t border-gray-100 pt-4">
              <button
                type="button"
                disabled
                title="Pausing ticket sales is not available yet"
                className="inline-flex items-center gap-2 rounded-full px-2 py-2 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <IconComponent iconName="PauseIcon" size={16} color="currentColor" />
                Pause Ticket Sales
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(`/experiences/create?experienceId=${experienceId}&step=dates-tickets`)
                }
                className="inline-flex items-center gap-2 rounded-full px-2 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50"
              >
                <IconComponent iconName="Edit02Icon" size={16} color="currentColor" />
                Edit Ticket
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
