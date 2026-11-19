import { z } from 'zod';

/**
 * Validation for the reservation settings form.
 *
 * As elsewhere the schema is the single source of truth for both the rules and
 * the form's shape, and issue paths match the keys the form reads.
 */
export { zodErrorsToMap } from '@/utils/zod-errors';

const positiveOrEmpty = z
  .string()
  .refine((value) => value === '' || Number(value) > 0, 'Enter a number greater than zero');

export const RESPOND_WITHIN_OPTIONS = ['1', '2', '6', '24'] as const;
export const PAY_WITHIN_OPTIONS = ['1', '3', '12', '24'] as const;

export const reservationSettingsSchema = z
  .object({
    reservationType: z.enum(['restaurant_reservation', 'cinema_reservation']),
    paymentType: z.enum(['free', 'deposit', 'entry_fee']),
    // Per guest, deposit only
    depositAmount: z.string(),
    // Entry fees only: the categories already added
    entryFees: z.array(z.object({ guestType: z.string(), amount: z.string() })),
    // Empty is allowed: a place may take reservations without publishing a cap
    seatingCapacity: positiveOrEmpty,
    partySize: positiveOrEmpty,
    days: z.array(z.string()).min(1, 'Pick at least one day'),
    opensAt: z.string().min(1, 'Set an opening time'),
    closesAt: z.string().min(1, 'Set a closing time'),
    bufferMinutes: z
      .string()
      .refine((value) => value === '' || Number(value) >= 0, 'Enter a number of minutes'),
    // A saved value outside the pills (set elsewhere) is kept as it is
    respondWithinHours: z.string(),
    payWithinHours: z.string(),
  })
  .refine((values) => values.paymentType !== 'deposit' || Number(values.depositAmount) > 0, {
    message: 'Enter a deposit per guest',
    path: ['depositAmount'],
  })
  .refine((values) => values.paymentType !== 'entry_fee' || values.entryFees.length > 0, {
    message: 'Add at least one guest category with a price',
    path: ['entryFees'],
  })
  .refine((values) => !values.opensAt || !values.closesAt || values.opensAt !== values.closesAt, {
    // Closing earlier than opening is a valid overnight window (e.g. 6pm-2am) -
    // only the same time for both is ambiguous
    message: 'Opening and closing times cannot be the same',
    path: ['closesAt'],
  })
  .refine(
    (values) =>
      !values.seatingCapacity ||
      !values.partySize ||
      Number(values.partySize) <= Number(values.seatingCapacity),
    {
      message: 'Party size cannot be bigger than your seating capacity',
      path: ['partySize'],
    },
  );

export type ReservationSettingsValues = z.infer<typeof reservationSettingsSchema>;

export const isPaidReservation = (paymentType: ReservationSettingsValues['paymentType']) =>
  paymentType !== 'free';
