'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useSendWalletOtp, useVerifyWalletOtp } from '@/app/(experiences)/hooks/usePayment';
import { walletOtpOutcome } from '@/utils/wallet-otp';

/** The API allows a new code once a minute. */
export const RESEND_SECONDS = 60;
const CODE_LENGTH = 6;

/**
 * Sending and checking an M-Pesa wallet's verification code (DEV-448).
 *
 * `send` texts a code and starts the resend countdown. Typing the 6th digit
 * checks it, as the sign-in code does. `onVerified` runs once the wallet is
 * verified - including when the API says it already was.
 */
export const useWalletVerification = (walletId: string, onVerified: () => void) => {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCodeValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const { mutateAsync: sendOtp, isPending: isSending } = useSendWalletOtp();
  const { mutateAsync: verifyOtp, isPending: isVerifying } = useVerifyWalletOtp();

  const startCountdown = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    const sentAt = Date.now();
    setResendSecondsLeft(RESEND_SECONDS);
    timer.current = setInterval(() => {
      const left = Math.max(0, RESEND_SECONDS - Math.floor((Date.now() - sentAt) / 1000));
      setResendSecondsLeft(left);
      if (left === 0 && timer.current) clearInterval(timer.current);
    }, 1000);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );

  const send = useCallback(async () => {
    setError(null);
    setCodeValue('');
    try {
      const { sentTo: maskedNumber } = await sendOtp(walletId);
      setSentTo(maskedNumber || 'your M-Pesa number');
      startCountdown();
    } catch (failure) {
      const outcome = walletOtpOutcome(failure);
      if (outcome.kind === 'alreadyVerified') {
        onVerified();
        return;
      }
      // A code went out less than a minute ago: it's still good to type in
      if (outcome.kind === 'cooldown') {
        setSentTo((current) => current ?? 'your M-Pesa number');
        startCountdown();
      }
      setError(outcome.message);
    }
  }, [walletId, sendOtp, startCountdown, onVerified]);

  const verify = useCallback(
    async (otp: string) => {
      setError(null);
      try {
        await verifyOtp({ walletId, otp });
        onVerified();
      } catch (failure) {
        const outcome = walletOtpOutcome(failure);
        if (outcome.kind === 'alreadyVerified') {
          onVerified();
          return;
        }
        setError(outcome.message);
        // A wrong code is cleared for another try; an expired one waits for a new code
        setCodeValue('');
      }
    },
    [walletId, verifyOtp, onVerified],
  );

  const setCode = useCallback(
    (value: string) => {
      const digits = value.replace(/\D/g, '').slice(0, CODE_LENGTH);
      setCodeValue(digits);
      if (error) setError(null);
      if (digits.length === CODE_LENGTH && !isVerifying) void verify(digits);
    },
    [error, isVerifying, verify],
  );

  return {
    sentTo,
    code,
    setCode,
    error,
    isSending,
    isVerifying,
    resendSecondsLeft,
    send,
    verify: () => verify(code),
    codeLength: CODE_LENGTH,
  };
};
