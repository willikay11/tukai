'use client';

import { useMemo, useState } from 'react';

import { IconComponent } from '@/app/shared/components/Icons';
import { useExperienceTicketPurchases } from '@/app/shared/hooks/useExperiences';
import { useToast } from '@/app/shared/hooks/useToast';
import { Experience } from '@/types/experience';

import { HostActionBar, messageAllBuyersAction } from './HostActionBar';
import { Buyer, buildSalesData } from './sales-buyers';

const PAGE_SIZE = 8;

const money = (amount: number, currency: string) =>
  `${currency} ${Math.round(amount).toLocaleString('en-US')}`;

const stubDate = (iso: string) => {
  const date = new Date(iso);
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  const hours24 = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const hours12 = hours24 % 12 || 12;
  const ampm = hours24 >= 12 ? 'PM' : 'AM';
  return `${day} ${month}, ${hours12}:${minutes} ${ampm}`;
};

const Divider = () => <div aria-hidden="true" className="-mx-6 h-px flex-shrink-0 bg-surface-muted" />;

const BuyerRow = ({
  buyer,
  currency,
  open,
  onToggle,
  onMessage,
}: {
  buyer: Buyer;
  currency: string;
  open: boolean;
  onToggle: () => void;
  onMessage: () => void;
}) => (
  <div className="border-b border-surface-muted">
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={`sales-buyer-${buyer.key}`}
      className="flex min-h-[76px] w-full items-center gap-3 px-6 py-3 pl-4 text-left transition-colors hover:bg-shell"
    >
      <IconComponent
        iconName={open ? 'ArrowDown01Icon' : 'ArrowRight01Icon'}
        size={20}
        color="currentColor"
        className="flex-shrink-0 text-ink-pill"
      />

      {buyer.picture ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote buyer photo, not one next/image can optimize at this size
        <img
          src={buyer.picture}
          alt=""
          className="h-12 w-12 flex-shrink-0 rounded-full bg-surface-brand object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-surface-brand text-17 font-bold text-brand-ink"
        >
          {buyer.name.charAt(0).toUpperCase()}
        </span>
      )}

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="min-w-0 truncate text-[15.5px] font-semibold text-ink-pill">
          {buyer.name}
        </span>
        <span className="flex items-center gap-1.5 text-13 text-ink-muted">
          <span className="font-semibold text-ink-pill">{money(buyer.amount, currency)}</span>
          <span aria-hidden="true" className="h-1 w-1 flex-shrink-0 rounded-full bg-ink-subtle" />
          {buyer.qty === 1 ? '1 ticket' : `${buyer.qty} tickets`}
        </span>
      </span>
    </button>

    {open && (
      <div id={`sales-buyer-${buyer.key}`} className="flex flex-col items-start gap-3 px-6 pb-[18px] pl-[76px]">
        {buyer.stubs.map((stub) => (
          <div
            key={stub.key}
            className="flex min-w-0 items-center self-stretch rounded-14 border-[1.5px] border-dashed border-blue-200 bg-gradient-to-b from-blue-50 to-blue-100"
          >
            <span className="flex-shrink-0 p-2.5 pl-3">
              {stub.code ? (
                // eslint-disable-next-line @next/next/no-img-element -- remote ticket QR, not one next/image can optimize at this size
                <img
                  src={stub.code}
                  alt={`Ticket code for ${buyer.name}`}
                  className="block h-14 w-14 rounded-lg bg-white"
                />
              ) : (
                <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-white">
                  <IconComponent iconName="QrCodeIcon" size={24} color="currentColor" className="text-ink-subtle" />
                </span>
              )}
            </span>
            <span aria-hidden="true" className="w-0 flex-shrink-0 self-stretch border-l-[1.5px] border-dashed border-blue-200" />
            <span className="flex min-w-0 flex-1 flex-col gap-1 px-3.5 py-2.5">
              <span className="truncate text-15 font-semibold text-ink-pill">{stub.ticketName}</span>
              <span className="text-[13.5px] leading-snug text-ink">
                {stub.qty === 1 ? '1 ticket' : `${stub.qty} tickets`} · {money(stub.amount, currency)} ·{' '}
                {stubDate(stub.at)}
              </span>
            </span>
          </div>
        ))}

        <button
          type="button"
          onClick={onMessage}
          className="inline-flex h-11 flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-surface-pill-active pl-3.5 pr-[18px] text-[14.5px] font-semibold text-brand-deep transition-[filter] hover:brightness-[0.97]"
        >
          <IconComponent iconName="Message01Icon" size={18} color="currentColor" />
          Send message
        </button>
      </div>
    )}
  </div>
);

/**
 * A hosted experience's Sales tab: what has sold, who bought it, and the
 * sales-facing actions around that. Real data throughout - `useExperienceTicketPurchases`
 * already exists for this, built for the old manage-experience page's own
 * `SalesTab`. Only `completed` purchases count as buyers; `pending` feeds the
 * summary's own pending figure instead of the handoff's fixed-18% sample.
 *
 * Share buyers list, Generate sale QR, Admission QR, Send message, Message
 * all buyers and Scan ticket are all out of scope per the handoff - every one
 * just toasts.
 */
