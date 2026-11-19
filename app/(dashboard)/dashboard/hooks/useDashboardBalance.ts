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
 *
 * "Tickets on sale" is `ticketsOnSale` (DEV-369): the server's value of the
 * tickets the host can still sell - tickets left times buyer price, counting
 * only tickets a buyer could buy now. Not part of the total either. It used
 * to be estimated in the browser from the starting price.
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
      { label: 'Tickets on sale', value: formatCurrencyAmount(summary?.ticketsOnSale) },
    ],
    // Raw figures, for the Withdraw drawer, which takes a decimal string
    availableBalance: summary?.availableBalance?.amount ?? '0',
    pendingBalance: payoutAmount(summary?.pendingBalance),
  };
};
