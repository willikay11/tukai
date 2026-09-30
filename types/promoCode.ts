/**
 * A host's discount code.
 *
 * The API carries far more than this — referral kinds, funders, partner
 * labels, redemption caps, minimum order values, date windows. The canvas
 * exposes three fields: the code, whether it takes a percentage or a flat
 * amount, and how much. This type covers what the API returns; the create
 * form fills only what the canvas asks for and leaves the rest to defaults.
 */
export type PromoCodeKind = 'promotion' | 'referral' | 'partner';
export type PromoDiscountType = 'percentage' | 'fixed';

export type PromoCode = {
  id: string;
  code: string;
  kind: PromoCodeKind;
  description?: string | null;
  experience?: string | null;
  discountType: PromoDiscountType;
  /** Decimals arrive as strings. */
  discountPercentage?: string | null;
  discountAmount?: string | null;
  isActive: boolean;
  redeemedCount: number;
  /**
   * The limits the API keeps on a code. The canvas's form sets none of them, so
   * they are only ever read — but a code made from the mobile app or by an
   * admin can carry them, and a host looking at redemptions needs to see them.
   */
  maxRedemptions?: number | null;
  maxRedemptionsPerUser?: number | null;
  minTickets?: number | null;
  minOrderAmount?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  dateCreated?: string;
};

export type CreatePromoCode = {
  code: string;
  experience: string;
  discountType: PromoDiscountType;
  /** Whichever the type calls for; the other is left unset. */
  discountPercentage?: number;
  discountAmount?: number;
};

/**
 * Editing one. `isActive` is how the canvas's pause and resume are expressed —
 * the API has no pause of its own, it has a flag.
 */
export type UpdatePromoCode = Partial<Omit<CreatePromoCode, 'experience'>> & {
  isActive?: boolean;
};

/** What the canvas shows beside a code: "20% off" or "KES 500 off". */
export const promoCodeValueLabel = (code: PromoCode, currency = 'KES'): string => {
  if (code.discountType === 'percentage') {
    const percent = Number(code.discountPercentage ?? 0);
    return `${Number.isInteger(percent) ? percent : percent.toFixed(1)}% off`;
  }

  const amount = Number(code.discountAmount ?? 0);
  return `${currency} ${amount.toLocaleString('en-US')} off`;
};

/**
 * The canvas's rules, kept in one place because the form and the tests both
 * need them: uppercase letters and digits only, three to ten characters.
 */
export const PROMO_CODE_MAX = 10;
export const PROMO_CODE_MIN = 3;

export const normalisePromoCode = (value: string): string =>
  value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, PROMO_CODE_MAX);

/**
 * How many uses are left, or null when the code has no cap.
 *
 * A cap already passed reads as none left rather than as a negative.
 */
export const redemptionsRemaining = (code: PromoCode): number | null =>
  typeof code.maxRedemptions === 'number' && code.maxRedemptions > 0
    ? Math.max(code.maxRedemptions - (code.redeemedCount ?? 0), 0)
    : null;
