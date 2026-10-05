import { z } from 'zod';

import { PROMO_CODE_MAX, PROMO_CODE_MIN, PromoDiscountType } from '@/types/promoCode';
import { currencyFullName } from '@/utils/money';

/**
 * Generating or editing a discount code.
 *
 * The canvas asks for three fields and states its own rules: a code of at most
 * ten uppercase letters and digits, a type, and a value. `existingCodes` is
 * every code this host already has on the experience, so a clash can be named
 * rather than left to the API's 400.
 *
 * `editingCode` is the code being edited, which must not count as a clash with
 * itself.
 */
export const discountCodeSchema = (existingCodes: string[], editingCode?: string) =>
  z
    .object({
      code: z
        .string()
        .min(PROMO_CODE_MIN, `Use at least ${PROMO_CODE_MIN} characters`)
        .max(PROMO_CODE_MAX, `Use no more than ${PROMO_CODE_MAX} characters`),
      discountType: z.enum(['fixed', 'percentage']),
      // Held as typed so a half-entered "12." is not rewritten under the cursor
      value: z.string().min(1, 'Enter a value'),
    })
    .superRefine((values, ctx) => {
      const clash = existingCodes.some(
        (existing) => existing === values.code && existing !== editingCode,
      );

      if (clash) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['code'],
          message: `You already have a code called ${values.code}.`,
        });
      }

      const amount = Number(values.value);

      if (!Number.isFinite(amount) || amount <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['value'],
          message: 'Enter a value greater than zero',
        });
        return;
      }

      if (values.discountType === 'percentage' && amount > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['value'],
          message: 'A percentage discount can’t be more than 100%.',
        });
      }
    });

export type DiscountCodeValues = {
  code: string;
  discountType: PromoDiscountType;
  value: string;
};

/** The canvas's own copy, and it changes with the type. */
export const valueCopy = (discountType: PromoDiscountType, currencyName: string) =>
  discountType === 'percentage'
    ? {
        label: 'Enter percentage to discount',
        placeholder: 'Enter percentage',
        icon: 'PercentIcon',
        note: 'Taken off the ticket price.',
      }
    : {
        label: 'Enter amount to discount',
        placeholder: 'Enter amount',
        icon: 'MoneyRemove01Icon',
        note: `In ${currencyName}, taken off each ticket.`,
      };

/** The canvas names the currency in full in that note. */
export const currencyName = currencyFullName;