export const SalesHostTab = ({ experience }: { experience: Experience }) => {
  const currency = experience.currency ?? 'Ksh.';
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const { data: purchasesResponse, isLoading } = useExperienceTicketPurchases(experience.id);

  const { summary, buyers } = useMemo(
    () => buildSalesData(purchasesResponse?.data?.results ?? []),
    [purchasesResponse],
  );

  const query = search.trim().toLowerCase();
  const matches = query ? buyers.filter((buyer) => buyer.name.toLowerCase().includes(query)) : buyers;
  const visible = query || showAll ? matches : matches.slice(0, PAGE_SIZE);
  const hasMore = !query && !showAll && matches.length > PAGE_SIZE;

  const available = summary.total - summary.pending;

  const stats = [
    { label: 'Tickets sold', value: String(summary.ticketsSold) },
    { label: 'Total buyers', value: String(summary.buyers) },
    { label: 'Pending payments', value: money(summary.pending, currency) },
  ];

  const salesActions = [
    {
      label: 'Share buyers list',
      iconName: 'Download01Icon',
      onClick: () =>
        toast({
          description:
            summary.buyers > 0
              ? `A spreadsheet of all ${summary.buyers} buyers is ready to share.`
              : 'No buyers yet. The list fills up as tickets sell.',
        }),
    },
    {
      label: 'Generate sale QR',
      iconName: 'QrCodeIcon',
      onClick: () =>
        toast({ description: `A code people can scan to buy tickets for ${experience.title}.` }),
    },
    {
      label: 'Admission QR',
      iconName: 'QrCode01Icon',
      onClick: () =>
        toast({ description: 'Show this code at the entrance. Guests scan it to check in.' }),
    },
  ];

  return (
    <>
      <div className="flex flex-1 flex-col gap-5 px-6 py-5">
        <div className="flex flex-col gap-2 rounded-xl border-[0.5px] border-line-shell bg-shell p-2">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-2.5 pb-2 pt-3">
            <div className="min-w-0">
              <h3 className="text-[14.5px] text-ink-pill">Current ticket sales</h3>
              <p className="mt-1 text-[28px] font-bold leading-[1.15] tracking-[-0.6px] text-ink-pill">
                {money(summary.total, currency)}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                toast({
                  description:
                    summary.total > 0
                      ? `Choose an amount to send to M-Pesa ending 815. ${money(available, currency)} is available now, ${money(summary.pending, currency)} is still clearing.`
                      : 'There is nothing to withdraw yet. Ticket sales show up here as they come in.',
                })
              }
              className="inline-flex h-12 flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-lime pl-[22px] pr-[18px] text-15 font-semibold text-brand-ink transition-[filter] hover:brightness-[0.96]"
            >
              Withdraw
              <IconComponent iconName="ArrowDown02Icon" size={18} color="currentColor" />
            </button>
          </div>

          <div className="flex flex-wrap gap-px overflow-hidden rounded-xl bg-surface-muted shadow-[0_1px_3px_rgba(1,51,52,.07)]">
            {stats.map((stat) => (
              <div key={stat.label} className="min-w-0 flex-1 basis-[120px] bg-white p-3.5">
                <p className="text-13 text-ink-muted">{stat.label}</p>
                <p className="mt-1 text-[15.5px] font-bold text-ink-pill">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="-mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
          {salesActions.map((action, index) => (
            <div key={action.label} className="flex items-center gap-x-3">
              {index > 0 && <span aria-hidden="true" className="h-[5px] w-[5px] flex-shrink-0 rounded-full bg-distance" />}
              <button
                type="button"
                onClick={action.onClick}
                className="inline-flex h-11 flex-shrink-0 items-center gap-1.5 whitespace-nowrap text-[14.5px] font-medium text-brand transition-colors hover:text-brand-ink"
              >
                <IconComponent iconName={action.iconName} size={19} color="currentColor" />
                {action.label}
              </button>
            </div>
          ))}
        </div>

        <Divider />

        <div className="-mt-1 flex flex-col gap-2">
          <label htmlFor="sales-buyer-search" className="text-13 text-ink-muted">
            Find buyers
          </label>
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-1 top-1 flex h-11 w-11 items-center justify-center text-ink-muted"
            >
              <IconComponent iconName="UserIcon" size={20} color="currentColor" />
            </span>
            <input
              id="sales-buyer-search"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by user name or email"
              className="h-14 w-full rounded-xl border border-line bg-white pl-12 pr-[50px] text-15 text-ink-pill outline-none focus:border-brand focus:ring-[3px] focus:ring-surface-brand"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-1 top-1 flex h-11 w-11 items-center justify-center text-ink-pill"
            >
              <IconComponent iconName="Search01Icon" size={22} color="currentColor" />
            </span>
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          {visible.length === 1 ? '1 buyer' : `${visible.length} buyers`}
        </p>

        {isLoading ? (
          <div className="-mx-6 -mt-2 flex flex-col gap-px">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-[76px] animate-pulse bg-shell" />
            ))}
          </div>
        ) : visible.length > 0 ? (
          <>
            <div className="-mx-6 -mt-2 flex flex-col">
              {visible.map((buyer) => (
                <BuyerRow
                  key={buyer.key}
                  buyer={buyer}
                  currency={currency}
                  open={openKey === buyer.key}
                  onToggle={() => setOpenKey((current) => (current === buyer.key ? null : buyer.key))}
                  onMessage={() =>
                    toast({ description: `Write to ${buyer.name}. It arrives in their Tukai inbox.` })
                  }
                />
              ))}
            </div>

            {hasMore && (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="-mt-2 h-11 self-start px-1 text-[14.5px] font-semibold text-brand"
              >
                Show more buyers
              </button>
            )}
          </>
        ) : (
          <p className="-mt-2 rounded-xl bg-surface p-5 text-center text-15 leading-[1.55] text-ink">
            {query
              ? 'No buyer matches that search.'
              : 'No one has bought a ticket yet. Buyers show up here as tickets sell.'}
          </p>
        )}
      </div>

      <HostActionBar
        primary={messageAllBuyersAction(summary.buyers, toast)}
        secondary={{
          label: 'Scan ticket',
          iconName: 'QrCode01Icon',
          onClick: () =>
            toast({ description: "Point your camera at a guest's ticket code to check them in." }),
        }}
      />
    </>
  );
};
