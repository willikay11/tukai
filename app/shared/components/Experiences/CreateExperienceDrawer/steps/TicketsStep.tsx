'use client';

import { useState } from 'react';

import { v4 as uuidv4 } from 'uuid';

import type { useCreateExperienceFlow } from '@/app/(experiences)/experiences/create/hooks/useCreateExperienceFlow';
import { IconComponent } from '@/app/shared/components/Icons';
import { getDaysBetween } from '@/utils/date-utils';

type Flow = ReturnType<typeof useCreateExperienceFlow>;
type TicketItem = Flow['formData']['tickets']['items'][number];

interface TicketsStepProps {
  flow: Flow;
}

const COMMISSION_OPTIONS: { value: 'host' | 'customer' | 'split'; label: string }[] = [
  { value: 'host', label: 'I will pay the full commission' },
  { value: 'customer', label: 'Customer pays the commission' },
  { value: 'split', label: 'Split 50-50 between the customer and me' },
];

const CURRENCY_OPTIONS: { value: 'KES' | 'USD'; label: string; note: string }[] = [
  { value: 'KES', label: 'Kenya shillings', note: '(KES)' },
  { value: 'USD', label: 'US dollars', note: '(USD)' },
];

const blankTicketItem = (): TicketItem => ({
  id: uuidv4(),
  name: '',
  quantity: 0,
  amount: 0,
  buyerPrice: null,
  startTime: null,
  endTime: null,
  salesStartDate: null,
  salesStartTime: null,
  salesEndDate: null,
  salesEndTime: null,
  acceptPartialPayment: false,
  salesStartRelative: null,
  salesEndRelative: null,
  duplicateForEntirePeriod: false,
});

const formatAmount = (value: number): string =>
  value.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const PillOption = ({
  active,
  onClick,
  children,
  note,
  fullWidth,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  note?: React.ReactNode;
  fullWidth?: boolean;
}) => (
  <button
    type="button"
    role="radio"
    aria-checked={active}
    onClick={onClick}
    className={`inline-flex min-h-12 items-center gap-1.5 whitespace-nowrap rounded-full px-[22px] text-left text-15 font-medium active:scale-[0.98] ${
      fullWidth ? 'w-full' : ''
    } ${active ? 'bg-gradient-to-b from-brand-mid to-brand-deep text-white' : 'bg-surface text-gray-800'}`}
  >
    {children}
    {note && <span className={active ? 'text-[#D5ECE1]' : 'text-ink-muted'}>{note}</span>}
  </button>
);

/**
 * Step 4: Tickets (tk-tickets / tk-ticket / tk-sumbox in create-experience.css).
 *
 * Free experiences relabel "tickets" as "spaces" throughout and skip the fee
 * allocation, partial-payment toggle and currency picker entirely.
 *
 * Two deliberate resolutions versus the handoff markup, both called out again
 * in the PR/report rather than hidden here:
 *  - Partial payments: `acceptPartialPayment` lives per ticket item in
 *    `FormData['tickets']['items']`, but the handoff shows one shared toggle
 *    above the whole list. This renders ONE switch that sets the flag on
 *    every item at once, shown "on" only when every current item already has
 *    it on.
 *  - Ticket currency: `FormData['tickets']` has no currency field (grepped
 *    useCreateExperienceFlow.ts - not present). This renders the picker as
 *    local-only UI state defaulting to KES; there is nowhere to persist it
 *    yet, so no `flow` update is called for it.
 */
