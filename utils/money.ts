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
