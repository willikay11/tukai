'use client';

import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { useSetTicketSales } from '@/app/shared/hooks/useExperiences';
import { useToast } from '@/app/shared/hooks/useToast';
import { NoData } from '@/components/ui/noData';
import { cn } from '@/lib/utils';
import { Experience } from '@/types/experience';
import { Ticket, isTicketPaused } from '@/types/ticket';

import { DiscountCodesSection } from '../DiscountCodesSection';
import { EditTicketModal } from '../EditTicketModal';
import { SalesDeadlineSection } from '../SalesDeadlineSection';
import { TicketStat, splitBySales, ticketPrice, ticketStats } from './ticket-stats';

interface TicketsCreatedTabProps {
  experience: Experience;
}

/**
 * One tile in the canvas's stat block: a three-column grid of light tiles,
 * label above value, the last one spanning the row.
 */
const StatTile = ({ stat, muted }: { stat: TicketStat; muted: boolean }) => (
  <div
    className={cn('flex min-w-0 flex-col gap-1 bg-surface px-4 py-3', stat.full && 'col-span-3')}
  >
    <span className="text-13 leading-snug text-ink-muted">{stat.label}</span>
    <span
      className={cn(
        'break-words text-base font-semibold leading-snug',
        muted ? 'text-ink-muted' : 'text-gray-900',
      )}
    >
      {stat.value}
    </span>
  </div>
);

const RowAction = ({
  icon,
  label,
  tone = 'brand',
  onClick,
  disabled,
}: {
  icon: string;
  label: string;
  tone?: 'brand' | 'danger';
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'inline-flex h-11 flex-shrink-0 items-center gap-2 rounded-full px-2.5 text-15 font-medium transition-colors disabled:opacity-50',
      tone === 'danger'
        ? 'text-danger hover:bg-danger-surface'
        : 'text-brand hover:bg-surface-brand',
    )}
  >
    <IconComponent iconName={icon} size={20} color="currentColor" />
    {label}
  </button>
);

const Dot = () => (
  <span aria-hidden="true" className="h-[5px] w-[5px] flex-shrink-0 rounded-full bg-blue-400" />
);

const TicketCard = ({
  ticket,
  currency,
  isBusy,
  onToggleSales,
  onEdit,
}: {
  ticket: Ticket;
  currency: string;
  isBusy: boolean;
  onToggleSales: () => void;
  onEdit: () => void;
}) => {
  const paused = isTicketPaused(ticket);
  const price = ticketPrice(ticket);

  // Reads across the stub, as the canvas has it
  const stub = [
    { value: ticket.name, label: 'Ticket name', truncate: true },
    {
      value: price ? `${currency} ${price.toLocaleString()}` : 'Free',
      label: 'Amount per ticket',
    },
    { value: String(Number(ticket.quantity) || 0), label: 'Quantity' },
  ];

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-start gap-3">
        <IconComponent
          iconName="Ticket01Icon"
          size={24}
          color="currentColor"
          className={cn('mt-0.5 flex-shrink-0', paused ? 'text-ink-subtle' : 'text-brand')}
        />
        <h3
          className={cn(
            'min-w-0 text-xl font-bold leading-snug tracking-tight',
            paused ? 'text-ink-muted' : 'text-gray-900',
          )}
        >
          {ticket.name}
        </h3>
      </div>

      <div
        className={cn(
          'grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,0.7fr)] gap-x-3.5 gap-y-1.5 rounded-14 border-[1.5px] border-dashed px-4 py-2.5',
          paused
            ? 'border-line bg-surface'
            : 'border-blue-200 bg-gradient-to-b from-blue-50 to-blue-100',
        )}
      >
        {stub.map((cell) => (
          <div key={cell.label} className="flex min-w-0 flex-col gap-0.5">
            <span
              className={cn(
                'text-base font-bold',
                cell.truncate && 'truncate',
                paused ? 'text-ink-muted' : 'text-gray-900',
              )}
            >
              {cell.value}
            </span>
            <span className="text-13 text-ink-muted">{cell.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-0.5 overflow-hidden rounded-14">
        {ticketStats(ticket, currency).map((stat) => (
          <StatTile key={stat.label} stat={stat} muted={paused} />
        ))}
      </div>

      <div className="-mt-1 flex flex-wrap items-center justify-end gap-x-1.5 gap-y-1">
        {paused ? (
          <RowAction
            icon="PlayIcon"
            label="Resume ticket sales"
            onClick={onToggleSales}
            disabled={isBusy}
          />
        ) : (
          <>
            <RowAction
              icon="StopCircleIcon"
              label="Pause ticket sales"
              tone="danger"
              onClick={onToggleSales}
              disabled={isBusy}
            />
            <Dot />
            <RowAction icon="PencilEdit02Icon" label="Edit ticket" onClick={onEdit} />
          </>
        )}
      </div>
    </div>
  );
};

export const TicketsCreatedTab = ({ experience }: TicketsCreatedTabProps) => {
  const experienceId = experience.id;
  const tickets = experience.tickets ?? [];
  const currency = experience.currency ?? 'Ksh.';
  const [editing, setEditing] = useState<Ticket | null>(null);
  const { toast } = useToast();
  const { mutate: setSales, isPending, variables } = useSetTicketSales(experienceId);

  const toggleSales = (ticket: Ticket) => {
    const paused = !isTicketPaused(ticket);

    setSales(
      { ticketId: ticket.id, paused },
      {
        onSuccess: () =>
          toast({
            title: paused ? 'Sales paused' : 'Sales resumed',
            // The canvas says this outright, and it is the first thing a host
            // worries about before pressing pause
            description: paused
              ? `No new purchases of ${ticket.name}. People who already bought keep their tickets.`
              : `${ticket.name} is on sale again.`,
            variant: 'success',
          }),
        onError: (error: Error) =>
          toast({
            title: paused ? 'Could not pause sales' : 'Could not resume sales',
            description: error.message,
            variant: 'destructive',
          }),
      },
    );
  };

  const { active, paused } = splitBySales(tickets);

  const card = (ticket: Ticket) => (
    <div key={ticket.id} className="border-b border-gray-200 pb-6">
      <TicketCard
        ticket={ticket}
        currency={currency}
        isBusy={isPending && variables?.ticketId === ticket.id}
        onToggleSales={() => toggleSales(ticket)}
        onEdit={() => setEditing(ticket)}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {tickets.length === 0 && (
        <div className="py-10">
          <NoData message="No tickets created for this experience yet" />
        </div>
      )}

      {active.map(card)}

      {/* The canvas gathers the paused types under their own heading rather than
          mixing them in with what is still on sale */}
      {paused.length > 0 && (
        <>
          <h3 className="text-15 font-semibold text-ink-muted">Paused tickets</h3>
          {paused.map(card)}
        </>
      )}

      {/* The canvas's order on this tab: the tickets, then when sales close,
          then the codes that discount them */}
      <SalesDeadlineSection experience={experience} />

      <DiscountCodesSection experienceId={experienceId} currency={currency} />

      <EditTicketModal
        experienceId={experienceId}
        ticket={editing}
        currency={currency}
        onClose={() => setEditing(null)}
      />
    </div>
  );
};
