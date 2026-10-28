'use client';

import { useMemo } from 'react';

import moment from 'moment';

import { useEarningsSummary, usePayouts } from '@/app/(experiences)/hooks/usePayment';
import { useExperiences, useTicketPurchases } from '@/app/shared/hooks/useExperiences';
import { Experience } from '@/types/experience';
import { HostPayout, PAYOUT_KIND_LABEL, payoutAmount, payoutDestinationLabel } from '@/types/payment';
import { TicketPurchase } from '@/types/ticket-purchase';

export type TransactionDirection = 'in' | 'out';

export interface TransactionRow {
  key: string;
  date: string;
  title: string;
  image?: string;
  via: string;
  amount: string;
  direction: TransactionDirection;
}

const money = (amount: number, currency: string) =>
  `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * What a reader's money has done, read off the two ledgers the API actually
 * has: tickets they bought (always money out - there is no sales-income
 * ledger to show the matching "money in" side of a host's own sales) and
 * payouts sent to them (also out). One row per purchased ticket, not per
 * checkout - the purchase endpoint carries no grouped total of its own.
 */
export const useMyTransactions = (userId?: string | null) => {
  const enabled = Boolean(userId);

  const { data: purchasesResponse, isLoading: isLoadingPurchases } = useTicketPurchases(
    userId ?? undefined,
    enabled,
  );
  const { data: reservedResponse, isLoading: isLoadingReserved } = useExperiences(
    { page: 1, page_size: 100, reserved_by: userId ?? undefined },
    enabled,
  );
  const { data: payoutsResponse, isLoading: isLoadingPayouts } = usePayouts(enabled);
  const { data: summaryResponse, isLoading: isLoadingSummary } = useEarningsSummary(enabled);

  const purchases: TicketPurchase[] = useMemo(
    () => purchasesResponse?.data?.results ?? [],
    [purchasesResponse],
  );
  const reservedExperiences: Experience[] = useMemo(
    () => reservedResponse?.data?.results ?? [],
    [reservedResponse],
  );
  const payouts: HostPayout[] = useMemo(() => {
    const payload = payoutsResponse?.data;
    return Array.isArray(payload) ? payload : payload?.results ?? [];
  }, [payoutsResponse]);

  const transactions: TransactionRow[] = useMemo(() => {
    const experienceById = new Map(reservedExperiences.map((experience) => [experience.id, experience]));

    const ticketRows: TransactionRow[] = purchases.map((purchase) => {
      const experience = experienceById.get(purchase.ticket.experience);

      return {
        key: purchase.id,
        date: purchase.dateCreated,
        title: experience?.title ?? purchase.ticket.name,
        image: experience?.photos?.[0]?.photo,
        via: `Ticket · ${purchase.ticket.name}`,
        amount: money(parseFloat(purchase.ticket.price) || 0, purchase.ticket.currency),
        direction: 'out',
      };
    });

    const payoutRows: TransactionRow[] = payouts.map((payout) => ({
      key: payout.id,
      date: payout.dateRequested ?? '',
      title: PAYOUT_KIND_LABEL[payout.kind] ?? 'Payout',
      via: payoutDestinationLabel(payout.destinationType),
      amount: money(payoutAmount(payout.netAmount), payout.currency),
      direction: 'out',
    }));

    return [...ticketRows, ...payoutRows].sort(
      (a, b) => moment(b.date).valueOf() - moment(a.date).valueOf(),
    );
  }, [purchases, reservedExperiences, payouts]);

  const availableBalance = summaryResponse?.data?.availableBalance ?? '0';

  return {
    isLoading: isLoadingPurchases || isLoadingReserved || isLoadingPayouts || isLoadingSummary,
    transactions,
    balances: {
      currency: payouts[0]?.currency ?? 'KES',
      // Kept as the raw decimal string too - WithdrawDrawer takes it as such
      availableBalance,
      available: payoutAmount(availableBalance),
      pending: payoutAmount(summaryResponse?.data?.pendingBalance),
      // No lifetime "paid out" figure exists on the summary - only the three
      // live balances - so this totals every settled payout instead.
      paidOut: payouts
        .filter((payout) => payout.status === 'settled')
        .reduce((total, payout) => total + payoutAmount(payout.netAmount), 0),
    },
  };
};

export { money };
