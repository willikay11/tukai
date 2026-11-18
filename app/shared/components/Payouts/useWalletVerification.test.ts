import { act, renderHook } from '@testing-library/react';

import { RESEND_SECONDS, useWalletVerification } from './useWalletVerification';

const sendOtp = jest.fn();
const verifyOtp = jest.fn();

jest.mock('@/app/(experiences)/hooks/usePayment', () => ({
  useSendWalletOtp: () => ({ mutateAsync: sendOtp, isPending: false }),
  useVerifyWalletOtp: () => ({ mutateAsync: verifyOtp, isPending: false }),
}));

const apiError = (code: string, status = 400) => ({
  status,
  message: code,
  errors: [{ code, detail: code, attr: null }],
});

describe('useWalletVerification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });
  afterEach(() => jest.useRealTimers());

  it('sends a code, then counts down to a resend', async () => {
    sendOtp.mockResolvedValue({ sentTo: '+254***678' });
    const { result } = renderHook(() => useWalletVerification('w1', jest.fn()));

    await act(async () => {
      await result.current.send();
    });

    expect(result.current.sentTo).toBe('+254***678');
    expect(result.current.resendSecondsLeft).toBe(RESEND_SECONDS);

    act(() => {
      jest.advanceTimersByTime(RESEND_SECONDS * 1000);
    });
    expect(result.current.resendSecondsLeft).toBe(0);
  });

  it('checks the code as soon as the 6th digit is typed', async () => {
    verifyOtp.mockResolvedValue({ id: 'w1', isVerified: true });
    const onVerified = jest.fn();
    const { result } = renderHook(() => useWalletVerification('w1', onVerified));

    await act(async () => {
      result.current.setCode('12345');
    });
    expect(verifyOtp).not.toHaveBeenCalled();

    await act(async () => {
      result.current.setCode('123456');
    });
    expect(verifyOtp).toHaveBeenCalledWith({ walletId: 'w1', otp: '123456' });
    expect(onVerified).toHaveBeenCalled();
  });

  // A code went out under a minute ago: it's still good, so let them type it
  it('opens the code field after a cooldown refusal, with the wait explained', async () => {
    sendOtp.mockRejectedValue(apiError('cooldown', 429));
    const { result } = renderHook(() => useWalletVerification('w1', jest.fn()));

    await act(async () => {
      await result.current.send();
    });

    expect(result.current.sentTo).not.toBeNull();
    expect(result.current.resendSecondsLeft).toBe(RESEND_SECONDS);
    expect(result.current.error).toMatch(/in a minute/);
  });

  it('carries on when the wallet turns out to be verified already', async () => {
    sendOtp.mockRejectedValue(apiError('already_verified'));
    const onVerified = jest.fn();
    const { result } = renderHook(() => useWalletVerification('w1', onVerified));

    await act(async () => {
      await result.current.send();
    });

    expect(onVerified).toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });

  it('asks for a new code once the old one has expired', async () => {
    verifyOtp.mockRejectedValue(apiError('otp_expired'));
    const { result } = renderHook(() => useWalletVerification('w1', jest.fn()));

    await act(async () => {
      result.current.setCode('123456');
    });

    expect(result.current.error).toBe('That code has expired. Send a new one.');
    expect(result.current.code).toBe('');
  });
});
