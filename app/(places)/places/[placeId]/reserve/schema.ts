import { z } from 'zod';

/**
 * What a reservation request needs before it can be sent.
 *
 * The schema is the single source of truth for both the rules and the form's
 * shape — `ReservationFormValues` is derived from it rather than declared
 * alongside it. Issue paths match the keys the form reads, so `zodErrorsToMap`
 * produces `name`, `date` and `time` directly.
 */
export const reservationSchema = z.object({
  name: z.string().trim().min(1, 'Give your reservation a name'),
  // `null` until a day is picked, which reaches zod as an invalid type
  date: z.date({
    // Not the bare "Pick a date" the summary shows as its placeholder — an
    // error has to read as an error where the two sit on screen together
    required_error: 'Pick a day for your reservation',
    invalid_type_error: 'Pick a day for your reservation',
  }),
  time: z.string({
    required_error: 'Pick a time slot',
    invalid_type_error: 'Pick a time slot',
  }),
  partySize: z.number().int().min(1),
  message: z.string(),
  invitedEmails: z.array(z.string()),
});

export type ReservationFormValues = z.infer<typeof reservationSchema>;

/** The section each field is asked for in, so an error can be scrolled to. */
export const RESERVATION_FIELD_SECTIONS: Record<string, string> = {
  name: 'reserve-name',
  date: 'reserve-when',
  time: 'reserve-when',
};
