'use client';

import { Fragment, useState } from 'react';

import {
  splitBySales,
  ticketStats,
  ticketsSold,
} from '@/app/(dashboard)/dashboard/experiences/[experienceId]/components/TicketsCreatedTab/ticket-stats';
import { useSetTicketSales } from '@/app/shared/hooks/useExperiences';
import { useToast } from '@/app/shared/hooks/useToast';
import { SuccessDialog } from '@/components/ui/successDialog';
import { Experience } from '@/types/experience';
import { Ticket, isTicketPaused } from '@/types/ticket';

import { DiscountCodesSection } from '@/app/(dashboard)/dashboard/experiences/[experienceId]/components/DiscountCodesSection';
import { SalesDeadlineSection } from '@/app/(dashboard)/dashboard/experiences/[experienceId]/components/SalesDeadlineSection';

import { EditTicketDetailsView } from './EditTicketDetailsView';
import { HostActionBar } from './HostActionBar';
import { TicketBlock } from './TicketBlock';
import { HostView } from './useHostMode';

const Divider = () => <div aria-hidden="true" className="-mx-6 h-px flex-shrink-0 bg-line-shell" />;

export const TicketsCreatedHostTab = ({
  experience,
  view,
  editingTicket,
  onEditTicket,
  onBackFromEdit,
}: {
  experience: Experience;
  view: HostView;
  editingTicket: Ticket | null;
  onEditTicket: (ticket: Ticket) => void;
  onBackFromEdit: () => void;
}) => {
  const currency = experience.currency ?? 'Ksh.';
  const tickets = experience.tickets ?? [];
  const { toast } = useToast();
  const { mutate: setSales, isPending, variables } = useSetTicketSales(experience.id);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  if (view === 'editTicket' && editingTicket) {
    return (
      <EditTicketDetailsView
        experience={experience}
        ticket={editingTicket}
        currency={currency}
        onBack={onBackFromEdit}
      />
    );
  }

  const toggleSales = (ticket: Ticket) => {
    const paused = !isTicketPaused(ticket);

    setSales(
      { ticketId: ticket.id, paused },
      {
        onSuccess: () =>
          toast({
            description: paused
              ? `Sales paused for ${ticket.name}. People who already bought keep their tickets.`
              : `Sales resumed for ${ticket.name}.`,
            variant: 'success',
          }),
        onError: (error: Error) => toast({ description: error.message, variant: 'destructive' }),
      },
    );
  };

  const { active, paused } = splitBySales(tickets);
  const buyerCount = tickets.reduce((sum, ticket) => sum + ticketsSold(ticket), 0);

  const block = (ticket: Ticket) => (
    <Fragment key={ticket.id}>
      <TicketBlock
        ticket={ticket}
        experience={experience}
        currency={currency}
        stats={ticketStats(ticket, currency)}
        isBusy={isPending && variables?.ticketId === ticket.id}
        onToggleSales={() => toggleSales(ticket)}
        onEdit={() => onEditTicket(ticket)}
      />
      <Divider />
    </Fragment>
  );

  return (
    <>
      <div className="flex flex-1 flex-col gap-7 overflow-y-auto px-6 py-5">
        {active.map(block)}

        {paused.length > 0 && (
          <>
            <h3 className="-mb-[14px] text-15 font-semibold text-ink-muted">Paused tickets</h3>
            {paused.map(block)}
          </>
        )}

        <SalesDeadlineSection experience={experience} />
        <Divider />
        <DiscountCodesSection
          experienceId={experience.id}
          currency={currency}
          onGenerated={setGeneratedCode}
        />
      </div>

      <HostActionBar buyerCount={buyerCount} />

      <SuccessDialog
        open={Boolean(generatedCode)}
        onOpenChange={(open) => !open && setGeneratedCode(null)}
        onAction={() => setGeneratedCode(null)}
        iconName="DiscountTag02Icon"
        title="Discount code generated successfully"
        description={
          <>
            Your discount code <strong className="font-bold text-gray-900">{generatedCode}</strong>{' '}
            was generated successfully. You can now share it with customers.
          </>
        }
        actionLabel="Complete"
      />
    </>
  );
};
