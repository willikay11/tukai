'use client';

import { useMemo } from 'react';

import moment from 'moment';

import {
  useEarningsSummary,
  useHostIncome,
  usePayouts,
} from '@/app/(experiences)/hooks/usePayment';
import { useExperiences, useTicketPurchases } from '@/app/shared/hooks/useExperiences';
import { Experience } from '@/types/experience';
import {
  HostEarningsSummary,
  HostIncomeEntry,
  HostPayout,
  PAYOUT_KIND_LABEL,
  payoutAmount,
  payoutDestinationLabel,
} from '@/types/payment';
import { TicketPurchase } from '@/types/ticket-purchase';
import { getTicketBasePrice } from '@/utils/ticket-utils';

import { incomeRows } from './income-rows';

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
 * What a reader's money has done, newest first, from three ledgers:
 *
 * - tickets they bought: money out, one row per ticket;
 * - payouts sent to them: money out;
 * - their income as a host (DEV-372): each ticket sale is money in, and a
 *   refund or cancellation takes it back out. Empty for someone who
 *   hosts nothing.
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
  const { data: incomeResponse, isLoading: isLoadingIncome } = useHostIncome(enabled);
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
    return Array.isArray(payload) ? payload : (payload?.results ?? []);
  }, [payoutsResponse]);
  const income: HostIncomeEntry[] = useMemo(() => {
    const payload = incomeResponse?.data;
    return Array.isArray(payload) ? payload : (payload?.results ?? []);
  }, [incomeResponse]);

  const transactions: TransactionRow[] = useMemo(() => {
    const experienceById = new Map(
      reservedExperiences.map((experience) => [experience.id, experience]),
    );

    const ticketRows: TransactionRow[] = purchases.map((purchase) => {
      const experience = experienceById.get(purchase.ticket.experience);

      return {
        key: purchase.id,
        date: purchase.dateCreated,
        title: experience?.title ?? purchase.ticket.name,
        image: experience?.photos?.[0]?.photo,
        via: `Ticket · ${purchase.ticket.name}`,
        amount: money(
          getTicketBasePrice(purchase.ticket).amount,
          getTicketBasePrice(purchase.ticket).currency ?? 'KES',
        ),
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

    return [...ticketRows, ...payoutRows, ...incomeRows(income)].sort(
      (a, b) => moment(b.date).valueOf() - moment(a.date).valueOf(),
    );
  }, [purchases, reservedExperiences, payouts, income]);

  const summary: HostEarningsSummary | null = summaryResponse?.data ?? null;
  const availableBalance = summary?.availableBalance?.amount ?? '0';

  return {
    isLoading:
      isLoadingPurchases ||
      isLoadingReserved ||
      isLoadingPayouts ||
      isLoadingIncome ||
      isLoadingSummary,
    transactions,
    balances: {
      currency: summary?.availableBalance?.currency ?? payouts[0]?.currency ?? 'KES',
      // Kept as the raw decimal string too - WithdrawDrawer takes it as such
      availableBalance,
      available: payoutAmount(availableBalance),
      pending: payoutAmount(summary?.pendingBalance?.amount),
      // No lifetime "paid out" figure exists on the summary - only the three
      // live balances - so this totals every settled payout instead.
      paidOut: payouts
        .filter((payout) => payout.status === 'settled')
        .reduce((total, payout) => total + payoutAmount(payout.netAmount), 0),
    },
  };
};

export { money };
