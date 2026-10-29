'use client';

import { useMemo, useState } from 'react';

import { TicketStat } from '@/app/(dashboard)/dashboard/experiences/[experienceId]/components/TicketsCreatedTab/ticket-stats';
import { IconComponent } from '@/app/shared/components/Icons';
import { useUpdateExperienceTicket } from '@/app/shared/hooks/useExperiences';
import { useToast } from '@/app/shared/hooks/useToast';
import { useHostingPlan } from '@/context/HostingPlanContext';
import { getHostingPlan } from '@/services/hostingPlans';
import { cn } from '@/lib/utils';
import { Experience } from '@/types/experience';
import { Ticket } from '@/types/ticket';
import { currencyFullName } from '@/utils/money';

type FeeAllocation = 'host_pays' | 'customer_pays' | 'split';

const FEE_OPTIONS: { value: FeeAllocation; label: string }[] = [
  { value: 'host_pays', label: 'I will pay the full commission' },
  { value: 'customer_pays', label: 'Customer pays the commission' },
  { value: 'split', label: 'Split 50-50 between the customer and me' },
];

const feeMultiplier = (allocation: FeeAllocation, ratePct: number): number => {
  if (allocation === 'host_pays') return 1;
  if (allocation === 'split') return 1 + ratePct / 200;
  return 1 + ratePct / 100;
};

const ticketsSold = (ticket: Ticket): number =>
  Math.max((Number(ticket.quantity) || 0) - (Number(ticket.availableQuantity) || 0), 0);

