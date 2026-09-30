/**
 * The API returns money as `{ amount: "20.00", currency: "KES" }` — buyer
 * prices, promo discounts, order totals. This reads the number out of one,
 * and also accepts the bare string or number the same field is sometimes sent
 * as, so a caller does not have to know which it got.
 */
export type MoneyLike =
  // `currency` rides along on every money object the API sends
  { amount?: string | number | null; currency?: string } | string | number | null | undefined;

export const moneyAmount = (value: MoneyLike): number | null => {
  if (value === null || value === undefined || value === '') return null;

  if (typeof value === 'object') return moneyAmount(value.amount);

  const parsed = typeof value === 'string' ? parseFloat(value) : value;
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * The currency written out in words, the way the canvas says it: "Ticket
 * currency — Kenya shillings", and the note under a discount amount.
 *
 * Tukai prices in shillings, and the API's only other currency is the dollar;
 * the app writes either as `KES`, `Ksh.`, `USD` or `$` depending on where the
 * value came from.
 */
export const currencyFullName = (currency: string): string =>
  /usd|\$/i.test(currency) ? 'US dollars' : 'Kenya shillings';
