/**
 * The API returns money as `{ amount: "20.00", currency: "KES" }` - buyer
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
 * currency - Kenya shillings", and the note under a discount amount.
 *
 * Tukai prices in shillings, and the API's only other currency is the dollar;
 * the app writes either as `KES`, `Ksh.`, `USD` or `$` depending on where the
 * value came from.
 */
export const currencyFullName = (currency: string): string =>
  /usd|\$/i.test(currency) ? 'US dollars' : 'Kenya shillings';

/**
 * Money as "KES 34,839.80" - en-US grouping, always two decimals. Takes the
 * API's `{ amount, currency }` object as well as a bare decimal string or
 * number. Blank and unparseable both read as zero.
 *
 * The currency is the one passed in, else the money object's own, else KES.
 */
export const formatCurrencyAmount = (value: MoneyLike, currency?: string): string => {
  const amount = moneyAmount(value) ?? 0;
  const code = currency ?? (typeof value === 'object' ? value?.currency : undefined) ?? 'KES';

  return `${code} ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
