import { z } from 'zod';

/**
 * Flattens a ZodError into the `Record<string, string>` forms render.
 *
 * Issue paths become the keys, so a schema's paths are chosen to match what the
 * form components already read (e.g. `slots.0.endTime`, `tickets.1.amount`).
 */
export const zodErrorsToMap = (error: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};

  error.issues.forEach((issue) => {
    const key = issue.path.join('.');
    // First message per field wins, so a required check is not masked by a
    // follow-on rule about the same field
    if (key && errors[key] === undefined) {
      errors[key] = issue.message;
    }
  });

  return errors;
};