export const TicketsStep = ({ flow }: TicketsStepProps) => {
  const { dateType, tickets } = flow.formData;
  const errors = flow.ticketsErrors;
  const isPaid = dateType.experiencePricing === 'paid';
  const isMultiDay = dateType.experienceType === 'multi-day';
  const isEachDay = isMultiDay && tickets.ticketMode === 'each-day';

  const [showPartialInfo, setShowPartialInfo] = useState(false);
  // No currency field exists on FormData['tickets'] yet - this is local-only
  // UI state defaulting to KES. Nothing here is persisted to `flow`.
  const [currency, setCurrency] = useState<'KES' | 'USD'>('KES');

  const multiDayDays =
    isEachDay && dateType.multiDayStartDate && dateType.multiDayEndDate
      ? getDaysBetween(dateType.multiDayStartDate, dateType.multiDayEndDate)
      : [];

  const itemNoun = isPaid ? 'Ticket' : 'Space';
  const itemNounLower = isPaid ? 'ticket' : 'space';

  const updateItem = (index: number, patch: Partial<TicketItem>) => {
    flow.updateTicketsFormData({
      items: tickets.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    });
  };

  const removeItem = (index: number) => {
    flow.updateTicketsFormData({ items: tickets.items.filter((_, i) => i !== index) });
  };

  const addItem = () => {
    flow.updateTicketsFormData({ items: [...tickets.items, blankTicketItem()] });
  };

  const allAcceptPartial =
    tickets.items.length > 0 && tickets.items.every((item) => item.acceptPartialPayment);

  const togglePartialPayment = () => {
    const next = !allAcceptPartial;
    flow.updateTicketsFormData({
      items: tickets.items.map((item) => ({ ...item, acceptPartialPayment: next })),
    });
  };

  const handleCommissionChange = (commission: 'host' | 'customer' | 'split') => {
    flow.updateTicketsFormData({ commission });
    // Known-inaccurate per product: this hard-codes a 4% commission and
    // ignores the host's real plan fee (Basic 8%, Premium 3.5%, Business 3%).
    // Rendered as specified in the handoff - tracked separately, see the
    // README's "Open questions" section.
    void flow.handlers.handleUpdateFeesAllocation(commission);
  };

  return (
    <div className="flex flex-col gap-7">
      <h2 className="text-22 font-bold leading-tight tracking-[-0.3px] text-gray-800">
        {isPaid ? 'Create tickets' : 'Set the number of spaces'}
      </h2>

      {isPaid && (
        <>
          <div className="-mt-2.5 flex flex-col gap-3">
            <span className="text-15 font-semibold text-gray-800">
              Fees allocation{' '}
              <span className="font-normal text-ink-muted">
                (Tukai charges a 4% commission. Who should pay it?)
              </span>
            </span>
            <div className="flex flex-col items-start gap-2.5" role="radiogroup">
              {COMMISSION_OPTIONS.map((option) => (
                <PillOption
                  key={option.value}
                  active={tickets.commission === option.value}
                  onClick={() => handleCommissionChange(option.value)}
                >
                  {option.label}
                </PillOption>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                role="switch"
                aria-checked={allAcceptPartial}
                onClick={togglePartialPayment}
                className="inline-flex min-h-11 items-center gap-3.5 text-15 text-gray-800"
              >
                <span
                  className={`relative h-8 w-14 flex-shrink-0 rounded-full transition-colors ${
                    allAcceptPartial ? 'bg-brand' : 'bg-line'
                  }`}
                >
                  <span
                    className={`absolute top-[3px] h-[26px] w-[26px] rounded-full bg-white shadow-[0_1px_3px_rgba(1,51,52,.3)] transition-all ${
                      allAcceptPartial ? 'left-[27px]' : 'left-[3px]'
                    }`}
                  />
                </span>
                Accept partial payments on this experience
              </button>
              <button
                type="button"
                aria-label="About partial payments"
                aria-expanded={showPartialInfo}
                onClick={() => setShowPartialInfo((prev) => !prev)}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-surface-brand"
              >
                <IconComponent iconName="InformationCircleIcon" size={20} color="currentColor" />
              </button>
            </div>
            {showPartialInfo && (
              <p className="rounded-xl bg-surface-brand px-4 py-3 text-[14.5px] leading-relaxed text-brand-ink">
                Guests pay part of the price when they book and the rest a week before the
                experience.
              </p>
            )}
          </div>

          <div className="-mx-6 h-px bg-gray-200" aria-hidden="true" />

          <div className="flex flex-col gap-3">
            <span className="text-15 font-semibold text-gray-800">Ticket currency</span>
            <div className="flex flex-wrap gap-2.5" role="radiogroup">
              {CURRENCY_OPTIONS.map((option) => (
                <PillOption
                  key={option.value}
                  active={currency === option.value}
                  onClick={() => setCurrency(option.value)}
                  note={option.note}
                >
                  {option.label}
                </PillOption>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col gap-[22px]">
        {tickets.items.map((item, index) => {
          const totalCost = (item.amount || 0) * (item.quantity || 0);
          // item.buyerPrice is already the unwrapped per-ticket buyer amount
          // (set via getTicketBuyerAmount when the ticket is saved/repriced by
          // the API - see useCreateExperienceFlow's handleSaveTicket and
          // handleUpdateFeesAllocation). A draft the API hasn't priced yet
          // falls back to the raw amount entered, same as the host's own
          // price until it is saved.
          const buyerPricePerTicket = item.buyerPrice ?? item.amount;
          const showSummary = isPaid && item.amount > 0 && item.quantity > 0;

          const dayLabel =
            isEachDay && item.dayIndex !== undefined ? multiDayDays[item.dayIndex] : null;

          return (
            <div key={item.id} className="flex flex-col gap-2.5">
              {index > 0 && <div className="h-px bg-gray-200" aria-hidden="true" />}

              <div className="flex items-center justify-between gap-2.5">
                <span className="text-sm font-semibold text-ink">
                  {itemNoun} type {index + 1}
                </span>
                {tickets.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-sm font-semibold text-danger hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              {isEachDay && multiDayDays.length > 0 && (
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Which day">
                  {multiDayDays.map((day, dayIdx) => (
                    <PillOption
                      key={day}
                      active={item.dayIndex === dayIdx}
                      onClick={() => updateItem(index, { dayIndex: dayIdx })}
                    >
                      Day {dayIdx + 1}
                    </PillOption>
                  ))}
                </div>
              )}
              {isEachDay && dayLabel == null && multiDayDays.length > 0 && (
                <span className="text-[13px] text-danger">Choose which day this applies to.</span>
              )}

              <div className="relative">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(index, { name: e.target.value })}
                  placeholder={
                    isPaid
                      ? 'Ticket name, e.g. VIP, Early bird, Locals'
                      : 'Name, e.g. General admission'
                  }
                  aria-label={
                    isPaid
                      ? 'Ticket name, e.g. VIP, Early bird, Locals'
                      : 'Name, e.g. General admission'
                  }
                  className="h-14 w-full rounded-xl border border-line bg-white px-4 pr-[52px] text-15 text-gray-800 outline-none placeholder:text-ink-muted focus:border-brand focus:shadow-[0_0_0_3px_#E8F1ED]"
                />
                <IconComponent
                  iconName="Ticket01Icon"
                  size={20}
                  color="#5B6B66"
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
                />
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {isPaid && (
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={item.amount ? String(item.amount) : ''}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9.,]/g, '');
                        updateItem(index, { amount: Number(raw.replace(/,/g, '')) || 0 });
                      }}
                      placeholder="Amount per ticket"
                      aria-label="Amount per ticket"
                      className="h-14 w-full rounded-xl border border-line bg-white px-4 pr-[60px] text-15 text-gray-800 outline-none placeholder:text-ink-muted focus:border-brand focus:shadow-[0_0_0_3px_#E8F1ED]"
                    />
                    <span className="pointer-events-none absolute right-[18px] top-1/2 -translate-y-1/2 text-sm font-semibold text-ink-muted">
                      {currency}
                    </span>
                  </div>
                )}
                <input
                  type="text"
                  inputMode="numeric"
                  value={item.quantity ? String(item.quantity) : ''}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    updateItem(index, { quantity: Number(raw) || 0 });
                  }}
                  placeholder={isPaid ? 'Ticket quantity' : 'Number of spaces'}
                  aria-label={isPaid ? 'Ticket quantity' : 'Number of spaces'}
                  className="h-14 w-full rounded-xl border border-line bg-white px-4 text-15 text-gray-800 outline-none placeholder:text-ink-muted focus:border-brand focus:shadow-[0_0_0_3px_#E8F1ED]"
                />
              </div>

              {errors[`items.${index}.amount`] && (
                <span className="text-[13.5px] text-danger-deep">
                  {errors[`items.${index}.amount`]}
                </span>
              )}
              {errors[`items.${index}.quantity`] && (
                <span className="text-[13.5px] text-danger-deep">
                  {errors[`items.${index}.quantity`]}
                </span>
              )}

              {showSummary && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border-[1.5px] border-dashed border-line bg-[#F7F8F7] px-4 py-3 text-[14.5px] leading-relaxed text-gray-800">
                  <span>
                    All tickets cost:{' '}
                    <strong className="font-semibold">
                      {currency} {formatAmount(totalCost)}
                    </strong>
                  </span>
                  <span className="h-[5px] w-[5px] flex-shrink-0 rounded-full bg-distance" />
                  <span>
                    What the customer sees:{' '}
                    <strong className="font-semibold">
                      {currency} {formatAmount(buyerPricePerTicket)}
                    </strong>
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={addItem}
          className="inline-flex min-h-11 items-center gap-2 text-15 font-semibold text-brand hover:underline"
        >
          <IconComponent iconName="Ticket01Icon" size={20} color="#066349" />
          Add another {itemNounLower} type
        </button>
        <span className="text-[13px] italic text-ink-muted">
          {itemNoun} details can always be edited later.
        </span>
      </div>
    </div>
  );
};
