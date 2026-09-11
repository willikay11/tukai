import { z } from 'zod';

/**
 * Validation for the reservation settings form.
 *
 * As elsewhere the schema is the single source of truth for both the rules and
 * the form's shape, and issue paths match the keys the form reads.
 */
export { zodErrorsToMap } from '@/utils/zod-errors';

export const reservationSettingsSchema = z
  .object({
    reservationType: z.enum(['restaurant_reservation', 'cinema_reservation']),
    // Empty is allowed: a place may take reservations without publishing a cap
    seatingCapacity: z
      .string()
      .refine((value) => value === '' || Number(value) > 0, 'Enter a number greater than zero'),
    maxPartySize: z
      .string()
      .refine((value) => value === '' || Number(value) > 0, 'Enter a number greater than zero'),
    days: z.array(z.string()).min(1, 'Pick at least one day'),
    opensAt: z.string().min(1, 'Set an opening time'),
    closesAt: z.string().min(1, 'Set a closing time'),
    bufferMinutes: z
      .string()
      .refine((value) => value === '' || Number(value) >= 0, 'Enter a number of minutes'),
  })
  .refine((values) => !values.closesAt || values.closesAt > values.opensAt, {
    message: 'Closing time has to be after opening time',
    path: ['closesAt'],
  });

export type ReservationSettingsValues = z.infer<typeof reservationSettingsSchema>;
