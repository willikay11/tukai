'use client';

import { IconComponent } from '@/app/shared/components/Icons';

export interface TicketRowItem {
  id: string;
  apiId?: string;
  name: string;
  quantity: number;
  amount: number;
  buyerPrice?: number | null;
}

interface TicketRowProps {
  typeIndex: number; // 1-based, for "Ticket type N" / "Space type N"
  item: TicketRowItem;
  isPaid: boolean;
  currencyLabel: string;
  commissionPercent: number;
  canRemove: boolean;
  onChange: (patch: Partial<TicketRowItem>) => void;
  onRemove: () => void;
  onPersist: () => void;
}

const formatMoney = (amount: number) =>
  amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * One row of .tk-tickets / .tk-ticket - directly-editable fields, no
 * separate "open a form to add a ticket" step like the old TicketsStep.
 * `onPersist` fires on blur so the row saves to the API without an explicit
 * Save button, matching the handoff's inline editing.
 */
export const TicketRow = ({
  typeIndex,
  item,
  isPaid,
  currencyLabel,
  commissionPercent,
  canRemove,
  onChange,
  onRemove,
  onPersist,
}: TicketRowProps) => {
  const totalCost = item.amount * item.quantity;
  const customerSees =
    item.buyerPrice != null ? item.buyerPrice : item.amount + (item.amount * commissionPercent) / 100;
  const showSummary = isPaid && item.amount > 0 && item.quantity > 0;

  return (
    <div className="flex flex-col gap-2.5">
      {typeIndex > 1 && <div className="-mx-6 mb-1 mt-1.5 h-px bg-gray-200" aria-hidden="true" />}

      <div className="flex items-center justify-between gap-2.5">
        <span className="text-14 font-semibold text-ink">
          {isPaid ? 'Ticket type' : 'Space type'} {typeIndex}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="min-h-11 text-15 font-medium text-danger hover:underline"
          >
            Remove
          </button>
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          value={item.name}
          onChange={(event) => onChange({ name: event.target.value })}
          onBlur={onPersist}
          placeholder={
            isPaid ? 'Ticket name, e.g. VIP, Early bird, Locals' : 'Name, e.g. General admission'
          }
          aria-label={
            isPaid ? 'Ticket name, e.g. VIP, Early bird, Locals' : 'Name, e.g. General admission'
          }
          className="h-14 w-full rounded-xl border border-line pl-4 pr-[52px] text-15 text-gray-800 outline-none focus:border-brand focus:shadow-[0_0_0_3px_#E8F1ED]"
        />
        <IconComponent
          iconName="Ticket01Icon"
          size={20}
          color="#5B6B66"
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {isPaid && (
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={item.amount ? String(item.amount) : ''}
              onChange={(event) => {
                const next = event.target.value.replace(/[^0-9.,]/g, '');
                onChange({ amount: next ? parseFloat(next.replace(/,/g, '')) : 0 });
              }}
              onBlur={onPersist}
              placeholder="Amount per ticket"
              aria-label="Amount per ticket"
              className="h-14 w-full rounded-xl border border-line pl-4 pr-14 text-15 text-gray-800 outline-none focus:border-brand focus:shadow-[0_0_0_3px_#E8F1ED]"
            />
            <span className="pointer-events-none absolute right-[18px] top-1/2 -translate-y-1/2 text-sm font-semibold text-ink-muted">
              {currencyLabel}
            </span>
          </div>
        )}
        <input
          type="text"
          inputMode="numeric"
          value={item.quantity ? String(item.quantity) : ''}
          onChange={(event) => {
            const next = event.target.value.replace(/[^0-9]/g, '');
            onChange({ quantity: next ? parseInt(next, 10) : 0 });
          }}
          onBlur={onPersist}
          placeholder={isPaid ? 'Ticket quantity' : 'Number of spaces'}
          aria-label={isPaid ? 'Ticket quantity' : 'Number of spaces'}
          className="h-14 w-full rounded-xl border border-line px-4 text-15 text-gray-800 outline-none focus:border-brand focus:shadow-[0_0_0_3px_#E8F1ED]"
        />
      </div>

      {showSummary && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border-[1.5px] border-dashed border-line bg-[#F7F8F7] px-4 py-3 text-[14.5px] text-gray-800">
          <span>
            All tickets cost:{' '}
            <strong className="font-semibold">
              {currencyLabel} {formatMoney(totalCost)}
            </strong>
          </span>
          <span className="h-[5px] w-[5px] flex-shrink-0 rounded-full bg-distance" aria-hidden="true" />
          <span>
            What the customer sees:{' '}
            <strong className="font-semibold">
              {currencyLabel} {formatMoney(customerSees)}
            </strong>
          </span>
        </div>
      )}
    </div>
  );
};
