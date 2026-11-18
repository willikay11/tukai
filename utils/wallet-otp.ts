/**
 * What went wrong sending or checking an M-Pesa wallet code, from the API's
 * error `code` (DEV-448), in words for the host. `alreadyVerified` is not a
 * failure: the wallet needs no code, so the caller should carry on.
 */
export type WalletOtpOutcome =
  | { kind: 'alreadyVerified' }
  | { kind: 'cooldown'; message: string }
  | { kind: 'newCodeNeeded'; message: string }
  | { kind: 'error'; message: string };

const codeOf = (error: unknown): string | null => {
  const errors = (error as { errors?: { code?: unknown }[] } | null)?.errors;
  const code = Array.isArray(errors) ? errors[0]?.code : null;
  return typeof code === 'string' ? code : null;
};

export const walletOtpOutcome = (error: unknown): WalletOtpOutcome => {
  switch (codeOf(error)) {
    case 'already_verified':
    case 'not_required':
      return { kind: 'alreadyVerified' };
    case 'cooldown':
      return {
        kind: 'cooldown',
        message: 'A code was just sent. You can ask for another in a minute.',
      };
    case 'invalid_otp':
      return { kind: 'error', message: "That code isn't right. Check the text and try again." };
    case 'otp_expired':
      return { kind: 'newCodeNeeded', message: 'That code has expired. Send a new one.' };
    case 'max_attempts_exceeded':
      return { kind: 'newCodeNeeded', message: 'Too many wrong codes. Send a new one.' };
    case 'no_otp':
      return { kind: 'newCodeNeeded', message: 'Send a code first.' };
    case 'no_phone':
      return {
        kind: 'error',
        message: 'This wallet has no M-Pesa number. Add one and save it first.',
      };
    default: {
      const message = (error as { message?: unknown } | null)?.message;
      return {
        kind: 'error',
        message:
          typeof message === 'string' && message ? message : 'Something went wrong. Try again.',
      };
    }
  }
};
