import { HostIncomeEntry } from '@/types/payment';
import { formatCurrencyAmount, moneyAmount } from '@/utils/money';

import type { TransactionRow } from './useMyTransactions';

/** "KES 1,152.00" for the entry's net, always positive: the arrow says which way. */
const netText = (entry: HostIncomeEntry) => {
  const amount = Math.abs(moneyAmount(entry.amount) ?? 0);
  return formatCurrencyAmount(amount, entry.amount?.currency || entry.currency);
};

/**
 * A host's income ledger (DEV-372) as Recent transactions rows:
 *
 * - a ticket sale is money in, at what the host earned from it (after
 *   Tukai's fee and any promo discount they funded);
 * - a refund or cancellation (`sale_reversal`) takes that back, so it's
 *   money out;
 * - a correction goes whichever way its amount does.
 *
 * The detail line names the ticket, and the promo code when one was used.
 */
export const incomeRows = (entries: HostIncomeEntry[]): TransactionRow[] =>
  entries.map((entry) => {
    const net = moneyAmount(entry.amount) ?? 0;
    const isReversal = entry.kind === 'sale_reversal';
    const label = isReversal
      ? 'Refund'
      : entry.kind === 'correction'
        ? 'Correction'
        : 'Ticket sale';
    const details = [label, entry.productName, entry.promoCode ? `code ${entry.promoCode}` : null];

    return {
      key: `income-${entry.id}`,
      date: entry.datePosted,
      title: entry.experience?.title ?? 'Ticket sale',
      via: details.filter(Boolean).join(' · '),
      amount: netText(entry),
      direction: isReversal || net < 0 ? 'out' : 'in',
    };
  });
