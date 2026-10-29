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
    // Not on the API yet - kept local-only, see the reservation_settings_backend_gaps memory
    partySize: z
      .string()
      .refine((value) => value === '' || Number(value) > 0, 'Enter a number greater than zero'),
    days: z.array(z.string()).min(1, 'Pick at least one day'),
    opensAt: z.string().min(1, 'Set an opening time'),
    closesAt: z.string().min(1, 'Set a closing time'),
    bufferMinutes: z
      .string()
      .refine((value) => value === '' || Number(value) >= 0, 'Enter a number of minutes'),
    // Not on the API yet - kept local-only, see the reservation_settings_backend_gaps memory
    expiryHours: z.enum(['1', '2', '6', '24']),
  })
  .refine(
    (values) =>
      !values.opensAt || !values.closesAt || values.opensAt !== values.closesAt,
    {
      // Closing earlier than opening is a valid overnight window (e.g. 6pm-2am) -
      // only the same time for both is ambiguous
      message: 'Opening and closing times cannot be the same',
      path: ['closesAt'],
    },
  )
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
