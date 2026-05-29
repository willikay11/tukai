'use client';

import { useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import type { CreateExperienceTicketItem } from '@/types/ticket';

import { SavedTicketCard } from '../TicketCard';
import { TicketForm, type TicketFormValue } from '../TicketForm';

interface RecurringSlotPillProps {
  slotIndex: number;
  startTime: string;
  endTime: string;
  dayLabel: string;
  templateId?: string;
  ticket: CreateExperienceTicketItem | null;
  experiencePricing: 'paid' | 'free';
  commissionPayer: 'host' | 'customer' | 'split';
  errors: Record<string, string>;
  isSaving: boolean;
  onSaveTicket: (ticket: TicketFormValue) => Promise<void>;
  onEditTicket: () => void;
  onDeleteTicket: () => Promise<void>;
}

const formatTime = (time: string): string => {
  if (!time) return '';
  const [hour, min] = time.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const h = hour % 12 || 12;
  return `${h}:${String(min).padStart(2, '0')} ${period}`;
};

const emptyTicketForm: TicketFormValue = {
  name: '',
  quantity: null,
  amount: null,
  salesStartDate: null,
  salesStartTime: null,
  salesEndDate: null,
  salesEndTime: null,
  acceptPartialPayment: false,
};

export const RecurringSlotPill = ({
  slotIndex,
  startTime,
  endTime,
  dayLabel,
  templateId,
  ticket,
  experiencePricing,
  commissionPayer,
  errors,
  isSaving,
  onSaveTicket,
  onEditTicket,
  onDeleteTicket,
}: RecurringSlotPillProps) => {
  const [isExpanded, setIsExpanded] = useState(!ticket);

  const pillLabel = `Every ${dayLabel} ${formatTime(startTime)} — ${formatTime(endTime)}`;
  const hasTicket = ticket !== null;

  return (
    <div className="relative flex gap-3">
      {/* Timeline dot + vertical line */}
      <div className="flex flex-col items-center">
        <div className="z-10 mt-3 h-3 w-3 flex-shrink-0 rounded-full bg-primary" />
        <div className="mt-1 w-px flex-1 border-l-2 border-dashed border-primary/40" />
      </div>

      {/* Pill + expanded content */}
      <div className="flex-1 pb-4">
        {/* Pill header */}
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex w-full items-center justify-between rounded-full border-2 border-dashed border-primary/50 bg-primary/5 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
        >
          <div className="flex items-center gap-2">
            <IconComponent iconName="Calendar03Icon" size={16} className="text-primary" />
            <span>{pillLabel}</span>
          </div>

          {hasTicket && (
            <IconComponent iconName="CheckmarkCircle01Icon" size={16} className="text-primary" />
          )}
        </button>

        {/* Expanded: show ticket form or saved ticket card */}
        {isExpanded && (
          <div className="mt-3 pl-2">
            {hasTicket && !isExpanded ? null : hasTicket ? (
              <SavedTicketCard
                name={ticket.name}
                quantity={ticket.quantity}
                amount={ticket.amount}
                validity={`${ticket.salesEndRelative?.amount ?? 1} ${ticket.salesEndRelative?.unit ?? 'hour'} before the experience ${ticket.salesEndRelative?.anchor === 'start' ? 'starts' : 'ends'}`}
                coverPhoto={undefined}
                onEdit={onEditTicket}
                onDelete={onDeleteTicket}
              />
            ) : (
              <TicketForm
                value={emptyTicketForm}
                onChange={() => {}}
                errors={errors}
                onSave={onSaveTicket}
                onCancel={() => setIsExpanded(false)}
                experiencePricing={experiencePricing}
                commissionPayer={commissionPayer}
                isRecurring={true}
                isSaving={isSaving}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