const money2 = (currency: string, amount: number): string =>
  `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const onlyDigits = (value: string, max: number) => value.replace(/[^0-9]/g, '').slice(0, max);

export const EditTicketDetailsView = ({
  experience,
  ticket,
  currency,
  onBack,
}: {
  experience: Experience;
  ticket: Ticket;
  currency: string;
  onBack: () => void;
}) => {
  const { toast } = useToast();
  const hostingPlan = useHostingPlan();
  const plan = hostingPlan?.currentPlan.planId ? getHostingPlan(hostingPlan.currentPlan.planId) : undefined;
  const ratePct = plan?.commissionPct ?? 4;

  const sold = ticketsSold(ticket);
  const isPaid = Number(ticket.price) > 0;
  const originalName = ticket.name;
  const originalPrice = Number(ticket.price) || 0;
  const originalQty = Number(ticket.quantity) || 0;

  const [name, setName] = useState(originalName);
  const [amountRaw, setAmountRaw] = useState(originalPrice ? String(originalPrice) : '');
  const [qtyRaw, setQtyRaw] = useState(String(originalQty));

  const { mutate: updateTicket, isPending } = useUpdateExperienceTicket(experience.id, ticket.id);

  const amount = Number(amountRaw) || 0;
  const qty = Number(qtyRaw) || 0;

  const summaryStats: TicketStat[] = useMemo(() => {
    const available = Number(ticket.availableQuantity) || 0;
    const price = originalPrice;
    const m = (n: number) => `${currency} ${Math.round(n).toLocaleString('en-US')}`;

    return [
      { label: 'Ticket currency', value: currencyFullName(currency) },
      { label: 'Tickets created', value: String(originalQty) },
      { label: 'Amount per ticket', value: price ? m(price) : 'Free' },
      { label: 'Tickets sold', value: String(sold) },
      { label: 'Amount sold', value: m(sold * price) },
      { label: 'Available tickets', value: String(available) },
      {
        label: 'Estimated sales expiry',
        value: ticket.salesEndDate
          ? new Date(ticket.salesEndDate).toLocaleDateString('en-US', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              hour: 'numeric',
              minute: '2-digit',
            })
          : '-',
        full: true,
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket, currency]);

  const error = !name.trim()
    ? 'Give the ticket a name.'
    : isPaid && !amount
      ? 'Enter an amount per ticket.'
      : !qty
        ? 'Enter how many tickets to sell.'
        : qty < sold
          ? `${sold} tickets are already sold, so the quantity cannot go below ${sold}.`
          : '';

  const changed = name.trim() !== originalName || (isPaid && amount !== originalPrice) || qty !== originalQty;
  const canSave = !error && changed;

  const notes: string[] = [];
  if (isPaid && amount && amount !== originalPrice) {
    notes.push(
      sold
        ? `New buyers pay ${currency} ${Math.round(amount).toLocaleString('en-US')}. The ${sold} ${sold === 1 ? 'person' : 'people'} who already bought keep the price they paid.`
        : `Buyers pay ${currency} ${Math.round(amount).toLocaleString('en-US')} from now on.`,
    );
  }
  if (qty && qty !== originalQty && qty >= sold) {
    notes.push(`Available tickets go from ${originalQty - sold} to ${qty - sold}.`);
  }

  const feeAllocation: FeeAllocation =
    experience.feesAllocation === 'host_pays' || experience.feesAllocation === 'split'
      ? experience.feesAllocation
      : 'customer_pays';
  const multiplier = feeMultiplier(feeAllocation, ratePct);

  const save = () => {
    if (!canSave) return;

    updateTicket(
      { experience: experience.id, name: name.trim(), quantity: qty, price: String(isPaid ? amount : 0) },
      {
        onSuccess: () => {
          toast({ description: `Changes to ${name.trim()} are saved.`, variant: 'success' });
          onBack();
        },
        onError: (saveError: Error) =>
          toast({ description: saveError.message, variant: 'destructive' }),
      },
    );
  };

  return (
    <>
      <div className="flex flex-1 flex-col gap-7 px-6 py-5">
        <div className="flex flex-col gap-3.5">
          <div className="flex items-start gap-3">
            <IconComponent iconName="Ticket01Icon" size={24} color="currentColor" className="mt-0.5 flex-shrink-0 text-brand" />
            <h3 className="min-w-0 text-xl font-bold leading-snug tracking-tight text-gray-900">
              {originalName}
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-0.5 overflow-hidden rounded-xl">
            {summaryStats.map((stat) => (
              <div
                key={stat.label}
                className={cn('flex min-w-0 flex-col gap-1 bg-surface px-4 py-3', stat.full && 'col-span-3')}
              >
                <span className="text-[13.5px] leading-snug text-ink-muted">{stat.label}</span>
                <span className="break-words text-base font-semibold leading-snug text-gray-900">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div aria-hidden="true" className="-mx-6 h-px bg-line-shell" />

        <div className="flex flex-col gap-3.5">
          <h3 className="text-19 font-bold tracking-tight text-gray-900">Edit details</h3>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="tke-name" className="text-[13.5px] text-ink-muted">
              Ticket name
            </label>
            <div className="relative">
              <input
                id="tke-name"
                type="text"
                autoComplete="off"
                value={name}
                onChange={(event) => setName(event.target.value.slice(0, 60))}
                placeholder="Ticket name, e.g. VIP, Early bird, Locals"
                className="h-14 w-full rounded-xl border border-line bg-white px-4 pr-[52px] text-15 text-gray-900 outline-none focus:border-brand focus:ring-[3px] focus:ring-surface-brand"
              />
              <IconComponent
                iconName="Ticket01Icon"
                size={21}
                color="currentColor"
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,160px),1fr))] gap-2.5">
            {isPaid && (
              <div className="flex min-w-0 flex-col gap-1.5">
                <label htmlFor="tke-amt" className="text-[13.5px] text-ink-muted">
                  Amount per ticket
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-15 text-ink-muted">
                    {currency}
                  </span>
                  <input
                    id="tke-amt"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={amount ? amount.toLocaleString('en-US') : ''}
                    onChange={(event) => setAmountRaw(onlyDigits(event.target.value, 9))}
                    placeholder="0"
                    className={cn(
                      'h-14 w-full rounded-xl border bg-white pl-14 pr-[52px] text-15 text-gray-900 outline-none focus:border-brand focus:ring-[3px] focus:ring-surface-brand',
                      'border-line',
                    )}
                  />
                  <IconComponent
                    iconName="Money01Icon"
                    size={21}
                    color="currentColor"
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-900"
                  />
                </div>
              </div>
            )}

            <div className="flex min-w-0 flex-col gap-1.5">
              <label htmlFor="tke-qty" className="text-[13.5px] text-ink-muted">
                {isPaid ? 'Number of tickets' : 'Number of spaces'}
              </label>
              <input
                id="tke-qty"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={qtyRaw}
                onChange={(event) => setQtyRaw(onlyDigits(event.target.value, 6))}
                placeholder="0"
                className="h-14 w-full rounded-xl border border-line bg-white px-4 text-15 text-gray-900 outline-none focus:border-brand focus:ring-[3px] focus:ring-surface-brand"
              />
            </div>
          </div>

          {isPaid && amount > 0 && qty > 0 && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border-[1.5px] border-dashed border-line bg-[#F7F8F7] px-4 py-3 text-[14.5px] text-gray-900">
              <span>
                All tickets cost: <span className="font-bold">{money2(currency, amount * qty)}</span>
              </span>
              <span aria-hidden="true" className="h-[5px] w-[5px] flex-shrink-0 rounded-full bg-distance" />
              <span>
                What the customer sees:{' '}
                <span className="font-bold">{money2(currency, amount * multiplier)}</span>
              </span>
            </div>
          )}

          {isPaid && (
            <div className="flex flex-col gap-2.5">
              <span className="text-15 font-semibold text-gray-900">
                Fees allocation <span className="font-normal text-ink-muted">(who pays Tukai&rsquo;s commission?)</span>
              </span>
              <div role="radiogroup" aria-label="Who pays the commission" aria-disabled="true" className="flex flex-col items-start gap-2.5">
                {FEE_OPTIONS.map((option) => {
                  const chosen = option.value === feeAllocation;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked={chosen}
                      disabled
                      className={cn(
                        'inline-flex min-h-12 cursor-not-allowed items-center gap-2 rounded-full py-0 pl-4 pr-[22px] text-left text-15 font-medium',
                        chosen
                          ? 'bg-surface-brand text-brand-deep shadow-[inset_0_0_0_1px_#A9CBBB]'
                          : 'bg-[#F7F8F7] text-[#9AA5A0] shadow-[inset_0_0_0_1px_#EDF0EE]',
                      )}
                    >
                      <IconComponent
                        iconName={chosen ? 'CheckmarkCircle02Icon' : 'CircleIcon'}
                        variant={chosen ? 'bulk' : 'twotone'}
                        size={19}
                        color="currentColor"
                      />
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <span className="flex items-start gap-2 text-[13.5px] leading-[1.45] text-ink-muted">
                <IconComponent iconName="SquareLock02Icon" size={17} color="currentColor" className="mt-px flex-shrink-0" />
                Set when the experience was created. It cannot change once tickets are on sale.
              </span>
            </div>
          )}

          {error ? (
            <span role="alert" className="text-[13.5px] leading-[1.45] text-danger">
              {error}
            </span>
          ) : (
            notes.length > 0 && (
              <p className="m-0 flex items-start gap-2.5 text-[13.5px] leading-[1.5] text-ink-note">
                <IconComponent
                  iconName="InformationCircleIcon"
                  size={18}
                  color="currentColor"
                  className="mt-px flex-shrink-0 text-brand"
                />
                <span>{notes.join(' ')}</span>
              </p>
            )
          )}
        </div>
      </div>

      <div className="sticky bottom-0 z-[4] flex min-h-[88px] flex-wrap items-center gap-2.5 border-t border-surface-muted bg-white px-6 py-[18px]">
        <button
          type="button"
          onClick={onBack}
          className="h-12 flex-shrink-0 px-1.5 text-15 font-medium text-danger hover:underline"
        >
          Cancel
        </button>
        <span aria-hidden="true" className="flex-1" />
        <button
          type="button"
          onClick={save}
          disabled={!canSave || isPending}
          aria-disabled={!canSave || isPending}
          className={cn(
            'h-12 flex-shrink-0 whitespace-nowrap rounded-full px-6 text-15 font-semibold transition-colors',
            canSave && !isPending
              ? 'bg-lime text-brand-ink hover:bg-lime-dark active:scale-[0.97]'
              : 'cursor-not-allowed bg-[#E4F4B5] text-[#5E7A45]',
          )}
        >
          {isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </>
  );
};
