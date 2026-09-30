'use client';

import moment from 'moment';

import { useEarningsSummary, usePayouts } from '@/app/(experiences)/hooks/usePayment';
import { IconComponent } from '@/app/shared/components/Icons';
import { NoData } from '@/components/ui/noData';
import { cn } from '@/lib/utils';
import {
  HostEarningsSummary,
  HostPayout,
  PAYOUT_KIND_LABEL,
  PAYOUT_STATUS_LABEL,
  payoutAmount,
  payoutDestinationLabel,
} from '@/types/payment';

/** Settled is done, failed and reversed are not, the rest are in flight. */
const STATUS_TONE: Record<string, string> = {
  settled: 'bg-surface-brand text-brand-deep',
  failed: 'bg-danger-surface text-danger',
  reversed: 'bg-danger-surface text-danger',
};

const money = (currency: string, value?: string | null) =>
  `${currency} ${payoutAmount(value).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;

const Figure = ({
  label,
  value,
  hint,
  strong,
}: {
  label: string;
  value: string;
  hint?: string;
  strong?: boolean;
}) => (
  <div className="flex min-w-0 flex-col gap-1 bg-surface px-4 py-3">
    <span className="text-13 leading-snug text-ink-muted">{label}</span>
    <span
      className={cn(
        'break-words leading-snug text-gray-900',
        strong ? 'text-xl font-bold' : 'text-base font-semibold',
      )}
    >
      {value}
    </span>
    {hint && <span className="text-13 text-ink-subtle">{hint}</span>}
  </div>
);

const PayoutRow = ({ payout }: { payout: HostPayout }) => (
  <div className="flex items-center gap-3 border-b border-gray-100 py-3 last:border-b-0">
    <span
      aria-hidden="true"
      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-surface text-brand"
    >
      <IconComponent
        iconName={payout.destinationType === 'bank' ? 'BankIcon' : 'SmartPhone01Icon'}
        size={18}
        color="currentColor"
      />
    </span>

    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-gray-900">
        {money(payout.currency, payout.netAmount)}
      </p>
      <p className="truncate text-13 text-ink-muted">
        {PAYOUT_KIND_LABEL[payout.kind] ?? 'Payout'} ·{' '}
        {payoutDestinationLabel(payout.destinationType)}
        {payout.dateRequested && ` · ${moment(payout.dateRequested).format('D MMM YYYY')}`}
      </p>
    </div>

    <div className="flex flex-shrink-0 flex-col items-end gap-1">
      <span
        className={cn(
          'rounded-full px-2.5 py-0.5 text-13 font-semibold',
          STATUS_TONE[payout.status] ?? 'bg-surface text-ink-muted',
        )}
      >
        {PAYOUT_STATUS_LABEL[payout.status] ?? payout.status}
      </span>
      {/* Fees on a payout in flight are an estimate until it settles */}
      <span className="text-13 text-ink-subtle">
        {payout.feeEstimated ? 'Est. fees ' : 'Fees '}
        {money(
          payout.currency,
          String(payoutAmount(payout.paystackFee) + payoutAmount(payout.tukaiFee)),
        )}
      </span>
    </div>
  </div>
);

/**
 * What a host has earned, and every payout they have been sent.
 *
 * Six figures and a payout history existed on the API and nothing in the app
 * read any of them, so a host could see tickets sold and never see the money.
 * The three balances are kept apart deliberately: only `available` can be
 * withdrawn now.
 */
export const EarningsSection = ({ currency = 'Ksh.' }: { currency?: string }) => {
  const { data: summaryResponse, isLoading: isSummaryLoading } = useEarningsSummary();
  const { data: payoutsResponse, isLoading: arePayoutsLoading } = usePayouts();

  const summary: HostEarningsSummary | null = summaryResponse?.data ?? null;
  const payoutsPayload = payoutsResponse?.data;
  const payouts: HostPayout[] = Array.isArray(payoutsPayload)
    ? payoutsPayload
    : (payoutsPayload?.results ?? []);

  if (isSummaryLoading) {
    return <div className="h-48 animate-pulse rounded-2xl bg-gray-100" />;
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Earnings</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          What your experiences have taken, and what has been paid out to you.
        </p>
      </div>

      {summary ? (
        <div className="grid grid-cols-2 gap-0.5 overflow-hidden rounded-14 lg:grid-cols-3">
          <Figure
            label="Available to withdraw"
            value={money(currency, summary.availableBalance)}
            strong
          />
          <Figure
            label="Pending"
            value={money(currency, summary.pendingBalance)}
            hint="Not settled yet"
          />
          <Figure label="Total balance" value={money(currency, summary.currentBalance)} />
          <Figure label="Ticket sales" value={money(currency, summary.totalTicketSales)} />
          <Figure label="Commission" value={money(currency, summary.commissionDeducted)} />
          <Figure
            label="Estimated payout fee"
            value={money(currency, summary.estimatedPayoutFee)}
          />
        </div>
      ) : (
        <p className="text-sm text-ink-subtle">Your earnings could not be loaded.</p>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="text-base font-bold text-gray-900">Payouts</h3>

        {arePayoutsLoading ? (
          <div className="mt-4 h-20 animate-pulse rounded-xl bg-gray-50" />
        ) : payouts.length === 0 ? (
          <div className="py-8">
            <NoData message="No payouts yet" />
          </div>
        ) : (
          <div className="mt-2">
            {payouts.map((payout) => (
              <PayoutRow key={payout.id} payout={payout} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
