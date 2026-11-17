import { useEarningsSummary } from '@/app/(experiences)/hooks/usePayment';
import { HostEarningsSummary, payoutAmount } from '@/types/payment';
import { formatCurrencyAmount } from '@/utils/money';

/**
 * The Dashboard card's balance rows, all from the earnings summary
 * (`useEarningsSummary`).
 *
 * "Ticket sales" is `totalTicketSales`: confirmed sales at list price, before
 * promo discounts - the same "Ticket sales" line as the host's sales email.
 * It is not money received and is not part of the total, which is the
 * current balance.
 */
export const useDashboardBalance = () => {
  const { data: earningsResponse, isLoading } = useEarningsSummary();
  const summary: HostEarningsSummary | null = earningsResponse?.data ?? null;

  return {
    isLoading,
    // Balances are { amount, currency } objects, so each carries its own currency
    totalLabel: formatCurrencyAmount(summary?.currentBalance),
    balances: [
      { label: 'Available', value: formatCurrencyAmount(summary?.availableBalance) },
      { label: 'Pending', value: formatCurrencyAmount(summary?.pendingBalance) },
      { label: 'Ticket sales', value: formatCurrencyAmount(summary?.totalTicketSales) },
    ],
    // Raw figures, for the Withdraw drawer, which takes a decimal string
    availableBalance: summary?.availableBalance?.amount ?? '0',
    pendingBalance: payoutAmount(summary?.pendingBalance),
  };
};
