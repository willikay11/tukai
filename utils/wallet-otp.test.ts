import { walletOtpOutcome } from './wallet-otp';

const apiError = (code: string, message = 'API words') => ({
  status: 400,
  message,
  errors: [{ code, detail: message, attr: null }],
});

describe('walletOtpOutcome', () => {
  // Nothing to do: the caller carries on as if the code went through
  it('treats an already verified wallet, and a bank wallet, as done', () => {
    expect(walletOtpOutcome(apiError('already_verified'))).toEqual({ kind: 'alreadyVerified' });
    expect(walletOtpOutcome(apiError('not_required'))).toEqual({ kind: 'alreadyVerified' });
  });

  it('asks the host to wait after a recent code', () => {
    expect(walletOtpOutcome({ ...apiError('cooldown'), status: 429 })).toMatchObject({
      kind: 'cooldown',
    });
  });

  it('lets the host retry a wrong code', () => {
    expect(walletOtpOutcome(apiError('invalid_otp'))).toEqual({
      kind: 'error',
      message: "That code isn't right. Check the text and try again.",
    });
  });

  it.each(['otp_expired', 'max_attempts_exceeded', 'no_otp'])(
    'asks for a new code after %s',
    (code) => {
      expect(walletOtpOutcome(apiError(code)).kind).toBe('newCodeNeeded');
    },
  );

  it('falls back to the API message for anything else', () => {
    expect(walletOtpOutcome(apiError('throttled', 'Slow down.'))).toEqual({
      kind: 'error',
      message: 'Slow down.',
    });
    expect(walletOtpOutcome(null)).toEqual({
      kind: 'error',
      message: 'Something went wrong. Try again.',
    });
  });
});
