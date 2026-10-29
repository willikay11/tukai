'use client';

import {
  TicketStat,
  ticketPrice,
  ticketShareLink,
  ticketShareMessage,
} from '@/app/(dashboard)/dashboard/experiences/[experienceId]/components/TicketsCreatedTab/ticket-stats';
import { IconComponent } from '@/app/shared/components/Icons';
import { useToast } from '@/app/shared/hooks/useToast';
import { cn } from '@/lib/utils';
import { Experience } from '@/types/experience';
import { Ticket, isTicketPaused } from '@/types/ticket';

import { useQrDataUrl } from './useQrDataUrl';

const StatCell = ({ stat, muted }: { stat: TicketStat; muted: boolean }) => (
  <div className={cn('flex min-w-0 flex-col gap-1 bg-surface px-4 py-3', stat.full && 'col-span-3')}>
    <span className="text-[13.5px] leading-snug text-ink-muted">{stat.label}</span>
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
      tone === 'danger' ? 'text-danger hover:bg-danger-surface' : 'text-brand hover:bg-surface-brand',
    )}
  >
    <IconComponent iconName={icon} size={20} color="currentColor" />
    {label}
  </button>
);

const Dot = () => (
  <span aria-hidden="true" className="h-[5px] w-[5px] flex-shrink-0 rounded-full bg-distance" />
);

export const TicketBlock = ({
  ticket,
  experience,
  currency,
  stats,
  isBusy,
  onToggleSales,
  onEdit,
}: {
  ticket: Ticket;
  experience: Experience;
  currency: string;
  stats: TicketStat[];
  isBusy: boolean;
  onToggleSales: () => void;
  onEdit: () => void;
}) => {
  const { toast } = useToast();
  const paused = isTicketPaused(ticket);
  const price = ticketPrice(ticket);
  const link = ticketShareLink(experience);
  const qr = useQrDataUrl(link);

  const share = async () => {
    if (paused) {
      toast({ description: `${ticket.name} is paused. Resume sales to share it.` });
      return;
    }

    try {
      await navigator.clipboard.writeText(link);
      toast({ description: ticketShareMessage(ticket, experience.title) });
    } catch {
      toast({ title: link, description: 'Copy this link to share it.' });
    }
  };

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
          'flex items-center rounded-14 border-[1.5px] border-dashed',
          paused ? 'border-line bg-surface' : 'border-blue-200 bg-gradient-to-b from-blue-50 to-blue-100',
        )}
      >
        <span className="flex-shrink-0 py-3 pl-3 pr-3.5">
          {qr && (
            // eslint-disable-next-line @next/next/no-img-element -- a data: URL, not something next/image can optimize
            <img
              src={qr}
              alt={`Code for ${ticket.name}`}
              width={64}
              height={64}
              className={cn('block h-16 w-16 rounded-lg bg-white', paused && 'opacity-45')}
            />
          )}
        </span>

        <span
          aria-hidden="true"
          className={cn(
            'w-0 flex-shrink-0 self-stretch border-l-[1.5px] border-dashed',
            paused ? 'border-line' : 'border-blue-200',
          )}
        />

        <span className="grid min-w-0 flex-1 grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,0.7fr)] gap-x-3.5 gap-y-1.5 px-4 py-2.5">
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className={cn('truncate text-base font-bold', paused ? 'text-ink-muted' : 'text-gray-900')}>
              {ticket.name}
            </span>
            <span className="text-13 text-ink-muted">Ticket name</span>
          </span>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className={cn('whitespace-nowrap text-base font-bold', paused ? 'text-ink-muted' : 'text-gray-900')}>
              {price ? `${currency} ${price.toLocaleString('en-US')}` : 'Free'}
            </span>
            <span className="text-13 text-ink-muted">Amount per ticket</span>
          </span>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className={cn('text-base font-bold', paused ? 'text-ink-muted' : 'text-gray-900')}>
              {String(Number(ticket.quantity) || 0)}
            </span>
            <span className="text-13 text-ink-muted">Quantity</span>
          </span>
        </span>

        <button
          type="button"
          onClick={share}
          aria-label={`Share ${ticket.name}`}
          className={cn(
            'mr-2 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/70',
            paused ? 'text-ink-subtle' : 'text-brand',
          )}
        >
          <IconComponent iconName="Share08Icon" size={20} color="currentColor" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-0.5 overflow-hidden rounded-xl">
        {stats.map((stat) => (
          <StatCell key={stat.label} stat={stat} muted={paused} />
        ))}
      </div>

      <div className="-mt-1 flex flex-wrap items-center justify-end gap-x-1.5 gap-y-1">
        {paused ? (
          <RowAction icon="PlayIcon" label="Resume ticket sales" onClick={onToggleSales} disabled={isBusy} />
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
            <RowAction icon="Edit04Icon" label="Edit ticket" onClick={onEdit} />
          </>
        )}
      </div>
    </div>
  );
};
